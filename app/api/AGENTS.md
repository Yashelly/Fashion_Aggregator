<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# api

## Purpose

Container for the app's entire API surface. There are currently no files directly here — everything lives under `analytics/`, which is the only server-side write path in the app (search-event logging and click-intent capture).

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `analytics/` | `POST /api/analytics/search` and `POST /api/analytics/click` — see `analytics/AGENTS.md` |

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
