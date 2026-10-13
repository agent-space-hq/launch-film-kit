// A phone swings in on a perspective yaw, a solid slab with a lit edge, and settles
// into a gentle three-quarter view. While it turns, its home screen comes alive:
// header, a progress card that fills, feature rows and a tab bar. Ends held on the
// slowly drifting phone.
export const meta = {
  id: 'ui.phone-orbit',
  name: 'Phone Orbit',
  category: 'ui',
  duration: 5,
  summary: 'A code-drawn phone swings in with a 3D yaw (perspective slab with visible edge) while its app home screen animates to life; holds on a slow drift.',
  bestFor: ['mobile app launch', 'hero device', 'app showcase'],
  slots: ['features'],
  params: {
    startYaw: { default: 68, min: 30, max: 85, label: 'Start yaw (deg)' },
    restYaw: { default: -19, min: -30, max: 30, label: 'Rest yaw (deg)' },
  },
  sfx: [{ t: 0.05, type: 'whoosh', dur: 1.0, gain: 0.45 }, { t: 1.9, type: 'tick', gain: 0.35 }],
  prompt: `Render a phone face (screen plus bezel, 84% of frame height in 16:9) to an offscreen canvas and project it onto the frame through a 10x20 grid of affine triangles using a perspective camera (distance 1.6x the long side). Give it depth by filling 10 projected outline slices behind the face from z = +2.6% of the phone height, lit along the edge. Yaw goes from 68 deg (and 30% of frame width to the right) to -19 deg over 1800 ms with cubic-bezier(0.3,0,0,1), with 5 deg of pitch, then drifts 7 deg over the rest with inOutSine. A glass sheen gradient slides with the yaw. The app screen builds from 600 ms: header, progress card (bar fills 0 to 72% over 1200 ms, outQuint), four feature rows (outQuint, 70 ms stagger) and a tab bar; text fades in once yaw is under 22 deg. Soft floor shadow on light, accent glow on dark.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const DUR = p.duration ?? meta.duration;
  const feats = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs', 'Approvals']).slice(0, 4);
  const icons = ['layers', 'rocket', 'file', 'users'];
  const screenBg = dark ? C.mix(c.bg, c.fg, 0.035) : '#ffffff';
  const surf = dark ? C.mix(c.bg, c.fg, 0.085) : C.mix('#ffffff', c.fg, 0.04);
  const skel = C.alpha(c.fg, dark ? 0.14 : 0.09);
  const line = C.alpha(c.fg, dark ? 0.1 : 0.09);
  const bodyCol = dark ? '#16181d' : '#1d1f25';

  const H = Math.min(k.pick({ wide: 910, square: 1020, tall: 1340 }) * U, k.H * 0.84);
  const W = H * 0.49, R = H * 0.12, bez = H * 0.018;
  const px0 = k.cx - W / 2, py0 = k.cy - H / 2;
  const scr = { x: px0 + bez, y: py0 + bez, w: W - bez * 2, h: H - bez * 2, r: R - bez };
  const BW = 430;
  const sc = scr.w / (BW * U);
  const BH = scr.h / sc / U;

  // outline polygon of the phone (rounded rect), in frame coords
  const outline = [];
  for (let q = 0; q < 4; q++) {
    const cx0 = q === 0 || q === 3 ? px0 + W - R : px0 + R;
    const cy0 = q < 2 ? py0 + H - R : py0 + R;
    const a0 = [0, 0.5, 1, 1.5][q] * Math.PI;
    for (let i = 0; i <= 8; i++) { const a = a0 + (i / 8) * Math.PI / 2; outline.push([cx0 + Math.cos(a) * R, cy0 + Math.sin(a) * R]); }
  }

  function drawScreen(g, t, txtA) {
    k.draw.rrect(g, px0, py0, W, H, R, bodyCol);
    k.draw.rrect(g, px0 + 1, py0 + 1, W - 2, H - 2, R, null, 'rgba(255,255,255,0.14)', 1.2);
    g.save();
    k.draw.rrectPath(g, scr.x, scr.y, scr.w, scr.h, scr.r); g.clip();
    g.fillStyle = screenBg; g.fillRect(scr.x, scr.y, scr.w, scr.h);
    g.translate(scr.x, scr.y); g.scale(sc, sc);
    const X = (v) => v * U, Y = (v) => v * U;
    const PAD = 26, IW = BW - PAD * 2;
    const blk = (i) => ease.outQuint(m.seg(t, 0.35 + i * 0.08, 0.8));
    if (dark) k.draw.glow(g, X(BW * 0.8), Y(160), 260 * U, c.accent, 0.22);
    // status bar
    k.draw.rrect(g, X(PAD + 6), Y(26), 44 * U, 12 * U, 6 * U, C.alpha(c.fg, 0.7));
    k.draw.rrect(g, X(BW - PAD - 34), Y(25), 30 * U, 14 * U, 4 * U, null, C.alpha(c.fg, 0.6), 1.4);
    k.draw.rrect(g, X(BW - PAD - 32), Y(27), 22 * U, 10 * U, 2.5 * U, C.alpha(c.fg, 0.7));
    // header
    let a = blk(0);
    g.save(); g.globalAlpha *= a; g.translate(0, (1 - a) * 16 * U);
    k.text.draw(g, 'Today', X(PAD), Y(118), { role: 'display', size: 44, weight: 660, tracking: -0.035, alpha: txtA });
    k.draw.circle(g, X(BW - PAD - 24), Y(104), 24 * U, C.mix(c.accent, c.accent2 || c.accent, 0.5));
    k.logo.draw(g, X(BW - PAD - 24), Y(104), 24 * U, { color: '#ffffff' });
    g.restore();
    // progress card
    a = blk(1);
    g.save(); g.globalAlpha *= a; g.translate(0, (1 - a) * 24 * U);
    const cy0 = 160, ch = 210;
    const grd = g.createLinearGradient(X(PAD), Y(cy0), X(PAD + IW), Y(cy0 + ch));
    grd.addColorStop(0, C.shade(c.accent, -0.14)); grd.addColorStop(1, C.shade(C.mix(c.accent, c.accent2 || c.accent, 0.5), -0.16));
    k.draw.rrect(g, X(PAD), Y(cy0), IW * U, ch * U, 26 * U, grd);
    const onA = '#ffffff';
    const chipL = k.text.layout('On track', { role: 'text', size: 22, weight: 600 });
    k.draw.rrect(g, X(PAD + 22), Y(cy0 + 22), chipL.width + 30 * U, 38 * U, 19 * U, 'rgba(0,0,0,0.24)');
    k.draw.circle(g, X(PAD + 36), Y(cy0 + 41), 5 * U, '#ffffff');
    k.text.draw(g, 'On track', X(PAD + 48), Y(cy0 + 41), { role: 'text', size: 22, weight: 600, color: onA, baseline: 'xmiddle', alpha: txtA });
    k.text.draw(g, 'Spring launch', X(PAD + 24), Y(cy0 + 112), { role: 'display', size: 34, weight: 650, tracking: -0.025, color: onA, alpha: txtA });
    for (let i = 0; i < 3; i++) k.draw.circle(g, X(PAD + IW - 40 - i * 24), Y(cy0 + 41), 15 * U, ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.45)'][i]);
    const prog = 0.72 * ease.outQuint(m.seg(t, 0.9, 1.2));
    k.draw.rrect(g, X(PAD + 26), Y(cy0 + ch - 58), (IW - 52) * U, 14 * U, 7 * U, 'rgba(255,255,255,0.25)');
    if (prog > 0.01) k.draw.rrect(g, X(PAD + 26), Y(cy0 + ch - 58), (IW - 52) * U * prog, 14 * U, 7 * U, '#ffffff');
    g.restore();
    // rows
    const ry0 = 400;
    feats.forEach((f, i) => {
      const ra = blk(2 + i * 0.85);
      const ry = ry0 + i * 84;
      g.save(); g.globalAlpha *= ra; g.translate((1 - ra) * 30 * U, 0);
      k.draw.rrect(g, X(PAD), Y(ry), IW * U, 72 * U, 20 * U, surf);
      k.draw.rrect(g, X(PAD + 12), Y(ry + 12), 48 * U, 48 * U, 14 * U, C.alpha(c.accent, dark ? 0.2 : 0.12));
      k.draw.icon(g, icons[i], X(PAD + 36), Y(ry + 36), 28 * U, c.accent, { stroke: 1.9 });
      const fs = k.text.fit(f, { role: 'text', size: 25, weight: 560 }, (IW - 120) * U, 22);
      k.text.draw(g, f, X(PAD + 76), Y(ry + 36), { role: 'text', size: fs, weight: 560, baseline: 'xmiddle', alpha: txtA });
      k.draw.icon(g, 'chevron-right', X(PAD + IW - 24), Y(ry + 36), 22 * U, c.muted);
      g.restore();
    });
    // tab bar
    a = blk(6);
    g.save(); g.globalAlpha *= a;
    const tb = BH - 96;
    g.fillStyle = C.alpha(screenBg, 0.96); g.fillRect(0, Y(tb), X(BW), Y(96));
    g.fillStyle = line; g.fillRect(0, Y(tb), X(BW), Math.max(1, U));
    ['home', 'chart-bar', 'bell', 'user'].forEach((ic, i) => {
      const ix = X(PAD + 30 + i * ((IW - 60) / 3));
      k.draw.icon(g, ic, ix, Y(tb + 38), 30 * U, i === 0 ? c.accent : c.muted, { stroke: 1.9 });
      if (i === 0) k.draw.rrect(g, ix - 10 * U, Y(tb + 64), 20 * U, 5 * U, 2.5 * U, c.accent);
    });
    k.draw.rrect(g, X(BW / 2 - 70), Y(BH - 18), 140 * U, 6 * U, 3 * U, C.alpha(c.fg, 0.5));
    g.restore();
    g.restore();
    // island
    k.draw.rrect(g, k.cx - W * 0.16, scr.y + H * 0.018, W * 0.32, H * 0.03, H * 0.015, '#000000');
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
      S.push([sx, sy]); D.push(proj(sx, sy, 0));
    }
    const id = (i, j) => j * (nx + 1) + i;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = id(i, j), b = id(i + 1, j), cI = id(i, j + 1), d = id(i + 1, j + 1);
      tri(g, src, S[a], S[b], S[d], D[a], D[b], D[d]);
      tri(g, src, S[a], S[d], S[cI], D[a], D[d], D[cI]);
    }
  }
  const layer = k.layer('ui.phone-orbit');
  const lg = k.ctx(layer);
  const depth = H * 0.026;

  return {
    draw(g, t) {
      const T = m.seg(t, 0, 1.8);
      const sw = ease.emphasized(T);
      const drift = ease.inOutSine(m.seg(t, 1.8, DUR - 1.8));
      const yawDeg = m.lerp(p.startYaw, p.restYaw, sw) + 7 * drift;
      const yaw = yawDeg * Math.PI / 180;
      const pitch = (5 - 2 * drift) * Math.PI / 180;
      const xOff = (1 - sw) * k.W * 0.3;
      const Dc = Math.max(k.W, k.H) * 1.6;
      const proj = (x, y, z) => {
        let q = [x - k.cx, y - k.cy, z];
        q = m.rotY(q, yaw); q = m.rotX(q, pitch);
        const s = Dc / (Dc + q[2]);
        return [k.cx + xOff + q[0] * s, k.cy + q[1] * s];
      };
      const txtA = (1 - ease.inOutCubic(m.seg(Math.abs(yawDeg), 22, 8))) * ease.outCubic(m.seg(t, 0.9, 0.4));
      const enter = ease.outCubic(m.seg(t, 0, 0.35));
      g.save();
      g.globalAlpha *= enter;
      // floor shadow / glow
      if (dark) k.draw.glow(g, k.cx + xOff, k.cy, H * 0.7, c.accent, 0.18 * sw);
      const back = outline.map(([x, y]) => proj(x, y, depth));
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.7)' : 'rgba(20,30,60,0.28)';
      g.shadowBlur = 70 * U; g.shadowOffsetY = 40 * U; g.shadowOffsetX = -Math.sin(yaw) * 40 * U;
      g.beginPath(); back.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = bodyCol; g.fill();
      g.restore();
      // slab slices (edge)
      for (let s = 10; s >= 1; s--) {
        const z = (depth * s) / 10;
        const pts = outline.map(([x, y]) => proj(x, y, z));
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
        const lit = 0.5 + 0.5 * Math.sin(yaw);
        g.fillStyle = C.mix('#2a2d35', '#8c919c', (s / 10) * 0.35 * (0.4 + 0.6 * Math.abs(Math.sin(yaw))) * lit + 0.05);
        g.fill();
      }
      // face
      lg.setTransform(1, 0, 0, 1, 0, 0);
      lg.clearRect(0, 0, k.W, k.H);
      drawScreen(lg, t, txtA);
      warp(g, layer, { x: px0, y: py0, w: W, h: H }, proj, 10, 20);
      // glass sheen
      const front = outline.map(([x, y]) => proj(x, y, 0));
      g.save();
      g.beginPath(); front.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
      const sx = k.cx + xOff - Math.sin(yaw) * W * 1.6;
      const sg = g.createLinearGradient(sx - W, k.cy - H / 2, sx + W, k.cy + H / 2);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.48, `rgba(255,255,255,${dark ? 0.05 : 0.08})`);
      sg.addColorStop(0.52, `rgba(255,255,255,${dark ? 0.07 : 0.1})`);
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg; g.fillRect(0, 0, k.W, k.H);
      g.restore();
      // rim light on the face edge
      const rim = g.createLinearGradient(front[0][0] - W, k.cy - H / 2, front[0][0] + W, k.cy + H / 2);
      rim.addColorStop(0, `rgba(255,255,255,${dark ? 0.32 : 0.4})`); rim.addColorStop(1, 'rgba(255,255,255,0.06)');
      g.beginPath(); front.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.strokeStyle = rim; g.lineWidth = 1.6 * U; g.stroke();
      g.restore();
    },
  };
}
