# No-Design Wireframes

## Purpose

This document defines page structure before visual design. It is a functional skeleton for affiliate review, MVP planning, and implementation. It does not specify colors, typography, animations, or final UI style.

The site should communicate:

```text
Visual fashion search for Lithuanian stores.
Users discover products here and buy on official retailer sites.
Product data comes from approved feeds.
```

## Global Shell

Every public page should have:

- Logo/name placeholder.
- Primary navigation:
  - Search
  - Stores
  - How it works
  - About
- Footer links:
  - Contact
  - Privacy Policy
  - Terms of Use
  - Affiliate Disclosure
  - Data Source Policy
- Affiliate disclosure line near product-heavy areas:

```text
Some product links may be affiliate links. We may earn a commission if you buy from a retailer after clicking.
```

## Home Page

Route:

```text
/
```

Functional structure:

1. Header/nav.
2. Main value statement:
   - "Visual fashion search for Lithuanian stores."
   - Secondary line: "Search by style, color, price, size, and store. Buy from official retailer sites."
3. Primary search input.
4. Quick category links:
   - Sneakers
   - Dresses
   - Hoodies
   - Boots
   - Sale
5. Demo/trending product grid.
   - Before approval: synthetic/mock products only.
   - After approval: approved-feed products only.
6. Store/source note:
   - "We use approved affiliate/product feeds where available."
7. Footer.

Required states:

- Empty demo state.
- Loading state.
- No approved stores yet state.

## Search Page

Route:

```text
/search?q=:query
```

Functional structure:

1. Header/nav.
2. Search bar with current query.
3. Result summary:
   - query
   - result count
   - active filters
4. Filters:
   - category
   - store
   - brand
   - price range
   - size
   - color
   - in stock only
5. Sort:
   - relevance
   - price low to high
   - price high to low
   - newest
6. Product grid.
7. Pagination or load more.
8. Affiliate disclosure.

Product card fields:

- Image.
- Product title.
- Store name.
- Brand if available.
- Price and currency.
- Sale price/old price if available.
- Availability/size hint.
- `View in store` action using `/out/:productId`.

Required states:

- Loading.
- No results.
- Invalid filter combination.
- Feed temporarily unavailable.
- Product image missing.

Tracking:

- Create `search_events` after search is submitted or results load.
- Attach `search_event_id` to clickout.

## Collection Page

Routes:

```text
/c/:category
/sale/:category
/style/:slug
```

Examples:

- `/c/sneakers`
- `/sale/sneakers`
- `/style/black-boots`

Functional structure:

1. Header/nav.
2. Collection title.
3. Short utility copy.
4. Filters and sort.
5. Product grid.
6. Related collections.
7. Affiliate disclosure.

Use collection pages for SEO and paid traffic tests. Ads should land here or on search pages, not directly on affiliate links.

## Product Card

This is a component, not necessarily a standalone page.

Required fields:

- `product.id`
- `store.display_name`
- `title`
- `image_url`
- `price`
- `currency`
- `affiliate_url` or valid clickout destination

Optional fields:

- brand
- sale price
- old price
- discount percent
- color
- size summary
- availability

Actions:

- `View in store` -> `/out/:productId`
- Optional later: save to board

Rules:

- Do not show products from unapproved stores as live.
- Do not show out-of-stock products in default search unless user enables it.
- Do not imply checkout happens on our site.

## Store Page

Route:

```text
/stores/:storeSlug
```

Functional structure:

1. Store name.
2. Store description/status:
   - "Products are listed from approved affiliate/product feed" when live.
   - "Coming soon" when not approved.
3. Store-level disclosure.
4. Product grid filtered to store.
5. Store restrictions note for internal/admin view only, not public.

Public store statuses:

| Internal status | Public behavior |
|---|---|
| target | Do not show public page unless needed as coming soon |
| applied | Hidden or coming soon |
| approved_feed | Live |
| approved_deeplink | Live only if product data is permitted |
| rejected | Hidden |
| paused | Temporarily unavailable |

## How It Works Page

Route:

```text
/how-it-works
```

Functional structure:

1. What the site does:
   - Search fashion products across approved stores.
   - Filter by practical constraints.
   - Click through to official retailer sites.
2. What the site does not do:
   - No checkout.
   - No marketplace selling.
   - No scraping-first data model.
3. Data source explanation:
   - Approved affiliate/product feeds.
   - Direct partner feeds when available.
4. Affiliate disclosure summary.
5. Link to Data Source Policy.

## About Page

Route:

```text
/about
```

Functional structure:

1. Short project description.
2. Lithuania/Baltics focus.
3. User value:
   - visual discovery
   - cross-store search
   - official retailer clickout
4. Publisher/retailer value:
   - qualified traffic
   - affiliate tracking
   - no copied checkout
5. Contact link.

## Stores/Data Sources Page

Route:

```text
/data-sources
```

Functional structure:

1. Explanation of data source model.
2. List live approved stores.
3. Explain that product information can change on retailer sites.
4. Store removal/correction contact.
5. Link to full Data Source Policy.

This page is important for affiliate review.

## Legal Pages

Routes:

```text
/privacy
/terms
/affiliate-disclosure
/data-source-policy
```

Functional structure:

- Plain readable text.
- Last updated date.
- Contact email.
- No product grid.

These can use existing legal drafts from `docs/legal`.

## Contact Page

Route:

```text
/contact
```

Functional structure:

1. Contact email.
2. Reasons to contact:
   - affiliate/retailer partnerships
   - product data correction
   - store removal request
   - privacy request
3. Optional simple form later.

## Error Pages

### Product Unavailable

Route example:

```text
/product-unavailable
```

Use when clickout is blocked because:

- product is out of stock
- store is paused
- affiliate URL is missing
- destination failed validation

The page should offer:

- back to search
- similar products
- no raw error details

### 404

Functional structure:

- brief message
- search input
- popular categories

## Demo Data Rules

Before affiliate approval:

- Use synthetic product names and images/placeholders.
- Do not copy merchant product photos or descriptions.
- Do not present demo stores as live official sources.
- Label internal mock/demo state clearly enough for operators.

After affiliate approval:

- Live product cards must come from approved feeds.
- Store and feed status control whether products appear publicly.

## Implementation Acceptance

The no-design MVP is complete when:

- Home page explains the product.
- Search page renders product cards from mock or approved data.
- Filters work on available data.
- Legal/trust pages exist.
- Data source model is visible.
- Clickout route exists.
- Product clickout is disabled or safe for mock products.
- No unapproved retailer product data is displayed.
