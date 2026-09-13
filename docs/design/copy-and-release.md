# Copy, privacy and release decisions

12 September 2026. This is an implementation/content record, not legal advice or a claim of GDPR compliance.

## EN/LT source and glossary

`lib/i18n.ts` → `frontend` and `productDetail` own primary actions, labels, counts, errors and metadata. `lib/secondary-copy.ts` owns 3D, stores and recovery copy. Existing source product titles remain unchanged; category, colour, audience, availability and navigation are localized. Lithuanian colour mapping covers the actual catalog (including `Stone` → `Akmens pilkumo`). IDs remain semantic and language-independent.

| Meaning | EN | LT |
| --- | --- | --- |
| Submit search | Search | Ieškoti |
| Filter trigger | Filters | Filtrai |
| Sorting label | Sort by | Rikiuoti pagal |
| Details action | View details | Peržiūrėti |
| Saved collection | Saved pieces | Išsaugotos prekės |
| Save toggle | Save item | Išsaugoti prekę |
| Store | Store | Parduotuvė |
| Secondary visualization | 3D preview | 3D peržiūra |

Counts derive from the filtered data. English handles one/many; Lithuanian uses the neutral `Prekių: N` construction. Search examples submit a real query. `aria-label` describes clear/save/remove/close/rotate independently of icons. Product images retain the actual title; no filename alt. The LT narrow-width test includes labels, a long query, store chips and filter actions.

Removed ordinary demo/stage badges, invented product descriptions/alternate-store prices, fake account forms and unsupported alert/login promises. Missing optional facts are omitted; missing price is `—`, not zero. Saved items actually persist locally and synchronize across tabs. No checkout or merchant redirect was added. The existing category-based 3D mannequin is approximate, not a photorealistic try-on, fit guarantee or measurement recommendation.

Privacy now distinguishes current onsite item openings from nonexistent outbound purchases/contact messages, renders storage/rights information that the old page omitted, and describes optional analytics accurately. Search text can remain in the existing first-party Supabase event store when configured; PostHog search properties are summary diagnostics, not raw query/body measurements/photos. No new tracking or consent mechanism was installed. The missing public privacy/contact address remains a release-governance gap; no address or legal guarantee was invented.

## Infrastructure decision

No paid upgrade or new environment variable is required for this frontend. No pricing is quoted because no paid product is proposed or necessary. Existing deployment, RLS, CI/import approvals and schema remain unchanged.

| Observed need | Current solution / cost change | Upgrade trigger | Privacy / rollback |
| --- | --- | --- | --- |
| Search and responsive imagery | Existing Next image pipeline, local assets and server catalog; no new service charge | Measured production p75/p95 latency or bandwidth constraint | Keep server-only credentials; reversible application changes |
| Repeatable accessibility/browser QA | Existing Python Playwright plus local pinned axe dev dependency | Physical-device/screen-reader coverage needed before wider release | No account/browser profile copied; artifacts stay local |
| Search-provider latency | Existing bounded provider/fallback path, input-scope cache identity and request coalescing | Observed provider timeout/cost issue, not animation preference | Do not tune retrieval from consumed blind sets or enable paid calls implicitly |
| Error/field observation | Existing sanitized diagnostics plus reproducible local failure fixtures | Production incidents or reliable real-user sample | First assess minimum-data collection and consent; no RUM SDK enabled here |

## Post-release hypotheses, not claimed results

- Immediate search and clothing should reduce navigation steps to the first useful result. Measure search entry-to-submit and result-view completion with aggregate counts, after approving collection.
- Draft filters should reduce accidental lost conditions. Measure apply/cancel/retry counts and task completion in a small usability session; do not record typed text or a screen recording by default.
- Earlier clothing and explicit detail links should make exploration clearer. Measure actual detail openings, never label them purchases or successful retailer visits.
- Observe route-specific real-user LCP/INP/CLS only after a privacy-reviewed collection decision. Local lab deltas are not conversion or field-performance evidence.

Do not collect body measurements, user photos, free-form queries, arbitrary URLs, or user-identifying replay data in a new third-party measurement scheme. No subscriptions, billing changes, production import or deployment occurred.

## Follow-up checks requiring unavailable surfaces

Physical iPhone/Android and NVDA/VoiceOver/TalkBack: run search → filter draft → cancel/apply → details → save → back; verify announcements, logical focus, scroll and enlarged text. Repeat in LT and forced-colour mode. These checks are a documented future script, not claimed executed work. A public privacy contact and legal/consent review are needed before a public launch with analytics; the redesign itself did not turn analytics on.
