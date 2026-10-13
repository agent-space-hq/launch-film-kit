// A slow editorial ticker: short serif pull-quotes, each credited to an invented
// publication with a simple geometric masthead mark, drift right to left. Glyphs fade
// individually at the frame edges and the quote crossing the centre warms to full ink.
export const meta = {
  id: 'social.press-ticker',
  name: 'Press Ticker',
  category: 'social',
  duration: 6,
  summary: 'Serif pull-quotes attributed to invented publications drift across a hairline-ruled band at constant speed; glyphs dissolve at the edges and the quote passing centre brightens; fades in over 0.6 s and out in the last 0.45 s.',
  bestFor: ['press', 'credibility', 'buzz'],
  slots: ['press'],
  params: {
    items: {
      default: [
        { quote: 'Launch day, finally calm.', source: 'The Build Weekly', mark: 0 },
        { quote: 'The release tool teams actually enjoy.', source: 'Launch Ledger', mark: 1 },
        { quote: 'Quietly rewriting launch week.', source: 'Maker Dispatch', mark: 2 },
        { quote: 'Fewer meetings, more shipping.', source: 'Product Courier', mark: 3 },
        { quote: 'A calmer way to ship software.', source: 'Stack Review', mark: 4 },
      ],
      label: 'SAMPLE DATA: pull-quotes from invented publications [{quote, source, mark}]',
    },
    speed: { default: 120, min: 40, max: 260, label: 'Drift speed (ref px/s)' },
    kicker: { default: 'What people are saying', label: 'Small heading above the band' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 1.0, gain: 0.25 }],
  prompt: `Press ticker, 6 s. One band on 16:9 (two on 4:5, three on 9:16, alternating direction) bounded by hairlines that draw outward from the centre (inOutCubic, 700 ms), with a small tracked mono kicker above. Items drift at a constant 120 px/s: a serif italic pull-quote (~110 px on 16:9, 80 px on tall) and, beneath it, an invented geometric masthead mark (28 px) beside the publication name in 24 px tracked mono caps. Items are 170 px apart with a small accent diamond between them. Every glyph fades by its own x: full opacity between 12% and 88% of frame width, falling to zero at the edges, so text dissolves into the sides. The item nearest the centre lerps from muted to full ink. Everything fades in over 600 ms and out over the last 450 ms with inCubic.`,
};

function mastheadMark(g, kind, x, y, s, color) {
  g.save();
  g.translate(x, y); g.scale(s / 28, s / 28);
  g.fillStyle = color; g.strokeStyle = color; g.lineWidth = 3;
  g.beginPath();
  switch (kind % 5) {
    case 0: g.rect(2, 2, 24, 24); g.rect(9, 9, 10, 10); g.fill('evenodd'); break;
    case 1: g.arc(14, 14, 12, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(14, 14, 5, 0, Math.PI * 2); g.fill(); break;
    case 2: g.moveTo(14, 2); g.lineTo(27, 26); g.lineTo(1, 26); g.closePath(); g.fill(); break;
    case 3: g.arc(14, 14, 12, Math.PI / 2, Math.PI * 1.5); g.closePath(); g.fill(); g.beginPath(); g.arc(14, 14, 12, -Math.PI / 2, Math.PI / 2); g.stroke(); break;
    default: for (let i = 0; i < 3; i++) g.rect(2 + i * 9, 26 - (i + 1) * 8, 6, (i + 1) * 8); g.fill(); break;
  }
  g.restore();
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const items = k.copy('press', null) || p.items;
  const D = p.duration ?? meta.duration;
  const u = k.u;
  const qo = { role: 'serif', size: k.pick({ wide: 110, square: 80, tall: 80 }), weight: 400, italic: true, tracking: -0.01 };
  const so = { role: 'mono', size: 24, weight: 500, tracking: 0.12 };
  const GAP = 170 * u;
  const lay = items.map((it) => {
    const QL = k.text.layout(it.quote, qo), SL = k.text.layout(it.source.toUpperCase(), so);
    return { ...it, src: it.source.toUpperCase(), w: Math.max(QL.width, SL.width + 44 * u), QL, SL };
  });
  let span = 0;
  lay.forEach((it) => { it.off = span; span += it.w + GAP; });

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = (1 - exitP) * ease.outCubic(m.seg(t, 0, 0.6));
      const nRows = k.pick({ wide: 1, square: 2, tall: 3 });
      const bandH = qo.size * u * 2.5;
      const pitchY = bandH * 1.08;
      const firstY = k.cy - ((nRows - 1) * pitchY) / 2;
      const rl = ease.inOutCubic(m.seg(t, 0.05, 0.7));
      // hairline rules between / around rows, drawn outward from the centre
      g.save(); g.globalAlpha = 1 - exitP;
      for (let r = 0; r <= nRows; r++) {
        const y = firstY - bandH / 2 + r * pitchY - (r === nRows ? pitchY - bandH : 0);
        const grd = g.createLinearGradient(0, 0, k.W, 0);
        grd.addColorStop(0, C.alpha(c.fg, 0)); grd.addColorStop(0.5, C.alpha(c.fg, k.isDark ? 0.16 : 0.18)); grd.addColorStop(1, C.alpha(c.fg, 0));
        g.fillStyle = grd; g.fillRect(k.cx - (k.W / 2) * rl, y, k.W * rl, Math.max(1, u));
      }
      g.restore();
      const ka = ease.outExpo(m.seg(t, 0.2, 0.8)) * (1 - exitP);
      k.text.draw(g, p.kicker.toUpperCase(), k.cx, firstY - bandH / 2 - 40 * u + (1 - ka) * 12 * u, { role: 'mono', size: 24, weight: 500, tracking: 0.14, color: c.muted, align: 'center', baseline: 'bottom', alpha: ka });

      const edgeA = (x) => m.smoothstep(k.W * 0.0, k.W * 0.12, x) * m.smoothstep(k.W, k.W * 0.88, x);
      for (let row = 0; row < nRows; row++) {
        const dir = row % 2 ? -1 : 1; // odd rows drift the other way
        const rowY = firstY + row * pitchY;
        const drift = dir * t * p.speed * u * (1 + 0.1 * row);
        const phase = row * span * 0.37;
        const qy = rowY - 22 * u, sy = rowY + qo.size * u * 0.62;
        const start = Math.floor((drift - phase - k.W) / span) - 1;
        for (let rep = start; rep < start + 3 + Math.ceil((k.W * 2) / span); rep++) {
          lay.forEach((it, idx) => {
            const x0 = k.W * 0.55 + rep * span + it.off - drift + phase;
            if (x0 > k.W || x0 + it.w < 0) return;
            const cxItem = x0 + it.w / 2;
            const focus = 1 - m.smoothstep(0, k.W * 0.45, Math.abs(cxItem - k.cx));
            const ink = C.mix(C.mix(c.fg, c.bg, 0.45), c.fg, focus);
            const crosses = x0 < k.W * 0.04 || x0 + it.w > k.W * 0.96;
            const key = `${row}-${idx}-${rep}`;
            g.save(); g.globalAlpha = fade;
            k.text.glyphs(g, it.quote, x0, qy, { ...qo, baseline: 'middle', color: ink, qaOffstage: crosses, qaGroup: 'q' + key }, (i, n, gl) => ({ a: edgeA(x0 + gl.x + gl.w / 2) }));
            const mx = x0 + 2 * u;
            g.globalAlpha = fade * edgeA(mx + 14 * u);
            mastheadMark(g, it.mark ?? idx, mx, sy - 14 * u, 28 * u, C.mix(c.muted, c.fg, focus * 0.6));
            g.globalAlpha = fade;
            k.text.glyphs(g, it.src, mx + 44 * u, sy, { ...so, baseline: 'middle', color: C.mix(c.muted, c.fg, focus * 0.4), qaOffstage: crosses, qaGroup: 's' + key }, (i, n, gl) => ({ a: edgeA(mx + 44 * u + gl.x + gl.w / 2) }));
            const dx = x0 + it.w + GAP / 2;
            const da = edgeA(dx);
            if (da > 0) {
              g.globalAlpha = fade * da;
              g.translate(dx, rowY); g.rotate(Math.PI / 4);
              g.fillStyle = c.accent; g.fillRect(-6 * u, -6 * u, 12 * u, 12 * u);
            }
            g.restore();
          });
        }
      }
    },
  };
}
