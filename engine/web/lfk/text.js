// Typography helpers. Sizes are given in reference pixels (the short side of the
// frame = 1080) and scaled by k.u, so the same numbers work at 1080p and 4K and in
// any aspect ratio. Tracking is in em (e.g. -0.02 = tight display setting).
//
// Every helper reports what it draws to the QA recorder (k.qa), which is how the
// render checks know about text that is off-stage, overlapping, tiny or low-contrast.

import { parse } from './color.js';

export function makeText(k) {
  const roles = k.brand.fonts;
  const cache = new Map();
  const scratch = document.createElement('canvas').getContext('2d');

  const roleOf = (o) => roles[o.role || 'display'] || roles.display;
  function fontString(o) {
    const r = roleOf(o);
    const weight = o.weight ?? r.weight ?? 400;
    const style = o.italic ? 'italic' : 'normal';
    const size = (o.size ?? 64) * k.u;
    return { css: `${style} ${weight} ${size.toFixed(2)}px "${o.family || r.family}"`, px: size };
  }

  function layout(str, o = {}) {
    const f = fontString(o);
    const trackPx = (o.tracking ?? roleOf(o).tracking ?? 0) * f.px;
    const key = `${f.css}|${trackPx.toFixed(3)}|${str}`;
    let L = cache.get(key);
    if (L) return L;
    scratch.font = f.css;
    scratch.letterSpacing = '0px';
    scratch.fontKerning = 'normal';
    const chars = Array.from(str);
    const glyphs = [];
    let prefix = '';
    let x = 0;
    for (let i = 0; i < chars.length; i++) {
      // kerned advance: width(prefix + ch) - width(prefix)
      const before = scratch.measureText(prefix).width;
      prefix += chars[i];
      const after = scratch.measureText(prefix).width;
      const adv = after - before;
      glyphs.push({ ch: chars[i], x: x + 0, w: adv, i });
      x += adv + (i < chars.length - 1 ? trackPx : 0);
    }
    const m = scratch.measureText(str || 'H');
    const cap = scratch.measureText('H').actualBoundingBoxAscent;
    const xh = scratch.measureText('x').actualBoundingBoxAscent;
    L = {
      str, font: f.css, px: f.px, trackPx, width: x,
      ascent: m.fontBoundingBoxAscent ?? f.px * 0.9, descent: m.fontBoundingBoxDescent ?? f.px * 0.25,
      inkAscent: m.actualBoundingBoxAscent, inkDescent: m.actualBoundingBoxDescent,
      cap, xh, glyphs,
    };
    if (cache.size > 4000) cache.clear();
    cache.set(key, L);
    return L;
  }

  // Vertical anchor -> offset added to y to get the alphabetic baseline.
  function baselineShift(L, base) {
    switch (base || 'alphabetic') {
      case 'top': return L.cap;               // y is the cap top
      case 'middle': return L.cap / 2;         // y is the optical middle of capitals
      case 'xmiddle': return L.xh / 2;         // y is the middle of lowercase
      case 'bottom': return -L.descent;
      default: return 0;
    }
  }
  const alignShift = (L, align) => (align === 'center' ? -L.width / 2 : align === 'right' ? -L.width : 0);

  function colorAlpha(c) { return parse(c).a; }

  // Draw a single line of text. Returns its layout (with .x0/.y0 box in local coords).
  function draw(g, str, x, y, o = {}) {
    if (!str) return null;
    const L = layout(str, o);
    const x0 = x + alignShift(L, o.align);
    const by = y + baselineShift(L, o.baseline);
    g.save();
    g.font = L.font;
    g.letterSpacing = `${L.trackPx}px`;
    g.fontKerning = 'normal';
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
    const color = o.color || k.brand.colors.fg;
    g.fillStyle = o.gradient || color;
    if (o.shadow) { g.shadowColor = o.shadow.color; g.shadowBlur = o.shadow.blur * k.u; g.shadowOffsetY = (o.shadow.y || 0) * k.u; }
    k.qa.text(g, str, x0, by - L.cap, L.width, L.cap + Math.max(L.inkDescent, 0), L.px, color, o);
    k.qa.raw(false);
    g.fillText(str, x0, by);
    if (o.stroke) { g.strokeStyle = o.stroke.color; g.lineWidth = o.stroke.width * k.u; g.strokeText(str, x0, by); }
    k.qa.raw(true);
    g.restore();
    return L;
  }

  // Draw glyph by glyph. fn(i, n, glyph) returns per-glyph overrides:
  // { x, y (offset px), sx, sy (scale), r (radians), a (alpha 0..1), color, blur (px), ch (replacement char) }
  // Return null to skip a glyph.
  function glyphs(g, str, x, y, o, fn) {
    if (!str) return null;
    const L = layout(str, o);
    const x0 = x + alignShift(L, o.align);
    const by = y + baselineShift(L, o.baseline);
    const color = o.color || k.brand.colors.fg;
    g.save();
    g.font = L.font;
    g.letterSpacing = '0px';
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
    let visible = 0;
    const n = L.glyphs.length;
    k.qa.raw(false);
    for (const gl of L.glyphs) {
      if (gl.ch === ' ') continue;
      const s = fn ? fn(gl.i, n, gl) : {};
      if (s === null) continue;
      const a = s.a ?? 1;
      if (a <= 0.001) continue;
      visible++;
      g.save();
      const cx = x0 + gl.x + gl.w / 2, cy = by - L.cap / 2;
      g.translate(cx + (s.x || 0), cy + (s.y || 0));
      if (s.r) g.rotate(s.r);
      if (s.sx !== undefined || s.sy !== undefined) g.scale(s.sx ?? 1, s.sy ?? s.sx ?? 1);
      g.globalAlpha *= a;
      g.fillStyle = s.color || o.gradient || color;
      if (s.blur) g.filter = `blur(${(s.blur * k.u).toFixed(2)}px)`;
      g.fillText(s.ch ?? gl.ch, -gl.w / 2, L.cap / 2);
      g.restore();
    }
    k.qa.raw(true);
    if (visible) k.qa.text(g, str, x0, by - L.cap, L.width, L.cap + Math.max(L.inkDescent, 0), L.px, color, o);
    g.restore();
    return L;
  }

  // Greedy word wrap into lines that fit maxW (px).
  function wrap(str, o, maxW) {
    const words = String(str).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (layout(test, o).width <= maxW || !line) line = test;
      else { lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Balanced wrap: same number of lines as a greedy wrap, but evenly filled
  // (avoids a lonely last word). Use for every headline.
  function balance(str, o, maxW) {
    const base = wrap(str, o, maxW);
    if (base.length < 2) return base;
    let lo = 0, hi = maxW, best = base;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      const ls = wrap(str, o, mid);
      if (ls.length <= base.length && ls.every((l) => layout(l, o).width <= maxW)) { best = ls; hi = mid; } else lo = mid;
    }
    return best;
  }

  // Largest size (reference px) <= o.size at which str fits in maxW on one line.
  function fit(str, o, maxW, minSize = 12) {
    let size = o.size ?? 64;
    for (let i = 0; i < 40 && size > minSize; i++) {
      if (layout(str, { ...o, size }).width <= maxW) return size;
      size *= 0.95;
    }
    return Math.max(minSize, size);
  }

  // Multi-line block. lineHeight is a multiple of size. Returns {lines, height, width}.
  function block(g, str, x, y, o = {}) {
    const maxW = o.maxW ?? k.W * 0.8;
    const lines = o.lines || wrap(str, o, maxW);
    const lh = (o.lineHeight ?? 1.1) * (o.size ?? 64) * k.u;
    let width = 0;
    lines.forEach((ln, i) => {
      const L = draw(g, ln, x, y + i * lh, o);
      if (L) width = Math.max(width, L.width);
    });
    return { lines, height: lh * (lines.length - 1) + (o.size ?? 64) * k.u, width, lineH: lh };
  }

  const measure = (str, o = {}) => layout(str, o);
  const px = (refSize) => refSize * k.u;

  return { layout, draw, glyphs, wrap, balance, fit, block, measure, fontString, px };
}
