import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const workspaceRoot = process.cwd();
const targetRoots = [path.join(workspaceRoot, "app"), path.join(workspaceRoot, "components")];
const importRegex = /product-listings|productListings/iu;
const publicComparisonClaimRegex = [
  /\b\d+\s+stores?\b/iu,
  /\bfrom\s+€\s*\d/iu,
  /\bsave\s+up\s+to\b/iu,
  /\b(?:cheapest|best[- ]price|savings?)\b/iu,
  /\bcompare(?:d|s|son)?\s+(?:across|between)\s+stores?\b/iu,
];

function listFiles(directory) {
  const output = [];
  const queue = [directory];

  while (queue.length > 0) {
    const current = queue.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (child.includes(`${path.sep}.next${path.sep}`)) continue;
        queue.push(child);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        output.push(child);
      }
    }
  }

  return output;
}

function listForbiddenImports() {
  const violators = [];
  for (const root of targetRoots) {
    for (const filename of listFiles(root)) {
      const text = fs.readFileSync(filename, "utf8");
      if (importRegex.test(text)) {
        violators.push(path.relative(workspaceRoot, filename));
      }
    }
  }
  return violators;
}

function listPublicComparisonClaims() {
  const violators = [];
  for (const root of targetRoots) {
    for (const filename of listFiles(root)) {
      const text = fs.readFileSync(filename, "utf8");
      if (publicComparisonClaimRegex.some((pattern) => pattern.test(text))) {
        violators.push(path.relative(workspaceRoot, filename));
      }
    }
  }
  return violators;
}

test("public UI sources must not import product-listings", () => {
  const violators = listForbiddenImports();
  assert.deepEqual(violators, []);
});

test("public UI sources must not make synthetic comparison claims", () => {
  const violators = listPublicComparisonClaims();
  assert.deepEqual(violators, []);
});
