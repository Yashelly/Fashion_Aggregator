<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# sql

## Purpose

Three hand-written, numbered PostgreSQL/Supabase migration files defining the pre-affiliate schema: stores, affiliate program rules, feed import tracking, products/variants/embeddings, and the two analytics tables (`search_events`, `outbound_clicks`) the live app actually writes to today. **There is no migration runner wired into this repo** — no `supabase/migrations` CLI setup, no ORM migration tool, and no script that applies these automatically. They must be applied manually, in numeric order, against the target Supabase project (e.g. via the Supabase SQL editor, `psql`, or the `mcp__supabase__apply_migration` tool).

## Key Files

| File | Description |
|------|--------------|
| `001_pre_affiliate_schema.sql` | Baseline schema. Creates every table in the system. |
| `002_pre_affiliate_hardening.sql` | Small hardening pass: pins `search_path` on the shared trigger function, adds 4 missing indexes. |
| `003_synthetic_click_boundary.sql` | Loosens one constraint to support the current "blocked synthetic-preview click" analytics behavior. |

## Migration Details

### `001_pre_affiliate_schema.sql`

Wrapped in `begin;`/`commit;`. Creates the `pgcrypto` extension and a shared `public.set_updated_at()` trigger function, then these tables (each with `id uuid primary key default gen_random_uuid()`):

- `public.stores` — retailer records with `affiliate_status` (`target`/`applied`/`approved_deeplink`/`approved_feed`/`direct_permission`/`rejected`/`paused`/`blocked`), `feed_status`, and `public_listing_status` (`hidden`/`demo`/`live`/`paused`) check constraints.
- `public.affiliate_program_rules` — per-store, per-network affiliate terms (commission text, cookie days, allowed/forbidden channels, brand-SEM/coupon/cashback flags); unique on `(store_id, network, market_country_code)`.
- `public.feed_import_runs` — one row per feed-import attempt, with row-count/status tracking (`started`/`downloaded`/`parsed`/`completed`/`failed`/`cancelled`).
- `public.products` — the "real" (non-demo) product table: price/sale_price/old_price, status (`active`/`out_of_stock`/`removed`/`blocked`/`demo`), unique on `(store_id, external_product_id)`.
- `public.raw_feed_items` — audit trail of raw feed payloads per import run, with `validation_status`.
- `public.product_variants` — size/color/price variants per product.
- `public.product_embeddings` — embedding metadata (model, dimensions, values array); comment notes pgvector support is deferred to a later migration.
- **`public.search_events`** — `session_id`, `anonymous_user_id`, `query_text`, `normalized_query`, `filters jsonb`, `sort_key`, `result_count`, `source_page`, `referrer_url`, `user_agent`, `ip_hash`, `created_at`. **This is the table `lib/analytics-storage.ts`'s `saveSearchEvent()` writes to.**
- **`public.outbound_clicks`** — `clicked_at`, `session_id`, `anonymous_user_id`, `search_event_id` (FK → `search_events`), `store_id` (FK → `stores`), `product_id`, `variant_id`, `affiliate_network`, `affiliate_subid` (`not null` in this migration), `destination_url` (`not null`), `redirect_status` (`pending`/`redirected`/`blocked`/`failed`), `user_agent`, `ip_hash`, `error_message`. **This is the table `lib/analytics-storage.ts`'s `saveBlockedPreviewClick()` writes to.**

Also adds ~11 indexes (store/status lookups, category/brand, price, `created_at desc` on both analytics tables, a GIN index on `search_events.filters`), enables **row-level security on every table**, then revokes all privileges from `anon`/`authenticated` and grants full `select/insert/update/delete` only to `service_role`. `set_updated_at()` execute privilege is revoked from everyone (it's invoked only via triggers, not called directly).

### `002_pre_affiliate_hardening.sql`

Small follow-up: pins `set_updated_at()`'s `search_path` to `pg_catalog` (hardening against search-path injection), and adds 4 indexes that `001` missed: `outbound_clicks(search_event_id)`, `outbound_clicks(variant_id)`, `products(last_import_run_id)`, `raw_feed_items(store_id)`.

### `003_synthetic_click_boundary.sql`

One change: `alter table public.outbound_clicks alter column store_id drop not null;` plus a column comment explaining why — `store_id` must be nullable to record **blocked synthetic-preview clicks** (i.e. clickouts on the current demo catalog, which has no real store to attribute to) and will only be required again once an approved live merchant redirect is being recorded. This directly matches `lib/analytics-storage.ts`'s `saveBlockedPreviewClick()`, which explicitly inserts `store_id: null`.

## For AI Agents

### Working In This Directory

- **Apply migrations manually and in numeric order** (001 → 002 → 003) against Supabase — there is no automated runner in this repo to do it for you. Use the Supabase MCP tool (`mcp__supabase__apply_migration`) or the SQL editor/CLI directly.
- All three files use `create ... if not exists` / idempotent-trigger-check patterns, so re-running an already-applied migration should be safe, but always confirm against the target project's current schema (`mcp__supabase__list_tables`) before applying blind.
- If you add a `004_*.sql` migration, follow the existing conventions: wrap in `begin;`/`commit;`, keep RLS enabled with `service_role`-only grants (this app writes exclusively through the server-side Supabase client — see `lib/supabase-server.ts` — never client-side), and add a short top-of-file or column comment explaining *why*, matching the style of `003`'s comment on `store_id`.
- `lib/analytics-storage.ts` treats all Supabase writes as best-effort with a 1-second timeout and silent (console-warned) failure — schema changes here should stay backward-compatible with that fire-and-forget write pattern, or that code needs to be updated in tandem.

## Dependencies

### Internal

- `lib/analytics-storage.ts` — writes to `search_events` (via `saveSearchEvent`) and `outbound_clicks` (via `saveBlockedPreviewClick`), both created in `001_pre_affiliate_schema.sql` and adjusted by `002`/`003`.
- `lib/supabase-server.ts` (referenced by `analytics-storage.ts`) — provides the server-side Supabase client that has the `service_role`-equivalent access these tables' grants assume.
- `docs/data_workflow.md` and `docs/artifact_index.md` — reference `001_pre_affiliate_schema.sql` as part of the broader pre-affiliate architecture narrative.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
