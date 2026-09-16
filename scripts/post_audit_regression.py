"""User-flow regression evidence for the 2026-09-15 Weft post-audit fixes.

This runner checks current public UI contracts rather than historical pixel
coordinates. It writes one machine-readable report and comparable screenshots
under the evidence folder supplied on the command line.
"""

from __future__ import annotations

import argparse
import json
import re
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright


def params(page: Page) -> dict[str, list[str]]:
    return parse_qs(urlparse(page.url).query)


class Regression:
    def __init__(self, browser: Browser, base_url: str, output: Path) -> None:
        self.browser = browser
        self.base_url = base_url.rstrip("/")
        self.output = output
        self.screenshots = output / "screenshots"
        self.screenshots.mkdir(parents=True, exist_ok=True)
        self.results: list[dict[str, Any]] = []
        self.browser_errors: list[str] = []
        self.page: Page | None = None

    def context(self, width: int, height: int, *, javascript: bool = True, reduced_motion: str = "no-preference") -> BrowserContext:
        return self.browser.new_context(
            viewport={"width": width, "height": height},
            java_script_enabled=javascript,
            reduced_motion=reduced_motion,
        )

    def open(self, context: BrowserContext, path: str, *, wait: str = "domcontentloaded") -> Page:
        page = context.new_page()
        page.set_default_timeout(10_000)
        page.on("pageerror", lambda error: self.browser_errors.append(str(error)))
        response = page.goto(f"{self.base_url}{path}", wait_until=wait)
        if response is None or response.status != 200:
            raise AssertionError(f"{path} returned HTTP {None if response is None else response.status}")
        page.locator("main").wait_for(state="visible")
        page.wait_for_timeout(250)
        self.page = page
        return page

    def shot(self, page: Page, name: str, *, full_page: bool = False) -> str:
        target = self.screenshots / f"{name}.png"
        page.screenshot(path=str(target), full_page=full_page, animations="disabled")
        return str(target.relative_to(self.output.parent.parent)).replace("\\", "/")

    def run(self, test_id: str, name: str, function: Callable[[], dict[str, Any]]) -> None:
        record: dict[str, Any] = {"id": test_id, "name": name, "status": "FAIL"}
        try:
            record["evidence"] = function()
            record["status"] = "PASS"
        except Exception as error:
            record["error"] = f"{type(error).__name__}: {error}"
            record["traceback"] = traceback.format_exc(limit=6)
            if self.page and not self.page.is_closed():
                try:
                    record["failure_screenshot"] = self.shot(self.page, f"FAIL-{test_id.lower().replace('/', '-')}")
                except Exception as screenshot_error:
                    record["screenshot_error"] = str(screenshot_error)
        finally:
            self.results.append(record)
            print(f"{record['status']:4} {test_id} {name}" + (f": {record.get('error')}" if record["status"] == "FAIL" else ""), flush=True)


def wait_for_enhanced_filters(page: Page) -> None:
    page.wait_for_function("""() => {
      const button = document.querySelector('.catalog-toolbar .filter-toggle');
      return Boolean(button && !button.hidden);
    }""")


def no_document_overflow(page: Page) -> dict[str, Any]:
    metrics = page.evaluate("""() => {
      const root = document.documentElement;
      const offenders = [...document.querySelectorAll('main *')].map((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {tag: element.tagName, cls: String(element.className || ''), left: rect.left, right: rect.right,
          width: rect.width, height: rect.height, display: style.display};
      }).filter((item) => item.display !== 'none' && item.width > 1 && item.height > 1 &&
        (item.left < -2 || item.right > innerWidth + 2)).slice(0, 12);
      return {clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, innerWidth, offenders};
    }""")
    if metrics["scrollWidth"] > metrics["clientWidth"] + 1:
        raise AssertionError(f"document overflow: {metrics}")
    return metrics


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3200")
    parser.add_argument("--output", type=Path, default=Path("evidence/2026-09-15-post-audit/results/regression"))
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        qa = Regression(browser, args.base_url, output)

        def search_flow() -> dict[str, Any]:
            records: list[dict[str, Any]] = []
            context = qa.context(1440, 900)
            page = qa.open(context, "/?lang=en")
            field = page.locator(".campaign-search input[name=query]")
            field.fill("blue jeans under 40")
            field.press("Enter")
            page.wait_for_url(re.compile(r"/search\\?"))
            assert params(page).get("query") == ["blue jeans under 40"]
            assert page.locator(".product-grid").count() == 1
            records.append({"locale": "en", "submitted": params(page).get("query"), "result_count": page.locator(".product-tile").count()})
            for locale in ("en", "lt"):
                page = qa.open(context, f"/?lang={locale}")
                examples = page.locator(".campaign-examples a")
                assert examples.count() >= 3
                hrefs = [examples.nth(index).get_attribute("href") for index in range(examples.count())]
                for href in hrefs:
                    assert href
                    page = qa.open(context, href)
                    assert page.locator(".product-grid").count() == 1, href
                records.append({"locale": locale, "example_count": len(hrefs), "example_hrefs": hrefs})
            screenshot = qa.shot(page, "search-example-result-en")
            context.close()
            return {"cases": records, "screenshot": screenshot}

        qa.run("FLOW-SEARCH", "hero search and visible EN/LT examples reach results", search_flow)

        def pdp_matrix() -> dict[str, Any]:
            records: list[dict[str, Any]] = []
            cases = [(360, 844), (390, 844), (430, 900), (768, 1000), (1024, 900), (1280, 900), (1440, 900)]
            for locale in ("en", "lt"):
                for product_id in ("MOCK-001", "MOCK-002", "MOCK-014"):
                    for width, height in cases:
                        context = qa.context(width, height)
                        page = qa.open(context, f"/out/{product_id}?lang={locale}")
                        metrics = no_document_overflow(page)
                        facts = page.locator(".product-facts-section")
                        facts_text = facts.inner_text() if facts.count() else ""
                        assert "|" not in facts_text
                        assert "point_collar" not in facts_text and "washed_cotton" not in facts_text
                        if product_id == "MOCK-001" and locale == "en" and width == 360:
                            screenshot_360 = qa.shot(page, "pdp-shirt-en-360")
                        if product_id == "MOCK-001" and locale == "en" and width == 1440:
                            screenshot_1440 = qa.shot(page, "pdp-shirt-en-1440")
                        if product_id == "MOCK-014" and locale == "lt" and width == 390:
                            screenshot_lt = qa.shot(page, "pdp-skirt-lt-390")
                        records.append({"locale": locale, "product": product_id, "viewport": [width, height],
                                        "scrollWidth": metrics["scrollWidth"], "fact_text": facts_text[:600]})
                        context.close()
            return {"cases": records, "screenshots": [screenshot_360, screenshot_1440, screenshot_lt]}

        qa.run("FLOW-PDP", "PDP facts are readable and do not overflow the document matrix", pdp_matrix)

        def mobile_filters() -> dict[str, Any]:
            records: list[dict[str, Any]] = []
            for locale, width, height in (("en", 390, 844), ("lt", 320, 844)):
                context = qa.context(width, height)
                page = qa.open(context, f"/search?query=black&lang={locale}")
                wait_for_enhanced_filters(page)
                trigger = page.locator(".catalog-toolbar .filter-toggle")
                before_url = page.url
                trigger.click()
                dialog = page.locator(".filter-dialog")
                dialog.wait_for(state="visible")
                assert dialog.get_by_role("button", name=re.compile("Apply|Taikyti")).is_visible()
                assert page.evaluate("() => getComputedStyle(document.body).overflow === 'hidden'")
                assert dialog.evaluate("dialog => dialog.contains(document.activeElement)")
                shot = qa.shot(page, f"filters-open-{locale}-{width}")
                page.keyboard.press("Escape")
                assert not dialog.evaluate("dialog => dialog.open")
                assert page.url == before_url
                assert trigger.evaluate("element => element === document.activeElement")
                records.append({"locale": locale, "viewport": [width, height], "screenshot": shot,
                                "dialog_footer": dialog.locator(".filter-dialog-actions").bounding_box()})
                context.close()
            return {"cases": records}

        qa.run("FLOW-FILTERS", "mobile filter dialog opens, stays bounded and restores focus", mobile_filters)

        def category_state() -> dict[str, Any]:
            context = qa.context(1440, 900)
            page = qa.open(context, "/search?query=blue&department=women&maxPrice=150&page=2&lang=en")
            page.locator(".category-nav").get_by_role("link", name="Jeans", exact=True).click()
            page.wait_for_url(re.compile(r"category=jeans"))
            current = params(page)
            assert current.get("query") == ["blue"] and current.get("department") == ["women"]
            assert current.get("maxPrice") == ["150"] and "page" not in current
            chip = page.locator('.active-filters a:not(.clear-link)', has_text="Jeans").first
            chip.click()
            page.wait_for_function("() => !new URL(location.href).searchParams.has('category')")
            cleared = params(page)
            assert cleared.get("query") == ["blue"] and cleared.get("department") == ["women"] and cleared.get("maxPrice") == ["150"]
            screenshot = qa.shot(page, "category-state-cleared-en-1440")
            context.close()

            nojs = qa.context(390, 844, javascript=False)
            page = qa.open(nojs, "/search?query=blue&department=women&maxPrice=150&page=2&lang=lt")
            link = page.locator(".category-nav").get_by_role("link", name="Džinsai", exact=True)
            href = link.get_attribute("href")
            assert href and "category=jeans" in href and "query=blue" in href and "page=" not in href
            link.click()
            nojs_params = params(page)
            assert nojs_params.get("category") == ["jeans"] and nojs_params.get("query") == ["blue"]
            assert nojs_params.get("department") == ["women"] and nojs_params.get("maxPrice") == ["150"]
            nojs.close()
            return {"after_category": current, "after_clear": cleared, "nojs_href": href, "nojs_params": nojs_params,
                    "screenshot": screenshot}

        qa.run("FLOW-CATEGORY", "category facet preserves query, department and budget then clears only itself", category_state)

        def saved_and_menu() -> dict[str, Any]:
            context = qa.context(390, 844)
            page = qa.open(context, "/search?query=black&lang=en")
            page.evaluate("localStorage.removeItem('weft-wishlist')")
            page.reload(wait_until="domcontentloaded")
            page.locator(".product-grid").wait_for(state="visible")
            card_button = page.locator(".product-grid .wishlist-button").first
            card_button.click()
            page.wait_for_function("() => document.querySelector('.product-grid .wishlist-button')?.getAttribute('aria-pressed') === 'true'")
            product_id = page.locator(".product-link").first.get_attribute("href")
            page.locator(".account-link").click()
            page.wait_for_url(re.compile(r"/saved"))
            page.locator(".saved-product").wait_for(state="visible")
            assert page.locator(".saved-product").count() == 1
            saved_content_screenshot = qa.shot(page, "saved-content-en-390")
            page.locator(".saved-product .wishlist-button").first.click()
            page.wait_for_function("() => document.querySelectorAll('.saved-product').length === 0")
            page.reload(wait_until="domcontentloaded")
            page.locator(".account-empty").wait_for(state="visible")
            saved_empty_screenshot = qa.shot(page, "saved-empty-en-390")

            home = qa.open(context, "/?lang=en")
            menu_trigger = home.locator(".mobile-menu > summary")
            assert menu_trigger.get_attribute("aria-label")
            menu_trigger.click()
            menu = home.locator(".mobile-menu[open] nav")
            menu.wait_for(state="visible")
            assert menu.get_by_role("link", name="Catalog", exact=True).is_visible()
            menu_open_screenshot = qa.shot(home, "mobile-menu-open-en-390")
            home.keyboard.press("Escape")
            assert not home.locator(".mobile-menu").get_attribute("open")
            assert menu_trigger.evaluate("element => element === document.activeElement")
            screenshot = qa.shot(home, "mobile-menu-closed-en-390")
            menu_trigger_label = menu_trigger.get_attribute("aria-label")
            context.close()
            return {"saved_product_href": product_id, "saved_after_reload": 0, "menu_trigger_label": menu_trigger_label,
                    "saved_content_screenshot": saved_content_screenshot, "saved_empty_screenshot": saved_empty_screenshot,
                    "menu_open_screenshot": menu_open_screenshot, "screenshot": screenshot}

        qa.run("FLOW-SAVED-MENU", "Saved round trip and accessible mobile menu work", saved_and_menu)

        def locale_switch() -> dict[str, Any]:
            context = qa.context(390, 844)
            page = qa.open(context, "/search?query=black&sort=price-low&lang=en")
            page.locator(".language-switcher").get_by_role("link", name="LT", exact=True).click()
            page.wait_for_url(re.compile(r"lang=lt"))
            page.wait_for_function("() => document.documentElement.lang === 'lt'")
            switched = params(page)
            assert switched.get("query") == ["black"] and switched.get("sort") == ["price-low"]
            page = qa.open(context, "/out/MOCK-001?lang=en")
            page.locator(".language-switcher").get_by_role("link", name="LT", exact=True).click()
            page.wait_for_url(re.compile(r"lang=lt"))
            page.wait_for_function("() => document.documentElement.lang === 'lt'")
            assert "Marškiniai" in page.locator(".product-detail-category").all_text_contents()
            context.close()
            return {"search": switched, "pdp_lang": "lt", "pdp_category": "Marškiniai"}

        qa.run("FLOW-LOCALE", "EN/LT switches preserve search state and localize the PDP shell", locale_switch)

        report = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "base_url": qa.base_url,
            "source": "headless Chromium against local Next.js server; no external credentials",
            "summary": {status: sum(item["status"] == status for item in qa.results) for status in ("PASS", "FAIL")},
            "results": qa.results,
            "browser_errors": qa.browser_errors,
            "limits": [
                "No physical iOS/Android, Safari, screen reader, safe-area or production latency session was run.",
                "3D rendering is covered by scripts/fitting_room_e2e.py separately.",
            ],
        }
        report_path = output / "report.json"
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"REPORT {report_path}")
        browser.close()
        return 1 if any(item["status"] == "FAIL" for item in qa.results) or qa.browser_errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
