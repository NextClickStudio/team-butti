#!/usr/bin/env bash
# Higgsfield clip -> MP4 that scrubs smoothly with the scroll (a keyframe on every frame, no audio).
#   ./make-scrub-video.sh in.mp4 [out.mp4] [width]
set -euo pipefail
in=${1:?usage: make-scrub-video.sh in.mp4 [out.mp4] [width]}
out=${2:-scroll-scrub.mp4}; w=${3:-1920}
ffmpeg -v error -y -i "$in" -an -vf "scale=${w}:-2:flags=lanczos,fps=30" \
  -c:v libx264 -preset slow -crf 22 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart "$out"
ls -lh "$out" | awk '{ print $9 ": " $5 }'
