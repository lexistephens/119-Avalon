#!/usr/bin/env bash
# Re-download and re-optimise the 28 listing photographs for 119 Avalon Blvd.
#
# Source: Redfin listing 144938554 (MLS 906886) — ssl.cdn-redfin.com, 1280px.
# Alternate source, same shoot, if the above ever 404s:
#   https://spearsgroupfl.com/properties/119-avalon-boulevard-miramar-beach-fl-32550-838094
#   (38 images on dq1niho2427i9.cloudfront.net, folder 7ca9fe10-2b0c-4f87-827f-20f4d324ad8f)
#
# These are MLS listing photographs. Confirm usage rights before publishing.
#
# Writes originals to assets/photos/raw/ (git-ignored), then generates the
# WebP derivatives the site actually loads:
#   assets/photos/full/   1280px, q72   — hero, lightbox
#   assets/photos/thumb/   680px, q68   — gallery grid
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/photos/raw assets/photos/full assets/photos/thumb

BASE="https://ssl.cdn-redfin.com/photo/263/bigphoto/886/906886"
echo "Downloading 28 originals…"
for i in $(seq 0 27); do
  n=$(printf "%02d" "$i")
  if [ "$i" = "0" ]; then url="${BASE}_0.jpg"; else url="${BASE}_${i}_0.jpg"; fi
  curl -fsSL -A "Mozilla/5.0" -o "assets/photos/raw/${n}.jpg" "$url" \
    && printf "  %s ok\n" "$n" || printf "  %s FAILED\n" "$n"
done

echo "Generating WebP derivatives…"
uv run --quiet --with pillow python scripts/optimize-photos.py
