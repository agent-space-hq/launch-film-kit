// A volume of points streams slowly toward the camera. A focus plane sits at mid
// depth: points there are crisp pin-pricks, points near the lens open into large,
// faint bokeh discs, far points are small and dim. Every point travels exactly one
// depth cycle per loop and is invisible where it wraps, so the loop is seamless.
export const meta = {
  id: 'background.depth-field',
  name: 'Depth Field',
  category: 'background',
  duration: 10,
  loop: true,
  ownsBackground: true,
  summary: 'A point volume drifts toward the camera with depth-of-field: crisp at the focus plane, soft bokeh near the lens; seamless loop with the headline on top.',
  bestFor: ['backdrop', 'title card', 'intro'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    count: { default: 2200, min: 400, max: 3000, label: 'Points' },
    focus: { default: 0.45, min: 0.15, max: 0.85, label: 'Focus depth (0 near, 1 far)' },
  },
  prompt: `Seamless 10000 ms loop. Scatter about 2200 points in a box (x across 2.4x frame width, y 2.4x height, depth 0..1) and keep them off the central axis. Each point's depth decreases by exactly 1 per loop (wrapped with fract), so it flies toward the camera at constant speed (linear, as a camera dolly) and frame 0 equals the last frame. Project with a pinhole camera (focal 1.1x the short side). Circle of confusion = (focus - depth) x 110 ref px in front of the focus plane, (depth - focus) x 12 behind it, plus a 1.4 px core; pick from 8 pre-rendered disc sprites from hard to soft. Alpha = 0.9 / (1 + CoC/8), fade in over the farthest 15% of depth and out over the nearest 8% so wraps are invisible. 14% of points take the accent colour. Dim points by 70% inside an ellipse behind the centred headline (display 92 ref px, weight 620, tracking -0.03 em). Sort far to near before drawing.`,
};

export function create(k, p) {
  const { m } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const r = m.rng(71);
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 92, square: 84, tall: 80 }), weight: 620, tracking: -0.03 };
  const lines = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.62, square: 0.8, tall: 0.86 }));
  const pts = [];
  for (let i = 0; i < p.count; i++) {
    let x, y;
    do { x = (r() - 0.5) * 2.4 * Math.max(1, k.aspect); y = (r() - 0.5) * 2.4 * Math.max(1, 1 / k.aspect); } while (x * x + y * y < 0.06);
    pts.push({ x, y, z0: r(), tint: r() < 0.14, s: 0.7 + r() * 0.6 });
  }
  // disc sprites: 8 softness levels x 2 colours, at a fixed reference radius
  const LEVELS = 8, R = 48;
  const mk = (col, soft) => {
    const s = R * 2 + 4;
    const cv = document.createElement('canvas'); cv.width = cv.height = s;
    const gg = cv.getContext('2d');
    const grd = gg.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, R);
    const edge = 1 - 0.85 * soft;
    grd.addColorStop(0, col);
    grd.addColorStop(Math.max(0.02, edge * 0.9), k.color.alpha(col, 1 - soft * 0.35));
    if (soft < 0.95) grd.addColorStop(Math.min(0.99, edge + 0.03), k.color.alpha(col, (1 - soft) * 0.25));
    grd.addColorStop(1, k.color.alpha(col, 0));
    gg.fillStyle = grd; gg.fillRect(0, 0, s, s);
    return cv;
  };
  const fgCol = k.isDark ? k.color.mix(c.fg, c.accent, 0.12) : k.color.mix(c.fg, c.accent, 0.2);
  const sprites = [fgCol, c.accent].map((col) => Array.from({ length: LEVELS }, (_, i) => mk(col, i / (LEVELS - 1))));
  const wash = k.layer('depthfield-bg');
  {
    const gg = k.ctx(wash);
    gg.fillStyle = c.bg; gg.fillRect(0, 0, k.W, k.H);
    const grd = gg.createRadialGradient(k.cx, k.cy, 0, k.cx, k.cy, Math.hypot(k.W, k.H) * 0.55);
    grd.addColorStop(0, k.color.mix(c.bg, c.accent, k.isDark ? 0.08 : 0.035));
    grd.addColorStop(1, k.color.mix(c.bg, '#000000', k.isDark ? 0.3 : 0.03));
    gg.fillStyle = grd; gg.fillRect(0, 0, k.W, k.H);
  }
  const focal = 1.1 * k.vmin;
  const near = 0.12, far = 3.2;
  const order = new Int32Array(pts.length);
  const zs = new Float32Array(pts.length);
  const ex = k.W * k.pick({ wide: 0.34, square: 0.42, tall: 0.46 }), ey = k.H * k.pick({ wide: 0.17, square: 0.14, tall: 0.1 });
  return {
    draw(g, t) {
      const ph = t / D;
      g.drawImage(wash, 0, 0);
      for (let i = 0; i < pts.length; i++) { zs[i] = m.fract(pts[i].z0 - ph); order[i] = i; }
      const idx = Array.from(order).sort((a, b) => zs[b] - zs[a]);
      for (const i of idx) {
        const q = pts[i], d = zs[i];
        const z = near + d * (far - near);
        const [sx, sy, sc] = m.project(q.x, q.y, z, k.cx, k.cy, focal, 0);
        const coc = (d < p.focus ? (p.focus - d) * 110 : (d - p.focus) * 12) * k.u;
        const core = (1.1 + q.s * 0.5) * k.u * Math.min(2.2, Math.max(0.6, sc / (focal / 1.2)));
        const rad = core + coc;
        if (sx < -rad || sy < -rad || sx > k.W + rad || sy > k.H + rad) continue;
        let a = 0.9 / (1 + coc / (8 * k.u));
        a *= m.smoothstep(1, 0.85, d) * m.smoothstep(0, 0.08, d);
        if (p.title) {
          const dx = (sx - k.cx) / ex, dy = (sy - k.cy) / ey;
          a *= 0.3 + 0.7 * m.smoothstep(0.6, 1.5, dx * dx + dy * dy);
        }
        if (!k.isDark) a *= 0.7;
        if (a < 0.008) continue;
        const lvl = Math.min(LEVELS - 1, Math.round((coc / rad) * (LEVELS - 1) * 1.15));
        const spr = sprites[q.tint ? 1 : 0][lvl];
        g.globalAlpha = Math.min(1, a);
        const s = (rad / R) * spr.width;
        g.drawImage(spr, sx - s / 2, sy - s / 2, s, s);
      }
      g.globalAlpha = 1;
      if (p.title) {
        const lh = to.size * 1.08 * k.u;
        const top = k.cy - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...to, align: 'center', baseline: 'middle', qaGroup: str }));
      }
    },
  };
}
