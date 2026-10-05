# Test del tema

1. `npm install`
2. `npm run check` → Shopify Theme Check ufficiale (deve dire *no offenses found*).
3. `npm run e2e` → renderizza homepage, collezione, prodotto, vista rapida e carrello con liquidjs,
   li serve con un finto backend Shopify (`/cart/add.js`, `/cart/change.js`, `?sections=`, `?section_id=`)
   e li prova in Chromium: stendino, cambia vibe, configuratore (variante + proprietà Nome/Numero/Colori),
   carrello laterale, targa, ride, vista rapida, pagina prodotto, zero errori in console.

Il render locale serve a verificare markup + JavaScript; il controllo finale resta l'anteprima su un negozio Shopify reale.

## Negozio demo (anteprima navigabile)
`npm run demo` genera `demo-site/`: homepage, collezioni, 10 pagine prodotto, vista rapida, carrello, ricerca, 404 e password,
tutte renderizzate dai file Liquid del tema con un catalogo di esempio (`demo-catalog.js`).
Nel browser `shopify-mock.js` risponde alle API del carrello (`/cart/add.js`, `/cart/change.js`, Section Rendering) ridisegnando
le sezioni del tema con liquidjs; il carrello resta salvato nel browser. Il checkout è disattivato.
Su Vercel: root `tools/theme-test`, install `npm install --omit=dev`, build `node build-demo.js`, output `demo-site`.
`npm run demo:e2e` collauda il negozio demo (30 controlli, desktop + mobile).
