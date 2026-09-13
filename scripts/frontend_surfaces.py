"""Capture supporting public routes and a private contact sheet for visual review."""
import html
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('.omx/artifacts/frontend/secondary')
out.mkdir(parents=True, exist_ok=True)
routes = ['stores','account','ai-fitting-room','about','how-it-works','contact','data-sources','affiliate-disclosure','privacy','terms']
records = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for locale in ['en','lt']:
        for device,width,height in [('desktop',1440,1000),('mobile',390,844)]:
            context = browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
            page = context.new_page()
            for route in routes:
                errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                url=f'http://127.0.0.1:3100/{route}?lang={locale}'
                response=page.goto(url,wait_until='domcontentloaded')
                page.locator('main h1').wait_for()
                page.evaluate('document.fonts.ready')
                page.wait_for_function('Array.from(document.images).filter(i=>i.getBoundingClientRect().top<innerHeight).every(i=>i.complete)',timeout=12000)
                if route=='ai-fitting-room': page.wait_for_timeout(500)
                file=f'{route}-{locale}-{device}.png'
                page.screenshot(path=str(out/file),full_page=True,animations='disabled')
                records.append({'file':file,'url':url,'locale':locale,'device':device,'status':response.status,'overflow':page.evaluate('document.documentElement.scrollWidth>innerWidth'),'pageErrors':errors})
            context.close()
    for locale in ['en','lt']:
        for device in ['desktop','mobile']:
            entries=[r for r in records if r['locale']==locale and r['device']==device]
            content='<html><meta charset="utf-8"><style>body{font:16px Arial;background:#d9d9d9;margin:20px}.board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}article{background:white;padding:12px}img{display:block;width:100%;height:auto}h2{font-size:16px}</style><div class="board">'
            for r in entries: content+=f'<article><h2>{html.escape(r["url"])}</h2><img src="{r["file"]}"></article>'
            file=out/f'board-{locale}-{device}.html';file.write_text(content+'</div></html>',encoding='utf-8')
            page=browser.new_page(viewport={'width':1100,'height':1000});page.goto(file.resolve().as_uri());page.screenshot(path=str(out/f'board-{locale}-{device}.png'),full_page=True);page.close()
    browser.close()
(out/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'captures':len(records),'errors':[r for r in records if r['pageErrors'] or r['overflow'] or r['status']!=200]},indent=2))
