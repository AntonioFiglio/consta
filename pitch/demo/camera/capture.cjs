const {webkit}=require(process.env.CONSTA_PLAYWRIGHT_MODULE || '/Users/matheusbgodoi/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const {createServer}=require('node:http');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root=process.cwd(),dist=path.join(root,'apps/crm/dist');
 const server=createServer((req,res)=>{let file=path.join(dist,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(dist,'index.html');res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':'text/html');res.end(fs.readFileSync(file));}).listen(0,'127.0.0.1');
 await new Promise(r=>server.on('listening',r));
 const browser=await webkit.launch({headless:true,executablePath:process.env.CONSTA_WEBKIT_EXECUTABLE || '/Users/matheusbgodoi/Library/Caches/ms-playwright/webkit-2370/pw_run.sh'});
 try{
 const page=await browser.newPage({viewport:{width:393,height:690},deviceScaleFactor:2});page.setDefaultTimeout(8000);let received=false;const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log(e.message)});
 await page.route('**/api/**',route=>route.fulfill({json:route.request().url().includes('/captures/')?{photosSubmitted:received,rows:[{key:'demo',name:'Autoclave 01',patrimony:received?'CST0001':null,readAt:received?'2026-11-07T11:00:00Z':null}]}:route.request().url().endsWith('/config')?{authenticated:true}:[]}));
 await page.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[{stop(){}}],getVideoTracks:()=>[{}]});Object.defineProperty(HTMLMediaElement.prototype,'srcObject',{set(){},get(){return null},configurable:true});Object.defineProperty(HTMLVideoElement.prototype,'videoWidth',{get(){return 500}});HTMLMediaElement.prototype.play=function(){queueMicrotask(()=>this.onplaying?.());return Promise.resolve()};});
 await page.goto('http://127.0.0.1:'+server.address().port+'/captura/'+'a'.repeat(64));
 await page.getByRole('button',{name:'Fotografar',exact:true}).click();await page.getByRole('button',{name:'Tirar foto',exact:true}).waitFor();
 // Only the camera pixels are synthetic. The surrounding DOM/styles are the actual CRM.
 const photo=fs.readFileSync('pitch/demo/camera/etiqueta-patrimonial-realista.png').toString('base64');
 await page.locator('video').evaluate((video,photo)=>{const image=document.createElement('img');image.src='data:image/png;base64,'+photo;image.alt='Fotografia gerada de etiqueta patrimonial sintética CST0001';image.style.cssText='display:block;width:100%;min-height:240px;aspect-ratio:4/3;object-fit:cover;border-radius:8px';video.replaceWith(image);},photo);
 await page.evaluate(()=>document.fonts.ready);await page.locator('.capture-camera img').evaluate(image=>image.decode());
 const out='pitch/demo/camera';fs.mkdirSync(out,{recursive:true});
 // Capture the real mobile scroll position with the shutter fully visible.
 await page.getByRole('button',{name:'Tirar foto',exact:true}).scrollIntoViewIfNeeded();
 const shoot=await page.getByRole('button',{name:'Tirar foto',exact:true}).boundingBox();
 await page.screenshot({path:out+'/framing.png'});
 received=true;await page.reload();await page.getByText('CST0001',{exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/received.png'});
 fs.writeFileSync(out+'/capture-result.json',JSON.stringify({source:'apps/crm/src/CapturePage.tsx',commit:'7e0f502',viewport:{width:393,height:690},deviceScaleFactor:2,shoot,simulation:true,physicalCamera:false,realOCR:false,pageErrors:errors},null,2)+'\n');
 console.log(JSON.stringify({shoot,errors}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
