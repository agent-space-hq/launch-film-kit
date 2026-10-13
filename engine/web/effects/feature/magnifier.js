// A dense release table sits at a size where its rows read only as texture. A glass
// loupe glides over it and dwells on three rows; inside the lens the table is redrawn
// at 2.2x in full detail, so feature names, owners and status chips become readable.
// Ends held with the lens resting on the third row.
export const meta = {
  id: 'feature.magnifier',
  name: 'Magnifier',
  category: 'feature',
  duration: 5.6,
  summary: 'A circular glass lens glides over dense UI and reveals 2.2x magnified, readable detail inside it at three stops; holds on the last stop.',
  bestFor: ['detail shot', 'power features', 'under the hood'],
  slots: ['features'],
  params: {
    zoom: { default: 2.2, min: 1.6, max: 3, label: 'Magnification' },
  },
  sfx: [{ t: 0.3, type: 'swell', dur: 0.5, gain: 0.3 }, { t: 1.9, type: 'whoosh', dur: 0.6, gain: 0.25 }, { t: 3.5, type: 'whoosh', dur: 0.6, gain: 0.25 }],
  prompt: `Fill a window at 80% of the frame with a dense release table (16 rows, 46 px tall) drawn only as skeleton bars, dots and chips. Write a second draw path for the same table that renders real labels (row names, status chips, initials) at 11 px. Draw a 250 px radius lens: clip a circle, translate to the lens centre, scale by 2.2 and draw the detailed path, so the labels read at about 24 px. Add a soft drop shadow, an inner edge darkening (radial gradient), a 2 px rim brighter at the top left and a crescent glare. The lens scales in from 70% at 300 ms (outBack, 500 ms), dwells on a row naming the first feature, then glides to the second and third feature rows at 1.9 s and 3.5 s over 800 ms (inOutCubic) with a slight trailing tilt of the glare. Hold on the last row.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs']).slice(0, 3);
  while (feats.length < 3) feats.push('Release notes');
  const P = {
    win: dark ? C.mix(c.bg, c.fg, 0.05) : '#ffffff',
    line: C.alpha(c.fg, dark ? 0.08 : 0.08),
    skel: C.alpha(c.fg, dark ? 0.16 : 0.1),
    skel2: C.alpha(c.fg, dark ? 0.09 : 0.06),
  };
  const others = ['Billing page polish', 'Docs refresh', 'Onboarding flow', 'Search speedups', 'Mobile settings', 'Export to PDF', 'Dark theme pass', 'Usage alerts', 'Audit history', 'Invite links', 'Keyboard shortcuts', 'Status page', 'Webhooks v2'];
  const statuses = [
    { label: 'Shipped', col: c.accent3 || c.accent },
    { label: 'In review', col: c.accent },
    { label: 'Planned', col: c.muted },
  ];
  const wide = k.isWide;
  const winW = Math.min(k.W * (wide ? 0.86 : 0.8), k.pick({ wide: 1500, square: 980, tall: 980 }) * U);
  const winH = Math.min(k.H * 0.82, k.pick({ wide: 880, square: 1100, tall: 1460 }) * U);
  const winX = k.cx - winW / 2, winY = k.cy - winH / 2;
  const bar = 50 * U, pad = 36 * U;
  const tx = winX + pad, tw = winW - pad * 2, ty = winY + bar + 96 * U;
  const rh = 46 * U;
  const nRows = Math.floor((winY + winH - pad - ty) / rh);
  const featRows = [2, Math.min(nRows - 4, 6), Math.min(nRows - 2, wide ? 11 : 13)];
  const rows = [];
  let oi = 0;
  for (let i = 0; i < nRows; i++) {
    const fi = featRows.indexOf(i);
    rows.push({
      name: fi >= 0 ? feats[fi] : others[oi++ % others.length],
      st: fi >= 0 ? 0 : [1, 2, 0, 2, 1][i % 5],
      owner: 'ABCDEFGHJKLMNPRSTW'[(i * 7) % 18] + 'ABCDEFGHJKLMNPRSTW'[(i * 5 + 3) % 18],
      prog: fi >= 0 ? 1 : 0.2 + m.hash(i, 4) * 0.7,
      feat: fi >= 0,
    });
  }
  // columns (fractions of tw)
  // left cluster in absolute px so the lens window (2r / zoom wide) shows dot, name, chip and owner together
  const col = { dot: 10 * U, name: 30 * U, chip: 150 * U, owner: 248 * U, prog: tw * (wide ? 0.5 : 0.56), date: wide ? tw * 0.84 : null };
  const Z = p.zoom;
  const fsName = 12, fsSmall = 10.5;

  function table(g, detail, vis = () => true) {
    // header row
    const hy = ty - 40 * U;
    const heads = [['Item', col.name], ['Owner', col.owner], ['Status', col.chip]];
    if (col.prog) heads.push(['Progress', col.prog]);
    if (col.date) heads.push(['Due', col.date]);
    heads.forEach(([h, f]) => {
      if (detail && vis(tx + f + 30 * U, hy)) k.text.draw(g, h, tx + f, hy, { role: 'text', size: fsSmall, weight: 600, color: c.muted, baseline: 'xmiddle' });
      else k.draw.rrect(g, tx + f, hy - 5 * U, 56 * U, 10 * U, 5 * U, P.skel2);
    });
    g.fillStyle = P.line; g.fillRect(tx, ty - 16 * U, tw, Math.max(1, U));
    rows.forEach((r, i) => {
      const y = ty + i * rh, cy = y + rh / 2;
      if (r.feat && detail) k.draw.rrect(g, tx - 8 * U, y + 4 * U, tw + 16 * U, rh - 8 * U, 10 * U, C.alpha(c.accent, dark ? 0.1 : 0.06));
      const s = statuses[r.st];
      k.draw.circle(g, tx + col.dot, cy, 5 * U, s.col);
      if (detail && vis(tx + col.name + 60 * U, cy)) k.text.draw(g, r.name, tx + col.name, cy, { role: 'text', size: fsName, weight: r.feat ? 600 : 480, baseline: 'xmiddle', qaGroup: 'row' + i });
      else k.draw.rrect(g, tx + col.name, cy - 5 * U, Math.min(140 * U, k.text.layout(r.name, { role: 'text', size: fsName, weight: 500 }).width), 10 * U, 5 * U, r.feat ? C.alpha(c.fg, dark ? 0.26 : 0.18) : P.skel);
      // owner avatar
      const ax = tx + col.owner + 13 * U;
      k.draw.circle(g, ax, cy, 13 * U, C.mix([c.accent, c.accent2 || c.accent, c.accent3 || c.accent][i % 3], P.win, dark ? 0.35 : 0.25));
      if (detail && vis(ax, cy)) k.text.draw(g, r.owner, ax, cy, { role: 'text', size: 9.5, weight: 650, color: dark ? '#ffffff' : '#0b0b0c', align: 'center', baseline: 'middle', qaGroup: 'own' + i });
      // status chip
      const cx0 = tx + col.chip;
      const cw = (detail ? k.text.layout(s.label, { role: 'text', size: fsSmall, weight: 600 }).width + 28 * U : 76 * U);
      k.draw.rrect(g, cx0, cy - 12 * U, cw, 24 * U, 12 * U, C.alpha(s.col, dark ? 0.2 : 0.13));
      if (detail && vis(cx0 + cw / 2, cy)) {
        k.draw.circle(g, cx0 + 11 * U, cy, 3 * U, s.col);
        k.text.draw(g, s.label, cx0 + 18 * U, cy, { role: 'text', size: fsSmall, weight: 600, color: dark ? C.mix(s.col, '#ffffff', 0.35) : C.shade(s.col, -0.12), baseline: 'xmiddle', qaGroup: 'chip' + i });
      }
      const dw = col.prog - 310 * U - 40 * U;
      if (dw > 40 * U) k.draw.rrect(g, tx + 310 * U, cy - 4 * U, dw * (0.45 + m.hash(i, 8) * 0.5), 8 * U, 4 * U, P.skel2);
      if (col.prog) {
        const pw = tw * (wide ? 0.2 : 0.3);
        k.draw.rrect(g, tx + col.prog, cy - 3 * U, pw, 6 * U, 3 * U, P.skel2);
        k.draw.rrect(g, tx + col.prog, cy - 3 * U, pw * r.prog, 6 * U, 3 * U, r.feat ? c.accent : C.alpha(c.fg, dark ? 0.3 : 0.22));
      }
      if (col.date) k.draw.rrect(g, tx + col.date, cy - 4 * U, 60 * U, 8 * U, 4 * U, P.skel2);
      if (i < rows.length - 1) { g.fillStyle = P.line; g.fillRect(tx, y + rh, tw, Math.max(1, U)); }
    });
  }

  const R = k.pick({ wide: 250, square: 228, tall: 228 }) * U;
  const stopsPt = featRows.map((ri) => {
    const cy = ty + ri * rh + rh / 2;
    const cx = tx + 124 * U;
    return [cx, cy];
  });
  const moves = [1.9, 3.5];

  return {
    draw(g, t) {
      const enter = ease.outQuint(m.seg(t, 0, 0.6));
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.4);
      g.translate(0, (1 - enter) * 30 * U);
      k.draw.browser(g, winX, winY, winW, winH, { fill: P.win, bar: 50, url: '', dark });
      // page title skeleton
      k.draw.rrect(g, tx, winY + bar + 30 * U, 260 * U, 22 * U, 11 * U, C.alpha(c.fg, dark ? 0.24 : 0.16));
      k.draw.rrect(g, winX + winW - pad - 150 * U, winY + bar + 22 * U, 150 * U, 40 * U, 20 * U, c.accent);
      table(g, false);
      g.restore();
      // lens position
      let [lx, ly] = stopsPt[0];
      let vx = 0;
      moves.forEach((mt, i) => {
        if (t >= mt) {
          const e = ease.inOutCubic(m.seg(t, mt, 0.8));
          lx = m.lerp(stopsPt[i][0], stopsPt[i + 1][0], e);
          ly = m.lerp(stopsPt[i][1], stopsPt[i + 1][1], e);
          const e2 = ease.inOutCubic(m.seg(t + 0.02, mt, 0.8));
          vx = (m.lerp(stopsPt[i][1], stopsPt[i + 1][1], e2) - ly) / (0.02 * U);
        }
      });
      const pop = ease.outBack(m.seg(t, 0.3, 0.5));
      const la = ease.outCubic(m.seg(t, 0.3, 0.25));
      if (la <= 0) return;
      const r = R * (0.7 + 0.3 * pop);
      g.save();
      g.globalAlpha *= la;
      // drop shadow
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.7)' : 'rgba(20,30,60,0.3)';
      g.shadowBlur = 50 * U; g.shadowOffsetY = 24 * U;
      k.draw.circle(g, lx, ly, r, P.win);
      g.restore();
      // magnified content
      g.save();
      g.beginPath(); g.arc(lx, ly, r, 0, Math.PI * 2); g.clip();
      g.fillStyle = P.win; g.fillRect(lx - r, ly - r, r * 2, r * 2);
      g.translate(lx, ly); g.scale(Z, Z); g.translate(-lx, -ly + (1 - enter) * 30 * U);
      const ey = (1 - enter) * 30 * U;
      table(g, true, (x, y) => Math.hypot((x - lx) * Z, (y + ey - ly) * Z) < r + 30 * U);
      g.restore();
      // inner edge shading
      const ig = g.createRadialGradient(lx, ly, r * 0.72, lx, ly, r);
      ig.addColorStop(0, 'rgba(0,0,0,0)'); ig.addColorStop(1, dark ? 'rgba(0,0,0,0.45)' : 'rgba(20,30,60,0.14)');
      g.fillStyle = ig; g.beginPath(); g.arc(lx, ly, r, 0, Math.PI * 2); g.fill();
      // glare crescent
      const tilt = m.clamp(vx * 0.0006, -0.4, 0.4);
      g.save();
      g.beginPath(); g.arc(lx, ly, r * 0.94, Math.PI * 1.05 + tilt, Math.PI * 1.55 + tilt); g.arc(lx + r * 0.06, ly + r * 0.08, r * 0.9, Math.PI * 1.55 + tilt, Math.PI * 1.05 + tilt, true); g.closePath();
      g.fillStyle = `rgba(255,255,255,${dark ? 0.08 : 0.5})`; g.fill();
      g.restore();
      // rim
      const rim = g.createLinearGradient(lx - r, ly - r, lx + r, ly + r);
      rim.addColorStop(0, dark ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,1)');
      rim.addColorStop(0.5, dark ? 'rgba(255,255,255,0.18)' : 'rgba(200,205,215,0.9)');
      rim.addColorStop(1, dark ? 'rgba(255,255,255,0.4)' : 'rgba(150,155,165,0.9)');
      g.beginPath(); g.arc(lx, ly, r, 0, Math.PI * 2);
      g.strokeStyle = rim; g.lineWidth = 5 * U; g.stroke();
      g.beginPath(); g.arc(lx, ly, r + 2.5 * U, 0, Math.PI * 2);
      g.strokeStyle = C.alpha(c.accent, 0.5); g.lineWidth = 1.2 * U; g.stroke();
      g.restore();
    },
  };
}
