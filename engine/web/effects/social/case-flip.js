// A customer case card (fictional company, invented geometric mark) holds long enough
// to read its "before", then flips on its vertical axis (perspective squash with
// shading) to reveal the result metric from copy.stats in big type, plus the "after".
export const meta = {
  id: 'social.case-flip',
  name: 'Case Flip',
  category: 'social',
  duration: 5.4,
  summary: 'A fictional customer card rises in showing company and its "before"; it flips in 3D (squash, shading, shadow stretch) to the result side where the copy.stats metric counts up beside the "after"; holds, then sinks and fades in the last 0.45 s.',
  bestFor: ['case study', 'results', 'customer story'],
  slots: ['stats', 'before', 'after'],
  params: {
    company: { default: { name: 'Brightfold', sector: 'Payments platform' }, label: 'Fictional customer {name, sector}' },
    stat: { default: 1, min: 0, max: 2, label: 'copy.stats index shown on the back' },
    flipAt: { default: 1.9, min: 1.4, max: 3, label: 'Flip start (s)' },
  },
  sfx: [{ t: 0.1, type: 'whoosh', dur: 0.5, gain: 0.3 }, { t: 1.95, type: 'whoosh', dur: 0.6, gain: 0.45 }, { t: 2.6, type: 'tick', gain: 0.7 }],
  prompt: `Case study flip, 5.4 s. A surface card (~44% of frame width on 16:9, 5:3, radius 32 px, hairline border, soft shadow) rises 40 px with outExpo over 800 ms. Front: an invented geometric mark (hexagon ring, 64 px) beside the company name (56 px display) and muted sector, a mono "CASE STUDY" tag, then "Before" and copy.before in 40 px. Hold 1.1 s. At 1.9 s the card flips around its vertical axis over 800 ms with inOutCubic: horizontal scale = |cos angle|, vertical scale grows 5% at the edge-on point, a dark gradient shades the receding half, the shadow stretches, and faces swap at 90 degrees. Back: an accent hairline frame, a mono "RESULT" tag, the copy.stats value in 170–210 px display counting up with outExpo over 1000 ms, its label, and "After" with copy.after. Hold, then sink 24 px and fade over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const stats = k.copy('stats', null) || [{ value: 3, suffix: 'x', label: 'faster releases' }];
  const st = stats[Math.min(p.stat, stats.length - 1)];
  const before = k.copy('before', '6 weeks');
  const after = k.copy('after', '1 afternoon');
  const D = p.duration ?? meta.duration;
  const F0 = p.flipAt, FD = 0.8;
  const hex = new Path2D();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; const x = 32 + 30 * Math.cos(a), y = 32 + 30 * Math.sin(a); i ? hex.lineTo(x, y) : hex.moveTo(x, y); }
  hex.closePath();
  hex.moveTo(46, 32); hex.arc(32, 32, 14, 0, Math.PI * 2, true);

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const cw = Math.min(k.safe.w, k.pick({ wide: 840, square: 900, tall: 920 }) * u);
      const ch = cw * k.pick({ wide: 0.6, square: 0.72, tall: 0.86 });
      const inP = ease.outExpo(m.seg(t, 0, 0.8));
      const fp = ease.inOutCubic(m.seg(t, F0, FD));
      const ang = fp * Math.PI;
      const sx = Math.abs(Math.cos(ang));
      const edge = Math.sin(ang);
      const back = ang > Math.PI / 2;
      const cx = k.cx, cy = k.cy + (1 - inP) * 40 * u + exitP * 24 * u;
      const R = 32 * u;
      const pad = cw * 0.08;

      g.save();
      g.globalAlpha = inP * fade;
      // shadow stretches while edge-on
      g.save();
      g.translate(cx, cy + ch * 0.5 + 30 * u);
      g.scale(Math.max(0.25, sx) * (1 + 0.2 * edge), 1);
      const sg = g.createRadialGradient(0, 0, 0, 0, 0, cw * 0.55);
      sg.addColorStop(0, `rgba(0,0,0,${k.isDark ? 0.5 : 0.16})`); sg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sg; g.scale(1, 0.12); g.beginPath(); g.arc(0, 0, cw * 0.55, 0, Math.PI * 2); g.fill();
      g.restore();

      g.translate(cx, cy);
      g.scale(Math.max(0.002, sx), 1 + 0.05 * edge);
      g.translate(-cw / 2, -ch / 2);
      // card face
      g.save();
      g.shadowColor = k.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,60,0.14)'; g.shadowBlur = 60 * u; g.shadowOffsetY = 24 * u;
      k.draw.rrect(g, 0, 0, cw, ch, R, k.isDark ? C.mix(c.surface, c.bg, 0.1) : c.surface);
      g.restore();
      k.draw.rrect(g, 0.5, 0.5, cw - 1, ch - 1, R, null, back ? C.alpha(c.accent, 0.55) : C.alpha(c.fg, k.isDark ? 0.1 : 0.08), back ? 1.5 : 1);
      if (back && k.isDark) {
        g.save(); k.draw.rrectPath(g, 0, 0, cw, ch, R); g.clip();
        k.draw.glow(g, cw * 0.3, ch * 0.35, cw * 0.8, c.accent, 0.12);
        g.restore();
      }
      const textA = m.smoothstep(0.35, 0.75, sx); // no squashed text mid-flip
      if (!back) {
        g.save();
        g.translate(pad, pad);
        g.fillStyle = c.fg; g.scale(u, u); g.fill(hex, 'evenodd'); g.restore();
        const no = { size: 56, weight: 640, tracking: -0.03 };
        k.text.draw(g, p.company.name, pad + 88 * u, pad + 6 * u, { ...no, baseline: 'top', alpha: textA, qaGroup: 'front' });
        k.text.draw(g, p.company.sector, pad + 88 * u, pad + 6 * u + k.text.layout('H', no).cap + 14 * u, { role: 'text', size: 28, weight: 460, color: c.muted, baseline: 'top', alpha: textA, qaGroup: 'front' });
        k.text.draw(g, 'CASE STUDY', cw - pad, pad + 12 * u, { role: 'mono', size: 22, weight: 500, tracking: 0.12, color: c.muted, align: 'right', baseline: 'top', alpha: textA, qaGroup: 'front' });
        g.save(); g.globalAlpha *= textA;
        k.draw.line(g, pad, ch * 0.5, cw - pad, ch * 0.5, C.alpha(c.fg, k.isDark ? 0.1 : 0.1), 1, 'butt');
        g.restore();
        k.text.draw(g, 'Before', pad, ch * 0.5 + 44 * u, { role: 'text', size: 28, weight: 500, color: c.muted, baseline: 'top', alpha: textA, qaGroup: 'front' });
        const bo = { size: k.pick({ wide: 76, square: 76, tall: 80 }), weight: 620, tracking: -0.035 };
        k.text.draw(g, before, pad, ch - pad, { ...bo, size: k.text.fit(before, bo, cw - pad * 2), color: C.mix(c.fg, c.muted, 0.35), baseline: 'alphabetic', alpha: textA, qaGroup: 'front' });
      } else {
        const cnt = ease.outExpo(m.seg(t, F0 + FD * 0.55, 1.0));
        const dec = st.decimals || 0;
        const finalStr = fmt(st.value, dec) + (st.suffix || '');
        const vo = { size: k.pick({ wide: 170, square: 190, tall: 210 }), weight: 660, tracking: -0.05 };
        vo.size = k.text.fit(finalStr, vo, cw - pad * 2);
        k.text.draw(g, 'RESULT', pad, pad + 12 * u, { role: 'mono', size: 22, weight: 500, tracking: 0.12, color: k.isDark ? C.mix(c.accent, c.fg, 0.3) : C.shade(c.accent, -0.05), baseline: 'top', alpha: textA, qaGroup: 'back' });
        k.text.draw(g, p.company.name, cw - pad, pad + 12 * u, { role: 'text', size: 24, weight: 560, color: c.muted, align: 'right', baseline: 'top', alpha: textA, qaGroup: 'back' });
        const VL = k.text.layout(finalStr, vo);
        const vy = ch * 0.5 - 10 * u;
        k.text.draw(g, fmt(st.value * (cnt >= 0.999 ? 1 : cnt), dec) + (st.suffix || ''), pad, vy, { ...vo, color: k.isDark ? c.fg : c.fg, baseline: 'middle', alpha: textA, qaGroup: 'back' });
        k.text.draw(g, st.label, pad, vy + VL.cap / 2 + 26 * u, { role: 'text', size: 36, weight: 500, color: c.fg, baseline: 'top', alpha: textA * ease.outCubic(m.seg(t, F0 + FD, 0.5)), qaGroup: 'back' });
        const aa = textA * ease.outExpo(m.seg(t, F0 + FD + 0.3, 0.7));
        const ao = { role: 'text', size: 30, weight: 480 };
        const afterStr = `After: ${after}`;
        k.text.draw(g, afterStr, pad, ch - pad, { ...ao, size: k.text.fit(afterStr, ao, cw - pad * 2, 24), color: c.muted, baseline: 'alphabetic', alpha: aa, qaGroup: 'back' });
        g.save(); g.globalAlpha *= aa;
        k.draw.rrect(g, pad, ch - pad + 18 * u, 56 * u, 5 * u, 2.5 * u, c.accent);
        g.restore();
      }
      // receding-half shading during the flip
      if (edge > 0.01) {
        g.save(); k.draw.rrectPath(g, 0, 0, cw, ch, R); g.clip();
        const dir = back ? 1 : -1;
        const sh = g.createLinearGradient(dir > 0 ? 0 : cw, 0, dir > 0 ? cw : 0, 0);
        sh.addColorStop(0, `rgba(0,0,0,${(0.35 * edge).toFixed(3)})`); sh.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = sh; g.fillRect(0, 0, cw, ch);
        g.restore();
      }
      g.restore();
    },
  };
}
