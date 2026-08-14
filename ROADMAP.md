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
- [x] Legal/GDPR baseline (2026-07-31). Live privacy page now covers cookie
      use and EU/EEA data rights in both languages. Cookie consent banner
      built and exercised, rendered only when
      `NEXT_PUBLIC_COOKIE_BANNER_ENABLED=true` — flip it on before the first
      real affiliate link. Affiliate-tracking language stays out of the live
      pages until there is an actual affiliate relationship to describe.
      **Still open before going live:** wire the recorded consent into
      `app/api/analytics/*` (they no-op today without a PostHog key, which is
      the interim cover), and fill `[CONTACT_EMAIL]`, `[DOMAIN]`,
      `[OWNER_NAME_OR_COMPANY]` in `docs/legal/`.

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

- [x] **Semantic search** (2026-08-01) — `lib/semantic-search.ts` replaces the
      old boolean token match with a weighted concept graph. "Something warm
      for winter" now returns coats and knitwear; before, it returned nothing,
      because no product row contains the word "warm". Results are *ranked* by
      relevance rather than filtered by keyword presence, so a partial match
      surfaces instead of collapsing to an empty page. EN and LT share one
      lexicon; typos survive one edit including transpositions.
  - [x] Test query set + pass threshold — **`npm run test:search`**, 25
        labelled queries across season, weather, occasion, activity, material,
        colour, price, department, exact recall, typos, and Lithuanian.
        **Proposed threshold: 80% of queries passing, where a query passes if
        precision@k ≥ 0.6 (k = min(5, relevant)), every required item ranks,
        and the result set stays under the query's cap.
        Current: 25/25 (100%), mean precision 0.918, mean recall 0.990.**
        *Owner sign-off on the threshold is still outstanding* — the number is
        measured and reproducible, but it was set by the assistant.
  - [ ] **Visual** search (match by image content) is NOT built. The catalog
        has no motif/pattern attributes, so a query like "hoodie with stars"
        can reach `graphic` but not `stars`. This needs either per-product
        visual attributes or an image-embedding model, and belongs with the
        real catalog in Phase 5.
- [x] **Cross-store comparison** (2026-08-01) — the same item across every
      store that carries it, price and sizes side by side, on the product page,
      with a "N stores · from €X" signal on search cards.
      **Read this before trusting the demo:** the base catalog could not
      support this at all — all 64 rows sit in one store and no two rows are
      the same item, so there was literally nothing to compare. The multi-store
      listings in `data/mock_listings.csv` are therefore *generated*
      (`npm run data:listings`), and the UI says so on the page. The mechanism
      is real; the prices are not.
  - [x] Product-identity matching strategy — trivial here (listings are keyed
        to `mock_product_id` by construction). The real strategy for a real
        feed is tiered GTIN → brand+MPN → embedding similarity → manual, spec'd
        in [`docs/feed-format-research-2026-07-31.md`](docs/feed-format-research-2026-07-31.md).
        `lib/product-listings.ts` is shaped so only its loader changes.

## Phase 3 — Visual (2026-08-01)

- [x] Light theme moved to a crisp white canvas over near-black ink. The
      neutrals were deliberately de-tinted: the Variant B block those values
      came from ran 13–24 points bluer than red, a side effect of that A/B
      comparison rather than part of what was chosen.
- [x] Dark theme stays on Variant A (espresso-charcoal) — untouched.
- [x] **Accent chosen: rust `#b7410e`** (owner, judged on rendered pages, over
      magenta, teal and cobalt). It is two roles, not one: `--color-accent` is
      drawn as text/borders at 5.6:1 on white, and `--color-acid` is the fill
      under near-black text (inverse buttons, store chips), now a peach tint
      of the same hue so the pair cannot drift. Acid-lime is gone.
- [x] **`/` is now a title page** (2026-08-01) — wordmark, slogan, one line of
      what this is, one button into search, and the wardrobe loop behind it.
      The category nav, product edit and trust band were removed: all three
      duplicated `/search`, which is one click away. The demo label stays —
      the synthetic-catalog boundary is a hard rule and this is now the first
      thing anyone sees.
- [x] Hero loop shipped (2026-08-01), then retired (2026-08-14) — it was a 13s
      dissolve between five wardrobe keyframes (`hero-loop.mp4`/`.webm`). The
      title page now shows a single wardrobe still, softly blurred behind the
      copy, and the wordmark plays its "we fit" reveal on click instead of on
      load. The video files were removed; `hero-poster.jpg` is the still.
  - **One keyframe was excluded on purpose:** `wardrobe-keyframe-04` carries
    recognisable branding (a Diesel-style buckle, Stan-Smith-style sneakers, a
    logo tee), which the demo-data boundary forbids in shopper-facing imagery.
    It stays in `public/hero-assets/` as a source file but is not in the loop.
  - Not an AI-generated motion sequence: ffmpeg cross-dissolves stills. Real
    interpolated movement between the keyframes needs a video model.

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
