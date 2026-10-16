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
    ok(await p.$$eval('[data-float].has-photo .hero__photo', x => x.filter(i => /tb-maglia-/.test(i.src) && i.complete && i.naturalWidth > 0).length) >= 2, `[${name}] hero: maglie vere (still life) al posto dei disegni`);
    const ph1 = await p.$eval('[data-float] .hero__photo', i => i.src);
    await p.click('[data-vibe-btn]'); await p.waitForTimeout(500);
    ok((await p.$eval('[data-float] .hero__photo', i => i.src)) !== ph1, `[${name}] hero: cambiando vibe cambiano anche le maglie`);
    ok(await p.$$eval('#shopify-section-drop .card img', x => x.length) >= 8, `[${name}] griglia: foto vere dei prodotti`);
    ok(!/nextclick/i.test(await p.content()), `[${name}] nessun riferimento a NextClick nella pagina`);
    ok((await p.$$('[data-tb=reel] [data-clip] video')).length === 4 && !(await p.$('[data-tb=reel] .reel__slot')) && !!(await p.$('[data-tb=story] video')) && !!(await p.$('[data-tb=vscroll] .vscroll__slot')), `[${name}] video veri: 4 clip nel video del brand + storia (slot solo per la Cadillac Higgsfield)`);
    ok(!(await p.content()).includes('SoCal') && (await p.textContent('#shopify-section-manifesto')).replace(/\s+/g, ' ').includes('Non siamo nati a Los Angeles'), `[${name}] narrativa Toscana → Milano, manifesto "Non siamo nati a Los Angeles"`);
    ok(!(await p.$('[data-tb=customizer]')) && !(await p.$('[data-tb=plate]')), `[${name}] niente prodotti custom online`);
    await p.$eval('[data-tb=reel]', el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.6, behavior: 'instant' })); await p.waitForTimeout(900);
    ok(+(await p.$eval('[data-tb=reel]', el => getComputedStyle(el).getPropertyValue('--x'))) > 0.5, `[${name}] video del brand: si espande con lo scroll`);
    await p.click('[data-tb=reel] [data-chip="1"]'); await p.waitForTimeout(400);
    ok((await p.textContent('[data-date-out]')) === '25.08.2026' && (await p.$eval('[data-tb=reel] [data-clip].on video', v => v.querySelector('source').src)).includes('tb-reel-crete.mp4'), `[${name}] video del brand: cambio clip (Le crete, 25.08.2026)`);
    if (await p.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"'))) {
      await p.waitForTimeout(1200);
      ok(await p.$eval('[data-tb=reel] [data-clip].on video', v => !v.paused && v.currentTime > 0), `[${name}] video del brand: la clip parte`);
    }
    await shot('reel');
    await p.$eval('[data-tb=vscroll]', el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.98, behavior: 'instant' })); await p.waitForTimeout(1500);
    ok(+(await p.textContent('[data-km-out]')) >= 280 && (await p.textContent('[data-tb=vscroll] [data-place]')) === 'Milano', `[${name}] Cadillac: arrivo a Milano dopo ~300 km`);
    await shot('cadillac');
    await p.$eval('[data-tb=mxs]', el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.5, behavior: 'instant' })); await p.waitForTimeout(1200);
    ok((await p.$$('.mxs__ch')).length === 5 && (await p.$eval('[data-mxs-bike]', b => b.style.transform)).includes('rotate('), `[${name}] storia in moto: 5 capitoli, moto sulle dune`);
    ok((await p.$$('.mxs__ch--media')).length === 5 && (await p.$$('.mxs__pic video')).length === 2 && (await p.$$('.mxs__pic img')).length === 3, `[${name}] storia in moto: ogni capitolo con foto/video veri (2 video + 3 foto)`);
    await shot('mx');
    // crew wall: polaroids slide with the scroll, open big, step with the arrows
    await p.$eval('[data-tb=crew]', el => scrollTo({ top: el.offsetTop - innerHeight * 0.6, behavior: 'instant' })); await p.waitForTimeout(700);
    const cw1 = await p.$eval('[data-crew-row]', r => r.style.transform);
    await p.$eval('[data-tb=crew]', el => scrollTo({ top: el.offsetTop + el.offsetHeight * 0.4, behavior: 'instant' })); await p.waitForTimeout(700);
    const cw2 = await p.$eval('[data-crew-row]', r => r.style.transform);
    ok((await p.$$('[data-tb=crew] .pol img')).length === 21 && (await p.$$('[data-tb=crew] .crew__stk')).length === 2 && cw1 !== cw2, `[${name}] foto della crew: 21 polaroid + 2 adesivi, le file scorrono con lo scroll`);
    await shot('crew');
    await p.$eval('[data-tb=crew] [data-pol]', b => b.click()); await p.waitForTimeout(600);
    const lb1 = await p.$eval('[data-crew-lb]', d => ({ open: d.open, src: d.querySelector('[data-lb-img]').getAttribute('src'), cap: d.querySelector('[data-lb-cap]').textContent }));
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
    const lb2 = await p.$eval('[data-lb-cap]', c => c.textContent);
    await shot('crew-lightbox');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(lb1.open && lb1.src.includes('tb-crew-01.jpg') && lb1.cap === 'La crew e la DeVille' && lb2 === 'Senza maglia, gas aperto' && !(await p.$eval('[data-crew-lb]', d => d.open)), `[${name}] foto della crew: apertura grande, freccia avanti, Esc chiude`);
    await p.$eval('#shopify-section-manifesto', el => el.scrollIntoView()); await p.waitForTimeout(300);
    await p.$eval('#shopify-section-drop', el => el.scrollIntoView()); await p.waitForTimeout(900);
    ok(await p.$$eval('#shopify-section-drop .sec__title.split-in .ch', x => x.length) > 3, `[${name}] titoli animati lettera per lettera`);
    // quick view + add
    await p.$eval('#shopify-section-drop .card[data-quick]', el => el.scrollIntoView()); await p.waitForTimeout(400);
    await p.click('#shopify-section-drop .card[data-quick]'); await p.waitForTimeout(900);
    ok(await p.$eval('#modal', m => m.classList.contains('on')), `[${name}] vista rapida aperta`);
    await p.click('#modal .size[data-v="L"]'); await p.waitForTimeout(200);
    await shot('quick');
    await p.click('#modal [data-add]'); await p.waitForTimeout(900);
    ok(await p.$eval('#CartDrawer', d => d.classList.contains('on')), `[${name}] aggiunto → carrello laterale aperto`);
    ok((await p.textContent('#CartDrawer')).includes('MERDE X'), `[${name}] carrello contiene la maglia`);
    await shot('drawer');
    // reload persists
    await p.goto(BASE + '/collections/all'); await p.waitForTimeout(900);
    ok((await p.textContent('[data-cart-count]')).trim() === '1', `[${name}] carrello persistente dopo navigazione (bag 1)`);
    await shot('collection');
    // product page add with size
    await p.goto(BASE + '/products/cross-merde-62-bluette-giallo'); await p.waitForTimeout(900);
    ok(await p.$$eval('.pdp__slide img', x => x.length === 2 && x[0].complete && x[0].naturalWidth > 0), `[${name}] pagina prodotto: foto fronte e retro della still life`);
    ok(await p.$eval('.size[data-v="XXL"]', b => b.classList.contains('na')), `[${name}] pagina prodotto: taglia sold out barrata`);
    await p.click('.pdp .size[data-v="M"]'); await p.click('.pdp [data-add]'); await p.waitForTimeout(900);
    ok((await p.textContent('[data-cart-count]')).trim() === '2', `[${name}] pagina prodotto: aggiunto (bag 2)`);
    await p.keyboard.press('Escape'); await shot('product');
    // chi siamo: brand text line by line, from the story button on the home
    await p.goto(BASE + '/'); await p.waitForTimeout(2200);
    ok(await p.$eval('[data-tb=story] .story__link', a => a.getAttribute('href')) === '/pages/chi-siamo', `[${name}] home: "La nostra storia" porta a Chi siamo`);
    await p.goto(BASE + '/pages/chi-siamo'); await p.waitForTimeout(1800);
    const ab = await p.evaluate(() => ({ lines: document.querySelectorAll('.ab__l').length, pics: document.querySelectorAll('.ab__pic img').length, first: document.querySelector('.ab__l').textContent, last: [...document.querySelectorAll('.ab__l')].pop().textContent, tape: !!document.querySelector('.ab__tape'), video: !!document.querySelector('[data-tb=story] video') }));
    ok(ab.lines === 12 && ab.pics === 2 && ab.first === "Prima c'erano gli amici." && ab.last === 'Team Butti è un nome.' && ab.tape && ab.video, `[${name}] Chi siamo: testo del brand a righe (12) + 2 foto + nastro "il resto è in movimento" + video`);
    await p.$eval('.ab__l:nth-of-type(7)', el => el.scrollIntoView({ block: 'center' })); await p.waitForTimeout(1100);
    ok(await p.$eval('.ab__l:nth-of-type(7)', el => el.classList.contains('in')), `[${name}] Chi siamo: le righe entrano con lo scroll`);
    ok((await p.$$('[data-tb=mix] .mix__row')).length === 5 && (await p.$$('[data-tb=mix] .mix__pic img')).length === 5, `[${name}] Chi siamo: "Tutto può entrarci" con 5 parole e foto`);
    await shot('chi-siamo');
    // cart page: update + checkout
    await p.goto(BASE + '/cart'); await p.waitForTimeout(1000);
    ok(await p.$$eval('.cart-page .ln', x => x.length) === 2, `[${name}] pagina carrello: 2 righe`);
    await shot('cart');
    await p.click('.cart-page [name=checkout]'); await p.waitForTimeout(400);
    ok(await p.$eval('.demo-checkout', o => o.classList.contains('on')), `[${name}] checkout: schermata demo`);
    await p.click('.demo-checkout button');
    await p.click('.cart-page a[href^="/cart/change"]'); await p.waitForTimeout(800);
    ok(await p.$$eval('.cart-page .ln', x => x.length) === 1, `[${name}] pagina carrello: rimozione riga`);
    // search
    await p.goto(BASE + '/search?q=hockey'); await p.waitForTimeout(1000);
    ok(await p.$$eval('.grid .card', x => x.length) === 7 && await p.$$eval('.grid .card img', x => x.length) >= 7, `[${name}] ricerca "hockey": 7 maglie hockey con foto`);
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
