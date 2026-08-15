/**
 * Full-stack integration smoke test — the frontend/backend boundary, end to end.
 *
 * Unlike the unit tests (pure functions) and the search eval (ranking only), this
 * boots the real production server (`next start`) and drives it over HTTP, so it
 * proves the pieces are wired together: a search request renders real catalog
 * results, a product's on-site preview guard resolves (and 404s for unknown ids),
 * and the synthetic click-intent endpoint enforces its security contract —
 * accepting a valid same-origin POST (202) and rejecting a cross-origin one (403),
 * an unknown product (404), and an oversized body (413).
 *
 * Deliberately NOT a browser/E2E framework and NOT a required CI gate (it needs a
 * production build and a live port, like the Playwright locale suite). Run it
 * before merging:
 *
 *   npm run build
 *   npm run test:integration
 *
 * No dependencies beyond Node's built-in fetch and child_process.
 */

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";

const PORT = Number(process.env.SMOKE_PORT || 3111);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const isWindows = process.platform === "win32";

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? `  — ${detail}` : ""}`);
  }
}

async function waitForReady(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${ORIGIN}/`, { headers: { "accept-language": "en" } });
      if (response.ok) return true;
    } catch {
      // server not up yet
    }
    await sleep(500);
  }
  return false;
}

function startServer() {
  // Run the local Next binary through node directly — avoids spawning an
  // npx/.cmd shim, which Node refuses on Windows (EINVAL) and which complicates
  // process-tree teardown everywhere.
  const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: !isWindows,
    env: process.env,
  });
  child.stdout.on("data", () => {});
  child.stderr.on("data", (data) => process.stderr.write(`[next] ${data}`));
  return child;
}

function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  if (isWindows) {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

const sameOrigin = { "content-type": "application/json", origin: ORIGIN };

async function run() {
  // 1. Landing page renders.
  const home = await fetch(`${ORIGIN}/?lang=en`);
  check("GET / renders (200)", home.status === 200, `status ${home.status}`);

  // 2. Search renders a real catalog result (wool coat -> the wool coats).
  const search = await fetch(`${ORIGIN}/search?query=${encodeURIComponent("wool coat")}&lang=en`);
  const searchHtml = await search.text();
  check("GET /search returns 200", search.status === 200, `status ${search.status}`);
  check(
    "search for 'wool coat' renders a wool coat",
    /Wool Blend Coat|Longline Coat/i.test(searchHtml),
    "expected a known coat title in the HTML",
  );

  // 3. Product on-site preview guard resolves for a valid id and 404s otherwise.
  const validOut = await fetch(`${ORIGIN}/out/MOCK-045`, { redirect: "manual" });
  check("GET /out/MOCK-045 resolves (200, no external redirect)", validOut.status === 200, `status ${validOut.status}`);
  const unknownOut = await fetch(`${ORIGIN}/out/NOT-A-PRODUCT`, { redirect: "manual" });
  check("GET /out/<unknown> is 404", unknownOut.status === 404, `status ${unknownOut.status}`);

  // 4. Click-intent endpoint — the security contract.
  const validClick = await fetch(`${ORIGIN}/api/analytics/click`, {
    method: "POST",
    headers: sameOrigin,
    body: JSON.stringify({ productId: "MOCK-045", placement: "integration_test" }),
  });
  check("POST /api/analytics/click same-origin + valid id → 202", validClick.status === 202, `status ${validClick.status}`);

  const crossOrigin = await fetch(`${ORIGIN}/api/analytics/click`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://evil.example" },
    body: JSON.stringify({ productId: "MOCK-045" }),
  });
  check("POST /api/analytics/click cross-origin → 403", crossOrigin.status === 403, `status ${crossOrigin.status}`);

  const unknownProduct = await fetch(`${ORIGIN}/api/analytics/click`, {
    method: "POST",
    headers: sameOrigin,
    body: JSON.stringify({ productId: "MOCK-999" }),
  });
  check("POST /api/analytics/click unknown product → 404", unknownProduct.status === 404, `status ${unknownProduct.status}`);

  const oversized = await fetch(`${ORIGIN}/api/analytics/click`, {
    method: "POST",
    headers: sameOrigin,
    body: JSON.stringify({ productId: "MOCK-045", placement: "x".repeat(4096) }),
  });
  check("POST /api/analytics/click oversized body → 413", oversized.status === 413, `status ${oversized.status}`);
}

const server = startServer();
let exitCode = 1;
try {
  const ready = await waitForReady();
  if (!ready) {
    console.error("Server did not become ready in time. Did you run `npm run build` first?");
  } else {
    console.log(`Integration smoke against ${ORIGIN}`);
    await run();
    console.log(`\n${passed} passed, ${failed} failed`);
    exitCode = failed === 0 ? 0 : 1;
  }
} catch (error) {
  console.error("Integration smoke crashed:", error);
} finally {
  stopServer(server);
}

// Give the kill signal a moment before exiting.
await sleep(500);
process.exit(exitCode);
