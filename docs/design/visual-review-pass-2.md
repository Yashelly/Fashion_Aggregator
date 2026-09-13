# Independent visual review — pass 2

12 September 2026. Read-only comparison of all twelve viewport-scale PNGs in `.omx/artifacts/frontend/pass-2/` against pass 1, plus the available 320 px home, LT dark filter-dialog, 200% zoom and image-failure screenshots under `.omx/artifacts/frontend/qa-browser/screenshots/`. This records only what is visible in the images; it does not infer keyboard, focus-trap, scroll-lock or submission behaviour.

## Pass-1 findings

1. **Resolved — product-card next action.** Every inspected results card now exposes a persistent “View details / Peržiūrėti” link beside the store. The title remains the visual identity, price remains easy to scan, and the new action does not change the row height or obscure the save control.
2. **Resolved — mobile category orphan row.** Categories now form one horizontal strip. At 390 px the partially visible trailing item provides a continuation cue, and the section transition moves upward: the first catalog product is recorded at y=874 EN / y=902 LT instead of y=918 / y=946.
3. **Resolved — mobile filter/sort ambiguity.** Filters and sort now use equal columns and sort has a visible “Sort by / Rikiuoti pagal” label. The trade-off is a small grid shift to y=420 EN / y=401 LT, still leaving the first product pair clearly visible in the 844 px frame.
4. **Resolved — LT colour value.** The detail frames render `Akmens pilkumo` beside `Spalva`; the previous raw `Stone` value is gone. Category, audience and actions remain consistently Lithuanian while the source product title stays unchanged by design.

## Remaining visual defects

- **Minor polish — the home section action wraps awkwardly on mobile.** In `home-en-mobile`, “Explore all clothing” breaks onto two lines while its arrow sits at the far right, weakening the otherwise clean transition into “A place to start”. Keep label and arrow as one compact non-wrapping unit, or stack the action below the section title at narrow widths. Recheck the longer LT equivalent at 390 and 320 px after any change.
- **Minor polish — the 320 px search example is clipped inside the field.** `responsive-320-home.png` shows the LT placeholder ending mid-budget because the explicit submit button correctly retains its width. The adjacent example chips preserve meaning, so this is not a core-flow blocker; a shorter narrow-screen placeholder would make the search affordance look more intentional without replacing the labelled field or submit text.

No blocking or noticeable visual defect remains in the twelve primary pass-2 frames. The linen/rust hierarchy, garment visibility, desktop density, bilingual headings and mobile results composition remain coherent after the fixes.

## Supplemental screenshots

- `responsive-320-home.png`: header, search, query chips, two garments and category strip fit without visible horizontal clipping; the placeholder issue above remains.
- `axe-dialog-lt-dark-mobile-390.png`: the full filter sheet, all visible labels, six store choices and both footer actions fit in one 390×844 frame. Behaviour and contrast are outside this image-only verdict.
- `lt-search-css-zoom-200-percent-320-effective.png`: visible controls, active store chips and copy reflow without visible horizontal overlap in the captured region. The screenshot cannot establish the rest of the vertically scrolled page.
- `image-failure-mobile-390.png`: the unavailable-image treatment preserves the same card dimensions and leaves title, price, store and details action visible.

## Visual stop condition

The four pass-1 corrections are evidenced in both locales and both primary viewports. The two remaining items are narrow-screen polish; neither hides search, clothing, filters, sort, store identity or the path to details. If either receives a CSS/copy adjustment, only the affected 320/390 home frames need another image review.

## Secondary-route evidence

All four contact boards and the full account, stores, 3D preview, contact, privacy, terms, commercial-links and data-sources images were inspected in EN/LT at desktop and mobile sizes. The secondary manifest contains 40 captures; it records HTTP 200, no page errors and no horizontal overflow for every route/locale/viewport combination. Those records do not prove interaction behaviour.

Concrete remaining findings:

1. **Blocking product/visual defect — the public 3D preview renders a giant `SOON` word rather than the selected garment or a mannequin.** This is prominent in all four full 3D captures, directly beneath “Inspect the shape / Apžiūrėk formą”. It reads as an unfinished placeholder and contradicts the surrounding instruction to rotate and inspect an approximate garment form. Remove the `SOON` object from the public result; show the actual approximate garment/mannequin if available, or use an honest non-interactive unavailable state without presenting rotation controls as useful.
2. **Blocking copy consistency — Privacy describes data flows that the other captured pages say do not exist.** `privacy-en-desktop` says Weft processes information to “answer contact messages” and includes “messages sent through contact channels”, while both Contact frames explicitly say the site does not collect messages through a contact form. Privacy also says it measures “outbound retailer clicks”, while Terms and Commercial links state that there are no active purchase links. The privacy text must describe only the processing actually present now; future processing can be stated conditionally rather than as current fact. The same contradiction appears in LT.
3. **Noticeable mobile hierarchy defect — the empty account page repeats the same saved-pieces concept three times in succession.** In `account-*-mobile`, the sidebar-derived “Saved pieces / Išsaugotos prekės” introduction is immediately followed by a card with the same heading and then “Your collection starts here / Kolekcija prasideda čia”. Desktop separation makes the summary understandable, but the stacked mobile order reads as duplicated content before the one useful CTA. Collapse the summary on mobile or give the card one consolidated empty-state heading.

No additional blocking visual issue was found in Stores or the inspected legal/information layouts: store counts, neutral store identity and garment strips remain legible in both locales; mobile legal copy reflows cleanly; footer links wrap in orderly rows. The account screenshots evidence only the empty saved state, not a populated saved collection.

## Final visual confirmation — 12 September 2026, 10:57 UTC capture set

Representative EN/LT desktop/mobile frames from `.omx/artifacts/frontend/final/` retain the approved hierarchy: search and garments remain visible on home, mobile result controls and details links remain clear, and LT product attributes remain localised. The twelve-entry final manifest records HTTP 200, no page errors and no horizontal overflow. This is capture evidence only, not an interaction claim.

The three secondary findings above are now visually resolved:

- Refreshed 3D captures render one mannequin with an approximate garment instead of `SOON`. The selected-knitwear state was re-opened as the exact file `.omx/artifacts/frontend/fitting-room/knitwear-en-desktop.png`: 321,312 bytes, modified 2026-09-12 10:57:49 UTC, SHA-256 `AA4F97A2C42A203E7AF5609FDC5765712D4055A70072E4CE475760556A3C9D81`. It shows one centred brown-clad mannequin and one floor shadow. An earlier combined-image tool emission appeared to show duplicate figures, but the isolated current file does not reproduce that image; no blocker is recorded from the stale/misrendered emission.
- Refreshed EN/LT Privacy frames explicitly say there are no retailer purchase links or contact-message forms, distinguish Weft detail openings from retailer visits/purchases, and describe current analytics, local storage and photo processing consistently with Contact and Commercial links.
- Refreshed empty account mobile removes the repeated introductory saved-pieces block. All four `account-populated-*` frames show two distinct saved items with remove controls, a count of two and one recent-search chip; the EN/LT mobile layouts remain readable without duplicated headings or visible clipping.

**Final image verdict:** no blocking visual or copy defect remains in the requested final primary and secondary evidence. The earlier two narrow-home observations remain minor polish rather than release blockers. This verdict does not extend to behaviour that a still image cannot prove.
