const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8790';
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: name === 'mob' });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const shot = n => p.screenshot({ path: `${__dirname}/out/demo-${name}-${n}.png` });
    await p.goto(BASE + '/'); await p.waitForTimeout(2500); await shot('home');
    ok(await p.$$eval('#shopify-section-drop .card[data-quick]', x => x.length) === 8, `[${name}] home: 8 prodotti veri nella griglia`);
    // quick view + add
    await p.$eval('#shopify-section-drop .card[data-quick]', el => el.scrollIntoView()); await p.waitForTimeout(400);
    await p.click('#shopify-section-drop .card[data-quick]'); await p.waitForTimeout(900);
    ok(await p.$eval('#modal', m => m.classList.contains('on')), `[${name}] vista rapida aperta`);
    await p.click('#modal .size[data-v="L"]'); await p.waitForTimeout(200);
    await shot('quick');
    await p.click('#modal [data-add]'); await p.waitForTimeout(900);
    ok(await p.$eval('#CartDrawer', d => d.classList.contains('on')), `[${name}] aggiunto → carrello laterale aperto`);
    ok((await p.textContent('#CartDrawer')).includes('Kings'), `[${name}] carrello contiene la maglia`);
    await shot('drawer');
    // reload persists
    await p.goto(BASE + '/collections/all'); await p.waitForTimeout(900);
    ok((await p.textContent('[data-cart-count]')).trim() === '1', `[${name}] carrello persistente dopo navigazione (bag 1)`);
    await shot('collection');
    // product page add with size
    await p.goto(BASE + '/products/mx-jersey-hawaii-2003'); await p.waitForTimeout(900);
    ok(await p.$eval('.size[data-v="XXL"]', b => b.classList.contains('na')), `[${name}] pagina prodotto: taglia sold out barrata`);
    await p.click('.pdp .size[data-v="M"]'); await p.click('.pdp [data-add]'); await p.waitForTimeout(900);
    ok((await p.textContent('[data-cart-count]')).trim() === '2', `[${name}] pagina prodotto: aggiunto (bag 2)`);
    await p.keyboard.press('Escape'); await shot('product');
    // customizer from home
    await p.goto(BASE + '/#custom'); await p.waitForTimeout(2600);
    await p.$eval('[data-tb=customizer]', el => el.scrollIntoView()); await p.waitForTimeout(500);
    await p.fill('[data-name-input]', 'ROSSI'); await p.fill('[data-num-input]', '7');
    await p.click('[data-tb=customizer] [data-add]'); await p.waitForTimeout(900);
    ok((await p.textContent('#CartDrawer')).includes('Nome: ROSSI'), `[${name}] configuratore: maglia custom con nome nel carrello`);
    await p.keyboard.press('Escape');
    // cart page: update + checkout
    await p.goto(BASE + '/cart'); await p.waitForTimeout(1000);
    ok(await p.$$eval('.cart-page .ln', x => x.length) === 3, `[${name}] pagina carrello: 3 righe`);
    await shot('cart');
    await p.click('.cart-page [name=checkout]'); await p.waitForTimeout(400);
    ok(await p.$eval('.demo-checkout', o => o.classList.contains('on')), `[${name}] checkout: schermata demo`);
    await p.click('.demo-checkout button');
    await p.click('.cart-page a[href^="/cart/change"]'); await p.waitForTimeout(800);
    ok(await p.$$eval('.cart-page .ln', x => x.length) === 2, `[${name}] pagina carrello: rimozione riga`);
    // search
    await p.goto(BASE + '/search?q=hockey'); await p.waitForTimeout(1000);
    ok(await p.$$eval('.grid .card', x => x.length) === 3, `[${name}] ricerca "hockey": 3 risultati`);
    // 404 + password
    const before = errs.length;
    await p.goto(BASE + '/pagina-che-non-esiste'); await p.waitForTimeout(500);
    errs.splice(before);
    ok((await p.textContent('body')).includes('404'), `[${name}] 404 a tema`);
    await p.goto(BASE + '/password'); await p.waitForTimeout(800); await shot('password');
    ok(errs.length === 0, `[${name}] nessun errore JS ` + JSON.stringify(errs.slice(0, 3)));
    const ow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(ow <= 0, `[${name}] nessuno scroll orizzontale`);
    await ctx.close();
  }
  await b.close();
})();
