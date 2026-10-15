#!/bin/sh
# Inbox listener (protocol §13). Usage, from NeoERP/: docs/inbox/listen.sh <inbox-stem>
#   e.g. docs/inbox/listen.sh erp-lead     docs/inbox/listen.sh accounts-lead-backend
# Local shell only: no tokens while waiting. It exits (and so wakes its session) when the inbox
# has something new. Run it in the background and start it again as the last action of every turn.
# - One listener per inbox: a new start stops the previous one for the same inbox.
# - Catch-up: if the inbox changed after its done file (messages that came while nobody listened),
#   it wakes at once, but only once per inbox version.
# - Pause: docs/inbox/.paused-all or docs/inbox/.paused-<stem>.
set -u
stem=${1:?usage: listen.sh <inbox-stem>}
cd "$(dirname "$0")/../.." || exit 1
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

report() { echo "$1 in $f"; grep "^## " "$f" | tail -5; mtime "$f" > "$seen"; exit 0; }

while paused; do sleep 30; mine || exit 0; done

# Catch-up: inbox newer than the done file, and not already reported for this version.
now=$(mtime "$f")
if [ -f "$d" ] && [ "$now" -gt "$(mtime "$d")" ] && [ "$now" != "$(cat "$seen" 2>/dev/null)" ]; then
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
