# Clickout Tracking Spec

## Purpose

The MVP sends users from the fashion discovery site to official retailer product pages through approved affiliate links. Clickout tracking must measure product interest, support affiliate attribution, and avoid direct ad-to-affiliate arbitrage.

Primary route:

```text
/out/:productId
```

Optional route with variant:

```text
/out/:productId?variant=:variantId&search_event_id=:searchEventId
```

## Principles

- Users browse/search on our site first.
- The clickout goes to the official store or affiliate tracking URL.
- Every outbound click gets a first-party click ID.
- No raw IP addresses are stored.
- No checkout happens on our site.
- No redirects for products without approval or active affiliate/deeplink permission.
- Brand SEM restrictions must be respected before running paid traffic.

## Clickout Flow

1. User lands on a search, collection, store, or product page.
2. Search interaction is saved to `search_events` when applicable.
3. User clicks `View in store`.
4. Frontend opens `/out/:productId` with optional metadata:
   - `variant`
   - `search_event_id`
   - `utm_source`
   - `utm_campaign`
   - `placement`
5. Backend loads product, store, and affiliate rules.
6. Backend validates:
   - store is live or approved for demo testing
   - product is active and in stock
   - affiliate/deeplink is available
   - destination URL belongs to the expected merchant or affiliate network
7. Backend creates `outbound_clicks` row with `redirect_status = pending`.
8. Backend builds or selects affiliate destination URL.
9. Backend updates click row to `redirected`.
10. Backend returns HTTP 302 to destination.

If validation fails, redirect to a safe local fallback page instead of a broken merchant URL.

## Affiliate SubID

Use an opaque ID that can be reconciled with network reports later.

Recommended MVP format:

```text
fa_<short_click_id>
```

Where `short_click_id` is a compact, URL-safe value derived from `outbound_clicks.id`.

Do not put PII, query text, user email, or raw session data into affiliate subids.

Optional internal mapping stays in `outbound_clicks`:

- `session_id`
- `anonymous_user_id`
- `search_event_id`
- `source_page`
- `product_id`
- `variant_id`
- `store_id`

## Destination URL Rules

Priority order:

1. Variant-level `affiliate_url`
2. Product-level `affiliate_url`
3. Network deeplink template applied to product `product_url`
4. Product `product_url` only when direct tracking is explicitly allowed

Never generate deeplinks for a merchant unless the affiliate program allows deeplinking.

Validate destination:

- URL is absolute.
- Scheme is `https`.
- Host is in allowlist for the store or affiliate network.
- URL does not point to an internal admin/cart/checkout path.

## Data Written to outbound_clicks

Required:

- `store_id`
- `affiliate_subid`
- `destination_url`
- `redirect_status`

Recommended:

- `product_id`
- `variant_id`
- `search_event_id`
- `session_id`
- `anonymous_user_id`
- `affiliate_network`
- `source_page`
- `page_url`
- `referrer_url`
- `user_agent`
- `ip_hash`

Hash IP server-side with a private salt if IP-level abuse prevention is needed. Do not store raw IP.

## Search Event Linkage

When a click comes from search:

1. Save search to `search_events`.
2. Return `search_event_id` to frontend.
3. Attach `search_event_id` to product-card clickout.

This enables:

- search-to-click rate
- query-level product interest
- store/category performance
- paid campaign quality
- SEO page quality

## Metrics

Core MVP metrics:

| Metric | Formula |
|---|---|
| Search CTR | outbound clicks from search / search events |
| Product CTR | product clicks / product impressions |
| Store CTR | outbound clicks by store / store product impressions |
| Query zero-result rate | zero-result searches / all searches |
| Feed freshness | products seen in latest run / active products |
| Clickout error rate | failed or blocked redirects / all clickouts |

Affiliate metrics after network reporting:

| Metric | Formula |
|---|---|
| EPC | commission / outbound clicks |
| Conversion rate | approved orders / outbound clicks |
| Approval rate | approved orders / tracked orders |
| Revenue per visitor | commission / sessions |

## Paid Traffic Guardrails

Allowed starting model:

```text
Ad -> our search/collection page -> product click -> affiliate link -> store
```

Avoid:

- ad directly to affiliate URL
- ad directly to `/out/:productId`
- brand keyword bidding where forbidden
- coupon claims without approved coupon source
- using retailer trademarks in a way that implies official partnership

For first-wave stores, assume brand SEM is forbidden unless the program explicitly says otherwise.

## Fallback States

If the click cannot redirect:

| Reason | User outcome | Internal status |
|---|---|---|
| Product inactive | Local product unavailable page | blocked |
| Store paused | Local store unavailable page | blocked |
| Missing affiliate URL | Local product unavailable page | failed |
| Invalid destination host | Local safety page | blocked |
| Network error before redirect | Retry once, then local error | failed |

Do not expose raw internal error details to users.

## Acceptance Checklist

- `/out/:productId` creates an `outbound_clicks` row.
- Redirect uses approved affiliate URL or approved deeplink.
- Click ID/subid is generated for every click.
- Failed clickouts do not send users to unknown URLs.
- Search events can be linked to clicks.
- Affiliate disclosure exists on pages that include product links.
- Paid traffic docs clearly forbid direct affiliate-link advertising.
