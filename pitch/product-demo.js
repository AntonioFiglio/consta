/* Astra-authored native HTML choreography. No video, network, audio or persistence.
 * Beat 8: overview → upload → choose PDF → selected file.
 * Beat 9: Continue → real review DOM → inspect all rows.
 * Beat 10: human Save → saved inventory.
 * One cancellable frame clock; the global pitch hero remains exclusively owned by motion.js.
 */
(() => {
  const stage = document.querySelector('.stage');
  const host = document.querySelector('.product-demo');
  if (!stage || !host) return;
  const frame = host.querySelector('.pd-native-frame');
  if (!frame) return;
  const cursor = host.querySelector('.pd-cursor');
  const picker = host.querySelector('.pd-file-picker');
  const focus = host.querySelector('.pd-focus');
  const caption = host.querySelector('.pd-screen-caption');
  picker.setAttribute('aria-hidden','true');
  picker.querySelectorAll('button').forEach(button => button.tabIndex = -1);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let documentUI, clock = 0, currentBeat = -1, ready = false, actions = [], index = 0;
  let scrollMotion = null, playback = null;
  const pointer = {x:350,y:400,fromX:350,fromY:400,toX:350,toY:400,started:0,duration:340,active:false};
  host.querySelector('.pd-screen').append(cursor);
  cursor.style.transition = 'none';
  const screen = host.querySelector('.pd-screen');
  const stateNames = {overview:'01-empty-inventory',upload:'02-upload',document:'03-document-selected',review:'05-review-five-units',identity:'05d-identity',coverage:'05e-coverage',inventory:'06-inventory-five-units'};
  function render(name, animate = true) {
    const previousFocus = document.activeElement;
    host.dataset.demoState = name;
    documentUI.body.innerHTML = window.constaNativeDemo.states[stateNames[name]];
    // Native date placeholders differ across browsers. Empty means not supplied, never today's date.
    documentUI.querySelectorAll('input[type="date"]').forEach(input => {
      if (!input.value) { input.type = 'text'; input.placeholder = 'dd/mm/aaaa'; }
    });
    documentUI.querySelectorAll('dialog[open]').forEach(dialog => {
      dialog.removeAttribute('open'); dialog.showModal();
      documentUI.activeElement?.blur();

    });
    documentUI.querySelectorAll('a').forEach(a => a.tabIndex = -1);
    const inventoryRows = [...documentUI.querySelectorAll('.equipment-status-table tbody tr')];
    if (inventoryRows.length && inventoryRows.every(row => row.querySelector('.equipment-status-text.covered'))) {
      documentUI.querySelector('.equipment-attention-legend')?.remove();
    }
    // showModal transfers keyboard focus into srcdoc even when pointer events are disabled.
    // Keep the clicker in the pitch, while preserving a deliberately focused source link.
    const focusTarget = previousFocus?.isConnected && previousFocus !== frame && previousFocus !== document.body && previousFocus !== document.documentElement ? previousFocus : stage;
    focusTarget.focus({preventScroll:true});
    focus.classList.remove('is-visible');
  }
  function find(label) {
    return Array.from(documentUI.querySelectorAll('button')).find(button => button.textContent.trim() === label);
  }
  function moveTo(element) {
    if (!element) return;
    const box = element.getBoundingClientRect();
    if (element.ownerDocument === document) {
      const viewport = screen.getBoundingClientRect();
      const scale = viewport.width / screen.offsetWidth;
      point((box.x + box.width*.55 - viewport.x)/scale, (box.y + box.height*.55 - viewport.y)/scale);
    } else point(box.x + box.width*.55, box.y + box.height*.55);
  }
  function point(x,y) {
    pointer.fromX=pointer.x; pointer.fromY=pointer.y;
    pointer.toX=x; pointer.toY=y; pointer.started=performance.now(); pointer.active=true;
    cursor.style.transform=`translate3d(${pointer.x}px,${pointer.y}px,0)`;
    cursor.classList.add('is-visible');
    scheduleFrame();
  }
  function click(element) {
    // The pointer never scales or changes rasterization during a click.
    if (element) element.animate([{filter:'brightness(1)'},{filter:'brightness(.9)'},{filter:'brightness(1)'}],{duration:140});
  }
  function scheduleFrame() { if(!clock) clock=requestAnimationFrame(animateFrame); }
  function animateFrame(now) {
    clock=0;
    const run=playback;
    if(run) {
      const elapsed=(now-run.started)*2;
      while(index<actions.length && elapsed>=actions[index].at) actions[index++].run();
      if(scrollMotion) {
        const progress=Math.min(1,Math.max(0,(elapsed-scrollMotion.start)/1800));
        const eased=progress*progress*(3-2*progress);
        scrollMotion.element.scrollTop=scrollMotion.from+(scrollMotion.to-scrollMotion.from)*eased;
        if(progress===1)scrollMotion=null;
      }
    }
    if(pointer.active) {
      const t=Math.min(1,Math.max(0,(now-pointer.started)/pointer.duration));
      const eased=t*t*t*(t*(6*t-15)+10);
      pointer.x=pointer.fromX+(pointer.toX-pointer.fromX)*eased;
      pointer.y=pointer.fromY+(pointer.toY-pointer.fromY)*eased;
      cursor.style.transform=`translate3d(${pointer.x}px,${pointer.y}px,0)`;
      if(t===1)pointer.active=false;
    }
    if(run && playback===run && index===actions.length && !scrollMotion && !pointer.active) {
      playback=null;
      if(run.beat===8 || run.beat===9)document.dispatchEvent(new CustomEvent('consta:demo-complete',{detail:{beat:run.beat}}));
    }
    if(playback || pointer.active) scheduleFrame();
  }
  function mark(element) {
    if (!element) return;
    const b = element.getBoundingClientRect();
    Object.assign(focus.style,{transform:`translate(${b.x-3}px,${b.y-3}px)`,width:`${b.width+6}px`,height:`${b.height+6}px`});
    focus.classList.add('is-visible');
  }
  function scrollToBottom(start, inventory = false) {
    const element = inventory ? documentUI.scrollingElement : documentUI.querySelector('.equipment-editor-scroll');
    if (element) {
      const table = inventory && documentUI.querySelector('.equipment-status-table');
      const end = table ? table.getBoundingClientRect().top + element.scrollTop - 16 : element.scrollHeight-element.clientHeight;
      scrollMotion = {element,start,from:element.scrollTop,to:Math.min(element.scrollHeight-element.clientHeight,end)};
    }
  }
  function stop() {
    cancelAnimationFrame(clock); clock=0; playback=null; scrollMotion=null; actions=[]; index=0; pointer.active=false;
    documentUI?.getAnimations().forEach(animation => animation.cancel());
    cursor.classList.remove('is-clicking'); focus.classList.remove('is-visible'); picker.hidden=true;
  }
  function finalState(beat) {
    render(beat === 8 ? 'document' : beat === 9 ? 'review' : 'inventory', false);
    caption.textContent = beat === 8 ? 'Um arquivo reúne os cinco equipamentos.' : beat === 9 ? 'Todos os campos preenchidos. Confira e confirme.' : 'Cinco equipamentos cadastrados. Previsões de manutenção criadas.';
  }
  function begin(beat, instant = false) {
    if (!ready) return;
    stop(); currentBeat = beat;
    if (![8,9,10].includes(beat)) {cursor.classList.remove('is-visible');return;}
    if (instant || reduced.matches) { finalState(beat); if(reduced.matches)cursor.classList.remove('is-visible');return; }
    const cue = (at,run) => actions.push({at,run});
    if (beat === 8) {
      render('overview',false); caption.textContent = 'Da tela de equipamentos ao contrato.';
      if(!cursor.classList.contains('is-visible'))point(350,400);
      cue(250,()=>moveTo(find('Enviar contrato')));
      cue(1050,()=>click(find('Enviar contrato')));
      cue(1250,()=>{render('upload');caption.textContent='Envie o documento do contrato.';});
      cue(2000,()=>moveTo(documentUI.querySelector('.dropzone')));
      cue(2850,()=>click(documentUI.querySelector('.dropzone')));
      cue(3100,()=>{picker.hidden=false;});
      cue(3600,()=>moveTo(picker.querySelector('.pd-file-row')));
      cue(4300,()=>click());
      cue(4850,()=>moveTo(picker.querySelector('button')));
      cue(5550,()=>click());
      cue(5800,()=>{picker.hidden=true;render('document',false);caption.textContent='Um arquivo reúne os cinco equipamentos.';});
      cue(6550,()=>moveTo(find('Continuar')));
      cue(7400,()=>cursor.classList.remove('is-clicking'));
    } else if (beat === 9) {
      render('document',false); moveTo(find('Continuar'));caption.textContent='O sistema organiza os campos do contrato.';
      cue(750,()=>click(find('Continuar')));
      cue(1050,()=>{render('review');caption.textContent='Todos os campos preenchidos. Confira e confirme.';});
      cue(1600,()=>moveTo(documentUI.querySelector('button[aria-label^="Configurações avançadas"]')));
      cue(2300,()=>click(documentUI.querySelector('button[aria-label^="Configurações avançadas"]')));
      cue(2500,()=>{render('identity');caption.textContent='Identidade: série, modelo, fabricante e tombamento.';});
      cue(3500,()=>moveTo(find('Contrato')));
      cue(4200,()=>click(find('Contrato')));
      cue(4500,()=>{render('coverage',false);caption.textContent='Empresa, contatos e vigência preenchidos.';});
      cue(5400,()=>moveTo(find('Concluir edição')));
      cue(6100,()=>click(find('Concluir edição')));
      cue(6400,()=>{render('review',false);caption.textContent='A conferência percorre cada equipamento.';});
      cue(6600,()=>moveTo(documentUI.querySelector('.equipment-editor-table tbody tr:last-child')));
      cue(8500,()=>{caption.textContent='Cinco unidades. Manutenção preventiva a cada 90 dias.';});
      // Brief readable landing before the pitch advances automatically.
      cue(9200,()=>{});
    } else {
      render('review',false);caption.textContent='A pessoa responsável confirma o cadastro.';
      cue(250,()=>moveTo(find('Confirmar e salvar')));
      cue(1150,()=>click(find('Confirmar e salvar')));
      cue(1450,()=>{render('inventory');caption.textContent='Cinco equipamentos cadastrados. Previsões de manutenção criadas.';});
      cue(2100,()=>moveTo(documentUI.querySelector('.equipment-status-table tbody tr:last-child')));
      cue(3900,()=>focus.classList.remove('is-visible'));
    }
    playback={beat,started:performance.now()};
    scheduleFrame();
  }

  function sync() {
    const beat=Number(stage.dataset.beat);
    if(beat!==currentBeat)begin(beat,stage.classList.contains('snap'));
  }
  function initialize() {
    const data=window.constaNativeDemo;
    frame.addEventListener('load',()=>{
      documentUI=frame.contentDocument;ready=true;
      documentUI.addEventListener('click',event=>event.preventDefault());
      begin(Number(stage.dataset.beat),stage.classList.contains('snap'));
    },{once:true});
    frame.srcdoc=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${data.css}
html,body{overflow:hidden}body{pointer-events:none}dialog:focus{outline:none}#capture-simulation-label{display:none}
/* Presentation density only: original CRM components, no hidden rows or zoom. */
.main-content{padding:14px 28px 12px}.page-heading{margin-bottom:12px}.page-heading p{margin-top:4px}
.equipment-status-toolbar{margin-bottom:8px}.equipment-status-filters{margin-bottom:8px}
.equipment-status-table td{padding:5px 20px}.equipment-status-table .equipment-secondary{margin-top:3px}.equipment-brand-model{margin-top:3px}
.page-footer{margin-top:8px;padding-top:8px}
.equipment-table-dialog{width:min(1540px,calc(100vw - 32px))!important;max-width:1540px!important;height:calc(100dvh - 32px);max-height:calc(100dvh - 32px)}
.equipment-table-dialog>.dialog-header{padding:12px 24px}.dialog-header h2{margin-bottom:4px}
.equipment-table-dialog .simple-config{padding:10px 24px;gap:8px}.equipment-table-dialog .dialog-footer{padding:10px 24px}
.equipment-editor-table td{padding:6px 10px}.equipment-editor-table th{padding:8px 10px}
.floating-equipment-dialog{top:70px!important;height:calc(100dvh - 100px)!important;max-height:calc(100dvh - 100px)!important}
</style></head><body></body></html>`;
  }
  new MutationObserver(sync).observe(stage,{attributes:true,attributeFilter:['data-beat']});
  reduced.addEventListener('change',()=>begin(Number(stage.dataset.beat),reduced.matches));
  window.constaProductDemo={restart:()=>begin(Number(stage.dataset.beat)),finishCurrent:()=>{if(!ready||![8,9,10].includes(currentBeat))return false;stop();finalState(currentBeat);if(!reduced.matches){if(currentBeat===8)moveTo(find('Continuar'));else if(currentBeat===9)moveTo(find('Confirmar e salvar'));else moveTo(documentUI.querySelector('.equipment-status-table tbody tr:last-child'));}return true;},getState:()=>({beat:currentBeat,state:host.dataset.demoState,running:Boolean(playback)||Boolean(scrollMotion)})};
  if(window.constaNativeDemo)initialize();
  else {const script=document.createElement('script');script.src='demo/native/crm-dom.js';script.onload=initialize;script.onerror=()=>{caption.textContent='Não foi possível carregar a demonstração local.';};document.head.append(script);}
})();
