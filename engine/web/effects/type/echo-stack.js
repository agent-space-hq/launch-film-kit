// The headline fans out into a vertical stack of outlined echoes, each a step
// further back in depth. After a short hold the echoes collapse into the centre
// copy, which fills in solid at the moment they meet.
export const meta = {
  id: 'type.echo-stack',
  name: 'Echo Stack',
  category: 'type',
  duration: 4.4,
  summary: 'Outlined copies of the headline fan out above and below it, receding in depth, then collapse back into the centre line, which fills solid as they land; the solid line holds to the end.',
  bestFor: ['headline', 'emphasis beat', 'chapter title'],
  slots: ['headline'],
  params: {
    text: { default: null, label: 'Headline (defaults to brand headline)' },
    echoes: { default: 4, min: 1, max: 6, label: 'Echoes on each side' },
  },
  sfx: [{ t: 0.05, type: 'whoosh', dur: 0.6, gain: 0.3 }, { t: 1.55, type: 'riser', dur: 0.6, gain: 0.3 }, { t: 2.2, type: 'hit', gain: 0.45 }],
  prompt: `Balance the headline into at most 3 lines (display weight 660, tracking -0.035 em, about 11% of frame height). Build up to 4 echoes above and 4 below the centre copy, spaced by the block height plus 22% of the size. Echoes are clean accent outlines (fill plus 3 px stroke on a scratch layer, fill punched out), opacity falling 17% per step, and scale down 4% per step for depth. 0-1.1 s: the centre outline fades in and echoes fan out from it (outExpo 800 ms, 60 ms stagger by distance). Hold the stack 300 ms. From 1.4 s echoes collapse to the centre over 620 ms (inOutCubic, outermost last, 40 ms steps), fading over their final 30% of travel. At 2.15 s, once every echo has landed, the centre copy fills solid in the foreground colour over 350 ms (outCubic) with a 2% scale settle while its outline fades. Hold the solid line to the end.`,
};

export function create(k, p) {
  const { ease, m } = k;
  const str = p.text || k.copy('headline', 'Make something people want.');
  const o = { role: 'display', size: k.pick({ wide: 128, square: 108, tall: 100 }), weight: 660, tracking: -0.035 };
  const maxW = k.safe.w * 0.88;
  let lines = k.text.balance(str, o, maxW);
  while (lines.length > 3 && o.size > 40) { o.size *= 0.93; lines = k.text.balance(str, o, maxW); }
  const E = Math.round(p.echoes);
  const T_FILL = 2.15; // echoes have fully landed by now
  return {
    draw(g, t) {
      const c = k.brand.colors;
      const lh = o.size * 1.08 * k.u;
      const blockH = (lines.length - 1) * lh + o.size * 0.72 * k.u;
      const spacing = blockH + o.size * 0.22 * k.u;
      const block = (dy, scale, opts) => {
        g.save();
        g.translate(k.cx, k.cy + dy);
        g.scale(scale, scale);
        lines.forEach((ln, li) => {
          k.text.draw(g, ln, 0, -((lines.length - 1) * lh) / 2 + li * lh, { ...o, align: 'center', baseline: 'middle', ...opts });
        });
        g.restore();
      };
      // Clean outline: on a scratch layer, fill + stroke the block (a dilated
      // silhouette), then punch the plain fill back out. Leaves a ring that hugs
      // the outside of each glyph without the font's internal overlap contours.
      const lay = k.layer('echo-stack'), lg = k.ctx(lay);
      const ring = (dy, scale, color, alpha) => {
        if (alpha <= 0.004) return;
        lg.setTransform(1, 0, 0, 1, 0, 0);
        lg.clearRect(0, 0, k.W, k.H);
        k.qa.allowOverlap(() => k.qa.allowOffstage(() => {
          lg.globalCompositeOperation = 'source-over';
          lg.save(); lg.translate(k.cx, k.cy + dy); lg.scale(scale, scale);
          lines.forEach((ln, li) => k.text.draw(lg, ln, 0, -((lines.length - 1) * lh) / 2 + li * lh, { ...o, align: 'center', baseline: 'middle', color, stroke: { color, width: 3.2 }, qaGroup: 'echo' }));
          lg.globalCompositeOperation = 'destination-out';
          lines.forEach((ln, li) => k.text.draw(lg, ln, 0, -((lines.length - 1) * lh) / 2 + li * lh, { ...o, align: 'center', baseline: 'middle', color, qaGroup: 'echo' }));
          lg.restore();
          lg.globalCompositeOperation = 'source-over';
        }));
        g.save();
        g.globalAlpha = alpha;
        g.drawImage(lay, 0, 0);
        g.restore();
      };
      for (let d = E; d >= 1; d--) {
        const out = ease.outExpo(m.seg(t, 0.05 + d * 0.06, 0.8));
        const inn = ease.inOutCubic(m.seg(t, 1.4 + d * 0.04, 0.62));
        const pos = out * (1 - inn);
        const a = (1 - d * 0.17) * Math.min(1, out * 1.5) * m.clamp(pos / 0.3);
        if (a <= 0.005) continue;
        const sc = 1 - d * 0.04 * pos;
        ring(-d * spacing * pos, sc, c.accent, a);
        ring(d * spacing * pos, sc, c.accent, a);
      }
      // centre copy: outline, then fill
      const fill = ease.outCubic(m.seg(t, T_FILL, 0.35));
      const lineIn = ease.outCubic(m.seg(t, 0, 0.3));
      const settle = 1 + 0.02 * (1 - ease.outExpo(m.seg(t, T_FILL, 0.6))) * (t >= T_FILL ? 1 : 0);
      if (fill < 1) ring(0, settle, c.fg, lineIn * (1 - fill));
      if (fill > 0) {
        if (k.isDark) k.draw.glow(g, k.cx, k.cy, Math.min(k.W, k.H) * 0.45, c.accent, 0.10 * Math.sin(Math.PI * m.seg(t, T_FILL, 0.9)));
        block(0, settle, { color: c.fg, alpha: fill, qaGroup: str });
      }
    },
  };
}
