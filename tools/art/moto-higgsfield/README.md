# Moto Team Butti da Higgsfield, a livelli

La moto della *Storia in moto* dal tema 2.0 è l'illustrazione generata con Higgsfield (di profilo, sfondo bianco), tagliata in 5 livelli che il tema muove separatamente:

| Livello | File nel tema | Come si muove |
|---|---|---|
| Ruota posteriore e anteriore | `tb-moto-ruota-post.webp`, `tb-moto-ruota-ant.webp` | girano con la strada fatta |
| Corpo: telaio, plastiche, pilota | `tb-moto-corpo.webp` | scende quando le sospensioni lavorano (atterraggi, piccole buche) |
| Forcellone | `tb-moto-forcellone.webp` | ruota sul perno della ruota dietro e segue il corpo |
| Parte bassa della forcella | `tb-moto-forcella.webp` | resta ferma sul perno davanti: gli steli oro ci scorrono dentro |

Ogni file ha anche la versione piccola `-s` (metà larghezza) per i telefoni.

## Rifarla da un'altra immagine

Serve Python 3 con Pillow, NumPy, OpenCV e SciPy (`pip install pillow numpy opencv-python-headless scipy`).

1. **Immagine.** Di profilo perfetto (la moto va verso destra), sfondo bianco pieno, linea di terra sottile sotto le ruote, ruote intere e rotonde. Quella attuale è `hf_20261019_075654_35e0533a-….png` nella cronologia di Higgsfield.
2. **Ruote.** In `wheels.json` vanno centro e raggio di ogni ruota, misurati sull'immagine a metà risoluzione, e le righe della linea di terra.
3. **Parti davanti alle ruote.** In `polys.py`:
   - `FRONT`: la forcella;
   - `REAR`: il forcellone;
   - `SPRUNG`: le parti del corpo che cadono dentro `REAR` (staffa della pedana, tallone dello stivale).
4. **Bianchi chiusi.** I buchi bianchi chiusi, per esempio tra telaio e motore, sono sfondo. In `build_layers.py` la lista `POCKETS` li indica, controllata con `cands.json`. Con un'immagine nuova vanno rivisti a mano: lo script si ferma se non corrispondono.
5. **Lancia**, da questa cartella:
   ```
   python3 -I build_layers.py immagine.png /tmp/livelli
   python3 -I export.py /tmp/livelli ../../../assets
   ```
   `export.py` scrive i WebP in `assets/` e stampa i numeri da copiare:
   - `data-*` e posizioni delle ruote: in `snippets/mx-bike-art.liquid`;
   - larghezza e `transform-origin`: nel blocco v2.0 di `assets/base.css`.

## Come lavora build_layers.py

- **Sfondo.** Il bianco esterno, i buchi chiusi e il bianco tra i raggi diventano trasparenti. I contorni neri vengono separati dal bianco, così sul cielo non resta l'alone.
- **Ruote.** Le parti coperte da forcella e forcellone vengono ricostruite ruotando la parte visibile della ruota, a ogni passo di raggi e tasselli. Così la ruota può girare sotto di loro senza lasciare buchi.
- **Corpo.** È tutto tranne ruote, forcellone e forcella bassa. Sotto il forcellone tiene una copia, così quando il forcellone si inclina non si apre nessuna fessura.
