# Regression evidence

Environment: local production server at `http://127.0.0.1:3300`, Next.js 16.3.5, headless Chromium/Playwright, deterministic local catalog fallback, no external credentials. Source commit at inspection: `6653894887dbc8794dcc927edfedb3bb0d631a85` (working tree intentionally retained user changes).

## Results

- `npm run typecheck`: PASS.
- `npm run build`: PASS; 82 static pages generated.
- `npm run test:unit`: PASS, 132 passed, 0 failed.
- `frontend-e2e-final/report.json`: 21 PASS, 0 FAIL, 3 NOT RUN (scope-limited live/physical-device cases).
- `category-navigation-final/report.json`: 5 PASS, 0 FAIL.
- `catalog-controls-final3/report.json`: 9 PASS, 0 FAIL.
- `regression-prod/report.json`: 6 PASS, 0 FAIL (search, PDP matrix, filters, category state, Saved/menu, locale).
- `locale-prod/report.json`: PASS; 15 routes, 237 internal links, 3,230 recorded assertions, 0 browser errors, including 700 zero-delay atomic switches.
- `fitting-room-prod/report.json`: PASS; WebGL render, garment change, knitwear render, measurement change, keyboard rotation, reduced motion.

## Visual evidence

- Comparable hero/search/PDP frames: `before/` and `after/`.
- Final production capture manifest: `results/capture-after.json`.
- Filters: `results/regression-prod/screenshots/filters-open-en-390.png` and `filters-open-lt-320.png`.
- Menu: `results/regression-prod/screenshots/mobile-menu-open-en-390.png` and `mobile-menu-closed-en-390.png`.
- Saved content/empty: `saved-content-en-390.png`, `saved-empty-en-390.png`.
- PDP: `pdp-shirt-en-360.png`, `pdp-shirt-en-1440.png`, `pdp-skirt-lt-390.png`.
- 3D: `results/fitting-room-prod/initial-en-desktop.png`, `adjusted-en-desktop.png`, `knitwear-en-desktop.png`, `reduced-motion-lt-mobile.png`.

The before/after PNGs and the added final frames were opened and visually inspected. No new document-level overflow, clipped fact text, or incoherent overlay was observed in the checked states.

