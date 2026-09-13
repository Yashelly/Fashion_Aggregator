# Affiliate Application Readiness

Date: 2026-07-23

Phase 1B objective: make VIBEWEAR clear and safe for affiliate network review before connecting real feeds.

## What a reviewer should now be able to see

A reviewer should understand within 1–2 minutes that:

- VIBEWEAR is a fashion discovery/search publisher, not a store or coupon-spam site.
- Checkout takes place only on retailers' official websites.
- The current catalog is a synthetic demo preview, not a live merchant catalog.
- Live products will be added only through an approved affiliate feed, approved deep link, merchant export, or direct permission.
- The affiliate disclosure, privacy policy, terms, data source policy, and contact page are publicly available.
- Traffic will go to VIBEWEAR pages rather than directly to affiliate links.

## What was completed in this phase

- The Search page now explicitly shows `Review mode` / `Peržiūros režimas`.
- The Data Sources page explains the demo catalog and the rules for connecting live data.
- The How It Works page explains the current review mode separately from the future feed mode.
- The Stores page no longer looks like a list of official partners: stores are presented as application targets/demo sources.
- The store tracker was expanded to cover the new first wave.
- Factcool LT is marked as blocked/monitoring because its official Lithuanian site says sales were suspended on 2025-03-06.
- The mock catalog was expanded with demo cards for Cropp LT and ABOUT YOU LT.
- The clickout preview route leads to safe store homepages rather than nonexistent affiliate links.

## First application wave

| Order | Store | Network | Why now |
|---:|---|---|---|
| 1 | Reserved LT | VIVnetworks / CJ | Lithuanian page, commission, cookie, and XML feed signal |
| 2 | Sinsay LT | VIVnetworks / CJ | Lithuanian page, high commission, and XML feed signal |
| 3 | Sizeer LT | VIVnetworks / CJ | Lithuanian page, strong sneakers/streetwear fit, and XML feed signal |
| 4 | MODIVO LT | Awin | Official affiliate page, Awin profile, and product-feed mention |
| 5 | Cropp LT | VIVnetworks / CJ | Lithuanian page, strong LPP streetwear fit, and XML feed signal |
| 6 | ABOUT YOU LT | FlexOffers | Active public program page with product feeds mentioned |

## Do not apply yet

| Store | Reason | Action |
|---|---|---|
| Factcool LT | Its official Lithuanian site says sales were suspended on 2025-03-06 | Monitor only; revisit if Lithuanian sales resume |
| Zara / Bershka / Pull&Bear | No straightforward public Lithuanian affiliate path has been confirmed | Revisit later through direct/Inditex checks |
| Eavalyne LT | Only a directory/Awin signal, not a primary confirmed source | Verify in the Awin dashboard before adding |
| Mohito LT | GLAMI/VIV regional signal, not confirmed for Lithuania | Verify in the VIV/CJ dashboard |
| 4Fstore LT | GLAMI seed only; no public affiliate path found | Search network dashboards or pursue direct outreach later |

## Before submitting applications manually

Required fields:

- live HTTPS domain;
- working contact email;
- owner/company name;
- short project description;
- traffic source description;
- website category: `Content / shopping discovery / fashion search`;
- no coupon, cashback, or browser-extension positioning unless this changes intentionally.

Recommended short description:

```text
VIBEWEAR is a visual fashion search and discovery site for Lithuanian shoppers. Users search by style, category, color, price, size, and store, then click through to official retailer product pages. Product data will be sourced from approved affiliate/product feeds.
```

Traffic answer:

```text
Traffic will come from SEO fashion search pages, curated discovery pages, organic social content, micro-creator collaborations, and small paid tests to VIBEWEAR pages. We will not use prohibited brand SEM, fake coupon claims, misleading official-store wording, or direct affiliate-link advertising.
```

Data source answer:

```text
The current site uses synthetic demo products to show the discovery experience. Live merchant products will be added only after approval to the relevant affiliate program and feed access. We do not scrape retailer websites for live catalog data.
```

## After approval for each store

Save the following in the tracker/database:

- advertiser/program ID;
- final commission;
- cookie duration in days;
- approved markets/countries;
- product feed URL/API access;
- deep-link format;
- sub-ID format;
- allowed traffic sources;
- brand SEM rule;
- coupon/cashback rule;
- image/product-data usage rules;
- `approved_at` date;
- approval notes.

## Development work after applications

After the first approvals, prioritize the feed connector foundation rather than additional design work:

1. Provider credential configuration outside the repository.
2. A network-specific feed downloader for the first approved provider.
3. A feed parser that produces raw rows.
4. Product normalization into a common model.
5. `/out/:productId` redirects through an approved affiliate URL with a sub-ID.
6. An admin/operator import report.

The live feed importer should not be enabled publicly before approval.
