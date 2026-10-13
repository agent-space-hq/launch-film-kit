// Plan name first, then the price slams in from a larger scale and its digits
// roll like an odometer to the real amount; the currency and period settle in from
// the sides and a quiet "per month" line closes the lockup.
export const meta = {
  id: 'cta.price-reveal',
  name: 'Price Reveal',
  category: 'cta',
  duration: 4.2,
  summary: 'Plan chip rises, the price slams down from 1.25x with odometer digits rolling to copy.price.amount, currency and period slide in, a "per month" line settles; holds on the clean lockup.',
  bestFor: ['pricing', 'offer', 'end card'],
  slots: ['price', 'priceNote'],
  params: {
    shake: { default: true, label: 'Impact shake' },
  },
  sfx: [{ t: 0.1, type: 'whoosh', dur: 0.3, gain: 0.25 }, { t: 0.62, type: 'hit', gain: 0.8 }, { t: 0.65, type: 'type', n: 8, dur: 0.7, gain: 0.3 }, { t: 1.35, type: 'tick', gain: 0.6 }, { t: 1.5, type: 'pop', gain: 0.35 }],
  prompt: `Centre a price lockup. At 100 ms a pill chip with the plan name (tracked caps, 2.3% of height, accent dot) rises 20 px with outExpo over 600 ms. At 350 ms the amount (display, about 27% of height, weight 660, -0.045 em) drops from 1.25x scale and 0 opacity to 1.0 by 650 ms with inCubic, a slam with a 120 ms shake of at most 5 px. Each digit then rolls inside a clip band like an odometer: value = target + (1 - outExpo(progress)) * spins * 10, spins growing to the right, 40 ms column stagger, settled by 1.35 s. The currency (45% of the amount size, cap-top aligned) slides in from the left at 1.0 s and the muted period (30%, baseline aligned) from the right at 1.15 s, both outExpo 600 ms. At 1.4 s a short accent rule grows and a muted "per month" line fades up. Hold 2.5 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const price = k.copy('price', { currency: '$', amount: '19', period: '/mo', plan: 'Pro' });
  const amount = String(price.amount);
  const cur = price.currency || '';
  const per = price.period || '';
  const note = k.copy('priceNote', /mo/i.test(per) ? 'per month' : /y(ea)?r/i.test(per) ? 'per year' : '');
  const plan = String(price.plan || 'Plan').toUpperCase();
  const ao = { size: k.pick({ wide: 300, square: 270, tall: 260 }), weight: 660, tracking: -0.045 };
  // keep the full row inside the safe width
  const rowW = (o) => k.text.layout(amount, o).width + k.text.layout(cur, { ...o, size: o.size * 0.45 }).width + k.text.layout(per, { ...o, size: o.size * 0.3, role: 'text' }).width + o.size * k.u * 0.2;
  while (rowW(ao) > k.safe.w * 0.9 && ao.size > 80) ao.size *= 0.95;
  const co = { size: ao.size * 0.45, weight: 600, tracking: -0.02 };
  const po = { role: 'text', size: ao.size * 0.3, weight: 500, tracking: -0.01 };
  const chipO = { role: 'text', size: k.pick({ wide: 25, square: 25, tall: 27 }), weight: 650, tracking: 0.16 };
  const noteO = { role: 'text', size: k.pick({ wide: 36, square: 34, tall: 36 }), weight: 460 };

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const AL = k.text.layout(amount, ao);
      const CL = k.text.layout(cur, co);
      const PL = k.text.layout(per, po);
      const gapC = ao.size * k.u * 0.06, gapP = ao.size * k.u * 0.035;
      const total = CL.width + gapC + AL.width + gapP + PL.width;
      const ax = k.cx - total / 2 + CL.width + gapC; // amount left edge
      const cy = k.cy + k.pick({ wide: 10, square: 0, tall: 0 }) * k.u;
      const baseY = cy + AL.cap / 2; // alphabetic baseline of the amount
      // slam
      const slam = ease.inCubic(m.seg(t, 0.35, 0.3));
      const sc = m.lerp(1.25, 1, slam);
      const sh = m.seg(t, 0.65, 0.12);
      const amp = p.shake && t >= 0.65 && sh < 1 ? 5 * k.u * (1 - sh) : 0;
      const ox = amp * Math.sin(t * 190), oy = amp * Math.cos(t * 230);
      // chip
      const cp = ease.outExpo(m.seg(t, 0.1, 0.6));
      const chipY = cy - AL.cap / 2 - 110 * k.u + (1 - cp) * 20 * k.u;
      if (cp > 0) {
        const CLb = k.text.layout(plan, chipO);
        const h = 54 * k.u, dot = 10 * k.u;
        const w = CLb.width + 44 * k.u + dot + 14 * k.u;
        g.save(); g.globalAlpha = cp;
        k.draw.rrect(g, k.cx - w / 2, chipY - h / 2, w, h, h / 2, C.alpha(c.fg, k.isDark ? 0.07 : 0.05), C.alpha(c.fg, 0.14), 1);
        k.draw.circle(g, k.cx - w / 2 + 22 * k.u + dot / 2, chipY, dot / 2, c.accent);
        k.text.draw(g, plan, k.cx - w / 2 + 22 * k.u + dot + 14 * k.u, chipY, { ...chipO, color: c.fg, baseline: 'middle' });
        g.restore();
      }
      // amount (odometer)
      if (slam > 0) {
        g.save();
        g.translate(ox, oy);
        g.translate(k.cx, cy); g.scale(sc, sc); g.translate(-k.cx, -cy);
        g.globalAlpha = Math.min(1, slam * 1.8);
        if (k.isDark) k.draw.glow(g, k.cx, cy, AL.width * 0.9, c.accent, 0.12 * (1 - m.seg(t, 0.65, 1.2)) + 0.04);
        g.save();
        g.beginPath(); g.rect(ax - 40 * k.u, cy - AL.cap * 0.6, AL.width + 80 * k.u, AL.cap * 1.2); g.clip();
        const n = AL.glyphs.length;
        const step = AL.cap * 1.3;
        AL.glyphs.forEach((gl, i) => {
          const gx = ax + gl.x + gl.w / 2;
          if (!/[0-9]/.test(gl.ch)) { k.text.draw(g, gl.ch, gx, cy, { ...ao, align: 'center', baseline: 'middle', qaGroup: 'amount' }); return; }
          const target = Number(gl.ch);
          const spins = 1 + (i + 1) / n * 1.5;
          const local = ease.outExpo(m.seg(t, 0.4 + i * 0.04, 0.95));
          const v = target + (1 - local) * spins * 10;
          const d0 = ((Math.floor(v) % 10) + 10) % 10;
          const fr = v - Math.floor(v);
          // the roll moves digits downward: next value enters from the top
          const rolling = local < 0.999; // clipped, partially hidden glyphs while the column spins
          k.text.draw(g, String(d0), gx, cy + fr * step, { ...ao, align: 'center', baseline: 'middle', qaGroup: 'amount', qaOverlap: rolling });
          if (fr > 0.001) k.text.draw(g, String((d0 + 1) % 10), gx, cy + (fr - 1) * step, { ...ao, align: 'center', baseline: 'middle', qaGroup: 'amount', qaOverlap: rolling });
        });
        g.restore();
        g.restore();
      }
      // currency + period
      const cpIn = ease.outExpo(m.seg(t, 1.0, 0.6));
      if (cpIn > 0 && cur) {
        k.text.draw(g, cur, ax - gapC - (1 - cpIn) * 40 * k.u, baseY - AL.cap + CL.cap, { ...co, color: C.mix(c.muted, c.fg, cpIn), align: 'right', baseline: 'alphabetic', alpha: cpIn });
      }
      const ppIn = ease.outExpo(m.seg(t, 1.15, 0.6));
      if (ppIn > 0 && per) {
        k.text.draw(g, per, ax + AL.width + gapP + (1 - ppIn) * 40 * k.u, baseY, { ...po, color: c.muted, baseline: 'alphabetic', alpha: ppIn });
      }
      // note
      const np = ease.outExpo(m.seg(t, 1.4, 0.7));
      if (np > 0 && note) {
        const ny = baseY + AL.inkDescent + 78 * k.u;
        const rw = 64 * k.u * ease.outQuint(m.seg(t, 1.4, 0.6));
        k.draw.rrect(g, k.cx - rw / 2, ny - 46 * k.u, rw, 3 * k.u, 1.5 * k.u, c.accent);
        k.text.draw(g, note, k.cx, ny + (1 - np) * 14 * k.u, { ...noteO, color: c.muted, align: 'center', baseline: 'middle', alpha: np });
      }
    },
  };
}
