# Deep Interview Spec: VIBEWEAR Site Audit — Visual, UX, and Functionality

## Metadata
- Interview ID: vibewear-ui-redesign-2026-07-30
- Rounds: 11 (+ Round 0 topology)
- Final Ambiguity Score: 18%
- Type: brownfield
- Generated: 2026-07-30
- Threshold: 0.2 (20%)
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.80 | 35% | 0.28 |
| Constraint Clarity | 0.80 | 25% | 0.20 |
| Success Criteria | 0.85 | 25% | 0.2125 |
| Context Clarity | 0.85 | 15% | 0.1275 |
| **Total Clarity** | | | **0.82** |
| **Ambiguity** | | | **0.18** |

## Topology

| Component | Status | Description | Coverage Note |
|-----------|--------|-------------|----------------|
| Visual Design | active | Colour, typography, composition, imagery, motion | Goal 0.9, Constraints 0.8 (repo-branch prototype), Criteria 0.7 (live comparison needed) |
| UX / Clarity | active | Navigation, wording, demo-status explanation, feature discoverability | Goal 0.75, Constraints 0.75, Criteria 0.65 (written audit doc) |
| Product Functionality | active | Which features to show/strengthen/add/cut | Goal 0.75, Constraints 0.75, Criteria 0.7 (written recommendation doc) |

No components deferred. All three converged (Round 8, Ontologist mode) on a single unified deliverable: a **Site Audit and Recommendations** artifact spanning all three, rather than three independent efforts.

## Goal

Produce one unified **"Site Audit and Recommendations"** artifact for the VIBEWEAR site covering three facets, without implementing any new product functionality in this pass:

1. **Visual Design** — a working, in-repo prototype (real code changes on a branch, git-reversible) presenting **exactly 2 visual variants** for live comparison:
   - Variant A: the current `DESIGN.md` visual language, taken to full, consistent polish (fixed spacing inconsistencies, weak detailing, unfinished animation/motion) — this is the "what if we just finished it properly" baseline established in Round 5's contrarian check.
   - Variant B: one new visual direction (palette/typography/composition), to be defined during execution/planning since the user could not specify it verbally and needs to see it to decide (confirmed Round 5 and Round 10).
2. **UX / Clarity** — a written audit identifying specific navigation/information-architecture legibility problems (the stated concern: users may not understand where things are or how to move between sections), with concrete recommendations. Full scope of the audit (labels/breadcrumbs only vs. structural reorganization) is intentionally left open — the user could not specify a minimal fix and explicitly asked for an audit first (Round 7).
3. **Product Functionality** — a written audit of every current function (search/filters, product cards, demo stores, product detail page, AI fitting room mock, account mock) with a keep/improve/cut recommendation each, plus a list of candidate new functions with brief rationale for each. No new functions are built in this pass — only proposed (Round 1, Round 6).

## Constraints

- No new product functionality is implemented in this pass — audit and recommend only (Round 1, Round 9 confirmed scope).
- The visual prototype must be real, git-reversible edits in the actual repository (e.g. on a feature branch), not a separate non-invasive mockup/Artifact — confirmed explicitly in Round 9.
- The final deliverable must support a **live way to compare** the two visual variants (not just "check out this git branch") — confirmed Round 11. The exact mechanism (in-app toggle vs. two preview deployments) is an implementation decision deferred to the next planning stage, not resolved here by design (deep-interview gates on *what*, not *how*).
- (Carried forward from existing project documentation, not re-litigated in this interview because it was never challenged and is core to the product's identity — see `CLAUDE.md`/`DESIGN.md`/`README.md`): no real retailer names, logos, or live purchase/checkout functionality may be introduced; the site remains a synthetic demo. Flagged in Assumptions table below for explicit user confirmation.
- Visual Variant A must stay within accessibility requirements already documented in `DESIGN.md` (WCAG 2.2 AA, `prefers-reduced-motion`, visible focus states) since it is explicitly framed as "the same language, finished properly," not a rules relaxation. Whether Variant B (the new direction) must also meet these same accessibility bars was not explicitly asked and should be confirmed at planning time — flagged as an open gap.

## Non-Goals

- Building or wiring up real backends for the AI Fitting Room or Account mocks (explicitly out of scope — audit/recommend their fate, don't implement).
- Any live retailer catalog, real checkout, or real purchase flow.
- A full structural rebuild of the site's navigation — only if the audit recommends it, and only as a recommendation, not an implementation, in this pass.
- Deciding the exact new visual direction (palette/typography) in advance of seeing it — deferred to execution by design.

## Acceptance Criteria

- [ ] A single audit document exists covering all three facets (visual, UX, functionality).
- [ ] The Product Functionality section lists every current function with an explicit keep/improve/cut recommendation and a rationale.
- [ ] The Product Functionality section lists candidate new functions with brief rationale each.
- [ ] The UX section identifies specific navigation/IA problems (not generic statements) and gives concrete recommendations.
- [ ] A working code prototype exists on a git branch implementing exactly 2 visual variants (polished-current + 1 new direction).
- [ ] Variant A (polished current) demonstrably fixes at least the specific weaknesses named in Round 5 (inconsistent spacing, weak detail, unfinished animation) and still passes the existing `DESIGN.md` accessibility bar (WCAG 2.2 AA, reduced-motion, focus visibility).
- [ ] There is a live, in-browser way to compare Variant A and Variant B side by side or via toggle — not merely "switch git branches."
- [ ] No new user-facing product functionality is implemented; no real retailer data, branding, or checkout is introduced.
- [ ] `npm run build` (typecheck + production build) passes for the branch containing the visual prototype.

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "Talk about functions" means real feature implementation | Round 1: asked what result should follow the discussion | Resolved: audit + written recommendations, no implementation now |
| "Maximally beautiful" requires discarding `DESIGN.md`'s visual language entirely | Round 5 (Contrarian): what if the current language just needs finishing, not replacing? | Resolved: user wants to compare a *fully polished current language* against *one new direction*, not commit to either upfront |
| Visual, UX, and Functionality are three independent workstreams | Round 8 (Ontologist): all three answers converged on "audit first, decide by seeing/reading" | Resolved: one unified "Site Audit and Recommendations" artifact, still tracked as 3 scoreable facets |
| Visual comparison can happen via a git branch checkout | Round 9 confirmed real repo edits; Round 11 asked how the user wants to review it | Resolved: a *live* in-browser comparison is required, not a branch checkout — exact mechanism deferred to planning |
| The core demo-data boundary (no real retailer catalog/checkout) still applies | Raised in Round 8's combined question; not explicitly re-confirmed by a direct answer | **Not directly re-confirmed by the user in this interview** — carried forward from `CLAUDE.md`/`DESIGN.md`/`README.md` as an extremely well-established existing project rule. Flag for explicit confirmation before execution if there is any doubt. |

## Technical Context

Brownfield: Next.js 16 (App Router), React, TypeScript strict, custom CSS with semantic custom-property tokens (`app/globals.css`), no CSS-in-JS/CSS modules. Relevant existing artifacts already produced this session and directly reusable for execution:
- `DESIGN.md` — current visual language / brand contract (the thing Variant A "finishes" and Variant B may diverge from).
- `CLAUDE.md` + hierarchical `AGENTS.md` set (`app/AGENTS.md`, `components/AGENTS.md`, `lib/AGENTS.md`, etc.) — architecture map, including which components are client vs. server, where copy lives (`lib/i18n.ts`), and known existing debt (several components inline `locale === "lt"` ternaries instead of using `lib/i18n.ts`; `public/hero-assets/` appears currently unreferenced in code).
- Theme toggle precedent already exists (`data-theme` attribute + `localStorage`, see `components/site-header.tsx` and `app/layout.tsx`'s pre-hydration script) — a natural mechanical pattern for an in-app live variant-comparison toggle, though the final mechanism choice belongs to the planning stage.
- Known functional inventory to audit: search/filters (`app/search/page.tsx`, `lib/mock-products.ts`), product cards (`components/product-grid.tsx`), demo stores (`lib/demo-stores.ts`, `app/stores/page.tsx`), product detail/click-guard (`app/out/[productId]/page.tsx`), AI Fitting Room mock (`components/ai-fitting-room.tsx`, no backend), Account mock (`components/account-dashboard.tsx`, `localStorage` only, no backend).

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| User | core domain | locale pref, theme pref | browses Product, uses Search, views AccountMock |
| Product | core domain | title, price, image, category | belongs to DemoStore, viewed via ProductDetailPage |
| Search/Filters | feature | query, category, color, gender, price | returns Product |
| DemoStore | supporting | id, label | groups Product |
| ProductDetailPage | feature/surface | — | shows Product, no real purchase |
| AIFittingRoomMock | mock feature | — | selects Product, no backend |
| AccountMock | mock feature | preferences (localStorage) | no backend |
| DesignSystem | supporting artifact | tokens, fonts, motion rules | currently instantiated in `DESIGN.md` + `app/globals.css`; Variant A/B both derive from or diverge from this |
| SiteNavigation | supporting UI structure | header/footer/menu | connects all routes; subject of UX audit |
| SiteAuditReport | deliverable | visual section, UX section, functions section | produced from Product, DesignSystem, SiteNavigation; the crystallized unified artifact from this interview |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 7 | 7 | - | - | N/A |
| 2 | 8 | 1 | 0 | 7 | 87.5% |
| 3 | 9 | 1 | 0 | 8 | 88.9% |
| 4–10 | 9 | 0 | 0 | 9 | 100% |
| 11 | 10 | 1 | 0 | 9 | 90% |

## Interview Transcript
<details>
<summary>Full Q&A (11 rounds + Round 0 topology)</summary>

### Round 0 — Topology
**Q:** Confirm 3 top-level components: Visual Design, UX/Clarity, Product Functionality.
**A:** Да, всё верно.

### Round 1 — Product Functionality / Goal
**Q:** Что должно быть результатом обсуждения функций?
**A:** Аудит+рекомендации плюс обсуждение новых функций для добавления (опции 1+4).
**Ambiguity:** 82%

### Round 2 — Visual Design / Goal
**Q:** Полировать текущий язык или пересмотреть с нуля?
**A:** Пересмотреть с нуля.
**Ambiguity:** 83%

### Round 3 — UX/Clarity / Goal
**Q:** Какая конкретная проблема стоит за «понятностью»?
**A:** Не ясна навигация/структура.
**Ambiguity:** 73%

### Round 4 — Visual Design / Constraints
**Q:** Что остаётся жёстким при пересмотре визуала, а что можно трогать?
**A:** Ещё не знаю, что хочу.
**Ambiguity:** 72%

### Round 5 — Visual Design / Goal (Contrarian)
**Q:** Что если проблема не в языке, а в недоведённом исполнении? Довели бы до полировки — было бы «то»?
**A:** Не уверен, надо увидеть.
**Ambiguity:** 68%

### Round 6 — Product Functionality / Criteria
**Q:** Что должно получиться на выходе, чтобы сказать «да, это то, что нужно»?
**A:** Письменный документ-рекомендация.
**Ambiguity:** 68%

### Round 7 — UX/Clarity / Criteria (Simplifier)
**Q:** Какой минимально достаточный результат уже считался бы успехом?
**A:** Не уверен, надо аудит.
**Ambiguity:** 68%

### Round 8 — Cross-component (Ontologist)
**Q:** Не нужен ли на самом деле один артефакт — «Аудит сайта и рекомендации»?
**A:** Один артефакт, но с макетами/прототипом.
**Ambiguity:** 56%

### Round 9 — Cross-component / Constraints
**Q:** Прототип — реальные правки в репо или отдельный неинвазивный мокап?
**A:** Правки прямо в репо (через ветку/git).
**Ambiguity:** 44%

### Round 10 — Visual Design / Goal
**Q:** Сколько вариантов визуала показать, включать ли доведённый текущий как один из них?
**A:** 2 варианта: текущий (доведённый) + 1 новый.
**Ambiguity:** 29%

### Round 11 — Cross-component / Criteria
**Q:** Один документ со ссылкой на ветку, или нужен live-способ сравнения?
**A:** Нужен live-способ сравнения.
**Ambiguity:** 18%

</details>
