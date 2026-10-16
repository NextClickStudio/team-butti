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
const globals = {
  settings,
  shop: { name: 'Team Butti', description: 'Maglie da hockey, MX e football dalla Toscana a Milano.', enabled_payment_types: ['visa', 'master', 'paypal', 'apple_pay'], password_message: 'Drop 02 in arrivo. Entra nel team per il link anticipato.' },
  routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', search_url: '/search', all_products_collection_url: '/collections/all' },
  cart: { item_count: 0, items: [], total_price: 0 },
  // design_mode: empty video slots (story, Higgsfield bike) are shown, as in the Shopify theme editor
  request: { locale: { iso_code: 'it' }, page_type: 'index', origin: '', design_mode: true },
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
