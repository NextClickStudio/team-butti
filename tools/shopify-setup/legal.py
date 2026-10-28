# Fills legal/*.md with the store data into legal/compilato/, ready for Shopify (policies, Cookie policy page).
# Usage: python3 -I tools/shopify-setup/legal.py   (then node tools/shopify-setup/legal-html.js for the HTML)
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = {
    '[DATA]': '27 ottobre 2026',
    '[RAGIONE SOCIALE]': 'Fradel S.a.s. di Lorenzo Barindelli & C.',
    '[SEDE]': 'Corso Concordia 5, 20129 Milano (MI)',
    '[LEGALE RAPPRESENTANTE]': 'Lorenzo Barindelli',
    '[P.IVA]': '09963340964',
    '[CODICE FISCALE]': '09963340964',
    '[REA]': 'MI-2124928',
    '[PEC]': 'fradel.sas@pec.it',
    '[EMAIL]': 'online@teambutti.com',
    '[TELEFONO]': '+39 331 700 0849',
    '[INDIRIZZO RESI]': 'Corso Magenta 52, 20123 Milano (MI)',
    '[CORRIERI]': 'DHL',
    '[COSTO ITALIA]': '5 €',
    '[SOGLIA GRATIS]': '100 €',
    '[TEMPI ITALIA]': '2–3 giorni lavorativi',
    '[TEMPI ISOLE]': '6–10 giorni lavorativi',
    '[PAESI SERVITI]': 'Italia',
}
# sentences that change shape, not just a value
EDITS = [
    ('Il sito **[DOMINIO]** e il negozio online Team Butti sono gestiti da:', 'Il sito e il negozio online Team Butti sono gestiti da:'),
    ('- Capitale sociale: [CAPITALE SOCIALE]\n', ''),
    ('Partita IVA: [P.IVA] · Codice fiscale: [CODICE FISCALE]', 'Partita IVA e codice fiscale: [P.IVA]'),
    ('usa [DOMINIO]', 'usa questo sito'),
    ('quando visiti [DOMINIO]', 'quando visiti questo sito'),
    ('sul sito [DOMINIO]', 'su questo sito'),
    ('- Corrieri: [CORRIERI].', '- Spediamo con [CORRIERI], con tracciamento.'),
    ('Spediamo in [PAESI SERVITI] con [CORRIERI].', 'Spediamo solo in [PAESI SERVITI], con [CORRIERI].'),
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
