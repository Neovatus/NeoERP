#!/bin/sh
# Inbox listener (protocol §13). Usage, from NeoERP/: docs/inbox/listen.sh <inbox-stem>
#   e.g. docs/inbox/listen.sh erp-lead     docs/inbox/listen.sh accounts-lead-backend
# Local shell only: no tokens while waiting. It exits (and so wakes its session) when the inbox
# has something new. Run it in the background and start it again as the last action of every turn.
# - One listener per inbox: a new start stops the previous one for the same inbox.
# - Catch-up: on start it wakes at once if the inbox holds a message id with no line in the done
#   file, once per set of open ids (so a message that came while the session was busy is never lost,
#   even when the done file was written after it).
# - Pause: docs/inbox/.paused-all or docs/inbox/.paused-<stem>.
# - Status: docs/inbox/listen.sh --status  lists every inbox, its listener (live or not) and pauses.
set -u
stem=${1:?usage: listen.sh <inbox-stem> | --status}
cd "$(dirname "$0")/../.." || exit 1
if [ "$stem" = "--status" ]; then
  for i in docs/inbox/*.md; do
    case "$i" in *.done.md) continue;; esac
    s=$(basename "$i" .md); p=$(cat "docs/inbox/.listen-$s.pid" 2>/dev/null)
    if [ -n "$p" ] && ps -p "$p" -o command= 2>/dev/null | grep -q "listen.sh $s"; then st="listening"; else st="NOT listening"; fi
    [ -e "docs/inbox/.paused-$s" ] && st="$st, PAUSED"
    echo "$s: $st"
  done
  [ -e docs/inbox/.paused-all ] && echo "ALL PAUSED (.paused-all)"
  exit 0
fi
f="docs/inbox/$stem.md"; d="docs/inbox/$stem.done.md"
pidf="docs/inbox/.listen-$stem.pid"; seen="docs/inbox/.listen-$stem.seen"
[ -f "$f" ] || { echo "no inbox $f"; exit 1; }

mtime() { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1"; }
paused() { [ -e docs/inbox/.paused-all ] || [ -e "docs/inbox/.paused-$stem" ]; }
mine() { [ "$(cat "$pidf" 2>/dev/null)" = "$$" ]; }

# Single instance: stop an older listener for this inbox (only if it really is a listener).
if [ -f "$pidf" ]; then
  old=$(cat "$pidf")
  if [ -n "$old" ] && [ "$old" != "$$" ] && ps -p "$old" -o command= 2>/dev/null | grep -q "listen.sh $stem"; then
    pkill -P "$old" 2>/dev/null; kill "$old" 2>/dev/null
  fi
fi
echo $$ > "$pidf"
trap 'mine && rm -f "$pidf"' EXIT
trap 'exit 0' INT TERM

# Ids in "## <date> · <ID> · From: …" headers that have no line in the done file.
open_ids() {
  grep "^## " "$f" | awk -F' · ' 'NF>2{print $2}' | while read -r id; do
    case "$id" in *[!A-Za-z0-9-]*|"") continue;; esac
    grep -qE "(^|[^A-Za-z0-9-])$id([^0-9]|$)" "$d" 2>/dev/null || echo "$id"
  done | tr '\n' ' '
}
report() {
  o=$(open_ids); echo "$1 in $f"; grep "^## " "$f" | tail -5
  [ -n "$o" ] && echo "Open (no done line): $o"
  printf '%s' "$o" > "$seen"; exit 0
}

while paused; do sleep 30; mine || exit 0; done

# Catch-up: open ids exist and this set was not reported already.
now=$(mtime "$f"); o=$(open_ids)
if [ -n "$o" ] && [ "$o" != "$(cat "$seen" 2>/dev/null)" ]; then
  report "UNHANDLED (arrived while not listening)"
fi

m0=$now
while :; do
  sleep 30
  mine || exit 0
  paused && continue
  m=$(mtime "$f"); [ "$m" = "$m0" ] && continue
  while :; do sleep 90; m2=$(mtime "$f"); [ "$m2" = "$m" ] && break; m=$m2; done   # 90 s quiet: one wake per burst
  report "NEW"
done
