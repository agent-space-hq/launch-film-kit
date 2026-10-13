// Shape, icon and surface helpers for Canvas2D. Sizes in device px unless noted.
// Icons are an original line set drawn on a 24-unit grid (stroke 1.75 by default).

import { css, mix, alpha as withA } from './color.js';

export const ICONS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  'arrow-right': 'M4.5 12h15M13.5 6l6 6-6 6',
  'arrow-left': 'M19.5 12h-15M10.5 6l-6 6 6 6',
  'arrow-up': 'M12 19.5v-15M6 10.5l6-6 6 6',
  'arrow-down': 'M12 4.5v15M6 13.5l6 6 6-6',
  'arrow-up-right': 'M7 17L17 7M8.5 7H17v8.5',
  'chevron-right': 'M9.5 6l6 6-6 6',
  play: 'M8 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2A.8.8 0 0 0 8 5.8z',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  star: 'M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z',
  bolt: 'M13.2 2.8L5 13.4h6.3l-1 7.8 8.2-10.6h-6.3z',
  'chart-bar': 'M5 20v-7M10 20V6M15 20v-10M20 20V4M3.5 20h17.5',
  'chart-line': 'M3.5 18l5.5-6.5 4 3.5 7.5-9M16 6h4.5v4.5',
  globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c-2.6 2.6-3.6 5.6-3.6 9s1 6.4 3.6 9M12 3c2.6 2.6 3.6 5.6 3.6 9s-1 6.4-3.6 9',
  lock: 'M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5zM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5',
  user: 'M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM4.5 20.5c1-3.6 4-5.5 7.5-5.5s6.5 1.9 7.5 5.5',
  users: 'M9 5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7zM2.5 20c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5M16 5.4a3.3 3.3 0 0 1 0 6.2M18 15.3c1.8.6 3 2.2 3.5 4.7',
  chat: 'M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-8.5L6 20.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z',
  sparkle: 'M12 3c.6 4.6 2.4 6.4 7 7c-4.6.6-6.4 2.4-7 7c-.6-4.6-2.4-6.4-7-7c4.6-.6 6.4-2.4 7-7zM19 16c.2 1.6.9 2.3 2.5 2.5c-1.6.2-2.3.9-2.5 2.5c-.2-1.6-.9-2.3-2.5-2.5c1.6-.2 2.3-.9 2.5-2.5z',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13zM15.3 15.3L20 20',
  bell: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5zM10 20.5a2.2 2.2 0 0 0 4 0',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
  home: 'M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5M10 20v-5.5h4V20',
  gear: 'M12 8.8a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 1 0 0-6.4zM12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8',
  code: 'M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14',
  terminal: 'M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5zM7 9l3 3-3 3M12.5 15.5H17',
  image: 'M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5zM3.5 16.5l5-5 4 4 2.5-2.5 5.5 5M15.5 7.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3z',
  video: 'M4.5 6h10a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 16.5v-9A1.5 1.5 0 0 1 4.5 6zM16 10.5l5-3v9l-5-3',
  music: 'M9 18V5.5l11-2v12.5M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0zM20 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  mail: 'M4.5 5.5h15A1.5 1.5 0 0 1 21 7v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5zM3.5 7l8.5 6 8.5-6',
  calendar: 'M5 5.5h14A1.5 1.5 0 0 1 20.5 7v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5zM3.5 10h17M8 3.5v4M16 3.5v4',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7.5V12l3 2',
  cart: 'M3 4h2.5l2.2 11h10.6l2-7.5H6.4M9.5 19.5a1 1 0 1 0 0 .1M17 19.5a1 1 0 1 0 0 .1',
  tag: 'M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.5 6.5a1.4 1.4 0 0 1-2 0zM8 7a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 1 0 0-2.4z',
  gift: 'M4 9h16v3.5H4zM5.5 12.5V20h13v-7.5M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S9.5 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14.5 9 12 9z',
  rocket: 'M14.5 4.5c2.5-.9 4.3-1 5-.9c.1.7 0 2.5-.9 5c-1.2 3.2-4.4 6.1-7.1 7.4L8 12.5c1.3-2.7 4.2-5.9 6.5-8zM8 12.5l-3.5 1 2-4 4-1M11.5 16l-1 3.5 4-2 1-4M6.5 17.5c-1 1-1.5 2.5-1.5 3.5c1 0 2.5-.5 3.5-1.5M15 7.5a1.5 1.5 0 1 0 .1 0',
  shield: 'M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5c-4.3-1.3-7.5-4.9-7.5-9.5V6zM8.8 12.2l2.3 2.3 4.3-4.6',
  cloud: 'M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.5 9.5a4.5 4.5 0 0 0 .5 9z',
  layers: 'M12 3.5l9 4.8-9 4.8-9-4.8zM3 12.3l9 4.8 9-4.8M3 16.3l9 4.8 9-4.8',
  grid: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  eye: 'M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
  wand: 'M4 20L15.5 8.5M13.5 6.5l4 4M17 2.5v3M20.5 6H17.5M19.5 3.5l-2 2M8 3.5v2M7 4.5h2',
  download: 'M12 3.5v12M7 11l5 5 5-5M4.5 20h15',
  upload: 'M12 16V4M7 8.5l5-5 5 5M4.5 20h15',
  refresh: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4',
  cpu: 'M7 7h10v10H7zM9.5 9.5h5v5h-5zM10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5',
  folder: 'M3.5 6.5A1.5 1.5 0 0 1 5 5h4.5l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z',
  file: 'M6.5 3.5h7.5l4.5 4.5v12a.5.5 0 0 1-.5.5h-11.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5zM13.5 3.5V8.5h5M9 13h6M9 16.5h6',
  target: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9zM12 11.2a.8.8 0 1 0 0 1.6a.8.8 0 1 0 0-1.6z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5c0 3 1.5 4.5 3.7 4.8M16 6h3.5c0 3-1.5 4.5-3.7 4.8M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z',
  wallet: 'M4.5 6.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5H16M15.5 13.3a.9.9 0 1 0 .1 0',
  mic: 'M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3',
  send: 'M20.5 3.5L3.5 10.5l7 3 3 7zM10.5 13.5l10-10',
  cursor: 'M5 3.5l13 7.4-5.6 1.6-2.4 5.6z',
};
const iconCache = new Map();
const iconPath = (name) => {
  let p = iconCache.get(name);
  if (!p) { p = new Path2D(ICONS[name] || ICONS.sparkle); iconCache.set(name, p); }
  return p;
};
const FILLED = new Set(['play', 'cursor']);

export function makeDraw(k) {
  const u = () => k.u;

  function rrectPath(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  // Superellipse-cornered rectangle ("squircle"): smoother corner than a circular arc.
  function squirclePath(g, x, y, w, h, r, n = 5) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    const seg = 10;
    g.beginPath();
    const corner = (cx, cy, a0) => {
      for (let i = 0; i <= seg; i++) {
        const a = a0 + (i / seg) * (Math.PI / 2);
        const c = Math.cos(a), s = Math.sin(a);
        const px = cx + r * Math.sign(c) * Math.abs(c) ** (2 / n);
        const py = cy + r * Math.sign(s) * Math.abs(s) ** (2 / n);
        if (i === 0 && a0 === Math.PI) g.moveTo(px, py); else g.lineTo(px, py);
      }
    };
    corner(x + r, y + r, Math.PI);
    corner(x + w - r, y + r, Math.PI * 1.5);
    corner(x + w - r, y + h - r, 0);
    corner(x + r, y + h - r, Math.PI * 0.5);
    g.closePath();
  }
  function rrect(g, x, y, w, h, r, fill, stroke, lw = 1) {
    rrectPath(g, x, y, w, h, r);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw * u(); g.stroke(); }
  }
  function circle(g, x, y, r, fill, stroke, lw = 1) {
    g.beginPath();
    g.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw * u(); g.stroke(); }
  }
  function line(g, x0, y0, x1, y1, color, lw = 1, cap = 'round') {
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1);
    g.strokeStyle = color; g.lineWidth = lw * u(); g.lineCap = cap; g.stroke();
  }
  // Partial stroke of a polyline: draws the first fraction p (0..1) of its length.
  function polyline(g, pts, p = 1, color, lw = 2, opts = {}) {
    if (pts.length < 2) return null;
    const lens = [0];
    for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = lens[lens.length - 1], target = total * Math.max(0, Math.min(1, p));
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    let end = pts[0];
    for (let i = 1; i < pts.length; i++) {
      if (lens[i] <= target) { g.lineTo(pts[i][0], pts[i][1]); end = pts[i]; continue; }
      const f = (target - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
      end = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
      g.lineTo(end[0], end[1]);
      break;
    }
    g.strokeStyle = color; g.lineWidth = lw * u(); g.lineCap = opts.cap || 'round'; g.lineJoin = 'round';
    if (opts.dash) g.setLineDash(opts.dash.map((d) => d * u()));
    g.stroke();
    g.setLineDash([]);
    return end;
  }
  // Icon from the built-in set. size = px of the 24-unit box; p = draw-on progress (0..1).
  function icon(g, name, cx, cy, size, color, o = {}) {
    const s = size / 24;
    g.save();
    g.translate(cx - size / 2, cy - size / 2);
    g.scale(s, s);
    const path = iconPath(name);
    if (o.p !== undefined && o.p < 1 && !FILLED.has(name)) {
      g.setLineDash([200 * o.p, 400]);
    }
    if (FILLED.has(name) || o.fill) { g.fillStyle = color; g.fill(path); }
    else {
      g.strokeStyle = color; g.lineWidth = o.stroke ?? 1.75; g.lineCap = 'round'; g.lineJoin = 'round';
      g.stroke(path);
    }
    g.restore();
  }
  // Classic arrow pointer drawn in code (generic shape). scale 1 ~ 28 px tall at 1080.
  function pointer(g, x, y, scale = 1, o = {}) {
    const s = scale * k.u;
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    const p = new Path2D('M0 0L0 22L6 16.5L10 26L14 24.3L10 15L18 15Z');
    g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
    g.fillStyle = o.fill || '#ffffff'; g.fill(p);
    g.shadowColor = 'transparent';
    g.lineWidth = 1.4; g.strokeStyle = o.stroke || '#111111'; g.lineJoin = 'round'; g.stroke(p);
    g.restore();
  }
  // Click ripple: expanding ring, p 0..1.
  function ripple(g, x, y, p, color, maxR = 46) {
    if (p <= 0 || p >= 1) return;
    const r = maxR * k.u * (0.2 + 0.8 * (1 - (1 - p) ** 3));
    g.save();
    g.globalAlpha *= (1 - p) * 0.9;
    circle(g, x, y, r, null, color, 2.5);
    g.restore();
  }
  // Soft drop shadow under a rounded rect (drawn before the rect).
  function shadow(g, x, y, w, h, r, o = {}) {
    g.save();
    g.shadowColor = o.color || 'rgba(0,0,0,0.45)';
    g.shadowBlur = (o.blur ?? 40) * k.u;
    g.shadowOffsetY = (o.y ?? 18) * k.u;
    rrectPath(g, x, y, w, h, r);
    g.fillStyle = o.fill || 'rgba(0,0,0,1)';
    g.globalAlpha *= o.alpha ?? 1;
    g.fill();
    g.restore();
  }
  // Frosted glass panel. If o.backdrop (a canvas the size of the frame) is given,
  // the region behind the panel is blurred into it.
  function glass(g, x, y, w, h, r, o = {}) {
    const dark = o.dark ?? k.isDark;
    g.save();
    if (o.shadow !== false) shadow(g, x, y, w, h, r, { blur: o.shadowBlur ?? 50, y: o.shadowY ?? 24, color: o.shadowColor || (dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,60,0.18)') });
    rrectPath(g, x, y, w, h, r);
    g.save();
    g.clip();
    if (o.backdrop) {
      g.filter = `blur(${((o.blur ?? 28) * k.u).toFixed(1)}px) saturate(1.3)`;
      g.drawImage(o.backdrop, 0, 0);
      g.filter = 'none';
    }
    const tint = o.tint || (dark ? '#ffffff' : '#ffffff');
    const grd = g.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, css(tint, (o.opacity ?? (dark ? 0.1 : 0.55)) * 1.25));
    grd.addColorStop(1, css(tint, (o.opacity ?? (dark ? 0.1 : 0.55)) * 0.7));
    g.fillStyle = grd;
    g.fillRect(x, y, w, h);
    // specular wash at the top
    const sp = g.createLinearGradient(x, y, x + w * 0.6, y + h * 0.6);
    sp.addColorStop(0, `rgba(255,255,255,${(o.highlight ?? 0.16).toFixed(3)})`);
    sp.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.fillStyle = sp;
    g.fillRect(x, y, w, h);
    g.restore();
    // hairline border, brighter on top-left
    const bd = g.createLinearGradient(x, y, x + w, y + h);
    bd.addColorStop(0, `rgba(255,255,255,${(o.border ?? (dark ? 0.32 : 0.9)).toFixed(3)})`);
    bd.addColorStop(1, `rgba(255,255,255,${((o.border ?? (dark ? 0.32 : 0.9)) * 0.25).toFixed(3)})`);
    rrectPath(g, x + 0.5, y + 0.5, w - 1, h - 1, r);
    g.strokeStyle = bd; g.lineWidth = Math.max(1, 1.2 * k.u); g.stroke();
    g.restore();
  }
  // Radial glow (additive-looking soft light).
  function glow(g, x, y, r, color, a = 0.6) {
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, withA(color, a));
    grd.addColorStop(0.35, withA(color, a * 0.35));
    grd.addColorStop(1, withA(color, 0));
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Pill / badge with text.
  function pill(g, cx, cy, label, o = {}) {
    const L = k.text.layout(label, { role: o.role || 'text', size: o.size ?? 22, weight: o.weight ?? 550, tracking: o.tracking ?? 0 });
    const padX = (o.padX ?? 18) * k.u, h = (o.h ?? (o.size ?? 22) * 1.9) * k.u;
    const w = L.width + padX * 2 + (o.icon ? h * 0.7 : 0);
    const x = cx - w / 2, y = cy - h / 2;
    rrect(g, x, y, w, h, h / 2, o.fill || withA(k.brand.colors.fg, 0.08), o.stroke || null, o.lw ?? 1);
    let tx = x + padX;
    if (o.icon) { icon(g, o.icon, tx + h * 0.25, cy, h * 0.5, o.color || k.brand.colors.fg); tx += h * 0.7; }
    k.text.draw(g, label, tx, cy, { role: o.role || 'text', size: o.size ?? 22, weight: o.weight ?? 550, color: o.color || k.brand.colors.fg, baseline: 'middle', tracking: o.tracking ?? 0 });
    return { x, y, w, h };
  }
  // Dot grid background (used by many layouts). spacing in ref px.
  function dotGrid(g, spacing = 36, r = 1.4, color, o = {}) {
    const s = spacing * k.u;
    const ox = ((o.offsetX ?? 0) * k.u) % s, oy = ((o.offsetY ?? 0) * k.u) % s;
    g.fillStyle = color || withA(k.brand.colors.fg, 0.12);
    for (let y = oy - s; y < k.H + s; y += s) for (let x = ox - s; x < k.W + s; x += s) {
      g.beginPath(); g.arc(x, y, r * k.u, 0, Math.PI * 2); g.fill();
    }
  }
  function lineGrid(g, spacing = 80, color, lw = 1, o = {}) {
    const s = spacing * k.u;
    const ox = ((o.offsetX ?? 0) * k.u) % s, oy = ((o.offsetY ?? 0) * k.u) % s;
    g.beginPath();
    for (let x = ox; x <= k.W; x += s) { g.moveTo(x, 0); g.lineTo(x, k.H); }
    for (let y = oy; y <= k.H; y += s) { g.moveTo(0, y); g.lineTo(k.W, y); }
    g.strokeStyle = color || withA(k.brand.colors.fg, 0.07); g.lineWidth = lw * k.u; g.stroke();
  }
  // Fill the frame with the brand background (solid or soft vertical gradient).
  function background(g, o = {}) {
    const c = k.brand.colors;
    if (o.gradient === false) { g.fillStyle = c.bg; g.fillRect(0, 0, k.W, k.H); return; }
    const grd = g.createLinearGradient(0, 0, 0, k.H);
    grd.addColorStop(0, o.top || mix(c.bg, c.fg, k.isDark ? 0.035 : 0.0));
    grd.addColorStop(1, o.bottom || c.bg);
    g.fillStyle = grd; g.fillRect(0, 0, k.W, k.H);
  }
  // Generic browser window chrome (traffic-light dots + address pill), returns content rect.
  function browser(g, x, y, w, h, o = {}) {
    const r = (o.r ?? 18) * k.u;
    const dark = o.dark ?? k.isDark;
    if (o.shadow !== false) shadow(g, x, y, w, h, r, { blur: 60, y: 30, color: dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,60,0.22)' });
    rrect(g, x, y, w, h, r, o.fill || (dark ? '#111317' : '#ffffff'), dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)');
    const bar = (o.bar ?? 44) * k.u;
    g.save(); rrectPath(g, x, y, w, h, r); g.clip();
    g.fillStyle = dark ? '#181a20' : '#f3f4f6'; g.fillRect(x, y, w, bar);
    g.fillStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; g.fillRect(x, y + bar - 1, w, 1);
    g.restore();
    const dotR = 6 * k.u;
    ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => circle(g, x + (22 + i * 20) * k.u, y + bar / 2, dotR, o.mono ? (dark ? '#3a3d45' : '#d6d8dc') : cc));
    if (o.url !== false) {
      const pw = Math.min(w * 0.42, 420 * k.u), ph = bar * 0.56;
      rrect(g, x + w / 2 - pw / 2, y + bar / 2 - ph / 2, pw, ph, ph / 2, dark ? '#0d0f13' : '#ffffff', dark ? null : 'rgba(0,0,0,0.06)');
      if (o.url) k.text.draw(g, o.url, x + w / 2, y + bar / 2, { role: 'text', size: 15, weight: 450, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', align: 'center', baseline: 'middle' });
    }
    return { x, y: y + bar, w, h: h - bar };
  }
  // Phone frame (generic rounded slab + island). Returns screen rect.
  function phone(g, cx, cy, h, o = {}) {
    const w = h * 0.49, r = h * 0.12, x = cx - w / 2, y = cy - h / 2;
    shadow(g, x, y, w, h, r, { blur: 60, y: 30, color: 'rgba(0,0,0,0.5)' });
    rrect(g, x, y, w, h, r, o.body || '#0b0c0f', 'rgba(255,255,255,0.18)', 1.2);
    const bez = h * 0.018;
    const sx = x + bez, sy = y + bez, sw = w - bez * 2, sh = h - bez * 2;
    rrect(g, sx, sy, sw, sh, r - bez, o.screen || (k.isDark ? '#14161b' : '#ffffff'));
    rrect(g, cx - w * 0.16, sy + h * 0.018, w * 0.32, h * 0.03, h * 0.015, '#000000');
    return { x: sx, y: sy, w: sw, h: sh, r: r - bez };
  }

  return { rrectPath, squirclePath, rrect, circle, line, polyline, icon, pointer, ripple, shadow, glass, glow, pill, dotGrid, lineGrid, background, browser, phone, ICONS };
}
