// Feature cards ride a 3D carousel: eight slots on a vertical cylinder, seen from
// slightly above. Each card face is pre-rendered once (plain and highlighted) and
// projected onto the cylinder as thin vertical strips, so the perspective is real
// (near edges taller than far edges). The carousel spins in, lands on the first
// feature, then steps to the next two. The card that reaches the front lights up:
// accent border, solid icon tile, accent mini-visual. Its label is live text set
// on the card through an affine map fitted to the label's projected corners.
// Ends with a short spin-and-fade exit.
export const meta = {
  id: 'feature.card-carousel',
  name: 'Card Carousel',
  category: 'feature',
  duration: 6.8,
  summary: 'Feature cards on a cylinder carousel spin in and step through three stops; the card at the front lights up (accent border, icon, mini-visual) and its label reads, with pagination dots tracking the stop; ends with a short spin-and-fade exit.',
  bestFor: ['feature tour', 'product overview', 'capabilities list'],
  slots: ['features'],
  params: {
    stops: { default: 3, min: 1, max: 4, label: 'Cards brought to the front' },
    pitch: { default: 0.1, min: 0, max: 0.25, label: 'Camera height (rad-ish)' },
  },
  sfx: [{ t: 0.05, type: 'whoosh', dur: 1.0, gain: 0.35 }, { t: 1.2, type: 'pop', gain: 0.4 }, { t: 2.52, type: 'whoosh', dur: 0.6, gain: 0.25 }, { t: 3.12, type: 'pop', gain: 0.35 }, { t: 4.43, type: 'whoosh', dur: 0.6, gain: 0.25 }, { t: 5.03, type: 'pop', gain: 0.35 }],
  prompt: `Place eight portrait cards (width 44% of the short side, 1.28:1) in slots 45 degrees apart on a vertical cylinder of radius 1.32 card widths, camera 3.2 widths away, slightly above. Project each card as about 36 vertical strips so near edges stand taller than far ones; fade cards beyond 60 degrees and cull back faces. Each card: hairline surface, icon tile, mono index, an abstract chart and the feature name (44 px display). Spin in over 1.3 s (emphasized ease) from 1.8 slots back while fading up, then step one slot at a time (700 ms moves, inOutCubic, holds of about 1.2 s) through three features. The front card lights up as it lands: accent border, solid icon tile, accent chart, glow on dark or deeper shadow on light; side cards dim and their labels drop to half opacity. Exit over the last 450 ms: spin on and fade (inCubic).`,
};

const ICONS = ['layers', 'bolt', 'sparkle', 'users', 'shield', 'chart-line'];

export function create(k, p) {
  const { m, ease, color: C } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Live roadmaps', 'One-click releases', 'Instant changelogs', 'Team approvals']).slice(0, 6);
  const n = feats.length;
  const M = 8; // slots on the cylinder
  const step = (Math.PI * 2) / M;
  const w = 2 * Math.round(k.pick({ wide: 470, square: 500, tall: 640 }) * U / 2); // even, so a resting card lands on whole pixels
  const h = Math.round(w * k.pick({ wide: 1.28, square: 1.3, tall: 1.42 }));
  const R = w * 1.32;
  const F = w * 3.2;
  const cx = Math.round(k.cx), cy = Math.round(k.cy - k.pick({ wide: 0.035, square: 0.03, tall: 0.03 }) * k.H);
  const pad = Math.round(w * 0.085);
  const rad = w * 0.075;
  const NS = 36;

  const surf = dark ? C.mix(c.bg, c.fg, 0.075) : '#ffffff';
  const onA = C.onColor(c.accent, ['#ffffff', '#0b0b0c']);
  const lab = { role: 'display', size: k.pick({ wide: 44, square: 46, tall: 56 }), weight: 620, tracking: -0.025 };
  lab.size = Math.min(...feats.map((f) => k.text.fit(f, lab, w - pad * 2, 26)));
  const labL = feats.map((f) => k.text.layout(f, lab));
  const labBase = h / 2 - pad - 4 * U; // label baseline in card-local v (centre origin)

  // --- card faces, rendered once -------------------------------------------------
  function face(i, lit) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    k.qa.mute(() => {
      k.draw.rrect(g, 0, 0, w, h, rad, surf);
      g.save(); k.draw.rrectPath(g, 0, 0, w, h, rad); g.clip();
      const sh = g.createLinearGradient(0, 0, 0, h * 0.5);
      sh.addColorStop(0, dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sh; g.fillRect(0, 0, w, h);
      if (lit) {
        const rg = g.createRadialGradient(w * 0.5, h * 0.52, 0, w * 0.5, h * 0.52, w * 0.7);
        rg.addColorStop(0, C.alpha(c.accent, dark ? 0.14 : 0.07)); rg.addColorStop(1, C.alpha(c.accent, 0));
        g.fillStyle = rg; g.fillRect(0, 0, w, h);
      }
      g.restore();
      k.draw.rrect(g, 0.5, 0.5, w - 1, h - 1, rad, null, C.alpha(c.fg, dark ? 0.12 : 0.09), 1);
      // icon tile
      const ts = w * 0.2;
      g.save();
      k.draw.squirclePath(g, pad, pad, ts, ts, ts * 0.3);
      g.fillStyle = lit ? c.accent : C.alpha(c.accent, dark ? 0.16 : 0.1); g.fill();
      g.restore();
      k.draw.icon(g, ICONS[i % ICONS.length], pad + ts / 2, pad + ts / 2, ts * 0.52, lit ? onA : c.accent, { stroke: 1.9 });
      // index
      k.text.draw(g, String(i + 1).padStart(2, '0'), w - pad, pad + ts / 2, { role: 'mono', size: 24, weight: 500, align: 'right', baseline: 'middle', color: c.muted });
      // mini visual
      const vx = pad, vy = h * 0.36, vw = w - pad * 2, vh = h * 0.3;
      const ink = lit ? c.accent : C.alpha(c.fg, dark ? 0.2 : 0.16);
      const soft = lit ? C.alpha(c.accent, dark ? 0.22 : 0.14) : C.alpha(c.fg, dark ? 0.07 : 0.05);
      const kind = i % 4;
      if (kind === 0) {
        const hs = [0.35, 0.55, 0.42, 0.7, 0.62, 0.92];
        const bw = vw / (hs.length * 1.6);
        hs.forEach((hh, j) => {
          const bx = vx + j * bw * 1.6 + bw * 0.3;
          k.draw.rrect(g, bx, vy + vh * (1 - hh), bw, vh * hh, bw * 0.3, j === hs.length - 1 ? ink : soft);
        });
      } else if (kind === 1) {
        const pts = [0.2, 0.32, 0.28, 0.5, 0.46, 0.7, 0.86].map((yy, j, a) => [vx + (vw * j) / (a.length - 1), vy + vh * (1 - yy)]);
        g.beginPath(); g.moveTo(pts[0][0], vy + vh); pts.forEach((q) => g.lineTo(q[0], q[1])); g.lineTo(vx + vw, vy + vh); g.closePath();
        g.fillStyle = soft; g.fill();
        k.draw.polyline(g, pts, 1, ink, 3);
        k.draw.circle(g, pts[pts.length - 1][0], pts[pts.length - 1][1], 7 * U, lit ? c.accent : C.alpha(c.fg, 0.3));
      } else if (kind === 2) {
        for (let j = 0; j < 3; j++) {
          const ry = vy + vh * (0.18 + j * 0.32);
          k.draw.circle(g, vx + 12 * U, ry, 10 * U, j === 0 ? ink : soft);
          k.draw.rrect(g, vx + 34 * U, ry - 6 * U, (vw - 34 * U) * [0.82, 0.6, 0.7][j], 12 * U, 6 * U, j === 0 ? ink : soft);
        }
      } else {
        const rr = vh * 0.42, rx = vx + rr + 4 * U, ry = vy + vh / 2;
        k.draw.circle(g, rx, ry, rr, null, soft, 14 * w / 470 / U);
        g.beginPath(); g.arc(rx, ry, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.72);
        g.strokeStyle = ink; g.lineWidth = 14 * w / 470; g.lineCap = 'round'; g.stroke();
        for (let j = 0; j < 3; j++) k.draw.rrect(g, rx + rr + 30 * U, ry - vh * 0.28 + j * vh * 0.24, (vw - rr * 2 - 40 * U) * [0.9, 0.65, 0.75][j], 12 * U, 6 * U, j === 0 ? ink : soft);
      }
      // hairline above the label
      g.fillStyle = C.alpha(c.fg, dark ? 0.08 : 0.07);
      g.fillRect(pad, h * 0.74, w - pad * 2, Math.max(1, U));
    });
    return cv;
  }
  const faces = feats.map((_, i) => ({ base: face(i, false), lit: face(i, true) }));

  // --- projection ------------------------------------------------------------------
  const layer = k.layer('cardCarousel');
  const lg = k.ctx(layer);
  const layer2 = k.layer('cardCarouselLit');
  const lg2 = k.ctx(layer2);
  function proj(phi, u, v) {
    const X = R * Math.sin(phi) + u * Math.cos(phi);
    const Z = R * (1 - Math.cos(phi)) + u * Math.sin(phi);
    const s = F / (F + Z);
    return [cx + X * s, cy + (v - Z * p.pitch) * s, s, Z];
  }
  // outline of the rounded card, projected point by point
  const outline = [];
  {
    const seg = 6, hw = w / 2, hh = h / 2;
    const corner = (ux, uy, a0) => { for (let q = 0; q <= seg; q++) { const a = a0 + (q / seg) * (Math.PI / 2); outline.push([ux + rad * Math.cos(a), uy + rad * Math.sin(a)]); } };
    corner(hw - rad, -hh + rad, -Math.PI / 2);
    corner(hw - rad, hh - rad, 0);
    corner(-hw + rad, hh - rad, Math.PI / 2);
    corner(-hw + rad, -hh + rad, Math.PI);
  }
  function outlinePath(g, phi) {
    g.beginPath();
    outline.forEach(([u, v], q) => { const P = proj(phi, u, v); if (q) g.lineTo(P[0], P[1]); else g.moveTo(P[0], P[1]); });
    g.closePath();
  }

  // stop schedule (timed from the real shot length)
  const T0 = 1.3, MV = 0.7;
  const stops = Math.max(1, Math.min(4, Math.round(p.stops)));
  const hold = Math.max(0.6, (D - 0.45 - T0 - (stops - 1) * MV) / stops);
  const moveStarts = Array.from({ length: stops - 1 }, (_, i) => T0 + hold * (i + 1) + MV * i);

  function position(t) {
    let pos = -1.8 + 1.8 * ease.emphasized(m.seg(t, 0, T0));
    moveStarts.forEach((s) => { pos += ease.inOutCubic(m.seg(t, s, MV)); });
    pos += 0.6 * ease.inCubic(m.seg(t, D - 0.45, 0.45));
    return pos;
  }

  return {
    draw(g, t) {
      const pos = position(t);
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const enter = ease.outCubic(m.seg(t, 0, 0.6));
      const vis = enter * (1 - exit);
      if (vis <= 0.001) return;
      // collect visible slots
      const items = [];
      for (let j = Math.floor(pos) - 3; j <= Math.floor(pos) + 4; j++) {
        const phi = (j - pos) * step;
        if (Math.abs(phi) > 1.45) continue;
        const fi = ((j % n) + n) % n;
        items.push({ j, fi, phi, z: R * (1 - Math.cos(phi)) });
      }
      items.sort((a, b) => b.z - a.z);
      // front glow (dark) under everything
      if (dark) k.draw.glow(g, cx, cy, w * 1.15, c.accent, 0.14 * vis);

      for (const it of items) {
        const { phi, fi } = it;
        const ap = Math.abs(phi);
        const fade = 1 - m.smoothstep(0.95, 1.4, ap); // fade out toward edge-on
        const dim = m.smoothstep(0.06, 0.75, ap) * (dark ? 0.45 : 0.35);
        const hl = 1 - m.smoothstep(0.03, 0.22, ap);
        const a = fade * vis;
        if (a <= 0.01) continue;
        // strips into the layer
        const xs = [], tops = [], bots = [];
        for (let q = 0; q <= NS; q++) {
          const u = -w / 2 + (q / NS) * w;
          const P0 = proj(phi, u, -h / 2), P1 = proj(phi, u, h / 2);
          xs.push(P0[0]); tops.push(P0[1]); bots.push(P1[1]);
        }
        if (xs[NS] - xs[0] < 2) continue; // edge-on or back face
        const bx0 = Math.floor(Math.min(xs[0], xs[NS])) - 2, bx1 = Math.ceil(Math.max(xs[0], xs[NS])) + 2;
        const by0 = Math.floor(Math.min(...tops)) - 2, by1 = Math.ceil(Math.max(...bots)) + 2;
        const bw = bx1 - bx0, bh = by1 - by0;
        lg.save();
        lg.setTransform(1, 0, 0, 1, 0, 0);
        lg.globalCompositeOperation = 'source-over';
        lg.globalAlpha = 1;
        lg.clearRect(bx0, by0, bw, bh);
        // at rest the card is an exact 1:1 rectangle: one pixel-aligned blit, no resampling
        const still = Math.abs(phi) < 0.002;
        const strips = (ctx, img) => {
          if (still) { ctx.drawImage(img, Math.round(xs[0]), Math.round(tops[0])); return; }
          const sw = img.width / NS;
          for (let q = 0; q < NS; q++) {
            const x0 = xs[q], x1 = xs[q + 1];
            const top = (tops[q] + tops[q + 1]) / 2, bot = (bots[q] + bots[q + 1]) / 2;
            ctx.drawImage(img, q * sw, 0, sw, img.height, x0, top, x1 - x0 + 0.6, bot - top);
          }
        };
        strips(lg, faces[fi].base);
        if (hl > 0.999) strips(lg, faces[fi].lit);
        else if (hl > 0.001) {
          // build the lit face opaque in its own layer, then crossfade it as one image
          // (fading strip by strip would double the alpha where strips overlap)
          lg2.save(); lg2.setTransform(1, 0, 0, 1, 0, 0);
          lg2.clearRect(bx0, by0, bw, bh);
          strips(lg2, faces[fi].lit);
          lg2.restore();
          lg.globalAlpha = hl;
          lg.drawImage(layer2, bx0, by0, bw, bh, bx0, by0, bw, bh);
          lg.globalAlpha = 1;
        }
        if (dim > 0.001) {
          lg.globalCompositeOperation = 'source-atop';
          lg.fillStyle = C.alpha(c.bg, dim);
          lg.fillRect(bx0, by0, bw, bh);
        }
        lg.restore();
        // composite (soft shadow on light brands)
        g.save();
        g.globalAlpha = a;
        if (!dark) { g.shadowColor = `rgba(20,30,60,${(0.1 + 0.08 * hl) * (1 - dim)})`; g.shadowBlur = (40 + 20 * hl) * U; g.shadowOffsetY = (18 + 8 * hl) * U; }
        g.drawImage(layer, bx0, by0, bw, bh, bx0, by0, bw, bh);
        g.restore();
        // accent border on the lit card
        if (hl > 0.01) {
          g.save();
          g.globalAlpha = a * hl;
          outlinePath(g, phi);
          g.strokeStyle = c.accent; g.lineWidth = 2.5 * U; g.stroke();
          g.restore();
        }
        // live label through the affine map of its projected corners
        const L = labL[fi];
        const uL = -w / 2 + pad, uR = uL + L.width;
        const A = proj(phi, uL, labBase), B = proj(phi, uR, labBase), Cc = proj(phi, uL, labBase - L.cap);
        const la = a * (1 - 0.5 * m.smoothstep(0.08, 0.45, ap));
        g.save();
        g.transform((B[0] - A[0]) / L.width, (B[1] - A[1]) / L.width, (A[0] - Cc[0]) / L.cap, (A[1] - Cc[1]) / L.cap, A[0], A[1]);
        const col = C.mix(c.fg, c.bg, dim);
        const drawLab = () => k.text.draw(g, feats[fi], 0, 0, { ...lab, color: col, alpha: la });
        if (ap > 0.3) k.qa.allowOffstage(drawLab); else drawLab();
        g.restore();
      }

      // pagination: one dot per feature, a pill marks the front card
      const dotY = cy + h / 2 + k.pick({ wide: 64, square: 70, tall: 84 }) * U;
      const sp = 26 * U, dr = 5 * U;
      const x0 = cx - ((n - 1) * sp) / 2;
      g.save();
      g.globalAlpha = vis;
      for (let i = 0; i < n; i++) k.draw.circle(g, x0 + i * sp, dotY, dr, C.alpha(c.fg, dark ? 0.22 : 0.18));
      const fp = ((pos % n) + n) % n;
      const ai = Math.floor(fp), fr = fp - ai;
      const pillAt = (x, al) => { g.save(); g.globalAlpha *= al; k.draw.rrect(g, x - 13 * U, dotY - dr, 26 * U, dr * 2, dr, c.accent); g.restore(); };
      if (ai < n - 1) pillAt(x0 + (ai + fr) * sp, 1);
      else { pillAt(x0 + ai * sp, 1 - fr); pillAt(x0, fr); }
      g.restore();
    },
  };
}
