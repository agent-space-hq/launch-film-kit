// Departures-board headline. A grid of split tiles; every tile riffles forward
// through its character drum (top flap folds down, bottom flap unfolds) and
// stops on its letter. Columns start left to right, rows a beat apart, so the
// line resolves like a wave. The last word lands in the accent colour.
export const meta = {
  id: 'type.split-flap',
  name: 'Split Flap',
  category: 'type',
  duration: 4.4,
  summary: 'A split-flap board riffles every tile through its character drum, left to right and row by row, until the headline is spelled out; the last word lands in accent and the board holds to the end.',
  bestFor: ['headline', 'announcement', 'launch date'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Headline (defaults to brand headline)' },
    flip: { default: 0.075, min: 0.04, max: 0.14, label: 'Seconds per flip' },
  },
  sfx: [{ t: 0.3, type: 'type', n: 34, dur: 1.9, gain: 0.45 }, { t: 2.35, type: 'click', gain: 0.6 }],
  prompt: `Uppercase and wrap the headline into rows of at most 18 (wide), 12 (4:5) or 10 (9:16) characters, centred on a board padded with one blank tile each side. Tile width = safe width / columns, height 1.38x width, 8% gaps, radius 9% of width, tile fill a step lighter than the background with a hairline border; a background-coloured 2 px seam splits each tile. Glyphs: display face, 62% of tile height, weight 600. Each tile walks forward through a fixed drum (blank, A-Z, 0-9, punctuation), 4-12 steps ending on its letter, 75 ms per step. One step: the static top half shows the next glyph and the static bottom the previous; the old top flap folds down about the seam (scaleY = cos), its tile and glyph dimming as it turns, then the new bottom flap unfolds. Starts: 300 ms + 25 ms per column + 120 ms per row. The last word turns accent as it lands.`,
};

const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-'!?&:";

export function create(k, p) {
  const { ease, m } = k;
  const str = String(p.text || k.copy('headline', 'Make something people want.')).toUpperCase();
  const maxCols = k.pick({ wide: 18, square: 12, tall: 10 });
  // greedy wrap by characters, then balance by shrinking the limit while the row count holds
  const wrapC = (lim) => {
    const out = []; let line = '';
    for (const w of str.split(/\s+/).filter(Boolean)) {
      const test = line ? line + ' ' + w : w;
      if (test.length <= lim || !line) line = test; else { out.push(line); line = w; }
    }
    if (line) out.push(line);
    return out;
  };
  let rows = wrapC(maxCols);
  for (let lim = maxCols - 1; lim > 4; lim--) { const r = wrapC(lim); if (r.length > rows.length) break; rows = r; }
  const longest = Math.max(...rows.map((r) => r.length));
  const cols = longest + 2;
  const nR = rows.length;
  // last word for the accent
  const lastRow = nR - 1, lastWordStart = rows[lastRow].lastIndexOf(' ') + 1;
  const tiles = [];
  rows.forEach((row, ri) => {
    const off = Math.floor((cols - row.length) / 2);
    for (let ci = 0; ci < cols; ci++) {
      const ch = row[ci - off] ?? ' ';
      const target = Math.max(0, DRUM.indexOf(ch));
      const h = m.hash(ri * 97 + ci, 5);
      const steps = ch === ' ' ? 0 : Math.round(4 + (ci / cols) * 5 + h * 3);
      const accent = ri === lastRow && ci - off >= lastWordStart && ch !== ' ';
      tiles.push({ ri, ci, ch, target, steps, start: 0.3 + ci * 0.025 + ri * 0.12, accent });
    }
  });
  const drumCh = (i) => DRUM[((i % DRUM.length) + DRUM.length) % DRUM.length];

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const availW = k.safe.w * 0.94, availH = k.safe.h * 0.8;
      const gapF = 0.08;
      let tw = Math.min(availW / (cols + (cols - 1) * gapF), availH / (nR * 1.38 + (nR - 1) * gapF * 1.4));
      tw = Math.min(tw, 160 * k.u);
      const th = tw * 1.38, gap = tw * gapF, rowGap = gap * 1.4;
      const W = cols * tw + (cols - 1) * gap, H = nR * th + (nR - 1) * rowGap;
      const x0 = k.cx - W / 2, y0 = k.cy - H / 2;
      const fsize = (th * 0.62) / k.u;
      const o = { role: 'display', size: fsize, weight: 600, tracking: 0 };
      const rad = tw * 0.09;
      const tileFill = k.isDark ? k.color.mix(c.surface, c.fg, 0.035) : c.surface;
      const seam = Math.max(1.5, 2 * k.u);
      const appear = ease.outCubic(m.seg(t, 0, 0.35));
      const board = k.isDark ? null : 'rgba(20,24,40,0.10)';
      g.save();
      g.globalAlpha = appear;
      for (const tl of tiles) {
        const x = x0 + tl.ci * (tw + gap), y = y0 + tl.ri * (th + rowGap);
        const mid = y + th / 2;
        // tile body
        if (board) k.draw.shadow(g, x, y, tw, th, rad, { blur: 14, y: 5, color: board });
        k.draw.rrect(g, x, y, tw, th, rad, tileFill, k.isDark ? k.color.alpha(c.fg, 0.07) : c.line, 1);
        // flip state
        const local = (t - tl.start) / p.flip;
        let cur, next, f;
        if (tl.steps === 0 || local >= tl.steps) { cur = tl.ch; next = tl.ch; f = 1; }
        else if (local < 0) { cur = ' '; next = ' '; f = 1; }
        else {
          const s = Math.floor(local);
          f = local - s;
          cur = s === 0 ? ' ' : drumCh(tl.target - tl.steps + s);
          next = drumCh(tl.target - tl.steps + s + 1);
        }
        const landed = tl.steps === 0 || local >= tl.steps;
        const accAmt = tl.accent ? ease.outCubic(m.seg(t, tl.start + tl.steps * p.flip, 0.3)) : 0;
        const col = accAmt > 0 ? k.color.mix(c.fg, c.accent, accAmt) : c.fg;
        const glyph = (ch, half, sy, alpha = 1) => {
          if (ch === ' ') return;
          g.save();
          g.beginPath();
          if (half === 'top') g.rect(x, y, tw, th / 2); else g.rect(x, mid, tw, th / 2);
          g.clip();
          g.translate(x + tw / 2, mid);
          g.scale(1, sy);
          k.text.draw(g, ch, 0, 0, { ...o, align: 'center', baseline: 'middle', color: col, alpha, qaGroup: 'flap' + tl.ri + '_' + tl.ci });
          g.restore();
        };
        if (landed) { glyph(tl.ch, 'top', 1); glyph(tl.ch, 'bottom', 1); }
        else {
          glyph(next, 'top', 1);
          glyph(cur, 'bottom', 1);
          const ang = Math.PI * f;
          const sy = Math.cos(ang);
          // a folding flap darkens as it turns away from the light: tile and glyph dim together
          const fill = (half, s, shade) => {
            g.save();
            g.translate(0, mid);
            g.scale(1, Math.max(0.001, Math.abs(s)));
            g.translate(0, -mid);
            g.beginPath();
            if (half === 'top') k.draw.rrectPath(g, x, y, tw, th / 2, rad); else k.draw.rrectPath(g, x, mid, tw, th / 2, rad);
            g.fillStyle = k.color.mix(tileFill, k.isDark ? '#000000' : '#c9cbd2', shade); g.fill();
            g.restore();
          };
          if (f < 0.5) {
            fill('top', sy, 0.6 * (1 - sy));
            glyph(cur, 'top', sy, 0.25 + 0.75 * sy);
          } else {
            const s2 = -sy;
            fill('bottom', s2, 0.5 * (1 - s2));
            glyph(next, 'bottom', s2, 0.25 + 0.75 * s2);
          }
        }
        // seam
        g.fillStyle = c.bg;
        g.fillRect(x, mid - seam / 2, tw, seam);
        // hinge pins
        g.fillStyle = k.color.alpha(c.fg, k.isDark ? 0.12 : 0.18);
        g.fillRect(x, mid - seam * 1.2, tw * 0.06, seam * 2.4);
        g.fillRect(x + tw * 0.94, mid - seam * 1.2, tw * 0.06, seam * 2.4);
      }
      g.restore();
    },
  };
}
