// Sound, written in code: a deterministic score + sound-design synthesizer on
// OfflineAudioContext. No samples, no licensed music: every sound is generated.
//
// spec = {
//   bpm: 110, root: 50 (MIDI), scale: 'minor'|'major',
//   progression: [[0,3,7,10], [-4,0,3,7], ...]   // chord tones (semitones from root), one per bar
//   sections: [{ from, to, energy 0..1, layers: ['pad','bass','arp','kick','hat','pulse'] }],
//   cues: [{ t, type: 'hit'|'sub'|'whoosh'|'riser'|'tick'|'click'|'pop'|'bell'|'swell'|'stamp'|'type'|'shimmer', gain, dur, pitch }],
//   master: { gain }
// }

import { rng } from './math.js';

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

function noiseBuffer(ctx, seconds, seed = 3) {
  const r = rng(seed);
  const n = Math.ceil(ctx.sampleRate * seconds);
  const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = r() * 2 - 1; }
  return b;
}
function impulse(ctx, seconds = 2.8, decay = 3.2, seed = 9) {
  const r = rng(seed);
  const n = Math.ceil(ctx.sampleRate * seconds);
  const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < n; i++) { const x = i / n; d[i] = (r() * 2 - 1) * (1 - x) ** decay * (i < 64 ? i / 64 : 1); }
  }
  return b;
}

export async function renderScore(spec, duration, sampleRate = 48000) {
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const noise = noiseBuffer(ctx, 4, 17);
  const master = ctx.createGain(); master.gain.value = spec.master?.gain ?? 0.8;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 3.5; comp.attack.value = 0.006; comp.release.value = 0.22;
  master.connect(comp); comp.connect(ctx.destination);
  const verb = ctx.createConvolver(); verb.buffer = impulse(ctx);
  const verbGain = ctx.createGain(); verbGain.gain.value = 0.32;
  verb.connect(verbGain); verbGain.connect(master);
  const musicBus = ctx.createGain(); musicBus.gain.value = 1; musicBus.connect(master);
  const musicSend = ctx.createGain(); musicSend.gain.value = 0.35; musicBus.connect(musicSend); musicSend.connect(verb);
  const sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
  const sfxSend = ctx.createGain(); sfxSend.gain.value = 0.25; sfxBus.connect(sfxSend); sfxSend.connect(verb);

  const bpm = spec.bpm || 110, beat = 60 / bpm, bar = beat * 4;
  const root = spec.root ?? 50;
  const prog = spec.progression || [[0, 3, 7, 10], [-4, 0, 3, 7], [-7, -4, 0, 3], [-2, 2, 5, 9]];
  const chordAt = (t) => prog[Math.floor(t / bar) % prog.length];
  const sections = spec.sections || [{ from: 0, to: duration, energy: 0.5, layers: ['pad', 'bass'] }];

  // Sidechain: a gain on the music bus ducked on every kick.
  const duck = ctx.createGain(); duck.gain.value = 1;
  musicBus.disconnect(); musicBus.connect(duck); duck.connect(master); duck.connect(musicSend);

  const env = (param, t0, a, peak, d, sustainLevel, hold, r) => {
    param.setValueAtTime(0.0001, t0);
    param.exponentialRampToValueAtTime(Math.max(0.0001, peak), t0 + a);
    param.exponentialRampToValueAtTime(Math.max(0.0001, peak * sustainLevel), t0 + a + d);
    param.setValueAtTime(Math.max(0.0001, peak * sustainLevel), t0 + a + d + hold);
    param.exponentialRampToValueAtTime(0.0001, t0 + a + d + hold + r);
  };
  const noiseSrc = (t0, dur, offset = 0) => {
    const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true;
    s.start(Math.max(0, t0), offset % 3.5, dur); return s;
  };
  const pan = (p) => { const n = ctx.createStereoPanner(); n.pan.value = p; return n; };

  // ---------- music layers ----------
  function pad(t0, t1, energy) {
    for (let b = Math.floor(t0 / bar); b * bar < t1; b++) {
      const bs = Math.max(t0, b * bar), be = Math.min(t1, (b + 1) * bar);
      const chord = chordAt(b * bar + 0.01);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
      lp.frequency.setValueAtTime(500 + energy * 1400, bs);
      lp.frequency.linearRampToValueAtTime(800 + energy * 2200, be);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, bs);
      g.gain.linearRampToValueAtTime(0.06 + energy * 0.05, bs + Math.min(0.6, (be - bs) * 0.4));
      g.gain.setValueAtTime(0.06 + energy * 0.05, be - 0.25);
      g.gain.linearRampToValueAtTime(0.0001, be + 0.35);
      lp.connect(g); g.connect(musicBus);
      chord.forEach((iv, vi) => {
        [-6, 6].forEach((det, di) => {
          const o = ctx.createOscillator(); o.type = vi === 0 ? 'triangle' : 'sawtooth';
          o.frequency.value = mtof(root + iv + (vi === 0 ? -12 : 0)); o.detune.value = det + vi * 1.5;
          const og = ctx.createGain(); og.gain.value = vi === 0 ? 0.5 : 0.22;
          const p = pan(di ? 0.35 : -0.35);
          o.connect(og); og.connect(p); p.connect(lp);
          o.start(bs); o.stop(be + 0.4);
        });
      });
    }
  }
  function bass(t0, t1, energy) {
    const step = beat / 2;
    for (let t = Math.ceil(t0 / step) * step; t < t1 - 0.01; t += step) {
      const chord = chordAt(t + 0.001);
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.value = mtof(root + chord[0] - 24);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180 + energy * 260; lp.Q.value = 2;
      const g = ctx.createGain();
      env(g.gain, t, 0.008, 0.11 + energy * 0.08, 0.12, 0.35, step * 0.3, 0.08);
      o.connect(lp); lp.connect(g); g.connect(musicBus);
      o.start(t); o.stop(t + step + 0.2);
    }
  }
  function arp(t0, t1, energy, seed = 5) {
    const step = beat / 4;
    const r = rng(seed);
    let i = 0;
    for (let t = Math.ceil(t0 / step) * step; t < t1 - 0.01; t += step, i++) {
      if (r() < 0.12) continue;
      const chord = chordAt(t + 0.001);
      const note = root + chord[i % chord.length] + 12 + (Math.floor(i / chord.length) % 2) * 12;
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(note);
      const g = ctx.createGain();
      env(g.gain, t, 0.003, 0.035 + energy * 0.03, 0.09, 0.2, 0.02, 0.18);
      const p = pan((i % 4) / 3 - 0.5);
      o.connect(g); g.connect(p); p.connect(musicBus);
      o.start(t); o.stop(t + 0.45);
    }
  }
  function kick(t0, t1, energy, every = 1) {
    for (let t = Math.ceil(t0 / (beat * every)) * beat * every; t < t1 - 0.01; t += beat * every) {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      const g = ctx.createGain(); env(g.gain, t, 0.002, 0.55 + energy * 0.25, 0.08, 0.4, 0.05, 0.25);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5);
      duck.gain.setValueAtTime(1, t); duck.gain.linearRampToValueAtTime(0.55, t + 0.012); duck.gain.linearRampToValueAtTime(1, t + beat * 0.6);
    }
  }
  function hat(t0, t1, energy) {
    const step = beat / 2;
    let i = 0;
    for (let t = Math.ceil(t0 / step) * step; t < t1 - 0.01; t += step, i++) {
      const s = noiseSrc(t, 0.08, t * 1.37);
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500;
      const g = ctx.createGain(); env(g.gain, t, 0.001, (i % 2 ? 0.05 : 0.03) * (0.5 + energy), 0.03, 0.2, 0.0, 0.03);
      s.connect(hp); hp.connect(g); g.connect(musicBus);
    }
  }
  function pulse(t0, t1, energy) { // soft eighth-note synth pulse on chord tones
    const step = beat / 2;
    let i = 0;
    for (let t = Math.ceil(t0 / step) * step; t < t1 - 0.01; t += step, i++) {
      const chord = chordAt(t + 0.001);
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = mtof(root + chord[(i >> 1) % chord.length]);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900 + energy * 1500;
      const g = ctx.createGain(); env(g.gain, t, 0.004, 0.025 + energy * 0.02, 0.1, 0.3, 0.02, 0.1);
      o.connect(lp); lp.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.35);
    }
  }
  for (const s of sections) {
    const L = new Set(s.layers || ['pad']);
    const e = s.energy ?? 0.5;
    if (L.has('pad')) pad(s.from, s.to, e);
    if (L.has('bass')) bass(s.from, s.to, e);
    if (L.has('arp')) arp(s.from, s.to, e, Math.round(s.from * 10) + 3);
    if (L.has('kick')) kick(s.from, s.to, e, s.kickEvery || 1);
    if (L.has('hat')) hat(s.from, s.to, e);
    if (L.has('pulse')) pulse(s.from, s.to, e);
  }

  // ---------- sound design cues ----------
  const cue = {
    hit(t, g0 = 1, o = {}) { // cinematic impact: pitched-down sine + body + noise crack
      const s = ctx.createOscillator(); s.type = 'sine';
      s.frequency.setValueAtTime(o.pitch || 110, t); s.frequency.exponentialRampToValueAtTime(34, t + 0.5);
      const g = ctx.createGain(); env(g.gain, t, 0.003, 0.9 * g0, 0.25, 0.3, 0.1, 0.9);
      s.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 1.6);
      const n = noiseSrc(t, 0.3, t * 3.1); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.6;
      const ng = ctx.createGain(); env(ng.gain, t, 0.001, 0.35 * g0, 0.05, 0.2, 0.0, 0.2);
      n.connect(bp); bp.connect(ng); ng.connect(sfxBus);
    },
    sub(t, g0 = 1, o = {}) {
      const s = ctx.createOscillator(); s.type = 'sine';
      s.frequency.setValueAtTime(o.pitch || 62, t); s.frequency.exponentialRampToValueAtTime(30, t + (o.dur || 1.6));
      const g = ctx.createGain(); env(g.gain, t, 0.01, 0.8 * g0, 0.3, 0.6, 0.2, (o.dur || 1.6));
      s.connect(g); g.connect(master); s.start(t); s.stop(t + (o.dur || 1.6) + 0.8);
    },
    whoosh(t, g0 = 1, o = {}) { // filtered noise sweep, centred on t
      let d = o.dur || 0.6, t0 = t - d * 0.6; if (t0 < 0) { t0 = 0; d = Math.max(0.1, (t - t0) / 0.6); }
      const n = noiseSrc(t0, d + 0.2, t * 2.3);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(o.pitch || 3200, t); bp.frequency.exponentialRampToValueAtTime(600, t0 + d);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.5 * g0, t); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.1);
      const p = ctx.createStereoPanner(); p.pan.setValueAtTime(-0.6, t0); p.pan.linearRampToValueAtTime(0.6, t0 + d);
      n.connect(bp); bp.connect(g); g.connect(p); p.connect(sfxBus);
    },
    riser(t, g0 = 1, o = {}) { // builds up and ENDS at t
      const t0 = Math.max(0, t - (o.dur || 2)), d = Math.max(0.05, t - t0);
      const n = noiseSrc(t0, d, t);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2;
      bp.frequency.setValueAtTime(400, t0); bp.frequency.exponentialRampToValueAtTime(7000, t);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.32 * g0, t - 0.02); g.gain.linearRampToValueAtTime(0.0001, t + 0.03);
      n.connect(bp); bp.connect(g); g.connect(sfxBus);
      const s = ctx.createOscillator(); s.type = 'sawtooth';
      s.frequency.setValueAtTime(mtof(root + 12), t0); s.frequency.exponentialRampToValueAtTime(mtof(root + 36), t);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t0); lp.frequency.exponentialRampToValueAtTime(5000, t);
      const sg = ctx.createGain(); sg.gain.setValueAtTime(0.0001, t0); sg.gain.exponentialRampToValueAtTime(0.06 * g0, t - 0.02); sg.gain.linearRampToValueAtTime(0.0001, t + 0.03);
      s.connect(lp); lp.connect(sg); sg.connect(sfxBus); s.start(t0); s.stop(t + 0.05);
    },
    swell(t, g0 = 1, o = {}) { // reverse-cymbal style swell ending at t
      const t0 = Math.max(0, t - (o.dur || 1.2)), d = Math.max(0.05, t - t0);
      const n = noiseSrc(t0, d, t * 0.7);
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.28 * g0, t); g.gain.linearRampToValueAtTime(0.0001, t + 0.02);
      n.connect(hp); hp.connect(g); g.connect(sfxBus);
    },
    tick(t, g0 = 1, o = {}) {
      const s = ctx.createOscillator(); s.type = 'sine'; s.frequency.value = o.pitch || 2600;
      const g = ctx.createGain(); env(g.gain, t, 0.0008, 0.18 * g0, 0.012, 0.1, 0, 0.02);
      s.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 0.06);
    },
    click(t, g0 = 1) {
      const n = noiseSrc(t, 0.04, t * 5.3);
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
      const g = ctx.createGain(); env(g.gain, t, 0.0005, 0.3 * g0, 0.008, 0.1, 0, 0.015);
      n.connect(hp); hp.connect(g); g.connect(sfxBus);
      const s = ctx.createOscillator(); s.frequency.value = 1400; const sg = ctx.createGain(); env(sg.gain, t, 0.0005, 0.08 * g0, 0.01, 0.1, 0, 0.02);
      s.connect(sg); sg.connect(sfxBus); s.start(t); s.stop(t + 0.05);
    },
    pop(t, g0 = 1, o = {}) {
      const s = ctx.createOscillator(); s.type = 'sine';
      s.frequency.setValueAtTime((o.pitch || 900), t); s.frequency.exponentialRampToValueAtTime((o.pitch || 900) * 0.45, t + 0.07);
      const g = ctx.createGain(); env(g.gain, t, 0.001, 0.25 * g0, 0.04, 0.2, 0, 0.06);
      s.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 0.15);
    },
    bell(t, g0 = 1, o = {}) { // FM bell
      const f = o.pitch ? mtof(o.pitch) : mtof(root + 24 + 7);
      const car = ctx.createOscillator(); car.frequency.value = f;
      const mod = ctx.createOscillator(); mod.frequency.value = f * 2.76;
      const mg = ctx.createGain(); mg.gain.setValueAtTime(f * 1.6, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 1.2);
      mod.connect(mg); mg.connect(car.frequency);
      const g = ctx.createGain(); env(g.gain, t, 0.002, 0.12 * g0, 0.3, 0.3, 0.1, 1.6);
      car.connect(g); g.connect(sfxBus);
      car.start(t); mod.start(t); car.stop(t + 2.2); mod.stop(t + 2.2);
    },
    shimmer(t, g0 = 1, o = {}) { // quick upward sparkle of bell partials
      const base = root + 24;
      [0, 4, 7, 12, 16].forEach((iv, i) => cue.bell(t + i * 0.045, 0.45 * g0, { pitch: base + iv + (o.shift || 0) }));
    },
    stamp(t, g0 = 1) { cue.hit(t, 0.8 * g0, { pitch: 160 }); cue.click(t + 0.005, 1.2 * g0); },
    type(t, g0 = 1, o = {}) { // keyboard burst: n clicks over dur
      const n = o.n || 8, d = o.dur || 0.6, r = rng(Math.round(t * 1000));
      for (let i = 0; i < n; i++) cue.click(t + (i / n) * d + r() * 0.02, 0.5 * g0 * (0.7 + r() * 0.6));
    },
  };
  for (const c of spec.cues || []) {
    const f = cue[c.type];
    if (f && c.t >= 0 && c.t < duration + 1) f(c.t, c.gain ?? 1, c);
  }
  const buf = await ctx.startRendering();
  return encodeWav(buf);
}

export function encodeWav(buf) {
  const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
  w(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const data = [];
  for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) {
    const v = Math.max(-1, Math.min(1, data[c][i]));
    out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
  }
  return out.buffer;
}
