# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues in `boldlabsuk/boldlabsuk.github.io`. Use the `gh` CLI for all operations.

## Repository

- Owner/repo: `boldlabsuk/boldlabsuk.github.io`
- URL: `https://github.com/boldlabsuk/boldlabsuk.github.io`
- Issues are enabled on this repository.

When running inside this clone, `gh` can infer the repo from `origin`. When running outside this clone, pass `-R boldlabsuk/boldlabsuk.github.io`.

## Conventions

- **Create an issue**: `gh issue create -R boldlabsuk/boldlabsuk.github.io --title "..." --body "..."`
- **Read an issue**: `gh issue view <number> -R boldlabsuk/boldlabsuk.github.io --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list -R boldlabsuk/boldlabsuk.github.io --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> -R boldlabsuk/boldlabsuk.github.io --body "..."`
- **Apply / remove labels**: `gh issue edit <number> -R boldlabsuk/boldlabsuk.github.io --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> -R boldlabsuk/boldlabsuk.github.io --comment "..."`

## When a skill says "publish to the issue tracker"

Create a GitHub issue in `boldlabsuk/boldlabsuk.github.io`.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> -R boldlabsuk/boldlabsuk.github.io --comments`.
