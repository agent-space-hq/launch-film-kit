// Organic ink blooms in the brand colours spread out from the mark; a lagging
// "clearing" bloom follows from inside, so the ink becomes a living wavefront that
// uncovers the mark behind it and evaporates at the edges. Wordmark joins after.
export const meta = {
  id: 'logo.ink-bloom',
  name: 'Ink Bloom',
  category: 'logo',
  duration: 4.8,
  summary: 'Noise-edged ink blobs in the brand colours bloom outward from the mark; a lagging clear bloom eats them from inside, uncovering the mark, then the wordmark joins and the lockup holds.',
  bestFor: ['creative brand reveal', 'organic or design-led brands', 'opening ident'],
  slots: [],
  params: {
    wobble: { default: 1, min: 0, max: 2, label: 'Edge wobble' },
    wordmark: { default: true, label: 'Show wordmark' },
  },
  sfx: [{ t: 0.15, type: 'swell', dur: 1.6, gain: 0.5 }, { t: 0.9, type: 'shimmer', gain: 0.35 }, { t: 2.35, type: 'whoosh', dur: 0.45, gain: 0.3 }],
  prompt: `Place six ink blobs on and around a centred logo (logo about 24% of frame height): two large accent blobs, one deeper accent, one accent mixed toward the foreground and one small secondary-accent blob, plus four small satellite droplets. Each blob outline is a closed curve of 72 points whose radius is modulated by two octaves of 3D noise (20% and 7%) that evolve slowly over time. Blob i blooms from 200 + i x 90 ms to its radius (32-85% of the mark height, centres spread up to 0.6 mark heights) with outQuint over 1600 ms. A matching set of clear blobs with the same centres but their own noise seed follows 600 ms later, growing to 130% of the ink radius with outQuint over 1800 ms; it is cut out of the ink and is the only region where the real mark is drawn. The ink therefore reads as a coloured wavefront that uncovers the mark and is gone by about 2800 ms. At 2400 ms the mark glides left (emphasized, 850 ms) and the name fades up glyph-staggered (outQuint 700 ms, 50 ms apart, from 2620 ms). Hold 1.3 s.`,
};

function lockup(k, withWord) {
  const name = withWord ? k.brand.name || '' : '';
  let markH = k.pick({ wide: 260, square: 240, tall: 220 }) * k.u;
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
  const { markH } = lk;
  const noise = m.makeNoise(31);
  const r = m.rng(8);
  const c = k.brand.colors;
  const C = k.color;
  // role: colour of each blob (accent dominant, accent2 only small)
  const roles = [
    { col: c.accent, x: -0.08, y: 0.06, R: 0.85 },
    { col: C.shade(c.accent, k.isDark ? -0.08 : -0.12), x: 0.38, y: -0.3, R: 0.6 },
    { col: c.accent, x: -0.45, y: -0.2, R: 0.58 },
    { col: C.mix(c.accent, c.fg, k.isDark ? 0.35 : 0.25), x: 0.3, y: 0.42, R: 0.5 },
    { col: c.accent2 || c.accent, x: -0.5, y: 0.45, R: 0.32 },
    { col: c.accent, x: 0.58, y: 0.12, R: 0.48 },
  ];
  const blobs = roles.map((b, i) => ({ ...b, t0: 0.2 + i * 0.09, seed: r() * 50 }));
  // satellite droplets
  for (let i = 0; i < 4; i++) {
    const a = r() * m.TAU, d = 0.62 + r() * 0.2;
    blobs.push({ col: i === 2 ? c.accent2 || c.accent : c.accent, x: Math.cos(a) * d * 1.15, y: Math.sin(a) * d, R: 0.07 + r() * 0.06, t0: 0.45 + r() * 0.35, seed: r() * 50 });
  }
  const N = 72;
  const Lk = k.layer('inkBloom'), gk = k.ctx(Lk);
  const Lm = k.layer('inkBloomMark'), gm = k.ctx(Lm);

  function blobPath(cg, b, cx, cy, R, t, keep, seedOff = 0) {
    if (!keep) cg.beginPath();
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * m.TAU, ca = Math.cos(a), sa = Math.sin(a);
      const sd = b.seed + seedOff;
      const n = noise(ca * 1.3 + sd, sa * 1.3, t * 0.45) * 0.2 + noise(ca * 3.4 + sd, sa * 3.4 + 9, t * 0.7) * 0.07;
      const rr = R * (1 + n * p.wobble);
      pts.push([cx + ca * rr, cy + sa * rr]);
    }
    // smooth closed curve through midpoints
    const mid = (i) => { const a = pts[i % N], q = pts[(i + 1) % N]; return [(a[0] + q[0]) / 2, (a[1] + q[1]) / 2]; };
    const m0 = mid(N - 1);
    cg.moveTo(m0[0], m0[1]);
    for (let i = 0; i < N; i++) { const q = mid(i); cg.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); }
    cg.closePath();
  }

  return {
    draw(g, t) {
      const slide = lk.L ? ease.emphasized(m.seg(t, 2.4, 0.85)) : 0;
      const mcx = m.lerp(k.cx, lk.markX, slide), mcy = k.cy;
      const box = { x: mcx - markH * 2, y: mcy - markH * 1.6, w: markH * 4, h: markH * 3.2 };
      const radii = blobs.map((b) => ({
        ink: b.R * markH * ease.outQuint(m.seg(t, b.t0, 1.6)),
        clr: b.R * markH * 1.3 * ease.outQuint(m.seg(t, b.t0 + 0.6, 1.8)),
      }));
      const inkGone = t > 3.2;

      if (!inkGone) {
        // revealed mark: clipped to the clear region
        gm.setTransform(1, 0, 0, 1, 0, 0);
        gm.globalCompositeOperation = 'source-over';
        gm.clearRect(box.x, box.y, box.w, box.h);
        k.logo.draw(gm, mcx, mcy, markH);
        gm.globalCompositeOperation = 'destination-in';
        gm.fillStyle = '#000';
        gm.beginPath();
        let any = false;
        blobs.forEach((b, i) => {
          if (radii[i].clr <= 0.5) return;
          any = true;
          blobPath(gm, b, mcx + b.x * markH, mcy + b.y * markH, radii[i].clr, t, true, 17);
        });
        if (any) gm.fill('nonzero'); else gm.clearRect(box.x, box.y, box.w, box.h);
        gm.globalCompositeOperation = 'source-over';
        g.drawImage(Lm, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);

        // ink with the clear region cut out
        gk.setTransform(1, 0, 0, 1, 0, 0);
        gk.globalCompositeOperation = 'source-over';
        gk.clearRect(box.x, box.y, box.w, box.h);
        blobs.forEach((b, i) => {
          if (radii[i].ink <= 0.5) return;
          blobPath(gk, b, mcx + b.x * markH, mcy + b.y * markH, radii[i].ink, t);
          gk.globalAlpha = 0.92;
          gk.fillStyle = b.col;
          gk.fill();
        });
        gk.globalAlpha = 1;
        gk.globalCompositeOperation = 'destination-out';
        gk.fillStyle = '#000';
        gk.beginPath();
        blobs.forEach((b, i) => {
          if (radii[i].clr <= 0.5) return;
          blobPath(gk, b, mcx + b.x * markH, mcy + b.y * markH, radii[i].clr, t, true, 17);
        });
        gk.fill('nonzero');
        gk.globalCompositeOperation = 'source-over';
        g.drawImage(Lk, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
      } else {
        k.logo.draw(g, mcx, mcy, markH);
      }

      if (lk.L && t > 2.6) {
        k.text.glyphs(g, k.brand.name, lk.wordX, mcy, { ...lk.wo, baseline: 'middle' }, (i) => {
          const e = ease.outQuint(m.seg(t, 2.62 + i * 0.05, 0.7));
          return { y: (1 - e) * lk.L.cap * 0.3, a: e };
        });
      }
    },
  };
}
