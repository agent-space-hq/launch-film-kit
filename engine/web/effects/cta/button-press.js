// A big accent CTA button springs in; a pointer arrives, hovers (lift + arrow
// nudge), presses (depress, darker fill, ripple), and the button morphs into a
// round success badge whose check draws on, with a confirmation line beneath.
export const meta = {
  id: 'cta.button-press',
  name: 'Button Press',
  category: 'cta',
  duration: 4.4,
  summary: 'copy.cta button springs in, is hovered and pressed by a pointer (depress + ripple), then collapses into a circle whose check draws on, with a pulse ring and a short confirmation line; holds.',
  bestFor: ['call to action', 'sign-up', 'end card'],
  slots: ['cta', 'successText'],
  params: {},
  sfx: [{ t: 0.05, type: 'pop', gain: 0.4 }, { t: 0.6, type: 'whoosh', dur: 0.6, gain: 0.15 }, { t: 1.55, type: 'click', gain: 0.9 }, { t: 2.2, type: 'bell', gain: 0.45 }],
  prompt: `Centre a large pill button (14% of height tall) with copy.cta in display type (5.9% of height, weight 620) and an arrow, filled with the accent, a faint top-lit gradient and a soft shadow (glow on dark). It springs in from 0.9 scale (stiffness 260, damping 20). A pointer travels a quadratic bezier from the lower right over 700 ms (standard) to the arrow; at 1.25 s hover lifts the button 3 px, deepens its fill slightly and nudges the arrow 6 px. At 1.55 s press: scale 0.965 and darker fill for 120 ms, a soft radial ripple from the tip clipped to the pill. At 1.85 s the label lifts out in 180 ms while the width morphs to the height over 500 ms (emphasized); a check draws on (2.2-2.6 s, outCubic) and a pulse ring expands to 1.6x. At 2.45 s a confirmation line (5.2% of height) rises beneath. Hold about 1.8 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const label = k.copy('cta', 'Get started');
  const okText = k.copy('successText', "You're in.");
  const lo = { size: k.pick({ wide: 64, square: 58, tall: 58 }), weight: 620, tracking: -0.02 };
  const so = { size: k.pick({ wide: 56, square: 52, tall: 54 }), weight: 600, tracking: -0.025 };

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const on = C.contrast('#ffffff', c.accent) >= 3 ? '#ffffff' : C.onColor(c.accent);
      const LL = k.text.layout(label, lo);
      const h = k.pick({ wide: 150, square: 140, tall: 140 }) * k.u;
      const icS = h * 0.3;
      const W0 = LL.width + h * 0.9 + icS + 18 * k.u;
      const morph = ease.emphasized(m.seg(t, 1.85, 0.5));
      const w = m.lerp(W0, h, morph);
      const cy = k.cy - 30 * k.u;
      const enter = ease.spring(t, { stiffness: 260, damping: 20 });
      const hover = ease.outCubic(m.seg(t, 1.25, 0.18)) * (1 - m.seg(t, 1.85, 0.2));
      const press = ease.outCubic(m.seg(t, 1.55, 0.06)) - ease.outCubic(m.seg(t, 1.67, 0.15));
      const sc = m.lerp(0.9, 1, enter) * (1 - 0.035 * press);
      const lift = -3 * k.u * hover * (1 - press);
      const alpha = m.clamp(enter * 1.5);
      const x = k.cx - w / 2, y = cy - h / 2 + lift;
      // pulse ring after success
      const pr = m.seg(t, 2.25, 0.8);
      if (pr > 0 && pr < 1) {
        g.save(); g.globalAlpha = (1 - pr) * 0.45;
        k.draw.circle(g, k.cx, cy, (h / 2) * (1 + 0.6 * ease.outCubic(pr)), null, c.accent, 2);
        g.restore();
      }
      g.save();
      g.globalAlpha = alpha;
      g.translate(k.cx, cy); g.scale(sc, sc); g.translate(-k.cx, -cy);
      if (k.isDark) k.draw.glow(g, k.cx, cy, Math.max(w, h) * 0.9, c.accent, 0.16 + 0.08 * hover - 0.06 * press);
      k.draw.shadow(g, x, y, w, h, h / 2, { blur: 40 - 20 * press, y: 18 - 10 * press, color: k.isDark ? 'rgba(0,0,0,0.5)' : C.alpha(C.shade(c.accent, -0.25), 0.35) });
      const base = C.shade(c.accent, -0.025 * hover - 0.05 * press);
      const grd = g.createLinearGradient(0, y, 0, y + h);
      grd.addColorStop(0, C.shade(base, 0.05));
      grd.addColorStop(1, C.shade(base, -0.02));
      k.draw.rrect(g, x, y, w, h, h / 2, grd);
      // inner top highlight
      g.save();
      k.draw.rrectPath(g, x, y, w, h, h / 2); g.clip();
      g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 1.5 * k.u;
      k.draw.rrectPath(g, x + 0.5, y + 1.2 * k.u, w - 1, h, h / 2); g.stroke();
      // ripple
      const rp = m.seg(t, 1.57, 0.45);
      if (rp > 0 && rp < 1) {
        const rx = k.cx + W0 * 0.34, ry = cy + 10 * k.u;
        const R = Math.max(2, W0 * 0.8 * ease.outCubic(rp));
        const rg = g.createRadialGradient(rx, ry, 0, rx, ry, R);
        rg.addColorStop(0, 'rgba(255,255,255,0.05)');
        rg.addColorStop(0.75, 'rgba(255,255,255,0.2)');
        rg.addColorStop(1, 'rgba(255,255,255,0)');
        g.globalAlpha *= 1 - rp;
        g.fillStyle = rg;
        g.fillRect(rx - R, ry - R, R * 2, R * 2);
      }
      g.restore();
      // label
      const out = ease.inCubic(m.seg(t, 1.85, 0.18));
      if (out < 1) {
        const lx = k.cx - (LL.width + 18 * k.u + icS) / 2 + 0;
        g.save();
        g.beginPath(); g.rect(x, y, w, h); g.clip();
        k.text.draw(g, label, lx, cy + lift - out * h * 0.35, { ...lo, color: on, baseline: 'middle', alpha: 1 - out });
        g.globalAlpha *= 1 - out;
        k.draw.icon(g, 'arrow-right', lx + LL.width + 18 * k.u + icS / 2 + 6 * k.u * hover, cy + lift - out * h * 0.35, icS, on, { stroke: 2.4 });
        g.restore();
      }
      // check
      const ck = ease.outCubic(m.seg(t, 2.2, 0.4));
      if (ck > 0) k.draw.icon(g, 'check', k.cx, cy, h * 0.55, on, { p: ck, stroke: 2.6 });
      g.restore();
      // confirmation line
      const cp = ease.outExpo(m.seg(t, 2.45, 0.8));
      if (cp > 0) {
        const ty = cy + h / 2 + 86 * k.u;
        const L2 = k.text.layout(okText, so);
        g.save();
        g.beginPath(); g.rect(0, ty - L2.cap * 1.2, k.W, L2.cap * 2.6); g.clip();
        k.text.draw(g, okText, k.cx, ty + (1 - cp) * L2.cap * 1.6, { ...so, color: c.fg, align: 'center', baseline: 'middle', qaOffstage: cp < 0.99 });
        g.restore();
      }
      // pointer
      const mv = ease.standard(m.seg(t, 0.6, 0.7));
      if (mv > 0) {
        const tipX = k.cx + W0 * 0.34, tipY = cy + 10 * k.u;
        const sx = k.cx + k.W * 0.36, sy = k.cy + k.H * 0.44;
        const qx = tipX + k.W * 0.1, qy = tipY + k.H * 0.3;
        const u = mv;
        let px = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * qx + u * u * tipX;
        let py = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * qy + u * u * tipY;
        const away = ease.standard(m.seg(t, 1.9, 0.6));
        px += away * k.W * 0.05; py += away * k.H * 0.07;
        const fade = 1 - m.seg(t, 2.2, 0.35);
        if (fade > 0) {
          g.save(); g.globalAlpha = Math.min(1, mv * 3) * fade;
          k.draw.pointer(g, px, py, 1.3 * (1 - 0.1 * press));
          g.restore();
        }
      }
    },
  };
}
