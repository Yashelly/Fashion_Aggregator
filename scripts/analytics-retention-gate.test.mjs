import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const compilerOptions = { module: "CommonJS", target: "ES2022" };

function transpile(file) {
  return require("typescript").transpileModule(
    fs.readFileSync(path.join(rootDir, file), "utf8"),
    { compilerOptions },
  ).outputText;
}

function loadAnalytics() {
  const moduleScope = { exports: {} };
  new Function("exports", "module", "require", transpile("lib/analytics.ts"))(
    moduleScope.exports,
    moduleScope,
    (specifier) => specifier === "server-only" ? {} : require(specifier),
  );
  return moduleScope.exports;
}

function loadAnalyticsStorage(analytics, getSupabaseServerClient) {
  const moduleScope = { exports: {} };
  new Function(
    "exports",
    "module",
    "require",
    transpile("lib/analytics-storage.ts"),
  )(
    moduleScope.exports,
    moduleScope,
    (specifier) => {
      if (specifier === "@/lib/analytics") return analytics;
      if (specifier === "@/lib/supabase-server") {
        return { getSupabaseServerClient };
      }
      return require(specifier);
    },
  );
  return moduleScope.exports;
}

function preserveEnvironment(names) {
  const original = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  return () => {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  };
}

test("raw analytics opt-in parsing accepts only the exact server-side value true", () => {
  const { isRawAnonymousAnalyticsEnabled } = loadAnalytics();

  assert.equal(isRawAnonymousAnalyticsEnabled("true"), true);
  for (const value of [undefined, null, false, true, "", "false", "TRUE", "1", " true", "true "]) {
    assert.equal(isRawAnonymousAnalyticsEnabled(value), false, String(value));
  }
});

test("analytics credentials alone do not activate PostHog or Supabase raw sinks", async () => {
  const restoreEnvironment = preserveEnvironment([
    "POSTHOG_HOST",
    "POSTHOG_PROJECT_API_KEY",
    "RAW_ANONYMOUS_ANALYTICS_ENABLED",
  ]);
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  let supabaseClientCalls = 0;

  try {
    delete process.env.RAW_ANONYMOUS_ANALYTICS_ENABLED;
    process.env.POSTHOG_PROJECT_API_KEY = "test-project-key";
    process.env.POSTHOG_HOST = "https://example.invalid";
    globalThis.fetch = async () => {
      fetchCalls += 1;
      throw new Error("disabled PostHog must not fetch");
    };

    const analytics = loadAnalytics();
    const storage = loadAnalyticsStorage(analytics, () => {
      supabaseClientCalls += 1;
      return { configured: true };
    });

    assert.equal(analytics.isPostHogConfigured(), false);
    assert.equal(
      await analytics.captureAnalyticsEvent("search_performed", "anon_test", {}),
      "disabled",
    );
    assert.equal(storage.isSupabaseAnalyticsEnabled(), false);
    assert.deepEqual(
      await storage.saveSearchEvent({}),
      { id: null, status: "disabled" },
    );
    assert.equal(await storage.saveBlockedPreviewClick({}), "disabled");
    assert.equal(fetchCalls, 0);
    assert.equal(supabaseClientCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});

test("the explicit gate still requires each sink's credentials", () => {
  const restoreEnvironment = preserveEnvironment([
    "POSTHOG_PROJECT_API_KEY",
    "RAW_ANONYMOUS_ANALYTICS_ENABLED",
  ]);

  try {
    process.env.RAW_ANONYMOUS_ANALYTICS_ENABLED = "true";
    delete process.env.POSTHOG_PROJECT_API_KEY;
    const analytics = loadAnalytics();
    const storage = loadAnalyticsStorage(analytics, () => null);

    assert.equal(analytics.isPostHogConfigured(), false);
    assert.equal(storage.isSupabaseAnalyticsEnabled(), false);
  } finally {
    restoreEnvironment();
  }
});
