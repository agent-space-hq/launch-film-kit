// The headline as a solid extruded object. The extrusion is built from ~30 stacked
// copies of the type, offset along the projected depth axis and shaded darker toward
// the back (pre-tinted sprites, one drawImage per layer). The front face is real
// text with a moving specular gradient. A gentle yaw swing turns the block, so the
// side walls swap sides and the face catches the key light as it passes.
export const meta = {
  id: 'hero3d.extruded-type',
  name: 'Extruded Type',
  category: 'hero3d',
  duration: 5,
  summary: 'The headline extrudes into a solid block, swings gently in yaw so its side walls turn and its face catches a passing highlight, then exits with a short drop-and-fade.',
  bestFor: ['headline', 'chapter title', 'hero statement'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Text (defaults to the headline)' },
    depth: { default: 1, min: 0.3, max: 2, label: 'Extrusion depth' },
  },
  sfx: [{ t: 0.05, type: 'swell', dur: 1.1, gain: 0.45 }, { t: 1.9, type: 'shimmer', gain: 0.4 }],
  prompt: `Set the headline in display type (up to 2 balanced lines, 128 ref px, weight 700, tracking -0.035 em). Build the extrusion from 30 copies drawn back to front along a projected depth axis 5.5% of the short side long; copies are pre-tinted from 10% accent on the background colour at the back to 62% at the front (dark brands); on light brands the face is the accent and the walls run from accent at 72% to 38% toward black, and back copies shrink by up to 3% for perspective. The front face is live text filled with a vertical gradient plus a diagonal specular band. Motion: 0-1100 ms the block turns in from yaw -0.55 rad, scale 0.92 to 1 and depth 0 to full (outExpo). 1100-4300 ms yaw swings from -0.2 to +0.24 rad (inOutCubic) with pitch 0.12, so the walls flip sides; the face is horizontally compressed by cos(yaw) and the specular band sweeps across between 1500 and 2900 ms. Exit in the last 450 ms: inCubic drop of 4% and fade.`,
};

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const str = p.text || k.copy('headline', k.brand.name);
  const o = { size: k.pick({ wide: 128, square: 112, tall: 100 }), weight: 700, tracking: -0.035 };
  let lines = k.text.balance(str, o, k.safe.w * 0.86);
  while (lines.length > 2 && o.size > 48) { o.size *= 0.92; lines = k.text.balance(str, o, k.safe.w * 0.86); }
  for (const ln of lines) o.size = Math.min(o.size, k.text.fit(ln, o, k.safe.w * 0.86));
  lines = k.text.balance(str, o, k.safe.w * 0.86);
  const lh = o.size * 1.04 * k.u;
  const Ls = lines.map((ln) => k.text.layout(ln, o));
  const bw = Math.max(...Ls.map((L) => L.width)), bh = lh * (lines.length - 1) + Ls[0].cap;
  const pad = Math.ceil(30 * k.u);
  const sw = Math.ceil(bw + pad * 2), shh = Math.ceil(bh + pad * 2 + Ls[0].inkDescent);
  // ink sprite (white) drawn once, then tinted copies
  const ink = document.createElement('canvas'); ink.width = sw; ink.height = shh;
  {
    const gg = ink.getContext('2d');
    k.qa.raw(false);
    lines.forEach((ln, i) => {
      const L = Ls[i];
      gg.font = L.font; gg.letterSpacing = `${L.trackPx}px`; gg.fillStyle = '#fff';
      gg.fillText(ln, sw / 2 - L.width / 2, pad + L.cap + i * lh);
    });
    k.qa.raw(true);
  }
  const SH = 10;
  // walls sit clearly apart in value from the face: darker on dark brands, paler on light ones
  // dark brands: light face, dark accent walls. light brands: accent face, deep accent walls.
  const back = k.isDark ? k.color.mix(c.bg, c.accent, 0.08) : k.color.mix(c.accent, '#000000', 0.72);
  const front = k.isDark ? k.color.mix(c.bg, c.accent, 0.5) : k.color.mix(c.accent, '#000000', 0.38);
  const faceCol = k.isDark ? c.fg : c.accent;
  const shades = Array.from({ length: SH }, (_, i) => {
    const cv = document.createElement('canvas'); cv.width = sw; cv.height = shh;
    const gg = cv.getContext('2d');
    gg.drawImage(ink, 0, 0);
    gg.globalCompositeOperation = 'source-in';
    gg.fillStyle = k.color.mix(back, front, i / (SH - 1));
    gg.fillRect(0, 0, sw, shh);
    return cv;
  });
  const LAYERS = 30;
  return {
    draw(g, t) {
      const inP = ease.outExpo(m.seg(t, 0.0, 1.1));
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const swing = ease.inOutCubic(m.seg(t, 1.1, Math.max(0.5, D - 1.8)));
      const yaw = m.lerp(-0.55, -0.2, inP) + swing * 0.44;
      const pitch = 0.12;
      const sc = (0.92 + 0.08 * inP);
      const depthPx = 0.055 * k.vmin * p.depth * inP;
      const dvx = -Math.sin(yaw) * depthPx, dvy = Math.sin(pitch) * depthPx * 1.6;
      const cx = k.cx, cy = k.cy + exit * 0.04 * k.H;
      const fx = Math.cos(yaw);
      const alpha = Math.min(1, inP * 1.6) * (1 - exit);
      if (alpha <= 0) return;
      g.save();
      g.globalAlpha = alpha;
      // contact shadow / glow beneath (an ellipse, soft all round)
      g.save();
      g.translate(cx, cy + bh * 0.66); g.scale(1, 0.14);
      const R = bw * 0.6;
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, k.isDark ? k.color.alpha(c.accent, 0.2) : 'rgba(20,30,60,0.16)');
      gr.addColorStop(1, k.isDark ? k.color.alpha(c.accent, 0) : 'rgba(20,30,60,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
      g.restore();
      // extrusion, back to front
      for (let j = 0; j < LAYERS; j++) {
        const f = 1 - j / (LAYERS - 1); // 1 = back, 0 = front
        const s = sc * (1 - 0.03 * f);
        const shade = shades[Math.min(SH - 1, Math.floor((1 - f) * (SH - 1) * 0.92))];
        g.save();
        g.translate(cx + dvx * f, cy + dvy * f);
        g.transform(fx * s, Math.sin(yaw) * 0.06 * s, 0, s, 0, 0);
        g.drawImage(shade, -sw / 2, -shh / 2 + (shh / 2 - pad - bh / 2));
        g.restore();
      }
      // front face: live text with a specular gradient
      g.save();
      g.translate(cx, cy);
      g.transform(fx * sc, Math.sin(yaw) * 0.06 * sc, 0, sc, 0, 0);
      const sp = ease.inOutCubic(m.seg(t, 1.5, 1.4));
      const bx = m.lerp(-bw * 0.9, bw * 0.9, sp);
      const grd = g.createLinearGradient(bx - bw * 0.25, -bh, bx + bw * 0.25, bh);
      const faceTop = faceCol, faceBot = k.isDark ? k.color.mix(c.fg, c.accent, 0.2) : k.color.mix(c.accent, '#000000', 0.12);
      const hi = k.isDark ? '#ffffff' : k.color.mix(c.accent, '#ffffff', 0.3);
      const hiA = sp > 0 && sp < 1 ? 1 : 0;
      grd.addColorStop(0, faceBot);
      grd.addColorStop(0.42, faceTop);
      grd.addColorStop(0.5, hiA ? hi : faceTop);
      grd.addColorStop(0.58, faceTop);
      grd.addColorStop(1, faceBot);
      lines.forEach((ln, i) => {
        k.text.draw(g, ln, 0, -bh / 2 + Ls[i].cap + i * lh, { ...o, align: 'center', color: faceCol, gradient: grd, qaGroup: str });
      });
      g.restore();
      g.restore();
    },
  };
}
