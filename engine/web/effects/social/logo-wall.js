// A wall of invented company marks (simple geometric glyphs plus made-up wordmarks)
// fades up in a ripple from the centre. One empty dashed cell then lights up in accent
// as "Your team": the open seat among teams like yours.
export const meta = {
  id: 'social.logo-wall',
  name: 'Logo Wall',
  category: 'social',
  duration: 5,
  summary: 'A hairline grid of fictional geometric company marks ripples in from the centre under a headline; one dashed cell fills with an accent glow reading "Your team" while the rest dim slightly; holds, then fades in the last 0.45 s.',
  bestFor: ['social proof', 'customers', 'trust'],
  slots: ['wallHeadline'],
  params: {
    headline: { default: null, label: 'Headline (defaults to copy.wallHeadline)' },
    companies: {
      default: ['Brightfold', 'Lumenrow', 'Tidewell', 'Quillstone', 'Fernway', 'Mossgate', 'Ambergrove', 'Pebbleline', 'Driftmark', 'Cinderloom', 'Saltreed', 'Orchidrun', 'Glassbeck', 'Ravenmoor', 'Hollowpeak', 'Wrenfield', 'Ironbirch', 'Sunmere', 'Coralfen', 'Ashbourne'],
      label: 'Invented company names (fictional placeholders)',
    },
    seat: { default: 'Your team', label: 'Label in the highlighted cell' },
  },
  sfx: [{ t: 0.3, type: 'shimmer', gain: 0.35 }, { t: 2.3, type: 'swell', dur: 0.6, gain: 0.45 }],
  prompt: `Customer wall, 5 s. A headline (64 px display, -0.03 em) rises 24 px with outExpo at the top of title-safe. Below, a hairline-separated grid (6x3 on 16:9, 4x4 on 4:5, 3x6 on 9:16) fills the safe area. Each cell holds an invented geometric mark (ring, stepped bars, split diamond, hexagon, arcs; ~50 px Path2D) beside a made-up wordmark in ~30 px display, 600 weight, muted ink. Cells fade and rise 12 px with outExpo over 600 ms, delayed ~90 ms per grid step from the centre. The centre-most cell is an empty dashed outline. At 2.2 s it fills: accent-tinted rounded panel, 1.5 px accent border, glow on dark or shadow on light, a plus glyph and "Your team" in accent ink, scaling from 94% with outExpo, while other marks dim to 70%. Hold, then fade over 450 ms inCubic.`,
};

// Simple invented marks in a 0..40 box (never real logos).
function markShapes(kind) {
  const p = new Path2D();
  switch (kind % 12) {
    case 0: p.arc(20, 20, 18, 0, Math.PI * 2); p.moveTo(29, 20); p.arc(20, 20, 9, 0, Math.PI * 2, true); break; // ring
    case 1: p.rect(2, 4, 36, 8); p.rect(2, 16, 26, 8); p.rect(2, 28, 16, 8); break; // stepped bars
    case 2: p.moveTo(20, 2); p.lineTo(38, 20); p.lineTo(20, 38); p.lineTo(2, 20); p.closePath(); p.moveTo(20, 10); p.lineTo(20, 30); p.lineTo(10, 20); p.closePath(); break; // split diamond
    case 3: for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; const x = 20 + 19 * Math.cos(a), y = 20 + 19 * Math.sin(a); i ? p.lineTo(x, y) : p.moveTo(x, y); } p.closePath(); break; // hexagon
    case 4: p.arc(14, 20, 12, 0, Math.PI * 2); p.moveTo(38, 20); p.arc(26, 20, 12, 0, Math.PI * 2); break; // twin circles
    case 5: p.moveTo(2, 38); p.lineTo(20, 2); p.lineTo(38, 38); p.closePath(); p.moveTo(20, 18); p.lineTo(28, 34); p.lineTo(12, 34); p.closePath(); break; // nested triangle
    case 6: p.arc(20, 38, 18, Math.PI, 0); p.closePath(); p.moveTo(30, 12); p.arc(20, 12, 10, 0, Math.PI * 2); break; // dome + dot
    case 7: p.rect(2, 2, 16, 16); p.rect(22, 2, 16, 16); p.rect(2, 22, 16, 16); p.moveTo(38, 30); p.arc(30, 30, 8, 0, Math.PI * 2); break; // three squares + dot
    case 8: p.moveTo(2, 20); p.quadraticCurveTo(11, 2, 20, 20); p.quadraticCurveTo(29, 38, 38, 20); p.lineTo(38, 30); p.quadraticCurveTo(29, 48, 20, 30); p.quadraticCurveTo(11, 12, 2, 30); p.closePath(); break; // wave band
    case 9: p.arc(20, 20, 18, -Math.PI / 2, Math.PI / 2); p.closePath(); p.moveTo(16, 2); p.arc(16, 20, 18, -Math.PI / 2, Math.PI / 2, true); p.lineTo(16, 30); p.arc(16, 20, 10, Math.PI / 2, -Math.PI / 2); p.closePath(); break; // half moons
    case 10: for (let i = 0; i < 4; i++) p.rect(2 + i * 10, 38 - (i + 1) * 9, 6, (i + 1) * 9); break; // rising bars
    default: p.moveTo(20, 2); p.lineTo(38, 38); p.lineTo(2, 38); p.closePath(); p.moveTo(28, 38); p.arc(20, 38, 8, 0, Math.PI, true); break; // arch triangle
  }
  return p;
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const D = p.duration ?? meta.duration;
  const headline = p.headline || k.copy('wallHeadline', 'Trusted by teams like yours');
  const [cols, rows] = k.pick({ wide: [6, 3], square: [4, 4], tall: [3, 6] });
  const N = cols * rows;
  // the seat: centre-most cell
  let seat = 0, bestD = 1e9;
  for (let i = 0; i < N; i++) {
    const cx = (i % cols) - (cols - 1) / 2, cy = Math.floor(i / cols) - (rows - 1) / 2;
    const d = Math.hypot(cx * 1.01, cy) + (cx > 0 ? 0.01 : 0) + (cy > 0 ? 0.02 : 0);
    if (d < bestD) { bestD = d; seat = i; }
  }
  const shapes = [];
  for (let i = 0; i < 12; i++) shapes.push(markShapes(i));
  const order = k.m.rng(23).shuffle([...Array(12).keys()]);
  const names = p.companies;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const S = k.safe;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;

      // headline
      const hIn = ease.outExpo(m.seg(t, 0.05, 0.8));
      const ho = { size: k.pick({ wide: 64, square: 60, tall: 60 }), weight: 620, tracking: -0.03 };
      const hl = k.text.balance(headline, ho, S.w * 0.9);
      const hlh = ho.size * 1.08 * u;
      hl.forEach((ln, i) => k.text.draw(g, ln, k.cx, S.y + 20 * u + i * hlh + (1 - hIn) * 24 * u, { ...ho, align: 'center', baseline: 'top', alpha: hIn * fade, qaGroup: 'head' }));

      // grid
      const gy0 = S.y + 20 * u + hl.length * hlh + 70 * u;
      const gh = S.y + S.h - gy0;
      const cellW = S.w / cols;
      const cellH = Math.min(gh / rows, cellW * 0.62);
      const gridH = cellH * rows;
      const gx0 = S.x, gyy = gy0 + (gh - gridH) / 2;
      const lineA = ease.inOutCubic(m.seg(t, 0.2, 0.9));
      g.save();
      g.globalAlpha = fade * lineA;
      const lc = C.alpha(c.fg, k.isDark ? 0.09 : 0.1);
      for (let i = 1; i < cols; i++) k.draw.line(g, gx0 + i * cellW, gyy + 12 * u, gx0 + i * cellW, gyy + gridH - 12 * u, lc, 1, 'butt');
      for (let j = 1; j < rows; j++) k.draw.line(g, gx0 + 12 * u, gyy + j * cellH, gx0 + S.w - 12 * u, gyy + j * cellH, lc, 1, 'butt');
      g.restore();

      const lit = ease.outExpo(m.seg(t, 2.2, 0.8));
      const dimOthers = 1 - 0.3 * ease.inOutCubic(m.seg(t, 2.1, 0.6));
      const seatX = gx0 + (seat % cols) * cellW, seatY = gyy + Math.floor(seat / cols) * cellH;
      let ni = 0;
      for (let i = 0; i < N; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const x = gx0 + col * cellW, y = gyy + row * cellH;
        const dist = Math.hypot(col - (seat % cols), (row - Math.floor(seat / cols)) * 1.2);
        const a = ease.outExpo(m.seg(t, 0.3 + dist * 0.09, 0.6));
        if (i === seat) continue;
        const name = names[ni % names.length];
        const kind = order[ni % 12];
        ni++;
        if (a <= 0) continue;
        const mk = k.pick({ wide: 52, square: 46, tall: 46 }) * u;
        const no = { role: 'display', size: k.pick({ wide: 32, square: 28, tall: 28 }), weight: 600, tracking: -0.02 };
        const ns = k.text.fit(name, no, cellW - mk - 60 * u, 22);
        const L = k.text.layout(name, { ...no, size: ns });
        const total = mk + 14 * u + L.width;
        const mx = x + cellW / 2 - total / 2, my = y + cellH / 2 + (1 - a) * 12 * u;
        const ink = C.mix(c.fg, c.bg, k.isDark ? 0.32 : 0.38);
        g.save();
        g.globalAlpha = a * fade * dimOthers;
        g.translate(mx, my - mk / 2); g.scale(mk / 40, mk / 40);
        g.fillStyle = ink; g.fill(shapes[kind], 'evenodd');
        g.restore();
        k.text.draw(g, name, mx + mk + 14 * u, my, { ...no, size: ns, color: ink, baseline: 'middle', alpha: a * fade * dimOthers, qaGroup: 'c' + i });
      }

      // the seat
      const sa = ease.outExpo(m.seg(t, 0.3, 0.6)) * fade;
      if (sa > 0) {
        const inset = 14 * u;
        const bx = seatX + inset, by = seatY + inset, bw = cellW - inset * 2, bh = cellH - inset * 2;
        const R = 18 * u;
        const sc = 0.94 + 0.06 * lit;
        g.save();
        g.translate(bx + bw / 2, by + bh / 2); g.scale(lit > 0 ? sc : 1, lit > 0 ? sc : 1); g.translate(-(bx + bw / 2), -(by + bh / 2));
        g.globalAlpha = sa;
        if (lit > 0) {
          if (k.isDark) k.draw.glow(g, bx + bw / 2, by + bh / 2, bw * 0.9, c.accent, 0.22 * lit);
          g.save();
          g.shadowColor = k.isDark ? 'rgba(0,0,0,0)' : C.alpha(c.accent, 0.25 * lit); g.shadowBlur = 30 * u; g.shadowOffsetY = 10 * u;
          k.draw.rrect(g, bx, by, bw, bh, R, k.isDark ? C.alpha(c.accent, 0.14 * lit) : C.mix(c.surface, c.accent, 0.06 * lit));
          g.restore();
          k.draw.rrect(g, bx, by, bw, bh, R, null, C.alpha(c.accent, 0.9 * lit), 1.5);
        }
        g.setLineDash([6 * u, 7 * u]);
        k.draw.rrect(g, bx, by, bw, bh, R, null, C.alpha(c.fg, (k.isDark ? 0.25 : 0.3) * (1 - lit)), 1.5);
        g.setLineDash([]);
        // plus glyph + label
        const lo = { role: 'text', size: 30, weight: 600 };
        const ls = k.text.fit(p.seat, lo, bw - 90 * u, 22);
        const L = k.text.layout(p.seat, { ...lo, size: ls });
        const total = 34 * u + 12 * u + L.width;
        const px = bx + bw / 2 - total / 2, py = by + bh / 2;
        const ink = lit > 0.5 ? (k.isDark ? C.mix(c.accent, '#ffffff', 0.35) : C.shade(c.accent, -0.06)) : c.muted;
        k.draw.icon(g, 'plus', px + 17 * u, py, 34 * u, lit > 0 ? C.mix(c.muted, c.accent, lit) : c.muted, { stroke: 2.2 });
        g.restore();
        k.text.draw(g, p.seat, px + 46 * u, py, { ...lo, size: ls, color: ink, baseline: 'middle', alpha: sa * (0.6 + 0.4 * lit) });
      }
    },
  };
}
