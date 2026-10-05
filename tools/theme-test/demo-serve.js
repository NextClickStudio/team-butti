// Static server for demo-site emulating Vercel cleanUrls (used by demo-e2e.js).
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, 'demo-site');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json' };
http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const cands = p === '/' ? ['index.html'] : [p, p + '.html', path.join(p, 'index.html')];
  for (const c of cands) {
    const f = path.join(ROOT, c);
    if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); return res.end(fs.readFileSync(f)); }
  }
  res.writeHead(404, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(ROOT, '404.html')));
}).listen(+process.env.PORT || 8790, () => console.log('demo on', process.env.PORT || 8790));
