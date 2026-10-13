// A window into the next shot: a circle opens at the centre of A, morphs into a
// soft-cornered rectangle, then throws itself open to the full frame. B sits
// behind the window at full size, gently de-zooming, so the shape is a mask, not
// a thumbnail.
export const meta = {
  id: 'transition.shape-morph',
  name: 'Shape Morph',
  category: 'transition',
  duration: 1.3,
  summary: 'A circular window onto B opens at the centre of A, morphs smoothly into a rounded rectangle, then expands to fill the frame; B de-zooms slightly inside the mask.',
  bestFor: ['reveal', 'chapter change', 'logo to scene'],
  params: {
    circle: { default: 0.2, min: 0.08, max: 0.35, label: 'Circle radius (x short side)' },
  },
  sfx: [{ t: 0.05, type: 'pop', gain: 0.4 }, { t: 0.75, type: 'whoosh', dur: 0.55, gain: 0.45 }],
  prompt: `Mask shot B inside one superellipse-cornered rectangle (width, height, radius); a circle is w = h = 2r. Key poses: start (0, 0, 0); circle of radius 20% of the short side; rounded rectangle at 44% of the frame width and height with a 7% radius; slightly past the full frame (plus 8% of the short side, so no sliver of A lingers) with radius 0. Timing over 1300 ms: the circle opens 0-380 ms (outQuint), morphs to the rectangle 300-760 ms (inOutCubic), and expands to full frame 650-1300 ms (emphasized curve). B is drawn full size behind the mask, scaled from 1.12 to 1.00 across the whole transition. A gently pushes in from 1.00 to 1.05 and takes a dark scrim up to 35% (12% on light). A 1.5 px hairline (white 30% on dark, soft shadow on light) traces the mask until the expansion starts. Exact A at frame 0, exact B at the end.`,
};

export function create(k, p) {
  const { ease, m } = k;
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const f = t / D;
      const S = Math.min(k.W, k.H);
      const e1 = ease.outQuint(m.seg(f, 0, 0.29));
      const e2 = ease.inOutCubic(m.seg(f, 0.23, 0.36));
      const e3 = ease.emphasized(m.seg(f, 0.5, 0.5));
      const r0 = p.circle * S;
      // circle -> rounded rect -> full frame
      let w = 2 * r0 * e1, h = 2 * r0 * e1, r = r0 * e1;
      w = m.lerp(w, k.W * 0.44, e2); h = m.lerp(h, k.H * 0.44, e2); r = m.lerp(r, 0.07 * S, e2);
      w = m.lerp(w, k.W + 0.08 * S, e3); h = m.lerp(h, k.H + 0.08 * S, e3); r = m.lerp(r, 0, e3);
      // (the target overshoots the frame so no sliver of A lingers in the tail)
      const x = k.cx - w / 2, y = k.cy - h / 2;
      // A behind
      const sa = 1 + 0.05 * ease.inOutCubic(f);
      g.save();
      g.translate(k.cx, k.cy); g.scale(sa, sa); g.translate(-k.cx, -k.cy);
      g.drawImage(a, 0, 0);
      g.restore();
      g.fillStyle = `rgba(0,0,0,${((k.isDark ? 0.35 : 0.12) * ease.outCubic(m.seg(f, 0, 0.5))).toFixed(3)})`;
      g.fillRect(0, 0, k.W, k.H);
      if (w < 1) return;
      const n = m.lerp(2, 4.5, e2); // superellipse exponent: circle-like -> squircle
      const edgeA = 1 - e3;
      if (!k.isDark && edgeA > 0.01) {
        g.save();
        g.globalAlpha = edgeA;
        g.shadowColor = 'rgba(20,30,60,0.3)'; g.shadowBlur = 40 * k.u; g.shadowOffsetY = 16 * k.u;
        k.draw.squirclePath(g, x, y, w, h, r, n); g.fillStyle = '#000'; g.fill();
        g.restore();
      }
      g.save();
      k.draw.squirclePath(g, x, y, w, h, r, n);
      g.clip();
      const sb = 1.12 - 0.12 * ease.decel(f);
      g.translate(k.cx, k.cy); g.scale(sb, sb); g.translate(-k.cx, -k.cy);
      g.drawImage(b, 0, 0);
      g.restore();
      if (k.isDark && edgeA > 0.01) {
        g.save();
        k.draw.squirclePath(g, x, y, w, h, r, n);
        g.strokeStyle = `rgba(255,255,255,${(0.3 * edgeA).toFixed(3)})`;
        g.lineWidth = 1.5 * k.u;
        g.stroke();
        g.restore();
      }
    },
  };
}
