# Fills legal/*.md with the store data into legal/compilato/, ready for Shopify (policies, Cookie policy page).
# Usage: python3 -I tools/shopify-setup/legal.py   (then node tools/shopify-setup/legal-html.js for the HTML)
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = {
    '[DATA]': '24 ottobre 2026',
    '[RAGIONE SOCIALE]': 'Fradel S.a.s.',
    '[SEDE]': 'Corso Concordia 5, 20129 Milano (MI)',
    '[P.IVA]': '09963340964',
    '[CODICE FISCALE]': '09963340964',
    '[REA]': 'MI-2124928',
    '[PEC]': 'Fradel.sas@pec.it',
    '[EMAIL]': 'leonardo@showroomn1.it',
    '[COSTO ITALIA]': '5 €',
    '[COSTO UE]': '25 €',
    '[SOGLIA GRATIS]': '100 €',
    '[TEMPI ITALIA]': '2–4 giorni lavorativi',
    '[TEMPI UE]': '4–7 giorni lavorativi',
    '[PAESI SERVITI]': "Italia, Unione Europea e alcuni paesi extra UE (l'elenco è nel checkout)",
}
# sentences that change shape, not just a value
EDITS = [
    ('Il sito **[DOMINIO]** e il negozio online Team Butti sono gestiti da:', 'Il sito e il negozio online Team Butti sono gestiti da:'),
    ('- Capitale sociale: [CAPITALE SOCIALE]\n', ''),
    ('- Telefono: [TELEFONO]\n', ''),
    ('Partita IVA: [P.IVA] · Codice fiscale: [CODICE FISCALE]', 'Partita IVA e codice fiscale: [P.IVA]'),
    ('usa [DOMINIO]', 'usa questo sito'),
    ('quando visiti [DOMINIO]', 'quando visiti questo sito'),
    ('sul sito [DOMINIO]', 'su questo sito'),
    ('a: **[INDIRIZZO RESI]**.', "all'indirizzo che ti scriviamo nella risposta alla tua richiesta di recesso."),
    ('- [CHI PAGA IL RESO]. Tieni una sola delle due frasi:\n  - *Variante A:* "Il reso è gratuito: ti mandiamo noi l\'etichetta prepagata."\n  - *Variante B:* "Le spese per rispedirci i prodotti sono a tuo carico."', '- Le spese per rispedirci i prodotti sono a tuo carico.'),
    ('- Corrieri: [CORRIERI].', '- Spediamo con corriere espresso, con tracciamento.'),
    ('con [CORRIERI]', 'con corriere espresso'),
    ('**corrieri** ([CORRIERI])', '**corrieri**'),
    ('| Unione Europea | [TEMPI UE] | [COSTO UE] | — |', '| Unione Europea | [TEMPI UE] | [COSTO UE] | 250 € |\n| Resto del mondo | indicati al checkout | 19,99 € | — |'),
]
os.makedirs(os.path.join(ROOT, 'legal', 'compilato'), exist_ok=True)
left = 0
for f in sorted(os.listdir(os.path.join(ROOT, 'legal'))):
    if not re.match(r'\d\d-.*\.md$', f): continue
    s = open(os.path.join(ROOT, 'legal', f), encoding='utf-8').read()
    for a, b in EDITS: s = s.replace(a, b)
    for a, b in DATA.items(): s = s.replace(a, b)
    rest = re.findall(r'\[[A-ZÀ-Ú][A-ZÀ-Ú0-9 ./]+\]', s)
    left += len(rest)
    if rest: print(f, 'restano', sorted(set(rest)))
    open(os.path.join(ROOT, 'legal', 'compilato', f), 'w', encoding='utf-8').write(s)
print('segnaposto rimasti:', left)
