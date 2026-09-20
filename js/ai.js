/* Item identification. Two engines behind one function:
 *  - CLIP running in the visitor's browser (no key, no server)
 *  - optional Claude vision call, using a key the visitor pastes (kept in sessionStorage only)
 */
import { ITEMS, labelIndex } from './data.js?v=11';

const TJS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0';
const MODEL = 'onnx-community/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M-ONNX';
let classifierP = null;

export function loadClassifier(onProgress) {
  if (classifierP) return classifierP;
  classifierP = (async () => {
    const { pipeline, env } = await import(TJS);
    env.backends.onnx.wasm.numThreads = 1; // GitHub Pages can't send COOP/COEP
    const opts = { dtype: 'q8', progress_callback: (p) => { if (p.status === 'progress_total') onProgress?.(p.progress); } };
    if (navigator.gpu) {
      try { return await pipeline('zero-shot-image-classification', MODEL, { ...opts, device: 'webgpu', dtype: 'fp16' }); } catch (e) { /* fall through to wasm */ }
    }
    return pipeline('zero-shot-image-classification', MODEL, opts);
  })();
  classifierP.catch(() => { classifierP = null; });
  return classifierP;
}

/* Returns [{id, score}] best first, scores summed per item. */
export async function classifyLocal(canvas, onProgress) {
  const clf = await loadClassifier(onProgress);
  const { prompts, owners } = labelIndex();
  const out = await clf(canvas, prompts, { hypothesis_template: 'a photo of {}' });
  const byId = new Map();
  for (const r of out) {
    const id = owners[prompts.indexOf(r.label)];
    byId.set(id, (byId.get(id) || 0) + r.score);
  }
  return [...byId].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
}

export async function classifyClaude(canvas, apiKey) {
  const ids = ITEMS.filter((i) => i.id !== 'unknown').map((i) => `${i.id} (${i.name})`).join('; ');
  const b64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
          { type: 'text', text: `Identify the main piece of rubbish in this photo. Choose the single best id from this list, or "unknown": ${ids}.\nReply with only JSON like {"id":"pet-bottle"}.` },
        ],
      }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  const text = data.content?.find((b) => b.type === 'text')?.text || '';
  const id = JSON.parse(text.match(/\{[^}]*\}/)[0]).id;
  return [{ id, score: 1 }];
}
