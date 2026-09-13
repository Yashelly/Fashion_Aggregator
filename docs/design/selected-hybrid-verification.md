# Weft — selected hybrid: implementation and verification

12 September 2026 · `codex/weft-frontend-redesign` · local implementation complete.

Current result: homepage A, search bar A, catalog B, and left filters following principle C. White background, black utility typography, and clothing photography; the previous cream/serif and cold-studio versions were rejected. [DESIGN.md](../../DESIGN.md) is the decision source. This record supersedes the visual conclusions of earlier handoff/revision documents while preserving them as history.

## View

One local production preview remains: [homepage](http://127.0.0.1:3100/?lang=en), [catalog](http://127.0.0.1:3100/search?lang=en). This is not an internet deployment.

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Homepage EN | [screenshot](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-en-desktop.png) | [screenshot](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-en-390.png) |
| Homepage LT | [screenshot](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-lt-1440.png) | [screenshot](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-lt-390.png) |
| Catalog EN | [4 columns](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-4-desktop.png) | [2 columns](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-mobile-390.png) |
| Catalog LT | [screenshot](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/browse-lt-1440.png) | [screenshot](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/browse-lt-390.png) |

Also available: [3 columns](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-3-desktop.png), [5 columns](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-5-desktop.png), and [hidden filters](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-sidebar-hidden-desktop.png). The screenshots folder also preserves results for the `black` query, product details, and favorites in EN/LT on desktop/mobile.

## Implemented

- Homepage: a large crop of the real MOCK-011 photo, floating white navigation with search, a lower heading/catalog link, and a small full-item image. If the product is absent, no substitute or price is fabricated.
- Catalog: four columns by default, 4:5 photos, 2 px horizontal gap, and a restrained name/store/price row. Search has a bounded width rather than stretching across the screen.
- The 216 px left filters can be hidden. Changes are applied explicitly; Cancel, Escape, or closing the mobile panel resets the draft.
- A small native `View: 4` control beside sorting replaces the large switcher. Choices 3/4/5 persist locally and do not alter the URL, ranking, or page size. Excessively dense layouts are unavailable when width is insufficient. Phones use two columns and tablets three; the desktop preference is restored.
- Search, sorting, and filters retain native GET operation without JavaScript; the JS-dependent density control is hidden in that mode. Blocked localStorage does not break the controls.
- Shared typography and tokens are aligned across product details, favorites, stores, and utility pages. Theme and approximate 3D preview remain available but do not occupy primary navigation.
- A reviewer-found case of immediate form submission after switching language was fixed: the URL, server results, and interface now share the same current language intent.

Primary changed surfaces: `app/page.tsx`, `app/search/page.tsx`, `app/layout.tsx`, `app/globals.css`; the `site-header`, `site-footer`, `search-input`, `search-controls`, `search-form`, `locale-provider`, `product-grid`, and `product-detail-view` components; new `category-nav` and `theme-toggle`; `lib/i18n.ts` and `lib/use-client-locale.ts`. Regressions: `scripts/selected_hybrid_e2e.py` and `scripts/locale_form_intent_e2e.py`. DESIGN/CLAUDE and current app/components AGENTS descriptions were updated. Pre-existing changes in the shared working branch were preserved; this list does not attribute the entire dirty worktree to this iteration.

Simplifications: the previous visual composition was removed instead of layering on an alternative theme; Syne remains only for the wordmark, while the main interface uses Arial/Helvetica; native select/dialog/form elements reuse the existing URL model and server results. This iteration added no dependencies.

## Verification

Checks ran against a production build of the local application with the synthetic catalog's real ordering. Optional-service secrets were not used; `.env.local` was unchanged.

| Check | Result |
| --- | --- |
| `npm run build` | PASS, 81 routes |
| `npm run lint`, `npm run typecheck` | PASS; both commands check TypeScript, with no separate ESLint audit claimed |
| `git -c core.safecrlf=false diff --check` | PASS |
| `npm run test:unit` | 56/56 PASS |
| `npm run test:integration` | 15/15 PASS |
| `npm run test:locale` | 3,125 assertions PASS, 14 routes, 231 navigations, 0 browser errors |
| `python scripts/locale_form_intent_e2e.py` | 8/8 PASS: home/search/sort/filters, both EN/LT directions |
| `python scripts/navigation_race_e2e.py` | 3/3 PASS: a late response does not replace a newer request |
| `python scripts/selected_hybrid_e2e.py` | 11/11 groups PASS; 24 axe scans without violations; 0 browser errors |
| `npm run test:search` — DEV/REGRESSION only | Threshold gate PASS; DEV 44/44, REGRESSION 47/48 — limitation below |

Responsive matrix: 320/360/390/430/768/1280/1440/1920 px, with no horizontal document overflow. EN/LT, light/dark theme, focus and Escape in filters, Apply/Cancel/reset, multiple stores, budget, sidebar hiding, density and restoration, no JavaScript, and blocked storage were checked. A locally scrollable category row and enlarged image cropped inside the hero do not constitute document overflow.

Machine-readable evidence: [browser/visual/axe report](../../.omx/artifacts/frontend/selected-hybrid-qa/report.json), [locale summary](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-summary.json), [locale-form red](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-form-intent-before.json), [locale-form green](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-form-intent.json), [navigation race](../../.omx/artifacts/frontend/qa-browser/navigation-race-report.json). Browser scripts use `BASE_URL=http://127.0.0.1:3100` while `npm run start -- --hostname 127.0.0.1 --port 3100` is running.

The last full locale check ran after the form fix. Subsequent changes affected only the density switcher's accessible name and its no-JS hiding; build/typecheck, browser/axe/no-JS, and the eight form-submission scenarios were rerun afterward.

## Visual confirmation and independent review

Repo-local `design` and `frontend-design` skills were applied: the owner's choice was recorded as one component-and-token contract. `visual-ralph` was used in App-safe mode for the reference → screenshot → verdict → fix loop; no tmux command, active goal/runtime, or new aesthetic choice is claimed. `code-review` provided two independent passes with native code-reviewer and architect roles.

The approved [homepage A](../../.omx/artifacts/frontend/visual-concepts-02/a-home-en-desktop.png) and [compact catalog](../../.omx/artifacts/frontend/visual-selected-03/catalog-en-4-compact-desktop.png) were compared with real browser captures. Final desktop/mobile EN/LT and five-column frames were visually reviewed. At 1440 px: search x=25/width=770; sidebar=216; toolbar=58; grid top y=238; card=304.5×380.62; no card border, radius, or shadow.

Pixel diff is a supporting metric, not automatic approval: normalized homepage MAE 0.007017, catalog 0.115831. The catalog's main difference comes from real product composition/order (image region 0.173850); chrome is substantially closer: search/navigation 0.007195, sidebar 0.009349, toolbar 0.015874. Ranking was not replaced with a fixture to match the mockup; category names reflect real data.

Final [visual verdict](../../.omx/artifacts/visual-ralph/selected-hybrid/verdict-final.json): PASS, expert score 96/100, not a user-test result. Independent [review](../../.omx/artifacts/visual-ralph/selected-hybrid/final-review.md): code-reviewer APPROVE with no open findings; architect CLEAR after reproducing and eliminating the language race. The initial architecture BLOCK remains visible: 4/8 scenarios failed before the fix and 8/8 passed afterward; the architect separately confirmed 4/4 search/autosort scenarios.

## Limitations and boundaries

- The existing ranking still has one failing REGRESSION scenario: REGRESSION-012, `something for a wedding`, with 17 results instead of the maximum 12, precision 0.60, and recall 1.0. The overall gate passes, but this is not a 100% scenario pass rate. The ranker, data, and evaluation fixtures were unchanged in this iteration; blind sets were neither read nor used for tuning. Fixing ranking was outside the visual task.
- Live Gemini, Supabase, and analytics behavior, production deployment, field Core Web Vitals, physical devices, a real screen reader, and Windows High Contrast were not tested. Axe is not equivalent to WCAG certification.
- Existing synthetic-catalog photography was preserved. Choosing Acne/Rains as a direction neither grants permission to use third-party photographs nor means the owner approved the quality of the current mannequins.
- Public neutral stores, safe DTOs, fallback behavior, and the RLS contract were preserved; `/out` remains a preview with no merchant navigation. Public contact details, licensing, and affiliate integration remain separate release questions.
- No commit, merge to main, publication, or database migration was performed. Old visual artifacts remain as history. Implementation of the selected composition is complete; automated tests do not replace the owner's personal aesthetic judgment.
