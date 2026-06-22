// Parallel Planner with Review — four-phase orchestration loop
//
// This template drives a multi-phase workflow:
//   Phase 1 (Plan):             An opus agent analyzes open issues, builds a
//                               dependency graph, and outputs a <plan> JSON
//                               listing unblocked issues with branch names.
//   Phase 2 (Execute + Review): For each issue, a sandbox is created via
//                               createSandbox(). The implementer runs first
//                               (100 iterations). If it produces commits, a
//                               reviewer runs in the same sandbox on the same
//                               branch (1 iteration). All issue pipelines run
//                               concurrently via Promise.allSettled().
//   Phase 3 (Merge):            A single agent merges all completed branches
//                               into the current branch.
//
// The outer loop repeats up to MAX_ITERATIONS times so that newly unblocked
// issues are picked up after each round of merges.
//
// Usage:
//   npm run sandcastle

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { z } from "zod";

// The planner emits its plan as JSON inside <plan> tags; Output.object extracts
// and validates it against this schema. We use Zod here, but any Standard
// Schema validator works just as well — Valibot, ArkType, etc. See
// https://standardschema.dev.
const issueSchema = z.object({
  id: z.string(),
  title: z.string(),
  branch: z.string(),
});

const planSchema = z.object({
  issues: z.array(issueSchema),
});

type PlannedIssue = z.infer<typeof issueSchema>;
type AgentRunResult = {
  commits: unknown[];
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Maximum number of plan→execute→merge cycles before stopping.
const MAX_ITERATIONS = 10;

const CODEX_HOME = "/home/agent/.codex";
const CODEX_HOST_HOME = "/home/agent/.codex-host";
const CODEX_MODEL = "gpt-5.5";

const PREPARE_CODEX_HOME_COMMAND =
  `set -eu && rm -rf "${CODEX_HOME}" && mkdir -p "${CODEX_HOME}" && ` +
  `for item in auth.json config.toml AGENTS.md rules; do ` +
  `if [ -e "${CODEX_HOST_HOME}/$item" ]; then cp -R "${CODEX_HOST_HOME}/$item" "${CODEX_HOME}/"; fi; ` +
  `done && ` +
  `if id agent >/dev/null 2>&1; then chown -R agent:agent "${CODEX_HOME}" 2>/dev/null || true; fi && ` +
  `chmod -R u+rwX "${CODEX_HOME}" && ` +
  `test -s "${CODEX_HOME}/auth.json" && test -s "${CODEX_HOME}/config.toml"`;

// Hooks run inside the sandbox before the agent starts each iteration.
// npm install ensures the sandbox always has fresh dependencies.
const hooks = {
  sandbox: {
    onSandboxReady: [
      { command: PREPARE_CODEX_HOME_COMMAND },
      { command: "npm install" },
    ],
  },
};

// Copy node_modules from the host into the worktree before each sandbox
// starts. Avoids a full npm install from scratch; the hook above handles
// platform-specific binaries and any packages added since the last copy.
const copyToWorktree = ["node_modules"];

function createSandboxProvider() {
  const env = process.env.GH_TOKEN
    ? { GH_TOKEN: process.env.GH_TOKEN }
    : undefined;

  return docker({
    env,
    mounts: [
      {
        hostPath: "~/.codex-shared",
        sandboxPath: "/home/agent/.codex-host",
        readonly: true,
      },
      {
        hostPath: "~/.agents",
        sandboxPath: "/home/agent/.agents",
        readonly: true,
      },
      {
        hostPath: "~/.skills",
        sandboxPath: "/Users/ravi/.skills",
        readonly: true,
      },
    ],
  });
}

function plannerAgent() {
  return sandcastle.codex(CODEX_MODEL, {
    effort: "low",
    env: { CODEX_HOME },
  });
}

function workerAgent() {
  return sandcastle.codex(CODEX_MODEL, {
    effort: "high",
    env: { CODEX_HOME },
  });
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
  console.log(`\n=== Iteration ${iteration}/${MAX_ITERATIONS} ===\n`);

  // -------------------------------------------------------------------------
  // Phase 1: Plan
  //
  // The planning agent (opus, for deeper reasoning) reads the open issue list,
  // builds a dependency graph, and selects the issues that can be worked in
  // parallel right now (i.e., no blocking dependencies on other open issues).
  //
  // It outputs a <plan> JSON block — Output.object parses and validates it.
  // -------------------------------------------------------------------------
  const plan = await sandcastle.run({
    hooks,
    sandbox: createSandboxProvider(),
    name: "planner",
    // One iteration is enough: the planner just needs to read and reason,
    // not write code. (Structured output requires maxIterations: 1.)
    maxIterations: 1,
    agent: plannerAgent(),
    promptFile: "./.sandcastle/plan-prompt.md",
    // Extract and validate the <plan> JSON into a typed object. Throws
    // StructuredOutputError if the tag is missing, the JSON is malformed, or
    // validation fails — which aborts the loop.
    output: sandcastle.Output.object({ tag: "plan", schema: planSchema }),
  });

  const issues: PlannedIssue[] = plan.output.issues;

  if (issues.length === 0) {
    // No unblocked work — either everything is done or everything is blocked.
    console.log("No unblocked issues to work on. Exiting.");
    break;
  }

  console.log(
    `Planning complete. ${issues.length} issue(s) to work in parallel:`,
  );
  for (const issue of issues) {
    console.log(`  ${issue.id}: ${issue.title} → ${issue.branch}`);
  }

  // -------------------------------------------------------------------------
  // Phase 2: Execute + Review
  //
  // For each issue, create a sandbox via createSandbox() so the implementer
  // and reviewer share the same sandbox instance per branch. The implementer
  // runs first; if it produces commits, the reviewer runs in the same sandbox.
  //
  // Promise.allSettled means one failing pipeline doesn't cancel the others.
  // -------------------------------------------------------------------------

  const settled: PromiseSettledResult<AgentRunResult>[] =
    await Promise.allSettled(
      issues.map(async (issue): Promise<AgentRunResult> => {
        const sandbox = await sandcastle.createSandbox({
          branch: issue.branch,
          sandbox: createSandboxProvider(),
          hooks,
          copyToWorktree,
        });

        try {
          // Run the implementer
          const implement = await sandbox.run({
            name: "implementer",
            maxIterations: 100,
            agent: workerAgent(),
            promptFile: "./.sandcastle/implement-prompt.md",
            promptArgs: {
              TASK_ID: issue.id,
              ISSUE_TITLE: issue.title,
              BRANCH: issue.branch,
            },
          });

          // Only review if the implementer produced commits
          if (implement.commits.length > 0) {
            const review = await sandbox.run({
              name: "reviewer",
              maxIterations: 1,
              agent: workerAgent(),
              promptFile: "./.sandcastle/review-prompt.md",
              promptArgs: {
                BRANCH: issue.branch,
              },
            });

            // Merge commits from both runs so the merge phase sees all of them.
            // Each sandbox.run() only returns commits from its own run.
            return {
              ...review,
              commits: [...implement.commits, ...review.commits],
            };
          }

          return implement;
        } finally {
          await sandbox.close();
        }
      }),
    );

  // Log any agents that threw (network error, sandbox crash, etc.).
  for (const [i, outcome] of settled.entries()) {
    if (outcome.status === "rejected") {
      console.error(
        `  ✗ ${issues[i]!.id} (${issues[i]!.branch}) failed: ${outcome.reason}`,
      );
    }
  }

  // Only pass branches that actually produced commits to the merge phase.
  // An agent that ran successfully but made no commits has nothing to merge.
  const completedIssues = settled
    .map((outcome, i) => ({ outcome, issue: issues[i]! }))
    .filter(
      (entry) =>
        entry.outcome.status === "fulfilled" &&
        entry.outcome.value.commits.length > 0,
    )
    .map((entry) => entry.issue);

  const completedBranches = completedIssues.map((i) => i.branch);

  console.log(
    `\nExecution complete. ${completedBranches.length} branch(es) with commits:`,
  );
  for (const branch of completedBranches) {
    console.log(`  ${branch}`);
  }

  if (completedBranches.length === 0) {
    // All agents ran but none made commits — nothing to merge this cycle.
    console.log("No commits produced. Nothing to merge.");
    continue;
  }

  // -------------------------------------------------------------------------
  // Phase 3: Merge
  //
  // One agent merges all completed branches into the current branch,
  // resolving any conflicts and running tests to confirm everything works.
  //
  // The {{BRANCHES}} and {{ISSUES}} prompt arguments are lists that the agent
  // uses to know which branches to merge and which issues to close.
  // -------------------------------------------------------------------------
  await sandcastle.run({
    hooks,
    sandbox: createSandboxProvider(),
    name: "merger",
    maxIterations: 1,
    agent: workerAgent(),
    promptFile: "./.sandcastle/merge-prompt.md",
    promptArgs: {
      // A markdown list of branch names, one per line.
      BRANCHES: completedBranches.map((b) => `- ${b}`).join("\n"),
      // A markdown list of issue IDs and titles, one per line.
      ISSUES: completedIssues.map((i) => `- ${i.id}: ${i.title}`).join("\n"),
    },
  });

  console.log("\nBranches merged.");
}

console.log("\nAll done.");
