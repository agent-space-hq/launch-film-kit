// A release dashboard settles, then the frame dims except one soft-edged spotlight.
// The spotlight glides between three regions (chart, primary action, activity list),
// reshaping to each, and a caption card follows it with the matching feature name.
// Ends held on the third region.
export const meta = {
  id: 'feature.spotlight',
  name: 'Spotlight',
  category: 'feature',
  duration: 6.4,
  summary: 'The UI dims except a soft-edged spotlight that travels and reshapes between three regions while a caption card follows; holds on the last stop.',
  bestFor: ['guided tour', 'feature focus', 'onboarding'],
  slots: ['features'],
  params: {
    dim: { default: 0.72, min: 0.4, max: 0.9, label: 'Dim amount' },
  },
  sfx: [{ t: 0.7, type: 'swell', dur: 0.6, gain: 0.3 }, { t: 2.4, type: 'whoosh', dur: 0.6, gain: 0.3 }, { t: 4.2, type: 'whoosh', dur: 0.6, gain: 0.3 }],
  prompt: `Draw a skeleton dashboard in a window at 90% of the frame (sidebar, header with a primary button, KPI tiles, chart card, activity list). It rises in over 600 ms. From 650 ms a dim layer (72% of the background colour) fades in over 450 ms with a hole cut by a rounded rectangle blurred by 28 px, starting 70 px wider on every side and closing onto the first region (emphasized). The hole then moves to region two at 2.4 s and region three at 4.2 s, interpolating x, y, width, height and radius over 700 ms with inOutCubic; an accent hairline traces its edge. A caption card (feature name at 38 px, mono step index) sits below or above the hole, fades out in 200 ms when a move starts and back in 300 ms after it lands, rising 12 px. Hold on the last region.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const DUR = p.duration ?? meta.duration;
  const feats = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs']).slice(0, 3);
  while (feats.length < 3) feats.push('And more');
  const P = {
    win: dark ? C.mix(c.bg, c.fg, 0.05) : '#ffffff',
    side: dark ? C.mix(c.bg, c.fg, 0.03) : C.mix('#ffffff', c.fg, 0.028),
    card: dark ? C.mix(c.bg, c.fg, 0.09) : '#ffffff',
    line: C.alpha(c.fg, dark ? 0.09 : 0.1),
    skel: C.alpha(c.fg, dark ? 0.14 : 0.09),
    skel2: C.alpha(c.fg, dark ? 0.08 : 0.055),
  };
  const wide = k.isWide;
  const winW = Math.min(k.W * 0.9, k.pick({ wide: 1728, square: 980, tall: 980 }) * U);
  const winH = Math.min(k.H * 0.86, k.pick({ wide: 930, square: 1160, tall: 1560 }) * U);
  const winX = k.cx - winW / 2, winY = k.cy - winH / 2;
  const bar = 50 * U, sideW = wide ? 240 * U : 0, pad = 30 * U, gap = 22 * U;
  const mx = winX + sideW + pad, mw = winW - sideW - pad * 2;
  let y = winY + bar + pad;
  const head = { x: mx, y, w: mw, h: 56 * U };
  const btn = { w: 200 * U, h: 56 * U, x: mx + mw - 200 * U, y };
  y += 56 * U + gap;
  const kCols = wide ? 4 : 2, kRows = wide ? 1 : 2, kh = (wide ? 140 : 120) * U;
  const kw = (mw - gap * (kCols - 1)) / kCols;
  const kpis = [];
  for (let r = 0; r < kRows; r++) for (let i = 0; i < kCols; i++) kpis.push({ x: mx + i * (kw + gap), y: y + r * (kh + gap), w: kw, h: kh, i: r * kCols + i });
  y += kRows * (kh + gap);
  const rest = winY + winH - pad - y;
  let chart, list;
  if (wide) { const cw = (mw - gap) * 0.62; chart = { x: mx, y, w: cw, h: rest }; list = { x: mx + cw + gap, y, w: mw - cw - gap, h: rest }; }
  else { const ch = rest * 0.52; chart = { x: mx, y, w: mw, h: ch }; list = { x: mx, y: y + ch + gap, w: mw, h: rest - ch - gap }; }
  const padS = 16 * U;
  const grow = (r) => ({ x: r.x - padS, y: r.y - padS, w: r.w + padS * 2, h: r.h + padS * 2, r: 26 * U });
  const stops = [grow(chart), { ...grow(btn), r: (btn.h + padS * 2) / 2 }, grow(list)];
  const T0 = 0.65, moves = [2.4, 4.2], MD = 0.7;
  const r = m.rng(7);
  const series = Array.from({ length: 18 }, (_, i) => 0.25 + 0.5 * (i / 17) + 0.12 * Math.sin(i * 1.3) + r() * 0.06);

  const skel = (g, x, y, w, h, col) => k.draw.rrect(g, x, y, w, h, h / 2, col || P.skel);
  const cardBox = (g, b) => { k.draw.rrect(g, b.x, b.y, b.w, b.h, 16 * U, P.card); k.draw.rrect(g, b.x, b.y, b.w, b.h, 16 * U, null, P.line, 1); };
  function dash(g, t) {
    k.draw.browser(g, winX, winY, winW, winH, { fill: P.win, bar: 50, url: '', dark });
    if (wide) {
      g.fillStyle = P.side; g.fillRect(winX, winY + bar, sideW, winH - bar);
      g.fillStyle = P.line; g.fillRect(winX + sideW - 1, winY + bar, 1, winH - bar);
      k.logo.draw(g, winX + 44 * U, winY + bar + 44 * U, 30 * U);
      skel(g, winX + 70 * U, winY + bar + 37 * U, 80 * U, 14 * U);
      for (let i = 0; i < 6; i++) {
        const iy = winY + bar + 110 * U + i * 52 * U;
        k.draw.rrect(g, winX + 34 * U, iy - 9 * U, 18 * U, 18 * U, 5 * U, i === 0 ? c.accent : P.skel);
        skel(g, winX + 66 * U, iy - 6 * U, (70 + m.hash(i, 3) * 70) * U, 12 * U);
      }
    }
    skel(g, head.x, head.y + 16 * U, 300 * U, 26 * U, C.alpha(c.fg, dark ? 0.22 : 0.16));
    k.draw.rrect(g, btn.x, btn.y, btn.w, btn.h, btn.h / 2, c.accent);
    k.draw.icon(g, 'rocket', btn.x + 40 * U, btn.y + btn.h / 2, 26 * U, C.onColor(c.accent), { stroke: 2 });
    skel(g, btn.x + 66 * U, btn.y + btn.h / 2 - 7 * U, 100 * U, 14 * U, C.alpha(C.onColor(c.accent), 0.75));
    kpis.forEach((b) => {
      cardBox(g, b);
      skel(g, b.x + 22 * U, b.y + 22 * U, b.w * 0.35, 12 * U);
      skel(g, b.x + 22 * U, b.y + b.h - 56 * U, b.w * (0.35 + m.hash(b.i, 9) * 0.2), 30 * U, C.alpha(c.fg, dark ? 0.24 : 0.17));
    });
    cardBox(g, chart);
    skel(g, chart.x + 26 * U, chart.y + 28 * U, 180 * U, 16 * U);
    const gx = chart.x + 26 * U, gy = chart.y + 80 * U, gw = chart.w - 52 * U, gh = chart.h - 106 * U;
    g.fillStyle = P.line;
    for (let i = 0; i <= 4; i++) g.fillRect(gx, gy + (gh * i) / 4, gw, Math.max(1, U));
    const pts = series.map((q, j) => [gx + (j / (series.length - 1)) * gw, gy + gh - q * gh * 0.9]);
    const grd = g.createLinearGradient(0, gy, 0, gy + gh);
    grd.addColorStop(0, C.alpha(c.accent, dark ? 0.3 : 0.18)); grd.addColorStop(1, C.alpha(c.accent, 0));
    g.beginPath(); g.moveTo(gx, gy + gh); pts.forEach(([px, py]) => g.lineTo(px, py)); g.lineTo(gx + gw, gy + gh); g.closePath();
    g.fillStyle = grd; g.fill();
    k.draw.polyline(g, pts, ease.inOutCubic(m.seg(t, 0.4, 1.4)), c.accent, 3);
    cardBox(g, list);
    skel(g, list.x + 26 * U, list.y + 28 * U, 140 * U, 16 * U);
    const rh = 58 * U;
    const n = Math.floor((list.h - 80 * U) / rh);
    for (let i = 0; i < n; i++) {
      const ry = list.y + 70 * U + i * rh;
      k.draw.circle(g, list.x + 44 * U, ry + rh / 2, 16 * U, C.mix([c.accent2, c.accent3, c.accent][i % 3] || c.accent, P.card, 0.3));
      skel(g, list.x + 74 * U, ry + rh / 2 - 12 * U, list.w * (0.3 + m.hash(i, 2) * 0.25), 12 * U);
      skel(g, list.x + 74 * U, ry + rh / 2 + 6 * U, list.w * 0.18, 10 * U, P.skel2);
      if (i < n - 1) { g.fillStyle = P.line; g.fillRect(list.x + 26 * U, ry + rh, list.w - 52 * U, Math.max(1, U)); }
    }
  }
  const layer = k.layer('feature.spotlight');
  const lg = k.ctx(layer);

  return {
    draw(g, t) {
      const enter = ease.outQuint(m.seg(t, 0, 0.6));
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.4);
      g.translate(0, (1 - enter) * 30 * U);
      dash(g, t);
      g.restore();
      // spotlight geometry
      const open = ease.emphasized(m.seg(t, T0, 0.9));
      let S = { ...stops[0] };
      const grow0 = (1 - open) * 70 * U;
      S = { x: S.x - grow0, y: S.y - grow0, w: S.w + grow0 * 2, h: S.h + grow0 * 2, r: S.r + grow0 * 0.5 };
      let idx = 0;
      moves.forEach((mt, i) => {
        const e = ease.inOutCubic(m.seg(t, mt, MD));
        if (t >= mt) {
          const a = stops[i], b = stops[i + 1];
          S = { x: m.lerp(a.x, b.x, e), y: m.lerp(a.y, b.y, e), w: m.lerp(a.w, b.w, e), h: m.lerp(a.h, b.h, e), r: m.lerp(a.r, b.r, e) };
          idx = i + 1;
        }
      });
      const dimA = ease.outCubic(m.seg(t, T0, 0.45));
      if (dimA > 0) {
        lg.setTransform(1, 0, 0, 1, 0, 0);
        lg.globalCompositeOperation = 'source-over';
        lg.clearRect(0, 0, k.W, k.H);
        lg.fillStyle = C.alpha(dark ? '#000000' : c.bg, p.dim * (dark ? 1 : 0.92));
        lg.fillRect(0, 0, k.W, k.H);
        lg.globalCompositeOperation = 'destination-out';
        lg.filter = `blur(${(28 * U).toFixed(1)}px)`;
        k.draw.rrect(lg, S.x, S.y, S.w, S.h, S.r, '#000000');
        lg.filter = 'none';
        lg.globalCompositeOperation = 'source-over';
        g.save(); g.globalAlpha *= dimA; g.drawImage(layer, 0, 0); g.restore();
        g.save(); g.globalAlpha *= dimA * 0.55 * open;
        k.draw.rrect(g, S.x, S.y, S.w, S.h, S.r, null, c.accent, 1.5);
        g.restore();
      }
      // caption
      const capIn = (i) => (i === 0 ? T0 + 0.6 : moves[i - 1] + MD + 0.05);
      const capOut = (i) => (i < moves.length ? moves[i] : 99);
      for (let i = 0; i < 3; i++) {
        const a = Math.min(ease.outCubic(m.seg(t, capIn(i), 0.3)), 1 - ease.inCubic(m.seg(t, capOut(i), 0.2)));
        if (a <= 0) continue;
        const st = stops[i];
        const ls = { role: 'display', size: k.pick({ wide: 38, square: 36, tall: 38 }), weight: 620, tracking: -0.02 };
        const L = k.text.layout(feats[i], ls);
        const cw = L.width + 120 * U, ch = 92 * U;
        const below = st.y + st.h + 24 * U + ch < k.safe.y + k.safe.h;
        let cx = m.clamp(st.x + st.w / 2, k.safe.x + cw / 2, k.safe.x + k.safe.w - cw / 2);
        const cy = below ? st.y + st.h + 24 * U + ch / 2 : st.y - 24 * U - ch / 2;
        g.save();
        g.globalAlpha *= a;
        g.translate(0, (1 - a) * 12 * U * (below ? 1 : -1));
        const capFill = dark ? C.mix(c.bg, c.fg, 0.12) : '#ffffff';
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.18)'; g.shadowBlur = 40 * U; g.shadowOffsetY = 14 * U;
        k.draw.rrect(g, cx - cw / 2, cy - ch / 2, cw, ch, ch / 2, capFill);
        g.restore();
        k.draw.rrect(g, cx - cw / 2, cy - ch / 2, cw, ch, ch / 2, null, C.alpha(c.fg, 0.1), 1);
        k.draw.circle(g, cx - cw / 2 + 46 * U, cy, 22 * U, C.alpha(c.accent, dark ? 0.22 : 0.12));
        k.text.draw(g, String(i + 1), cx - cw / 2 + 46 * U, cy, { role: 'mono', size: 24, weight: 600, color: dark ? C.mix(c.accent, '#ffffff', 0.3) : C.shade(c.accent, -0.05), align: 'center', baseline: 'middle' });
        k.text.draw(g, feats[i], cx - cw / 2 + 84 * U, cy, { ...ls, baseline: 'middle' });
        g.restore();
      }
    },
  };
}
