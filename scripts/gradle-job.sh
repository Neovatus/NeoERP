#!/bin/bash
# One Gradle job in its own slot, then everything it started is stopped (Jabran 2026-11-22: run several in parallel,
# make sure they leave when done). Trial on the old Mac (36 GB); the new Mac (16 GB) keeps NEOERP_GRADLE_SLOTS=1.
#
# Usage: scripts/gradle-job.sh <app|be> <checkout-or-worktree> <gradle tasks and args...>
#   e.g. scripts/gradle-job.sh app ~/Offices/Neovatus/NeoERP-worktrees/fix-app-b1 :composeApp:jvmTest --tests '*Foo*'
#
# Slot = one lock file + its own GRADLE_USER_HOME, so jobs in different slots never share a daemon, and the clean-up
# (`gradlew --stop` on that home only) cannot stop anyone else's daemon or a running backend. The Kotlin compiler runs
# in-process (no shared Kotlin daemon left behind). A new slot home starts as an APFS clone of /tmp/gradle-home's
# downloaded dependencies (copy-on-write: no extra disk until files change).
#
# Full verify.sh runs are not started through this script: they keep their own locks (WORKFLOW "Test scope").
set -u

repo="${1:-}"; dir="${2:-}"
if [[ "$repo" != "app" && "$repo" != "be" ]] || [[ ! -x "$dir/gradlew" ]] || [[ $# -lt 3 ]]; then
  echo "usage: $0 <app|be> <dir with gradlew> <gradle args...>" >&2; exit 2
fi
shift 2
slots="${NEOERP_GRADLE_SLOTS:-2}"
lock_dir=/private/tmp
self="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"

if [[ "${NEOERP_GRADLE_SLOT:-}" == "" ]]; then
  # Take the first free slot; if all are busy, wait for slot 1.
  for i in $(seq 1 "$slots"); do
    NEOERP_GRADLE_SLOT="$i" lockf -t 0 -k "$lock_dir/neoerp-gradle-$repo-slot$i.lock" "$self" "$repo" "$dir" "$@"
    rc=$?
    [[ $rc -ne 75 ]] && exit $rc   # 75 = lock busy (EX_TEMPFAIL): try the next slot
  done
  echo "[gradle-job] all $slots $repo slots busy; waiting for slot 1" >&2
  NEOERP_GRADLE_SLOT=1 exec lockf -k "$lock_dir/neoerp-gradle-$repo-slot1.lock" "$self" "$repo" "$dir" "$@"
fi

slot="$NEOERP_GRADLE_SLOT"
home="/private/tmp/gradle-home-$repo-$slot"
if [[ ! -d "$home/caches/modules-2" && -d /tmp/gradle-home/caches/modules-2 ]]; then
  mkdir -p "$home/caches" && cp -cR /tmp/gradle-home/caches/modules-2 "$home/caches/" 2>/dev/null || true
fi
java_home="$(/usr/libexec/java_home -v 21 2>/dev/null || echo "${JAVA_HOME:-}")"

cleanup() {
  (cd "$dir" && JAVA_HOME="$java_home" GRADLE_USER_HOME="$home" ./gradlew --stop >/dev/null 2>&1) || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do   # --stop returns before the daemon has exited
    left=$(pgrep -f "gradle-home-$repo-$slot" | wc -l | tr -d ' ')
    [[ "$left" == 0 ]] && break; sleep 1
  done
  echo "[gradle-job] $repo slot $slot: daemons stopped; processes left on this home: $left" >&2
}
trap cleanup EXIT
trap 'exit 130' INT TERM

echo "[gradle-job] $repo slot $slot, home $home, in $dir" >&2
cd "$dir" || exit 2
JAVA_HOME="$java_home" GRADLE_USER_HOME="$home" ./gradlew \
  -Dorg.gradle.jvmargs="${NEOERP_GRADLE_JVMARGS:--Xmx4096M -XX:MaxMetaspaceSize=1g}" \
  -Pkotlin.compiler.execution.strategy=in-process "$@"
