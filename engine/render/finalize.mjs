// Post tools around ffmpeg.
//   node render/finalize.mjs mux    --video=a.mp4 --audio=s.wav --out=final.mp4 [--lufs=-14]
//   node render/finalize.mjs check  --in=final.mp4            (duration, fps, pix fmt, blackdetect, loudness, spectrogram png)
//   node render/finalize.mjs gif    --in=a.mp4 --from=0 --dur=6 --w=720 --fps=25 --out=loop.gif
//   node render/finalize.mjs poster --in=a.mp4 --t=0 --out=poster.jpg
import { execFileSync, spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const mode = process.argv[2];
const run = (args) => { const r = spawnSync(ffmpeg, ['-hide_banner', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 }); return (r.stderr || '') + (r.stdout || ''); };

if (mode === 'mux') {
  const lufs = Number(arg('lufs', -14));
  // two-pass loudnorm for accuracy
  const m = run(['-i', arg('audio'), '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-']);
  const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  const af = `loudnorm=I=${lufs}:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000,aformat=channel_layouts=stereo`;
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', arg('video'), '-i', arg('audio'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', af, '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', arg('out')], { stdio: 'inherit' });
  console.log('wrote', arg('out'));
} else if (mode === 'check') {
  const inp = arg('in');
  const info = run(['-i', inp]);
  const dur = (info.match(/Duration: ([\d:.]+)/) || [])[1];
  const v = (info.match(/Video: ([^\n]+)/) || [])[1];
  const bd = run(['-i', inp, '-vf', 'blackdetect=d=0.1:pix_th=0.02', '-an', '-f', 'null', '-']).match(/black_start:[^\n]+/g) || [];
  const hasAudio = /Audio:/.test(info);
  let loud = 'no audio';
  if (hasAudio) {
    const e = run(['-i', inp, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
    const I = (e.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop(), P = (e.match(/Peak:\s+(-?[\d.]+) dBFS/g) || []).pop();
    loud = `${I} / true ${P}`;
    run(['-y', '-i', inp, '-lavfi', 'showspectrumpic=s=1200x400:legend=1', inp.replace(/\.mp4$/, '_spectrum.png')]);
  }
  console.log(JSON.stringify({ file: inp, duration: dur, video: v, black: bd, loudness: loud }, null, 1));
} else if (mode === 'gif') {
  const w = arg('w', 720), fps = arg('fps', 25);
  const vf = `fps=${fps},scale=${w}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`;
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', arg('from', '0'), '-t', arg('dur', '6'), '-i', arg('in'), '-filter_complex', vf, '-loop', '0', arg('out')], { stdio: 'inherit' });
  console.log('wrote', arg('out'));
} else if (mode === 'poster') {
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', arg('t', '0'), '-i', arg('in'), '-frames:v', '1', '-q:v', '2', arg('out')], { stdio: 'inherit' });
  console.log('wrote', arg('out'));
} else console.log('modes: mux | check | gif | poster');
