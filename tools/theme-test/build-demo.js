// Builds a static, browsable demo store from the real Shopify theme files.
// Output: tools/theme-test/demo-site (deployable on any static host; vercel.json enables clean URLs).
const fs = require('fs'), path = require('path');
const liquidjs = require('liquidjs');
const LS = require('./liquid-shopify');
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
  shop: { name: 'Team Butti', description: 'Maglie da hockey, MX e football dalla Toscana a SoCal.', enabled_payment_types: ['visa', 'master', 'paypal', 'apple_pay'], password_message: 'Drop 02 in arrivo. Entra nel team per il link anticipato.' },
  routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', search_url: '/search', all_products_collection_url: '/collections/all' },
  cart: { item_count: 0, items: [], total_price: 0 },
  request: { locale: { iso_code: 'it' }, page_type: 'index', origin: '' },
  content_for_header: '', canonical_url: '/', page_description: 'Team Butti — maglie da hockey, MX e football.', current_page: 1
};
const env = LS.create(liquidjs, { read: rel => (fs.existsSync(path.join(T, rel)) ? rd(rel) : null), exists: rel => fs.existsSync(path.join(T, rel)), locale, menus: CAT.menus, globals });

const products = CAT.products.map(env.product);
const byHandle = h => products.find(p => p.handle === h);
const jerseys = products.slice(0, 8);
const coll = (handle, title, list) => ({
  handle, title, url: '/collections/' + handle, products: list, products_count: list.length,
  all_types: [...new Set(list.map(p => p.type))], description: '', featured_image: null
});
const collections = { all: coll('all', 'Shop', products.filter(p => p.handle !== 'targa-socal')), 'drop-01': coll('drop-01', 'Drop 01', jerseys) };

const BAR = '<div class="demo-bar">Anteprima demo del tema Shopify Team Butti · prodotti e prezzi di esempio · checkout disattivato</div>';
const DEMO_CSS = '<style>.demo-bar{background:#0d0d0d;color:#ffd400;text-align:center;padding:6px 16px;font:700 10px/1.4 "Space Mono",monospace;letter-spacing:.14em;text-transform:uppercase}' +
  '.demo-checkout{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.6);display:none;place-items:center;padding:16px}.demo-checkout.on{display:grid}' +
  '.demo-checkout__box{background:var(--paper);border:3px solid var(--ink);box-shadow:10px 10px 0 var(--pink);padding:28px;max-width:460px;display:grid;gap:14px}.demo-checkout__box h2{font-size:44px;margin:0}.demo-checkout__box p{margin:0;font-size:13px}</style>';
const DEMO_SCRIPTS = ['liquid.browser.min.js', 'liquid-shopify.js', 'demo-catalog.js', 'demo-data.js', 'shopify-mock.js']
  .map(f => `<script src="/assets/${f}" defer></script>`).join('\n    ');

async function page(file, body, extra, layout = 'theme') {
  let html = await env.renderLayout(layout, body, extra);
  html = html.replace('<script src="/assets/tb-jersey.js" defer></script>', DEMO_SCRIPTS + '\n    <script src="/assets/tb-jersey.js" defer></script>')
    .replace('</head>', '  <meta name="robots" content="noindex,nofollow">\n    ' + DEMO_CSS + '\n  </head>')
    .replace(/(<body[^>]*>)/, '$1\n    ' + BAR);
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
const sec = (type, id, conf, extra) => env.renderSection(type, id, conf || {}, extra);
const tpl = name => JSON.parse(rd(`templates/${name}.json`));

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

  // Home
  const home = tpl('index');
  home.sections.drop.settings = Object.assign({}, home.sections.drop.settings, { collection__obj: collections['drop-01'] });
  home.sections.custom.settings = { product__obj: byHandle('maglia-custom') };
  home.sections.plate.settings = { product__obj: byHandle('targa-socal') };
  let body = '';
  for (const id of home.order) body += await sec(home.sections[id].type, id, home.sections[id]);
  await page('index.html', body, { template: { name: 'index' }, page_title: 'Team Butti' });

  // Collections
  for (const c of Object.values(collections)) {
    await page(`collections/${c.handle}.html`, await sec('main-collection', 'main', tpl('collection').sections.main, { collection: c }),
      { template: { name: 'collection' }, page_title: c.title, request: { locale: { iso_code: 'it' }, page_type: 'collection' } });
  }
  // Products + quick views
  const ptpl = tpl('product');
  ptpl.sections.more.settings = Object.assign({}, ptpl.sections.more.settings, { collection__obj: collections['drop-01'] });
  for (const p of products) {
    let b = '';
    for (const id of ptpl.order) b += await sec(ptpl.sections[id].type, id, ptpl.sections[id], { product: p });
    await page(`products/${p.handle}.html`, b, { template: { name: 'product' }, page_title: p.title, product: p, request: { locale: { iso_code: 'it' }, page_type: 'product' } });
    fs.mkdirSync(path.join(OUT, 'qv'), { recursive: true });
    fs.writeFileSync(path.join(OUT, 'qv', p.handle + '.html'), await sec('quick-view', 'quick-view', {}, { product: p }));
  }
  // Cart, search, pages, 404, password
  await page('cart.html', '<div data-demo-cart-page>' + await sec('main-cart', 'main') + '</div>', { template: { name: 'cart' }, page_title: 'Bag' });
  await page('search.html', '<div data-demo-search>' + await sec('main-search', 'main', {}, { search: { performed: false, terms: '' } }) + '</div>', { template: { name: 'search' }, page_title: 'Cerca' });
  await page('collections.html', await sec('main-list-collections', 'main', {}, { collections: Object.values(collections) }), { template: { name: 'list-collections' }, page_title: 'Collezioni' });
  await page('pages/spedizioni.html', await sec('main-page', 'main', {}, { page: { title: 'Spedizioni e resi', content: '<p>Italia 2–4 giorni lavorativi, gratis sopra 100€. Europa 4–7 giorni.</p><p>Resi gratuiti entro 14 giorni dalla consegna. Le maglie personalizzate non sono rimborsabili.</p><table><tr><th>Taglia</th><th>Lunghezza</th><th>Larghezza</th></tr><tr><td>S</td><td>66</td><td>56</td></tr><tr><td>M</td><td>70</td><td>60</td></tr><tr><td>L</td><td>74</td><td>64</td></tr><tr><td>XL</td><td>78</td><td>68</td></tr><tr><td>XXL</td><td>82</td><td>72</td></tr></table>' } }), { template: { name: 'page' }, page_title: 'Spedizioni e resi' });
  await page('404.html', await sec('main-404', 'main'), { template: { name: '404' }, page_title: '404' });
  await page('password.html', await sec('main-password', 'main'), { template: { name: 'password' }, page_title: 'Team Butti' }, 'password');

  // Assets: theme assets + browser runtime for the demo backend
  for (const f of fs.readdirSync(path.join(T, 'assets'))) fs.copyFileSync(path.join(T, 'assets', f), path.join(OUT, 'assets', f));
  fs.copyFileSync(require.resolve('liquidjs/dist/liquid.browser.min.js'), path.join(OUT, 'assets', 'liquid.browser.min.js'));
  for (const f of ['liquid-shopify.js', 'demo-catalog.js', 'shopify-mock.js']) fs.copyFileSync(path.join(__dirname, f), path.join(OUT, 'assets', f));
  const templates = {};
  const add = rel => { templates[rel] = rd(rel); };
  ['sections/cart-drawer.liquid', 'sections/main-cart.liquid', 'sections/main-search.liquid'].forEach(add);
  fs.readdirSync(path.join(T, 'snippets')).forEach(f => add('snippets/' + f));
  fs.writeFileSync(path.join(OUT, 'assets', 'demo-data.js'),
    'window.TB_DEMO = ' + JSON.stringify({ templates, locale, globals }) + ';\n');
  fs.writeFileSync(path.join(OUT, 'vercel.json'), JSON.stringify({ cleanUrls: true, trailingSlash: false, headers: [{ source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] }] }, null, 2));
  const count = (function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? walk(path.join(d, e.name)) : 1), 0); })(OUT);
  console.log('demo built:', count, 'files →', OUT);
})().catch(e => { console.error('BUILD ERROR', e); process.exit(1); });
