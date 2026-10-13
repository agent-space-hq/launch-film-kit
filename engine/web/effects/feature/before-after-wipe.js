// One panel, two versions. The left of a divider shows the "before": a grey,
// cluttered planning board. The right shows the "after": the same job, clean, with
// the accent. A pointer grabs the divider handle and drags it across, wiping the
// clutter away. Ends held on the clean version with a sliver of before.
export const meta = {
  id: 'feature.before-after-wipe',
  name: 'Before/After Wipe',
  category: 'feature',
  duration: 5,
  summary: 'A pointer drags a divider handle across a panel, wiping a grey cluttered "before" UI into the clean accented "after"; holds on the after state.',
  bestFor: ['transformation', 'old way vs new way', 'redesign'],
  slots: ['before', 'after', 'features'],
  params: {
    from: { default: 0.86, min: 0.5, max: 0.95, label: 'Divider start (fraction)' },
    to: { default: 0.1, min: 0.03, max: 0.5, label: 'Divider end (fraction)' },
  },
  sfx: [{ t: 1.2, type: 'click', gain: 0.5 }, { t: 1.3, type: 'whoosh', dur: 1.2, gain: 0.35 }],
  prompt: `Draw a rounded panel (74% of frame width in 16:9, 88% in portrait). Paint a "before" version clipped left of a vertical divider: a desaturated grey board of jittered, overlapping skeleton cells, sticky notes and a muted warning strip, with a grey "Before" pill holding copy.before. Paint the "after" version clipped right of it: a clean card with the mark, three checked feature rows at 30 px and an accent progress bar, with an accent "After" pill holding copy.after. The divider is a 3 px line with a 64 px circular handle and left/right chevrons. The panel rises in over 600 ms. A pointer glides to the handle (500 ms, inOutCubic), presses at 1.2 s (handle shrinks to 92%, ring), then drags the divider from 86% to 10% of the width over 1300 ms with cubic-bezier(0.2,0,0,1), releases and drifts off. Pills fade as the divider reaches them. Hold on the after state.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const before = k.copy('before', 'The old way');
  const after = k.copy('after', 'The new way');
  const feats = (k.copy('features', null) || ['Roadmap synced', 'Changelog drafted', 'Team approved']).slice(0, 3);
  const pw = Math.min(k.pick({ wide: 1420, square: 960, tall: 960 }) * U, k.safe.w);
  const ph = Math.min(k.pick({ wide: 800, square: 1000, tall: 1240 }) * U, k.H * 0.8);
  const px = k.cx - pw / 2, py = k.cy - ph / 2;
  const R = 30 * U;
  const grey = dark ? '#16171a' : '#e9e8e4';
  const greyCell = dark ? '#202226' : '#f6f5f2';
  const greyBar = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const clean = dark ? C.mix(c.bg, c.fg, 0.06) : '#ffffff';
  const ok = dark ? (c.accent3 || c.accent) : C.shade(c.accent3 || c.accent, -0.1);
  const r = m.rng(21);
  // cluttered cells
  const cells = [];
  const cols = k.isWide ? 7 : 4, rowsN = k.isWide ? 5 : 8;
  for (let j = 0; j < rowsN; j++) for (let i = 0; i < cols; i++) {
    const cw = (pw - 60 * U) / cols, ch = (ph - 150 * U) / rowsN;
    cells.push({ x: px + 30 * U + i * cw + (r() - 0.5) * 14 * U, y: py + 120 * U + j * ch + (r() - 0.5) * 10 * U, w: cw * (0.82 + r() * 0.3), h: ch * (0.7 + r() * 0.25), bars: 1 + Math.floor(r() * 3), warn: r() < 0.12, note: r() < 0.08, rot: (r() - 0.5) * 0.08 });
  }

  function drawBefore(g) {
    k.draw.rrect(g, px, py, pw, ph, R, grey);
    // toolbars
    for (let i = 0; i < 9; i++) k.draw.rrect(g, px + 30 * U + i * 64 * U, py + 30 * U, 48 * U, 26 * U, 6 * U, greyCell);
    for (let i = 0; i < 4; i++) k.draw.rrect(g, px + 30 * U + i * 132 * U, py + 70 * U, 118 * U, 22 * U, 4 * U, greyCell);
    cells.forEach((cl) => {
      g.save();
      g.translate(cl.x + cl.w / 2, cl.y + cl.h / 2); g.rotate(cl.rot); g.translate(-(cl.x + cl.w / 2), -(cl.y + cl.h / 2));
      k.draw.rrect(g, cl.x, cl.y, cl.w, cl.h, 4 * U, cl.note ? (dark ? '#3a3628' : '#efe6c4') : greyCell, dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)', 1);
      for (let b = 0; b < cl.bars; b++) k.draw.rrect(g, cl.x + 10 * U, cl.y + 12 * U + b * 16 * U, cl.w * (0.4 + ((b * 37 + cl.w) % 50) / 100), 8 * U, 3 * U, greyBar);
      if (cl.warn) k.draw.circle(g, cl.x + cl.w - 14 * U, cl.y + 14 * U, 6 * U, dark ? '#7a5a4a' : '#c9a593');
      g.restore();
    });
    // warning strip
    k.draw.rrect(g, px + 30 * U, py + ph - 56 * U, pw * 0.5, 30 * U, 6 * U, dark ? '#2b2420' : '#eedfd6');
  }
  function drawAfter(g, t) {
    k.draw.rrect(g, px, py, pw, ph, R, clean);
    const glowA = dark ? 0.22 : 0.12;
    g.save(); k.draw.rrectPath(g, px, py, pw, ph, R); g.clip();
    k.draw.glow(g, px + pw * 0.85, py + ph * 0.15, pw * 0.5, c.accent, glowA);
    g.restore();
    const ip = k.pick({ wide: 120, square: 110, tall: 110 }) * U;
    const cx0 = k.isWide ? px + pw * 0.36 : px + ip;
    const top = k.isWide ? py + ph * 0.26 : py + ph / 2 - 190 * U;
    k.logo.draw(g, cx0 + 28 * U, top, 56 * U);
    k.text.draw(g, 'Release plan', cx0 + 80 * U, top, { role: 'display', size: 44, weight: 640, baseline: 'middle' });
    feats.forEach((f, i) => {
      const ry = top + 110 * U + i * 84 * U;
      k.draw.rrect(g, cx0, ry - 34 * U, Math.min(560 * U, px + pw - ip - cx0), 68 * U, 18 * U, C.alpha(c.fg, dark ? 0.05 : 0.035));
      k.draw.circle(g, cx0 + 36 * U, ry, 17 * U, C.alpha(ok, 0.2));
      k.draw.icon(g, 'check', cx0 + 36 * U, ry, 22 * U, ok, { stroke: 2.6 });
      k.text.draw(g, f, cx0 + 70 * U, ry, { role: 'text', size: 30, weight: 540, baseline: 'xmiddle' });
    });
    const by = top + 110 * U + feats.length * 84 * U + 10 * U;
    const bw = Math.min(560 * U, px + pw - ip - cx0);
    k.draw.rrect(g, cx0, by, bw, 12 * U, 6 * U, C.alpha(c.fg, dark ? 0.1 : 0.07));
    k.draw.rrect(g, cx0, by, bw * 0.92, 12 * U, 6 * U, c.accent);
  }
  function pill(g, x, y, tag, val, align, accent, a) {
    if (a <= 0.01) return;
    const ts = { role: 'mono', size: 22, weight: 500 }, vs = { role: 'text', size: 30, weight: 620 };
    const w = k.text.layout(tag, ts).width + k.text.layout(val, vs).width + 70 * U, h = 62 * U;
    const x0 = align === 'left' ? x : x - w;
    g.save(); g.globalAlpha *= a;
    const fill = accent ? c.accent : (dark ? '#2a2c31' : '#ffffff');
    const tc = accent ? C.onColor(c.accent) : (dark ? '#d8dade' : '#3a3d44');
    g.save(); g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 20 * U; g.shadowOffsetY = 6 * U;
    k.draw.rrect(g, x0, y, w, h, h / 2, fill);
    g.restore();
    k.text.draw(g, tag, x0 + 26 * U, y + h / 2, { ...ts, color: C.alpha(tc, 0.85), baseline: 'middle' });
    k.text.draw(g, val, x0 + 26 * U + k.text.layout(tag, ts).width + 18 * U, y + h / 2, { ...vs, color: tc, baseline: 'middle' });
    g.restore();
    return w;
  }

  const grabT = 1.2, dragT = 1.32, dragD = 1.3;
  const handleY = py + ph / 2;
  const dragEase = ease.bezier(0.2, 0, 0, 1);

  return {
    draw(g, t) {
      const enter = ease.outQuint(m.seg(t, 0, 0.6));
      const f = m.lerp(p.from, p.to * (k.isWide ? 1 : 0.6), dragEase(m.seg(t, dragT, dragD)));
      const dx = px + pw * f;
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.4);
      g.translate(0, (1 - enter) * 30 * U);
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.16)'; g.shadowBlur = 60 * U; g.shadowOffsetY = 26 * U;
      k.draw.rrect(g, px, py, pw, ph, R, clean);
      g.restore();
      // after (right of divider)
      g.save(); g.beginPath(); g.rect(dx, 0, k.W, k.H); g.clip(); drawAfter(g, t); g.restore();
      // before (left)
      g.save(); g.beginPath(); g.rect(0, 0, dx, k.H); g.clip(); drawBefore(g); g.restore();
      k.draw.rrect(g, px, py, pw, ph, R, null, C.alpha(c.fg, dark ? 0.12 : 0.08), 1);
      // pills
      const pY = py + 26 * U;
      const bl = px + 26 * U;
      const bW = k.text.layout('BEFORE', { role: 'mono', size: 22, weight: 500 }).width + k.text.layout(before, { role: 'text', size: 30, weight: 620 }).width + 70 * U;
      const aW = k.text.layout('AFTER', { role: 'mono', size: 22, weight: 500 }).width + k.text.layout(after, { role: 'text', size: 30, weight: 620 }).width + 70 * U;
      const ar = px + pw - 26 * U;
      pill(g, bl, pY, 'BEFORE', before, 'left', false, m.clamp((dx - (bl + bW) - 10 * U) / (60 * U)));
      pill(g, ar, pY, 'AFTER', after, 'right', true, m.clamp((ar - aW - dx - 10 * U) / (60 * U)));
      // divider + handle
      const held = m.seg(t, grabT - 0.05, 0.1) - m.seg(t, dragT + dragD + 0.05, 0.15);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 12 * U;
      g.fillStyle = dark ? '#ffffff' : C.alpha(c.fg, 0.7);
      g.fillRect(dx - 1.5 * U, py, 3 * U, ph);
      const hr = 32 * U * (1 - 0.08 * held);
      k.draw.circle(g, dx, handleY, hr, '#ffffff');
      g.restore();
      if (!dark) k.draw.circle(g, dx, handleY, hr, null, C.alpha(c.fg, 0.15), 1);
      if (held > 0) k.draw.circle(g, dx, handleY, hr + 8 * U * held, null, C.alpha(c.accent, 0.6 * held), 3);
      k.draw.icon(g, 'chevron-right', dx + 9 * U, handleY, 22 * U, '#1a1c20', { stroke: 2.6 });
      g.save(); g.translate(dx - 9 * U, handleY); g.scale(-1, 1);
      k.draw.icon(g, 'chevron-right', 0, 0, 22 * U, '#1a1c20', { stroke: 2.6 });
      g.restore();
      g.restore();
      // pointer
      const pa = ease.outCubic(m.seg(t, 0.55, 0.3)) * (1 - ease.inCubic(m.seg(t, 3.4, 0.4)));
      if (pa > 0) {
        const ap = ease.inOutCubic(m.seg(t, 0.6, 0.55));
        const sx = px + pw * p.from + 160 * U, sy = handleY + 170 * U;
        let x = m.lerp(sx, dx + 6 * U, ap), y = m.lerp(sy, handleY + 8 * U, ap);
        const away = ease.standard(m.seg(t, dragT + dragD + 0.15, 0.8));
        x += away * 60 * U; y += away * 110 * U;
        g.save(); g.globalAlpha *= pa;
        k.draw.pointer(g, x, y, 1.5 * (1 - 0.1 * held));
        g.restore();
      }
    },
  };
}
