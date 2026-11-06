# Still life on white -> PNG. Background = near-white connected to the photo border, so prints, white ink and
# letters inside the garment are never removed. Large enclosed pure-white pockets (gaps between arm and body) also go.
import sys, os, glob, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, dst, thr = sys.argv[1], sys.argv[2], 250
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    rgb = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
    mn = rgb.min(axis=2); white = mn >= thr
    lab, n = ndimage.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    sizes = ndimage.sum(np.ones_like(mn), lab, index=np.arange(1, n + 1)); means = ndimage.mean(mn, lab, index=np.arange(1, n + 1))
    big = [i + 1 for i in range(n) if (i + 1) not in edge and sizes[i] > 0.004 * mn.size and means[i] >= 253.5]
    if big: bg |= np.isin(lab, big)
    bg = ndimage.binary_opening(bg, iterations=1)
    a = np.asarray(Image.fromarray(((~bg) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)), np.float32) / 255
    m = (a > 0.02) & (a < 0.98); am = np.clip(a, 0.02, 1)[..., None]
    rgb2 = np.where(m[..., None], (rgb - (1 - am) * 255) / am, rgb)
    out = np.dstack([np.clip(rgb2, 0, 255), a * 255]).astype(np.uint8); out[a <= 0.02] = 0
    Image.fromarray(out, 'RGBA').save(os.path.join(dst, os.path.basename(f)), optimize=True)
    print(os.path.basename(f), 'pockets', len(big), flush=True)
