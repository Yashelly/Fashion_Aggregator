# VIBEWEAR

Pre-affiliate Next.js foundation for a visual fashion discovery/search MVP.

## Current Mode

- Uses synthetic demo products from `data/mock_products.csv`.
- No live retailer catalog is displayed.
- Live products should come only from approved affiliate feeds or direct merchant permission.
- Public copy supports English and Lithuanian through a canonical `lang` query
  parameter backed by the `vibewear-locale` preference cookie.
- Store pages describe targets as application/demo sources, not official partnerships.

## First-Wave Affiliate Targets

- Reserved LT
- Sinsay LT
- Sizeer LT
- MODIVO LT
- Cropp LT
- ABOUT YOU LT

Monitoring-only:

- Factcool LT, because the official LT site currently states sales were suspended from 2025-03-06.

See `data/store_tracker.csv`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Locale Regression Test

The browser suite covers EN/LT switching, cookie/query precedence, every public
route, internal links, search filters, mobile/desktop layouts, browser history,
`/out` success/404 behavior, and zero-delay navigation after a language change.

With the app running:

```bash
BASE_URL=http://127.0.0.1:3000 npm run test:locale
```

The command requires Python Playwright with Chromium and writes its JSON report
to `.omx/artifacts/qa/locale-summary.json`.

## Environment

Copy `.env.example` to `.env.local` when the optional services are created:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
POSTHOG_PROJECT_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never use a
`NEXT_PUBLIC_` prefix. `SUPABASE_URL` is the preferred server URL; the server
helper can fall back to `NEXT_PUBLIC_SUPABASE_URL`.

`POSTHOG_PROJECT_API_KEY` is the PostHog project key used by server-side HTTPS
capture (not a personal API key). Set `POSTHOG_HOST` to the matching PostHog
region. Analytics and persistence are disabled gracefully when their variables
are absent, so the preview remains usable without external services.

Do not commit `.env.local`.

## Database

Initial schema:

```text
sql/001_pre_affiliate_schema.sql
```

The search analytics endpoint is `POST /api/analytics/search`. It accepts a
bounded JSON payload containing `query`, `filters`, `sort`, `resultCount`,
`sourcePage`, and an optional anonymous ID, then returns an optional
`searchEventId` for future click linkage.

Synthetic product links use `/out/:productId`, record click intent when services
are configured, and render an onsite synthetic-preview guard. Unknown IDs return
a useful 404. They never redirect to a merchant. An external redirect may be
enabled only for an approved live feed after destination HTTPS/host and
affiliate-rule validation.

The guard posts to `POST /api/analytics/click` after it renders. The endpoint
validates the synthetic product and same-origin request, reads correlation only
from HttpOnly cookies, schedules bounded server-side persistence/capture, and
returns `202` without delaying navigation.

## Important Rule

Do not mark a store as live or display real merchant products until approved feed access or direct permission exists.
