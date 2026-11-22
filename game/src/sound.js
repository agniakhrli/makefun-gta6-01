// Procedural WebAudio sound system
export function createSound() {
  let ctx = null;
  let muted = false;
  let engineOsc = null;
  let engineGain = null;
  let sirenOsc = null;
  let sirenGain = null;
  let sirenTime = 0;

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function playTone(freq, type, duration, gainVal = 0.1) {
    if (muted) return;
    ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  function playShoot() {
    if (muted) return;
    ensureContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {}
  }

  function playFootstep() {
    playTone(180, 'triangle', 0.05, 0.06);
  }

  function playHorn() {
    playTone(440, 'sawtooth', 0.3, 0.15);
  }

  function playChime() {
    if (muted) return;
    ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  function updateEngine(speed, isDriving) {
    if (muted || !isDriving) {
      if (engineGain) engineGain.gain.value = 0;
      return;
    }
    ensureContext();
    if (!ctx) return;

    try {
      if (!engineOsc) {
        engineOsc = ctx.createOscillator();
        engineGain = ctx.createGain();
        engineOsc.type = 'sawtooth';
        engineOsc.frequency.setValueAtTime(60, ctx.currentTime);
        engineGain.gain.setValueAtTime(0.05, ctx.currentTime);
        engineOsc.connect(engineGain);
        engineGain.connect(ctx.destination);
        engineOsc.start();
      }
      const freq = 50 + Math.abs(speed) * 3;
      engineOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
      engineGain.gain.setTargetAtTime(0.08, ctx.currentTime, 0.1);
    } catch {}
  }

  function updateSiren(dt, activeWanted) {
    if (muted || activeWanted <= 0) {
      if (sirenGain) sirenGain.gain.value = 0;
      return;
    }
    ensureContext();
    if (!ctx) return;

    try {
      if (!sirenOsc) {
        sirenOsc = ctx.createOscillator();
        sirenGain = ctx.createGain();
        sirenOsc.type = 'sine';
        sirenGain.gain.setValueAtTime(0.1, ctx.currentTime);
        sirenOsc.connect(sirenGain);
        sirenGain.connect(ctx.destination);
        sirenOsc.start();
      }
      sirenTime += dt * 4;
      const freq = 600 + Math.sin(sirenTime) * 300;
      sirenOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
      sirenGain.gain.setTargetAtTime(0.1, ctx.currentTime, 0.1);
    } catch {}
  }

  function toggleMute() {
    muted = !muted;
    if (muted) {
      if (engineGain) engineGain.gain.value = 0;
      if (sirenGain) sirenGain.gain.value = 0;
    }
    return muted;
  }

  return {
    ensureContext,
    playTone,
    playShoot,
    playFootstep,
    playChime,
    updateEngine,
    updateSiren,
    toggleMute,
    isMuted: () => muted
  };
}
