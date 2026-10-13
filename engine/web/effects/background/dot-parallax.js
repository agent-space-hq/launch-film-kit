// Three lattices of dots at three depths drift along one diagonal at different
// speeds. Each layer moves a whole number of lattice cells per loop, so the loop is
// seamless. A soft key light orbits slowly and lifts the dots it passes over, and the
// field calms down behind the headline.
export const meta = {
  id: 'background.dot-parallax',
  name: 'Dot Parallax',
  category: 'background',
  duration: 8,
  loop: true,
  ownsBackground: true,
  summary: 'Three rotated dot lattices drift at depth-scaled speeds under an orbiting key light; seamless loop with the headline held on top.',
  bestFor: ['backdrop', 'title card', 'section divider'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    angle: { default: -0.32, min: -1.2, max: 1.2, label: 'Lattice angle (rad)' },
    density: { default: 1, min: 0.6, max: 1.6, label: 'Dot density' },
  },
  prompt: `Seamless 8000 ms background loop. Build three square dot lattices rotated by -18 degrees: far (spacing 2.4% of the short side, dot radius 0.1%), mid (5.4%, 0.19%) and near (12.2%, 0.48%, defocused with a soft radial edge). Each layer translates along the lattice diagonal by exactly 1, 2 and 3 cells per loop (constant linear drift, the only linear motion), so speed scales with depth and frame 0 equals the last frame. Alpha rises with depth: 0.20, 0.38, 0.42 of the foreground colour; the near layer takes a 35% accent tint. A soft key light (radius 55% of width) orbits an ellipse once per loop and multiplies each dot's alpha by up to 2x. Fade dots in an ellipse behind the centre headline (down to 25%) and at the frame edges. Headline: display 92 ref px, weight 620, tracking -0.03 em, balanced to 62% width, static.`,
};

export function create(k, p) {
  const { m } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 92, square: 84, tall: 80 }), weight: 620, tracking: -0.03 };
  const lines = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.62, square: 0.8, tall: 0.86 }));
  const layers = [
    { sp: 26, r: 1.05, a: 0.2, cells: 1, tint: 0, soft: 0 },
    { sp: 58, r: 2.0, a: 0.38, cells: 2, tint: 0.12, soft: 0.25 },
    { sp: 132, r: 5.2, a: 0.42, cells: 3, tint: 0.35, soft: 0.85 },
  ].map((L) => ({ ...L, sp: (L.sp / p.density) * k.u, r: L.r * k.u, col: k.color.mix(c.fg, c.accent, L.tint) }));
  // dot sprites (one per layer), drawn once
  const sprites = layers.map((L) => {
    // near dots are slightly defocused (shallow depth of field): soft radial edge
    const s = Math.ceil(L.r * 2 * (1 + L.soft) + 4);
    const cv = document.createElement('canvas'); cv.width = cv.height = s;
    const gg = cv.getContext('2d');
    const R = L.r * (1 + L.soft);
    const grd = gg.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, R);
    grd.addColorStop(0, L.col); grd.addColorStop(Math.max(0.01, 1 - L.soft * 0.8), L.col); grd.addColorStop(1, k.color.alpha(L.col, 0));
    gg.fillStyle = grd; gg.beginPath(); gg.arc(s / 2, s / 2, R, 0, Math.PI * 2); gg.fill();
    return cv;
  });
  const ca = Math.cos(p.angle), sa = Math.sin(p.angle);
  const diag = Math.hypot(k.W, k.H) / 2 + 10 * k.u;
  // background wash
  const wash = k.layer('dotpar-bg');
  {
    const gg = k.ctx(wash);
    gg.fillStyle = c.bg; gg.fillRect(0, 0, k.W, k.H);
    const grd = gg.createRadialGradient(k.cx, k.H * 0.38, 0, k.cx, k.H * 0.38, Math.max(k.W, k.H) * 0.75);
    grd.addColorStop(0, k.color.mix(c.bg, c.accent, k.isDark ? 0.07 : 0.04));
    grd.addColorStop(1, c.bg);
    gg.fillStyle = grd; gg.fillRect(0, 0, k.W, k.H);
  }
  const ex = k.W * k.pick({ wide: 0.36, square: 0.42, tall: 0.46 }), ey = k.H * k.pick({ wide: 0.2, square: 0.16, tall: 0.11 });
  return {
    draw(g, t) {
      const ph = t / D;
      g.drawImage(wash, 0, 0);
      // light orbit (closed ellipse, once per loop)
      const la = ph * m.TAU;
      const lx = k.cx + Math.cos(la) * k.W * 0.32, ly = k.cy + Math.sin(la) * k.H * 0.3;
      const lr2 = (k.W * 0.55) ** 2;
      layers.forEach((L, li) => {
        const spr = sprites[li], hs = spr.width / 2;
        // drift along the lattice diagonal by whole cells per loop
        const off = ph * L.cells * L.sp;
        const ox = off, oy = off; // whole cells on both axes -> seamless
        const n = Math.ceil(diag / L.sp) + 2;
        for (let j = -n; j <= n; j++) {
          for (let i = -n; i <= n; i++) {
            const u = i * L.sp + (ox % L.sp), v = j * L.sp + (oy % L.sp);
            const x = k.cx + u * ca - v * sa, y = k.cy + u * sa + v * ca;
            if (x < -hs || y < -hs || x > k.W + hs || y > k.H + hs) continue;
            const dx = (x - k.cx) / ex, dy = (y - k.cy) / ey;
            const calm = p.title ? 0.25 + 0.75 * m.smoothstep(0.7, 1.6, dx * dx + dy * dy) : 1;
            const edge = m.smoothstep(0, k.vmin * 0.12, Math.min(x, y, k.W - x, k.H - y));
            const ld = ((x - lx) ** 2 + (y - ly) ** 2) / lr2;
            const lit = 0.55 + 1.1 * Math.exp(-ld * 2.2);
            const a = L.a * calm * edge * lit;
            if (a < 0.01) continue;
            g.globalAlpha = Math.min(1, a);
            g.drawImage(spr, x - hs, y - hs);
          }
        }
      });
      g.globalAlpha = 1;
      if (p.title) {
        const lh = to.size * 1.08 * k.u;
        const top = k.cy - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...to, align: 'center', baseline: 'middle', qaGroup: str }));
      }
    },
  };
}
