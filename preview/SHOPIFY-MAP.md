# Preview → Shopify: mappa di porting

Il porting è **già fatto**: il tema Shopify OS 2.0 è nella root del repo (`layout/`, `sections/`, `snippets/`, `templates/`, `assets/`, `config/`, `locales/`).
Il disegno delle maglie è lo stesso file (`assets/tb-jersey.js`) usato dalla preview. Nessuna app a pagamento.

## Come è stato verificato
| Prova | Risultato |
|---|---|
| `shopify theme check` (validatore ufficiale Shopify CLI 4.8) | **51 file, 0 errori, 0 avvisi** |
| `shopify theme package` | Zip caricabile generato (`Team Butti-1.0.0.zip`, 67 file) |
| Render Liquid locale + test in Chromium con finto backend Shopify (`tools/theme-test`) | **18/18 test superati**, 0 errori JS: stendino e cambia vibe, griglia, configuratore (variante giusta + proprietà Nome/Numero/Colori inviate a `/cart/add.js`), carrello laterale via Section Rendering API, rimozione via `/cart/change.js`, targa, ride, vista rapida, pagina prodotto |
| Unica prova che manca | Anteprima su un negozio Shopify vero (serve accesso al negozio o un development store gratuito) |

## Setup sul negozio (10 minuti)
1. **Carica il tema**: Online Store → Temi → Aggiungi tema → Connetti da GitHub (repo `team-butti`, branch) oppure Carica file .zip.
2. **Metafield prodotto** (Impostazioni → Dati personalizzati → Prodotti), servono solo finché non ci sono foto:
   `custom.jersey_type` (testo: hockey / mx / football), `custom.jersey_colors` (testo: `base,maniche,bordi,scritte`), `custom.jersey_number` (testo).
3. **Prodotto "Maglia custom"**: opzioni `Modello` (Hockey, Motocross, Football) × `Taglia` (S…XXL). Selezionalo nella sezione *Configuratore maglia*.
4. **Prodotto "Targa SoCal"**: selezionalo nella sezione *Targa custom*.
5. **Badge sulle card**: tag prodotto `badge:Nuovo`, `badge:Market`, …
6. **Filtri della griglia**: usano il *Tipo prodotto* (Hockey, Motocross, Football).


| Sezione preview | Sezione Liquid | Editabile dal Theme Editor | Dati / API Shopify |
|---|---|---|---|
| Marquee rosa | `sections/announcement-bar.liquid` (header group) | testi, colori, velocità | — |
| Header + badge logo + bag | `sections/header.liquid` | logo, menu, larghezza logo | `linklists`, `cart.item_count` |
| Hero "Cambia vibe" | `sections/hero-vibe.liquid` | blocchi "Vibe" (nome, sfondo, testo, texture, colori delle 3 maglie) + blocchi "Maglia sullo stendino", testi, CTA, scritte al click | — |
| Nastri inclinati | `sections/tapes.liquid` | testi dei 2 nastri | — |
| Griglia "Drop 01" + filtri | `sections/featured-collection.liquid` / `main-collection.liquid` | collezione, n° prodotti, filtri | `collection.products`, filtri = `collection.all_types`; fronte/retro = 1ª e 2ª foto; senza foto = maglia dai metafield; senza collezione = 8 maglie demo |
| Vista rapida | `sections/quick-view.liquid` via Section Rendering API (`?section_id=quick-view`) | — | `product.variants`, disponibilità per taglia |
| Manifesto + sticker trascinabili | `sections/manifesto.liquid` | testo (richtext, parole evidenziate), blocchi sticker (testo/stile/posizione) | — |
| Configuratore "Fattela tua" | `sections/jersey-customizer.liquid` | modelli e colori come blocchi | prodotto "Custom" con varianti modello×taglia; nome e numero come **line item properties** (`properties[Nome]`, `properties[Numero]`) |
| Ride Milano→NYC | `sections/ride.liquid` | blocchi "tappa" (titolo, testo, colore, immagine) | — |
| Targa custom | `sections/plate-builder.liquid` | testi fissi, prezzo dal prodotto | prodotto "Targa" + `properties[Testo]` |
| Poster Market + countdown | `sections/drop-countdown.liquid` | data/ora drop, testi poster, stamp on/off | — |
| Newsletter | `snippets/newsletter-form.liquid` | testi | `{% form 'customer' %}` → clienti con tag `newsletter` |
| Carrello laterale | `sections/cart-drawer.liquid` | soglia spedizione gratis | Cart AJAX API (`/cart/add.js`, `/cart/change.js`) + Section Rendering API |
| Checkout | checkout Shopify nativo | — | `name="checkout"` |
| Footer + wordmark | `sections/footer.liquid` | menu, social, testi | `shop.enabled_payment_types` |
| Loader RPM, cursore, grana | `assets/theme.js` + `assets/base.css` | on/off in Impostazioni tema → Effetti | — |
| Pagina password / pre-drop | `sections/main-password.liquid` | etichetta, data countdown | `form 'storefront_password'` + newsletter |

## Cosa serve dal brand per passare in produzione
1. Foto prodotto (fronte + retro, sfondo pulito) e foto lifestyle.
2. Listino: nome, prezzo, taglie, stock, descrizione.
3. Logo in vettoriale.
4. Testi definitivi (manifesto, spedizioni, resi, guida taglie).
5. Prossime date di drop/market.
