<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# docs/legal

## Purpose

Four draft legal documents (all "Last updated: 2026-05-25", all containing unfilled `Weft` / `[DOMAIN]` / `[CONTACT_EMAIL]` / `[OWNER_NAME_OR_COMPANY]` placeholders) prepared as reference copy for the pre-affiliate application phase. **These are drafts, not live legal pages.** Verified by reading both this directory and the actual routes: the real, in-production legal pages (`app/privacy/page.tsx`, `app/terms/page.tsx`, and by the same pattern `app/affiliate-disclosure/page.tsx`, `app/data-sources/page.tsx`) contain **no import of anything under `docs/legal/`** — a repo-wide grep for `docs/legal` across `app/` and `lib/` returns zero matches. Instead, every live legal page calls `getCopy(locale).pages.<page>` from `lib/i18n.ts`, which holds fully independent, already-localized (EN/LT) copy blocks (`pages.privacy`, `pages.terms`, `pages.dataSources`, presumably `pages.affiliateDisclosure`). The markdown files here and the shipped copy in `lib/i18n.ts` are two separate, currently-divergent texts that happen to cover the same legal topics.

## Key Files

| File | Description |
|------|--------------|
| `privacy_policy_draft.md` | Draft privacy policy: data collected (technical data, search queries, filters, outbound clicks, UTM params, cookie prefs), legal bases (legitimate interest/consent/contract/legal obligation), retention guidance (raw logs 30-90 days, analytics 12-24 months), user rights, children's-data statement. |
| `terms_of_use_draft.md` | Draft terms of use: describes the service as discovery-only (no checkout/no reseller status), affiliate-link disclosure, acceptable-use restrictions (no scraping/disruption), no-guarantee clause for product/price accuracy, IP ownership split (site vs. retailer trademarks), removal-request contact. |
| `affiliate_disclosure.md` | Draft affiliate disclosure: explains commission-on-purchase model, that purchases happen on retailer sites, that affiliate relationships don't imply endorsement, and that rankings may factor in commercial relationships alongside relevance/availability. |
| `data_source_policy.md` | Draft data source policy: enumerates allowed product-data sources (approved feeds/deeplinks/direct permission/mock-synthetic data), explicitly rules out scraping-first catalogs, states the first-wave source list (Reserved LT, Sinsay LT, Sizeer LT, MODIVO LT, Cropp LT, ABOUT YOU LT) and flags Factcool LT as monitoring-only due to suspended LT sales. |

## For AI Agents

### Working In This Directory

- Do not assume editing a file here changes what users see on `/privacy`, `/terms`, `/affiliate-disclosure`, or `/data-sources` — it does not. To change the live legal copy, edit the corresponding `pages.*` block in `lib/i18n.ts` (both the `en` and `lt` sections, kept as sibling objects in that file).
- These drafts exist for affiliate-network reviewers and internal reference (see `docs/pre_affiliate_application_pack.md` and `docs/affiliate_application_readiness_ru.md`) — useful as a checklist of legal topics to eventually cover, not as a copy source to port verbatim without adapting to the shipped `lib/i18n.ts` tone/structure.
- If a task asks to "update the privacy policy" or similar without specifying draft vs. live, clarify or default to updating `lib/i18n.ts` (the thing users actually see) and mention that this directory's draft is now out of sync unless also updated.
- All four files still contain unresolved template placeholders (`Weft`, `[DOMAIN]`, `[CONTACT_EMAIL]`, `[OWNER_NAME_OR_COMPANY]`) — do not treat them as publish-ready without filling those in first.

## Dependencies

### Internal

None. Confirmed via grep: no file under `app/` or `lib/` imports or reads from `docs/legal/`. These are referenced only by other documentation (`docs/artifact_index.md`, `docs/pre_affiliate_application_pack.md`) via markdown links, never by application code.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
