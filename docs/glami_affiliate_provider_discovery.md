# GLAMI LT Affiliate Provider Discovery

Review date: 2026-07-23

## Short conclusion

GLAMI is a very useful source for initially screening stores, but not a direct source of affiliate providers.

Why:

- GLAMI publicly shows which stores already operate within a fashion discovery/performance model.
- Such stores usually already have a product catalog, feed, tracking/pixel setup, and account-management infrastructure.
- GLAMI itself operates as a separate CPC/feed platform rather than an affiliate publisher network for us.

The correct flow is therefore:

```text
GLAMI LT -> store list -> check Awin / VIVnetworks / FlexOffers / direct affiliate pages -> apply to network -> obtain feed access -> import into VIBEWEAR
```

## What GLAMI actually proves

GLAMI LT describes itself as a fashion search/discovery platform: it aggregates offers from e-commerce stores and sends users to those stores to buy. Its partner page features stores such as AboutYou.lt, Eavalyne.lt, Reserved.com, Cropp.com, Mohito.com, and 4Fstore.lt as examples of retailers selling through GLAMI. The same page describes the onboarding process: registration, product feed, tracking/pixel integration, and then paid campaigns.

This matters not because we can obtain data from GLAMI, but because a participating store is probably already accustomed to:

- XML/CSV product feeds;
- performance traffic;
- tracking;
- clickout purchase journeys;
- operating its catalog beyond its own website.

Separately, the GLAMI Help Center describes Priority mode as a paid/CPC model and Restricted mode as a free mode with a limited number of products and a mandatory GLAMI Pixel. GLAMI is therefore not our affiliate network; it is better understood as a competitor/reference and a source for the seed list.

## Priority stores found through GLAMI and affiliate networks

| Priority | Store | Provider / network | Signal | Commission / cookie | Feed / deep link | Verdict |
|---|---|---|---|---|---|---|
| 1 | Reserved LT | VIVnetworks / CJ | Dedicated Lithuanian affiliate page | 7%, 30 days | XML feed and redirect URL available | Apply in the first wave |
| 1 | Sinsay LT | VIVnetworks / CJ | Dedicated Lithuanian affiliate page | 10%, 30 days | XML feed and redirect URL available | Apply in the first wave |
| 1 | Sizeer LT | VIVnetworks / CJ | Dedicated Lithuanian affiliate page | 6–9%, 30 days | XML feed and redirect URL available | Apply in the first wave |
| 1 | MODIVO LT | Awin + MODIVO affiliate page | Awin merchant profile and official MODIVO page | 10-day cookie; commission listed in Awin | MODIVO publicly mentions product feeds | Apply in the first wave |
| 2 | Cropp LT | VIVnetworks / CJ | Dedicated Lithuanian affiliate page | 4.6–9.3%, 30 days | XML feed and redirect URL available | Add to the first or second wave |
| 2 | ABOUT YOU LT | FlexOffers | Active public program page | 1.6% existing / 12% new, 7 days | Product feeds mentioned | Strong candidate, but verify in the dashboard |
| 5 | Factcool LT | VIVnetworks / CJ regional signal | Program lists Lithuania among available countries, but the official Lithuanian site reports suspended sales | 8–14%, 15 days as a regional signal | Regional XML-feed signal | Exclude from the first wave; retain as a monitoring lead |
| 3 | Answear | Awin | Official partner page leads to Awin | From 9%; verify cookie by country | Product feed available | Candidate after Lithuania/region verification |
| 3 | Eavalyne.lt | Awin signal via affiliate directory | GLAMI presents Eavalyne as a partner-store example | Not publicly confirmed | Must be checked in Awin | Not a first application without dashboard verification |
| 4 | Mohito.com | VIVnetworks signal, GLAMI example | VIV pages exist for other markets/generic programs; GLAMI features Mohito.com | 5–10%, 30 days in some markets | XML feed available on the pages found | Verify in the VIV dashboard; do not treat as Lithuania-confirmed |
| 4 | 4Fstore.lt | GLAMI example | Appears in GLAMI partner examples | Not found publicly | Not found publicly | Direct contact or dashboard search for now |

## Why the first wave is now stronger

Large brands such as Zara, Bershka, Pull&Bear, and Zalando initially appeared easier to pursue because they are well known. In practice, launch is easier with stores whose affiliate terms and feed signals are already publicly visible.

The strongest first wave is:

1. Reserved LT
2. Sinsay LT
3. Sizeer LT
4. MODIVO LT
5. Cropp LT
6. ABOUT YOU LT

Factcool LT is excluded from the first wave because its official Lithuanian site contains a notice that sales were suspended on 2025-03-06. Recheck it later if sales in Lithuania resume.

Why this order:

- All candidates fit fashion discovery.
- Most have a public XML/feed signal.
- VIVnetworks provides several CEE/Lithuanian fashion programs at once.
- Awin covers MODIVO and potentially Answear/Eavalyne.
- FlexOffers covers ABOUT YOU LT.

## Providers

### VIVnetworks / CJ

The strongest provider for the first wave.

Found:

- Reserved LT;
- Sinsay LT;
- Sizeer LT;
- Cropp LT;
- Factcool only as a monitoring lead: a regional affiliate signal exists, but Lithuanian sales are suspended;
- potentially other LPP/CEE fashion brands through catalog search.

Advantages:

- many fashion/CEE programs;
- public commissions and cookie durations;
- XML feeds are often available;
- redirect URL/deep-link signals exist;
- clear brand SEM restrictions.

Disadvantages:

- some programs use the CJ signup flow;
- final terms must be saved after approval;
- restrictions may apply to social, CSS, or brand activity.

### Awin

Essential.

Found:

- MODIVO LT;
- Answear through its official partner page;
- an Eavalyne.lt signal through an affiliate directory;
- Douglas LT as a beauty-adjacent example of a Lithuanian program.

Advantages:

- strong network;
- product-feed tooling is available;
- feed import can be built conveniently around Awin Create-a-Feed / product-data URLs.

Disadvantages:

- not all signals are Lithuania-specific;
- full commission details are often visible only after login/approval;
- advertiser IDs, feed URLs, and sub-ID/deep-link rules must be stored carefully.

### FlexOffers

Needed for ABOUT YOU LT.

Advantages:

- ABOUT YOU LT is listed as active;
- payout and cookie duration are specified;
- product feeds are mentioned.

Disadvantages:

- payout is in USD;
- the public page contains the typo `Aboutyou.It`, so the program must be verified in the dashboard before import;
- the network is less convenient as a primary technical foundation than Awin/VIV.

## What not to do

Do not scrape products from GLAMI.

GLAMI is not a product-data source for us. Copying cards, images, prices, or descriptions from GLAMI would create risks involving terms of service, copyright, price freshness, and retailer relationships.

Valid data sources are:

- approved affiliate product feeds;
- network APIs/feeds;
- deep links to official pages;
- direct permission from a store.

## How to screen stores found through GLAMI

Evaluate more than whether a store is present on GLAMI. Use seven criteria:

| Criterion | What to check | Why it matters |
|---|---|---|
| Public affiliate path | Whether a page exists in Awin/VIV/FlexOffers or directly | Without one, slow manual outreach is required |
| Feed signal | Whether XML/CSV/product feed/API access is mentioned | A proper catalog is not possible without a feed |
| Lithuania-specific | Whether a Lithuanian page/domain exists or Lithuania is a listed country | Otherwise approval may cover the wrong market |
| Commission/cookie | Whether commission and attribution window are public | Enables revenue prioritization |
| Category fit | Fashion/shoes/accessories rather than an overly broad marketplace | The MVP must remain focused |
| Restrictions | Brand SEM, coupons, cashback, social, and CSS rules | Avoid building advertising that will later be prohibited |
| Brand value for users | Recognition, suitable products, and sensible prices | Users need a reason to click |

First-wave scoring:

```text
+ Lithuanian affiliate page exists
+ XML/product feed exists
+ commission/cookie terms are public
+ GLAMI presence
+ brand is familiar to Lithuanian shoppers
-- no Lithuania-specific terms
-- commission visible only after login
-- no feed signal
-- direct outreach required
```

## Practical next step

Do not contact stores directly first. Instead:

1. Register as a publisher with VIVnetworks/CJ.
2. Register as a publisher with Awin.
3. Register as a publisher with FlexOffers.
4. Apply in this order:
   1. Reserved LT
   2. Sinsay LT
   3. Sizeer LT
   4. MODIVO LT
   5. Cropp LT
   6. ABOUT YOU LT
   7. Do not apply to Factcool now; monitor Lithuanian sales status and dashboard availability.
5. After approval, save for every store:
   - final commission;
   - cookie duration in days;
   - advertiser/program ID;
   - allowed traffic sources;
   - brand SEM rule;
   - coupon/cashback rule;
   - feed URL/API;
   - deep-link format;
   - sub-ID/tracking parameter format.
6. Only then add live products to VIBEWEAR.

## Implications for development

We do not need a full GLAMI parser. We need an `affiliate_program_tracker` and a feed-import layer for specific networks:

- `stores`: store, market, network, status, rules;
- `affiliate_programs`: advertiser ID, commission, cookie duration, approval status;
- `product_feeds`: provider, feed URL, format, `last_imported_at`;
- `products`: normalized products;
- `outbound_clicks`: clickout tracking and sub-ID.

The first importers should target:

1. VIVnetworks/CJ feeds;
2. Awin feeds;
3. FlexOffers feeds.

## Risks

### Risk 1: GLAMI presence does not imply affiliate availability

A store may be on GLAMI without offering us an open affiliate program. GLAMI is a separate CPC/feed integration between each retailer and GLAMI, not a guarantee that a publisher can earn a CPS commission.

Mitigation:

- use GLAMI only as a seed list;
- confirm the provider through a public network page or network dashboard;
- label confidence as `confirmed_lt`, `regional_signal`, `directory_signal`, or `direct_only`;
- do not add a store to the live catalog before approval.

### Risk 2: Market mismatch

A program may cover the Czech Republic, Poland, or Germany rather than Lithuania. This is particularly risky for brands whose domains appear global.

Mitigation:

- prioritize Lithuania-specific pages only;
- when Lithuania is merely listed as a country, verify it in the dashboard;
- store the country/market at program level, not only at store level.

### Risk 3: A feed exists, but usage is restricted

Even when an XML feed exists, its terms may prohibit certain traffic sources, social activity, CSS, coupon positioning, brand bidding, or custom creatives.

Mitigation:

- save the final terms after approval;
- do not run paid brand SEM;
- send traffic to our own discovery/search pages;
- do not claim to be an “official partner” without permission.

### Risk 4: Directory data may be outdated

Affilitizer and similar databases are useful but not conclusive evidence. Eavalyne.lt, for example, looks promising but cannot be treated as confirmed without checking the Awin dashboard.

Mitigation:

- use directories only for `lead` status;
- perform final confirmation within the network;
- store `last_checked_at` in the tracker.

## Sources

- GLAMI LT partner page: https://www.glami.lt/info/prideti-parduotuve/
- GLAMI Help Center business modes: https://help.glami.info/business-models
- GLAMI LT about page: https://www.glami.lt/info/
- Reserved LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/reserved-lt/
- Sinsay LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/sinsay-lt/
- Sizeer LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/sizeer-lt/
- Cropp LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/cropp-lt/
- Factcool on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/factcool-gr/
- Factcool LT sales suspended notice: https://lt.factcool.com/campaign773
- MODIVO LT affiliate page: https://modivo.lt/b/afiliacija
- MODIVO LT on Awin: https://ui.awin.com/merchant-profile/117515
- ABOUT YOU LT on FlexOffers: https://www.flexoffers.com/affiliate-programs/aboutyou-lt-affiliate-program/
- Answear partner program: https://program-partnerski.answear.com/jak-dziala.php
- Awin product feed help: https://success.awin.com/articles/en_US/Knowledge/How-can-I-access-a-Product-Feed
