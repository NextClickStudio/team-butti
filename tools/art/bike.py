# Generates snippets/mx-bike.liquid: Team Butti 2-stroke MX bike + rider, side view facing right.
# Layered for the GPU: wheels, chassis and rider are separate <svg> boxes that theme.js moves with transforms only.
import math, sys

def P(x, y): return (x, y)
def add(a, b, k=1): return (a[0] + b[0] * k, a[1] + b[1] * k)
def f(p): return '%.1f %.1f' % p
def poly(*pts): return 'M' + ' L'.join(f(p) for p in pts) + ' Z'
def unit(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy); return (dx / l, dy / l)

RA, FA, RT = P(92, 242), P(318, 242), 48          # axles, tyre radius (ground at y = 290)
ST = P(250, 98)                                    # top of the steering head
u = unit(ST, FA); n = (u[1], -u[0])                # fork axis (down) and its normal (forward/up)
if n[0] < 0: n = (-n[0], -n[1])
at = lambda k, m=0: add(add(ST, u, k), n, m)       # point k along the fork from ST, m forward
fork_len = math.hypot(FA[0] - ST[0], FA[1] - ST[1])
rake = math.degrees(math.atan2(u[0], u[1]))

def rect_on_fork(k0, k1, half, cls='', extra=''):
    return '<path d="%s" %s %s/>' % (poly(at(k0, -half), at(k0, half), at(k1, half), at(k1, -half)), cls, extra)

S = []   # chassis
w = S.append

w('<defs>')
w('<linearGradient id="mx-alu-{{ u }}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".5" stop-color="#aab1b7"/><stop offset="1" stop-color="#dfe3e6"/></linearGradient>')
w('<linearGradient id="mx-pipe-{{ u }}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f4f6"/><stop offset=".35" stop-color="#b3b9bf"/><stop offset=".7" stop-color="#6c737a"/><stop offset="1" stop-color="#9aa1a8"/></linearGradient>')
w('<linearGradient id="mx-gold-{{ u }}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8860b"/><stop offset=".45" stop-color="#ffd25e"/><stop offset="1" stop-color="#a87708"/></linearGradient>')
w('<linearGradient id="mx-chr-{{ u }}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d959c"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#9aa2a9"/></linearGradient>')
w('</defs>')

# --- swingarm (aluminium, tapered) + rear brake line
SP = P(188, 198)
w('<path d="M%s L%s L%s L%s Z" fill="url(#mx-alu-{{ u }})" stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"/>' % (f((SP[0], SP[1] - 8)), f((RA[0] + 4, RA[1] - 9)), f((RA[0] + 2, RA[1] + 7)), f((SP[0] + 2, SP[1] + 9))))
w('<path d="M%s L%s" stroke="#2b2b2b" stroke-width="1.6" fill="none"/>' % (f((SP[0] - 6, SP[1] - 2)), f((RA[0] + 14, RA[1] - 3))))
w('<rect x="%.1f" y="%.1f" width="16" height="11" rx="2" fill="#2c2f33" stroke="#0d0d0d" stroke-width="1.6"/>' % (RA[0] - 4, RA[1] - 6))

# --- frame: top rail, down tube, cradle (dark)
w('<path d="M%s L196 128 L186 196 M%s L234 206 L196 214 L186 198" fill="none" stroke="#24272b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' % (f(at(10, -2)), f(at(26, -1))))
w('<path d="M%s L196 128" fill="none" stroke="#4a4f55" stroke-width="2" stroke-linecap="round"/>' % f(at(10, -2)))

# --- rear shock: spring + body, between frame and swingarm link
w('<path d="M188 132 L178 196" stroke="#0d0d0d" stroke-width="9" stroke-linecap="round"/>')
w('<path d="M188 134 l-9 4 l12 4 l-12 4 l12 4 l-12 4 l12 4 l-12 4 l12 4 l-12 4 l12 4 l-9 4" fill="none" stroke="#ffd400" stroke-width="3.2" stroke-linejoin="round" transform="rotate(8 184 160)"/>')

# --- engine: crankcase, cylinder with fins, clutch cover, kickstarter
w('<path d="M200 176 L242 172 Q248 172 248 180 L246 208 Q245 220 232 222 L210 224 Q198 224 196 212 Z" fill="#3b3f44" stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"/>')
w('<path d="M206 146 L240 140 L246 174 L210 180 Z" fill="#5a5f65" stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"/>')
w('<path d="M208 152 L241 146 M209 158 L242 152 M210 164 L243 158 M211 170 L244 164" stroke="#2c3035" stroke-width="2.2"/>')
w('<circle cx="222" cy="200" r="13.5" fill="url(#mx-alu-{{ u }})" stroke="#0d0d0d" stroke-width="2"/>')
w('<circle cx="222" cy="200" r="7" fill="none" stroke="#7d858c" stroke-width="1.6"/>')
w('<g fill="#0d0d0d"><circle cx="222" cy="187.5" r="1.3"/><circle cx="233" cy="206" r="1.3"/><circle cx="211" cy="206" r="1.3"/></g>')
w('<path d="M230 194 L206 186" stroke="#0d0d0d" stroke-width="6" stroke-linecap="round"/><path d="M230 194 L206 186" stroke="#9aa1a8" stroke-width="3" stroke-linecap="round"/>')
w('<path d="M207 186 L203 180" stroke="#0d0d0d" stroke-width="5" stroke-linecap="round"/>')

# --- expansion chamber (fat 2-stroke pipe) + silencer
pipe = 'M244 160 C270 162 276 196 254 210 C236 220 206 218 186 204 C170 192 150 170 128 160'
w('<path d="%s" fill="none" stroke="#0d0d0d" stroke-width="19" stroke-linecap="round"/>' % pipe)
w('<path d="%s" fill="none" stroke="url(#mx-pipe-{{ u }})" stroke-width="14" stroke-linecap="round"/>' % pipe)
w('<path d="M262 178 C266 190 262 200 254 206" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>')
w('<path d="M134 160 L70 144" stroke="#0d0d0d" stroke-width="17" stroke-linecap="round"/>')
w('<path d="M134 160 L70 144" stroke="#2f3236" stroke-width="12" stroke-linecap="round"/>')
w('<path d="M120 154 L78 143" stroke="#4d5359" stroke-width="3" stroke-linecap="round"/>')
w('<path d="M74 139 L70 151" stroke="url(#mx-chr-{{ u }})" stroke-width="5" stroke-linecap="round"/>')

# --- rear fender + side number board (flat to the viewer: number upright)
w('<path d="M134 136 L46 118 Q42 117 43 122 L48 130 L132 154 Z" class="mx-plastic" stroke="#0d0d0d" stroke-width="2.6" stroke-linejoin="round"/>')
w('<path d="M118 146 L186 136 Q190 136 190 141 L186 178 Q185 183 180 184 L128 190 Q122 190 121 184 Z" fill="#f4f1ea" stroke="#0d0d0d" stroke-width="2.6" stroke-linejoin="round"/>')
w('<path d="M121 152 L188 142" stroke="#0d0d0d" stroke-width="3" opacity=".9"/>')
w('<text class="mx__num" x="154" y="180" font-size="34" text-anchor="middle">{{ n | escape }}</text>')

# --- seat
w('<path d="M118 138 L246 112 Q256 111 254 120 L126 150 Q114 152 118 138 Z" fill="#151515" stroke="#0d0d0d" stroke-width="2"/>')
w('<path d="M136 139 L240 117" stroke="#3a3a3a" stroke-width="2" stroke-dasharray="5 4"/>')

# --- radiator shroud with graphics
w('<path d="M244 110 L278 122 L266 174 L218 182 L208 146 Z" class="mx-plastic" stroke="#0d0d0d" stroke-width="2.6" stroke-linejoin="round"/>')
w('<path d="M216 162 L272 148 L268 162 L219 174 Z" fill="#0d0d0d"/>')
w('<text class="mx__tag" x="0" y="0" font-size="11" text-anchor="middle" transform="translate(243 166) rotate(-14)">BUTTI</text>')
w('<path d="M249 116 L274 125" stroke="#fff" stroke-width="2" opacity=".55" stroke-linecap="round"/>')

# --- fork (USD): gold outer tubes, chrome inner tubes, plastic guards, clamps, axle lug
w(rect_on_fork(-6, 96, 7.5, 'fill="url(#mx-gold-{{ u }})"', 'stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"'))
w(rect_on_fork(92, 150, 4.5, 'fill="url(#mx-chr-{{ u }})"', 'stroke="#0d0d0d" stroke-width="2" stroke-linejoin="round"'))
w(rect_on_fork(104, 146, 7, 'fill="#1a1a1a"', 'stroke="#0d0d0d" stroke-width="2" stroke-linejoin="round"'))
w('<path d="M%s L%s" stroke="#fff" stroke-width="1.4" opacity=".35"/>' % (f(at(108, 3)), f(at(142, 3))))
for k in (-2, 26):
    w(rect_on_fork(k - 3.5, k + 3.5, 13, 'fill="#2c2f33"', 'stroke="#0d0d0d" stroke-width="2" stroke-linejoin="round"'))
w('<circle cx="%.1f" cy="%.1f" r="6" fill="url(#mx-alu-{{ u }})" stroke="#0d0d0d" stroke-width="2"/>' % FA)

# --- front fender (long, forward)
fb = at(30, 2)
w('<path d="M%s Q%s 302 128 L372 132 Q376 135 371 138 Q330 140 %s Z" class="mx-plastic" stroke="#0d0d0d" stroke-width="2.6" stroke-linejoin="round"/>' % (f(add(fb, n, -6)), f(add(fb, n, 22)), f(add(fb, u, 10))))
w('<path d="M%s Q306 131 366 134" fill="none" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>' % f(add(fb, n, 8)))

# --- front plate: aligned with the fork, plain (no number), a stripe in the plastic colour
C = at(14, 13.5)
half_l, half_w = 24, 9.5
w('<path d="%s" fill="#f4f1ea" stroke="#0d0d0d" stroke-width="2.6" stroke-linejoin="round"/>' % poly(add(add(C, u, -half_l), n, -half_w), add(add(C, u, -half_l), n, half_w), add(add(C, u, half_l), n, half_w - 2), add(add(C, u, half_l), n, -half_w + 2)))
w('<path d="M%s L%s" stroke="#0d0d0d" stroke-width="3" stroke-linecap="round"/>' % (f(add(add(C, u, -half_l + 2), n, half_w - 1)), f(add(add(C, u, half_l - 2), n, half_w - 2.5))))
s = 0.58
w('<path d="M%s L%s" class="mx-plastic-s" stroke-width="5" stroke-linecap="round"/>' % (f(add(add(C, u, -half_l + 6), n, -1)), f(add(add(C, u, half_l - 6), n, -1))))

# --- handlebar, grip, levers
bar0 = at(-6, -2)
G = P(238, 82)
w('<path d="M%s L%s L%s" fill="none" stroke="#0d0d0d" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>' % (f(bar0), f(add(bar0, u, -9)), f(G)))
w('<path d="M%s L%s L%s" fill="none" stroke="#9aa1a8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' % (f(bar0), f(add(bar0, u, -9)), f(G)))
w('<path d="M%s L%s" stroke="#1a1a1a" stroke-width="8" stroke-linecap="round"/>' % (f((G[0] + 6, G[1] + 1.5)), f((G[0] - 6, G[1] - 1.5))))
w('<path d="M%s q8 -2 14 4" fill="none" stroke="#2c2f33" stroke-width="2.4" stroke-linecap="round"/>' % f((G[0] + 2, G[1] - 3)))

# --- footpeg + rear brake pedal
w('<path d="M186 214 L200 214" stroke="#0d0d0d" stroke-width="6" stroke-linecap="round"/><path d="M187 214 L199 214" stroke="#9aa1a8" stroke-width="2.5" stroke-dasharray="2 2"/>')
w('<path d="M198 218 L222 226 L228 222" fill="none" stroke="#2c2f33" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>')

chassis = '\n    '.join(S)

# ---------------- rider (separate layer) ----------------
R = []; r = R.append
hip, knee, ankle, sh, elb, hand = P(182, 122), P(226, 150), P(200, 202), P(212, 84), P(228, 100), P(G[0] + 4, G[1] + 1)
r('<path d="M%s L%s" class="mx-pants-s" stroke-width="28" stroke-linecap="round"/>' % (f(hip), f(knee)))
r('<path d="M%s L%s" class="mx-pants-s" stroke-width="22" stroke-linecap="round"/>' % (f(knee), f(ankle)))
r('<path d="M%s L%s" fill="none" stroke="#0d0d0d" stroke-width="2" opacity=".35"/>' % (f(add(hip, (0.5, 0.86), 12)), f(add(knee, (0.5, 0.86), 9))))
r('<path d="M219 140 L236 158" class="mx-jersey-s" stroke-width="4" opacity=".9"/>')
r('<circle cx="%.1f" cy="%.1f" r="8.5" fill="#2a2a2a" stroke="#0d0d0d" stroke-width="2"/>' % knee)
# boot
r('<path d="M188 182 L210 180 L212 210 Q219 212 219 219 L180 221 Q176 214 182 210 Z" fill="#f4f1ea" stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"/>')
r('<path d="M184 190 L210 188 M183 200 L211 198" stroke="#0d0d0d" stroke-width="2.2"/>')
r('<path d="M178 219 L220 219 L220 225 L176 225 Z" fill="#0d0d0d"/>')
# torso (jersey over chest protector) + back number
r('<path d="M166 118 Q162 98 180 84 L202 64 Q216 54 230 64 L238 78 Q242 90 230 98 L204 126 Q192 138 178 134 Q168 130 166 118 Z" class="mx-jersey" stroke="#0d0d0d" stroke-width="2.6" stroke-linejoin="round"/>')
r('<text class="mx__back" x="0" y="0" font-size="20" text-anchor="middle" transform="translate(190 108) rotate(-42)">{{ n | escape }}</text>')
r('<path d="M174 128 Q188 134 202 124" fill="none" stroke="#0d0d0d" stroke-width="5" opacity=".85"/>')
# arm: elbow up, glove on the grip
r('<path d="M%s L%s L%s" fill="none" stroke="#0d0d0d" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>' % (f(sh), f(elb), f(hand)))
r('<path d="M%s L%s L%s" class="mx-jersey-s" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>' % (f(sh), f(elb), f(hand)))
r('<path d="M%s L%s" stroke="#0d0d0d" stroke-width="3" opacity=".8"/>' % (f(add(elb, (0.6, -0.8), -4)), f(add(elb, (0.6, -0.8), 6))))
r('<path d="M%s L%s" class="mx-plastic-s" stroke-width="3"/>' % (f(add(hand, (-0.83, -0.55), 7)), f(add(hand, (-0.83, -0.55), 11))))
r('<circle cx="%.1f" cy="%.1f" r="6.5" fill="#0d0d0d"/>' % hand)
# helmet (side view, facing right): shell with integrated chin bar, eye port with goggles, peak, strap, vents
r('<path d="M210 64 C203 50 206 33 220 26 C234 19 250 23 257 34 L261 47 L271 60 Q274 67 267 70 L249 75 Q236 77 226 74 Q214 71 210 64 Z" class="mx-helmet" stroke="#0d0d0d" stroke-width="2.6" stroke-linejoin="round"/>')
r('<path d="M213 44 C216 34 226 28 238 27" fill="none" class="mx-plastic-s" stroke-width="5" stroke-linecap="round"/>')
r('<path d="M226 72 Q240 70 252 66" fill="none" stroke="#0d0d0d" stroke-width="1.6" opacity=".35"/>')
r('<path d="M239 38 Q251 35 259 39 L261 52 Q251 56 240 53 Q235 45 239 38 Z" fill="#1a1a1a" stroke="#0d0d0d" stroke-width="2" stroke-linejoin="round"/>')
r('<path d="M210 47 Q224 41 241 43" fill="none" stroke="#0d0d0d" stroke-width="6" stroke-linecap="round"/>')
r('<path d="M210 47 Q224 41 241 43" fill="none" class="mx-plastic-s" stroke-width="2.6" stroke-linecap="round"/>')
r('<path d="M242 40 Q251 38.5 258 41.5 L259 50 Q251 52.5 243 50.5 Q240 45 242 40 Z" fill="#ff7a1a" stroke="#0d0d0d" stroke-width="1.6" stroke-linejoin="round"/>')
r('<path d="M245 42.5 L255 42" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>')
r('<path d="M234 29 L267 23.5 Q274 23 272.5 29.5 L263 36.5 Q249 33.5 236 35 Z" class="mx-plastic" stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"/>')
r('<path d="M246 31 L262 28.5" stroke="#0d0d0d" stroke-width="1.6" opacity=".5"/>')
r('<path d="M261 58 L266 62 M257 61 L262 65 M253 64 L258 68" stroke="#0d0d0d" stroke-width="2" stroke-linecap="round" opacity=".7"/>')
r('<path d="M262 50 Q268 55 270 60" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>')
rider = '\n    '.join(R)

# ---------------- wheel (spins as a whole: tyre knobs, rim, spokes, disc) ----------------
W = []; q = W.append
q('<circle r="44" fill="#151515"/>')
q('<circle r="46.2" fill="none" stroke="#151515" stroke-width="6.5" stroke-dasharray="5.1 4.5"/>')
q('<circle r="41" fill="none" stroke="#262626" stroke-width="1.6"/>')
q('<circle r="35.5" fill="none" stroke="#0d0d0d" stroke-width="6"/>')
q('<circle r="35.5" fill="none" stroke="#c9ced3" stroke-width="2.4"/>')
q('<g stroke="#b9c0c6" stroke-width="1.2"><path d="M0-33V33M-33 0H33M-23.3-23.3L23.3 23.3M23.3-23.3L-23.3 23.3"/><path d="M0-33V33M-33 0H33M-23.3-23.3L23.3 23.3M23.3-23.3L-23.3 23.3" transform="rotate(22.5)"/></g>')
q('<circle r="17" fill="none" stroke="#8d949b" stroke-width="3.4" stroke-dasharray="3.2 2"/>')
q('<circle r="8.5" fill="url(#mx-alu-{{ u }})" stroke="#0d0d0d" stroke-width="1.6"/>')
q('<circle r="2.6" fill="#0d0d0d"/>')
wheel = ''.join(W)

wb_x = lambda c: (c[0] - 50) / 420 * 100
out = '''{%%- comment -%%}
  Team Butti motocross bike + rider (2-stroke), side view facing right. Generated by tools/art/bike.py.
  Layers (each one moved by theme.js with transforms only, no repaint): .mx__wheel (spins), .mx__body (chassis, suspension),
  .mx__rider (rider pose). Colors from CSS variables on a parent: --mx-plastic, --mx-jersey, --mx-pants, --mx-helmet.
  Fork rake %.1f deg; the front plate and its number follow the fork axis.
  num: race number (default 69). uid: unique id for the SVG defs.
{%%- endcomment -%%}
{%%- assign u = uid | default: 'mx' | handle -%%}
{%%- assign n = num | default: '69' -%%}
<div class="mx" aria-hidden="true">
  <svg class="mx__shadow" viewBox="0 0 420 300" focusable="false"><ellipse cx="205" cy="294" rx="170" ry="5" fill="#000" opacity=".22"/></svg>
  <span class="mx__wheel" style="left: %.3f%%; top: %.3f%%"><svg class="mx__wh" viewBox="-50 -50 100 100" focusable="false">%s</svg></span>
  <span class="mx__wheel" style="left: %.3f%%; top: %.3f%%"><svg class="mx__wh" viewBox="-50 -50 100 100" focusable="false">%s</svg></span>
  <svg class="mx__body" viewBox="0 0 420 300" focusable="false">
    %s
  </svg>
  <svg class="mx__rider" viewBox="0 0 420 300" focusable="false">
    %s
  </svg>
</div>
''' % (rake, wb_x(RA), (RA[1] - 50) / 300 * 100, wheel, wb_x(FA), (FA[1] - 50) / 300 * 100, wheel, chassis, rider)
open(sys.argv[1], 'w').write(out)
print('rake %.1f deg, fork %.0f' % (rake, fork_len))
