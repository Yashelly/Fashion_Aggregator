import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** Execute the shipped TS modules with explicit service-boundary doubles. */
export function createSearchLoader(overrides = {}) {
  const cache = new Map();
  function load(id) {
    if (Object.hasOwn(overrides, id)) return overrides[id];
    if (id === 'server-only') return {};
    if (!id.startsWith('@/')) return require(id);
    if (cache.has(id)) return cache.get(id).exports;
    const file = path.join(process.cwd(), `${id.slice(2)}.ts`);
    const source = fs.readFileSync(file, 'utf8');
    const compiled = require('typescript').transpileModule(source, {
      compilerOptions: { module: 'CommonJS', target: 'ES2022', esModuleInterop: true },
    }).outputText;
    const scope = { exports: {} };
    cache.set(id, scope);
    new Function('exports', 'module', 'require', compiled)(scope.exports, scope, load);
    return scope.exports;
  }
  return load;
}
