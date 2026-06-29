# BOLD Website

Static Vite and React website for BOLD, a unified AI research lab in England
formed from three university AI labs.

## Getting Started

Install dependencies once:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Vite prints the local URL after the server starts, usually
`http://localhost:5173/`.

## Useful Commands

```bash
npm run dev      # start the local development server
npm test         # run the node test suite
npm run lint     # run ESLint
npm run build    # type-check, build, and generate static routes
npm run preview  # preview the production build locally
```

## Routes

- `/` - homepage and hero landing page
- `/people` - people directory
- `/people/[slug]` - optional person profile pages
- `/opportunities` - join, visit, collaborate, and contact routes

News and papers modules/content are retained in `src`, but those routes are not
enabled for the launch site.

## Deployment

Deployment is handled by `.github/workflows/deploy.yml`, which builds the site
and publishes `dist` to GitHub Pages.

The workflow has a deploy-job guard so only these GitHub actors can start or
rerun the Pages deployment from the current workflow definition:

- `ravihammond`
- the current repository owner, via `github.repository_owner`

Other collaborators can still commit, push, create branches, and submit pull
requests. If another user pushes to `main` or manually starts the deploy
workflow, the deploy job is skipped and no GitHub Pages deployment is created.

This workflow guard is not a substitute for repository-level protection: a user
with direct permission to change workflow files on `main` could edit the guard.
GitHub repository settings should also protect the `github-pages` environment
with `ravihammond` and `boldlabsuk` as required reviewers, admin bypass disabled
for strict enforcement, and deployment branches limited to `main`.

## Project Structure

- `src/app` - application shell and document metadata
- `src/features` - route-level feature pages
- `src/ui` - shared layout, cards, forms, and primitive components
- `src/content` - structured site content
- `src/domain` - domain types and content shaping
- `public` - static assets served directly
- `scripts` - build and maintenance scripts

The GitHub Pages workflow publishes the Vite build output from `dist`. The
Vercel rewrite in `vercel.json` is retained for hosting environments that need
all direct route visits to serve `index.html`.

## Profile Cropping

```bash
npm run profile-cropper
npm run profile-cropper -- --source-dir path/to/replacement-photos
```

The cropper opens a local browser UI for manual square crops. Full roster mode
loads the Website Roster sources. `--source-dir` mode loads only the images in
that folder, matches them to known people by filename/name/slug when possible,
and writes the cropped outputs to `public/profile-assets/`.
