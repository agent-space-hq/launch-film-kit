// A generic search field types a question; autocomplete rows drop in beneath it;
// a keyboard highlight steps down the list and lands on the brand's row, which
// turns accent with an Enter hint.
export const meta = {
  id: 'hook.search-query',
  name: 'Search Query',
  category: 'hook',
  duration: 4.8,
  summary: 'A search bar types the query, four suggestion rows drop down, and a highlight steps down to settle on the brand row (logo, name, tagline) with an Enter hint; holds on that state.',
  bestFor: ['cold open', 'problem/solution', 'discovery'],
  slots: ['searchQuery', 'headline'],
  params: {
    cps: { default: 20, min: 10, max: 40, label: 'Characters per second' },
  },
  sfx: [{ t: 0.15, type: 'type', n: 22, dur: 1.1, gain: 0.35 }, { t: 1.45, type: 'pop', gain: 0.35 }, { t: 2.05, type: 'tick', gain: 0.4 }, { t: 2.35, type: 'tick', gain: 0.4 }, { t: 2.65, type: 'tick', gain: 0.5 }, { t: 2.9, type: 'click', gain: 0.6 }],
  prompt: `Draw a pill search field (about 57% of frame width, 9% of height, surface fill, hairline, soft shadow) in the upper third with a muted search icon; frame 0 shows the field with the first word of the query already typed. The rest types at about 20 characters per second with seeded jitter and an accent caret. 250 ms after the last key a rounded results panel (28 px radius) opens beneath with outQuint and four 76 px rows drop in with 50 ms stagger (12 px slide, 300 ms): three generic completions (typed part muted, completion foreground) and, last, the brand row: small logo, bold brand name and the headline in muted. A soft highlight bar starts on row 1 at 2.05 s and steps down every 300 ms with the standard curve; on the brand row it tints to the accent and an Enter key hint pops in (outBack, 350 ms). Hold about 1.8 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const query = k.copy('searchQuery', 'how to ship a launch faster');
  const headline = k.copy('headline', 'Launch day, without the crunch.');
  const brand = k.brand.name || 'Brand';
  const completions = k.copy('searchCompletions', [' checklist', ' template', ' with a small team']);
  const firstSpace = query.indexOf(' ');
  const pre = firstSpace > 0 ? firstSpace + 1 : 0;
  const times = [];
  let tt = 0.15;
  for (let i = 0; i < query.length; i++) {
    if (i < pre) { times.push(-1); continue; }
    times.push(tt);
    tt += (1 / p.cps) * (0.7 + 0.6 * m.hash(i, 9)) + (query[i] === ' ' ? 0.05 : 0);
  }
  const tEnd = tt;
  const tOpen = tEnd + 0.25;
  const qo = { role: 'text', size: k.pick({ wide: 40, square: 38, tall: 38 }), weight: 460, tracking: -0.01 };
  const ro = { role: 'text', size: k.pick({ wide: 32, square: 30, tall: 30 }), weight: 440, tracking: -0.005 };
  const rows = completions.slice(0, 3).map((c) => ({ kind: 'q', a: query, b: c }));
  rows.push({ kind: 'brand' });
  const hiStart = Math.max(tOpen + 0.45, 2.05);

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const bw = Math.min(k.safe.w * (k.isPortrait ? 0.96 : 0.62), 1100 * k.u);
      const bh = 96 * k.u;
      const rowH = 76 * k.u;
      const panelPad = 14 * k.u;
      const panelH = rows.length * rowH + panelPad * 2;
      const groupH = bh + 16 * k.u + panelH;
      const bx = k.cx - bw / 2;
      const by = k.cy - groupH / 2;
      const surf = k.isDark ? C.mix(c.surface, c.fg, 0.05) : c.surface;
      const hair = C.alpha(c.fg, k.isDark ? 0.12 : 0.1);
      const shadowCol = k.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.12)';
      // camera: starts pushed in on the field, eases out as results open
      const ce = ease.inOutCubic(m.seg(t, tEnd - 0.15, 0.9));
      const S = m.lerp(k.pick({ wide: 1.3, square: 1.04, tall: 1.04 }), 1, ce);
      const barCy = by + bh / 2;
      g.save();
      g.translate(k.cx, m.lerp(k.cy, barCy, ce)); g.scale(S, S); g.translate(-k.cx, -barCy);
      // field
      const focus = ease.outCubic(m.seg(t, 0, 0.3));
      k.draw.shadow(g, bx, by, bw, bh, bh / 2, { blur: 50, y: 18, color: shadowCol });
      k.draw.rrect(g, bx, by, bw, bh, bh / 2, surf, hair, 1);
      g.save(); g.globalAlpha = 0.6 * focus;
      k.draw.rrect(g, bx - 3 * k.u, by - 3 * k.u, bw + 6 * k.u, bh + 6 * k.u, bh / 2 + 3 * k.u, null, C.alpha(c.accent, 0.5), 2);
      g.restore();
      k.draw.icon(g, 'search', bx + 52 * k.u, by + bh / 2, 36 * k.u, c.muted, { stroke: 2 });
      const tx = bx + 92 * k.u;
      let n = 0;
      for (let i = 0; i < query.length; i++) if (t >= times[i]) n = i + 1;
      const typed = query.slice(0, n);
      const L = k.text.draw(g, typed, tx, by + bh / 2, { ...qo, color: c.fg, baseline: 'middle' });
      const cw = L ? L.width : 0;
      const blink = t < tEnd + 0.1 ? 1 : ((t - tEnd) % 1.06) < 0.53 ? 1 : 0;
      const capH = k.text.layout('H', qo).cap;
      g.save(); g.globalAlpha = blink;
      k.draw.rrect(g, tx + cw + 4 * k.u, by + bh / 2 - capH * 0.75, 3 * k.u, capH * 1.5, 1.5 * k.u, c.accent);
      g.restore();
      // panel
      const op = ease.outQuint(m.seg(t, tOpen, 0.45));
      if (op <= 0) { g.restore(); return; }
      const px = bx, py = by + bh + 16 * k.u;
      const ph = panelH * (0.25 + 0.75 * op);
      g.save();
      g.globalAlpha = Math.min(1, op * 1.5);
      k.draw.shadow(g, px, py, bw, ph, 28 * k.u, { blur: 60, y: 24, color: shadowCol });
      k.draw.rrect(g, px, py, bw, ph, 28 * k.u, surf, hair, 1);
      g.restore();
      g.save();
      k.draw.rrectPath(g, px, py, bw, ph, 28 * k.u);
      g.clip();
      // highlight bar
      const steps = rows.length - 1;
      let hp = 0;
      for (let s = 1; s <= steps; s++) hp += ease.standard(m.seg(t, hiStart + s * 0.3 - 0.12, 0.26));
      const hiOn = ease.outCubic(m.seg(t, hiStart - 0.1, 0.2));
      const onBrand = ease.outCubic(m.seg(t, hiStart + steps * 0.3, 0.3));
      if (hiOn > 0) {
        const hy = py + panelPad + hp * rowH;
        g.save(); g.globalAlpha = hiOn;
        k.draw.rrect(g, px + 10 * k.u, hy + 4 * k.u, bw - 20 * k.u, rowH - 8 * k.u, 18 * k.u, C.mix(C.alpha(c.fg, k.isDark ? 0.07 : 0.05), C.alpha(c.accent, k.isDark ? 0.2 : 0.12), onBrand));
        g.restore();
      }
      rows.forEach((r, i) => {
        const rp = ease.outQuint(m.seg(t, tOpen + 0.08 + i * 0.05, 0.3));
        if (rp <= 0) return;
        const ry = py + panelPad + i * rowH + rowH / 2 - (1 - rp) * 12 * k.u;
        const lx = px + 40 * k.u;
        g.save(); g.globalAlpha = rp;
        if (r.kind === 'q') {
          k.draw.icon(g, 'search', lx + 12 * k.u, ry, 26 * k.u, c.muted, { stroke: 2 });
          const La = k.text.draw(g, r.a, lx + 48 * k.u, ry, { ...ro, color: c.muted, baseline: 'middle', qaGroup: 'row' + i });
          k.text.draw(g, r.b.trim(), lx + 48 * k.u + La.width + k.text.layout(' ', ro).width, ry, { ...ro, weight: 600, color: c.fg, baseline: 'middle', qaGroup: 'row' + i });
        } else {
          const mh = 34 * k.u;
          k.logo.draw(g, lx + 12 * k.u, ry, mh);
          const nx = lx + 48 * k.u;
          const Ln = k.text.draw(g, brand, nx, ry, { ...ro, weight: 650, color: onBrand > 0.5 ? c.accent : c.fg, baseline: 'middle', qaGroup: 'brandrow' });
          const kb = ease.outBack(m.seg(t, hiStart + steps * 0.3 + 0.05, 0.35));
          const kbW = 92 * k.u;
          const room = bw - (nx - px) - Ln.width - 30 * k.u - kbW - 50 * k.u;
          const so = { ...ro, color: c.muted };
          so.size = Math.min(ro.size, k.text.fit(headline, so, room, 22));
          if (k.text.layout(headline, so).width <= room) k.text.draw(g, headline, nx + Ln.width + 22 * k.u, ry, { ...so, baseline: 'middle', qaGroup: 'brandrow' });
          if (kb > 0) {
            const kx = px + bw - 40 * k.u - kbW;
            g.save();
            const ks = 0.86 + 0.14 * kb;
            g.translate(kx + kbW / 2, ry); g.scale(ks, ks);
            g.globalAlpha *= m.clamp(kb * 1.6);
            k.draw.rrect(g, -kbW / 2, -22 * k.u, kbW, 44 * k.u, 12 * k.u, k.isDark ? C.mix(c.surface, c.fg, 0.14) : c.surface, C.alpha(c.fg, 0.22), 1);
            k.draw.rrect(g, -kbW / 2, 18 * k.u, kbW, 4 * k.u, 2 * k.u, C.alpha(c.fg, 0.08));
            k.text.draw(g, 'Enter', 0, 0, { role: 'text', size: 23, weight: 600, color: c.fg, align: 'center', baseline: 'middle' });
            g.restore();
          }
        }
        g.restore();
      });
      g.restore();
      g.restore();
    },
  };
}
