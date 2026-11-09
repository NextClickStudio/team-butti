# Prompt da incollare nel prossimo Claude

Copia tutto quello che c'è sotto la riga e incollalo come primo messaggio (Claude Code sul web o desktop, con il repo collegato).

---

Ciao! Stai riprendendo il lavoro sul sito e-commerce di **Team Butti** (streetwear di Milano: maglie da hockey, motocross e calcio). Rispondimi in italiano, in modo breve e pratico.

## Dove si trova tutto
- **Codice**: repo GitHub `NextClickStudio/team-butti`, branch `claude/bold-volta-1mv5ka` (PR in bozza NextClickStudio/team-butti#1). Clonalo e lavora su quel branch.
- **Leggi per primo `CLAUDE.md`** nella root del repo. È la memoria del progetto e contiene:
  - regole, ID dello store, temi, collezioni e prodotti;
  - la mappa dei file;
  - i test da lanciare prima di ogni push.
- Changelog per il cliente: `preview/SHOPIFY-MAP.md`. Log delle operazioni fatte sullo store: `CONNETTORE-SHOPIFY.md`.

## Com'è collegato a Shopify
- Store: `2m7t0k-43.myshopify.com`.
- È un tema Shopify OS 2.0 e vive nella root del repo: `sections/`, `snippets/`, `assets/`, `templates/`, `config/`, `layout/`.
- Lo store si gestisce con il **connettore Shopify**, cioè le chiamate GraphQL Admin (`graphql_query` / `graphql_mutation`).
- Come si carica un tema:
  1. fai il push del commit;
  2. usa `themeFilesUpsert` con il body preso dall'URL raw di GitHub di quel commit (`https://raw.githubusercontent.com/NextClickStudio/team-butti/<commit>/<file>`);
  3. controlla che il `checksumMd5` coincida con quello del file in locale;
  4. rinomina il tema con `themeUpdate`.
- Il nostro tema è **Team Butti 2.4.8**, `gid://shopify/OnlineStoreTheme/207614411093`. Se nel frattempo l'ho pubblicato, adesso è lui il MAIN.
- **Regole fisse:**
  - Non pubblicare mai un tema e non scrivere mai sul tema MAIN.
  - Per modificare: duplica il tema attivo (`themeDuplicate`), carica le modifiche sulla copia, poi lo pubblico io.
  - In alternativa carico io lo zip da `pacchetti/`.
- Cosa il connettore non può fare: pubblicare temi, modificare le policy (`shopPolicyUpdate`), gestire pagamenti e DNS. Quelle cose le faccio io a mano.
- Tracking:
  - Google Tag Manager GTM-KCQMJ3CH, caricato solo dopo il consenso cookie (`snippets/gtm.liquid`, consent mode di Google);
  - GA4 G-4FHE3P32YP passa dall'app Google & YouTube;
  - niente GA4 doppio dentro GTM.

## Cosa serve adesso
Il sito in alcuni punti si bugga ed è un po' lento, quindi va ottimizzato.
1. Chiedimi su quale pagina e su quale dispositivo vedo il bug. Se ho uno screenshot te lo mando.
2. Sulla velocità: misura prima (Lighthouse sulla demo locale e/o sul sito vero, da telefono). Poi intervieni su:
   - immagini (`image_url` con `widths`/`sizes`, caricamento lazy);
   - video (caricamento lazy, `preload="none"`);
   - JS in `assets/theme.js` (moduli per `data-tb`);
   - CSS in `assets/base.css` (un blocco per ogni versione).
3. Non togliere: il bottone vibe della hero, le nuvolette con le parole, le animazioni, gli sticker nei nomi dei drop.
4. Prima di ogni push lancia tutti i controlli elencati in `CLAUDE.md`: theme check, parse, render, e2e, demo-e2e, pacchetti.
5. Poi:
   - aumenta la versione in `config/settings_schema.json`;
   - aggiungi una voce "Novità vX" in `preview/SHOPIFY-MAP.md`;
   - rigenera gli zip;
   - fai commit e push;
   - carica sulla copia del tema e verifica i checksum.

## Altre regole
- Nessun link a nextclickstudio in quello che vede il cliente.
- Su Vercel non cancellare niente e non fare deploy se non te lo chiedo.
- Niente nomi di modelli AI nei commit, nelle PR o nei file.
- Fai screenshot solo se cambia davvero il layout: risparmia crediti e usa i test.
- I dati personali, l'IBAN e la verifica in due passaggi li inserisco io.
