"""Production-browser regression and visual evidence for the approved Weft hybrid.

Run against a freshly built local production server. The runner never mocks the
catalog or ranking and keeps all generated evidence in a private OMX directory.
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

from playwright.sync_api import Browser, BrowserContext, Locator, Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ARTIFACTS = ROOT / ".omx" / "artifacts" / "frontend" / "selected-hybrid-qa"
AXE_PATH = ROOT / "node_modules" / "axe-core" / "axe.min.js"
REFERENCES = {
    "catalog-en-4-desktop": ROOT / ".omx" / "artifacts" / "frontend" / "visual-selected-03" / "catalog-en-4-compact-desktop.png",
}
VIEWPORTS = (
    (320, 844, "/?lang=lt"),
    (360, 844, "/search?query=black&store=demo-store-01,demo-store-02&maxPrice=150&lang=lt"),
    (390, 844, "/search?query=black&lang=en"),
    (430, 900, "/out/MOCK-001?lang=lt"),
    (768, 1000, "/search?lang=en"),
    (1280, 900, "/search?query=black&lang=en"),
    (1440, 1000, "/?lang=en"),
    (1920, 1080, "/search?query=black&lang=lt"),
)


def query(page: Page) -> dict[str, list[str]]:
    return parse_qs(urlparse(page.url).query)


def focused(locator: Locator) -> bool:
    return bool(locator.evaluate("element => element === document.activeElement"))


def choose_picker(page: Page, kind: str, value: str) -> None:
    control = page.locator("details.option-picker.density-view" if kind == "density" else ".sort-form details.option-picker")
    control.locator(":scope > summary").click()
    control.locator(f'.picker-options button[data-value="{value}"]').click()


def open_radio_group(scope: Locator, name: str) -> Locator:
    radio = scope.locator(f'input[type="radio"][name="{name}"]').first
    group = radio.locator("xpath=ancestor::details[contains(@class,'filter-group')]")
    if group.get_attribute("open") is None:
        group.locator(":scope > summary").click()
    return group


class HybridQA:
    def __init__(self, browser: Browser, base_url: str, artifacts: Path) -> None:
        self.browser = browser
        self.base_url = base_url.rstrip("/")
        self.artifacts = artifacts
        self.screenshots = artifacts / "screenshots"
        self.screenshots.mkdir(parents=True, exist_ok=True)
        self.results: list[dict[str, Any]] = []
        self.axe: list[dict[str, Any]] = []
        self.comparisons: list[dict[str, Any]] = []
        self.current_page: Page | None = None
        self.current_details: dict[str, Any] = {}

    def context(
        self,
        width: int = 1440,
        height: int = 1000,
        *,
        javascript: bool = True,
        color_scheme: str = "light",
        blocked_storage: bool = False,
    ) -> BrowserContext:
        context = self.browser.new_context(
            viewport={"width": width, "height": height},
            java_script_enabled=javascript,
            color_scheme=color_scheme,
        )
        if blocked_storage:
            context.add_init_script(
                "Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });"
            )
        return context

    def page(self, context: BrowserContext) -> Page:
        page = context.new_page()
        page.set_default_timeout(10_000)
        errors = self.current_details.setdefault("browser_errors", [])
        page.on("pageerror", lambda error: errors.append(f"pageerror: {error}"))
        page.on("console", lambda message: errors.append(f"console: {message.text}") if message.type == "error" else None)
        self.current_page = page
        return page

    def goto(self, page: Page, path: str, status: int = 200, *, visual_ready: bool = True) -> None:
        response = page.goto(f"{self.base_url}{path}", wait_until="domcontentloaded")
        if response is None or response.status != status:
            actual = None if response is None else response.status
            raise AssertionError(f"{path} returned {actual}; expected {status}")
        page.locator("main").wait_for(state="visible")
        if visual_ready:
            page.wait_for_function(
                "() => [...document.images].every(img => img.complete) && document.fonts.status === 'loaded'"
            )
            page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")

    def run(self, test_id: str, name: str, severity: str, function: Callable[[], None]) -> None:
        started = time.perf_counter()
        self.current_page = None
        self.current_details = {}
        status, message, failure_shot = "PASS", "", None
        try:
            function()
            errors = self.current_details.get("browser_errors", [])
            if errors:
                raise AssertionError(f"browser page errors: {errors}")
        except Exception as error:
            status = "FAIL"
            message = f"{type(error).__name__}: {error}"
            self.current_details["traceback"] = traceback.format_exc(limit=6)
            if self.current_page and not self.current_page.is_closed():
                try:
                    failure_shot = self.screenshot(self.current_page, f"FAIL-{test_id.lower()}")
                except Exception as shot_error:
                    self.current_details["screenshot_error"] = str(shot_error)
        self.results.append({
            "id": test_id,
            "name": name,
            "severity": severity,
            "status": status,
            "message": message,
            "duration_ms": round((time.perf_counter() - started) * 1000),
            "screenshot": failure_shot,
            "details": self.current_details,
        })
        print(f"{status:4} {test_id} {name}{': ' + message if message else ''}", flush=True)

    def screenshot(self, page: Page, name: str, *, full_page: bool = False) -> str:
        path = self.screenshots / f"{name}.png"
        page.evaluate("scrollTo(0, 0)")
        page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
        page.screenshot(path=str(path), full_page=full_page, animations="disabled")
        return str(path.relative_to(ROOT)).replace("\\", "/")

    def detail(self, **values: Any) -> None:
        self.current_details.update(values)

    @staticmethod
    def box(locator: Locator) -> dict[str, float]:
        value = locator.bounding_box()
        if not value:
            raise AssertionError(f"no bounding box for {locator}")
        return {key: round(float(number), 2) for key, number in value.items()}

    @staticmethod
    def column_count(page: Page) -> int:
        value = page.locator(".product-grid").evaluate(
            "element => getComputedStyle(element).gridTemplateColumns"
        )
        return len(re.findall(r"(?:^| )\d+(?:\.\d+)?px", value))

    @staticmethod
    def card_widths(page: Page) -> list[float]:
        return page.locator(".product-tile").evaluate_all(
            "nodes => nodes.slice(0, 8).map(node => Math.round(node.getBoundingClientRect().width * 100) / 100)"
        )

    @staticmethod
    def assert_no_overflow(page: Page) -> dict[str, Any]:
        evidence = page.evaluate(
            """() => {
              const root = document.documentElement;
              const offenders = [...document.body.querySelectorAll('*')].map(element => {
                const style = getComputedStyle(element), rect = element.getBoundingClientRect();
                return {tag: element.tagName, cls: String(element.className || '').slice(0, 90), left: rect.left, right: rect.right,
                  shown: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1};
              }).filter(item => item.shown && (item.left < -2 || item.right > innerWidth + 2)).slice(0, 10);
              return {clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, innerWidth, offenders};
            }"""
        )
        if evidence["scrollWidth"] > evidence["clientWidth"] + 1:
            raise AssertionError(f"horizontal overflow: {evidence}")
        return evidence

    def visual_comparison(self, key: str, actual_relative: str, geometry: dict[str, Any]) -> None:
        actual = ROOT / actual_relative
        reference = REFERENCES[key]
        record: dict[str, Any] = {
            "surface": key,
            "reference": str(reference.relative_to(ROOT)).replace("\\", "/"),
            "actual": actual_relative,
            "geometry": geometry,
            "pixel_diff": None,
            "interpretation": "Pixel difference is secondary evidence only; real catalog content and runtime ordering were not altered to imitate the static reference.",
        }
        if not reference.exists():
            record["pixel_diff"] = {"status": "not-run", "reason": "reference image missing"}
        else:
            try:
                from PIL import Image, ImageChops, ImageStat

                with Image.open(reference).convert("RGB") as ref, Image.open(actual).convert("RGB") as got:
                    if ref.size != got.size:
                        record["pixel_diff"] = {"status": "not-comparable", "reference_size": ref.size, "actual_size": got.size}
                    else:
                        diff = ImageChops.difference(ref, got)
                        stat = ImageStat.Stat(diff)
                        mae = sum(stat.mean) / (3 * 255)
                        changed = sum(1 for pixel in diff.getdata() if pixel != (0, 0, 0)) / (ref.width * ref.height)
                        # Region statistics locate differences without editing
                        # either screenshot or pretending content is identical.
                        regions = {"header": (0, 0, ref.width, 85), "campaign": (0, 85, ref.width, 805)} if key.startswith("home") else {
                            "search_and_navigation": (0, 0, ref.width, 180),
                            "sidebar": (0, 180, 216, ref.height),
                            "toolbar": (216, 180, ref.width, 238),
                            "actual_product_content": (216, 238, ref.width, ref.height),
                        }
                        hotspots = [{"region": name, "bounds": list(bounds),
                            "normalized_mean_absolute_error": round(sum(ImageStat.Stat(diff.crop(bounds)).mean) / (3 * 255), 6)}
                            for name, bounds in regions.items()]
                        record["pixel_diff"] = {
                            "status": "measured",
                            "normalized_mean_absolute_error": round(mae, 6),
                            "changed_pixel_ratio": round(changed, 6),
                            "reference_size": list(ref.size),
                            "actual_size": list(got.size),
                            "hotspots": sorted(hotspots, key=lambda item: item["normalized_mean_absolute_error"], reverse=True),
                        }
            except Exception as error:
                record["pixel_diff"] = {"status": "not-run", "reason": f"{type(error).__name__}: {error}"}
        self.comparisons.append(record)

    def report(self) -> Path:
        summary = {state: sum(result["status"] == state for result in self.results) for state in ("PASS", "FAIL", "NOT RUN")}
        payload = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "base_url": self.base_url,
            "source": "real local production server; actual catalog order/ranking; no external credentials or test-only application switches",
            "summary": summary,
            "results": self.results,
            "visual_comparisons": self.comparisons,
            "axe": self.axe,
            "limits": [
                "Pixel difference is recorded as secondary evidence, not an automatic fidelity verdict.",
                "No physical device, screen reader, Windows High Contrast, live external service, or production deployment was exercised.",
                "Static reference product order is intentionally not forced onto runtime search results.",
            ],
        }
        path = self.artifacts / "report.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3100")
    parser.add_argument("--artifacts", type=Path, default=DEFAULT_ARTIFACTS)
    parser.add_argument("--skip-axe", action="store_true")
    args = parser.parse_args()
    artifacts = args.artifacts.resolve()
    artifacts.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        qa = HybridQA(browser, args.base_url, artifacts)

        def desktop_catalog_contract() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?lang=en")
            layout = page.locator(".catalog-layout")
            aside = layout.locator("aside.filter-panel")
            toolbar = page.locator(".catalog-toolbar")
            density = toolbar.locator("details.density-view")
            search = page.locator(".catalog-form")
            assert layout.count() == aside.count() == toolbar.count() == density.count() == 1
            assert density.get_attribute("data-value") == "4"
            assert qa.column_count(page) == 4
            search_box = qa.box(search)
            assert abs(search_box["x"] - 25) <= 2, search_box
            assert abs(search_box["width"] - 770) <= 4, search_box
            style = density.locator(":scope > summary").evaluate("el => { const s=getComputedStyle(el); return {border:s.border, background:s.backgroundColor, height:el.getBoundingClientRect().height}; }")
            grid_style = page.locator(".product-grid").evaluate("el => { const s=getComputedStyle(el); return {columnGap:s.columnGap,rowGap:s.rowGap}; }")
            tile_style = page.locator(".product-tile").first.evaluate("el => { const s=getComputedStyle(el); return {border:s.border,borderRadius:s.borderRadius,boxShadow:s.boxShadow}; }")
            media_box = qa.box(page.locator(".product-media").first)
            card_widths = qa.card_widths(page)
            assert style["height"] >= 40
            assert style["background"] in ("rgba(0, 0, 0, 0)", "transparent")
            assert "0px" in style["border"] or "none" in style["border"]
            assert float(grid_style["columnGap"].removesuffix("px")) <= 3
            assert abs(float(grid_style["rowGap"].removesuffix("px")) - 12) <= 2
            assert abs(card_widths[0] - 304.5) <= 2, card_widths
            assert abs(media_box["height"] / media_box["width"] - 1.25) <= 0.02, media_box
            assert ("0px" in tile_style["border"] or "none" in tile_style["border"]) and tile_style["boxShadow"] == "none"
            qa.detail(search=search_box, aside=qa.box(aside), toolbar=qa.box(toolbar), density_style=style,
                      grid_style=grid_style, tile_style=tile_style, media=media_box, card_widths=card_widths)
            actual = qa.screenshot(page, "catalog-en-4-desktop")
            qa.visual_comparison("catalog-en-4-desktop", actual, qa.current_details.copy())
            context.close()

        qa.run("CAT-01", "desktop catalog has bounded A search, left filters, quiet View picker and four-column B grid", "P0", desktop_catalog_contract)

        def density_state_contract() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?sort=price-low&page=2&maxPrice=150&lang=en")
            density = page.locator("details.density-view")
            baseline = query(page).copy()
            for desired in ("3", "5", "4"):
                choose_picker(page, "density", desired)
                page.wait_for_function("value => document.querySelector('.catalog-layout')?.dataset.density === value", arg=desired)
                assert qa.column_count(page) == int(desired)
                assert query(page) == baseline
                if desired == "3":
                    qa.screenshot(page, "catalog-en-3-desktop")
            density.locator(":scope > summary").focus()
            page.keyboard.press("ArrowDown")
            page.keyboard.press("Home")
            page.keyboard.press("Enter")
            page.wait_for_function("() => document.querySelector('.catalog-layout')?.dataset.density === '3'")
            density.locator(":scope > summary").focus()
            page.keyboard.press("ArrowDown")
            page.keyboard.press("End")
            page.keyboard.press("Enter")
            page.wait_for_function("() => document.querySelector('.catalog-layout')?.dataset.density === '5'")
            page.reload(wait_until="domcontentloaded")
            page.locator("details.density-view").wait_for(state="visible")
            page.wait_for_function("() => document.querySelector('details.density-view')?.dataset.value === '5'")
            assert page.locator("details.density-view").get_attribute("data-value") == "5"
            assert qa.column_count(page) == 5
            page.locator(".brand").click()
            page.wait_for_url(re.compile(r"/$|/\?"))
            page.goto(f"{qa.base_url}/search?lang=en", wait_until="domcontentloaded")
            page.wait_for_function("() => document.querySelector('details.density-view')?.dataset.value === '5'")
            assert page.locator("details.density-view").get_attribute("data-value") == "5"
            page.set_viewport_size({"width": 390, "height": 844})
            page.wait_for_timeout(100)
            assert qa.column_count(page) == 2
            page.set_viewport_size({"width": 960, "height": 900})
            page.wait_for_timeout(100)
            constrained = qa.column_count(page)
            widths = qa.card_widths(page)
            assert constrained <= 4 and min(widths) >= 198, (constrained, widths)
            page.set_viewport_size({"width": 1440, "height": 1000})
            page.wait_for_timeout(100)
            assert page.locator("details.density-view").get_attribute("data-value") == "5"
            assert qa.column_count(page) == 5
            qa.detail(query_preserved=baseline, constrained_columns=constrained, constrained_widths=widths)
            qa.screenshot(page, "catalog-en-5-desktop")
            context.close()

        qa.run("CAT-02", "3/4/5 density is immediate, persistent, URL-neutral and responsive without undersized cards", "P0", density_state_contract)

        def sidebar_toggle() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?lang=en")
            toggle = page.locator(".catalog-toolbar .filter-toggle")
            aside = page.locator("aside.filter-panel")
            before = qa.box(page.locator(".product-tile").first)["width"]
            toggle.click()
            page.wait_for_function("() => !document.querySelector('aside.filter-panel')?.checkVisibility()")
            after = qa.box(page.locator(".product-tile").first)["width"]
            assert after > before
            assert page.locator("details.density-view").is_visible()
            qa.screenshot(page, "catalog-en-sidebar-hidden-desktop")
            toggle.click()
            aside.wait_for(state="visible")
            assert qa.box(page.locator(".product-tile").first)["width"] < after
            qa.detail(card_before=before, card_hidden=after)
            context.close()

        qa.run("CAT-03", "desktop sidebar collapses and re-expands while density remains available", "P1", sidebar_toggle)

        def desktop_filter_drafts() -> None:
            context = qa.context()
            page = qa.page(context)
            qa.goto(page, "/search?query=shirt&sort=price-low&lang=en")
            original = page.url
            panel = page.locator("aside.filter-panel")
            minimum = panel.locator('input[name="minPrice"]')
            maximum = panel.locator('input[name="maxPrice"]')
            minimum.fill("0")
            maximum.fill("80,50")
            panel.locator(".filter-group").nth(2).locator("summary").click()
            stores = panel.locator('.store-options input[type="checkbox"]')
            store_ids = [stores.nth(i).get_attribute("value") for i in (0, 1)]
            stores.nth(0).check()
            stores.nth(1).check()
            assert page.url == original
            panel.get_by_role("button", name=re.compile("Apply|Taikyti", re.I)).click()
            page.wait_for_url(re.compile(r"maxPrice=80(?:\.5|%2C50)"))
            parsed = query(page)
            assert parsed.get("query") == ["shirt"] and parsed.get("sort") == ["price-low"]
            assert set(parsed["store"][0].split(",")) == set(store_ids)
            qa.goto(page, "/search?query=shirt&lang=en")
            panel = page.locator("aside.filter-panel")
            open_radio_group(panel, "category")
            category = panel.locator('input[type="radio"][name="category"][value="outerwear"]')
            category.locator("xpath=ancestor::label").click()
            assert category.is_checked()
            panel.get_by_role("button", name=re.compile("Reset|Clear draft|Clear selections", re.I)).click()
            assert not category.is_checked() and panel.locator('input[name="category"][value=""]').is_checked() and "category" not in query(page)
            category.locator("xpath=ancestor::label").click()
            assert category.is_checked()
            panel.get_by_role("button", name=re.compile("Cancel", re.I)).click()
            assert "category" not in query(page) and not category.is_checked()
            context.close()

        qa.run("FILTER-01", "desktop filter drafts do not commit early; Apply supports budget/multi-store; reset and Cancel discard", "P0", desktop_filter_drafts)

        def mobile_filter_dialog() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/search?query=black&lang=en")
            page.evaluate("scrollTo(0, 260)")
            trigger = page.locator(".catalog-toolbar .filter-toggle")
            trigger.scroll_into_view_if_needed()
            scroll_before = page.evaluate("scrollY")
            trigger.click()
            dialog = page.locator(".filter-dialog[open]")
            dialog.wait_for(state="visible")
            assert dialog.evaluate("element => element.contains(document.activeElement)")
            assert page.evaluate("getComputedStyle(document.body).overflow") == "hidden"
            for _ in range(18):
                page.keyboard.press("Tab")
                assert dialog.evaluate("element => element.contains(document.activeElement)")
            page.keyboard.press("Escape")
            page.wait_for_function("() => !document.querySelector('.filter-dialog')?.open && document.body.style.overflow !== 'hidden'")
            assert focused(trigger)
            assert page.evaluate("getComputedStyle(document.body).overflow") != "hidden"
            assert abs(page.evaluate("scrollY") - scroll_before) <= 2
            trigger.click()
            dialog.wait_for(state="visible")
            original = page.url
            open_radio_group(dialog, "category")
            category = dialog.locator('input[type="radio"][name="category"][value="outerwear"]')
            category.locator("xpath=ancestor::label").click()
            assert category.is_checked()
            dialog.get_by_role("button", name=re.compile("Cancel", re.I)).click()
            assert page.url == original and focused(trigger)
            qa.screenshot(page, "catalog-en-mobile-390")
            context.close()

        qa.run("FILTER-02", "mobile filter sheet traps/restores focus, closes on Escape, preserves scroll and discards Cancel draft", "P0", mobile_filter_dialog)

        def nojs_forms() -> None:
            context = qa.context(390, 844, javascript=False)
            page = qa.page(context)
            qa.goto(page, "/search?lang=lt", visual_ready=False)
            search = page.locator('form.catalog-form input[name="query"]')
            assert search.is_visible()
            search.fill("juodas paltas")
            search.press("Enter")
            page.wait_for_url(re.compile(r"query=juodas(?:\+|%20)paltas"))
            fallback = page.locator(".filter-fallback")
            if not fallback.is_visible():
                page.locator(".filter-disclosure > summary").click()
            fallback.locator('input[name="maxPrice"]').fill("150")
            fallback.locator(".filter-group").nth(2).locator("summary").click()
            fallback.locator('.store-options input[type="checkbox"]').first.check()
            fallback.locator('button[type="submit"]').click()
            page.wait_for_url(re.compile(r"maxPrice=150"))
            assert query(page).get("query") == ["juodas paltas"]
            assert query(page).get("maxPrice") == ["150"]
            context.close()

        qa.run("FILTER-03", "server-rendered native GET search and filters work without JavaScript", "P1", nojs_forms)

        def blocked_storage() -> None:
            context = qa.context(blocked_storage=True)
            page = qa.page(context)
            qa.goto(page, "/search?query=black&lang=en")
            density = page.locator("details.density-view")
            saved_before = page.locator(".wishlist-button").first.get_attribute("aria-pressed")
            choose_picker(page, "density", "3")
            page.wait_for_function("() => document.querySelector('.catalog-layout')?.dataset.density === '3'")
            assert qa.column_count(page) == 3
            page.locator(".wishlist-button").first.click()
            assert page.locator(".wishlist-button").first.get_attribute("aria-pressed") != saved_before
            assert not qa.current_details["browser_errors"]
            context.close()

        qa.run("RESIL-01", "blocked localStorage leaves density and saved controls interactive without page errors", "P1", blocked_storage)

        def homepage_campaign() -> None:
            for locale, width, height in (("en", 1440, 900), ("lt", 390, 844)):
                context = qa.context(width, height)
                page = qa.page(context)
                qa.goto(page, f"/?lang={locale}")
                campaign = page.locator("main .campaign")
                picture = campaign.locator(".campaign-image picture")
                hero_image = picture.locator("img")
                assert picture.count() == 1 and hero_image.count() == 1 and hero_image.is_visible()
                assert hero_image.evaluate("image => image.complete && image.naturalWidth > 0")
                header = page.locator(".site-header.is-home")
                search = header.locator('form[role="search"] input[name="query"]')
                assert search.is_visible()
                hero_box = qa.box(campaign)
                header_box = qa.box(header)
                image_box = qa.box(campaign.locator(".campaign-image"))
                copy_box = qa.box(campaign.locator(".campaign-copy"))
                assert hero_box["x"] <= 1 and hero_box["width"] >= width - 2
                assert header_box["y"] + header_box["height"] <= image_box["y"] + 1, (header_box, image_box)
                assert page.locator(".campaign-piece").count() == 0
                current_source = hero_image.evaluate("image => new URL(image.currentSrc).pathname")
                if width <= 700:
                    assert "weft-street-mobile-" in current_source, current_source
                    assert abs(image_box["height"] / image_box["width"] - 1.25) <= 0.03, image_box
                    assert copy_box["y"] >= image_box["y"] + image_box["height"] - 1, (copy_box, image_box)
                else:
                    assert "weft-street-desktop-" in current_source, current_source
                    assert abs(image_box["height"] / image_box["width"] - 1412 / 2508) <= 0.03, image_box
                    assert copy_box["x"] + copy_box["width"] <= image_box["x"] + image_box["width"] * 0.39 + 2
                assert page.locator("main h1").inner_text().strip()
                qa.assert_no_overflow(page)
                qa.screenshot(page, f"home-{locale}-{'desktop' if width > 700 else 'mobile'}")
                context.close()

        qa.run("HOME-01", "homepage uses responsive street campaign art with a normal-flow header and mobile copy below the photo", "P0", homepage_campaign)

        def responsive_matrix() -> None:
            evidence = []
            for width, height, path in VIEWPORTS:
                context = qa.context(width, height)
                page = qa.page(context)
                qa.goto(page, path)
                overflow = qa.assert_no_overflow(page)
                if page.locator(".product-grid").count():
                    columns = qa.column_count(page)
                    if width <= 700:
                        assert columns == 2
                    elif width < 900:
                        assert columns == 3
                else:
                    columns = None
                evidence.append({"viewport": [width, height], "route": path, "columns": columns, "overflow": overflow})
                context.close()
            qa.detail(matrix=evidence)

        qa.run("RESP-01", "approved surfaces have no horizontal overflow from 320 through 1920 pixels", "P0", responsive_matrix)

        def capture_matrix() -> None:
            cases = (
                ("home", "/", 1440, 900),
                ("browse", "/search", 1440, 1000),
                ("results-black", "/search?query=black", 1440, 1000),
                ("detail", "/out/MOCK-001", 1440, 1000),
                ("saved", "/account", 1440, 1000),
                ("home", "/", 390, 844),
                ("browse", "/search", 390, 844),
                ("results-black", "/search?query=black", 390, 844),
                ("detail", "/out/MOCK-001", 390, 844),
                ("saved", "/account", 390, 844),
            )
            captures = []
            for locale in ("en", "lt"):
                for name, route, width, height in cases:
                    context = qa.context(width, height)
                    if name == "saved":
                        context.add_init_script("localStorage.setItem('weft-wishlist', JSON.stringify(['MOCK-003','MOCK-011']))")
                    page = qa.page(context)
                    joiner = "&" if "?" in route else "?"
                    qa.goto(page, f"{route}{joiner}lang={locale}")
                    shot = qa.screenshot(page, f"{name}-{locale}-{width}")
                    captures.append({"locale": locale, "surface": name, "viewport": [width, height], "screenshot": shot})
                    context.close()
            qa.detail(captures=captures)

        qa.run("CAPTURE-01", "EN/LT desktop and mobile evidence covers home, browse, query, detail and saved surfaces", "P1", capture_matrix)

        if args.skip_axe:
            qa.results.append({"id": "A11Y-01", "name": "axe EN/LT light/dark matrix", "severity": "P1", "status": "NOT RUN", "message": "--skip-axe requested", "duration_ms": 0, "screenshot": None, "details": {}})
        else:
            def axe_matrix() -> None:
                if not AXE_PATH.exists():
                    raise AssertionError(f"axe bundle missing at {AXE_PATH}")
                serious = []
                routes = ("/", "/search?query=black", "/out/MOCK-001", "/account", "/stores")
                for locale in ("en", "lt"):
                    for theme in ("light", "dark"):
                        context = qa.context(390, 844, color_scheme=theme)
                        if theme == "dark":
                            context.add_init_script("try { localStorage.setItem('weft-theme', 'dark') } catch {}")
                        for route in routes:
                            page = qa.page(context)
                            joiner = "&" if "?" in route else "?"
                            qa.goto(page, f"{route}{joiner}lang={locale}")
                            page.add_script_tag(path=str(AXE_PATH))
                            result = page.evaluate("async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
                            violations = [{"id": item["id"], "impact": item["impact"], "nodes": len(item["nodes"]),
                                           "targets": [node["target"] for node in item["nodes"]]} for item in result["violations"]]
                            entry = {"locale": locale, "theme": theme, "route": route, "violations": violations}
                            qa.axe.append(entry)
                            serious.extend({**item, "locale": locale, "theme": theme, "route": route} for item in violations if item["impact"] in ("serious", "critical"))
                            page.close()
                        page = qa.page(context)
                        qa.goto(page, f"/search?query=black&lang={locale}")
                        page.locator(".catalog-toolbar .filter-toggle").click()
                        dialog = page.locator(".filter-dialog[open]")
                        dialog.wait_for(state="visible")
                        page.add_script_tag(path=str(AXE_PATH))
                        result = page.evaluate("async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
                        violations = [{"id": item["id"], "impact": item["impact"], "nodes": len(item["nodes"]),
                                       "targets": [node["target"] for node in item["nodes"]]} for item in result["violations"]]
                        entry = {"locale": locale, "theme": theme, "route": "/search#filter-dialog", "violations": violations}
                        qa.axe.append(entry)
                        serious.extend({**item, "locale": locale, "theme": theme, "route": entry["route"]} for item in violations if item["impact"] in ("serious", "critical"))
                        context.close()
                qa.detail(runs=len(qa.axe), serious=serious)
                if serious:
                    raise AssertionError(f"{len(serious)} serious/critical axe findings: {serious[:8]}")

            qa.run("A11Y-01", "axe scans five routes plus mobile filter dialog in EN/LT and light/dark", "P1", axe_matrix)

        report = qa.report()
        browser.close()
        print(f"REPORT {report}", flush=True)
        return 1 if any(item["status"] == "FAIL" and item["severity"] in ("P0", "P1") for item in qa.results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
