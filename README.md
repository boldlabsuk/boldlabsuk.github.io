# BOLD Website

Static prototype for BOLD, the British Open-Ended Learning & Discovery AI lab.

The site is intentionally public and static: no login, no backend, and no private data. It presents the lab mission, research pillars, student researcher profiles, blog-style updates, and a publication index.

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

The content model lives in `src/content.ts`; the React shell consumes that model in `src/App.tsx`.
