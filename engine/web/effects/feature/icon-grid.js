// A grid of feature tiles. Each tile fades up, then its line icon draws itself
// stroke by stroke; as the stroke closes, the tile warms to the accent and the label
// rises beneath. Staggered in reading order. Ends held on the full grid.
export const meta = {
  id: 'feature.icon-grid',
  name: 'Icon Grid',
  category: 'feature',
  duration: 4.4,
  summary: 'Four to six line icons draw on with a stroke animation in a staggered grid, each tile warming to the accent, labels beneath; holds on the grid.',
  bestFor: ['feature list', 'capabilities', 'what is included'],
  slots: ['features'],
  params: {
    stagger: { default: 0.11, min: 0.05, max: 0.2, label: 'Tile stagger (s)' },
  },
  sfx: [{ t: 0.3, type: 'shimmer', gain: 0.3 }],
  prompt: `Lay out 4-6 tiles (one per copy.features entry, max 6): one row in 16:9, two columns in portrait, 260 px rounded squares with 52 px radius and a hairline. Pick an original line icon per feature by keyword. Tiles enter in reading order 110 ms apart: fade and scale from 92% over 500 ms (outQuint). 200 ms later the icon draws on through a dash offset over 800 ms (inOutCubic) at 112 px, stroke 1.6 units in the foreground colour; as it completes, the icon recolours to the accent, the tile fill warms to a 14% accent tint and a soft glow blooms on dark brands. The 42 px label rises 12 px and fades in 450 ms after the icon starts. Hold the finished grid; nothing loops.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs', 'Approvals']).slice(0, 6);
  const pickIcon = (s, i) => {
    const w = s.toLowerCase();
    const table = [[/road|plan|map/, 'layers'], [/release|ship|launch|deploy/, 'rocket'], [/change|log|note|doc/, 'file'], [/approv|team|review|people/, 'users'], [/fast|speed|instant/, 'bolt'], [/secur|safe|privacy/, 'shield'], [/global|world|region/, 'globe'], [/chart|metric|analytic/, 'chart-line'], [/chat|message/, 'chat'], [/time|schedul|calendar/, 'calendar']];
    for (const [re, ic] of table) if (re.test(w)) return ic;
    return ['sparkle', 'grid', 'target', 'link', 'cloud', 'gear'][i % 6];
  };
  const icons = feats.map(pickIcon);
  const n = feats.length;
  const wide = !k.isPortrait;
  const cols = wide ? Math.min(n, n > 4 ? 3 : 4) : 2;
  const rows = Math.ceil(n / cols);
  const tile = Math.min(k.pick({ wide: n > 4 ? 210 : 260, square: 230, tall: 250 }) * U, (k.safe.w / cols) * 0.62);
  const cellW = Math.min(k.safe.w / cols, tile * 2.0);
  const labS = { role: 'display', size: k.pick({ wide: 42, square: 38, tall: 42 }), weight: 600, tracking: -0.02 };
  const labSize = Math.min(...feats.map((f) => k.text.fit(f, labS, cellW * 0.8, 24)));
  const cellH = tile + 130 * U + (rows > 1 ? 60 * U : 0);
  const gridH = rows * cellH - (rows > 1 ? 60 * U : 0);
  const cells = feats.map((f, i) => {
    const r = Math.floor(i / cols), cI = i % cols;
    const inRow = Math.min(cols, n - r * cols);
    const x = k.cx + (cI - (inRow - 1) / 2) * cellW;
    const y = k.cy - gridH / 2 + r * cellH + tile / 2;
    return { x, y };
  });

  // Stroke draw-on: every subpath reveals from its start via dash offset (smooth, no dotted look).
  const paths = new Map();
  function drawOn(g, name, cx, cy, size, col, pr) {
    let P2 = paths.get(name);
    if (!P2) { P2 = new Path2D(k.draw.ICONS[name] || k.draw.ICONS.sparkle); paths.set(name, P2); }
    const sc = size / 24, L = 90;
    g.save();
    g.translate(cx - size / 2, cy - size / 2); g.scale(sc, sc);
    if (pr < 1) { g.setLineDash([L, L]); g.lineDashOffset = L * (1 - pr); }
    g.strokeStyle = col; g.lineWidth = 1.6; g.lineCap = 'round'; g.lineJoin = 'round';
    g.stroke(P2);
    g.restore();
  }

  return {
    draw(g, t) {
      cells.forEach((cl, i) => {
        const t0 = 0.15 + i * p.stagger;
        const a = ease.outQuint(m.seg(t, t0, 0.5));
        if (a <= 0) return;
        const draw = ease.inOutCubic(m.seg(t, t0 + 0.2, 0.8));
        const warm = ease.outCubic(m.seg(t, t0 + 0.75, 0.5));
        const s = 0.92 + 0.08 * a;
        g.save();
        g.globalAlpha *= a;
        g.translate(cl.x, cl.y); g.scale(s, s); g.translate(-cl.x, -cl.y);
        if (dark && warm > 0) k.draw.glow(g, cl.x, cl.y, tile * 1.1, c.accent, 0.22 * warm);
        const x0 = cl.x - tile / 2, y0 = cl.y - tile / 2;
        const base = dark ? C.mix(c.bg, c.fg, 0.06) : '#ffffff';
        const fill = C.mix(base, c.accent, (dark ? 0.16 : 0.1) * warm);
        g.save();
        if (!dark) { g.shadowColor = 'rgba(20,30,60,0.10)'; g.shadowBlur = 36 * U; g.shadowOffsetY = 14 * U; }
        k.draw.squirclePath(g, x0, y0, tile, tile, 56 * U);
        g.fillStyle = fill; g.fill();
        g.restore();
        k.draw.squirclePath(g, x0, y0, tile, tile, 56 * U);
        g.strokeStyle = C.alpha(C.mix(c.fg, c.accent, warm), (dark ? 0.12 : 0.1) + 0.25 * warm); g.lineWidth = 1.2 * U; g.stroke();
        const icol = C.mix(c.fg, dark ? C.mix(c.accent, '#ffffff', 0.15) : c.accent, warm);
        if (draw > 0) drawOn(g, icons[i], cl.x, cl.y, tile * 0.5, icol, draw);
        g.restore();
        const la = ease.outCubic(m.seg(t, t0 + 0.45, 0.6));
        k.text.draw(g, feats[i], cl.x, cl.y + tile / 2 + 68 * U + (1 - la) * 12 * U, { ...labS, size: labSize, align: 'center', baseline: 'middle', alpha: la });
      });
    },
  };
}
