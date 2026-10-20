# Checks the JSON templates and section groups against the section schemas, the way Shopify does on upload:
# unknown settings and blocks, select values, range values (inside min/max and on the step), max_blocks.
# Shopify drops a whole template with a bad value (e.g. a range of 420 with step 25) and `shopify theme check` does not see it.
# Usage: python3 -I tools/theme-test/check-templates.py
import glob, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
errors = []

def schema(kind):
    src = open(os.path.join(ROOT, 'sections', kind + '.liquid'), encoding='utf-8').read()
    return json.loads(re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema\s*-?%}', src, re.S).group(1))

def check(values, defs, where):
    for key, v in values.items():
        d = next((x for x in defs if x.get('id') == key), None)
        if d is None:
            errors.append('%s: impostazione sconosciuta "%s"' % (where, key)); continue
        if d['type'] == 'range':
            n = (v - d['min']) / d['step']
            if not (d['min'] <= v <= d['max']) or abs(n - round(n)) > 1e-9:
                errors.append('%s: %s = %s fuori da %s–%s a passi di %s' % (where, key, v, d['min'], d['max'], d['step']))
        if d['type'] == 'select' and v not in [o['value'] for o in d['options']]:
            errors.append('%s: %s = "%s" non è tra le opzioni' % (where, key, v))

files = sorted(glob.glob(os.path.join(ROOT, 'templates', '*.json')) + glob.glob(os.path.join(ROOT, 'sections', '*.json')))
for f in files:
    data = json.load(open(f, encoding='utf-8'))
    name = os.path.relpath(f, ROOT)
    for sid, sec in data.get('sections', {}).items():
        sc = schema(sec['type'])
        check(sec.get('settings', {}), sc.get('settings', []), '%s › %s' % (name, sid))
        blocks = sec.get('blocks', {})
        if 'max_blocks' in sc and len(blocks) > sc['max_blocks']:
            errors.append('%s › %s: %d blocchi, massimo %d' % (name, sid, len(blocks), sc['max_blocks']))
        for bid, b in blocks.items():
            bd = next((x for x in sc.get('blocks', []) if x['type'] == b['type']), None)
            if bd is None:
                errors.append('%s › %s › %s: tipo di blocco sconosciuto "%s"' % (name, sid, bid, b['type'])); continue
            check(b.get('settings', {}), bd.get('settings', []), '%s › %s › %s' % (name, sid, bid))
        for t in {b['type'] for b in blocks.values()}:
            bd = next((x for x in sc.get('blocks', []) if x['type'] == t), {})
            n = sum(1 for b in blocks.values() if b['type'] == t)
            if 'limit' in bd and n > bd['limit']:
                errors.append('%s › %s: %d blocchi "%s", massimo %d' % (name, sid, n, t, bd['limit']))
for e in errors: print('FAIL', e)
print('%d file JSON, %d errori' % (len(files), len(errors)))
sys.exit(1 if errors else 0)
