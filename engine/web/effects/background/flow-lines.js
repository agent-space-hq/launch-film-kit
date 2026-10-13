// Combed silk: about a thousand thin streamlines traced through a smooth noise flow
// field. The field sways on a closed loop and a light swings slowly across it; each
// stretch of line is lit by how its direction lines up with the light (anisotropic
// sheen, like brushed silk or satin), so glossy bands roll across the weave.
// Strokes are batched into a few alpha buckets to stay fast.
export const meta = {
  id: 'background.flow-lines',
  name: 'Flow Lines',
  category: 'background',
  duration: 10,
  loop: true,
  ownsBackground: true,
  summary: 'Fine streamlines follow a curling flow field like combed silk; an anisotropic sheen rolls across them as the weave sways; seamless loop with the headline on top.',
  bestFor: ['backdrop', 'title card', 'premium texture'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    lines: { default: 1100, min: 300, max: 2000, label: 'Streamlines' },
    angle: { default: -0.28, min: -1.5, max: 1.5, label: 'Comb direction (rad)' },
  },
  prompt: `Seamless 10000 ms loop. Build a static flow field: angle = comb direction (-16 degrees) + 1.4 x fbm noise at 0.9 cycles per short side. Seed about 1100 points on a jittered grid and trace each forward and back for 48 steps of 1.1% of the short side to get streamlines 50% of the frame long. Each frame, displace every point by a closed-loop sway (two sines of position plus phase, amplitude 1.4% of the short side). Split each line into chunks of 6 points; brightness = 0.10 + 0.9 x cos^16(chunk angle - light angle), where the light angle swings ±0.32 rad once per loop. Quantise into 10 alpha buckets and stroke each bucket as one path with 0.9 ref px lines, additive on dark brands; highlights mix 45% accent. Fade lines at their ends and inside an ellipse behind the centred static headline (display 92 ref px, weight 620).`,
};

export function create(k, p) {
  const { m } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const noise = m.makeNoise(23);
  const r = m.rng(5);
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 92, square: 84, tall: 80 }), weight: 620, tracking: -0.03 };
  const tl = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.62, square: 0.8, tall: 0.86 }));
  const V = k.vmin;
  const fieldAngle = (x, y) => p.angle + 1.4 * noise.fbm(x * 0.9 + 3.1, y * 0.9 + 1.7, 0.5, 3);
  // seeds on a jittered grid across the frame (in short-side units, centred)
  const hw = k.W / V / 2 + 0.15, hh = k.H / V / 2 + 0.15;
  const n = p.lines;
  const cols = Math.round(Math.sqrt((n * hw) / hh)), rows = Math.ceil(n / cols);
  const STEP = 0.011, HALF = 24;
  const lines = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const sx = -hw + ((i + r()) / cols) * hw * 2, sy = -hh + ((j + r()) / rows) * hh * 2;
    const fwd = [], back = [];
    let x = sx, y = sy;
    for (let s = 0; s < HALF; s++) { const a = fieldAngle(x, y); x += Math.cos(a) * STEP; y += Math.sin(a) * STEP; fwd.push(x, y); }
    x = sx; y = sy;
    for (let s = 0; s < HALF; s++) { const a = fieldAngle(x, y); x -= Math.cos(a) * STEP; y -= Math.sin(a) * STEP; back.push(x, y); }
    const pts = [];
    for (let s = back.length - 2; s >= 0; s -= 2) pts.push(back[s], back[s + 1]);
    pts.push(sx, sy);
    for (let s = 0; s < fwd.length; s += 2) pts.push(fwd[s], fwd[s + 1]);
    lines.push({ pts: new Float32Array(pts), w: 0.5 + r() * 0.5 });
  }
  const BUCKETS = 10, CH = 6;
  const hiCol = k.color.mix(c.fg, c.accent, 0.45);
  const baseCol = k.isDark ? k.color.mix(c.fg, c.accent, 0.2) : k.color.mix(c.fg, c.accent, 0.25);
  const bucketCol = Array.from({ length: BUCKETS }, (_, b) => k.color.mix(baseCol, hiCol, b / (BUCKETS - 1)));
  const wash = k.layer('flowlines-bg');
  {
    const gg = k.ctx(wash);
    gg.fillStyle = c.bg; gg.fillRect(0, 0, k.W, k.H);
    const grd = gg.createRadialGradient(k.cx, k.cy, 0, k.cx, k.cy, Math.hypot(k.W, k.H) * 0.6);
    grd.addColorStop(0, k.color.mix(c.bg, c.accent, k.isDark ? 0.05 : 0.025));
    grd.addColorStop(1, c.bg);
    gg.fillStyle = grd; gg.fillRect(0, 0, k.W, k.H);
  }
  const ex = k.pick({ wide: 0.62, square: 0.5, tall: 0.46 }) * (k.W / V), ey = k.pick({ wide: 0.22, square: 0.2, tall: 0.16 }) * (k.H / V);
  const paths = Array.from({ length: BUCKETS }, () => null);
  const bx = new Float32Array(2 * HALF + 1), by = new Float32Array(2 * HALF + 1);
  return {
    draw(g, t) {
      const ph = t / D;
      const A = ph * m.TAU;
      g.drawImage(wash, 0, 0);
      const la = p.angle + 0.32 * Math.sin(A);
      for (let b = 0; b < BUCKETS; b++) paths[b] = new Path2D();
      const amp = 0.014;
      for (const L of lines) {
        const P = L.pts, np = P.length / 2;
        for (let i = 0; i < np; i++) {
          const x = P[i * 2], y = P[i * 2 + 1];
          bx[i] = x + amp * Math.sin(A + y * 2.1 + x * 0.7);
          by[i] = y + amp * Math.cos(A + x * 1.7 - y * 0.6);
        }
        for (let s = 0; s < np - 1; s += CH - 1) {
          const e = Math.min(np - 1, s + CH - 1);
          const ang = Math.atan2(by[e] - by[s], bx[e] - bx[s]);
          const cs = Math.cos(ang - la);
          let br = 0.1 + 0.9 * Math.pow(cs * cs, 8);
          // fade line ends and the area behind the headline
          const mid = (s + e) / 2;
          const endFade = Math.min(1, (Math.min(mid, np - 1 - mid) / np) * 5);
          const mx = (bx[s] + bx[e]) / 2, my = (by[s] + by[e]) / 2;
          let calm = 1;
          if (p.title) { const dx = mx / ex, dy = my / ey; calm = 0.22 + 0.78 * m.smoothstep(0.55, 1.6, dx * dx + dy * dy); }
          br *= endFade * calm * L.w;
          const bi = Math.min(BUCKETS - 1, Math.floor(br * BUCKETS));
          if (br < 0.03) continue;
          const path = paths[bi];
          path.moveTo(k.cx + bx[s] * V, k.cy + by[s] * V);
          for (let i = s + 1; i <= e; i++) path.lineTo(k.cx + bx[i] * V, k.cy + by[i] * V);
        }
      }
      g.save();
      g.lineWidth = 0.9 * k.u; g.lineCap = 'round'; g.lineJoin = 'round';
      if (k.isDark) g.globalCompositeOperation = 'lighter';
      for (let b = 0; b < BUCKETS; b++) {
        g.globalAlpha = (k.isDark ? 0.07 : 0.1) + ((b + 0.5) / BUCKETS) * (k.isDark ? 0.5 : 0.45);
        g.strokeStyle = bucketCol[b];
        g.stroke(paths[b]);
      }
      g.restore();
      if (p.title) {
        const lh = to.size * 1.08 * k.u;
        const top = k.cy - ((tl.length - 1) * lh) / 2;
        tl.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...to, align: 'center', baseline: 'middle', qaGroup: str }));
      }
    },
  };
}
