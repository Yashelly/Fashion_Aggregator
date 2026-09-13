# Viewport fit and catalog breathing room

Owner correction, 13 September 2026. Reference: the owner's browser100%/90% product screenshots and focus/over-tall hero screenshots. The90% reference informs side spacing, not a request to scale typography or zoom the page. No palette, photography, search or catalog-data changes.

## Changes

- Shared CSS `--collection-width:92%`: centered home collection and search containers,4% each side within the existing2560px storefront cap. Mobile side fields are0.75rem. Readable rem scaling and 3/4/5 density logic remain; the grid's ResizeObserver accounts for the narrower available width.
- Search focus uses an inset2px underline, not an enclosing rectangle. Input labels/caret remain; submit/clear retain visible keyboard outlines. Forced-colors uses a real bottom border because box-shadow is not guaranteed there.
- `.campaign-frame` holds photo, scrim and copy together, with width `min(100%, (100svh - --home-header-h) * 2508 / 1412)`. The home header uses the same height token. `svh` represents browser content space, not screen hardware height. Preserve the entire image rather than cropping heads/shoes or stretching it. Wide/short windows necessarily leave theme-canvas side space; a fixed-ratio image cannot simultaneously fill both arbitrary dimensions without cropping/distortion.
- Copy scales with frame width (`cqw`); its scrim ends before the people. On very short desktop windows (height≤32em), copy flows below the whole photo; scrolling to that text is intentional accessibility/reflow behavior. Phones keep the approved4:5 image and flowing copy.
- Corrected the prior screenshot helper, which enlarged browser height until the whole campaign fit and therefore concealed this regression. Screenshots now preserve the actual viewport.

## Evidence

Run a production build/server, then:

```sh
python scripts/layout_spacing_e2e.py --base-url http://127.0.0.1:3115
python scripts/home_hero_e2e.py --base-url http://127.0.0.1:3115
python scripts/responsive_display_e2e.py --base-url http://127.0.0.1:3115 --mode final
```

`layout_spacing_e2e.py --baseline` captured the unmodified build before edits. Original matrix: 2560×1294, 2506×1294, 1920×940, 1440×760, 1024×650, 390×744, 320×640, home and catalog. Final matrix adds 2560×500 and 1440×400 plus LT at 1440/2560×512/513, and keyboard/forced-colors checks. This directly models reduced browser-content height instead of using 2560×1440 as though browser chrome did not exist. Screenshot names include width, height and locale to preserve every variant.

Before/after screenshots and geometry: `.omx/artifacts/frontend/layout-spacing/`. Existing hero suite also covers EN/LT, source changes at700/701, no-JS search, blocked photos, mobile menu keyboard, DPR2, root font125%, dark mode and axe serious/critical checks. Responsive suite checks density restoration and readable scale through3840px. All artifact paths are relative to the isolated implementation worktree.

## Results

- Production build and TypeScript passed; all 84 unit tests passed.
- Integration smoke: 15/15. Full EN/LT browser regression: 3,112 assertions across 14 routes, 229 internal links clicked, no browser errors.
- Layout: 26/26 page/viewport cases, keyboard and forced-colors focus checks passed; no browser errors.
- Hero: 8/8 scenarios passed. Responsive display: 7/7 scenarios passed, including 3/4/5 density restoration, 125% root font, no-JS and DPR checks.
- Visually inspected final 2560×1294 home, catalog and home collection, plus the 390×744 phone screenshot. Full desktop photo and CTA are visible; product grids have side space without shrinking their typography.
- Independent code review: APPROVE, zero remaining issues. Architecture review: no structural blocker; continue testing actual header geometry if navigation content or typography changes, since viewport fitting shares its minimum-height token rather than measuring the header in JavaScript.

## Boundaries

No CSS zoom, transforms, device/DPR heuristics, new dependencies or new images. Browser-chrome height is represented by the actual content viewport; the page does not inspect browser UI or require fullscreen mode. Screenshots are browser-emulated desktop/phone sizes, not physical-device coverage. The whole photograph fits a normal desktop viewport; extremely short windows and mobile may scroll through flowing copy. User approval of the precise new visual balance remains separate from functional tests. Owner merges the separate PR in main.
