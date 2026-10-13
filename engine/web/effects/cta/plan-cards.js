// Three plan cards rise in with a short stagger. The middle plan then lifts on a
// damped spring, scales up, takes an accent border and a "Most popular" chip, while
// its neighbours recede. Columns on wide frames, stacked rows on portrait frames.
export const meta = {
  id: 'cta.plan-cards',
  name: 'Plan Cards',
  category: 'cta',
  duration: 4.8,
  summary: 'Three plan cards rise in staggered; the middle (copy.price) card lifts, scales, gets an accent border and a "Most popular" chip while the others dim; holds on that state.',
  bestFor: ['pricing', 'offer', 'plan comparison'],
  slots: ['plans', 'price', 'features'],
  params: {
    featured: { default: 1, min: 0, max: 2, label: 'Featured card index' },
  },
  sfx: [{ t: 0.15, type: 'whoosh', dur: 0.5, gain: 0.3 }, { t: 1.5, type: 'swell', dur: 0.5, gain: 0.35 }, { t: 1.8, type: 'pop', gain: 0.6 }],
  prompt: `Lay out three plan cards (wide: columns 26% of width x 54% of height, 32 px gap; portrait: full-width rows 11% of height, 28 px gap) with 30 px radius, surface fill, hairline border and soft shadow (glow on dark). Each holds the plan name, a big price (display 7.8% of height; currency and period smaller and muted) and, in columns, a hairline and up to four check-marked features. Cards rise 9% of height and fade in with outExpo over 800 ms, staggered 80 ms; their contents follow 100 ms later. At 1.5 s the featured card lifts 3% and scales to 1.06 on a spring (stiffness 220, damping 22), its border turns accent at 2 px with a soft accent glow, and a solid accent "Most popular" pill pops on its top edge (outBack, 400 ms, at 1.75 s). Neighbours dim 30% toward the background over 500 ms. Hold about 2.5 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const price = k.copy('price', { currency: '$', amount: '19', period: '/mo', plan: 'Pro' });
  const feats = k.copy('features', ['Unlimited projects', 'Team workspaces', 'Priority support', 'Custom roles']);
  const plans = k.copy('plans', null) || [
    { name: 'Starter', price: 'Free', features: feats.slice(0, 2) },
    { name: price.plan || 'Pro', currency: price.currency, price: String(price.amount), period: price.period, features: feats.slice(0, 4) },
    { name: 'Team', price: 'Custom', features: ['Everything in ' + (price.plan || 'Pro'), ...feats.slice(3, 4)] },
  ];
  const rows = k.isPortrait;
  const F = Math.min(plans.length - 1, Math.max(0, p.featured | 0));

  function cardContent(g, pl, x, y, w, h, a, featured) {
    const c = k.brand.colors;
    g.save();
    g.globalAlpha *= a;
    const pad = 40 * k.u;
    const nameO = { role: 'text', size: rows ? 36 : 30, weight: 620, tracking: -0.01 };
    const numeric = /[0-9]/.test(pl.price);
    const priceO = { size: (rows ? 80 : 84) * (numeric ? 1 : 0.74), weight: 660, tracking: -0.04 };
    const subO = { role: 'text', size: rows ? 26 : 28, weight: 480 };
    if (!rows) {
      const ny = y + pad + 16 * k.u;
      k.text.draw(g, pl.name, x + pad, ny, { ...nameO, color: featured ? c.accent : c.fg, baseline: 'middle' });
      const py = ny + 110 * k.u;
      let px = x + pad;
      const PL = k.text.layout(pl.price, priceO);
      if (pl.currency) {
        const co = { ...priceO, size: priceO.size * 0.5 };
        const CL = k.text.draw(g, pl.currency, px, py - PL.cap / 2 + k.text.layout(pl.currency, co).cap / 2, { ...co, color: c.fg, baseline: 'middle' });
        px += CL.width + 6 * k.u;
      }
      k.text.draw(g, pl.price, px, py, { ...priceO, color: c.fg, baseline: 'middle' });
      if (pl.period) k.text.draw(g, pl.period, px + PL.width + 10 * k.u, py + PL.cap / 2, { ...subO, color: c.muted, baseline: 'alphabetic' });
      const ly = py + PL.cap / 2 + 52 * k.u;
      g.fillStyle = C.alpha(c.fg, 0.1); g.fillRect(x + pad, ly, w - pad * 2, Math.max(1, k.u));
      (pl.features || []).slice(0, 4).forEach((f, i) => {
        const fy = ly + 52 * k.u + i * 54 * k.u;
        k.draw.icon(g, 'check', x + pad + 13 * k.u, fy, 26 * k.u, featured ? c.accent : c.muted, { stroke: 2.2 });
        const fo = { ...subO, size: 26 };
        fo.size = Math.min(26, k.text.fit(f, fo, w - pad * 2 - 44 * k.u, 22));
        k.text.draw(g, f, x + pad + 40 * k.u, fy, { ...fo, color: c.fg, baseline: 'middle' });
      });
    } else {
      const cy = y + h / 2;
      k.text.draw(g, pl.name, x + pad, cy - 22 * k.u, { ...nameO, color: featured ? c.accent : c.fg, baseline: 'middle' });
      const desc = (pl.features || []).slice(0, pl === plans[F] ? 2 : 1).join(', ');
      if (desc) k.text.draw(g, desc, x + pad, cy + 24 * k.u, { ...subO, size: 26, color: c.muted, baseline: 'middle' });
      const PL = k.text.layout(pl.price, priceO);
      const perW = pl.period ? k.text.layout(pl.period, subO).width + 8 * k.u : 0;
      const rx = x + w - pad - perW;
      k.text.draw(g, pl.price, rx, cy, { ...priceO, color: c.fg, baseline: 'middle', align: 'right' });
      if (pl.currency) {
        const co = { ...priceO, size: priceO.size * 0.5 };
        k.text.draw(g, pl.currency, rx - PL.width - 6 * k.u, cy - PL.cap / 2 + k.text.layout(pl.currency, co).cap / 2, { ...co, color: c.fg, baseline: 'middle', align: 'right' });
      }
      if (pl.period) k.text.draw(g, pl.period, rx + 8 * k.u, cy + PL.cap / 2, { ...subO, color: c.muted, baseline: 'alphabetic' });
    }
    g.restore();
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const n = plans.length;
      const gap = (rows ? 44 : 32) * k.u;
      const cw = rows ? Math.min(k.safe.w * 0.94, 900 * k.u) : Math.min((k.safe.w - gap * (n - 1)) / n, 470 * k.u);
      const ch = rows ? 230 * k.u : Math.min(k.H * 0.56, 560 * k.u);
      const totW = rows ? cw : cw * n + gap * (n - 1);
      const totH = rows ? ch * n + gap * (n - 1) : ch;
      const lift = ease.spring(t - 1.5, { stiffness: 220, damping: 22 });
      const dim = ease.inOutCubic(m.seg(t, 1.5, 0.5));
      if (k.isDark && lift > 0) {
        const fx = rows ? k.cx : k.cx - totW / 2 + F * (cw + gap) + cw / 2;
        const fy = rows ? k.cy - totH / 2 + F * (ch + gap) + ch / 2 : k.cy;
        k.draw.glow(g, fx, fy + 20 * k.u, Math.max(cw, ch) * (rows ? 0.65 : 0.9), c.accent, 0.12 * m.clamp(lift));
      }
      const order = plans.map((_, i) => i).filter((i) => i !== F).concat([F]);
      for (const i of order) {
        const pl = plans[i];
        const feat = i === F;
        const x0 = rows ? k.cx - cw / 2 : k.cx - totW / 2 + i * (cw + gap);
        const y0 = rows ? k.cy - totH / 2 + i * (ch + gap) + 20 * k.u : k.cy - ch / 2 + 20 * k.u;
        const rp = ease.outExpo(m.seg(t, 0.15 + i * 0.08, 0.8));
        if (rp <= 0) continue;
        const cp = ease.outExpo(m.seg(t, 0.25 + i * 0.08, 0.8));
        const dy = (1 - rp) * k.H * 0.09 - (feat && !rows ? lift * k.H * 0.03 : 0);
        const sc = feat ? 1 + 0.06 * lift : 1;
        const ccx = x0 + cw / 2, ccy = y0 + ch / 2 + dy;
        g.save();
        g.translate(ccx, ccy); g.scale(sc, sc); g.translate(-cw / 2, -ch / 2);
        g.globalAlpha = Math.min(1, rp * 1.4);
        const r = 30 * k.u;
        k.draw.shadow(g, 0, 0, cw, ch, r, { blur: feat ? 70 : 50, y: feat ? 30 : 20, color: k.isDark ? 'rgba(0,0,0,0.55)' : feat ? 'rgba(20,40,120,0.18)' : 'rgba(20,30,60,0.10)' });
        const fill = k.isDark ? C.mix(c.surface, c.fg, feat ? 0.05 * lift : 0.02) : '#ffffff';
        k.draw.rrect(g, 0, 0, cw, ch, r, fill, C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);
        if (feat && lift > 0) {
          g.save(); g.globalAlpha *= m.clamp(lift);
          k.draw.rrect(g, 0, 0, cw, ch, r, null, c.accent, 2);
          g.restore();
        }
        cardContent(g, pl, 0, 0, cw, ch, cp, feat && lift > 0.5);
        if (!feat && dim > 0) {
          g.save(); g.globalAlpha = 0.3 * dim;
          k.draw.rrect(g, -1, -1, cw + 2, ch + 2, r, c.bg);
          g.restore();
        }
        // chip
        const chip = ease.outBack(m.seg(t, 1.75, 0.4));
        if (feat && chip > 0) {
          const lo = { role: 'text', size: 22, weight: 650, tracking: 0.04 };
          const label = k.copy('popularLabel', 'Most popular');
          const LW = k.text.layout(label, lo).width;
          const hh = 44 * k.u, ww = LW + 40 * k.u;
          const chx = rows ? cw - 40 * k.u - ww / 2 : cw / 2;
          g.save();
          g.translate(chx, 0);
          const s2 = 0.85 + 0.15 * chip;
          g.scale(s2, s2);
          g.globalAlpha *= m.clamp(chip * 1.6);
          k.draw.rrect(g, -ww / 2, -hh / 2, ww, hh, hh / 2, c.accent);
          k.text.draw(g, label, 0, 0, { ...lo, color: C.onColor(c.accent), align: 'center', baseline: 'middle' });
          g.restore();
        }
        g.restore();
      }
    },
  };
}
