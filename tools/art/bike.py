# Generates snippets/mx-bike.liquid: the Team Butti 2-stroke MX bike + rider, flat side view facing right.
# Same look as the brand's own illustration (pink plastics with yellow lightning, leopard seat and helmet,
# gold fork and hubs, chrome pipe, black/white kit, white boots), redrawn in pure 2D so it can ride the track.
# Layered for the GPU: wheels, chassis and rider are separate <svg> boxes that theme.js moves with transforms only.
# The geometry (axles, tyre radius, ground line) is the one theme.js is tuned for: do not move RA, FA, RT.
import math, sys

def P(x, y): return (x, y)
def add(a, b, k=1): return (a[0] + b[0] * k, a[1] + b[1] * k)
def f(p): return '%.1f %.1f' % p
def poly(*pts): return 'M' + ' L'.join(f(p) for p in pts) + ' Z'
def unit(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy); return (dx / l, dy / l)

INK = '#0d0d0d'
OL = 'stroke="%s" stroke-width="2.6" stroke-linejoin="round"' % INK          # bold cartoon outline
OLs = 'stroke="%s" stroke-width="2" stroke-linejoin="round"' % INK
YEL = '#ffd400'

RA, FA, RT = P(92, 242), P(318, 242), 48          # axles, tyre radius (ground at y = 290)
ST = P(250, 98)                                    # top of the steering head
u = unit(ST, FA); n = (u[1], -u[0])                # fork axis (down) and its normal
if n[0] < 0: n = (-n[0], -n[1])
at = lambda k, m=0: add(add(ST, u, k), n, m)       # point k along the fork from ST, m forward
fork_len = math.hypot(FA[0] - ST[0], FA[1] - ST[1])
rake = math.degrees(math.atan2(u[0], u[1]))

def on_fork(k0, k1, h0, h1=None):
    h1 = h0 if h1 is None else h1
    return poly(at(k0, -h0), at(k0, h0), at(k1, h1), at(k1, -h1))

S = []   # chassis
w = S.append

w('<defs>')
w('<linearGradient id="mx-alu-{{ u }}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#b3bac0"/><stop offset="1" stop-color="#e3e7ea"/></linearGradient>')
w('<linearGradient id="mx-pipe-{{ u }}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#c9ced3"/><stop offset=".62" stop-color="#7c848b"/><stop offset=".82" stop-color="#b9bfc5"/><stop offset="1" stop-color="#6f777e"/></linearGradient>')
w('<linearGradient id="mx-gold-{{ u }}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b07a12"/><stop offset=".4" stop-color="#ffd772"/><stop offset=".62" stop-color="#e9b445"/><stop offset="1" stop-color="#a26d0c"/></linearGradient>')
w('<linearGradient id="mx-shine-{{ u }}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>')
# leopard print: tan base, black broken rosettes with brown centres
w('<pattern id="mx-leo-{{ u }}" patternUnits="userSpaceOnUse" width="16" height="14" patternTransform="rotate(-8) scale(.72)">'
  '<rect width="16" height="14" fill="#e0aa5b"/>'
  '<g fill="#8a5221"><ellipse cx="4" cy="4" rx="2.2" ry="1.7"/><ellipse cx="12" cy="10.5" rx="2.3" ry="1.8"/></g>'
  '<g fill="none" stroke="#1a1209" stroke-width="1.1" stroke-linecap="round">'
  '<path d="M1.4 3.2 Q2 1.2 4.4 1.4 M6.6 3.4 Q7 5.6 5 6.6 M2.4 6.6 Q1.2 6 1.2 4.8"/>'
  '<path d="M9.4 9.6 Q10 7.6 12.4 7.8 M14.6 9.8 Q15 12 13 13 M10.4 13 Q9.2 12.4 9.2 11.2"/></g>'
  '<g fill="#1a1209"><circle cx="9" cy="3" r=".9"/><circle cx="2.5" cy="11" r=".8"/><circle cx="15" cy="5" r=".7"/></g></pattern>')
w('</defs>')

# --- swingarm (aluminium, tapered) + chain guide
SP = P(188, 198)
w('<path d="M%s L%s L%s L%s Z" fill="url(#mx-alu-{{ u }})" %s/>' % (f((SP[0], SP[1] - 9)), f((RA[0] + 4, RA[1] - 9)), f((RA[0] + 2, RA[1] + 7)), f((SP[0] + 2, SP[1] + 10)), OL))
w('<path d="M%s L%s" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/>' % (f((SP[0] - 8, SP[1] - 5)), f((RA[0] + 16, RA[1] - 5))))
# chain: top and bottom runs from the countershaft sprocket to the rear sprocket
w('<path d="M212 200 L%s M212 214 L%s" stroke="#2a2a2a" stroke-width="3.2" stroke-dasharray="2.4 1.2" fill="none"/>' % (f((RA[0] + 2, RA[1] - 17)), f((RA[0] + 2, RA[1] + 17))))
w('<rect x="%.1f" y="%.1f" width="18" height="11" rx="2.5" fill="#3a3f45" %s/>' % (RA[0] - 5, RA[1] - 6, OLs))
w('<circle cx="%.1f" cy="%.1f" r="3" fill="#c9ced3" stroke="%s" stroke-width="1.4"/>' % (RA[0] + 4, RA[1] - 0.5, INK))

# --- frame (pink, like the plastics): top rail, down tube, cradle under the engine
frame = 'M%s L196 130 L186 198 M%s L236 206 L198 216 L186 198' % (f(at(10, -2)), f(at(26, -1)))
w('<path d="%s" fill="none" stroke="%s" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' % (frame, INK))
w('<path d="%s" fill="none" class="mx-plastic-s" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>' % frame)

# --- rear shock: gold spring
w('<path d="M188 134 L178 196" stroke="%s" stroke-width="10" stroke-linecap="round"/>' % INK)
w('<path d="M188 136 l-9 4 l12 4 l-12 4 l12 4 l-12 4 l12 4 l-12 4 l12 4 l-12 4 l12 4 l-9 4" fill="none" stroke="url(#mx-gold-{{ u }})" stroke-width="3.4" stroke-linejoin="round" transform="rotate(8 184 160)"/>')

# --- engine: crankcase, finned cylinder, round clutch cover
w('<path d="M200 176 L242 172 Q248 172 248 180 L246 208 Q245 220 232 222 L210 224 Q198 224 196 212 Z" fill="#8c949b" %s/>' % OL)
w('<path d="M202 182 L242 178" stroke="#c7cdd2" stroke-width="2.2" opacity=".8"/>')
w('<path d="M206 146 L240 140 L246 174 L210 180 Z" fill="#a9b0b6" %s/>' % OL)
w('<path d="M208 152 L241 146 M209 158 L242 152 M210 164 L243 158 M211 170 L244 164" stroke="#4b5258" stroke-width="2.2"/>')
w('<circle cx="222" cy="200" r="13.5" fill="url(#mx-alu-{{ u }})" stroke="%s" stroke-width="2.2"/>' % INK)
w('<circle cx="222" cy="200" r="7.5" fill="none" stroke="#7d858c" stroke-width="1.8"/>')
w('<path d="M215 193 Q220 189 227 191" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>')
w('<g fill="%s"><circle cx="222" cy="187.5" r="1.3"/><circle cx="233" cy="206" r="1.3"/><circle cx="211" cy="206" r="1.3"/></g>' % INK)
w('<circle cx="212" cy="207" r="5" fill="#d9a63a" stroke="%s" stroke-width="1.6"/>' % INK)

# --- expansion chamber (fat chrome 2-stroke pipe curling in front of the engine) + silencer
pipe = 'M244 158 C276 160 282 198 258 212 C238 223 206 220 186 205 C170 193 150 170 128 160'
w('<path d="%s" fill="none" stroke="%s" stroke-width="21" stroke-linecap="round"/>' % (pipe, INK))
w('<path d="%s" fill="none" stroke="url(#mx-pipe-{{ u }})" stroke-width="16" stroke-linecap="round"/>' % pipe)
w('<path d="M248 158 C270 161 276 186 266 200" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>')
w('<path d="M236 214 C220 216 204 212 192 204" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>')
w('<path d="M262 196 L268 192 M257 203 L262 200" stroke="%s" stroke-width="1.6" opacity=".5"/>' % INK)
w('<path d="M134 160 L68 143" stroke="%s" stroke-width="19" stroke-linecap="round"/>' % INK)
w('<path d="M134 160 L68 143" stroke="url(#mx-alu-{{ u }})" stroke-width="13.5" stroke-linecap="round"/>')
w('<path d="M124 152 L78 140" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>')
w('<path d="M72 137 L67 150" stroke="%s" stroke-width="7" stroke-linecap="round"/><path d="M72 137 L67 150" stroke="#5b6268" stroke-width="3.5" stroke-linecap="round"/>' % INK)

# --- rear fender: long, upswept, yellow lightning
w('<path d="M138 134 L40 112 Q34 111 36 117 L44 128 L134 156 Z" class="mx-plastic" %s/>' % OL)
w('<path d="M126 136 L92 129 L100 135 L60 125 L84 136 L50 128 L96 142 L88 136 L122 144 Z" fill="%s"/>' % YEL)
w('<path d="M130 137 L46 118" stroke="url(#mx-shine-{{ u }})" stroke-width="3" stroke-linecap="round"/>')

# --- side number board: white, pink border, big black 69
w('<path d="M116 146 L186 135 Q191 135 191 140 L187 179 Q186 185 180 185 L127 191 Q120 191 119 185 Z" class="mx-plastic" %s/>' % OL)
w('<path d="M122 151 L184 141 L181 177 Q180 180 177 180 L129 185 Q125 185 125 182 Z" fill="#fbfaf6"/>')
w('<text class="mx__num" x="153" y="180" font-size="36" text-anchor="middle" transform="rotate(-6 153 166)">{{ n | escape }}</text>')
w('<circle cx="127" cy="154" r="1.8" fill="%s"/><circle cx="182" cy="145" r="1.8" fill="%s"/>' % (INK, INK))

# --- seat: leopard print
w('<path d="M116 138 L246 110 Q258 109 255 120 L126 151 Q112 153 116 138 Z" fill="url(#mx-leo-{{ u }})" %s/>' % OL)
w('<path d="M124 139 L244 114" stroke="#fff" stroke-width="1.8" opacity=".45" stroke-linecap="round"/>')

# --- tank + radiator shroud: pink, yellow decal with TEAM BUTTI and a black lightning
w('<path d="M228 120 L262 104 L272 112 L258 150 L214 158 Z" class="mx-plastic" %s/>' % OL)
w('<path d="M244 110 L280 122 L268 176 L218 184 L208 146 Z" class="mx-plastic" %s/>' % OL)
decal = poly(P(236, 155), P(269, 147), P(266, 175), P(232, 181))
w('<path d="%s" fill="%s" stroke="%s" stroke-width="2" stroke-linejoin="round"/>' % (decal, YEL, INK))
w('<text class="mx__decal" x="0" y="0" font-size="9.6" text-anchor="middle" transform="translate(250.5 164) rotate(-13)">TEAM</text>')
w('<text class="mx__decal" x="0" y="0" font-size="9.6" text-anchor="middle" transform="translate(250 175) rotate(-13)">BUTTI</text>')
w('<path d="M234 122 L262 110 L248 124 L266 118 L240 138 L248 128 L232 132 Z" fill="%s"/>' % YEL)
w('<path d="M248 114 L276 124" stroke="#fff" stroke-width="2.2" opacity=".6" stroke-linecap="round"/>')

# --- fork (USD): gold outer tubes, pink guards with yellow lightning, triple clamps, grey axle lug
w('<path d="%s" fill="url(#mx-gold-{{ u }})" %s/>' % (on_fork(-6, 98, 7.8), OL))
w('<path d="M%s L%s" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>' % (f(at(2, -3.5)), f(at(90, -3.5))))
w('<path d="%s" class="mx-plastic" %s/>' % (on_fork(92, 146, 8.2, 7.4), OL))
w('<path d="M%s L%s L%s L%s L%s L%s Z" fill="%s"/>' % (f(at(98, 1)), f(at(110, -3.5)), f(at(112, 2.5)), f(at(126, -3)), f(at(122, 3.5)), f(at(108, 4.5)), YEL))
w('<path d="M%s L%s" stroke="#fff" stroke-width="1.8" opacity=".55" stroke-linecap="round"/>' % (f(at(96, -4.5)), f(at(140, -4))))
for k in (-2, 26):
    w('<path d="%s" fill="#3a3f45" %s/>' % (on_fork(k - 3.6, k + 3.6, 13), OLs))
w('<path d="%s" fill="#b9c0c6" %s/>' % (on_fork(144, 158, 8, 9), OLs))
w('<circle cx="%.1f" cy="%.1f" r="6" fill="url(#mx-alu-{{ u }})" stroke="%s" stroke-width="2"/>' % (FA[0], FA[1], INK))
w('<circle cx="%.1f" cy="%.1f" r="2.2" fill="%s"/>' % (FA[0], FA[1], INK))

# --- front fender: long and forward, yellow tip
fb = at(30, 2)
fender = 'M%s Q%s 300 126 Q336 124 362 136 Q366 140 360 141 Q330 138 %s Z' % (f(add(fb, n, -6)), f(add(fb, n, 20)), f(add(fb, u, 10)))
w('<path d="%s" class="mx-plastic" %s/>' % (fender, OL))
w('<path d="M330 128 Q346 129 360 137 L340 136 L348 133 Z" fill="%s"/>' % YEL)
w('<path d="M%s Q306 129 352 132" fill="none" stroke="#fff" stroke-width="2.2" opacity=".55" stroke-linecap="round"/>' % f(add(fb, n, 8)))

# --- front plate: white, plain, along the fork
C = at(14, 13.5)
half_l, half_w = 24, 9.5
w('<path d="%s" fill="#fbfaf6" %s/>' % (poly(add(add(C, u, -half_l), n, -half_w), add(add(C, u, -half_l), n, half_w), add(add(C, u, half_l), n, half_w - 2), add(add(C, u, half_l), n, -half_w + 2)), OL))
w('<path d="M%s L%s" stroke="#cfd3d6" stroke-width="3" stroke-linecap="round"/>' % (f(add(add(C, u, -half_l + 3), n, half_w - 2)), f(add(add(C, u, half_l - 3), n, half_w - 3.5))))
w('<circle cx="%.1f" cy="%.1f" r="1.8" fill="%s"/>' % (add(C, u, -half_l + 7)[0], add(C, u, -half_l + 7)[1], INK))

# --- handlebar, grip, lever, cables
bar0 = at(-6, -2)
G = P(238, 82)
w('<path d="M%s Q%s 266 132" fill="none" stroke="%s" stroke-width="1.6"/>' % (f((G[0] + 4, G[1] - 2)), f((G[0] + 30, G[1] + 6)), INK))
w('<path d="M%s L%s L%s" fill="none" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' % (f(bar0), f(add(bar0, u, -9)), f(G), INK))
w('<path d="M%s L%s L%s" fill="none" stroke="#5b6268" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' % (f(bar0), f(add(bar0, u, -9)), f(G)))
w('<path d="M%s L%s" stroke="#1a1a1a" stroke-width="8" stroke-linecap="round"/>' % (f((G[0] + 6, G[1] + 1.5)), f((G[0] - 6, G[1] - 1.5))))
w('<path d="M%s q10 -1 16 6" fill="none" stroke="%s" stroke-width="4" stroke-linecap="round"/><path d="M%s q10 -1 16 6" fill="none" stroke="#b9c0c6" stroke-width="1.8" stroke-linecap="round"/>' % (f((G[0] + 2, G[1] - 3)), INK, f((G[0] + 2, G[1] - 3))))

# --- footpeg + rear brake pedal
w('<path d="M184 214 L202 214" stroke="%s" stroke-width="7" stroke-linecap="round"/><path d="M185 214 L201 214" stroke="#b9c0c6" stroke-width="3" stroke-dasharray="2 2"/>' % INK)
w('<path d="M200 218 L224 226 L230 222" fill="none" stroke="%s" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M200 218 L224 226 L230 222" fill="none" stroke="#9aa1a8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' % (INK))

chassis = '\n    '.join(S)

# ---------------- rider (separate layer): standing attack position ----------------
R = []; r = R.append
hip, knee, ankle = P(176, 114), P(224, 150), P(196, 206)
sh, elb, hand = P(199, 70), P(222, 92), P(G[0] + 3, G[1] + 1)
JER = 'class="mx-jersey"'
# leg: thigh + shin in the pants colour, white side stripe, black knee brace
r('<path d="M%s L%s" stroke="%s" stroke-width="31" stroke-linecap="round"/>' % (f(hip), f(knee), INK))
r('<path d="M%s L%s" class="mx-pants-s" stroke-width="26" stroke-linecap="round"/>' % (f(hip), f(knee)))
r('<path d="M%s L%s" stroke="%s" stroke-width="25" stroke-linecap="round"/>' % (f(knee), f(ankle), INK))
r('<path d="M%s L%s" class="mx-pants-s" stroke-width="20" stroke-linecap="round"/>' % (f(knee), f(ankle)))
r('<path d="M%s L%s" stroke="#fbfaf6" stroke-width="5" stroke-linecap="round"/>' % (f(add(hip, (0.69, 0.72), 6)), f(add(knee, (-0.69, -0.72), 12))))
r('<path d="M%s L%s" stroke="#fbfaf6" stroke-width="3.4" stroke-linecap="round"/>' % (f(add(knee, (-0.43, 0.9), 12)), f(add(ankle, (0.43, -0.9), 18))))
r('<circle cx="%.1f" cy="%.1f" r="10" fill="#1f1f1f" stroke="%s" stroke-width="2.4"/>' % (knee[0], knee[1], INK))
r('<path d="M%s l8 -6" stroke="#5b6268" stroke-width="2" stroke-linecap="round"/>' % f((knee[0] - 5, knee[1] + 3)))
# boot: white, black buckles and sole
r('<path d="M184 178 L212 176 L214 206 Q223 208 224 217 L180 220 Q175 212 182 207 Z" fill="#fbfaf6" %s/>' % OL)
r('<path d="M184 186 L212 184 M183 195 L213 193" stroke="%s" stroke-width="3.2"/>' % INK)
r('<rect x="203" y="182" width="9" height="5" rx="1.2" fill="#b9c0c6" stroke="%s" stroke-width="1.4"/><rect x="204" y="191" width="9" height="5" rx="1.2" fill="#b9c0c6" stroke="%s" stroke-width="1.4"/>' % (INK, INK))
r('<path d="M186 202 Q196 200 206 204" fill="none" stroke="#cfd3d6" stroke-width="2.2"/>')
r('<path d="M177 218 L225 216 L226 223 L175 225 Z" fill="%s"/>' % INK)
# torso: black jersey over the chest protector, white side panel, back yoke text and big 69
torso = 'M164 116 Q158 94 176 76 L192 60 Q206 48 220 56 L228 66 Q233 78 222 88 L200 116 Q190 132 176 131 Q166 128 164 116 Z'
r('<path d="%s" %s %s/>' % (torso, JER, OL))
r('<path d="M206 76 Q213 76 216 82 L200 112 Q194 122 184 127 L178 125 Q196 104 206 76 Z" fill="#fbfaf6"/>')
r('<text class="mx__yoke" x="0" y="0" font-size="7.5" text-anchor="middle" transform="translate(182 82) rotate(-48)">TEAM BUTTI</text>')
r('<text class="mx__back" x="0" y="0" font-size="21" text-anchor="middle" transform="translate(178 113) rotate(-48)">{{ n | escape }}</text>')
r('<path d="M170 126 Q186 134 200 122" fill="none" stroke="#fbfaf6" stroke-width="4" opacity=".9"/>')
# arm: elbow up, white stripe along the sleeve, 69 on the shoulder, black glove on the grip
r('<path d="M%s L%s L%s" fill="none" stroke="%s" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>' % (f(sh), f(elb), f(hand), INK))
r('<path d="M%s L%s L%s" fill="none" class="mx-jersey-s" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>' % (f(sh), f(elb), f(hand)))
r('<path d="M%s L%s L%s" fill="none" stroke="#fbfaf6" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>' % (f(add(sh, (0, -1), 4)), f(add(elb, (0, -1), 4.2)), f(add(hand, (0.9, -0.3), 3))))
r('<text class="mx__sleeve" x="0" y="0" font-size="8.5" text-anchor="middle" transform="translate(209 85) rotate(42)">{{ n | escape }}</text>')
r('<circle cx="%.1f" cy="%.1f" r="7" fill="#1a1a1a" stroke="%s" stroke-width="2"/>' % (hand[0], hand[1], INK))
r('<path d="M%s l6 -3" stroke="#5b6268" stroke-width="1.8" stroke-linecap="round"/>' % f((hand[0] - 3, hand[1] - 2)))
# helmet (side view, facing right): leopard upper shell, white chin bar, face in the eye port, goggles up, leopard peak
shell = 'M206 58 C198 44 200 24 216 15 C231 7 250 10 258 22 L263 36 L273 50 Q276 58 268 61 L250 66 Q236 69 225 66 Q212 64 206 58 Z'
r('<path d="%s" class="mx-helmet" %s/>' % (shell, OL))
r('<path d="M207 40 C206 26 214 16 228 13 C242 10 254 15 259 26 L256 33 Q232 28 210 44 Z" fill="url(#mx-leo-{{ u }})"/>')
r('<path d="M207 40 C206 26 214 16 228 13 C242 10 254 15 259 26" fill="none" stroke="%s" stroke-width="2.6" stroke-linejoin="round"/>' % INK)
r('<path d="M210 44 Q232 28 256 33" fill="none" stroke="%s" stroke-width="2"/>' % INK)
# eye port with the rider's face (profile, looking ahead)
r('<path d="M238 37 Q253 33 262 40 L263 55 Q253 59 241 57 Q234 47 238 37 Z" fill="#e7b48f" stroke="%s" stroke-width="2.2" stroke-linejoin="round"/>' % INK)
r('<path d="M246 42 L256 41" stroke="#3a2516" stroke-width="2.2" stroke-linecap="round"/>')
r('<path d="M250 45.5 Q253 44.5 255.5 46" fill="none" stroke="%s" stroke-width="1.8" stroke-linecap="round"/><circle cx="253" cy="46.4" r="1.3" fill="%s"/>' % (INK, INK))
r('<path d="M258.5 46 L262 51.5 L258.5 52.5" fill="#d99e78" stroke="#8a5a3c" stroke-width="1.1" stroke-linejoin="round"/>')
# chin bar vents and shine
r('<path d="M261 59 L266 62 M257 61 L262 64.5 M253 63 L258 66.5" stroke="#5b6268" stroke-width="2" stroke-linecap="round"/>')
r('<path d="M226 64 Q240 62 250 58" fill="none" stroke="%s" stroke-width="1.4" opacity=".35"/>' % INK)
# goggles pushed up on the helmet: pink frame, orange mirror lens, pink strap round the shell
r('<path d="M209 38 Q223 31 240 33" fill="none" stroke="%s" stroke-width="7" stroke-linecap="round"/>' % INK)
r('<path d="M209 38 Q223 31 240 33" fill="none" class="mx-plastic-s" stroke-width="3.6" stroke-linecap="round"/>')
r('<path d="M238 28 Q250 25 259 29 L259 38 Q250 41 240 39 Q235 33 238 28 Z" class="mx-plastic" %s/>' % OLs)
r('<path d="M241 30.5 Q250 28.5 256.5 31 L256.5 36.5 Q250 38.5 242 37 Q239.5 33.5 241 30.5 Z" fill="#ff7a1a"/>')
r('<path d="M243 31.6 L253 30.2" stroke="#ffe08a" stroke-width="1.8" stroke-linecap="round"/>')
# peak: leopard, black outline
r('<path d="M231 21 L266 14 Q274 13.5 272.5 20 L262 28.5 Q248 25 234 27 Z" fill="url(#mx-leo-{{ u }})" %s/>' % OL)
r('<path d="M240 20 L264 16" stroke="#fff" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>')
rider = '\n    '.join(R)

# ---------------- wheels (spin as a whole: knobby tyre, black rim, black spokes, gold hub, disc or sprocket) ----------------
def wheel(front):
    WL = []; q = WL.append
    q('<circle r="44.5" fill="#1d1d1d"/>')
    # knobs: chunky blocks on the tread, smaller ones on the shoulder
    knobs = ''
    for i in range(30):
        a = i * 12
        knobs += '<rect x="-3.2" y="-48.6" width="6.4" height="6.2" rx="1.2" transform="rotate(%d)"/>' % a
    q('<g fill="#232323" stroke="%s" stroke-width="1.1">%s</g>' % (INK, knobs))
    q('<g fill="#3d3d3d">%s</g>' % ''.join('<rect x="-2.2" y="-47.6" width="3" height="1.6" rx=".6" transform="rotate(%d)"/>' % (i * 12) for i in range(30)))
    q('<circle r="41.5" fill="none" stroke="#2f2f2f" stroke-width="3" stroke-dasharray="3 3"/>')
    q('<circle r="44.6" fill="none" stroke="%s" stroke-width="1.2"/>' % INK)
    # rim
    q('<circle r="36" fill="none" stroke="%s" stroke-width="6.5"/>' % INK)
    q('<circle r="34.4" fill="none" stroke="#5b6268" stroke-width="1.2"/>')
    q('<circle r="32.6" fill="#ffffff" fill-opacity="0"/>')
    # spokes: 32, laced tangentially (crossing), black
    sp = ''
    for i in range(32):
        a = math.radians(i * 360 / 32)
        b = a + (math.radians(28) if i % 2 else -math.radians(28))
        sp += 'M%.2f %.2f L%.2f %.2f' % (math.cos(a) * 7.5, math.sin(a) * 7.5, math.cos(b) * 32.8, math.sin(b) * 32.8)
    q('<path d="%s" stroke="#141414" stroke-width="0.95" fill="none"/>' % sp)
    if front:
        # brake disc: grey, petal edge, drilled
        q('<circle r="19.5" fill="#a9b0b6" stroke="%s" stroke-width="1.6" stroke-dasharray="6 1.2"/>' % INK)
        q('<circle r="14.5" fill="none" stroke="#7d858c" stroke-width="1.4"/>')
        q('<g fill="#4b5258">%s</g>' % ''.join('<circle cx="%.2f" cy="%.2f" r="1"/>' % (math.cos(math.radians(i * 30 + 15)) * 17, math.sin(math.radians(i * 30 + 15)) * 17) for i in range(12)))
    else:
        # rear sprocket: gold, teeth and lightening holes
        teeth = ''.join('<rect x="-1.3" y="-21.6" width="2.6" height="3.6" rx=".6" transform="rotate(%.1f)"/>' % (i * 360 / 36) for i in range(36))
        q('<g fill="#d9a63a" stroke="%s" stroke-width=".7">%s</g>' % (INK, teeth))
        q('<circle r="19" fill="url(#mx-gold-{{ u }})" stroke="%s" stroke-width="1.6"/>' % INK)
        q('<g fill="#7a520e" stroke="%s" stroke-width=".8">%s</g>' % (INK, ''.join('<path d="M%.2f %.2f A5 5 0 0 1 %.2f %.2f L%.2f %.2f Z"/>' % (math.cos(math.radians(i * 72)) * 15, math.sin(math.radians(i * 72)) * 15, math.cos(math.radians(i * 72 + 40)) * 15, math.sin(math.radians(i * 72 + 40)) * 15, math.cos(math.radians(i * 72 + 20)) * 10, math.sin(math.radians(i * 72 + 20)) * 10) for i in range(5))))
    # gold hub + axle
    q('<circle r="9" fill="url(#mx-gold-{{ u }})" stroke="%s" stroke-width="1.8"/>' % INK)
    q('<circle r="5.2" fill="none" stroke="#8a5d0c" stroke-width="1.4"/>')
    q('<g fill="%s">%s</g>' % (INK, ''.join('<circle cx="%.2f" cy="%.2f" r=".9"/>' % (math.cos(math.radians(i * 60)) * 7, math.sin(math.radians(i * 60)) * 7) for i in range(6))))
    q('<circle r="2.6" fill="#c9ced3" stroke="%s" stroke-width="1"/>' % INK)
    q('<path d="M-38 -14 A40 40 0 0 1 -14 -38" fill="none" stroke="#fff" stroke-width="1.6" opacity=".25" stroke-linecap="round"/>')
    return ''.join(WL)

wb_x = lambda c: (c[0] - 50) / 420 * 100
out = '''{%%- comment -%%}
  Team Butti motocross bike + rider (2-stroke), flat side view facing right, in the brand's own look:
  pink plastics with yellow lightning, leopard seat and helmet, gold fork and hubs, chrome pipe, black/white kit.
  Generated by tools/art/bike.py. Layers (each one moved by theme.js with transforms only, no repaint):
  .mx__wheel (spins), .mx__body (chassis, suspension), .mx__rider (rider pose).
  Colors from CSS variables on a parent: --mx-plastic, --mx-jersey, --mx-pants, --mx-helmet.
  Fork rake %.1f deg. num: race number (default 69). uid: unique id for the SVG defs.
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
''' % (rake, wb_x(RA), (RA[1] - 50) / 300 * 100, wheel(False), wb_x(FA), (FA[1] - 50) / 300 * 100, wheel(True), chassis, rider)
open(sys.argv[1], 'w').write(out)
print('rake %.1f deg, fork %.0f' % (rake, fork_len))
