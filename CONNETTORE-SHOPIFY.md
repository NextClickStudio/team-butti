# Cosa fa Claude dentro Shopify (connettore)

Lista delle operazioni che Claude fa nel negozio con il connettore Shopify (Admin GraphQL), in quest'ordine. Il tema 2.0.1 è pubblicato. Il 2.2.0 è già caricato da Claude come tema non pubblicato (*Team Butti 2.2.0*, `gid://shopify/OnlineStoreTheme/206147846485`): lo pubblica l'utente. Lo zip è in `pacchetti/`.

Prima di ogni scrittura, Claude legge lo stato attuale e non sovrascrive niente di già compilato senza chiedere.

## Stato al 21 ottobre 2026
Fatto:
- pagina **Chi siamo** (modello `chi-siamo`);
- menu principale (Shop · Drop 01 · Chi siamo · Contatti) e menu footer (Chi siamo · Contatti · Cerca);
- collezione **Drop 01** con 28 prodotti:
  - 18 in vendita, con lo stock del foglio *TEAM BUTTI DROP 1 MAGAZZINO + PRODOTTI SOLD OUT AGGIORNATO.xlsx* sul Drive;
  - in fondo, 10 sold out: 9 longsleeve (tipo "Long sleeve", taglie S/M e M/L, retro con la grafica come prima foto) e la Merde X Hockey bianco/rosso/blu;
- prezzi = foglio + 10 €, come chiesto dal team:
  - T-shirt Team Butti e Merde 35 €;
  - Tabacchi 39 €;
  - Pettorina 45 €;
  - Merde 62 e 00 Merde 55 €;
  - Merde X 89 €;
- i sold out non hanno prezzo nel foglio: restano a 0, che il tema 2.2 non mostra;
- nessuna collezione separata per le longsleeve: stanno nel Drop 01, sotto il filtro "Long sleeve" della griglia;
- spedizioni Italia e UE: 10 € sotto i 100 €, gratis da 100 €. Resto del mondo invariato a 19,99 €.

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
