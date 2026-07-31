<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# analytics

## Purpose

Two POST-only route handlers that are the sole write path from the browser into analytics/persistence. Both validate same-origin, enforce a hard request-size cap, capture a PostHog event via `lib/analytics.ts`, and persist to Supabase via `lib/analytics-storage.ts` (both are best-effort/optional — see `lib/AGENTS.md`). `click/` and `search/` are each a single `route.ts` file; documented together here rather than as separate leaf AGENTS.md files since neither directory has anything else in it.

## Key Files

| File | Description |
|------|-------------|
| `search/route.ts` | `POST /api/analytics/search`. Rejects cross-origin requests (`isSameOrigin`) and bodies over 16 KB. Validates `resultCount` is a non-negative integer (400 if not); sanitizes `query`/`filters` (whitelisted `FILTER_KEYS`)/`sort`/`sourcePage` via `cleanText`/`cleanFilters`. Runs `saveSearchEvent` (Supabase insert into `search_events`) and `captureAnalyticsEvent("search_performed", ...)` in parallel, returns `202` with `{ analytics, searchEventId }`. Sets two **HttpOnly** cookies on the response: `vw_anonymous_id` (1 year) and, if a search-event row was persisted, `vw_search_event_id` (30 min) — these are the correlation IDs `click/route.ts` reads back later. |
| `click/route.ts` | `POST /api/analytics/click`. Same origin/size checks (2 KB cap here — much smaller, only a `productId`/`placement` payload). Looks up the product by ID in `getMockProducts()` and returns `404` for unknown IDs (this is a real existence check, not just formatting). Reads `vw_anonymous_id`/`vw_search_event_id` **only from the HttpOnly cookies** set by `search/route.ts` (never trusts a client-supplied anonymous/search-event ID), validates the search-event cookie against a UUID regex. Runs the Supabase write (`saveBlockedPreviewClick`, `redirect_status: "blocked"`) and the PostHog capture (`outbound_click_intent`) inside `after()` (Next's post-response callback) so persistence never delays the `202` response. Called by the guard on `app/out/[productId]/page.tsx` after it renders. |

## For AI Agents

### Working In This Directory

- Both handlers must stay same-origin-only and size-capped — do not remove `isSameOrigin`/the content-length checks when editing.
- `click/route.ts`'s 404 on unknown `productId` is intentional and load-bearing for the demo-data boundary: it proves the click endpoint only ever references a real (synthetic) catalog entry, never an arbitrary external URL. Do not change this to accept/redirect to an arbitrary `destinationUrl` from the client.
- If you add a new analytics event type, follow the existing pattern exactly: validate origin → cap body size → sanitize every field with `cleanText`/an explicit whitelist → run persistence and PostHog capture in parallel (or in `after()` if the response must return before persistence completes) → never let a persistence failure change the HTTP response.
- `runtime = "nodejs"` is set explicitly on both routes (not edge) — needed for `crypto.randomUUID()`/cookie APIs used here; keep it if you touch these files.

## Dependencies

### Internal
- `lib/analytics.ts` (`captureAnalyticsEvent`, `normalizeAnonymousId`), `lib/analytics-storage.ts` (`saveSearchEvent`, `saveBlockedPreviewClick`), `lib/request-security.ts` (`isSameOrigin`), `lib/mock-products.ts` (`getMockProducts`, click route only).

### External
- `next/server` (`NextRequest`/`NextResponse`, and `after` from `next/server` for click route's post-response work).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
