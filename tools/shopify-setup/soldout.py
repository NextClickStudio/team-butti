# Sold-out products from the Drive sheet "PRODOTTI SOLD OUT" (TEAM BUTTI DROP 1 MAGAZZINO + PRODOTTI SOLD OUT.xlsx):
# 9 longsleeves (type "Long sleeve", collection "Long sleeve") and the Merde X Hockey white/red/blue, every size at 0.
# Photos = the tb-maglia-*.png cut out from "STILL LIFE TB+ PRODOTTI SOLD OUT" and loaded into Shopify Files.
# Prints the productSet inputs as JSON: python3 soldout.py > soldout.json
import json
LOC = 'gid://shopify/Location/118730195285'
LONG = 'gid://shopify/Collection/685863829845'
M = lambda n: 'gid://shopify/MediaImage/' + n
LS = dict(type='Long sleeve', fit='regular', comp='100% cotone', sizes=['S/M', 'M/L'], coll=[LONG])
HK = dict(type='Hockey', fit='oversize', comp='100% poliestere', sizes=['Unica'], coll=[])
P = [
  # handle, title, code, colour code, kind, images (front, back)
  ('longsleeve-hot-milfs-blue-navy', 'Longsleeve Hot Milfs – Blue navy', 'LSHM', 'NAV', LS, ['59845183078741', '59845183045973']),
  ('longsleeve-chiquita-giallo', 'Longsleeve Chiquita – Giallo', 'LSCH', 'GIA', LS, ['59845182882133', '59845182849365']),
  ('longsleeve-pigboy-nero', 'Longsleeve Pigboy – Nero', 'LSPB', 'NER', LS, ['59845183144277', '59845183111509']),
  ('longsleeve-horny-fucsia', 'Longsleeve Horny – Fucsia', 'LSHO', 'FUC', LS, ['59845183013205', '59845182980437']),
  ('longsleeve-bad-bull-bluette', 'Longsleeve Bad Bull – Bluette', 'LSBB', 'BLU', LS, ['59845182816597', '59845182783829']),
  ('longsleeve-pimp-my-ride-panna', 'Longsleeve Pimp My Ride – Panna', 'LSPM', 'PAN', LS, ['59845183209813', '59845183177045']),
  ('longsleeve-volgswagene-verdone', 'Longsleeve Volgswagene – Verdone', 'LSVW', 'VRD', LS, ['59845183340885', '59845183308117']),
  ('longsleeve-suckers-verde-militare', 'Longsleeve Suckers – Verde militare', 'LSSU', 'VMI', LS, ['59845183275349', '59845183242581']),
  ('longsleeve-cool-story-bianco-ottico', 'Longsleeve Cool Story – Bianco ottico', 'LSCS', 'BOT', LS, ['59845182947669', '59845182914901']),
  ('merde-x-hockey-bianco-rosso-blu', 'Merde X Hockey – Bianco/Rosso/Blu', 'MXH', 'BRB', HK, ['59845182751061', '59845182718293']),
]
out = []
for handle, title, code, col, k, imgs in P:
    one = k['sizes'] == ['Unica']
    desc = ('<p>Team Butti. Sold out.</p><ul>'
            f'<li>Vestibilità: {k["fit"]}</li><li>Composizione: {k["comp"]}</li>'
            + ('<li>Taglia unica</li>' if one else '') + '<li>Made in Italy</li></ul>')
    variants = [{'optionValues': [{'optionName': 'Taglia', 'name': s}], 'price': '0.00', 'inventoryPolicy': 'DENY',
                 'inventoryItem': {'sku': f'TB-{code}-{col}-' + ('OS' if one else s.replace('/', '')), 'tracked': True, 'countryCodeOfOrigin': 'IT'},
                 'inventoryQuantities': [{'locationId': LOC, 'name': 'available', 'quantity': 0}]} for s in k['sizes']]
    out.append({'title': title, 'handle': handle, 'vendor': 'Team Butti', 'productType': k['type'], 'status': 'ACTIVE',
                'descriptionHtml': desc, 'tags': ['sold-out'], 'collections': k['coll'],
                'productOptions': [{'name': 'Taglia', 'values': [{'name': s} for s in k['sizes']]}],
                'files': [{'id': M(i)} for i in imgs], 'variants': variants})
print(json.dumps(out, ensure_ascii=False, indent=1))
