#!/bin/bash

set -euo pipefail

TARGET_REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
INPUT_DIR="${2:-./issue-export}"

if [ ! -f "$INPUT_DIR/issues.json" ] || [ ! -f "$INPUT_DIR/labels.json" ]; then
  echo "Error: issues.json / labels.json が $INPUT_DIR に見つかりません"
  echo "   先に ./scripts/export-issues.sh を実行してください"
  exit 1
fi

echo "Importing to $TARGET_REPO"

# Label 作成
echo "  → Creating labels..."
jq -c '.[]' "$INPUT_DIR/labels.json" | while read -r label; do
  name=$(echo "$label" | jq -r '.name')
  desc=$(echo "$label" | jq -r '.description // ""')
  color=$(echo "$label" | jq -r '.color')

  if gh label create "$name" \
    --repo "$TARGET_REPO" \
    --description "$desc" \
    --color "$color" \
    2>/dev/null; then
    echo "     ok: $name"
  else
    echo "     skip: $name"
  fi
done

# Issue 作成（OPEN のみ、古いものから順に番号再採番）
echo "  → Creating issues..."
jq -c '[.[] | select(.state == "OPEN")] | reverse | .[]' "$INPUT_DIR/issues.json" \
  | while read -r issue; do
  title=$(echo "$issue" | jq -r '.title')
  body=$(echo "$issue" | jq -r '.body // ""')
  labels=$(echo "$issue" | jq -r '.labels | map(.name) | join(",")')

  if [ -n "$labels" ]; then
    gh issue create \
      --repo "$TARGET_REPO" \
      --title "$title" \
      --body "$body" \
      --label "$labels" \
      > /dev/null
  else
    gh issue create \
      --repo "$TARGET_REPO" \
      --title "$title" \
      --body "$body" \
      > /dev/null
  fi
  echo "     ok: $title"
done

echo "Import completed"
