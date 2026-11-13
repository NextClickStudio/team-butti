# Drop 02 · Off-Road from DROP_7-11_SKU.xlsx (team folder "team butti nuovo drop"), as productSet inputs.
# Online price = the sheet's "PREZZO ONLINE" column (market price + 5 €). Status DRAFT: products go live at the drop.
# Photos: the still life uploaded to Shopify Files, front then back ("_RETRO"), referenced by file id.
# Usage: python3 -I tools/shopify-setup/drop02.py  ->  drop02.json (one productSet input per product)
import json, re

LOC = 'gid://shopify/Location/118730195285'
COLL = 'gid://shopify/Collection/687836201301'  # Drop Fuck (handle drop-fuck)
M = lambda n: 'gid://shopify/MediaImage/' + n
# prices: column PREZZO of DROP_7-11_SKU_DEF.xlsx (not the online +5 column)
SIZES = ['S', 'M', 'L', 'XL']
COTTON = dict(comp='100% cotone', made='Italy')
LS = dict(type='Long sleeve', price='69.00', fit='regular', sizes=SIZES, **COTTON)
HD = dict(type='Felpe', price='89.00', fit='regular', sizes=SIZES, **COTTON)
CR = dict(type='Felpe', price='49.00', fit='regular', sizes=SIZES, **COTTON)
TS = dict(type='T-shirt', price='29.00', fit='regular', sizes=SIZES, **COTTON)
OS = ['Unica']

P = [
  # title, sku code, color code, kind, stock per size, [front, back...] file ids
  ('Longsleeve Volgswagen – Panna', 'LSVOL', 'PAN', LS, [2, 3, 3, 2], ['60697176277333', '60697176244565']),
  ('Longsleeve Volgswagen – Verde militare', 'LSVOL', 'VMI', LS, [2, 3, 3, 2], ['60697177162069', '60697177129301']),
  ('Longsleeve Volgswagen – Blue navy', 'LSVOL', 'BNA', LS, [2, 3, 3, 2], ['60697176146261', '60697165824341']),
  ('Longsleeve Volgswagen – Fuxia', 'LSVOL', 'FUX', LS, [2, 3, 3, 2], ['60697176211797', '60697176179029']),
  ('Longsleeve F*ck Team Butti – Bianco ottico', 'LSFCK', 'BIO', LS, [2, 3, 3, 2], ['60697165726037', '60697173131605']),
  ('Longsleeve F*ck Team Butti – Nero', 'LSFCK', 'NER', LS, [2, 3, 3, 2], ['60697173360981', '60697173328213']),
  ('Longsleeve F*ck Team Butti – Giallo', 'LSFCK', 'GIA', LS, [2, 3, 3, 2], ['60697173262677', '60697173295445']),
  ('Longsleeve Bandoliera – Verde militare', 'LSBAN', 'VMI', LS, [2, 3, 3, 2], ['60697172705621', '60697173197141']),
  ('Longsleeve Bandoliera – Bianco ottico', 'LSBAN', 'BIO', LS, [2, 3, 3, 2], ['60697172771157', '60697172738389']),
  ('Longsleeve Bandoliera – Blue navy', 'LSBAN', 'BNA', LS, [2, 3, 3, 2], ['60697172869461', '60697165693269']),
  ('Longsleeve Uniporn – Nero', 'LSUNI', 'NER', LS, [2, 3, 3, 2], ['60697175294293', '60697175261525']),
  ('Longsleeve Uniporn – Bianco ottico', 'LSUNI', 'BIO', LS, [2, 3, 3, 2], ['60697175327061', '60697165791573']),
  ('Longsleeve Uniporn – Verde bosco', 'LSUNI', 'VBO', LS, [2, 3, 3, 2], ['60697175359829', '60697175490901']),
  ('Longsleeve Pigboy – Panna/Fragola', 'LSPIG', 'PFR', LS, [2, 3, 3, 2], ['60697173393749', '60697173459285']),
  ('Longsleeve Pigboy – Verde militare/Fragola', 'LSPIG', 'VFR', LS, [2, 3, 3, 2], ['60697165660501', '60697177227605']),
  ('Longsleeve Pigboy – Nero/Bianco', 'LSPIG', 'NBI', LS, [2, 3, 3, 2], ['60697172640085', '60697172607317']),
  ('Longsleeve Pussy Wagon – Nero', 'LSPUS', 'NER', dict(LS, price='79.00'), [2, 3, 3, 2], ['60697165758805', '60697174081877']),
  ('Longsleeve Pussy Wagon – Panna', 'LSPUS', 'PAN', dict(LS, price='79.00'), [2, 3, 3, 2], ['60697174212949', '60697174180181']),
  ('Longsleeve Pussy Wagon – Fuxia', 'LSPUS', 'FUX', dict(LS, price='79.00'), [2, 3, 3, 2], ['60697173426517', '60697173754197']),
  ('Longsleeve Pussy Wagon – Giallo', 'LSPUS', 'GIA', dict(LS, price='79.00'), [2, 3, 3, 2], ['60697174016341', '60697174049109']),
  ('Longsleeve Toy Soldier – Bluette', 'LSTOY', 'BLT', LS, [2, 3, 3, 2], ['60697175195989', '60697175130453']),
  ('Longsleeve Toy Soldier – Bianco ottico', 'LSTOY', 'BIO', LS, [2, 3, 3, 2], ['60697175163221', '60697175064917']),
  ('Longsleeve Toy Soldier – Verde militare', 'LSTOY', 'VMI', LS, [2, 3, 3, 2], ['60697175228757', '60697175392597']),
  ('Hoodie Pigboy – Nero', 'HDPIG', 'NER', HD, [2, 3, 3, 2], ['60697170903381', '60697170870613']),
  ('Hoodie Bandoliera – Verde militare', 'HDBAN', 'VMI', HD, [2, 3, 3, 2], ['60697170837845', '60697170575701']),
  ('Hoodie Pussy Wagon – Panna', 'HDPUS', 'PAN', HD, [2, 3, 3, 2], ['60697170968917', '60697170936149']),
  ('Hoodie Volgswagen – Blue navy', 'HDVOL', 'BNA', HD, [2, 3, 3, 2], ['60697171427669', '60697171198293']),
  ('Hoodie Uniporn – Verde bosco', 'HDUNI', 'VBO', HD, [2, 3, 3, 2], ['60697171001685', '60697171034453']),
  ('Logo Crewneck – Rosa', 'CRLOG', 'ROS', CR, [2, 3, 3, 2], ['60697171689813', '60697172017493']),
  ('Logo Crewneck – Nero', 'CRLOG', 'NER', dict(CR, sizes=['S', 'M', 'L']), [2, 3, 3], ['60697171558741', '60697165627733']),
  ('Logo T-shirt – Rosa', 'TSLOG', 'ROS', dict(TS, sizes=['S', 'M', 'L']), [2, 3, 3], ['60697172181333', '60697172214101']),
  ('Logo T-shirt – Nero', 'TSLOG', 'NER', dict(TS, sizes=['S', 'M', 'L']), [2, 3, 3], ['60697172148565', '60697172115797']),
  ('Helmet Beanie – Nero', 'ACBEA', 'NER', dict(type='Accessori', price='39.00', fit='cuffia', sizes=OS, **COTTON), [10], ['60697165594965', '60697170542933']),
  ('Toyoda Hockey Tee – Digital camu beige', 'HKTOY', 'DCB', dict(type='Hockey', price='150.00', fit='oversize', sizes=OS, **COTTON), [10], ['60697177194837', '60697177915733']),
  ('Fogliage Motocross – Tree camu', 'MXFOG', 'TCA', dict(type='Motocross', price='130.00', fit='regular', sizes=OS, **COTTON), [10], ['60697170379093', '60697170346325']),
  ('Grinder Merde – Rosa', 'ACGRI', 'ROS', dict(type='Accessori', price='25.00', fit='', comp='', made='China', sizes=OS), [10], ['60697170411861', '60697170444629']),
  ('Spilla Team Butti Merde – Rosa', 'ACSPI', 'ROS', dict(type='Accessori', price='5.00', fit='', comp='', made='Italy', sizes=OS), [100], []),
  # not in DROP_7-11_SKU_DEF.xlsx: kept in draft, out of the collection
  ('Leash da collo – Rosa', 'ACLEA', 'ROS', dict(type='Accessori', price='15.00', fit='', comp='', made='Italy', sizes=OS), [20], ['60697165562197']),
  ('Leash da collo – Nero', 'ACLEA', 'NER', dict(type='Accessori', price='15.00', fit='', comp='', made='', sizes=OS), [20], ['60697171460437']),
]


def handle(title):
    t = title.lower().replace('*', '').replace('–', ' ').replace('/', ' ')
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


out = []
for title, code, col, k, stock, imgs in P:
    one = k['sizes'] == OS
    li = []
    if k.get('fit'):
        li.append(f'<li>Vestibilità: {k["fit"]}</li>')
    if k.get('comp'):
        li.append(f'<li>Composizione: {k["comp"]}</li>')
    if one:
        li.append('<li>Taglia unica</li>')
    if k.get('made'):
        li.append(f'<li>Made in {k["made"]}</li>')
    desc = '<p>Team Butti · Drop Fuck. Pezzi contati.</p>' + ('<ul>' + ''.join(li) + '</ul>' if li else '')
    variants = []
    for size, q in zip(k['sizes'], stock):
        sku = f'TB2-{code}-{col}-' + ('OS' if one else size)
        variants.append({'optionValues': [{'optionName': 'Taglia', 'name': size}], 'price': k['price'],
                         'inventoryPolicy': 'DENY',
                         'inventoryItem': {'sku': sku, 'tracked': True},
                         'inventoryQuantities': [{'locationId': LOC, 'name': 'available', 'quantity': q}]})
    out.append({'title': title, 'handle': handle(title), 'vendor': 'Team Butti', 'productType': k['type'],
                'status': 'DRAFT' if not imgs or 'Leash' in title else 'ACTIVE', 'descriptionHtml': desc, 'tags': ['drop-02', 'off-road'], 'collections': [COLL],
                'productOptions': [{'name': 'Taglia', 'values': [{'name': s} for s in k['sizes']]}],
                'files': [{'id': M(i)} for i in imgs], 'variants': variants})

if __name__ == '__main__':
    json.dump(out, open('drop02.json', 'w'), ensure_ascii=False, indent=1)
    print(len(out), 'products,', sum(len(p['variants']) for p in out), 'variants,',
          sum(v['inventoryQuantities'][0]['quantity'] for p in out for v in p['variants']), 'pieces')
