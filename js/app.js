import { ITEMS, MODES, MODE_COPY, METHODOLOGY, itemById, getJourney, rangeText, yearsText } from './data.js';
import { Scene } from './scene.js';
import { classifyLocal, classifyClaude, loadClassifier } from './ai.js';

const $ = (s) => document.querySelector(s);
const GOOD_ROUTE = new Set(['pet-bottle', 'aluminium-can', 'tin-can', 'glass-bottle', 'takeaway-box', 'cardboard', 'paper',
  'pizza-box', 'banana-peel', 'apple-core', 'battery', 'electronics', 'bottle-cap']);
const OUTLIVE_YEAR = 80;

const state = { buried: [], saved: [], current: null };
const scene = new Scene($('#ground'));

/* ---------- picker ---------- */
const picker = $('#picker');
for (const item of ITEMS.filter((i) => i.id !== 'unknown')) {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = item.name;
  b.addEventListener('click', () => show(item, null));
  picker.append(b);
}

/* ---------- scanning ---------- */
const status = $('#scan-status');
const bar = $('#bar');
const key = () => { try { return sessionStorage.getItem('afterlife-key') || ''; } catch { return ''; } };
$('#key').value = key();
$('#key').addEventListener('change', (e) => { try { sessionStorage.setItem('afterlife-key', e.target.value.trim()); } catch {} });

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
  $('#preview').replaceChildren(canvas); canvas.className = 'thumb';
  try {
    let ranked;
    if (key()) { status.textContent = 'Asking Claude…'; ranked = await classifyClaude(canvas, key()); }
    else {
      status.textContent = 'Loading the on-device model (first time only, ~85 MB)…'; bar.hidden = false;
      ranked = await classifyLocal(canvas, (p) => { bar.value = p; });
      bar.hidden = true;
    }
    const top = ranked[0];
    const item = top.score > 0.3 || top.score === 1 ? itemById(top.id) : itemById('unknown');
    status.textContent = item.id === 'unknown' ? 'Not sure what that is — pick the closest match below.' : `Looks like: ${item.name}. Wrong? Pick the right one below.`;
    show(item, ranked.slice(0, 3));
  } catch (err) {
    console.error(err); bar.hidden = true;
    status.textContent = 'The scanner failed to run here. Pick the item manually below — everything else works.';
  }
}
$('#file').addEventListener('change', (e) => scan(e.target.files[0]));
const drop = $('#drop');
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => scan(e.dataTransfer.files[0]));

/* ---------- result ---------- */
function show(item) {
  state.current = item;
  $('#result').hidden = false;
  $('#r-name').textContent = item.name;
  $('#r-material').textContent = item.material;
  const mode = MODE_COPY[item.mode];
  $('#r-mode').textContent = mode.label;
  $('#r-mode').dataset.mode = item.mode;
  $('#r-mode-blurb').textContent = mode.blurb;
  $('#r-range').textContent = rangeText(item);
  $('#r-claimed').textContent = item.claimed ? `Posters say ${item.claimed === 1000000 ? '1,000,000' : item.claimed} years. Nobody measured that.` : '';
  $('#r-note').textContent = item.note || '';
  $('#r-harm').textContent = item.harm;
  $('#r-better').textContent = item.better;
  $('#r-recycle').textContent = item.recycle;
  const src = $('#r-source');
  src.textContent = item.source?.name && item.source.name !== '—' ? `Source: ${item.source.name}` : '';
  if (item.source?.url) { src.href = item.source.url; } else { src.removeAttribute('href'); }
  const list = $('#journey'); list.replaceChildren();
  getJourney(item).forEach((s, i) => {
    const li = document.createElement('li');
    if (s.branch) li.className = 'branch';
    li.style.animationDelay = `${i * 90}ms`;
    li.innerHTML = `<span class="t"></span><b></b><p></p>`;
    li.querySelector('.t').textContent = s.t; li.querySelector('b').textContent = s.title; li.querySelector('p').textContent = s.text;
    list.append(li);
  });
  $('#outcome').textContent = '';
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- disposal choices ---------- */
function dispose(route) {
  const item = state.current; if (!item) return;
  const out = $('#outcome');
  const good = GOOD_ROUTE.has(item.id);
  if (route === 'better' && good) {
    state.saved.push(item);
    out.className = 'good';
    out.textContent = `Diverted. ${item.name} stays out of the ground. ${item.better}`;
  } else {
    state.buried.push({ item });
    out.className = 'bad';
    out.textContent = route === 'better'
      ? `There is no good route for this one, so it is buried anyway. The only fix is upstream: ${item.better}`
      : route === 'litter'
        ? `Dropped. Nobody collects it, so it moves with the wind and water. It is now part of your pile below.`
        : `Bagged, binned, buried. ${item.recycle.startsWith('Yes') || item.recycle.startsWith('One of') ? 'It could have been recycled.' : ''} It is now part of your pile below.`;
  }
  refresh();
  $('#legacy').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#d-bin').addEventListener('click', () => dispose('bin'));
$('#d-litter').addEventListener('click', () => dispose('litter'));
$('#d-better').addEventListener('click', () => dispose('better'));

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
function outlast() { return state.buried.filter(({ item }) => (item.mode === MODES.BIODEGRADES ? item.persist.high : item.persist.low) > OUTLIVE_YEAR).length; }
function refresh() {
  scene.setItems(state.buried.map((b) => ({ item: b.item })));
  const n = state.buried.length, s = state.saved.length, o = outlast();
  $('#stat-buried').textContent = n; $('#stat-saved').textContent = s; $('#stat-outlast').textContent = o;
  $('#verdict').textContent = n === 0
    ? (s ? 'Nothing buried. Keep going.' : 'Scan something to start your pile.')
    : o === 0 ? `${n} buried, and all of it will be gone within your lifetime. That is the good outcome.`
    : `${n} items buried. ${o} of them will still be here when you are not.`;
  tick();
}
function tick() {
  const y = Number(slider.value);
  scene.setYear(y);
  const { intact, frag, gone } = status2(y);
  $('#year-label').textContent = y === 0 ? 'today' : `year +${y}`;
  $('#year-detail').textContent = state.buried.length
    ? `${intact} intact · ${frag} broken into fragments (still there) · ${gone} actually gone` + (y >= 60 ? ' · you: gone' : '')
    : '';
}
slider.addEventListener('input', tick);
$('#reset').addEventListener('click', () => { state.buried = []; state.saved = []; slider.value = 0; refresh(); });

/* ---------- methodology ---------- */
$('#m-head').textContent = METHODOLOGY.headline;
for (const t of METHODOLOGY.body) { const p = document.createElement('p'); p.textContent = t; $('#m-body').append(p); }
$('#m-cite').href = METHODOLOGY.cite.url; $('#m-cite').textContent = METHODOLOGY.cite.name;

refresh();
if (matchMedia('(prefers-reduced-data: no-preference)').matches && !navigator.connection?.saveData && !key()) {
  /* warm the model in the background on fast-ish connections so the first scan feels instant */
  const c = navigator.connection; if (!c || ['4g', undefined].includes(c.effectiveType)) setTimeout(() => loadClassifier().catch(() => {}), 2500);
}
