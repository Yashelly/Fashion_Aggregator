"""Real-viewport evidence: never enlarge the window to make the hero fit."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.omx/artifacts/frontend/layout-spacing'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--baseline', action='store_true')
    parser.add_argument('--base-url', default='http://127.0.0.1:3115')
    args = parser.parse_args()
    out = OUT / ('before' if args.baseline else 'after')
    out.mkdir(parents=True, exist_ok=True)
    records, errors = [], []
    matrix = [(2560, 1294), (2506, 1294), (1920, 940), (1440, 760), (1024, 650), (390, 744), (320, 640)]
    if not args.baseline:
        matrix += [(2560, 500), (1440, 400), (3440, 1440), (3840, 1600)]
    with sync_playwright() as p:
        browser = p.chromium.launch()
        variants = [(width, height, 'en') for width, height in matrix]
        if not args.baseline:
            variants += [(2560, 512, 'lt'), (2560, 513, 'lt'), (1440, 512, 'lt'), (1440, 513, 'lt')]
        for width, height, locale in variants:
            for route in ['/', '/search']:
                context = browser.new_context(viewport={'width': width, 'height': height})
                page = context.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(args.base_url + route + '?lang=' + locale, wait_until='networkidle')
                page.wait_for_function('''() => [...document.images].filter(i => {
                    const r=i.getBoundingClientRect(); return r.top<innerHeight && r.bottom>0;
                }).every(i => i.complete && i.naturalWidth>0)''')
                metrics = page.evaluate('''() => {
                    const box = s => { const el=document.querySelector(s); if (!el) return null;
                      const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}; };
                    return {viewport:[innerWidth,innerHeight],hero:box('.campaign'),image:box('.campaign-image'),
                      copy:box('.campaign-copy'),header:box('.site-header'),collection:box('.home-section'),
                      catalog:box('.search-route'),grid:box('.product-grid'),
                      overflow:document.documentElement.scrollWidth>innerWidth+1};
                }''')
                suffix = f'{width}x{height}-{locale}'
                name = ('home' if route == '/' else 'catalog') + '-' + suffix
                page.screenshot(path=str(out / f'{name}.png'), animations='disabled')
                if route == '/':
                    search = page.locator('.header-search input[name="query"]')
                    search.click()
                    focus = page.locator('.header-search .search-input-row').evaluate('e => ({outline:getComputedStyle(e).outlineStyle, shadow:getComputedStyle(e).boxShadow})')
                    page.screenshot(path=str(out / f'focus-{suffix}.png'), animations='disabled')
                    page.locator('.home-section').scroll_into_view_if_needed()
                    page.screenshot(path=str(out / f'collection-{suffix}.png'), animations='disabled')
                    metrics['focus'] = focus
                if not args.baseline:
                    assert not metrics['overflow'], metrics
                    region = metrics['collection'] or metrics['catalog']
                    assert region['x'] >= (width * .035 if width > 700 else 10), metrics
                    assert width - region['x'] - region['width'] >= (width * .035 if width > 700 else 10), metrics
                    if route == '/':
                        assert focus['outline'] == 'none' and focus['shadow'] != 'none', focus
                        if width > 700:
                            assert metrics['image']['bottom'] <= height + 1, metrics
                            assert abs(metrics['image']['width'] - metrics['hero']['width']) < 1, metrics
                            assert abs(metrics['image']['width'] - width) < 1 and abs(metrics['image']['x']) < 1, metrics
                            assert abs(metrics['image']['x'] - metrics['hero']['x']) < 1, metrics
                            expected_height = min(metrics['image']['width'] * 1412/2508, height - metrics['header']['height'])
                            assert abs(metrics['image']['height'] - expected_height) < 1, metrics
                            assert page.locator('.campaign-image img').evaluate('e => getComputedStyle(e).objectFit') == 'cover'
                            assert metrics['copy']['y'] >= metrics['image']['y'], metrics
                            if height > 512:
                                assert metrics['hero']['bottom'] <= height + 1, metrics
                                assert metrics['copy']['bottom'] <= metrics['image']['bottom'] + 1, metrics
                            else:
                                assert metrics['copy']['y'] >= metrics['image']['bottom'] - 1, metrics
                        else:
                            assert metrics['copy']['y'] >= metrics['image']['bottom'] - 1, metrics
                records.append({'name': name, **metrics})
                context.close()
        if not args.baseline:
            for forced in ['none', 'active']:
                context = browser.new_context(viewport={'width':1440,'height':760}, forced_colors=forced)
                page = context.new_page()
                page.goto(args.base_url + '/?lang=en', wait_until='networkidle')
                field = page.locator('.header-search input[name="query"]')
                field.focus()
                if forced == 'active':
                    assert page.locator('.header-search .search-input-row').evaluate('e => getComputedStyle(e).borderBottomWidth') == '2px'
                page.keyboard.press('Tab')
                assert page.locator('.header-search .search-submit').evaluate('e => e === document.activeElement && getComputedStyle(e).outlineStyle !== "none"')
                context.close()
        browser.close()
    assert not errors, errors
    (out / 'report.json').write_text(json.dumps({'cases':records,'browser_errors':errors}, indent=2), encoding='utf-8')
    print(json.dumps({'cases':len(records),'baseline':args.baseline,'browser_errors':errors}))


if __name__ == '__main__':
    main()
