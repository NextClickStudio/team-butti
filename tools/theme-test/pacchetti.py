# Builds the theme zips in pacchetti/: the full one and "senza-media", where every shopify:// file reference
# (photos and videos picked in Personalizza) is dropped, for stores whose Files don't have them yet.
# Usage: python3 -I tools/theme-test/pacchetti.py
import json, os, sys, zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DIRS = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates']
version = json.load(open(os.path.join(ROOT, 'config', 'settings_schema.json')))[0]['theme_version']

def strip_media(node):
    if isinstance(node, dict):
        return {k: strip_media(v) for k, v in node.items() if not (isinstance(v, str) and v.startswith('shopify://'))}
    if isinstance(node, list):
        return [strip_media(v) for v in node]
    return node

def build(name, media):
    path = os.path.join(ROOT, 'pacchetti', name)
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for d in DIRS:
            z.write(os.path.join(ROOT, d), d + '/')
            for f in sorted(os.listdir(os.path.join(ROOT, d))):
                src, arc = os.path.join(ROOT, d, f), d + '/' + f
                if not media and d == 'templates' and f.endswith('.json'):
                    z.writestr(arc, json.dumps(strip_media(json.load(open(src))), indent=2, ensure_ascii=False) + '\n')
                else:
                    z.write(src, arc)
    print(name, os.path.getsize(path), 'byte,', len(zipfile.ZipFile(path).namelist()), 'voci')

build('Team-Butti-tema-shopify-%s.zip' % version, True)
build('Team-Butti-tema-shopify-%s-senza-media.zip' % version, False)
