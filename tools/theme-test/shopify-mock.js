/*
 * Demo-only stand-in for Shopify's storefront backend.
 * Implements the endpoints the theme calls (/cart/add.js, /cart/change.js, ?sections=, ?section_id=)
 * and re-renders the theme's own Liquid sections in the browser. Checkout is disabled.
 */
(function () {
  'use strict';
  var D = window.TB_DEMO, CAT = window.TB_CATALOG;
  var env = window.LiquidShopify.create(window.liquidjs, {
    read: function (p) { return D.templates[p]; },
    exists: function (p) { return Object.prototype.hasOwnProperty.call(D.templates, p); },
    locale: D.locale, menus: CAT.menus, globals: D.globals, assetBase: window.TB_ASSET_BASE
  });
  var products = CAT.products.map(env.product);
  var KEY = 'tb-demo-cart';
  var lines = [];
  try { lines = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { lines = []; }
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {} };

  function find(id) {
    for (var i = 0; i < products.length; i++) {
      var v = products[i].variants.filter(function (x) { return String(x.id) === String(id); })[0];
      if (v) return { product: products[i], variant: v };
    }
    return null;
  }
  function cart() {
    var items = lines.map(function (l, i) {
      var f = find(l.id);
      return {
        url: f.product.url, image: null, quantity: l.qty, final_line_price: f.variant.price * l.qty,
        product: f.product, variant: f.variant, properties: l.properties || {},
        url_to_remove: '/cart/change?line=' + (i + 1) + '&quantity=0'
      };
    });
    return {
      item_count: items.reduce(function (a, x) { return a + x.quantity; }, 0),
      total_price: items.reduce(function (a, x) { return a + x.final_line_price; }, 0),
      items: items
    };
  }
  function sections(names) {
    var out = {}, c = cart();
    return Promise.all(names.map(function (n) {
      n = n.trim();
      return env.renderSection(n, n, {}, { cart: c }).then(function (h) { out[n] = h; });
    })).then(function () { return out; });
  }
  function json(o, status) { return new Response(JSON.stringify(o), { status: status || 200, headers: { 'Content-Type': 'application/json' } }); }

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    init = init || {};
    var url = new URL(typeof input === 'string' ? input : input.url, location.href);
    var method = (init.method || 'GET').toUpperCase();
    if (url.pathname === '/cart/add.js' && method === 'POST') {
      var fd = init.body instanceof FormData ? init.body : new FormData();
      var id = fd.get('id'), qty = +(fd.get('quantity') || 1), props = {};
      fd.forEach(function (v, k) { var m = k.match(/^properties\[(.+)\]$/); if (m && v !== '') props[m[1]] = v; });
      var f = find(id);
      if (!f) return Promise.resolve(json({ status: 422, description: 'Seleziona una variante' }, 422));
      if (!f.variant.available) return Promise.resolve(json({ status: 422, description: 'Questa taglia è sold out' }, 422));
      var key = id + JSON.stringify(props);
      var ex = lines.filter(function (l) { return l.key === key; })[0];
      if (ex) ex.qty += qty; else lines.push({ key: key, id: id, qty: qty, properties: props });
      save();
      var s = fd.get('sections');
      return (s ? sections(String(s).split(',')) : Promise.resolve(undefined)).then(function (sec) { return json({ id: +id, quantity: qty, sections: sec }); });
    }
    if (url.pathname === '/cart/change.js' && method === 'POST') {
      var body = JSON.parse(init.body || '{}'), idx = (+body.line) - 1;
      if (lines[idx]) { if (+body.quantity <= 0) lines.splice(idx, 1); else lines[idx].qty = +body.quantity; }
      save();
      return (body.sections ? sections(body.sections) : Promise.resolve(undefined)).then(function (sec) { return json({ item_count: cart().item_count, sections: sec }); });
    }
    if (url.pathname === '/cart' && url.searchParams.get('sections')) return sections(url.searchParams.get('sections').split(',')).then(json);
    if (url.searchParams.get('section_id') === 'quick-view') {
      var handle = url.pathname.split('/').pop();
      var prod = products.filter(function (p) { return p.handle === handle; })[0];
      if (!prod) return Promise.resolve(new Response('Not found', { status: 404 }));
      return env.renderSection('quick-view', 'quick-view', {}, { product: prod }).then(function (h) { return new Response(h, { headers: { 'Content-Type': 'text/html' } }); });
    }
    return realFetch(input, init);
  };

  /* ---------- UI helpers ---------- */
  function swapHtml(el, html) {
    if (!el) return;
    el.innerHTML = html;
    if (window.TBJersey) window.TBJersey.hydrate(el);
  }
  function renderDrawerAndCount() {
    return sections(['cart-drawer']).then(function (s) {
      var d = document.querySelector('#CartDrawer .drawer__inner');
      var doc = new DOMParser().parseFromString(s['cart-drawer'], 'text/html');
      var fresh = doc.querySelector('.drawer__inner');
      if (d && fresh) { d.replaceWith(fresh); if (window.TBJersey) window.TBJersey.hydrate(fresh); }
      document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = cart().item_count; });
    });
  }
  function renderCartPage() {
    var cp = document.querySelector('[data-demo-cart-page]'); if (!cp) return Promise.resolve();
    return env.renderSection('main-cart', 'main', {}, { cart: cart() }).then(function (h) { swapHtml(cp, h); });
  }
  function renderSearch() {
    var sp = document.querySelector('[data-demo-search]'); if (!sp) return;
    var q = (new URLSearchParams(location.search).get('q') || '').trim();
    if (!q) return;
    var ql = q.toLowerCase();
    var results = products.filter(function (p) { return (p.title + ' ' + p.type + ' ' + p.description).toLowerCase().indexOf(ql) > -1; })
      .map(function (p) { return Object.assign({ object_type: 'product' }, p); });
    env.renderSection('main-search', 'main', {}, { search: { performed: true, terms: q, results: results, results_count: results.length } }).then(function (h) { swapHtml(sp, h); if (window.TBTheme) window.TBTheme.init(sp); });
  }
  var overlay;
  function checkoutDemo() {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'demo-checkout';
      overlay.innerHTML = '<div class="demo-checkout__box"><p class="label">Demo</p><h2 class="d">Qui parte il checkout Shopify</h2><p>Nel negozio vero si apre il checkout sicuro di Shopify (carte, Apple Pay, Google Pay, PayPal, Shop Pay). Nella demo i pagamenti sono disattivati.</p><button class="btn btn--pink" type="button">Ok, torna allo shop</button></div>';
      overlay.addEventListener('click', function (e) { if (e.target === overlay || e.target.closest('button')) overlay.classList.remove('on'); });
      document.body.appendChild(overlay);
    }
    overlay.classList.add('on');
  }

  document.addEventListener('submit', function (e) {
    var f = e.target, s = e.submitter;
    if (s && s.name === 'checkout') { e.preventDefault(); e.stopImmediatePropagation(); checkoutDemo(); return; }
    if (s && s.name === 'update') {
      e.preventDefault(); e.stopImmediatePropagation();
      f.querySelectorAll('input[name="updates[]"]').forEach(function (inp, i) { if (lines[i]) lines[i].qty = Math.max(0, +inp.value); });
      lines = lines.filter(function (l) { return l.qty > 0; }); save();
      renderCartPage().then(renderDrawerAndCount);
      return;
    }
    var type = f.getAttribute('data-form-type');
    if (type === 'customer') {
      e.preventDefault(); e.stopImmediatePropagation();
      f.innerHTML = '<p class="nl-ok">' + D.locale.newsletter.success + '</p>';
      return;
    }
    if (type === 'storefront_password') { e.preventDefault(); e.stopImmediatePropagation(); location.href = '/'; }
  }, true);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="/cart/change?"]');
    if (!a) return;
    e.preventDefault();
    var p = new URL(a.href).searchParams, idx = (+p.get('line')) - 1;
    if (lines[idx]) lines.splice(idx, 1);
    save();
    renderCartPage().then(renderDrawerAndCount);
  }, true);

  renderDrawerAndCount();
  renderCartPage();
  renderSearch();
})();
