# Cosa fa Claude dentro Shopify (connettore)

Lista delle operazioni che Claude fa nel negozio con il connettore Shopify (Admin GraphQL), in quest'ordine. Il tema 2.3.1 è pubblicato dal 28 ottobre (*Team Butti 2.3.1*). Il 2.3.2 (telefono e loader) è caricato da Claude come tema non pubblicato (*Team Butti 2.3.2*): lo pubblica l'utente. Lo zip è in `pacchetti/`.

Prima di ogni scrittura, Claude legge lo stato attuale e non sovrascrive niente di già compilato senza chiedere.

## Stato al 27 ottobre 2026
Dati di Davide (27/10):
- ragione sociale **Fradel S.a.s. di Lorenzo Barindelli & C.**, legale rappresentante Lorenzo Barindelli;
- telefono +39 331 700 0849;
- email per i clienti online@teambutti.com (dominio teambutti.com, che il team ha già);
- corriere DHL: 2–3 giorni lavorativi, isole e località remote 6–10;
- magazzino e resi: Corso Magenta 52, 20123 Milano;
- **solo Italia**: UE dal 2027, resto del mondo dal 2028, quando il marchio è registrato.

Fatto da Claude il 27/10:
- spedizioni: tolte le zone UE e Internazionale; in Italia restano *Spedizione DHL* 5 € fino a 99,99 € e *Spedizione DHL gratuita* da 100 €, con i tempi nella descrizione;
- pagine **Contatti** e **Cookie policy** aggiornate con i dati nuovi;
- testi legali rifatti (`legal/compilato/html/`), con la procedura resi e cambi di Davide adattata al Codice del Consumo;
- tema 2.3.1 non pubblicato: scheda prodotto "solo Italia" e footer con la ragione sociale esatta.

Già fatto dall'utente: tema 2.3.0 pubblicato, password tolta, 4 policy incollate (testi del 24/10, da sostituire con quelli del 27/10).

28 ottobre: la "Team Butti T-shirt – Nero" con le foto era in realtà la Merde nera. Rinominata in *Team Butti Merde T-shirt – Nero* (handle `team-butti-merde-t-shirt-nera`, redirect dal vecchio indirizzo, SKU `TB-TEEM-NER-*`, stock della riga Merde nera del foglio: S 7, M 1, L 0); il doppione senza foto è stato eliminato. Drop 01 ora ha 27 prodotti.

Da fare dall'utente: dati del negozio, le 5 policy nuove, pagamenti, email ai clienti, collegare il dominio.

## Stato al 24 ottobre 2026 (storico)
Fatto:
- pagine **Chi siamo** (modello `chi-siamo`), **Contatti** (testo con email, PEC e dati Fradel; il modulo arriva con il modello `page.contact` del tema 2.3) e **Cookie policy** (`cookie-policy`, dal testo compilato);
- menu principale (Shop · Drop 01 · Chi siamo · Contatti) e menu footer (Chi siamo · Contatti · Cerca);
- collezione **Drop 01** con 28 prodotti:
  - 18 in vendita, con lo stock del foglio *TEAM BUTTI DROP 1 MAGAZZINO + PRODOTTI SOLD OUT AGGIORNATO.xlsx* sul Drive;
  - in fondo, 10 sold out: 9 longsleeve (tipo "Long sleeve") e la Merde X Hockey bianco/rosso/blu;
- prezzi = foglio + 10 €:
  - T-shirt Team Butti e Merde 35 €;
  - Tabacchi 39 €;
  - Pettorina 45 €;
  - Merde 62 e 00 Merde 55 €;
  - Merde X 89 €;
- spedizioni: Italia **5 €**, gratis da 100 €; UE **25 €**, gratis da 250 € (condizioni di Davide); resto del mondo 19,99 €;
- 8 sticker nei File (`tb-sticker-*.png`), usati dal tema 2.3.

Non fatto, perché al connettore mancano i permessi: le 5 policy (`write_legal_policies`) e il consenso cookie per i paesi UE (`write_privacy_settings`). Lo stesso vale per i dati fiscali del negozio, i pagamenti, il dominio e le notifiche, che l'API non espone. Per l'utente c'è la guida "Setup Team Butti" (artifact) con link diretti e testi da copiare. I testi pronti sono in `legal/compilato/html/`; vanno incollati in *Impostazioni → Policy*, con il pulsante `<>` per incollare l'HTML.

Dati dell'azienda:
- Fradel S.a.s. (ragione sociale esatta da confermare);
- Corso Concordia 5, 20129 Milano;
- P.IVA 09963340964;
- REA MI-2124928;
- PEC Fradel.sas@pec.it.

Le domande aperte per il team sono nel doc "Team Butti — cosa ci serve per il lancio".

Il connettore può creare un tema non pubblicato da uno zip pubblico (`themeCreate` con il link raw di GitHub) e scriverci (`themeFilesUpsert`). Se un template ha un valore che non rispetta lo schema, Shopify lo scarta senza errore: prima di caricare, lancia `tools/theme-test/check-templates.py`.

Il connettore non può scrivere sul tema pubblicato. Le modifiche al tema (soglia spedizione gratis, dati legali nel footer) vanno in una copia non pubblicata (`themeDuplicate` + `themeFilesUpsert`), che poi pubblica l'utente.

## 0. Dati del negozio
Leggi con `shop { name email contactEmail billingAddress { company address1 address2 zip city province country phone } primaryDomain { host } }`.

Usali per riempire i segnaposto in `legal/`:

| Segnaposto | Da dove arriva |
|---|---|
| `[RAGIONE SOCIALE]` | `billingAddress.company`, altrimenti `name` |
| `[SEDE]` | indirizzo di `billingAddress` |
| `[EMAIL]` | `contactEmail` |
| `[TELEFONO]` | `billingAddress.phone` |
| `[DOMINIO]` | `primaryDomain.host` |
| `[DATA]` | la data di oggi |

Quello che l'Admin API non espone va chiesto all'utente:
- P.IVA, codice fiscale, REA, PEC, capitale sociale;
- indirizzo per i resi, corrieri, paesi serviti;
- tempi e costi di spedizione Italia e UE;
- chi paga il reso.

`[SOGLIA GRATIS]` è 100 €, come promette il sito.

## 1. Policy (`shopPolicyUpdate`)
I testi vengono da `legal/*.md`, convertiti in HTML con la funzione `md()` di `tools/theme-test/build-demo.js`.

| File | Tipo di policy |
|---|---|
| `01-informazioni-legali.md` | `CONTACT_INFORMATION` |
| `02-condizioni-di-vendita.md` | `TERMS_OF_SERVICE` |
| `03-recesso-e-resi.md` | `REFUND_POLICY` |
| `04-spedizioni.md` | `SHIPPING_POLICY` |
| `05-privacy.md` | `PRIVACY_POLICY` |

Nessun segnaposto `[…]` deve restare nel testo pubblicato.

## 2. Pagine (`pageCreate`, pubblicate)
| Titolo | Handle | Modello (`templateSuffix`) | Contenuto |
|---|---|---|---|
| Chi siamo | `chi-siamo` | `chi-siamo` | vuoto: la pagina è fatta dalle sezioni del tema |
| Cookie policy | `cookie-policy` | — | `legal/06-cookie.md` compilato |
| Spedizioni e resi | `spedizioni-e-resi` | — | riassunto di tempi, costi, soglia gratis, 14 giorni di recesso, con i link a `/policies/shipping-policy` e `/policies/refund-policy` |
| Guida taglie | `guida-taglie` | — | solo se nel Drive c'è la tabella delle misure |

Il footer collega `cookie-policy` da solo (impostazione già nel tema).

## 3. Menu (`menuUpdate`)
- `main-menu`:
  - Shop → `/collections/all`;
  - Drop 01 → collezione;
  - Chi siamo → `/pages/chi-siamo`;
  - Spedizioni → `/pages/spedizioni-e-resi`.
- `footer`:
  - Chi siamo;
  - Spedizioni e resi;
  - Guida taglie (se esiste);
  - Cerca → `/search`.

## 4. Dati legali nel footer
Impostazione `legal` della sezione footer, in `sections/footer-group.json` del tema Team Butti: `Ragione sociale · Sede · P.IVA …`.

Si scrive con `themeFilesUpsert` se il connettore ha il permesso sui temi. Altrimenti lo fa l'utente in *Personalizza → Footer → Dati legali*.

## 5. Prodotti dal Drive
Per ogni maglia:
- titolo e descrizione;
- tipo prodotto: Hockey, Motocross, T-shirt o Accessori;
- tag facoltativi `badge:Nuovo` e `bg:ff2e93`;
- opzione **Taglia** con le varianti S–XXL, ciascuna con prezzo, eventuale prezzo di confronto, SKU, peso e stock;
- foto in ordine: fronte, poi retro.

Poi:
- crea la collezione **Drop 01** (`collectionCreate`) e mettici le maglie;
- pubblica prodotti e collezione sul canale Negozio online;
- se nel Drive manca un dato (peso, stock per taglia), chiedi prima di caricare.

## 6. Spedizioni (se il connettore lo permette)
Con `deliveryProfileUpdate`:
- tariffe Italia e UE;
- tariffa gratuita sopra 100 €.

Altrimenti le crea l'utente in *Impostazioni → Spedizione e consegna*.

## Solo dall'admin, a mano
Queste cose il connettore non le può fare:
- **Pagamenti**: Shopify Payments chiede verifica d'identità e IBAN.
- **Banner cookie**: *Impostazioni → Privacy dei clienti*.
- **Sicurezza**: verifica in due passaggi.
- **Dominio**.
- **Branding**: logo e colori di email e checkout.
- **Lancio**: ordine di prova, pubblicazione del tema, rimozione della password.

## Per ripartire da una sessione nuova
Prompt da incollare:

> Repo NextClickStudio/team-butti, ramo claude/bold-volta-1mv5ka. Il tema Team Butti 2.0.1 è caricato su Shopify con foto e video. Segui CONNETTORE-SHOPIFY.md con il connettore Shopify: leggi i dati del negozio, chiedimi solo quelli che mancano, poi crea policy, pagine, menu, dati legali nel footer e i prodotti dal Drive (cartella: <link>).
