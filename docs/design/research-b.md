# Weft — market research B

Review date: **September 12, 2026**, UTC. Research sample B covers 10 sites and 40 primary captures; it supplements `research-a.md` and does not replace the combined sample of 20. This is expert observation, not a usability test, conversion measurement, or claim about shopper preferences.

## Method and limitations

Real Chromium/Playwright sessions were run in clean contexts without accounts. Primary desktop (D) captures used 1440×1000; mobile (M) used 390×844, 100% zoom, and DPR 1. Separate `is_mobile`/`has_touch` contexts were used for primary mobile captures; the user agent remained Chromium, so this represents narrow touch-browser emulation rather than Safari testing on a physical iPhone. Each of the 40 primary PNGs was opened in an image viewer; observations below refer to the visible capture. Adjacent JSON files contain the exact timestamp, final URL, and additional details. Product lists are dynamic: prices and counts are screen evidence, not purchase offers.

Optional cookies were rejected where possible. Everlane initially covered most of the screen with a 20%-off subscription prompt; it was dismissed through No Thanks and cookies were rejected. Reformation required dismissing cookies and selecting the current region; Rains required Rest of World and necessary cookies. These obstacles are not treated as primary-screen design. No orders, registrations, seller contacts, or personal data were involved, and site protections were not bypassed.

Not counted: Farfetch, SSENSE, NET-A-PORTER, MR PORTER, Lyst, and Depop returned HTTP 403; Mytheresa showed a branded bot/error page with HTTP 200; Daydream returned 429; Sézane and Weekday returned 403; Patagonia returned 404; and END repeatedly showed a 416 error dialog that prevented meaningful review. These are session limitations, not claims that ordinary shoppers cannot access the sites. Saved diagnostic images from these sites are not part of the 40 evidence captures.

Arc’teryx automatically selected Canada/English. Its initial home hero was incomplete or blank in this session; **the two home captures were replaced with a substantive home editorial section at scrollY=600** rather than being described as the initial viewport. Results pages were captured from the top. The primary sample does not verify shipping to Lithuania for sites where another market was selected.

## Evidence matrix

Presence facts come from official pages; they do not prove UX quality. Observations and transferable decisions are expert interpretations of images. “AI not verified” does not mean AI is absent. `4 captures` means home D/M and catalogue D/M, subject to the Arc’teryx caveat above. Paths to all evidence are listed next.

| Product / type | Capture market | Presence signal / source (fact) | Reviewed | Desktop strengths | Mobile strengths | Weaknesses | AI/discovery / status | For Weft (inference) | Do not copy | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| GLAMI / aggregator | LT/LT/EUR | [Company](https://www.glami.group/): self-reported presence in 13 countries and 4,600+ e-shops; undated page | 4 captures; search/price-modal walkthrough | Search is primary; store and sizes on card | Visible search; unified filter panel | Categories push products down | AI classification/recommendations officially stated; natural-query check below | Keep query and store visible beside results | Overloaded category header | `glami-*` |
| Vinted / resale marketplace | LT/LT/EUR | [FY2025](https://company.vinted.com/newsroom/financial-results-2025), April 9, 2026: GMV €10.8 billion, revenue €1.1 billion | 4 captures; query, suggestions, PDP, back, price, narrow filters | Immediate home feed; condition/size | Search on its own row; two columns | Large ad void on results/PDP; two prices need interpretation | Suggestions observed; not proof of AI | Preserve query; expose useful attributes | Ad voids and manufactured urgency | `vinted-*` |
| Everlane / brand | US/EN/USD | [Official company page](https://www.everlane.com/pages/about), [site](https://www.everlane.com/): physical stores and own online catalogue; not a traffic estimate | 4 captures | Compact filters, price, swatches | Filter & Sort on one row above grid | Clothing absent from home video; initial subscription prompt | Editorial/material discovery visible; AI not verified | Calm cards with concise metadata | Newsletter takeover | `everlane-*` |
| Reformation / brand | LT/EN/EUR | [Official stores](https://www.thereformation.com/stores.html): international retail presence, not user statistics | 4 captures | Strong serif/photo hierarchy; price beside name | Horizontal category rail; two products | Floating search covers bottom; large wordmark and weak hero contrast | Search prompt visible; AI not confirmed | Character through photography and typography, not decoration | Persistent search overlay | `reformation-*` |
| Ganni / brand | LT/EN/EUR | [Official store locator](https://www.ganni.com/en-gb/store-locator.html): international locations; undated page | 4 captures; desktop filter drawer; other walkthrough steps partial | Concise description; large clothing; clear drawer | Wide search; two columns | Top promotional animation overlapped during capture | Search/editorial visible; AI not confirmed | Large clothing, limited intro, unified refinement | Discount on every card | `ganni-*` |
| Acne Studios / brand | EU/EN/EUR | [Official stores](https://www.acnestudios.com/us/en/stores/): multiple cities/locations, not traffic | 4 captures | Very compact header; four large images | Grid starts early; two columns | Tiny icon-only controls; truncated mobile names | Editorial/category discovery; AI not verified | Reduce chrome; keep clothing large | Ambiguous icons and tiny labels | `acne-*` |
| Arc’teryx / technical apparel | CA/EN | [Amer FY2025](https://www.amersports.com/newsroom/amer-sports-publishes-annual-report-for-fiscal-year-2025/): official reporting on an internationally growing brand | 4 captures; home scroll600 | Activity/category discovery; understandable technical facets | Equal Refine and Sort | Long category hero; home loading gap | Activity-based organization; AI not verified | Meaningful filters and clear names | Huge intro before results | `arcteryx-*` |
| Boden / brand | UK/EN/GBP | [Official history](https://www.boden.com/pages/about-us): founded 1991, entered US in 2002; historical signal, not current traffic | 4 captures; PDP/back, filter attempt | Readable price, fit/size on PDP; clear photos | Two readable columns; Filter/Sort | Repeated Coupon/Selling Fast; floating widgets | Editorial discovery; AI not verified | Separate, understandable size/fit groups | Unverified urgency and interest counters | `boden-*` |
| Rains / brand | Rest of World/EN/EUR | [Official stores](https://rains.com/pages/stores): Amsterdam, Stockholm, Hamburg, and others | 4 captures | Strong photo language; model/product and density controls | Two columns; name and price visible | Floating Filter covers data; long intro | Model/product toggle observed; AI not verified | View controls only when useful | Filter over price/name | `rains-*` |
| UNIF / independent brand | EN/EUR | [Official About](https://www.unifclothing.com/en-gb/pages/about-unif): real brand; quantitative popularity NOT established | 4 captures | Distinctive fashion photography; dense grid | Products immediately; compact header | White prices on light clothing; coupon overlay | Editorial discovery; AI not verified | Character through art direction without extra blocks | Text over unpredictable photos | `unif-*` |

UNIF is a niche visual reference and should not be treated as a mandatory widely known player. Vinted/GLAMI financial signals and store existence are not comparable quantitative measures of popularity.

## 40 reviewed captures

All rows are dated 2026-09-12. D=1440×1000, M=390×844. Region/language is listed above. H/C URLs in each heading are the exact home/catalogue capture addresses; PNG links are relative to this document. Exact timestamps are in matching JSON files.

### GLAMI — [H](https://www.glami.lt/) / [C](https://www.glami.lt/moteriski-drabuziai/)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/glami-home-desktop.png) | Purple single-level header; prominent search proposition and long centered field; three gender photo cards below, with real products absent from the first row. |
| [H M](../../.omx/artifacts/frontend/research-b/glami-home-mobile.png) | Three-line heading; nearly full-width field around y308; three categories on one row around y394, then photo categories. |
| [C D](../../.omx/artifacts/frontend/research-b/glami-results-desktop.png) | Light-purple query row; categories left and chips above grid; price, sizes, and store distinguishable on cards. |
| [C M](../../.omx/artifacts/frontend/research-b/glami-results-mobile.png) | Categories occupy roughly y186–568; filters only around y630; first products around y714—too late for a search-first product. |

### Vinted — [H](https://www.vinted.lt/) / [C](https://www.vinted.lt/catalog/1037-outerwear)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/vinted-home-desktop.png) | Very wide search; five-column feed around y204; brand, size, condition, and price beneath inconsistent user photos. |
| [H M](../../.omx/artifacts/frontend/research-b/vinted-home-mobile.png) | Search on its own row below header; two products around y255; condition/size and full buyer-protection price available without PDP. |
| [C D](../../.omx/artifacts/frontend/research-b/vinted-results-desktop.png) | Ad placeholder y160–438; filter pills around y539 and active category with close icon; grid only around y913. |
| [C M](../../.omx/artifacts/frontend/research-b/vinted-results-mobile.png) | Ad placeholder y167–295; Filters(1) beside heading and count below; two cards around y553. |

### Everlane — [H](https://www.everlane.com/) / [C](https://www.everlane.com/collections/womens-new-arrivals)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/everlane-home-desktop.png) | Cream promo strip and compact uppercase navigation; hero shows road/car, not clothing; centered white copy and small CTA. |
| [H M](../../.omx/artifacts/frontend/research-b/everlane-home-mobile.png) | Header with search icon; video nearly fills y75–767; play/mute visible; no product proposition in first viewport. |
| [C D](../../.omx/artifacts/frontend/research-b/everlane-results-desktop.png) | Compact breadcrumb/title and rectangular filter tabs; four photos around y278; price, swatches, and material outside image. |
| [C M](../../.omx/artifacts/frontend/research-b/everlane-results-mobile.png) | Filter & Sort left, count right; two columns around y249; swatches and price not hidden on hover. |

### Reformation — [H](https://www.thereformation.com/) / [C](https://www.thereformation.com/dresses-all)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/reformation-home-desktop.png) | Very large wordmark above fashion photo; white serif copy loses contrast on light dress; floating search bottom right. |
| [H M](../../.omx/artifacts/frontend/research-b/reformation-home-mobile.png) | Hero to y607; categories below; fixed “looking for something?” search overlaps bottom. |
| [C D](../../.omx/artifacts/frontend/research-b/reformation-results-desktop.png) | Six category photos y292–600; filters around y675; clothing grid only from y702; wordmark uses substantial space. |
| [C M](../../.omx/artifacts/frontend/research-b/reformation-results-mobile.png) | Horizontal category rail y181–310; size/color/type/all/sort around y375; two columns with prices and colors from y407; floating search remains. |

### Ganni — [H](https://www.ganni.com/en-lt/home) / [C](https://www.ganni.com/en-lt/clothing/)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/ganni-home-desktop.png) | Explicit header search; bag hero on yellow; promo-transition copy overlapped at capture time—a transient event, not proven persistent defect. |
| [H M](../../.omx/artifacts/frontend/research-b/ganni-home-mobile.png) | Large wordmark and separate wide gray search; expressive photo y164–668; products around y750. |
| [C D](../../.omx/artifacts/frontend/research-b/ganni-results-desktop.png) | Short description with More info; count and Filter & sort above four photos; name/price on one row, quick-buy shown by small plus. |
| [C M](../../.omx/artifacts/frontend/research-b/ganni-results-mobile.png) | Search remains visible; Filter & sort before category rail; two large photos y382–656 with price immediately below. |

### Acne Studios — [H](https://www.acnestudios.com/eu/en/home) / [C](https://www.acnestudios.com/eu/en/woman/clothing/)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/acne-home-desktop.png) | Header around 60px; giant white wordmark over dark portrait; collection only around y870. |
| [H M](../../.omx/artifacts/frontend/research-b/acne-home-mobile.png) | Narrow icon-only cells around 45px; large portrait crop; next collection title around y630. |
| [C D](../../.omx/artifacts/frontend/research-b/acne-results-desktop.png) | Navigation/subnavigation/title/count very compact; four photos from y179; blue uppercase names and EUR prices below, almost no decoration. |
| [C M](../../.omx/artifacts/frontend/research-b/acne-results-mobile.png) | Two columns from y194; count and Filter directly above grid; long names truncate/disappear at edge; small icons require guessing. |

### Arc’teryx — [H](https://arcteryx.com/ca/en) / [C](https://arcteryx.com/ca/en/c/mens/shell-jackets)

| Capture/state | Observations |
|---|---|
| [H D, scroll600](../../.omx/artifacts/frontend/research-b/arcteryx-home-desktop.png) | After incomplete hero, two editorial tiles show dark fibers and a yellow technical jacket; serif display with sans caption; top still partly blank. |
| [H M, scroll600](../../.omx/artifacts/frontend/research-b/arcteryx-home-mobile.png) | One circular-system tile; large two-line serif; simple See the system link and start of next story below. |
| [C D](../../.omx/artifacts/frontend/research-b/arcteryx-results-desktop.png) | Utility navigation and serif Shell jackets; four activity-category tiles y250–673; filters y715, products y784. |
| [C M](../../.omx/artifacts/frontend/research-b/arcteryx-results-mobile.png) | Header around 153px; carousel dots y244–541; equal-width Refine/Sort around y613; grid y666. |

### Boden — [H](https://www.boden.com/) / [C](https://www.boden.com/collections/womens-dresses)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/boden-home-desktop.png) | Green wordmark and editorial group in checked clothing; large red LONDON right; white Shop New In and categories below hero. |
| [H M](../../.omx/artifacts/frontend/research-b/boden-home-mobile.png) | Red LONDON centered on photo; Shop New In y456; two categories y555; floating help/accessibility icons below. |
| [C D](../../.omx/artifacts/frontend/research-b/boden-results-desktop.png) | Short centered intro; Filter left, Sort right; four photos y322–783, but Selling Fast and coupon repeat under every card. |
| [C M](../../.omx/artifacts/frontend/research-b/boden-results-mobile.png) | Equal Filter/Sort around y220; two photos y276–524; multiline names/prices readable; promos and floating chat add noise. |

### Rains — [H](https://rains.com/) / [C](https://rains.com/collections/womens-outerwear)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/rains-home-desktop.png) | Floating pill navigation over bronze-jacket photo; Search labeled right; huge translucent gray headline below adds character but weak contrast. |
| [H M](../../.omx/artifacts/frontend/research-b/rains-home-mobile.png) | Pill logo/menu/search; portrait crop; gray headline y421, CTA y507, first products y694. |
| [C D](../../.omx/artifacts/frontend/research-b/rains-results-desktop.png) | Brief intro and category chips; count, model/product, density controls; four photos from y411; floating Filter covers bottom center. |
| [C M](../../.omx/artifacts/frontend/research-b/rains-results-mobile.png) | Intro y176–270; count and sort/model/product add two rows; grid y441–731; black Filter covers product data at bottom. |

### UNIF — [H](https://www.unifclothing.com/) / [C](https://www.unifclothing.com/collections/new)

| Capture/state | Observations |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/unif-home-desktop.png) | Grainy full-screen editorial portrait; white overlay nav and dark logo over dark region; Summer Pt 1 below; product strip from y724. |
| [H M](../../.omx/artifacts/frontend/research-b/unif-home-mobile.png) | Different responsive portrait crop; small menu/search; two product photos from y493; Get $20 Off coupon over bottom edge. |
| [C D](../../.omx/artifacts/frontend/research-b/unif-results-desktop.png) | Compact Filter and Sort/Featured/count; three large photos from y133; name and price in white directly on image. |
| [C M](../../.omx/artifacts/frontend/research-b/unif-results-mobile.png) | Two columns from y120, high density; white labels disappear on cream shirt; coupon covers lower card. |

## In-depth walkthroughs: completed work and gaps

All additional captures are dated 2026-09-12; exact UTC timestamps and final URLs are in `{site}-walk.json` / `{site}-walk-repair.json`. D is 1440×1000. Additional `walk-mobile-filter` captures were made by **resizing a desktop context to 390×844**, so they demonstrate a narrow responsive layout, not a full mobile user agent. Every link below was opened in an image viewer. These are **four in-depth slices, not four fully completed end-to-end scenarios**.

| Site / state / URL | Capture | 2–4 concrete observations | Limitations |
|---|---|---|---|
| Vinted / entered `paltas`, [home](https://www.vinted.lt/) / D | [Suggestions](../../.omx/artifacts/frontend/research-b/vinted-walk-suggestions.png) | Continuations `paltas rudeniui`, `paltas vilna` below wide field; separate action searches original string; remaining feed stays in context | Suggestions are not described as AI |
| Vinted / [submit](https://www.vinted.lt/catalog?search_text=paltas) / D | [Results](../../.omx/artifacts/frontend/research-b/vinted-walk-search-results.png) | Query persists in header; filters above grid; large ad block pushes products down | Filters later studied separately in outerwear, not presented as continuous query+filter sequence |
| Vinted / [outerwear](https://www.vinted.lt/catalog/1037-outerwear) / D | [Price popup](../../.omx/artifacts/frontend/research-b/vinted-walk-filter-open.png) | Small anchored min/max popup; minimum field has visible focus outline; category remains a chip | Screen-reader flow not measured |
| Vinted / category1037 + price_to150 / D | [Applied budget](../../.omx/artifacts/frontend/research-b/vinted-walk-price-selected.png) | Active `Didžiausia 150,00 €` chip appeared; maximum150 remains in popup; count/products updated below toolbar | Sorting not applied |
| Vinted / same state / D | [Sort options](../../.omx/artifacts/frontend/research-b/vinted-walk-sort-options.png) | Four radio options include cheaper/more expensive/newer; current relevance selected; ranking explanation link below | Options viewed, effects not tested |
| Vinted / [real item](https://www.vinted.lt/items/9965028002-skorzana-kurtka-niebieska-xxl?referrer=catalog) / D | [PDP](../../.omx/artifacts/frontend/research-b/vinted-walk-details.png) | Large photo mosaic; size/condition/material/colour right; two prices and buyer-protection explanation | Back returned category URL; separate run does not prove filter/scroll preservation |
| Vinted / outerwear / narrow | [Filter panel](../../.omx/artifacts/frontend/research-b/vinted-walk-mobile-filter.png) | Full-screen facet rows; Clear all top; wide Show results fixed bottom | Empty-query step stopped at ambiguous selector; empty state not confirmed |
| GLAMI / natural query / D | [Query panel](../../.omx/artifacts/frontend/research-b/glami-walk-natural-suggestions.png) | Original phrase fits large field; only same-phrase search chip below; blurred background and close control right | No visible semantic interpretation found |
| GLAMI / [natural-query result](https://www.glami.lt/?q=juodas%20vilnonis%20paltas%20iki%20150%20eur%C5%B3) / D | [Zero results](../../.omx/artifacts/frontend/research-b/glami-walk-natural-results.png) | `0` found; original query persists; clear empty text suggests changing query and shows categories | Accepted, but **not proof of AI**: no extracted budget/material chips; result empty |
| GLAMI / women’s clothing / D | [Price modal](../../.omx/artifacts/frontend/research-b/glami-walk-filter-open.png) | Facet rail left; min/max and preset ranges right; separate Apply; wide lower Show results/count | Price not applied |
| GLAMI / women’s clothing / narrow | [Filter panel](../../.omx/artifacts/frontend/research-b/glami-walk-mobile-filter.png) | Two-column groups/values; category counts; result button below; long left labels truncate | PDP/back not completed: no reliable local product link without outbound assumption |
| Ganni / clothing / D | [Filter drawer](../../.omx/artifacts/frontend/research-b/ganni-walk-filter-open.png) | Right half allocated to panel; Sort/Colour/Size/Material accordions; View Items(441) below; grid dimmed | Query/PDP not confirmed: generic `.html` opened delivery help, **not a product**; `ganni-walk-details.png` excluded as PDP. Exact product-link retry timed out |
| Boden / [Maeve dress](https://www.boden.com/products/women-maeve-check-midi-shirt-dress-green-navy-and-red-check-d1798grn) / D | [PDP](../../.omx/artifacts/frontend/research-b/boden-walk-details.png) | Two large photos; price/colour/fit and size in separate groups; delivery/returns under CTA; interest counter undesirable for Weft | Back returned dresses category. Add to bag not clicked; filters/search did not open successfully |

Ganni/Boden captures named `walk-mobile-filter` actually show a **closed** panel/toolbar; filenames are not evidence of an open drawer. Likewise, `boden-walk-filter-open.png` is a catalogue with a visible Filter button, not a successfully opened filter. They are not among the four primary captures and do not increase walkthrough coverage. Selector errors are retained rather than presented as site defects.

### Small reference board

[Open board PNG](../../.omx/artifacts/frontend/research-b/reference-board.png) · [reproducible HTML](../../.omx/artifacts/frontend/research-b/reference-board.html).

Four fragments: Vinted—field/suggestions; Everlane—grid; GLAMI—mobile refinement; Boden—product details. Captions explain purpose and limitations. This is an internal analytical composition of real captures; no commercial photography was transferred to public Weft assets.

## Comparable ratings, 1–5

Directional expert ratings of observed surfaces, not a laboratory accessibility audit. State score means visibility of state/return behavior in the reviewed sample; confidence is lower without a completed scenario. 1 means materially obstructive; 3 acceptable or involving tradeoffs; 5 a strong solution for that criterion, not an unconditionally superior product.

S=search clarity; C=catalogue; M=mobile usability; H=hierarchy; I=product information; F=filters; A=accessibility of key actions; T=state management; D=appropriateness of discovery; V=visual character.

| Site | S | C | M | H | I | F | A | T | D | V |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GLAMI | 5 | 4 | 3 | 4 | 5 | 5 | 4 | 4 | 5 | 4 |
| Vinted | 5 | 4 | 4 | 3 | 5 | 4 | 4 | 4 | 4 | 3 |
| Everlane | 3 | 5 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 |
| Reformation | 3 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 5 |
| Ganni | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 5 |
| Acne Studios | 2 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 5 |
| Arc’teryx | 3 | 3 | 3 | 3 | 4 | 4 | 4 | 3 | 5 | 4 |
| Boden | 3 | 4 | 4 | 4 | 5 | 3 | 4 | 4 | 4 | 5 |
| Rains | 3 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 4 | 5 |
| UNIF | 2 | 3 | 3 | 2 | 2 | 3 | 2 | 3 | 3 | 5 |

Extreme ratings: GLAMI/Vinted S5 reflects a dominant explicit field, not one small icon. GLAMI I5 reflects store, sizes, and price on aggregator cards; Vinted I5 condition/size and two explained prices; Boden I5 fit/size/shipping on PDP. Everlane/Ganni C5 reflects large even photos and metadata outside images. V5 for fashion brands means recognizable art direction, not permission to copy it. Acne/UNIF S2/A2 reflects compact ambiguous icons; Rains A2 a filter physically covering information. UNIF I2/H2 reflects insufficient predictable text contrast on photos. No rating claims WCAG conformance.

## AI: official facts separated from interactive verification

| Product | Dated/official evidence | What it establishes | Status in this research |
|---|---|---|---|
| Lyst | [AI-powered search FAQ](https://www.lyst.com/help/ai-powered-search/), undated, reviewed 2026-09-12 | Occasion/style/material/fit/budget queries; conversational answer and/or products may appear; accuracy not guaranteed and ranking may include commercial factors | **Officially stated current feature**; browser returned 403, not tested interactively |
| Lyst Lens | [Official app help](https://help.lyst.com/hc/en-gb/articles/36133679317778-What-can-I-do-on-the-Lyst-App), updated 2026-08-05 | Search for visually similar clothing from a photo in the app | Officially stated; app not installed, no photos uploaded |
| Zalando Assistant | [Announcement, 2024-10-01](https://corporate.zalando.com/en/technology/zalando-brings-its-ai-powered-assistant-all-markets-and-adds-four-new-cities-its-trend); [FY2025, 2026-03-12](https://corporate.zalando.com/en/investor-relations/zalando-full-year-2025-results) | Beta announced for signed-in customers in 25 markets then; later report states 6 million Assistant users | Current existence supported officially, **not** hands-on without account; 25 markets not carried forward as today’s count |
| GLAMI | [Official company page](https://www.glami.group/), reviewed 2026-09-12 | AI text/image classification, similarity, and recommendations for fashion aggregation | Public LT catalogue/search reviewed; ordinary chips not proof of AI. Old Czechia ChatGPT experiment not proof of live LT assistant |
| Daydream | [Official About](https://daydream.ing/about), reviewed 2026-09-12 | Natural-language/multimodal fashion discovery positioned officially as AI shopping | Interactive browser returned 429; excluded from visual 10 and not called hands-on |
| Depop | [Announcement, 2024-09-12](https://news.depop.com/depop-launches-ai-powered-listing-from-one-photo/) | AI helps sellers create listing from photo | Seller tooling, **not** proof of buyer natural-language discovery; site returned 403 |

Practical inference: Weft can present query parsing as editable constraints and confirmed match attributes; ordinary suggestions must not be called AI, and personalization must not be promised before implementation. Official feature availability and a verified market/account are different evidence categories.

## Principles for Weft and verification criteria

1. Problem: brand heroes often displace clothing and search. Change: natural query is primary entry; no second huge hero on results. Check: field and at least top of first product row visible at 390×844.
2. Problem: GLAMI/Arc’teryx categories occupy nearly all mobile screen. Change: one compact horizontal row plus All filters. Check: intro no taller than result lead-in.
3. Problem: Rains/Reformation floating controls cover products. Change: in-flow toolbar or reserved space for sticky one. Check: price/name and focus never covered.
4. Problem: aggregator without store loses context. Change: neutral demo store beside price and honest demo status. Check: source clear without PDP; real retailer slugs never appear.
5. Problem: long query disappears into small field. Change: preserve query and active constraint chips. Check: query/budget/store readable after filtering and Back.
6. Problem: UNIF white text over photos is unpredictable. Change: name, price, store outside image on stable background. Check: light/dark/error images do not alter metadata contrast.
7. Problem: icon-only chrome requires guessing. Change: label Search/Filters/Clear; icons supplement. Check: keyboard access, accessible name, visible focus.
8. Problem: facets fragmented across popups. Change: one mobile panel with draft selection, clear, explicit Apply/count. Check: closing applies no unexpected changes and returns focus.
9. Problem: loud promotions and urgency distract. Change: one distinctive accent, typography, clothing; no fake popularity/discounts. Check: primary CTA does not compete with ten badges.
10. Problem: AI presented as magic. Change: interpret natural query, expose editable budget, give short data-based explanation; AI error differs from empty catalogue. Check: AI success/fallback/error distinguishable without false promises.

Realistic opportunities remain **hypotheses**, not proven superiority: (a) show query, budget, store without second screen; (b) change budget in one clear action; (c) preserve query/filter/scroll when returning from details; (d) distinguish no matches, loading error, and demo catalogue. Criterion: observable screenshot/E2E states, not invented A/B uplift.

For accessibility, use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) for focus, contrast, target size, and reflow, and [Core Web Vitals](https://web.dev/articles/vitals) for performance. Research PNGs prove nothing about field CWV; Weft needs separate measurements without invented competitor scores.

## Handoff

All third-party PNGs are internal analytical material in `.omx/artifacts`, not production assets. Do not use competitor photography in Weft. Primary transfers for the decision log: GLAMI search prominence → SearchSurface; Everlane/Ganni grid rhythm → ProductCard; GLAMI/Ganni refinement panel → mobile Filters; Vinted/Boden attribute clarity → ProductDetails; UNIF/Rains contrast/overlay counterexamples → visual regression checks. Component names here are semantic, not claims about existing repository symbols; the lead should connect them to actual changes and tests.
