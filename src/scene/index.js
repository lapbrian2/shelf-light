import * as THREE from 'three';

/* ══════════════════════════════════════════
   THREE.JS — renderer, scene, camera, helpers
══════════════════════════════════════════ */
const canvas = document.getElementById('c3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xB8CCCA, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 60);
const proxy = { z: 6.5, x: 0.3, y: 0.1, lx: 0.8, ly: 0.2 };

const M = c => new THREE.MeshBasicMaterial({ color: c, side: THREE.FrontSide });
const P = {
  sage: 0xB8CCCA, salmon: 0xDEB4A0, teal: 0x2A8090, amber: 0xC07820,
  lav: 0xC0A8BE, mauve: 0x9A7070, cream: 0xF0E8E0, sketch: 0x3A2A28,
  yellow: 0xD4B840, midBlue: 0x8AACB8, tan: 0xC0A878, ltSage: 0xC8DAD8, dkTeal: 0x1E6070
};
const add = (g, m, p, r) => {
  const o = new THREE.Mesh(g, m);
  if (p) o.position.set(...p);
  if (r) o.rotation.set(...r);
  scene.add(o);
  return o;
};

export { THREE, renderer, scene, camera, proxy, M, P, add };
