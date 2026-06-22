# BOLD Website Coding Standards

## Repository Guidance

Before editing, read `AGENTS.md`, `CONTEXT.md`, and the relevant files under `docs/agents/`. Use the domain language from `CONTEXT.md`: Person, People Section, Person Listing, and Primary Person Link.

## Checks

Use small, behavior-focused changes and run the repository checks before committing:

1. `npm run lint`
2. `npm run test`
3. `npm run build`

## Testing

Tests should verify behavior through public interfaces, not implementation details. Prefer integration-style tests that exercise real exported data, route behavior, or rendered user-facing outcomes. Do not mock internal modules just to assert how work is done.

For content changes, test the externally visible contract: navigation labels and links, structured content availability, date formats, Person Listing behavior, and Primary Person Link fallback behavior.

## Implementation

Keep modules deep: small public interfaces with implementation detail hidden behind them. Use the existing React/Vite/TypeScript patterns before introducing new abstractions. Add an abstraction only when it removes real duplication or gives callers a simpler interface.

Preserve static-site behavior. Do not add server-only dependencies, runtime network calls, or new routing infrastructure unless the issue explicitly requires it.

## Frontend Quality

Build UI that is dense, clear, and easy to scan. Match existing visual conventions in `src/App.css` and `src/index.css`. Text should fit at mobile and desktop widths, controls should have stable dimensions, and repeated layouts should stay consistent across People, News, Papers, and Opportunities pages.
