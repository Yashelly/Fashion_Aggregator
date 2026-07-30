# Product Functionality Audit — VIBEWEAR

Scope: every current site function, audited from the actual implementation (not from
naming or assumption), with an explicit keep / improve / cut recommendation and
rationale, plus candidate new functions. This document does not implement anything —
it is the recommendation artifact for PRD story US-004 of the
`vibewear-ui-redesign-2026-07-30` site audit. No source code was changed to produce it.

---

## Current functions

### Search & filters

- **Files:** `app/search/page.tsx`, `lib/mock-products.ts` (`filterProducts`, `sortProducts`, `getStoreOptions`)
- **Recommendation:** Keep
- **Rationale:** This is the most mature feature on the site. `filterProducts` supports store/category/color/gender/availability/sale filtering, an EN/LT bilingual synonym table (`aksesuarai → accessories`, `dzemperiai → hoodie/hoodies/sweats`, etc.), diacritic-insensitive matching (`normalizeSearchText`), and inline price parsing (`under 50` / `iki 50`). `sortProducts` covers price-low/high, best-discount, and an in-stock-first default. The page itself distinguishes "filters not recognised" (`invalidFilter`, `role="alert"`) from "valid filters, zero matches" (`role="status"`), which is a genuinely useful UX distinction most catalog UIs skip. Pagination (`paginationItems`) generates a windowed page-number list with ellipses, an `aria-current="page"` active state, and disabled prev/next at the boundaries. Results count uses `aria-live="polite"` for screen readers. One improvement worth making: `app/search/page.tsx` inlines a dozen `locale === "lt" ? "…" : "…"` ternaries directly in JSX (results count, pagination labels, empty-state copy, filter-invalid messages) instead of going through `lib/i18n.ts`'s `copy` object, which is the documented pattern (`CLAUDE.md`, `lib/AGENTS.md`) and which the rest of this same file mostly follows (`t.title`, `t.labels.*`). This is scattered, easy-to-miss debt in the single highest-traffic route in the app — worth a follow-up pass to consolidate into `lib/i18n.ts`, but it does not change the Keep recommendation since the feature itself works correctly in both locales today.

### Product cards / results grid

- **Files:** `components/product-grid.tsx`
- **Recommendation:** Keep
- **Rationale:** Handles the realistic edge cases well: sold-out items get a disabled, non-clickable state (`is-sold-out`, `aria-disabled="true"`) instead of a dead link; products missing a demo image fall back to a labeled placeholder (`"IMAGE PLACEHOLDER"` / `"VIETA NUOTRAUKAI"` + a category glyph) rather than a broken `<img>`; every price uses `Intl.NumberFormat` with the correct locale/currency; alt text is built from title+category+store rather than left empty. All product links route through `/out/{mock_product_id}`, correctly respecting the demo-data boundary (no direct external URLs ever appear here). Minor, non-blocking debt: the `Intl.NumberFormat` currency-formatting call is duplicated verbatim in `components/ai-fitting-room.tsx` rather than extracted to a shared helper (already flagged in `components/AGENTS.md`) — low priority, cosmetic only.

### Demo stores

- **Files:** `lib/demo-stores.ts`, `app/stores/page.tsx`
- **Recommendation:** Improve
- **Rationale:** The underlying mechanism (`stableStoreIndex`, a deterministic hash mapping internal retailer slugs to one of 6 fixed, non-reversible public IDs `demo-store-01`…`06`) is a well-built and important piece of engineering — it's the actual enforcement point for the site's core "no real retailer identity" rule, and it works correctly (verified by reading `getPublicDemoStoreForProduct`, `filterProductsByPublicDemoStore`, and the exclusion of `market_suspended` stores). Keep that mechanism as-is. The problem is what's built on top of it: `app/stores/page.tsx` renders all 6 stores with the *same* generic fallback description (`copy.fallbackDescription`) and the same "VIBEWEAR EDIT" eyebrow — the only thing that differs between store cards is a product/category count. Since the public store IDs are arbitrary hash buckets rather than curated identities, browsing `/stores` today gives a user six visually-identical cards with no reason to prefer one over another, which undersells what could be a real discovery surface. Recommend either giving each public store a distinct, auto-derived character (e.g. a blurb generated from its actual category/price mix) or de-emphasizing `/stores` as a primary nav destination in favor of category-based browsing — the latter overlaps with the UX/navigation audit and is noted there for that reason.

### Product detail / click-guard page

- **Files:** `app/out/[productId]/page.tsx`
- **Recommendation:** Keep
- **Rationale:** This page is the demo-boundary enforcement point (`CLAUDE.md`: "`/out/:productId` never redirects to a merchant") and it is implemented correctly and honestly: it statically pre-builds one route per mock product (`generateStaticParams`, `dynamicParams = false`), 404s for unknown IDs (`notFound()`), shows two images (plain product + styled "try-on" look), full size/color/gender/category facts, and — importantly — an explicit, unambiguous disclaimer: *"The purchase link is not active yet."* / *"Pirkimo nuoroda dar neaktyvi."* This is exactly the kind of plain-language demo-status communication the UX audit is looking for elsewhere in the site, and this page already does it well. No changes needed to the page's honesty; it's a good model for other mocks to follow (see AI Fitting Room and Account below, which don't yet meet this bar).

### AI Fitting Room mock

- **Files:** `components/ai-fitting-room.tsx`, `app/ai-fitting-room/`
- **Recommendation:** Improve — relabel honestly as a preview, or invest in a real backend; do not ship as-is unlabeled at entry points
- **Rationale:** The flow itself is well-built for what it is: file-type/size validation (JPG/PNG/WEBP, ≤10MB), a clear "Private by default… your photo remains on your device and is not sent to a server" note, a proper `role="radiogroup"` product picker, and object-URL cleanup on unmount (`URL.revokeObjectURL`). The dead end is also honestly worded once reached: clicking "Create try-on" always ends at *"Generation is not connected yet… this version does not send your photo to an AI service or generate an output."* The problem is upstream of that message, not in it: the feature is linked from the product detail page with a confident, action-oriented CTA — `<Sparkles /> "Try with AI"` — and from the site header's primary desktop nav (flagged `temporary: true` internally per `components/AGENTS.md`, but that flag is invisible to an actual visitor). Nothing at either entry point signals "preview only" before a user uploads a personal photo, picks an item, and presses a button literally labeled "Create try-on." The honesty only arrives after the user has already invested the effort and shared a photo. Recommend one of: (a) add a visible "Concept preview" / "Coming soon" badge at both entry points (nav item and product-detail CTA) so the limitation is known before the user commits a photo, or (b) if the AI fitting room is meant to be a real differentiator, invest in an actual generation backend rather than continuing to polish a UI that terminates in a no-op. Do not cut outright — the UX (upload/select/privacy-note pattern) is good enough to be worth finishing one way or the other.

### Account mock

- **Files:** `components/account-dashboard.tsx`, `app/account/`
- **Recommendation:** Improve (split recommendation — see below)
- **Rationale:** This mock has two functionally different halves that deserve different verdicts. (1) **Profile & preferences** (name, email, style chips, top/bottom/shoe size, budget, sale/price-alert toggles) is genuinely functional as advertised: it persists to `window.localStorage["vibewear-account-preferences"]` on "Save preferences," reloads correctly on mount, and is honestly labeled — "Data stays in this browser only," "No sign-in required." This half should be **kept** as-is. (2) **"Saved items"** and **"Recent searches"** cards are a different story: they render static copy — *"You have not saved anything yet"* / *"Search history in this browser is empty"* — that is always true, because no code anywhere in the app (not the product grid, not the search page) ever writes to a saved-items list or a search-history list. This reads to a user as "you haven't used this feature yet," when the accurate statement is "this feature does not exist yet." That's a small but real expectation-mismatch, of the same category the deep-interview spec called out as a concern. The notification toggles just below them handle this more honestly — their copy explicitly says *"These preferences are ready for future features"* — the Saved Items/Recent Searches cards should either get the same honest "not implemented yet" framing, or (better, and cheap, since the profile fields already establish the exact `localStorage` pattern needed) be wired up for real: bookmark button on `ProductGrid`/`/out` writing to a saved-items array, and `search-analytics-tracker.tsx`'s already-tracked queries feeding a small recent-searches list.

### Search & click analytics (PostHog + Supabase)

- **Files:** `app/api/analytics/search/route.ts`, `app/api/analytics/click/route.ts`, `lib/analytics.ts`, `lib/analytics-storage.ts`, `lib/request-security.ts`
- **Recommendation:** Keep
- **Rationale:** Unlike the two mocks above, this is real, working infrastructure, not a demo surface — flagging it separately so it isn't mistakenly bundled into the same "audit and reconsider" bucket. Both API routes validate same-origin (`isSameOrigin`) before doing any work, enforce body-size caps (16KB / 2KB), and validate/clean every field rather than trusting client input. Both PostHog capture (`captureAnalyticsEvent`, 1s timeout) and Supabase persistence (`saveSearchEvent`/`saveBlockedPreviewClick`, 1s timeout) are correctly optional and best-effort: they return a `"disabled"`/`null`/`false` status rather than throwing when their respective env vars are unset, and neither ever blocks the page (the click route uses Next's `after()` to run analytics writes post-response; the search-analytics component swallows fetch errors). `saveBlockedPreviewClick` even records its own boundary honestly in the data model — `redirect_status: "blocked"`, `error_message: "…merchant redirect disabled"` — which is a nice consistency touch with the demo-boundary rule enforced in `app/out/[productId]/page.tsx`. No functional changes recommended; only a minor operational note (not a rewrite) that `console.warn`-based failure logging (`reportStorageFailure`) has no aggregation/alerting behind it, so silent analytics failures in production would currently go unnoticed — worth keeping in mind if this data starts being relied on for decisions.

---

## Candidate new functions

### Real "Saved items" (wishlist) persistence

- **Rationale:** The Account dashboard already has a dedicated card promising this ("Saved items… You have not saved anything yet"), and `ProductGrid`/the product detail page already have the exact data shape (`mock_product_id`) needed to store a list. The `localStorage` pattern is already proven in this codebase (`account-dashboard.tsx`'s `vibewear-account-preferences` key). This is a low-effort way to close an honesty gap that currently exists in a shipped screen, and gives users an actual reason to return to `/account`.

### Real "Recent searches" history

- **Rationale:** Same rationale and same low-lift pattern as saved items — `search-analytics-tracker.tsx` is already reading every search query and firing it to the analytics endpoint; capturing the last N queries client-side (localStorage, keyed similarly to the anonymous ID already used there) would make the second dead-end Account card in `account-dashboard.tsx` actually work, and it would give users one-click reruns of recent searches from `/account` or the header.

### Functional sale/price-drop alerts (in-app, not email)

- **Rationale:** The Account dashboard already ships toggle UI for "Sale reminders" and "Price changes" that explicitly self-labels as inert ("ready for future features"). Rather than building real email/push infrastructure (out of scope for a synthetic demo with no backend), a lightweight in-app version — e.g. a banner or badge on `/search`/`/account` surfacing products in the user's saved/style-preferred categories that currently have `old_price_eur` set — would make the existing toggle meaningful without requiring any new backend service, reusing data (`old_price_eur`, `style` preference) that already exists in `mock-products.ts` and the account profile.

### Store differentiation on `/stores`

- **Rationale:** Per the Demo Stores audit above, all 6 public stores currently render with identical descriptive copy. Auto-deriving a short, distinct blurb per store from its actual product mix (dominant category, price band, e.g. "Store 03 — footwear-led, mid-range") would turn `/stores` from a formality page into a real second browsing path into the catalog, using data that is already computed per-store on that page (`categoryCount`, `storeProducts.length`) but currently discarded after the count.

### "More like this" / related products on the product detail page

- **Rationale:** `app/out/[productId]/page.tsx` currently ends in two dead-end CTAs (AI fitting room, back to search) with no path back into the catalog around the viewed item. The product model already carries everything needed for a same-category/same-gender/similar-price-band rail (`filterProducts`-style logic already exists and could be reused with `category`/`gender`/`price_eur` proximity), and it would reduce the number of users who land on a product page and then bounce rather than continuing to browse — directly relevant to a demo-discovery product where the whole point is showing off catalog breadth.

---

*No new product functionality was implemented as part of this audit — recommendations only, per US-004 scope.*
