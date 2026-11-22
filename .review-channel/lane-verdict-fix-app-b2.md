# Lane verdict: FIX-APP-B2 part a (Journals and recurring) — 2026-11-22

**Verdict: MERGE** (old-Mac lead, test Mac). Needs Jabran's MERGE before the fast-forward of App `phase/4` `e1bc2e1e` → `f7c993f4` (branch `phase/4-b2-fix-app-b2-r`).
- Fast-forward possible (lane sits on `e1bc2e1e`, now App `phase/4`); scope as briefed (R01, R02 tests, R16, R18, R19 App, R21 + Delete draft D-27, R23, R25, R31 a/b = roadmap 4.10) plus the review fixes; no AI attribution.
- Reviews: Opus + Sonnet, each FIX in round 1, both ACCEPT after 2 fix rounds; final gate files written by the reviewers; REVIEWS OK.
- **Full gate (old Mac):** `verify: OK`, 9 min, 3959 tests (+38), 0 failed, 0 skipped.
- **Simulator checks** (local stack BE `64509abe` jar mode on Java 21; three Sonnet testers in parallel, one per simulator):

| Check | Device / user | Result |
|---|---|---|
| S1 R01 blank-amount Draft recurring journal | iPhone 18 Pro, Anna | 5/5 PASS (toast "Saved / Next journal on 1 Dec 2026.": English date format, steps were written in nb) |
| S2 R02 one-tap Save, Earlier imports | iPad mini, Bjørn | 4/4 PASS; not reproduced. Gap: the simulator had a hardware keyboard, so "keyboard up" was only field focus |
| S3 R31a Automatic reversals tab | iPad Pro 13 landscape (signed in as Ola, Owner) | 9 PASS, S3.3 data missing (no posted reversal); pending one was JV-2026-000001, now cancelled |
| S4 R31b/R25/R19 notice and counts | iPhone 18 Pro, Anna | data missing: "A4T Old fee" ended normally, needs no one, so no notice/tag to see |
| S5 R16, S6 R23 | two devices each | not run: deferred to the retest round (S6 switches a company feature off) |
| S7 R18 Period close links | iPad mini, Bjørn | 3/3 PASS |
| S8 R21 Delete draft (invoice, credit note, bill, debit note, journal) | iPad Pro 11, Omar | all PASS; unsaved new document has no ⋯ |

- For the retest round: S4 needs data (an ended recurring journal with a skipped date); S5, S6; S2 with the soft keyboard showing; S3.3 needs a posted automatic reversal. Tester note to confirm there: on Omar's invoice/bill/note lists no draft was found to reopen (list code has a Draft status, likely a tab the tester missed); S2 Waiting to post needed a memo before Save enabled (as designed, step text omitted it).
- Local data created by the testers: recurring journals "A4T Insurance 2", "A4T-R02", "A4T-R02b" (Kystgruppe Nordic); Omar's five drafts were created and deleted.

## Timeline (old Mac, MEASURE-1)
- Gate 1: 11 min, tests passed but no marker (lead slip: `--reviews` not passed). Gate 2: 9 min, OK.
- Simulator set-up (stack restart on `64509abe`, iOS build, sessions): ~10 min. Checks in parallel: S1/S4 3.8 min (171k tokens), S7/S2/S3 6.6 min (414k), S8 7.9 min (371k), all Sonnet.
- Verdict written 2026-11-22 ~08:00 Europe/Oslo; MERGE asked at the same time.
