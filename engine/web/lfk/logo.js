// Brand mark helpers: draw the logo from SVG path data, and sample points on or
// inside it (for particles, stroke-draw and assembly effects).
//
// brand.logo = { viewBox: [x, y, w, h], paths: [{ d, fill: 'fg'|'accent'|'#hex', rule: 'nonzero'|'evenodd' }] }

import { rng } from './math.js';

export function makeLogo(k) {
  const spec = k.brand.logo || {
    viewBox: [0, 0, 100, 100],
    paths: [{ d: 'M50 6a44 44 0 1 0 0 88a44 44 0 1 0 0-88z', fill: 'accent' }],
  };
  const [vx, vy, vw, vh] = spec.viewBox;
  const paths = spec.paths.map((p) => ({ ...p, path: new Path2D(p.d) }));
  const aspect = vw / vh;
  const resolve = (fill, override) => {
    if (override) return override;
    if (!fill || fill === 'fg') return k.brand.colors.fg;
    if (fill === 'accent') return k.brand.colors.accent;
    if (fill === 'accent2') return k.brand.colors.accent2 || k.brand.colors.accent;
    if (fill === 'bg') return k.brand.colors.bg;
    return fill;
  };

  // Draw the mark centred at (cx, cy) with height h px.
  // o.color forces a single color; o.colors maps path index -> color; o.alpha; o.stroke = {color, width, dash}
  function draw(g, cx, cy, h, o = {}) {
    const s = h / vh;
    g.save();
    g.translate(cx - (vw * s) / 2 - vx * s, cy - h / 2 - vy * s);
    g.scale(s, s);
    if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
    paths.forEach((p, i) => {
      if (o.fill !== false) {
        g.fillStyle = (o.colors && o.colors[i]) || resolve(p.fill, o.color);
        g.fill(p.path, p.rule || 'nonzero');
      }
      if (o.stroke) {
        g.strokeStyle = o.stroke.color || resolve(p.fill);
        g.lineWidth = (o.stroke.width ?? 2) / s * k.u;
        g.lineJoin = 'round'; g.lineCap = 'round';
        if (o.stroke.dash) g.setLineDash(o.stroke.dash.map((d) => d / s));
        if (o.stroke.offset !== undefined) g.lineDashOffset = o.stroke.offset / s;
        g.stroke(p.path);
        g.setLineDash([]);
      }
    });
    g.restore();
    return { w: vw * s, h };
  }

  // Raster mask of the mark (alpha in a Uint8Array), cached per resolution.
  const masks = new Map();
  function mask(res = 512) {
    if (masks.has(res)) return masks.get(res);
    const c = document.createElement('canvas');
    const w = Math.round(res * Math.max(1, aspect)), h = Math.round(res / Math.min(1, aspect));
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    const s = Math.min(w / vw, h / vh) * 0.98;
    g.translate((w - vw * s) / 2 - vx * s, (h - vh * s) / 2 - vy * s);
    g.scale(s, s);
    g.fillStyle = '#fff';
    paths.forEach((p) => g.fill(p.path, p.rule || 'nonzero'));
    const data = g.getImageData(0, 0, w, h).data;
    const a = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = data[i * 4 + 3];
    const m = { w, h, a, s, ox: (w - vw * s) / 2, oy: (h - vh * s) / 2 };
    masks.set(res, m);
    return m;
  }

  // n points in normalized mark space: x,y in [-0.5*aspect..0.5*aspect] x [-0.5..0.5] (height = 1).
  // mode 'fill' = inside, 'edge' = on the outline. Deterministic for a given seed.
  function points(n, o = {}) {
    const m = mask(o.res || 384);
    const r = rng(o.seed ?? 11);
    const inside = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && m.a[y * m.w + x] > 127;
    const cand = [];
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      if (!inside(x, y)) continue;
      if (o.mode === 'edge') {
        if (inside(x - 1, y) && inside(x + 1, y) && inside(x, y - 1) && inside(x, y + 1)) continue;
      }
      cand.push(x, y);
    }
    const count = cand.length / 2;
    const out = [];
    const toNorm = (px, py) => {
      const lx = (px - m.ox) / m.s + vx, ly = (py - m.oy) / m.s + vy; // logo units
      return [(lx - vx - vw / 2) / vh, (ly - vy - vh / 2) / vh];
    };
    for (let i = 0; i < n; i++) {
      const j = Math.floor(r() * count);
      const [x, y] = toNorm(cand[j * 2] + r() - 0.5, cand[j * 2 + 1] + r() - 0.5);
      out.push([x, y]);
    }
    return out;
  }

  return { draw, points, mask, aspect, spec, paths };
}
