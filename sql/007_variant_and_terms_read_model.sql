begin;

alter function private.refresh_catalog_product(uuid) security definer;
alter function private.sync_catalog_product_trigger() security definer;
alter function private.sync_catalog_store_trigger() security definer;

alter table public.product_variants
  add column if not exists item_group_id text,
  add column if not exists gtin text,
  add column if not exists size_system text,
  add column if not exists old_price numeric(12,2) check (old_price is null or old_price >= 0),
  add column if not exists image_urls text[] not null default '{}'::text[],
  add column if not exists source_observed_at timestamptz,
  add column if not exists variant_key text not null default '';

alter table public.stores
  add column if not exists availability_sla_hours integer not null default 48
    check (availability_sla_hours > 0 and availability_sla_hours <= 720);

update public.product_variants
set variant_key = coalesce(nullif(external_variant_id, ''), nullif(sku, ''),
  concat_ws('|', coalesce(normalized_size, ''), coalesce(normalized_color, ''), id::text))
where variant_key = '';

create unique index if not exists product_variants_product_key
  on public.product_variants (product_id, variant_key);

create table if not exists public.retailer_offer_terms (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  delivers_to_lithuania boolean not null,
  delivery_price_eur numeric(12,2) check (delivery_price_eur is null or delivery_price_eur >= 0),
  free_delivery_threshold_eur numeric(12,2) check (free_delivery_threshold_eur is null or free_delivery_threshold_eur >= 0),
  delivery_min_days integer check (delivery_min_days is null or delivery_min_days >= 0),
  delivery_max_days integer check (delivery_max_days is null or delivery_max_days >= delivery_min_days),
  return_window_days integer check (return_window_days is null or return_window_days >= 0),
  return_payer text check (return_payer is null or return_payer in ('customer', 'retailer', 'seller')),
  return_cost numeric(12,2) check (return_cost is null or return_cost >= 0),
  policy_url text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, product_id)
);

alter table public.retailer_offer_terms enable row level security;
revoke all on public.retailer_offer_terms from public, anon, authenticated;
drop policy if exists "Feed importer manages eligible retailer terms" on public.retailer_offer_terms;
create policy "Feed importer manages eligible retailer terms"
  on public.retailer_offer_terms
  for all to weft_feed_importer
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = retailer_offer_terms.product_id
        and retailer_offer_terms.store_id = p.store_id
        and (
          (s.public_listing_status = 'demo')
          or (s.affiliate_status = 'approved_feed' and s.feed_status in ('available_verified', 'importing'))
          or (s.affiliate_status = 'direct_permission' and s.feed_status <> 'paused')
        )
    )
  )
  with check (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = retailer_offer_terms.product_id
        and retailer_offer_terms.store_id = p.store_id
        and (
          (s.public_listing_status = 'demo')
          or (s.affiliate_status = 'approved_feed' and s.feed_status in ('available_verified', 'importing'))
          or (s.affiliate_status = 'direct_permission' and s.feed_status <> 'paused')
        )
    )
  );

drop policy if exists "Feed importer manages eligible variants" on public.product_variants;
create policy "Feed importer manages eligible variants"
  on public.product_variants for all to weft_feed_importer
  using (exists (
    select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_variants.product_id
      and ((s.public_listing_status = 'demo')
        or (s.affiliate_status = 'approved_feed' and s.feed_status in ('available_verified', 'importing'))
        or (s.affiliate_status = 'direct_permission' and s.feed_status <> 'paused'))
  ))
  with check (exists (
    select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_variants.product_id
      and ((s.public_listing_status = 'demo')
        or (s.affiliate_status = 'approved_feed' and s.feed_status in ('available_verified', 'importing'))
        or (s.affiliate_status = 'direct_permission' and s.feed_status <> 'paused'))
  ));

drop view if exists public.catalog_variants;
create view public.catalog_variants
with (security_invoker = false)
as
select
  case when s.public_listing_status = 'demo' then p.external_product_id else p.id::text end as public_product_id,
  s.public_id as public_store_id,
  v.external_variant_id,
  v.item_group_id,
  v.sku,
  v.gtin,
  v.size_system,
  v.size_label,
  v.color_label,
  v.currency,
  v.price,
  v.sale_price,
  v.old_price,
  case when v.source_observed_at is not null
    and (v.source_observed_at > now()
      or v.source_observed_at < now() - make_interval(hours => s.availability_sla_hours)) then 'unknown'
    when coalesce(v.availability, case when v.in_stock then 'active' else 'out_of_stock' end) in ('active', 'in_stock') then 'in_stock'
    when coalesce(v.availability, '') in ('limited', 'low_stock') then 'low_stock'
    when coalesce(v.availability, '') in ('out_of_stock', 'sold_out') then 'out_of_stock'
    else 'unknown'
  end as availability,
  v.in_stock,
  v.image_urls,
  v.source_observed_at
from public.product_variants v
join public.products p on p.id = v.product_id
join public.stores s on s.id = p.store_id
where s.public_id is not null
  and s.public_listing_status in ('demo', 'live')
  and p.status in ('active', 'demo', 'out_of_stock');

drop view if exists public.catalog_product_terms;
create view public.catalog_product_terms
with (security_invoker = false)
as
select
  case when s.public_listing_status = 'demo' then p.external_product_id else p.id::text end as public_product_id,
  s.public_id as public_store_id,
  t.delivers_to_lithuania,
  t.delivery_price_eur,
  t.free_delivery_threshold_eur,
  t.delivery_min_days,
  t.delivery_max_days,
  t.return_window_days,
  t.return_payer,
  t.return_cost,
  t.policy_url,
  t.last_checked_at
from public.retailer_offer_terms t
join public.products p on p.id = t.product_id
join public.stores s on s.id = t.store_id and s.id = p.store_id
where s.public_id is not null
  and s.public_listing_status in ('demo', 'live')
  and t.delivers_to_lithuania;

revoke all on public.catalog_variants, public.catalog_product_terms from public, anon, authenticated;
grant select on public.catalog_variants, public.catalog_product_terms to anon, authenticated;
grant select, insert, update on public.retailer_offer_terms to weft_feed_importer;
grant select on public.catalog_variants, public.catalog_product_terms to weft_feed_importer;

commit;
