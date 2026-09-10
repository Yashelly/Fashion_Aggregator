<!-- Parent: ../CLAUDE.md -->

# Search evaluation protocol

This document defines how Weft measures the relevance of its hybrid vector,
concept-graph, and structured-judge search over the 64-product synthetic catalog. It separates data
used to improve the ranker from data used to estimate generalization. That
separation—not a particular target score—is what makes the final number useful.

## Evaluation sets

| Set | File | Purpose | May ranking logic be tuned against it? |
|---|---|---|---|
| DEV | `scripts/search-queries.mjs` | Working examples used to add vocabulary, shape associations, and diagnose ranking behaviour. Its score is a fit ceiling. | Yes. |
| REGRESSION | `scripts/search-queries.mjs` | Previously inspected cases that preserve known behaviour and prevent old failures returning. | Yes, but its score must never be described as unseen performance. |
| HISTORICAL BLIND 2026-08-27 | `scripts/search-queries.mjs` | Immutable record of the former 18-case blind measurement. Its results are already known. | No; it is historical, not the final metric. |
| CONSUMED FINAL BLIND 2026-09-07 | `scripts/final-blind-queries.mjs` | Immutable 200-case first-run record, reclassified as regression when its output was used to improve search. | Yes; it is inspected regression data, never an unseen metric. |
| CONSUMED FINAL BLIND V2 2026-09-08 | `scripts/final-blind-v2-queries.mjs` | Immutable 200-case first-run record. Its inspected failures later informed the vector + relevance-judge architecture, so it is no longer an unseen metric. | Yes, as historical stress data only. |
| FINAL BLIND V3 2026-09-10 | `scripts/final-blind-v3-queries.mjs` | Independent first-run validation of the frozen Gemini hybrid production candidate. Raw result: 195/200 (97.5%). | No. It is sealed and immutable; using a failure for tuning requires consuming all of v3 and creating v4. |

The retrieval-provider bake-off uses DEV and REGRESSION only. Its script
does not import either final-blind module. The selected Gemini hybrid stack
passes 91/92 known cases (98.9%), but that number is explicitly not an unseen
metric. See `docs/cloud-search-bakeoff.md`.

The 2026-08-15 blind set was consumed when its `yellow dress` failure led to the
named-colour constraint fix. Those cases were moved verbatim into REGRESSION.
The replacement 2026-08-27 set was scored and published, so it too is now
explicitly historical. Neither is represented as a currently unseen set.

## Current final-blind v3 construction and result

V3 contains 200 newly authored cases: 20 in each of ten categories, 60 easy,
80 medium, 60 adversarial, 180 English, and 20 Lithuanian. It includes positive,
negative, ambiguous, multi-constraint, exact-count, superlative, exclusion, and
conceptual queries. The structural validator rejected nine near-duplicates; they
were rewritten before sealing. The final set has no detected duplicate or
near-duplicate against DEV, REGRESSION, the 18-case historical set, consumed v1,
consumed v2, or itself.

Before any v3 embedding, retrieval, or judge output was generated, the manifest
sealed SHA-256 fingerprints for the case set, catalog, production hybrid path,
embedding client, judge client, concept engine, evaluation harness, provider
harness, and catalog loader. The single first run then executed hard filters,
Gemini Embedding 2 retrieval, concept-graph reciprocal-rank fusion, a 40-candidate
window, and the frozen schema-constrained Gemini 3.6 Flash judge. It wrote an
immutable report and changed only the manifest status/`firstRun` record.

The first run passed **195/200 (97.5%)**, with diagnostic mean precision@5
**0.958**, mean recall **0.934**, and five failed IDs: `FB3-045`, `FB3-149`,
`FB3-158`, `FB3-179`, and `FB3-194`.

| Category | Passed | Rate |
|---|---:|---:|
| Ambiguous/conceptual | 19/20 | 95% |
| Colour constraints | 20/20 | 100% |
| Construction/details | 20/20 | 100% |
| Garment identity | 20/20 | 100% |
| Lithuanian language | 19/20 | 95% |
| Materials/textures | 19/20 | 95% |
| Negative/exclusion | 18/20 | 90% |
| Occasion/style | 20/20 | 100% |
| Price/value | 20/20 | 100% |
| Weather/activity | 20/20 | 100% |

Difficulty results were 59/60 easy (98.3%), 78/80 medium (97.5%), and 58/60
adversarial (96.7%). English was 176/180 (97.8%); Lithuanian was 19/20 (95%).

The raw score is deliberately not corrected after inspection. Failure review
found one real negated-colour prefilter miss (`FB3-149`), one real judge miss
where the relevant vest was candidate 3 (`FB3-194`), two clear annotation defects
(`FB3-045` asks for black but labels a chocolate skirt; `FB3-158` overlooks a
brown non-wool blouson that satisfies the exclusions), and one debatable
Lithuanian category boundary (`FB3-179`, `kelnės`). These limitations remain in
the report rather than being used to inflate the headline.

## Historical final-blind v2 construction

The v2 set was authored in a clean-room agent context from the two catalog files
without reading the search implementation or running any ranking command. A
separate clean-room verifier checked every label against catalog facts, rejected
the first two drafts, and approved the corrected third draft before sealing.
This is stronger than a same-context self-check, but it remains AI-assisted
catalog labelling—not independent human relevance annotation or live-user data.

The set contains 200 cases: 20 in each of the ten categories below, with 60 easy,
80 medium, and 60 adversarial cases. Each case has stable `FB2-NNN` identity,
natural query text, a case-specific catalog-fact explanation, relevant IDs,
optional required/forbidden positions, and an explicit result cap. The generic
validator rejects schema errors, bad catalog references, duplicate/near-duplicate
queries against all earlier sets, unbalanced strata, invalid negatives, and
generic expected-outcome templates.

Before the first run, SHA-256 values froze the case set, both catalog inputs,
production engine, evaluator, structural validator, TypeScript loader, and CSV
parser in `scripts/final-blind-v2-manifest.json`. `npm run eval:historical:v2`
refuses to score if any pinned input differs. Its first successful run wrote the
immutable report and recorded the result/hash back into the manifest.

## Consumed final-blind construction and history

The final set was authored from the catalog and product attributes without
running the ranking engine. It contains 200 natural-language cases, balanced at
20 cases across each of ten intent categories:

- garment identity;
- colour constraints;
- material and texture;
- construction and visual details;
- occasion and style;
- weather and activity;
- price and value;
- Lithuanian-language queries;
- ambiguous or conceptual wording;
- negative and exclusion cases.

Cases are also labelled `easy`, `medium`, or `adversarial`. They include direct
and indirect positives, strict negatives, ambiguity, multi-constraint requests,
and explicit `forbiddenTop` products where a plausible but wrong answer must not
appear near the head of the ranking. Every case has a stable ID (`FB-001` through
`FB-200`) and a prose `expectedOutcome` so a reviewer can inspect the relevance
judgement without running the ranker.

Before its first evaluation, the former final set was structurally checked to verify:

- schema, sequential IDs, catalog-product references, and category balance;
- exact query uniqueness;
- heuristic near-duplicate checks within the final set and against DEV,
  REGRESSION, and the historical blind set;
- negative cases require zero returned results;
- `mustRank` is a subset of relevant products and `forbiddenTop` is disjoint;
- the final case-set and catalog SHA-256 values match the sealed manifest.

The manifest is `scripts/final-blind-manifest.json`. Its case-set hash freezes
queries and labels; its catalog hash ties the measurement to the catalog that was
judged. It also pins the production engine, evaluator, TypeScript loader, and CSV
parser. The immutable first-run summary and report hash are recorded there;
reproduction refuses to overwrite a report whose bytes differ. Text hashes
normalize line endings so validation remains stable across Windows and Linux.

## V3 per-case pass criteria

For a positive v3 query, a case passes only when all of these hold:

1. at least one catalog-labelled acceptable item appears in the top five;
2. every `mustRank` item appears inside its declared `mustRankTopK` window;
3. no `forbiddenTop` item appears inside its declared `forbiddenTopK` window;
4. the result count does not exceed `maxResults`;
5. cases with `exactResults` return exactly that count.

For a v3 negative case, `relevant` is empty and `maxResults` is zero, so any
invented result fails. Precision@5, recall, and reciprocal rank are diagnostic,
not hidden pass thresholds. This avoids incorrectly requiring a search engine to
return every member of a non-exhaustive subjective acceptable set; truly bad
near-misses are encoded explicitly with `forbiddenTop`.

The product search API may expose separately labelled approximate alternatives
when no exact match exists. Evaluation reads only `semanticSearch().matches`;
`alternatives` can never turn a failed exact case into a pass or inflate the
headline metric.

## Running the evaluation

Routine development and CI run only the tunable/inspected sets:

```bash
npm run test:search
```

The current immutable v3 result is verified and displayed with:

```bash
npm run eval:blind
```

After the first successful run this command validates every seal/report hash and
prints the stored result without calling embeddings or the judge again. Structural
seal validation alone is available as `npm run eval:blind:validate`.

The historical v2 first run remains reproducible with:

```bash
npm run eval:historical:v2
```

Both final commands remain absent from routine CI. V2 verifies its old immutable
report; v3 verifies the new production-candidate result.

## Anti-leakage rules

1. Do not inspect final-blind ranking output until the case set passes structural
   review and its hash is sealed.
2. After the first run, do not edit a final-blind query, label, production ranking
   rule, weight, or vocabulary in response to a failure.
3. Do not add the final blind command to routine CI or use its score as a release
   gate; gates create an optimization target.
4. If a failure is later used to improve search, move the entire final set to a
   clearly named historical/regression role and create a new untouched blind set.
5. Report the first-run result, including failures. Never select a more flattering
   rerun after changes.
6. V2 and v3 are AI-assisted judgements over a synthetic catalog. Independent
   human labels and live interaction data would provide stronger external validity.

## Consumed v2 first run

The v2 set was sealed on 2026-09-08 and first evaluated on 2026-09-09. It passed
**105/200 cases (52.5%)**, with mean precision@k **0.558** and mean recall
**0.726**. That number remains the immutable first-run result for the old engine,
but it is no longer a current public metric: its diagnostics informed the later
cloud retrieval and relevance-judge architecture. No v2 label or first-run
report was rewritten.

| Category | Passed | Rate |
|---|---:|---:|
| Ambiguous/conceptual | 3/20 | 15% |
| Colour constraints | 17/20 | 85% |
| Construction/details | 15/20 | 75% |
| Garment identity | 13/20 | 65% |
| Lithuanian language | 10/20 | 50% |
| Materials/textures | 13/20 | 65% |
| Negative/exclusion | 9/20 | 45% |
| Occasion/style | 10/20 | 50% |
| Price/value | 5/20 | 25% |
| Weather/activity | 10/20 | 50% |

Difficulty results were 42/60 easy (70.0%), 31/80 medium (38.75%), and 32/60
adversarial (53.33%). The weak price/value and conceptual strata show why the
97–99% inspected-regression target is not a defensible generalization claim for
this deterministic prototype.

All 95 failed IDs and complete expected-versus-actual rankings, scores, matched
terms, positions, category/difficulty aggregates, and query interpretations are
in [`reports/search/final-blind-v2-report.json`](../reports/search/final-blind-v2-report.json).

## Recorded historical first run

The sealed first run on 2026-09-07 passed **60/200 cases (30.0%)**, with mean
precision@k **0.366** and mean recall **0.499**. It was then deliberately
consumed: subsequent production-ranking changes may use its diagnostics. It is
therefore not eligible for a README/CV metric.

| Category | Passed | Rate |
|---|---:|---:|
| Ambiguous/conceptual | 2/20 | 10% |
| Colour constraints | 10/20 | 50% |
| Construction/details | 3/20 | 15% |
| Garment identity | 3/20 | 15% |
| Lithuanian language | 10/20 | 50% |
| Materials/textures | 5/20 | 25% |
| Negative/exclusion | 5/20 | 25% |
| Occasion/style | 10/20 | 50% |
| Price/value | 10/20 | 50% |
| Weather/activity | 2/20 | 10% |

Difficulty results were 33/60 easy (55.0%), 17/80 medium (21.25%), and 10/60
adversarial (16.67%). The low generalization result is materially different from
the old 18-case score and is evidence that the larger, broader test is doing its
job: it exposes weak paraphrase coverage, incomplete negation/availability
handling, over-broad result tails, and shallow matching of construction and
conceptual intent.

All 140 failed case IDs and complete expected-versus-actual diagnostics are in
[`reports/search/final-blind-report.json`](../reports/search/final-blind-report.json),
which is the detailed source of truth.
