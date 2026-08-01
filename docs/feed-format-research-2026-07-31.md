# Affiliate feed format research + flexible schema proposal

**Status:** research / design proposal only. No SQL in this document has been applied. Nothing in `sql/`, `lib/`, or `data/` was changed to produce it.

**Why this exists:** per the VIBEWEAR strategic vision interview
(`.omc/specs/deep-interview-vibewear-strategic-vision.md`, §2 and §4), the
exact feed format of the first real affiliate partner is unknown today and
can't be known until a brand actually agrees to work with us. Rather than
wait, this document surveys how real affiliate feeds actually look, then
proposes concrete additions to the existing Supabase schema so it can absorb
whichever shape shows up first — without a schema rewrite.

**How this relates to existing docs (read first, not duplicated here):**

- `docs/feed_import_spec.md` already defines the *process* — import flow,
  idempotency rules, availability/size normalization, error thresholds. That
  spec is still correct and this document does not replace it. Where this
  doc's field mapping disagrees with `feed_import_spec.md`'s "Canonical Field
  Mapping" table (e.g. it lists `products/product_variants` for `price`; this
  doc is more specific about which table a *given format's* price field lands
  in), treat this doc as the more detailed version, not a contradiction.
- `docs/glami_affiliate_provider_discovery_ru.md` already picked the first-wave
  network shortlist (VIVnetworks/CJ, Awin, FlexOffers) and explicitly warned
  against treating GLAMI itself as a data source. This doc takes that
  shortlist as given and researches the *feed shapes* those networks and
  GLAMI actually produce.
- `sql/001_pre_affiliate_schema.sql` through `sql/003_synthetic_click_boundary.sql`
  already establish a real schema — `stores`, `affiliate_program_rules`,
  `feed_import_runs`, `products`, `raw_feed_items`, `product_variants`,
  `product_embeddings`, `search_events`, `outbound_clicks` — with a
  `raw_payload jsonb` escape hatch on `raw_feed_items` and `product_variants`.
  This is a **strong foundation**, not something to redo. This proposal is a
  gap analysis on top of it: what's missing to (a) absorb attributes none of
  today's tables have a column for, and (b) do cross-store "same physical
  product" matching, which the strategic vision now requires
  (`data-boundary` §Vision: "Cross-store price/size comparison for the *same
  item*... does not exist; there is no product-identity matching across
  stores in the data model").
- `data/mock_products.csv` — the current demo shape (`mock_product_id`,
  `store_slug`, `source_status`, `title`, `category`, `subcategory`, `brand`,
  `gender`, `color`, `size_options`, `price_eur`, `old_price_eur`, `currency`,
  `availability`, `style_tags`, `image_url`, `mock_url`, `notes`) already maps
  cleanly onto `products`/`product_variants` as-is (`size_options` is a
  pipe-delimited list that expands to one `product_variants` row per size).
  Nothing proposed below breaks that mapping.

---

## 1. Four real-world feed formats, researched

Picked for genuine structural difference, not just different vendors: an
XML/TSV lingua franca that other networks mirror (Google), a CSV/XML
affiliate-network format with its own field-naming convention (Awin, with CJ
Affiliate and Admitad noted as structural siblings), a CEE fashion-discovery
XML format already relevant to this project (GLAMI), and a variant-per-row
CSV shape typical of a brand's own direct export (Shopify, standing in for
"whatever a brand's own e-commerce platform spits out" since it's the most
common platform among smaller/independent brands VIBEWEAR might sign
directly).

### 1.1 Google Merchant Center / Google Shopping product feed

The de-facto lingua franca — most ad platforms and several affiliate
networks (CJ Affiliate explicitly offers a "Google Shopping feed format"
export) let merchants publish in this shape because it's already required
for Google Ads.

- **Format:** XML (RSS 2.0 with a `g:` namespace) or TSV/CSV; also
  submittable via Google Sheets or the Content API.
- **Delivery:** scheduled fetch from a merchant-hosted URL (Google pulls on a
  schedule you configure, typically daily), the Content API (push), or manual
  upload. No FTP.
- **Cadence:** merchant-configurable scheduled fetch, commonly daily; Content
  API allows near-real-time pushes.
- **Core required attributes:** `id`, `title`, `description`, `link`,
  `image_link`, `price`, `availability`.
- **Apparel-specific required attributes** (kick in once you sell apparel in
  most countries): `brand`, `gtin` or `identifier_exists`, `color`, `size`,
  `gender`, `age_group`, `item_group_id` (parent ID that ties size/color
  variants of one product together).
- **Notable optional attributes:** `sale_price`, `mpn`, `material`, `pattern`,
  `condition`, `additional_image_link` (up to 10), `video_link`,
  `custom_label_0`–`4`, `product_highlight`, `product_detail`,
  `question_and_answer`, `shipping`, `product_length`/`width`/`height`/`weight`,
  `certification` (EU energy label, EPREL — electronics/appliances only).

Sources: [Google Merchant Center product data specification](https://support.google.com/merchants/answer/7052112), [Every Google Merchant Center Feed Attribute Explained](https://www.storegrowers.com/google-merchant-center-feed-attributes/).

### 1.2 Awin product feed (representative of the CJ Affiliate / Admitad network family)

Directly relevant: `docs/feed_import_spec.md` already lists MODIVO LT on Awin
and Reserved/Sinsay/Sizeer/Cropp LT on "VIVnetworks / CJ." Awin, CJ Affiliate,
and Admitad are structurally similar — CSV/TSV/XML product catalogs keyed by
a network-assigned product ID, with a network-generated deep link column —
so researching Awin's field set stands in for all three; the exact column
names differ (Awin's `aw_`-prefixed fields vs. CJ's own naming vs. Admitad's
per-program custom column names) but the shape does not.

- **Format:** CSV, TSV, TXT, or XML (Awin's Product Service accepts
  tab/pipe-delimited UTF-8-with-BOM CSV, or XML). CJ Affiliate additionally
  offers Excel/PIPE-delimited and a Google-Shopping-format export.
- **Delivery:** advertiser hosts the feed at an HTTPS URL; the network
  crawls it on its own cadence, and publishers pull a per-program feed URL
  from the network dashboard ("Create-a-Feed" / product data URL) or via a
  feed-list-download endpoint that reports last-updated timestamps so you
  don't re-pull unchanged feeds.
- **Cadence:** network-controlled, commonly hourly-to-daily depending on the
  advertiser's own update frequency and network tier.
- **Key fields:** `aw_product_id` (unique ID), `product_name`, `description`,
  `aw_deep_link` (the affiliate-tracked URL — this *is* the clickout URL,
  distinct from the merchant's own product page URL), `search_price`
  (current sale price), `rrp_price` (recommended retail / "was" price),
  `display_price` (merchant-formatted price string, e.g. with currency
  symbol/rounding baked in), `merchant_image_url`, `brand_name`,
  `merchant_category`, `colour`, `size`, `in_stock` (0/1), `is_for_sale` (1),
  `condition`, `ean` (GTIN/barcode), `keywords`.

Sources: [Awin Product Feed Publisher Guide](https://help.awin.com/developers/docs/product-feed-publisher-guide-intro), [Awin Product Feed field reference (Pricefy)](https://www.pricefy.io/feed-channels/awin), [CJ Developer Portal — Product Feeds](https://developers.cj.com/docs/data-imports/product-feeds), [Admitad — Product feed help](https://support.admitad.com/hc/en-us/articles/4405920538897-Product-feed).

### 1.3 GLAMI XML feed

Already the subject of `docs/glami_affiliate_provider_discovery_ru.md` — not
as a data source (that doc is explicit GLAMI must never be scraped as
product data), but because several first-wave stores are already used to
producing a GLAMI-shaped feed, which is itself evidence about what those
stores can hand VIBEWEAR directly if approached for a direct partnership
instead of going through an affiliate network.

- **Format:** XML (`<SHOPITEM>` elements per product), some setups also
  accept CSV.
- **Delivery:** merchant hosts the XML at a URL; GLAMI pulls it automatically
  (documented cadence is on the order of hourly).
- **Mandatory elements:** `ITEM_ID`, `PRODUCTNAME`, `CATEGORYTEXT`,
  `MANUFACTURER`, `SIZE`, `PRICE_VAT`, `IMGURL`, `URL`, `DELIVERY_DATE`.
- **Recommended elements:** `ITEMGROUP_ID` (variant grouping, same concept as
  Google's `item_group_id`), `DESCRIPTION`, `SIZE_SYSTEM`,
  `IMGURL_ALTERNATIVE`, `MATERIAL`, `PARAM` (arbitrary name/value attribute
  pairs — GLAMI's own escape hatch), `DELIVERY`, `PROMOTION_ID`, `URL_SIZE`,
  `GLAMI_CPC` (the merchant's own CPC bid inside GLAMI's paid-placement
  model — describes the merchant's ad spend with GLAMI, not the product).

Sources: [GLAMI XML feed — Help Center](https://help.glami.info/xml-feed), [GLAMI Product feed](https://www.glami.eco/info/feed/).

### 1.4 Direct-from-brand export (Shopify product CSV, standing in for "whatever the brand's own platform exports")

The plausible shape for a smaller/independent brand agreeing to a direct
partnership without going through a network — the strategic vision
explicitly widened "valid first affiliate partner" to *any* willing brand,
not just the six large LT retailers in the shortlist. Shopify is the most
common platform for that kind of brand, and its CSV export is representative
of the broader "one row per variant, HTML-formatted description, brand
platform's own back-office fields mixed in" pattern seen across
Shopify/WooCommerce/BigCommerce exports generally.

- **Format:** CSV, UTF-8. One row per **variant**, not per product — rows
  sharing the same `Handle` are variants of the same product, with product-
  level fields (title, description, vendor) populated only on the first row.
- **Delivery:** manual export/upload, or automated via the brand's own
  scheduled export app; no network involved — whatever handoff mechanism the
  brand and VIBEWEAR agree on directly (email, shared drive, SFTP, etc.).
- **Cadence:** entirely negotiated bilaterally; no platform-enforced cadence.
- **Key columns:** `Handle`, `Title`, `Body (HTML)`, `Vendor`, `Type`,
  `Tags`, `Published`, `Option1/2/3 Name` + `Option1/2/3 Value` (typically
  Size/Color/sometimes a third axis), `Variant SKU`, `Variant Price`,
  `Variant Compare At Price`, `Variant Barcode`, `Variant Inventory Qty`,
  `Variant Inventory Policy`, `Variant Fulfillment Service`,
  `Variant Requires Shipping`, `Variant Taxable`, `Variant Weight` +
  `Variant Weight Unit`, `Image Src`, `Variant Image`, `SEO Title`,
  `SEO Description`, `Status`.

Sources: [Shopify Help Center — Using CSV files to import and export products](https://help.shopify.com/en/manual/products/import-export/using-csv), [Shopify Product CSV columns explained](https://wisepim.com/guides/product-feed-optimization/shopify-csv).

---

## 2. Field-by-field mapping: format → proposed schema

Columns marked **(NEW)** don't exist in `sql/001`–`003` today and are part of
the proposal in §4. Everything else maps onto existing columns.

### 2.1 Google Merchant Center

| GMC attribute | Target | Notes |
|---|---|---|
| `id` | `products.external_product_id` | unique within store, per existing `unique(store_id, external_product_id)` |
| `title` | `products.title` | |
| `description` | `products.description` | |
| `link` | `products.product_url` | merchant's own page, not affiliate-tracked |
| `image_link` | `product_images` **(NEW table)**, `role='primary'` | |
| `additional_image_link` (×0–10) | `product_images`, `role='gallery'` | |
| `price` | `products.price` | |
| `sale_price` | `products.sale_price` | |
| `sale_price_effective_date` | `products.raw_attributes` **(NEW column, jsonb)** | see §3 |
| `availability` | `products.availability` + derived `in_stock` per `feed_import_spec.md`'s availability mapping table | |
| `availability_date` | `raw_attributes` | preorder not in MVP scope |
| `brand` | `products.brand` | |
| `gtin` | `products.gtin` **(NEW)** | primary cross-store match key, §5 |
| `mpn` | `products.mpn` **(NEW)** | fallback match key |
| `identifier_exists` | `raw_attributes` | informational |
| `google_product_category` | `products.merchant_category` | kept verbatim per `feed_import_spec.md`'s "keep `merchant_category` unchanged for debugging" rule |
| `product_type` | `raw_attributes.product_type_path` | merchant's own taxonomy string, not ours |
| `item_group_id` | `products.item_group_id` **(NEW)** | groups size/color variants *within one store's feed* — distinct from cross-store `product_groups` (§5) |
| `color` | `product_variants.color_label` / `normalized_color` | |
| `size` | `product_variants.size_label` / `normalized_size` | |
| `gender` | `products.gender` | |
| `age_group` | `products.age_group` **(NEW)** | |
| `material` | `products.material` | |
| `pattern` | `products.pattern` **(NEW)** | |
| `condition` | `products.condition` **(NEW)** | |
| `custom_label_0`–`4` | dropped | §3 |
| `shipping`, `product_length/width/height/weight` | dropped | §3 |
| `certification`, `energy_efficiency_class`, `unit_pricing_measure` | dropped | §3, not apparel-applicable |

### 2.2 Awin (and structurally, CJ Affiliate / Admitad)

| Awin field | Target | Notes |
|---|---|---|
| `aw_product_id` | `products.external_product_id` | |
| `product_name` | `products.title` | |
| `description` | `products.description` | |
| `aw_deep_link` | `products.affiliate_url` | this is the actual clickout target |
| merchant product URL (network-specific field name) | `products.product_url` | |
| `search_price` | `products.price` | |
| `rrp_price` | `products.old_price` | |
| `display_price` | dropped | §3 |
| `merchant_image_url` | `product_images`, `role='primary'` | |
| `brand_name` | `products.brand` | |
| `merchant_category` | `products.merchant_category` | |
| `colour` | `product_variants.color_label` | |
| `size` | `product_variants.size_label` | |
| `in_stock` (0/1) | `products.in_stock` | |
| `is_for_sale` (1) | gates `products.status` | if 0, treat as `removed` |
| `condition` | `products.condition` **(NEW)** | |
| `ean` | `products.gtin` **(NEW)** | same column as GMC's `gtin` — both are GTIN-family barcodes |
| `keywords` | dropped | §3 |
| network's own category/product taxonomy ID | `raw_attributes.network_category_id` | |

### 2.3 GLAMI

| GLAMI element | Target | Notes |
|---|---|---|
| `ITEM_ID` | `products.external_product_id` | |
| `PRODUCTNAME` | `products.title` | |
| `DESCRIPTION` | `products.description` | |
| `PRICE_VAT` | `products.price` | VAT-inclusive, matches EUR consumer pricing already used in `mock_products.csv` |
| `IMGURL` | `product_images`, `role='primary'` | |
| `IMGURL_ALTERNATIVE` | `product_images`, `role='gallery'` | |
| `URL` | `products.product_url` | GLAMI wraps this into a tracked redirect at click time, not in the feed itself, so `affiliate_url` stays null until/unless a separate deeplink source is confirmed |
| `CATEGORYTEXT` | `products.merchant_category` | |
| `SIZE` | `product_variants.size_label` | |
| `SIZE_SYSTEM` | `raw_attributes` on the variant row (§3 — no dedicated column, low reuse across formats) | |
| `MANUFACTURER` | `products.brand` | |
| `MATERIAL` | `products.material` | |
| `ITEMGROUP_ID` | `products.item_group_id` **(NEW)** | same concept as GMC's `item_group_id` |
| `DELIVERY_DATE`, `DELIVERY` | dropped | §3 |
| `PARAM` (name/value pairs) | `products.raw_attributes.params` **(NEW)** | GLAMI's own catch-all, maps directly onto ours |
| `PROMOTION_ID` | dropped | §3 |
| `GLAMI_CPC` | dropped entirely | §3 |
| `URL_SIZE` | dropped | §3 |

### 2.4 Direct-brand CSV (Shopify shape)

| Shopify column | Target | Notes |
|---|---|---|
| `Handle` | `products.external_product_id` | stable per product across the export |
| `Title` (first row per handle) | `products.title` | |
| `Body (HTML)` | `products.description` | **HTML stripped to plain text** on import, §3 |
| `Vendor` | `products.brand` | |
| `Type` | `products.merchant_category` | |
| `Tags` | `products.raw_attributes.tags` **(NEW)** or a dedicated `style_tags` column mirroring `mock_products.csv`'s existing `style_tags` field | pick whichever the import code already needs — `mock_products.csv` proves `style_tags` is already a first-class concept worth a real column, not just `raw_attributes` |
| `Option1/2 Name` + `Value` (Size/Color typical) | `product_variants.size_label` / `color_label` | |
| `Option3 Name` + `Value` | `product_variants` row in `raw_attributes` (jsonb) — rare third axis (e.g. "Length"), not worth a dedicated column | |
| `Variant SKU` | `product_variants.sku` | |
| `Variant Price` | `product_variants.price` | |
| `Variant Compare At Price` | `product_variants.old_price` **(NEW column on product_variants)** | apparel sales are often variant-specific (one size on clearance, others not); current schema only has `old_price` at the product level, §4 |
| `Variant Barcode` | `product_variants.gtin` **(NEW)** | |
| `Variant Inventory Qty` | dropped, reduced to boolean | §3 |
| `Variant Inventory Policy`, `Variant Fulfillment Service`, `Variant Requires Shipping`, `Variant Taxable`, `Variant Weight`/`Weight Unit` | dropped | §3 |
| `Image Src` / `Variant Image` | `product_images`, `variant_id` set when image is variant-specific | |
| `SEO Title` / `SEO Description` | dropped | §3 |
| `Status` / `Published` | `products.status` | |

---

## 3. Fields deliberately dropped or normalized away

Keeping every field every format offers would turn `raw_attributes` into a
dumping ground and the core tables into a union of four vendors' back-office
concerns. Each drop below is a considered call, grouped by reason:

**Fulfillment/logistics fields the site never acts on** — GMC's `shipping`,
`product_length`/`width`/`height`/`weight`; Shopify's `Variant Weight`/
`Weight Unit`, `Variant Requires Shipping`, `Variant Fulfillment Service`,
`Variant Inventory Tracker`, `Variant Taxable`, `Variant Tax Code`; GLAMI's
`DELIVERY`/`DELIVERY_DATE`. VIBEWEAR has no cart or checkout (confirmed in
`CLAUDE.md` — `/out/:productId` never redirects with fulfillment context, it
just posts a click-intent event), so shipping weight, tax codes, and
inventory tracker settings describe the merchant's own back office, not
anything VIBEWEAR renders or acts on.

**Ad-platform-internal targeting/marketing fields** — GMC's `custom_label_0`–`4`
(Google Ads campaign segmentation, meaningless outside a Google Ads account),
`product_highlight`/`product_detail`/`question_and_answer` (structured copy
meant for Google's own rich-result rendering, not our product card),
`certification`/`energy_efficiency_class`/`unit_pricing_measure` (EU
energy-label fields for appliances/electronics — apparel is exempt from
these entirely). None of these have a shopper-facing use in a fashion-only
discovery UI.

**Network-internal paid-placement knobs** — GLAMI's `GLAMI_CPC` (the
merchant's own CPC bid inside GLAMI's ad auction) and `PROMOTION_ID`
describe the merchant's spend with GLAMI, not the product. Storing them
would leak one partner's ad-spend signal into a "product" table for no
benefit, and risks accidental exposure if that table is ever queried
client-side.

**Duplicated/ambiguous price representations** — Awin's `display_price`
(merchant-formatted price string, e.g. with currency symbol baked in) is
dropped in favor of the numeric `price`/`old_price` pair we already render
ourselves with our own currency formatting. Keeping a pre-formatted string
around risks it silently disagreeing with the numeric price after a currency
or locale change.

**SEO/marketing copy that belongs to our own i18n system, not the feed** —
Shopify's `SEO Title`/`SEO Description`. `CLAUDE.md` is explicit that
`lib/i18n.ts` centralizes all shopper-facing copy in `en`/`lt`; accepting a
feed's SEO strings would either sit unused or bypass that system and
introduce un-reviewed, non-localized text.

**Raw HTML in descriptions** — Shopify's `Body (HTML)` is stripped to plain
text on import rather than stored/rendered as-is. Rendering arbitrary
merchant HTML is an XSS surface and breaks the site's own typography system
(Syne/IBM Plex Sans, per `DESIGN.md`); if rich formatting is ever wanted,
it should be a constrained subset applied by our own renderer, not raw
merchant markup passed through.

**Exact inventory counts** — Shopify's `Variant Inventory Qty` (and any
feed's precise stock number) is reduced to the existing boolean
`in_stock`/`availability` enum, not stored as a number. Feed pull cadence
(hourly-to-daily across all four formats above) makes an exact count stale
within minutes; showing "3 left" from data that might be 20 hours old is a
false-precision risk worse than not showing a count at all, and nothing in
the current UI displays stock counts.

**Free-text SEO keyword fields with no defined use** — Awin's `keywords`.
Unstructured, format-specific, and would need its own decision about how
search should weight it; parking it in `raw_attributes` costs nothing if a
future search-ranking use case appears, but it doesn't earn a first-class
column today.

**Network-baked tracking/subid parameters embedded in URLs** — none of the
four formats' own subid/tracking-parameter conventions are stored verbatim.
`sql/001_pre_affiliate_schema.sql` already has `outbound_clicks.affiliate_subid`,
generated by VIBEWEAR at click time (per the existing `lib/analytics.ts` /
`lib/request-security.ts` pattern). Storing a feed's own baked-in subid
alongside that would create two competing attribution sources that can
silently drift out of sync; only the deep-link/affiliate URL itself is kept,
and subid generation stays owned by the click-analytics layer.

---

## 4. Proposed schema (additive to `sql/001`–`003`)

Framed as a diff against the existing tables, not a rewrite. Everything here
is additive (`alter table ... add column`, new tables) — nothing in
`sql/001`–`003` needs to change shape, and no existing column is removed or
renamed.

### 4.1 Stable core (already exists, unchanged)

`stores`, `affiliate_program_rules`, `feed_import_runs`, `raw_feed_items`
stay exactly as they are. They already handle: store identity and affiliate
approval state, per-store network rules, import-run bookkeeping, and a
`raw_payload jsonb` capture of every row exactly as the feed sent it (audit
trail — `feed_import_spec.md`'s "keep raw feed rows for audit/debugging"
principle). That part of the design already solves "don't lose the original
payload" at the *row* level.

### 4.2 What's missing: current-state escape hatch on `products`

`raw_feed_items.raw_payload` captures the payload at *import time*, but
there's no equivalent on the live `products`/`product_variants` rows for
"whatever format-specific attributes this product currently has that don't
have a dedicated column." Add:

```
alter table public.products
  add column if not exists gtin text,
  add column if not exists mpn text,
  add column if not exists condition text,
  add column if not exists age_group text,
  add column if not exists pattern text,
  add column if not exists item_group_id text,
  add column if not exists raw_attributes jsonb not null default '{}'::jsonb;

alter table public.product_variants
  add column if not exists gtin text,
  add column if not exists old_price numeric(12,2)
    check (old_price is null or old_price >= 0),
  add column if not exists raw_attributes jsonb not null default '{}'::jsonb;

create index if not exists idx_products_gtin on public.products (gtin)
  where gtin is not null;
```

- `gtin`/`mpn`/`ean` from every researched format collapse onto
  `products.gtin` — GTIN and EAN are the same barcode family, so one column
  covers both.
- `raw_attributes` is the per-product/per-variant equivalent of
  `raw_feed_items.raw_payload`, scoped to *display/search-relevant*
  format-specific extras only (GLAMI's `PARAM`, GMC's
  `sale_price_effective_date`, a Shopify variant's `Option3`) — not a
  duplicate of the full raw payload, which already lives in
  `raw_feed_items`.
- `item_group_id` is the within-store-feed variant-grouping concept that
  both GMC and GLAMI expose under different names; without it, size/color
  variants that a feed already tells us belong together have to be
  re-inferred instead of trusted.

### 4.3 New table: `product_images`

Every format supports more than one image per product (GMC's
`additional_image_link` ×10, GLAMI's `IMGURL_ALTERNATIVE`, Shopify's
repeated `Image Src` rows), but `products.image_url` is a single column.
Rather than adding `image_url_2`, `image_url_3`, ... columns:

```
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  role text not null default 'gallery'
    check (role in ('primary', 'gallery', 'swatch')),
  url text not null,
  sort_order integer not null default 0,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product
  on public.product_images (product_id, role, sort_order);
```

`products.image_url` stays as a denormalized convenience copy of the
`role='primary'` row (what `lib/mock-products.ts` already reads today) so
existing read paths don't need to change; `product_images` is additive for
galleries and variant-specific swatches.

### 4.4 New tables: cross-store product identity (`product_groups`)

This is the piece the strategic vision explicitly calls out as missing:
*"Cross-store price/size comparison for the same item... there is no
product-identity matching across stores in the data model (each product
belongs to exactly one demo store)."* `products.unique(store_id,
external_product_id)` correctly gives each *store's* row a stable identity,
but nothing today says "this row from Reserved LT and that row from MODIVO
LT are the same physical hoodie."

```
create table if not exists public.product_groups (
  id uuid primary key default gen_random_uuid(),
  canonical_title text,
  canonical_brand text,
  canonical_category text,
  representative_product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.product_groups(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  match_method text not null
    check (match_method in ('gtin_exact', 'mpn_brand', 'embedding_similarity', 'manual')),
  match_confidence numeric(5,4) check (match_confidence between 0 and 1),
  confirmed boolean not null default false,
  confirmed_by text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (product_id)
);

create index if not exists idx_product_group_members_group
  on public.product_group_members (group_id);
```

`unique(product_id)` on `product_group_members` means one product row
belongs to at most one canonical group at a time — deliberately simple for
MVP (no many-to-many "maybe the same, maybe not" states yet).

### 4.5 Optional, non-blocking: `store_feed_profiles`

Not required to unblock the first real feed, but worth naming as a known
future need: a small table recording, per store/network, which feed format
it uses and a `field_map jsonb` describing which of *its* field names map to
which canonical columns — so a second store on the same network doesn't
require new import code, just a new config row. `feed_import_spec.md`
already lists "network rules" and "category mapping version" as required
import-job inputs; this would be where that lives structurally instead of in
an external mapping file. Deferred because it has no value until there are
≥2 real feeds to compare — flagged here so it isn't forgotten, not proposed
for the first migration.

---

## 5. Detecting "same physical product" across stores

No format researched above gives you this for free — it has to be built.
Proposed tiered strategy, cheapest/most-reliable first, feeding into
`product_group_members.match_method`:

1. **`gtin_exact`** — if both products have a non-null `products.gtin` and
   they're equal, that's a real barcode match (GMC's `gtin`, Awin's `ean`,
   Shopify's `Variant Barcode` all land in this one column). Auto-confirm
   (`confirmed = true`) — GTIN collisions across genuinely different
   products are rare enough to trust outright for apparel.
2. **`mpn_brand`** — when GTIN is missing (common — smaller/independent
   brands and private-label lines frequently don't have real barcodes) but
   `brand` + `mpn` both match exactly, treat as a strong candidate. Do not
   auto-confirm; queue for the same review step as tier 3, because MPN
   reuse across a brand's own past collections is a known failure mode.
3. **`embedding_similarity`** — reuse the `product_embeddings` table that
   already exists in `sql/001` (it's unused today, waiting for the semantic
   search work). Generate a combined text+image embedding per product,
   compute cosine similarity across products with the same normalized
   `brand` + `normalized_category`, and treat pairs above a threshold (to be
   set empirically once there's real cross-store data, the same way the
   semantic-search quality bar is being set per the strategic vision's
   process) as candidates.
4. **`manual`** — human-confirmed pairing for anything tier 1–3 didn't
   resolve confidently. Low-volume by construction: with one live partner
   there's nothing to match against yet, and even at partner #2 the total
   candidate-pair count for a fashion catalog is small enough to review by
   hand before investing in more automation.

Tiers 2 and 3 both populate `product_group_members` with `confirmed = false`
and a `match_confidence` score; an operator (or, later, a simple admin view)
flips `confirmed = true`. Nothing about this blocks shipping the first real
feed — cross-store matching only becomes *meaningful* once a second real
partner's feed exists, since a single-store catalog has nothing to compare
against. It's designed now because the schema shape (not the matching logic)
is the expensive thing to retrofit later.

---

## 6. Relationship to `sql/00N_*.sql`

`sql/` currently has `001_pre_affiliate_schema.sql`,
`002_pre_affiliate_hardening.sql`, `003_synthetic_click_boundary.sql`,
applied manually in numeric order — there is no migration runner in this
repo (confirmed in `CLAUDE.md`). The next migration, if and when this
proposal is acted on, would be `sql/004_flexible_feed_schema.sql` (or
whatever name is chosen at that time) and would contain roughly the `alter
table`/`create table` statements in §4.2–§4.4.

**This document is that proposal, not that migration.** No file named
`004_*.sql` (or any other `.sql` file) was created or modified as part of
this task, per the instruction to produce documentation only. Applying it is
future work, ideally timed to land just before or alongside the first real
feed import — it's cheap to apply against an empty/demo-only database and
there's no benefit to doing it earlier than that, but no harm either.
