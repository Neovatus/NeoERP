#!/bin/sh
# Copies the lead's Claude memory into the workspace (backup for a new machine), or back (restore).
# Usage: scripts/sync-lead-memory.sh [backup|restore]
# Two Macs share docs/lead-memory: never delete, newer file wins (--update). git pull before backup, push right after.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEM="$HOME/.claude/projects/$(printf '%s' "$ROOT" | tr '/' '-')/memory"
DST="$ROOT/docs/lead-memory"
case "${1:-backup}" in
  backup)  mkdir -p "$DST"; rsync -a --update "$MEM"/ "$DST"/; echo "memory -> $DST";;
  restore) mkdir -p "$MEM"; rsync -a --update "$DST"/ "$MEM"/; echo "$DST -> memory";;
  *) echo "usage: $0 [backup|restore]"; exit 1;;
esac
