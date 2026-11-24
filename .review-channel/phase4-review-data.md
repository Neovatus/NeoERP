# Phase 4 review: the numbers (data only, for the lead's `phase4-review.md`) — 2026-11-24

Read-only collection. No keep/change/drop calls here. Every number cites its source. "n.r." = not recorded in any source.
**Source keys:** V:x = `.review-channel/lane-verdict-x.md` · R:x = `.review-channel/lane-ready-x.md` · C = `claims.md` "Merged lanes" ·
P = `phase4-plan.md` · ED = `docs/process/escaped-defects.md` · TL = `test-ledger.md` · LD = `lead-decisions.md` · RW = `docs/process/phase4-rework.md` ·
LT = `docs/process/phase4-lane-timing.md` · LTO = `docs/process/phase4-lane-timing-oldmac.md` · TA = `docs/process/phase4-timing-analysis.md` ·
IB = `docs/inbox/erp-lead.md` · HO = `handoff-overseer.md` · M:x = gate marker/log in `NeoERP-worktrees/x/build/verify/` ·
G = `git ls-tree origin/phase/4 docs/agents` review files (both repos, fetched 2026-11-24). Review counts are **files**; a seat's first
round-1 file = "first", everything after (fix checks, re-stamps, rebase checks, final gate files) = "repeat".
Gate cause codes: **C** = lane/test code · **E** = environment (load, flake, Docker, heap, usage stop, killed process) · **P** = process/format (review file format, missing gate argument, dirty tree).

## 1. Lanes merged in Phase 4 (code repos; 2026-11-21 → 2026-11-24)
| # | Lane | Repo | Tier | Review files total/first/repeat | Gate runs → failures (cause) | Merged | Src |
|---|---|---|---|---|---|---|---|
| 1 | Lane 0 BE | BE | pre-D-46, 2 seats | 7/2/5 | 3 (1 old-command trust run) → verify FAIL: 2 verify.sh defects **C** | 5e00b131 | RW B1, V:lane0-be |
| 2 | DOCS-2b | BE | docs, 1 | 2/1/1 | 1 OK | d0dd5441 | V:docs2-be, C |
| 3 | ISO-R1 | BE | 2 | 6/2/4 | 1 OK (49.7 min) | 6f5481a3 | RW B1 |
| 4 | R34-BE | BE | 2 | 9/2/7 (2 rebase) | 1 OK (40 min) | 4b924f08 | RW B1 |
| 5 | FIX-BE | BE | 2 | 11/2/9 (2 rebase + 2 rebase-fix) | 1 OK (54 min) | a50eabbb | RW B1 |
| 6 | BE-RUN-1 | BE | 1 | 1 file + 1 run without file /1/1 | 2 attempts, none OK: flaky `SupplierBankEventsTest` **E**; 2nd stopped by lead | via 50ac03dc | V:be-run-1, RW B1 |
| 7 | BE-DOCS-1 | BE | docs, 1 | 1/1/0 | none of its own | via 50ac03dc | RW B1 |
| 8 | TEST-SPEED-1 | BE | 2 | 4/2/2 | 2 → run 1 no marker, review files lacked gate header **P** | 50ac03dc | LTO "Gate reruns" |
| 9 | BE-JDK21 | BE | 2 | 3 files, 5 runs /2/3 | 1 OK (10 min) | 6c31dfbb | RW B1, V:be-jdk21 |
| 10 | R29b-1 | BE | 2 | 7/2/5 | 1 OK (12 min) | 64509abe | V:r29b-1, G |
| 11 | GATE-2 BE | BE | 2 | 6/2/4 | 1 OK (13 min, parallel with App) | 16d9a3fe | V:gate-2, G |
| 12 | R29b-2 | BE | 2 | 4/2/2 | 2 → load timeout `DimensionSetConcurrencyTest` (untouched module, 28 min) **E** | 409f45e5 | V:r29b-2 |
| 13 | AC418-BE | BE | 2 | 6/2/4 | 2 → 2 tests failed (shape list, lost repository classification) **C** | 095a8989 | V:ac418-be |
| 14 | R29b-5 | BE | 2 | 7/2/5 (2 re-stamps) | 1 OK (15 min, under load) | 1560d0d6 | V:r29b-5, G |
| 15 | OUTBOX-CLAIM-BE | BE | 2 | 4/2/2 (2 re-stamps) | 2 → reviews refused after 11 min green (2nd "verdict" line, same reviewer name) **P** | 9aca6c76 | V:outbox-claim-be |
| 16 | RISK-NARROW-1 BE | BE | 2 | 10/2/8 (2 re-stamps) | 2 → 2 `DocumentPostingEngineTest` Postgres connection, load ~570, 73 min **E** | df80e554 | V:risk-narrow-1 |
| 17 | AL-REST-BE | BE | 2 | 6/2/4 (2 re-stamps) | 1 OK (13 min) | 6d948693 | V:al-rest-be |
| 18 | R29b-3U | BE | 2 | 8/2/6 (2 re-stamps) | 1 OK (12 min); semantic merge break caught before the gate | 1c0fc25c | V:r29b-3u |
| 19 | EMAIL-UNIQ-BE | BE | 1 + 2nd seat | 5/2/3 (2 rebase re-checks) | 1 OK (14 min) | 66148f9d | V:email-uniq-be, G |
| 20 | GATE-3a BE | BE | 2 | 6/2/4 (2 re-stamps, "the last") | "gate OK"; run count n.r. | 8472c728 | C, R:gate-3a |
| 21 | FIX-AL-RELEASE-BE | BE | 1 + 2nd seat (D-61) | 2/2/0 | 1 OK (14 min) | 7246cee5 | V:fix-al-release-be |
| 22 | DEMO-FM2-BE | BE | 1 | 1/1/0 (workspace file) | 3 → S3 flake **E**; "tree is not clean" (reviewer wrote into the worktree, 13 min) **P** | 0a8bbffe | C, HO l.24 |
| 23 | FIX-OB-IMPORT-BE | BE | 2 (R); plan says 1 | 4/2/2 | 1 OK (15 min, parallel with App) | 91843a59 | R:fix-ob-import-be, IB |
| 24 | TEST-SCOPE-1 BE | BE | 2 | 8/2/6 (carried over the rebase) | 2 → Docker down after a Mac restart, failed in ~3 min **E**; OK 4678/0/59 | 7ee082be | M:test-scope-be-gate, HO l.27 |
| 25 | Lane 0 App | App | pre-D-46, 2 | 8/2/6 | 4 (1 trust run) → OOM, Gradle home capped heap at 2 GB **E**; passed but no marker (hook not installed) **P** | 69a5deb0 | RW B1 |
| 26 | DOCS-2a | App | docs, 1 | 2/1/1 | none stated | f19a101b | RW B1 |
| 27 | UX-1 | App | docs, 1 | 2/1/1 (file names) | 1 OK (3862 tests) | 87ae114c | PROJECT-STATE, G |
| 28 | FIX-APP-A | App | 2 | 6/2/4 | 1 OK (36 min) | 324d3039 | RW B1 |
| 29 | TEST-SPEED-APP | App | 2 | 4/2/2 | 1 OK (~11 min run, 22 min wall) | 496c1517 | RW B1 |
| 30 | FIX-APP-B1 | App | 2 | 3 files, 5 runs /2/3 | 2 → Gradle killed (exit 143), probably the lead's kill of `java -jar` **E** | e1bc2e1e | LTO |
| 31 | FIX-APP-B2 part a | App | 2 | 7/2/5 | 2 → `--reviews` left out, no marker **P** | f7c993f4 | V:fix-app-b2 |
| 32 | GATE-2 App | App | 2 | 6/2/4 | 1 OK (13 min) | 8d7e8a96 | V:gate-2 |
| 33 | FIX-APP-B2 part b | App | 2 | 6/2/4 (2 re-stamps after gate fix) | 2 → `A4ScreenSizeTest.importCreated`, 66 layout faults, 26 min wall **C** | 430bc5ab | V:fix-app-b2b |
| 34 | AC418-APP | App | 2 | 8/2/6 | 2, both OK (10 + 12 min; 2nd after the simulator fix) | 267270de | V:ac418-app |
| 35 | RISK-NARROW-1 App | App | 2 | 6/2/4 (2 re-stamps) | 1 OK (14 min) | 3fc42d32 | V:risk-narrow-1 |
| 36 | AL-REST-APP | App | 2 | 6/2/4 (2 re-stamps, real conflicts) | 3 → no `--range`, reviews refused **P**; `ConfirmRaceWordsTest` rig race (AC418 test) **C** | 9f182c69 | V:al-rest-app, HO l.23 |
| 37 | FIX-APP-SWITCH | App | 1 + 2nd seat | 4/2/2 (2 re-stamps) | 1 OK (12 min) | 6c680b49 | V:fix-app-switch |
| 38 | GATE-3a App | App | 2 | 6/2/4 (2 re-stamps) | "merged"; run count n.r. | a8e004a6 | C |
| 39 | FIX-OB-IMPORT-APP | App | 1 (2 seats, RISK) | 2/2/0 | 1 OK (13 min) | d1d7f9d1 | R:fix-ob-import-app, IB |
| 40 | FIX-B2A-REFRESH-APP | App | RISK, 2 seats | 2/2/0 | 3 → interrupted at the 99 % usage stop **E**; one run ended "broken pipe" (cause n.r.); OK 4136/0/1 | dae20eb1 | M:b2a-refresh-gate, git log d8c39cd |
| 41 | DOCS-2c | App | 1 (docs) | 2/1/1 | 1 OK 4147/0/1 (~14 min) | 5b65071e | M:docs2c-gate |
| 42 | TEST-SCOPE-1 App | App | 2 | 6/2/4 (carried over) | 1 OK 4147/0/1 (~14 min) | 82b815b0 | M:test-scope-app-gate |
| 43 | HRP-H0-BE (`phase/hrp-v2`) | BE | 2 | 2/2/0 | 1 OK (11 min) | f1a6f944 | V:hrp-h0-be |
| 44 | HRP-H0-APP (`phase/hrp-v2`) | App | 2 | 4/2/2 | 1 OK (10 min) | d91e45cd | V:hrp-h0-app |
| 45 | HRP-SPECS (`phase/hrp-v2`, docs) | App | — | n.r. | n.r. | f15782fa | V:hrp-specs |

Also merged to workspace `master` (no gate): DOCS-1, ROADMAP-A, ROADMAP-A apply, ISO-1, ISO-1b, HRP-DES, INV-SCOPE, VENDORS (8; C, V:*).
**Totals:** 45 lane merges in the code repos (BE `phase/4` 24, App `phase/4` 18, `phase/hrp-v2` 3); 64 gate runs incl. 2 trust-check runs; 20 runs not OK.
No `lane-verdict-*.md` exists for GATE-3a, DEMO-FM2-BE, FIX-OB-IMPORT-BE/APP, FIX-B2A-REFRESH-APP, DOCS-2c or TEST-SCOPE-1 (data from C, R:*, IB, markers).

## 2. First-pass gate rate
- Lanes with their own gate: 42 (all above except BE-DOCS-1, DOCS-2a, HRP-SPECS). **First run passed: 27 / 42 = 64 %** (BE `phase/4` 14/23, App `phase/4` 11/17, hrp-v2 2/2). Src: table 1.
- First-run failures by cause (15): **code 3** (Lane 0 BE gate-script defects; AC418-BE 2 tests outside the targeted set; B2b size test outside the targeted set) ·
  **environment 8** (load 2: R29b-2, RISK-NARROW BE; flake 2: `SupplierBankEventsTest`, S3; Docker down 1: TEST-SCOPE-1 BE; Gradle heap config 1: Lane 0 App;
  killed process 1: B1; usage stop 1: B2A-REFRESH) · **process/format 4** (review-file format 2: TEST-SPEED-1, OUTBOX-CLAIM; missing gate argument 2: B2a `--reviews`, AL-REST-APP `--range`).
- Later-run failures (5): AL-REST-APP rig race (test code); DEMO-FM2 dirty tree (P); B2A "broken pipe" (n.r.); BE-RUN-1 stopped; Lane 0 App no hook (P).
- Lanes merged from AL-REST-BE (6d948693) on: 10/15 first-pass; 0 first-run failures from lane code (table rows 17–24, 36–42).
- Gate budget (P: ≤ 15 min whole suite): over budget only under load or on failure — B2b 26 min, R29b-2 28 min, RISK-NARROW BE 73 min; GATE-2 parallel 13 min vs ~21 back-to-back (V:gate-2).

## 3. Review repeats before vs after D-46 / GATE-3a
| Period (lanes) | Review files | First | Repeat (share) | Re-stamps after a base move | Src |
|---|---|---|---|---|---|
| D-46's own sample (4 lanes, 2026-11-22) | 25 runs | 8 | 17 (68 %) | n.r. | LD D-46 |
| 2026-11-21 → FIX-APP-B1 (15 lanes) | 74 | 26 | 48 (65 %) | rebase checks 6 files (R34 2, FIX-BE 4) | RW B1/B2 |
| FIX-APP-B2a → GATE-3a (20 lane merges, incl. HRP-H0) | 117 | 40 | 77 (66 %) | **22** files (11 lanes × 2: AL-REST-BE, R29b-5, OUTBOX, RISK-NARROW BE+App, R29b-3U, EMAIL-UNIQ, AL-REST-APP, SWITCH, GATE-3a BE+App) | G, V:*, R:* |
| After GATE-3a merged (8 lane merges) | 27 | 14 | 13 (48 %) | **0**; 2 "REVIEW CARRIED OVER" (TEST-SCOPE-1 BE 13 commits, App 17 commits) | G, R:test-scope-* |
- After GATE-3a the 13 repeats are fix checks: TEST-SCOPE-1 BE 6 (4 rounds), App 4 (3 rounds), OB-IMPORT-BE 2, DOCS-2c 1.
- Two of the 22 re-stamps (EMAIL-UNIQ, AL-REST-APP) followed rebases with real conflicts, which GATE-3a would not carry (V:email-uniq-be, V:al-rest-app).
- "Only the FIX reviewer re-checks" (D-46): ACCEPT seats re-checked in OB-IMPORT-BE (seat B, 1.1 m), TEST-SCOPE-1 BE round 4 (seat A) and App round 3 (seat A) (R:*).
- Separate "final gate file" step: 5 lanes, 1–92 min after the last ACCEPT (RW B2); GATE-2 and R29b-1 still had `review-final-*` files (G).

## 4. Escaped defects (found after the origin lane merged) and pre-merge device finds
| Defect | Origin | Caught by | Class | Src |
|---|---|---|---|---|
| PATCH email `""` clears email without IdP sync | user-service (pre-Phase 4) | review (EMAIL-UNIQ 2nd seat, INFO) | seam (service ↔ IdP)* | ED |
| Claim/purge queries touched every due row (7 queries) | accounts, shared events, user, hr v1 | builder (HRP-H0-BE), then test | DB query shape* | ED |
| App never sends `expectedStep` | AL S4 BE + AL app P1 | brief writer (AL-REST brief draft) | seam (contract)* | ED |
| Duplicate receivables opening items not refused (N10, HIGH money) | CP-B.OI1 import | review (B2b Opus round 1; Fable D-33) | **rule** (money)* | ED |
| `hasPermission` 403 instead of 503 on failure | R29 / earlier org code | review (R29b-1 Fable) | seam (service-to-service)* | ED |
| App `verify.sh` took the BE lock | TEST-SPEED-APP / earlier | GATE-2 brief (lead) | tooling* | ED |
| App gate older than BE in 3 rules | Lane 0 App / TEST-SPEED-APP | review (GATE-2 Fable) | tooling (gate)* | ED |
| Semantic merge break R29b-3U × AL-REST-BE | rebase | builder compile + both Opus seats (before gate) | seam (lane × lane)* | ED, V:r29b-3u |
| Approval limits never releasable (`released = false`) | AL-REST lanes | **T4 simulator** | seam (release flag) | ED, LD D-73 |
| Reports company switch read the old company's fiscal year (AC418 step 15) | AC418-APP (pre-merge) | simulator (both reviewers had accepted) | seam (wrong data across a flow) | V:ac418-app, LD D-73 |
| Writer+submitter got the general sentence (AC418 step 16) | AC418-APP (pre-merge) | simulator | seam (role path) | V:ac418-app, LD D-73 |
| Excel template saved as .csv (OBS-2; spec said CSV, D-58 changed it) | B2b / OB import | **T4 simulator** | seam (file type) | t4-results-tester2, LD D-58/D-73 |
| Draft editor kept stale entitlements on return (B2a-S6) | session re-read (`AppSession.reread`) | **T4b simulator** | seam (session refresh)* | t4b-results-tester1, R:fix-b2a-refresh-app |
- Counts: 9 rows in ED + 4 device finds = 13. By class: **seam 9, rule 1, tooling 2, DB query 1**. By catcher: review 4, brief/lead 2, builder 1, builder/rebase check 1, **simulator/T4 5**, gate 0.
- `*` = class is this collector's reading; LD D-73 classifies only "4 escaped bugs … all seam bugs (wrong data across a flow, role path, release flag, file type)".
- Caught by the gate before merge (not escapes): AC418-BE 2 tests, B2b size test (V:ac418-be, V:fix-app-b2b).

## 5. Simulator sessions
| Session | Planned | Run / PASS / FAIL / BLOCKED / by design | Time planned → actual | Src |
|---|---|---|---|---|
| FIX-APP-B2a checks S1–S8 | 8 checks | S1 5/5, S2 4/4, S3 9 + 1 data missing, S4 data missing, S5/S6 not run, S7 3/3, S8 all PASS; 0 FAIL | n.r. → ~10 m set-up + 3.8/6.6/7.9 m parallel | V:fix-app-b2 |
| FIX-APP-B2b checks | 17 items | most PASS; 5, 6, 17, 12-project data missing; 3, 10, 14 deferred; 0 FAIL | n.r. → ~20 m set-up + ~11 m parallel | V:fix-app-b2b |
| AC418-APP checks + retest | 20 steps | 17 PASS, 2 FAIL (15, 16), 19 N-A; retest: 15 PASS, 16 not run (load ~570) | n.r. → 43 m + 27 m | V:ac418-app, TL |
| R29b-5 jar-mode check | 3 items | PASS; inbox/retry N-A | → 3 m | V:r29b-5 |
| T4 plan (full) | 82 steps (76 listed IDs) | — | ~3 h 30 m + 20 m lead data | sim-session-phase4-retest.md |
| T4 trimmed (D-69) | 76 IDs → **28 KEEP, 33 DROP (covered by named automated tests), 15 API**; 35 more dropped earlier as already PASS in TL | — | tester 1 ~75 m, tester 2 ~30 m, lead ~30 m; "under 80 min critical path" | sim-session-phase4-retest-trimmed.md |
| T4 run 1, tester 1 | 20 kept steps | ~17 PASS, 0 FAIL, ~14 BLOCKED (AL not released; Ola not on Lahore; D1/AC418-10a prep), B2b-3 not run; B2b-14 PASS by design | start 18:46; end n.r. | TL, t4-results-tester1 |
| T4 run 1, tester 2 | 6 | 2 PASS, 1 FAIL (OBS-2), 3 BLOCKED (data used up) | ~30 m → ~9 m (18:46–18:55) | t4-results-tester2 |
| T4b (short retest), tester 1 | R-AL, R-SW, R-misc | 17 PASS; AL-P6/P7/O3 FAIL → by design (D-64); B2a-S6 FAIL; SW-B6, AL-R3 BLOCKED; AL-Lang, B2a-S3.3 partial; AC418-10b, B2b-3 not run; 7 a11y findings | n.r. → ~130 m (95 + 10 + 15 + 10) | TL, t4b-results-tester1 |
| T4b, tester 2 | R-OB | 11 PASS, 0 FAIL, 1 BLOCKED, 1 N-A | n.r. → 27 m (21:44–22:11) | t4b-results-tester2 |
- T4 FAIL/BLOCKED → fix lanes: FIX-AL-RELEASE-BE, FIX-OB-IMPORT-BE/APP, DEMO-FM2-BE (data), FIX-B2A-REFRESH-APP (C, IB). B2a-S6 closed by 3 UI tests (old FAIL / new PASS) + gate, no device re-check (P "Order to close").
- Not covered after T4b, proposed as automated tests instead of a new session (Jabran: no answer yet): SW-B6, AL-R3, AL-Lang sv/da, B2a-S3.3 RV post, AC418-10b, B2b-3 (HO l.43).
- Plan budget "flow session ≤ 4 h in two runs" (P): T4 + T4b tester time recorded ≈ 9 m + ~130 m + 27 m + tester-1 run 1 (n.r.).

## 6. Time and cost (MEASURE-1, where recorded; no estimates)
First 15 lanes (commit-time proxies, LT): 75.0 lane-h; build 22 %, review+fix 32 %, gate+checks 28 %, merge wait 18 %; mean 5.0 h per lane; code lanes only: build 28 %, review+fix 42 %, gate 19 %, wait 12 % (LT, TA).
| Lane | Build | Rework | Review | Test / gate | Waiting | Tokens (builder; reviewers) | Src |
|---|---|---|---|---|---|---|---|
| AC418-BE | 48 m | 40 + 10 + 12 m | 6 + 4 m; re-stamps 1–2 m | gates 12 + 12 m | n.r. | 473 k; n.r. | V:ac418-be |
| AC418-APP | ~70 m | 17 + 32 m | 3 × (2–4 + 1 m) | sim 43 + 27 m; gates 10 + 12 m | ~20 m | n.r. | V:ac418-app |
| HRP-H0-BE | 65 m | 0 | 8.5 + 6.5 m | gate 11 m | n.r. | 539 k; 220 k + 232 k | V:hrp-h0-be |
| HRP-H0-APP | 32 m + ~20 m decision (+30 m lost) | ~25 m | 7.8 + 1.1, 5.8 + 0.7 m | gate 10 m | n.r. | n.r. | V:hrp-h0-app |
| R29b-2 | 3 h 19 m | 32 m | 11.4 + 5.7, 12.8 + 4 m | gates 28 + 11 m | ~15 m | 888 k + 220 k; 379 k + 469 k | R:r29b-2, V:r29b-2 |
| R29b-5 | 34 m | 14 m | ~27 m | gate 15 m, sim 3 m | ~139 m + ~25 m | 490 k; 260 k + 226 k | R:r29b-5, V:r29b-5 |
| OUTBOX-CLAIM-BE | 38 m | 11 + 5 m (format) | 3 + 1 m; re-stamps 2 m | gates 11 + 11 m | ~15 m | n.r. | V:outbox-claim-be |
| RISK-NARROW-1 | ~60 m per repo | ~136 m | ~34 + 11, ~25 + 22, ~15 m | BE 73 + 11 m, App 14 m | n.r. (3 rebases) | 340 k + 235 k; 330 k + 440 k | R/V:risk-narrow-1 |
| AL-REST-BE | 1 h 53 m | 64 m | 10 + 8, 7 + 3.5, re-stamps 2 m | gate 13 m | listed, not timed | ~750 k; 350 k + 410 k + 140 k | R:al-rest-be |
| AL-REST-APP | 71 m | 31 m | ~16 m | 3 gate runs | ~3 m | ~900 k; 270 k + 276 k | R:al-rest-app |
| R29b-3U | 82 + 52 m | 45 + 22 m | ~38 m incl. Fable check | gate 12 m | listed, not timed | ~1.1 M; 460 k + 420 k | R:r29b-3u |
| EMAIL-UNIQ-BE | 16 m | 12 m | 7 m | gate 14 m | ~40 m | 167 k; 125 k + 84 k | R:email-uniq-be |
| FIX-APP-SWITCH | 40 m | 0 | ~6.7 m + re-stamps ~3.7 m | 10 m + gate 12 m | not timed | 272 k; 227 k + 217 k re-stamps | R:fix-app-switch |
| FIX-APP-B2b | 2 h 35 m | 28 + 14.5 m | ~24 m incl. Fable 3.3 m | gates 26 + 13 m; sim ~31 m | ~50 m | 749 k; 356 k + 296 k + 133 k + 241 k | R/V:fix-app-b2b |
| GATE-3a | BE 20, App 25 m | 30 / 60 m | 7 + 9, 3 + 3 m | in build | ~10 m | 185 k + 215 k; 180 k + 200 k | R:gate-3a |
| FIX-AL-RELEASE-BE | ~42 m (mostly BE-lock wait) | 0 | 1.7 m | gate 14 m | in build | 125 k; 94 k | R:fix-al-release-be |
| FIX-OB-IMPORT-BE | ~70 m (~40 m lock wait) | ~25 m | 2.5 + 3, 0.9 + 1.1 m | gate 15 m | in build | ~300 k; 140 k + 136 k (+108 k brief check) | R:fix-ob-import-be |
| FIX-OB-IMPORT-APP | ~2 h 15 m wall (lock wait, OOM retry) | ~25 m | 2.4 + 2.3 m | gate 13 m | in build | 256 k; 124 k + 112 k | R:fix-ob-import-app |
| FIX-B2A-REFRESH-APP | ~23 m | 0 | 3 + 1.3 m | 3 gate runs | reviews waited for the reset | 272 k; 90 k + 90 k | R:fix-b2a-refresh-app |
| DOCS-2c | ~14 m | ~2 m | ~3 m + < 1 m | gate ~14 m | — | 296 k; 157 k | R:docs2c |
| TEST-SCOPE-1 BE | ~6 h build + rework (3 fix rounds, overnight stop) | incl. | 4 rounds × 2, 3–10 m each | gates ~3 (fail) + 15 m | overnight stop | 570 k; 245 k + 285 k (+114 k brief check) | R:test-scope-be |
| TEST-SCOPE-1 App | n.r. (22 Nov 20:05 → 24 Nov) | 2 rounds | 3 rounds × 2 | gate ~14 m | — | 555 k; 190 k + 296 k | R:test-scope-app |
Not recorded: DEMO-FM2-BE (all buckets), UX-1, HRP-SPECS, GATE-2 waiting/rework beyond builder minutes (TA, phase4-timing-notes-newmac), GATE-3a gate time. Old-Mac sub-agent tokens for 6 lanes: 4.07 M (LTO).
"First-pass gate" is "pending"/"not run yet" in every lane-ready since D-63; values above come from verdicts and markers.

## 7. Rules added this phase (D-43 … D-77) — evidence only
| D | Rule (one line) | Evidence so far (cite) |
|---|---|---|
| D-43 | 2nd reviewer = fresh Opus (security high) once Fable hits 45 %; later no new Fable | Opus security seats found the GATE-3a App short-SHA bypass (LD D-52) and MEDIUMs in TEST-SCOPE-1 where seat A accepted (R:test-scope-*). Before: Fable found the AC418-BE HIGH (V:ac418-be). |
| D-44 | Default effort; Opus high only for security reviews | Too early to judge: no before/after measure in any source. |
| D-45 | GATE-3 scope approved (fail-fast reviews, failing-test names, patch-identical rule, lock wait, merge helper, all `phase/*` gated) | Only GATE-3a built: 22 re-stamp files before, 0 after, 2 carry-overs (§3). Remainder moved out (D-77): too early. |
| D-46 | Review tiers; only the FIX reviewer re-checks; no re-stamp on clean rebase | Repeats 65–68 % before → 48 % after GATE-3a (§3). Tier-1 lanes still got 2 seats because the gate needs 2 files on RISK paths (R:fix-ob-import-app, LD D-46). 3 ACCEPT-seat re-checks after D-46 (§3). |
| D-47 | Scoped gate per lane; whole suite only phase → `main` | TEST-SCOPE-1 merged 24 Nov; every Phase 4 marker is `gate=full` (M:*). Measured saving: BE one service ~2 vs 16 min; App roles change 680 vs 703 s (R:test-scope-*). Effect on lanes: too early. |
| D-49 | No reviewer re-runs; builder runs touched services + architecture | From AL-REST-BE on: 0 first-run gate failures from lane code (§2); builder full run caught the semantic merge break (TL). Reviewers still ran tests in fix checks (TL: AL-REST Opus 137 + 61 tests). |
| D-51 | Speed rules: batch fixes, flow test before review, Opus brief check, check first / don't repeat, test ledger | Brief checks found 3 corrections per OB brief and 12 in TEST-SCOPE-1 (R:*); TL let 35 T4 steps drop as already PASS. Flow test before review was replaced by T4 for batch B (P); AL release flag escaped to T4 (§4). |
| D-53 | One phase test plan, owned by the old-Mac lead | P exists with T1–T5; T4 plan 82 steps / ~3.5 h was trimmed to 28 steps (§5). No other measure. |
| D-54 / D-71 / D-56 | T4 fix lanes before the reset; 90 % hold; then full usage to 99 % | One B2A-REFRESH gate run lost at the 99 % stop (§1 row 40). Otherwise too early. |
| D-55 | GATE-3a first; two parallel T4 testers; stream fixes; parallel final gates; use gaps | Re-stamps 22 → 0 (§3). Testers unbalanced: tester 2 9 m and 27 m vs tester 1 ~130 m in T4b (§5). OB fix lanes assigned during T4 (~19:15, R:fix-ob-import-*). Parallel gates: GATE-2 13 vs ~21 min; OB 15 + 13 min parallel (IB). Gaps: not measured. |
| D-57 | Lanes and fixes by feature; ≤ 3 fix lanes per repo | T4 fixes: 4 lanes (BE 2, App 2) by feature (C); OB-IMPORT-APP also carried the B2a-S6 words (R:fix-ob-import-app). Feature lanes (4b): too early. |
| D-61 | Accounts independent on the new Mac (trial from 4b) | Used once in Phase 4: old-Mac 2nd seat on FIX-AL-RELEASE-BE (V:fix-al-release-be). Trial itself: too early. |
| D-63 | PRINCIPLES first; measure cost + first-pass; prune at phase review | 19 lane-readies carry token/cost lines (grep); first-pass is never filled in a lane-ready (§6). |
| D-65 | Fewer sub-agents; fix rounds resume the same builder (trial from 4b/HR) | Too early to judge. |
| D-67 | "Brief: unclear or missing" line in every hand-back | 9 lane-readies carry it; 8 list gaps (GATE-3a "none"). Repeats: builder-report file name (TEST-SCOPE-1 BE + App), contract path (OB BE + App), cause put in the wrong place (B2A) (R:*). Template change: too early. |
| D-69 | Automate what repeats; simulator for first looks | T4 trimmed 33 steps to named tests; 2 weak drops restored (§5). Every T4 fix lane has old-FAIL/new-PASS tests (R:fix-*). No file reports a later defect in a dropped step. |
| D-73 | Seam tests: strict fakes, contract tests, 4-language size tests (4b) | 9 of 13 Phase 4 escapes/finds are seam class (§4). Rule itself: too early (4b). |
| D-75 | Simulator personas + a11y pass; AXe in the E2E spike | T4b produced 7 a11y findings, 1 i18n (t4b-results-tester1). Value: too early. |
| D-77 | GATE-3 remainder becomes its own phase | Too early to judge. |
| Lane/product decisions (not process rules) | D-46u, D-47u, D-48, D-50, D-52, D-58, D-59, D-60, D-62, D-64 | D-62: TEST-SCOPE-1 still had a MEDIUM per repo after it (R:test-scope-*); D-64 turned 3 T4b FAILs into by-design PASS (TL). |
D-66, D-68, D-70, D-72, D-74, D-76: not used in Phase 4 (old Mac odd, new Mac even; LD has no such entries).
