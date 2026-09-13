"""Regression contract for category navigation and search-state separation."""
from __future__ import annotations

import argparse
import json
import re
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import Browser, BrowserContext, Locator, Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / ".omx" / "artifacts" / "frontend" / "category-navigation-baseline"
FINAL = ROOT / ".omx" / "artifacts" / "frontend" / "category-navigation-final"


def query(page: Page) -> dict[str, list[str]]:
    return parse_qs(urlparse(page.url).query)


def exact_link(scope: Locator, label: str) -> Locator:
    return scope.get_by_role("link", name=label, exact=True)


def no_overflow(page: Page) -> dict[str, int]:
    value = page.evaluate("() => ({client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth})")
    assert value["scroll"] <= value["client"] + 1, value
    return value


class QA:
    def __init__(self, browser: Browser, base_url: str, artifacts: Path) -> None:
        self.browser, self.base_url, self.artifacts = browser, base_url.rstrip("/"), artifacts
        self.shots = artifacts / "screenshots"
        self.shots.mkdir(parents=True, exist_ok=True)
        self.results: list[dict[str, Any]] = []
        self.browser_errors: list[str] = []

    def context(self, width=1440, height=1000, *, javascript=True) -> BrowserContext:
        return self.browser.new_context(viewport={"width": width, "height": height}, java_script_enabled=javascript)

    def page(self, context: BrowserContext) -> Page:
        page = context.new_page()
        page.set_default_timeout(8_000)
        page.on("pageerror", lambda error: self.browser_errors.append(str(error)))
        page.on("console", lambda message: self.browser_errors.append(message.text) if message.type == "error" else None)
        return page

    def goto(self, page: Page, path: str) -> None:
        response = page.goto(self.base_url + path, wait_until="domcontentloaded")
        assert response and response.status == 200, (path, None if response is None else response.status)
        page.locator("main").wait_for(state="visible")

    def screenshot(self, page: Page, name: str) -> str:
        page.evaluate("scrollTo(0, 0)")
        page.wait_for_function("""async () => {
          const images = [...document.querySelectorAll('.product-grid img')].filter(image => image.checkVisibility());
          await Promise.all(images.map(image => image.decode().catch(() => undefined)));
          return images.every(image => image.complete && image.naturalWidth > 0);
        }""")
        target = self.shots / f"{name}.png"
        page.screenshot(path=str(target), animations="disabled")
        return str(target.relative_to(ROOT)).replace("\\", "/")

    def run(self, test_id: str, description: str, function: Callable[[], dict[str, Any] | None]) -> None:
        record: dict[str, Any] = {"id": test_id, "description": description, "status": "FAIL"}
        try:
            record.update(status="PASS", evidence=function() or {})
        except Exception as error:
            record.update(error=f"{type(error).__name__}: {error}", traceback=traceback.format_exc(limit=6))
        self.results.append(record)
        line = f"{record['status']:4} {test_id} {description}" + (f": {record.get('error')}" if record["status"] == "FAIL" else "")
        print(line.encode("ascii", "backslashreplace").decode("ascii"), flush=True)

    def report(self, mode: str) -> Path:
        payload = {
            "generated_at": datetime.now(timezone.utc).isoformat(), "mode": mode, "base_url": self.base_url,
            "summary": {state: sum(item["status"] == state for item in self.results) for state in ("PASS", "FAIL")},
            "results": self.results, "browser_errors": self.browser_errors,
            "contract": "Category navigation changes only the category facet; query text remains shopper-owned state.",
        }
        target = self.artifacts / "report.json"
        target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return target


def choose_picker(page: Page, kind: str, value: str) -> None:
    picker = page.locator("details.option-picker.density-view" if kind == "density" else ".sort-form details.option-picker")
    picker.locator(":scope > summary").click()
    picker.locator(f'.picker-options button[data-value="{value}"]').click()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3100")
    parser.add_argument("--mode", choices=("baseline", "final"), default="final")
    parser.add_argument("--artifacts", type=Path)
    args = parser.parse_args()
    artifacts = (args.artifacts or (BASELINE if args.mode == "baseline" else FINAL)).resolve()
    artifacts.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        qa = QA(browser, args.base_url, artifacts)

        def one_generic_catalog_label() -> dict[str, Any]:
            cases = []
            violations = []
            for locale, width, height in (("en", 1440, 1000), ("lt", 2560, 1440), ("en", 390, 844), ("lt", 390, 844)):
                context = qa.context(width, height)
                page = qa.page(context)
                qa.goto(page, f"/search?lang={locale}")
                header_label = "Catalog" if locale == "en" else "Katalogas"
                generic = "All clothing" if locale == "en" else "Visi drabužiai"
                if width <= 700:
                    page.locator(".mobile-menu > summary").click()
                    header_catalog_links = page.locator("header").get_by_role("link", name=header_label, exact=True).count()
                    page.keyboard.press("Escape")
                else:
                    header_catalog_links = page.locator("header").get_by_role("link", name=header_label, exact=True).count()
                screenshot = qa.screenshot(page, f"catalog-{locale}-{width}")
                checks = {
                    "header_catalog_links": header_catalog_links,
                    "category_nav_generic_links": page.locator(".category-nav").get_by_role("link", name=generic, exact=True).count(),
                    "generic_headings": page.get_by_role("heading", name=generic, exact=True).count(),
                    "generic_text_nodes": page.get_by_text(generic, exact=True).count(),
                }
                if not (checks["header_catalog_links"] >= 1 and checks["category_nav_generic_links"] == 0
                        and checks["generic_headings"] == 1 and checks["generic_text_nodes"] == 1):
                    violations.append({"locale": locale, "viewport": [width, height], **checks})
                cases.append({"locale": locale, "viewport": [width, height], "header": header_label,
                              **checks, "overflow": no_overflow(page), "screenshot": screenshot})
                context.close()
            assert not violations, violations
            return {"cases": cases}

        qa.run("NAV-01", "global Catalog label and one generic catalog heading remove the duplicate", one_generic_catalog_label)

        def category_never_mutates_query() -> dict[str, Any]:
            context = qa.context(1440, 1000)
            page = qa.page(context)
            qa.goto(page, "/search?lang=en")
            qa.screenshot(page, "before-jeans-en-1440")
            exact_link(page.locator(".category-nav"), "Jeans").click()
            page.wait_for_function("() => new URL(location.href).searchParams.get('category') === 'jeans'")
            assert "query" not in query(page)

            qa.goto(page, "/search?query=blue&gender=women&color=light_blue&sort=price-low&page=2&lang=en")
            exact_link(page.locator(".category-nav"), "Jeans").click()
            page.wait_for_function("() => new URL(location.href).searchParams.get('category') === 'jeans'")
            current = query(page)
            assert current.get("query") == ["blue"] and current.get("gender") == ["women"]
            assert current.get("color") == ["light_blue"] and current.get("sort") == ["price-low"]
            assert "page" not in current

            qa.goto(page, "/search?query=denim&maxPrice=150&page=3&lang=en")
            exact_link(page.locator(".category-nav"), "Jeans").click()
            page.wait_for_function("() => new URL(location.href).searchParams.get('category') === 'jeans'")
            current = query(page)
            assert current.get("query") == ["denim"] and current.get("maxPrice") == ["150"] and "page" not in current
            exact_link(page.locator(".category-nav"), "Outerwear").click()
            page.wait_for_function("() => new URL(location.href).searchParams.get('category') === 'outerwear'")
            assert query(page).get("query") == ["denim"]

            qa.goto(page, "/search?query=blue&category=jeans&gender=women&lang=en")
            page.locator("header").get_by_role("link", name="Catalog", exact=True).click()
            page.wait_for_function("() => location.pathname === '/search' && !new URL(location.href).searchParams.has('query')")
            cleared = query(page)
            assert set(cleared).issubset({"lang"}), cleared
            context.close()
            return {"blank": "category=jeans without query", "blue": "query preserved",
                    "denim_to_outerwear": "query preserved", "global_catalog": cleared}

        qa.run("NAV-02", "Jeans sets a real facet while preserving blank, blue and denim query intent", category_never_mutates_query)

        if args.mode == "final":
            def jeans_results_and_clear() -> dict[str, Any]:
                records = []
                for locale, width, height in (("en", 1440, 1000), ("lt", 2560, 1440), ("lt", 390, 844)):
                    context = qa.context(width, height)
                    page = qa.page(context)
                    qa.goto(page, f"/search?category=jeans&lang={locale}")
                    titles = page.locator(".product-title").all_inner_texts()
                    assert titles and all(re.search(r"jeans", title, re.I) for title in titles), titles
                    ids = {re.search(r"MOCK-\d+", href).group(0) for href in page.locator(".product-link").evaluate_all("links => links.map(link => link.href)")}
                    assert ids == {"MOCK-005", "MOCK-017", "MOCK-058"}, ids
                    assert page.locator('form.catalog-form input[name="query"]').input_value() == ""
                    assert page.locator(".search-interpretation").count() == 0
                    jeans_label = "Jeans" if locale == "en" else "Džinsai"
                    assert exact_link(page.locator(".category-nav"), jeans_label).get_attribute("aria-current") == "page"
                    assert page.locator('.active-filters a:not(.clear-link)', has_text=jeans_label).count() == 1
                    clean_screenshot = qa.screenshot(page, f"jeans-{locale}-{width}")
                    qa.goto(page, f"/search?query=blue&category=jeans&gender=women&lang={locale}")
                    if width <= 700:
                        page.locator(".catalog-toolbar .filter-toggle").click()
                        scope = page.locator(".filter-dialog[open]")
                    else:
                        scope = page.locator("aside.filter-panel")
                    category = scope.locator('input[type="radio"][name="category"][value="jeans"]')
                    assert category.is_checked()
                    if width <= 700:
                        page.keyboard.press("Escape")
                    chip = page.locator('.active-filters a[href]:not(.clear-link)', has_text=re.compile("Jeans|Džinsai", re.I))
                    assert chip.count() == 1
                    chip.click()
                    page.wait_for_function("() => !new URL(location.href).searchParams.has('category')")
                    assert query(page).get("query") == ["blue"] and query(page).get("gender") == ["women"]
                    if width > 700:
                        qa.goto(page, "/search?query=blue&category=jeans&gender=women&lang=en")
                        panel = page.locator("aside.filter-panel")
                        group = panel.locator('.filter-group:has(input[name="category"])')
                        group.locator(":scope > summary").click()
                        all_categories = group.locator('input[name="category"][value=""]')
                        all_categories.locator("xpath=ancestor::label").click()
                        assert all_categories.is_checked()
                        panel.get_by_role("button", name=re.compile("Apply|Taikyti", re.I)).click()
                        page.wait_for_function("() => !new URL(location.href).searchParams.has('category')")
                        assert query(page).get("query") == ["blue"] and query(page).get("gender") == ["women"]
                    records.append({"locale": locale, "viewport": [width, height], "titles": titles, "ids": sorted(ids),
                                    "clean_screenshot": clean_screenshot,
                                    "cleared_query": query(page).get("query"), "gender_preserved": query(page).get("gender")})
                    context.close()
                return {"cases": records}

            qa.run("NAV-03", "Jeans facet, sidebar radio and chip agree; clearing it keeps typed query", jeans_results_and_clear)

            def nojs_anchor_contract() -> dict[str, Any]:
                context = qa.context(1440, 1000, javascript=False)
                page = qa.page(context)
                qa.goto(page, "/search?query=blue&gender=women&maxPrice=150&page=2&lang=lt")
                link = exact_link(page.locator(".category-nav"), "Džinsai")
                href = link.get_attribute("href")
                assert href and "category=jeans" in href and "query=blue" in href and "page=" not in href
                link.click()
                current = query(page)
                assert current.get("category") == ["jeans"] and current.get("query") == ["blue"]
                assert current.get("gender") == ["women"] and current.get("maxPrice") == ["150"] and current.get("lang") == ["lt"]
                context.close()
                return {"href": href, "params": current}

            qa.run("NAV-04", "server-rendered Jeans anchor works without JavaScript and preserves GET state", nojs_anchor_contract)

            def controls_survive_category() -> dict[str, Any]:
                context = qa.context(2560, 1440)
                page = qa.page(context)
                qa.goto(page, "/search?category=jeans&query=blue&lang=lt")
                choose_picker(page, "density", "5")
                page.wait_for_function("() => document.querySelector('.catalog-layout')?.dataset.density === '5'")
                choose_picker(page, "sort", "price-high")
                page.wait_for_function("() => new URL(location.href).searchParams.get('sort') === 'price-high'")
                current = query(page)
                assert current.get("category") == ["jeans"] and current.get("query") == ["blue"]
                page.wait_for_function("() => document.querySelector('details.density-view')?.dataset.value === '5'")
                assert page.locator("details.density-view").get_attribute("data-value") == "5"
                screenshot = qa.screenshot(page, "jeans-lt-2560-density5-price-high")
                overflow = no_overflow(page)
                context.close()
                return {"params": current, "density": 5, "overflow": overflow, "screenshot": screenshot}

            qa.run("NAV-05", "density and sort continue working with a real Jeans facet", controls_survive_category)

        report = qa.report(args.mode)
        browser.close()
        print(f"REPORT {report}")
        return 1 if any(item["status"] == "FAIL" for item in qa.results) or qa.browser_errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
