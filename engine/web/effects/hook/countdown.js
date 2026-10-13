// 3-2-1-0 inside a 60-tick dial. Each digit's outline draws on, then fills; the old
// digit swells and fades as the next one traces in, and the dial lights a third per
// beat. Zero collapses to a point and the brand mark blooms out of it.
export const meta = {
  id: 'hook.countdown',
  name: 'Countdown',
  category: 'hook',
  duration: 4.6,
  summary: 'Digits 3-2-1-0 trace in as outlines and fill on a ticking 60-tick dial; zero collapses into a point that blooms into the logo and wordmark, which hold to the end.',
  bestFor: ['cold open', 'launch tease', 'reveal'],
  slots: [],
  params: {
    beat: { default: 0.75, min: 0.5, max: 1, label: 'Seconds per digit' },
    wordmark: { default: true, label: 'Show wordmark under the mark' },
  },
  sfx: [{ t: 0.0, type: 'tick', gain: 0.7 }, { t: 0.75, type: 'tick', gain: 0.7 }, { t: 1.5, type: 'tick', gain: 0.7 }, { t: 2.25, type: 'tick', gain: 0.8 }, { t: 2.75, type: 'whoosh', dur: 0.3, gain: 0.35 }, { t: 2.98, type: 'hit', gain: 0.7 }, { t: 3.0, type: 'shimmer', gain: 0.5 }],
  prompt: `Centre a dial of 60 radial ticks (radius 32% of the short side) with a foreground track at 20% opacity. Show 3, 2, 1, 0 in display type, cap height 90% of the radius, one per 750 ms beat; frame 0 already shows the outlined 3. Each digit traces as a 2 px outline (dash grows over 300 ms, outQuint), then fills while scaling 0.96 to 1.0 over 300 ms. At each beat end the old digit scales to 1.12 and fades in 200 ms as the next traces in. Ticks light clockwise from 12 o'clock in the accent, a third per beat, each step outQuint over 400 ms with a longer leading tick. At 2.7 s the 0 shrinks to a point (inCubic, 280 ms), the dial contracts to 55% and fades, and the logo blooms from 0.6 to 1.0 scale (outExpo, 700 ms, soft glow on dark) with the wordmark rising beneath. Hold 1.4 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const digits = ['3', '2', '1', '0'];
  const B = p.beat;
  const R = 0.32 * Math.min(k.W, k.H);
  const probe = k.text.layout('0', { size: 100, weight: 600, tracking: 0 });
  const fsize = (R * 0.9 * 100) / probe.cap;
  const o = { size: fsize, weight: 600, tracking: 0 };
  const word = k.brand.name || '';
  const wo = { size: k.pick({ wide: 76, square: 70, tall: 72 }), weight: 640, tracking: -0.03 };

  function digitAt(g, ch, cx, cy, outline, fill, scale, alpha) {
    if (alpha <= 0.001) return;
    const c = k.brand.colors;
    const L = k.text.layout(ch, o);
    g.save();
    g.translate(cx, cy);
    g.scale(scale, scale);
    g.globalAlpha *= alpha;
    if (outline > 0 && fill < 1) {
      g.font = L.font;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      const seg = L.px * 3.2;
      g.setLineDash([seg * outline, seg]);
      g.lineWidth = 2.2 * k.u / scale;
      g.lineJoin = 'round';
      g.strokeStyle = C.alpha(c.fg, 0.9 * (1 - fill * 0.6));
      g.strokeText(ch, 0, L.cap / 2);
      g.setLineDash([]);
    }
    if (fill > 0) k.text.draw(g, ch, 0, 0, { ...o, align: 'center', baseline: 'middle', alpha: fill, color: c.fg, qaGroup: 'digit' });
    g.restore();
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const cx = k.cx, cy = k.cy - (k.isPortrait ? 30 * k.u : 0);
      const tCollapse = 3 * B + 0.45;
      const coll = ease.inCubic(m.seg(t, tCollapse, 0.28));
      const logoP = ease.outExpo(m.seg(t, tCollapse + 0.22, 0.7));
      // dial
      const dialFade = 1 - ease.inOutCubic(m.seg(t, tCollapse, 0.45));
      const dialR = R * m.lerp(1, 0.55, ease.inOutCubic(m.seg(t, tCollapse, 0.45)));
      let prog = 0;
      for (let i = 1; i < 4; i++) prog += ease.outQuint(m.seg(t, i * B - 0.05, 0.4)) / 3;
      if (dialFade > 0.001) {
        g.save();
        g.globalAlpha = dialFade;
        g.lineCap = 'round';
        const N = 60, tl = 26 * k.u;
        const lit = prog * N;
        for (let i = 0; i < N; i++) {
          const a = -Math.PI / 2 + (i / N) * m.TAU;
          const on = m.clamp(lit - i);
          const lead = on > 0 && on < 1 ? 1 : (i === Math.floor(lit) - 1 && prog < 1 ? 0.6 : 0);
          const len = tl * (1 + 0.5 * lead);
          const cs = Math.cos(a), sn = Math.sin(a);
          g.beginPath();
          g.moveTo(cx + cs * (dialR - len / 2), cy + sn * (dialR - len / 2));
          g.lineTo(cx + cs * (dialR + len / 2), cy + sn * (dialR + len / 2));
          g.strokeStyle = on > 0 ? C.mix(C.alpha(c.fg, 0.2), c.accent, Math.min(1, on * 1.2)) : C.alpha(c.fg, 0.2);
          g.lineWidth = 3.4 * k.u * (1 + 0.3 * lead);
          g.stroke();
        }
        g.restore();
      }
      // digits
      for (let i = 0; i < 4; i++) {
        const t0 = i * B - (i === 0 ? 0.35 : 0);
        if (t < t0 - 0.01) continue;
        const outline = ease.outQuint(m.seg(t, t0, 0.3));
        const fill = ease.outCubic(m.seg(t, t0 + 0.28, 0.3));
        let scale = m.lerp(0.96, 1, fill);
        let alpha = 1;
        if (i < 3) {
          const out = ease.outCubic(m.seg(t, (i + 1) * B - 0.06, 0.22));
          if (out >= 1) continue;
          scale *= 1 + 0.12 * out;
          alpha = 1 - out;
        } else {
          scale *= 1 - coll;
          if (coll >= 1) continue;
        }
        digitAt(g, digits[i], cx, cy, outline, fill, scale, alpha);
      }
      // collapse point -> logo bloom
      if (coll > 0 && logoP < 1) {
        const pa = Math.sin(Math.PI * m.seg(t, tCollapse + 0.2, 0.4));
        k.draw.circle(g, cx, cy, 6 * k.u * pa, C.alpha(c.accent, pa));
      }
      if (logoP > 0) {
        const mh = R * 0.95;
        const showWord = p.wordmark && word;
        const WL = showWord ? k.text.layout(word, wo) : null;
        const groupH = mh + (showWord ? 48 * k.u + WL.cap : 0);
        const my = cy - groupH / 2 + mh / 2;
        if (k.isDark) k.draw.glow(g, cx, my, mh * 1.3, c.accent, 0.3 * (1 - m.seg(t, tCollapse + 0.3, 1.2)) + 0.06);
        g.save();
        g.translate(cx, my);
        const s = m.lerp(0.6, 1, logoP);
        g.scale(s, s);
        k.logo.draw(g, 0, 0, mh, { alpha: Math.min(1, logoP * 1.6) });
        g.restore();
        if (showWord) {
          const wp = ease.outExpo(m.seg(t, tCollapse + 0.5, 0.8));
          const wy = my + mh / 2 + 48 * k.u + WL.cap / 2;
          g.save();
          g.beginPath(); g.rect(0, wy - WL.cap, k.W, WL.cap * 2.2); g.clip();
          k.text.draw(g, word, cx, wy + (1 - wp) * WL.cap * 1.4, { ...wo, align: 'center', baseline: 'middle', alpha: wp, qaOffstage: wp < 0.99 });
          g.restore();
        }
      }
    },
  };
}
