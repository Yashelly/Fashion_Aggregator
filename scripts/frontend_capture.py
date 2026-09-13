"""Reproducible production-browser screenshots; run against an isolated local preview."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='http://127.0.0.1:3100')
parser.add_argument('--phase', default='baseline')
args = parser.parse_args()
output = Path('.omx/artifacts/frontend') / args.phase
output.mkdir(parents=True, exist_ok=True)
records = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for locale in ['en', 'lt']:
        for device, width, height in [('desktop', 1440, 1000), ('mobile', 390, 844)]:
            context = browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1, reduced_motion='reduce')
            page = context.new_page()
            for surface, route in [('home', '/'), ('results', '/search?query=black'), ('details', '/out/MOCK-001')]:
                url = args.base_url + route + ('&' if '?' in route else '?') + 'lang=' + locale
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                response = page.goto(url, wait_until='domcontentloaded')
                page.locator('main h1').wait_for()
                page.evaluate('document.fonts.ready')
                page.wait_for_function('Array.from(document.images).filter(i => i.getBoundingClientRect().top < innerHeight).every(i => i.complete)', timeout=15000)
                page.wait_for_timeout(150)
                page.evaluate('window.scrollTo(0, 0)')
                page.wait_for_function('window.scrollY === 0')
                page.screenshot(path=str(output / f'{surface}-{locale}-{device}.png'), animations='disabled')
                records.append({'file': f'{surface}-{locale}-{device}.png', 'url': url, 'viewport': [width, height], 'locale': locale, 'status': response.status, 'pageErrors': errors, 'overflow': page.evaluate('document.documentElement.scrollWidth > innerWidth'), 'firstProductTop': page.locator('.product-grid').first.evaluate('(e)=>Math.round(e.getBoundingClientRect().top)') if page.locator('.product-grid').count() else None, 'date': datetime.now(timezone.utc).isoformat()})
            context.close()
    browser.close()
(output / 'manifest.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(json.dumps(records, indent=2))
