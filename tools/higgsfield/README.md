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

> **Dal tema 2.0 la moto è già quella generata con Higgsfield**: un'immagine ferma di profilo, tagliata in livelli che il tema anima da solo (ruote, sospensioni, forcellone). Come rifarla: `tools/art/moto-higgsfield/README.md`. Quello che segue è l'alternativa a sprite animato, che resta possibile.

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

---

# Moto custom Team Butti con il TUO personaggio (v1.7)

> Dalla v1.8 la moto della *Storia in moto* ha già il look Team Butti: è l'illustrazione del brand ridisegnata di profilo in vettoriale (`tools/art/bike.py`), con ruote, sospensioni e pilota animati. Questa guida resta per chi vuole sostituirla con uno sprite generato.

Obiettivo: sostituire la moto disegnata della *Storia in moto* con una moto custom Team Butti generata, guidata dal vostro personaggio (una persona della crew o una mascotte), animata e più "vera". Il tema la usa già: la moto salta le dune, si inclina sulle rampe e i frame avanzano con lo scroll.

Modelli dell'account (verificati il 18.10.2026): **Nano Banana Pro** per l'immagine (accetta più foto di riferimento e scrive bene "TEAM BUTTI"), **AutoSprite Animation** per trasformarla direttamente in uno sprite animato, **Seedance 2.0** come alternativa video.

## 0. Cosa preparare
- 3–6 foto del personaggio: una di profilo, una frontale, una a figura intera, luce buona. Se è una persona vera, che sia d'accordo.
- Come riferimento per i colori: 1–2 still life delle maglie (es. `tb-maglia-cross-merde62-bianco-rosso-front.png`) e il logo `tb-logo-nero.png`.

## 1. Immagine base: Nano Banana Pro, 16:9, risoluzione 2k
Carica le foto del personaggio + una maglia come *image references*. Sostituisci `[PERSONAGGIO]` con 1 riga che lo descrive (es. "a young man with curly dark hair and a thin moustache, from the reference photos").

```
Exact side profile (90 degrees) of a custom motocross bike with its rider, facing right, both fully visible
with margin around them, wheels not cropped. The rider is [PERSONAGGIO], same face and build as in the
reference photos, in standing attack position, elbows up, looking ahead.
BIKE: 1990s-style 250cc two-stroke dirt bike, unbranded. Hot pink plastics (#FF2E93) with yellow (#FFD400)
graphics, a leopard-print seat cover, black rims with gold hubs and gold upside-down fork, chrome expansion
chamber, knobby tyres. "TEAM BUTTI" in bold black condensed letters on the radiator shrouds. Plain white
front number plate with NO number. White side number plates with a black "69".
RIDER GEAR: motocross jersey in the Team Butti style of the reference jersey, "TEAM BUTTI" and a big 69 on
the back, matching pants, white boots, white helmet with leopard-print peak, orange mirrored goggles.
STYLE: stylized premium illustration, bold clean black outlines, flat cel-shaded colours with subtle glossy
highlights, streetwear poster look.
BACKGROUND: perfectly flat pure white, no ground, no shadow, no dust, no extra text, no logos other than
TEAM BUTTI.
```
Variante realistica: sostituisci la riga STYLE con `Photorealistic studio render, soft even light, sharp details`.
Genera 4 varianti, tieni quella con il viso più somigliante e la grafica più pulita (il 69 deve essere solo sui lati, non davanti).

## 2. Animazione: AutoSprite Animation (strada consigliata)
Input: l'immagine scelta al passo 1. Impostazioni:
- kind **custom**, name `ride`
- frame_count **24**, frame_size **512**
- remove_bg **ultra**, is_humanoid **off** (è moto + pilota)
- video_tier **pro** (turbo per una prova veloce)

Prompt:
```
The rider rides in place facing right: both wheels spin forward at constant speed, the suspension pumps
over small bumps, the rider's body and arms move naturally with the bike, the helmet bobs slightly.
The bike stays centred and does not travel across the frame. Seamless loop: the last frame matches the first.
```
Esce un PNG con tutti i frame in griglia (sfondo trasparente) + un file atlas. Mandami entrambi.

**In più, per il "da Dio":** fai una seconda animazione con la stessa immagine per i salti:
```
Mid-air motocross trick facing right: the rider does a stylish whip, kicking the rear of the bike sideways
and bringing it back straight, wheels spinning, body leaning into the trick. The bike stays centred.
Seamless loop.
```
(name `air`, 16–24 frame). Quando la moto è in aria uso questo sprite, a terra il primo.

## 2b. Alternativa video: Seedance 2.0
Start image **e** end image = l'immagine del passo 1, 4 s, 720p, audio **off**, stesso prompt del loop "ride" qui sopra. Poi:
```
./make-car-sprite.sh moto-loop.mp4 moto-sprite.webp 6 4 640
```

## 3. Mandami i file
Il modo più semplice: caricali in una cartella Google Drive condivisa con link (come avete fatto per foto e video) e mandami il link. Li scarico, li ripulisco, li converto e li collego al tema e alla demo. Nel tema finiscono in *Personalizza → Storia in moto (cross) → Sprite della moto* (colonne, righe e frame li imposto io).
