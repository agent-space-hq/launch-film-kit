// A bar-chart race on a fixed zero-based scale. Rows glide between ranks with a
// continuous (soft) rank so swaps never jump, values count, and the brand row climbs
// from last place to #1, where its rank badge lights up.
export const meta = {
  id: 'data.rank-race',
  name: 'Rank Race',
  category: 'data',
  duration: 5.6,
  summary: 'Horizontal bars on a fixed zero baseline animate through sample periods, rows glide past each other as values change and the brand climbs to #1 with a lit badge; holds, then bars retract over the last 0.45 s.',
  bestFor: ['competitive', 'momentum', 'leaderboard'],
  slots: ['chartTitle'],
  params: {
    title: { default: null, label: 'Chart title (defaults to copy.chartTitle)' },
    unit: { default: 'Sample data · weekly active teams, thousands', label: 'Unit / source line' },
    periods: { default: ['Q1', 'Q2', 'Q3', 'Q4'], label: 'Period labels (one per keyframe)' },
    rows: {
      default: [
        { label: 'Legacy suite', values: [62, 64, 63, 61] },
        { label: 'Spreadsheets', values: [55, 52, 49, 45] },
        { label: 'Chat + docs', values: [41, 46, 50, 52] },
        { label: 'In-house tool', values: [30, 31, 33, 34] },
        { label: null, values: [18, 38, 57, 74], brand: true },
      ],
      label: 'SAMPLE DATA: [{label, values[], brand}] (label null = brand name)',
    },
  },
  sfx: [{ t: 0.3, type: 'whoosh', dur: 0.5, gain: 0.3 }, { t: 1.3, type: 'tick', gain: 0.5 }, { t: 2.2, type: 'tick', gain: 0.5 }, { t: 3.1, type: 'tick', gain: 0.5 }, { t: 3.95, type: 'shimmer', gain: 0.6 }],
  prompt: `Bar-chart race, 5.6 s, horizontal bars on a fixed zero-based scale with nice-number gridlines. Title (64 px display) and unit line rise with outExpo over 700 ms; a period chip at top right rolls between labels. Bars grow to period-1 values (outQuint, 800 ms, 60 ms stagger). From 1.2 s each period change takes 900 ms with inOutCubic; values interpolate and each row's slot is a soft rank (sum of smoothstep comparisons against every other row) so rows glide past each other. Row height ~11% of plot height, bars 42% of the row with 6 px rounded ends; rank numbers in a fixed left gutter, labels above bars (non-brand labels dim mid-swap), live values at bar ends. Brand bar is accent, others neutral. When the brand reaches the top (~3.9 s) its rank badge fills from the centre with accent and pulses. Hold, then bars retract inCubic over 400 ms.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function niceStep(max, ticks) {
  const raw = max / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
function barPath(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
  g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r); g.lineTo(x, y + h);
  g.closePath();
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const rows = p.rows.map((r) => ({ ...r, label: r.label || k.brand.name || 'Us' }));
  const n = rows.length;
  const K = p.periods.length;
  const title = p.title || k.copy('chartTitle', 'The team favourite, quarter by quarter');
  const maxV = Math.max(...rows.flatMap((r) => r.values));
  const step = niceStep(maxV, 4);
  const top = Math.ceil(maxV / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const D = p.duration ?? meta.duration;
  const RACE0 = 1.2, SEGD = 0.9;
  const raceEnd = RACE0 + (K - 1) * SEGD;
  const eps = top * 0.025;

  // continuous period position at time t
  const periodAt = (t) => {
    if (t <= RACE0) return 0;
    const x = (t - RACE0) / SEGD;
    const i = Math.min(K - 1, Math.floor(x));
    if (i >= K - 1) return K - 1;
    return i + ease.inOutCubic(x - i);
  };
  const valAt = (r, pp) => {
    const i = Math.min(K - 2, Math.floor(pp));
    if (K === 1) return r.values[0];
    return m.lerp(r.values[i], r.values[i + 1], pp - i);
  };

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const S = k.safe;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.4));
      const fade = 1 - exitP;
      const wide = k.isWide;

      // title
      const tIn = ease.outExpo(m.seg(t, 0.05, 0.7));
      const tSize = k.pick({ wide: 64, square: 56, tall: 60 });
      const tOpt = { size: tSize, weight: 620, tracking: -0.03 };
      const tLines = k.text.balance(title, tOpt, S.w * (wide ? 0.62 : 0.78));
      const tLH = tSize * 1.08 * u;
      const ty = S.y + 10 * u;
      tLines.forEach((ln, i) => k.text.draw(g, ln, S.x, ty + i * tLH + (1 - tIn) * 24 * u, { ...tOpt, baseline: 'top', alpha: tIn * fade, qaGroup: 'title' }));
      const unitY = ty + tLines.length * tLH + 6 * u;
      const uIn = ease.outExpo(m.seg(t, 0.15, 0.7));
      k.text.draw(g, p.unit, S.x, unitY + (1 - uIn) * 20 * u, { role: 'text', size: 26, weight: 460, color: c.muted, baseline: 'top', alpha: uIn * fade });

      // period chip (cross-fades between labels)
      const pp = periodAt(t);
      const pa = ease.outExpo(m.seg(t, 0.4, 0.6)) * fade;
      if (pa > 0) {
        const ch = 64 * u, cw = 150 * u;
        const cx = S.x + S.w - cw, cy = ty;
        g.save(); g.globalAlpha = pa;
        k.draw.rrect(g, cx, cy, cw, ch, ch / 2, C.alpha(c.fg, k.isDark ? 0.06 : 0.05), C.alpha(c.fg, k.isDark ? 0.14 : 0.12), 1);
        g.beginPath(); g.rect(cx, cy, cw, ch); g.clip();
        const near = Math.floor(pp);
        // rolling label
        for (let i = Math.max(0, near); i <= Math.min(K - 1, near + 1); i++) {
          const off = (i - pp) * ch * 0.9;
          const a = 1 - Math.min(1, Math.abs(i - pp) * 1.6);
          if (a <= 0) continue;
          k.text.draw(g, p.periods[i], cx + cw / 2, cy + ch / 2 + off, { role: 'mono', size: 30, weight: 500, color: c.fg, align: 'center', baseline: 'middle', alpha: a, qaGroup: 'period' });
        }
        g.restore();
      }

      // plot geometry
      const gutter = 70 * u;
      const X0 = S.x + gutter, X1 = S.x + S.w - 130 * u;
      const Y0 = unitY + (wide ? 110 : 150) * u, Y1 = S.y + S.h - 50 * u;
      const rowH = Math.min((Y1 - Y0) / n, (wide ? 170 : 230) * u);
      const plotH = rowH * n;
      const py0 = Y0 + ((Y1 - Y0) - plotH) / 2;
      const gIn = ease.inOutCubic(m.seg(t, 0.3, 0.6));
      ticks.forEach((v, i) => {
        const x = X0 + (v / top) * (X1 - X0);
        const lp = m.clamp(gIn * 1.4 - i * 0.08);
        g.save(); g.globalAlpha = fade;
        k.draw.line(g, x, py0 + plotH - plotH * lp, x, py0 + plotH, i === 0 ? C.alpha(c.fg, 0.35) : C.alpha(c.fg, k.isDark ? 0.07 : 0.08), i === 0 ? 2 : 1, 'butt');
        k.text.draw(g, fmt(v), x, py0 + plotH + 16 * u, { role: 'mono', size: 22, color: c.muted, align: i === 0 ? 'left' : 'center', baseline: 'top', alpha: m.seg(lp, 0.3, 0.5) });
        g.restore();
      });

      // values + soft ranks
      const vals = rows.map((r) => valAt(r, pp));
      const ranks = vals.map((v, i) => {
        let s = 0;
        vals.forEach((w, j) => { if (j !== i) s += m.smoothstep(-eps, eps, w - v); });
        return s;
      });
      const brandI = rows.findIndex((r) => r.brand);
      const neutral = C.mix(c.surface, c.fg, k.isDark ? 0.2 : 0.18);
      const atTop = brandI >= 0 ? m.smoothstep(0.3, 0, ranks[brandI]) * m.seg(t, raceEnd - 0.3, 0.3) : 0;

      // fixed rank gutter
      for (let r = 0; r < n; r++) {
        const y = py0 + rowH * (r + 0.5) + rowH * 0.12;
        const a = ease.outExpo(m.seg(t, 0.3 + r * 0.06, 0.6)) * fade;
        if (a <= 0) continue;
        const lit = r === 0 ? atTop : 0;
        const pulse = r === 0 ? Math.sin(Math.PI * m.seg(t, raceEnd, 0.6)) : 0;
        const br = 24 * u;
        g.save(); g.globalAlpha = a;
        if (lit > 0 && k.isDark) k.draw.glow(g, S.x + br, y, br * (2.4 + pulse), c.accent, 0.45 * lit);
        k.draw.circle(g, S.x + br, y, br * (1 + 0.12 * pulse), null, C.alpha(lit > 0.5 ? c.accent : c.fg, k.isDark ? 0.25 : 0.22), 1.2);
        // badge fills from the centre outward so the digit always sits on a solid colour
        if (lit > 0) k.draw.circle(g, S.x + br, y, br * (1 + 0.12 * pulse) * ease.outCubic(lit), c.accent);
        g.restore();
        const onLit = ease.outCubic(lit) > 0.75 ? k.color.onColor(c.accent) : c.muted;
        k.text.draw(g, String(r + 1), S.x + br, y, { role: 'mono', size: 24, weight: 600, color: onLit, align: 'center', baseline: 'middle', alpha: a });
      }

      rows.forEach((r, i) => {
        const isB = i === brandI;
        const grow = ease.outQuint(m.seg(t, 0.35 + i * 0.06, 0.8)) * (1 - ease.inCubic(m.seg(t, D - 0.45 + (n - 1 - i) * 0.015, 0.38)));
        const v = vals[i] * grow;
        const slotY = py0 + rowH * ranks[i];
        const bh = rowH * 0.42;
        const by = slotY + rowH * 0.5 - bh / 2 + rowH * 0.12;
        const bw = (v / top) * (X1 - X0);
        const la = ease.outExpo(m.seg(t, 0.35 + i * 0.06, 0.6)) * fade;
        const off = Math.abs(ranks[i] - Math.round(ranks[i]));
        const moving = off > 0.02; // rows passing each other
        const lblA = isB ? la : la * (1 - 0.5 * m.smoothstep(0.02, 0.12, off)); // non-brand labels step back mid-swap
        // label above bar
        k.text.draw(g, r.label, X0, by - 12 * u, { role: 'text', size: 28, weight: isB ? 620 : 480, color: isB ? c.fg : c.muted, baseline: 'bottom', alpha: lblA, qaGroup: 'row' + i, qaOverlap: moving });
        if (bw > 0.5) {
          g.save();
          if (isB && k.isDark) { g.shadowColor = C.alpha(c.accent, 0.45); g.shadowBlur = 28 * u; }
          if (isB && !k.isDark) { g.shadowColor = C.alpha(c.accent, 0.3); g.shadowBlur = 22 * u; g.shadowOffsetY = 6 * u; }
          barPath(g, X0, by, bw, bh, 6 * u);
          g.fillStyle = isB ? c.accent : neutral; g.fill();
          g.restore();
        }
        if (la > 0) {
          k.text.draw(g, fmt(v), X0 + bw + 16 * u, by + bh / 2, { role: 'display', size: 34, weight: isB ? 640 : 560, tracking: -0.02, color: isB ? (k.isDark ? c.fg : C.shade(c.accent, -0.1)) : c.fg, baseline: 'middle', alpha: la, qaGroup: 'row' + i, qaOverlap: moving });
        }
      });
    },
  };
}
