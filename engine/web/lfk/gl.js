// WebGL2 side of the engine.
// 1) Post pipeline: accumulate Canvas2D sub-frames in linear light (motion blur),
//    add bloom, grain, vignette and dither, write the final 8-bit frame.
// 2) A tiny shader helper effects can use for GPU backgrounds (gradients, fields...).

const VS = `#version 300 es
in vec2 p; out vec2 uv;
void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FS_ACCUM = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D src; uniform float w;
vec3 lin(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
void main(){ vec3 c = texture(src, vec2(uv.x, 1.0 - uv.y)).rgb; o = vec4(lin(c) * w, w); }`;

// Bright pass with soft knee.
const FS_BRIGHT = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D src; uniform float thr; uniform float knee;
void main(){
  vec3 c = texture(src, uv).rgb;
  float l = max(c.r, max(c.g, c.b));
  float s = clamp(l - thr + knee, 0.0, 2.0 * knee);
  s = s * s / (4.0 * knee + 1e-4);
  float f = max(s, l - thr) / max(l, 1e-4);
  o = vec4(c * f, 1.0);
}`;
// Dual-filter down / up sampling (cheap wide blur).
const FS_DOWN = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D src; uniform vec2 px;
void main(){
  vec3 s = texture(src, uv).rgb * 4.0;
  s += texture(src, uv + vec2(-px.x, -px.y)).rgb;
  s += texture(src, uv + vec2( px.x, -px.y)).rgb;
  s += texture(src, uv + vec2(-px.x,  px.y)).rgb;
  s += texture(src, uv + vec2( px.x,  px.y)).rgb;
  o = vec4(s / 8.0, 1.0);
}`;
const FS_UP = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D src; uniform vec2 px;
void main(){
  vec3 s = vec3(0.0);
  s += texture(src, uv + vec2(-px.x * 2.0, 0.0)).rgb;
  s += texture(src, uv + vec2(-px.x, px.y)).rgb * 2.0;
  s += texture(src, uv + vec2(0.0, px.y * 2.0)).rgb;
  s += texture(src, uv + vec2(px.x, px.y)).rgb * 2.0;
  s += texture(src, uv + vec2(px.x * 2.0, 0.0)).rgb;
  s += texture(src, uv + vec2(px.x, -px.y)).rgb * 2.0;
  s += texture(src, uv + vec2(0.0, -px.y * 2.0)).rgb;
  s += texture(src, uv + vec2(-px.x, -px.y)).rgb * 2.0;
  o = vec4(s / 12.0, 1.0);
}`;
const FS_FINAL = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D acc; uniform sampler2D bloom;
uniform float bloomAmt; uniform float grain; uniform float vignette; uniform float seed; uniform vec2 res;
uniform float exposure; uniform float aberration;
vec3 srgb(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
vec3 shoulder(vec3 c){ // soft clip above 0.9 so bloom never bands to flat white
  vec3 hi = 0.9 + 0.1 * (1.0 - exp(-(c - 0.9) / 0.1));
  return mix(c, hi, step(0.9, c));
}
void main(){
  vec4 a = texture(acc, uv);
  vec3 c = a.rgb / max(a.a, 1e-5);
  if (aberration > 0.0) {
    vec2 d = (uv - 0.5) * aberration / res.x * 2.0;
    vec4 ar = texture(acc, uv + d); vec4 ab = texture(acc, uv - d);
    c.r = ar.r / max(ar.a, 1e-5); c.b = ab.b / max(ab.a, 1e-5);
  }
  c += texture(bloom, uv).rgb * bloomAmt;
  c *= exposure;
  vec2 q = uv - 0.5; q.x *= res.x / res.y;
  c *= 1.0 - vignette * smoothstep(0.35, 1.05, length(q) * 1.25);
  c = shoulder(c);
  vec3 s = srgb(clamp(c, 0.0, 1.0));
  // luminance-weighted grain (strongest in mid-tones), deterministic per frame
  float l = dot(s, vec3(0.2126, 0.7152, 0.0722));
  float gmask = 4.0 * l * (1.0 - l) * 0.85 + 0.15;
  float n = hash(gl_FragCoord.xy + seed * 17.13) - 0.5;
  s += n * grain * gmask;
  s += (ign(gl_FragCoord.xy + seed * 5.31) - 0.5) / 255.0; // dither against banding
  o = vec4(clamp(s, 0.0, 1.0), 1.0);
}`;

function compile(gl, vs, fs) {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src);
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'p');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const loc = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); loc[info.name] = gl.getUniformLocation(p, info.name); }
  return { p, loc };
}
function quad(gl) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return vao;
}
function target(gl, w, h, internal = gl.RGBA16F, fmt = gl.RGBA, type = gl.HALF_FLOAT) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, fmt, type, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { tex, fb, w, h };
}

export function createPost(canvas, W, H) {
  canvas.width = W; canvas.height = H;
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  if (!gl) throw new Error('WebGL2 unavailable');
  if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float unavailable');
  gl.getExtension('OES_texture_float_linear');
  const vao = quad(gl);
  const P = {
    accum: compile(gl, VS, FS_ACCUM), bright: compile(gl, VS, FS_BRIGHT),
    down: compile(gl, VS, FS_DOWN), up: compile(gl, VS, FS_UP), final: compile(gl, VS, FS_FINAL),
  };
  const src = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const acc = target(gl, W, H);
  const levels = [];
  let lw = Math.max(1, W >> 1), lh = Math.max(1, H >> 1);
  for (let i = 0; i < 6 && lw > 8 && lh > 8; i++) { levels.push(target(gl, lw, lh)); lw >>= 1; lh >>= 1; }
  const ups = levels.map((l) => target(gl, l.w, l.h));

  const use = (prog) => { gl.useProgram(prog.p); return prog.loc; };
  const draw = (fb, w, h) => { gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, w, h); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  const bind = (unit, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); };
  gl.bindVertexArray(vao);

  function begin() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, acc.fb);
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  // Add one sub-frame (a 2D canvas) with weight w.
  function add(canvas2d, w) {
    bind(0, src);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d);
    const L = use(P.accum);
    gl.uniform1i(L.src, 0); gl.uniform1f(L.w, w);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    draw(acc.fb, W, H);
    gl.disable(gl.BLEND);
  }
  // Resolve to the canvas. o = { bloom, threshold, grain, vignette, seed, exposure, aberration }
  function finish(o = {}) {
    const bloomAmt = o.bloom ?? 0;
    if (bloomAmt > 0 && levels.length) {
      let L = use(P.bright);
      bind(0, acc.tex); gl.uniform1i(L.src, 0); gl.uniform1f(L.thr, o.threshold ?? 0.72); gl.uniform1f(L.knee, 0.25);
      draw(levels[0].fb, levels[0].w, levels[0].h);
      L = use(P.down);
      for (let i = 1; i < levels.length; i++) {
        bind(0, levels[i - 1].tex); gl.uniform1i(L.src, 0); gl.uniform2f(L.px, 1 / levels[i - 1].w, 1 / levels[i - 1].h);
        draw(levels[i].fb, levels[i].w, levels[i].h);
      }
      L = use(P.up);
      let prev = levels[levels.length - 1];
      for (let i = levels.length - 2; i >= 0; i--) {
        bind(0, prev.tex); gl.uniform1i(L.src, 0); gl.uniform2f(L.px, 0.5 / prev.w, 0.5 / prev.h);
        // up-sample into ups[i], then add the level's own content
        draw(ups[i].fb, ups[i].w, ups[i].h);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
        bind(0, levels[i].tex); gl.uniform2f(L.px, 0.5 / levels[i].w, 0.5 / levels[i].h);
        draw(ups[i].fb, ups[i].w, ups[i].h);
        gl.disable(gl.BLEND);
        prev = ups[i];
      }
    }
    const L = use(P.final);
    bind(0, acc.tex); bind(1, bloomAmt > 0 && ups.length ? ups[0].tex : acc.tex);
    gl.uniform1i(L.acc, 0); gl.uniform1i(L.bloom, 1);
    gl.uniform1f(L.bloomAmt, bloomAmt > 0 ? bloomAmt / Math.max(1, levels.length - 1) : 0);
    gl.uniform1f(L.grain, o.grain ?? 0.03);
    gl.uniform1f(L.vignette, o.vignette ?? 0.18);
    gl.uniform1f(L.seed, (o.seed ?? 0) % 997);
    gl.uniform1f(L.exposure, o.exposure ?? 1);
    gl.uniform1f(L.aberration, o.aberration ?? 0);
    gl.uniform2f(L.res, W, H);
    draw(null, W, H);
  }
  const pixels = new Uint8Array(W * H * 4);
  function read() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels; // bottom-up rows
  }
  return { gl, begin, add, finish, read, W, H };
}

// Shader helper for effects: renders a fragment shader to its own canvas, which the
// effect then draws into the 2D frame. One GL context is shared by all effects.
let fxGL = null;
const fxPrograms = new Map();
export function fxShader(fragBody, w, h) {
  if (!fxGL) {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    fxGL = { c, gl, vao: quad(gl) };
  }
  const { c, gl, vao } = fxGL;
  let prog = fxPrograms.get(fragBody);
  if (!prog) {
    const fs = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform vec2 res; uniform float t; uniform float seed;
uniform vec4 c0; uniform vec4 c1; uniform vec4 c2; uniform vec4 c3; uniform vec4 bg;
uniform vec4 pA; uniform vec4 pB;
${fragBody}`;
    prog = compile(gl, VS, fs);
    fxPrograms.set(fragBody, prog);
  }
  return function render(uniforms = {}) {
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    gl.viewport(0, 0, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(prog.p);
    gl.bindVertexArray(vao);
    gl.uniform2f(prog.loc.res, w, h);
    for (const [k, v] of Object.entries(uniforms)) {
      const loc = prog.loc[k];
      if (!loc) continue;
      if (typeof v === 'number') gl.uniform1f(loc, v);
      else if (v.length === 2) gl.uniform2fv(loc, v);
      else if (v.length === 3) gl.uniform3fv(loc, v);
      else if (v.length === 4) gl.uniform4fv(loc, v);
    }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return c;
  };
}
// Convert a css/hex color to a vec4 (sRGB 0..1) for shader uniforms.
export function vec4(color, a) {
  const s = String(color).trim();
  let r = 0, g = 0, b = 0, al = 1;
  if (s.startsWith('#')) {
    let h = s.slice(1);
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h.slice(0, 6), 16);
    r = ((n >> 16) & 255) / 255; g = ((n >> 8) & 255) / 255; b = (n & 255) / 255;
    if (h.length === 8) al = parseInt(h.slice(6), 16) / 255;
  } else {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(/[\s,\/]+/).map(Number); r = p[0] / 255; g = p[1] / 255; b = p[2] / 255; al = p[3] ?? 1; }
  }
  return [r, g, b, a ?? al];
}
