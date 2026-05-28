# MVP PRD

## Product Summary

The product is a visual fashion search and discovery site for Lithuanian shoppers, later expandable to the Baltics. Users search and browse clothing by style, category, color, price, size, and store, then click through to official retailer product pages.

Positioning:

```text
Visual fashion search for Lithuanian stores.
Shop by vibe, not by store.
```

The MVP is not a marketplace, not a scraper, not a checkout flow, and not a coupon site.

## MVP Goal

Prove that approved affiliate/product feeds can power a useful fashion discovery experience and produce measurable outbound affiliate clicks.

The MVP should answer:

- Can we get approved by feed-first affiliate programs?
- Can we import and normalize real product feeds reliably?
- Do users search/browse and click out to stores?
- Which categories/stores generate the best engagement?
- Is the project credible enough for second-wave affiliate and direct partnerships?

## First-Wave Stores

Only stores with public affiliate/feed signals go into the initial launch plan.

| Store | Status for launch planning | Why included |
|---|---|---|
| Reserved LT | First wave | VIVnetworks/CJ-style path, XML feed signal |
| Sinsay LT | First wave | VIVnetworks/CJ-style path, XML feed signal |
| Sizeer LT | First wave | VIVnetworks, XML feed signal |
| MODIVO LT | First wave | Awin/MODIVO affiliate page, product feed signal |

Not included in first wave:

- Zara
- Bershka
- Pull&Bear
- ASOS
- ABOUT YOU
- Zalando
- Sportland
- Ballzy
- MemberShop
- Instagram shops

Reason: feed access, market scope, or permission is not confirmed enough for zero-outreach first wave.

## Target User

Primary user:

- Lives in Lithuania.
- Shops online for fashion.
- Wants discovery across stores instead of opening many retailer tabs.
- Searches by aesthetic and constraints, for example black boots, streetwear sneakers, summer dress under 50 EUR.

Secondary user:

- Follows outfit inspiration on TikTok/Instagram/Pinterest-style feeds.
- Wants to turn a vague style idea into buyable products.

## User Stories

- As a shopper, I can search for a clothing idea and see relevant products from approved stores.
- As a shopper, I can filter by price, size, color, category, and store.
- As a shopper, I can open the official store page when I want to buy.
- As a shopper, I can tell which store sells the product and that the site may earn affiliate commission.
- As an operator, I can import a product feed without duplicating products.
- As an operator, I can see whether a feed run succeeded or failed.
- As an operator, I can track outbound clicks by store, query, page, and product.

## MVP Scope

### Included

- Public informational shell.
- Demo visual search before feed approval.
- Approved-feed product catalog after approval.
- Product grid/cards.
- Basic search.
- Filters:
  - category
  - store
  - brand
  - price
  - size
  - color
- Product clickout route.
- Search event tracking.
- Outbound click tracking.
- Feed import runs.
- Raw feed row storage.
- Product normalization.
- Out-of-stock handling.
- Affiliate disclosure and data source policy pages.

### Excluded

- User accounts.
- Saved boards.
- Subscriptions.
- 3D try-on.
- AI stylist chat.
- Image search.
- Wardrobe upload.
- Checkout.
- Cart.
- Marketplace seller tools.
- Scraping pipeline.
- External search SaaS.
- Large paid acquisition campaigns before tracking works.

## Pre-Affiliate Infrastructure

Before applying or while applications are pending, build only enough to look credible and be feed-ready:

- Live domain or stable deploy.
- Home page.
- Demo search page with synthetic/mock data.
- Legal/trust pages.
- Feed-ready database schema.
- Mock feed import path.
- Clickout skeleton.
- Store/application tracker.
- Application copy and screenshots.

Do not wait for perfect design. The site must look real enough for review, but the main risk is approval/feed access.

## Technical Architecture

Recommended MVP stack:

| Layer | Tool |
|---|---|
| Web app | Vercel / Next.js or similar |
| Database | Supabase Postgres |
| Search | Postgres filters first, pgvector later |
| Feed jobs | GitHub Actions, Supabase cron, or small worker |
| Analytics | `search_events` and `outbound_clicks` first |
| Images | Merchant image URLs when allowed by feed rules |

Avoid separate Algolia/Elastic/Meilisearch Cloud until product count and query volume justify it.

## Data Model

Core tables:

- `stores`
- `affiliate_program_rules`
- `feed_import_runs`
- `raw_feed_items`
- `products`
- `product_variants`
- `product_embeddings`
- `search_events`
- `outbound_clicks`

Schema source:

```text
sql/001_pre_affiliate_schema.sql
```

## Launch Phases

### Phase 0: Foundation

Goal: make the project review-ready.

Deliverables:

- Project positioning locked.
- First-wave stores locked.
- Home/search/legal page structure.
- Affiliate application text.
- Data source policy.
- Store tracker.
- Mock product data.

Exit criteria:

- A reviewer can understand the site in 30 seconds.
- The site does not show scraped retailer data.
- The site explains affiliate/data-source behavior.

### Phase 1: Pre-Approval Demo

Goal: show the product concept without using unauthorized product data.

Deliverables:

- Demo search grid.
- Synthetic product cards.
- Filters working on mock data.
- Clickout route present but not redirecting to unauthorized stores.
- Legal/trust pages live.

Exit criteria:

- Demo works end to end.
- No live merchant product content is used without approval.
- Affiliate applications can include screenshots.

### Phase 2: Affiliate Applications

Goal: get feed access.

Apply to:

- Reserved LT
- Sinsay LT
- Sizeer LT
- MODIVO LT

Application message should say:

```text
We are building a visual fashion search and discovery site for Lithuanian/Baltic shoppers. Users search by style, category, color, price, and size, then click through to official retailer product pages. Product data will be sourced from approved affiliate/product feeds.
```

Do not say:

- scraper
- marketplace
- official partner
- coupon site
- direct affiliate arbitrage
- brand keyword ads

Exit criteria:

- Applications submitted.
- Program rules captured.
- Approval status tracked.

### Phase 3: First Real Feed

Goal: import one approved feed safely.

Deliverables:

- One approved feed imported.
- Import run visible in database.
- Product cards use real approved data.
- `/out/:productId` redirects via approved affiliate URL.

Exit criteria:

- At least one full successful feed import.
- No duplicate products after re-import.
- Clickout tracking works.
- Public product pages/cards include disclosure.

### Phase 4: Multi-Store MVP

Goal: have enough catalog breadth for a real public test.

Deliverables:

- 2-4 approved stores live.
- Search across stores.
- Filters by category, price, store, brand, size, color.
- Daily or scheduled feed refresh.
- Out-of-stock handling.

Exit criteria:

- At least 2 approved feed stores live.
- Import error rate is manageable.
- Clickout error rate below 1 percent.
- Search zero-result rate is tracked.

### Phase 5: Traffic Validation

Goal: test demand on our own pages, not direct affiliate links.

Channels:

- SEO collection pages.
- Organic TikTok/Instagram content.
- Small paid tests to our search/collection pages.
- Micro-creator tests with tracked pages.

Exit criteria:

- Search CTR and outbound CTR measured.
- Best categories identified.
- Paid tests do not violate brand SEM rules.
- Second-wave store pitch can use real engagement data.

## MVP Metrics

Product:

- searches per session
- search CTR
- zero-result rate
- filter usage
- outbound clicks
- outbound clicks per product impression
- top queries
- top categories

Affiliate:

- clicks by store
- EPC after network reporting
- conversion rate after network reporting
- approval rate after network reporting
- commission by store

Ops:

- feed import success rate
- invalid row rate
- duplicate rate
- missing image rate
- out-of-stock count
- products updated per run

## Risks

| Risk | Mitigation |
|---|---|
| Affiliate rejection | Apply only with credible site, policy pages, and no scraping language |
| Feed format differences | Normalize through common import spec |
| Missing product fields | Keep raw rows, skip invalid public cards |
| Image usage uncertainty | Use images only from approved feeds and rules |
| Paid ads do not pay back | Use paid as validation, not main revenue engine |
| Brand SEM violations | Treat brand bidding as forbidden unless explicitly allowed |
| Duplicate products | Enforce `store_id + external_product_id` uniqueness |
| Stale inventory | Scheduled imports and out-of-stock status |
| Overbuilding | Keep AI/3D/subscription out of MVP |

## Launch Readiness Checklist

- Public site is live.
- Demo data is clearly non-scraped.
- Privacy, Terms, Affiliate Disclosure, Data Source Policy are live.
- At least 2 approved feeds are imported.
- Store rules are recorded.
- Product clickout works.
- Search and click events are recorded.
- Feed import can be re-run without duplicates.
- Out-of-stock handling works.
- No unapproved stores are shown as live product sources.

## Open Decisions

Resolve before public launch:

- Final product name/domain.
- Exact first paid traffic budget.
- Whether demo pages stay visible after live feed launch.
- Whether to expose store pages before every store has approval.
- Whether to keep product detail pages or only product cards with clickout.
