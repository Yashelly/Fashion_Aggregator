# VIBEWEAR Design Contract

## Source of truth

- **Status:** Active
- **Last refreshed:** 2026-07-29
- **Primary product surfaces:** Home, search, demo stores, demo product guard,
  information/legal pages
- **Evidence reviewed:** `docs/mvp_prd.md`,
  `docs/frontend_design_references.md`, `data/store_tracker.csv`,
  `data/mock_products.csv`, `app/`, `components/`, `lib/`
- **Priority:** Public safety, shopping usability, accessibility, and responsive
  behavior override decorative styling.

## Brand

- **Personality:** Independent, fashion-aware, direct, energetic, and clear.
- **Trust signals:** A calm persistent demo label, neutral demo-store names, clear
  purchase boundaries, and accessible product/data notes.
- **Avoid:** Internal ledgers, application or feed status, arbitrary section
  numbering, debug labels, retailer logos, fake partnership signals, generic
  dark-SaaS styling, and “pill everything” UI.

## Product goals

- Make fashion search the first obvious action.
- Make the public MVP feel like a consumer fashion discovery product.
- Demonstrate store filtering and product browsing with clearly synthetic data.
- Keep real retailer catalogs, names, imagery, logos, and trademarks out of the
  public experience until they may be used.
- **Non-goals:** Checkout, cart, live products, real retailer detail
  pages, application tracking, or merchant operations.
- **Success signals:** A shopper can search, filter by demo store, inspect demo
  products, and understand that no live catalog is enabled.

## Personas and jobs

- **Primary personas:** Lithuanian mobile shoppers, desktop comparison shoppers,
  and reviewers checking the product’s data boundaries.
- **Jobs:** Search by item/vibe/category/price; refine results; browse a neutral
  demo store; understand the demo state; find privacy, terms, and product-data
  information.
- **Contexts:** One-handed mobile browsing, keyboard desktop use, slow networks,
  light or night mode, and Lithuanian or English copy.

## Information architecture

- **Primary navigation:** Search, stores, AI fitting room, How it works, About.
- **Core routes:** `/`, `/search`, `/stores`, `/out/:productId`,
  `/account`, `/ai-fitting-room`, `/how-it-works`, `/about`, `/data-sources`, `/affiliate-disclosure`,
  `/privacy`, `/terms`, `/contact`.
- Demo store cards link to filtered search through stable public IDs such as
  `demo-store-01`. Internal retailer slugs remain data-join details only.
- Product and store discovery precedes legal explanation; safety context remains
  close to product-heavy surfaces and in the footer.

## Design principles

1. **Search first:** The search field is the strongest action on home and search.
2. **Fashion editorial, not editorial system:** Use typography, contrast, and
   space for energy; do not use arbitrary issue/index numbers.
3. **Public-safe by construction:** Only strict neutral store mappings may reach
   public labels or URLs.
4. **Demo without apology:** State the synthetic boundary clearly once, then let
   shoppers browse normally.
5. **Mobile is first-class:** No clipped display text, hidden actions, tiny type,
   or desktop-only interaction.

## Visual language

- **Color:** Warm paper and ink in light mode; espresso-charcoal layered surfaces
  in night mode. Coral, cobalt, and acid-lime are disciplined accents.
- **Typography:** Syne for brand/display and IBM Plex Sans for body/utility.
- **Spacing:** 4/8-based rhythm with 16px mobile gutters and fluid larger
  gutters.
- **Shape/elevation:** Mostly sharp editorial edges, subtle small radii for
  controls, restrained elevation for menus and interactive demo-store cards.
- **Motion:** 150–220ms state transitions only; no layout-shifting decoration.
- **Imagery/iconography:** 4:5 product media, stable repo-local paths, Lucide
  icons, and synthetic non-branded placeholders.

## Components

- **Reuse:** `SiteHeader`, `SiteFooter`, `CinematicHero`, `ProductGrid`,
  `FilterDisclosure`, and `InfoPage`.
- **Changed components:** Header includes a theme toggle; product cards include a
  neutral demo store and local-image fallback; footer uses product/legal columns;
  info pages have no arbitrary numbering.
- **States:** Hover, focus-visible, selected, disabled, missing image, empty
  results, invalid filters, loading, and unavailable demo product.
- **Ownership:** Semantic palette and component states live in
  `app/globals.css`; public store identity lives in `lib/demo-stores.ts`.

## Accessibility

- Target WCAG 2.2 AA.
- Minimum 44×44px interactive targets.
- Visible 3px focus indicator and `:focus-within` treatment on compound search
  fields.
- Product media links and placeholders use product-specific accessible names.
- Color is never the only state signal.
- One route `h1`, logical headings, and correct localized accessible labels.
- `prefers-reduced-motion` removes meaningful animation and transforms.

## Responsive behavior

- Supported checks: 375/390, 768, 1024, and 1440 CSS pixels.
- Mobile header keeps brand, theme, and menu visible; language controls move into
  the menu on narrow screens.
- Home display text must fit within the viewport without horizontal overflow.
- Results use two columns on normal phones, one below 350px, three on tablet, and
  four on desktop.
- Demo-store and footer columns collapse cleanly to one column.

## Interaction states

- **Loading:** Stable 4:5 skeletons; no fast motion with reduced motion.
- **Empty:** Plain explanation and one reset action.
- **Error:** Specific message, visible error treatment, preserved query.
- **Success:** Results update is the feedback; no decorative toast.
- **Disabled:** Native or ARIA disabled semantics plus readable reduced emphasis.
- **Missing image:** Category glyph in a stable semantic-color media frame.

## Content voice

- **Tone:** Natural, shopper-friendly, concise, and transparent.
- **Primary Lithuanian term:** `parduotuvė`, never `šaltinis` as a shopper-facing
  substitute for store.
- **Required labels:** `Demo parduotuvė 01`, `Demo parduotuvė 02`, and so on.
- **Required safety statement:** Real retailer catalogs are not enabled yet; the
  current catalog is a synthetic demo.
- **Avoid:** Network names, application/feed/approval status, commission,
  tracker language, “review mode,” debug labels, and machine-heavy policy copy.

## Implementation constraints

- Next.js App Router, React, TypeScript, custom CSS, and existing Lucide icons.
- Use semantic CSS variables with explicit light and dark token maps.
- Theme defaults to light on a new browser profile; a visible header control
  persists an explicit choice in `localStorage`.
- No new dependencies for this polish pass.
- No real retailer names, photos, logos, trademarks, scraped assets, or live
  product/deeplink behavior.
- Expected product files and specs are documented in
  `docs/demo-product-imagery.md`; missing files must not cause layout shift.
- Verify with fresh typecheck, production build, public-exposure search, and
  rendered desktop/mobile inspection.

## Open questions

- [ ] Brand/domain ownership before a commercial launch.
- [ ] Public contact address before live catalogs or contact intake are enabled.
- [ ] Provenance and rights log for future synthetic demo product images.
- [ ] Permission record and activation checklist before any real retailer data
  can enter public rendering.

## Stop condition

This polish pass is complete when public pages contain only neutral demo stores,
no internal retailer/application language is rendered, header/footer/index
issues are removed, stable image fallbacks work, both themes are usable, mobile
has no clipping or overflow, and typecheck/build pass.
