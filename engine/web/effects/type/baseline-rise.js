// Headline words rise from behind an invisible baseline mask, one after another,
// hold for reading, then exit upward the same way. The workhorse title move.
export const meta = {
  id: 'type.baseline-rise',
  name: 'Baseline Rise',
  category: 'type',
  duration: 3.6,
  summary: 'Each word slides up from behind its own baseline mask with a short stagger, holds, then lifts away.',
  bestFor: ['headline', 'chapter title', 'value proposition'],
  prompt: `Set the headline in display weight 650, about 11% of the frame's short side, tracking -0.035 em, balanced across at most three centred lines (shrink 8% per step if needed). Each word sits inside its own clip band, from just above cap height to just below the baseline. Words enter from below the band, travelling 90% of the line height, with 750 ms outExpo and 70 ms stagger in reading order, so they appear to rise out of an invisible floor. Colour the last word in the brand accent; everything else is foreground. Hold the full line at least 1.2 s. Exit the same way upward in the last 750 ms (450 ms inCubic, 28 ms stagger). No fades, no scale, no blur: the clip edge does all the work, and engine motion blur softens the travel.`,
  params: {
    text: { default: null, label: 'Headline (defaults to brand headline)' },
    stagger: { default: 0.07, min: 0.02, max: 0.2, label: 'Word stagger (s)' },
    accentWord: { default: -1, label: 'Index of word in accent colour (-1 = last)' },
  },
  sfx: [{ t: 0.1, type: 'whoosh', dur: 0.45, gain: 0.35 }],
};

export function create(k, p) {
  const { ease, m } = k;
  const str = p.text || k.copy('headline', 'Make something people want.');
  const size0 = k.pick({ wide: 120, square: 104, tall: 92 });
  const maxW = k.safe.w * 0.92;
  const o = { size: size0, weight: 650 };
  let lines = k.text.balance(str, o, maxW);
  // keep to at most 3 lines by shrinking
  while (lines.length > 3 && o.size > 40) { o.size *= 0.92; lines = k.text.balance(str, o, maxW); }
  const words = [];
  lines.forEach((ln, li) => ln.split(' ').forEach((w) => words.push({ w, li })));
  const accentIdx = p.accentWord < 0 ? words.length + p.accentWord : p.accentWord;
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const lh = o.size * 1.06 * k.u;
      const top = k.cy - ((lines.length - 1) * lh) / 2;
      let wi = 0;
      lines.forEach((ln, li) => {
        const L = k.text.layout(ln, o);
        let x = k.cx - L.width / 2;
        const y = top + li * lh;
        const space = k.text.layout(' ', o).width;
        for (const word of ln.split(' ')) {
          const WL = k.text.layout(word, o);
          const tin = ease.outExpo(m.seg(t, 0.15 + wi * p.stagger, 0.75));
          const tout = ease.inCubic(m.seg(t, (p.duration ?? meta.duration) - 0.75 + wi * p.stagger * 0.4, 0.45));
          const dy = (1 - tin) * lh * 0.9 - tout * lh * 0.9;
          g.save();
          // mask: a band from cap top to just under the baseline
          g.beginPath();
          g.rect(x - 0.1 * lh, y - L.cap * 0.5 - lh * 0.22, WL.width + 0.2 * lh, L.cap + lh * 0.5);
          g.clip();
          k.text.draw(g, word, x, y + dy, { ...o, baseline: 'middle', color: wi === accentIdx ? c.accent : c.fg, qaGroup: str, qaOffstage: tin < 1 || tout > 0 });
          g.restore();
          x += WL.width + space;
          wi++;
        }
      });
    },
  };
}
