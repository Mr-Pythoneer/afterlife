import { ITEMS, COST, COST_LITTER_ORGANIC, MODES, FATES, MODE_COPY, METHODOLOGY, itemById, getJourney, rangeText } from './data.js?v=11';
import { Scene, drawShape, itemLook } from './scene.js?v=11';
import * as Ambient from './ambient.js?v=11';
import { drawPic } from './pics.js?v=11';
import { Sim } from './sim.js?v=11';
import * as Sound from './sound.js?v=11';
import { PLACES, SOURCE } from './places.js?v=11';
import { classifyLocal, classifyClaude, loadClassifier } from './ai.js?v=11';

const $ = (s) => document.querySelector(s);
const GOOD_ROUTE = new Set(['pet-bottle', 'aluminium-can', 'tin-can', 'glass-bottle', 'takeaway-box', 'cardboard', 'paper',
  'pizza-box', 'banana-peel', 'apple-core', 'battery', 'electronics', 'bottle-cap']);
const OUTLIVE_YEAR = 80;

const state = { buried: [], saved: [], current: null };
let scene, sim, consRaf = 0, lastYear = 0, heroRaf = 0;

/* ---------- little motion helpers ---------- */
function countText(el, text, ms = 900) {
  const parts = text.split(/(\d[\d,]*\.?\d*)/), nums = parts.map((s) => (/^\d/.test(s) ? parseFloat(s.replace(/,/g, '')) : null));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || nums.every((n) => n === null)) { el.textContent = text; return; }
  cancelAnimationFrame(el._r); const t0 = performance.now();
  const f = (n) => {
    const p = Math.min((n - t0) / ms, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = parts.map((s, i) => { if (nums[i] === null) return s; const d = (s.split('.')[1] || '').length; return (nums[i] * e).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }).join('');
    if (p < 1) el._r = requestAnimationFrame(f);
  };
  el._r = requestAnimationFrame(f);
}
const bounceOut = (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const hero = $('#hero'), hctx = hero.getContext('2d');
function playHero(item) {
  const l = itemLook(item), t0 = performance.now(); hctx.setTransform(2, 0, 0, 2, 0, 0);
  const f = (now) => {
    const t = (now - t0) / 1000, k = bounceOut(Math.min(t / .9, 1)); hctx.clearRect(0, 0, 220, 150);
    const y = -30 + (92 + 30) * k + (t > .9 ? Math.sin((t - .9) * 2.2) * 5 : 0);
    hctx.fillStyle = 'rgba(0,0,0,.18)'; hctx.beginPath(); hctx.ellipse(110, 128, 34 * (.5 + .5 * k), 6 * (.5 + .5 * k), 0, 0, 7); hctx.fill();
    hctx.save(); hctx.translate(110, y); hctx.rotate((1 - k) * 4 + Math.sin(t * 1.3) * .12); hctx.scale(4.2, 4.2); drawShape(hctx, l.shape, l.colour); hctx.restore();
    heroRaf = requestAnimationFrame(f);
  };
  cancelAnimationFrame(heroRaf); heroRaf = requestAnimationFrame(f);
}

/* ---------- screens ---------- */
const SCREENS = ['scan', 'pick', 'id', 'journey', 'decide', 'out', 'cons', 'pile', 'where', 'sim'];
function go(name) {
  for (const n of SCREENS) $('#scr-' + n).hidden = n !== name;
  window.scrollTo(0, 0);
  if (name !== 'sim') sim?.stop();
  if (name !== 'cons') cancelAnimationFrame(consRaf);
  if (!['journey', 'cons', 'sim'].includes(name)) Sound.stop();
  if (['scan', 'pick', 'id', 'decide', 'where'].includes(name)) Ambient.start(); else Ambient.stop();
  if (name !== 'id') cancelAnimationFrame(heroRaf);
  if (name !== 'pile') scene?.stop();
  if (name === 'pile') { if (!scene) scene = new Scene($('#ground')); else scene.resize(); refresh(); scene.start(); }
}
document.addEventListener('click', (e) => { const t = e.target.closest('[data-go]'); if (t) go(t.dataset.go); });

const picker = $('#picker');
for (const item of ITEMS.filter((i) => i.id !== 'unknown')) {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = item.name;
  b.addEventListener('click', () => { $('#thumb').replaceChildren(); show(item, false); });
  picker.append(b);
}
$('#open-pick').addEventListener('click', () => go('pick'));
$('#not-it').addEventListener('click', () => go('pick'));
const key = () => { try { return sessionStorage.getItem('afterlife-key') || ''; } catch { return ''; } };
$('#key').value = key();
$('#key').addEventListener('change', (e) => { try { sessionStorage.setItem('afterlife-key', e.target.value.trim()); } catch {} });
const status = $('#scan-status');
const bar = $('#bar');

function toCanvas(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 768, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src); resolve(c);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function scan(file) {
  if (!file) return;
  status.textContent = 'Reading the photo…'; bar.hidden = true;
  const canvas = await toCanvas(file);
  canvas.className = 'thumb'; $('#thumb').replaceChildren(canvas);
  try {
    let ranked;
    if (key()) { status.textContent = 'Asking Claude…'; ranked = await classifyClaude(canvas, key()); }
    else {
      status.textContent = 'Loading scanner (first time only, ~85 MB)…'; bar.hidden = false;
      ranked = await classifyLocal(canvas, (p) => { bar.value = p; });
      bar.hidden = true;
    }
    const top = ranked[0];
    const item = top.score > 0.3 || top.score === 1 ? itemById(top.id) : itemById('unknown');
    status.textContent = '';
    show(item, true);
  } catch (err) {
    console.error(err); bar.hidden = true;
    status.textContent = 'Scanner failed on this device. Pick from the list instead.';
  }
}
$('#file').addEventListener('change', (e) => scan(e.target.files[0]));

/* ---------- identified ---------- */
function show(item, scanned) {
  state.current = item; if (scanned) Sound.found();
  $('#id-label').textContent = scanned ? 'Looks like' : 'You picked';
  $('#r-name').textContent = item.name;
  countText($('#r-range'), rangeText(item), 1000);
  $('#r-claimed').textContent = item.claimed ? `Posters say ${item.claimed === 1000000 ? '1,000,000' : item.claimed}. Nobody measured that.` : '';
  $('#r-mode').textContent = MODE_COPY[item.mode].label;
  $('#r-mode').dataset.mode = item.mode;
  $('#m-name').textContent = item.name;
  for (const k of ['harm', 'recycle', 'better']) $('#r-' + k).textContent = item[k];
  $('#r-note').textContent = item.note || '';
  const src = $('#r-source');
  src.textContent = item.source?.name && item.source.name !== '—' ? `Source: ${item.source.name}` : '';
  if (item.source?.url) src.href = item.source.url; else src.removeAttribute('href');
  go('id'); playHero(item);
}

/* ---------- decide, then the journey plays itself ---------- */
const PIC = {
  'You let go': 'hand', 'The bin': 'bin', 'The truck': 'truck', 'The sorting line': 'sorting', 'Sold by the tonne': 'ship',
  'Out in the open': 'dump', 'Water': 'river', 'It breaks up, not down': 'fragments', 'Small enough to eat': 'animal',
  'Still here, just invisible': 'clock', 'The furnace': 'furnace', 'Back on a shelf': 'shelf', 'Or: none of that': 'dump',
  'Re-melted, or crushed for roadfill': 'furnace', 'Or: buried': 'dump', 'Geological': 'clock',
  'In open air or a compost heap': 'soil', 'Or: sealed in landfill': 'dump', 'Legible': 'dump', 'Pulped': 'furnace',
  'The end of the line': 'shelf', 'The wrong bin': 'bin', 'Leaching': 'drain', 'Downstream': 'river',
  'What should have happened': 'shelf', 'Sorted and shipped': 'ship', 'Every single wash': 'river', 'Buried whole': 'dump',
};
function buildSteps(item, route, good) {
  if (route === 'litter') {
    const s = [{ t: 'right now', title: 'You drop it', pic: 'hand' }, { t: 'day 1', title: 'Nobody collects it', pic: 'dump' }];
    if (item.mode === MODES.BIODEGRADES) return [...s, { t: 'weeks', title: 'It rots', pic: 'soil' }];
    s.push({ t: 'first rain', title: 'The drain', pic: 'drain' }, { t: 'day 9', title: 'The river', pic: 'river' }, { t: 'year 1', title: 'The sea', pic: 'sea' });
    return withCost(item, item.mode === MODES.FRAGMENTS
      ? [...s, { t: 'the half-life', title: 'It breaks up, not down', pic: 'fragments' }, { t: 'after that', title: 'Small enough to eat', pic: 'animal' }]
      : [...s, { t: 'the far end', title: 'Still here', pic: 'clock' }]);
  }
  if (route === 'better' && good) {
    if (item.fate === FATES.ORGANIC) return [{ t: 'right now', title: 'You let go', pic: 'hand' }, { t: 'week 2', title: 'Compost', pic: 'soil' }];
    return [{ t: 'right now', title: 'You let go', pic: 'hand' }, { t: 'day 1', title: 'The right bin', pic: 'bin' },
      { t: 'day 6', title: 'The sorting line', pic: 'sorting', branch: true }, { t: 'month 1', title: 'Melted or pulped', pic: 'furnace' },
      { t: 'month 3', title: 'Something new', pic: 'shelf' }];
  }
  return withCost(item, getJourney(item).map((x) => ({ ...x, pic: PIC[x.title] || 'generic' })));
}
function withCost(item, list) { return list; }

let steps = [], si = 0, t0 = 0, raf = 0, pending = null;
const STAGE_MS = 2200;
const pic = $('#pic'), pctx = pic.getContext('2d');
function sizePic() { const d = Math.min(devicePixelRatio || 1, 2); pic.width = innerWidth * d; pic.height = innerHeight * d; pctx.setTransform(d, 0, 0, d, 0, 0); }
function beat() {
  const s = steps[si]; t0 = performance.now(); Sound.scene(s.pic);
  $('#dots').innerHTML = steps.map((x, i) => `<i class="${i < si ? 'on' : ''} ${i === si ? 'cur' : ''} ${x.branch ? 'branch' : ''}" ${i === si ? `style="--d:${(x.ms || STAGE_MS) / 1000}s"` : ''}></i>`).join('');
  pic.style.animation = 'none'; void pic.offsetWidth; pic.style.animation = '';
  $('#j-sub').textContent = s.sub || ''; $('#j-t').textContent = s.t; const ti = $('#j-title'); ti.textContent = s.title; ti.style.animation = 'none'; void ti.offsetWidth; ti.style.animation = '';
  $('#scr-journey').classList.toggle('branch', !!s.branch);
}
function frame(now) {
  const t = (now - t0) / 1000;
  drawPic(pctx, steps[si].pic, innerWidth, innerHeight, t, state.current);
  if (now - t0 >= (steps[si].ms || STAGE_MS)) return next();
  raf = requestAnimationFrame(frame);
}
function next() {
  cancelAnimationFrame(raf);
  if (si < steps.length - 1) { si++; beat(); raf = requestAnimationFrame(frame); } else finish();
}
function finish() {
  const { item, route, good } = pending;
  const saved = route === 'better' && good;
  if (saved) state.saved.push(item); else state.buried.push({ item });
  showConsequence(item, route, saved);
}
const cpic = $('#conspic'), cctx = cpic.getContext('2d');
function showConsequence(item, route, saved) {
  const cost = saved ? { pic: 'shelf', line: 'Good. That one stays out of the ground.', stat: item.recycle, src: '' }
    : route === 'litter' && item.mode === MODES.BIODEGRADES ? COST_LITTER_ORGANIC : (COST[item.id] || COST.unknown);
  const sc = $('#scr-cons'); sc.classList.toggle('good', saved); sc.classList.remove('boom'); void sc.offsetWidth; if (!saved) sc.classList.add('boom');
  $('#c-kick').textContent = saved ? 'The difference' : 'The consequence';
  $('#c-line').textContent = cost.line; $('#c-stat').textContent = cost.stat; $('#c-src').textContent = cost.src ? `Source: ${cost.src}` : '';
  const mega = $('#c-line'); mega.style.animation = 'none'; void mega.offsetWidth; mega.style.animation = '';
  go('cons'); Sound.scene(saved ? 'good' : 'doom');
  const d = Math.min(devicePixelRatio || 1, 2); cpic.width = innerWidth * d; cpic.height = innerHeight * d; cctx.setTransform(d, 0, 0, d, 0, 0);
  const t0 = performance.now();
  const loop = (now) => { drawPic(cctx, cost.pic, innerWidth, innerHeight, Math.min((now - t0) / 1000, 60), item); consRaf = requestAnimationFrame(loop); };
  consRaf = requestAnimationFrame(loop);
}
$('#c-next').addEventListener('click', () => { go('pile'); Sound.buried(); });
function play(route) {
  const item = state.current; const good = GOOD_ROUTE.has(item.id);
  pending = { item, route, good }; steps = buildSteps(item, route, good); si = 0;
  go('journey'); sizePic(); beat(); raf = requestAnimationFrame(frame);
}
$('#go-journey').addEventListener('click', () => { $('#d-name').textContent = state.current.name; go('decide'); });
$('#d-bin').addEventListener('click', () => play('bin'));
$('#d-litter').addEventListener('click', () => play('litter'));
$('#d-better').addEventListener('click', () => play('better'));
$('#scr-journey').addEventListener('click', next);
addEventListener('resize', () => { if (!$('#scr-journey').hidden) sizePic(); });

/* ---------- ground + stats ---------- */
const slider = $('#year');
function status2(year) {
  let intact = 0, frag = 0, gone = 0;
  for (const { item } of state.buried) {
    if (item.mode === MODES.BIODEGRADES) (year >= item.persist.high ? gone++ : intact++);
    else if (item.mode === MODES.FRAGMENTS && year >= item.persist.low) frag++;
    else intact++;
  }
  return { intact, frag, gone };
}
function outlast() { return state.buried.filter(({ item }) => item.mode !== MODES.BIODEGRADES || item.persist.high > OUTLIVE_YEAR).length; }
function refresh() {
  if (!scene) return;
  scene.setItems(state.buried.map((b) => ({ item: b.item })));
  const n = state.buried.length, s = state.saved.length, o = outlast();
  countText($('#stat-buried'), String(n), 700); countText($('#stat-saved'), String(s), 700); countText($('#stat-outlast'), String(o), 700);
  $('#verdict').textContent = n === 0
    ? (s ? 'Nothing buried. Keep going.' : 'Scan something to start your pile.')
    : o === 0 ? `${n} buried, and all of it will be gone within your lifetime. That is the good outcome.`
    : `${n === 1 ? '1 item' : n + ' items'} buried. ${o === n ? (n === 1 ? 'It' : 'All of them') : o + ' of them'} will still be here when you are not.`;
  tick();
}
function tick() {
  const y = Number(slider.value);
  scene.setYear(y);
  const { intact, frag, gone } = status2(y);
  $('#year-label').textContent = y === 0 ? 'today' : `+${y}`;
  $('#year-detail').textContent = state.buried.length
    ? `${intact} intact · ${frag} broken into fragments (still there) · ${gone} actually gone` + (y >= 60 ? ' · you: gone' : '')
    : '';
}
slider.addEventListener('input', () => { const y = Number(slider.value); if (lastYear < 60 && y >= 60) Sound.gone(); lastYear = y; tick(); });
$('#reset').addEventListener('click', () => { state.buried = []; state.saved = []; slider.value = 0; refresh(); go('scan'); });

/* ---------- methodology ---------- */
$('#m-head').textContent = METHODOLOGY.headline;
for (const t of METHODOLOGY.body) { const p = document.createElement('p'); p.textContent = t; p.style.marginTop = '8px'; $('#m-body').append(p); }
$('#m-cite').href = METHODOLOGY.cite.url; $('#m-cite').textContent = METHODOLOGY.cite.name;

if (!navigator.connection?.saveData && !key()) {
  const c = navigator.connection;
  if (!c || c.effectiveType === '4g') setTimeout(() => loadClassifier().catch(() => {}), 2500);
}

/* ---------- where do you live -> landfill time-lapse ---------- */
const SIZES = [
  { label: 'Just me', pop: 1, skyN: 1, skyH: .5 }, { label: 'My school', sub: '1,000 people', pop: 1000, skyN: 4, skyH: .7 },
  { label: 'My town', sub: '50,000 people', pop: 50000, skyN: 9, skyH: 1 }, { label: 'My city', sub: '1 million people', pop: 1e6, skyN: 16, skyH: 1.5 },
];
let size = SIZES[2];
const sel = $('#place');
for (const p of [...PLACES].sort((a, b) => a.name.localeCompare(b.name))) { const o = document.createElement('option'); o.value = p.name; o.textContent = p.name; sel.append(o); }
sel.value = 'United States';
const sizes = $('#sizes');
SIZES.forEach((z) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `${z.label}${z.sub ? `<small>${z.sub}</small>` : ''}`; b.onclick = () => { size = z; [...sizes.children].forEach((x) => x.classList.toggle('on', x === b)); }; if (z === size) b.classList.add('on'); sizes.append(b); });
const fmtT = (t) => (t < 0.001 ? `${Math.max(Math.round(t * 1e6), 1)} g` : t < 1 ? `${Math.round(t * 1000).toLocaleString()} kg` : t < 10 ? `${t.toFixed(1)} tonnes` : `${Math.round(t).toLocaleString()} tonnes`);
if (!PLACES.length) $('#open-where').hidden = true;
$('#go-sim').addEventListener('click', () => { try {
  const place = PLACES.find((p) => p.name === sel.value); const tPerDay = size.pop * place.kg * place.dump / 1000;
  go('sim'); $('#sim-end').hidden = true; $('#sim-place').textContent = `${place.name} · ${size.label.toLowerCase()}`;
  $('#sim-rate').textContent = `${fmtT(tPerDay)} a day goes into the ground`;
  sim = sim || new Sim($('#simcv')); sim.onTip = Sound.tip; Sound.scene('sim');
  sim.run({ tPerDay, skyN: size.skyN, skyH: size.skyH }, (day, t) => { $('#sim-day').textContent = `Day ${Math.floor(day)}`; $('#sim-t').textContent = `${fmtT(t)} in the landfill`; }, () => {
    const yr = tPerDay * 365, m3 = yr / 0.75, bins = Math.round(m3 / 0.24), pools = m3 / 2500;
    $('#end-year').textContent = fmtT(yr);
    $('#end-eq').textContent = pools >= 0.05 ? `Roughly ${pools < 1 ? pools.toFixed(1) : Math.round(pools).toLocaleString()} Olympic swimming pools of rubbish.` : `Roughly ${Math.max(bins, 1).toLocaleString()} wheelie bins of rubbish.`;
    $('#end-ten').textContent = fmtT(yr * 10);
    $('#end-note').textContent = `${place.name}: ${place.kg} kg of waste per person per day (${place.yr}), and ${Math.round(place.dump * 100)}% of it is landfilled, dumped or never collected. ${SOURCE} Volumes are rough estimates; the pile is drawn on a log scale.`;
    $('#sim-end').hidden = false; Sound.stop(); Sound.bell();
  });
} catch (err) { console.error(err); go('where'); alert('Sorry, the simulation failed to start: ' + err.message); }
});

/* ---------- sound: unlock on first tap, tick on buttons, mute toggle ---------- */
const mute = $('#mute');
const paintMute = () => { mute.textContent = Sound.isOn() ? 'Sound on' : 'Sound off'; mute.setAttribute('aria-pressed', String(Sound.isOn())); };
paintMute();
addEventListener('pointerdown', () => Sound.init(), { capture: true });
mute.addEventListener('click', () => { Sound.init(); Sound.setOn(!Sound.isOn()); paintMute(); if (Sound.isOn()) Sound.ui(); });
document.addEventListener('click', (e) => { if (e.target.closest('button, summary, label.cta') && !e.target.closest('#mute')) Sound.ui(); });
