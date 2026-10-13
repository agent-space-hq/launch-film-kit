// A flip-clock DD:HH:MM:SS. Tiles rise in, roll quickly onto the start time, then
// tick live: each change folds the top flap down over the hinge and the new bottom
// flap drops into place. Seconds rolling past zero cascade into the minutes.
export const meta = {
  id: 'cta.launch-countdown',
  name: 'Launch Countdown',
  category: 'cta',
  duration: 5.0,
  summary: 'Split-flap DD:HH:MM:SS tiles rise in, roll onto the start time, then tick each second with true top/bottom flap flips (seconds wrap into minutes); "Launching <copy.launchDate>" sits above. Holds.',
  bestFor: ['launch tease', 'event date', 'end card'],
  slots: ['launchDate', 'countdownFrom'],
  params: {
    from: { default: '07:12:30:02', label: 'Start value DD:HH:MM:SS (demo)' },
  },
  sfx: [{ t: 0.5, type: 'type', n: 12, dur: 0.8, gain: 0.35 }, { t: 1.9, type: 'tick', gain: 0.7 }, { t: 2.9, type: 'tick', gain: 0.7 }, { t: 3.9, type: 'tick', gain: 0.8 }],
  prompt: `Build eight split-flap tiles in four pairs for days, hours, minutes and seconds (wide: one row, tiles 13% x 18% of height; portrait: 2 x 2 groups) with 18 px radius, a 2 px hinge line and a slightly lighter top half; digits are display type at 70% of tile height. Colon dots sit between groups, tracked muted labels under each pair, and "Launching" plus copy.launchDate in the accent above. Tiles rise 4% with outExpo, 40 ms stagger. The clock starts at zeros; from 500 ms each tile makes up to two quick 200 ms flips onto the start value. A flip lasts 380 ms: the old digit's top half folds down about the hinge (scaleY = cos, inCubic, darkening), then the new bottom half unfolds below (outCubic). From 1.9 s it ticks once per second; every changed digit flips, so 00 seconds rolls to 59 and the minutes flip too, and the colons dim briefly on each tick.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const date = k.copy('launchDate', 'Soon');
  const fromStr = String(k.copy('countdownFrom', p.from));
  const parts = fromStr.split(':').map((x) => Math.max(0, parseInt(x, 10) || 0));
  while (parts.length < 4) parts.unshift(0);
  const T0 = parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
  const digitsAt = (T) => {
    T = Math.max(0, T);
    const d = Math.min(99, Math.floor(T / 86400)), h = Math.floor((T % 86400) / 3600), mi = Math.floor((T % 3600) / 60), s = T % 60;
    return [d, h, mi, s].map((v) => String(v).padStart(2, '0')).join('').split('').map(Number);
  };
  const base = digitsAt(T0);
  const TICK0 = 1.9, NT = 4;
  // per tile flip schedule
  const tiles = base.map((target, i) => {
    const flips = [];
    let t = 0.5 + i * 0.05;
    const init = 0;
    let v = 0;
    const seq = [Math.floor(target / 2), target].filter((x, n, a) => x !== 0 && a.indexOf(x) === n);
    for (const nv of seq) { flips.push({ t, from: v, to: nv, dur: 0.2 }); v = nv; t += 0.2; }
    // after the roll v === target
    let prev = target;
    for (let j = 1; j <= NT; j++) {
      const dj = digitsAt(T0 - j)[i];
      if (dj !== prev) { flips.push({ t: TICK0 + (j - 1), from: prev, to: dj, dur: 0.38 }); prev = dj; }
    }
    return { init, flips };
  });
  const labels = k.copy('countdownLabels', ['DAYS', 'HOURS', 'MINUTES', 'SECONDS']);
  const grid = k.isPortrait;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const tw = (grid ? 150 : 138) * k.u * (k.isSquareish && !grid ? 0.9 : 1);
      const th = tw * 1.42;
      const inGap = 10 * k.u, grpGap = (grid ? 90 : 64) * k.u;
      const grpW = tw * 2 + inGap;
      const lblO = { role: 'text', size: 22, weight: 620, tracking: 0.16 };
      const dO = { size: (th * 0.7) / k.u, weight: 600, tracking: 0 };
      // group origins
      const groups = [];
      if (!grid) {
        const tot = grpW * 4 + grpGap * 3;
        for (let i = 0; i < 4; i++) groups.push([k.cx - tot / 2 + i * (grpW + grpGap), k.cy - th / 2 + 40 * k.u]);
      } else {
        const tot = grpW * 2 + grpGap;
        const rowH = th + 120 * k.u;
        for (let i = 0; i < 4; i++) groups.push([k.cx - tot / 2 + (i % 2) * (grpW + grpGap), k.cy - rowH + Math.floor(i / 2) * rowH + 70 * k.u]);
      }
      // header
      const hp = ease.outExpo(m.seg(t, 0.05, 0.8));
      const hy = groups[0][1] - (grid ? 120 : 110) * k.u;
      const hO = { role: 'text', size: k.pick({ wide: 44, square: 42, tall: 44 }), weight: 500 };
      const pre = 'Launching ';
      const PW = k.text.layout(pre, hO).width, DW = k.text.layout(date, { ...hO, weight: 640 }).width;
      const hx = k.cx - (PW + DW) / 2;
      k.text.draw(g, pre.trim(), hx, hy + (1 - hp) * 12 * k.u, { ...hO, color: c.muted, baseline: 'middle', alpha: hp });
      k.text.draw(g, date, hx + PW, hy + (1 - hp) * 12 * k.u, { ...hO, weight: 640, color: c.accent, baseline: 'middle', alpha: hp });
      const tilePos = (i) => {
        const [gx, gy] = groups[Math.floor(i / 2)];
        return [gx + (i % 2) * (tw + inGap), gy];
      };
      const surf = k.isDark ? C.mix(c.surface, c.fg, 0.04) : '#ffffff';
      const surfTop = k.isDark ? C.mix(c.surface, c.fg, 0.07) : C.mix('#ffffff', c.bg, 0.0);
      const surfBot = k.isDark ? surf : C.mix('#ffffff', c.bg, 0.35);
      const r = 18 * k.u;
      const half = (gc, x, y, val, which, sy, shade) => {
        // which: 0 = top half, 1 = bottom half; sy = scaleY about the hinge
        if (sy <= 0.002) return;
        const hy2 = y + th / 2;
        gc.save();
        gc.translate(0, hy2); gc.scale(1, sy); gc.translate(0, -hy2);
        gc.beginPath();
        if (which === 0) gc.rect(x - 2, y - 2, tw + 4, th / 2 + 2); else gc.rect(x - 2, hy2, tw + 4, th / 2 + 2);
        gc.clip();
        k.draw.rrect(gc, x, y, tw, th, r, which === 0 ? surfTop : surfBot);
        if (sy > 0.12) k.text.draw(gc, String(val), x + tw / 2, y + th / 2, { ...dO, color: c.fg, align: 'center', baseline: 'middle', qaGroup: 'tile' + x.toFixed(0), qaOverlap: sy < 0.999 });
        if (shade > 0.002) k.draw.rrect(gc, x, y, tw, th, r, `rgba(0,0,0,${(shade * (k.isDark ? 1 : 0.3)).toFixed(3)})`);
        gc.restore();
      };
      for (let i = 0; i < 8; i++) {
        const [x, y0] = tilePos(i);
        const ip = ease.outExpo(m.seg(t, i * 0.04, 0.8));
        if (ip <= 0) continue;
        const y = y0 + (1 - ip) * k.H * 0.04;
        g.save();
        g.globalAlpha = Math.min(1, ip * 1.4);
        k.draw.shadow(g, x, y, tw, th, r, { blur: 30, y: 12, color: k.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.12)' });
        // state
        const T = tiles[i];
        let cur = T.init, fl = null;
        for (const f of T.flips) { if (t >= f.t) { if (t < f.t + f.dur) { fl = f; break; } cur = f.to; } }
        if (!fl) {
          half(g, x, y, cur, 0, 1, 0);
          half(g, x, y, cur, 1, 1, 0);
        } else {
          const q = (t - fl.t) / fl.dur;
          // static layers: new top, old bottom
          half(g, x, y, fl.to, 0, 1, 0);
          half(g, x, y, fl.from, 1, 1, q > 0.5 ? 0.25 * (1 - (q - 0.5) * 2) : 0.25 * q * 2);
          if (q < 0.5) {
            const a = ease.inCubic(q * 2);
            half(g, x, y, fl.from, 0, Math.cos(a * Math.PI / 2), 0.45 * a);
          } else {
            const b = ease.outCubic((q - 0.5) * 2);
            half(g, x, y, fl.to, 1, Math.sin(b * Math.PI / 2), 0.45 * (1 - b));
          }
        }
        // hinge + border
        g.fillStyle = k.isDark ? c.bg : C.alpha(c.fg, 0.12);
        g.fillRect(x, y + th / 2 - 1 * k.u, tw, 2 * k.u);
        k.draw.rrect(g, x, y, tw, th, r, null, C.alpha(c.fg, k.isDark ? 0.08 : 0.08), 1);
        g.restore();
      }
      // colons + labels
      const tickPh = t >= TICK0 ? (t - TICK0) % 1 : 1;
      const colA = 0.4 + 0.6 * m.smoothstep(0, 0.35, tickPh);
      for (let gi = 0; gi < 4; gi++) {
        const [gx, gy] = groups[gi];
        const la = ease.outExpo(m.seg(t, 0.3 + gi * 0.05, 0.8));
        k.text.draw(g, labels[gi] || '', gx + grpW / 2, gy + th + 44 * k.u, { ...lblO, color: c.muted, align: 'center', baseline: 'middle', alpha: la });
        if (!grid && gi < 3) {
          const cx2 = gx + grpW + grpGap / 2;
          g.save(); g.globalAlpha = la * colA;
          k.draw.circle(g, cx2, gy + th * 0.36, 7 * k.u, c.muted);
          k.draw.circle(g, cx2, gy + th * 0.64, 7 * k.u, c.muted);
          g.restore();
        }
      }
    },
  };
}
