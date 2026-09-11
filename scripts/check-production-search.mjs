const BASE_URL = process.env.SEARCH_PROBE_BASE_URL?.trim()
  || "https://fashion-aggregator-flame.vercel.app";
const TIMEOUT_MS = 20_000;

const allProbes = [
  {
    id: "hybrid-semantic-neck-wrap",
    query: "soft fringed wrap for the neck",
    expectedIds: ["MOCK-056"],
  },
  {
    id: "hybrid-semantic-waist-carrier",
    query: "hands-free silver carrier worn around the middle",
    expectedIds: ["MOCK-040"],
  },
  {
    id: "hybrid-strict-negative",
    query: "a shoulder bag with neither strap nor handles",
    expectedIds: [],
  },
];
const probes = process.argv.includes("--scheduled")
  ? allProbes.filter((probe) => probe.id === "hybrid-strict-negative")
  : allProbes;

function productIds(html) {
  return [...html.matchAll(/href="\/out\/(MOCK-[0-9]+)"/g)]
    .map((match) => match[1])
    .filter((id, index, ids) => ids.indexOf(id) === index);
}

async function runProbe(probe) {
  const url = new URL("/search", BASE_URL);
  url.searchParams.set("query", probe.query);
  const startedAt = performance.now();
  const response = await fetch(url, {
    headers: { "user-agent": "weft-production-search-monitor/1.0" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const html = await response.text();
  const actualIds = productIds(html);
  const passed = response.ok
    && JSON.stringify(actualIds) === JSON.stringify(probe.expectedIds);
  return {
    actualIds,
    durationMs: Math.round(performance.now() - startedAt),
    expectedIds: probe.expectedIds,
    id: probe.id,
    passed,
    status: response.status,
  };
}

const base = new URL(BASE_URL);
if (base.protocol !== "https:") {
  throw new Error("SEARCH_PROBE_BASE_URL must use HTTPS");
}

const results = [];
for (const probe of probes) {
  const result = await runProbe(probe);
  results.push(result);
  console.log(JSON.stringify(result));
}

const failed = results.filter((result) => !result.passed);
if (failed.length > 0) {
  console.error(`Production hybrid search probe failed: ${failed.map((result) => result.id).join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Production hybrid search confirmed: ${results.length}/${results.length} probes passed`);
}
