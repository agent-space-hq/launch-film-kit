// The stage: one 2D drawing surface + the GL post pipeline + the kit context (k)
// that every effect receives. A "film" is anything with { duration, draw(g, t) }.
//
// Frame = pure function of time. renderFrame(i) draws `sub` sub-frames across the
// shutter interval and accumulates them in linear light for real motion blur.

import * as ease from './ease.js';
import * as M from './math.js';
import * as C from './color.js';
import { makeText } from './text.js';
import { makeDraw } from './draw.js';
import { makeLogo } from './logo.js';
import { makeQA } from './qa.js';
import { createPost, fxShader, vec4 } from './gl.js';

export const DEFAULT_BRAND = {
  name: 'Vela',
  mode: 'dark',
  colors: { bg: '#07080b', fg: '#f4f5f7', muted: '#8b909a', surface: '#12141a', line: '#262a33', accent: '#5b8cff', accent2: '#ff7a45', accent3: '#3ddc97' },
  fonts: {
    display: { family: 'Geist', weight: 640, tracking: -0.035 },
    text: { family: 'Geist', weight: 440, tracking: -0.005 },
    mono: { family: 'Geist Mono', weight: 450, tracking: 0 },
    serif: { family: 'Instrument Serif', weight: 400, tracking: -0.01 },
  },
};

// Fill missing brand fields with defaults (shallow per group).
export function resolveBrand(b = {}) {
  const out = { ...DEFAULT_BRAND, ...b };
  out.colors = { ...DEFAULT_BRAND.colors, ...(b.colors || {}) };
  out.fonts = { ...DEFAULT_BRAND.fonts };
  for (const r of Object.keys(b.fonts || {})) out.fonts[r] = { ...(DEFAULT_BRAND.fonts[r] || {}), ...b.fonts[r] };
  out.copy = { ...(b.copy || {}) };
  return out;
}

export function makeKit(W, H, brandIn) {
  const brand = resolveBrand(brandIn);
  const k = {
    W, H, brand,
    u: Math.min(W, H) / 1080,
    aspect: W / H,
    cx: W / 2, cy: H / 2,
    vmin: Math.min(W, H), vmax: Math.max(W, H),
    isPortrait: H > W * 1.05, isWide: W > H * 1.2, isSquareish: Math.abs(W / H - 1) <= 0.3,
    isDark: C.luminance(brand.colors.bg) < 0.2,
    ease, m: M, color: C,
    qaEnabled: false,
    frameIndex: 0, fps: 60,
  };
  k.safe = { x: W * 0.06, y: H * 0.07, w: W * 0.88, h: H * 0.86 };
  k.qa = makeQA(k);
  k.text = makeText(k);
  k.draw = makeDraw(k);
  k.logo = makeLogo(k);
  k.copy = (key, fallback) => (brand.copy && brand.copy[key] !== undefined ? brand.copy[key] : fallback);
  // Offscreen canvases (same size as frame), reused by name.
  const pool = new Map();
  k.layer = (name) => {
    let c = pool.get(name);
    if (!c) {
      c = document.createElement('canvas'); c.width = W; c.height = H;
      pool.set(name, c);
    }
    return c;
  };
  k.ctx = (canvas) => canvas.getContext('2d');
  // GPU fragment shader rendered at an arbitrary resolution (scale < 1 is cheaper).
  k.shader = (frag, scale = 1) => fxShader(frag, Math.max(2, Math.round(W * scale)), Math.max(2, Math.round(H * scale)));
  k.vec4 = vec4;
  // Responsive pick: k.pick({ wide: a, square: b, tall: c })
  k.pick = (o) => (k.isPortrait ? (o.tall ?? o.square ?? o.wide) : k.isSquareish ? (o.square ?? o.wide) : o.wide);
  return k;
}

// Wrap an effect module into a film for previewing it on its own.
export function effectFilm(k, mod, params = {}) {
  const p = resolveParams(mod.meta, params);
  const inst = mod.create(k, p);
  const dur = p.duration ?? mod.meta.duration ?? 4;
  return {
    duration: dur,
    loop: !!mod.meta.loop,
    meta: mod.meta,
    draw(g, t) {
      if (!mod.meta.ownsBackground) k.draw.background(g, { gradient: mod.meta.flatBackground ? false : undefined });
      if (mod.meta.category === 'transition') {
        // transitions preview between two sample "shots"
        const a = k.layer('__tA'), b = k.layer('__tB');
        k.qa.mute(() => { sampleShot(k, k.ctx(a), 'A', t, dur); sampleShot(k, k.ctx(b), 'B', t, dur); });
        inst.draw(g, t, { a, b, dur });
      } else inst.draw(g, t);
    },
    sfx: typeof mod.sfx === 'function' ? mod.sfx(p, dur) : (mod.meta.sfx || []),
  };
}

// Two neutral sample shots used when previewing transitions.
export function sampleShot(k, g, which, t, dur) {
  const c = k.brand.colors;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (which === 'A') {
    g.fillStyle = c.bg; g.fillRect(0, 0, k.W, k.H);
    k.draw.dotGrid(g, 34, 1.3, C.alpha(c.fg, 0.1), { offsetX: t * 12 });
    k.text.draw(g, k.copy('transitionA', 'Before'), k.cx, k.cy, { size: k.pick({ wide: 150, square: 128, tall: 118 }), align: 'center', baseline: 'middle' });
  } else {
    const grd = g.createLinearGradient(0, 0, k.W, k.H);
    grd.addColorStop(0, c.accent); grd.addColorStop(1, C.mix(c.accent, c.accent2 || c.accent, 0.65));
    g.fillStyle = grd; g.fillRect(0, 0, k.W, k.H);
    k.text.draw(g, k.copy('transitionB', 'After'), k.cx, k.cy, { size: k.pick({ wide: 150, square: 128, tall: 118 }), align: 'center', baseline: 'middle', color: '#ffffff' });
  }
  g.restore();
}

export function resolveParams(meta = {}, given = {}) {
  const out = {};
  for (const [key, spec] of Object.entries(meta.params || {})) out[key] = spec && typeof spec === 'object' && 'default' in spec ? spec.default : spec;
  return { ...out, ...given };
}

export class Stage {
  constructor(W, H, brand) {
    this.W = W; this.H = H;
    this.k = makeKit(W, H, brand);
    this.layer = document.createElement('canvas');
    this.layer.width = W; this.layer.height = H;
    this.g = this.layer.getContext('2d', { alpha: false });
    this.out = document.createElement('canvas');
    this.out.id = 'out';
    document.body.appendChild(this.out);
    this.post = createPost(this.out, W, H);
    this.film = null;
    this.post0 = { bloom: 0.0, grain: this.k.isDark ? 0.028 : 0.018, vignette: this.k.isDark ? 0.16 : 0.0, threshold: 0.75 };
  }
  setFilm(film) { this.film = film; return { duration: film.duration, loop: !!film.loop }; }
  setPost(o) { Object.assign(this.post0, o); }
  // Draw the film at time t into the 2D layer (no post).
  drawAt(t) {
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.shadowColor = 'transparent'; g.shadowBlur = 0;
    g.fillStyle = this.k.brand.colors.bg;
    g.fillRect(0, 0, this.W, this.H);
    this.k.qa.begin();
    const dur = this.film.duration;
    const tt = this.film.loop ? ((t % dur) + dur) % dur : Math.max(0, Math.min(dur, t));
    g.save();
    this.film.draw(g, tt);
    g.restore();
  }
  // Render frame index i at fps with `sub` sub-frames over `shutter` (fraction of a frame).
  renderFrame(i, fps = 60, sub = 1, shutter = 0.5) {
    this.k.frameIndex = i; this.k.fps = fps;
    this.post.begin();
    const n = Math.max(1, sub | 0);
    for (let s = 0; s < n; s++) {
      const off = n === 1 ? 0 : ((s + 0.5) / n - 0.5) * shutter;
      this.drawAt((i + off) / fps);
      this.post.add(this.layer, 1 / n);
    }
    // QA records reflect the last sub-frame (centre-ish) — good enough for layout checks
    const postOpts = { ...this.post0, ...(this.film.post ? this.film.post((i) / fps) : {}), seed: i };
    this.post.finish(postOpts);
  }
}
