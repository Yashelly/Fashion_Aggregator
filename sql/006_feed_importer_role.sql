begin;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'weft_feed_importer') then
    create role weft_feed_importer
      login
      noinherit;
  end if;
end;
$$;

-- Supabase's supautils hook does not allow the project postgres role to alter
-- SUPERUSER/REPLICATION/BYPASSRLS attributes, even when setting them to false.
-- New roles already default to the safe values; fail closed if an existing
-- role has drifted instead of trying to normalize restricted attributes.
do $$
begin
  if exists (
    select 1
    from pg_roles
    where rolname = 'weft_feed_importer'
      and (
        not rolcanlogin
        or rolinherit
        or rolsuper
        or rolcreatedb
        or rolcreaterole
        or rolreplication
        or rolbypassrls
      )
  ) then
    raise exception 'weft_feed_importer has unsafe role attributes';
  end if;
end;
$$;

alter role weft_feed_importer connection limit 2;
alter role weft_feed_importer set statement_timeout = '2min';
alter role weft_feed_importer set lock_timeout = '15s';
alter role weft_feed_importer set idle_in_transaction_session_timeout = '60s';

revoke all on table
  public.stores,
  public.affiliate_program_rules,
  public.feed_import_runs,
  public.raw_feed_items,
  public.products
from weft_feed_importer;
revoke all on table
  private.catalog_product_rows,
  public.catalog_products
from weft_feed_importer;
revoke all on function private.refresh_catalog_product(uuid)
from weft_feed_importer;
revoke all on schema public, private from weft_feed_importer;

grant usage on schema public, private to weft_feed_importer;
grant select on table
  public.stores,
  public.affiliate_program_rules
to weft_feed_importer;
grant select, insert, update on table
  public.feed_import_runs,
  public.raw_feed_items,
  public.products
to weft_feed_importer;

-- The catalog projection functions are SECURITY INVOKER. The importer therefore
-- needs the same narrowly-scoped projection DML that its product triggers run.
-- This does not expose the private schema to anon/authenticated roles.
grant select, insert, update, delete on table
  private.catalog_product_rows
to weft_feed_importer;
grant execute on function private.refresh_catalog_product(uuid)
to weft_feed_importer;
grant select on table public.catalog_products to weft_feed_importer, service_role;

drop policy if exists "Feed importer reads eligible stores" on public.stores;
create policy "Feed importer reads eligible stores"
  on public.stores
  for select
  to weft_feed_importer
  using (
    public_listing_status = 'demo'
    or (
      affiliate_status = 'approved_feed'
      and feed_status in ('available_verified', 'importing')
    )
    or (
      affiliate_status = 'direct_permission'
      and feed_status <> 'paused'
    )
  );

drop policy if exists "Feed importer reads eligible program rules"
  on public.affiliate_program_rules;
create policy "Feed importer reads eligible program rules"
  on public.affiliate_program_rules
  for select
  to weft_feed_importer
  using (
    exists (
      select 1
      from public.stores
      where stores.id = affiliate_program_rules.store_id
    )
  );

drop policy if exists "Feed importer manages eligible import runs"
  on public.feed_import_runs;
create policy "Feed importer manages eligible import runs"
  on public.feed_import_runs
  for all
  to weft_feed_importer
  using (
    exists (
      select 1
      from public.stores
      where stores.id = feed_import_runs.store_id
        and (
          (
            feed_import_runs.source_type = 'manual_mock'
            and stores.public_listing_status = 'demo'
          )
          or (
            feed_import_runs.source_type = 'affiliate_feed'
            and stores.affiliate_status = 'approved_feed'
            and stores.feed_status in ('available_verified', 'importing')
          )
          or (
            feed_import_runs.source_type = 'direct_partner_feed'
            and stores.affiliate_status = 'direct_permission'
            and stores.feed_status <> 'paused'
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.stores
      where stores.id = feed_import_runs.store_id
        and (
          (
            feed_import_runs.source_type = 'manual_mock'
            and stores.public_listing_status = 'demo'
          )
          or (
            feed_import_runs.source_type = 'affiliate_feed'
            and stores.affiliate_status = 'approved_feed'
            and stores.feed_status in ('available_verified', 'importing')
          )
          or (
            feed_import_runs.source_type = 'direct_partner_feed'
            and stores.affiliate_status = 'direct_permission'
            and stores.feed_status <> 'paused'
          )
        )
    )
  );

drop policy if exists "Feed importer manages eligible raw items"
  on public.raw_feed_items;
create policy "Feed importer manages eligible raw items"
  on public.raw_feed_items
  for all
  to weft_feed_importer
  using (
    exists (
      select 1
      from public.stores
      where stores.id = raw_feed_items.store_id
    )
  )
  with check (
    exists (
      select 1
      from public.stores
      where stores.id = raw_feed_items.store_id
    )
  );

drop policy if exists "Feed importer manages eligible products"
  on public.products;
create policy "Feed importer manages eligible products"
  on public.products
  for all
  to weft_feed_importer
  using (
    exists (
      select 1
      from public.stores
      where stores.id = products.store_id
    )
  )
  with check (
    exists (
      select 1
      from public.stores
      where stores.id = products.store_id
    )
  );

drop policy if exists "Feed importer maintains eligible catalog rows"
  on private.catalog_product_rows;
create policy "Feed importer maintains eligible catalog rows"
  on private.catalog_product_rows
  for all
  to weft_feed_importer
  using (
    exists (
      select 1
      from public.products
      where products.id = catalog_product_rows.source_product_id
    )
  )
  with check (
    exists (
      select 1
      from public.products
      where products.id = catalog_product_rows.source_product_id
    )
  );

comment on role weft_feed_importer is
  'Credential-isolated feed runner. Set its password outside Git and connect through the Supabase pooler as weft_feed_importer.<project-ref>.';

commit;
