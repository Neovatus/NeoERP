#!/bin/sh
# Stop hook (workspace .claude/settings.json): reminds a Claude session to restart its inbox listener
# (protocol §13). Only for sessions that started listen.sh before; silent otherwise. Reminds once per stop.
cd "$(dirname "$0")/../.." || exit 0
input=$(cat)
case "$input" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0;; esac
c=$PPID
while [ -n "$c" ] && [ "$c" -gt 1 ]; do
  [ "$(basename "$(ps -o comm= -p "$c" 2>/dev/null)")" = claude ] && break
  c=$(ps -o ppid= -p "$c" 2>/dev/null | tr -d ' ')
done
[ -n "$c" ] && [ -f "docs/inbox/.listen-owner-$c" ] || exit 0
stem=$(cat "docs/inbox/.listen-owner-$c")
[ -e docs/inbox/.paused-all ] || [ -e "docs/inbox/.paused-$stem" ] && exit 0
p=$(cat "docs/inbox/.listen-$stem.pid" 2>/dev/null)
[ -n "$p" ] && ps -p "$p" -o command= 2>/dev/null | grep -q "listen.sh $stem" && exit 0
echo "Your inbox listener ($stem) is not running. Start it in the background as your last action: $(pwd)/docs/inbox/listen.sh $stem" >&2
exit 2
