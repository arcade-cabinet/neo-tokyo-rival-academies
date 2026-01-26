#!/bin/bash
#
# Copy AmbientCG textures from local assets to shared-assets package
#
# Usage:
#   ./scripts/copy-textures.sh [path-to-ambientcg-assets]
#
# Default path: ~/assets/AmbientCG/Assets

set -e

ASSETS_BASE="${1:-$HOME/assets/AmbientCG/Assets}"
OUTPUT_DIR="./assets/textures/ambientcg"

# PBR maps to copy
PBR_MAPS=("Color" "NormalGL" "Roughness" "AmbientOcclusion" "Displacement")

# Materials for Flooded World
MATERIALS=(
    "Concrete004" "Concrete015" "Concrete022" "Concrete034"
    "Bricks001" "Bricks010" "Bricks024" "Bricks037"
    "Metal001" "Metal006" "Metal012" "Metal034"
    "Rust001" "Rust004"
    "Asphalt001" "Asphalt010"
    "Tiles001" "Tiles074"
    "CorrugatedSteel001" "CorrugatedSteel003" "CorrugatedSteel005"
    "PaintedWood001" "PaintedWood003" "PaintedWood005"
    "Fabric001" "Fabric003" "Fabric006"
    "RoofingTiles001" "RoofingTiles006"
)

DECALS=("Leaking001" "Leaking002" "Leaking003" "Leaking004" "Leaking005" "AsphaltDamage001")

echo "=== Neo-Tokyo Assets: PBR Texture Copy ==="
echo "Source: $ASSETS_BASE"
echo "Output: $OUTPUT_DIR"

mkdir -p "$OUTPUT_DIR/materials" "$OUTPUT_DIR/decals"

echo "Copying materials..."
for mat in "${MATERIALS[@]}"; do
    MAT_DIR="$OUTPUT_DIR/materials/$mat"
    mkdir -p "$MAT_DIR"
    for map in "${PBR_MAPS[@]}"; do
        SRC="$ASSETS_BASE/$mat/${mat}_1K-JPG_${map}.jpg"
        [ -f "$SRC" ] && cp "$SRC" "$MAT_DIR/" 2>/dev/null
    done
    echo "  ✓ $mat"
done

echo "Copying decals..."
for decal in "${DECALS[@]}"; do
    DECAL_DIR="$OUTPUT_DIR/decals/$decal"
    mkdir -p "$DECAL_DIR"
    for map in "${PBR_MAPS[@]}" "Opacity"; do
        SRC="$ASSETS_BASE/$decal/${decal}_1K-JPG_${map}.jpg"
        [ -f "$SRC" ] && cp "$SRC" "$DECAL_DIR/" 2>/dev/null
    done
    echo "  ✓ $decal"
done

echo "=== Copy complete ==="
