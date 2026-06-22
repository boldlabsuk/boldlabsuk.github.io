/**
 * @fileoverview Run the Sandcastle agent loop against the llm-hanabi repository.
 *
 * Sandcastle launches a Codex coding agent inside a Docker sandbox, points it at
 * a prompt file, and lets it iterate on the repository. This single module owns
 * the whole host side: command-line parsing, the `gh`/Docker host adapters, the
 * builders that assemble a run, and the parallel-cycle engine that drives the
 * planner → implement → review → merge pipeline.
 *
 * Usage:
 *
 *   Normal mode (loop plan → process → merge cycles until no issues remain):
 *     npm run sandcastle
 *
 *   Normal mode with live stdout logging:
 *     npm run sandcastle -- --stdout
 *
 *   Smoke-test mode, default 1 iteration:
 *     npm run sandcastle -- --smoke
 *
 *   Smoke-test mode with N iterations:
 *     npm run sandcastle -- --smoke --iterations 3
 *
 *   Normal mode capped at N cycles (default 10):
 *     npm run sandcastle -- --iterations 5
 *
 *   Normal mode for a specific issue (bypasses the planner, one cycle):
 *     npm run sandcastle -- --issue 37
 *
 *   Restrict planner candidates to children of a given PRD:
 *     npm run sandcastle -- --prd 50
 *
 * Normal mode follows Matt Pocock's parallel-cycle model: a planner picks all
 * unblocked issues, each is implemented and reviewed/fixed on its own branch,
 * then ONE merge agent merges every completed branch into the current host
 * branch and closes its issue. Nothing is pushed — review the finished PRD and
 * `git push` by hand. Smoke mode remains isolated in Sandcastle's temporary
 * worktree.
 *
 * Codex auth is expected to already be prepared on the host at:
 *   ~/.codex-shared/auth.json
 *   ~/.codex-shared/config.toml
 */

import {execFileSync} from 'node:child_process';

import {codex, run, type RunOptions} from '@ai-hero/sandcastle';
import {docker} from '@ai-hero/sandcastle/sandboxes/docker';
import {
  Command,
  CommanderError,
  InvalidArgumentError,
} from '@commander-js/extra-typings';

/** Name (and tag) of the Docker image used for the agent sandbox. */
const DOCKER_IMAGE_NAME = 'sandcastle:llm-hanabi';

/**
 * Shell command run inside the sandbox once it becomes ready.
 *
 * It populates the agent's Codex home (`/home/agent/.codex`) from the read-only
 * host mount (`/home/agent/.codex-host`): it copies the auth/config files (when
 * present), fixes ownership and permissions for the `agent` user, and finally
 * asserts that the required `auth.json` and `config.toml` exist and are
 * non-empty so the run fails fast on a broken credential mount.
 */
const PREPARE_CODEX_HOME_COMMAND =
  'set -eu && rm -rf /home/agent/.codex && mkdir -p /home/agent/.codex && for item in auth.json config.toml AGENTS.md rules; do if [ -e "/home/agent/.codex-host/$item" ]; then cp -R "/home/agent/.codex-host/$item" /home/agent/.codex/; fi; done && if id agent >/dev/null 2>&1; then chown -R agent:agent /home/agent/.codex 2>/dev/null || true; fi && chmod -R u+rwX /home/agent/.codex && test -s /home/agent/.codex/auth.json && test -s /home/agent/.codex/config.toml';

/** Installs Node dependencies inside the sandbox (skipped in smoke mode). */
const INSTALL_NODE_DEPENDENCIES_COMMAND = 'npm ci';

/** Installs Python dependencies inside the sandbox (skipped in smoke mode). */
const INSTALL_PYTHON_DEPENDENCIES_COMMAND = 'uv sync --locked';

/** npm can be slow after a fresh Docker image rebuild. */
const INSTALL_NODE_DEPENDENCIES_TIMEOUT_MS = 180_000;

/** uv may need to build or verify a fresh Linux virtualenv in Docker. */
const INSTALL_PYTHON_DEPENDENCIES_TIMEOUT_MS = 300_000;

/** Prompt files for each pipeline phase. */
const PLAN_PROMPT_FILE = './.sandcastle/plan-prompt.md';
const IMPLEMENT_PROMPT_FILE = './.sandcastle/implement-prompt.md';
const REVIEW_PROMPT_FILE = './.sandcastle/review-prompt.md';
const MERGE_PROMPT_FILE = './.sandcastle/merge-prompt.md';
const SMOKE_PROMPT_FILE = './.sandcastle/prompt.smoke.md';

/** Completion signal the implement/review/merge prompts emit when finished. */
const NORMAL_COMPLETION_SIGNAL = 'COMPLETE';

/**
 * Smoke mode deliberately uses a signal the prompt never prints, so
 * `--iterations N` actually runs N smoke iterations.
 */
const SMOKE_COMPLETION_SIGNAL = '__SANDCASTLE_SMOKE_DO_NOT_STOP__';

/**
 * Maximum number of issues worked concurrently within a cycle. The executor is a
 * real concurrency-limited pool (mirroring Matt Pocock's `run.ts`), but this is
 * pinned to 1 so issues are implemented and reviewed strictly one at a time.
 */
const MAX_PARALLEL = 1;

/**
 * Default cap on how many plan → process → merge cycles a single invocation runs.
 * Each cycle re-plans, so the loop stops early as soon as the planner returns no
 * issues. `--iterations` overrides this cap.
 */
const MAX_ITERATIONS = 10;

/**
 * The implement phase runs a single pass. A pass that produces commits is handed
 * to the merged review-and-fix phase; a pass with no commits is left on its
 * branch and retried on a later cycle. A large issue is continued by re-running
 * against the same deterministic branch, which resumes its committed progress.
 */
const IMPLEMENT_MAX_ITERATIONS = 1;

/**
 * The merge phase may need a few relay turns: an initial merge, then conflict
 * resolution and a re-verification pass. It still stops early via the completion
 * signal once the merge is clean and tests pass, so this is an upper bound, not a
 * fixed count.
 */
const MERGE_MAX_ITERATIONS = 5;

// ─────────────────────────────── Command line ───────────────────────────────

/** Parsed command-line options that configure a run. */
interface CliOptions {
  /** Run the lightweight smoke-test loop instead of the real worker. */
  readonly smoke: boolean;
  /** Stream sandbox logs live to stdout. */
  readonly stdout: boolean;
  /**
   * Override for the iteration cap. In normal mode this is the maximum number of
   * plan → process → merge cycles; in smoke mode it is the number of smoke
   * iterations (defaults to 1). Absent unless the user passes `--iterations`.
   */
  readonly iterations?: number;
  /** Specific GitHub issue number to run, bypassing planner selection. */
  readonly issue?: number;
  /**
   * PRD/parent issue number. When set, the planner only considers issues whose
   * `## Parent` section points at this issue. Ignored when `issue` is set
   * (a forced issue bypasses the planner entirely).
   */
  readonly prd?: number;
}

/**
 * Commander argument parser shared by every numeric flag.
 *
 * @throws InvalidArgumentError If the value is not a positive integer, so
 *     Commander reports it as a usage error.
 */
function parsePositiveInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new InvalidArgumentError('Expected a positive integer.');
  }
  return parsed;
}

/**
 * Parses the command-line arguments into typed {@link CliOptions}.
 *
 * @param args The user arguments (i.e. `process.argv` without the leading node
 *     and script entries).
 * @return The parsed options, with defaults applied for any absent flags.
 * @throws CommanderError On invalid input (e.g. a bad `--iterations` value or
 *     an unknown option); the error message is written to stderr first.
 */
export function parseCliOptions(args: readonly string[]): CliOptions {
  const program = new Command()
    .name('sandcastle')
    .description('Configure and launch a Sandcastle agent run.')
    .option(
      '--smoke',
      'Run the lightweight smoke-test loop instead of the real worker.',
      false,
    )
    .option('--stdout', 'Stream sandbox logs live to stdout.', false)
    .option(
      '--iterations <count>',
      'Override the iteration cap (normal: max cycles; smoke: smoke iterations).',
      parsePositiveInteger,
    )
    .option(
      '--issue <number>',
      'Run one specific GitHub issue and bypass planner selection.',
      parsePositiveInteger,
    )
    .option(
      '--prd <number>',
      'Restrict planner selection to issues whose parent is this PRD issue.',
      parsePositiveInteger,
    )
    // Throw a CommanderError instead of calling process.exit, so callers (and
    // tests) can observe and handle parse failures.
    .exitOverride()
    .parse([...args], {from: 'user'});

  return program.opts();
}

// ──────────────────────────── Issue & plan parsing ───────────────────────────

/** A single issue selected by the planner phase. */
interface PickedIssue {
  /** GitHub issue number to work on. */
  readonly number: number;
  /** Issue title (best-effort; defaults to empty when absent). */
  readonly title: string;
  /** Deterministic worktree branch (`sandcastle/issue-N`). */
  readonly branch: string;
}

/** An open, agent-ready issue fetched from GitHub as a planner candidate. */
interface ReadyIssue {
  /** GitHub issue number. */
  readonly number: number;
  /** Issue title. */
  readonly title: string;
  /** Issue body (Markdown); the parent reference is read from this. */
  readonly body: string;
}

/**
 * Extracts the parent issue number from an issue body.
 *
 * Issues authored by the PRD/issues workflow carry a `## Parent` section whose
 * first issue reference (e.g. `#50`) names the parent PRD. This reads that
 * reference and ignores `#`-references in other sections (such as `## Blocked
 * by`), so a slice that lists sibling blockers is not mistaken for a child of
 * those siblings.
 *
 * @return The parent issue number, or `undefined` when there is no `## Parent`
 *     section with an issue reference.
 */
export function extractParentIssue(body: string): number | undefined {
  let inParentSection = false;
  for (const line of body.split(/\r?\n/)) {
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.*\S)\s*$/);
    if (heading) {
      // A new heading ends the Parent section and may begin it.
      inParentSection = /^parent$/i.test(heading[1].trim());
      continue;
    }
    if (inParentSection) {
      const reference = line.match(/#(\d+)/);
      if (reference) {
        return Number.parseInt(reference[1], 10);
      }
    }
  }
  return undefined;
}

/**
 * Keeps only the issues whose parent is the given PRD issue number.
 *
 * @return The subset of `issues` whose `## Parent` points at `prd`.
 */
export function filterByParent(
  issues: readonly ReadyIssue[],
  prd: number,
): ReadyIssue[] {
  return issues.filter((issue) => extractParentIssue(issue.body) === prd);
}

/**
 * Renders the eligible issues as a compact bullet list for the planner prompt.
 *
 * Only number and title are shown; the planner opens each issue itself to read
 * the full body and dependency relationships.
 *
 * @return A Markdown bullet list, or `(none)` when empty.
 */
function formatEligibleIssues(issues: readonly ReadyIssue[]): string {
  if (issues.length === 0) {
    return '(none)';
  }
  return issues.map((issue) => `- #${issue.number} — ${issue.title}`).join('\n');
}

/**
 * Extracts the planner's chosen issues from its stdout.
 *
 * The planner emits a single
 * `<plan>{"issues": [{"number": N, "title": "...", "branch": "..."}]}</plan>`
 * block (Matt Pocock's schema). Each entry needs a numeric `number`; the title
 * defaults to empty and the branch defaults to `sandcastle/issue-N` when absent.
 * A missing block, malformed JSON, a non-array `issues`, or a missing `issues`
 * key all yield an empty array ("nothing to do").
 *
 * @return The picked issues, in plan order; empty when no valid plan was emitted.
 */
export function parsePlan(stdout: string): PickedIssue[] {
  const match = stdout.match(/<plan>([\s\S]*?)<\/plan>/);
  if (!match) {
    return [];
  }

  let payload: unknown;
  try {
    payload = JSON.parse(match[1]);
  } catch {
    return [];
  }

  if (typeof payload !== 'object' || payload === null) {
    return [];
  }
  const issues = (payload as {issues?: unknown}).issues;
  if (!Array.isArray(issues)) {
    return [];
  }

  const picked: PickedIssue[] = [];
  for (const item of issues) {
    if (typeof item !== 'object' || item === null) {
      continue;
    }
    const {number, title, branch} = item as {
      number?: unknown;
      title?: unknown;
      branch?: unknown;
    };
    if (typeof number !== 'number') {
      continue;
    }
    picked.push({
      number,
      title: typeof title === 'string' ? title : '',
      branch:
        typeof branch === 'string' && branch
          ? branch
          : `sandcastle/issue-${number}`,
    });
  }
  return picked;
}

// ─────────────────────────────── Host adapters ───────────────────────────────

/**
 * Fetches the open, agent-ready issues from GitHub on the host.
 *
 * @return The open issues labelled `ready-for-agent` (number, title, body).
 */
function fetchReadyIssues(): ReadyIssue[] {
  const stdout = execFileSync(
    'gh',
    [
      'issue',
      'list',
      '--state',
      'open',
      '--label',
      'ready-for-agent',
      '--limit',
      '100',
      '--json',
      'number,title,body',
    ],
    {encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']},
  );
  return JSON.parse(stdout) as ReadyIssue[];
}

/**
 * Reads an issue title from GitHub for forced-issue runs.
 *
 * @return The issue title, or an empty string when GitHub returns none.
 */
function fetchIssueTitle(issue: number): string {
  return execFileSync(
    'gh',
    ['issue', 'view', String(issue), '--json', 'title', '--jq', '.title'],
    {encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']},
  ).trim();
}

/**
 * Resolves a GitHub token for the agent to use.
 *
 * Prefers the `GH_TOKEN` environment variable and falls back to the token from
 * the authenticated `gh` CLI.
 *
 * @return A non-empty GitHub token.
 * @throws Error If no token can be obtained from either source.
 */
function resolveGitHubToken(): string {
  const tokenFromEnv = process.env.GH_TOKEN?.trim();
  if (tokenFromEnv) {
    return tokenFromEnv;
  }

  try {
    // `gh auth token` prints the active token. Capture stdout and forward
    // stderr so any auth errors surface directly to the user.
    return execFileSync('gh', ['auth', 'token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }).trim();
  } catch {
    throw new Error(
      'Could not get a GitHub token. Run `gh auth login`, or set GH_TOKEN before running Sandcastle.',
    );
  }
}

// ──────────────────────── Docker image readiness & retry ─────────────────────

/** Result of a Sandcastle `run`. */
type RunResult = Awaited<ReturnType<typeof run>>;

/** Minimal host command runner shape used by the Docker-image guard. */
type HostCommandRunner = (
  command: string,
  args: string[],
  options: Record<string, unknown>,
) => unknown;

/**
 * Converts an unknown child-process failure into text useful for diagnosis.
 *
 * @return stderr/stdout/message text, with empty parts removed.
 */
function commandFailureText(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return String(error);
  }

  const failure = error as {
    message?: unknown;
    stderr?: unknown;
    stdout?: unknown;
  };
  return [failure.stderr, failure.stdout, failure.message]
    .map((value) => {
      if (Buffer.isBuffer(value)) {
        return value.toString('utf8');
      }
      return typeof value === 'string' ? value : '';
    })
    .map((value) => value.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Detects Docker's ordinary "image absent" error without swallowing daemon
 * connectivity or permission failures.
 */
function isMissingDockerImageError(error: unknown): boolean {
  return /no such (image|object)/i.test(commandFailureText(error));
}

/**
 * Detects Sandcastle's Docker provider preflight failure for the sandbox image.
 *
 * Sandcastle currently reports any provider-side `docker image inspect` error
 * from its UID preflight as "Image ... not found", so this predicate stays
 * deliberately narrow to that exact image and message.
 */
function isSandcastleProviderMissingImageError(error: unknown): boolean {
  return commandFailureText(error).includes(
    `Image '${DOCKER_IMAGE_NAME}' not found locally`,
  );
}

/**
 * Ensures the Docker sandbox image exists locally, building it on demand.
 *
 * The build is delegated to the Sandcastle CLI so the image is produced exactly
 * the way Sandcastle expects.
 *
 * @param exec Host command runner; injectable for tests.
 * @param log User-visible logger; injectable for tests.
 */
export function ensureDockerImageBuilt(
  exec: HostCommandRunner = execFileSync as HostCommandRunner,
  log: (message: string) => void = console.log,
): void {
  try {
    // `docker image inspect` exits non-zero when the image is absent. We
    // capture output so other Docker failures can be reported accurately.
    exec(
      'docker',
      ['image', 'inspect', DOCKER_IMAGE_NAME, '--format', '{{.Id}}'],
      {stdio: ['ignore', 'pipe', 'pipe']},
    );
    return;
  } catch (error) {
    if (!isMissingDockerImageError(error)) {
      const details = commandFailureText(error);
      throw new Error(
        `Could not inspect Docker image ${DOCKER_IMAGE_NAME}. Docker may be unavailable or pointed at an unexpected daemon.` +
          (details ? `\n${details}` : ''),
      );
    }

    log(`Docker image ${DOCKER_IMAGE_NAME} is missing; building it now...`);

    // Build through the Sandcastle CLI, inheriting stdio so build progress is
    // visible to the user.
    exec(
      'npx',
      ['sandcastle', 'docker', 'build-image', '--image-name', DOCKER_IMAGE_NAME],
      {stdio: 'inherit'},
    );
  }
}

/**
 * Runs one Sandcastle phase, retrying once if the Docker provider claims the
 * already-preflighted sandbox image is missing.
 *
 * @param runFn Sandcastle runner.
 * @param options Phase options.
 * @param ensureImage Host preflight to run before retrying.
 */
async function runWithImageRetry(
  runFn: typeof run,
  options: RunOptions,
  ensureImage: () => void = ensureDockerImageBuilt,
): Promise<RunResult> {
  try {
    return await runFn(options);
  } catch (error) {
    if (!isSandcastleProviderMissingImageError(error)) {
      throw error;
    }

    console.warn(
      `Sandcastle's Docker provider reported ${DOCKER_IMAGE_NAME} as missing after host preflight; rechecking image and retrying once.`,
    );
    ensureImage();
    return await runFn(options);
  }
}

// ─────────────────────────────── Run builders ────────────────────────────────

/**
 * Builds the Docker sandbox provider shared by every phase.
 *
 * @param githubToken Token exposed to the agent as `GH_TOKEN`.
 */
function buildSandbox(githubToken: string) {
  return docker({
    imageName: DOCKER_IMAGE_NAME,
    env: {GH_TOKEN: githubToken},
    mounts: [
      {
        // Mount the host's shared Codex auth/config read-only. The
        // onSandboxReady hook copies it into the agent's writable Codex home.
        hostPath: '~/.codex-shared',
        sandboxPath: '/home/agent/.codex-host',
        readonly: true,
      },
      {
        // Mount user-managed skills at $HOME/.agents/skills, which Codex
        // scans automatically for user-scoped skills.
        hostPath: '~/.agents',
        sandboxPath: '/home/agent/.agents',
        readonly: true,
      },
      {
        // The ~/.agents/skills entries are symlinks into ~/.skills, so both
        // trees must be present in the sandbox for the links to resolve.
        hostPath: '~/.skills',
        sandboxPath: '/Users/ravi/.skills',
        readonly: true,
      },
    ],
  });
}

/** A Codex model plus reasoning effort, named so phases can pick deliberately. */
interface AgentSpec {
  /** Codex model id (e.g. `gpt-5.4`). */
  readonly model: string;
  /** Reasoning effort level. */
  readonly effort: 'low' | 'medium' | 'high' | 'xhigh';
}

/** Planning is lightweight analysis — a smaller, cheaper model is enough. */
export const PLANNER_AGENT: AgentSpec = {model: 'gpt-5.4', effort: 'medium'};

/** Implement/review/edit do the real engineering work. */
export const WORKER_AGENT: AgentSpec = {model: 'gpt-5.5', effort: 'medium'};

/**
 * Builds a Codex agent from an {@link AgentSpec}.
 */
function buildAgent(spec: AgentSpec) {
  return codex(spec.model, {
    effort: spec.effort,
    env: {CODEX_HOME: '/home/agent/.codex'},
  });
}

/**
 * Builds the sandbox-ready hooks.
 *
 * @param installDeps When true, install Node and Python dependencies after the
 *     Codex home is prepared. The planner phase skips this (analysis only);
 *     implement/review need the project environment. With branch-strategy
 *     worktree reuse the install is a fast verify on later phases.
 */
function buildHooks(installDeps: boolean) {
  const onSandboxReady = [
    {command: PREPARE_CODEX_HOME_COMMAND},
    ...(installDeps
      ? [
          {
            command: INSTALL_NODE_DEPENDENCIES_COMMAND,
            timeoutMs: INSTALL_NODE_DEPENDENCIES_TIMEOUT_MS,
          },
          {
            command: INSTALL_PYTHON_DEPENDENCIES_COMMAND,
            timeoutMs: INSTALL_PYTHON_DEPENDENCIES_TIMEOUT_MS,
          },
        ]
      : []),
  ];
  return {sandbox: {onSandboxReady}};
}

// ─────────────────────────────── Cycle engine ────────────────────────────────

/** Dependencies for {@link runCycle}; seams are injected in tests. */
export interface CycleDeps {
  /** GitHub token exposed to every phase's sandbox. */
  readonly githubToken: string;
  /** Host branch issue branches are cut from and merged back into. */
  readonly baseBranch: string;
  /** Logging mode forwarded to each run. */
  readonly logging?: RunOptions['logging'];
  /** Agent runner (defaults to the real Sandcastle `run`). */
  readonly run?: typeof run;
  /** Builds an agent from a spec (defaults to the real Codex factory). */
  readonly makeAgent?: (spec: AgentSpec) => ReturnType<typeof buildAgent>;
  /**
   * Specific issues to run, bypassing the planner phase (used by `--issue N`).
   * When set, these are processed directly and the planner never runs.
   */
  readonly forcedIssues?: readonly PickedIssue[];
  /**
   * PRD/parent issue number. When set, the planner's candidate set is narrowed
   * to issues whose `## Parent` points at this PRD.
   */
  readonly prd?: number;
  /** Fetches agent-ready issues (defaults to a host `gh issue list`). */
  readonly fetchIssues?: () => ReadyIssue[];
  /** Ensures the Docker image exists before retrying provider startup. */
  readonly ensureImage?: () => void;
  /** Max issues worked concurrently (defaults to {@link MAX_PARALLEL}). */
  readonly maxParallel?: number;
}

/**
 * One phase's options minus the fields {@link makePhaseRunner} fills in for every
 * phase: the shared sandbox, logging mode, and normal completion signal.
 */
type PhaseSpec = Omit<RunOptions, 'sandbox' | 'logging' | 'completionSignal'>;

/** Launches a single phase with the per-cycle defaults already applied. */
type RunPhase = (spec: PhaseSpec) => Promise<RunResult>;

/**
 * Binds the per-cycle constants — sandbox, logging, and the normal completion
 * signal — so callers describe each phase by only what varies. The image-missing
 * retry is applied to every phase.
 */
function makePhaseRunner(args: {
  readonly runFn: typeof run;
  readonly sandbox: ReturnType<typeof buildSandbox>;
  readonly logging: RunOptions['logging'];
  readonly ensureImage: () => void;
}): RunPhase {
  return (spec) =>
    runWithImageRetry(
      args.runFn,
      // The spread restores every field PhaseSpec omitted; the cast reconciles
      // RunOptions' prompt/promptFile union, which `Omit` distributes awkwardly.
      {
        ...spec,
        sandbox: args.sandbox,
        logging: args.logging,
        completionSignal: NORMAL_COMPLETION_SIGNAL,
      } as RunOptions,
      args.ensureImage,
    );
}

/** The outcome of working a single issue within a cycle. */
interface IssueResult {
  /** The issue that was worked. */
  readonly issue: PickedIssue;
  /** Commits produced this run by implement (and review, when it ran). */
  readonly commits: RunResult['commits'];
}

/** Shared per-cycle context passed to {@link processIssue}. */
interface CycleContext {
  readonly runPhase: RunPhase;
  readonly workerAgent: ReturnType<typeof buildAgent>;
  readonly fullHooks: ReturnType<typeof buildHooks>;
  readonly baseBranch: string;
}

/**
 * Builds a concurrency limiter that runs at most `max` tasks at once.
 *
 * Mirrors the semaphore in Matt Pocock's `run.ts`: a `running` counter plus a
 * queue of waiters. The returned function waits for a slot, runs its task, and
 * releases the slot even if the task throws, so a failing issue never starves
 * the pool.
 *
 * @param max Maximum number of concurrent tasks (>= 1).
 * @return A function that schedules a task under the limit.
 */
function makeLimiter(max: number) {
  let running = 0;
  const queue: (() => void)[] = [];
  const acquire = () =>
    running < max
      ? ((running += 1), Promise.resolve())
      : new Promise<void>((resolve) => queue.push(resolve));
  const release = () => {
    running -= 1;
    const next = queue.shift();
    if (next) {
      running += 1;
      next();
    }
  };
  return async <T>(task: () => Promise<T>): Promise<T> => {
    await acquire();
    try {
      return await task();
    } finally {
      release();
    }
  };
}

/**
 * Works a single issue: implement, then — only if implement committed — the
 * merged review-and-fix phase, both on the issue's deterministic branch.
 *
 * Mirrors Matt's per-issue body: review runs only when there are commits, and
 * the returned commit list decides whether the issue joins the cycle's merge set.
 *
 * @return The issue plus the commits produced this run.
 */
async function processIssue(
  issue: PickedIssue,
  ctx: CycleContext,
): Promise<IssueResult> {
  const branchStrategy = {type: 'branch', branch: issue.branch} as const;
  const promptArgs = {
    ISSUE_NUMBER: String(issue.number),
    ISSUE_TITLE: issue.title,
    BRANCH: issue.branch,
    BASE_BRANCH: ctx.baseBranch,
  };

  // IMPLEMENT — creates/reuses the sandcastle/issue-N worktree.
  const impl = await ctx.runPhase({
    name: 'implement',
    agent: ctx.workerAgent,
    hooks: ctx.fullHooks,
    promptArgs,
    promptFile: IMPLEMENT_PROMPT_FILE,
    branchStrategy,
    maxIterations: IMPLEMENT_MAX_ITERATIONS,
  });
  const commits = [...(impl.commits ?? [])];

  // No commits ⇒ nothing to review or merge (Matt's gate). Leave the branch for
  // a later cycle and report no commits so the issue stays out of the merge set.
  if (commits.length === 0) {
    console.log(
      `Issue #${issue.number}: implement produced no commits this run; skipping review.`,
    );
    return {issue, commits};
  }

  // REVIEW + FIX — one merged phase on the same worktree. The prompt references
  // number/branch/base but not the title, so omit the title to avoid an
  // "unreferenced prompt arg" warning.
  const review = await ctx.runPhase({
    name: 'review',
    agent: ctx.workerAgent,
    hooks: ctx.fullHooks,
    promptArgs: {
      ISSUE_NUMBER: promptArgs.ISSUE_NUMBER,
      BRANCH: promptArgs.BRANCH,
      BASE_BRANCH: promptArgs.BASE_BRANCH,
    },
    promptFile: REVIEW_PROMPT_FILE,
    branchStrategy,
    maxIterations: 1,
  });
  commits.push(...(review.commits ?? []));

  return {issue, commits};
}

/**
 * Selects the issues to work this cycle: the forced set, or the planner's pick
 * from the host-filtered candidates.
 *
 * @return The picked issues, or `undefined` when there are no eligible
 *     candidates at all (a stop reason has already been logged).
 */
async function selectIssues(
  deps: CycleDeps,
  runPhase: RunPhase,
  makeAgent: (spec: AgentSpec) => ReturnType<typeof buildAgent>,
  lightHooks: ReturnType<typeof buildHooks>,
): Promise<readonly PickedIssue[] | undefined> {
  if (deps.forcedIssues) {
    return deps.forcedIssues;
  }

  // Resolve the candidate set on the host so eligibility is a hard guarantee:
  // fetch agent-ready issues, then narrow to children of the PRD when given.
  const fetchIssues = deps.fetchIssues ?? fetchReadyIssues;
  const eligibleIssues =
    deps.prd === undefined
      ? fetchIssues()
      : filterByParent(fetchIssues(), deps.prd);

  if (eligibleIssues.length === 0) {
    console.log(
      deps.prd === undefined
        ? 'No agent-ready issues; stopping.'
        : `No agent-ready issues with parent PRD #${deps.prd}; stopping.`,
    );
    return undefined;
  }

  const plan = await runPhase({
    name: 'planner',
    agent: makeAgent(PLANNER_AGENT),
    hooks: lightHooks,
    promptFile: PLAN_PROMPT_FILE,
    promptArgs: {
      PRD_CONTEXT:
        deps.prd === undefined
          ? ''
          : `These candidates are the implementation children of PRD #${deps.prd}.`,
      ELIGIBLE_ISSUES: formatEligibleIssues(eligibleIssues),
    },
    maxIterations: 1,
  });
  return parsePlan(plan.stdout);
}

/**
 * Runs one plan → process → merge cycle.
 *
 * Works each selected issue through {@link processIssue} under a concurrency
 * limit, then runs ONE merge agent over every issue that produced commits. The
 * merge agent merges into the local base branch and closes the issues itself;
 * the host never pushes — you review the finished PRD and push by hand.
 *
 * @return The number of issues planned this cycle (0 ⇒ the outer loop stops).
 */
export async function runCycle(deps: CycleDeps): Promise<number> {
  const runFn = deps.run ?? run;
  const makeAgent = deps.makeAgent ?? buildAgent;
  const ensureImage = deps.ensureImage ?? ensureDockerImageBuilt;
  const sandbox = buildSandbox(deps.githubToken);
  const runPhase = makePhaseRunner({
    runFn,
    sandbox,
    logging: deps.logging,
    ensureImage,
  });
  const workerAgent = makeAgent(WORKER_AGENT);
  const fullHooks = buildHooks(true);

  // ── 1. SELECT ──
  const issues = await selectIssues(deps, runPhase, makeAgent, buildHooks(false));
  if (issues === undefined) {
    return 0;
  }
  if (issues.length === 0) {
    console.log('Planner selected no unblocked issues; stopping.');
    return 0;
  }

  console.log(
    `Planned ${issues.length} issue(s): ${issues
      .map((issue) => `#${issue.number}`)
      .join(', ')}`,
  );

  // ── 2. PROCESS — implement + review each issue under the concurrency limit ──
  const ctx: CycleContext = {
    runPhase,
    workerAgent,
    fullHooks,
    baseBranch: deps.baseBranch,
  };
  const limit = makeLimiter(deps.maxParallel ?? MAX_PARALLEL);
  const settled = await Promise.allSettled(
    issues.map((issue) => limit(() => processIssue(issue, ctx))),
  );

  const completed = settled
    .filter(
      (result): result is PromiseFulfilledResult<IssueResult> =>
        result.status === 'fulfilled' && result.value.commits.length > 0,
    )
    .map((result) => result.value);

  for (const result of settled) {
    if (result.status === 'rejected') {
      console.error(`An issue failed this cycle: ${result.reason}`);
    }
  }

  // ── 3. MERGE — one agent merges every completed branch into the base ──
  // Runs in a merge-to-head worktree cut from the base branch, so its merge
  // commit folds back onto the host's checked-out branch. The agent merges each
  // branch, resolves conflicts, re-verifies tests, and closes the issues (and any
  // parent PRD it completes) itself. Following Matt Pocock's model the host never
  // pushes — completed work stays committed locally for you to review and push by
  // hand once the whole PRD is finished.
  if (completed.length === 0) {
    console.log('No issues completed this cycle; nothing to merge.');
    return issues.length;
  }

  await runPhase({
    name: 'merge',
    agent: workerAgent,
    hooks: fullHooks,
    promptArgs: {
      BRANCHES: completed.map((c) => `- ${c.issue.branch}`).join('\n'),
      ISSUES: completed
        .map((c) => `- #${c.issue.number}: ${c.issue.title}`)
        .join('\n'),
    },
    promptFile: MERGE_PROMPT_FILE,
    branchStrategy: {type: 'merge-to-head'},
    maxIterations: MERGE_MAX_ITERATIONS,
  });

  console.log(
    `Cycle merged ${completed.length} issue(s) locally and closed them. Nothing pushed — review and push by hand when the PRD is complete.`,
  );
  return issues.length;
}

/**
 * Repeatedly runs {@link runCycle} until a cycle plans no issues or the cycle cap
 * is reached. Each cycle re-plans, so completed (and now-closed) issues drop out
 * of the candidate set and the loop converges. Mirrors Matt Pocock's outer loop.
 *
 * @param maxCycles Upper bound on cycles for this invocation.
 */
export async function runCycles(
  deps: CycleDeps,
  maxCycles: number,
): Promise<void> {
  for (let cycle = 1; cycle <= maxCycles; cycle += 1) {
    console.log(`── Cycle ${cycle}/${maxCycles} ──`);
    const planned = await runCycle(deps);
    if (planned === 0) {
      break;
    }
  }
}

// ──────────────────────────────── Entry point ────────────────────────────────

/**
 * Configures and launches a Sandcastle agent run.
 *
 * Prepares the host (builds the sandbox image if needed, resolves a GitHub
 * token), then dispatches to the smoke loop or the parallel-cycle engine.
 */
async function main(): Promise<void> {
  // Parse the command line first so invalid flags fail before any host work.
  const {smoke, stdout, iterations, issue, prd} = parseCliOptions(
    process.argv.slice(2),
  );

  // Prepare the host before starting the run. Order matters: build the image
  // first, then resolve credentials.
  ensureDockerImageBuilt();
  const githubToken = resolveGitHubToken();
  const logging = stdout ? ({type: 'stdout'} as const) : undefined;

  if (smoke) {
    // Smoke mode keeps the original single-run shape: a lightweight prompt in
    // a temporary worktree, with a completion signal the prompt never prints
    // so --iterations N actually runs N smoke iterations (default 1).
    await runWithImageRetry(run, {
      name: 'smoke',
      sandbox: buildSandbox(githubToken),
      agent: buildAgent(WORKER_AGENT),
      promptFile: SMOKE_PROMPT_FILE,
      maxIterations: iterations ?? 1,
      branchStrategy: {type: 'merge-to-head'},
      copyToWorktree: [],
      completionSignal: SMOKE_COMPLETION_SIGNAL,
      logging,
      hooks: buildHooks(false),
    });
    return;
  }

  // Normal mode: loop plan → process → merge cycles (Matt Pocock's model). Each
  // issue's branch is cut from, and merged back into, the branch currently
  // checked out; nothing is pushed.
  const baseBranch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8',
  }).trim();

  // A forced issue bypasses the planner and runs a single cycle over just it.
  if (issue !== undefined) {
    await runCycle({
      githubToken,
      baseBranch,
      logging,
      forcedIssues: [
        {
          number: issue,
          title: fetchIssueTitle(issue),
          branch: `sandcastle/issue-${issue}`,
        },
      ],
    });
    return;
  }

  await runCycles(
    {githubToken, baseBranch, logging, prd},
    iterations ?? MAX_ITERATIONS,
  );
}

// Run only when executed directly (e.g. `tsx main.mts`), not when imported by
// tests. `import.meta.main` is true only for the program's entry module.
if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    // Commander throws on `--help`, `--version`, or bad input (it has already
    // written any usage/error text). Exit with its code instead of surfacing
    // an unhandled rejection; re-throw anything else.
    if (error instanceof CommanderError) {
      process.exit(error.exitCode);
    }
    throw error;
  }
}
