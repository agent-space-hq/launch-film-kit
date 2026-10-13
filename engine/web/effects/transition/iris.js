// A classic iris, done with restraint: a circular aperture closes on the
// outgoing shot's focal point while the shot pushes in slightly, holds closed for
// an instant, then opens on the incoming shot's focal point. A fine accent ring
// traces the aperture edge.
export const meta = {
  id: 'transition.iris',
  name: 'Iris',
  category: 'transition',
  qaAllowBlank: true, // the iris holds fully closed for ~70 ms by design
  duration: 1.2,
  summary: 'A circular aperture closes onto A\'s focal point (A pushes in 6%), holds shut for about 70 ms, then opens from B\'s focal point as B settles from 106%; a thin accent ring rides the aperture edge.',
  bestFor: ['chapter break', 'focus on a detail', 'playful reset'],
  params: {
    ax: { default: 0.5, min: 0, max: 1, label: 'A focal x (0..1)' },
    ay: { default: 0.5, min: 0, max: 1, label: 'A focal y (0..1)' },
    bx: { default: 0.5, min: 0, max: 1, label: 'B focal x (0..1)' },
    by: { default: 0.5, min: 0, max: 1, label: 'B focal y (0..1)' },
  },
  sfx: [{ t: 0.0, type: 'whoosh', dur: 0.5, gain: 0.35 }, { t: 0.56, type: 'click', gain: 0.6 }, { t: 0.62, type: 'whoosh', dur: 0.55, gain: 0.4 }],
  prompt: `Close phase 0-560 ms: an aperture centred on A's focal point (default frame centre) shrinks from the distance to the farthest frame corner (plus 1%) to zero on an inCubic-flavoured curve (cubic-bezier 0.35, 0, 0.75, 0.35), while A scales 1.00 to 1.06 about that point. Outside the aperture is near-black (#050507). Hold closed for 70 ms. Open phase 630-1200 ms: an aperture centred on B's focal point grows from zero back past the farthest corner on outExpo-like deceleration (cubic-bezier 0.16, 1, 0.3, 1), while B settles from 1.06 to 1.00. A 2 px accent ring with a soft 10 px accent glow (dark brands) traces the aperture; it fades out as the aperture reaches the frame edge. Frame 0 is exactly A, the last frame exactly B.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const closeC = ease.bezier(0.35, 0, 0.75, 0.35);
  const openC = ease.bezier(0.16, 1, 0.3, 1);
  const far = (fx, fy) => Math.max(...[[0, 0], [k.W, 0], [0, k.H], [k.W, k.H]].map(([x, y]) => Math.hypot(x - fx, y - fy))) * 1.01;
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const c = k.brand.colors;
      const f = t / D;
      const T1 = 0.467, T2 = 0.525; // close end, open start (560 ms / 630 ms of 1200)
      g.fillStyle = '#050507';
      g.fillRect(0, 0, k.W, k.H);
      let img, fx, fy, R, sc, edgeFade;
      if (f < T1) {
        const q = closeC(f / T1);
        img = a; fx = p.ax * k.W; fy = p.ay * k.H;
        const Rm = far(fx, fy); R = Rm * (1 - q); sc = 1 + 0.06 * q;
        edgeFade = m.clamp((1 - R / Rm) * 6);
      } else if (f < T2) {
        return;
      } else {
        const q = openC((f - T2) / (1 - T2));
        img = b; fx = p.bx * k.W; fy = p.by * k.H;
        const Rm = far(fx, fy); R = Rm * q; sc = 1.06 - 0.06 * q;
        edgeFade = m.clamp((1 - R / Rm) * 6);
      }
      if (R < 0.5) return;
      g.save();
      g.beginPath(); g.arc(fx, fy, R, 0, m.TAU); g.clip();
      g.translate(fx, fy); g.scale(sc, sc); g.translate(-fx, -fy);
      g.drawImage(img, 0, 0);
      g.restore();
      // accent ring
      if (edgeFade > 0.01) {
        g.save();
        if (k.isDark) {
          g.globalAlpha = 0.35 * edgeFade;
          g.filter = `blur(${(5 * k.u).toFixed(1)}px)`;
          g.beginPath(); g.arc(fx, fy, R, 0, m.TAU);
          g.strokeStyle = c.accent; g.lineWidth = 10 * k.u; g.stroke();
          g.filter = 'none';
        }
        g.globalAlpha = edgeFade;
        g.beginPath(); g.arc(fx, fy, R, 0, m.TAU);
        g.strokeStyle = k.isDark ? k.color.mix(c.accent, c.fg, 0.3) : c.accent; g.lineWidth = 2 * k.u; g.stroke();
        g.restore();
      }
    },
  };
}
