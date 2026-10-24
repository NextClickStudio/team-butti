# Testi legali Team Butti

Bozze in italiano per vendere online in Italia e nell'UE a consumatori (B2C). Sono scritte per questo negozio: drop limitati, Shopify, spedizioni in Italia e UE.

> **Prima di pubblicarle falle rileggere a un commercialista o a un avvocato.** Le norme cambiano e alcune scelte dipendono da voi: chi paga il reso, i corrieri, le app installate.

## Dove vanno incollate

| File | Dove in Shopify | Titolo |
|---|---|---|
| `01-informazioni-legali.md` | *Impostazioni → Policy → Informazioni di contatto* | Informazioni legali |
| `02-condizioni-di-vendita.md` | *Impostazioni → Policy → Termini di servizio* | Condizioni generali di vendita |
| `03-recesso-e-resi.md` | *Impostazioni → Policy → Politica di rimborso* | Diritto di recesso e resi |
| `04-spedizioni.md` | *Impostazioni → Policy → Politica di spedizione* | Spedizioni |
| `05-privacy.md` | *Impostazioni → Policy → Informativa sulla privacy* | Informativa privacy |
| `06-cookie.md` | *Negozio online → Pagine → Aggiungi pagina* | Cookie policy |

Le policy compaiono da sole:
- nel footer del sito, dal tema 1.9;
- nel checkout;
- nelle email d'ordine.

Per la Cookie policy, dopo aver creato la pagina, sceglila in *Personalizza → Footer → Pagina Cookie policy*.

## Testi già compilati
In `legal/compilato/` ci sono i testi con i dati di Fradel S.a.s. (`tools/shopify-setup/legal.py`). In `legal/compilato/html/` ci sono le versioni da incollare nelle policy di Shopify (`node tools/shopify-setup/legal-html.js`).

## Dati da compilare

Ogni dato tra parentesi quadre va sostituito, lo stesso valore in tutti i file:

| Segnaposto | Cosa scrivere | Esempio |
|---|---|---|
| `[RAGIONE SOCIALE]` | nome esatto dell'impresa | Team Butti di Mario Rossi / Team Butti S.r.l. |
| `[SEDE]` | indirizzo completo della sede legale | Via Roma 1, 56034 Chianni (PI) |
| `[P.IVA]` | Partita IVA | 01234567890 |
| `[CODICE FISCALE]` | se diverso dalla P.IVA | |
| `[REA]` | numero REA, se iscritti al Registro Imprese | PI-123456 |
| `[CAPITALE SOCIALE]` | solo per le società di capitali, altrimenti togli la riga | 10.000 € i.v. |
| `[PEC]` | indirizzo PEC | teambutti@pec.it |
| `[EMAIL]` | email del servizio clienti | ciao@teambutti.it |
| `[TELEFONO]` | facoltativo | |
| `[DOMINIO]` | dominio del negozio | teambutti.it |
| `[INDIRIZZO RESI]` | dove rispedire i resi | |
| `[CORRIERI]` | corrieri usati | BRT, Poste Italiane |
| `[PAESI SERVITI]` | dove spedite | Italia e Unione Europea |
| `[TEMPI ITALIA]` / `[TEMPI UE]` | tempi di consegna | 2–4 / 4–7 giorni lavorativi |
| `[COSTO ITALIA]` / `[COSTO UE]` | costo della spedizione standard | 6,90 € / 14,90 € |
| `[SOGLIA GRATIS]` | soglia per la spedizione gratuita (il sito oggi dice 100 €) | 100 € |
| `[CHI PAGA IL RESO]` | scegli una delle due frasi in `03-recesso-e-resi.md` | |
| `[DATA]` | data dell'ultimo aggiornamento | |

Quando mi mandi questi dati, compilo io tutti i file e il campo *Dati legali* del footer.

## Cosa è già nel tema (dalla 1.9)

- **Footer**: link a tutte le policy compilate e alla Cookie policy, link "Preferenze cookie", dati legali (ragione sociale, sede, P.IVA).
- **Newsletter**: avviso privacy con link all'informativa, sotto ogni modulo di iscrizione.
- **Scheda prodotto**: IVA inclusa, spedizione calcolata al checkout, reso in 14 giorni e garanzia legale di 24 mesi, con i link alle policy.
- **Carrello**: "Tasse incluse · Spedizione al checkout".

## Cosa attivare in Shopify

1. **Banner cookie**: *Impostazioni → Privacy dei clienti → Banner cookie*. Va attivato per UE e Regno Unito, con i pulsanti "Accetta" e "Rifiuta" ben visibili e uguali.
2. **Doppio opt-in newsletter**: *Impostazioni → Notifiche clienti → Marketing via email → conferma iscrizione*. Consigliato: lascia la prova del consenso.
3. **Termini al checkout**: *Impostazioni → Checkout*. Facoltativo: le policy sono comunque linkate nel checkout.
4. **Verifica in due passaggi** per te e per ogni collaboratore: *Impostazioni → Utenti → il tuo profilo → Sicurezza*. L'informativa privacy dice che gli accessi sono protetti così, quindi va attivata davvero.

## Note

- La piattaforma europea ODR per le controversie online è stata chiusa il 20 luglio 2025. Per questo i testi non contengono più il link ODR, che prima era obbligatorio.
- L'Accessibility Act europeo (in Italia D.Lgs. 82/2022) dal 28 giugno 2025 vale per gli e-commerce. Le microimprese (meno di 10 dipendenti e fatturato fino a 2 milioni) sono esenti. Il tema rispetta comunque contrasti, tasti da almeno 44 px e testi alternativi.
