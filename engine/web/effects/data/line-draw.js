// A growth curve draws left to right with a glowing lead dot that carries a running
// value. The area beneath fades in behind it, and when the line lands a milestone card
// pins to the final point with the real number from copy.stats.
export const meta = {
  id: 'data.line-draw',
  name: 'Line Draw',
  category: 'data',
  duration: 5.4,
  summary: 'A smooth growth line draws across a zero-based chart with a glowing lead dot; area fill fades in beneath and a milestone card pins at the end, holds, then everything fades down in the last 0.45 s.',
  bestFor: ['growth', 'traction', 'momentum'],
  slots: ['stats', 'chartTitle'],
  params: {
    title: { default: null, label: 'Chart title (defaults to copy.chartTitle)' },
    stat: { default: 0, min: 0, max: 2, label: 'Which copy.stats entry is the end value' },
    unit: { default: 'Sample trajectory · last 12 months', label: 'Unit / source line' },
    shape: {
      default: [0.06, 0.08, 0.1, 0.13, 0.17, 0.21, 0.27, 0.34, 0.43, 0.55, 0.73, 1],
      label: 'SAMPLE DATA: curve shape as fractions of the end value (one per period)',
    },
    periods: { default: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], label: 'X-axis labels' },
  },
  sfx: [{ t: 0.6, type: 'swell', dur: 2.2, gain: 0.45 }, { t: 2.95, type: 'tick', gain: 0.8 }],
  prompt: `Growth line, 5.4 s. Title (64 px display) and muted unit line rise 24 px with outExpo over 700 ms. Gridlines on a zero-based nice-number scale draw in from 300 ms (inOutCubic, 600 ms); period labels sit under the baseline in 22 px mono. From 600 ms a Catmull-Rom smoothed accent line (3.5 px) reveals left to right by x over 2300 ms with inOutCubic; a lead dot (glow on dark, white ring on light) rides the tip carrying a compact running value. An accent area gradient (28% to 0%) fills beneath the drawn part. At 3.0 s the running value hands off to a milestone card (surface, hairline border, soft shadow on light) pinned up-left of the end point with a dashed drop line: the copy.stats number in 64 px display plus its label. Hold to 4.95 s, then fade and sink 20 px over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function compact(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return fmt(v / 1e6, v / 1e6 < 10 ? 1 : 0) + 'M';
  if (a >= 1e4) return fmt(v / 1e3, 0) + 'K';
  if (a >= 1e3) return fmt(v / 1e3, 1) + 'K';
  return v === 0 ? '0' : fmt(v, a < 10 ? 1 : 0);
}
function niceStep(max, ticks) {
  const raw = max / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
// Catmull-Rom through points -> dense polyline.
function smooth(pts, seg = 16) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// Card fill that casts its own soft shadow. (k.draw.shadow paints an opaque black
// shape under the card, which shows through whenever the card is faded.)
function softCard(k, g, x, y, w, h, r, fill, color, blur, oy) {
  g.save();
  g.shadowColor = color; g.shadowBlur = blur * k.u; g.shadowOffsetY = oy * k.u;
  k.draw.rrect(g, x, y, w, h, r, fill);
  g.restore();
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const stats = k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'customers' }];
  const st = stats[Math.min(p.stat, stats.length - 1)];
  const endV = st.value;
  const dec = st.decimals || 0;
  const finalStr = fmt(endV, dec) + (st.suffix || '');
  const title = p.title || k.copy('chartTitle', 'Growth that compounds');
  const shape = p.shape;
  const N = shape.length;
  const step = niceStep(endV, 4);
  const top = Math.ceil((endV * 1.08) / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const D = p.duration ?? meta.duration;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const S = k.safe;
      const tall = k.isPortrait && k.aspect < 0.7;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      g.save();
      g.translate(0, exitP * 20 * u);

      // ---- title
      const tIn = ease.outExpo(m.seg(t, 0.05, 0.7));
      const tSize = k.pick({ wide: 64, square: 56, tall: 60 });
      const tOpt = { size: tSize, weight: 620, tracking: -0.03 };
      const tLines = k.text.balance(title, tOpt, S.w * (tall ? 1 : 0.62));
      const tLH = tSize * 1.08 * u;
      const ty = S.y + 10 * u;
      tLines.forEach((ln, i) => k.text.draw(g, ln, S.x, ty + i * tLH + (1 - tIn) * 24 * u, { ...tOpt, baseline: 'top', alpha: tIn * fade, qaGroup: 'title' }));
      const unitY = ty + tLines.length * tLH + 6 * u;
      const uIn = ease.outExpo(m.seg(t, 0.15, 0.7));
      k.text.draw(g, p.unit, S.x, unitY + (1 - uIn) * 20 * u, { role: 'text', size: 26, weight: 460, color: c.muted, baseline: 'top', alpha: uIn * fade });

      // ---- plot rect
      const tickW = 84 * u;
      const X0 = S.x + tickW, X1 = S.x + S.w - (tall ? 30 : 20) * u;
      const Y0 = unitY + (tall ? 260 : 120) * u, Y1 = S.y + S.h - 64 * u;
      const gIn = ease.inOutCubic(m.seg(t, 0.3, 0.6));
      const lineCol = C.alpha(c.fg, k.isDark ? 0.08 : 0.09);
      ticks.forEach((v, i) => {
        const y = Y1 - (v / top) * (Y1 - Y0);
        const lp = m.clamp(gIn * 1.4 - i * 0.08);
        g.save(); g.globalAlpha = fade;
        k.draw.line(g, X0, y, X0 + (X1 - X0) * lp, y, i === 0 ? C.alpha(c.fg, 0.35) : lineCol, i === 0 ? 2 : 1, 'butt');
        k.text.draw(g, compact(v), X0 - 18 * u, y, { role: 'mono', size: 22, color: c.muted, align: 'right', baseline: 'middle', alpha: m.seg(lp, 0.3, 0.5) });
        g.restore();
      });
      const xs = (i) => X0 + ((X1 - X0) * i) / (N - 1);
      const labEvery = tall ? 2 : 1;
      p.periods.slice(0, N).forEach((lab, i) => {
        if ((N - 1 - i) % labEvery) return;
        const a = ease.outCubic(m.seg(t, 0.45 + i * 0.03, 0.5)) * fade;
        k.text.draw(g, lab, xs(i), Y1 + 22 * u, { role: 'mono', size: 22, color: c.muted, align: i === 0 ? 'left' : i === N - 1 ? 'right' : 'center', baseline: 'top', alpha: a });
      });

      // ---- line
      const pts = shape.map((f, i) => [xs(i), Y1 - ((f * endV) / top) * (Y1 - Y0)]);
      const dense = smooth(pts);
      const prog = ease.inOutCubic(m.seg(t, 0.6, 2.3));
      const tipX = X0 + (X1 - X0) * prog;
      // find tip point by x
      let tip = dense[0], tipI = 0;
      for (let i = 1; i < dense.length; i++) {
        if (dense[i][0] >= tipX) {
          const a = dense[i - 1], b = dense[i];
          const f = (tipX - a[0]) / Math.max(1e-6, b[0] - a[0]);
          tip = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; tipI = i; break;
        }
        tip = dense[i]; tipI = i + 1;
      }
      const drawn = dense.slice(0, tipI); drawn.push(tip);
      if (prog > 0) {
        // area
        const areaA = ease.outCubic(m.seg(t, 0.9, 1.2)) * fade;
        g.save();
        g.beginPath(); g.moveTo(drawn[0][0], Y1);
        drawn.forEach(([x, y]) => g.lineTo(x, y));
        g.lineTo(tip[0], Y1); g.closePath();
        const grd = g.createLinearGradient(0, Y0, 0, Y1);
        grd.addColorStop(0, C.alpha(c.accent, (k.isDark ? 0.3 : 0.22) * areaA));
        grd.addColorStop(1, C.alpha(c.accent, 0));
        g.fillStyle = grd; g.fill();
        g.restore();
        // stroke
        g.save();
        g.globalAlpha = fade;
        if (k.isDark) { g.shadowColor = C.alpha(c.accent, 0.6); g.shadowBlur = 18 * u; }
        g.beginPath(); g.moveTo(drawn[0][0], drawn[0][1]);
        drawn.forEach(([x, y]) => g.lineTo(x, y));
        g.strokeStyle = c.accent; g.lineWidth = 3.5 * u; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
        g.restore();
        // data points that have been passed
        pts.forEach(([x, y], i) => {
          if (x > tipX + 0.5 || i === N - 1) return;
          const a = m.seg(tipX - x, 0, 40 * u) * fade;
          k.draw.circle(g, x, y, 4.5 * u, C.alpha(c.bg, a), C.alpha(c.accent, a), 2);
        });
      }
      // lead dot
      const dotA = m.seg(t, 0.55, 0.2) * fade;
      if (dotA > 0) {
        const land = m.seg(t, 2.9, 0.5);
        const pulse = Math.sin(Math.PI * land);
        if (k.isDark) k.draw.glow(g, tip[0], tip[1], (44 + 40 * pulse) * u, c.accent, 0.55 * dotA);
        else k.draw.circle(g, tip[0], tip[1], (16 + 10 * pulse) * u, C.alpha(c.accent, 0.14 * dotA));
        k.draw.circle(g, tip[0], tip[1], 9 * u, C.alpha(k.isDark ? c.fg : '#ffffff', dotA), C.alpha(c.accent, dotA), 3.5);
      }
      // running value riding the tip (hands off to the card)
      const runA = m.seg(t, 0.8, 0.3) * (1 - m.seg(t, 2.85, 0.2)) * fade;
      if (runA > 0) {
        const v = endV * ((tip[1] - Y1) / (pts[N - 1][1] - Y1));
        k.text.draw(g, compact(Math.max(0, v)), tip[0] - 14 * u, tip[1] - 30 * u, { role: 'mono', size: 26, weight: 500, color: c.fg, align: 'right', baseline: 'bottom', alpha: runA });
      }

      // ---- milestone card
      const cIn = ease.outExpo(m.seg(t, 3.0, 0.8));
      if (cIn > 0) {
        const end = pts[N - 1];
        const vOpt = { size: k.pick({ wide: 64, square: 58, tall: 60 }), weight: 640, tracking: -0.035 };
        const lOpt = { role: 'text', size: 28, weight: 480 };
        const VL = k.text.layout(finalStr, vOpt), LL = k.text.layout(st.label, lOpt);
        const pad = 26 * u;
        const cw = Math.max(VL.width, LL.width) + pad * 2, ch = VL.cap + 28 * u * 1.0 + 22 * u + pad * 2;
        const cx = end[0] - 30 * u - cw;
        const cy = Math.max(unitY + 50 * u, end[1] - 30 * u - ch);
        // dashed drop line from point to baseline
        g.save();
        g.globalAlpha = cIn * fade;
        g.setLineDash([5 * u, 6 * u]);
        k.draw.line(g, end[0], end[1] + 12 * u, end[0], end[1] + 12 * u + (Y1 - end[1] - 12 * u) * cIn, C.alpha(c.accent, 0.6), 1.5, 'butt');
        g.setLineDash([]);
        g.restore();
        g.save();
        g.globalAlpha = cIn * fade;
        g.translate(0, (1 - cIn) * 18 * u);
        softCard(k, g, cx, cy, cw, ch, 18 * u, k.isDark ? C.mix(c.surface, c.bg, 0.1) : c.surface, k.isDark ? 'rgba(0,0,0,0)' : 'rgba(20,30,60,0.14)', 40, 16);
        k.draw.rrect(g, cx, cy, cw, ch, 18 * u, null, C.alpha(c.fg, k.isDark ? 0.12 : 0.08), 1);
        k.draw.rrect(g, cx + pad, cy + pad, 28 * u, 5 * u, 2.5 * u, c.accent);
        k.text.draw(g, finalStr, cx + pad, cy + pad + 22 * u, { ...vOpt, baseline: 'top' });
        k.text.draw(g, st.label, cx + pad, cy + pad + 22 * u + VL.cap + 18 * u, { ...lOpt, color: c.muted, baseline: 'top' });
        g.restore();
      }
      g.restore();
    },
  };
}
