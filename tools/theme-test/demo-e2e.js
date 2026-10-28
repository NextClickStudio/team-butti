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
    await p.goto(BASE + '/'); await p.waitForTimeout(1100);
    const bk1 = await p.$eval('#loader [data-lbike]', b => b.style.transform).catch(() => ''); await p.waitForTimeout(250);
    const bk2 = await p.$eval('#loader [data-lbike]', b => b.style.transform).catch(() => '');
    ok(!!(await p.$('#loader [data-lscene] path')) && /translate3d/.test(bk1) && bk1 !== bk2 && (await p.$$('#loader [data-lsand] i')).length > 5, `[${name}] loader: la moto corre sulla pista disegnata e alza la sabbia`);
    await p.waitForTimeout(3000); await shot('home');
    ok(!(await p.$('#loader')), `[${name}] loader: finito, la pagina si vede`);
    await p.goto(BASE + '/collections/all'); await p.goto(BASE + '/'); await p.waitForTimeout(1500);
    ok(!(await p.$('#loader')), `[${name}] loader: tornando alla home nella stessa visita non riparte`);
    ok(await p.$$eval('.stk--img img', i => i.length === 6 && i.every(x => /tb-sticker-/.test(x.src))) && (await p.$$('[data-reel-stk]')).length === 8, `[${name}] sticker veri: 4 nel manifesto, 2 nel muro della crew, 8 a turno sul video`);
    ok((await p.textContent('#countdown')).includes('Crew List') && !/gadget/i.test(await p.textContent('#countdown')), `[${name}] market: Crew List al posto del gadget`);
    ok(JSON.stringify(await p.$$eval('[data-vibe]', v => v.map(x => x.dataset.name))) === '["Pink Market","Leopardo","Giallo MX"]', `[${name}] hero: solo i vibe Pink Market, Leopardo, Giallo MX`);
    ok((await p.textContent('[data-hero-count]')).includes('Market Milano') && /\d+g \d\d:\d\d:\d\d/.test(await p.textContent('[data-hero-count-t]')), `[${name}] hero: bottone countdown del Market Milano`);
    ok((await p.textContent('#countdown')).includes('Market Milano') && (await p.textContent('#countdown')).includes('Cantore 10'), `[${name}] countdown in fondo: Market Milano in Piazzale Cantore 10`);
    ok(!/Veneto/.test(await p.content()), `[${name}] niente Veneto da nessuna parte`);
    ok((await p.textContent('#shopify-section-drop .card .price')).includes('89,00'), `[${name}] prezzi: quelli del foglio + 10 € (Merde X 89 €)`);
    await p.click('#shopify-section-drop .tab[data-f="long-sleeve"]'); await p.waitForTimeout(300);
    ok(await p.$$eval('#shopify-section-drop .card', c => { const v = c.filter(x => getComputedStyle(x).display !== 'none'); return v.length === 9 && v.every(x => x.classList.contains('sold')); }), `[${name}] griglia: il filtro Long sleeve mostra le 9 longsleeve sold out`);
    ok(await p.$$eval('#shopify-section-drop .card.sold', c => c.filter(x => getComputedStyle(x).display !== 'none').every(x => { const f = getComputedStyle(x.querySelector('.flip')); return f.filter === 'none' && f.opacity === '1' && /sold out/i.test(x.querySelector('.stamp').textContent); })), `[${name}] sold out: maglie a colori con la scritta SOLD OUT sopra`);
    await p.click('#shopify-section-drop .tab[data-f="all"]'); await p.waitForTimeout(300);
    ok(await p.$$eval('#shopify-section-drop .card', c => c.filter(x => getComputedStyle(x).display !== 'none').length) === 8, `[${name}] griglia: su Tutto restano 8 pezzi`);
    ok(await p.$$eval('#shopify-section-drop .card[data-quick]', x => x.filter(c => getComputedStyle(c).display !== 'none').length) === 8, `[${name}] home: 8 prodotti veri nella griglia (gli altri del drop sotto i filtri)`);
    ok(await p.$$eval('[data-float].has-photo .hero__photo', x => x.filter(i => /tb-maglia-/.test(i.src) && i.complete && i.naturalWidth > 0).length) >= 2, `[${name}] hero: maglie vere (still life) al posto dei disegni`);
    const ph1 = await p.$eval('[data-float] .hero__photo', i => i.src);
    await p.click('[data-vibe-btn]'); await p.waitForTimeout(500);
    ok((await p.$eval('[data-float] .hero__photo', i => i.src)) !== ph1, `[${name}] hero: cambiando vibe cambiano anche le maglie`);
    ok(await p.$$eval('#shopify-section-drop .card img', x => x.length) >= 8, `[${name}] griglia: foto vere dei prodotti`);
    ok(!/nextclick/i.test(await p.content()), `[${name}] nessun riferimento a NextClick nella pagina`);
    ok((await p.$$('[data-tb=reel] [data-clip] video')).length === 5 && !(await p.$('[data-tb=reel] .reel__slot')) && !!(await p.$('[data-tb=story] video')) && !(await p.$('.vscroll__slot, .reel__slot, .pol--empty')), `[${name}] video veri: 5 clip Cadillac nel video del brand + storia, nessun segnaposto`);
    ok(await p.$$eval('[data-tb=reel] source', s => s.every(x => /tb-reel-(deville|targa|leopardo|volante|milano)\.mp4/.test(x.src))), `[${name}] video del brand: solo clip della Cadillac (niente moto)`);
    ok(!(await p.content()).includes('SoCal') && (await p.textContent('#shopify-section-manifesto')).replace(/\s+/g, ' ').includes('Non siamo nati a Los Angeles') && (await p.textContent('.hero__route')).includes('Chianni'), `[${name}] narrativa Chianni → Milano, manifesto "Non siamo nati a Los Angeles"`);
    ok(await p.$eval('[data-tb=reel] [data-reel-cta]', a => a.getAttribute('href') === '/collections/all' && a.getBoundingClientRect().width > 100), `[${name}] video del brand: bottone "Shop il drop" sul video`);
    ok(!(await p.$('[data-tb=trust]')), `[${name}] niente fascia gialla sotto il drop`);
    { const r = await p.context().newPage(); await r.goto(BASE + '/policies/refund-policy'); await r.waitForTimeout(500);
      ok(await r.$eval('.page-rte', e => /Modulo di recesso/.test(e.textContent) && e.querySelectorAll('mark').length > 0), `[${name}] policy recesso: testo e modulo di recesso, dati da compilare evidenziati`); await r.close(); }
    ok(await p.$$eval('.ftr__pol a', x => ['/policies/terms-of-service', '/policies/refund-policy', '/policies/shipping-policy', '/policies/privacy-policy', '/policies/contact-information', '/pages/cookie-policy'].every(h => x.some(a => a.getAttribute('href') === h))), `[${name}] footer: link a condizioni, recesso, spedizioni, privacy, info legali e cookie policy`);
    ok(await p.$$eval('.nl-note', x => x.length > 0 && x.every(n => n.querySelector('a[href="/policies/privacy-policy"]'))), `[${name}] newsletter: avviso privacy con link all'informativa`);
    ok(await p.$$eval('.nl button', x => x.every(b => getComputedStyle(b).backgroundColor !== getComputedStyle(b.querySelector('span')).color)), `[${name}] newsletter: testo del pulsante leggibile`);
    ok(await p.$eval('#shopify-section-drop .card__quick', q => q.textContent.trim() === 'Scegli la taglia +'), `[${name}] card prodotto: "Scegli la taglia +"`);
    ok(!(await p.$eval('[data-shop-pill]', a => a.classList.contains('on'))), `[${name}] bottone Shop flottante: nascosto in cima alla pagina`);
    { let seen = false; const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 900; y < H && !seen; y += 260) { await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(260); seen = await p.$eval('[data-shop-pill]', a => a.classList.contains('on') && a.getAttribute('href') === '/collections/all'); }
      ok(seen, `[${name}] bottone Shop flottante: compare scorrendo`); }
    await p.$eval('[data-tb=vscroll]', el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.9, behavior: 'instant' })); await p.waitForTimeout(700);
    ok(!(await p.$eval('[data-shop-pill]', a => a.classList.contains('on'))), `[${name}] bottone Shop flottante: non copre la Cadillac sulla strada`);
    await p.$eval('#shopify-section-manifesto', el => scrollTo({ top: el.offsetTop, behavior: 'instant' })); await p.waitForTimeout(700);
    ok(!(await p.$eval('[data-shop-pill]', a => a.classList.contains('on'))), `[${name}] bottone Shop flottante: non copre gli sticker del manifesto`);
    if (name === 'mob') {
      ok(await p.$eval('[data-tb=manifesto]', m => { const t = m.querySelector('.mani__txt').getBoundingClientRect(), r = m.getBoundingClientRect(); return [...m.querySelectorAll('.stk')].every(s => { const b = s.getBoundingClientRect(); return b.left >= r.left - 1 && b.right <= r.right + 1 && (b.bottom <= t.top + 6 || b.top >= t.bottom - 6); }); }), `[${name}] manifesto: sticker dentro lo schermo e mai sopra il testo`);
      ok(await p.$eval('[data-tb=manifesto]', m => m.offsetHeight < innerHeight * 1.05), `[${name}] manifesto: sezione non più lunga di uno schermo`);
    }
    await p.$eval('#shopify-section-drop .grid', el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' })); await p.waitForTimeout(700);
    ok(!(await p.$eval('[data-shop-pill]', a => a.classList.contains('on'))), `[${name}] bottone Shop flottante: si toglie sopra la griglia prodotti`);
    ok(!(await p.$('[data-tb=customizer]')) && !(await p.$('[data-tb=plate]')), `[${name}] niente prodotti custom online`);
    await p.$eval('[data-tb=reel]', el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.6, behavior: 'instant' })); await p.waitForTimeout(900);
    ok(+(await p.$eval('[data-tb=reel]', el => getComputedStyle(el).getPropertyValue('--x'))) > 0.5, `[${name}] video del brand: si espande con lo scroll`);
    if (name === 'mob') {
      ok(await p.$eval('[data-tb=reel]', el => el.classList.contains('is-full') && getComputedStyle(el.querySelector('.reel__chips')).opacity === '1'), `[${name}] video del brand: linguette 01–05 a schermo pieno`);
    }
    await p.waitForTimeout(700);
    ok(await p.$eval('[data-tb=reel]', el => el.classList.contains('more-on') && getComputedStyle(el.querySelector('.reel__more')).opacity === '1' && el.querySelector('.reel__more').textContent.replace(/\s+/g, ' ').includes('Scorri')), `[${name}] video del brand: a tutto schermo compare "Scorri giù · c'è il drop"`);
    { let shown = 0, hits = 0;
      for (let k = 0; k < 14; k++) {
        await p.waitForTimeout(500);
        const r = await p.evaluate(() => {
          const s = document.querySelector('.reel__stk.on'); if (!s || getComputedStyle(s).opacity < 0.9) return null;
          const a = s.getBoundingClientRect();
          return [...document.querySelectorAll('.reel__clip.on .bub.on, .reel__rec, .reel__tc, .reel__meta, .reel__sound, .reel__cta, .reel__chips')].filter(e => { const b = e.getBoundingClientRect(); return b.width && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; }).length;
        });
        if (r !== null) { shown++; hits += r; }
      }
      ok(shown > 0 && hits === 0, `[${name}] video: gli sticker compaiono a turno senza coprire fumetti, HUD e bottoni (${shown} campioni)`); }
    await p.click('[data-tb=reel] [data-chip="1"]'); await p.waitForTimeout(400);
    ok((await p.textContent('[data-date-out]')) === 'Settembre 2026' && (await p.$eval('[data-tb=reel] [data-clip].on video', v => v.querySelector('source').src)).includes('tb-reel-targa.mp4'), `[${name}] video del brand: cambio clip (la targa Los Angeles)`);
    await p.waitForTimeout(3600);
    ok(await p.$$eval('[data-tb=reel] [data-clip].on .bub', x => x.length === 2 && x.every(b => b.classList.contains('on')) && x[0].classList.contains('bub--say')) && !(await p.$('[data-tb=reel] [data-clip]:not(.on) .bub.on')), `[${name}] video del brand: i fumetti escono uno dopo l'altro sulla clip`);
    if (await p.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"'))) {
      await p.waitForTimeout(1200);
      ok(await p.$eval('[data-tb=reel] [data-clip].on video', v => !v.paused && v.currentTime > 0), `[${name}] video del brand: la clip parte`);
    }
    await shot('reel');
    await p.$eval('[data-tb=vscroll]', el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.98, behavior: 'instant' })); await p.waitForTimeout(1500);
    ok(+(await p.textContent('[data-km-out]')) >= 375 && (await p.textContent('[data-tb=vscroll] [data-place]')) === 'Milano' && (await p.textContent('[data-tb=vscroll] .jsign--brown')).includes('Il Ranch') && (await p.textContent('[data-tb=vscroll] .jsign--pink')).includes('Market 07.11'), `[${name}] Cadillac: parte dal Ranch di Chianni, arriva a Milano dopo ~390 km (ultimo cartello: Market 07.11)`);
    await shot('cadillac');
    ok(!(await p.$('[data-tb=mxs]')), `[${name}] home: niente Storia in moto (minigioco tolto)`);
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
    ok(await p.$eval('.pdp__legal', e => /IVA inclusa/.test(e.textContent) && /Garanzia legale 24 mesi/.test(e.textContent) && !!e.querySelector('a[href="/policies/refund-policy"]') && !!e.querySelector('a[href="/policies/shipping-policy"]')), `[${name}] pagina prodotto: IVA inclusa, spedizione, reso 14 giorni e garanzia legale con i link alle policy`);
    if (name === 'mob') {
      ok(!(await p.$eval('[data-pbar]', b => b.classList.contains('on'))), `[${name}] pagina prodotto: all'apertura la barra fissa non copre nome e prezzo`);
      await p.$eval('[data-product-form]', f => scrollTo({ top: f.getBoundingClientRect().bottom + scrollY + 60, behavior: 'instant' })); await p.waitForTimeout(800);
      ok(await p.$eval('[data-pbar]', b => b.classList.contains('on') && getComputedStyle(b).visibility === 'visible'), `[${name}] pagina prodotto: barra "Aggiungi alla bag" fissa in basso dopo aver superato il bottone`);
      await p.$eval('[data-product-form]', f => f.scrollIntoView({ block: 'center' })); await p.waitForTimeout(800);
      ok(!(await p.$eval('[data-pbar]', b => b.classList.contains('on'))), `[${name}] pagina prodotto: la barra si toglie quando il bottone vero è a schermo`);
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
    } else ok(await p.$eval('[data-pbar]', b => getComputedStyle(b).display === 'none'), `[${name}] pagina prodotto: niente barra fissa su desktop`);
    ok(await p.$$eval('.pdp__slide img', x => x.length === 2 && x[0].complete && x[0].naturalWidth > 0), `[${name}] pagina prodotto: foto fronte e retro della still life`);
    ok(await p.$eval('.size[data-v="XXL"]', b => b.classList.contains('na')), `[${name}] pagina prodotto: taglia sold out barrata`);
    await p.click('.pdp .size[data-v="M"]'); await p.click('.pdp [data-add]'); await p.waitForTimeout(900);
    ok((await p.textContent('[data-cart-count]')).trim() === '2', `[${name}] pagina prodotto: aggiunto (bag 2)`);
    await p.keyboard.press('Escape'); await shot('product');
    // chi siamo: brand text line by line, from the story button on the home
    await p.goto(BASE + '/'); await p.waitForTimeout(2200);
    if (name === 'mob') {
      await p.tap('[data-menu-toggle]'); await p.waitForTimeout(700);
      const open = await p.$eval('#MobileMenu', m => m.classList.contains('open'));
      await p.tap('[data-menu-toggle]'); await p.waitForTimeout(700);
      ok(open && !(await p.$eval('#MobileMenu', m => m.classList.contains('open'))) && (await p.textContent('[data-menu-toggle]')).trim() === 'Menu', `[${name}] menu mobile: si apre e si richiude dallo stesso bottone (Menu / Chiudi)`);
    }
    ok(await p.$eval('[data-tb=story] .story__link', a => a.getAttribute('href')) === '/pages/chi-siamo', `[${name}] home: "La nostra storia" porta a Chi siamo`);
    await p.goto(BASE + '/pages/chi-siamo'); await p.waitForTimeout(1800);
    const ab = await p.evaluate(() => ({ lines: document.querySelectorAll('.ab__l').length, pics: document.querySelectorAll('.ab__pic img').length, first: document.querySelector('.ab__l').textContent, last: [...document.querySelectorAll('.ab__l')].pop().textContent.replace(/\s+/g, ' '), tape: !!document.querySelector('.ab__tape'), video: !!document.querySelector('[data-tb=story] video') }));
    ok(ab.lines === 13 && ab.pics === 2 && ab.first === "Prima c'erano gli amici." && ab.last === 'È uno stile di vita.' && (await p.textContent('.ab__l--center')).trim() === 'Team Butti non è un brand.' && ab.tape && ab.video, `[${name}] Chi siamo: testo del brand a righe (13), chiude con "Team Butti non è un brand. È uno stile di vita." + 2 foto + nastro + video`);
    await p.$eval('.ab__l:nth-of-type(7)', el => el.scrollIntoView({ block: 'center' })); await p.waitForTimeout(2000);
    ok(await p.$eval('.ab__l:nth-of-type(7)', el => el.classList.contains('in') && el.querySelectorAll('.w').length > 3 && getComputedStyle(el.querySelector('.w > span')).transform === 'none'), `[${name}] Chi siamo: le parole salgono una dopo l'altra con lo scroll`);
    const last = await p.$('.ab__l--center');
    await last.scrollIntoViewIfNeeded(); await p.waitForTimeout(2200);
    ok(await last.evaluate(el => el.querySelector('s').textContent === 'brand' && getComputedStyle(el.querySelector('s'), '::after').transform !== 'none' && getComputedStyle(el.nextElementSibling.querySelector('em')).backgroundSize.startsWith('100%')), `[${name}] Chi siamo: "brand" barrato a pennarello, "stile di vita" evidenziato`);
    await p.$eval('[data-tb=ranch] [data-ranch-map]', el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 40, behavior: 'instant' })); await p.waitForTimeout(1800);
    const rn = await p.evaluate(() => ({ km: +document.querySelector('[data-ranch-km]').textContent, on: document.querySelectorAll('[data-tb=ranch] [data-stop].is-on').length, all: document.querySelectorAll('[data-tb=ranch] [data-stop]').length, facts: document.querySelector('.ranch__facts').textContent }));
    ok(rn.km >= 385 && rn.on === rn.all && rn.facts.includes('1.276'), `[${name}] Chi siamo: Il Ranch a Chianni, la strada fino a Milano si disegna con lo scroll (km ${rn.km}, tappe ${rn.on}/${rn.all})`);
    await shot('ranch');
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
    ok(await p.$$eval('.grid .card', x => x.length) === 8 && await p.$$eval('.grid .card img', x => x.length) >= 8, `[${name}] ricerca "hockey": 8 maglie hockey con foto (con la Merde X bianco/rosso/blu sold out)`);
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
