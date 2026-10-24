# Cuts the Higgsfield side-view bike into animation layers.
#   wheels (spin), body (rider + frame, sprung), fork lower (unsprung, stays on the front axle),
#   swingarm (unsprung, pivots on the rear axle, drawn above the body)
# Usage: python3 -I build_layers.py <source.png> <out_dir>
import sys, json, math
import numpy as np, cv2
from PIL import Image
sys.path.insert(0, '.')
from polys import FRONT, REAR, SPRUNG

Image.MAX_IMAGE_PIXELS = None
SRC, OUT = sys.argv[1], sys.argv[2]
HALF = 0.5                                   # every coordinate below is on the half-size image
POCKETS = [49, 64, 160, 82, 102, 336, 217, 146, 130, 51, 55]   # enclosed white = background (checked by eye)
FORK_SPLIT = 1299                            # top of the pink fork guard: above it the gold tube is sprung

full = Image.open(SRC).convert('RGB')
img = np.asarray(full.resize((round(full.width * HALF), round(full.height * HALF)), Image.LANCZOS)).astype(np.float32)
H, W = img.shape[:2]
E = json.load(open('wheels.json'))
yy, xx = np.mgrid[0:H, 0:W]

def poly_mask(pts):
    m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [np.round(np.array(pts)).astype(np.int32)], 1); return m.astype(bool)
front_occ, rear_occ = poly_mask(FRONT), poly_mask(REAR)
arm_m = rear_occ & ~poly_mask(SPRUNG)
fork_low = front_occ & (yy >= FORK_SPLIT)          # unsprung part of the fork
wheel = {k: np.hypot(xx - E[k]['cx'], yy - E[k]['cy']) for k in ('rear', 'front')}
in_wheel = {k: wheel[k] <= E[k]['rx'] + 4 for k in wheel}

# ---- background: outer white, the enclosed pockets, the white between the spokes, the ground line
src = img.copy()
l0, l1 = E['line']
line_keep = (wheel['rear'] < E['rear']['rx'] + 3) | (wheel['front'] < E['front']['rx'] + 3)
src[(yy >= l0 - 3) & (yy <= l1 + 3) & ~line_keep] = 255
a = src.astype(np.int16); mn, mx = a.min(2), a.max(2)
white = ((mn >= 225) & (mx - mn <= 18)).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(white, connectivity=4)
ref = json.load(open('cands.json'))
for p in POCKETS: assert [int(v) for v in st[p]] == ref[str(p)], ('pocket label moved', p)
bg = (lab == lab[0, 0]) | np.isin(lab, POCKETS)
rimzone = (wheel['rear'] < E['rear']['rx'] * 0.77) | (wheel['front'] < E['front']['rx'] * 0.77)
occ = front_occ | rear_occ
for i in range(1, n):
    m = lab == i
    # white between the spokes, also where the fork or the swingarm passes over it (not white paint on those parts)
    if st[i][4] and rimzone[m].mean() > 0.9 and occ[m].mean() < 0.5: bg |= m
# anti-aliased black outlines next to the background: un-mix them from white
band = cv2.dilate(bg.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool) & ~bg
L = src.mean(2)
alpha = np.ones((H, W), np.float32); alpha[bg] = 0
alpha[band] = np.clip((255 - L[band]) / 235.0, 0, 1)
rgb = src.copy()
a3 = np.maximum(alpha[band], 1e-3)[:, None]
rgb[band] = np.clip((src[band] - (1 - a3) * 255) / a3, 0, 255)
base = np.dstack([rgb, alpha * 255]).astype(np.float32)

# ---- wheels: square textures centred on the axle; what the fork / swingarm hide is rebuilt by rotating the visible wheel
def wheel_tex(k, occ_mask):
    e = E[k]; R = e['rx']; S = int(math.ceil(R + 8)) * 2
    c = S / 2.0
    mx_, my_ = np.meshgrid(np.arange(S, dtype=np.float32) + 0.5 - c + e['cx'], np.arange(S, dtype=np.float32) + 0.5 - c + e['cy'])
    pm = base.copy(); pm[..., :3] *= pm[..., 3:4] / 255.0          # premultiplied for clean sampling
    tex = cv2.remap(pm, mx_ - 0.5, my_ - 0.5, cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    om = cv2.remap(occ_mask.astype(np.float32), mx_ - 0.5, my_ - 0.5, cv2.INTER_LINEAR) > 0.5
    ty, tx = np.mgrid[0:S, 0:S]; dx, dy = tx + 0.5 - c, ty + 0.5 - c
    r = np.hypot(dx, dy); th = np.arctan2(dy, dx)
    inside = r <= R + 4
    # the bottom of the tyre sat on the drawn ground line: rebuild that sector from the rest of the tyre too
    ground_touch = (r > R - 30) & (np.abs(np.degrees(th) - 90) < 16)
    om = om | ground_touch
    known = inside & ~om
    hole = inside & om
    rim_r = R * 0.72
    def rot_sample(img_, ang):                  # value of img_ at the same radius, angle + ang
        sx = c + r * np.cos(th + ang) - 0.5; sy = c + r * np.sin(th + ang) - 0.5
        return cv2.remap(img_, sx.astype(np.float32), sy.astype(np.float32), cv2.INTER_LINEAR, borderValue=0)
    # self-similarity period for each band (spokes, tyre): the rotation that best maps the wheel onto itself
    gray = tex[..., :3].mean(2) + (255 - tex[..., 3]) * 0.7
    def period(band_mask, lo, hi):
        best = None
        for deg in np.arange(lo, hi, 0.25):
            g2 = rot_sample(gray, math.radians(deg)); k2 = rot_sample(known.astype(np.float32), math.radians(deg)) > 0.99
            m = band_mask & known & k2
            if m.sum() < 500: continue
            err = np.abs(gray[m] - g2[m]).mean()
            if best is None or err < best[0]: best = (err, deg)
        return best[1]
    hub_r = R * 0.5
    bands = [(r < hub_r, period((r < hub_r) & (r > R * 0.1), 3, 60)),
             ((r >= hub_r) & (r < rim_r), period((r >= hub_r) & (r < rim_r), 3, 60)),
             (r >= rim_r, period((r >= rim_r) & inside, 3, 30))]
    print(k, 'R', round(R, 1), 'periods', [b[1] for b in bands], 'hole px', int(hole.sum()))
    out = tex.copy(); todo = hole.copy()
    for band, d in bands:
        t = todo & band
        for mult in [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 8, -8, 10, -10, 12, -12, 15, -15, 18, -18]:
            if not t.any(): break
            ang = math.radians(d * mult)
            ok = rot_sample(known.astype(np.float32), ang) > 0.99
            take = t & ok
            if take.any():
                vals = np.dstack([rot_sample(tex[..., ch], ang) for ch in range(4)])
                out[take] = vals[take]; t &= ~take
        todo &= ~(band & ~t)
    # whatever is left: the nearest visible angle at the same radius (1 degree steps)
    for deg in range(1, 180):
        if not todo.any(): break
        for ang in (math.radians(deg), -math.radians(deg)):
            ok = rot_sample(known.astype(np.float32), ang) > 0.99
            take = todo & ok
            if take.any():
                vals = np.dstack([rot_sample(tex[..., ch], ang) for ch in range(4)])
                out[take] = vals[take]; todo &= ~take
    print(k, 'unfilled', int(todo.sum()), 'max r of unfilled', float(r[todo].max()) if todo.any() else 0)
    if todo.any():   # hub centre fully under the axle clamp at every angle: inpaint from around
        pm8 = np.clip(out[..., :3], 0, 255).astype(np.uint8)
        fill = cv2.inpaint(pm8, todo.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA).astype(np.float32)
        out[todo, :3] = fill[todo]; out[todo, 3] = 255
    out[~inside] = 0
    # between the hub and the rim the only white is background seen through the spokes
    a_ = np.maximum(out[..., 3:4], 1e-3); col = out[..., :3] * 255.0 / a_
    whitish = (col.min(2) > 236) & (col.max(2) - col.min(2) < 16) & (r > R * 0.15) & (r < rim_r + 2) & (out[..., 3] > 0)
    out[whitish] = 0
    a_ = out[..., 3:4]; out[..., :3] = np.where(a_ > 0, out[..., :3] * 255.0 / np.maximum(a_, 1e-3), 0)
    return np.clip(out, 0, 255).astype(np.uint8), S

rear_tex, rS = wheel_tex('rear', rear_occ)
front_tex, fS = wheel_tex('front', front_occ)

# ---- body (sprung): everything but the wheels, the swingarm and the fork lower; holes left by those are inpainted
body = base.copy()
cut = ((in_wheel['rear'] | in_wheel['front']) & ~occ) | rear_occ | fork_low
body[cut] = 0
# under the swingarm (outside the wheels) the body keeps a copy of it: when the arm tilts, its edges never open a gap,
# and the sprung bits cut out of the arm layer (SPRUNG) show from here, moving with the body
under = rear_occ & ~in_wheel['rear'] & ~in_wheel['front']
body[under] = base[under]

arm = np.zeros_like(base); arm[arm_m] = base[arm_m]
fork = np.zeros_like(base); fork[fork_low] = base[fork_low]

# ---- crop everything to the bike, save
alpha_any = (body[..., 3] > 8) | in_wheel['rear'] | in_wheel['front']
ys, xs = np.nonzero(alpha_any)
x0, y0, x1, y1 = xs.min() - 6, ys.min() - 6, xs.max() + 7, ys.max() + 7
CW, CH = x1 - x0, y1 - y0
crop = lambda m: Image.fromarray(np.clip(m[y0:y1, x0:x1], 0, 255).astype(np.uint8), 'RGBA')
import os
os.makedirs(OUT, exist_ok=True)
crop(body).save(OUT + '/body.png'); crop(arm).save(OUT + '/arm.png'); crop(fork).save(OUT + '/fork.png')
Image.fromarray(rear_tex, 'RGBA').save(OUT + '/wheel-rear.png'); Image.fromarray(front_tex, 'RGBA').save(OUT + '/wheel-front.png')
pivot = (651.4, 1530.0)
geo = {
    'w': int(CW), 'h': int(CH),
    'rear': {'cx': E['rear']['cx'] - x0, 'cy': E['rear']['cy'] - y0, 'r': E['rear']['rx'], 'S': rS},
    'front': {'cx': E['front']['cx'] - x0, 'cy': E['front']['cy'] - y0, 'r': E['front']['rx'], 'S': fS},
    'pivot': [pivot[0] - x0, pivot[1] - y0],
    'ground': ((E['rear']['cy'] + E['rear']['rx']) + (E['front']['cy'] + E['front']['rx'])) / 2 - y0
}
json.dump(geo, open(OUT + '/geo.json', 'w'), indent=1)
print('crop', CW, CH, json.dumps(geo))
