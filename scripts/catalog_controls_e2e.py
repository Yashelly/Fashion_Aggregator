"""Browser contract for Weft's custom catalog controls.

Baseline mode records the rejected native-select UI. Final mode verifies the
replacement option pickers and radio filters without relaxing catalog behavior.
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

from playwright.sync_api import Browser, BrowserContext, Locator, Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / ".omx" / "artifacts" / "frontend" / "catalog-controls-baseline"
FINAL = ROOT / ".omx" / "artifacts" / "frontend" / "catalog-controls-final"


def params(page: Page) -> dict[str, list[str]]:
    return parse_qs(urlparse(page.url).query)


def box(locator: Locator) -> dict[str, float]:
    value = locator.bounding_box()
    if not value:
        raise AssertionError(f"no visible box for {locator}")
    return {key: round(float(number), 2) for key, number in value.items()}


class QA:
    def __init__(self, browser: Browser, base_url: str, artifacts: Path) -> None:
        self.browser, self.base_url, self.artifacts = browser, base_url.rstrip("/"), artifacts
        self.shots = artifacts / "screenshots"
        self.shots.mkdir(parents=True, exist_ok=True)
        self.results: list[dict[str, Any]] = []
        self.page_errors: list[str] = []

    def context(self, width=1440, height=1000, *, javascript=True, color_scheme="light") -> BrowserContext:
        return self.browser.new_context(viewport={"width": width, "height": height},
                                        java_script_enabled=javascript, color_scheme=color_scheme)

    def page(self, context: BrowserContext) -> Page:
        page = context.new_page()
        page.set_default_timeout(8_000)
        page.on("pageerror", lambda error: self.page_errors.append(str(error)))
        page.on("console", lambda msg: self.page_errors.append(msg.text) if msg.type == "error" else None)
        return page

    def goto(self, page: Page, path: str) -> None:
        response = page.goto(self.base_url + path, wait_until="domcontentloaded")
        assert response and response.status == 200, (path, None if response is None else response.status)
        page.locator("main").wait_for(state="visible")
        # Offscreen lazy images are intentionally not fetched on a cold preview.
        page.wait_for_function("""() => [...document.images].filter(image => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
        }).every(image => image.complete && image.naturalWidth > 0)""")

    def screenshot(self, page: Page, name: str, *, full_page=False) -> str:
        target = self.shots / f"{name}.png"
        page.wait_for_function("""async () => {
          const images = [...document.querySelectorAll('.product-grid img')].filter(image => image.checkVisibility());
          await Promise.all(images.map(image => image.decode().catch(() => undefined)));
          return images.every(image => image.complete && image.naturalWidth > 0);
        }""")
        page.screenshot(path=str(target), full_page=full_page, animations="disabled")
        return str(target.relative_to(ROOT)).replace("\\", "/")

    def run(self, test_id: str, description: str, function: Callable[[], dict[str, Any] | None]) -> None:
        record: dict[str, Any] = {"id": test_id, "description": description, "status": "FAIL"}
        try:
            evidence = function() or {}
            record.update(status="PASS", evidence=evidence)
        except Exception as error:
            record.update(error=f"{type(error).__name__}: {error}", traceback=traceback.format_exc(limit=5))
        self.results.append(record)
        line = f"{record['status']:4} {test_id} {description}" + (f": {record.get('error')}" if record["status"] == "FAIL" else "")
        print(line.encode("ascii", "backslashreplace").decode("ascii"), flush=True)

    def report(self, mode: str) -> Path:
        payload = {
            "generated_at": datetime.now(timezone.utc).isoformat(), "mode": mode, "base_url": self.base_url,
            "summary": {state: sum(item["status"] == state for item in self.results) for state in ("PASS", "FAIL")},
            "results": self.results, "browser_errors": self.page_errors,
            "limits": ["Headless Chromium cannot display an operating-system native menu; DOM absence of SELECT is the deterministic guard.",
                       "Chromium forced-colors emulation is automated; it is not equivalent to a physical Windows High Contrast and screen-reader pass."],
        }
        target = self.artifacts / "report.json"
        target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return target


def open_group(scope: Locator, name: str) -> Locator:
    radio = scope.locator(f'input[type="radio"][name="{name}"]').first
    group = radio.locator("xpath=ancestor::details[contains(@class,'filter-group')]")
    if not group.get_attribute("open"):
        group.locator(":scope > summary").click()
    radio.wait_for(state="visible")
    return group


def picker(page: Page, kind: str) -> Locator:
    return page.locator("details.option-picker.density-view" if kind == "density" else ".sort-form details.option-picker")


def choose_picker(page: Page, kind: str, value: str) -> None:
    control = picker(page, kind)
    control.locator(":scope > summary").click()
    control.locator(f'.picker-options button[data-value="{value}"]').click()


def no_overflow(page: Page) -> dict[str, int]:
    value = page.evaluate("() => ({client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth})")
    assert value["scroll"] <= value["client"] + 1, value
    return value


def non_overlapping(locators: list[Locator]) -> list[dict[str, float]]:
    boxes = [box(item) for item in locators if item.is_visible()]
    for index, first in enumerate(boxes):
        for second in boxes[index + 1:]:
            overlap_x = min(first["x"] + first["width"], second["x"] + second["width"]) - max(first["x"], second["x"])
            overlap_y = min(first["y"] + first["height"], second["y"] + second["height"]) - max(first["y"], second["y"])
            assert not (overlap_x > 1 and overlap_y > 1), (first, second)
    return boxes


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

        def no_native_selects() -> dict[str, Any]:
            context = qa.context(1440, 1000)
            page = qa.page(context)
            qa.goto(page, "/search?gender=women&lang=lt")
            screenshot = qa.screenshot(page, "catalog-lt-controls-1440")
            selects = page.locator("main select").count()
            visible_duplicate = page.locator('.filter-group:has(input[name="category"]) .filter-field > span').count()
            context.close()
            assert selects == 0, f"found {selects} rejected native SELECT controls"
            assert visible_duplicate == 0, f"found {visible_duplicate} duplicated category labels"
            return {"select_count": selects, "duplicated_category_labels": visible_duplicate, "screenshot": screenshot}

        qa.run("CTRL-01", "catalog contains no native selects or duplicated field labels", no_native_selects)

        if args.mode == "final":
            def filter_radios() -> dict[str, Any]:
                evidence = []
                for locale, width, height in (("en", 1440, 1000), ("lt", 2560, 1440), ("en", 390, 844), ("lt", 390, 844), ("lt", 320, 844)):
                    context = qa.context(width, height)
                    page = qa.page(context)
                    qa.goto(page, f"/search?lang={locale}")
                    scope = page.locator("aside.filter-panel")
                    if width <= 900:
                        page.locator(".catalog-toolbar .filter-toggle").click()
                        scope = page.locator(".filter-dialog[open]")
                    category = open_group(scope, "category")
                    radios = category.locator('input[type="radio"][name="category"]')
                    category_count = radios.count()
                    assert category_count >= 8
                    first_choice = category.locator(".filter-choice").first
                    first_choice.scroll_into_view_if_needed()
                    assert first_choice.is_visible()
                    clean_shot = None
                    if locale == "lt" and width in (390, 2560):
                        page.evaluate("scrollTo(0, 0)")
                        page.mouse.move(1, 1)
                        clean_shot = qa.screenshot(page, f"category-only-lt-{width}")
                    for name in ("department", "status"):
                        group = open_group(scope, name)
                        assert group.locator("fieldset > legend.sr-only").count() == 1
                    for name in ("color", "size", "store"):
                        group = scope.locator(f'.filter-group:has(input[name="{name}"])')
                        if group.get_attribute("open") is None:
                            group.locator(":scope > summary").click()
                        assert group.locator("fieldset > legend.sr-only").count() == 1
                    for index in range(scope.locator(".filter-group").count()):
                        group = scope.locator(".filter-group").nth(index)
                        if group.get_attribute("open") is None:
                            group.locator(":scope > summary").click()
                    assert category.locator('.filter-field > span').count() == 0
                    radios.last.scroll_into_view_if_needed()
                    outerwear = category.locator('input[value="outerwear"]')
                    if locale == "en" and width == 1440:
                        outerwear.focus()
                        page.keyboard.press("Space")
                    else:
                        outerwear.locator("xpath=ancestor::label").click()
                    assert outerwear.is_checked()
                    shot = qa.screenshot(page, f"filters-{locale}-{width}")
                    if width <= 900:
                        scope.locator(".filter-dialog-actions .secondary").click()
                        assert "category" not in params(page)
                    option_kind = "density" if width > 900 and width == 1440 else "sort"
                    if width > 900:
                        qa.goto(page, f"/search?lang={locale}")
                    page.evaluate("scrollTo(0, 0)")
                    option = picker(page, option_kind)
                    option.locator(":scope > summary").click()
                    option_shot = qa.screenshot(page, f"{option_kind}-open-{locale}-{width}")
                    option_box = box(option.locator(":scope > .picker-options"))
                    assert option_box["x"] >= -1 and option_box["x"] + option_box["width"] <= width + 1, option_box
                    open_overflow = no_overflow(page)
                    page.keyboard.press("Escape")
                    evidence.append({"viewport": [width, height], "locale": locale,
                                     "category_choices": category_count, "category_only_screenshot": clean_shot,
                                     "filters_screenshot": shot,
                                     "picker_screenshot": option_shot, "picker_box": option_box,
                                     "open_overflow": open_overflow, "overflow": no_overflow(page)})
                    context.close()
                return {"cases": evidence}

            qa.run("CTRL-02", "radio filter lists are accessible, complete, cancellable and responsive", filter_radios)

            def picker_interactions() -> dict[str, Any]:
                context = qa.context(1440, 1000)
                page = qa.page(context)
                qa.goto(page, "/search?query=black&lang=en")
                density = picker(page, "density")
                sort = picker(page, "sort")
                assert density.get_attribute("data-value") == "4"
                summaries = [density.locator(":scope > summary"), sort.locator(":scope > summary")]
                geometry = non_overlapping([page.locator(".filter-toggle"), *summaries])
                summaries[0].focus()
                page.keyboard.press("ArrowDown")
                assert density.get_attribute("open") is not None
                active = page.locator(":focus")
                assert active.evaluate("element => element.matches('.picker-options button[data-value]')")
                first_value = active.get_attribute("data-value")
                page.keyboard.press("End")
                assert page.locator(":focus").get_attribute("data-value") == "5"
                page.keyboard.press("Enter")
                page.wait_for_function("() => document.querySelector('.catalog-layout')?.dataset.density === '5'")
                assert density.get_attribute("data-value") == "5"
                assert summaries[0].evaluate("element => element === document.activeElement")
                summaries[0].click()
                density_shot = qa.screenshot(page, "density-picker-open-en-1440")
                page.keyboard.press("Escape")
                assert density.get_attribute("open") is None
                assert summaries[0].evaluate("element => element === document.activeElement")
                summaries[0].click()
                page.locator(".catalog-title h1").click()
                assert density.get_attribute("open") is None
                summaries[0].click()
                summaries[0].evaluate("element => element.blur()")
                assert density.get_attribute("open") is None
                summaries[1].focus()
                page.keyboard.press("Home")
                assert sort.get_attribute("open") is not None and page.locator(":focus").evaluate("element => element.matches('.picker-options button[name=\"sort\"]')")
                shot = qa.screenshot(page, "sort-picker-open-en-1440")
                page.keyboard.press("Escape")
                context.close()
                return {"toolbar_boxes": geometry, "first_keyboard_density": first_value,
                        "density_screenshot": density_shot, "sort_screenshot": shot}

            qa.run("CTRL-03", "custom pickers support keyboard navigation, Escape and outside close without overlap", picker_interactions)

            def behavior_and_persistence() -> dict[str, Any]:
                context = qa.context(2560, 1440)
                page = qa.page(context)
                qa.goto(page, "/search?query=black&lang=en")
                choose_picker(page, "density", "3")
                page.wait_for_function("() => document.querySelector('.catalog-layout')?.dataset.density === '3'")
                baseline = params(page)
                page.reload(wait_until="domcontentloaded")
                page.wait_for_function("() => document.querySelector('details.density-view')?.dataset.value === '3'")
                assert params(page) == baseline
                choose_picker(page, "sort", "price-low")
                page.wait_for_url(re.compile(r"sort=price-low"))
                assert params(page).get("sort") == ["price-low"] and params(page).get("query") == ["black"]
                return_url = page.url
                context.close()
                return {"density": "3", "sort_url": return_url}

            qa.run("CTRL-04", "density persists without URL mutation and sort submits its chosen value", behavior_and_persistence)

            def every_sort_value_fits() -> dict[str, Any]:
                records = []
                for locale, width, height in (("lt", 320, 844), ("en", 390, 844), ("lt", 1024, 900)):
                    context = qa.context(width, height)
                    page = qa.page(context)
                    if locale == "lt" and width == 320:
                        qa.goto(page, "/search?gender=women&sort=sale&lang=lt")
                        hotspot_controls = non_overlapping([page.locator(".catalog-toolbar .filter-toggle"),
                                                            picker(page, "sort").locator(":scope > summary")])
                        hotspot_toolbar = non_overlapping([page.locator(".catalog-toolbar .catalog-title"),
                                                           page.locator(".catalog-toolbar .tool-actions")])
                        assert page.locator(".filter-count").inner_text().strip() == "1"
                        hotspot_shot = qa.screenshot(page, "sort-sale-active-filter-lt-320")
                        records.append({"viewport": [320, 844], "locale": "lt", "value": "sale",
                                        "route": "/search?gender=women&sort=sale&lang=lt", "filter_count": 1,
                                        "controls": hotspot_controls, "toolbar": hotspot_toolbar,
                                        "overflow": no_overflow(page), "screenshot": hotspot_shot})
                    qa.goto(page, f"/search?query=black&gender=women&lang={locale}")
                    for value in ("price-low", "price-high", "available", "sale", ""):
                        choose_picker(page, "sort", value)
                        page.wait_for_function("value => new URL(location.href).searchParams.get('sort') === (value || null)", arg=value)
                        selected = picker(page, "sort")
                        assert selected.get_attribute("data-value") == value
                        controls = [page.locator(".catalog-toolbar .filter-toggle"), selected.locator(":scope > summary")]
                        density = picker(page, "density")
                        if density.is_visible():
                            controls.insert(1, density.locator(":scope > summary"))
                        geometry = non_overlapping(controls)
                        toolbar_geometry = non_overlapping([page.locator(".catalog-toolbar .catalog-title"),
                                                            page.locator(".catalog-toolbar .tool-actions")])
                        overflow = no_overflow(page)
                        screenshot = qa.screenshot(page, f"sort-{value or 'default'}-{locale}-{width}") if value == "sale" else None
                        records.append({"viewport": [width, height], "locale": locale, "value": value,
                                        "controls": geometry, "toolbar": toolbar_geometry,
                                        "overflow": overflow, "screenshot": screenshot})
                    context.close()
                return {"states": records}

            qa.run("CTRL-05", "every sort value, including longest LT sale, fits at 320, 390 and 1024", every_sort_value_fits)

            def nojs_contract() -> dict[str, Any]:
                context = qa.context(1440, 1000, javascript=False)
                page = qa.page(context)
                qa.goto(page, "/search?query=black&lang=lt")
                assert not picker(page, "density").is_visible()
                assert not page.locator(".catalog-toolbar .filter-toggle").is_visible()
                fallback = page.locator("details.filter-disclosure")
                fallback_summary = fallback.locator(":scope > summary")
                assert fallback_summary.is_visible()
                assert fallback_summary.get_attribute("aria-controls") is None
                assert fallback_summary.get_attribute("aria-expanded") is None
                fallback_summary.click()
                assert fallback.get_attribute("open") is not None
                sort = picker(page, "sort")
                sort.locator(":scope > summary").click()
                sort.locator('button[name="sort"][value="price-low"]').click()
                page.wait_for_url(re.compile(r"sort=price-low"))
                panel = page.locator("aside.filter-panel")
                group = open_group(panel, "category")
                outerwear = group.locator('input[name="category"][value="outerwear"]')
                outerwear.locator("xpath=ancestor::label").click()
                assert outerwear.is_checked()
                panel.locator('button[type="submit"]').last.click()
                page.wait_for_url(re.compile(r"category=outerwear"))
                current = params(page)
                context.close()
                assert current.get("sort") == ["price-low"] and current.get("category") == ["outerwear"] and current.get("lang") == ["lt"]
                return {"params": current}

            qa.run("CTRL-06", "no-JS sort submit buttons and radio filter GET fallback remain functional", nojs_contract)

            def dark_open_states() -> dict[str, Any]:
                context = qa.context(1440, 1000, color_scheme="dark")
                context.add_init_script("localStorage.setItem('weft-theme', 'dark')")
                page = qa.page(context)
                qa.goto(page, "/search?lang=lt")
                open_group(page.locator("aside.filter-panel"), "category")
                picker(page, "density").locator(":scope > summary").click()
                shot = qa.screenshot(page, "controls-lt-dark-1440")
                overflow = no_overflow(page)
                context.close()
                return {"screenshot": shot, "overflow": overflow}

            qa.run("CTRL-07", "dark-theme open controls remain contained", dark_open_states)

            def forced_colors_states() -> dict[str, Any]:
                context = qa.context(390, 844)
                page = qa.page(context)
                page.emulate_media(forced_colors="active")
                qa.goto(page, "/search?lang=lt")
                assert page.evaluate("matchMedia('(forced-colors: active)').matches")
                page.locator(".catalog-toolbar .filter-toggle").click()
                dialog = page.locator(".filter-dialog[open]")
                open_group(dialog, "category")
                screenshot = qa.screenshot(page, "category-lt-forced-colors-390")
                overflow = no_overflow(page)
                context.close()
                return {"forced_colors": "active", "screenshot": screenshot, "overflow": overflow}

            qa.run("CTRL-08", "forced-colors active keeps the radio filter sheet usable", forced_colors_states)

            def unsupported_dialog_fallback() -> dict[str, Any]:
                context = qa.context(390, 844)
                context.add_init_script("delete HTMLDialogElement.prototype.showModal; delete HTMLDialogElement.prototype.close")
                page = qa.page(context)
                qa.goto(page, "/search?query=black&lang=en")
                assert not page.locator(".catalog-toolbar .filter-toggle").is_visible()
                fallback = page.locator("details.filter-disclosure")
                summary = fallback.locator(":scope > summary")
                assert summary.is_visible() and summary.get_attribute("aria-expanded") is None
                summary.click()
                form = fallback.locator("form.filter-fallback")
                form.wait_for(state="visible")
                group = open_group(form, "category")
                outerwear = group.locator('input[name="category"][value="outerwear"]')
                outerwear.locator("xpath=ancestor::label").click()
                assert outerwear.is_checked()
                form.locator('input[name="maxPrice"]').fill("150")
                with page.expect_navigation(wait_until="domcontentloaded"):
                    form.locator('button[type="submit"]').click()
                current = params(page)
                assert current.get("query") == ["black"] and current.get("category") == ["outerwear"]
                assert current.get("maxPrice") == ["150"] and current.get("lang") in (None, ["en"])
                context.close()
                return {"params": current, "navigation": "document GET"}

            qa.run("CTRL-09", "missing showModal exposes a native disclosure and real GET fallback", unsupported_dialog_fallback)

        report = qa.report(args.mode)
        browser.close()
        print(f"REPORT {report}")
        return 1 if any(result["status"] == "FAIL" for result in qa.results) or qa.page_errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
