// A card states a common belief ("Myth"). After a reading beat it winds back a few
// degrees, then flips 180 degrees in true perspective (rendered as projected
// vertical strips with shading) to its accent-tagged "Fact" side.
export const meta = {
  id: 'hook.myth-fact-flip',
  name: 'Myth / Fact',
  category: 'hook',
  duration: 5.0,
  summary: 'A Myth card is readable from frame 0; it winds up, flips in perspective with a lift and shading, and lands on the Fact side with an accent tag that pops in; holds on the fact.',
  bestFor: ['cold open', 'objection handling', 'reframe'],
  slots: ['myth', 'fact', 'after'],
  params: {
    flipAt: { default: 1.6, min: 1.2, max: 2.5, label: 'Flip starts (s)' },
  },
  sfx: [{ t: 1.3, type: 'whoosh', dur: 0.2, gain: 0.2 }, { t: 1.6, type: 'whoosh', dur: 0.7, gain: 0.5 }, { t: 2.4, type: 'pop', gain: 0.6 }],
  prompt: `A card (about 62% of frame width, 50% of height, 36 px radius, surface fill, hairline, soft shadow) shows a "MYTH" pill with an x icon, the belief in display type (7.8% of height, weight 620, balanced, left aligned) and a muted footer, readable from frame 0. At 1.3 s it winds back 7 degrees about the vertical axis (standard, 300 ms). At 1.6 s it flips to 180 degrees over 800 ms with inOutCubic: render the face to an offscreen layer, bake a shading gradient into it, and draw it as 90 vertical strips projected with a perspective distance of 2.2 card widths; lift to 1.05 scale mid-flip while the shadow narrows. The back face is tinted 7-14% toward the accent, with a solid accent "FACT" pill (outBack pop, 350 ms, at 2.4 s), the fact in display type and a small logo footer. Hold 2.4 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const brand = k.brand.name || '';
  const myth = k.copy('myth', 'A great launch takes months of crunch.');
  const fact = k.copy('fact', `With ${brand || 'the right tool'}, it takes ${k.copy('after', 'an afternoon')}.`);
  const cw = Math.min(k.safe.w * k.pick({ wide: 0.7, square: 0.96, tall: 1 }), 1240 * k.u);
  const ch = k.pick({ wide: 540, square: 620, tall: 720 }) * k.u;
  const pad = k.pick({ wide: 64, square: 56, tall: 56 }) * k.u;
  const so = { size: k.pick({ wide: 84, square: 84, tall: 92 }), weight: 620, tracking: -0.03 };
  const fit = (str) => {
    const o = { ...so };
    let ls = k.text.balance(str, o, cw - pad * 2);
    while (ls.length > 3 && o.size > 36) { o.size *= 0.92; ls = k.text.balance(str, o, cw - pad * 2); }
    return { o, ls };
  };
  const M = fit(myth), F = fit(fact);
  const layer = k.layer('myth-fact-face');
  const lg = k.ctx(layer);

  function face(g, side, x, y, w, h, tagPop) {
    const c = k.brand.colors;
    const isFact = side === 1;
    const fill = isFact ? C.mix(k.isDark ? c.surface : '#ffffff', c.accent, k.isDark ? 0.14 : 0.07) : (k.isDark ? c.surface : '#ffffff');
    k.draw.rrect(g, x, y, w, h, 36 * k.u, fill, C.alpha(isFact ? c.accent : c.fg, k.isDark ? 0.22 : 0.12), 1.2);
    // tag
    const th = 50 * k.u;
    const label = isFact ? 'FACT' : 'MYTH';
    const lo = { role: 'text', size: 24, weight: 680, tracking: 0.14 };
    const LL = k.text.layout(label, lo);
    const tw = LL.width + th + 34 * k.u;
    const s = isFact ? tagPop : 1;
    if (s > 0) {
      g.save();
      g.translate(x + pad + tw / 2, y + pad + th / 2);
      g.scale(0.85 + 0.15 * s, 0.85 + 0.15 * s);
      g.globalAlpha *= m.clamp(s * 1.6);
      const tf = isFact ? c.accent : C.alpha(c.fg, 0.08);
      const tc = isFact ? C.onColor(c.accent) : c.fg;
      k.draw.rrect(g, -tw / 2, -th / 2, tw, th, th / 2, tf);
      k.draw.icon(g, isFact ? 'check' : 'x', -tw / 2 + th * 0.62, 0, th * 0.5, isFact ? tc : c.muted, { stroke: 2.4 });
      k.text.draw(g, label, -tw / 2 + th * 0.62 + th * 0.45, 0, { ...lo, color: tc, baseline: 'middle' });
      g.restore();
    }
    // statement
    const S = isFact ? F : M;
    const lh = S.o.size * 1.12 * k.u;
    const cap = k.text.layout('H', S.o).cap;
    const ty = y + pad + th + 56 * k.u + cap / 2;
    S.ls.forEach((ln, i) => k.text.draw(g, ln, x + pad, ty + i * lh, { ...S.o, color: c.fg, baseline: 'middle', qaGroup: 'face' + side }));
    // footer
    const fy = y + h - pad;
    if (isFact) {
      const mh = 34 * k.u;
      k.logo.draw(g, x + pad + (mh * k.logo.aspect) / 2, fy - mh / 2 + 4 * k.u, mh);
      if (brand) k.text.draw(g, brand, x + pad + mh * k.logo.aspect + 14 * k.u, fy - 13 * k.u, { role: 'text', size: 28, weight: 620, color: c.fg, baseline: 'middle' });
    } else {
      k.text.draw(g, k.copy('mythFooter', 'What most teams assume'), x + pad, fy - 13 * k.u, { role: 'text', size: 28, weight: 460, color: c.muted, baseline: 'middle' });
    }
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const T = p.flipAt;
      const wind = ease.standard(m.seg(t, T - 0.3, 0.3));
      const flip = ease.inOutCubic(m.seg(t, T, 0.8));
      const angDeg = -7 * wind * (1 - flip) + 180 * flip;
      const ang = (angDeg * Math.PI) / 180;
      const lift = 1 + 0.05 * Math.sin(Math.PI * flip);
      const x = k.cx - cw / 2, y = k.cy - ch / 2;
      const tagPop = ease.outBack(m.seg(t, T + 0.8, 0.35));
      const cosA = Math.cos(ang);
      // shadow / glow
      const sw = cw * Math.max(0.05, Math.abs(cosA)) * lift;
      if (k.isDark) k.draw.glow(g, k.cx, k.cy, Math.max(cw, ch) * 0.75, c.accent, 0.05 + 0.09 * m.clamp(flip * 1.4));
      // shadow only (the casting shape is drawn far off-frame and offset back)
      g.save();
      const off = k.W * 4;
      g.shadowColor = k.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.16)';
      g.shadowBlur = 80 * k.u * lift;
      g.shadowOffsetX = off;
      g.shadowOffsetY = (30 + 400 * (lift - 1)) * k.u;
      k.draw.rrectPath(g, k.cx - sw / 2 - off, y + 10 * k.u, sw, ch * lift - 10 * k.u, 36 * k.u);
      g.fillStyle = '#000'; g.fill();
      g.restore();
      const flat = Math.abs(angDeg) < 0.01 || Math.abs(angDeg - 180) < 0.01;
      if (flat && lift === 1) {
        face(g, angDeg > 90 ? 1 : 0, x, y, cw, ch, tagPop);
        return;
      }
      const side = cosA >= 0 ? 0 : 1;
      // render the visible face into the layer at its flat position (QA off: it is an intermediate image)
      lg.setTransform(1, 0, 0, 1, 0, 0);
      lg.clearRect(x - 4, y - 4, cw + 8, ch + 8);
      const q = k.qaEnabled; k.qaEnabled = false;
      face(lg, side, x, y, cw, ch, side === 1 ? tagPop : 1);
      k.qaEnabled = q;
      const shade0 = (1 - Math.abs(Math.cos(ang))) * 0.35;
      if (shade0 > 0.005) {
        const farRight = (side === 0 ? 1 : -1) * Math.sin(ang) > 0;
        const grd = lg.createLinearGradient(x, 0, x + cw, 0);
        grd.addColorStop(farRight ? 0 : 1, `rgba(0,0,0,${(shade0 * 0.45).toFixed(3)})`);
        grd.addColorStop(farRight ? 1 : 0, `rgba(0,0,0,${shade0.toFixed(3)})`);
        lg.save();
        lg.globalCompositeOperation = 'source-atop';
        lg.fillStyle = grd; lg.fillRect(x, y, cw, ch);
        lg.restore();
      }
      // strips
      const N = 90;
      const dist = cw * 2.2;
      const sinA = Math.sin(ang);
      const proj = (u) => { // u in [-0.5, 0.5] across the card (front-face coordinates)
        const X = u * cw * cosA, Z = u * cw * sinA;
        const f = dist / (dist + Z);
        return { x: k.cx + X * f * lift, f: f * lift };
      };
      for (let i = 0; i < N; i++) {
        const u0 = -0.5 + i / N, u1 = u0 + 1 / N;
        // the back face is mirrored: its texture column i maps to front coordinate -u
        const a = proj(side === 0 ? u0 : -u0), b = proj(side === 0 ? u1 : -u1);
        const fx0 = Math.min(a.x, b.x), fx1 = Math.max(a.x, b.x);
        const fm = (a.f + b.f) / 2;
        const sx = x + (i / N) * cw;
        const hh = ch * fm;
        g.drawImage(layer, sx, y - 2, cw / N + 0.5, ch + 4, fx0, k.cy - hh / 2 - 2 * fm, fx1 - fx0 + 0.8, hh + 4 * fm);
      }
    },
  };
}
