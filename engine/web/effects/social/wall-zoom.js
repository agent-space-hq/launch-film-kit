// A dense wall of testimonial cards, too small to read and so drawn as skeleton bars,
// ripples in. The camera then dives (exponential zoom) into one card, the rest of the
// wall dims, and as the card grows its skeleton cross-fades into the real quote.
export const meta = {
  id: 'social.wall-zoom',
  name: 'Wall Zoom',
  category: 'social',
  duration: 5.6,
  summary: 'A wall of tiny skeleton testimonial cards ripples in, the camera dives into one card with an exponential zoom while the wall dims, and the card resolves into the real quote, name and role; holds, then fades in the last 0.45 s.',
  bestFor: ['social proof', 'volume of love', 'testimonial'],
  slots: ['quote'],
  params: {
    seed: { default: 7, label: 'Wall layout seed' },
  },
  sfx: [{ t: 0.1, type: 'shimmer', gain: 0.3 }, { t: 1.0, type: 'whoosh', dur: 1.6, gain: 0.45 }],
  prompt: `Testimonial wall dive, 5.6 s. Build a world grid of cards (300 x 180 units, 20-unit gutters, alternate rows offset half a card) that overfills the frame at the start scale, where each card is ~8% of frame width. Each card is a skeleton: tiny stars, three seeded text bars, an avatar circle, two name bars. Cards ripple in by grid distance from the target (outExpo 500 ms, 54 ms per step). From 1.0 s the camera dives over 2300 ms with emphasized easing: scale interpolates in log space to where the target fills ~62% of frame width (86% on 9:16), and the focus point follows w = (1 - s0/s) / (1 - s0/s1) so the target glides to centre. Other cards dim to 25%; the target gains an accent hairline. Once its smallest line reaches ~22 px on screen, the skeleton cross-fades into the real quote, name and role. Hold, then fade over 450 ms.`,
};

function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const q = k.copy('quote', { text: 'It changed how our whole team ships.', name: 'Sam Rivera', role: 'Engineering Lead, Northwind Labs' });
  const D = p.duration ?? meta.duration;
  const CW = 300, CH = 180, GAP = 20; // world units (ref px)
  const PX = CW + GAP, PY = CH + GAP;
  const rng = m.rng(p.seed);
  const COLS = 17, ROWS = 25;
  const tc = 8, tr = 12; // target cell
  const cards = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    cards.push({
      c, r, x: (c - tc) * PX + (r % 2 ? PX * 0.5 : 0), y: (r - tr) * PY,
      bars: [0.55 + rng() * 0.4, 0.6 + rng() * 0.35, 0.3 + rng() * 0.5],
      name: 0.35 + rng() * 0.3, role: 0.25 + rng() * 0.3,
      tint: Math.floor(rng() * 3), stars: rng() < 0.85 ? 5 : 4,
    });
  }
  const target = cards.find((cd) => cd.c === tc && cd.r === tr);
  target.stars = 5;
  // quote layout in world units
  const qo = { role: 'text', size: 17, weight: 500 };
  let qlines = k.text.wrap(q.text, qo, CW - 40);
  while (qlines.length > 4 && qo.size > 12) { qo.size -= 1; qlines = k.text.wrap(q.text, qo, CW - 40); }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const s0 = (k.W * 0.08) / (CW * u) * (k.isPortrait ? 1.6 : 1);
      const s1 = (k.W * k.pick({ wide: 0.62, square: 0.78, tall: 0.86 })) / (CW * u);
      const z = ease.emphasized(m.seg(t, 1.0, 2.3));
      const s = s0 * Math.pow(s1 / s0, z);
      const w = (1 - s0 / s) / (1 - s0 / s1);
      // focus: start a little off the target, end on its centre
      const fx0 = target.x + CW / 2 - PX * 1.3, fy0 = target.y + CH / 2 + PY * 0.6;
      const fx = m.lerp(fx0, target.x + CW / 2, w), fy = m.lerp(fy0, target.y + CH / 2, w);
      const S = s * u;
      const toX = (x) => k.cx + (x - fx) * S, toY = (y) => k.cy + (y - fy) * S;
      const dim = 1 - 0.75 * ease.inOutCubic(m.seg(t, 1.6, 1.4));
      const tints = [c.accent, c.accent2 || c.accent, c.accent3 || c.accent];
      const skel = C.alpha(c.fg, k.isDark ? 0.12 : 0.1);
      const skel2 = C.alpha(c.fg, k.isDark ? 0.2 : 0.16);
      const textEff = qo.size * s; // on-screen ref px of the quote text
      const reveal = m.smoothstep(20, 26, 11.5 * s); // gated on the smallest line (role) so nothing tiny is ever opaque
      void textEff;

      g.save();
      g.globalAlpha = fade;
      for (const cd of cards) {
        const x = toX(cd.x), y = toY(cd.y), w2 = CW * S, h2 = CH * S;
        if (x > k.W || y > k.H || x + w2 < 0 || y + h2 < 0) continue;
        const isT = cd === target;
        const dist = Math.hypot(cd.c - tc, cd.r - tr);
        const ap = ease.outExpo(m.seg(t, 0.05 + dist * 0.054, 0.5));
        if (ap <= 0) continue;
        g.save();
        g.globalAlpha = fade * ap * (isT ? 1 : dim);
        g.translate(x, y); g.scale(S, S);
        // card body (self-shadowing fill so fades stay clean)
        g.save();
        if (isT && z > 0) { g.shadowColor = k.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.18)'; g.shadowBlur = 30 * u; g.shadowOffsetY = 10 * u; }
        k.draw.rrect(g, 0, 0, CW, CH, 14, k.isDark ? C.mix(c.surface, c.bg, 0.1) : c.surface);
        g.restore();
        g.lineWidth = 1 / S;
        g.strokeStyle = isT ? C.mix(C.alpha(c.fg, 0.1), C.alpha(c.accent, 0.8), m.seg(z, 0.3, 0.5)) : C.alpha(c.fg, k.isDark ? 0.08 : 0.07);
        k.draw.rrectPath(g, 0, 0, CW, CH, 14); g.stroke();
        // stars
        for (let i = 0; i < 5; i++) {
          g.fillStyle = i < cd.stars ? C.alpha(c.accent2 || c.accent, 0.85) : skel;
          g.beginPath();
          for (let j = 0; j < 10; j++) {
            const a = -Math.PI / 2 + (j * Math.PI) / 5, rr = j % 2 ? 2.6 : 6;
            const px = 26 + i * 15 + Math.cos(a) * rr, py = 24 + Math.sin(a) * rr;
            j ? g.lineTo(px, py) : g.moveTo(px, py);
          }
          g.closePath(); g.fill();
        }
        const skA = isT ? 1 - reveal : 1;
        if (skA > 0) {
          g.globalAlpha *= skA;
          cd.bars.forEach((b, i) => { g.fillStyle = skel2; k.draw.rrectPath(g, 20, 46 + i * 22, (CW - 40) * b, 10, 5); g.fill(); });
          g.fillStyle = tints[cd.tint]; g.beginPath(); g.arc(38, CH - 36, 16, 0, Math.PI * 2); g.fill();
          g.fillStyle = skel2; k.draw.rrectPath(g, 64, CH - 46, (CW - 90) * cd.name, 9, 4.5); g.fill();
          g.fillStyle = skel; k.draw.rrectPath(g, 64, CH - 31, (CW - 90) * cd.role, 8, 4); g.fill();
          g.globalAlpha /= skA;
        }
        g.restore();
      }
      g.restore();

      // real content on the target (drawn in screen space via the same transform)
      if (reveal > 0) {
        const x = toX(target.x), y = toY(target.y);
        g.save();
        g.translate(x, y); g.scale(s, s); // text sizes are already multiplied by k.u
        const a = reveal * fade;
        const lh = qo.size * 1.3 * u;
        qlines.forEach((ln, i) => k.text.draw(g, ln, 20 * u, 44 * u + i * lh + lh / 2, { ...qo, baseline: 'xmiddle', alpha: a, qaGroup: 'quote' }));
        const tint = tints[target.tint];
        g.globalAlpha = a;
        k.draw.circle(g, 38 * u, (CH - 30) * u, 16 * u, tint);
        g.globalAlpha = 1;
        k.text.draw(g, initials(q.name), 38 * u, (CH - 30) * u, { role: 'text', size: 12, weight: 650, color: k.color.onColor(tint), align: 'center', baseline: 'middle', alpha: a * m.smoothstep(0.7, 1, reveal), qaGroup: 'att' });
        k.text.draw(g, q.name, 64 * u, (CH - 31) * u, { role: 'text', size: 13, weight: 620, baseline: 'bottom', alpha: a, qaGroup: 'att' });
        const ro = { role: 'text', size: 11.5, weight: 450 };
        k.text.draw(g, q.role, 64 * u, (CH - 29) * u, { ...ro, size: k.text.fit(q.role, ro, (CW - 84) * u, 8), color: c.muted, baseline: 'top', alpha: a, qaGroup: 'att' });
        g.restore();
      }
    },
  };
}
