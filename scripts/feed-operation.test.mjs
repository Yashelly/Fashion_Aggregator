import assert from "node:assert/strict";
import test from "node:test";
import { resolveFeedOperation } from "./feed-operation.mjs";

const baseEnv = {
  FEED_APPLY: "false",
  FEED_FULL_SNAPSHOT: "true",
  FEED_PROFILE: "weft-test-feed",
  FEED_SOURCE_TYPE: "affiliate_feed",
  FEED_SOURCE_URL: "https://feeds.example.invalid/catalog.csv?token=secret",
  FEED_STORE_SLUG: "internal_store",
  SUPABASE_URL: "https://project.supabase.co",
};

test("dry-run never forwards an ambient admin database URL", () => {
  const operation = resolveFeedOperation({
    ...baseEnv,
    SUPABASE_DB_URL: "postgresql://postgres:secret@localhost/postgres",
  });
  assert.equal(operation.apply, false);
  assert.equal(operation.childEnv.SUPABASE_DB_URL, undefined);
  assert.ok(operation.args.includes("--dry-run"));
});

test("apply accepts only the dedicated importer role", () => {
  assert.throws(
    () => resolveFeedOperation({
      ...baseEnv,
      FEED_APPLY: "true",
      FEED_APPLY_CONFIRMATION: "IMPORT_APPROVED_FEED",
      SUPABASE_IMPORT_DB_URL: "postgresql://postgres.project:secret@pooler.invalid:5432/postgres",
    }),
    /must use the weft_feed_importer role/,
  );

  const operation = resolveFeedOperation({
    ...baseEnv,
    FEED_APPLY: "true",
    FEED_APPLY_CONFIRMATION: "IMPORT_APPROVED_FEED",
    SUPABASE_IMPORT_DB_URL: "postgresql://weft_feed_importer.project:secret@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
  });
  assert.equal(operation.childEnv.SUPABASE_DB_URL, operation.childEnv.SUPABASE_IMPORT_DB_URL);
  assert.ok(operation.args.includes("--apply"));

  assert.throws(
    () => resolveFeedOperation({
      ...baseEnv,
      FEED_APPLY: "true",
      FEED_APPLY_CONFIRMATION: "IMPORT_APPROVED_FEED",
      SUPABASE_IMPORT_DB_URL: "postgresql://weft_feed_importer.other:secret@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
    }),
    /for this project/,
  );
});

test("apply requires an explicit production confirmation", () => {
  assert.throws(
    () => resolveFeedOperation({
      ...baseEnv,
      FEED_APPLY: "true",
      SUPABASE_IMPORT_DB_URL: "postgresql://weft_feed_importer.project:secret@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
    }),
    /IMPORT_APPROVED_FEED/,
  );
});

test("operation rejects unsafe dynamic inputs", () => {
  assert.throws(
    () => resolveFeedOperation({ ...baseEnv, FEED_PROFILE: "../../secret" }),
    /invalid name/,
  );
  assert.throws(
    () => resolveFeedOperation({ ...baseEnv, FEED_STORE_SLUG: "store; echo leaked" }),
    /invalid value/,
  );
  assert.throws(
    () => resolveFeedOperation({ ...baseEnv, FEED_SOURCE_TYPE: "manual_mock" }),
    /not production-safe/,
  );
  assert.throws(
    () => resolveFeedOperation({ ...baseEnv, FEED_SOURCE_URL: "http://feeds.example.invalid/feed.csv" }),
    /must be HTTPS/,
  );
});
