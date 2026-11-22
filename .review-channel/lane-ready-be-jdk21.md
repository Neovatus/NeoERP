# Lane ready: BE-JDK21 (BackEnd Java 17 → 21) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-be-jdk21` (pushed, head `7483babb`, 4 commits on TEST-SPEED-1 head
`2825c64d`, which carries BE-RUN-1 and BE-DOCS-1). Built on the **builder Mac** (WORKFLOW "Builder Mac and test Mac"):
compile and targeted tests only. **No full-run result here: the old (test) Mac runs the reviews, `verify.sh` and the
jar-mode start.** Rebase onto TEST-SPEED-1's review fixes when they are pushed (the new-Mac lead does it).
**Brief:** `docs/agents/be-jdk21/brief.md`. Approved: Jabran 2026-11-21 ("ok go ahead with java 21 after merge";
"Yes, start it then"). **Builder:** Opus 5.5 high. Report: `docs/agents/be-jdk21/builder-report.md`.
**Range:** build files of every module, `.github/workflows/services-test.yml` (JDK lines only, Actions stay off), a new
root `gradle.properties`, `scripts/run-all-services.sh`, org-service main code (`CountryCodes.kt`, new
`IsoCountryNames.kt`): expect RISK. **Reviews (old Mac):** Opus fresh + a second, different reviewer (Sonnet, diff +
brief only), per the brief (locale output can reach money documents).

## What it does
- One version setting: `neoerp.java.version=21` in a new root `gradle.properties`; all 16 module toolchain lines read
  it. No `jvmTarget` lines existed; Kotlin takes bytecode 21 from the toolchain.
- Jar mode starts the services on Java 21 (`java_home -F -v 21`), warn text and comments updated.
- The 7 locale-sensitive main files checked on Temurin 17.0.21.1 vs JBR 21.0.11 (country names, months, date
  patterns, number formats, language tags, currencies, time zones). **One difference: TR is "Turkey" on 17,
  "Türkiye" on 21.** `CountryCodes.kt` now reads a frozen Java 17 ISO name table (`IsoCountryNames.kt`, 249 codes), so
  output is unchanged (brief decision 4); `CountryCodesJdkTest` pins it, checks the V34 backfill's 510 rows, and fails
  on the next JDK if another name changes. The other 6 files: no change, now pinned by tests for PK, NO, SE, DK, FI, IS
  where they format for them.

## Tests on this Mac (Java 21, through the lock)
- `compileKotlin compileTestKotlin`, all modules: exit 0, no warnings.
- org-service (company, facts, entitlement): 72 tests / 9 classes, 0 failed.
- accounts-service (calendar, bank aliases, report export, opening import, recurring): 68 tests / 17 classes, 0 failed.
- Not run here: the full suite, money invariants, jar-mode start (test Mac).

## For the old Mac (test Mac)
1. Reviews (two, different).
2. `scripts/verify.sh --range <TEST-SPEED-1 merge or 2825c64d>..HEAD --reviews <f1> <f2>`; Gradle needs a JDK 21 it can
   find (no auto-download).
3. Jar-mode start: 8 healthy, `[mode] jar (services on openjdk version "21…")`.

## Docs pages
Developer: `README.md` ("Needs JDK 21", jar mode on 21), `docs/local-demo-data.md`, `docs/APPLICATION_DEVELOPMENT_GUIDE.md`
§12, `docs/api/hrms-v2-h2.md` (pack-core build row). User guide: none (nothing users see changes).

## For Jabran
1. Verdict after the old Mac's gate (lead's call: **MERGE** if the full run and both reviews pass).
2. **Türkiye:** kept unrecognised as on Java 17 (brief: no behaviour change). Recognising it is a one-line alias plus a
   test change. Lead's recommendation: add it later in a normal Accounts/Org fix lane (a country name in an import is a
   data-quality improvement, not part of a JDK move).
3. Gate follow-up (not in this lane): `docs/risk-paths.txt` does not list `gradle.properties` under "Build and CI", so a
   future change to the new file would not count as RISK. Suggested for the next gate lane (GATE-SLOW-1).
