// Generic notification cards pop onto the frame faster and faster until it is
// buried. Everything freezes for a beat, the pile blows outward from the centre,
// and a single calm line (the headline) rises in the cleared space.
export const meta = {
  id: 'hook.notification-flood',
  name: 'Notification Flood',
  category: 'hook',
  duration: 5.0,
  summary: 'Notification cards (icon, title, line, time) spring onto the frame at an accelerating rate until it is full, freeze, then blow outward and leave the headline alone on a clean frame; holds on the headline.',
  bestFor: ['cold open', 'pain point', 'noise vs calm'],
  slots: ['headline', 'notifications'],
  params: {
    count: { default: 34, min: 12, max: 60, label: 'Cards' },
    flood: { default: 2.35, min: 1.5, max: 3, label: 'Flood ends at (s)' },
  },
  sfx: [{ t: 0.0, type: 'pop', gain: 0.4 }, { t: 0.4, type: 'type', n: 26, dur: 1.9, gain: 0.35 }, { t: 2.65, type: 'whoosh', dur: 0.5, gain: 0.5 }, { t: 3.0, type: 'swell', dur: 0.9, gain: 0.35 }],
  prompt: `Generic notification cards (27% of frame width, 10% of height, 24 px radius, surface fill, hairline, soft shadow) each hold a tinted 56 px icon tile, a bold 26 px title, a 22 px muted line and a time stamp. Frame 0 already shows three cards near centre. Card i appears at -0.3 + 2.65 * (i/N)^0.6 s, so arrivals accelerate; it pops on a spring (stiffness 320, damping 20) from 0.86 scale and 3% higher. Positions come from a seeded, shuffled jittered grid covering the frame; later cards tilt up to 4 degrees. The camera pushes in 3.5% during the flood. At 2.35 s everything freezes for 300 ms and dims 28%; then each card flies radially out by 60% of the frame in 380 ms (inCubic), staggered by distance from centre. At 2.95 s the headline rises word by word from a baseline mask (outExpo, 800 ms, 60 ms stagger) and holds about 1.8 s.`,
};

const DEFAULTS = [
  ['bell', 'Reminder', 'Launch review moved to 9:00', 'now'],
  ['chat', 'New comment', 'Can we cut scope again?', '1m'],
  ['mail', 'Inbox', '14 unread threads', '2m'],
  ['calendar', 'Calendar', 'Three meetings overlap', 'now'],
  ['code', 'Build failed', 'Pipeline stopped at step 4', '4m'],
  ['users', 'Review requested', 'Two approvals pending', 'now'],
  ['bolt', 'Heads up', 'Deadline moved up a week', '3m'],
  ['file', 'Doc updated', 'Launch plan, version 12', '6m'],
  ['clock', 'Due today', 'Release notes draft', 'now'],
  ['refresh', 'Sync conflict', 'Changes could not merge', '1m'],
];

export function create(k, p) {
  const { ease, m, color: C } = k;
  const items = k.copy('notifications', null) || DEFAULTS;
  const headline = k.copy('headline', 'Launch day, without the crunch.');
  const r = m.rng(17);
  const cw = k.pick({ wide: 520, square: 500, tall: 520 }) * k.u;
  const ch = 108 * k.u;
  // jittered grid covering the frame
  const cols = Math.max(2, Math.round(k.W / (cw * 0.62)));
  const rows = Math.max(3, Math.round(k.H / (ch * 1.15)));
  const cells = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push([(x + 0.5) / cols, (y + 0.5) / rows]);
  const order = r.shuffle(cells);
  const N = Math.max(p.count | 0, Math.min(60, Math.round(cells.length * 1.05) + 3));
  const cards = [];
  for (let i = 0; i < N; i++) {
    let px, py;
    if (i < 3) { px = 0.5 + (i - 1) * 0.06; py = 0.5 + (i - 1) * 0.16; }
    else {
      const cell = order[(i - 3) % order.length];
      px = cell[0] + (r() - 0.5) * (0.8 / cols);
      py = cell[1] + (r() - 0.5) * (0.8 / rows);
    }
    const x = px * k.W, y = py * k.H;
    const t0 = -0.3 + (p.flood + 0.3) * Math.pow(i / N, 0.6);
    const rot = i < 3 ? 0 : (r() - 0.5) * 2 * (4 * Math.PI / 180) * Math.min(1, i / N + 0.3);
    const dx = x - k.cx, dy = y - k.cy;
    const d = Math.hypot(dx / k.W, dy / k.H);
    const ang = Math.atan2(dy, dx + (r() - 0.5) * 2);
    cards.push({ x, y, t0, rot, d, ang, item: items[i % items.length], tint: i % 4 });
  }
  const tintOf = (c, i) => [c.accent, c.accent2 || c.accent, c.accent3 || c.accent, c.muted][i];
  const ho = { size: k.pick({ wide: 112, square: 96, tall: 92 }), weight: 640, tracking: -0.035 };
  let lines = k.text.balance(headline, ho, k.safe.w * 0.86);
  while (lines.length > 3 && ho.size > 40) { ho.size *= 0.92; lines = k.text.balance(headline, ho, k.safe.w * 0.86); }

  function card(g, cd, a, s, ox, oy) {
    const c = k.brand.colors;
    const [icon, title, body, time] = cd.item;
    g.save();
    g.translate(cd.x + ox, cd.y + oy);
    g.rotate(cd.rot);
    g.scale(s, s);
    g.globalAlpha *= a;
    const x = -cw / 2, y = -ch / 2, rr = 24 * k.u;
    k.draw.shadow(g, x, y, cw, ch, rr, { blur: 34, y: 14, color: k.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.14)' });
    k.draw.rrect(g, x, y, cw, ch, rr, k.isDark ? C.mix(c.surface, c.fg, 0.04) : c.surface, C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);
    const it = 56 * k.u, ix = x + 26 * k.u, iy = -it / 2;
    const tc = tintOf(c, cd.tint);
    k.draw.rrect(g, ix, iy, it, it, 14 * k.u, C.alpha(tc, k.isDark ? 0.18 : 0.12));
    k.draw.icon(g, icon, ix + it / 2, 0, it * 0.56, tc, { stroke: 1.9 });
    const tx = ix + it + 20 * k.u;
    k.text.draw(g, title, tx, -14 * k.u, { role: 'text', size: 26, weight: 620, color: c.fg, baseline: 'middle', tracking: -0.01 });
    k.text.draw(g, body, tx, 22 * k.u, { role: 'text', size: 22, weight: 440, color: c.muted, baseline: 'middle' });
    k.text.draw(g, time, x + cw - 24 * k.u, -14 * k.u, { role: 'text', size: 22, weight: 440, color: c.muted, baseline: 'middle', align: 'right' });
    g.restore();
  }

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const tClear = p.flood + 0.3;
      const tf = Math.min(t, p.flood); // frozen clock
      const push = 1 + 0.035 * ease.inOutCubic(m.seg(tf, 0, p.flood));
      g.save();
      g.translate(k.cx, k.cy); g.scale(push, push); g.translate(-k.cx, -k.cy);
      k.qa.allowOverlap(() => k.qa.allowOffstage(() => {
        for (const cd of cards) {
          if (tf < cd.t0) continue;
          const lt = tf - cd.t0;
          const a = ease.outCubic(m.seg(lt, 0, 0.12));
          const s = m.lerp(0.86, 1, ease.spring(lt, { stiffness: 320, damping: 20 }));
          let oy = (1 - ease.outCubic(m.seg(lt, 0, 0.3))) * -0.03 * k.H;
          let ox = 0;
          const out = ease.inCubic(m.seg(t, tClear + cd.d * 0.35, 0.38));
          if (out >= 1) continue;
          const fly = out * 0.6 * Math.max(k.W, k.H);
          ox += Math.cos(cd.ang) * fly; oy += Math.sin(cd.ang) * fly;
          card(g, cd, a * (1 - out * 0.6), s * (1 - out * 0.08), ox, oy);
        }
      }));
      g.restore();
      // freeze beat: the pile dims for a moment before it blows out
      const dim = Math.min(ease.outCubic(m.seg(t, p.flood, 0.12)), 1 - ease.inCubic(m.seg(t, tClear, 0.3)));
      if (dim > 0) { g.fillStyle = C.alpha(c.bg, 0.28 * dim); g.fillRect(0, 0, k.W, k.H); }
      // headline
      const lh = ho.size * 1.08 * k.u;
      const top = k.cy - ((lines.length - 1) * lh) / 2;
      let wi = 0;
      const t0 = tClear + 0.35;
      lines.forEach((ln, li) => {
        const L = k.text.layout(ln, ho);
        let x = k.cx - L.width / 2;
        const y = top + li * lh;
        const sp = k.text.layout(' ', ho).width;
        for (const w of ln.split(' ')) {
          const WL = k.text.layout(w, ho);
          const pr = ease.outExpo(m.seg(t, t0 + wi * 0.06, 0.8));
          if (pr > 0) {
            g.save();
            g.beginPath(); g.rect(x - lh * 0.1, y - L.cap * 0.5 - lh * 0.22, WL.width + lh * 0.2, L.cap + lh * 0.5); g.clip();
            k.text.draw(g, w, x, y + (1 - pr) * lh * 0.9, { ...ho, baseline: 'middle', color: c.fg, qaGroup: 'headline', qaOffstage: pr < 0.99 });
            g.restore();
          }
          x += WL.width + sp;
          wi++;
        }
      });
    },
  };
}
