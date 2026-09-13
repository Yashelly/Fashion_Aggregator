# Responsive street homepage — 13 September 2026

## Scope and decisions

Owner-approved image: the refined Gemini two-person photograph, master2508×1412. Implemented on branch `codex/weft-responsive-street-hero`; the pre-existing dirty worktree was preserved. No commit, merge or public deployment was performed.

The frontend-design/design pass retained the existing white/ink tokens, Arial/Helvetica utility type, Syne wordmark and left-aligned copy. The photograph is the focal element, not a new card system. Desktop text occupies only the empty street left of the figures, with a local contrast scrim. The original floating header would cover the heads near the top edge, so header/search is now in normal flow above the photo. Phones use a dedicated4:5 crop followed by theme-aware text and CTA; neither UI nor copy covers people. Short screens scroll instead of cropping the photo.

## Implementation

- `app/page.tsx`: native responsive picture, reserved dimensions, high-priority image, unchanged locale-aware CTA and lower product grid. Removes MOCK-011 lookup, linked product inset and their imports; the campaign no longer implies a product/price association.
- `app/globals.css`: removes1.7× magnification and viewport crop, preserves desktop landscape, implements4:5 phone media with flowing copy, keeps shared UI scale and2560px cap.
- `scripts/prepare-home-hero.cjs`: deterministic WebP exports from an explicit approved master; rejects a wrong master size and refuses overwrites. No additional dependency or image generation was used during website integration.
- `scripts/home_hero_e2e.py`: dedicated production-browser checks and screenshots; older homepage assertions in the selected-hybrid/responsive suites now reflect the approved replacement. Catalog pixel reference and all non-home tests remain.

Delivery assets:

| Source family | Dimensions | Bytes |
| --- | --- | ---: |
| desktop1280 | 1280×721 | 185816 |
| desktop1920 | 1920×1081 | 311030 |
| desktop2508 | 2508×1412 | 423854 |
| mobile640 | 640×800 | 83762 |
| mobile960 | 960×1200 | 139246 |
| mobile1128 | 1128×1410 | 171240 |

The mobile crop is x840/y0/1128×1410 from the approved2508×1412 master. Desktop is uncropped. Only these six WebPs were added to public assets; the large PNG master and refinement artifacts remain private. Both heads and all footwear were visually inspected in the crop and rendered page.

## Fresh verification

- Production build: PASS (81 generated pages). The first sandboxed attempt could not fetch the existing Google-hosted Syne font; the network-enabled retry passed without changing font configuration.
- Typecheck/lint (`tsc --noEmit`): PASS.
- Unit tests:60/60 PASS.
- HTTP integration:15/15 PASS.
- Dedicated hero:8/8 PASS — source/layout matrix320–3840px,700/701 same-page breakpoint switch, EN/LT CTA/search, keyboard menu/Escape, no-JS search, blocked-image fallback, DPR2,125% root font, asset budgets and screenshots.
- Responsive storefront:7/7 PASS.
- Selected-hybrid regression:11/11 PASS, including24 axe scans of five routes/filter dialog in EN/LT and light/dark with no serious/critical findings.
- Locale regression:3112 assertions,14 routes,229 clicked internal links,0 browser errors.
- Independent bounded code review: APPROVE, no actionable findings.
- Git whitespace check: PASS; existing repository LF/CRLF notices are not changed-line whitespace errors.

Evidence folders (private, not shipped):

- `.omx/artifacts/frontend/home-hero-final/`: final hero report and focused screenshots.
- `.omx/artifacts/frontend/home-hero-responsive/`: responsive report/screenshots.
- `.omx/artifacts/frontend/home-hero-hybrid/`: regression report, screenshots and axe evidence.
- `.omx/artifacts/frontend/home-hero-qa/locale-summary.json`: full locale report.

## Limits

Browser QA is local Chromium, including emulated widths, DPR and theme; it is not physical iPhone/Android or screen-reader certification. Axe does not establish full WCAG compliance or photo-background text contrast; the rendered desktop copy area was visually reviewed. Actual network field LCP was not measured. The photo remains AI-generated/retouched, not a live catalog product photograph. A local preview remains on `http://127.0.0.1:3100`; no external release is implied.
