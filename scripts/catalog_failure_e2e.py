"""Exercise the real Next error/retry UI with an isolated catalog read fault."""

from __future__ import annotations

import argparse
import json
import os
import re
import socket
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / ".omx" / "artifacts" / "frontend" / "qa-browser"
FLAG = ARTIFACTS / "catalog-fault.enabled"
LOG = ARTIFACTS / "catalog-fault-server.log"
REPORT = ARTIFACTS / "catalog-failure-report.json"
PORT = 3112
BASE_URL = f"http://127.0.0.1:{PORT}"


def wait_for_port(process: subprocess.Popen[bytes], timeout: float = 20.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f"isolated Next server exited with {process.returncode}")
        try:
            with socket.create_connection(("127.0.0.1", PORT), timeout=0.2):
                return
        except OSError:
            time.sleep(0.1)
    raise TimeoutError(f"isolated Next server did not listen on {PORT}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sparse", action="store_true", help="Render a single product with absent optional fields in the isolated process")
    args = parser.parse_args()
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    (ARTIFACTS / "screenshots").mkdir(parents=True, exist_ok=True)
    allowed = ARTIFACTS.resolve()
    if FLAG.resolve().parent != allowed or FLAG.name != "catalog-fault.enabled":
        raise RuntimeError("refusing an out-of-scope catalog fault marker")

    FLAG.write_text("sparse" if args.sparse else "error", encoding="utf-8")
    env = os.environ.copy()
    for name in (
        "GEMINI_API_KEY",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_URL",
        "SUPABASE_SECRET_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "POSTHOG_PROJECT_API_KEY",
    ):
        env[name] = ""
    env["WEFT_QA_CATALOG_FAULT_FLAG"] = str(FLAG.resolve())
    # Next 16 may move request work into a child process. NODE_OPTIONS keeps the
    # same preload active there while the explicit --require remains auditable.
    env["NODE_OPTIONS"] = f"--require={ROOT / 'scripts' / 'catalog-fault.cjs'}"

    command = [
        "node",
        "--require",
        "./scripts/catalog-fault.cjs",
        "node_modules/next/dist/bin/next",
        "start",
        "-H",
        "127.0.0.1",
        "-p",
        str(PORT),
    ]
    result: dict[str, object] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "base_url": BASE_URL,
        "command": "node --require ./scripts/catalog-fault.cjs node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3112",
        "status": "FAIL",
    }
    process: subprocess.Popen[bytes] | None = None
    log_path = ARTIFACTS / "sparse-product-server.log" if args.sparse else LOG
    log_handle = log_path.open("wb")
    try:
        process = subprocess.Popen(command, cwd=ROOT, env=env, stdout=log_handle, stderr=subprocess.STDOUT)
        wait_for_port(process)
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 390, "height": 844})
            page = context.new_page()
            page.set_default_timeout(10_000)
            page_errors: list[str] = []
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            if args.sparse:
                shots = []
                for locale in ("en", "lt"):
                    response = page.goto(f"{BASE_URL}/out/MOCK-001?lang={locale}", wait_until="domcontentloaded")
                    assert response and response.status == 200
                    assert page.locator(".product-detail-price strong").inner_text() == "—"
                    assert page.locator(".product-detail-price del, .product-size-section").count() == 0
                    assert page.locator(".product-detail-facts dd").count() == 1
                    assert page.locator(".product-gallery .image-fallback").count() > 0
                    assert "NaN" not in page.locator(".product-detail-card").inner_text()
                    shot = ARTIFACTS / "screenshots" / f"sparse-product-{locale}-mobile-390.png"
                    page.screenshot(path=str(shot), animations="disabled")
                    shots.append(str(shot.relative_to(ROOT)).replace("\\", "/"))
                assert not page_errors, page_errors
                result.update(status="PASS", scenario="UX-18 sparse product; missing price, sizes, optional facts and images", page_errors=page_errors, screenshots=shots)
                context.close()
                browser.close()
                return 0
            response = page.goto(f"{BASE_URL}/search?query=black&lang=lt", wait_until="domcontentloaded")
            if response is None or response.status != 500:
                raise AssertionError(f"controlled catalog failure returned {response.status if response else None}, expected 500")
            alert = page.locator('[role="alert"]')
            alert.wait_for(state="visible")
            if page.locator(".empty-state").count():
                raise AssertionError("catalog failure was misrepresented as zero products")
            if parse_qs(urlparse(page.url).query).get("query") != ["black"]:
                raise AssertionError("search query was lost in the catalog error state")
            page.screenshot(path=str(ARTIFACTS / "screenshots" / "catalog-failure-lt-mobile-390.png"), animations="disabled")

            FLAG.unlink()
            page.get_by_role("button").filter(has_text=re.compile("Bandyti|Retry", re.I)).click()
            page.locator(".product-grid").wait_for(state="visible")
            if page.locator(".product-tile").count() == 0:
                raise AssertionError("Retry did not restore catalog products")
            if parse_qs(urlparse(page.url).query).get("query") != ["black"]:
                raise AssertionError("Retry did not retain the search query")
            page.screenshot(path=str(ARTIFACTS / "screenshots" / "catalog-recovered-lt-mobile-390.png"), animations="disabled")
            result.update(
                status="PASS",
                initial_http_status=500,
                retry_http_behavior="reload the same URL; fresh server GET restores product grid",
                result_count=page.locator(".product-tile").count(),
                page_errors=page_errors,
                screenshots=[
                    ".omx/artifacts/frontend/qa-browser/screenshots/catalog-failure-lt-mobile-390.png",
                    ".omx/artifacts/frontend/qa-browser/screenshots/catalog-recovered-lt-mobile-390.png",
                ],
            )
            context.close()
            browser.close()
    except Exception as error:
        result["error"] = f"{type(error).__name__}: {error}"
    finally:
        if FLAG.exists():
            FLAG.unlink()
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=8)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)
        log_handle.close()
        report_path = ARTIFACTS / "sparse-product-report.json" if args.sparse else REPORT
        report_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        if args.sparse:
            print(json.dumps(result, ensure_ascii=False, indent=2))

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
