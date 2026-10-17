# Cadillac Team Butti con Higgsfield

Obiettivo: la Cadillac vera del team (DeVille '66 rossa, tetto in vinile crema, scritta **TEAM BUTTI** leopardata sulle portiere, cerchi neri a 5 razze col bordo lucido) che attraversa il sito mentre si scorre, al posto della moto.

Il tema funziona già con la Cadillac disegnata in SVG (`snippets/cadillac.liquid`). Higgsfield serve a sostituirla con una versione generata, più ricca. Ci sono due strade e il tema le supporta entrambe:

| Strada | Cosa generi | Dove va nel tema | Effetto |
|---|---|---|---|
| **A. Sprite (consigliata)** | Un loop di 4 s della Cadillac di profilo, ferma al centro, ruote che girano, su fondo verde | *Cadillac a scroll* → "Sprite della Cadillac" | L'auto generata attraversa il paesaggio Toscana → Milano: le ruote girano con lo scroll, con scia, fumo, sospensioni e contachilometri |
| **B. Video intero** | Un'inquadratura cinematica di 6–10 s in cui la Cadillac viaggia | *Cadillac a scroll* → "Video che avanza con lo scroll" | Il video va avanti e indietro con lo scroll e sostituisce il paesaggio disegnato |

Il connettore Higgsfield collegato a Claude può leggere l'account e lo storico, ma **non può generare**. Le generazioni vanno lanciate dall'app Higgsfield con i prompt qui sotto. Crediti al 16.10.2026: circa 589 (piano Pro).

---

## A. Sprite: la Cadillac che si muove con lo scroll

### 1. Immagine base (Nano Banana 2 / Higgsfield Image)
Carica come riferimento la foto della Cadillac (post del 23 settembre, foto 5/6). Formato 21:9 o 16:9.

```
Exact side profile (90 degrees) of the customized 1966 Cadillac Sedan de Ville from the reference photo,
facing right. Candy red-orange paint, cream white vinyl roof, huge leopard-print "TEAM BUTTI" lettering
across both doors, black five-spoke wheels with polished lips, chrome trim and bumpers.
Stylized premium illustration: bold clean black outlines, flat cel-shaded colors with subtle glossy
highlights, streetwear poster style. The whole car visible with margin around it, wheels not cropped.
Perfectly flat pure green background #00FF00, no ground, no shadow on the background, no reflections,
no extra text.
```
Variante realistica: sostituisci la riga *Stylized premium illustration…* con `Photorealistic studio render, soft even light`.

### 2. Loop delle ruote (Seedance 1.5 Pro o Seedance 2.0)
- Start image **e** end image: l'immagine del passo 1 (così il loop si chiude).
- Durata 4 s, stesso formato del passo 1, audio **off**.

```
Locked-off static camera, strict side view. The Cadillac drives in place: all wheels spin forward
continuously at constant speed and the body gently bounces on its suspension like a lowrider cruising.
The car does not move across the frame and stays perfectly centered. The background stays flat pure
green #00FF00 for the whole clip: no camera movement, no zoom, no motion blur on the background,
no new objects. Seamless loop, the last frame matches the first.
```
Extra (facoltativo), un secondo loop per il saltello: `...the front of the car hops up twice on lowrider hydraulics...`

### 3. Scontorno
Puoi usare **Video Background Remover** di Higgsfield, oppure lasciare il verde: lo toglie lo script del passo 4.

### 4. Conversione in sprite
```
./make-car-sprite.sh cadillac-loop.mp4 cadillac-sprite.webp 6 4 640
```
Crea un'unica WebP trasparente con 24 frame (6 colonne × 4 righe). In Shopify:
**Personalizza → Cadillac a scroll → Sprite della Cadillac**, colonne 6, righe 4, frame 24.
"Pixel di strada per frame" regola la velocità delle ruote (14 = di default).

Lo script è testato con una clip di prova su fondo verde: scontorno pulito, 3840×1120 px, circa 350 KB.

---

## B. Video cinematico (scroll o sezione video del brand)

**Cinema Studio Video 3.0**, 16:9, 8–10 s, 1080p, genere *action*, audio off:
```
Low tracking shot alongside a red 1966 Cadillac de Ville with leopard-print "TEAM BUTTI" lettering on
the doors, cruising on a country road between cypress trees in Tuscany at golden hour, then the highway,
arriving at the Milan skyline (Duomo spires, Torre Velasca, UniCredit tower) under a pink sunset.
Windows down, a crew wearing hockey and motocross jerseys. Constant camera speed, no cuts,
warm 35mm film grain, streetwear campaign look.
```
- Per lo scroll: `./make-scrub-video.sh clip.mp4 scroll-scrub.mp4` (un keyframe per frame, senza audio) e carica il file in *Cadillac a scroll → Video*. Nota: Shopify ricomprime i video caricati, quindi verifica la fluidità sul negozio. Lo sprite (strada A) è sempre fluido.
- Per la sezione **Video del brand** sotto la hero, rifallo in 9:16 per una versione verticale.

---

## Come farmi arrivare i file
Le generazioni Higgsfield stanno su `d8j0ntlcm91z4.cloudfront.net`. L'ambiente cloud di Claude oggi blocca quel dominio. Puoi:
1. aggiungerlo ai domini consentiti dell'ambiente (menu dell'ambiente cloud nel titolo della sessione → Edit → Network access → Allowed domains). Così Claude scarica le generazioni direttamente dallo storico; oppure
2. caricare i file nel repository GitHub, cartella `media/`.

---

# Moto da cross con Higgsfield (sezione *Storia in moto*)

La moto disegnata (`snippets/mx-bike.liquid`) funziona già. Per una versione più "vera" si genera la moto con il pilota in Higgsfield e il tema la anima uguale: la moto salta le dune, si inclina sulle rampe e i frame dello sprite avanzano con la strada percorsa.

### 1. Immagine base (Nano Banana 2 / Higgsfield Image), 16:9
Come riferimento puoi caricare una foto del team in moto (es. la KTM arancione con la maglia rosa #85, o la Suzuki gialla).

```
Exact side profile (90 degrees) of a motocross rider in standing attack position on a 2-stroke dirt bike,
facing right. Pink plastics, plain white front number plate with NO number, white side number board with
the number 69, gold upside-down fork, chrome expansion chamber, knobby tyres. Rider in a yellow jersey with
"TEAM BUTTI" and number 69 on the back, blue pants, white boots, white motocross helmet with pink peak,
orange mirrored goggles. Stylized premium illustration: bold clean black outlines, flat cel-shaded colors
with subtle glossy highlights, streetwear poster style. Bike and rider fully visible with margin, wheels
not cropped. Perfectly flat pure green background #00FF00, no ground, no shadow, no dust, no extra text.
```
Variante realistica: al posto di *Stylized premium illustration…* scrivi `Photorealistic studio render, soft even light`.

### 2. Loop (Seedance), 4 s, start image = end image = immagine del passo 1, audio off

```
Locked-off static camera, strict side view. The rider rides in place: both wheels spin forward
continuously at constant speed, the suspension works slightly over small bumps and the rider moves
naturally with the bike. The bike does not move across the frame and stays perfectly centered.
Background stays flat pure green #00FF00 for the whole clip: no camera movement, no zoom, no dust,
no motion blur on the background. Seamless loop, the last frame matches the first.
```

### 3. Sprite
```
./make-car-sprite.sh moto-loop.mp4 moto-sprite.webp 6 4 640
```
In Shopify: **Personalizza → Storia in moto (cross) → Sprite della moto**, colonne 6, righe 4, frame 24.
"Dove toccano le ruote" sposta la moto in su o in giù finché le gomme appoggiano sulla pista (92% di solito).

Il connettore Higgsfield di Claude legge lo storico delle generazioni: quando il loop è pronto basta dirlo e lo sprite si prepara da qui.
