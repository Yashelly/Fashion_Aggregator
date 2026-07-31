<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# search

## Purpose

The main catalog browsing route: `/search`. All state is server-driven through URL search params (no client-side filter state) — every filter change is a full navigation to a new `/search?...` URL, which keeps the page server-renderable and shareable/bookmarkable.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Reads all params via `normalizeParams`, resolves locale, then `filterProducts()` + `sortProducts()` (from `lib/mock-products.ts`) against the full catalog. Handles pagination itself (`pageSizes = [20, 50, 100]`, `paginationItems()` builds a windowed page-number list with `…` gaps). Builds "active filter" pills from whichever params are set, each removable via a `removeUrl()`-generated link (removing `status` also clears the legacy `sale`/`availability` param aliases). Detects and surfaces `invalidFilter` — a param value (store/category/color/gender/status) that doesn't match any real option — with a distinct error message from the "valid filters, zero results" case. Renders the filter form (`MascotSearchForm` from `components/loading-mascot.tsx`, a progressive-enhancement wrapper), `FilterDisclosure` for the secondary filter group, `ProductGrid` for results, and a `source-note` aside linking to `/data-sources`. |

## For AI Agents

### Working In This Directory

- Filters are plain HTML `<select>`/`<input>` elements inside a `<form action="/search">` — this route works without JavaScript. If you add a new filter, follow the existing pattern: add it as a named form field, read it from `params` in `filterProducts()` (`lib/mock-products.ts`), and add it to the `active[]` pill list and `removeUrl()`'s per-key removal set.
- `status` is a merged/derived param (folds `sale`/`availability` into one UI concept) — when adding logic that reads filter state, check how `status` is derived (`params.status ?? (params.sale === "on" ? "sale" : params.availability ?? "")`) rather than assuming one param maps to one concept.
- The "one or more filters are not recognised" vs "these filters are valid but zero results" distinction is deliberate UX (see `DESIGN.md`'s Interaction states) — don't collapse them into one generic empty state.
- `SearchAnalyticsTracker` (client component, see `components/AGENTS.md`) fires the `/api/analytics/search` POST — it receives `resultCount` as a prop from this server component.

## Dependencies

### Internal
- `lib/mock-products.ts` (`filterProducts`, `getMockProducts`, `getStoreOptions`, `sortProducts`), `lib/i18n.ts` (copy + label formatters), `components/product-grid.tsx`, `components/filter-disclosure.tsx`, `components/loading-mascot.tsx` (`MascotSearchForm`, `SearchMascotSettler`), `components/search-analytics-tracker.tsx`.

### External
- `lucide-react` (`RotateCcw`, `Search`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
