# Lane ready: GATE-2 (BackEnd and App): own lock and Gradle home per gate, slowest classes, gate LOWs, `scripts/gw` — 2026-11-22

Two twin lanes, one design. Approved: Jabran 2026-11-22 (inbox TASK GATE-2, plus item 5b `scripts/gw`). Built and
reviewed on the **builder Mac**, with self-tests only (bash; no Gradle, no full verify). The old Mac runs both full
gates **in parallel** as the first proof.

| | BackEnd | App |
|---|---|---|
| Branch (pushed) | `phase/4-b2-gate-2-be-r` | `phase/4-b2-gate-2-app-r2` |
| Base | BE `phase/4` `64509abe` (R29b-1 merged; rebased, all 26 commits `=` in range-diff) | App `phase/4` `f7c993f4` (B2a merged; rebased twice, all 23 commits `=`, no gate-file change on the base) |
| Head | `16d9a3fe` | `8d7e8a96` (Reviewed `853c2c81`; the last commit is review files only) |
| Self-tests (`GIT_CONFIG_GLOBAL=/dev/null bash scripts/risk-check-test.sh`) | 107/107 on the rebased head (lead); Opus re-run 107/107 before the rebase | 93/93 on the `-r2` head (lead); Opus re-run 93/93 on the same commits before the rebase |
| Holes proven | 12 + 10 cases fail on the base scripts | 16 + 6 cases fail on the base scripts |
| Final review files | `docs/agents/gate-2/review-final-1-opus.md`, `review-final-2-fable.md` | the same paths |
| `risk-check.sh --reviews` (lead) | REVIEWS OK | REVIEWS OK |
| Report | `docs/agents/gate-2/builder-report.md` | the same path |

**RISK:** every changed file except the docs is a gate file. The reviews were Opus fresh plus Fable (security), each
covering both lanes and their alignment. Round 1: Opus said ACCEPT for the BackEnd and FIX for the App (M1); Fable
said ACCEPT for both (BackEnd 11 LOW, App 8 LOW). After one fix round in both lanes (D-32), both say ACCEPT for both
lanes. Lead decisions: D-31 (alignment; TERM after `--stop` accepted), D-32 (fix round, GATE-3 row).

## What changed (both lanes unless marked)
1. **Own lock:** each repo's scripts and docs take only their own lock. verify tests the lock first and prints
   `waiting for the <repo> Gradle lock (held by another run; run verify.sh without a lockf wrapper)`.
2. **Own Gradle home:** `/tmp/gradle-home-verify-be` and `/tmp/gradle-home-verify-app`, seeded once from
   `/tmp/gradle-home` `caches/modules-2`. `VERIFY_GRADLE_USER_HOME` and `VERIFY_SHARED_GRADLE_HOME` override them. At
   the end, pass or fail and under the lock, verify runs `--stop` on its own home, then sends TERM after 10 s, only to
   `java` processes naming that home. It never touches the shared home.
3. **Parallel gates docs:** the `verify.md` "Parallel gates" section.
4. **GATE-SLOW-1:** the 5 slowest test classes, printed from the JUnit XML.
5. **Gate LOWs:**
   - `.gitattributes`, `.gitmodules` and `.gitignore` under `docs/` are never light;
   - exactly one `gate=` line per marker, with clear refusal texts;
   - a not-light flag;
   - a wider D8 docs-literal scan;
   - gitlinks with `--ignore-submodules=none`;
   - quoted one-line paths.
   - (BackEnd) review-refusal paths are quoted.
   - 5b (BackEnd): `scripts/gw` runs `./gradlew` with `-Dorg.gradle.java.home` from `java_home -F -v 21` (falling back
     to `JAVA_HOME`). It never reads `gradle.properties` and refuses to run outside its repo root. It is a light dev script.

## For the old Mac (test Mac): the proof run
1. Check the four final review files.
2. Run the **two full gates at the same time** (BackEnd and App), each **without** a `lockf` wrapper. Each must take
   its own lock and its own home:
   - `cd <BE worktree> && scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/gate-2/review-final-1-opus.md docs/agents/gate-2/review-final-2-fable.md`
   - the same in the App worktree.
   A wrapper around the App gate would now make it wait for its own lock, though it says why.
3. Log memory and swap during the run. Before each clean-up, take a `pgrep -fl "<home>/"` count (D-32 item 5), to prove
   that real Gradle and Kotlin daemons carry the home on their command lines. Afterwards, no process may be left on
   either home.
4. On the first run in a new home, the Gradle distribution downloads once (network).
5. Run `scripts/gw --version` in the BackEnd: the Daemon JVM must be 21.0.9 or newer.
6. Give the verdict; merge after Jabran's MERGE.

## At merge: workspace text (the lead changes it when GATE-2 merges, D-32 item 4)
In WORKFLOW "Test scope", Builders bullet, the text from "**Two locks, one per repo …**" through "… or two full-size
runs can deadlock." becomes:
> **One lock per repo (GATE-2, Jabran 2026-11-22):** BackEnd Gradle jobs take `/private/tmp/neoerp-gradle.lock` and
> App jobs take `/private/tmp/neoerp-gradle-app.lock`. No job takes the other repo's lock, so the two repos never wait
> on each other.
>
> A full `scripts/verify.sh` takes its own repo's lock itself: **run it without a `lockf` wrapper**. It runs in its
> own Gradle home (`/tmp/gradle-home-verify-be`, `/tmp/gradle-home-verify-app`) and stops that home's daemons at the
> end. One full gate per repo at a time.
>
> - Old Mac (36 GB): a BackEnd and an App full gate may run together. Old-Mac `gradle-job.sh` slot jobs keep their slot locks.
> - New Mac (16 GB): no full gates (builder Mac rule). Targeted runs of the two repos run in parallel.
>
> Any other whole-suite or `--parallel` Gradle run takes its own repo's lock only.

Also update `docs/lead-memory/gradle-one-at-a-time.md` and the handoff.

## Docs pages
Developer:
- `docs/operations/verify.md` in both repos;
- the BackEnd `AGENTS.md` (lock line), `README.md` and dev guide (`scripts/gw`);
- the App `docs/c1-brief.md` (lock line).
User guide: none (gate scripts only).

## Follow-up: GATE-3 (proposed, JABRAN-TODO N9)
- Port the BackEnd's older rules to the App gate: a non-ASCII or control-character path is RISK; the hook re-runs
  `--reviews` with the remote's `risk-check.sh`; the stricter review-file checks.
- Retire "a `.ok` with no `gate=` counts as full".
- The clean-up LOWs: the lock dropped on TERM, a non-atomic seed, `bash -c` picking another bash, the "processes
  left" count (JVMs only in the BackEnd, every process in the App).
- A BackEnd `verify.md` sentence that an override home is never a `gradle-job` slot home.
- `java_home -F` in `verify.sh` and the workspace `gradle-job.sh`.

## Timeline (new Mac; Europe/Oslo; agent time from task notifications)
- Assigned: inbox TASK GATE-2, 2026-11-22 (5b added the same day).
- App lane: build 30 m → alignment with the BackEnd (D-31) 21 m → fix round (D-32) 16.5 m.
- BackEnd lane: build 31.5 m (waited for the R29b-1 fix round to free the BackEnd slot) → fix round 20 m → alignment
  fix about 2 m → rebase onto 64509abe (lead, after Fable caught the base move).
- Reviews (each covers both lanes): Opus 14.3 m (self-tests run) and Fable 17.1 m. Fix checks: Opus about 8 m, Fable
  about 3 m. Re-stamps after the rebases: about 1 m each.
- Tokens per agent: App builder 399 k, BackEnd builder about 346 k, Opus 273 k, Fable 377 k.
- Gradle runs: none (bash self-tests only).
- Waiting: the BackEnd lane waited for a free builder slot (R29b-1 priority); the App lane's reviews waited for the
  BackEnd twin (one joint review).
