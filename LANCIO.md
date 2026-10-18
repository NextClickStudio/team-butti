# Team Butti: cosa fare per andare online

Lista in ordine. Ogni punto dice dove cliccare nell'admin Shopify. Il tema è già pronto: `shopify theme check` non segnala niente e il pacchetto ufficiale di Shopify si crea senza errori.

## 1. Negozio (Impostazioni)
1. **Piano e dominio.** Scegli il piano. Collega il dominio in *Impostazioni → Domini* e impostalo come principale.
2. **Dati del negozio.** In *Impostazioni → Dettagli del negozio* metti ragione sociale, indirizzo, Partita IVA, email e telefono del servizio clienti.
3. **Pagamenti.** In *Impostazioni → Pagamenti* attiva Shopify Payments: carte, Apple Pay e Google Pay. Se vuoi aggiungi PayPal. Fai un ordine di prova in modalità test e poi rimborsalo.
4. **IVA.** In *Impostazioni → Imposte e dazi* attiva "Tutti i prezzi includono le imposte" e controlla l'IVA al 22% per l'Italia.
5. **Spedizioni.** In *Impostazioni → Spedizione e consegna* crea le zone (Italia, UE) e le tariffe. Aggiungi la tariffa gratuita sopra 100 €: il sito la promette nel bottone del video, nel carrello e nella barra in alto. Se cambi la soglia, cambiala anche in *Personalizza → Impostazioni tema → Carrello* e nel testo della barra annunci.
6. **Policy.** Compila *Impostazioni → Policy*: privacy, termini, rimborsi (il recesso di 14 giorni è obbligatorio per legge), spedizioni. Shopify ha dei modelli; falli controllare al commercialista.
7. **Cookie.** In *Impostazioni → Privacy dei clienti* attiva il banner cookie. È obbligatorio in UE.
8. **Email.** In *Impostazioni → Notifiche → Personalizza* metti logo e colori (rosa `#FF2E93`, nero `#0D0D0D`).
9. **Checkout.** In *Impostazioni → Checkout → Personalizza* metti logo e colori, lingua italiana.

## 2. Tema e contenuti
1. **Foto e video.** Caricali da *Contenuti → File → Carica file* (pacchetti `Team-Butti-media-foto.zip` e `Team-Butti-media-video.zip`, estratti). **Non rinominare i file**: il tema li cerca per nome.
2. **Tema.** In *Negozio online → Temi → Aggiungi tema → Carica file zip* scegli `Team-Butti-tema-shopify-1.7.0.zip`. Se Shopify si lamenta di file mancanti, carica `…-senza-media.zip` e scegli foto e video a mano in *Personalizza* (la tabella in `preview/SHOPIFY-MAP.md` dice cosa va dove).
3. **Pagine.** Da *Negozio online → Pagine* crea **Chi siamo** con il modello `chi-siamo`. Poi crea *Spedizioni e resi* e *Guida taglie*.
4. **Menu.** In *Contenuti → Menu*:
   - menu principale: Shop, Drop 01, Chi siamo, Spedizioni;
   - footer: Chi siamo, Spedizioni e resi, Guida taglie, Cerca.
5. **Personalizza → Impostazioni tema:**
   - *Social*: link Instagram e TikTok;
   - *SEO e condivisione*: immagine di condivisione (facoltativa, c'è già quella col logo su rosa);
   - *Logo*: facoltativo; senza logo resta il bollino rotondo Team Butti.
6. **Personalizza → Footer → Dati legali.** Scrivi ragione sociale, sede e P.IVA, per esempio `Team Butti di … · Chianni (PI) · P.IVA …`. In Italia è obbligatorio.

## 3. Prodotti
Per ogni maglia:
- **Foto**: davanti come prima foto, dietro come seconda. Il tema usa le still life scontornate (PNG trasparenti) su un fondo colorato.
- **Varianti**: taglie come varianti (S, M, L, XL, XXL), con stock vero per taglia; quelle finite risultano barrate da sole.
- **Prezzi**: prezzo e, se in saldo, "prezzo di confronto" (compare barrato).
- **Altri campi**: SKU e peso, che serve per le spedizioni.
- **Tipo prodotto**: Hockey, Motocross, T-shirt o Accessori. Diventano i filtri sopra la griglia.
- **Tag facoltativi**:
  - `badge:Nuovo` (o `badge:Ultimi`, `badge:Market`) per l'etichetta sulla card;
  - `bg:ff2e93` per il colore di sfondo della card.
- **SEO**: in fondo alla scheda, "Anteprima nei motori di ricerca", titolo e descrizione brevi.

Poi crea la collezione **Drop 01** e sceglila in *Personalizza → Griglia drop*.

Per caricare tutto in blocco hai due strade: *Prodotti → Importa* con `import/prodotti-team-butti.csv` come modello, oppure il connettore Shopify collegato a Claude, che crea i prodotti al posto tuo.

## 4. Google e social
1. **Titolo e descrizione della home.** In *Negozio online → Preferenze*, per esempio:
   - titolo: `Team Butti — maglie hockey, motocross e football · Chianni → Milano`;
   - descrizione: `Maglie da hockey, MX e football fatte a modo nostro. Dal Ranch di Chianni al Market di Milano. Pezzi limitati.`
2. **Search Console.** Collega Google Search Console al dominio e invia la sitemap `https://TUODOMINIO/sitemap.xml`. Shopify la crea da solo.
3. **Canali di vendita gratuiti.** Installa le app *Google & YouTube* (prodotti gratis su Google Shopping) e *Facebook & Instagram* (tag dei prodotti nei post).
4. **Già nel tema:**
   - dati strutturati per Google: marchio, ricerca, prodotti con prezzo e disponibilità, percorso di navigazione;
   - anteprime per WhatsApp e Instagram;
   - favicon col logo.

## 5. Prova finale (prima di togliere la password)
- [ ] **Da iPhone e da Android**: home, video, una scheda prodotto (la barra "Aggiungi alla bag" in basso), il carrello, il checkout fino al pagamento di prova.
- [ ] **Email**: arrivano conferma d'ordine e spedizione.
- [ ] **Pagina Chi siamo**: è nel menu.
- [ ] **Footer**: ci sono i dati legali.
- [ ] **Date del drop**: sono giuste (*Personalizza → Poster + countdown drop* e *Barra annunci*).

## 6. Lancio
1. Togli la password in *Negozio online → Preferenze → Protezione con password*.
2. Metti il link nella bio di Instagram e annuncia il drop.
3. Attiva in *Marketing → Automazioni* l'email per i carrelli abbandonati.
4. Dopo qualche giorno guarda *Analisi* e il *Rapporto sulla velocità* del tema.
