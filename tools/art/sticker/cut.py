# Cuts the stickers out of the sheet: each gets a white die-cut border around its artwork, transparent outside.
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
sheet = Image.open(src).convert('RGB')
BOXES = {  # name: (x0, y0, x1, y1) on the 1024x1536 sheet
    'team-butti-groovy': (35, 70, 570, 418),
    'im-loving-it': (600, 75, 980, 412),
    'dito-medio': (25, 462, 342, 935),
    'hot-milfs': (390, 432, 960, 672),
    'toyoda': (372, 700, 990, 992),
    'soldatino-skate': (22, 1035, 388, 1468),
    'pigboy': (392, 1035, 670, 1468),
    'team-butti-merde': (682, 1092, 1003, 1422),
}
def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r
for name, (x0, y0, x1, y1) in BOXES.items():
    pad = 30
    crop = sheet.crop((x0, y0, x1, y1))
    a = np.asarray(crop).astype(int)
    ink = (a.min(axis=2) < 228) | ((a.max(axis=2) - a.min(axis=2)) > 28)
    ink = ndi.binary_opening(ink, structure=disk(1))
    # keep only blobs of a real size (JPEG specks out)
    lab, n = ndi.label(ink)
    sizes = ndi.sum(ink, lab, range(1, n + 1))
    ink = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 40])
    H, W = ink.shape
    big = np.zeros((H + 2 * pad, W + 2 * pad), bool); big[pad:pad + H, pad:pad + W] = ink
    shape = ndi.binary_closing(big, structure=disk(16))
    shape = ndi.binary_fill_holes(shape)
    shape = ndi.binary_dilation(shape, structure=disk(9))
    shape = ndi.binary_fill_holes(shape)
    # soft edge
    alpha = Image.fromarray((shape * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))
    alpha = Image.fromarray((np.clip((np.asarray(alpha).astype(float) - 128) * 3 + 128, 0, 255)).astype(np.uint8))
    art = Image.new('RGB', big.shape[::-1], (255, 255, 255)); art.paste(crop, (pad, pad))
    # white die-cut: everything inside the shape that was paper becomes pure white
    arr = np.asarray(art).astype(int)
    paper = (arr.min(axis=2) > 236) & ((arr.max(axis=2) - arr.min(axis=2)) < 18)
    arr[paper] = 255
    out = Image.fromarray(arr.astype(np.uint8)).convert('RGBA'); out.putalpha(alpha)
    bb = out.getbbox(); out = out.crop((max(0, bb[0] - 2), max(0, bb[1] - 2), bb[2] + 2, bb[3] + 2))
    out.save(os.path.join(outdir, 'tb-sticker-' + name + '.png'), optimize=True)
    print(name, out.size)
