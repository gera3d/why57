#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-41757}"
BASE_URL="http://127.0.0.1:${PORT}"
SESSION="why57-mobile-$$"
SERVER_LOG="$ROOT_DIR/output/playwright/http-server.log"

if [[ -n "${PWCLI:-}" ]]; then
  PLAYWRIGHT=("$PWCLI")
elif [[ -n "${CODEX_HOME:-}" && -x "$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh" ]]; then
  PLAYWRIGHT=("$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh")
elif command -v npx >/dev/null 2>&1; then
  PLAYWRIGHT=(npx --yes --package @playwright/cli playwright-cli)
else
  echo "Mobile smoke requires Node.js/npm (npx) or PWCLI pointing to playwright-cli." >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/output/playwright"
PORT="$PORT" node "$ROOT_DIR/qa/static-server.mjs" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

cleanup() {
  "${PLAYWRIGHT[@]}" -s="$SESSION" close >/dev/null 2>&1 || true
  kill "$SERVER_PID" >/dev/null 2>&1 || true
  wait "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in {1..40}; do
  if curl --silent --fail "$BASE_URL/" >/dev/null; then
    break
  fi
  sleep 0.1
done

if ! curl --silent --fail "$BASE_URL/" >/dev/null; then
  echo "Local server did not start; see $SERVER_LOG" >&2
  exit 1
fi

"${PLAYWRIGHT[@]}" -s="$SESSION" open "$BASE_URL/" >/dev/null
"${PLAYWRIGHT[@]}" -s="$SESSION" resize 390 844 >/dev/null
"${PLAYWRIGHT[@]}" -s="$SESSION" run-code --filename "$ROOT_DIR/qa/mobile-smoke.playwright.js"
