/* ══════════════════════════════════════════
   AMBIENT CAFE AUDIO — pink noise murmur
══════════════════════════════════════════ */
let audioCtx, audioOn = false, audioNodes;

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const sr = audioCtx.sampleRate;
  const len = 4 * sr;
  const buf = audioCtx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buf; noise.loop = true;
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 280; lp.Q.value = 0.7;
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 60; hp.Q.value = 0.5;
  const gain = audioCtx.createGain();
  gain.gain.value = 0;
  noise.connect(lp); lp.connect(hp); hp.connect(gain); gain.connect(audioCtx.destination);
  noise.start();
  return { gain };
}

export function initSoundToggle() {
  const soundBtn = document.getElementById('sound-toggle');
  soundBtn.addEventListener('click', () => {
    if (!audioCtx) { audioNodes = initAudio(); }
    audioOn = !audioOn;
    soundBtn.classList.toggle('on', audioOn);
    if (audioOn) {
      audioCtx.resume();
      audioNodes.gain.gain.linearRampToValueAtTime(0.022, audioCtx.currentTime + 1.2);
    } else {
      audioNodes.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
    }
  });
}

export function disposeAudio() {
  if (audioCtx) audioCtx.close();
}
