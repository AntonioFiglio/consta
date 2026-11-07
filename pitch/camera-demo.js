/* CapturePage replay loops only while this slide is active. No device access. */
(() => {
  const stage = document.querySelector('.stage');
  const host = document.querySelector('.layer-camera');
  if (!stage || !host) return;
  const cursor = host.querySelector('.cd-cursor');
  const app = host.querySelector('.cd-app');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const CAMERA_BEAT = 12;
  let timers = [], beat = -1, finished = false, looping = false, cycles = 0;
  function clear() {
    timers.forEach(clearTimeout);
    timers = [];
    cursor.getAnimations().forEach(animation => animation.cancel());
  }
  function read() {
    host.classList.add('is-read');
    app.dataset.cameraState = 'received';
    cursor.classList.remove('is-visible');
    finished = true;
  }
  function cycle() {
    clear();
    if (beat !== CAMERA_BEAT || reduced.matches) return;
    looping = true;
    finished = false;
    cycles += 1;
    host.classList.remove('is-read');
    app.dataset.cameraState = 'framing';
    cursor.classList.remove('is-visible');
    timers.push(setTimeout(() => cursor.classList.add('is-visible'), 1400));
    timers.push(setTimeout(() => cursor.animate([{scale:1},{scale:.72},{scale:1}], {duration:220}), 1750));
    timers.push(setTimeout(read, 2100));
    timers.push(setTimeout(cycle, 3900));
  }
  function enter() {
    clear();
    looping = false;
    cycles = 0;
    if (reduced.matches) { read(); return; }
    cycle();
  }
  function sync() {
    const next = Number(stage.dataset.beat);
    if (next === beat) return;
    clear();
    looping = false;
    beat = next;
    if (beat === CAMERA_BEAT) enter();
  }
  new MutationObserver(sync).observe(stage, {attributes:true, attributeFilter:['data-beat']});
  window.constaCameraDemo = {
    finishCurrent() {
      if (beat !== CAMERA_BEAT) return false;
      clear();
      looping = false;
      read();
      return true;
    },
    getState() {
      return {beat, finished, running:beat === CAMERA_BEAT && looping, cycles, state:app.dataset.cameraState, simulated:true};
    }
  };
  reduced.addEventListener('change', () => { if (beat === CAMERA_BEAT) enter(); });
  sync();
})();
