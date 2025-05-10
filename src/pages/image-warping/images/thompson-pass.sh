#!/bin/sh

BASE="https://thompson-pass/pano"
ARGS="avifenc_max=0&avifenc_min=0&avifenc_speed=5"

wget "$BASE/1?$ARGS" --output-document=1.avif --no-check-certificate
wget "$BASE/2?$ARGS" --output-document=2.avif --no-check-certificate
wget "$BASE/3?$ARGS" --output-document=3.avif --no-check-certificate
wget "$BASE/4?$ARGS" --output-document=4.avif --no-check-certificate
