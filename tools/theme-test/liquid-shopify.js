/*
 * Minimal Shopify-flavoured Liquid environment on top of liquidjs.
 * Works in Node (tests, static demo build) and in the browser (demo cart rendering).
 * It is a test/demo harness, not a replacement for Shopify's renderer.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LiquidShopify = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function create(liquidjs, opts) {
    var Liquid = liquidjs.Liquid, Drop = liquidjs.Drop;
    var read = function (rel) {
      var src = opts.read(rel);
      if (src == null) throw new Error('Template not found: ' + rel);
      return src.replace(/posted_successfully\?/g, 'posted_successfully');
    };
    var schemaOf = function (src) { var m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/); return m ? JSON.parse(m[1]) : {}; };

    class Val extends Drop {
      constructor(v, o) { super(); this.v = v; Object.assign(this, o || {}); }
      valueOf() { return this.v; }
      toString() { return this.v; }
    }

    var money = function (c) { return (Number(c || 0) / 100).toFixed(2).replace('.', ',') + ' €'; };
    var norm = function (f) { return String(f).replace(/^\.?\//, ''); };
    var engine = new Liquid({
      root: ['snippets'], partials: ['snippets'], extname: '.liquid', strictFilters: true, dynamicPartials: true, cache: true,
      // Shopify globals stay visible inside {% render %} snippets
      globals: opts.globals ? { settings: opts.globals.settings, shop: opts.globals.shop, routes: opts.globals.routes, request: opts.globals.request } : {},
      fs: {
        readFileSync: function (f) { return read(norm(f)); },
        readFile: function (f) { return Promise.resolve(read(norm(f))); },
        existsSync: function (f) { return opts.exists(norm(f)); },
        exists: function (f) { return Promise.resolve(opts.exists(norm(f))); },
        resolve: function (r, file, ext) { return r + '/' + file + (file.slice(-ext.length) === ext ? '' : ext); },
        contains: function () { return true; },
        dirname: function (p) { return p.split('/').slice(0, -1).join('/'); },
        sep: '/'
      }
    });

    var tr = function (key, args) {
      args = args || {};
      var v = key.split('.').reduce(function (o, k) { return o && o[k]; }, opts.locale);
      if (v && typeof v === 'object') v = args.count === 1 ? v.one : v.other;
      if (v == null) throw new Error('Missing translation ' + key);
      return String(v).replace(/{{\s*(\w+)\s*}}/g, function (_, k) { return args[k]; });
    };
    var kw = function (args) { var o = {}; args.forEach(function (a) { if (Array.isArray(a)) o[a[0]] = a[1]; }); return o; };
    var F = {
      t: function (k) { return tr(k, kw([].slice.call(arguments, 1))); },
      asset_url: function (n) { return (opts.assetBase || '/assets/') + n; },
      stylesheet_tag: function (u) { return '<link rel="stylesheet" href="' + u + '">'; },
      preload_tag: function (u) { return '<link rel="preload" href="' + u + '" as="font" type="font/woff2" crossorigin>'; },
      image_url: function (img) { return img && img.src ? img.src : ''; },
      image_tag: function (u) { var o = kw([].slice.call(arguments, 1)); return '<img src="' + u + '" alt="' + (o.alt || '') + '" class="' + (o.class || '') + '" loading="' + (o.loading || 'lazy') + '">'; },
      placeholder_svg_tag: function (n, c) { return '<svg class="' + (c || '') + '" viewBox="0 0 10 10" aria-hidden="true"><rect width="10" height="10"/></svg>'; },
      money: money,
      money_with_currency: function (c) { return money(c) + ' EUR'; },
      money_without_trailing_zeros: function (c) { return money(c).replace(',00', ''); },
      handleize: function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); },
      default_errors: function (e) { return e ? '<ul><li>Errore</li></ul>' : ''; },
      payment_type_svg_tag: function (type) { return '<svg class="payment-icon" viewBox="0 0 38 24" aria-label="' + type + '"><rect width="38" height="24" rx="3" fill="#fff"/><text x="19" y="16" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#111">' + String(type).toUpperCase().slice(0, 4) + '</text></svg>'; },
      default_pagination: function () { return '<span class="current">1</span>'; },
      json: function (v) { var x = v && typeof v.valueOf === 'function' ? v.valueOf() : v; return JSON.stringify(x); }
    };
    Object.keys(F).forEach(function (k) { engine.registerFilter(k, F[k]); });

    var block = function (endName, after) {
      return {
        parse: function (tok, rem) {
          this.args = tok.args; this.tpls = [];
          var self = this, s = this.liquid.parser.parseStream(rem);
          s.on('tag:' + endName, function () { s.stop(); }).on('template', function (t) { self.tpls.push(t); }).on('end', function () { throw new Error(endName + ' missing'); });
          s.start();
        },
        render: after
      };
    };
    engine.registerTag('schema', block('endschema', function* () { return ''; }));
    engine.registerTag('paginate', block('endpaginate', function* (ctx, emitter) {
      ctx.push({ paginate: { pages: 1 } });
      yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
    }));
    engine.registerTag('form', block('endform', function* (ctx, emitter) {
      var type = this.args.match(/'([^']+)'/)[1];
      var attrs = [];
      var re = /([\w-]+):\s*('([^']*)'|([\w.]+))/g, m;
      while ((m = re.exec(this.args))) attrs.push([m[1], m[3] !== undefined ? m[3] : ctx.getSync(m[4].split('.'))]);
      var action = { product: '/cart/add', customer: '/contact#newsletter', storefront_password: '/password' }[type] || '/';
      emitter.write('<form method="post" action="' + action + '" data-form-type="' + type + '" ' + attrs.map(function (a) { return a[0] + '="' + a[1] + '"'; }).join(' ') + '>');
      ctx.push({ form: { posted_successfully: false, errors: null } });
      yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
      emitter.write('</form>');
    }));

    var globals = opts.globals || {};
    function sectionObj(type, id, conf) {
      conf = conf || {};
      var src = read('sections/' + type + '.liquid'), sch = schemaOf(src);
      var settings = {};
      (sch.settings || []).forEach(function (s) { if ('default' in s) settings[s.id] = s.default; });
      Object.keys(conf.settings || {}).forEach(function (k) { if (k.indexOf('__obj') === -1) settings[k] = conf.settings[k]; });
      (sch.settings || []).forEach(function (s) {
        if (s.type === 'link_list') settings[s.id] = (opts.menus || {})[settings[s.id]] || null;
        if (s.type === 'collection' || s.type === 'product') settings[s.id] = (conf.settings && conf.settings[s.id + '__obj']) || null;
      });
      var order = conf.block_order || Object.keys(conf.blocks || {});
      var blocks = order.map(function (bid) {
        var b = conf.blocks[bid], bs = (sch.blocks || []).filter(function (x) { return x.type === b.type; })[0] || {}, bd = {};
        (bs.settings || []).forEach(function (s) { if ('default' in s) bd[s.id] = s.default; });
        return { id: bid, type: b.type, settings: Object.assign(bd, b.settings || {}), shopify_attributes: '' };
      });
      return { src: src, section: { id: id, settings: settings, blocks: blocks } };
    }
    function renderSection(type, id, conf, extra) {
      var so = sectionObj(type, id, conf);
      return engine.parseAndRender(so.src, Object.assign({}, globals, extra || {}, { section: so.section })).then(function (html) {
        return '<div id="shopify-section-' + id + '" class="shopify-section">' + html + '</div>';
      });
    }
    function renderGroup(name, extra) {
      var g = JSON.parse(read('sections/' + name + '.json'));
      return g.order.reduce(function (p, id) {
        return p.then(function (acc) { return renderSection(g.sections[id].type, id, g.sections[id], extra).then(function (h) { return acc + h; }); });
      }, Promise.resolve(''));
    }
    // {% section %} / {% sections %} are resolved by pre-rendering in renderLayout
    engine.registerTag('section', { parse: function (tok) { this.name = tok.args.replace(/'/g, '').trim(); }, render: function* (ctx) { return ctx.getSync(['__sec_' + this.name]) || ''; } });
    engine.registerTag('sections', { parse: function (tok) { this.name = tok.args.replace(/'/g, '').trim(); }, render: function* (ctx) { return ctx.getSync(['__grp_' + this.name.replace(/-/g, '_')]) || ''; } });

    function renderLayout(layout, body, extra) {
      var ctx = Object.assign({}, globals, extra || {});
      return Promise.all([renderGroup('header-group', ctx), renderGroup('footer-group', ctx), renderSection('cart-drawer', 'cart-drawer', {}, ctx)]).then(function (r) {
        ctx.__grp_header_group = r[0]; ctx.__grp_footer_group = r[1]; ctx['__sec_cart-drawer'] = r[2];
        var src = read('layout/' + layout + '.liquid').replace('{{ content_for_layout }}', '%%CONTENT%%');
        return engine.parseAndRender(src, ctx).then(function (html) { return html.replace('%%CONTENT%%', body); });
      });
    }

    // Raw catalog product -> Shopify-like product object
    function product(p) {
      var opts2 = p.options || ['Title'];
      var variants = p.variants.map(function (v) { return Object.assign({ title: v.options.join(' / ') }, v); });
      var first = variants.filter(function (v) { return v.available; })[0] || variants[0];
      var prices = variants.map(function (v) { return v.price; });
      return {
        id: p.id, title: p.title, handle: p.handle, url: '/products/' + p.handle, type: p.type, vendor: 'Team Butti',
        price: Math.min.apply(null, prices), price_varies: Math.min.apply(null, prices) !== Math.max.apply(null, prices),
        compare_at_price: p.compare_at_price || null, available: variants.some(function (v) { return v.available; }),
        images: [], featured_image: null, tags: p.tags || [], description: p.description || '',
        has_only_default_variant: !p.options,
        options_with_values: opts2.map(function (name, i) {
          var vals = [];
          variants.forEach(function (v) { if (vals.indexOf(v.options[i]) === -1) vals.push(v.options[i]); });
          return { name: name, values: vals.map(function (val) {
            return new Val(val, { available: variants.some(function (v) { return v.options[i] === val && v.available; }), selected: first.options[i] === val });
          }) };
        }),
        variants: variants, selected_or_first_available_variant: first,
        metafields: { custom: {
          jersey_type: { value: p.jersey ? p.jersey[0] : null },
          jersey_colors: { value: p.jersey ? p.jersey[1] : null },
          jersey_number: { value: p.jersey ? p.jersey[2] : null },
          card_bg: { value: p.bg || null }
        } }
      };
    }

    return { engine: engine, Val: Val, money: money, renderSection: renderSection, renderLayout: renderLayout, product: product, globals: globals };
  }

  return { create: create };
});
