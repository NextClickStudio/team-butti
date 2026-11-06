/*
 * TEAM BUTTI — jersey renderer + motion helpers.
 * Shared by preview/index.html and the Shopify theme (assets/tb-jersey.js).
 * Colors come from CSS custom properties on a wrapper (--jb base, --js sleeves/yoke,
 * --jt trim, --jx lettering), so colorways animate smoothly without re-rendering.
 */
(function (w, d) {
  'use strict';

  var VB = '0 0 400 440';
  var FONT_BLOCK = "Graduate, 'Anton', Impact, sans-serif";
  var FONT_COND = "'Anton', Impact, 'Arial Narrow', sans-serif";

  // Flat silhouettes (300x300) used by the approved concept
  var FLAT = {
    hockey: 'M95 40 L128 30 Q150 52 172 30 L205 40 L268 72 L286 150 L246 160 L234 122 L234 272 L66 272 L66 122 L54 160 L14 150 L32 72 Z',
    mx: 'M100 38 L130 30 Q150 50 170 30 L200 38 L254 60 L292 204 L262 214 L232 124 L232 272 L68 272 L68 124 L38 214 L8 204 L46 60 Z',
    football: 'M96 44 L128 34 Q150 54 172 34 L204 44 L262 64 L274 132 L232 138 L230 272 L70 272 L68 138 L26 132 L38 64 Z'
  };

  var G = {
    hockey: {
      body: 'M160 40 Q200 54 240 40 L305 62 Q298 108 282 150 L290 405 Q200 416 110 405 L118 150 Q102 108 95 62 Z',
      sl: 'M95 62 Q55 110 22 205 L82 235 Q100 190 118 150 Q102 108 95 62 Z',
      sr: 'M305 62 Q345 110 378 205 L318 235 Q300 190 282 150 Q298 108 305 62 Z',
      cuffL: [[22, 205], [82, 235]], cuffR: [[378, 205], [318, 235]],
      seams: ['M95 62 Q102 108 118 150', 'M305 62 Q298 108 282 150', 'M114 396 Q200 407 286 396'],
      folds: ['M128 165 Q150 230 138 310', 'M272 165 Q252 235 262 312', 'M58 118 Q80 160 68 200', 'M342 118 Q320 160 332 200', 'M150 390 Q200 378 250 392']
    },
    mx: {
      body: 'M165 42 Q200 58 235 42 L252 50 Q260 110 270 150 L276 410 Q200 420 124 410 L130 150 Q140 110 148 50 Z',
      sl: 'M165 42 L148 50 Q140 110 130 150 Q104 230 62 346 L14 332 Q32 200 60 112 Q80 64 165 42 Z',
      sr: 'M235 42 L252 50 Q260 110 270 150 Q296 230 338 346 L386 332 Q368 200 340 112 Q320 64 235 42 Z',
      cuffL: [[14, 332], [62, 346]], cuffR: [[386, 332], [338, 346]],
      seams: ['M148 50 Q140 110 130 150', 'M252 50 Q260 110 270 150', 'M126 401 Q200 411 274 401'],
      folds: ['M138 170 Q152 250 142 330', 'M262 170 Q248 250 258 330', 'M72 140 Q66 220 46 300', 'M328 140 Q334 220 354 300']
    },
    football: {
      body: 'M160 44 Q200 58 240 44 L282 56 L292 170 L288 410 Q200 418 112 410 L108 170 L118 56 Z',
      sl: 'M118 56 Q84 60 74 82 L60 160 L108 172 Z',
      sr: 'M282 56 Q316 60 326 82 L340 160 L292 172 Z',
      cuffL: [[60, 160], [108, 172]], cuffR: [[340, 160], [292, 172]],
      seams: ['M118 56 L108 172', 'M282 56 L292 172', 'M114 401 Q200 410 286 401'],
      folds: ['M132 185 Q150 262 138 342', 'M268 185 Q250 262 262 342', 'M86 92 Q94 128 86 158', 'M314 92 Q306 128 314 158']
    }
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- shared <defs> (clip paths, textures, arcs) ---------- */
  function ensureDefs() {
    if (d.getElementById('tb-jersey-defs')) return;
    var s = '<svg id="tb-jersey-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>';
    Object.keys(G).forEach(function (t) {
      var g = G[t];
      s += '<clipPath id="tb-' + t + '-body"><path d="' + g.body + '"/></clipPath>' +
        '<clipPath id="tb-' + t + '-sl"><path d="' + g.sl + '"/></clipPath>' +
        '<clipPath id="tb-' + t + '-sr"><path d="' + g.sr + '"/></clipPath>' +
        '<clipPath id="tb-' + t + '-all"><path d="' + g.body + '"/><path d="' + g.sl + '"/><path d="' + g.sr + '"/></clipPath>';
    });
    s += '<pattern id="tb-mesh" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".95" fill="#000" fill-opacity=".14"/></pattern>' +
      '<pattern id="tb-knit" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 2h4" stroke="#000" stroke-opacity=".05" stroke-width="1"/></pattern>' +
      '<linearGradient id="tb-shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".16" stop-color="#000" stop-opacity=".05"/><stop offset=".42" stop-color="#fff" stop-opacity=".16"/><stop offset=".6" stop-color="#fff" stop-opacity=".02"/><stop offset=".86" stop-color="#000" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>' +
      '<linearGradient id="tb-vshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>' +
      '<linearGradient id="tb-metal" x1="0" x2="1"><stop offset="0" stop-color="#6d6d6d"/><stop offset=".5" stop-color="#e6e6e6"/><stop offset="1" stop-color="#7a7a7a"/></linearGradient>' +
      '<filter id="tb-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<path id="tb-arc-hf" d="M112 212 Q200 150 288 212"/>' +
      '<path id="tb-arc-hb" d="M118 156 Q200 116 282 156"/>' +
      '<path id="tb-arc-mb" d="M128 140 Q200 112 272 140"/>' +
      Object.keys(FLAT).map(function (t) { return '<clipPath id="tbf-' + t + '"><path d="' + FLAT[t] + '"/></clipPath>'; }).join('') +
      '<linearGradient id="tbf-shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset=".35" stop-color="#fff" stop-opacity=".12"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>' +
      '</defs></svg>';
    var css = '<style id="tb-jersey-css">' +
      '@property --jb{syntax:"<color>";inherits:true;initial-value:#f4f1ea}' +
      '@property --js{syntax:"<color>";inherits:true;initial-value:#0d0d0d}' +
      '@property --jt{syntax:"<color>";inherits:true;initial-value:#9a9a9a}' +
      '@property --jx{syntax:"<color>";inherits:true;initial-value:#0d0d0d}' +
      '.tbj{transition:--jb .6s ease,--js .6s ease,--jt .6s ease,--jx .6s ease}' +
      '.tbj-svg{display:block;width:100%;height:100%;overflow:visible}' +
      '.tbj-stitch{stroke-dashoffset:0}' +
      '.tbj-new .tbj-stitch{animation:tbj-sew 1.1s ease-out both}' +
      '.tbj-new .tbj-fill{animation:tbj-in .45s ease-out both}' +
      '@keyframes tbj-sew{from{stroke-dashoffset:120}}' +
      '@keyframes tbj-in{from{opacity:0;transform:translateY(6px)}}' +
      '</style>';
    d.body.insertAdjacentHTML('beforeend', s);
    d.head.insertAdjacentHTML('beforeend', css);
  }

  /* ---------- helpers ---------- */
  // band parallel to a cuff, offset up the sleeve
  function band(cuff, offset, h, fill) {
    var a = cuff[0], b = cuff[1];
    var ux = b[0] - a[0], uy = b[1] - a[1], len = Math.hypot(ux, uy);
    ux /= len; uy /= len;
    var nx = -uy, ny = ux;
    if (ny > 0) { nx = -nx; ny = -ny; }
    var cx = (a[0] + b[0]) / 2 + nx * offset, cy = (a[1] + b[1]) / 2 + ny * offset;
    var ang = Math.atan2(uy, ux) * 180 / Math.PI;
    if (ang > 90) ang -= 180;
    if (ang < -90) ang += 180;
    return '<rect x="' + (cx - 160).toFixed(1) + '" y="' + (cy - h / 2).toFixed(1) + '" width="320" height="' + h +
      '" transform="rotate(' + ang.toFixed(2) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')" style="fill:' + fill + '"/>';
  }
  function cuffAngle(cuff) {
    var ang = Math.atan2(cuff[1][1] - cuff[0][1], cuff[1][0] - cuff[0][0]) * 180 / Math.PI;
    if (ang > 90) ang -= 180;
    if (ang < -90) ang += 180;
    return ang;
  }
  function cuffPoint(cuff, offset) {
    var a = cuff[0], b = cuff[1];
    var ux = b[0] - a[0], uy = b[1] - a[1], len = Math.hypot(ux, uy);
    var nx = -uy / len, ny = ux / len;
    if (ny > 0) { nx = -nx; ny = -ny; }
    return [(a[0] + b[0]) / 2 + nx * offset, (a[1] + b[1]) / 2 + ny * offset];
  }
  function cuffLine(cuff, offset) {
    var a = cuff[0], b = cuff[1];
    var ux = b[0] - a[0], uy = b[1] - a[1], len = Math.hypot(ux, uy);
    var nx = -uy / len, ny = ux / len;
    if (ny > 0) { nx = -nx; ny = -ny; }
    return 'M' + (a[0] + nx * offset + ux / len * 3).toFixed(1) + ' ' + (a[1] + ny * offset + uy / len * 3).toFixed(1) +
      ' L' + (b[0] + nx * offset - ux / len * 3).toFixed(1) + ' ' + (b[1] + ny * offset - uy / len * 3).toFixed(1);
  }
  function fit(txt, maxW, maxSize, ratio) {
    var n = Math.max(1, String(txt).length);
    return Math.min(maxSize, maxW / (n * ratio));
  }
  // tackle-twill lettering: shadow, outline, fill, stitched edge
  function twill(txt, o) {
    var font = o.font || FONT_BLOCK;
    var size = o.size;
    var pos = o.path ? '' : ' x="' + o.x + '" y="' + o.y + '"';
    var base = pos + ' text-anchor="middle" font-family="' + font + '" font-size="' + size.toFixed(1) + '"' + (o.ls ? ' letter-spacing="' + o.ls + '"' : '');
    var inner = o.path ? '<textPath href="#' + o.path + '" startOffset="50%">' + esc(txt) + '</textPath>' : esc(txt);
    var outline = o.outline || 'var(--jt)';
    var fill = o.fill || 'var(--jx)';
    return '<g' + (o.tr ? ' transform="' + o.tr + '"' : '') + '>' +
      '<text' + base + ' transform="translate(1.6 2.6)" fill="#000" fill-opacity=".22" stroke="#000" stroke-opacity=".22" stroke-width="' + (size * 0.16).toFixed(1) + '" stroke-linejoin="round">' + inner + '</text>' +
      '<text' + base + ' class="tbj-fill" style="fill:' + outline + ';stroke:' + outline + '" stroke-width="' + (size * 0.16).toFixed(1) + '" stroke-linejoin="round">' + inner + '</text>' +
      '<text' + base + ' class="tbj-fill" style="fill:' + fill + '">' + inner + '</text>' +
      '<text' + base + ' class="tbj-stitch" fill="none" stroke="#000" stroke-opacity=".38" stroke-width=".9" stroke-dasharray="2.4 1.8">' + inner + '</text>' +
      '</g>';
  }
  function stitch(dPath, extra) {
    return '<path d="' + dPath + '" fill="none" stroke="#000" stroke-opacity=".38" stroke-width=".9" stroke-dasharray="3 2.2"' + (extra || '') + '/>';
  }

  /* ---------- per-type decoration ---------- */
  function decorate(type, side, o) {
    var g = G[type];
    var name = String(o.name || 'BUTTI').toUpperCase().slice(0, 12);
    var num = String(o.num == null || o.num === '' ? '00' : o.num).slice(0, 2);
    var r = { body: '', sl: '', sr: '', neck: '', text: '' };

    if (type === 'hockey') {
      r.body = '<path d="M95 62 L160 40 Q200 54 240 40 L305 62 Q300 84 296 102 Q200 130 104 102 Q100 84 95 62 Z" style="fill:var(--js)"/>' +
        '<rect y="318" width="400" height="22" style="fill:var(--js)"/><rect y="344" width="400" height="9" style="fill:var(--jt)"/><rect y="357" width="400" height="22" style="fill:var(--js)"/>' +
        stitch('M104 102 Q200 130 296 102');
      r.sl = band(g.cuffL, 36, 26, 'var(--jb)') + band(g.cuffL, 36, 8, 'var(--jt)') + band(g.cuffL, 5, 9, 'var(--jt)');
      r.sr = band(g.cuffR, 36, 26, 'var(--jb)') + band(g.cuffR, 36, 8, 'var(--jt)') + band(g.cuffR, 5, 9, 'var(--jt)');
      var pl = cuffPoint(g.cuffL, 84), pr = cuffPoint(g.cuffR, 84);
      r.text += twill(num, { x: pl[0].toFixed(1), y: (pl[1] + 10).toFixed(1), size: 28, tr: 'rotate(' + cuffAngle(g.cuffL).toFixed(1) + ' ' + pl[0].toFixed(1) + ' ' + pl[1].toFixed(1) + ')' });
      r.text += twill(num, { x: pr[0].toFixed(1), y: (pr[1] + 10).toFixed(1), size: 28, tr: 'rotate(' + cuffAngle(g.cuffR).toFixed(1) + ' ' + pr[0].toFixed(1) + ' ' + pr[1].toFixed(1) + ')' });
      if (side === 'front') {
        r.neck = '<path d="M160 40 Q200 54 240 40 L200 100 Z" style="fill:var(--js)"/><path d="M160 40 Q200 54 240 40 L200 100 Z" fill="#000" fill-opacity=".4"/>' +
          '<path d="M156 38 L200 104 L244 38" fill="none" style="stroke:var(--jt)" stroke-width="12" stroke-linejoin="miter"/>' +
          stitch('M163 41 L200 97 L237 41') +
          '<g stroke="#0d0d0d" stroke-width=".8"><circle cx="184" cy="70" r="2.4" fill="#ddd"/><circle cx="216" cy="70" r="2.4" fill="#ddd"/><circle cx="191" cy="83" r="2.4" fill="#ddd"/><circle cx="209" cy="83" r="2.4" fill="#ddd"/></g>' +
          '<path d="M184 70 L209 83 M216 70 L191 83" stroke="#f4f1ea" stroke-width="2.4" stroke-linecap="round"/>' +
          '<path d="M198 99 q-9 16 -4 32 M202 99 q10 14 6 30" fill="none" stroke="#f4f1ea" stroke-width="2.2" stroke-linecap="round"/>';
        r.text += twill('TEAM', { path: 'tb-arc-hf', size: 36, ls: 3 });
        r.text += twill('BUTTI', { x: 200, y: 268, size: fit('BUTTI', 172, 44, 0.78) });
        if (o.capt) r.text += twill('C', { x: 262, y: 156, size: 28 });
      } else {
        r.neck = '<path d="M160 40 Q200 58 240 40" fill="none" style="stroke:var(--jt)" stroke-width="10"/>' + stitch('M162 45 Q200 61 238 45') +
          '<rect x="189" y="47" width="22" height="11" fill="#f4f1ea" stroke="#0d0d0d" stroke-width=".7"/><text x="200" y="55.5" text-anchor="middle" font-family="' + FONT_COND + '" font-size="7" fill="#0d0d0d">TB</text>';
        r.text += twill(name, { path: 'tb-arc-hb', size: fit(name, 176, 30, 0.78), ls: 2 });
        r.text += twill(num, { x: 200, y: 304, size: fit(num, 170, 138, 0.74) });
      }
    } else if (type === 'mx') {
      r.body = '<polygon points="130,150 200,212 270,150 270,186 200,248 130,186" style="fill:var(--js)"/>' +
        '<rect y="388" width="400" height="24" style="fill:var(--jt)"/>' + stitch('M126 386 L274 386');
      r.sl = band(g.cuffL, 112, 48, 'var(--jt)') + band(g.cuffL, 112, 6, 'var(--jb)') + band(g.cuffL, 9, 18, 'var(--jt)') + '<rect x="0" y="0" width="400" height="440" fill="url(#tb-knit)"/>';
      r.sr = band(g.cuffR, 112, 48, 'var(--jt)') + band(g.cuffR, 112, 6, 'var(--jb)') + band(g.cuffR, 9, 18, 'var(--jt)') + '<rect x="0" y="0" width="400" height="440" fill="url(#tb-knit)"/>';
      if (side === 'front') {
        r.neck = '<path d="M165 42 Q200 58 235 42 Q200 74 165 42 Z" style="fill:var(--js)"/><path d="M165 42 Q200 58 235 42 Q200 74 165 42 Z" fill="#000" fill-opacity=".4"/>' +
          '<path d="M163 41 Q200 76 237 41" fill="none" style="stroke:var(--jt)" stroke-width="10"/>' +
          '<path d="M163 41 Q200 76 237 41" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="9" stroke-dasharray="1 2.6"/>';
        r.text += '<g transform="translate(200 324) skewX(-10) translate(-200 -324)">' +
          twill('TEAM', { x: 200, y: 300, size: 46, font: FONT_COND, ls: 1 }) + twill('BUTTI', { x: 200, y: 346, size: 46, font: FONT_COND, ls: 1 }) + '</g>' +
          '<g><rect x="160" y="104" width="80" height="17" rx="3" fill="#0d0d0d"/><text x="200" y="116.5" text-anchor="middle" font-family="' + FONT_COND + '" font-size="10" letter-spacing="1" fill="#f4f1ea">MERDE RACING</text></g>' +
          '<g transform="rotate(-62 82 236)"><rect x="46" y="226" width="72" height="16" rx="8" fill="#f4f1ea" stroke="#0d0d0d" stroke-width="1.2"/><text x="82" y="238" text-anchor="middle" font-family="' + FONT_COND + '" font-size="10" fill="#0d0d0d">BRAP OIL</text></g>' +
          '<g transform="rotate(62 318 236)"><rect x="282" y="226" width="72" height="16" rx="8" fill="#ffd400" stroke="#0d0d0d" stroke-width="1.2"/><text x="318" y="238" text-anchor="middle" font-family="' + FONT_COND + '" font-size="10" fill="#0d0d0d">TB MOTO</text></g>' +
          '<text x="200" y="404" text-anchor="middle" font-family="' + FONT_COND + '" font-size="9.5" letter-spacing="2" style="fill:var(--jb)">TOSCANA DIRT CO. · EST. MILANO</text>';
      } else {
        r.neck = '<path d="M165 42 Q200 58 235 42" fill="none" style="stroke:var(--jt)" stroke-width="10"/><path d="M165 42 Q200 58 235 42" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="9" stroke-dasharray="1 2.6"/>';
        r.text += twill(name, { path: 'tb-arc-mb', size: fit(name, 150, 30, 0.5), font: FONT_COND, ls: 2 });
        r.text += '<g transform="translate(200 290) skewX(-8) translate(-200 -290)">' + twill(num, { x: 200, y: 336, size: fit(num, 130, 150, 0.5), font: FONT_COND }) + '</g>';
      }
    } else {
      r.body = '<rect x="96" y="160" width="30" height="260" style="fill:var(--js)"/><rect x="274" y="160" width="30" height="260" style="fill:var(--js)"/>' +
        stitch('M126 172 L126 404') + stitch('M274 172 L274 404');
      r.sl = band(g.cuffL, 14, 8, 'var(--jt)') + band(g.cuffL, 28, 8, 'var(--jt)');
      r.sr = band(g.cuffR, 14, 8, 'var(--jt)') + band(g.cuffR, 28, 8, 'var(--jt)');
      var fl = cuffPoint(g.cuffL, 64), fr = cuffPoint(g.cuffR, 64);
      r.text += twill(num, { x: fl[0].toFixed(1), y: (fl[1] + 12).toFixed(1), size: 30, tr: 'rotate(' + cuffAngle(g.cuffL).toFixed(1) + ' ' + fl[0].toFixed(1) + ' ' + fl[1].toFixed(1) + ')' });
      r.text += twill(num, { x: fr[0].toFixed(1), y: (fr[1] + 12).toFixed(1), size: 30, tr: 'rotate(' + cuffAngle(g.cuffR).toFixed(1) + ' ' + fr[0].toFixed(1) + ' ' + fr[1].toFixed(1) + ')' });
      if (side === 'front') {
        r.neck = '<path d="M160 44 Q200 58 240 44 L200 88 Z" style="fill:var(--js)"/><path d="M160 44 Q200 58 240 44 L200 88 Z" fill="#000" fill-opacity=".4"/>' +
          '<path d="M157 42 L200 92 L243 42" fill="none" style="stroke:var(--jt)" stroke-width="11"/>' +
          '<path d="M164 44 L200 86 L236 44" fill="none" style="stroke:var(--js)" stroke-width="3"/>' + stitch('M152 40 L200 97 L248 40');
        r.text += twill('TEAM BUTTI', { x: 200, y: 136, size: fit('TEAM BUTTI', 150, 22, 0.72), ls: 1 });
        r.text += twill(num, { x: 200, y: 318, size: fit(num, 168, 150, 0.74) });
      } else {
        r.neck = '<path d="M160 44 Q200 60 240 44" fill="none" style="stroke:var(--jt)" stroke-width="10"/>' + stitch('M162 49 Q200 63 238 49');
        r.text += twill(name, { x: 200, y: 128, size: fit(name, 170, 28, 0.78), ls: 2 });
        r.text += twill(num, { x: 200, y: 318, size: fit(num, 168, 150, 0.74) });
      }
    }
    return r;
  }

  /* ---------- flat style (approved concept) ---------- */
  function flat(type, side, o) {
    var d = FLAT[type];
    var name = esc(String(o.name || 'BUTTI').toUpperCase().slice(0, 12));
    var num = esc(String(o.num == null || o.num === '' ? '00' : o.num).slice(0, 2));
    var T = function (x, y, s, txt, extra) {
      return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="' + FONT_COND + '" font-size="' + s + '" ' + (extra || '') + '>' + txt + '</text>';
    };
    var fill = 'class="tbj-fill" style="fill:var(--jx)"';
    var numFill = 'class="tbj-fill" style="fill:var(--jx);stroke:var(--jt)" stroke-width="3" paint-order="stroke"';
    var deco, txt;
    if (type === 'hockey') {
      deco = '<rect width="66" height="300" style="fill:var(--js)"/><rect x="234" width="66" height="300" style="fill:var(--js)"/>' +
        '<rect y="124" width="66" height="10" style="fill:var(--jt)"/><rect x="234" y="124" width="66" height="10" style="fill:var(--jt)"/>' +
        '<rect y="140" width="66" height="5" style="fill:var(--jb)"/><rect x="234" y="140" width="66" height="5" style="fill:var(--jb)"/>' +
        '<rect y="222" width="300" height="16" style="fill:var(--js)"/><rect y="242" width="300" height="8" style="fill:var(--jt)"/>' +
        '<path d="M126 31 L150 68 L174 31" fill="none" style="stroke:var(--jt)" stroke-width="10"/>';
    } else if (type === 'mx') {
      deco = '<rect width="68" height="300" style="fill:var(--js)"/><rect x="232" width="68" height="300" style="fill:var(--js)"/>' +
        '<polygon points="68,124 150,186 232,124 232,150 150,212 68,150" style="fill:var(--js)"/>' +
        '<rect x="-20" y="118" width="120" height="16" style="fill:var(--jt)" transform="rotate(62 40 126)"/><rect x="200" y="118" width="120" height="16" style="fill:var(--jt)" transform="rotate(-62 260 126)"/>' +
        '<rect y="252" width="300" height="20" style="fill:var(--jt)"/>' +
        '<path d="M130 31 Q150 54 170 31" fill="none" style="stroke:var(--jt)" stroke-width="9"/>';
    } else {
      deco = '<rect width="70" height="300" style="fill:var(--js)"/><rect x="230" width="70" height="300" style="fill:var(--js)"/>' +
        '<rect y="104" width="70" height="7" style="fill:var(--jt)"/><rect y="116" width="70" height="7" style="fill:var(--jt)"/>' +
        '<rect x="230" y="104" width="70" height="7" style="fill:var(--jt)"/><rect x="230" y="116" width="70" height="7" style="fill:var(--jt)"/>' +
        '<path d="M126 35 L150 64 L174 35" fill="none" style="stroke:var(--jt)" stroke-width="9"/>';
    }
    if (side === 'front') {
      if (type === 'hockey') txt = T(150, 140, 40, 'TEAM', fill) + T(150, 180, 40, 'BUTTI', fill) + (o.capt ? T(205, 92, 22, 'C', fill) : '');
      else if (type === 'mx') txt = '<g transform="skewX(-10) translate(26 0)">' + T(150, 120, 42, 'TEAM', fill) + T(150, 162, 42, 'BUTTI', fill) + '</g>' + T(110, 240, 9, 'TOSCANA DIRT CO.', fill + ' letter-spacing="1"');
      else txt = T(150, 100, 18, 'TEAM BUTTI', fill + ' letter-spacing="2"') + T(150, 215, 104, num, numFill);
    } else {
      txt = T(150, type === 'mx' ? 100 : 104, Math.min(26, 190 / (name.length * 0.5)).toFixed(1), name, fill + ' letter-spacing="3"') +
        '<g class="tbj-stitch">' + T(150, 222, 112, num, numFill) + '</g>';
    }
    return '<svg class="tbj-svg tbj-svg--flat" viewBox="0 0 300 300" role="img" aria-label="Maglia ' + esc(type) + ' ' + (side === 'front' ? 'fronte' : 'retro') + '">' +
      '<g clip-path="url(#tbf-' + type + ')"><rect width="300" height="300" style="fill:var(--jb)"/>' + deco + txt + '<rect width="300" height="300" fill="url(#tbf-shade)"/></g>' +
      '<path d="' + d + '" fill="none" stroke="#0d0d0d" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  }
  function currentStyle(o) {
    var s = (o && o.style) || (d.documentElement && d.documentElement.getAttribute('data-jersey-style')) || 'detailed';
    return s === 'flat' ? 'flat' : 'detailed';
  }

  /* ---------- public: svg markup ---------- */
  function svg(type, side, o) {
    ensureDefs();
    type = G[type] ? type : 'hockey';
    side = side === 'back' ? 'back' : 'front';
    o = o || {};
    if (currentStyle(o) === 'flat') return flat(type, side, o);
    var g = G[type], r = decorate(type, side, o);
    var hanger = o.hanger ?
      '<g class="tbj-hanger"><path d="M108 66 Q200 24 292 66" fill="none" stroke="url(#tb-metal)" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M200 38 L200 22 Q200 6 214 6 Q228 6 228 19" fill="none" stroke="url(#tb-metal)" stroke-width="4.5" stroke-linecap="round"/></g>' : '';
    var folds = g.folds.map(function (p) { return '<path d="' + p + '"/>'; }).join('');
    var seams = g.seams.map(function (p) { return stitch(p); }).join('');
    var cuffs = stitch(cuffLine(g.cuffL, 4)) + stitch(cuffLine(g.cuffR, 4));
    var mesh = type === 'football' ? '' : '<rect width="400" height="440" fill="url(#tb-mesh)"/>';
    return '<svg class="tbj-svg" viewBox="' + VB + '" role="img" aria-label="Maglia ' + esc(type) + ' ' + (side === 'front' ? 'fronte' : 'retro') + '">' +
      hanger +
      '<g class="tbj-cloth">' +
      '<path d="' + g.body + '" style="fill:var(--jb)"/>' +
      '<g clip-path="url(#tb-' + type + '-body)">' + r.body + '</g>' +
      '<path d="' + g.sl + '" style="fill:var(--js)"/><path d="' + g.sr + '" style="fill:var(--js)"/>' +
      '<g clip-path="url(#tb-' + type + '-sl)">' + r.sl + '</g>' +
      '<g clip-path="url(#tb-' + type + '-sr)">' + r.sr + '</g>' +
      r.neck + r.text +
      '<g clip-path="url(#tb-' + type + '-all)">' + mesh +
      '<g fill="none" stroke="#000" stroke-opacity=".2" stroke-width="7" stroke-linecap="round" filter="url(#tb-soft)">' + folds + '</g>' +
      '<rect width="400" height="440" fill="url(#tb-shade)"/><rect width="400" height="440" fill="url(#tb-vshade)"/></g>' +
      seams + cuffs +
      '<g fill="none" stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"><path d="' + g.body + '"/><path d="' + g.sl + '"/><path d="' + g.sr + '"/></g>' +
      '</g></svg>';
  }

  function style(c) {
    return '--jb:' + c.base + ';--js:' + c.sleeve + ';--jt:' + c.stripe + ';--jx:' + c.text;
  }
  function apply(el, c) {
    el.classList.add('tbj');
    el.style.setProperty('--jb', c.base);
    el.style.setProperty('--js', c.sleeve);
    el.style.setProperty('--jt', c.stripe);
    el.style.setProperty('--jx', c.text);
  }
  // "#fff,#000,#999,#000" -> colors object
  function parse(str) {
    var p = String(str || '').split(',').map(function (s) { return s.trim(); });
    return { base: p[0] || '#f4f1ea', sleeve: p[1] || '#0d0d0d', stripe: p[2] || '#9a9a9a', text: p[3] || '#0d0d0d' };
  }

  /* ---------- motion: hanging pendulum ---------- */
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var swingers = [], running = false, last = 0;
  function loop(now) {
    var dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;
    var active = false;
    for (var i = 0; i < swingers.length; i++) {
      var s = swingers[i];
      if (!s.el.isConnected) { swingers.splice(i--, 1); continue; }
      var wind = s.wind ? s.wind * Math.sin(now / 1000 * s.freq + s.phase) : 0;
      var acc = -s.k * (s.a - wind) - s.c * s.v;
      s.v += acc * dt;
      s.a += s.v * dt;
      if (Math.abs(s.a) > s.max) { s.a = s.max * Math.sign(s.a); s.v *= -0.35; }
      if (Math.abs(s.a) > 0.01 || Math.abs(s.v) > 0.01 || s.wind) active = true;
      s.el.style.transform = 'rotate(' + s.a.toFixed(3) + 'deg)';
    }
    if (active && !d.hidden) w.requestAnimationFrame(loop); else running = false;
  }
  function wake() {
    if (running || reduce) return;
    running = true;
    last = performance.now();
    w.requestAnimationFrame(loop);
  }
  function swing(el, opt) {
    opt = opt || {};
    var s = { el: el, a: 0, v: 0, k: opt.k || 55, c: opt.c || 2.6, wind: opt.wind || 0, max: opt.max || 24, freq: 0.8 + Math.random() * 0.6, phase: Math.random() * 6 };
    swingers.push(s);
    if (s.wind) wake();
    return {
      kick: function (v) { s.v += Math.max(-140, Math.min(140, v)); wake(); },
      set wind(x) { s.wind = x; wake(); }
    };
  }
  d.addEventListener('visibilitychange', function () { if (!d.hidden) wake(); });

  /* ---------- motion: drag-to-rotate stage ---------- */
  function rotator(stage, flip, onChange) {
    var angle = 0, dragging = false, sx = 0, base = 0, moved = false;
    function render(anim) {
      flip.style.transition = anim ? 'transform .9s cubic-bezier(.3,1.25,.5,1)' : 'none';
      flip.style.transform = 'rotateY(' + angle + 'deg)';
      flip.style.setProperty('--lit', Math.abs(Math.sin(angle * Math.PI / 180)).toFixed(3));
      if (anim) flip.style.setProperty('--lit', '0');
    }
    function isBack() { return Math.round(angle / 180) % 2 !== 0; }
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button,a,input')) return;
      dragging = true; moved = false; sx = e.clientX; base = angle;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      angle = base + dx * 0.7;
      render(false);
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      angle = Math.round(angle / 180) * 180;
      if (!moved) angle += 180;
      render(true);
      if (onChange) onChange(isBack());
    }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    return {
      toggle: function () { angle += 180; render(true); if (onChange) onChange(isBack()); },
      show: function (back) { if (isBack() !== !!back) { angle += 180; render(true); } },
      isBack: isBack
    };
  }

  /* ---------- auto-render: <div data-tb-jersey="hockey" data-colors="..." data-side="front"> ---------- */
  // Product tags as a no-setup alternative to metafields: jersey:mx, colors:ff2e93-0d0d0d-f4f1ea-0d0d0d, num:69
  function fromTags(str) {
    var out = {};
    String(str || '').split('|').forEach(function (tag) {
      var m = tag.trim().match(/^(jersey|colors|num|bg):\s*(.+)$/i);
      if (!m) return;
      var k = m[1].toLowerCase(), v = m[2].trim();
      if (k === 'jersey') out.type = v.toLowerCase();
      else if (k === 'colors') out.colors = v.split('-').map(function (c) { return c.charAt(0) === '#' ? c : '#' + c; }).join(',');
      else out[k] = v;
    });
    return out;
  }
  function hydrate(root) {
    (root || d).querySelectorAll('[data-tb-jersey]').forEach(function (el) {
      if (el.dataset.tbDone) return;
      el.dataset.tbDone = '1';
      var t = fromTags(el.dataset.tags);
      var type = el.dataset.tbJersey || t.type || 'hockey';
      var colors = el.dataset.colors || t.colors;
      var num = el.dataset.num || t.num;
      apply(el, parse(colors));
      el.innerHTML = svg(type, el.dataset.side, {
        name: el.dataset.name, num: num, capt: el.dataset.capt === 'true', hanger: el.dataset.hanger === 'true'
      });
    });
  }

  w.TBJersey = { svg: svg, style: style, apply: apply, parse: parse, swing: swing, rotator: rotator, hydrate: hydrate, ensureDefs: ensureDefs, fromTags: fromTags, reduceMotion: reduce };
})(window, document);
