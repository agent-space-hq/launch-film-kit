// A sentence settles and sits still. After a breath, an accent marker band sweeps
// under the key phrase; wherever the band passes, the letters flip to the
// background colour, so the phrase reads knocked-out of the band. The rest of the
// sentence steps back a little so the phrase leads.
export const meta = {
  id: 'type.highlighter',
  name: 'Highlighter',
  category: 'type',
  duration: 4.4,
  summary: 'The headline settles and holds; an accent band then sweeps under the key phrase and the phrase inverts to the background colour on the band while the rest of the line recedes slightly; the composition holds to the end.',
  bestFor: ['headline', 'key message', 'quote emphasis'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Sentence (defaults to brand headline)' },
    phrase: { default: null, label: 'Phrase to highlight (default: words after the last comma, else the last two words)' },
    sweep: { default: 0.75, min: 0.4, max: 1.4, label: 'Sweep time (s)' },
  },
  sfx: [{ t: 0.05, type: 'whoosh', dur: 0.5, gain: 0.25 }, { t: 1.3, type: 'whoosh', dur: 0.7, gain: 0.35, pitch: 1.3 }],
  prompt: `Balance the sentence into at most 3 lines (display weight 640, tracking -0.03 em, about 10.5% of frame height, leading 1.3 so a padded band clears the line above), centred. Choose the key phrase (words after the last comma, else the last two words). Lines rise a quarter of the size and fade in over 700 ms (outQuint, 80 ms line stagger), then sit still for 600 ms. From 1.3 s a band sweeps under the phrase over 750 ms (inOutCubic over the phrase's total length, line by line): accent fill, radius 12% of the size, padded 0.3 em on every side so the letters sit well inside it. Clip the sentence twice: outside the band, draw in the foreground colour; inside, draw the phrase in the background colour, so letters invert exactly at the band's edge. As the band completes, the other words ease 45% toward the muted colour over 500 ms. Hold to the end.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const str = p.text || k.copy('headline', 'Make something people want.');
  const o = { role: 'display', size: k.pick({ wide: 116, square: 100, tall: 92 }), weight: 640, tracking: -0.03 };
  const maxW = k.safe.w * 0.86;
  let lines = k.text.balance(str, o, maxW);
  while (lines.length > 3 && o.size > 40) { o.size *= 0.93; lines = k.text.balance(str, o, maxW); }
  // phrase: explicit, else after the last comma, else last two words
  let phrase = p.phrase;
  if (!phrase) {
    const ci = str.lastIndexOf(',');
    phrase = ci > 0 && ci < str.length - 2 ? str.slice(ci + 1).trim() : str.split(/\s+/).slice(-2).join(' ');
  }
  // character range of the phrase in the joined line text
  const joined = lines.join(' ');
  let p0 = joined.lastIndexOf(phrase);
  if (p0 < 0) p0 = Math.max(0, joined.length - phrase.length);
  const p1 = p0 + phrase.length;
  // per-line [start, end) char indices inside the phrase
  const segs = [];
  let off = 0;
  lines.forEach((ln, li) => {
    const a = Math.max(p0, off), b = Math.min(p1, off + ln.length);
    if (b > a) segs.push({ li, a: a - off, b: b - off });
    off += ln.length + 1;
  });
  const T_SWEEP = 1.3;
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const lh = o.size * 1.3 * k.u; // open leading so the padded band clears the line above
      const top = k.cy - ((lines.length - 1) * lh) / 2;
      const Ls = lines.map((ln) => k.text.layout(ln, o));
      const px = Ls[0].px, cap = Ls[0].cap;
      const pad = 0.3 * px;
      // band geometry per segment
      const rects = segs.map((s) => {
        const L = Ls[s.li];
        const x0 = k.cx - L.width / 2;
        const ga = L.glyphs[s.a], gb = L.glyphs[s.b - 1];
        const y = top + s.li * lh;
        return { li: s.li, s, x: x0 + ga.x - pad, w: gb.x + gb.w - ga.x + pad * 2, y: y - cap / 2 - pad, h: cap + pad * 2 };
      });
      const totalW = rects.reduce((a, r) => a + r.w, 0);
      const sw = ease.inOutCubic(m.seg(t, T_SWEEP, p.sweep)) * totalW;
      let acc = 0;
      const live = rects.map((r) => { const w = m.clamp(sw - acc, 0, r.w); acc += r.w; return { ...r, cw: w }; });
      const recede = ease.inOutCubic(m.seg(t, T_SWEEP + p.sweep * 0.8, 0.5));
      const restCol = k.color.mix(c.fg, c.muted, 0.45 * recede);
      const bandPath = () => {
        g.beginPath();
        for (const r of live) if (r.cw > 0.5) {
          const rad = Math.min(o.size * 0.12 * k.u, r.cw / 2, r.h / 2);
          g.roundRect(r.x, r.y, r.cw, r.h, rad);
        }
      };
      // bands
      if (k.isDark) for (const r of live) if (r.cw > 1) k.draw.glow(g, r.x + r.cw / 2, r.y + r.h / 2, Math.max(r.cw, r.h) * 0.7, c.accent, 0.08);
      else for (const r of live) if (r.cw > 1) k.draw.shadow(g, r.x, r.y, r.cw, r.h, o.size * 0.12 * k.u, { blur: 30, y: 12, color: k.color.alpha(c.accent, 0.28) });
      bandPath();
      g.fillStyle = c.accent;
      g.fill();
      // sentence outside the band
      lines.forEach((ln, li) => {
        const tin = ease.outQuint(m.seg(t, 0.05 + li * 0.08, 0.7));
        const y = top + li * lh + (1 - tin) * px * 0.25;
        const x0 = k.cx - Ls[li].width / 2;
        const s = segs.find((q) => q.li === li);
        g.save();
        // clip = everything except band
        g.beginPath();
        g.rect(0, 0, k.W, k.H);
        for (const r of live) if (r.cw > 0.5) g.rect(r.x + r.cw, r.y, -r.cw, r.h);
        g.clip('evenodd');
        k.text.glyphs(g, ln, k.cx, y, { ...o, align: 'center', baseline: 'middle', alpha: tin, qaGroup: str }, (i) => ({
          color: s && i >= s.a && i < s.b ? c.fg : restCol,
        }));
        g.restore();
        // inverted glyphs inside the band
        const r = live.find((q) => q.li === li);
        if (r && r.cw > 0.5) {
          g.save();
          g.beginPath(); g.rect(r.x, r.y, r.cw, r.h); g.clip();
          for (let i = s.a; i < s.b; i++) {
            const gl = Ls[li].glyphs[i];
            if (gl.ch === ' ') continue;
            const gx0 = x0 + gl.x, gx1 = gx0 + gl.w;
            if (r.x + r.cw <= gx0) break;
            // a glyph only counts as fully set once the band has passed it with margin
            const full = r.x + r.cw >= Math.min(r.x + r.w, gx1 + pad * 0.9);
            k.text.draw(g, gl.ch, gx0, y, { ...o, baseline: 'middle', color: c.bg, alpha: full ? tin : 0.55 * tin, qaGroup: str });
          }
          g.restore();
        }
      });
    },
  };
}
