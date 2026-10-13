// Every letter slot of the headline starts as a flicker of monospaced noise
// characters. A decode front sweeps left to right: each slot locks into its real
// display glyph with a short accent flash, until the headline reads clean.
export const meta = {
  id: 'type.scramble-decode',
  name: 'Scramble Decode',
  category: 'type',
  duration: 4.2,
  summary: 'Monospaced placeholder characters cycle in every letter slot, then resolve left to right into the display-set headline with a brief accent flash per glyph; the clean line holds to the end.',
  bestFor: ['headline', 'tech reveal', 'product name'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Headline (defaults to brand headline)' },
    rate: { default: 22, min: 10, max: 40, label: 'Scramble changes per second' },
    sweep: { default: 1.35, min: 0.6, max: 2.5, label: 'Decode sweep length (s)' },
  },
  sfx: [{ t: 0.15, type: 'type', n: 26, dur: 1.7, gain: 0.35 }, { t: 1.9, type: 'tick', gain: 0.7 }],
  prompt: `Lay the headline out in the display face (weight 640, tracking -0.03 em, about 11% of frame height), balanced to at most 3 lines and centred; record each glyph's centre. Every non-space slot fades in between 100 and 500 ms (staggered by position) showing a monospaced character at 70% of the display size, picked by a seeded hash of (slot, floor(t x 22)) from capitals, digits and a few symbols, in the muted colour. A decode front sweeps left to right over 1.35 s from 450 ms (inOutCubic over the reading order, plus up to 80 ms seeded jitter). The three slots just ahead of the front turn accent. When the front passes, the slot swaps to its real display glyph, which drops 6% of the cap height into place over 300 ms (outExpo) and fades from accent to foreground over 350 ms. Hold the clean headline to the end.`,
};

const POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+/<>=';

export function create(k, p) {
  const { ease, m } = k;
  const str = p.text || k.copy('headline', 'Make something people want.');
  const o = { role: 'display', size: k.pick({ wide: 124, square: 104, tall: 96 }), weight: 640, tracking: -0.03 };
  const maxW = k.safe.w * 0.9;
  let lines = k.text.balance(str, o, maxW);
  while (lines.length > 3 && o.size > 40) { o.size *= 0.93; lines = k.text.balance(str, o, maxW); }
  // reading order index for every glyph
  const total = lines.reduce((s, l) => s + l.length, 0);
  const T_FRONT = 0.45;
  let gi = 0;
  const slots = lines.map((ln) => Array.from(ln).map((ch) => {
    const f = total > 1 ? gi / (total - 1) : 0;
    const s = {
      ch, idx: gi,
      appear: 0.1 + f * 0.4,
      resolve: T_FRONT + ease.inOutCubic(f) * p.sweep + m.hash(gi, 17) * 0.08,
    };
    gi++;
    return s;
  }));
  const mo = { role: 'mono', size: Math.max(24, o.size * 0.7), weight: 500, tracking: 0, align: 'center', baseline: 'middle' };
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const lh = o.size * 1.1 * k.u;
      const top = k.cy - ((lines.length - 1) * lh) / 2;
      // where is the front (for the accent look-ahead)?
      const frontIdx = slots.flat().filter((s) => t >= s.resolve).length;
      lines.forEach((ln, li) => {
        const y = top + li * lh;
        const L = k.text.layout(ln, o);
        const x0 = k.cx - L.width / 2;
        const row = slots[li];
        // resolved display glyphs
        k.text.glyphs(g, ln, k.cx, y, { ...o, align: 'center', baseline: 'middle', qaGroup: str }, (i) => {
          const s = row[i];
          if (t < s.resolve) return null;
          const a = ease.outExpo(m.seg(t, s.resolve, 0.3));
          const col = ease.outCubic(m.seg(t, s.resolve + 0.05, 0.35));
          return { y: -(1 - a) * L.cap * 0.06, a: 0.35 + 0.65 * a, color: col < 1 ? k.color.mix(c.accent, c.fg, col) : c.fg };
        });
        // scramble characters in the unresolved slots
        row.forEach((s, i) => {
          if (s.ch === ' ' || t >= s.resolve) return;
          const a = ease.outCubic(m.seg(t, s.appear, 0.3));
          if (a <= 0.01) return;
          const gl = L.glyphs[i];
          const tick = Math.floor(t * p.rate);
          const ch = POOL[Math.floor(m.hash(s.idx * 131 + tick, 3) * POOL.length)];
          const ahead = s.idx - frontIdx;
          const hot = ahead >= 0 && ahead < 3 && t > T_FRONT - 0.1;
          k.text.draw(g, ch, x0 + gl.x + gl.w / 2, y, { ...mo, color: hot ? c.accent : c.muted, alpha: a * (hot ? 1 : 0.85), qaGroup: str });
        });
      });
    },
  };
}
