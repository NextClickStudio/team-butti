#!/usr/bin/env bash
# Higgsfield clip -> transparent sprite sheet for the "Cadillac a scroll" section.
#
#   ./make-car-sprite.sh cadillac-loop.mp4 [out.webp] [cols] [rows] [frame_width] [key_color]
#
# Input: the Cadillac side view, camera locked, on a flat green background (#00FF00),
# wheels spinning in place (or a clip already cut out with Higgsfield "Video Background Remover").
# Output: one WebP with cols x rows frames sampled evenly over the clip, background removed.
# Upload it in the theme editor: Cadillac a scroll -> "Sprite della Cadillac", same cols/rows.
set -euo pipefail
in=${1:?usage: make-car-sprite.sh input.mp4 [out.webp] [cols] [rows] [frame_width] [key_color]}
out=${2:-cadillac-sprite.webp}
cols=${3:-6}; rows=${4:-4}; w=${5:-640}; key=${6:-0x00FF00}
n=$((cols * rows))
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
fps=$(echo "$n / $dur" | bc -l)
# alpha already present (e.g. WebM/ProRes from the background remover)? then skip the keying
if ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of csv=p=0 "$in" | grep -qE 'yuva|rgba|argb|bgra'; then
  keyf="format=rgba"
else
  keyf="colorkey=${key}:0.32:0.10,despill=type=green:mix=0.6:expand=0.2,format=rgba"
fi
ffmpeg -v error -y -i "$in" -frames:v 1 \
  -vf "fps=${fps},scale=${w}:-2:flags=lanczos,${keyf},tile=${cols}x${rows}" \
  -c:v libwebp -lossless 0 -q:v 82 -pix_fmt yuva420p "$out"
ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$out" | awk -F, -v c="$cols" -v r="$rows" -v n="$n" -v o="$out" \
  '{ printf "%s: %sx%s px, %d frames (%dx%d), frame %dx%d px\n", o, $1, $2, n, c, r, $1/c, $2/r }'
