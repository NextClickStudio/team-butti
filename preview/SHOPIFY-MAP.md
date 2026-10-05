# Preview → Shopify: mappa di porting

Ogni pezzo della preview ha un equivalente Shopify (tema Online Store 2.0, Liquid). Nulla richiede app a pagamento.

| Sezione preview | Sezione Liquid | Editabile dal Theme Editor | Dati / API Shopify |
|---|---|---|---|
| Barra "concept" | — (rimossa in produzione) | — | — |
| Marquee rosa | `sections/announcement-bar.liquid` (header group) | testi, colori, velocità | — |
| Header + badge logo + bag | `sections/header.liquid` | logo, menu, larghezza logo | `linklists`, `cart.item_count` |
| Hero "Cambia vibe" | `sections/hero-vibe.liquid` | blocchi "vibe" (colore, pattern, 3 prodotti in evidenza), testi, CTA | prodotti scelti con `product` picker; foto vere al posto delle maglie SVG |
| Nastri inclinati | `sections/tapes.liquid` | testi dei 2 nastri | — |
| Griglia "Drop 01" + filtri | `sections/featured-collection.liquid` / `main-collection.liquid` | collezione, colonne, n° prodotti | `collection.products`, tab = tag o sotto-collezioni; hover fronte/retro = 2ª immagine prodotto |
| Vista rapida | `snippets/quick-view.liquid` + Section Rendering API | — | `product.variants`, disponibilità per taglia |
| Manifesto + sticker trascinabili | `sections/manifesto.liquid` | testo (richtext, parole evidenziate), blocchi sticker (testo/stile/posizione) | — |
| Configuratore "Fattela tua" | `sections/jersey-customizer.liquid` | modelli e colori come blocchi | prodotto "Custom" con varianti modello×taglia; nome e numero come **line item properties** (`properties[Nome]`, `properties[Numero]`) |
| Ride Milano→NYC | `sections/ride.liquid` | blocchi "tappa" (titolo, testo, colore, immagine) | — |
| Targa custom | `sections/plate-builder.liquid` | testi fissi, prezzo dal prodotto | prodotto "Targa" + `properties[Testo]` |
| Poster Market + countdown | `sections/drop-countdown.liquid` | data/ora drop, testi poster, stamp on/off | — |
| Newsletter | `snippets/newsletter-form.liquid` | testi | `{% form 'customer' %}` → clienti con tag `newsletter` |
| Carrello laterale | `sections/cart-drawer.liquid` | soglia spedizione gratis | Cart AJAX API (`/cart/add.js`, `/cart/change.js`) + Section Rendering API |
| Checkout | checkout Shopify nativo | — | `name="checkout"` |
| Footer + wordmark | `sections/footer.liquid` | menu, social, testi | `shop.enabled_payment_types` |
| Loader RPM, cursore, grana | `assets/theme.js` + `assets/base.css` | on/off nelle impostazioni tema | — |

## Cosa serve dal brand per passare in produzione
1. Foto prodotto (fronte + retro, sfondo pulito) e foto lifestyle.
2. Listino: nome, prezzo, taglie, stock, descrizione.
3. Logo in vettoriale.
4. Testi definitivi (manifesto, spedizioni, resi, guida taglie).
5. Prossime date di drop/market.
