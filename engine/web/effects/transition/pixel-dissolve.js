// A digital dissolve: the outgoing shot steps down into ever larger pixel blocks,
// the blocks flip from A to B in an ordered (Bayer) dither pattern, and the
// incoming shot steps back up to full resolution.
export const meta = {
  id: 'transition.pixel-dissolve',
  name: 'Pixel Dissolve',
  category: 'transition',
  duration: 1.1,
  summary: 'A mosaics into growing square blocks in discrete steps; the blocks switch from A to B in an 8x8 ordered-dither order; B then resolves back to full sharpness.',
  bestFor: ['tech / digital cut', 'data to product', 'playful change'],
  params: {
    maxBlock: { default: 56, min: 16, max: 120, label: 'Largest block (ref px)' },
  },
  sfx: [{ t: 0.1, type: 'type', n: 10, dur: 0.9, gain: 0.3 }, { t: 0.55, type: 'tick', gain: 0.5 }],
  prompt: `Over 1100 ms. Block size follows a sine hump of linear progress (raised to 0.8 so it climbs fast), quantised to discrete steps: 1 (sharp), 4, 8, 16, 28, 40, 56 reference px; so A crunches down in steps and B steps back up. For each frame, downscale A and B to (frame / block) cells by repeated halving (a true box filter, so each cell is the average colour of its block), then compose cell by cell: a cell shows B when its 8x8 Bayer threshold (value + 0.5) / 64 is below the mix m, where m runs 0 to 1 over 30-70% of the transition (inOutCubic). Upscale the composed cell image to the frame with smoothing off, so blocks stay crisp. At block size 1 draw the sharp source directly (A before the midpoint, B after). Frame 0 is exactly A, the last frame exactly B.`,
};

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

export function create(k, p) {
  const { ease, m } = k;
  const STEPS = [1, 4, 8, 16, 28, 40, 56].map((v) => (v * p.maxBlock) / 56);
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const maxCols = Math.ceil(k.W / (STEPS[1] * k.u)) + 1, maxRows = Math.ceil(k.H / (STEPS[1] * k.u)) + 1;
  const ca = mk(maxCols, maxRows), cb = mk(maxCols, maxRows), co = mk(maxCols, maxRows);
  const ga = ca.getContext('2d', { willReadFrequently: true });
  const gb = cb.getContext('2d', { willReadFrequently: true });
  const go = co.getContext('2d');
  // ping-pong scratch for a true box-filter downscale (repeated halving)
  const h1 = mk(Math.ceil(k.W / 2), Math.ceil(k.H / 2)), h2 = mk(Math.ceil(k.W / 2), Math.ceil(k.H / 2));
  const hg1 = h1.getContext('2d'), hg2 = h2.getContext('2d');
  function shrink(img, cg, cols, rows) {
    let src = img, sw = k.W, sh = k.H, flip = 0;
    while (sw / 2 >= cols * 1.5) {
      const dst = flip ? h2 : h1, dg = flip ? hg2 : hg1;
      const nw = Math.ceil(sw / 2), nh = Math.ceil(sh / 2);
      dg.imageSmoothingEnabled = true; dg.imageSmoothingQuality = 'low';
      dg.clearRect(0, 0, nw, nh);
      dg.drawImage(src, 0, 0, sw, sh, 0, 0, nw, nh);
      src = dst; sw = nw; sh = nh; flip ^= 1;
    }
    cg.imageSmoothingEnabled = true; cg.imageSmoothingQuality = 'high';
    cg.clearRect(0, 0, maxCols, maxRows);
    cg.drawImage(src, 0, 0, sw, sh, 0, 0, cols, rows);
  }
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const f = t / D; // steps are discrete, so the hump itself stays un-eased
      const hump = Math.sin(Math.PI * f) ** 0.8;
      const level = Math.min(STEPS.length - 1, Math.floor(hump * STEPS.length));
      const mix = ease.inOutCubic(m.seg(f, 0.3, 0.4));
      if (level === 0) { g.drawImage(mix < 0.5 ? a : b, 0, 0); return; }
      const bs = STEPS[level] * k.u;
      const cols = Math.ceil(k.W / bs), rows = Math.ceil(k.H / bs);
      shrink(a, ga, cols, rows);
      shrink(b, gb, cols, rows);
      const da = ga.getImageData(0, 0, cols, rows), db = gb.getImageData(0, 0, cols, rows);
      const A = da.data, B = db.data;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const th = (BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
        if (th < mix) { const i = (y * cols + x) * 4; A[i] = B[i]; A[i + 1] = B[i + 1]; A[i + 2] = B[i + 2]; A[i + 3] = 255; }
      }
      go.putImageData(da, 0, 0);
      g.save();
      g.imageSmoothingEnabled = false;
      g.drawImage(co, 0, 0, cols, rows, 0, 0, cols * bs, rows * bs);
      g.restore();
    },
  };
}
