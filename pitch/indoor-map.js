/* The camera moves SVG, marker and labels together; marker positioning stays in motion.js. */
(() => {
  const stage = document.querySelector('#stage');
  const map = document.querySelector('#map');
  const camera = document.querySelector('#indoor-camera');
  if (!stage || !map || !camera) return;
  const firstBeat = 14, lastBeat = 15;
  let pose = {x: 0, y: 0, scale: 1}, dragging = null, previousBeat = -1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function draw(snap = false) {
    camera.style.transition = snap || reduced.matches || dragging ? 'none' : '';
    camera.style.transform = `translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`;
  }
  function presented() {
    const t = getComputedStyle(camera).transform;
    if (!t || t === 'none') return {x: 0, y: 0, scale: 1};
    const matrix = new DOMMatrixReadOnly(t);
    return {x: matrix.e, y: matrix.f, scale: matrix.a};
  }
  function showBeat() {
    const beat = Number(stage.dataset.beat);
    if (beat === previousBeat) return;
    const entering = previousBeat !== firstBeat && previousBeat !== lastBeat;
    previousBeat = beat;
    if (beat !== firstBeat && beat !== lastBeat) return;
    pose = beat === lastBeat ? {x: 0, y: 0, scale: 1} : {x: 50, y: 45, scale: 1.06};
    draw(entering || stage.classList.contains('snap'));
    const time = document.querySelector('.im-last-seen span');
    if (time) time.textContent = beat === lastBeat ? '09:42 · simulado' : '09:41 · simulado';
  }
  document.querySelectorAll('[data-map-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      pose = presented();
      const action = button.dataset.mapZoom;
      if (action === 'reset') pose = {x: 0, y: 0, scale: 1};
      else pose.scale = clamp(pose.scale + (action === 'in' ? .15 : -.15), .9, 1.65);
      draw();
    });
  });
  map.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pose = presented();
    dragging = {id: event.pointerId, x: event.clientX, y: event.clientY, pose: {...pose}};
    map.setPointerCapture(event.pointerId);
    map.classList.add('is-dragging');
    draw(true);
  });
  map.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== dragging.id) return;
    const scale = stage.getBoundingClientRect().width / 1920;
    pose.x = clamp(dragging.pose.x + (event.clientX - dragging.x) / scale, -300, 300);
    pose.y = clamp(dragging.pose.y + (event.clientY - dragging.y) / scale, -220, 220);
    draw(true);
  });
  function endDrag(event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    dragging = null;
    map.classList.remove('is-dragging');
    draw();
  }
  map.addEventListener('pointerup', endDrag);
  map.addEventListener('pointercancel', endDrag);
  const frame = map.closest('.im-map-frame');
  frame.addEventListener('keydown', event => {
    if (event.key !== 'PageDown' && event.key !== 'PageUp') return;
    event.preventDefault(); event.stopPropagation();
    stage.focus({preventScroll: true});
    window.constaPitch[event.key === 'PageDown' ? 'next' : 'prev']();
  });
  new MutationObserver(showBeat).observe(stage, {attributes: true, attributeFilter: ['data-beat']});
  reduced.addEventListener('change', () => draw(reduced.matches));
  showBeat();
})();
