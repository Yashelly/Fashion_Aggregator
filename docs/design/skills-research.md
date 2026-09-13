# External skill research for the Weft redesign

## Installation and actual application — leader update, 2026-09-12

Installed exactly three new workspace-local folders after full source inspection: `.codex/skills/frontend-design`, `.codex/skills/accessibility`, `.codex/skills/core-web-vitals`. No existing folder overwritten. Official OpenAI skill-installer helper itself was completely inspected, then used in pinned download mode. No upstream scripts, engine, global package, telemetry or credential setup was run. These local runtime folders follow the repository's existing ignore policy and are not application assets.

Each folder retains the upstream license and a PROVENANCE.md. Accessibility contrast units were corrected from px to pt-derived CSS px; core-web-vitals received pinned local MEASUREMENT/RUM references and repaired links. `skill-creator`'s validator passes all three (on Windows use `python -X utf8` for the upstream Unicode Markdown). The corrections are narrow adaptations, not a claim of unchanged upstream content. Automatic discovery was not refreshed in this running turn; full explicit reads and application are verified now, future runtime discovery remains a next-turn/session action.

Concrete application: frontend-design informed the three private rendered directions, factual copy and compact editorial catalog; accessibility informed native filter/gallery dialogs, radio group, independent save buttons, focus restoration, shared locale and axe/browser review; core-web-vitals informed server-first boundaries, reserved image geometry, single eager hero image, no added fonts, removal of the deliberate 620 ms delay, and three-run controlled baseline/after observations. It did not authorize RUM, speculative AI calls or production tracking. [Rendered decisions](directions-and-decisions.md), [contrast](palettes.md), and QA artifacts provide observable evidence.

Actual orchestration discovery: OMC command absent; installed OMX/oh-my-codex 0.21.5 available. Used its installed design contract workflow, native typed audit/research/execution/review agents and a real `omx notepad notepad_write_working` checkpoint (`success:true`). No tmux team, fabricated OMC call, consensus authority or native goal was claimed.

The historical research/installation recommendation below is retained for provenance; pending statements there describe the research lane before this installation update. Rollback is limited to these exact three newly installed directories, validated under the workspace; no rollback was executed.

Checked: **2026-09-12**. Status: research and read-only comparison complete; **this report does not claim installation or runtime discovery**. The lead agent owns installation, invocation and final evidence. No application files, dependencies, global settings or orchestrator configuration were changed by this research lane.

## Decision

Recommend three complementary workspace-local text skills: **Anthropic frontend-design**, **Addy Osmani accessibility**, and **Addy Osmani core-web-vitals**. They cover visual direction, interaction/accessibility, and measured performance without adding an application dependency or executable skill runtime. Apply the explicitly documented corrections below; upstream skill prose is advisory and does not outrank the user's brief, W3C requirements or Next.js 16 documentation.

The current Impeccable release is a useful design reference, but it downloads/runs a separate engine and writes a user cache. Its larger execution surface is unnecessary for this task's minimal installation set. This is a scope decision, not a finding that the project is malicious.

## Evidence and method

Searched the web for actual upstream repositories, then used GitHub repository/commit/tree APIs and pinned raw-file HTTP reads. Read every candidate's `SKILL.md`; read all files in the three selected skill directories, both shared performance references required by core-web-vitals, and the linked performance/audit overview instructions. Read Impeccable's complete Windows launcher and Operate design reference for the comparison. Did not execute downloaded code, run package installers, fetch secrets, or send project source to an external service. Only public URLs were requested.

This is a bounded content and capability inspection, **not a security certification or binary audit**. Unselected packages' entire script trees and transitive resources were not audited. No popularity metric was used as a quality score.

## Source pins

| ID | Upstream / author | Full commit | Commit date | License evidence |
| --- | --- | --- | --- | --- |
| A | [anthropics/skills](https://github.com/anthropics/skills/tree/34040c9c568585f6929bedeaad110ad08f079624), Anthropic | `34040c9c568585f6929bedeaad110ad08f079624` | 2026-09-10 | Selected [frontend-design/LICENSE.txt](https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/frontend-design/LICENSE.txt): Apache-2.0; webapp-testing and theme-factory license headers also checked |
| V | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278), Vercel | `063bee94c3f4df8453406c830b0a7df0f2860278` | 2026-08-28 | React/composition/transition skills declare MIT in frontmatter. No license declaration in examined web/writing guideline skill files; repository API reports no recognized license. Do not infer permission to redistribute those two files. |
| Q | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/afa8da942115f2961fdbfa80807ea0b232ff6c00), Addy Osmani | `afa8da942115f2961fdbfa80807ea0b232ff6c00` | 2026-08-24 | [LICENSE](https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/LICENSE): MIT, copyright 2026 Addy Osmani |
| I | [pbakaus/impeccable](https://github.com/pbakaus/impeccable/tree/cb56ed6c19a07329a9fa0cd4e657bee040156593), Paul Bakaus / repository contributors | `cb56ed6c19a07329a9fa0cd4e657bee040156593` | 2026-09-10 | Repository [LICENSE](https://github.com/pbakaus/impeccable/blob/cb56ed6c19a07329a9fa0cd4e657bee040156593/LICENSE): Apache-2.0; skill frontmatter version 4.3.1 |

## Candidate ledger: 13 real skills

Every row was checked on the date above and inherits its source pin. “Text” means no executable launcher is required by that skill, not that every suggested example is automatically suitable. Read/edit permissions refer only to task-scoped local files. Browser testing additionally needs access to the local application.

| Candidate and primary source | Version / license | Runtime, dependencies and expected permissions | Strength / decision |
| --- | --- | --- | --- |
| [A frontend-design](https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/frontend-design/SKILL.md) | Commit A; Apache-2.0 | SKILL.md + LICENSE only; text-capable agent; local source/design reads and authorized edits; browser screenshots optional; no scripts, package install or credentials | **Select; shortlist.** Ground typography/composition in clothing and the brief; strong restraint and honest UX writing. No retail data model assumptions. |
| [I impeccable](https://github.com/pbakaus/impeccable/blob/cb56ed6c19a07329a9fa0cd4e657bee040156593/.agents/skills/impeccable/SKILL.md) | 4.3.1; Apache-2.0 | Codex-compatible `.agents` package; platform engine launcher; GitHub release download, local process execution, user cache writes; optional hooks/browser tooling | **Reference only; shortlist.** Excellent distinction between task-oriented and expressive surfaces. Reject installation here because the engine and hook surface add unnecessary moving parts. |
| [Q accessibility](https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/accessibility/SKILL.md) | 2.0; MIT | Text plus two Markdown references; browser/keyboard and optional axe or Lighthouse; source reads/edits; no bundled executable. Contains a global npm-install example which must not be used. | **Select with corrections; shortlist.** Rendered semantics, native controls, focus, reflow, status and language checks fit search/filter states. See factual caveat below. |
| [Q core-web-vitals](https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/core-web-vitals/SKILL.md) | 2.0; MIT | Text plus LCP/INP/CLS references and shared measurement/RUM references; browser traces or compatible local Lighthouse; no bundled executable or required API key | **Select with Next.js caveat; shortlist.** Separates source hypotheses, lab observations and field evidence; constrains image/font regressions. |
| [Q performance](https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/performance/SKILL.md) | 2.0; MIT | Text; browser and optional lab tooling; examples include caching, service workers and RUM which are outside this frontend change unless separately justified | **Hold; shortlist.** Useful shared measurement reference; installing the whole skill duplicates core-web-vitals. Its Latin-only font subset example would omit Lithuanian letters. |
| [V react-best-practices](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/SKILL.md) | 1.0.0; MIT declared | Agent text and large Markdown rule set; React/Next code reads/edits; optional SWR/better-all examples are not necessary installs | **Hold; shortlist.** Relevant server/client serialization and waterfall review, but 70 rules exceed the narrow visual-change need. Preserve existing search/data architecture. |
| [V web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines/SKILL.md) | 1.0.0; license unresolved in examined files | Text wrapper; fetches live `vercel-labs/web-interface-guidelines/main/command.md` before each review; local read access, outbound public HTTP | **Hold; shortlist.** Concise interface review; live-rule drift and unclear redistribution license make pinned selected alternatives preferable. Linked remote rule set not fully audited because not selected. |
| [V composition-patterns](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/composition-patterns/SKILL.md) | 1.0.0; MIT declared | Text and Markdown rules; React source edits; React 19-only portion explicitly conditional; no runtime required by instructions | **Do not install.** Useful for reusable component API refactors, but risks broadening a visual redesign into unnecessary abstraction changes. |
| [V react-view-transitions](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-view-transitions/SKILL.md) | 1.0.0; MIT declared | Text and reference guides; browser/React compatibility requirements; outside Next it suggests React canary installation | **Do not install.** Motion is P3; experimental/version-sensitive API guidance needs independent verification. Do not change React release channel for this brief. |
| [V writing-guidelines](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/writing-guidelines/SKILL.md) | 1.0.0; license unresolved in examined files | Text wrapper; live fetch of `vercel-labs/writing-guidelines/main/command.md`; local docs reads | **Do not install.** Documentation prose review does not establish Lithuanian UX grammar or pluralization; selected frontend skill already supports plain action copy. |
| [A webapp-testing](https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/webapp-testing/SKILL.md) | Commit A; Apache-2.0 | Python + Playwright + browser binaries; `with_server.py` launches subprocesses; screenshots/local files; helpers and examples not audited for execution | **Do not install.** Existing browser/testing workflow can serve the task. Skill instructs running scripts before reading source, contrary to the user's inspection requirement; also overuses `networkidle`. |
| [A theme-factory](https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/theme-factory/SKILL.md) | Commit A; Apache-2.0 | Text + preset themes + PDF showcase; PDF viewing and artifact edits; no required runtime stated in SKILL.md | **Do not install.** Presentation-oriented preset selection and mandatory user theme choice conflict with the user's independent design brief. |
| [Q web-quality-audit](https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/web-quality-audit/SKILL.md) | 2.0; MIT | Text plus optional `scripts/analyze.sh`, browser/Lighthouse; Bash required only for the optional analyzer, whose source was not audited | **Do not install.** Broad SEO/security/agentic-browser audit duplicates chosen focused skills and may expand scope; retain its distinction between observed and inferred issues. |

Shortlist: seven candidates marked above. Chosen set: three. No newly found external skill is claimed to verify EN/LT copy by itself; use the project's existing locale machinery, the explicit bilingual brief, and visible narrow-width checks.

## Selected-package inspection and required local adaptations

### frontend-design

The pinned Git tree contains exactly `SKILL.md` and `LICENSE.txt` in this skill folder. Both were read in full. No executable scripts, reference downloads, secret requests, forced dependencies, credentials, privileged operations, billing actions or settings mutations were found in the instructions. The conditional request to clarify an unidentified subject does not apply: Weft's subject and task are already explicit.

Use its compact color/type/layout plan and critique step. Its examples of generic aesthetics are warnings, not universal bans overriding Weft's chosen direction. Keep Apache license text and attribution when copying.

### accessibility

Full inspected bundle: `SKILL.md`, `references/WCAG.md`, `references/A11Y-PATTERNS.md`; repository MIT license. The sibling `web-quality-audit/SKILL.md` overview was also read; its optional analyzer is **not** part of the selected bundle and must not be implicitly installed/executed. All bundled JavaScript is illustrative fenced code, not a launcher.

Corrections to place in a clearly marked Weft compatibility note before use:

- The SKILL contrast table incorrectly labels large text as 18px / 14px bold. W3C defines **18pt / 14pt bold**, approximately **24 CSS px / 18.67 CSS px bold**. Use 4.5:1 for ordinary UI text; do not relax the threshold for 18px body text. [W3C explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Do not execute its example `npm install @axe-core/cli -g`; reuse available browser tooling or a project-scoped, pinned tool if necessary. No global install is needed to read/apply the skill.
- The modal JavaScript is an example, not a complete implementation: it omits robust focus restoration, dynamic/disabled focusable handling, and empty focus sets. Prefer the existing/native dialog pattern and verify Escape, focus return and background interaction separately.
- A clean automated audit does not establish WCAG conformance. Record manual keyboard, zoom and assistive-technology coverage truthfully.

### core-web-vitals

Full inspected bundle: `SKILL.md`, `references/LCP.md`, `references/INP.md`, `references/CLS.md`; shared `skills/performance/references/MEASUREMENT.md` and `RUM.md`; linked `skills/performance/SKILL.md`; repository MIT license. Git tree shows no executable scripts in core-web-vitals or performance. Browser observers and RUM collection are fenced examples, not something automatically executed.

Compatibility notes:

- The LCP guide includes Pages Router `getServerSideProps` / `getStaticProps` examples. These are **not implementation instructions for Weft's App Router**. Keep server-rendered data boundaries and existing authorized cache behavior.
- Its `next/image priority` examples predate Next.js 16's deprecation. Current official docs prefer deliberate `loading="eager"` or `fetchPriority="high"` in most cases and reserve `preload` for suitable LCP resources. Do not add redundant priority hints to every product image. [Next.js Image API](https://nextjs.org/docs/app/api-reference/components/image#preload).
- Do not install RUM, add endpoints, change analytics or prerender all routes for this task. The RUM reference explicitly requires privacy-aware allowlisting; local lab checks suffice for the redesign evidence.
- Localhost has no representative CrUX field sample. Report equivalent lab conditions, three-run median/range when drawing metric conclusions, and distinguish TBT from INP. Generic byte budgets are starting points, not measured results.

## Minimal install handoff and rollback

The lead should inspect its actual supported workspace skill discovery path. The existing workspace contract names `.codex/skills`; a runtime supporting `.agents/skills` may use that instead. Do not infer live registration solely because a folder exists.

Suggested isolated names are `weft-frontend-design`, `weft-accessibility`, and `weft-core-web-vitals`, with frontmatter names updated and marked as local adaptations. Preserve each original license and add a small provenance file recording upstream URL/full SHA and the corrections above. Obtain only allowlisted Markdown/license files using inspected fetch/copy mechanisms; do not run an upstream installer.

For core-web-vitals, also copy the two inspected shared performance references into its own `references/` and update their relative links. Replace sibling-skill overview links with pinned upstream source URLs rather than silently installing additional skills. All such link/name edits must be identified as local changes. This produces exactly three discoverable skill entries with no auxiliary runtime.

Verification: read the installed skill back completely, validate YAML name/description, verify supporting links resolve, and use the available skill inventory/discovery mechanism if the runtime offers one. An explicit read and application in the current agent proves use; it does not prove automatic future-session discovery. Report those two statuses separately.

Rollback: remove only the three newly created, exact workspace directories after resolving their absolute paths and confirming no pre-existing user skill was overwritten. There are no app dependencies, lockfile edits, global configs, credentials or external resources to reverse. Preserve this research ledger as evidence unless the user asks otherwise.

| Selected skill | Concrete application required from lead | Intended effect | Status in this research lane |
| --- | --- | --- | --- |
| frontend-design | Apply token/composition critique to hero and results screenshots | Clothes visible early; one memorable brand gesture; clear search intent | Read and compared below; installation and final UI application pending lead |
| accessibility | Keyboard/focus/labels audit of search, filter controls and EN/LT mobile view | Usable native controls and clear state announcements | Bundle inspected; factual correction identified; rendered audit pending lead |
| core-web-vitals | Before/after production-mode image/font/load measurements | Stable image geometry and measured resource priorities | Bundle inspected; Next.js 16 caveat identified; measurements pending lead |

## Same-surface design comparison: two strongest visual candidates

This is a **read-only design exercise**, not an A/B user study or two rendered prototypes. Both proposals use the same existing `/search` surface and `components/product-grid.tsx`, the same real product array and public store labels, EUR prices, current links and wishlist action. No new inventory, store identity, checkout or account behavior is invented. Evaluated at planned desktop 1440px and mobile 390px widths; actual screenshots remain the lead's implementation gate.

Observed source input: search currently has a search/filter form, category navigation, a count/active-filter toolbar and a separate pagination-size control row before ProductGrid (`app/search/page.tsx`, source inspected 2026-09-12). ProductGrid contains portrait media, category, title, store, current/old price, optional multi-store summary, availability and wishlist. These are enough constraints to compare information hierarchy without regenerating the application.

**Proposal A — frontend-design applied.** A compact editorial results header makes the user's search phrase the heading; one quiet line describes cross-store discovery. Keep a recognizable typographic brand gesture in the heading while product labels stay plain. Align search and the count/sort action row to the product grid. Give apparel imagery most of the first viewport; put price immediately beneath the title, then the neutral store label. Let category labels recede where the category filter already communicates context. Mobile keeps a full-width editable query, an adjacent Filter/Sort action row and two image columns; the filter panel contains existing controls, a clear apply action and retained URL state.

**Proposal B — Impeccable Operate principles applied.** Treat results as a task surface, independently of the homepage's expressive role. Use one compact sans family and restrained semantic accent. Desktop places a persistent filter rail beside results; count, sorting and applied criteria form one consistent toolbar. Product-card typography stays highly regular. Mobile replaces the rail with progressive disclosure or a native dialog that preserves focus and scroll; omit entrance choreography. Skeleton geometry matches the eventual image grid. The original command engine was not run; these recommendations come from the fully read [Operate reference](https://github.com/pbakaus/impeccable/blob/cb56ed6c19a07329a9fa0cd4e657bee040156593/.agents/skills/impeccable/reference/operate.md).

| Criterion, 1–5 proposed-fit score | A | B | Reason, not measurement |
| --- | --- | --- | --- |
| Search/result hierarchy | 5 | 5 | Both preserve query, result count and product-first flow |
| Reading clarity | 4 | 5 | B's one-family operating surface constrains typography more tightly |
| Compactness | 5 | 4 | A avoids a permanent rail taking width from a small apparel catalog |
| Distinctive Weft character | 5 | 3 | A permits a deliberate brand gesture; B optimizes familiar task UI |
| Mobile behavior | 4 | 5 | B spells out semantic states, overlays and restrained interaction timing |
| Total | **23** | **22** | Editorial-fit assessment by researcher; not user preference or conversion evidence |

Recommendation: **A as the installed visual skill**, with the specific task-surface restraint identified in B as research input. Keep the results typography readable, compress the stacked control rows, and make garment imagery visible early. Choose the final filter placement only after the lead compares actual desktop/mobile prototype screenshots on the same query. The design skill comparison does not substitute for the master prompt's separate three-direction visual comparison.

## Impeccable executable inspection detail

Read the entire pinned Windows [impeccable.cmd](https://github.com/pbakaus/impeccable/blob/cb56ed6c19a07329a9fa0cd4e657bee040156593/.agents/skills/impeccable/scripts/impeccable.cmd). It tries an explicitly configured binary, adjacent binary, user binary, versioned user cache and PATH; otherwise downloads a versioned GitHub release executable and a SHA256 sidecar, verifies with `certutil`, and executes the cached binary. It uses `%USERPROFILE%/.impeccable` by default and may create/write that cache. Its comments say the Windows launcher is covered by dry parsing/string tests rather than testing on a real Windows machine. The integrity check is useful, but it does not establish behavior of the downloaded executable; that executable and broader browser/hook scripts were not audited or run. Therefore the package is not in this task's installation set.
