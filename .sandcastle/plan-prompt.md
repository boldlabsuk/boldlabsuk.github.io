# Choose Issues Task

You are the planner. Your only job is to pick **all** the issues that are ready
for agent work, not blocked by another open issue, and safe to work in parallel
with each other. You do not write code.

{{PRD_CONTEXT}}

These are the only issues you may choose from (already filtered to those ready
for agent work):

<eligible-issues>
{{ELIGIBLE_ISSUES}}
</eligible-issues>

This list is the sole source of candidates. Open each one you are considering
with `gh issue view <number> --comments` to read its full body (including its
`## Blocked by` and `## Parent` sections) and build the dependency graph. Do not
choose, or treat as a dependency target, any issue whose number is not in the
list above, and do not run your own unfiltered query to find more issues. If the
list is empty, there is nothing to do.

## Recent RALPH commits (last 10)

!`git log --oneline --grep="RALPH" -10`

# Task

Analyze the open issues and build a dependency graph. For each issue, determine
whether it **blocks** or **is blocked by** any other open issue.

An issue B is **blocked by** issue A if:

- B requires code or infrastructure that A introduces
- B and A modify overlapping files or modules, making concurrent work likely to
  produce merge conflicts
- B's requirements depend on a decision or API shape that A will establish

An issue is **unblocked** if it has zero blocking dependencies on other open
issues.

If an issue appears to be a PRD/meta issue and it has implementation issues that
link to it, skip it — the PRD cannot be worked on directly.

Select **every** unblocked issue that can be worked safely in parallel. Two
issues are safe to run together only if neither blocks the other and they do not
modify overlapping files or modules (which would collide at merge time). Leave
out any issue that is blocked, or that overlaps an issue you already selected;
it will be picked up on a later planning cycle once its blockers are merged. If
every issue is blocked, select just the single highest-priority candidate so work
still moves forward.

# Output

Emit exactly one `<plan>` block containing the chosen issues as a JSON array,
then the completion signal. Use each issue's real number and title, and a
deterministic branch named `sandcastle/issue-<number>` (no suffixes):

<plan>
{"issues": [
  {"number": 42, "title": "Fix auth bug", "branch": "sandcastle/issue-42"},
  {"number": 43, "title": "Add cache layer", "branch": "sandcastle/issue-43"}
]}
</plan>

If there is nothing to work on (empty list, or only un-workable PRD/meta issues),
emit an empty array: `<plan>{"issues": []}</plan>`.

Do not write code, make commits, push, or edit the issues. When done, output
`<promise>COMPLETE</promise>`.
