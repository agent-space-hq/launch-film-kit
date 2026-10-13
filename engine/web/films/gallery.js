// Overview: every effect as a live tile at a chosen fraction of its duration, labelled with its id.
import { EFFECTS } from '../effects/index.js';
import { makeTileSystem } from './shared/tiles.js';
export default async function (k, params = {}) {
  const tiles = makeTileSystem(EFFECTS);
  const list = params.cat ? EFFECTS.filter((e) => e.meta.category === params.cat) : EFFECTS;
  const cols = params.cols || 9;
  return {
    duration: 1,
    draw(g, t) {
      g.fillStyle = '#16171b'; g.fillRect(0, 0, k.W, k.H);
      const rows = Math.ceil(list.length / cols);
      const cw = k.W / cols, ch = Math.min(k.H / rows, cw * 9 / 16 + 26 * k.u);
      const tw = cw - 8 * k.u, th = tw * 9 / 16;
      list.forEach((mod, i) => {
        const x = (i % cols) * cw + 4 * k.u, y = Math.floor(i / cols) * ch + 4 * k.u;
        const can = tiles.render(mod, (mod.meta.duration || 4) * (params.frac ?? 0.62), params.tw || 480, params.th || 270, params.light && i % 2 ? params.light : k.brand);
        g.drawImage(can, x, y, tw, th);
        g.fillStyle = '#cfd2d8'; g.font = `${Math.round(13 * k.u)}px "Geist Mono"`; g.fillText(`${i + 1}. ${mod.meta.id}`, x, y + th + 15 * k.u);
      });
    },
  };
}
