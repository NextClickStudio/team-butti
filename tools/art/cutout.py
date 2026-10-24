# Still life → transparent cutout: flood-fill the white backdrop from the borders (inner whites of the garment stay),
# erode 1px against the white fringe, soften the edge, crop to the garment and centre it on a square canvas.
import sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np

def cutout(src, size, pad=0.06):
    im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(np.int16)
    mx, mn = a.max(2), a.min(2)
    white = ((mn >= 248) & (mx - mn <= 6)).astype(np.uint8) * 255
    m = Image.fromarray(white, 'L').copy(); W, H = m.size; px = m.load()
    for x in range(W):
        for y in (0, H - 1):
            if px[x, y] == 255: ImageDraw.floodfill(m, (x, y), 128)
    for y in range(H):
        for x in (0, W - 1):
            if px[x, y] == 255: ImageDraw.floodfill(m, (x, y), 128)
    bg = (np.asarray(m) == 128)
    alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8), 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    rgba = im.convert('RGBA'); rgba.putalpha(alpha)
    box = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
    rgba = rgba.crop(box)
    side = int(max(rgba.size) * (1 + 2 * pad))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(rgba, ((side - rgba.size[0]) // 2, (side - rgba.size[1]) // 2))
    return canvas.resize((size, size), Image.LANCZOS)

if __name__ == '__main__':
    src, out, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
    img = cutout(src, size)
    if len(sys.argv) > 4 and sys.argv[4] == 'q':     # lighter PNG for the demo (palette with alpha)
        img = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
    img.save(out, optimize=True)
    print(os.path.basename(out), os.path.getsize(out))
