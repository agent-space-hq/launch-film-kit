// A generic UI card is taken apart: the camera tilts from a straight-on view to an
// isometric one, the card's four layers (surface, media, type, actions) lift apart
// along depth with labels on hairline leaders, hold, then collapse back together
// and the camera returns to the front. Orthographic camera, so every layer is an
// exact affine transform of the flat card and its content can be drawn natively.
export const meta = {
  id: 'hero3d.exploded-layers',
  name: 'Exploded Layers',
  category: 'hero3d',
  duration: 6,
  summary: 'A UI card tilts into isometric view, separates into labelled layers along depth, holds, then recomposes and returns to a clean front view, which it holds to the end.',
  bestFor: ['how it is built', 'design system', 'product architecture'],
  slots: ['headline', 'cta'],
  params: {
    labels: { default: true, label: 'Show layer labels' },
  },
  sfx: [{ t: 0.6, type: 'whoosh', dur: 0.6, gain: 0.3 }, { t: 1.5, type: 'swell', dur: 0.9, gain: 0.35 }, { t: 4.0, type: 'whoosh', dur: 0.6, gain: 0.3 }, { t: 4.75, type: 'tick', gain: 0.5 }],
  prompt: `A card (44% of the short side wide, 1.45:1, 22 px radius) holds four layers: surface (fill, hairline, shadow), media (a gradient panel with two soft shapes), type (the headline, 38 ref px) and actions (an accent pill with the CTA, 28 units, visible only near the front view, plus a ghost pill). Orthographic camera; each layer is the flat card under one affine transform: rotate about Z by -0.62 rad then about X by 1.0 rad, blended from 0 by a camera value. 0-400 ms the card fades up front-on. 500-1400 ms camera to isometric (inOutCubic). 1300-2300 ms layers lift apart along depth by 30% of the card width each (card shrinks 14% while tilted), staggered 90 ms (emphasized); floating layers sit on 70%-opaque frosted plates with a hairline edge. 1900-3800 ms labels on hairline leaders fade in at the right, 80 ms apart. 3800-4800 ms layers collapse (inOutCubic), labels leave faster (300 ms), camera returns front-on 4200-5200 ms. Hold the front view to the end.`,
};

const LAYER_NAMES = ['Surface', 'Media', 'Type', 'Actions'];

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const head = k.copy('headline', 'Make something people want.');
  const cta = k.copy('cta', 'Get started');
  const CW = 640, CH = 440; // card space units
  const headO = { size: 38, weight: 640, tracking: -0.025 };
  const labO = { role: 'text', size: 26, weight: 520, tracking: 0 };
  const headSize = k.text.fit(head, { ...headO, size: headO.size / k.u }, CW - 56);
  const ctaO = { role: 'text', size: 28 / k.u, weight: 600 };
  const ctaW = k.text.layout(cta, ctaO).width;
  return {
    draw(g, t) {
      const camIn = ease.inOutCubic(m.seg(t, 0.5, 0.9));
      const camOut = ease.inOutCubic(m.seg(t, 4.2, 1.0));
      const cam = camIn * (1 - camOut);
      const cardW = k.vmin * k.pick({ wide: 0.6, square: 0.6, tall: 0.62 }) * (1 - 0.14 * cam);
      const U = cardW / CW; // card units -> device px
      const az = -0.62 * cam, ax = 1.0 * cam;
      const ca = Math.cos(az), sa = Math.sin(az), cx_ = Math.cos(ax), sx_ = Math.sin(ax);
      // R = RotX(ax) * RotZ(az); columns for x, y and z (z toward the camera)
      const colX = [ca, sa * cx_], colY = [-sa, ca * cx_], colZ = [0, -sx_];
      const fade = ease.outCubic(m.seg(t, 0, 0.4));
      const ox = k.cx - (p.labels ? k.pick({ wide: 0.08, square: 0.1, tall: 0.12 }) * k.W * cam : 0);
      const oy = k.cy + 0.36 * cardW * cam;
      const gap = 0.3 * cardW;
      const lift = (i) => ease.emphasized(m.seg(t, 1.3 + i * 0.09, 1.0)) * (1 - ease.inOutCubic(m.seg(t, 3.8 + (3 - i) * 0.05, 1.0)));
      const layerT = (i) => {
        const z = i * gap * lift(i);
        // card space (u,v) centred, in device px: x = (u - CW/2) * U
        const a = colX[0] * U, b = colX[1] * U, cc = colY[0] * U, d = colY[1] * U;
        const e = ox + colZ[0] * z - (a * CW / 2 + cc * CH / 2);
        const f = oy + colZ[1] * z - (b * CW / 2 + d * CH / 2);
        return [a, b, cc, d, e, f];
      };
      const toScreen = (T, u, v) => [T[0] * u + T[2] * v + T[4], T[1] * u + T[3] * v + T[5]];
      g.save();
      g.globalAlpha = fade;
      for (let i = 0; i < 4; i++) {
        const T = layerT(i);
        const L = lift(i);
        g.save();
        g.setTransform(T[0], T[1], T[2], T[3], T[4], T[5]);
        if (i > 0 && L > 0.02) {
          // faint plate outline for floating layers
          g.save(); g.globalAlpha *= L * 0.9;
          k.draw.rrectPath(g, 0, 0, CW, CH, 22);
          // semi-opaque frosted plate: each layer reads on its own, lower layers dim behind it
          g.fillStyle = k.isDark ? k.color.alpha(k.color.mix(c.surface, c.fg, 0.04), 0.72) : 'rgba(255,255,255,0.7)'; g.fill();
          g.strokeStyle = k.isDark ? 'rgba(255,255,255,0.16)' : 'rgba(20,30,60,0.14)'; g.lineWidth = 1.2 / U * k.u; g.stroke();
          g.restore();
        }
        if (i === 0) {
          k.draw.shadow(g, 0, 0, CW, CH, 22, { blur: 50, y: 22 * cx_ + 6, color: k.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.18)' });
          k.draw.rrectPath(g, 0, 0, CW, CH, 22);
          g.fillStyle = k.isDark ? k.color.mix(c.surface, c.fg, 0.03) : c.surface; g.fill();
          g.strokeStyle = k.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(20,30,60,0.08)'; g.lineWidth = 1.2 / U * k.u; g.stroke();
        } else if (i === 1) {
          const x0 = 28, y0 = 28, w = CW - 56, h = 196;
          k.draw.rrectPath(g, x0, y0, w, h, 14);
          const lg = g.createLinearGradient(x0, y0, x0 + w, y0 + h);
          lg.addColorStop(0, k.color.mix(c.accent, c.bg, k.isDark ? 0.25 : 0.1));
          lg.addColorStop(1, k.color.mix(c.accent2 || c.accent, c.accent, 0.55));
          g.fillStyle = lg; g.fill();
          g.save(); g.clip();
          g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(x0 + w * 0.78, y0 + h * 0.3, 70, 0, m.TAU); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(x0 + w * 0.2, y0 + h * 1.05, 130, 0, m.TAU); g.fill();
          g.restore();
        } else if (i === 2) {
          // inside the layer transform one unit is one card unit, so text size = card units / k.u
          k.text.draw(g, head, 28, 262, { ...headO, size: headSize, baseline: 'top', color: c.fg, qaGroup: head });
          k.draw.rrect(g, 28, 322, 380, 12, 6, k.color.alpha(c.fg, 0.14));
          k.draw.rrect(g, 28, 344, 300, 12, 6, k.color.alpha(c.fg, 0.1));
        } else {
          const bh = 56, by = CH - 28 - bh;
          const bw = ctaW + 48;
          k.draw.rrect(g, 28, by, bw, bh, bh / 2, c.accent);
          // the CTA label is live only near the front view; foreshortened it would be unreadable
          const ctaA = 1 - m.smoothstep(0.04, 0.3, cam);
          if (ctaA > 0.01) k.text.draw(g, cta, 28 + bw / 2, by + bh / 2, { ...ctaO, alpha: ctaA, align: 'center', baseline: 'middle', color: k.color.onColor(c.accent) });
          k.draw.rrect(g, 28 + bw + 14, by, 120, bh, bh / 2, null, k.color.alpha(c.fg, 0.25), 1.4 / U);
        }
        g.restore();
      }
      g.restore();
      // labels on leaders
      if (p.labels) {
        const out = ease.inCubic(m.seg(t, 3.8, 0.3));
        const lx = Math.min(k.safe.x + k.safe.w - 10 * k.u - Math.max(...LAYER_NAMES.map((n) => k.text.layout(n, labO).width)), ox + cardW * 0.78);
        for (let i = 0; i < 4; i++) {
          const la = ease.outCubic(m.seg(t, 1.9 + i * 0.08, 0.5)) * (1 - out) * fade;
          if (la <= 0.01) continue;
          const T = layerT(i);
          const [axp, ayp] = toScreen(T, CW, CH * 0.5); // right edge middle
          const ty = ayp;
          g.save();
          g.globalAlpha = la;
          k.draw.circle(g, axp, ayp, 3.5 * k.u, c.accent);
          const x1 = lx - 14 * k.u;
          g.beginPath(); g.moveTo(axp + 6 * k.u, ayp); g.lineTo(m.lerp(axp + 6 * k.u, x1, ease.outCubic(m.seg(t, 1.9 + i * 0.08, 0.6))), ty);
          g.strokeStyle = k.color.alpha(c.fg, 0.28); g.lineWidth = 1 * k.u; g.stroke();
          g.restore();
          k.text.draw(g, LAYER_NAMES[i], lx, ty, { ...labO, baseline: 'middle', color: c.muted, alpha: la });
        }
      }
    },
  };
}
