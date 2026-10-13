// A 10x10 matrix of unit dots: the empty grid ripples in diagonally, then dots fill one
// by one from the bottom-left in reading rows while the percentage counts. When the
// fill lands, a soft wave rolls out from the last dot through the filled block.
export const meta = {
  id: 'data.unit-dots',
  name: 'Unit Dots',
  category: 'data',
  duration: 4.8,
  summary: 'An empty 10x10 dot grid ripples in, dots fill bottom-up one per percent while the number counts, a wave rolls through the filled block; holds, then fades and settles in the last 0.45 s.',
  bestFor: ['proportion', 'share', 'adoption'],
  slots: ['stats'],
  params: {
    stat: { default: -1, min: -1, max: 2, label: 'copy.stats index (-1 = first % stat between 1 and 96)' },
    sample: { default: { value: 68, suffix: '%', label: 'of teams now ship every week' }, label: 'SAMPLE DATA used when no suitable % stat exists' },
  },
  sfx: [{ t: 0.15, type: 'shimmer', gain: 0.35 }, { t: 0.9, type: 'type', n: 18, dur: 1.4, gain: 0.3 }, { t: 2.45, type: 'tick', gain: 0.7 }],
  prompt: `Waffle proportion, 4.8 s. A 10 by 10 grid of dots (pitch ~6.5% of the short side, dot 64% of pitch) appears as faint rings scaling up in a diagonal ripple: 36 ms per diagonal step, each 400 ms outExpo. From 900 ms one dot per percent fills with the accent, in rows from the bottom-left upward, every 20 ms; each pops from 60% to 100% with a gentle outBack over 350 ms and a brief bright flash. The big number (display 150 px, -0.045 em) counts with the filled dots; a muted 34 px label sits beneath. A fractional value fills the last dot as a partial pie. On landing a radial wave scales filled dots by up to 12% outward from the last dot, then a legend ("Each dot = 1%") appears. Grid left and text right on wide, grid above text on tall. Hold, then fade with a 2% scale-down over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const stats = k.copy('stats', null) || [];
  let st = p.stat >= 0 ? stats[p.stat] : stats.find((s) => s.suffix === '%' && s.value >= 1 && s.value <= 96);
  const isSample = !st || st.suffix !== '%';
  if (isSample) st = p.sample;
  const val = m.clamp(st.value, 0, 100);
  const dec = st.decimals || 0;
  const D = p.duration ?? meta.duration;
  const FILL0 = 0.9, PER = 0.02;
  const full = Math.floor(val + 1e-9);
  const frac = val - full;
  const fillEnd = FILL0 + Math.ceil(val) * PER;
  // index -> (col,row) with row 0 at the bottom
  const pos = (i) => [i % 10, Math.floor(i / 10)];

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const wide = k.isWide;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const pitch = k.pick({ wide: 70, square: 64, tall: 80 }) * u;
      const dotR = pitch * 0.32;
      const gridW = pitch * 10;
      const textW = 620 * u;
      let gx, gy, tx, ty, align;
      if (wide) {
        const total = gridW + 120 * u + textW;
        gx = k.cx - total / 2; gy = k.cy - gridW / 2;
        tx = gx + gridW + 120 * u; ty = k.cy - 40 * u; align = 'left';
      } else {
        gx = k.cx - gridW / 2; gy = k.cy - gridW / 2 - (k.isPortrait ? 200 : 170) * u;
        tx = k.cx; ty = gy + gridW + (k.isPortrait ? 190 : 150) * u; align = 'center';
      }
      const center = (i) => { const [cx, r] = pos(i); return [gx + (cx + 0.5) * pitch, gy + gridW - (r + 0.5) * pitch]; };

      // landing wave
      const lastI = Math.max(0, Math.ceil(val) - 1);
      const [lx, ly] = center(lastI);
      const waveT = m.seg(t, fillEnd + 0.05, 1.0);

      g.save();
      g.translate(gx + gridW / 2, gy + gridW / 2); g.scale(1 - 0.02 * exitP, 1 - 0.02 * exitP); g.translate(-(gx + gridW / 2), -(gy + gridW / 2));
      g.globalAlpha = fade;
      const empty = C.alpha(c.fg, k.isDark ? 0.14 : 0.16);
      for (let i = 0; i < 100; i++) {
        const [col, row] = pos(i);
        const [x, y] = center(i);
        const diag = col + (9 - row);
        const ap = ease.outExpo(m.seg(t, 0.1 + diag * 0.036, 0.4));
        if (ap <= 0) continue;
        const ft = FILL0 + i * PER;
        const fp = i < Math.ceil(val) ? m.seg(t, ft, 0.35) : 0;
        // wave
        const d = Math.hypot(x - lx, y - ly) / (pitch * 14);
        const w = waveT > 0 && i < Math.ceil(val) ? Math.exp(-(((waveT - d) / 0.12) ** 2)) * (1 - waveT * 0.5) : 0;
        const r = dotR * ap;
        // empty ring
        if (fp < 1) k.draw.circle(g, x, y, r * 0.96, null, empty, 1.6);
        if (fp > 0) {
          const pop = 0.6 + 0.4 * ease.outBack(fp, 1.2);
          const rr = r * pop * (1 + 0.12 * w);
          const flash = 1 - m.seg(fp, 0.2, 0.8);
          const fill = C.mix(c.accent, k.isDark ? '#ffffff' : c.accent, 0.35 * flash + 0.2 * w);
          const isFrac = i === full && frac > 0;
          if (k.isDark && (flash > 0.05 || w > 0.05)) k.draw.glow(g, x, y, rr * 2.6, c.accent, 0.35 * Math.max(flash, w));
          if (isFrac) {
            g.beginPath(); g.moveTo(x, y); g.arc(x, y, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac * m.clamp(fp * 1.2)); g.closePath();
            g.fillStyle = fill; g.fill();
          } else {
            g.globalAlpha = fade * Math.min(1, fp * 3);
            k.draw.circle(g, x, y, rr, fill);
            g.globalAlpha = fade;
          }
        }
      }
      g.restore();

      // number + label
      const nIn = ease.outExpo(m.seg(t, 0.5, 0.7)) * fade;
      if (nIn > 0) {
        const filled = m.clamp((t - FILL0) / PER, 0, Math.ceil(val));
        const shown = t >= fillEnd ? val : Math.min(val, Math.floor(filled));
        const finalStr = fmt(val, dec) + (st.suffix || '');
        const o = { size: k.pick({ wide: 150, square: 140, tall: 150 }), weight: 650, tracking: -0.045 };
        o.size = k.text.fit(finalStr, o, wide ? textW : k.safe.w);
        const L = k.text.layout(finalStr, o);
        const yy = ty + (1 - nIn) * 20 * u;
        k.text.draw(g, fmt(shown, dec) + (st.suffix || ''), tx, yy, { ...o, align, baseline: 'middle', alpha: nIn });
        const la = ease.outExpo(m.seg(t, 1.1, 0.7)) * fade;
        const lo = { role: 'text', size: 34, weight: 470 };
        const lines = k.text.balance(st.label, lo, wide ? textW : k.safe.w * 0.9);
        lines.forEach((ln, li) => k.text.draw(g, ln, tx, yy + L.cap / 2 + 34 * u + li * 44 * u + (1 - la) * 12 * u, { ...lo, color: c.muted, align, baseline: 'top', alpha: la, qaGroup: 'label' }));
        // accent rule + unit legend
        const ra = ease.outQuint(m.seg(t, fillEnd, 0.7)) * fade;
        const legY = yy + L.cap / 2 + 34 * u + lines.length * 44 * u + 40 * u;
        if (ra > 0) {
          const legend = isSample ? 'Each dot = 1%  ·  sample data' : 'Each dot = 1%';
          const LL = k.text.layout(legend, { role: 'mono', size: 22 });
          const lx0 = align === 'left' ? tx : tx - (LL.width + 32 * u) / 2;
          g.save(); g.globalAlpha = ra;
          k.draw.circle(g, lx0 + 9 * u, legY, 9 * u, c.accent);
          g.restore();
          k.text.draw(g, legend, lx0 + 32 * u, legY, { role: 'mono', size: 22, color: c.muted, baseline: 'middle', alpha: ra });
        }
      }
    },
  };
}
