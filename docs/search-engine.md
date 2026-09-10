<!-- Parent: ../CLAUDE.md -->

# Search engine: how Weft ranks by meaning

Weft's no-key fallback is a **structured query interpreter plus weighted concept
graph**, not token matching. The configured production path adds Gemini Embedding
2 retrieval from Supabase/pgvector, fuses it with that graph, then asks Gemini
3.6 Flash to return a schema-validated list from the top 40 candidates. The demo
still runs from a clean clone with no API keys, database, or model download (see
[`CLAUDE.md`](../CLAUDE.md)); a cloud failure returns the deterministic result
instead of breaking search.

The problem it solves: the old query path was a boolean AND over raw tokens, so
*"something warm for winter"* returned **zero** results because no product row
contains the word "warm". Shoppers think in moods, occasions, and half-remembered
details; the catalog is indexed in SKUs and category names. The graph bridges the
two.

## The pipeline

```
raw query
   │  interpretQuery()
   ▼
normalize (lowercase, strip diacritics, drop punctuation)
   │
   ▼
extract price bounds   ── "under 40" → maxPrice; "100-150" → minPrice + maxPrice
   │
   ▼
collapse phrases       ── "night out" → party, "wide leg" → wide
   │
   ▼
tokenize + canonicalize ── EN/LT surface form → canonical term
   │                        (fuzzy typo rescue ON for the query only)
   ▼
QueryInterpretation { terms, unknownTerms, constraints, pricePreference, wantsSale }
   │  buildQueryConcepts()
   ▼
expand each term two hops across the association graph (decayed, one-way)
   │  resolveGarmentTargets()
   ▼
hard envelope: garment, colour, department, exclusions, price, availability
   │  scoreProduct()  ── against buildProductTerms(product)
   ▼
per-product relevance in [0,1] + matchedTerms (the explanation)
   │  semanticSearch()
   ▼
absolute floor + relative cut → exact ranked, explained results
   │  only when exact is empty
   ▼
soften explicit detail/material constraints → separately labelled alternatives
```

The split between **interpretation** (`interpretQuery`) and **ranking**
(`buildQueryConcepts` → `resolveGarmentTargets` → `scoreProduct`) is deliberate:
interpretation is a pure function of the query string alone, so it is trivially
unit-testable (`interpretQuery("dress under 50")` → `{ terms: ["dress"], maxPrice:
50 }`) without touching the catalog. The nested `constraints` object is the
reviewable query plan consumed by hard filtering and diagnostics.

## Exact results and alternatives are different products

`semanticSearch()` returns two lists. `matches` satisfies every hard constraint
and is the **only** list used by the evaluation harness. If it is empty and the
query contains a concrete material/visual detail, `alternatives` may soften
those details while continuing to enforce garment type, colour, department,
price range, availability, and exclusions. `relaxedConstraints` names exactly
what was softened, and the search page labels the result as approximate.

This avoids two equally bad behaviours: returning nothing useful when one rare
detail is missing, or silently calling a wrong-colour/out-of-budget item an exact
match. A product without stars can be an explicitly labelled alternative to a
black starred hoodie; it can never pass an exact case for that query.

## The five decisions worth discussing

**1. Each concept is satisfied by its single best match, never a sum.**
A query concept expands to many catalog terms — "gym" reaches leggings, shorts,
joggers, sweatpants, tank, sneakers. If a product's score were the *sum* over
those, a product that is exactly one of them would score one-sixth, and wide
concepts would punish themselves. So `scoreProduct` takes, per concept, the
single best `satisfaction × productWeight`. The shopper asked for one thing, and
the best answer to it is the score. (`lib/semantic-search.ts`, `scoreProduct`.)

**2. Naming a garment is a hard constraint, not a ranking nudge.**
"Shoes for hiking in the rain" is a request for *shoes*. A waterproof parka
satisfies "rain" beautifully and is still a **wrong answer**. `resolveGarmentTargets`
computes the set of garment categories the subject allows, and any product
outside it is zeroed (`EXCLUDE_OFF_SUBJECT`), not merely down-weighted. Damping
was tried first and leaked jackets through the relative cut whenever the top
result scored high enough. Descriptive terms (colours, moods, materials) carry no
such constraint — *"something warm"* deliberately leaves the garment open.

**3. Association edges are one-way, and the walk stops at garments.**
`winter → parka` is the point of the graph; `parka → every scarf` is not. Edges
are directed from the general/intent concept to the specific garment. And the
two-hop expansion *ends* when it reaches a garment (`GARMENT_TERMS`): "office"
reaching "trousers" is intended, but carrying on from trousers to its denim
siblings made jeans a good answer to *"smart trousers for the office"*. A garment
is where a concept lands, not somewhere it passes through. Second hops decay
(`SECOND_HOP_DECAY = 0.7`) and anything under `EXPANSION_FLOOR = 0.2` is dropped.

**4. Fuzzy typo-matching is ON for the query and OFF for the catalog.**
Damerau-Levenshtein (transposition = one edit, so "snekaers" → "sneakers" is
distance 1) rescues shopper typos on tokens of 5+ characters. Applied to *catalog*
text it silently rewrites the data: it read a shirt's `dropped_shoulder` tag as
`cropped` — one letter — and every dropped-shoulder garment then answered
"cropped top". So `canonicalize(token, /*allowFuzzy*/ false)` is used for product
terms. This asymmetry is covered by a regression test
([`scripts/semantic-search.test.mjs`](../scripts/semantic-search.test.mjs)).

**5. Two cutoffs, absolute and relative.**
A result must clear an absolute `RELEVANCE_FLOOR = 0.25` (is it good enough to show
at all?) *and* sit within `RELEVANCE_RATIO = 0.65` of the best result (is it in the
same league as the winner?). The relative cut is what keeps a broad query from
dragging a long tail of weak matches onto the page. A coverage penalty
(`COVERAGE_FLOOR`) additionally makes *ignoring* one of the shopper's concepts
cost more than answering it weakly — that's what stops a wool coat (nails
"jacket", silent on "waterproof") from clearing the cut in a waterproof search.

Every constant above is named and centralized at the top of the module, so tuning
is a diff in one place, not a hunt through the logic.

## Explanation output

`scoreProduct` returns `matchedTerms` — the concepts that actually fired for that
product. This is not decoration: it is what makes the evaluation harness point at
a *specific edge* when a query regresses, instead of at a black box. It is also
what a future UI would surface as "matched: winter · wool".

## Complexity and performance

For a catalog of *N* products, *C* query concepts, and vocabulary *V*:

- **Query interpretation** is O(*Q · V*) in the worst case (fuzzy rescue scans the
  vocabulary), but only for unrecognized tokens of 5+ chars, and *V* is a few
  hundred entries — sub-millisecond.
- **Ranking** is O(*N · (F + C)*): each product builds its term vector once over a
  fixed set of *F* fields (map lookups, fuzzy off), then is scored against *C*
  concepts, each a bounded map.

Measured: **~0.4 ms per full-catalog search** over the 64-item catalog (warm, Node
24, averaged over 14k searches). This is linear in catalog size and would stay
comfortable into the low thousands of products; past that, the graph becomes the
rerank layer under an embedding recall stage (see below), which is the point at
which the O(*N*) scan stops being free.

## Evaluation methodology

Routine development evaluates two inspected sets from
[`scripts/search-queries.mjs`](../scripts/search-queries.mjs): DEV (44, tuning
allowed) and REGRESSION (48, a tripwire assembled from formerly held-out and
consumed blind cases). The already-published 18-case 2026-08-27 blind set is
preserved there under an explicitly historical name.

The first 200-case expansion came from a separate, frozen set in
[`scripts/final-blind-queries.mjs`](../scripts/final-blind-queries.mjs). It is
balanced across ten intent categories and includes easy, medium, adversarial,
positive, negative, ambiguous, Lithuanian, multi-constraint, and top-ranking
exclusion cases. Stable case IDs and prose expected outcomes make every judgement
reviewable.

`npm run test:search` touches DEV plus the inspected regression extension.
`npm run eval:consumed` prints per-case positions, scores, matched concepts,
failures, and category/difficulty aggregates for the consumed 200-case record.
It is not an unseen final metric. V2 was also consumed after its failures informed
the cloud architecture. After the production model and configuration were frozen,
a new 200-case v3 was authored, checked against all earlier sets, SHA-256 sealed,
and run once. The immutable end-to-end result is **195/200 (97.5%)**; see the
evaluation protocol for category results and all five failures.

The complete construction, pass criteria, history, and anti-leakage rules are in
[`docs/search-evaluation.md`](search-evaluation.md). Labels remain single-author
judgements over a synthetic catalog; independently labelled cases or real click
data would be a stronger future validation source.

## A named colour is a hard constraint (resolved 2026-08-27)

A directly-named concrete colour now *excludes* the wrong colours, exactly as a
named garment excludes the wrong categories (`COLOR_TERMS` + `EXCLUDE_OFF_COLOR`
in `lib/semantic-search.ts`). This closed a gap the 2026-08-15 blind run caught:
`"yellow dress"` should answer *"not stocked"* (nothing yellow exists) but used to
return four non-yellow dresses — the "dress" subject selected the dresses and
*yellow* only *lightly penalised* each, so none were excluded. The same held for
an in-lexicon colour with no match in the subject (`"beige dress"` also returned
four); lexicon membership was never the operative factor. Now a product whose
canonicalised colour is none of the ones the shopper named scores zero, so an
unstocked colour returns the honest empty result. Colours are matched on the
exact term (not by expansion), and a product's `color` is already canonicalised
(olive → green, navy → blue) when its terms are built, so `"green overshirt"`
still finds the olive one. The *quality* words `neutral`/`bright`/`dark`/`light`
are deliberately excluded from `COLOR_TERMS` — they describe a range, so "dark
coat" must not be filtered to literally-dark rows.

Fixing this consumed the 2026-08-15 blind set (it was made in response to that
set's `yellow dress` failure); those 18 queries moved to `REGRESSION_SET` and a
fresh blind set was sealed 2026-08-27. See `scripts/search-queries.mjs`. The
behaviour is guarded by synthetic invariants in `scripts/semantic-search.test.mjs`.

## Known limitations

- **Single-author labels.** See above.
- **No morphological stemming for Lithuanian.** Inflected endings are enumerated
  explicitly in the lexicon rather than stemmed. At this vocabulary size an
  explicit list is more accurate and far easier to audit than a stemmer, but it
  does mean a genuinely novel inflection falls through to the fuzzy rescue or to
  `unknownTerms`.

## When a real feed arrives

The production shape is hybrid retrieval, not “send the catalog to an LLM” and
not pure vector search:

1. Normalize every feed into typed fields plus searchable text; enrich missing
   visual attributes offline from product text/images.
2. Parse the shopper query into the same structured constraint schema used by
   this demo. Deterministic parsing covers price, colour, category, availability,
   and exclusions; an LLM parser may propose uncertain style/intent fields, but
   its output must be schema-validated.
3. Retrieve candidates in parallel with lexical search (exact names/brands),
   vector similarity (messy intent/paraphrases), and hard database facets.
4. Fuse the candidate lists, then run a cross-encoder or learning-to-rank model
   over the top candidate hundreds.
5. Reapply hard constraints after reranking, deduplicate product variants, and
   return exact results separately from explicitly relaxed alternatives.
6. Log anonymous query/result/click signals for later judgement collection; do
   not train directly on raw clicks without position-bias correction.

For a larger catalog, PostgreSQL/pgvector or a dedicated vector engine owns
candidate recall; a small model service owns query parsing and reranking. PyTorch
is a training/inference implementation detail, not the search architecture. The
concept graph remains the deterministic **constraint, explanation, and fallback
layer** — the part that still knows a parka is not a shoe and can explain why a
candidate matched. See
[`docs/feed-format-research-2026-07-31.md`](feed-format-research-2026-07-31.md).
