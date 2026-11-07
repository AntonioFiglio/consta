// Captures complete native deck states without changing the live presentation.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {webkit}=require(process.env.CONSTA_PLAYWRIGHT_MODULE||'/Users/matheusbgodoi/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const root=path.resolve(__dirname,'../..'),output=path.join(root,'pitch/entrega');
const pages=[
 {beat:0,title:'Capa'}, {beat:1,title:'Problema — notícias brasileiras'},
 {beat:4,title:'Problema — paciente e gestor'}, {beat:5,title:'A informação na gaveta do gestor',drawer:true},
 {beat:16,title:'Solução — contrato, IA, revisão e gestão'},
 {beat:8,title:'Demo 1 — contrato enviado'}, {beat:9,title:'Demo 2 — conferência dos cinco equipamentos'},
 {beat:9,title:'Demo 3 — identidade do equipamento',native:'05d-identity',caption:'Identidade: série, modelo, fabricante e tombamento.'},
 {beat:9,title:'Demo 4 — contrato, empresa e contatos',native:'05e-coverage',caption:'Empresa, contatos e vigência preenchidos.'},
 {beat:10,title:'Demo 5 — inventário e previsões de manutenção'},
 {beat:11,title:'Smart Agenda 2 — calendário completo e carga distribuída',agenda:'distributed'},
 {beat:13,title:'Solução — etiqueta BLE'},
 {beat:15,title:'Localização simulada — atualização e evidência do HC'},
 {beat:19,title:'Impacto — risco, pacientes e receita potencial'},
 {beat:20,title:'Time'}, {beat:21,title:'Conheça o Consta — QR code'},
 {beat:22,title:'Modelo de negócio — apoio à banca'}
];
function collect(){
 const stage=document.querySelector('#stage'),sr=stage.getBoundingClientRect(),layer=stage.querySelector('.layer.is-active');
 const visible=e=>{for(let n=e;n&&n!==document;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)<.1)return false;}return true;};
 const texts=[],links=[];
 function visit(host,ox=0,oy=0){
  const doc=host.ownerDocument,walker=doc.createTreeWalker(host,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const n=walker.currentNode,e=n.parentElement,t=n.textContent.replace(/\s+/g,' ').trim();
   if(!t||!e||e.closest('.anchor,script,style,[aria-hidden="true"]')||!visible(e))continue;
   const range=doc.createRange();range.selectNodeContents(n);const r=range.getBoundingClientRect();
   if(!r.width||!r.height)continue;
   const box=[r.left+ox-sr.left,r.top+oy-sr.top,r.right+ox-sr.left,r.bottom+oy-sr.top];
   if(box[0]<-2||box[1]<-2||box[2]>1922||box[3]>1082)continue;
   texts.push({text:t,box,size:parseFloat(getComputedStyle(e).fontSize)});
  }
  for(const a of host.querySelectorAll('a[href]')){if(!visible(a))continue;const r=a.getBoundingClientRect();if(!r.width||!r.height)continue;links.push({href:a.getAttribute('href'),box:[r.left+ox-sr.left,r.top+oy-sr.top,r.right+ox-sr.left,r.bottom+oy-sr.top]});}
 }
 visit(layer);
 if(layer.matches('.product-demo')){const f=layer.querySelector('iframe'),r=f.getBoundingClientRect();visit(f.contentDocument.body,r.left,r.top);}
 return {texts,links,layer:layer.dataset.layer,flow:layer.dataset.flowPhase,agenda:layer.dataset.agendaState,demo:layer.dataset.demoState};
}
(async()=>{
 fs.mkdirSync(path.join(output,'quadros'),{recursive:true});
 const browser=await webkit.launch({headless:true,executablePath:process.env.CONSTA_WEBKIT_EXECUTABLE||'/Users/matheusbgodoi/Library/Caches/ms-playwright/webkit-2370/pw_run.sh'});
 const manifest=[];const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2,reducedMotion:'reduce',offline:true});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,'pitch/deck.html')).href);await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>window.constaProductDemo?.getState());
  await page.addStyleTag({content:`
   *,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important;}
   .controls,.cv-hint,.im-zoom-control,.pd-cursor,.pd-focus,.flow-details{display:none!important;}
   .pdf-page-index{position:absolute;right:44px;bottom:22px;z-index:60;font:400 17px/1.2 var(--mono);color:#78716c;}
   body[data-theme="dark"] .pdf-page-index{color:#a8a29e;}
   .stage.pdf-drawer[data-beat="5"] .layer-gap.is-active .drawer-papers{transform:translateY(80px) scale(.85)!important;opacity:1!important;}
   .stage.pdf-drawer[data-beat="5"] .layer-gap.is-active .drawer-front{transform:translateY(30px)!important;}
   .stage.pdf-drawer[data-beat="5"] .layer-gap.is-active .drawer-status{opacity:0!important;}
  `});
  for(const [i,spec] of pages.entries()){
   await page.evaluate(b=>constaPitch.goTo(b,{instant:true}),spec.beat);
   await page.waitForTimeout(120);
   await page.evaluate(({spec,index,total})=>{
    const stage=document.querySelector('#stage');stage.classList.toggle('pdf-drawer',!!spec.drawer);
    let counter=stage.querySelector('.pdf-page-index');if(!counter){counter=document.createElement('div');counter.className='pdf-page-index';stage.append(counter);}counter.textContent=`${String(index+1).padStart(2,'0')} / ${total}`;
    if([8,9,10].includes(spec.beat))window.constaProductDemo.finishCurrent();
    if(spec.native){const f=document.querySelector('.pd-native-frame'),d=f.contentDocument;d.body.innerHTML=window.constaNativeDemo.states[spec.native];d.querySelectorAll('dialog[open]').forEach(el=>{el.removeAttribute('open');el.showModal();d.activeElement?.blur();});document.querySelector('.pd-screen-caption').textContent=spec.caption;document.querySelector('.product-demo').dataset.demoState=spec.native;stage.focus({preventScroll:true});}
    if(spec.agenda){const h=document.querySelector('.layer-smart-agenda');h.classList.add('is-settled');h.classList.toggle('is-calendar',spec.agenda==='distributed');h.classList.toggle('is-distributed',spec.agenda==='distributed');h.dataset.agendaState=spec.agenda;}
   },{spec,index:i,total:pages.length});
   await page.waitForTimeout(120);
   await page.evaluate(async()=>{await document.fonts.ready;const f=document.querySelector('.layer.is-active iframe');if(f)await f.contentDocument.fonts.ready;});
   const state=await page.evaluate(collect);
   assert(state.texts.length>0,`Empty page ${spec.title}`);
   if(spec.beat===16)assert.equal(state.flow,'complete');
   if(spec.agenda==='distributed')assert.equal(await page.locator('.layer-smart-agenda.is-distributed .sa-tile').count(),20);
   if(spec.beat===10)assert.equal(await page.locator('.pd-native-frame').contentFrame().locator('.equipment-status-table tbody tr').count(),5);
   const file=`${String(i+1).padStart(2,'0')}-slide-${spec.beat}.png`;
   await page.locator('#stage').screenshot({path:path.join(output,'quadros',file),animations:'disabled'});
   manifest.push({...spec,file,...state});console.log(`Captured ${i+1}/${pages.length}: ${spec.title}`);
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(output,'manifesto.json'),JSON.stringify({format:'3840x2160 PNG, 16:9',pages:manifest,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
