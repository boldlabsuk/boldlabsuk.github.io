# Task

Merge the following branches into the current branch:

{{BRANCHES}}

Read `AGENTS.md`, `CONTEXT.md`, and relevant files under `docs/agents/` before
resolving conflicts.

For each branch:

1. Run `git merge <branch> --no-ff --no-edit`.
2. If there are merge conflicts, resolve them by reading both sides and choosing
   the correct result for this repository.
3. Run `npm run lint`, `npm run test`, and `npm run build`.
4. If a check fails, fix the issue before proceeding to the next branch.

After all branches are merged, run `npm run lint`, `npm run test`, and
`npm run build` again. Make a single local commit summarizing the merge only
after those checks pass.

# Close Issues

Only after all merged work passes verification, close each completed issue with
a concise comment.

Issues:

{{ISSUES}}

Do not push. Once complete, output `<promise>COMPLETE</promise>`.
