# Weft — [removed] [removed]: [removed] [removed] [removed]

12 [removed] 2026 · `codex/weft-frontend-redesign` · [removed] [removed] [removed].

[removed] [removed]: [removed] A, [removed] [removed] A, [removed] B, [removed] [removed] [removed] [removed] C. [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed]; [removed] cream/serif [removed] cold-studio [removed] [removed]. [removed] [removed] — [DESIGN.md](../../DESIGN.md). [removed] [removed] [removed] [removed] [removed] [removed] handoff/revision-[removed], [removed] [removed] [removed] [removed].

## [removed]

[removed] [removed] [removed] production-preview: [[removed]](http://127.0.0.1:3100/?lang=en), [[removed]](http://127.0.0.1:3100/search?lang=en). [removed] [removed] [removed] [removed] [removed].

| [removed] | Desktop | Mobile |
| --- | --- | --- |
| [removed] EN | [[removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-en-desktop.png) | [[removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-en-390.png) |
| [removed] LT | [[removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-lt-1440.png) | [[removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-lt-390.png) |
| [removed] EN | [4 [removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-4-desktop.png) | [2 [removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-mobile-390.png) |
| [removed] LT | [[removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/browse-lt-1440.png) | [[removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/browse-lt-390.png) |

[removed]: [3 [removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-3-desktop.png), [5 [removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-5-desktop.png), [[removed] [removed]](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-sidebar-hidden-desktop.png). [removed] [removed] screenshots [removed] [removed] [removed] [removed] black, [removed] [removed] [removed] [removed] [removed] EN/LT [removed] desktop/mobile.

## [removed] [removed]

- [removed]: [removed] [removed] [removed] [removed] MOCK-011, [removed] [removed] [removed] [removed] [removed], [removed] [removed]/[removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed].
- [removed]: 4 [removed] [removed] [removed], [removed] 4:5, [removed] [removed] 2 px, [removed] [removed] [removed]/[removed]/[removed]. [removed] [removed] [removed] [removed], [removed] [removed] [removed] [removed] [removed].
- [removed] [removed] [removed] 216 px [removed] [removed]. [removed] [removed] [removed]; Cancel/Escape/[removed] [removed] [removed] [removed] [removed].
- [removed] [removed] [removed] — [removed] [removed] `View: 4` [removed] [removed] [removed]. 3/4/5 [removed] [removed] [removed] [removed] [removed] URL, [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed], [removed] [removed] [removed]; desktop-[removed] [removed].
- [removed], [removed] [removed] [removed] [removed] [removed] GET-[removed] [removed] JavaScript; [removed] [removed] JS [removed] [removed] [removed] [removed] [removed] [removed]. [removed] localStorage [removed] [removed] [removed].
- [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed], [removed], [removed] [removed] [removed] [removed]. [removed] [removed] [removed] 3D-preview [removed] [removed], [removed] [removed] [removed] [removed] [removed].
- [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]: URL, [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed].

[removed] [removed] [removed]: `app/page.tsx`, `app/search/page.tsx`, `app/layout.tsx`, `app/globals.css`; [removed] `site-header`, `site-footer`, `search-input`, `search-controls`, `search-form`, `locale-provider`, `product-grid`, `product-detail-view`; [removed] `category-nav` [removed] `theme-toggle`; `lib/i18n.ts`, `lib/use-client-locale.ts`. [removed]: `scripts/selected_hybrid_e2e.py`, `scripts/locale_form_intent_e2e.py`. [removed] DESIGN/CLAUDE [removed] [removed] [removed] [removed] app/components AGENTS. [removed] [removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed] [removed] [removed] dirty worktree.

[removed]: [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]; Syne [removed] [removed] [removed] wordmark, [removed] [removed] [removed] Arial/Helvetica; [removed] select/dialog/form [removed] [removed] [removed] URL [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed].

## [removed]

[removed] [removed] [removed] production-[removed] [removed] [removed], [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed]; `.env.local` [removed] [removed].

| [removed] | [removed] |
| --- | --- |
| `npm run build` | PASS, 81 [removed] |
| `npm run lint`, `npm run typecheck` | PASS; [removed] [removed] [removed] TypeScript, [removed] ESLint-[removed] [removed] [removed] |
| `git -c core.safecrlf=false diff --check` | PASS |
| `npm run test:unit` | 56/56 PASS |
| `npm run test:integration` | 15/15 PASS |
| `npm run test:locale` | 3 125 assertions PASS, 14 [removed], 231 [removed], 0 [removed] [removed] |
| `python scripts/locale_form_intent_e2e.py` | 8/8 PASS: home/search/sort/filters, [removed] [removed] EN/LT |
| `python scripts/navigation_race_e2e.py` | 3/3 PASS: [removed] [removed] [removed] [removed] [removed] [removed] |
| `python scripts/selected_hybrid_e2e.py` | 11/11 [removed] PASS; 24 axe-[removed] [removed] [removed]; 0 [removed] [removed] |
| `npm run test:search` — [removed] DEV/REGRESSION | [removed] gate PASS; DEV 44/44, REGRESSION 47/48 — [removed] [removed] |

[removed] responsive: 320/360/390/430/768/1280/1440/1920 px, [removed] [removed] [removed] [removed]. [removed] EN/LT, [removed]/[removed] [removed], [removed] [removed] Escape [removed] [removed], Apply/Cancel/reset, multi-store, [removed], [removed] sidebar, [removed] [removed] [removed] [removed], [removed] JS [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed] hero [removed] [removed] [removed] [removed] [removed] [removed].

[removed] [removed]: [browser/visual/axe report](../../.omx/artifacts/frontend/selected-hybrid-qa/report.json), [locale summary](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-summary.json), [locale-form red](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-form-intent-before.json), [locale-form green](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-form-intent.json), [navigation race](../../.omx/artifacts/frontend/qa-browser/navigation-race-report.json). [removed] [removed] [removed] [removed] `BASE_URL=http://127.0.0.1:3100` [removed] [removed] `npm run start -- --hostname 127.0.0.1 --port 3100`.

[removed] [removed] locale-[removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] JS; [removed] [removed] [removed] build/typecheck, browser/axe/no-JS [removed] 8 [removed] [removed] [removed].

## [removed] [removed] [removed] [removed] [removed]

[removed] repo-local [removed] `design` [removed] `frontend-design`: [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]. `visual-ralph` [removed] [removed] App-safe [removed] [removed] [removed] [removed] → [removed] → [removed] → [removed]; [removed] [removed] [removed] tmux-[removed], [removed] goal/runtime [removed] [removed] [removed] [removed]. `code-review` [removed] [removed] [removed] [removed] [removed] [removed] [removed] code-reviewer [removed] architect.

[removed] [removed] [[removed] A](../../.omx/artifacts/frontend/visual-concepts-02/a-home-en-desktop.png) [removed] [[removed] [removed]](../../.omx/artifacts/frontend/visual-selected-03/catalog-en-4-compact-desktop.png) [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed], [removed] desktop/mobile EN/LT [removed] 5 [removed]. [removed] 1440 px: [removed] x=25/[removed]770; sidebar216; toolbar58; [removed] [removed] y=238; [removed]304.5×380.62; [removed] [removed], [removed] [removed] [removed] [removed].

Pixel-diff — [removed] [removed], [removed] [removed] [removed]: [removed] MAE [removed] 0.007017, [removed] 0.115831. [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]/[removed] [removed] ([removed] [removed] 0.173850); chrome [removed] [removed]: [removed]/[removed]0.007195, sidebar0.009349, toolbar0.015874. [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed].

[removed] [[removed] [removed]](../../.omx/artifacts/visual-ralph/selected-hybrid/verdict-final.json): PASS, [removed] [removed]96/100, [removed] [removed] [removed] [removed]. [removed] [[removed]](../../.omx/artifacts/visual-ralph/selected-hybrid/final-review.md): code-reviewer APPROVE [removed] [removed] [removed]; architect CLEAR [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] BLOCK [removed] [removed]: [removed] [removed] 4/8 [removed] [removed], [removed] 8/8 [removed]; [removed] [removed] [removed] 4/4 [removed]/[removed].

## [removed] [removed] [removed]

- [removed] [removed] [removed] [removed] [removed] [removed] REGRESSION-[removed]: REGRESSION-012, `something for a wedding`, 17 [removed] [removed] [removed]12, precision0.60/recall1.0. [removed] gate [removed], [removed] [removed] [removed] 100% [removed]. Ranker, [removed] [removed] eval-fixtures [removed] [removed] [removed] [removed]; blind-[removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed].
- [removed] [removed] [removed] Gemini/Supabase/[removed], production-deployment, [removed] Core Web Vitals, [removed] [removed], [removed] screen reader [removed] Windows High Contrast. Axe [removed] [removed] [removed] WCAG.
- [removed] [removed] [removed] [removed] [removed]. [removed] Acne/Rains [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed].
- [removed] [removed] [removed] [removed], [removed] DTO, fallback [removed] RLS-[removed]; `/out` [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed], [removed] [removed] affiliate-[removed] [removed] [removed] release-[removed].
- Commit, merge [removed] main, [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed].
