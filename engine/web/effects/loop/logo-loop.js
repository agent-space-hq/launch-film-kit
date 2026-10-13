// A GIF-friendly ident loop: the mark holds centre-frame and cycles through three
// colourways. Each change is a coin-flip of the mark; at the edge-on instant the new
// colourway grows out from behind it as a circular wipe. Seamless.
export const meta = {
  id: 'loop.logo-loop',
  name: 'Logo Loop',
  category: 'loop',
  duration: 6,
  loop: true,
  ownsBackground: true,
  summary: 'The centred mark flips like a coin three times per loop; at each edge-on moment a new colourway (brand, accent, inverse) expands from behind it as a circular wipe; seamless 6 s loop with a static camera.',
  bestFor: ['social avatar loop', 'GIF ident', 'end card loop'],
  slots: [],
  params: {
    wordmark: { default: true, label: 'Show name under the mark' },
  },
  sfx: [{ t: 1.55, type: 'whoosh', dur: 0.4, gain: 0.3 }, { t: 3.55, type: 'whoosh', dur: 0.4, gain: 0.3 }, { t: 5.55, type: 'whoosh', dur: 0.4, gain: 0.3 }],
  prompt: `Split the loop into three equal segments (2 s each in a 6 s loop); each segment is one colourway: brand (page background, mark in its own colours), accent (accent background, mark and name in the best contrasting neutral) and inverse (foreground colour as background, mark in accent plus background colour). The mark sits centred at about 30% of frame height with the brand name (about 7% of frame height) beneath it. In the last 700 ms of each segment the mark flips about its vertical axis: scaleX goes 1 to 0 with inCubic over 300 ms, the colours swap edge-on, then 0 to 1 with outCubic over 400 ms with a slight vertical skew for depth. At the swap a circle of the next colourway expands from the mark centre to cover the frame (outQuint, 450 ms). Time everything from the real loop length so the last segment lands exactly on the first colourway; the seam is invisible.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const c = k.brand.colors, C = k.color;
  const onAccent = C.onColor(c.accent, ['#ffffff', c.bg, c.fg]);
  // colourways: bg, mark colors (per path or single), name colour
  const ways = [
    { bg: c.bg, mark: null, name: c.fg },
    { bg: c.accent, mark: onAccent, name: onAccent },
    { bg: c.fg, markMap: true, name: c.bg },
  ];
  const paths = k.logo.paths;
  const inverseColors = paths.map((pp) => (pp.fill === 'accent' || pp.fill === 'accent2' ? c.accent : c.bg));
  const name = p.wordmark ? k.brand.name || '' : '';
  const markH = k.pick({ wide: 320, square: 300, tall: 290 }) * k.u;
  const wo = { size: k.pick({ wide: 76, square: 70, tall: 68 }), weight: 600, tracking: -0.02 };
  if (name) wo.size = k.text.fit(name, wo, k.safe.w * 0.8);
  const WL = name ? k.text.layout(name, wo) : null;
  const gap = markH * 0.16;
  const totalH = markH + (WL ? gap + WL.cap : 0);
  const mcx = k.cx, mcy = k.cy - totalH / 2 + markH / 2;
  const ny = k.cy + totalH / 2 - (WL ? WL.cap / 2 : 0);
  const Rmax = Math.hypot(k.W, k.H) * 0.6;

  function drawMark(g, way, sx) {
    const o = way.markMap ? { colors: inverseColors } : way.mark ? { color: way.mark } : {};
    g.save();
    g.translate(mcx, mcy);
    g.transform(sx, 0.08 * (1 - Math.abs(sx)) * Math.sign(sx || 1), 0, 1, 0, 0);
    k.logo.draw(g, 0, 0, markH, o);
    g.restore();
  }
  function drawName(g, way) {
    if (!WL) return;
    k.text.draw(g, name, k.cx, ny, { ...wo, align: 'center', baseline: 'middle', color: way.name });
  }

  return {
    draw(g, t) {
      const D = p.duration ?? meta.duration;
      const segLen = D / 3;
      const ph = ((t % D) + D) % D;
      const si = Math.min(2, Math.floor(ph / segLen));
      const local = ph - si * segLen;
      const cur = ways[si], next = ways[(si + 1) % 3];
      const tStart = segLen - 0.7; // transition window inside the segment
      const fIn = m.seg(local, tStart, 0.3), fOut = m.seg(local, tStart + 0.3, 0.4);
      const swapped = local >= tStart + 0.3;
      const wipe = ease.outQuint(m.seg(local, tStart + 0.3, 0.45));
      const sx = swapped ? ease.outCubic(fOut) : 1 - ease.inCubic(fIn);

      // backgrounds: current, then next growing as a circle from the mark centre
      g.fillStyle = cur.bg; g.fillRect(0, 0, k.W, k.H);
      if (wipe > 0) {
        g.save();
        g.beginPath(); g.arc(mcx, mcy, Math.max(0.01, wipe * Rmax), 0, m.TAU); g.clip();
        g.fillStyle = next.bg; g.fillRect(0, 0, k.W, k.H);
        g.restore();
      }
      // soft lift so flat colour fields feel lit (same in every colourway)
      const lg = g.createRadialGradient(mcx, mcy, 0, mcx, mcy, Rmax);
      lg.addColorStop(0, 'rgba(255,255,255,0.06)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg; g.fillRect(0, 0, k.W, k.H);
      const way = swapped ? next : cur;
      drawMark(g, way, Math.max(0.001, sx));
      // the name: old colour outside the wipe circle, new colour inside it
      if (WL) {
        if (!swapped || wipe >= 1) drawName(g, swapped ? next : cur);
        else {
          const r = wipe * Rmax;
          const dx = Math.max(Math.abs(k.cx - mcx) + WL.width / 2, 0), dy = Math.abs(ny - mcy) + WL.cap;
          if (Math.hypot(dx, dy) <= r) drawName(g, next);
          else if (Math.abs(ny - mcy) - WL.cap > r) drawName(g, cur);
          else {
            g.save(); g.beginPath(); g.rect(0, 0, k.W, k.H); g.arc(mcx, mcy, r, 0, m.TAU, true); g.clip('evenodd');
            k.qa.allowOverlap(() => drawName(g, cur));
            g.restore();
            g.save(); g.beginPath(); g.arc(mcx, mcy, r, 0, m.TAU); g.clip();
            k.qa.allowOverlap(() => drawName(g, next));
            g.restore();
          }
        }
      }
    },
  };
}
