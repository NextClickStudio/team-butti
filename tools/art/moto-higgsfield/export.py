# Exports the layers made by build_layers.py as the theme's WebP assets and prints the geometry for snippets/mx-bike-art.liquid.
# Usage: python3 -I export.py <layers_dir> <theme_assets_dir>
import sys, json, os
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
g = json.load(open(SRC + '/geo.json'))
W, H = g['w'], g['h']
NAMES = {'body': 'tb-moto-corpo', 'arm': 'tb-moto-forcellone', 'fork': 'tb-moto-forcella', 'wheel-rear': 'tb-moto-ruota-post', 'wheel-front': 'tb-moto-ruota-ant'}
for size, suf in ((1200, ''), (600, '-s')):
    s = size / W
    for k, n in NAMES.items():
        # premultiplied resize: no dark fringes around the transparent edges
        im = Image.open('%s/%s.png' % (SRC, k)).convert('RGBa')
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS).convert('RGBA')
        im.save('%s/%s%s.webp' % (OUT, n, suf), 'WEBP', quality=88, method=6, alpha_quality=92)
        print(n + suf, im.size, os.path.getsize('%s/%s%s.webp' % (OUT, n, suf)) // 1024, 'KB')

ra, fa = g['rear'], g['front']
pct = lambda v, d: round(v / d * 100, 3)
geo = {
    'data-wb': round((fa['cx'] - ra['cx']) / W, 4),             # wheelbase / width
    'data-cx': round((fa['cx'] + ra['cx']) / 2 / W, 4),         # between the axles / width
    'data-ground': round(g['ground'] / H, 4),                   # where the tyres touch / height
    'data-r': round((ra['r'] + fa['r']) / 2 / W, 4),            # wheel radius / width
    'data-arm': round((g['pivot'][0] - ra['cx']) / W, 4),       # rear axle to swingarm pivot, horizontal / width
    'aspect-ratio': '%d/%d' % (W, H),
    'rear wheel (left top width %)': [pct(ra['cx'] - ra['S'] / 2, W), pct(ra['cy'] - ra['S'] / 2, H), pct(ra['S'], W)],
    'front wheel (left top width %)': [pct(fa['cx'] - fa['S'] / 2, W), pct(fa['cy'] - fa['S'] / 2, H), pct(fa['S'], W)],
    'swingarm transform-origin %': [pct(ra['cx'], W), pct(ra['cy'], H)],
    'width vs the drawn bike': round((226 / 420) / ((fa['cx'] - ra['cx']) / W), 4),
    'transform-origin of .mxs__bike--art %': [pct((fa['cx'] + ra['cx']) / 2, W), pct(g['ground'], H)],
}
print(json.dumps(geo, indent=1))
