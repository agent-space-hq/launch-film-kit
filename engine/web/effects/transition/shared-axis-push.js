// A navigation-style push along the horizontal axis. The incoming shot slides in
// from the right as a card casting a soft shadow; the outgoing shot moves left at
// a slower rate, shrinks slightly, rounds its corners and dims, as if stepping
// back under the new layer.
export const meta = {
  id: 'transition.shared-axis-push',
  name: 'Shared-Axis Push',
  category: 'transition',
  duration: 0.95,
  summary: 'B slides in from the right as a shadowed card while A parallaxes left at 32% speed, scales to 94%, rounds its corners and dims beneath it.',
  bestFor: ['next step', 'sequence of features', 'story progression'],
  params: {
    parallax: { default: 0.32, min: 0, max: 1, label: 'A travel (x frame width)' },
  },
  sfx: [{ t: 0.35, type: 'whoosh', dur: 0.6, gain: 0.5 }],
  prompt: `One progress curve for everything: inOutQuart-like (cubic-bezier 0.65, 0, 0.35, 1) over 950 ms. B, full size, translates from x = +100% of the frame width to 0; while moving it is clipped to a rectangle whose left corners round to 2.5% of the short side (squaring off on arrival), and it casts a soft shadow to its left (black at 45% on dark, navy at 22% on light, 60 px blur). A translates from 0 to -32% of the width, scales from 1.00 to 0.94 about its centre, gains rounded corners up to 3% of the short side, and takes a black scrim up to 50% (dark) or 18% (light). The background colour shows in the gap around the shrinking A. Frame 0 is exactly A, the last frame exactly B.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const curve = ease.bezier(0.65, 0, 0.35, 1);
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const c = k.brand.colors;
      const f = curve(t / D);
      const S = Math.min(k.W, k.H);
      g.fillStyle = c.bg; g.fillRect(0, 0, k.W, k.H);
      // A steps back
      const sa = 1 - 0.06 * f;
      const ax = -k.W * p.parallax * f;
      g.save();
      g.translate(k.cx + ax, k.cy); g.scale(sa, sa); g.translate(-k.cx, -k.cy);
      k.draw.squirclePath(g, 0, 0, k.W, k.H, 0.03 * S * f);
      g.clip();
      g.drawImage(a, 0, 0);
      g.fillStyle = `rgba(0,0,0,${((k.isDark ? 0.5 : 0.18) * f).toFixed(3)})`;
      g.fillRect(0, 0, k.W, k.H);
      g.restore();
      // B card
      const bx = k.W * (1 - f);
      const r = 0.025 * S * Math.min(1, (1 - f) * 4);
      g.save();
      g.shadowColor = k.isDark ? 'rgba(0,0,0,0.45)' : 'rgba(20,30,60,0.22)';
      g.shadowBlur = 60 * k.u; g.shadowOffsetX = -14 * k.u;
      k.draw.squirclePath(g, bx, 0, k.W + r * 2, k.H, r);
      g.fillStyle = c.bg; g.fill();
      g.restore();
      g.save();
      k.draw.squirclePath(g, bx, 0, k.W + r * 2, k.H, r);
      g.clip();
      g.drawImage(b, bx, 0);
      g.restore();
    },
  };
}
