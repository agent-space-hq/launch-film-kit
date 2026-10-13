// The mark is cut into square tiles on a hidden grid. Tiles fly in from scattered,
// rotated positions and snap home in stepped diagonal waves; the grid guides fade,
// the mark glides left and the wordmark glyphs snap in on the same beat.
export const meta = {
  id: 'logo.grid-snap',
  name: 'Grid Snap',
  category: 'logo',
  duration: 4.4,
  summary: 'Square tiles cut from the mark fly in from scattered positions and snap into place in stepped diagonal waves; the wordmark snaps in beside it and the lockup holds.',
  bestFor: ['opening ident', 'tech brand reveal', 'end card'],
  slots: [],
  params: {
    rows: { default: 13, min: 6, max: 24, label: 'Grid rows across the mark' },
    steps: { default: 7, min: 3, max: 12, label: 'Snap steps' },
    wordmark: { default: true, label: 'Show wordmark' },
  },
  sfx: [{ t: 0.4, type: 'tick', gain: 0.5 }, { t: 0.65, type: 'tick', gain: 0.5 }, { t: 0.9, type: 'tick', gain: 0.5 }, { t: 1.15, type: 'tick', gain: 0.55 }, { t: 1.55, type: 'shimmer', gain: 0.4 }, { t: 1.8, type: 'whoosh', dur: 0.45, gain: 0.3 }],
  prompt: `Render the logo (about 23% of frame height) to an offscreen bitmap and cut it into a square grid of 13 rows; keep only cells containing ink. Each tile starts scattered (random direction, 25-60% of the short side away, rotated up to 70 degrees, scaled 0.55-1.25) and flies home with outExpo over 650 ms. Group tiles into 7 diagonal bands from bottom-left to top-right; band n starts at 300 + n x 85 ms, so tiles land in audible steps. In flight each tile shows a hairline border and faint plate that fade as it lands, with a 300 ms additive brightness flash of its own ink on landing (dark brands). Faint grid guide lines around the mark fade in then out. At 1800 ms the finished mark glides left (emphasized, 850 ms) and the brand name glyphs drop in from alternating 60% cap offsets (outExpo 600 ms, 55 ms stagger). Hold the lockup 1.5 s.`,
};

function lockup(k, withWord) {
  const name = withWord ? k.brand.name || '' : '';
  let markH = k.pick({ wide: 250, square: 230, tall: 210 }) * k.u;
  const wo = { size: k.pick({ wide: 150, square: 126, tall: 112 }), weight: 620, tracking: -0.035 };
  let L = name ? k.text.layout(name, wo) : null;
  let gap = markH * 0.17;
  let total = markH * k.logo.aspect + (L ? gap + L.width : 0);
  const maxW = k.safe.w * 0.86;
  if (total > maxW) {
    const f = maxW / total;
    markH *= f; gap *= f; wo.size *= f;
    L = k.text.layout(name, wo);
    total = markH * k.logo.aspect + gap + L.width;
  }
  const markW = markH * k.logo.aspect;
  return { markH, markW, gap, wo, L, total, markX: k.cx - total / 2 + markW / 2, wordX: k.cx - total / 2 + markW + gap };
}

export function create(k, p) {
  const { ease, m } = k;
  const lk = lockup(k, p.wordmark);
  const { markH, markW } = lk;
  const cell = markH / p.rows;
  const cols = Math.ceil(markW / cell);
  const gw = cols * cell, gh = p.rows * cell;
  // offscreen bitmap of the mark on the grid area (grid centred on the mark)
  const can = document.createElement('canvas');
  can.width = Math.ceil(gw); can.height = Math.ceil(gh);
  const cg = can.getContext('2d', { willReadFrequently: true });
  k.logo.draw(cg, gw / 2, gh / 2, markH);
  const data = cg.getImageData(0, 0, can.width, can.height).data;
  const r = m.rng(23);
  const tiles = [];
  for (let row = 0; row < p.rows; row++) for (let col = 0; col < cols; col++) {
    let ink = 0;
    const x0 = Math.floor(col * cell), y0 = Math.floor(row * cell), x1 = Math.min(can.width, Math.ceil((col + 1) * cell)), y1 = Math.min(can.height, Math.ceil((row + 1) * cell));
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) if (data[(y * can.width + x) * 4 + 3] > 24) ink++;
    if (!ink) continue;
    const ang = r() * m.TAU, dist = (0.25 + r() * 0.35) * k.vmin;
    tiles.push({
      col, row,
      // local centre relative to the mark centre
      lx: (col + 0.5) * cell - gw / 2, ly: (row + 0.5) * cell - gh / 2,
      sx: Math.cos(ang) * dist * (k.isWide ? 1.4 : 1), sy: Math.sin(ang) * dist,
      rot: (r() - 0.5) * 2 * 1.22, sc: 0.55 + r() * 0.7,
      diag: col / Math.max(1, cols - 1) + (1 - row / Math.max(1, p.rows - 1)),
    });
  }
  const maxDiag = Math.max(...tiles.map((t) => t.diag));
  tiles.forEach((t) => { t.step = Math.min(p.steps - 1, Math.floor((t.diag / (maxDiag + 1e-6)) * p.steps)); t.t0 = 0.3 + t.step * 0.085; });
  const allIn = Math.max(...tiles.map((t) => t.t0)) + 0.65;
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const slide = lk.L ? ease.emphasized(m.seg(t, 1.8, 0.85)) : 0;
      const mcx = m.lerp(k.cx, lk.markX, slide), mcy = k.cy;

      // guide grid (hairlines around the mark), fades in then out
      const guide = Math.min(ease.outCubic(m.seg(t, 0.05, 0.5)), 1 - ease.inOutCubic(m.seg(t, 1.25, 0.6)));
      if (guide > 0) {
        g.save();
        g.lineWidth = Math.max(1, k.u);
        const ext = 3;
        for (let i = -ext; i <= cols + ext; i++) {
          const x = mcx - gw / 2 + i * cell;
          const fall = 1 - Math.min(1, Math.max(0, -i, i - cols) / (ext + 0.5));
          g.strokeStyle = k.color.alpha(c.fg, (k.isDark ? 0.07 : 0.09) * guide * fall);
          g.beginPath(); g.moveTo(x, mcy - gh / 2 - ext * cell); g.lineTo(x, mcy + gh / 2 + ext * cell); g.stroke();
        }
        for (let j = -ext; j <= p.rows + ext; j++) {
          const y = mcy - gh / 2 + j * cell;
          const fall = 1 - Math.min(1, Math.max(0, -j, j - p.rows) / (ext + 0.5));
          g.strokeStyle = k.color.alpha(c.fg, (k.isDark ? 0.07 : 0.09) * guide * fall);
          g.beginPath(); g.moveTo(mcx - gw / 2 - ext * cell, y); g.lineTo(mcx + gw / 2 + ext * cell, y); g.stroke();
        }
        g.restore();
      }

      if (t >= allIn) {
        // all home: one seamless bitmap draw (no tile seams)
        g.drawImage(can, mcx - gw / 2, mcy - gh / 2);
      } else {
        for (const q of tiles) {
          const a = m.seg(t, q.t0 - 0.12, 0.18);
          if (a <= 0) continue;
          const pr = ease.outExpo(m.seg(t, q.t0, 0.65));
          const x = mcx + q.lx + q.sx * (1 - pr), y = mcy + q.ly + q.sy * (1 - pr);
          const s = m.lerp(q.sc, 1, pr), rot = q.rot * (1 - pr);
          g.save();
          g.translate(x, y); g.rotate(rot); g.scale(s, s);
          g.globalAlpha = a;
          const plate = 1 - m.seg(pr, 0.7, 0.3);
          if (plate > 0) {
            g.fillStyle = k.color.alpha(c.fg, (k.isDark ? 0.05 : 0.04) * plate);
            g.fillRect(-cell / 2, -cell / 2, cell, cell);
          }
          // overdraw by a hair so landed neighbours do not show seams
          const o = 0.35;
          g.drawImage(can, q.col * cell - o, q.row * cell - o, cell + o * 2, cell + o * 2, -cell / 2 - o, -cell / 2 - o, cell + o * 2, cell + o * 2);
          if (plate > 0) {
            g.strokeStyle = k.color.alpha(c.fg, (k.isDark ? 0.28 : 0.22) * plate);
            g.lineWidth = Math.max(1, k.u) / s;
            g.strokeRect(-cell / 2, -cell / 2, cell, cell);
          }
          g.restore();
        }
      }
      // landing flash: the tile's own ink brightens additively, then decays (dark only)
      if (k.isDark) {
        g.save();
        g.globalCompositeOperation = 'lighter';
        for (const q of tiles) {
          const f = m.seg(t, q.t0 + 0.4, 0.32);
          if (f <= 0 || f >= 1) continue;
          g.globalAlpha = 0.55 * (1 - ease.outCubic(f));
          g.drawImage(can, q.col * cell, q.row * cell, cell, cell, mcx + q.lx - cell / 2, mcy + q.ly - cell / 2, cell, cell);
        }
        g.restore();
      }

      // wordmark glyphs snap in on the same beat
      if (lk.L && t > 1.95) {
        k.text.glyphs(g, k.brand.name, lk.wordX, mcy, { ...lk.wo, baseline: 'middle' }, (i) => {
          const e = ease.outExpo(m.seg(t, 2.0 + i * 0.055, 0.6));
          const dir = i % 2 ? -1 : 1;
          return { y: (1 - e) * lk.L.cap * 0.6 * dir, a: m.seg(t, 2.0 + i * 0.055, 0.12) };
        });
      }
    },
  };
}
