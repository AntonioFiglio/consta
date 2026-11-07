/* CONSTA — apoio técnico BLE. Navegação manual, sem autoplay e sem dependência do deck principal.
   API para QA: window.constaBLE = { next, prev, goTo, getState } com beat em base zero. */
(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var telas = Array.prototype.slice.call(document.querySelectorAll('.tela'));
  var total = telas.length;
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var pos = document.getElementById('pos');
  var live = document.getElementById('live');
  var beat = 0;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--s', String(s));
  }

  function render() {
    telas.forEach(function (t, i) {
      var on = i === beat;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-hidden', on ? 'false' : 'true');
      if ('inert' in t) t.inert = !on;
    });
    prevBtn.disabled = beat === 0;
    nextBtn.disabled = beat === total - 1;
    pos.textContent = pad(beat + 1) + ' / ' + pad(total);
    live.textContent = telas[beat].getAttribute('aria-label') || '';
    if (history.replaceState) {
      try { history.replaceState(null, '', '#' + (beat + 1)); } catch (e) { /* file:// pode recusar */ }
    }
  }

  function goTo(n) {
    var i = Number(n);
    if (!isFinite(i)) return getState();
    i = Math.max(0, Math.min(total - 1, Math.round(i)));
    if (i !== beat) { beat = i; render(); }
    return getState();
  }
  function next() { return goTo(beat + 1); }
  function prev() { return goTo(beat - 1); }
  function getState() { return { beat: beat, total: total }; }

  function fromHash() {
    var m = /^#(\d+)$/.exec(location.hash || '');
    return m ? Number(m[1]) - 1 : 0;
  }

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.repeat) { e.preventDefault(); return; }
    var tgt = e.target;
    var interativo = tgt && tgt.closest && tgt.closest('a, button, input, textarea, select');
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown':
        e.preventDefault(); next(); break;
      case ' ': case 'Enter':
        if (interativo) return; // Enter/Espaço ativam o link ou botão focado
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); goTo(0); break;
      case 'End': e.preventDefault(); goTo(total - 1); break;
    }
  });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { goTo(fromHash()); });

  fit();
  beat = Math.max(0, Math.min(total - 1, fromHash()));
  render();
  if (stage && stage.focus) stage.setAttribute('tabindex', '-1');

  window.constaBLE = { next: next, prev: prev, goTo: goTo, getState: getState };
})();
