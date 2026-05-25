/* Lightbox — click any .zoomable image to open at zoomed scale.
   Image is sized larger than the viewport; mouse position pans it.
   Close with click, Escape, or the X button. */
(function () {
  const ZOOM_FACTOR = 1.8;   // how much larger than fit-to-screen
  const MIN_ZOOM    = 1.05;  // never smaller than this multiple of fit

  // Build lightbox DOM once
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = `
    <button class="lightbox-close" aria-label="Cerrar">×</button>
    <img alt="">
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(box);

  const img    = box.querySelector('img');
  const cap    = box.querySelector('.lightbox-caption');
  const closeB = box.querySelector('.lightbox-close');

  let state = { sw: 0, sh: 0, ox: 0, oy: 0, ready: false };

  function layout() {
    if (!img.naturalWidth) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const fitScale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
    const scale = Math.max(MIN_ZOOM, fitScale * ZOOM_FACTOR);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    state.sw = sw;
    state.sh = sh;
    state.ox = Math.max(0, sw - W);
    state.oy = Math.max(0, sh - H);
    img.style.width  = sw + 'px';
    img.style.height = sh + 'px';
    // start centred
    const x = state.ox > 0 ? -state.ox / 2 : (W - sw) / 2;
    const y = state.oy > 0 ? -state.oy / 2 : (H - sh) / 2;
    img.style.transform = `translate(${x}px, ${y}px)`;
    state.ready = true;
  }

  function pan(e) {
    if (!state.ready) return;
    const W = window.innerWidth, H = window.innerHeight;
    const sw = state.sw, sh = state.sh;
    // Margin around edges so corners are reachable
    const u = Math.min(1, Math.max(0, e.clientX / W));
    const v = Math.min(1, Math.max(0, e.clientY / H));
    const tx = state.ox > 0 ? -u * state.ox : (W - sw) / 2;
    const ty = state.oy > 0 ? -v * state.oy : (H - sh) / 2;
    img.style.transform = `translate(${tx}px, ${ty}px)`;
  }

  function open(srcEl) {
    state.ready = false;
    img.src = srcEl.src;
    img.alt = srcEl.alt || '';
    cap.textContent = srcEl.alt || '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (img.complete && img.naturalWidth) {
      layout();
    } else {
      img.onload = layout;
    }
  }
  function close() {
    box.classList.remove('open');
    img.src = '';
    state.ready = false;
    document.body.style.overflow = '';
  }

  // Attach to existing zoomable images and any added later
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches && t.matches('img.zoomable') && t.src) {
      e.preventDefault();
      open(t);
    }
  });

  // Pan with mouse
  box.addEventListener('mousemove', pan);

  // Close on click (but not on close-button — its own handler)
  box.addEventListener('click', (e) => {
    if (e.target === closeB) return;
    close();
  });
  closeB.addEventListener('click', (e) => { e.stopPropagation(); close(); });

  // Touch: drag to pan on mobile
  box.addEventListener('touchmove', (e) => {
    if (e.touches.length) {
      pan({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && box.classList.contains('open')) close();
  });

  window.addEventListener('resize', () => {
    if (box.classList.contains('open')) layout();
  });
})();
