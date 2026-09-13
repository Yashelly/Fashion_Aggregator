# Browser QA: public frontend

Status: final local production pass completed 2026-09-12. This is browser evidence, not a claim of formal WCAG conformance or physical-device certification.

## Method

- Server under test: `http://127.0.0.1:3100`, production build, Next.js 16.3.5.
- Browser: installed Python Playwright Chromium, headless.
- Final catalog/API mode: deterministic CSV fallback. External variables were blank at build time and runtime; Gemini, Supabase cloud and paid services were not called by the final run.
- Main command: `python scripts/frontend_e2e.py --base-url http://127.0.0.1:3100`.
- The runner records each case independently and continues after a failure. Machine-readable evidence is in `.omx/artifacts/frontend/qa-browser/report.json`; the before-fix record is `report-initial.json`.
- Axe uses the repository-local `node_modules/axe-core/axe.min.js`: five public routes plus the open filter dialog, EN/LT, light/dark, 24 scans in total.

## Verdict

Final general browser pass: **PASS — 21 checks passed, 0 failed, 3 explicitly not run in that runner**. The command exited 0. Supplemental controlled suites then passed UX-06 latency ordering (three iterations), UX-16 catalog error/retry, and UX-18 sparse product rendering. Counts are kept separate because they are different runners; they are not presented as an inflated “24/24” total.

The first grounded pass was 18 pass / 3 fail / 3 not run. It found three P1 defects:

1. `/search` was inside a hidden streamed boundary when JavaScript was disabled, so the advertised native GET fallback was inaccessible.
2. Tab left the filter dialog for `BODY` after the Apply button.
3. Tab left the product lightbox for `BODY` after the image button.

After the loading boundary and dialog focus handling were corrected, all three exact reproductions passed in the full rerun. The initial DOM ancestry and focus sequences remain in `report-initial.json`; initial failure screenshots remain under `screenshots/FAIL-nojs-01.png`, `screenshots/FAIL-ux-23.png`, and `screenshots/FAIL-detail-01.png`.

A later repeated run exposed a fourth P1: an earlier `linen shirt` response could remount the search input and erase a just-entered `white sneakers` intent. That failure is preserved in `report-race-failure.json`. After stabilising the form mount and preserving edited draft text, two instrumented full reruns passed. The final trace records both submitted values and both RSC URLs, then ends with the URL and visible input set to `white sneakers`; the duplicate `black coat` submit produced only one RSC request.

Historical browser runs before the final build may have read the same synthetic catalog through its public RLS projection because a public Supabase value had been inlined at build time. They performed no writes. Only the final `report.json` and final screenshots are claimed as the build-time-and-runtime-blank CSV run.

## Acceptance coverage

| Coverage | Result | Direct evidence |
|---|---|---|
| UX-03/04/05/07/15 | PASS | EN/LT Enter search; visible examples; blank/whitespace; clear input; exact `coat`; zero-result state |
| UX-08/09/10/11/12/13 | PASS | Invalid range and focus; zero/comma decimal; two stores; Apply/Cancel/Escape/backdrop; one-chip removal; clear filters retains query |
| UX-14 | PASS | Numeric low/high ordering; relevance/default; 20→50 resets page; browser back/forward restores sort |
| UX-20/21 | PASS | Details returns to query/sort; hostile `returnTo` is rejected; unknown product stays same-origin and 404 |
| UX-22/27 | PASS | LT in initial server HTML; EN→LT preserves query/sort; unknown LT route has a working search recovery link |
| UX-23 | PASS | Skip link reaches `main`; filter modal keeps keyboard focus and restores the trigger on Escape |
| UX-24/25/26 | PASS | 320-effective reflow under a documented 200% CSS-zoom simulation; long LT state; reduced-motion media query and transition override |
| SAVE-01/02 | PASS | Save/remove across SPA navigation and a second tab; malformed and blocked localStorage degrade to safe memory state |
| DETAIL-01 | PASS | Mobile gallery focus wrap, Escape, and trigger restoration |
| NOJS-01 | PASS | Search and native filter GET submission with JavaScript disabled |
| FORM-01 | PASS | 501-character URL state is rejected safely; special characters and Lithuanian diacritics stay escaped |
| RESP-01 | PASS | Representative routes at 320, 360, 390, 430, 768, 1280, 1440 and 1920 CSS px; no document horizontal scroll |
| UX-19 | PASS | Forced 404 on one rendered product image shows an honest placeholder and preserves card geometry |
| A11Y-01 | PASS | 24 axe runs, zero reported WCAG-tag violations; manual keyboard checks above remain separate evidence |
| UX-06 | PASS (supplemental) | Three controlled iterations held the older `linen shirt` RSC response, committed `white sneakers`, then released the older response; URL, input, results and console remained on the newer intent |
| UX-16 | PASS (supplemental) | Dedicated port-3112 fault fixture produced an actual HTTP 500 and localized error state; Retry reloaded the same URL and restored 13 products with the query retained |
| UX-17 | NOT RUN live | Live Gemini was intentionally disabled. The credential-disabled local fallback works in existing integration coverage, but this QA does not claim a live provider timeout test |
| UX-18 | PASS (supplemental) | Dedicated sparse-product fixture rendered missing price, sizes, optional facts and images honestly in EN and LT with no page errors |
| Physical assistive technology | NOT RUN | No physical iPhone/Android, NVDA, TalkBack or Windows High Contrast session was available |

## Controlled catalog and sparse-product suites

`scripts/catalog_failure_e2e.py` starts its own localhost-only Next process on port 3112 and preloads `scripts/catalog-fault.cjs`. The hook is limited to the exact resolved `data/mock_products.csv` path and only activates while its own marker exists under `.omx/artifacts/frontend/qa-browser`; it removes the marker and terminates only its own process in `finally`.

The first attempt ran against an older build with a public Supabase value already inlined at build time, so it legitimately read the public RLS synthetic catalog and never reached the CSV hook. That was a build-configuration issue, not a Turbopack `fs` binding failure. After rebuilding with external variables blank at build time and runtime, the exact same bounded fixture produced an actual HTTP 500, showed the localized error state without misrepresenting it as zero results, retained the query, and recovered 13 products after the real Retry control reloaded the same URL. Evidence: `catalog-failure-report.json`, `catalog-fault-server.log`, `catalog-failure-lt-mobile-390.png`, and `catalog-recovered-lt-mobile-390.png`.

The companion sparse-product fixture removed price, sizes, optional facts and images from one deterministic catalog entry. Its detail page rendered honest omissions/fallbacks in EN and LT with no page errors. Evidence: `sparse-product-report.json`, `sparse-product-en-mobile-390.png`, and `sparse-product-lt-mobile-390.png`.

No committed CSV, public simulation route, application source, production data or credential was changed by either fixture; each dedicated process and marker was cleaned up by its runner.

## Screenshots opened and reviewed

- `responsive-1440-home.png`: the search is the primary action; clothing and the first catalog row appear early; desktop header remains compact.
- `responsive-320-home.png`: LT heading, input, submit and both examples fit before the clothing preview; product imagery starts in the first viewport.
- `axe-dialog-lt-dark-mobile-390.png`: mobile sheet labels and bottom actions remain visible at 390×844 in dark mode.
- `details-mobile-gallery-focus-390.png`: the garment remains fully visible rather than being cropped, with an explicit close control.
- `image-failure-mobile-390.png`: one honest image-unavailable tile keeps the same geometry as adjacent cards.
- `results-en-desktop-two-stores.png`: both selected store chips, result count, sorting and clothing remain visible without crowding the grid.
- `nojs-results-lt-mobile-390.png`: the native GET fallback preserves query and applied filters; its explicit noscript sort button uses the same compact control styling.
- `lt-search-css-zoom-200-percent-320-effective.png`: controls reflow without horizontal scroll; this is a CSS zoom simulation, not a browser-UI zoom or physical-device test.
- `navigation-race-white-wins-1.png` through `navigation-race-white-wins-3.png`: the newer `white sneakers` intent remains visible after the deliberately delayed older RSC response is released.
- `catalog-failure-lt-mobile-390.png` and `catalog-recovered-lt-mobile-390.png`: the localized failure state and successful same-URL Retry recovery.
- `sparse-product-en-mobile-390.png` and `sparse-product-lt-mobile-390.png`: honest optional-data fallbacks in both languages.
- `empty-results-en-1440.png`, `keyboard-filter-focus-desktop.png`, and the responsive matrix provide the remaining functional states.

Visual review found no blocking overlap, clipped action, or horizontal overflow in the final evidence. The large 200% state naturally moves products below the first viewport but keeps search, filters, selected chips and clearing controls operable.

## Limits and reproducibility

- Next RSC network ordering was exercised by holding and releasing an actual older search response across three iterations. This does not claim a live Gemini response-race test.
- Axe detects only a subset of barriers. Zero violations does not equal WCAG 2.2 conformance.
- The 200% check is a deterministic CSS-zoom reflow approximation in headless Chromium. A real browser zoom and physical mobile pass remain unavailable evidence sources.
- External cloud catalogs, production writes, deployment, checkout and merchant redirects were intentionally out of scope and untouched.
