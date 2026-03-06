/* ══════════════════════════════════════════
   POST-PROCESSING — film grain, vignette, chromatic aberration
   Subtle "I can't explain why this feels premium" touches.
══════════════════════════════════════════ */

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/* ── Film Grain Shader ── */
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime:    { value: 0.0 },
    uIntensity: { value: 0.04 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;

    // Hash-based noise — fast, no texture lookup
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Animated grain: seed shifts every frame via uTime
      float grain = hash(vUv * 1000.0 + uTime * 137.0) - 0.5;
      color.rgb += grain * uIntensity;

      gl_FragColor = color;
    }
  `
};

/* ── Vignette Shader ── */
const VignetteShader = {
  uniforms: {
    tDiffuse:  { value: null },
    uRadius:   { value: 0.85 },
    uSoftness: { value: 0.45 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uRadius;
    uniform float uSoftness;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Distance from center (0,0 at center, ~0.707 at corners)
      vec2 center = vUv - 0.5;
      float dist = length(center);

      // Smooth falloff — darken edges gently
      float vig = smoothstep(uRadius, uRadius - uSoftness, dist);
      color.rgb *= vig;

      gl_FragColor = color;
    }
  `
};

/* ── Chromatic Aberration Shader ── */
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse:   { value: null },
    uOffset:    { value: 0.0 },    // current aberration strength
    uDirection: { value: [0.0, 0.0] }  // mouse-driven direction
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    uniform vec2 uDirection;
    varying vec2 vUv;

    void main() {
      // Shift R and B channels in opposite directions along mouse vector
      vec2 shift = uDirection * uOffset;

      float r = texture2D(tDiffuse, vUv + shift).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - shift).b;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

/* ── Public API ── */

/**
 * Create the EffectComposer with all three passes.
 * Call once after renderer is set up.
 */
export function initPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // Base render pass
  composer.addPass(new RenderPass(scene, camera));

  // Film grain (animated noise)
  const grainPass = new ShaderPass(FilmGrainShader);
  composer.addPass(grainPass);

  // Vignette (gentle edge darkening)
  const vignettePass = new ShaderPass(VignetteShader);
  composer.addPass(vignettePass);

  // Chromatic aberration (mouse-reactive)
  const caPass = new ShaderPass(ChromaticAberrationShader);
  composer.addPass(caPass);

  // Tag passes for easy lookup in update
  composer._grainPass = grainPass;
  composer._caPass = caPass;

  return composer;
}

/**
 * Update per-frame uniforms.
 * Call every frame before composer.render().
 *
 * @param {EffectComposer} composer - the composer from initPostProcessing
 * @param {{ mx: number, my: number, sx2: number, sy2: number }} mouse - smoothed mouse state
 * @param {number} time - elapsed time in seconds (clock.getElapsedTime())
 */
export function updatePostProcessing(composer, mouse, time) {
  // Grain — animate seed
  composer._grainPass.uniforms.uTime.value = time;

  // Chromatic aberration — scale with mouse distance from center
  // mouse.sx2 and mouse.sy2 are in [-1, 1] range
  const dist = Math.sqrt(mouse.sx2 * mouse.sx2 + mouse.sy2 * mouse.sy2);
  const maxOffset = 0.002;
  composer._caPass.uniforms.uOffset.value = dist * maxOffset;

  // Direction: normalized mouse vector (avoid divide-by-zero)
  const len = dist || 1;
  composer._caPass.uniforms.uDirection.value = [
    mouse.sx2 / len,
    mouse.sy2 / len
  ];
}
