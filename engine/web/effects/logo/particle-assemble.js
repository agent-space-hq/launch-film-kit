// Particles drift in from a loose cloud, settle into the mark, the mark resolves
// solid with a soft bloom, then the wordmark slides out from behind it.
export const meta = {
  id: 'logo.particle-assemble',
  name: 'Particle Assemble',
  category: 'logo',
  duration: 4.2,
  summary: 'A cloud of particles converges into the logo, which resolves solid and is joined by the wordmark.',
  bestFor: ['opening ident', 'end card', 'brand reveal'],
  prompt: `Draw the brand mark as about 2,600 small square particles sampled inside its silhouette (seeded). Start every particle on a loose elliptical cloud about 90% of the frame wide, drifting slightly on low-frequency noise. Over 1.35 s per particle, with a random 0-550 ms delay plus a delay that grows with distance from the mark centre, move it to its target with outQuint. Use the accent colour, with about 18% in the secondary accent; on dark backgrounds draw additively. At 1.55 s cross-fade the particles (600 ms inOutCubic) into the solid vector mark, with a soft radial glow pulse behind it on dark only. At 2.3 s slide the mark left so that mark plus wordmark stay centred (1.0 s emphasized ease), revealing the brand name from behind a clip edge at the mark's right side, 36 px gap, display weight 620. Mark height is 24% of the frame's short side. Hold the lockup to the end.`,
  params: {
    count: { default: 2600, min: 600, max: 8000, label: 'Particles' },
    spread: { default: 0.9, min: 0.3, max: 1.6, label: 'Start cloud size (x frame)' },
    wordmark: { default: true, label: 'Show wordmark' },
  },
  sfx: [{ t: 0.15, type: 'swell', dur: 1.4, gain: 0.7 }, { t: 1.6, type: 'shimmer', gain: 0.6 }, { t: 2.35, type: 'whoosh', dur: 0.5, gain: 0.4 }],
};

export function create(k, p) {
  const { ease, m } = k;
  const r = m.rng(42);
  const pts = k.logo.points(p.count, { seed: 3 });
  const parts = pts.map(([x, y], i) => {
    const a = r() * m.TAU, d = (0.35 + r() * 0.65) * p.spread;
    return {
      tx: x, ty: y,
      sx: Math.cos(a) * d * k.aspect * 0.6, sy: Math.sin(a) * d * 0.6,
      delay: r() * 0.55 + Math.hypot(x, y) * 0.25,
      size: 0.6 + r() * 1.1,
      tint: r() < 0.18,
      wob: r() * m.TAU,
    };
  });
  const noise = m.makeNoise(9);
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const showWord = p.wordmark && k.brand.name;
      const markH = k.pick({ wide: 260, square: 240, tall: 230 }) * k.u;
      // wordmark layout (mark moves left to make room)
      const word = showWord ? k.text.layout(k.brand.name, { size: k.pick({ wide: 150, square: 120, tall: 104 }), weight: 620 }) : null;
      const gap = 36 * k.u;
      const total = word ? markH * k.logo.aspect + gap + word.width : 0;
      const slide = word ? ease.emphasized(m.seg(t, 2.3, 1.0)) : 0;
      const markCx = k.cx - (total / 2 - (markH * k.logo.aspect) / 2) * slide;
      const cy = k.cy;
      // particles
      const solid = ease.inOutCubic(m.seg(t, 1.55, 0.6));
      g.save();
      g.globalCompositeOperation = k.isDark ? 'lighter' : 'source-over';
      for (const q of parts) {
        const pr = ease.outQuint(m.seg(t, 0.1 + q.delay, 1.35));
        const n = noise(q.sx * 3, q.sy * 3, t * 0.4) * (1 - pr) * 0.08;
        const x = m.lerp(q.sx, q.tx, pr) + n, y = m.lerp(q.sy, q.ty, pr) + noise(q.sy * 3 + 7, q.sx * 3, t * 0.4) * (1 - pr) * 0.08;
        const px = markCx + x * markH, py = cy + y * markH;
        const a = Math.min(1, m.seg(t, q.delay * 0.4, 0.5) * 1.2) * (1 - solid * 0.92);
        if (a <= 0.01) continue;
        g.globalAlpha = a * (k.isDark ? 0.75 : 0.9);
        g.fillStyle = q.tint ? c.accent2 || c.accent : c.accent;
        const s = q.size * k.u * (1.4 - pr * 0.4);
        g.fillRect(px - s, py - s, s * 2, s * 2);
      }
      g.restore();
      // solid mark with a glow pulse at resolve
      if (solid > 0) {
        const pulse = Math.sin(Math.PI * m.seg(t, 1.55, 0.9));
        if (k.isDark && pulse > 0) k.draw.glow(g, markCx, cy, markH * 1.4, c.accent, 0.35 * pulse);
        k.logo.draw(g, markCx, cy, markH, { alpha: solid });
      }
      if (word && slide > 0) {
        const wx = markCx + (markH * k.logo.aspect) / 2 + gap;
        g.save();
        g.beginPath(); g.rect(wx - 4 * k.u, 0, k.W, k.H); g.clip();
        k.text.draw(g, k.brand.name, wx - (1 - slide) * word.width * 0.6, cy, { size: k.pick({ wide: 150, square: 120, tall: 104 }), weight: 620, baseline: 'middle', alpha: slide });
        g.restore();
      }
    },
  };
}
