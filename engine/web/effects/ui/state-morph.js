// One continuous container that never cuts: a button grows into a card, the card
// opens into a modal over a dimmed page, and the modal collapses into a toast.
// Geometry, radius and fill interpolate. Content uses a fade-through: the old
// state's content is fully gone before the container starts to move, and the new
// content fades up once the shape has nearly landed, so no label ever rides over a
// morphing surface. Ends held on the toast.
export const meta = {
  id: 'ui.state-morph',
  name: 'State Morph',
  category: 'ui',
  duration: 7.8,
  summary: 'A single container morphs button to card to modal to toast, changing size, radius, fill and content without a cut (content fades through between states, never reflowing mid-move); holds on the toast.',
  bestFor: ['interaction flow', 'design system', 'product polish'],
  slots: ['features'],
  params: {
    project: { default: 'Spring launch', label: 'Project name in the card/modal' },
  },
  sfx: [{ t: 1.42, type: 'click', gain: 0.6 }, { t: 1.8, type: 'whoosh', dur: 0.45, gain: 0.3 }, { t: 3.76, type: 'whoosh', dur: 0.45, gain: 0.3 }, { t: 5.64, type: 'click', gain: 0.6 }, { t: 6.02, type: 'whoosh', dur: 0.45, gain: 0.3 }, { t: 6.62, type: 'pop', gain: 0.5 }],
  prompt: `Keep one rounded container on screen for the whole shot and interpolate its centre, size, corner radius, fill and shadow between four states, each move 550 ms with cubic-bezier(0.3,0,0,1). State 1: accent pill button (92 px tall) springing in at 0 ms, pressed with a 4% dip at 1400 ms. State 2 at 1800 ms: a 34% wide surface card with icon tile, title and skeleton rows. State 3 at 3760 ms: a 52% wide modal over a 45% scrim with a title, three checked feature rows and Cancel / Ship buttons; Ship is pressed at 5620 ms. State 4 at 6020 ms: a short inverse-colour toast in the lower third. Fade-through content: old content fades out in the 150 ms before each move (inCubic), so nothing reflows mid-move; new content rises 12 px over 280 ms once 60% of the move is done. Every state holds its text at least 1.2 s; the toast holds to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const card = dark ? C.mix(c.bg, c.fg, 0.08) : '#ffffff';
  const toastFill = dark ? C.mix(c.bg, c.fg, 0.9) : C.mix('#ffffff', c.fg, 0.9);
  const toastText = C.onColor(toastFill, [c.fg, c.bg, '#ffffff', '#0b0b0c']);
  const onAccent = C.onColor(c.accent);
  const feats = (k.copy('features', null) || ['Roadmap synced', 'Changelog drafted', 'Team approved']).slice(0, 3);
  const line = C.alpha(c.fg, dark ? 0.1 : 0.1);
  const skelC = C.alpha(c.fg, dark ? 0.14 : 0.09);
  const okC = dark ? (c.accent3 || c.accent) : C.shade(c.accent3 || c.accent, -0.1);

  const sw = k.safe.w;
  const btnLab = { role: 'text', size: 34, weight: 600 };
  const btnW = k.text.layout('New release', btnLab).width + 130 * U;
  const S = [
    { cx: k.cx, cy: k.cy, w: btnW, h: 92 * U, r: 46 * U, fill: c.accent },
    { cx: k.cx, cy: k.cy, w: Math.min(660 * U, sw), h: 400 * U, r: 30 * U, fill: card },
    { cx: k.cx, cy: k.cy, w: Math.min(k.pick({ wide: 1000, square: 940, tall: 940 }) * U, sw), h: k.pick({ wide: 590, square: 600, tall: 620 }) * U, r: 34 * U, fill: card },
    { cx: k.cx, cy: k.cy + k.pick({ wide: 300, square: 380, tall: 560 }) * U, w: 0, h: 96 * U, r: 48 * U, fill: toastFill },
  ];
  const toastLab = { role: 'text', size: 30, weight: 560 };
  S[3].w = k.text.layout('Release shipped', toastLab).width + 150 * U;
  const MOVES = [1.8, 3.76, 6.02];
  const MD = 0.55;
  const geom = (t) => {
    let a = S[0], b = S[0], e = 0, idx = 0;
    for (let i = 0; i < MOVES.length; i++) {
      if (t >= MOVES[i]) { idx = i + 1; }
    }
    if (idx === 0) return { ...S[0], state: 0, e: 1 };
    const t0 = MOVES[idx - 1];
    a = S[idx - 1]; b = S[idx];
    e = ease.emphasized(m.seg(t, t0, MD));
    return {
      cx: m.lerp(a.cx, b.cx, e), cy: m.lerp(a.cy, b.cy, e), w: m.lerp(a.w, b.w, e), h: m.lerp(a.h, b.h, e), r: m.lerp(a.r, b.r, e),
      fill: C.mix(a.fill, b.fill, ease.inOutCubic(m.seg(t, t0, MD * 0.8))), state: idx, e, t0,
    };
  };
  // content alpha for state i (0..1)
  const contentA = (t, i) => {
    // fade-through: in once the shape has nearly landed, fully out before the next move starts
    const tin = i === 0 ? 0.15 : MOVES[i - 1] + MD * 0.6;
    const ain = ease.outCubic(m.seg(t, tin, 0.28));
    const aout = i < MOVES.length ? 1 - ease.inCubic(m.seg(t, MOVES[i] - 0.16, 0.15)) : 1;
    return Math.min(ain, aout);
  };

  function content(g, i, G, a, t) {
    const x = G.cx - G.w / 2, y = G.cy - G.h / 2;
    const rise = (1 - a) * 12 * U;
    g.save(); g.globalAlpha *= a; g.translate(0, rise);
    if (i === 0) {
      const L = k.text.layout('New release', btnLab);
      const gx = G.cx - (L.width + 44 * U) / 2;
      k.draw.icon(g, 'plus', gx + 14 * U, G.cy, 30 * U, onAccent, { stroke: 2.4 });
      k.text.draw(g, 'New release', gx + 44 * U, G.cy, { ...btnLab, baseline: 'xmiddle', color: onAccent });
    } else if (i === 1) {
      const ip = 40 * U;
      k.draw.rrect(g, x + ip, y + ip, 76 * U, 76 * U, 20 * U, C.alpha(c.accent, dark ? 0.18 : 0.1));
      k.draw.icon(g, 'rocket', x + ip + 38 * U, y + ip + 38 * U, 40 * U, c.accent, { stroke: 1.9 });
      k.text.draw(g, p.project, x + ip + 100 * U, y + ip + 22 * U, { role: 'display', size: 38, weight: 620, baseline: 'middle' });
      k.text.draw(g, 'Ready to ship', x + ip + 100 * U, y + ip + 62 * U, { role: 'text', size: 24, weight: 460, color: c.muted, baseline: 'middle' });
      for (let j = 0; j < 3; j++) {
        const ry = y + ip + 140 * U + j * 52 * U;
        k.draw.circle(g, x + ip + 10 * U, ry, 8 * U, j === 0 ? okC : skelC);
        k.draw.rrect(g, x + ip + 34 * U, ry - 7 * U, (G.w - ip * 2 - 34 * U) * [0.7, 0.55, 0.62][j], 14 * U, 7 * U, skelC);
      }
      g.fillStyle = line; g.fillRect(x, y + G.h - 92 * U, G.w, Math.max(1, U));
      for (let j = 0; j < 3; j++) k.draw.circle(g, x + ip + 18 * U + j * 28 * U, y + G.h - 46 * U, 18 * U, C.mix([c.accent2, c.accent3, c.accent][j] || c.accent, card, 0.15), card, 3);
      k.draw.rrect(g, x + G.w - ip - 150 * U, y + G.h - 46 * U - 7 * U, 150 * U, 14 * U, 7 * U, skelC);
    } else if (i === 2) {
      const ip = k.pick({ wide: 56, square: 48, tall: 48 }) * U;
      const ts = k.text.fit(`Ship ${p.project}?`, { role: 'display', size: 50, weight: 640 }, G.w - ip * 2);
      k.text.draw(g, `Ship ${p.project}?`, x + ip, y + ip + 26 * U, { role: 'display', size: ts, weight: 640, baseline: 'middle' });
      k.text.draw(g, 'Everything below goes live together.', x + ip, y + ip + 84 * U, { role: 'text', size: 28, weight: 440, color: c.muted, baseline: 'middle' });
      feats.forEach((f, j) => {
        const ry = y + ip + 170 * U + j * 74 * U;
        const ra = ease.outQuint(m.seg(t, MOVES[1] + MD * 0.6 + 0.06 + j * 0.06, 0.45));
        g.save(); g.globalAlpha *= ra; g.translate((1 - ra) * 14 * U, 0);
        k.draw.rrect(g, x + ip, ry - 30 * U, G.w - ip * 2, 60 * U, 14 * U, C.alpha(c.fg, dark ? 0.05 : 0.035));
        k.draw.circle(g, x + ip + 32 * U, ry, 15 * U, C.alpha(okC, 0.18));
        k.draw.icon(g, 'check', x + ip + 32 * U, ry, 20 * U, okC, { stroke: 2.5 });
        k.text.draw(g, f, x + ip + 62 * U, ry, { role: 'text', size: 28, weight: 500, baseline: 'xmiddle' });
        g.restore();
      });
      const bh = 68 * U, by = y + G.h - ip - bh;
      const sl = { role: 'text', size: 28, weight: 600 };
      const shipW = k.text.layout('Ship now', sl).width + 72 * U, canW = k.text.layout('Cancel', sl).width + 64 * U;
      const press = m.seg(t, MOVES[2] - 0.4, 0.08) - m.seg(t, MOVES[2] - 0.32, 0.1);
      g.save();
      const scx = x + G.w - ip - shipW / 2;
      g.translate(scx, by + bh / 2); g.scale(1 - 0.04 * press, 1 - 0.04 * press); g.translate(-scx, -(by + bh / 2));
      k.draw.rrect(g, x + G.w - ip - shipW, by, shipW, bh, bh / 2, c.accent);
      k.text.draw(g, 'Ship now', scx, by + bh / 2, { ...sl, align: 'center', baseline: 'xmiddle', color: onAccent });
      g.restore();
      k.draw.rrect(g, x + G.w - ip - shipW - 16 * U - canW, by, canW, bh, bh / 2, null, C.alpha(c.fg, 0.18), 1.4);
      k.text.draw(g, 'Cancel', x + G.w - ip - shipW - 16 * U - canW / 2, by + bh / 2, { ...sl, align: 'center', baseline: 'xmiddle' });
    } else {
      const L = k.text.layout('Release shipped', toastLab);
      const gx = G.cx - (L.width + 56 * U) / 2;
      const ck = ease.outCubic(m.seg(t, MOVES[2] + MD * 0.6 + 0.1, 0.4));
      k.draw.circle(g, gx + 18 * U, G.cy, 21 * U, okC);
      k.draw.icon(g, 'check', gx + 18 * U, G.cy, 26 * U, C.onColor(okC), { stroke: 2.8, p: ck });
      k.text.draw(g, 'Release shipped', gx + 56 * U, G.cy, { ...toastLab, baseline: 'xmiddle', color: toastText });
    }
    g.restore();
  }

  return {
    draw(g, t) {
      // page context: faint dot grid, dimmed by the modal scrim
      k.draw.dotGrid(g, 40, 1.4, C.alpha(c.fg, dark ? 0.07 : 0.09));
      const G = geom(t);
      const scrim = Math.min(ease.outCubic(m.seg(t, MOVES[1], MD)), 1 - ease.inOutCubic(m.seg(t, MOVES[2], MD)));
      if (scrim > 0) { g.fillStyle = dark ? `rgba(0,0,0,${0.45 * scrim})` : C.alpha(c.fg, 0.12 * scrim); g.fillRect(0, 0, k.W, k.H); }
      // entrance spring for the button, press dip before the first move
      const pop = t < 0.8 ? m.clamp(ease.spring(t, { stiffness: 200, damping: 19 }), 0, 1.2) : 1;
      const press1 = m.seg(t, MOVES[0] - 0.4, 0.08) - m.seg(t, MOVES[0] - 0.32, 0.1);
      const sc = (0.85 + 0.15 * pop) * (1 - 0.04 * press1);
      const a0 = m.clamp(t / 0.2);
      g.save();
      g.globalAlpha *= a0;
      g.translate(G.cx, G.cy); g.scale(sc, sc); g.translate(-G.cx, -G.cy);
      const x = G.cx - G.w / 2, y = G.cy - G.h / 2;
      g.save();
      const big = m.clamp((G.h - 92 * U) / (500 * U));
      g.shadowColor = dark ? `rgba(0,0,0,${0.45 + 0.2 * big})` : `rgba(20,30,60,${0.14 + 0.06 * big})`;
      g.shadowBlur = (24 + 50 * big) * U; g.shadowOffsetY = (10 + 18 * big) * U;
      k.draw.rrect(g, x, y, G.w, G.h, G.r, G.fill);
      g.restore();
      // hairline only on surface states
      const surf = G.state === 0 ? 0 : G.state === 1 ? G.e : G.state === 2 ? 1 : 1 - G.e;
      if (surf > 0.01) k.draw.rrect(g, x, y, G.w, G.h, G.r, null, C.alpha(c.fg, (dark ? 0.12 : 0.08) * surf), 1);
      // inner accent glow on the button (dark only)
      g.save();
      k.draw.rrectPath(g, x, y, G.w, G.h, G.r); g.clip();
      for (let i = 0; i < 4; i++) {
        const a = contentA(t, i);
        if (a > 0.001) content(g, i, G, a, t);
      }
      g.restore();
      g.restore();
    },
  };
}
