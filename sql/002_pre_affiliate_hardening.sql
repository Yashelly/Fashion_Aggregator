begin;

alter function public.set_updated_at()
  set search_path = pg_catalog;

create index if not exists idx_outbound_clicks_search_event
  on public.outbound_clicks (search_event_id);

create index if not exists idx_outbound_clicks_variant
  on public.outbound_clicks (variant_id);

create index if not exists idx_products_last_import_run
  on public.products (last_import_run_id);

create index if not exists idx_raw_feed_items_store
  on public.raw_feed_items (store_id);

commit;
