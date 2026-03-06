import { THREE, M, P, add, scene } from './index.js';

/* ══════════════════════════════════════════
   CAFE GEOMETRY — room, furniture, objects
══════════════════════════════════════════ */

// Book color palette
const BC = [P.teal, P.cream, P.amber, P.salmon, P.lav, P.sage, P.yellow, P.midBlue, 0x8A6858, 0xC84840, 0xA8C4B8, 0xE89878];

// ── Room box ──
add(new THREE.PlaneGeometry(28, 16), M(P.sage), [1, 0, -7]);
add(new THREE.PlaneGeometry(16, 16), M(P.salmon), [12, 0, 0], [0, -Math.PI / 2, 0]);
add(new THREE.PlaneGeometry(16, 16), M(P.tan), [-10, 0, 0], [0, Math.PI / 2, 0]);
add(new THREE.PlaneGeometry(28, 16), M(P.ltSage), [1, 8, 0], [-Math.PI / 2, 0, 0]);
add(new THREE.PlaneGeometry(28, 16), M(0xC8D8D4), [1, -4, 0], [Math.PI / 2, 0, 0]);

// ── Shadow — mauve floor ──
add(new THREE.PlaneGeometry(7, 5), M(P.mauve), [1, -3.97, 2.5], [Math.PI / 2, 0, 0]);
[[-1.5, 4.5], [3, 4.8], [0.5, 1.8]].forEach(([x, z]) =>
  add(new THREE.PlaneGeometry(1.4, 1.6), M(P.mauve), [x, -3.96, z], [Math.PI / 2, 0, 0]));

// ── Door ──
add(new THREE.BoxGeometry(2.4, 6.2, 0.08), M(P.midBlue), [-2, -0.4, -6.94]);
[[-0.6, 0.9], [0.6, 0.9], [-0.6, -0.9], [0.6, -0.9]].forEach(([px, py]) =>
  add(new THREE.BoxGeometry(0.88, 1.2, 0.04), M(0x7890A8), [-2 + px, -0.4 + py, -6.90]));

// ── Teal bar — chromatic anchor ──
add(new THREE.BoxGeometry(9.5, 2.4, 0.1), M(P.teal), [6, -2.0, -0.5]);
add(new THREE.BoxGeometry(9.5, 0.12, 4), M(P.cream), [6, -0.82, -2.55]);
add(new THREE.BoxGeometry(9.5, 2.4, 0.1), M(P.dkTeal), [6, -2.0, -4.54]);
add(new THREE.BoxGeometry(3.2, 1.5, 0.09), M(P.yellow), [2.8, -1.52, -0.52]);

// ── Shelves ──
add(new THREE.BoxGeometry(9.5, 8.5, 0.06), M(P.lav), [6, 1.8, -6.92]);
[-0.5, 1.9, 4.4].forEach(y => add(new THREE.BoxGeometry(9.5, 0.1, 0.6), M(P.amber), [6, y, -6.64]));

// ── Books — store refs for animation ──
export const allBooks = [];
function bookRow(sx, y, z, n) {
  let x = sx;
  for (let i = 0; i < n; i++) {
    const w = 0.14 + Math.random() * .12, h = 0.9 + Math.random() * .6;
    const bk = add(new THREE.BoxGeometry(w, h, 0.5), M(BC[(i + Math.floor(y * 3)) % BC.length]), [x + w / 2, y + h / 2, z]);
    allBooks.push({ mesh: bk, baseY: y + h / 2, baseRz: 0, idx: allBooks.length });
    x += w + 0.01 + Math.random() * .015;
    if (x > 10.8) break;
  }
}
bookRow(1.8, -0.5, -6.61, 26);
bookRow(1.8, 1.9, -6.61, 28);
bookRow(1.8, 4.4, -6.61, 22);

// ── Left bookcase ──
add(new THREE.BoxGeometry(0.07, 7.5, 6.5), M(P.tan), [-9.6, 0.4, -2.5]);
[-0.3, 2.0, 4.2].forEach(y => add(new THREE.BoxGeometry(0.55, 0.09, 6.5), M(P.amber), [-9.36, y, -2.5]));

// ── Table ──
add(new THREE.BoxGeometry(4.2, 0.09, 2.2), M(P.cream), [0.8, -0.45, 2.5]);
[[1.9, 0.58], [1.9, -0.58], [-1.9, 0.58], [-1.9, -0.58]].forEach(([tx, tz]) =>
  add(new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8), M(P.sketch), [0.8 + tx, -2.2, 2.5 + tz]));

// ── Cups ──
export const cupPositions = [];
[[-.6, 2.0], [1.3, 2.9]].forEach(([cx2, cz]) => {
  add(new THREE.CylinderGeometry(0.13, 0.11, 0.25, 12), M(P.cream), [cx2, -0.3, cz]);
  add(new THREE.CylinderGeometry(0.22, 0.2, 0.03, 12), M(0xE8E0D8), [cx2, -0.43, cz]);
  cupPositions.push({ x: cx2, y: -0.15, z: cz });
});
add(new THREE.BoxGeometry(0.9, 0.02, 0.65), M(0xE4EEF0), [0.5, -0.41, 2.5]);

// ── Chairs ──
export const chairGroups = [];
function chair(cx2, cz, ry, sc) {
  sc = sc || 1;
  const g = new THREE.Group();
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.82 * sc, 0.07, 0.74 * sc), M(P.teal))));
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.82 * sc, 0.88 * sc, 0.07), M(P.teal));
  b.position.set(0, 0.48 * sc, -0.34 * sc); g.add(b);
  [[0.33 * sc, 0.35 * sc], [0.33 * sc, -0.35 * sc], [-0.33 * sc, 0.35 * sc], [-0.33 * sc, -0.35 * sc]].forEach(([lx3, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.3 * sc, 8), M(P.sketch));
    leg.position.set(lx3, -1.65 * sc, lz); g.add(leg);
  });
  g.position.set(cx2, -0.9, cz); g.rotation.y = ry || 0; scene.add(g);
  chairGroups.push(g);
}
chair(-1.4, 4.3, -0.12);
chair(2.8, 4.6, 0.10);
chair(-0.2, 2.0, 0.06, 0.88);
chair(1.8, 1.8, -0.04, 0.88);
chair(3.4, 4.5, 0.22);
chair(-1.8, 0.9, -0.15, 0.85);

// ── Counter-top stacks ──
add(new THREE.BoxGeometry(0.5, 0.35, 0.4), M(P.cream), [3.2, -0.22, -2.3]);
add(new THREE.BoxGeometry(0.42, 0.25, 0.35), M(P.salmon), [3.2, 0.01, -2.3]);
add(new THREE.BoxGeometry(0.6, 0.5, 0.45), M(P.amber), [4.8, -0.15, -2.2]);
add(new THREE.BoxGeometry(0.48, 0.28, 0.4), M(P.lav), [4.8, 0.14, -2.2]);
add(new THREE.BoxGeometry(0.7, 0.4, 0.5), M(P.midBlue), [6.5, -0.2, -2.1]);
add(new THREE.BoxGeometry(0.55, 0.55, 0.42), M(P.cream), [8.2, -0.13, -2.3]);
add(new THREE.BoxGeometry(0.38, 0.22, 0.32), M(0x8A6858), [8.2, 0.19, -2.3]);

// ── Behind-counter equipment ──
add(new THREE.BoxGeometry(1.0, 1.5, 0.7), M(0x8A6858), [3.5, -1.05, -3.6]);
add(new THREE.BoxGeometry(0.7, 1.2, 0.5), M(P.midBlue), [5.2, -1.2, -3.8]);
add(new THREE.BoxGeometry(0.85, 0.85, 0.6), M(P.cream), [7.2, -1.38, -3.5]);
add(new THREE.BoxGeometry(0.55, 1.3, 0.45), M(P.lav), [8.8, -1.15, -3.7]);

// ── Table extras — papers, napkin ──
add(new THREE.BoxGeometry(0.95, 0.01, 0.65), M(0xE8E4DC), [0.0, -0.40, 2.1]);
add(new THREE.BoxGeometry(0.6, 0.01, 0.45), M(P.cream), [-1.2, -0.40, 3.1]);

// ── Open book on table (focal vignette for Journey) ──
const openBook = new THREE.Group();
const pageMat = new THREE.MeshBasicMaterial({ color: 0xFAF6F0, side: THREE.DoubleSide });
const coverMat = new THREE.MeshBasicMaterial({ color: P.teal, side: THREE.DoubleSide });
// Left page
const lPage = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), pageMat);
lPage.rotation.set(-Math.PI / 2, 0, 0.08);
lPage.position.set(-0.22, 0.02, 0);
openBook.add(lPage);
// Right page
const rPage = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), pageMat);
rPage.rotation.set(-Math.PI / 2, 0, -0.08);
rPage.position.set(0.22, 0.02, 0);
openBook.add(rPage);
// Spine
const spine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.56), coverMat);
spine.position.set(0, 0.0, 0);
openBook.add(spine);
// Cover edges (thin strips peeking under pages)
const lCover = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.58), coverMat);
lCover.rotation.set(-Math.PI / 2, 0, 0.1);
lCover.position.set(-0.23, -0.005, 0);
openBook.add(lCover);
const rCover = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.58), coverMat);
rCover.rotation.set(-Math.PI / 2, 0, -0.1);
rCover.position.set(0.23, -0.005, 0);
openBook.add(rCover);
// Text lines on pages (tiny dark rectangles)
for (let i = 0; i < 6; i++) {
  const lineW = 0.22 + Math.random() * 0.12;
  const ll = new THREE.Mesh(new THREE.PlaneGeometry(lineW, 0.012), M(0xCCC4BC));
  ll.rotation.set(-Math.PI / 2, 0, 0.08);
  ll.position.set(-0.22, 0.025, -0.18 + i * 0.06);
  openBook.add(ll);
  const rl = new THREE.Mesh(new THREE.PlaneGeometry(lineW, 0.012), M(0xCCC4BC));
  rl.rotation.set(-Math.PI / 2, 0, -0.08);
  rl.position.set(0.22, 0.025, -0.18 + i * 0.06);
  openBook.add(rl);
}
openBook.position.set(-0.4, -0.39, 2.65);
openBook.rotation.y = 0.3;
scene.add(openBook);
export { openBook };

// ── Steam wisps above cups (focal vignette for About) ──
const steamMat = new THREE.MeshBasicMaterial({ color: 0xF0ECE8, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
export const steamWisps = [];
cupPositions.forEach(cup => {
  for (let i = 0; i < 3; i++) {
    const wisp = new THREE.Mesh(new THREE.PlaneGeometry(0.06 + Math.random() * 0.04, 0.12 + Math.random() * 0.08), steamMat.clone());
    wisp.position.set(cup.x + (Math.random() - 0.5) * 0.08, cup.y + 0.1 + i * 0.08, cup.z + (Math.random() - 0.5) * 0.06);
    wisp.rotation.y = Math.random() * Math.PI;
    scene.add(wisp);
    steamWisps.push({ mesh: wisp, baseY: wisp.position.y, baseX: wisp.position.x, phase: Math.random() * Math.PI * 2 });
  }
});

// ── Counter plant (focal vignette for How) ──
const plantGroup = new THREE.Group();
// Pot
const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.2, 8), M(P.salmon));
pot.position.set(0, 0, 0);
plantGroup.add(pot);
// Soil
const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 8), M(0x6B5E52));
soil.position.set(0, 0.1, 0);
plantGroup.add(soil);
// Leaves (small tilted planes)
const leafMat = M(0x5A9A6A);
for (let i = 0; i < 5; i++) {
  const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.16), leafMat);
  const angle = (i / 5) * Math.PI * 2;
  leaf.position.set(Math.cos(angle) * 0.06, 0.2 + Math.random() * 0.08, Math.sin(angle) * 0.06);
  leaf.rotation.set(-0.3 + Math.random() * 0.2, angle, 0.3 - Math.random() * 0.15);
  plantGroup.add(leaf);
}
plantGroup.position.set(6.5, -0.55, -2.1);
scene.add(plantGroup);

// ── Wall frames near door ──
add(new THREE.BoxGeometry(0.7, 0.9, 0.03), M(P.salmon), [-4.5, 1.8, -6.92]);
add(new THREE.BoxGeometry(0.5, 0.7, 0.03), M(P.lav), [-6.0, 2.0, -6.92]);

// ── Left bookcase books ──
(function () {
  function lBooks(sy, count) {
    let z = -5.4;
    for (let i = 0; i < count; i++) {
      const w = 0.12 + Math.random() * .09, h = 0.55 + Math.random() * .5;
      const bk = add(new THREE.BoxGeometry(0.38, h, w), M(BC[(i + Math.floor(sy * 3)) % BC.length]), [-9.12, sy + h / 2, z + w / 2]);
      allBooks.push({ mesh: bk, baseY: sy + h / 2, baseRz: 0, idx: allBooks.length });
      z += w + 0.01; if (z > 0.3) break;
    }
  }
  lBooks(-0.3, 12); lBooks(2.0, 10); lBooks(4.2, 8);
})();

// ── Book tilt — subtle random lean ──
allBooks.forEach((b) => {
  const lean = (Math.random() - .5) * .06;
  b.mesh.rotation.z = lean;
  b.baseRz = lean;
});
