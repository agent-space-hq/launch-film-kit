// Page bootstrap: loads fonts, exposes window.LFK for the Node driver.
import { Stage, effectFilm, resolveParams } from './lfk/stage.js';
import { renderScore } from './lfk/audio.js';
import { EFFECTS } from './effects/index.js';

const FONTS = [
  ['Geist', 'Geist-Variable.ttf', { weight: '100 900' }],
  ['Geist Mono', 'GeistMono-Variable.ttf', { weight: '100 900' }],
  ['Inter', 'Inter-Variable.ttf', { weight: '100 900' }],
  ['Inter', 'Inter-Italic-Variable.ttf', { weight: '100 900', style: 'italic' }],
  ['Instrument Serif', 'InstrumentSerif-Regular.ttf', { weight: '400' }],
  ['Instrument Serif', 'InstrumentSerif-Italic.ttf', { weight: '400', style: 'italic' }],
  ['DM Mono', 'DMMono-Light.ttf', { weight: '300' }],
  ['DM Mono', 'DMMono-Regular.ttf', { weight: '400' }],
  ['DM Mono', 'DMMono-Medium.ttf', { weight: '500' }],
];
async function loadFonts() {
  await Promise.all(FONTS.map(async ([fam, file, desc]) => {
    const f = new FontFace(fam, `url(/fonts/${file})`, desc);
    await f.load(); document.fonts.add(f);
  }));
}

const byId = new Map(EFFECTS.map((m) => [m.meta.id, m]));
let stage = null;
const errors = [];
window.addEventListener('error', (e) => errors.push(String(e.message)));
window.addEventListener('unhandledrejection', (e) => errors.push(String(e.reason)));

async function post(name, body) {
  const r = await fetch(`/save?name=${encodeURIComponent(name)}`, { method: 'POST', body });
  if (!r.ok) throw new Error('save failed ' + name);
}
const blobOf = (c) => new Promise((r) => c.toBlob(r, 'image/png'));

window.LFK = {
  effects: () => EFFECTS.map((m) => ({ ...m.meta, params: undefined, paramSpec: m.meta.params })),
  errors: () => errors.splice(0),
  // Set up a stage for a single effect preview or a film module (by URL).
  async setup({ w, h, brand, effect, params, film, post: postOpts }) {
    document.querySelectorAll('canvas#out').forEach((c) => c.remove());
    stage = new Stage(w, h, brand);
    if (postOpts) stage.setPost(postOpts);
    let f;
    if (effect) {
      const mod = byId.get(effect);
      if (!mod) throw new Error('unknown effect ' + effect);
      f = effectFilm(stage.k, mod, params || {});
    } else if (film) {
      const mod = await import(film);
      f = await mod.default(stage.k, params || {});
    }
    const info = stage.setFilm(f);
    return { ...info, sfx: f.sfx || [], score: f.score || null, meta: f.meta ? { id: f.meta.id, name: f.meta.name } : null };
  },
  // Render frames [a, b) and upload raw RGBA to the driver.
  async framesToServer(a, b, fps, sub, shutter) {
    const inflight = [];
    for (let i = a; i < b; i++) {
      stage.renderFrame(i, fps, sub, shutter);
      const px = stage.post.read();
      let blob = new Blob([px]);
      inflight.push(fetch(`/frame?i=${i}`, { method: 'POST', body: blob }).then((r) => { if (!r.ok) throw new Error('frame upload ' + r.status); }));
      blob = null;
      if (inflight.length >= 2) await inflight.shift();
      if ((i - a) % 8 === 7 && window.gc) window.gc(); // free uploaded blobs (blob store is small)
    }
    await Promise.all(inflight);
    if (window.gc) window.gc();
  },
  async still(t, fps, sub, name) {
    stage.renderFrame(Math.round(t * fps), fps, sub);
    await post(name, await blobOf(stage.out));
  },
  // Contact sheet: n frames spread over the film, laid out cols wide, saved as one PNG.
  async sheet({ n = 12, cols = 4, scale = 0.25, name, label = '' }) {
    const dur = stage.film.duration, W = stage.W, H = stage.H;
    const cw = Math.round(W * scale), ch = Math.round(H * scale), pad = 6, head = label ? 34 : 0;
    const rows = Math.ceil(n / cols);
    const c = document.createElement('canvas');
    c.width = cols * (cw + pad) + pad; c.height = rows * (ch + pad + 18) + pad + head;
    const g = c.getContext('2d');
    g.fillStyle = '#1b1c20'; g.fillRect(0, 0, c.width, c.height);
    g.font = '600 18px Geist'; g.fillStyle = '#fff'; if (label) g.fillText(label, pad + 4, 24);
    for (let i = 0; i < n; i++) {
      const t = stage.film.loop ? (dur * i) / n : (dur * (i + 0.5)) / n;
      stage.renderFrame(Math.round(t * 60), 60, 1);
      const x = pad + (i % cols) * (cw + pad), y = head + pad + Math.floor(i / cols) * (ch + pad + 18);
      g.drawImage(stage.out, x, y, cw, ch);
      g.font = '500 13px Geist Mono'; g.fillStyle = '#aaa'; g.fillText(`t=${t.toFixed(2)}s`, x + 2, y + ch + 14);
    }
    await post(name, await blobOf(c));
  },
  // QA: render every `step`-th frame at sub=1, collect counters.
  qa({ fps = 30, step = 2, minPx, margin } = {}) {
    const dur = stage.film.duration, k = stage.k;
    k.qaEnabled = true;
    const grain0 = stage.post0.grain; stage.post0.grain = 0;
    const tot = { offstage: 0, overlap: 0, tiny: 0, contrast: 0, cjk: 0, blank: 0, frames: 0 };
    const items = [];
    const nF = Math.floor(dur * fps);
    for (let i = 0; i < nF; i += step) {
      stage.renderFrame(i, fps, 1);
      const px = stage.post.read();
      const r = k.qa.check(px, { minPx, margin });
      for (const key of ['offstage', 'overlap', 'tiny', 'contrast', 'cjk']) if (r[key]) { tot[key]++; }
      if (r.items.length && items.length < 40) items.push([+(i / fps).toFixed(2), ...r.items.slice(0, 3)]);
      // blank frame: almost no variance
      let mn = 255, mx = 0;
      for (let p = 0; p < px.length; p += 4 * 997) { const l = px[p] + px[p + 1] + px[p + 2]; if (l < mn) mn = l; if (l > mx) mx = l; }
      if (mx - mn < 6 && i / fps > 0.3 && i / fps < dur - 0.3 && !(stage.film.meta && stage.film.meta.qaAllowBlank)) tot.blank++;
      tot.frames++;
    }
    // determinism: frame rendered twice in different order must match
    const probe = Math.floor(nF * 0.61);
    stage.renderFrame(probe, fps, 1); const h1 = hashPx(stage.post.read());
    stage.renderFrame(Math.floor(nF * 0.2), fps, 1);
    stage.renderFrame(probe, fps, 1); const h2 = hashPx(stage.post.read());
    tot.nondeterministic = h1 === h2 ? 0 : 1;
    if (stage.film.loop) {
      // seam: last frame before the wrap -> frame 0 must change no more than a normal frame step
      const last = Math.round(dur * fps) - 1;
      const diff = (a, b) => { let d = 0, n = 0; for (let p = 0; p < a.length; p += 4 * 7) { d += Math.abs(a[p] - b[p]) + Math.abs(a[p + 1] - b[p + 1]) + Math.abs(a[p + 2] - b[p + 2]); n++; } return d / n; };
      stage.renderFrame(0, fps, 1); const f0 = stage.post.read().slice();
      stage.renderFrame(1, fps, 1); const f1 = stage.post.read().slice();
      stage.renderFrame(last, fps, 1); const fl = stage.post.read().slice();
      const step = diff(f0, f1), seam = diff(fl, f0);
      tot.seam = seam > Math.max(1.0, step * 3) ? 1 : 0;
      if (tot.seam) items.push(['seam', seam, 'normal step', step]);
    }
    k.qaEnabled = false;
    stage.post0.grain = grain0;
    tot.errors = errors.length;
    return { counters: tot, items, strings: [...k.qa.strings].slice(0, 200) };
  },
  async score(spec, duration, name) {
    const wav = await renderScore(spec, duration);
    await post(name, new Blob([wav]));
    return { ok: true };
  },
  duration: () => stage.film.duration,
};
function hashPx(px) { let h = 2166136261; for (let i = 0; i < px.length; i += 61) { h ^= px[i]; h = Math.imul(h, 16777619); } return h >>> 0; }
await loadFonts();
window.LFK_READY = true;
