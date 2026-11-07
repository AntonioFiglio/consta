// Exercises visible slide adjacency, including legacy beat gaps and marker handoffs.
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {webkit} = require(process.env.CONSTA_PLAYWRIGHT_MODULE || 'playwright');
const order = [0,1,4,5,16,8,9,10,11,13,14,15,19,20,21,22];
function transition(direction) {
  const dot = document.querySelector('#hero-dot');
  const marker = document.querySelector('#marker');
  const point = element => {const r = element.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};};
  const from = constaPitch.getState().beat;
  const before = point([14,15].includes(from) && getComputedStyle(marker).visibility !== 'hidden' ? marker : dot);
  constaPitch[direction]();
  const to = constaPitch.getState().beat;
  const mapStep = [14,15].includes(from) && [14,15].includes(to) && getComputedStyle(marker).visibility !== 'hidden';
  const after = point(mapStep ? marker : dot);
  return {from,to,before,after,mapStep,phase:document.querySelector('#hero-wire').dataset.phase,hidden:dot.classList.contains('hero-hidden')};
}
(async()=>{
 const browser = await webkit.launch({headless:true,...(process.env.CONSTA_WEBKIT_EXECUTABLE?{executablePath:process.env.CONSTA_WEBKIT_EXECUTABLE}:{})});
 try {
  for(const viewport of [{width:1920,height:1080},{width:1280,height:720},{width:1024,height:768}]) {
   const page = await browser.newPage({viewport,offline:true});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../pitch/deck.html')).href);
   await page.evaluate(()=>document.fonts.ready);
   async function settle(){await page.waitForFunction(()=>document.querySelector('#hero-wire').dataset.phase==='idle',null,{timeout:12000});await page.waitForTimeout(100);}
   for(const direction of ['next','prev']) {
    const route=direction==='next'?order:order.toReversed();
    for(let i=0;i<route.length-1;i++) {
     await page.evaluate(b=>constaPitch.goTo(b,{instant:true}),route[i]);await settle();
     const result=await page.evaluate(transition,direction);
     assert.equal(result.to,route[i+1]);
     assert(Math.hypot(result.before.x-result.after.x,result.before.y-result.after.y)<2,`Point teleported: ${JSON.stringify(result)}`);
     if(!result.mapStep) {assert.notEqual(result.phase,'idle',`No continuation: ${JSON.stringify(result)}`);assert(!result.hidden,`Hidden continuity point: ${JSON.stringify(result)}`);}
     await settle();
     if([14,15].includes(result.to)) assert.equal(await page.locator('#marker').evaluate(e=>getComputedStyle(e).visibility),'visible','Map marker did not receive guide');
    }
   }
   // The camera reframes asynchronously; the handoff must use its final position.
   await page.evaluate(()=>constaPitch.goTo(13,{instant:true}));await page.evaluate(()=>constaPitch.next());await settle();
   const handoff=await page.evaluate(()=>{
    const a=document.querySelector('#hero-dot').getBoundingClientRect(),b=document.querySelector('#marker').getBoundingClientRect();
    return Math.hypot(a.left+a.width/2-b.left-b.width/2,a.top+a.height/2-b.top-b.height/2);
   });
   assert(handoff<2,'Map guide used a stale pre-camera endpoint');
   for(const action of ['prev','next']) {
    await page.evaluate(()=>constaPitch.goTo(13,{instant:true}));await page.evaluate(()=>constaPitch.next());await page.waitForTimeout(120);
    const result=await page.evaluate(transition,action);
    assert(Math.hypot(result.before.x-result.after.x,result.before.y-result.after.y)<2,'Interrupted map arrival jumped');
    await settle();
   }
   // Interrupt the single-slide morph and advance from the actual presented point.
   await page.evaluate(()=>constaPitch.goTo(5,{instant:true}));await page.evaluate(()=>constaPitch.next());await page.waitForTimeout(900);
   const interrupted=await page.evaluate(transition,'next');
   assert.equal(interrupted.to,8);
   assert(Math.hypot(interrupted.before.x-interrupted.after.x,interrupted.before.y-interrupted.after.y)<2,'Interrupted flow jumped to its final point');
   await page.evaluate(()=>constaPitch.goTo(18));assert.equal((await page.evaluate(()=>constaPitch.getState())).beat,19,'Removed impact deep link broke');
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: visible forward/reverse adjacency, logo interruption, map handoff and removed-impact alias at three viewports.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
