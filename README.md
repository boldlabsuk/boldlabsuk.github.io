# BOLD Website

Static Vite/React prototype for BOLD Institute, a unified AI research institute
in England formed from three university AI labs.

## Routes

- `/` - homepage and hero landing page
- `/people` - people directory
- `/people/[slug]` - optional person profile pages
- `/news` - news, articles, announcements, and research updates
- `/news/[slug]` - individual news posts
- `/papers` - publication and research output archive
- `/opportunities` - join, visit, collaborate, and contact routes

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

Structured placeholder content lives in `src/content.ts`; route-aware page and
component code lives in `src/App.tsx`.
