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
| `.claude/skills/brand-vibe/` | Skill di Claude Code: dalle vibes del brand alla preview, fino al porting Shopify. |

## Negozio demo online
https://team-butti-demo.vercel.app — il tema Shopify reso nel browser con un catalogo di esempio (carrello funzionante, checkout disattivato).
Su Vercel ci sono solo `index.html` (da `tools/theme-test/demo-shell.js /cdn/ /lib/liquid.js`) e `vercel.json`, che inoltra `/cdn/*` ai file di questo repo su jsDelivr (commit fissato) e tutto il resto a `/index.html`.

## Vedere la preview
- In locale: doppio click su `preview/index.html` (usa `../assets/tb-jersey.js`, tieni la cartella del repo intera).
- Online: GitHub Pages (Settings → Pages → branch, cartella `/`) e apri `/preview/`, oppure trascina la cartella `preview` su Vercel/Netlify.

## Mettere il tema su Shopify (pronto da caricare)
1. Online Store → Temi → Aggiungi tema → **Carica file .zip** (`Team Butti-1.1.0.zip`, generato con `shopify theme package`).
2. Prodotti → Importa → `import/prodotti-team-butti.csv` (10 prodotti di esempio con varianti, taglie e disegni maglia via tag).
3. Pubblica il tema. Griglia, configuratore (`maglia-custom`) e targa (`targa-socal`) si collegano da soli.
4. Video: Personalizza → sezione **Moto a scroll (video)** per la clip Higgsfield, sezione **La nostra storia (video)** per il vostro video. Restano nascoste sul negozio finché il video non c'è.

## Dettagli setup
Vedi la sezione *Setup sul negozio* in `preview/SHOPIFY-MAP.md`. In breve: Online Store → Temi → Aggiungi tema → Connetti da GitHub, poi prodotti, metafield e foto.
