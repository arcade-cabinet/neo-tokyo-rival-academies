#!/bin/bash
# Headless Unity package resolution script
# Resolves packages without opening the Editor GUI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"

# Detect Unity Editor path
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - try common Unity Hub locations
    UNITY_EDITORS=(
        "/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity"
        "/Applications/Unity/Hub/Editor/6000.3.0f1/Unity.app/Contents/MacOS/Unity"
        "/Applications/Unity/Hub/Editor/6000.2.0f1/Unity.app/Contents/MacOS/Unity"
    )
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - try common locations
    UNITY_EDITORS=(
        "/opt/unity/Editor/Unity"
        "$HOME/Unity/Hub/Editor/6000.3.5f1/Editor/Unity"
        "unity-editor"  # If in PATH
    )
else
    # Windows Git Bash
    UNITY_EDITORS=(
        "/c/Program Files/Unity/Hub/Editor/6000.3.5f1/Editor/Unity.exe"
    )
fi

UNITY_PATH=""
for editor in "${UNITY_EDITORS[@]}"; do
    if [[ -x "$editor" ]] || command -v "$editor" &> /dev/null; then
        UNITY_PATH="$editor"
        break
    fi
done

if [[ -z "$UNITY_PATH" ]]; then
    echo "Error: Unity Editor not found. Please set UNITY_PATH environment variable."
    echo "Tried: ${UNITY_EDITORS[*]}"
    exit 1
fi

echo "Using Unity: $UNITY_PATH"
echo "Project: $PROJECT_PATH"
echo "Resolving packages..."

"$UNITY_PATH" \
    -batchmode \
    -quit \
    -projectPath "$PROJECT_PATH" \
    -logFile - \
    2>&1

echo "Package resolution complete."
