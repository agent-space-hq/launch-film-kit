// A carousel post turned video: four square slides on an endless ring swipe left one
// at a time, neighbours peeking at the sides, a pill-shaped pagination indicator
// stretching between dots. Slide 4 hands back to slide 1, so the loop is seamless.
export const meta = {
  id: 'loop.swipe-carousel',
  name: 'Swipe Carousel',
  category: 'loop',
  duration: 7.2,
  loop: true,
  summary: 'Four square slides (brand, headline, key stat, call to action) swipe horizontally on an endless ring with peeking neighbours and a stretching pagination pill; each slide holds 1.2 s; seamless loop.',
  bestFor: ['carousel-style social post', 'feed video', 'product summary'],
  slots: ['headline', 'stats', 'cta', 'url'],
  params: {
    move: { default: 0.6, min: 0.35, max: 0.9, label: 'Swipe duration (s)' },
  },
  sfx: [{ t: 0.9, type: 'whoosh', dur: 0.35, gain: 0.25 }, { t: 2.7, type: 'whoosh', dur: 0.35, gain: 0.25 }, { t: 4.5, type: 'whoosh', dur: 0.35, gain: 0.25 }, { t: 6.3, type: 'whoosh', dur: 0.35, gain: 0.25 }],
  prompt: `Build four square slides about 56-72% of the short side wide with 36 px gaps on a horizontal ring: (1) accent card with the mark and brand name, (2) surface card with the balanced headline at about 9% of the card in display weight, (3) surface card with the first stat value huge and its label, (4) surface card with a call-to-action pill and the domain. Divide the loop into four equal beats; in the last 600 ms of each beat the ring index advances by one with the standard curve, so slide 4 hands back to slide 1 and the loop is seamless. Cards away from centre scale to 0.9 and fade to 55% opacity, their text fading faster (cubed) so it never sits half-transparent. Under the cards, four 10 px dots; the active indicator is a 34 px pill whose left and right ends travel with slightly offset timing so it stretches mid-swipe. Hairline borders, soft shadows on light, faint glow on dark. Offset the timeline by 30% of a beat so frame 0 is a settled first slide.`,
};

function fmt(v, d = 0) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

export function create(k, p) {
  const { ease, m } = k;
  const S = k.pick({ wide: 640, square: 640, tall: 760 }) * k.u;
  const gap = 36 * k.u;
  const stat = (k.copy('stats', null) || [{ value: 3, suffix: 'x', label: 'faster launches' }])[0];
  const statStr = fmt(stat.value, stat.decimals || 0) + (stat.suffix || '');
  const headline = k.copy('headline', 'Ship your launch in one place.');
  const cta = k.copy('cta', 'Get started');
  const url = k.copy('url', 'example.com');
  const pad = S * 0.11;
  const hO = { size: (S / k.u) * 0.1, weight: 650, tracking: -0.035 };
  const hLines = k.text.balance(headline, hO, S - pad * 2);
  const sO = { size: k.text.fit(statStr, { size: (S / k.u) * 0.3, weight: 640, tracking: -0.045 }, S - pad * 2), weight: 640, tracking: -0.045 };

  function card(g, i, x, y, dim) {
    const c = k.brand.colors, C = k.color;
    const r = S * 0.07;
    const hero = i === 0;
    // off-centre cards: body dims to 55%, text fades faster (never half-transparent while readable)
    g.save();
    const ta = (1 - 0.45 * dim) ** 3;
    // opaque base, mixed toward the page colour (keeps the shadow from showing through)
    if (!k.isDark) k.draw.shadow(g, x, y, S, S, r, { blur: 60, y: 26, color: `rgba(20,30,60,${(0.16 * (1 - dim * 0.7)).toFixed(3)})` });
    k.draw.rrect(g, x, y, S, S, r, C.mix(hero ? c.accent : c.surface, c.bg, 0.5 * dim), hero ? null : C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);
    g.globalAlpha = 1 - 0.45 * dim;
    const on = C.onColor(c.accent, ['#ffffff', c.bg, c.fg]);
    const cx = x + S / 2;
    if (i === 0) {
      const mh = S * 0.34;
      k.logo.draw(g, cx, y + S * 0.42, mh, { color: on });
      if (k.brand.name) k.text.draw(g, k.brand.name, cx, y + S * 0.74, { size: (S / k.u) * 0.1, weight: 640, tracking: -0.03, align: 'center', baseline: 'middle', color: on, alpha: ta });
    } else if (i === 1) {
      const lh = hO.size * 1.1 * k.u;
      const top = y + S / 2 - ((hLines.length - 1) * lh) / 2;
      // small accent rule above the headline
      k.draw.rrect(g, cx - 28 * k.u, top - lh * 0.95, 56 * k.u, 6 * k.u, 3 * k.u, c.accent);
      hLines.forEach((ln, li) => k.text.draw(g, ln, cx, top + li * lh, { ...hO, align: 'center', baseline: 'middle', color: c.fg, qaGroup: headline + 'c', alpha: ta }));
    } else if (i === 2) {
      k.text.draw(g, statStr, cx, y + S * 0.44, { ...sO, align: 'center', baseline: 'middle', color: c.fg, alpha: ta });
      k.text.draw(g, stat.label, cx, y + S * 0.7, { role: 'text', size: (S / k.u) * 0.055, weight: 500, align: 'center', baseline: 'middle', color: c.muted, alpha: ta });
    } else {
      const bs = (S / k.u) * 0.062;
      const L = k.text.layout(cta, { role: 'text', size: bs, weight: 620 });
      const bw = L.width + 80 * k.u, bh = bs * 2.3 * k.u;
      k.draw.rrect(g, cx - bw / 2, y + S * 0.44 - bh / 2, bw, bh, bh / 2, c.accent);
      k.text.draw(g, cta, cx, y + S * 0.44, { role: 'text', size: bs, weight: 620, align: 'center', baseline: 'middle', color: on, alpha: ta });
      k.text.draw(g, url, cx, y + S * 0.66, { role: 'mono', size: (S / k.u) * 0.045, weight: 450, align: 'center', baseline: 'middle', color: c.muted, alpha: ta });
    }
    g.restore();
  }

  return {
    draw(g, t) {
      const c = k.brand.colors, C = k.color;
      const D = p.duration ?? meta.duration;
      const P = D / 4;
      const tt = (((t + 0.3 * P) % D) + D) % D;
      const beat = Math.floor(tt / P), local = tt - beat * P;
      const mv = Math.min(p.move, P * 0.45);
      const e = ease.standard(m.seg(local, P - mv, mv));
      const pos = beat + e; // continuous ring index, 0..4
      const dotsY = k.cy + S / 2 + 70 * k.u;
      const cy = k.cy - 20 * k.u;
      for (let j = -2; j <= 6; j++) {
        const d = j - pos; // offset from centre in slots
        if (d < -1.6 || d > 1.6) continue;
        const i = ((j % 4) + 4) % 4;
        const ad = Math.min(1, Math.abs(d));
        const sc = 1 - 0.1 * ad;
        const x = k.cx + d * (S + gap) - S / 2, y = cy - S / 2;
        g.save();
        g.translate(k.cx + d * (S + gap), cy); g.scale(sc, sc); g.translate(-(k.cx + d * (S + gap)), -cy);
        const drawIt = () => card(g, i, x, y, ad);
        if (Math.abs(d) > 0.01) k.qa.allowOffstage(() => k.qa.allowOverlap(drawIt)); else drawIt();
        g.restore();
      }
      // pagination
      const dotR = 5 * k.u, sp = 26 * k.u;
      const x0 = k.cx - 1.5 * sp;
      for (let i = 0; i < 4; i++) k.draw.circle(g, x0 + i * sp, dotsY, dotR, C.alpha(c.fg, 0.22));
      const lead = ease.standard(m.seg(local, P - mv, mv * 0.8));
      const trail = ease.standard(m.seg(local, P - mv * 0.8, mv * 0.8));
      const drawPill = (a, b, al = 1) => {
        const left = Math.min(a, b) - 12 * k.u, right = Math.max(a, b) + 12 * k.u;
        g.save(); g.globalAlpha = al;
        k.draw.rrect(g, left, dotsY - dotR, right - left, dotR * 2, dotR, c.accent);
        g.restore();
      };
      if (beat < 3) drawPill(x0 + (beat + trail) * sp, x0 + (beat + lead) * sp);
      else {
        // wrap 4 -> 1: the pill hands over from the last dot to the first
        drawPill(x0 + 3 * sp, x0 + 3 * sp, 1 - e);
        if (e > 0) drawPill(x0, x0, e);
      }
    },
  };
}
