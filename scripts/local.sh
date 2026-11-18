#!/usr/bin/env bash
# Run the portfolio on this machine.
#
#   ./scripts/local.sh            dev server with hot reload   → http://localhost:3000
#   ./scripts/local.sh prod       production build, then serve → http://localhost:3000
#   ./scripts/local.sh check      lint + typecheck + tests + build (what CI should run)
#   ./scripts/local.sh dev 4000   any mode, custom port
#
# Needs Node.js 20.9 or newer. Installs dependencies on first run.

set -euo pipefail
cd "$(dirname "$0")/.."

MODE="${1:-dev}"
PORT="${2:-3000}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "Node.js is not installed (need 20.9+). On Kali: sudo apt install nodejs npm, or use nvm."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
NODE_MINOR="$(node -p 'process.versions.node.split(".")[1]')"
if [ "$NODE_MAJOR" -lt 20 ] || { [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 9 ]; }; then
  fail "Node.js $(node -v) is too old — Next.js 16 needs 20.9 or newer."
fi

if [ ! -d node_modules ]; then
  bold "→ Installing dependencies (first run)…"
  npm ci
fi

case "$MODE" in
  dev)
    bold "→ Dev server on http://localhost:$PORT  (Ctrl+C to stop)"
    npx next dev -p "$PORT"
    ;;
  prod)
    bold "→ Production build…"
    npm run build
    bold "→ Serving the build on http://localhost:$PORT  (Ctrl+C to stop)"
    npx next start -p "$PORT"
    ;;
  check)
    bold "→ Lint";      npm run lint
    bold "→ Typecheck"; npx tsc --noEmit
    bold "→ Tests";     npm test
    bold "→ Build";     npm run build
    bold "✓ All checks passed"
    ;;
  *)
    fail "Unknown mode '$MODE' — use dev, prod or check."
    ;;
esac
