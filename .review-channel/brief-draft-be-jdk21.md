# BE-JDK21: move the BackEnd from Java 17 to Java 21 — brief

Approved: Jabran 2026-11-21 ("ok go ahead with java 21 after merge"). **Worktree:**
`/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/be-jdk21`, branch `phase/4-b2-be-jdk21` (from the TEST-SPEED-1 head
when its builder is done, which carries BE-RUN-1 and BE-DOCS-1; Jabran 2026-11-21: start while TEST-SPEED-1 is in review; the
lead rebases this lane onto TEST-SPEED-1's review fixes and its merge). Builder: Opus 5.5, high effort. Reviews: one fresh Opus, plus a second, different reviewer (Sonnet,
diff + brief only), because locale-sensitive output (formats, exports) can touch money documents.

## Why
Java 17's free updates end before or soon after the 2027 launch; Java 21 is the current long-term version supported by
Spring Boot 4.0.2, Kotlin 2.2.21 and Gradle 8.14 (Gradle already runs on 21 here). Moving now costs least: no customers,
no production images. Java 25 is out of scope (Kotlin 2.2 cannot target it fully; later, with a Kotlin upgrade).

## Decided (do not reopen)
1. Toolchain and bytecode target **21** for every BackEnd module (8 services, 7 shared modules, `:architecture-tests`).
2. **One place** for the version: a single root setting (e.g. in the root `build.gradle.kts` `subprojects {}` block or a
   `gradle.properties` key read by every module), and the 16 per-module `JavaLanguageVersion.of(17)` lines use it.
   Keep it plain Gradle Kotlin DSL; no new plugin.
3. Jar mode in `scripts/run-all-services.sh` starts the services on Java 21 (`java_home -F -v 21`), with its comments,
   the `[warn]` text and the docs updated to match.
4. No behaviour change is wanted. Where Java 21 changes an output (country names, number or date formats from CLDR
   data), the code is made explicit so the output stays as it was on 17, unless the 21 output is what RULES.md or the
   specs require; each such case is listed in the report with before/after.
5. Not in scope: enabling virtual threads (a later ADR-level decision), the App (KMP) repo, any GitHub workflow
   being turned on.

## What to do
1. Version change as in 2–3 above. `.github/workflows/services-test.yml`: change only the JDK version lines to 21
   (the workflow stays off; do not add or enable workflows).
2. Check the **7 main-code files** that use locale-sensitive APIs (`git grep -l -E "Locale\.|getDisplayCountry|DecimalFormat|NumberFormat|DateTimeFormatter\.ofLocalized" -- ':(glob)services/*/src/main/**' ':(glob)shared/*/src/main/**'`):
   for each, say whether 17 → 21 can change its output (CLDR 39 → 42-ish data: country display names, grouping
   separators such as the Norwegian/Swedish non-breaking space, month and day names) and add or adjust a test that pins
   the expected output for PK, NO, SE, DK, FI, IS where the file formats for them.
3. Docs: README, `docs/local-demo-data.md`, `docs/APPLICATION_DEVELOPMENT_GUIDE.md` and any other page that says
   Java 17 (`git grep -n -i -E "java 17|jdk 17|temurin.?17"`); `docs/operations/hosting-and-go-live-requirements.md`
   if it names a runtime. User guide: none.
4. **Tests:** targeted runs only, through the lock:
   `JAVA_HOME=$(/usr/libexec/java_home -v 21) GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew <tasks>`.
   First `./gradlew compileKotlin compileTestKotlin` for all modules, then the tests of the modules whose locale files
   or tests changed. The lead runs the full `scripts/verify.sh` once. Never `./gradlew --stop`; after your last Gradle
   run, stop only the daemons you started, by PID.

## Rules
- At most ONE background watcher per Gradle run; never a new "wait for …" task for a run you already watch.
- Gradle locks: targeted runs on the BackEnd lock; whole-suite or `--parallel` runs take both, App lock first (`lockf -k /private/tmp/neoerp-gradle-app.lock lockf -k /private/tmp/neoerp-gradle.lock …`).
- Never open, print or copy `.env`, `.local-secrets/*`, token, session, password or key files.
- Do not start the backend. No new Flyway migration; never edit an applied one.
- Commit on the branch with plain messages (`build(jdk): …`, `test(locale): …`, `docs(jdk): …`). No AI attribution, no
  Co-Authored-By. No push, no merge.

## Report: `docs/agents/be-jdk21/builder-report.md`
Files changed; where the single version setting lives; the 7 locale files with a verdict each (no change / pinned by a
test / code made explicit) and before/after for any output that differed; targeted test results (tests / failed);
docs pages changed or "none: reason"; anything open.

## Lead after the build
Two reviews, `scripts/verify.sh --range <base>..HEAD --reviews <f1> <f2>` (full suite + money invariants), then a jar-mode
start on Java 21 (8 healthy, `[mode] jar (services on openjdk version "21…")`), lane-ready, Jabran's verdict.
