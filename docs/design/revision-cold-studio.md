# Visual revision after owner feedback

12 September 2026. The owner rejected the first implementation as looking like a WordPress template. This supersedes the earlier expert ranking: passing functional QA did not establish aesthetic acceptance.

## Plan and critique before implementation

The reviewed production image combines cream, Georgia, rust, a standard copy/two-card hero and pill links. Changing only the accent would preserve that silhouette. Replace the whole entry composition with a searchable wardrobe: a graphic Syne masthead, an independent wide search and a single continuous category-photo rail. Use cold studio #F1F3F6, white #FFFFFF, ink #0A0B0D, graphite #565F6B, seam #CCD1D8 and denim action #1746D1. All are shared semantic tokens; no parallel theme system.

An independent designer corroborated the template diagnosis and proposed a 640–700 px panoramic mannequin stage. The main implementation deliberately rejects that height: the master brief requires immediate search and early real clothing, not another large marketing hero. Use actual category products, not a decorative scene or new photos. The boldness is concentrated in the masthead and the continuous image rail; the surrounding controls stay quiet.

Desktop: left-aligned large title + concise explanation; wide search; plain example links; four category photographs sharing one baseline; catalog. Mobile: readable title and real search, then a swipeable category rail and the two-column catalog. Results, details, saved collection and supporting pages inherit the same sans-serif/colour system.

## Preserved contracts

Existing GET search, URL filters, native modal draft/apply/cancel, locale race protection, saved items, safe public DTOs, no-redirect /out and original product imagery. No search ranking, data, service, deployment or dependency changes.

## Validation

Fresh production build and TypeScript/lint pass. Unit tests: 56/56. HTTP integration: 15/15, including no-redirect product detail and analytics-origin boundaries. App dependencies, backend and data are unchanged in this revision.

`scripts/frontend_capture.py --phase revision-cold-studio-final` produced 12 EN/LT home/results/details screenshots at 1440×1000 and 390×844, with no page errors or horizontal overflow. Capture now explicitly resets and asserts scrollY=0. Main and an independent designer reviewed the images; subjective owner acceptance is not inferred from the review. The duplicate category row, cropped third mobile label and repeated per-card View details links were removed in the second pass. The category rail shows two complete images on mobile and exposes the remaining two through native scrolling/keyboard focus.

`scripts/wardrobe_revision_e2e.py`: 16/16 EN/LT × 320/360/390/430/768/1280/1440/1920 cases pass. Covers heading reflow, no page overflow, two complete mobile cards, keyboard access to the last category and useful locale-preserving search results. Evidence: `.omx/artifacts/frontend/revision-cold-studio-final/wardrobe-regression.json`.

General browser QA: 21 PASS / 0 FAIL / 3 NOT RUN; all 24 axe scans (EN/LT, light/dark, five routes and open filters) report zero violations. Evidence: `.omx/artifacts/frontend/revision-cold-studio-qa/report.json`. The first relative-artifact-path invocation exposed a harness defect; normalizing that argument to an absolute path fixed it, and the original relative invocation was rerun successfully. No UI assertion was removed. Locale race tests likewise use the replacement server-rendered `.wardrobe-link` after deliberate deletion of the duplicated navigation; their timing, iterations and assertions remain unchanged.

Full fresh locale suite: PASS, 2968 assertions, 203 actual internal-link clicks and zero browser errors. Includes the unchanged 700 assertions in 100 same-tick locale/navigation race cases. Evidence: `.omx/artifacts/qa/locale-cold-studio.json`. The total is lower than the historical 3004 because the duplicated homepage navigation was deliberately removed; no assertion threshold or race iteration count was weakened.

## Contrast observations

Computed from WCAG sRGB relative luminance for the actual new tokens, not judged by screenshot colour:

| Pair | Light | Dark |
|---|---:|---:|
| Main text / canvas | 17.71:1 | 16.74:1 |
| Secondary text / canvas | 5.82:1 | 9.99:1 |
| Button text / action fill | 7.41:1 | 8.78:1 |
| Control boundary / canvas (dark: surface) | 3.45:1 | 4.80:1 |
| Focus / canvas (dark: surface) | 6.67:1 | 8.72:1 |

Automated checks are not formal WCAG certification. Physical devices, screen readers, real browser UI zoom/forced colours, live Gemini and a newly injected catalog-outage scenario were not rerun for this cosmetic revision. The earlier performance comparison belongs to the rejected first composition, not this one; no new field-performance or conversion claim is made. The 3D preview remains approximate; its prominent detail-page action is a remaining hierarchy tradeoff, not a new capability.

## Workflow and changed surface

OMX `$design` and `$frontend-design` informed the revised contract and anti-template composition; native designer/browser-QA lanes supplied independent checks. The design skill's optional `.codex/templates/AGENTS.md` support link is absent locally, so the provided project `AGENTS.md` remains the governing contract. No runtime authority or tmux workflow was fabricated.

Changes in this follow-up are confined to `app/page.tsx`, `app/globals.css`, `app/layout.tsx`, `components/product-grid.tsx`, `lib/i18n.ts`, design/onboarding docs and the screenshot/locale/browser test harnesses plus the focused wardrobe test. Existing uncommitted changes from the larger redesign are preserved. No commit, merge or deployment was performed; the local production preview stays on 127.0.0.1:3100.
