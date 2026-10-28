# TEAM BUTTI — Shop

Concept e tema Shopify per **Team Butti** (Instagram: [@team_butti](https://www.instagram.com/team_butti/)).

## Cosa c'è qui
| Percorso | Cosa |
|---|---|
| `layout/ sections/ snippets/ templates/ assets/ config/ locales/` | **Tema Shopify OS 2.0** pronto da caricare (validato con `shopify theme check`: 0 errori). |
| `assets/tb-jersey.js` | Motore di disegno delle maglie + animazioni (oscillazione, rotazione), condiviso da tema e preview. |
| `tools/theme-test/` | Render locale + test end-to-end del tema. |
| `preview/index.html` | Preview interattiva del sito (concept per la call). File unico: aprilo nel browser. |
| `preview/SHOPIFY-MAP.md` | Come ogni sezione della preview diventa una sezione del tema Shopify. |
| `brand/team-butti.md` | Profilo vibe del brand: palette, font, tono, motivi grafici. |
| `LANCIO.md` | Cosa fare nell'admin Shopify per andare online, in ordine. |
| `.claude/skills/brand-vibe/` | Skill di Claude Code: dalle vibes del brand alla preview, fino al porting Shopify. |

## Negozio demo online
https://team-butti-demo.vercel.app — il tema Shopify reso nel browser con un catalogo di esempio (carrello funzionante, checkout disattivato).
Su Vercel ci sono solo tre file, generati con `node tools/theme-test/vercel/pack.js <commit> <cartella>`:
- `index.html`;
- `vercel.json`;
- `api/v.js`.

Tutto ciò che sta sotto `/v/<commit>/` passa dalla funzione `api/v.js`. La funzione serve solo il commit pubblicato (niente altri commit, rami o fork) e solo i tipi di file che la demo usa, con il tipo di contenuto forzato e le intestazioni di sicurezza. Il codice arriva da jsDelivr, foto e video da GitHub. I video vengono serviti a pezzi e non finiscono nella cache del CDN; tutto il resto resta in cache per un anno, perché ogni aggiornamento ha un commit diverso nell'indirizzo. Il resto del sito va a `/index.html`, senza cache.

## Vedere la preview
- In locale: doppio click su `preview/index.html` (usa `../assets/tb-jersey.js`, tieni la cartella del repo intera).
- Online: GitHub Pages (Settings → Pages → branch, cartella `/`) e apri `/preview/`, oppure trascina la cartella `preview` su Vercel/Netlify.

## Mettere il tema su Shopify (pronto da caricare)
1. Contenuti → **File** → carica tutte le foto e i video del pacchetto *media pronti per Shopify* (`tb-*.jpg`, `tb-*.png`, `tb-*.mp4`) **senza rinominarli**: la home li trova da sola per nome (video del brand con le clip della Cadillac, storia in moto, foto della crew, la nostra storia).
2. Online Store → Temi → Aggiungi tema → **Carica file .zip** (`Team-Butti-tema-shopify-2.3.2.zip`).
3. Prodotti → Importa → `import/prodotti-team-butti.csv` (8 maglie di esempio con taglie e disegni maglia via tag; da sostituire con i prodotti veri).
4. Online Store → Pagine → crea **Chi siamo** con il modello `chi-siamo` e aggiungila al menu.
5. Pubblica il tema. La griglia mostra da sola tutti i prodotti. Niente prodotti personalizzati online: la maglia custom si fa solo dal vivo ai market.
6. Se una foto o un video non compare (file rinominato da Shopify), sceglilo a mano in Personalizza: la tabella *Media* in `preview/SHOPIFY-MAP.md` dice quale file va in quale sezione. Video del brand, storia e foto della crew restano nascosti finché i file non ci sono. **Cadillac a scroll** è già visibile con la Cadillac disegnata; per la versione Higgsfield vedi `tools/higgsfield/README.md`.

## Dettagli setup
Vedi la sezione *Setup sul negozio* in `preview/SHOPIFY-MAP.md`. In breve: Online Store → Temi → Aggiungi tema → Connetti da GitHub, poi prodotti, metafield e foto.
