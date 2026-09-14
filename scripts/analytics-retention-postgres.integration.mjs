import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const rootDir = process.cwd();
const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");

const parsedDatabaseUrl = new URL(databaseUrl);
if (!new Set(["127.0.0.1", "::1", "localhost"]).has(parsedDatabaseUrl.hostname)) {
  throw new Error("Refusing to run analytics retention tests against a non-local database");
}
if (parsedDatabaseUrl.pathname !== "/weft_test") {
  throw new Error("Analytics retention tests require the dedicated weft_test database");
}

const sql = postgres(databaseUrl, { max: 1, prepare: false, ssl: false });
const oldSearchA = "70000000-0000-4000-8000-000000000001";
const oldSearchB = "70000000-0000-4000-8000-000000000002";
const recentSearch = "70000000-0000-4000-8000-000000000003";
const oldClick = "70000000-0000-4000-8000-000000000004";
const recentClick = "70000000-0000-4000-8000-000000000005";
const metricDate = "2000-01-01";

async function runRetentionAsServiceRole() {
  return sql.begin(async (transaction) => {
    await transaction.unsafe("set local role service_role");
    const [result] = await transaction`
      select
        search_events_deleted::integer,
        outbound_clicks_deleted::integer
      from public.enforce_anonymous_analytics_retention()
    `;
    return result;
  });
}

try {
  await sql.unsafe(fs.readFileSync(
    path.join(rootDir, "sql", "007_anonymous_analytics_retention.sql"),
    "utf8",
  ));

  await sql`delete from public.outbound_clicks where id in (${oldClick}, ${recentClick})`;
  await sql`delete from public.search_events where id in (${oldSearchA}, ${oldSearchB}, ${recentSearch})`;
  await sql`delete from public.analytics_daily_aggregates where metric_date = ${metricDate}`;

  await sql`
    insert into public.search_events (id, query_text, result_count, created_at)
    values
      (${oldSearchA}, 'must not survive retention', 0, ${`${metricDate}T08:00:00Z`}),
      (${oldSearchB}, 'must not survive retention either', 5, ${`${metricDate}T09:00:00Z`}),
      (${recentSearch}, 'recent raw event', 3, now() - interval '28 days')
  `;
  await sql`
    insert into public.outbound_clicks (
      id, clicked_at, search_event_id, affiliate_subid, destination_url, redirect_status
    ) values
      (
        ${oldClick}, ${`${metricDate}T10:00:00Z`}, ${oldSearchA},
        'retention-test-old', 'https://example.invalid/blocked', 'blocked'
      ),
      (
        ${recentClick}, now() - interval '28 days', ${oldSearchB},
        'retention-test-recent', 'https://example.invalid/pending', 'pending'
      )
  `;

  const firstRun = await runRetentionAsServiceRole();
  assert.deepEqual(firstRun, {
    search_events_deleted: 2,
    outbound_clicks_deleted: 1,
  });

  const [aggregate] = await sql`
    select
      search_count::integer,
      zero_result_search_count::integer,
      search_result_count::integer,
      outbound_click_count::integer,
      pending_click_count::integer,
      redirected_click_count::integer,
      blocked_click_count::integer,
      failed_click_count::integer
    from public.analytics_daily_aggregates
    where metric_date = ${metricDate}
  `;
  assert.deepEqual(aggregate, {
    search_count: 2,
    zero_result_search_count: 1,
    search_result_count: 5,
    outbound_click_count: 1,
    pending_click_count: 0,
    redirected_click_count: 0,
    blocked_click_count: 1,
    failed_click_count: 0,
  });

  const [rawState] = await sql`
    select
      (select count(*)::integer from public.search_events
        where id in (${oldSearchA}, ${oldSearchB})) as old_searches,
      (select count(*)::integer from public.search_events
        where id = ${recentSearch}) as recent_searches,
      (select count(*)::integer from public.outbound_clicks
        where id = ${oldClick}) as old_clicks,
      (select count(*)::integer from public.outbound_clicks
        where id = ${recentClick}) as recent_clicks,
      (select count(*)::integer from public.outbound_clicks
        where id = ${recentClick} and search_event_id is null) as detached_recent_clicks
  `;
  assert.deepEqual(rawState, {
    old_searches: 0,
    recent_searches: 1,
    old_clicks: 0,
    recent_clicks: 1,
    detached_recent_clicks: 1,
  });

  const secondRun = await runRetentionAsServiceRole();
  assert.deepEqual(secondRun, {
    search_events_deleted: 0,
    outbound_clicks_deleted: 0,
  });
  const [{ search_count: searchCount, outbound_click_count: clickCount }] = await sql`
    select search_count::integer, outbound_click_count::integer
    from public.analytics_daily_aggregates
    where metric_date = ${metricDate}
  `;
  assert.equal(searchCount, 2);
  assert.equal(clickCount, 1);

  const [privileges] = await sql`
    select
      has_table_privilege('anon', 'public.analytics_daily_aggregates', 'select')
        as anon_can_read,
      has_table_privilege('authenticated', 'public.analytics_daily_aggregates', 'select')
        as authenticated_can_read,
      has_table_privilege('service_role', 'public.analytics_daily_aggregates', 'select')
        as service_role_can_read,
      has_table_privilege('service_role', 'public.analytics_daily_aggregates', 'insert')
        as service_role_can_insert,
      has_function_privilege(
        'anon', 'public.enforce_anonymous_analytics_retention()', 'execute'
      ) as anon_can_execute,
      has_function_privilege(
        'service_role', 'public.enforce_anonymous_analytics_retention()', 'execute'
      ) as service_role_can_execute
  `;
  assert.deepEqual(privileges, {
    anon_can_read: false,
    authenticated_can_read: false,
    service_role_can_read: true,
    service_role_can_insert: false,
    anon_can_execute: false,
    service_role_can_execute: true,
  });

  console.log("Anonymous analytics retention PostgreSQL integration: PASS");
  console.log(JSON.stringify({ aggregateDays: 1, clicksDeleted: 1, searchesDeleted: 2 }));
} finally {
  await sql.end();
}
