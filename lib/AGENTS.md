<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# lib

## Purpose

Server- and browser-side utility modules: the mock product catalog (CSV-backed), the internal-to-public store identity mapping, i18n copy/formatting, optional Supabase clients (browser + server), and optional PostHog analytics capture with server-side persistence. Nothing here depends on a database or external service being configured — every optional integration degrades to a no-op when its env vars are absent.

## Key Files

| File | Description |
|------|-------------|
| `mock-products.ts` | Reads and hand-parses `data/mock_products.csv` at request time (custom `parseCsvLine`, no CSV library). `getMockProducts()` filters to `source_status === "mock_not_live"` and joins each row to a public demo store via `demo-stores.ts` and to local image paths under `public/demo-products/` (`hasDemoProductImage` guards against missing files). `filterProducts()` implements search: EN/LT synonym table, `under N` / `iki N` price parsing, diacritic-insensitive matching. `sortProducts()` sorts by price or discount, default sorts in-stock first. `getStoreOptions()` returns only stores that actually have products. |
| `demo-stores.ts` | Reads `data/store_tracker.csv`, excludes `market_suspended` stores, and maps each internal `store_slug` to one of 6 fixed public IDs (`demo-store-01`..`06`) via a deterministic string hash (`stableStoreIndex`) — the same internal store always maps to the same public ID, but the mapping is not reversible/guessable from the public ID. `getPublicDemoStoreForProduct()` falls back to a numeric-ID-derived index if a product's store slug isn't in the tracker. `filterProductsByPublicDemoStore()` is the only entry point search filtering should use. |
| `i18n.ts` | `Locale = "en" \| "lt"`. `getLocale()`/`normalizeParams()` read the `lang` query param; `withLocale(href, locale)` builds a locale-preserving link (sets/clears `lang`). All UI copy lives in one large `copy` object keyed by locale (header/footer/hero/home/search/productGrid/pages.*) — add new strings here under both `en` and `lt`, never inline in a component. Separate label-formatter functions (`formatGenderLabel`, `formatCategoryLabel`, `formatColorLabel`, `formatAvailabilityLabel`, `formatTagLabel`) translate raw data values (e.g. `"black"`, `"bottoms"`) with a `humanize()` fallback for unmapped values. |
| `analytics.ts` | `"server-only"`. `captureAnalyticsEvent(event, distinctId, properties)` POSTs to PostHog's `/capture/` HTTPS endpoint with a 1s timeout; returns `"disabled"` when `POSTHOG_PROJECT_API_KEY` is unset, `"sent"`/`"failed"` otherwise. Always sets `$process_person_profile: false`. `createAnonymousId()`/`normalizeAnonymousId()` generate/validate the `anon_<uuid>` distinct ID format (regex-validated, falls back to a fresh ID on anything malformed). |
| `analytics-storage.ts` | Server-side Supabase persistence, independent of PostHog. `saveSearchEvent()` inserts into the `search_events` table (see `sql/002_pre_affiliate_hardening.sql`); `saveBlockedPreviewClick()` inserts into `outbound_clicks` with `redirect_status: "blocked"` and an explicit `error_message` noting the merchant redirect is disabled by design (see `sql/003_synthetic_click_boundary.sql`). Both are 1s-timeout, best-effort, and return `null`/`false` on any failure or when Supabase isn't configured — callers must not treat failure as fatal. |
| `supabase-server.ts` | `"server-only"`. `getSupabaseServerClient()` — lazily-memoized admin client built from `SUPABASE_URL` (falls back to `NEXT_PUBLIC_SUPABASE_URL`) + `SUPABASE_SERVICE_ROLE_KEY`. Returns `null` if either is missing or client creation throws. Never import this from a client component — the service-role key must never reach the browser. |
| `supabase.ts` | Browser client (`getSupabaseBrowserClient()`) using `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Unlike the server client, this **throws** if the env vars are missing rather than returning `null` — only call it from code paths that already know Supabase is configured, or guard the call site. |
| `request-security.ts` | `"server-only"`. `isSameOrigin(request)` validates that a request's `Origin` header matches its own host/protocol (respecting `x-forwarded-host`/`x-forwarded-proto`), used by both `app/api/analytics/*` routes to reject cross-origin POSTs before doing any other work. |

## For AI Agents

### Working In This Directory

- New/changed UI copy goes in `i18n.ts`'s `copy` object under **both** `en` and `lt` — do not hardcode English strings in components as a shortcut. Check `DESIGN.md`'s "Content voice" section for tone/terminology rules (e.g. Lithuanian must use `parduotuvė`, never `šaltinis`, for "store").
- Never surface an internal `store_slug` (from `store_tracker.csv` / `demo-stores.ts`'s internal types) in a URL, API response, or rendered string. Only `PublicDemoStore.id` (`demo-store-NN`) and its `label` may reach the client or a route param.
- Any new Supabase read/write must go through `supabase-server.ts` (server) or `supabase.ts` (browser) — don't instantiate `createClient` directly elsewhere, and don't assume either client is non-null/won't throw without checking this file's actual behavior first.
- Analytics writes (`analytics.ts` capture, `analytics-storage.ts` persistence) are intentionally best-effort and time-boxed (1s). Preserve that pattern for any new analytics call — don't let an analytics failure block a request/response.

### Common Patterns

- CSV files are parsed by hand (`parseCsvLine`, duplicated identically in `mock-products.ts` and `demo-stores.ts`) rather than via a library — if you touch CSV parsing, keep both in sync or extract a shared helper deliberately (currently not shared).
- Optional-integration modules (`supabase-server.ts`, `analytics.ts`) follow the same shape: read env vars, return `null`/`"disabled"` early if absent, never throw past that point. Match this shape for new optional integrations.

## Dependencies

### Internal
- `mock-products.ts` and `demo-stores.ts` read `data/mock_products.csv` and `data/store_tracker.csv` directly via `node:fs`/`node:path` (relative to `process.cwd()`), and `mock-products.ts` checks file existence under `public/demo-products/`.
- `analytics-storage.ts` depends on `supabase-server.ts`; both analytics API routes (`app/api/analytics/*`) depend on `analytics.ts`, `analytics-storage.ts`, and `request-security.ts`.

### External
- `@supabase/supabase-js` (`supabase.ts`, `supabase-server.ts`).
- No CSV/i18n library — both are hand-rolled here.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
