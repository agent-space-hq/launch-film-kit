// The mark as a slab of faux-3D glass: stacked edge layers give it thickness, each
// path is tinted glass that refracts (shifts) the hairline backdrop behind it, with an
// inner bevel highlight and a specular band that slides as the slab slowly tilts.
export const meta = {
  id: 'logo.glass-bevel',
  name: 'Glass Bevel',
  category: 'logo',
  duration: 5,
  summary: 'The mark appears as thick tinted glass on a slow 3D tilt, refracting the hairline backdrop, with a bevel highlight and a moving specular band; it settles, glides left and the wordmark joins.',
  bestFor: ['premium brand reveal', 'hardware or design-led launch', 'end card'],
  slots: [],
  params: {
    depth: { default: 40, min: 0, max: 60, label: 'Glass thickness (ref px)' },
    tilt: { default: 0.62, min: 0, max: 1, label: 'Start tilt (rad)' },
    wordmark: { default: true, label: 'Show wordmark' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 1.6, gain: 0.45 }, { t: 1.5, type: 'shimmer', gain: 0.45 }, { t: 2.7, type: 'whoosh', dur: 0.45, gain: 0.3 }],
  prompt: `Draw the logo (about 28% of frame height) as glass over a field of faint vertical hairlines (every 16 px, fading radially). The slab turns about its vertical axis from -0.62 rad to a resting -0.2 rad with a standard-curve move over 3000 ms, then keeps a 0.03 rad slow sway: apply scaleX = cos(angle) plus a skew of 0.14 x sin(angle) for perspective. Thickness is 14 silhouettes stacked toward the far side (40 px deep), each a faint 12% tint of its own path colour so the edge reads as lit glass. The front face is drawn per path: accent paths as 72% accent glass, foreground paths as 26% clear glass, both thinning toward the bottom; inside each path the hairlines are redrawn shifted 18 px plus the tilt (refraction), then a top-left 4.5 px inner white bevel, a bottom-right inner shade and a white hairline rim. A soft diagonal specular band, masked to the face, slides with the tilt. Entrance: fade and scale 0.92 to 1 (outExpo, 900 ms). At 2600 ms the mark glides left (emphasized, 850 ms) and the name fades up glyph-staggered. Hold 1.4 s.`,
};

function lockup(k, withWord) {
  const name = withWord ? k.brand.name || '' : '';
  let markH = k.pick({ wide: 300, square: 270, tall: 250 }) * k.u;
  const wo = { size: k.pick({ wide: 150, square: 120, tall: 108 }), weight: 620, tracking: -0.035 };
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
  const { markH, markW } = lk;
  const [vx, vy, vw, vh] = k.logo.spec.viewBox;
  const s = markH / vh;
  const paths = k.logo.paths;
  const c = k.brand.colors, C = k.color;
  // offscreen face canvas in mark-local space (origin = centre)
  const FW = Math.ceil(markW * 1.2 + 8), FH = Math.ceil(markH * 1.2 + 8);
  const face = document.createElement('canvas');
  face.width = FW; face.height = FH;
  const fg = face.getContext('2d');
  const stripe = 16 * k.u;
  const toLocal = (cg) => { cg.translate(FW / 2, FH / 2); cg.scale(s, s); cg.translate(-vx - vw / 2, -vy - vh / 2); };
  const tint = (fill) => {
    const isAccent = fill === 'accent' || fill === 'accent2';
    const base = fill === 'accent2' ? c.accent2 || c.accent : c.accent;
    return isAccent ? { col: C.alpha(base, k.isDark ? 0.72 : 0.7), line: C.alpha(C.mix(base, '#ffffff', 0.5), 0.3), solid: base }
      : { col: k.isDark ? 'rgba(255,255,255,0.26)' : C.alpha(C.mix(c.fg, c.bg, 0.5), 0.3), line: C.alpha(c.fg, k.isDark ? 0.16 : 0.2), solid: c.fg };
  };
  const tints = paths.map((pp) => tint(pp.fill));
  const edgeCols = tints.map((T) => (k.isDark ? C.mix(T.solid, '#ffffff', 0.15) : C.mix(T.solid, c.fg, 0.2)));

  function drawFace(angle) {
    fg.setTransform(1, 0, 0, 1, 0, 0);
    fg.clearRect(0, 0, FW, FH);
    const refr = 18 * k.u + angle * 40 * k.u;
    paths.forEach((pp, i) => {
      const T = tints[i];
      fg.save();
      toLocal(fg);
      fg.clip(pp.path, pp.rule || 'nonzero');
      fg.setTransform(1, 0, 0, 1, 0, 0);
      // tinted glass body with a vertical falloff
      const body = fg.createLinearGradient(0, 0, 0, FH);
      body.addColorStop(0, T.col);
      body.addColorStop(1, C.alpha(T.solid, k.isDark ? 0.22 : 0.3));
      fg.fillStyle = body; fg.fillRect(0, 0, FW, FH);
      // refracted hairlines (shifted relative to the backdrop)
      fg.strokeStyle = T.line; fg.lineWidth = Math.max(1, 1.1 * k.u);
      fg.beginPath();
      for (let x = ((refr % stripe) + stripe) % stripe; x < FW; x += stripe) { fg.moveTo(x, 0); fg.lineTo(x, FH); }
      fg.stroke();
      fg.restore();
      // inner bevel: white stroke clipped inside, then keep top-left only
      fg.save();
      toLocal(fg);
      fg.clip(pp.path, pp.rule || 'nonzero');
      fg.lineJoin = 'round';
      fg.lineWidth = (9 * k.u) / s;
      const hl = fg.createLinearGradient(vx, vy, vx + vw, vy + vh);
      hl.addColorStop(0, 'rgba(255,255,255,0.95)');
      hl.addColorStop(0.45, 'rgba(255,255,255,0.15)');
      hl.addColorStop(1, 'rgba(255,255,255,0)');
      fg.strokeStyle = hl; fg.stroke(pp.path);
      const sh = fg.createLinearGradient(vx, vy, vx + vw, vy + vh);
      sh.addColorStop(0, 'rgba(0,0,0,0)');
      sh.addColorStop(0.6, 'rgba(0,0,0,0)');
      sh.addColorStop(1, `rgba(0,0,0,${k.isDark ? 0.45 : 0.25})`);
      fg.lineWidth = (10 * k.u) / s;
      fg.strokeStyle = sh; fg.stroke(pp.path);
      fg.restore();
    });
    // specular band sliding with the tilt, masked to the face
    const pos = 0.5 + angle * 1.1;
    fg.save();
    fg.globalCompositeOperation = 'source-atop';
    const sp = fg.createLinearGradient(0, 0, FW, FH * 0.6);
    const st = (o, a) => sp.addColorStop(m.clamp(o), `rgba(255,255,255,${a})`);
    st(pos - 0.2, 0); st(pos - 0.035, 0.45); st(pos, 0.7); st(pos + 0.03, 0.45); st(pos + 0.14, 0);
    fg.fillStyle = sp; fg.fillRect(0, 0, FW, FH);
    fg.restore();
    // rim hairline
    fg.save();
    toLocal(fg);
    fg.lineWidth = (1.3 * k.u) / s;
    fg.strokeStyle = k.isDark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)';
    paths.forEach((pp) => fg.stroke(pp.path));
    fg.restore();
  }

  return {
    draw(g, t) {
      const intro = ease.outExpo(m.seg(t, 0, 0.9));
      const turn = ease.standard(m.seg(t, 0, 3.0));
      const angle = m.lerp(-p.tilt, -0.2, turn) + 0.03 * Math.sin(t * 0.9) * turn;
      const slide = lk.L ? ease.emphasized(m.seg(t, 2.6, 0.85)) : 0;
      const mcx = m.lerp(k.cx, lk.markX, slide), mcy = k.cy;
      const sc = m.lerp(0.92, 1, intro);
      const ca = Math.cos(angle), sa = Math.sin(angle);

      // backdrop hairlines with radial falloff (what the glass refracts)
      const R = markH * 1.5;
      g.save();
      g.lineWidth = Math.max(1, 1.1 * k.u);
      for (let x = mcx - R - ((mcx - R) % stripe); x < mcx + R; x += stripe) {
        const f = 1 - Math.abs(x - mcx) / R;
        if (f <= 0) continue;
        const grd = g.createLinearGradient(0, mcy - R * 0.8, 0, mcy + R * 0.8);
        const a = (k.isDark ? 0.08 : 0.1) * f * intro;
        grd.addColorStop(0, C.alpha(c.fg, 0)); grd.addColorStop(0.5, C.alpha(c.fg, a)); grd.addColorStop(1, C.alpha(c.fg, 0));
        g.strokeStyle = grd;
        g.beginPath(); g.moveTo(x, mcy - R * 0.8); g.lineTo(x, mcy + R * 0.8); g.stroke();
      }
      g.restore();

      // ambient: glow on dark, soft contact shadow on light
      if (k.isDark) k.draw.glow(g, mcx, mcy, markH * 1.3, c.accent, 0.16 * intro);
      else {
        g.save();
        g.translate(mcx, mcy + markH * 0.56); g.scale(1, 0.16);
        const sg = g.createRadialGradient(0, 0, 0, 0, 0, markW * 0.7);
        sg.addColorStop(0, `rgba(20,30,60,${0.22 * intro})`); sg.addColorStop(1, 'rgba(20,30,60,0)');
        g.fillStyle = sg; g.fillRect(-markW, -markW, markW * 2, markW * 2);
        g.restore();
      }

      const xf = (dx, dy) => g.setTransform(ca * sc, sa * 0.14 * sc, 0, sc, mcx + dx, mcy + dy);
      // thickness: stacked silhouettes toward the far side
      const depth = p.depth * k.u, N = 14;
      g.save();
      g.globalAlpha = intro;
      for (let i = N; i >= 1; i--) {
        const f = i / N;
        xf(-sa * depth * f, depth * 0.1 * f);
        g.globalAlpha = intro * (k.isDark ? 0.13 : 0.12) * (0.5 + 0.5 * (1 - f));
        k.logo.draw(g, 0, 0, markH, { colors: edgeCols });
      }
      g.restore();

      // face
      drawFace(angle);
      g.save();
      xf(0, 0);
      g.globalAlpha = intro;
      g.drawImage(face, -FW / 2, -FH / 2);
      g.restore();

      if (lk.L && t > 2.75) {
        k.text.glyphs(g, k.brand.name, lk.wordX, mcy, { ...lk.wo, baseline: 'middle' }, (i) => {
          const e = ease.outQuint(m.seg(t, 2.8 + i * 0.05, 0.7));
          return { y: (1 - e) * lk.L.cap * 0.3, a: e };
        });
      }
    },
  };
}
