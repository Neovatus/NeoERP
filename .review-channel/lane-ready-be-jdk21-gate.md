# Gate result: BE-JDK21 (BackEnd Java 17 → 21) — 2026-11-22 (old Mac)

Adds the gate to the new Mac's `lane-ready-be-jdk21.md`.
**Branch:** BackEnd `phase/4-b2-be-jdk21-r2`, head `6c31dfbb` (pushed), on BE `phase/4` `50ac03dc` (fast-forward possible).
**Reviews (two different reviewers):** Opus `review-1-opus.md` FIX (1 MEDIUM: no Java 21 update floor, time-zone/currency data differ by update; 5 LOW) → fix round (old Mac, Opus) → `review-3-opus.md` ACCEPT; Sonnet `review-2-sonnet.md` ACCEPT (round 1 and the fix round, locale/money output focus). Both final files written by the reviewers in the gate format (`Range: 50ac03dc..edefd97`); rebases checked by `git range-diff` (all commits `=`).
**Fix round:** minimum Java 21.0.9 (`neoerp.java.minimum`, `checkJavaRuntime` before every test/run/jar task; fails on JBR 21.0.7 and Oracle 21.0.1, passes on Temurin 21.0.13); override guard (`-P`/env cannot switch the version); `JdkDataTest` (Temurin 17.0.17 zone list, ZWG/XCG, first-market currency digits; fails on the old JDKs); exact TR rename assert; country-table files in the risk paths; go-live row P-27 (production JDK and tzdata kept current); docs. This Mac's Java 21 is now Temurin 21.0.13.
**Full gate (old Mac, Java 21):** `verify: OK`, marker `build/verify/6c31dfbb….ok`; **10 min**; 4332 tests (+12), 0 failed, 59 skipped; money invariants OK; reviews OK.
**Jar-mode start on 21:** 8 services healthy, `[mode] jar (services on openjdk version "21.0.13.1")`, gateway 401 without a token, 3.1 GB RSS for the 8 service JVMs.
**After the merge:** every developer needs a Java 21 at 21.0.9 or newer as the JVM that runs Gradle (`java_home -v 21`). A user-level `~/.gradle/gradle.properties` that pins `org.gradle.java.home` to an older 21 makes a plain `./gradlew` or the IDE stop at the floor (scripts using their own Gradle home are fine).
**Docs pages:** README, `docs/APPLICATION_DEVELOPMENT_GUIDE.md`, `docs/local-demo-data.md`, `docs/api/hrms-v2-h2.md`, go-live P-27; user guide none.
**Backlog rows (LOW):** `"%02d".format` without `Locale.ROOT` (fiscal-year code, SIE and report file names); "Türkiye" alias (product decision); `run-all-services.sh` literal 21.0.9 fallback.
