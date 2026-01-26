#!/bin/bash
# Headless Unity test runner
# Runs EditMode and/or PlayMode tests without Editor GUI
#
# Usage: ./run-tests.sh [editmode|playmode|graphics|all]
#
# Environment variables:
#   UNITY_PATH     - Override Unity Editor path detection
#   UNITY_VERSION  - Specify Unity version (default: 6000.0.25f1)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"
RESULTS_PATH="$PROJECT_PATH/TestResults"

# Default test mode
TEST_MODE="${1:-all}"

# Unity version - keep in sync with ProjectSettings/ProjectVersion.txt
UNITY_VERSION="${UNITY_VERSION:-6000.3.5f1}"

# Function to detect Unity Editor path
detect_unity_path() {
    # Use environment variable if set
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

# Function to parse NUnit XML results (cross-platform compatible)
parse_test_results() {
    local results_file="$1"

    if [[ ! -f "$results_file" ]]; then
        echo "No results file found"
        return 1
    fi

    # Cross-platform XML parsing (works on macOS and Linux)
    local total passed failed

    # Use sed/grep that works on both BSD (macOS) and GNU (Linux)
    total=$(sed -n 's/.*total="\([0-9]*\)".*/\1/p' "$results_file" | head -1)
    passed=$(sed -n 's/.*passed="\([0-9]*\)".*/\1/p' "$results_file" | head -1)
    failed=$(sed -n 's/.*failed="\([0-9]*\)".*/\1/p' "$results_file" | head -1)

    # Default to 0 if not found
    total="${total:-0}"
    passed="${passed:-0}"
    failed="${failed:-0}"

    echo "$passed/$total passed, $failed failed"

    if [[ "$failed" -gt 0 ]]; then
        return 1
    fi
    return 0
}

# Function to run tests
run_tests() {
    local mode=$1
    local extra_args="${2:-}"
    local results_file="$RESULTS_PATH/${mode,,}-results.xml"
    local log_file="$RESULTS_PATH/${mode,,}-log.txt"

    echo ""
    echo "========================================"
    echo " Running $mode tests"
    echo "========================================"
    echo ""

    local exit_code=0

    "$UNITY_PATH" \
        -batchmode \
        -nographics \
        -projectPath "$PROJECT_PATH" \
        -runTests \
        -testPlatform "$mode" \
        -testResults "$results_file" \
        -logFile "$log_file" \
        $extra_args \
        2>&1 || exit_code=$?

    echo ""
    echo "Test execution completed (exit code: $exit_code)"
    echo "Log file: $log_file"
    echo "Results: $results_file"
    echo ""

    if [[ -f "$results_file" ]]; then
        local result_summary
        result_summary=$(parse_test_results "$results_file")
        echo "$mode: $result_summary"

        # Check for failures
        if echo "$result_summary" | grep -q "failed"; then
            local failed_count
            failed_count=$(echo "$result_summary" | sed 's/.*, \([0-9]*\) failed/\1/')
            if [[ "$failed_count" -gt 0 ]]; then
                echo ""
                echo "FAILED: $failed_count test(s) failed"
                return 1
            fi
        fi
    else
        echo "WARNING: No results file generated for $mode"
        echo "Check log file for errors: $log_file"
        return 1
    fi

    echo ""
    echo "SUCCESS: All $mode tests passed"
    return 0
}

# Main script execution
echo "Unity Test Runner"
echo "================="
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

# Create results directory
mkdir -p "$RESULTS_PATH"

# Track overall success
overall_success=true

case "$TEST_MODE" in
    editmode | EditMode | edit)
        run_tests "EditMode" || overall_success=false
        ;;
    playmode | PlayMode | play)
        run_tests "PlayMode" || overall_success=false
        ;;
    graphics | Graphics | visual)
        echo "Running Graphics tests (PlayMode with category filter)..."
        run_tests "PlayMode" "-testCategory Graphics" || overall_success=false
        ;;
    all)
        run_tests "EditMode" || overall_success=false
        run_tests "PlayMode" || overall_success=false
        ;;
    *)
        echo "Usage: $0 [editmode|playmode|graphics|all]"
        echo ""
        echo "Test Modes:"
        echo "  editmode  - Run editor tests (fast, no scene loading)"
        echo "  playmode  - Run play mode tests (full runtime)"
        echo "  graphics  - Run visual regression tests"
        echo "  all       - Run editmode and playmode tests"
        echo ""
        echo "Environment Variables:"
        echo "  UNITY_PATH    - Path to Unity Editor executable"
        echo "  UNITY_VERSION - Unity version to use (default: ${UNITY_VERSION})"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo " Test Run Complete"
echo "========================================"
echo "Results saved to: $RESULTS_PATH"
echo ""

if $overall_success; then
    echo "STATUS: ALL TESTS PASSED"
    exit 0
else
    echo "STATUS: SOME TESTS FAILED"
    exit 1
fi
