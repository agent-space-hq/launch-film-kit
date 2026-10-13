// One giant number races upward on tabular digits while it grows toward the camera,
// then slams down to rest with a damped scale overshoot, a 150 ms camera shake and
// a thin shock ring. Its label tucks in beneath from behind a baseline mask.
export const meta = {
  id: 'hook.number-slam',
  name: 'Number Slam',
  category: 'hook',
  duration: 4.0,
  summary: 'A giant stat counts up fast while scaling toward camera, lands with an overshoot impact and a short shake, then its label tucks in beneath; holds, then shrinks away in the last 0.45 s.',
  bestFor: ['cold open', 'traction hook', 'big stat'],
  slots: ['stats'],
  params: {
    stat: { default: 0, min: 0, max: 2, label: 'Which copy.stats entry' },
    from: { default: 0.6, min: 0, max: 0.95, label: 'Count starts at (fraction of value)' },
  },
  sfx: [{ t: 0.0, type: 'riser', dur: 0.85, gain: 0.45 }, { t: 0.85, type: 'hit', gain: 0.9 }, { t: 0.86, type: 'sub', gain: 0.6 }, { t: 1.05, type: 'whoosh', dur: 0.3, gain: 0.25 }],
  prompt: `One stat fills the frame from frame 0 (about 26% of height, weight 680, -0.045 em), already at 60% of its value so the thumbnail reads. Digits sit in fixed tabular cells so the line never jitters. Over 850 ms the value counts up with outCubic while the number scales 0.9 to 1.1 with inCubic, rushing at the camera, tinted toward muted. At 850 ms it lands: colour snaps to the foreground, scale returns to 1.0 on a stiff spring (stiffness 420, damping 18) so it dips just under, the frame shakes at most 6 px for 150 ms and a thin accent ring expands and fades over 600 ms. The suffix is the accent. At 1.0 s the label (3.7% of height, muted) rises from a mask with outExpo over 700 ms and an accent rule grows beneath. Hold 2.4 s, then scale to 0.96 and fade in 450 ms (inCubic).`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function create(k, p) {
  const { ease, m } = k;
  const stats = k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'teams on board' }];
  const s = stats[Math.min(stats.length - 1, Math.max(0, p.stat | 0))];
  const dec = s.decimals || 0;
  const suffix = s.suffix || '';
  const prefix = s.prefix || '';
  const finalStr = prefix + fmt(s.value, dec) + suffix;
  const o = { size: k.pick({ wide: 300, square: 250, tall: 230 }), weight: 680, tracking: -0.045 };
  o.size = k.text.fit(finalStr, o, (k.safe.w * 0.9) / 1.1);
  const lab = { role: 'text', size: k.pick({ wide: 40, square: 38, tall: 40 }), weight: 480 };
  // tabular cell = widest digit
  let cell = 0;
  for (let d = 0; d < 10; d++) cell = Math.max(cell, k.text.layout(String(d), o).width);
  const trackPx = () => k.text.layout('0', o).trackPx;

  function layoutStr(str) {
    const items = [];
    let x = 0;
    const tp = trackPx();
    for (const ch of Array.from(str)) {
      const w = /[0-9]/.test(ch) ? cell : k.text.layout(ch, o).width;
      items.push({ ch, x, w });
      x += w + tp;
    }
    return { items, width: x - tp };
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const D = p.duration ?? meta.duration;
      const T_LAND = 0.85;
      const cp = ease.outCubic(m.seg(t, 0, T_LAND));
      const val = m.lerp(s.value * p.from, s.value, cp);
      const str = prefix + fmt(t >= T_LAND ? s.value : val, dec) + suffix;
      let sc;
      if (t < T_LAND) sc = 0.9 + 0.2 * ease.inCubic(m.seg(t, 0, T_LAND));
      else sc = 1.1 - 0.1 * ease.spring(t - T_LAND, { stiffness: 420, damping: 18 });
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      sc *= 1 - exit * 0.04;
      // camera shake (<= 6 px, 150 ms)
      const sh = m.seg(t, T_LAND, 0.15);
      const amp = t >= T_LAND && sh < 1 ? 6 * k.u * (1 - sh) * (1 - sh) : 0;
      const ox = amp * Math.sin(t * 157), oy = amp * Math.cos(t * 211);
      const L = layoutStr(str);
      const ref = k.text.layout(finalStr, o);
      const cy = k.cy - k.pick({ wide: 40, square: 50, tall: 60 }) * k.u;
      g.save();
      g.translate(ox, oy);
      g.globalAlpha = 1 - exit;
      // shock ring
      const rp = m.seg(t, T_LAND, 0.6);
      if (rp > 0 && rp < 1) {
        const r = ref.width * (0.35 + 0.5 * ease.outExpo(rp));
        g.save();
        g.globalAlpha *= (1 - rp) * (k.isDark ? 0.5 : 0.4);
        k.draw.circle(g, k.cx, cy, r, null, c.accent, 2 * (1 - rp) + 0.6);
        g.restore();
      }
      if (k.isDark) {
        const gl = t < T_LAND ? 0.04 + 0.06 * cp : 0.1 + 0.12 * (1 - m.seg(t, T_LAND, 0.8));
        k.draw.glow(g, k.cx, cy, ref.width * 0.7, c.accent, gl);
      }
      g.translate(k.cx, cy);
      g.scale(sc, sc);
      const landed = t >= T_LAND;
      const numCol = landed ? c.fg : k.color.mix(c.fg, c.muted, 0.35);
      const x0 = -L.width / 2;
      const natW = k.text.layout(str, o).width;
      k.text.glyphs(g, str, 0, 0, { ...o, align: 'center', baseline: 'middle', color: numCol, qaGroup: 'num' }, (i, n, gl) => {
        const it = L.items[i];
        const isSuf = suffix && i >= n - suffix.length;
        // re-centre each glyph on its tabular cell
        const want = x0 + it.x + it.w / 2;
        return { x: want - (gl.x + gl.w / 2 - natW / 2), color: isSuf ? c.accent : undefined };
      });
      g.restore();
      // label
      const lp = ease.outExpo(m.seg(t, 1.0, 0.7));
      const ly = cy + ref.cap * 0.5 + 105 * k.u - exit * 16 * k.u;
      if (lp > 0) {
        const LL = k.text.layout(s.label, lab);
        g.save();
        g.globalAlpha = 1 - exit;
        g.beginPath(); g.rect(0, ly - LL.cap * 1.6, k.W, LL.cap * 3.2); g.clip();
        k.text.draw(g, s.label, k.cx, ly + (1 - lp) * LL.cap * 2, { ...lab, color: c.muted, align: 'center', baseline: 'middle', qaOffstage: lp < 0.99 });
        g.restore();
        const ul = ease.outQuint(m.seg(t, 1.15, 0.6)) * (1 - exit);
        g.fillStyle = c.accent;
        const w = Math.min(LL.width, 220 * k.u) * ul;
        k.draw.rrect(g, k.cx - w / 2, ly + LL.cap + 22 * k.u, w, 3 * k.u, 1.5 * k.u, c.accent);
      }
    },
  };
}
