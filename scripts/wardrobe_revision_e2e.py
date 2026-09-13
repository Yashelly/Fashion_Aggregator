"""Focused regression for the cold-studio category rail and heading reflow."""
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import sync_playwright

base = os.environ.get("BASE_URL", "http://127.0.0.1:3100")
output = Path(".omx/artifacts/frontend/revision-cold-studio-final")
output.mkdir(parents=True, exist_ok=True)
checks = []
errors = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for locale in ["en", "lt"]:
        for width in [320, 360, 390, 430, 768, 1280, 1440, 1920]:
            context = browser.new_context(viewport={"width": width, "height": 900}, reduced_motion="reduce")
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(f"{base}/?lang={locale}", wait_until="networkidle")
            page.evaluate("document.fonts.ready")
            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth")
            assert page.locator(".wardrobe-link").count() == 4
            assert page.locator(".browse-categories").count() == 0
            assert "Georgia" not in page.locator("h1").evaluate("e => getComputedStyle(e).fontFamily")
            if width < 768:
                rail = page.locator(".wardrobe-rail")
                second = page.locator(".wardrobe-link").nth(1).bounding_box()
                bounds = rail.bounding_box()
                assert second and bounds and abs(second["x"] + second["width"] - bounds["x"] - bounds["width"]) < 2
                last = page.locator(".wardrobe-link").last
                last.focus()
                page.wait_for_function("document.querySelector('.wardrobe-rail').scrollLeft > 0")
                box = last.bounding_box()
                assert box and box["x"] >= bounds["x"] - 1
                assert box["x"] + box["width"] <= bounds["x"] + bounds["width"] + 1
                last.press("Enter")
                page.wait_for_url("**/search?**")
                assert parse_qs(urlparse(page.url).query)["category"] == ["shoes"]
                assert page.locator("html").get_attribute("lang") == locale
                assert page.locator(".product-tile").count() > 0
            checks.append({"locale": locale, "width": width, "status": "pass"})
            context.close()
    browser.close()
assert not errors, errors
report = {"checks": checks, "pageErrors": errors}
(output / "wardrobe-regression.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps({"passed": len(checks), "pageErrors": errors}))
