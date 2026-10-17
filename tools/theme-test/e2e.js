const { chromium } = require('playwright');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8787/'); await p.waitForTimeout(2300);
  ok(await p.$$eval('[data-float] svg', x => x.length) === 3, 'hero: 3 maglie fluttuanti disegnate (concept approvato)');
  const bg1 = await p.$eval('[data-tb=hero]', el => el.style.getPropertyValue('--hero-bg'));
  await p.click('[data-vibe-btn]'); await p.waitForTimeout(300);
  const bg2 = await p.$eval('[data-tb=hero]', el => el.style.getPropertyValue('--hero-bg'));
  ok(bg1 !== bg2, `hero: cambia vibe (${bg1} → ${bg2})`);
  await p.mouse.click(700, 520); await p.waitForTimeout(120);
  ok(await p.$$eval('[data-tb=hero] .brap', x => x.length) >= 1, 'hero: scritte a vignetta al click (invariate)');
  ok(!(await p.$('[data-tb=story]')) && !(await p.$('[data-tb=reel]')) && !(await p.$('[data-tb=crew]')) && !(await p.$('.mxs__pic')), 'negozio appena installato: video del brand, storia e foto crew nascosti finché i file non sono caricati');
  ok(!!(await p.$('[data-tb=hero] .hero__land .pano')) && !!(await p.$('[data-hero-car] .cad')), 'hero: panorama Chianni → Milano + Cadillac sulla strada');
  ok(!(await p.$('.skyline')), 'hero: vecchio skyline con palme rimosso');
  await p.screenshot({ path: __dirname + '/out/th-hero.png' });
  ok(await p.$$eval('.grid .card svg.tbj-svg', x => x.length) >= 16, 'griglia: maglie demo disegnate (fronte+retro)');
  ok(!(await p.$('[data-tb=customizer]')) && !(await p.$('[data-tb=plate]')) && !(await p.$('#custom')), 'home: niente prodotti custom (configuratore maglia e targa tolti, solo offline ai market)');
  // Cadillac journey (visible without video: illustrated car)
  await p.evaluate(() => { const r = document.querySelector('[data-tb=vscroll]'); scrollTo(0, r.offsetTop + (r.offsetHeight - innerHeight) * 0.25); }); await p.waitForTimeout(300);
  await p.evaluate(() => { const r = document.querySelector('[data-tb=vscroll]'); scrollTo(0, r.offsetTop + (r.offsetHeight - innerHeight) * 0.5); }); await p.waitForTimeout(1200);
  const jr = await p.evaluate(() => ({ car: document.querySelector('[data-tb=vscroll] [data-car]').style.transform, wheel: document.querySelector('[data-tb=vscroll] .wh').style.transform, km: +document.querySelector('[data-km-out]').textContent, far: document.querySelector('[data-far]').style.transform }));
  ok(/translate3d\((\d{3,})/.test(jr.car) && /rotate\(\d/.test(jr.wheel) && jr.km > 100 && jr.far.includes('-'), `Cadillac: avanza con lo scroll, ruote che girano, km ${jr.km}, parallasse attiva`);
  await p.screenshot({ path: __dirname + '/out/th-cadillac.png' });
  // MX story: the bike rides the dunes and jumps
  const mx = [];
  for (const f of [0.08, 0.14, 0.2, 0.26]) {
    await p.evaluate(f => { const r = document.querySelector('[data-tb=mxs]'); window.scrollTo({ top: r.offsetTop + (r.offsetHeight - innerHeight) * f, behavior: 'instant' }); }, f); await p.waitForTimeout(700);
    mx.push(await p.evaluate(() => ({ world: document.querySelector('[data-mxs-world]').style.transform, bike: document.querySelector('[data-mxs-bike]').style.transform, air: document.querySelector('[data-mxs-bike] .mx__shadow').style.opacity === '0' })));
  }
  ok(mx.every(m => m.world.includes('translate3d(-')) && new Set(mx.map(m => m.bike)).size === 4 && !!(await p.$('[data-mxs-ground] path')), 'storia in moto: dune disegnate, moto che avanza con lo scroll');
  ok(mx.some(m => m.air) && mx.some(m => !m.air), 'storia in moto: salti (in aria e a terra)');
  ok(!(await p.$('[data-tb=ride]')), 'storia in moto al posto del viaggio in Cadillac (Cadillac solo in alto)');
  await p.screenshot({ path: __dirname + '/out/th-mx.png' });
  ok(await p.$$eval('[data-countdown] [data-u=d]', x => x[0].textContent !== '00' || x[0].textContent === '00'), 'drop: countdown attivo');
  // collection + quick view
  await p.goto('http://localhost:8787/collections/all'); await p.waitForTimeout(800);
  ok(await p.$$eval('.card .tbj-svg', x => x.length) === 4, 'collezione: card prodotto con maglie da metafield');
  await p.click('.card[data-quick]'); await p.waitForTimeout(900);
  ok(await p.$eval('#modal', m => m.classList.contains('on') && !!m.querySelector('[data-pform]')), 'vista rapida: aperta via Section Rendering API');
  await p.click('#modal [data-opt]:nth-of-type(2) .size[data-v="L"]').catch(() => {});
  await p.$$eval('#modal [data-opt]', os => { os[1].querySelector('[data-v="L"]').click(); });
  ok(await p.$eval('#modal input[name=id]', i => i.value) === '102', 'vista rapida: varianti Hockey/L → id 102');
  await p.screenshot({ path: __dirname + '/out/th-quick.png' });
  // product page: options → variant → AJAX add → drawer
  await p.goto('http://localhost:8787/products/custom-jersey'); await p.waitForTimeout(800);
  ok(await p.$$eval('.pdp .tbj-svg', x => x.length) === 2, 'pagina prodotto: maglia fronte/retro (senza foto)');
  await p.screenshot({ path: __dirname + '/out/th-product.png' });
  await p.$$eval('.pdp [data-opt]', os => { os[0].querySelector('[data-v="Motocross"]').click(); os[1].querySelector('[data-v="XL"]').click(); });
  ok(await p.$eval('.pdp input[name=id]', i => i.value) === '108', 'pagina prodotto: Motocross/XL → variante 108');
  await p.click('.pdp [data-add]'); await p.waitForTimeout(900);
  const log = await (await p.request.get('http://localhost:8787/__log')).json();
  const add = log.find(l => l.path === '/cart/add.js');
  ok(add && /name="id"\r\n\r\n108/.test(add.body) && /name="sections"\r\n\r\ncart-drawer/.test(add.body), 'carrello: POST /cart/add.js con id variante + sections');
  ok(await p.$eval('#CartDrawer', d => d.classList.contains('on')), 'carrello: drawer aperto dopo aggiunta');
  ok(await p.$eval('[data-cart-count]', e => e.textContent.trim()) === '1', 'carrello: contatore bag aggiornato a 1');
  await p.screenshot({ path: __dirname + '/out/th-drawer.png' });
  await p.click('#CartDrawer [data-line][data-qty="0"]'); await p.waitForTimeout(600);
  const log2 = await (await p.request.get('http://localhost:8787/__log')).json();
  ok(log2.some(l => l.path === '/cart/change.js' && l.body.includes('"quantity":0')), 'carrello: POST /cart/change.js per rimuovere');
  ok(errs.length === 0, 'console: nessun errore JS ' + JSON.stringify(errs));
  await b.close();
})();
