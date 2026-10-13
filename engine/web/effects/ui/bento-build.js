// A bento grid assembles: a hero tile with the mark and headline, a stat tile and
// four feature tiles spring in one after another (scale + rise), then their icons
// draw on, labels settle and each tile's small illustration animates. Ends held on
// the finished grid.
export const meta = {
  id: 'ui.bento-build',
  name: 'Bento Build',
  category: 'ui',
  duration: 4.8,
  summary: 'Six bento tiles (hero, stat, four features) spring in with a stepped stagger, icons draw on and labels settle; holds on the complete grid.',
  bestFor: ['feature overview', 'what is new', 'product summary'],
  slots: ['headline', 'features', 'stats'],
  params: {
    stagger: { default: 0.08, min: 0.04, max: 0.15, label: 'Tile stagger (s)' },
  },
  sfx: [{ t: 0.1, type: 'pop', gain: 0.35 }, { t: 0.26, type: 'pop', gain: 0.3 }, { t: 0.42, type: 'pop', gain: 0.3 }, { t: 0.58, type: 'pop', gain: 0.3 }],
  prompt: `Lay out a bento grid filling 92% of the title-safe area with 20 px gutters and 28 px radius tiles: in 16:9 a 4x3 grid (2x2 hero, 1x2 tall feature, 3x1 wide feature, a stat tile and two small features); in portrait 2 columns x 4 rows with a full-width hero. The hero tile is an accent gradient with the mark and the headline at 52 px; other tiles are surface cards with a hairline. Tiles enter in reading order 80 ms apart with a spring (stiffness 220, damping 18): scale 0.86 to 1 and a 30 px rise, opacity over 200 ms. 250 ms after each tile lands its icon strokes on (500 ms, outCubic), the label fades up 10 px, and a small illustration animates (checklist ticks, timeline fill, bars). Hold the finished grid.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs', 'Approvals']).slice(0, 4);
  while (feats.length < 4) feats.push('More to come');
  const st = (k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'teams' }])[0];
  const statStr = st.value.toLocaleString('en-US', { minimumFractionDigits: st.decimals || 0, maximumFractionDigits: st.decimals || 0 }) + (st.suffix || '');
  const headline = k.copy('headline', 'Everything for launch day.');
  const icons = ['layers', 'rocket', 'file', 'users'];
  const card = dark ? C.mix(c.bg, c.fg, 0.07) : '#ffffff';
  const line = C.alpha(c.fg, dark ? 0.1 : 0.08);
  const skel = C.alpha(c.fg, dark ? 0.14 : 0.09);
  const tint = C.alpha(c.accent, dark ? 0.18 : 0.1);
  const ok = dark ? (c.accent3 || c.accent) : C.shade(c.accent3 || c.accent, -0.1);
  const heroA = C.shade(c.accent, dark ? -0.06 : 0), heroB = C.shade(C.mix(c.accent, c.accent2 || c.accent, 0.45), dark ? -0.1 : -0.04);

  // grid
  const wide = k.isWide;
  const area = { w: k.safe.w * (wide ? 0.94 : 1), h: k.safe.h * (wide ? 0.92 : 0.9) };
  area.x = k.cx - area.w / 2; area.y = k.cy - area.h / 2;
  const gap = 20 * U;
  const cols = wide ? 4 : 2, rows = wide ? 3 : 4;
  const cw = (area.w - gap * (cols - 1)) / cols, rh = (area.h - gap * (rows - 1)) / rows;
  const cell = (c0, r0, cs, rs) => ({ x: area.x + c0 * (cw + gap), y: area.y + r0 * (rh + gap), w: cs * cw + (cs - 1) * gap, h: rs * rh + (rs - 1) * gap });
  const tiles = wide ? [
    { kind: 'hero', ...cell(0, 0, 2, 2) },
    { kind: 'feat', f: 0, vis: 'dots', ...cell(2, 0, 1, 1) },
    { kind: 'feat', f: 1, vis: 'list', ...cell(3, 0, 1, 2) },
    { kind: 'stat', ...cell(2, 1, 1, 1) },
    { kind: 'feat', f: 2, vis: 'bars', ...cell(0, 2, 1, 1) },
    { kind: 'feat', f: 3, vis: 'timeline', ...cell(1, 2, 3, 1) },
  ] : [
    { kind: 'hero', ...cell(0, 0, 2, 1) },
    { kind: 'feat', f: 0, vis: 'dots', ...cell(0, 1, 1, 1) },
    { kind: 'feat', f: 1, vis: 'list', ...cell(1, 1, 1, 2) },
    { kind: 'stat', ...cell(0, 2, 1, 1) },
    { kind: 'feat', f: 2, vis: 'bars', ...cell(0, 3, 1, 1) },
    { kind: 'feat', f: 3, vis: 'timeline', ...cell(1, 3, 1, 1) },
  ];
  const hl = { role: 'display', size: k.pick({ wide: 72, square: 60, tall: 72 }), weight: 650, tracking: -0.035 };
  const heroT = tiles[0];
  const hMax = heroT.w - (wide ? 100 : 200) * U;
  let hLines = k.text.balance(headline, hl, hMax);
  while ((hLines.length > 3 || hLines.length * hl.size * 1.08 * U > heroT.h - 90 * U) && hl.size > 36) { hl.size *= 0.92; hLines = k.text.balance(headline, hl, hMax); }
  const R = 28 * U;
  const ip = k.pick({ wide: 34, square: 26, tall: 30 }) * U;

  function body(g, tl, t, t0) {
    const { x, y, w, h } = tl;
    const inner = (d) => m.seg(t, t0 + 0.25 + d, 0.5);
    if (tl.kind === 'hero') {
      const grd = g.createLinearGradient(x, y, x + w, y + h);
      grd.addColorStop(0, heroA); grd.addColorStop(1, heroB);
      k.draw.rrect(g, x, y, w, h, R, grd);
      // soft light inside
      g.save(); k.draw.rrectPath(g, x, y, w, h, R); g.clip();
      k.draw.glow(g, x + w * 0.85, y + h * 0.1, w * 0.6, '#ffffff', 0.18);
      g.restore();
      const a = ease.outCubic(inner(0));
      const markH = k.pick({ wide: 84, square: 64, tall: 70 }) * U;
      const mx = wide ? x + ip + markH * k.logo.aspect / 2 : x + w - ip - markH * k.logo.aspect / 2;
      k.logo.draw(g, mx, y + ip + markH / 2, markH, { color: '#ffffff', alpha: a });
      const lh = hl.size * 1.08 * U;
      const by = y + h - ip - (hLines.length - 1) * lh;
      hLines.forEach((ln, i) => {
        const la = ease.outCubic(m.seg(t, t0 + 0.3 + i * 0.07, 0.5));
        k.text.draw(g, ln, x + ip, by + i * lh + (1 - la) * 12 * U, { ...hl, color: '#ffffff', alpha: la });
      });
      return;
    }
    k.draw.rrect(g, x, y, w, h, R, card);
    k.draw.rrect(g, x, y, w, h, R, null, line, 1);
    if (tl.kind === 'stat') {
      const a = ease.outCubic(inner(0));
      const vs = k.text.fit(statStr, { role: 'display', size: k.pick({ wide: 76, square: 60, tall: 66 }), weight: 650 }, w - ip * 2);
      k.text.draw(g, statStr, x + ip, y + h - ip - 44 * U + (1 - a) * 10 * U, { role: 'display', size: vs, weight: 650, tracking: -0.04, color: c.accent, alpha: a });
      k.text.draw(g, st.label, x + ip, y + h - ip, { role: 'text', size: 26, weight: 480, color: c.muted, alpha: a });
      k.draw.icon(g, 'chart-line', x + ip + 20 * U, y + ip + 20 * U, 40 * U, c.accent, { p: ease.outCubic(inner(0)), stroke: 1.8 });
      return;
    }
    // feature
    const ic = 64 * U;
    const ia = ease.outCubic(inner(0));
    g.save(); g.globalAlpha *= Math.min(1, ia * 2);
    k.draw.rrect(g, x + ip, y + ip, ic, ic, 18 * U, tint);
    g.restore();
    k.draw.icon(g, icons[tl.f], x + ip + ic / 2, y + ip + ic / 2, 36 * U, c.accent, { p: ia, stroke: 1.9 });
    const la = ease.outCubic(inner(0.12));
    const ls = k.text.fit(feats[tl.f], { role: 'text', size: k.pick({ wide: 32, square: 28, tall: 30 }), weight: 600 }, w - ip * 2, 22);
    k.text.draw(g, feats[tl.f], x + ip, y + h - ip + (1 - la) * 10 * U, { role: 'text', size: ls, weight: 600, tracking: -0.01, alpha: la });
    // illustration region (right / middle)
    const vp = inner(0.2);
    if (tl.vis === 'dots') {
      const n = 5;
      for (let i = 0; i < n; i++) {
        const dp = ease.outBack(m.seg(vp, i * 0.12, 0.5));
        const dx = x + w - ip - 18 * U - i * 30 * U;
        k.draw.circle(g, dx, y + ip + 32 * U, 18 * U * dp, C.mix([c.accent, c.accent2 || c.accent, c.accent3 || c.accent, c.accent, c.fg][i], card, 0.25 + i * 0.1), card, 3);
      }
    } else if (tl.vis === 'list') {
      const top = y + ip + ic + 30 * U, avail = h - ip * 2 - ic - 30 * U - 60 * U;
      const n = Math.max(2, Math.min(4, Math.floor(avail / (62 * U))));
      for (let i = 0; i < n; i++) {
        const ry = top + i * 62 * U;
        const ra = ease.outQuint(m.seg(vp, i * 0.15, 0.5));
        g.save(); g.globalAlpha *= ra; g.translate((1 - ra) * 16 * U, 0);
        k.draw.rrect(g, x + ip, ry, w - ip * 2, 48 * U, 14 * U, C.alpha(c.fg, dark ? 0.05 : 0.035));
        const done = m.seg(t, t0 + 0.9 + i * 0.18, 0.3);
        k.draw.circle(g, x + ip + 24 * U, ry + 24 * U, 11 * U, done > 0 ? C.alpha(ok, 0.2 + 0.8 * done) : null, done > 0 ? null : skel, 2);
        if (done > 0) k.draw.icon(g, 'check', x + ip + 24 * U, ry + 24 * U, 16 * U, C.onColor(ok), { p: done, stroke: 3 });
        k.draw.rrect(g, x + ip + 48 * U, ry + 18 * U, (w - ip * 2 - 70 * U) * [0.8, 0.6, 0.7, 0.5][i], 12 * U, 6 * U, skel);
        g.restore();
      }
    } else if (tl.vis === 'bars') {
      const bw = 16 * U, gapb = 10 * U, n = 5, bx = x + w - ip - n * bw - (n - 1) * gapb;
      [0.4, 0.65, 0.5, 0.8, 1].forEach((q, i) => {
        const gr = ease.outQuint(m.seg(vp, i * 0.1, 0.6));
        const bh = q * 70 * U * gr;
        k.draw.rrect(g, bx + i * (bw + gapb), y + ip + 76 * U - bh, bw, bh, 5 * U, i === n - 1 ? c.accent : C.alpha(c.fg, dark ? 0.18 : 0.12));
      });
    } else if (tl.vis === 'timeline') {
      const lx = wide ? x + w * 0.42 : x + ip, lw = wide ? w * 0.58 - ip : w - ip * 2;
      const ly = wide ? y + h / 2 : y + ip + ic + 40 * U;
      const fp = ease.inOutCubic(m.seg(vp, 0, 1));
      k.draw.rrect(g, lx, ly - 4 * U, lw, 8 * U, 4 * U, C.alpha(c.fg, dark ? 0.1 : 0.07));
      k.draw.rrect(g, lx, ly - 4 * U, lw * 0.72 * fp, 8 * U, 4 * U, c.accent);
      const nd = 4;
      for (let i = 0; i < nd; i++) {
        const f = i / (nd - 1);
        const on = f <= 0.72 * fp + 0.001;
        k.draw.circle(g, lx + lw * f, ly, 12 * U, on ? c.accent : card, on ? null : C.alpha(c.fg, 0.25), 2);
        if (on && dark && i === Math.floor(0.72 * fp * (nd - 1) + 0.001)) k.draw.glow(g, lx + lw * f, ly, 34 * U, c.accent, 0.5);
      }
    }
  }

  return {
    draw(g, t) {
      tiles.forEach((tl, i) => {
        const t0 = 0.08 + i * p.stagger * 2;
        if (t < t0) return;
        const sp = ease.spring(t - t0, { stiffness: 220, damping: 18 });
        const a = ease.outCubic(m.seg(t, t0, 0.2));
        const s = 0.86 + 0.14 * sp;
        const cx = tl.x + tl.w / 2, cy = tl.y + tl.h / 2;
        g.save();
        g.globalAlpha *= a;
        g.translate(cx, cy + (1 - sp) * 30 * U); g.scale(s, s); g.translate(-cx, -cy);
        g.save();
        if (dark) { g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 40 * U; g.shadowOffsetY = 16 * U; }
        else { g.shadowColor = 'rgba(20,30,60,0.10)'; g.shadowBlur = 36 * U; g.shadowOffsetY = 12 * U; }
        k.draw.rrect(g, tl.x, tl.y, tl.w, tl.h, R, tl.kind === 'hero' ? heroA : card);
        g.restore();
        body(g, tl, t, t0);
        g.restore();
      });
    },
  };
}
