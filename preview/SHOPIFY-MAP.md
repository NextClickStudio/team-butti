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

## Novità v1.4
- **Foto e video veri del team** (dal Drive): 4 clip nel *Video del brand* (Sterrato, Le crete, Ferragosto, Il pick-up), foto o video in ogni capitolo della *Storia in moto*, e *La nostra storia* con un montaggio di 24 secondi (tre clip verticali affiancate, con l'audio). I video iPhone sono HDR: convertiti in colori standard per il web, compressi per caricarsi veloci.
- **Foto della crew** (nuova sezione, dopo il manifesto): 20 polaroid con lo scotch e la scritta a pennarello, su due file che scorrono in direzioni opposte con lo scroll; tocchi una foto e si apre grande (frecce, swipe, Esc). Si possono aggiungere adesivi tra le foto.
- **Collegamento automatico**: la home punta ai file per nome (`shopify://shop_images/tb-crew-01.jpg`, `shopify://files/videos/tb-reel-sterrato.mp4`…). Caricati i file in *Contenuti → File* con lo stesso nome, le sezioni si riempiono da sole.
- **Tolti i prodotti personalizzati** (configuratore "Fattela tua" e targa custom): la maglia custom si fa solo dal vivo, ai market.
- **Manifesto**: torna "Non siamo nati a Los Angeles".
- **Chi siamo** (nuova pagina, template `page.chi-siamo`): il testo del brand ("Prima c'erano gli amici. Poi è arrivato il nome…") riga per riga, a caratteri enormi che entrano con lo scroll, due polaroid, nastro finale "Il resto è in movimento" e il video della storia. Sezione `sections/about-lines.liquid`, ogni riga è un blocco (testo, parole evidenziate in rosa, grandezza, pieno/contorno/pennarello, allineamento).
- **Storia in moto** riscritta sul testo del brand: Prima (gli amici) → Poi (il nome) → Qui (l'officina) → 26.09 (fuori posto, Milano) → Oggi (in movimento). *La nostra storia* in home ha il testo breve e il bottone **Chi siamo**.
- Date e luoghi nelle didascalie presi dai metadati dei video (es. Valdera, 06.08.2025).

## Media (file → sezione)
| File | Sezione → impostazione |
|---|---|
| `tb-reel-sterrato.mp4`, `tb-reel-crete.mp4`, `tb-reel-ferragosto.mp4`, `tb-reel-pickup.mp4` | Video del brand → clip 1–4 |
| `tb-mx-spinta.mp4` · `tb-mx-maglie.jpg` · `tb-mx-officina.jpg` · `tb-mx-pickup-milano.jpg` · `tb-mx-via.mp4` | Storia in moto → capitoli 1–5 |
| `tb-crew-01.jpg` … `tb-crew-21.jpg` | Foto della crew → foto 1–21 (nello stesso ordine) |
| `tb-storia-estate.mp4` | La nostra storia (video) → Video (in home e in Chi siamo) |
| `tb-mx-officina.jpg`, `tb-crew-04.jpg` | Chi siamo → le due foto tra le righe |

## Novità v1.3.1
- **Storia in moto, percorso nuovo.** Ogni capitolo ha un salto diverso: tabletop, doppio con fossa, step-down dall'altopiano, duna gigante, doppio piccolo con whoops e arrivo sotto lo striscione TEAM BUTTI. Il volo si calcola prima del terreno; la zona sotto la traiettoria viene costruita apposta e l'atterraggio è tangente alla discesa, quindi la moto non entra mai nella fossa e non decolla uscendone. Ci sono bandierine sui labbri, balle di fieno, pile di gomme e coni, e lo sfondo toscano è generato senza ripetizioni (borghi, viali di cipressi, pini, vigne, rotoballe).
- **Su telefono** i salti sono in scala con la moto, i capitoli sono più distanziati e il testo del capitolo resta fisso in alto con una dissolvenza al cambio.

## Novità v1.3
- **Storia in moto (cross)** (nuova sezione, al posto di *Il viaggio* in home): una moto da cross Team Butti (2 tempi, numero 69, pilota con la maglia del team) salta le dune toscane mentre scorri. Il terreno e i salti si generano al caricamento; la fisica dipende solo dalla posizione, quindi tornando indietro il salto si ripete identico. Ruote, sospensioni, terra sollevata, polvere all'atterraggio, "BRAAAP!" al decollo. Un capitolo per schermata, come blocco: anno, luogo, titolo, testo, foto o video, didascalia. Colori di moto e pilota modificabili. I testi dei capitoli sono provvisori: vanno sostituiti con la storia vera.
- **Cadillac v2**: assetto più basso, vernice candy con riflessi, cromature sui passaruota, scritta leopardata in rilievo, fanale acceso, braccio fuori dal finestrino, cerchi con il riflesso fisso e le razze che girano.
- **Panorama ridisegnato**: un'unica sagoma per livello con la stessa base, nessun pezzo staccato (Madonnina sulla guglia, tetto del Pirellone attaccato, Bosco Verticale a terrazzi, borgo toscano fuso con la collina).
- La sezione *Il viaggio (Cadillac)* resta disponibile nel tema, ma non è più in home.

## Novità v1.2
- **Hero ripulita**: panorama disegnato *Toscana → Milano* (colline, cipressi, borgo con torri → Duomo, Velasca, Pirellone, Bosco Verticale, UniCredit, CityLife) al posto dei palazzi con le palme; striscia-strada con bottone, percorso Toscana → Milano e suggerimento; mini Cadillac che attraversa la hero e salta quando cambi vibe. Il bottone vibe e le scritte al click sono gli stessi di prima.
- **Video del brand** (nuova sezione, subito sotto la hero): fino a 6 clip, cornice da videocamera (REC, timecode, luogo, data), il video passa da card a schermo intero con lo scroll, tab per cambiare clip con effetto glitch, audio on/off, clip verticali (Reel) con sfondo sfocato. Nascosta sul negozio finché non c'è almeno un video.
- **Cadillac a scroll** (ex *Moto a scroll*): la Cadillac del team (DeVille '66 rossa, scritta leopardata, tetto crema) viaggia dalla Toscana a Milano mentre scorri, con parallasse, cartelli A1 modificabili (blocchi), cielo giorno → tramonto rosa, contachilometri, ruote che girano, sospensioni, scia e fumo. Può usare uno **sprite Higgsfield** o un **video** a scroll: vedi `tools/higgsfield/README.md`.
- **Il viaggio (Cadillac)** (ex *Racconto in moto*): tappe Toscana → A1 → Milano → Navigli, la Cadillac al posto della moto, colline toscane vere, strada asfaltata.
- Testi: narrativa *dalla Toscana a Milano* (annuncio, hero, badge, manifesto, footer). La targa SoCal resta perché è un prodotto.

## Novità v1.1
- **Default = concept approvato**: maglie fluttuanti con parallax nella hero e disegno maglie "flat". Stendino e maglie dettagliate restano disponibili (sezione Hero → *Maglie nella hero*; Impostazioni tema → *Maglie*).
- **Video**: hero con video di sfondo, video per ogni tappa del racconto in moto, nuova sezione *Moto a scroll (video)* (clip Higgsfield che avanza con lo scroll; esportare con keyframe su ogni frame, `ffmpeg -i in.mp4 -g 1 -an -crf 24 out.mp4`), nuova sezione *La nostra storia (video)* (video Shopify o link YouTube/Vimeo, anteprima muta + Play con audio). Le sezioni video sono nascoste sul negozio finché manca il video.
- **Effetti** (Impostazioni tema → Effetti, tutti disattivabili): titoli lettera per lettera, bottoni magnetici, tendina rosa tra le pagine.
- **Zero setup**: griglia = tutti i prodotti se non scegli una collezione; configuratore e targa trovano da soli i prodotti `maglia-custom` e `targa-socal`; disegni maglia anche da tag (`jersey:hockey`, `colors:ff2e93-0d0d0d-f4f1ea-0d0d0d`, `num:69`, `bg:ffd400`, `badge:Nuovo`).

## Setup sul negozio (10 minuti)
1. **Carica il tema**: Online Store → Temi → Aggiungi tema → Connetti da GitHub (repo `team-butti`, branch) oppure Carica file .zip.
2. **Metafield prodotto** (Impostazioni → Dati personalizzati → Prodotti), servono solo finché non ci sono foto:
   `custom.jersey_type` (testo: hockey / mx / football), `custom.jersey_colors` (testo: `base,maniche,bordi,scritte`), `custom.jersey_number` (testo).
3. **Foto e video**: Contenuti → File → carica i file `tb-*` senza rinominarli (vedi la tabella *Media* sopra).
4. **Pagina Chi siamo**: Online Store → Pagine → Aggiungi pagina, titolo *Chi siamo* (indirizzo `chi-siamo`), Modello tema **chi-siamo**. Poi Navigazione → menu principale → aggiungi *Chi siamo*.
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
| Video del brand | `sections/brand-reel.liquid` | blocchi clip (video, titolo, luogo, data), sfondo, zoom con lo scroll | video da *File* (`video_tag`) |
| Chi siamo (pagina) | `templates/page.chi-siamo.json` + `sections/about-lines.liquid` | blocchi riga (testo, evidenziato, grandezza, stile, allineamento) e foto, nastro finale | — |
| Foto della crew | `sections/crew-wall.liquid` | blocchi foto (foto, scritta) e adesivi, sfondo, scorrimento on/off | immagini da *File* (`image_url`) |
| Storia in moto | `sections/mx-story.liquid` | blocchi capitolo (anno, luogo, titolo, testo, foto o video, didascalia), colori moto e paesaggio | — |
| Ride Milano→NYC | `sections/ride.liquid` | blocchi "tappa" (titolo, testo, colore, immagine) | — |
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
