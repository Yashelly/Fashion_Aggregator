"""Real saved-state screenshots and responsive theme-sync regression."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('.omx/artifacts/frontend/secondary')
base = os.environ.get('BASE_URL', 'http://127.0.0.1:3100').rstrip('/')
out.mkdir(parents=True, exist_ok=True)
report = {'saved': [], 'theme_sync': False, 'page_errors': []}
with sync_playwright() as p:
    browser = p.chromium.launch()
    for locale in ['en', 'lt']:
        for device, width, height in [('desktop', 1440, 1000), ('mobile', 390, 844)]:
            context = browser.new_context(viewport={'width': width, 'height': height})
            page = context.new_page()
            page.on('pageerror', lambda error: report['page_errors'].append(str(error)))
            page.goto(f'{base}/search?query=black&lang={locale}', wait_until='domcontentloaded')
            for button in page.locator('.product-grid .wishlist-button').all()[:2]:
                button.click()
            page.locator('.account-link').click()
            page.locator('.saved-product').first.wait_for()
            assert page.locator('.saved-product').count() == 2
            assert page.locator('.recent-search-list').count() == 1
            page.evaluate('document.fonts.ready')
            page.wait_for_function('Array.from(document.images).every(i => i.complete)')
            file = f'account-populated-{locale}-{device}.png'
            page.screenshot(path=str(out / file), full_page=True, animations='disabled')
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
            report['saved'].append({'locale': locale, 'device': device, 'count': 2, 'screenshot': file})
            context.close()
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    page = context.new_page()
    page.goto(f'{base}/?lang=en', wait_until='domcontentloaded')
    page.locator('.site-footer .theme-toggle').click()
    page.wait_for_function('document.documentElement.dataset.theme === "dark"')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator('.mobile-menu > summary').click()
    assert 'light' in page.locator('.mobile-menu .theme-toggle').inner_text().lower()
    page.locator('.mobile-menu .theme-toggle').click()
    page.wait_for_function('document.documentElement.dataset.theme === "light"')
    page.set_viewport_size({'width': 1440, 'height': 1000})
    assert 'dark' in page.locator('.site-footer .theme-toggle').inner_text().lower()
    assert page.evaluate('localStorage.getItem("weft-theme")') == 'light'
    report['theme_sync'] = True
    context.close()
    browser.close()
assert not report['page_errors'], report['page_errors']
(out / 'state-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
