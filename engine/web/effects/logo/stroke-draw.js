// The mark's outline traces itself with a bright travelling head, the fill wipes in
// behind the line, then the mark glides left and the wordmark rises letter by letter.
export const meta = {
  id: 'logo.stroke-draw',
  name: 'Stroke Draw',
  category: 'logo',
  duration: 4.7,
  summary: 'Each outline of the mark draws on with a glowing lead point, a soft diagonal wipe fills it, then the wordmark rises letter-staggered beside it and the lockup holds.',
  bestFor: ['opening ident', 'end card', 'brand reveal'],
  slots: [],
  params: {
    wordmark: { default: true, label: 'Show wordmark' },
    lineWidth: { default: 2.4, min: 1, max: 5, label: 'Outline width (ref px)' },
  },
  sfx: [{ t: 0.3, type: 'swell', dur: 1.6, gain: 0.45 }, { t: 1.25, type: 'shimmer', gain: 0.45 }, { t: 2.3, type: 'whoosh', dur: 0.5, gain: 0.35 }],
  prompt: `Flatten every sub-path of the logo's vector outline into an ordered polyline and measure its length. From 300 ms, stroke each sub-path progressively (inOutCubic, 1350 ms, 120 ms stagger) with a 2.4 px hairline in the foreground colour; the last 9% of the drawn length is re-stroked in the accent and a small radial glow rides the exact tip. From 1350 ms a soft-edged diagonal wipe (bottom-left to top-right, emphasized, 950 ms) reveals the solid filled mark behind the line, and the outline fades away by 2650 ms. At 2350 ms the mark (about 23% of frame height) glides left with an emphasized 900 ms move to make room, and the brand name (about 14% of frame height, weight 620, -0.035 em) rises glyph by glyph, 50 ms stagger, outQuint 700 ms, from a third of its cap height below. Hold the clean lockup for at least 1.2 s.`,
};

// ---- SVG path -> polylines (own minimal parser: M L H V C S Q T A Z, abs + rel) ----
function flatten(d) {
  const toks = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
  const subs = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, cpx = 0, cpy = 0, cur = null, prev = '';
  const num = () => Number(toks[i++]);
  const push = (px, py) => cur.pts.push([px, py]);
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    const n = 18;
    for (let s = 1; s <= n; s++) {
      const t = s / n, mt = 1 - t;
      push(mt * mt * mt * x + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3, mt * mt * mt * y + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3);
    }
  };
  const arc = (rx, ry, rot, large, sweep, x2, y2) => {
    if (!rx || !ry) { push(x2, y2); return; }
    rx = Math.abs(rx); ry = Math.abs(ry);
    const ph = (rot * Math.PI) / 180, cs = Math.cos(ph), sn = Math.sin(ph);
    const dx = (x - x2) / 2, dy = (y - y2) / 2;
    const x1p = cs * dx + sn * dy, y1p = -sn * dx + cs * dy;
    const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
    const num2 = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
    let co = Math.sqrt(Math.max(0, num2 / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
    if (large === sweep) co = -co;
    const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
    const ccx = cs * cxp - sn * cyp + (x + x2) / 2, ccy = sn * cxp + cs * cyp + (y + y2) / 2;
    const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const a1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let da = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!sweep && da > 0) da -= Math.PI * 2; else if (sweep && da < 0) da += Math.PI * 2;
    const n = Math.max(6, Math.ceil(Math.abs(da) / 0.15));
    for (let s = 1; s <= n; s++) {
      const a = a1 + (da * s) / n;
      push(ccx + rx * Math.cos(a) * cs - ry * Math.sin(a) * sn, ccy + rx * Math.cos(a) * sn + ry * Math.sin(a) * cs);
    }
  };
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    else if (cmd === 'M') cmd = 'L'; else if (cmd === 'm') cmd = 'l';
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === 'M') {
      x = ox + num(); y = oy + num(); sx = x; sy = y;
      cur = { pts: [[x, y]], closed: false }; subs.push(cur);
    } else if (C === 'Z') {
      if (cur) { cur.closed = true; push(sx, sy); }
      x = sx; y = sy;
      cur = { pts: [[x, y]], closed: false }; subs.push(cur);
    } else {
      if (!cur) { cur = { pts: [[x, y]], closed: false }; subs.push(cur); }
      if (C === 'L') { x = ox + num(); y = oy + num(); push(x, y); }
      else if (C === 'H') { x = ox + num(); push(x, y); }
      else if (C === 'V') { y = oy + num(); push(x, y); }
      else if (C === 'C') { const a = ox + num(), b = oy + num(), c2 = ox + num(), d2 = oy + num(), e = ox + num(), f = oy + num(); cubic(a, b, c2, d2, e, f); cpx = c2; cpy = d2; x = e; y = f; }
      else if (C === 'S') { const rx1 = /[CS]/i.test(prev) ? 2 * x - cpx : x, ry1 = /[CS]/i.test(prev) ? 2 * y - cpy : y; const c2 = ox + num(), d2 = oy + num(), e = ox + num(), f = oy + num(); cubic(rx1, ry1, c2, d2, e, f); cpx = c2; cpy = d2; x = e; y = f; }
      else if (C === 'Q') { const a = ox + num(), b = oy + num(), e = ox + num(), f = oy + num(); cubic(x + (2 / 3) * (a - x), y + (2 / 3) * (b - y), e + (2 / 3) * (a - e), f + (2 / 3) * (b - f), e, f); cpx = a; cpy = b; x = e; y = f; }
      else if (C === 'T') { const a = /[QT]/i.test(prev) ? 2 * x - cpx : x, b = /[QT]/i.test(prev) ? 2 * y - cpy : y; const e = ox + num(), f = oy + num(); cubic(x + (2 / 3) * (a - x), y + (2 / 3) * (b - y), e + (2 / 3) * (a - e), f + (2 / 3) * (b - f), e, f); cpx = a; cpy = b; x = e; y = f; }
      else if (C === 'A') { const rx = num(), ry = num(), rot = num(), la = num(), sw = num(), e = ox + num(), f = oy + num(); arc(rx, ry, rot, la, sw, e, f); x = e; y = f; }
      else i++;
    }
    prev = cmd;
  }
  return subs.filter((s) => s.pts.length > 1).map((s) => {
    const lens = [0];
    for (let j = 1; j < s.pts.length; j++) lens.push(lens[j - 1] + Math.hypot(s.pts[j][0] - s.pts[j - 1][0], s.pts[j][1] - s.pts[j - 1][1]));
    return { ...s, lens, len: lens[lens.length - 1] };
  }).filter((s) => s.len > 0.01);
}
// Point at arc length L along a flattened sub-path.
function pointAt(s, L) {
  L = Math.max(0, Math.min(s.len, L));
  let j = 1;
  while (j < s.lens.length - 1 && s.lens[j] < L) j++;
  const f = (L - s.lens[j - 1]) / (s.lens[j] - s.lens[j - 1] || 1);
  return [s.pts[j - 1][0] + (s.pts[j][0] - s.pts[j - 1][0]) * f, s.pts[j - 1][1] + (s.pts[j][1] - s.pts[j - 1][1]) * f];
}
// Partial polyline path between arc lengths a..b.
function tracePart(g, s, a, b, map) {
  a = Math.max(0, a); b = Math.min(s.len, b);
  if (b <= a) return false;
  const p0 = map(pointAt(s, a));
  g.moveTo(p0[0], p0[1]);
  for (let j = 1; j < s.pts.length; j++) {
    if (s.lens[j] <= a) continue;
    if (s.lens[j] >= b) break;
    const p = map(s.pts[j]); g.lineTo(p[0], p[1]);
  }
  const p1 = map(pointAt(s, b));
  g.lineTo(p1[0], p1[1]);
  return true;
}

// Mark + wordmark horizontal lockup, shrunk to fit the safe width.
function lockup(k, withWord) {
  const name = withWord ? k.brand.name || '' : '';
  let markH = k.pick({ wide: 250, square: 230, tall: 210 }) * k.u;
  const wo = { size: k.pick({ wide: 150, square: 126, tall: 112 }), weight: 620, tracking: -0.035 };
  let L = name ? k.text.layout(name, wo) : null;
  let gap = markH * 0.17;
  let total = markH * k.logo.aspect + (L ? gap + L.width : 0);
  const maxW = k.safe.w * 0.86;
  if (total > maxW) {
    const f = maxW / total;
    markH *= f; gap *= f; wo.size *= f;
    L = k.text.layout(name, wo);
    total = markH * k.logo.aspect + gap + L.width;
  }
  const markW = markH * k.logo.aspect;
  return { markH, markW, gap, wo, L, total, markX: k.cx - total / 2 + markW / 2, wordX: k.cx - total / 2 + markW + gap };
}

export function create(k, p) {
  const { ease, m } = k;
  const spec = k.logo.spec;
  const [vx, vy, vw, vh] = spec.viewBox;
  // flatten each logo path; remember which path each sub-path belongs to
  const subs = [];
  spec.paths.forEach((pp, pi) => flatten(pp.d).forEach((s) => subs.push({ ...s, pi })));
  const lk = lockup(k, p.wordmark);
  const fillLayer = k.layer('strokeDrawFill');
  const fg = k.ctx(fillLayer);
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const { markH, markW } = lk;
      const slide = lk.L ? ease.emphasized(m.seg(t, 2.35, 0.9)) : 0;
      const mcx = m.lerp(k.cx, lk.markX, slide), mcy = k.cy;
      const s = markH / vh;
      const ox = mcx - markW / 2, oy = mcy - markH / 2;
      const map = ([x, y]) => [ox + (x - vx) * s, oy + (y - vy) * s];

      // 1. fill wipe (behind the line)
      const wipe = ease.emphasized(m.seg(t, 1.35, 0.95));
      if (wipe > 0) {
        fg.setTransform(1, 0, 0, 1, 0, 0);
        fg.globalCompositeOperation = 'source-over';
        fg.clearRect(0, 0, k.W, k.H);
        k.logo.draw(fg, mcx, mcy, markH);
        if (wipe < 1) {
          // diagonal soft edge from bottom-left to top-right
          const x0 = ox - markW * 0.2, y0 = oy + markH * 1.2, x1 = ox + markW * 1.2, y1 = oy - markH * 0.2;
          const soft = 0.18, pos = -soft + wipe * (1 + soft * 2);
          const grd = fg.createLinearGradient(x0, y0, x1, y1);
          grd.addColorStop(m.clamp(pos - soft), 'rgba(0,0,0,1)');
          grd.addColorStop(m.clamp(pos + 0.0001), 'rgba(0,0,0,0.35)');
          grd.addColorStop(m.clamp(pos + soft), 'rgba(0,0,0,0)');
          fg.globalCompositeOperation = 'destination-in';
          fg.fillStyle = grd;
          fg.fillRect(ox - markW, oy - markH, markW * 3, markH * 3);
          fg.globalCompositeOperation = 'source-over';
        }
        g.drawImage(fillLayer, 0, 0);
      }

      // 2. the outline + travelling head
      const fadeLine = 1 - ease.inOutCubic(m.seg(t, 2.05, 0.6));
      if (fadeLine > 0) {
        const lw = p.lineWidth * k.u;
        g.save();
        g.lineCap = 'round'; g.lineJoin = 'round';
        subs.forEach((sp, i) => {
          const pr = ease.inOutCubic(m.seg(t, 0.3 + i * 0.12, 1.35));
          if (pr <= 0) return;
          const L = sp.len * pr;
          // body
          g.beginPath();
          tracePart(g, sp, 0, L, map);
          g.strokeStyle = k.color.alpha(c.fg, (k.isDark ? 0.82 : 0.9) * fadeLine);
          g.lineWidth = lw;
          g.stroke();
          // bright tail behind the head
          if (pr < 1) {
            const live = Math.sin(Math.PI * Math.min(1, pr * 1.15)) ** 0.5;
            const tail = sp.len * 0.09;
            g.beginPath();
            tracePart(g, sp, L - tail, L, map);
            g.strokeStyle = k.color.alpha(k.isDark ? k.color.mix(c.accent, '#ffffff', 0.35) : c.accent, live * fadeLine);
            g.lineWidth = lw * 1.5;
            g.stroke();
            const [hx, hy] = map(pointAt(sp, L));
            if (k.isDark) {
              k.draw.glow(g, hx, hy, 46 * k.u, c.accent, 0.55 * live);
              k.draw.circle(g, hx, hy, 3.4 * k.u, k.color.alpha('#ffffff', live));
            } else {
              k.draw.glow(g, hx, hy, 34 * k.u, c.accent, 0.28 * live);
              k.draw.circle(g, hx, hy, 3.6 * k.u, k.color.alpha(c.accent, live));
            }
          }
        });
        g.restore();
      }

      // 3. wordmark: glyph-staggered rise
      if (lk.L && t > 2.45) {
        k.text.glyphs(g, k.brand.name, lk.wordX, mcy, { ...lk.wo, baseline: 'middle' }, (i) => {
          const e = ease.outQuint(m.seg(t, 2.52 + i * 0.05, 0.7));
          return { y: (1 - e) * lk.L.cap * 0.34, a: e };
        });
      }
    },
  };
}
