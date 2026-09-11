import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildImportPlan,
  classifyProductChange,
  parseDelimitedRecords,
  parseJsonRecords,
  parseXmlRecords,
} from "./feed-import-core.mjs";
import {
  assertProgramRules,
  assertStoreCanImport,
} from "./feed-import-postgres.mjs";

const rootDir = process.cwd();
const config = JSON.parse(fs.readFileSync(
  path.join(rootDir, "data", "feed-configs", "weft-test-feed.json"),
  "utf8",
));
const fixture = fs.readFileSync(
  path.join(rootDir, "data", "feed-fixtures", "weft-test-feed.csv"),
  "utf8",
);

test("test fixture produces a reviewable, apply-safe plan", () => {
  const plan = buildImportPlan(fixture, config);

  assert.deepEqual(plan.summary, {
    canApply: true,
    invalidRate: 0.2,
    invalidRows: 1,
    publicRows: 4,
    skippedRows: 0,
    totalRows: 5,
    validRows: 4,
    warningRows: 0,
  });
  assert.equal(plan.rows[0].normalizedPayload.price, 129.9);
  assert.equal(plan.rows[0].normalizedPayload.normalized_category, "jackets");
  assert.equal(plan.rows[2].normalizedPayload.status, "out_of_stock");
  assert.deepEqual(plan.rows[4].validationErrors, ["missing_external_product_id"]);
});

test("delimited parser handles multiline quoted values and TSV", () => {
  const csv = parseDelimitedRecords('id,description\n1,"line one\nline two"\n');
  assert.equal(csv[0].description, "line one\nline two");
  const tsv = parseDelimitedRecords("id\tname\n1\tTest\n", "\t");
  assert.deepEqual(tsv, [{ id: "1", name: "Test" }]);
  assert.throws(() => parseDelimitedRecords("id,name\n1\n"), /expected 2/);
});

test("JSON parser supports an explicit record path", () => {
  const rows = parseJsonRecords('{"payload":{"offers":[{"id":"1"}]}}', "payload.offers");
  assert.deepEqual(rows, [{ id: "1" }]);
});

test("XML parser reads flat item feeds and rejects entity declarations", () => {
  const rows = parseXmlRecords("<feed><offer><id>1</id><name><![CDATA[Test &amp; Co]]></name></offer></feed>", "offer");
  assert.deepEqual(rows, [{ id: "1", name: "Test & Co" }]);
  assert.throws(
    () => parseXmlRecords('<!DOCTYPE feed [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><feed/>'),
    /not allowed/,
  );
});

test("content hashes make insert, update, and unchanged decisions deterministic", () => {
  const first = buildImportPlan(fixture, config);
  const second = buildImportPlan(fixture, config);
  const hash = first.rows[0].contentHash;

  assert.equal(first.feedHash, second.feedHash);
  assert.equal(classifyProductChange(null, hash), "inserted");
  assert.equal(classifyProductChange(hash, hash), "unchanged");
  assert.equal(classifyProductChange("different", hash), "updated");
});

test("unsafe destinations and duplicate product identities are invalid", () => {
  const unsafe = fixture.replace(
    "https://merchant.invalid/products/test-002",
    "http://merchant.invalid/products/test-002",
  ).replace("TEST-003,BAG-003", "TEST-002,BAG-003");
  const plan = buildImportPlan(unsafe, config);

  assert.ok(plan.rows[1].validationErrors.includes("invalid_product_url"));
  assert.ok(plan.rows[2].validationErrors.includes("duplicate_external_product_id"));
});

test("a row without an image is audited but excluded from public product writes", () => {
  const withoutImage = fixture.replace(
    "https://merchant.invalid/images/test-003.webp",
    "",
  );
  const plan = buildImportPlan(withoutImage, config);

  assert.equal(plan.rows[2].validationStatus, "skipped");
  assert.ok(plan.rows[2].validationErrors.includes("missing_image_url"));
  assert.equal(plan.summary.publicRows, 3);
});

test("apply policy requires an approved store and compatible program rules", () => {
  const approved = {
    affiliate_status: "approved_feed",
    feed_status: "available_verified",
    public_listing_status: "hidden",
    slug: "approved-store",
  };
  assert.doesNotThrow(() => assertStoreCanImport(approved, "affiliate_feed"));
  assert.throws(
    () => assertStoreCanImport({ ...approved, affiliate_status: "applied" }, "affiliate_feed"),
    /not approved/,
  );
  const rows = [{ normalizedPayload: { affiliate_url: "https://affiliate.invalid/item" }, validationStatus: "valid" }];
  assert.doesNotThrow(() => assertProgramRules({
    content_allowed: true,
    deeplinking_allowed: true,
    product_feed_available: true,
  }, "affiliate_feed", rows));
  assert.throws(() => assertProgramRules({
    content_allowed: true,
    deeplinking_allowed: false,
    product_feed_available: true,
  }, "affiliate_feed", rows), /deeplinking/);
});

test("mapping profiles cannot carry feed credentials", () => {
  assert.throws(
    () => buildImportPlan(fixture, { ...config, token: "must-not-be-committed" }),
    /must not contain secret\/source field/,
  );
});
