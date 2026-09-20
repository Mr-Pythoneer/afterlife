/* The landfill time-lapse: one year of a place's household waste arriving, day by day.
 * Pile height is drawn on a log scale so one person's pile and a city's pile are both visible. */
const h = (n) => { const x = Math.sin(n * 127.1 + 1.7) * 43758.5453; return x - Math.floor(x); };
const COLS = ['#4E86A8', '#9AA3A8', '#B9A88A', '#8A6E86', '#C0762A', '#6E9384'];
export const TIMELAPSE_MS = 20000;
const LOG_MAX = Math.log10(1 + 1e6);

export class Sim {
  constructor(canvas) {
    this.cv = canvas; this.c = canvas.getContext('2d'); this.raf = 0; this.trucks = []; this.tickCb = null;
    addEventListener('resize', () => this.size());
  }
  size() { const d = Math.min(devicePixelRatio || 1, 2); this.W = innerWidth; this.H = innerHeight; this.cv.width = this.W * d; this.cv.height = this.H * d; this.c.setTransform(d, 0, 0, d, 0, 0); }
  run(p, onTick, onDone) {
    this.stop(); this.size(); this.p = p; this.trucks = []; this.onTick = onTick; this.onDone = onDone;
    this.t0 = performance.now(); this.last = this.t0; this.spawn = 0; this.done = false;
    this.raf = requestAnimationFrame((n) => this.frame(n));
  }
  stop() { cancelAnimationFrame(this.raf); }
  fracFor(tonnes) { return Math.min(Math.max(Math.log10(1 + tonnes) / LOG_MAX, 0.03), 1); }
  frame(now) {
    const { p } = this; const el = now - this.t0; const dt = (now - this.last) / 1000; this.last = now;
    const day = Math.min(365, (el / TIMELAPSE_MS) * 365); const tonnes = day * p.tPerDay;
    const frac = this.fracFor(tonnes);
    this.spawn -= dt; if (this.spawn <= 0 && !this.done) { this.trucks.push({ x: -80, st: 'in', tip: 0 }); this.spawn = 1 / (0.5 + 3 * this.fracFor(p.tPerDay * 365)); }
    this.draw(now / 1000, frac, dt);
    this.onTick(day, tonnes);
    if (day >= 365 && !this.done) { this.done = true; this.onDone(); }
    if (!this.done || this.trucks.length) this.raf = requestAnimationFrame((n) => this.frame(n));
  }
  surf(x, cx, hw, ht, gy) { const u = (x - cx) / hw; return Math.abs(u) >= 1 ? gy : gy - ht * (1 - u * u); }
  draw(t, frac, dt) {
    const c = this.c, W = this.W, H = this.H, gy = H * .74, S = Math.min(W, H * 1.6) / 110;
    const g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, '#5a6a78'); g.addColorStop(1, '#c9b79a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    // skyline sized to how many people live here
    const n = this.p.skyN, sc = this.p.skyH;
    for (let i = 0; i < n; i++) { const bw = S * (7 + h(i) * 6), bh = S * (8 + h(i + 3) * 18) * sc, x = W * .03 + (i / Math.max(n, 1)) * W * .36; c.fillStyle = `rgba(40,44,52,${.55 + h(i) * .3})`; c.fillRect(x, gy - bh, bw, bh); c.fillStyle = 'rgba(240,220,150,.5)'; for (let k = 0; k < bh / (S * 3) - 1; k++) c.fillRect(x + S * 1.2, gy - bh + S * (1.5 + k * 3), S * 1.2, S * 1.2); }
    c.fillStyle = '#3a3026'; c.fillRect(0, gy, W, H - gy);
    // the pile
    const cx = W * .7, hw = W * (.08 + frac * .24), ht = H * (.03 + frac * .42);
    const path = new Path2D(); path.moveTo(cx - hw, gy); for (let i = 0; i <= 24; i++) { const x = cx - hw + (i / 24) * 2 * hw; path.lineTo(x, this.surf(x, cx, hw, ht, gy)); } path.closePath();
    c.save(); c.clip(path); c.fillStyle = '#4a3b2b'; c.fillRect(cx - hw, gy - ht, hw * 2, ht);
    const n2 = Math.floor(30 + frac * 320); for (let i = 0; i < n2; i++) { c.fillStyle = COLS[i % 6]; c.globalAlpha = .85; c.fillRect(cx - hw + h(i) * hw * 2, gy - h(i + 5) * ht, S * (.5 + h(i + 9) * 1.4), S * (.4 + h(i + 2)) ); }
    c.restore(); c.globalAlpha = 1; c.strokeStyle = '#7a6848'; c.lineWidth = 2; c.stroke(path);
    // trucks
    const tipX = cx - hw * .55; for (const tr of this.trucks) {
      const sp = W * .28; if (tr.st === 'in') { tr.x += sp * dt; if (tr.x >= tipX) { tr.x = tipX; tr.st = 'tip'; } } else if (tr.st === 'tip') { tr.tip += dt; if (tr.tip > .7) tr.st = 'out'; } else tr.x -= sp * dt * 1.2;
      const y = this.surf(tr.x, cx, hw, ht, gy); this.truck(c, tr.x, y, S, tr.st === 'tip' ? Math.min(tr.tip / .3, 1) : 0, tr.st === 'out');
    }
    this.trucks = this.trucks.filter((tr) => tr.x > -100);
    // bulldozer
    const bx = cx + Math.sin(t * .8) * hw * .35; const by = this.surf(bx, cx, hw, ht, gy); c.fillStyle = '#d6b23a'; c.fillRect(bx - S * 3, by - S * 3.6, S * 6, S * 2.6); c.fillStyle = '#222'; c.fillRect(bx - S * 3.4, by - S * 1.1, S * 6.8, S * 1.1);
    // gulls
    const birds = Math.floor(2 + frac * 14); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.6;
    for (let i = 0; i < birds; i++) { const x = (h(i) * W + t * 30 * (.5 + h(i + 2))) % W, y = gy - ht - S * (8 + h(i + 4) * 24) + Math.sin(t * 2 + i) * S * 2, f = Math.sin(t * 9 + i) * S; c.beginPath(); c.moveTo(x - S * 1.4, y - f); c.lineTo(x, y); c.lineTo(x + S * 1.4, y - f); c.stroke(); }
  }
  truck(c, x, y, S, tip, leaving) {
    c.save(); c.translate(x, y); if (leaving) { c.scale(-1, 1); }
    c.fillStyle = '#c9b458'; c.save(); c.translate(-S * 6, -S * 2); c.rotate(-tip * .45); c.fillRect(-S * 6, -S * 5, S * 10, S * 5); c.restore();
    c.fillStyle = '#a89840'; c.fillRect(S * 2, -S * 5, S * 4, S * 4); c.fillStyle = '#22353d'; c.fillRect(S * 4, -S * 4.4, S * 1.8, S * 1.6);
    c.fillStyle = '#111'; for (const wx of [-S * 6, S * 3.5]) { c.beginPath(); c.arc(wx, -S * .6, S * 1.2, 0, 7); c.fill(); }
    c.restore();
  }
}
