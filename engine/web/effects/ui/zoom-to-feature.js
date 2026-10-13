// A full release dashboard settles into place, then the camera pushes into one card.
// Everything else falls out of focus and dims while the card lifts, its bars rise
// and its key number lands. A feature label pops beneath it. Ends held.
export const meta = {
  id: 'ui.zoom-to-feature',
  name: 'Zoom to Feature',
  category: 'ui',
  duration: 5.2,
  summary: 'A dashboard assembles, the camera pushes into one card while the rest blurs and dims, the card comes alive and a feature label pops beneath; holds at the end.',
  bestFor: ['feature focus', 'metric highlight', 'dashboard tour'],
  slots: ['stats', 'features'],
  params: {
    stat: { default: 1, min: 0, max: 2, label: 'Which copy.stats entry the card shows' },
    feature: { default: 1, min: 0, max: 3, label: 'Which copy.features entry the label shows' },
  },
  sfx: [{ t: 1.0, type: 'whoosh', dur: 1.2, gain: 0.4 }, { t: 3.0, type: 'pop', gain: 0.55 }],
  prompt: `Draw a skeleton dashboard in a window at 90% of the frame: sidebar, four KPI tiles, a chart card, a target card and table rows, all as rounded grey bars so no tiny text exists. Blocks cascade in over 800 ms (outQuint, 50 ms stagger). From 1000 ms the camera pushes for 1700 ms (inOutCubic, log-interpolated scale) until the target card is about 62% of frame height, its centre travelling in a straight screen line. Meanwhile the rest of the dashboard is redrawn with a blur ramping to 14 px and a 55% background-colour dim; the target card stays sharp, gains a soft shadow and an accent hairline. Inside it, seven bars rise with outQuint (70 ms stagger) and the statistic fades up. At 2900 ms a feature pill (accent fill, 34 px label) springs in beneath the card (damping 20). Hold to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const P = {
    win: dark ? C.mix(c.bg, c.fg, 0.05) : '#ffffff',
    side: dark ? C.mix(c.bg, c.fg, 0.03) : C.mix('#ffffff', c.fg, 0.028),
    card: dark ? C.mix(c.bg, c.fg, 0.09) : '#ffffff',
    line: C.alpha(c.fg, dark ? 0.09 : 0.1),
    skel: C.alpha(c.fg, dark ? 0.14 : 0.09),
    skel2: C.alpha(c.fg, dark ? 0.08 : 0.055),
  };
  const stats = k.copy('stats', null) || [{ value: 3, suffix: 'x', label: 'faster releases' }];
  const st = stats[Math.min(stats.length - 1, p.stat | 0)];
  const statStr = st.value.toLocaleString('en-US', { minimumFractionDigits: st.decimals || 0, maximumFractionDigits: st.decimals || 0 }) + (st.suffix || '');
  const feats = k.copy('features', null) || ['One-click releases'];
  const feat = feats[Math.min(feats.length - 1, p.feature | 0)];

  // ---------- layout ----------
  const wide = k.isWide;
  const winW = Math.min(k.W * 0.9, k.pick({ wide: 1728, square: 980, tall: 980 }) * U);
  const winH = Math.min(k.H * 0.87, k.pick({ wide: 940, square: 1180, tall: 1560 }) * U);
  const winX = k.cx - winW / 2, winY = k.cy - winH / 2;
  const bar = 50 * U;
  const sideW = wide ? 240 * U : 0;
  const pad = 30 * U, gap = 22 * U;
  const mx = winX + sideW + pad, mw = winW - sideW - pad * 2;
  let y = winY + bar + pad;
  const blocks = [];
  blocks.push({ type: 'head', x: mx, y, w: mw, h: 44 * U });
  y += 44 * U + gap;
  const kCols = wide ? 4 : 2, kRows = wide ? 1 : 2, kh = (wide ? 132 : 118) * U;
  const kw = (mw - gap * (kCols - 1)) / kCols;
  for (let r = 0; r < kRows; r++) for (let i = 0; i < kCols; i++) blocks.push({ type: 'kpi', i: r * kCols + i, x: mx + i * (kw + gap), y: y + r * (kh + gap), w: kw, h: kh });
  y += kRows * (kh + gap);
  const midH = (wide ? 380 : 420) * U;
  const tw = wide ? mw * 0.38 : (mw - gap) / 2;
  blocks.push({ type: 'chart', x: mx, y, w: mw - tw - gap, h: midH });
  const target = { type: 'target', x: mx + mw - tw, y, w: tw, h: midH };
  blocks.push(target);
  y += midH + gap;
  blocks.push({ type: 'table', x: mx, y, w: mw, h: winY + winH - pad - y });
  // camera target
  const S = Math.min((k.W * (wide ? 0.62 : 0.86)) / target.w, (k.H * (wide ? 0.62 : 0.5)) / target.h);
  const tcx = target.x + target.w / 2, tcy = target.y + target.h / 2;
  const fcx = k.cx, fcy = k.cy - (wide ? 50 : 70) * U;

  const r = m.rng(4);
  const area = Array.from({ length: 16 }, (_, i) => 0.3 + 0.25 * Math.sin(i * 0.7) + r() * 0.2 + i * 0.015);
  const bars = [0.38, 0.52, 0.45, 0.63, 0.58, 0.76, 0.96];
  const skel = (g, x, y, w, h, col) => k.draw.rrect(g, x, y, w, h, h / 2, col || P.skel);
  const cardBox = (g, x, y, w, h) => {
    g.save();
    if (!dark) { g.shadowColor = 'rgba(20,30,60,0.06)'; g.shadowBlur = 20 * U; g.shadowOffsetY = 5 * U; }
    k.draw.rrect(g, x, y, w, h, 16 * U, P.card);
    g.restore();
    k.draw.rrect(g, x, y, w, h, 16 * U, null, P.line, 1);
  };

  function drawDash(g, t) {
    k.draw.browser(g, winX, winY, winW, winH, { shadow: true, fill: P.win, bar: 50, url: '', dark });
    if (wide) {
      g.fillStyle = P.side; g.fillRect(winX, winY + bar, sideW, winH - bar);
      g.fillStyle = P.line; g.fillRect(winX + sideW - 1, winY + bar, 1, winH - bar);
      k.logo.draw(g, winX + 44 * U, winY + bar + 44 * U, 30 * U);
      skel(g, winX + 70 * U, winY + bar + 37 * U, 80 * U, 14 * U);
      for (let i = 0; i < 6; i++) {
        const iy = winY + bar + 110 * U + i * 52 * U;
        if (i === 0) k.draw.rrect(g, winX + 16 * U, iy - 20 * U, sideW - 32 * U, 40 * U, 10 * U, C.alpha(c.accent, dark ? 0.16 : 0.1));
        k.draw.rrect(g, winX + 34 * U, iy - 9 * U, 18 * U, 18 * U, 5 * U, i === 0 ? c.accent : P.skel);
        skel(g, winX + 66 * U, iy - 6 * U, (70 + m.hash(i, 3) * 70) * U, 12 * U, i === 0 ? C.alpha(c.accent, 0.5) : P.skel);
      }
    }
    blocks.forEach((b, i) => {
      const a = ease.outQuint(m.seg(t, 0.05 + i * 0.05, 0.75));
      if (a <= 0) return;
      g.save();
      g.globalAlpha *= Math.min(1, a * 1.4);
      g.translate(0, (1 - a) * 24 * U);
      drawBlock(g, b, t);
      g.restore();
    });
  }
  function drawBlock(g, b, t) {
    const { x, y, w, h } = b;
    if (b.type === 'head') {
      skel(g, x, y + 8 * U, 280 * U, 26 * U, C.alpha(c.fg, dark ? 0.22 : 0.16));
      k.draw.rrect(g, x + w - 150 * U, y, 150 * U, 44 * U, 12 * U, c.accent);
      skel(g, x + w - 120 * U, y + 16 * U, 90 * U, 12 * U, C.alpha(C.onColor(c.accent), 0.7));
      for (let i = 0; i < 3; i++) k.draw.circle(g, x + w - 190 * U - i * 28 * U, y + 22 * U, 17 * U, C.mix(c.accent, i % 2 ? (c.accent3 || c.fg) : (c.accent2 || c.fg), 0.4 + i * 0.15), P.win, 3);
      return;
    }
    if (b.type === 'target') return; // drawn sharp by the camera pass
    cardBox(g, x, y, w, h);
    const ip = 22 * U;
    if (b.type === 'kpi') {
      skel(g, x + ip, y + ip, w * 0.35, 12 * U);
      skel(g, x + ip, y + h - ip - 34 * U, w * (0.32 + m.hash(b.i, 9) * 0.18), 30 * U, C.alpha(c.fg, dark ? 0.24 : 0.17));
      const sp = Array.from({ length: 8 }, (_, j) => [x + w - ip - w * 0.3 + (j / 7) * w * 0.3, y + h - ip - 10 * U - (0.3 + 0.7 * m.hash(j + b.i * 10, 2)) * 30 * U]);
      k.draw.polyline(g, sp, 1, b.i === 0 ? c.accent : C.alpha(c.fg, 0.3), 2.2);
      return;
    }
    if (b.type === 'chart') {
      skel(g, x + ip, y + ip + 4 * U, 160 * U, 14 * U);
      skel(g, x + w - ip - 220 * U, y + ip, 220 * U, 26 * U, P.skel2);
      const gx = x + ip, gy = y + 80 * U, gw = w - ip * 2, gh = h - 80 * U - ip;
      g.fillStyle = P.line;
      for (let i = 0; i <= 4; i++) g.fillRect(gx, gy + (gh * i) / 4, gw, Math.max(1, U));
      const pts = area.map((q, j) => [gx + (j / (area.length - 1)) * gw, gy + gh - q * gh * 0.85]);
      const grd = g.createLinearGradient(0, gy, 0, gy + gh);
      grd.addColorStop(0, C.alpha(c.fg, dark ? 0.12 : 0.07)); grd.addColorStop(1, C.alpha(c.fg, 0));
      g.beginPath(); g.moveTo(gx, gy + gh); pts.forEach(([px, py]) => g.lineTo(px, py)); g.lineTo(gx + gw, gy + gh); g.closePath();
      g.fillStyle = grd; g.fill();
      k.draw.polyline(g, pts, 1, C.alpha(c.fg, dark ? 0.45 : 0.35), 2.5);
      return;
    }
    if (b.type === 'table') {
      const rh = 54 * U;
      skel(g, x + ip, y + ip, 140 * U, 14 * U);
      const n = Math.floor((h - 60 * U) / rh);
      for (let i = 0; i < n; i++) {
        const ry = y + 56 * U + i * rh;
        g.fillStyle = P.line; g.fillRect(x + ip, ry, w - ip * 2, Math.max(1, U));
        k.draw.circle(g, x + ip + 14 * U, ry + rh / 2, 13 * U, P.skel2);
        skel(g, x + ip + 40 * U, ry + rh / 2 - 6 * U, w * (0.18 + m.hash(i, 4) * 0.14), 12 * U);
        skel(g, x + w * 0.5, ry + rh / 2 - 6 * U, w * 0.12, 12 * U, P.skel2);
        k.draw.rrect(g, x + w - ip - 100 * U, ry + rh / 2 - 13 * U, 100 * U, 26 * U, 13 * U, i % 3 === 0 ? C.alpha(c.accent3 || c.accent, 0.22) : P.skel2);
      }
    }
  }
  // Target card, drawn sharp in dashboard coordinates (called under the camera transform).
  function drawTarget(g, t, focus) {
    const { x, y, w, h } = target;
    const ip = 26 * U;
    g.save();
    g.shadowColor = dark ? `rgba(0,0,0,${0.55 * focus})` : `rgba(20,30,60,${0.16 * focus})`;
    g.shadowBlur = 30 * U; g.shadowOffsetY = 12 * U;
    k.draw.rrect(g, x, y, w, h, 16 * U, P.card);
    g.restore();
    k.draw.rrect(g, x, y, w, h, 16 * U, null, C.mix(P.line, c.accent, focus * 0.7), 1 + focus * 0.4);
    k.text.draw(g, 'Release velocity', x + ip, y + ip + 4 * U, { role: 'text', size: 22, weight: 560, baseline: 'top', color: c.muted });
    const va = ease.outCubic(m.seg(t, 2.2, 0.5));
    const vs = k.text.fit(statStr, { role: 'display', size: 64, weight: 640 }, w * 0.6);
    k.text.draw(g, statStr, x + ip, y + ip + 50 * U + (1 - va) * 10 * U, { role: 'display', size: vs, weight: 640, tracking: -0.035, baseline: 'top', alpha: 0.6 + 0.4 * va });
    k.text.draw(g, st.label, x + ip, y + ip + 64 * U + vs * U * 0.92, { role: 'text', size: 22, weight: 460, color: c.muted, baseline: 'top', alpha: 0.6 + 0.4 * va });
    // bars
    const bx = x + ip, bw = w - ip * 2, by = y + h - ip, bh = h * 0.46;
    const n = bars.length, gapB = bw * 0.035, wB = (bw - gapB * (n - 1)) / n;
    bars.forEach((q, i) => {
      const gr = 0.12 + 0.88 * ease.outQuint(m.seg(t, 1.7 + i * 0.07, 0.9));
      const hh = bh * q * gr;
      const last = i === n - 1;
      k.draw.rrect(g, bx + i * (wB + gapB), by - hh, wB, hh, Math.min(8 * U, wB / 2), last ? c.accent : C.alpha(c.fg, dark ? 0.16 : 0.1));
    });
    if (dark) {
      const gl = ease.outCubic(m.seg(t, 2.4, 0.6));
      g.save(); g.globalCompositeOperation = 'lighter';
      k.draw.glow(g, bx + bw - wB / 2, by - bh * bars[n - 1], 60 * U, c.accent, 0.3 * gl);
      g.restore();
    }
  }

  const layer = k.layer('ui.zoom-to-feature');
  const lg = k.ctx(layer);
  const DUR = p.duration ?? meta.duration;

  return {
    draw(g, t) {
      const z = ease.inOutCubic(m.seg(t, 1.0, 1.7));
      const s = Math.exp(Math.log(S) * z);
      // card centre moves on a straight screen line
      const scrX = m.lerp(tcx, fcx, z), scrY = m.lerp(tcy, fcy, z);
      const camX = tcx - (scrX - fcx) / s, camY = tcy - (scrY - fcy) / s;
      const settle = 1 + 0.012 * ease.inOutSine(m.seg(t, 2.7, DUR - 2.7));
      const sc = s * settle;
      const focus = ease.outCubic(m.seg(t, 1.2, 1.4));
      lg.setTransform(1, 0, 0, 1, 0, 0);
      lg.clearRect(0, 0, k.W, k.H);
      drawDash(lg, t);
      g.save();
      g.translate(fcx, fcy); g.scale(sc, sc); g.translate(-camX, -camY);
      const blur = 14 * U * focus;
      if (blur > 0.3) g.filter = `blur(${(blur / sc).toFixed(2)}px)`;
      g.drawImage(layer, 0, 0);
      g.filter = 'none';
      g.restore();
      // dim
      if (focus > 0) { g.fillStyle = C.alpha(c.bg, 0.55 * focus); g.fillRect(0, 0, k.W, k.H); }
      // sharp target card
      const ta = ease.outQuint(m.seg(t, 0.05 + 6 * 0.05, 0.75));
      g.save();
      g.translate(fcx, fcy); g.scale(sc, sc); g.translate(-camX, -camY);
      g.globalAlpha *= Math.min(1, ta * 1.4);
      g.translate(0, (1 - ta) * 24 * U);
      const lift = 1 + 0.03 * focus;
      g.translate(tcx, tcy); g.scale(lift, lift); g.translate(-tcx, -tcy);
      drawTarget(g, t, focus);
      g.restore();
      // feature label
      const lp = ease.spring(t - 2.9, { stiffness: 220, damping: 20 });
      if (t > 2.9) {
        const cardBot = fcy + (target.h / 2) * sc * 1.03;
        const ly = Math.min(cardBot + 70 * U, k.H - k.safe.y - 40 * U);
        const a = m.clamp(m.seg(t, 2.9, 0.2));
        g.save();
        g.translate(k.cx, ly); g.scale(0.6 + 0.4 * lp, 0.6 + 0.4 * lp); g.translate(-k.cx, -ly);
        g.globalAlpha *= a;
        if (dark) k.draw.glow(g, k.cx, ly, 220 * U, c.accent, 0.25);
        k.draw.pill(g, k.cx, ly, feat, { size: 34, weight: 600, fill: c.accent, color: C.onColor(c.accent), icon: 'bolt', padX: 30, h: 76 });
        g.restore();
      }
    },
  };
}
