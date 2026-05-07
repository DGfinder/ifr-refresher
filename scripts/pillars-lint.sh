#!/usr/bin/env bash
#
# pillars-lint.sh — mechanical enforcement for Pillars v3.1
#
# Runs as a CI required-check on Tier 2+ repos and as a pre-merge check locally.
# Exits non-zero on hard violations. Tier-specific checks only fire when the
# project's tier is declared (in .pillars-lint.yml, AGENTS.md, CLAUDE.md, or via flag).
#
# Usage:
#   pillars-lint.sh                                    # auto-detect
#   pillars-lint.sh --tier 3                           # explicit tier
#   pillars-lint.sh --base origin/main --head HEAD     # explicit diff range
#   pillars-lint.sh --json                             # JSON output for CI
#   pillars-lint.sh --no-fail                          # report but don't exit non-zero
#
# Configuration:
#   .pillars-lint.yml at repo root may override defaults:
#     tier: 3
#     sensitive_paths:
#       - "src/auth/**"
#       - "prisma/migrations/**"
#       - "src/billing/**"
#     diff_limits:
#       default: { files: 8, lines: 400 }
#       sensitive: { files: 4, lines: 200 }
#     skip_checks: []   # check IDs to skip with justification

set -euo pipefail

# ---------- Config defaults ----------
TIER=""
BASE_REF=""
HEAD_REF="HEAD"
OUTPUT_FORMAT="text"
NO_FAIL=0
EXIT_CODE=0

DEFAULT_FILE_LIMIT=8
DEFAULT_LINE_LIMIT=400
SENSITIVE_FILE_LIMIT=4
SENSITIVE_LINE_LIMIT=200

# Default sensitive path patterns (overridden by .pillars-lint.yml)
DEFAULT_SENSITIVE_PATTERNS=(
  "auth/"
  "permissions/"
  "permission-check"
  "permission_check"
  "billing/"
  "payment/"
  "migrations/"
  "db/migrate/"
  "alembic/versions/"
  "prisma/migrations/"
  ".env"
  "secret"
  "stripe"
  "webhook"
)

# Forbidden tokens that should not appear in *added* lines
FORBIDDEN_TEST_TOKENS=(
  ".skip("
  ".only("
  "xit("
  "xdescribe("
  "test.skip"
  "describe.skip"
  "@pytest.mark.skip"
  "@unittest.skip"
  "TODO_REMOVE_BEFORE_MERGE"
)

declare -a FINDINGS_HARD=()    # Hard violations (exit non-zero)
declare -a FINDINGS_SOFT=()    # Warnings (informational)
declare -a FINDINGS_INFO=()    # Notices (passing checks worth surfacing)

# ---------- Argument parsing ----------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tier) TIER="$2"; shift 2 ;;
    --base) BASE_REF="$2"; shift 2 ;;
    --head) HEAD_REF="$2"; shift 2 ;;
    --json) OUTPUT_FORMAT="json"; shift ;;
    --no-fail) NO_FAIL=1; shift ;;
    -h|--help)
      sed -n '3,20p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

# ---------- Helpers ----------
log_hard() { FINDINGS_HARD+=("$1"); EXIT_CODE=1; }
log_soft() { FINDINGS_SOFT+=("$1"); }
log_info() { FINDINGS_INFO+=("$1"); }

# Determine base ref if not given
if [[ -z "$BASE_REF" ]]; then
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    BASE_REF="origin/main"
  elif git rev-parse --verify origin/master >/dev/null 2>&1; then
    BASE_REF="origin/master"
  elif git rev-parse --verify main >/dev/null 2>&1; then
    BASE_REF="main"
  else
    echo "Cannot determine base ref. Pass --base." >&2
    exit 2
  fi
fi

# Determine tier if not given
if [[ -z "$TIER" ]]; then
  if [[ -f .pillars-lint.yml ]]; then
    TIER=$(grep -E '^tier:' .pillars-lint.yml | awk '{print $2}' || true)
  fi
  if [[ -z "$TIER" ]]; then
    for context_file in AGENTS.md CLAUDE.md .agents.md .claude.md; do
      if [[ -f "$context_file" ]]; then
        TIER=$(grep -iE '^tier:|^- tier:|project tier:' "$context_file" | head -1 | grep -oE '[0-4]' | head -1 || true)
        [[ -n "$TIER" ]] && break
      fi
    done
  fi
fi
TIER="${TIER:-2}"  # Default to Tier 2 if undeterminable

# ---------- Diff range ----------
DIFF_FILES=$(git diff --name-only "${BASE_REF}...${HEAD_REF}" 2>/dev/null || true)
DIFF_FILE_COUNT=$(echo "$DIFF_FILES" | grep -c -v '^$' || true)
DIFF_STAT=$(git diff --shortstat "${BASE_REF}...${HEAD_REF}" 2>/dev/null || true)
DIFF_INSERTIONS=$(echo "$DIFF_STAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
DIFF_DELETIONS=$(echo "$DIFF_STAT" | grep -oE '[0-9]+ deletion'  | grep -oE '[0-9]+' || echo 0)
DIFF_TOTAL_LINES=$((DIFF_INSERTIONS + DIFF_DELETIONS))

# Detect sensitive paths in diff
SENSITIVE_HIT=0
for pattern in "${DEFAULT_SENSITIVE_PATTERNS[@]}"; do
  if echo "$DIFF_FILES" | grep -qiE "$pattern"; then
    SENSITIVE_HIT=1
    break
  fi
done

# ---------- Check 1: Diff size limits (Pillars §3.2) ----------
if [[ $SENSITIVE_HIT -eq 1 ]]; then
  FILE_LIMIT=$SENSITIVE_FILE_LIMIT
  LINE_LIMIT=$SENSITIVE_LINE_LIMIT
  LIMIT_REASON="sensitive path detected in diff"
else
  FILE_LIMIT=$DEFAULT_FILE_LIMIT
  LINE_LIMIT=$DEFAULT_LINE_LIMIT
  LIMIT_REASON="default"
fi

if [[ $DIFF_FILE_COUNT -gt $FILE_LIMIT ]]; then
  log_hard "DIFF_FILES_LIMIT [§3.2]: diff touches $DIFF_FILE_COUNT files; limit is $FILE_LIMIT ($LIMIT_REASON)."
fi

if [[ $DIFF_TOTAL_LINES -gt $LINE_LIMIT ]]; then
  log_hard "DIFF_LINES_LIMIT [§3.2]: diff is $DIFF_TOTAL_LINES lines (+$DIFF_INSERTIONS / -$DIFF_DELETIONS); limit is $LINE_LIMIT ($LIMIT_REASON)."
fi

# ---------- Check 2: Forbidden test tokens added (Pillars §3.3) ----------
ADDED_LINES=$(git diff "${BASE_REF}...${HEAD_REF}" -- '*.test.*' '*.spec.*' '*_test.*' '*_spec.*' 'tests/' 'test/' 2>/dev/null \
  | grep '^+' | grep -v '^+++' || true)

for token in "${FORBIDDEN_TEST_TOKENS[@]}"; do
  if echo "$ADDED_LINES" | grep -qF "$token"; then
    log_hard "TEST_INTEGRITY [§3.3]: forbidden token added in test file: '$token'. Skipping/disabling tests requires explicit authorisation."
  fi
done

# ---------- Check 3: Tests deleted without justification (Pillars §3.3) ----------
DELETED_TEST_FILES=$(git diff --name-only --diff-filter=D "${BASE_REF}...${HEAD_REF}" 2>/dev/null \
  | grep -E '\.(test|spec)\.|_(test|spec)\.|^tests?/' || true)

if [[ -n "$DELETED_TEST_FILES" ]]; then
  TEST_DELETION_REASON=$(git log "${BASE_REF}...${HEAD_REF}" --format=%B 2>/dev/null | grep -iE 'test.deletion.justified|tests-removed:|deprecated test' || true)
  if [[ -z "$TEST_DELETION_REASON" ]]; then
    log_hard "TEST_DELETION [§3.3]: test files deleted without justification in commit message:
$DELETED_TEST_FILES
Add a 'tests-removed: <reason>' line to the commit message or restore the tests."
  fi
fi

# ---------- Check 4: Lockfile change without dep file change (Pillars §3.2) ----------
LOCKFILE_PATTERNS="package-lock.json|yarn.lock|pnpm-lock.yaml|poetry.lock|Pipfile.lock|Cargo.lock|go.sum|composer.lock"
DEPFILE_PATTERNS="package.json|pyproject.toml|requirements.*\\.txt|Pipfile|Cargo.toml|go.mod|composer.json"

LOCKFILE_CHANGED=$(echo "$DIFF_FILES" | grep -E "($LOCKFILE_PATTERNS)$" || true)
DEPFILE_CHANGED=$(echo "$DIFF_FILES"  | grep -E "($DEPFILE_PATTERNS)$"  || true)

if [[ -n "$LOCKFILE_CHANGED" ]] && [[ -z "$DEPFILE_CHANGED" ]]; then
  log_soft "LOCKFILE_DRIFT [§3.2]: lockfile(s) changed without corresponding dependency manifest change:
$LOCKFILE_CHANGED
This is sometimes legitimate (transitive update, lockfile regeneration) but should be explicit."
fi

# ---------- Check 5: TODO/FIXME without owner (Pillars §26.9) ----------
NEW_TODOS=$(git diff "${BASE_REF}...${HEAD_REF}" 2>/dev/null \
  | grep '^+' | grep -v '^+++' \
  | grep -E '(TODO|FIXME|XXX|HACK)' \
  | grep -vE '\((@?[a-zA-Z][a-zA-Z0-9_-]+|#[0-9]+)\)' || true)

if [[ -n "$NEW_TODOS" ]]; then
  TODO_COUNT=$(echo "$NEW_TODOS" | wc -l)
  log_soft "TODO_WITHOUT_OWNER [§26.9]: $TODO_COUNT new TODO/FIXME comment(s) added without an owner/issue reference. Add (@username) or (#issue-number)."
fi

# ---------- Check 6: Sensitive path co-modification with feature work ----------
if [[ $SENSITIVE_HIT -eq 1 ]]; then
  NON_SENSITIVE_FILES=$(echo "$DIFF_FILES" | grep -vE "$(IFS='|'; echo "${DEFAULT_SENSITIVE_PATTERNS[*]}")" || true)
  if [[ -n "$NON_SENSITIVE_FILES" ]]; then
    NON_SENSITIVE_COUNT=$(echo "$NON_SENSITIVE_FILES" | grep -c -v '^$' || true)
    if [[ $NON_SENSITIVE_COUNT -gt 2 ]]; then
      log_hard "MIXED_CONCERNS [§3.2, §15.3]: diff touches sensitive paths AND $NON_SENSITIVE_COUNT non-sensitive files. Sensitive changes should be isolated. Split this PR."
    fi
  fi
fi

# ---------- Check 7: Coverage config changed (manual threshold review) ----------
COVERAGE_FILES_CHANGED=$(echo "$DIFF_FILES" | grep -E '(jest\.config|vitest\.config|pyproject\.toml|setup\.cfg|\.coveragerc|nyc\.config|coverage\.config)' || true)
if [[ -n "$COVERAGE_FILES_CHANGED" ]]; then
  for file in $COVERAGE_FILES_CHANGED; do
    OLD_THRESHOLDS=$(git show "${BASE_REF}:${file}" 2>/dev/null | grep -oE 'threshold|coverage' | head -5 || true)
    NEW_THRESHOLDS=$(git show "${HEAD_REF}:${file}" 2>/dev/null | grep -oE 'threshold|coverage' | head -5 || true)
    if [[ "$OLD_THRESHOLDS" != "$NEW_THRESHOLDS" ]]; then
      log_soft "COVERAGE_CONFIG_CHANGED [§3.3]: $file modified. Manually confirm coverage thresholds were not lowered without authorisation."
    fi
  done
fi

# ---------- Check 8: Migration files require migration tag in commit ----------
MIGRATION_FILES=$(echo "$DIFF_FILES" | grep -iE '(prisma/migrations/|alembic/versions/|db/migrate/|(^|/)migrations/.*\.(sql|js|ts|py)$)' || true)
if [[ -n "$MIGRATION_FILES" ]]; then
  COMMIT_MESSAGES=$(git log "${BASE_REF}...${HEAD_REF}" --format=%B 2>/dev/null || true)
  if ! echo "$COMMIT_MESSAGES" | grep -qiE '(migration:|migration\b|schema\b)'; then
    log_hard "MIGRATION_UNTAGGED [§9.1]: migration files modified but no commit message tagged with 'migration:' or 'schema'. Migrations require explicit acknowledgement and rollback plan."
  fi
fi

# ---------- Check 9: Stale feature flags (Tier 3+, requires flag inventory) ----------
if [[ "$TIER" -ge 3 ]] && [[ -f "feature-flags.yml" || -f "config/feature-flags.yml" ]]; then
  FLAG_FILE=$(ls feature-flags.yml config/feature-flags.yml 2>/dev/null | head -1)
  STALE_FLAGS=$(grep -E 'created:.*20(2[0-4]|1[0-9])' "$FLAG_FILE" 2>/dev/null | head -5 || true)
  if [[ -n "$STALE_FLAGS" ]]; then
    log_soft "STALE_FLAGS [§26.9]: feature flags older than ~12 months found in $FLAG_FILE. Schedule retirement review."
  fi
fi

# ---------- Check 10: Tier-specific minimum bar checks ----------
case "$TIER" in
  3|4)
    [[ ! -f README.md ]] && log_hard "TIER_BAR [§1]: Tier $TIER requires README.md."
    [[ ! -d docs/runbooks ]] && [[ ! -f docs/runbook.md ]] && log_soft "TIER_BAR [§11.1]: Tier $TIER requires runbooks. Create docs/runbooks/."
    [[ ! -d docs/adr ]] && [[ ! -d docs/decisions ]] && log_soft "TIER_BAR [§5.5]: Tier $TIER requires ADR directory. Create docs/adr/ or docs/decisions/."
    if [[ ! -f .github/workflows/ci.yml ]] && [[ ! -f .gitlab-ci.yml ]] && [[ ! -f .circleci/config.yml ]]; then
      log_hard "TIER_BAR [§12.1]: Tier $TIER requires CI configuration."
    fi
    ;;
esac

case "$TIER" in
  4)
    [[ ! -f docs/threat-model.md ]] && log_hard "TIER_BAR [§8.2]: Tier 4 requires docs/threat-model.md."
    [[ ! -f docs/dr-playbook.md ]] && log_soft "TIER_BAR [§11.5]: Tier 4 requires docs/dr-playbook.md."
    ;;
esac

# ---------- Check 11: Agent context file presence (Tier 2+ repo) ----------
if [[ "$TIER" -ge 2 ]] && [[ ! -f AGENTS.md ]] && [[ ! -f CLAUDE.md ]] && [[ ! -f .agents.md ]] && [[ ! -f .claude.md ]]; then
  log_soft "AGENT_CONTEXT_MISSING [§26.2]: Tier $TIER repo without AGENTS.md, CLAUDE.md, .agents.md, .claude.md, or equivalent agent context file. Required so Hermes/Codex, Claude Code, OpenClaw, or humans load the same tier/scope rules."
fi

# ---------- Check 12: Required-evidence section in PR description ----------
# (This check requires PR template integration; skipped in pure CLI mode)

# ---------- Output ----------
emit_text() {
  echo ""
  echo "============================================================"
  echo "  Pillars v3.1 Lint — Tier $TIER"
  echo "  Diff: ${BASE_REF}...${HEAD_REF}"
  echo "  Files: $DIFF_FILE_COUNT  Lines: $DIFF_TOTAL_LINES (+$DIFF_INSERTIONS / -$DIFF_DELETIONS)"
  echo "============================================================"

  if [[ ${#FINDINGS_HARD[@]} -gt 0 ]]; then
    echo ""
    echo "❌ HARD VIOLATIONS (block merge):"
    for f in "${FINDINGS_HARD[@]}"; do
      echo "  - $f"
      echo ""
    done
  fi

  if [[ ${#FINDINGS_SOFT[@]} -gt 0 ]]; then
    echo ""
    echo "⚠️  WARNINGS (review required):"
    for f in "${FINDINGS_SOFT[@]}"; do
      echo "  - $f"
      echo ""
    done
  fi

  if [[ ${#FINDINGS_HARD[@]} -eq 0 ]] && [[ ${#FINDINGS_SOFT[@]} -eq 0 ]]; then
    echo ""
    echo "✅ No mechanical violations detected."
    echo "   This does not mean the change is good. Use the tier's PR checklist."
  fi
  echo ""
}

emit_json() {
  printf '{\n'
  printf '  "tier": %d,\n' "$TIER"
  printf '  "diff": { "files": %d, "lines": %d, "insertions": %d, "deletions": %d },\n' \
    "$DIFF_FILE_COUNT" "$DIFF_TOTAL_LINES" "$DIFF_INSERTIONS" "$DIFF_DELETIONS"
  printf '  "hard": ['
  for i in "${!FINDINGS_HARD[@]}"; do
    [[ $i -gt 0 ]] && printf ','
    printf '\n    %s' "$(jq -Rn --arg msg "${FINDINGS_HARD[$i]}" '$msg')"
  done
  printf '\n  ],\n'
  printf '  "soft": ['
  for i in "${!FINDINGS_SOFT[@]}"; do
    [[ $i -gt 0 ]] && printf ','
    printf '\n    %s' "$(jq -Rn --arg msg "${FINDINGS_SOFT[$i]}" '$msg')"
  done
  printf '\n  ],\n'
  printf '  "exit_code": %d\n' "$EXIT_CODE"
  printf '}\n'
}

case "$OUTPUT_FORMAT" in
  json) emit_json ;;
  *)    emit_text ;;
esac

if [[ $NO_FAIL -eq 1 ]]; then
  exit 0
fi

exit "$EXIT_CODE"
