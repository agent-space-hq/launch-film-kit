// A compact app mock sits centre frame. One at a time, an anchor dot pops on a UI
// element, a hairline leader draws out of the mock to the margin and a numbered
// feature label settles at its end. Anchors keep a slow pulse. Ends held with all
// four callouts on screen.
export const meta = {
  id: 'feature.callout-lines',
  name: 'Callout Lines',
  category: 'feature',
  duration: 5.6,
  summary: 'Hairline leader lines draw one by one from pulsing anchor dots on a UI mock out to numbered feature labels; holds on the annotated mock.',
  bestFor: ['feature tour', 'annotated screenshot', 'anatomy of the product'],
  slots: ['features'],
  params: {
    interval: { default: 0.62, min: 0.35, max: 1.2, label: 'Time between callouts (s)' },
  },
  sfx: [{ t: 0.9, type: 'tick', gain: 0.5 }, { t: 1.52, type: 'tick', gain: 0.5 }, { t: 2.14, type: 'tick', gain: 0.5 }, { t: 2.76, type: 'tick', gain: 0.5 }],
  prompt: `Centre a surface card mock (41% of frame width in 16:9, 80% in portrait) containing a roadmap gantt, a changelog list, an approver avatar stack and a primary Ship button, all as shapes and skeleton bars. It rises 30 px and fades in over 700 ms (outQuint). From 900 ms, every 620 ms a callout plays: an accent anchor dot pops with outBack (300 ms), a 1.5 px hairline draws from it to the margin over 450 ms (outCubic), then a mono index ("01") and a 34 px feature label slide 14 px and fade in over 400 ms. Labels sit left and right of the mock in 16:9 and above and below it in portrait. Each anchor emits a soft ring every 1.6 s. Hold the full set to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs', 'Approvals']).slice(0, 4);
  while (feats.length < 4) feats.push('And more');
  const card = dark ? C.mix(c.bg, c.fg, 0.07) : '#ffffff';
  const line = C.alpha(c.fg, dark ? 0.1 : 0.09);
  const skel = C.alpha(c.fg, dark ? 0.14 : 0.09);
  const leader = C.alpha(c.fg, dark ? 0.55 : 0.45);
  const wide = k.isWide;

  const mw = Math.min(k.pick({ wide: 790, square: 860, tall: 900 }) * U, k.safe.w * (wide ? 0.5 : 0.94));
  const mh = mw * k.pick({ wide: 0.66, square: 0.7, tall: 0.86 });
  const mx = k.cx - mw / 2, my = k.cy - mh / 2;
  const ip = 30 * U;
  // mock regions
  const gantt = { x: mx + ip, y: my + 96 * U, w: mw * 0.56 - ip, h: mh - 96 * U - 110 * U };
  const log = { x: mx + mw * 0.6, y: my + 96 * U, w: mw * 0.4 - ip, h: gantt.h };
  const foot = { y: my + mh - 64 * U };
  const btn = { w: 172 * U, h: 56 * U };
  btn.x = mx + mw - ip - btn.w; btn.y = foot.y - btn.h / 2;
  const ganttRows = [[0.0, 0.42], [0.18, 0.62], [0.35, 0.86], [0.55, 1.0]];
  const ganttAccent = 2;
  const rowH = gantt.h / ganttRows.length;
  // anchors in feature order: roadmap -> gantt, releases -> ship button, changelogs -> log, approvals -> avatars
  const anchors = [
    { x: gantt.x + gantt.w * ((ganttRows[ganttAccent][0] + ganttRows[ganttAccent][1]) / 2), y: gantt.y + rowH * (ganttAccent + 0.5) },
    { x: btn.x + btn.w - 22 * U, y: btn.y + btn.h / 2 },
    { x: log.x + log.w * 0.12, y: log.y + 22 * U },
    { x: mx + ip + 52 * U, y: foot.y },
  ];
  // label placement
  const gapOut = k.pick({ wide: 90, square: 70, tall: 110 }) * U;
  const sides = wide ? ['left', 'right', 'right', 'left'] : ['up', 'down', 'up', 'down'];
  const labS = { role: 'text', size: k.pick({ wide: 34, square: 32, tall: 34 }), weight: 580, tracking: -0.01 };
  const idxS = { role: 'mono', size: 22, weight: 500 };
  const callouts = anchors.map((a, i) => {
    const side = sides[i];
    let lx, ly, align, ex, ey;
    let ny;
    if (side === 'left') { ex = mx - gapOut; ey = a.y; lx = ex - 22 * U; ly = a.y + 14 * U; ny = a.y - 26 * U; align = 'right'; }
    else if (side === 'right') { ex = mx + mw + gapOut; ey = a.y; lx = ex + 22 * U; ly = a.y + 14 * U; ny = a.y - 26 * U; align = 'left'; }
    else {
      const up = side === 'up';
      const col = a.x < k.cx ? -1 : 1;
      ex = a.x; ey = up ? my - gapOut : my + mh + gapOut;
      lx = k.cx + col * k.safe.w * 0.25; align = 'center';
      ly = up ? ey - 34 * U : ey + 72 * U; ny = up ? ey - 78 * U : ey + 30 * U;
    }
    return { a, side, ex, ey, lx, ly, ny, align };
  });
  // portrait: elbow to the label column
  const pathOf = (co) => {
    if (co.side === 'left' || co.side === 'right') return [[co.a.x, co.a.y], [co.ex, co.ey]];
    const up = co.side === 'up';
    const midY = co.ey;
    return [[co.a.x, co.a.y], [co.a.x, midY], [co.lx, midY]];
  };

  function mock(g, t) {
    g.save();
    g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.14)';
    g.shadowBlur = 60 * U; g.shadowOffsetY = 26 * U;
    k.draw.rrect(g, mx, my, mw, mh, 26 * U, card);
    g.restore();
    k.draw.rrect(g, mx, my, mw, mh, 26 * U, null, line, 1);
    // header
    k.logo.draw(g, mx + ip + 16 * U, my + 46 * U, 30 * U);
    k.draw.rrect(g, mx + ip + 46 * U, my + 39 * U, 170 * U, 14 * U, 7 * U, C.alpha(c.fg, dark ? 0.24 : 0.16));
    k.draw.rrect(g, mx + mw - ip - 110 * U, my + 30 * U, 110 * U, 32 * U, 16 * U, C.alpha(c.fg, dark ? 0.07 : 0.05));
    g.fillStyle = line; g.fillRect(mx, my + 80 * U, mw, Math.max(1, U));
    // gantt
    for (let i = 0; i <= 4; i++) { g.fillStyle = C.alpha(c.fg, 0.05); g.fillRect(gantt.x + (gantt.w * i) / 4, gantt.y, Math.max(1, U), gantt.h); }
    ganttRows.forEach(([a, b], i) => {
      const gr = ease.outQuint(m.seg(t, 0.35 + i * 0.07, 0.7));
      const by = gantt.y + rowH * i + rowH * 0.28, bh = rowH * 0.44;
      const bx = gantt.x + gantt.w * a, bw = gantt.w * (b - a) * gr;
      k.draw.rrect(g, bx, by, Math.max(bh, bw), bh, bh / 2, i === ganttAccent ? c.accent : C.alpha(c.fg, dark ? 0.16 : 0.1));
    });
    // changelog
    for (let i = 0; i < 4; i++) {
      const ly = log.y + 10 * U + i * (log.h / 4);
      k.draw.rrect(g, log.x, ly, 54 * U, 24 * U, 12 * U, i === 0 ? C.alpha(c.accent3 || c.accent, dark ? 0.3 : 0.2) : C.alpha(c.fg, dark ? 0.08 : 0.06));
      k.draw.rrect(g, log.x + 66 * U, ly + 6 * U, log.w * [0.62, 0.5, 0.56, 0.4][i], 12 * U, 6 * U, skel);
      k.draw.rrect(g, log.x, ly + 38 * U, log.w * [0.9, 0.75, 0.85, 0.6][i], 10 * U, 5 * U, C.alpha(c.fg, dark ? 0.07 : 0.05));
    }
    g.fillStyle = line; g.fillRect(mx, foot.y - 44 * U, mw, Math.max(1, U));
    // approvers
    for (let i = 0; i < 3; i++) {
      const ax = mx + ip + 22 * U + i * 30 * U;
      k.draw.circle(g, ax, foot.y, 21 * U, card);
      k.draw.circle(g, ax, foot.y, 18 * U, C.mix([c.accent2, c.accent3, c.accent][i] || c.accent, card, 0.2));
    }
    k.draw.circle(g, mx + ip + 22 * U + 2 * 30 * U + 16 * U, foot.y + 12 * U, 10 * U, c.accent3 || c.accent, card, 2.5);
    k.draw.rrect(g, mx + ip + 130 * U, foot.y - 6 * U, 110 * U, 12 * U, 6 * U, skel);
    // ship button
    k.draw.rrect(g, btn.x, btn.y, btn.w, btn.h, btn.h / 2, c.accent);
    k.draw.icon(g, 'rocket', btn.x + 36 * U, btn.y + btn.h / 2, 26 * U, C.onColor(c.accent), { stroke: 2 });
    k.text.draw(g, 'Ship', btn.x + 60 * U, btn.y + btn.h / 2, { role: 'text', size: 24, weight: 600, color: C.onColor(c.accent), baseline: 'xmiddle' });
  }

  return {
    draw(g, t) {
      const enter = ease.outQuint(m.seg(t, 0, 0.7));
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.4);
      g.translate(0, (1 - enter) * 30 * U);
      mock(g, t);
      g.restore();
      callouts.forEach((co, i) => {
        const t0 = 0.9 + i * p.interval;
        if (t < t0) return;
        const pop = ease.outBack(m.seg(t, t0, 0.3));
        const lp = ease.outCubic(m.seg(t, t0 + 0.12, 0.45));
        const la = ease.outCubic(m.seg(t, t0 + 0.42, 0.4));
        const pts = pathOf(co);
        k.draw.polyline(g, pts, lp, leader, 1.5);
        // end tick
        if (lp >= 1) k.draw.circle(g, pts[pts.length - 1][0], pts[pts.length - 1][1], 3.5 * U, leader);
        // anchor dot + pulse rings
        const ph = ((t - t0) / 1.6) % 1;
        if (t - t0 > 0.3) {
          g.save(); g.globalAlpha *= (1 - ph) * 0.7;
          k.draw.circle(g, co.a.x, co.a.y, (10 + 26 * ease.outCubic(ph)) * U, null, c.accent, 2);
          g.restore();
        }
        if (dark) k.draw.glow(g, co.a.x, co.a.y, 34 * U * pop, c.accent, 0.45);
        k.draw.circle(g, co.a.x, co.a.y, 10 * U * pop, '#ffffff');
        k.draw.circle(g, co.a.x, co.a.y, 6.5 * U * pop, c.accent);
        // label
        const slide = (1 - la) * 14 * U;
        const dx = co.align === 'right' ? slide : co.align === 'left' ? -slide : 0;
        const dy = co.align === 'center' ? (co.side === 'up' ? slide : -slide) : 0;
        const num = String(i + 1).padStart(2, '0');
        const fsz = k.text.fit(feats[i], labS, co.align === 'center' ? k.safe.w * 0.46 : (co.align === 'right' ? co.lx - k.safe.x : k.safe.x + k.safe.w - co.lx), 24);
        k.text.draw(g, num, co.lx + dx, co.ny + dy, { ...idxS, align: co.align, baseline: 'middle', color: dark ? C.mix(c.accent, '#ffffff', 0.25) : c.accent, alpha: la });
        k.text.draw(g, feats[i], co.lx + dx, co.ly + dy, { ...labS, size: fsz, align: co.align, baseline: 'middle', alpha: la });
      });
    },
  };
}
