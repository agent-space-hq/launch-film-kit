// An overlapping avatar stack grows one face at a time (springing in from the right,
// the row re-centring as it grows) while a counter ticks up to the waitlist size.
// A "+N" bubble closes the stack and a "Join them" button lands beneath.
export const meta = {
  id: 'cta.waitlist-counter',
  name: 'Waitlist Counter',
  category: 'cta',
  duration: 4.8,
  summary: 'Initial-avatars pop into an overlapping stack while a tabular counter climbs to copy.waitlist ("N people on the waitlist"; falls back to the first copy.stats entry and its label), a "+N" bubble caps the stack and a "Join them" button springs in; holds.',
  bestFor: ['waitlist', 'social proof', 'end card'],
  slots: ['waitlist', 'stats', 'waitlistCta'],
  params: {
    avatars: { default: 7, min: 3, max: 9, label: 'Avatars in the stack' },
  },
  sfx: [{ t: 0.2, type: 'pop', gain: 0.3 }, { t: 0.3, type: 'type', n: 18, dur: 1.6, gain: 0.25 }, { t: 1.95, type: 'tick', gain: 0.6 }, { t: 2.35, type: 'pop', gain: 0.5 }],
  prompt: `Top row: an overlapping stack of circular initial-avatars (8% of height across, 22% overlap, drawn right-to-left so each face sits on top of the next, a 4 px background-coloured cut ring, fills tinted 30-40% from the palette toward the surface, initials 2.4% of height). Avatar i springs in from 0.6 scale and 20 px to the right (stiffness 300, damping 20) at 0.2 + 1.3 * (i/n)^0.8 s, and the row re-centres continuously from the sum of the pop progress. Beneath, the waitlist number counts from 0 with outExpo between 0.3 and 2.0 s on fixed tabular digit cells (display, 11% of height, weight 650) so it never jitters, with a muted label under it fading up at 0.6 s. At 1.6 s a "+N" bubble (outlined, muted) closes the stack. At 2.3 s a "Join them" accent pill button with an arrow springs in from 0.9 scale (damping 20). Hold about 2.2 s.`,
};

const NAMES = ['AL', 'MR', 'JK', 'SO', 'TN', 'EV', 'RB', 'HC', 'DP'];

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const stats = k.copy('stats', null);
  // honest default: without copy.waitlist, reuse the first stat with its own label
  const wl = k.copy('waitlist', stats && stats[0] ? { value: stats[0].value, suffix: stats[0].suffix || '', label: stats[0].label } : { value: 1200, suffix: '', label: 'people on the waitlist' });
  const label = wl.label || 'people on the waitlist';
  const btn = k.copy('waitlistCta', 'Join them');
  const n = Math.max(3, Math.min(9, p.avatars | 0));
  const times = Array.from({ length: n }, (_, i) => 0.2 + 1.3 * Math.pow(i / n, 0.8));
  const rest = Math.max(0, Math.round(wl.value) - n);
  const restStr = rest >= 1000 ? `+${(rest / 1000).toFixed(rest >= 10000 ? 0 : 1)}k` : `+${rest}`;
  const no = { size: k.pick({ wide: 128, square: 120, tall: 120 }), weight: 650, tracking: -0.04 };
  let cell = 0;
  for (let d = 0; d < 10; d++) cell = Math.max(cell, k.text.layout(String(d), no).width);
  const lo = { role: 'text', size: k.pick({ wide: 38, square: 36, tall: 38 }), weight: 460 };
  const bo = { role: 'text', size: k.pick({ wide: 38, square: 38, tall: 38 }), weight: 620, tracking: -0.01 };

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const hues = [c.accent, c.accent2 || c.accent, c.accent3 || c.accent, c.muted];
      const R = 54 * k.u;
      const step = R * 2 * 0.78;
      // stack
      const pops = times.map((t0) => ease.spring(t - t0, { stiffness: 300, damping: 20 }));
      const bub = ease.spring(t - 1.6, { stiffness: 300, damping: 20 });
      const count = pops.reduce((a, v) => a + m.clamp(v), 0) + m.clamp(bub);
      const rowW = Math.max(0, count - 1) * step + R * 2 + R * 0.3 * m.clamp(bub);
      const sy = k.cy - k.pick({ wide: 190, square: 220, tall: 230 }) * k.u;
      const x0 = k.cx - rowW / 2 + R;
      const items = pops.map((pp, i) => ({ pp, i })).concat([{ pp: bub, i: n, bubble: true }]);
      for (const it of items.slice().reverse()) {
        if (it.pp <= 0) continue;
        const s = m.lerp(0.6, 1, it.pp);
        const x = x0 + it.i * step + (it.bubble ? R * 0.3 : 0) + (1 - m.clamp(it.pp)) * 20 * k.u;
        g.save();
        g.translate(x, sy); g.scale(s, s);
        g.globalAlpha = m.clamp(it.pp * 2);
        k.draw.circle(g, 0, 0, R + 4 * k.u, c.bg);
        if (it.bubble) {
          k.draw.circle(g, 0, 0, R, k.isDark ? C.mix(c.surface, c.fg, 0.05) : '#ffffff', C.alpha(c.fg, 0.2), 1.2);
          const bo2 = { role: 'text', size: 24, weight: 640, tracking: -0.01 };
          bo2.size = Math.min(24, k.text.fit(restStr, bo2, R * 1.6, 18));
          k.text.draw(g, restStr, 0, 0, { ...bo2, color: c.fg, align: 'center', baseline: 'middle' });
        } else {
          const hue = hues[it.i % hues.length];
          k.draw.circle(g, 0, 0, R, C.mix(k.isDark ? c.surface : '#ffffff', hue, k.isDark ? 0.4 : 0.28));
          k.text.draw(g, NAMES[it.i % NAMES.length], 0, 0, { role: 'text', size: 26, weight: 620, color: k.isDark ? C.mix(c.fg, hue, 0.15) : C.mix(c.fg, hue, 0.25), align: 'center', baseline: 'middle', tracking: 0.02 });
        }
        g.restore();
      }
      // counter on tabular cells
      const cp = ease.outExpo(m.seg(t, 0.3, 1.7));
      const val = Math.round(wl.value * cp);
      const str = fmt(val, 0) + (wl.suffix || '');
      const tp = k.text.layout('0', no).trackPx;
      const ws = Array.from(str).map((ch) => (/[0-9]/.test(ch) ? cell : k.text.layout(ch, no).width));
      const totalW = ws.reduce((a, b) => a + b, 0) + tp * (ws.length - 1);
      const natW = k.text.layout(str, no).width;
      const ny = sy + R + k.pick({ wide: 140, square: 150, tall: 150 }) * k.u;
      const na = ease.outCubic(m.seg(t, 0.25, 0.4));
      let acc = -totalW / 2;
      const centers = ws.map((w) => { const cx = acc + w / 2; acc += w + tp; return cx; });
      k.text.glyphs(g, str, k.cx, ny, { ...no, align: 'center', baseline: 'middle', color: c.fg, alpha: na }, (i, nn, gl) => ({ x: centers[i] - (gl.x + gl.w / 2 - natW / 2) }));
      const NL = k.text.layout('0', no);
      const la = ease.outExpo(m.seg(t, 0.6, 0.8));
      const ly = ny + NL.cap / 2 + 56 * k.u;
      k.text.draw(g, label, k.cx, ly + (1 - la) * 12 * k.u, { ...lo, color: c.muted, align: 'center', baseline: 'middle', alpha: la });
      // button
      const bp = ease.spring(t - 2.3, { stiffness: 260, damping: 20 });
      if (bp > 0) {
        const BL = k.text.layout(btn, bo);
        const h = 90 * k.u, icS = 30 * k.u;
        const w = BL.width + icS + 14 * k.u + 72 * k.u;
        const by = ly + 120 * k.u;
        const on = C.contrast('#ffffff', c.accent) >= 3 ? '#ffffff' : C.onColor(c.accent);
        g.save();
        g.translate(k.cx, by); const s = m.lerp(0.9, 1, bp); g.scale(s, s);
        g.globalAlpha = m.clamp(bp * 1.6);
        if (k.isDark) k.draw.glow(g, 0, 0, w * 0.8, c.accent, 0.14);
        k.draw.shadow(g, -w / 2, -h / 2, w, h, h / 2, { blur: 30, y: 12, color: k.isDark ? 'rgba(0,0,0,0.5)' : C.alpha(C.shade(c.accent, -0.2), 0.3) });
        k.draw.rrect(g, -w / 2, -h / 2, w, h, h / 2, c.accent);
        const tx = -(BL.width + 14 * k.u + icS) / 2;
        k.text.draw(g, btn, tx, 0, { ...bo, color: on, baseline: 'middle' });
        k.draw.icon(g, 'arrow-right', tx + BL.width + 14 * k.u + icS / 2, 0, icS, on, { stroke: 2.4 });
        g.restore();
      }
    },
  };
}
