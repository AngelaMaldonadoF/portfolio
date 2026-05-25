/* Horizontal snap navigation for the home page (desktop only).
   The native overflow-x is hidden — all panel changes go through this
   script so there is no momentum overscroll from trackpad gestures.
   On mobile (width <= 900px) layout is vertical via CSS and this script
   no-ops. */
(function () {
  const scroller = document.querySelector('.h-scroll');
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.h-panel');
  if (!scroller) return;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  let current = 0;
  function goTo(i) {
    current = Math.max(0, Math.min(panels.length - 1, i));
    scroller.scrollTo({ left: current * window.innerWidth, behavior: 'smooth' });
    tabs.forEach((t, idx) => t.classList.toggle('active', idx === current));
  }

  /* --- Single, debounced wheel handler covering both axes ---
     Trackpads can fire dozens of wheel events per gesture; lock for
     ~700 ms after the last one so a swipe = one panel step.            */
  const STEP_LOCK_MS = 700;
  const MIN_DELTA    = 8;       // ignore micro-jitter
  let lock = false;
  let lastTime = 0;

  scroller.addEventListener('wheel', (e) => {
    if (isMobile()) return;
    e.preventDefault();                 // disable native scroll entirely

    const dx = e.deltaX;
    const dy = e.deltaY;
    // Use whichever axis is dominant — vertical wheel OR horizontal trackpad
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(delta) < MIN_DELTA) return;

    const now = Date.now();
    if (lock || (now - lastTime) < STEP_LOCK_MS) return;
    lock = true;
    lastTime = now;

    goTo(current + (delta > 0 ? 1 : -1));
    setTimeout(() => { lock = false; }, STEP_LOCK_MS);
  }, { passive: false });

  /* --- Tab click navigation --- */
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (isMobile()) return;
      goTo(parseInt(tab.dataset.index, 10));
    });
  });

  /* --- Resize: re-snap to current panel --- */
  window.addEventListener('resize', () => {
    if (isMobile()) return;
    scroller.scrollLeft = current * window.innerWidth;
  });

  /* --- Keyboard navigation --- */
  window.addEventListener('keydown', (e) => {
    if (isMobile()) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'Home')                                { e.preventDefault(); goTo(0); }
    if (e.key === 'End')                                 { e.preventDefault(); goTo(panels.length - 1); }
  });

  /* --- Touch drag on tablet-width with mouse-like behaviour --- */
  let touchStartX = null;
  scroller.addEventListener('touchstart', (e) => {
    if (isMobile()) return;
    touchStartX = e.touches[0].clientX;
  });
  scroller.addEventListener('touchend', (e) => {
    if (isMobile() || touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) goTo(current + (dx < 0 ? 1 : -1));
    touchStartX = null;
  });
})();
