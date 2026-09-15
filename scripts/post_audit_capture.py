"""Capture comparable post-audit browser evidence for the local Weft app."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright


def capture(base_url: str, output_dir: Path, phase: str) -> dict[str, Any]:
    screenshots = output_dir / phase
    results_dir = output_dir / "results"
    screenshots.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)
    cases = [
        ("home-en", "/?lang=en", 1440, 900),
        ("home-lt", "/?lang=lt", 390, 844),
        ("search-black-en", "/search?query=black&lang=en", 1440, 900),
        ("search-black-lt", "/search?query=black&lang=lt", 390, 844),
        ("pdp-shirt-en", "/out/MOCK-001?lang=en", 390, 844),
        ("pdp-trousers-en", "/out/MOCK-002?lang=en", 390, 844),
        ("pdp-skirt-lt", "/out/MOCK-014?lang=lt", 390, 844),
        ("pdp-shirt-desktop", "/out/MOCK-001?lang=en", 1440, 900),
    ]
    payload: dict[str, Any] = {"phase": phase, "base_url": base_url.rstrip("/"), "cases": []}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for name, path, width, height in cases:
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            errors: list[str] = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            response = page.goto(f"{base_url.rstrip('/')}{path}", wait_until="networkidle", timeout=30_000)
            page.wait_for_timeout(150)
            target = screenshots / f"{name}-{width}x{height}.png"
            page.screenshot(path=str(target), full_page=False, animations="disabled")
            metrics = page.evaluate(
                """() => ({
                  clientWidth: document.documentElement.clientWidth,
                  scrollWidth: document.documentElement.scrollWidth,
                  bodyWidth: document.body.getBoundingClientRect().width,
                  lang: document.documentElement.lang,
                  title: document.title,
                  mainText: document.querySelector('main')?.innerText.slice(0, 1600) ?? '',
                  overflowNodes: [...document.querySelectorAll('main *')].map((element) => {
                    const rect = element.getBoundingClientRect();
                    return { tag: element.tagName, className: String(element.className || ''), left: rect.left, right: rect.right, text: (element.textContent || '').trim().slice(0, 140) };
                  }).filter((item) => item.left < -1 || item.right > innerWidth + 1).slice(0, 10)
                })"""
            )
            payload["cases"].append({
                "name": name,
                "path": path,
                "viewport": [width, height],
                "status": response.status if response else None,
                "screenshot": str(target.relative_to(output_dir.parent.parent)).replace("\\", "/"),
                "metrics": metrics,
                "page_errors": errors,
            })
            context.close()
        browser.close()
    report = results_dir / f"capture-{phase}.json"
    report.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3200")
    parser.add_argument("--output", type=Path, default=Path("evidence/2026-09-15-post-audit"))
    parser.add_argument("--phase", choices=("before", "after"), required=True)
    args = parser.parse_args()
    payload = capture(args.base_url, args.output.resolve(), args.phase)
    print(json.dumps({"phase": payload["phase"], "cases": len(payload["cases"])}, ensure_ascii=True))


if __name__ == "__main__":
    main()
