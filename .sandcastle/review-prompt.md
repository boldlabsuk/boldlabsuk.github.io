GitHub Issue number: {{ISSUE_NUMBER}}
Branch: {{BRANCH}} (cut from {{BASE_BRANCH}})

# Task

This phase does TWO things in one pass on this branch: first **review** the
implementation of issue #{{ISSUE_NUMBER}}, then **fix** the valid findings.

You are an expert code reviewer and engineer. Review thoroughly first, then make
the code changes to address every finding that needs fixing. If, after reviewing,
nothing needs fixing, skip straight to # Commit and say so. Do not push, do not
close or edit the issue, and do not create a PR — the merge phase handles that.

# GitHub Issue

Start by reading the issue, including all comments:
`gh issue view {{ISSUE_NUMBER}} --comments`.

If the issue references a parent PRD, blocker issue, follow-on issue, or related
implementation issue, read those too. Treat the issue and linked PRD as the
source of truth for expected behavior.

# Diff

The implementer's work lives on this branch (`{{BRANCH}}`), already committed.
Review it against the branch's fork point:

```bash
git log {{BASE_BRANCH}}..HEAD --oneline
git diff {{BASE_BRANCH}}...HEAD
```

# Review Process

1. Read the GitHub issue and linked PRD/spec thoroughly.
2. Read repo standards and local guidance:
   - `AGENTS.md`
   - `CONTEXT.md` if present
   - relevant files under `docs/adr/` if present
   - `docs/standards/python-docstrings.md` if present
   - relevant test/style/config files
3. Read the diff carefully.
4. Verify the implementation satisfies the issue and linked PRD.
5. Stress-test edge cases.
6. Think about clarity, maintainability, and consistency while preserving behavior.
7. Identify scope creep, missing requirements, behavioral regressions, brittle
   tests, or maintainability problems.

Use the /review skill's two-axis format to record findings before you fix them:

## Standards
Report violations of documented repo standards, local code conventions, or clear
maintainability risks introduced by the diff. Cite file/line and the relevant
standard when possible.

## Spec
Check whether the implementation fully satisfies the issue and any linked PRD
requirements. Report missing requirements, partial implementation, wrong
behavior, or scope creep. Cite issue or PRD text where possible.

Lead with findings, ordered by severity. If there are no findings, say that
clearly and mention remaining test gaps or residual risk.

# Fix Process

Now fix every valid finding. Use the /tdd skill strictly:

1. For each behavioral or spec finding, first add or update a focused failing test.
2. Implement the smallest correct fix.
3. Run the targeted test and get it green.
4. Repeat one finding at a time.
5. Refactor only while tests are green.
6. Keep tests behavior-focused through public interfaces. Do not create artificial
   test seams just to test internals.

For standards-only findings that do not need tests, make the smallest code cleanup
and run the nearest relevant verification.

# Verification

Before committing:
- Run the smallest meaningful pytest scope for the touched code.
- Run `uv run python -m compileall -q src tests` if Python code changed.
- Run any additional focused checks the findings specifically require.
- Do not run full training jobs or W&B-backed commands.

If verification fails, fix it before proceeding. If you are genuinely blocked,
explain the blocker and stop — do not fabricate a fix.

# Commit

When all valid findings are fixed and verification passes, make one follow-up
local commit with a conventional message:

- Prefer `fix: address review findings for issue #{{ISSUE_NUMBER}}`.
- Mention the issue number in the body if useful.

If nothing needed fixing, make no commit.

Do **not** push the branch, create a PR, post comments, close the issue, or edit
labels — the merge phase merges the branch and closes the issue after this phase.

When done, output `<promise>COMPLETE</promise>`.
