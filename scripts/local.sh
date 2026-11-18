#!/usr/bin/env sh
# Thin wrapper kept for Linux/macOS habits — the real script is scripts/local.mjs
exec node "$(dirname "$0")/local.mjs" "$@"
