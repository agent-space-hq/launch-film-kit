// A large pill-shaped address field types the domain. A pointer glides in on a
// curve, hovers the Go button, presses it (depress + ripple), and the whole pill
// lights up in the accent.
export const meta = {
  id: 'cta.url-type',
  name: 'URL Type-on',
  category: 'cta',
  duration: 4.4,
  summary: 'The domain (copy.url) types into a big pill address bar under a short lead line; a pointer arcs in, hovers and clicks Go (press + ripple) and the pill glows accent. Holds on the lit pill.',
  bestFor: ['end card', 'call to action', 'visit site'],
  slots: ['url', 'urlLead'],
  params: {
    cps: { default: 14, min: 6, max: 30, label: 'Characters per second' },
  },
  sfx: [{ t: 0.45, type: 'type', n: 8, dur: 0.6, gain: 0.4 }, { t: 1.55, type: 'whoosh', dur: 0.6, gain: 0.2 }, { t: 2.5, type: 'click', gain: 0.8 }, { t: 2.6, type: 'shimmer', gain: 0.5 }],
  prompt: `Centre a pill address field (about 45% of frame width, 12.5% of height, surface fill, hairline, soft shadow) with a lock icon left and an inset "Go" button pill right, under a muted lead line (3.2% of height). The pill fades and scales from 0.96 with outExpo over 600 ms. From 450 ms copy.url types at 14 characters per second with an accent caret (display text 5.6% of height, weight 560). At 1.55 s a pointer arcs in from the lower right on a quadratic bezier over 750 ms (standard) and hovers the button. At 2.5 s it presses: pointer to 0.9 scale, button to 0.95 for 120 ms, a ripple inside the button; then the pill border turns accent at 2 px with an outer glow on dark or tinted shadow on light, the button fills accent and the lock turns accent (outCubic, 400 ms). The pointer drifts 4% away. Hold 1.4 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const url = k.copy('url', 'example.app');
  const lead = k.copy('urlLead', 'Get started at');
  const uo = { size: k.pick({ wide: 60, square: 52, tall: 52 }), weight: 560, tracking: -0.015 };
  const lo = { role: 'text', size: k.pick({ wide: 34, square: 32, tall: 34 }), weight: 460 };
  const go = { role: 'text', size: 30, weight: 640, tracking: -0.01 };
  const times = [];
  let tt = 0.45;
  for (let i = 0; i < url.length; i++) { times.push(tt); tt += (1 / p.cps) * (0.75 + 0.5 * m.hash(i, 4)); }
  const tEnd = tt;
  const TP = 2.5;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const UL = k.text.layout(url, uo);
      const ph = k.pick({ wide: 136, square: 124, tall: 124 }) * k.u;
      const btnW = 150 * k.u, btnH = ph - 24 * k.u;
      const pw = Math.min(Math.max(UL.width + 110 * k.u + btnW + 90 * k.u, k.pick({ wide: 860, square: 760, tall: 760 }) * k.u), k.safe.w * (k.isPortrait ? 0.98 : 0.8));
      const px = k.cx - pw / 2, py = k.cy - ph / 2 + 30 * k.u;
      const appear = ease.outExpo(m.seg(t, 0, 0.6));
      const lit = ease.outCubic(m.seg(t, TP + 0.1, 0.4));
      // lead
      const la = ease.outExpo(m.seg(t, 0.1, 0.7));
      k.text.draw(g, lead, k.cx, py - 70 * k.u + (1 - la) * 12 * k.u, { ...lo, color: c.muted, align: 'center', baseline: 'middle', alpha: la });
      g.save();
      const s0 = m.lerp(0.96, 1, appear);
      g.translate(k.cx, py + ph / 2); g.scale(s0, s0); g.translate(-k.cx, -(py + ph / 2));
      g.globalAlpha = appear;
      // glow / shadow
      if (k.isDark && lit > 0) k.draw.glow(g, k.cx, py + ph / 2, pw * 0.75, c.accent, 0.2 * lit);
      k.draw.shadow(g, px, py, pw, ph, ph / 2, { blur: 60, y: 22, color: k.isDark ? 'rgba(0,0,0,0.6)' : C.mix('rgba(20,30,60,0.16)', C.alpha(c.accent, 0.35), lit) });
      const surf = k.isDark ? C.mix(c.surface, c.fg, 0.05) : '#ffffff';
      k.draw.rrect(g, px, py, pw, ph, ph / 2, surf, C.alpha(c.fg, k.isDark ? 0.12 : 0.1), 1);
      if (lit > 0) {
        g.save(); g.globalAlpha *= lit;
        k.draw.rrect(g, px, py, pw, ph, ph / 2, null, c.accent, 2);
        g.restore();
      }
      // lock
      const lx = px + 58 * k.u, cy = py + ph / 2;
      k.draw.icon(g, 'lock', lx, cy, 40 * k.u, C.mix(c.muted, c.accent, lit), { stroke: 1.9 });
      // url text
      let n = 0;
      for (let i = 0; i < url.length; i++) if (t >= times[i]) n = i + 1;
      const tx = px + 104 * k.u;
      const typed = url.slice(0, n);
      const TL = typed ? k.text.draw(g, typed, tx, cy, { ...uo, color: c.fg, baseline: 'middle' }) : null;
      const caretOn = t < tEnd + 0.1 ? 1 : (((t - tEnd) % 1.06) < 0.53 ? 1 : 0);
      const caretA = caretOn * (1 - m.seg(t, TP, 0.2));
      if (caretA > 0) {
        g.save(); g.globalAlpha *= caretA;
        k.draw.rrect(g, tx + (TL ? TL.width : 0) + 5 * k.u, cy - UL.cap * 0.8, 3.5 * k.u, UL.cap * 1.6, 1.75 * k.u, c.accent);
        g.restore();
      }
      // button
      const bx = px + pw - 12 * k.u - btnW, by = cy - btnH / 2;
      const bcx = bx + btnW / 2;
      const hover = ease.outCubic(m.seg(t, 2.25, 0.15));
      const press = m.seg(t, TP, 0.06) - m.seg(t, TP + 0.12, 0.12);
      const bs = 1 - 0.05 * press;
      g.save();
      g.translate(bcx, cy); g.scale(bs, bs);
      const bFill = C.mix(C.mix(C.alpha(c.fg, k.isDark ? 0.08 : 0.06), C.alpha(c.fg, k.isDark ? 0.14 : 0.1), hover), c.accent, lit);
      k.draw.rrect(g, -btnW / 2, -btnH / 2, btnW, btnH, btnH / 2, bFill);
      const onA = C.onColor(c.accent);
      const gcol = lit > 0.5 ? onA : c.fg;
      const GL = k.text.layout('Go', go);
      const icS = 30 * k.u;
      const gx0 = -(GL.width + 10 * k.u + icS) / 2;
      k.text.draw(g, 'Go', gx0, 0, { ...go, color: gcol, baseline: 'middle' });
      k.draw.icon(g, 'arrow-right', gx0 + GL.width + 10 * k.u + icS / 2 + 3 * k.u * hover, 0, icS, gcol, { stroke: 2.2 });
      // ripple (clipped to the button)
      const rp = m.seg(t, TP + 0.02, 0.6);
      if (rp > 0 && rp < 1) {
        g.save();
        k.draw.rrectPath(g, -btnW / 2, -btnH / 2, btnW, btnH, btnH / 2); g.clip();
        g.globalAlpha *= (1 - rp) * 0.5;
        k.draw.circle(g, 10 * k.u, 6 * k.u, btnW * 0.9 * ease.outCubic(rp), C.alpha(onA, 0.6));
        g.restore();
      }
      g.restore();
      g.restore();
      // pointer
      const mv = ease.standard(m.seg(t, 1.55, 0.75));
      if (mv > 0) {
        const tipX = bcx + 10 * k.u, tipY = cy + 6 * k.u;
        const sx = k.cx + k.W * 0.34, sy = k.cy + k.H * 0.42;
        const qx = tipX + k.W * 0.12, qy = tipY + k.H * 0.32;
        const u = mv;
        let x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * qx + u * u * tipX;
        let y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * qy + u * u * tipY;
        const away = ease.standard(m.seg(t, 2.95, 0.6));
        x += away * k.W * 0.03; y += away * k.H * 0.04;
        const psc = 1.25 * (1 - 0.1 * press);
        g.save();
        g.globalAlpha = Math.min(1, mv * 3);
        k.draw.pointer(g, x, y, psc, { fill: k.isDark ? '#ffffff' : '#ffffff', stroke: '#111111' });
        g.restore();
      }
    },
  };
}
