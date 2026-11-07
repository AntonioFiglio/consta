// Browser integration checks. Requires a locally installed Playwright + WebKit.
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const fs = require('node:fs');
const {webkit} = require(process.env.CONSTA_PLAYWRIGHT_MODULE || 'playwright');

(async () => {
 const browser = await webkit.launch({headless:true,...(process.env.CONSTA_WEBKIT_EXECUTABLE ? {executablePath:process.env.CONSTA_WEBKIT_EXECUTABLE}: {})});
 const output = process.env.CONSTA_QA_OUTPUT;
 if (output) fs.mkdirSync(output,{recursive:true});
 const url=pathToFileURL(path.resolve(__dirname,'../pitch/deck.html')).href;
 try {
  for (const viewport of [{width:1920,height:1080},{width:1280,height:720},{width:1024,height:768}]) {
   const page = await browser.newPage({viewport,offline:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.waitForTimeout(1100);
   assert(await page.evaluate(()=>Boolean(window.constaPitch)), 'Missing approved presentation navigation API');
   const start=await page.evaluate(()=>constaPitch.getState());
   assert.equal(start.beat,0);assert.equal(start.scene,'cover');assert(start.total>5);
   const order=[0,1,4,5,16,8,9,10,11,13,14,15,19,20,21,22];
   const states=new Map();const scenes=[];const mapBeats=[];
   for(const i of order) {
    await page.evaluate(n=>constaPitch.goTo(n),i);await page.waitForTimeout(1100);
    const state=await page.evaluate(()=>constaPitch.getState());assert.equal(state.beat,i);states.set(i,state);
    if(scenes.at(-1)!==state.scene)scenes.push(state.scene);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert(!overflow,`Horizontal overflow: ${viewport.width}, beat ${i}`);
    const images=await page.locator('img').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none').map(e=>({src:e.getAttribute('src'),ok:e.complete&&e.naturalWidth>0})));
    assert(images.every(x=>x.ok),JSON.stringify(images.filter(x=>!x.ok)));
    // A visible map must never lose the synthetic-data label, including its live DOM state.
    const simulation=await page.evaluate(()=>{
     const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none'&&Number(getComputedStyle(e).opacity)>0;};
     const maps=[...document.querySelectorAll('[data-simulated-map],.demo-map,.hospital-map,.mp-map')].filter(e=>visible(e)&&e.closest('[data-layer]')?.getAttribute('aria-hidden')!=='true');
     return {maps:maps.length,label:[...document.querySelectorAll('body *')].some(e=>e.childElementCount===0&&/RASTREAMENTO SIMULADO/i.test(e.textContent)&&visible(e))};
    });
    if(simulation.maps)assert(simulation.label,`Map without simulation label at beat ${i}`);
    const mapActive=await page.locator('[data-layer="map"]').getAttribute('aria-hidden');
    if(mapActive==='false'){assert(simulation.maps>0,`Active map was not inspected at beat ${i}`);mapBeats.push(i);}
    if(output)await page.screenshot({path:path.join(output,`pitch-${viewport.width}-${i}.png`)});
   }
   assert.deepEqual(scenes,['cover','news','cost','gap','solution','benefits','team','cta','business']);
   for(const i of [...order].reverse()) {
    await page.evaluate(n=>constaPitch.goTo(n),i);await page.waitForTimeout(20);
    assert.deepEqual(await page.evaluate(()=>constaPitch.getState()),states.get(i));
   }
   await page.evaluate(()=>constaPitch.goTo(0));await page.waitForTimeout(1100);
   await page.keyboard.press('PageDown');await page.waitForTimeout(1100);
   assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,1);
   await page.keyboard.press('PageUp');await page.waitForTimeout(1100);
   assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,0);
   await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'PageDown',repeat:true,bubbles:true})));
   assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,0,'Auto-repeat changed the beat');
   const next=page.getByRole('button',{name:/próximo/i}).first();await next.focus();await page.keyboard.press('PageDown');await page.waitForTimeout(1100);
   assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,1,'Focused control blocked presenter');
   await page.evaluate(()=>{constaPitch.next();constaPitch.prev();constaPitch.goTo(0)});await page.waitForTimeout(1100);
   assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,0);
   const mapBeat=mapBeats[0];
   assert(mapBeat>=0,'Missing map reversal scenario');
   await page.evaluate(n=>constaPitch.goTo(n),mapBeat);await page.waitForTimeout(1000);
   await page.evaluate(()=>constaPitch.next());await page.waitForTimeout(300);
   // Freeze the sampled frame: layout reads can advance a running WebKit
   // timeline between the two measurements. Keep the position assertion strict.
   await page.locator('#marker').evaluate(marker=>marker.getAnimations().forEach(animation=>animation.pause()));
   await page.waitForTimeout(40);
   const reversal=await page.evaluate(()=>{
    const position=()=>{const m=new DOMMatrixReadOnly(getComputedStyle(document.getElementById('marker')).transform);return {x:m.m41,y:m.m42};};
    const before=position();constaPitch.prev();return {before,after:position()};
   });
   assert(Math.abs(reversal.before.x-reversal.after.x)<2&&Math.abs(reversal.before.y-reversal.after.y)<2,`Map teleported on in-flight reversal at ${viewport.width}: ${JSON.stringify(reversal)}`);
   await page.waitForTimeout(1600);
   assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,mapBeat);
   assert.match(await page.locator('#sector-value').textContent(),/Setor A/);
   assert.deepEqual(errors,[]);await page.close();
  }
  const page=await browser.newPage({viewport:{width:1280,height:720},offline:true,reducedMotion:'reduce'});
  await page.goto(url);await page.waitForTimeout(200);await page.keyboard.press('PageDown');await page.waitForTimeout(200);
  assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,1,'Reduced motion navigation failed');
  await page.close();console.log('PASS: ordered scenes, all beats, reverse states, clicker keys/focus/repeat, offline assets, simulated map labels and reduced motion.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
