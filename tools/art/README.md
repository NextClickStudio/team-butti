# Disegni generati

| Script | Crea | Uso |
|---|---|---|
| `moto-higgsfield/` | moto illustrata della Storia in moto (dal tema 2.0): 5 livelli WebP in `assets/tb-moto-*` | vedi `moto-higgsfield/README.md` |
| `bike.py` | `snippets/mx-bike.liquid` (moto + pilota a livelli: ruote, telaio, pilota), moto "disegnata" di riserva | `python3 bike.py ../../snippets/mx-bike.liquid` |
| `cadillac.py` | `snippets/cadillac.liquid` (Cadillac a livelli: scie, carrozzeria, ruote) | `python3 cadillac.py ../../snippets/cadillac.liquid` |
| `grunge-mask.py` | `assets/grunge-mask.png` (texture "stampa consumata" dei titoli) | `python3 grunge-mask.py ../../assets/grunge-mask.png` |
| `cutout.py` | still life scontornate (PNG trasparente, centrata) | `python3 cutout.py foto.png out.png 1200` (Pillow + NumPy) |

I veicoli sono divisi in livelli SVG separati: il tema li muove solo con `transform` (ruote che girano, sospensioni, scie), così il browser non ridisegna nulla durante lo scroll.
