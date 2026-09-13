"""Single-session lab observations (not CrUX/field INP), plus axe accessibility."""
import argparse
import json
import statistics
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--phase', required=True)
parser.add_argument('--base-url', default='http://127.0.0.1:3100')
args = parser.parse_args()
out = Path('.omx/artifacts/frontend') / args.phase
out.mkdir(parents=True, exist_ok=True)
observer = """window.lab={lcp:0,cls:0,longTasks:0};
new PerformanceObserver(l=>{for(const e of l.getEntries())window.lab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value}).observe({type:'layout-shift',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())window.lab.longTasks+=Math.max(0,e.duration-50)}).observe({type:'longtask',buffered:true});"""
report={'scope':'Local production, deterministic catalog/local search; fresh context each run; 4x CPU, 150ms network latency, 1.6Mbps down/750Kbps up. Observer approximations; CLS is raw summed shifts, longTasks is load blocking proxy, NOT field INP.','runs':[],'axe':[]}
with sync_playwright() as p:
    browser=p.chromium.launch()
    report['browser']=browser.version
    for route in ['/', '/search?query=black']:
        samples=[]
        for run in range(3):
            context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,reduced_motion='reduce')
            page=context.new_page();cdp=context.new_cdp_session(page)
            cdp.send('Network.enable');cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
            cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':150,'downloadThroughput':200000,'uploadThroughput':93750})
            cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
            page.add_init_script(observer)
            page.goto(args.base_url+route,wait_until='networkidle',timeout=60000)
            page.wait_for_timeout(1000)
            sample=page.evaluate('({...window.lab,bytes:performance.getEntriesByType("resource").reduce((n,r)=>n+r.transferSize,0),scripts:performance.getEntriesByType("resource").filter(r=>r.initiatorType==="script").reduce((n,r)=>n+r.encodedBodySize,0)})')
            samples.append(sample);context.close()
        report['runs'].append({'route':route,'samples':samples,'median':{key:statistics.median(x[key] for x in samples) for key in samples[0]}})
    for locale in ['en','lt']:
        for route in ['/', '/search?query=black', '/out/MOCK-001', '/account', '/stores']:
            context=browser.new_context(viewport={'width':390,'height':844})
            page=context.new_page();page.goto(args.base_url+route+('&' if '?' in route else '?')+'lang='+locale,wait_until='networkidle')
            page.add_script_tag(path='node_modules/axe-core/axe.min.js')
            result=page.evaluate('async()=>{const r=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),passes:r.passes.length,incomplete:r.incomplete.map(x=>x.id)}}')
            report['axe'].append({'route':route,'locale':locale,**result});context.close()
    browser.close()
(out/'metrics.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'medians':[{ 'route':r['route'],**r['median']} for r in report['runs']],'axeViolations':sum(len(r['violations']) for r in report['axe']),'report':str(out/'metrics.json')},indent=2))
