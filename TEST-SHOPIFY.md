# Prova del tema su Shopify, passo per passo

Obiettivo: provare tutto il sito su un negozio Shopify vero prima del lancio, con un ordine di prova, senza che nessuno lo veda.

Tempo: circa 1 ora per preparare il negozio e 1 ora per la prova.

---

## A. Prepara il negozio (una volta)

1. **Negozio di prova.** Due possibilità:
   - quello vero, con la password attiva (*Negozio online → Preferenze → Protezione con password*);
   - un *development store* gratuito da partners.shopify.com, utile per provare senza piano a pagamento.
2. **Sicurezza account.** *Impostazioni → Utenti → il tuo profilo → Sicurezza*: attiva la verifica in due passaggi.
3. **Foto e video.** *Contenuti → File → Carica file*: tutto il contenuto di `Team-Butti-media-foto.zip` e `Team-Butti-media-video.zip`, estratti, senza rinominare niente.
4. **Tema.** *Negozio online → Temi → Aggiungi tema → Carica file zip*: `Team-Butti-tema-shopify-2.0.1.zip`.
   - Se dà errore, carica `…-2.0.1-senza-media.zip`.
   - **Non pubblicarlo ancora**: usa *Anteprima*.
5. **Prodotti di prova.** *Prodotti → Importa*: `import/prodotti-team-butti.csv`. Poi crea la collezione *Drop 01* e mettici dentro le maglie.
6. **Pagine.** *Negozio online → Pagine*, crea:
   - *Chi siamo*, con modello `chi-siamo`;
   - *Cookie policy*, con indirizzo `cookie-policy`, incollando `legal/06-cookie.md`;
   - *Spedizioni e resi* e *Guida taglie*.
7. **Policy.** *Impostazioni → Policy*: incolla i testi di `legal/` come spiegato in `legal/README.md`. Per la prova vanno bene anche con i dati ancora tra parentesi quadre.
8. **Menu.** *Contenuti → Menu*:
   - principale: Shop, Drop 01, Chi siamo, Spedizioni;
   - footer: Chi siamo, Spedizioni e resi, Guida taglie, Cerca.
9. **Pagamenti di prova.**
   - Su un development store: *Impostazioni → Pagamenti → (for testing) Bogus Gateway*. Al checkout il numero di carta `1` dà pagamento riuscito, `2` pagamento rifiutato.
   - Sul negozio vero: Shopify Payments in modalità test, carta `4242 4242 4242 4242`, data futura e CVV qualsiasi.
10. **Spedizioni e IVA.**
    - *Impostazioni → Spedizione e consegna*: zona Italia con una tariffa e la tariffa gratuita da 100 €.
    - *Impostazioni → Imposte*: "Tutti i prezzi includono le imposte".
11. **Banner cookie.** *Impostazioni → Privacy dei clienti → Banner cookie*: attivo per l'UE.
12. **Personalizza.** Apri il tema in *Personalizza* e controlla:
    - *Footer → Dati legali* (anche provvisori);
    - *Social*;
    - la sezione *Griglia drop* collegata a *Drop 01*.

---

## B. Su quali dispositivi

Fai la prova completa (sezione C) su questi 4:

| Dispositivo | Browser |
|---|---|
| Mac | **Safari** (era quello con il problema della moto) |
| Mac o PC | Chrome |
| iPhone | Safari |
| Android | Chrome |

Per aprire l'anteprima sul telefono: *Temi → … → Anteprima → Condividi anteprima* e manda il link a te stesso.

---

## C. Cosa controllare

Spunta ogni riga. Se qualcosa non va, fai uno screenshot e annota dispositivo e browser.

### Home
- [ ] Il caricamento "RPM" parte e sparisce.
- [ ] Hero: cambiando "vibe" cambiano colori e maglie.
- [ ] Video del brand:
  - [ ] parte da solo;
  - [ ] compaiono i fumetti;
  - [ ] a tutto schermo compare "Scorri giù · c'è il drop";
  - [ ] il bottone "Shop il drop" porta allo shop.
- [ ] Griglia drop: 8 maglie con foto; "Scegli la taglia +" apre la vista rapida.
- [ ] Cadillac: scorrendo parte da Chianni e arriva a Milano, il contachilometri sale.
- [ ] **Storia in moto**:
  - [ ] c'è la moto illustrata (rosa, 69) e salta le dune;
  - [ ] le ruote girano, all'atterraggio la moto "affonda" sulle sospensioni;
  - [ ] i capitoli scorrono da "Gli amici" all'ultimo;
  - [ ] su Safari del Mac la moto non resta mai ferma.
- [ ] Countdown del drop e iscrizione newsletter.
- [ ] Footer:
  - [ ] link alle policy e alla Cookie policy;
  - [ ] "Preferenze cookie" riapre il banner;
  - [ ] dati legali e loghi dei pagamenti presenti.

### Navigazione
- [ ] Telefono: il menu si apre e si chiude con "Chiudi".
- [ ] Ricerca: cerca "hockey" e trovi le maglie hockey.
- [ ] Collezione: i filtri per tipo funzionano.
- [ ] Bottone "Shop" flottante: compare dopo la prima schermata e non copre mai bottoni o campi.

### Pagina prodotto
- [ ] Le foto scorrono (sul telefono con i pallini).
- [ ] Le taglie esaurite sono barrate e non si possono scegliere.
- [ ] Senza taglia il bottone chiede di sceglierla.
- [ ] Con la taglia aggiunge alla bag.
- [ ] Sotto il bottone c'è: "IVA inclusa. Spedizione calcolata al checkout. Reso entro 14 giorni · Garanzia legale 24 mesi", con i link funzionanti.
- [ ] Telefono: la barra "Aggiungi alla bag" in basso compare scorrendo e funziona.

### Carrello
- [ ] Il carrello laterale si apre.
- [ ] Quantità + e − funzionano, "Rimuovi" funziona.
- [ ] La barra "Ti mancano X € per la spedizione gratis" si aggiorna.
- [ ] La pagina carrello (`/cart`) funziona anche lei.

### Checkout di prova
- [ ] Ordine sotto i 100 €: la spedizione si paga.
- [ ] Ordine sopra i 100 €: la spedizione è gratis.
- [ ] I prezzi sono IVA inclusa.
- [ ] Nel checkout ci sono i link alle policy.
- [ ] Pagamento con la carta di prova (vedi A.9) e anche un pagamento rifiutato (`2` sul Bogus Gateway): il messaggio d'errore deve essere chiaro.
- [ ] Arriva l'email di conferma d'ordine, con logo e colori.
- [ ] *Ordini → l'ordine di prova → Rimborsa*: arriva l'email di rimborso.

### Legale e privacy
- [ ] Alla prima visita, in finestra anonima, compare il banner cookie con "Accetta" e "Rifiuta".
- [ ] Clicca "Rifiuta", poi riapri da "Preferenze cookie": la scelta è stata salvata.
- [ ] Newsletter: sotto il campo c'è l'avviso con il link all'informativa privacy.
- [ ] Iscriviti con una tua email: compari in *Clienti* come iscritto al marketing. Se hai attivato il doppio opt-in, arriva l'email di conferma.
- [ ] Ogni policy si apre dal footer e il testo è completo.

### Sicurezza (prove che puoi fare tu)
- [ ] Nella ricerca scrivi `<b>ciao</b><script>alert(1)</script>`: deve comparire come testo, senza nessuna finestrella.
- [ ] Il sito è in `https://` con il lucchetto, anche sul dominio vero quando lo colleghi.
- [ ] In *Impostazioni → Utenti* ognuno ha solo i permessi che servono e la verifica in due passaggi.
- [ ] In *App*: solo app che usi davvero.

### Velocità, Google e condivisione
- [ ] *Negozio online → Temi → Rapporto sulla velocità*, dopo qualche giorno di visite.
- [ ] pagespeed.web.dev sull'anteprima, versione mobile: annota il punteggio e mandamelo.
- [ ] search.google.com/test/rich-results su una pagina prodotto: deve trovare "Prodotto" con prezzo e disponibilità.
- [ ] Manda il link di un prodotto su WhatsApp: compare l'anteprima con foto e titolo.

### Accessibilità di base
- [ ] Da computer, con il tasto Tab, puoi raggiungere menu, prodotti e bottoni, e vedi dove sei.
- [ ] Sul telefono, con "Riduci movimento" attivo nelle impostazioni, le animazioni si calmano.

---

## D. Cosa mandarmi dopo la prova

- Screenshot di quello che non va, con dispositivo e browser (es. "iPhone 15, Safari").
- I dati legali per compilare le policy: elenco in `legal/README.md`.
- Se vuoi, il collegamento del connettore Shopify: così carico io i prodotti veri.

Quando la prova è tutta spuntata, per andare online segui `LANCIO.md`.
