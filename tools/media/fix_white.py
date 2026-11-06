# white/cream garments on white: background = pure white (>=251 on every channel) connected to the photo's border
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
raw, cut = sys.argv[1], sys.argv[2]
for i in sys.argv[3:]:
    rgb = np.asarray(Image.open(os.path.join(raw, i + '.png')).convert('RGB')).astype(np.float32)
    mn = rgb.min(axis=2)
    lab, _ = ndimage.label(mn >= 251)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); edge = edge[edge > 0]
    bg = np.isin(lab, edge)
    bg = ndimage.binary_opening(bg, iterations=1)
    fg = ndimage.binary_fill_holes(~bg)
    a = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255
    old = np.asarray(Image.open(os.path.join(cut, i + '.png')), np.float32)[..., 3] / 255
    a = np.maximum(a, old * fg)
    m = (a > 0.02) & (a < 0.98); am = np.clip(a, 0.02, 1)[..., None]
    rgb2 = np.where(m[..., None], (rgb - (1 - am) * 255) / am, rgb)
    out = np.dstack([np.clip(rgb2, 0, 255), a * 255]).astype(np.uint8); out[a <= 0.02] = 0
    Image.fromarray(out, 'RGBA').save(os.path.join(cut, i + '.png'), optimize=True); print('fixed', i)
