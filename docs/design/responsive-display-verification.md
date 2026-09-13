# Weft — adaptation for large monitors and phones

12 September 2026 · branch `codex/weft-responsive-displays`.

## Outcome

The mismatch demonstrated by the owner on a 2K monitor has been fixed: photos stretched while text, search, and the filter panel retained the dimensions of the 1440 px layout. The selected A/B/C design is preserved. Four columns remain the default; the 3/4/5 control is still compact and remembers the selection.

Instead of fixed sizes, the interface uses a coordinated rem system: scaling grows smoothly from the 1440 baseline to 1.5× at 2560 CSS px, then caps. On ultrawide monitors, the workspace is capped at 2560 px and centered. This is genuine responsive layout, without CSS zoom or whole-page transform scaling. Phones retain a separate two-column layout and tablets a three-column layout; filters open in a panel. The homepage height also accounts for viewport height.

| Measurement | 1440 px | 2560 px |
| --- | --- | --- |
| Navigation | 15 px | 22.5 px |
| Item name | 14 px | 21 px |
| Price | 13 px | 19.5 px |
| Filter panel | 216 px | 324 px |
| Search, excluding outer margins | 770 px | 1155 px |
| Default columns | 4 | 4 |

On phones, item names are now 14 px, prices 13 px, and search fields at least 16 px. Colors, photos, catalog composition, ranking, URL filters, and per-page result count did not change. Favorites and 3D-preview styles use the same sizing system; those pages' logic did not change. Image-loading `sizes` hints are aligned with rem dimensions, em breakpoints, and the capped workspace: thumbnails receive sufficient resolution, while ultrawide screens do not trigger unbounded image growth.

## View

[Live local catalog](http://127.0.0.1:3100/search?gender=women&lang=lt) · [Homepage](http://127.0.0.1:3100/?lang=lt).

- [2K, before the fix](../../.omx/artifacts/frontend/responsive-display-baseline/screenshots/catalog-lt-women-2560.png) → [2K, after](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-2560.png).
- [2048 CSS px at DPR 1.25](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-2048-dpr125.png), [3840 CSS px](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-3840.png).
- [Phone catalog](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-390.png), [2K homepage](../../.omx/artifacts/frontend/responsive-display-final/screenshots/home-lt-2560.png), [homepage on a short phone viewport](../../.omx/artifacts/frontend/responsive-display-final/screenshots/home-lt-390x667.png).

The final screenshots of the 2K catalog, homepage, and mobile catalog were reviewed by the primary agent; the test agent additionally reviewed the DPR variant and short viewports. The first row of cards at 2560×1440 fits together with names and prices; the first card's price ends at approximately y=1222. At 3440/3840, the 2560-wide workspace is centered with 440/640 px margins.

## Verification

- New responsive regression: 7/7 groups PASS. Widths 320, 390, 430, 768, 1024, 1280, 1440, 1920, 2048, 2560, 3440, and 3840 px; additional short viewports 390×667, 1024×768, 1280×800, and 1440×650.
- Checks covered not only the absence of document overflow but also text/search/sidebar growth, pairwise non-overlap of header/toolbar elements, persistence of 3/4/5 after resize/reload, mobile filters, homepage content, and native grid operation without JavaScript.
- Existing selected-hybrid regression: 11/11 groups PASS, 24 EN/LT and light/dark axe scans with no violations, 0 browser errors.
- Full locale regression: 3,125 assertions PASS, 231 internal navigations, 14 routes, 0 browser errors. Additional immediate language switches before form submission: 8/8 PASS.
- `npm run build`, `npm run lint`, `npm run typecheck`, `git diff --check`: PASS. Lint in this project is TypeScript checking, not a separate ESLint audit.
- `npm run test:unit`: 56/56 PASS. `npm run test:integration`: 15/15 PASS.

Artifacts: [baseline measurements](../../.omx/artifacts/frontend/responsive-display-baseline/report.json), [intentional failing check of the old version](../../.omx/artifacts/frontend/responsive-display-before-report/report.json), [final responsive check](../../.omx/artifacts/frontend/responsive-display-final/report.json), [existing browser/axe regression](../../.omx/artifacts/frontend/responsive-display-regression/report.json), [locale](../../.omx/artifacts/frontend/responsive-display-final/locale-summary.json), [immediate form submission after language selection](../../.omx/artifacts/frontend/responsive-display-final/locale-form-intent.json).

After the full locale/unit/integration check, only image `sizes` attributes changed. Build/lint/typecheck, both browser regressions with fresh screenshots, axe, and the eight language-intent scenarios were then rerun; search/locale logic did not change.

Reproduction: with the production build running on port 3100, run `python scripts/responsive_display_e2e.py --mode final --base-url http://127.0.0.1:3100`. For the existing suite, run `python scripts/selected_hybrid_e2e.py --base-url http://127.0.0.1:3100 --artifacts .omx/artifacts/frontend/responsive-display-regression`.

## Changes and limitations

Changed `app/globals.css`, the density calculation in `components/search-controls.tsx`, and CSS blocks in `components/account-dashboard.tsx` and `components/ai-fitting-room.tsx`; added `scripts/responsive_display_e2e.py`. In addition, only image `sizes` were adjusted in those components, `app/page.tsx`, `app/stores/page.tsx`, `components/product-grid.tsx`, and `components/product-detail-view.tsx`. The contract was updated in DESIGN and the current AGENTS sections. Existing unrelated branch changes were preserved. There are no new dependencies, services, or routes.

The `design` and `frontend-design` skills helped preserve the selected composition and replace fixed dimensions with a coordinated responsive system instead of introducing a different theme. App-safe work and independent native test/review passes were used; tmux/goal runtime was not launched. The design skill's support template `.codex/templates/AGENTS.md` is absent; the active root AGENTS.md was used.

Independent [final review](../../.omx/artifacts/frontend/responsive-display/final-review.md): APPROVE, with no open findings. The image `sizes` finding was fixed; desktop thumbnails request a conservative maximum for 1.5× scaling, accounting for source-size rem using the initial rather than computed CSS font size. This was verified against the formula and standard; separate confirmation of the browser-selected file through `currentSrc` is not claimed.

Automation checks browser CSS dimensions and DPR, not physical screen diagonal or viewing distance. The enlarged root-font check is programmatic; genuine user browser zoom/OS scaling and a physical screen reader were not tested. The known pre-existing limitation in one ranking scenario from the [previous report](selected-hybrid-verification.md) was unchanged and not reassessed because this was a layout task. The local preview was left running; no commit, merge, or publication was performed.
