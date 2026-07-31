<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# docs

## Purpose

Planning, strategy, and pre-affiliate-application reference material for VIBEWEAR — business/legal/data-workflow documents written to prepare the project for affiliate network review and eventual live-feed integration. **These are non-normative planning docs, not source-of-truth for current app behavior.** The authoritative, current-state documentation lives at the repo root: `DESIGN.md`, `README.md`, and `CLAUDE.md`. When a doc here conflicts with the root docs or with actual code, the root docs and code win. A `legal/` subdirectory holds draft legal-page copy and has its own `docs/legal/AGENTS.md`.

## Key Files

| File | Description |
|------|--------------|
| `mvp_prd.md` | MVP PRD — product summary ("visual fashion search for Lithuanian stores"), MVP goal, and first-wave store list. |
| `no_design_wireframes.md` | Functional page-structure skeleton (global shell, nav, footer) for affiliate review and implementation, deliberately excluding visual design. |
| `clickout_tracking_spec.md` | Spec for the `/out/:productId[?variant=&search_event_id=]` clickout route: first-party click IDs, no IP storage, no on-site checkout, no redirects without affiliate approval. |
| `feed_import_spec.md` | Spec for importing only approved affiliate/partner feeds (never scraping); first-wave feed targets table; idempotent-import and audit-trail principles. |
| `data_workflow.md` | End-to-end data workflow: affiliate approval → feed import → search/product cards → outbound clicks → analytics → scaling. Cross-references `sql/001_pre_affiliate_schema.sql` and both `data/*.csv` files. |
| `data_workflow_ru.md` | Russian-language version of `data_workflow.md` (same scope, includes reconciliation/scaling-to-100k-users/day notes). |
| `pre_affiliate_application_pack.md` | Copy-ready positioning statements and reviewer-facing application answers for affiliate network applications, with `[PROJECT_NAME]`/`[DOMAIN]`/`[CONTACT_EMAIL]`/`[OWNER_NAME_OR_COMPANY]` placeholders (current working value: `VIBEWEAR`). |
| `affiliate_application_readiness_ru.md` | Russian. Phase-1B checklist of what an affiliate-network reviewer needs to see (review-mode labeling, synthetic-catalog disclosure, Factcool LT blocked status, etc). |
| `lyst_reference_strategy_ru.md` | Russian. Positions Lyst as a product/business-model reference ("under the hood: Lyst; in feel: Zara + Pinterest + SSENSE/Farfetch") without being the visual reference. |
| `glami_affiliate_provider_discovery_ru.md` | Russian. Notes on using GLAMI LT as a store-discovery source (not a direct affiliate-network source), with a discovery pipeline: GLAMI → Awin/VIVnetworks/FlexOffers → apply → feed → import. |
| `frontend_design_references.md` | Frontend/design references (e.g. Motion for React animation) evaluated against the current stack (plain CSS + lucide-react, no Tailwind/shadcn yet) — candidate tools, not committed dependencies. |
| `service_connections.md` | Tracks external service/MCP access for Codex/OMX bootstrap work (Supabase, Vercel, PostHog, Sentry, Cloudflare configuration state). Operational/infra notes, not product docs. |
| `demo-product-imagery.md` | Spec for the synthetic demo product imagery: expected filenames (`product-01.webp`…`product-64.webp` + `-tryon` variants), 4:5 portrait aspect ratio, non-branded/original-artwork requirement, graceful placeholder fallback behavior. |
| `artifact_index.md` | Index/table-of-contents for the pre-affiliate launch document set, linking to the legal drafts, data files, and SQL schema. |
| `legal/` | Subdirectory of draft legal-page copy (privacy, terms, affiliate disclosure, data source policy). See `docs/legal/AGENTS.md` — not duplicated here. |

## For AI Agents

### Working In This Directory

- Treat everything here as **planning/reference material for a not-yet-live affiliate business**, written mostly in 2026-05 through 2026-07-29. Several documents (marked `_ru` suffix) are in Russian and mirror an English counterpart at a similar scope (e.g. `data_workflow.md` / `data_workflow_ru.md`) — check both if updating workflow logic, since they can drift out of sync with each other and with `data_workflow_ru.html` referenced inside one of them.
- Do not treat store/commission/status data quoted inside these `.md` files as current — always cross-check against `data/store_tracker.csv`, which is the live-updated version of the same information.
- Do not treat legal-copy templates referenced from `pre_affiliate_application_pack.md` or `artifact_index.md` as what actually ships — the live legal pages (`app/privacy`, `app/terms`, etc.) pull their copy from `lib/i18n.ts`, not from these docs (see `docs/legal/AGENTS.md` for the verified detail).
- If asked to update product behavior/specs, prefer editing `DESIGN.md`/`README.md`/`CLAUDE.md` at the repo root and the actual code; only touch these planning docs when the task is explicitly about affiliate-application strategy, data workflow planning, or historical record-keeping.

## Dependencies

### Internal

None of these files are read by application code at runtime — they are pure documentation, cross-linked to each other and to `sql/001_pre_affiliate_schema.sql` and `data/*.csv` by reference only (relative markdown links), not by any import or build step.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
