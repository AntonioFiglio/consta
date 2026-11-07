/* Presentation-only proposal. Synthetic tasks never reach the CRM/API. */
(() => {
  const stage = document.querySelector('.stage');
  const host = document.querySelector('.layer-smart-agenda');
  if (!stage || !host) return;
  const board = host.querySelector('.sa-board');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tiles = [];
  let beat = -1;
  let finished = false;
  let timers = [];
  for (let index = 0; index < 20; index += 1) {
    const tile = document.createElement('div');
    tile.className = 'sa-tile';
    tile.textContent = `EQ-${String(index + 1).padStart(2, '0')}`;
    tile.setAttribute('aria-hidden', 'true');
    tile.style.setProperty('--from-x', `${400 + (index % 5) * 136}px`);
    tile.style.setProperty('--from-y', `${140 + Math.floor(index / 5) * 40}px`);
    tile.style.setProperty('--to-x', `${Math.floor(index / 4) * 300}px`);
    tile.style.setProperty('--to-y', `${(index % 4) * 80}px`);
    tile.style.setProperty('--delay', `${Math.floor(index / 4) * 160 + (index % 4) * 35}ms`);
    board.append(tile);
    tiles.push(tile);
  }
  function clear() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function settle() {
    clear();
    host.classList.add('is-settled', 'is-calendar', 'is-distributed');
    host.dataset.agendaState = 'distributed';
    finished = true;
  }
  function enter() {
    clear();
    finished = false;
    host.classList.add('is-settled');
    host.classList.remove('is-distributed', 'is-calendar');
    host.dataset.agendaState = 'document';
    void host.offsetWidth;
    host.classList.remove('is-settled');
    if (reduced.matches || stage.classList.contains('snap')) { settle(); return; }
    timers.push(setTimeout(() => {
      host.classList.add('is-calendar');
      host.dataset.agendaState = 'opening';
    }, 1500));
    timers.push(setTimeout(() => { host.dataset.agendaState = 'concentrated'; }, 2400));
    timers.push(setTimeout(() => {
      host.classList.add('is-distributed');
      host.dataset.agendaState = 'distributing';
    }, 3100));
    timers.push(setTimeout(settle, 4650));
  }
  function sync() {
    const next = Number(stage.dataset.beat);
    if (next === beat) return;
    clear();
    beat = next;
    if (beat === 11) enter();
  }
  new MutationObserver(sync).observe(stage, {attributes:true, attributeFilter:['data-beat']});
  window.constaSmartAgenda = {
    finishCurrent() {
      if (beat !== 11 || finished) return false;
      settle();
      return true;
    },
    getState() {
      return {beat, finished, running:beat === 11 && !finished, state:host.dataset.agendaState, simulated:true, taskCount:tiles.length};
    }
  };
  reduced.addEventListener('change', () => { if (reduced.matches && beat === 11) settle(); });
  sync();
})();
