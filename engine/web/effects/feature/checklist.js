// A launch checklist. The title and unchecked rows settle in, then each item is
// ticked in turn: the box fills, the check strokes on and the row eases a few pixels
// right as it settles into the done state. The final item lands in the accent with
// a soft bloom. Ends held on the completed list.
export const meta = {
  id: 'feature.checklist',
  name: 'Checklist',
  category: 'feature',
  duration: 5,
  summary: 'Checklist rows appear, then get checked one by one (box fills, check draws on, row slides slightly); the last item lands in the accent; holds on the finished list.',
  bestFor: ['what is included', 'launch readiness', 'requirements met'],
  slots: ['features'],
  params: {
    title: { default: 'Launch checklist', label: 'Title' },
    interval: { default: 0.5, min: 0.25, max: 1, label: 'Time between checks (s)' },
  },
  sfx: [{ t: 1.1, type: 'tick', gain: 0.5 }, { t: 1.6, type: 'tick', gain: 0.5 }, { t: 2.1, type: 'tick', gain: 0.5 }, { t: 2.6, type: 'pop', gain: 0.6 }],
  prompt: `Left-align a block, centred as a group: a 60 px display title and one row per copy.features entry (up to 5), each a 60 px rounded checkbox with a 2 px hairline and a 46 px label, rows 104 px apart. The title rises 16 px over 600 ms (outQuint); rows follow 90 ms apart from 300 ms. From 1.1 s, every 500 ms an item is checked: the box fills over 220 ms (outCubic) in the foreground colour, the check strokes on over 300 ms, and the row slides 12 px right with the standard curve while its label dims slightly. The last item fills with the accent instead, its label turns accent, the box springs to 112% and settles (damping 18) and a soft glow blooms on dark brands. Hold the completed list.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Roadmap synced', 'Changelog drafted', 'Team approved', 'Release shipped']).slice(0, 5);
  const n = feats.length;
  const titleS = { role: 'display', size: k.pick({ wide: 64, square: 60, tall: 64 }), weight: 650, tracking: -0.035 };
  const labS0 = { role: 'display', size: k.pick({ wide: 48, square: 46, tall: 50 }), weight: 560, tracking: -0.02 };
  const box = k.pick({ wide: 60, square: 58, tall: 62 }) * U;
  const gapX = 34 * U;
  const maxLab = k.safe.w - box - gapX - 40 * U;
  const labSize = Math.min(...feats.map((f) => k.text.fit(f, labS0, maxLab, 28)));
  const labS = { ...labS0, size: labSize };
  const rowH = k.pick({ wide: 100, square: 108, tall: 120 }) * U;
  const titleH = 130 * U;
  const groupW = Math.max(k.text.layout(p.title, titleS).width, box + gapX + Math.max(...feats.map((f) => k.text.layout(f, labS).width)) + 12 * U);
  const groupH = titleH + n * rowH;
  const x0 = k.cx - groupW / 2, y0 = k.cy - groupH / 2;
  const accTxt = dark ? C.mix(c.accent, '#ffffff', 0.25) : c.accent;

  return {
    draw(g, t) {
      const ta = ease.outQuint(m.seg(t, 0, 0.6));
      k.text.draw(g, p.title, x0, y0 + 40 * U + (1 - ta) * 16 * U, { ...titleS, baseline: 'middle', alpha: ta });
      feats.forEach((f, i) => {
        const ra = ease.outQuint(m.seg(t, 0.3 + i * 0.09, 0.6));
        if (ra <= 0) return;
        const tc = 1.1 + i * p.interval;
        const last = i === n - 1;
        const fill = ease.outCubic(m.seg(t, tc, 0.22));
        const ck = ease.outCubic(m.seg(t, tc + 0.06, 0.3));
        const slide = ease.standard(m.seg(t, tc, 0.5)) * 12 * U;
        const pop = last ? m.clamp(ease.spring(t - tc, { stiffness: 260, damping: 18 }), 0, 1.2) : 1;
        const bs = last && t > tc ? 1 + 0.12 * Math.max(0, Math.sin(Math.PI * m.seg(t, tc, 0.35))) : 1;
        const cy = y0 + titleH + i * rowH + rowH / 2;
        const bx = x0 + slide, bcy = cy;
        g.save();
        g.globalAlpha *= ra;
        g.translate((1 - ra) * -14 * U, 0);
        // box
        const fillCol = last ? c.accent : C.mix(c.fg, c.bg, 0.08);
        if (last && dark && fill > 0) k.draw.glow(g, bx + box / 2, bcy, box * 2.2, c.accent, 0.45 * fill);
        g.save();
        g.translate(bx + box / 2, bcy); g.scale(bs, bs); g.translate(-(bx + box / 2), -bcy);
        k.draw.rrect(g, bx, bcy - box / 2, box, box, 16 * U, dark ? C.mix(c.bg, c.fg, 0.05) : '#ffffff', C.alpha(c.fg, 0.22 * (1 - fill)), 2);
        if (fill > 0) {
          const fs = box * (0.4 + 0.6 * fill);
          g.save(); g.globalAlpha *= fill;
          k.draw.rrect(g, bx + box / 2 - fs / 2, bcy - fs / 2, fs, fs, 16 * U * (fs / box), fillCol);
          g.restore();
        }
        if (ck > 0) k.draw.icon(g, 'check', bx + box / 2, bcy, box * 0.72, C.onColor(fillCol), { p: ck < 1 ? ck : undefined, stroke: 2.6 });
        g.restore();
        // label
        const lc = last ? C.mix(c.fg, accTxt, fill) : C.mix(c.fg, c.muted, 0.35 * fill);
        k.text.draw(g, f, bx + box + gapX, cy, { ...labS, color: lc, baseline: 'middle', weight: last && fill > 0.5 ? 620 : labS.weight });
        g.restore();
      });
    },
  };
}
