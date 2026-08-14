/**
 * Loads the TypeScript search engine into a plain Node context.
 *
 * `lib/semantic-search.ts` is TypeScript with a path alias, but the eval harness
 * and the unit tests both need to exercise it without dragging a bundler into a
 * test script. Transpiling the single file in-memory and running it through a
 * `Function` scope keeps the tests reading the *same source the app ships* — not
 * a hand-copied duplicate that can drift from it. Shared by
 * `semantic-eval.mjs` (relevance gate) and `semantic-search.test.mjs` (unit
 * invariants) so the mechanism lives in exactly one place.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadSemanticSearch() {
  const source = fs.readFileSync(path.join(rootDir, "lib", "semantic-search.ts"), "utf8");
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  new Function("exports", "module", "require", transpiled)(moduleScope.exports, moduleScope, require);
  return moduleScope.exports;
}
