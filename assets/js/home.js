/* Horizontal snap scrolling + tab sync for home page */
(function () {
  const scroller = document.querySelector('.h-scroll');
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.h-panel');
  if (!scroller) return;

  /* ----- Convert vertical wheel into horizontal scroll ----- */
  let wheelLock = false;
  scroller.addEventListener('wheel', (e) => {
    // Only intercept vertical deltas; let trackpad horizontal pass through
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      const dir = e.deltaY > 0 ? 1 : -1;
      const w = window.innerWidth;
      const current = Math.round(scroller.scrollLeft / w);
      const next = Math.max(0, Math.min(panels.length - 1, current + dir));
      scroller.scrollTo({ left: next * w, behavior: 'smooth' });
      setTimeout(() => { wheelLock = false; }, 450);
    }
  }, { passive: false });

  /* ----- Tab click navigation ----- */
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.index, 10);
      scroller.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' });
    });
  });

  /* ----- Update active tab while scrolling ----- */
  function syncTabs() {
    const idx = Math.round(scroller.scrollLeft / window.innerWidth);
    tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
  }
  scroller.addEventListener('scroll', () => {
    window.requestAnimationFrame(syncTabs);
  });

  /* ----- Keep panel widths correct on resize ----- */
  window.addEventListener('resize', () => {
    const idx = Math.round(scroller.scrollLeft / window.innerWidth);
    scroller.scrollLeft = idx * window.innerWidth;
  });

  /* ----- Keyboard nav (left/right arrows) ----- */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const w = window.innerWidth;
      const current = Math.round(scroller.scrollLeft / w);
      const next = Math.max(0, Math.min(panels.length - 1, current + dir));
      scroller.scrollTo({ left: next * w, behavior: 'smooth' });
    }
  });
})();
