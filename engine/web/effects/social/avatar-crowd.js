// Initials avatars pop into a Vogel-spiral ring, inner first and faster and faster,
// while the count in the open centre climbs with them. When the last avatar lands the
// number settles on the real copy.stats value and its label rises beneath.
export const meta = {
  id: 'social.avatar-crowd',
  name: 'Avatar Crowd',
  category: 'social',
  duration: 5,
  summary: 'Fictional initials avatars pop into a growing golden-angle ring, accelerating outward, while the centre count climbs in step and lands on the copy.stats number with its label; a soft pulse rolls through the crowd; holds, then fades in the last 0.45 s.',
  bestFor: ['community', 'adoption', 'waitlist'],
  slots: ['stats'],
  params: {
    stat: { default: 0, min: 0, max: 2, label: 'copy.stats index for the count' },
    seed: { default: 5, label: 'Avatar initials / colour seed' },
  },
  sfx: [{ t: 0.3, type: 'type', n: 30, dur: 2.0, gain: 0.3 }, { t: 2.4, type: 'tick', gain: 0.8 }],
  prompt: `Crowd counter, 5 s. Place ~70 avatars on a golden-angle (Vogel) spiral restricted to a ring from 58% to 100% of a radius equal to 43% of frame height; each is a 34 px circle with a 3 px bg-coloured outline and 24 px initials, tinted from mixes of the accent with the surface (about one in ten uses a secondary hue). They pop in inner-first: start time 0.25 s + 2.1 s x (i/n)^0.55 so the cadence accelerates, each scaling from 40% with outBack (overshoot 1.3) over 380 ms. The centre count (display, fitted inside the ring hole with clearance from the inner avatars, -0.045 em) counts with the share of avatars already landed (eased), reaching the copy.stats value at ~2.4 s, and its label rises 14 px with outExpo beneath. On landing, a 900 ms radial pulse scales avatars up to 8% outward from the centre. Hold, then fade over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const stats = k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'customers' }];
  const st = stats[Math.min(p.stat, stats.length - 1)];
  const D = p.duration ?? meta.duration;
  const rng = m.rng(p.seed);
  const LET = 'ABCDEFGHIJKLMNOPRSTVWYZ';
  const N = 70;
  const inner = 0.58;
  const ga = Math.PI * (3 - Math.sqrt(5));
  const av = [];
  for (let i = 0; i < N; i++) {
    // ring-restricted vogel: area-uniform radius between inner and 1
    const f = (i + 0.5) / N;
    const r = Math.sqrt(inner * inner + f * (1 - inner * inner));
    const a = i * ga;
    av.push({
      x: Math.cos(a) * r, y: Math.sin(a) * r, r,
      ini: LET[Math.floor(rng() * LET.length)] + LET[Math.floor(rng() * LET.length)],
      tint: rng(), mixAmt: rng(),
      t0: 0.25 + 2.1 * Math.pow(i / (N - 1), 0.55),
    });
  }
  const landT = av[N - 1].t0 + 0.2;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const R = Math.min(k.H * 0.43, k.W * 0.46);
      const ar = 34 * u * (R / (464 * u));
      const avR = Math.max(32 * u, Math.min(38 * u, ar));
      const pulseT = m.seg(t, landT, 0.9);
      const tintOf = (q) => {
        if (q.tint < 0.06) return c.accent2 || c.accent;
        if (q.tint < 0.11) return c.accent3 || c.accent;
        return C.mix(c.accent, k.isDark ? C.mix(c.surface, c.fg, 0.25) : C.mix(c.surface, c.fg, 0.35), q.mixAmt * 0.7);
      };
      let landed = 0;
      g.save();
      g.globalAlpha = fade;
      for (const q of av) {
        const pp = m.seg(t, q.t0, 0.38);
        if (pp <= 0) continue;
        landed += m.seg(t, q.t0, 0.15);
        const sc = 0.4 + 0.6 * ease.outBack(pp, 1.3);
        const wave = Math.exp(-(((pulseT * 1.4 - (q.r - inner) / (1 - inner)) / 0.18) ** 2)) * (1 - pulseT);
        const s = sc * (1 + 0.08 * wave);
        const x = k.cx + q.x * R, y = k.cy + q.y * R;
        const tint = tintOf(q);
        const a = m.clamp(pp * 3);
        g.globalAlpha = fade * a;
        k.draw.circle(g, x, y, (avR + 3 * u) * s, c.bg);
        k.draw.circle(g, x, y, avR * s, tint);
        if (wave > 0.05 && k.isDark) k.draw.glow(g, x, y, avR * 2.2, c.accent, 0.25 * wave);
        // initials only once the avatar is near full size (never tiny letters)
        const ta = m.smoothstep(0.85, 1, sc) * fade * a;
        if (ta > 0) {
          g.save(); g.translate(x, y); g.scale(s, s);
          k.text.draw(g, q.ini, 0, 0, { role: 'text', size: 24, weight: 640, tracking: 0.01, color: k.color.onColor(tint), align: 'center', baseline: 'middle', alpha: m.smoothstep(0.85, 1, sc) * m.smoothstep(0.75, 1, fade), qaGroup: 'av' + q.ini + q.x.toFixed(3) });
          g.restore();
        }
      }
      g.restore();

      // centre count
      const share = ease.outCubic(landed / N);
      const nIn = ease.outExpo(m.seg(t, 0.2, 0.6)) * fade;
      const dec = st.decimals || 0;
      const finalStr = fmt(st.value, dec) + (st.suffix || '');
      const o = { size: 150, weight: 650, tracking: -0.045 };
      o.size = k.text.fit(finalStr, o, (R * inner - avR * 2.1) * 2);
      const L = k.text.layout(finalStr, o);
      const shown = t >= landT ? finalStr : fmt(st.value * share, dec) + (st.suffix || '');
      if (nIn > 0) {
        if (k.isDark) k.draw.glow(g, k.cx, k.cy, R * inner * 1.2, c.accent, 0.1 * nIn);
        k.text.draw(g, shown, k.cx, k.cy - 18 * u + (1 - nIn) * 16 * u, { ...o, align: 'center', baseline: 'middle', alpha: nIn });
      }
      const la = ease.outExpo(m.seg(t, landT - 0.1, 0.8)) * fade;
      if (la > 0) {
        const lo = { role: 'text', size: 34, weight: 480 };
        k.text.draw(g, st.label, k.cx, k.cy - 18 * u + L.cap / 2 + 30 * u + (1 - la) * 14 * u, { ...lo, size: k.text.fit(st.label, lo, R * inner * 1.6, 24), color: c.muted, align: 'center', baseline: 'top', alpha: la });
      }
    },
  };
}
