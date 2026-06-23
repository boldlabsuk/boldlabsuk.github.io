# BOLD Website

Static Vite/React prototype for BOLD Lab, a unified AI research lab
in England formed from three university AI labs.

## Routes

- `/` - homepage and hero landing page
- `/people` - people directory
- `/people/[slug]` - optional person profile pages
- `/opportunities` - join, visit, collaborate, and contact routes

News and papers modules/content are retained in `src`, but those routes are not
enabled for the launch site.

The Vercel rewrite in `vercel.json` serves the app shell for direct route visits.

## Local Development

```bash
npm install
npm run dev
```

## Feature Flags

The home logo scroll animation is enabled by default when
`VITE_HOME_LOGO_ANIMATION` is omitted. Build with the previous static hero logo
and navbar reveal behavior by setting the flag to `false`:

```bash
VITE_HOME_LOGO_ANIMATION=false npm run build
```

## Profile Cropping

```bash
npm run profile-cropper
npm run profile-cropper -- --source-dir path/to/replacement-photos
```

The cropper opens a local browser UI for manual square crops. Full roster mode
loads the Website Roster sources. `--source-dir` mode loads only the images in
that folder, matches them to known people by filename/name/slug when possible,
and writes the cropped outputs to `public/profile-assets/`.

## Checks

```bash
npm test
npm run lint
npm run build
```

Structured placeholder content is split under `src/content`; route-aware page
and module code is split across `src/app`, `src/features`, `src/domain`, and
`src/ui`.
