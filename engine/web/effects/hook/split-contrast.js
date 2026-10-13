// A full-bleed split: the left (top, in portrait) panel holds the "before" value on a
// flat, hatched grey field; the right panel holds the "after" value on an accent-tinted
// field. After a reading beat the divider glides across and hands the frame to "after".
export const meta = {
  id: 'hook.split-contrast',
  name: 'Split Contrast',
  category: 'hook',
  duration: 4.4,
  ownsBackground: true,
  summary: 'Two panels, before vs after (copy.before / copy.after), split 50/50 from frame 0; the divider then slides so the after side takes 70% of the frame and its value grows. Holds on the final split.',
  bestFor: ['cold open', 'before/after', 'time saved'],
  slots: ['before', 'after', 'beforeLabel', 'afterLabel'],
  params: {
    win: { default: 0.7, min: 0.55, max: 0.8, label: 'Final share of the after panel' },
  },
  sfx: [{ t: 1.35, type: 'whoosh', dur: 0.8, gain: 0.45 }, { t: 2.1, type: 'click', gain: 0.5 }],
  prompt: `Split the frame edge to edge: left panel (top in portrait) is a flat surface tone with faint 45-degree hatching and holds a tracked uppercase "Before" label (2.4% of height) over copy.before in muted display type; the right panel is tinted 10-18% toward the accent with a soft gradient and holds "After" in accent over copy.after in the foreground colour. Frame 0 is the 50/50 split, already readable. A 2 px divider with a 6%-of-height round knob (two small chevrons, soft shadow) sits on the seam. Hold 1.35 s, then move the divider over 900 ms with inOutCubic until the after panel owns 70% of the frame; each panel's content stays centred in its panel, before-text scales to 0.82 and fades toward muted, after-text grows 1.0 to 1.18 with emphasized easing and a check icon pops beside its label (outBack, 400 ms). Hold to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const sBefore = k.copy('before', '6 weeks');
  const sAfter = k.copy('after', '1 afternoon');
  const lBefore = k.copy('beforeLabel', 'Before').toUpperCase();
  const lAfter = k.copy('afterLabel', 'After').toUpperCase();
  const vertical = k.isPortrait;
  const base = k.pick({ wide: 116, square: 104, tall: 108 });
  const lab = { role: 'text', size: k.pick({ wide: 26, square: 26, tall: 28 }), weight: 600, tracking: 0.14 };
  // hatch pattern (cached)
  const hatch = document.createElement('canvas');
  const hs = Math.max(8, Math.round(18 * k.u));
  hatch.width = hs; hatch.height = hs;
  {
    const hg = hatch.getContext('2d');
    hg.strokeStyle = C.alpha(k.brand.colors.fg, k.isDark ? 0.05 : 0.07);
    hg.lineWidth = Math.max(1, 1.2 * k.u);
    hg.beginPath();
    hg.moveTo(0, hs); hg.lineTo(hs, 0);
    hg.moveTo(-hs / 2, hs / 2); hg.lineTo(hs / 2, -hs / 2);
    hg.moveTo(hs / 2, hs * 1.5); hg.lineTo(hs * 1.5, hs / 2);
    hg.stroke();
  }
  let pattern = null;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const mv = ease.inOutCubic(m.seg(t, 1.35, 0.9));
      const split = m.lerp(0.5, 1 - p.win, mv);
      const W = k.W, H = k.H;
      const cut = vertical ? H * split : W * split;
      // panel rects
      const A = vertical ? { x: 0, y: 0, w: W, h: cut } : { x: 0, y: 0, w: cut, h: H };
      const B = vertical ? { x: 0, y: cut, w: W, h: H - cut } : { x: cut, y: 0, w: W - cut, h: H };
      // before panel
      g.fillStyle = C.mix(c.bg, c.surface, k.isDark ? 0.7 : 0.0);
      if (!k.isDark) g.fillStyle = C.mix(c.bg, c.line, 0.45);
      g.fillRect(A.x, A.y, A.w, A.h);
      if (!pattern) pattern = g.createPattern(hatch, 'repeat');
      g.fillStyle = pattern; g.fillRect(A.x, A.y, A.w, A.h);
      // after panel
      const grd = vertical ? g.createLinearGradient(0, B.y, 0, H) : g.createLinearGradient(B.x, 0, W, H);
      grd.addColorStop(0, C.mix(c.bg, c.accent, k.isDark ? 0.2 : 0.12));
      grd.addColorStop(1, C.mix(c.bg, c.accent, k.isDark ? 0.08 : 0.05));
      g.fillStyle = grd; g.fillRect(B.x, B.y, B.w, B.h);
      if (k.isDark) {
        const lead = vertical ? [W * 0.5, B.y] : [B.x, H * 0.5];
        g.save(); g.beginPath(); g.rect(B.x, B.y, B.w, B.h); g.clip();
        k.draw.glow(g, lead[0], lead[1], Math.max(B.w, B.h) * 0.6, c.accent, 0.08 + 0.06 * mv);
        g.restore();
      }
      // content
      const drawSide = (R, label, value, which) => {
        const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
        const room = (vertical ? R.w : R.w) * 0.8;
        let sc, col, lcol;
        if (which === 0) { sc = m.lerp(1, 0.82, mv); col = C.mix(c.fg, c.muted, 0.35 + 0.5 * mv); lcol = c.muted; }
        else { sc = m.lerp(1, 1.18, ease.emphasized(m.seg(t, 1.45, 0.9))); col = c.fg; lcol = c.accent; }
        const o = { size: base * sc, weight: 640, tracking: -0.035 };
        o.size = Math.min(o.size, k.text.fit(value, o, room));
        const L = k.text.layout(value, o);
        const gap = 34 * k.u;
        const LL = k.text.layout(label, lab);
        const total = LL.cap + gap + L.cap;
        const ly = cy - total / 2 + LL.cap / 2;
        const vy = ly + LL.cap / 2 + gap + L.cap / 2;
        if (which === 1) {
          const ck = ease.outBack(m.seg(t, 1.9, 0.4));
          const icS = 34 * k.u;
          const lx = cx - (LL.width + (icS + 10 * k.u) * ck) / 2;
          k.text.draw(g, label, lx, ly, { ...lab, color: lcol, baseline: 'middle' });
          if (ck > 0) {
            g.save(); g.globalAlpha = m.clamp(ck);
            const ix = lx + LL.width + 10 * k.u + icS / 2;
            k.draw.circle(g, ix, ly, (icS / 2) * ck, c.accent);
            k.draw.icon(g, 'check', ix, ly, icS * 0.62 * ck, k.color.onColor(c.accent), { stroke: 2.6 });
            g.restore();
          }
        } else {
          k.text.draw(g, label, cx, ly, { ...lab, color: lcol, align: 'center', baseline: 'middle' });
        }
        k.text.draw(g, value, cx, vy, { ...o, color: col, align: 'center', baseline: 'middle' });
      };
      drawSide(A, lBefore, sBefore, 0);
      drawSide(B, lAfter, sAfter, 1);
      // divider + knob
      const lineCol = C.alpha(c.fg, k.isDark ? 0.55 : 0.35);
      if (vertical) k.draw.line(g, 0, cut, W, cut, lineCol, 2);
      else k.draw.line(g, cut, 0, cut, H, lineCol, 2);
      const kx = vertical ? W * 0.5 : cut, ky = vertical ? cut : H * 0.5;
      const kr = 32 * k.u * (1 + 0.08 * Math.sin(Math.PI * mv));
      g.save();
      g.shadowColor = k.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.22)';
      g.shadowBlur = 24 * k.u; g.shadowOffsetY = 8 * k.u;
      k.draw.circle(g, kx, ky, kr, k.isDark ? C.mix(c.surface, c.fg, 0.08) : '#ffffff');
      g.restore();
      k.draw.circle(g, kx, ky, kr, null, C.alpha(c.fg, 0.18), 1);
      const ic = kr * 0.62;
      g.save();
      g.translate(kx, ky);
      if (vertical) g.rotate(Math.PI / 2);
      k.draw.icon(g, 'chevron-right', ic * 0.42, 0, ic, c.fg, { stroke: 2.2 });
      g.scale(-1, 1);
      k.draw.icon(g, 'chevron-right', ic * 0.42, 0, ic, c.fg, { stroke: 2.2 });
      g.restore();
    },
  };
}
