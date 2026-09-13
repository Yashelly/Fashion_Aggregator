"""Prove that a delayed older search response cannot replace newer intent."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.async_api import Route, async_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / ".omx" / "artifacts" / "frontend" / "qa-browser"
REPORT = ARTIFACTS / "navigation-race-report.json"
BASE_URL = "http://127.0.0.1:3100"


def request_query(url: str) -> str | None:
    return parse_qs(urlparse(url).query).get("query", [None])[0]


async def run_iteration(browser: object, iteration: int) -> dict[str, object]:
    context = await browser.new_context(viewport={"width": 1280, "height": 900})
    page = await context.new_page()
    page.set_default_timeout(10_000)
    linen_started = asyncio.Event()
    release_linen = asyncio.Event()
    page_errors: list[str] = []
    requests: list[str] = []
    failed_requests: list[str] = []
    linen_released = False

    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url) if "/search" in request.url else None)
    page.on("requestfailed", lambda request: failed_requests.append(request.url) if "/search" in request.url else None)

    async def hold_older_search(route: Route) -> None:
        nonlocal linen_released
        params = parse_qs(urlparse(route.request.url).query)
        if params.get("query") == ["linen shirt"] and "_rsc" in params:
            linen_started.set()
            await release_linen.wait()
            linen_released = True
        try:
            await route.continue_()
        except Exception:
            # A newer Next navigation may cancel the deliberately stale request.
            # Cancellation is a valid way to preserve the newer result.
            return

    await page.route("**/*", hold_older_search)
    response = await page.goto(f"{BASE_URL}/search?query=black&lang=en", wait_until="domcontentloaded")
    if response is None or response.status != 200:
        raise AssertionError(f"initial search returned {response.status if response else None}")
    await page.locator(".product-grid").wait_for(state="visible")
    search = page.locator('form.catalog-form input[type="search"][name="query"]')

    await search.fill("linen shirt")
    await search.press("Enter")
    await asyncio.wait_for(linen_started.wait(), timeout=8)
    if request_query(page.url) == "linen shirt":
        raise AssertionError("held older response committed before it was released")

    await search.fill("white sneakers")
    await search.press("Enter")
    await page.wait_for_url(lambda url: request_query(str(url)) == "white sneakers")
    await page.locator(".product-grid").wait_for(state="visible")
    await page.wait_for_function(
        "() => document.querySelector('form.catalog-form input[type=search][name=query]')?.value === 'white sneakers'"
    )
    before_titles = await page.locator(".product-title").all_inner_texts()
    if not before_titles:
        raise AssertionError("newer search committed without results")
    before_url = page.url

    release_linen.set()
    await page.wait_for_timeout(1_000)
    after_titles = await page.locator(".product-title").all_inner_texts()
    after_query = await search.input_value()
    after_url = page.url
    if request_query(after_url) != "white sneakers" or after_query != "white sneakers":
        raise AssertionError(
            f"older response replaced newer intent: url={after_url!r}, input={after_query!r}"
        )
    if after_titles != before_titles:
        raise AssertionError("visible results changed after the stale response was released")
    if page_errors:
        raise AssertionError(f"page errors during controlled race: {page_errors}")

    screenshot = ARTIFACTS / "screenshots" / f"navigation-race-white-wins-{iteration}.png"
    await page.screenshot(path=str(screenshot), animations="disabled")
    result = {
        "iteration": iteration,
        "status": "PASS",
        "older_query": "linen shirt",
        "newer_query": "white sneakers",
        "url_before_release": before_url,
        "url_after_release": after_url,
        "input_after_release": after_query,
        "result_titles": after_titles,
        "older_request_released": linen_released,
        "older_request_cancelled": any(request_query(url) == "linen shirt" for url in failed_requests),
        "search_request_urls": requests,
        "page_errors": page_errors,
        "screenshot": str(screenshot.relative_to(ROOT)).replace("\\", "/"),
    }
    await context.close()
    return result


async def main() -> int:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    (ARTIFACTS / "screenshots").mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "base_url": BASE_URL,
        "method": "Hold the older linen-shirt RSC request, commit white-sneakers, then release the older response.",
        "status": "FAIL",
        "iterations": [],
    }
    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            iterations = []
            for iteration in range(1, 4):
                iterations.append(await run_iteration(browser, iteration))
            await browser.close()
        report["iterations"] = iterations
        report["status"] = "PASS"
        report["screenshots"] = [
            path["screenshot"] for path in iterations
        ]
    except Exception as error:
        report["error"] = f"{type(error).__name__}: {error}"
    finally:
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
