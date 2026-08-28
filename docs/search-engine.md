<!-- Parent: ../CLAUDE.md -->

# Search engine: how Weft ranks by meaning

Weft's search is a **weighted concept graph**, not token matching and not an
embedding model. That choice is a hard constraint, not a preference: the app must
run from a clean clone with no API keys, no database, and no model download (see
[`CLAUDE.md`](../CLAUDE.md)). The whole engine is one file,
[`lib/semantic-search.ts`](../lib/semantic-search.ts), and every ranking decision
it makes is inspectable — which is what lets it be *evaluated* instead of
eyeballed.

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
extract price ceiling  ── "under 40" / "iki 45" → maxPrice, removed from text
   │
   ▼
collapse phrases       ── "night out" → party, "wide leg" → wide
   │
   ▼
tokenize + canonicalize ── EN/LT surface form → canonical term
   │                        (fuzzy typo rescue ON for the query only)
   ▼
QueryInterpretation { terms, unknownTerms, maxPrice, pricePreference, wantsSale }
   │  buildQueryConcepts()
   ▼
expand each term two hops across the association graph (decayed, one-way)
   │  resolveGarmentTargets()
   ▼
hard constraint: which garment categories may answer at all
   │  scoreProduct()  ── against buildProductTerms(product)
   ▼
per-product relevance in [0,1] + matchedTerms (the explanation)
   │  semanticSearch()
   ▼
absolute floor + relative cut → ranked, explained results
```

The split between **interpretation** (`interpretQuery`) and **ranking**
(`buildQueryConcepts` → `resolveGarmentTargets` → `scoreProduct`) is deliberate:
interpretation is a pure function of the query string alone, so it is trivially
unit-testable (`interpretQuery("dress under 50")` → `{ terms: ["dress"], maxPrice:
50 }`) without touching the catalog.

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
at all?) *and* sit within `RELEVANCE_RATIO = 0.55` of the best result (is it in the
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

## Evaluation methodology (the honest version)

Search quality is a *measurement*, not an opinion — but only if the measurement is
kept honest. The labelled queries in
[`scripts/search-queries.mjs`](../scripts/search-queries.mjs) are split three ways,
each with a different job and a different level of trust:

| Set | Size | Trust |
|-----|-----:|-------|
| **Dev** | 44 | Tuning is allowed. Its score (44/44, p@k 0.941) is a **fit ceiling** — the graph was shaped to answer these, so it only proves the answers are expressible. |
| **Regression** | 30 | Was held-out; scored blind **once at 24/30**, then its failures were inspected and two real defects fixed, taking it to **26/30**. Because it has been looked at, 26/30 is a **benchmark, not an unbiased generalization estimate**. Its job now is to be a tripwire that must not drop. |
| **Blind** | 18 | Written 2026-08-15 against the catalog, sealed, scored **exactly once (17/18, p@k 0.944)**. The **current best generalization signal**. Neither the engine nor any label may change in response to it; the first tuning burns it into a second regression set. |

The two defects the regression set exposed on its blind run were genuine: the word
*tracksuit* was missing from the lexicon entirely, and a `jewelry → accessories`
edge let every belt and sock answer *"earrings"*. That is the value of a held-out
set — and the reason its post-fix number can no longer be reported as "unseen".

Only **dev and regression gate the build**. The blind set is reported but never
gated, because a gate is a target and tuning to a target is exactly what would
destroy the one honest reading it gives.

All labels share a single author (the engine's), which is a real ceiling: two
people disagree about whether a shirt dress answers "office". The next honest step
is a set labelled by someone else, or drawn from real click data.

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

The graph is not throwaway scaffolding. When a retailer feed replaces the
synthetic catalog, embedding similarity becomes the *recall* stage (find the
candidate hundreds out of many thousands) and this concept graph becomes the
**explainable rerank + hard-constraint layer** on top — the part that still knows a
parka is not a shoe, and can still tell the shopper *why* a product matched. See
[`docs/feed-format-research-2026-07-31.md`](feed-format-research-2026-07-31.md).
