# Team Butti Drop 01 from the Drive warehouse sheet (PRODOTTI DISPONIBILI), as productSet inputs (DRAFT, price to set)
import json
LOC = 'gid://shopify/Location/118730195285'
COLL = 'gid://shopify/Collection/685474742613'
M = lambda n: 'gid://shopify/MediaImage/' + n
TEE = dict(type='T-shirt', fit='slim', comp='100% cotone', sizes=['S', 'M', 'L'])
MX = dict(type='Motocross', fit='regular', comp='100% poliestere', sizes=['Unica'])
HK = dict(type='Hockey', fit='oversize', comp='100% poliestere', sizes=['Unica'])
P = [
  # handle, title, code, color code, kind, stock per size, images (first = cover)
  ('team-butti-t-shirt-bianca', 'Team Butti T-shirt – Bianco', 'TEE', 'BIA', TEE, [4, 5, 2], ['59825523065173', '59825523130709']),
  # the black tee in the photos is the Merde one: the sheet's "Team Butti T-shirt nera" row (10/5/6) was the same shirt under another name (28 Oct)
  ('team-butti-merde-t-shirt-bianca', 'Team Butti Merde T-shirt – Bianco', 'TEEM', 'BIA', TEE, [6, 5, 2], ['59825522835797', '59825522901333']),
  ('team-butti-merde-t-shirt-nera', 'Team Butti Merde T-shirt – Nero', 'TEEM', 'NER', TEE, [7, 1, 0], ['59825523163477', '59825523229013']),
  ('tabacchi-ricamo-t-shirt-bianca', 'Tabacchi Ricamo T-shirt – Bianco', 'TAB', 'BIA', TEE, [4, 8, 0], ['59825522966869', '59825522999637']),
  ('tabacchi-ricamo-t-shirt-nera', 'Tabacchi Ricamo T-shirt – Nero', 'TAB', 'NER', TEE, [9, 7, 6], ['59825523032405', '59825523097941']),
  ('team-butti-pettorina', 'Team Butti Pettorina – Bianco', 'PET', 'BIA', TEE, [14, 16, 4], ['59825522803029']),
  ('merde-62-motocross-bianco-rosso', 'Merde 62 Motocross – Bianco/Rosso', 'MX62', 'BRO', MX, [12], ['59825521525077', '59825521492309']),
  ('merde-62-motocross-nero-bianco', 'Merde 62 Motocross – Nero/Bianco', 'MX62', 'NBI', MX, [8], ['59825522016597', '59825521951061']),
  ('merde-62-motocross-giallo-bluette', 'Merde 62 Motocross – Giallo/Bluette', 'MX62', 'GBL', MX, [4], ['59825521983829', '59825521918293']),
  ('merde-62-motocross-bianco-camu', 'Merde 62 Motocross – Bianco/Camu', 'MX62', 'BCA', MX, [2], ['59825521459541', '59825521426773']),
  ('merde-x-hockey-nero-bianco', 'Merde X Hockey – Nero/Bianco', 'MXH', 'NBI', HK, [6], ['59825522770261', '59825522573653']),
  ('merde-x-hockey-arancione-nero', 'Merde X Hockey – Arancione/Nero', 'MXH', 'ARN', HK, [14], ['59825522508117', '59825522475349']),
  ('00-merde-hockey-bluette', '00 Merde Hockey – Bluette', 'H00', 'BLU', HK, [11], ['59825522213205', '59825522114901']),
  ('00-merde-hockey-verde-fluo', '00 Merde Hockey – Verde fluo', 'H00', 'VFL', HK, [17], ['59825522442581', '59825522377045']),
  ('00-merde-hockey-giallo', '00 Merde Hockey – Giallo', 'H00', 'GIA', HK, [9], ['59825522278741', '59825522245973']),
  ('00-merde-hockey-nero', '00 Merde Hockey – Nero', 'H00', 'NER', HK, [17], ['59825522344277', '59825522311509']),
  ('00-merde-hockey-bianco', '00 Merde Hockey – Bianco', 'H00', 'BIA', HK, [10], ['59825522082133', '59825522049365']),
]
out = []
for handle, title, code, col, k, stock, imgs in P:
    one = k['sizes'] == ['Unica']
    desc = ('<p>Team Butti, Drop 01. Pezzi limitati.</p><ul>'
            f'<li>Vestibilità: {k["fit"]}</li><li>Composizione: {k["comp"]}</li>'
            + ('<li>Taglia unica</li>' if one else '') + '<li>Made in Italy</li></ul>')
    variants = []
    for size, q in zip(k['sizes'], stock):
        sku = f'TB-{code}-{col}-' + ('OS' if one else size)
        variants.append({'optionValues': [{'optionName': 'Taglia', 'name': size}], 'price': '0.00',
                         'inventoryPolicy': 'DENY',
                         'inventoryItem': {'sku': sku, 'tracked': True, 'countryCodeOfOrigin': 'IT'},
                         'inventoryQuantities': [{'locationId': LOC, 'name': 'available', 'quantity': q}]})
    out.append({'title': title, 'handle': handle, 'vendor': 'Team Butti', 'productType': k['type'],
                'status': 'DRAFT', 'descriptionHtml': desc, 'tags': ['drop-01'], 'collections': [COLL],
                'productOptions': [{'name': 'Taglia', 'values': [{'name': s} for s in k['sizes']]}],
                'files': [{'id': M(i)} for i in imgs], 'variants': variants})
json.dump(out, open('products.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'products,', sum(len(p['variants']) for p in out), 'variants,', sum(v['inventoryQuantities'][0]['quantity'] for p in out for v in p['variants']), 'pieces')
