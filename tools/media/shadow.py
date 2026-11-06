# drop the studio shadow / light halo: light, colourless pixels that touch the background and that the model
# also calls background. Interior white ink is enclosed by the garment, so it is never reached.
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
raw, cut2, cut1, out = sys.argv[1:5]; skip = set(sys.argv[5].split(','))
for f in sorted(os.listdir(cut2)):
    i = f[:-4]
    if i in skip: Image.open(os.path.join(cut2, f)).save(os.path.join(out, f)); continue
    rgb = np.asarray(Image.open(os.path.join(raw, f)).convert('RGB')).astype(np.float32)
    a2 = np.asarray(Image.open(os.path.join(cut2, f)), np.float32)[..., 3] / 255
    mpath = os.path.join(cut1, f) if os.path.exists(os.path.join(cut1, f)) else os.path.join(os.path.dirname(cut1), i + '-mask.png')
    mi = Image.open(mpath); ma = (np.asarray(mi, np.float32)[..., 3] if mi.mode == 'RGBA' else np.asarray(mi.convert('L'), np.float32)) / 255
    mn, mx = rgb.min(2), rgb.max(2)
    cand = (mn >= 200) & ((mx - mn) < 18) & (ma < 0.5)
    lab, _ = ndimage.label((a2 < 0.5) | cand)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); edge = edge[edge > 0]
    bg = ndimage.binary_opening(np.isin(lab, edge), iterations=1)
    a = np.asarray(Image.fromarray(((~bg) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)), np.float32) / 255
    m = (a > 0.02) & (a < 0.98); am = np.clip(a, 0.02, 1)[..., None]
    rgb2 = np.where(m[..., None], (rgb - (1 - am) * 255) / am, rgb)
    o = np.dstack([np.clip(rgb2, 0, 255), a * 255]).astype(np.uint8); o[a <= 0.02] = 0
    Image.fromarray(o, 'RGBA').save(os.path.join(out, f), optimize=True); print(i, round(float(bg.mean() - (a2 < .5).mean()), 4), flush=True)
