"""Responsive-scale regression for the selected Weft storefront.

The baseline mode records the current production UI without enforcing the new
large-monitor contract. Final mode validates continuous desktop scaling, the
existing phone/tablet column rules, density persistence, and no-JS fallbacks.
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

from playwright.sync_api import Browser, BrowserContext, Locator, Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASELINE_ARTIFACTS = ROOT / ".omx" / "artifacts" / "frontend" / "responsive-display-baseline"
FINAL_ARTIFACTS = ROOT / ".omx" / "artifacts" / "frontend" / "responsive-display-final"
MATRIX = (
    (320, 844),
    (390, 844),
    (430, 900),
    (768, 1000),
    (1024, 900),
    (1280, 900),
    (1440, 1000),
    (1920, 1080),
    (2048, 1152),
    (2560, 1440),
    (3440, 1440),
    (3840, 1600),
)


def box(locator: Locator) -> dict[str, float]:
    value = locator.bounding_box()
    if value is None:
        raise AssertionError(f"no bounding box for {locator}")
    return {key: round(float(number), 2) for key, number in value.items()}


def px(locator: Locator, property_name: str) -> float:
    value = locator.evaluate(
        "(element, propertyName) => getComputedStyle(element).getPropertyValue(propertyName)",
        property_name,
    )
    match = re.search(r"-?\d+(?:\.\d+)?", value)
    if not match:
        raise AssertionError(f"{property_name} was not a pixel value: {value!r}")
    return round(float(match.group()), 3)


def columns(page: Page) -> int:
    tracks = page.locator(".product-grid").evaluate(
        "element => getComputedStyle(element).gridTemplateColumns"
    )
    return len(re.findall(r"(?:^| )\d+(?:\.\d+)?px", tracks))


def no_horizontal_overflow(page: Page) -> dict[str, Any]:
    result = page.evaluate(
        """() => {
          const root = document.documentElement;
          const offenders = [...document.body.querySelectorAll('*')].map(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {tag: element.tagName, cls: String(element.className || '').slice(0, 100),
              left: rect.left, right: rect.right, width: rect.width,
              shown: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1};
          }).filter(item => item.shown && (item.left < -2 || item.right > innerWidth + 2)).slice(0, 12);
          return {innerWidth, clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, offenders};
        }"""
    )
    if result["scrollWidth"] > result["clientWidth"] + 1:
        raise AssertionError(f"horizontal overflow: {result}")
    return result


def assert_no_pairwise_overlap(page: Page, selectors: tuple[str, ...], label: str) -> list[dict[str, Any]]:
    """Assert visible peer regions do not occupy the same rendered area."""
    regions: list[dict[str, Any]] = []
    for selector in selectors:
        values = page.locator(selector).evaluate_all(
            """(elements, selector) => elements.filter(element => element.checkVisibility()).map((element, index) => {
              const rect = element.getBoundingClientRect();
              return {name: `${selector}#${index}`, x: rect.x, y: rect.y, width: rect.width, height: rect.height,
                right: rect.right, bottom: rect.bottom};
            })""",
            selector,
        )
        regions.extend(values)
    collisions = []
    for index, first in enumerate(regions):
        for second in regions[index + 1 :]:
            overlap_x = min(first["right"], second["right"]) - max(first["x"], second["x"])
            overlap_y = min(first["bottom"], second["bottom"]) - max(first["y"], second["y"])
            if overlap_x > 1 and overlap_y > 1:
                collisions.append(
                    {"first": first["name"], "second": second["name"], "overlap": [round(overlap_x, 2), round(overlap_y, 2)]}
                )
    if collisions:
        raise AssertionError(f"{label} overlap: {collisions}; regions={regions}")
    return regions


class ResponsiveQA:
    def __init__(self, browser: Browser, base_url: str, artifacts: Path, mode: str) -> None:
        self.browser = browser
        self.base_url = base_url.rstrip("/")
        self.artifacts = artifacts
        self.screenshots = artifacts / "screenshots"
        self.screenshots.mkdir(parents=True, exist_ok=True)
        self.mode = mode
        self.results: list[dict[str, Any]] = []
        self.current_page: Page | None = None
        self.current_details: dict[str, Any] = {}

    def context(
        self,
        width: int,
        height: int,
        *,
        dpr: float = 1,
        javascript: bool = True,
    ) -> BrowserContext:
        return self.browser.new_context(
            viewport={"width": width, "height": height},
            device_scale_factor=dpr,
            java_script_enabled=javascript,
        )

    def page(self, context: BrowserContext) -> Page:
        page = context.new_page()
        page.set_default_timeout(12_000)
        errors = self.current_details.setdefault("browser_errors", [])
        page.on("pageerror", lambda error: errors.append(f"pageerror: {error}"))
        page.on(
            "console",
            lambda message: errors.append(f"console: {message.text}")
            if message.type == "error"
            else None,
        )
        self.current_page = page
        return page

    def goto(self, page: Page, path: str, *, wait_images: bool = True) -> None:
        response = page.goto(f"{self.base_url}{path}", wait_until="domcontentloaded")
        if response is None or response.status != 200:
            raise AssertionError(f"{path} returned {None if response is None else response.status}")
        page.locator("main").wait_for(state="visible")
        if wait_images:
            page.wait_for_function(
                """() => [...document.images].every(image => {
                  const rect = image.getBoundingClientRect();
                  return rect.top > innerHeight * 2 || rect.bottom < -innerHeight || image.complete;
                }) && document.fonts.status === 'loaded'"""
            )
            page.evaluate(
                "() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
            )

    def screenshot(self, page: Page, name: str, *, full_page: bool = False) -> str:
        path = self.screenshots / f"{name}.png"
        page.evaluate("scrollTo(0, 0)")
        page.screenshot(path=str(path), full_page=full_page, animations="disabled")
        return str(path.relative_to(ROOT)).replace("\\", "/")

    def run(self, test_id: str, name: str, function: Callable[[], None]) -> None:
        started = time.perf_counter()
        self.current_page = None
        self.current_details = {}
        status, message, failure_shot = "PASS", "", None
        try:
            function()
            if self.current_details.get("browser_errors"):
                raise AssertionError(self.current_details["browser_errors"])
        except Exception as error:
            status = "FAIL"
            message = f"{type(error).__name__}: {error}"
            self.current_details["traceback"] = traceback.format_exc(limit=8)
            if self.current_page and not self.current_page.is_closed():
                try:
                    failure_shot = self.screenshot(self.current_page, f"FAIL-{test_id.lower()}")
                except Exception as screenshot_error:
                    self.current_details["screenshot_error"] = str(screenshot_error)
        self.results.append(
            {
                "id": test_id,
                "name": name,
                "status": status,
                "message": message,
                "duration_ms": round((time.perf_counter() - started) * 1000),
                "screenshot": failure_shot,
                "details": self.current_details,
            }
        )
        print(f"{status:4} {test_id} {name}{': ' + message if message else ''}", flush=True)

    def report(self) -> Path:
        payload = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "mode": self.mode,
            "base_url": self.base_url,
            "source": "real local production server and real responsive CSS layout",
            "summary": {
                state: sum(result["status"] == state for result in self.results)
                for state in ("PASS", "FAIL")
            },
            "results": self.results,
            "limits": [
                "Playwright viewports validate CSS pixels; operating-system scaling is represented by narrower CSS viewports and a separate DPR capture.",
                "No physical monitor, browser zoom, screen reader, or production deployment was exercised.",
            ],
        }
        path = self.artifacts / "report.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return path


def catalog_metrics(page: Page) -> dict[str, Any]:
    first_tile = page.locator(".product-tile").first
    first_title = first_tile.locator(".product-title")
    first_price = first_tile.locator(".product-price-row")
    density = page.locator("details.density-view")
    sidebar = page.locator("aside.filter-panel")
    shell = page.locator(".shell")
    return {
        "root_font": px(page.locator("html"), "font-size"),
        "body_font": px(page.locator("body"), "font-size"),
        "nav_font": px(page.locator(".desktop-nav a").first, "font-size"),
        "search_font": px(page.locator(".catalog-form input[name='query']"), "font-size"),
        "title_font": px(first_title, "font-size"),
        "price_font": px(first_price, "font-size"),
        "sidebar": box(sidebar) if sidebar.is_visible() else None,
        "search": box(page.locator(".catalog-form")),
        "toolbar": box(page.locator(".catalog-toolbar")),
        "first_tile": box(first_tile),
        "first_media": box(first_tile.locator(".product-media")),
        "first_title": box(first_title),
        "first_price": box(first_price),
        "density": box(density) if density.is_visible() else None,
        "density_border": density.locator(":scope > summary").evaluate("element => getComputedStyle(element).border")
        if density.is_visible()
        else None,
        "columns": columns(page),
        "shell": box(shell),
        "overflow": no_horizontal_overflow(page),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3100")
    parser.add_argument("--mode", choices=("baseline", "final"), default="final")
    parser.add_argument("--artifacts", type=Path)
    args = parser.parse_args()
    artifacts = (args.artifacts or (BASELINE_ARTIFACTS if args.mode == "baseline" else FINAL_ARTIFACTS)).resolve()
    artifacts.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        qa = ResponsiveQA(browser, args.base_url, artifacts, args.mode)

        def baseline_capture() -> None:
            captures = []
            for width, height, dpr, name in (
                (1440, 1000, 1, "catalog-lt-women-1440"),
                (2048, 1152, 1.25, "catalog-lt-women-2048-dpr125"),
                (2560, 1440, 1, "catalog-lt-women-2560"),
                (390, 844, 1, "catalog-lt-women-390"),
            ):
                context = qa.context(width, height, dpr=dpr)
                page = qa.page(context)
                qa.goto(page, "/search?gender=women&lang=lt")
                metrics = catalog_metrics(page)
                screenshot = qa.screenshot(page, name)
                captures.append({"viewport": [width, height], "dpr": dpr, "metrics": metrics, "screenshot": screenshot})
                context.close()
            qa.current_details["captures"] = captures

        qa.run("BASE-01", "record 1440, 2K/DPR, 2560 and phone catalog baselines", baseline_capture)

        if args.mode == "final":
            def scale_contract() -> None:
                measurements: dict[int, dict[str, Any]] = {}
                for width, height in ((1440, 1000), (1920, 1080), (2048, 1152), (2560, 1440), (3440, 1440), (3840, 1600)):
                    context = qa.context(width, height)
                    page = qa.page(context)
                    qa.goto(page, "/search?gender=women&lang=lt")
                    measurements[width] = catalog_metrics(page)
                    if width in (2048, 2560, 3840):
                        measurements[width]["screenshot"] = qa.screenshot(page, f"catalog-lt-women-{width}")
                    context.close()

                base, wide, ultra = measurements[1440], measurements[2560], measurements[3840]
                assert 15.5 <= base["root_font"] <= 16.5, base
                assert wide["root_font"] >= 23.5, wide
                assert ultra["root_font"] <= 24.5, ultra
                for field in ("nav_font", "title_font", "price_font"):
                    ratio = wide[field] / base[field]
                    assert 1.42 <= ratio <= 1.58, (field, ratio, base[field], wide[field])
                assert wide["sidebar"]["width"] >= base["sidebar"]["width"] * 1.42
                assert wide["search"]["width"] >= base["search"]["width"] * 1.42
                assert wide["columns"] == 4
                assert wide["first_price"]["y"] + wide["first_price"]["height"] <= 1440
                assert "0px" in wide["density_border"] or "none" in wide["density_border"]
                for width in (3440, 3840):
                    shell = measurements[width]["shell"]
                    assert shell["width"] <= 2562, shell
                    assert abs(shell["x"] - (width - shell["width"]) / 2) <= 2, shell
                qa.current_details["measurements"] = measurements

            qa.run("SCALE-01", "desktop type, controls and sidebar scale continuously to 2560 then cap", scale_contract)

            def responsive_matrix() -> None:
                measurements = []
                for width, height in MATRIX:
                    context = qa.context(width, height)
                    page = qa.page(context)
                    qa.goto(page, "/search?gender=women&lang=lt")
                    count = columns(page)
                    if width <= 700:
                        assert count == 2, (width, "expected phone 2 columns", count)
                    elif width <= 1024:
                        assert count == 3, (width, "expected compact/tablet 3 columns", count)
                    elif width >= 1280:
                        assert count == 4, (width, "expected desktop default 4 columns", count)
                    overflow = no_horizontal_overflow(page)
                    header = box(page.locator(".site-header"))
                    toolbar = box(page.locator(".catalog-toolbar"))
                    header_regions = assert_no_pairwise_overlap(
                        page,
                        (".site-header > .brand", ".site-header > .desktop-nav", ".site-header > .header-search", ".site-header > .header-tools"),
                        f"header at {width}",
                    )
                    toolbar_regions = assert_no_pairwise_overlap(
                        page,
                        (".catalog-toolbar > .catalog-title", ".catalog-toolbar > .tool-actions"),
                        f"toolbar sections at {width}",
                    )
                    action_regions = assert_no_pairwise_overlap(
                        page,
                        (".catalog-toolbar > .tool-actions > *",),
                        f"toolbar actions at {width}",
                    )
                    assert header["y"] + header["height"] <= box(page.locator(".catalog-search-row"))["y"] + 1
                    if width <= 700:
                        search_input = page.locator(".catalog-form input[name='query']")
                        assert px(search_input, "font-size") >= 16
                        trigger = page.locator(".catalog-toolbar .filter-toggle")
                        assert box(trigger)["height"] >= 44
                        trigger.click()
                        dialog = page.locator(".filter-dialog[open]")
                        dialog.wait_for(state="visible")
                        assert box(dialog)["width"] <= width
                        page.keyboard.press("Escape")
                    measurements.append({"viewport": [width, height], "columns": count, "header": header, "toolbar": toolbar,
                        "header_regions": header_regions, "toolbar_regions": toolbar_regions, "action_regions": action_regions, "overflow": overflow})
                    qa.current_details["matrix"] = measurements
                    context.close()

            qa.run("RESP-01", "catalog remains usable without overlaps or overflow across 12 viewport widths", responsive_matrix)

            def density_persistence() -> None:
                context = qa.context(2560, 1440)
                page = qa.page(context)
                qa.goto(page, "/search?gender=women&lang=lt")
                density = page.locator("details.density-view")
                for desired in ("3", "4", "5"):
                    density.locator(":scope > summary").click()
                    density.locator(f'.picker-options button[data-value="{desired}"]').click()
                    page.wait_for_function("value => document.querySelector('.catalog-layout')?.dataset.density === value", arg=desired)
                    assert columns(page) == int(desired)
                density.locator(":scope > summary").click()
                density.locator('.picker-options button[data-value="5"]').click()
                page.set_viewport_size({"width": 390, "height": 844})
                page.wait_for_timeout(100)
                assert columns(page) == 2
                page.set_viewport_size({"width": 2560, "height": 1440})
                page.wait_for_timeout(100)
                assert density.get_attribute("data-value") == "5" and columns(page) == 5
                page.reload(wait_until="domcontentloaded")
                page.wait_for_function("() => document.querySelector('details.density-view')?.dataset.value === '5'")
                assert columns(page) == 5
                qa.current_details["final_columns"] = columns(page)
                context.close()

            qa.run("DENSITY-01", "3/4/5 works at 2560 and survives phone resize, return and reload", density_persistence)

            def home_contract() -> None:
                captures = []
                for width, height in ((320, 667), (390, 844), (430, 900), (700, 900), (701, 900), (768, 1000), (1280, 800), (1440, 650), (1440, 1000), (1920, 1080), (2560, 1440), (3840, 1600)):
                    context = qa.context(width, height)
                    page = qa.page(context)
                    qa.goto(page, "/?lang=lt")
                    campaign = box(page.locator(".campaign"))
                    header = box(page.locator(".site-header.is-home"))
                    search = box(page.locator(".header-search"))
                    search_input = page.locator(".header-search input[name='query']")
                    cta = box(page.locator(".campaign-cta"))
                    copy = box(page.locator(".campaign-copy"))
                    image_wrap = box(page.locator(".campaign-image"))
                    image = page.locator(".campaign-image picture img")
                    assert image.evaluate("element => element.complete && element.naturalWidth > 0")
                    assert page.locator(".campaign-piece").count() == 0
                    current_source = image.evaluate("element => new URL(element.currentSrc).pathname")
                    if width <= 700:
                        assert px(search_input, "font-size") >= 16
                        assert "weft-street-mobile-" in current_source, current_source
                        assert abs(image_wrap["height"] / image_wrap["width"] - 1.25) <= 0.03
                        assert copy["y"] >= image_wrap["y"] + image_wrap["height"] - 1
                    else:
                        assert "weft-street-desktop-" in current_source, current_source
                        assert abs(image_wrap["width"] - campaign["width"]) <= 1
                        assert abs(image_wrap["width"] - width) <= 1 and abs(image_wrap["x"]) <= 1
                        expected_height = min(image_wrap["width"] * 1412 / 2508, height - header["height"])
                        assert abs(image_wrap["height"] - expected_height) <= 1
                        assert image.evaluate("element => getComputedStyle(element).objectFit") == "cover"
                        assert copy["x"] + copy["width"] <= image_wrap["x"] + image_wrap["width"] * 0.39 + 2
                    assert header["y"] + header["height"] <= image_wrap["y"] + 1
                    assert search["x"] >= header["x"] and search["x"] + search["width"] <= header["x"] + header["width"] + 1
                    assert cta["x"] >= campaign["x"] - 1
                    assert cta["x"] + cta["width"] <= campaign["x"] + campaign["width"] + 1
                    assert cta["y"] + cta["height"] <= campaign["y"] + campaign["height"] + 1
                    no_horizontal_overflow(page)
                    if (width, height) in ((390, 844), (1440, 650), (2560, 1440)):
                        shot = qa.screenshot(page, f"home-lt-{width}x{height}")
                    else:
                        shot = None
                    captures.append({"viewport": [width, height], "campaign": campaign, "header": header, "search": search,
                        "image": image_wrap, "source": current_source, "copy": copy, "cta": cta, "screenshot": shot})
                    context.close()
                qa.current_details["captures"] = captures

            qa.run("HOME-01", "responsive campaign source, normal-flow header and copy placement hold from phone to ultrawide", home_contract)

            def user_font_fallback() -> None:
                context = qa.context(1440, 1000)
                page = qa.page(context)
                qa.goto(page, "/search?gender=women&lang=lt")
                before = catalog_metrics(page)
                page.evaluate("document.documentElement.style.setProperty('font-size', '20px', 'important')")
                page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
                after = catalog_metrics(page)
                for field in ("body_font", "nav_font", "search_font", "title_font", "price_font"):
                    assert after[field] >= before[field] * 1.22, (field, before[field], after[field])
                assert after["sidebar"]["width"] >= before["sidebar"]["width"] * 1.22
                assert after["search"]["width"] >= before["search"]["width"] * 1.22
                no_horizontal_overflow(page)
                screenshot = qa.screenshot(page, "catalog-lt-user-font-125pct")
                qa.current_details.update({"before": before, "after": after, "screenshot": screenshot,
                    "method": "inline 20px root-font override exercises rem fallback without CSS zoom; it is not a physical browser text-zoom test"})
                context.close()

            qa.run("FONT-01", "125% user root-font override enlarges text and rem-sized workbench without overflow", user_font_fallback)

            def dpr_and_nojs() -> None:
                context = qa.context(2048, 1152, dpr=1.25)
                page = qa.page(context)
                qa.goto(page, "/search?gender=women&lang=lt")
                assert columns(page) == 4
                metrics = catalog_metrics(page)
                screenshot = qa.screenshot(page, "catalog-lt-women-2048-dpr125")
                context.close()

                nojs_cases = []
                for width, height, expected in ((390, 844, 2), (768, 1000, 3), (1440, 1000, 4), (2560, 1440, 4)):
                    context = qa.context(width, height, javascript=False)
                    page = qa.page(context)
                    qa.goto(page, "/search?gender=women&lang=lt", wait_images=False)
                    actual = columns(page)
                    assert actual == expected, (width, expected, actual)
                    assert not page.locator(".density-view").is_visible()
                    no_horizontal_overflow(page)
                    nojs_cases.append({"viewport": [width, height], "columns": actual})
                    context.close()
                qa.current_details.update({"dpr_metrics": metrics, "dpr_screenshot": screenshot, "nojs": nojs_cases})

            qa.run("ENV-01", "DPR changes pixels not CSS layout; no-JS keeps 2/3/4 responsive grid", dpr_and_nojs)

        report = qa.report()
        browser.close()
        print(f"REPORT {report}", flush=True)
        return 1 if any(result["status"] == "FAIL" for result in qa.results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
