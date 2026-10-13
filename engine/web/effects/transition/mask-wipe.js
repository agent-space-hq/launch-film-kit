// A diagonal wipe with a feathered trailing edge and a hairline of accent light
// riding its leading edge. The outgoing shot eases back a touch as it is covered;
// the incoming shot settles from a slight over-scale, giving the cut some depth.
export const meta = {
  id: 'transition.mask-wipe',
  name: 'Mask Wipe',
  category: 'transition',
  duration: 1.0,
  summary: 'A tilted, soft-edged wipe crosses the frame left to right with a thin accent line on its leading edge; A drifts back slightly while B settles from a 4% over-scale.',
  bestFor: ['section change', 'before to after', 'fast cut with polish'],
  params: {
    angle: { default: 18, min: 0, max: 45, label: 'Edge tilt from vertical (deg)' },
    feather: { default: 0.07, min: 0, max: 0.2, label: 'Feather (x short side)' },
  },
  sfx: [{ t: 0.5, type: 'whoosh', dur: 0.7, gain: 0.5 }],
  prompt: `Wipe from shot A to shot B along a straight edge tilted 18 degrees from vertical, travelling left to right. Project the four frame corners onto the edge normal to find the travel range so the edge, its feather and its line all start and end fully off-frame. Progress uses an inOutCubic curve over the whole transition (1000 ms). Draw A, then draw B into a scratch layer and multiply it by a linear gradient along the normal: opaque behind the edge, fading to clear over a 7% (of the short side) feather that leads into A. Ride a 3 px accent line on the leading edge, with a 26 px soft accent glow on dark brands. For depth, A scales 1.00 to 1.03 and B scales 1.04 to 1.00 about the centre on the same curve. Frame 0 is exactly A and the last frame is exactly B.`,
};

export function create(k, p) {
  const { ease, m } = k;
  return {
    draw(g, t, { a, b, dur }) {
      const D = dur ?? p.duration ?? meta.duration;
      const pr = ease.inOutCubic(m.seg(t, 0, D));
      if (pr <= 0) { g.drawImage(a, 0, 0); return; }
      if (pr >= 1) { g.drawImage(b, 0, 0); return; }
      const c = k.brand.colors;
      const ang = (p.angle * Math.PI) / 180;
      const nx = Math.cos(ang), ny = -Math.sin(ang); // edge normal (points right, slightly up)
      const proj = [[0, 0], [k.W, 0], [0, k.H], [k.W, k.H]].map(([x, y]) => (x - k.cx) * nx + (y - k.cy) * ny);
      const feather = p.feather * Math.min(k.W, k.H);
      const lw = 3 * k.u, glowW = 26 * k.u;
      const s0 = Math.min(...proj) - glowW, s1 = Math.max(...proj) + feather + glowW;
      const s = m.lerp(s0, s1, pr);
      const scaled = (img, sc) => {
        g.save();
        g.translate(k.cx, k.cy); g.scale(sc, sc); g.translate(-k.cx, -k.cy);
        g.drawImage(img, 0, 0);
        g.restore();
      };
      scaled(a, 1 + 0.03 * pr);
      // B through a feathered gradient mask
      const lay = k.layer('mask-wipe'), lg = k.ctx(lay);
      lg.setTransform(1, 0, 0, 1, 0, 0);
      lg.globalCompositeOperation = 'copy';
      const sb = 1.04 - 0.04 * pr;
      lg.save(); lg.translate(k.cx, k.cy); lg.scale(sb, sb); lg.translate(-k.cx, -k.cy); lg.drawImage(b, 0, 0); lg.restore();
      lg.globalCompositeOperation = 'destination-in';
      const e0 = s - feather, e1 = s;
      const grd = lg.createLinearGradient(k.cx + nx * e0, k.cy + ny * e0, k.cx + nx * e1, k.cy + ny * e1);
      grd.addColorStop(0, 'rgba(0,0,0,1)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      lg.fillStyle = grd;
      lg.fillRect(0, 0, k.W, k.H);
      lg.globalCompositeOperation = 'source-over';
      g.drawImage(lay, 0, 0);
      // accent leading edge (a long line along the edge direction)
      const px = k.cx + nx * s, py = k.cy + ny * s;
      const tx = -ny, ty = nx, L = Math.hypot(k.W, k.H);
      const edgeA = Math.sin(Math.PI * pr) ** 0.35;
      g.save();
      g.lineCap = 'butt';
      if (k.isDark) {
        g.globalAlpha = 0.22 * edgeA;
        g.strokeStyle = c.accent; g.lineWidth = glowW;
        g.filter = `blur(${(10 * k.u).toFixed(1)}px)`;
        g.beginPath(); g.moveTo(px - tx * L, py - ty * L); g.lineTo(px + tx * L, py + ty * L); g.stroke();
        g.filter = 'none';
      }
      g.globalAlpha = edgeA;
      g.strokeStyle = k.isDark ? k.color.mix(c.accent, c.fg, 0.35) : c.accent; g.lineWidth = lw;
      g.beginPath(); g.moveTo(px - tx * L, py - ty * L); g.lineTo(px + tx * L, py + ty * L); g.stroke();
      g.restore();
    },
  };
}
