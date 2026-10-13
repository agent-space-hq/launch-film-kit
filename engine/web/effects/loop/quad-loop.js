// A 2x2 grid of tiles, each running a small looping icon animation in sync on a shared
// quarter-beat: a progress ring chasing around the mark, a pointer clicking a button,
// a feed stepping up a row per beat, and three approvals ticking in. Labels are the
// brand's features. Everything is periodic in the loop phase, so the loop is seamless.
export const meta = {
  id: 'loop.quad-loop',
  name: 'Quad Loop',
  category: 'loop',
  duration: 4,
  loop: true,
  summary: 'Four feature tiles in a 2x2 grid each run a synced mini-animation (chasing progress ring, pointer click with ripple, feed stepping up, approvals ticking in) under their labels; seamless 4 s loop.',
  bestFor: ['feature overview loop', 'social grid post', 'product summary'],
  slots: ['features'],
  params: {},
  sfx: [{ t: 1.4, type: 'click', gain: 0.4 }, { t: 0.6, type: 'tick', gain: 0.3 }, { t: 1.2, type: 'tick', gain: 0.3 }, { t: 1.8, type: 'tick', gain: 0.3 }],
  prompt: `Lay out a 2x2 grid of rounded tiles (gap 28 px; wide tiles about 1.35:1, tall ones about 1:1.2) with surface fill, hairline border and a 30 px feature label bottom-left. Everything runs off one loop phase (4 s) with events on quarter beats. Tile 1: a progress arc in the accent, 8 px with round caps, chases around a faint track (one turn per loop, length breathing on two sine cycles) with the mark in the middle. Tile 2: a pointer glides to a pill button (inOutCubic), presses it at 35% (button scale 0.96, ripple), the button fills with the accent and shows a check, the pointer leaves, and the state fades back by the end. Tile 3: a feed of placeholder rows steps up one row per beat (standard curve, 40% of a beat) with the newest row's dot in the accent; rows repeat every four so the wrap is invisible. Tile 4: three avatar circles get check badges at 15%, 30% and 45% (outBack), a bar fills to match, everything resets over the last 15%.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const feats = (k.copy('features', null) || ['Track progress', 'Ship in a click', 'Live updates', 'Team sign-off']).slice(0, 4);
  while (feats.length < 4) feats.push('Feature');
  const gap = 28 * k.u;
  let tw, th;
  if (k.isPortrait) { tw = (k.safe.w - gap) / 2; th = Math.min(tw * 1.2, (k.safe.h - gap) / 2); }
  else if (k.isSquareish) { th = (k.safe.h - gap) / 2 * 0.92; tw = Math.min((k.safe.w - gap) / 2, th * 1.1); }
  else { th = (k.safe.h - gap) / 2 * 0.95; tw = Math.min((k.safe.w - gap) / 2, th * 1.35); }
  const gx = k.cx - tw - gap / 2, gy = k.cy - th - gap / 2;
  const tiles = [0, 1, 2, 3].map((i) => ({ x: gx + (i % 2) * (tw + gap), y: gy + Math.floor(i / 2) * (th + gap), label: feats[i] }));
  const labO = { role: 'text', size: k.pick({ wide: 30, square: 28, tall: 30 }), weight: 600, tracking: -0.01 };
  tiles.forEach((T) => { T.size = k.text.fit(T.label, labO, tw - 64 * k.u, 24); });

  function sceneRing(g, A, ph) {
    const c = k.brand.colors, C = k.color;
    const R = Math.min(A.w, A.h) * 0.33, cx = A.x + A.w / 2, cy = A.y + A.h / 2;
    k.draw.circle(g, cx, cy, R, null, C.alpha(c.fg, 0.1), 8);
    const a0 = -Math.PI / 2 + ph * m.TAU;
    const len = m.TAU * (0.32 + 0.14 * Math.sin(ph * m.TAU * 2));
    g.save();
    g.beginPath(); g.arc(cx, cy, R, a0, a0 + len);
    g.strokeStyle = c.accent; g.lineWidth = 8 * k.u; g.lineCap = 'round'; g.stroke();
    g.restore();
    const hx = cx + Math.cos(a0 + len) * R, hy = cy + Math.sin(a0 + len) * R;
    if (k.isDark) k.draw.glow(g, hx, hy, 34 * k.u, c.accent, 0.5);
    k.logo.draw(g, cx, cy, R * 0.9);
  }
  function sceneClick(g, A, ph) {
    const c = k.brand.colors, C = k.color;
    const bw = A.w * 0.5, bh = Math.min(A.h * 0.24, 76 * k.u), bx = A.x + A.w / 2 - bw / 2, by = A.y + A.h / 2 - bh / 2;
    const press = ph >= 0.35 && ph < 0.42 ? 1 - Math.sin(Math.PI * m.seg(ph, 0.35, 0.07)) * 0.04 : 1;
    const on = ease.outCubic(m.seg(ph, 0.36, 0.08)) * (1 - ease.inOutCubic(m.seg(ph, 0.85, 0.13)));
    g.save();
    g.translate(bx + bw / 2, by + bh / 2); g.scale(press, press); g.translate(-(bx + bw / 2), -(by + bh / 2));
    k.draw.rrect(g, bx, by, bw, bh, bh / 2, C.mix(C.alpha(c.fg, 0.08), c.accent, on), C.alpha(c.fg, 0.12 * (1 - on)), 1);
    // idle: two placeholder bars; on: check
    g.globalAlpha = 1 - on;
    k.draw.rrect(g, bx + bw * 0.22, by + bh / 2 - 4 * k.u, bw * 0.56, 8 * k.u, 4 * k.u, C.alpha(c.fg, 0.25));
    g.globalAlpha = on;
    k.draw.icon(g, 'check', bx + bw / 2, by + bh / 2, bh * 0.62, C.onColor(c.accent), { stroke: 2.4 });
    g.restore();
    // ripple + pointer (closed path: starts and ends at the same rest point)
    k.draw.ripple(g, bx + bw / 2, by + bh / 2, m.seg(ph, 0.36, 0.3), c.accent, 60);
    const rest = [A.x + A.w * 0.82, A.y + A.h * 0.86], hit = [bx + bw * 0.58, by + bh * 0.62];
    const goIn = ease.inOutCubic(m.seg(ph, 0.05, 0.28)), goOut = ease.inOutCubic(m.seg(ph, 0.5, 0.35));
    const f = goIn * (1 - goOut);
    k.draw.pointer(g, m.lerp(rest[0], hit[0], f), m.lerp(rest[1], hit[1], f), 1.15);
  }
  function sceneFeed(g, A, ph) {
    const c = k.brand.colors, C = k.color;
    const rh = Math.min(A.h / 4.2, 64 * k.u);
    const q = ph * 4, beat = Math.floor(q);
    const off = (beat + ease.standard(m.seg(q - beat, 0, 0.4))) * rh;
    g.save();
    g.beginPath(); g.rect(A.x, A.y, A.w, A.h); g.clip();
    const top = A.y + A.h / 2 - rh * 1.5;
    const widths = [0.62, 0.45, 0.7, 0.52];
    for (let n = -1; n < 10; n++) {
      const y = top + n * rh - off + rh * 4; // rows scroll up
      if (y < A.y - rh || y > A.y + A.h + rh) continue;
      const idx = ((n % 4) + 4) % 4;
      // fade at the clip edges
      const edge = Math.min(1, (y - A.y) / rh, (A.y + A.h - y) / rh);
      if (edge <= 0) continue;
      const newest = Math.abs(y - (A.y + A.h / 2 + rh * 1.5)) < rh * 0.5;
      g.globalAlpha = Math.max(0, edge);
      k.draw.circle(g, A.x + A.w * 0.14, y, rh * 0.16, newest ? c.accent : C.alpha(c.fg, 0.22));
      k.draw.rrect(g, A.x + A.w * 0.24, y - rh * 0.16, A.w * widths[idx] * 0.85, rh * 0.12, rh * 0.06, C.alpha(c.fg, 0.28));
      k.draw.rrect(g, A.x + A.w * 0.24, y + rh * 0.08, A.w * widths[(idx + 2) % 4] * 0.55, rh * 0.1, rh * 0.05, C.alpha(c.fg, 0.14));
    }
    g.restore();
  }
  function sceneApprove(g, A, ph) {
    const c = k.brand.colors, C = k.color;
    const r = Math.min(A.w / 9, A.h / 5);
    const cy = A.y + A.h * 0.42;
    const reset = 1 - ease.inOutCubic(m.seg(ph, 0.85, 0.13));
    const tones = [C.mix(c.accent, c.surface, 0.55), C.mix(c.fg, c.surface, 0.7), C.mix(c.accent2 || c.accent, c.surface, 0.55)];
    let done = 0;
    for (let i = 0; i < 3; i++) {
      const x = A.x + A.w / 2 + (i - 1) * r * 2.6;
      k.draw.circle(g, x, cy, r, tones[i], C.alpha(c.fg, 0.1), 1);
      k.draw.icon(g, 'user', x, cy, r * 1.15, C.alpha(c.fg, 0.55), { stroke: 1.8 });
      const pop = ease.outBack(m.seg(ph, 0.15 * (i + 1), 0.12)) * reset;
      done += m.seg(ph, 0.15 * (i + 1), 0.12) * reset;
      if (pop > 0.01) {
        const bx = x + r * 0.72, by = cy + r * 0.72, br = r * 0.42 * pop;
        k.draw.circle(g, bx, by, br + 3 * k.u, c.surface);
        k.draw.circle(g, bx, by, br, c.accent);
        k.draw.icon(g, 'check', bx, by, br * 1.4, C.onColor(c.accent), { stroke: 3 });
      }
    }
    const bw = A.w * 0.56, bx = A.x + A.w / 2 - bw / 2, byy = cy + r * 1.9;
    k.draw.rrect(g, bx, byy, bw, 8 * k.u, 4 * k.u, C.alpha(c.fg, 0.1));
    const f = ease.inOutCubic(done / 3);
    if (f > 0.01) k.draw.rrect(g, bx, byy, Math.max(8 * k.u, bw * f), 8 * k.u, 4 * k.u, c.accent);
  }
  const scenes = [sceneRing, sceneClick, sceneFeed, sceneApprove];

  return {
    draw(g, t) {
      const c = k.brand.colors, C = k.color;
      const D = p.duration ?? meta.duration;
      const ph = (((t / D) % 1) + 1) % 1;
      tiles.forEach((T, i) => {
        const r = 30 * k.u;
        if (!k.isDark) k.draw.shadow(g, T.x, T.y, tw, th, r, { blur: 44, y: 18, color: 'rgba(20,30,60,0.12)' });
        k.draw.rrect(g, T.x, T.y, tw, th, r, c.surface, C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);
        const labH = 74 * k.u;
        const A = { x: T.x + 20 * k.u, y: T.y + 20 * k.u, w: tw - 40 * k.u, h: th - labH - 30 * k.u };
        scenes[i](g, A, ph);
        k.text.draw(g, T.label, T.x + 32 * k.u, T.y + th - labH / 2 - 6 * k.u, { ...labO, size: T.size, baseline: 'middle', color: c.fg });
      });
    },
  };
}
