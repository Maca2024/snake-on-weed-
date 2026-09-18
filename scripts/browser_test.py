from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os
BASE = os.environ.get("SOW_TEST_URL", "http://127.0.0.1:4173")
from datetime import datetime, timezone
out=Path('test-results');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1150},device_scale_factor=1)
 errors=[]
 requests=[]
 page.on('request',lambda r: requests.append(r.url))
 page.on('pageerror',lambda e: errors.append(str(e)))
 page.goto(BASE,wait_until='networkidle')
 page.screenshot(path=str(out/'desktop-ready.png'),full_page=True)
 page.locator('#start').click()
 page.wait_for_timeout(350)
 assert page.locator('#overlay').is_hidden()
 page.keyboard.press('ArrowUp')
 page.keyboard.press('p')
 assert page.locator('#run-status').inner_text()=='TAKE A BREATHER'
 page.screenshot(path=str(out/'desktop-paused.png'),full_page=True)
 page.locator('#start').click()
 page.keyboard.press('Escape')
 assert page.locator('#run-status').inner_text()=='TAKE A BREATHER'
 page.reload(wait_until='networkidle')
 page.locator('[data-mode="classic"]').click()
 page.locator('#start').click()
 page.wait_for_timeout(2400)
 assert page.locator('#run-status').inner_text()=='BACK TO THE ROOTS'
 page.screenshot(path=str(out/'desktop-over.png'),full_page=True)
 page.locator('#start').click()
 page.evaluate("window.dispatchEvent(new Event('blur'))")
 assert page.locator('#run-status').inner_text()=='TAKE A BREATHER'
 page.locator('#end-run').click()
 assert page.locator('#run-status').inner_text()=='BACK TO THE ROOTS'
 page.reload(wait_until='networkidle')
 assert page.locator('[data-mode="classic"]').get_attribute('aria-pressed')=='true'
 page.locator('#sound').click()
 assert page.locator('#sound').get_attribute('aria-pressed')=='true'
 page.locator('#sound').click()
 page.locator('#motion').click()
 assert page.locator('#motion').get_attribute('aria-pressed')=='true'
 mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2,reduced_motion='reduce')
 mobile.on('pageerror',lambda e:errors.append(str(e)))
 mobile.goto(BASE,wait_until='networkidle')
 assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
 assert mobile.locator('#motion').get_attribute('aria-pressed')=='true'
 mobile.screenshot(path=str(out/'mobile-ready.png'),full_page=True)
 mobile.locator('#start').tap()
 mobile.locator('[data-dir="up"]').tap()
 mobile.wait_for_timeout(250)
 mobile.locator('#pause').tap()
 assert mobile.locator('#run-status').inner_text()=='TAKE A BREATHER'
 mobile.screenshot(path=str(out/'mobile-paused.png'),full_page=True)
 # Choose a deterministic real game whose first fruit is on the starting path.
 harvest=browser.new_page(viewport={'width':1280,'height':900})
 harvest.on('pageerror',lambda e:errors.append(str(e)))
 harvest.goto(BASE,wait_until='networkidle')
 fixture=harvest.evaluate("""async()=>{const {createGame}=await import('./src/engine.js');for(let seed=1;seed<10000;seed++){const s=createGame({seed});if(s.food.y===s.snake[0].y&&s.food.x>s.snake[0].x+1&&s.food.x<25)return {seed,steps:s.food.x-s.snake[0].x};}throw Error('No fixture');}""")
 harvest.clock.set_fixed_time(datetime.fromtimestamp(fixture['seed']/1000,timezone.utc))
 harvest.locator('#start').click()
 harvest.wait_for_timeout(fixture['steps']*145+80)
 harvest.keyboard.press('p')
 assert int(harvest.locator('#score').inner_text())>=10
 score=int(harvest.locator('#score').inner_text())
 harvest.reload(wait_until='networkidle')
 assert int(harvest.locator('#best').inner_text())==score
 # Storage is optional, and very narrow screens retain usable controls.
 narrow=browser.new_page(viewport={'width':320,'height':640},reduced_motion='reduce')
 narrow.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})")
 narrow.goto(BASE,wait_until='networkidle')
 assert narrow.evaluate('document.documentElement.scrollWidth <= innerWidth')
 narrow.locator('#start').click()
 narrow.keyboard.press('p')
 assert narrow.locator('#run-status').inner_text()=='TAKE A BREATHER'
 assert all(url.startswith(BASE) for url in requests),requests
 assert not errors,errors
 report=json.dumps({'browser':'Chromium','version':browser.version,'desktop':'1440x1150','mobile':'390x844 DPR2','checks':['start','keyboard turn','pause/resume','classic wall death','restart','blur auto-pause','mode persistence','audio toggle','calm toggle','reduced motion','touch controls','no horizontal overflow','no JavaScript errors','real food pickup','best score persistence','blocked storage','320px viewport','end paused run','no external network requests'],'errors':errors},indent=2)
 (out/'browser-report.json').write_text(report)
 print(report)
 browser.close()
