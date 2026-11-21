# NeoERP — Clone & Run on a New Machine

This workspace holds **two repos** plus **one external dependency**:

- `NeoERP-App` — Kotlin/Compose Multiplatform client
- `NeoERP-BackEnd` — Kotlin + Spring Boot microservices
- `KMM-Network` — **separate repo** the App pulls in via a composite build (not inside `NeoERP/`)

---

## 1. Common tools (needed by both)

| Tool | Version | Notes |
|---|---|---|
| Git | any recent | clone the repos |
| JDK (Temurin/OpenJDK) | **17** | required by backend; also needed to run the App's Gradle/AGP toolchain |
| Gradle | none to install | use the bundled `./gradlew` wrapper (8.14 backend / 8.14.3 app) |

Set `JAVA_HOME` to a JDK 17 install and confirm `java -version` reports 17.

---

## 2. Backend — `NeoERP-BackEnd`

### Required tools
| Tool | Version | Why |
|---|---|---|
| JDK | 17 | all services (`languageVersion 17`) |
| Docker + Docker Compose | recent | runs PostgreSQL + Keycloak from `infra/compose.yml` |
| bash, curl | — | used by `scripts/run-all-services.sh` for startup/health checks |

### Stack (fetched automatically by Gradle)
- Kotlin 2.2.21, Spring Boot **4.0.2**, Spring Dependency Management 1.1.7
- Flyway (Postgres), Spring Data JPA, Spring Security + OAuth2 resource server, Spring WebMVC
- Testcontainers 1.21.3 (tests spin up Postgres in Docker)

### Infrastructure containers
- **PostgreSQL 15** on `5432` (user/pass `neoerp`/`neoerp`) — 8 databases auto-created by `infra/postgres/initdb/01-create-dbs.sh`
- **Keycloak 25.0** on `8082`, realm auto-imported from `infra/keycloak/import/neoerp-realm.json`

### Services & ports
Gateway 8080 · Org 8081 · Keycloak 8082 · Auth 8083 · User/IAM 8084 · HR 8085 · Payroll 8086 · Audit 8087 · Accounts 8088

### Steps
```bash
cd NeoERP-BackEnd
# Docker must be running first
GRADLE_USER_HOME=/tmp/gradle-home ./scripts/run-all-services.sh   # starts infra + all services
bash scripts/bootstrap-local-company.sh                            # seed local company (optional)
```
Verify: `./gradlew test`

### Config to recreate (gitignored)
The local `.env` files and `.local-secrets/` are committed (private repo, local stack only, see the end of this file).

---

## 3. App (KMM) — `NeoERP-App`

### Required tools
| Tool | Version | Why |
|---|---|---|
| JDK | 17 | to run Gradle 8.14.3 + AGP 8.8.2 (bytecode target is JVM 11) |
| Android SDK | compileSdk **36**, minSdk 24 | Android target — install via Android Studio |
| Xcode | recent | **iOS target only** (macOS) |
| Node | recent | JS/WASM browser targets |

### Stack (fetched by Gradle)
- Kotlin 2.2.21, Android Gradle Plugin 8.8.2, Compose Multiplatform, Koin (DI), Ktor
- foojay-resolver 1.0.0 (auto-provisions JDK toolchains)

### ⚠️ Critical: external composite build `KMM-Network`
`NeoERP-App/settings.gradle.kts` contains a **hardcoded absolute path**:
```kotlin
includeBuild("/Users/jabransiddiqui/Offices/Neovatus/KMM-Module/KMM-Network")
```
This supplies the `dev.kmmkit:core-network-api / -ktor / -auth-refresh:0.1.0` artifacts.
On the new machine you must:
1. Clone the **KMM-Network** repo separately.
2. Update the `includeBuild(...)` path in `settings.gradle.kts` to match the new location (or replicate the same `.../Neovatus/KMM-Module/KMM-Network` folder layout).

Without this, the App will not resolve its network dependencies.

### Config to recreate (gitignored)
- `local.properties` — must be regenerated with the new machine's `sdk.dir` (Android SDK path). The committed one points at `/Users/jabransiddiqui/Library/Android/sdk`.

### Steps
```bash
cd NeoERP-App
# fix the includeBuild path in settings.gradle.kts first
# create local.properties with: sdk.dir=/path/to/Android/sdk

./gradlew :composeApp:jvmTest --no-daemon          # test
./gradlew :composeApp:run --no-daemon              # Desktop
./gradlew :composeApp:wasmJsBrowserDevelopmentRun  # WASM browser
```
The App expects the backend gateway at `http://localhost:8080` — start the backend first for live flows.
For iOS: open `iosApp` in Xcode after building the shared framework.

---

## Quick checklist for the new laptop (checked against the working Mac, 2026-11-20)

Tools (Homebrew for most):
- [ ] Homebrew, Git, GitHub CLI `gh` (signed in: `gh auth login`), Python 3, Node (JS/WASM targets)
- [ ] JDK **21** to run Gradle (the lead uses JetBrains Runtime 21: `~/Library/Java/JavaVirtualMachines/jbr-21.0.7`) **and** JDK **17** for the backend toolchain (`JavaLanguageVersion.of(17)`; Temurin 17, or let foojay provision it)
- [ ] Docker Desktop (Postgres 15, Keycloak 25, Mailpit, SeaweedFS containers from `infra/compose.yml`)
- [ ] Xcode 26.5 or newer (builds iOS, Liquid Glass included); Xcode 27 with iOS 27.2 simulators only on the Mac that runs iOS QA, so results match earlier rounds (iPhone SE, iPhone 18 Pro, iPad mini, iPad Pro 13)
- [ ] Android Studio (Android SDK, compileSdk 36) and IntelliJ IDEA if wanted
- [ ] Claude Code (desktop app) and Codex CLI if Codex lanes are used

Code (same paths as the old Mac keep every script and the lead memory working):
- [ ] `~/Offices/Neovatus/NeoERP` (workspace), then inside it `NeoERP-App` and `NeoERP-BackEnd`
- [ ] `~/Offices/Neovatus/KMM-Module` (github.com/Neovatus/KMM-Module) — the App finds `KMM-Module/KMM-Network` there by default; elsewhere set `neoerp.kmmNetworkPath` or `NEOERP_KMM_NETWORK_PATH`
- [ ] App `local.properties` with `sdk.dir` of the new Android SDK

First run:
- [ ] Start Docker, then `cd NeoERP-BackEnd && NEOERP_CONFIRM_RESET=yes scripts/reset-local-dev.sh` (stack + seed); dev secrets come with the clone
- [ ] Services: `scripts/run-all-services.sh`
- [ ] Accounts demo data (the reset leaves it out on purpose): in one shell in `NeoERP-BackEnd`, `scripts/make-demo-tokens.sh < /dev/null && source /private/tmp/neoerp-demo-tokens.env && export NEOERP_LOCAL_DEMO=1`, then `scripts/seed-demo-accounts.sh` → `scripts/seed-demo-phase3.sh` → `scripts/seed-demo-a4.sh` (see `NeoERP-BackEnd/docs/local-demo-data.md`); then `scripts/money-invariants.sh` passes with more than 0 posted journals. Never open the password or token files.
- [ ] Lead memory: `scripts/sync-lead-memory.sh restore` in the workspace
- [ ] Gradle: always through the lock, see WORKFLOW.md (`lockf -k /private/tmp/neoerp-gradle.lock ./gradlew …`, `GRADLE_USER_HOME=/tmp/gradle-home`)

## Lead memory (2026-11-20)

Claude's lead memory lives outside the repos (`~/.claude/projects/<workspace path>/memory`). A copy is kept in `docs/lead-memory/` (Jabran approved keeping it on GitHub, 2026-11-20); the lead refreshes it with `scripts/sync-lead-memory.sh backup` at the end of each batch. On a new machine, after cloning the workspace to the same path, run `scripts/sync-lead-memory.sh restore`.

## Local dev secrets (2026-11-20)

`NeoERP-BackEnd/.env`, `infra/.env` and `.local-secrets/` (demo passwords, bank-number keys) are committed in the private BackEnd repo for the local stack only, so a fresh clone has them. They must never be used on a hosted stack (go-live gate ERP-Q5).

Each service's `services/<service>/src/main/resources/application-local.properties` (local database login and other local Spring settings, all 8 services) also comes with the clone (BackEnd 8bc622a), even though `.gitignore` lists the pattern. Without them every service except the gateway stops at startup with "SCRAM-based authentication, but no password was provided". All of these are on `phase/4`, not `main`: switch the fresh clone to `phase/4`. `scripts/check-new-machine.sh` checks for them.

git does not keep file permissions, so a fresh clone leaves `.local-secrets/*` readable by others, and accounts-service then refuses to start. Run `chmod 700 NeoERP-BackEnd/.local-secrets && chmod 600 NeoERP-BackEnd/.local-secrets/*` once; the check script flags it.

First build on a new Mac: compile once before starting the services (`./gradlew classes`), and give the Kotlin compiler room in `/tmp/gradle-home/gradle.properties` (`kotlin.daemon.jvmargs=-Xmx3g`, `org.gradle.jvmargs=-Xmx2g`). Without it, the eight parallel cold builds of `run-all-services.sh` run out of memory ("GC overhead limit exceeded") on a 16 GB Mac. `/tmp` is cleared on reboot, so recreate the file after a restart.

## Let Claude set up the new Mac

Clone the workspace, open it in Claude Code and say: "Read `docs/prompts/setup-new-mac.md` and do what it says." To continue the project there afterwards: "Read `docs/prompts/resume-lead.md` and do what it says." See [docs/prompts/](docs/prompts/README.md).
