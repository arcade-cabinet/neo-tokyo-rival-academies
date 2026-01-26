#!/bin/bash
# Unity Graphics/Visual Regression Test Runner
# Runs graphics tests and manages reference images
#
# Usage: ./run-graphics-tests.sh [run|update-baseline|compare]
#
# Commands:
#   run            - Run graphics tests against baseline images
#   update-baseline - Update baseline reference images from latest test run
#   compare        - Generate comparison report between actual and baseline
#
# Environment variables:
#   UNITY_PATH     - Override Unity Editor path detection
#   UNITY_VERSION  - Specify Unity version (default: 6000.0.25f1)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"
RESULTS_PATH="$PROJECT_PATH/TestResults"
BASELINE_PATH="$PROJECT_PATH/Assets/Tests/Graphics/ReferenceImages"
ACTUAL_PATH="$RESULTS_PATH/graphics/ActualImages"
DIFF_PATH="$RESULTS_PATH/graphics/DiffImages"

# Command mode
COMMAND="${1:-run}"

# Unity version - keep in sync with ProjectSettings/ProjectVersion.txt
UNITY_VERSION="${UNITY_VERSION:-6000.3.5f1}"

# Function to detect Unity Editor path (same as run-tests.sh)
detect_unity_path() {
    if [[ -n "$UNITY_PATH" && -x "$UNITY_PATH" ]]; then
        echo "$UNITY_PATH"
        return 0
    fi

    local editors=()

    if [[ "$OSTYPE" == "darwin"* ]]; then
        editors=(
            "/Applications/Unity/Hub/Editor/${UNITY_VERSION}/Unity.app/Contents/MacOS/Unity"
            "/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity"
        )
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        editors=(
            "/opt/unity/Editor/Unity"
            "$HOME/Unity/Hub/Editor/${UNITY_VERSION}/Editor/Unity"
            "unity-editor"
        )
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        editors=(
            "/c/Program Files/Unity/Hub/Editor/${UNITY_VERSION}/Editor/Unity.exe"
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

# Function to run graphics tests
run_graphics_tests() {
    echo ""
    echo "========================================"
    echo " Running Graphics Tests"
    echo "========================================"
    echo ""

    local results_file="$RESULTS_PATH/graphics-results.xml"
    local log_file="$RESULTS_PATH/graphics-log.txt"

    mkdir -p "$RESULTS_PATH"
    mkdir -p "$DIFF_PATH"

    local exit_code=0

    "$UNITY_PATH" \
        -batchmode \
        -nographics \
        -projectPath "$PROJECT_PATH" \
        -runTests \
        -testPlatform "PlayMode" \
        -testCategory "Graphics" \
        -testResults "$results_file" \
        -logFile "$log_file" \
        2>&1 || exit_code=$?

    echo ""
    echo "Test execution completed (exit code: $exit_code)"
    echo "Log file: $log_file"
    echo "Results: $results_file"

    # Check for test failures
    if [[ -f "$results_file" ]]; then
        local failed
        failed=$(sed -n 's/.*failed="\([0-9]*\)".*/\1/p' "$results_file" | head -1)
        failed="${failed:-0}"

        if [[ "$failed" -gt 0 ]]; then
            echo ""
            echo "WARNING: $failed graphics test(s) failed"
            echo "Check diff images in: $DIFF_PATH"
            return 1
        fi
    fi

    echo ""
    echo "SUCCESS: All graphics tests passed"
    return 0
}

# Function to update baseline images
update_baseline() {
    echo ""
    echo "========================================"
    echo " Updating Baseline Reference Images"
    echo "========================================"
    echo ""

    if [[ ! -d "$ACTUAL_PATH" ]]; then
        echo "ERROR: No actual images found at $ACTUAL_PATH"
        echo "Run graphics tests first: $0 run"
        exit 1
    fi

    # Create baseline directory if needed
    mkdir -p "$BASELINE_PATH"

    # Count images to update
    local image_count
    image_count=$(find "$ACTUAL_PATH" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')

    if [[ "$image_count" -eq 0 ]]; then
        echo "No images found to update"
        exit 1
    fi

    echo "Found $image_count image(s) to update"
    echo ""

    # Prompt for confirmation
    read -p "Update baseline images? This will overwrite existing baselines. [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled"
        exit 0
    fi

    # Copy actual images to baseline
    cp -R "$ACTUAL_PATH/"* "$BASELINE_PATH/"

    echo ""
    echo "SUCCESS: Updated $image_count baseline image(s)"
    echo "Baseline path: $BASELINE_PATH"
    echo ""
    echo "Remember to commit the updated baseline images!"
}

# Function to generate comparison report
generate_comparison() {
    echo ""
    echo "========================================"
    echo " Generating Comparison Report"
    echo "========================================"
    echo ""

    if [[ ! -d "$ACTUAL_PATH" ]]; then
        echo "ERROR: No actual images found"
        echo "Run graphics tests first: $0 run"
        exit 1
    fi

    if [[ ! -d "$BASELINE_PATH" ]]; then
        echo "ERROR: No baseline images found"
        echo "Create baselines first: $0 update-baseline"
        exit 1
    fi

    local report_file="$RESULTS_PATH/graphics-comparison.html"

    # Generate HTML report
    cat > "$report_file" <<'HTMLHEAD'
<!DOCTYPE html>
<html>
<head>
    <title>Graphics Test Comparison</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .comparison { display: flex; gap: 20px; margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .comparison img { max-width: 400px; height: auto; border: 1px solid #ccc; }
        .comparison .label { font-weight: bold; margin-bottom: 8px; }
        .pass { border-color: #4caf50; background: #e8f5e9; }
        .fail { border-color: #f44336; background: #ffebee; }
        .status { padding: 4px 12px; border-radius: 4px; font-weight: bold; }
        .status.pass { background: #4caf50; color: white; }
        .status.fail { background: #f44336; color: white; }
    </style>
</head>
<body>
    <h1>Graphics Test Comparison Report</h1>
    <p>Generated: TIMESTAMP</p>
HTMLHEAD

    # Replace timestamp
    sed -i.bak "s/TIMESTAMP/$(date)/" "$report_file" 2>/dev/null || \
        sed -i '' "s/TIMESTAMP/$(date)/" "$report_file"
    rm -f "${report_file}.bak"

    # Find all baseline images and compare
    local total=0
    local passed=0

    while IFS= read -r baseline_img; do
        local img_name
        img_name=$(basename "$baseline_img")
        local actual_img="$ACTUAL_PATH/$img_name"
        local diff_img="$DIFF_PATH/$img_name"

        ((total++))

        local status="fail"
        local status_text="MISSING"

        if [[ -f "$actual_img" ]]; then
            # Check if images are identical (basic comparison)
            if cmp -s "$baseline_img" "$actual_img"; then
                status="pass"
                status_text="PASS"
                ((passed++))
            else
                status_text="DIFF"
            fi
        fi

        cat >> "$report_file" <<HTMLITEM
    <div class="comparison $status">
        <div>
            <div class="label">Baseline</div>
            <img src="file://$baseline_img" alt="Baseline">
        </div>
        <div>
            <div class="label">Actual <span class="status $status">$status_text</span></div>
            <img src="file://$actual_img" alt="Actual" onerror="this.alt='Not found'">
        </div>
    </div>
HTMLITEM

    done < <(find "$BASELINE_PATH" -name "*.png" 2>/dev/null)

    cat >> "$report_file" <<'HTMLFOOT'
</body>
</html>
HTMLFOOT

    echo "Comparison: $passed/$total passed"
    echo "Report generated: $report_file"

    # Open report on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$report_file" 2>/dev/null || true
    fi
}

# Main script execution
echo "Unity Graphics Test Runner"
echo "=========================="
echo "Project: $PROJECT_PATH"
echo "Unity Version: $UNITY_VERSION"
echo ""

case "$COMMAND" in
    run)
        if ! UNITY_PATH=$(detect_unity_path); then
            echo "ERROR: Unity Editor not found."
            echo "Please set UNITY_PATH environment variable or install Unity ${UNITY_VERSION}"
            exit 1
        fi
        echo "Using Unity: $UNITY_PATH"
        run_graphics_tests
        ;;
    update-baseline | baseline | update)
        update_baseline
        ;;
    compare | report)
        generate_comparison
        ;;
    *)
        echo "Usage: $0 [run|update-baseline|compare]"
        echo ""
        echo "Commands:"
        echo "  run             - Run graphics tests against baseline images"
        echo "  update-baseline - Update baseline reference images from latest test run"
        echo "  compare         - Generate HTML comparison report"
        echo ""
        echo "Environment Variables:"
        echo "  UNITY_PATH    - Path to Unity Editor executable"
        echo "  UNITY_VERSION - Unity version to use (default: ${UNITY_VERSION})"
        echo ""
        echo "Paths:"
        echo "  Baseline:  $BASELINE_PATH"
        echo "  Actual:    $ACTUAL_PATH"
        echo "  Diff:      $DIFF_PATH"
        exit 1
        ;;
esac
