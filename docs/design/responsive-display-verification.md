# Weft — [removed] [removed] [removed] [removed] [removed] [removed]

12 [removed] 2026 · [removed] `codex/weft-responsive-displays`.

## [removed]

[removed] [removed], [removed] [removed] [removed] 2K-[removed]: [removed] [removed], [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] 1440 px. [removed] [removed] A/B/C [removed]. [removed] [removed] [removed] [removed]; [removed] 3/4/5 [removed]-[removed] [removed] [removed] [removed] [removed].

[removed] [removed] [removed] [removed] [removed] [removed] [removed] rem: [removed] [removed] [removed] [removed] [removed] [removed] 1440 [removed] 1,5× [removed] 2560 CSS px, [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed] 2560 px [removed] [removed]. [removed] [removed] [removed] [removed], [removed] CSS zoom [removed] [removed] [removed] [removed] [removed] transform. [removed] [removed] [removed] [removed] [removed] [removed] [removed], [removed] — [removed] [removed]; [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed].

| [removed] | 1440 px | 2560 px |
| --- | --- | --- |
| [removed] | 15 px | 22,5 px |
| [removed] [removed] | 14 px | 21 px |
| [removed] | 13 px | 19,5 px |
| [removed] [removed] | 216 px | 324 px |
| [removed], [removed] [removed] [removed] | 770 px | 1155 px |
| [removed] [removed] [removed] | 4 | 4 |

[removed] [removed] [removed] [removed] [removed] 14 px, [removed] — 13 px, [removed] [removed] — [removed] [removed] 16 px. [removed], [removed], [removed] [removed], [removed], URL-[removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] 3D-[removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed]. [removed] `sizes` [removed] [removed] [removed] [removed] [removed] rem-[removed], em-[removed] [removed] [removed] [removed] [removed]: [removed] [removed] [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed].

## [removed]

[[removed] [removed] [removed]](http://127.0.0.1:3100/search?gender=women&lang=lt) · [[removed]](http://127.0.0.1:3100/?lang=lt).

- [2K, [removed] [removed]](../../.omx/artifacts/frontend/responsive-display-baseline/screenshots/catalog-lt-women-2560.png) → [2K, [removed]](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-2560.png).
- [2048 CSS px [removed] DPR 1,25](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-2048-dpr125.png), [3840 CSS px](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-3840.png).
- [[removed] [removed] [removed]](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-390.png), [[removed] [removed] 2K](../../.omx/artifacts/frontend/responsive-display-final/screenshots/home-lt-2560.png), [[removed] [removed] [removed] [removed] [removed]](../../.omx/artifacts/frontend/responsive-display-final/screenshots/home-lt-390x667.png).

[removed] [removed] 2K-[removed], [removed] [removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] DPR-[removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] 2560×1440 [removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed] y≈1222. [removed] 3440/3840 [removed] [removed] [removed] 2560 [removed] [removed] [removed] 440/640 px.

## [removed]

- [removed] responsive-[removed]: 7/7 [removed] PASS. [removed] 320, 390, 430, 768, 1024, 1280, 1440, 1920, 2048, 2560, 3440, 3840 px; [removed] [removed] [removed] 390×667, 1024×768, 1280×800, 1440×650.
- [removed] [removed] [removed] [removed] [removed] [removed], [removed] [removed] [removed] [removed]/[removed]/sidebar, [removed] [removed] [removed] [removed] header/toolbar, [removed] 3/4/5 [removed] resize/reload, [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed] [removed] JavaScript.
- [removed] selected-hybrid [removed]: 11/11 [removed] PASS, 24 axe-[removed] EN/LT [removed] light/dark [removed] [removed], 0 [removed] [removed].
- [removed] locale-[removed]: 3125 assertions PASS, 231 [removed] [removed], 14 [removed], 0 [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed]: 8/8 PASS.
- `npm run build`, `npm run lint`, `npm run typecheck`, `git diff --check`: PASS. Lint [removed] [removed] [removed] — TypeScript, [removed] [removed] ESLint-[removed].
- `npm run test:unit`: 56/56 PASS. `npm run test:integration`: 15/15 PASS.

[removed]: [[removed] [removed]](../../.omx/artifacts/frontend/responsive-display-baseline/report.json), [[removed] [removed] [removed] [removed] [removed]](../../.omx/artifacts/frontend/responsive-display-before-report/report.json), [[removed] responsive-[removed]](../../.omx/artifacts/frontend/responsive-display-final/report.json), [[removed] browser/axe-[removed]](../../.omx/artifacts/frontend/responsive-display-regression/report.json), [locale](../../.omx/artifacts/frontend/responsive-display-final/locale-summary.json), [[removed] [removed] [removed] [removed] [removed] [removed]](../../.omx/artifacts/frontend/responsive-display-final/locale-form-intent.json).

[removed] [removed] locale/unit/integration-[removed] [removed] [removed] [removed] `sizes` [removed]. [removed] [removed] [removed] build/lint/typecheck, [removed] browser-[removed] [removed] [removed] [removed], axe [removed] 8 [removed] [removed] [removed]; [removed] [removed]/[removed] [removed] [removed].

[removed]: [removed] [removed] production-[removed] [removed] 3100 [removed] `python scripts/responsive_display_e2e.py --mode final --base-url http://127.0.0.1:3100`. [removed] [removed] [removed] — `python scripts/selected_hybrid_e2e.py --base-url http://127.0.0.1:3100 --artifacts .omx/artifacts/frontend/responsive-display-regression`.

## [removed] [removed] [removed]

[removed] `app/globals.css`, [removed] [removed] [removed] `components/search-controls.tsx`, CSS-[removed] [removed] `components/account-dashboard.tsx` [removed] `components/ai-fitting-room.tsx`; [removed] `scripts/responsive_display_e2e.py`. [removed] [removed] [removed] image `sizes` [removed] [removed] [removed], `app/page.tsx`, `app/stores/page.tsx`, `components/product-grid.tsx` [removed] `components/product-detail-view.tsx`. [removed] [removed] [removed] DESIGN [removed] [removed] [removed] AGENTS. [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed], [removed] [removed] [removed] [removed].

[removed] `design` [removed] `frontend-design` [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed], [removed] [removed] [removed] [removed] [removed]. [removed] App-safe [removed] [removed] [removed] [removed] [removed]/[removed]-[removed]; tmux/goal-runtime [removed] [removed]. [removed] design [removed] [removed] [removed] `.codex/templates/AGENTS.md`; [removed] [removed] [removed] AGENTS.md.

[removed] [[removed] [removed]](../../.omx/artifacts/frontend/responsive-display/final-review.md): APPROVE, [removed] [removed] [removed]. [removed] [removed] [removed] image `sizes` [removed]; [removed] [removed] [removed] [removed] [removed] [removed] [removed] 1,5× [removed] [removed] [removed], [removed] source-size rem [removed] [removed], [removed] [removed] [removed] CSS-[removed]. [removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed] [removed] `currentSrc` [removed] [removed].

[removed] [removed] [removed] CSS-[removed] [removed] DPR, [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] root-[removed] [removed]; [removed] [removed] browser zoom/OS scaling [removed] [removed] screen reader [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed] [[removed] [removed]](selected-hybrid-verification.md) [removed] [removed] [removed] [removed] [removed] [removed] — [removed] [removed] [removed]. [removed] preview [removed] [removed]; commit, merge [removed] [removed] [removed] [removed].
