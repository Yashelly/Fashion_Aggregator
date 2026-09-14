begin;

-- 005 is already applied in deployed databases; keep this additive migration
-- so existing read models gain the optional facts without replaying history.
alter table private.catalog_product_rows
  add column if not exists image_gallery text not null default '',
  add column if not exists description text not null default '',
  add column if not exists material text not null default '',
  add column if not exists surface text not null default '',
  add column if not exists construction_details text not null default '',
  add column if not exists size_system text not null default '',
  add column if not exists measurement_source text not null default '',
  add column if not exists fit_note text not null default '';

update private.catalog_product_rows row
set image_gallery = coalesce(nullif(row.image_gallery, ''), product.image_url, ''),
    description = coalesce(nullif(row.description, ''), product.description, ''),
    material = coalesce(nullif(row.material, ''), product.material, '')
from public.products product
where product.id = row.source_product_id;

create or replace function private.sync_catalog_product_facts()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  update private.catalog_product_rows
  set image_gallery = coalesce(new.image_url, ''),
      description = coalesce(new.description, ''),
      material = coalesce(new.material, '')
  where source_product_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_catalog_product_facts on public.products;
create trigger sync_catalog_product_facts
after insert or update of image_url, description, material on public.products
for each row execute function private.sync_catalog_product_facts();

revoke all on function private.sync_catalog_product_facts() from public, anon, authenticated;
grant execute on function private.sync_catalog_product_facts() to service_role;

grant select (
  public_product_id, public_store_id, source_status, title, category,
  subcategory, brand, gender, color, size_options, price_eur,
  old_price_eur, currency, availability, style_tags, image_url,
  mock_url, notes, image_gallery, description, material, surface,
  construction_details, size_system, measurement_source, fit_note
) on private.catalog_product_rows to anon, authenticated;

create or replace view public.catalog_products
with (security_invoker = true)
as
select
  public_product_id, public_store_id, source_status, title, category,
  subcategory, brand, gender, color, size_options, price_eur,
  old_price_eur, currency, availability, style_tags, image_url,
  mock_url, notes, image_gallery, description, material, surface,
  construction_details, size_system, measurement_source, fit_note
from private.catalog_product_rows;

revoke all on public.catalog_products from public, anon, authenticated;
grant select on public.catalog_products to anon, authenticated;

commit;
