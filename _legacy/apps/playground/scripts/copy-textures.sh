#!/bin/bash
# Copy AmbientCG textures needed for playground testing
# Run from packages/playground directory

ASSETS_BASE="${1:-$HOME/assets/AmbientCG/Assets}"
PUBLIC_DIR="./public/assets/textures/ambientcg"

if [ ! -d "$ASSETS_BASE" ]; then
    echo "ERROR: Assets directory not found: $ASSETS_BASE"
    exit 1
fi

mkdir -p "$PUBLIC_DIR/materials"
mkdir -p "$PUBLIC_DIR/decals"

# Full PBR map suffixes
PBR_MAPS=(
    "Color"
    "NormalGL"
    "Roughness"
    "AmbientOcclusion"
    "Displacement"
)

# Materials for walls, floors, props
MATERIALS=(
    # Concrete
    "Concrete004" "Concrete015" "Concrete022" "Concrete034"
    # Brick
    "Bricks001" "Bricks010" "Bricks024" "Bricks037"
    # Metal
    "Metal001" "Metal006" "Metal012" "Metal034"
    # Rust (flooded world weathering)
    "Rust001" "Rust004"
    # Asphalt (floors)
    "Asphalt001" "Asphalt010"
    # Tiles (floors, roofs)
    "Tiles001" "Tiles074"
    # Corrugated steel (makeshift walls, roofs, shanty construction)
    "CorrugatedSteel001" "CorrugatedSteel003" "CorrugatedSteel005"
    # Painted wood (weathered structures)
    "PaintedWood001" "PaintedWood003" "PaintedWood005"
    # Fabric (tarps, awnings, sails)
    "Fabric001" "Fabric003" "Fabric006"
    # Roofing
    "RoofingTiles001" "RoofingTiles006"
)

# Decals for weathering and detail
DECALS=(
    # Water damage
    "Leaking001" "Leaking002" "Leaking003" "Leaking004" "Leaking005"
    # Surface damage
    "AsphaltDamage001"
)

echo "=== Copying PBR Materials ==="
echo "Source: $ASSETS_BASE/MATERIAL/1K-JPG"
echo ""

for tex in "${MATERIALS[@]}"; do
    SRC_DIR="$ASSETS_BASE/MATERIAL/1K-JPG/$tex"
    if [ -d "$SRC_DIR" ]; then
        echo "Copying $tex..."
        mkdir -p "$PUBLIC_DIR/materials/$tex"
        for map in "${PBR_MAPS[@]}"; do
            SRC_FILE="$SRC_DIR/${tex}_1K-JPG_${map}.jpg"
            if [ -f "$SRC_FILE" ]; then
                cp "$SRC_FILE" "$PUBLIC_DIR/materials/$tex/"
            fi
        done
    else
        echo "  (skip) $tex not found"
    fi
done

echo ""
echo "=== Copying Decals ==="
echo "Source: $ASSETS_BASE/DECAL/1K-JPG"
echo ""

for tex in "${DECALS[@]}"; do
    SRC_DIR="$ASSETS_BASE/DECAL/1K-JPG/$tex"
    if [ -d "$SRC_DIR" ]; then
        echo "Copying $tex..."
        mkdir -p "$PUBLIC_DIR/decals/$tex"
        cp "$SRC_DIR"/*.jpg "$PUBLIC_DIR/decals/$tex/" 2>/dev/null || true
    else
        echo "  (skip) $tex not found"
    fi
done

echo ""
echo "Done!"
echo ""
echo "Total size:"
du -sh "$PUBLIC_DIR"
