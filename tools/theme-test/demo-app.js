/* Browser bootstrap for the CDN-hosted demo: renders the requested page from the theme's Liquid, then hands over to the theme JS. */
(function () {
  'use strict';
  var base = window.TB_ASSET_BASE;
  var D = window.TB_DEMO, CAT = window.TB_CATALOG;
  var read = function (p) { return Object.prototype.hasOwnProperty.call(D.templates, p) ? D.templates[p] : null; };
  var env = window.LiquidShopify.create(window.liquidjs, {
    read: read, exists: function (p) { return read(p) !== null; },
    locale: D.locale, menus: CAT.menus, globals: D.globals, assetBase: base + 'assets/'
  });
  var runtime = {
    'liquid.browser.min.js': window.TB_LIQUID_URL,
    'liquid-shopify.js': base + 'tools/theme-test/liquid-shopify.js',
    'demo-catalog.js': base + 'tools/theme-test/demo-catalog.js',
    'shopify-mock.js': base + 'tools/theme-test/shopify-mock.js',
    'demo-data.js': base + 'demo/demo-data.js'
  };
  var pages = window.TBDemoPages.create({ env: env, read: read, catalog: CAT, src: function (f) { return runtime[f]; } });
  pages.render(location.pathname).then(function (html) {
    html = html.replace('<script src="' + runtime['liquid.browser.min.js'] + '" defer></script>',
      '<script>window.TB_ASSET_BASE=' + JSON.stringify(base) + ';</script>\n    <script src="' + runtime['liquid.browser.min.js'] + '" defer></script>');
    document.open(); document.write(html); document.close();
  }).catch(function (e) {
    document.body.innerHTML = '<pre style="padding:24px;font:14px monospace">Errore demo: ' + String(e && e.message || e) + '</pre>';
  });
})();
