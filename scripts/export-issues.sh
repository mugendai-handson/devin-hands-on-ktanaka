#!/bin/bash

set -euo pipefail

SOURCE_REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
OUTPUT_DIR="${2:-./issue-export}"

mkdir -p "$OUTPUT_DIR"

echo "Exporting from $SOURCE_REPO (phase:0 は除外)"

# Issue を取得 → phase:0 ラベルを持つものを除外
gh issue list \
  --repo "$SOURCE_REPO" \
  --state open \
  --limit 1000 \
  --json number,title,body,labels,state \
  | jq '[.[] | select(.labels | map(.name) | contains(["phase:0"]) | not)]' \
  > "$OUTPUT_DIR/issues.json"

ISSUE_COUNT=$(jq 'length' "$OUTPUT_DIR/issues.json")
echo "  Issues: $ISSUE_COUNT"

# ラベルをエクスポート
gh label list \
  --repo "$SOURCE_REPO" \
  --limit 200 \
  --json name,description,color \
  > "$OUTPUT_DIR/labels.json"

LABEL_COUNT=$(jq 'length' "$OUTPUT_DIR/labels.json")
echo "  Labels: $LABEL_COUNT"

echo "Exported to $OUTPUT_DIR/"
