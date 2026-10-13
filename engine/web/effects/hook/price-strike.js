// The old cost sits in big display type from frame 0 (thumbnail-ready). A tapered,
// hand-drawn marker stroke slashes it twice, the old line shrinks and greys out, and
// the replacement (copy.after) springs up beneath it in the accent colour.
export const meta = {
  id: 'hook.price-strike',
  name: 'Price Strike',
  category: 'hook',
  duration: 4.2,
  summary: 'The old price/timeline is slashed by a tapered marker stroke, shrinks to grey, and the new value springs up beneath; holds on the clean pair, then lifts away in the last 0.4 s.',
  bestFor: ['cold open', 'before/after claim', 'pricing hook'],
  slots: ['before', 'after', 'beforePrice', 'beforeLabel', 'afterLabel'],
  params: {
    strikes: { default: 2, min: 1, max: 2, label: 'Marker passes' },
  },
  sfx: [{ t: 0.42, type: 'whoosh', dur: 0.25, gain: 0.35 }, { t: 0.62, type: 'whoosh', dur: 0.2, gain: 0.25 }, { t: 1.0, type: 'pop', gain: 0.6 }],
  prompt: `Open on a finished thumbnail: a small tracked uppercase label (2.4% of frame height, muted) above the old cost/timeline in display type (about 15% of height, weight 640, -0.035 em). At 400 ms a tapered marker stroke slashes it: a slightly bowed bezier with per-sample hash wobble, drawn as a filled ribbon whose width follows sin^0.4 pressure, revealed over 260 ms with outQuint; a thinner second pass follows 140 ms later. From 900 ms the old line moves up 9% and scales to 0.62 over 700 ms (standard curve) while its colour eases to muted. At 1000 ms the replacement value rises from behind a baseline mask on a damped spring (stiffness 210, damping 20) in the accent colour, 1.05x the old size, with its own label. Hold the pair 2.4 s, then lift and fade everything in 400 ms with inCubic.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const before = k.copy('before', '6 weeks');
  const oldPrice = k.copy('beforePrice', null);
  const oldStr = oldPrice ? `${oldPrice} / ${before}` : before;
  const newStr = k.copy('after', '1 afternoon');
  const lblOld = k.copy('beforeLabel', 'The old way').toUpperCase();
  const lblNew = k.copy('afterLabel', `With ${k.brand.name}`).toUpperCase();
  const maxW = k.safe.w * 0.92;
  const big = k.pick({ wide: 168, square: 150, tall: 156 });
  const oOld = { size: big, weight: 640, tracking: -0.035 };
  oOld.size = k.text.fit(oldStr, oOld, maxW);
  const oNew = { size: big * 1.05, weight: 660, tracking: -0.04 };
  oNew.size = k.text.fit(newStr, oNew, maxW);
  const lbl = { role: 'text', size: k.pick({ wide: 26, square: 26, tall: 28 }), weight: 560, tracking: 0.14 };

  // Hand-drawn stroke ribbon: bowed bezier + seeded wobble + pressure taper.
  function strokePts(x0, y0, x1, y1, bow, seed) {
    const pts = [];
    const N = 56;
    const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1;
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const b = Math.sin(Math.PI * s) * bow;
      const w = Math.sin(s * 4.2 + seed) * 0.0022 + Math.sin(s * 9.7 + seed * 2.3) * 0.0009;
      const x = m.lerp(x0, x1, s) + (nx / nl) * (b + w * k.W);
      const y = m.lerp(y0, y1, s) + (ny / nl) * (b + w * k.W);
      pts.push([x, y, s]);
    }
    return pts;
  }
  function ribbon(g, pts, prog, width, col) {
    const n = Math.max(2, Math.ceil(pts.length * prog));
    if (prog <= 0) return;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
      const s = pts[i][2];
      const press = Math.pow(Math.sin(Math.PI * m.clamp(s * 0.94 + 0.03)), 0.4);
      const hw = (width / 2) * press * (0.85 + 0.15 * Math.sin(s * 13));
      L.push([pts[i][0] - (dy / dl) * hw, pts[i][1] + (dx / dl) * hw]);
      R.push([pts[i][0] + (dy / dl) * hw, pts[i][1] - (dx / dl) * hw]);
    }
    g.beginPath();
    g.moveTo(L[0][0], L[0][1]);
    for (const q of L) g.lineTo(q[0], q[1]);
    for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
    g.closePath();
    g.fillStyle = col; g.fill();
    // round head
    const e = pts[n - 1];
    const hp = Math.pow(Math.sin(Math.PI * m.clamp(e[2] * 0.94 + 0.03)), 0.4);
    g.beginPath(); g.arc(e[0], e[1], (width / 2) * hp * 0.9, 0, m.TAU); g.fill();
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const D = p.duration ?? meta.duration;
      const Lo = k.text.layout(oldStr, oOld);
      const Ln = k.text.layout(newStr, oNew);
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.4));
      const lift = exit * 40 * k.u;
      // --- old line: centred at start, moves up and shrinks
      const mv = ease.standard(m.seg(t, 0.9, 0.7));
      const gapY = 128 * k.u;
      const yOld = m.lerp(k.cy + 18 * k.u, k.cy - gapY, mv) - lift;
      const sOld = m.lerp(1, 0.62, mv);
      const oldCol = C.mix(c.fg, c.muted, ease.inOutCubic(m.seg(t, 0.75, 0.6)));
      const alphaAll = 1 - exit;
      g.save();
      g.globalAlpha = alphaAll;
      k.text.draw(g, lblOld, k.cx, yOld - (Lo.cap / 2) * sOld - 44 * k.u, { ...lbl, color: c.muted, align: 'center', baseline: 'alphabetic' });
      g.translate(k.cx, yOld);
      g.scale(sOld, sOld);
      k.text.draw(g, oldStr, 0, 0, { ...oOld, color: oldCol, align: 'center', baseline: 'middle' });
      // strikes (in local, unscaled coords)
      const half = Lo.width / 2;
      const sw = Math.max(10, Lo.cap * 0.13);
      const ink = c.accent2 || c.accent;
      const s1 = strokePts(-half - Lo.cap * 0.22, Lo.cap * 0.2, half + Lo.cap * 0.2, -Lo.cap * 0.18, -Lo.cap * 0.1, 3);
      ribbon(g, s1, ease.outQuint(m.seg(t, 0.4, 0.26)), sw, ink);
      if (p.strikes > 1) {
        const s2 = strokePts(-half - Lo.cap * 0.05, Lo.cap * 0.42, half + Lo.cap * 0.32, Lo.cap * 0.02, Lo.cap * 0.06, 11);
        ribbon(g, s2, ease.outQuint(m.seg(t, 0.62, 0.22)), sw * 0.62, ink);
      }
      g.restore();
      // --- new line: spring up from behind a baseline mask
      const tn = t - 1.0;
      if (tn > 0) {
        const sp = ease.spring(tn, { stiffness: 210, damping: 20 });
        const yNew = k.cy + gapY - lift;
        const dy = (1 - sp) * Ln.cap * 1.25;
        const la = ease.outCubic(m.seg(t, 1.25, 0.5)) * alphaAll;
        k.text.draw(g, lblNew, k.cx, yNew - Ln.cap / 2 - 44 * k.u + (1 - la) * 12 * k.u, { ...lbl, color: c.accent, align: 'center', alpha: la });
        g.save();
        g.globalAlpha = alphaAll;
        if (k.isDark) k.draw.glow(g, k.cx, yNew, Ln.width * 0.6, c.accent, 0.08 * m.clamp(sp));
        g.beginPath();
        g.rect(0, yNew - Ln.cap * 0.75, k.W, Ln.cap * 1.5 + Ln.inkDescent);
        g.clip();
        k.text.draw(g, newStr, k.cx, yNew + dy, { ...oNew, color: c.accent, align: 'center', baseline: 'middle', qaOffstage: sp < 0.98 });
        g.restore();
      }
    },
  };
}
