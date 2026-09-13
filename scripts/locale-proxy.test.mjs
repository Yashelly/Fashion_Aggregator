import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const React = require("react");

function loadProxy() {
  const source = fs.readFileSync("proxy.ts", "utf8");
  const code = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const module = { exports: {} };
  const testRequire = (id) => id === "@/lib/mock-products"
    ? { getMockProducts: () => [] }
    : require(id);
  new Function("module", "exports", "require", code)(module, module.exports, testRequire);
  return module.exports.proxy;
}

const proxy = loadProxy();

function request(lang, headers = {}) {
  return new NextRequest(`https://weft.test/search?lang=${lang}`, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "sec-fetch-dest": "document",
      ...headers,
    },
  });
}

test("an explicit locale navigation persists the shopper preference", () => {
  assert.equal(proxy(request("lt")).cookies.get("weft-locale")?.value, "lt");
  assert.equal(proxy(request("en")).cookies.get("weft-locale")?.value, "en");
});

test("router and browser prefetches cannot persist a locale preference", () => {
  const speculativeHeaders = [
    { "next-router-prefetch": "1" },
    { purpose: "prefetch" },
    { "sec-purpose": "prefetch;prerender" },
  ];

  for (const headers of speculativeHeaders) {
    const response = proxy(request("lt", headers));
    assert.equal(response.cookies.get("weft-locale"), undefined, JSON.stringify(headers));
    assert.match(response.headers.get("x-middleware-request-cookie") ?? "", /weft-locale=lt/);
  }
});

test("Flight and RSC reads receive the route locale without changing preference", () => {
  const flightRequests = [
    request("lt", { accept: "text/x-component", rsc: "1", "sec-fetch-dest": "empty" }),
    new NextRequest("https://weft.test/search?lang=lt&_rsc=cache-key", {
      headers: { accept: "*/*" },
    }),
  ];

  for (const flightRequest of flightRequests) {
    const response = proxy(flightRequest);
    assert.equal(response.cookies.get("weft-locale"), undefined);
    assert.match(response.headers.get("x-middleware-request-cookie") ?? "", /weft-locale=lt/);
  }
});

test("an optimistic language choice wins while the URL still contains the old locale", () => {
  const source = fs.readFileSync("components/locale-provider.tsx", "utf8");
  const code = require("typescript").transpileModule(source, {
    compilerOptions: { jsx: "react-jsx", module: "CommonJS", target: "ES2022" },
  }).outputText;
  const module = { exports: {} };
  const testRequire = (id) => id === "@/lib/use-client-locale"
    ? { LocaleContext: React.createContext(null) }
    : require(id);
  new Function("module", "exports", "require", code)(module, module.exports, testRequire);

  assert.equal(module.exports.resolveLocale("lt", "lt", "en"), "en");
  assert.equal(module.exports.resolveLocale("en", "en", null), "en");
  assert.equal(module.exports.resolveLocale(null, "lt", null), "lt");
});

test("language switch links opt out of Next router prefetch", () => {
  const header = fs.readFileSync("components/site-header.tsx", "utf8");
  assert.equal(header.match(/prefetch=\{false\}/g)?.length, 4);
});
