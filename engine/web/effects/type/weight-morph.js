// The headline is first set in a whisper-thin hairline with airy tracking. Word by
// word the variable font thickens and the tracking pulls in; after a beat of
// stillness one emphasis word keeps swelling to heavy and takes the accent.
export const meta = {
  id: 'type.weight-morph',
  name: 'Weight Morph',
  category: 'type',
  duration: 4.6,
  summary: 'A hairline headline gains weight word by word while its tracking tightens; then one emphasis word swells to heavy in the accent colour and the line holds to the end.',
  bestFor: ['headline', 'brand statement', 'emphasis'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Headline (defaults to brand headline)' },
    emphasis: { default: -1, label: 'Index of the emphasis word (-1 = last)' },
    stagger: { default: 0.08, min: 0.03, max: 0.15, label: 'Word stagger (s)' },
  },
  sfx: [{ t: 0.7, type: 'swell', dur: 1.0, gain: 0.4 }, { t: 2.45, type: 'hit', gain: 0.35, pitch: 0.8 }],
  prompt: `Set the headline in a variable sans, balanced into at most 3 lines, centred, display size about 11% of frame height. Start every word at weight 100 with +0.14 em tracking, fading in over 500 ms (outCubic) and holding as a hairline for 250 ms. From 750 ms, each word morphs to weight 600 and -0.03 em tracking over 1100 ms (emphasized curve) with an 80 ms stagger; re-measure every frame so lines stay centred as glyphs thicken. After 400 ms of stillness, the emphasis word (default: last) swells on to weight 880, tracking -0.045 em and a 4% scale over 800 ms (outQuint), while its colour mixes from foreground to accent. On dark, a faint accent glow sits behind it. All other words stay neutral. Hold the finished line, untouched, to the end of the shot.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const str = p.text || k.copy('headline', 'Make something people want.');
  const base = { role: 'display', size: k.pick({ wide: 150, square: 120, tall: 108 }), weight: 880, tracking: -0.03 };
  const maxW = k.safe.w * 0.9;
  // balance at the heaviest state so nothing ever overflows
  let lines = k.text.balance(str, base, maxW);
  while (lines.length > 3 && base.size > 44) { base.size *= 0.93; lines = k.text.balance(str, base, maxW); }
  while (lines.some((l) => k.text.layout(l, base).width > maxW) && base.size > 44) { base.size *= 0.95; lines = k.text.balance(str, base, maxW); }
  const words = [];
  lines.forEach((ln, li) => ln.split(' ').forEach((w) => words.push({ w, li })));
  const n = words.length;
  const ei = p.emphasis < 0 ? n + p.emphasis : Math.min(n - 1, p.emphasis);
  const T_IN = 0.0, T_MORPH = 0.75, MORPH = 1.1;
  const tSwell = T_MORPH + (n - 1) * p.stagger + MORPH + 0.4;

  function state(i, t) {
    const pr = ease.emphasized(m.seg(t, T_MORPH + i * p.stagger, MORPH));
    let weight = m.lerp(100, 600, pr), tracking = m.lerp(0.14, -0.03, pr), scale = 1, acc = 0;
    if (i === ei) {
      const sw = ease.outQuint(m.seg(t, tSwell, 0.8));
      weight = m.lerp(weight, 880, sw); tracking = m.lerp(tracking, -0.045, sw); scale = 1 + 0.04 * sw; acc = sw;
    }
    return { weight: Math.round(weight), tracking: Math.round(tracking * 1000) / 1000, scale, acc };
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const fade = ease.outCubic(m.seg(t, T_IN, 0.5));
      const lh = base.size * 1.12 * k.u;
      const top = k.cy - ((lines.length - 1) * lh) / 2;
      const space = (st) => k.text.layout(' ', { ...base, weight: st.weight }).width + Math.max(0, st.tracking) * base.size * k.u * 2;
      let wi = 0;
      lines.forEach((ln, li) => {
        const ws = ln.split(' ');
        const items = ws.map((w, j) => {
          const st = state(wi + j, t);
          const o = { ...base, weight: st.weight, tracking: st.tracking };
          return { w, st, o, L: k.text.layout(w, o) };
        });
        let total = 0;
        items.forEach((it, j) => { total += it.L.width * it.st.scale + (j < items.length - 1 ? space(it.st) : 0); });
        let x = k.cx - total / 2;
        const y = top + li * lh;
        items.forEach((it, j) => {
          const w = it.L.width * it.st.scale;
          const color = it.st.acc > 0 ? k.color.mix(c.fg, c.accent, it.st.acc) : c.fg;
          if (it.st.acc > 0 && k.isDark) k.draw.glow(g, x + w / 2, y, w * 0.75, c.accent, 0.12 * it.st.acc);
          g.save();
          g.translate(x + w / 2, y);
          g.scale(it.st.scale, it.st.scale);
          k.text.draw(g, it.w, 0, 0, { ...it.o, align: 'center', baseline: 'middle', color, alpha: fade, qaGroup: str });
          g.restore();
          x += w + (j < items.length - 1 ? space(it.st) : 0);
        });
        wi += ws.length;
      });
    },
  };
}
