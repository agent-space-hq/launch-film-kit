// A tear-off calendar tile carries the launch date. The accent month band swings
// down into place, then day pages flip up off the top edge, slowing as they count
// to the launch day. The tagline rises beneath and the lockup holds.
export const meta = {
  id: 'cta.date-lockup',
  name: 'Date Lockup',
  category: 'cta',
  duration: 4.6,
  summary: 'A calendar tile rises; its accent month band flips down, day pages tear upward three times, decelerating onto copy.launchDate\'s day; the tagline rises beneath. Holds on the lockup.',
  bestFor: ['launch date', 'event', 'end card'],
  slots: ['launchDate', 'headline', 'dateLabel'],
  params: {
    pages: { default: 3, min: 1, max: 5, label: 'Pages flipped before the day' },
  },
  sfx: [{ t: 0.4, type: 'whoosh', dur: 0.3, gain: 0.3 }, { t: 0.85, type: 'click', gain: 0.4 }, { t: 1.12, type: 'click', gain: 0.4 }, { t: 1.42, type: 'click', gain: 0.5 }, { t: 1.75, type: 'pop', gain: 0.5 }],
  prompt: `Build a calendar tile (37% of height wide, 40% tall, 44 px radius, surface fill, hairline, soft shadow, two small binder tabs). Its top 28% is an accent band with the month in tracked white caps (5.2% of height); the body holds the day in display type (about 20% of height, weight 650). The tile rises 6% and scales from 0.94 with outExpo over 800 ms. At 350 ms the band swings down from its top hinge (scaleY 0 to 1, outBack, 550 ms, shaded while edge-on). From 600 ms the body shows the day minus three; pages then flip up off the body's top edge (scaleY = cos of the angle, darkening as they turn) at 0.85, 1.12 and 1.42 s, each slower (220, 260, 330 ms), until the launch day lands. At 1.7 s a tracked muted label and the tagline (display, 6% of height, balanced) rise beneath with outExpo. Hold about 2.4 s.`,
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function parseDate(s) {
  s = String(s || '');
  let m = s.match(/([A-Za-z]{3,})\.?\s+(\d{1,2})/);
  if (m) return { mon: m[1].slice(0, 3).toUpperCase(), day: Number(m[2]) };
  m = s.match(/(\d{1,2})\s+([A-Za-z]{3,})/);
  if (m) return { mon: m[2].slice(0, 3).toUpperCase(), day: Number(m[1]) };
  m = s.match(/\d{4}-(\d{2})-(\d{2})/);
  if (m) return { mon: MONTHS[Number(m[1]) - 1] || 'JAN', day: Number(m[2]) };
  return { mon: 'SOON', day: null };
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const date = parseDate(k.copy('launchDate', ''));
  const tagline = k.copy('headline', '');
  const label = k.copy('dateLabel', 'Launching').toUpperCase();
  const nP = Math.max(1, p.pages | 0);
  const days = [];
  if (date.day) for (let i = nP; i >= 0; i--) days.push(String(Math.max(1, date.day - i)));
  const flipT = [0.85, 1.12, 1.42, 1.62, 1.8].slice(0, nP);
  const flipD = [0.22, 0.26, 0.33, 0.36, 0.4].slice(0, nP);
  const to = { size: k.pick({ wide: 66, square: 60, tall: 62 }), weight: 640, tracking: -0.03 };
  const tagLines = tagline ? k.text.balance(tagline, to, k.safe.w * 0.86) : [];
  const lo = { role: 'text', size: 26, weight: 620, tracking: 0.16 };

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const tw = k.pick({ wide: 400, square: 440, tall: 500 }) * k.u;
      const th = tw * 1.08;
      const bandH = th * 0.28;
      const r = 44 * k.u;
      const tagH = tagLines.length ? 60 * k.u + 44 * k.u + tagLines.length * to.size * 1.1 * k.u : 0;
      const groupH = th + tagH;
      const top = k.cy - groupH / 2 + 20 * k.u;
      const rise = ease.outExpo(m.seg(t, 0, 0.8));
      const sc = m.lerp(0.94, 1, rise);
      const x = k.cx - tw / 2, y = top + (1 - rise) * k.H * 0.06;
      const surf = k.isDark ? C.mix(c.surface, c.fg, 0.05) : '#ffffff';
      const on = C.contrast('#ffffff', c.accent) >= 3 ? '#ffffff' : C.onColor(c.accent);
      g.save();
      g.globalAlpha = Math.min(1, rise * 1.4);
      g.translate(k.cx, y + th / 2); g.scale(sc, sc); g.translate(-k.cx, -(y + th / 2));
      if (k.isDark) k.draw.glow(g, k.cx, y + th / 2, tw * 1.1, c.accent, 0.1);
      k.draw.shadow(g, x, y, tw, th, r, { blur: 70, y: 30, color: k.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.16)' });
      k.draw.rrect(g, x, y, tw, th, r, surf, C.alpha(c.fg, k.isDark ? 0.1 : 0.08), 1);
      // body: day pages
      const dO = { size: (th * 0.5) / k.u, weight: 650, tracking: -0.04 };
      const bodyTop = y + bandH, bodyH = th - bandH;
      const dayCy = bodyTop + bodyH / 2 + 6 * k.u;
      const drawPage = (val, sy, shade) => {
        if (sy <= 0.002) return;
        g.save();
        g.translate(0, bodyTop); g.scale(1, sy); g.translate(0, -bodyTop);
        k.draw.rrect(g, x, bodyTop, tw, bodyH, r, surf);
        g.fillStyle = surf; g.fillRect(x, bodyTop, tw, r);
        if (sy > 0.12) k.text.draw(g, val, k.cx, dayCy, { ...dO, color: c.fg, align: 'center', baseline: 'middle', qaGroup: 'day', qaOverlap: sy < 0.999 });
        if (shade > 0.003) {
          k.draw.rrect(g, x, bodyTop, tw, bodyH, r, `rgba(0,0,0,${(shade * (k.isDark ? 1 : 0.35)).toFixed(3)})`);
        }
        g.restore();
      };
      if (days.length) {
        const vis = ease.outCubic(m.seg(t, 0.55, 0.3));
        if (vis > 0) {
          g.save(); g.globalAlpha *= vis;
          let idx = 0, fl = -1, q = 0;
          for (let i = 0; i < flipT.length; i++) {
            if (t >= flipT[i] + flipD[i]) idx = i + 1;
            else if (t >= flipT[i]) { fl = i; q = (t - flipT[i]) / flipD[i]; break; }
          }
          if (fl < 0) drawPage(days[idx], 1, 0);
          else {
            drawPage(days[fl + 1], 1, 0.12 * (1 - q));
            const a = ease.inOutCubic(q);
            drawPage(days[fl], Math.cos(a * Math.PI / 2), 0.4 * a);
          }
          g.restore();
        }
      }
      // binder tabs
      for (const s of [-1, 1]) {
        const bx = k.cx + s * tw * 0.26;
        k.draw.rrect(g, bx - 9 * k.u, y - 22 * k.u, 18 * k.u, 46 * k.u, 9 * k.u, k.isDark ? C.mix(c.surface, c.fg, 0.25) : C.mix('#ffffff', c.fg, 0.2));
      }
      // month band (swings down from its top hinge)
      const bp = ease.outBack(m.seg(t, 0.35, 0.55), 1.2);
      if (bp > 0) {
        g.save();
        g.translate(0, y); g.scale(1, Math.max(0.001, bp)); g.translate(0, -y);
        g.save();
        k.draw.rrectPath(g, x, y, tw, th, r); g.clip();
        g.fillStyle = c.accent; g.fillRect(x, y, tw, bandH);
        const grd = g.createLinearGradient(0, y, 0, y + bandH);
        grd.addColorStop(0, 'rgba(255,255,255,0.12)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd; g.fillRect(x, y, tw, bandH);
        if (bp < 0.98) { g.fillStyle = `rgba(0,0,0,${(0.35 * (1 - m.clamp(bp))).toFixed(3)})`; g.fillRect(x, y, tw, bandH); }
        g.restore();
        if (bp > 0.12) k.text.draw(g, date.mon, k.cx, y + bandH / 2 + 4 * k.u, { size: 56, weight: 680, tracking: 0.12, color: on, align: 'center', baseline: 'middle', qaOffstage: bp < 0.99, qaOverlap: bp < 0.99 });
        g.restore();
        // binder holes over the band
        for (const s of [-1, 1]) k.draw.circle(g, k.cx + s * tw * 0.26, y + 14 * k.u, 6 * k.u * Math.min(1, bp), C.alpha('#000000', 0.25));
      }
      g.restore();
      // label + tagline
      if (tagLines.length) {
        const tp = ease.outExpo(m.seg(t, 1.7, 0.8));
        const ly = top + th + 60 * k.u;
        k.text.draw(g, label, k.cx, ly + (1 - tp) * 12 * k.u, { ...lo, color: c.muted, align: 'center', baseline: 'middle', alpha: tp });
        tagLines.forEach((ln, i) => {
          const pr = ease.outExpo(m.seg(t, 1.78 + i * 0.06, 0.8));
          const yy = ly + 44 * k.u + to.size * 0.5 * k.u + i * to.size * 1.1 * k.u;
          const L = k.text.layout(ln, to);
          if (pr <= 0) return;
          g.save();
          g.beginPath(); g.rect(0, yy - L.cap, k.W, L.cap * 2 + L.inkDescent); g.clip();
          k.text.draw(g, ln, k.cx, yy + (1 - pr) * L.cap * 2.2, { ...to, color: c.fg, align: 'center', baseline: 'middle', qaGroup: 'tag', qaOffstage: pr < 0.99 });
          g.restore();
        });
      }
    },
  };
}
