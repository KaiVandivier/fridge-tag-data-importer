# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm@10.13.1** (the README's `yarn` references are stale — use `pnpm`).

- `pnpm start` — dev server on http://localhost:3000 (via `d2-app-scripts start`, which wraps Vite)
- `pnpm build` — production build to `build/`; deployable zip at `build/bundle/`
- `pnpm test` — Jest test runner (via `d2-app-scripts test`)
- `pnpm lint` — runs `eslint` then `prettier -c .`
- `pnpm format` — `prettier . -w`
- `pnpm deploy` — deploy `build/` to a running DHIS2 instance (requires prior `pnpm build`)

There are no tests in `src/` yet; running a single test is `pnpm test <pattern>` once tests exist.

## Architecture

This is a **DHIS2 custom application** built on the DHIS2 App Platform (`@dhis2/cli-app-scripts`). It parses Berlinger Fridge-tag temperature report `.txt` files client-side and displays them; there is no backend persistence yet. See the `dhis2-app-development` skill in [.claude/skills/](.claude/skills/) for platform conventions — invoke it for anything DHIS2-specific.

### Entry point and runtime

- [d2.config.js](d2.config.js) declares the app to the platform (`entryPoints.app` → [src/App.tsx](src/App.tsx), `minDHIS2Version: 2.41`). `d2-app-scripts` reads this config — there is no standalone `vite.config.*`; Vite is extended via [viteConfigExtensions.mts](viteConfigExtensions.mts), which defines the `@/*` → `src/*` alias mirrored in [tsconfig.json](tsconfig.json).
- [src/App.tsx](src/App.tsx) wires the three top-level providers: `QueryClientProvider` (TanStack Query v4), `CssReset`/`CssVariables` from `@dhis2/ui`, and a **hash router** (`createHashRouter`) — hash routing is required when the app runs inside the DHIS2 Global Shell.

### Global Shell URL sync

[src/utils/SyncUrlWithGlobalShell.tsx](src/utils/SyncUrlWithGlobalShell.tsx) is the outermost route element. React Router v6+ no longer fires `popstate` on `pushState`/`replaceState`, but the DHIS2 Global Shell listens for `popstate` to keep the browser URL in sync. This component dispatches a synthetic `popstate` on every route change — don't remove it or the embedded URL will desync.

### Data fetching pattern

[src/utils/useApiDataQuery.ts](src/utils/useApiDataQuery.ts) wraps `useDataEngine()` from `@dhis2/app-runtime` with TanStack Query's `useQuery`. Use this hook (not `useDataQuery` directly) so queries get caching, retry, and devtools for free. Pass a `ResourceQuery` (see [src/interfaces/apiQueryTypes.ts](src/interfaces/apiQueryTypes.ts)) plus a `queryKey`.

### Layout and routing

- [src/components/layout/Layout.tsx](src/components/layout/Layout.tsx) renders a `Sidebar` + `<main>` with `<Outlet />`. It reads `RouteHandle` from `useMatches()` — set `handle: { collapseSidebar: true }` on a route to auto-collapse the sidebar for that page.
- Pages live under [src/pages/](src/pages/); reusable widget pieces under [src/components/](src/components/). The `Widget` component dispatches to `WidgetCollapsible` or `WidgetNonCollapsible` based on the `noncollapsible` prop.

### Fridge-tag parser

[src/utils/fridgeTagParser.js](src/utils/fridgeTagParser.js) and [src/utils/keys.js](src/utils/keys.js) are **vendored JS** (not TS) and are explicitly ignored in [eslint.config.mjs](eslint.config.mjs). Don't reformat or "convert to TS" these files casually. The typed surface is [src/utils/parseFridgeTagFile.ts](src/utils/parseFridgeTagFile.ts), which wraps the parser and casts to [`FridgeTagReport`](src/types/fridgeTag.ts) — keep that type in sync with the parser's actual output.

### i18n

Strings are wrapped in `i18n.t(...)` from `@dhis2/d2-i18n`. The `src/locales/` directory is generated and gitignored — `d2-app-scripts` regenerates it during dev/build. Don't hand-edit translation files.

### Styling

CSS Modules (`*.module.css`) typed via [types/modules.d.ts](types/modules.d.ts). Prefer `@dhis2/ui` components and the design tokens exposed by `<CssVariables />` over custom CSS.
