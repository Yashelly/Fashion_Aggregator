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
npm run test:unit    # node --test — search-engine invariants
```

Full-stack HTTP integration smoke (needs a production build; boots `next start`
on port 3111 itself, then tears it down):

```bash
npm run build && npm run test:integration
```

`scripts/integration-smoke.mjs` asserts the frontend/backend boundary — search
rendering real results, the `/out/:id` guard (200 valid / 404 unknown), and the
`/api/analytics/click` security contract (202 same-origin, 403 cross-origin, 404
unknown product, 413 oversized). It is a pre-merge check, not a required CI gate.

Locale regression suite (Python Playwright, requires the dev server running):

```bash
BASE_URL=http://127.0.0.1:3000 npm run test:locale
```

This runs `scripts/locale_e2e.py`, covering EN/LT switching, cookie/query precedence, every public route, internal links, search filters, mobile/desktop layouts, browser history, and `/out` success/404 behavior. It writes a JSON report to `.omx/artifacts/qa/locale-summary.json`.

Search relevance suites (no server needed):

```bash
npm run test:search        # DEV + REGRESSION only; routine CI gate
npm run eval:cloud         # cloud embedding bake-off; DEV + REGRESSION only
npm run eval:consumed      # verbose inspected 200-case historical regression
npm run eval:historical:v2 # hash-verified old v2 first-run report
npm run eval:blind         # verify/display immutable final blind v3 first run
npm run eval:blind:validate # validate v3 structure and sealed hashes
npm run search:doctor      # live public-index + privileged-connection checks, no secrets
npm run search:migrate     # apply sql/004 using SUPABASE_DB_URL
npm run search:index       # refresh the Supabase pgvector index
npm run search:probe:production # verify the live hybrid path with synthetic probes
npm run feed:dry-run       # validate the committed synthetic feed; no DB writes
npm run feed:import -- ... # generic CSV/TSV/JSON/XML importer; dry-run by default
npm run feed:operate       # protected env-driven production feed entry point
npm run test:feed:postgres # destructive only to dedicated local weft_test DB; CI supplies it
npm run catalog:seed:demo  # validate the 64-product Supabase demo seed; add -- --apply to write
npm run test:catalog:postgres # RLS/read-model checks; runs after feed DB test
```

`scripts/search-queries.mjs` contains DEV (44, tuning allowed), REGRESSION (48,
already inspected), and an immutable 18-case historical blind set. The former
200-case final set in `scripts/final-blind-queries.mjs` was consumed after its
first run and is now inspected regression data. The replacement 200-case v2 set
in `scripts/final-blind-v2-queries.mjs` was clean-room authored, separately
catalog-reviewed, sealed on 2026-09-08, and first scored on 2026-09-09 at
105/200 (52.5%). Its inputs and report are hash-pinned. A positive
case passes at precision@k ≥ 0.6 (`k = min(5, relevant)`), with every `mustRank`
item placed, no result-cap breach, and no declared forbidden product in the top
window; final-blind negatives require zero results. V2 was later consumed when
its inspected failures informed the cloud architecture. Final blind v3 was then
authored independently, structurally validated, and SHA-256 sealed before any
retrieval or judge output. Its one authorised first run on 2026-09-10 scored
195/200 (97.5%); the report and production/evaluator fingerprints are immutable.
Only DEV and REGRESSION gate CI. Full methodology: `docs/search-evaluation.md`.

Regenerating the synthetic multi-store listings (only when the base catalog
changes — the output is committed):

```bash
npm run data:listings  # node scripts/generate-listings.mjs
```

Verify changes with `npm run build` + both suites + a manual browser check
against a **production** build (`next start`); `npm run dev` serves a bundle
that never hydrates in this repo.

## Demo-data boundary (critical, cross-cutting rule)

This is the single most important constraint in the codebase and shows up in code, copy, and data:

- **No live retailer catalog.** Runtime prefers the safe Supabase catalog projection and filters it to `source_status === "mock_not_live"`; `data/mock_products.csv` is the seed input and fallback. Only synthetic/demo products may render publicly before an approved live-feed change.
- **Public store identity is decoupled from internal retailer identity.** `data/store_tracker.csv` holds real retailer slugs (`store_slug`, `source_status`); `lib/demo-stores.ts` maps each internal slug to one of 6 neutral public IDs (`demo-store-01`…`demo-store-06`) via a stable hash (`stableStoreIndex`). Public UI, URLs, and search filters must only ever use the public `demo-store-NN` IDs/labels — never internal retailer slugs or names.
- **`/out/:productId` never redirects to a merchant.** It renders an onsite synthetic-preview guard for a valid mock product (404 for unknown IDs) and posts a click-intent analytics event; it does not perform an external redirect. Real redirects require an approved affiliate feed plus destination HTTPS/host/affiliate-rule validation — do not add one without that context.
- Stores with `source_status: market_suspended` in `store_tracker.csv` are excluded from the public store list entirely (see `data/store_tracker.csv`, e.g. Factcool LT).
- Copy conventions (see `lib/i18n.ts` / `DESIGN.md`): use "demo parduotuvė"/"Store NN" style neutral labels; never expose network/application/feed/approval status, commission, or retailer branding in shopper-facing copy.

When in doubt about whether something counts as "real retailer data," treat it as in-scope for this rule and check `DESIGN.md` and `README.md` first.

## Architecture

- **App Router pages** (`app/**/page.tsx`) are server components. Locale-aware pages take `searchParams` as a `Promise` (Next 16 convention) and pass it through `lib/i18n.ts` helpers.
- **i18n**: two locales (`en` default, `lt`), selected via a `lang` query param and persisted through a `weft-locale` cookie (not shown in `lib/i18n.ts` itself — cookie handling lives in the layout/middleware). `lib/i18n.ts` centralizes all UI copy in one large `copy` object plus label formatters (`formatCategoryLabel`, `formatColorLabel`, etc.) and a `withLocale(href, locale)` helper for building locale-preserving links. Add new UI strings there under both `en` and `lt`, not inline in components.
- **Product data** (`lib/catalog.ts`, `lib/mock-products.ts`): runtime pages first read the safe `catalog_products` Supabase view through the public/RLS client. A 1.5-second failure, missing migration, or empty remote catalog falls back to the bundled `data/mock_products.csv`; failed remote results are never cached as catalog data. Search/filter/sort remain pure functions in `mock-products.ts`, so tests and offline development stay deterministic.
- **Search relevance** (`lib/search-router.ts`, `lib/hybrid-search.ts`, `lib/search-embedding.ts`, `lib/search-judge.ts`, `lib/semantic-search.ts`): the page-level router now handles a conservative full-consumption EN/LT objective grammar without cloud calls. It matches audited garment/color families, prices, stock/sale and affirmative sleeve construction; unknown and inapplicable sleeve metadata never means sleeveless. Unsupported grammar retains Gemini Embedding 2 vector retrieval from Supabase/pgvector plus the local graph, fused by RRF, then Gemini 3.6 Flash judges up to 40 candidates. A supported objective prefix followed by `for/skirta/skirti` preserves hard predicates before/after the hybrid path; arbitrary known words in unsupported syntax do not become hard filters. Incomplete cloud searches return local results labelled approximate when nonempty. The previous frozen architecture's sealed 200-case final blind v3 first run scored 195/200 (97.5%); that historical score does not validate this revision. See `docs/search-routing-verification.md` and `docs/search-evaluation.md`.
- **Search operations** (`lib/search-runtime.ts`, `lib/search-runtime-cache.ts`, `lib/search-deadline.ts`, `scripts/check-production-search.mjs`): log only route/reason/cache/stage timing/result-count metadata, never raw queries. Objective results bypass cloud and result caching; identical hybrid requests coalesce and explicit successful judge outcomes (including empty/fallback-identical results) are cached for five minutes in process memory. Failures are not retained. The asynchronous cloud pipeline has a provisional 8-second shared abort budget, not a whole-page or browser-disconnect guarantee. `SEARCH_OBJECTIVE_ROUTING=off` disables the new objective route and mixed guards for rollback; this does not revert the separate cloud deadline/cache changes. The scheduled six-hour production probe remains hybrid-only.
- **Feed imports** (`scripts/import-feed.mjs`, `scripts/feed-operation.mjs`, `scripts/feed-import-core.mjs`, `scripts/feed-import-postgres.mjs`): provider field aliases live in versioned JSON profiles under `data/feed-configs/`; dry-run is the default. Apply mode requires explicit `--apply`, a store slug, and a database URL, then verifies store/program permissions before writing `feed_import_runs`, `raw_feed_items`, and `products` transactionally. The production workflow accepts only the migration-006 `weft_feed_importer` role, is serialized and protected by the `production-feed-import` GitHub Environment, then indexes the safe Supabase read model and runs the doctor. CI applies migrations 001–003, 005, and 006 to a disposable PostgreSQL 17 `weft_test` database and verifies importer role isolation/idempotency plus the safe catalog read model. `scripts/seed-demo-catalog.mjs` groups all 64 synthetic products into six neutral stores and imports them through the same path. Never log resolved feed URLs or authorization values.
- **Cross-store comparison** (`lib/product-listings.ts`, `data/mock_listings.csv`): the base catalog has one store per product and no repeated items, so the multi-store listings are generated rather than observed — see the header of `scripts/generate-listings.mjs`. Listings carry a public `demo-store-NN` id directly (no internal retailer slug is invented, because no retailer is involved), and any listing naming an unpublished store id is dropped at load. The synthetic nature is stated in shopper-facing copy.
- **Supabase** (`lib/supabase.ts` browser client, `lib/supabase-server.ts` admin client): both are optional — analytics/persistence degrade gracefully when env vars are absent. `lib/supabase-server.ts` uses the service-role key and is guarded by `import "server-only"`; never import it from client components, and never give the service-role key a `NEXT_PUBLIC_` prefix.
- **Analytics** (`lib/analytics.ts`, `lib/analytics-storage.ts`, `app/api/analytics/{search,click}/route.ts`): raw anonymous writes to both Supabase and PostHog are fail-closed behind the server-only `RAW_ANONYMOUS_ANALYTICS_ENABLED=true` flag. Credentials alone never activate either sink. `POST /api/analytics/search` records search events; `POST /api/analytics/click` is called by the `/out/:productId` guard after render, validates same-origin (`lib/request-security.ts`) and the product ID, reads correlation only from HttpOnly cookies, and returns `202` without blocking navigation. When the flag is absent or not exactly `true`, both endpoints remain disabled/no-op and issue no analytics identifier from the search route.
- **SQL** (`sql/00N_*.sql`): incremental schema/hardening migrations for the pre-affiliate schema, synthetic-click boundary, vector index, and safe catalog read model. Apply in numeric order; there's no production migration runner wired up in this repo.

## Environment

Copy `.env.example` to `.env.local`. All listed services are optional — the app runs without them:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_DB_URL=
SUPABASE_IMPORT_DB_URL=
SEARCH_CATALOG_DB_URL=
SUPABASE_SECRET_KEY=
GEMINI_API_KEY=
SEARCH_JUDGE_MODEL=
COHERE_API_KEY=
VOYAGE_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
POSTHOG_PROJECT_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
RAW_ANONYMOUS_ANALYTICS_ENABLED=false
```

`GEMINI_API_KEY`, `SEARCH_JUDGE_MODEL`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_URL`, `SUPABASE_IMPORT_DB_URL`, `SEARCH_CATALOG_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `RAW_ANONYMOUS_ANALYTICS_ENABLED` are server-only. `SEARCH_JUDGE_MODEL` is optional and defaults to `gemini-3.6-flash`. `npm run search:index` prefers a dedicated modern `SUPABASE_SECRET_KEY` plus `SUPABASE_URL` and falls back to the Session-pooler `SUPABASE_DB_URL` for local administration. Set `SEARCH_CATALOG_DB_URL` only when the index source must be the safe Supabase read model; production feed operations point it at the dedicated importer connection. The ordinary GitHub Actions index workflow uses the secret-key writer path and bundled catalog source. Neither privileged credential belongs in the browser or Vercel public variables. `SUPABASE_SERVICE_ROLE_KEY` remains an optional legacy analytics credential. `SUPABASE_URL` is also the server-side project URL; `lib/supabase-server.ts` falls back to `NEXT_PUBLIC_SUPABASE_URL`. Cohere and Voyage keys are optional bake-off inputs. `POSTHOG_PROJECT_API_KEY` is a project key for server-side HTTPS capture, not a personal API key.

Do not set `RAW_ANONYMOUS_ANALYTICS_ENABLED=true` until operations has verified both automatic retention controls in the exact production projects: (1) migration `007` is applied and an external Supabase job is guaranteed to complete `enforce_anonymous_analytics_retention()` at least once every 24 hours, with failure monitoring; its 29-day cutoff leaves that one-day scheduling margin, and (2) the PostHog project's raw-event retention is configured and verified at 30 days or less. The migration creates the aggregate/delete function only; it does not install or activate a scheduler. Keep the flag out of every `NEXT_PUBLIC_*` variable and client bundle.

## Design contract

`DESIGN.md` is the authoritative source-of-truth for brand, IA, visual language, accessibility (WCAG 2.2 AA target), responsive breakpoints, and content voice. The owner approved and implemented A's garment-detail homepage/search plus B's full-width catalog and C-like left filters. White/ink utility Arial/Helvetica replaces both rejected cream/serif and cold-blue systems; self-hosted Syne700 is reserved for `--font-wordmark`. Semantic CSS tokens retain a coherent graphite dark mode. Search density is a browser-local 3/4/5 preference (default4), separate from URL filters/ranking/page size; compact layouts use3/2 columns and a native filter sheet. No real retailer identities/photos/logos, checkout or merchant redirect. Preserve reduced motion, native GET, same-tick locale intent and safe public DTOs. Fresh verification artifacts live under `.omx/artifacts/frontend/selected-hybrid-qa/`.

Responsive display addendum: the current UI uses rem-based dimensions, matched CSS/JavaScript em breakpoints and continuous display scaling above the1440px reference, capped at2560px. This applies to shared and secondary-page styles; image `sizes` mirrors the relative dimensions and storefront cap. Responsive/browser evidence and known verification limits are in `docs/design/responsive-display-verification.md`.

Homepage addendum, 13 September 2026: the owner-approved Gemini-refined street photograph replaces the old jacket close-up and product inset. Native `picture` art direction serves full landscape desktop WebPs or a separately exported4:5 phone crop at43.75em; phone copy/CTA follows the photo. Header/search is in normal flow above the image at all widths. Image aspect ratio is preserved even on short viewports, which scroll instead of cutting off heads or shoes. See `docs/design/street-hero-verification.md` and `scripts/home_hero_e2e.py` for evidence and checks. This does not change catalog products, search behavior or deployment authority.

## Viewport and spacing

The full-width hero also extends to the real viewport on ultrawide screens. Only the home shell is uncapped; home navigation/footer retain 2560px, merchandise retains 92% of 2560px, and catalog/other routes keep their existing bounds. Desktop image `sizes` is `100vw`.

Latest owner correction: desktop `.campaign-frame` now fills the storefront width. The image keeps its natural aspect ratio until capped by `100svh - --home-header-h`, then uses cover cropping above/below with `object-position: 50% 20%`. No canvas side fields. Mobile keeps the separate 4:5 crop and flowing copy without a height cap. This supersedes the complete-photo frame described in the earlier correction below; catalog gutters and focus remain unchanged.

Viewport/spacing correction, 13 September 2026: `--collection-width:92%` in the existing CSS gives home merchandise and search four-percent side fields; phones use0.75rem. Search's enclosing focus outline is replaced by an inset underline, with a forced-colors border fallback and unchanged button keyboard outlines. Home photo now sits in `.campaign-frame`, constrained by the smaller of full width and `(100svh - --home-header-h) × 2508/1412`; the header consumes the same height token. Full image and no-JS behavior are preserved; unused side space uses the theme canvas. Below512px desktop viewport height, copy flows below the complete image. This supersedes the earlier height-only-by-width/scrolling behavior. Hero screenshot tests now keep the real viewport instead of enlarging it. Evidence and limitations: `docs/design/viewport-spacing-verification.md`.

## Authentication

There is no authentication or authorization in this codebase. No `middleware.ts`,
no session/JWT handling, no Supabase Auth usage. `/account` is a client-only UI
mock persisted to `localStorage` — it does not represent a real user account.
Supabase's service-role key is used exclusively for anonymous analytics writes
(`search_events`, `outbound_clicks`), whose RLS blocks public roles. Search is the
deliberate exception: migration 004 grants public roles read/execute only over
`is_public` retrieval documents and a `security invoker` RPC. No authentication
or user-owned data is involved.

## CI/CD and deployment

CI runs on push to `main` and on every PR via `.github/workflows/ci.yml`
(`verify` job): `npm ci` → typecheck → `test:unit` → `test:search` → production
build. Two suites are deliberately **not** in the required gates because they need
a live server: the Playwright locale suite (`test:locale`, flaky by history — see
project memory) and the HTTP `test:integration` smoke; run both before merging.
There is no Dockerfile. Deployment history shows Vercel usage (local `.vercel/`
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
