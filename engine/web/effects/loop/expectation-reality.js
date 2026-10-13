// Two panels side by side (stacked on portrait). "Expectation": a crowded grey Gantt
// whose bars keep slipping past a deadline while warning dots blink. "Reality": one
// tidy staircase of three tasks that fills in the accent and lands a check. Both
// mini-scenes are periodic in the loop phase, so the loop is seamless.
export const meta = {
  id: 'loop.expectation-reality',
  name: 'Expectation vs Reality',
  category: 'loop',
  duration: 6,
  loop: true,
  summary: 'Left panel: a chaotic grey Gantt that slips and stretches past its deadline with blinking warnings and copy.before; right panel: three clean tasks fill in the accent and land a check with copy.after; seamless loop.',
  bestFor: ['social comparison post', 'problem / solution beat', 'before and after'],
  slots: ['before', 'after'],
  params: {
    labelA: { default: 'Expectation', label: 'Left label' },
    labelB: { default: 'Reality', label: 'Right label' },
  },
  sfx: [{ t: 4.1, type: 'tick', gain: 0.4 }, { t: 4.5, type: 'tick', gain: 0.4 }, { t: 4.9, type: 'tick', gain: 0.4 }, { t: 5.35, type: 'pop', gain: 0.5 }],
  prompt: `Lay out two equal rounded panels (each about 44% of the safe width and 62% of its height side by side; stacked on portrait), surface fill, hairline border, label pill top-left ("Expectation", "Reality", 24 px). Under each panel a caption at 52 px: copy.before in muted grey, copy.after in the accent. Left scene: eight grey Gantt bars with random lengths whose start and length drift on whole-number sine cycles of the loop phase (6% and 15% of panel width), tangled dependency curves, a dashed deadline line that bars keep overrunning, and two secondary-accent warning dots blinking twice per loop. Right scene: three tasks in a staircase; an accent fill sweeps them in order (inOutCubic, 400 ms each, 400 ms apart), a check badge pops with outBack, the state holds, then fades out over the last 8% of the loop and restarts. Offset the timeline by 40% of the loop so frame 0 shows the finished right panel.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const r = m.rng(5);
  const bars = Array.from({ length: 8 }, (_, i) => ({
    x: 0.04 + r() * 0.4, len: 0.25 + r() * 0.35,
    n: 1 + Math.floor(r() * 2), ph: r(), ln: 1 + Math.floor(r() * 2), lp: r(),
    warn: i === 2 || i === 5, a: 0.16 + r() * 0.16,
  }));
  const deps = [[0, 3], [1, 4], [3, 6], [2, 7], [4, 1]];
  const before = k.copy('before', 'Weeks of chaos');
  const after = k.copy('after', 'One calm afternoon');

  function panelRects() {
    const sx = k.safe.x, sy = k.safe.y, sw = k.safe.w, sh = k.safe.h;
    const capH = 110 * k.u;
    if (k.isPortrait) {
      const gap = 40 * k.u;
      const h = (sh - gap - capH * 2) / 2;
      return [{ x: sx, y: sy, w: sw, h }, { x: sx, y: sy + h + capH + gap, w: sw, h }];
    }
    const gap = 48 * k.u;
    const w = (sw - gap) / 2;
    const h = Math.min(sh - capH - 40 * k.u, w * 0.78);
    const y = k.cy - (h + capH) / 2;
    return [{ x: sx, y, w, h }, { x: sx + w + gap, y, w, h }];
  }

  function panel(g, R, label, accentLabel) {
    const c = k.brand.colors, C = k.color;
    const rad = 28 * k.u;
    if (!k.isDark) k.draw.shadow(g, R.x, R.y, R.w, R.h, rad, { blur: 50, y: 20, color: 'rgba(20,30,60,0.12)' });
    k.draw.rrect(g, R.x, R.y, R.w, R.h, rad, c.surface, C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);
    const L = k.text.layout(label, { role: 'text', size: 24, weight: 600 });
    const ph = 44 * k.u, pw = L.width + 36 * k.u;
    const px = R.x + 24 * k.u, py = R.y + 24 * k.u;
    k.draw.rrect(g, px, py, pw, ph, ph / 2, accentLabel ? C.alpha(c.accent, k.isDark ? 0.2 : 0.12) : C.alpha(c.fg, 0.07));
    k.text.draw(g, label, px + 18 * k.u, py + ph / 2, { role: 'text', size: 24, weight: 600, baseline: 'middle', color: accentLabel ? (k.isDark ? C.mix(c.accent, '#ffffff', 0.35) : c.accent) : c.muted });
    return { x: R.x + 28 * k.u, y: py + ph + 26 * k.u, w: R.w - 56 * k.u, h: R.h - (py - R.y) - ph - 52 * k.u };
  }

  function chaos(g, A, ph) {
    const c = k.brand.colors, C = k.color;
    const n = bars.length, rowH = A.h / n;
    const bh = Math.min(rowH * 0.56, 26 * k.u);
    const pos = bars.map((b, i) => {
      const x = b.x + 0.06 * Math.sin(m.TAU * (ph * b.n + b.ph));
      const len = b.len * (1 + 0.15 * Math.sin(m.TAU * (ph * b.ln + b.lp)));
      return { x: A.x + x * A.w, w: len * A.w, y: A.y + rowH * (i + 0.5) };
    });
    // faint grid
    g.save();
    g.strokeStyle = C.alpha(c.fg, 0.06); g.lineWidth = Math.max(1, k.u);
    for (let j = 1; j < 6; j++) { const x = A.x + (A.w * j) / 6; g.beginPath(); g.moveTo(x, A.y); g.lineTo(x, A.y + A.h); g.stroke(); }
    g.restore();
    // tangled dependencies
    g.save();
    g.strokeStyle = C.alpha(c.fg, 0.22); g.lineWidth = 1.3 * k.u;
    for (const [a, b] of deps) {
      const P0 = pos[a], P1 = pos[b];
      const x0 = P0.x + P0.w, y0 = P0.y, x1 = P1.x, y1 = P1.y;
      g.beginPath(); g.moveTo(x0, y0);
      g.bezierCurveTo(x0 + A.w * 0.25, y0, x1 - A.w * 0.25, y1, x1, y1);
      g.stroke();
    }
    g.restore();
    // bars (clipped to the panel area)
    g.save();
    g.beginPath(); g.rect(A.x, A.y, A.w, A.h); g.clip();
    pos.forEach((q, i) => {
      const b = bars[i];
      k.draw.rrect(g, q.x, q.y - bh / 2, q.w, bh, bh / 2, b.warn ? C.alpha(c.accent2 || c.accent, 0.55) : C.alpha(c.fg, b.a));
    });
    g.restore();
    // deadline
    const dx = A.x + A.w * 0.72;
    g.save();
    g.setLineDash([6 * k.u, 6 * k.u]);
    g.strokeStyle = C.alpha(c.accent2 || c.fg, 0.75); g.lineWidth = 2 * k.u;
    g.beginPath(); g.moveTo(dx, A.y - 6 * k.u); g.lineTo(dx, A.y + A.h + 6 * k.u); g.stroke();
    g.restore();
    // blinking warnings (twice per loop)
    [2, 5].forEach((i, j) => {
      const q = pos[i];
      const bl = 0.5 + 0.5 * Math.sin(m.TAU * (ph * 2 + j * 0.35));
      const wx = Math.min(A.x + A.w - 12 * k.u, q.x + q.w + 16 * k.u);
      k.draw.circle(g, wx, q.y, 7 * k.u, C.alpha(c.accent2 || c.accent, 0.35 + 0.65 * bl));
      k.draw.circle(g, wx, q.y, 7 * k.u + 10 * k.u * bl, null, C.alpha(c.accent2 || c.accent, 0.3 * (1 - bl)), 1.5);
    });
  }

  function calm(g, A, ph, D) {
    const c = k.brand.colors, C = k.color;
    const tau = ph * D;
    const reset = 1 - ease.inOutCubic(m.seg(ph, 0.92, 0.08));
    const rows = 3, rowH = A.h / (rows + 1.2);
    const bh = Math.min(rowH * 0.42, 30 * k.u);
    const segs = [[0.0, 0.42], [0.36, 0.72], [0.66, 0.96]];
    segs.forEach(([a, b], i) => {
      const y = A.y + rowH * (i + 0.8);
      const x0 = A.x + a * A.w, w = (b - a) * A.w;
      k.draw.rrect(g, x0, y - bh / 2, w, bh, bh / 2, C.alpha(c.fg, k.isDark ? 0.08 : 0.07));
      const f = ease.inOutCubic(m.seg(tau, 0.5 + i * 0.4, 0.4)) * reset;
      if (f > 0.002) k.draw.rrect(g, x0, y - bh / 2, Math.max(bh, w * f), bh, bh / 2, C.alpha(c.accent, Math.min(1, f * 30)));
      // tidy connector
      if (i < 2) {
        const nb = segs[i + 1];
        g.save();
        g.strokeStyle = C.alpha(c.fg, 0.14); g.lineWidth = 1.3 * k.u;
        g.beginPath(); g.moveTo(A.x + b * A.w - 8 * k.u, y + bh / 2); g.lineTo(A.x + b * A.w - 8 * k.u, y + rowH - bh / 2);
        g.lineTo(A.x + nb[0] * A.w + 8 * k.u, y + rowH - bh / 2);
        g.stroke(); g.restore();
      }
    });
    // check badge
    const pop = ease.outBack(m.seg(tau, 0.5 + 3 * 0.4 + 0.05, 0.45)) * reset;
    if (pop > 0.01) {
      const bx = A.x + A.w * 0.5, by = A.y + rowH * 3.85, br = Math.min(rowH * 0.5, 40 * k.u) * pop;
      if (k.isDark) k.draw.glow(g, bx, by, br * 3, c.accent, 0.3 * reset);
      k.draw.circle(g, bx, by, br, c.accent);
      k.draw.icon(g, 'check', bx, by, br * 1.2, C.onColor(c.accent), { stroke: 2.4 });
    }
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const D = p.duration ?? meta.duration;
      const ph = ((t / D + 0.4) % 1 + 1) % 1; // frame 0 shows the finished right panel
      const [RA, RB] = panelRects();
      const A = panel(g, RA, p.labelA, false);
      const B = panel(g, RB, p.labelB, true);
      chaos(g, A, ph);
      calm(g, B, ph, D);
      const capSize = k.pick({ wide: 52, square: 46, tall: 50 });
      const capO = { size: capSize, weight: 640, tracking: -0.025, align: 'center', baseline: 'middle' };
      const capY = (R) => R.y + R.h + 56 * k.u;
      const fitA = k.text.fit(before, capO, RA.w * 0.9), fitB = k.text.fit(after, capO, RB.w * 0.9);
      k.text.draw(g, before, RA.x + RA.w / 2, capY(RA), { ...capO, size: fitA, color: c.muted });
      k.text.draw(g, after, RB.x + RB.w / 2, capY(RB), { ...capO, size: fitB, color: k.isDark ? k.color.mix(c.accent, '#ffffff', 0.15) : c.accent });
    },
  };
}
