// Up to three key numbers count up on odometer-style rolling digits, each with a
// label that fades in once its number lands. Honest numbers only: values come from copy.stats.
export const meta = {
  id: 'data.counter-roll',
  name: 'Odometer Stats',
  category: 'data',
  duration: 4.4,
  summary: 'Rolling-digit counters land on your real metrics one after another, labels settle underneath.',
  bestFor: ['traction', 'proof', 'results'],
  prompt: `Show up to three real metrics side by side (stacked in portrait), each centred in an equal column. Each number is display weight 600, tracking -0.04 em, sized to fit 90% of its column (about 13-16% of the short side). Digits roll like an odometer: every digit slot spins downward through 0-9 inside a clip band one cap-height tall, with later digits spinning more turns. Each digit lands with 1.25 s outExpo, staggered 40 ms left to right, and each metric starts 350 ms after the previous. Commas, decimal points and suffixes fade in at 70% progress. After landing, the label (text weight 480, 3.2% of the short side, muted colour) rises 10 px into place under the number, and an accent underline grows from the centre to half the number's width. Exit in the last 550 ms by fading and lifting 30 px.`,
  params: { stagger: { default: 0.35, label: 'Delay between stats (s)' } },
  sfx: [{ t: 0.3, type: 'type', n: 14, dur: 1.2, gain: 0.35 }, { t: 1.55, type: 'tick', gain: 0.8 }, { t: 1.9, type: 'tick', gain: 0.8 }, { t: 2.25, type: 'tick', gain: 0.8 }],
};

function fmt(v, decimals = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function create(k, p) {
  const { ease, m } = k;
  const stats = (k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'customers' }]).slice(0, 3);
  const n = stats.length;
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const vertical = k.isPortrait;
      const size = k.pick({ wide: n > 2 ? 132 : 160, square: 120, tall: 132 });
      stats.forEach((s, i) => {
        const t0 = 0.25 + i * p.stagger;
        const pr = ease.outExpo(m.seg(t, t0, 1.3));
        const appear = ease.outCubic(m.seg(t, t0 - 0.1, 0.4));
        const exit = ease.inCubic(m.seg(t, (p.duration ?? meta.duration) - 0.55, 0.4));
        const final = fmt(s.value, s.decimals || 0) + (s.suffix || '');
        const cx = vertical ? k.cx : k.cx + (i - (n - 1) / 2) * (k.safe.w / n);
        const cy = vertical ? k.cy + (i - (n - 1) / 2) * 340 * k.u - 30 * k.u : k.cy - 30 * k.u;
        const o = { size, weight: 600, tracking: -0.04, role: 'display' };
        // fit within column
        const colW = vertical ? k.safe.w : (k.safe.w / n) * 0.9;
        o.size = k.text.fit(final, o, colW);
        const L = k.text.layout(final, o);
        const digitsTarget = final;
        const x0 = cx - L.width / 2;
        g.save();
        g.globalAlpha = appear * (1 - exit);
        const yy = cy - exit * 30 * k.u;
        // clip band for rolling digits
        g.beginPath(); g.rect(x0 - 20 * k.u, yy - L.cap * 0.78, L.width + 40 * k.u, L.cap * 1.56 + L.inkDescent); g.clip();
        k.text.glyphs(g, digitsTarget, cx, yy, { ...o, align: 'center', baseline: 'middle', qaGroup: final + i }, (gi, gn, gl) => {
          const ch = gl.ch;
          if (!/[0-9]/.test(ch)) return { a: m.seg(pr, 0.7, 0.3) };
          // each digit spins through values; later digits spin more
          const target = Number(ch);
          const spins = 1 + (gn - gi) * 0.6;
          const local = ease.outExpo(m.seg(t, t0 + gi * 0.04, 1.25));
          const v = target + (1 - local) * spins * 10;
          const d = ((Math.floor(v) % 10) + 10) % 10;
          const frac = v - Math.floor(v);
          return { ch: String(d), y: -frac * L.cap * 1.1 * (1 - local), a: 1 };
        });
        g.restore();
        // label
        const la = ease.outCubic(m.seg(t, t0 + 0.9, 0.5)) * (1 - exit);
        k.text.draw(g, s.label, cx, yy + L.cap * 0.62 + 34 * k.u + (1 - la) * 10 * k.u, { role: 'text', size: k.pick({ wide: 34, square: 32, tall: 34 }), weight: 480, color: c.muted, align: 'center', baseline: 'top', alpha: la });
        // accent underline grows
        const ul = ease.outQuint(m.seg(t, t0 + 1.0, 0.6)) * (1 - exit);
        g.fillStyle = c.accent; g.globalAlpha = 1;
        g.fillRect(cx - (L.width * 0.25) * ul, yy + L.cap * 0.62 + 14 * k.u, L.width * 0.5 * ul, 3 * k.u);
      });
    },
  };
}
