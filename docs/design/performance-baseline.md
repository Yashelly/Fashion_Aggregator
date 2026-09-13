# Frontend performance baseline

## Evidence boundary

This is a controlled local lab baseline for the committed frontend before the redesign. It is not CrUX, first-party RUM, field INP, or proof of production performance. The browser observer records a single-navigation LCP approximation, raw summed layout shifts, and long-task time beyond 50 ms as a load-blocking proxy. The proxy must not be labelled INP.

The comparison source is detached Git commit `e601f4b2cec98a3a46c6d2fd8e3137267b6e4108` (`HEAD` when the redesign branch was created). The temporary worktree declared Next.js `^16.2.12`, but it deliberately used an isolated physical copy of the redesign worktree's already-installed `node_modules`, so both the controlled baseline and the final build execute Next.js `16.3.5`. No package installation ran in the baseline worktree.

All external-service variables were explicitly set to empty strings for both build and start:

`GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, and `POSTHOG_PROJECT_API_KEY`.

This forces the deterministic CSV/local-search path and avoids production or cloud writes. No `.env.local` file was copied.

## Method

- Source: detached worktree at commit `e601f4b2cec98a3a46c6d2fd8e3137267b6e4108`
- Runtime: Next.js `16.3.5`, production `next build` / `next start`
- Browser: Playwright Chromium `139.0.7258.5`, headless
- Routes: `/` and `/search?query=black`
- Runs: 3 fresh browser contexts per route; median and range retained
- Viewport: 390 x 844 CSS px, device scale factor 1
- Preferences: reduced motion
- Cache: disabled for every run
- CPU: 4x throttling
- Network: 150 ms latency, 200,000 B/s download, 93,750 B/s upload
- Stabilization: navigation waits for `networkidle`, followed by 1,000 ms
- Accessibility side-check: axe-core WCAG 2 A/AA, 2.1 AA, and 2.2 AA tags on five routes in EN and LT (10 scans)

The measurement ran in a quiet window before the final measurement, with no parallel browser/WebGL QA. Exact harness invocation from the redesign worktree:

```powershell
python scripts/frontend_metrics.py --phase baseline-controlled --base-url http://127.0.0.1:3101
```

The isolated server used port 3101; it never touched the shared preview on port 3100.

## Controlled baseline results

| Route | LCP median (range) | Raw CLS median (range) | Load-blocking proxy median (range) | Transfer median (range) | Script bytes median (range) |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 1,120 ms (1,096–1,236) | 0.00304454 (same each run) | 414 ms (362–437) | 326,531 B (326,530–326,531) | 154,425 B (same each run) |
| `/search?query=black` | 1,040 ms (1,032–1,072) | 0.000287759 (same each run) | 404 ms (397–411) | 330,109 B (330,107–330,109) | 155,701 B (same each run) |

The 10 axe scans reported zero violations. This is useful automated evidence, but it is not a WCAG conformance claim and does not replace assistive-technology testing.

Raw artifact: `.omx/artifacts/frontend/baseline-controlled/metrics.json`
SHA-256: `1b024af2ebda0598d22b1b8a6b2d4f8c76cd96d5b220ce5b9a3c3c06ed78a6b7`

## Earlier unpaired baseline retained

The earlier artifact remains at `.omx/artifacts/frontend/baseline/metrics.json`. Its medians were:

| Route | LCP | Raw CLS | Load-blocking proxy | Transfer | Script bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 1,188 ms | 0.00304454 | 392 ms | 337,628 B | 158,630 B |
| `/search?query=black` | 1,112 ms | 0.000287759 | 558 ms | 360,671 B | 159,898 B |

That run used the original frontend with Next.js `16.2.12` and inherited build-time public Supabase configuration. It therefore has framework and data-source/configuration confounders and is preserved only as historical evidence. Do not use it as the primary before/after comparison; pair the final run with `baseline-controlled` instead.

## Reproduction notes

The temporary worktree was created below `%LOCALAPPDATA%\Temp`, the external `node_modules` junction was rejected by Turbopack because it crossed the project filesystem root, and the junction alone was removed after validating its exact path, link type, and target. A physical copy of the existing dependencies was then used. The build succeeded with Turbopack in 6.1 seconds and generated all 81 routes. Next.js rewrote only generated `next-env.d.ts` in the disposable worktree during the build; the measured application source remained the detached commit.

The final report should compare medians and ranges under the same harness conditions and disclose that local lab variance remains. Real-user impact requires production RUM or eligible CrUX data after deployment.
