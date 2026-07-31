# Roadmap

This file is the single source of truth for **what happens in what order** and
**what is done**. It comes from the strategic-vision interview crystallized in
[`.omc/specs/deep-interview-vibewear-strategic-vision.md`](.omc/specs/deep-interview-vibewear-strategic-vision.md);
read that spec for the reasoning behind each decision. `DESIGN.md` and the
audit docs describe *how things look and work* — they defer to this file for
sequencing and status.

**Working context:** solo, with paid tools/AI but no external hires. Work
happens in irregular bursts, not a steady cadence, against a real
weeks-to-a-couple-of-months horizon. The scope below is knowingly larger than
that horizon comfortably allows — that tension is accepted deliberately, not
overlooked.

---

## Phase 0 — Foundation (in progress)

- [ ] Merge the site-audit branch into `main`, remove the A/B variant toggle
      from production, and sync `DESIGN.md` / audit docs with the new
      direction
- [ ] Brand-name candidates researched and presented for a decision
- [ ] Affiliate feed-format research → flexible DB schema proposal
- [ ] Legal/GDPR baseline drafted (disclosure, cookie consent, privacy) —
      staged behind a flag, ships before the first live affiliate link

## Phase 1 — Name

- [x] **New brand name chosen: WEFT** (2026-07-31) — the crosswise thread in
      weaving. Chosen over Scour, Trawl and Prowl for being a real textile
      term that is short, unclaimed, and promises nothing it can't deliver.
      Evidence and the rejected candidates are in
      [`docs/naming-candidates-en-2026-07-31.md`](docs/naming-candidates-en-2026-07-31.md).
- [x] Rename applied across the app and living docs (2026-07-31). Storage keys
      moved with it (`weft-locale`, `weft-theme`, `weft-anonymous-id`,
      `weft-account-preferences`). Two deliberate exclusions: the `store_slug`
      in `data/mock_products.csv` keeps its old value (internal identity,
      decoupled from anything public, and changing it would reshuffle products
      across demo stores), and dated audit documents keep the old name because
      they are records of a moment. Legal placeholders are still pending —
      they land with the legal baseline below.
- [ ] Domain secured: **weft.lt** (verified available). `weft.eu`, `weft.io`,
      `weft.co`, `weft.shop` also free; `weft.com` is registered since 1999,
      dormant, and would need an approach to its owner — deliberately deferred.
- [ ] Social handles secured
- [ ] **Trademark clearance** — two existing companies use the name:
      [Weft Apparel](https://weftapparel.com/) (US, made-to-order clothing
      manufacturer, Nice class 25) and
      [Weft Technologies](https://wefttechnologies.com/) (digital product
      consultancy, different sector). This product is retail search/comparison
      (class 35), and both use compound domains rather than bare "weft", so
      the classes differ — but this has NOT been legally cleared. Run it
      through [EUIPO TMview](https://www.tmdn.org/tmview/) before spending on
      logo or print.

## Phase 2 — Core differentiators

The two things that make this different from Google or a brand's own site.
Neither exists yet — today's search is keyword/token matching over a synthetic
catalog.

- [ ] **Semantic / visual search** — "hoodie with stars" matches by visual and
      conceptual content, not literal keyword text
  - [ ] Test query set + agreed pass threshold (proposed by assistant,
        approved by owner) before this ships
- [ ] **Cross-store comparison** — same physical item across stores, with
      price and size availability side by side
  - [ ] Product-identity matching strategy (how do we know two listings are
        the same item?)

## Phase 3 — Visual

- [ ] Light theme moves to the Variant B canvas (crisp white/near-black)
- [ ] Dark theme stays on Variant A (neutral/warm espresso-charcoal —
      confirmed, not superseded)
- [ ] Replacement accent color chosen (acid-lime is rejected in both variants)
- [ ] Hero video assembled and shipped on the landing page

## Phase 4 — Real AI Fitting Room

- [ ] Replace the current no-backend mock with a working virtual try-on

## Phase 5 — Everything else

- [ ] First real affiliate partner signed (any willing brand qualifies)
- [ ] Real catalog replaces the synthetic demo catalog entirely
- [ ] Analytics switched on (stays off until there is real traffic)
- [ ] Premium tier defined and priced — direction is more/smarter AI fitting
      and semantic search, not ads or early sale access
- [ ] Outstanding audit fixes: Account-mock honesty gap, demo-store
      differentiation, nav-structure duplication in `lib/i18n.ts`

---

## Deliberately open

These are not gaps in thinking — they are decisions that can only be made
against real information, and were consciously left for later:

- Exact revenue target (to be learned by fact, not projected)
- Exact hero-video ship date (depends on AI-assembly quality)
- Final brand name and the new accent color (outputs of the steps above)
- The first partner's actual feed format (depends who says yes)
- Premium pricing and tier boundaries (direction set, numbers not)
