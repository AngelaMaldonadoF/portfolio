/* Lightbox — click any .zoomable image to enlarge.
   Close with click, Escape, or the X button. */
(function () {
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

  function open(srcEl) {
    img.src = srcEl.src;
    img.alt = srcEl.alt || '';
    cap.textContent = srcEl.alt || '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open');
    img.src = '';
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

  // Close on click anywhere in overlay (but not when image itself is clicked? actually keep simple)
  box.addEventListener('click', (e) => {
    // any click closes — image is contained, lightbox bg is also close target
    close();
  });
  closeB.addEventListener('click', (e) => { e.stopPropagation(); close(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && box.classList.contains('open')) close();
  });
})();
