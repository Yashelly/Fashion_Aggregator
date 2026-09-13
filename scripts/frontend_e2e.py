"""Independent browser QA for the public Weft frontend.

The suite intentionally drives a real production server.  It records every check
individually so that one failure does not hide later evidence.  It never enables
test-only production routes or external AI/catalog credentials.
"""

from __future__ import annotations

import argparse
import json
import re
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ARTIFACTS = ROOT / ".omx" / "artifacts" / "frontend" / "qa-browser"
AXE_PATH = ROOT / "node_modules" / "axe-core" / "axe.min.js"


class BrowserQA:
    def __init__(self, browser: Browser, base_url: str, artifacts: Path) -> None:
        self.browser = browser
        self.base_url = base_url.rstrip("/")
        self.artifacts = artifacts
        self.screenshots = artifacts / "screenshots"
        self.screenshots.mkdir(parents=True, exist_ok=True)
        self.results: list[dict[str, Any]] = []
        self.axe_results: list[dict[str, Any]] = []
        self.current_page: Page | None = None
        self.current_details: dict[str, Any] = {}

    def context(
        self,
        width: int = 1440,
        height: int = 1000,
        *,
        java_script_enabled: bool = True,
        color_scheme: str = "light",
        reduced_motion: str = "no-preference",
        blocked_storage: bool = False,
    ) -> BrowserContext:
        context = self.browser.new_context(
            viewport={"width": width, "height": height},
            java_script_enabled=java_script_enabled,
            color_scheme=color_scheme,
            reduced_motion=reduced_motion,
        )
        if blocked_storage:
            context.add_init_script(
                "Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });"
            )
        return context

    def page(self, context: BrowserContext) -> Page:
        page = context.new_page()
        page.set_default_timeout(8_000)
        self.current_page = page
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        self.current_details["page_errors"] = errors
        return page

    def goto(self, page: Page, path: str, *, status: int | None = 200) -> None:
        response = page.goto(f"{self.base_url}{path}", wait_until="domcontentloaded")
        if response is None:
            raise AssertionError(f"navigation returned no response for {path}")
        if status is not None and response.status != status:
            raise AssertionError(f"{path} returned HTTP {response.status}, expected {status}")
        page.locator("main").wait_for(state="visible")
        page.wait_for_timeout(120)

    def screenshot(self, page: Page, name: str, *, full_page: bool = False) -> str:
        path = self.screenshots / f"{name}.png"
        page.screenshot(path=str(path), full_page=full_page, animations="disabled")
        return str(path.relative_to(ROOT)).replace("\\", "/")

    def detail(self, **values: Any) -> None:
        self.current_details.update(values)

    def run(self, test_id: str, name: str, severity: str, function: Callable[[], None]) -> None:
        started = time.perf_counter()
        self.current_page = None
        self.current_details = {}
        status = "PASS"
        message = ""
        screenshot = None
        try:
            function()
        except Exception as error:  # every later check must still run
            status = "FAIL"
            message = f"{type(error).__name__}: {error}"
            self.current_details["traceback"] = traceback.format_exc(limit=5)
            if self.current_page and not self.current_page.is_closed():
                try:
                    safe_test_id = re.sub(r"[^a-z0-9-]+", "-", test_id.lower()).strip("-")
                    screenshot = self.screenshot(self.current_page, f"FAIL-{safe_test_id}")
                except Exception as screenshot_error:
                    self.current_details["screenshot_error"] = str(screenshot_error)
        finally:
            self.results.append(
                {
                    "id": test_id,
                    "name": name,
                    "severity": severity,
                    "status": status,
                    "message": message,
                    "duration_ms": round((time.perf_counter() - started) * 1000),
                    "screenshot": screenshot,
                    "details": self.current_details,
                }
            )
            print(f"{status:4} {test_id} {name}{': ' + message if message else ''}", flush=True)

    def note(self, test_id: str, name: str, status: str, reason: str, severity: str = "scope") -> None:
        self.results.append(
            {
                "id": test_id,
                "name": name,
                "severity": severity,
                "status": status,
                "message": reason,
                "duration_ms": 0,
                "screenshot": None,
                "details": {},
            }
        )
        print(f"{status:7} {test_id} {name}: {reason}", flush=True)

    @staticmethod
    def assert_no_horizontal_overflow(page: Page) -> None:
        metrics = page.evaluate(
            """() => {
              const root = document.documentElement;
              const visible = [...document.body.querySelectorAll('*')].filter((element) => {
                const style = getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
              });
              const offenders = visible.map((element) => {
                const rect = element.getBoundingClientRect();
                return {tag: element.tagName, cls: String(element.className || '').slice(0, 80), left: rect.left, right: rect.right};
              }).filter((item) => item.left < -2 || item.right > innerWidth + 2).slice(0, 8);
              return {clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, innerWidth, offenders};
            }"""
        )
        if metrics["scrollWidth"] > metrics["clientWidth"] + 1:
            raise AssertionError(f"horizontal overflow: {metrics}")

    @staticmethod
    def prices(page: Page) -> list[float]:
        return [float(value) for value in page.locator(".product-grid data").evaluate_all("nodes => nodes.map(n => n.value)")]

    def write_report(self) -> Path:
        report = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "base_url": self.base_url,
            "source": "real local production server; deterministic catalog fallback; external keys not used",
            "summary": {
                state: sum(1 for result in self.results if result["status"] == state)
                for state in ("PASS", "FAIL", "PARTIAL", "NOT RUN")
            },
            "results": self.results,
            "axe": self.axe_results,
            "limits": [
                "No physical-device or screen-reader session was run.",
                "No live Gemini, Supabase cloud, paid service, field RUM, or production deployment was exercised.",
                "Catalog failure/sparse rendering and delayed navigation have separate controlled runners and reports; this runner does not include those counts. No public simulation switch was added.",
            ],
        }
        path = self.artifacts / "report.json"
        path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        return path


def query(page: Page) -> dict[str, list[str]]:
    return parse_qs(urlparse(page.url).query)


def focused(locator: Any) -> bool:
    return bool(locator.evaluate("element => element === document.activeElement"))


def choose_sort(page: Page, value: str) -> None:
    picker = page.locator(".sort-form details.option-picker")
    picker.locator(":scope > summary").click()
    picker.locator(f'button[name="sort"][value="{value}"]').click()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3100")
    parser.add_argument("--artifacts", type=Path, default=DEFAULT_ARTIFACTS)
    args = parser.parse_args()
    args.artifacts = args.artifacts.resolve()
    args.artifacts.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        qa = BrowserQA(browser, args.base_url, args.artifacts)

        def search_keyboard() -> None:
            for locale, phrase in (("en", "coat"), ("lt", "paltas")):
                context = qa.context(390 if locale == "lt" else 1440, 844 if locale == "lt" else 1000)
                page = qa.page(context)
                qa.goto(page, f"/?lang={locale}")
                field = page.locator('form[role="search"] input[name="query"]')
                field.fill(phrase)
                field.press("Enter")
                page.wait_for_url(re.compile(r"/search\?"))
                page.locator(".product-grid, .empty-state").wait_for(state="visible")
                assert query(page).get("query") == [phrase]
                assert page.locator("html").get_attribute("lang") == locale
                if page.locator(".product-grid").count() == 0:
                    raise AssertionError(f"category query returned no useful state: {phrase}")
                context.close()

        qa.run("UX-03/04", "EN/LT search by Enter reaches useful results", "P1", search_keyboard)

        def hero_examples_are_useful() -> None:
            context = qa.context(1440, 1000)
            page = qa.page(context)
            for locale in ("en", "lt"):
                qa.goto(page, f"/?lang={locale}")
                examples = page.locator(".search-examples a")
                if examples.count() < 2:
                    raise AssertionError(f"{locale} exposes fewer than two query examples")
                hrefs = [examples.nth(index).get_attribute("href") for index in range(2)]
                for href in hrefs:
                    assert href
                    qa.goto(page, href)
                    page.locator(".product-grid, .empty-state").wait_for(state="visible")
                    if page.locator(".product-grid").count() == 0:
                        raise AssertionError(f"visible {locale} example leads to zero results: {href}")
            context.close()

        qa.run("UX-07", "visible EN/LT query examples lead to useful results", "P1", hero_examples_are_useful)

        def search_button_blank_and_clear() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/?lang=en")
            field = page.locator('form[role="search"] input[name="query"]')
            button = page.locator('form[role="search"] .search-submit')
            field.fill("   ")
            button.click()
            page.wait_for_url(re.compile(r"/search(?:\?|$)"))
            assert "query" not in query(page)
            page.locator('input[name="query"]').fill("linen shirt")
            page.locator(".query-clear").click()
            assert page.locator('input[name="query"]').input_value() == ""
            assert focused(page.locator('input[type="search"][name="query"]'))
            context.close()

        qa.run("UX-05", "blank/whitespace browse behavior and explicit clear", "P1", search_button_blank_and_clear)

        def long_and_special_queries() -> None:
            context = qa.context()
            page = qa.page(context)
            too_long = "x" * 501
            qa.goto(page, f"/search?query={too_long}&lang=en")
            assert page.locator('[role="alert"] .button').count() == 1
            assert page.locator('input[type="search"][name="query"]').input_value() == too_long
            qa.goto(page, "/search?query=%3Cscript%3Ealert(1)%3C%2Fscript%3E%20%26%20%C4%85%C4%8D%C4%99%C4%97%C4%AF%C5%A1%C5%B3%C5%AB%C5%BE&lang=lt")
            assert page.locator("html").get_attribute("lang") == "lt"
            assert page.locator("script").filter(has_text="alert(1)").count() == 0
            context.close()

        qa.run("FORM-01", "501-character URL and special/diacritic input are bounded and escaped", "P1", long_and_special_queries)

        def exact_word_and_zero() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?query=coat&lang=en")
            titles = page.locator(".product-title").all_inner_texts()
            if not titles or not any(re.search(r"\bcoat\b", title, re.I) for title in titles):
                raise AssertionError(f"exact word 'coat' did not yield a coat: {titles[:5]}")
            qa.goto(page, "/search?query=qxzv-no-such-garment-999&lang=en")
            assert page.locator(".empty-state").count() == 1
            assert page.locator(".empty-state").get_attribute("role") == "status"
            qa.detail(zero_results_url=page.url)
            qa.screenshot(page, "empty-results-en-1440")
            context.close()

        qa.run("UX-15", "exact-word result and zero-results state", "P1", exact_word_and_zero)

        def filter_draft_close_paths() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/search?query=black&lang=en")
            original = page.url
            trigger = page.locator(".catalog-toolbar .filter-toggle")
            trigger.click()
            dialog = page.locator(".filter-dialog[open]")
            dialog.wait_for(state="visible")
            group = dialog.locator('.filter-group:has(input[type="radio"][name="category"])')
            group.locator(":scope > summary").click()
            category = group.locator('input[name="category"][value="outerwear"]')
            category.locator("xpath=ancestor::label").click()
            assert category.is_checked()
            dialog.get_by_role("button", name="Cancel", exact=True).click()
            assert page.url == original and focused(trigger)
            trigger.click()
            assert dialog.locator('input[name="category"][value=""]').is_checked()
            category = dialog.locator('input[name="category"][value="outerwear"]')
            category.locator("xpath=ancestor::label").click()
            assert category.is_checked()
            page.keyboard.press("Escape")
            assert page.url == original and focused(trigger)
            trigger.click()
            category = dialog.locator('input[name="category"][value="outerwear"]')
            category.locator("xpath=ancestor::label").click()
            assert category.is_checked()
            page.mouse.click(2, 2)
            assert not page.locator(".filter-dialog").evaluate("d => d.open")
            assert page.url == original and focused(trigger)
            context.close()

        qa.run("UX-10", "filter draft cancel, Escape and backdrop discard state and restore focus", "P1", filter_draft_close_paths)

        def invalid_and_decimal_budget() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/search?query=shirt&lang=en")
            page.locator(".catalog-toolbar .filter-toggle").click()
            dialog = page.locator(".filter-dialog[open]")
            minimum = dialog.locator('input[name="minPrice"]')
            maximum = dialog.locator('input[name="maxPrice"]')
            minimum.fill("100")
            maximum.fill("20")
            dialog.get_by_role("button", name="Apply filters", exact=True).click()
            assert dialog.is_visible() and focused(minimum)
            assert minimum.get_attribute("aria-invalid") == "true"
            assert dialog.locator('[role="alert"]').count() == 1
            minimum.fill("0")
            maximum.fill("80,50")
            dialog.get_by_role("button", name="Apply filters", exact=True).click()
            page.wait_for_url(re.compile(r"maxPrice=80(?:\.|%2C)5"))
            page.locator(".product-grid, .empty-state").wait_for(state="visible")
            assert query(page).get("minPrice") == ["0"]
            assert query(page).get("maxPrice") in (["80.5"], ["80,50"])
            for value in qa.prices(page):
                assert 0 <= value <= 80.5
            context.close()

        qa.run("UX-08", "invalid range focuses error; zero and comma-decimal budget apply", "P1", invalid_and_decimal_budget)

        def multi_store_and_chips() -> None:
            context = qa.context(1440, 1000)
            page = qa.page(context)
            qa.goto(page, "/search?query=shirt&lang=en")
            page.locator(".catalog-toolbar .filter-toggle").click()
            dialog = page.locator(".filter-dialog[open]")
            checks = dialog.locator('.store-options input[type="checkbox"]')
            first, second = checks.nth(0), checks.nth(1)
            first_id, second_id = first.get_attribute("value"), second.get_attribute("value")
            first.check()
            second.check()
            dialog.get_by_role("button", name="Apply filters", exact=True).click()
            page.wait_for_url(re.compile(r"store="))
            page.locator(".active-filters").wait_for(state="visible")
            assert set(query(page)["store"][0].split(",")) == {first_id, second_id}
            chips = page.locator(".active-filters a:not(.clear-link)")
            assert chips.count() == 2
            qa.screenshot(page, "results-en-desktop-two-stores")
            before_remove = page.url
            chips.nth(0).click()
            page.wait_for_function("before => location.href !== before", arg=before_remove)
            assert query(page)["store"][0] in {first_id, second_id}
            clear = page.locator(".active-filters .clear-link")
            before_clear = page.url
            clear.click()
            page.wait_for_function("before => location.href !== before", arg=before_clear)
            assert query(page).get("query") == ["shirt"] and "store" not in query(page)
            context.close()

        qa.run("UX-09/12/13", "multi-store apply, one-chip removal and clear-filters retaining query", "P1", multi_store_and_chips)

        def sorts_pagination_history() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?lang=en&perPage=20&page=2")
            assert len(qa.prices(page)) == 20
            page.locator('.catalog-view-controls a', has_text="50").click()
            page.wait_for_url(re.compile(r"perPage=50"))
            assert "page" not in query(page) and len(qa.prices(page)) == 50
            choose_sort(page, "price-low")
            page.wait_for_url(re.compile(r"sort=price-low"))
            low = qa.prices(page)
            assert low == sorted(low)
            choose_sort(page, "price-high")
            page.wait_for_url(re.compile(r"sort=price-high"))
            high = qa.prices(page)
            assert high == sorted(high, reverse=True)
            low_url = page.url
            page.go_back(wait_until="domcontentloaded")
            after_back = page.url
            assert query(page).get("sort") == ["price-low"]
            page.go_forward(wait_until="domcontentloaded")
            for _ in range(20):
                if query(page).get("sort") == ["price-high"]:
                    break
                page.wait_for_timeout(100)
            qa.detail(low_url=low_url, after_back=after_back, after_forward=page.url)
            assert query(page).get("sort") == ["price-high"]
            choose_sort(page, "")
            page.wait_for_timeout(250)
            assert "sort" not in query(page)
            context.close()

        qa.run("UX-14", "numeric sorting, per-page reset, relevance/default and browser history", "P1", sorts_pagination_history)

        def details_return_and_security() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?query=black&sort=price-low&lang=lt")
            source = page.url
            page.locator(".product-link").first.click()
            page.wait_for_url(re.compile(r"/out/MOCK-"))
            assert urlparse(page.url).path.startswith("/out/MOCK-")
            page.locator(".product-breadcrumbs a").first.click()
            page.wait_for_url(source)
            qa.goto(page, "/out/MOCK-001?returnTo=https%3A%2F%2Fevil.example%2Fpwn&lang=en")
            back = page.locator(".product-breadcrumbs a").first.get_attribute("href")
            assert back and back.startswith("/search") and "evil.example" not in back
            response = page.goto(f"{qa.base_url}/out/UNKNOWN?returnTo=%2F%2Fevil.example", wait_until="domcontentloaded")
            assert response and response.status == 404
            assert urlparse(page.url).netloc == urlparse(qa.base_url).netloc
            context.close()

        qa.run("UX-20/21", "details restores search and rejects external return/unknown id", "P0", details_return_and_security)

        def mobile_gallery_focus() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/out/MOCK-001?returnTo=%2Fsearch%3Fquery%3Dblack&lang=en")
            trigger = page.locator(".product-zoom-trigger").first
            trigger.click()
            dialog = page.locator(".lightbox[open]")
            dialog.wait_for(state="visible")
            assert dialog.evaluate("d => d.contains(document.activeElement)")
            focus_cycle = []
            for _ in range(8):
                page.keyboard.press("Tab")
                focus_cycle.append(page.evaluate("() => ({tag: document.activeElement?.tagName, cls: document.activeElement?.className || '', body: document.activeElement === document.body})"))
                qa.detail(focus_cycle=focus_cycle)
                assert dialog.evaluate("d => d.contains(document.activeElement)")
            qa.screenshot(page, "details-mobile-gallery-focus-390")
            page.keyboard.press("Escape")
            assert not page.locator(".lightbox").evaluate("d => d.open")
            assert focused(trigger)
            context.close()

        qa.run("DETAIL-01", "mobile gallery traps focus, closes with Escape and restores trigger", "P1", mobile_gallery_focus)

        def saved_items_cross_tab() -> None:
            context = qa.context(1280, 900)
            first = qa.page(context)
            second = context.new_page()
            second.set_default_timeout(8_000)
            qa.goto(first, "/search?query=black&lang=en")
            first.evaluate("localStorage.removeItem('weft-wishlist')")
            first.reload(wait_until="domcontentloaded")
            first.locator(".product-grid").wait_for(state="visible")
            qa.goto(second, "/search?query=black&lang=en")
            one = first.locator(".wishlist-button").first
            two = second.locator(".wishlist-button").first
            one.click()
            second.wait_for_function("() => document.querySelector('.wishlist-button')?.getAttribute('aria-pressed') === 'true'")
            assert one.get_attribute("aria-pressed") == "true" and two.get_attribute("aria-pressed") == "true"
            first.locator('.account-link').click()
            first.wait_for_url(re.compile(r"/account"))
            first.locator(".saved-product").wait_for(state="visible")
            first.locator(".saved-product .wishlist-button").first.click()
            second.wait_for_function("() => document.querySelector('.wishlist-button')?.getAttribute('aria-pressed') === 'false'")
            context.close()

        qa.run("SAVE-01", "save/remove persists on same SPA and synchronizes another tab", "P1", saved_items_cross_tab)

        def saved_items_failure_modes() -> None:
            malformed = qa.context()
            page = qa.page(malformed)
            qa.goto(page, "/search?query=black&lang=en")
            page.evaluate("localStorage.setItem('weft-wishlist', '{broken')")
            page.reload(wait_until="domcontentloaded")
            page.locator(".wishlist-button").first.click()
            assert page.locator(".wishlist-button").first.get_attribute("aria-pressed") == "true"
            malformed.close()
            blocked = qa.context(blocked_storage=True)
            page = qa.page(blocked)
            qa.goto(page, "/search?query=black&lang=en")
            page.locator(".wishlist-button").first.click()
            assert page.locator(".wishlist-button").first.get_attribute("aria-pressed") == "true"
            page.locator(".account-link").click()
            page.wait_for_url(re.compile(r"/account"))
            page.locator('.account-storage-note[role="status"]').wait_for(state="visible")
            blocked.close()

        qa.run("SAVE-02", "malformed and blocked localStorage degrade safely", "P1", saved_items_failure_modes)

        def no_javascript_get_forms() -> None:
            context = qa.context(390, 844, java_script_enabled=False)
            page = qa.page(context)
            qa.goto(page, "/search?lang=lt")
            field = page.locator('form.catalog-form input[type="search"][name="query"]')
            qa.detail(
                nojs_input_box=field.bounding_box(),
                nojs_input_visible=field.is_visible(),
                nojs_ancestors=field.evaluate("el => { const out=[]; for(let n=el;n&&out.length<8;n=n.parentElement){ const s=getComputedStyle(n); out.push({tag:n.tagName,cls:String(n.className||''),hidden:n.hidden,display:s.display,visibility:s.visibility}); } return out; }")
            )
            if not field.is_visible():
                raise AssertionError("server-rendered search is hidden when JavaScript is disabled")
            field.fill("juodas paltas")
            field.press("Enter")
            page.wait_for_url(re.compile(r"/search\?"))
            assert query(page).get("query") == ["juodas paltas"]
            page.locator(".filter-disclosure > summary").click()
            fallback = page.locator(".filter-fallback")
            fallback.locator('input[name="maxPrice"]').fill("150")
            fallback.locator('.store-options input[type="checkbox"]').first.check()
            fallback.locator('button[type="submit"]').click()
            page.wait_for_url(re.compile(r"maxPrice=150"))
            assert query(page).get("query") == ["juodas paltas"]
            assert query(page).get("maxPrice") == ["150"]
            qa.screenshot(page, "nojs-results-lt-mobile-390")
            context.close()

        qa.run("NOJS-01", "native GET search and filter fallback work without JavaScript", "P1", no_javascript_get_forms)

        def rapid_intent() -> None:
            context = qa.context()
            context.add_init_script("""
              window.__qaSubmittedQueries = [];
              document.addEventListener('submit', event => {
                const value = new FormData(event.target).get('query');
                window.__qaSubmittedQueries.push(typeof value === 'string' ? value : null);
              }, true);
            """)
            page = qa.page(context)
            requests: list[str] = []
            page.on("request", lambda request: requests.append(request.url) if "/search" in request.url else None)
            qa.goto(page, "/?lang=en")
            field = page.locator('form[role="search"] input[name="query"]')
            field.fill("black coat")
            page.locator('form[role="search"]').evaluate("form => { form.requestSubmit(); form.requestSubmit(); }")
            page.wait_for_url(re.compile(r"query=black(?:\+|%20)coat"))
            page.locator('input[type="search"][name="query"]').fill("linen shirt")
            page.locator('input[type="search"][name="query"]').press("Enter")
            page.locator('input[type="search"][name="query"]').fill("white sneakers")
            white_before_press = page.locator('input[type="search"][name="query"]').input_value()
            page.locator('input[type="search"][name="query"]').press("Enter")
            try:
                page.wait_for_url(re.compile(r"query=white(?:\+|%20)sneakers"))
            finally:
                qa.detail(
                    final_rapid_url=page.url,
                    final_visible_query=page.locator('input[type="search"][name="query"]').input_value(),
                    white_before_press=white_before_press,
                    submitted_queries=page.evaluate("window.__qaSubmittedQueries"),
                    search_request_urls=[url for url in requests if "/search" in url],
                )
            page.locator(".product-grid, .empty-state").wait_for(state="visible")
            assert query(page).get("query") == ["white sneakers"]
            search_navigations = [url for url in requests if "query=black" in url and "_rsc=" in url]
            qa.detail(black_query_rsc_requests=len(search_navigations), final_url=page.url)
            context.close()

        qa.run("UX-06", "duplicate submit is coalesced and latest rapid query wins", "P1", rapid_intent)

        def locale_ssr_switch_and_404() -> None:
            context = qa.context(390, 844)
            response = context.request.get(f"{qa.base_url}/search?query=black&sort=price-low&lang=lt")
            html = response.text()
            assert response.status == 200 and re.search(r'<html[^>]+lang="lt"', html)
            assert "Paieška" in html or "Rezultatai" in html
            page = qa.page(context)
            qa.goto(page, "/search?query=black&sort=price-low&lang=en")
            page.locator('.language-switcher a', has_text="LT").click()
            page.wait_for_url(re.compile(r"lang=lt"))
            page.wait_for_function("() => document.documentElement.lang === 'lt'")
            assert page.locator("html").get_attribute("lang") == "lt"
            assert query(page).get("query") == ["black"] and query(page).get("sort") == ["price-low"]
            response = page.goto(f"{qa.base_url}/this-route-does-not-exist?lang=lt", wait_until="domcontentloaded")
            assert response and response.status == 404
            assert page.locator("html").get_attribute("lang") == "lt"
            assert page.locator('a[href^="/search"]').count() >= 1
            context.close()

        qa.run("UX-22/27", "LT is server-rendered; soft switch preserves search; unknown route recovers", "P1", locale_ssr_switch_and_404)

        def image_404_stability() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/search?query=black&lang=en")
            image = page.locator(".product-media img").first
            image.scroll_into_view_if_needed()
            image.evaluate("img => { img.srcset = ''; img.src = '/images/__qa-missing-product__.webp'; }")
            page.wait_for_function("() => document.querySelectorAll('.image-fallback').length > 0")
            assert page.locator(".product-tile").count() > 1
            first_box = page.locator(".product-media").first.bounding_box()
            assert first_box and first_box["height"] > first_box["width"]
            qa.screenshot(page, "image-failure-mobile-390")
            context.close()

        qa.run("UX-19", "one image 404 keeps the grid stable and does not substitute another garment", "P1", image_404_stability)

        def keyboard_core_and_dialog() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?query=black&lang=en")
            page.locator("body").press("Tab")
            assert focused(page.locator(".skip-link"))
            page.keyboard.press("Enter")
            assert focused(page.locator("main"))
            page.locator(".catalog-toolbar .filter-toggle").focus()
            page.keyboard.press("Enter")
            dialog = page.locator(".filter-dialog[open]")
            dialog.wait_for(state="visible")
            assert dialog.evaluate("d => d.contains(document.activeElement)")
            focus_cycle = []
            for _ in range(24):
                page.keyboard.press("Tab")
                focus_cycle.append(page.evaluate("() => ({tag: document.activeElement?.tagName, cls: document.activeElement?.className || '', body: document.activeElement === document.body})"))
                qa.detail(focus_cycle=focus_cycle)
                assert dialog.evaluate("d => d.contains(document.activeElement)")
            qa.screenshot(page, "keyboard-filter-focus-desktop")
            page.keyboard.press("Escape")
            assert focused(page.locator(".catalog-toolbar .filter-toggle"))
            context.close()

        qa.run("UX-23", "keyboard skip link and modal focus containment/restoration", "P1", keyboard_core_and_dialog)

        def viewport_overflow_matrix() -> None:
            cases = [
                (320, 844, "/?lang=lt"), (360, 844, "/search?query=black&store=demo-store-01,demo-store-02&maxPrice=150&lang=lt"),
                (390, 844, "/search?query=black&lang=en"), (430, 900, "/out/MOCK-001?lang=lt"),
                (768, 1000, "/out/MOCK-001?lang=en"), (1280, 900, "/search?query=black&lang=en"),
                (1440, 1000, "/?lang=en"), (1920, 1080, "/search?query=black&lang=lt"),
            ]
            evidence = []
            for width, height, path in cases:
                context = qa.context(width, height)
                page = qa.page(context)
                qa.goto(page, path)
                qa.assert_no_horizontal_overflow(page)
                evidence.append({"viewport": f"{width}x{height}", "route": path})
                if width in (320, 390, 1440):
                    qa.screenshot(page, f"responsive-{width}-{urlparse(path).path.strip('/') or 'home'}")
                context.close()
            qa.detail(matrix=evidence)

        qa.run("RESP-01", "representative routes do not horizontally overflow at 320–1920px", "P2", viewport_overflow_matrix)

        def zoom_and_motion() -> None:
            context = qa.context(640, 1000, reduced_motion="reduce")
            page = qa.page(context)
            qa.goto(page, "/search?query=black&store=demo-store-01,demo-store-02&lang=lt")
            assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
            duration = page.locator(".product-media img").first.evaluate("el => getComputedStyle(el).transitionDuration")
            assert duration in ("0s", "0.00001s", "1e-05s") or duration.startswith("0.01")
            page.evaluate("document.documentElement.style.zoom = '2'")
            page.wait_for_timeout(100)
            qa.assert_no_horizontal_overflow(page)
            qa.screenshot(page, "lt-search-css-zoom-200-percent-320-effective")
            context.close()

        qa.run("UX-24/25/26", "320-effective 200% CSS zoom, long LT copy and reduced motion", "P1", zoom_and_motion)

        def axe_matrix() -> None:
            if not AXE_PATH.exists():
                raise AssertionError(f"axe bundle missing at {AXE_PATH}")
            routes = ["/", "/search?query=black", "/out/MOCK-001", "/account", "/stores"]
            serious: list[dict[str, Any]] = []
            for locale in ("en", "lt"):
                for theme in ("light", "dark"):
                    context = qa.context(390, 844, color_scheme=theme)
                    if theme == "dark":
                        context.add_init_script("localStorage.setItem('weft-theme', 'dark')")
                    for route in routes:
                        page = qa.page(context)
                        separator = "&" if "?" in route else "?"
                        qa.goto(page, f"{route}{separator}lang={locale}", status=404 if "UNKNOWN" in route else 200)
                        page.add_script_tag(path=str(AXE_PATH))
                        result = page.evaluate("async () => await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
                        entry = {
                            "locale": locale,
                            "theme": theme,
                            "route": route,
                            "violations": [
                                {"id": item["id"], "impact": item["impact"], "help": item["help"], "nodes": len(item["nodes"])}
                                for item in result["violations"]
                            ],
                        }
                        qa.axe_results.append(entry)
                        serious.extend(
                            {**violation, "locale": locale, "theme": theme, "route": route}
                            for violation in entry["violations"]
                            if violation["impact"] in ("critical", "serious")
                        )
                        page.close()
                    page = qa.page(context)
                    qa.goto(page, f"/search?query=black&lang={locale}")
                    page.locator(".catalog-toolbar .filter-toggle").click()
                    page.locator(".filter-dialog[open]").wait_for(state="visible")
                    page.add_script_tag(path=str(AXE_PATH))
                    result = page.evaluate("async () => await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
                    entry = {
                        "locale": locale, "theme": theme, "route": "/search#filter-dialog",
                        "violations": [{"id": item["id"], "impact": item["impact"], "help": item["help"], "nodes": len(item["nodes"])} for item in result["violations"]],
                    }
                    qa.axe_results.append(entry)
                    serious.extend({**violation, "locale": locale, "theme": theme, "route": entry["route"]} for violation in entry["violations"] if violation["impact"] in ("critical", "serious"))
                    if locale == "lt" and theme == "dark":
                        qa.screenshot(page, "axe-dialog-lt-dark-mobile-390")
                    context.close()
            (qa.artifacts / "axe-results.json").write_text(json.dumps(qa.axe_results, ensure_ascii=False, indent=2), encoding="utf-8")
            qa.detail(axe_runs=len(qa.axe_results), serious=serious)
            if serious:
                raise AssertionError(f"{len(serious)} serious/critical axe findings: {serious[:6]}")

        qa.run("A11Y-01", "axe WCAG-tag scan: 5 routes + open dialog, EN/LT, light/dark", "P1", axe_matrix)

        qa.note("UX-16", "controlled full catalog failure and retry", "NOT RUN", "Covered by the separate scripts/catalog_failure_e2e.py localhost fixture; its result is recorded independently, not included in this runner's count.")
        qa.note("UX-17", "live AI error/timeout with local fallback", "NOT RUN", "External Gemini was intentionally disabled and no paid/live credential was used; integration coverage belongs to the existing search tests.")
        qa.note("MANUAL-01", "physical device, NVDA/TalkBack and Windows High Contrast", "NOT RUN", "Unavailable in this headless browser pass; automated axe and keyboard evidence are not equivalent.")

        report = qa.write_report()
        browser.close()
        print(f"REPORT {report}")
        return 1 if any(item["status"] == "FAIL" and item["severity"] in ("P0", "P1") for item in qa.results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
