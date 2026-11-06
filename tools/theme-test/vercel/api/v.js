// Demo file proxy (Vercel Edge Function) for everything under /v/<commit>/.
// Serves only the commit this demo was deployed with (written in by vercel/pack.js), only the file types the demo
// uses, with a forced content type: no other commit, branch or fork, and nothing the browser could run as a page.
// Code, styles, fonts and images are cached at the edge (the commit never changes). Videos are read in byte ranges
// and are never cached at the edge: a cached first range would be served for every later one and playback stops.
export const config = { runtime: 'edge' };
const SHA = '__DEMO_SHA__';
const REPO = 'NextClickStudio/team-butti';
const TYPES = { js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json; charset=utf-8', woff2: 'font/woff2', mp4: 'video/mp4', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const BINARY = { woff2: 1, mp4: 1, jpg: 1, png: 1, webp: 1 };
const notFound = () => new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' } });

export default async function handler(req) {
  const q = new URL(req.url).searchParams, sha = q.get('sha') || '', path = q.get('path') || '';
  const m = /^(?:[a-z0-9_-]+\/){0,4}[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(js|css|json|woff2|mp4|jpg|png|webp)$/.exec(path);
  if (sha !== SHA || !m || path.indexOf('..') > -1) return notFound();
  const ext = m[1], range = req.headers.get('range'), headers = range ? { range } : {};
  // photos and videos from GitHub raw (fast byte ranges), code from jsDelivr; each falls back to the other
  const raw = 'https://raw.githubusercontent.com/' + REPO + '/' + SHA + '/' + path;
  const cdn = 'https://cdn.jsdelivr.net/gh/' + REPO + '@' + SHA + '/' + path;
  const media = ext === 'mp4' || ext === 'jpg' || ext === 'png' || ext === 'webp';
  let r = await fetch(media ? raw : cdn, { headers });
  if (r.status !== 200 && r.status !== 206) r = await fetch(media ? cdn : raw, { headers });
  if (r.status !== 200 && r.status !== 206) return notFound();
  const forever = 'public, max-age=31536000, immutable';
  const h = new Headers({ 'content-type': TYPES[ext], 'cache-control': forever, 'vercel-cdn-cache-control': ext === 'mp4' ? 'no-store' : forever, 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' });
  if (ext !== 'js' && ext !== 'css') h.set('content-security-policy', "default-src 'none'; sandbox");
  if (BINARY[ext]) {
    // lengths and ranges only for files that travel uncompressed (a text body may arrive already decompressed)
    h.set('accept-ranges', 'bytes');
    ['content-length', 'content-range'].forEach(k => { const v = r.headers.get(k); if (v) h.set(k, v); });
  }
  const etag = r.headers.get('etag'); if (etag) h.set('etag', etag);
  return new Response(r.body, { status: r.status, headers: h });
}
