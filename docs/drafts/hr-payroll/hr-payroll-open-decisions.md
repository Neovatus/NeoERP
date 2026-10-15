# HR & Payroll — decisions (workspace copy)

Owner: Code · HR & Payroll lead (trial). The full history (D1–D8, J-1…J-9) is in the project copy `claude/hr-payroll-open-decisions.md`; this workspace copy holds the lead decisions from the trial onwards until the two are merged. Newest at the top.

## 2026-10-13 · HR & Payroll lead (Code, trial)

| # | Decision | Written in |
|---|---|---|
| L-10 | P1-7 stands: outside dev/demo, runs on UNCHECKED rules are parallel-only until the J-8 sign-off; the PS-4 "rules not verified" flag informs only. | P1 Q15 |
| L-11 | Mark as paid is one-way; no same-day undo; only a correction run changes it (PR-2). | P3 P3-12, Q20 |
| L-12 | Confidential pay group: `PAYROLL.CONFIDENTIAL.READ`, default Owner + Payroll Approver; opening amounts is a logged sensitive read (PS-7). | P0 §6.2, P1 P1-37 |
| L-13 | Org facts back-dated (ORG-FACTS-2 Q8): calculated runs go stale (`ORG_FACTS`); approved/posted/paid runs get a correction flag, never changed. | P1 P1-38, P3, P4 |

## 2026-10-10 · HR & Payroll lead (Code, trial)

| # | Decision | Written in |
|---|---|---|
| L-1 | Owner's-own count (payroll run and own-pay changes) excludes **only the Owner**; contributors and everyone else count; both PAYROLL.RUN.CALCULATE and APPROVE; fails closed (503). Asked of Accounts for A5 (HRP-19). | P0 PC-11/§4.8, P1 P1-29, P2 P2-10, P3 P3-30, scope rule 4, payroll-p §6.3 |
| L-2 | A run the Owner calculated while another payroll person exists can't be approved by the Owner as Owner's own; it needs another approver or a new run calculated by the other person. | P0 PC-11 (open-point text to confirm in cross-check) |
| L-3 | PS-1: nobody changes their own pay (`PAYROLL_OWN_PAY_CHANGE`); a single-person company uses Owner's own with a reason. | P1 P1-29, payroll-p §8 |
| L-4 | PS-2: NO without a tax card → 50 % withholding and a warning, not a blocked run (source to verify). | P1 P1-30, payroll-p §6.1 |
| L-5 | PR-1: the bank-change requester can't make or download a bank file holding that employee; a waiting bank change pays nothing to the new account; Owner's own only in a single-person company. | P3 P3-28, payroll-p §6.5 |
| L-6 | PR-2: Mark as paid needs a ready bank file or a manual-payment reason, a count+total confirmation, audited. Drafted from the blocking id; re-check against the review addendum. | P3 P3-29, payroll-p §6.5 |
| L-7 | Hire bank details: approved v1 without bank fields + waiting v2 as the first bank change request; approval needs `confirmedWithEmployee`; Owner's own = nobody else holds HR.PAY_DETAILS.APPROVE. | H4 H4-26, §7.1 |
| L-8 | Roster "save anyway": `dryRun` returns warnings; a save that adds warnings needs `warningReason`; copy-week one reason. | H3 §6.10, §8.2 |
| L-9 | Notices to people are IN_APP notifications (ERP-13); HR notifies the new assignee after REASSIGN. | H2 §11, §19 |

## Open for Jabran (bundle with the design gate)
- P3 Q13: reversing a run after payslips are published is allowed with an acknowledgement; the payslips show "Replaced" (PR-5). Recommendation: yes.
- H3 Q17: the base pack (non-full countries) has no young-worker rows; school-term limits not checked in v2. Recommendation: accept both for v2.
