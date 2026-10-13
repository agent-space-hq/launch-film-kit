// An axonometric field of square columns. A ripple runs outward from the centre and
// lifts the columns into a travelling wave whose crests pick up the accent; the
// wave then calms from the centre out, the gaps between columns close, and the
// field resolves into one flat plane. A soft light ring sweeps across it while the
// mark rises out of the plane surface as a solid slab (its depth shows as top faces
// under this view). Short fade exit.
export const meta = {
  id: 'hero3d.cube-wave',
  name: 'Cube Wave',
  category: 'hero3d',
  duration: 5.4,
  summary: 'An isometric grid of columns rises in a ripple from the centre, rolls as a travelling wave with accent crests, calms from the centre outward into a seamless flat plane, then the mark rises out of the plane as a solid slab under a sweeping light ring; ends with a short drop-and-fade exit.',
  bestFor: ['platform / foundation story', 'brand reveal', 'section opener'],
  slots: [],
  params: {
    grid: { default: 22, min: 12, max: 30, label: 'Columns per side' },
    amp: { default: 1.7, min: 0.6, max: 3, label: 'Wave height (cells)' },
    mark: { default: true, label: 'Raise the mark from the plane' },
  },
  sfx: [{ t: 0.05, type: 'swell', dur: 1.2, gain: 0.4 }, { t: 2.7, type: 'whoosh', dur: 0.9, gain: 0.25 }, { t: 3.75, type: 'shimmer', gain: 0.45 }],
  prompt: `Lay a 22 x 22 grid of square columns on an axonometric floor (vertical squash 0.5) spanning 62% of the frame width. Paint back to front by i + j, three neutral face shades. Height = amplitude x (0.5 + 0.5 sin(2 pi (2.2 d - 0.62 t))), d = distance from centre in grid widths. Amplitude rises from 100 + 500 d ms over 900 ms (outExpo) and settles from 2500 + 700 d ms over 1 s (inOutCubic), so the field calms centre-out; only crest tops take the accent. Gaps close from 7% to 0 over 3.0-4.0 s; a soft key light falls across the plane. At 3.7 s a light ring sweeps outward (outQuint, 1.1 s) while the mark, 34% of frame height, rises out of the surface (outExpo, 1 s, clipped at the floor line) as a slab showing top faces. Exit over the last 450 ms: drop 3% and fade (inCubic).`,
};

export function create(k, p) {
  const { m, ease, color: C } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const dark = k.isDark;
  const N = Math.round(p.grid);
  const squash = k.pick({ wide: 0.5, square: 0.56, tall: 0.62 });
  const span = k.pick({ wide: 0.62 * k.W, square: 0.84 * k.W, tall: 0.94 * k.W });
  const cw = span / (2 * N); // screen half-width of one cell
  const ch = cw * squash;
  const markPx = k.pick({ wide: 0.34, square: 0.28, tall: 0.22 }) * k.H;
  const hz = cw * 1.25; // screen px per unit of height (cell units)
  const base = 0.35; // slab thickness in cell units
  const amp = p.amp;
  const ox = k.cx;
  // centre the diamond plus the average wave height
  // centre the final composition (mark top to plane bottom) in the frame
  const oy = k.cy - N * ch + (p.mark ? markPx * 0.5 : amp * hz * 0.35);
  const P = (x, y, z) => [ox + (x - y) * cw, oy + (x + y) * ch - z * hz];
  const mid = N / 2;
  // per-cell precompute: distance from the centre (in grid widths)
  const cells = [];
  for (let d = 0; d <= 2 * N - 2; d++) {
    for (let i = Math.max(0, d - N + 1); i <= Math.min(N - 1, d); i++) {
      const j = d - i;
      const dist = Math.hypot(i + 0.5 - mid, j + 0.5 - mid) / N;
      cells.push({ i, j, dist });
    }
  }
  // neutral shading that brightens with height; only the top of each crest takes the accent
  const top0 = dark ? C.mix(c.bg, c.fg, 0.11) : C.mix(c.surface || '#ffffff', '#ffffff', 0.5);
  const left0 = dark ? C.mix(c.bg, c.fg, 0.06) : C.mix(c.bg, c.fg, 0.07);
  const right0 = dark ? C.mix(c.bg, c.fg, 0.028) : C.mix(c.bg, c.fg, 0.14);
  const topUp = dark ? C.mix(c.bg, c.fg, 0.24) : '#ffffff';
  const topHi = dark ? C.mix(c.accent, '#ffffff', 0.06) : C.mix(c.accent, '#ffffff', 0.1);
  const leftHi = dark ? C.mix(c.accent, c.bg, 0.5) : C.mix(c.accent, c.fg, 0.12);
  const rightHi = dark ? C.mix(c.accent, c.bg, 0.7) : C.mix(c.accent, c.fg, 0.32);
  // colour ramps over normalised height, sampled once so draw() never mixes colours per cell
  const STEPS = 32;
  const crest = (f) => m.smoothstep(0.6, 1, f);
  const ramp = (lo, up, hi, upAmt, hiAmt) => Array.from({ length: STEPS + 1 }, (_, q) => {
    const f = q / STEPS;
    return C.mix(C.mix(lo, up, f * upAmt), hi, crest(f) * hiAmt);
  });
  const R = {
    top: ramp(top0, topUp, topHi, dark ? 0.7 : 0, dark ? 0.9 : 0.78),
    left: ramp(left0, C.mix(left0, c.fg, dark ? 0.08 : 0), leftHi, 1, 0.7),
    right: ramp(right0, right0, rightHi, 0, 0.6),
  };
  const pick = (arr, f) => arr[Math.max(0, Math.min(STEPS, Math.round(f * STEPS)))];
  const ringC = dark ? '#ffffff' : c.accent;
  // side colours for the extruded mark (per logo path)
  const markSide = k.logo.paths.map((pp) => {
    const col = pp.fill === 'accent' || pp.fill === 'accent2' ? c.accent : pp.fill === 'bg' ? c.bg : !pp.fill || pp.fill === 'fg' ? c.fg : pp.fill;
    return dark ? C.mix(col, c.bg, 0.55) : C.shade(col, -0.16);
  });

  function quad(g, a, b, cc, d, fill) {
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(cc[0], cc[1]); g.lineTo(d[0], d[1]); g.closePath();
    g.fillStyle = fill; g.fill();
    g.strokeStyle = fill; g.lineWidth = 0.6; g.stroke(); // hides AA seams between faces
  }

  return {
    draw(g, t) {
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const vis = 1 - exit;
      if (vis <= 0) return;
      const gap = 0.07 * (1 - ease.inOutCubic(m.seg(t, 3.0, 1.0)));
      const ring = ease.outQuint(m.seg(t, 3.7, 1.1));
      const ringR = ring * N * 0.95;
      g.save();
      g.globalAlpha = vis;
      g.translate(0, exit * 0.03 * k.H);
      // ambience: a broad accent pool on dark, a soft contact shadow on light
      const cen = P(mid, mid, 0);
      g.save();
      g.translate(cen[0], cen[1] + (dark ? -amp * hz * 0.3 : base * hz)); g.scale(1, squash * 1.05);
      const gr = N * cw * (dark ? 1.25 : 1.05);
      const pool = g.createRadialGradient(0, 0, 0, 0, 0, gr);
      if (dark) { pool.addColorStop(0, C.alpha(c.accent, 0.16)); pool.addColorStop(1, C.alpha(c.accent, 0)); }
      else { pool.addColorStop(0, 'rgba(20,30,60,0.12)'); pool.addColorStop(0.7, 'rgba(20,30,60,0.05)'); pool.addColorStop(1, 'rgba(20,30,60,0)'); }
      g.fillStyle = pool; g.fillRect(-gr, -gr, gr * 2, gr * 2);
      g.restore();

      for (const cell of cells) {
        const { i, j, dist } = cell;
        const rise = ease.outExpo(m.seg(t, 0.1 + dist * 0.5, 0.9));
        const settle = 1 - ease.inOutCubic(m.seg(t, 2.5 + dist * 0.7, 1.0));
        const A = amp * rise * settle;
        const wave = 0.5 + 0.5 * Math.sin(m.TAU * (dist * 2.2 - t * 0.62));
        const h = A * wave;
        const top = base + h;
        const hn = Math.min(1, h / amp);
        // light ring across the settled plane
        const rd = Math.hypot(i + 0.5 - mid, j + 0.5 - mid);
        const band = ring > 0 && ring < 1 ? Math.exp(-(((rd - ringR) / 1.6) ** 2)) * (1 - ring) : 0;
        const x0 = i + gap, x1 = i + 1 - gap, y0 = j + gap, y1 = j + 1 - gap;
        const t00 = P(x0, y0, top), t10 = P(x1, y0, top), t11 = P(x1, y1, top), t01 = P(x0, y1, top);
        const b10 = P(x1, y0, 0), b11 = P(x1, y1, 0), b01 = P(x0, y1, 0);
        quad(g, t01, t11, b11, b01, pick(R.left, hn));
        quad(g, t11, t10, b10, b11, pick(R.right, hn));
        quad(g, t00, t10, t11, t01, pick(R.top, Math.max(hn, band * 0.55)));
      }

      // once the field is flat: a soft key light falling across the plane from its back corner
      const flat = ease.inOutCubic(m.seg(t, 3.2, 1.0));
      if (flat > 0) {
        const ctr = P(mid, mid, base);
        g.save();
        g.transform(cw, ch, -cw, ch, ctr[0], ctr[1]);
        g.beginPath(); g.rect(-mid, -mid, N, N); g.clip();
        const kl = g.createLinearGradient(-mid, -mid, mid * 0.6, mid * 0.6);
        kl.addColorStop(0, dark ? `rgba(255,255,255,${(0.07 * flat).toFixed(3)})` : 'rgba(255,255,255,0)');
        kl.addColorStop(1, dark ? 'rgba(255,255,255,0)' : `rgba(20,30,60,${(0.035 * flat).toFixed(3)})`);
        g.fillStyle = kl; g.fillRect(-mid, -mid, N, N);
        g.restore();
      }
      // light ring sweeping across the settled plane (clipped to the plane)
      if (ring > 0 && ring < 1) {
        const ctr = P(mid, mid, base);
        g.save();
        g.transform(cw, ch, -cw, ch, ctr[0], ctr[1]);
        g.beginPath(); g.rect(-mid, -mid, N, N); g.clip();
        g.beginPath(); g.arc(0, 0, Math.max(0.001, ringR), 0, m.TAU);
        g.strokeStyle = C.alpha(ringC, (dark ? 0.35 : 0.3) * (1 - ring));
        g.lineWidth = 0.18; g.stroke();
        g.restore();
      }
      // the mark rises out of the plane through its surface and stands at the centre as a
      // solid slab. Depth runs away from the camera, so under this view its top faces show.
      if (p.mark) {
        const rise = ease.outExpo(m.seg(t, 3.75, 1.0));
        const ma = ease.outCubic(m.seg(t, 3.75, 0.25));
        if (ma > 0) {
          const baseC = P(mid, mid, base);
          const lift = (1 - rise) * markPx * 1.02;
          const depth = markPx * 0.12 * squash; // screen offset of the back face
          // contact shadow on the plane, growing as the mark rises
          g.save();
          g.translate(baseC[0], baseC[1]); g.scale(1, squash);
          const sr = markPx * k.logo.aspect * 0.62;
          const sg = g.createRadialGradient(0, 0, 0, 0, 0, sr);
          sg.addColorStop(0, dark ? `rgba(0,0,0,${(0.55 * rise).toFixed(3)})` : `rgba(20,30,60,${(0.2 * rise).toFixed(3)})`);
          sg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = sg; g.fillRect(-sr, -sr, sr * 2, sr * 2);
          g.restore();
          if (dark) k.draw.glow(g, baseC[0], baseC[1] - markPx * 0.5, markPx * 1.3, c.accent, 0.12 * rise);
          // clip at the floor line: the part still below the surface stays hidden
          g.save();
          g.beginPath(); g.rect(0, 0, k.W, baseC[1]); g.clip();
          const my = baseC[1] - markPx * 0.5 + lift;
          const layers = Math.max(2, Math.ceil(depth / Math.max(0.75, 0.8 * k.u)));
          for (let l = layers; l >= 1; l--) k.logo.draw(g, baseC[0], my - (depth * l) / layers, markPx, { colors: markSide, alpha: ma });
          k.logo.draw(g, baseC[0], my, markPx, { alpha: ma });
          g.restore();
        }
      }
      g.restore();
    },
  };
}
