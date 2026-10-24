---
name: brand-vibe
description: Estrae le "vibes" di un brand (da screenshot Instagram, sito, foto prodotto, reference) in un profilo strutturato e lo trasforma in una landing/shop di preview animata e interattiva, progettata per essere portata 1:1 su Shopify. Usala quando devi preparare un concept per una call con un brand, aggiornare il profilo vibe, o aggiungere una sezione/interazione coerente col brand.
---

# Brand Vibe → Preview → Shopify

Obiettivo: partire da materiale grezzo del brand e arrivare a una preview che faccia dire al proprietario "questo siamo noi", senza mai costruire qualcosa che non si possa poi rifare su Shopify.

## 1. Raccogli gli input
- Screenshot del profilo Instagram (griglia, highlight, bio), logo, foto prodotto, poster/eventi.
- Reference di siti (es. corteiz.com) → prendi **struttura e ritmo**, mai asset, loghi o testi.
- Se manca qualcosa, procedi con placeholder dichiarati e segnalalo.

## 2. Estrai il profilo vibe → `brand/<brand>.md`
Compila sempre queste sezioni, citando da quale post/elemento deriva ogni scelta:
1. **Storia in una riga**: chi sono, da dove vengono, dove guardano.
2. **Mondi/scenari**: luoghi e situazioni ricorrenti (es. sterrato, market, città USA).
3. **Prodotti chiave**: categorie e tratti distintivi (tagli, numeri, colletti, grafiche).
4. **Palette**: 5–8 colori HEX presi dai post, con ruolo (fondo, testo, accento, pop).
5. **Tipografia**: font display, testo, accento (solo Google Fonts o Shopify font library).
6. **Texture e trattamenti**: grana, distressed, halftone, pattern (leopardato, camo…).
7. **Tono di voce**: lingua, slang, ironia, parole ricorrenti, cosa NON dire.
8. **Motivi grafici**: badge, targhe, numeri, stamp, sticker, marquee.
9. **Momenti "wow"**: 3–5 interazioni che nascono DAL brand (non effetti generici).

## 3. Trasforma vibe in interazioni
Regola: ogni animazione deve raccontare un pezzo del brand. Mappa:
| Elemento del brand | Interazione |
|---|---|
| Poster con fondi diversi | Hero con "cambia vibe" che cicla le palette dei poster |
| Prodotti personalizzabili (nomi/numeri) | Configuratore live → line item properties |
| Viaggi/luoghi | Sezione a scroll orizzontale con un oggetto-simbolo che attraversa |
| Ironia, sticker, targhe | Elementi trascinabili, generatori di testo |
| Drop/eventi | Countdown, stamp SOLD OUT, marquee con date |

Rispetta `prefers-reduced-motion`, touch (niente cursore custom), e mobile-first.

## 4. Costruisci la preview → `preview/index.html`
- File unico HTML/CSS/JS vanilla, nessun build step: si apre col doppio click o da GitHub Pages/Vercel.
- Banda in alto "CONCEPT PREVIEW" sempre visibile: non è un negozio reale, nessun pagamento.
- Struttura come un vero Shopify: annuncio, header, hero, griglia prodotto, quick view (PDP), carrello laterale, newsletter, footer.
- Niente asset di terzi o loghi di squadre/marchi registrati: grafiche dei capi generate in SVG finché non arrivano le foto vere.
- Verifica con Playwright (desktop 1440 + mobile 390): zero errori in console, screenshot di controllo.

## 5. Mappa Shopify → `preview/SHOPIFY-MAP.md`
Per ogni sezione indica: sezione Liquid equivalente, impostazioni editabili nel Theme Editor, dati Shopify usati (collection, product, metafield, line item properties, Cart AJAX API, Section Rendering API). Se un'interazione non è portabile, non metterla nella preview.

## 6. Checklist prima della call
- [ ] Il profilo vibe è riconoscibile in 5 secondi (colori, font, tono).
- [ ] Almeno 3 interazioni nate dal brand funzionano su mobile.
- [ ] Carrello: aggiungi, cambia quantità, rimuovi.
- [ ] Testi in italiano con lo slang del brand.
- [ ] Mappa Shopify aggiornata.
