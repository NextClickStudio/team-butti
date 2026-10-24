const http = require('http'), fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), A = require('path').resolve(__dirname, '../../assets');
const log = [];
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  let body = '';
  req.on('data', c => body += c).on('end', () => {
    if (req.method === 'POST') log.push({ path: u.pathname, body });
    const send = (code, type, data) => { res.writeHead(code, { 'Content-Type': type }); res.end(data); };
    const drawer = fs.readFileSync(OUT + '/cart-drawer.html', 'utf8');
    if (u.pathname === '/__log') return send(200, 'application/json', JSON.stringify(log));
    if (u.pathname === '/cart/add.js') return send(200, 'application/json', JSON.stringify({ id: 1, quantity: 1, sections: { 'cart-drawer': drawer } }));
    if (u.pathname === '/cart/change.js') return send(200, 'application/json', JSON.stringify({ item_count: 0, sections: { 'cart-drawer': drawer.replace(/data-count="1"/, 'data-count="0"') } }));
    if (u.pathname === '/cart' && u.searchParams.get('sections')) return send(200, 'application/json', JSON.stringify({ 'cart-drawer': drawer }));
    if (u.pathname.startsWith('/products/') && u.searchParams.get('section_id') === 'quick-view') return send(200, 'text/html', fs.readFileSync(OUT + '/quick-view.html'));
    if (u.pathname.startsWith('/assets/')) { const f = path.join(A, path.basename(u.pathname)); const t = f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript' : 'font/woff2'; return fs.existsSync(f) ? send(200, t, fs.readFileSync(f)) : send(404, 'text/plain', 'nf'); }
    const page = { '/': 'index.html', '/products/custom-jersey': 'product.html', '/collections/all': 'collection.html' }[u.pathname];
    if (page) return send(200, 'text/html', fs.readFileSync(path.join(OUT, page)));
    send(404, 'text/plain', 'nf');
  });
}).listen(8787, () => console.log('up'));
