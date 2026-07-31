<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# data

## Purpose

Two hand-maintained CSV files that back the entire synthetic demo catalog and the internal retailer-tracking sheet for Weft. There is no database, ORM, or seed script here — these files are read directly from disk at request time by `lib/mock-products.ts` and `lib/demo-stores.ts`. This is a pre-affiliate MVP: no live retailer catalog exists anywhere in the repo, and every row in `mock_products.csv` is explicitly synthetic ("Synthetic demo item; not a real merchant product." in the `notes` column).

## Key Files

| File | Description |
|------|--------------|
| `mock_products.csv` | 64 synthetic demo products (header + 64 rows). Public catalog source. |
| `store_tracker.csv` | 7 internal retailer/affiliate-program tracking rows (header + 7 rows). Never rendered publicly as-is. |

## Data Model

### `mock_products.csv` columns

`mock_product_id, store_slug, source_status, title, category, subcategory, brand, gender, color, size_options, price_eur, old_price_eur, currency, availability, style_tags, image_url, mock_url, notes`

- `mock_product_id` — e.g. `MOCK-001`; also drives the `/out/:productId` clickout route.
- `store_slug` — internal retailer slug (e.g. `vibewear_demo`). **Never surfaced in public UI/URLs** — see below.
- `source_status` — every current row is `"mock_not_live"`. `lib/mock-products.ts` (`getMockProducts()`) filters strictly to `product.source_status === "mock_not_live"` as the last step before returning products, so any row with a different status is silently excluded from the public catalog even if present in the file.
- `size_options` — pipe-delimited (`S|M|L|XL`).
- `old_price_eur` — empty string when not on sale; presence of a value marks the product as discounted (used by `filterProducts`/`sortProducts` sale logic in `lib/mock-products.ts`).
- `image_url` — relative path such as `/demo-products/product-01.webp`; becomes `image_path` after parsing. Corresponding `detail_image_path` (`…-tryon.webp`) is derived by convention, not read from the CSV.
- `notes` — free text; currently always the synthetic-item disclaimer.

### `store_tracker.csv` columns

`store_slug, store_name, market, country, network, program_source_url, commission, cookie_days, feed_signal, source_status, application_status, approval_status, data_permission_status, restrictions, traffic_rules, next_action, apply_priority, target_apply_date, applied_at, approved_at, last_checked_at, owner, notes`

This is an **internal affiliate-application tracking sheet** (real retailer names: Reserved LT, Sinsay LT, Sizeer LT, MODIVO LT, Cropp LT, ABOUT YOU LT, Factcool LT), not consumer-facing data. Key columns:

- `store_slug` / `store_name` — real retailer identity. Internal-only.
- `source_status` — feed/legal readiness state, e.g. `public_affiliate_feed_path_found`, `public_affiliate_program_found`, or `market_suspended`.
- `application_status`, `approval_status`, `data_permission_status` — affiliate-program pipeline state (`ready_to_apply`, `not_applied`, `pending_network_approval`, `blocked_market_suspended`, etc).
- `next_action`, `apply_priority`, `target_apply_date`, `applied_at`, `approved_at`, `last_checked_at`, `owner` — operational tracking for the humans/agents running affiliate applications.

**`market_suspended`**: of the 7 rows, `factcool_lt` (Factcool LT) is the only one with `source_status = "market_suspended"` — its `notes` column explains the official LT site reported sales suspended from 2025-03-06. Per `README.md`, this store is explicitly "monitoring-only" and is excluded from the first-wave affiliate targets. `lib/demo-stores.ts` filters out any row with `source_status === "market_suspended"` before building its internal store list, so a suspended store never receives a public `demo-store-NN` mapping at all.

## For AI Agents

### Working In This Directory

- Both CSVs are parsed by a hand-rolled quoted-CSV parser (`parseCsvLine`) duplicated in both `lib/mock-products.ts` and `lib/demo-stores.ts` — it is not a shared utility. If you add a column, keep quoting consistent (values may contain commas and must be double-quote wrapped).
- Adding a new product row: use a `mock_product_id` that doesn't collide, keep `source_status` as `mock_not_live` if it should appear publicly, and add matching image files under `public/demo-products/` (see `public/AGENTS.md`) — missing files fail gracefully via `hasDemoProductImage()` but the product will show a placeholder.
- Never add a row here that references a real, live-purchasable product without an approved affiliate feed/permission — this repo's entire legal/compliance posture (see `docs/legal/`) depends on the catalog being clearly synthetic.
- If you add a new retailer to `store_tracker.csv`, do not assume it becomes visible immediately — it only becomes an available `store` filter value once at least one `mock_products.csv` row's `store_slug` maps to it via `getPublicDemoStoreForProduct` AND its `source_status` isn't `market_suspended`.

### Public/Internal Boundary (Important)

`store_tracker.csv`'s `store_slug` and `store_name` (real retailer identities like "Sinsay LT") must **never** leak into public UI, URLs, or API responses. `lib/demo-stores.ts` enforces this by mapping each internal `store_slug` to one of exactly 6 neutral public IDs (`demo-store-01` … `demo-store-06`, labeled "Store 01"/"Parduotuvė 01" etc.) via a stable non-cryptographic hash (`stableStoreIndex`, sum of char codes × 31, mod 6). The mapping is deterministic per slug but the public labels carry zero retailer information. Any new code path that touches products or stores must go through `getPublicDemoStoreForProduct`/`getPublicDemoStores` rather than reading `store_slug` directly for anything user-facing.

## Dependencies

### Internal

- `lib/mock-products.ts` — reads `data/mock_products.csv` (`getMockProducts`), filters to `mock_not_live`, resolves image paths, and delegates store-id resolution to `lib/demo-stores.ts`.
- `lib/demo-stores.ts` — reads `data/store_tracker.csv` (`getInternalStoreRecords`), excludes `market_suspended` rows, and builds the internal-slug → public-`demo-store-NN` map used everywhere products or store filters are rendered (search page, stores page, filter dropdowns).
- Both files resolve the CSV path via `path.join(process.cwd(), "data", ...)`, so they must be run from the project root (standard for Next.js server-side code).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
