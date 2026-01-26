#!/bin/bash
# Headless Unity package resolution script
# Resolves packages without opening the Editor GUI
#
# Usage: ./resolve-packages.sh
#
# Environment variables:
#   UNITY_PATH     - Override Unity Editor path detection
#   UNITY_VERSION  - Specify Unity version (default: 6000.0.25f1)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"

# Unity version - keep in sync with ProjectSettings/ProjectVersion.txt
UNITY_VERSION="${UNITY_VERSION:-6000.3.5f1}"

# Function to detect Unity Editor path
detect_unity_path() {
    if [[ -n "$UNITY_PATH" && -x "$UNITY_PATH" ]]; then
        echo "$UNITY_PATH"
        return 0
    fi

    local editors=()

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - try Unity Hub locations with version fallbacks
        editors=(
            "/Applications/Unity/Hub/Editor/${UNITY_VERSION}/Unity.app/Contents/MacOS/Unity"
            "/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity"
            "/Applications/Unity/Hub/Editor/6000.3.0f1/Unity.app/Contents/MacOS/Unity"
            "/Applications/Unity/Hub/Editor/6000.2.0f1/Unity.app/Contents/MacOS/Unity"
        )
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - try common locations
        editors=(
            "/opt/unity/Editor/Unity"
            "$HOME/Unity/Hub/Editor/${UNITY_VERSION}/Editor/Unity"
            "$HOME/Unity/Hub/Editor/6000.3.5f1/Editor/Unity"
            "unity-editor"
        )
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash, Cygwin, or native)
        editors=(
            "/c/Program Files/Unity/Hub/Editor/${UNITY_VERSION}/Editor/Unity.exe"
            "/c/Program Files/Unity/Hub/Editor/6000.3.5f1/Editor/Unity.exe"
            "C:/Program Files/Unity/Hub/Editor/${UNITY_VERSION}/Editor/Unity.exe"
        )
    fi

    for editor in "${editors[@]}"; do
        if [[ -x "$editor" ]] || command -v "$editor" &>/dev/null; then
            echo "$editor"
            return 0
        fi
    done

    return 1
}

echo "Unity Package Resolver"
echo "======================"
echo "Project: $PROJECT_PATH"
echo "Unity Version: $UNITY_VERSION"
echo ""

# Detect Unity path
if ! UNITY_PATH=$(detect_unity_path); then
    echo "ERROR: Unity Editor not found."
    echo ""
    echo "Please set UNITY_PATH environment variable or install Unity ${UNITY_VERSION}"
    echo "Expected locations:"
    echo "  macOS:   /Applications/Unity/Hub/Editor/${UNITY_VERSION}/Unity.app/Contents/MacOS/Unity"
    echo "  Linux:   ~/Unity/Hub/Editor/${UNITY_VERSION}/Editor/Unity"
    echo "  Windows: C:/Program Files/Unity/Hub/Editor/${UNITY_VERSION}/Editor/Unity.exe"
    exit 1
fi

echo "Using Unity: $UNITY_PATH"
echo ""
echo "Resolving packages..."
echo ""

# Run Unity in batch mode to resolve packages
"$UNITY_PATH" \
    -batchmode \
    -quit \
    -projectPath "$PROJECT_PATH" \
    -logFile - \
    2>&1

echo ""
echo "Package resolution complete."
