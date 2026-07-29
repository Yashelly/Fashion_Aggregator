begin;

alter table public.outbound_clicks
  alter column store_id drop not null;

comment on column public.outbound_clicks.store_id is
  'Nullable for blocked synthetic-preview clicks. Required before any approved live merchant redirect is recorded.';

commit;
