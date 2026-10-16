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
    if (f.matches('[data-product-form]')) {
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

  /* ---------------- car rig: the Team Butti Cadillac (SVG or Higgsfield sprite) ----------------
     set(x, dist, dt): x = horizontal position in px, dist = road travelled in px (spins the wheels).
     Speed drives the trail, exhaust and suspension (squat on throttle, dive on brake). */
  function carRig(car) {
    var wheels = $$('.wh', car), sprite = $('[data-car-sprite]', car), body = $('.car__body', car) || sprite, fx = $$('.car__fx i', car);
    var sp = sprite ? { n: +sprite.dataset.frames || 1, c: +sprite.dataset.cols || 1, r: +sprite.dataset.rows || 1, step: +sprite.dataset.step || 14 } : null;
    var lastDist = null, v = 0, vPrev = 0, pitch = 0, pv = 0, puffAcc = 0;
    function puff(x) {
      if (reduce || !car.parentNode) return;
      var p = document.createElement('i'), w = car.offsetWidth, h = car.offsetHeight;
      p.className = 'puff';
      p.style.left = (x + (car.classList.contains('rev') ? w * 0.95 : w * 0.03)) + 'px';
      p.style.top = (car.offsetTop + h * 0.72) + 'px';
      car.parentNode.appendChild(p); setTimeout(function () { p.remove(); }, 1150);
    }
    return {
      set: function (x, dist, dt) {
        dt = Math.min(0.05, Math.max(0.001, dt || 0.016));
        var w = car.offsetWidth || 1;
        if (lastDist === null) lastDist = dist;
        var raw = (dist - lastDist) / dt; lastDist = dist;
        vPrev = v; v += (raw - v) * 0.2;
        var acc = (v - vPrev) / dt, s = Math.abs(v), dir = v < 0 ? -1 : 1;
        car.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        if (sp) {
          var f = ((Math.floor(dist / sp.step) % sp.n) + sp.n) % sp.n, col = f % sp.c, row = Math.floor(f / sp.c);
          sprite.style.backgroundPosition = (sp.c > 1 ? col / (sp.c - 1) * 100 : 0) + '% ' + (sp.r > 1 ? row / (sp.r - 1) * 100 : 0) + '%';
        } else {
          var deg = dist / (w * 40 / 720) * 57.2958;
          wheels.forEach(function (wh) { wh.style.transform = 'rotate(' + deg.toFixed(1) + 'deg)'; });
        }
        if (reduce) return;
        // suspension: spring towards a pitch set by acceleration, plus road bumps at speed
        var target = Math.max(-2.6, Math.min(2.6, -acc * 0.0008));
        pv += ((target - pitch) * 140 - pv * 14) * dt; pitch += pv * dt;
        var bump = Math.sin(dist / 37) * Math.min(1.6, s / 900) + Math.sin(dist / 13) * Math.min(0.6, s / 2500);
        if (body) body.style.transform = 'translateY(' + bump.toFixed(2) + 'px) rotate(' + pitch.toFixed(2) + 'deg)';
        // speed trail ("scia") + chromatic ghost
        car.classList.toggle('rev', v < -30);
        var k = Math.min(1, s / 1400);
        fx.forEach(function (l, i) { l.style.setProperty('--len', (k * w * [0.62, 0.42, 0.3][i]).toFixed(0) + 'px'); l.style.setProperty('--op', (k * [1, 0.9, 0.7][i]).toFixed(2)); });
        var g = Math.min(34, s * 0.02);
        car.style.filter = g > 3 ? 'drop-shadow(' + (-dir * g).toFixed(0) + 'px 0 0 rgba(255,46,147,.5)) drop-shadow(' + (-dir * g * 0.8).toFixed(0) + 'px 0 0 rgba(255,212,0,.38))' : '';
        puffAcc += Math.abs(raw * dt);
        if (s > 120 && puffAcc > 70) { puffAcc = 0; puff(x); }
      }
    };
  }
  // run fn(dt) on every frame while el is on screen
  function whileVisible(el, fn) {
    var on = false, t0 = 0;
    function loop(t) { if (!on) return; var dt = t0 ? (t - t0) / 1000 : 0.016; t0 = t; fn(dt); requestAnimationFrame(loop); }
    if (!('IntersectionObserver' in window)) { on = true; requestAnimationFrame(loop); return; }
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis && !on) { on = true; t0 = 0; requestAnimationFrame(loop); } else if (!vis) on = false;
    }).observe(el);
    fn(0.016);
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
      // floating jerseys (approved concept): parallax + bob
      var floats = $$('[data-float]', hero).map(function (el) {
        var inn = $('.hero__float-in', el);
        inn.innerHTML = J.svg(el.dataset.type, el.dataset.side, { num: el.dataset.num, name: el.dataset.name, capt: true });
        return { el: el, j: inn, depth: +el.dataset.depth || 10 };
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
        floats.forEach(function (f, k) {
          J.apply(f.j, J.parse(v.j[k]));
          if (!reduce && f.j.animate && hero.dataset.ready) f.j.animate([{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.12) rotate(' + (k % 2 ? 8 : -8) + 'deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 520, easing: 'cubic-bezier(.2,1.6,.4,1)' });
        });
      }
      setVibe(0);
      hero.dataset.ready = '1';
      hero._setVibe = function (i) { vi = i; setVibe(i); };
      var btn = $('[data-vibe-btn]', hero);
      if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); vi = (vi + 1) % vibes.length; setVibe(vi); hero._hop(); });
      hero.addEventListener('pointermove', function (e) {
        if (reduce) return;
        var hr = hero.getBoundingClientRect();
        var dx = (e.clientX - hr.left) / hr.width - 0.5, dy = (e.clientY - hr.top) / hr.height - 0.5;
        floats.forEach(function (f) { f.el.style.transform = 'translate(' + (dx * f.depth * 2) + 'px,' + (dy * f.depth * 2) + 'px)'; });
        pegs.forEach(function (p) {
          var r = p.el.getBoundingClientRect();
          var f = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 280);
          if (f > 0) p.s.kick((e.movementX || 0) * 1.3 * f);
        });
      });
      // rotating badge: spread the text evenly around the circle, whatever its length
      $$('.spin-badge__t', hero).forEach(function (t) {
        var fit = function () {
          try {
            var n = t.textContent.length, len = t.getComputedTextLength(); if (!n || !len) return;
            var ls = parseFloat(getComputedStyle(t).letterSpacing) || 0;
            t.style.letterSpacing = Math.max(0, ls + (2 * Math.PI * 80 - 2 - len) / n) + 'px';
          } catch (e) {}
        };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
      });
      // Cadillac crossing the panorama: hops on every vibe change
      var heroCar = $('[data-hero-car]', hero);
      hero._hop = function () {
        if (!heroCar || reduce) return;
        heroCar.classList.remove('hop'); void heroCar.offsetWidth; heroCar.classList.add('hop');
      };
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
        var detailed = document.documentElement.getAttribute('data-jersey-style') === 'detailed';
        var hang = $('[data-swing]', m), sw = hang && J && detailed ? J.swing(hang, { k: 46, c: 2.2, max: 16 }) : null;
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

    ride: function (root) {
      var track = $('[data-ride-track]', root), car = $('[data-car]', root), bar = $('[data-ride-bar]', root), road = $('.road', root);
      var rig = car ? carRig(car) : null, shown = -1;
      function progress() {
        var r = root.getBoundingClientRect(), total = root.offsetHeight - window.innerHeight;
        return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      }
      whileVisible(root, function (dt) {
        var p = progress(); shown = shown < 0 || reduce ? p : shown + (p - shown) * Math.min(1, dt * 9);
        var W = window.innerWidth, travel = track.scrollWidth - W;
        track.style.transform = 'translate3d(' + (-shown * travel).toFixed(1) + 'px,0,0)';
        bar.style.width = (shown * 100) + '%';
        if (road) road.style.setProperty('--road-x', (-shown * travel * 0.35).toFixed(1) + 'px');
        if (rig) { var x = W * 0.03 + shown * (W - car.offsetWidth - W * 0.06); rig.set(x, x + shown * travel * 0.35, dt); }
      });
    },

    vscroll: function (root) {
      var video = $('video', root), bar = $('[data-vbar]', root), journey = $('[data-journey]', root);
      function progress() {
        var r = root.getBoundingClientRect(), total = root.offsetHeight - window.innerHeight;
        return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      }
      if (video) {
        video.pause(); video.muted = true;
        var vShown = 0;
        whileVisible(root, function (dt) {
          var p = progress(); vShown += (p - vShown) * (reduce ? 1 : Math.min(1, dt * 11));
          bar.style.width = (vShown * 100) + '%';
          if (video.duration) { try { video.currentTime = vShown * (video.duration - 0.05); } catch (e) {} }
        });
        return;
      }
      if (!journey) return;
      var car = $('[data-car]', journey), rig = carRig(car), far = $('[data-far]', journey), mid = $('[data-mid]', journey);
      var dash = $('[data-road] i', journey), skies = $$('[data-sky]', journey), sun = $('[data-sun]', journey);
      var kmOut = $('[data-km-out]', journey), placeOut = $('[data-place]', journey);
      var places = (root.dataset.places || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean), kmTot = +root.dataset.km || 300;
      var shown = -1, lastPlace = '';
      var clamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
      whileVisible(root, function (dt) {
        var p = progress(); shown = shown < 0 || reduce ? p : shown + (p - shown) * Math.min(1, dt * 7);
        var W = journey.clientWidth, cw = car.offsetWidth;
        // the car crosses the screen while the landscape scrolls by (parallax: far < mid < road)
        var x = W * 0.02 + shown * (W - cw - W * 0.04);
        var farT = shown * Math.max(0, far.offsetWidth - W), midT = shown * Math.max(0, mid.offsetWidth - W), roadT = midT * 1.5;
        far.style.transform = 'translate3d(' + (-farT).toFixed(1) + 'px,0,0)';
        mid.style.transform = 'translate3d(' + (-midT).toFixed(1) + 'px,0,0)';
        dash.style.transform = 'translate3d(' + (-(roadT % 140)).toFixed(1) + 'px,0,0)';
        rig.set(x, x + roadT, dt);
        // day → golden hour → Milano pink night
        skies[1].style.opacity = clamp01(1 - Math.abs(shown - 0.5) * 2.6).toFixed(3);
        skies[2].style.opacity = clamp01((shown - 0.55) * 2.6).toFixed(3);
        sun.style.transform = 'translate3d(' + (shown * 8) + 'vw,' + (shown * 34) + 'vh,0)';
        root.classList.toggle('is-dusk', shown > 0.62);
        bar.style.width = (shown * 100) + '%';
        if (kmOut) kmOut.textContent = String(Math.round(shown * kmTot)).padStart(3, '0');
        if (placeOut && places.length) {
          var pl = places[Math.min(places.length - 1, Math.floor(shown * places.length))];
          if (pl !== lastPlace) { lastPlace = pl; placeOut.textContent = pl; }
        }
      });
    },

    reel: function (root) {
      var frame = $('[data-reel-frame]', root), clips = $$('[data-clip]', root), chips = $$('[data-chip]', root);
      var tc = $('[data-tc]', root), placeOut = $('[data-place-out]', root), dateOut = $('[data-date-out]', root), sound = $('[data-sound]', root);
      var auto = (+root.dataset.auto || 0) * 1000, cur = 0, muted = true, visible = false, timer = 0, t0 = performance.now(), lastTc = '';
      root.style.setProperty('--auto', (auto / 1000) + 's');
      var vid = function (i) { return clips[i] ? $('video', clips[i]) : null; };
      var pad = function (n) { return String(Math.floor(n)).padStart(2, '0'); };
      function playCur() {
        clips.forEach(function (c, i) {
          var v = vid(i); if (!v) return;
          if (i === cur && visible) { v.muted = muted; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause();
        });
      }
      function runChip() {
        chips.forEach(function (c, k) {
          var bar = $('i', c); if (!bar) return;
          bar.classList.remove('run'); if (k === cur && auto && clips.length > 1) { void bar.offsetWidth; bar.classList.add('run'); }
        });
      }
      function schedule() {
        clearTimeout(timer);
        if (auto && clips.length > 1 && visible) timer = setTimeout(function () { show(cur + 1); }, auto);
      }
      function show(i) {
        cur = (i + clips.length) % clips.length;
        clips.forEach(function (c, k) { c.classList.toggle('on', k === cur); });
        chips.forEach(function (c, k) { c.classList.toggle('on', k === cur); c.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
        if (placeOut) placeOut.textContent = clips[cur].dataset.place || '';
        if (dateOut) dateOut.textContent = clips[cur].dataset.date || '';
        if (!reduce) { frame.classList.remove('glitch'); void frame.offsetWidth; frame.classList.add('glitch'); }
        var v = vid(cur); if (v) { try { v.currentTime = 0; } catch (e) {} }
        t0 = performance.now(); playCur(); runChip(); schedule();
      }
      root._show = show;
      chips.forEach(function (c) { c.addEventListener('click', function (e) { e.stopPropagation(); show(+c.dataset.chip); }); });
      function toggleSound() {
        if (!sound) return;
        muted = !muted; sound.setAttribute('aria-pressed', muted ? 'false' : 'true');
        $('[data-label-off]', sound).hidden = !muted; $('[data-label-on]', sound).hidden = muted;
        playCur();
      }
      if (sound) sound.addEventListener('click', function (e) { e.stopPropagation(); toggleSound(); });
      frame.addEventListener('click', toggleSound);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting; playCur();
          if (visible) { runChip(); schedule(); } else clearTimeout(timer);
        }, { threshold: 0.25 }).observe(frame);
      } else { visible = true; playCur(); schedule(); }
      // scroll: the frame grows from a card to full screen; HUD timecode follows the clip
      whileVisible(root, function () {
        var r = root.getBoundingClientRect(), total = root.offsetHeight - window.innerHeight;
        var p = total > 0 ? Math.min(1, Math.max(0, -r.top / (total * 0.7))) : 1;
        var x = reduce ? 1 : 1 - Math.pow(1 - p, 3);
        root.style.setProperty('--x', x.toFixed(4));
        if (!reduce) frame.style.transform = 'translateY(' + ((1 - x) * 7).toFixed(3) + 'vh) scale(' + (0.58 + 0.42 * x).toFixed(4) + ')';
        var v = vid(cur), s = v && !v.paused ? v.currentTime : (performance.now() - t0) / 1000;
        var out = pad(s / 60) + ':' + pad(s % 60) + ':' + pad((s % 1) * 25);
        if (out !== lastTc) { lastTc = out; tc.textContent = out; }
      });
    },

    mxs: function (root) {
      var world = $('[data-mxs-world]', root), ground = $('[data-mxs-ground]', root), far = $('[data-mxs-far]', root);
      var bike = $('[data-mxs-bike]', root), bar = $('[data-mxs-bar]', root), sticky = $('.mxs__s', root);
      var wheels = $$('.mx__wh', bike), body = $('.mx__body', bike), rider = $('.mx__rider', bike), shadow = $('.mx__shadow', bike);
      var braap = root.dataset.braap || '';
      var chEls = $$('.mxs__ch', root), chapters = chEls.length || 1, lastCh = -1;
      var dirt = getComputedStyle(root).getPropertyValue('--mxs-dirt').trim() || '#d2a55c';
      var STEP = 2, G, Y, ANG, AIR, LAND = [], TAKE = [], PROPS = [], W = 0, H = 0, VW = 0, gx = 0, wb = 0, hu = 0, L = 0;
      // seeded random: the same track on every visit, but every chapter is different
      function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
      var ease = function (t) { return t * t * (3 - 2 * t); };
      // cubic Hermite between (x0,h0,m0) and (x1,h1,m1), slopes in height per px
      var herm = function (x, x0, h0, m0, x1, h1, m1) {
        var d = x1 - x0, t = (x - x0) / d, t2 = t * t, t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * h0 + (t3 - 2 * t2 + t) * d * m0 + (-2 * t3 + 3 * t2) * h1 + (t3 - t2) * d * m1;
      };
      var idx = function (x) { return Math.max(0, Math.min(G.length - 1, Math.round(x / STEP))); };
      var hAt = function (x) { var f = x / STEP, i = Math.max(0, Math.min(G.length - 2, Math.floor(f))), r = Math.min(1, Math.max(0, f - i)); return G[i] * (1 - r) + G[i + 1] * r; };
      var T = function (x) { return H * 0.8 - hAt(x); };
      var S = function (x) { return (T(x - wb / 2) + T(x + wb / 2)) / 2; };

      /* ---- track builder: continuous ground segments; jumps compute their flight first, the ground under it is built from the flight ---- */
      var FL = [];
      var Sg = function (x) { return (hAt(x - wb / 2) + hAt(x + wb / 2)) / 2; };
      function seg(x0, x1, fn) { for (var i = Math.max(0, Math.ceil(x0 / STEP)); i <= Math.min(G.length - 1, Math.floor(x1 / STEP)); i++) G[i] = fn(i * STEP); }
      function Track(R) { this.x = VW * 0.36; this.h = 0; this.R = R; }
      Track.prototype.flat = function (len) { var h = this.h; seg(this.x, this.x + len, function () { return h; }); this.x += len; return this; };
      Track.prototype.waves = function (len, n, amp) {
        var x0 = this.x, h = this.h;
        seg(x0, x0 + len, function (x) { return h + amp * (1 - Math.cos(2 * Math.PI * n * (x - x0) / len)) / 2; });
        this.x += len; return this;
      };
      Track.prototype.climb = function (len, dh) {
        var x0 = this.x, h = this.h; seg(x0, x0 + len, function (x) { return herm(x, x0, h, 0, x0 + len, h + dh, 0); });
        this.x += len; this.h += dh; return this;
      };
      Track.prototype.prop = function (t, dx) { PROPS.push({ t: t, x: this.x + (dx || 0) }); return this; };
      // kind: table | double | dune | drop ; o.h lip height, o.s take-off slope, o.land landing height (share of the apex)
      Track.prototype.jump = function (kind, o) {
        var R = this.R, x0 = this.x, h0 = this.h, hl = hu * o.h * (0.9 + R() * 0.2), s = o.s * (0.95 + R() * 0.1);
        var ramp = 1.7 * hl / s, xL = x0 + ramp, hLip = h0 + hl;
        var rampH = function (x) { return x <= x0 ? h0 : herm(Math.min(x, xL), x0, h0, 0, xL, hLip, s); };
        seg(x0, xL + STEP, rampH);
        // flight from the bike's support (mean of both wheels) when the front wheel reaches the lip
        var xT = xL - wb / 2, sup = function (x) { return (rampH(x - wb / 2) + rampH(x + wb / 2)) / 2; };
        var hT = sup(xT), sT = (sup(xT) - sup(xT - 4)) / 4;
        var f = function (x) { return hT + sT * (x - xT) - gx / 2 * (x - xT) * (x - xT); };
        var xa = xT + sT / gx, hA = f(xa), hd = Math.max(hu * 0.03, (hA - 0) * o.land), xD = xa + Math.sqrt(2 * (hA - hd) / gx), mD = -gx * (xD - xT) + sT;
        var clr = hu * 0.06, span = xD - xL;
        // clearance: zero on the lip, opens up quickly, closes to zero at the landing (tangent touch-down)
        var under = function (x) { return f(x) - clr * Math.min(1, (x - xL) / (span * 0.12)) * Math.pow(Math.max(0, xD - x) / span, 1.2); };
        var shape;
        if (kind === 'table') shape = function () { return hLip; };
        else if (kind === 'drop') shape = function () { return h0 + hl * 0.25; };
        else {
          // gap after the lip (a pit for doubles, a saddle for dunes), then a sloped face up to the landing
          var pit = kind === 'double' ? h0 - hu * (o.pit || 0.04) : h0 + hl * 0.4;
          var xp0 = xL + Math.min(span * 0.24, hu * 0.3), xp1 = Math.max(xp0 + 4, xL + span * 0.4), xf = Math.max(xp1 + span * 0.25, xL + span * 0.78);
          var hF = under(xf), dF = (under(xf + 2) - under(xf - 2)) / 4;
          shape = function (x) {
            if (x < xp0) return herm(x, xL, hLip, 0, xp0, pit, 0);
            if (x < xp1) return pit;
            if (x < xf) return herm(x, xp1, pit, 0, xf, hF, dF);
            return under(x);
          };
        }
        seg(xL + STEP, xD, function (x) { return Math.min(shape(x), under(x)); });
        var xE = xD + Math.min(hu * 1.2, 2 * hd / Math.max(0.15, -mD));
        seg(xD, xE, function (x) { return hd * Math.pow((xE - x) / (xE - xD), 2); });
        FL.push({ xT: xT, f: f, xD: xD });
        PROPS.push({ t: 'flag', x: xL - 6 });
        PROPS.push({ t: kind === 'double' ? 'tyres' : 'hay', x: xE + hu * 0.12 });
        this.x = xE; this.h = 0; return this;
      };

      var PLANS = [
        function (t) { return t.flat(L * 0.05).waves(L * 0.26, 3, hu * 0.035).flat(L * 0.05).jump('table', { h: 0.12, s: 0.6, land: 0.45 }); },
        function (t) { return t.flat(L * 0.04).waves(L * 0.3, 6, hu * 0.02).prop('cones', -L * 0.15).flat(L * 0.05).jump('double', { h: 0.16, s: 0.72, land: 0.4, pit: 0.05 }); },
        function (t) { return t.flat(L * 0.04).climb(L * 0.26, hu * 0.18).flat(L * 0.06).prop('hay', -L * 0.03).jump('drop', { h: 0.04, s: 0.38, land: 0.1 }); },
        function (t) { return t.flat(L * 0.05).waves(L * 0.14, 1, hu * 0.05).flat(L * 0.04).jump('dune', { h: 0.21, s: 0.8, land: 0.42 }); },
        function (t) { return t.flat(L * 0.04).jump('double', { h: 0.1, s: 0.55, land: 0.45, pit: 0.03 }).flat(L * 0.04).waves(L * 0.2, 5, hu * 0.018).flat(L * 0.06).prop('finish', L * 0.1); }
      ];

      function buildTrack() {
        G = new Float32Array(Math.ceil(W / STEP) + 2); PROPS = []; FL = [];
        var t = new Track(rng(1969)), CH = (W - VW * 0.6) / chapters;
        for (var k = 0; k < chapters; k++) {
          if (t.x > W - L * 0.6) break;
          if (t.x < k * CH + L * 0.25) t.flat(k * CH + L * 0.25 - t.x);
          PLANS[k % PLANS.length](t);
        }
        if (t.x < W) t.flat(W - t.x + STEP);
      }

      function buildPath() {
        var n = G.length; Y = new Float32Array(n); ANG = new Float32Array(n); AIR = new Uint8Array(n); LAND = []; TAKE = [];
        var base = H * 0.8;
        for (var i = 0; i < n; i++) { var x = i * STEP; Y[i] = base - Sg(x); ANG[i] = Math.atan2(hAt(x - wb / 2) - hAt(x + wb / 2), wb); }
        FL.forEach(function (fl) {
          var i0 = Math.ceil(fl.xT / STEP), j = i0 + 4;
          // land where the flight meets the support again, after the apex
          while (j < n && (fl.f(j * STEP) > Sg(j * STEP) || j * STEP < fl.xT + 40)) j++;
          var a0 = ANG[i0 - 1] || 0, a1 = ANG[Math.min(n - 1, j)], len = j - i0;
          TAKE.push(i0);
          for (var q = i0; q < j && q < n; q++) {
            var t = (q - i0) / len;
            Y[q] = base - fl.f(q * STEP); AIR[q] = 1; ANG[q] = a0 + (a1 - a0) * ease(t) - Math.sin(Math.PI * t) * 0.05;
          }
          var vf = fl.f(j * STEP) - fl.f(j * STEP - 2), vg = Sg(j * STEP) - Sg(j * STEP - 2);
          LAND.push({ i: j, v: Math.min(1, 0.3 + Math.abs(vf - vg) * 0.8) });
        });
      }

      function drawGround() {
        var pts = [], rut = [], grass = '', props = '';
        var Td = function (x) { return (T(x - 8) + T(x - 4) + T(x) + T(x + 4) + T(x + 8)) / 5; };
        for (var xx = 0; xx <= W; xx += 6) { var ty = Td(xx); pts.push(xx.toFixed(0) + ' ' + ty.toFixed(1)); rut.push(xx.toFixed(0) + ' ' + (ty + H * 0.03).toFixed(1)); }
        var R = rng(77);
        for (var gq = VW * 0.05; gq < W; gq += VW * (0.05 + R() * 0.08)) { var gy = Td(gq); grass += 'M' + gq.toFixed(0) + ' ' + gy.toFixed(0) + 'l-4 -12M' + gq.toFixed(0) + ' ' + gy.toFixed(0) + 'l2 -15M' + gq.toFixed(0) + ' ' + gy.toFixed(0) + 'l7 -10'; }
        var u = Math.max(0.7, H / 900);
        PROPS.forEach(function (p) {
          var x = p.x, y = Td(x);
          if (p.t === 'flag') props += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') scale(' + u + ')"><path d="M0 0V-70" stroke="#0d0d0d" stroke-width="3"/><path d="M0 -70L30 -62L0 -54Z" fill="#ff2e93" stroke="#0d0d0d" stroke-width="2.5" stroke-linejoin="round"/></g>';
          if (p.t === 'hay') props += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') scale(' + u + ')"><rect x="-34" y="-34" width="68" height="36" rx="8" fill="#e8c66f" stroke="#0d0d0d" stroke-width="2.5"/><path d="M-26 -24h52M-26 -14h52" stroke="#b98d35" stroke-width="2"/><rect x="-14" y="-31" width="28" height="22" fill="#f4f1ea" stroke="#0d0d0d" stroke-width="2"/><text x="0" y="-14" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="16" fill="#0d0d0d">69</text></g>';
          if (p.t === 'tyres') props += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') scale(' + u + ')"><g fill="#1a1a1a" stroke="#0d0d0d" stroke-width="2"><rect x="-26" y="-14" width="52" height="15" rx="7"/><rect x="-24" y="-27" width="48" height="14" rx="7"/><rect x="-22" y="-40" width="44" height="14" rx="7"/></g><path d="M-20 -33h40M-22 -20h44" stroke="#ffd400" stroke-width="3"/></g>';
          if (p.t === 'cones') for (var c = -1; c <= 1; c++) props += '<path transform="translate(' + (x + c * VW * 0.09).toFixed(0) + ' ' + Td(x + c * VW * 0.09).toFixed(0) + ') scale(' + u + ')" d="M-8 0L0 -24L8 0Z" fill="#ff7a1a" stroke="#0d0d0d" stroke-width="2" stroke-linejoin="round"/>';
          if (p.t === 'finish') props += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') scale(' + u + ')"><path d="M-110 0V-150M110 0V-150" stroke="#0d0d0d" stroke-width="6"/><rect x="-118" y="-170" width="236" height="44" fill="#ff2e93" stroke="#0d0d0d" stroke-width="3"/><text x="0" y="-136" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="30" fill="#0d0d0d">TEAM BUTTI</text><g fill="#0d0d0d">' + (function () { var s = ''; for (var q = 0; q < 12; q++) s += '<rect x="' + (-118 + q * 19.7).toFixed(1) + '" y="' + (q % 2 ? -126 : -118) + '" width="19.7" height="8"/>'; return s; })() + '</g></g>';
        });
        ground.setAttribute('viewBox', '0 0 ' + W + ' ' + H); ground.setAttribute('width', W); ground.setAttribute('height', H);
        ground.innerHTML = '<defs><linearGradient id="mxs-dirt-' + root.id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + dirt + '"/><stop offset="1" stop-color="#8a5a2b"/></linearGradient></defs>' +
          '<path d="M0 ' + H + 'L' + pts.join('L') + 'L' + W + ' ' + H + 'Z" fill="url(#mxs-dirt-' + root.id + ')"/>' +
          '<path d="M' + pts.join('L') + '" fill="none" stroke="#0d0d0d" stroke-width="3"/>' +
          '<path d="M' + rut.join('L') + '" fill="none" stroke="rgba(90,56,22,.35)" stroke-width="3" stroke-dasharray="26 18"/>' +
          '<path d="' + grass + '" fill="none" stroke="#5f6f2e" stroke-width="3" stroke-linecap="round"/>' + props;
      }

      // far Tuscany, generated: rolling hills with borghi, cypress alleys, farmhouses, pines, vineyards and hay rolls
      function drawFar() {
        if (!far) return;
        var fw = far.offsetWidth, fh = far.offsetHeight; if (!fw || !fh) return;
        var R = rng(2019), back = [], front = [], items = '', bi = '', vines = '';
        var hill = function (x, ph, amp, base) { return fh * base - fh * amp * (0.55 * Math.sin(x / (fw * 0.07) + ph) + 0.3 * Math.sin(x / (fw * 0.031) + ph * 2.1) + 0.15 * Math.sin(x / (fw * 0.013) + ph * 3.7)); };
        for (var x = 0; x <= fw; x += 8) { back.push(x + ' ' + hill(x, 0.4, 0.16, 0.42).toFixed(1)); front.push(x + ' ' + hill(x, 2.2, 0.12, 0.7).toFixed(1)); }
        var cyp = function (cx, by, h, col) { cx = +cx; by = +by; var w = h * 0.13, n = function (v) { return v.toFixed(1); }; return '<path d="M' + n(cx) + ' ' + n(by) + 'C' + n(cx - w) + ' ' + n(by - h * 0.32) + ' ' + n(cx - w * 0.6) + ' ' + n(by - h * 0.86) + ' ' + n(cx) + ' ' + n(by - h) + 'C' + n(cx + w * 0.6) + ' ' + n(by - h * 0.86) + ' ' + n(cx + w) + ' ' + n(by - h * 0.32) + ' ' + n(cx) + ' ' + n(by) + 'Z" fill="' + col + '"/>'; };
        for (var px = fw * 0.03; px < fw; px += fw * (0.06 + R() * 0.07)) {
          var kind = Math.floor(R() * 6), by = hill(px, 0.4, 0.16, 0.42) + 3, fy = hill(px, 2.2, 0.12, 0.7) + 3, s = fh / 300;
          if (kind === 0) { // borgo with towers on the back hill
            var t = '';
            for (var q = 0; q < 5; q++) { var tw = (8 + R() * 6) * s, th = (30 + R() * 50) * s, tx = px + q * 14 * s; t += '<rect x="' + tx.toFixed(1) + '" y="' + (by - th).toFixed(1) + '" width="' + tw.toFixed(1) + '" height="' + (th + 6).toFixed(1) + '"/>'; }
            bi += '<g fill="#b3b97f">' + t + '<rect x="' + (px - 6 * s).toFixed(1) + '" y="' + (by - 18 * s).toFixed(1) + '" width="' + (84 * s).toFixed(1) + '" height="' + (24 * s).toFixed(1) + '"/></g>';
          } else if (kind === 1) { // cypress alley climbing to a villa
            for (var c = 0; c < 6; c++) { var cx = px + c * 16 * s; items += cyp(cx.toFixed(1), (hill(cx, 2.2, 0.12, 0.7) + 4).toFixed(1), (38 + c * 4) * s, '#5c6f30'); }
            items += '<path d="M' + (px + 100 * s) + ' ' + (fy + 2) + 'v' + (-26 * s) + 'l' + (22 * s) + ' ' + (-12 * s) + 'l' + (22 * s) + ' ' + (12 * s) + 'v' + (26 * s) + 'Z" fill="#6d7c3a"/>';
          } else if (kind === 2) { // umbrella pine pair
            for (var pp = 0; pp < 2; pp++) { var ux = px + pp * 46 * s, uy = hill(ux, 2.2, 0.12, 0.7) + 4; items += '<path d="M' + (ux - 2 * s) + ' ' + uy + 'l' + (2 * s) + ' ' + (-34 * s) + 'h' + (4 * s) + 'l' + (2 * s) + ' ' + (34 * s) + 'Z" fill="#4f6129"/><ellipse cx="' + (ux + 2 * s) + '" cy="' + (uy - 38 * s) + '" rx="' + (30 * s) + '" ry="' + (10 * s) + '" fill="#4f6129"/>'; }
          } else if (kind === 3) { // vineyard rows on the front hill
            for (var v = 0; v < 7; v++) vines += 'M' + (px + v * 9 * s).toFixed(1) + ' ' + (fy + 14 * s).toFixed(1) + 'l' + (26 * s).toFixed(1) + ' ' + (-20 * s).toFixed(1);
          } else if (kind === 4) { // hay rolls
            for (var hr = 0; hr < 3; hr++) { var hx = px + hr * 24 * s; items += '<circle cx="' + hx.toFixed(1) + '" cy="' + (hill(hx, 2.2, 0.12, 0.7) - 6 * s).toFixed(1) + '" r="' + (8 * s).toFixed(1) + '" fill="#d8b866" stroke="#a88a3f" stroke-width="2"/>'; }
          } else { // lone cypress pair on the back hill
            items += cyp(px.toFixed(1), (by + 2).toFixed(1), 40 * s, '#97a160') + cyp((px + 12 * s).toFixed(1), (by + 2).toFixed(1), 32 * s, '#97a160');
          }
        }
        far.style.background = 'none';
        far.innerHTML = '<svg width="' + fw + '" height="' + fh + '" viewBox="0 0 ' + fw + ' ' + fh + '" aria-hidden="true" focusable="false" style="display:block">' +
          '<path d="M0 ' + fh + 'L' + back.join('L') + 'L' + fw + ' ' + fh + 'Z" fill="#c3c68e"/>' + bi +
          '<path d="M0 ' + fh + 'L' + front.join('L') + 'L' + fw + ' ' + fh + 'Z" fill="#93a057"/>' +
          '<path d="' + vines + '" stroke="#6f7f3a" stroke-width="3" stroke-linecap="round"/>' + items + '</svg>';
      }

      function build() {
        // everything scales with the bike: same jumps (relative to the bike) on a phone and on a big screen
        VW = window.innerWidth; H = sticky.clientHeight; W = world.offsetWidth;
        var bw0 = bike.offsetWidth || 300; wb = bw0 * 226 / 420; L = bw0 * 4.5; hu = Math.min(H * 0.95, bw0 * 3.2); gx = 0.62 / bw0;
        buildTrack(); buildPath(); drawGround(); drawFar();
      }
      build();
      var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { build(); last = -1; }, 150); });
      var shown = -1, last = -1, comp = 0, compV = 0, roostAcc = 0;
      function fx(cls, x, y, vars, ms) {
        if (reduce) return;
        var el = document.createElement('i'); el.className = cls; el.style.left = x + 'px'; el.style.top = y + 'px';
        Object.keys(vars || {}).forEach(function (k) { el.style.setProperty(k, vars[k]); });
        sticky.appendChild(el); setTimeout(function () { el.remove(); }, ms || 900);
      }
      function progress() {
        var r = root.getBoundingClientRect(), total = root.offsetHeight - window.innerHeight;
        return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      }
      whileVisible(root, function (dt) {
        dt = Math.min(0.05, dt || 0.016);
        var p = progress(); shown = shown < 0 || reduce ? p : shown + (p - shown) * Math.min(1, dt * 8);
        var travel = Math.max(0, W - VW), tx = shown * travel;
        world.style.transform = 'translate3d(' + (-tx).toFixed(1) + 'px,0,0)';
        far.style.transform = 'translate3d(' + (-shown * Math.max(0, far.offsetWidth - VW)).toFixed(1) + 'px,0,0)';
        bar.style.width = (shown * 100) + '%';
        // phones: the chapters are far apart, so the current one stays pinned on screen and cross-fades
        if (VW < 800) {
          var CH = (W - VW * 0.6) / chapters, act = Math.max(0, Math.min(chapters - 1, Math.floor((tx + VW * 0.5) / CH)));
          chEls.forEach(function (c, k) { c.style.transform = 'translate3d(' + (tx - k * CH).toFixed(1) + 'px,0,0)'; if (act !== lastCh) c.classList.toggle('on', k === act); });
          lastCh = act;
        } else if (lastCh !== -1) { chEls.forEach(function (c) { c.style.transform = ''; c.classList.remove('on'); }); lastCh = -1; }
        var bw = bike.offsetWidth, bx = VW * (VW < 800 ? 0.3 : 0.24), wx = tx + bx;
        var i = idx(wx), y = Y[i], ang = ANG[i] * 57.2958, inAir = AIR[i] === 1;
        // events while riding forward: take-off (BRAAAP), landing (suspension + dust), roost on the ground
        if (last >= 0 && i > last && i - last < 400) {
          TAKE.forEach(function (t) { if (t > last && t <= i && braap) fx('braap', bx + bw * 0.1, y - bw * 0.6, null, 1000); });
          LAND.forEach(function (l) {
            if (l.i > last && l.i <= i) {
              compV += 260 * l.v;
              for (var q = 0; q < 4; q++) fx('dustb', bx + (q - 1.5) * bw * 0.22, y - 4, { '--dx': ((q - 1.5) * 34) + 'px', '--sz': (bw * (0.28 + l.v * 0.22)).toFixed(0) + 'px' }, 1100);
            }
          });
          roostAcc += (i - last) * STEP;
          if (!inAir && roostAcc > 26) {
            roostAcc = 0;
            for (var r = 0; r < 3; r++) fx('roost', bx - bw * 0.27, y - 8 - Math.random() * 10, { '--dx': (-60 - Math.random() * 90) + 'px', '--dy': (-30 - Math.random() * 60) + 'px', '--sz': (5 + Math.random() * 7) + 'px', '--c': ['#a9783a', '#8a5a2b', '#c9a46a'][r] }, 700);
          }
        }
        last = i;
        compV += (-comp * 180 - compV * 16) * dt; comp += compV * dt; comp = Math.max(-6, Math.min(16, comp));
        var bump = inAir ? 0 : Math.sin(wx / 23) * 1.2;
        bike.style.transform = 'translate3d(' + (bx - bw * 0.488).toFixed(1) + 'px,' + (y - bike.offsetHeight * 0.967).toFixed(1) + 'px,0) rotate(' + ang.toFixed(2) + 'deg)';
        if (body) body.style.transform = 'translateY(' + (comp * 0.5 + bump).toFixed(2) + 'px)';
        if (shadow) shadow.style.opacity = inAir ? '0' : '';
        if (rider) rider.style.transform = inAir ? 'translateY(-3px) rotate(-4deg)' : 'translateY(' + (comp * 0.4).toFixed(2) + 'px)';
        var deg = wx / (bw * 48 / 420) * 57.2958;
        wheels.forEach(function (w) { w.style.transform = 'rotate(' + deg.toFixed(1) + 'deg)'; });
      });
      root._mx = { get: function () { return { G: G, Y: Y, AIR: AIR, TAKE: TAKE, LAND: LAND, FL: FL, W: W, STEP: STEP, base: H * 0.8, S: S, T: T, Sg: Sg, gx: gx, wb: wb, hu: hu }; } };
    },

    story: function (root) {
      var frame = $('[data-story-frame]', root), play = $('[data-story-play]', root);
      if (frame && !reduce && window.matchMedia('(hover:hover)').matches) {
        frame.addEventListener('pointermove', function (e) {
          var r = frame.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          frame.style.transform = 'perspective(1200px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
        });
        frame.addEventListener('pointerleave', function () { frame.style.transform = ''; });
      }
      if (!play) return;
      play.addEventListener('click', function () {
        var video = $('[data-story-media] video', root), embed = $('[data-story-embed]', root);
        if (video) {
          video.muted = false; video.loop = false; video.controls = true; video.currentTime = 0;
          var pr = video.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (embed) {
          var id = encodeURIComponent(embed.dataset.id), src = embed.dataset.provider === 'vimeo'
            ? 'https://player.vimeo.com/video/' + id + '?autoplay=1'
            : 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
          embed.innerHTML = '<iframe src="' + src + '" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
        }
        root.classList.add('is-playing');
      });
    },

    crew: function (root) {
      var rows = $$('[data-crew-row]', root), pols = $$('[data-pol]', root), lb = $('[data-crew-lb]', root);
      if (root.dataset.motion === 'false' || reduce) root.classList.add('crew--static');
      else {
        // first row slides left, second row right, as the wall crosses the screen
        var shown = -1;
        whileVisible(root, function (dt) {
          var r = root.getBoundingClientRect(), vh = window.innerHeight;
          var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
          shown = shown < 0 ? p : shown + (p - shown) * Math.min(1, dt * 8);
          var W = root.clientWidth;
          rows.forEach(function (row) {
            var travel = Math.max(0, row.scrollWidth - W), x = row.hasAttribute('data-reverse') ? -travel * (1 - shown) : -travel * shown;
            row.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
          });
        });
      }
      if (!lb || !lb.showModal) return;
      var img = $('[data-lb-img]', lb), cap = $('[data-lb-cap]', lb), fig = $('.crew__lbf', lb), cur = 0, sx = null;
      function show(i) {
        cur = (i + pols.length) % pols.length;
        var b = pols[cur]; img.width = +b.dataset.iw || 4; img.height = +b.dataset.ih || 5; img.src = b.dataset.full; img.alt = b.dataset.cap || ''; cap.textContent = b.dataset.cap || '';
        fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = '';
      }
      pols.forEach(function (b, i) { b.addEventListener('click', function () { show(i); lb.showModal(); }); });
      lb.addEventListener('click', function (e) {
        var st = e.target.closest('[data-lb-step]');
        if (st) show(cur + +st.dataset.lbStep);
        else if (e.target === lb || e.target.closest('[data-lb-close]')) lb.close();
      });
      lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1); });
      fig.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      fig.addEventListener('pointerup', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(cur + (e.clientX < sx ? 1 : -1)); sx = null; });
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
    splitTitles(root);
    $$('.rv', root).forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 70) + 'ms'; if (io) io.observe(el); else el.classList.add('in'); });
  }

  /* ---------------- effects: split titles, magnetic buttons, page wipe ---------------- */
  var html = document.documentElement;
  var splitIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('split-in'); splitIO.unobserve(e.target); } });
  }, { threshold: 0.2 }) : null;
  function splitTitles(root) {
    if (!html.hasAttribute('data-split-titles') || reduce) return;
    $$('.sec__title, .poster__t, .stop__t, .vscroll__t', root).forEach(function (h) {
      if (h.dataset.split) return; h.dataset.split = '1';
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (word) {
              if (!word) return;
              if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(word)); return; }
              var w = document.createElement('span'); w.className = 'wd';
              word.split('').forEach(function (ch) {
                var c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c.style.setProperty('--i', i++);
                w.appendChild(c);
              });
              frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      })(h);
      h.classList.add('split');
      if (splitIO) splitIO.observe(h); else h.classList.add('split-in');
    });
  }
  function magnetic() {
    if (!html.hasAttribute('data-magnetic') || reduce || !window.matchMedia('(hover:hover)').matches) return;
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn');
      $$('.btn.is-mag').forEach(function (x) { if (x !== b) { x.classList.remove('is-mag'); x.style.translate = ''; } });
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.classList.add('is-mag');
      b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px';
    });
  }
  function pageWipe() {
    var wipe = $('#wipe'); if (!wipe || reduce) { if (wipe) wipe.remove(); return; }
    requestAnimationFrame(function () { wipe.classList.add('out'); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.closest('[data-quick]') || a.hasAttribute('data-cart-open')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      if (/^\/(checkout|account|cart\/change)/.test(url.pathname)) return;
      e.preventDefault();
      wipe.classList.remove('out'); wipe.classList.add('in');
      setTimeout(function () { location.href = url.href; }, 420);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { wipe.classList.remove('in'); wipe.classList.add('out'); } });
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
    loader(); cursor(); magnetic(); pageWipe(); init(document);
    if (TB.cartDrawer && $('#CartDrawer') && window.location.hash === '#cart') openCart();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  /* ---------------- theme editor support ---------------- */
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
  document.addEventListener('shopify:block:select', function (e) {
    var reel = e.target.closest('[data-tb="reel"]');
    if (reel && reel._show && e.target.hasAttribute('data-clip')) reel._show($$('[data-clip]', reel).indexOf(e.target));
    var hero = e.target.closest('[data-tb="hero"]');
    if (hero && e.target.hasAttribute('data-vibe')) {
      if (hero._setVibe) hero._setVibe($$('[data-vibe]', hero).indexOf(e.target));
    }
  });

  window.TBTheme = { openCart: openCart, toast: toast, init: init };
})();
