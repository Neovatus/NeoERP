# Phase 4 lane timing (2026-11-21 to 2026-11-22)

Read-only data collection from git, written 2026-11-22. Nothing else was changed or committed.

## How measured and limits

- Sources: `git log` author dates on `origin/phase/4` of NeoERP-App and NeoERP-BackEnd (lane branches were deleted, so each lane is the set of commits carrying its brief, code, builder-report and review files), and on workspace `.review-channel/` (claims.md, lane-ready-*, lane-verdict-*) and `docs/inbox/erp-lead.md`. Times are local (+0100), minute resolution; "21" and "22" are days of November 2026.
- Commit times are proxies. Work happens before its commit, and builders often commit in lumps (several commits in one minute), so build times for small lanes (DOCS-2a/2b, BE-RUN-1, BE-DOCS-1, BE-JDK21) are 2 to 9 minutes only because their commits were written together. Builder and test Mac clocks were not compared. Rebased commits keep their author dates, so some sit out of order.
- Stages form a chain per lane: assigned; build (assigned to builder report, or to the last code commit before review 1 when there is no report); review+fix (build end to the last review-file commit, including waiting for reviewers, fix rounds, rebase re-checks and the "final gate review files" written for the verify marker); gate+checks (last lane commit to the verdict commit: old-Mac full run, simulator checks and, where the verdict was first written after Jabran's MERGE, that wait); merge wait (verdict commit to the merge note). Up to three lanes ran at once, so totals are lane-hours, not calendar hours.
- Assigned = brief commit time unless an earlier inbox TASK or claims entry exists (R29b-1: inbox TASK 01:22). Merged = the claims or state commit that records it, or the verdict commit when its first version already says the fast-forward is done (ISO-R1, FIX-BE, FIX-APP-A). For R29b-1 and FIX-APP-B1 the only merge record is the claims commit at 22 07:04, an upper bound; their verdicts were written 04:31 and 04:06.
- Verdicts for Lane 0, ISO-R1, R34-BE, FIX-BE and FIX-APP-A were first written after Jabran's MERGE, so their gate+checks stage contains his approval wait and their merge wait shows 0 to 39 min. DOCS-2a/2b, BE-RUN-1 and BE-DOCS-1 verdicts are batch commits written after the fact.
- Counts: "commits" = all lane commits; "code commits" = commits that are not brief, builder-report or review-file commits (they include docs pages, tests and fix commits); "files" = distinct files touched by the lane's commits (code, docs, reports, reviews together). Rounds with FIX = review rounds with at least one FIX verdict; individual FIX verdicts are given where commit messages or lane-ready files state them, else "unknown".
- Not found: gate wall time for DOCS-2a/2b and Lane 0 BE; per-reviewer verdicts in round 1 of TEST-SPEED-1/APP; review files for BE-RUN-1 and BE-DOCS-1 (only fix commits). UX-1, HRP, INV, vendors and roadmap lanes are left out (docs/design lanes, not in the Merged list). Phase 4 lanes before 2026-11-21 are not identifiable from the claims list.

## Per-lane tables

### Lane 0 BE (BE)

| Item | Value |
|---|---|
| Assigned | 21 00:36 (brief commit) |
| Build start (first code commit) | 21 00:48 |
| Build end | 21 01:09 (last code commit before review 1 (no builder-report commit)) |
| Review and fix rounds | R1 01:18 Opus+Fable: FIX, FIX | R2 01:45 Opus+Fable: ACCEPT, ACCEPT | R3 03:26 Opus+Fable (verify.sh fix after the full-run comparison): ACCEPT, ACCEPT |
| Last review commit | 21 03:26 |
| Lane-ready file first commit (workspace) | 21 04:05 |
| Gate | old full run and verify.sh side by side; verify failed once on 3caadc5 (2 defects), OK on 5e00b13; wall time not stated; attempts: 2 verify runs + 1 old run |
| Verdict written | 21 05:10 |
| Merged | 21 05:16 (claims line (hook push)) |
| Durations | build 0h33; review+fix 2h17 (3 rounds, rounds with FIX: 1); last commit to verdict 1h44; verdict to merged 0h06; assigned to merged 4h40 |
| Counts | 25 commits, 20 code commits, 30 files, 3 review rounds, individual FIX verdicts: 2 |

### DOCS-2a (App docs) (App)

| Item | Value |
|---|---|
| Assigned | 21 01:35 (brief commit) |
| Build start (first code commit) | 21 01:40 |
| Build end | 21 01:40 (last pre-review docs commit (5 docs commits share 01:40)) |
| Review and fix rounds | R1 Opus FIX (3 MAJOR; file time unknown) | R2 01:49 ACCEPT |
| Last review commit | 21 01:49 |
| Lane-ready file first commit (workspace) | 21 01:50 |
| Gate | docs only, no gate stated; attempts: none stated |
| Verdict written | 21 05:11 |
| Merged | 21 05:16 (claims line) |
| Durations | build 0h05; review+fix 0h09 (2 rounds, rounds with FIX: 1); last commit to verdict 3h22; verdict to merged 0h05; assigned to merged 3h41 |
| Counts | 9 commits, 6 code commits, 30 files, 2 review rounds, individual FIX verdicts: 1 |

### DOCS-2b (BE docs) (BE)

| Item | Value |
|---|---|
| Assigned | 21 01:35 (brief commit) |
| Build start (first code commit) | 21 01:38 |
| Build end | 21 01:42 (last pre-review docs commit) |
| Review and fix rounds | R1 Opus FIX (1 MAJOR; file time unknown) | R2 01:48 ACCEPT |
| Last review commit | 21 01:48 |
| Lane-ready file first commit (workspace) | 21 01:49 |
| Gate | verify OK 4222/0/59 at the first hook push (time not stated); attempts: 1 |
| Verdict written | 21 05:11 |
| Merged | 21 05:14 (merge commit d0dd544) |
| Durations | build 0h07; review+fix 0h06 (2 rounds, rounds with FIX: 1); last commit to verdict 3h23; verdict to merged 0h03; assigned to merged 3h39 |
| Counts | 10 commits, 7 code commits, 13 files, 2 review rounds, individual FIX verdicts: 1 |

### ISO-R1 (BE)

| Item | Value |
|---|---|
| Assigned | 21 08:45 (brief commit) |
| Build start (first code commit) | 21 09:26 |
| Build end | 21 10:18 (builder-report commit) |
| Review and fix rounds | R1 10:35 Opus FIX, Fable FIX | R2 10:59 Opus FIX, Fable ACCEPT | R3 11:05 Opus ACCEPT, Sonnet ACCEPT |
| Last review commit | 21 11:05 |
| Lane-ready file first commit (workspace) | 21 11:55 |
| Gate | verify OK 2982 s (49.7 min), 4295/0/59, money invariants OK; attempts: 1 stated |
| Verdict written | 21 14:01 |
| Merged | 21 14:01 (verdict text records Jabran yes and the fast-forward; claims line 15:19 is shared with R34-BE) |
| Durations | build 1h33; review+fix 0h47 (3 rounds, rounds with FIX: 2); last commit to verdict 2h56; verdict to merged 0h00; assigned to merged 5h16 |
| Counts | 21 commits, 14 code commits, 66 files, 3 review rounds, individual FIX verdicts: 3 |

### R34-BE (BE)

| Item | Value |
|---|---|
| Assigned | 21 10:09 (brief commit) |
| Build start (first code commit) | 21 10:27 |
| Build end | 21 10:41 (builder-report commit) |
| Review and fix rounds | R1 10:54 Opus FIX, Fable FIX | R2 Fable 11:20 FIX, Opus 11:58 FIX | R3 Fable 11:50 FIX | confirm 13:09 Opus ACCEPT, Sonnet ACCEPT | rebase 14:14 ACCEPT, ACCEPT |
| Last review commit | 21 14:14 |
| Lane-ready file first commit (workspace) | 21 14:54 |
| Gate | verify OK 2402 s (40.0 min), 4297/0/59, money invariants OK (bootstrap from a pre-R34 base); attempts: 1 stated |
| Verdict written | 21 15:18 |
| Merged | 21 15:19 (claims line) |
| Durations | build 0h32; review+fix 3h33 (5 rounds, rounds with FIX: 3); last commit to verdict 1h04; verdict to merged 0h01; assigned to merged 5h10 |
| Counts | 33 commits, 21 code commits, 38 files, 5 review rounds, individual FIX verdicts: 5 |

### FIX-BE (BE)

| Item | Value |
|---|---|
| Assigned | 21 14:12 (brief commit) |
| Build start (first code commit) | 21 15:46 |
| Build end | 21 16:04 (builder-report commit) |
| Review and fix rounds | R1 16:14/16:45 Opus FIX, Fable FIX | R2 17:12/17:15 Opus FIX, Fable ACCEPT | R3 17:31/17:32 Sonnet FIX, Opus ACCEPT | R4 17:36 Sonnet ACCEPT | rebase 17:56-18:17 Sonnet ACCEPT, Opus FIX, Opus ACCEPT, Sonnet ACCEPT |
| Last review commit | 21 18:17 |
| Lane-ready file first commit (workspace) | 21 19:13 |
| Gate | verify OK 54 min, 4318/0 (verdict), money invariants OK; attempts: 1 stated |
| Verdict written | 21 19:55 |
| Merged | 21 19:55 (verdict text records the fast-forward; claims line 22 00:16 is a later sync) |
| Durations | build 1h52; review+fix 2h13 (5 rounds, rounds with FIX: 4); last commit to verdict 1h38; verdict to merged 0h00; assigned to merged 5h43 |
| Counts | 35 commits, 19 code commits, 100 files, 5 review rounds, individual FIX verdicts: 5 |

### FIX-APP-A (App)

| Item | Value |
|---|---|
| Assigned | 21 14:12 (brief commit) |
| Build start (first code commit) | 21 16:06 |
| Build end | 21 16:55 (builder-report commit) |
| Review and fix rounds | R1 17:32/17:37 Sonnet FIX, Opus FIX | R2 18:53/19:13 Sonnet FIX, Opus FIX | R3 19:30/19:31 Sonnet ACCEPT, Opus ACCEPT |
| Last review commit | 21 19:31 |
| Lane-ready file first commit (workspace) | 21 20:09 |
| Gate | verify OK 36 min, 3905/0/1; simulator checks S1-S4 left open for R05/R06; attempts: 1 stated |
| Verdict written | 21 20:24 |
| Merged | 21 20:24 (verdict text records the fast-forward) |
| Durations | build 2h43; review+fix 2h36 (3 rounds, rounds with FIX: 2); last commit to verdict 0h53; verdict to merged 0h00; assigned to merged 6h12 |
| Counts | 29 commits, 21 code commits, 69 files, 3 review rounds, individual FIX verdicts: 4 |

### Lane 0 App (App)

| Item | Value |
|---|---|
| Assigned | 21 05:15 (brief commit) |
| Build start (first code commit) | 21 05:23 |
| Build end | 21 06:29 (first builder-report commit) |
| Review and fix rounds | R1 06:56 Opus FIX, Fable FIX | R2 07:28 Opus ACCEPT, Fable FIX | R3 07:43/07:49 Fable ACCEPT, Opus ACCEPT | R4 08:45 (daemon-heap fix) both ACCEPT |
| Last review commit | 21 08:45 |
| Lane-ready file first commit (workspace) | 21 09:24 |
| Gate | old jvmTest 2187 s vs verify.sh 2263 s (about 37-38 min each), 3862/0/1; the first verify run failed (Gradle daemon out of memory), fixed in R4; attempts: 3 runs (1 failed) |
| Verdict written | 21 09:29 |
| Merged | 21 10:08 (claims/state line) |
| Durations | build 1h14; review+fix 2h16 (4 rounds, rounds with FIX: 2); last commit to verdict 0h44; verdict to merged 0h39; assigned to merged 4h53 |
| Counts | 32 commits, 23 code commits, 41 files, 4 review rounds, individual FIX verdicts: 3 |

### BE-RUN-1 (BE)

| Item | Value |
|---|---|
| Assigned | 21 22:14 (claims/brief commit) |
| Build start (first code commit) | 21 22:16 |
| Build end | 21 22:16 (builder-report commit (3 commits share 22:16)) |
| Review and fix rounds | review 1 and 1b: fix commits 22:21 and 22:27; review files not committed in the lane range; verdicts not stated |
| Last review commit | 21 22:27 |
| Lane-ready file first commit (workspace) | 21 22:27 |
| Gate | no own gate: first gate failed on the flaky SupplierBankEventsTest, second stopped; covered by the TEST-SPEED-1 full run; attempts: 2 failed/stopped, then shared run |
| Verdict written | 22 00:26 |
| Merged | 22 03:37 (state commit 1b496d2 (with TEST-SPEED-1)) |
| Durations | build 0h02; review+fix 0h11 (2 rounds, rounds with FIX: unknown); last commit to verdict 1h59; verdict to merged 3h11; assigned to merged 5h23 |
| Counts | 6 commits, 2 code commits, 7 files, 2 review rounds, individual FIX verdicts: unknown |

### BE-DOCS-1 (BE)

| Item | Value |
|---|---|
| Assigned | 21 22:43 (brief commit) |
| Build start (first code commit) | 21 22:44 |
| Build end | 21 22:45 (builder-report commit) |
| Review and fix rounds | review 1 fixes 22:49; review file not committed in the lane range |
| Last review commit | 21 22:49 |
| Lane-ready file first commit (workspace) | 21 22:50 |
| Gate | no own gate (docs-only range, rides on the next BE full run); attempts: none own |
| Verdict written | 22 00:13 |
| Merged | 22 03:37 (state commit 1b496d2 (with TEST-SPEED-1)) |
| Durations | build 0h02; review+fix 0h04 (1 rounds, rounds with FIX: unknown); last commit to verdict 1h24; verdict to merged 3h24; assigned to merged 4h54 |
| Counts | 8 commits, 5 code commits, 13 files, 1 review rounds, individual FIX verdicts: unknown |

### TEST-SPEED-1 (BE)

| Item | Value |
|---|---|
| Assigned | 21 23:06 (brief commit) |
| Build start (first code commit) | 21 23:18 |
| Build end | 22 01:00 (builder-report commit) |
| Review and fix rounds | R1 01:29 Opus + Fable (FIX incl. 1 HIGH; per-reviewer split not stated) | R3 02:18 Opus ACCEPT, 02:37 Fable ACCEPT | 02:55 final gate review files |
| Last review commit | 22 02:55 |
| Lane-ready file first commit (workspace) | 22 03:08 |
| Gate | verify OK 11 min wall (was 54), 4320/0/59, money invariants OK; attempts: 1 stated |
| Verdict written | 22 03:08 |
| Merged | 22 03:37 (state commit 1b496d2) |
| Durations | build 1h54; review+fix 1h55 (2 rounds, rounds with FIX: 1); last commit to verdict 0h13; verdict to merged 0h29; assigned to merged 4h31 |
| Counts | 20 commits, 11 code commits, 20 files, 2 review rounds, individual FIX verdicts: unknown |

### TEST-SPEED-APP (App)

| Item | Value |
|---|---|
| Assigned | 21 23:08 (brief commit) |
| Build start (first code commit) | 21 23:17 |
| Build end | 22 00:55 (builder-report commit) |
| Review and fix rounds | R1 01:29 Opus + Fable (FIX; three Fable MEDIUMs; split not stated) | R3 02:37 Fable ACCEPT | 02:56 final gate review files |
| Last review commit | 22 02:56 |
| Lane-ready file first commit (workspace) | 22 03:28 |
| Gate | verify OK about 11 min run, 22 min wall incl. waiting for the BackEnd gate on the Gradle lock, 3905/0/1; attempts: 1 stated |
| Verdict written | 22 03:28 |
| Merged | 22 03:37 (state commit 1b496d2) |
| Durations | build 1h47; review+fix 2h01 (2 rounds, rounds with FIX: 1); last commit to verdict 0h32; verdict to merged 0h09; assigned to merged 4h29 |
| Counts | 16 commits, 8 code commits, 18 files, 2 review rounds, individual FIX verdicts: unknown |

### BE-JDK21 (BE)

| Item | Value |
|---|---|
| Assigned | 22 01:07 (brief commit) |
| Build start (first code commit) | 22 01:15 |
| Build end | 22 01:16 (builder-report commit (lane-ready 01:17)) |
| Review and fix rounds | R1 01:31 Opus FIX, Sonnet ACCEPT | R3 02:29 Opus ACCEPT | 03:32 final gate review files (Opus, Sonnet) |
| Last review commit | 22 03:32 |
| Lane-ready file first commit (workspace) | 22 01:17 |
| Gate | verify OK 10 min on Java 21, 4332/0/59, money invariants OK; jar mode healthy; attempts: 1 stated |
| Verdict written | 22 03:49 |
| Merged | 22 03:51 (state commit c5dba3b) |
| Durations | build 0h09; review+fix 2h16 (2 rounds, rounds with FIX: 1); last commit to verdict 0h17; verdict to merged 0h02; assigned to merged 2h44 |
| Counts | 13 commits, 7 code commits, 38 files, 2 review rounds, individual FIX verdicts: 1 |

### R29b-1 (BE)

| Item | Value |
|---|---|
| Assigned | 22 01:22 (inbox TASK; stop for D-25 at 01:36, sub-lane brief 01:47) |
| Build start (first code commit) | 22 02:30 |
| Build end | 22 02:59 (builder-report commit) |
| Review and fix rounds | R1 03:58 Opus FIX, Fable FIX | R2 04:08 Opus ACCEPT, Fable FIX | R3 04:16 Fable ACCEPT | 04:17 final gate review files |
| Last review commit | 22 04:17 |
| Lane-ready file first commit (workspace) | 22 04:18 |
| Gate | verify OK 12 min, 4438/0/59, money invariants OK (Docker up); attempts: 1 stated |
| Verdict written | 22 04:31 |
| Merged | 22 07:04 (claims line 43e5be0 (upper bound, actual merge time not recorded)) |
| Durations | build 1h37; review+fix 1h18 (3 rounds, rounds with FIX: 2); last commit to verdict 0h14; verdict to merged 2h33; assigned to merged 5h42 |
| Counts | 32 commits, 21 code commits, 135 files, 3 review rounds, individual FIX verdicts: 3 |

### FIX-APP-B1 (App)

| Item | Value |
|---|---|
| Assigned | 21 23:04 (brief commit) |
| Build start (first code commit) | 21 23:56 |
| Build end | 22 01:03 (builder-report commit) |
| Review and fix rounds | R1 01:20 Opus FIX, Sonnet ACCEPT | R3 02:10 Opus ACCEPT | 03:42 final gate review files (Opus, Sonnet); Android compile fix 02:01 |
| Last review commit | 22 03:42 |
| Lane-ready file first commit (workspace) | 22 04:06 |
| Gate | verify OK 8 min, 3921/0/1; plus iOS look on iPhone and iPad; attempts: 1 stated |
| Verdict written | 22 04:06 |
| Merged | 22 07:04 (claims line 43e5be0 (upper bound)) |
| Durations | build 1h59; review+fix 2h39 (2 rounds, rounds with FIX: 1); last commit to verdict 0h24; verdict to merged 2h58; assigned to merged 8h00 |
| Counts | 20 commits, 13 code commits, 63 files, 2 review rounds, individual FIX verdicts: 1 |

## Summary

| Lane | Repo | Total h | Build h | Review+fix h (rounds) | Gate+checks h (stated run) | MERGE wait h |
|---|---|---|---|---|---|---|
| Lane 0 BE | BE | 4.7 | 0.6 | 2.3 (3) | 1.7 (n/a) | 0.1 |
| DOCS-2a (App docs) | App | 3.7 | 0.1 | 0.1 (2) | 3.4 (n/a) | 0.1 |
| DOCS-2b (BE docs) | BE | 3.6 | 0.1 | 0.1 (2) | 3.4 (n/a) | 0.1 |
| ISO-R1 | BE | 5.3 | 1.6 | 0.8 (3) | 2.9 (2982 s (49.7 min)) | 0.0 |
| R34-BE | BE | 5.2 | 0.5 | 3.5 (5) | 1.1 (2402 s (40.0 min)) | 0.0 |
| FIX-BE | BE | 5.7 | 1.9 | 2.2 (5) | 1.6 (54 min) | 0.0 |
| FIX-APP-A | App | 6.2 | 2.7 | 2.6 (3) | 0.9 (36 min) | 0.0 |
| Lane 0 App | App | 4.9 | 1.2 | 2.3 (4) | 0.7 (38 min) | 0.7 |
| BE-RUN-1 | BE | 5.4 | 0.0 | 0.2 (2) | 2.0 (n/a) | 3.2 |
| BE-DOCS-1 | BE | 4.9 | 0.0 | 0.1 (1) | 1.4 (n/a) | 3.4 |
| TEST-SPEED-1 | BE | 4.5 | 1.9 | 1.9 (2) | 0.2 (11 min wall) | 0.5 |
| TEST-SPEED-APP | App | 4.5 | 1.8 | 2.0 (2) | 0.5 (about 11 min run) | 0.1 |
| BE-JDK21 | BE | 2.7 | 0.1 | 2.3 (2) | 0.3 (10 min) | 0.0 |
| R29b-1 | BE | 5.7 | 1.6 | 1.3 (3) | 0.2 (12 min) | 2.5 |
| FIX-APP-B1 | App | 8.0 | 2.0 | 2.6 (2) | 0.4 (8 min) | 3.0 |
| **Total lane-hours (15 lanes)** | | **75.0** | **16.2** | **24.4** | **20.8** | **13.7** |

## Share of lane-time per stage

| Stage | Lane-hours | Share |
|---|---|---|
| Build (assigned to builder report) | 16.2 | 22% |
| Review + fix | 24.4 | 32% |
| Gate + checks (last commit to verdict) | 20.8 | 28% |
| Merge wait (verdict to merged) | 13.7 | 18% |

Excluding the four docs/dev-script lanes (DOCS-2a/2b, BE-RUN-1, BE-DOCS-1): 11 lanes, 57.3 lane-hours: build 28%, review+fix 42%, gate+checks 19%, merge wait 12%.

All 15 lanes: 309 commits, 198 code commits, 41 review rounds; mean 5.0 h assigned to merged per lane.

## Gate wall times as stated (full verify runs)

| Lane | Stated run time |
|---|---|
| Lane 0 App | 2187 s old command, 2263 s verify.sh (plus a first run that failed on daemon memory) |
| ISO-R1 | 2982 s (49.7 min) |
| R34-BE | 2402 s (40.0 min) |
| FIX-BE | 54 min |
| FIX-APP-A | 36 min |
| TEST-SPEED-1 | 11 min (was 54) |
| TEST-SPEED-APP | about 11 min run, 22 min wall (waited for the BE gate on the Gradle lock) |
| BE-JDK21 | 10 min |
| R29b-1 | 12 min |
| FIX-APP-B1 | 8 min |

## The 5 biggest time sinks in the data (facts only)

1. **Review + fix rounds: 24.4 of 75.0 lane-hours (32%), the largest stage.** R34-BE took 3.5 h over 5 review rounds (3 rounds with a FIX verdict, 5 individual FIX verdicts, first review 10:54, last 14:14); FIX-BE 2.2 h over 5 rounds (4 with FIX, 5 individual FIX verdicts); FIX-APP-A 2.6 h over 3 rounds (4 individual FIX verdicts); FIX-APP-B1 2.6 h and BE-JDK21 2.3 h (2 rounds each, 1 FIX; both include a gap of about 1.5 h between the fix check ACCEPT and the final gate review files). Lane 0 BE and Lane 0 App each spent 2.3 h and 3 to 4 rounds.
2. **Gate + checks: 20.8 lane-hours (28%).** Stated full-run times were 54 min (FIX-BE), 49.7 min (ISO-R1), 40 min (R34-BE), 36 min (FIX-APP-A) and about 37 to 38 min each for the old command and verify.sh on Lane 0 App; after TEST-SPEED the stated runs are 8 to 12 min (BackEnd 54 to 11 min). The stage also holds waiting: DOCS-2a, DOCS-2b, BE-RUN-1 and BE-DOCS-1 spent 3.4, 3.4, 2.0 and 1.4 h between their last commit and a verdict that was written as a batch or after the next lane's gate; ISO-R1 spent 2.9 h (gate 49.7 min, lane-ready 11:55, verdict with Jabran's yes 14:01).
3. **Waiting for MERGE or for another lane's gate: 13.7 lane-hours (18%).** FIX-APP-B1 3.0 h and R29b-1 2.5 h from verdict to the 07:04 claims note (upper bounds; the verdicts were written 04:06 and 04:31); BE-DOCS-1 3.4 h and BE-RUN-1 3.2 h from verdict to the TEST-SPEED-1 merge at 03:37, because their `verify: OK` marker had to come from TEST-SPEED-1's full run.
4. **Build time before the first report: 16.2 lane-hours (22%).** FIX-APP-A 2.7 h (brief 14:12, report 16:55), FIX-APP-B1 2.0 h, FIX-BE 1.9 h, TEST-SPEED-1 1.9 h, TEST-SPEED-APP 1.8 h and ISO-R1 1.6 h; in FIX-BE, FIX-APP-A and the TEST-SPEED lanes the first code commit came 1.6 to 2.1 h after the brief (lump commits).
5. **Gates that failed or were abandoned before the final run.** Lane 0 App: 3 full runs (first failed on Gradle daemon memory; the two later runs were about 37 and 38 min); Lane 0 BE: verify.sh failed on `3caadc5` with 2 defects before passing on `5e00b13`, and the fix needed a third review round (03:26); BE-RUN-1: first gate failed on the flaky `SupplierBankEventsTest`, second stopped, no own marker; BE-DOCS-1 had no gate of its own; FIX-APP-B1 needed an Android compile fix at 02:01 after review 1.
