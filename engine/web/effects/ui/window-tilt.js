// A browser window lies back in steep perspective, swings up to face the camera,
// and its release dashboard cascades in block by block. Ends on a held, flat frame
// with a slow push-in.
export const meta = {
  id: 'ui.window-tilt',
  name: 'Window Tilt',
  category: 'ui',
  duration: 4.8,
  summary: 'A code-drawn browser window rotates from a steep 3D tilt to flat while its dashboard blocks cascade in; holds on the clean final composition.',
  bestFor: ['product reveal', 'hero UI', 'dashboard intro'],
  slots: ['stats', 'features', 'url'],
  params: {
    tilt: { default: 52, min: 20, max: 70, label: 'Start pitch (deg)' },
    stagger: { default: 0.065, min: 0.03, max: 0.12, label: 'Block stagger (s)' },
  },
  sfx: [{ t: 0.05, type: 'whoosh', dur: 0.9, gain: 0.45 }, { t: 1.5, type: 'tick', gain: 0.4 }],
  prompt: `Draw a generic browser window (rounded 18 px corners, three dots, address pill) at 78% of frame width in 16:9, 89% in portrait. Render its content to an offscreen canvas and map it onto the screen with a perspective projection by splitting the rect into a 16x12 grid of affine triangles. At 0 ms the window is pitched back 52 deg, yawed -22 deg and pushed 30% deeper; over 1600 ms (cubic-bezier 0.3,0,0,1) it swings to flat. From 300 ms, dashboard blocks (sidebar, header, three KPI tiles, chart card, list card) rise 28 px and fade in with outQuint over 700 ms, 65 ms apart. Text fades in only once the window is flat (1350-1700 ms); the chart line draws 1500-2500 ms. Hold from 2.5 s with a 2.5% inOutSine push-in. Soft shadow on light brands, faint accent glow on dark.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const P = {
    win: dark ? C.mix(c.bg, c.fg, 0.055) : '#ffffff',
    side: dark ? C.mix(c.bg, c.fg, 0.035) : C.mix('#ffffff', c.fg, 0.028),
    card: dark ? C.mix(c.bg, c.fg, 0.095) : '#ffffff',
    line: C.alpha(c.fg, dark ? 0.09 : 0.1),
    skel: C.alpha(c.fg, dark ? 0.14 : 0.09),
    skel2: C.alpha(c.fg, dark ? 0.08 : 0.055),
    fg: c.fg, muted: c.muted, accent: c.accent,
    accentSoft: C.alpha(c.accent, dark ? 0.16 : 0.1),
  };
  const stats = (k.copy('stats', null) || [{ value: 1200, suffix: '+', label: 'releases' }, { value: 4, suffix: 'x', label: 'faster' }, { value: 99.9, suffix: '%', label: 'uptime', decimals: 1 }]).slice(0, 3);
  const fmt = (s) => s.value.toLocaleString('en-US', { minimumFractionDigits: s.decimals || 0, maximumFractionDigits: s.decimals || 0 }) + (s.suffix || '');
  const features = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs', 'Approvals']).slice(0, 4);
  const url = k.copy('url', 'example.app');

  // ---------- layout (window-local px) ----------
  const portrait = !k.isWide;
  const winW = Math.round(k.pick({ wide: 1480, square: 960, tall: 960 }) * k.u);
  const winH = Math.round(Math.min(k.pick({ wide: 860, square: 1000, tall: 1480 }) * k.u, k.H * 0.78));
  const winX = Math.round(k.cx - winW / 2), winY = Math.round(k.cy - winH / 2 + k.pick({ wide: 18, square: 10, tall: 0 }) * k.u);
  const U = k.u;
  const bar = 56 * U;
  const L = { blocks: [] };
  const content = { x: winX, y: winY + bar, w: winW, h: winH - bar };
  const sideW = portrait ? 0 : 290 * U;
  const pad = 36 * U;
  const mx = content.x + sideW + pad, mw = content.w - sideW - pad * 2;
  let y = content.y + pad;
  if (!portrait) L.blocks.push({ type: 'side', x: content.x, y: content.y, w: sideW, h: content.h });
  L.blocks.push({ type: 'header', x: mx, y, w: mw, h: 56 * U });
  y += 56 * U + 26 * U;
  const kpiH = k.pick({ wide: 160, square: 170, tall: 176 }) * U, gap = 22 * U;
  const kw = (mw - gap * 2) / 3;
  for (let i = 0; i < 3; i++) L.blocks.push({ type: 'kpi', i, x: mx + i * (kw + gap), y, w: kw, h: kpiH });
  y += kpiH + gap;
  const rest = content.y + content.h - pad - y;
  if (!portrait) {
    const cw = (mw - gap) * 0.62;
    L.blocks.push({ type: 'chart', x: mx, y, w: cw, h: rest });
    L.blocks.push({ type: 'list', x: mx + cw + gap, y, w: mw - cw - gap, h: rest });
  } else {
    const ch = rest * 0.5;
    L.blocks.push({ type: 'chart', x: mx, y, w: mw, h: ch });
    L.blocks.push({ type: 'list', x: mx, y: y + ch + gap, w: mw, h: rest - ch - gap });
  }
  // chart data (seeded)
  const r = m.rng(11);
  const series = [];
  let v = 0.25;
  for (let i = 0; i < 14; i++) { v = m.clamp(v + (r() - 0.32) * 0.16, 0.08, 0.95); series.push(v); }
  series[13] = Math.max(series[13], 0.9);
  const spark = [0, 1, 2].map((s) => { const rr = m.rng(30 + s); let q = 0.4; return Array.from({ length: 9 }, (_, i) => (q = m.clamp(q + (rr() - 0.35) * 0.3, 0.05, 1), i === 8 ? 0.95 : q)); });
  const listRows = Array.from({ length: 6 }, (_, i) => ({ w: 0.45 + m.hash(i, 5) * 0.4, st: [0, 1, 1, 2, 1, 2][i] }));
  const navIcons = ['home', 'layers', 'rocket', 'file', 'users'];

  const skel = (g, x, y, w, h, col) => k.draw.rrect(g, x, y, w, h, h / 2, col || P.skel);

  function drawWindow(g, t, txtA) {
    k.draw.browser(g, winX, winY, winW, winH, { shadow: false, fill: P.win, bar: 56, url: '', dark });
    // url text in the pill
    const pw = Math.min(winW * 0.42, 420 * U);
    k.draw.icon(g, 'lock', winX + winW / 2 - pw / 2 + 22 * U, winY + bar / 2, 16 * U, P.muted);
    if (txtA > 0) k.text.draw(g, url, winX + winW / 2, winY + bar / 2, { role: 'text', size: 22, weight: 460, color: P.muted, align: 'center', baseline: 'xmiddle', alpha: txtA });
    g.save();
    k.draw.rrectPath(g, content.x, content.y, content.w, content.h, 0);
    g.clip();
    L.blocks.forEach((b, i) => {
      const a = ease.outQuint(m.seg(t, 0.3 + i * p.stagger, 0.7));
      if (a <= 0) return;
      g.save();
      g.globalAlpha *= Math.min(1, a * 1.4);
      g.translate(0, (1 - a) * 28 * U);
      drawBlock(g, b, t, txtA);
      g.restore();
    });
    g.restore();
  }

  function drawBlock(g, b, t, txtA) {
    const { x, y, w, h } = b;
    if (b.type === 'side') {
      g.fillStyle = P.side; g.fillRect(x, y, w, h);
      g.fillStyle = P.line; g.fillRect(x + w - 1, y, 1, h);
      k.logo.draw(g, x + 46 * U, y + 52 * U, 34 * U);
      if (txtA > 0) k.text.draw(g, k.brand.name, x + 76 * U, y + 52 * U, { role: 'display', size: 28, weight: 640, baseline: 'middle', alpha: txtA });
      const labels = ['Overview', ...features];
      labels.forEach((lab, i) => {
        const iy = y + 128 * U + i * 58 * U;
        if (i === 0) k.draw.rrect(g, x + 18 * U, iy - 22 * U, w - 36 * U, 44 * U, 12 * U, P.accentSoft);
        const col = i === 0 ? P.accent : P.muted;
        k.draw.icon(g, navIcons[i] || 'grid', x + 46 * U, iy, 24 * U, col);
        if (txtA > 0) k.text.draw(g, lab, x + 72 * U, iy, { role: 'text', size: 22, weight: i === 0 ? 560 : 460, color: i === 0 ? P.fg : P.muted, baseline: 'xmiddle', alpha: txtA });
      });
      // footer: avatar + skeleton
      k.draw.circle(g, x + 46 * U, y + h - 50 * U, 18 * U, C.mix(c.accent, c.accent2 || c.accent, 0.5));
      skel(g, x + 76 * U, y + h - 56 * U, 120 * U, 12 * U);
      return;
    }
    if (b.type === 'header') {
      if (txtA > 0) k.text.draw(g, 'Release overview', x, y + h / 2, { role: 'display', size: k.pick({ wide: 40, square: 38, tall: 38 }), weight: 620, baseline: 'middle', alpha: txtA });
      // right: avatars + button
      const bw = 56 * U;
      k.draw.rrect(g, x + w - bw, y + h / 2 - 24 * U, bw, 48 * U, 14 * U, P.accent);
      k.draw.icon(g, 'plus', x + w - bw / 2, y + h / 2, 26 * U, k.color.onColor(c.accent));
      for (let i = 0; i < 3; i++) {
        const ax = x + w - bw - 40 * U - i * 30 * U;
        k.draw.circle(g, ax, y + h / 2, 20 * U, P.win);
        k.draw.circle(g, ax, y + h / 2, 17 * U, C.mix(c.accent, i === 1 ? (c.accent3 || c.fg) : (c.accent2 || c.fg), 0.35 + i * 0.2));
      }
      return;
    }
    card(g, x, y, w, h);
    if (b.type === 'kpi') {
      const s = stats[b.i];
      if (!s) return;
      const ip = 26 * U;
      if (txtA > 0) {
        k.text.draw(g, s.label, x + ip, y + ip + 6 * U, { role: 'text', size: 22, weight: 480, color: P.muted, baseline: 'top', alpha: txtA });
        const vs = k.text.fit(fmt(s), { role: 'display', size: k.pick({ wide: 52, square: 42, tall: 42 }), weight: 620 }, w - ip * 2);
        k.text.draw(g, fmt(s), x + ip, y + h - ip - 4 * U, { role: 'display', size: vs, weight: 620, tracking: -0.03, alpha: txtA, color: b.i === 0 ? P.fg : P.fg });
      }
      // sparkline (top-right)
      if (k.isWide) {
        const sp = spark[b.i], sw = w * 0.32, sh = 34 * U, sx = x + w - ip - sw, sy = y + ip + 4 * U;
        const pr = ease.outQuint(m.seg(t, 1.2 + b.i * 0.1, 0.9));
        const pts = sp.map((q, j) => [sx + (j / (sp.length - 1)) * sw, sy + sh - q * sh]);
        k.draw.polyline(g, pts, pr, b.i === 0 ? P.accent : C.alpha(c.fg, 0.35), 2.5);
      }
      return;
    }
    if (b.type === 'chart') {
      const ip = 28 * U;
      if (txtA > 0) k.text.draw(g, 'Releases shipped', x + ip, y + ip + 4 * U, { role: 'text', size: 24, weight: 560, baseline: 'top', alpha: txtA });
      skel(g, x + w - ip - 110 * U, y + ip + 6 * U, 110 * U, 14 * U, P.skel2);
      const gx = x + ip, gy = y + ip + 70 * U, gw = w - ip * 2, gh = h - ip * 2 - 70 * U;
      g.fillStyle = P.line;
      for (let i = 0; i <= 3; i++) g.fillRect(gx, Math.round(gy + (gh * i) / 3), gw, Math.max(1, U));
      const pr = ease.inOutCubic(m.seg(t, 1.5, 1.0));
      const pts = series.map((q, j) => [gx + (j / (series.length - 1)) * gw, gy + gh - q * gh * 0.92]);
      if (pr > 0) {
        // area under the drawn part
        const n = (series.length - 1) * pr;
        const area = [];
        for (let j = 0; j <= Math.floor(n); j++) area.push(pts[j]);
        if (n % 1 > 0) { const j = Math.floor(n); area.push([m.lerp(pts[j][0], pts[j + 1][0], n % 1), m.lerp(pts[j][1], pts[j + 1][1], n % 1)]); }
        const grd = g.createLinearGradient(0, gy, 0, gy + gh);
        grd.addColorStop(0, C.alpha(c.accent, dark ? 0.32 : 0.2)); grd.addColorStop(1, C.alpha(c.accent, 0));
        g.beginPath(); g.moveTo(area[0][0], gy + gh);
        area.forEach(([px, py]) => g.lineTo(px, py));
        g.lineTo(area[area.length - 1][0], gy + gh); g.closePath();
        g.fillStyle = grd; g.fill();
        const end = k.draw.polyline(g, pts, pr, P.accent, 3.5);
        if (end) {
          if (dark) k.draw.glow(g, end[0], end[1], 30 * U, c.accent, 0.5);
          k.draw.circle(g, end[0], end[1], 7 * U, P.card, P.accent, 3);
        }
      }
      return;
    }
    if (b.type === 'list') {
      const ip = 28 * U;
      if (txtA > 0) k.text.draw(g, 'Up next', x + ip, y + ip + 4 * U, { role: 'text', size: 24, weight: 560, baseline: 'top', alpha: txtA });
      const rh = k.pick({ wide: 64, square: 58, tall: 64 }) * U;
      const n = Math.min(listRows.length, Math.floor((h - ip * 2 - 60 * U) / rh));
      for (let i = 0; i < n; i++) {
        const ry = y + ip + 72 * U + i * rh;
        const a = ease.outQuint(m.seg(t, 1.0 + i * 0.06, 0.6));
        g.save(); g.globalAlpha *= a;
        const row = listRows[i];
        const st = [c.accent3 || c.accent, c.accent, C.alpha(c.fg, 0.3)][row.st];
        k.draw.circle(g, x + ip + 8 * U, ry + rh / 2, 7 * U, st);
        skel(g, x + ip + 32 * U, ry + rh / 2 - 7 * U, (w - ip * 2 - 90 * U) * row.w, 14 * U);
        k.draw.circle(g, x + w - ip - 18 * U, ry + rh / 2, 16 * U, P.skel2);
        if (i < n - 1) { g.fillStyle = P.line; g.fillRect(x + ip, ry + rh, w - ip * 2, Math.max(1, U)); }
        g.restore();
      }
    }
  }
  function card(g, x, y, w, h) {
    g.save();
    if (!dark) { g.shadowColor = 'rgba(20,30,60,0.07)'; g.shadowBlur = 24 * U; g.shadowOffsetY = 6 * U; }
    k.draw.rrect(g, x, y, w, h, 18 * U, P.card);
    g.restore();
    k.draw.rrect(g, x, y, w, h, 18 * U, null, P.line, 1);
  }

  // ---------- perspective warp ----------
  function tri(g, src, s0, s1, s2, d0, d1, d2) {
    const dx1 = s1[0] - s0[0], dy1 = s1[1] - s0[1], dx2 = s2[0] - s0[0], dy2 = s2[1] - s0[1];
    const det = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(det) < 1e-6) return;
    const X1 = d1[0] - d0[0], X2 = d2[0] - d0[0], Y1 = d1[1] - d0[1], Y2 = d2[1] - d0[1];
    const a = (X1 * dy2 - X2 * dy1) / det, cc = (X2 * dx1 - X1 * dx2) / det;
    const b = (Y1 * dy2 - Y2 * dy1) / det, d = (Y2 * dx1 - Y1 * dx2) / det;
    const e = d0[0] - a * s0[0] - cc * s0[1], f = d0[1] - b * s0[0] - d * s0[1];
    // expand the clip triangle slightly to hide seams
    const mxp = (d0[0] + d1[0] + d2[0]) / 3, myp = (d0[1] + d1[1] + d2[1]) / 3;
    const ex = (q) => { const vx = q[0] - mxp, vy = q[1] - myp, l = Math.hypot(vx, vy) || 1; return [q[0] + (vx / l) * 0.9, q[1] + (vy / l) * 0.9]; };
    const e0 = ex(d0), e1 = ex(d1), e2 = ex(d2);
    g.save();
    g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.lineTo(e2[0], e2[1]); g.closePath(); g.clip();
    g.transform(a, b, cc, d, e, f);
    const bx = Math.max(0, Math.floor(Math.min(s0[0], s1[0], s2[0]) - 2)), by = Math.max(0, Math.floor(Math.min(s0[1], s1[1], s2[1]) - 2));
    const bx1 = Math.min(src.width, Math.ceil(Math.max(s0[0], s1[0], s2[0]) + 2)), by1 = Math.min(src.height, Math.ceil(Math.max(s0[1], s1[1], s2[1]) + 2));
    if (bx1 > bx && by1 > by) g.drawImage(src, bx, by, bx1 - bx, by1 - by, bx, by, bx1 - bx, by1 - by);
    g.restore();
  }
  function warp(g, src, rect, proj, nx, ny) {
    const S = [], D = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const sx = rect.x + (rect.w * i) / nx, sy = rect.y + (rect.h * j) / ny;
      S.push([sx, sy]); D.push(proj(sx, sy));
    }
    const id = (i, j) => j * (nx + 1) + i;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = id(i, j), b = id(i + 1, j), cI = id(i, j + 1), d = id(i + 1, j + 1);
      tri(g, src, S[a], S[b], S[d], D[a], D[b], D[d]);
      tri(g, src, S[a], S[d], S[cI], D[a], D[d], D[cI]);
    }
  }

  const DUR = p.duration ?? meta.duration;
  const layer = k.layer('ui.window-tilt');
  const lg = k.ctx(layer);
  const ocx = winX + winW / 2, ocy = winY + winH / 2;

  return {
    draw(g, t) {
      const T = m.seg(t, 0, 1.6);
      const tp = ease.emphasized(T);
      const txtA = ease.outCubic(m.seg(t, 1.35, 0.35));
      // backdrop light
      if (dark) k.draw.glow(g, k.cx, ocy + winH * 0.1, Math.max(winW, winH) * 0.75, c.accent, 0.16 * ease.outCubic(m.seg(t, 0.2, 1.4)));
      const rx = (p.tilt * Math.PI / 180) * (1 - tp);
      const ry = (-22 * Math.PI / 180) * (1 - tp);
      const rz = (3 * Math.PI / 180) * (1 - tp);
      const zOff = winH * 0.3 * (1 - tp);
      const yOff = winH * 0.1 * (1 - tp);
      const D = Math.max(k.W, k.H) * 1.5;
      const push = 1 + 0.025 * ease.inOutSine(m.seg(t, 1.9, DUR - 1.9));
      const proj = (x, y) => {
        let q = [x - ocx, y - ocy, 0];
        q = m.rotZ(q, rz); q = m.rotX(q, rx); q = m.rotY(q, ry);
        const s = D / (D + q[2] + zOff);
        return [k.cx + q[0] * s * push, ocy + (q[1] + yOff) * s * push];
      };
      // shadow under the projected window
      const corners = [[winX, winY], [winX + winW, winY], [winX + winW, winY + winH], [winX, winY + winH]].map(([x, y]) => proj(x, y));
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.2)';
      g.shadowBlur = 70 * U; g.shadowOffsetY = 34 * U;
      g.beginPath(); corners.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = P.win; g.fill();
      g.restore();
      if (T < 1) {
        lg.setTransform(1, 0, 0, 1, 0, 0);
        lg.clearRect(0, 0, k.W, k.H);
        drawWindow(lg, t, txtA);
        warp(g, layer, { x: winX, y: winY, w: winW, h: winH }, proj, 16, 12);
      } else {
        g.save();
        g.translate(k.cx, ocy); g.scale(push, push); g.translate(-k.cx, -ocy);
        drawWindow(g, t, txtA);
        g.restore();
      }
    },
  };
}
