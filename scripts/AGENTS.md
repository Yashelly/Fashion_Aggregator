<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# scripts

## Purpose

Holds `locale_e2e.py`, a Playwright-driven browser regression suite that verifies Weft's EN/LT locale contract end-to-end against a running server. It is invoked via `npm run test:locale` (defined in `package.json` as `python scripts/locale_e2e.py`) and requires `BASE_URL` to point at a live dev/production server — it does not start the server itself.

## Key Files

| File | Description |
|------|--------------|
| `locale_e2e.py` | Full Playwright browser suite covering locale cookie/query precedence, all public routes, internal link locale-preservation, search filters, mobile/desktop viewports, browser history, and `/out` success/404 boundaries. |
| `__pycache__/locale_e2e.cpython-312.pyc` | Compiled bytecode cache from a prior run; not source, safe to ignore/regenerate. |

## Structure (as read from source)

Run with: `BASE_URL=http://127.0.0.1:3000 python scripts/locale_e2e.py` (or `npm run test:locale`). Uses `playwright.sync_api` (Chromium, headless). Report is written to `LOCALE_REPORT` env var path, default `.omx/artifacts/qa/locale-summary.json`.

Constants:
- `LOCALE_COOKIE = "weft-locale"` — the preference cookie name asserted throughout.
- `PUBLIC_ROUTES` — 12 routes: `/`, `/search?query=black`, `/stores`, `/how-it-works`, `/about`, `/contact`, `/data-sources`, `/affiliate-disclosure`, `/privacy`, `/terms`, `/out/MOCK-001`, `/out/UNKNOWN`. `expected_status()` returns 404 only for `/out/UNKNOWN`, 200 otherwise.
- `LINK_SOURCE_ROUTES` — the same routes with `?lang=lt` appended, used as starting points for the internal-link-crawl matrix.

Helper functions:
- `route_with_lang(route, lang)` — rewrites a route's `lang` query param.
- `cookie_value(context)` / `seed_locale(context, locale)` — read/write the `weft-locale` cookie directly via Playwright's context API (bypassing the UI) to test cookie-precedence paths.
- `wait_for_locale(page, locale)` — waits for `<html lang>`, the header search label text (`"Search"`/`"Paieška"`), the language-switcher `aria-label` (`"Language"`/`"Kalba"`), and the locale cookie to all agree, before any assertion runs.
- `assert_locale(page, context, locale)` — wraps `wait_for_locale` plus a hard cookie-value assertion.
- `assert_public_out_path(page, product_id)` — for `/out/:id` pages, asserts the URL path stays `/out/:id` (no internal preview-route leakage) and that every link inside `.language-switcher` also points at `/out/:id` (never a different internal rewrite path).
- `click_language(page, locale)` — clicks the `.language-switcher a` matching `"EN"`/`"LT"` text, waits for the `lang` query param to update, then re-verifies via `wait_for_locale`.

Test matrix functions, each returning an assertion count (summed into the final JSON report):
- `run_direct_matrix(browser)` — for each of 2 viewports (375×900 mobile, 1440×1000 desktop) × all `PUBLIC_ROUTES`: direct navigation with no lang param (expect `en`), `?lang=lt`, `?lang=en` (override), cookie-seeded `lt` with no query param (expect redirect/rewrite to carry `?lang=lt`), and an **invalid** `?lang=invalid` value (expect fallback to the cookie-seeded `lt`, not a crash).
- `run_switch_matrix(browser)` — for each viewport × route: click the language switcher LT→EN and back, asserting `/out/:id` path stability via `assert_public_out_path` when applicable.
- `run_internal_link_matrix(browser)` — crawls every `href` on each `LINK_SOURCE_ROUTES` page (excluding the switcher itself and non-relative links), asserts every internal link preserves `?lang=lt`, then actually clicks each unique link and re-verifies the locale survived navigation.
- `run_search_matrix(browser)` — loads `/search` with `query/category/color/sort` filters plus `lang=lt`, switches language back and forth asserting filters survive, types a live query into `#catalog-query`, exercises `.active-filters` remove-filter and clear-all links, and clicks a `.product-link` through to `/out/MOCK-...` confirming no `/preview/` path leaks and `lang=lt` is retained.
- `run_history_and_stress_matrix(browser)` — exercises browser back/forward across a language switch + navigation sequence, then repeatedly (5×) clicks through search/stores/how-it-works/about/home nav links while LT is active, asserting `lang=lt` is retained on every hop.
- `run_atomic_switch_matrix(browser)` — 25 iterations × 2 viewports of a "zero-delay" stress test: clicks the language switcher and immediately (same JS tick, via `page.evaluate`) clicks the header search, checking there's no race condition where a stale pre-switch page swallows the click.

`main()` wires a `pageerror`/`console error` listener onto every new browser context (ignoring the expected 404 console error on `/out/UNKNOWN`), runs all six matrix functions, fails loudly via `AssertionError` if any browser error was captured, and writes a JSON summary (route count, viewport list, per-matrix assertion counts, and a `boundaries` dict documenting the known/unknown `/out` behavior contract) to `REPORT_PATH`.

## For AI Agents

### Working In This Directory

- This suite talks to a **real running server** — it does not mock Next.js. Start `npm run dev` (or a production build) and set `BASE_URL` before running `npm run test:locale`; running it without a live server will just fail every `page.goto`.
- Requires `playwright` (Python) with Chromium installed (`pip install playwright && playwright install chromium` if not already present) — there is no `requirements.txt` in this directory, check the repo root or `.omx/` for how the Python environment is otherwise managed.
- If you change locale-switching markup (`.language-switcher`, `.header-search`, `#catalog-query`, `.active-filters`, `.desktop-nav`, `.product-link`), this suite's CSS-selector-based assertions will likely break silently until re-run — grep this file for the selector before renaming any of those classes/ids elsewhere in the app.
- The `/out/:id` boundary assertions (`assert_public_out_path`) exist specifically to catch internal-route leakage into the public URL/switcher — treat any change to the `/out` route or its rewrite behavior as something this suite must re-validate.
- `__pycache__/` is stale build output; do not treat it as source of truth if it diverges from `locale_e2e.py`.

## Dependencies

### Internal

- Exercises `app/` routes end-to-end (home, search, stores, how-it-works, about, contact, data-sources, affiliate-disclosure, privacy, terms, `/out/:id`) and reads `lib/i18n.ts`-driven copy indirectly (via the EN/LT label assertions in `wait_for_locale`).
- Writes its report to `.omx/artifacts/qa/locale-summary.json` by default (override via `LOCALE_REPORT` env var).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
