#!/bin/sh
# Copies the lead's Claude memory into the workspace (backup for a new machine), or back (restore).
# Usage: scripts/sync-lead-memory.sh [backup|restore]
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEM="$HOME/.claude/projects/$(printf '%s' "$ROOT" | tr '/' '-')/memory"
DST="$ROOT/docs/lead-memory"
case "${1:-backup}" in
  backup)  mkdir -p "$DST"; rsync -a --delete "$MEM"/ "$DST"/; echo "memory -> $DST";;
  restore) mkdir -p "$MEM"; rsync -a "$DST"/ "$MEM"/; echo "$DST -> memory";;
  *) echo "usage: $0 [backup|restore]"; exit 1;;
esac
