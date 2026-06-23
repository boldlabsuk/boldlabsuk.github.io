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

## Checks

```bash
npm test
npm run lint
npm run build
```

Structured placeholder content is split under `src/content`; route-aware page
and module code is split across `src/app`, `src/features`, `src/domain`, and
`src/ui`.
