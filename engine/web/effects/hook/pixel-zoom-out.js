// Frame 0 is a single glowing pixel on a dark grid. The camera pulls back
// exponentially through the grid: the pixel turns out to be the full stop of the
// headline, set in lit cells. At full width the cells resolve into crisp type.
export const meta = {
  id: 'hook.pixel-zoom-out',
  name: 'Zoom From a Pixel',
  category: 'hook',
  duration: 4.8,
  summary: 'One glowing accent pixel; the camera pulls out ~25x through a cell grid until the headline appears as lit cells, which then resolve into crisp type with the accent full stop. Holds on the headline.',
  bestFor: ['cold open', 'detail-to-big-picture', 'headline reveal'],
  slots: ['headline'],
  params: {
    cell: { default: 6, min: 4, max: 10, label: 'Cell size at rest (ref px)' },
  },
  sfx: [{ t: 0.0, type: 'tick', gain: 0.5 }, { t: 0.4, type: 'riser', dur: 2.0, gain: 0.45 }, { t: 2.55, type: 'shimmer', gain: 0.55 }],
  prompt: `Rasterise the headline (display, about 11% of height, weight 640) into a grid of 6 ref px cells, keeping cells over 45% coverage. The origin cell is the centre of the final full stop. Frame 0: zoomed so that one cell fills 20% of the short side, drawn in the accent with a soft glow pulse, alone on a faint grid. Other cells switch on in a ripple outward from the origin by grid distance. From 350 ms to 2.45 s the zoom falls from about 36x to 1x in log space (inOutCubic), the focus sliding from the origin to frame centre in proportion to 1/scale. Cell grid lines fade out as screen cells shrink below 18 px; an every-8-cells grid carries the middle scales. From 2.45 s over 380 ms the cells fade while crisp type fades in exactly on top, the full stop in accent. Hold about 2 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const str = k.copy('headline', 'Launch day, without the crunch.');
  const o = { size: k.pick({ wide: 124, square: 112, tall: 118 }), weight: 640, tracking: -0.03 };
  const maxW = k.safe.w * 0.9;
  let lines = k.text.balance(str, o, maxW);
  while (lines.length > 3 && o.size > 48) { o.size *= 0.92; lines = k.text.balance(str, o, maxW); }
  const cell = p.cell * k.u;
  const lh = o.size * 1.1 * k.u;
  const top = k.cy - ((lines.length - 1) * lh) / 2;
  let bw = 0;
  lines.forEach((ln) => { bw = Math.max(bw, k.text.layout(ln, o).width); });
  const cap = k.text.layout('H', o).cap;
  const pad = cell * 3;
  const bx = Math.floor((k.cx - bw / 2 - pad) / cell) * cell;
  const by = Math.floor((top - cap - pad) / cell) * cell;
  const gw = Math.ceil((bw + pad * 2) / cell) + 2;
  const gh = Math.ceil(((lines.length - 1) * lh + cap * 2 + pad * 2) / cell) + 2;
  // rasterise into the grid (4x supersampled coverage)
  const SS = 4;
  const can = document.createElement('canvas');
  can.width = gw * SS; can.height = gh * SS;
  const cg = can.getContext('2d', { willReadFrequently: true });
  const mo = { ...o, size: (o.size * SS) / (p.cell * k.u) };
  lines.forEach((ln, li) => {
    k.text.draw(cg, ln, ((k.cx - bx) / cell) * SS, ((top + li * lh - by) / cell) * SS, { ...mo, align: 'center', baseline: 'middle', color: '#ffffff' });
  });
  const data = cg.getImageData(0, 0, can.width, can.height).data;
  const cells = [];
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    let s = 0;
    for (let y = 0; y < SS; y++) for (let x = 0; x < SS; x++) s += data[((j * SS + y) * can.width + i * SS + x) * 4 + 3];
    if (s / (SS * SS * 255) > 0.45) cells.push([i, j]);
  }
  // origin: cell nearest the final full stop (or the last glyph)
  const lastLn = lines[lines.length - 1];
  const LL = k.text.layout(lastLn, o);
  const lastIdx = LL.glyphs.length - 1;
  const pg = LL.glyphs[lastIdx];
  const isStop = /[.!?]/.test(pg.ch);
  const pxW = k.cx - LL.width / 2 + pg.x + pg.w / 2;
  const pyW = top + (lines.length - 1) * lh + (pg.ch === '.' ? cap * 0.42 : 0);
  let oi = 0, best = 1e9;
  cells.forEach(([i, j], n) => {
    const d = Math.hypot(bx + (i + 0.5) * cell - pxW, by + (j + 0.5) * cell - pyW);
    if (d < best) { best = d; oi = n; }
  });
  const O = [bx + (cells[oi][0] + 0.5) * cell, by + (cells[oi][1] + 0.5) * cell];
  // cells belonging to the stop glyph get the accent too
  const stopX0 = k.cx - LL.width / 2 + pg.x - cell, stopX1 = stopX0 + pg.w + cell * 2;
  const stopY = top + (lines.length - 1) * lh;
  const isAccent = cells.map(([i, j]) => {
    if (!isStop) return false;
    const x = bx + (i + 0.5) * cell, y = by + (j + 0.5) * cell;
    return x > stopX0 && x < stopX1 && y > stopY - cap * 0.7 && y < stopY + cap * 0.7;
  });
  const S0 = (0.2 * Math.min(k.W, k.H)) / cell;
  // cells switch on in a ripple from the origin, so frame 0 holds a single pixel
  let dmax = 1;
  const dist = cells.map(([i, j]) => Math.hypot(i - cells[oi][0], j - cells[oi][1]));
  dist.forEach((d) => { dmax = Math.max(dmax, d); });
  const tOn = dist.map((d, n) => (n === oi ? -1 : 0.3 + 1.55 * Math.pow(d / dmax, 0.75) + m.hash(n, 3) * 0.08));

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const z = ease.inOutCubic(m.seg(t, 0.35, 2.1));
      const S = Math.exp(m.lerp(Math.log(S0), 0, z));
      const w = (1 / S - 1 / S0) / (1 - 1 / S0);
      const Px = m.lerp(O[0], k.cx, w), Py = m.lerp(O[1], k.cy, w);
      const toX = (x) => k.cx + (x - Px) * S, toY = (y) => k.cy + (y - Py) * S;
      const cs = cell * S;
      const resolve = ease.inOutCubic(m.seg(t, 2.45, 0.38));
      // grid lines
      const drawGrid = (step, alpha) => {
        if (alpha < 0.003) return;
        const sp = step * S;
        const x0 = toX(bx), y0 = toY(by);
        const i0 = Math.floor((0 - x0) / sp), i1 = Math.ceil((k.W - x0) / sp);
        const j0 = Math.floor((0 - y0) / sp), j1 = Math.ceil((k.H - y0) / sp);
        g.beginPath();
        for (let i = i0; i <= i1; i++) { const x = Math.round(x0 + i * sp) + 0.5; g.moveTo(x, 0); g.lineTo(x, k.H); }
        for (let j = j0; j <= j1; j++) { const y = Math.round(y0 + j * sp) + 0.5; g.moveTo(0, y); g.lineTo(k.W, y); }
        g.strokeStyle = C.alpha(c.fg, alpha);
        g.lineWidth = Math.max(1, k.u);
        g.stroke();
      };
      drawGrid(cell, 0.09 * m.smoothstep(4 * k.u, 18 * k.u, cs) * (1 - resolve));
      drawGrid(cell * 8, 0.06 * m.smoothstep(20 * k.u, 70 * k.u, cs * 8) * (1 - resolve));
      // origin glow
      const pulse = 0.75 + 0.25 * Math.cos(t * 9) * (1 - m.seg(t, 0.35, 0.4));
      if (k.isDark) k.draw.glow(g, toX(O[0]), toY(O[1]), Math.max(cs * 2.2, 60 * k.u), c.accent, 0.45 * pulse * (1 - resolve * 0.8));
      // cells
      const cellA = 1 - resolve;
      if (cellA > 0.001) {
        const shrink = 1 - 0.4 * resolve;
        const gap = 0.12 * m.smoothstep(8 * k.u, 24 * k.u, cs);
        const sz0 = cs * (1 - gap) * shrink;
        const rr = Math.min(sz0 * 0.18, 6 * k.u);
        g.save();
        g.globalAlpha = cellA;
        g.fillStyle = c.fg;
        g.beginPath();
        for (let n = 0; n < cells.length; n++) {
          if (isAccent[n]) continue;
          const on = ease.outCubic(m.seg(t, tOn[n], 0.16));
          if (on <= 0) continue;
          const x = toX(bx + (cells[n][0] + 0.5) * cell), y = toY(by + (cells[n][1] + 0.5) * cell);
          if (x < -cs || y < -cs || x > k.W + cs || y > k.H + cs) continue;
          const sz = sz0 * (0.4 + 0.6 * on);
          if (sz > 6) g.roundRect(x - sz / 2, y - sz / 2, sz, sz, rr); else g.rect(x - sz / 2, y - sz / 2, sz, sz);
        }
        g.fill();
        g.fillStyle = c.accent;
        g.beginPath();
        for (let n = 0; n < cells.length; n++) {
          if (!isAccent[n]) continue;
          const on = ease.outCubic(m.seg(t, tOn[n], 0.16));
          if (on <= 0) continue;
          const x = toX(bx + (cells[n][0] + 0.5) * cell), y = toY(by + (cells[n][1] + 0.5) * cell);
          const s2 = sz0 * (0.4 + 0.6 * on) * (n === oi ? 0.96 + 0.04 * pulse : 1);
          g.roundRect(x - s2 / 2, y - s2 / 2, s2, s2, rr);
        }
        g.fill();
        g.restore();
      }
      // crisp type
      if (resolve > 0) {
        lines.forEach((ln, li) => {
          const isLast = li === lines.length - 1;
          k.text.glyphs(g, ln, k.cx, top + li * lh, { ...o, align: 'center', baseline: 'middle', alpha: resolve, color: c.fg, qaGroup: 'hl' + li }, (i) => ({ color: isLast && isStop && i === lastIdx ? c.accent : undefined }));
        });
      }
    },
  };
}
