// Driver for the Launch Film Kit engine.
//   node render/render.mjs list
//   node render/render.mjs sheet   --effect=ID [--w=1920 --h=1080 --n=12 --cols=4 --out=sheets/ID.png --brand=web/brands/vela.json]
//   node render/render.mjs stills  --effect=ID --t=0.5,1.2 [--w --h --sub=4 --dir=stills]
//   node render/render.mjs qa      --effect=ID|--all [--aspects=16:9,4:5,9:16] [--out=qa/report.json]
//   node render/render.mjs video   --effect=ID | --film=/films/x/film.js  [--w --h --fps=60 --sub=6 --out=previews/ID.mp4 --crf=16]
//   node render/render.mjs audio   --film=... --out=audio/x.wav
// Effects/films render in a GPU Chromium page. A lock keeps heavy renders from running in parallel.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.env.LFK_OUT || path.join(ROOT, 'out'));
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const flag = (k) => process.argv.includes(`--${k}`);
const mode = process.argv[2] || 'list';
execFileSync(process.execPath, [path.join(ROOT, 'render/gen-index.mjs')], { stdio: 'inherit' });

// ---------- GPU lock (directory lock, stale after 30 min) ----------
const LOCK = '/tmp/lfk-gpu.lock';
async function lock() {
  if (flag('nolock')) return () => {};
  for (let i = 0; ; i++) {
    try { fs.mkdirSync(LOCK); fs.writeFileSync(`${LOCK}/pid`, String(process.pid)); break; } catch {
      try {
        const pid = Number(fs.readFileSync(`${LOCK}/pid`, 'utf8'));
        let alive = true; try { process.kill(pid, 0); } catch { alive = false; }
        const age = Date.now() - fs.statSync(LOCK).mtimeMs;
        if (!alive || age > 30 * 60e3) { fs.rmSync(LOCK, { recursive: true, force: true }); continue; }
      } catch { }
      if (i % 20 === 0) console.log('waiting for GPU lock…');
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  const release = () => { try { fs.rmSync(LOCK, { recursive: true, force: true }); } catch { } };
  process.on('exit', release);
  return release;
}

// ---------- server ----------
let frameSink = null;
let frameSize = 0;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname === '/save') {
    const dest = path.resolve(OUT, url.searchParams.get('name'));
    if (!dest.startsWith(OUT + path.sep)) { res.writeHead(400).end(); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const ws = fs.createWriteStream(dest);
    req.pipe(ws); ws.on('finish', () => res.writeHead(200).end('ok'));
    return;
  }
  if (req.method === 'POST' && url.pathname === '/frame') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const buf = Buffer.concat(chunks);
      if (buf.length !== frameSize) { res.writeHead(400).end('bad size'); return; }
      await frameSink(buf, Number(url.searchParams.get('i')));
      res.writeHead(200).end('ok');
    });
    return;
  }
  let p = url.pathname === '/' ? '/web/index.html' : decodeURIComponent(url.pathname);
  if (p.startsWith('/fonts/')) p = '/fonts/' + path.basename(p);
  const f = path.resolve(ROOT, '.' + p);
  if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const heavy = !['list', 'meta'].includes(mode);
const release = heavy ? await lock() : () => {};
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--js-flags=--expose-gc'] });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error') { pageErrors.push(m.text()); if (!flag('quiet')) console.log('[page]', m.text()); } });
page.on('pageerror', (e) => { pageErrors.push(e.message); console.log('[pageerror]', e.message); });
await page.goto(`http://127.0.0.1:${port}/web/index.html`);
await page.waitForFunction(() => window.LFK_READY === true, null, { timeout: 60000 });

const readBrand = () => { const b = arg('brand', 'web/brands/vela.json'); return JSON.parse(fs.readFileSync(path.resolve(ROOT, b), 'utf8')); };
const parseAspect = (a) => { const [x, y] = a.split(':').map(Number); const base = 1080; return x >= y ? [Math.round((base * x) / y / 2) * 2, base] : [base, Math.round((base * y) / x / 2) * 2]; };
async function setup(o) {
  const params = arg('params') ? JSON.parse(fs.readFileSync(path.resolve(ROOT, arg('params')), 'utf8')) : undefined;
  return page.evaluate((o) => window.LFK.setup(o), { brand: readBrand(), post: arg('post') ? JSON.parse(arg('post')) : undefined, params, ...o });
}
const effectIds = async () => {
  if (arg('effect')) return arg('effect').split(',');
  const all = await page.evaluate(() => window.LFK.effects().map((e) => e.id));
  const cat = arg('cat');
  return cat ? all.filter((id) => id.startsWith(cat + '.')) : all;
};

try {
  if (mode === 'list') {
    const list = await page.evaluate(() => window.LFK.effects());
    for (const e of list) console.log(`${e.id.padEnd(34)} ${String(e.duration).padStart(4)}s  ${e.name}`);
    console.log(list.length, 'effects');
  } else if (mode === 'meta') {
    const list = await page.evaluate(() => window.LFK.effects());
    const out = path.resolve(OUT, arg('out', 'library/index.json'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(list.map((e) => ({ id: e.id, name: e.name, category: e.category, duration: e.duration, loop: !!e.loop, summary: e.summary, bestFor: e.bestFor || [], slots: e.slots || [], params: e.paramSpec || {}, prompt: (e.prompt || '').trim() })), null, 1));
    console.log('wrote', out, list.length);
  } else if (mode === 'sheet') {
    const W = Number(arg('w', 1920)), H = Number(arg('h', 1080));
    for (const id of arg('film') ? ['film'] : await effectIds()) {
      await setup(arg('film') ? { w: W, h: H, film: arg('film') } : { w: W, h: H, effect: id });
      const name = arg('out', `sheets/${id}${W < H ? '_tall' : W === H ? '_sq' : ''}.png`);
      await page.evaluate((o) => window.LFK.sheet(o), { n: Number(arg('n', 12)), cols: Number(arg('cols', 4)), scale: Number(arg('scale', W >= 1920 ? 0.25 : 0.3)), name, label: `${id}  ${W}x${H}` });
      console.log('sheet', path.join(OUT, name));
    }
  } else if (mode === 'stills') {
    const W = Number(arg('w', 1920)), H = Number(arg('h', 1080));
    const id = arg('effect');
    await setup({ w: W, h: H, effect: id, film: arg('film') });
    for (const t of arg('t', '1').split(',').map(Number)) {
      const name = `${arg('dir', 'stills')}/${(id || 'film').replace(/[^\w.-]/g, '_')}_t${t.toFixed(2)}.png`;
      await page.evaluate(([t, sub, name]) => window.LFK.still(t, 60, sub, name), [t, Number(arg('sub', 4)), name]);
      console.log(path.join(OUT, name));
    }
  } else if (mode === 'qa') {
    const aspects = arg('aspects', '16:9,4:5,9:16').split(',');
    const report = {};
    let fails = 0;
    for (const id of await effectIds()) {
      report[id] = {};
      for (const a of aspects) {
        const [W, H] = parseAspect(a);
        pageErrors.length = 0;
        await setup({ w: W, h: H, effect: id });
        const r = await page.evaluate((o) => window.LFK.qa(o), { fps: 30, step: Number(arg('step', 2)) });
        r.counters.errors += pageErrors.length;
        const bad = Object.entries(r.counters).filter(([k, v]) => k !== 'frames' && v > 0);
        report[id][a] = { ...r.counters, items: r.items.slice(0, 8) };
        if (bad.length) fails++;
        console.log(`${bad.length ? 'FAIL' : 'ok  '} ${id.padEnd(34)} ${a.padEnd(5)} ${bad.map(([k, v]) => `${k}=${v}`).join(' ')}`);
        if (bad.length && flag('v')) for (const it of r.items.slice(0, 6)) console.log('      ', JSON.stringify(it));
      }
    }
    const out = path.resolve(OUT, arg('out', 'qa/report.json'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 1));
    console.log(`${fails} failing renders; report ${out}`);
  } else if (mode === 'video') {
    const W = Number(arg('w', 1920)), H = Number(arg('h', 1080)), FPS = Number(arg('fps', 60)), SUB = Number(arg('sub', 6)), SH = Number(arg('shutter', 0.5));
    const id = arg('effect');
    const info = await setup({ w: W, h: H, effect: id, film: arg('film') });
    const dur = Number(arg('dur', info.duration));
    const out = path.resolve(OUT, arg('out', `previews/${id || 'film'}.mp4`));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    frameSize = W * H * 4;
    const enc = arg('codec', 'h264') === 'lossless'
      ? ['-vf', 'vflip', '-c:v', 'libx264rgb', '-crf', '0', '-preset', 'ultrafast', '-pix_fmt', 'rgb24']
      : ['-vf', 'vflip,format=yuv420p', '-c:v', 'libx264', '-preset', arg('preset', 'slow'), '-crf', arg('crf', '16'), '-tune', 'film', '-movflags', '+faststart', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];
    const ff = spawn(ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', ...enc, out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const from = Math.round(Number(arg('from', 0)) * FPS), to = Math.round(Number(arg('to', dur)) * FPS);
    let next = from; const waiting = new Map();
    const flush = async () => { while (waiting.has(next)) { const { buf, done } = waiting.get(next); waiting.delete(next); next++; if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); done(); } };
    frameSink = (buf, i) => new Promise((res) => { waiting.set(i, { buf, done: res }); flush(); });
    const t0 = Date.now();
    for (let i = from; i < to; i += 30) {
      const j = Math.min(to, i + 30);
      await page.evaluate(([a, b, fps, sub, sh]) => window.LFK.framesToServer(a, b, fps, sub, sh), [i, j, FPS, SUB, SH]);
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r${path.basename(out)} frame ${j - from}/${to - from}  ${el.toFixed(0)}s  eta ${((el / (j - from)) * (to - j)).toFixed(0)}s   `);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log(`\nwrote ${out}`);
  } else if (mode === 'previews') {
    // every effect -> out/library/previews/<id>.mp4 (+ .jpg poster), one browser
    const W = Number(arg('w', 1280)), H = Number(arg('h', 720)), FPS = Number(arg('fps', 30)), SUB = Number(arg('sub', 4));
    const dir = path.resolve(OUT, arg('dir', 'library/previews'));
    fs.mkdirSync(dir, { recursive: true });
    frameSize = W * H * 4;
    for (const id of await effectIds()) {
      const outMp4 = path.join(dir, `${id}.mp4`);
      if (fs.existsSync(outMp4) && !flag('force')) continue;
      const info = await setup({ w: W, h: H, effect: id });
      const n = Math.round(info.duration * FPS);
      const ff = spawn(ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', 'vflip,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-movflags', '+faststart', outMp4], { stdio: ['pipe', 'inherit', 'inherit'] });
      let next = 0; const waiting = new Map();
      const flush = async () => { while (waiting.has(next)) { const { buf, done } = waiting.get(next); waiting.delete(next); next++; if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); done(); } };
      frameSink = (buf, i) => new Promise((res) => { waiting.set(i, { buf, done: res }); flush(); });
      for (let i = 0; i < n; i += 30) await page.evaluate(([a, b, fps, sub]) => window.LFK.framesToServer(a, b, fps, sub, 0.5), [i, Math.min(n, i + 30), FPS, SUB]);
      ff.stdin.end(); await new Promise((r) => ff.on('close', r));
      const pt = info.loop ? 0 : info.duration * 0.62;
      await page.evaluate(([t, name]) => window.LFK.still(t, 30, 1, name), [pt, `${arg('dir', 'library/previews')}/${id}.png`]);
      console.log('preview', id);
    }
  } else if (mode === 'audio') {
    const info = await setup({ w: 640, h: 360, film: arg('film'), effect: arg('effect') });
    if (!info.score) throw new Error('film has no score');
    const name = arg('out', 'audio/score.wav');
    await page.evaluate(([s, d, n]) => window.LFK.score(s, d, n), [info.score, info.duration, name]);
    console.log('wrote', path.join(OUT, name));
  }
} finally {
  await browser.close();
  server.close();
  release();
}
