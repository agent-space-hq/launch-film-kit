// Die-cut stickers (the mark plus icon+word feature stickers) slap on with a damped
// spring and a slight tilt, thick white border and soft shadow. Later each one peels
// away from a corner: a fold line sweeps across, the peeled part flips over as a
// light backing flap, and the sticker is gone. Frame 0 is the full sticker board.
export const meta = {
  id: 'loop.sticker-pop',
  name: 'Sticker Pop',
  category: 'loop',
  duration: 6,
  loop: true,
  summary: 'Die-cut stickers (mark + icon/word features) spring onto the frame with small tilts and a white border, hold, then peel off corner-first with a folding backing flap; seamless loop, frame 0 is the full board.',
  bestFor: ['playful social loop', 'feature list with personality', 'launch teaser'],
  slots: ['features'],
  params: {},
  sfx: [{ t: 2.35, type: 'whoosh', dur: 0.3, gain: 0.2 }, { t: 3.65, type: 'pop', gain: 0.45 }, { t: 3.74, type: 'pop', gain: 0.45 }, { t: 3.83, type: 'pop', gain: 0.45 }, { t: 3.92, type: 'pop', gain: 0.45 }, { t: 4.01, type: 'pop', gain: 0.45 }],
  prompt: `Make five die-cut stickers: a round brand sticker (mark on the page colour, about 33% of the short side) and four pill stickers from the feature list (line icon plus a 46-52 px word; fills alternate surface, accent and inverse foreground). Each gets a 10 px white die-cut border, a soft drop shadow and a fixed tilt of up to 7 degrees, scattered around the centre without overlap (layouts per aspect). In a 6 s loop, stickers spring in 90 ms apart from 150 ms (scale 0 to 1, damped spring stiffness 260, damping 18). They hold, then from 4.85 s each peels 90 ms apart over 500 ms (inCubic): a fold line sweeps from the bottom-right corner to the top-left, the flat part is clipped to the far side, and the peeled part is mirrored across the fold as a pale backing flap with its own shadow, fading in its last 30%. The frame rests empty before the next pop. Offset the timeline by 2.5 s so frame 0 shows every sticker.`,
};

function iconFor(name, i) {
  const s = name.toLowerCase();
  if (/road|plan|map|calendar|schedul/.test(s)) return 'calendar';
  if (/release|ship|deploy|click|fast|speed|launch/.test(s)) return 'bolt';
  if (/log|change|note|doc|write/.test(s)) return 'sparkle';
  if (/team|approv|people|collab|share/.test(s)) return 'users';
  if (/secur|lock|private/.test(s)) return 'lock';
  if (/chat|message|comment/.test(s)) return 'chat';
  return ['bolt', 'sparkle', 'chart-line', 'users'][i % 4];
}

export function create(k, p) {
  const { ease, m } = k;
  const c = k.brand.colors, C = k.color;
  const feats = (k.copy('features', null) || ['Plan together', 'Ship faster', 'See what changed', 'Stay in sync']).slice(0, 4);
  const r = m.rng(14);
  const fs = k.pick({ wide: 52, square: 46, tall: 48 });
  const textO = { role: 'text', size: fs, weight: 640, tracking: -0.01 };
  const border = 10 * k.u;
  const fills = [
    { bg: c.surface, fg: c.fg, ic: c.accent },
    { bg: c.accent, fg: C.onColor(c.accent, ['#ffffff', c.bg, c.fg]), ic: C.onColor(c.accent, ['#ffffff', c.bg, c.fg]) },
    { bg: c.fg, fg: c.bg, ic: c.bg },
    { bg: c.surface, fg: c.fg, ic: c.accent },
  ];
  // layouts in units of half the safe area, around the centre
  const L = k.pick({
    wide: [[0, 0.02], [-0.56, -0.5], [0.52, -0.46], [-0.5, 0.5], [0.56, 0.48]],
    square: [[0, 0.0], [-0.42, -0.62], [0.42, -0.5], [-0.4, 0.55], [0.42, 0.66]],
    tall: [[0, -0.02], [-0.2, -0.68], [0.2, -0.44], [-0.2, 0.44], [0.2, 0.68]],
  });
  const stickers = [];
  const markR = k.pick({ wide: 185, square: 175, tall: 175 }) * k.u;
  stickers.push({ kind: 'mark', w: markR * 2, h: markR * 2, rot: (r() - 0.5) * 0.12 });
  feats.forEach((f, i) => {
    const TL = k.text.layout(f, textO);
    const h = fs * 2.3 * k.u, iconS = fs * 1.15 * k.u;
    const w = TL.width + iconS + fs * 1.9 * k.u;
    stickers.push({ kind: 'pill', text: f, icon: iconFor(f, i), w, h, iconS, fill: fills[i % 4], rot: (r() - 0.5) * 0.24 });
  });
  stickers.forEach((s, i) => {
    const [nx, ny] = L[i] || [0, 0];
    s.x = k.cx + (nx * k.safe.w) / 2;
    s.y = k.cy + (ny * k.safe.h) / 2;
    // keep the sticker (plus border and tilt) inside the safe area
    const hw = s.w / 2 + border + 20 * k.u, hh = s.h / 2 + border + 20 * k.u;
    s.x = m.clamp(s.x, k.safe.x + hw, k.safe.x + k.safe.w - hw);
    s.y = m.clamp(s.y, k.safe.y + hh, k.safe.y + k.safe.h - hh);
  });
  const pop0 = 0.15, popGap = 0.09, peel0 = 4.85, peelGap = 0.09, peelDur = 0.5;
  // peel direction: from bottom-right toward top-left
  const u = (() => { const x = -1, y = -0.62, l = Math.hypot(x, y); return [x / l, y / l]; })();

  function shapePath(g, s, grow = 0) {
    if (s.kind === 'mark') { g.beginPath(); g.arc(0, 0, s.w / 2 + grow, 0, m.TAU); return; }
    k.draw.rrectPath(g, -s.w / 2 - grow, -s.h / 2 - grow, s.w + grow * 2, s.h + grow * 2, s.h / 2 + grow);
  }
  function face(g, s) {
    // white die-cut border, then the face
    shapePath(g, s, border); g.fillStyle = '#ffffff'; g.fill();
    if (s.kind === 'mark') {
      shapePath(g, s); g.fillStyle = k.isDark ? c.bg : c.surface; g.fill();
      k.logo.draw(g, 0, 0, s.w * 0.56);
    } else {
      shapePath(g, s); g.fillStyle = s.fill.bg; g.fill();
      const x0 = -s.w / 2 + fs * 0.8 * k.u;
      k.draw.icon(g, s.icon, x0 + s.iconS / 2, 0, s.iconS, s.fill.ic, { stroke: 2 });
      k.text.draw(g, s.text, x0 + s.iconS + fs * 0.35 * k.u, 0, { ...textO, baseline: 'middle', color: s.fill.fg });
    }
  }
  // pre-rendered faces, used while a sticker is in motion (pop and peel)
  stickers.forEach((s) => {
    const pad = border + 4 * k.u;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(s.w + pad * 2); cv.height = Math.ceil(s.h + pad * 2);
    const cg = cv.getContext('2d');
    cg.translate(cv.width / 2, cv.height / 2);
    face(cg, s);
    s.bmp = cv;
  });
  const faceFast = (g, s) => g.drawImage(s.bmp, -s.bmp.width / 2, -s.bmp.height / 2);
  // half-plane {p : dot(p,u) >= sOff} (keep) or <= (cut), as a big polygon in local space
  function halfPlane(g, uv, sOff, keepFar) {
    const BIG = 4000 * k.u;
    const px = -uv[1], py = uv[0];
    const cx = uv[0] * sOff, cy = uv[1] * sOff;
    const dir = keepFar ? 1 : -1;
    g.beginPath();
    g.moveTo(cx + px * BIG, cy + py * BIG);
    g.lineTo(cx - px * BIG, cy - py * BIG);
    g.lineTo(cx - px * BIG + uv[0] * BIG * dir, cy - py * BIG + uv[1] * BIG * dir);
    g.lineTo(cx + px * BIG + uv[0] * BIG * dir, cy + py * BIG + uv[1] * BIG * dir);
    g.closePath();
  }

  return {
    draw(g, t) {
      const D = p.duration ?? meta.duration;
      const tau = ((((t + 2.5 * (D / 6)) % D) + D) % D) * (6 / D); // normalised 6 s timeline
      stickers.forEach((s, i) => {
        const tp = tau - (pop0 + i * popGap);
        if (tp <= 0) return;
        const sc = Math.max(0, ease.spring(tp, { stiffness: 260, damping: 18 }));
        const pe = ease.inCubic(m.seg(tau, peel0 + i * peelGap, peelDur));
        if (pe >= 1) return;
        // extent of the sticker along u (rotated into local space)
        const cr = Math.cos(-s.rot), sr = Math.sin(-s.rot);
        const ul = [u[0] * cr - u[1] * sr, u[0] * sr + u[1] * cr];
        const ext = Math.abs(ul[0]) * (s.w / 2 + border) + Math.abs(ul[1]) * (s.h / 2 + border);
        // fold position travels from the start corner (q = +ext... we peel from the -u side)
        const sOff = -ext + pe * ext * 2.05;
        g.save();
        g.translate(s.x, s.y); g.rotate(s.rot); g.scale(sc, sc);
        const peeling = pe > 0;
        // shadow
        g.save();
        if (peeling) { halfPlane(g, ul, sOff, true); g.clip(); }
        g.shadowColor = k.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.2)';
        g.shadowBlur = 24 * k.u; g.shadowOffsetY = 10 * k.u;
        shapePath(g, s, border); g.fillStyle = '#ffffff'; g.fill();
        g.restore();
        // flat part
        g.save();
        if (peeling) { halfPlane(g, ul, sOff, true); g.clip(); }
        // live text only when the sticker is at rest; bitmap while it springs or peels
        if (peeling || Math.abs(sc - 1) > 0.002) faceFast(g, s); else face(g, s);
        g.restore();
        // flap: peeled part mirrored across the fold line
        if (peeling) {
          const fa = 1 - m.seg(pe, 0.7, 0.3);
          const [ux, uy] = ul;
          g.save();
          g.rotate(0); // already in sticker space; reflect across dot(p, ul) = sOff
          const a = 1 - 2 * ux * ux, b = -2 * ux * uy, d = 1 - 2 * uy * uy;
          // keep only the peeled region (pre-reflection) via clip in reflected space
          g.transform(a, b, b, d, 2 * sOff * ux, 2 * sOff * uy);
          g.globalAlpha = fa;
          // clip to the peeled side, expressed in this reflected frame
          const BIG = 4000 * k.u, px = -uy, py = ux, cx = ux * sOff, cy = uy * sOff;
          g.beginPath();
          g.moveTo(cx + px * BIG, cy + py * BIG); g.lineTo(cx - px * BIG, cy - py * BIG);
          g.lineTo(cx - px * BIG - ux * BIG, cy - py * BIG - uy * BIG); g.lineTo(cx + px * BIG - ux * BIG, cy + py * BIG - uy * BIG);
          g.closePath(); g.clip();
          g.shadowColor = k.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,60,0.25)';
          g.shadowBlur = 18 * k.u;
          shapePath(g, s, border);
          const back = g.createLinearGradient(cx - ux * 200 * k.u, cy - uy * 200 * k.u, cx, cy);
          back.addColorStop(0, '#e9ebef'); back.addColorStop(1, '#ffffff');
          g.fillStyle = back; g.fill();
          g.restore();
        }
        g.restore();
      });
    },
  };
}
