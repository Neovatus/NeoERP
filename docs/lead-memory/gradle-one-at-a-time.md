---
name: gradle-one-at-a-time
description: "Gradle through lockf: two locks (App `neoerp-gradle-app.lock` first, then BackEnd `neoerp-gradle.lock`), one job per repo; whole-suite runs take both (trial L33, 2026-11-21)"
metadata:
  type: feedback
---

Every Gradle command through `JAVA_HOME=<JDK 21> GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew ...`; one Gradle lane at a time per machine; builders spawn no helper agents; `./gradlew --stop` after Android/iOS compiles.

**Lives in:** WORKFLOW.md:202.

**Update 2026-11-21 (Jabran, "yes we can run 2 i think?"), trial L33:** two locks, one per repo: BackEnd `/private/tmp/neoerp-gradle.lock`, App `/private/tmp/neoerp-gradle-app.lock`; at most one job per repo at once. Full verify runs take both locks (`lockf -k /private/tmp/neoerp-gradle-app.lock scripts/verify.sh …`) and run alone. OOM / Kotlin daemon crash / swapping → back to one lock.
