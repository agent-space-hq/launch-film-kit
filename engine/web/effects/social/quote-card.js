// A testimonial set like an editorial pull-quote: an oversized quote mark draws its
// outline then fills, the quote rises line by line from behind baseline masks, and the
// attribution (initials avatar, name, role) slides in under a hairline rule.
export const meta = {
  id: 'social.quote-card',
  name: 'Quote Card',
  category: 'social',
  duration: 5.4,
  summary: 'A large quote mark strokes on and fills, quote lines rise from line masks with a stagger, then an initials avatar with name and role slides in; holds, then lines lift away and the rest fades in the last 0.5 s.',
  bestFor: ['testimonial', 'social proof', 'customer voice'],
  slots: ['quote'],
  params: {
    serif: { default: true, label: 'Set the quote in the serif role' },
    card: { default: true, label: 'Sit the quote on a surface card' },
  },
  sfx: [{ t: 0.15, type: 'whoosh', dur: 0.5, gain: 0.3 }, { t: 1.55, type: 'pop', gain: 0.4 }],
  prompt: `Pull-quote, 5.4 s. A surface card (radius 36 px, hairline border, self-cast soft shadow) hugging the text block, at most ~72% of frame width on 16:9, fades and rises 30 px with outExpo over 800 ms. An oversized geometric quote mark (two rounded comma shapes, ~120 px, accent) traces its outline with a dash reveal over 700 ms (inOutCubic), then fills. The quote, balanced into at most 4 lines (serif ~100 px on wide, 1.12 line height), reveals line by line: each line rises a full line height from behind its own clip mask with outExpo over 800 ms, staggered 90 ms. A hairline rule grows, then an initials avatar (68 px accent circle), name (34 px, 600) and muted role slide 24 px from the left with outExpo, 70 ms apart. Hold at least 2 s, then lines lift out through their masks with inCubic over 400 ms as the rest fades.`,
};

function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

// Card fill that casts its own soft shadow. (k.draw.shadow paints an opaque black
// shape under the card, which shows through whenever the card is faded.)
function softCard(k, g, x, y, w, h, r, fill, color, blur, oy) {
  g.save();
  g.shadowColor = color; g.shadowBlur = blur * k.u; g.shadowOffsetY = oy * k.u;
  k.draw.rrect(g, x, y, w, h, r, fill);
  g.restore();
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const q = k.copy('quote', { text: 'It changed how our whole team ships.', name: 'Sam Rivera', role: 'Engineering Lead, Northwind Labs' });
  const D = p.duration ?? meta.duration;
  // quote mark: two rounded comma shapes in a 100x80 box
  const markPath = new Path2D();
  const comma = (ox) => {
    markPath.moveTo(ox + 22, 46);
    markPath.arc(ox + 22, 58, 20, -Math.PI / 2, Math.PI * 1.5);
    markPath.moveTo(ox + 4, 56);
    markPath.bezierCurveTo(ox + 2, 30, ox + 14, 10, ox + 38, 2);
    markPath.lineTo(ox + 40, 10);
    markPath.bezierCurveTo(ox + 26, 18, ox + 18, 30, ox + 20, 42);
    markPath.closePath();
  };
  comma(0); comma(52);

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const S = k.safe;
      const exitP = ease.inCubic(m.seg(t, D - 0.5, 0.45));
      const fade = 1 - exitP;
      const wide = k.isWide;
      const maxW = wide ? S.w * 0.72 : S.w * 0.84;
      const role = p.serif ? 'serif' : 'display';
      const qo = { role, size: k.pick({ wide: p.serif ? 100 : 80, square: p.serif ? 92 : 72, tall: p.serif ? 104 : 80 }), weight: p.serif ? 400 : 560, tracking: p.serif ? -0.01 : -0.025 };
      let lines = k.text.balance(q.text, qo, maxW);
      while (lines.length > 4 && qo.size > 40) { qo.size *= 0.92; lines = k.text.balance(q.text, qo, maxW); }
      // card hugs the set text (or the attribution, whichever is wider)
      const attrW = 68 * u + 24 * u + Math.max(k.text.layout(q.name, { role: 'text', size: 34, weight: 600 }).width, k.text.layout(q.role, { role: 'text', size: 28, weight: 450 }).width);
      const blockW = Math.min(maxW, Math.max(attrW, ...lines.map((ln) => k.text.layout(ln, qo).width)));
      const lh = qo.size * 1.12 * u;
      const markH = 120 * u;
      const avR = 34 * u;
      const textH = lines.length * lh;
      const gapA = 56 * u, gapB = 84 * u;
      const blockH = markH + gapA + textH + gapB + avR * 2;
      const pad = (wide ? 90 : 64) * u;
      const cardW = blockW + pad * 2, cardH = blockH + pad * 2;
      const cardX = k.cx - cardW / 2, cardY = k.cy - cardH / 2;
      const x0 = cardX + pad;
      let y = cardY + pad;

      // card
      const cIn = ease.outExpo(m.seg(t, 0, 0.8));
      if (p.card) {
        g.save();
        g.globalAlpha = cIn * fade;
        g.translate(0, (1 - cIn) * 30 * u);
        const R = 36 * u;
        softCard(k, g, cardX, cardY, cardW, cardH, R, k.isDark ? C.mix(c.surface, c.bg, 0.2) : c.surface, k.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.12)', 70, 30);
        k.draw.rrect(g, cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1, R, null, C.alpha(c.fg, k.isDark ? 0.1 : 0.07), 1);
        if (k.isDark) k.draw.glow(g, cardX + cardW * 0.15, cardY, cardW * 0.5, c.accent, 0.06);
        g.restore();
      }

      // quote mark
      const mk = m.seg(t, 0.15, 0.7);
      if (mk > 0) {
        const s = markH / 80;
        g.save();
        g.globalAlpha = fade;
        g.translate(x0, y + (1 - cIn) * 30 * u);
        g.scale(s, s);
        const dash = 420;
        g.setLineDash([dash * ease.inOutCubic(mk), dash]);
        g.strokeStyle = c.accent; g.lineWidth = 2.2 / s * u; g.lineJoin = 'round';
        g.stroke(markPath);
        g.setLineDash([]);
        const fl = ease.outCubic(m.seg(t, 0.55, 0.35));
        if (fl > 0) { g.globalAlpha = fade * fl; g.fillStyle = c.accent; g.fill(markPath); }
        g.restore();
      }
      y += markH + gapA;

      // lines
      lines.forEach((ln, i) => {
        const ly = y + i * lh;
        const tin = ease.outExpo(m.seg(t, 0.5 + i * 0.09, 0.8));
        const tout = ease.inCubic(m.seg(t, D - 0.5 + i * 0.04, 0.4));
        const dy = (1 - tin) * lh - tout * lh;
        g.save();
        g.beginPath(); g.rect(x0 - 10 * u, ly - lh * 0.1, blockW + 20 * u, lh * 1.12); g.clip();
        k.text.draw(g, ln, x0, ly + lh * 0.5 + dy, { ...qo, baseline: 'middle', qaGroup: 'quote', qaOffstage: tin < 1 || tout > 0 });
        g.restore();
      });
      y += textH + gapB * 0.5;

      // rule
      const rl = ease.outQuint(m.seg(t, 1.2, 0.8));
      if (rl > 0) {
        g.save(); g.globalAlpha = fade;
        k.draw.line(g, x0, y - gapB * 0.25, x0 + blockW * rl, y - gapB * 0.25, C.alpha(c.fg, k.isDark ? 0.12 : 0.12), 1, 'butt');
        g.restore();
      }
      y += gapB * 0.5;

      // attribution
      const aIn = ease.outExpo(m.seg(t, 1.45, 0.8));
      const nIn = ease.outExpo(m.seg(t, 1.52, 0.8));
      const rIn = ease.outExpo(m.seg(t, 1.59, 0.8));
      if (aIn > 0) {
        const ax = x0 + avR - (1 - aIn) * 24 * u, ay = y + avR;
        g.save(); g.globalAlpha = aIn * fade;
        k.draw.circle(g, ax, ay, avR, c.accent);
        g.restore();
        k.text.draw(g, initials(q.name), ax, ay, { role: 'text', size: 26, weight: 640, tracking: 0.02, color: k.color.onColor(c.accent), align: 'center', baseline: 'middle', alpha: m.seg(aIn * fade, 0.55, 0.45) });
      }
      const tx = x0 + avR * 2 + 24 * u;
      k.text.draw(g, q.name, tx - (1 - nIn) * 24 * u, y + avR - 4 * u, { role: 'text', size: 34, weight: 600, baseline: 'bottom', alpha: nIn * fade });
      const ro = { role: 'text', size: 28, weight: 450 };
      k.text.draw(g, q.role, tx - (1 - rIn) * 24 * u, y + avR + 6 * u, { ...ro, size: k.text.fit(q.role, ro, blockW - avR * 2 - 24 * u, 22), color: c.muted, baseline: 'top', alpha: rIn * fade });
    },
  };
}
