# Team Butti: project memory

Read this first. It replaces rereading old chats. Write to the user in Italian, short and practical.

## What it is
- Shopify OS 2.0 theme for Team Butti (Milano streetwear: hockey, MX and football jerseys). The theme lives at the repo root; `preview/` holds the old static preview.
- Store `2m7t0k-43.myshopify.com`. Company: Fradel S.a.s. di Lorenzo Barindelli & C., P.IVA 09963340964. Customer email **fradel@teambutti.com**.
- Work branch `claude/bold-volta-1mv5ka`, draft PR NextClickStudio/team-butti#1.

## Rules (from the user)
- Never publish a theme, and never write to the MAIN theme. Upload a copy (themeDuplicate + themeFilesUpsert, body from raw GitHub at the pushed commit, check `checksumMd5`). The user publishes it, or uploads the zip from `pacchetti/`.
- No links to nextclickstudio in anything the client sees. Don't delete anything on Vercel, and don't deploy there unless asked.
- Keep the hero vibe button, the clip word bubbles and the animations.
- No model names in commits, PRs or files.
- Save credits: no screenshots unless a layout really changed; run the tests instead.

## Store state (6 Nov 2026)
- MAIN = `team-butti-countdown-tema-shopify-v4`: countdown to the launch, **Sun 08.11 at 16:20**.
- Our theme: **Team Butti 2.4.0** (gid …/OnlineStoreTheme/207484289365), unpublished. 2.3.2 = 206793900373.
- Collections:
  - Drop 02 · Off-Road `drop-02-off-road` (687836201301): 38 products in **DRAFT**, tag `drop-02`, to activate at launch. Data in `tools/shopify-setup/drop02.py`.
  - Drop Cross `drop-cross` (685474742613, template `archivio`): the old Drop 01, all at 0 stock. Previous stock is in `tools/shopify-setup/drop-cross-stock-backup.json`.
  - Felpe `felpe` and Accessori `accessori`: smart collections by product type.
- Sticker Team Butti: product 11786887823701, 5 €, 8 variants, inventory not tracked.
- Location `gid://shopify/Location/118730195285` (Corso Magenta 52). Online Store publication `gid://shopify/Publication/336916676949`.
- Pages: Contatti 165603082581 (template `contact`), Cookie 174043660629, Chi siamo 173746946389. Main menu 318492311893.
- The connector can't do: `shopPolicyUpdate` (the user pastes the policies), payments, DNS, theme publish.
- The user's guide with the open steps: https://claude.ai/artifact/P5mR4c5cKBoLA6q22m7mPw
- Open checks: Pussy Wagon longsleeve priced at 74 (file says 79 base / 74 online); the leash gift for the first 100 buyers is handled by hand; after the market (07.11), update Drop 02 stock.

## Theme map (where things are)
- `sections/`:
  - `hero-vibe`, `featured-collection` (drop grid + archive button), `main-archive` (archive page);
  - `archive-bin` (bin, disabled in index.json), `insta-car` (Cadillac towing the Instagram button), `contact-page`;
  - `video-scroll` (Cadillac road), `brand-reel`, `manifesto`, `crew-wall`, `drop-countdown` (disabled).
- `snippets/`: `product-card` (`archive:` param → `data-arch`), `sticker-upsell` (in cart-drawer + main-cart).
- `assets/theme.js`: modules by `data-tb` in `inits` (archive publishes `archivio_click`). `assets/base.css`: one block per version.
- Changelog for the client: `preview/SHOPIFY-MAP.md` ("Novità vX"). Store log: `CONNETTORE-SHOPIFY.md`.
- Version: `config/settings_schema.json` theme_version. A `url` setting can't have a URL default (Shopify rejects the whole file); put values in `config/settings_data.json` presets.

## Checks before every push
```
export NODE_PATH=/opt/node22/lib/node_modules   # global playwright; never install a local one
tools/theme-test/node_modules/.bin/shopify theme check --path .
ruby tools/theme-test/shopify-parse.rb && python3 -I tools/theme-test/check-templates.py
cd tools/theme-test && mkdir -p out && node render.js
node server.js &  node e2e.js          # port 8787, 24 tests
node build-demo.js && node demo-serve.js &  node demo-e2e.js   # port 8790, 152 tests
python3 -I tools/theme-test/pacchetti.py   # theme zips in pacchetti/ (git rm the old version's zips)
```
In a fresh container: `npm i` in tools/theme-test (liquidjs, @shopify/cli), `gem install liquid`, then delete `tools/theme-test/node_modules/playwright*`.
