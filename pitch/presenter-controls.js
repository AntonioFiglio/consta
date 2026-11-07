// Keep presenter navigation available without covering the projected content.
(() => {
  const controls = document.querySelector('.controls');
  if (!controls) return;
  let hideTimer;
  function showControls() {
    controls.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => controls.classList.remove('is-visible'), 1800);
  }
  document.addEventListener('pointermove', showControls, {passive: true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') showControls();
  });
  showControls();
})();
