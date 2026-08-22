## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues on `boldlabsuk/boldlabsuk.github.io`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repo uses the default mattpocock/skills triage label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain-doc layout. See `docs/agents/domain.md`.

### Deployment branches

- `dev` is the working and integration branch. Start routine website work here.
- `staging` is the supervisor-review branch. Pushing it updates
  `https://staging.bold-lab-preview.pages.dev` through Cloudflare Pages.
- `main` is the production branch. Pushing it updates `https://bold-lab.ai`
  through GitHub Pages.

Promote changes in one direction: `dev` to `staging`, then `staging` to `main`.
Do not promote `dev` directly to `main`.
