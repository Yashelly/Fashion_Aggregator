# Service Connections

Prepared: 2026-07-29

Last refreshed: 2026-07-29

This file tracks external service access for Codex/OMX bootstrap work.

## Current MCP Config

Project Codex home:

```powershell
$env:CODEX_HOME = "C:\Users\rober\Fashion_Aggregator\.codex"
```

Configured in `.codex/config.toml`:

- `supabase`: `https://mcp.supabase.com/mcp?features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment`
- `vercel`: `https://mcp.vercel.com`
- `posthog`: `https://mcp.posthog.com/mcp`
- `sentry`: `https://mcp.sentry.dev/mcp` (temporarily disabled: Codex OAuth callback fails with issuer mismatch)
- `cloudflare`: `https://mcp.cloudflare.com/mcp`

OAuth completed during setup:

- Supabase
- Vercel
- PostHog
- Cloudflare

These were re-authenticated on 2026-07-29 and passed an `omx exec` smoke test.

OAuth still needs a visible manual retry:

- Sentry

Manual retry commands:

```powershell
cd C:\Users\rober\Fashion_Aggregator
$env:CODEX_HOME = "C:\Users\rober\Fashion_Aggregator\.codex"
codex.cmd mcp login sentry
```

After a successful login, set `enabled = true` for the matching server in `.codex/config.toml`.

Last Sentry retry failed with:

```text
Authorization server response missing required issuer: expected https://mcp.sentry.dev
```

Resend is not configured yet because the official MCP requires a `RESEND_API_KEY`.

```powershell
$env:CODEX_HOME = "C:\Users\rober\Fashion_Aggregator\.codex"
codex.cmd mcp add resend --env RESEND_API_KEY=re_xxxxxxxxx -- npx -y resend-mcp
```

Only add Resend after the sender domain is chosen and the API key is created.

## Current Resources

### Supabase

- Organization: `hkkcfpkjdomecorfqxzk`
- Development project: `fashion-aggregator-dev`
- Project ref: `erkfvklckkxozzloagqz`
- Region: `eu-central-1`
- Current cost: `$0/month`
- Applied migrations:
  - `sql/001_pre_affiliate_schema.sql`
  - `sql/002_pre_affiliate_hardening.sql`
  - `sql/003_synthetic_click_boundary.sql`
- Row-level security is enabled across 9 tables.
- The service-role key remains unavailable and
  `SUPABASE_SERVICE_ROLE_KEY` is not configured.

### Vercel

- Team: `team_V80WTeY923zPpRgYH3Q3h2wf`
- Project: `prj_WkrVDxRmGcmgWE7hLBTkhaDQ7pWD`
- Protected preview:
  `https://fashion-aggregator-mn3jbkddc-robertasburbo-8159s-projects.vercel.app`
- Deployment: `dpl_FPFHE992guHeeS8PWyFpeqstZ9WQ` (`READY`, preview)
- Five preview environment variable names are configured; values are not
  recorded here:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_URL`
  - `POSTHOG_PROJECT_API_KEY`
  - `POSTHOG_HOST`
- Final preview smoke results: application/search/stores and known preview guard
  `200`, unknown preview item `404`, search analytics `sent`, click analytics
  `scheduled`, and hostile origins `403`.
- The deployment build used Next.js `16.2.12` with audited PostCSS/Sharp
  overrides and hash-matched the staged runtime source.
- The EN/LT regression suite passed against the production build with 12
  routes, 133 clicked internal links, both responsive viewports, search/history
  coverage, and 100 zero-delay language-switch scenarios. Authenticated
  deployment smoke checks also confirmed localized `200`/`404`, public `/out`
  switcher URLs, and LT cookie canonicalization.
- The deployment was staged outside `.git` to avoid a Git-author team
  membership block. Git history was not changed.

### PostHog

- The active project uses the EU ingestion endpoint.
- Local and protected-preview search smoke events returned `analytics=sent`;
  the click endpoint returned `analytics=scheduled`.
- The connector schema now lists `search_performed` with the expected
  `filter_count`, `result_count`, `source_page`, and `has_query` properties.
- A bounded raw-event query also confirms `outbound_click_intent` ingestion.
  The schema-discovery cache has not yet surfaced that event name.

### Cloudflare

- The connected account has zero zones.
- No DNS records or zones were changed.

### Remaining Blockers

- Sentry remains disabled because its OAuth response has an issuer mismatch.
- Resend is not configured, and no email was sent.

## GitHub

The local `gh` CLI invalid saved tokens for `Yashelly` and `yashellyy` were removed on 2026-07-29.

Current status: logged into `github.com` as `Yashelly` via keyring.

Verified access:

```text
Yashelly/Fashion_Aggregator: private repo, viewerPermission=ADMIN
```

```powershell
gh auth login -h github.com
```

The local git remote is:

```text
origin https://github.com/Yashelly/Fashion_Aggregator.git
```

## Bootstrap Status and Safe Next Steps

Use dev/test resources first. Do not ask Codex to mutate production DNS, billing, or customer data without a specific review step.

1. GitHub access is verified. Push a clean branch when ready.
2. The Supabase dev project exists, migrations `001`, `002`, and `003` are applied,
   and the client/runtime variables are configured where available. Add the
   service-role key only after it becomes available.
3. The Vercel project is linked, five preview variables are configured, and
   the protected preview deployment has passed its smoke checks.
4. PostHog EU ingestion is working and the `search_performed` event is visible
   in the connector schema.
5. Retry Sentry OAuth only after the issuer mismatch is resolved, then create
   or select a Next.js project and configure its DSN and source maps.
6. Configure Resend only after the sender domain is verified and a restricted
   API key is available.
7. Connect Cloudflare DNS only after domain ownership is clear. The current
   account has no zones, and this bootstrap made no DNS changes.

## Application Runtime Variables

MCP OAuth grants Codex access to service-management tools; it does not configure
the deployed application runtime. Configure these separately in `.env.local`
and the matching Vercel preview environment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
POSTHOG_PROJECT_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
```

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it through a
  `NEXT_PUBLIC_` variable or client component.
- `POSTHOG_PROJECT_API_KEY` is a project capture key, not a personal API key.
  Use the ingestion host for the selected PostHog region.
- If server credentials are absent or capture fails, analytics calls fail
  closed without interrupting search or the local preview clickout guard.
- Apply `sql/001_pre_affiliate_schema.sql` before expecting Supabase search or
  blocked-preview click rows, then apply
  `sql/002_pre_affiliate_hardening.sql` and
  `sql/003_synthetic_click_boundary.sql`. All three migrations are applied to
  the current development project. Synthetic products remain local, use a
  neutral demo source, and are never redirected to merchant domains.

## Bootstrap Prompt

For a future environment bootstrap, launch `omc` after OAuth is finished and
give Codex this prompt:

```text
Use the configured MCP servers to inventory Supabase, Vercel, PostHog, Sentry, and Cloudflare for this Fashion_Aggregator project. Do not create paid resources, mutate production DNS, send email, or touch customer data without asking. First report available organizations/projects and recommend the minimal dev setup. Then, after approval, create/select dev resources, apply the existing Supabase schema, configure local env placeholders, and verify with build/typecheck.
```
