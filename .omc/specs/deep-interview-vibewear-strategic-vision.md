# VIBEWEAR Strategic Vision — Deep Interview Spec

**Interview ID:** vibewear-strategic-vision-2026-07-31
**Threshold:** 1% (source: `.claude/settings.json` → `omc.deepInterview.ambiguityThreshold`)
**Final ambiguity:** ~5.85% (mathematical floor — remainder is future facts that don't exist yet: a specific brand's response, their feed format, the exact final name/visual)
**Rounds:** 55 (34 in the first pass + 21 in a deliberate second pass after the user challenged an unsubstantiated score and asked to keep pushing)
**Type:** Brownfield, greenfield-scope hybrid (existing Next.js MVP, but redefining the whole product direction)

This spec supersedes the priority framing (not the concrete findings) of
`.omc/specs/deep-interview-vibewear-site-audit.md`. That earlier spec's
Visual/UX/Functionality audit findings remain valid evidence; this document
sets the actual order of operations and the *why* behind it.

---

## Topology (5 components)

1. **Vision & Goals** — what VIBEWEAR fundamentally is and why it should exist
2. **Business Model** — how it makes money, legally and practically
3. **Scope & Roadmap** — what gets built, in what order
4. **Tech Strategy** — how it gets built, with what tools/constraints
5. **Brand & Visual** — what it looks like and is called

---

## 1. Vision & Goals

- **This is a real business intended to generate income**, not a portfolio piece.
- **Core differentiator (verified against actual code — was previously assumed
  to partly exist, it does not):**
  - **Semantic/visual search** — a query like "hoodie with stars" should match
    by visual/conceptual content, not just literal keyword text. Current
    `lib/mock-products.ts` `filterProducts()` does token-based text matching
    only (plus a price-under parser) — no embeddings, no semantic layer.
  - **Cross-brand aggregation** — one place instead of jumping between every
    brand's own site.
  - **Cross-store price/size comparison for the *same item*** — currently does
    not exist; there is no product-identity matching across stores in the data
    model (each product belongs to exactly one demo store).
  - **AI Fitting Room** — a real virtual try-on, positioned as something not
    yet available in Lithuania. **Currently a no-backend mock** (confirmed:
    user is aware it's fake and wants it built for real, not a misunderstanding).
- **Failure tolerance:** any willing brand counts as a valid first affiliate
  partner — not limited to the 6 large Lithuanian retailer names referenced in
  the README. This removed an earlier single-point-of-failure risk.
- **Revenue target:** deliberately left open — "figure it out by fact," not
  from lack of thought.
- **Timeline:** there is real external pressure (money/circumstances). Work
  itself still happens in irregular bursts (not a steady cadence), but there
  is an internal, non-negotiated mental deadline on the order of **weeks to a
  couple of months**.
- **Explicit tension, consciously accepted:** the full scope below (rebrand +
  real semantic search + cross-store matching + real AI fitting + visual +
  first live affiliate deal) is a lot for "weeks/couple months" solo + AI
  tooling. The user was asked directly and confirmed: accept the tension, keep
  moving, do not preemptively cut scope.

## 2. Business Model

- Affiliate revenue is the core; multiple sources may exist alongside it, but
  **"without affiliate, the whole project loses its point — need other
  people's actual products."**
- Any willing brand is an acceptable first partner (not limited to 6 large
  chains).
- **Legal/compliance (previously fully unexamined):** before the first real
  affiliate link goes live, the site needs affiliate-link disclosure, likely
  an EU/Lithuania cookie-consent banner, and a GDPR-adequate privacy policy.
  - **Owner:** the assistant drafts a baseline proactively — this is a
    roadmap item ("Legal compliance baseline"), not something waiting on an
    external lawyer, and not something left open until it's urgent.
  - **Timing:** must be in place before the first live affiliate link goes
    out.
- **Data feed format from a real brand:** unknown today ("надо изучить, я без
  понятия как они это дают") — genuinely can't be known until a brand
  actually agrees. **Resolution:** the assistant researches typical
  affiliate-feed formats (CSV/XML/API patterns from networks like
  Admitad/CJ, and common direct-brand handoff shapes) ahead of time so the DB
  schema is flexible, rather than waiting and building schema for one format.
- **Demo catalog fate:** the current 6 synthetic demo stores are fully
  fictional, not modeled on real outreach targets. Once the first real brand's
  data lands, **the demo catalog is removed entirely** — no permanent
  coexistence.
- **Premium/subscription (rough direction, not final):** paid tier =
  more/smarter AI Fitting Room usage or more/deeper semantic search, not
  ad-removal or early sale access. Exact pricing/tiers are intentionally not
  set yet.
- **Analytics/monitoring (PostHog infra already exists in code):** stays
  inactive until there is real traffic/real affiliate links — no value in
  watching demo-catalog behavior.
- **Resourcing constraint, confirmed even after scope grew:** solo + paid
  tools/AI services — no freelancers or external hires, including for
  branding/logo.

## 3. Scope & Roadmap

**Revised priority order (this is a real update to an earlier, more general
answer of "visual/UX first" — confirmed explicitly by the user as an
intentional revision, not a misread question):**

1. **Name / rebrand** — "VIBEWEAR" is confirmed **not** final ("точно будет
   сменено, таких уже дохуя названий"). Process: the assistant proposes
   candidate names (accounting for project identity, domain/social-handle
   availability); the user picks. This blocks the visual work below, because
   colors/video built now would partially need redoing under a new brand.
2. **Semantic visual search + cross-store price/size comparison** — the
   actual headline differentiators, verified not yet built. Explicitly ranked
   above visual polish: "это важнее визуала."
3. **Visual / branding execution** — light canvas from Variant B, dark canvas
   from Variant A, a replacement for the disliked acid-lime accent, hero
   video. (See §5 for full detail — unchanged in substance, just reordered to
   come after #1 and #2.)
4. **Real AI Fitting Room build** — replacing the current mock with an actual
   working feature. Placed after visual, before "everything else."
5. **Everything else** — including finer-grained scope like exact premium
   tiers, further audit-recommended fixes (Account mock honesty gap, demo
   store differentiation, nav-structure duplication in `lib/i18n.ts` vs. the
   hand-written nav), etc.

**Immediate housekeeping (explicitly requested, not just an interview
artifact):**
- Merge `feature/site-audit-visual-ux` into `main` now; start the new
  name→search→visual work from a fresh branch off `main`.
- Remove the Variant A/B comparison toggle from the header at that merge — it
  was a review tool, never meant for production, and its audit-time purpose
  (comparing canvases) is now resolved (light=B, dark=A).
- Update `DESIGN.md` and the old audit spec now, so they don't describe a
  stale visual direction while the new priority order is being executed.
- The user wants a **written, in-repo roadmap artifact with explicit
  done/next checklist state** for the name→search→visual→AI-fitting chain —
  not just verbal status updates. This should be produced as part of
  execution, not left as a mental model only.

## 4. Tech Strategy

- **DB preparation:** wants the database schema ready *before* any real
  affiliate feed exists, specifically flexible enough to absorb an unknown
  future format (see §2 feed-format research task).
- **Semantic search / product-matching implementation approach:** fully
  delegated — "предложи лучший подход." No existing technical preference for
  embeddings/vector DB/LLM-tagging.
- **Quality bar for semantic search before shipping:** a concrete pass/fail
  threshold, not a subjective gut-check (unlike the visual work). Process:
  the assistant builds a test query set (e.g. "hoodie with stars," "red
  sneakers") and proposes a numeric threshold (e.g. 80% of test queries must
  match correctly); the user approves the threshold, doesn't invent it
  unprompted.
- **Analytics activation:** wait for real traffic, not demo-catalog usage.
- Constraint (solo + AI tooling) explicitly holds even for the newly-revealed,
  larger technical scope (embeddings/matching infra + real AI fitting +
  rebrand) — no plan to bring in outside engineering/design help.

## 5. Brand & Visual

- **"Done" criteria is a personal, subjective live look** — same pattern as
  the earlier A/B canvas comparison, not a formal checklist (contrast/motion
  bars from the original audit are a floor, not the acceptance test).
- **Name is confirmed non-final; process is assistant-proposes /
  user-picks** (see §3, item 1).
- Reviewer feedback already captured from the first audit pass (carried
  forward unchanged, still the target once naming is settled):
  - Canvas: **white preferred** (Variant B's crisp white/near-black over
    Variant A's warm paper/espresso).
  - **Acid-lime accent rejected in both variants** — needs a real
    replacement, not yet chosen. Known surface area:
    `.button.inverse`, `.category-links a:hover`, `.runway-links a:hover`,
    `.demo-store-icon` in `app/globals.css`.
  - **Dark mode should come from Variant A**, not B — Variant B's dark
    surfaces measurably skew blue/purple; Variant A's are neutral/warm and
    read as correct.
  - Target merged direction: light = Variant B canvas tokens, dark = Variant
    A canvas tokens, accent = neither current acid-lime, **plus** a hero
    video (user has source material ready, needs assembly — timeline
    explicitly left dependent on "как ИИ его соберёт", i.e. AI-polish
    quality, accepted as open).

---

## Key decisions at a glance

| Question | Resolution |
|---|---|
| Priority order | Name → semantic search/comparison → visual → real AI fitting → everything else |
| Brand name | Not final; assistant proposes candidates, user picks |
| Legal/GDPR baseline | Assistant drafts now, ships before first live affiliate link |
| Feed format | Unknown until a brand agrees; assistant pre-researches typical formats for a flexible schema |
| Demo catalog | Fully removed once first real brand's data lands |
| Semantic search quality bar | Assistant proposes test-query set + numeric threshold, user approves |
| Premium direction | More/smarter AI fitting or semantic search usage (not ads/early-access) |
| Analytics activation | Only once real traffic/links exist |
| Resourcing | Solo + paid tools/AI, no freelancers, even at larger scope |
| Timeline | Weeks–couple months, real external pressure, deliberately accepted tension with scope |
| Branch strategy | Merge `feature/site-audit-visual-ux` → `main` now; new work from a fresh branch |
| A/B toggle | Removed from header at that merge |
| Progress tracking | Wants an explicit in-repo done/next roadmap checklist artifact |

## Deliberately open (the remaining ~5%, not gaps — future facts)

- Exact revenue target — to be learned by fact, not projected now.
- Exact hero-video ship date — depends on AI-assembly polish quality.
- Exact final brand name and exact new accent color — outputs of the
  proposal→pick process above, don't exist yet.
- Exact affiliate feed format — depends on which brand actually agrees.
- Exact premium pricing/tiers — direction set, numbers not set.
