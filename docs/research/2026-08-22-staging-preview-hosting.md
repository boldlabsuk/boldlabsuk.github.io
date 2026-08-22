# Staging and branch-preview hosting for the BOLD website

Date: 2026-08-22

## Recommendation

Keep `bold-lab.ai` on its existing GitHub Pages deployment and connect the same
GitHub repository to **Cloudflare Pages for previews only**. Use a permanent
`staging` branch. Each push to that branch will update a stable public address
such as `https://staging.<project>.pages.dev`, while each deployment also keeps
an immutable hash URL. Cloudflare automatically marks preview deployments
`noindex`, reducing duplicate-content risk. This provides the requested branch
workflow without allowing a staging deployment to replace the live site.

For this React/Vite repository, Cloudflare's documented settings match the
existing build exactly:

- Production branch: `main`
- Preview branch control: include `staging` (and optionally feature branches)
- Build command: `npm run build`
- Output directory: `dist`

Cloudflare can deploy every push from a connected GitHub repository and can
restrict automatic preview builds to named branches. Its React/Vite preset is
`npm run build` with `dist` output. See Cloudflare's
[GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/),
[branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/),
[build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/),
and [preview URL behavior](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

Do not move `bold-lab.ai` to Cloudflare as part of this supervisor-review
setup. The separate `pages.dev` preview can coexist with the unchanged GitHub
Pages production deployment.

If a polished address such as `staging.bold-lab.ai` is wanted later, Cloudflare
can map a custom domain to a particular branch, but its documented method
requires that DNS record to be proxied by Cloudflare. See
[custom branch aliases](https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/).

## Architecture decision: split now, consolidate deliberately later

**Decision: GitHub Pages production plus Cloudflare Pages staging is the safest
choice now. It is a reasonable transitional workflow, not a bad architecture.
Both environments on Cloudflare would be the cleanest long-term setup if
previews become a permanent part of the release process. Trying to put both in
this GitHub Pages repository is the poorest fit.**

### Safest now: keep production on GitHub Pages

The current GitHub Actions workflow is already a narrow, proven production
path: only a push to `main` (or a manual dispatch) runs the checks and publishes
`dist` to the repository's `github-pages` environment. Leaving it and the
`bold-lab.ai` DNS configuration untouched avoids turning a request for a review
URL into a production-hosting migration.

Cloudflare can independently build the review branch with the same application
contract: `npm run build` produces `dist`. Its Git integration isolates preview
deployments from the production deployment and maintains a stable
`<branch>.<project>.pages.dev` alias. Restrict Cloudflare's custom preview branch
control to `staging` (or the present review branch) so unrelated branches do not
publish. Cloudflare documents both the
[isolated, stable branch aliases](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-aliases)
and [named-branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/#custom-preview-branch-control).

### Cost of the split-host workflow

The tradeoff is operational duplication. GitHub and Cloudflare have separate
build environments, settings, logs, environment variables, routing behavior,
and access controls. Even with the same build command, they perform separate
builds rather than promoting one already-tested artifact, so “works on staging”
does not prove that the later GitHub Pages deployment will be byte-for-byte
identical. This is an architectural inference from the two independent build
pipelines. Pinning a Node version in the repository would reduce one source of
drift; Cloudflare explicitly supports `.node-version`, `.nvmrc`, or
`NODE_VERSION` for this purpose in its
[build-image documentation](https://developers.cloudflare.com/pages/configuration/build-image/#override-default-versions).

There is also a second public origin to manage. Cloudflare automatically
creates `<project>.pages.dev` for the Cloudflare production branch, in addition
to the desired preview URLs. Cloudflare's preview deployments are `noindex` by
default because they duplicate production content, but that guarantee applies
to previews, not to the root production URL. For the temporary split setup:

- do not attach `bold-lab.ai` to Cloudflare or share the root
  `<project>.pages.dev` URL;
- limit preview builds to the review branch;
- after the project is initialized, disable automatic production-branch
  deployments in Cloudflare if the project is only being used for previews;
- if the split becomes permanent, either redirect the exact root
  `<project>.pages.dev` hostname to `bold-lab.ai` without catching preview
  subdomains, or consolidate production onto Cloudflare.

Cloudflare documents the switch for
[disabling automatic production deployments](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments)
and its reason for
[redirecting the generated production URL](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/):
serving the content only from the intended custom domain. Disabling future
production builds does not erase the initial root deployment, so it is not by
itself a duplicate-origin cleanup.

### Why not put both environments on GitHub Pages?

GitHub permits a maximum of one Pages site per repository. A branch is only a
publishing source for that one site; it does not receive its own independent
Pages target or URL. Therefore this repository cannot natively map `main` to
`bold-lab.ai` and `staging` to another independently deployed Pages site. The
GitHub-only alternatives—a second repository with cross-repository automation,
or rebuilding both versions into one `/staging` artifact—add more coupling and
complexity than Cloudflare's native preview branch. See GitHub's
[one-site-per-repository limit](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#types-of-github-pages-sites)
and [single publishing-source model](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### Cleanest long term: put both environments on Cloudflare

If branch previews become routine, one Cloudflare Pages project is the simpler
steady state: `main` is production, `staging` and feature branches are previews,
and both use the same provider, build image, settings, logs, and Git integration.
Cloudflare's production and preview URLs are designed for exactly that model,
and `bold-lab.ai` can be attached as the production custom domain. The generated
root `pages.dev` URL should then be redirected to the custom domain so only one
production origin is promoted.

That consolidation should be a separate planned migration after the supervisor
has approved the preview. It changes the live hosting and DNS path without
improving the immediate review link. If previews remain occasional and the two
sets of settings are documented and kept aligned, the split-host arrangement is
also acceptable indefinitely.

## Which GitHub user should authorize Cloudflare?

**For the current GitHub screen, select `boldlabsuk`, not `ravihammond`.** Click
**Select** next to `boldlabsuk` (or **Continue** if `boldlabsuk` is already the
selected identity). If that account is not available, choose **Use a different
account** and have the `boldlabsuk` account owner sign in and complete this
step.

This recommendation is based on a read-only GitHub API inspection:

```text
repository owner: boldlabsuk
owner account type: User (personal account, not an organization)
ravihammond repository role: write
ravihammond admin permission: false
```

The distinction matters because the
[Cloudflare Workers and Pages integration is a GitHub App](https://github.com/apps/cloudflare-workers-and-pages),
and GitHub treats **authorization** and **installation** as separate grants:

- Authorizing selects the individual GitHub user identity and lets the app act
  on that user's behalf.
- Installing grants the app access to resources owned by a personal account or
  organization and selects the repositories it may access.
- GitHub explicitly allows authorization without installation, so authorizing
  as `ravihammond` does not by itself install Cloudflare on resources owned by
  `boldlabsuk`.

See GitHub's official
[installation-versus-authorization explanation](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party#difference-between-installation-and-authorization).
The “Select user to authorize” page is therefore an identity picker, not a
statement that every repository visible to that user can be added to the app's
installation.

GitHub documents that a repository owned by a personal account has only an
owner and collaborators. The owner has full control; collaborators have write
access but do not become the owning personal account. See
[personal-repository permission levels](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository).
GitHub's app-installation documentation says users install apps on their own
personal account. The repository-admin exception described by GitHub applies
to repositories owned by **organizations**, not to a collaborator on someone
else's personal-account repository. Therefore Ravi's current write access is
not enough to install Cloudflare on the `boldlabsuk` account.

After selecting or signing in as `boldlabsuk`, use this sequence:

1. Choose **Only select repositories**.
2. Select `boldlabsuk.github.io`.
3. Review the requested permissions.
4. Choose **Install & Authorize** and return to Cloudflare.

This follows Cloudflare's documented **+ Add account → select GitHub account →
Install & Authorize** flow. Cloudflare also recommends limiting its GitHub App
to only the repositories it needs. See Cloudflare's
[GitHub integration access guidance](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#manage-access).

The Cloudflare login and GitHub installation owner are different concepts. Ravi
can remain the person operating the Cloudflare dashboard, provided he has the
necessary Cloudflare-account permissions, while the GitHub step is completed
as `boldlabsuk`. If Cloudflare Workers and Pages is already installed on
`boldlabsuk` with this repository selected, use that existing GitHub connection
rather than creating an installation under `ravihammond`.

If the repository were organization-owned, the rule would be different:
organization owners can install GitHub Apps; eligible repository admins may be
able to install one for only repositories they administer when the app's
requested permissions and organization policy allow it; otherwise a member or
outside collaborator can request owner approval. GitHub's current docs also
state that the GitHub App Manager role alone does not grant installation
authority. In this case the live GitHub App registration for
[Cloudflare Workers and Pages](https://api.github.com/apps/cloudflare-workers-and-pages)
requests repository `administration: write`, so even GitHub's conditional
organization-repository-admin installation exception would not apply; an
organization owner would need to install or approve it. See
[requirements to install a third-party GitHub App](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party#requirements-to-install-a-github-app).
Those organization rules do not apply here because GitHub reports
`boldlabsuk` as a personal `User` account.

## Direct answers about GitHub Pages

### Can this repository map `main` to production and `staging` to another URL?

Not natively. GitHub documents a maximum of one Pages site per repository, and
the branch-based Pages setting selects one branch and either its root or
`/docs` folder as the site's publishing source. A custom Actions workflow can
choose what it builds, but it still uploads and deploys one Pages artifact to
that repository's one Pages site. This means another workflow invoking
`actions/deploy-pages` from `staging` would update the same Pages target rather
than create a second one. This conclusion follows from GitHub's
[site-type and site-limit table](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[single publishing-source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
and [custom workflow model](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

GitHub's own `actions/deploy-pages` repository exposes a `preview` input, but
explicitly says the feature is alpha and unavailable to the public. GitHub
Pages therefore does not currently provide the branch/PR preview URLs supplied
by dedicated preview hosts. See the official
[`deploy-pages` inputs](https://github.com/actions/deploy-pages#inputs-).

### Could the existing site publish a `/staging` directory?

Technically yes, but it is not an independent staging deployment. A custom
workflow would need to check out and build both `main` and `staging`, combine
the results into one artifact (production at `/`, preview at `/staging`), and
redeploy that whole artifact after either branch changes. A staging push would
therefore redeploy the production Pages site as well. It would also require
base-path changes because this Vite app currently builds for `/` and uses
root-relative asset and route URLs. This is avoidable coupling and is not
recommended.

### Could a second GitHub repository provide `/staging`?

Yes. GitHub project sites default to
`https://<owner>.github.io/<repository>/`, so a second repository owned by
`boldlabsuk` and named `staging` can have its own Pages site. Because the BOLD
user site has the custom domain `bold-lab.ai`, GitHub says that domain is
inherited by project sites by default; a `staging` project site would therefore
normally be served at `https://bold-lab.ai/staging/`. See GitHub's
[project-site URL rules](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
and [custom-domain inheritance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).

This is independent and GitHub-only, but GitHub cannot directly make that
second repository's Pages site follow a branch in this repository. Automatic
updates would require cross-repository mirroring or dispatch credentials, and
the app would still need `/staging/` base-path support. A custom subdomain such
as `staging.bold-lab.ai` would avoid the app's subpath problem but not the
cross-repository automation. This option is reasonable only if using GitHub
exclusively is more important than setup simplicity.

## Current repository deployment

A read-only Pages API inspection on 2026-08-22 returned:

```text
repository: boldlabsuk/boldlabsuk.github.io
build_type: workflow
custom domain: bold-lab.ai
source branch: main
HTTPS enforced: true
```

A live header check also confirmed that `https://boldlabsuk.github.io/`
redirects to `https://bold-lab.ai/`; the `github.io` address is not a separate
copy of the site.

The checked-in [deployment workflow](../../.github/workflows/deploy.yml)
confirms that only pushes to `main` trigger a build and that the `dist`
directory is uploaded to the single `github-pages` environment. It also has an
actor guard. The [README](../../README.md) recommends limiting that environment
to deployments from `main`. The current feature branch therefore cannot affect
production unless it is merged into `main` or the production workflow/settings
are deliberately changed.

The app is a static Vite/React build. [Vite's configuration](../../vite.config.ts)
uses the default root base path, while the generated HTML and route data contain
root-relative URLs. This is why a host-level preview domain is simpler than a
GitHub Pages `/staging/` subdirectory.

## Other good preview hosts

### ChatGPT Sites

Yes, ChatGPT can provide a hosted, shareable URL for a compatible existing
project through Sites. However, Sites is a separate save-and-deploy workflow,
not a GitHub branch integration: it can associate a saved version with the Git
commit used for a local build, but pushing a branch does not itself update the
Site. The official documentation also describes every Sites deployment URL as
a production deployment. Sites is therefore useful for a one-off review link,
but it does not satisfy the requested ongoing `staging`-branch workflow as well
as a branch-preview host. See the official OpenAI documentation for
[ChatGPT Sites](https://learn.chatgpt.com/docs/sites).

### Vercel

Vercel automatically deploys every non-production branch as a preview. Its
branch URL always follows the newest deployment from that branch, while commit
URLs remain fixed. Generated URLs are public by default, and Vercel adds
`X-Robots-Tag: noindex` to previews. This repository already contains a
[Vercel route fallback](../../vercel.json), so Vercel is a very close second
choice and may be the least work if a Vercel account/project already exists.
See Vercel's [Git deployment model](https://vercel.com/docs/git),
[stable branch URL format](https://vercel.com/docs/deployments/generated-urls),
and [preview response headers](https://vercel.com/docs/headers/response-headers).

### Netlify

Netlify's **branch deploys** provide a stable URL that updates on pushes to a
named branch; its **Deploy Previews** track pull requests. Preview links are
shareable with anyone unless access protection is enabled. Branch deploys must
be enabled in the project settings. See Netlify's
[deploy overview](https://docs.netlify.com/deploy/deploy-overview/) and
[branch-domain behavior](https://docs.netlify.com/manage/domains/manage-domains/manage-domains-for-branch-deploys/).

## Suggested branch workflow

1. Keep `main` as production; its existing workflow remains the only process
   that deploys `bold-lab.ai`.
2. Create a permanent `staging` branch from the approved production baseline.
3. Merge changes intended for review into `staging` and push it.
4. Share the stable Cloudflare branch alias with the supervisor.
5. After approval, merge the reviewed commits into `main`; the existing GitHub
   Pages workflow deploys them to production.

For the current one-off review, Cloudflare can also deploy the already-pushed
`homepage-supervisor-brief` branch directly. A permanent short `staging` branch
is preferable for a reusable, easy-to-read URL.

## Decision summary

| Option | Stable branch URL | Production isolation | Repository changes | Assessment |
| --- | --- | --- | --- | --- |
| Cloudflare Pages preview | Yes | Yes | Usually none | Recommended |
| Cloudflare production and previews | Yes | Yes | Hosting/DNS migration | Cleanest long term; migrate separately |
| Vercel preview | Yes | Yes | Existing config is ready | Strong alternative |
| Netlify branch deploy | Yes | Yes | Usually none | Strong alternative |
| ChatGPT Sites | Yes | Yes | Separate save/deploy and compatibility check | Good one-off, not branch automation |
| Second GitHub Pages repo | Yes | Yes | Cross-repo automation and base-path work | Use only for GitHub-only requirement |
| `/staging` in current Pages artifact | Yes | No | Substantial workflow/base-path work | Avoid |
| Second branch deployed by current `deploy-pages` workflow | No separate site | No | Workflow change | Does not satisfy the requirement |
