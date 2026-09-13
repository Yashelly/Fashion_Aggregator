"use strict";

// Test-process-only fault injector. It is loaded with Node --require on a
// dedicated localhost Next process; the application exposes no simulation URL.
const fs = require("node:fs");
const path = require("node:path");
const { syncBuiltinESMExports } = require("node:module");
const { parseCsvLine, parseCsvRecords } = require("./csv.mjs");

const allowedRoot = path.resolve(process.cwd(), ".omx", "artifacts", "frontend", "qa-browser");
const catalogPath = path.resolve(process.cwd(), "data", "mock_products.csv");
const configuredFlag = process.env.WEFT_QA_CATALOG_FAULT_FLAG;

if (!configuredFlag) {
  throw new Error("WEFT_QA_CATALOG_FAULT_FLAG is required by catalog-fault.cjs");
}

const flagPath = path.resolve(configuredFlag);
if (path.dirname(flagPath) !== allowedRoot || path.basename(flagPath) !== "catalog-fault.enabled") {
  throw new Error("Catalog fault marker must be the dedicated qa-browser artifact flag");
}
process.stderr.write(`[qa-catalog-fault] preload active pid=${process.pid}\n`);

const originalReadFileSync = fs.readFileSync.bind(fs);
const originalStatSync = fs.statSync.bind(fs);
const originalExistsSync = fs.existsSync.bind(fs);
function fixtureMode() {
  return originalExistsSync(flagPath) ? originalReadFileSync(flagPath, "utf8").trim() : "";
}
const unavailableImages = new Set([
  path.resolve(process.cwd(), "public", "demo-products", "product-01.webp"),
  path.resolve(process.cwd(), "public", "demo-products", "product-01-tryon.webp"),
]);
fs.existsSync = function qaImageExistsSync(file) {
  if (typeof file === "string" && unavailableImages.has(path.resolve(file)) && fixtureMode() === "sparse") return false;
  return originalExistsSync(file);
};
// The catalog checks mtime before reading; fail that same exact-file boundary
// too, including when Next warmed a module-level parsed-catalog cache.
fs.statSync = function qaCatalogStatSync(file, ...args) {
  const resolved = typeof file === "string" || Buffer.isBuffer(file)
    ? path.resolve(String(file))
    : null;
  if (resolved === catalogPath && fixtureMode() === "error") {
    process.stderr.write("[qa-catalog-fault] observed exact catalog stat fault\n");
    const error = new Error("Controlled QA catalog access failure");
    error.code = "EIO";
    throw error;
  }
  return originalStatSync(file, ...args);
};
fs.readFileSync = function qaCatalogReadFileSync(file, ...args) {
  const resolved = typeof file === "string" || Buffer.isBuffer(file)
    ? path.resolve(String(file))
    : null;
  if (resolved && path.basename(resolved) === "mock_products.csv") {
    process.stderr.write(`[qa-catalog-fault] observed catalog read; exact=${resolved === catalogPath}; marker=${fs.existsSync(flagPath)}\n`);
  }
  if (resolved === catalogPath && fixtureMode() === "sparse") {
    const raw = originalReadFileSync(file, "utf8");
    const headers = parseCsvLine(raw.trim().split(/\r?\n/)[0]);
    const records = parseCsvRecords(raw);
    const target = records.find((row) => row.mock_product_id === "MOCK-001");
    if (!target) throw new Error("Sparse fixture target is absent");
    for (const key of ["brand", "gender", "color", "size_options", "price_eur", "old_price_eur", "availability", "style_tags", "notes", "image_url"]) target[key] = "";
    const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [headers.map(quote).join(","), ...records.map((row) => headers.map((key) => quote(row[key])).join(","))].join("\n");
    process.stderr.write("[qa-catalog-fault] served isolated sparse MOCK-001 fixture\n");
    return typeof args[0] === "string" || args[0]?.encoding ? csv : Buffer.from(csv);
  }
  if (resolved === catalogPath && fixtureMode() === "error") {
    const error = new Error("Controlled QA catalog read failure");
    error.code = "EIO";
    throw error;
  }
  return originalReadFileSync(file, ...args);
};
syncBuiltinESMExports();
try {
  fs.readFileSync(catalogPath, "utf8");
} catch (error) {
  process.stderr.write(`[qa-catalog-fault] self-check=${error && error.code === "EIO"}\n`);
}
