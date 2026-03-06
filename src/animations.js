import { gsap, ScrollTrigger } from './scroll.js';
import { renderer, proxy } from './scene/index.js';

/* ══════════════════════════════════════════
   SCROLL CAMERA CHOREOGRAPHY — 6 acts
══════════════════════════════════════════ */
export function initCameraChoreography() {
  // Act 1: Hero -> wide establishing (default proxy)
  // Act 2: About -> push toward coffee cups on the table
  gsap.to(proxy, { scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom center', scrub: 1.8, invalidateOnRefresh: true }, z: 8.5, x: -0.2, y: -0.35, lx: -0.3, ly: -0.35, ease: 'none' });
  // Act 3: Palette -> drift to teal bar (chromatic anchor)
  gsap.to(proxy, { scrollTrigger: { trigger: '#palette', start: 'top bottom', end: 'bottom center', scrub: 1.8, invalidateOnRefresh: true }, z: 11, x: 1.8, y: -0.3, lx: 2.5, ly: -0.6, ease: 'none' });
  // Act 4: Journey -> settle on open book on the table
  gsap.to(proxy, { scrollTrigger: { trigger: '#journey', start: 'top bottom', end: 'bottom center', scrub: 1.8, invalidateOnRefresh: true }, z: 9.5, x: -0.5, y: -0.5, lx: -0.4, ly: -0.5, ease: 'none' });
  // Act 5: How -> zoom to bookshelf + counter plant
  gsap.to(proxy, { scrollTrigger: { trigger: '#how', start: 'top bottom', end: 'bottom center', scrub: 1.8, invalidateOnRefresh: true }, z: 14, x: 1.5, y: 0.1, lx: 2.5, ly: 0.2, ease: 'none' });
  // Act 6: CTA -> pull way back, cinematic wide
  gsap.to(proxy, { scrollTrigger: { trigger: '#cta', start: 'top bottom', end: 'top center', scrub: 1.5, invalidateOnRefresh: true }, z: 8, x: 0, y: 0.5, lx: 0, ly: 0.3, ease: 'none' });

  ScrollTrigger.refresh();

  // SVG sketch fade: tied to scroll (goes more transparent as you scroll deep)
  gsap.to('#sk-svg', { scrollTrigger: { trigger: '#how', start: 'top bottom', end: 'top top', scrub: 1 }, opacity: .3 });

  // Tone shift — exposure warms as you scroll deeper into the cafe
  const toneProxy = { exposure: 1.02 };
  gsap.to(toneProxy, { scrollTrigger: { trigger: '#journey', start: 'top bottom', end: 'bottom top', scrub: 2 }, exposure: 1.22, onUpdate: () => { renderer.toneMappingExposure = toneProxy.exposure; } });
  gsap.to(toneProxy, { scrollTrigger: { trigger: '#cta', start: 'top bottom', end: 'top top', scrub: 1.5 }, exposure: 0.88, onUpdate: () => { renderer.toneMappingExposure = toneProxy.exposure; } });
}

/* ══════════════════════════════════════════
   HERO REVEAL — cinematic staggered load
══════════════════════════════════════════ */
export function initHeroReveal() {
  const loaderFill = document.getElementById('loader-fill');
  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress > 100) loadProgress = 100;
    loaderFill.style.width = loadProgress + '%';
    if (loadProgress >= 100) clearInterval(loadInterval);
  }, 120);

  window.addEventListener('load', () => {
    loaderFill.style.width = '100%';
    setTimeout(() => {
      document.getElementById('loader').classList.add('done');
      // stagger hero elements with cinematic timing
      const heroTimings = [
        ['h0', 200], ['h1', 480], ['h2', 820], ['h3', 1100], ['h4', 1350], ['h5', 1700], ['h6', 600]
      ];
      heroTimings.forEach(([id, delay]) => setTimeout(() => {
        const el = document.getElementById(id);
        if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      }, delay));

      // SVG sketch draw-in
      document.querySelectorAll('.sk').forEach(p => {
        try { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; } catch (e) { /* ignore */ }
      });
      gsap.to('.sk', {
        strokeDashoffset: 0, duration: .06, stagger: { each: .025, from: 'start' },
        ease: 'power1.out', delay: .6,
        onComplete: () => document.getElementById('sk-svg').classList.add('drawn')
      });
    }, 500);
  });
}

/* ══════════════════════════════════════════
   SPLIT-WORD BLUR REVEAL
══════════════════════════════════════════ */
function splitReveal(id) {
  const el = document.getElementById(id); if (!el) return;
  const words = el.textContent.split(/\s+/).filter(Boolean);
  el.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'sw';
    span.textContent = w;
    if (i > 0) el.appendChild(document.createTextNode(' '));
    el.appendChild(span);
  });
  const spans = el.querySelectorAll('.sw');
  new IntersectionObserver(en => {
    if (!en[0].isIntersecting) return;
    spans.forEach((w, i) => setTimeout(() => w.classList.add('in'), i * 58));
  }, { threshold: .15 }).observe(el);
}

/* ══════════════════════════════════════════
   INTERSECTION OBSERVERS — fade-up, timeline, phase rows, table rows
══════════════════════════════════════════ */
export function initObservers() {
  ['at', 'ab0', 'ab1', 'ab2'].forEach(splitReveal);

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .1 });
  document.querySelectorAll('.fu,.t-item,.si,.pal-card,.section-divider,.phase-row').forEach(el => io.observe(el));

  // stagger stack items
  document.querySelectorAll('.si').forEach((el, i) => { el.style.transitionDelay = i * 38 + 'ms'; });
  // stagger phase rows
  document.querySelectorAll('.phase-row').forEach((el, i) => { el.style.transitionDelay = i * 80 + 'ms'; });
  // stagger table rows
  document.querySelectorAll('.w-table tbody tr').forEach((el, i) => { el.style.transitionDelay = i * 60 + 'ms'; io.observe(el); });

  // Timeline dot activation on scroll
  const tlItems = document.querySelectorAll('.t-item');
  const dotIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const dot = e.target.querySelector('.t-dot');
      if (e.isIntersecting) { dot.classList.add('act'); }
      else { dot.classList.remove('act'); }
    });
  }, { threshold: .5 });
  tlItems.forEach(el => dotIO.observe(el));

  // Timeline progress line
  gsap.to('#tl-progress', {
    scrollTrigger: { trigger: '.tl-wrap', start: 'top center', end: 'bottom center', scrub: true },
    height: '100%', ease: 'none'
  });
}
