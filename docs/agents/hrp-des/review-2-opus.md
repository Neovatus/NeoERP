# HRP-DES review 2

Reviewer: Opus 5.5 (fresh, read-only)
Reviewed: 324f50de0ea6
Range: df07a02..324f50de0ea6 (branch base `bacf878`; origin/master is now `b6ccb08`, which adds only D-11/D-12 and a backlog row, nothing that touches HR or Payroll)
Verdict: **FIX**

This round checks only the fixes. All line numbers are in `docs/drafts/hr-payroll-design-refresh.md` unless another file
is named.

## Findings

1. **MAJOR: decision 13(a) and H1.7 leave H1 with no way to add an employee.** At :74 and :205-207 the draft says to
   delete hr-h1's quick-add panel and use the wizard. But the wizard is an H4 feature, and hr-h4 says it replaces the
   panel "**when H4 ships**". Its first two steps "are the quick add" (`hr-h4.md:88`). Between the H1 and H4 slices
   there would be no way to add an employee. With decision 2 hiding v1, that means none in dev at all.
   **Fix:** recommend that H1 keeps the quick-add panel, and the H4 wizard replaces it when H4 ships, as the approved
   G-4 text says. Alternatively, move the first wizard steps into H1, but name that as a scope move. Then delete only
   the stale O1 lead-decision line.

2. **MINOR: decision 5 (:175-178) does not tell Jabran it amends his approved scope.** H23.2 (:84) removes "multi-step
   approvals" from hr-h2-h3 §24's out-of-scope list, which Jabran approved at G-4. Decision 5 presents this only as
   following AL-D5. AL-D5 (`plan.md:42`) decides the relation step types and that HR supplies the people. It does not
   by itself decide multi-step HR chains in v2.
   **Fix:** add "amends hr-h2-h3 §24 (G-4)" to decision 5. Tone down "narrows AL-D5" to "keeps G-4's one-step scope".

3. **MINOR: H23.2 (:84) gives "bands" to every HR kind.** In the model, a kind without an amount (leave) has one band
   (`accounts-approval-limits.md:49`). **Fix:** say that bands apply only to kinds with an amount (encashment), and
   that the other kinds get up to three steps in one band.

4. **MINOR: X.17 (:60) treats cost centre as link-only without saying why.** Cost centre is not on the setup-data
   list (`UX-1 bb:274`), and Accounts quick-adds cost centres on its line pickers (bb:277-280). Rule 5 (bb:276) allows
   a "why not". **Fix:** state the reason in those terms: the value lives in accounts-service, and HR does not create
   Accounts records. Do not call it link-only setup data.

5. **MINOR: PY.10 (:117) is now stale.** It still says "With Sweden first (PY.2) this is on the critical path", but
   PY.2 now recommends keeping D1 if J-8 holds. **Fix:** make it conditional ("if Sweden moves earlier").

6. **MINOR: the X items are out of order.** X.15–X.17 sit between X.12 and X.13 (:50, :59-60). **Fix:** move them
   after X.14, or renumber.

## Checked correct

- **Finding 1 (AL-D16).**
  - PY.4 (:111) quotes AL-D16 correctly (`plan.md:45`; `backlog.md:369`) and notes that it replaces the "later" row
    (plan.md:69).
  - AL-D11 (:8), AL-D2 (:41, :55) and `PAY_MULTI_APPROVAL` (:21) are cited correctly.
  - Scope rule 4 is kept: contributors are excluded, which matches P0 PC-11 (`payroll-v2-p0.md:60`). `expectedStep`
    matches AL-D8.
  - Decision 6 now asks only two open points. Both are sound for Jabran: the amount basis, and Owner's own on a band
    with several steps.
  - The status line (:32-35) and "Not changed" (:214-216) are corrected.
- **Finding 2 (country order).**
  - PY.2 and decision 4 now name D1 (`HR-PAYROLL-LEAD-REVIEW.md:531-533, :565`) and J-8 (`payroll-v2-p1.md:880`).
  - They give PK's reasons (`target-countries.md:21-24`) and say the gap was accepted (`inbox/hr-payroll-lead.md:48`).
  - Options (a), (b) and (c) are set out, the recommendation depends on whether J-8 still holds, and the size is L.
  - This no longer overrides an approved decision.
- **Finding 3 (cipher).** H1.3 and decision 8 now match the source: file store for exports
  (`build.gradle.kts:35-36`), Tink for bank details (:38-39), and `infrastructure/crypto/BankDetailsCrypto.kt` exists.
- **Finding 4 (database roles).** X.2 is right: hr-service and payroll-service connect locally as the `neoerp`
  superuser (`application-local.properties:5` in both; `infra/compose.yml:22`). Only Accounts has a runtime role.
  ADR-026 M5 (:106-111), M2/R1 (:78-85, :127), R6 (:132), D8 (:165) and :52 are cited correctly.
- **Finding 5 (AL-D5).** H23.2 now cites AL-D5 (plan.md:42), AL-D1/D6 (:41, :54, :59), drift 15 (:34) and HR
  `APPROVAL_CHAINS` (:21). Size L.
- **Findings 6–16.**
  - Labels: X.4 (money), X.13, X.16, PY.7 and H23.8 are now critical. X.15 (formats) is non-critical.
  - Counts check out against the rows: 60 items, 24 critical (X 6, hr-h1 6, hr-h2-h3 3, hr-h4 1, payroll-p 7, ess 1).
  - No other row needs relabelling.
  - D7 is added to PY.3 (gap check :56). L17 and L18 are in X.3, and the risk-paths wording now names
    `configuration/security` (:87).
  - X.12 now covers push and RT-7 (backlog:351-352). X.16 cites ADR-019 D3 (:48, :121) and ADR-025 :54.
  - The ADR-023 bullet (:242-245) is added. X.17 cites `UX-1 bb:256-280` correctly.
  - Decisions 1–3 cite "target design first" (backlog:367-368), and decision 2 is tied to D9 with the menu change named.
  - X.1 now says hr-service V1–V9, and PA.1 notes V9. D-10 is shown as confirmed as a trial.
  - H4.4 says why its source wins. PY.6 and decision 10 say AC-IP is pending. X.13 cites accounts-roadmap.md:14.
- **Decision 13(b)** (H23.8 aligned to G-6) is sound.
- **Round 2 table.** All nine commit ids it names exist in the range.
- **No new contradiction with approved decisions,** apart from findings 1 and 2.
