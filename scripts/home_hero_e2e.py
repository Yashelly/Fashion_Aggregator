"""Focused production E2E and visual evidence for the responsive home hero.

Run after starting the production server:
  python scripts/home_hero_e2e.py --base-url http://127.0.0.1:3100
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
DEFAULT_ARTIFACTS = ROOT / ".omx" / "artifacts" / "frontend" / "home-hero-qa"
AXE_PATH = ROOT / "node_modules" / "axe-core" / "axe.min.js"
MOBILE_WIDTHS = (320, 390, 430, 700)
DESKTOP_WIDTHS = (701, 768, 1440, 1920, 2560, 3840)
MOBILE_SOURCE = re.compile(r"/hero-assets/weft-street-mobile-(640|960|1128)\.webp$")
DESKTOP_SOURCE = re.compile(r"/hero-assets/weft-street-desktop-(1280|1920|2508)\.webp$")


def box(locator: Locator) -> dict[str, float]:
    value = locator.bounding_box()
    if value is None:
        raise AssertionError(f"no rendered box for {locator}")
    return {key: round(float(number), 2) for key, number in value.items()}


def current_path(image: Locator) -> str:
    return image.evaluate("image => new URL(image.currentSrc).pathname")


def no_horizontal_overflow(page: Page) -> dict[str, Any]:
    result = page.evaluate(
        """() => {
          const root = document.documentElement;
          const offenders = [...document.body.querySelectorAll('*')].map(element => {
            const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
            return {tag: element.tagName, cls: String(element.className || '').slice(0, 100),
              left: rect.left, right: rect.right, shown: style.display !== 'none' &&
              style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1};
          }).filter(item => item.shown && (item.left < -2 || item.right > innerWidth + 2)).slice(0, 12);
          return {innerWidth, clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, offenders};
        }"""
    )
    if result["scrollWidth"] > result["clientWidth"] + 1:
        raise AssertionError(f"horizontal overflow: {result}")
    return result


class HeroQA:
    def __init__(self, browser: Browser, base_url: str, artifacts: Path) -> None:
        self.browser = browser
        self.base_url = base_url.rstrip("/")
        self.artifacts = artifacts
        self.screenshots = artifacts / "screenshots"
        self.screenshots.mkdir(parents=True, exist_ok=True)
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
        color_scheme: str = "light",
    ) -> BrowserContext:
        return self.browser.new_context(
            viewport={"width": width, "height": height},
            device_scale_factor=dpr,
            java_script_enabled=javascript,
            color_scheme=color_scheme,
        )

    def page(self, context: BrowserContext) -> Page:
        page = context.new_page()
        page.set_default_timeout(12_000)
        self.current_page = page
        return page

    def goto(self, page: Page, path: str, *, wait_image: bool = True) -> None:
        response = page.goto(f"{self.base_url}{path}", wait_until="domcontentloaded")
        if response is None or response.status != 200:
            raise AssertionError(f"{path} returned {None if response is None else response.status}")
        page.locator("main").wait_for(state="visible")
        if wait_image:
            page.wait_for_function(
                """() => { const image = document.querySelector('.campaign-image img');
                return image?.complete && image.naturalWidth > 0 && document.fonts.status === 'loaded'; }"""
            )
            page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")

    def shot(self, page: Page, name: str) -> str:
        path = self.screenshots / f"{name}.png"
        page.evaluate("scrollTo(0, 0)")
        # Never enlarge the viewport to hide an over-tall campaign. A viewport
        # capture is the evidence for fitting beneath real browser chrome.
        page.screenshot(path=str(path), full_page=False, animations="disabled")
        return str(path.relative_to(ROOT)).replace("\\", "/")

    def run(self, test_id: str, name: str, function: Callable[[], None]) -> None:
        started = time.perf_counter()
        self.current_page = None
        self.current_details = {}
        status, message, failure = "PASS", "", None
        try:
            function()
        except Exception as error:
            status = "FAIL"
            message = f"{type(error).__name__}: {error}"
            self.current_details["traceback"] = traceback.format_exc(limit=8)
            if self.current_page and not self.current_page.is_closed():
                try:
                    failure = self.shot(self.current_page, f"FAIL-{test_id.lower()}")
                except Exception as shot_error:
                    self.current_details["screenshot_error"] = str(shot_error)
        self.results.append({
            "id": test_id,
            "name": name,
            "status": status,
            "message": message,
            "duration_ms": round((time.perf_counter() - started) * 1000),
            "screenshot": failure,
            "details": self.current_details,
        })
        print(f"{status:4} {test_id} {name}{': ' + message if message else ''}", flush=True)

    def report(self) -> Path:
        payload = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "base_url": self.base_url,
            "source": "real local production server; native picture selection and rendered geometry",
            "summary": {state: sum(item["status"] == state for item in self.results) for state in ("PASS", "FAIL")},
            "results": self.results,
            "limits": [
                "Playwright DPR and color-scheme emulation are browser-level checks, not physical-device tests.",
                "The desktop people boundary is contract geometry (39% of image width), not computer-vision detection.",
            ],
        }
        path = self.artifacts / "report.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return path


def hero_geometry(page: Page, width: int) -> dict[str, Any]:
    header = box(page.locator(".site-header.is-home"))
    campaign = box(page.locator("main .campaign"))
    image_wrap = box(page.locator(".campaign-image"))
    copy = box(page.locator(".campaign-copy"))
    cta = box(page.locator(".campaign-cta"))
    image = page.locator(".campaign-image picture img")
    assert page.locator(".campaign-image picture source").count() >= 1
    assert image.count() == 1 and image.is_visible()
    assert image.evaluate("element => element.complete && element.naturalWidth > 0")
    assert page.locator(".campaign-piece").count() == 0
    assert header["y"] + header["height"] <= image_wrap["y"] + 1, (header, image_wrap)
    assert campaign["height"] >= image_wrap["height"], (campaign, image_wrap)
    assert cta["x"] >= campaign["x"] - 1 and cta["x"] + cta["width"] <= campaign["x"] + campaign["width"] + 1
    source = current_path(image)
    if width <= 700:
        assert MOBILE_SOURCE.search(source), source
        assert abs(image_wrap["height"] / image_wrap["width"] - 1.25) <= 0.025, image_wrap
        assert copy["y"] >= image_wrap["y"] + image_wrap["height"] - 1, (copy, image_wrap)
        assert cta["y"] >= image_wrap["y"] + image_wrap["height"] - 1, (cta, image_wrap)
    else:
        assert DESKTOP_SOURCE.search(source), source
        assert abs(image_wrap["width"] - campaign["width"]) <= 1, image_wrap
        assert abs(image_wrap["width"] - width) <= 1 and abs(image_wrap["x"]) <= 1, image_wrap
        expected_height = min(image_wrap["width"] * 1412 / 2508, page.viewport_size["height"] - header["height"])
        assert abs(image_wrap["height"] - expected_height) <= 1, image_wrap
        assert image.evaluate("element => getComputedStyle(element).objectFit") == "cover"
        people_start = image_wrap["x"] + image_wrap["width"] * 0.39
        assert copy["x"] + copy["width"] <= people_start + 2, (copy, people_start)
        assert copy["y"] >= image_wrap["y"] and copy["y"] + copy["height"] <= image_wrap["y"] + image_wrap["height"] + 1
    return {
        "header": header,
        "campaign": campaign,
        "image": image_wrap,
        "copy": copy,
        "cta": cta,
        "source": source,
        "natural": image.evaluate("element => [element.naturalWidth, element.naturalHeight]"),
        "overflow": no_horizontal_overflow(page),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3100")
    parser.add_argument("--artifacts", type=Path, default=DEFAULT_ARTIFACTS)
    args = parser.parse_args()
    artifacts = args.artifacts.resolve()
    artifacts.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        qa = HeroQA(browser, args.base_url, artifacts)

        def responsive_sources_and_geometry() -> None:
            evidence = []
            for width in (*MOBILE_WIDTHS, *DESKTOP_WIDTHS):
                height = 650 if width == 1440 else (844 if width <= 700 else 1000)
                context = qa.context(width, height)
                page = qa.page(context)
                qa.goto(page, "/?lang=en")
                metrics = hero_geometry(page, width)
                if width == 1440:
                    image_bottom = metrics["image"]["y"] + metrics["image"]["height"]
                    assert image_bottom <= height + 1, (image_bottom, height)
                evidence.append({"viewport": [width, height], **metrics})
                context.close()
            qa.current_details["matrix"] = evidence

        qa.run("HERO-01", "correct native source and layout geometry from 320 through 3840 CSS pixels", responsive_sources_and_geometry)

        def source_switch_on_resize() -> None:
            context = qa.context(700, 900)
            page = qa.page(context)
            qa.goto(page, "/?lang=en")
            image = page.locator(".campaign-image picture img")
            before = current_path(image)
            assert MOBILE_SOURCE.search(before), before
            page.set_viewport_size({"width": 701, "height": 900})
            page.wait_for_function(
                """() => { const image = document.querySelector('.campaign-image img');
                return image?.complete && image.naturalWidth > 0 && image.currentSrc.includes('weft-street-desktop-'); }"""
            )
            after = current_path(image)
            assert DESKTOP_SOURCE.search(after), (before, after)
            desktop = hero_geometry(page, 701)
            page.set_viewport_size({"width": 700, "height": 900})
            page.wait_for_function("() => document.querySelector('.campaign-image img')?.currentSrc.includes('weft-street-mobile-')")
            returned = current_path(image)
            assert MOBILE_SOURCE.search(returned), returned
            qa.current_details.update(before=before, after=after, returned=returned, desktop=desktop)
            context.close()

        qa.run("HERO-02", "same-page resize swaps mobile and desktop picture sources at 700/701", source_switch_on_resize)

        def locale_cta_and_search() -> None:
            evidence = []
            for locale in ("en", "lt"):
                context = qa.context(390, 844)
                page = qa.page(context)
                qa.goto(page, f"/?lang={locale}")
                cta = page.locator(".campaign-cta")
                expected = "/search"
                cta.click()
                page.wait_for_url(re.compile(r"/search(?:\?|$)"))
                parsed = parse_qs(urlparse(page.url).query)
                assert urlparse(page.url).path == expected
                assert (parsed.get("lang") == ["lt"]) if locale == "lt" else ("lang" not in parsed or parsed.get("lang") == ["en"])
                page.go_back(wait_until="domcontentloaded")
                search = page.locator('.header-search input[name="query"]')
                search.fill("wide trousers")
                search.press("Enter")
                page.wait_for_url(re.compile(r"/search\?"))
                parsed = parse_qs(urlparse(page.url).query)
                assert parsed.get("query") == ["wide trousers"]
                if locale == "lt":
                    assert parsed.get("lang") == ["lt"]
                evidence.append({"locale": locale, "url": page.url})
                context.close()
            qa.current_details["navigation"] = evidence

        qa.run("HERO-03", "CTA and header search navigate to catalog while preserving locale", locale_cta_and_search)

        def mobile_menu_keyboard() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/?lang=en")
            menu = page.locator("details.mobile-menu")
            summary = menu.locator(":scope > summary")
            summary.focus()
            page.keyboard.press("Enter")
            assert menu.get_attribute("open") is not None
            nav = menu.locator(":scope > nav")
            assert nav.is_visible()
            page.keyboard.press("Tab")
            assert nav.evaluate("element => element.contains(document.activeElement)")
            page.keyboard.press("Escape")
            assert menu.get_attribute("open") is None
            assert summary.evaluate("element => element === document.activeElement")
            qa.current_details["menu"] = {"opened_by_keyboard": True, "escape_restored_focus": True}
            context.close()

        qa.run("HERO-04", "mobile menu opens from keyboard and Escape closes it with focus restored", mobile_menu_keyboard)

        def nojs_search() -> None:
            context = qa.context(390, 844, javascript=False)
            page = qa.page(context)
            qa.goto(page, "/?lang=lt", wait_image=False)
            search = page.locator('.header-search input[name="query"]')
            assert search.is_visible()
            search.fill("juodos kelnės")
            search.press("Enter")
            page.wait_for_url(re.compile(r"/search\?"))
            parsed = parse_qs(urlparse(page.url).query)
            assert parsed.get("query") == ["juodos kelnės"] and parsed.get("lang") == ["lt"], page.url
            qa.current_details["url"] = page.url
            context.close()

        qa.run("HERO-05", "server-rendered home search works without JavaScript and keeps LT locale", nojs_search)

        def blocked_image_resilience() -> None:
            context = qa.context(390, 844)
            page = qa.page(context)
            page.route("**/hero-assets/weft-street-*.webp", lambda route: route.abort())
            qa.goto(page, "/?lang=en", wait_image=False)
            copy = page.locator(".campaign-copy")
            cta = page.locator(".campaign-cta")
            assert copy.is_visible() and copy.locator("h1").inner_text().strip()
            assert cta.is_visible() and cta.get_attribute("href")
            no_horizontal_overflow(page)
            qa.current_details["copy"] = copy.inner_text()
            context.close()

        qa.run("HERO-06", "copy and CTA remain accessible when hero image requests are blocked", blocked_image_resilience)

        def assets_and_environment() -> None:
            asset_root = ROOT / "public" / "hero-assets"
            files = {}
            for family, limit in (("mobile", 250 * 1024), ("desktop", 700 * 1024)):
                expected = (640, 960, 1128) if family == "mobile" else (1280, 1920, 2508)
                for width in expected:
                    path = asset_root / f"weft-street-{family}-{width}.webp"
                    assert path.exists(), path
                    size = path.stat().st_size
                    assert size <= limit, (path.name, size, limit)
                    files[path.name] = size

            context = qa.context(390, 844, dpr=2)
            page = qa.page(context)
            qa.goto(page, "/?lang=en")
            dpr_metrics = hero_geometry(page, 390)
            context.close()

            context = qa.context(390, 844)
            page = qa.page(context)
            qa.goto(page, "/?lang=en")
            page.evaluate("document.documentElement.style.setProperty('font-size', '20px', 'important')")
            page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
            font_metrics = hero_geometry(page, 390)
            context.close()
            qa.current_details.update(files=files, dpr2=dpr_metrics, font_125=font_metrics)

        qa.run("HERO-07", "asset budgets, DPR2 phone and 125% root-font fallback meet the contract", assets_and_environment)

        def visual_and_axe_evidence() -> None:
            captures = []
            for locale in ("en", "lt"):
                for width, height in ((390, 844), (1440, 900), (2560, 1440)):
                    context = qa.context(width, height)
                    page = qa.page(context)
                    qa.goto(page, f"/?lang={locale}")
                    hero_geometry(page, width)
                    captures.append(qa.shot(page, f"home-{locale}-{width}"))
                    context.close()
            context = qa.context(390, 844, color_scheme="dark")
            context.add_init_script("localStorage.setItem('weft-theme', 'dark')")
            page = qa.page(context)
            qa.goto(page, "/?lang=en")
            assert page.locator("html").get_attribute("data-theme") == "dark"
            captures.append(qa.shot(page, "home-en-390-dark"))
            context.close()

            axe = {"status": "skipped", "reason": f"missing {AXE_PATH}"}
            if AXE_PATH.exists():
                context = qa.context(390, 844)
                page = qa.page(context)
                qa.goto(page, "/?lang=en")
                page.add_script_tag(path=str(AXE_PATH))
                result = page.evaluate(
                    "async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})"
                )
                serious = [
                    {"id": item["id"], "impact": item["impact"], "nodes": len(item["nodes"])}
                    for item in result["violations"] if item["impact"] in ("serious", "critical")
                ]
                axe = {"status": "measured", "serious_or_critical": serious}
                context.close()
                assert not serious, serious
            qa.current_details.update(captures=captures, axe=axe)

        qa.run("HERO-08", "EN/LT phone and desktop screenshots plus phone dark and local axe evidence", visual_and_axe_evidence)

        report = qa.report()
        browser.close()
        print(f"REPORT {report}", flush=True)
        return 1 if any(item["status"] == "FAIL" for item in qa.results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
