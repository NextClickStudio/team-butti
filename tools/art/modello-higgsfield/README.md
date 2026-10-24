# Foto con il modello (Higgsfield)

Servono foto di una persona alta 1,80 m che indossa le maglie, per far capire come vestono. Le genera il team su Higgsfield: il connettore di Claude può solo leggere, non può generare.

## 1. Il personaggio, una volta sola
Crea il personaggio con **Soul ID** (o "Character"). Così ha la stessa faccia in tutte le foto.

Prompt del personaggio:

> Italian man, 25 years old, 180 cm tall, slim athletic build, short dark messy hair, light stubble, tanned skin, relaxed confident expression, natural look, no tattoos, no jewelry. Full body, standing, neutral pose. Plain light grey studio background, soft daylight, photorealistic, 35mm photo.

## 2. Una foto per maglia
Per ogni maglia:
- carica come riferimento la still life scontornata, da `demo/media/tb-maglia-*.png`;
- tieni il personaggio del punto 1;
- usa il prompt qui sotto, sostituendo `[MAGLIA]` e `[TAGLIA]`.

**Fronte**

> The same man wearing [MAGLIA], size [TAGLIA], worn loose as a streetwear jersey over black baggy jeans and white sneakers. Full body, front view, arms relaxed, slight smile. The jersey must match the reference exactly: same colors, same print, same lettering "TEAM BUTTI", same stripes. Plain light grey studio background, soft daylight, photorealistic, sharp fabric detail, 4:5 vertical.

**Retro**, dove c'è la grafica:

> Same man, same outfit, back view, looking over the shoulder. The back print must match the reference exactly. Plain light grey studio background, photorealistic, 4:5 vertical.

**Ambientata**, facoltativa: sostituisci lo sfondo con:
- `on a dusty Tuscan dirt track at golden hour, motocross bike blurred behind`;
- oppure `at a street market in Milan, daylight, people blurred in the background`.

## `[MAGLIA]` e `[TAGLIA]` da usare

| Prodotto | `[MAGLIA]` | `[TAGLIA]` consigliata (1,80 m) |
|---|---|---|
| 00 Merde Hockey (bluette, verde fluo, giallo, nero, bianco) | `an oversized ice hockey jersey, [colore], "TEAM BUTTI" on the chest, "MERDE 00" on the back` | L |
| Merde X Hockey (nero/bianco, arancione/nero) | `an oversized ice hockey jersey, [colori], pointed stripes on the sleeves, "TEAM BUTTI" on the chest, a big X on the back` | L |
| Merde 62 Motocross (bianco/rosso, nero/bianco, giallo/bluette, bianco/camo) | `a long-sleeve motocross jersey, [colori], "TEAM BUTTI" on the chest, "MERDE 62" on the back` | L |
| T-shirt Team Butti / Merde (bianca, nera) | `a heavy cotton boxy t-shirt, [colore], back print "TEAM BUTTI"` (Merde: `"TEAM BUTTI MERDE"`) | M |
| Tabacchi Ricamo (bianca, nera) | `a heavy cotton boxy t-shirt, [colore], small embroidered tobacco shop sign on the chest, big "TEAM BUTTI" on the back` | M |
| Pettorina | `a motocross chest protector with "TEAM BUTTI" on the front, worn over a plain white t-shirt` | Unica |

La taglia consigliata è un'ipotesi: va confermata provando la maglia vera su una persona di 1,80 m. Altrimenti la foto promette una vestibilità che il capo non ha.

## 3. Nel negozio
1. In Shopify carica le foto nel prodotto: prima la foto con il modello, poi le still life.
2. Aggiungi al prodotto il tag `modello:L`, con la taglia indossata nella foto.
3. La pagina prodotto mostra: "Il modello è alto 1,80 m e indossa la L". L'altezza si cambia in *Personalizza → Impostazioni tema → Maglie*.

## Da controllare in ogni foto
- Scritte e grafiche uguali al capo vero: niente lettere inventate, numeri giusti (00, 62, X).
- Mani e dita a posto.
- Stessa faccia in tutte le foto.
- Colori fedeli: il verde fluo e il bluette tendono a uscire sbagliati.
