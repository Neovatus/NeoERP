# Lane ready: AL-REST-BE (approval limits for payments and refunds, Owner's own switch, self-approval report) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-al-rest-be-r3`, pushed, head `6d948693`, on BE `phase/4` `df80e554`.
- The rebase from `095a8989` kept all 25 code commits `=`.
- The base move also touched `TenantRepositoryArchitectureTest.kt` and `db-design.md`. Git merged both cleanly, and the
  two re-stamp seats checked the merged hunks: both sides are kept.
- `:architecture-tests` on the new head: 90/0.
**Brief:** `docs/agents/al-rest/brief-be.md`. Approved by Jabran 2026-11-22 ("od oa as recommended").
**Lead decisions:** D-39, which includes **Jabran's two money answers**.
**Builder:** Opus 5.5. Report: `docs/agents/al-rest/builder-report-be.md`, with the API table, "Fix round 1" and the
self-check.
**Money / segregation-of-duties lane: RISK, tier 2.**
- Round 1: Opus and Fable both asked for fixes (0 HIGH).
- Both accept after one fix round.
- Re-stamps after the base move are by two Opus seats (D-43).

## Review files (gate format; the gate reads these two)
- `docs/agents/al-rest/review-5-opus.md` (Opus 5.5) and `review-6-opus-sec.md` (Opus 5.5 security, D-43).
- Both: ACCEPT, Reviewed `78bd5d32`, Range `df80e554..78bd5d32`.
- `risk-check.sh --reviews`: **REVIEWS OK**.
- History:
  - `review-1-opus.md`: FIX, 1 MEDIUM and 4 LOW.
  - `review-2-fable.md`: FIX, 1 MEDIUM and 6 LOW.
  - `review-3-opus.md` and `review-4-fable.md`: ACCEPT on `dc7c481a`.

## What it does (BE-1 to BE-12)
- **V79** (it was V77 and was renumbered after AC418-BE's V78). It widens document approvals to payments and refunds
  and adds the Owner's own switch. It changes no applied migration.
- **Payments and refunds** have earlier steps (`actions.approveStep`) and a last step under the limits:
  - One person cannot create and decide an over-limit item. Fable found no path through earlier steps, the last step,
    a stand-in, the Owner's own switch, a role change or a snapshot.
  - A multi-step approve needs `expectedStep`; without it the answer is 400.
  - A payee change during approval cancels the approval (`PAYEE_CHANGED_DURING_APPROVAL`).
- **Owner's own switch** for journals, payments and refunds. Jabran's rules:
  - A lone switch-on is allowed only when no other person holds `APPROVAL_LIMIT.CONFIRM`. It is recorded as an
    `OWNER_SWITCH_ON` report row and in the CONFIRM audit.
  - On a kind with no limits, the switch does not change who decides; branch approvers stay.
- **New endpoints:** `GET /payments/summary` and `GET /refunds/summary`, the step endpoints, and the self-approval
  report and CSV (OD-3; scoped to the company).
- `confirmedByUserId` per kind (BE-10) and the decide-roles read (BE-9, user-service).

## Tests (on this Mac)
- **Builder, fix round, full suites:**
  - accounts-service 2211/0
  - user-service 690/0
  - `:architecture-tests` 84/0
- **Old FAIL / new PASS:**
  - 12 new tests failed on a throwaway tree with the fixes removed.
  - Over-limit payment and refund post on `409f45e5` and are refused on the lane.
- **Opus fix check:** accounts 137 in 27 classes, arch 84, 0 failed.
- **After the rebase:** `:architecture-tests` 90/0 (lead).
- **Not run here:** the whole BE suite, `scripts/money-invariants.sh` (it needs the stack), the jar-mode start.

## For the old Mac
1. Check the review files.
2. Run `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/al-rest/review-5-opus.md docs/agents/al-rest/review-6-opus-sec.md` (no wrapper, Docker up). Then run the money invariants.
3. Jar-mode start: 8 healthy.
4. Verdict; merge under the standing merge.
   - Merge it **before AL-REST-APP**: the App sends `expectedStep` and reads the new fields.
   - The simulator check is the combined session, `.review-channel/sim-steps-al-rest-and-switch.md` Part A.

## Docs pages
- **Developer:**
  - `docs/api/accounts-approval-limits.md` (§10.3–10.7, §11, the switch and report contract)
  - `docs/database/db-design.md` (V79)
  - `docs/modules/accounts/` approval-limits pages listed in the report
- **User guide:** in the App lane.

## Follow-up rows
- The snapshot stores the document currency next to `amount_base`, and foreign-currency payments are untested (V31 is
  single-currency). Both go to the multi-currency lane (Opus LOW 2, Fable F3).
- "One company switch" means three proposals; the App lane sends all three (Fable F6, done in AL-REST-APP).
- The F5 test counts the step row in the table rather than calling the report, and the report shows an empty reference
  once a draft is deleted (Fable LOW).
- A local database that applied the lane's old V77 needs a local undo. None did on this Mac.

## Timeline (new Mac; Europe/Oslo; L37 style B)
- **Assigned:** old-Mac TASK "AL-REST-BE and AL-REST-APP". Brief note at about 08:40; lane-ready at 16:55.
- **Build:** about 1 h 53 m (6,796 s, 12 items), plus the parallel BE-10/11/12 fork.
- **Rework:** about 64 m (fix round 1, including the rebase, the V79 renumbering and the full suites).
- **Review:**
  - Round 1: Opus 10 m, Fable 8 m.
  - Fix checks: Opus 7 m, Fable 3.5 m.
  - Re-stamps: 2 m.
- **Test:** inside the build and rework; the full suites ran in the rework.
- **Waiting:**
  - for R29b-2 (BE-9's resolver)
  - for Jabran's two money answers
  - in the merge queue behind R29b-5, OUTBOX-CLAIM-BE and RISK-NARROW-BE
  - two rebases
- **Size:** 97 files changed (+5,647 / −182). 12 items. 1 fix round. 0 fix-caused findings. 3 rows.
- **Tokens:**
  - builder about 750 k (+ fork)
  - Opus about 350 k
  - Fable about 410 k (round 1 + fix check)
  - re-stamp seats about 140 k
