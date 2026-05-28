# Feed Import Spec

## Purpose

The MVP must import products only from approved affiliate/product feeds or explicitly permitted partner feeds. The importer is not a scraper and must not use retailer web pages as the data source unless written permission exists.

First-wave feed targets:

| Store | Network path | MVP feed assumption |
|---|---|---|
| Reserved LT | VIVnetworks / CJ-style feed access | XML feed available after approval |
| Sinsay LT | VIVnetworks / CJ-style feed access | XML feed available after approval |
| Sizeer LT | VIVnetworks | XML feed available after approval |
| MODIVO LT | Awin / MODIVO affiliate page | Product feeds mentioned publicly, verify after approval |

Stores without confirmed feed access stay out of the first import pipeline.

## Import Principles

- Use approved feed URLs, credentials, and network rules only.
- Keep raw feed rows for audit/debugging.
- Normalize into a common product model without losing the original payload.
- Make imports idempotent: the same feed should not duplicate products.
- Never delete products immediately when they disappear from a feed; mark them out of stock or removed.
- Enrich products only after stable canonical fields exist.
- Store merchant image URLs only when the feed/network rules allow it.
- Keep feed credentials out of the database and repo.

## Source Inputs

Each import job needs:

| Input | Required | Notes |
|---|---:|---|
| store_id | yes | Existing `stores.id` |
| source_type | yes | `affiliate_feed`, `direct_partner_feed`, or `manual_mock` |
| source_format | yes | `xml`, `csv`, `tsv`, or `json` |
| source_url | yes for live feeds | Do not store credentials in plain URL if avoidable |
| is_full_snapshot | yes | Controls out-of-stock logic |
| network rules | yes | Read from `affiliate_program_rules` before public display |
| category mapping version | yes | Internal mapping table/file, not necessarily DB-backed in MVP |

## Canonical Field Mapping

| Canonical field | Required | Common feed aliases | Target table |
|---|---:|---|---|
| external_product_id | yes | id, product_id, item_id, offer_id | products |
| title | yes | title, name, product_name | products |
| brand | no | brand, manufacturer | products |
| description | no | description, long_description | products |
| merchant_category | no | category, category_path, product_type | products |
| normalized_category | no | derived | products |
| gender | no | gender, audience, department | products |
| color_label | no | color, colour | products/products_variants |
| normalized_color | no | derived | products/product_variants |
| material | no | material, composition | products |
| product_url | yes | link, product_url, url | products |
| affiliate_url | yes for live | tracking_url, deeplink, aw_deep_link | products/product_variants |
| image_url | yes for public cards | image, image_url, image_link | products |
| currency | yes | currency, price_currency | products/product_variants |
| price | yes | price, current_price | products/product_variants |
| sale_price | no | sale_price, discounted_price | products/product_variants |
| old_price | no | old_price, retail_price, was_price | products |
| availability | yes | availability, stock_status | products/product_variants |
| size | no | size, sizes, variant_size | product_variants |
| sku | no | sku, variant_sku | product_variants |

Minimum public card fields:

- `title`
- `store_id`
- `product_url` or `affiliate_url`
- `image_url`
- `price`
- `currency`
- `availability` or `in_stock`

If a row does not have enough data for a public card, keep it in `raw_feed_items` as `invalid` or `skipped`.

## Import Flow

1. Load store and affiliate rules.
   - Store must be `approved_feed`, `direct_permission`, or `demo`.
   - Feed status must not be `paused`.
   - Confirm image and deeplink usage is allowed.

2. Create `feed_import_runs`.
   - Status: `started`.
   - Store source URL, source format, and `is_full_snapshot`.
   - Do not store credentials.

3. Download feed to temporary storage.
   - If download fails, mark run `failed`.
   - If the feed is unchanged by feed-level hash, the job can stop early and mark unchanged.

4. Parse rows.
   - XML: map item nodes to row objects.
   - CSV/TSV: parse headers strictly.
   - JSON: accept array or known object path only.
   - Each row receives a stable `row_number`.

5. Validate required fields.
   - Missing `external_product_id` or `title`: invalid.
   - Missing price/currency: invalid for public listing.
   - Missing image: valid raw row, skipped for public listing.
   - Malformed URL: invalid.

6. Normalize.
   - Trim strings.
   - Decode HTML entities.
   - Convert prices to decimal.
   - Normalize currency to uppercase ISO code.
   - Normalize category, gender, color, and size.
   - Derive `in_stock` from availability.

7. Compute hashes.
   - `raw_hash`: stable hash of raw payload.
   - `content_hash`: stable hash of fields that affect product display/search.

8. Upsert `raw_feed_items`.
   - Unique by `import_run_id + row_number`.
   - Keep `raw_payload`, `normalized_payload`, `raw_hash`, validation status, and errors.

9. Upsert `products`.
   - Unique by `store_id + external_product_id`.
   - If new: insert and set `first_seen_at`, `last_seen_at`.
   - If existing and `content_hash` changed: update display/search fields.
   - If existing and unchanged: only update `last_seen_at`, `last_import_run_id`.

10. Upsert `product_variants`.
    - Use variant ID or SKU when present.
    - If no variant ID exists, derive a variant key from size/color/SKU.
    - Store variant-level price and availability when feed supports it.

11. Mark out-of-stock after full snapshot imports.
    - For full snapshots only, products from the same store not seen in the run become `out_of_stock`.
    - Do not do this for partial feeds, failed runs, or category-only feeds.
    - Keep the product page hidden from default search if status is `out_of_stock`.

12. Generate enrichment only for changed products.
    - Embeddings should be generated only when `content_hash` changed.
    - Do not run AI enrichment during the feed transaction.
    - Queue enrichment after import completes.

13. Complete run.
    - Update counts.
    - Status: `completed`.
    - Store warnings and notes for operator review.

## Idempotency Rules

- Product identity is `store_id + external_product_id`.
- Variant identity is `product_id + external_variant_id` when available.
- If variant ID is absent, use a deterministic derived key in code.
- A second import of the same feed should produce zero new products.
- Only changed `content_hash` should trigger search reindexing/embedding work.
- A failed import must not mark missing products out of stock.

## Availability Mapping

| Feed value examples | in_stock | status |
|---|---:|---|
| in stock, available, yes | true | active |
| limited, preorder | true | active, but keep availability text |
| out of stock, unavailable, sold out | false | out_of_stock |
| discontinued, removed | false | removed |
| blank/unknown | false by default | out_of_stock or skipped depending on store rules |

If variant-level stock exists, product `in_stock` is true when any variant is in stock.

## Category Normalization

MVP category mapping should start small:

- shoes
- sneakers
- boots
- dresses
- tops
- hoodies
- jackets
- jeans
- trousers
- skirts
- accessories
- bags
- jewelry

Keep `merchant_category` unchanged for debugging. Use `normalized_category` for filters and SEO pages.

## Size Normalization

Store original size in `size_label`. Normalize into `normalized_size` for filtering.

Examples:

| Raw | Normalized |
|---|---|
| XS | xs |
| Extra Small | xs |
| 36 EU | eu_36 |
| EU 42 | eu_42 |
| 9 UK | uk_9 |
| One Size | one_size |

Do not over-normalize shoes and clothing into the same scale.

## Error Handling

An import run fails only when the feed cannot be downloaded, parsed, or safely committed. Bad rows should not fail the whole feed unless the invalid rate is too high.

Suggested thresholds:

- Warning: more than 5 percent invalid rows.
- Failure: more than 30 percent invalid rows.
- Failure: zero valid public products from a previously working feed.

## Operator Checklist

Before enabling a store as public:

- Store affiliate status is approved.
- Product feed URL is from the affiliate network or written partner permission.
- Program rules are recorded in `affiliate_program_rules`.
- Brand SEM and paid traffic restrictions are known.
- Image usage is allowed by feed/network rules.
- At least one successful full import completed.
- Product cards render with image, title, price, store, and clickout.
- `/out/:productId` redirects through the affiliate URL.
- Affiliate disclosure is visible on public pages.

## First Import Success Criteria

The first real feed is ready for MVP when:

- At least 500 valid products are imported, or the feed's full valid product count is lower.
- Duplicate rate is below 1 percent after the second run.
- Missing image rate is below 10 percent for public cards.
- Price parsing error rate is below 2 percent.
- Outbound click URL is present for at least 95 percent of public products.
- Re-running the same feed does not create duplicates.
