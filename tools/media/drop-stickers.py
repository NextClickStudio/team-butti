# Drop-name stickers in high quality: the new middle finger cut from the F*ck Team Butti print (yellow tee, where the
# fabric separates cleanly from the red/white/black print) and the Hot Milfs sticker; both enlarged with sharpening and
# given a white die-cut border + soft shadow, like the real Team Butti stickers.
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
media, out = sys.argv[1], sys.argv[2]

def diecut(im, border, scale):
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 90, 2))
    pad = border * 3
    big = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad), im)
    a = big.getchannel('A').point(lambda v: 255 if v > 60 else 0)
    a = Image.fromarray((ndimage.binary_dilation(np.asarray(a) > 0, iterations=border) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    white = Image.new('RGBA', big.size, (255, 255, 255, 255)); white.putalpha(a)
    shadow = Image.new('RGBA', big.size, (13, 13, 13, 255)); shadow.putalpha(a.point(lambda v: v * .55).filter(ImageFilter.GaussianBlur(6)))
    s = Image.new('RGBA', (big.width + 30, big.height + 30), (0, 0, 0, 0))
    s.alpha_composite(shadow, (18, 22)); s.alpha_composite(white, (0, 0)); s.alpha_composite(big, (0, 0))
    return s.crop(s.getbbox())

# 1. middle finger from the yellow F*ck Team Butti back print
src = Image.open(media + '/longsleeve-fck-team-butti-giallo-2.png').convert('RGBA')
x0, y0, x1, y1 = 440, 265, 790, 845
crop = src.crop((x0, y0, x1, y1)); px = np.asarray(crop).astype(int)
r, g, b, al = px[..., 0], px[..., 1], px[..., 2], px[..., 3]
fabric = (r > 170) & (g > 150) & (b < 170) & (r - b > 60) & (g - b > 40)
mask = (~fabric) & (al > 200)
mask = ndimage.binary_opening(mask, iterations=1)
lab, n = ndimage.label(mask); k = int(np.argmax(ndimage.sum(mask, lab, range(1, n + 1)))) + 1
mask = ndimage.binary_fill_holes(lab == k)
alpha = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))
crop.putalpha(alpha)
diecut(crop.crop(crop.getbbox()), 14, 1.6).save(out + '/tb-drop-sticker-medio.png', optimize=True)

# 2. Hot Milfs (the Drop Cross sticker)
hm = Image.open(media + '/../../demo/media/tb-sticker-hot-milfs.png').convert('RGBA')
diecut(hm.crop(hm.getbbox()), 12, 2.0).save(out + '/tb-drop-sticker-hot-milfs.png', optimize=True)
print('ok')
