# Weft — frontend handoff

[removed] [removed]: [[removed] [removed] 2K, [removed] [removed] [removed] [removed]](responsive-display-verification.md). [removed] [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed].

[removed] handoff: [[removed] [removed] A/B/C [removed] [removed] [removed]](selected-hybrid-verification.md). [removed] [removed] [removed] [removed] [removed] A, [removed] B, [removed] [removed] C [removed] [removed] [removed] 3/4/5 [removed]. [removed] [removed] [removed] [removed] [removed]; [removed] cream/serif, [removed] [removed] cold-studio [removed] [removed] [removed] [removed] [removed] [removed] [removed].

12 [removed] 2026 · [removed] `codex/weft-frontend-redesign`. [removed] [removed], [removed] commit, merge [removed] main, [removed], [removed] [removed] [removed] [removed] [removed] [removed].

## [removed] [removed]

[removed] [removed] A: [removed] [removed], [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed] [removed] AI-hero. [removed] [removed] [removed] [removed] [removed], [removed], [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed], [removed], [removed], [removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed] y=379 [removed] desktop [removed] [removed] y≈873. [removed] mobile [removed] [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed] [removed] Apply/Cancel.

[removed] [removed] [removed] [removed] [removed] [removed] [removed]. [removed] [removed] query/filter/sort, [removed] [removed] [removed] [removed] [removed]. EN/LT [removed] [removed] [removed] [removed], [removed] [removed] [removed] [removed]. [removed] [removed] [removed]; Privacy [removed] [removed] [removed], [removed] [removed] [removed] [removed] [removed]. 3D [removed] [removed] [removed] [removed] [removed] SOON, [removed] [removed] [removed] AI-[removed] [removed] [removed] [removed].

## [removed] [removed]

| [removed] | Desktop | Mobile |
| --- | --- | --- |
| [removed] EN | [[removed]](../../.omx/artifacts/frontend/final/home-en-desktop.png) | [[removed]](../../.omx/artifacts/frontend/final/home-en-mobile.png) |
| [removed] LT | [[removed]](../../.omx/artifacts/frontend/final/results-lt-desktop.png) | [[removed]](../../.omx/artifacts/frontend/final/results-lt-mobile.png) |
| [removed] EN | [[removed]](../../.omx/artifacts/frontend/final/details-en-desktop.png) | [[removed]](../../.omx/artifacts/frontend/final/details-en-mobile.png) |

[removed] [removed] [removed] [removed] [removed]: `.omx/artifacts/frontend/baseline`, `pass-1`, `pass-2`, `final`. [removed] [removed] — `secondary`, [removed] [removed]/[removed]/[removed] [removed] — `qa-browser/screenshots`. [removed] [removed] [removed] [removed] git; [removed] ignore-[removed] [removed].

## [removed] [removed] [removed]

- [[removed]](audit.md): [removed] [removed], [removed] [removed], baseline.
- [[removed] A](research-a.md) [removed] [B](research-b.md): 20 [removed] [removed], 80 [removed] desktop/mobile [removed], [removed] walkthrough. [removed] [removed] [removed] [removed] [removed] [removed] [removed]; [removed] [removed] AI [removed] [removed] [removed] [removed] [removed].
- [[removed] [removed]](directions-and-decisions.md): [removed] [removed], 12 [removed] [removed], [removed] [removed] [removed] desktop/mobile, [removed] [removed] A93/B86/C76. [removed] [removed] [removed] A/B-[removed].
- [[removed] [removed]](palettes.md): [removed] semantic tokens [removed] [removed] [removed]. [removed] linen/rust — [removed] [removed] [removed] [removed] [removed].
- [[removed] [removed] [removed]](skills-research.md): 13 [removed] → [removed] shortlisted → [removed] [removed] [removed] [removed] [removed]. [removed] [removed] OMX0.21.5, [removed] design-[removed], notepad checkpoint [removed] [removed] native subagents. OMC-[removed] [removed]; [removed] [removed] OMC [removed] [removed].
- [DESIGN.md](../../DESIGN.md) — [removed] [removed]; [EN/LT [removed] release](copy-and-release.md) — [removed], privacy, [removed] [removed] [removed] [removed] [removed].

[removed] [removed] [removed]: [removed] [removed] [removed] [removed]; [removed] [removed] [removed] [removed] [removed]; URL-backed chips; [removed] [removed] [removed] [removed]; [removed] [removed]; [removed] [removed] [removed]. [removed] [removed], [removed], [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed].

## [removed] [removed]

- `app/page.tsx`, `app/search/page.tsx`, `app/globals.css`: [removed] storefront, [removed] hero, [removed] [removed], responsive [removed] light/dark tokens. [removed] [removed] cinematic hero/filter wrapper [removed] [removed] [removed] HTML route-loading [removed]; [removed] [removed] [removed] [removed] Git commit.
- `search-form`, `search-input`, `search-controls`: native GET [removed] JavaScript, [removed] [removed] [removed], [removed]/[removed] [removed], draft/apply/cancel, [removed] [removed], [removed] [removed] [removed] [removed] [removed] [removed].
- `lib/search-params.ts`, `lib/search-cache-key.ts`: [removed] [removed] [removed] [removed] [removed]; cache key [removed] [removed] [removed]. [removed] semantic/hybrid ranking [removed] [removed].
- `lib/public-product.ts`, `product-detail-view`, `product-image`: [removed] allowlist DTO, [removed] returnTo, [removed] optional fields, [removed] [removed] [removed] image/price fallback.
- `locale-provider`, `site-header`, `proxy.ts`: [removed] [removed], cookie/prefetch/RSC [removed] [removed] [removed] [removed] [removed] [removed] [removed].
- `lib/saved-items.ts`, `wishlist-button`, `account-dashboard`: [removed] [removed] [removed], cross-tab [removed] [removed] [removed] [removed] [removed] storage. [removed] preference-[removed] [removed] [removed].
- `fitting-room-avatar`: [removed] [removed] [removed] [removed] [removed], [removed] SOON/font-loader [removed]; [removed], [removed], [removed] [removed] [removed] [removed] [removed] [removed]. Three.js [removed] [removed].

[removed] [removed] [removed] [removed] [removed]: `axe-core@4.13.0`. [removed] [removed] [removed] [removed]: Next16.2.12 →16.3.5, sharp0.35.3 →0.35.4 [removed] baseline-browser-mapping2.11.22. `package-lock.json` [removed], `npm audit` [removed] 0. [removed]: [Next Windows advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36), [image advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [sharp advisory](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c), [Next16.3.5](https://github.com/vercel/next.js/releases/tag/v16.3.5).

## [removed]

| Gate | [removed] |
| --- | --- |
| `npm run build`, `npm run lint`, `npm run typecheck` | PASS; lint [removed] [removed] [removed] [removed] [removed] TypeScript, [removed] [removed] ESLint |
| `npm run test:unit` | 56/56, [removed] feed safety, semantic constraints, DTO, [removed], URL, saved state [removed] locale proxy |
| `npm run test:search` | DEV44/44, REGRESSION47/48; threshold PASS. [removed] REGRESSION-012 wedding query [removed] [removed] [removed], [removed] [removed] [removed] [removed] |
| `npm run test:integration` | 15/15: [removed]/fallback, /out200/404, same-origin202, hostile-origin403, oversized413 |
| [removed] locale suite | 3 004 assertions, 207 [removed] [removed] LT-[removed], 100 atomic race cases, 0 browser errors |
| [removed] browser suite | 21 PASS / 0 FAIL; [removed] [removed] [removed] [removed] [removed] |
| [removed] [removed] | [removed] [removed] RSC [removed]×3; [removed] catalog500→Retry; sparse product EN/LT — PASS |
| Accessibility | 24 axe [removed] EN/LT/light/dark [removed] [removed]; [removed] [removed], focus containment/restoration, reduced motion [removed] reflow |
| 3D | [removed] [removed], [removed], keyboard rotation, reduced motion [removed] [removed] WebGL-[removed] [removed] |

[removed]: [[removed] UX-01–30](acceptance.md), [browser QA](qa-browser.md), [[removed] [removed]1](visual-review-pass-1.md), [[removed]2](visual-review-pass-2.md). [removed] [removed] [removed] [removed] [removed] [removed] no-JS [removed], [removed] [removed] [removed] [removed] [removed], [removed] [removed] [removed] [removed], [removed] Retry [removed] [removed] [removed] [removed].

[[removed] [removed]](performance-final.md): [removed] [removed] LCP [removed]1120→928ms, [removed]1040→1172ms; blocking proxy414→220ms [removed]404→159ms. [removed] [removed] [removed] [removed] [removed]11%, script bytes [removed]5.7–6.5%. [removed] [removed] [removed] trade-off, [removed] [removed] [removed] [removed] [removed] [removed]. [removed] field INP/CWV.

[removed] production-[removed] [removed] [removed] [removed] [removed] [removed] build, [removed] [removed] start: `NEXT_PUBLIC_*` [removed] [removed] [removed] [removed], [removed] [removed] runtime override [removed]. [removed] [removed] [removed] [removed] [removed] RLS-[removed]; [removed] [removed] [removed] [removed] [removed] CSV-only [removed]. [removed] [removed] [removed] [removed] frontend [removed] [removed] [removed] [removed] [removed] [removed] Next16.3.5 [removed] CSV [removed] [removed] [removed] worktree. [removed] [removed] [removed] [removed] [removed] [removed] [removed].

## [removed] [removed] [removed] [removed]

[removed] [removed]: `npm run dev`. [removed] production-[removed]: `npm run build`, [removed] `npm run start -- --hostname 127.0.0.1 --port 3100`. [removed] preview [removed] [removed] [localhost3100](http://127.0.0.1:3100).

[removed] [removed] [removed] PowerShell7: [removed] build [removed] start [removed] [removed] [removed] `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `POSTHOG_PROJECT_API_KEY` [removed] [removed] [removed] [removed] [removed]. [removed] `.env.local` [removed] [removed]; [removed] [removed] [removed] [removed] [removed].

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

Catalog fixtures [removed] [removed] localhost3112 [removed] [removed] [removed] [removed] [removed] [removed] [removed] [removed]/[removed] [removed] [removed] [removed], [removed] [removed] CSV [removed] [removed]. [removed] marker [removed] [removed] [removed] [removed] finally. [removed] [removed] [removed] query flag [removed] API. [removed] [removed] [removed] fixture-[removed] [removed]. [removed] [removed] [removed] [removed] `scripts/frontend_prototypes.py`; [removed] [removed] [removed] [removed] public routes.

## [removed] [removed]

[removed] [removed] [removed] iPhone/Android, NVDA/VoiceOver/TalkBack, Windows High Contrast, [removed] browser-UI zoom, live Gemini timeout [removed] [removed] production smoke. 200% reflow — [removed] [removed] CSS-zoom [removed]. Postgres17 container/RLS integration [removed] [removed] [removed]: [removed] [removed] shell [removed] [removed] docker/podman/psql; SQL [removed] importer approvals [removed] [removed]. Zero axe violations [removed] [removed] [removed] WCAG-[removed].

[removed] [removed] [removed] upgrade. [removed] [removed] env-[removed] [removed] database rollback. [removed] merchant redirects/affiliate feeds [removed] [removed] [removed] [removed] [removed]. [removed] [removed] [removed] [removed] [removed] [removed] [removed] privacy [removed] [removed] [removed] [removed] [removed] [removed]/consent [removed] [removed].

Safe rollback: [removed] [removed] [removed] [removed] [removed], [removed] commit `e601f4b2cec98a3a46c6d2fd8e3137267b6e4108` [removed]. [removed] [removed] [removed] [removed] [removed] diff; [removed] [removed] lockfile [removed] [removed], [removed] [removed] main [removed] production. [removed] [removed] [removed] skill-[removed] [removed] [removed] provenance/license [removed] skills-research; [removed] [removed] [removed] [removed] [removed] [removed].
