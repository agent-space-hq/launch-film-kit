// A sentence played as a rhythm: one word on screen at a time, hard-cut on a
// 120 BPM grid. Each word lands with a short scale settle; the last word waits
// one extra beat, arrives in the accent colour and holds.
export const meta = {
  id: 'type.beat-words',
  name: 'Beat Words',
  category: 'type',
  duration: 4.7,
  summary: 'The headline plays one big word per beat on a 120 BPM grid; after a one-beat rest the final word lands in accent, holds, then lifts out in the last 0.4 s.',
  bestFor: ['hook', 'manifesto line', 'music-cut opener'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Sentence (defaults to brand headline)' },
    bpm: { default: 120, min: 80, max: 160, label: 'Tempo (beats per minute)' },
  },
  sfx: [
    { t: 0.2, type: 'tick', gain: 0.7 }, { t: 0.7, type: 'tick', gain: 0.7 }, { t: 1.2, type: 'tick', gain: 0.7 },
    { t: 1.7, type: 'tick', gain: 0.7 }, { t: 2.7, type: 'hit', gain: 0.5 },
  ],
  prompt: `Split a sentence into words and strip punctuation. Show one word at a time, centred, hard-cutting on a 120 BPM grid (500 ms beats, first word at 200 ms). All words share one size: the largest that fits the longest word in 90% of the safe width, capped near 28% of frame height; weight 680, tracking -0.04 em. Each word lands with a 180 ms outExpo settle (scale 1.07 to 1, slight rise). Rest one beat on the second-to-last word, then land the final word in accent with a 260 ms settle and a faint glow on dark. Beneath sits a beat rail: one 26 px pill per word that brightens as its word lands; the current pill stretches 1.5x. With many words, halve the beat so the final word still holds 1.4 s. Exit in the last 400 ms: lift and fade with inCubic.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const D = p.duration ?? meta.duration;
  const str = p.text || k.copy('headline', 'Make something people want.');
  const words = String(str).split(/\s+/).map((w) => w.replace(/[.,;:!?"]+$/g, '').replace(/^["]+/, '')).filter(Boolean);
  const n = words.length;
  const t0 = 0.2;
  const exitDur = 0.4;
  // beat: the BPM grid, halved if needed so the last word keeps >= 1.4 s of hold
  let beat = 60 / p.bpm;
  while (beat > 0.2 && t0 + n * beat + 1.4 + exitDur > D) beat /= 2;
  const starts = words.map((_, i) => t0 + (i === n - 1 && n > 1 ? n : i) * beat);
  const o = { role: 'display', weight: 680, tracking: -0.04 };
  const cap = k.pick({ wide: 300, square: 250, tall: 220 });
  let size = cap;
  for (const w of words) size = Math.min(size, k.text.fit(w, { ...o, size: cap }, k.safe.w * 0.9));
  o.size = size;
  return {
    draw(g, t) {
      const c = k.brand.colors;
      // which word is on screen (hard cut)
      let i = -1;
      for (let j = 0; j < n; j++) if (t >= starts[j]) i = j;
      if (i < 0) return;
      const last = i === n - 1;
      const local = t - starts[i];
      const land = ease.outExpo(m.seg(local, 0, last ? 0.26 : 0.18));
      const out = ease.inCubic(m.seg(t, D - exitDur, exitDur));
      const L = k.text.layout(words[i], o);
      const s = (last ? 1.09 : 1.07) - (last ? 0.09 : 0.07) * land;
      const y = k.cy + (1 - land) * L.cap * 0.06 - out * L.cap * 0.12;
      g.save();
      g.translate(k.cx, y);
      g.scale(s, s);
      if (last && k.isDark) {
        const gl = ease.outQuint(m.seg(local, 0, 0.6));
        k.draw.glow(g, 0, 0, L.width * 0.7, c.accent, 0.10 * gl * (1 - out));
      }
      k.text.draw(g, words[i], 0, 0, { ...o, align: 'center', baseline: 'middle', color: last ? c.accent : c.fg, alpha: 1 - out });
      g.restore();
      // beat rail: one short pill per word, a quiet record of the rhythm
      const pw = 26 * k.u, ph = Math.max(2, 4 * k.u), gap = 10 * k.u;
      const total = n * pw + (n - 1) * gap;
      const ry = k.cy + L.cap * 0.5 + Math.max(0.42 * L.px, 90 * k.u);
      const rail = ease.outQuint(m.seg(t, t0, 0.5)) * (1 - out);
      for (let j = 0; j < n; j++) {
        const on = t >= starts[j];
        const lit = on ? ease.outExpo(m.seg(t, starts[j], 0.25)) : 0;
        const isLast = j === n - 1;
        g.globalAlpha = rail * (j === i ? 1 : on ? 0.55 : 0.22);
        g.fillStyle = isLast && on ? c.accent : j === i ? c.fg : c.muted;
        const w = pw * (j === i ? 1 + 0.5 * lit : 1);
        const x = k.cx - total / 2 + j * (pw + gap) + (pw - w) / 2;
        k.draw.rrectPath(g, x, ry - ph / 2, w, ph, ph / 2);
        g.fill();
      }
      g.globalAlpha = 1;
    },
  };
}
