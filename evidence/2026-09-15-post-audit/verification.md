# Post-audit verification

Source evidence: `audit/2026-09-15-weft-user-audit/` and its `report.md`, JSON reports, and screenshots. The source audit was treated as evidence to reproduce, not as an unconditional fix list.

## Status by finding

### FIXED

- PDP document overflow from long construction values: reproduced historically and now measured at `scrollWidth === clientWidth` for EN/LT, MOCK-001/002/014, and 360, 390, 430, 768, 1024, 1280, and 1440 CSS px.
- Raw product-fact tokens (`|`, underscores, internal construction names): replaced by controlled EN/LT labels and bounded chips. Explicit negative facts such as `belt_loops_none` remain negative.
- Repeated `Unknown` under every listed size: replaced by one clear availability note when all size availability is unknown.
- Bottoms category semantics: the broad facet remains `bottoms`, while trustworthy subcategories such as skirts and trousers render with their specific label.
- Mobile PDP information hierarchy: title, store, price, preview action, and boundary note appear before the gallery; desktop retains the two-column layout.
- Homepage search discoverability: EN/LT hero search, three catalog examples, and browse CTA are visible and exercised.
- Controlled material localization: `cotton` is rendered as `Cotton` / `Medvilnė`.

### ALREADY WORKING

- Mobile filter dialog behavior from the audit's superseded F-04: single dialog, bounded body/footer, scroll lock, Escape close, and trigger focus restoration.
- 3D preview is an honest local approximate preview and is reached by an explicit `3D preview` / `3D peržiūra` action; no merchant checkout or redirect was invented.
- Category facet state preserves query, department, budget, and locale, and clears only category. Jeans remains the canonical `category=jeans` URL.
- Saved is browser-local and works across save/remove/reload; malformed or blocked localStorage degrades safely.
- Mobile menu has an accessible `Open navigation` trigger, navigation links, Escape close, and focus restoration.

### TEST FIXED

- Updated stale selectors and expectations for `.campaign-examples`, `/saved`, `department`, checkbox/radio controls, `subcategory`, mobile dialog hydration, and canonical EN search URLs.
- Fixed the locale runner to distinguish the canonical search EN URL (no redundant `lang`) from other route links and repaired its mobile atomic-switch selector.
- Fixed `post_audit_regression.py` so a check is marked PASS only after its assertions complete; its dialog, Saved/menu, and locale assertions now inspect live elements.

### NEEDS OWNER INPUT

- `/contact` has no approved public contact destination in repository configuration. Do not publish an address inferred from logs, git metadata, or external sources.
- Real merchant links, affiliate feeds, checkout, and store partnerships are outside the current synthetic-catalog contract and require product/owner decisions.

### NOT VERIFIED

- Physical iOS/Android keyboards and safe areas, Safari, screen readers, Windows High Contrast on physical hardware, field latency/RUM, live Gemini, Supabase cloud, and production deployment.
- Exact fit accuracy: the existing 3D surface is explicitly approximate; tests prove rendering and controls, not garment fit.

