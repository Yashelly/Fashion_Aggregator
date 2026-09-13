# Independent visual review — pass 1

12 September 2026. Read-only review of the twelve viewport-scale PNGs in `.omx/artifacts/frontend/pass-1/` (home, results and details; EN/LT; 1440×1000 and 390×844), together with `DESIGN.md`, the audit and the visual acceptance criteria in the owner brief. This is an image review, not a DOM, keyboard or contrast audit.

## What already works in the images

- The first hierarchy is now consistent: wordmark → editorial title → labelled natural-language search → restrained rust submit. The home page reads as clothing search, rather than an AI landing page.
- Clothing is visible in the first home viewport at both widths, and the results grid begins at y=379 desktop and y=377–396 mobile. The results page is materially more compact than the audited baseline.
- EN and LT headings have deliberate line breaks and all inspected Lithuanian glyphs render legibly. The longer LT copy does not visibly collide with the input, submit or header controls.
- The two gallery views on details are large on desktop and compact enough on mobile to leave the product title, store, price and sizes in the same viewport. The 3D action is visually secondary.
- No visible horizontal clipping was found in the twelve frames; the capture manifest also records `overflow: false`. This does not establish behaviour at the other required breakpoints.

## Highest-impact defects to correct

1. **Noticeable — product cards do not expose their primary next action.** In all results frames the underlined store name looks more clickable than the product title, while there is no persistent “View details / Peržiūrėti” affordance. A shopper can infer that the image or title opens the item, but the hierarchy does not clearly say so without hover. Add one quiet, always-visible details link or make the title’s link treatment unmistakable; keep the heart independent and keep the grid height stable.

2. **Noticeable — the mobile home category row breaks the rhythm and delays the first full product row.** At 390 px, EN leaves “Shoes” alone on a second line and LT becomes two uneven rows. The section divider then lands at the viewport edge; the first catalog product begins only at y=918 EN / y=946 LT. Keep categories in one deliberate horizontal scroller with a visible continuation cue, or use a balanced compact layout and pull “A place to start” upward. The two hero garments already satisfy early clothing visibility, so this is a density and continuity correction, not a request for a taller hero.

3. **Noticeable — mobile filter/sort hierarchy is visually ambiguous.** In both result locales, a narrow Filters button and a wide select sit at opposite edges with a large empty gap; the select exposes only “Relevance / Aktualumą”, not the action “Sort”. Make the pair read as two related controls (for example equal-width buttons, with “Sort: Relevance / Rikiuoti: Aktualumą”), then place the count directly beneath. Preserve the current compact grid start rather than adding another toolbar row.

4. **Noticeable bilingual defect — the LT details view still renders `Stone`.** The interface labels around it are Lithuanian (`Spalva`, `Marškinėliai`, `Vyrams`), so the raw colour value is conspicuously mixed-language. Localise known semantic colour values in presentation code while leaving source product titles unchanged, as required by the design contract. Verify this in `details-lt-mobile` and `details-lt-desktop` on pass 2.

## Preference notes, not defects

The linen/rust palette, serif page titles, asymmetric home photography and generous desktop image scale are coherent with selected direction A and should not be changed merely for novelty. The home desktop catalog begins low in the viewport, but the two real garment previews already make clothing visible; only the mobile category wrap creates a concrete rhythm problem. Product source titles remaining English in LT are explicitly allowed by `DESIGN.md`; the untranslated interface-level colour value is the narrower defect.

## Pass-2 visual checks

Re-open the same twelve frames after corrections and confirm: visible details affordance does not push card rows out of alignment; mobile categories no longer form an accidental orphan row; filter and sort remain recognisable at 390 px in both locales; `Stone` is localised; the results grid still begins before roughly y=420. Also inspect the required 320 px narrow frame and the mobile filter-sheet frame separately, because neither is evidenced by this twelve-image set.
