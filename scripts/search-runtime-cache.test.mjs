import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);

function loadCache() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "lib", "search-runtime-cache.ts"),
    "utf8",
  );
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  new Function("exports", "module", "require", transpiled)(
    moduleScope.exports,
    moduleScope,
    require,
  );
  return moduleScope.exports.SearchRuntimeCache;
}

const SearchRuntimeCache = loadCache();

test("retains only cacheable values until TTL expiry", async () => {
  let now = 1_000;
  let loads = 0;
  const cache = new SearchRuntimeCache({ maxEntries: 2, now: () => now, ttlMs: 100 });
  const load = async () => ({ cacheable: true, value: ++loads });

  assert.deepEqual(await cache.getOrLoad("a", load), { cacheable: true, status: "miss", value: 1 });
  assert.deepEqual(await cache.getOrLoad("a", load), { cacheable: true, status: "hit", value: 1 });
  now += 101;
  assert.deepEqual(await cache.getOrLoad("a", load), { cacheable: true, status: "miss", value: 2 });

  const uncached = async () => ({ cacheable: false, value: ++loads });
  assert.equal((await cache.getOrLoad("b", uncached)).value, 3);
  assert.equal((await cache.getOrLoad("b", uncached)).value, 4);
});

test("coalesces concurrent loads without retaining fallback-equivalent output", async () => {
  let release;
  let loads = 0;
  const cache = new SearchRuntimeCache({ maxEntries: 2, ttlMs: 1_000 });
  const load = () => {
    loads += 1;
    return new Promise((resolve) => {
      release = () => resolve({ cacheable: false, value: "fallback" });
    });
  };

  const first = cache.getOrLoad("same", load);
  const second = cache.getOrLoad("same", load);
  release();

  assert.equal((await first).status, "miss");
  assert.equal((await second).status, "shared");
  assert.equal(loads, 1);
  const retry = await cache.getOrLoad(
    "same",
    async () => ({ cacheable: false, value: "retry" }),
  );
  assert.equal(retry.status, "miss");
  assert.equal(retry.value, "retry");
});

test("evicts the least recently used entry", async () => {
  let loads = 0;
  const cache = new SearchRuntimeCache({ maxEntries: 2, ttlMs: 1_000 });
  const load = async () => ({ cacheable: true, value: ++loads });

  await cache.getOrLoad("a", load);
  await cache.getOrLoad("b", load);
  await cache.getOrLoad("a", load);
  await cache.getOrLoad("c", load);
  const reloaded = await cache.getOrLoad("b", load);

  assert.equal(reloaded.status, "miss");
  assert.equal(reloaded.value, 4);
});
