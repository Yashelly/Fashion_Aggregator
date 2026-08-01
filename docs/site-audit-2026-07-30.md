# VIBEWEAR Site Audit and Recommendations — 2026-07-30

> **Addendum (2026-07-31) — priority reorder and one removed feature.**
>
> A later strategic interview
> ([`.omc/specs/deep-interview-vibewear-strategic-vision.md`](../.omc/specs/deep-interview-vibewear-strategic-vision.md))
> reordered the project's priorities. Visual work is no longer the immediate
> next step: the order is now **name/rebrand → semantic search and
> cross-store comparison → visual → real AI fitting room → everything else**.
> See [`ROADMAP.md`](../ROADMAP.md) for current status. The findings below
> remain valid; only their *timing* changed.
>
> The **variant toggle described throughout this document was removed from
> production** in Phase 1, as §1 of this document itself recommended. Every
> reference to it below is historical. The comparison it existed for is
> settled: light mode takes Variant B's canvas, dark mode stays on Variant A,
> and the acid-lime accent is rejected in both.

This is the unified deliverable for the deep-interview spec at
`.omc/specs/deep-interview-vibewear-site-audit.md` (interview: "make the
interface as beautiful and clear as possible, and discuss its functions").
It combines three facets — Visual, UX/Navigation, and Product Functionality —
into one artifact, per that spec's Round 8 (Ontologist) resolution.

**No new product functionality was implemented as part of this pass.** All
work here is either (a) a working visual prototype for comparison, (b) a
handful of concrete "weak detail" bug fixes discovered while producing that
prototype (see Visual section), or (c) written audits/recommendations with no
accompanying feature implementation. Everything is on the branch
`feature/site-audit-visual-ux`, git-reversible, not merged to `main`.

---

## 1. Visual

### How to compare the two variants

```bash
git checkout feature/site-audit-visual-ux
npm install
npm run dev
```

Open `http://localhost:3000`. In the header, next to the light/dark theme
toggle, there is a new **palette icon button**. Click it to switch live
between:

- **Variant A** (default) — the existing `DESIGN.md` visual language
  (warm paper/espresso, coral/cobalt/acid-lime accents), finished to full
  consistency.
- **Variant B** — a bolder, higher-contrast editorial/streetwear direction,
  same fonts (Syne + IBM Plex Sans), same layout and components.

The choice persists in `localStorage` (`vibewear-visual-variant`) the same
way the existing theme choice does, and composes independently with light/dark
— so there are 4 total combinations, all verified for contrast (see below).
No page reload is required to switch.

**⚠ Before merging any of this branch to production:** the variant toggle
button itself should be removed from the shipped header. It was built as a
review tool for this audit, and the UX audit (§2) correctly flags it as a
fourth, unexplained icon-only control that a real shopper has no way to
interpret — it does not belong in the live site once a variant decision is
made.

### Reviewer feedback (live comparison, 2026-07-31)

After comparing both variants live via the toggle:

- **Canvas: white preferred.** The crisp white/near-black base from Variant B
  reads better than Variant A's warm paper/espresso — this is a clear signal
  toward Variant B's canvas direction, independent of its other changes.
- **Acid-lime accent (`--color-acid`) disliked in both variants.** This
  applies regardless of canvas choice — Variant A's `#d4ee70`/`#cdea69` (light/
  dark) and Variant B's `#c6f22e`/`#d4f24a` are both rejected. Exact locations
  in `app/globals.css` where this token renders, so whoever picks a
  replacement knows the full surface area:
  - `.button.inverse` — the "How product data works" CTA on the homepage
    dark trust-band (the most visible instance, appears in every screenshot
    taken during this audit).
  - `.category-links a:hover` — homepage category-link hover background.
  - `.runway-links a:hover` — homepage hero quick-search link hover color.
  - `.demo-store-icon` — icon background on `/stores` cards.
- **Dark mode: Variant A preferred, Variant B rejected ("goes blue").** Light
  mode should come from Variant B (white canvas, see above), but dark mode
  should come from Variant A, not B. This is a real, verifiable difference,
  not just a subjective read: Variant B's dark surfaces
  (`--color-canvas: #0a0a0f`, `--color-surface: #131320`,
  `--color-surface-soft: #1c1c30`, `--color-surface-elevated: #191928`, plus
  `--color-ink: #f5f5ff` and `--color-focus: #8fa0ff`) all carry a
  noticeably higher blue channel than red/green, giving the whole dark theme
  a blue-purple cast. Variant A's dark surfaces
  (`--color-canvas: #161412`, `--color-surface: #211e1b`,
  `--color-surface-soft: #2a2622`, `--color-surface-elevated: #2e2925`) are
  neutral/warm-tinted instead, which reads as "fine."
- **Emerging direction (not yet built as one variant):** light mode = Variant
  B's canvas tokens, dark mode = Variant A's canvas tokens, accent = neither
  variant's current acid-lime (replacement still undecided). This is
  feedback captured for the next pass — no third/merged variant has been
  implemented in this branch yet.

### Variant A — polish pass

The current `DESIGN.md` language, palette, and typography are unchanged.
What was fixed, discovered while actually looking at the rendered pages
rather than by guessing from the stylesheet:

1. **Mislabeled product fact.** Product cards and the product detail page
   showed a field labeled **"Edit"** whose value was the item's gender
   (Men/Women/Unisex) — a mistranslation artifact of the Lithuanian label
   "Skirta" ("For"). Fixed in both `components/product-grid.tsx` and
   `app/out/[productId]/page.tsx`: now reads **"For"**.
2. **Hardcoded-locale demo notice.** The homepage hero's "DEMO ·
   SINTETINIS KATALOGAS" kicker — the site's earliest, most prominent
   demo-status signal — was hardcoded Lithuanian regardless of the visitor's
   locale, so English-locale visitors saw untranslated text they likely
   couldn't parse. This is also flagged independently in the UX audit (§2)
   as the single most consequential demo-status gap found; it is now fixed
   in `components/cinematic-hero.tsx` (`DEMO · SYNTHETIC CATALOG` in EN).
3. **Unbalanced product-detail layout.** On the product detail page, the
   two-column layout (image gallery + info card) used `align-items: start`;
   for products where the info card is taller than the gallery, this left a
   large, unbalanced block of empty space under the images. First attempt
   (`align-self: center`) just moved the gap to both top and bottom instead
   of removing it — still read as "floating," per live review. Fixed
   properly by making the gallery `position: sticky` (top-aligned with the
   card, follows on scroll for taller cards) instead, matching common PDP
   layouts; disabled on the single-column mobile breakpoint. `app/globals.css`.

Verified, not just assumed:

- **Contrast:** every themed text/background pair (ink, muted ink, accent,
  focus, success, warning, error — light and dark) computed at ≥ 4.5:1
  (WCAG AA), including the new Variant B tokens.
- **Focus states:** a global `:where(a, button, input, select,
  summary):focus-visible` rule already provides the 3px focus outline
  `DESIGN.md` requires, across all interactive elements site-wide.
- **Motion:** transitions are 180–220ms, inside `DESIGN.md`'s 150–220ms
  band; a blanket `prefers-reduced-motion` override (near-zero animation/
  transition duration) already covers the whole site.
- **No console errors** on home, search, or product detail in either
  variant (checked via headless browser).

Not attempted in this pass: an exhaustive, line-by-line renormalization of
every spacing value in `app/globals.css` (a ~2,000-line file) to a strict
4/8 grid. A grep pass found on the order of 50–60 values that aren't clean
multiples of 4px. Most are small, deliberate fine-tuning (icon alignment,
border/stroke widths, letter-spacing-adjacent offsets) rather than visible
inconsistency; renormalizing all of them blind, without a full visual
regression pass across every breakpoint, carried more risk of introducing
new problems than of fixing invisible ones. Recommend a follow-up pass
specifically for this if pixel-level rhythm consistency matters more than
the concrete, visually-confirmed issues fixed above.

### Variant B — new direction

Concrete direction, chosen during execution since the interview established
you needed to *see* something to react to it rather than specify it verbally
in advance (Round 5 / Round 10 of the interview):

A bolder, higher-contrast **editorial/streetwear** direction:

- Canvas shifts from warm paper (`#f4efe7`) to crisp white (`#ffffff`) in
  light mode, and to a cooler near-black (`#0a0a0f`, vs. Variant A's warmer
  `#161412`) in dark mode — more energy, less "paper."
- The existing coral/cobalt/acid-lime accent family is pushed to full
  saturation (accent red `#a72e22 → #d81f10`, focus cobalt `#2847c7 →
  #3150ff`, acid lime `#d4ee70 → #c6f22e`) rather than introducing new hues
  — same brand identity, more intensity.
- The hero headline is scaled up further (`clamp(3.5rem, 9.2vw, 8.5rem) →
  clamp(4rem, 10.4vw, 9.6rem)`) for more visual impact on first paint.
- Same Syne + IBM Plex Sans font pairing, same component layout, same
  copy, same accessibility bar as Variant A — this is a token-level
  reskin, not a rebuild.

Implemented as CSS custom-property overrides scoped under
`[data-visual-variant="b"]` in `app/globals.css` (~35 lines), composing
independently with the existing `[data-theme="dark"]` block. Real,
git-reversible code — not a static mockup — verified against the same
build, contrast, and no-console-error checks as Variant A.

---

## 2. UX / Navigation

Full audit: [`docs/audit-ux-navigation-2026-07-30.md`](./audit-ux-navigation-2026-07-30.md)
(8 issues, each with exact file/line citations and a concrete recommendation,
plus a dedicated demo-status assessment).

Headline findings:

- The homepage's primary demo-status cue was hardcoded Lithuanian-only —
  **already fixed** as part of the Visual polish pass above.
- `/account` and `/ai-fitting-room`, the two no-backend mocks, carry **no
  demo-status notice at all**, unlike every real shopping surface on the
  site (search, stores, product detail all have one). Not fixed in this
  pass (would require new copy/UI, judged in-scope for the audit's
  *recommendations*, not its code changes) — recommended as the next
  concrete fix.
- `lib/i18n.ts` defines a richer navigation/category structure
  (`home.categoryColumns`, `header.nav.contact`, `header.nav.sources`) that
  is never actually rendered anywhere; the shipped nav and homepage use a
  separate, thinner, hand-written structure instead. The audit recommends
  picking one canonical structure and deleting the other.
- Nav items marked `temporary: true` in code (How it works, About) signal
  that only via a color that collides with the "current page" indicator and
  a hover-only tooltip invisible on mobile — not a real signal to the
  stated mobile-shopper audience.
- The new variant-comparison toggle from this same audit (§1) is itself
  flagged as a UX problem if left in production — see the warning in §1.

## 3. Product Functionality

Full audit: [`docs/audit-product-functionality-2026-07-30.md`](./audit-product-functionality-2026-07-30.md)
(every current function reviewed from its actual implementation, keep/
improve/cut verdict + rationale, plus 5 candidate new functions).

Verdicts: **Keep** — search/filters, product grid, demo-store mapping
mechanism, `/out` product detail page, analytics infrastructure. **Improve**
— demo stores page (all 6 store cards currently read identically), AI
Fitting Room mock (good UX, but no "preview only" signal before a user
uploads a personal photo), Account mock (the profile/preferences half is
real and works; the "Saved items"/"Recent searches" cards always claim
"you haven't used this yet" when the accurate statement is "this doesn't
exist yet" — a genuine honesty gap, not just an empty state).

Candidate new functions (all with existing data/patterns in the codebase
that make them comparatively low-effort): real saved-items persistence,
real recent-searches history, functional in-app sale-alert surfacing (no
new backend needed), auto-derived store differentiation on `/stores`, and
a "more like this" rail on the product detail page.

---

## Summary for decision-making

| Facet | Status | Next step |
|---|---|---|
| Visual — Variant A | Polished, 3 concrete bugs fixed, contrast/motion/focus verified | Optional: further spacing-rhythm pass if desired |
| Visual — Variant B | Implemented, live-comparable, contrast verified | Pick A, B, or a blend, once compared live |
| UX / Navigation | 8 issues documented with fixes | Prioritize: demo-status on mocks, nav-structure duplication |
| Product Functionality | 7 functions audited, 5 new ideas proposed | Prioritize: Account mock honesty fix (cheapest, highest-integrity gap) |

Remove the variant-toggle button from the header once a visual direction is
chosen — it is a review tool for this audit, not a shipped feature.
