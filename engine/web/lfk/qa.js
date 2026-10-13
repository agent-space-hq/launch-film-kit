// QA recorder: the engine's "sensors". While a frame renders, every text draw is
// recorded with its device-space box, size, colour and opacity. After the frame,
// check() turns those records (plus the final pixels) into counters that must read
// zero before anything ships:
//   offstage    opaque text crossing the frame edge or the safe margin
//   overlap     two different opaque strings overlapping each other
//   tiny        opaque text below the legibility floor
//   contrast    opaque text whose colour is too close to what is behind it
// plus page-level counters collected by the driver: errors, nondeterministic, blank.

import { luminance, parse } from './color.js';

export function makeQA(k) {
  let frame = [];
  let rawOn = true;
  let allow = { offstage: 0, overlap: 0 };
  let muted = 0; // >0 while drawing into offscreen layers (not on screen) // nesting counters for intentional cases
  const CJK = /[　-〿぀-ヿ㐀-䶿一-鿿가-힯＀-￯]/;
  const strings = new Set();

  function boxOf(g, x, y, w, h) {
    const m = g.getTransform();
    const pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([px, py]) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const sy = Math.hypot(m.c, m.d);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), scale: sy };
  }

  // Called by text helpers. size = font px before transform.
  function text(g, str, x, y, w, h, size, color, o = {}) {
    if (muted > 0) return;
    if (!k.qaEnabled) { strings.add(str); return; }
    const b = boxOf(g, x, y, w, h);
    const a = g.globalAlpha * parse(color).a;
    frame.push({
      str, ...b, px: size * b.scale, alpha: a, color,
      allowOff: allow.offstage > 0 || !!o.qaOffstage, allowOverlap: allow.overlap > 0 || !!o.qaOverlap,
      group: o.qaGroup || str,
    });
    strings.add(str);
  }
  function raw(on) { rawOn = on; }

  // Patch raw fillText/strokeText so effects that bypass the helpers are still seen.
  const proto = CanvasRenderingContext2D.prototype;
  if (!proto.__lfkPatched) {
    const fill = proto.fillText;
    proto.fillText = function (str, x, y, maxW) {
      const q = window.__lfkQA;
      if (q && q.rawOn() && str && String(str).trim()) q.rawText(this, String(str), x, y);
      return maxW === undefined ? fill.call(this, str, x, y) : fill.call(this, str, x, y, maxW);
    };
    proto.__lfkPatched = true;
  }
  window.__lfkQA = {
    rawOn: () => rawOn,
    rawText(g, str, x, y) {
      if (muted > 0) return;
      strings.add(str);
      if (!k.qaEnabled) return;
      const m = g.measureText(str);
      const align = g.textAlign;
      const x0 = align === 'center' ? x - m.width / 2 : align === 'right' || align === 'end' ? x - m.width : x;
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      const b = boxOf(g, x0, y - asc, m.width, asc + desc);
      const px = parseFloat((g.font.match(/([\d.]+)px/) || [0, 16])[1]);
      frame.push({ str, ...b, px: px * b.scale, alpha: g.globalAlpha, color: typeof g.fillStyle === 'string' ? g.fillStyle : '#888', allowOff: allow.offstage > 0, allowOverlap: allow.overlap > 0, group: str, raw: true });
    },
  };

  function begin() { frame = []; }
  function allowOffstage(fn) { allow.offstage++; try { fn(); } finally { allow.offstage--; } }
  function mute(fn) { muted++; try { return fn(); } finally { muted--; } }
  function allowOverlap(fn) { allow.overlap++; try { fn(); } finally { allow.overlap--; } }

  // pixels: Uint8Array RGBA bottom-up (from readPixels) or null. Returns counters + details.
  function check(pixels, o = {}) {
    const W = k.W, H = k.H;
    const margin = (o.margin ?? 0.03) * Math.min(W, H);
    const minPx = (o.minPx ?? 18) * k.u; // legibility floor at 1080 reference
    const res = { offstage: 0, overlap: 0, tiny: 0, contrast: 0, cjk: 0, items: [] };
    const solid = frame.filter((r) => r.alpha >= 0.6 && r.x1 - r.x0 > 1);
    for (const r of solid) {
      if (CJK.test(r.str)) { res.cjk++; res.items.push(['cjk', r.str]); }
      if (!r.allowOff) {
        const out = r.x0 < margin || r.y0 < margin || r.x1 > W - margin || r.y1 > H - margin;
        const inFrame = r.x1 > 0 && r.y1 > 0 && r.x0 < W && r.y0 < H;
        if (out && inFrame) { res.offstage++; res.items.push(['offstage', r.str, Math.round(r.x0), Math.round(r.y0), Math.round(r.x1), Math.round(r.y1)]); }
      }
      if (r.px < minPx) { res.tiny++; res.items.push(['tiny', r.str, +r.px.toFixed(1)]); }
    }
    for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
      const a = solid[i], b = solid[j];
      if (a.group === b.group || a.allowOverlap || b.allowOverlap) continue;
      const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ix <= 0 || iy <= 0) continue;
      const area = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0));
      if ((ix * iy) / Math.max(1, area) > 0.12) { res.overlap++; res.items.push(['overlap', a.str, b.str]); }
    }
    if (pixels) {
      // contrast: compare the text colour with the median luminance of a ring of
      // pixels just outside the box (what the eye reads the text against).
      for (const r of solid) {
        if (r.raw) continue;
        const pad = Math.max(2, r.px * 0.25);
        const samples = [];
        const add = (x, y) => {
          x = Math.round(x); y = Math.round(y);
          if (x < 0 || y < 0 || x >= W || y >= H) return;
          const i = ((H - 1 - y) * W + x) * 4;
          const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          samples.push(0.2126 * lin(pixels[i]) + 0.7152 * lin(pixels[i + 1]) + 0.0722 * lin(pixels[i + 2]));
        };
        for (let s = 0; s <= 12; s++) {
          const fx = r.x0 + ((r.x1 - r.x0) * s) / 12;
          add(fx, r.y0 - pad); add(fx, r.y1 + pad);
        }
        for (let s = 0; s <= 4; s++) {
          const fy = r.y0 + ((r.y1 - r.y0) * s) / 4;
          add(r.x0 - pad, fy); add(r.x1 + pad, fy);
        }
        if (samples.length < 6) continue;
        samples.sort((a, b) => a - b);
        const bgL = samples[samples.length >> 1];
        let fgL;
        try { fgL = luminance(r.color); } catch { continue; }
        const ratio = (Math.max(bgL, fgL) + 0.05) / (Math.min(bgL, fgL) + 0.05);
        const need = r.px >= 36 * k.u ? 2.6 : 3.6;
        if (ratio < need) { res.contrast++; res.items.push(['contrast', r.str, +ratio.toFixed(2)]); }
      }
    }
    return res;
  }

  return { begin, text, raw, check, allowOffstage, allowOverlap, mute, strings, get frame() { return frame; } };
}
