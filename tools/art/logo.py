# Team Butti logo: "TEAM / BUTTI" stacked, both lines the same width (as the official logo).
# Usage: python3 tools/art/logo.py <Oswald-Bold.ttf> assets/tb-logo.svg  (Oswald from Google Fonts, SIL OFL; wght 700)
import sys, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
src, out = sys.argv[1], sys.argv[2]
f = TTFont(src); gs = f.getGlyphSet(); cmap = f.getBestCmap()
def line(word):
    x = 0; parts = []
    for ch in word:
        g = cmap[ord(ch)]; parts.append((g, x)); x += f['hmtx'][g][0]
    bp = BoundsPen(gs)
    for g, dx in parts: gs[g].draw(TransformPen(bp, (1, 0, 0, 1, dx, 0)))
    return parts, bp.bounds  # xmin, ymin, xmax, ymax
W = 1000.0          # both lines are stretched to this width
GAP = 0.16          # gap between lines, in cap heights (official logo: 58 / 362)
paths = []; y = 0; caps = []
for word in ('TEAM', 'BUTTI'):
    parts, (x0, y0, x1, y1) = line(word)
    cap = y1 - y0; sy = (W / 2.33) / cap; sx = W / (x1 - x0)  # official ratio width / cap height = 2.33
    pen = SVGPathPen(gs)
    for g, dx in parts:
        # font units are y-up: flip, scale, move so the line's ink starts at (0, y)
        gs[g].draw(TransformPen(pen, (sx, 0, 0, -sy, (dx - x0) * sx, y + y1 * sy)))
    paths.append(pen.getCommands()); caps.append(cap * sy); y += cap * sy * (1 + GAP)
H = y - caps[-1] * GAP
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img" aria-label="Team Butti"><path fill="currentColor" d="%s"/></svg>' % (round(W), round(H), ' '.join(paths))
open(out, 'w').write(svg); print('logo', round(W), 'x', round(H))
