// Live effect tiles: render any library effect into a small canvas with its own
// kit (size + brand), so films can show walls and montages of real, live effects.
import { makeKit, effectFilm } from '../../lfk/stage.js';

export function makeTileSystem(effects) {
  const cache = new Map();
  // key: id|w|h|brandName
  function get(mod, w, h, brand, params) {
    const key = `${mod.meta.id}|${w}|${h}|${brand.name}|${brand.mode}|${brand.colors?.bg}|${brand.colors?.accent}|${JSON.stringify(params || {})}`;
    let e = cache.get(key);
    if (!e) {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const k = makeKit(w, h, brand);
      const film = effectFilm(k, mod, params || {});
      e = { canvas, g: canvas.getContext('2d'), k, film };
      cache.set(key, e);
    }
    return e;
  }
  // Draw effect `mod` at local time t into a w×h canvas and return it.
  function render(mod, t, w, h, brand, params) {
    const e = get(mod, w, h, brand, params);
    const g = e.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.fillStyle = e.k.brand.colors.bg; g.fillRect(0, 0, w, h);
    const d = e.film.duration;
    const tt = e.film.loop ? ((t % d) + d) % d : Math.max(0, Math.min(d, t));
    g.save(); e.film.draw(g, tt); g.restore();
    return e.canvas;
  }
  return { render, get };
}
