// Three metric tiles spring in with a short stagger. Each value counts up from
// copy.stats, a delta chip pops in, and a zero-based sparkline draws across the foot of
// the tile ending in a lit dot. Rows on wide, stacked on 4:5 and 9:16.
export const meta = {
  id: 'data.kpi-tiles',
  name: 'KPI Tiles',
  category: 'data',
  duration: 4.8,
  summary: 'Metric tiles spring in staggered; values count, delta chips pop and sparklines draw; holds, then tiles drop away in sequence over the last 0.5 s.',
  bestFor: ['dashboard', 'traction', 'proof'],
  slots: ['stats'],
  params: {
    deltas: { default: ['+18%', '+0.6x', '+0.03 pts'], label: 'SAMPLE DATA: delta chip text per tile' },
    period: { default: 'vs last quarter', label: 'Delta comparison label' },
    sparks: {
      default: [
        [22, 26, 31, 30, 38, 44, 49, 57, 63, 74, 86, 100],
        [40, 42, 47, 45, 52, 58, 61, 66, 72, 80, 91, 100],
        [96, 97, 96, 98, 99, 98, 99, 100, 99, 100, 100, 100],
      ],
      label: 'SAMPLE DATA: sparkline series per tile (plotted from zero)',
    },
    stagger: { default: 0.09, min: 0.04, max: 0.15, label: 'Tile stagger (s)' },
  },
  sfx: [{ t: 0.1, type: 'pop', gain: 0.5 }, { t: 0.19, type: 'pop', gain: 0.5 }, { t: 0.28, type: 'pop', gain: 0.5 }, { t: 0.6, type: 'type', n: 12, dur: 1.0, gain: 0.3 }],
  prompt: `KPI dashboard moment, 4.8 s. Three surface tiles (radius 28 px, hairline border, soft shadow on light, faint top sheen on dark) sit in a row on wide and stack on tall; each is about 30% of the frame wide on 16:9. Tiles enter with a spring (stiffness 220, damping 22) from 92% scale and 40 px lower, staggered 90 ms. Inside: a muted 28 px label top-left, the value in display type (up to 96 px, -0.04 em) counting with outExpo over 1200 ms, then a delta chip (small triangle plus text, accent3 tint) popping with outBack at +900 ms. A sparkline plotted from a zero baseline draws across the bottom third over 900 ms (inOutCubic) with a faint accent area and a lit end dot. Hold to 4.3 s, then each tile drops 30 px and fades with inCubic over 350 ms, staggered 60 ms.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
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
  const stats = (k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'customers' }]).slice(0, 3);
  const n = stats.length;
  const D = p.duration ?? meta.duration;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const S = k.safe;
      const row = k.isWide;
      const gap = 36 * u;
      let tw, th;
      if (row) { tw = (S.w - gap * (n - 1)) / n; th = Math.min(520 * u, tw * 0.95); }
      else { tw = S.w; th = Math.min(400 * u, (S.h - gap * (n - 1)) / n); }
      const totalW = row ? tw * n + gap * (n - 1) : tw;
      const totalH = row ? th : th * n + gap * (n - 1);
      const ox = k.cx - totalW / 2, oy = k.cy - totalH / 2;
      const pad = 40 * u;
      const R = 28 * u;

      stats.forEach((s, i) => {
        const t0 = 0.1 + i * p.stagger;
        const sp = ease.spring(Math.max(0, t - t0), { stiffness: 220, damping: 22 });
        const appear = m.seg(t, t0, 0.25);
        const ex = ease.inCubic(m.seg(t, D - 0.5 + i * 0.06, 0.35));
        const a = appear * (1 - ex);
        if (a <= 0) return;
        const x = ox + (row ? i * (tw + gap) : 0);
        const y = oy + (row ? 0 : i * (th + gap)) + (1 - sp) * 40 * u + ex * 30 * u;
        const sc = 0.92 + 0.08 * sp;
        g.save();
        g.translate(x + tw / 2, y + th / 2); g.scale(sc, sc); g.translate(-(x + tw / 2), -(y + th / 2));
        g.globalAlpha = a;
        // card
        softCard(k, g, x, y, tw, th, R, k.isDark ? C.mix(c.surface, c.bg, 0.15) : c.surface, k.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,60,0.12)', 50, k.isDark ? 24 : 20);
        if (k.isDark) {
          g.save(); k.draw.rrectPath(g, x, y, tw, th, R); g.clip();
          const sh = g.createLinearGradient(0, y, 0, y + th * 0.5);
          sh.addColorStop(0, 'rgba(255,255,255,0.045)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = sh; g.fillRect(x, y, tw, th * 0.5); g.restore();
        }
        k.draw.rrect(g, x + 0.5, y + 0.5, tw - 1, th - 1, R, null, C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);

        // label
        const lo = { role: 'text', size: 28, weight: 500 };
        k.text.draw(g, s.label.charAt(0).toUpperCase() + s.label.slice(1), x + pad, y + pad + 4 * u, { ...lo, color: c.muted, baseline: 'top', size: k.text.fit(s.label, lo, tw * 0.5, 22) });

        // delta chip
        const delta = p.deltas[i];
        if (delta) {
          const cp = 0.6 + 0.4 * ease.outBack(m.seg(t, t0 + 0.9, 0.5), 1.4);
          const ca = m.seg(t, t0 + 0.9, 0.3);
          if (ca > 0) {
            const co = { role: 'text', size: 24, weight: 600 };
            const L = k.text.layout(delta, co);
            const ch = 44 * u, cw = L.width + 64 * u;
            const cx = x + tw - pad - cw, cy = y + pad - 6 * u;
            const green = c.accent3 || c.accent;
            const ink = k.isDark ? C.mix(green, '#ffffff', 0.25) : C.shade(green, -0.14);
            g.save();
            g.globalAlpha *= ca;
            g.translate(cx + cw / 2, cy + ch / 2); g.scale(cp, cp); g.translate(-(cx + cw / 2), -(cy + ch / 2));
            k.draw.rrect(g, cx, cy, cw, ch, ch / 2, C.alpha(green, k.isDark ? 0.16 : 0.13));
            const tx = cx + 22 * u, ty = cy + ch / 2;
            g.beginPath(); g.moveTo(tx, ty - 7 * u); g.lineTo(tx + 8 * u, ty + 6 * u); g.lineTo(tx - 8 * u, ty + 6 * u); g.closePath();
            g.fillStyle = ink; g.fill();
            k.text.draw(g, delta, tx + 16 * u, ty, { ...co, color: ink, baseline: 'middle' });
            g.restore();
          }
        }

        // value
        const vp = ease.outExpo(m.seg(t, t0 + 0.2, 1.2));
        const dec = s.decimals || 0;
        const finalStr = fmt(s.value, dec) + (s.suffix || '');
        const vo = { size: k.pick({ wide: 96, square: 88, tall: 96 }), weight: 640, tracking: -0.04 };
        vo.size = k.text.fit(finalStr, vo, row ? tw - pad * 2 : tw * 0.5 - pad);
        const str = fmt(vp >= 0.999 ? s.value : s.value * vp, dec) + (s.suffix || '');
        const vy = row ? y + pad + 64 * u : y + pad + 56 * u;
        k.text.draw(g, str, x + pad, vy, { ...vo, baseline: 'top' });
        const VL = k.text.layout(finalStr, vo);
        // period caption under value
        const pa = ease.outCubic(m.seg(t, t0 + 1.1, 0.5));
        k.text.draw(g, p.period, x + pad, vy + VL.cap + 22 * u, { role: 'text', size: 24, weight: 450, color: c.muted, baseline: 'top', alpha: pa });

        // sparkline (zero-based)
        const data = p.sparks[i] || p.sparks[0];
        const mx = Math.max(...data);
        let sx0, sx1, sy0, sy1;
        if (row) { sx0 = x + pad; sx1 = x + tw - pad; sy1 = y + th - pad; sy0 = sy1 - th * 0.3; }
        else { sx0 = x + tw * 0.52; sx1 = x + tw - pad; sy1 = y + th - pad; sy0 = y + pad + 70 * u; }
        const pts = data.map((v, j) => [sx0 + ((sx1 - sx0) * j) / (data.length - 1), sy1 - (v / mx) * (sy1 - sy0)]);
        const dp = ease.inOutCubic(m.seg(t, t0 + 0.45, 0.9));
        if (dp > 0) {
          const cut = sx0 + (sx1 - sx0) * dp;
          g.save();
          g.beginPath(); g.rect(sx0 - 10 * u, sy0 - 20 * u, cut - sx0 + 10 * u, sy1 - sy0 + 30 * u); g.clip();
          g.beginPath(); g.moveTo(pts[0][0], sy1);
          pts.forEach(([px, py]) => g.lineTo(px, py));
          g.lineTo(pts[pts.length - 1][0], sy1); g.closePath();
          const grd = g.createLinearGradient(0, sy0, 0, sy1);
          grd.addColorStop(0, C.alpha(c.accent, k.isDark ? 0.22 : 0.14)); grd.addColorStop(1, C.alpha(c.accent, 0));
          g.fillStyle = grd; g.fill();
          g.restore();
          const end = k.draw.polyline(g, pts, dp, c.accent, 3);
          if (end) {
            if (k.isDark) k.draw.glow(g, end[0], end[1], 26 * u, c.accent, 0.5);
            k.draw.circle(g, end[0], end[1], 6 * u, k.isDark ? c.fg : c.surface, c.accent, 3);
          }
          // baseline hairline
          g.save(); g.globalAlpha *= 0.8;
          k.draw.line(g, sx0, sy1 + 1, sx1, sy1 + 1, C.alpha(c.fg, k.isDark ? 0.1 : 0.12), 1, 'butt');
          g.restore();
        }
        g.restore();
      });
    },
  };
}
