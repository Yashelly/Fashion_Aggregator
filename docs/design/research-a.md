# Market research A — 10 fashion interfaces

## Three mobile walkthroughs — actual coverage and gaps

All 17 final walkthrough PNGs were opened and reviewed; dimensions were 390×844 CSS/DPR3, with LT/LT/EUR for Reserved/MODIVO and LT/EN/EUR for Colorful Standard. These captures supplement the primary 40 rather than replacing the four surfaces. Search tracking parameters were removed from PDP links.

Reserved: input → real suggestions → Enter → results → filter sheet → price ascending → PDP → browser back (remained on PDP) → explicit saved results URL. MODIVO: input → category/product suggestions → Enter → results → filters → PDP → browser back (results restored). Colorful Standard: enter tee → product suggestions → Enter → results → filters → Apply → PDP → browser back (results restored).

Limitations: selected size/color filters and the empty state were not confirmed; the MODIVO discount switch could not be activated with a normal locator without force, and no bypass was used; numeric price inputs were not found as `type=number`, so no budget change is claimed. Colorful Standard's Apply(3) is observed text, not proof that the user selected three filters. Sorting was completed on Reserved; for the other sites, only the panel was reviewed. Full mobile menu/focus/keyboard testing was not performed. These are therefore three substantive but non-exhaustive walkthroughs against the full extended checklist.

| Site / state | Date | URL | File | Observations |
|---|---|---|---|---|
| reserved / suggestions / 390×844 | 2026-09-12T12:48:04.354967+03:00 | [page](https://www.reserved.com/lt/lt/?query=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-suggestions.png) | The `suknelė` query remains in the wide field; the dropdown offers phrase variants; results are visible beneath the suggestions. |
| reserved / search-results / 390×844 | 2026-09-12T12:48:09.269588+03:00 | [page](https://www.reserved.com/lt/lt/?query=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-search-results.png) | The query is repeated in the heading; a count of 1240 appears by Filter; two columns of dresses are shown. |
| reserved / filters / 390×844 | 2026-09-12T12:48:10.710266+03:00 | [page](https://www.reserved.com/lt/lt/?query=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-filters.png) | Full-screen panel with large sorting rows; gender categories appear below; the bottom CTA displays a count. |
| reserved / sort-selected / 390×844 | 2026-09-12T12:48:12.14264+03:00 | [page](https://www.reserved.com/lt/lt/?query=suknel%C4%97&sort=product_res_lt_lt_final_price_asc) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-sort-selected.png) | Price ascending is highlighted with a background; `sort` appears in the URL; the bottom CTA retains the count. |
| reserved / details / 390×844 | 2026-09-12T12:48:14.662317+03:00 | [page](https://www.reserved.com/lt/lt/medvilniniai-sortai-2-vnt-minnie-mouse-218ep-03x) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-details.png) | A low-priced item from the sorted results is opened (shorts, not a dress); the photograph dominates; the sticky purchase action was not clicked. |
| reserved / return-results / 390×844 | 2026-09-12T12:48:16.058062+03:00 | [page](https://www.reserved.com/lt/lt/medvilniniai-sortai-2-vnt-minnie-mouse-218ep-03x) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-return-results.png) | Browser back left the user on the PDP at the same URL; the same image is visible; return to search was not confirmed. |
| reserved / explicit-return-results / 390×844 | 2026-09-12T12:48:18.384671+03:00 | [page](https://www.reserved.com/lt/lt/?query=suknel%C4%97&sort=product_res_lt_lt_final_price_asc) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-explicit-return-results.png) | Explicit navigation to the saved results URL restored the query and sort; prices begin with the least expensive items; the first card's name is truncated. |
| modivo / suggestions / 390×844 | 2026-09-12T12:48:33.343622+03:00 | [page](https://modivo.lt/?cookie_consent=true) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-suggestions.png) | Category suggestions occupy the top; the `suknelė` query is visible; matching products begin below. |
| modivo / search-results / 390×844 | 2026-09-12T12:48:38.210468+03:00 | [page](https://modivo.lt/s/suknel%C4%97?q=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-search-results.png) | The query is repeated prominently in the heading; gender chips are available; the bottom split Sort/Filter control is visible. |
| modivo / filters / 390×844 | 2026-09-12T12:48:39.594496+03:00 | [page](https://modivo.lt/s/suknel%C4%97?q=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-filters.png) | A single sheet contains minimum/maximum price fields and a slider; size/color/brand are separate rows; `Grįžti į produktus` appears at the bottom. |
| modivo / details / 390×844 | 2026-09-12T12:48:43.866773+03:00 | [page](https://modivo.lt/p/reebok-kasdienine-suknele-reebok-x-ewa-chodakowska-rk25617ccw-juoda-slim-fit-0000305907660) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-details.png) | A Reebok dress is opened; the image is large; search and category remain at the top, while the price is below the first viewport. |
| modivo / return-results / 390×844 | 2026-09-12T12:48:48.013683+03:00 | [page](https://modivo.lt/s/suknel%C4%97?q=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-return-results.png) | Browser back restored the query and grid; the count of 6346 is visible again; Sort/Filter was retained. |
| colorfulstandard / suggestions / 390×844 | 2026-09-12T12:43:33.475763+03:00 | [page](https://colorfulstandard.com/) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-suggestions.png) | Autocomplete shows a small image, name, and price; the `tee` query is retained; Products/Suggestions/Collections are separated into tabs. |
| colorfulstandard / search-results / 390×844 | 2026-09-12T12:43:38.903013+03:00 | [page](https://colorfulstandard.com/search?q=tee&type=product) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-search-results.png) | The heading contains the query and a count of 1000; two columns are shown; price and colors are available without opening a PDP. |
| colorfulstandard / filters / 390×844 | 2026-09-12T12:43:40.40533+03:00 | [page](https://colorfulstandard.com/search?q=tee&type=product) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-filters.png) | One sheet with Sort/Gender/Size/Category/Material accordions; Apply is at the bottom and an explicit Close action is at the top. |
| colorfulstandard / details / 390×844 | 2026-09-12T12:43:42.972707+03:00 | [page](https://colorfulstandard.com/products/classic-organic-tee-t-shirt-optical-white-male) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-details.png) | A real Classic Organic Tee is opened rather than the gift card from an earlier failed attempt; a large front view is followed by a strip of angle thumbnails. |
| colorfulstandard / return-results / 390×844 | 2026-09-12T12:43:44.6607+03:00 | [page](https://colorfulstandard.com/search?q=tee&type=product) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-return-results.png) | Browser back restored the `tee` query and cards; price/swatches are visible again; the result position was restored near the first row. |


Observation date: 2026-09-12. Method: real headless Chromium through the installed Python Playwright, isolated contexts, 100% zoom; desktop 1440×1000 CSS px/DPR1, mobile 390×844 CSS px with iPhone 13 UA/DPR3 (physical PNG size 1170×2532). All 40 primary PNGs were opened in the viewing tool and reviewed. This is an expert snapshot, not a test of users, conversion, or WCAG accessibility. Prices and counts reflect the dynamic state at capture time.

Optional cookies were rejected through the available UI: Preferences/Statistics/Marketing were manually disabled for Asket, MODIVO settings were saved with optional cookies off, and the minimum selection was saved for LPP. The Sinsay mobile PLP was recaptured in a fresh context after an app promotion interfered with the first run; CSS and protective measures were not changed. Old failed artifacts were not counted. Screenshots are used internally only; commercial images were not transferred into the public Weft site.

## Evidence matrix

Facts cover the market, observed structure, and source. Strengths, weaknesses, and transferability are expert interpretations of those facts. Home and catalog were reviewed at two widths for every row; a catalog is accepted in place of query results. Asket, Kotn, and Colorful Standard were selected based on an operating retail network and visual relevance, not on a claim that they are mass-market brands.

| Product | Type | Market | Presence signal / primary source | Actually reviewed | Desktop strengths | Mobile strengths | Weaknesses | AI/discovery status | For Weft | Do not transfer | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UNIQLO | Mass-market | LT / EN / EUR | [Fast Retailing Annual Report 2025](https://www.fastretailing.com/eng/ir/library/pdf/ar2025_en.pdf), retail network and European presence | 4 home/catalog captures | 4 columns, color/size below image | Wide search, 2 columns | Large category row pushes products down | Image categories; AI not confirmed | Simple image frame and variants | Full-screen hero in results | [captures](#uniqlo) |
| Reserved | Mass-market | LT / LT / EUR | [LPP](https://www.lpp.com/en/about-us/), one of the group's five brands across 46 markets; this describes the group, not Reserved's audience | 4 home/catalog captures | Left taxonomy, name/price/reviews | Visible search field, text Filter | Tall header and promotion, geolocation toast | `suknelė` search tested; AI not confirmed | Query remains above grid | Excessively tall promotion bar | [captures](#reserved) |
| ABOUT YOU | Multi-brand | LT / LT / EUR | [Zalando FY2025](https://corporate.zalando.com/en/investor-relations/zalando-full-year-2025-results), ABOUT YOU is part of the group; 62 million refers to the full group | 4 home/catalog captures | Detailed labeled filters | Floating filter/sort panel | Neon sale dominates; app banner | “Your offers” visible; personalization/AI not tested | Clear unified refinement CTA | Countdown and layered advertising | [captures](#aboutyou) |
| MODIVO | Multi-brand | LT / LT / EUR | [MODIVO Group Q1 2026](https://modivoplatform.com/en/download/pobierz/interim-condensed-consolidated-report-of-the-modivo-group-for-the-three-months-of-2026), official CEE operating report | 4 home/catalog captures | Wide search, brand/name/price | Large search field, separate Sort/Filter | Tall promotion header; bottom panel covers metadata | Search available; AI not confirmed | Separate card brand and name | Do not transfer retailer promises | [captures](#modivo) |
| Sinsay | Value mass-market | LT / LT / EUR | [LPP](https://www.lpp.com/en/about-us/), a distinct group brand with an international network | 4 home/catalog captures | Visible prices and filters | Image categories, 2 columns | Delivery banner takes substantial space; app promotion interfered with the first run | Editorial categories; AI not confirmed | Visual subcategories only when needed | App-install takeover | [captures](#sinsay) |
| MOHITO | Mass-market fashion | LT / LT / EUR | [LPP](https://www.lpp.com/en/about-us/), a distinct group brand rather than a regional copy of Reserved | 4 home/catalog captures | Early 4-column grid, short toolbar | Search on its own row, 2 columns | Header is somewhat tall; geolocation toast | Categories and editorial; AI not confirmed | Short toolbar before products | Copying the branded denim hero | [captures](#mohito) |
| Asket | Contemporary DTC | EU / EN / EUR | [Official site and store navigation](https://www.asket.com/en-se), London/Stockholm; evidence of a network, not mass-market scale | 4 home/catalog captures | Quiet 4-column grid without sidebar | Text Search/Menu, 2 columns | Long introduction; difficult cookie refusal | Collections; AI not confirmed | Neutral foundation and concise metadata | Preselected optional cookies | [captures](#asket) |
| Kotn | Contemporary DTC | Canada / EN / CAD | [Official help/store directory](https://kotn.com/help), operating retail network; [B Lab](https://www.bcorporation.net/en-us/find-a-b-corp/company/kotn/) confirms the company, not traffic | 4 home/catalog captures | 4 columns, calm typographic rhythm | 2 columns, explicit Filter+Sort | Chat/accessibility bubbles cover corners; truncated names | Editorial collections; chat presence does not prove AI | Large price and consistent image ratio | CAD, delivery, and checkout expectations | [captures](#kotn) |
| Colorful Standard | Contemporary DTC | LT / EN / EUR | [Official multi-city store directory](https://colorfulstandard.com/), Antwerp/Berlin/Copenhagen/London and others; not MAU evidence | 4 home/catalog captures | Dense 5-column grid and swatches | 2 columns and reachable bottom filter | Floating control covers lower content | Product autocomplete tested; AI not confirmed | One refinement panel and price in suggestions | 42 variants when Weft lacks such data | [captures](#colorfulstandard) |
| Soulz | Baltic multi-brand | LT / LT / EUR | [Apranga history](https://aprangagroup.lt/lt/istorija/istorija), Soulz launched in Lithuania in 2019 and Latvia/Estonia in 2021; separate storefront | 4 home/catalog captures | Brand/price, quick-delivery filter | 2 columns, category chips | App/newsletter bars consume height | Categories; sparkle by search does not prove AI | Store/brand beside price | App promotion in the first viewport | [captures](#soulz) |

## Expert ratings, 1–5

Order: search / catalog / mobile / hierarchy / product information / filters / accessibility of key actions / state management / discovery appropriateness / character. A score of 3 means functional but compromised. State ratings without a walkthrough are provisional: they reflect only the visible current context, not proof of back/focus preservation. Action accessibility is rated by visibility, size, and labeling, not as accessibility certification. Discovery also includes categories/editorial; this is not an AI rating.

| Product | Search / Catalog / Mobile / Hierarchy / Product info / Filters / Actions / State / Discovery / Character |
|---|---|
| UNIQLO | 4/5/4/4/5/4/4/3/4/4 |
| Reserved | 5/4/4/4/4/4/4/2/3/4 |
| ABOUT YOU | 4/4/3/3/4/4/4/3/3/3 |
| MODIVO | 5/4/4/4/5/4/4/3/3/3 |
| Sinsay | 4/3/3/3/4/4/3/3/3/3 |
| MOHITO | 4/4/4/4/4/4/4/3/3/4 |
| Asket | 4/5/4/5/4/4/4/3/4/5 |
| Kotn | 4/4/4/4/4/3/4/3/4/5 |
| Colorful Standard | 4/5/4/4/5/4/4/4/4/5 |
| Soulz | 3/4/3/4/4/4/3/3/3/4 |

Extreme ratings: Reserved/MODIVO receive 5 for search because of an explicit wide field, not ranking quality. UNIQLO/Asket/Colorful Standard receive 5 for catalog due to comparable images and available metadata; UNIQLO/MODIVO/Colorful Standard receive 5 for product information because they expose color/size or brand plus variants. Asket receives 5 for hierarchy because there is almost no competing promotional advertising. Asket/Kotn/Colorful Standard receive 5 for character because each uses a distinct, recognizable photographic approach within a calm frame. Reserved receives 2 for state because browser back remained in the PDP gallery in the observed scenario; this is not proof of a universal site defect.

## Frame-by-frame log

Each row records the actual URL, date/time (ISO with time zone), region and language, CSS viewport, state, file, and specific visible observations. Each brand's machine-readable log sits alongside it as `<site>.json`; it also contains the requested URL and capture text. The first two rows in each group are desktop and the final two are mobile.

### uniqlo

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://www.uniqlo.com/eu-lt/en/) | 2026-09-12T12:31:52.535818+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-desktop-home.png) | Two portrait panels fill nearly the entire screen; the white search capsule contrasts with the image; a video pause control is present. |
| desktop results / 1440×1000 | [page](https://www.uniqlo.com/eu-lt/en/women/skirts-and-dress) | 2026-09-12T12:31:57.346392+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-desktop-results.png) | Four cards per row; image categories above the grid consume height; color variants and size range appear below the image. |
| mobile home / 390×844 | [page](https://www.uniqlo.com/eu-lt/en/) | 2026-09-12T12:32:03.354044+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-mobile-home.png) | Search is labeled with text in the top row; a single portrait dominates; categories appear only at the lower edge. |
| mobile results / 390×844 | [page](https://www.uniqlo.com/eu-lt/en/women/skirts-and-dress) | 2026-09-12T12:32:08.624442+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-mobile-results.png) | Two image columns; Filter and sort is text-labeled; the category block pushes the first products down. |

### reserved

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://www.reserved.com/lt/lt/) | 2026-09-12T12:31:53.177309+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-desktop-home.png) | Large fashion hero with a yellow promotion bar; search on the right; the header takes noticeable height. |
| desktop results / 1440×1000 | [page](https://www.reserved.com/lt/lt/moterims/sukneles) | 2026-09-12T12:31:57.875585+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-desktop-results.png) | Categories on the left; four product columns; names, prices, and reviews fit in the first viewport. |
| mobile home / 390×844 | [page](https://www.reserved.com/lt/lt/) | 2026-09-12T12:32:05.327199+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-mobile-home.png) | Search occupies nearly the full width of a separate row; logo and labeled account icons sit above; a region toast sits below. |
| mobile results / 390×844 | [page](https://www.reserved.com/lt/lt/moterims/sukneles) | 2026-09-12T12:32:11.86302+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-mobile-results.png) | Two product columns; the count is associated with the heading; separate sort and filter controls appear above the grid. |

### aboutyou

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://www.aboutyou.lt/mano-parduotuve) | 2026-09-12T12:34:33.570564+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-desktop-home.png) | Wide split hero and category CTAs; trust/promotion rows repeat; large neon treatment draws attention away. |
| desktop results / 1440×1000 | [page](https://www.aboutyou.lt/c/moterims/drabuziai/sukneles-20236) | 2026-09-12T12:34:37.701413+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-desktop-results.png) | Left taxonomy and several rows of filter chips; four columns; a large banner pushes the grid down. |
| mobile home / 390×844 | [page](https://www.aboutyou.lt/) | 2026-09-12T12:34:42.674502+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-mobile-home.png) | App banner occupies the top; gender categories are labeled; a neon block fills most of the viewport. |
| mobile results / 390×844 | [page](https://www.aboutyou.lt/c/moterims/drabuziai/sukneles-20236) | 2026-09-12T12:34:46.914201+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-mobile-results.png) | Two columns with brand and prices; floating `Filtruoti ir rūšiuoti`; several price lines make quick comparison harder. |

### modivo

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://modivo.lt/) | 2026-09-12T12:35:06.092082+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-desktop-home.png) | Wide search field in the header; three demographic tiles; brand logos form a separate entry point. |
| desktop results / 1440×1000 | [page](https://modivo.lt/c/moterims/drabuziai/sukneles-ir-kombinezonai) | 2026-09-12T12:35:11.72596+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-desktop-results.png) | Four columns on a neutral background; categories on the left; size/color/price filters are explicitly labeled. |
| mobile home / 390×844 | [page](https://modivo.lt/?cookie_consent=true) | 2026-09-12T12:35:16.888832+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-mobile-home.png) | Full-width search below the logo; large text before the fashion image; a promotion row adds height. |
| mobile results / 390×844 | [page](https://modivo.lt/c/moterims/drabuziai/sukneles-ir-kombinezonai) | 2026-09-12T12:35:23.190806+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-mobile-results.png) | Two columns with bold brand names; horizontal category chips; the fixed Sort/Filter panel partly covers the lower price. |

### sinsay

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://www.sinsay.com/lt/lt/) | 2026-09-12T12:32:17.769506+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-desktop-home.png) | Lifestyle hero with clear categories below; several promotion rows; search visible in the header. |
| desktop results / 1440×1000 | [page](https://www.sinsay.com/lt/lt/moterims/drabuziai/sukneles) | 2026-09-12T12:32:22.300763+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-desktop-results.png) | Four columns; large delivery banner above the assortment; filters separated from categories. |
| mobile home / 390×844 | [page](https://www.sinsay.com/lt/lt/) | 2026-09-12T12:32:28.510791+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-mobile-home.png) | Compact logo/icons; round categories use little width; a region toast covers lower content. |
| mobile results / 390×844 | [page](https://www.sinsay.com/lt/lt/moterims/drabuziai/sukneles) | 2026-09-12T12:42:49.224764+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-mobile-results.png) | Useful labeled Filter and price/size chips; two columns appear only near the lower part of the screen; delivery messaging is duplicated in the banner and header. |

### mohito

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://www.mohito.com/lt/lt/) | 2026-09-12T12:32:32.004745+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-desktop-home.png) | Large denim crop sets the character; the blue CTA contrasts; search appears in a separate capsule. |
| desktop results / 1440×1000 | [page](https://www.mohito.com/lt/lt/drabuziai/sukneles-kombinezonai) | 2026-09-12T12:32:36.781108+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-desktop-results.png) | Four columns begin relatively early; taxonomy sits on the left; names and euro prices are readable. |
| mobile home / 390×844 | [page](https://www.mohito.com/lt/lt/) | 2026-09-12T12:32:43.725752+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-mobile-home.png) | The image retains a large crop; the search field is visible; a geolocation toast covers the lower area. |
| mobile results / 390×844 | [page](https://www.mohito.com/lt/lt/drabuziai/sukneles-kombinezonai) | 2026-09-12T12:32:49.134576+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-mobile-results.png) | Two columns and labeled filters; count beside the name; horizontal subcategories save vertical space. |

### asket

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://www.asket.com/en-eu/) | 2026-09-12T12:32:34.143703+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-desktop-home.png) | Short typographic introduction above a diptych; photography begins below the description; almost no decorative UI. |
| desktop results / 1440×1000 | [page](https://www.asket.com/en-eu/womens) | 2026-09-12T12:32:38.049151+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-desktop-results.png) | Four consistent cards; horizontal categories/filters instead of a sidebar; compact seasonal chips. |
| mobile home / 390×844 | [page](https://www.asket.com/en-eu/) | 2026-09-12T12:32:44.744168+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-mobile-home.png) | Search/Account/Cart/Menu are text-labeled; the introductory paragraph occupies most of the upper area; imagery remains large. |
| mobile results / 390×844 | [page](https://www.asket.com/en-eu/womens) | 2026-09-12T12:32:49.390873+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-mobile-results.png) | Two columns with price and color; Filters is a separate text action; neutral imagery and calm spacing. |

### kotn

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://kotn.com/) | 2026-09-12T12:32:40.781312+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-desktop-home.png) | Warm interior and contrasting teal garment; large seasonal typography; underlined Shop now at the lower edge. |
| desktop results / 1440×1000 | [page](https://kotn.com/collections/womens) | 2026-09-12T12:32:45.376852+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-desktop-results.png) | Four columns below a short introduction; only a few dropdowns; swatches visible below name/price. |
| mobile home / 390×844 | [page](https://kotn.com/) | 2026-09-12T12:32:51.237827+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-mobile-home.png) | Single editorial photograph with large text; minimal chrome; two floating widgets in the corners. |
| mobile results / 390×844 | [page](https://kotn.com/collections/womens) | 2026-09-12T12:32:55.782808+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-mobile-results.png) | Two columns begin after the introduction; wide Filter+Sort row; price and swatches are readable, while names are partly truncated. |

### colorfulstandard

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://colorfulstandard.com/) | 2026-09-12T12:32:55.158747+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-desktop-home.png) | Three equal-width image panels; buttons are labeled by garment type; color is concentrated in products rather than the UI. |
| desktop results / 1440×1000 | [page](https://colorfulstandard.com/collections/all-womens-apparel-accessories) | 2026-09-12T12:33:00.107768+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-desktop-results.png) | Five columns without a sidebar; name, price, colors, color count, and sizes are grouped; consistent image ratio. |
| mobile home / 390×844 | [page](https://colorfulstandard.com/) | 2026-09-12T12:33:07.529995+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-mobile-home.png) | Panels stack vertically; explicit category CTA; simple icon navigation. |
| mobile results / 390×844 | [page](https://colorfulstandard.com/collections/all-womens-apparel-accessories) | 2026-09-12T12:33:13.146568+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-mobile-results.png) | Two columns with name and price; floating Filter and sort; swatches and sizes available without a PDP. |

### soulz

| State / viewport | URL | Date / market | File | Visual facts |
|---|---|---|---|---|
| desktop home / 1440×1000 | [page](https://soulz.lt/lt/moterims) | 2026-09-12T12:32:14.209444+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-desktop-home.png) | Large fashion hero with app-sale messaging; two navigation rows; utility actions use separate icons. |
| desktop results / 1440×1000 | [page](https://soulz.lt/lt/c/moterys/drabuziai/sukneles-31-1) | 2026-09-12T12:32:18.50428+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-desktop-results.png) | Four columns and a sidebar; bold price and brand; quick-delivery toggle explicitly labeled. |
| mobile home / 390×844 | [page](https://soulz.lt/lt/moterims) | 2026-09-12T12:32:24.31246+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-mobile-home.png) | App banner and subscription consume substantial height; fashion hero remains readable; search is icon-only. |
| mobile results / 390×844 | [page](https://soulz.lt/lt/c/moterys/drabuziai/sukneles-31-1) | 2026-09-12T12:32:29.032968+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-mobile-results.png) | Two columns with brand and price; horizontal filter chips; unexplained ruler icon on the image. |

## Unsuccessful candidates — not included in the 10

Zalando displayed a branded unavailable page; ASOS, H&M, Zara, Mango, COS, ARKET, Pull&Bear, Bershka, Stradivarius, Massimo Dutti, and &Other Stories returned Access Denied; Urban Outfitters presented a challenge; Next returned a technical error; Boozt presented a region gate followed by a Cloudflare challenge; Answear returned ERR_CERT_COMMON_NAME_INVALID (certificate verification was not disabled). The Peek & Cloppenburg corporate route did not provide the required commerce catalog. The Apranga storefront leads to Soulz, so only Soulz was counted. Protective measures were not bypassed, and blocked candidates were not assigned zero scores. Their PNG/JSON files remain as an attempt log, not as substantive evidence.

## AI: evidentiary boundaries

None of these ten interfaces has interactively confirmed AI. Colorful Standard autocomplete and editorial categories are not labeled as AI. [Zalando officially announced an assistant expansion on 2024-10-01](https://corporate.zalando.com/en/technology/zalando-brings-its-ai-powered-assistant-all-markets-and-adds-four-new-cities-its-trend); that is the announcement date, not verification of current availability in Lithuania, because the storefront was blocked here. This material supports only an additional “conversational refinement” hypothesis, not a claim that working AI currently exists in the interface studied.

## Transferable decisions — hypotheses for the integrator

1. Problem: icons conceal mobile search. Change: prominent labeled search at entry; validation — a query can begin without opening a menu (Reserved/MODIVO).
2. Problem: promotions consume the catalog. Change: results without a hero and an introduction no taller than one short block; validation — real products appear in the first viewport (MOHITO versus Sinsay/ABOUT YOU).
3. Problem: refinement is fragmented across many screens. Change: one mobile sheet with a count and Apply; validation — price/category can change without leaving results (Colorful Standard).
4. Problem: constraint state is invisible. Change: show the query and active budget with Clear beside the grid; validation — they remain visible after submit and back (the Reserved walkthrough demonstrates the risk).
5. Problem: comparison is difficult. Change: consistent image ratio and a two-column mobile grid; validation — price and name are not horizontally truncated (all 10).
6. Problem: the source is unknown. Change: a neutral demo-store label on the card before clickout; validation — every card shows a public store (MODIVO/Soulz as structural references, not real stores).
7. Problem: decoration competes with clothing. Change: neutral canvas and one action accent; validation — permitted photography/typography creates the fashion character (Asket/Kotn/Colorful Standard).
8. Problem: a bare icon does not explain its action. Change: use text for Filters, Search, and Clear, plus accessible names for icon buttons; validation — the action is recognizable without a tooltip (Asket).
9. Problem: incidental navigation destroys search context. Change: the PDP receives a return URL containing query/filter/locale; validation — browser back and explicit back restore context (Reserved/Colorful Standard walkthroughs).
10. Problem: noise from counts/promotions is presented as utility. Change: display only available demo data and clearly distinguish loading/error/empty states; validation — do not invent ratings, availability, or AI explanations.

Realistic Weft advantages (not a proven win): query, budget, and store are visible simultaneously; all refinement is in one panel; empty results are distinct from a network error; viewing details preserves context. These criteria are validated through local screenshots and end-to-end tests, not through claims of increased conversion.

Reference-board candidates: Reserved mobile search (explicit field), Asket desktop catalog (quiet density), Colorful Standard mobile filters (single sheet), MODIVO mobile catalog (brand and price), Colorful Standard PDP (gallery). The integrator should assemble a small labeled board from multiple sources, without copying an entire page or taking photographs for the catalog.
