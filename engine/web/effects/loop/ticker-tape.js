// Two angled marquee bands cross the frame in an X: an accent band drifting left and
// an inverse (foreground-coloured) band drifting right on top of it. The words are the
// brand name and features, separated by the mark. Offsets advance exactly one
// sequence width per loop, so the motion is seamless.
export const meta = {
  id: 'loop.ticker-tape',
  name: 'Ticker Tape',
  category: 'loop',
  duration: 6,
  loop: true,
  summary: 'Two tilted marquee bands (accent and inverse) carrying the brand name and features, separated by the mark, cross in an X and scroll in opposite directions forever; seamless loop.',
  bestFor: ['social loop', 'event or launch hype', 'section break'],
  slots: ['features'],
  params: {
    upper: { default: true, label: 'Uppercase words' },
  },
  sfx: [],
  prompt: `Build one word sequence: brand name, then each feature, each followed by a small copy of the mark (70% of cap height) as the separator; measure its width P in display weight 700 at about 6% of the short side (uppercase, +0.01 em). Band A: accent fill, about 15% of the short side tall, rotated +8 degrees (+11 on square, +14 on portrait) through the frame centre (shifted up 4-9% of the height on square/portrait), long enough to cover the diagonal, text in the best neutral on the accent. Band B: inverse band (foreground colour fill, page-colour text) rotated -6 degrees (-9 / -11), shifted down by the same amount, drawn on top with a soft shadow. Tile the sequence along each band; band A scrolls left and band B right by exactly one P per loop length (constant drift, linear by design), so frame(loop) equals frame(0). Shift band B's tiling by half a sequence so the words do not line up. A faint dot grid sits behind.`,
};

export function create(k, p) {
  const { m } = k;
  const c = k.brand.colors, C = k.color;
  const name = k.brand.name || 'Brand';
  const feats = k.copy('features', null) || ['Plan', 'Build', 'Ship'];
  const words = [name, ...feats].map((w) => (p.upper ? w.toUpperCase() : w));
  const o = { size: k.pick({ wide: 66, square: 62, tall: 60 }), weight: 700, tracking: 0.01 };
  const gapW = o.size * 0.55 * k.u;
  const markS = k.text.layout('H', o).cap * 0.95;
  const markW = markS * k.logo.aspect;
  const items = [];
  let P = 0;
  for (const w of words) {
    const L = k.text.layout(w, o);
    items.push({ w, x: P, width: L.width, L });
    P += L.width + gapW;
    items.push({ mark: true, x: P, width: markW });
    P += markW + gapW;
  }
  const bandH = k.pick({ wide: 164, square: 164, tall: 156 }) * k.u;
  const Lb = Math.hypot(k.W, k.H) * 1.1;
  const onA = C.onColor(c.accent, ['#ffffff', c.bg, c.fg]);

  function band(g, angle, dy, fill, txt, offset, shadow) {
    g.save();
    g.translate(k.cx, k.cy + dy);
    g.rotate(angle);
    if (shadow) {
      g.save();
      g.shadowColor = k.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(20,30,60,0.18)';
      g.shadowBlur = 30 * k.u; g.shadowOffsetY = 8 * k.u;
      g.fillStyle = fill; g.fillRect(-Lb / 2, -bandH / 2, Lb, bandH);
      g.restore();
    }
    g.fillStyle = fill; g.fillRect(-Lb / 2, -bandH / 2, Lb, bandH);
    // hairline edges
    g.fillStyle = C.alpha(txt, 0.12);
    g.fillRect(-Lb / 2, -bandH / 2 + 8 * k.u, Lb, Math.max(1, k.u));
    g.fillRect(-Lb / 2, bandH / 2 - 8 * k.u - Math.max(1, k.u), Lb, Math.max(1, k.u));
    const start = -Lb / 2 - P + (((offset % P) + P) % P);
    k.qa.allowOffstage(() => k.qa.allowOverlap(() => {
      for (let x0 = start; x0 < Lb / 2; x0 += P) {
        for (const it of items) {
          const x = x0 + it.x;
          if (x + it.width < -Lb / 2 || x > Lb / 2) continue;
          if (it.mark) k.logo.draw(g, x + markW / 2, 0, markS, { color: txt });
          else {
            // glyph by glyph at the kerned layout positions: QA measures each glyph's own
            // (small) box, which stays inside the tilted band
            for (const gl of it.L.glyphs) {
              if (gl.ch === ' ') continue;
              const M = g.getTransform();
              const lx = x + gl.x + gl.w / 2;
              const dx = M.a * lx + M.e, dy = M.b * lx + M.f;
              const edge = it.L.px * 0.7;
              if (dx < -edge * 2 || dx > k.W + edge * 2 || dy < -edge * 2 || dy > k.H + edge * 2) continue;
              if (dx < edge || dx > k.W - edge || dy < edge || dy > k.H - edge) {
                // straddling the frame edge: plain fillText (QA's contrast ring would only find the
                // neighbouring glyph's ink here); still recorded for offstage/overlap/size
                g.save();
                g.font = it.L.font; g.letterSpacing = '0px'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
                g.fillStyle = txt;
                g.fillText(gl.ch, x + gl.x, it.L.cap / 2);
                g.restore();
              } else {
                k.text.draw(g, gl.ch, x + gl.x, 0, { ...o, tracking: 0, baseline: 'middle', color: txt, qaGroup: it.w });
              }
            }
          }
        }
      }
    }));
    g.restore();
  }

  return {
    draw(g, t) {
      const D = p.duration ?? meta.duration;
      const ph = (((t / D) % 1) + 1) % 1;
      k.draw.dotGrid(g, 36, 1.3, C.alpha(c.fg, k.isDark ? 0.08 : 0.1));
      const deg = Math.PI / 180;
      const [aA, aB] = k.pick({ wide: [8, -6], square: [11, -9], tall: [14, -11] });
      const off = k.pick({ wide: 0, square: 0.04, tall: 0.09 }) * k.H;
      band(g, aA * deg, -off, c.accent, onA, -ph * P, false);
      band(g, aB * deg, off, c.fg, c.bg, ph * P + P / 2, true);
    },
  };
}
