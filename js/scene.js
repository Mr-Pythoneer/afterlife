/* Afterlife — the ground cross-section.
 *
 * Draws a slice of earth with everything the player has thrown away buried in
 * it, newest nearest the surface. A time scrubber fades out whatever has
 * actually broken down by the selected year. The figure standing on the
 * surface is the player, and they are gone well before most of their rubbish.
 */

import { FATES } from './data.js';

const SHAPES = {
  'pet-bottle': 'bottle', 'glass-bottle': 'bottle', 'carton': 'carton',
  'aluminium-can': 'can', 'tin-can': 'can',
  'plastic-bag': 'bag', 'crisp-packet': 'bag', 'clothing': 'bag',
  'coffee-cup': 'cup', 'styrofoam': 'cup',
  'straw': 'stick', 'plastic-cutlery': 'stick', 'toothbrush': 'stick', 'fishing-line': 'squiggle',
  'cigarette-butt': 'butt', 'gum': 'blob', 'balloon': 'balloon',
  'pizza-box': 'box', 'cardboard': 'box', 'takeaway-box': 'box', 'paper': 'sheet', 'receipt': 'sheet',
  'banana-peel': 'peel', 'apple-core': 'core',
  'face-mask': 'mask', 'nappy': 'blob',
  'battery': 'battery', 'electronics': 'chip', 'bottle-cap': 'cap',
};

const FATE_SHAPE = {
  [FATES.PLASTIC]: 'bottle', [FATES.METAL]: 'can', [FATES.GLASS]: 'bottle',
  [FATES.ORGANIC]: 'core', [FATES.PAPER]: 'sheet', [FATES.TOXIC]: 'battery',
  [FATES.TEXTILE]: 'bag',
};

const FATE_COLOUR = {
  [FATES.PLASTIC]: '#4E86A8',
  [FATES.METAL]: '#9AA3A8',
  [FATES.GLASS]: '#6E9384',
  [FATES.ORGANIC]: '#8C7A3F',
  [FATES.PAPER]: '#B9A88A',
  [FATES.TOXIC]: '#C0762A',
  [FATES.TEXTILE]: '#8A6E86',
};

/* Deterministic pseudo-random so the scene never reshuffles between frames. */
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.items = [];
    this.year = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    window.addEventListener('resize', () => { this.resize(); this.draw(); });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(rect.width, 320);
    this.h = Math.max(rect.height, 260);
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setItems(items) { this.items = items; this.draw(); }
  setYear(year) { this.year = year; this.draw(); }

  /* Where each buried item sits. Newest items are shallow, older ones deeper —
   * so the pile reads as strata laid down over time. */
  layout() {
    const surfaceY = this.h * 0.30;
    const floorY = this.h - 14;
    const depth = floorY - surfaceY;
    const n = this.items.length;
    return this.items.map((entry, i) => {
      const r = rng(i + 1);
      const age = n <= 1 ? 0 : (n - 1 - i) / (n - 1);      // 0 = newest
      const rowBand = 0.10 + age * 0.80;
      const y = surfaceY + depth * rowBand + (r() - 0.5) * depth * 0.10;
      const x = this.w * (0.08 + r() * 0.84);
      return { entry, x, y, rot: (r() - 0.5) * 1.6, scale: 0.85 + r() * 0.4 };
    });
  }

  draw() {
    const { ctx, w, h } = this;
    const surfaceY = h * 0.30;
    ctx.clearRect(0, 0, w, h);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, surfaceY);
    sky.addColorStop(0, '#D9D6CC');
    sky.addColorStop(1, '#C8C4B6');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, surfaceY);

    // Soil strata
    const bands = [
      { to: 0.34, c: '#6B5B44' }, { to: 0.48, c: '#5D4E3A' },
      { to: 0.68, c: '#514432' }, { to: 0.85, c: '#463A2B' }, { to: 1.0, c: '#3B3124' },
    ];
    let prev = surfaceY;
    for (const b of bands) {
      const to = surfaceY + (h - surfaceY) * ((b.to - 0.30) / 0.70);
      ctx.fillStyle = b.c;
      ctx.fillRect(0, prev, w, Math.max(to - prev, 0));
      prev = to;
    }
    ctx.fillStyle = bands[bands.length - 1].c;
    ctx.fillRect(0, prev, w, h - prev);

    // Speckled grit so the soil is not a flat slab
    ctx.save();
    const grit = rng(77);
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 260; i++) {
      const gx = grit() * w;
      const gy = surfaceY + grit() * (h - surfaceY);
      ctx.fillStyle = grit() > 0.5 ? '#2A2119' : '#8A7657';
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
    ctx.restore();

    // Ground line
    ctx.strokeStyle = '#2E2519';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(w, surfaceY);
    ctx.stroke();

    this.drawHuman(ctx, w * 0.9, surfaceY);

    // Buried items
    for (const p of this.layout()) {
      const item = p.entry.item;
      const pl = item.persist;
      const bio = item.mode === 'biodegrades';
      const gone = bio && this.year >= pl.high;
      const fragmented = !bio && item.mode === 'fragments' && this.year >= pl.low;
      const fading = bio ? this.year > pl.high * 0.55 : (item.mode === 'inert' && pl.high !== Infinity && this.year >= pl.high);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.scale, p.scale);
      if (fragmented) {
        const fr = rng(p.x | 0);
        ctx.fillStyle = FATE_COLOUR[item.fate] || '#4E86A8';
        for (let k = 0; k < 9; k++) { ctx.fillRect((fr() - .5) * 34, (fr() - .5) * 26, 2, 2); }
      } else {
        ctx.globalAlpha = gone ? 0 : (fading ? 0.42 : 1);
        drawShape(ctx, SHAPES[item.id] || FATE_SHAPE[item.fate] || 'bottle', FATE_COLOUR[item.fate] || '#4E86A8');
      }
      ctx.restore();
    }

    if (this.items.length === 0) {
      ctx.fillStyle = 'rgba(236,232,225,0.40)';
      ctx.font = '500 12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NOTHING BURIED YET', w / 2, surfaceY + (h - surfaceY) / 2);
    }
  }

  /* The player. Present until about 60, fading to nothing by 85. */
  drawHuman(ctx, x, groundY) {
    const alive = this.year < 60;
    const fading = this.year >= 60 && this.year < 85;
    const alpha = alive ? 1 : (fading ? 1 - (this.year - 60) / 25 : 0);
    ctx.save();
    ctx.globalAlpha = Math.max(alpha, 0);
    if (alpha > 0.02) {
      ctx.fillStyle = '#1B1A14';
      const hh = 34;
      ctx.beginPath(); ctx.arc(x, groundY - hh, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 3, groundY - hh + 5, 6, 16);
      ctx.fillRect(x - 3, groundY - 13, 2.4, 13);
      ctx.fillRect(x + 0.6, groundY - 13, 2.4, 13);
    }
    ctx.restore();

    ctx.save();
    ctx.font = '500 9px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = alpha > 0.02 ? 'rgba(27,26,20,0.75)' : 'rgba(168,50,50,0.95)';
    ctx.fillText(alpha > 0.02 ? 'YOU' : 'YOU — GONE', x, groundY - 46);
    ctx.restore();
  }
}

export function drawShape(ctx, shape, colour) {
  ctx.fillStyle = colour;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 0.8;
  const p = new Path2D();
  switch (shape) {
    case 'bottle':
      p.moveTo(-4, -11); p.lineTo(4, -11); p.lineTo(4, -6);
      p.lineTo(7, -1); p.lineTo(7, 11); p.lineTo(-7, 11);
      p.lineTo(-7, -1); p.lineTo(-4, -6); p.closePath();
      break;
    case 'can':
      p.moveTo(-6, -10); p.lineTo(6, -10); p.lineTo(6, 10); p.lineTo(-6, 10); p.closePath();
      break;
    case 'cup':
      p.moveTo(-7, -9); p.lineTo(7, -9); p.lineTo(5, 10); p.lineTo(-5, 10); p.closePath();
      break;
    case 'carton':
      p.moveTo(-5, -11); p.lineTo(5, -11); p.lineTo(5, 10); p.lineTo(-5, 10); p.closePath();
      p.moveTo(-5, -11); p.lineTo(0, -14); p.lineTo(5, -11);
      break;
    case 'bag':
      p.moveTo(-9, -6); p.quadraticCurveTo(-6, -12, 0, -9);
      p.quadraticCurveTo(6, -12, 9, -6); p.quadraticCurveTo(10, 6, 0, 10);
      p.quadraticCurveTo(-10, 6, -9, -6); p.closePath();
      break;
    case 'box':
      p.moveTo(-10, -7); p.lineTo(10, -7); p.lineTo(10, 7); p.lineTo(-10, 7); p.closePath();
      break;
    case 'sheet':
      p.moveTo(-9, -8); p.lineTo(9, -6); p.lineTo(7, 8); p.lineTo(-8, 6); p.closePath();
      break;
    case 'stick':
      p.moveTo(-1.6, -12); p.lineTo(1.6, -12); p.lineTo(1.6, 12); p.lineTo(-1.6, 12); p.closePath();
      break;
    case 'squiggle':
      for (let i = 0; i < 3; i++) { p.moveTo(-9, -6 + i * 6); p.quadraticCurveTo(0, -1 + i * 6, 9, -6 + i * 6); }
      break;
    case 'butt':
      p.moveTo(-2.2, -9); p.lineTo(2.2, -9); p.lineTo(2.2, 9); p.lineTo(-2.2, 9); p.closePath();
      break;
    case 'blob':
      p.arc(0, 0, 7, 0, Math.PI * 2);
      break;
    case 'balloon':
      p.ellipse(0, -4, 6.5, 8, 0, 0, Math.PI * 2);
      p.moveTo(0, 4); p.lineTo(-1, 13);
      break;
    case 'peel':
      p.moveTo(0, -10); p.quadraticCurveTo(9, 0, 4, 11);
      p.quadraticCurveTo(0, 4, -4, 11); p.quadraticCurveTo(-9, 0, 0, -10); p.closePath();
      break;
    case 'core':
      p.moveTo(-1.6, -9); p.lineTo(1.6, -9); p.lineTo(3.4, -2);
      p.quadraticCurveTo(5, 8, 0, 10); p.quadraticCurveTo(-5, 8, -3.4, -2); p.closePath();
      break;
    case 'mask':
      p.moveTo(-9, -5); p.quadraticCurveTo(0, 2, 9, -5);
      p.lineTo(9, 5); p.quadraticCurveTo(0, 11, -9, 5); p.closePath();
      break;
    case 'battery':
      p.moveTo(-4, -10); p.lineTo(4, -10); p.lineTo(4, 10); p.lineTo(-4, 10); p.closePath();
      p.moveTo(-1.6, -12.5); p.lineTo(1.6, -12.5); p.lineTo(1.6, -10); p.lineTo(-1.6, -10); p.closePath();
      break;
    case 'chip':
      p.moveTo(-8, -6); p.lineTo(8, -6); p.lineTo(8, 6); p.lineTo(-8, 6); p.closePath();
      for (let i = -5; i <= 5; i += 3.4) { p.moveTo(i, -9); p.lineTo(i, -6); p.moveTo(i, 6); p.lineTo(i, 9); }
      break;
    case 'cap':
      p.arc(0, 0, 5, 0, Math.PI * 2);
      break;
    default:
      p.arc(0, 0, 6, 0, Math.PI * 2);
  }
  ctx.fill(p);
  ctx.stroke(p);
}

export function itemLook(item) {
  return { shape: SHAPES[item.id] || FATE_SHAPE[item.fate] || 'bottle', colour: FATE_COLOUR[item.fate] || '#4E86A8' };
}
