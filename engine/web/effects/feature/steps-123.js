// Three numbered steps on a track. The track and nodes set in, then step 1 lights up;
// an accent fill runs along the line to step 2, which lights while step 1 turns into a
// check; then on to step 3. Labels come from copy.features. Horizontal in landscape,
// vertical in portrait. Ends held with step 3 lit.
export const meta = {
  id: 'feature.steps-123',
  name: 'Steps 1-2-3',
  category: 'feature',
  duration: 5,
  summary: 'Three numbered steps light up in turn as an accent fill travels the connecting line; finished steps become checks; holds on the final step.',
  bestFor: ['how it works', 'onboarding', 'process'],
  slots: ['features'],
  params: {
    gap: { default: 1.2, min: 0.7, max: 2, label: 'Time between steps (s)' },
  },
  sfx: [{ t: 0.85, type: 'pop', gain: 0.5 }, { t: 2.05, type: 'pop', gain: 0.5 }, { t: 3.25, type: 'pop', gain: 0.55 }],
  prompt: `Place three step nodes (112 px circles) on a straight track: horizontally 30% of the frame width apart in landscape, vertically 300 px apart in portrait with labels to the right. The 2 px track draws on over 600 ms (outQuint) while nodes pop in with outBack, 80 ms apart, as hairline outlines with muted numbers; labels sit in the muted colour with a mono "STEP n" kicker. Step 1 lights at 850 ms: the node fills with the accent via a spring (damping 18) and a soft glow on dark, its label turns full colour and rises 8 px. An accent fill then runs along the track to the next node over 700 ms (inOutCubic) and lights it 1.2 s after the previous one; the previous number crossfades to a drawn check. Labels are 52 px display weight 620. Hold on step 3 lit.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Connect', 'Plan', 'Ship']).slice(0, 3);
  while (feats.length < 3) feats.push('Ship');
  const wide = !k.isPortrait;
  const nodeR = 56 * U;
  const nodes = [0, 1, 2].map((i) => wide
    ? { x: k.cx + (i - 1) * k.safe.w * 0.31, y: k.cy - 50 * U }
    : { x: k.safe.x + 80 * U, y: k.cy + (i - 1) * k.pick({ tall: 360, square: 300 }) * U });
  const labS = { role: 'display', size: k.pick({ wide: 52, square: 50, tall: 56 }), weight: 620, tracking: -0.025 };
  const kick = { role: 'mono', size: 24, weight: 500, tracking: 0.08 };
  const maxW = wide ? k.safe.w * 0.29 : k.safe.x + k.safe.w - (nodes[0].x + nodeR + 40 * U);
  const labSize = Math.min(...feats.map((f) => k.text.fit(f, labS, maxW, 26)));
  const onA = C.onColor(c.accent);
  const actT = (i) => 0.85 + i * p.gap;

  return {
    draw(g, t) {
      const track = ease.outQuint(m.seg(t, 0, 0.6));
      const a = nodes[0], b = nodes[2];
      const base = C.alpha(c.fg, dark ? 0.14 : 0.12);
      // base track
      g.save();
      g.strokeStyle = base; g.lineWidth = 2 * U; g.lineCap = 'round';
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(m.lerp(a.x, b.x, track), m.lerp(a.y, b.y, track)); g.stroke();
      g.restore();
      // accent fill along the track
      for (let i = 0; i < 2; i++) {
        const f = ease.inOutCubic(m.seg(t, actT(i + 1) - 0.7, 0.7));
        if (f <= 0) continue;
        const n0 = nodes[i], n1 = nodes[i + 1];
        const ex = m.lerp(n0.x, n1.x, f), ey = m.lerp(n0.y, n1.y, f);
        g.save();
        g.strokeStyle = c.accent; g.lineWidth = 4 * U; g.lineCap = 'round';
        g.beginPath(); g.moveTo(n0.x, n0.y); g.lineTo(ex, ey); g.stroke();
        g.restore();
        if (f < 1) { if (dark) k.draw.glow(g, ex, ey, 40 * U, c.accent, 0.7); k.draw.circle(g, ex, ey, 5 * U, '#ffffff'); }
      }
      nodes.forEach((n, i) => {
        const pop = ease.outBack(m.seg(t, 0.1 + i * 0.08, 0.5));
        if (pop <= 0) return;
        const on = m.clamp(ease.spring(t - actT(i), { stiffness: 260, damping: 18 }), 0, 1.15);
        const lit = m.clamp(on);
        const done = i < 2 ? ease.outCubic(m.seg(t, actT(i + 1), 0.4)) : 0;
        const r = nodeR * pop * (1 + 0.08 * (on - lit > 0 ? on - lit : 0) + 0.0);
        // halo
        if (lit > 0 && dark) k.draw.glow(g, n.x, n.y, nodeR * 2.6, c.accent, 0.35 * lit * (1 - 0.5 * done));
        // node body
        k.draw.circle(g, n.x, n.y, r, dark ? C.mix(c.bg, c.fg, 0.06) : '#ffffff', C.alpha(c.fg, 0.2 * (1 - lit)), 1.5);
        if (lit > 0) {
          g.save();
          if (!dark) { g.shadowColor = C.alpha(c.accent, 0.35); g.shadowBlur = 24 * U; g.shadowOffsetY = 8 * U; }
          k.draw.circle(g, n.x, n.y, r * (0.4 + 0.6 * Math.min(1, on)), c.accent);
          g.restore();
        }
        // pulse ring when lit
        const pr = m.seg(t, actT(i), 0.8);
        if (pr > 0 && pr < 1) { g.save(); g.globalAlpha *= (1 - pr) * 0.7; k.draw.circle(g, n.x, n.y, r + 30 * U * ease.outCubic(pr), null, c.accent, 2); g.restore(); }
        // number / check
        const numCol = C.mix(c.muted, onA, lit);
        if (1 - done > 0.01) k.text.draw(g, String(i + 1), n.x, n.y, { role: 'display', size: 46, weight: 640, color: numCol, align: 'center', baseline: 'middle', alpha: (1 - done) * pop });
        if (done > 0) k.draw.icon(g, 'check', n.x, n.y, 50 * U, onA, { stroke: 2.6, p: done });
        // label
        const la = ease.outCubic(m.seg(t, 0.3 + i * 0.08, 0.5));
        const rise = (1 - lit) * 8 * U;
        const lc = C.mix(c.muted, c.fg, lit);
        if (wide) {
          k.text.draw(g, `STEP ${i + 1}`, n.x, n.y + nodeR + 60 * U + rise, { ...kick, align: 'center', baseline: 'middle', color: lit > 0.5 ? (dark ? C.mix(c.accent, '#ffffff', 0.3) : c.accent) : c.muted, alpha: la });
          k.text.draw(g, feats[i], n.x, n.y + nodeR + 118 * U + rise, { ...labS, size: labSize, align: 'center', baseline: 'middle', color: lc, alpha: la });
        } else {
          const lx = n.x + nodeR + 44 * U;
          k.text.draw(g, `STEP ${i + 1}`, lx, n.y - 36 * U, { ...kick, baseline: 'middle', color: lit > 0.5 ? (dark ? C.mix(c.accent, '#ffffff', 0.3) : c.accent) : c.muted, alpha: la });
          k.text.draw(g, feats[i], lx, n.y + 22 * U + rise * 0.5, { ...labS, size: labSize, baseline: 'middle', color: lc, alpha: la });
        }
      });
    },
  };
}
