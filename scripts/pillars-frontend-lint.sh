#!/usr/bin/env bash
set -euo pipefail

NO_FAIL=0
if [[ "${1:-}" == "--no-fail" ]]; then
  NO_FAIL=1
fi

failures=0
report() {
  echo "[pillars-frontend-lint] $1"
  failures=$((failures + 1))
}

files=$(
  {
    git ls-files '*.tsx' '*.jsx' '*.ts' '*.js' 2>/dev/null || true
    find src tests scripts -type f \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' \) 2>/dev/null || true
  } | sort -u
)
[[ -z "$files" ]] && exit 0

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT

# Remove whole-line comments and lines explicitly disabled for this lint. This is intentionally simple; it is a guardrail, not a parser.
# Escape hatches:
# - pillars-lint-disable-file in the first 5 lines skips the file.
# - pillars-lint-disable-line skips that source line and the next source line.
existing_files=""
for f in $files; do
  [[ -f "$f" ]] || continue
  existing_files="$existing_files $f"
  if head -5 "$f" | grep -q 'pillars-lint-disable-file'; then
    continue
  fi
  awk '
    /pillars-lint-disable-line/ { skip=1; next }
    skip { skip=0; next }
    /^[[:space:]]*(\/\/|\*)/ { next }
    { print }
  ' "$f" | sed "s|^|$f:|" >> "$tmp" || true
done

if grep -nE '#[0-9a-fA-F]{3,8}' "$tmp" 2>/dev/null; then
  report "Hex colours found in source. Use tokens from tokens.css."
fi

# Allow CSS-variable escape hatches: style={{ "--token": value }} / style={{ '--token': value }}
if grep -nE 'style=\{\{' "$tmp" 2>/dev/null | grep -vE 'style=\{\{[[:space:]]*["'"'"']--'; then
  report "Inline style attributes found. Use className/tokens unless documented CSS-variable escape hatch."
fi

placeholder_files=$(echo "$existing_files" | tr ' ' '\n' | grep -vE '^$|\.(stories|story|test|spec)\.(ts|tsx|js|jsx)$' || true)
filtered_placeholder_files=""
for f in $placeholder_files; do
  if ! head -5 "$f" | grep -q 'pillars-lint-disable-file'; then
    filtered_placeholder_files="$filtered_placeholder_files $f"
  fi
done
if [[ -n "$filtered_placeholder_files" ]] && grep -nEi 'lorem ipsum|john doe|123-456-7890|555-0123|example\.com|acme corp' $filtered_placeholder_files 2>/dev/null; then
  report "Placeholder/fake content found. Replace with real copy or fixtures marked test-only."
fi

if grep -nE '<a[^>]+href=["'"'"']#' "$tmp" 2>/dev/null; then
  report "Placeholder links found: href='#'."
fi

if grep -nE 'console\.log\(' "$tmp" 2>/dev/null | grep -vE '\.(test|spec)\.'; then
  report "console.log found outside tests."
fi

if grep -nE '<(div|span)[^>]+onClick=' "$tmp" 2>/dev/null; then
  report "Non-semantic clickable div/span found. Prefer button/a with proper semantics."
fi

if grep -nE '<a[^>]+onClick=' "$tmp" 2>/dev/null | grep -vE 'href='; then
  report "Anchor with onClick and no href found. Prefer button or real link semantics."
fi

if [[ -f .pillars-frontend.json ]]; then
  engine=$(python3 - <<'PY'
import json
try:
  print(json.load(open('.pillars-frontend.json')).get('primitiveEngine',''))
except Exception:
  print('')
PY
)
  if [[ "$engine" == "base-ui" ]] && [[ -n "$existing_files" ]] && grep -nE "from ['\"]@radix-ui/" $existing_files 2>/dev/null; then
    report "Radix import found in Base UI project."
  fi
fi

if grep -nE 'className=.*(text|bg|border|ring)-(red|blue|green|yellow|purple|pink|orange|slate|gray|zinc|neutral|stone)-[0-9]{2,3}' "$tmp" 2>/dev/null; then
  report "Raw Tailwind colour utility found. Prefer semantic token utilities from tokens.css."
fi

if [[ "$failures" -gt 0 ]]; then
  if [[ "$NO_FAIL" == "1" ]]; then
    echo "[pillars-frontend-lint] $failures issue(s), advisory mode only."
    exit 0
  fi
  echo "[pillars-frontend-lint] $failures issue(s)."
  exit 1
fi

echo "[pillars-frontend-lint] ok"
