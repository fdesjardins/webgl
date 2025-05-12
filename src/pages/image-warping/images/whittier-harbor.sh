#!/bin/sh

BASE="https://whittier-harbor/pano"
ARGS="avifenc_max=0&avifenc_min=0&avifenc_speed=5&resolution=1920x1440"

wget "$BASE/1?$ARGS" --output-document=1.avif --no-check-certificate
wget "$BASE/2?$ARGS" --output-document=2.avif --no-check-certificate
wget "$BASE/3?$ARGS" --output-document=3.avif --no-check-certificate
wget "$BASE/4?$ARGS" --output-document=4.avif --no-check-certificate

X="85%"

magick 1.avif -gravity Center -crop ${X}x100%+0+0 1.crop.png
magick 2.avif -gravity Center -crop ${X}x100%+0+0 2.crop.png
magick 3.avif -gravity Center -crop ${X}x100%+0+0 3.crop.png
magick 4.avif -gravity Center -crop ${X}x100%+0+0 4.crop.png
