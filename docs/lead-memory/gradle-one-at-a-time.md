---
name: gradle-one-at-a-time
description: "Gradle through lockf: two locks (App `neoerp-gradle-app.lock` first, then BackEnd `neoerp-gradle.lock`), one job per repo; whole-suite runs take both (trial L33, 2026-11-21)"
metadata:
  type: feedback
---

Every Gradle command through `JAVA_HOME=<JDK 21> GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew ...`; one Gradle lane at a time per machine; builders spawn no helper agents; `./gradlew --stop` after Android/iOS compiles.

**Lives in:** WORKFLOW.md:202.

**Update 2026-11-21 (Jabran, "yes we can run 2 i think?"), trial L33:** two locks, one per repo: BackEnd `/private/tmp/neoerp-gradle.lock`, App `/private/tmp/neoerp-gradle-app.lock`; at most one job per repo at once. Full verify runs take both locks (`lockf -k /private/tmp/neoerp-gradle-app.lock scripts/verify.sh …`) and run alone. OOM / Kotlin daemon crash / swapping → back to one lock.

**Old Mac trial L34 (Jabran 2026-11-22):** targeted Gradle jobs run through `scripts/gradle-job.sh <app|be> <dir> <args>`: 2 slots per repo, own lock + own GRADLE_USER_HOME per slot, Kotlin in-process, `--stop` on that home on exit and a "processes left" check. Full verify runs keep both L33 locks. New Mac stays on L33. Put this command in every builder/reviewer brief on the old Mac instead of the raw lockf line.

**GATE-2 merged 2026-11-22:** each repo's verify takes only its own lock and Gradle home; BE + App full gates run in parallel on the old Mac (13 min each vs ~21 back-to-back). Before parallel gates shut simulators and stray daemons first (swap went 18 → 28 GB with 4 simulators + jar stack + idle daemons; 6 GB after clean-up). Stop only own daemons by PID or own home, never `pkill java`.
