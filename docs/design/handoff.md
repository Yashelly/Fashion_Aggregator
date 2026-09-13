# Weft — frontend handoff

Latest fix: [adaptation for 2K, ultrawide screens, and phones](responsive-display-verification.md). The selected composition is preserved, with fixed dimensions replaced by coordinated responsive scaling.

Current handoff: [implemented A/B/C hybrid and final verification](selected-hybrid-verification.md). The owner selected homepage and search A, catalog B, left filters C, and a compact 3/4/5-column choice. The initial implementation history remains below; both cream/serif and the later cold-studio revision were rejected and are not the current design.

12 September 2026 · branch `codex/weft-frontend-redesign`. Changes are local, with no commit, merge to main, deployment, new paid service, or database migration.

## Outcome

Direction A was selected: warm background, dark typography, restrained terracotta accent, and clothing rather than a decorative AI hero. The homepage immediately exposes the query, submit action, examples, and real catalog imagery. Results keep search, budget, stores, sorting, and reset together; the first product row begins around y=379 on desktop instead of the original y≈873. On mobile, search stays at the top and filters open in a bottom panel with separate Apply/Cancel actions.

Cards show factual details and open product details. Back preserves query/filter/sort, and favorites persist in the browser. EN/LT switches without losing conditions, including the immediately following navigation. Information pages are aligned; Privacy describes actual data rather than a nonfunctional contact form. 3D shows the existing approximate mannequin instead of SOON, without promising AI try-on or accurate fit.

## View the result

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Homepage EN | [capture](../../.omx/artifacts/frontend/final/home-en-desktop.png) | [capture](../../.omx/artifacts/frontend/final/home-en-mobile.png) |
| Results LT | [capture](../../.omx/artifacts/frontend/final/results-lt-desktop.png) | [capture](../../.omx/artifacts/frontend/final/results-lt-mobile.png) |
| Details EN | [capture](../../.omx/artifacts/frontend/final/details-en-desktop.png) | [capture](../../.omx/artifacts/frontend/final/details-en-mobile.png) |

Initial and final captures are separated under `.omx/artifacts/frontend/baseline`, `pass-1`, `pass-2`, and `final`. Additional pages are under `secondary`; controlled errors/dialogs/narrow screens are under `qa-browser/screenshots`. Heavy artifacts remain outside Git under the existing ignore policy.

## Decisions and sources

- [Audit](audit.md): initial problems, data boundaries, baseline.
- [Research A](research-a.md) and [B](research-b.md): 20 live sites, 80 primary desktop/mobile captures, and additional walkthroughs. Unavailable actions and partial checks are explicit; AI claims are separated from live browser confirmation.
- [Three directions](directions-and-decisions.md): identical products, 12 rendered frames, three desktop/mobile control schemes, expert rubric A93/B86/C76. This is not a user A/B study.
- [Five palettes](palettes.md): complete semantic tokens and verified contrast. Linen/rust was selected so clothing remains the most colorful element.
- [Skills and tools](skills-research.md): 13 candidates → seven shortlisted → three verified and installed skills. OMX 0.21.5, its design process, notepad checkpoint, and typed native subagents were actually used. No OMC command was available or falsely claimed.
- [DESIGN.md](../../DESIGN.md) is the active contract; [EN/LT and release](copy-and-release.md) covers vocabulary, privacy, infrastructure, and post-release hypotheses.

Adapted research patterns: clothing in the first viewport; compact search as the primary entry; URL-backed chips; explicitly applied filters; separate saving; accessible numeric sorting. No third-party logos, reviews, images, or scale claims were copied into the application.

## Code changes

- `app/page.tsx`, `app/search/page.tsx`, `app/globals.css`: unified storefront, new hero, compact results, responsive and light/dark tokens. Removed unused cinematic hero/filter wrappers and hidden route-loading HTML styling; recovery remains possible from the source Git commit.
- `search-form`, `search-input`, `search-controls`: native GET without JavaScript, genuine navigation indication, budget/multiple stores, draft/apply/cancel, focus retention, and preservation of an edited query when a late response arrives.
- `lib/search-params.ts`, `lib/search-cache-key.ts`: validation and intersection of manual conditions; cache key includes the input catalog. Semantic/hybrid ranking was not retuned.
- `lib/public-product.ts`, `product-detail-view`, `product-image`: public allowlist DTO, safe returnTo, real optional fields, gallery, and honest image/price fallbacks.
- `locale-provider`, `site-header`, `proxy.ts`: server language, cookie/prefetch/RSC boundaries, and synchronous intent on language change.
- `lib/saved-items.ts`, `wishlist-button`, `account-dashboard`: real local persistence, cross-tab events, and blocked-storage handling. Old preference data was not deleted.
- `fitting-room-avatar`: enabled the existing mannequin geometry and removed the SOON/font-loader path; measurements, garment, color, and rotation controls work locally. Three.js was not added.

The only new development package is `axe-core@4.13.0`. Existing vulnerabilities were fixed: Next 16.2.12 → 16.3.5, sharp 0.35.3 → 0.35.4, and baseline-browser-mapping 2.11.22. `package-lock.json` is aligned and `npm audit` reports 0. Sources: [Next Windows advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36), [image advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [sharp advisory](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c), [Next 16.3.5](https://github.com/vercel/next.js/releases/tag/v16.3.5).

## Verification

| Gate | Result |
| --- | --- |
| `npm run build`, `npm run lint`, `npm run typecheck` | PASS; lint also runs TypeScript here, not separate ESLint |
| `npm run test:unit` | 56/56, including feed safety, semantic constraints, DTO, prices, URL, saved state, and locale proxy |
| `npm run test:search` | DEV 44/44, REGRESSION 47/48; threshold PASS. Existing REGRESSION-012 wedding query remains too broad; this is not a new error |
| `npm run test:integration` | 15/15: search/fallback, /out 200/404, same-origin 202, hostile-origin 403, oversized 413 |
| Full locale suite | 3,004 assertions, 207 clicks on internal LT links, 100 atomic race cases, 0 browser errors |
| Shared browser suite | 21 PASS / 0 FAIL; untested areas are listed below |
| Controlled scenarios | Late stale RSC response ×3; real catalog 500→Retry; sparse product EN/LT — PASS |
| Accessibility | 24 EN/LT/light/dark axe scans without violations; keyboard, focus containment/restoration, reduced motion, and reflow checked separately |
| 3D | Garment selection, measurements, keyboard rotation, reduced motion, and a visible WebGL scene verified |

Details: [all UX-01–30](acceptance.md), [browser QA](qa-browser.md), [visual pass 1](visual-review-pass-1.md), [pass 2](visual-review-pass-2.md). Verification uncovered and fixed a hidden no-JS form, focus escape from two dialogs, language and search races, broken Retry, and secondary visual inconsistencies.

[Comparable performance](performance-final.md): final median homepage LCP 1120→928 ms, results 1040→1172 ms; blocking proxy 414→220 ms and 404→159 ms. Resource transfer grew about 11%, script bytes 5.7–6.5%. This is an accepted tradeoff, not a claim that every metric improved, and not field INP/CWV.

Final production checks disable external integrations at both build and start because `NEXT_PUBLIC_*` is embedded during build; a runtime override alone is insufficient. Early checks may have read the public RLS projection and are not presented as proof of CSV-only mode. For comparable speed testing, the old frontend was rebuilt with the same Next 16.3.5 and CSV in a separate temporary worktree, then removed with its server after measurement.

## Local run and reproduction

Normal development: `npm run dev`. Production check: `npm run build`, then `npm run start -- --hostname 127.0.0.1 --port 3100`. The current preview remains at [localhost 3100](http://127.0.0.1:3100).

For deterministic PowerShell 7 mode, set `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, and `POSTHOG_PROJECT_API_KEY` to empty values only in the build/start process environments. Private `.env.local` was unchanged and no secret values appear in this report.

```powershell
$env:BASE_URL='http://127.0.0.1:3100'
npm run test:locale
python scripts/frontend_e2e.py
python scripts/navigation_race_e2e.py
python scripts/catalog_failure_e2e.py
python scripts/catalog_failure_e2e.py --sparse
python scripts/fitting_room_e2e.py
python scripts/frontend_metrics.py --phase final
python scripts/frontend_capture.py --phase final
python scripts/frontend_surfaces.py
python scripts/frontend_secondary_states.py
```

Catalog fixtures launch their own localhost:3112 process and alter only data/errors returned to the test process for the exact file, not the CSV on disk. The marker and process are removed in `finally`. This is neither a public query flag nor an API. Do not run two fixture processes simultaneously. Prototypes are reproduced separately via `scripts/frontend_prototypes.py`; they were never public routes.

## Outcome boundaries

No physical iPhone/Android, NVDA/VoiceOver/TalkBack, Windows High Contrast, real browser-UI zoom, live Gemini timeout, or cloud production smoke test ran. The 200% reflow check is explicitly a CSS-zoom simulation. Postgres 17 container/RLS integration did not run because docker/podman/psql were unavailable in the shell; SQL and importer approvals did not change. Zero axe violations is not formal WCAG certification.

No paid upgrade is required. There is no new environment contract or database rollback. Future merchant redirects/affiliate feeds are outside the completed redesign. Before public launch, a real privacy contact and a separate decision on legal basis/consent for existing analytics remain outstanding.

Safe rollback: the changes are isolated in this branch, and the source commit `e601f4b2cec98a3a46c6d2fd8e3137267b6e4108` is preserved. Save the current diff before rolling back; revert the package and lockfile together without changing `main` or production. The three installed local skill directories are listed with provenance and license information in the skills research; removing them does not affect the application.
