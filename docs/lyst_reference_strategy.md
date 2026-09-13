# Lyst as a Product Reference

Date: 2026-07-23

Status: working decision for the MVP and future design.

## Short decision

Use Lyst as a reference for the business model, data, and product mechanics, but not as the primary visual reference.

The right formula for our project is:

> Under the hood: Lyst.<br>
> In feel: Zara + Pinterest + SSENSE/Farfetch.

Users should not feel that they have landed on a discount aggregator or SEO catalog. They should feel that they have entered a stylish fashion discovery site where they can quickly find items from different stores.

## What Lyst does well

Lyst's strength lies in its system rather than its design.

Key strengths:

- brings products from many brands and stores together in one place;
- builds search on top of a unified catalog;
- provides filters for gender, price, color, material, brand, store, and discounts;
- lets users either buy through Lyst Checkout or continue to a partner store;
- provides wishlists and product saving;
- sends alerts for discounts, price drops, special offers, and items returning to stock;
- supports size-specific alerts;
- provides My Sizes to show products in the right sizes;
- lets users follow brands and designers;
- provides personalized recommendations;
- develops AI-powered natural-language search;
- offers LystLens, an AI visual search feature based on photos;
- publishes trend reports such as The Lyst Index;
- uses search, click, and order data for ranking and fashion intelligence.

Sources:

- [Lyst About](https://www.lyst.com/about/)
- [How does Lyst work](https://help.lyst.com/hc/en-gb/articles/360020553340-How-does-Lyst-work)
- [Lyst App features](https://help.lyst.com/hc/en-gb/articles/36133679317778-What-can-I-do-on-the-Lyst-App)
- [Product ranking information](https://www.lyst.com/help/product-ranking-information/)
- [AI-powered search FAQ](https://www.lyst.com/help/ai-powered-search/)
- [Lyst for partners](https://www.lyst.com/partners/)

## Why Lyst can feel visually inexpensive

The issue is not that the products themselves are inexpensive. It is how they are presented.

The main reasons for the low-cost impression are:

- cards often resemble a conventional marketplace or discount catalog;
- images come from different stores, making the grid visually inconsistent;
- luxury, mid-market, and outlet products may appear side by side, weakening the positioning;
- there is a lot of “from store” copy, discount messaging, pricing, and operational information;
- SEO pages are useful for Google but not always pleasant for human visitors;
- many long-tail pages contain huge result sets with weak curation;
- the interface focuses more on finding a product than inspiring a style;
- commercial ranking can reinforce the catalog feel if the most profitable items for the platform outrank the most visually appealing ones.

As a result, even an expensive item can begin to look like something from a sale aggregator.

## What to adopt from Lyst

We should copy the value architecture, not the appearance.

Adopt:

- an affiliate/feed-first model;
- a unified product catalog spanning multiple stores;
- search as the primary product journey;
- filters and sorting;
- wishlists;
- clickout tracking;
- price and availability alerts, but not in the first version;
- ranking based on relevance, popularity, clicks, and commercial value;
- SEO pages for categories, brands, trends, and queries;
- “shop by mood / occasion / vibe” as a more modern search experience;
- editorial selections to make the catalog feel less dry;
- a data loop covering impressions, clicks, saves, searches, and outbound clicks.

## What not to adopt from Lyst

Do not include the following in the MVP:

- the visual density of its catalog;
- overloaded cards;
- overly prominent sale badges;
- a “500+ products from 200 stores” feeling on the main screen;
- native checkout;
- order management;
- returns and customer support for orders;
- a full mobile app ecosystem;
- LystLens at launch;
- complex AI personalization at launch;
- public fashion-data reports before we have accumulated our own data.

## What our first screen should be

The homepage should begin as a fashion discovery experience, not a catalog.

Priorities:

- bold visual presentation;
- the feeling of a brand rather than a database;
- minimal noise;
- a small number of strong categories;
- entry points based on mood, season, occasion, or style;
- products presented as a curated selection rather than a feed export;
- restrained presentation of the source store rather than making it the primary element;
- calm discount treatment without a loud red marketplace accent;
- Zara-like cleanliness combined with Pinterest-like discovery.

Example entry points:

- New In
- Trending Now
- Summer Minimal
- City Black
- Soft Office
- Weekend Looks
- Sneakers Edit
- Linen & Light Layers
- Under 100 EUR
- Sale, presented as an edit rather than a clearance section

## Product card

A product card should feel premium and calm.

Required elements:

- image;
- brand;
- name;
- price;
- previous price, when discounted;
- source store in small text;
- save/heart action;
- quick clickout.

Do not overload the card with:

- long descriptions;
- multiple badges;
- aggressive sale messaging;
- unnecessary categories;
- technical affiliate labels.

The guiding principle is that the card should sell the item visually rather than explain the database.

## Search

Standard keyword search is needed immediately, but it can be positioned more broadly.

Concept:

> Search by style, mood, occasion, color, brand, or item.

To users, this sounds like “search the way you do on Pinterest,” but it should not be the primary slogan because it is ambiguous and may promise more than the MVP can actually deliver.

The MVP can support:

- search by name;
- search by brand;
- search by category;
- search by color;
- search by store;
- manually assigned vibe tags in the data.

Later:

- natural-language search;
- AI query rewriting;
- similar products;
- visual search;
- style boards;
- personalized recommendations.

## Ranking

Ranking should be simple and honest at launch.

MVP logic:

- query relevance first;
- then availability;
- then image quality;
- then click-through rate/popularity;
- then the affiliate program's commercial value;
- then product freshness.

If commission is prioritized above quality from the start, the site will quickly begin to look inexpensive. For premium discovery, user experience must win first and commission second.

## Translating Lyst into our MVP

### MVP 1

Build:

- a fashion-discovery-style homepage;
- catalog;
- search;
- filters;
- mock/approved-feed products;
- product detail or product quick view;
- outbound click tracking;
- a basic client/local wishlist, with authentication added later if needed;
- store, brand, and category pages;
- legal pages;
- affiliate disclosure.

MVP 1 objective: look real and polished enough to pass affiliate review and test user interest.

### MVP 2

Add:

- real product feeds;
- product normalization;
- cron/import runs;
- price history;
- sale detection;
- back-in-stock detection;
- email alerts;
- user accounts;
- saved sizes.

### MVP 3

Add:

- AI/vibe search;
- similar products;
- personalized collections;
- boards;
- trend pages;
- advanced ranking;
- paid/social traffic experiments.

### No earlier than MVP 3–4

Add:

- 3D try-on;
- visual search;
- subscription-only features;
- full mobile app features;
- native checkout.

## Main risk

The main risk in copying Lyst is creating a site that is technically correct but visually inexpensive.

If we simply display products from feeds in a grid, the result will be yet another aggregator. Such a site would compete with GLAMI, Google Shopping, and marketplaces where we have no advantage.

We need to build an “interface for taste,” not a “catalog of stores.”

Practical rule:

- the store is the source of the product;
- the product is the object of purchase;
- the collection/mood is the entry point;
- the user's taste is the core product.

## Final decision

Lyst remains our primary reference for:

- data;
- feeds;
- the affiliate/clickout model;
- search;
- ranking;
- wishlists/alerts;
- marketplace mechanics.

For visual design and UX, however, use a cleaner fashion environment rather than Lyst:

- Zara for structure and minimalism;
- Pinterest for discovery and saving ideas;
- SSENSE/Farfetch for a premium catalog;
- Lyst only as a backend/product-logic reference.
