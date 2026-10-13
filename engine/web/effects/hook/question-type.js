// The hook question types itself over a faint ghost of the full line (so frame 0 is
// already a readable thumbnail). A caret leads; after a beat the last word recolours
// to the accent glyph by glyph and a soft rounded underline sweeps beneath it.
export const meta = {
  id: 'hook.question-type',
  name: 'Question Type-on',
  category: 'hook',
  duration: 4.8,
  summary: 'copy.question types character by character over its own faint ghost with a caret, then the last word turns accent with an underline sweep; holds on the clean question.',
  bestFor: ['cold open', 'question hook', 'problem statement'],
  slots: ['question'],
  params: {
    cps: { default: 22, min: 10, max: 40, label: 'Characters per second' },
    ghost: { default: 0.09, min: 0, max: 0.2, label: 'Ghost text opacity' },
  },
  sfx: [{ t: 0.3, type: 'type', n: 30, dur: 1.7, gain: 0.35 }, { t: 2.55, type: 'shimmer', gain: 0.4 }],
  prompt: `Set copy.question in display type (about 12% of height, weight 620, -0.03 em), balanced over at most three centred lines, with every glyph position precomputed so nothing reflows. Frame 0 shows the whole line as a 9% opacity ghost plus an accent caret, so the thumbnail reads. From 300 ms the characters type at about 22 per second with seeded jitter of 30% and 90 ms extra after spaces and punctuation; each glyph fades in over 70 ms and rises 3% of its size. The caret (0.07 em wide, 1.15 cap tall) rides after the last typed glyph, then blinks softly on a 1.06 s cycle. 350 ms after the last key the final word re-colours to the accent glyph by glyph (25 ms stagger, 220 ms each) and a rounded underline 0.1 em thick at 35% opacity sweeps under it in 650 ms with outQuint as the caret fades. Hold the clean line.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const str = k.copy('question', 'What if launch day took an afternoon?');
  const o = { size: k.pick({ wide: 128, square: 112, tall: 116 }), weight: 620, tracking: -0.03 };
  const maxW = k.safe.w * 0.9;
  let lines = k.text.balance(str, o, maxW);
  while (lines.length > 3 && o.size > 48) { o.size *= 0.92; lines = k.text.balance(str, o, maxW); }
  // per-character schedule (global index over all lines incl. a virtual space between lines)
  const chars = [];
  lines.forEach((ln, li) => {
    const L = k.text.layout(ln, o);
    L.glyphs.forEach((gl) => chars.push({ li, gi: gl.i, ch: gl.ch }));
    if (li < lines.length - 1) chars.push({ li, gi: -1, ch: ' ' });
  });
  const base = 1 / p.cps;
  let tt = 0.3;
  for (let i = 0; i < chars.length; i++) {
    chars[i].t = tt;
    const ch = chars[i].ch;
    tt += base * (0.7 + 0.6 * m.hash(i, 5)) + (/[ ,.;:?!]/.test(ch) ? 0.09 : 0);
  }
  const tEnd = tt;
  // last word on last line (without trailing punctuation)
  const last = lines[lines.length - 1];
  const mt = last.match(/(\S+?)([?!.,]*)$/);
  const wStart = last.length - mt[0].length;
  const wEnd = wStart + mt[1].length; // exclusive
  const charAt = new Map();
  chars.forEach((c, i) => { if (c.gi >= 0) charAt.set(`${c.li}:${c.gi}`, i); });

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const lh = o.size * 1.14 * k.u;
      const top = k.cy - ((lines.length - 1) * lh) / 2;
      const tHi = tEnd + 0.35;
      let caret = null;
      lines.forEach((ln, li) => {
        const L = k.text.layout(ln, o);
        const x0 = k.cx - L.width / 2;
        const y = top + li * lh;
        // ghost
        if (p.ghost > 0) {
          k.text.glyphs(g, ln, k.cx, y, { ...o, align: 'center', baseline: 'middle', color: c.fg, alpha: p.ghost, qaGroup: 'ghost' + li }, (i) => {
            const ci = charAt.get(`${li}:${i}`);
            return t >= chars[ci].t ? null : { a: 1 };
          });
        }
        // typed
        k.text.glyphs(g, ln, k.cx, y, { ...o, align: 'center', baseline: 'middle', color: c.fg, qaGroup: 'q' + li }, (i, n, gl) => {
          const ci = charAt.get(`${li}:${i}`);
          const a = ease.outCubic(m.seg(t, chars[ci].t, 0.07));
          if (a <= 0) return null;
          let col;
          if (li === lines.length - 1 && i >= wStart && i < wEnd) {
            const r = ease.inOutCubic(m.seg(t, tHi + (i - wStart) * 0.025, 0.22));
            if (r > 0) col = k.color.mix(c.fg, c.accent, r);
          }
          return { a, y: (1 - a) * o.size * 0.03 * k.u, color: col };
        });
        // caret position
        for (const gl of L.glyphs) {
          const ci = charAt.get(`${li}:${gl.i}`);
          if (t >= chars[ci].t) caret = { x: x0 + gl.x + gl.w + o.size * 0.05 * k.u, y, cap: L.cap };
        }
        if (li === 0 && !caret) caret = { x: x0, y, cap: L.cap };
      });
      // underline sweep under the last word
      const lastL = k.text.layout(last, o);
      const lx0 = k.cx - lastL.width / 2;
      const ly = top + (lines.length - 1) * lh;
      const ga = lastL.glyphs[wStart], gb = lastL.glyphs[wEnd - 1];
      const ux0 = lx0 + ga.x, ux1 = lx0 + gb.x + gb.w;
      const up = ease.outQuint(m.seg(t, tHi + 0.05, 0.65));
      if (up > 0) {
        const th = o.size * 0.1 * k.u;
        const uy = ly + lastL.cap / 2 + o.size * 0.16 * k.u;
        g.save();
        g.globalAlpha = 0.35;
        k.draw.rrect(g, ux0, uy, (ux1 - ux0) * up, th, th / 2, c.accent);
        g.restore();
      }
      // caret
      if (caret) {
        const typing = t < tEnd + 0.05;
        const ph = (((t - tEnd) % 1.06) + 1.06) % 1.06 / 1.06;
        const blink = typing ? 1 : ph < 0.5 ? 1 - m.smoothstep(0.42, 0.5, ph) : m.smoothstep(0.92, 1, ph);
        const fadeOut = 1 - ease.inCubic(m.seg(t, tHi, 0.3));
        const a = blink * fadeOut;
        if (a > 0.01) {
          const cw = Math.max(3, o.size * 0.07 * k.u), ch = caret.cap * 1.15;
          g.save(); g.globalAlpha = a;
          k.draw.rrect(g, caret.x, caret.y - ch / 2, cw, ch, cw / 2, c.accent);
          g.restore();
        }
      }
    },
  };
}
