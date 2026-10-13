// Product-shot staging for the mark: the logo as a thick plate stands on a round
// pedestal under a soft top light, while a rim light travels around the set. The
// light's angle drives everything it touches: a bright arc that runs around the
// pedestal's top edge, an edge glint on the side of the plate facing it, and the
// plate's faint reflection in the pedestal top.
export const meta = {
  id: 'hero3d.pedestal-sweep',
  name: 'Pedestal Sweep',
  category: 'hero3d',
  duration: 5.5,
  summary: 'The mark, as a thick plate, settles onto a lit pedestal while a rim light sweeps around the set, running along the pedestal edge and glinting off the plate; holds, then dims out.',
  bestFor: ['brand reveal', 'product hero', 'end card'],
  slots: [],
  params: {
    turns: { default: 1.15, min: 0.5, max: 2, label: 'Rim light turns' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 1.2, gain: 0.4 }, { t: 0.95, type: 'tick', gain: 0.5 }, { t: 1.4, type: 'shimmer', dur: 2.4, gain: 0.35 }],
  prompt: `Studio set: soft top spotlight (radial, 55% of the height) on the background. A cylinder pedestal, top ellipse radius 38% of the short side (ratio 0.22), 6% tall, side shaded with a vertical gradient, top with a radial gradient. 0-900 ms: the pedestal rises 4% and fades in (outExpo). 350-1250 ms: the mark (40% of the short side tall) descends 9% onto it (outExpo) as a plate 2.6% thick, built from 16 offset copies of the mark shaded dark to light, face in the mark's own colours, yaw swinging ±0.18 rad over the shot (inOutCubic). From 1100 ms a rim light orbits 1.15 turns (standard ease) until 450 ms before the end. Its angle places a gaussian highlight arc (±0.5 rad) on the pedestal's top edge, a white edge glint on the plate offset toward the light (strongest when the light is behind), and a 12% reflection of the plate in the pedestal top. Exit: everything dims over the last 450 ms (inCubic).`,
};

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const markH = k.vmin * 0.4;
  const mw = markH * k.logo.aspect;
  const pad = Math.ceil(8 * k.u);
  const sw = Math.ceil(mw + pad * 2), sh = Math.ceil(markH + pad * 2);
  const mkSprite = (color) => {
    const cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
    k.logo.draw(cv.getContext('2d'), sw / 2, sh / 2, markH, color ? { color } : {});
    return cv;
  };
  const face = mkSprite(null);
  const SH = 6;
  const wallBack = k.isDark ? k.color.mix(c.bg, c.accent, 0.1) : k.color.mix(c.fg, c.accent, 0.35);
  const wallFront = k.isDark ? k.color.mix(c.bg, c.accent, 0.45) : k.color.mix(c.fg, c.accent, 0.55);
  const walls = Array.from({ length: SH }, (_, i) => mkSprite(k.color.mix(wallBack, wallFront, i / (SH - 1))));
  const glint = mkSprite('#ffffff');
  const studio = k.layer('pedestal-bg');
  {
    const gg = k.ctx(studio);
    gg.fillStyle = c.bg; gg.fillRect(0, 0, k.W, k.H);
    const sp = gg.createRadialGradient(k.cx, k.H * 0.3, 0, k.cx, k.H * 0.3, k.H * 0.75);
    sp.addColorStop(0, k.isDark ? k.color.mix(c.bg, c.fg, 0.07) : '#ffffff');
    sp.addColorStop(1, k.isDark ? c.bg : k.color.mix(c.bg, c.fg, 0.04));
    gg.fillStyle = sp; gg.fillRect(0, 0, k.W, k.H);
  }
  return {
    draw(g, t) {
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const pin = ease.outExpo(m.seg(t, 0, 0.9));
      const min = ease.outExpo(m.seg(t, 0.35, 0.9));
      const vis = 1 - exit;
      g.globalAlpha = pin * (1 - exit * 0.9);
      g.drawImage(studio, 0, 0);
      g.globalAlpha = 1;
      const Rp = k.vmin * 0.38 * k.pick({ wide: 1, square: 1.05, tall: 1.12 });
      const er = 0.22;
      const ph = k.vmin * 0.06;
      const topY = k.cy + markH * 0.42 + (1 - pin) * 0.04 * k.H;
      const cx = k.cx;
      // light angle: 0 = light at the right, PI/2 = in front (toward camera), -PI/2 = behind
      const L = ease.standard(m.seg(t, 1.1, Math.max(0.5, D - 1.55)));
      const phi = -Math.PI / 2 - 0.6 + L * p.turns * m.TAU;
      const lightOn = m.smoothstep(1.0, 1.5, t) * vis;
      g.save();
      g.globalAlpha = pin * vis;
      // floor shadow / pool
      g.save(); g.translate(cx, topY + ph); g.scale(1, er * 1.1);
      const fp = g.createRadialGradient(0, 0, Rp * 0.8, 0, 0, Rp * 1.9);
      fp.addColorStop(0, k.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,60,0.16)');
      fp.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = fp; g.beginPath(); g.arc(0, 0, Rp * 1.9, 0, m.TAU); g.fill();
      g.restore();
      // pedestal side
      const side = new Path2D();
      side.ellipse(cx, topY, Rp, Rp * er, 0, 0, Math.PI);
      side.lineTo(cx - Rp, topY);
      const sideB = new Path2D();
      sideB.moveTo(cx - Rp, topY); sideB.lineTo(cx - Rp, topY + ph);
      sideB.ellipse(cx, topY + ph, Rp, Rp * er, 0, Math.PI, 0, true);
      sideB.lineTo(cx + Rp, topY); sideB.ellipse(cx, topY, Rp, Rp * er, 0, 0, Math.PI, false);
      const sg = g.createLinearGradient(cx - Rp, 0, cx + Rp, 0);
      const s0 = k.isDark ? k.color.mix(c.surface, c.bg, 0.4) : k.color.mix(c.surface, c.fg, 0.1);
      const s1 = k.isDark ? k.color.mix(c.surface, c.fg, 0.06) : c.surface;
      sg.addColorStop(0, s0); sg.addColorStop(0.55, s1); sg.addColorStop(1, s0);
      g.fillStyle = sg; g.fill(sideB);
      // pedestal top
      const top = new Path2D(); top.ellipse(cx, topY, Rp, Rp * er, 0, 0, m.TAU);
      const tg = g.createRadialGradient(cx, topY - Rp * er * 0.3, 0, cx, topY, Rp);
      tg.addColorStop(0, k.isDark ? k.color.mix(c.surface, c.fg, 0.12) : '#ffffff');
      tg.addColorStop(1, k.isDark ? c.surface : k.color.mix(c.surface, c.fg, 0.05));
      g.fillStyle = tg; g.fill(top);
      g.strokeStyle = k.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(20,30,60,0.1)'; g.lineWidth = 1 * k.u; g.stroke(top);
      g.restore();
      // plate geometry
      const yaw = -0.18 + 0.36 * ease.inOutCubic(m.seg(t, 0.3, D - 0.6));
      const fx = Math.cos(yaw);
      const thick = k.vmin * 0.026;
      const dvx = -Math.sin(yaw) * thick * 3, dvy = -thick * 0.25;
      // the hull's base (5% above the bottom of the mark box) sits just in front of the pedestal centre
      const baseY = topY + Rp * er * 0.18;
      const my = baseY - markH * 0.45 - (1 - min) * 0.09 * k.H;
      const baseInSprite = sh / 2 + markH * 0.45;
      const ma = Math.min(1, min * 1.4) * vis;
      // reflection in the pedestal top: mirrored about the base line, foreshortened, fading with distance
      if (ma > 0 && min > 0.98) {
        g.save();
        g.clip(new Path2D(top));
        g.translate(cx, baseY); g.scale(fx, -0.42);
        g.globalAlpha = ma * (k.isDark ? 0.16 : 0.1);
        g.drawImage(face, -sw / 2, -baseInSprite);
        g.restore();
        // fade the reflection out toward the front rim
        g.save(); g.clip(new Path2D(top));
        const rf = g.createLinearGradient(0, baseY, 0, topY + Rp * er);
        const tc = k.isDark ? k.color.mix(c.surface, c.fg, 0.06) : k.color.mix(c.surface, c.fg, 0.03);
        rf.addColorStop(0, k.color.alpha(tc, 0)); rf.addColorStop(1, k.color.alpha(tc, 0.9));
        g.fillStyle = rf; g.fillRect(cx - Rp, baseY, Rp * 2, Rp * er * 1.2);
        g.restore();
      }
      // back half of the rim highlight (behind the plate)
      const rimArc = (front) => {
        if (lightOn <= 0) return;
        g.save();
        g.globalCompositeOperation = k.isDark ? 'lighter' : 'source-over';
        const SEG = 40;
        for (let s = 0; s < SEG; s++) {
          const a0 = phi - 0.6 + (s / SEG) * 1.2, a1 = a0 + 1.2 / SEG + 0.004;
          const am = (a0 + a1) / 2;
          const isFront = Math.sin(am) > 0;
          if (isFront !== front) continue;
          const w = Math.exp(-(((am - phi) / 0.32) ** 2));
          g.beginPath(); g.ellipse(cx, topY, Rp, Rp * er, 0, a0, a1);
          g.strokeStyle = k.isDark ? k.color.mix('#ffffff', c.accent, 0.35) : c.accent;
          g.globalAlpha = w * lightOn * (k.isDark ? 0.9 : 0.75);
          g.lineWidth = (front ? 3 : 2) * k.u; g.lineCap = 'round';
          g.stroke();
        }
        g.restore();
      };
      rimArc(false);
      if (ma > 0) {
        g.save();
        g.globalAlpha = ma;
        // contact shadow
        g.save(); g.translate(cx, topY); g.scale(1, er);
        const cs = g.createRadialGradient(0, 0, 0, 0, 0, mw * 0.7);
        cs.addColorStop(0, k.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.22)'); cs.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = cs; g.beginPath(); g.arc(0, 0, mw * 0.7, 0, m.TAU); g.fill();
        g.restore();
        const LAY = 16;
        for (let j = 0; j < LAY; j++) {
          const f = 1 - j / (LAY - 1);
          g.save();
          g.translate(cx + dvx * f, my + dvy * f); g.scale(fx, 1);
          g.drawImage(walls[Math.min(SH - 1, Math.floor((1 - f) * SH))], -sw / 2, -sh / 2);
          g.restore();
        }
        // edge glint on the side facing the light (strongest when the light is behind)
        const behind = Math.max(0, -Math.sin(phi));
        const gl = lightOn * (0.25 + 0.75 * behind);
        if (gl > 0.01) {
          g.save();
          g.globalAlpha = ma * gl * (k.isDark ? 0.9 : 0.6);
          g.translate(cx + Math.cos(phi) * 2.2 * k.u, my - 1.2 * k.u); g.scale(fx, 1);
          g.drawImage(glint, -sw / 2, -sh / 2);
          g.restore();
        }
        g.save();
        g.translate(cx, my); g.scale(fx, 1);
        g.drawImage(face, -sw / 2, -sh / 2);
        g.restore();
        g.restore();
      }
      rimArc(true);
      // soft light bloom where the rim light sits, front half only
      if (lightOn > 0 && Math.sin(phi) > -0.2 && k.isDark) {
        const lx = cx + Math.cos(phi) * Rp, ly = topY + Math.sin(phi) * Rp * er;
        k.draw.glow(g, lx, ly, Rp * 0.45, c.accent, 0.22 * lightOn * m.smoothstep(-0.2, 0.4, Math.sin(phi)));
      }
    },
  };
}
