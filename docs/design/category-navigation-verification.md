# Category navigation: verified correction

12 September 2026. Branch `codex/weft-category-navigation`. Local implementation; no commit, merge, deployment, dependency or external-service change. Pre-existing worktree changes were preserved.

## Result

The header now says Catalog/Katalogas. The category row contains only specific categories: the repeated All clothing/Visi drabužiai shortcut is removed, leaving one generic content heading. The active category can still be removed through its chip or the sidebar's All categories option; global Catalog opens the unfiltered catalog.

Jeans/Džinsai is now a real `category=jeans` filter using exact `category=bottoms` and `subcategory=jeans` product data. Category navigation never writes, hides or clears search text. It preserves an existing shopper query, locale and other filters, and resets pagination. Blank category browsing therefore has an empty search field and no semantic-ranking explanation.

The `design` and `frontend-design` skills guided removal of the redundant navigation level and separation of browsing from typed search. The approved composition, custom controls, responsive scale, imagery and ranking algorithms remain unchanged. No CSS or new dependency was needed.

## Changed files and simplifications

- `components/category-nav.tsx`: remove the generic shortcut and special `denim` query mutations; use normal category links and shared translated labels.
- `components/site-header.tsx`, `lib/i18n.ts`: explicit global Catalog label and localized Jeans category; remove the obsolete special Denim label.
- `lib/mock-products.ts`: one exact category predicate shared by filtering/search eligibility, plus category-option discovery. Missing or inconsistent garment data does not qualify as Jeans.
- `app/search/page.tsx`: use the same category options for URL validation and sidebar rendering.
- `scripts/search-params.test.mjs`: regression coverage for garment identity, category availability, blank/search eligibility, query preservation and cache separation.
- `scripts/category_navigation_e2e.py`: five browser regression groups; existing browser suites have their affected navigation expectations updated.
- `DESIGN.md`, `components/AGENTS.md`, `app/search/AGENTS.md`: current navigation contract. Implementation plan: `.omx/artifacts/frontend/category-navigation/implementation-plan.md`.

No catalog records, merchant identity, public-store mapping or affiliate boundary changed. The exact fixture Jeans products are MOCK-005, MOCK-017 and MOCK-058; the broader bottoms category keeps its existing behavior.

## Fresh verification

Final production build served on port 3100. Optional Gemini/Supabase/PostHog credentials were blanked only in test-process environments; environment files were not edited.

- Production build, typecheck, lint, Python compilation and normal `git diff --check`: PASS. Here lint is TypeScript, not a separate ESLint pass.
- Unit tests: 60/60; HTTP integration smoke: 15/15.
- Category navigation: 5/5, zero browser errors. Covers EN/LT, blank and typed queries including literal `denim`, other filters, pagination reset, exact products, sidebar/chip agreement, no-JS links, sorting and density.
- Selected hybrid: 11/11; 24 Axe scans, zero reported violations.
- Responsive display: 7/7; catalog controls: 9/9.
- Same-task locale/form intent: 8/8.
- Full locale suite: 3,118 assertions, 230 clicked internal links, 14 routes, zero browser errors.
- Independent native code review: APPROVE, zero findings.

Reports: `.omx/artifacts/frontend/category-navigation-final/` and `.omx/artifacts/frontend/category-navigation-regression/`. Regression tests captured the old duplicate/injected-query behavior before implementation and pass on the final build.

## Inspected screenshots

Actual loaded browser captures, not mockups. Desktop 1440/2560 and phone 390 CSS-pixel views were inspected. Images were allowed to decode before capture.

- [2K catalog: corrected hierarchy](../../.omx/artifacts/frontend/category-navigation-final/screenshots/catalog-lt-2560.png)
- [2K Jeans: empty search](../../.omx/artifacts/frontend/category-navigation-final/screenshots/jeans-lt-2560.png)
- [Phone Jeans: empty search](../../.omx/artifacts/frontend/category-navigation-final/screenshots/jeans-lt-390.png)

The three Jeans results keep the selected four-column desktop geometry rather than stretching or inventing a fourth product. Phone layout remains two columns. Category navigation and the removable active chip have different actions; neither is the removed generic shortcut.

## Limits and handoff

Legacy `query=denim&category=bottoms` URLs are not silently rewritten: an explicit shopper query cannot be distinguished from an older shortcut URL. New Jeans links no longer inject that query. A manually entered `denim` query is deliberately retained.

No physical-device, screen-reader, OS-level zoom, live cloud or production verification was performed. Browser emulation and Axe do not establish blanket WCAG compliance or owner aesthetic acceptance. The unrelated earlier search REGRESSION-012 limitation remains untouched; full relevance/cloud evaluations were not rerun.

Stop condition met: implemented, regression-tested, visually inspected and independently reviewed. One local production preview remains at `http://127.0.0.1:3100/search?category=jeans&lang=lt`.
