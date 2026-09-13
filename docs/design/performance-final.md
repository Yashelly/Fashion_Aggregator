# Performance: controlled before / after

12 September 2026. Final frontend source, production Next16.3.5. See [controlled baseline](performance-baseline.md) for original source commit and isolation. Final artifacts: `.omx/artifacts/frontend/final/metrics.json`; BEFORE: `.omx/artifacts/frontend/baseline-controlled/metrics.json`. The earlier initial 16.2.12 baseline is preserved separately, not used in this comparison.

Same runtime/dependencies, CSV catalog, routes, Chromium139, 390×844/DPR1, reduced motion, cache disabled, CPU×4, network150ms/200000B/s down/93750B/s up. Three fresh contexts per route, all samples retained, medians below. Runs were sequential without parallel WebGL/browser QA. `python scripts/frontend_metrics.py --phase final` completed after the final app build; no application source changed afterwards.

| Observation | Home before → after | Results before → after |
| --- | ---: | ---: |
| LCP | 1120 → **928 ms** (−17%) | 1040 → **1172 ms** (+13%) |
| Raw summed layout shifts | .003045 → .000683 | .000288 → .000694 |
| Load long-task blocking proxy | 414 → **220 ms** | 404 → **159 ms** |
| Transferred resource bytes | 326531 → 362752 (+11%) | 330109 → 366907 (+11%) |
| Loaded script bytes | 154425 → 163172 (+5.7%) | 155701 → 165885 (+6.5%) |

The new UI is not lighter by every measure. Both routes transfer about36KB more; the results LCP is132ms higher in this sample. New useful images and interactive controls are visible, but no trace-based attribution was collected, so they are not asserted as the measured cause of that LCP difference. The observed blocking proxy is lower and layout movement remains small. No functionality or result count was removed for a score. There is no new production animation/UI library or font; Three.js stays isolated to the existing secondary preview.

These are **local lab observations**, not field p75, INP, or a production performance guarantee. The raw CLS observer sums shifts and is not the full web-vitals session-window implementation; the long-task proxy is not Lighthouse TBT or INP. Resource script bytes are a comparable page-load measure, not a static analyzer's complete application bundle inventory. No CrUX/RUM dataset for this local URL exists and no collection SDK was enabled. Definitions and field/lab distinction: [web.dev Core Web Vitals](https://web.dev/articles/vitals).

Final side-check: ten EN/LT axe scans in this harness, zero violations. The independent browser harness additionally covers24 light/dark/dialog scans. Do not add their counts to claim a formal accessibility certification.

Decision: accept this measured trade-off for the frontend. Neither a paid hosting upgrade nor a new image/monitoring service is justified by the local evidence. Production field data and provider-latency observation are separate future work with a privacy review.
