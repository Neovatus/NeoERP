# Lane ready: AL-REST-APP (approval steps on journals, payments and refunds; Owner switch; self-approval report; S6) — 2026-11-22

**Repo / branch:** `NeoERP-App`, `phase/4-b2-al-rest-app`, pushed, head `4da0be01`. It sits on App `phase/4` `430bc5ab`.
**Rebase pending:** AC418-APP has merged, so `phase/4` is now `267270de`. The lead rebases the lane once, when the old
Mac rings for its turn; the re-stamps follow D-46 review tiers.
**Merge order:** after AL-REST-BE. The App calls AL-REST-BE's new endpoints and the V79 rules.
**Brief:** `docs/agents/al-rest/brief-app.md`, including the lead note: the API table OK'd, V79, Jabran's rules.
Approved by Jabran 2026-11-22 (OD/OA "as recommended"). Lead decisions: D-48, with Jabran's three design answers.
**Builder:** Opus 5.5, default effort. Report: `docs/agents/al-rest/builder-report-app.md`, including the self-check
table and "Fix round 1".
**Money-display lane.** The range touches the Accounts data layer, so it is RISK and needs two gate files until GATE-3.
Reviews: Opus (whole diff and component API) and Sonnet (money display and locale). Both said FIX in round 1 and both
accept after one fix round. Each re-checked only its own findings (D-46).

## Review files (gate format; the gate reads these two)
- `docs/agents/al-rest/review-app-3-opus.md` (Opus 5.5) and `review-app-4-sonnet.md` (Sonnet 5.5).
- Both say Verdict ACCEPT, Reviewed `2c7e1fd4`, Range `430bc5ab..2c7e1fd4`.
- The one commit after `2c7e1fd4` holds only these two files.
- `risk-check.sh --reviews` on this Mac: **REVIEWS OK**.
- History: `review-app-1-opus.md` (FIX, 2 MEDIUM and 4 LOW) and `review-app-2-sonnet.md` (FIX, 2 MEDIUM and 8 LOW).

## What it does (APP-1 to APP-12)
- **Approval steps** on journals, supplier payments and customer refunds, through the shared `NeoApprovalSteps` card
  in `designsystem/components` (OA-1; HR reuses it).
  - The card shows who approved, who is next, and approve-my-step; otherwise a line says why the person cannot.
  - The last step posts. **`expectedStep` is now sent**, which closes the escaped-defects row APP-3.
  - An unclear write re-reads the item before deciding and never approves twice. A raced decision (AC-8) re-reads and
    says who decided.
- **"1 of 2 approved" tag** on journals, payments and refunds. On narrow phones it sits on its own line (Jabran).
  "Why 2 approvals?" is on all three.
- **Waiting for you:**
  - The stand-in count is in its header; the badge tooltip is unchanged (Jabran).
  - The payments badge reads `/payments/summary`.
- **Owner's own:**
  - The switch is one company switch that sends three proposals, one per kind. On a partial failure the screen
    re-reads and names the kind that failed.
  - `OWNER_OWN_NOT_ALLOWED` has words on every Owner's-own action, including one-step items.
- **Self-approval report:** a fourth tab of Approval limits, labelled "Owner's decisions" (Jabran). It has a kind
  filter, a date filter, words for every row kind, the currency on amounts, a reason that is never cut, and CSV export.
- **Limits:**
  - It uses `confirmedByUserId`; the History read fallback is gone.
  - The editor lists roles without `IAM.ROLE.READ`.
- **S6 click-through:** `docs/agents/al-rest/test-steps.md`. It covers sign-in and numbered clicks with Expected per
  step for: journal 2 steps, payment 3 steps with stand-in, refund payee change, keep-later-step, Owner switch, the
  report, and the NO + PK companies.

## Tests on this Mac (App lock; JVM, iOS and Android compiles)
- **Builder, before hand-back:** every size-test class (device matrix, 320 pt, font 130 %), the whole
  `features.accounts.*` package, i18n (en/nb/sv/da), `BuildingBlockChecksTest` and `buildrules.*`: **2,350 tests, 0
  failed**. The JVM, iOS and Android compiles pass.
- **Old FAIL / new PASS:** `AlRestOldFailTest` fails 3 times on the base. In the fix round, 9 more tests failed on
  `bb2aa051` and pass now.
- **Opus re-runs:** round 1, 52 tests / 0 failed; re-check, 61 tests / 0 failed.
- **Not run here:** the whole `:composeApp:jvmTest`, `verify.sh`, the simulator.

## For the old Mac (test Mac)
1. Check the review files. Merge AL-REST-BE first.
2. Rebase on your ring, then run:
   `scripts/verify.sh --range origin/phase/4..HEAD --reviews <the files after the re-stamp>` (no `lockf` wrapper).
3. Simulator: the S6 steps in `docs/agents/al-rest/test-steps.md`, with the backend from AL-REST-BE.
4. Verdict; merge under the standing merge.

## Docs pages
- **User guide:** new `docs/user-guide/accounts/approval-limits.md`; amended `journals.md`, `refunds-and-write-offs.md`
  and the Accounts README. There is no payments page: the user guide has no supplier-payments page yet (a row).
- **Developer:** new `docs/modules/accounts/approval-limits.md`; amended `journal-screens.md`.
- **Design:** spec §4.5–§4.7 lines and the rig updated for Jabran's three answers.

## Follow-up rows
- English "Step N is for a {role}" gives "a Accountant" for roles starting with a vowel; reword it to "for the role
  {role}" (Opus LOW 7, Sonnet N1).
- A date that does not read in the report filter is dropped from the CSV, so the file can be wider than the table
  (Sonnet N2).
- A user-guide page for supplier payments.
- From AL-REST-BE: snapshot currency and foreign-currency payments (multi-currency lane).

## Timeline (new Mac; Europe/Oslo; agent times from task notifications; L37 style B)
- **Assigned:** the old-Mac TASK "AL-REST-BE and AL-REST-APP". The brief and lead note were written at 13:12, once the
  API table was OK'd. Lane-ready at 15:10; wall time about 2 h.
- **Build:** 71 m (12 rows, including its final full run).
- **Rework:** 31 m (fix round 1, including the final full run).
- **Review:** Opus 7.5 m + 2.5 m; Sonnet 5.2 m + 1.1 m. About 16 m; the two ran in parallel.
- **Test:** inside the build, the rework and the Opus runs.
- **Waiting:** about 3 m (Jabran's three answers came right after round 1). The App rebase comes later, on the old
  Mac's ring.
- **Size:** 114 files changed (+5,696 / −168), 12 items, 1 fix round, 0 fix-caused findings above LOW, 4 rows.
- **Tokens:** builder about 900 k; Opus about 270 k; Sonnet about 276 k.
