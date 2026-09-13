"""Private design comparison. Generates artifacts only; no application routes."""
import csv
import html
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path('.omx/artifacts/frontend/concepts')
ROOT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:3100'
with open('data/mock_products.csv', encoding='utf-8-sig', newline='') as source:
    products = list(csv.DictReader(source))
font_css = ''
for sheet in Path('.next/static/chunks').glob('*.css'):
    text = sheet.read_text(encoding='utf-8')
    import re
    font_css += ''.join(re.findall(r'@font-face\{[^}]+\}', text)).replace('../media/', BASE+'/_next/static/media/')

palettes = {
    'paper-cobalt': ['#F6F4EF','#191C21','#565C66','#2348D6','#1837AE','#EBEFFF'],
    'porcelain-pine': ['#F7F7F2','#172B27','#53615B','#1B5848','#124537','#EAF2E9'],
    'mist-aubergine': ['#F4F5F7','#22212A','#605D6B','#653F70','#4E2E58','#F0EAF2'],
    'chalk-citron': ['#F5F5F0','#20231F','#596055','#242B21','#10160E','#F0F4DD'],
    'linen-rust': ['#F7F5F0','#242522','#62635D','#993D1F','#773018','#F5E8DF'],
}

CSS = """
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--canvas);font:16px/1.5 'IBM Plex Sans',Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer}button,input,select{min-height:44px;border:1px solid #8A8C86;background:white;padding:10px 16px;color:var(--ink);border-radius:4px}button.primary{background:var(--accent);color:white;border-color:var(--accent)}header{height:76px;display:flex;align-items:center;padding:0 5%;gap:48px;border-bottom:1px solid #dcded7;background:white}.logo{font:bold 36px/1 'Syne',Arial,sans-serif;letter-spacing:-2px}.logo em{font-style:normal;color:var(--accent)}nav{display:flex;gap:28px;font-size:14px}.tools{margin-left:auto;font-size:14px;white-space:nowrap}main{max-width:1408px;margin:auto;padding:40px 5%}.hero{display:grid;grid-template-columns:1.15fr 1fr;gap:56px;align-items:center}.eyebrow{text-transform:uppercase;letter-spacing:2px;font-size:12px;color:var(--accent);margin-bottom:20px}h1{font:normal 62px/1.06 Georgia,serif;letter-spacing:-2px;margin:0 0 24px;max-width:670px}p.lead{color:var(--muted);max-width:530px;margin:0 0 28px;line-height:1.65}.search{display:flex;border:1px solid #787b73;background:white;padding:6px;gap:8px;border-radius:6px}.search input{border:0;min-width:0;width:100%;outline:0;padding-left:12px;background:transparent}.examples{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.examples button{font-size:13px;padding:7px 12px;min-height:36px;background:transparent;border-color:#d0d0c9;border-radius:22px}.hero-photos{display:grid;grid-template-columns:1.2fr 1fr;gap:14px;align-items:end}.hero-photos figure{margin:0;background:#e9e5df}.hero-photos img{display:block;width:100%;height:348px;object-fit:cover}.hero-photos figure:nth-child(2){margin-bottom:40px}.hero-photos figure:nth-child(2) img{height:262px}.hero-photos figcaption{padding:10px;font-size:12px;background:#fff}.section-head{display:flex;justify-content:space-between;align-items:center;margin:36px 0 18px;gap:16px}h2{font:normal 30px Georgia,serif;margin:0}.link{font-size:14px;text-decoration:underline}.categories{padding:18px 0;border-top:1px solid #d6d8d0;border-bottom:1px solid #d6d8d0;display:flex;gap:24px;overflow:auto;margin-top:32px;white-space:nowrap;font-size:14px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}.card img{display:block;aspect-ratio:4/5;width:100%;object-fit:contain;background:#eeeae4}.card h3{font:500 15px/1.45 Arial,sans-serif;margin:12px 0 5px;min-height:44px}.card p{display:flex;justify-content:space-between;font-size:14px;margin:0}.card .store{color:var(--muted);font-size:12px;margin-top:6px}.result-title{display:flex;align-items:end;justify-content:space-between;margin-bottom:20px}.result-title h1{font-size:40px;margin:0}.refine{display:flex;justify-content:space-between;align-items:center;margin:20px 0;gap:12px}.filter-controls{display:flex;gap:8px}.selected{display:flex;gap:8px;margin-bottom:22px;font-size:13px}.selected span{background:var(--subtle);border:1px solid #c9c2b9;border-radius:4px;padding:7px 11px}.sidebar{display:none}.catalog-body{display:grid}.concept-b h1,.concept-b h2{font-family:'Syne',Arial,sans-serif;font-weight:600;letter-spacing:-1.5px}.concept-b .hero{display:block}.concept-b .hero-photos{display:none}.concept-b .hero h1{font-size:48px;max-width:none}.concept-b .search{max-width:900px}.concept-b .sidebar{display:block;width:206px;padding-right:25px;border-right:1px solid #d5d6cf}.concept-b .sidebar label{display:block;font-size:13px;margin-bottom:20px}.concept-b .sidebar select{width:100%;margin-top:8px}.concept-b .catalog-body{grid-template-columns:230px 1fr;gap:24px}.concept-b .refine .filter-controls{visibility:hidden}.concept-c main{padding-top:24px}.concept-c h1{font:600 58px/1.08 Arial,sans-serif;letter-spacing:-3px}.concept-c .hero{background:#dde8b7;padding:32px;gap:30px}.concept-c .hero-photos{grid-template-columns:1fr}.concept-c .hero-photos figure:nth-child(2){display:none}.concept-c .hero-photos img{height:360px}.concept-c .search{border-radius:0}.concept-c .result-title{background:#dde8b7;padding:24px}.concept-c .result-title h1{font-size:42px}.concept-c .grid{gap:12px}.concept-c .card h3{font-weight:600}.bottom-bar{display:none}.sheet-demo{margin-top:24px;border:1px solid #91928b;border-radius:14px;background:#fff;padding:20px;max-width:390px}.sheet-demo label{display:block;margin:12px 0}.palette-specimen{border:1px solid #999;padding:24px;margin-bottom:24px}.palette-specimen h2{margin-bottom:20px}.palette-specimen .grid{grid-template-columns:repeat(4,1fr);max-width:700px}.error{color:#AB2B21;background:#FFF0ED;padding:12px}.error button{color:#AB2B21}.caption{font-size:13px;color:var(--muted)}
@media(max-width:767px){header{height:60px;padding:0 20px;gap:16px}header nav{display:none}.logo{font-size:30px}main{padding:24px 20px}h1{font-size:40px;line-height:1.07;letter-spacing:-1px;margin-bottom:16px}.hero{display:block}.eyebrow{font-size:10px;letter-spacing:1.3px;margin-bottom:16px}p.lead{font-size:15px;margin-bottom:20px}.search{padding:4px;gap:0}.search input{font-size:16px;padding-left:8px}.search button{padding:10px 14px;font-size:14px}.examples{gap:6px}.examples button{font-size:12px}.hero-photos{margin-top:24px;gap:10px;grid-template-columns:1fr 1fr}.hero-photos img,.hero-photos figure:nth-child(2) img{height:185px;object-fit:cover}.hero-photos figure:nth-child(2){margin-bottom:0}.hero-photos figcaption{padding:8px;font-size:10px}.categories{margin-top:24px;padding:14px 0;gap:20px;font-size:13px}.section-head{margin-top:24px}h2{font-size:26px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 12px}.card h3{font-size:13px;line-height:1.4}.card p{font-size:13px}.result-title h1{font-size:30px}.result-title .caption{display:none}.refine{flex-wrap:wrap;margin:16px 0}.filter-controls{flex:1}.filter-controls button:not(:first-child){display:none}.refine select{max-width:180px;font-size:13px}.selected{gap:6px;font-size:12px;flex-wrap:wrap;margin-bottom:18px}.concept-a:has(.result-title) .search{position:sticky;top:0;z-index:1}.concept-b .hero h1{font-size:34px}.concept-b .catalog-body{display:block}.concept-b .sidebar{display:none}.concept-b .refine .filter-controls{visibility:hidden}.concept-b .bottom-bar{position:fixed;display:flex;gap:8px;bottom:16px;left:20px;right:20px;padding:8px;background:white;border:1px solid #aaa;z-index:2;box-shadow:0 4px 20px #0002}.bottom-bar button{width:50%}.concept-c .hero{padding:24px 20px;margin:-24px -20px 0}.concept-c h1{font-size:42px;letter-spacing:-2px}.concept-c .hero-photos img{height:200px}.concept-c .hero-photos figure:nth-child(2){display:none}.concept-c .result-title{margin:0 -20px 20px;padding:20px}.concept-c .result-title h1{font-size:32px}.palette-specimen .grid{grid-template-columns:repeat(2,1fr)}}
"""

def card(p):
    i = int(p['mock_product_id'].split('-')[-1])
    previous = f'<del style="font-size:13px;color:var(--muted)">€{p["old_price_eur"]}</del>' if p['old_price_eur'] else ''
    return f'<article class="card"><img alt="{html.escape(p["title"])}" src="{BASE}{p["image_url"]}"><h3>{html.escape(p["title"])}</h3><p><strong>€{p["price_eur"]}</strong>{previous}<span>♡</span></p><div class="store">Store {(i-1)%6+1:02d}</div></article>'

def search(value=''):
    return f'<div class="search"><input aria-label="What are you looking for?" placeholder="A black wool coat under €150" value="{value}"><button class="primary" style="white-space:nowrap;flex-shrink:0">Search</button></div>'

def vars(p):
    return f'--canvas:{p[0]};--ink:{p[1]};--muted:{p[2]};--accent:{p[3]};--subtle:{p[5]}'

def document(content, direction='a', palette='linen-rust'):
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+font_css+CSS+'.hero-photos img{object-fit:contain}</style><body class="concept-'+direction+'" style="'+vars(palettes[palette])+'">'+content+'</body></html>'

header = '<header><div class="logo">we<em>ft</em></div><nav><span>Explore clothing</span><span>Stores</span><span>How it works</span></nav><div class="tools">♡ &nbsp; EN / LT</div></header>'
categories = '<div class="categories"><span>All clothing</span><span>Outerwear</span><span>Knitwear</span><span>Tops</span><span>Trousers</span><span>Dresses</span><span>Shoes</span></div>'
refine = '<div class="refine"><div class="filter-controls"><button>☷ Filters</button><button>Category ⌄</button><button>Store ⌄</button><button>Budget ⌄</button></div><select aria-label="Sort"><option>Relevance</option></select></div><div class="selected"><span>Black ×</span><span>Under €150 ×</span><span>Clear filters</span></div>'
sidebar = '<aside class="sidebar"><strong>Refine your search</strong>'+''.join('<label>'+x+'<select><option>All '+x.lower()+'</option></select></label>' for x in ['Categories','Stores','Colours'])+'<label>Budget<input value="150" style="width:100%"></label></aside>'
records=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    for d in ['a','b','c']:
        for surface in ['home','results']:
            palette={'a':'linen-rust','b':'paper-cobalt','c':'chalk-citron'}[d]
            if surface=='home':
                title={'a':'Find the clothes<br>you have in mind.','b':'Different stores.<br>One search.','c':'Describe it.<br>Find your next thing.'}[d]
                content=header+'<main><section class="hero"><div><div class="eyebrow">Clothing search, in your own words</div><h1>'+title+'</h1><p class="lead">A colour, a feeling, a budget. Tell Weft what you’re looking for and explore clothes from different stores.</p>'+search()+'<div class="examples"><button>Black wool coat ↗</button><button>Everyday knitwear ↗</button></div></div><div class="hero-photos"><figure><img alt="Cotton shirt" src="'+BASE+'/demo-products/product-01.webp"><figcaption>Easy layers · Store 01</figcaption></figure><figure><img alt="Olive overshirt" src="'+BASE+'/demo-products/product-03.webp"><figcaption>Olive utility · Store 03</figcaption></figure></div></section>'+categories+'<div class="section-head"><h2>A place to start</h2><span class="link">Explore all clothing →</span></div><div class="grid">'+''.join(card(x) for x in products[:8])+'</div></main>'
            else:
                content=header+'<main><div class="result-title"><h1>Your search, a little closer.</h1><span class="caption">13 pieces to explore</span></div>'+search('black')+refine+'<div class="catalog-body">'+sidebar+'<div class="grid">'+''.join(card(x) for x in products if x['color']=='black')+'</div></div><div class="bottom-bar"><button>☷ Filters</button><button>Sort: relevance</button></div></main>'
            path=ROOT/f'{d}-{surface}.html'
            path.write_text(document(content,d,palette),encoding='utf-8')
            for device,width,height in [('desktop',1440,1000),('mobile',390,844)]:
                page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
                page.goto(path.resolve().as_uri(),wait_until='networkidle')
                page.screenshot(path=str(ROOT/f'{d}-{surface}-{device}.png'))
                records.append({'file':f'{d}-{surface}-{device}.png','viewport':[width,height],'data':'same bundled CSV; all black records for results; first8 for home','direction':d})
                page.close()
    for name,palette in palettes.items():
        block='<main><h1>'+name+'</h1>'+search()+refine+'<button class="primary">Search</button> <button>View details</button><p class="error">We couldn’t load the results. <button>Try again</button></p><div class="grid">'+''.join(card(products[i]) for i in [1,0,2,4])+'</div><div class="sheet-demo"><h2>Filters</h2><label>Maximum price (€)<input value="150"></label><label>Store<select><option>All stores</option></select></label><button>Cancel</button> <button class="primary">Apply filters</button></div></main>'
        file=ROOT/f'palette-{name}.html';file.write_text(document(block,palette=name),encoding='utf-8')
        page=browser.new_page(viewport={'width':1280,'height':1200})
        page.goto(file.resolve().as_uri(),wait_until='networkidle');page.screenshot(path=str(ROOT/f'palette-{name}.png'),full_page=True);page.close()
    typography='<main><h1>Typography · EN / LT</h1>'
    for family in ['Georgia,serif',"'Syne',Arial,sans-serif",'Arial,sans-serif']:
        typography+=f'<section class="palette-specimen"><h2 style="font-family:{family}">Find the clothes you have in mind.</h2><h2 style="font-family:{family}">Rask drabužius, kurių ieškai.</h2><p>Ą Č Ę Ė Į Š Ų Ū Ž · ą č ę ė į š ų ū ž</p>'+search('Juodas vilnonis paltas iki 150 €')+'<p>Stone Relaxed Cotton Shirt · €29.99 · Store 01</p></section>'
    file=ROOT/'typography.html';file.write_text(document(typography+'</main>'),encoding='utf-8')
    page=browser.new_page(viewport={'width':1280,'height':1000});page.goto(file.resolve().as_uri(),wait_until='networkidle');page.screenshot(path=str(ROOT/'typography.png'));browser.close()
(ROOT/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(f'Generated {len(records)} concept views, five palette sheets and typography comparison in {ROOT}')
