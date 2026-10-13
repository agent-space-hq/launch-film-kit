// An exposure cut: the outgoing shot over-exposes, highlights first, into a
// warm-white bloom; under cover of the peak the image swaps, and the incoming
// shot develops back out of the light.
export const meta = {
  id: 'transition.light-flash',
  name: 'Light Flash',
  category: 'transition',
  duration: 0.9,
  summary: 'A over-exposes (self-added highlights plus a centred bloom) to a near-white peak tinted by the accent; B is swapped in under the peak and develops out of the exposure.',
  bestFor: ['big reveal', 'logo hit', 'energy beat'],
  params: {
    peak: { default: 0.42, min: 0.2, max: 0.7, label: 'Peak position (x duration)' },
    tint: { default: 0.08, min: 0, max: 0.5, label: 'Accent tint at peak' },
  },
  sfx: [{ t: 0.05, type: 'riser', dur: 0.33, gain: 0.4 }, { t: 0.38, type: 'shimmer', gain: 0.5 }],
  prompt: `Exposure value e rises from 0 to 1 over the first 42% of the 900 ms transition (inCubic, accelerating into the flash) and falls back to 0 over the rest (outCubic, quick release then a long develop). Image: before the peak it is A, after it B, crossfaded over a 10%-wide window centred on the peak so the swap is hidden. Over-expose by adding the current image onto itself twice (additive, opacities clamp(2e) and 0.5 clamp(2e-1)) so highlights clip first, like film; then screen a near-white fill (white with an 8% accent tint) at 0.95e squared, plus a radial bloom from the centre (radius 70% of the long side, 0.55e squared). Keep the peak a hair under pure white so it never bands. Frame 0 is exactly A, the last frame exactly B.`,
};

export function create(k, p) {
  const { ease, m } = k;
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const c = k.brand.colors;
      const f = t / D;
      const P = p.peak;
      const e = f < P ? ease.inCubic(f / P) : 1 - ease.outCubic((f - P) / (1 - P));
      const swap = ease.inOutCubic(m.seg(f, P - 0.05, 0.1));
      // base image
      if (swap < 1) g.drawImage(a, 0, 0);
      if (swap > 0) { g.save(); g.globalAlpha = swap; g.drawImage(b, 0, 0); g.restore(); }
      if (e <= 0.001) return;
      g.save();
      // self-add (up to 3x): highlights blow out first, like film
      g.globalCompositeOperation = 'lighter';
      for (const [img, w] of [[a, 1 - swap], [b, swap]]) {
        if (w <= 0) continue;
        g.globalAlpha = Math.min(1, 2 * e) * w;
        g.drawImage(img, 0, 0);
        g.globalAlpha = 0.5 * m.clamp(2 * e - 1) * w; // gentle second pass: avoids hue-clipping saturated colours
        if (g.globalAlpha > 0) g.drawImage(img, 0, 0);
      }
      // screen toward a tinted white
      const white = k.color.mix('#ffffff', c.accent, p.tint);
      g.globalCompositeOperation = 'screen';
      g.globalAlpha = 0.95 * e * e; // the fill arrives late, after the highlights
      g.fillStyle = white;
      g.fillRect(0, 0, k.W, k.H);
      // bloom from the centre
      g.globalAlpha = 0.55 * e * e;
      const R = Math.max(k.W, k.H) * 0.7;
      const grd = g.createRadialGradient(k.cx, k.cy, 0, k.cx, k.cy, R);
      grd.addColorStop(0, k.color.mix('#ffffff', c.accent, p.tint * 0.5));
      grd.addColorStop(0.5, k.color.alpha(white, 0.5));
      grd.addColorStop(1, k.color.alpha(white, 0));
      g.fillStyle = grd;
      g.fillRect(0, 0, k.W, k.H);
      g.restore();
    },
  };
}
