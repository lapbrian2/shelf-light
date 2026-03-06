/* ══════════════════════════════════════════
   CUSTOM CURSOR + MOUSE PARALLAX STATE
══════════════════════════════════════════ */

// Shared mouse state for render loop parallax
export const mouse = { mx: 0, my: 0, sx2: 0, sy2: 0 };

export function initCursor() {
  const ring = document.getElementById('cur-ring');
  const dot = document.getElementById('cur-dot');

  // Mouse tracking for parallax (always active, even on touch devices)
  window.addEventListener('mousemove', e => {
    mouse.mx = (e.clientX / window.innerWidth - .5) * 2;
    mouse.my = (e.clientY / window.innerHeight - .5) * 2;
  });

  // Visual cursor (pointer: fine only)
  if (window.matchMedia('(pointer:fine)').matches) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2, lx2 = cx, ly2 = cy;
    window.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
    (function ac() {
      lx2 += (cx - lx2) * .1; ly2 += (cy - ly2) * .1;
      ring.style.left = lx2 + 'px'; ring.style.top = ly2 + 'px';
      dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
      requestAnimationFrame(ac);
    })();

    document.querySelectorAll('a,button,.pal-card,.si,#sound-toggle').forEach(el => {
      el.addEventListener('mouseenter', () => { ring.classList.add('h'); ring.classList.remove('text'); });
      el.addEventListener('mouseleave', () => { ring.classList.remove('h'); ring.classList.remove('text'); });
    });
    document.querySelectorAll('.a-body,.t-body,.p-desc,.hero-desc,.prompt-box p,.pal-role,.phase-val').forEach(el => {
      el.addEventListener('mouseenter', () => { ring.classList.add('text'); ring.classList.remove('h'); });
      el.addEventListener('mouseleave', () => ring.classList.remove('text'));
    });
  }
}
