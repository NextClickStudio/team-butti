// Static server for demo-site emulating Vercel cleanUrls (used by demo-e2e.js).
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, 'demo-site');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' };
http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const cands = p === '/' ? ['index.html'] : [p, p + '.html', path.join(p, 'index.html')];
  for (const c of cands) {
    const f = path.join(ROOT, c);
    if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) {
      const type = TYPES[path.extname(f)] || 'application/octet-stream', buf = fs.readFileSync(f), m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
      if (m) { // videos: byte ranges, like a CDN
        const a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : buf.length - 1;
        res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${a}-${b}/${buf.length}`, 'Content-Length': b - a + 1 });
        return res.end(buf.subarray(a, b + 1));
      }
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes' }); return res.end(buf);
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(ROOT, '404.html')));
}).listen(+process.env.PORT || 8790, () => console.log('demo on', process.env.PORT || 8790));
