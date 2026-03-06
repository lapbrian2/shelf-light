import { THREE, M, add, scene } from './index.js';

/* ══════════════════════════════════════════
   PENDANTS + VOLUMETRIC LIGHT CONES
══════════════════════════════════════════ */
export const pendants = [];

[[-2.5, -1.5], [2.5, -1.5]].forEach(([px, pz]) => {
  const torus = add(new THREE.TorusGeometry(0.26, 0.03, 6, 20), M(0x8898A8), [px, 6.2, pz]);
  const wire = add(new THREE.CylinderGeometry(0.015, 0.015, 2, 6), M(0x8898A8), [px, 7.2, pz]);
  pendants.push({ torus, wire, baseX: px, baseZ: pz });
});

// Warm light cones — volumetric glow via transparent cones
pendants.forEach((p) => {
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xF0E8E0, transparent: true, opacity: 0.04,
    side: THREE.DoubleSide, depthWrite: false
  });
  const coneGeo = new THREE.ConeGeometry(2.5, 8, 16, 1, true);
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(p.baseX, 2, p.baseZ);
  cone.rotation.x = Math.PI;
  scene.add(cone);
  p.cone = cone; p.coneMat = coneMat;
});
