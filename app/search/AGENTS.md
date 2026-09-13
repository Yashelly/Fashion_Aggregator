<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# search

## Current frontend contract — 2026-09-12

Category/navigation correction: use `getCategoryOptions` for the available category list and validation, including the exact Jeans facet. The global route label is Catalog/Katalogas; All clothing appears only as the generic browse H1, not another category shortcut. Category anchors preserve search text, filters, sort and locale, resetting only page. Jeans selection is `category=jeans`; no hidden/generated `query=denim` and no semantic-search explanation for blank browsing.

The generated inventory below is historical; `DESIGN.md` and actual code win. Committed search/filter/sort/page state remains URL-backed, while `SearchControls` holds uncommitted filter drafts and browser-local3/4/5 density. A's bounded search, B's grid and C-like hideable sidebar retain the relative display scale. Filter accordions open into named radio rows, stores use checkboxes, price uses labelled inputs; no catalog native selects or duplicate visible headings. `OptionPicker` supplies site-styled details/summary disclosures for sorting and density. Sorting uses named submit buttons, and `SearchForm` serializes the actual submitter while retaining synchronous locale intent. Native GET works without JavaScript; the mobile sheet keeps Apply/Cancel/Reset, Escape and focus restoration. Page size stays separate as20/50/100 links. Do not restore the obsolete mascot/select implementation below.

## Purpose

The main catalog browsing route: `/search`. All state is server-driven through URL search params (no client-side filter state) — every filter change is a full navigation to a new `/search?...` URL, which keeps the page server-renderable and shareable/bookmarkable.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Reads all params via `normalizeParams`, resolves locale, then `filterProducts()` + `sortProducts()` (from `lib/mock-products.ts`) against the full catalog. Handles pagination itself (`pageSizes = [20, 50, 100]`, `paginationItems()` builds a windowed page-number list with `…` gaps). Builds "active filter" pills from whichever params are set, each removable via a `removeUrl()`-generated link (removing `status` also clears the legacy `sale`/`availability` param aliases). Detects and surfaces `invalidFilter` — a param value (store/category/color/gender/status) that doesn't match any real option — with a distinct error message from the "valid filters, zero results" case. Renders the filter form (`MascotSearchForm` from `components/loading-mascot.tsx`, a progressive-enhancement wrapper), `FilterDisclosure` for the secondary filter group, `ProductGrid` for results, and a `source-note` aside linking to `/data-sources`. |

## For AI Agents

### Working In This Directory

- Filter inputs and sort submit buttons remain named HTML controls inside GET forms, so the route works without JavaScript. Add new URL fields through `lib/search-params.ts`, the runtime's manual-filter boundary, and the active-filter/remove-link handling; preserve draft Apply/Cancel semantics and public demo-store IDs. Do not replace the site-styled choice rows with operating-system select popups.
- `status` is a merged/derived param (folds `sale`/`availability` into one UI concept) — when adding logic that reads filter state, check how `status` is derived (`params.status ?? (params.sale === "on" ? "sale" : params.availability ?? "")`) rather than assuming one param maps to one concept.
- The "one or more filters are not recognised" vs "these filters are valid but zero results" distinction is deliberate UX (see `DESIGN.md`'s Interaction states) — don't collapse them into one generic empty state.
- `SearchAnalyticsTracker` (client component, see `components/AGENTS.md`) fires the `/api/analytics/search` POST — it receives `resultCount` as a prop from this server component.

## Dependencies

### Internal
- `lib/mock-products.ts` (`filterProducts`, `getMockProducts`, `getStoreOptions`, `sortProducts`), `lib/i18n.ts` (copy + label formatters), `components/product-grid.tsx`, `components/filter-disclosure.tsx`, `components/loading-mascot.tsx` (`MascotSearchForm`, `SearchMascotSettler`), `components/search-analytics-tracker.tsx`.

### External
- `lucide-react` (`RotateCcw`, `Search`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
