# Storefront release stack — 13 September 2026

The approved local storefront was preserved as the private local Git ref `codex/local-storefront-snapshot-20260913` and reconstructed in an isolated worktree. The snapshot is not a deployment branch. Secrets, debug logs, private image masters, generated reports, node_modules and local assistant/runtime state are excluded.

## Owner merge order

| Step | Branch | Review base | Scope |
| --- | --- | --- | --- |
| 1 | `codex/release-01-dependencies` | `main` | Next, Sharp, pinned browser accessibility tooling |
| 2 | `codex/release-02-runtime` | step 1 | Locale intent, request cookie boundary, scoped search cache and category helpers |
| 3 | `codex/release-03-catalog` | step 2 | Shared responsive UI, catalog, custom filters, density, category navigation |
| 4 | `codex/release-04-secondary` | step 3 | Safe product DTOs, details, saved collection, 3D and supporting pages |
| 5 | `codex/release-05-street-home` | step 4 | Approved responsive street media, final homepage and cross-surface QA/docs |

PRs are stacked, not independent alternatives. After each owner merge, retarget the next PR to main and rerun CI against its updated base. Reconcile the remaining stack if the owner chooses squash/rebase merging. Do not merge upper branches into a lower feature branch, enable auto-merge, or use the temporary text-led homepage from step 3 as the final visual acceptance target. The complete visual target is step 5's preview.

Only the owner merges main. No production deployment command, feed import, schema migration or analytics activation is part of this release preparation. Automatic branch previews are distinct from production. Before production, verify the merged main commit and its deployment separately.

## Reproducible verification

Each layer receives typecheck, its available unit suites, a production build and HTTP integration smoke. GitHub CI additionally supplies an isolated PostgreSQL service for feed/catalog tests and runs the deterministic search gate. The existing inspected REGRESSION-012 result-cap failure remains; the overall search gate passes (DEV 44/44, regression 47/48). It is not represented as 100% search success.

Current browser gates against `next start`:

```powershell
$env:BASE_URL = 'http://127.0.0.1:3114'
npm run test:locale
python scripts/home_hero_e2e.py --base-url $env:BASE_URL
python scripts/responsive_display_e2e.py --base-url $env:BASE_URL
python scripts/selected_hybrid_e2e.py --base-url $env:BASE_URL
python scripts/category_navigation_e2e.py --base-url $env:BASE_URL
python scripts/catalog_controls_e2e.py --base-url $env:BASE_URL
python scripts/fitting_room_e2e.py
python scripts/frontend_secondary_states.py
```

Historical design studies and superseded acceptance scripts are retained for traceability, not current gates: in particular `wardrobe_revision_e2e.py` targets the rejected cold-studio composition. `frontend_prototypes.py`, earlier generic frontend capture/evaluation scripts, and dated design studies must be interpreted against their recorded revision. Use the current suites above for this release. Local `.omx` evidence links in historical documents are not expected to resolve in a clean clone; rerunning a current suite regenerates its reports/screenshots. The six committed WebPs are sufficient for production; the private master is needed only to re-export them manually.

## Packaging-only corrections

Application source and six delivery images retain the approved snapshot. Browser harness changes made during release preparation:

- Wait for density restoration after sort navigation before asserting the persisted choice.
- Wait for visible image readiness instead of requiring every intentionally lazy image to load.
- Make the saved-state suite accept `BASE_URL` and target the current footer/mobile theme controls.

A local Next preview process once retained a stuck optimized-image request; the original asset decoded normally and the control suite passed after restarting that isolated process. No source image was replaced. This is a recorded local transient, not a claim of production diagnosis.

## Release limits

Fresh final-stack verification: typecheck/build passed; unit 60/60; HTTP smoke 15/15; hero 8/8; responsive 7/7; selected-hybrid 11/11 including 24 axe scans; locale 3112 assertions across 14 routes and 229 clicked links with zero browser errors. EN/LT phone and desktop hero screenshots were inspected after rebuilding the isolated release worktree. These are local verification results; CI and the exact preview deployment must also be checked per PR.

Local Chromium and automated accessibility checks are not physical iPhone/Android or screen-reader certification. No field LCP/INP/CLS or new cloud-model benchmark is claimed. A public privacy contact and analytics/privacy review remain governance follow-ups. The catalog is synthetic and `/out` never redirects to a merchant.
