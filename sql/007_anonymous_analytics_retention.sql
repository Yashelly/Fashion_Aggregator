begin;

create table if not exists public.analytics_daily_aggregates (
  metric_date date primary key,
  search_count bigint not null default 0 check (search_count >= 0),
  zero_result_search_count bigint not null default 0
    check (zero_result_search_count >= 0),
  search_result_count bigint not null default 0
    check (search_result_count >= 0),
  outbound_click_count bigint not null default 0
    check (outbound_click_count >= 0),
  pending_click_count bigint not null default 0
    check (pending_click_count >= 0),
  redirected_click_count bigint not null default 0
    check (redirected_click_count >= 0),
  blocked_click_count bigint not null default 0
    check (blocked_click_count >= 0),
  failed_click_count bigint not null default 0
    check (failed_click_count >= 0),
  updated_at timestamptz not null default now(),
  check (
    outbound_click_count = pending_click_count
      + redirected_click_count
      + blocked_click_count
      + failed_click_count
  )
);

comment on table public.analytics_daily_aggregates is
  'Anonymous daily analytics totals retained after raw search and click events expire. Contains no user, session, query, filter, product, URL, or network identifiers.';

alter table public.analytics_daily_aggregates enable row level security;

revoke all privileges on table public.analytics_daily_aggregates
from public, anon, authenticated, service_role;

grant select on table public.analytics_daily_aggregates to service_role;

create or replace function public.enforce_anonymous_analytics_retention()
returns table (
  cutoff_at timestamptz,
  search_events_deleted bigint,
  outbound_clicks_deleted bigint
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  -- The one-day safety margin keeps raw rows within a 30-day maximum when the
  -- externally managed job is guaranteed to complete at least every 24 hours.
  retention_cutoff constant timestamptz := clock_timestamp() - interval '29 days';
  deleted_search_events bigint := 0;
  deleted_outbound_clicks bigint := 0;
begin
  -- Serialize runs so aggregate increments and raw-row deletion stay exactly once.
  perform pg_catalog.pg_advisory_xact_lock(20060913, 30);

  with deleted_events as (
    delete from public.outbound_clicks
    where outbound_clicks.clicked_at < retention_cutoff
    returning clicked_at, redirect_status
  ),
  daily_metrics as (
    select
      (deleted_events.clicked_at at time zone 'UTC')::date as metric_date,
      count(*) as outbound_click_count,
      count(*) filter (where deleted_events.redirect_status = 'pending')
        as pending_click_count,
      count(*) filter (where deleted_events.redirect_status = 'redirected')
        as redirected_click_count,
      count(*) filter (where deleted_events.redirect_status = 'blocked')
        as blocked_click_count,
      count(*) filter (where deleted_events.redirect_status = 'failed')
        as failed_click_count
    from deleted_events
    group by (deleted_events.clicked_at at time zone 'UTC')::date
  ),
  upserted_metrics as (
    insert into public.analytics_daily_aggregates (
      metric_date,
      outbound_click_count,
      pending_click_count,
      redirected_click_count,
      blocked_click_count,
      failed_click_count
    )
    select
      daily_metrics.metric_date,
      daily_metrics.outbound_click_count,
      daily_metrics.pending_click_count,
      daily_metrics.redirected_click_count,
      daily_metrics.blocked_click_count,
      daily_metrics.failed_click_count
    from daily_metrics
    on conflict (metric_date) do update
    set outbound_click_count = public.analytics_daily_aggregates.outbound_click_count
          + excluded.outbound_click_count,
        pending_click_count = public.analytics_daily_aggregates.pending_click_count
          + excluded.pending_click_count,
        redirected_click_count =
          public.analytics_daily_aggregates.redirected_click_count
          + excluded.redirected_click_count,
        blocked_click_count = public.analytics_daily_aggregates.blocked_click_count
          + excluded.blocked_click_count,
        failed_click_count = public.analytics_daily_aggregates.failed_click_count
          + excluded.failed_click_count,
        updated_at = clock_timestamp()
    returning metric_date
  )
  select coalesce(sum(daily_metrics.outbound_click_count), 0)::bigint
  into deleted_outbound_clicks
  from daily_metrics, lateral (select count(*) from upserted_metrics) as applied;

  with deleted_events as (
    delete from public.search_events
    where search_events.created_at < retention_cutoff
    returning created_at, result_count
  ),
  daily_metrics as (
    select
      (deleted_events.created_at at time zone 'UTC')::date as metric_date,
      count(*) as search_count,
      count(*) filter (where deleted_events.result_count = 0)
        as zero_result_search_count,
      coalesce(sum(deleted_events.result_count), 0) as search_result_count
    from deleted_events
    group by (deleted_events.created_at at time zone 'UTC')::date
  ),
  upserted_metrics as (
    insert into public.analytics_daily_aggregates (
      metric_date,
      search_count,
      zero_result_search_count,
      search_result_count
    )
    select
      daily_metrics.metric_date,
      daily_metrics.search_count,
      daily_metrics.zero_result_search_count,
      daily_metrics.search_result_count
    from daily_metrics
    on conflict (metric_date) do update
    set search_count = public.analytics_daily_aggregates.search_count
          + excluded.search_count,
        zero_result_search_count =
          public.analytics_daily_aggregates.zero_result_search_count
          + excluded.zero_result_search_count,
        search_result_count = public.analytics_daily_aggregates.search_result_count
          + excluded.search_result_count,
        updated_at = clock_timestamp()
    returning metric_date
  )
  select coalesce(sum(daily_metrics.search_count), 0)::bigint
  into deleted_search_events
  from daily_metrics, lateral (select count(*) from upserted_metrics) as applied;

  return query
  select retention_cutoff, deleted_search_events, deleted_outbound_clicks;
end;
$$;

comment on function public.enforce_anonymous_analytics_retention() is
  'Aggregates and deletes raw anonymous search/click events older than 29 days, providing one day of scheduling margin for a 30-day maximum. This migration does not activate a production scheduler.';

revoke execute on function public.enforce_anonymous_analytics_retention()
from public, anon, authenticated;

grant execute on function public.enforce_anonymous_analytics_retention()
to service_role;

commit;
