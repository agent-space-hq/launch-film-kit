// The closing card. Mark and wordmark settle side by side, the tagline rises word by
// word beneath, and a URL pill lands last; everything micro-staggers in and then
// holds under a very slow camera push.
export const meta = {
  id: 'cta.end-lockup',
  name: 'End Lockup',
  category: 'cta',
  duration: 4.2,
  summary: 'Mark scales in, the wordmark slides out from behind it, the tagline rises word by word and a URL pill lands; micro-staggered, then holds under a 2.5% slow push.',
  bestFor: ['end card', 'closing frame', 'sign-off'],
  slots: ['tagline', 'headline', 'url'],
  params: {
    push: { default: 0.025, min: 0, max: 0.06, label: 'Slow push amount' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 1.0, gain: 0.45 }, { t: 0.35, type: 'whoosh', dur: 0.4, gain: 0.25 }, { t: 1.0, type: 'pop', gain: 0.3 }],
  prompt: `Centre a lockup: the mark (14% of height) beside the wordmark (display, 12% of height, weight 640, -0.035 em) with a 3.3% gap; beneath it the tagline (text 3.7% of height, muted, balanced) and a hairline URL pill (2.8% of height text, small arrow-up-right icon). At 100 ms the mark scales 0.9 to 1.0 and fades in with emphasized easing over 800 ms, a soft accent glow peaking then settling on dark brands. At 300 ms the wordmark slides out from behind the mark, clipped at the mark's edge, outExpo 900 ms. At 550 ms tagline words rise from a baseline mask, 50 ms stagger, outExpo 700 ms. At 850 ms the URL pill rises 12 px and fades in (outExpo, 700 ms). The whole frame pushes in 2.5% across the shot with a sine in-out drift. Hold from about 1.6 s to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const name = k.brand.name || '';
  const tagline = k.copy('tagline', k.brand.tagline || k.copy('headline', ''));
  const url = k.copy('url', '');
  const wo = { size: k.pick({ wide: 128, square: 128, tall: 144 }), weight: 640, tracking: -0.035 };
  const to = { role: 'text', size: k.pick({ wide: 40, square: 40, tall: 44 }), weight: 450 };
  const uo = { role: 'text', size: k.pick({ wide: 30, square: 30, tall: 30 }), weight: 520, tracking: 0 };
  const tagLines = tagline ? k.text.balance(tagline, to, k.safe.w * 0.8) : [];

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const D = p.duration ?? meta.duration;
      const mh = k.pick({ wide: 150, square: 150, tall: 168 }) * k.u;
      const mw = mh * k.logo.aspect;
      const WL = name ? k.text.layout(name, wo) : null;
      const gap = 36 * k.u;
      const rowW = mw + (WL ? gap + WL.width : 0);
      const rowScale = Math.min(1, (k.safe.w * 0.9) / rowW);
      const tagLH = to.size * 1.35 * k.u;
      const blockH = mh * rowScale + (tagLines.length ? 64 * k.u + tagLines.length * tagLH : 0) + (url ? 110 * k.u : 0);
      const top = k.cy - blockH / 2;
      const rowCy = top + (mh * rowScale) / 2;
      const push = 1 + p.push * ease.inOutSine(m.seg(t, 0, D));
      g.save();
      g.translate(k.cx, k.cy); g.scale(push, push); g.translate(-k.cx, -k.cy);
      // row
      const wp = WL ? ease.outExpo(m.seg(t, 0.3, 0.9)) : 0;
      const rowNow = mw + (WL ? (gap + WL.width) * wp : 0);
      g.save();
      g.translate(k.cx, rowCy); g.scale(rowScale, rowScale);
      const markCx = -rowNow / 2 + mw / 2;
      const mp = ease.emphasized(m.seg(t, 0.1, 0.8));
      if (k.isDark) {
        const pulse = Math.sin(Math.PI * m.seg(t, 0.15, 1.2));
        k.draw.glow(g, markCx, 0, mh * 1.6, c.accent, 0.08 + 0.18 * pulse * mp);
      }
      g.save();
      g.translate(markCx, 0); const ms = m.lerp(0.9, 1, mp); g.scale(ms, ms);
      k.logo.draw(g, 0, 0, mh, { alpha: mp });
      g.restore();
      if (WL && wp > 0) {
        const wx = markCx + mw / 2 + gap;
        g.save();
        g.beginPath(); g.rect(markCx + mw / 2 + 6 * k.u, -mh, k.W, mh * 2); g.clip();
        k.text.draw(g, name, wx - (1 - wp) * WL.width * 0.6, 0, { ...wo, color: c.fg, baseline: 'middle', alpha: wp });
        g.restore();
      }
      g.restore();
      // tagline
      let y = rowCy + (mh * rowScale) / 2 + 64 * k.u + tagLH / 2;
      let wi = 0;
      tagLines.forEach((ln) => {
        const L = k.text.layout(ln, to);
        let x = k.cx - L.width / 2;
        const sp = k.text.layout(' ', to).width;
        for (const w of ln.split(' ')) {
          const W = k.text.layout(w, to);
          const pr = ease.outExpo(m.seg(t, 0.55 + wi * 0.05, 0.7));
          if (pr > 0) {
            g.save();
            g.beginPath(); g.rect(x - 4 * k.u, y - L.cap * 1.1, W.width + 8 * k.u, L.cap * 2.2 + L.inkDescent); g.clip();
            k.text.draw(g, w, x, y + (1 - pr) * L.cap * 1.8, { ...to, color: c.muted, baseline: 'middle', qaGroup: 'tag', qaOffstage: pr < 0.99 });
            g.restore();
          }
          x += W.width + sp; wi++;
        }
        y += tagLH;
      });
      // url pill
      if (url) {
        const up = ease.outExpo(m.seg(t, 0.85, 0.7));
        if (up > 0) {
          const UL = k.text.layout(url, uo);
          const h = 64 * k.u, icS = 24 * k.u;
          const w = UL.width + icS + 12 * k.u + 56 * k.u;
          const py = y - tagLH / 2 + 46 * k.u + h / 2 + (1 - up) * 12 * k.u;
          g.save(); g.globalAlpha = up;
          k.draw.rrect(g, k.cx - w / 2, py - h / 2, w, h, h / 2, C.alpha(c.fg, k.isDark ? 0.05 : 0.04), C.alpha(c.fg, k.isDark ? 0.18 : 0.16), 1);
          const tx = k.cx - (UL.width + 12 * k.u + icS) / 2;
          k.text.draw(g, url, tx, py, { ...uo, color: c.fg, baseline: 'middle' });
          k.draw.icon(g, 'arrow-up-right', tx + UL.width + 12 * k.u + icS / 2, py, icS, c.accent, { stroke: 2.2 });
          g.restore();
        }
      }
      g.restore();
    },
  };
}
