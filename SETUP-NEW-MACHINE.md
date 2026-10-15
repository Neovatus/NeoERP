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
Any `application-local.properties` / `application-dev.properties` / `.env` files are **not** committed. If a service needs local overrides, recreate them on the new machine.

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

## Quick checklist for the new laptop
- [ ] Git, JDK 17, Docker Desktop
- [ ] Android SDK (Android Studio) — for Android target
- [ ] Xcode — for iOS target (macOS)
- [ ] Node — for JS/WASM targets
- [ ] Clone `NeoERP-App`, `NeoERP-BackEnd`, **and** `KMM-Network`
- [ ] Fix `includeBuild` path in App `settings.gradle.kts`
- [ ] Create App `local.properties` with correct `sdk.dir`
- [ ] Start Docker → run backend `scripts/run-all-services.sh`
- [ ] Recreate any local service config/env files
