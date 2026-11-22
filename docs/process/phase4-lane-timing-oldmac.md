# Phase 4 lane timing: old Mac (test Mac), MEASURE-1 back-fill

Written 2026-11-22 from the old-Mac lead transcript. Covers only work done on this Mac. The new Mac's builder, review and fix work for the same lanes is in `phase4-lane-timing-newmac.md`.

## Method and limits

- Source: the lead session transcript (JSONL), timestamps in UTC converted to Europe/Oslo (CET = UTC+1). Times below are Oslo time, rounded to 0.1 minute.
- Agent minutes and tokens come from the `<usage>` block of each task-notification. A notification's `duration_ms` is wall time since that agent was spawned (or since it was last woken by a message), so it includes time the agent waited on its own background tests. It is not pure working time.
- Tokens: a woken agent reports its running total, so the latest figure is used, never a sum of figures.
- Gate runs: wall minutes come from the `exit=N wall=M min` line the lead printed. Where the line says "incl. lock wait" the gate queued behind another Gradle job first; the net run is then derived from timestamps and marked "derived".
- Simulator checks driven by the lead: first to last simulator tool call for that lane. Agent-driven: agent duration.
- Buckets overlap in real time (parallel reviewers, builds during simulator checks), so the sum of a lane's buckets is machine-minutes, not elapsed time.
- Lead bucket: the transcript shows lane-ready arrival, verdict and merge times, but not what the lead did every minute. The gross interval is given instead of a residual, and the part spent waiting for Jabran's MERGE is split out. A residual is unknown.
- Shared agents (the two Fable reviews cover both TEST-SPEED lanes) are listed once under "TEST-SPEED shared" and not split.
- BE-RUN-1 and BE-DOCS-1 were merged inside TEST-SPEED-1's range and gate. No separate agent or gate ran for them here; their pre-existing reviews ran on the new Mac.
- Not in the transcript (unknown): active time of the lead's own tool calls, the idle part of each agent's duration, and final durations of two agents the lead stopped with TaskStop (Sonnet B1 review 2 second run, Sonnet B1 Android compile fix: the last seen figure is used and marked "at least").
- Many "Background command ... completed" notices between 00:14 and 01:12 (targeted tests, self-tests, mutation runs, regression runs) belong to the fix and review agents. They are inside those agents' durations and not counted again.

## Lane timestamps (Oslo)

| Lane | Lane-ready seen | Verdict written | Merged | Verdict to merge |
|---|---|---|---|---|
| TEST-SPEED-1 (+BE-RUN-1, BE-DOCS-1) | 00:05:57 | 02:08:26 | 02:36:04 | 27.6 min (waiting for Jabran) |
| TEST-SPEED-APP | 00:05:57 (branch pushed 23:57) | 02:28:50 | 02:36:04 | 7.2 min (waiting for Jabran) |
| BE-JDK21 | 00:21:10 | 02:49:54 | 02:50:45 | 0.9 min |
| FIX-APP-B1 | 00:05:57 | 03:06:29 | 06:03:15 | 176.8 min (waiting for Jabran) |
| R29b-1 | 03:18:28 | 03:31:03 | 06:03:15 | 152.2 min (waiting for Jabran) |
| FIX-APP-B2 part a | 03:22:02 | 06:40:14 | 06:47:36 | 7.4 min (standing merge) |

Gross lane-ready to verdict: TEST-SPEED-1 122.5 min, TEST-SPEED-APP 142.9, BE-JDK21 148.7, FIX-APP-B1 180.5, R29b-1 12.6, FIX-APP-B2a 198.2 (of which 156 min, 03:27:52 to 06:04:17, blocked until FIX-APP-B1 merged because B2a sits on B1's branch).

## TEST-SPEED-1 (carries BE-RUN-1 and BE-DOCS-1)

| Bucket | Item | Minutes | Tokens | Note |
|---|---|---|---|---|
| Review | Opus review 1 | 16.1 | 166836 | spawned 00:08:48; verdict FIX (1 HIGH, 1 MEDIUM, 4 LOW) |
| Review | Opus fix check round 2 | 10.3 | | spawned 01:08:17, ACCEPT |
| Review | Opus woken to check BE-RUN-1+BE-DOCS-1 and write gate-format file | 1.2 | 141260 total for this agent | 01:51 |
| Review | Fable shared with TEST-SPEED-APP | see shared table | | |
| Rework | Opus fix builder ("review fixes") | 37.8 | 252710 | 00:30:03 to 01:08:03, 67 tool uses |
| Test | Gate attempt 1 | 12 | | exit=1, 4320 tests, 0 failed; no marker (review files not in gate format) |
| Test | Gate attempt 2 | 11 | | exit=0, 4320 tests, 0 failed, verify OK |
| Lead | Gross lane-ready to verdict | 122.5 | | residual unknown |
| Lead | Verdict to merge | 27.6 | | waiting for Jabran |

Own totals: review 27.6, test 23, rework 37.8, tokens 560806.

## TEST-SPEED-APP

| Bucket | Item | Minutes | Tokens | Note |
|---|---|---|---|---|
| Review | Opus review 1 | 13.9 | 174984 | spawned 00:09:00; ACCEPT with 6 LOW |
| Review | Opus woken: fix-range check and gate-format file | 4.3 | 206108 total for this agent | 01:51:53, ACCEPT with 3 LOW |
| Review | Fable shared with TEST-SPEED-1 | see shared table | | |
| Rework | Opus fix builder ("review fixes") | 20.7 | 245711 | 00:30:14 to 00:50:54, 66 tool uses |
| Test | Gate (one run) | 22 wall, about 11 net (derived) | | exit=0, 3905 tests, 0 failed; wall includes about 11 min waiting for the BackEnd gate's lock |
| Test | Size-shot comparison, 1 fork vs 3 | 4.4 | | Gradle 4m24s; 1786 screenshots identical (closed Fable item B6) |
| Lead | Gross lane-ready to verdict | 142.9 | | residual unknown |
| Lead | Verdict to merge | 7.2 | | waiting for Jabran |

Own totals: review 18.2, test about 15.4 (derived; 26.4 wall), rework 20.7, tokens 451819.

## TEST-SPEED shared (Fable, both speed lanes)

| Item | Minutes | Tokens | Note |
|---|---|---|---|
| Fable gate security review | 19.3 | 268204 | spawned 00:09:13; FIX on both lanes |
| Fable fix check round 2 | 28.8 | | spawned 01:08:29; ACCEPT on both |
| Fable woken for gate-format files | 3.8 | 293999 total for this agent | 01:51 |

Shared totals: review 51.8, tokens 562203.

## BE-JDK21

| Bucket | Item | Minutes | Tokens | Note |
|---|---|---|---|---|
| Review | Opus review 1 | 8.7 | 140359 | spawned 00:21:35; FIX (1 MEDIUM, 5 LOW) |
| Review | Sonnet review 2 | 6.9 | | spawned 00:21:45; ACCEPT |
| Review | Sonnet woken twice (post-fix check, move reviewed sha) | 1.2 | 169989 total for this agent | 02:29 and 02:32 |
| Review | Opus fix check round 2 | 8.5 | | spawned 01:20:34; ACCEPT |
| Review | Opus woken for gate-format file | 2.2 | 123914 total for this agent | 02:29 |
| Rework | Opus fix builder ("review fixes") | 11.3 | 153619 | spawned 01:08:53 |
| Test | Gate | 10 | | exit=0, 4332 tests, 0 failed, money invariants OK, reviews OK |
| Test | Jar-mode stack on Java 21, attempt 1 | 0.7 | | failed: accounts-service did not start (bank key file not found from the worktree) |
| Test | Jar-mode stack, attempt 2 | about 1 (derived) | | started 02:49:13 with the checkout's key file path, all 8 services healthy |
| Lead | Gross lane-ready to verdict | 148.7 | | includes rebase onto TEST-SPEED-1's final head and a second push; residual unknown |
| Lead | Verdict to merge | 0.9 | | |

Own totals: review 27.5, test about 11.7 (derived), rework 11.3, tokens 587881. Compiles and about 30 targeted tests on Temurin 21.0.13 were run by the fix and check agents, inside their durations.

## FIX-APP-B1

| Bucket | Item | Minutes | Tokens | Note |
|---|---|---|---|---|
| Review | Opus review 1 | 9.8 | 239739 | spawned 00:10:07; FIX (2 MEDIUM, 4 LOW) |
| Review | Opus fix check round 2 | 7.6 | | spawned 01:02:08; ACCEPT |
| Review | Opus woken after rebase for gate-format file | 5.9 | 196522 total for this agent | 02:36 |
| Review | Sonnet review 2 (amounts focus) | 8.8 | | spawned 00:10:16; ACCEPT |
| Review | Sonnet woken for money check and gate-format file | 5.1 (at least) | 179272 total for this agent | 02:36:48, stopped by lead 02:41:56 |
| Rework | Opus fix builder (review-1 fixes) | 32.6 | 262694 | 00:20:48 to 00:53:22, 81 tool uses |
| Rework | Sonnet "Android compile fix" | 8.2 (at least) | 75230 | spawned 00:53:41; Android compile had broken after the fixes |
| Test | iOS simulator compile (4 GB heap) | 1.3 | | BUILD SUCCESSFUL, Gradle 1m15s |
| Test | Gate attempt 1 | 5 wall incl. lock wait, about 1 net (derived) | | exit=1, "gradle exited 143", 0 tests run |
| Test | Gate attempt 2 | 8 | | exit=0, 3921 tests, 0 failed |
| Test | iOS build plus simulator checks C1 to C9, lead-driven | 7.3 | | 02:58:44 to 03:06:03 (build 3.7 of it), iPhone then iPad, passed |
| Lead | Gross lane-ready to verdict | 180.5 | | |
| Lead | Verdict to merge | 176.8 | | waiting for Jabran |

Own totals: review 37.2, test 17.7 (1.3 + 1.1 + 8 + 7.3), rework 40.8, tokens 953457.

## R29b-1 (BackEnd, org-service company-scope split)

| Bucket | Item | Minutes | Tokens | Note |
|---|---|---|---|---|
| Review | none run here | 0 | 0 | its Opus and Fable reviews and two fix rounds ran on the new Mac |
| Rework | none | 0 | 0 | |
| Test | Gate | 12 | | exit=0, 4438 tests (106 new), 0 failed, money invariants OK, reviews OK |
| Lead | Gross lane-ready to verdict | 12.6 | | equals the gate |
| Lead | Verdict to merge | 152.2 | | waiting for Jabran |

Own totals: review 0, test 12, rework 0, tokens 0.

## FIX-APP-B2 part a

| Bucket | Item | Minutes | Tokens | Note |
|---|---|---|---|---|
| Review | none run here | 0 | 0 | its Opus and Sonnet ACCEPT reviews came from the new Mac |
| Rework | none | 0 | 0 | |
| Test | iOS + Android compile, attempt 1 | 2.1 | | failed: Java heap space (default heap) |
| Test | iOS then Android compile, 6 GB heap | 3.3 | | both BUILD SUCCESSFUL; wrapper default raised to 6 GB |
| Test | Gate attempt 1 | 11 | | exit=2, 3959 tests, 0 failed; no marker because the lead left out `--reviews` |
| Test | Gate attempt 2 | 9 | | exit=0, 3959 tests, 0 failed, reviews OK |
| Test | Jar-mode stack restart on new BackEnd head | about 3 (derived) | | started 06:25:34, up by 06:28:55, overlapped the iOS build |
| Test | iOS debug build | 3.2 | | 06:25:38 to 06:28:48 |
| Test | Simulator S1, S4 start, lead-driven | 1.1 | | 06:28:58 to 06:30:04, then handed to testers |
| Test | Simulator agents (Sonnet, parallel) | 3.8 + 6.6 + 7.9 = 18.3 agent min, 8.2 wall | 956036 | S1/S4 iPhone 171372 tokens; S7/S2/S3 iPads 414030; S8 iPad Pro 11 370634 |
| Lead | Gross lane-ready to verdict | 198.2 | | 156 min blocked until FIX-APP-B1 merged |
| Lead | Verdict to merge | 7.4 | | standing merge |

Own totals: review 0, test about 36.3 machine-min (compile 5.4, gates 20, iOS build 3.2, simulator lead 1.1, simulator agents 8.2 wall; stack restart overlaps the build and is excluded), rework 0, tokens 956036.

## Summary

| Lane | Review min | Test min | Rework min | Sub-agent tokens |
|---|---|---|---|---|
| TEST-SPEED-1 (+BE-RUN-1, BE-DOCS-1) | 27.6 | 23 | 37.8 | 560806 |
| TEST-SPEED-APP | 18.2 | about 15.4 (26.4 wall) | 20.7 | 451819 |
| TEST-SPEED shared (Fable) | 51.8 | 0 | 0 | 562203 |
| BE-JDK21 | 27.5 | about 11.7 | 11.3 | 587881 |
| FIX-APP-B1 | 37.2 | 17.7 | 40.8 | 953457 |
| R29b-1 | 0 | 12 | 0 | 0 |
| FIX-APP-B2 part a | 0 | about 36.3 | 0 | 956036 |
| Total | 162.3 | about 116 | 110.6 | 4072202 |

Rework here was not rare: five fix builders ran on this Mac (TEST-SPEED-1, TEST-SPEED-APP, BE-JDK21, FIX-APP-B1, FIX-APP-B1 Android compile). They are listed as Rework because the transcript labels them "review fixes".

Waiting for Jabran's MERGE (verdict to merge) totals 372.1 min across the six lanes; these overlap in real time.

## Gate reruns and causes

| Lane | Attempt | Wall | Result | Why the rerun |
|---|---|---|---|---|
| TEST-SPEED-1 | 1 | 12 min | exit=1, tests all passed | Review files lacked the gate header lines, so no marker was written. The reviewers were messaged to write gate-format files; rerun passed (11 min). |
| FIX-APP-B1 | 1 | 5 min incl. lock wait | exit=1, gradle exited 143, 0 tests | The Gradle process was killed. Probable cause (the transcript does not state it): the lead's `kill` of all `java .*-jar` processes at 02:48:38, run while the jar stack was being checked. Rerun passed (8 min). |
| FIX-APP-B2 part a | 1 | 11 min | exit=2, 3959 tests, 0 failed | The lead left out `--reviews`, so a RISK range got no marker. Rerun with the flag passed (9 min). |

Other repeats that were not gate runs: B2a compile attempt 1 ran out of heap (rerun at 6 GB); BE-JDK21 jar-stack start 1 failed on the bank key file path (restarted with the checkout's path); BE-JDK21 and TEST-SPEED-APP and FIX-APP-B1 reviewers were each woken one to three extra times to write gate-format files or move the reviewed sha. Their minutes are in the Review rows above. No gate attempt failed on a test.
