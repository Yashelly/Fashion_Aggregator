<!-- Parent: ../CLAUDE.md -->

# Cloud search model bake-off

## Decision

The retrieval candidate selected after the 2026-09-10 development bake-off is:

- Gemini `gemini-embedding-2`, 1024 dimensions;
- deterministic price, availability, department, and colour prefilters;
- the existing explainable concept graph as an independent ranking lane;
- equal-weight reciprocal-rank fusion (`k = 60`);
- Gemini `gemini-3.6-flash` as a schema-constrained relevance judge over the
  top 40 candidates, returning at most 12 exact results;
- stateless judge calls (`store=false`) with temperature 0, a fixed seed, and
  low thinking to reduce variance while retaining constraint reasoning;
- the deterministic graph result as a fail-safe if vector retrieval or the
  judge is missing, invalid, quota-limited, or times out.

The selection used only the 44-case DEV set and the already-inspected 48-case
REGRESSION set. Neither final-blind module is imported by
`scripts/cloud-search-eval.mjs`. These results are therefore useful engineering
evidence, but they are not an unseen public metric.

## Reproduction

Put the provider keys in `.env.local`, then run:

```bash
npm run eval:cloud -- --providers=cohere,gemini,voyage
npm run eval:judge:consumed -- --batch-size=1
```

The evaluator caches provider responses under the ignored
`.tmp/cloud-search-cache/` directory. Use `--refresh` only when intentionally
repeating paid/API work. The committed JSON report contains rankings and scores,
but no API keys or embedding vectors.

## Recorded development result

The final pre-blind comparison after DEV-only taxonomy work was:

| Provider | Mode | DEV | REGRESSION | Mean nDCG@10 (DEV / REG) |
|---|---|---:|---:|---:|
| Cohere Embed v4 | vector | 34/44 (77.3%) | 36/48 (75.0%) | 0.916 / 0.957 |
| Cohere Embed v4 | hybrid RRF | 43/44 (97.7%) | 45/48 (93.8%) | 0.960 / 0.989 |
| Gemini Embedding 2 | vector | 34/44 (77.3%) | 44/48 (91.7%) | 0.910 / 0.995 |
| **Gemini Embedding 2** | **hybrid RRF** | **43/44 (97.7%)** | **48/48 (100.0%)** | **0.961 / 0.997** |
| Voyage 4 Large | vector | 37/44 (84.1%) | 46/48 (95.8%) | 0.947 / 0.979 |
| Voyage 4 Large | hybrid RRF | 44/44 (100.0%) | 46/48 (95.8%) | 0.976 / 0.990 |

Gemini hybrid passed 91/92 known cases (98.9%). The remaining DEV failure was
the broad query `clothes for the gym`; its head contained two labelled relevant
items but did not meet the per-case 60% precision requirement. It was retained
rather than hidden or relabelled.

Voyage embedding plus Cohere Rerank v4 Pro was also tested earlier and performed
worse than Voyage vector retrieval alone (31/44 DEV and 40/48 REGRESSION). Voyage
rerank endpoints returned quota/billing 429 responses for the available key.
That evidence ruled out a conventional hosted reranker for this catalog. The
later Gemini relevance judge has a different job: it validates the shopper's
complete constraint combination and may correctly return an empty list.

## Consumed-set judge evidence

After v2 output had been inspected, it was explicitly reclassified as consumed
and used only as a stress set. Gemini vector retrieval placed at least one
labelled relevant item in the top 40 for all 144 positive v2 cases, so candidate
recall—not vector storage—was no longer the main bottleneck. The deterministic
RRF selector passed 110/200 (55.0%). A schema-constrained `gemini-3.6-flash`
judge passed 18/20 in a batched probe and 5/5 in a production-shaped one-query
probe. `gemini-2.5-flash-lite` passed only 15/20 and was rejected.
The corresponding diagnostics are committed as
[`gemini-judge-gemini-3.6-flash-consumed-v2-first-20-batch-5.json`](../reports/search/gemini-judge-gemini-3.6-flash-consumed-v2-first-20-batch-5.json),
[`gemini-judge-gemini-3.6-flash-consumed-v2-first-5-batch-1.json`](../reports/search/gemini-judge-gemini-3.6-flash-consumed-v2-first-5-batch-1.json),
and
[`gemini-judge-gemini-2.5-flash-lite-consumed-v2-first-20-batch-5.json`](../reports/search/gemini-judge-gemini-2.5-flash-lite-consumed-v2-first-20-batch-5.json).
Those provider-selection probes predate the final temperature/seed/thinking
configuration. Their cache cannot satisfy the required full run because the
configuration version is part of every cache key and report filename.

After paid API access was enabled, the final production-shaped 3.6 Flash
configuration completed all 200 consumed v2 cases at batch size 1. Under the
final constraint-aware pass contract it passed **196/200 (98.0%)**. This remains
architecture-selection evidence only because v2 failures were already inspected.
The production candidate was frozen after that run, before v3 was authored.

The acceptance run must use `--batch-size=1`: each request contains exactly the
query and its top-40 candidate records, matching the production prompt shape.
Batching remains useful only for cheap exploratory probes and cannot be promoted
to final evidence because the model may reason differently across grouped cases.

## Production path

`sql/004_search_vector_index.sql` adds a 1024-dimensional pgvector table, cosine
HNSW index, filterable term metadata, RLS, and a read-only `security invoker`
RPC. The browser never sees the Gemini key or database connection string.

Apply the search migration, then populate or refresh the index:

```bash
npm run search:migrate
npm run search:index
npm run search:doctor
```

`SUPABASE_DB_URL` is used only by that indexing command. At request time the
server component embeds the query with Gemini, calls the public read-only RPC
using `NEXT_PUBLIC_SUPABASE_URL` plus the publishable/anon key, fuses vector and
graph candidates, and asks 3.6 Flash for a strictly validated list of IDs. If a
cloud dependency times out or is unavailable, `lib/hybrid-search.ts` returns the
deterministic local result instead of failing the request.

The database stores derived retrieval documents, hashes, filter fields, and
vectors. Product facts remain canonical in the catalog/feed source. Changed
documents are re-embedded by source hash; unchanged ones are skipped.

## Evaluation boundary

The 98.9% combined known-set result must not be advertised as blind accuracy.
V2 is now a consumed historical result because its failures informed this new
architecture. After the full consumed stress run and production configuration
were frozen, v3 was independently authored, structurally reviewed, hash-sealed,
and run exactly once. That later end-to-end first run—not this bake-off—is the
public result: 195/200 (97.5%). See `docs/search-evaluation.md`.
