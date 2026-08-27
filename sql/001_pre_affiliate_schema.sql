begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
-- Pinned here (not only in 002) so re-running 001 cannot revert 002's
-- search-path hardening back to an unpinned definition.
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  legal_name text,
  market_country_code char(2) not null default 'LT',
  default_currency char(3) not null default 'EUR',
  website_url text,
  affiliate_network text,
  affiliate_program_url text,
  affiliate_status text not null default 'target'
    check (affiliate_status in (
      'target',
      'applied',
      'approved_deeplink',
      'approved_feed',
      'direct_permission',
      'rejected',
      'paused',
      'blocked'
    )),
  feed_status text not null default 'not_available'
    check (feed_status in (
      'not_available',
      'available_unverified',
      'available_verified',
      'importing',
      'import_error',
      'paused'
    )),
  public_listing_status text not null default 'hidden'
    check (public_listing_status in ('hidden', 'demo', 'live', 'paused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_stores_updated_at'
  ) then
    create trigger set_stores_updated_at
    before update on public.stores
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.affiliate_program_rules (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  network text not null,
  market_country_code char(2) not null default 'LT',
  source_url text,
  commission_text text,
  cookie_days integer check (cookie_days is null or cookie_days >= 0),
  product_feed_available boolean not null default false,
  deeplinking_allowed boolean not null default false,
  brand_sem_allowed boolean,
  coupon_allowed boolean,
  cashback_allowed boolean,
  content_allowed boolean,
  paid_social_allowed boolean,
  allowed_channels text[] not null default '{}'::text[],
  forbidden_channels text[] not null default '{}'::text[],
  feed_update_frequency text,
  key_restrictions text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, network, market_country_code)
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_affiliate_program_rules_updated_at'
  ) then
    create trigger set_affiliate_program_rules_updated_at
    before update on public.affiliate_program_rules
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.feed_import_runs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  source_type text not null default 'affiliate_feed'
    check (source_type in ('affiliate_feed', 'manual_mock', 'direct_partner_feed')),
  source_format text
    check (source_format is null or source_format in ('xml', 'csv', 'tsv', 'json')),
  source_url text,
  feed_hash text,
  status text not null default 'started'
    check (status in ('started', 'downloaded', 'parsed', 'completed', 'failed', 'cancelled')),
  is_full_snapshot boolean not null default true,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_rows integer not null default 0 check (total_rows >= 0),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  unchanged_count integer not null default 0 check (unchanged_count >= 0),
  out_of_stock_count integer not null default 0 check (out_of_stock_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  warning_count integer not null default 0 check (warning_count >= 0),
  error_message text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  external_product_id text not null,
  source_sku text,
  title text not null,
  brand text,
  description text,
  merchant_category text,
  normalized_category text,
  gender text,
  color_label text,
  normalized_color text,
  material text,
  product_url text,
  affiliate_url text,
  image_url text,
  image_terms text,
  currency char(3) not null default 'EUR',
  price numeric(12,2) check (price is null or price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  old_price numeric(12,2) check (old_price is null or old_price >= 0),
  availability text,
  in_stock boolean not null default true,
  size_summary text,
  status text not null default 'active'
    check (status in ('active', 'out_of_stock', 'removed', 'blocked', 'demo')),
  raw_hash text,
  content_hash text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_import_run_id uuid references public.feed_import_runs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, external_product_id)
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_products_updated_at'
  ) then
    create trigger set_products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.raw_feed_items (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.feed_import_runs(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  external_product_id text,
  product_id uuid references public.products(id) on delete set null,
  raw_payload jsonb not null,
  normalized_payload jsonb,
  raw_hash text not null,
  validation_status text not null default 'valid'
    check (validation_status in ('valid', 'warning', 'invalid', 'skipped')),
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (import_run_id, row_number)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  external_variant_id text,
  sku text,
  size_label text,
  normalized_size text,
  color_label text,
  normalized_color text,
  currency char(3) not null default 'EUR',
  price numeric(12,2) check (price is null or price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  availability text,
  in_stock boolean not null default true,
  product_url text,
  affiliate_url text,
  raw_payload jsonb,
  raw_hash text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_product_variants_updated_at'
  ) then
    create trigger set_product_variants_updated_at
    before update on public.product_variants
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.product_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  embedding_kind text not null default 'search_text'
    check (embedding_kind in ('search_text', 'image_text', 'style_profile')),
  embedding_model text not null,
  embedding_dimensions integer not null check (embedding_dimensions > 0),
  embedding_values double precision[],
  source_hash text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (product_id, embedding_kind, embedding_model)
);

comment on table public.product_embeddings is
  'Stores embedding metadata for MVP. If pgvector is enabled, add a vector column in a later migration. Example: create extension if not exists vector; alter table public.product_embeddings add column embedding_vector vector(1536);';

create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  anonymous_user_id text,
  query_text text,
  normalized_query text,
  filters jsonb not null default '{}'::jsonb,
  sort_key text,
  result_count integer check (result_count is null or result_count >= 0),
  source_page text,
  referrer_url text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  clicked_at timestamptz not null default now(),
  session_id text,
  anonymous_user_id text,
  search_event_id uuid references public.search_events(id) on delete set null,
  store_id uuid references public.stores(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  affiliate_network text,
  affiliate_subid text not null,
  source_page text,
  page_url text,
  referrer_url text,
  destination_url text not null,
  redirect_status text not null default 'pending'
    check (redirect_status in ('pending', 'redirected', 'blocked', 'failed')),
  user_agent text,
  ip_hash text,
  error_message text
);

create index if not exists idx_affiliate_program_rules_store
  on public.affiliate_program_rules (store_id);

create index if not exists idx_feed_import_runs_store_started
  on public.feed_import_runs (store_id, started_at desc);

create index if not exists idx_raw_feed_items_run
  on public.raw_feed_items (import_run_id);

create index if not exists idx_raw_feed_items_product
  on public.raw_feed_items (product_id);

create index if not exists idx_products_store_status
  on public.products (store_id, status);

create index if not exists idx_products_category_brand
  on public.products (normalized_category, brand);

create index if not exists idx_products_price
  on public.products (currency, price);

create index if not exists idx_products_last_seen
  on public.products (store_id, last_seen_at desc);

create index if not exists idx_product_variants_product
  on public.product_variants (product_id);

create index if not exists idx_product_embeddings_product
  on public.product_embeddings (product_id);

create index if not exists idx_search_events_created
  on public.search_events (created_at desc);

create index if not exists idx_search_events_filters_gin
  on public.search_events using gin (filters);

create index if not exists idx_outbound_clicks_clicked
  on public.outbound_clicks (clicked_at desc);

create index if not exists idx_outbound_clicks_store
  on public.outbound_clicks (store_id, clicked_at desc);

create index if not exists idx_outbound_clicks_product
  on public.outbound_clicks (product_id, clicked_at desc);

alter table public.stores enable row level security;
alter table public.affiliate_program_rules enable row level security;
alter table public.feed_import_runs enable row level security;
alter table public.products enable row level security;
alter table public.raw_feed_items enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_embeddings enable row level security;
alter table public.search_events enable row level security;
alter table public.outbound_clicks enable row level security;

revoke all privileges on table
  public.stores,
  public.affiliate_program_rules,
  public.feed_import_runs,
  public.products,
  public.raw_feed_items,
  public.product_variants,
  public.product_embeddings,
  public.search_events,
  public.outbound_clicks
from anon, authenticated;

grant select, insert, update, delete on table
  public.stores,
  public.affiliate_program_rules,
  public.feed_import_runs,
  public.products,
  public.raw_feed_items,
  public.product_variants,
  public.product_embeddings,
  public.search_events,
  public.outbound_clicks
to service_role;

revoke execute on function public.set_updated_at()
from public, anon, authenticated, service_role;

commit;
