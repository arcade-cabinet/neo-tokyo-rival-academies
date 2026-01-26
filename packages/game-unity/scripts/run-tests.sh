#!/bin/bash
# Headless Unity test runner
# Runs EditMode and/or PlayMode tests without Editor GUI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"
RESULTS_PATH="$PROJECT_PATH/TestResults"

# Default to all tests
TEST_MODE="${1:-all}"

# Detect Unity Editor path
if [[ "$OSTYPE" == "darwin"* ]]; then
    UNITY_EDITORS=(
        "/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity"
        "/Applications/Unity/Hub/Editor/6000.3.0f1/Unity.app/Contents/MacOS/Unity"
    )
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    UNITY_EDITORS=(
        "/opt/unity/Editor/Unity"
        "$HOME/Unity/Hub/Editor/6000.3.5f1/Editor/Unity"
        "unity-editor"
    )
else
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
    echo "Error: Unity Editor not found."
    exit 1
fi

mkdir -p "$RESULTS_PATH"

run_tests() {
    local mode=$1
    local results_file="$RESULTS_PATH/${mode,,}-results.xml"

    echo "Running $mode tests..."

    "$UNITY_PATH" \
        -batchmode \
        -projectPath "$PROJECT_PATH" \
        -runTests \
        -testPlatform "$mode" \
        -testResults "$results_file" \
        -logFile "$RESULTS_PATH/${mode,,}-log.txt" \
        2>&1 || true

    if [[ -f "$results_file" ]]; then
        # Parse NUnit XML for pass/fail counts
        local total=$(grep -oP 'total="\K[0-9]+' "$results_file" | head -1)
        local passed=$(grep -oP 'passed="\K[0-9]+' "$results_file" | head -1)
        local failed=$(grep -oP 'failed="\K[0-9]+' "$results_file" | head -1)

        echo "$mode: $passed/$total passed, $failed failed"
        echo "Results: $results_file"

        if [[ "$failed" -gt 0 ]]; then
            return 1
        fi
    else
        echo "Warning: No results file generated for $mode"
        return 1
    fi
}

case "$TEST_MODE" in
    editmode|EditMode)
        run_tests "EditMode"
        ;;
    playmode|PlayMode)
        run_tests "PlayMode"
        ;;
    graphics|Graphics)
        echo "Running Graphics tests (PlayMode with category filter)..."
        "$UNITY_PATH" \
            -batchmode \
            -projectPath "$PROJECT_PATH" \
            -runTests \
            -testPlatform "PlayMode" \
            -testCategory "Graphics" \
            -testResults "$RESULTS_PATH/graphics-results.xml" \
            -logFile "$RESULTS_PATH/graphics-log.txt" \
            2>&1 || true
        ;;
    all)
        run_tests "EditMode"
        run_tests "PlayMode"
        ;;
    *)
        echo "Usage: $0 [editmode|playmode|graphics|all]"
        exit 1
        ;;
esac

echo "Test run complete. Results in: $RESULTS_PATH"
