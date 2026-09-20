/* Animated full-screen pictures for each beat of an item's journey.
 * drawPic(ctx, key, W, H, t, item) — t is seconds since the beat started. */
import { drawShape, itemLook } from './scene.js?v=10';

const ease = (x) => { x = Math.min(Math.max(x, 0), 1); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const h = (n) => { const x = Math.sin(n * 127.1 + 1.7) * 43758.5453; return x - Math.floor(x); };
const SPARE = ['bottle', 'can', 'bag', 'box', 'cup', 'sheet', 'carton', 'blob'];
const COLS = ['#4E86A8', '#9AA3A8', '#B9A88A', '#8A6E86', '#C0762A', '#6E9384'];

function sky(c, W, H, a, b) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function box(c, col, x, y, w, hh) { c.fillStyle = col; c.fillRect(x, y, w, hh); }
function thing(c, shape, col, x, y, s, rot = 0, a = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = a; drawShape(c, shape, col); c.restore(); }
function mine(c, it, x, y, s, rot = 0, a = 1) { const l = itemLook(it); thing(c, l.shape, l.colour, x, y, s, rot, a); }
function wheel(c, x, y, r) { c.fillStyle = '#111'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#666'; c.beginPath(); c.arc(x, y, r * .4, 0, 7); c.fill(); }
function text(c, s, x, y, size, col, align = 'center') { c.fillStyle = col; c.font = `700 ${size}px ui-monospace, Menlo, monospace`; c.textAlign = align; c.fillText(s, x, y); }

const P = {
  hand(c, W, H, t, it) {
    sky(c, W, H, '#2b2a24', '#3f3b30'); const S = Math.min(W, H) / 60;
    const drop = Math.max(t - .7, 0); const y = H * .3 + drop * drop * H * .9;
    c.strokeStyle = '#d8b898'; c.lineCap = 'round'; c.lineWidth = S * 5;
    c.beginPath(); c.moveTo(W * .95, -20); c.lineTo(W * (.55 + Math.min(drop, .5) * .25), H * .2); c.stroke();
    mine(c, it, W * .5, y, S * .7, Math.sin(t * 3) * .3 * (drop > 0 ? 1 : 0));
    box(c, '#1b1a14', 0, H * .86, W, H * .14);
  },
  bin(c, W, H, t, it) {
    sky(c, W, H, '#22302a', '#2d3a30'); const S = Math.min(W, H) / 60; const cx = W / 2, top = H * .55;
    mine(c, it, cx, H * .05 + ease(t / 1.4) * (top - H * .05 + S * 3), S * .7, t * 2 * (t < 1.4 ? 1 : 0));
    c.fillStyle = '#3d4a44'; c.beginPath(); c.moveTo(cx - S * 14, top); c.lineTo(cx + S * 14, top); c.lineTo(cx + S * 11, H * .9); c.lineTo(cx - S * 11, H * .9); c.fill();
    c.save(); c.translate(cx - S * 15, top); c.rotate(-.9 * Math.min(t / .5, 1)); box(c, '#55645d', 0, -S, S * 30, S); c.restore();
    for (let i = 0; i < 3; i++) box(c, '#2f3b35', cx - S * 11 + i * S * 8, top + S * 4, S * 3, H * .3);
  },
  truck(c, W, H, t) {
    sky(c, W, H, '#2d2a24', '#4a4232'); box(c, '#1d1c18', 0, H * .72, W, H * .28);
    const S = Math.min(W, H) / 60; const x = -S * 40 + t * W * .45; const y = H * .72;
    box(c, '#c9b458', x, y - S * 16, S * 30, S * 14); box(c, '#a89840', x + S * 30, y - S * 12, S * 10, S * 10);
    box(c, '#22353d', x + S * 34, y - S * 10, S * 5, S * 4);
    const p = .5 + .5 * Math.sin(t * 8); box(c, '#3a3a34', x + S * 2, y - S * 15, S * (9 + p * 3), S * 12);
    wheel(c, x + S * 8, y, S * 3); wheel(c, x + S * 33, y, S * 3);
    for (let i = 0; i < 5; i++) thing(c, SPARE[i], COLS[i], x - S * (4 + i * 5), y - S * (2 + (i % 2) * 2), S * .35, t + i, .8);
  },
  sorting(c, W, H, t, it) {
    sky(c, W, H, '#1e2226', '#262b30'); const S = Math.min(W, H) / 60; const by = H * .5;
    box(c, '#3a3f44', 0, by, W * .68, S * 3); c.fillStyle = '#4a5056';
    for (let i = 0; i < 24; i++) c.fillRect(((i * S * 5 + t * S * 12) % (W * .68)), by, S * .8, S * 3);
    for (let i = 0; i < 6; i++) { const x = ((h(i) * W * .6 + t * W * .07) % (W * .6)); thing(c, SPARE[i % 8], COLS[i % 6], x + W * .04, by - S * 3.4, S * .3, 0, .55); }
    const p = Math.min(t / 2.2, 1); const ix = W * .08 + p * W * .6;
    const fall = Math.max(ix - W * .62, 0); mine(c, it, Math.min(ix, W * .68) + fall * .3, by - S * 4 + fall * H * .9, S * .45, fall * 6);
    text(c, 'RECYCLE', W * .84, H * .28, S * 2.4, '#7FB58C'); text(c, 'LANDFILL', W * .84, H * .82, S * 2.4, '#E07070');
    c.strokeStyle = '#E07070'; c.lineWidth = S * .5; c.beginPath(); c.moveTo(W * .68, by); c.lineTo(W * .8, H * .74); c.stroke();
    c.strokeStyle = '#7FB58C'; c.beginPath(); c.moveTo(W * .68, by); c.lineTo(W * .8, H * .34); c.stroke();
  },
  ship(c, W, H, t, it) {
    sky(c, W, H, '#3a4a52', '#566670'); box(c, '#1e3038', 0, H * .62, W, H * .38); const S = Math.min(W, H) / 60;
    const x = W * .1 + t * W * .12, y = H * .62 + Math.sin(t * 2) * S * .5;
    c.fillStyle = '#20262a'; c.beginPath(); c.moveTo(x, y - S * 3); c.lineTo(x + S * 42, y - S * 3); c.lineTo(x + S * 38, y + S * 4); c.lineTo(x + S * 4, y + S * 4); c.fill();
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) box(c, COLS[(i + r * 2) % 6], x + S * (3 + i * 6.2), y - S * (7 + r * 4), S * 5.8, S * 3.8);
    mine(c, it, x + S * 20, y - S * 16, S * .3);
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); for (let k = 0; k < W; k += 20) c.lineTo(k, H * (.68 + i * .05) + Math.sin(k / 40 + t * 2 + i) * 4); c.stroke(); }
  },
  dump(c, W, H, t, it) {
    sky(c, W, H, '#3d3b34', '#59554a'); const S = Math.min(W, H) / 60; c.fillStyle = '#332d22';
    c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * .7); c.quadraticCurveTo(W * .5, H * .4, W, H * .72); c.lineTo(W, H); c.fill();
    for (let i = 0; i < 70; i++) { const x = h(i) * W, top = H * .7 - Math.sin(x / W * Math.PI) * H * .22 + 6; thing(c, SPARE[i % 8], COLS[i % 6], x, top + h(i + 9) * H * .22, S * (.28 + h(i + 3) * .2), h(i) * 6, .9); }
    mine(c, it, W * .5, H * .5 + Math.sin(t * 5) * 3, S * .55, Math.sin(t * 4) * .3);
    for (let i = 0; i < 4; i++) { const x = (h(i + 40) * W + t * W * (.25 + i * .05)) % W; thing(c, 'bag', '#dcd6c8', x, H * (.2 + i * .06) + Math.sin(t * 3 + i) * 12, S * .35, t * 2 + i, .8); }
  },
  drain(c, W, H, t, it) {
    sky(c, W, H, '#25272b', '#33363b'); const S = Math.min(W, H) / 60; box(c, '#464a50', 0, H * .72, W, S * 1.4);
    box(c, '#15161a', W * .62, H * .72, S * 14, S * 3); for (let i = 0; i < 5; i++) box(c, '#3a3d44', W * .62 + i * S * 3, H * .72, S * .8, S * 3);
    c.strokeStyle = 'rgba(150,180,220,.5)'; c.lineWidth = 2; for (let i = 0; i < 60; i++) { const x = (h(i) * W + t * 40) % W, y = (h(i + 7) * H + t * 700) % (H * .75); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 22); c.stroke(); }
    box(c, 'rgba(60,90,120,.55)', 0, H * .735, W, S * 2);
    const p = ease(t / 2); mine(c, it, W * .15 + p * W * .5, H * .7 + p * S * 2, S * .5, p * 3, 1 - Math.max(p - .9, 0) * 10);
  },
  river(c, W, H, t, it) {
    sky(c, W, H, '#2c3a2a', '#3a4a34'); box(c, '#46756a', 0, H * .38, W, H * .3); const S = Math.min(W, H) / 60;
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2;
    for (let i = 0; i < 8; i++) { c.beginPath(); for (let k = 0; k <= W; k += 16) c.lineTo(k, H * (.4 + i * .035) + Math.sin(k / 50 - t * 3 + i) * 5); c.stroke(); }
    for (let i = 0; i < 4; i++) thing(c, SPARE[i], COLS[i], ((h(i + 20) * W + t * W * .12) % W), H * (.44 + i * .05) + Math.sin(t * 3 + i) * 4, S * .3, t + i, .7);
    mine(c, it, W * .1 + t * W * .3, H * .53 + Math.sin(t * 3) * 6, S * .6, Math.sin(t * 2) * .4);
  },
  sea(c, W, H, t, it) {
    sky(c, W, H, '#2f6f86', '#0b2233'); const S = Math.min(W, H) / 60;
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.moveTo(W * (.1 + i * .2), 0); c.lineTo(W * (.16 + i * .2), 0); c.lineTo(W * (.3 + i * .2), H); c.lineTo(W * (.1 + i * .2), H); c.fill(); }
    for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(h(i) * W, (h(i + 5) * H - t * 30 * (1 + h(i))) % H + H, 2, 0, 7); c.fill(); }
    mine(c, it, W * (.3 + t * .1), H * (.3 + t * .06) + Math.sin(t * 2) * 8, S * .7, t * .6);
  },
  fragments(c, W, H, t, it) {
    sky(c, W, H, '#1f5468', '#0b2233'); const S = Math.min(W, H) / 60; const l = itemLook(it); const p = ease(t / 2.2);
    mine(c, it, W / 2, H / 2, S * .8, 0, 1 - p);
    const n = Math.floor(p * 110); c.fillStyle = l.colour;
    for (let i = 0; i < n; i++) { const a = h(i) * 6.28, d = (h(i + 3) * .45 + .05) * Math.min(W, H) * p * 1.6; c.globalAlpha = .9; c.fillRect(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, 2 + h(i + 9) * 5, 2 + h(i + 9) * 5); }
    c.globalAlpha = 1;
  },
  animal(c, W, H, t, it) {
    sky(c, W, H, '#1f5468', '#0b2233'); const S = Math.min(W, H) / 60; const l = itemLook(it);
    const fx = -W * .1 + t * W * .38, fy = H * .5;
    c.fillStyle = l.colour; for (let i = 0; i < 60; i++) { const x = h(i) * W * 1.1; if (x > fx + S * 8) c.fillRect(x, H * (.3 + h(i + 4) * .4), 3, 3); }
    c.fillStyle = '#7d94a0'; c.beginPath(); c.ellipse(fx, fy, S * 10, S * 5, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(fx - S * 9, fy); c.lineTo(fx - S * 15, fy - S * 4 + Math.sin(t * 8) * 2); c.lineTo(fx - S * 15, fy + S * 4 + Math.sin(t * 8) * 2); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(fx + S * 6, fy - S * 1.2, S * .7, 0, 7); c.fill();
    c.fillStyle = l.colour; for (let i = 0; i < 24; i++) c.fillRect(fx - S * 6 + h(i) * S * 11, fy - S * 2 + h(i + 2) * S * 4, 3, 3);
  },
  clock(c, W, H, t, it) {
    sky(c, W, H, '#14130f', '#22201a'); const S = Math.min(W, H) / 60; const n = Math.floor(ease(t / 2.2) * 500);
    box(c, '#2c281e', 0, H * .78, W, H * .22);
    text(c, `+${n} years`, W / 2, H * .34, S * 5, '#ECE8DF');
    const a = n < 60 ? 1 : Math.max(1 - (n - 60) / 40, 0); c.globalAlpha = a; c.fillStyle = '#ECE8DF';
    c.beginPath(); c.arc(W * .2, H * .78 - S * 9, S * 1.4, 0, 7); c.fill(); c.fillRect(W * .2 - S, H * .78 - S * 7.4, S * 2, S * 5); c.fillRect(W * .2 - S, H * .78 - S * 2.4, S * .8, S * 2.4); c.fillRect(W * .2 + S * .2, H * .78 - S * 2.4, S * .8, S * 2.4); c.globalAlpha = 1;
    if (a === 0) text(c, 'you: gone', W * .2, H * .78 - S * 6, S * 1.6, '#E07070');
    mine(c, it, W * .62, H * .78 - S * 3, S * .8);
  },
  furnace(c, W, H, t, it) {
    sky(c, W, H, '#2a1a12', '#3b2416'); const S = Math.min(W, H) / 60; const g = c.createRadialGradient(W / 2, H * .55, 5, W / 2, H * .55, W * .5);
    g.addColorStop(0, 'rgba(255,170,60,.9)'); g.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    box(c, '#1a1410', W * .3, H * .5, W * .4, H * .5);
    const p = ease(t / 1.8); mine(c, it, W * (.1 + p * .4), H * .62, S * .7 * (1 - p * .8), p * 2, 1 - p * .5);
    for (let i = 0; i < 25; i++) { c.fillStyle = 'rgba(255,200,100,.8)'; c.fillRect(W * (.35 + h(i) * .3), H * .5 - ((t * 120 * (.5 + h(i + 3)) + h(i) * H * .3) % (H * .4)), 3, 3); }
  },
  shelf(c, W, H, t, it) {
    sky(c, W, H, '#22261f', '#2f352a'); const S = Math.min(W, H) / 60;
    for (const y of [.55, .82]) box(c, '#5b4a34', W * .08, H * y, W * .84, S * 1.2);
    for (let i = 0; i < 8; i++) { thing(c, i % 2 ? 'can' : 'bottle', COLS[i % 6], W * (.14 + i * .1), H * .55 - S * 4, S * .6, 0, .8); thing(c, 'box', COLS[(i + 2) % 6], W * (.14 + i * .1), H * .82 - S * 3, S * .6, 0, .8); }
    const p = ease(t / 1.2); const g = c.createRadialGradient(W / 2, H * .3, 4, W / 2, H * .3, S * 20); g.addColorStop(0, 'rgba(127,181,140,.7)'); g.addColorStop(1, 'rgba(127,181,140,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H); mine(c, it, W / 2, H * .3, S * p * 1.3, 0, p);
  },
  soil(c, W, H, t, it) {
    sky(c, W, H, '#3a3b30', '#565a44'); const S = Math.min(W, H) / 60; const gy = H * .62; box(c, '#4a3b2b', 0, gy, W, H - gy);
    const p = ease(t / 1.6); mine(c, it, W / 2, gy - S * 3 + p * S * 6, S * .8 * (1 - p * .5), 0, 1 - p);
    const q = ease((t - 1.1) / 1); c.strokeStyle = '#7FB58C'; c.lineWidth = S * .6; c.beginPath(); c.moveTo(W / 2, gy); c.lineTo(W / 2, gy - q * S * 12); c.stroke();
    c.fillStyle = '#7FB58C'; c.beginPath(); c.ellipse(W / 2 - S * 2.5 * q, gy - q * S * 11, S * 2.6 * q, S * 1.2 * q, -.5, 0, 7); c.fill(); c.beginPath(); c.ellipse(W / 2 + S * 2.5 * q, gy - q * S * 11, S * 2.6 * q, S * 1.2 * q, .5, 0, 7); c.fill();
  },
  turtle(c, W, H, t, it) {
    sky(c, W, H, '#2f6f86', '#0b2233'); const S = Math.min(W, H) / 60; const x = W * .55 + Math.sin(t) * S, y = H * .45 + Math.sin(t * 1.6) * S;
    c.fillStyle = '#5a6b3a'; c.beginPath(); c.ellipse(x, y, S * 9, S * 6, 0, 0, 7); c.fill(); c.fillStyle = '#48582e'; c.beginPath(); c.ellipse(x, y, S * 6, S * 3.8, 0, 0, 7); c.fill();
    c.fillStyle = '#7a8a52'; c.beginPath(); c.ellipse(x - S * 10.5, y, S * 3, S * 2.2, 0, 0, 7); c.fill();
    for (const k of [-1, 1]) { const f = Math.sin(t * 3) * .4; c.save(); c.translate(x - S * 3, y + k * S * 5); c.rotate(k * (.5 + f)); c.beginPath(); c.ellipse(0, k * S * 3, S * 1.6, S * 4.5, 0, 0, 7); c.fill(); c.restore(); }
    const p = Math.min(t / 1.6, 1); if (p < 1) mine(c, it, W * .12 + p * (x - S * 12 - W * .12), y - S * 2 + Math.sin(t * 4) * 6, S * .6, t, 1); else mine(c, it, x - S * 7, y + S * .5, S * .28, 0, .9);
  },
  bird(c, W, H, t, it) {
    sky(c, W, H, '#5a6a78', '#b8a98c'); const S = Math.min(W, H) / 60; const x = W / 2, y = H * .42 + Math.sin(t * 2) * S * 1.5, f = Math.sin(t * 6);
    c.fillStyle = '#e9e6de'; c.beginPath(); c.ellipse(x, y, S * 9, S * 3.6, 0, 0, 7); c.fill();
    c.beginPath(); c.arc(x + S * 9, y - S, S * 2.4, 0, 7); c.fill(); c.fillStyle = '#d6b23a'; c.beginPath(); c.moveTo(x + S * 11, y - S * 1.4); c.lineTo(x + S * 15, y - S * .6); c.lineTo(x + S * 11, y); c.fill();
    c.fillStyle = '#c9c5ba'; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(x - S * 2, y); c.lineTo(x + S * 3, y); c.lineTo(x - S * 8, y - S * 13 * f - S * 5 * (k > 0 ? 0 : 0)); c.fill(); }
    if (t > .8) mine(c, it, x - S * 1, y + S * .2, S * .22, 0, Math.min((t - .8) * 2, 1));
  },
  fire(c, W, H, t, it) {
    sky(c, W, H, '#150f0c', '#2a1a12'); const S = Math.min(W, H) / 60; box(c, '#1a1410', 0, H * .8, W, H * .2);
    for (let i = 0; i < 22; i++) { const bx = W * (.3 + h(i) * .4), life = ((t * .9 + h(i + 5)) % 1), fy = H * .8 - life * H * .5 * (.5 + h(i + 2)); c.fillStyle = `rgba(255,${120 + h(i) * 100 | 0},30,${1 - life})`; c.beginPath(); c.ellipse(bx, fy, S * (2.5 - life * 1.8), S * (4 - life * 2), 0, 0, 7); c.fill(); }
    mine(c, it, W / 2, H * .72, S * .8, Math.sin(t * 20) * .1);
    for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(90,90,90,${.35 - ((t + i * .3) % 1.5) * .2})`; c.beginPath(); c.arc(W * (.45 + h(i) * .1), H * .3 - ((t + i * .3) % 1.5) * S * 8, S * (3 + i), 0, 7); c.fill(); }
  },
  generic(c, W, H, t, it) { sky(c, W, H, '#26241d', '#3a372c'); mine(c, it, W / 2, H / 2, Math.min(W, H) / 60 * 1.2, t * .6); },
};

export function drawPic(c, key, W, H, t, it) {
  c.save(); (P[key] || P.generic)(c, W, H, t, it); c.restore();
  const f = 1 - Math.min(t / .35, 1); if (f > 0) { c.fillStyle = `rgba(0,0,0,${f})`; c.fillRect(0, 0, W, H); }
}
