# Directions and decisions

The owner's later feedback rejected the cream serif composition selected below. This document's scores are historical evidence from the first pass, not current design approval. The current implementation is documented in [cold studio](revision-cold-studio.md) and `DESIGN.md`.

12 September 2026. This is an expert comparison of rendered options, not a user A/B test. `scripts/frontend_prototypes.py` reproduces private HTML/PNG using one CSV: the first eight homepage products and all black products in results. All 12 initial frames were opened; the Search button wrap and clothing crop were corrected after review. Concepts are neither application routes nor promises of a working checkout.

## Three distinct compositions

| Direction | Home desktop / mobile | Results desktop / mobile | Difference and tradeoff |
|---|---|---|---|
| A · Editorial discovery | [D](../../.omx/artifacts/frontend/concepts/a-home-desktop.png) / [M](../../.omx/artifacts/frontend/concepts/a-home-mobile.png) | [D](../../.omx/artifacts/frontend/concepts/a-results-desktop.png) / [M](../../.omx/artifacts/frontend/concepts/a-results-mobile.png) | Serif heading, paired photos, one search; compact horizontal results without a persistent sidebar. Selected. |
| B · Catalog utility | [D](../../.omx/artifacts/frontend/concepts/b-home-desktop.png) / [M](../../.omx/artifacts/frontend/concepts/b-home-mobile.png) | [D](../../.omx/artifacts/frontend/concepts/b-results-desktop.png) / [M](../../.omx/artifacts/frontend/concepts/b-results-mobile.png) | Sans input, catalog appears earlier, persistent desktop rail; mobile floating action bar. Useful density, but a less expressive homepage and content covered by the bottom bar. |
| C · Graphic discovery | [D](../../.omx/artifacts/frontend/concepts/c-home-desktop.png) / [M](../../.omx/artifacts/frontend/concepts/c-home-mobile.png) | [D](../../.omx/artifacts/frontend/concepts/c-results-desktop.png) / [M](../../.omx/artifacts/frontend/concepts/c-results-mobile.png) | Graphic citron field, one large look, dense cards, and inline chips. The colored frame competes with the clothes; the mobile hero is too heavy. |

## Rubric

Scores are 1–5; total = sum(weight × score / 5). This explains the choice for this catalog, not measured conversion or a WCAG score.

| Criterion | Weight | A | B | C |
|---|---:|---:|---:|---:|
| Product clarity | 20 | 5 | 4 | 4 |
| Search and results | 25 | 5 | 5 | 4 |
| Mobile | 20 | 4 | 4 | 3 |
| Character | 15 | 4 | 3 | 4 |
| Accessibility of decisions | 10 | 5 | 5 | 4 |
| Feasibility in the current stack | 10 | 5 | 5 | 4 |
| Total / 100 | | **93** | **86** | **76** |

A connects the description and clothing, then yields space to the catalog; B saves space but turns a small selection into an administrative interface; C is expressive but offers no practical search advantage. A's mobile score was reduced for observed density/wrapping issues: these are fixes to make, not a hidden perfect score.

## Palettes and type

Five complete 18-role palettes, contrast calculations, and five reviewed state cards: [palettes.md](palettes.md). Linen/rust was selected: it retains Weft's recognizable rust, supports neutral clothing, and provides 6.90:1 for primary-button text and 5.57:1 for muted text on canvas. Cobalt reads more strongly as utility; pine blends with olive garments; aubergine shifts the accent toward beauty associations; citron makes the background more important than the clothes. The final three judgments are design interpretations, not external facts.

[Typography specimen](../../.omx/artifacts/frontend/concepts/typography.png): Georgia + IBM Plex Sans, Syne + Plex, Arial + Plex. EN/LT headings, query, price, name, and uppercase/lowercase Lithuanian characters were checked. System Georgia was selected for headings and the already-installed Plex for functional text; Syne remains in the wordmark. No new font download. Wide display type is not used for product titles, filters, or prices.

## Action placement

Three desktop schemes are represented in A/B/C: D1 search + horizontal refinements; D2 persistent rail; D3 compact inline chips/single trigger. Three mobile schemes: M1 top field and separate sheet; M2 bottom floating Filters/Sort; M3 inline chips and a compact button beside count. D1/M1 with one shared refinement modal was selected: 64 items and six neutral stores do not justify a persistent rail, while B's bottom bar covers products. Sort remains outside the sheet so a simple order change does not require opening all filters. The sheet has no false draft count—only Apply filters.

## Research transfers

Full matrices and dated primary sources: [A — 10 sites](research-a.md), [B — 10 sites and AI](research-b.md). Eighty primary frames and additional walkthroughs were reviewed. Seven deep dives had varying completeness; incomplete actions are named explicitly and not counted as successes. Niche Asket/Kotn/UNIF are visual references, not a claim that all 20 have equal mass-market reach.

1. Reserved/MODIVO: search always visible → a real field in Weft's first viewport.
2. GLAMI: store beside price → neutral source near the item, without exposing internal slugs.
3. Asket/Everlane: consistent photos → contain, 4:5, and stable fallback.
4. Vinted: clear budget refinement → separate min/max, selected chips, persistent query.
5. Ganni: one panel → shared dialog with draft/apply/cancel.
6. Colorful Standard: results continuity → safe returnTo and URL state.
7. Rains/Reformation as counterexamples → no permanently floating panel over the price.
8. UNIF as a counterexample → no text over unpredictable photography.
9. Lyst/Zalando officially state AI capabilities, but hands-on access was unavailable; do not copy promises or match percentages.
10. Remove commerce/popularity claims unsupported by Weft data: fabricated price comparisons, Popular now, fake accounts/alerts.

Research slice B's earlier recommendation to show demo status in ordinary UI was rejected by the owner's brief. The synthetic boundary remains in data and permissions, not decorative badges.

## After implementation

The [independent first pass](visual-review-pass-1.md) opened all 12 production captures. Fixes: visible View details, mobile categories in one scroller, labeled sorting, and localization of all existing color values. The second pass uses the latest production build; see final handoff/QA for status, not the concept scores.
