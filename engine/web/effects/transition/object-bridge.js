// A continuity bridge: a rounded card carrying a miniature of the next shot pops
// up in the middle of the outgoing shot, then grows to fill the frame. The old
// shot sinks back and dims behind it, so the cut feels like opening an object.
export const meta = {
  id: 'transition.object-bridge',
  name: 'Object Bridge',
  category: 'transition',
  duration: 1.2,
  summary: 'A rounded card holding a miniature of B pops up at the centre of A, then expands to full frame while its corners square off; A recedes and dims behind it.',
  bestFor: ['product to detail', 'scene change with continuity', 'app open'],
  params: {
    card: { default: 0.26, min: 0.12, max: 0.45, label: 'Card size (x frame)' },
  },
  sfx: [{ t: 0.08, type: 'pop', gain: 0.5 }, { t: 0.55, type: 'whoosh', dur: 0.6, gain: 0.45 }],
  prompt: `Bridge shot A to shot B through a card. Phase 1 (0-420 ms, outQuint): a rounded rectangle with the frame's aspect grows from nothing to 26% of the frame size at the centre, corner radius 5% of the short side, soft shadow on light brands and a 1 px light hairline on dark. Phase 2 (220-1200 ms, inOutCubic, overlapping): the card expands to 105% of the frame (so no sliver of A lingers) while its radius shrinks with the square root of the remaining progress, so corners stay soft until the very end. Inside, B is drawn scaled to the card size times a parallax factor of 1.12 that relaxes to 1.0, so the content feels slightly closer than the card. Behind, A scales from 1.00 to 0.92 and takes a dark scrim up to 45% (dark brands) or 18% (light) on the phase-2 curve. Frame 0 is exactly A, the last frame exactly B.`,
};

export function create(k, p) {
  const { ease, m } = k;
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      if (t <= 0) { g.drawImage(a, 0, 0); return; }
      if (t >= D) { g.drawImage(b, 0, 0); return; }
      const c = k.brand.colors;
      const f = t / D;
      const e1 = ease.outQuint(m.seg(f, 0, 0.35));
      const e2 = ease.inOutCubic(m.seg(f, 0.18, 0.82));
      const sc = m.lerp(p.card * e1, 1, e2); // content scale relative to the frame
      const scCard = m.lerp(p.card * e1, 1.05, e2); // card overshoots the frame so the tail never shows a sliver of A
      const w = k.W * scCard, h = k.H * scCard;
      const x = k.cx - w / 2, y = k.cy - h / 2;
      const r = Math.min(w, h) / 2 > 0 ? Math.min(0.05 * Math.min(k.W, k.H) * Math.sqrt(1 - e2), w / 2, h / 2) : 0;
      // A recedes
      const sa = 1 - 0.08 * e2;
      g.save();
      g.translate(k.cx, k.cy); g.scale(sa, sa); g.translate(-k.cx, -k.cy);
      g.drawImage(a, 0, 0);
      g.restore();
      g.fillStyle = `rgba(0,0,0,${((k.isDark ? 0.45 : 0.18) * e2).toFixed(3)})`;
      g.fillRect(0, 0, k.W, k.H);
      if (sc <= 0.001) return;
      // card
      if (r > 0.5) k.draw.shadow(g, x, y, w, h, r, { blur: 60, y: 24, color: k.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.28)', alpha: 1 - e2 });
      g.save();
      k.draw.squirclePath(g, x, y, w, h, r);
      g.clip();
      const sb = sc * (1 + 0.12 * (1 - e2));
      g.translate(k.cx, k.cy); g.scale(sb, sb); g.translate(-k.cx, -k.cy);
      g.drawImage(b, 0, 0);
      g.restore();
      if (k.isDark && r > 0.5) {
        g.save();
        k.draw.squirclePath(g, x + 0.5, y + 0.5, w - 1, h - 1, r);
        g.strokeStyle = `rgba(255,255,255,${(0.22 * (1 - e2)).toFixed(3)})`;
        g.lineWidth = Math.max(1, k.u);
        g.stroke();
        g.restore();
      }
    },
  };
}
