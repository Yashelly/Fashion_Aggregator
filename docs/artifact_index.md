# Project Artifact Index

Prepared: 2026-05-25

This folder contains the pre-affiliate launch foundation for the fashion discovery MVP.

Core strategy document:

- `../fashion_aggregator_b_2_b_affiliate_strategy_notes_v_2.md`

Pre-application materials:

- `pre_affiliate_application_pack.md`
- `legal/privacy_policy_draft.md`
- `legal/terms_of_use_draft.md`
- `legal/affiliate_disclosure.md`
- `legal/data_source_policy.md`

Operational data:

- `../data/store_tracker.csv`
- `../data/mock_products.csv`

Infrastructure/specs:

- `../sql/001_pre_affiliate_schema.sql`
- `lyst_reference_strategy_ru.md`
- `data_workflow.md`
- `data_workflow_ru.md`
- `data_workflow_ru.html`
- `feed_import_spec.md`
- `clickout_tracking_spec.md`
- `mvp_prd.md`
- `no_design_wireframes.md`

Intended workflow:

1. Replace placeholders in legal/application files.
2. Deploy a simple public site shell using the page structure in `no_design_wireframes.md`.
3. Use `mock_products.csv` for the demo search experience.
4. Apply to first-wave affiliate programs using `store_tracker.csv`.
5. After approval, import real feeds using `feed_import_spec.md`.
6. Track outbound affiliate clicks using `clickout_tracking_spec.md`.

First-wave stores:

- Reserved LT
- Sinsay LT
- Sizeer LT
- MODIVO LT

Important rule:

Do not show a store as a live active product source until it has approved feed access or direct permission.
