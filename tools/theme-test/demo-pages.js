/*
 * Demo store pages, built from the real theme Liquid. Shared by the static build (Node)
 * and the browser app (demo-app.js), so both produce identical pages.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TBDemoPages = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BAR = '<div class="demo-bar">Anteprima demo del tema Shopify Team Butti · prodotti e prezzi di esempio · checkout disattivato</div>';
  var CSS = '<style>.demo-bar{background:#0d0d0d;color:#ffd400;text-align:center;padding:6px 16px;font:700 10px/1.4 "Space Mono",monospace;letter-spacing:.14em;text-transform:uppercase}' +
    '.demo-checkout{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.6);display:none;place-items:center;padding:16px}.demo-checkout.on{display:grid}' +
    '.demo-checkout__box{background:var(--paper);border:3px solid var(--ink);box-shadow:10px 10px 0 var(--pink);padding:28px;max-width:460px;display:grid;gap:14px}.demo-checkout__box h2{font-size:44px;margin:0}.demo-checkout__box p{margin:0;font-size:13px}</style>';
  var SPEDIZIONI = '<p>Italia 2–4 giorni lavorativi, gratis sopra 100€. Europa 4–7 giorni.</p><p>Resi gratuiti entro 14 giorni dalla consegna. Le maglie personalizzate non sono rimborsabili.</p><table><tr><th>Taglia</th><th>Lunghezza</th><th>Larghezza</th></tr><tr><td>S</td><td>66</td><td>56</td></tr><tr><td>M</td><td>70</td><td>60</td></tr><tr><td>L</td><td>74</td><td>64</td></tr><tr><td>XL</td><td>78</td><td>68</td></tr><tr><td>XXL</td><td>82</td><td>72</td></tr></table>';

  // o: { env, read(rel), catalog, src(name) -> url for demo runtime scripts }
  function create(o) {
    var env = o.env;
    var products = o.catalog.products.map(env.product);
    var byHandle = function (h) { return products.filter(function (p) { return p.handle === h; })[0]; };
    var coll = function (handle, title, list) {
      var types = [];
      list.forEach(function (p) { if (types.indexOf(p.type) === -1) types.push(p.type); });
      return { handle: handle, title: title, url: '/collections/' + handle, products: list, products_count: list.length, all_types: types, description: '', featured_image: null };
    };
    var collections = {
      all: coll('all', 'Shop', products.filter(function (p) { return p.handle !== 'targa-socal'; })),
      'drop-01': coll('drop-01', 'Drop 01', products.slice(0, 8))
    };
    var tpl = function (name) { return JSON.parse(o.read('templates/' + name + '.json')); };
    var sec = function (type, id, conf, extra) { return env.renderSection(type, id, conf || {}, extra); };
    var scripts = ['liquid.browser.min.js', 'liquid-shopify.js', 'demo-catalog.js', 'demo-data.js', 'shopify-mock.js']
      .map(function (f) { return '<script src="' + o.src(f) + '" defer></script>'; }).join('\n    ');

    function decorate(html) {
      var tbj = html.match(/<script src="[^"]*tb-jersey\.js" defer><\/script>/);
      if (tbj) html = html.replace(tbj[0], scripts + '\n    ' + tbj[0]);
      return html.replace('</head>', '  <meta name="robots" content="noindex,nofollow">\n    ' + CSS + '\n  </head>')
        .replace(/(<body[^>]*>)/, '$1\n    ' + BAR);
    }
    function page(body, extra, layout) {
      return env.renderLayout(layout || 'theme', body, extra).then(decorate);
    }
    function seq(ids, fn) {
      return ids.reduce(function (p, id) { return p.then(function (acc) { return fn(id).then(function (h) { return acc + h; }); }); }, Promise.resolve(''));
    }
    var req = function (type) { return { locale: { iso_code: 'it' }, page_type: type, origin: '' }; };

    var routes = {
      home: function () {
        var home = tpl('index');
        home.sections.drop.settings = Object.assign({}, home.sections.drop.settings, { collection__obj: collections['drop-01'] });
        home.sections.custom.settings = { product__obj: byHandle('maglia-custom') };
        home.sections.plate.settings = { product__obj: byHandle('targa-socal') };
        return seq(home.order, function (id) { return sec(home.sections[id].type, id, home.sections[id]); })
          .then(function (b) { return page(b, { template: { name: 'index' }, page_title: 'Team Butti', request: req('index') }); });
      },
      collection: function (handle) {
        var c = collections[handle]; if (!c) return null;
        return sec('main-collection', 'main', tpl('collection').sections.main, { collection: c })
          .then(function (b) { return page(b, { template: { name: 'collection' }, page_title: c.title, request: req('collection') }); });
      },
      product: function (handle) {
        var p = byHandle(handle); if (!p) return null;
        var t = tpl('product');
        t.sections.more.settings = Object.assign({}, t.sections.more.settings, { collection__obj: collections['drop-01'] });
        return seq(t.order, function (id) { return sec(t.sections[id].type, id, t.sections[id], { product: p }); })
          .then(function (b) { return page(b, { template: { name: 'product' }, page_title: p.title, product: p, request: req('product') }); });
      },
      cart: function () {
        return sec('main-cart', 'main').then(function (b) { return page('<div data-demo-cart-page>' + b + '</div>', { template: { name: 'cart' }, page_title: 'Bag', request: req('cart') }); });
      },
      search: function () {
        return sec('main-search', 'main', {}, { search: { performed: false, terms: '' } })
          .then(function (b) { return page('<div data-demo-search>' + b + '</div>', { template: { name: 'search' }, page_title: 'Cerca', request: req('search') }); });
      },
      collections: function () {
        return sec('main-list-collections', 'main', {}, { collections: [collections.all, collections['drop-01']] })
          .then(function (b) { return page(b, { template: { name: 'list-collections' }, page_title: 'Collezioni', request: req('list-collections') }); });
      },
      spedizioni: function () {
        return sec('main-page', 'main', {}, { page: { title: 'Spedizioni e resi', content: SPEDIZIONI } })
          .then(function (b) { return page(b, { template: { name: 'page' }, page_title: 'Spedizioni e resi', request: req('page') }); });
      },
      notFound: function () {
        return sec('main-404', 'main').then(function (b) { return page(b, { template: { name: '404' }, page_title: '404', request: req('404') }); });
      },
      password: function () {
        return sec('main-password', 'main').then(function (b) { return page(b, { template: { name: 'password' }, page_title: 'Team Butti', request: req('password') }, 'password'); });
      }
    };

    function render(pathname) {
      var p = String(pathname || '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
      var m, out = null;
      if (p === '/' || p === '/index') out = routes.home();
      else if ((m = p.match(/^\/collections\/([\w-]+)$/))) out = routes.collection(m[1]);
      else if (p === '/collections') out = routes.collections();
      else if ((m = p.match(/^\/products\/([\w-]+)$/))) out = routes.product(m[1]);
      else if (p === '/cart') out = routes.cart();
      else if (p === '/search') out = routes.search();
      else if (p === '/pages/spedizioni') out = routes.spedizioni();
      else if (p === '/password') out = routes.password();
      return out || routes.notFound();
    }

    var paths = ['/', '/collections', '/cart', '/search', '/pages/spedizioni', '/password']
      .concat(Object.keys(collections).map(function (h) { return '/collections/' + h; }))
      .concat(products.map(function (p) { return '/products/' + p.handle; }));

    return { render: render, paths: paths, products: products, collections: collections };
  }

  return { create: create };
});
