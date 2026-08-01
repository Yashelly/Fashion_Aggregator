<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# app

## Purpose

Next.js App Router tree — every routable page plus the two analytics API routes. All pages are async server components; locale-aware ones accept `searchParams: Promise<SearchParamsInput>` (Next 16 convention) and resolve the current `Locale` via `lib/i18n.ts`'s `getLocale()`. `layout.tsx` renders the shared shell (header/footer/theme bootstrap/locale cookie read); route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` provide the shared loading/error/404 states for the whole tree.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout. Loads Syne (display) + IBM Plex Sans (body) fonts, reads the `weft-locale` cookie for `<html lang>`, inlines a pre-hydration theme script (`localStorage["weft-theme"]` → `data-theme`/`color-scheme`, defaults to light), and wraps children in `LoadingMascotProvider` between `SiteHeader`/`SiteFooter`. |
| `page.tsx` | Home route. Renders `CinematicHero`, a static category-link grid, an 8-product "new arrivals" `ProductGrid` (filtered to `availability !== "out_of_stock"`), and a trust-band CTA to `/data-sources`. No search/filter state — that lives in `search/`. |
| `globals.css` | Semantic CSS custom properties with explicit light/dark token maps (see `DESIGN.md`), plus all component styling — there is no CSS-in-JS or CSS modules in this repo. |
| `loading.tsx` | Route-level Suspense fallback; reads the locale cookie server-side and renders `RouteLoadingFallback` from `components/loading-mascot.tsx`. |
| `error.tsx` | Client-component error boundary (`"use client"`). Resolves locale from `?lang` or `document.documentElement.lang` (no cookie access on the client), logs the error, offers reset/return-home actions. |
| `not-found.tsx` | Global 404. Also used directly by `app/out/[productId]/page.tsx` via `notFound()` for unknown product IDs. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | Analytics-only API surface (see `api/AGENTS.md`) |
| `out/[productId]/` | Synthetic product detail / click-guard page — never redirects to a merchant (see `out/[productId]/AGENTS.md`) |
| `search/` | Catalog search, filters, pagination (see `search/AGENTS.md`) |
| `about/`, `contact/`, `privacy/`, `terms/`, `affiliate-disclosure/`, `data-sources/`, `how-it-works/`, `stores/` | Static/light-logic informational routes — see table below |
| `account/` | `/account` — renders `AccountDashboard` (a client component; see `components/AGENTS.md`) inside a locale-aware heading. No auth/persistence wired up here. |
| `ai-fitting-room/` | `/ai-fitting-room?product=<id>` — server-selects up to 12 in-stock, image-available products (requested product first if valid) and passes them to the `AiFittingRoom` client component. Preview/demo flow only. |
| `preview/[productId]/` | **Empty directory** (no files) — a route folder exists on disk but contains nothing to render; do not treat it as a working route. |

### Informational routes (single `page.tsx`, mostly boilerplate over `InfoPage`)

| Route | Notes |
|-------|-------|
| `about/` | Uses `components/info-page.tsx`'s `InfoPage`/`ProseSection`, pulls all copy from `getCopy(locale).pages.about`. |
| `contact/` | Same `InfoPage` pattern, `pages.contact`. |
| `privacy/`, `terms/`, `affiliate-disclosure/`, `data-sources/`, `how-it-works/` | Same pattern, respective `pages.*` copy keys in `lib/i18n.ts`. These are the **live** legal/info pages — `docs/legal/*.md` are separate draft reference documents, not the source these pages render (verify before assuming otherwise if you touch either). |
| `stores/` | Slightly more logic than the others (67 lines) — renders the public demo-store list from `lib/demo-stores.ts`/`lib/mock-products.ts` with links into `/search?store=demo-store-NN`. |

Every `page.tsx` in this table is a thin, self-contained composition of `lib/i18n.ts` copy + a shared component; there was no separate AGENTS.md written per route folder since each is a single file with no independent logic worth documenting beyond what's captured here.

## For AI Agents

### Working In This Directory

- Every new page must resolve `Locale` via `lib/i18n.ts` (`getLocale`), not by inventing ad hoc locale detection — `error.tsx` and `not-found.tsx` show the two supported fallback patterns (client: query param/`document.lang`; server: cookie).
- Respect the demo-data boundary (see root `AGENTS.md` project-documentation section and `README.md`): no page here may render real retailer names, logos, or a live purchase/checkout action. `out/[productId]/` is the canonical example of the guard pattern.
- `dynamicParams` / `generateStaticParams` (see `out/[productId]/page.tsx`) statically prebuild one route per mock product — if the product set changes shape, rebuild is required for new IDs to resolve.

### Testing Requirements

There is no component/unit test suite for `app/`. Verification is `npm run build` (typecheck + static generation) plus the Playwright locale suite in `scripts/locale_e2e.py` (`npm run test:locale`, requires the dev server running) which walks every public route in both locales.

## Dependencies

### Internal
- `lib/i18n.ts` (locale + copy), `lib/mock-products.ts` (catalog), `lib/demo-stores.ts` (public store identity), `components/*` (all page-level composition).

### External
- `next/font/google` (Syne, IBM Plex Sans), `lucide-react` (icons throughout).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
