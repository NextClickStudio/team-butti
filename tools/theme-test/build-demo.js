// Builds the demo store from the real Shopify theme files.
// 1) demo/demo-data.js at repo root: template bundle used by the CDN-hosted demo (demo-app.js)
// 2) tools/theme-test/demo-site: fully static copy of the same pages (local tests / any static host)
const fs = require('fs'), path = require('path');
const liquidjs = require('liquidjs');
const LS = require('./liquid-shopify');
const Pages = require('./demo-pages');
const CAT = require('./demo-catalog');

const T = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'demo-site');
const rd = rel => fs.readFileSync(path.join(T, rel), 'utf8');
const locale = JSON.parse(rd('locales/it.default.json'));
const settings = {};
JSON.parse(rd('config/settings_schema.json')).forEach(g => (g.settings || []).forEach(s => { if ('default' in s) settings[s.id] = s.default; }));
settings.social_instagram = 'https://www.instagram.com/team_butti/';
// Legal texts (legal/*.md) as the store's policies and the cookie policy page; [PLACEHOLDERS] stay visible, highlighted
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\[([A-ZÀ-Ú0-9 .\/]+)\]/g, '<mark>[$1]</mark>');
function md(src) {
  const out = []; let list = null, table = null, quote = [];
  const flush = () => {
    if (list) { out.push('<' + list.t + '>' + list.items.map(i => '<li>' + i + '</li>').join('') + '</' + list.t + '>'); list = null; }
    if (table) { out.push('<table>' + table.map((r, i) => '<tr>' + r.map(c => (i ? '<td>' : '<th>') + inline(c) + (i ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</table>'); table = null; }
    if (quote.length) { out.push('<blockquote>' + quote.map(q => q ? '<p>' + inline(q) + '</p>' : '').join('') + '</blockquote>'); quote = []; }
  };
  for (const raw of src.split('\n')) {
    const l = raw.trimEnd(); let m;
    if ((m = l.match(/^\|(.+)\|$/))) { if (list || quote.length) flush(); const cells = m[1].split('|').map(c => c.trim()); if (cells.every(c => /^-+$/.test(c))) continue; (table = table || []).push(cells); continue; }
    if ((m = l.match(/^>\s?(.*)$/))) { if (list || table) flush(); quote.push(m[1]); continue; }
    if ((m = l.match(/^\s*(?:[-*]|(\d+)\.)\s+(.*)$/)) && !/^---$/.test(l.trim())) { const t = m[1] ? 'ol' : 'ul'; if (table || quote.length || (list && list.t !== t && !/^\s/.test(l))) flush(); list = list || { t, items: [] }; if (/^\s/.test(l) && list.items.length) list.items[list.items.length - 1] += '<br>' + inline(m[2]); else list.items.push(inline(m[2])); continue; }
    flush();
    if (!l.trim()) continue;
    if (/^---$/.test(l.trim())) { out.push('<hr>'); continue; }
    if ((m = l.match(/^(#{1,3})\s+(.*)$/))) { if (m[1].length > 1) out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'); continue; }
    out.push('<p>' + inline(l) + '</p>');
  }
  flush();
  return out.join('\n');
}
const legal = (file, title, handle, url) => ({ title, handle, url, body: md(rd('legal/' + file)) });
const policies = [
  legal('02-condizioni-di-vendita.md', 'Condizioni di vendita', 'terms-of-service', '/policies/terms-of-service'),
  legal('03-recesso-e-resi.md', 'Recesso e resi', 'refund-policy', '/policies/refund-policy'),
  legal('04-spedizioni.md', 'Spedizioni', 'shipping-policy', '/policies/shipping-policy'),
  legal('05-privacy.md', 'Privacy', 'privacy-policy', '/policies/privacy-policy'),
  legal('01-informazioni-legali.md', 'Informazioni legali', 'contact-information', '/policies/contact-information')
];
const byHandle = h => policies.filter(p => p.handle === h)[0];
const cookiePage = Object.assign(legal('06-cookie.md', 'Cookie policy', 'cookie-policy', '/pages/cookie-policy'), { content: md(rd('legal/06-cookie.md')) });

const globals = {
  settings,
  shop: { name: 'Team Butti', description: 'Maglie da hockey, MX e football dalla Toscana a Milano.', enabled_payment_types: ['visa', 'master', 'paypal', 'apple_pay'], password_message: 'Drop 02 in arrivo. Entra nel team per il link anticipato.',
    policies, terms_of_service: byHandle('terms-of-service'), refund_policy: byHandle('refund-policy'), shipping_policy: byHandle('shipping-policy'), privacy_policy: byHandle('privacy-policy') },
  pages: { 'cookie-policy': cookiePage },
  routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', search_url: '/search', all_products_collection_url: '/collections/all' },
  cart: { item_count: 0, items: [], total_price: 0, taxes_included: true },
  // design_mode off: the demo looks like the live store (no empty slots / Higgsfield placeholders)
  request: { locale: { iso_code: 'it' }, page_type: 'index', origin: '', design_mode: false },
  content_for_header: '', canonical_url: '/', page_description: 'Team Butti — maglie da hockey, MX e football.', current_page: 1
};

// Template bundle: every theme file the demo can render
const templates = {};
for (const dir of ['layout', 'sections', 'snippets', 'templates']) {
  for (const f of fs.readdirSync(path.join(T, dir))) templates[`${dir}/${f}`] = rd(`${dir}/${f}`);
}
fs.mkdirSync(path.join(T, 'demo'), { recursive: true });
// real Team Butti photos / videos (demo/media): the home template points to them by file name, like a store with them uploaded in Files
const media = JSON.parse(rd('demo/media/manifest.json'));
const dataJs = 'window.TB_DEMO = ' + JSON.stringify({ templates, locale, globals, media }) + ';\n';
fs.writeFileSync(path.join(T, 'demo', 'demo-data.js'), dataJs);

const env = LS.create(liquidjs, { read: rel => (fs.existsSync(path.join(T, rel)) ? rd(rel) : null), exists: rel => fs.existsSync(path.join(T, rel)), locale, menus: CAT.menus, globals, media: { base: '/media/', list: media } });
const pages = Pages.create({ env, read: rd, catalog: CAT, src: f => '/assets/' + f });

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  for (const p of pages.paths) {
    const file = p === '/' ? 'index.html' : p.slice(1) + '.html';
    fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
    fs.writeFileSync(path.join(OUT, file), await pages.render(p));
  }
  fs.writeFileSync(path.join(OUT, '404.html'), await pages.render('/404'));
  for (const f of fs.readdirSync(path.join(T, 'assets'))) fs.copyFileSync(path.join(T, 'assets', f), path.join(OUT, 'assets', f));
  fs.mkdirSync(path.join(OUT, 'media'));
  for (const f of fs.readdirSync(path.join(T, 'demo', 'media'))) fs.copyFileSync(path.join(T, 'demo', 'media', f), path.join(OUT, 'media', f));
  fs.copyFileSync(require.resolve('liquidjs/dist/liquid.browser.min.js'), path.join(OUT, 'assets', 'liquid.browser.min.js'));
  for (const f of ['liquid-shopify.js', 'demo-catalog.js', 'shopify-mock.js']) fs.copyFileSync(path.join(__dirname, f), path.join(OUT, 'assets', f));
  fs.writeFileSync(path.join(OUT, 'assets', 'demo-data.js'), dataJs);
  fs.writeFileSync(path.join(OUT, 'vercel.json'), JSON.stringify({ cleanUrls: true, trailingSlash: false }, null, 2));
  console.log('demo built:', pages.paths.length + 1, 'pages →', OUT, '+ demo/demo-data.js');
})().catch(e => { console.error('BUILD ERROR', e); process.exit(1); });
