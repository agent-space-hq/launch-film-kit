// One word, set far bigger than the frame, glides past the camera. Only parts of
// the letters fit in shot, so they read as bold abstract shapes, and the enclosed
// counters (the holes in e, a, o...) are flooded with the brand colour.
export const meta = {
  id: 'type.oversize-pan',
  name: 'Oversize Pan',
  category: 'type',
  duration: 5,
  summary: 'A single word several times larger than the frame pans slowly across it, cropped on purpose; its enclosed counters are filled with the accent gradient so the crop reads as brand-coloured shapes. Continuous drift, no exit.',
  bestFor: ['brand interstitial', 'section opener', 'texture behind VO'],
  slots: ['oversizeWord'],
  params: {
    word: { default: null, label: 'Word (defaults to copy.oversizeWord, then the brand name)' },
    zoom: { default: 1, min: 0.6, max: 1.6, label: 'Scale multiplier' },
  },
  sfx: [{ t: 0.0, type: 'swell', dur: 1.2, gain: 0.3 }, { t: 2.2, type: 'whoosh', dur: 1.6, gain: 0.25 }],
  prompt: `Pick one word (default: the brand name). Rasterise it once, offscreen, at about 600 px, flood-fill the background from the canvas border, and treat every transparent pixel the fill cannot reach as a counter; dilate that mask by 3 px and tint it with a diagonal accent gradient that shifts 8-10% in lightness. Each frame, draw the scaled counter image first, then the word as live vector text on top so its edges stay razor sharp. Size: x-height about 95% of frame height on 16:9, 80% on 4:5, 52% on 9:16, weight 700, tracking -0.04 em; x-height centred vertically. Pan from the word's left edge to its right edge over the whole shot with an inOutSine curve, with a 6% scale drift down and a 2% vertical drift. Foreground colour on the background; counters are the only colour in frame. Intentionally cropped; there is no hold or exit.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const D = p.duration ?? meta.duration;
  const word = p.word || k.copy('oversizeWord', null) || k.brand.name || 'Orbit';
  const fam = k.brand.fonts.display.family;
  const WEIGHT = 700, TRACK = -0.04;
  // ---- counters: raster once, flood-fill the outside, what remains empty is a counter
  const RP = 600; // raster font px
  const sc = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  sc.font = `${WEIGHT} ${RP}px "${fam}"`;
  sc.letterSpacing = `${TRACK * RP}px`;
  const mt = sc.measureText(word);
  const pad = Math.ceil(RP * 0.12);
  const cw = Math.ceil(mt.width + pad * 2), ch = Math.ceil(RP * 1.4);
  const base = Math.round(RP * 1.02);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const cg = cv.getContext('2d', { willReadFrequently: true });
  cg.font = sc.font; cg.letterSpacing = sc.letterSpacing; cg.fillStyle = '#fff';
  cg.fillText(word, pad, base);
  const data = cg.getImageData(0, 0, cw, ch).data;
  const N = cw * ch;
  const solid = new Uint8Array(N);
  for (let i = 0; i < N; i++) solid[i] = data[i * 4 + 3] > 110 ? 1 : 0;
  const outside = new Uint8Array(N);
  const stack = new Int32Array(N);
  let sp = 0;
  const push = (i) => { if (!outside[i] && !solid[i]) { outside[i] = 1; stack[sp++] = i; } };
  for (let x = 0; x < cw; x++) { push(x); push((ch - 1) * cw + x); }
  for (let y = 0; y < ch; y++) { push(y * cw); push(y * cw + cw - 1); }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % cw;
    if (x > 0) push(i - 1);
    if (x < cw - 1) push(i + 1);
    if (i >= cw) push(i - cw);
    if (i < N - cw) push(i + cw);
  }
  // counter mask, dilated by R px (separable max) so the vector glyph edge hides the seam
  const R = 3;
  let msk = new Uint8Array(N);
  for (let i = 0; i < N; i++) msk[i] = !outside[i] && !solid[i] ? 1 : 0;
  const tmp = new Uint8Array(N);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    let v = 0; for (let d = -R; d <= R && !v; d++) { const xx = x + d; if (xx >= 0 && xx < cw && msk[y * cw + xx]) v = 1; }
    tmp[y * cw + x] = v;
  }
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    let v = 0; for (let d = -R; d <= R && !v; d++) { const yy = y + d; if (yy >= 0 && yy < ch && tmp[yy * cw + x]) v = 1; }
    msk[y * cw + x] = v;
  }
  const hasCounters = msk.some((v) => v);
  const counter = document.createElement('canvas'); counter.width = cw; counter.height = ch;
  {
    const g2 = counter.getContext('2d');
    const img = g2.createImageData(cw, ch);
    for (let i = 0; i < N; i++) img.data[i * 4 + 3] = msk[i] ? 255 : 0;
    g2.putImageData(img, 0, 0);
    g2.globalCompositeOperation = 'source-in';
    const c = k.brand.colors;
    const grd = g2.createLinearGradient(0, 0, cw, ch);
    grd.addColorStop(0, c.accent);
    grd.addColorStop(1, k.color.shade(c.accent, k.isDark ? 0.1 : -0.08));
    g2.fillStyle = grd; g2.fillRect(0, 0, cw, ch);
  }
  const xhR = sc.measureText('x').actualBoundingBoxAscent; // x-height at raster size
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const xhTarget = k.H * k.pick({ wide: 0.95, square: 0.8, tall: 0.52 }) * p.zoom;
      const drift = ease.inOutSine(m.seg(t, 0, D));
      const px = (xhTarget / xhR) * RP * (1.06 - 0.06 * drift);
      const s = px / RP;
      const wordW = mt.width * s;
      // pan: the word's left edge (plus a margin) -> its right edge
      const margin = k.W * 0.04;
      const x = m.lerp(margin, k.W - wordW - margin, drift);
      const xh = xhR * s;
      const y = k.cy + xh / 2 + (drift - 0.5) * k.H * 0.02; // baseline
      if (hasCounters) {
        g.save();
        g.imageSmoothingQuality = 'high';
        g.drawImage(counter, x - pad * s, y - base * s, cw * s, ch * s);
        g.restore();
      }
      k.qa.allowOffstage(() => {
        k.text.draw(g, word, x, y, { role: 'display', size: px / k.u, weight: WEIGHT, tracking: TRACK, color: c.fg });
      });
    },
  };
}
