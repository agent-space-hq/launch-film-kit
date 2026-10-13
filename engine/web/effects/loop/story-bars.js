// Story format: four segmented progress bars at the top fill one after another while
// four feature cards advance with a shared-axis push. On the last push the bars drain
// back to empty, so the loop wraps without a cut.
export const meta = {
  id: 'loop.story-bars',
  name: 'Story Bars',
  category: 'loop',
  duration: 7.2,
  loop: true,
  summary: 'Four story-style progress segments fill in turn while four feature cards (icon, index, name) push through one by one; the bars drain during the final push so the loop is seamless.',
  bestFor: ['vertical social video', 'feature tour', 'story ad'],
  slots: ['features'],
  params: {
    push: { default: 0.5, min: 0.3, max: 0.8, label: 'Push transition (s)' },
  },
  sfx: [{ t: 0.58, type: 'whoosh', dur: 0.4, gain: 0.25 }, { t: 2.38, type: 'whoosh', dur: 0.4, gain: 0.25 }, { t: 4.18, type: 'whoosh', dur: 0.4, gain: 0.25 }, { t: 5.98, type: 'whoosh', dur: 0.4, gain: 0.25 }],
  prompt: `Divide the loop into four equal slides (1.8 s each in 7.2 s). Across the top of the safe area draw four 6 px rounded progress tracks with 10 px gaps (foreground at 18%); track i fills linearly during slide i in the foreground colour. Under the bars sits a fixed header: the mark in a 56 px circle plus the brand name. Each slide is a centred card (about 70-76% of the short side wide, 5:4 on wide and slightly taller than wide on portrait, surface fill with a soft accent wash from the top, hairline border, soft shadow on light, faint accent glow on dark) holding a 168 px accent squircle icon (the line icon draws on over 600 ms after arrival), a mono index like "02 / 04" in the accent, and the feature name at 76-86 px, weight 650, -0.03 em. In the last 500 ms of each slide the card pushes left 30% of the frame width while fading and the next arrives from the right (standard curve). During the final push all bars drain to empty with inOutCubic, so the frame at the end equals frame 0. Offset the timeline by 40% of a slide so frame 0 shows a settled first card. Every card holds still for at least 1.3 s.`,
};

function iconFor(name, i) {
  const s = name.toLowerCase();
  if (/road|plan|map|calendar|schedul/.test(s)) return 'calendar';
  if (/release|ship|deploy|click|fast|speed|launch/.test(s)) return 'bolt';
  if (/log|change|note|doc|write/.test(s)) return 'sparkle';
  if (/team|approv|people|collab|share/.test(s)) return 'users';
  if (/secur|lock|private/.test(s)) return 'lock';
  if (/chat|message|comment/.test(s)) return 'chat';
  if (/search|find/.test(s)) return 'search';
  if (/analytic|metric|chart|data|insight/.test(s)) return 'chart-line';
  return ['bolt', 'sparkle', 'chart-line', 'users'][i % 4];
}

export function create(k, p) {
  const { ease, m } = k;
  const feats = (k.copy('features', null) || ['Plan together', 'Ship faster', 'See what changed', 'Stay in sync']).slice(0, 4);
  while (feats.length < 4) feats.push(feats[feats.length % Math.max(1, feats.length)]);
  const slides = feats.map((f, i) => ({ name: f, icon: iconFor(f, i), idx: `${String(i + 1).padStart(2, '0')} / 04` }));
  const cw = Math.min(k.safe.w, k.pick({ wide: 760, square: 760, tall: 820 }) * k.u);
  const ch = cw * k.pick({ wide: 0.8, square: 0.86, tall: 1.05 });
  const titleO = { size: k.pick({ wide: 76, square: 80, tall: 86 }), weight: 650, tracking: -0.03 };
  slides.forEach((s) => { s.size = k.text.fit(s.name, titleO, cw - 120 * k.u); });
  const name = k.brand.name || '';

  return {
    draw(g, t) {
      const c = k.brand.colors, C = k.color;
      const D = p.duration ?? meta.duration;
      const P = D / 4;
      const ph = (((t + 0.4 * P) % D) + D) % D; // frame 0 lands on a settled first card
      const pushD = Math.min(p.push, P * 0.4);
      const cur = Math.min(3, Math.floor(ph / P));
      const sLocal = ph - cur * P;
      const pushE = ease.standard(m.seg(sLocal, P - pushD, pushD));

      // ---- progress bars ----
      const bx = k.safe.x, bw = k.safe.w, gap = 10 * k.u, bh = 6 * k.u;
      const by = k.safe.y;
      const segW = (bw - gap * 3) / 4;
      const drain = cur === 3 ? ease.inOutCubic(m.seg(sLocal, P - pushD, pushD)) : 0;
      for (let j = 0; j < 4; j++) {
        const x = bx + j * (segW + gap);
        k.draw.rrect(g, x, by, segW, bh, bh / 2, C.alpha(c.fg, 0.18));
        const f = m.clamp((ph - j * P) / P) * (1 - drain);
        if (f > 0.001) k.draw.rrect(g, x, by, Math.max(bh, segW * f), bh, bh / 2, C.alpha(c.fg, 0.92 * Math.min(1, f * 40)));
      }
      // ---- fixed header ----
      const hy = by + bh + 48 * k.u, ar = 28 * k.u;
      k.draw.circle(g, bx + ar, hy, ar, c.surface, C.alpha(c.fg, 0.14), 1);
      k.logo.draw(g, bx + ar, hy, ar * 1.15);
      if (name) k.text.draw(g, name, bx + ar * 2 + 16 * k.u, hy, { role: 'text', size: 30, weight: 600, baseline: 'middle', color: c.fg });

      // ---- cards: current (pushing out) and next (pushing in) ----
      const cy = k.cy + 40 * k.u * (k.isPortrait ? 0 : 1);
      const drawCard = (si, dx, alpha, s) => {
        if (alpha <= 0.01) return;
        const S = slides[si];
        const x = k.cx - cw / 2 + dx, y = cy - ch / 2;
        g.save();
        g.globalAlpha = alpha;
        if (k.isDark) k.draw.glow(g, x + cw * 0.5, y + ch * 0.35, cw * 0.75, c.accent, 0.12);
        else k.draw.shadow(g, x, y, cw, ch, 36 * k.u, { blur: 60, y: 26, color: 'rgba(20,30,60,0.14)' });
        k.draw.rrect(g, x, y, cw, ch, 36 * k.u, c.surface, C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);
        // soft accent wash from the top of the card
        g.save();
        k.draw.rrectPath(g, x, y, cw, ch, 36 * k.u); g.clip();
        const wash = g.createRadialGradient(x + cw / 2, y, 0, x + cw / 2, y, ch * 0.9);
        wash.addColorStop(0, C.alpha(c.accent, k.isDark ? 0.16 : 0.09)); wash.addColorStop(1, C.alpha(c.accent, 0));
        g.fillStyle = wash; g.fillRect(x, y, cw, ch);
        g.restore();
        // icon tile
        const is = 168 * k.u, ix = k.cx + dx, iy = y + ch * 0.32;
        g.save();
        k.draw.squirclePath(g, ix - is / 2, iy - is / 2, is, is, is * 0.3);
        g.fillStyle = c.accent; g.fill();
        g.restore();
        const ip = ease.inOutCubic(m.seg(s, 0.05, 0.6));
        if (ip > 0.02) k.draw.icon(g, S.icon, ix, iy, is * 0.54, C.onColor(c.accent), { p: ip, stroke: 1.8 });
        // index + title (text resolves later than the card body so it never sits half-transparent)
        g.globalAlpha = alpha ** 3;
        k.text.draw(g, S.idx, ix, y + ch * 0.58, { role: 'mono', size: 28, weight: 500, align: 'center', baseline: 'middle', color: c.accent, tracking: 0.04 });
        k.text.draw(g, S.name, ix, y + ch * 0.75, { ...titleO, size: S.size, align: 'center', baseline: 'middle', color: c.fg });
        g.restore();
      };
      const shift = k.W * 0.3;
      const nxt = (cur + 1) % 4;
      drawCard(cur, -shift * pushE, 1 - pushE, sLocal);
      if (pushE > 0) drawCard(nxt, shift * (1 - pushE), pushE, sLocal - P);
    },
  };
}
