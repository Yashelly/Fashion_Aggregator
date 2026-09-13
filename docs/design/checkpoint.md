# Frontend redesign checkpoint

Task: execute the owner's 901-line `WEFT_CODEX_FRONTEND_MASTER_PROMPT_RU.md`, read in full on 2026-09-12. The master prompt supersedes older public demo-copy/hero/navigation choices; synthetic data, neutral store IDs, safe read model and no-redirect boundary remain.

Branch: `codex/weft-frontend-redesign`; started from clean `codex/fix-omx-session-pointer`. No commits/merge/deployment authorized or performed.

Workflow: direct implementation with OMX design governance and native specialized research/audit/review slices. Installed runtime is oh-my-codex 0.21.5 (OMX), Node24.11.1/Windows. No OMC command. No tmux team launched. CLI discovery: `omx --version`, `omx --help`, `omx status`, `omx notepad --help`.

Baseline: Next16.2.12, React19.2.6, npm/package-lock. Typecheck and equivalent lint passed; 37 unit tests passed; search DEV44/44 and REGRESSION47/48, existing REGRESSION-012 wedding over-broad result cap, suite threshold passed. Production build compiled and generated all routes. Browser preview is port3100 with optional external services blanked in process environment for deterministic CSV/local-search tests; private env file unchanged.

Execution checklist:

- [x] Read full master prompt; root docs and applicable directory instructions.
- [x] Inspect runtime; create branch; baseline type/lint/unit/search/build.
- [x] Baseline screenshots, HTTP integration and locale suite (baseline obsolete-selector failure recorded).
- [x] 20-site visual research, >=80 usable screenshots and seven deeper walkthroughs (partial routes labelled).
- [x] External skill ledger: 13 candidates, seven shortlisted, three pinned/inspected/installed/applied.
- [x] Three visual directions, five full semantic palettes, three desktop/mobile control variants; selected A.
- [x] Refresh DESIGN.md; implement unified public experience and safe DTO.
- [x] EN/LT, filters/history, honest account/fitting room/info, error/loading/empty.
- [x] Regression/build/browser/accessibility; two screenshot review passes, with discovered defects repaired.
- [x] Final controlled performance comparison, refreshed screenshots, catalog-fault/sparse fixture and delayed-navigation proof.
- [x] Independent review and final handoff.

Current evidence: 3,004 locale assertions, 207 actual internal links, 100 same-tick locale races, zero browser errors. General browser matrix 21 pass / 0 fail; 24 axe scans zero violations. Three-run controlled BEFORE at HEAD e601f4b with current patched Next16.3.5 is complete; old initial baseline is retained but has a framework/build-time catalog-config confounder. Current preview is port3100, with external variables blanked at BOTH build and runtime. Earlier builds could use the public/RLS catalog because NEXT_PUBLIC variables were inlined; runtime Gemini/admin/PostHog were disabled. No production writes.

All client detail/saved DTOs are explicitly public. Actual local 3D mannequin replaces SOON; six targeted interaction checks and final mobile screenshot confirmation pass. Error injection proves a real500 and successful same-URL reload recovery after fixing the cached-reset behavior. Final build passes on Next16.3.5/sharp0.35.4; npm audit zero. No ranker tuning, migrations, public error flags, deployment, commit or merge.

Final update11:02UTC: all local safe branches complete. Fresh build/typecheck,56 unit tests,15 integration checks,DEV44/44/REG47/48 with the same initial wedding-case failure, npm audit0, and repeated full locale3004 pass. Controlled delayed RSC×3, catalog500→Retry, sparse product EN/LT and final3D6/6 pass. Final primary12, secondary40 and populated-saved4 captures regenerated from latest code, visually reviewed; no blocking visual issue remains. Final lab LCP928/1172ms, blocking proxy220/159ms; honest byte and LCP trade-offs in performance-final.md. Final report is handoff.md, acceptance.md records all30 criteria and genuine evidence gaps. Preview remains localhost3100. No further implementation work is pending; physical AT/live-provider/PG-container checks are explicitly unavailable, not claimed passes.
