"""Same-task locale switch + form submit must commit one consistent language."""
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:3100").rstrip("/")
OUTPUT = Path(os.environ.get("OUTPUT", ".omx/artifacts/frontend/selected-hybrid-qa/locale-form-intent.json"))
records = []
with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    for surface in ["home", "search", "sort", "filters"]:
        for initial, target in [("lt", "en"), ("en", "lt")]:
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            page = context.new_page()
            page.set_default_timeout(5000)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            record = {"surface": surface, "from": initial, "to": target, "status": "FAIL"}
            try:
                route = "/" if surface == "home" else "/search?query=black"
                page.goto(BASE + route + ("&" if "?" in route else "?") + "lang=" + initial)
                page.wait_for_function("lang => document.documentElement.lang === lang", arg=initial)
                form = ".header-search" if surface == "home" else ".catalog-form" if surface == "search" else ".sort-form" if surface == "sort" else ".filter-panel form"
                query = "white sneakers" if surface in ["home", "search"] else "black"
                if surface in ["home", "search"]:
                    page.locator(form + ' input[name="query"]').fill(query)
                if surface == "filters":
                    page.locator(form + ' input[name="minPrice"]').fill("20")
                    page.locator(form + ' input[name="maxPrice"]').fill("120")
                # Deliberately one JS task: React has not rerendered hidden lang
                # fields when the new language's synchronous intent must win.
                page.evaluate("""({target, form, sort}) => {
                  [...document.querySelectorAll('.language-switcher a')].find(a => a.textContent.trim() === target.toUpperCase()).click();
                  const element = document.querySelector(form);
                  const submitter = sort ? element.querySelector('button[name="sort"][value="price-low"]') : undefined;
                  element.requestSubmit(submitter);
                }""", {"target": target, "form": form, "sort": surface == "sort"})
                page.wait_for_function("""({target, query}) => {
                  const url = new URL(location.href);
                  return url.pathname === '/search' && url.searchParams.get('lang') === target && url.searchParams.get('query') === query;
                }""", arg={"target": target, "query": query})
                heading = "Search results" if target == "en" else "Paieškos rezultatai"
                page.wait_for_function("""({target, heading}) => document.documentElement.lang === target
                  && document.querySelector('.catalog-title h1')?.textContent === heading""", arg={"target": target, "heading": heading})
                params = parse_qs(urlparse(page.url).query)
                assert next(c["value"] for c in context.cookies() if c["name"] == "weft-locale") == target
                if surface == "sort":
                    assert params.get("sort") == ["price-low"], params
                if surface == "filters":
                    assert params.get("minPrice") == ["20"] and params.get("maxPrice") == ["120"], params
                assert not errors, errors
                record.update(status="PASS", url=page.url, heading=heading)
            except Exception as error:
                record.update(error=str(error), url=page.url, html_lang=page.locator("html").get_attribute("lang"))
            record["page_errors"] = errors
            records.append(record)
            context.close()
    browser.close()
report = {"passed": sum(r["status"] == "PASS" for r in records), "failed": sum(r["status"] == "FAIL" for r in records), "cases": records}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(bool(report["failed"]))
