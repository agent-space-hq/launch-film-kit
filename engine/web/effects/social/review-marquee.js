// Two rows of review cards drift in opposite directions behind soft edge fades. The
// marquee decelerates, one review lifts out of the top row to the centre at a larger
// scale while the rest dim, and holds long enough to read.
export const meta = {
  id: 'social.review-marquee',
  name: 'Review Marquee',
  category: 'social',
  duration: 5.6,
  summary: 'Rows of fictional review cards scroll in opposite directions with faded frame edges, slow down, and one card lifts to centre at ~1.4x while the others dim; holds, then fades in the last 0.45 s.',
  bestFor: ['reviews', 'social proof', 'testimonials'],
  slots: ['reviews'],
  params: {
    reviews: {
      default: [
        { name: 'Hana Kobayashi', role: 'Product Lead, Brightfold', text: 'Launch prep went from a dozen tabs to a single calm view.', stars: 5 },
        { name: 'Marcus Webb', role: 'CTO, Kettle & Pine', text: 'Release notes are written before the deploy even finishes.', stars: 5 },
        { name: 'Ifeoma Chukwu', role: 'Eng Manager, Lumenrow', text: 'Our approvals finally happen where the work happens.', stars: 5 },
        { name: 'Rafael Costa', role: 'Founder, Tidewell', text: 'The calmest launch week our team has ever had.', stars: 4 },
        { name: 'Anika Sharma', role: 'PM, Sunmere', text: 'Everyone knows what ships next without asking.', stars: 5 },
        { name: 'Jonas Berg', role: 'Design Lead, Quillstone', text: 'Design, eng and marketing finally share one timeline.', stars: 5 },
        { name: 'Grace Mensah', role: 'COO, Fernway', text: 'We stopped dreading release day. That says it all.', stars: 5 },
        { name: 'Luis Ortega', role: 'Staff Engineer, Haloworks', text: 'Rollbacks used to be scary. Now they are one click.', stars: 4 },
      ],
      label: 'SAMPLE DATA: fictional reviews [{name, role, text, stars}]',
    },
    speed: { default: 150, min: 60, max: 300, label: 'Drift speed (ref px/s, constant then easing down)' },
  },
  sfx: [{ t: 0.1, type: 'whoosh', dur: 1.4, gain: 0.25 }, { t: 2.45, type: 'swell', dur: 0.8, gain: 0.4 }],
  prompt: `Review marquee, 5.6 s. Cards (radius 24 px, surface fill, hairline border, ~27% of frame width on 16:9) hold five small stars, two lines of 28 px review text and an initials avatar with name and muted role. Rows sit 300 px apart (2 on 16:9, 3 on 4:5, 4 on 9:16) and alternate direction at a constant 150 px/s; the speed eases to 15% between 2.0 s and 2.8 s, integrated so motion stays continuous. Card opacity falls off across the outer 10% of the frame so rows dissolve into the edges. At 2.4 s the card nearest the centre in the upper-middle row lifts out: it travels to frame centre and scales to 1.35x (1.6x on 9:16) with emphasized easing over 900 ms, gaining a deeper shadow and accent hairline, while all other cards dim to 35%. Hold 2 s, then fade over 450 ms inCubic.`,
};

function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
function softCard(k, g, x, y, w, h, r, fill, color, blur, oy) {
  g.save();
  g.shadowColor = color; g.shadowBlur = blur * k.u; g.shadowOffsetY = oy * k.u;
  k.draw.rrect(g, x, y, w, h, r, fill);
  g.restore();
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const reviews = k.copy('reviews', null) || p.reviews;
  const D = p.duration ?? meta.duration;
  const u = k.u;
  const cw = k.pick({ wide: 520, square: 500, tall: 500 }) * u;
  const chh = 260 * u;
  const gap = 28 * u;
  const pitch = cw + gap;
  const pad = 30 * u;
  const bodyO = { role: 'text', size: 28, weight: 460 };
  const cards = reviews.map((r) => {
    let lines = k.text.wrap(r.text, bodyO, cw - pad * 2);
    if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] = lines[1].replace(/\s+\S*$/, '') + '…'; }
    return { ...r, lines };
  });
  const n = cards.length;
  // integrated drift: speed 1 until 2.0 s, eased down to 0.15 by 2.8 s
  const DT = 1 / 240, table = [0];
  for (let i = 1; i <= Math.ceil(D / DT) + 2; i++) {
    const tt = i * DT;
    const s = 1 - 0.85 * m.smoothstep(2.0, 2.8, tt);
    table.push(table[i - 1] + s * DT);
  }
  const travel = (t) => { const f = Math.max(0, t) / DT; const i = Math.min(table.length - 2, Math.floor(f)); return m.lerp(table[i], table[i + 1], f - i); };
  const LIFT = 2.4;
  // which top-row card is nearest the centre at LIFT (row 0 slot j has review index (j mod n))
  const rowX = (row, j, t) => {
    const off = travel(t) * p.speed * u * (row % 2 === 0 ? -1 : 1) * (1 + 0.12 * (row >> 1));
    const base = (row % 2 === 0 ? 0 : pitch * 0.5) + (row >> 1) * pitch * 0.27;
    return base + j * pitch + off; // card centre relative to frame centre before wrapping
  };
  const wrapX = (x, span) => ((((x + span / 2) % span) + span) % span) - span / 2;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const S = k.safe;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const rowGap = k.pick({ wide: 300, square: 310, tall: 310 }) * u;
      const nRows = k.pick({ wide: 2, square: 3, tall: 4 });
      const rowsY = [];
      for (let r = 0; r < nRows; r++) rowsY.push(k.cy + (r - (nRows - 1) / 2) * rowGap);
      const heroRow = Math.floor((nRows - 1) / 2);
      const slots = Math.max(n, Math.ceil(k.W / pitch) + 3);
      const span = slots * pitch;
      const lift = ease.emphasized(m.seg(t, LIFT, 0.9));
      const dim = 1 - 0.65 * ease.inOutCubic(m.seg(t, LIFT - 0.15, 0.6));
      const bigScale = k.pick({ wide: 1.35, square: 1.45, tall: 1.6 });
      const appear = ease.outCubic(m.seg(t, 0, 0.6));
      // hero slot: top row slot nearest centre at LIFT
      let heroJ = 0, best = 1e9;
      for (let j = 0; j < slots; j++) { const x = Math.abs(wrapX(rowX(heroRow, j, LIFT), span)); if (x < best) { best = x; heroJ = j; } }

      const drawCard = (rv, x, y, scale, alpha, isHero, key) => {
        if (alpha <= 0.01) return;
        g.save();
        g.translate(x, y); g.scale(scale, scale); g.translate(-cw / 2, -chh / 2);
        g.globalAlpha = alpha;
        const R = 24 * u;
        softCard(k, g, 0, 0, cw, chh, R, k.isDark ? C.mix(c.surface, c.bg, 0.12) : c.surface,
          k.isDark ? 'rgba(0,0,0,0.5)' : `rgba(20,30,60,${isHero ? 0.16 * lift + 0.08 : 0.08})`, isHero ? 40 + 30 * lift : 36, isHero ? 14 + 14 * lift : 12);
        k.draw.rrect(g, 0.5, 0.5, cw - 1, chh - 1, R, null, isHero && lift > 0 ? C.mix(C.alpha(c.fg, 0.08), C.alpha(c.accent, 0.6), lift) : C.alpha(c.fg, k.isDark ? 0.09 : 0.07), 1);
        // stars
        for (let s = 0; s < 5; s++) {
          const on = s < (rv.stars ?? 5);
          k.draw.icon(g, 'star', pad + 12 * u + s * 30 * u, pad + 12 * u, 26 * u, on ? (c.accent2 || c.accent) : C.alpha(c.fg, 0.2), { fill: true, stroke: 0.01 });
        }
        const qa = { qaGroup: key, qaOverlap: isHero && lift > 0 && lift < 1 };
        rv.lines.forEach((ln, i) => k.text.draw(g, ln, pad, pad + 62 * u + i * 38 * u, { ...bodyO, baseline: 'top', ...qa }));
        const avR = 24 * u, ay = chh - pad - avR;
        const tint = [c.accent, c.accent2 || c.accent, c.accent3 || c.accent][rv.name.length % 3];
        k.draw.circle(g, pad + avR, ay, avR, tint);
        k.text.draw(g, initials(rv.name), pad + avR, ay, { role: 'text', size: 20, weight: 650, color: k.color.onColor(tint), align: 'center', baseline: 'middle', alpha: m.smoothstep(0.7, 0.95, alpha), ...qa });
        k.text.draw(g, rv.name, pad + avR * 2 + 16 * u, ay - 2 * u, { role: 'text', size: 24, weight: 600, baseline: 'bottom', ...qa });
        k.text.draw(g, rv.role, pad + avR * 2 + 16 * u, ay + 2 * u, { role: 'text', size: 22, weight: 450, color: c.muted, baseline: 'top', ...qa });
        g.restore();
      };

      let heroDraw = null;
      for (let row = 0; row < nRows; row++) {
        for (let j = 0; j < slots; j++) {
          const x = k.cx + wrapX(rowX(row, j, t), span);
          if (x < -cw || x > k.W + cw) continue;
          const rv = cards[(j * 5 + row * 3 + (row >> 1)) % n];
          const edge = m.smoothstep(-cw * 0.1, k.W * 0.1, x - cw / 2) * m.smoothstep(k.W + cw * 0.1, k.W * 0.9, x + cw / 2);
          const isHero = row === heroRow && j === heroJ;
          if (isHero && lift > 0) {
            const hx = m.lerp(x, k.cx, lift), hy = m.lerp(rowsY[heroRow], k.cy, lift);
            const he = m.lerp(edge, 1, lift);
            heroDraw = () => drawCard(rv, hx, hy, m.lerp(1, bigScale, lift), he * appear * fade, true, 'hero');
            continue;
          }
          drawCard(rv, x, rowsY[row], 1, edge * appear * fade * dim * (row % 2 ? 0.96 : 1), false, `r${row}s${j}`);
        }
      }
      if (heroDraw) {
        if (k.isDark) k.draw.glow(g, k.cx, k.cy, cw * bigScale * 0.8, c.accent, 0.1 * lift * fade);
        heroDraw();
      }
    },
  };
}
