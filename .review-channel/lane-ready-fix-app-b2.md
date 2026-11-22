# Lane ready: FIX-APP-B2 part a (Journals and recurring) — 2026-11-22

**Repo / branch:** `NeoERP-App`, `phase/4-b2-fix-app-b2-r` (pushed, head `f7c993f4`, on FIX-APP-B1 `phase/4-b2-fix-app-b1-r`
`e1bc2e1e`; B1 has verdict MERGE and waits for Jabran's MERGE). When B1 merges, the lead rebases this lane onto
App `phase/4` if the merge does not keep `e1bc2e1e` as an ancestor. Built and reviewed on the **builder Mac**: JVM
targeted tests and the iOS compile only.
**Brief:** `docs/agents/fix-app-b2/brief.md` (approved by Jabran 2026-11-21 and 2026-11-22; assigned by the old Mac, inbox
"App B2"). **Builder:** Opus 5.5 high. Report: `docs/agents/fix-app-b2/builder-report.md`, with review rounds 1 and 2.
**Reviews (this Mac):** Opus fresh + Sonnet (amount display, posting-related screens, locale). Each said FIX in round 1,
and both accept after 2 fix rounds. Lead decisions D-27 (R21 Delete draft in the editor's ⋯), D-28, D-30.
The range touches recurring-journal screen paths: **RISK**.

## Review files (the gate reads the final two)
- Final, in gate format: `docs/agents/fix-app-b2/review-final-1-opus.md`, `review-final-2-sonnet.md`
  (Range `e1bc2e1e..e70ad394`, Reviewed `e70ad394`; the one commit after it is review files only). `risk-check.sh
  --reviews` on this Mac: REVIEWS OK.
- History: `review-1-opus.md` (FIX 0H/2M/8L, re-run), `review-2-sonnet.md` (FIX 0H/1M/7L), `review-3-opus-fixcheck.md`
  (ACCEPT, re-run), `review-4-sonnet-fixcheck.md` (FIX: new N1 MEDIUM), `review-5-sonnet-fixcheck2.md` (ACCEPT).

## Rows
R31 (a) Automatic reversals tab, R31 (b) Journals notice, R31 docs, R21 (reopened-draft totals; Delete draft in the
five editors' ⋯), R01, R18, R19 App, R25 G44, R16/R23: done. R02: not reproduced on the JVM (simulator check S2).
The invoice, credit note and debit note footers now fold into ⋯ on a tight footer, as the bill's already did. Wide
footers are unchanged (test `wideDocumentFootersAreUnchanged`).

## Tests on this Mac
- Builder, last full targeted run (round 1): 197 tests, 0 failed; `A4ScreenSizeTest.autoReversal*` passed; iOS compile 0 errors.
- Opus re-runs: 153/0 on `358d944c` (rebased head, plus the iOS compile, 0 errors); 62/0 on the fix range `5bd38d06`.
- Round 2 (`e70ad394`): the changed class 8/0 (1 FAIL with the fix reverted); JVM compile. No iOS compile after
  round 2 (a one-line commonMain change): **the gate's iOS compile covers it.**
- Not run here: the whole `:composeApp:jvmTest`, `verify.sh`, the simulator.

## For the old Mac (test Mac)
1. Check the two final review files.
2. `scripts/verify.sh --range <base>..HEAD --reviews docs/agents/fix-app-b2/review-final-1-opus.md docs/agents/fix-app-b2/review-final-2-sonnet.md`
   (base `e1bc2e1e`, or App `phase/4` once B1 has merged and the lane is rebased).
3. Simulator checks S1–S8 in the builder report "Simulator checks for the old Mac" (numbered, Expected per step):
   S1 R01, S2 R02, S3 reversals tab, S4 notice and counts, S5 R16, S6 R23, S7 R18, S8 R21 Delete draft.
4. Verdict; merge after Jabran's MERGE.

## Docs pages
User guide: `docs/user-guide/accounts/automatic-reversals.md`, `journals.md`, `recurring-journals.md` ("not built
yet" removed), and `docs/user-guide/tools/phase4-shots.json`. Developer: `docs/modules/accounts/automatic-reversals.md`,
`journal-screens.md`, `recurring-journals.md`. Design: `docs/design/specs/accounts-a4.md` §3/§4.1 "As built" notes
(JABRAN-TODO N8).

## Follow-up rows (for part b, `phase/4-b2-fix-app-b2b`)
- Sonnet N2: on `VERSION_CONFLICT` a delete hides Delete draft until the editor is reopened. Re-read the draft and
  keep offering it (fails safe today).

## For Jabran
1. Verdict after the old Mac's gate and simulator checks. The lead's call: **MERGE** if both pass.
2. N8 in JABRAN-TODO: the "As built" design notes (OK, or ask for a change; no rush).
