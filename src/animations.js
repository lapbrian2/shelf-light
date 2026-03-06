import { gsap, ScrollTrigger } from './scroll.js';
import { renderer, proxy } from './scene/index.js';

/* ══════════════════════════════════════════
   SCROLL CAMERA CHOREOGRAPHY — 6 acts
══════════════════════════════════════════ */
export function initCameraChoreography() {
  // Each section gets a distinct close-up composition — like film cuts, not a dolly.
  // Camera repositions AND re-targets (lz) to frame a completely different subject.
  // Geometry reference:
  //   Cups: (-0.6,-0.3,2.0) & (1.3,-0.3,2.9)   Book spines: z:-6.61 x:1.8-10.8
  //   Open book: (-0.4,-0.39,2.65)                Counter stacks: x:3.2-8.2 z:-2.2
  //   Plant: (6.5,-0.55,-2.1)                     Door: (-2,-0.4,-6.94)

  const ST = (trigger) => ({ trigger, start: 'top 80%', end: 'top 30%', scrub: 1.2, invalidateOnRefresh: true });

  // Shot 1 (Hero): Wide establishing — set by hero reveal → { z:6.5, x:0.3, y:0.1, lx:0.8, ly:0.2, lz:-2 }

  // Shot 2 (About): Close-up on coffee cups + steam
  // Camera slightly above cups, looking down at the table surface
  gsap.to(proxy, { scrollTrigger: ST('#about'), z: 3.5, x: 0.4, y: 0.5, lx: 0.3, ly: -0.35, lz: 2.4, ease: 'power1.inOut' });

  // Shot 3 (Palette): Tight on colorful book spines — facing the back shelf
  // Camera in the room looking straight at middle shelf row (books at z:-6.61, y:1.9)
  gsap.to(proxy, { scrollTrigger: ST('#palette'), z: -4.0, x: 5.5, y: 2.0, lx: 5.5, ly: 2.0, lz: -6.6, ease: 'power1.inOut' });

  // Shot 4 (Journey): Open book — overhead close-up
  // Camera above the book, looking straight down at the pages (book at -0.4,-0.39,2.65)
  gsap.to(proxy, { scrollTrigger: ST('#journey'), z: 3.2, x: -0.4, y: 1.5, lx: -0.4, ly: -0.4, lz: 2.65, ease: 'power1.inOut' });

  // Shot 5 (How): Counter bar — looking along the stacked objects + plant
  // Camera at front edge of bar, angled along the counter line
  gsap.to(proxy, { scrollTrigger: ST('#how'), z: 0.0, x: 3.0, y: 0.5, lx: 6.5, ly: -0.3, lz: -2.5, ease: 'power1.inOut' });

  // Shot 6 (CTA): Wide pullback — the whole cafe from outside the door
  gsap.to(proxy, { scrollTrigger: ST('#cta'), z: 8.5, x: 0.0, y: 1.5, lx: 1.0, ly: 0.0, lz: -2, ease: 'power1.inOut' });

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

  // Camera starts zoomed in on the open book (proxy initialized to close-up in scene/index.js)
  // Hero establishing shot — the destination after the cinematic pull-back
  const heroShot = { z: 6.5, x: 0.3, y: 0.1, lx: 0.8, ly: 0.2, lz: -2 };

  window.addEventListener('load', () => {
    loaderFill.style.width = '100%';
    setTimeout(() => {
      document.getElementById('loader').classList.add('done');

      // ── Cinematic 3D reveal: book close-up → hero establishing shot ──
      const revealTL = gsap.timeline();

      // Act 1: Camera pulls back from the book to the hero position (2.2s, power2.inOut)
      revealTL.to(proxy, {
        z: heroShot.z,
        x: heroShot.x,
        y: heroShot.y,
        lx: heroShot.lx,
        ly: heroShot.ly,
        lz: heroShot.lz,
        duration: 2.2,
        ease: 'power2.inOut'
      });

      // Act 2: Stagger hero text elements in after camera arrives
      const heroTimings = [
        ['h0', 0],    ['h6', 0.08], ['h1', 0.20],
        ['h2', 0.38], ['h3', 0.52], ['h4', 0.66], ['h5', 0.88]
      ];
      heroTimings.forEach(([id, offset]) => {
        revealTL.call(() => {
          const el = document.getElementById(id);
          if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
        }, [], offset === 0 ? '>' : `>+=${offset}`);
      });

      // Act 3: SVG sketch draw-in after hero text has landed
      revealTL.call(() => {
        document.querySelectorAll('.sk').forEach(p => {
          try { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; } catch (e) { /* ignore */ }
        });
        gsap.to('.sk', {
          strokeDashoffset: 0, duration: .06, stagger: { each: .025, from: 'start' },
          ease: 'power1.out',
          onComplete: () => document.getElementById('sk-svg').classList.add('drawn')
        });
      }, [], '>+=0.15');

    }, 500);
  });
}

/* ══════════════════════════════════════════
   SPLIT-CHAR BLUR REVEAL
══════════════════════════════════════════ */
function splitReveal(id) {
  const el = document.getElementById(id); if (!el) return;
  const words = el.textContent.split(/\s+/).filter(Boolean);
  el.textContent = '';
  let charIndex = 0;
  words.forEach((w, wi) => {
    if (wi > 0) el.appendChild(document.createTextNode(' '));
    const wordSpan = document.createElement('span');
    wordSpan.className = 'sw';
    for (let ci = 0; ci < w.length; ci++) {
      const charSpan = document.createElement('span');
      charSpan.className = 'sc';
      charSpan.textContent = w[ci];
      charSpan.style.transitionDelay = charIndex * 25 + 'ms';
      wordSpan.appendChild(charSpan);
      charIndex++;
    }
    el.appendChild(wordSpan);
  });
  const chars = el.querySelectorAll('.sc');
  new IntersectionObserver(en => {
    if (!en[0].isIntersecting) return;
    chars.forEach((c, i) => setTimeout(() => c.classList.add('in'), i * 25));
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
