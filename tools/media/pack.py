# Sticker Pack images: 1254 px transparent PNGs, stickers never enlarged, white die-cut border + soft shadow.
import sys, os
from PIL import Image, ImageFilter
d, out = sys.argv[1], sys.argv[2]
W = 1254
def cut(name, scale, rot):
    im = Image.open(os.path.join(d, name + '.png')).convert('RGBA')
    if scale < 1: im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    pad = 40
    big = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad), im)
    a = big.getchannel('A').point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(17)).filter(ImageFilter.GaussianBlur(1.2))
    border = Image.new('RGBA', big.size, (255, 255, 255, 255)); border.putalpha(a)
    shadow = Image.new('RGBA', big.size, (13, 13, 13, 255)); shadow.putalpha(a.point(lambda v: v * 0.38).filter(ImageFilter.GaussianBlur(9)))
    s = Image.new('RGBA', (big.width + 24, big.height + 24), (0, 0, 0, 0))
    s.alpha_composite(shadow, (16, 18)); s.alpha_composite(border, (0, 0)); s.alpha_composite(big, (0, 0))
    return s.rotate(rot, resample=Image.BICUBIC, expand=True)
def place(c, s, cx, cy): c.alpha_composite(s, (round(cx - s.width / 2), round(cy - s.height / 2)))
# 1. the pile
c = Image.new('RGBA', (W, W), (0, 0, 0, 0))
for name, sc, rot, x, y in [('toyoda', .78, 6, 850, 300), ('hot-milfs', .8, -8, 400, 290), ('pigboy', .95, 9, 250, 640),
                            ('dito-medio', .9, -10, 1015, 680), ('soldatino-skate', .9, 7, 1010, 1020), ('team-butti-merde', 1, -6, 360, 1000),
                            ('im-loving-it', .82, 10, 700, 1060), ('team-butti-groovy', .88, -4, 630, 620)]:
    place(c, cut(name, sc, rot), x, y)
c.save(os.path.join(out, 'sticker-pack-team-butti.png'), optimize=True)
# 2. all eight laid flat, 4 x 2
g = Image.new('RGBA', (W, W), (0, 0, 0, 0))
rows = [(['team-butti-merde', 'pigboy', 'dito-medio', 'soldatino-skate'], 290, 400, 250), (['hot-milfs', 'toyoda'], 580, 250, 660), (['im-loving-it', 'team-butti-groovy'], 580, 330, 975)]
k = 0
for row, cw, ch, cy in rows:
    for j, n in enumerate(row):
        im = Image.open(os.path.join(d, n + '.png'))
        sc = min(1, (cw - 60) / im.width, (ch - 40) / im.height)
        cx = 627 + (j - (len(row) - 1) / 2) * cw
        place(g, cut(n, sc, (-3, 2, -2, 4, 3, -4, 2, -3)[k]), cx, cy); k += 1
g.save(os.path.join(out, 'sticker-pack-team-butti-tutti.png'), optimize=True)
print('ok')
