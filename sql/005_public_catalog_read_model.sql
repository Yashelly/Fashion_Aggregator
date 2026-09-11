begin;

alter table public.stores
  add column if not exists public_id text unique
  check (public_id is null or public_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.products
  add column if not exists subcategory text,
  add column if not exists style_tags text;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to service_role, anon, authenticated;

create table if not exists private.catalog_product_rows (
  source_product_id uuid primary key references public.products(id) on delete cascade,
  source_store_id uuid not null references public.stores(id) on delete cascade,
  public_product_id text not null unique,
  public_store_id text not null,
  source_status text not null,
  title text not null,
  category text not null,
  subcategory text not null default '',
  brand text not null default '',
  gender text not null default '',
  color text not null default '',
  size_options text not null default '',
  price_eur text not null,
  old_price_eur text not null default '',
  currency text not null,
  availability text not null,
  style_tags text not null default '',
  image_url text not null default '',
  mock_url text not null,
  notes text not null default '',
  refreshed_at timestamptz not null default now()
);

create index if not exists idx_catalog_product_rows_store
  on private.catalog_product_rows (public_store_id);

alter table private.catalog_product_rows enable row level security;
revoke all on table private.catalog_product_rows from public, anon, authenticated;
grant all on table private.catalog_product_rows to service_role;
grant select (
  public_product_id, public_store_id, source_status, title, category,
  subcategory, brand, gender, color, size_options, price_eur,
  old_price_eur, currency, availability, style_tags, image_url,
  mock_url, notes
) on private.catalog_product_rows to anon, authenticated;

drop policy if exists "Public catalog rows are readable"
  on private.catalog_product_rows;
create policy "Public catalog rows are readable"
  on private.catalog_product_rows
  for select
  to anon, authenticated
  using (true);

create or replace function private.refresh_catalog_product(target_product_id uuid)
returns void
language plpgsql
set search_path = pg_catalog
as $$
declare
  product_row public.products%rowtype;
  store_public_id text;
  store_listing_status text;
  route_product_id text;
begin
  select * into product_row
  from public.products
  where id = target_product_id;

  if not found then
    delete from private.catalog_product_rows
    where source_product_id = target_product_id;
    return;
  end if;

  select public_id, public_listing_status
  into store_public_id, store_listing_status
  from public.stores
  where id = product_row.store_id;

  if store_public_id is null
    or store_listing_status not in ('demo', 'live')
    or product_row.status not in ('active', 'demo', 'out_of_stock') then
    delete from private.catalog_product_rows
    where source_product_id = target_product_id;
    return;
  end if;

  route_product_id := case
    when store_listing_status = 'demo' then product_row.external_product_id
    else product_row.id::text
  end;

  insert into private.catalog_product_rows (
    source_product_id, source_store_id, public_product_id, public_store_id,
    source_status, title, category, subcategory, brand, gender, color,
    size_options, price_eur, old_price_eur, currency, availability,
    style_tags, image_url, mock_url, notes, refreshed_at
  ) values (
    product_row.id,
    product_row.store_id,
    route_product_id,
    store_public_id,
    case when store_listing_status = 'demo' then 'mock_not_live' else 'affiliate_live' end,
    product_row.title,
    coalesce(product_row.normalized_category, product_row.merchant_category, ''),
    coalesce(product_row.subcategory, ''),
    coalesce(product_row.brand, ''),
    coalesce(product_row.gender, ''),
    coalesce(product_row.normalized_color, product_row.color_label, ''),
    coalesce(product_row.size_summary, ''),
    coalesce(product_row.sale_price, product_row.price, 0)::text,
    case
      when product_row.sale_price is not null
        then coalesce(product_row.old_price, product_row.price, 0)::text
      else coalesce(product_row.old_price::text, '')
    end,
    product_row.currency::text,
    coalesce(
      nullif(product_row.availability, ''),
      case when product_row.in_stock then 'in_stock' else 'out_of_stock' end
    ),
    coalesce(product_row.style_tags, ''),
    coalesce(product_row.image_url, ''),
    '/out/' || route_product_id,
    case
      when store_listing_status = 'demo'
        then 'Synthetic demo item; not a real merchant product.'
      else ''
    end,
    now()
  )
  on conflict (source_product_id) do update set
    source_store_id = excluded.source_store_id,
    public_product_id = excluded.public_product_id,
    public_store_id = excluded.public_store_id,
    source_status = excluded.source_status,
    title = excluded.title,
    category = excluded.category,
    subcategory = excluded.subcategory,
    brand = excluded.brand,
    gender = excluded.gender,
    color = excluded.color,
    size_options = excluded.size_options,
    price_eur = excluded.price_eur,
    old_price_eur = excluded.old_price_eur,
    currency = excluded.currency,
    availability = excluded.availability,
    style_tags = excluded.style_tags,
    image_url = excluded.image_url,
    mock_url = excluded.mock_url,
    notes = excluded.notes,
    refreshed_at = excluded.refreshed_at;
end;
$$;

create or replace function private.sync_catalog_product_trigger()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if tg_op = 'DELETE' then
    delete from private.catalog_product_rows where source_product_id = old.id;
    return old;
  end if;
  perform private.refresh_catalog_product(new.id);
  return new;
end;
$$;

create or replace function private.sync_catalog_store_trigger()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  product_id uuid;
begin
  delete from private.catalog_product_rows where source_store_id = new.id;
  for product_id in select id from public.products where store_id = new.id loop
    perform private.refresh_catalog_product(product_id);
  end loop;
  return new;
end;
$$;

revoke all on function private.refresh_catalog_product(uuid) from public, anon, authenticated;
revoke all on function private.sync_catalog_product_trigger() from public, anon, authenticated;
revoke all on function private.sync_catalog_store_trigger() from public, anon, authenticated;
grant execute on function private.refresh_catalog_product(uuid) to service_role;
grant execute on function private.sync_catalog_product_trigger() to service_role;
grant execute on function private.sync_catalog_store_trigger() to service_role;

drop trigger if exists sync_catalog_product on public.products;
create trigger sync_catalog_product
after insert or update or delete on public.products
for each row execute function private.sync_catalog_product_trigger();

drop trigger if exists sync_catalog_store on public.stores;
create trigger sync_catalog_store
after update of public_id, public_listing_status on public.stores
for each row execute function private.sync_catalog_store_trigger();

do $$
declare
  product_id uuid;
begin
  for product_id in select id from public.products loop
    perform private.refresh_catalog_product(product_id);
  end loop;
end;
$$;

create or replace view public.catalog_products
with (security_invoker = true)
as
select
  public_product_id,
  public_store_id,
  source_status,
  title,
  category,
  subcategory,
  brand,
  gender,
  color,
  size_options,
  price_eur,
  old_price_eur,
  currency,
  availability,
  style_tags,
  image_url,
  mock_url,
  notes
from private.catalog_product_rows;

revoke all on public.catalog_products from public, anon, authenticated;
grant select on public.catalog_products to anon, authenticated;

comment on view public.catalog_products is
  'Least-privilege storefront read model. Internal store slugs, source UUIDs, feed URLs, and raw payloads are excluded.';

commit;
