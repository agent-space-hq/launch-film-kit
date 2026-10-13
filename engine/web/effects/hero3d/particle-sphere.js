// A sphere of points (Fibonacci lattice) turns slowly in perspective and breathes,
// then every point flies to a sample of the logo and the mark resolves solid. Both
// point sets are sorted top to bottom before pairing, so each point travels a short,
// mostly vertical-preserving path and the morph reads as one coherent fold.
export const meta = {
  id: 'hero3d.particle-sphere',
  name: 'Particle Sphere',
  category: 'hero3d',
  duration: 5.5,
  summary: 'A depth-shaded sphere of points rotates and breathes, then folds point by point into the logo, which resolves solid; ends with a short fade.',
  bestFor: ['brand reveal', 'opening ident', 'AI / data themes'],
  params: {
    count: { default: 2200, min: 800, max: 5000, label: 'Points' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 1.6, gain: 0.45 }, { t: 2.4, type: 'whoosh', dur: 0.9, gain: 0.4 }, { t: 3.55, type: 'shimmer', gain: 0.5 }],
  prompt: `2200 points on a Fibonacci sphere (radius 27% of the short side), pitched 0.35 rad and spinning at 0.55 rad/s, projected with focal 3.2 radii. 0-800 ms: the sphere grows from 70% to full size and fades in (outExpo). It breathes: radius x (1 + 0.03 sin(2 pi t / 1.7 s)) plus a per-point shimmer of 1.5%. Points are 1.6-2.6 ref px squares, alpha 0.25 at the back to 0.95 at the front, 16% of them in the accent, additive on dark brands. 2400-3700 ms: each point moves to a logo sample (mark 50% of the short side tall, flat at depth 0), with sphere and logo samples both sorted by height and paired in order, each point switching to the colour of the mark path it lands in; per-point delay up to 350 ms by height, inOutCubic, while the spin eases to a stop. 3500-4100 ms: the solid mark fades in with a soft accent glow and the points dissolve into it. Exit: fade over the last 450 ms.`,
};

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const N = p.count;
  const r = m.rng(17);
  const sph = Array.from({ length: N }, (_, i) => m.fibSphere(i, N)); // already ordered by y (top to bottom: y from +1 to -1)
  const logo = k.logo.points(N, { seed: 5 }).map(([x, y]) => [x, y]);
  logo.sort((a, b) => a[1] - b[1]); // top (negative y) first
  // sphere y is "up positive"; in screen space up is negative, so pair sphere index i (y=+1 first) with logo top first
  // colour each logo sample by the mark path it falls in, so points arrive in the mark's colours
  const spec = k.logo.spec, [vx, vy, vw, vh] = spec.viewBox;
  const probe = document.createElement('canvas').getContext('2d');
  const fillOf = (f) => (!f || f === 'fg' ? c.fg : f === 'accent' ? c.accent : f === 'accent2' ? (c.accent2 || c.accent) : f === 'bg' ? c.bg : f);
  const targetCol = (x, y) => {
    const ux = x * vh + vx + vw / 2, uy = y * vh + vy + vh / 2;
    for (let j = k.logo.paths.length - 1; j >= 0; j--) if (probe.isPointInPath(k.logo.paths[j].path, ux, uy, k.logo.paths[j].rule || 'nonzero')) return fillOf(k.logo.paths[j].fill);
    return c.accent;
  };
  const pts = sph.map((v, i) => ({ v, lx: logo[i][0], ly: logo[i][1], tint: r() < 0.16, s: 0.8 + r() * 0.5, ph: r() * m.TAU, d: r(), tc: targetCol(logo[i][0], logo[i][1]) }));
  const mps = new Float32Array(N);
  const xs = new Float32Array(N), ys = new Float32Array(N), ss = new Float32Array(N), as = new Float32Array(N);
  return {
    draw(g, t) {
      const R = k.vmin * 0.27;
      const markH = k.vmin * 0.5;
      const inP = ease.outExpo(m.seg(t, 0, 0.8));
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const breathe = 1 + 0.03 * Math.sin((m.TAU * t) / 1.7);
      // spin eases to a stop during the morph: integrate a smoothly falling angular speed
      const w = 0.55, t0 = 2.4, t1 = 3.7;
      const spin = t < t0 ? w * t : w * t0 + w * (t1 - t0) * (1 - Math.pow(1 - m.seg(t, t0, t1 - t0), 2)) / 2;
      const pitch = 0.35 * (1 - ease.inOutCubic(m.seg(t, t0, 1.3)));
      const focal = 3.2;
      const solid = ease.inOutCubic(m.seg(t, 3.5, 0.6));
      const live = solid < 1;
      for (let i = 0; live && i < N; i++) {
        const q = pts[i];
        const sh = 1 + 0.015 * Math.sin(t * 2.3 + q.ph);
        let v = m.rotY(q.v, spin);
        v = m.rotX(v, pitch);
        const rad = R * (0.7 + 0.3 * inP) * breathe * sh;
        const sx = v[0] * rad, sy = -v[1] * rad, sz = v[2];
        const ps = focal / (focal + sz);
        // morph
        const mp = ease.inOutCubic(m.seg(t, t0 + (i / N) * 0.35, 1.0));
        const x = m.lerp(sx * ps, q.lx * markH, mp);
        const y = m.lerp(sy * ps, q.ly * markH, mp);
        const depthA = m.lerp(0.25 + 0.7 * (1 - (sz + 1) / 2), 0.9, mp);
        xs[i] = k.cx + x; ys[i] = k.cy + y;
        ss[i] = (1.6 + q.s * 0.8) * k.u * m.lerp(ps, 1, mp);
        as[i] = depthA * Math.min(1, inP * 1.3) * (1 - solid) * (1 - exit);
        mps[i] = mp;
      }
      // faint core light gives the sphere volume
      if (k.isDark) k.draw.glow(g, k.cx, k.cy, R * 1.5, c.accent, 0.12 * inP * (1 - solid) * (1 - exit));
      g.save();
      // batch points into alpha buckets per colour (one path each). Additive blending on dark is
      // order-independent; on light, buckets are filled far-to-near by alpha (front points are brighter).
      const colA = k.isDark ? k.color.mix(c.fg, c.accent, 0.15) : k.color.mix(c.fg, c.accent, 0.25);
      if (k.isDark) g.globalCompositeOperation = 'lighter';
      const B = 8;
      const buckets = new Map();
      for (let i = 0; live && i < N; i++) {
        const a = Math.min(1, as[i] * (k.isDark ? 0.85 : 1));
        if (a < 0.01) continue;
        const fs = mps[i] > 0.55 ? pts[i].tc : pts[i].tint ? c.accent : colA;
        const bi = Math.min(B - 1, Math.floor(a * B));
        const key = fs + '|' + bi;
        let path = buckets.get(key);
        if (!path) { path = { fs, bi, p: new Path2D() }; buckets.set(key, path); }
        const sz = ss[i];
        path.p.rect(xs[i] - sz / 2, ys[i] - sz / 2, sz, sz);
      }
      for (const P of [...buckets.values()].sort((x, y) => x.bi - y.bi)) {
        g.globalAlpha = (P.bi + 0.5) / B;
        g.fillStyle = P.fs;
        g.fill(P.p);
      }
      g.restore();
      if (solid > 0) {
        const pulse = Math.sin(Math.PI * m.seg(t, 3.5, 1.0));
        if (k.isDark && pulse > 0) k.draw.glow(g, k.cx, k.cy, markH * 0.95, c.accent, 0.34 * pulse * (1 - exit));
        k.logo.draw(g, k.cx, k.cy, markH, { alpha: solid * (1 - exit) });
      }
    },
  };
}
