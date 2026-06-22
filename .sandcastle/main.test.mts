import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
  ensureDockerImageBuilt,
  extractParentIssue,
  filterByParent,
  parseCliOptions,
  parsePlan,
  PLANNER_AGENT,
  runCycle,
  runCycles,
  WORKER_AGENT,
} from './main.mts';

/**
 * Builds a fake `run` that dispatches on the run's `name`, recording every call
 * and returning caller-supplied results. Lets us drive the cycle's full sequence
 * without Docker.
 */
function makeFakeRun(results: Record<string, unknown>) {
  const calls: any[] = [];
  const fn = async (options: any) => {
    calls.push(options);
    return results[options.name] ?? {stdout: '', commits: [], iterations: []};
  };
  return {fn, calls};
}

/** Builds the planner's `<plan>` stdout for the given issues (Matt's schema). */
function plan(...issues: {number: number; title: string; branch?: string}[]) {
  return `<plan>${JSON.stringify({issues})}</plan>`;
}

/** A one-issue plan used by most cycle tests. */
const PLAN_ONE = plan({
  number: 7,
  title: 'Fix auth',
  branch: 'sandcastle/issue-7',
});

/** One agent-ready issue, injected so planner-path tests never hit real `gh`. */
const READY_ISSUES = [{number: 7, title: 'Fix auth', body: ''}];

/** A completed implement result (has commits, so it gets reviewed and merged). */
const IMPLEMENT_DONE = {stdout: '', commits: [{sha: 'abc'}], iterations: []};

test('ensureDockerImageBuilt does not build when the image exists', () => {
  const calls: string[][] = [];

  ensureDockerImageBuilt(
    (command, args) => {
      calls.push([command, ...args]);
      return 'sha256:existing';
    },
    () => {},
  );

  assert.deepEqual(calls, [
    [
      'docker',
      'image',
      'inspect',
      'sandcastle:bold_website',
      '--format',
      '{{.Id}}',
    ],
  ]);
});

test('ensureDockerImageBuilt builds when Docker reports the image is absent', () => {
  const calls: string[][] = [];
  const logs: string[] = [];

  ensureDockerImageBuilt(
    (command, args) => {
      calls.push([command, ...args]);
      if (command === 'docker') {
        const error = new Error('Command failed: docker image inspect');
        (error as Error & {stderr: Buffer}).stderr = Buffer.from(
          'Error: No such image: sandcastle:bold_website',
        );
        throw error;
      }
      return '';
    },
    (message) => logs.push(message),
  );

  assert.deepEqual(calls, [
    [
      'docker',
      'image',
      'inspect',
      'sandcastle:bold_website',
      '--format',
      '{{.Id}}',
    ],
    [
      'npx',
      'sandcastle',
      'docker',
      'build-image',
      '--image-name',
      'sandcastle:bold_website',
    ],
  ]);
  assert.deepEqual(logs, [
    'Docker image sandcastle:bold_website is missing; building it now...',
  ]);
});

test('ensureDockerImageBuilt does not build when Docker inspection fails for another reason', () => {
  const calls: string[][] = [];

  assert.throws(
    () =>
      ensureDockerImageBuilt(
        (command, args) => {
          calls.push([command, ...args]);
          const error = new Error('Command failed: docker image inspect');
          (error as Error & {stderr: Buffer}).stderr = Buffer.from(
            'permission denied while trying to connect to the Docker daemon socket',
          );
          throw error;
        },
        () => {},
      ),
    /Could not inspect Docker image sandcastle:bold_website/,
  );

  assert.deepEqual(calls, [
    [
      'docker',
      'image',
      'inspect',
      'sandcastle:bold_website',
      '--format',
      '{{.Id}}',
    ],
  ]);
});

test('defaults to a non-smoke, non-stdout run with no iteration cap when no flags are given', () => {
  const options = parseCliOptions([]);
  assert.deepEqual(options, {smoke: false, stdout: false});
});

test('--smoke enables smoke mode', () => {
  assert.equal(parseCliOptions(['--smoke']).smoke, true);
});

test('--stdout enables stdout logging', () => {
  assert.equal(parseCliOptions(['--stdout']).stdout, true);
});

test('--iterations reads a count in the space-separated form', () => {
  assert.equal(parseCliOptions(['--iterations', '5']).iterations, 5);
});

test('--iterations=N reads a count in the equals form', () => {
  assert.equal(parseCliOptions(['--iterations=3']).iterations, 3);
});

test('--issue reads a forced issue number', () => {
  assert.equal(parseCliOptions(['--issue', '37']).issue, 37);
});

test('--prd reads a PRD/parent issue number', () => {
  assert.equal(parseCliOptions(['--prd', '50']).prd, 50);
});

test('--prd rejects a non-positive value', () => {
  assert.throws(() => parseCliOptions(['--prd', '0']));
});

test('--iterations rejects a non-numeric value', () => {
  assert.throws(() => parseCliOptions(['--iterations', 'abc']));
});

test('--iterations rejects a non-positive value', () => {
  assert.throws(() => parseCliOptions(['--iterations', '0']));
});

test('flags combine into one options object', () => {
  const options = parseCliOptions(['--smoke', '--stdout', '--iterations', '4']);
  assert.deepEqual(options, {smoke: true, stdout: true, iterations: 4});
});

test('extractParentIssue reads the number under the ## Parent section', () => {
  const body = '## Parent\n\n#50\n\n## What to build\n\nDo a thing.';
  assert.equal(extractParentIssue(body), 50);
});

test('extractParentIssue ignores issue refs outside the ## Parent section', () => {
  // A slice that lists sibling blockers must not be read as their child.
  const body = '## Parent\n\n#50\n\n## Blocked by\n\n- #51\n- #52\n';
  assert.equal(extractParentIssue(body), 50);
});

test('extractParentIssue returns undefined when there is no ## Parent section', () => {
  const body = '## What to build\n\nA standalone issue.\n\n## Blocked by\n\n- #51';
  assert.equal(extractParentIssue(body), undefined);
});

test('filterByParent keeps only issues whose parent is the PRD', () => {
  const issues = [
    {number: 51, title: 'child of 50', body: '## Parent\n\n#50'},
    {number: 99, title: 'child of 7', body: '## Parent\n\n#7'},
    {number: 60, title: 'no parent', body: '## What to build\n\nstandalone'},
  ];
  assert.deepEqual(
    filterByParent(issues, 50).map((issue) => issue.number),
    [51],
  );
});

test('parsePlan extracts an array of issues from a <plan> block', () => {
  const stdout = plan(
    {number: 7, title: 'Fix auth', branch: 'sandcastle/issue-7'},
    {number: 8, title: 'Add cache', branch: 'sandcastle/issue-8'},
  );
  assert.deepEqual(parsePlan(stdout), [
    {number: 7, title: 'Fix auth', branch: 'sandcastle/issue-7'},
    {number: 8, title: 'Add cache', branch: 'sandcastle/issue-8'},
  ]);
});

test('parsePlan ignores prose surrounding the <plan> block', () => {
  const stdout = `I analyzed the backlog.\n${plan({
    number: 12,
    title: 'X',
    branch: 'sandcastle/issue-12',
  })}\nCOMPLETE`;
  assert.deepEqual(parsePlan(stdout), [
    {number: 12, title: 'X', branch: 'sandcastle/issue-12'},
  ]);
});

test('parsePlan defaults the branch to sandcastle/issue-N when absent', () => {
  assert.deepEqual(parsePlan(plan({number: 9, title: 'Y'})), [
    {number: 9, title: 'Y', branch: 'sandcastle/issue-9'},
  ]);
});

test('parsePlan defaults a missing title to an empty string', () => {
  const stdout = '<plan>{"issues":[{"number":3}]}</plan>';
  assert.deepEqual(parsePlan(stdout), [
    {number: 3, title: '', branch: 'sandcastle/issue-3'},
  ]);
});

test('parsePlan skips entries without a numeric number', () => {
  const stdout =
    '<plan>{"issues":[{"title":"no number"},{"number":5,"title":"ok"}]}</plan>';
  assert.deepEqual(parsePlan(stdout), [
    {number: 5, title: 'ok', branch: 'sandcastle/issue-5'},
  ]);
});

test('parsePlan returns an empty array for an empty issues list', () => {
  assert.deepEqual(parsePlan('<plan>{"issues":[]}</plan>'), []);
});

test('parsePlan returns an empty array when there is no <plan> block', () => {
  assert.deepEqual(parsePlan('No unblocked issues. COMPLETE'), []);
});

test('parsePlan returns an empty array for malformed JSON', () => {
  assert.deepEqual(parsePlan('<plan>{not json}</plan>'), []);
});

test('parsePlan returns an empty array when the issues key is missing', () => {
  assert.deepEqual(parsePlan('<plan>{"number":7}</plan>'), []);
});

test('runCycle returns 0 and runs only the planner when the planner picks no issue', async () => {
  const {fn, calls} = makeFakeRun({
    planner: {stdout: 'No unblocked issues. COMPLETE', commits: [], iterations: []},
  });

  const planned = await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    fetchIssues: () => READY_ISSUES,
    run: fn as never,
  });

  assert.equal(planned, 0);
  assert.deepEqual(
    calls.map((c) => c.name),
    ['planner'],
  );
});

test('runCycle skips the planner when forced issues are supplied', async () => {
  const {fn, calls} = makeFakeRun({implement: IMPLEMENT_DONE});

  const planned = await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    forcedIssues: [
      {number: 37, title: 'Seeded layout', branch: 'sandcastle/issue-37'},
    ],
    run: fn as never,
  });

  assert.equal(planned, 1);
  assert.deepEqual(
    calls.map((c) => c.name),
    ['implement', 'review', 'merge'],
  );
  assert.deepEqual(calls[0].promptArgs, {
    ISSUE_NUMBER: '37',
    ISSUE_TITLE: 'Seeded layout',
    BRANCH: 'sandcastle/issue-37',
    BASE_BRANCH: 'hgroup-ravi',
  });
});

test('runCycle hands the planner only issues whose parent is the PRD', async () => {
  const {fn, calls} = makeFakeRun({
    planner: {stdout: '<plan>{"issues":[]}</plan>', commits: [], iterations: []},
  });

  await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    prd: 50,
    fetchIssues: () => [
      {number: 51, title: 'child of 50', body: '## Parent\n\n#50'},
      {number: 52, title: 'also child of 50', body: '## Parent\n\n#50'},
      {number: 99, title: 'child of 7', body: '## Parent\n\n#7'},
    ],
    run: fn as never,
  });

  const planner = calls.find((c) => c.name === 'planner');
  assert.match(planner.promptArgs.ELIGIBLE_ISSUES, /#51/);
  assert.match(planner.promptArgs.ELIGIBLE_ISSUES, /#52/);
  assert.doesNotMatch(planner.promptArgs.ELIGIBLE_ISSUES, /#99/);
  assert.match(planner.promptArgs.PRD_CONTEXT, /#50/);
});

test('runCycle returns 0 without running the planner when no issue matches the PRD', async () => {
  const {fn, calls} = makeFakeRun({});

  const planned = await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    prd: 50,
    fetchIssues: () => [{number: 99, title: 'child of 7', body: '## Parent\n\n#7'}],
    run: fn as never,
  });

  assert.equal(planned, 0);
  assert.deepEqual(calls, []); // planner never ran
});

test('runCycle does not review or merge an issue whose implement produced no commits', async () => {
  // Matt's gate: review runs only when implement committed; an issue with no
  // commits is not reviewed and is not part of the merge set.
  const {fn, calls} = makeFakeRun({
    planner: {stdout: PLAN_ONE, commits: [], iterations: []},
    implement: {stdout: '', commits: [], iterations: []},
  });

  const planned = await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    fetchIssues: () => READY_ISSUES,
    run: fn as never,
  });

  assert.equal(planned, 1); // an issue was planned and attempted
  assert.deepEqual(
    calls.map((c) => c.name),
    ['planner', 'implement'], // no review, no merge
  );
});

test('runCycle runs the full plan→implement→review→merge flow for a completed issue', async () => {
  const {fn, calls} = makeFakeRun({
    planner: {stdout: PLAN_ONE, commits: [], iterations: []},
    implement: IMPLEMENT_DONE,
    review: {stdout: '', commits: [{sha: 'def'}], iterations: []},
    merge: {stdout: '', commits: [{sha: 'mrg'}], iterations: [], completionSignal: 'COMPLETE'},
  });

  const planned = await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    fetchIssues: () => READY_ISSUES,
    run: fn as never,
  });

  assert.equal(planned, 1);
  assert.deepEqual(
    calls.map((c) => c.name),
    ['planner', 'implement', 'review', 'merge'],
  );

  const implement = calls.find((c) => c.name === 'implement');
  const review = calls.find((c) => c.name === 'review');
  const merge = calls.find((c) => c.name === 'merge');

  // Implement and review pin the same deterministic branch worktree.
  assert.deepEqual(implement.branchStrategy, {
    type: 'branch',
    branch: 'sandcastle/issue-7',
  });
  assert.deepEqual(review.branchStrategy, {
    type: 'branch',
    branch: 'sandcastle/issue-7',
  });

  // Issue context threaded to implement (all four args).
  assert.deepEqual(implement.promptArgs, {
    ISSUE_NUMBER: '7',
    ISSUE_TITLE: 'Fix auth',
    BRANCH: 'sandcastle/issue-7',
    BASE_BRANCH: 'hgroup-ravi',
  });

  // The merged review prompt references number/branch/base but not the title.
  assert.deepEqual(review.promptArgs, {
    ISSUE_NUMBER: '7',
    BRANCH: 'sandcastle/issue-7',
    BASE_BRANCH: 'hgroup-ravi',
  });

  // The single merge agent runs in a merge-to-head worktree and receives the
  // completed branch and issue as Matt-style lists.
  assert.deepEqual(merge.branchStrategy, {type: 'merge-to-head'});
  assert.deepEqual(merge.promptArgs, {
    BRANCHES: '- sandcastle/issue-7',
    ISSUES: '- #7: Fix auth',
  });
});

test('runCycle processes multiple planned issues and merges them all in one pass', async () => {
  const {fn, calls} = makeFakeRun({
    planner: {
      stdout: plan(
        {number: 7, title: 'Fix auth', branch: 'sandcastle/issue-7'},
        {number: 8, title: 'Add cache', branch: 'sandcastle/issue-8'},
      ),
      commits: [],
      iterations: [],
    },
    implement: IMPLEMENT_DONE,
    review: {stdout: '', commits: [], iterations: []},
    merge: {stdout: '', commits: [{sha: 'mrg'}], iterations: [], completionSignal: 'COMPLETE'},
  });

  const planned = await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    fetchIssues: () => READY_ISSUES,
    run: fn as never,
  });

  assert.equal(planned, 2);

  // With MAX_PARALLEL = 1 the issues run one at a time, then a single merge.
  assert.deepEqual(
    calls.map((c) => c.name),
    ['planner', 'implement', 'review', 'implement', 'review', 'merge'],
  );

  const merge = calls.find((c) => c.name === 'merge');
  assert.deepEqual(merge.promptArgs, {
    BRANCHES: '- sandcastle/issue-7\n- sandcastle/issue-8',
    ISSUES: '- #7: Fix auth\n- #8: Add cache',
  });
});

test('runCycle retries once when the Docker provider reports the image missing', async () => {
  const calls: any[] = [];
  let ensureCalls = 0;
  let failedOnce = false;

  const run = async (options: any) => {
    calls.push(options);
    if (!failedOnce) {
      failedOnce = true;
      throw new Error(
        "Provider 'docker' create failed: Image 'sandcastle:bold_website' not found locally. Build it first with 'sandcastle docker build-image'.",
      );
    }
    return options.name === 'implement' ? IMPLEMENT_DONE : {stdout: '', commits: [], iterations: []};
  };

  const planned = await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    forcedIssues: [
      {number: 37, title: 'Seeded layout', branch: 'sandcastle/issue-37'},
    ],
    run: run as never,
    ensureImage: () => {
      ensureCalls += 1;
    },
  });

  assert.equal(planned, 1);
  assert.equal(ensureCalls, 1);
  assert.deepEqual(
    calls.map((c) => c.name),
    ['implement', 'implement', 'review', 'merge'],
  );
});

test('runCycle runs all phases on gpt-5.5 with phase-specific effort', async () => {
  const {fn, calls} = makeFakeRun({
    planner: {stdout: PLAN_ONE, commits: [], iterations: []},
    implement: IMPLEMENT_DONE,
    review: {stdout: '', commits: [], iterations: []},
    merge: {stdout: '', commits: [{sha: 'mrg'}], iterations: [], completionSignal: 'COMPLETE'},
  });

  await runCycle({
    githubToken: 't',
    baseBranch: 'hgroup-ravi',
    fetchIssues: () => READY_ISSUES,
    run: fn as never,
    // Identity factory makes the chosen agent spec observable.
    makeAgent: (spec) => spec as never,
  });

  const agentFor = (name: string) => calls.find((c) => c.name === name).agent;
  assert.deepEqual(agentFor('planner'), PLANNER_AGENT);
  assert.deepEqual(PLANNER_AGENT, {model: 'gpt-5.5', effort: 'low'});
  assert.deepEqual(agentFor('implement'), WORKER_AGENT);
  assert.deepEqual(agentFor('review'), WORKER_AGENT);
  assert.deepEqual(agentFor('merge'), WORKER_AGENT);
  assert.deepEqual(WORKER_AGENT, {model: 'gpt-5.5', effort: 'high'});
});

test('runCycles stops as soon as a cycle plans no issues', async () => {
  const {fn, calls} = makeFakeRun({
    planner: {stdout: '<plan>{"issues":[]}</plan>', commits: [], iterations: []},
  });

  await runCycles(
    {
      githubToken: 't',
      baseBranch: 'hgroup-ravi',
      fetchIssues: () => READY_ISSUES,
      run: fn as never,
    },
    5,
  );

  // The empty first cycle ends the loop; the planner runs exactly once.
  assert.deepEqual(
    calls.filter((c) => c.name === 'planner').length,
    1,
  );
});

test('runCycles loops up to maxCycles while issues remain unfinished', async () => {
  // The planner keeps returning an issue that never completes (no implement
  // commits), so each cycle plans work but merges nothing. The loop must stop at
  // the maxCycles cap rather than spinning forever.
  const {fn, calls} = makeFakeRun({
    planner: {stdout: PLAN_ONE, commits: [], iterations: []},
    implement: {stdout: '', commits: [], iterations: []},
  });

  await runCycles(
    {
      githubToken: 't',
      baseBranch: 'hgroup-ravi',
      fetchIssues: () => READY_ISSUES,
      run: fn as never,
    },
    3,
  );

  assert.equal(calls.filter((c) => c.name === 'planner').length, 3);
  assert.equal(calls.filter((c) => c.name === 'merge').length, 0);
});
