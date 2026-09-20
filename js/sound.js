/* All sound is synthesised with the Web Audio API: no audio files. Nothing plays until the first tap
 * (browsers require it), and the corner button mutes everything. */
let ctx = null, master = null, bus = null, nbuf = null, on = true, lastTip = 0;
try { on = localStorage.getItem('afterlife-sound') !== 'off'; } catch { /* private mode */ }
export const isOn = () => on;

export function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = on ? 0.55 : 0; master.connect(ctx.destination);
    nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = nbuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch { ctx = null; }
}
export function setOn(v) {
  on = v; try { localStorage.setItem('afterlife-sound', v ? 'on' : 'off'); } catch { /* ignore */ }
  if (master) master.gain.setTargetAtTime(v ? 0.55 : 0, ctx.currentTime, 0.05);
  if (!v) stop();
}

/* ---- building blocks ---- */
function tone(b, { f = 440, f2, t = 0, dur = 0.3, type = 'sine', vol = 0.15, a = 0.01, lp }) {
  const n = ctx.currentTime + t, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, n);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), n + dur);
  g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(vol, n + a); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
  let out = o; if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); out = fl; }
  out.connect(g); g.connect(b.g); o.start(n); o.stop(n + dur + 0.05); b.srcs.push(o); return o;
}
function hold(b, { f = 55, type = 'sawtooth', vol = 0.1, lp = 200, a = 1 }) { // a sustained tone, faded in
  const n = ctx.currentTime, o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = lp; g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(vol, n + a);
  o.connect(fl); fl.connect(g); g.connect(b.g); o.start(n); b.srcs.push(o); return o;
}
function noise(b, { t = 0, dur = 0.3, type = 'lowpass', f = 800, f2, q = 1, vol = 0.2, a = 0.01, loop = false }) {
  const n = ctx.currentTime + t, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = nbuf; s.loop = loop; fl.type = type; fl.frequency.setValueAtTime(f, n); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, n + dur); fl.Q.value = q;
  g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(vol, n + a); if (!loop) g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
  s.connect(fl); fl.connect(g); g.connect(b.g); s.start(n); if (!loop) s.stop(n + dur + 0.05); b.srcs.push(s); return s;
}
const tick = (b, t, f = 2200, vol = 0.1) => noise(b, { t, dur: 0.03, type: 'bandpass', f, q: 4, vol });
const every = (b, ms, fn) => b.timers.push(setInterval(() => { if (bus === b) fn(); }, ms));
const gull = (b, t = 0) => { tone(b, { f: 1900, f2: 1250, t, dur: 0.28, type: 'triangle', vol: 0.06 }); tone(b, { f: 1700, f2: 1100, t: t + 0.22, dur: 0.22, type: 'triangle', vol: 0.05 }); };
const chime = (b, notes, t0 = 0, gap = 0.14, vol = 0.09) => notes.forEach((f, i) => tone(b, { f, t: t0 + i * gap, dur: 0.9, vol, a: 0.005 }));
const thud = (b, t = 0, vol = 0.3) => { tone(b, { f: 110, f2: 38, t, dur: 0.35, vol }); noise(b, { t, dur: 0.18, f: 500, f2: 90, vol: vol * 0.7 }); };

/* ---- one sound bed per picture ---- */
const SCENES = {
  hand(b) { noise(b, { t: 0.65, dur: 0.7, type: 'bandpass', f: 500, f2: 1800, q: 1.5, vol: 0.12 }); thud(b, 1.75, 0.22); },
  bin(b) { tone(b, { f: 180, f2: 320, t: 0.1, dur: 0.35, type: 'sawtooth', vol: 0.05, lp: 700 }); thud(b, 1.3, 0.35); tone(b, { f: 900, f2: 500, t: 1.3, dur: 0.25, type: 'square', vol: 0.03, lp: 1500 }); },
  truck(b) { hold(b, { f: 52, vol: 0.13, lp: 220, a: 0.4 }); noise(b, { loop: true, f: 240, vol: 0.06 }); noise(b, { t: 0.8, dur: 0.5, type: 'highpass', f: 4000, vol: 0.06 });
    for (let i = 0; i < 3; i++) tone(b, { f: 1000, t: 1.35 + i * 0.3, dur: 0.14, type: 'square', vol: 0.035 }); },
  sorting(b) { hold(b, { f: 95, type: 'sine', vol: 0.06, lp: 400, a: 0.3 }); for (let i = 0; i < 18; i++) tick(b, i * 0.12, 2000 + (i % 3) * 400); thud(b, 1.7, 0.2); },
  ship(b) { hold(b, { f: 110, vol: 0.09, lp: 380, a: 0.2 }); hold(b, { f: 138, vol: 0.06, lp: 380, a: 0.2 }); noise(b, { loop: true, f: 350, vol: 0.09 }); },
  dump(b) { noise(b, { loop: true, type: 'bandpass', f: 500, q: 0.7, vol: 0.12 }); gull(b, 0.3); gull(b, 1.2); every(b, 1600, () => gull(b, 0)); },
  drain(b) { noise(b, { loop: true, type: 'highpass', f: 3200, vol: 0.13 }); noise(b, { t: 1.5, dur: 0.7, f: 500, f2: 120, vol: 0.12 }); },
  river(b) { noise(b, { loop: true, type: 'bandpass', f: 750, q: 0.6, vol: 0.14 }); every(b, 500, () => tone(b, { f: 420 + Math.random() * 200, f2: 200, dur: 0.1, vol: 0.05 })); },
  sea(b) { noise(b, { loop: true, f: 200, vol: 0.16 }); hold(b, { f: 55, type: 'sine', vol: 0.09, lp: 200 }); every(b, 350, () => tone(b, { f: 500 + Math.random() * 500, f2: 1400, dur: 0.09, vol: 0.04 })); },
  fragments(b) { noise(b, { loop: true, f: 220, vol: 0.06 }); for (let i = 0; i < 44; i++) tick(b, Math.pow(i / 44, 1.5) * 2.2, 2000 + Math.random() * 4000, 0.09);
    for (let i = 0; i < 9; i++) tone(b, { f: 2600 + Math.random() * 2400, t: Math.random() * 2, dur: 0.1, vol: 0.03 }); },
  animal(b) { noise(b, { loop: true, f: 220, vol: 0.09 }); every(b, 420, () => tone(b, { f: 300, f2: 520, dur: 0.12, vol: 0.05 })); tone(b, { f: 240, f2: 70, t: 1.4, dur: 0.3, vol: 0.14 }); },
  clock(b) { hold(b, { f: 60, type: 'sine', vol: 0.07, lp: 200 }); let t = 0; while (t < 2.2) { tick(b, t, 1600, 0.14); t += 0.32 - 0.27 * (t / 2.2); }
    tone(b, { f: 62, t: 2.2, dur: 2, vol: 0.22, a: 0.02 }); tone(b, { f: 124, t: 2.2, dur: 1.6, vol: 0.1, a: 0.02 }); },
  furnace(b) { noise(b, { loop: true, f: 320, vol: 0.2 }); noise(b, { t: 0.3, dur: 0.6, type: 'bandpass', f: 300, f2: 900, vol: 0.12 }); every(b, 140, () => tick(b, 0, 1000 + Math.random() * 3000, 0.09)); },
  shelf(b) { chime(b, [523, 659, 784], 0.9); },
  soil(b) { noise(b, { t: 0.1, dur: 1.2, type: 'bandpass', f: 1500, q: 0.8, vol: 0.09 }); tone(b, { f: 400, f2: 900, t: 1.3, dur: 0.35, vol: 0.06 }); chime(b, [784, 988], 1.6, 0.16, 0.05); },
  turtle(b) { noise(b, { loop: true, f: 220, vol: 0.14 }); hold(b, { f: 55, type: 'sine', vol: 0.08, lp: 200 }); every(b, 450, () => tone(b, { f: 500 + Math.random() * 400, f2: 1300, dur: 0.09, vol: 0.04 })); tone(b, { f: 230, f2: 80, t: 1.6, dur: 0.35, vol: 0.16 }); },
  bird(b) { noise(b, { loop: true, type: 'bandpass', f: 400, q: 0.6, vol: 0.06 }); every(b, 330, () => noise(b, { dur: 0.16, f: 500, f2: 200, vol: 0.09 })); gull(b, 0.4); tone(b, { f: 250, f2: 90, t: 1, dur: 0.3, vol: 0.13 }); },
  fire(b) { noise(b, { loop: true, f: 900, vol: 0.2 }); every(b, 90, () => tick(b, 0, 800 + Math.random() * 3500, 0.12)); noise(b, { t: 0.1, dur: 0.6, type: 'bandpass', f: 300, f2: 1200, vol: 0.12 }); },
  doom(b) { // the consequence
    thud(b, 0, 0.5); hold(b, { f: 55, vol: 0.13, lp: 190, a: 1.6 }); hold(b, { f: 58.7, vol: 0.11, lp: 190, a: 1.6 });
    const beat = () => { tone(b, { f: 62, f2: 40, dur: 0.16, vol: 0.28 }); tone(b, { f: 62, f2: 40, t: 0.19, dur: 0.16, vol: 0.2 }); }; setTimeout(() => bus === b && beat(), 900); every(b, 1100, beat); },
  good(b) { [262, 330, 392].forEach((f) => hold(b, { f, type: 'sine', vol: 0.07, lp: 900, a: 1.2 })); chime(b, [523, 659, 784, 1046], 0.2, 0.16, 0.1); },
  sim(b) { hold(b, { f: 48, vol: 0.09, lp: 170, a: 0.5 }); noise(b, { loop: true, f: 260, vol: 0.05 }); gull(b, 0.5);
    every(b, 2400, () => gull(b, 0)); every(b, 3600, () => { tone(b, { f: 950, dur: 0.12, type: 'square', vol: 0.03 }); tone(b, { f: 950, t: 0.22, dur: 0.12, type: 'square', vol: 0.03 }); }); },
};
export const KEYS = Object.keys(SCENES);

/* ---- public ---- */
export function stop() {
  if (!bus) return; const b = bus; bus = null; b.timers.forEach(clearInterval);
  if (ctx) { b.g.gain.setTargetAtTime(0, ctx.currentTime, 0.06); setTimeout(() => { b.srcs.forEach((s) => { try { s.stop(); } catch { /* ended */ } }); b.g.disconnect(); }, 450); }
}
export function scene(key) {
  stop(); if (!ctx || !on || !SCENES[key]) return;
  const g = ctx.createGain(); g.connect(master); bus = { g, srcs: [], timers: [] };
  try { SCENES[key](bus); } catch (e) { console.warn('sound', key, e); }
}
function once(fn) { if (!ctx || !on) return; const g = ctx.createGain(); g.connect(master); fn({ g, srcs: [], timers: [] }); }
export const ui = () => once((b) => tone(b, { f: 620, f2: 320, dur: 0.06, vol: 0.06 }));
export const found = () => once((b) => chime(b, [660, 990], 0, 0.11, 0.09));
export const buried = () => once((b) => thud(b, 0, 0.3));
export const gone = () => once((b) => tone(b, { f: 330, f2: 110, dur: 1.3, vol: 0.14 }));
export const bell = () => once((b) => chime(b, [523, 392, 262], 0, 0.28, 0.12));
export function tip() { const n = performance.now(); if (n - lastTip < 160 || !bus) return; lastTip = n; once((b) => { noise(b, { dur: 0.35, f: 600, f2: 120, vol: 0.1 }); tone(b, { f: 120, f2: 50, dur: 0.25, vol: 0.1 }); }); }
