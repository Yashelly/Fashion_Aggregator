# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Weft: a pre-affiliate Next.js (App Router) fashion discovery/search MVP for Lithuanian shoppers. It is a **synthetic demo product**, not a live shopping site — see "Demo-data boundary" below before touching product data, store names, or purchase flows.

## Commands

```bash
npm install
npm run dev          # next dev
npm run build        # next build
npm run start        # next start
npm run lint         # tsc --noEmit (there is no separate ESLint script)
npm run typecheck    # tsc --noEmit (same as lint)
```

Locale regression suite (Python Playwright, requires the dev server running):

```bash
BASE_URL=http://127.0.0.1:3000 npm run test:locale
```

This runs `scripts/locale_e2e.py`, covering EN/LT switching, cookie/query precedence, every public route, internal links, search filters, mobile/desktop layouts, browser history, and `/out` success/404 behavior. It writes a JSON report to `.omx/artifacts/qa/locale-summary.json`. There is no other automated test suite — verify changes with `npm run build` + this script + manual browser check.

## Demo-data boundary (critical, cross-cutting rule)

This is the single most important constraint in the codebase and shows up in code, copy, and data:

- **No live retailer catalog.** All products come from `data/mock_products.csv`, filtered to rows where `source_status === "mock_not_live"`. Only synthetic/demo products may ever render publicly.
- **Public store identity is decoupled from internal retailer identity.** `data/store_tracker.csv` holds real retailer slugs (`store_slug`, `source_status`); `lib/demo-stores.ts` maps each internal slug to one of 6 neutral public IDs (`demo-store-01`…`demo-store-06`) via a stable hash (`stableStoreIndex`). Public UI, URLs, and search filters must only ever use the public `demo-store-NN` IDs/labels — never internal retailer slugs or names.
- **`/out/:productId` never redirects to a merchant.** It renders an onsite synthetic-preview guard for a valid mock product (404 for unknown IDs) and posts a click-intent analytics event; it does not perform an external redirect. Real redirects require an approved affiliate feed plus destination HTTPS/host/affiliate-rule validation — do not add one without that context.
- Stores with `source_status: market_suspended` in `store_tracker.csv` are excluded from the public store list entirely (see `data/store_tracker.csv`, e.g. Factcool LT).
- Copy conventions (see `lib/i18n.ts` / `DESIGN.md`): use "demo parduotuvė"/"Store NN" style neutral labels; never expose network/application/feed/approval status, commission, or retailer branding in shopper-facing copy.

When in doubt about whether something counts as "real retailer data," treat it as in-scope for this rule and check `DESIGN.md` and `README.md` first.

## Architecture

- **App Router pages** (`app/**/page.tsx`) are server components. Locale-aware pages take `searchParams` as a `Promise` (Next 16 convention) and pass it through `lib/i18n.ts` helpers.
- **i18n**: two locales (`en` default, `lt`), selected via a `lang` query param and persisted through a `weft-locale` cookie (not shown in `lib/i18n.ts` itself — cookie handling lives in the layout/middleware). `lib/i18n.ts` centralizes all UI copy in one large `copy` object plus label formatters (`formatCategoryLabel`, `formatColorLabel`, etc.) and a `withLocale(href, locale)` helper for building locale-preserving links. Add new UI strings there under both `en` and `lt`, not inline in components.
- **Product data** (`lib/mock-products.ts`): reads and hand-parses `data/mock_products.csv` at request time (no DB dependency for the base catalog), joins each product to a public demo store via `lib/demo-stores.ts`, and resolves local image paths under `public/demo-products/` (falling back gracefully — `image_available`/`detail_image_available` flags — when a demo image file is missing). `filterProducts`/`sortProducts` implement search (including an EN/LT synonym table and `under N` / `iki N` price parsing) and sorting; these are pure functions over the in-memory product array, called from `app/search/page.tsx`.
- **Supabase** (`lib/supabase.ts` browser client, `lib/supabase-server.ts` admin client): both are optional — analytics/persistence degrade gracefully when env vars are absent. `lib/supabase-server.ts` uses the service-role key and is guarded by `import "server-only"`; never import it from client components, and never give the service-role key a `NEXT_PUBLIC_` prefix.
- **Analytics** (`lib/analytics.ts`, `lib/analytics-storage.ts`, `app/api/analytics/{search,click}/route.ts`): server-side HTTPS capture to PostHog via `captureAnalyticsEvent`, keyed by an anonymous ID (`createAnonymousId`/`normalizeAnonymousId`). `POST /api/analytics/search` records search events; `POST /api/analytics/click` is called by the `/out/:productId` guard after render, validates same-origin (`lib/request-security.ts`) and the product ID, reads correlation only from HttpOnly cookies, and returns `202` without blocking navigation. Both endpoints are no-ops (return a "disabled" status) when `POSTHOG_PROJECT_API_KEY` is unset.
- **SQL** (`sql/00N_*.sql`): incremental schema/hardening migrations for the pre-affiliate schema and the synthetic-click analytics boundary. Apply in numeric order; there's no migration runner wired up in this repo.

## Environment

Copy `.env.example` to `.env.local`. All listed services are optional — the app runs without them:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
POSTHOG_PROJECT_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. `SUPABASE_URL` is preferred server-side; `lib/supabase-server.ts` falls back to `NEXT_PUBLIC_SUPABASE_URL` if unset. `POSTHOG_PROJECT_API_KEY` is a project key for server-side HTTPS capture, not a personal API key.

## Design contract

`DESIGN.md` is the authoritative source-of-truth for brand, IA, visual language, accessibility (WCAG 2.2 AA target), responsive breakpoints, and content voice — read it before UI/copy changes. Key non-negotiables repeated there: no real retailer names/photos/logos/trademarks, no checkout/cart, theme is CSS custom properties in `app/globals.css` with light/dark token maps (dark mode: espresso-charcoal; light: warm paper/ink), fonts are Syne (display) + IBM Plex Sans (body), and `prefers-reduced-motion` must disable meaningful animation.

## Authentication

There is no authentication or authorization in this codebase. No `middleware.ts`,
no session/JWT handling, no Supabase Auth usage. `/account` is a client-only UI
mock persisted to `localStorage` — it does not represent a real user account.
Supabase's service-role key is used exclusively for anonymous analytics writes
(`search_events`, `outbound_clicks`); RLS on every table grants access only to
`service_role`, blocking `anon`/`authenticated` entirely.

## CI/CD and deployment

No CI pipeline is configured in this repo (no `.github/workflows`) and there is
no Dockerfile. Verification before merging is manual: `npm run build` +
`npm run test:locale`. Deployment history shows Vercel usage (local `.vercel/`
artifacts, gitignored) and a reverted "Sites deployment integration" — check
recent commits before assuming a particular deploy path is active.

## Documentation map

Besides this file and `DESIGN.md`, the repo has a hierarchical `AGENTS.md` set
(root + `app/`, `app/api/`, `app/api/analytics/`, `app/out/[productId]/`,
`app/search/`, `components/`, `lib/`, `data/`, `docs/`, `docs/legal/`, `public/`,
`scripts/`, `sql/`), generated by the deepinit skill. Each nests
`<!-- Parent: ... -->` back up the tree. The repo root `AGENTS.md` also contains
OMX/Codex CLI tooling config above the project-documentation section — don't
confuse the two when editing.
