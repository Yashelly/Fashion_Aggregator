"""Focused browser checks for the local-only approximate 3D preview."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3100").rstrip("/")
ARTIFACT_DIR = Path(
    os.environ.get(
        "FITTING_ARTIFACT_DIR",
        ".omx/artifacts/frontend/fitting-room",
    )
)


def image_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def capture_canvas(page) -> str:
    canvas = page.locator(".avatar-stage canvas")
    canvas.wait_for(state="visible")
    page.wait_for_timeout(500)
    return image_hash(canvas.screenshot())


def run() -> dict[str, object]:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    browser_errors: list[str] = []
    assertions: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = context.new_page()
        page.on("pageerror", lambda error: browser_errors.append(str(error)))
        page.on(
            "console",
            lambda message: browser_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        response = page.goto(f"{BASE_URL}/ai-fitting-room?lang=en", wait_until="networkidle")
        assert response and response.status == 200
        page.locator(".avatar-stage canvas").wait_for(state="visible")
        page.wait_for_timeout(1_000)
        page.screenshot(path=ARTIFACT_DIR / "initial-en-desktop.png", full_page=True)
        initial_hash = capture_canvas(page)
        assertions.append("WebGL canvas renders the mannequin")

        radios = page.locator('input[name="fitting-product"]')
        assert radios.count() >= 2
        initial_category = page.locator(".fitting-product-option").first.locator("small").inner_text()
        target_index = 1
        for index in range(1, radios.count()):
            category = page.locator(".fitting-product-option").nth(index).locator("small").inner_text()
            if category != initial_category:
                target_index = index
                break
        page.locator(".fitting-product-option").nth(target_index).click()
        assert radios.nth(target_index).is_checked()
        page.wait_for_timeout(1_000)
        garment_hash = capture_canvas(page)
        assert garment_hash != initial_hash
        assertions.append("Selecting another garment changes the rendered model")

        knitwear = page.locator(".fitting-product-option").filter(has_text="Knitwear")
        assert knitwear.count() >= 1
        knitwear.first.click()
        page.wait_for_timeout(1_000)
        knitwear_hash = capture_canvas(page)
        assert knitwear_hash != garment_hash
        assertions.append("Knitwear renders through the approximate top-garment geometry")
        page.screenshot(path=ARTIFACT_DIR / "knitwear-en-desktop.png", full_page=True)

        chest = page.get_by_label("Chest (cm)")
        chest.fill("130")
        chest.blur()
        page.wait_for_timeout(500)
        measurement_hash = capture_canvas(page)
        assert measurement_hash != knitwear_hash
        stored = page.evaluate("JSON.parse(localStorage.getItem('weft-fitting-measurements'))")
        assert stored["chest"] == 130
        assertions.append("Changing a measurement changes the rendered model and local state")

        rotate_right = page.get_by_role("button", name="Rotate view right")
        rotate_right.focus()
        rotate_right.press("Enter")
        page.wait_for_timeout(300)
        rotated_hash = capture_canvas(page)
        assert rotated_hash != measurement_hash
        assertions.append("The rotate control works from the keyboard")
        page.screenshot(path=ARTIFACT_DIR / "adjusted-en-desktop.png", full_page=True)
        context.close()

        reduced_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            reduced_motion="reduce",
        )
        reduced_page = reduced_context.new_page()
        reduced_page.on("pageerror", lambda error: browser_errors.append(str(error)))
        response = reduced_page.goto(
            f"{BASE_URL}/ai-fitting-room?lang=lt",
            wait_until="networkidle",
        )
        assert response and response.status == 200
        reduced_page.locator(".avatar-stage canvas").wait_for(state="visible")
        auto_rotate = reduced_page.get_by_role("button", name="Perjungti automatinį sukimą")
        assert auto_rotate.is_disabled()
        assertions.append("Reduced motion disables automatic rotation")
        reduced_page.screenshot(path=ARTIFACT_DIR / "reduced-motion-lt-mobile.png", full_page=True)
        reduced_context.close()
        browser.close()

    assert not browser_errors, f"Browser errors: {browser_errors}"
    report = {
        "baseUrl": BASE_URL,
        "assertions": assertions,
        "browserErrors": browser_errors,
        "screenshots": [
            "initial-en-desktop.png",
            "adjusted-en-desktop.png",
            "knitwear-en-desktop.png",
            "reduced-motion-lt-mobile.png",
        ],
    }
    (ARTIFACT_DIR / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return report


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
