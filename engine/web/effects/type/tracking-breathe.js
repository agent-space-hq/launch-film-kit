// Wide-spaced capitals drift together into a tight display setting while they
// resolve from nothing, centre letters first. Once set, the line keeps a slow,
// barely-there breath in its letter-spacing, and a quiet supporting line arrives.
export const meta = {
  id: 'type.tracking-breathe',
  name: 'Tracking Breathe',
  category: 'type',
  duration: 5,
  summary: 'Widely tracked capitals contract to a tight display setting as they fade up from the centre outward; the line then breathes gently in its tracking while the supporting line settles beneath, held to the end.',
  bestFor: ['headline', 'premium title card', 'tagline'],
  slots: ['headline', 'sub'],
  params: {
    text: { default: null, label: 'Headline (defaults to brand headline)' },
    sub: { default: true, label: 'Show supporting line' },
    breath: { default: 0.014, min: 0, max: 0.04, label: 'Breath depth (em)' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 1.5, gain: 0.45 }, { t: 2.0, type: 'shimmer', gain: 0.3 }],
  prompt: `Uppercase the headline, weight 600, size about 11.5% of frame height, balanced into lines that fit 88% of the safe width at the final tracking of 0.01 em. Start every line at +0.42 em tracking and contract to the final value over 1.7 s from 150 ms (emphasized curve), re-centring each line every frame. Opacity resolves per glyph from the centre outward: a glyph's 900 ms outCubic fade starts 150 ms + 450 ms x its normalised distance from the line centre. After the contraction, the tracking breathes: +/-0.014 em on a 2.6 s sine, faded in over 600 ms so there is no visible kick. At 2.1 s the supporting line (body size 34 px, muted colour) rises 12 px and fades in over 700 ms (outQuint), 56 px below the headline block. No exit; hold both lines.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const str = String(p.text || k.copy('headline', 'Make something people want.')).toUpperCase();
  const FINAL = 0.01, START = 0.42;
  const o = { role: 'display', size: k.pick({ wide: 124, square: 100, tall: 92 }), weight: 600, tracking: FINAL };
  const maxW = k.safe.w * 0.88;
  let lines = k.text.balance(str, o, maxW);
  while (lines.length > 3 && o.size > 40) { o.size *= 0.93; lines = k.text.balance(str, o, maxW); }
  const sub = p.sub ? k.copy('sub', null) : null;
  const so = { role: 'text', size: k.pick({ wide: 36, square: 34, tall: 34 }), weight: 440, align: 'center', baseline: 'top' };
  const subLines = sub ? k.text.balance(sub, so, k.safe.w * 0.8) : [];
  const T0 = 0.15, CONTRACT = 1.7, T_BREATH = T0 + CONTRACT;
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const pr = ease.emphasized(m.seg(t, T0, CONTRACT));
      const br = ease.inOutSine(m.seg(t, T_BREATH - 0.2, 0.6)) * p.breath * Math.sin(((t - T_BREATH) / 2.6) * m.TAU);
      const tracking = m.lerp(START, FINAL, pr) + br;
      const lo = { ...o, tracking };
      const lh = o.size * 1.06 * k.u;
      const subH = subLines.length ? 56 * k.u + subLines.length * so.size * 1.3 * k.u : 0;
      const blockH = (lines.length - 1) * lh + o.size * 0.72 * k.u + subH;
      const top = k.cy - blockH / 2 + o.size * 0.36 * k.u;
      lines.forEach((ln, li) => {
        const y = top + li * lh;
        k.text.glyphs(g, ln, k.cx, y, { ...lo, align: 'center', baseline: 'middle', qaGroup: str, qaOffstage: pr < 0.98 }, (i, n) => {
          const d = n > 1 ? Math.abs(i - (n - 1) / 2) / ((n - 1) / 2) : 0;
          return { a: ease.outCubic(m.seg(t, T0 + li * 0.08 + d * 0.45, 0.9)) };
        });
      });
      if (subLines.length) {
        const sa = ease.outQuint(m.seg(t, 2.1, 0.7));
        const sy = top + (lines.length - 1) * lh + o.size * 0.36 * k.u + 56 * k.u + (1 - sa) * 12 * k.u;
        subLines.forEach((sl, i) => k.text.draw(g, sl, k.cx, sy + i * so.size * 1.3 * k.u, { ...so, color: c.muted, alpha: sa }));
      }
    },
  };
}
