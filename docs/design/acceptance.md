# Acceptance ledger

12 September 2026. Results below refer to actual local production evidence; not-run scopes are explicit. [Browser detail](qa-browser.md), [handoff](handoff.md), [performance](performance-final.md).

| Brief criterion | Result / evidence |
| --- | --- |
| UX-01 / UX-02 first visit EN desktop / LT mobile | PASS — final home screenshots; immediate query, examples and clothing; visual reviewer and leader inspected |
| UX-03 category/colour/budget | PASS — semantic unit constraints, budget/store intersection tests, real Enter search and integration fallback bounds |
| UX-04 Enter and duplicate submit | PASS — actual submissions recorded; duplicate black-coat intent makes one RSC request |
| UX-05 blank/whitespace | PASS — browse without query, cache bypass; local results rather than fabricated AI work |
| UX-06 different response latency | PASS — async browser holds old linen RSC, commits white-sneakers, releases older response; final URL/input/results remain latest in three contexts |
| UX-07 query example | PASS — real example submission |
| UX-08 budget | PASS — invalid range focus, zero, comma decimals, numeric product intersection |
| UX-09 multi-store | PASS — two selected stores/count/cards, private slugs absent |
| UX-10 / UX-11 draft cancel / apply | PASS — Cancel/Escape/backdrop discard; Apply changes URL, closes modal, returns focus; scroll-lock implementation verified |
| UX-12 one chip | PASS — only selected condition removed |
| UX-13 clear filters | PASS — query/locale/sort survive, page resets |
| UX-14 sort / optional price | PASS — numeric ascending/descending/history; sparse price renders em dash, not zero/NaN |
| UX-15 zero results | PASS — distinct status, preserved URL, recovery action, screenshot |
| UX-16 full catalog failure | PASS — isolated exact-file fault gives real HTTP500; same-URL Retry restores13 products, query retained |
| UX-17 unavailable AI / local fallback | PASS for disabled-provider local fallback via actual production integration; live Gemini timeout/provider-error smoke NOT RUN |
| UX-18 absent optional fields | PASS — isolated sparse MOCK-001 fixture EN/LT: price/image absent, no invented old price/sizes/colour/audience |
| UX-19 image404 | PASS — one image fails without changing card geometry or replacing the garment |
| UX-20 details/back | PASS — search context survives, direct link falls back to search |
| UX-21 /out security | PASS — unknown ID404, hostile returnTo rejected, same-origin202/cross-origin403/oversize413 retained |
| UX-22 language | PASS — SSR LT, active filters stable; full locale suite3004 assertions,100 same-tick language races |
| UX-23 keyboard | PASS in headless keyboard walkthrough — skip link, submit, chips, modal focus cycle/Escape, gallery and 3D rotation |
| UX-24 320px / 200% | PASS for responsive screenshots and documented CSS-zoom reflow simulation; physical/browser-UI zoom NOT RUN |
| UX-25 reduced motion | PASS — media preference, transition override, disabled 3D auto-rotation |
| UX-26 long LT | PASS — responsive query/chips/filter labels and visual review; long single-line placeholder naturally scrolls/clips within input, not a hidden action |
| UX-27 unknown route | PASS — localized404 and useful search link |
| UX-28 production build | PASS — Next16.3.5 build/typecheck; no source/SQL/env secrets added |
| UX-29 backend/import | PASS for existing unit/search/HTTP gates. Dedicated PostgreSQL17 container integration NOT RUN; docker/podman/psql unavailable in shell. SQL, catalog/RLS loader, importer and CI approvals unchanged |
| UX-30 final visual pass | PASS — two review cycles plus latest-code primary12/secondary40/populated-saved4 and targeted3D captures; observed blockers corrected |

Additional checks: malformed/blocked/cross-tab saved storage; actual recent searches; responsive theme-control synchronization; 501-character URL query; valid Unicode/special characters; no-JavaScript search+filters; widths320/360/390/430/768/1280/1440/1920.

The literal source query `something for a wedding` still fails pre-existing REGRESSION-012 (17 results, cap12). DEV44/44 and REGRESSION47/48 satisfy the existing gate. No claim of all semantic cases passing, new untouched blind evaluation, live cloud correctness, conversion gain or WCAG certification is made.
