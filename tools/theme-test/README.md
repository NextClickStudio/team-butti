# Test del tema

1. `npm install`
2. `npm run check` → Shopify Theme Check ufficiale (deve dire *no offenses found*).
3. `npm run e2e` → renderizza homepage, collezione, prodotto, vista rapida e carrello con liquidjs,
   li serve con un finto backend Shopify (`/cart/add.js`, `/cart/change.js`, `?sections=`, `?section_id=`)
   e li prova in Chromium: stendino, cambia vibe, configuratore (variante + proprietà Nome/Numero/Colori),
   carrello laterale, targa, ride, vista rapida, pagina prodotto, zero errori in console.

Il render locale serve a verificare markup + JavaScript; il controllo finale resta l'anteprima su un negozio Shopify reale.
