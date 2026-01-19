#!/bin/bash
# Copy AmbientCG textures needed for playground testing
# Run from packages/playground directory

ASSETS_DIR="$HOME/assets/AmbientCG/Assets/MATERIAL/1K-JPG"
PUBLIC_DIR="./public/assets/textures/ambientcg"

# Create directory structure
mkdir -p "$PUBLIC_DIR"

# Textures we need for the Wall component
TEXTURES=(
    # Concrete
    "Concrete004"
    "Concrete015"
    "Concrete022"
    "Concrete034"
    # Brick
    "Bricks001"
    "Bricks010"
    "Bricks024"
    "Bricks037"
    # Metal
    "Metal001"
    "Metal006"
    "Metal012"
    "Metal034"
    # Rust
    "Rust001"
    "Rust004"
    # Asphalt (for floors)
    "Asphalt001"
    "Asphalt010"
    # Tiles (for floors)
    "Tiles001"
    "Tiles074"
)

echo "Copying textures from $ASSETS_DIR to $PUBLIC_DIR..."

for tex in "${TEXTURES[@]}"; do
    if [ -d "$ASSETS_DIR/$tex" ]; then
        echo "Copying $tex..."
        mkdir -p "$PUBLIC_DIR/$tex"
        # Copy only the files we need (Color, NormalGL, Roughness)
        cp "$ASSETS_DIR/$tex/${tex}_1K-JPG_Color.jpg" "$PUBLIC_DIR/$tex/" 2>/dev/null
        cp "$ASSETS_DIR/$tex/${tex}_1K-JPG_NormalGL.jpg" "$PUBLIC_DIR/$tex/" 2>/dev/null
        cp "$ASSETS_DIR/$tex/${tex}_1K-JPG_Roughness.jpg" "$PUBLIC_DIR/$tex/" 2>/dev/null
    else
        echo "WARNING: $tex not found in $ASSETS_DIR"
    fi
done

echo ""
echo "Done! Textures copied to $PUBLIC_DIR"
echo ""
echo "Total size:"
du -sh "$PUBLIC_DIR"
