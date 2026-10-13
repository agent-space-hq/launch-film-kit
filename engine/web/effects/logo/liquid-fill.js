// An outlined mark fills from the bottom with liquid: two sine layers ride the
// surface, slosh while it rises, then settle dead flat. The mark lifts and the
// wordmark rises beneath it out of a baseline mask.
export const meta = {
  id: 'logo.liquid-fill',
  name: 'Liquid Fill',
  category: 'logo',
  duration: 4.8,
  summary: 'A hairline outline of the mark fills from the bottom with a two-layer wavy liquid surface that settles flat; the mark lifts and the wordmark rises beneath it, then holds.',
  bestFor: ['playful brand reveal', 'end card', 'product with flow or energy'],
  slots: [],
  params: {
    wave: { default: 1, min: 0, max: 2, label: 'Wave height' },
    wordmark: { default: true, label: 'Show wordmark' },
  },
  sfx: [{ t: 0.45, type: 'swell', dur: 1.9, gain: 0.5 }, { t: 2.45, type: 'tick', gain: 0.35 }, { t: 2.75, type: 'whoosh', dur: 0.45, gain: 0.3 }],
  prompt: `Centre the logo at about 26% of frame height and fade in its hairline outline (2 px, foreground at 55%) over 450 ms. From 400 ms a liquid level rises from below the mark's base to above its top (inOutCubic, 2100 ms). The surface is the sum of two travelling sines (wavelengths about 0.9 and 0.45 of the mark width, opposite directions, constant speed); a back layer with its own phase sits 40% of an amplitude higher at 45% opacity. Amplitude ramps to 6% of the mark height in 400 ms and decays to zero from 2300 to 3100 ms, so it settles flat. The liquid is the mark itself in its real colours, clipped below the surface, with a thin bright meniscus and a soft light gradient under it. From 2600 ms the mark lifts (emphasized, 800 ms) while the brand name (about 11% of frame height) rises out of a baseline mask beneath it (outExpo 750 ms). Hold 1.3 s.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const name = p.wordmark ? k.brand.name || '' : '';
  const markH = k.pick({ wide: 280, square: 270, tall: 260 }) * k.u;
  const markW = markH * k.logo.aspect;
  const wo = { size: k.pick({ wide: 112, square: 104, tall: 100 }), weight: 620, tracking: -0.035 };
  if (name) wo.size = k.text.fit(name, wo, k.safe.w * 0.85);
  const WL = name ? k.text.layout(name, wo) : null;
  const gap = markH * 0.2;
  const totalH = markH + (WL ? gap + WL.cap : 0);
  const markCyEnd = k.cy - totalH / 2 + markH / 2;
  const wordCy = k.cy + totalH / 2 - (WL ? WL.cap / 2 : 0);
  const lay = k.layer('liquidFill');
  const lg = k.ctx(lay);
  const N = 64;
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const lift = WL ? ease.emphasized(m.seg(t, 2.6, 0.8)) : 0;
      const mcx = k.cx, mcy = m.lerp(k.cy, markCyEnd, lift);
      const top = mcy - markH / 2, bot = mcy + markH / 2, left = mcx - markW / 2;
      const amp = markH * 0.06 * p.wave * ease.outCubic(m.seg(t, 0.4, 0.4)) * (1 - ease.outCubic(m.seg(t, 2.3, 0.8)));
      const rise = ease.inOutCubic(m.seg(t, 0.4, 2.1));
      const level = m.lerp(bot + markH * 0.06, top - markH * 0.08, rise);
      const surf = (x, back) => {
        const u = (x - left) / markW;
        const ph = back ? 1.7 : 0;
        return level - (back ? amp * 0.4 : 0)
          + amp * (Math.sin(u * m.TAU / 0.9 + t * 3.1 + ph) * 0.7 + Math.sin(u * m.TAU / 0.45 - t * 4.3 + ph * 2.3) * 0.3);
      };
      const wavePath = (cg, back) => {
        cg.beginPath();
        const x0 = left - markW * 0.1, x1 = left + markW * 1.1;
        for (let i = 0; i <= N; i++) {
          const x = m.lerp(x0, x1, i / N);
          const y = surf(x, back);
          if (i === 0) cg.moveTo(x, y); else cg.lineTo(x, y);
        }
        cg.lineTo(x1, bot + markH); cg.lineTo(x0, bot + markH); cg.closePath();
      };

      // outline (fades in, then out once the mark is full)
      const outA = ease.outCubic(m.seg(t, 0, 0.45)) * (1 - ease.inOutCubic(m.seg(t, 2.5, 0.6)));
      if (outA > 0) k.logo.draw(g, mcx, mcy, markH, { fill: false, alpha: outA * (k.isDark ? 0.55 : 0.6), stroke: { color: c.fg, width: 2 } });

      if (rise > 0) {
        const bx = left - markW * 0.15, by = top - markH * 0.2, bw = markW * 1.3, bh = markH * 1.4;
        lg.setTransform(1, 0, 0, 1, 0, 0);
        lg.globalCompositeOperation = 'source-over';
        lg.globalAlpha = 1;
        lg.clearRect(bx, by, bw, bh);
        const flat = amp < 0.05 && rise >= 1;
        if (flat) {
          k.logo.draw(lg, mcx, mcy, markH);
        } else {
          // back layer
          lg.save(); wavePath(lg, true); lg.clip();
          k.logo.draw(lg, mcx, mcy, markH, { alpha: 0.45 });
          lg.restore();
          // front layer
          lg.save(); wavePath(lg, false); lg.clip();
          k.logo.draw(lg, mcx, mcy, markH);
          lg.restore();
          // depth: light under the surface fading downward
          lg.globalCompositeOperation = 'source-atop';
          const lv = surf(mcx, false);
          const grd = lg.createLinearGradient(0, lv - markH * 0.02, 0, lv + markH * 0.35);
          const dl = (k.isDark ? 0.28 : 0.32) * (1 - ease.inOutCubic(m.seg(t, 2.25, 0.6)));
          grd.addColorStop(0, `rgba(255,255,255,${dl.toFixed(3)})`);
          grd.addColorStop(1, 'rgba(255,255,255,0)');
          lg.fillStyle = grd; lg.fillRect(bx, by, bw, bh);
          // meniscus
          lg.beginPath();
          for (let i = 0; i <= N; i++) {
            const x = m.lerp(left - markW * 0.1, left + markW * 1.1, i / N);
            const y = surf(x, false);
            if (i === 0) lg.moveTo(x, y); else lg.lineTo(x, y);
          }
          lg.strokeStyle = k.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)';
          lg.lineWidth = 3.2 * k.u;
          lg.stroke();
          lg.globalCompositeOperation = 'source-over';
        }
        g.drawImage(lay, bx, by, bw, bh, bx, by, bw, bh);
      }

      // wordmark rises out of a baseline mask under the mark
      if (WL && t > 2.75) {
        const e = ease.outExpo(m.seg(t, 2.8, 0.75));
        g.save();
        g.beginPath();
        g.rect(k.cx - WL.width / 2 - 20 * k.u, wordCy - WL.cap * 0.75, WL.width + 40 * k.u, WL.cap * 1.5 + WL.inkDescent);
        g.clip();
        k.text.draw(g, name, k.cx, wordCy + (1 - e) * WL.cap * 1.3, { ...wo, align: 'center', baseline: 'middle', qaOffstage: e < 1 });
        g.restore();
      }
    },
  };
}
