// Film composer: turns a storyboard spec into a film the stage can render.
//
// spec = {
//   shots: [
//     { effect: 'type.baseline-rise', dur: 3.2, params: {...}, copy: { headline: '...' },
//       transition: { effect: 'transition.mask-wipe', dur: 0.6 } },   // transition INTO the next shot
//     ...
//   ],
//   score: { bpm, root, progression, sections, cues }   // optional; shot sfx are appended
//   post: { bloom, grain, vignette }                    // optional
// }
import { resolveParams, sampleShot } from './stage.js';

export function composeFilm(k, spec, effects) {
  const byId = new Map(effects.map((m) => [m.meta.id, m]));
  const timeline = [];
  let t = 0;
  const cues = [];
  spec.shots.forEach((s, i) => {
    const mod = byId.get(s.effect);
    if (!mod) throw new Error(`unknown effect ${s.effect}`);
    const kk = Object.create(k);
    const brand = { ...k.brand, copy: { ...(k.brand.copy || {}), ...(s.copy || {}) } };
    kk.brand = brand;
    kk.copy = (key, fb) => (brand.copy[key] !== undefined ? brand.copy[key] : fb);
    const p = resolveParams(mod.meta, s.params || {});
    const dur = s.dur ?? mod.meta.duration ?? 4;
    const inst = mod.create(kk, { ...p, duration: dur });
    const shot = { i, mod, inst, kk, start: t, dur, end: t + dur, own: !!mod.meta.ownsBackground, flat: !!mod.meta.flatBackground };
    timeline.push(shot);
    const sfx = typeof mod.sfx === 'function' ? mod.sfx(p, dur) : (mod.meta.sfx || []);
    for (const c of s.sfx ?? sfx) if (c.t <= dur) cues.push({ ...c, t: c.t + t });
    const tr = s.transition && i < spec.shots.length - 1 ? s.transition : null;
    if (tr) {
      const tm = byId.get(tr.effect);
      if (!tm) throw new Error(`unknown transition ${tr.effect}`);
      const td = tr.dur ?? tm.meta.duration ?? 0.6;
      shot.tr = { mod: tm, inst: tm.create(k, resolveParams(tm.meta, tr.params || {})), dur: td };
      const tsfx = tm.meta.sfx || [];
      for (const c of tsfx) cues.push({ ...c, t: c.t + shot.end - td });
      t += dur - td; // next shot starts during the transition
    } else t += dur;
  });
  const total = timeline.length ? timeline[timeline.length - 1].end : 0;

  function drawShot(g, shot, t) {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (!shot.own) shot.kk.draw.background(g, { gradient: shot.flat ? false : undefined });
    shot.inst.draw(g, Math.max(0, Math.min(shot.dur, t - shot.start)));
    g.restore();
  }
  return {
    duration: spec.duration ?? total,
    timeline,
    draw(g, t) {
      // active shots at t
      const cur = timeline.filter((s) => t >= s.start && t < s.end + 1e-6);
      const shot = cur[cur.length - 1] || timeline[timeline.length - 1];
      const prev = timeline[shot.i - 1];
      if (prev && prev.tr && t < prev.end) {
        const a = k.layer('__compA'), b = k.layer('__compB');
        k.qa.mute(() => { drawShot(k.ctx(a), prev, t); drawShot(k.ctx(b), shot, t); });
        const tt = t - (prev.end - prev.tr.dur);
        prev.tr.inst.draw(g, tt, { a, b, dur: prev.tr.dur });
      } else drawShot(g, shot, t);
    },
    score: spec.score ? { ...spec.score, cues: [...(spec.score.cues || []), ...cues] } : { bpm: 110, sections: [{ from: 0, to: total, energy: 0.45, layers: ['pad', 'bass'] }], cues },
    post: spec.post ? () => spec.post : undefined,
  };
}
