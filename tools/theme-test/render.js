// Local smoke-render of the Shopify theme with liquidjs + Shopify-like filters/tags (test harness only).
const fs = require('fs'), path = require('path');
const { Liquid, Drop } = require('liquidjs');
const T = require('path').resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out');
const locale = JSON.parse(fs.readFileSync(T + '/locales/it.default.json', 'utf8'));
const read = p => fs.readFileSync(path.join(T, p), 'utf8').replace(/posted_successfully\?/g, 'posted_successfully');
const schemaOf = src => { const m = src.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/); return m ? JSON.parse(m[1]) : {}; };

class Val extends Drop { constructor(v, o = {}) { super(); this.v = v; Object.assign(this, o); } valueOf() { return this.v; } toString() { return this.v; } }
const money = c => (Number(c || 0) / 100).toFixed(2).replace('.', ',') + ' €';

const engine = new Liquid({ root: [T + '/snippets'], partials: T + '/snippets', extname: '.liquid', strictFilters: true, dynamicPartials: true, fs: {
  readFileSync: f => read(path.relative(T, f)), existsSync: f => fs.existsSync(f), resolve: (root, file, ext) => path.resolve(root, file + (file.endsWith(ext) ? '' : ext)),
  readFile: async f => read(path.relative(T, f)), exists: async f => fs.existsSync(f), contains: () => true, sep: '/', dirname: path.dirname
} });
const tr = (key, args = {}) => {
  let v = key.split('.').reduce((o, k) => o && o[k], locale);
  if (v && typeof v === 'object') v = args.count === 1 ? v.one : v.other;
  if (v == null) throw new Error('Missing translation ' + key);
  return String(v).replace(/{{\s*(\w+)\s*}}/g, (_, k) => args[k]);
};
const kw = args => { const o = {}; for (let i = 0; i < args.length; i++) if (Array.isArray(args[i])) o[args[i][0]] = args[i][1]; return o; };
const F = {
  t: (k, ...a) => tr(k, kw(a)),
  asset_url: n => '/assets/' + n,
  stylesheet_tag: u => `<link rel="stylesheet" href="${u}">`,
  preload_tag: (u, ...a) => `<link rel="preload" href="${u}" as="font" crossorigin>`,
  image_url: (img) => img && img.src ? img.src : '',
  image_tag: (u, ...a) => { const o = kw(a); return `<img src="${u}" alt="${o.alt || ''}" class="${o.class || ''}" loading="${o.loading || 'lazy'}">`; },
  placeholder_svg_tag: (n, c) => `<svg class="${c || ''}" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>`,
  money, money_with_currency: c => money(c) + ' EUR', money_without_trailing_zeros: c => money(c).replace(',00', ''),
  handleize: s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  default_errors: e => e ? '<ul><li>err</li></ul>' : '',
  payment_type_svg_tag: () => '<svg class="payment-icon"></svg>',
  default_pagination: () => '<span class="current">1</span>',
  json: v => JSON.stringify(v && v.valueOf ? (typeof v.valueOf() === 'object' ? v : v.valueOf()) : v),
};
for (const [k, fn] of Object.entries(F)) engine.registerFilter(k, fn);

// {% schema %}, {% form %}, {% paginate %}, {% section %}, {% sections %}
engine.registerTag('schema', { parse(tok, rem) { this.tpls = []; const s = this.liquid.parser.parseStream(rem); s.on('tag:endschema', () => s.stop()).on('template', () => {}).on('end', () => { throw new Error('schema not closed'); }); s.start(); }, * render() { return ''; } });
engine.registerTag('form', {
  parse(tok, rem) { this.args = tok.args; this.tpls = []; const s = this.liquid.parser.parseStream(rem); s.on('tag:endform', () => s.stop()).on('template', t => this.tpls.push(t)).on('end', () => { throw new Error('form not closed'); }); s.start(); },
  * render(ctx, emitter) {
    const type = this.args.match(/'([^']+)'/)[1];
    const attrs = [...this.args.matchAll(/([\w-]+):\s*('([^']*)'|([\w.]+))/g)].map(m => [m[1], m[3] !== undefined ? m[3] : ctx.getSync(m[4].split('.'))]);
    const action = { product: '/cart/add', customer: '/contact#newsletter', storefront_password: '/password' }[type];
    emitter.write(`<form method="post" action="${action}" ${attrs.map(([k, v]) => `${k}="${v}"`).join(' ')}>`);
    ctx.push({ form: { posted_successfully: false, errors: null } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop(); emitter.write('</form>');
  }
});
engine.registerTag('paginate', {
  parse(tok, rem) { this.tpls = []; const s = this.liquid.parser.parseStream(rem); s.on('tag:endpaginate', () => s.stop()).on('template', t => this.tpls.push(t)).on('end', () => { throw new Error('paginate not closed'); }); s.start(); },
  * render(ctx, emitter) { ctx.push({ paginate: { pages: 1 } }); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); ctx.pop(); }
});
function sectionObj(type, id, conf = {}) {
  const src = read(`sections/${type}.liquid`), sch = schemaOf(src);
  const defs = {}; (sch.settings || []).forEach(s => { if ('default' in s) defs[s.id] = s.default; });
  const settings = { ...defs, ...(conf.settings || {}) };
  (sch.settings || []).forEach(s => { if (s.type === 'link_list' && settings[s.id]) settings[s.id] = MENUS[settings[s.id]] || null; if (s.type === 'collection' || s.type === 'product') settings[s.id] = conf.settings && conf.settings[s.id + '__obj'] || null; });
  const order = conf.block_order || Object.keys(conf.blocks || {});
  const blocks = order.map(bid => { const b = conf.blocks[bid]; const bs = (sch.blocks || []).find(x => x.type === b.type); const bd = {}; (bs.settings || []).forEach(s => { if ('default' in s) bd[s.id] = s.default; }); return { id: bid, type: b.type, settings: { ...bd, ...(b.settings || {}) }, shopify_attributes: '' }; });
  return { src, section: { id: id, settings, blocks } };
}
async function renderSection(type, id, conf, extra = {}) {
  const { src, section } = sectionObj(type, id, conf);
  const html = await engine.parseAndRender(src, { ...GLOBALS, ...extra, section });
  return `<div id="shopify-section-${id}" class="shopify-section">${html}</div>`;
}
engine.registerTag('section', { parse(tok) { this.name = tok.args.replace(/'/g, '').trim(); }, * render() { return yield renderSection(this.name, this.name, {}); } });
engine.registerTag('sections', {
  parse(tok) { this.name = tok.args.replace(/'/g, '').trim(); },
  * render() { const g = JSON.parse(read(`sections/${this.name}.json`)); let out = ''; for (const id of g.order) out += yield renderSection(g.sections[id].type, id, g.sections[id]); return out; }
});

const MENUS = { 'main-menu': { title: 'Shop', links: [{ title: 'Shop', url: '/collections/all' }, { title: 'Custom', url: '#custom' }, { title: 'Drop', url: '#drop' }] }, footer: { title: 'Info', links: [{ title: 'Spedizioni', url: '/pages/spedizioni' }] } };
const sizes = ['S', 'M', 'L', 'XL', 'XXL'], models = ['Hockey', 'Motocross', 'Football'];
let vid = 100;
const variants = models.flatMap(m => sizes.map(s => ({ id: vid++, options: [m, s], available: !(m === 'Football' && s === 'XXL'), price: 9900, title: `${m} / ${s}` })));
const PRODUCT = {
  id: 1, title: 'Custom Jersey', handle: 'custom-jersey', url: '/products/custom-jersey', price: 9900, price_varies: false, compare_at_price: null, available: true, type: 'Hockey', vendor: 'Team Butti',
  images: [], featured_image: null, has_only_default_variant: false, tags: ['badge:Nuovo'], description: '<p>Mesh pesante.</p>',
  options_with_values: [{ name: 'Modello', values: models.map((m, i) => new Val(m, { available: true, selected: i === 0 })) }, { name: 'Taglia', values: sizes.map((s, i) => new Val(s, { available: true, selected: i === 0 })) }],
  variants, selected_or_first_available_variant: variants[0],
  metafields: { custom: { jersey_type: { value: 'hockey' }, jersey_colors: { value: '#ff2e93,#0d0d0d,#f4f1ea,#0d0d0d' }, jersey_number: { value: '10' } } }
};
const PLATE = { ...PRODUCT, id: 2, title: 'Targa SoCal', price: 3900, selected_or_first_available_variant: { id: 999, available: true, price: 3900 } };
const schema = JSON.parse(read('config/settings_schema.json'));
const settings = {}; schema.forEach(g => (g.settings || []).forEach(s => { if ('default' in s) settings[s.id] = s.default; }));
const GLOBALS = {
  settings, shop: { name: 'Team Butti', description: '', enabled_payment_types: ['visa', 'master'], password_message: '' },
  routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', search_url: '/search', all_products_collection_url: '/collections/all' },
  cart: { item_count: 0, items: [], total_price: 0 }, request: { locale: { iso_code: 'it' }, page_type: 'index', origin: 'http://localhost' },
  template: { name: process.env.TPL || 'index' }, content_for_header: '', canonical_url: 'http://localhost/', page_title: 'Team Butti', page_description: '', current_page: 1, 'now': 'now'
};

(async () => {
  // index template
  const tpl = JSON.parse(read('templates/index.json'));
  tpl.sections.custom.settings = { product__obj: PRODUCT };
  tpl.sections.plate.settings = { product__obj: PLATE };
  let body = '';
  for (const id of tpl.order) body += await renderSection(tpl.sections[id].type, id, tpl.sections[id]);
  const layout = await engine.parseAndRender(read('layout/theme.liquid').replace('{{ content_for_layout }}', '%%CONTENT%%'), GLOBALS);
  fs.writeFileSync(OUT + '/index.html', layout.replace('%%CONTENT%%', body));
  // cart drawer with one customised item (for the mocked /cart/add.js response)
  const item = { url: '/products/custom-jersey', image: null, quantity: 1, final_line_price: 9900, product: PRODUCT, variant: { title: 'Hockey / L' }, properties: { Nome: 'ROSSI', Numero: '91', Colori: 'Rosa' } };
  const cartFull = { item_count: 1, items: [item], total_price: 9900 };
  const drawer = await renderSection('cart-drawer', 'cart-drawer', {}, { cart: cartFull });
  fs.writeFileSync(OUT + '/cart-drawer.html', drawer);
  const qv = await renderSection('quick-view', 'quick-view', {}, { product: PRODUCT });
  fs.writeFileSync(OUT + '/quick-view.html', qv);
  // a product page + a collection with real product cards
  const prodTpl = JSON.parse(read('templates/product.json'));
  let pbody = await renderSection('main-product', 'main', prodTpl.sections.main, { product: PRODUCT });
  fs.writeFileSync(OUT + '/product.html', layout.replace('%%CONTENT%%', pbody));
  const coll = { title: 'Drop 01', products_count: 2, products: [PRODUCT, { ...PRODUCT, id: 3, title: 'MX Jersey', type: 'Motocross', available: false, tags: [], metafields: { custom: { jersey_type: { value: 'mx' }, jersey_colors: { value: '#f4f1ea,#e3191b,#1d3fbf,#e3191b' }, jersey_number: { value: '03' } } } }], all_types: ['Hockey', 'Motocross'], description: '' };
  let cbody = await renderSection('main-collection', 'main', {}, { collection: coll });
  fs.writeFileSync(OUT + '/collection.html', layout.replace('%%CONTENT%%', cbody));
  console.log('rendered OK');
})().catch(e => { console.error('RENDER ERROR', e.message); process.exit(1); });
