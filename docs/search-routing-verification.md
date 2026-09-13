# Objective search routing — implementation and verification

Date: 2026-09-13. Branch: `codex/search-fast-routing`, based on merged main `f2b0f2f` in an isolated worktree. Prepared for a pull request directly to `main`; production deployment and merge remain separate from this implementation.

## Scope

- `lib/search-router.ts`: a full-consumption EN/LT grammar for supported garment, color, department, sleeve, maximum EUR price, stock and sale clauses. No model classifies whether a model is needed. Unsupported terms, corrections, general negation, alternatives and ambiguous combinations retain the hybrid route.
- Sleeve evidence comes from the existing photo-reviewed construction tags. `sleeveless`, `without sleeves`, `no sleeves`, `be rankovių` require affirmative evidence on applicable clothing. Unknown/contradictory metadata and bags/trousers are excluded. The actual catalog returns MOCK-004 and MOCK-019; their product images were visually checked. No catalog data, feeds or index were rewritten.
- Short and long sleeve constructions remain distinct. A broad color uses the existing exact (non-fuzzy) color-family vocabulary on the structured color field; explicitly named supported shades remain exact. Garment families are explicit and do not inherit style associations such as sweatshirt → sweatpants.
- Mixed-query guards cover only a supported prefix followed by `for/skirta/skirti`. They filter both candidates and returned products. This is deliberately not a universal natural-language constraint parser.
- `lib/search-runtime.ts`: fast requests make zero cloud calls, including cold cache and zero results. Hybrid cache admission uses explicit valid judge completion rather than comparing result signatures. Empty and fallback-identical successes cache; failures do not. Existing TTL/LRU, request coalescing and catalog/facet cache keys are retained.
- The cloud pipeline shares a provisional 8-second abort budget across embedding, vector RPC and judge. Individual shorter stage timeouts remain. No next stage starts after cancellation; bounded awaiting handles even a noncooperative dependency. This bounds asynchronous cloud waiting, not catalog loading, synchronous computation, network transfer, or page rendering. It is not browser-disconnect cancellation.
- On incomplete cloud work, only the existing deterministic fallback is used, never unjudged vector-fusion candidates. Nonempty unresolved fallbacks are labelled approximate. Cloud metadata has explicit outcomes/reasons/timings and no query text.

## Verification commands

```sh
npm run test:unit
npm run test:search
npm run typecheck
npm run build
npm run test:integration
# Production build running on 3115, with AI/analytics/catalog cloud credentials disabled:
python scripts/search_routing_e2e.py
```

New unit suites: `scripts/search-routing.test.mjs`, `scripts/search-runtime-routing.test.mjs`, `scripts/search-cloud-runtime.test.mjs`. They exercise shipped TS modules with service-boundary doubles, not a duplicate search implementation. Twelve existing DEV/REGRESSION queries enter the new fast route and are independently checked against the existing precision/required-results/cap rules. The legacy relevance gate remains DEV 44/44 and REGRESSION 47/48; REGRESSION-012's pre-existing result-cap failure is unchanged. Sealed blind sets/reports were not used for tuning or regenerated.

Final verification: unit 84/84; integration smoke 15/15; browser 7/7; typecheck, production build (81 generated pages) and whitespace diff checks pass. Independent code review approved the final code with no remaining findings. Combined review disposition is COMMENT because architecture retains the documented non-blocking WATCH items below; this is not a claim of production performance validation.

Browser checks cover EN/LT at 1440×1000, 2560×1440 and 390×844, plus no-JavaScript rendering: exact sleeve results, preserved search text, native form submission, price restriction, incompatible category → empty, history navigation and no overflow. Seven cases pass with no page errors. Screenshots and report live in `.omx/artifacts/search-routing/` in the implementation worktree. Desktop and phone screenshots were visually inspected.

Observed warm deterministic search-stage p95 on the 64-product local fixture is below 1 ms; this excludes catalog loading, browser work and network latency. Browser screenshots wait for network-idle/images, so their approximately 1-second readiness measurements are not search-engine timings or a production SLA.

## Remaining boundaries and release

No new dependencies. Existing root working-copy application edits remain untouched. The owner's automatic-PR workflow is recorded in `AGENTS.md`; only the owner merges main. Verification above was completed locally before publication, with no production changes. After release, verify `mode=objective` for the supported query and measure cold/warm p50/p95 separately; use stage metadata for slow hybrid cases.

Live paid-model quality and production timings have not been benchmarked for the new deadline; 8 seconds is a conservative initial cloud budget, not a demonstrated optimum. Distributed/shared caching and broader grammar/enrichment are follow-ups requiring their own evidence; missing catalog facts are not invented to enable fast routing. `SEARCH_OBJECTIVE_ROUTING=off` is an objective-router rollback switch, not a full rollback of the deadline/cache changes.

Independent architecture review: WATCH, with no structural blocker; the documented watchpoints are the cloud-only deadline, limited mixed grammar, and legacy interpretation reuse in UI/hybrid filtering. Further expansions need cross-parser regression tests.
