// A liquid edge rises through the frame. Two travelling sine waves plus a little
// seeded noise shape its surface; a translucent accent "meniscus" runs just ahead
// of the incoming shot, and the waves calm to flat as the edge leaves the frame.
export const meta = {
  id: 'transition.liquid-wipe',
  name: 'Liquid Wipe',
  category: 'transition',
  duration: 1.2,
  summary: 'A wavy, noise-displaced edge sweeps up the frame revealing B beneath it, led by a translucent accent band; wave height swells mid-move and calms at the ends.',
  bestFor: ['soft scene change', 'fluid brand moment', 'lifestyle cut'],
  params: {
    amp: { default: 0.06, min: 0.01, max: 0.15, label: 'Wave height (x short side)' },
  },
  sfx: [{ t: 0.2, type: 'swell', dur: 0.7, gain: 0.35 }, { t: 0.6, type: 'whoosh', dur: 0.8, gain: 0.4 }],
  prompt: `The edge is y(x) = base + A(t) x (0.62 sin(2.1 x/W x 2pi + 5.2t) + 0.38 sin(4.7 x/W x 2pi - 7.9t + 1.3) + 0.35 noise), sampled every 8 px. base travels from just below the bottom edge (H + lead + 1.3A) to above the top (-1.3A) on a cubic-bezier(0.45, 0, 0.25, 1) curve over 1200 ms; A(t) = 6% of the short side x sin(pi x progress)^0.7, so the waves swell mid-move and calm at the ends. Draw A, then a lead band: the same curve 4.5% of the short side higher, filled with the accent at 85% (70% on light), then B clipped below the main edge, so the accent reads as a meniscus riding the surface. B sits a touch low (rises 3% of the height into place); A lifts 2%. A 1.5 px white highlight at 35% traces B's edge on dark. Exact A at frame 0, exact B at the end.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const noise = m.makeNoise(31);
  const curve = ease.bezier(0.45, 0, 0.25, 1);
  const N = Math.max(40, Math.ceil(k.W / (8 * k.u)));
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const c = k.brand.colors;
      const f = t / D;
      const pr = curve(f);
      const S = Math.min(k.W, k.H);
      const A = p.amp * S * Math.sin(Math.PI * f) ** 0.7;
      const lead = 0.045 * S;
      // crests can reach ~1.2A from the base; A is 0 at both ends, so the edge starts/ends just off-frame
      const base = m.lerp(k.H + lead + 1.3 * A, -1.3 * A, pr);
      const edge = (off) => {
        const pts = [];
        for (let i = 0; i <= N; i++) {
          const x = (i / N) * k.W, u = x / k.W;
          const y = base - off + A * (0.62 * Math.sin(u * 2.1 * m.TAU + t * 5.2) + 0.38 * Math.sin(u * 4.7 * m.TAU - t * 7.9 + 1.3) + 0.35 * noise(u * 3, t * 0.9, 4));
          pts.push([x, y]);
        }
        return pts;
      };
      const region = (pts) => {
        g.beginPath();
        g.moveTo(0, k.H + 10);
        for (const [x, y] of pts) g.lineTo(x, y);
        g.lineTo(k.W, k.H + 10);
        g.closePath();
      };
      // A lifts slightly
      g.save();
      g.translate(0, -0.02 * k.H * pr);
      g.drawImage(a, 0, 0);
      g.restore();
      const top = edge(lead), main = edge(0);
      // lead (meniscus) band
      g.save();
      region(top);
      g.globalAlpha = k.isDark ? 0.85 : 0.7;
      g.fillStyle = c.accent;
      g.fill();
      g.restore();
      // B below the main edge
      g.save();
      region(main);
      g.clip();
      g.drawImage(b, 0, 0.03 * k.H * (1 - pr));
      g.restore();
      if (k.isDark) {
        g.save();
        g.beginPath();
        main.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.strokeStyle = 'rgba(255,255,255,0.35)';
        g.lineWidth = 1.5 * k.u;
        g.stroke();
        g.restore();
      }
    },
  };
}
