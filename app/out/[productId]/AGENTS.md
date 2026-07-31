<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# out/[productId]

## Purpose

The single most safety-critical route in the app: the synthetic product "click-out" preview. This is where the demo-data boundary is enforced in the UI layer — it renders full product detail for a valid mock product, but **never redirects to a merchant site**, and 404s for any ID that isn't in the current mock catalog. Read the root project-documentation section (repo-root `AGENTS.md`) and `README.md`'s "Synthetic product links" paragraph before changing this file.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | `export const dynamicParams = false` + `generateStaticParams()` prebuilds exactly one static page per `mock_product_id` in `getMockProducts()` — an unknown ID is a genuine 404 (`notFound()`), not a fallback render. Renders two product images (base + styled/tryon), price (locale-formatted via `Intl.NumberFormat`), sizes, color/gender/category facts, a locale-specific generated description (`productDescription()`, category-keyed EN/LT copy blocks), and two actions: "Try with AI" (links to `/ai-fitting-room?product=<id>`) and "Back to search". The purchase note explicitly states the purchase link is not active yet — do not add a real outbound link here. |

## For AI Agents

### Working In This Directory

- Do not add an external redirect or a real merchant URL to this page. The project's stated rule (`README.md`) is that an external redirect may be enabled **only** for an approved live affiliate feed after destination HTTPS/host and affiliate-rule validation — that infrastructure does not exist yet in this repo.
- This page itself does not call `/api/analytics/click` directly — per `app/api/analytics/AGENTS.md`, the click-intent guard/tracker component (see `components/AGENTS.md`, likely `clickout-analytics-tracker.tsx`) posts to that endpoint after this page renders. If you change how this page is entered/rendered, verify that tracker still fires.
- Because `dynamicParams = false`, adding/removing rows in `data/mock_products.csv` changes which `/out/:id` routes exist only after a rebuild (`npm run build`) — a dev-server hot reload may not reflect a newly-added product's static param set until restarted.

## Dependencies

### Internal
- `lib/mock-products.ts` (`getMockProducts`), `lib/demo-stores.ts` (`getPublicDemoStoreById`, `getPublicDemoStoreLabel`), `lib/i18n.ts` (locale/label formatting).

### External
- `next/image` (`Image` with `fill`), `lucide-react` icons.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
