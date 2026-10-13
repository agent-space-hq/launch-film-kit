// Fly through the cut: the outgoing shot rushes toward the camera and thins out
// while fine radial speed streaks pass the lens, and the incoming shot arrives
// from slightly small and settles. The engine's motion blur does the smearing.
export const meta = {
  id: 'transition.zoom-through',
  name: 'Zoom Through',
  category: 'transition',
  duration: 1.0,
  summary: 'A accelerates toward the camera (scale up to 2.6x) and fades while thin radial streaks sweep outward; B grows in from 90% and settles at full size.',
  bestFor: ['energy cut', 'into the product', 'act change'],
  params: {
    streaks: { default: 110, min: 0, max: 240, label: 'Streak count' },
  },
  sfx: [{ t: 0.15, type: 'riser', dur: 0.35, gain: 0.35 }, { t: 0.45, type: 'whoosh', dur: 0.6, gain: 0.6 }],
  prompt: `Over 1000 ms. A scales about the centre from 1.0 to 2.6 on an inQuad curve over 0-620 ms, and its opacity falls to zero between 340 and 620 ms (inOutCubic). Under it, B scales from 0.90 to 1.0 on outExpo over 380-1000 ms and fades in over 380-600 ms (outCubic); the gap around B while it is small is the brand background. Speed streaks: about 110 seeded radial lines, 1 to 2.5 px wide, each a short segment whose inner end starts 12-40% of the half-diagonal out and which travels outward and lengthens with the zoom; their opacity follows a sine bump peaking at the crossover (500 ms), max 35% light on dark brands (additive), 20% dark on light. Frame 0 shows exactly A; the final frame exactly B.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const r = m.rng(77);
  const streaks = Array.from({ length: Math.round(p.streaks) }, () => ({
    ang: r() * m.TAU, r0: 0.12 + r() * 0.28, len: 0.08 + r() * 0.22, w: 1 + r() * 1.5, a: 0.4 + r() * 0.6, sp: 0.7 + r() * 0.6,
  }));
  const scaled = (g, img, s) => {
    g.save();
    g.translate(k.cx, k.cy); g.scale(s, s); g.translate(-k.cx, -k.cy);
    g.drawImage(img, 0, 0);
    g.restore();
  };
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const c = k.brand.colors;
      const f = t / D;
      // B underneath
      const bIn = ease.outCubic(m.seg(f, 0.38, 0.22));
      if (bIn > 0) {
        g.fillStyle = c.bg; g.fillRect(0, 0, k.W, k.H);
        g.save();
        g.globalAlpha = bIn;
        scaled(g, b, 0.9 + 0.1 * ease.outExpo(m.seg(f, 0.38, 0.62)));
        g.restore();
      }
      // A rushing forward
      const aOut = ease.inOutCubic(m.seg(f, 0.34, 0.28));
      if (aOut < 1) {
        g.save();
        g.globalAlpha = 1 - aOut;
        scaled(g, a, 1 + 1.6 * ease.inQuad(m.seg(f, 0, 0.62)));
        g.restore();
      }
      // radial streaks
      const bump = Math.sin(Math.PI * m.clamp((f - 0.15) / 0.7)) ** 2;
      if (bump > 0.002 && streaks.length) {
        const R = Math.hypot(k.W, k.H) / 2;
        const travel = ease.inOutCubic(m.seg(f, 0.1, 0.8));
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = k.isDark ? '#ffffff' : c.fg;
        if (k.isDark) g.globalCompositeOperation = 'lighter';
        for (const s of streaks) {
          const rr = (s.r0 + travel * 0.9 * s.sp) * R;
          const len = s.len * R * (0.4 + 1.6 * bump);
          const cs = Math.cos(s.ang), sn = Math.sin(s.ang);
          g.globalAlpha = (k.isDark ? 0.35 : 0.2) * bump * s.a;
          g.lineWidth = s.w * k.u;
          g.beginPath();
          g.moveTo(k.cx + cs * rr, k.cy + sn * rr);
          g.lineTo(k.cx + cs * (rr + len), k.cy + sn * (rr + len));
          g.stroke();
        }
        g.restore();
      }
    },
  };
}
