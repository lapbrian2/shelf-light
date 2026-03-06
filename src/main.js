/* ══════════════════════════════════════════
   SHELF LIGHT — main entry point
══════════════════════════════════════════ */

// Styles
import './styles/base.css';
import './styles/nav.css';
import './styles/sections.css';
import './styles/responsive.css';

// Scene (side-effects: creates all geometry on import)
import { THREE, renderer, scene, camera, proxy } from './scene/index.js';
import { allBooks } from './scene/geometry.js';
import { pendants } from './scene/lights.js';

// Modules
import { lenis, ScrollTrigger, initNav } from './scroll.js';
import { mouse, initCursor } from './cursor.js';
import { initCameraChoreography, initHeroReveal, initObservers } from './animations.js';
import { initSoundToggle, disposeAudio } from './audio.js';
import { initForm } from './form.js';
import { log, initErrorHandlers, initWebGLRecovery, initFPSCounter, initRenderStats } from './debug.js';

/* ── Init ── */
initErrorHandlers();
initWebGLRecovery(document.getElementById('c3d'), renderer, () => {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xB8CCCA, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  log.info('Renderer state restored after context loss.');
});

initNav();
initCursor();
initCameraChoreography();
initHeroReveal();
initObservers();
initSoundToggle();
initForm();

// Dev-only panels (tree-shaken in production)
initFPSCounter();
initRenderStats(renderer);

log.info('Shelf Light initialized');

/* ══════════════════════════════════════════
   RENDER LOOP
══════════════════════════════════════════ */
const clock = new THREE.Clock();
const skSvgEl = document.getElementById('sk-svg');

(function tick() {
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();
  const dt = clock.getDelta();
  mouse.sx2 += (mouse.mx - mouse.sx2) * .025;
  mouse.sy2 += (mouse.my - mouse.sy2) * .025;

  // Camera — deeper mouse parallax for physical presence
  camera.position.set(
    proxy.x + mouse.sx2 * .28 + Math.sin(t * .628) * .06,
    proxy.y + mouse.sy2 * .14 + Math.sin(t * .22) * .025,
    proxy.z
  );
  camera.lookAt(proxy.lx + mouse.sx2 * .08, proxy.ly, -2);

  // SVG sketch — parallax OPPOSITE to camera (creates layered depth)
  skSvgEl.style.transform = 'translate(' + (-mouse.sx2 * 5) + 'px,' + (mouse.sy2 * 3.5) + 'px)';

  // Pendant sway
  pendants.forEach((p, i) => {
    const swing = Math.sin(t * .8 + i * 1.5) * .06;
    p.torus.position.x = p.baseX + swing;
    p.torus.rotation.z = swing * .5;
    p.wire.position.x = p.baseX + swing * .5;
    p.wire.rotation.z = swing * .15;
  });

  // Light cones — breathe + track cursor (light aware of you)
  pendants.forEach((p, i) => {
    if (p.coneMat) p.coneMat.opacity = 0.03 + Math.sin(t * .6 + i * 1.2) * .015;
    if (p.cone) {
      p.cone.position.x = p.baseX + Math.sin(t * .8 + i * 1.5) * .04 + mouse.sx2 * .2;
      p.cone.rotation.z = mouse.sx2 * .04;
    }
  });

  // Books — occasional micro-settle (tiny rotation wobble)
  if (Math.floor(t * 2) % 3 === 0) {
    const idx = Math.floor(t * 7) % allBooks.length;
    const b = allBooks[idx];
    b.mesh.rotation.z = b.baseRz + Math.sin(t * 3 + idx) * .008;
  }

  renderer.render(scene, camera);
})();

/* ══════════════════════════════════════════
   RESIZE + DISPOSE
══════════════════════════════════════════ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  ScrollTrigger.refresh();
});

window.addEventListener('beforeunload', () => {
  ScrollTrigger.getAll().forEach(s => s.kill());
  lenis.destroy();
  scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
  });
  renderer.dispose();
  disposeAudio();
});
