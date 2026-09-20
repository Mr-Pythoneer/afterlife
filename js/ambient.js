/* Slow-falling litter drifting behind the calm screens. Paused everywhere else to save battery. */
import { drawShape } from './scene.js?v=12';
const SH = ['bottle', 'can', 'bag', 'cup', 'box', 'carton', 'sheet', 'peel', 'butt', 'cap', 'mask', 'stick'];
const COLS = ['#4E86A8', '#9AA3A8', '#B9A88A', '#8A6E86', '#C0762A', '#6E9384'];
let cv, c, raf = 0, W = 0, H = 0; const items = [];
const mk = (anywhere) => ({ x: Math.random() * W, y: anywhere ? Math.random() * H : -50, v: 14 + Math.random() * 26, r: Math.random() * 6, w: (Math.random() - .5) * .8, s: 1.6 + Math.random() * 2.4, a: .07 + Math.random() * .09, p: Math.random() * 6, sh: SH[(Math.random() * SH.length) | 0], c: COLS[(Math.random() * 6) | 0] });
function size() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); }
export function start() {
  if (raf || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  cv = cv || document.getElementById('ambient'); c = c || cv.getContext('2d'); size();
  if (!items.length) for (let i = 0; i < 20; i++) items.push(mk(true));
  let last = performance.now();
  const f = (n) => {
    const dt = Math.min((n - last) / 1000, .05); last = n; c.clearRect(0, 0, W, H);
    for (const it of items) {
      it.y += it.v * dt; it.r += it.w * dt; if (it.y > H + 50) Object.assign(it, mk(false));
      c.save(); c.globalAlpha = it.a; c.translate(it.x + Math.sin(n / 1600 + it.p) * 16, it.y); c.rotate(it.r); c.scale(it.s, it.s); drawShape(c, it.sh, it.c); c.restore();
    }
    raf = requestAnimationFrame(f);
  };
  raf = requestAnimationFrame(f);
}
export function stop() { cancelAnimationFrame(raf); raf = 0; if (c) c.clearRect(0, 0, W, H); }
addEventListener('resize', () => { if (cv && raf) size(); });
