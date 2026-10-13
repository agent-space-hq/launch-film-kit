// A "NEW" badge sits beside a feature name and beats twice per loop: a quick
// scale tick, a pair of pill-shaped ring waves that ripple out from its outline
// and dissolve, and a breathing glow. Once per loop a specular band glints across
// the badge. Every motion is a periodic function of the loop phase, so the last
// frame hands back to the first with no seam. The type never moves.
export const meta = {
  id: 'loop.badge-pulse',
  name: 'Badge Pulse',
  category: 'loop',
  duration: 3.2,
  loop: true,
  summary: 'A static feature-name lockup with an accent "NEW" pill that beats twice per loop (scale tick plus two pill-shaped ring waves rippling out and fading) and catches one specular glint; static camera, seamless loop.',
  bestFor: ['feature announcement', 'changelog post', 'social loop'],
  slots: ['features', 'sub'],
  params: {
    label: { default: 'NEW', label: 'Badge text' },
    beats: { default: 2, min: 1, max: 4, label: 'Beats per loop' },
    sub: { default: true, label: 'Show the supporting line' },
  },
  sfx: [{ t: 0, type: 'pop', gain: 0.35 }, { t: 1.6, type: 'pop', gain: 0.35 }],
  prompt: `Centre a lockup: an accent pill badge (caps label 40 px, tracking 0.08 em, sparkle icon, height 2.3x the label) beside the feature name in display type (about 156 px, weight 640, tracking -0.035 em), one badge-height apart, with a muted 40 px supporting line left-aligned under the name; on portrait frames stack badge, name and line centred. Only the badge moves. Split the loop into two beats. Each beat: the badge scales up 5% over the first 12% of the beat (outCubic) and settles over the next 48% (inOutCubic); two rings 120 ms apart grow from its outline by 80% of the gap to the name (outCubic), alpha (1 - q) squared after a 6% fade-in, so they vanish before touching the type. A soft glow breathes with the beat. At 55-85% of the loop a white specular band sweeps across the badge. Everything is periodic in the loop phase, so the seam is invisible.`,
};

export function create(k, p) {
  const { m, ease, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = k.copy('features', null) || ['Live roadmaps'];
  const name = k.copy('badgeFeature', feats[0] || 'Live roadmaps');
  const sub = p.sub ? k.copy('sub', '') : '';
  const label = String(p.label || 'NEW').toUpperCase();
  const stack = k.isPortrait;
  const onA = C.onColor(c.accent, ['#ffffff', '#0b0b0c']);

  // badge geometry
  const bO = { role: 'text', size: k.pick({ wide: 40, square: 40, tall: 46 }), weight: 650, tracking: 0.08 };
  const bL = k.text.layout(label, bO);
  const bh = bO.size * 2.3 * U, icon = bO.size * 0.82 * U, padX = bO.size * 0.9 * U, iGap = bO.size * 0.36 * U;
  const bw = padX * 2 + icon + iGap + bL.width;
  // name: largest size that fits next to (or under) the badge
  const gap = bh * 0.95; // room for the ring waves between badge and name
  const nO = { role: 'display', size: k.pick({ wide: 156, square: 128, tall: 132 }), weight: 640, tracking: -0.035 };
  const nMax = stack ? k.safe.w * 0.94 : k.safe.w * 0.94 - bw - gap;
  nO.size = k.text.fit(name, nO, nMax, 40);
  const nL = k.text.layout(name, nO);
  const sO = { role: 'text', size: k.pick({ wide: 40, square: 38, tall: 40 }), weight: 440, tracking: -0.005 };
  const sLines = sub ? k.text.balance(sub, sO, stack ? k.safe.w * 0.86 : Math.max(nL.width, k.safe.w * 0.4)) : [];
  const sLh = sO.size * 1.3 * U;
  const subGap = k.pick({ wide: 72, square: 68, tall: 76 }) * U;
  // vertical layout
  const rowGap = bh * 1.05;
  let bx, by, nx, ny, blockH;
  if (stack) {
    blockH = bh + rowGap + nL.cap + (sLines.length ? subGap + (sLines.length - 1) * sLh + sO.size * 0.75 * U : 0);
    const top = k.cy - blockH / 2;
    bx = k.cx - bw / 2; by = top;
    nx = k.cx; ny = top + bh + rowGap + nL.cap / 2;
  } else {
    const rowW = bw + gap + nL.width;
    const rowH = Math.max(bh, nL.cap);
    blockH = rowH + (sLines.length ? subGap + (sLines.length - 1) * sLh + sO.size * 0.75 * U : 0);
    const rowY = k.cy - blockH / 2 + rowH / 2;
    bx = k.cx - rowW / 2; by = rowY - bh / 2;
    nx = bx + bw + gap; ny = rowY;
  }
  const subY = ny + nL.cap / 2 + subGap;
  const subX = stack ? k.cx : nx + nL.cap * 0.02;
  const ringMax = (stack ? rowGap : gap) * 0.8; // rings fade out before they reach the type
  const bcx = bx + bw / 2, bcy = by + bh / 2;
  const ringC = dark ? C.mix(c.accent, '#ffffff', 0.15) : c.accent;

  // 0 -> 1 -> 0 heartbeat over one beat phase (rests at 0 for the last 40%)
  const beatShape = (ph) => (ph < 0.12 ? ease.outCubic(ph / 0.12) : 1 - ease.inOutCubic((ph - 0.12) / 0.48));
  const frac = (x) => x - Math.floor(x);

  return {
    draw(g, t) {
      const D = p.duration ?? meta.duration;
      const nb = Math.max(1, Math.round(p.beats));
      const L = frac(t / D); // loop phase
      const ph = frac(L * nb); // beat phase
      const P = D / nb; // beat length (s)
      const beat = beatShape(ph);

      // glow / shadow under the badge, breathing with the beat
      if (dark) k.draw.glow(g, bcx, bcy, bw * (1.1 + 0.15 * beat), c.accent, 0.2 + 0.16 * beat);

      // ring waves (behind the badge)
      for (let r = 0; r < 2; r++) {
        const q = frac(ph - (r * 0.12) / P);
        const a = m.smoothstep(0, 0.06, q) * (1 - q) ** 2 * (r === 0 ? 0.6 : 0.4);
        if (a <= 0.003) continue;
        const off = ease.outCubic(q) * ringMax;
        g.save();
        g.globalAlpha *= a;
        k.draw.rrect(g, bx - off, by - off, bw + off * 2, bh + off * 2, bh / 2 + off, null, ringC, 2.4 - 1.2 * q);
        g.restore();
      }

      // the badge
      const s = 1 + 0.05 * beat;
      g.save();
      g.translate(bcx, bcy); g.scale(s, s); g.translate(-bcx, -bcy);
      if (!dark) k.draw.shadow(g, bx, by, bw, bh, bh / 2, { blur: 26 + 10 * beat, y: 10, color: C.alpha(c.accent, 0.3 + 0.1 * beat) });
      k.draw.rrect(g, bx, by, bw, bh, bh / 2, c.accent);
      // inner top light + specular glint once per loop
      g.save();
      k.draw.rrectPath(g, bx, by, bw, bh, bh / 2); g.clip();
      const il = g.createLinearGradient(0, by, 0, by + bh);
      il.addColorStop(0, 'rgba(255,255,255,0.18)'); il.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.fillStyle = il; g.fillRect(bx, by, bw, bh);
      const gl = m.seg(L, 0.55, 0.3);
      if (gl > 0 && gl < 1) {
        const gx = m.lerp(bx - bw * 0.4, bx + bw * 1.4, ease.inOutCubic(gl));
        const sg = g.createLinearGradient(gx - bh, by, gx + bh, by + bh);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.32)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = sg; g.fillRect(bx, by, bw, bh);
      }
      g.restore();
      k.draw.rrect(g, bx + 0.5, by + 0.5, bw - 1, bh - 1, bh / 2, null, 'rgba(255,255,255,0.22)', 1);
      k.draw.icon(g, 'sparkle', bx + padX + icon / 2, bcy, icon, onA, { fill: true });
      k.text.draw(g, label, bx + padX + icon + iGap, bcy, { ...bO, baseline: 'middle', color: onA });
      g.restore();

      // static type
      k.text.draw(g, name, nx, ny, { ...nO, align: stack ? 'center' : 'left', baseline: 'middle', color: c.fg });
      sLines.forEach((ln, i) => k.text.draw(g, ln, subX, subY + i * sLh, { ...sO, align: stack ? 'center' : 'left', baseline: 'middle', color: c.muted, qaGroup: sub }));
    },
  };
}
