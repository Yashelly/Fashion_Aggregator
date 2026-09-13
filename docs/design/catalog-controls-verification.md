# Catalog controls: verified correction

12 September 2026. Branch `codex/weft-catalog-controls`. Local implementation; no commit, merge, deployment, dependency or external-service change. Existing unrelated worktree changes were preserved.

## Result

The owner's screenshots rejected operating-system dropdown boxes, blue option menus and the repeated Category label. Every catalog select is removed: category/department/colour/availability now expose native radio choices directly inside their accordion. Stores retain multi-choice checkboxes; price remains labelled input fields. Sorting and3/4/5 density share a restrained site-styled disclosure. Per-page20/50/100 was already text links and remains unchanged.

`design` and `frontend-design` guided the shared white/ink controls, quiet closed toolbar and single visible filter heading. The approved A home/search, B product grid, C-like sidebar and relative monitor/phone scaling are unchanged. Root `DESIGN.md` removes the old native-select recommendation instead of retaining conflicting directions.

## Changed files and simplifications

- `components/option-picker.tsx`: shared native details/summary and ordinary choice buttons; keyboard navigation, selected check, disabled options, outside/blur/resize dismissal and focus restoration. No simulated combobox or new package.
- `components/search-controls.tsx`: radio rows replace nested selects; sort choices are named submit buttons; density remains browser-local. Enhanced filter button is separate from the truthful native disclosure/GET fallback used without JavaScript or Dialog API support.
- `components/search-form.tsx`: serializes the real submitter and preserves synchronous locale intent; obsolete select-only auto-submit logic removed.
- `app/globals.css`: integrated text disclosures and bounded option panels, readable radio rows, focus/hover states and hidden-trigger handling; obsolete select-specific rules removed.
- `scripts/catalog_controls_e2e.py`: new focused regression suite. Existing selected-hybrid, responsive-display, locale, locale-form-intent and frontend scripts were adapted to the actual new controls; label clicks and keyboard interaction replace native-select actions. Locale-intent report output is configurable.
- `DESIGN.md`, `components/AGENTS.md`, `app/AGENTS.md`, `app/search/AGENTS.md`: current control contract and native fallback semantics.

No search ranking, product/store data, URL filter contract, affiliate boundary or external destination changed.

## Fresh verification

All results below refer to the final production build, served locally on port3100 with optional Gemini/Supabase/PostHog credentials blanked for the test process. Environment files were not edited.

- Production build, TypeScript/lint and normal `git diff --check`: PASS. This repository's lint command is TypeScript, not a separate ESLint pass.
- Unit tests:56/56. HTTP integration smoke:15/15.
- Focused controls:9/9, zero browser errors. Covers all radio groups, actual label/keyboard selection, density persistence, sort submitter, every sort value, no-JS GET, missing Dialog API, dark and emulated forced colours. Longest LT sort with an active-filter count fits at320px.
- Selected-hybrid regressions:11/11;24 Axe scans, zero reported violations and zero browser errors.
- Responsive-display regressions:7/7, including320–3840 CSS px, scaled type/sidebar/controls,3/4/5 preference, DPR and relative-font checks.
- Locale suite:3,125 assertions,231 clicked internal links,14 routes, zero browser errors.
- Same-task language switch plus form submission:8/8.
- Independent native code review: PASS. Three findings were repaired and re-reviewed: null-target blur dismissal, contradictory no-JS expanded state, and swallowed unexpected dialog failures. Compatibility fallback and normal modal behavior have separate regression coverage.

Baseline evidence records14 rejected native selects; final DOM count is0. Reports are in `.omx/artifacts/frontend/catalog-controls-final/` and `.omx/artifacts/frontend/catalog-controls-regression/{selected-hybrid,responsive-display}/`.

## Inspected visual evidence

Actual browser captures, not mockups. Capture waits for visible images to finish decoding after hydration/resizing; no test-only product order or delayed application behavior was introduced.

- [2K: expanded category](../../.omx/artifacts/frontend/catalog-controls-final/screenshots/category-only-lt-2560.png)
- [2K: open sorting](../../.omx/artifacts/frontend/catalog-controls-final/screenshots/sort-open-lt-2560.png)
- [Phone: expanded category](../../.omx/artifacts/frontend/catalog-controls-final/screenshots/category-only-lt-390.png)
- [320px: longest sorting label with active filter](../../.omx/artifacts/frontend/catalog-controls-final/screenshots/sort-sale-active-filter-lt-320.png)
- [Keyboard/open density](../../.omx/artifacts/frontend/catalog-controls-final/screenshots/density-picker-open-en-1440.png)
- [Dark/open controls](../../.omx/artifacts/frontend/catalog-controls-final/screenshots/controls-lt-dark-1440.png)
- [Emulated forced colours](../../.omx/artifacts/frontend/catalog-controls-final/screenshots/category-lt-forced-colors-390.png)

Visual review confirms the system-blue popup and doubled heading are absent, toolbar controls share a restrained baseline, open panels stay in the viewport, and phone filter actions remain reachable. Owner aesthetic acceptance is separate from this implementation verdict.

## Remaining limits

No physical-device, OS-level High Contrast or screen-reader pass; browser emulation and Axe are not blanket WCAG certification. No live external-service or production verification. The earlier unrelated search REGRESSION-012 limitation was not changed or retuned in this control-only task. Existing photography and catalogue order remain as supplied.

Stop condition met: implemented, tested, visually inspected and independently reviewed. One local production preview is left available at `http://127.0.0.1:3100/search?lang=lt`.
