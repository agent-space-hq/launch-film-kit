// A phone shows a tall landing page. It holds on the hero, then two flicks scroll it
// with inertia: background shapes move slower than content (parallax), feature cards
// trail by velocity and close up as the scroll settles, and a thin scroll indicator
// shows while moving. Ends held on the closing call to action.
export const meta = {
  id: 'ui.scroll-reel',
  name: 'Scroll Reel',
  category: 'ui',
  duration: 6.4,
  summary: 'A landing page scrolls inside a phone in two inertial flicks with layered parallax and velocity-trailing cards; holds on the final CTA section.',
  bestFor: ['landing page', 'mobile site', 'website launch'],
  slots: ['headline', 'sub', 'cta', 'features', 'stats', 'url'],
  params: {
    flick1: { default: 1.9, min: 0.6, max: 2.5, label: 'First flick (s)' },
    flick2: { default: 4.0, min: 2.5, max: 4.5, label: 'Second flick (s)' },
  },
  sfx: [{ t: 1.9, type: 'whoosh', dur: 0.8, gain: 0.35 }, { t: 4.0, type: 'whoosh', dur: 0.8, gain: 0.35 }],
  prompt: `Draw a phone slab (86% of frame height in 16:9, 78% in portrait) and lay out a mobile landing page in screen space: sticky nav, hero (headline at 44 px, sub, full-width CTA, a gradient preview card), a features section with four icon cards, a stats section and a closing CTA card. Hold the hero until 1900 ms, then scroll to the features with a 1400 ms flick using cubic-bezier(0.3,0,0,1); hold, and at 4000 ms flick to the bottom. Parallax: soft background blobs scroll at 0.5x and the hero card at 0.82x; each feature card lags by its index times the instantaneous velocity (numerical derivative of the scroll curve), so cards spread while moving and close up as it stops. Text fades over 60 px near the nav and the bottom edge. A 4 px scroll thumb fades in with speed. Hold on the CTA.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const DUR = p.duration ?? meta.duration;
  const headline = k.copy('headline', 'Ship your launch in an afternoon.');
  const sub = k.copy('sub', 'Plan, build and ship in one place.');
  const cta = k.copy('cta', 'Get started');
  const feats = (k.copy('features', null) || ['Roadmaps', 'Releases', 'Changelogs', 'Approvals']).slice(0, 4);
  const stats = (k.copy('stats', null) || []).slice(0, 3);
  const url = k.copy('url', 'example.app');
  const fmt = (s) => s.value.toLocaleString('en-US', { minimumFractionDigits: s.decimals || 0, maximumFractionDigits: s.decimals || 0 }) + (s.suffix || '');
  const icons = ['layers', 'rocket', 'file', 'users'];

  const phoneH = Math.min(k.pick({ wide: 930, square: 1050, tall: 1500 }) * U, k.H * 0.86);
  const screenBg = dark ? C.mix(c.bg, c.fg, 0.03) : '#ffffff';
  const surf = dark ? C.mix(c.bg, c.fg, 0.08) : C.mix('#ffffff', c.fg, 0.035);
  const skel = C.alpha(c.fg, dark ? 0.14 : 0.09);
  const line = C.alpha(c.fg, dark ? 0.1 : 0.09);
  const onAccent = C.onColor(c.accent);

  // ---------- page layout in base units (design width BW) ----------
  const BW = 430, PAD = 28, IW = BW - PAD * 2;
  const NAV = 112;
  const hl = { role: 'display', size: 44, weight: 650, tracking: -0.035 };
  const hLines = k.text.balance(headline, hl, IW * U);
  const sl = { role: 'text', size: 24, weight: 440 };
  const sLines = k.text.wrap(sub, sl, IW * U);
  const items = [];
  let y = NAV + 26;
  items.push({ type: 'eyebrow', y }); y += 58;
  items.push({ type: 'headline', y }); y += hLines.length * 48 + 18;
  items.push({ type: 'sub', y }); y += sLines.length * 32 + 26;
  items.push({ type: 'cta', y }); y += 62 + 34;
  items.push({ type: 'heroCard', y, h: 290, par: 0.82 }); y += 290 + 70;
  const featTop = y;
  items.push({ type: 'sectionTitle', y, str: 'Everything in one place' }); y += 64;
  feats.forEach((f, i) => { items.push({ type: 'feat', y, i, str: f }); y += 104; });
  y += 40;
  const statTop = y;
  if (stats.length) {
    items.push({ type: 'sectionTitle', y, str: 'Built for momentum' }); y += 64;
    stats.forEach((s, i) => { items.push({ type: 'stat', y, i, s }); y += 108; });
    y += 30;
  }
  items.push({ type: 'final', y, h: 300 }); y += 300 + 40;
  const pageH = y;

  return {
    draw(g, t) {
      // phone geometry
      const enter = ease.outQuint(m.seg(t, 0, 0.9));
      const pcy = k.cy + (1 - enter) * 60 * U;
      g.save();
      g.globalAlpha *= Math.min(1, enter * 1.5);
      if (dark) k.draw.glow(g, k.cx, k.cy, phoneH * 0.75, c.accent, 0.14);
      const scr = k.draw.phone(g, k.cx, pcy, phoneH, { screen: screenBg, body: dark ? '#0b0c0f' : '#1a1c21' });
      const sc = scr.w / (BW * U);
      const visH = scr.h / sc / U; // visible page height in base units
      const maxScroll = Math.max(0, pageH - visH);
      const stop1 = Math.min(maxScroll, featTop - NAV - 20);
      const scrollAt = (tt) => stop1 * ease.emphasized(m.seg(tt, p.flick1, 1.4)) + (maxScroll - stop1) * ease.emphasized(m.seg(tt, p.flick2, 1.4));
      const sy = scrollAt(t);
      const vel = (scrollAt(t + 0.01) - scrollAt(t - 0.01)) / 0.02; // base units / s
      g.save();
      k.draw.rrectPath(g, scr.x, scr.y, scr.w, scr.h, scr.r); g.clip();
      g.translate(scr.x, scr.y); g.scale(sc, sc);
      const X = (v) => v * U, Y = (v) => (v - sy) * U;
      // background blobs (parallax 0.5)
      const blob = (bx, by, r, col, a) => { const yy = (by - sy * 0.5) * U; k.draw.glow(g, X(bx), yy, r * U, col, a); };
      blob(360, 260, 300, c.accent, dark ? 0.32 : 0.16);
      blob(60, 900, 280, c.accent2 || c.accent, dark ? 0.18 : 0.1);
      blob(380, 1500, 300, c.accent3 || c.accent, dark ? 0.16 : 0.1);
      // text with edge fade (keeps QA honest about clipped lines)
      const fadeA = (yTop, hh) => {
        const top = (yTop - sy);
        const bot = top + hh;
        return m.smoothstep(NAV - 6, NAV + 54, top) * m.smoothstep(visH - 6, visH - 66, bot);
      };
      const txt = (str, x, yy, o) => {
        const a = fadeA(yy - o.size * 0.75, o.size * 1.1) * (o.alpha ?? 1);
        if (a > 0.01) k.text.draw(g, str, X(x), Y(yy), { ...o, alpha: a, baseline: 'alphabetic' });
      };
      const intro = (i) => ease.outQuint(m.seg(t, 0.25 + i * 0.08, 0.8));
      for (const it of items) {
        const yy = it.y;
        if ((yy - sy) > visH + 40 || (yy + (it.h || 140) - sy) < -400) continue;
        if (it.type === 'eyebrow') {
          const a = intro(0);
          g.save(); g.globalAlpha *= a;
          const L = k.text.layout('New', { role: 'text', size: 22, weight: 600 });
          const pw = L.width + 40 * U;
          k.draw.rrect(g, X(PAD), Y(yy), pw, 38 * U, 19 * U, C.alpha(c.accent, dark ? 0.2 : 0.12));
          g.restore();
          txt('New', PAD + 20, yy + 27, { role: 'text', size: 22, weight: 600, color: dark ? C.mix(c.accent, '#ffffff', 0.35) : C.shade(c.accent, -0.08), alpha: a });
        } else if (it.type === 'headline') {
          hLines.forEach((ln, i) => {
            const a = intro(1 + i);
            txt(ln, PAD, yy + 40 + i * 48 + (1 - a) * 20, { ...hl, alpha: a });
          });
        } else if (it.type === 'sub') {
          sLines.forEach((ln, i) => txt(ln, PAD, yy + 24 + i * 32, { ...sl, color: c.muted, alpha: intro(4) }));
        } else if (it.type === 'cta') {
          const a = intro(5);
          g.save(); g.globalAlpha *= a;
          k.draw.rrect(g, X(PAD), Y(yy), IW * U, 62 * U, 31 * U, c.accent);
          g.restore();
          const L = k.text.layout(cta, { role: 'text', size: 24, weight: 600 });
          txt(cta, BW / 2 - L.width / U / 2, yy + 40, { role: 'text', size: 24, weight: 600, color: onAccent, alpha: a * a * a });
        } else if (it.type === 'heroCard') {
          const a = intro(6);
          const hy = Y(yy);
          // the card moves with the page; its contents drift slower inside the clip (parallax)
          const off = (sy * (1 - it.par)) * U;
          g.save(); g.globalAlpha *= a;
          const grd = g.createLinearGradient(X(PAD), hy, X(PAD + IW), hy + it.h * U);
          grd.addColorStop(0, C.mix(c.accent, c.bg, dark ? 0.15 : 0)); grd.addColorStop(1, C.mix(c.accent2 || c.accent, c.accent, 0.4));
          k.draw.rrect(g, X(PAD), hy, IW * U, it.h * U, 24 * U, grd);
          k.draw.rrectPath(g, X(PAD), hy, IW * U, it.h * U, 24 * U); g.clip();
          const ix = X(PAD + 22), iy = hy + 22 * U + off, iw = (IW - 44) * U;
          k.draw.rrect(g, ix, iy, iw, (it.h - 44) * U, 16 * U, 'rgba(255,255,255,0.16)');
          k.draw.rrect(g, ix + 18 * U, iy + 20 * U, 110 * U, 12 * U, 6 * U, 'rgba(255,255,255,0.7)');
          const bars = [0.35, 0.5, 0.42, 0.66, 0.58, 0.82, 1];
          bars.forEach((q, i) => {
            const bw = (iw - 36 * U - 6 * 10 * U) / 7, bh = q * 120 * U * (0.2 + 0.8 * ease.outQuint(m.seg(t, 0.7 + i * 0.06, 0.8)));
            k.draw.rrect(g, ix + 18 * U + i * (bw + 10 * U), iy + (it.h - 64) * U - bh, bw, bh, 5 * U, i === 6 ? '#ffffff' : 'rgba(255,255,255,0.4)');
          });
          g.restore();
        } else if (it.type === 'sectionTitle') {
          txt(it.str, PAD, yy + 36, { role: 'display', size: 32, weight: 640, tracking: -0.03 });
        } else if (it.type === 'feat') {
          const lag = -vel * 0.018 * (it.i + 1) * 0.6;
          const fy = yy + lag;
          g.save();
          g.globalAlpha *= fadeA(fy, 88) * 0.5 + 0.5;
          k.draw.rrect(g, X(PAD), Y(fy), IW * U, 88 * U, 20 * U, surf, line, 1);
          k.draw.rrect(g, X(PAD + 18), Y(fy + 18), 52 * U, 52 * U, 14 * U, C.alpha(c.accent, dark ? 0.2 : 0.12));
          k.draw.icon(g, icons[it.i] || 'sparkle', X(PAD + 44), Y(fy + 44), 30 * U, c.accent, { stroke: 1.9 });
          k.draw.rrect(g, X(PAD + 88), Y(fy + 58), 150 * U, 10 * U, 5 * U, skel);
          g.restore();
          txt(it.str, PAD + 88, fy + 42, { role: 'text', size: 25, weight: 580 });
        } else if (it.type === 'stat') {
          const lag = -vel * 0.012 * (it.i + 1) * 0.6;
          const fy = yy + lag;
          txt(fmt(it.s), PAD, fy + 52, { role: 'display', size: 56, weight: 640, tracking: -0.04, color: it.i === 0 ? c.accent : c.fg });
          txt(it.s.label, PAD, fy + 84, { role: 'text', size: 22, weight: 460, color: c.muted });
          if (it.i < stats.length - 1) { g.fillStyle = line; g.fillRect(X(PAD), Y(fy + 102), IW * U, Math.max(1, U)); }
        } else if (it.type === 'final') {
          g.save();
          const grd = g.createLinearGradient(0, Y(yy), 0, Y(yy + it.h));
          grd.addColorStop(0, C.alpha(c.accent, dark ? 0.22 : 0.12)); grd.addColorStop(1, C.alpha(c.accent, dark ? 0.06 : 0.04));
          k.draw.rrect(g, X(PAD), Y(yy), IW * U, it.h * U, 28 * U, grd, C.alpha(c.accent, 0.3), 1);
          g.restore();
          k.logo.draw(g, X(BW / 2), Y(yy + 66), 52 * U, { alpha: fadeA(yy + 40, 52) });
          const L1 = k.text.layout('Launch with us', { role: 'display', size: 36, weight: 640, tracking: -0.03 });
          txt('Launch with us', BW / 2 - L1.width / U / 2, yy + 152, { role: 'display', size: 36, weight: 640, tracking: -0.03 });
          const bw = 260;
          const ba = fadeA(yy + 190, 62);
          g.save(); g.globalAlpha *= ba;
          k.draw.rrect(g, X(BW / 2 - bw / 2), Y(yy + 190), bw * U, 62 * U, 31 * U, c.accent);
          g.restore();
          const L2 = k.text.layout(cta, { role: 'text', size: 24, weight: 600 });
          txt(cta, BW / 2 - L2.width / U / 2, yy + 230, { role: 'text', size: 24, weight: 600, color: onAccent, alpha: ba * ba * ba });
        }
      }
      // sticky nav
      g.fillStyle = C.alpha(screenBg, 0.94); g.fillRect(0, 0, BW * U, NAV * U);
      const navLine = m.clamp(sy / 40);
      g.fillStyle = C.alpha(c.fg, 0.08 * navLine); g.fillRect(0, NAV * U - U, BW * U, U);
      k.logo.draw(g, X(PAD + 14), (NAV - 32) * U, 28 * U);
      k.text.draw(g, k.brand.name, X(PAD + 36), (NAV - 32) * U, { role: 'display', size: 26, weight: 640, baseline: 'middle' });
      g.fillStyle = c.fg;
      k.draw.rrect(g, X(BW - PAD - 26), (NAV - 38) * U, 26 * U, 3 * U, 1.5 * U, c.fg);
      k.draw.rrect(g, X(BW - PAD - 26), (NAV - 29) * U, 26 * U, 3 * U, 1.5 * U, c.fg);
      // scroll thumb
      const sa = m.clamp(Math.abs(vel) / 600) * 0.6;
      if (sa > 0.01 && maxScroll > 0) {
        const th = (visH / pageH) * (visH - NAV - 20);
        const ty = NAV + 10 + (sy / maxScroll) * (visH - NAV - 20 - th);
        k.draw.rrect(g, X(BW - 9), ty * U, 4 * U, th * U, 2 * U, C.alpha(c.fg, sa));
      }
      g.restore();
      // the island sits above the page
      const pw = phoneH * 0.49;
      k.draw.rrect(g, k.cx - pw * 0.16, scr.y + phoneH * 0.018, pw * 0.32, phoneH * 0.03, phoneH * 0.015, '#000000');
      g.restore();
    },
  };
}
