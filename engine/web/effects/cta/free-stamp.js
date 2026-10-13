// A rubber stamp drops toward the page from above the camera, hits with a squash,
// a short shake and a faint ink ring, and leaves a slightly rotated, ink-textured
// impression. The supporting line settles beneath.
export const meta = {
  id: 'cta.free-stamp',
  name: 'Free Stamp',
  category: 'cta',
  duration: 4.0,
  summary: 'A double-bordered stamp ("FREE" or copy.stamp) falls from 2.4x scale, hits with a squash, 120 ms shake and ink ring, leaving a textured, rotated impression; copy.sub fades up beneath. Holds.',
  bestFor: ['offer', 'free plan', 'end card'],
  slots: ['stamp', 'sub'],
  params: {
    text: { default: null, label: 'Stamp text (defaults to copy.stamp or FREE)' },
    angle: { default: -8, min: -20, max: 20, label: 'Resting angle (deg)' },
  },
  sfx: [{ t: 0.3, type: 'whoosh', dur: 0.28, gain: 0.35 }, { t: 0.58, type: 'stamp', gain: 0.9 }, { t: 0.6, type: 'sub', gain: 0.5 }, { t: 1.15, type: 'pop', gain: 0.25 }],
  prompt: `Build a rubber stamp: tracked caps (+0.06 em, weight 760, about 18% of height) inside a rounded double border (outer 8 px, inner 3 px inset 14 px), all in the accent. Texture it by punching out about 700 seeded specks and a few dry streaks with destination-out on an offscreen layer, so the ink reads as rubber. At 300 ms the stamp falls from 2.4x scale and 0 opacity to 1.0 over 280 ms with inCubic while rotating from -14 to -8 degrees; a soft shadow beneath tightens as it nears. Impact at 580 ms: squash to 1.07 x 0.9 and recover on a damped spring (stiffness 520, damping 18), shake the frame at most 4 px for 120 ms and expand a faint accent ink ring from 1.0 to 1.12 that fades in 500 ms. At 1.1 s copy.sub (3.4% of height, muted, balanced) fades up 14 px beneath with outExpo. Hold about 2.4 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const word = String(p.text || k.copy('stamp', 'Free')).toUpperCase();
  const sub = k.copy('sub', '');
  const to = { size: k.pick({ wide: 196, square: 170, tall: 160 }), weight: 760, tracking: 0.06 };
  const TL0 = k.text.layout(word, to);
  const maxStampW = k.safe.w * 0.78;
  const padX0 = to.size * k.u * 0.42;
  if (TL0.width + padX0 * 2 > maxStampW) to.size *= maxStampW / (TL0.width + padX0 * 2);
  const so = { role: 'text', size: k.pick({ wide: 36, square: 34, tall: 36 }), weight: 460 };
  const subLines = sub ? k.text.balance(sub, so, k.safe.w * 0.8) : [];
  // ink texture: specks + streaks in stamp-local normalized coords (-0.5..0.5)
  const r = m.rng(23);
  const specks = [];
  for (let i = 0; i < 700; i++) specks.push([r() - 0.5, r() - 0.5, 0.6 + r() * r() * 3.2, r() < 0.5 ? 1 : 0.6 + r() * 0.8]);
  const streaks = [];
  for (let i = 0; i < 7; i++) streaks.push([r() - 0.5, r() - 0.5, 0.08 + r() * 0.2, (r() - 0.5) * 0.3, 1 + r() * 1.6]);
  const patches = [];
  for (let i = 0; i < 4; i++) patches.push([r() - 0.5, (r() - 0.5) * 0.8, 0.12 + r() * 0.16, 0.18 + r() * 0.17]);
  const layer = k.layer('free-stamp');
  const lg = k.ctx(layer);

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const T0 = 0.3, TI = 0.58;
      const L = k.text.layout(word, to);
      const padX = to.size * k.u * 0.42, padY = to.size * k.u * 0.3;
      const sw = L.width + padX * 2, sh = L.cap + padY * 2;
      const subH = subLines.length ? (subLines.length * so.size * 1.3) * k.u + 64 * k.u + Math.abs(Math.sin((p.angle * Math.PI) / 180)) * sw * 0.5 : 0;
      const cx = k.cx, cy = k.cy - subH / 2;
      const fall = ease.inCubic(m.seg(t, T0, TI - T0));
      if (fall <= 0) return;
      const landed = t >= TI;
      let sc = m.lerp(2.4, 1, fall);
      let sx = 1, sy = 1;
      if (landed) {
        const sp = ease.spring(t - TI, { stiffness: 520, damping: 18 });
        sx = 1.07 - 0.07 * sp; sy = 0.9 + 0.1 * sp;
      }
      const ang = (m.lerp(p.angle - 6, p.angle, fall) * Math.PI) / 180;
      const shk = m.seg(t, TI, 0.12);
      const amp = landed && shk < 1 ? 4 * k.u * (1 - shk) : 0;
      const ox = amp * Math.sin(t * 210), oy = amp * Math.cos(t * 170);
      // shadow while falling
      if (!landed) {
        g.save();
        g.globalAlpha = fall * (k.isDark ? 0.6 : 0.22);
        g.translate(cx, cy + 10 * k.u);
        g.rotate(ang);
        g.filter = `blur(${(30 * (1 - fall) + 6) * k.u}px)`;
        const ssw = sw * (0.9 + 0.3 * (1 - fall)), ssh = sh * (0.9 + 0.3 * (1 - fall));
        k.draw.rrect(g, -ssw / 2, -ssh / 2, ssw, ssh, 26 * k.u, '#000');
        g.restore();
      }
      // ink ring
      const rp = m.seg(t, TI, 0.5);
      if (rp > 0 && rp < 1) {
        g.save();
        g.translate(cx + ox, cy + oy); g.rotate(ang);
        const e = 1 + 0.12 * ease.outExpo(rp);
        g.globalAlpha = 0.22 * (1 - rp);
        k.draw.rrect(g, (-sw / 2) * e, (-sh / 2) * e, sw * e, sh * e, 28 * k.u * e, null, c.accent, 3);
        g.restore();
      }
      // stamp into layer (full-frame transform so QA boxes stay true)
      const bx = cx + ox, by = cy + oy;
      lg.setTransform(1, 0, 0, 1, 0, 0);
      lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1;
      lg.clearRect(0, 0, k.W, k.H);
      lg.save();
      lg.translate(bx, by); lg.rotate(ang); lg.scale(sc * sx, sc * sy);
      const ink = c.accent;
      k.draw.rrect(lg, -sw / 2, -sh / 2, sw, sh, 28 * k.u, null, ink, 8);
      const ins = 14 * k.u;
      k.draw.rrect(lg, -sw / 2 + ins, -sh / 2 + ins, sw - ins * 2, sh - ins * 2, 18 * k.u, null, ink, 3);
      k.text.draw(lg, word, 0, 0, { ...to, color: ink, align: 'center', baseline: 'middle', qaOffstage: !landed });
      // texture
      lg.globalCompositeOperation = 'destination-out';
      lg.fillStyle = '#000';
      lg.beginPath();
      for (const [x, y, rr, e] of specks) {
        const R = rr * k.u;
        lg.moveTo(x * sw * 1.04 + R, y * sh * 1.04);
        lg.ellipse(x * sw * 1.04, y * sh * 1.04, R, R * e, 0, 0, m.TAU);
      }
      lg.fill();
      for (const [x, y, rad, a] of patches) {
        const R = rad * sw;
        const grd = lg.createRadialGradient(x * sw, y * sh, 0, x * sw, y * sh, R);
        grd.addColorStop(0, `rgba(0,0,0,${a.toFixed(3)})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        lg.fillStyle = grd;
        lg.fillRect(x * sw - R, y * sh - R, R * 2, R * 2);
      }
      lg.lineCap = 'round';
      for (const [x, y, len, tilt, w] of streaks) {
        lg.globalAlpha = 0.35;
        lg.lineWidth = w * k.u;
        lg.beginPath();
        lg.moveTo(x * sw, y * sh);
        lg.lineTo((x + len) * sw, (y + tilt * len) * sh);
        lg.stroke();
      }
      lg.restore();
      g.save();
      g.globalAlpha = Math.min(1, fall * 1.4) * 0.94;
      g.drawImage(layer, 0, 0);
      g.restore();
      // sub line
      const sp2 = ease.outExpo(m.seg(t, 1.1, 0.8));
      if (sp2 > 0 && subLines.length) {
        const y0 = cy + sh / 2 + Math.abs(Math.sin((p.angle * Math.PI) / 180)) * sw * 0.5 + 64 * k.u + (1 - sp2) * 14 * k.u;
        subLines.forEach((ln, i) => k.text.draw(g, ln, k.cx, y0 + i * so.size * 1.3 * k.u, { ...so, color: c.muted, align: 'center', baseline: 'middle', alpha: sp2 }));
      }
    },
  };
}
