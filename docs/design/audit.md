# Audit and implementation map

12 September 2026 · `codex/weft-frontend-redesign`. Full owner brief read through line 901. Initial worktree clean; no main commit, merge or deployment.

## Baseline evidence

Build, typecheck, lint, 37 unit tests and 15 integration checks passed. Search DEV 44/44, regression 47/48, threshold passes; existing REGRESSION-012 broad wedding query is outside this frontend ranking scope. Locale suite stopped on missing `.product-link`, a stale selector; earlier checks are not a full-suite pass.

Twelve EN/LT home/results/detail captures at 1440×1000 and 390×844, with URLs/status/errors in private baseline manifest. Main inspected representative views in both languages. Desktop results grid starts around y=873; mobile has no product in its first viewport. Home lacks immediate search/clothing and is dominated by duplicate wordmark/gradient.

P0 detail client serializes internal objects and invents alternate prices. Locale starts EN and only reads URL once. Wishlist is unsynchronized and loses repeated clicks with blocked storage. Account implies non-existent account functions.

## Implementation / regression plan

Preserve existing integration/search gates; add DTO/URL tests before boundary repair. Replace the hero/filter stack, preserving ranking. Add manual budget and multi-store constraints without relaxing query hard constraints; scope runtime cache by its catalog input. Share resilient image/saved state. Consolidate obsolete CSS variants into selected tokens. Preserve working 3D engine with accurate copy. Incremental typecheck, production/browser tests, two visual review passes.

## Baseline performance

Three cold runs per route, mobile 390×844, Chromium, CPU×4, 150 ms RTT, 200000 B/s down / 93750 up. Median home LCP 1188 ms, CLS .00304, transferred 337628 B; results 1112 ms, .000288, 360671 B. Long-task blocking proxies 392 / 558 ms. Axe on five representative routes in both languages: zero violations. Controlled local lab, not field INP/CrUX. Original hero has no photograph to load.

## Boundaries

Preserve server catalog/CSV fallback, eligible source status, neutral store mapping, unknown /out 404 and no redirects, origin-checked analytics, hybrid search with fallback. No secrets, migration or external writes. Internal IDs are not ordinary UI labels.
