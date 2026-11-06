# White-background still lifes -> transparent PNG. Model mask (isnet) + edge colour decontamination against white.
import sys, os, glob, numpy as np
from PIL import Image
from rembg import remove, new_session
src, dst = sys.argv[1], sys.argv[2]
sess = new_session('isnet-general-use')
files = sorted(glob.glob(os.path.join(src, '*.png')))
for n, f in enumerate(files):
    out = os.path.join(dst, os.path.basename(f))
    if os.path.exists(out): continue
    im = Image.open(f).convert('RGB')
    mask = remove(im, session=sess, only_mask=True, post_process_mask=True)
    a = np.asarray(mask, dtype=np.float32) / 255.0
    rgb = np.asarray(im, dtype=np.float32)
    # pure white far from the garment is background even if the model hesitates
    white = (rgb.min(axis=2) > 246)
    a = np.where(white & (a < 0.6), 0.0, a)
    # un-mix the white from semi-transparent edge pixels so there is no white halo on coloured cards
    m = (a > 0.02) & (a < 0.98)
    am = np.clip(a, 0.02, 1.0)[..., None]
    rgb2 = np.where(m[..., None], (rgb - (1 - am) * 255.0) / am, rgb)
    rgba = np.dstack([np.clip(rgb2, 0, 255), a * 255.0]).astype(np.uint8)
    rgba[a <= 0.02] = 0
    Image.fromarray(rgba, 'RGBA').save(out, optimize=True)
    print(n + 1, '/', len(files), os.path.basename(f), flush=True)
