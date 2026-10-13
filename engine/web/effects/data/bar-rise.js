// A titled bar chart builds on an honest zero baseline: gridlines draw, bars grow
// with a staggered outQuint while their values count, then the brand's bar takes the
// accent and the others step back. Vertical bars on wide/4:5, horizontal on 9:16.
export const meta = {
  id: 'data.bar-rise',
  name: 'Bar Rise',
  category: 'data',
  duration: 5,
  summary: 'Bars grow from a zero baseline with staggered counts; the brand bar wins in accent while the rest dim, holds, then bars retract in the last 0.45 s.',
  bestFor: ['comparison', 'benchmark', 'proof'],
  slots: ['chartTitle'],
  params: {
    title: { default: null, label: 'Chart title (defaults to copy.chartTitle)' },
    unit: { default: 'Sample data · releases per team, per month', label: 'Unit / source line' },
    bars: {
      default: [
        { label: 'Spreadsheets', value: 3.1 },
        { label: 'Chat + docs', value: 4.4 },
        { label: 'Legacy suite', value: 5.2 },
        { label: 'In-house tool', value: 6.0 },
        { label: null, value: 14.6, brand: true },
      ],
      label: 'SAMPLE DATA: [{label, value, brand}] (label null = brand name)',
    },
    decimals: { default: 1, min: 0, max: 2, label: 'Value decimals' },
    stagger: { default: 0.08, min: 0.04, max: 0.12, label: 'Bar stagger (s)' },
  },
  sfx: [{ t: 0.75, type: 'type', n: 10, dur: 0.9, gain: 0.3 }, { t: 2.35, type: 'tick', gain: 0.7 }],
  prompt: `Bar chart that builds in 5 s. A left-aligned title (64 px display, -0.03 em) and a muted unit line rise 24 px with outExpo over 700 ms. Gridlines draw left to right from 300 ms (inOutCubic, 600 ms) with mono tick labels on a nice-number scale that starts at zero. From 700 ms each bar grows from the baseline with outQuint over 1100 ms, staggered 80 ms; the brand bar goes last and slowest (1400 ms). Values count with bar height, 14 px above each bar end. Bars fill ~56% of their slot with 6 px rounded data ends and square baseline ends. At 2.4 s the brand bar turns accent with a glow (dark) or soft shadow (light) while the rest dim to ~50%; a chip states its ratio to the runner-up. Hold to 4.5 s, then bars retract inCubic over 450 ms as text fades. On 9:16 bars run horizontally.`,
};

function fmt(v, d) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function niceStep(max, ticks) {
  const raw = max / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
// Rounded only on the data end: dir 'up' (vertical) or 'right' (horizontal).
function barPath(g, x, y, w, h, r, dir) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  if (dir === 'up') {
    g.moveTo(x, y + h); g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r);
    g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r); g.lineTo(x + w, y + h);
  } else {
    g.moveTo(x, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
    g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r); g.lineTo(x, y + h);
  }
  g.closePath();
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const bars = p.bars.map((b) => ({ ...b, label: b.label || k.brand.name || 'Us' }));
  const n = bars.length;
  const title = p.title || k.copy('chartTitle', 'Teams ship more, every month');
  const maxV = Math.max(...bars.map((b) => b.value));
  const step = niceStep(maxV, 4);
  const top = Math.ceil(maxV / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const tickDec = step < 1 ? 1 : 0;
  const bi = Math.max(0, bars.findIndex((b) => b.brand));
  const others = bars.filter((_, i) => i !== bi).map((b) => b.value);
  const runner = others.length ? Math.max(...others) : 0;
  const ratio = runner > 0 ? bars[bi].value / runner : 0;
  const D = p.duration ?? meta.duration;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const tall = k.isPortrait && k.aspect < 0.7;
      const S = k.safe;
      const exitP = ease.inCubic(m.seg(t, D - 0.5, 0.45));
      const fadeOut = 1 - exitP;

      // ---- title block
      const tIn = ease.outExpo(m.seg(t, 0.05, 0.7));
      const tSize = k.pick({ wide: 64, square: 56, tall: 60 });
      const tOpt = { size: tSize, weight: 620, tracking: -0.03 };
      const tLines = k.text.balance(title, tOpt, S.w * (tall ? 1 : 0.62));
      const tLH = tSize * 1.08 * u;
      const ty = S.y + 10 * u;
      tLines.forEach((ln, i) => {
        k.text.draw(g, ln, S.x, ty + i * tLH + (1 - tIn) * 24 * u, { ...tOpt, baseline: 'top', alpha: tIn * fadeOut, qaGroup: 'title' });
      });
      const unitY = ty + tLines.length * tLH + 6 * u;
      const uIn = ease.outExpo(m.seg(t, 0.15, 0.7));
      k.text.draw(g, p.unit, S.x, unitY + (1 - uIn) * 20 * u, { role: 'text', size: 26, weight: 460, color: c.muted, baseline: 'top', alpha: uIn * fadeOut });

      // ---- chart frame
      const tickW = 70 * u;
      const chartTop = unitY + 110 * u;
      const labelBand = tall ? 0 : 70 * u;
      const chartBottom = S.y + S.h - labelBand - 10 * u;
      const gIn = ease.inOutCubic(m.seg(t, 0.3, 0.6));
      const lineCol = C.alpha(c.fg, k.isDark ? 0.09 : 0.1);
      const baseCol = C.alpha(c.fg, k.isDark ? 0.35 : 0.4);

      let X0, X1, Y0, Y1; // plot rect
      if (!tall) { X0 = S.x + tickW; X1 = S.x + S.w; Y0 = chartTop; Y1 = chartBottom; }
      else {
        // horizontal: labels above each bar, ticks along the bottom
        X0 = S.x; X1 = S.x + S.w - 100 * u; Y0 = chartTop; Y1 = S.y + S.h - 60 * u;
      }

      // gridlines + tick labels
      ticks.forEach((v, i) => {
        const f = v / top;
        const a = (i === 0 ? 1 : 1) * fadeOut;
        const lp = m.clamp(gIn * 1.4 - i * 0.08);
        g.save();
        g.globalAlpha = a;
        if (!tall) {
          const y = Y1 - f * (Y1 - Y0);
          k.draw.line(g, X0, y, X0 + (X1 - X0) * lp, y, i === 0 ? baseCol : lineCol, i === 0 ? 2 : 1, 'butt');
          k.text.draw(g, fmt(v, tickDec), X0 - 18 * u, y, { role: 'mono', size: 22, color: c.muted, align: 'right', baseline: 'middle', alpha: m.seg(lp, 0.3, 0.5) });
        } else {
          const x = X0 + f * (X1 - X0);
          k.draw.line(g, x, Y1 - (Y1 - Y0) * lp, x, Y1, i === 0 ? baseCol : lineCol, i === 0 ? 2 : 1, 'butt');
          k.text.draw(g, fmt(v, tickDec), x, Y1 + 18 * u, { role: 'mono', size: 22, color: c.muted, align: i === 0 ? 'left' : i === ticks.length - 1 ? 'right' : 'center', baseline: 'top', alpha: m.seg(lp, 0.3, 0.5) });
        }
        g.restore();
      });

      // emphasis phase
      const emph = ease.inOutCubic(m.seg(t, 2.4, 0.6));
      const neutral = C.mix(c.surface, c.fg, k.isDark ? 0.22 : 0.2);

      bars.forEach((b, i) => {
        const isB = i === bi;
        const t0 = 0.7 + i * p.stagger + (isB ? 0.12 : 0);
        const grow = ease.outQuint(m.seg(t, t0, isB ? 1.4 : 1.1)) * (1 - ease.inCubic(m.seg(t, D - 0.5 + (n - 1 - i) * 0.02, 0.4)));
        const f = (b.value / top) * grow;
        const dim = isB ? 1 : 1 - (k.isDark ? 0.5 : 0.4) * emph;
        const fill = isB ? C.mix(neutral, c.accent, emph) : neutral;
        let bx, by, bw, bh, vx, vy, valOpt;
        const valSize = isB ? m.lerp(34, 46, emph) : 32;
        if (!tall) {
          const slot = (X1 - X0) / n;
          bw = Math.min(slot * 0.56, 190 * u);
          bx = X0 + slot * (i + 0.5) - bw / 2;
          bh = f * (Y1 - Y0);
          by = Y1 - bh;
          vx = bx + bw / 2; vy = by - 14 * u;
          valOpt = { align: 'center', baseline: 'bottom' };
          // category label
          const la = ease.outExpo(m.seg(t, t0 - 0.1, 0.6)) * fadeOut;
          const lo = { role: 'text', size: k.pick({ wide: 26, square: 24 }), weight: isB ? 600 : 470 };
          const ls = k.text.fit(b.label, lo, slot * 0.94, 22);
          k.text.draw(g, b.label, vx, Y1 + 26 * u, { ...lo, size: ls, color: isB ? C.mix(c.muted, c.fg, emph) : c.muted, align: 'center', baseline: 'top', alpha: la });
        } else {
          const slot = (Y1 - Y0) / n;
          bh = Math.min(slot * 0.42, 84 * u);
          by = Y0 + slot * (i + 0.5) - bh / 2 + 18 * u;
          bw = f * (X1 - X0);
          bx = X0;
          vx = bx + bw + 14 * u; vy = by + bh / 2;
          valOpt = { align: 'left', baseline: 'middle' };
          const la = ease.outExpo(m.seg(t, t0 - 0.1, 0.6)) * fadeOut;
          k.text.draw(g, b.label, X0, by - 14 * u, { role: 'text', size: 26, weight: isB ? 600 : 470, color: isB ? C.mix(c.muted, c.fg, emph) : c.muted, baseline: 'bottom', alpha: la });
        }
        if (f > 0.0005) {
          g.save();
          if (isB && emph > 0) {
            if (k.isDark) {
              g.shadowColor = C.alpha(c.accent, 0.55 * emph); g.shadowBlur = 40 * u;
            } else {
              g.shadowColor = C.alpha(c.accent, 0.35 * emph); g.shadowBlur = 30 * u; g.shadowOffsetY = 10 * u;
            }
          }
          g.globalAlpha = dim;
          barPath(g, bx, by, bw, bh, 6 * u, tall ? 'right' : 'up');
          g.fillStyle = fill; g.fill();
          g.restore();
        }
        // value
        const va = m.seg(grow, 0.05, 0.25) * fadeOut;
        if (va > 0) {
          k.text.draw(g, fmt(b.value * (grow > 0.999 ? 1 : grow), p.decimals), vx, vy, {
            role: 'display', size: valSize, weight: isB ? 640 : 560, tracking: -0.02,
            color: isB ? C.mix(c.fg, k.isDark ? c.fg : c.accent, emph) : C.mix(c.fg, c.muted, emph), ...valOpt, alpha: va,
          });
        }
      });

      // ratio chip (derived from the same sample data)
      if (ratio > 1) {
        const ca = ease.outExpo(m.seg(t, 2.65, 0.7)) * fadeOut;
        if (ca > 0) {
          const label = `${fmt(ratio, 1)}× the runner-up`;
          const cx = tall ? S.x + S.w - 10 * u : S.x + S.w;
          const cy = tall ? unitY + 62 * u : ty + 30 * u;
          const L = k.text.layout(label, { role: 'text', size: 26, weight: 560 });
          const ph = 52 * u, pw = L.width + 60 * u;
          g.save();
          g.globalAlpha = ca;
          g.translate(0, (1 - ca) * 14 * u);
          k.draw.rrect(g, cx - pw, cy - ph / 2, pw, ph, ph / 2, C.alpha(c.accent, k.isDark ? 0.16 : 0.1), C.alpha(c.accent, 0.5), 1);
          k.draw.circle(g, cx - pw + 26 * u, cy, 6 * u, c.accent);
          k.text.draw(g, label, cx - pw + 42 * u, cy, { role: 'text', size: 26, weight: 560, color: k.isDark ? c.fg : C.shade(c.accent, -0.12), baseline: 'middle' });
          g.restore();
        }
      }
    },
  };
}
