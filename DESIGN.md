# VIBEWEAR Design Contract

## Source of truth

- **Status:** Active for the production-preview MVP
- **Last refreshed:** 2026-07-29
- **Owner:** Product/design; implementation changes must cite this file
- **Primary product surfaces:** Home, search/results, stores/source status, clickout guard, legal/trust pages
- **Supported languages:** English and Lithuanian with equal visual priority
- **Supported viewport checks:** 375, 768, 1024, and 1440 CSS pixels
- **Decision priority:** Legal/data permission and accessibility constraints override visual preference. This document overrides incidental styling in the current application when the two conflict.

### Evidence reviewed

- `docs/mvp_prd.md` — product goal, audience, scope, launch phases, metrics, and affiliate boundaries
- `docs/no_design_wireframes.md` — required information architecture, product fields, states, disclosures, and route skeletons
- `docs/frontend_design_references.md` — current stack, motion guidance, and dependency constraints
- `docs/legal/affiliate_disclosure.md` — affiliate disclosure and retailer responsibility
- `docs/legal/data_source_policy.md` — approved-feed, imagery, source, correction, and no-checkout rules
- `docs/legal/privacy_policy_draft.md` — analytics, outbound tracking, consent, and third-party boundaries
- `docs/legal/terms_of_use_draft.md` — service limits, product-information caveats, and retailer responsibility
- `README.md` — current pre-affiliate/synthetic-data mode
- `data/store_tracker.csv` — application targets and non-approved status
- `data/mock_products.csv` — current synthetic data structure and risk of implying retailer association
- `package.json` — Next.js App Router, React, TypeScript, custom CSS, and `lucide-react`
- `app/globals.css` — existing high-contrast editorial shell, product grid, focus treatment, and reduced-motion handling
- `app/page.tsx`, `app/search/page.tsx`, `app/stores/page.tsx`, `app/out/[productId]/route.ts`
- `components/cinematic-hero.tsx`, `components/product-grid.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`
- `.codex/skills/ui-ux-pro-max` design-system search for fashion discovery and its UX/Next.js validation results

### Observed facts versus decisions

**Observed**

- The product is a fashion discovery publisher, not a seller, checkout, coupon site, or scraper.
- The current public experience is a pre-approval preview using mock records.
- No listed retailer is an approved live source yet.
- The application uses server-rendered Next.js routes, plain global CSS, and Lucide icons; Tailwind, shadcn/ui, and Motion are not installed.
- English and Lithuanian content already exist.
- The current UI uses a monochrome, cinematic, fashion-editorial direction but falls back to Arial and inconsistently uses rounded generic form controls.

**Design decisions**

- Keep the fashion-editorial foundation, but make it more ownable through a **runway index** motif: oversized issue numbering, ruled bands, hard color blocks, and asymmetric editorial crops.
- Use a warm paper base, near-black ink, and three disciplined signal colors rather than one-note beige, purple, or dark slate.
- Product discovery remains the visual lead. Legal/source status is always easy to find but is presented as a crisp editorial annotation, not a warning-card maze.
- Preview products must be unmistakably synthetic VIBEWEAR examples and must never appear to be sold by a named retailer.

---

## Aesthetic direction

### Purpose

Help Lithuanian shoppers turn a vague style idea into a focused set of products while making the preview site's data boundaries credible to affiliate reviewers.

### Tone

**Independent fashion magazine meets searchable store index.** Bold, fast, self-aware, and metropolitan; never luxury-cosplay, generic SaaS, or discount-marketplace clutter.

### Constraints

- Next.js App Router + React + TypeScript
- Custom CSS and CSS variables; no Tailwind/shadcn migration for this MVP
- Existing Lucide icon family only
- Server rendering first; client JavaScript only where interaction requires it
- Synthetic/original preview data and imagery only until explicit feed or merchant permission exists
- English and Lithuanian must wrap without truncation or layout breakage

### The memorable element

The **runway index rail** is the single signature device. Major sections and result groups use oversized two-digit numbers (`01`, `02`, `03`) aligned to a thin vertical or horizontal rule. On mobile the rail becomes a compact section stamp. It creates continuity across home, search, stores, and legal pages without adding decorative blobs, nested cards, or heavy chrome.

---

## Brand

### Personality

- Editorial, observant, energetic
- Direct rather than aspirationally vague
- Transparent about preview status and commercial relationships
- Local-market aware without using national clichés
- Fashion-forward without excluding practical shoppers

### Trust signals

- Persistent but quiet “Preview catalog · synthetic products” status near product-heavy surfaces
- Clear “Purchases happen on retailer websites” language
- Store status vocabulary tied to evidence: `Application target`, `Awaiting approval`, `Approved feed`
- Data Source Policy and Affiliate Disclosure visible in the footer and adjacent to results
- EUR formatting, Lithuanian copy, and complete legal navigation
- No fake star ratings, review counts, countdowns, stock pressure, coupons, or partnership logos

### Avoid

- Generic SaaS hero layouts, dashboards, or card-within-card compositions
- Purple gradients, gradient blobs, floating orbs, glass panels, and neon-on-dark tech aesthetics
- One-note beige, dusty mauve, or dark-slate monochrome
- Rounded “pill everything” styling
- Emoji as icons
- Fake retailer logos or partnership claims
- “Buy now,” “Add to cart,” or language implying VIBEWEAR checkout
- Trend language that reduces clarity, such as unexplained “AI curated” claims

---

## Product goals

### Goals

1. Make the concept understandable within 30 seconds: search fashion across sources, then buy from the retailer.
2. Make search the dominant action on home and search routes.
3. Demonstrate a believable end-to-end preview using clearly synthetic products.
4. Present VIBEWEAR as approval-ready through disciplined source status, disclosure, and legal content.
5. Preserve a direct path from product impression to an approved future clickout event without pretending the current preview item can be purchased.

### Non-goals

- Checkout, cart, accounts, saved boards, subscriptions, image upload, AI stylist chat, or marketplace seller tools
- Scraped product catalogs or copied retailer product pages
- Coupon or urgency-led merchandising
- A retailer-status dashboard for shoppers
- Heavy animation, 3D, parallax, or video that slows product inspection

### Success signals

- A first-time visitor can state what the service does and where checkout occurs.
- Search is discoverable without scrolling at every supported viewport.
- A keyboard-only user can search, filter, clear filters, inspect results, and return from the clickout guard.
- Affiliate reviewers can find source status and legal policies within one navigation action.
- Preview product cards cannot reasonably be mistaken for live retailer offers.
- Layout remains stable while images/fonts load; target CLS is below 0.1.

---

## Personas and jobs

### Primary personas

1. **Constraint-led shopper:** searches for “black boots under €100,” needs fast filtering and price clarity.
2. **Vibe-led shopper:** starts with “summer minimal” or “streetwear,” needs visual breadth and useful category prompts.
3. **Affiliate/merchant reviewer:** verifies product positioning, traffic path, disclosure, source rules, and whether the site misrepresents approval.

### User jobs

- Search by vibe, product, category, color, price, size, or source
- Compare a visual field without opening many retailer tabs
- Understand product price and availability at a glance
- Know whether an item is a demo or an approved live listing
- Leave VIBEWEAR through an explicit, trustworthy clickout flow when permitted
- Find source and legal policies quickly

### Key contexts of use

- One-handed mobile browsing from social or search traffic
- Tablet browsing with touch
- Desktop comparison with keyboard/mouse
- Slow mobile network and delayed images
- English or Lithuanian with browser zoom up to 200%

---

## Information architecture

### Primary navigation

- `Search`
- `Stores`
- `How it works`
- `About`
- Language control: `EN` / `LT`

At 375 and 768, show `Search`, `Stores`, and the language control in the header; place `How it works`, `About`, and legal links in the menu/footer. Do not overload the mobile header with all destinations.

### Core routes/screens

- `/` — home and discovery entry
- `/search` — query, filters, sort, results, and disclosure
- `/stores` — store/application-target ledger and source status
- `/stores/:storeSlug` — future approved-source detail; do not imply a live catalog before approval
- `/out/:productId` — preview guard now; approved tracked redirect later
- `/how-it-works`
- `/about`
- `/data-sources`
- `/affiliate-disclosure`
- `/privacy`
- `/terms`
- `/contact`
- Not found and product-unavailable states

### Content hierarchy

1. Current user task or route title
2. Primary search/action
3. Product/result content or page-specific explanation
4. Source/disclosure context
5. Secondary navigation and legal detail

Disclosures must not precede the main task as a blocking modal. They must remain visible near results and in the footer.

---

## Design principles

### 1. Search is the cover line

The search control is the homepage's primary CTA and the search page's persistent orientation point. It must be visually stronger than category links, store links, or editorial copy.

### 2. Product field, not card stack

Product results form a continuous visual field. Cards use image, typography, and ruled spacing; they do not sit inside rounded containers or nested panels.

### 3. Show the source boundary

Preview, application-target, approved-feed, unavailable, and affiliate states use precise text plus icon/shape—not color alone. Never hide legal status in a tooltip.

### 4. Editorial energy, operational clarity

Asymmetric scale and bold color belong in hero/section framing. Filters, prices, states, and legal content remain calm and predictable.

### 5. Mobile is browsing, not a compressed desktop

Prioritize search, active filters, product imagery, price, and the next action. Move secondary filters into a sheet and collapse secondary editorial copy.

### Tradeoffs

- Choose fast comprehension over cinematic motion.
- Choose fewer, stronger accents over a rainbow of merchant colors.
- Choose honest preview labels over a superficially “live” catalog.
- Choose text wrapping over truncation in both languages.
- Choose native controls and server-rendered forms before custom client widgets.

---

## Visual language

### Color

The default theme is light. Dark sections are intentional editorial interruptions, not a full dark-mode requirement for this MVP.

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Warm canvas | `--color-canvas` | `#F7F1E7` | Main page background |
| Clean surface | `--color-surface` | `#FFFDFC` | Inputs, menus, legal reading surface |
| Ink | `--color-ink` | `#15120F` | Primary text, primary buttons |
| Muted ink | `--color-ink-muted` | `#655F58` | Secondary text; 5.61:1 on canvas |
| Hairline | `--color-line` | `#C9C0B4` | Dividers only, never body text |
| Signal red | `--color-signal` | `#D53A2A` | Primary accent, sale, editorial numbering |
| Cobalt | `--color-cobalt` | `#2146D0` | Links, focus-supporting emphasis, informational state |
| Acid lime | `--color-acid` | `#C8F04B` | Preview label and selected-state highlight with ink text |
| Error | `--color-error` | `#B42318` | Error icon/text; 5.85:1 on canvas |
| Success | `--color-success` | `#146B45` | Approved/live status only; 5.81:1 on canvas |
| Disabled | `--color-disabled` | `#9B948B` | Disabled control foreground with additional disabled semantics |
| Scrim | `--color-scrim` | `rgba(21,18,15,.56)` | Menu/filter sheet backdrop |

Approved text/background pairings:

- Ink on canvas: 16.61:1
- Muted ink on canvas: 5.61:1
- White on signal red: 4.70:1
- White on cobalt: 7.36:1
- Ink on acid lime: 14.24:1

Do not use signal red with ink text for small controls. Do not place muted text on hairline or photographic backgrounds.

### Typography

Use `next/font/google` or self-hosted equivalents with `font-display: swap`. Confirm Lithuanian Latin Extended glyph coverage before implementation.

| Role | Typeface | Fallback | Weight | Notes |
| --- | --- | --- | --- | --- |
| Display/brand | **Syne** | `Arial Black`, sans-serif | 650–800 | Editorial titles, brand, runway index |
| Body/utility | **IBM Plex Sans** | Arial, sans-serif | 400–600 | Search, filters, product metadata, legal copy |
| Numeric accent | IBM Plex Sans tabular numerals | monospace | 500–600 | Prices, counts, section numbers |

Arial is fallback only, never the intended rendered face. Do not use Inter, Roboto, Space Grotesk, or a system-font-only stack.

Type tokens:

| Token | Size | Line height | Tracking | Use |
| --- | --- | --- | --- | --- |
| `--type-display-xl` | `clamp(3.5rem, 10vw, 8.75rem)` | `0.82` | `-0.035em` | Home statement |
| `--type-display-lg` | `clamp(2.75rem, 6vw, 5.5rem)` | `0.9` | `-0.025em` | Route titles |
| `--type-heading` | `clamp(1.75rem, 3vw, 3rem)` | `1.0` | `-0.015em` | Section headings |
| `--type-title` | `1.125rem` | `1.25` | `0` | Product/store title on large layouts |
| `--type-body` | `1rem` | `1.55` | `0` | Body and legal text |
| `--type-body-sm` | `0.875rem` | `1.45` | `0` | Metadata |
| `--type-label` | `0.75rem` | `1.2` | `0.08em` | Uppercase labels; never long prose |
| `--type-price` | `1rem` | `1.25` | `0` | Price with tabular figures |

Body copy must remain at least 16px on mobile. Product metadata may be 12–14px only when contrast and line height remain adequate. Legal reading measure is 62–72 characters.

### Spacing and layout rhythm

Use a 4px base and the following semantic scale:

| Token | Value |
| --- | --- |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |
| `--space-7` | `48px` |
| `--space-8` | `64px` |
| `--space-9` | `96px` |

Page gutters:

- 375: 16px
- 768: 24px
- 1024: 32px
- 1440: 48px

Maximum content width is `1376px`. Legal prose maxes at `760px`. Product grids may use the full content width.

### Shape, radius, border, and elevation

- Product media and editorial bands: `0px` radius
- Inputs/buttons: `0px` or `2px`; never rounded pills
- Drawer/sheet exposed corners: `12px` maximum
- Hairline: `1px solid var(--color-line)`
- Strong rule: `2px solid var(--color-ink)`
- Default elevation: none
- Sticky header/filter sheet: one restrained shadow token, `0 12px 32px rgba(21,18,15,.12)`
- No nested bordered panels. A component gets either a surface, a rule, or spacing separation—not all three by default.

### Motion

Motion communicates entry, selection, and spatial continuity.

| Interaction | Duration | Easing | Behavior |
| --- | --- | --- | --- |
| Hover/focus color | 140–180ms | `ease-out` | Color/border only |
| Product image hover | 180–220ms | `ease-out` | Max scale `1.015`; media bounds stay fixed |
| Filter sheet | 220–280ms | `cubic-bezier(.22,1,.36,1)` | Opacity + translate; focus moves into sheet |
| Results refresh | 180–240ms | `ease-out` | Subtle opacity; no large stagger |
| Page hero entry | 320–420ms | `cubic-bezier(.22,1,.36,1)` | Copy rises 12px; no blur or overshoot |

- No autoplay video, scroll-jacking, parallax, bounce, cursor effects, or continuous decorative animation.
- Never animate width/height for major layout changes.
- Under `prefers-reduced-motion: reduce`, remove nonessential transforms and show content immediately.
- Do not add Motion or Anime.js solely for these effects; CSS is sufficient for the MVP.

### Imagery and iconography

- Preview product images must be **synthetic, original, or commissioned/owned** and documented as safe for this preview.
- Do not use retailer product shots, product-page screenshots, copied descriptions, brand marks, or imagery that suggests a demo item belongs to a named store.
- Invented demo brands are allowed only when they cannot be confused with real retailers/brands.
- All preview images use a 4:5 aspect ratio, consistent neutral studio lighting, varied body representation, and no visible trademarks.
- Hero imagery must also be owned, generated, or explicitly licensed; preserve safe focal space for copy.
- Missing-image fallback is a designed editorial tile: canvas/cobalt block, item category, and `DEMO IMAGE` label. Do not use a broken-image icon or random stock replacement.
- Use Lucide outline icons at 16, 20, or 24px with consistent stroke width. Icons support labels; they do not replace critical text.
- Meaningful images receive descriptive alt text. Decorative collage/crop layers use empty alt text.

---

## Component contract

### Existing components to reuse or evolve

- `SiteHeader` — keep skip link, locale awareness, and centered wordmark concept
- `CinematicHero` — retain full-bleed impact but replace unsafe/ambiguous imagery and excessive blur animation
- `ProductGrid` — retain semantic section/article structure and responsive visual field
- `SiteFooter` — retain comprehensive legal links and locale awareness
- Native `form`, `input`, `select`, `details`, and `button` controls
- Lucide icons

### Global shell

- Sticky header, 64–88px depending on viewport
- Wordmark is centered at 1024+; at 375/768 it sits left and search/menu actions sit right
- Active route indicated with underline plus `aria-current="page"`
- Header becomes solid canvas after scroll; do not rely on backdrop blur for legibility
- Footer uses two ruled editorial columns, not a dark mega-footer card
- Skip link appears above all layers at `z-index: 50`

### Search field

- One clear text label, not placeholder-only
- Minimum height 48px; homepage version 56px at 768+
- Submit action is text plus Search icon
- Example query appears as helper/suggestion text; placeholder remains concise
- Enter submits; Escape closes suggestions if later added
- Loading state keeps the query visible and sets `aria-busy`
- Do not add autocomplete in the preview unless suggestions are real, relevant, keyboard operable, and debounced

### Category/index links

- Use the runway index stamp (`01`, `02`, etc.) and text link
- Minimum 44px interactive height
- Underline/arrow affordance appears without relying on hover
- Maximum six primary quick links on home

### Product tile

Required visible order:

1. Media
2. `SYNTHETIC PREVIEW` label
3. Invented brand/category
4. Product title
5. Price and optional comparison price
6. Color/size/availability summary
7. Preview action or approved retailer clickout action

Preview-mode rules:

- Source line says `VIBEWEAR demo`, not a retailer name.
- Action says `View demo details` or `Preview item`, not `View at [retailer]`.
- The tile must not link to a retailer homepage or product page.
- No disabled wishlist control is displayed. Remove unavailable future actions rather than showing inert chrome.

Approved-feed mode rules:

- Show retailer name only when approval/data permission is recorded.
- Action says `View at [retailer]` with External Link icon.
- Final price/stock caveat remains near the grid or clickout.
- Out-of-stock products are excluded by default; if shown, image and action clearly indicate unavailable.

Tile behavior:

- Whole image may be a link, but product text/action also provides an explicit link.
- The card itself is not a nested button.
- Hover reveals only image scale and underline; all essential information is already visible.
- Reserve media aspect ratio before image load.

### Filter system

- Primary controls: query, category, price, store/source, size, color
- Sort is visually separate from inclusion filters
- Active filters appear as removable chips with text and a close icon, minimum 44px hit area
- At 1024+, use a sticky 240–264px filter rail beside results
- Below 1024, use a `Filters (n)` button opening a bottom sheet or full-height dialog
- Sheet includes visible title, close button, `Clear all`, and a sticky `Show N results` action
- Applying filters updates the URL; browser Back restores the prior state
- Errors and result count use `aria-live="polite"`
- Never encode selected state through color alone; add checkmark, border, or `aria-pressed/selected`

### Store status row

The stores surface is a ruled ledger, not a grid of generic product cards.

- Store name
- Market
- Discovery fit/category summary
- Source/application status
- Product count only for approved live data; demo counts must not appear as retailer catalog counts
- Optional `Learn about source policy` link

Status vocabulary:

- `Application target` — not applied/approved
- `Awaiting approval` — application pending
- `Approved feed` — verified approval and permission
- `Paused` — market/source intentionally disabled

Never use `Partner`, `Official`, or a green live dot without verified approval.

### Disclosure strip

- One ruled horizontal band beneath the first result group and again before footer on product-heavy pages
- Preview: `All products shown are synthetic VIBEWEAR examples. No retailer catalog is live.`
- Live future state: affiliate disclosure plus retailer-final-source caveat
- Link to Data Source Policy
- Do not render as a dismissible banner; disclosure is persistent context

### Feedback primitives

- **Skeleton:** preserves final media/text geometry; no fast shimmer
- **Inline notice:** one strong top rule, icon, title, explanation, next action
- **Error:** error icon + explicit text + retry/clear action; `role="alert"`
- **Toast:** reserved for nonblocking client feedback, not legal or form errors
- **Dialog/sheet:** correct title association, focus trap, Escape close, focus return

### Z-index tokens

| Token | Value | Layer |
| --- | --- | --- |
| `--z-base` | `0` | Page |
| `--z-sticky` | `10` | Filter rail/sticky result bar |
| `--z-header` | `20` | Header |
| `--z-scrim` | `30` | Drawer scrim |
| `--z-sheet` | `40` | Drawer/dialog |
| `--z-skip` | `50` | Skip link |

Do not use arbitrary `9999` values or create unnecessary stacking contexts.

---

## Page contracts

### Home `/`

**Purpose:** Explain the service and start a search immediately.

Order:

1. Header
2. Full-bleed editorial hero with runway index `01`
3. Value statement: fashion discovery for Lithuanian stores
4. Search control
5. Four to six quick discovery links
6. Synthetic preview edit: 4–10 products with explicit demo disclosure
7. Store/source status teaser
8. How-it-works three-step rail
9. Footer

The hero must show both the emotional value (“shop by vibe”) and operational truth (“buy on retailer sites”). Do not hide the product explanation below a purely aesthetic headline.

States:

- Product preview loading: reserve the first product row
- No demo items: editorial empty state with search/category links
- No approved stores: default preview state, stated plainly

### Search `/search`

**Purpose:** Search, refine, inspect, and understand results.

Order:

1. Compact route title/runway index
2. Persistent query field
3. Result count and sort
4. Active filters
5. Filter rail/sheet and product field
6. Load more/pagination
7. Disclosure strip

Required states:

- Initial/no query: show discovery prompts and all synthetic demo items; do not say “0 results”
- Loading over 300ms: stable skeleton and `aria-busy`
- No results: repeat interpreted query, suggest removing filters, show two relevant category links
- Invalid filter combination: identify incompatible filters and provide one-click reset
- Feed temporarily unavailable: distinguish system failure from zero results
- Image missing: category-based editorial placeholder
- Offline/slow network: keep cached shell/query visible and explain retry

Result cards must not claim real retailer availability while using synthetic data.

### Stores `/stores`

**Purpose:** Show source ambitions and approval status without implying partnership.

Order:

1. Title and concise explanation
2. `No official partnership is claimed before approval`
3. First-wave application-target ledger
4. Paused/monitoring source note where relevant
5. Data Source Policy CTA
6. Retailer correction/contact CTA

Do not show synthetic products filtered under real retailer names. Until a feed is approved, store rows are informational source targets only.

Future `/stores/:storeSlug`:

- Before approval: status, source rationale, and coming-soon explanation only
- After approval: verified source statement, rules/disclosure, then approved-feed products

### Clickout `/out/:productId`

**Purpose:** Protect trust and create a controlled boundary between discovery and retailer checkout.

Preview behavior:

- Never redirect a synthetic product to a real retailer homepage or deeplink.
- Render an internal guard/unavailable response: `This is a synthetic preview item and is not available to buy.`
- Offer `Back to results`, `Explore other demo items`, and `How data sources work`.
- Use HTTP 404 only for unknown identifiers; a known synthetic item uses a clear preview/unavailable page.

Approved-feed behavior:

- On activation, record the outbound event then redirect only to the approved affiliate/deeplink URL.
- Preserve required query/sub-ID parameters.
- If the destination is missing, expired, or disallowed, show a product-unavailable page rather than guessing a retailer homepage.
- The product action visually includes an external-link icon and accessible name that includes the retailer.

### Legal and trust routes

Routes:

- `/how-it-works`
- `/about`
- `/data-sources`
- `/affiliate-disclosure`
- `/privacy`
- `/terms`
- `/contact`

Shared layout:

- Runway index stamp and page title
- Updated/effective date where applicable
- 760px maximum reading column
- In-page table of contents for documents with more than five sections
- Strong section rules; no cards around every paragraph
- Contact/correction route at the end of Data Source Policy
- Affiliate disclosure and no-checkout language in plain language before detailed legal text

Legal copy constraints:

- Replace `[PROJECT_NAME]`, `[DOMAIN]`, `[CONTACT_EMAIL]`, and owner placeholders before any production launch.
- Privacy/Terms remain drafts until reviewed by an appropriate owner/advisor; design must not imply legal review has occurred.
- Cookie/consent UI is added only when nonessential analytics/marketing technologies require it.
- Legal links must remain available without accepting nonessential cookies.

---

## Responsive behavior

### Breakpoint contract

| Viewport | Global layout | Home | Search/results | Stores | Legal |
| --- | --- | --- | --- | --- | --- |
| **375** | 16px gutters; compact 64–72px header; no horizontal scroll | Hero minimum `calc(100dvh - header)` but content may grow; search stacked; section index becomes stamp | Two product columns only if each tile remains at least 160px; filter bottom sheet; sort as native select; 12px grid gap | One-column ruled rows; status below name | Single 100% reading column; TOC collapsed in `<details>` |
| **768** | 24px gutters; header exposes Search/Stores/language | Editorial hero with 65/35 copy-image balance or full-bleed crop; 3-product preview grid | Three columns; filter sheet remains; result summary and sort share a row | Two-column row metadata, not cards | 680px reading measure; TOC visible above content |
| **1024** | 32px gutters; centered wordmark; max-width begins | Split/asymmetric hero; runway rail visible | 248px sticky filter rail + 3 result columns | Ledger uses name/status/details columns | Sticky narrow TOC + reading column where content length warrants |
| **1440** | 48px gutters; content max 1376px | Full editorial composition; text never exceeds 11 columns | 264px filter rail + 4–5 result columns, minimum tile 210px | Full ledger with balanced whitespace | TOC + 720–760px reading column; remaining space stays quiet |

### Mobile details

- Fixed/sticky elements reserve content insets and safe-area padding.
- Header/menu/filter sheet touch targets are at least 44×44px with 8px separation.
- Product titles wrap to two or more lines; do not reduce below 12px to force a single line.
- Price and preview status remain visible without hover.
- Filter sheet uses `min-height: 100dvh` or a safe-area-aware bottom sheet; background page does not scroll while open.
- Browser zoom must remain enabled.

### Pointer differences

- Hover enhances underline/media scale but never reveals required content.
- Touch uses immediate pressed feedback via background/color, not positional layout shift.
- Coarse-pointer devices do not receive hover-only overlays.

---

## Interaction states

### Loading

- Show feedback after 300ms.
- Preserve image aspect ratios and expected text rows.
- Results container announces busy state without moving focus.
- Avoid shimmer for users requesting reduced motion.

### Empty

- Explain what is empty and provide the next useful action.
- Home: category/search prompts
- Search: query/filter repair suggestions
- Stores: source approval explanation and Data Source Policy

### Error

- Plain-language title, specific recovery, and stable user input
- Announce with `role="alert"` or an appropriate live region
- Do not identify a feed error as “no results”

### Success

- Search submission success is the result update, not a toast.
- Approved source status uses text + check icon + success color.
- Filter application returns focus to result summary on explicit mobile apply.

### Disabled

- Use native `disabled`/`aria-disabled` correctly.
- Remove speculative controls such as wishlist from the preview rather than displaying a dead button.
- Disabled appearance combines reduced emphasis with cursor/semantics; it does not rely on low contrast alone.

### Offline/slow network

- Keep header, current query, filters, and previously rendered content available when possible.
- Show a compact inline retry notice.
- Do not silently substitute unrelated images or stale availability without labeling it.

---

## Accessibility

### Target standard

WCAG 2.2 AA for public routes.

### Keyboard and focus

- Skip link targets `#main-content`.
- Tab order follows the visible document order.
- All links, form controls, chips, dialogs, and sheets are keyboard operable.
- Focus ring: 3px cobalt with 2–3px offset on light surfaces; use acid/white equivalent on cobalt/ink surfaces.
- Do not remove native focus without an equal or stronger replacement.
- Opening a sheet moves focus to its heading/close control; closing returns focus to its trigger.
- Escape closes noncritical overlays.

### Contrast and readability

- Normal text: at least 4.5:1
- Large text and large UI glyphs: at least 3:1
- Focus indicators and component boundaries: at least 3:1 where required
- Never place text directly on a busy image without an opaque-enough scrim
- Body text is 16px minimum on mobile and supports 200% zoom

### Screen-reader semantics

- One `h1` per route; headings proceed without skipped levels.
- Product result region has an accessible label and result count.
- Search/filter errors are associated with fields and announced.
- Selected/expanded/disabled states are programmatically exposed.
- Product image alt describes the synthetic item, not visual style marketing.
- External-link icons are decorative when the link text already communicates destination.
- Price comparisons include screen-reader-friendly old/current price labels.

### Sensory and motion considerations

- Status is never color-only.
- Reduced motion removes entry transforms, image zoom, and sheet choreography where possible.
- No flashing, rapidly cycling content, autoplay audio, or motion-triggered input.
- Large image crops must preserve essential garments and not encode meaning unavailable in text.

### Localization

- Set the document `lang` to `en` or `lt`.
- Do not use fixed-height text containers.
- Allow at least 30% copy expansion.
- Use locale-aware EUR price formatting and Lithuanian quotation/diacritic support.
- Accessible names are localized; do not leave English `aria-label` values in Lithuanian mode.

---

## Content voice

### Tone

- Short, concrete, and editorial
- Useful before clever
- Transparent without sounding apologetic
- Avoid hype and approval theater

### Preferred terminology

- `Discover`, `Search`, `Explore`, `View at retailer`
- `Synthetic preview`, `VIBEWEAR demo`
- `Application target`, `Awaiting approval`, `Approved feed`
- `Official retailer website`
- `Product data source`

### Avoid

- `Buy now`, `Shop now` in preview mode
- `Official partner`, `Live store`, or `Verified retailer` without evidence
- `AI-powered` unless a real user-facing capability exists
- `Best price`, `Guaranteed stock`, `Exclusive`, `Limited time`, or fabricated urgency
- `Our products`; VIBEWEAR does not sell the items

### Microcopy rules

- Buttons use verb + object: `Show 24 results`, `Clear filters`, `Back to results`.
- Errors state what happened and how to recover.
- Empty states provide one primary next step and at most two secondary suggestions.
- Product caveat: `Final price and availability are confirmed on the retailer website.`
- Preview caveat: `This is a synthetic VIBEWEAR example and is not available to buy.`

---

## Implementation constraints

### Framework and styling

- Use Next.js App Router idioms and semantic React components.
- Prefer Server Components for static/product rendering; introduce Client Components only for filter-sheet focus control or interaction that cannot remain native.
- Extend `app/globals.css` with semantic tokens; do not introduce a second styling system.
- Use `next/link` for internal navigation.
- Prefer `next/image` for responsive images, explicit `sizes`, stable aspect-ratio containers, and lazy loading below the fold.
- Mark only the actual LCP hero image as priority.
- Use Lucide icons already installed; no emoji or new icon library.

### Design-token constraints

- Components consume semantic tokens, not raw repeated hex values.
- Keep the palette and spacing scale in `:root`.
- Component-level variables may alias global semantic tokens but must not redefine the palette per route.
- Light theme is required. A dark theme is out of MVP scope; dark editorial bands must still use the same semantic tokens.

### Performance constraints

- Target CLS below 0.1.
- Reserve dimensions for all media and async states.
- Do not preload every font weight or product image.
- Below-fold product images lazy-load.
- Avoid client-side animation libraries until a concrete interaction exceeds CSS capability.
- Avoid remote fallback images that change content meaning.
- Search/filter response must provide visible feedback within 100ms and a loading state after 300ms.

### Data and legal constraints

- Production-preview products use only synthetic/original safe data and imagery.
- Synthetic products are not mapped to or presented under real retailers.
- Real retailer product data/images appear only after approved feed access or direct merchant permission.
- Never guess or synthesize affiliate deeplinks.
- Never redirect mock items to retailer homepages.
- Store names may appear as application targets with explicit non-partnership status.
- Factcool LT remains monitoring/paused and must not appear as a live source.
- Retailer correction/removal and contact paths remain discoverable.

### Compatibility constraints

- Latest evergreen Chrome, Edge, Firefox, and Safari
- iOS Safari and Android Chrome at current/common viewport sizes
- Keyboard-only use and coarse pointer
- 200% zoom and content expansion
- `prefers-reduced-motion`

### Validation and screenshot expectations

Every implementation handoff must include fresh evidence for:

1. Typecheck (`npm run typecheck`)
2. Production build (`npm run build`)
3. No console errors on core routes
4. Keyboard traversal and visible focus
5. Screenshots at 375, 768, 1024, and 1440 for `/`, `/search`, `/stores`, one `/out/:productId` preview guard, and at least one long legal page
6. No horizontal overflow at any target width
7. Reduced-motion behavior
8. English and Lithuanian wrapping
9. Source/preview labels present on every product-heavy route
10. No real retailer product imagery, fake live status, or synthetic-to-retailer redirect

---

## Route acceptance checklist

### Home

- [ ] Search is visible without scrolling at 375/768/1024/1440.
- [ ] Hero explains both discovery value and retailer checkout boundary.
- [ ] Product preview uses safe synthetic imagery and labels.
- [ ] Runway index motif is visible but not decorative clutter.
- [ ] Store teaser does not claim approval.

### Search

- [ ] Query, count, filters, sort, and reset are operable by keyboard.
- [ ] Mobile filter sheet meets focus, Escape, and focus-return behavior.
- [ ] No-results, invalid-filter, feed-error, missing-image, and loading states are distinct.
- [ ] URL represents active filter state.
- [ ] Demo cards do not name a retailer as seller/source.

### Stores

- [ ] Store list is a source-status ledger, not a product-card grid.
- [ ] Each store status uses approved vocabulary.
- [ ] Demo product counts are not attributed to retailers.
- [ ] Factcool remains paused/monitoring only.
- [ ] Data policy and correction contact are visible.

### Clickout

- [ ] Synthetic item stays on-site and shows a preview guard.
- [ ] Unknown item has a useful 404.
- [ ] Missing approved destination never falls back to a guessed homepage.
- [ ] Future external action is labeled and tracked only after approval.

### Legal/trust

- [ ] Reading measure and heading hierarchy remain accessible.
- [ ] Placeholder owner/domain/contact fields are resolved before public production.
- [ ] Draft policies are not styled as legally reviewed unless review occurred.
- [ ] Footer exposes all required legal routes.
- [ ] Legal content remains available regardless of cookie choice.

---

## Explicit assumptions

1. The immediate deliverable is a review-ready production preview, not a public approved-feed launch.
2. English remains the default locale and Lithuanian is selected through the existing query-parameter mechanism for this MVP.
3. Safe synthetic product imagery can be generated or commissioned before the visual redesign is considered complete.
4. A product detail page is not required; the preview clickout guard can explain unavailable synthetic items.
5. No new styling or animation dependency is required to achieve the direction.
6. Dark mode is not part of the production-preview acceptance scope.
7. Individual store pages remain future-ready and must not be populated with synthetic retailer-associated products.

## Open questions

- [ ] **Brand asset ownership / product owner / launch blocker:** Is the VIBEWEAR name/domain final and legally cleared?
- [ ] **Legal identity / product owner / launch blocker:** What operator name, domain, and contact email replace policy placeholders?
- [ ] **Synthetic image provenance / content owner / preview blocker:** Where will generation/source records and usage rights be stored?
- [ ] **Affiliate approval state / partnerships owner / live-feed blocker:** Which first-wave store is approved first, and what exact image/deeplink rules apply?
- [ ] **Analytics consent / product + legal / launch impact:** Which analytics tools will be used, and do they require consent UI?
- [ ] **Locale routing / engineering / SEO impact:** Should Lithuanian move from `?lang=lt` to locale-prefixed routes after the MVP?
- [ ] **Preview retention / product owner / content impact:** Does the synthetic demo stay accessible after live feeds launch, and how is it separated from live results?

---

## Stop condition

The design contract is satisfied when the core routes implement the runway-index editorial system, all four viewport checks pass, synthetic content cannot be mistaken for live retailer inventory, preview clickouts remain on-site, disclosures/legal routes are accessible, and validation evidence is recorded. Any move from preview to live retailer data requires a documented approval/data-permission update before the corresponding UI state changes.
