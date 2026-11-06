# Tileable "worn print" mask (same idea as the old SVG filter: fractal noise -> speckle holes), baked once into a PNG.
import random, zlib, struct, sys
N = 256
def lattice(f, seed):
    r = random.Random(seed); return [[r.random() for _ in range(f)] for _ in range(f)]
def value_noise(x, y, g, f):
    gx, gy = x * f / N, y * f / N; x0, y0 = int(gx) % f, int(gy) % f; x1, y1 = (x0 + 1) % f, (y0 + 1) % f
    tx, ty = gx - int(gx), gy - int(gy); sx, sy = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
    a = g[y0][x0] + (g[y0][x1] - g[y0][x0]) * sx; b = g[y1][x0] + (g[y1][x1] - g[y1][x0]) * sx
    return a + (b - a) * sy
octs = [(64, .2, lattice(64, 7)), (128, .4, lattice(128, 8)), (256, .4, lattice(256, 9))]
blot = lattice(8, 3)
rows = []
for y in range(N):
    row = bytearray([0])
    for x in range(N):
        v = sum(w * value_noise(x, y, g, f) for f, w, g in octs)
        big = value_noise(x, y, blot, 8)              # larger worn patches where the speckle gets denser
        th = 0.24 + 0.07 * big
        a = max(0.0, min(1.0, (v - th) * 14 + 0.5))     # soft-edged holes
        row += bytes((13, 13, 13, int(round(a * 255))))
    rows.append(bytes(row))
raw = b''.join(rows)
def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', N, N, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
open(sys.argv[1], 'wb').write(png)
holes = sum(1 for i in range(N * N) if raw[(i // N) * (N * 4 + 1) + 1 + (i % N) * 4 + 3] < 128)
print('png', len(png), 'bytes, holes', round(holes * 100 / (N * N), 1), '%')
