#!/bin/bash
#
# Copy AmbientCG textures from local assets to shared package
#
# Usage:
#   ./scripts/copy-textures.sh [path-to-ambientcg-assets]
#
# Default path: ~/assets/AmbientCG/Assets

set -e

ASSETS_BASE="${1:-$HOME/assets/AmbientCG/Assets}"
OUTPUT_DIR="./textures/ambientcg"

# PBR maps to copy (in order of importance)
PBR_MAPS=(
    "Color"
    "NormalGL"
    "Roughness"
    "AmbientOcclusion"
    "Displacement"
)

# Materials for Flooded World
MATERIALS=(
    # Concrete
    "Concrete004" "Concrete015" "Concrete022" "Concrete034"
    # Brick
    "Bricks001" "Bricks010" "Bricks024" "Bricks037"
    # Metal
    "Metal001" "Metal006" "Metal012" "Metal034"
    # Rust
    "Rust001" "Rust004"
    # Asphalt
    "Asphalt001" "Asphalt010"
    # Tiles
    "Tiles001" "Tiles074"
    # Flooded World specific
    "CorrugatedSteel001" "CorrugatedSteel003" "CorrugatedSteel005"
    "PaintedWood001" "PaintedWood003" "PaintedWood005"
    "Fabric001" "Fabric003" "Fabric006"
    "RoofingTiles001" "RoofingTiles006"
)

# Decals for weathering
DECALS=(
    "Leaking001" "Leaking002" "Leaking003" "Leaking004" "Leaking005"
    "AsphaltDamage001"
)

echo "=== Neo-Tokyo Assets: PBR Texture Copy ==="
echo "Source: $ASSETS_BASE"
echo "Output: $OUTPUT_DIR"
echo ""

# Create output directories
mkdir -p "$OUTPUT_DIR/materials"
mkdir -p "$OUTPUT_DIR/decals"

# Copy materials
echo "Copying materials..."
for mat in "${MATERIALS[@]}"; do
    MAT_DIR="$OUTPUT_DIR/materials/$mat"
    mkdir -p "$MAT_DIR"

    for map in "${PBR_MAPS[@]}"; do
        SRC="$ASSETS_BASE/$mat/${mat}_1K-JPG_${map}.jpg"
        if [ -f "$SRC" ]; then
            cp "$SRC" "$MAT_DIR/" 2>/dev/null || true
        fi
    done
    echo "  ✓ $mat"
done

# Copy decals
echo "Copying decals..."
for decal in "${DECALS[@]}"; do
    DECAL_DIR="$OUTPUT_DIR/decals/$decal"
    mkdir -p "$DECAL_DIR"

    for map in "${PBR_MAPS[@]}" "Opacity" "NormalDX"; do
        SRC="$ASSETS_BASE/$decal/${decal}_1K-JPG_${map}.jpg"
        if [ -f "$SRC" ]; then
            cp "$SRC" "$DECAL_DIR/" 2>/dev/null || true
        fi
    done
    echo "  ✓ $decal"
done

echo ""
echo "=== Copy complete ==="
echo "Total size: $(du -sh "$OUTPUT_DIR" | cut -f1)"
