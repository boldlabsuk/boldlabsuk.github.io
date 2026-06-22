# TASK

Merge the following branches into the current branch:

{{BRANCHES}}

For each branch:

1. Run `git merge <branch> --no-ff --no-edit`
2. If there are merge conflicts, resolve them intelligently by reading both sides and choosing the correct resolution.
3. After resolving conflicts, verify with the smallest relevant `uv run pytest` scope for the merged code, plus `uv run python -m compileall -q src tests` if Python changed. Do not run the recursive `h_group` test targets or full training/W&B jobs.
4. If tests fail, fix the issues before proceeding to the next branch.

After all branches are merged, make a single commit summarizing the merge. Do not push — the work stays local and is reviewed and pushed by hand once the whole PRD is complete.

# CLOSE ISSUES

For each branch that was merged, close its issue. If there are any parent issues (such as PRDs) which closing the issue would complete, close those too.

Here are all the issues:

{{ISSUES}}

Once you've merged everything you can, output <promise>COMPLETE</promise>.
