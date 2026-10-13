// Vertical-video captions: the headline pops in word-group by word-group, stacked
// one group per line; the keyword gets a bold accent highlight box that wipes in
// behind it. Holds, lifts away, and loops seamlessly (frame 0 is the full caption).
export const meta = {
  id: 'loop.caption-burst',
  name: 'Caption Burst',
  category: 'loop',
  duration: 6,
  loop: true,
  summary: 'Headline word-groups pop onto stacked lines with a short stagger, the keyword gets a tilted accent highlight box, the caption holds, lifts away and the loop restarts; frame 0 shows the full caption.',
  bestFor: ['vertical social video', 'reel caption', 'hook line'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Caption (defaults to brand headline)' },
    keyword: { default: -1, label: 'Keyword index (-1 = longest word of the last group)' },
  },
  sfx: [{ t: 2.82, type: 'tick', gain: 0.5 }, { t: 3.24, type: 'tick', gain: 0.5 }, { t: 3.66, type: 'tick', gain: 0.5 }, { t: 4.0, type: 'whoosh', dur: 0.3, gain: 0.3 }],
  prompt: `Split the headline into word groups: break after punctuation or once a group reaches 9 characters, one group per centred line, display weight 760, -0.035 em, about 11-14% of the short side, line height 1.24, each line fitted to 90% of the safe width. Groups pop 420 ms apart; inside a group words follow 60 ms apart: scale 0.82 to 1 and rise 25% of the size with outExpo over 450 ms, opacity in 120 ms. The keyword (longest word of the last group) gets an accent rounded box (padding 34% of the type size on every side), tilted about 1 degree, that wipes in from the left (outExpo, 450 ms) 300 ms after its group; the word turns to the best contrasting neutral as the box passes its middle. Hold at least 1.2 s, then every line lifts 30% of the size and fades with inCubic over 350 ms, 40 ms apart, and the frame rests empty 400 ms. Offset the timeline by 57% of the loop length so frame 0 is the full caption.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const str = p.text || k.copy('headline', 'Ship the thing people want.');
  const words = str.split(/\s+/).filter(Boolean);
  // group words into caption lines
  const groups = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    const len = cur.join(' ').length;
    if (/[,.!?;:]$/.test(w) || len >= 9) { groups.push(cur); cur = []; }
  }
  if (cur.length) groups.push(cur);
  while (groups.length > 4) { const a = groups.pop(); groups[groups.length - 1].push(...a); }
  // keyword
  const flat = [];
  groups.forEach((gr, gi) => gr.forEach((w, wi) => flat.push({ w, gi, wi })));
  let kw = p.keyword >= 0 ? Math.min(p.keyword, flat.length - 1) : -1;
  if (kw < 0) {
    const last = flat.filter((f) => f.gi === groups.length - 1);
    const best = last.reduce((a, b) => (b.w.replace(/\W/g, '').length > a.w.replace(/\W/g, '').length ? b : a), last[0]);
    kw = flat.indexOf(best);
  }
  const base = { size: k.pick({ wide: 120, square: 136, tall: 156 }), weight: 760, tracking: -0.035 };
  // size so the widest line fits
  const maxW = k.safe.w * 0.9;
  let size = base.size;
  for (const gr of groups) size = Math.min(size, k.text.fit(gr.join(' '), { ...base, size }, maxW));
  const o = { ...base, size };
  const space = k.text.layout(' ', o).width;
  const lh = size * 1.24 * k.u;
  const top = k.cy - ((groups.length - 1) * lh) / 2;
  const lines = groups.map((gr, gi) => {
    const ws = gr.map((w) => ({ w, L: k.text.layout(w, o) }));
    const total = ws.reduce((a, b) => a + b.L.width, 0) + space * (ws.length - 1);
    let x = k.cx - total / 2;
    ws.forEach((q) => { q.x = x; x += q.L.width + space; });
    return { ws, y: top + gi * lh };
  });
  const kwRef = flat[kw];
  const onAcc = k.color.onColor(k.brand.colors.accent, ['#ffffff', k.brand.colors.bg, k.brand.colors.fg]);

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const D = p.duration ?? meta.duration;
      const tau = (((t + D * 0.57) % D) + D) % D; // local timeline; frame 0 lands in the hold
      const pop0 = 0.25, gap = 0.42;
      const lastPop = pop0 + (groups.length - 1) * gap;
      const hlT = lastPop + 0.3;
      const exitT = D - 0.85;
      const hl = ease.outExpo(m.seg(tau, hlT, 0.45));

      lines.forEach((ln, gi) => {
        const ex = ease.inCubic(m.seg(tau, exitT + gi * 0.04, 0.35));
        if (ex >= 1) return;
        ln.ws.forEach((q, wi) => {
          const ts = pop0 + gi * gap + wi * 0.06;
          if (tau < ts) return;
          const e = ease.outExpo(m.seg(tau, ts, 0.45));
          const a = m.seg(tau, ts, 0.12) * (1 - ex);
          const sc = m.lerp(0.82, 1, e);
          const dy = (1 - e) * size * 0.25 * k.u - ex * size * 0.3 * k.u;
          const cx = q.x + q.L.width / 2, cy = ln.y + dy;
          const isKw = kwRef && kwRef.gi === gi && kwRef.wi === wi;
          g.save();
          g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
          g.globalAlpha = a;
          if (isKw && hl > 0) {
            const padX = size * 0.34 * k.u, padY = size * 0.34 * k.u;
            const bw = (q.L.width + padX * 2) * hl, bh = q.L.cap + padY * 2;
            g.save();
            g.translate(q.x - padX, cy);
            g.rotate(-0.02);
            k.draw.rrect(g, 0, -bh / 2, bw, bh, size * 0.2 * k.u, c.accent);
            g.restore();
          }
          const col = isKw && hl > 0.5 ? onAcc : c.fg;
          k.text.draw(g, q.w, q.x, cy, { ...o, baseline: 'middle', color: col, qaGroup: str });
          g.restore();
        });
      });
    },
  };
}
