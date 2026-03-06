import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════════════ */
const lenis = new Lenis({
  duration: 1.15,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ══════════════════════════════════════════
   NAV — scroll-aware: hide/show + active link + progress bar
══════════════════════════════════════════ */
export function initNav() {
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 50);
    if (scroll > 300) { nav.classList.toggle('hidden', scroll > lastScroll && scroll - lastScroll > 5); }
    else { nav.classList.remove('hidden'); }
    lastScroll = scroll;
    // scroll progress bar
    const h = document.documentElement.scrollHeight - window.innerHeight;
    document.getElementById('scroll-progress').style.width = (scroll / h * 100) + '%';
  });

  // active nav link
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = ['about', 'palette', 'journey'];
  const sectionEls = sections.map(s => document.getElementById(s));
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const match = document.querySelector(`.nav-link[data-section="${e.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: .3 });
  sectionEls.forEach(s => { if (s) navIO.observe(s); });
}

export { lenis, gsap, ScrollTrigger };
