// The lockup waits as a faint ghost in near-darkness. A diagonal specular band sweeps
// across it, leaving it lit in full colour behind, then a thin rim light lands last.
export const meta = {
  id: 'logo.light-sweep',
  name: 'Light Sweep',
  category: 'logo',
  duration: 4.2,
  summary: 'A tilted specular band crosses a barely-visible lockup, lighting mark and wordmark in its wake; a top-left rim light lands last and the lockup holds.',
  bestFor: ['opening ident', 'end card', 'premium reveal'],
  slots: [],
  params: {
    wordmark: { default: true, label: 'Show wordmark' },
    angle: { default: -22, min: -60, max: 60, label: 'Band tilt (deg)' },
    bandWidth: { default: 0.16, min: 0.06, max: 0.35, label: 'Band width (x lockup)' },
  },
  sfx: [{ t: 0.3, type: 'swell', dur: 1.8, gain: 0.5 }, { t: 2.15, type: 'shimmer', gain: 0.5 }],
  prompt: `Lay out a horizontal lockup (mark about 23% of frame height, brand name about 14%, weight 620, -0.035 em, gap 17% of mark height). From 0 to 500 ms fade it in as a ghost at 7% opacity. From 350 ms a diagonal band tilted about 22 degrees travels across the whole lockup (inOutCubic, 1650 ms). Behind the band the lockup is lit in its real colours at 74% exposure (rising to 100% from 1800 to 2700 ms, so the band always reads brighter) via a gradient mask with a soft 16%-wide edge; on the band itself a white specular highlight, masked to the lockup's silhouette, is added (additive on dark, 65% normal on light), and a wide faint accent spill follows it across the background. At 2100 ms a 2 px inner rim light (accent-tinted white on dark, white on light) fades in over 600 ms on the mark and wordmark, brightest at top-left and falling off toward bottom-right. Hold the lit lockup for the remaining 1.5 s.`,
};

function lockup(k, withWord) {
  const name = withWord ? k.brand.name || '' : '';
  let markH = k.pick({ wide: 250, square: 230, tall: 210 }) * k.u;
  const wo = { size: k.pick({ wide: 150, square: 126, tall: 112 }), weight: 620, tracking: -0.035 };
  let L = name ? k.text.layout(name, wo) : null;
  let gap = markH * 0.17;
  let total = markH * k.logo.aspect + (L ? gap + L.width : 0);
  const maxW = k.safe.w * 0.86;
  if (total > maxW) {
    const f = maxW / total;
    markH *= f; gap *= f; wo.size *= f;
    L = k.text.layout(name, wo);
    total = markH * k.logo.aspect + gap + L.width;
  }
  const markW = markH * k.logo.aspect;
  return { markH, markW, gap, wo, L, total, markX: k.cx - total / 2 + markW / 2, wordX: k.cx - total / 2 + markW + gap };
}

export function create(k, p) {
  const { ease, m } = k;
  const lk = lockup(k, p.wordmark);
  const cy = k.cy;
  const name = k.brand.name;
  const a = (p.angle * Math.PI) / 180;
  const dir = [Math.cos(a), Math.sin(a)];
  // half-extent of the lockup along the sweep direction
  const R = (Math.abs(dir[0]) * lk.total + Math.abs(dir[1]) * lk.markH) / 2 + lk.markH * 0.25;
  const P0 = [k.cx - dir[0] * R, cy - dir[1] * R], P1 = [k.cx + dir[0] * R, cy + dir[1] * R];
  const Ls = k.layer('lsLit'), Lh = k.layer('lsHi'), Lr = k.layer('lsRim');
  const gs = k.ctx(Ls), gh = k.ctx(Lh), gr = k.ctx(Lr);
  const box = { x: k.cx - lk.total / 2 - lk.markH * 0.3, y: cy - lk.markH * 0.8, w: lk.total + lk.markH * 0.6, h: lk.markH * 1.6 };

  const reset = (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(box.x, box.y, box.w, box.h); };
  // Draws the lockup; with `color`, recolours the silhouette afterwards (keeps QA text colour honest).
  const drawLockup = (c, color) => {
    k.logo.draw(c, lk.markX, cy, lk.markH);
    if (lk.L) k.text.draw(c, name, lk.wordX, cy, { ...lk.wo, baseline: 'middle', color: k.brand.colors.fg });
    if (color) {
      c.globalCompositeOperation = 'source-in';
      c.fillStyle = color; c.fillRect(box.x, box.y, box.w, box.h);
      c.globalCompositeOperation = 'source-over';
    }
  };
  const maskWith = (c, stops) => {
    const grd = c.createLinearGradient(P0[0], P0[1], P1[0], P1[1]);
    for (const [o, al] of stops) grd.addColorStop(m.clamp(o), `rgba(0,0,0,${m.clamp(al)})`);
    c.globalCompositeOperation = 'destination-in';
    c.fillStyle = grd;
    c.fillRect(box.x, box.y, box.w, box.h);
    c.globalCompositeOperation = 'source-over';
  };

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const ghost = ease.outCubic(m.seg(t, 0, 0.5));
      const sp = ease.inOutCubic(m.seg(t, 0.35, 1.65));
      const bw = p.bandWidth;
      const s = -bw * 1.2 + sp * (1 + bw * 2.4); // band centre along P0->P1
      const done = sp >= 1;

      // light spill on the backdrop, travelling with the band
      if (sp > 0 && !done) {
        const live = Math.sin(Math.PI * sp);
        const bx = m.lerp(P0[0], P1[0], s), by = m.lerp(P0[1], P1[1], s);
        k.draw.glow(g, bx, by, lk.markH * 2.4, c.accent, (k.isDark ? 0.1 : 0.07) * live);
      }
      // settled glow behind the lit mark (dark only)
      if (k.isDark && sp > 0.3) k.draw.glow(g, lk.markX, cy, lk.markH * 1.5, c.accent, 0.12 * ease.outCubic(m.seg(sp, 0.3, 0.7)));

      // ghost
      if (!done) {
        g.save();
        g.globalAlpha = ghost * (k.isDark ? 0.075 : 0.08);
        k.logo.draw(g, lk.markX, cy, lk.markH, { color: c.fg });
        if (lk.L) k.text.draw(g, name, lk.wordX, cy, { ...lk.wo, baseline: 'middle', color: c.fg });
        g.restore();
      }

      // lit part (behind the band)
      if (sp > 0) {
        reset(gs);
        drawLockup(gs);
        if (!done) maskWith(gs, [[0, 1], [s - bw * 0.5, 1], [s + bw * 0.35, 0], [1, 0]]);
        // exposure: lit but slightly under until the rim lands, so the band reads as brighter
        g.save();
        g.globalAlpha = 0.74 + 0.26 * ease.inOutCubic(m.seg(t, 1.8, 0.9));
        g.drawImage(Ls, 0, 0);
        g.restore();
      }
      // specular band on the silhouette
      if (sp > 0 && !done) {
        reset(gh);
        drawLockup(gh, '#ffffff');
        maskWith(gh, [[0, 0], [s - bw * 0.75, 0], [s - bw * 0.08, 0.85], [s, 1], [s + bw * 0.06, 0.85], [s + bw * 0.45, 0], [1, 0]]);
        g.save();
        g.globalCompositeOperation = k.isDark ? 'lighter' : 'source-over';
        g.globalAlpha = k.isDark ? 0.9 : 0.65;
        g.drawImage(Lh, 0, 0);
        g.restore();
      }

      // rim light, lands last
      const rim = ease.outCubic(m.seg(t, 2.1, 0.6));
      if (rim > 0) {
        reset(gr);
        const w = 5.5;
        const rc = k.isDark ? k.color.mix(c.accent, '#ffffff', 0.45) : '#ffffff';
        k.logo.draw(gr, lk.markX, cy, lk.markH, { fill: false, stroke: { color: rc, width: w } });
        if (lk.L) k.text.draw(gr, name, lk.wordX, cy, { ...lk.wo, baseline: 'middle', color: 'rgba(255,255,255,0)', stroke: { color: rc, width: w * 0.8 } });
        // keep only the inner half of the stroke
        gr.globalCompositeOperation = 'destination-in';
        k.logo.draw(gr, lk.markX, cy, lk.markH, { color: '#000000' });
        if (lk.L) k.text.draw(gr, name, lk.wordX, cy, { ...lk.wo, baseline: 'middle', color: c.fg });
        gr.globalCompositeOperation = 'source-over';
        // light from the top-left
        const grd = gr.createLinearGradient(box.x, box.y, box.x + box.w * 0.55, box.y + box.h);
        grd.addColorStop(0, 'rgba(0,0,0,1)');
        grd.addColorStop(0.55, 'rgba(0,0,0,0.35)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        gr.globalCompositeOperation = 'destination-in';
        gr.fillStyle = grd; gr.fillRect(box.x, box.y, box.w, box.h);
        gr.globalCompositeOperation = 'source-over';
        g.save();
        g.globalAlpha = rim * (k.isDark ? 0.95 : 0.75);
        g.drawImage(Lr, 0, 0);
        g.restore();
      }
    },
  };
}
