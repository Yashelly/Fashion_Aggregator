"""Production-build search routing UI checks; run with cloud/analytics disabled."""
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urlencode, urlparse

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:3115')
ARTIFACTS = ROOT / '.omx/artifacts/search-routing'


def product_ids(page):
    return sorted(urlparse(href).path.rsplit('/', 1)[-1] for href in
                  page.locator('.product-link').evaluate_all('(links) => links.map(a => a.href)'))


def main():
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    report = []
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width, height in [(1440, 1000), (2560, 1440), (390, 844)]:
            for locale, query in [('en', 'without sleeves'), ('lt', 'be rankovių')]:
                context = browser.new_context(viewport={'width': width, 'height': height})
                page = context.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                started = time.perf_counter()
                response = page.goto(BASE + '/search?' + urlencode({'lang': locale, 'query': query}), wait_until='networkidle')
                assert response.status == 200
                expect(page.locator('.product-link')).to_have_count(2)
                assert product_ids(page) == ['MOCK-004', 'MOCK-019']
                search_input = page.locator('.catalog-form input[name="query"]')
                expect(search_input).to_have_value(query)
                page.wait_for_function('''() => [...document.querySelectorAll('.product-grid img')]
                    .every(image => image.complete && image.naturalWidth > 0)''')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                elapsed_ms = round((time.perf_counter() - started) * 1000)
                shot = ARTIFACTS / f'sleeveless-{locale}-{width}.png'
                page.screenshot(path=str(shot), animations='disabled')

                search_input.fill('sleeveless under 20')
                search_input.press('Enter')
                expect(page).to_have_url(re.compile('query=sleeveless'))
                expect(page.locator('.product-link')).to_have_count(1)
                assert product_ids(page) == ['MOCK-004']
                page.goto(BASE + '/search?' + urlencode({'lang': locale, 'query': 'without sleeves', 'category': 'bags'}))
                expect(page.locator('.empty-state')).to_be_visible()
                expect(page.locator('.product-link')).to_have_count(0)
                page.go_back()
                expect(page.locator('.product-link')).to_have_count(1)
                assert product_ids(page) == ['MOCK-004']
                report.append({'width': width, 'locale': locale, 'status': 'PASS',
                               'navigation_and_image_ready_ms': elapsed_ms, 'screenshot': str(shot)})
                context.close()

        context = browser.new_context(java_script_enabled=False)
        page = context.new_page()
        response = page.goto(BASE + '/search?lang=en&query=without+sleeves')
        assert response.status == 200
        assert product_ids(page) == ['MOCK-004', 'MOCK-019']
        report.append({'javascript': False, 'status': 'PASS'})
        browser.close()
    assert not errors, errors
    payload = {'cases': report, 'browser_errors': errors,
               'limits': 'Local production build; networkidle/image readiness is NOT server search latency. No live AI or production benchmark.'}
    (ARTIFACTS / 'report.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'passed': len(report), 'browser_errors': errors}))


if __name__ == '__main__':
    main()
