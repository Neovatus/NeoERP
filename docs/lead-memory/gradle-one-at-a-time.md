---
name: gradle-one-at-a-time
description: Parallel lanes must run Gradle one at a time machine-wide (lockf), 36 GB machine fills up otherwise (Jabran 2026-11-10)
metadata:
  type: feedback
---

Parallel builder lanes (worktrees) may edit at the same time, but every Gradle command goes through one machine-wide lock: `lockf -k /private/tmp/neoerp-gradle.lock ./gradlew …`, and `./gradlew --stop` after Android/iOS compiles.

**Why:** with three lanes building at once the 36 GB Mac hit 35 GB used / 14 GB compressed (Android Studio, emulator, Figma etc. also open); Jabran worried it would crash.

**How to apply:** put the lockf rule in every lane brief and builder prompt; lane builders run no tests at all, only compile (at the end, to keep the branch building); the lead runs all tests once after merging the round (Jabran 2026-11-10) ([[targeted-test-runs]], [[builder-batching]]).

**Update (Jabran 2026-11-10, later):** even with the lock, three lanes were slow (compiles queued, memory full). Run lanes ONE AT A TIME, and builders must not spawn helper agents. Order this round: L5 → L6 → L3.
