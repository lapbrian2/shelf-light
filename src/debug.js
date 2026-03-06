/* ══════════════════════════════════════════
   DEBUG UTILITIES — dev-only, tree-shaken in prod
══════════════════════════════════════════ */

/* ── Environment-aware logger ── */
export const log = {
  info:  (...args) => { if (__DEV__) console.log('[SL]', ...args); },
  warn:  (...args) => { if (__DEV__) console.warn('[SL]', ...args); },
  error: (...args) => console.error('[SL]', ...args),
};

/* ── Global error handlers ── */
export function initErrorHandlers() {
  window.addEventListener('error', (event) => {
    log.error('Uncaught error:', event.message, event.filename, event.lineno);
  });
  window.addEventListener('unhandledrejection', (event) => {
    log.error('Unhandled promise rejection:', event.reason);
  });
}

/* ── WebGL context loss / restore ── */
export function initWebGLRecovery(canvas, renderer, onRestore) {
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    log.warn('WebGL context lost. Attempting recovery...');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    log.info('WebGL context restored.');
    if (onRestore) onRestore();
  });
}

/* ── FPS counter (dev only) ── */
export function initFPSCounter() {
  if (!__DEV__) return;

  const el = document.createElement('div');
  el.id = 'fps-counter';
  el.style.cssText = `
    position:fixed;top:8px;left:8px;z-index:99999;
    font:600 11px/1 monospace;color:#2a8090;
    background:rgba(240,232,224,.85);backdrop-filter:blur(8px);
    padding:4px 8px;border-radius:3px;
    border:1px solid rgba(42,128,144,.2);pointer-events:none;
  `;
  document.body.appendChild(el);

  let frames = 0, lastTime = performance.now();
  (function tick() {
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      el.textContent = frames + ' FPS';
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(tick);
  })();
}

/* ── Three.js render stats panel (dev only) ── */
export function initRenderStats(renderer) {
  if (!__DEV__) return;

  const el = document.createElement('div');
  el.id = 'render-stats';
  el.style.cssText = `
    position:fixed;top:8px;left:90px;z-index:99999;
    font:11px/1.5 monospace;color:#6b5e52;
    background:rgba(240,232,224,.85);backdrop-filter:blur(8px);
    padding:4px 8px;border-radius:3px;
    border:1px solid rgba(42,128,144,.2);pointer-events:none;
  `;
  document.body.appendChild(el);

  let frameCount = 0;
  const originalRender = renderer.render.bind(renderer);
  renderer.render = function (scene, camera) {
    originalRender(scene, camera);
    frameCount++;
    if (frameCount % 60 === 0) {
      const info = renderer.info;
      el.innerHTML =
        'Tri: ' + info.render.triangles +
        '<br>Calls: ' + info.render.calls +
        '<br>Tex: ' + info.memory.textures +
        '<br>Geo: ' + info.memory.geometries;
    }
  };
}
