// A floating translucent panel materialises from a single bright line, sways gently
// in 3D, and carries the headline. The "holo" cues are kept quiet: hairline
// scanlines, one slow shimmer band, an edge light that is brightest at the top
// corners, and a scan-line wipe that reveals the copy. Exits by folding back into
// the line.
export const meta = {
  id: 'hero3d.holo-panel',
  name: 'Holo Panel',
  category: 'hero3d',
  duration: 5,
  summary: 'A translucent panel unfolds from a bright line, sways gently in 3D with quiet scanlines and an edge light, and a scan wipe reveals the headline and sub line; folds back into the line to exit.',
  bestFor: ['headline', 'feature announcement', 'AI / future themes'],
  slots: ['headline', 'sub'],
  params: {
    sub: { default: true, label: 'Show sub line' },
  },
  sfx: [{ t: 0.05, type: 'shimmer', gain: 0.35 }, { t: 0.6, type: 'type', n: 8, dur: 0.6, gain: 0.25 }],
  prompt: `A panel that hugs its copy (64 px side padding, up to 86% of the safe width, 18 px radius) unfolds vertically from a 2 px accent line over 0-700 ms (outExpo), the line flaring then fading. Fill: very translucent foreground-to-accent vertical gradient on dark (frosted white with soft shadow on light), hairline scanlines every 4 px at 4% opacity, one soft shimmer band drifting down at 20% of the panel height per second. Edge: 1.2 px border whose light peaks at the top corners, plus a 24 px accent glow on dark. The panel sways in yaw ±0.15 rad (inOutSine, 4 s period) drawn as an affine squash and shear, bobbing 0.6% vertically. 550-1350 ms a bright scan line moves down the panel and reveals the headline (display 96 ref px, weight 640, balanced) and then the sub line (32 ref px, muted). Exit over the last 450 ms: the copy fades and the panel folds back into the line (inCubic).`,
};

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const head = k.copy('headline', k.brand.name);
  const sub = k.copy('sub', '');
  const maxW = k.safe.w * 0.86;
  const padX = 64 * k.u, padY = 56 * k.u;
  const hO = { size: k.pick({ wide: 96, square: 82, tall: 74 }), weight: 640, tracking: -0.03 };
  let hl = k.text.balance(head, hO, maxW - padX * 2);
  while (hl.length > 3 && hO.size > 44) { hO.size *= 0.92; hl = k.text.balance(head, hO, maxW - padX * 2); }
  const sO = { role: 'text', size: 32, weight: 440, tracking: -0.005 };
  const hW = Math.max(...hl.map((l) => k.text.layout(l, hO).width));
  const sl = p.sub && sub ? k.text.balance(sub, sO, Math.max(hW, k.vmin * 0.5)) : [];
  const sW = sl.length ? Math.max(...sl.map((l) => k.text.layout(l, sO).width)) : 0;
  // the panel hugs its copy
  const PW = Math.min(maxW, Math.max(hW, sW, k.vmin * 0.5) + padX * 2);
  const hLH = hO.size * 1.08 * k.u, sLH = sO.size * 1.3 * k.u;
  const capH = k.text.layout('H', hO).cap;
  const subCap = k.text.layout('H', sO).cap;
  const contentH = (hl.length - 1) * hLH + capH + (sl.length ? 44 * k.u + (sl.length - 1) * sLH + subCap * 1.25 : 0);
  const PH = contentH + padY * 2;
  return {
    draw(g, t) {
      const open = ease.outExpo(m.seg(t, 0.05, 0.7));
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fold = open * (1 - exit);
      const lineA = Math.min(1, m.seg(t, 0, 0.12) * 1.0) * (1 - m.seg(t, 0.45, 0.4)) + exit * (1 - m.seg(t, D - 0.08, 0.08));
      const yaw = 0.15 * Math.sin((m.TAU * t) / 4 - 0.6);
      const bob = Math.sin((m.TAU * t) / 3.3) * 0.006 * k.H;
      const fx = Math.cos(yaw), shear = Math.sin(yaw) * 0.12;
      g.save();
      g.translate(k.cx, k.cy + bob);
      g.transform(fx, shear, 0, 1, 0, 0);
      const w = PW, h = Math.max(2 * k.u, PH * fold);
      const x0 = -w / 2, y0 = -h / 2;
      // bright line that the panel unfolds from / folds back into
      if (lineA > 0.01) {
        g.save();
        g.globalAlpha = lineA;
        const lw = w * (0.6 + 0.4 * Math.max(open, 1 - exit));
        const lg = g.createLinearGradient(-lw / 2, 0, lw / 2, 0);
        lg.addColorStop(0, k.color.alpha(c.accent, 0)); lg.addColorStop(0.5, k.isDark ? k.color.mix(c.accent, '#ffffff', 0.5) : c.accent); lg.addColorStop(1, k.color.alpha(c.accent, 0));
        g.fillStyle = lg; g.fillRect(-lw / 2, -1.2 * k.u, lw, 2.4 * k.u);
        if (k.isDark) k.draw.glow(g, 0, 0, w * 0.35, c.accent, 0.25 * lineA);
        g.restore();
      }
      if (fold > 0.01) {
        const r = Math.min(18 * k.u, h / 2);
        // body
        g.save();
        if (k.isDark) { g.shadowColor = k.color.alpha(c.accent, 0.35 * fold); g.shadowBlur = 24 * k.u; }
        else { g.shadowColor = `rgba(20,30,60,${0.16 * fold})`; g.shadowBlur = 50 * k.u; g.shadowOffsetY = 20 * k.u; }
        k.draw.rrectPath(g, x0, y0, w, h, r);
        const bg = g.createLinearGradient(0, y0, 0, y0 + h);
        if (k.isDark) { bg.addColorStop(0, k.color.alpha(k.color.mix(c.fg, c.accent, 0.5), 0.1)); bg.addColorStop(1, k.color.alpha(c.accent, 0.05)); }
        else { bg.addColorStop(0, 'rgba(255,255,255,0.82)'); bg.addColorStop(1, 'rgba(255,255,255,0.62)'); }
        g.fillStyle = k.isDark ? k.color.alpha(c.bg, 0.55) : 'rgba(255,255,255,0.4)'; g.fill();
        g.shadowColor = 'transparent';
        g.fillStyle = bg; g.fill();
        g.restore();
        // scanlines + shimmer band, clipped to the body
        g.save();
        k.draw.rrectPath(g, x0, y0, w, h, r); g.clip();
        g.fillStyle = k.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(20,30,60,0.035)';
        const step = 4 * k.u;
        for (let y = y0 + ((t * 6 * k.u) % step); y < y0 + h; y += step) g.fillRect(x0, y, w, Math.max(1, 0.8 * k.u));
        const by = y0 + (((t * 0.2) % 1.4) - 0.2) * PH;
        const sg = g.createLinearGradient(0, by - PH * 0.12, 0, by + PH * 0.12);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, k.isDark ? 'rgba(255,255,255,0.05)' : k.color.alpha(c.accent, 0.05)); sg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = sg; g.fillRect(x0, by - PH * 0.12, w, PH * 0.24);
        g.restore();
        // edge light: peaks at the top corners
        g.save();
        k.draw.rrectPath(g, x0 + 0.5, y0 + 0.5, w - 1, h - 1, r);
        const eg = g.createLinearGradient(x0, y0, x0 + w, y0 + h);
        const ec = k.isDark ? k.color.mix(c.accent, '#ffffff', 0.45) : c.accent;
        eg.addColorStop(0, k.color.alpha(ec, 0.9)); eg.addColorStop(0.35, k.color.alpha(ec, 0.25)); eg.addColorStop(0.65, k.color.alpha(ec, 0.25)); eg.addColorStop(1, k.color.alpha(ec, 0.7));
        g.strokeStyle = eg; g.lineWidth = 1.2 * k.u; g.stroke();
        g.restore();
        // copy, revealed by a scan line moving down
        const scan = ease.inOutCubic(m.seg(t, 0.55, 0.8));
        const copyA = 1 - ease.inCubic(m.seg(t, D - 0.5, 0.25));
        if (scan > 0 && copyA > 0) {
          const sy = y0 + scan * (h + 4 * k.u);
          g.save();
          g.beginPath(); g.rect(x0, y0, w, sy - y0); g.clip();
          let y = y0 + padY + capH / 2;
          const tx = x0 + padX;
          hl.forEach((ln, i) => k.text.draw(g, ln, tx, y + i * hLH, { ...hO, baseline: 'middle', alpha: copyA, qaGroup: head }));
          y += (hl.length - 1) * hLH + capH / 2 + 44 * k.u;
          sl.forEach((ln, i) => k.text.draw(g, ln, tx, y + i * sLH, { ...sO, baseline: 'top', color: c.muted, alpha: copyA, qaGroup: sub }));
          g.restore();
          if (scan < 1) {
            g.save();
            g.globalAlpha = Math.sin(Math.PI * scan) * 0.9;
            const lg = g.createLinearGradient(x0, 0, x0 + w, 0);
            lg.addColorStop(0, k.color.alpha(c.accent, 0)); lg.addColorStop(0.5, k.isDark ? k.color.mix(c.accent, '#ffffff', 0.4) : c.accent); lg.addColorStop(1, k.color.alpha(c.accent, 0));
            g.fillStyle = lg; g.fillRect(x0, sy - 1 * k.u, w, 2 * k.u);
            g.restore();
          }
        }
      }
      g.restore();
    },
  };
}
