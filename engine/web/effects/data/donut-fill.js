// A ring fills to a real percentage from copy.stats with a round cap, the centre number
// counting in lockstep. A ring of fine ticks lights up as the fill passes, then a
// two-row legend (share and remainder) settles beside it.
export const meta = {
  id: 'data.donut-fill',
  name: 'Donut Fill',
  category: 'data',
  duration: 4.8,
  summary: 'A track ring draws, the accent arc sweeps to the percentage while the centre number counts and outer ticks light; a legend settles, holds, then the ring fades and eases back in the last 0.45 s.',
  bestFor: ['share', 'rate', 'proportion'],
  slots: ['stats'],
  params: {
    stat: { default: -1, min: -1, max: 2, label: 'copy.stats index (-1 = first stat with a % suffix)' },
    sample: { default: { value: 72, suffix: '%', label: 'of releases ship on time' }, label: 'SAMPLE DATA used when no % stat exists' },
    remainderLabel: { default: 'Everything else', label: 'Legend label for the remainder' },
  },
  sfx: [{ t: 0.7, type: 'swell', dur: 1.8, gain: 0.45 }, { t: 2.45, type: 'tick', gain: 0.8 }],
  prompt: `Percentage donut, 4.8 s. Ring diameter 52% of the short side, stroke 9% of the diameter. A neutral track sweeps around from 12 o'clock over 700 ms (inOutCubic, from 100 ms). From 700 ms the accent arc fills clockwise to the value with a round cap over 1900 ms using a (0.3, 0, 0, 1) bezier; the centre number (display, 22% of diameter, 640 weight, -0.04 em) counts in lockstep and its label sits beneath in muted text. Seventy-two hairline ticks sit 5% outside the ring and switch to accent as the cap passes. When the arc lands, the cap blooms (glow on dark, ring on light) for 500 ms. Legend rows (swatch, label, value; 30 px text) slide in 16 px with outExpo, staggered 80 ms, to the right on wide and below on tall. Hold to 4.35 s, then fade with a 3% scale-down over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const stats = k.copy('stats', null) || [];
  let st = p.stat >= 0 ? stats[p.stat] : stats.find((s) => s.suffix === '%');
  if (!st || st.suffix !== '%') st = p.sample;
  const pct = m.clamp(st.value / 100);
  const dec = st.decimals || 0;
  const rem = Math.max(0, 100 - st.value);
  const D = p.duration ?? meta.duration;
  const fillE = ease.bezier(0.3, 0, 0, 1);
  const TICKS = 72;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const S = k.safe;
      const wide = k.isWide;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;

      const dia = k.pick({ wide: 560, square: 540, tall: 600 }) * u;
      const R = dia / 2;
      const sw = dia * 0.09;
      const legendW = 600 * u;
      const gap = 130 * u;
      let rx, ry, lx, ly;
      if (wide) {
        const total = dia + gap + legendW;
        rx = k.cx - total / 2 + R; ry = k.cy;
        lx = rx + R + gap; ly = k.cy - 70 * u;
      } else {
        rx = k.cx; ry = k.cy - (k.isPortrait ? 170 : 150) * u;
        lx = k.cx - legendW / 2; ly = ry + R + (k.isPortrait ? 150 : 110) * u;
      }

      g.save();
      g.translate(rx, ry); g.scale(1 - exitP * 0.03, 1 - exitP * 0.03); g.translate(-rx, -ry);
      g.globalAlpha = fade;
      const a0 = -Math.PI / 2;
      // track
      const trackP = ease.inOutCubic(m.seg(t, 0.1, 0.7));
      if (trackP > 0) {
        g.beginPath(); g.arc(rx, ry, R, a0, a0 + Math.PI * 2 * trackP);
        g.strokeStyle = C.mix(c.bg, c.fg, k.isDark ? 0.1 : 0.09); g.lineWidth = sw; g.lineCap = 'butt'; g.stroke();
      }
      // fill
      const fp = fillE(m.seg(t, 0.7, 1.9));
      const ang = Math.PI * 2 * pct * fp;
      // ticks
      const tr0 = R + sw / 2 + dia * 0.045, tr1 = tr0 + dia * 0.03;
      for (let i = 0; i < TICKS; i++) {
        const a = (i / TICKS) * Math.PI * 2;
        const ta = m.seg(trackP * TICKS - i, 0, 4);
        if (ta <= 0) continue;
        const lit = a <= ang + 1e-6 && fp > 0;
        const major = i % 6 === 0;
        const ca = Math.cos(a0 + a), sa = Math.sin(a0 + a);
        const r1 = major ? tr1 + dia * 0.012 : tr1;
        k.draw.line(g, rx + ca * tr0, ry + sa * tr0, rx + ca * r1, ry + sa * r1,
          lit ? C.alpha(c.accent, 0.9) : C.alpha(c.fg, k.isDark ? 0.16 : 0.18), major ? 2 : 1.4, 'butt');
      }
      if (fp > 0) {
        g.save();
        if (k.isDark) { g.shadowColor = C.alpha(c.accent, 0.5); g.shadowBlur = 30 * u; }
        g.beginPath(); g.arc(rx, ry, R, a0, a0 + Math.max(ang, 0.0001));
        g.strokeStyle = c.accent; g.lineWidth = sw; g.lineCap = 'round'; g.stroke();
        g.restore();
        // cap bloom on landing
        const land = m.seg(t, 2.45, 0.6);
        const pulse = Math.sin(Math.PI * land);
        if (pulse > 0) {
          const ex = rx + Math.cos(a0 + ang) * R, ey = ry + Math.sin(a0 + ang) * R;
          if (k.isDark) k.draw.glow(g, ex, ey, sw * (1.2 + 1.2 * land), c.accent, 0.6 * pulse);
          else { g.save(); g.globalAlpha *= pulse * 0.6; k.draw.circle(g, ex, ey, sw * (0.5 + 0.5 * land), null, c.accent, 2); g.restore(); }
        }
      }
      g.restore();

      // centre number
      const nIn = ease.outExpo(m.seg(t, 0.55, 0.6)) * fade;
      if (nIn > 0) {
        const v = st.value * fp;
        const str = fmt(fp >= 0.9999 ? st.value : v, dec) + (st.suffix || '');
        const o = { size: (dia * 0.22) / u, weight: 640, tracking: -0.04 };
        o.size = k.text.fit(fmt(st.value, dec) + (st.suffix || ''), o, (R - sw) * 1.6);
        k.text.draw(g, str, rx, ry - 12 * u + (1 - nIn) * 16 * u, { ...o, align: 'center', baseline: 'middle', alpha: nIn });
        const L = k.text.layout('0', o);
        const la = ease.outExpo(m.seg(t, 1.0, 0.6)) * fade;
        const lo = { role: 'text', size: 30, weight: 480 };
        const ls = k.text.fit(st.label, lo, (R - sw) * 1.55, 22);
        k.text.draw(g, st.label, rx, ry - 12 * u + L.cap / 2 + 26 * u + (1 - la) * 10 * u, { ...lo, size: ls, color: c.muted, align: 'center', baseline: 'top', alpha: la });
      }

      // legend
      const rows = [
        { sw: c.accent, label: st.label, val: fmt(st.value, dec) + '%' },
        { sw: C.mix(c.bg, c.fg, k.isDark ? 0.32 : 0.25), label: p.remainderLabel, val: fmt(rem, dec) + '%' },
      ];
      const rowH = 84 * u;
      const hd = ease.outExpo(m.seg(t, 2.25, 0.7)) * fade;
      if (hd > 0) {
        k.text.draw(g, 'Breakdown', lx, ly - 30 * u + (1 - hd) * 16 * u, { role: 'mono', size: 24, weight: 500, tracking: 0.08, color: c.muted, baseline: 'bottom', alpha: hd });
      }
      rows.forEach((r, i) => {
        const a = ease.outExpo(m.seg(t, 2.35 + i * 0.08, 0.7)) * fade;
        if (a <= 0) return;
        const y = ly + i * rowH + rowH / 2;
        const dx = (1 - a) * 16 * u;
        g.save(); g.globalAlpha = a;
        k.draw.line(g, lx, ly + i * rowH, lx + legendW * a, ly + i * rowH, C.alpha(c.fg, k.isDark ? 0.1 : 0.12), 1, 'butt');
        k.draw.rrect(g, lx + dx, y - 9 * u, 18 * u, 18 * u, 5 * u, r.sw);
        g.restore();
        const lo = { role: 'text', size: 34, weight: i === 0 ? 560 : 460 };
        const ls = k.text.fit(r.label, lo, legendW - 200 * u, 22);
        k.text.draw(g, r.label, lx + 36 * u + dx, y, { ...lo, size: ls, color: i === 0 ? c.fg : c.muted, baseline: 'middle', alpha: a });
        k.text.draw(g, r.val, lx + legendW + dx, y, { role: 'mono', size: 30, weight: 500, color: i === 0 ? c.fg : c.muted, align: 'right', baseline: 'middle', alpha: a });
      });
      if (hd > 0) {
        g.save(); g.globalAlpha = hd;
        k.draw.line(g, lx, ly + 2 * rowH, lx + legendW * hd, ly + 2 * rowH, C.alpha(c.fg, k.isDark ? 0.1 : 0.12), 1, 'butt');
        g.restore();
      }
    },
  };
}
