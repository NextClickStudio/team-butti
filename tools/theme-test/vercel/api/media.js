// Demo media proxy (Vercel Edge Function).
// Videos are read in byte ranges (Safari asks for bytes 0-1 first): a plain rewrite lets the CDN cache the first
// range and serve it for every later one, so videos never start. Here every range goes to the origin and the
// response is never cached at the edge. Origin: GitHub raw (fast, byte ranges), jsDelivr as fallback.
export const config = { runtime: 'edge' };
const REPO = 'NextClickStudio/team-butti';
const TYPES = { mp4: 'video/mp4', jpg: 'image/jpeg', png: 'image/png', json: 'application/json' };
const KEEP = ['content-length', 'content-range', 'etag'];

export default async function handler(req) {
  const q = new URL(req.url).searchParams, sha = q.get('sha') || '', file = q.get('file') || '';
  const m = /^[a-z0-9-]+\.(mp4|jpg|png|json)$/.exec(file);
  if (!/^[0-9a-f]{40}$/.test(sha) || !m) return new Response('Not found', { status: 404 });
  const range = req.headers.get('range'), headers = range ? { range } : {}, path = '/demo/media/' + file;
  let r = await fetch('https://raw.githubusercontent.com/' + REPO + '/' + sha + path, { headers });
  if (!r.ok) r = await fetch('https://cdn.jsdelivr.net/gh/' + REPO + '@' + sha + path, { headers });
  const h = new Headers({ 'content-type': TYPES[m[1]], 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=31536000, immutable', 'vercel-cdn-cache-control': 'no-store', 'x-robots-tag': 'noindex' });
  KEEP.forEach(k => { const v = r.headers.get(k); if (v) h.set(k, v); });
  return new Response(r.body, { status: r.status, headers: h });
}
