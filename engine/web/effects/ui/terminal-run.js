// A terminal window rises in; a deploy command types itself with a caret, output
// lines stream with spinners that resolve to checks, an upload bar fills with a
// counting percentage, and a green check lands on the live URL. Ends held with a
// fresh, blinking prompt.
export const meta = {
  id: 'ui.terminal-run',
  name: 'Terminal Run',
  category: 'ui',
  duration: 5.4,
  summary: 'A command types into a code-drawn terminal, steps stream and resolve, a progress bar fills and a green check lands on the live URL; holds on the result.',
  bestFor: ['developer tool', 'CLI launch', 'deploy flow'],
  slots: ['url'],
  params: {
    command: { default: null, label: 'Command (defaults to "<brand> ship --prod")' },
    cps: { default: 26, min: 10, max: 60, label: 'Typing speed (chars/s)' },
  },
  sfx: [{ t: 0.55, type: 'type', n: 18, dur: 0.75, gain: 0.35 }, { t: 1.45, type: 'click', gain: 0.4 }, { t: 3.75, type: 'pop', gain: 0.6 }],
  prompt: `Draw a terminal window (68% of frame width in 16:9, 88% in portrait, 18 px radius, plain chrome with a path label) that rises 40 px and fades in over 600 ms with outQuint. Mono text at 32 px, line height 1.7. From 550 ms the command types at 26 characters per second behind a solid block caret; Enter at about 1450 ms. Four step lines then stream 200 ms apart, each showing a rotating arc spinner for 300 ms before an outBack-scaled check replaces it. From 2.55 s an upload bar (40% of the window width) fills over 1.1 s with inOutCubic while the percentage counts to 100. At 3.75 s a filled green circle with a check springs in (damping 18) beside "Live at" and the URL in the accent. A new prompt line blinks its caret at 1 Hz to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const cmd = p.command || `${(k.brand.name || 'app').toLowerCase().replace(/\s+/g, '-')} ship --prod`;
  const url = k.copy('url', 'example.app');
  const steps = ['Linking roadmap', 'Bundling release notes', 'Running checks', 'Signing build'];
  const termBg = dark ? C.mix(c.bg, c.fg, 0.045) : '#ffffff';
  const barBg = dark ? C.mix(c.bg, c.fg, 0.08) : C.mix('#ffffff', c.fg, 0.04);
  const ok = dark ? (c.accent3 || c.accent) : C.shade(c.accent3 || c.accent, -0.1);
  const accentText = dark ? C.mix(c.accent, '#ffffff', 0.2) : C.shade(c.accent, -0.05);

  const winW = Math.min(k.pick({ wide: 1440, square: 960, tall: 960 }) * U, k.safe.w);
  const fs = k.pick({ wide: 32, square: 29, tall: 30 });
  const lh = fs * 1.75 * U;
  const nLines = 9;
  const pad = 44 * U, bar = 56 * U;
  const winH = bar + pad * 2 + lh * (nLines - 1) + fs * U;
  const winX = k.cx - winW / 2, winY = k.cy - winH / 2;
  const mono = { role: 'mono', size: fs, weight: 450 };
  const chW = k.text.layout('0', mono).width;
  const typeStart = 0.55;
  const typeEnd = typeStart + cmd.length / p.cps;
  const enterT = typeEnd + 0.12;
  const stepT = (i) => enterT + 0.18 + i * 0.2;
  const progT = stepT(steps.length) + 0.15, progD = 1.1;
  const doneT = progT + progD + 0.1;

  return {
    draw(g, t) {
      const DUR = p.duration ?? meta.duration;
      const enter = ease.outQuint(m.seg(t, 0, 0.6));
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.4);
      g.translate(0, (1 - enter) * 40 * U);
      if (dark) k.draw.glow(g, k.cx, k.cy + winH * 0.2, winW * 0.7, c.accent, 0.1);
      k.draw.browser(g, winX, winY, winW, winH, { fill: termBg, bar: 56, url: false, dark });
      const path = '~/launch';
      k.text.draw(g, path, k.cx, winY + bar / 2, { role: 'mono', size: 22, weight: 450, color: c.muted, align: 'center', baseline: 'xmiddle' });
      const x0 = winX + pad;
      const ly = (i) => winY + bar + pad + fs * U * 0.8 + i * lh;
      const blink = (tt) => (Math.floor(tt * 2) % 2 === 0 ? 1 : 0);
      // line 0: prompt + typed command
      const promptW = k.text.layout('~ ', mono).width;
      k.text.draw(g, '~', x0, ly(0), { ...mono, color: accentText });
      k.text.draw(g, '$', x0 + chW * 2, ly(0), { ...mono, color: c.muted });
      const nT = Math.max(0, Math.min(cmd.length, Math.floor((t - typeStart) * p.cps)));
      const typed = cmd.slice(0, nT);
      const cx0 = x0 + chW * 4;
      if (typed) k.text.draw(g, typed, cx0, ly(0), { ...mono, color: c.fg, qaGroup: 'cmd' });
      const caretOn = t < enterT ? (t < typeStart ? blink(t) : 1) : 0;
      const caretX = cx0 + k.text.layout(typed || ' ', mono).width * (typed ? 1 : 0);
      if (caretOn) k.draw.rrect(g, caretX + 2 * U, ly(0) - fs * U * 0.78, chW * 0.95, fs * U * 1.0, 2 * U, C.alpha(c.fg, 0.85));
      // steps
      steps.forEach((s, i) => {
        const t0 = stepT(i);
        if (t < t0) return;
        const a = ease.outCubic(m.seg(t, t0, 0.18));
        const y = ly(1 + i) - fs * U * 0.32;
        const ix = x0 + chW * 0.6;
        const doneP = m.seg(t, t0 + 0.3, 0.25);
        g.save(); g.globalAlpha *= a;
        if (doneP <= 0) {
          const ang = (t - t0) * 9;
          g.beginPath(); g.arc(ix, y, 9 * U, ang, ang + Math.PI * 1.4);
          g.strokeStyle = c.muted; g.lineWidth = 2.4 * U; g.lineCap = 'round'; g.stroke();
        } else {
          const s2 = ease.outBack(doneP);
          k.draw.icon(g, 'check', ix, y, 26 * U * s2, ok, { stroke: 2.6 });
        }
        g.restore();
        k.text.draw(g, s, x0 + chW * 2, ly(1 + i), { ...mono, color: doneP > 0.5 ? c.fg : c.muted, alpha: a });
      });
      // progress line
      if (t >= progT - 0.1) {
        const a = ease.outCubic(m.seg(t, progT - 0.1, 0.2));
        const pr = ease.inOutCubic(m.seg(t, progT, progD));
        const y = ly(1 + steps.length);
        k.text.draw(g, 'Uploading', x0 + chW * 2, y, { ...mono, color: c.muted, alpha: a });
        const bx = x0 + chW * 13, bw = Math.min(winW * 0.4, winX + winW - pad - bx - chW * 6), bh = 14 * U;
        g.save(); g.globalAlpha *= a;
        k.draw.rrect(g, bx, y - fs * U * 0.32 - bh / 2, bw, bh, bh / 2, C.alpha(c.fg, dark ? 0.12 : 0.08));
        if (pr > 0) {
          k.draw.rrect(g, bx, y - fs * U * 0.32 - bh / 2, Math.max(bh, bw * pr), bh, bh / 2, c.accent);
          if (dark && pr < 1) k.draw.glow(g, bx + bw * pr, y - fs * U * 0.32, 26 * U, c.accent, 0.6);
        }
        g.restore();
        const pct = `${Math.round(pr * 100)}%`;
        k.text.draw(g, pct, bx + bw + chW * 5, y, { ...mono, align: 'right', color: pr >= 1 ? c.fg : c.muted, alpha: a, qaGroup: 'pct' });
      }
      // done line
      if (t >= doneT) {
        const sp = m.clamp(ease.spring(t - doneT, { stiffness: 240, damping: 18 }), 0, 1.15);
        const a = ease.outCubic(m.seg(t, doneT, 0.2));
        const y = ly(3 + steps.length);
        const ix = x0 + chW * 0.6, iy = y - fs * U * 0.32;
        g.save();
        g.translate(ix, iy); g.scale(sp, sp); g.translate(-ix, -iy);
        if (dark) k.draw.glow(g, ix, iy, 44 * U, ok, 0.5);
        k.draw.circle(g, ix, iy, 13 * U, ok);
        k.draw.icon(g, 'check', ix, iy, 18 * U, C.onColor(ok), { stroke: 3 });
        g.restore();
        const lw = k.text.layout('Live at ', mono).width;
        k.text.draw(g, 'Live at', x0 + chW * 2.4, y, { ...mono, weight: 560, color: c.fg, alpha: a });
        k.text.draw(g, `https://${url}`, x0 + chW * 2.4 + lw, y, { ...mono, weight: 560, color: accentText, alpha: a });
        const ua = ease.outCubic(m.seg(t, doneT + 0.25, 0.5));
        const uw = k.text.layout(`https://${url}`, mono).width;
        g.fillStyle = C.alpha(accentText, 0.6 * ua);
        g.fillRect(x0 + chW * 2.4 + lw, y + 6 * U, uw * ua, 2 * U);
        // fresh prompt
        if (t >= doneT + 0.35) {
          const y2 = ly(4 + steps.length);
          k.text.draw(g, '~', x0, y2, { ...mono, color: accentText });
          k.text.draw(g, '$', x0 + chW * 2, y2, { ...mono, color: c.muted });
          if (blink(t - doneT - 0.35)) k.draw.rrect(g, x0 + chW * 4 + 2 * U, y2 - fs * U * 0.78, chW * 0.95, fs * U, 2 * U, C.alpha(c.fg, 0.85));
        }
      }
      g.restore();
    },
  };
}
