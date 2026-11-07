/** Real CRM interface capture with explicitly simulated extraction, isolated in RAM. */
import {createServer} from 'node:http';
import {once} from 'node:events';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createApp} from '../../../apps/crm/server/app.ts';
const directory=dirname(fileURLToPath(import.meta.url));
const root=resolve(directory,'../../..');
const require=createRequire(import.meta.url);
const {webkit}=require(process.env.CONSTA_PLAYWRIGHT_MODULE || '/Users/matheusbgodoi/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const source=readFileSync(resolve(root,'pitch/demo/synthetic-contract.txt'),'utf8');
const blocks=source.split(/UNIDADE \d{2}\n/).slice(1);
assert.equal(blocks.length,5);
const fixture={version:2,equipments:blocks.map(block=>{
 const line=(label:string)=>{const found=block.split('\n').find(text=>text.startsWith(label+': '));assert(found,`Missing documented field ${label}`);return found!;};
 const field=(label:string,value?:string)=>{const quote=line(label);return {value:value??quote.slice(label.length+2),status:'found',page:null,quote};};
 return {equipment:field('Equipamento'),brand:field('Marca'),model:field('Modelo'),serial:field('Número de série'),patrimony:field('Número de tombamento'),sector:field('Setor'),maintenanceCompany:field('Empresa de manutenção'),maintenancePhone:field('Telefone da manutenção'),maintenanceEmail:field('E-mail da manutenção'),notes:field('Observações'),quantity:field('Quantidade'),periodValue:field('Periodicidade preventiva','90'),periodUnit:field('Periodicidade preventiva','days'),firstDueDate:field('Primeiro vencimento preventivo','2027-02-05'),anchorType:field('Marco de manutenção'),anchorDate:field('Data do marco','2026-11-07'),validFrom:field('Início da vigência','2026-11-07'),validUntil:field('Fim da vigência','2027-11-06'),warnings:[]};
}),warnings:[]};
writeFileSync(resolve(directory,'fixture-extraction-v2.json'),JSON.stringify(fixture,null,2)+'\n');
let mockCalls=0;
const mock=createServer(async(req,res)=>{if(req.url!='/v1/responses'){res.writeHead(404);res.end();return;}let body='';for await(const chunk of req)body+=chunk;const input=JSON.parse(body);assert.equal(input.model,'SIMULACAO-LOCAL-SEM-IA');assert.equal(input.store,false);mockCalls++;await new Promise(r=>setTimeout(r,1200));res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({id:'resp_simulation',object:'response',created_at:1,status:'completed',model:'SIMULACAO-LOCAL-SEM-IA',output:[{type:'message',id:'msg_simulation',role:'assistant',status:'completed',content:[{type:'output_text',text:JSON.stringify(fixture),annotations:[]}]}]}));}).listen(0,'127.0.0.1');
await once(mock,'listening');
process.env.OPENAI_API_KEY='SIMULATED-KEY-NOT-A-CREDENTIAL';
process.env.OPENAI_MODEL='SIMULACAO-LOCAL-SEM-IA';
process.env.OPENAI_BASE_URL=`http://127.0.0.1:${(mock.address() as any).port}/v1`;
const running=createApp({database:':memory:',seed:false,staticDirectory:resolve(root,'apps/crm/dist')});
const server=running.app.listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${(server.address() as any).port}`;
const browser=await webkit.launch({headless:true,executablePath:process.env.CONSTA_WEBKIT_EXECUTABLE||'/Users/matheusbgodoi/Library/Caches/ms-playwright/webkit-2370/pw_run.sh'});
const deviceScaleFactor=Number(process.env.CONSTA_CAPTURE_SCALE || '2');
assert(Number.isFinite(deviceScaleFactor)&&deviceScaleFactor>0&&deviceScaleFactor<=3,'CONSTA_CAPTURE_SCALE must be positive and at most 3');
const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor,...(process.env.CONSTA_CAPTURE_VIDEO==='1'?{recordVideo:{dir:directory,size:{width:1920,height:1080}}}:{})});
await context.addInitScript(()=>{document.addEventListener('DOMContentLoaded',()=>{const label=document.createElement('div');label.id='capture-simulation-label';label.textContent='Demo simulada · interface real';Object.assign(label.style,{position:'fixed',bottom:'12px',left:'16px',padding:'9px 14px',background:'#0a0a0a',color:'#fafaf9',font:'600 14px Inter, sans-serif',letterSpacing:'.035em',zIndex:'2147483647',pointerEvents:'none',borderLeft:'3px solid #f97316',borderRadius:'4px'});document.body.append(label); const cursor=document.createElement('div'); Object.assign(cursor.style,{position:'fixed',width:'22px',height:'22px',borderRadius:'50%',border:'3px solid #f97316',background:'#f9731630',left:'-40px',top:'-40px',zIndex:'2147483646',pointerEvents:'none'}); document.body.append(cursor); document.addEventListener('pointermove',e=>{cursor.style.left=(e.clientX-11)+'px';cursor.style.top=(e.clientY-11)+'px';});});});
const page=await context.newPage();const video=page.video();const errors:string[]=[];page.on('pageerror',(e:any)=>errors.push(e.message));
const actions:any[]=[];
const screenshots:any[]=[];
async function click(name:string){const target=page.getByRole('button',{name,exact:true}); const box=await target.boundingBox(); actions.push({action:name,box}); if(box)await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:24}); await page.waitForTimeout(250); await target.click();}
const snapshots:Record<string,string>={};
async function shot(name:string){
 snapshots[name]=await page.evaluate(()=>{
 const root=document.createElement('div');
 for(const child of document.body.children) if(child.id==='root'||child.tagName==='DIALOG'||child.hasAttribute('data-floating-ui-portal')) root.append(child.cloneNode(true));
 const originals=Array.from(document.querySelectorAll('input,textarea,select'));
 root.querySelectorAll('input,textarea,select').forEach((node:any,index)=>{const original:any=originals[index];if(!original)return;if(node.type==='file'){node.removeAttribute('value');return;}node.setAttribute('value',original.value);if(node.tagName==='TEXTAREA')node.textContent=original.value;if(node.tagName==='SELECT')node.querySelectorAll('option').forEach((option:any)=>option.toggleAttribute('selected',option.value===original.value));});
 root.querySelectorAll('script').forEach(e=>e.remove());
 return root.innerHTML;
 });
}

try{
 await page.goto(base+'/equipamentos');await page.waitForTimeout(800);await shot('01-empty-inventory');
 await click('Enviar contrato');await page.waitForTimeout(500);await shot('02-upload');
 await page.locator('input[type=file]').first().setInputFiles(resolve(root,'pitch/demo/synthetic-contract.txt'));
 await page.waitForTimeout(600);await shot('03-document-selected');
 await click('Continuar');await page.waitForTimeout(250);await shot('04-processing-simulated');
 await page.getByRole('button',{name:'Confirmar e salvar',exact:true}).waitFor({timeout:15000});await page.waitForTimeout(700);await shot('05-review-five-units');
 const reviewFields=await page.locator('input').evaluateAll((inputs:any[])=>inputs.map(i=>({label:i.getAttribute('aria-label'),value:i.value,box:{x:i.getBoundingClientRect().x,y:i.getBoundingClientRect().y,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height}}))); writeFileSync(resolve(directory,'capture-actions.json'),JSON.stringify({viewport:{width:1920,height:1080},deviceScaleFactor,coordinateSpace:'logical CSS pixels',actions,reviewFields},null,2));
 const dateValues=await page.locator('input[type=date]').evaluateAll((inputs:any[])=>inputs.map(i=>i.value)); assert(dateValues.length===5&&dateValues.every((v:string)=>v==='2027-02-05'));
 const scrolling=page.locator('.equipment-editor-scroll'); if(await scrolling.count()) {await scrolling.evaluate((e:any)=>e.scrollTop=e.scrollHeight);await shot('05b-review-last-units');}
 await page.locator('.equipment-editor-scroll').evaluate((e:any)=>e.scrollTop=0);
 await page.getByRole('button',{name:/Configurações avançadas de/}).first().click();await page.waitForTimeout(100);await shot('05d-identity');await page.getByRole('tab',{name:'Contrato',exact:true}).click();await shot('05e-coverage');await page.getByRole('tab',{name:'Dados da IA',exact:true}).click();await page.waitForTimeout(500);await shot('05c-evidence-page-two');await page.getByRole('button',{name:'Concluir edição',exact:true}).click();
 await click('Confirmar e salvar');await page.waitForTimeout(4000);await shot('06-inventory-five-units');
 writeFileSync(resolve(directory,'capture-actions.json'),JSON.stringify({viewport:{width:1920,height:1080},deviceScaleFactor,coordinateSpace:'logical CSS pixels',actions,reviewFields},null,2));
 const assets=await(await fetch(base+'/api/assets')).json();assert.equal(assets.length,5);
 assert(assets.every((a:any)=>a.periodValue===90&&a.periodUnit==='days'&&a.firstDueDate==='2027-02-05'&&a.reviewed===true&&a.validFrom==='2026-11-07'&&a.validUntil==='2027-11-06'&&a.maintenanceCompany==='Assistência Demo Ltda.'&&a.maintenanceEmail==='assistencia@example.test'&&a.sector==='CME demonstradora'));
 const events=await(await fetch(base+'/api/events?from=2027-02-01&to=2027-02-28')).json();
 assert.equal(events.length,5);assert(events.every((e:any)=>e.date==='2027-02-05'));
 const attentionRows=await page.locator('.equipment-needs-attention').count();assert.equal(attentionRows,0);
 assert.equal(mockCalls,1);assert.deepEqual(errors,[]);
 writeFileSync(resolve(directory,'capture-result.json'),JSON.stringify({status:'captured',source:'pitch/demo/synthetic-contract.txt',sourceKind:'entirely-synthetic',viewport:{width:1920,height:1080},deviceScaleFactor,simulation:true,realExternalAI:false,database:':memory:',mockCalls,assetCount:assets.length,attentionRows,reviewAction:'Confirmar e salvar — real UI sends reviewed:true for complete schedule',assets:assets.map((a:any)=>({name:a.name,brand:a.brand,model:a.model,serial:a.serial,patrimony:a.patrimony,sector:a.sector,maintenanceCompany:a.maintenanceCompany,maintenancePhone:a.maintenancePhone,maintenanceEmail:a.maintenanceEmail,notes:a.notes,periodValue:a.periodValue,periodUnit:a.periodUnit,firstDueDate:a.firstDueDate,anchorDate:a.anchorDate,anchorType:a.anchorType,validFrom:a.validFrom,validUntil:a.validUntil,reviewed:a.reviewed,coverages:a.coverages})),maintenanceForecasts:events,pageErrors:errors,dateValuesBeforeSave:dateValues},null,2)+'\n');
 writeFileSync(resolve(directory,'snapshots.json'),JSON.stringify(snapshots));
}catch(error){writeFileSync('/tmp/consta-synthetic-capture-error.html',await page.content());console.log(JSON.stringify({mockCalls,errors,uiErrors:await page.locator('.error-message').allTextContents(),body:await page.locator('body').innerText()}));throw error;}finally{await context.close();if(video){await video.saveAs(resolve(directory,'current-real-crm-simulated.webm'));const temporaryVideo=await video.path();const {unlinkSync}=await import('node:fs');unlinkSync(temporaryVideo);}await browser.close();await new Promise<void>(r=>server.close(()=>r()));running.store.close();await new Promise<void>(r=>mock.close(()=>r()));}
