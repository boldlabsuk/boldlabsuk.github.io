GitHub Issue number: {{ISSUE_NUMBER}}
Branch: {{BRANCH}} (cut from {{BASE_BRANCH}})

# Task

Review the implementation of issue #{{ISSUE_NUMBER}}, then fix every valid
finding directly on this branch. Do not push, close or edit the issue, or create
a PR.

# Context

Start by reading:

1. `gh issue view {{ISSUE_NUMBER}} --comments`
2. `AGENTS.md`
3. `CONTEXT.md` if present
4. Relevant files under `docs/agents/`
5. The branch changes:

```bash
git log {{BASE_BRANCH}}..HEAD --oneline
git diff {{BASE_BRANCH}}...HEAD
```

# Review Process

Lead with findings, ordered by severity. Check both:

## Standards

Repo guidance, local style, maintainability, security, accessibility, and test
quality.

## Spec

Whether the implementation satisfies the issue and any linked parent issue or
PRD. Cite the issue text when useful.

# Fix Process

Fix every valid finding. For behavioral issues, add or update a focused failing
test first, then implement the smallest correct fix. Keep tests behavior-focused
through public interfaces.

# Verification

Before committing, run:

1. `npm run lint`
2. `npm run test`
3. `npm run build`

If nothing needed fixing, make no commit. If fixes were made, make one follow-up
local commit. When done, output `<promise>COMPLETE</promise>`.
