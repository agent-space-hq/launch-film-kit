// A generic assistant chat panel. The user's request types into the composer and is
// sent up into the thread, a typing indicator pulses, then the assistant reply streams
// word by word and finishes with a checklist built from the brand features.
// Ends held on the completed reply.
export const meta = {
  id: 'ui.chat-thread',
  name: 'Chat Thread',
  category: 'ui',
  duration: 6.2,
  summary: 'A message is typed and sent, a three-dot typing indicator pulses, and the assistant reply streams word by word into a growing bubble with a feature checklist; holds at the end.',
  bestFor: ['AI assistant', 'chat feature', 'copilot demo'],
  slots: ['features'],
  params: {
    ask: { default: 'Can you draft our launch checklist?', label: 'User message' },
    reply: { default: 'Done. Here is your checklist, ready to share with the team:', label: 'Assistant reply' },
    wps: { default: 11, min: 5, max: 20, label: 'Streaming speed (words/s)' },
  },
  sfx: [{ t: 0.7, type: 'type', n: 16, dur: 0.9, gain: 0.3 }, { t: 1.7, type: 'whoosh', dur: 0.35, gain: 0.3 }, { t: 2.9, type: 'shimmer', gain: 0.35 }],
  prompt: `Draw a chat panel (56% of frame width in 16:9, 88% in portrait, 30 px radius) with a header (assistant avatar, name, online dot), a thread area and a composer pill with a send button. The panel rises 40 px over 600 ms (outQuint). From 700 ms the user message types into the composer at 36 chars/s; at about 1.7 s the send button dips and the message leaves the composer as a right-aligned accent bubble that rises 40 px over 500 ms (outQuint). A left bubble then shows three dots pulsing in sequence for 800 ms. The reply streams word by word at 11 words/s, each word fading over 160 ms, while the bubble height eases (standard) to fit; three feature rows follow, each with a check that draws on, 140 ms apart. Text is 30 px; hold the finished thread for at least 1.2 s.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const feats = (k.copy('features', null) || ['Roadmap synced', 'Changelog drafted', 'Team approved']).slice(0, 3);
  const panel = dark ? C.mix(c.bg, c.fg, 0.055) : '#ffffff';
  const bubbleA = dark ? C.mix(c.bg, c.fg, 0.11) : C.mix('#ffffff', c.fg, 0.05);
  const line = C.alpha(c.fg, dark ? 0.1 : 0.09);
  const userFill = c.accent;
  const onUser = C.onColor(userFill);
  const ok = dark ? (c.accent3 || c.accent) : C.shade(c.accent3 || c.accent, -0.1);

  const pw = Math.min(k.pick({ wide: 1080, square: 960, tall: 960 }) * U, k.safe.w);
  const px = k.cx - pw / 2;
  let py = 0;
  const headH = 104 * U, compH = 124 * U;
  const ip = 40 * U;
  const fs = k.pick({ wide: 32, square: 30, tall: 32 });
  const msg = { role: 'text', size: fs, weight: 460 };
  const lh = fs * 1.42 * U;
  const maxBW = pw * 0.72;
  const bpx = 28 * U, bpy = 22 * U;
  // user bubble
  const uLines = k.text.wrap(p.ask, msg, maxBW - bpx * 2);
  const uW = Math.max(...uLines.map((l) => k.text.layout(l, msg).width)) + bpx * 2;
  const uH = uLines.length * lh + bpy * 2 - (lh - fs * U);
  const uX = px + pw - ip - uW;
  let uY = headH + 44 * U;
  // assistant bubble
  const avR = 22 * U;
  const aX = px + ip + avR * 2 + 16 * U;
  let aY = uY + uH + 40 * U;
  const aMaxW = pw - ip * 2 - avR * 2 - 16 * U - pw * 0.08;
  const rLines = k.text.balance(p.reply, msg, aMaxW - bpx * 2);
  const words = [];
  rLines.forEach((ln, li) => {
    let x = 0;
    ln.split(' ').forEach((w, wi, arr) => {
      const pre = arr.slice(0, wi).join(' ') + (wi ? ' ' : '');
      x = wi ? k.text.layout(pre, msg).width : 0;
      words.push({ w, li, x, line: ln });
    });
  });
  const rowH = 64 * U;
  const aW = Math.min(aMaxW, Math.max(...rLines.map((l) => k.text.layout(l, msg).width), ...feats.map((f) => k.text.layout(f, msg).width + 56 * U)) + bpx * 2);
  const textH = rLines.length * lh - (lh - fs * U);
  const aHFinal = bpy * 2 + textH + 18 * U + feats.length * rowH;
  const ph = Math.min(Math.max(aY + aHFinal + 70 * U + compH, k.pick({ wide: 0, square: 760, tall: 860 }) * U), k.H * 0.88);
  py = k.cy - ph / 2;
  uY += py; aY += py;

  const typeStart = 0.7, cps = 36;
  const typeEnd = typeStart + p.ask.length / cps;
  const sendT = typeEnd + 0.15;
  const dotsT = sendT + 0.45, streamT = dotsT + 0.8;
  const wordT = (i) => streamT + i / p.wps;
  const rowsT = wordT(words.length) + 0.1;

  return {
    draw(g, t) {
      const enter = ease.outQuint(m.seg(t, 0, 0.6));
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.4);
      g.translate(0, (1 - enter) * 40 * U);
      if (dark) k.draw.glow(g, k.cx, k.cy, Math.max(pw, ph) * 0.7, c.accent, 0.1);
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.14)';
      g.shadowBlur = 70 * U; g.shadowOffsetY = 30 * U;
      k.draw.rrect(g, px, py, pw, ph, 30 * U, panel);
      g.restore();
      k.draw.rrect(g, px, py, pw, ph, 30 * U, null, line, 1);
      // header
      const hcy = py + headH / 2;
      k.draw.circle(g, px + ip + avR, hcy, avR + 2 * U, C.alpha(c.accent, dark ? 0.25 : 0.14));
      k.logo.draw(g, px + ip + avR, hcy, avR * 1.1);
      k.text.draw(g, 'Assistant', px + ip + avR * 2 + 18 * U, hcy - 13 * U, { role: 'text', size: 28, weight: 600, baseline: 'middle' });
      k.draw.circle(g, px + ip + avR * 2 + 26 * U, hcy + 20 * U, 6 * U, ok);
      k.text.draw(g, 'Online', px + ip + avR * 2 + 40 * U, hcy + 20 * U, { role: 'text', size: 22, weight: 460, color: c.muted, baseline: 'middle' });
      g.fillStyle = line; g.fillRect(px, py + headH, pw, Math.max(1, U));
      // composer
      const cy0 = py + ph - compH;
      const cpH = 72 * U, cpX = px + ip, cpW = pw - ip * 2, cpY = cy0 + (compH - cpH) / 2 - 6 * U;
      k.draw.rrect(g, cpX, cpY, cpW, cpH, cpH / 2, C.alpha(c.fg, dark ? 0.06 : 0.04), line, 1);
      const nT = t < sendT ? Math.max(0, Math.min(p.ask.length, Math.floor((t - typeStart) * cps))) : 0;
      const typed = p.ask.slice(0, nT);
      const inS = { role: 'text', size: 26, weight: 450 };
      const maxIn = cpW - 130 * U;
      let shown = typed;
      while (shown && k.text.layout(shown, inS).width > maxIn) shown = shown.slice(1);
      if (shown) k.text.draw(g, shown, cpX + 30 * U, cpY + cpH / 2, { ...inS, baseline: 'xmiddle', qaGroup: 'composer' });
      else k.draw.rrect(g, cpX + 30 * U, cpY + cpH / 2 - 6 * U, 220 * U, 12 * U, 6 * U, C.alpha(c.fg, dark ? 0.12 : 0.08));
      if (t >= typeStart && t < sendT && Math.floor(t * 2.4) % 2 === 0 || (t >= typeStart && t < typeEnd)) {
        const cx1 = cpX + 30 * U + (shown ? k.text.layout(shown, inS).width : 0) + 3 * U;
        if (t < sendT) g.fillStyle = c.accent, g.fillRect(cx1, cpY + cpH / 2 - 16 * U, 2.5 * U, 32 * U);
      }
      const sendR = 26 * U, sx = cpX + cpW - sendR - 10 * U, sy = cpY + cpH / 2;
      const press = m.seg(t, sendT - 0.08, 0.08) - m.seg(t, sendT, 0.15);
      const ready = m.clamp((t - typeStart) * 4);
      k.draw.circle(g, sx, sy, sendR * (1 - 0.1 * press), C.mix(C.alpha(c.fg, 0.2), c.accent, ready * (t < sendT + 0.2 ? 1 : 0.4)));
      k.draw.icon(g, 'arrow-up', sx, sy, 28 * U, '#ffffff', { stroke: 2.4 });
      // user bubble
      if (t >= sendT) {
        const a = ease.outQuint(m.seg(t, sendT, 0.5));
        g.save();
        g.globalAlpha *= Math.min(1, a * 2);
        const ox = uX + uW, oy = uY + uH;
        g.translate(ox, oy + (1 - a) * 40 * U); g.scale(0.96 + 0.04 * a, 0.96 + 0.04 * a); g.translate(-ox, -oy);
        k.draw.rrect(g, uX, uY, uW, uH, 26 * U, userFill);
        uLines.forEach((ln, i) => k.text.draw(g, ln, uX + bpx, uY + bpy + fs * U * 0.78 + i * lh, { ...msg, color: onUser, alpha: m.clamp(a * 1.6 - 0.3) }));
        g.restore();
      }
      // assistant avatar + bubble
      if (t >= dotsT) {
        const a = ease.outQuint(m.seg(t, dotsT, 0.45));
        g.save(); g.globalAlpha *= a;
        k.draw.circle(g, px + ip + avR, aY + avR, avR, C.alpha(c.accent, dark ? 0.25 : 0.14));
        k.logo.draw(g, px + ip + avR, aY + avR, avR * 1.1);
        // bubble size: dots pill -> streamed text
        const nW = m.clamp((t - streamT) * p.wps, 0, words.length);
        const curLine = words.length ? words[Math.max(0, Math.min(words.length - 1, Math.ceil(nW) - 1))].li : 0;
        const growT = ease.standard(m.seg(t, streamT - 0.05, 0.35));
        const rowsP = ease.standard(m.seg(t, rowsT, 0.5));
        const lineH = (curLine + 1) * lh - (lh - fs * U);
        const hText = bpy * 2 + lineH;
        const hDots = 66 * U, wDots = 118 * U;
        let bh = m.lerp(hDots, hText, growT) + (18 * U + feats.length * rowH) * rowsP;
        const bw = m.lerp(wDots, aW, growT);
        k.draw.rrect(g, aX, aY, bw, bh, 26 * U, bubbleA);
        // typing dots
        const da = 1 - m.seg(t, streamT - 0.1, 0.15);
        if (da > 0) {
          for (let i = 0; i < 3; i++) {
            const ph2 = (t - dotsT) * 3.2 - i * 0.22;
            const pulse = 0.5 + 0.5 * Math.max(0, Math.sin(ph2 * Math.PI));
            k.draw.circle(g, aX + 34 * U + i * 25 * U, aY + hDots / 2 - pulse * 5 * U, 7 * U, C.alpha(c.fg, (0.3 + 0.5 * pulse) * da));
          }
        }
        // words
        words.forEach((wd, i) => {
          const wa = ease.outCubic(m.seg(t, wordT(i), 0.16));
          if (wa <= 0) return;
          k.text.draw(g, wd.w, aX + bpx + wd.x, aY + bpy + fs * U * 0.78 + wd.li * lh, { ...msg, alpha: wa, qaGroup: 'reply' + wd.li });
        });
        // checklist rows
        feats.forEach((f, i) => {
          const ra = ease.outCubic(m.seg(t, rowsT + 0.1 + i * 0.14, 0.35));
          if (ra <= 0) return;
          const ry = aY + bpy + textH + 18 * U + i * rowH + rowH / 2;
          g.save(); g.globalAlpha *= ra; g.translate((1 - ra) * 12 * U, 0);
          k.draw.circle(g, aX + bpx + 16 * U, ry, 16 * U, C.alpha(ok, 0.18));
          k.draw.icon(g, 'check', aX + bpx + 16 * U, ry, 22 * U, ok, { stroke: 2.6, p: ease.outCubic(m.seg(t, rowsT + 0.2 + i * 0.14, 0.35)) });
          k.text.draw(g, f, aX + bpx + 48 * U, ry, { ...msg, weight: 540, baseline: 'xmiddle' });
          g.restore();
        });
        g.restore();
      }
      g.restore();
    },
  };
}
