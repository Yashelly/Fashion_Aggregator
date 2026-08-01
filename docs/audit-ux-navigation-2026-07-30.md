# UX / Navigation Audit — VIBEWEAR

> **Addendum (2026-07-31).** The **variant toggle** discussed below (the
> fourth, unexplained icon-only header control this audit flagged) **was
> removed from production** in Phase 1 — that finding is resolved. Any
> description of it here is historical. Current sequencing and status live in
> [`ROADMAP.md`](../ROADMAP.md); the project's priorities were reordered after
> this audit was written (see
> [`.omc/specs/deep-interview-vibewear-strategic-vision.md`](../.omc/specs/deep-interview-vibewear-strategic-vision.md)).

Scope: this document addresses only the UX/Navigation facet of the Site Audit
and Recommendations effort (PRD story US-005). It is a written audit only —
no navigation restructure or other source code was changed to produce it.
The interview's stated concern was specifically **"не ясна навигация/структура"**
(navigation/structure is not clear to users), so every issue below is judged
against that concern, not a generic UX pass.

Evidence sources read: `components/site-header.tsx`, `components/site-footer.tsx`,
`components/cinematic-hero.tsx`, `lib/i18n.ts`, `app/page.tsx`, `app/search/page.tsx`,
`app/stores/page.tsx`, `app/out/[productId]/page.tsx`, `app/account/page.tsx`,
`app/ai-fitting-room/page.tsx`, `components/account-dashboard.tsx`,
`components/ai-fitting-room.tsx`, `app/globals.css`, `DESIGN.md`.

## Issues found

### Nav items flagged `temporary` in code give the user no visible signal they are temporary

- **Where:** `components/site-header.tsx` lines 131–136 (`/how-it-works` and `/about`
  entries carry `temporary: true`); rendering at lines 152–162 (desktop nav) and
  196–206 (mobile menu); styling in `app/globals.css` lines 199–202
  (`.desktop-nav .nav-temporary, .mobile-menu .nav-temporary { color: var(--color-accent); }`).
- **Problem:** The only user-facing effect of `temporary: true` is (a) the link
  text renders in the accent color, and (b) a `title` tooltip attribute
  ("Temporary page" / "Laikinas puslapis") that only appears on mouse hover —
  invisible on touch devices, which is most of the stated "Lithuanian mobile
  shoppers" persona from `DESIGN.md`. Worse, the same accent color is also used
  for `aria-current="page"` (the "you are here" state, `app/globals.css` line
  195–197), so a user has no reliable way to distinguish "this page is
  temporary/may disappear" from "this is the page you're currently on." There is
  no badge, no icon, no footer disclosure that "How it works" and "About" are
  provisional.
- **Recommendation:** Either remove the `temporary` flag's visual treatment
  entirely (if these pages are in fact staying), or give it an actual
  user-legible signal distinct from the active-page state — e.g. a small
  "Preview" or "Draft" text badge next to the label, not just a color that
  collides with another semantic meaning. Do not rely on `title` tooltips as
  the only differentiator.

### The header's `VariantToggle` (visual-variant preview button) is indistinguishable from real account/settings controls

- **Where:** `components/site-header.tsx` lines 74–115, rendered at line 175
  between the account icon link and the language switcher.
- **Problem:** The header now presents four icon-only controls in a row —
  account (`UserRound`), theme toggle (`Sun`/`Moon`), variant toggle
  (`Palette`), then EN/LT — with no visual grouping or separator distinguishing
  "your account" from "site display experiments." A real shopper has no way to
  infer what the palette icon does, or that it toggles between two internal
  design prototypes rather than, say, a color-scheme or accessibility setting.
  This is a stray artifact of the visual-variant workstream (US-001) leaking
  into the same nav surface being audited here for clarity.
- **Recommendation:** Once the visual-variant decision (US-002/US-003) is
  finalized, remove `VariantToggle` from the production header entirely, or
  gate it behind a query param / internal review flag so end users never see a
  fourth unexplained icon button next to Account and Theme.

### Header's "AI fitting room" and "How it works" labels bypass `lib/i18n.ts`, while `lib/i18n.ts` defines nav copy that is never rendered

- **Where:** `components/site-header.tsx` lines 128, 133, 138 (`"AI matavimasis"` /
  `"AI fitting room"`, `"Kaip veikia"` / `"How it works"`, `"Mano paskyra"` /
  `"My account"` are hardcoded inline ternaries) vs. `lib/i18n.ts` lines 182–195
  (`header.nav` defines `about`, `contact`, `search`, `sources`, `stores` —
  `contact` and `sources` are never referenced by any `.tsx` file) and lines
  228–274 (`home.categoryColumns`, `home.editorialLinks` — a richer four-column
  category/discovery link structure with translated labels for "Discover",
  "Collection", "Shoes | Accessories", and "Stores" columns — also never
  referenced anywhere; `app/page.tsx` instead defines its own separate, thinner,
  6-item `categories` array inline).
- **Problem:** There appear to be two different intended navigation structures
  in the codebase: a richer one authored in `lib/i18n.ts` (multi-column
  category navigation, ~20 links total) and a thinner one actually shipped in
  `app/page.tsx` and `site-header.tsx` (6 flat category links, 5 nav items).
  This is exactly the kind of drift that produces "unclear navigation" —
  the site's own copy/data layer disagrees with itself about how deep the
  category structure should go, and none of the richer structure ever reaches
  a user.
- **Recommendation:** Pick one canonical IA. If the richer `categoryColumns`
  structure was the intended design (it reads like a footer/mega-menu category
  list), wire it into the home page or footer and delete the now-competing
  inline array in `app/page.tsx`. If it's obsolete, delete the dead keys from
  `lib/i18n.ts` so the copy file stops describing a navigation that doesn't
  exist. Either way, stop sourcing some header labels from `copy.header.nav`
  and others via inline `locale === "lt"` ternaries in the component — pick one
  pattern so nav labels are centrally auditable.

### `/account` and `/ai-fitting-room` are visually and structurally indistinguishable from real, working features

- **Where:** `app/account/page.tsx`, `components/account-dashboard.tsx`,
  `app/ai-fitting-room/page.tsx`, `components/ai-fitting-room.tsx`, compared
  against `app/search/page.tsx` (source-note aside, lines 206), `app/stores/page.tsx`
  (`copy.demoNotice`), `app/out/[productId]/page.tsx` (`product-purchase-note`,
  lines 268–272), and `app/page.tsx` (`trust` band, lines 39–42).
- **Problem:** Every real shopping surface on the site carries an explicit,
  visible "this isn't live yet" notice: search has a "Purchase status" aside,
  stores has a demo notice, product detail has "The purchase link is not
  active yet." `/account` and `/ai-fitting-room` — both explicitly named in the
  PRD/spec as mocks with no backend (`AccountMock`/`AIFittingRoomMock` in the
  session's ontology, `localStorage`-only persistence in
  `components/account-dashboard.tsx` line 66) — carry **no such notice at all**.
  Their `<h1>` headings read as plainly as any real feature ("My account",
  "AI fitting room"), they sit in the same primary nav row as Search and
  Stores, and nothing on either page tells the user their photo upload,
  "saved items," or size preferences aren't backed by a real account system.
- **Recommendation:** Add the same kind of demo-status note used elsewhere
  (e.g. "Preferences are stored only in this browser and are not a real
  account" on `/account`; "This is a preview flow with no image processing
  backend" on `/ai-fitting-room`) so these two mock features are as clearly
  labelled as the rest of the demo boundary already is.

### Product detail page breadcrumb omits Home and Stores, and doesn't reflect store-based arrival

- **Where:** `app/out/[productId]/page.tsx` lines 166–175
  (`product-breadcrumbs`: `Search / {categoryLabel}` only).
- **Problem:** The breadcrumb trail is `Search → [Category]` unconditionally,
  regardless of how the user actually arrived. A user who arrived via
  `/stores` → a demo store card → a product has no breadcrumb trace back to
  the store they came from — only a separate inline "Store" chip
  (`product-detail-store`, lines 120–126) elsewhere on the page that links to
  a filtered search, not back to `/stores`. Home (`/`) is not represented in
  the breadcrumb at all. No other route in the site (`/search`, `/stores`,
  `/account`, `/ai-fitting-room`) has a breadcrumb at all — `/out/:productId`
  is the only page with one, so breadcrumb/back-navigation treatment is
  inconsistent across the site rather than a predictable pattern.
- **Recommendation:** Either make the product-detail breadcrumb reflect actual
  arrival context (Home → Stores → [Store] → Product, or Home → Search →
  Product, depending on referrer), or — more simply, given the "no restructure"
  scope of this pass — at minimum add a `Home` root crumb, since the current
  trail permanently assumes search-only arrival and dead-ends every
  store-originated visit.

### DESIGN.md's stated primary navigation and the code agree on labels, but not on route depth or account placement

- **Where:** `DESIGN.md` lines 46–51 ("Primary navigation: Search, stores, AI
  fitting room, How it works, About." / "Core routes: `/`, `/search`,
  `/stores`, `/out/:productId`, `/account`, `/ai-fitting-room`,
  `/how-it-works`, `/about`, `/data-sources`, `/affiliate-disclosure`,
  `/privacy`, `/terms`, `/contact`.") vs. `components/site-header.tsx` lines
  123–138 and `components/site-footer.tsx` lines 12–17.
- **Problem:** The five labelled primary-nav items match the implementation
  exactly (good — this part is not the problem). But `DESIGN.md`'s "Core
  routes" list includes `/account` alongside the five primary-nav routes,
  implying it's part of the same navigational tier. In the actual header,
  `/account` is not in the `nav` array at all — it's a separate icon-only
  link (`UserRound`, no text label) grouped with the theme toggle and language
  switcher (`header-tools`, site-header.tsx lines 164–175), not with Search/
  Stores/AI fitting room/How it works/About. A user scanning the header for
  "where's my account" sees only an unlabelled person icon, not a nav item —
  DESIGN.md doesn't document this demotion, so the design contract and the
  implementation describe two different navigational weightings for the same
  route.
- **Recommendation:** Update `DESIGN.md`'s IA section to explicitly state that
  `/account` is a secondary/utility-tier link (icon-only, header-tools), not
  primary nav, so the design contract matches what's shipped — and consider
  whether an icon-only, unlabelled account entry point is discoverable enough
  on a fashion-discovery demo site with no live login (a text label costs
  little and removes ambiguity).

### The single most prominent demo-status label on the homepage is hardcoded in Lithuanian regardless of selected locale

- **Where:** `components/cinematic-hero.tsx` lines 15–18:
  ```
  <p className="preview-kicker">
    <Sparkles aria-hidden="true" size={16} />
    DEMO · SINTETINIS KATALOGAS
  </p>
  ```
- **Problem:** This is the very first piece of copy a visitor sees — above the
  hero headline, in all caps, with an icon — and it is meant to be the site's
  earliest, boldest demo-status signal. Every other string in this component
  (`hero-lead`, search label/placeholder, quick-search links) is wrapped in a
  `locale === "lt"` ternary; this one is not. An English-locale visitor
  (`?lang` unset or any value other than `lt`) sees "DEMO · SINTETINIS
  KATALOGAS" with no English equivalent anywhere nearby, and "sintetinis
  katalogas" is not a cognate an English reader can be expected to parse. This
  directly undermines the "demo without apology... state the synthetic
  boundary clearly once" principle in `DESIGN.md` line 64 — the boundary is
  stated, but not in a language roughly half of the site's stated audience
  ("Lithuanian mobile shoppers... desktop comparison shoppers") can read.
- **Recommendation:** Localize this string like every sibling string in the
  same component, e.g. `locale === "lt" ? "DEMO · SINTETINIS KATALOGAS" : "DEMO ·
  SYNTHETIC CATALOG"`. This is a one-line fix with outsized impact on the
  audit's specific demo-status concern.

### Homepage's only other demo-status notice is the last thing on the page

- **Where:** `app/page.tsx` lines 39–42 (`trust-band` section, after the hero,
  the category-links section, and the full 8-product discovery grid).
- **Problem:** Combined with the previous issue, an English-locale visitor
  effectively gets **no legible demo-status signal at all** until they scroll
  past the hero, six category links, and eight product cards to reach "Discover
  now. Shop later." / "Purchases are not enabled yet." A Lithuanian-locale
  visitor at least gets the (correctly localized) trust band plus the
  hero kicker, even though the kicker's actual text is only meaningful in LT.
  For a site whose core identity constraint is "no real checkout, this is a
  demo," burying the only readable statement of that fact below the fold is a
  gap between how important the fact is and how it's actually surfaced.
- **Recommendation:** Once the hero kicker is localized (previous issue), it
  becomes an adequate "stated once, early" signal and the trust band can stay
  as reinforcement. If the kicker fix is not made, promote a short, translated
  demo notice into the hero itself rather than relying solely on the
  post-scroll trust band.

## Demo-status communication

**Overall assessment: partially clear, and inconsistent by locale and by page.**

Where it works well: `/search` (source-note aside citing "Purchase status" /
"Purchase links are not enabled yet." linking to `/data-sources`), `/stores`
(`demoNotice`: "Purchase links are not enabled yet."), and `/out/[productId]`
(explicit "The purchase link is not active yet." directly under the primary
CTA buttons) all state the demo boundary in both locales, using consistent
language ("not enabled yet" / "not active yet"), and are reasonably close to
the point of action (though on `/out/[productId]` the note comes *after* the
"Try with AI" and "Back to search" buttons rather than before them, so a user
could click "Try with AI" without having read it first).

Where it fails:

1. The homepage's earliest demo-status cue (`cinematic-hero.tsx`'s "DEMO ·
   SINTETINIS KATALOGAS" kicker) is hardcoded Lithuanian-only and unreadable
   to English-locale visitors — see finding above. This is the single most
   consequential gap found in this audit, because it means the site's primary,
   above-the-fold demo disclosure silently fails for one of its two supported
   locales.
2. The homepage's only other, correctly-localized demo notice (the
   `trust-band`) sits at the very bottom of the page, after hero, categories,
   and a full product grid — not "early," by any reasonable reading of the
   interview's concern.
3. `/account` and `/ai-fitting-room` — the two features explicitly scoped in
   this project as no-backend mocks — carry **no demo-status notice
   whatsoever**, unlike every other functional page. A user has no way to
   learn, short of trying to actually use them and noticing nothing persists
   server-side, that these are prototypes rather than working features. This
   is the second-most consequential gap: the pages most likely to *feel* real
   (account settings, an AI photo tool) are exactly the ones with zero
   disclosure.
4. The `nav-temporary` styling on "How it works" and "About" (accent-colored
   text, hover-only tooltip) does not communicate demo/prototype status to
   users at all — it's a developer-facing signal, not a user-facing one, and
   as noted above it visually collides with the "current page" indicator.

**Net conclusion:** the site does have real, deliberate demo-status copy, and
where it's used it's consistent — but its actual reach depends on which locale
you're in and which page you land on first. The concern voiced in the
interview ("navigation/structure is not clear") and the demo-status question
turn out to be linked: several of the same rendering gaps that leave the
demo-status message unseen (a hardcoded-locale string, mocks with no visual
differentiation from real features, a `temporary` flag with no legible UI)
are also cases where a user cannot tell, from navigation alone, what kind of
page they are about to land on.
