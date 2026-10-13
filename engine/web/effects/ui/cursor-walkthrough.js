// A release card settles in. A pointer glides along a curved path to the primary
// button, the button takes its hover state, the click lands with a press and a ripple,
// and the UI answers: the button turns into a confirmed state, the status pill flips
// to Live and a toast rises. Ends held on the confirmed state.
export const meta = {
  id: 'ui.cursor-walkthrough',
  name: 'Cursor Walkthrough',
  category: 'ui',
  duration: 5,
  summary: 'A pointer glides on a bezier to a button, hovers, clicks with a ripple, and the card switches to its published state with a toast; holds on the final state.',
  bestFor: ['feature demo', 'one-click flow', 'product walkthrough'],
  slots: ['features'],
  params: {
    action: { default: 'Publish release', label: 'Button label' },
    done: { default: 'Published', label: 'Confirmed label' },
    toast: { default: 'Your release is live', label: 'Toast text' },
  },
  sfx: [{ t: 2.3, type: 'click', gain: 0.8 }, { t: 2.75, type: 'pop', gain: 0.5 }],
  prompt: `Centre a release card (52% of frame width in 16:9, 88% in portrait, 26 px radius, hairline border): title plus a grey "Draft" pill, three checked rows, and a footer with an avatar stack and a primary button. The card rises 40 px and fades in over 800 ms (outQuint); rows stagger 70 ms. At 900 ms a pointer enters from the lower right and follows a cubic bezier for 1100 ms (inOutCubic) to the button. On arrival the button lightens and lifts 2 px over 200 ms. The click at 2300 ms presses the button to 96% for 120 ms, and an accent ripple expands for 600 ms. The label crossfades to a check plus "Published", the button width springs (damping 20) and turns green, the pill flips to "Live", and at 2700 ms a toast rises 60 px from below (emphasized, 600 ms). Pointer eases away; hold to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const DUR = p.duration ?? meta.duration;
  const P = {
    card: dark ? C.mix(c.bg, c.fg, 0.07) : '#ffffff',
    line: C.alpha(c.fg, dark ? 0.1 : 0.1),
    skel: C.alpha(c.fg, dark ? 0.14 : 0.09),
    fg: c.fg, muted: c.muted, accent: c.accent,
    ok: c.accent3 || c.accent,
  };
  const onAccent = C.onColor(c.accent);
  const okFill = dark ? P.ok : C.shade(P.ok, -0.13);
  const onOk = C.onColor(okFill);
  const feats = (k.copy('features', null) || ['Roadmap synced', 'Changelog drafted', 'Team approved']).slice(0, 3);

  const cardW = Math.min(k.pick({ wide: 1100, square: 940, tall: 940 }) * U, k.safe.w);
  const headH = 132 * U, rowH = 84 * U, footH = 136 * U;
  const cardH = headH + rowH * feats.length + footH;
  const cardX = k.cx - cardW / 2;
  const cardY = k.cy - cardH / 2 - k.pick({ wide: 50, square: 70, tall: 90 }) * U;
  const pad = 44 * U;
  const btnH = 68 * U;
  const btnLab = { role: 'text', size: 28, weight: 600 };
  const w0 = k.text.layout(p.action, btnLab).width + 64 * U;
  const w1 = k.text.layout(p.done, btnLab).width + 64 * U + 40 * U;
  const btnR = cardX + cardW - pad; // right edge
  const btnCy = cardY + cardH - footH / 2;
  const target = [btnR - w0 * 0.42, btnCy + 6 * U];
  const start = [k.W - k.pick({ wide: 260, square: 150, tall: 140 }) * U, k.H - k.pick({ wide: 120, square: 160, tall: 260 }) * U];
  const ctrl1 = [start[0] - 40 * U, start[1] - 330 * U];
  const ctrl2 = [target[0] + 260 * U, target[1] + 40 * U];
  const bez = (a, b, cc, d, s) => {
    const i = 1 - s;
    return [i * i * i * a[0] + 3 * i * i * s * b[0] + 3 * i * s * s * cc[0] + s * s * s * d[0], i * i * i * a[1] + 3 * i * i * s * b[1] + 3 * i * s * s * cc[1] + s * s * s * d[1]];
  };
  const T = { move: 0.9, arrive: 2.0, click: 2.3, swap: 2.45, toast: 2.75 };

  return {
    draw(g, t) {
      // ---------- card ----------
      const enter = ease.outQuint(m.seg(t, 0, 0.8));
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.3);
      g.translate(0, (1 - enter) * 40 * U);
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.14)';
      g.shadowBlur = 60 * U; g.shadowOffsetY = 26 * U;
      k.draw.rrect(g, cardX, cardY, cardW, cardH, 26 * U, P.card);
      g.restore();
      k.draw.rrect(g, cardX, cardY, cardW, cardH, 26 * U, null, P.line, 1);
      // header
      const live = ease.outCubic(m.seg(t, T.swap + 0.05, 0.3));
      k.text.draw(g, 'Spring launch', cardX + pad, cardY + headH / 2 + 4 * U, { role: 'display', size: k.pick({ wide: 46, square: 42, tall: 42 }), weight: 620, baseline: 'middle' });
      // status pill (crossfade draft -> live)
      const pillCx = cardX + cardW - pad - 66 * U, pillCy = cardY + headH / 2 + 4 * U;
      const pw = 132 * U, ph = 44 * U;
      const pillFill = C.mix(C.alpha(c.fg, dark ? 0.1 : 0.07), C.alpha(P.ok, dark ? 0.2 : 0.14), live);
      k.draw.rrect(g, pillCx - pw / 2, pillCy - ph / 2, pw, ph, ph / 2, pillFill);
      const outA = 1 - ease.inCubic(m.seg(t, T.swap - 0.05, 0.15));
      const inA = ease.outCubic(m.seg(t, T.swap + 0.12, 0.25));
      if (outA > 0) {
        k.draw.circle(g, pillCx - 32 * U, pillCy, 6 * U, C.alpha(c.fg, 0.4 * outA));
        k.text.draw(g, 'Draft', pillCx - 18 * U, pillCy, { role: 'text', size: 22, weight: 560, color: P.muted, baseline: 'middle', alpha: outA });
      }
      if (inA > 0) {
        const okText = dark ? P.ok : C.shade(P.ok, -0.12);
        k.draw.circle(g, pillCx - 28 * U, pillCy, 6 * U * (0.6 + 0.4 * inA), okText);
        if (inA > 0.5) k.draw.circle(g, pillCx - 28 * U, pillCy, 6 * U + 10 * U * m.seg(t, T.swap + 0.2, 0.7), null, C.alpha(okText, 0.6 * (1 - m.seg(t, T.swap + 0.2, 0.7))), 2);
        k.text.draw(g, 'Live', pillCx - 12 * U, pillCy, { role: 'text', size: 22, weight: 600, color: okText, baseline: 'middle', alpha: inA });
      }
      g.fillStyle = P.line; g.fillRect(cardX, cardY + headH, cardW, Math.max(1, U));
      // rows
      feats.forEach((f, i) => {
        const a = ease.outQuint(m.seg(t, 0.25 + i * 0.07, 0.7));
        const ry = cardY + headH + i * rowH + rowH / 2;
        g.save(); g.globalAlpha *= a; g.translate((1 - a) * 18 * U, 0);
        k.draw.circle(g, cardX + pad + 16 * U, ry, 16 * U, C.alpha(P.ok, dark ? 0.18 : 0.14));
        k.draw.icon(g, 'check', cardX + pad + 16 * U, ry, 22 * U, dark ? P.ok : C.shade(P.ok, -0.1), { stroke: 2.4 });
        k.text.draw(g, f, cardX + pad + 52 * U, ry, { role: 'text', size: 30, weight: 500, baseline: 'xmiddle' });
        k.draw.rrect(g, cardX + cardW - pad - 120 * U, ry - 6 * U, 120 * U, 12 * U, 6 * U, P.skel);
        g.restore();
      });
      g.fillStyle = P.line; g.fillRect(cardX, cardY + cardH - footH, cardW, Math.max(1, U));
      // footer avatars
      const avCols = [c.accent2 || c.accent, c.accent3 || c.accent, C.mix(c.accent, c.fg, 0.3)];
      avCols.forEach((col, i) => {
        const ax = cardX + pad + 22 * U + i * 32 * U;
        k.draw.circle(g, ax, btnCy, 24 * U, P.card);
        k.draw.circle(g, ax, btnCy, 21 * U, C.mix(col, P.card, 0.15));
      });
      k.draw.rrect(g, cardX + pad + 140 * U, btnCy - 7 * U, k.pick({ wide: 150, square: 120, tall: 110 }) * U, 14 * U, 7 * U, P.skel);
      // ---------- button ----------
      const hover = ease.standard(m.seg(t, T.arrive - 0.15, 0.2));
      const press = m.seg(t, T.click - 0.06, 0.06) - ease.outCubic(m.seg(t, T.click + 0.06, 0.2));
      const morph = m.clamp(ease.spring(t - T.swap, { stiffness: 260, damping: 22 }), 0, 1.08);
      const okMix = ease.outCubic(m.seg(t, T.swap, 0.35));
      const bw = m.lerp(w0, w1, morph);
      const sc = 1 - 0.04 * m.clamp(press, 0, 1);
      const lift = -2 * U * hover * (1 - okMix);
      const bx = btnR - bw, by = btnCy - btnH / 2 + lift;
      g.save();
      g.translate(bx + bw / 2, btnCy); g.scale(sc, sc); g.translate(-(bx + bw / 2), -btnCy);
      const base = C.mix(c.accent, okFill, okMix);
      const fill = C.mix(base, '#ffffff', 0.12 * hover * (1 - okMix));
      g.save();
      g.shadowColor = C.alpha(base, dark ? 0.5 : 0.35); g.shadowBlur = (18 + 10 * hover) * U; g.shadowOffsetY = (6 + 4 * hover) * U;
      k.draw.rrect(g, bx, by, bw, btnH, btnH / 2, fill);
      g.restore();
      const txtCol = C.mix(onAccent, onOk, okMix);
      if (outA > 0) k.text.draw(g, p.action, bx + bw / 2, by + btnH / 2, { ...btnLab, align: 'center', baseline: 'xmiddle', color: txtCol, alpha: outA });
      if (inA > 0) {
        const L = k.text.layout(p.done, btnLab);
        const gx = bx + bw / 2 - (L.width + 40 * U) / 2;
        k.draw.icon(g, 'check', gx + 13 * U, by + btnH / 2, 28 * U, txtCol, { p: ease.outCubic(m.seg(t, T.swap + 0.15, 0.35)), stroke: 2.6 });
        k.text.draw(g, p.done, gx + 40 * U, by + btnH / 2, { ...btnLab, baseline: 'xmiddle', color: txtCol, alpha: inA });
      }
      g.restore();
      g.restore();

      // ---------- toast ----------
      const tp = ease.emphasized(m.seg(t, T.toast, 0.6));
      if (tp > 0) {
        const msg = p.toast;
        const tl = { role: 'text', size: 28, weight: 540 };
        const tw = k.text.layout(msg, tl).width + 120 * U, th = 76 * U;
        const tx = k.cx - tw / 2;
        const ty = Math.min(cardY + cardH + k.pick({ wide: 56, square: 70, tall: 90 }) * U, k.safe.y + k.safe.h - th) + (1 - tp) * 60 * U;
        g.save();
        g.globalAlpha *= Math.min(1, tp * 1.5);
        const tf = dark ? C.mix(c.bg, c.fg, 0.14) : C.mix('#ffffff', c.fg, 0.88);
        g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 40 * U; g.shadowOffsetY = 16 * U;
        k.draw.rrect(g, tx, ty, tw, th, th / 2, tf);
        g.restore();
        g.save(); g.globalAlpha *= Math.min(1, tp * 1.5);
        if (dark) k.draw.rrect(g, tx, ty, tw, th, th / 2, null, C.alpha(c.fg, 0.12), 1);
        k.draw.circle(g, tx + 44 * U, ty + th / 2, 18 * U, P.ok);
        k.draw.icon(g, 'check', tx + 44 * U, ty + th / 2, 22 * U, C.onColor(P.ok), { stroke: 2.6 });
        k.text.draw(g, msg, tx + 78 * U, ty + th / 2, { ...tl, baseline: 'xmiddle', color: C.onColor(tf, [c.fg, c.bg, '#ffffff', '#0b0b0c']) });
        g.restore();
      }

      // ---------- pointer ----------
      const mv = ease.inOutCubic(m.seg(t, T.move, T.arrive - T.move));
      const away = ease.standard(m.seg(t, 3.0, 0.9));
      if (t >= T.move - 0.3) {
        let [px, py] = bez(start, ctrl1, ctrl2, target, mv);
        px += away * 70 * U; py += away * 90 * U;
        const appear = ease.outCubic(m.seg(t, T.move - 0.3, 0.3));
        // ripple at click point
        k.draw.ripple(g, target[0], target[1], m.seg(t, T.click, 0.6), dark ? '#ffffff' : c.accent, 54);
        const pressS = 1 - 0.12 * m.clamp(press, 0, 1);
        g.save(); g.globalAlpha *= appear;
        k.draw.pointer(g, px, py, 1.5 * pressS);
        g.restore();
      }
    },
  };
}
