---
name: gradle-one-at-a-time
description: "Every Gradle command through `JAVA_HOME=<JDK 21> GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew ...`"
metadata:
  type: feedback
---

Every Gradle command through `JAVA_HOME=<JDK 21> GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew ...`; one Gradle lane at a time per machine; builders spawn no helper agents; `./gradlew --stop` after Android/iOS compiles.

**Lives in:** WORKFLOW.md:202.
