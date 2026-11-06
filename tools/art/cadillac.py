# Generates snippets/cadillac.liquid: the Team Butti 1966 Cadillac DeVille, side view facing right.
# Layered for the GPU: ghost trails, body (suspension) and wheels (spin) are separate <svg> boxes moved by transforms only.
import sys

WR, WF, WY, TR = 176, 574, 186, 42           # wheel centres and the wheel box half-size (viewBox units)
VW, VH = 720, 236
pct = lambda x, t: '%.3f%%' % (x / t * 100)

defs = '''
    <linearGradient id="cad-paint-{{ u }}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7a4d"/><stop offset=".18" stop-color="#f2502b"/><stop offset=".5" stop-color="#d42f18"/><stop offset=".62" stop-color="#7a1206"/><stop offset=".7" stop-color="#c3260f"/><stop offset="1" stop-color="#7d1407"/>
    </linearGradient>
    <linearGradient id="cad-chrome-{{ u }}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#d5dade"/><stop offset=".52" stop-color="#6f777e"/><stop offset=".7" stop-color="#c4cacf"/><stop offset="1" stop-color="#f4f6f8"/>
    </linearGradient>
    <linearGradient id="cad-glass-{{ u }}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b4d60"/><stop offset=".55" stop-color="#18222d"/><stop offset="1" stop-color="#0c1218"/>
    </linearGradient>
    <linearGradient id="cad-roof-{{ u }}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf5e6"/><stop offset="1" stop-color="#e3d8bd"/>
    </linearGradient>
    <radialGradient id="cad-glow-{{ u }}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe6"/><stop offset=".55" stop-color="#ffe9a3" stop-opacity=".8"/><stop offset="1" stop-color="#ffe9a3" stop-opacity="0"/></radialGradient>
    <pattern id="cad-leo-{{ u }}" width="34" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
      <rect width="34" height="30" fill="#efbd6f"/>
      <g fill="#bf7b2f" stroke="#2a1608" stroke-width="2.6" stroke-dasharray="7 3" stroke-linecap="round">
        <ellipse cx="8" cy="8" rx="5.5" ry="4.5"/><ellipse cx="25" cy="13" rx="5" ry="4"/><ellipse cx="13" cy="23" rx="5" ry="4.2"/><ellipse cx="31" cy="28" rx="4" ry="3.4"/>
      </g>
      <g fill="#2a1608"><circle cx="20" cy="4" r="1.6"/><circle cx="3" cy="17" r="1.4"/><circle cx="27" cy="22" r="1.2"/></g>
    </pattern>
    <path id="cad-shape-{{ u }}" d="M14 124 L688 128 Q699 129 701 137 L703 170 Q703 186 691 190 L625 194 A50 50 0 0 0 523 194 L521 203 L229 203 L227 194 A50 50 0 0 0 125 194 L32 192 Q13 190 12 174 L11 136 Q11 125 14 124 Z"/>
    <path id="cad-roof-shape-{{ u }}" d="M196 126 C214 100 230 76 254 69 L448 65 C462 65 470 69 478 77 L526 126 Z"/>
    <clipPath id="cad-clip-{{ u }}"><use href="#cad-shape-{{ u }}"/></clipPath>
    <g id="cad-sil-{{ u }}"><use href="#cad-shape-{{ u }}"/><use href="#cad-roof-shape-{{ u }}"/><circle cx="176" cy="186" r="40"/><circle cx="574" cy="186" r="40"/></g>
    <g id="cad-tyre-{{ u }}">
      <circle r="40" fill="#121212"/>
      <circle r="37.5" fill="none" stroke="#2a2a2a" stroke-width="1.2"/>
      <circle r="35" fill="none" stroke="#1d1d1d" stroke-width="2.6"/>
      <circle r="29.5" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="1.2"/>
      <circle r="25.5" fill="#1a1a1a"/>
      <circle r="20" fill="none" stroke="#5d646b" stroke-width="5"/>
      <circle r="20" fill="none" stroke="#2a2e33" stroke-width="1" stroke-dasharray="2 3"/>
      <path d="M-17 -12 A21 21 0 0 1 -6 -20 L-4 -14 A15 15 0 0 0 -12 -8 Z" fill="#d42f18" stroke="#0d0d0d" stroke-width="1.2" stroke-linejoin="round"/>
    </g>
    <g id="cad-spokes-{{ u }}">
      <circle r="26" fill="none"/>
      <g fill="#3d4146" stroke="#0d0d0d" stroke-width="1.3" stroke-linejoin="round">
        <path d="M-4 -7 L-8.5 -24 L8.5 -24 L4 -7 Z"/>
        <path d="M-4 -7 L-8.5 -24 L8.5 -24 L4 -7 Z" transform="rotate(72)"/>
        <path d="M-4 -7 L-8.5 -24 L8.5 -24 L4 -7 Z" transform="rotate(144)"/>
        <path d="M-4 -7 L-8.5 -24 L8.5 -24 L4 -7 Z" transform="rotate(216)"/>
        <path d="M-4 -7 L-8.5 -24 L8.5 -24 L4 -7 Z" transform="rotate(288)"/>
      </g>
      <g stroke="#a7aeb5" stroke-width="1.3" stroke-linecap="round">
        <path d="M-6.5 -22 L-3 -9"/><path d="M-6.5 -22 L-3 -9" transform="rotate(72)"/><path d="M-6.5 -22 L-3 -9" transform="rotate(144)"/><path d="M-6.5 -22 L-3 -9" transform="rotate(216)"/><path d="M-6.5 -22 L-3 -9" transform="rotate(288)"/>
      </g>
      <circle r="8.5" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="1.5"/>
      <g fill="#0d0d0d"><circle r="2.6"/><circle cx="0" cy="-5.2" r=".9"/><circle cx="4.9" cy="-1.6" r=".9"/><circle cx="3" cy="4.2" r=".9"/><circle cx="-3" cy="4.2" r=".9"/><circle cx="-4.9" cy="-1.6" r=".9"/></g>
    </g>
    <g id="cad-shine-{{ u }}">
      <path d="M-26 -14 A30 30 0 0 1 -6 -29" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
      <path d="M-35 6 A36 36 0 0 1 -30 -18" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".18"/>
    </g>'''

body = '''
    <!-- roof (cream vinyl, seam lines) + chrome window frames + glass -->
    <use href="#cad-roof-shape-{{ u }}" fill="url(#cad-roof-{{ u }})" stroke="#0d0d0d" stroke-width="3" stroke-linejoin="round"/>
    <path d="M248 74 Q300 68 440 67" fill="none" stroke="#d6cbaf" stroke-width="3" stroke-linecap="round"/>
    <path d="M226 104 Q300 96 486 96" fill="none" stroke="#cdbf9c" stroke-width="1" stroke-dasharray="1.5 3" opacity=".9"/>
    <path d="M261 122 L267 83 Q269 77 276 77 L357 75 L357 122 Z" fill="url(#cad-glass-{{ u }})" stroke="#e6e9ec" stroke-width="3" stroke-linejoin="round"/>
    <path d="M365 122 L365 75 L443 73 Q451 73 457 79 L501 122 Z" fill="url(#cad-glass-{{ u }})" stroke="#e6e9ec" stroke-width="3" stroke-linejoin="round"/>
    <path d="M473 96 L476 122" stroke="#e6e9ec" stroke-width="2.4"/>
    <path d="M361 75 L361 124" stroke="#9aa2a9" stroke-width="5"/><path d="M360 76 L360 123" stroke="#f4f6f8" stroke-width="1.5"/>
    <path d="M280 122 L316 77 L334 76 L298 122 Z M388 122 L424 74 L436 74 L400 122 Z" fill="#fff" opacity=".12"/>
    <!-- driver: cap, shoulder, arm out of the window in a Team Butti jersey -->
    <g fill="#0b0f14"><circle cx="420" cy="99" r="11"/><path d="M408 96 Q410 84 422 84 Q432 84 434 94 L445 96 Q445 99 438 99 L408 99 Z"/><path d="M398 122 Q402 108 420 108 Q436 108 442 122 Z"/></g>
    <path d="M432 112 Q446 104 466 110 L470 120 Q450 117 436 121 Z" fill="#ff2e93" stroke="#0d0d0d" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M466 110 Q478 109 482 116 Q480 121 470 120 Z" fill="#c98a5e" stroke="#0d0d0d" stroke-width="2" stroke-linejoin="round"/>

    <!-- body: candy paint with sky/horizon reflections, leopard lettering, door gaps over the lettering like real vinyl -->
    <use href="#cad-shape-{{ u }}" fill="url(#cad-paint-{{ u }})"/>
    <g clip-path="url(#cad-clip-{{ u }})">
      <path d="M0 131 L720 136 L720 141 L0 136 Z" fill="#fff" opacity=".42"/>
      <path d="M0 140 L720 145 L720 158 L0 153 Z" fill="#ffb199" opacity=".16"/>
      <text class="cad__txt" x="377" y="198" font-size="70" text-anchor="middle" textLength="300" lengthAdjust="spacingAndGlyphs" fill="#2a1608" opacity=".55">TEAM BUTTI</text>
      <text class="cad__txt" x="374" y="195" font-size="70" text-anchor="middle" textLength="300" lengthAdjust="spacingAndGlyphs" fill="url(#cad-leo-{{ u }})" stroke="#2a1608" stroke-width="2.4" paint-order="stroke">TEAM BUTTI</text>
      <g fill="none" stroke-linecap="round">
        <path d="M252 129 L248 168 Q246 188 236 199 M361 130 L361 201 M512 131 Q520 160 518 199" stroke="#3d0901" stroke-width="1.8" opacity=".75"/>
        <path d="M255 130 L251 168 Q249 188 239 199 M364 130 L364 201 M515 131 Q523 160 521 199" stroke="#ff9d80" stroke-width="1" opacity=".45"/>
      </g>
      <path d="M0 198 L720 203 L720 240 L0 240 Z" fill="#000" opacity=".22"/>
    </g>
    <use href="#cad-shape-{{ u }}" fill="none" stroke="#0d0d0d" stroke-width="3" stroke-linejoin="round"/>
    <!-- chrome: beltline, rocker, wheel arch trims, rear fin, door handles, hood ornament, script -->
    <path d="M18 127 L686 131" stroke="url(#cad-chrome-{{ u }})" stroke-width="4" stroke-linecap="round"/>
    <path d="M234 197 L516 197 M36 188 L119 190 M631 190 L688 187" stroke="url(#cad-chrome-{{ u }})" stroke-width="5" stroke-linecap="round"/>
    <path d="M125 194 A50 50 0 0 1 227 194 M523 194 A50 50 0 0 1 625 194" fill="none" stroke="#e6e9ec" stroke-width="2.4"/>
    <path d="M12 125 L36 120 L70 125" fill="none" stroke="url(#cad-chrome-{{ u }})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 126 L60 127" stroke="#fff" stroke-width="2" opacity=".7"/>
    <rect x="326" y="132.5" width="22" height="5.5" rx="2.7" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="1.4"/>
    <rect x="478" y="133.5" width="22" height="5.5" rx="2.7" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="1.4"/>
    <text class="cad__script" x="88" y="160" font-size="15" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width=".6" paint-order="stroke" transform="rotate(-2 88 160)">DeVille</text>
    <path d="M682 127 L689 117 L696 127" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="689" cy="121" r="2.2" fill="#ffd400" stroke="#0d0d0d" stroke-width="1"/>
    <!-- tail light, rear bumper, exhaust -->
    <rect x="6" y="128" width="10" height="46" rx="3" fill="#ff2b2b" stroke="#0d0d0d" stroke-width="2"/>
    <rect x="8" y="132" width="3" height="38" rx="1.5" fill="#ffb3a8" opacity=".8"/>
    <rect x="1" y="170" width="56" height="15" rx="6" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="2.5"/>
    <path d="M4 175 H52" stroke="#fff" stroke-width="2" opacity=".8"/>
    <path d="M42 189 L22 190" stroke="#0d0d0d" stroke-width="7" stroke-linecap="round"/>
    <path d="M42 189 L22 190" stroke="#b9c0c6" stroke-width="4" stroke-linecap="round"/>
    <!-- front: stacked dual headlights ('66), grille edge, bumper, amber marker -->
    <ellipse cx="712" cy="151" rx="22" ry="26" fill="url(#cad-glow-{{ u }})" opacity=".55"/>
    <rect x="696" y="132" width="13" height="40" rx="4" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="2"/>
    <circle cx="703.5" cy="142.5" r="5.3" fill="#fffbe6" stroke="#0d0d0d" stroke-width="1.4"/>
    <circle cx="703.5" cy="160.5" r="5.3" fill="#fffbe6" stroke="#0d0d0d" stroke-width="1.4"/>
    <circle cx="702" cy="141" r="1.8" fill="#fff"/><circle cx="702" cy="159" r="1.8" fill="#fff"/>
    <path d="M709 134 L713 136 L713 168 L709 170" fill="#1a1a1a" stroke="#0d0d0d" stroke-width="1.4"/>
    <path d="M710 140 H713 M710 146 H713 M710 152 H713 M710 158 H713 M710 164 H713" stroke="#9aa2a9" stroke-width="1.2"/>
    <rect x="683" y="153" width="11" height="5" rx="2" fill="#ffb21c" stroke="#0d0d0d" stroke-width="1.2"/>
    <rect x="651" y="170" width="66" height="16" rx="6" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="2.5"/>
    <path d="M654 175 H712" stroke="#fff" stroke-width="2" opacity=".8"/>
    <!-- mirror + antenna -->
    <path d="M512 118 L522 112 L530 114 L526 122 Z" fill="url(#cad-chrome-{{ u }})" stroke="#0d0d0d" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M612 129 L626 60" stroke="#2a2a2a" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="626" cy="60" r="2" fill="#2a2a2a"/>'''

def wheel(cx):
    box = 'left: %s; top: %s' % (pct(cx - TR, VW), pct(WY - TR, VH))
    vb = 'viewBox="%d %d %d %d"' % (-TR, -TR, 2 * TR, 2 * TR)
    return ('<span class="cad__wheel" style="%s"><svg %s focusable="false"><use href="#cad-tyre-{{ u }}"/></svg>'
            '<svg class="wh" %s focusable="false"><use href="#cad-spokes-{{ u }}"/></svg>'
            '<svg %s focusable="false"><use href="#cad-shine-{{ u }}"/></svg></span>') % (box, vb, vb, vb)

out = '''{%%- comment -%%}
  Team Butti custom Cadillac (1966 Sedan de Ville), side view facing right. Generated by tools/art/cadillac.py.
  Candy red body slammed low, cream vinyl roof, leopard "TEAM BUTTI" lettering across the doors, stacked dual headlights,
  black 5-spoke wheels with polished lips and red calipers.
  Layers moved by theme.js (carRig) with transforms only: .cad__ghost = speed trail, .car__body = suspension, .wh = spinning spokes.
  uid: unique id for the SVG defs (use section.id).
{%%- endcomment -%%}
{%%- assign u = uid | default: 'car' | handle -%%}
<div class="cad" aria-hidden="true">
  <svg class="cad__ghost cad__ghost--a" viewBox="0 0 %d %d" focusable="false"><use href="#cad-sil-{{ u }}" fill="currentColor"/></svg>
  <svg class="cad__ghost cad__ghost--b" viewBox="0 0 %d %d" focusable="false"><use href="#cad-sil-{{ u }}" fill="currentColor"/></svg>
  <svg class="cad__ground" viewBox="0 0 %d %d" focusable="false"><ellipse class="cad__shadow" cx="360" cy="229" rx="342" ry="8" fill="#000" opacity=".32"/></svg>
  <svg class="cad__body car__body" viewBox="0 0 %d %d" focusable="false">
    <defs>%s
    </defs>%s
  </svg>
  %s
  %s
</div>
''' % (VW, VH, VW, VH, VW, VH, VW, VH, defs, body, wheel(WR), wheel(WF))
open(sys.argv[1], 'w').write(out)
print('ok', len(out))
