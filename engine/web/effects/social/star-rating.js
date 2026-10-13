// Five outlined stars fill with one continuous left-to-right sweep that stops at the
// exact rating (a partial last star), while the score counts above in lockstep. Each
// star pulses as the sweep crosses it; a "from N reviews" line settles underneath.
export const meta = {
  id: 'social.star-rating',
  name: 'Star Rating',
  category: 'social',
  duration: 4.6,
  summary: 'Outlined stars rise in, a single accent sweep fills them to the rating (partial last star) while the score counts and each star pulses as it fills; the review count line follows; holds, then fades in the last 0.45 s.',
  bestFor: ['ratings', 'reviews', 'social proof'],
  slots: ['rating'],
  params: {
    rating: { default: { value: 4.9, count: 2400, source: 'reviews' }, label: 'SAMPLE DATA used when copy.rating is missing: {value (0–5), count, source}' },
  },
  sfx: [{ t: 0.75, type: 'tick', gain: 0.4 }, { t: 1.05, type: 'tick', gain: 0.4 }, { t: 1.35, type: 'tick', gain: 0.4 }, { t: 1.65, type: 'tick', gain: 0.4 }, { t: 1.95, type: 'tick', gain: 0.4 }, { t: 2.25, type: 'shimmer', gain: 0.5 }],
  prompt: `Rating proof, 4.6 s. Centre a stack: the score in display type (~190 px, 650 weight, -0.045 em) with a muted "/ 5", a row of five stars (each ~14% of the short side, 5-point polygons, inner radius 44%) and a muted 34 px "from N reviews" line. Stars enter as hairline outlines, scaling from 70% with outExpo over 600 ms, staggered 60 ms. From 700 ms an accent fill sweeps across with inOutCubic over 1500 ms, measured in star units (star i is covered by clamp(rating x progress - i) of its own width), so 4.9 leaves the fifth star 90% full; a soft bright band rides the fill edge. The score counts in lockstep, and each star swells to 108% (sine, 350 ms) as the fill crosses its centre. The review line rises 16 px with outExpo at 2.1 s, its count rolling up. Hold, then fade over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function starPath(cx, cy, R, inner = 0.44) {
  const p = new Path2D();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? R * inner : R;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i) p.lineTo(x, y); else p.moveTo(x, y);
  }
  p.closePath();
  return p;
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const r = k.copy('rating', null) || p.rating;
  const val = m.clamp(r.value, 0, 5);
  const count = r.count || 0;
  const D = p.duration ?? meta.duration;
  const S0 = 0.7, SD = 1.5;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const starR = k.pick({ wide: 74, square: 70, tall: 74 }) * u;
      const gap = 26 * u;
      const pitch = starR * 2 + gap;
      const rowW = pitch * 5 - gap;
      const x0 = k.cx - rowW / 2;
      const rowY = k.cy + 30 * u;
      const sweep = ease.inOutCubic(m.seg(t, S0, SD));
      // fill measured in star units so a 4.5 shows exactly half of the fifth star
      const su = val * sweep;
      const si = Math.min(4, Math.floor(su));
      const edgeX = su >= 5 ? x0 + rowW : x0 + si * pitch + (su - si) * starR * 2;
      const fillW = su > 0 ? 1 : 0;

      // stars
      const paths = [];
      for (let i = 0; i < 5; i++) {
        const cx = x0 + starR + i * pitch;
        const ap = ease.outExpo(m.seg(t, 0.1 + i * 0.06, 0.6));
        const cross = val > 0 ? (i + 0.5) / val : 2; // sweep fraction at which the fill crosses this star's centre
        const crossT = S0 + SD * Math.min(1, cross);
        const bump = cross <= 1 ? Math.sin(Math.PI * m.seg(t, crossT - 0.05, 0.35)) : 0;
        const sc = (0.7 + 0.3 * ap) * (1 + 0.08 * bump);
        paths.push({ cx, path: starPath(0, 0, starR), sc, ap });
      }
      g.save();
      g.globalAlpha = fade;
      paths.forEach((s) => {
        if (s.ap <= 0) return;
        g.save();
        g.translate(s.cx, rowY); g.scale(s.sc, s.sc);
        g.globalAlpha = fade * s.ap;
        g.fillStyle = C.alpha(c.fg, k.isDark ? 0.05 : 0.04); g.fill(s.path);
        g.strokeStyle = C.alpha(c.fg, k.isDark ? 0.3 : 0.28); g.lineWidth = 2 * u / s.sc; g.lineJoin = 'round'; g.stroke(s.path);
        g.restore();
      });
      // filled portion, clipped to the sweep
      if (fillW > 0.5) {
        g.save();
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const f = m.clamp(su - i);
          if (f <= 0) break;
          const sx = x0 + i * pitch - starR * 0.2;
          g.rect(sx, rowY - starR * 1.5, f >= 1 ? starR * 2.4 : f * starR * 2 + starR * 0.2, starR * 3);
        }
        g.clip();
        if (k.isDark) { g.shadowColor = C.alpha(c.accent, 0.55); g.shadowBlur = 30 * u; }
        paths.forEach((s) => {
          g.save();
          g.translate(s.cx, rowY); g.scale(s.sc, s.sc);
          g.fillStyle = c.accent; g.fill(s.path);
          g.lineWidth = 2 * u / s.sc; g.lineJoin = 'round'; g.strokeStyle = c.accent; g.stroke(s.path);
          g.restore();
        });
        g.shadowColor = 'transparent';
        // bright band riding the edge
        const band = 1 - m.seg(t, S0 + SD, 0.3);
        if (band > 0) {
          const bw = 90 * u;
          paths.forEach((s) => {
            if (Math.abs(s.cx - edgeX) > starR + bw) return;
            g.save();
            g.translate(s.cx, rowY); g.scale(s.sc, s.sc);
            const lx = (edgeX - s.cx) / s.sc;
            const grd = g.createLinearGradient(lx - bw / s.sc, 0, lx, 0);
            grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(1, `rgba(255,255,255,${(0.45 * band).toFixed(3)})`);
            g.fillStyle = grd; g.fill(s.path);
            g.restore();
          });
        }
        g.restore();
      }
      g.restore();

      // score
      const nIn = ease.outExpo(m.seg(t, 0.15, 0.7)) * fade;
      if (nIn > 0) {
        const o = { size: k.pick({ wide: 190, square: 170, tall: 180 }), weight: 650, tracking: -0.045 };
        const final = fmt(val, 1);
        const shown = sweep >= 1 ? final : fmt(val * sweep, 1);
        const L = k.text.layout(final, o);
        const so = { role: 'display', size: o.size * 0.32, weight: 520, tracking: -0.02 };
        const SL = k.text.layout('/ 5', so);
        const total = L.width + 22 * u + SL.width;
        const sx = k.cx - total / 2;
        const sy = rowY - starR - 70 * u - L.cap / 2 + (1 - nIn) * 20 * u;
        k.text.draw(g, shown, sx, sy, { ...o, baseline: 'middle', alpha: nIn });
        k.text.draw(g, '/ 5', sx + L.width + 22 * u, sy + L.cap / 2, { ...so, color: c.muted, baseline: 'alphabetic', alpha: nIn });
      }
      // review line
      const la = ease.outExpo(m.seg(t, 2.1, 0.8)) * fade;
      if (la > 0 && count) {
        const cnt = ease.outQuint(m.seg(t, 2.1, 1.0));
        const str = `from ${fmt(Math.round(count * cnt))} ${r.source || 'reviews'}`;
        const fin = `from ${fmt(count)} ${r.source || 'reviews'}`;
        const lo = { role: 'text', size: 34, weight: 470 };
        const L = k.text.layout(fin, lo);
        k.text.draw(g, str, k.cx - L.width / 2, rowY + starR + 70 * u + (1 - la) * 16 * u, { ...lo, color: c.muted, baseline: 'middle', alpha: la });
      }
    },
  };
}
