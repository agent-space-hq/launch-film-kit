// Feature cards ride a tilted elliptical orbit around the brand mark. Positions are
// real 3D points on a circle, tilted toward the camera and projected; cards scale
// and dim with depth and are drawn in depth order around the mark, with the orbit
// hairline split into a back half (behind the mark) and a front half (in front).
export const meta = {
  id: 'hero3d.orbit-cards',
  name: 'Orbit Cards',
  category: 'hero3d',
  duration: 5.5,
  summary: 'The mark appears, then feature cards slide out onto a tilted orbit around it and circle slowly with depth scale and dimming; ends with the cards collapsing inward and fading.',
  bestFor: ['feature overview', 'platform story', 'integrations'],
  slots: ['features'],
  params: {
    tilt: { default: 0.32, min: 0.1, max: 0.7, label: 'Orbit tilt (rad)' },
    speed: { default: 0.32, min: 0.1, max: 0.8, label: 'Orbit speed (rad/s)' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 0.8, gain: 0.4 }, { t: 0.55, type: 'whoosh', dur: 0.6, gain: 0.35 }],
  prompt: `The mark (22% of the short side tall) scales from 0.85 to 1 and fades in over 0-700 ms (outExpo) with a soft accent glow on dark brands. From 450 ms, 4 feature cards (icon chip plus label, 32 ref px text, 86 ref px tall, 16 px radius, hairline border) slide outward from the centre onto a circle, staggered 70 ms, 900 ms each (outExpo). The circle lies in a plane tilted 0.32 rad toward the camera with radius sized so the side cards stay inside the safe area (on portrait frames the orbit turns so its long axis is vertical, radius 34% of the height); it turns at a constant 0.32 rad/s. Project with focal 3.5 radii: scale follows depth (back cards 80% size); back cards stay opaque but blend 75% toward the background while their icon and label drop to 45% alpha. Draw order: back half of the orbit hairline, back cards, mark, front half of the hairline, front cards. Exit in the last 450 ms: radius collapses 30% and everything fades (inCubic).`,
};

const ICONS = ['layers', 'bolt', 'sparkle', 'users', 'shield', 'chart-line'];

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const feats = (k.copy('features', null) || ['Fast setup', 'Live sync', 'Smart alerts', 'Team spaces']).slice(0, 5);
  const n = feats.length;
  const lab = { role: 'text', size: 32, weight: 560, tracking: -0.01 };
  const cardH = 86 * k.u, iconS = 34 * k.u, padX = 24 * k.u, gapI = 16 * k.u;
  const cardW = Math.max(...feats.map((f) => k.text.layout(f, lab).width)) + padX * 2 + iconS + gapI;
  // portrait frames turn the orbit so its long axis runs vertically
  const vert = k.isPortrait;
  const tilt = vert ? Math.min(p.tilt, 0.4) : p.tilt;
  const R = vert ? Math.min(k.safe.h / 2 - cardH, k.H * 0.34) : Math.min(k.safe.w / 2 - cardW / 2 - 8 * k.u, k.vmin * 0.7);
  const focal = 3.5;
  return {
    draw(g, t) {
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const markIn = ease.outExpo(m.seg(t, 0, 0.7));
      const markH = k.vmin * k.pick({ wide: 0.22, square: 0.22, tall: 0.26 });
      const rot = t * p.speed - 0.5;
      const items = feats.map((f, i) => {
        const out = ease.outExpo(m.seg(t, 0.45 + i * 0.07, 0.9));
        const r = R * out * (1 - 0.3 * exit);
        const a = rot + (i / n) * m.TAU;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        // tilt the orbit plane toward the camera
        const y3 = -z * Math.sin(tilt), z3 = z * Math.cos(tilt);
        const s = focal / (focal + z3 / R);
        return vert ? { f, i, x: k.cx + y3 * s, y: k.cy + x * s, z: z3, s, out } : { f, i, x: k.cx + x * s, y: k.cy + y3 * s, z: z3, s, out };
      });
      // orbit hairline (two halves around the mark)
      const ring = (front) => {
        g.beginPath();
        const rr = R * ease.outExpo(m.seg(t, 0.3, 1.0)) * (1 - 0.3 * exit);
        for (let j = 0; j <= 96; j++) {
          const a = (front ? Math.PI : 0) + (j / 96) * Math.PI;
          const z = Math.sin(a) * rr;
          const z3 = z * Math.cos(tilt), s = focal / (focal + z3 / R);
          const u = Math.cos(a) * rr * s, v = -z * Math.sin(tilt) * s;
          const px = k.cx + (vert ? v : u), py = k.cy + (vert ? u : v);
          if (j === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.strokeStyle = k.color.alpha(c.fg, (front ? 0.2 : 0.1) * (1 - exit));
        g.lineWidth = 1.2 * k.u; g.stroke();
      };
      const drawCard = (it) => {
        const depthF = m.clamp((it.z / R + 1) / 2); // 0 front, 1 back
        const a = (0.45 + 0.55 * (1 - depthF)) * Math.min(1, it.out * 1.5) * (1 - exit);
        if (a <= 0.01) return;
        const s = it.s;
        g.save();
        g.translate(it.x, it.y); g.scale(s, s);
        const x0 = -cardW / 2, y0 = -cardH / 2;
        // the card stays opaque (no shadow showing through); depth blends it toward the background
        const vis = Math.min(1, it.out * 1.5) * (1 - exit);
        const fade = depthF * 0.75;
        g.globalAlpha = vis;
        const fill = k.isDark ? k.color.mix(k.color.mix(c.surface, c.bg, 0.1), c.bg, fade) : k.color.mix(c.surface, c.bg, fade);
        if (!k.isDark) k.draw.shadow(g, x0, y0, cardW, cardH, 16 * k.u, { blur: 30, y: 10, color: `rgba(20,30,60,${(0.14 * (1 - fade) * vis * vis).toFixed(3)})` });
        k.draw.rrect(g, x0, y0, cardW, cardH, 16 * k.u, fill, k.isDark ? k.color.alpha(c.fg, 0.14 * (1 - fade * 0.6)) : `rgba(20,30,60,${(0.08 * (1 - fade * 0.6)).toFixed(3)})`, 1);
        g.globalAlpha = a;
        // icon chip
        const ix = x0 + padX + iconS / 2;
        k.draw.circle(g, ix, 0, iconS * 0.78, k.color.alpha(c.accent, k.isDark ? 0.16 : 0.1));
        k.draw.icon(g, ICONS[it.i % ICONS.length], ix, 0, iconS * 0.82, c.accent, { stroke: 1.9 });
        k.text.draw(g, it.f, x0 + padX + iconS + gapI, 0, { ...lab, baseline: 'middle', color: c.fg });
        g.restore();
      };
      const back = items.filter((it) => it.z > 0).sort((a, b) => b.z - a.z);
      const front = items.filter((it) => it.z <= 0).sort((a, b) => b.z - a.z);
      ring(false);
      back.forEach(drawCard);
      // mark
      const ma = markIn * (1 - exit);
      if (ma > 0) {
        if (k.isDark) k.draw.glow(g, k.cx, k.cy, markH * 1.6, c.accent, 0.22 * ma);
        k.logo.draw(g, k.cx, k.cy, markH * (0.85 + 0.15 * markIn) * (1 - 0.1 * exit), { alpha: ma });
      }
      ring(true);
      front.forEach(drawCard);
    },
  };
}
