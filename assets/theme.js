/* TEAM BUTTI — theme behaviour. Depends on assets/tb-jersey.js (window.TBJersey). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var TB = window.TB || { routes: { cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change' }, strings: {} };
  var J = window.TBJersey;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------------- toast ---------------- */
  var toastT;
  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* ---------------- overlay, drawer, modal ---------------- */
  function lock(on) { document.body.classList.toggle('lock', !!on); }
  function closeAll() {
    ['#ov', '#CartDrawer', '#modal'].forEach(function (s) { var el = $(s); if (el) { el.classList.remove('on'); el.setAttribute('aria-hidden', 'true'); } });
    lock(false);
  }
  function openCart() {
    var d = $('#CartDrawer');
    if (!d || !TB.cartDrawer) { window.location.href = TB.routes.cart; return; }
    closeAll(); toggleMenu(false);
    d.classList.add('on'); d.setAttribute('aria-hidden', 'false'); $('#ov').classList.add('on'); lock(true);
    var x = $('.x', d); if (x) x.focus();
  }
  function setCount(n) {
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); });
  }
  function renderDrawer(html) {
    var d = $('#CartDrawer'); if (!d || !html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = $('.drawer__inner', doc), cur = $('.drawer__inner', d);
    if (fresh && cur) { cur.replaceWith(fresh); setCount(fresh.dataset.count); J && J.hydrate(fresh); }
  }
  function refreshDrawer() {
    return fetch(TB.routes.cart + '?sections=cart-drawer').then(function (r) { return r.json(); }).then(function (data) { renderDrawer(data['cart-drawer']); });
  }
  // Cart AJAX API: add, then render the drawer section in the same request (Section Rendering API)
  function addToCart(form, btn, err) {
    var fd = new FormData(form);
    if (TB.cartDrawer) fd.append('sections', 'cart-drawer');
    btn.classList.add('is-loading'); if (err) err.hidden = true;
    return fetch(TB.routes.cartAdd + '.js', { method: 'POST', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: fd })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.description || res.j.message || 'Error');
        if (!TB.cartDrawer) { window.location.href = TB.routes.cart; return; }
        if (res.j.sections && res.j.sections['cart-drawer']) renderDrawer(res.j.sections['cart-drawer']);
        else return refreshDrawer();
      })
      .then(function () { if (TB.cartDrawer) openCart(); })
      .catch(function (e) { if (err) { err.textContent = e.message; err.hidden = false; } })
      .finally(function () { btn.classList.remove('is-loading'); });
  }
  function changeLine(line, qty) {
    var d = $('#CartDrawer'); if (d) d.classList.add('is-loading');
    return fetch(TB.routes.cartChange + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ line: +line, quantity: +qty, sections: ['cart-drawer'] }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j.sections) renderDrawer(j.sections['cart-drawer']); else return refreshDrawer(); })
      .finally(function () { if (d) d.classList.remove('is-loading'); });
  }

  /* ---------------- mobile menu ---------------- */
  function toggleMenu(force) {
    var m = $('#MobileMenu'); if (!m) return;
    var open = m.classList.toggle('open', force);
    $$('[data-menu-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', open); });
    if (force === undefined) lock(open);
  }

  /* ---------------- quick view ---------------- */
  function openQuick(url) {
    var modal = $('#modal'); if (!modal) { window.location.href = url; return; }
    fetch(url + (url.indexOf('?') > -1 ? '&' : '?') + 'section_id=quick-view')
      .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var qv = $('.qv', doc); if (!qv) throw new Error();
        modal.innerHTML = qv.innerHTML;
        closeAll(); toggleMenu(false);
        modal.classList.add('on'); modal.setAttribute('aria-hidden', 'false'); $('#ov').classList.add('on'); lock(true);
        init(modal);
        initProduct(modal);
      })
      .catch(function () { window.location.href = url; });
  }

  /* ---------------- global listeners (once) ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-menu-toggle]')) { toggleMenu(); return; }
    if (t.closest('#MobileMenu a')) { toggleMenu(false); return; }
    var open = t.closest('[data-cart-open]');
    if (open && TB.cartDrawer && $('#CartDrawer')) { e.preventDefault(); openCart(); return; }
    if (t.closest('[data-close]') || t.id === 'ov') { closeAll(); return; }
    var line = t.closest('[data-line]');
    if (line) { changeLine(line.dataset.line, line.dataset.qty); return; }
    var card = t.closest('[data-quick]');
    if (card && !e.metaKey && !e.ctrlKey && !e.shiftKey && $('#modal')) { e.preventDefault(); openQuick(card.dataset.quick); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); toggleMenu(false); } });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-product-form]') || f.matches('[data-cfg-form]') || f.matches('[data-plate-form]')) {
      if (!TB.cartDrawer) return;
      e.preventDefault();
      addToCart(f, $('[data-add]', f), $('[data-error]', f));
    }
  });

  /* ---------------- product forms (variant picking) ---------------- */
  function initProduct(root) {
    $$('[data-pform]', root).forEach(function (pf) {
      if (pf.dataset.ready) return; pf.dataset.ready = '1';
      var json = $('[data-variants]', pf); if (!json) return;
      var variants = JSON.parse(json.textContent);
      var scope = pf.closest('[data-tb="product"]') || root;
      var form = $('[data-product-form]', pf), btn = $('[data-add]', pf), idIn = $('input[name="id"]', form);
      function update() {
        var sel = $$('[data-opt]', pf).map(function (o) { var on = $('.size.on', o); return on ? on.dataset.v : null; });
        var v = variants.filter(function (x) { return sel.every(function (s, i) { return s === null || x.options[i] === s; }); })[0];
        if (!v || sel.indexOf(null) > -1) { btn.disabled = true; btn.textContent = v ? TB.strings.chooseSize : TB.strings.unavailable; return; }
        idIn.value = v.id;
        btn.disabled = !v.available;
        btn.textContent = v.available ? TB.strings.add + ' — ' + v.price : TB.strings.soldOut;
        var price = $('[data-price]', scope); if (price) price.innerHTML = v.price;
        if (scope.classList.contains('pdp')) history.replaceState(null, '', '?variant=' + v.id);
      }
      pf.addEventListener('click', function (e) {
        var b = e.target.closest('.size'); if (!b || b.classList.contains('na')) return;
        $$('.size', b.parentNode).forEach(function (x) { x.classList.toggle('on', x === b); });
        update();
      });
    });
    $$('[data-stage]', root).forEach(function (stage) {
      if (stage.dataset.ready || !J) return; stage.dataset.ready = '1';
      var flip = $('[data-flip]', stage); if (!flip) return;
      var rot = J.rotator(stage, flip);
      var turn = $('[data-turn]', stage); if (turn) turn.addEventListener('click', function () { rot.toggle(); });
    });
  }

  /* ---------------- section initialisers ---------------- */
  var VIBE_PATTERNS = {
    halftone: 'radial-gradient(circle,rgba(0,0,0,.28) 1.3px,transparent 1.8px) 0 0/9px 9px',
    'halftone-pink': 'radial-gradient(circle,rgba(255,46,147,.35) 1.3px,transparent 1.8px) 0 0/9px 9px',
    leopard: 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><g fill='#a8621c' stroke='#140c05' stroke-width='6' stroke-dasharray='16 7' stroke-linecap='round'><circle cx='22' cy='26' r='12'/><circle cx='86' cy='18' r='10'/><circle cx='118' cy='70' r='13'/><circle cx='54' cy='78' r='11'/><circle cx='18' cy='116' r='10'/><circle cx='92' cy='120' r='12'/></g><g fill='#140c05'><circle cx='60' cy='40' r='4'/><circle cx='120' cy='26' r='3'/><circle cx='30' cy='70' r='3'/><circle cx='70' cy='110' r='4'/><circle cx='130' cy='120' r='3'/></g></svg>") + '") 0 0/140px 140px',
    none: 'none'
  };

  var inits = {
    hero: function (hero) {
      var vibes = $$('[data-vibe]', hero).map(function (v) { return { n: v.dataset.name, bg: v.dataset.bg, fg: v.dataset.fg, p: VIBE_PATTERNS[v.dataset.pattern] || 'none', j: v.dataset.j.split('|') }; });
      var line = $('[data-line]', hero), rope = $('[data-rope]', hero);
      var pegs = $$('[data-peg]', hero).map(function (el, k) {
        var j = $('.peg__j', el);
        j.innerHTML = J.svg(el.dataset.type, el.dataset.side, { num: el.dataset.num, name: el.dataset.name, capt: true });
        return { el: el, j: j, t: [0.2, 0.5, 0.8][k], s: J.swing($('.peg__swing', el), { k: 36, c: 1.5, wind: 2.4, max: 30 }) };
      });
      function layout() {
        if (!line) return;
        var W = line.clientWidth, y0 = 14, S = Math.min(56, W * 0.035);
        rope.setAttribute('viewBox', '0 0 ' + W + ' ' + (y0 + 2 * S + 8));
        rope.style.height = (y0 + 2 * S + 8) + 'px';
        rope.innerHTML = '<path d="M-10 ' + y0 + ' Q' + (W / 2) + ' ' + (y0 + 2 * S) + ' ' + (W + 10) + ' ' + y0 + '" fill="none" stroke="currentColor" stroke-width="2.5"/>';
        var ts = pegs.length === 1 ? [0.5] : pegs.length === 2 ? [0.25, 0.75] : [0.2, 0.5, 0.8];
        pegs.forEach(function (p, i) { var t = ts[i]; p.el.style.left = (-10 + t * (W + 20)) + 'px'; p.el.style.top = (y0 + 4 * S * t * (1 - t)) + 'px'; });
      }
      layout(); window.addEventListener('resize', layout);
      var vi = 0;
      function setVibe(i) {
        var v = vibes[i]; if (!v) return;
        hero.style.setProperty('--hero-bg', v.bg); hero.style.setProperty('--hero-fg', v.fg); hero.style.setProperty('--hero-pattern', v.p);
        var name = $('[data-vibe-name]', hero); if (name) name.textContent = name.textContent.split(':')[0] + ': ' + v.n;
        pegs.forEach(function (p, k) { J.apply(p.j, J.parse(v.j[k])); p.s.kick((k % 2 ? 1 : -1) * (60 + Math.random() * 60)); });
      }
      setVibe(0);
      hero._setVibe = function (i) { vi = i; setVibe(i); };
      var btn = $('[data-vibe-btn]', hero);
      if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); vi = (vi + 1) % vibes.length; setVibe(vi); });
      hero.addEventListener('pointermove', function (e) {
        if (reduce) return;
        pegs.forEach(function (p) {
          var r = p.el.getBoundingClientRect();
          var f = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 280);
          if (f > 0) p.s.kick((e.movementX || 0) * 1.3 * f);
        });
      });
      // skyline
      var sky = $('[data-skyline]', hero);
      if (sky) {
        var s = '', x = 0, seed = 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
        while (x < 1440) {
          var w = 40 + rnd() * 90, h = 50 + rnd() * 150;
          s += '<rect x="' + x + '" y="' + (240 - h) + '" width="' + w + '" height="' + h + '" fill="currentColor"/>';
          if (rnd() > 0.6) s += '<rect x="' + (x + w / 2 - 2) + '" y="' + (240 - h - 26) + '" width="4" height="26" fill="currentColor"/>';
          x += w + 2;
        }
        var palm = function (px) {
          return '<g fill="currentColor"><path d="M' + px + ' 240 C' + (px + 4) + ' 180 ' + (px + 14) + ' 120 ' + (px + 10) + ' 60 L' + (px + 18) + ' 60 C' + (px + 22) + ' 120 ' + (px + 12) + ' 180 ' + (px + 10) + ' 240Z"/>' +
            [-60, -25, 15, 50, 85, 130].map(function (a) { return '<ellipse cx="' + (px + 14) + '" cy="60" rx="46" ry="9" transform="rotate(' + a + ' ' + (px + 14) + ' 60) translate(30 0)"/>'; }).join('') + '</g>';
        };
        sky.innerHTML = s + palm(180) + palm(260) + palm(1120) + palm(1300);
      }
      // BRAAAP
      var words = (hero.dataset.braps || '').split(',').map(function (w) { return w.trim(); }).filter(Boolean);
      var pop = ['#ffd400', '#39ff14', '#f4f1ea', '#ff2e93', '#1d3fbf', '#e3191b'];
      hero.addEventListener('click', function (e) {
        if (!words.length || e.target.closest('a,button')) return;
        var r = hero.getBoundingClientRect(), b = document.createElement('span');
        b.className = 'brap'; b.textContent = words[Math.floor(Math.random() * words.length)];
        b.style.left = (e.clientX - r.left) + 'px'; b.style.top = (e.clientY - r.top) + 'px';
        var bg = (vibes[vi] || {}).bg || '';
        var cols = pop.filter(function (c) { return c.toLowerCase() !== bg.toLowerCase(); });
        b.style.color = cols[Math.floor(Math.random() * cols.length)];
        b.style.setProperty('--r', (Math.random() * 24 - 12) + 'deg');
        hero.appendChild(b); setTimeout(function () { b.remove(); }, 950);
      });
    },

    tapes: function (root) {
      var tapes = $$('[data-tape]', root); if (!tapes.length) return;
      var x = 0, lastY = window.scrollY, vel = 0;
      (function loop() {
        if (!root.isConnected) return;
        var dy = window.scrollY - lastY; lastY = window.scrollY; vel += (dy - vel) * 0.1;
        x -= 0.6 + Math.abs(vel) * 0.25;
        var w = tapes[0].scrollWidth / 2; if (-x > w) x += w;
        tapes.forEach(function (t) { t.style.transform = 'translateX(' + (t.hasAttribute('data-reverse') ? (-w - x) : x) + 'px)'; });
        if (!reduce) requestAnimationFrame(loop);
      })();
    },

    grid: function (root) {
      var tabs = $('[data-tabs]', root);
      if (tabs) tabs.addEventListener('click', function (e) {
        var t = e.target.closest('.tab'); if (!t) return;
        $$('.tab', tabs).forEach(function (x) { x.classList.toggle('on', x === t); });
        $$('.card', root).forEach(function (c) { c.style.display = (t.dataset.f === 'all' || c.dataset.type === t.dataset.f) ? '' : 'none'; });
      });
      $$('.card__m', root).forEach(function (m) {
        var hang = $('[data-swing]', m), sw = hang && J ? J.swing(hang, { k: 46, c: 2.2, max: 16 }) : null;
        m.addEventListener('pointerenter', function (e) { if (sw) { var r = m.getBoundingClientRect(); sw.kick(((e.clientX - r.left) / r.width - 0.5) * -110); } });
        m.addEventListener('pointermove', function (e) {
          if (sw) sw.kick((e.movementX || 0) * 0.35);
          var r = m.getBoundingClientRect();
          m.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
          m.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
        });
      });
    },

    manifesto: function (root) {
      var box = $('[data-words]', root); if (!box || box.dataset.ready) return; box.dataset.ready = '1';
      // split into words; <em> words get highlighted
      var out = [];
      (function walk(node, hl) {
        node.childNodes.forEach(function (n) {
          if (n.nodeType === 3) n.textContent.split(/\s+/).filter(Boolean).forEach(function (w) { out.push('<span class="w' + (hl ? ' hl' : '') + '">' + esc(w) + '</span>'); });
          else if (n.nodeType === 1) walk(n, hl || /^(EM|I|STRONG|B)$/.test(n.tagName));
        });
      })(box, false);
      box.innerHTML = out.join(' ');
      var words = $$('.w', box);
      function onScroll() {
        var r = root.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.8)));
        var lit = Math.floor(p * words.length);
        words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
      }
      window.addEventListener('scroll', function () { requestAnimationFrame(onScroll); }, { passive: true });
      onScroll();
      $$('.stk', root).forEach(function (s) {
        var sx, sy, ox, oy;
        s.addEventListener('pointerdown', function (e) {
          s.setPointerCapture(e.pointerId);
          var r = s.getBoundingClientRect(), pr = s.offsetParent.getBoundingClientRect();
          ox = r.left - pr.left; oy = r.top - pr.top; sx = e.clientX; sy = e.clientY;
          s.style.left = ox + 'px'; s.style.top = oy + 'px'; s.style.zIndex = 10;
        });
        s.addEventListener('pointermove', function (e) {
          if (!s.hasPointerCapture(e.pointerId)) return;
          s.style.left = (ox + e.clientX - sx) + 'px'; s.style.top = (oy + e.clientY - sy) + 'px';
          s.style.rotate = ((e.clientX - sx) * 0.08) + 'deg';
        });
      });
    },

    customizer: function (root) {
      var stage = $('[data-stage]', root), flip = $('[data-flip]', root);
      var front = $('[data-face="front"]', root), back = $('[data-face="back"]', root);
      var nameIn = $('[data-name-input]', root), numIn = $('[data-num-input]', root);
      var form = $('[data-cfg-form]', root), btn = $('[data-add]', form), idIn = $('input[name="id"]', form);
      var vjson = $('[data-variants]', root), variants = vjson ? JSON.parse(vjson.textContent) : null;
      var st = { model: null, type: 'hockey', colors: null, cwName: '', size: null };
      var m0 = $('[data-model].on', root) || $('[data-model]', root); if (m0) { st.model = m0.dataset.model; st.type = m0.dataset.type; }
      var c0 = $('.sw.on', root) || $('.sw', root); if (c0) { st.colors = c0.dataset.colors; st.cwName = c0.dataset.name; }
      var s0 = $('[data-size].on', root) || $('[data-size]', root); if (s0) st.size = s0.dataset.size;
      var rot = J.rotator(stage, flip);
      $('[data-turn]', root).addEventListener('click', function () { rot.toggle(); });

      function draw(only) {
        var c = J.parse(st.colors);
        J.apply(stage, c);
        var sw = $('.sw.on', root); if (sw) stage.style.setProperty('--cfg-bg', sw.dataset.bg);
        if (only === 'colors') return;
        var o = { name: nameIn.value.trim() || 'BUTTI', num: numIn.value || '00', capt: true };
        front.innerHTML = J.svg(st.type, 'front', o); back.innerHTML = J.svg(st.type, 'back', o);
      }
      function sync() {
        $('[data-prop-name]', form).value = nameIn.value.trim() || 'BUTTI';
        $('[data-prop-num]', form).value = numIn.value || '00';
        $('[data-prop-colors]', form).value = st.cwName;
        if (!variants) return;
        var hasModel = variants.some(function (v) { return v.options.indexOf(st.model) > -1; });
        var v = variants.filter(function (x) { return x.options.indexOf(st.size) > -1 && (!hasModel || x.options.indexOf(st.model) > -1); })[0];
        if (!v) { btn.disabled = true; btn.textContent = TB.strings.unavailable; return; }
        idIn.value = v.id; btn.disabled = !v.available;
        btn.textContent = v.available ? TB.strings.add + ' — ' + v.price : TB.strings.soldOut;
        var price = $('[data-cfg-price]', root); if (price) price.textContent = v.price;
      }
      var sewT;
      function sew() { back.classList.remove('tbj-new'); void back.offsetWidth; back.classList.add('tbj-new'); clearTimeout(sewT); sewT = setTimeout(function () { back.classList.remove('tbj-new'); }, 1200); }
      draw(); sync();
      root.addEventListener('click', function (e) {
        var m = e.target.closest('[data-model]'), c = e.target.closest('.sw'), s = e.target.closest('[data-size]');
        if (m && m.dataset.model !== st.model) {
          $$('[data-model]', root).forEach(function (x) { x.classList.toggle('on', x === m); });
          st.model = m.dataset.model; st.type = m.dataset.type; sync();
          var out = flip.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.9 }], { duration: 180, easing: 'ease-in' });
          out.finished.then(function () { draw(); flip.animate([{ opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1 }], { duration: 420, easing: 'cubic-bezier(.2,1.4,.4,1)' }); });
        } else if (c) {
          $$('.sw', root).forEach(function (x) { x.classList.toggle('on', x === c); });
          st.colors = c.dataset.colors; st.cwName = c.dataset.name; draw('colors'); sync();
        } else if (s) {
          $$('[data-size]', root).forEach(function (x) { x.classList.toggle('on', x === s); });
          st.size = s.dataset.size; sync();
        }
      });
      nameIn.addEventListener('input', function () { nameIn.value = nameIn.value.toUpperCase().replace(/[^A-Z0-9 .'-]/g, ''); draw(); rot.show(true); sew(); sync(); });
      numIn.addEventListener('input', function () { numIn.value = numIn.value.replace(/\D/g, ''); draw(); rot.show(true); sew(); sync(); });
    },

    ride: function (root) {
      var track = $('[data-ride-track]', root), bike = $('[data-bike]', root), bar = $('[data-ride-bar]', root), sticky = $('.ride__s', root);
      var wheels = $$('.wh', bike), lastDust = 0;
      function onScroll() {
        var vh = window.innerHeight, r = root.getBoundingClientRect();
        var total = root.offsetHeight - vh, p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        track.style.transform = 'translateX(' + (-p * (track.scrollWidth - window.innerWidth)) + 'px)';
        var bx = 20 + p * (window.innerWidth - bike.offsetWidth - 40);
        bike.style.transform = 'translate(' + bx + 'px,' + (Math.sin(p * 90) * 4) + 'px) rotate(' + (Math.sin(p * 45) * 3) + 'deg)';
        wheels.forEach(function (w) { w.style.transform = 'rotate(' + (p * 5400) + 'deg)'; });
        bar.style.width = (p * 100) + '%';
        if (!reduce && r.top < 0 && r.bottom > vh && Math.abs(p - lastDust) > 0.006) {
          lastDust = p;
          var d = document.createElement('i'); d.className = 'dust'; d.style.left = (bx + 10) + 'px';
          sticky.appendChild(d); setTimeout(function () { d.remove(); }, 900);
        }
      }
      window.addEventListener('scroll', function () { requestAnimationFrame(onScroll); }, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    },

    plate: function (root) {
      var input = $('[data-plate-in]', root), txt = $('[data-plate-txt]', root), plate = $('[data-plate]', root);
      input.addEventListener('input', function () {
        input.value = input.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
        txt.textContent = input.value || ' ';
        if (plate.animate) plate.animate([{ transform: 'rotate(-3deg) scale(1)' }, { transform: 'rotate(-1deg) scale(1.03)' }, { transform: 'rotate(-3deg) scale(1)' }], { duration: 250 });
      });
    },

    product: function (root) { initProduct(root); },

    footer: function (root) {
      var fw = $('[data-fit]', root); if (!fw) return;
      if (!fw.dataset.ready) {
        fw.dataset.ready = '1';
        fw.innerHTML = fw.textContent.split('').map(function (ch) { return ch === ' ' ? '<i>&nbsp;</i>' : '<i>' + esc(ch) + '</i>'; }).join('');
      }
      function fit() { fw.style.fontSize = '100px'; var w = fw.getBoundingClientRect().width; if (w) fw.style.fontSize = Math.floor(100 * fw.parentElement.clientWidth / w * 0.99) + 'px'; }
      fit(); window.addEventListener('resize', fit); if (document.fonts) document.fonts.ready.then(fit);
    }
  };

  /* ---------------- generic: countdown, reveal ---------------- */
  function initCountdowns(root) {
    $$('[data-countdown]', root).forEach(function (cd) {
      var target = new Date(cd.dataset.countdown).getTime(); if (isNaN(target)) { cd.hidden = true; return; }
      var pad = function (n) { return String(n).padStart(2, '0'); };
      function tick() {
        var diff = Math.max(0, target - Date.now());
        var v = { d: Math.floor(diff / 864e5), h: Math.floor(diff % 864e5 / 36e5), m: Math.floor(diff % 36e5 / 6e4), s: Math.floor(diff % 6e4 / 1e3) };
        $$('[data-u]', cd).forEach(function (b) { b.textContent = pad(v[b.dataset.u]); });
      }
      tick(); setInterval(tick, 1000);
    });
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;

  function init(root) {
    if (J) J.hydrate(root);
    $$('[data-tb]', root).concat(root.matches && root.matches('[data-tb]') ? [root] : []).forEach(function (el) {
      var fn = inits[el.dataset.tb];
      if (fn && !el.dataset.tbInit) { el.dataset.tbInit = '1'; try { fn(el); } catch (err) { console.error('[TB]', el.dataset.tb, err); } }
    });
    initCountdowns(root);
    $$('.rv', root).forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 70) + 'ms'; if (io) io.observe(el); else el.classList.add('in'); });
  }

  /* ---------------- loader + cursor ---------------- */
  function loader() {
    var l = $('#loader'); if (!l) return;
    var done = function () { l.classList.add('done'); lock(false); setTimeout(function () { l.remove(); }, 1000); };
    if (reduce || window.Shopify && window.Shopify.designMode) { l.remove(); return; }
    lock(true);
    var t0 = performance.now(), dur = 1500, rpm = $('[data-rpm]', l), bar = $('[data-rpmbar]', l);
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      rpm.textContent = String(Math.round(e * 12000)).padStart(4, '0'); bar.style.width = (e * 100) + '%';
      if (p < 1) requestAnimationFrame(step); else setTimeout(done, 200);
    })(t0);
    l.addEventListener('click', done);
  }
  function cursor() {
    var cur = $('#cur'); if (!cur || !window.matchMedia('(hover:hover)').matches) { if (cur) cur.remove(); return; }
    var cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', function (e) { cur.classList.toggle('big', !!e.target.closest('a,button,.stk,[data-h]')); });
  }

  function boot() {
    loader(); cursor(); init(document);
    if (TB.cartDrawer && $('#CartDrawer') && window.location.hash === '#cart') openCart();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  /* ---------------- theme editor support ---------------- */
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
  document.addEventListener('shopify:block:select', function (e) {
    var hero = e.target.closest('[data-tb="hero"]');
    if (hero && e.target.hasAttribute('data-vibe')) {
      if (hero._setVibe) hero._setVibe($$('[data-vibe]', hero).indexOf(e.target));
    }
  });

  window.TBTheme = { openCart: openCart, toast: toast, init: init };
})();
