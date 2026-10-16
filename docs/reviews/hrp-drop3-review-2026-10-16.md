# HR & Payroll drop 3 rig: design review (2026-10-16)

Independent, read-only, static review (no browser). Scope: `NeoERP-App/docs/design/screen-rig/` `hr-*.jsx`, `hr3-*.jsx`, `ess-shell.jsx`, checked against H1-14/16/17, H2, H3, H4, `hr-h2-h3.md`, `hr-h4.md` and building-blocks. The compact time picker and calendar visuals are accepted for the draft and are not flagged.

**Counts:** High 1 · Med 4 · Low 11 · PASS 14

Paths are relative to `screen-rig/`.

| # | Area | Result | Sev | file:line | Finding · one-line fix |
|---|------|--------|-----|-----------|------------------------|
| 1 | B-5 four-eyes codes / statutory | PASS | — | hr3-data.jsx:653-668, 1149-1167 | Second H4-6 code, REJECT_NOT_ALLOWED and Owner unknown-status refusal now enforced in `hr3CanDecide`/`hr3Decide`; Confirm label in approvals (hr-approvals.jsx:363). |
| 2 | B-6 bank reveal | PASS | — | hr-employee.jsx:357, 450 | Reveal needs PAY_DETAILS.APPROVE, refuses maker (by user id) and employee, in both the button and the callback. |
| 3 | B-8 REHIRE_OFFER | PASS | — | hr3-data.jsx:1367 | `details: {}`; no employeeCode. |
| 4 | B-13 identity copy (drop-3 wizard) | PASS | — | hr3-data.jsx:1350-1358; hr-lifecycle.jsx:364 | The wizard sends source ids only. The copy is modelled in the create function, with same-country, source SENSITIVE.READ and target SENSITIVE.UPDATE checks, and audited both ways. |
| 5 | B-13 regression: old "Start in another company" path | FAIL | **High** | hr-employee.jsx:71, 329; hr-directory.jsx:270, 312 | The drop-3 record page still opens the drop-1 `HrMoveCompany`. It copies `nid` and `dob` into `HR_STATE.prefill` on the client, and `HrAddEmployee` writes them to the new record with no SENSITIVE.READ/UPDATE check and no audit. · Route "Start in another company" to the drop-3 wizard (`movedFrom`) and drop `nid`/`dob` from the prefill. |
| 6 | Draft localStorage leak | PASS | — | hr3-data.jsx:1484-1505 | `hr3DraftSafe` allowlist on both read and write (only legal name, start date and job ids). No nid, dob, IBAN or contacts. |
| 7 | Draft key scope | PASS (note) | Low | hr3-data.jsx:1495 | The draft key is per company, not per signed-in user, so a shared device shows another HR user's draft name. · Key by `cid + userId`. |
| 8 | Owner's own fails closed | PASS | — | hr3-data.jsx:664, 1533-1539; hr-approvals.jsx:382-392 | Unknown status, load not ok or holders null → refusal. Bank Owner's own only when no other holder exists. |
| 9 | Owner's own: bank reveal | FAIL | Low | hr-employee.jsx:357, 450 | The reveal always refuses the maker, so a sole-holder Owner can approve their own hire account but cannot see it in full (H4-26: "Owner's own as for the decision"). · Allow the reveal when `hr3apPayState(...).ownerOwn`. |
| 10 | Owner's own: re-hire/move of own record | FAIL | Low | hr3-data.jsx:1353 | Always `SELF_DECISION_NOT_ALLOWED`. H4 §7.1 step 7 allows the Owner with confirmation and a reason. · Route through `hr3OwnerGate`. |
| 11 | Bank at hire = first change request | PASS | — | hr3-data.jsx:1379-1385; hr-directory.jsx:316-321 | The record carries no bank details. A waiting CR is created with `reqByUserId`. The UI says "waiting for a second person". |
| 12 | Ended employee: ESS Leave/Time/Me | PASS | — | ess-shell.jsx:1013, 1218, 268 | Only the ended card is shown. |
| 13 | Ended employee: payslips 12 months | FAIL | Med | ess-shell.jsx:87, 605; payroll-data.jsx:1530 | The banner promises payslips "until end + 12 months", but nothing cuts access after that date. `payEssSlips` returns every slip. · In PayEss, when ended and today is after end + 12 months, show the no-access state. |
| 14 | Ended: two definitions | FAIL | Low | ess-shell.jsx:64 vs 737 | The banner uses `hrStatus(e)==='ended'`; the tabs use `essEnded` (`essEndInfo`). They can disagree on the end date. · Use `essEnded` for both. |
| 15 | J-9 Save anyway + reason | PASS | — | hr3-data.jsx:875-879, 1585; hr-time.jsx:441, 564 | A new warning needs a reason of at least 6 characters, which goes to the audit only. Batch copy does the same. Warnings never block. |
| 16 | J-9 young-worker check | FAIL | Med | hr3-data.jsx:818-819 | Any shift for anyone under 18 raises `YOUNG_WORKER_NIGHT` with a fixed `YOUNG_15_17` band. It ignores the pack band, night ban window, MAX_DAY/MAX_WEEK and "below minimum age" (MAX_WEEK = 0). · Read the band rows per country and warn only on the breached key. |
| 17 | J-9 PK women's night work | FAIL | Med | hr3-data.jsx:807-821 | `WOMEN_NIGHT_WORK` is not modelled at all (H3 §6.7). Legal sex is correctly never read or shown elsewhere (PASS). · Add the PK-only rule with "check with HR" for non-readers. |
| 18 | J-9 audit of sensitive reads | FAIL | Low | hr3-data.jsx:835-836 | `SENSITIVE_READ_SYSTEM` is written only for viewers without SENSITIVE.READ. J-9 says each computation is audited. · Audit before the branch. |
| 19 | Health leave "Away" | PASS | — | hr3-data.jsx:679-690; ess-shell.jsx:781 | A single masking function, behind HR.LEAVE.HEALTH.READ (HR roles only, never platform). Manager, ESS team calendar and roster locks show "Away". |
| 20 | Health label in ESS approvals | FAIL | Low | ess-shell.jsx:919 | Uses `hr3TypeOf(...).name` directly. Safe today only because every health type is REPORT. · Use `hr3AbsenceLabel`. |
| 21 | Recount on approval | PASS | — | hr3-data.jsx:1168-1174 | Re-runs the preview, writes the new count and returns `recountedOnApproval` (H2-18). |
| 22 | Carry-over caps / expiry | FAIL | Med | hr3-data.jsx:542-552 | Year end carries the whole balance (except DK). There is no `carry_cap` (PK FACTORY 14, SHOP 30 total), no EXPIRE-with-reminder, no statutory/policy portions, and `expired` is always 0 (H2 §7.5, H2-11). · Apply the pack `carry_cap` per portion and show "Carried (no reminder recorded)". |
| 23 | Ledger Taken/Planned split | FAIL | Low | hr3-data.jsx:474-475 | The ledger labels a whole request TAKEN or PLANNED by `r.to < today`; `hr3Balance` splits by day (H2-10). The two disagree for leave in progress. · Split the ledger rows by day. |
| 24 | Statutory reject in leave list | FAIL | Low | hr3-data.jsx:697 | `hr3ReqActions.reject.allowed` ignores `hr3Statutory` (the inbox does not, line 1084; the server refuses). · Mirror the line 1084 rule. |
| 25 | NID clash in drop-1 add panel | FAIL | Low | hr-directory.jsx:305-306 | Shows the clashing employee's code and name to any creator, and checks only active staff. · Use `hr3CreateEmployee`/`hr3NidCheck` (details only for company-wide readers). |
| 26 | Hard-coded decider name | FAIL | Low | hr3-data.jsx:1156 | The rig "conflict" path writes 'Ayesha Khan' for every company (`hr3Upcoming` was fixed). · Use `hr3CompanyDecider(cid).name`. |
| 27 | Stale comment | FAIL | Low | hr-lifecycle.jsx:238 | Still says the re-hire code comes "from REHIRE_OFFER details.employeeCode". · Reword to "search the directory". |
| 28 | Sensitive data at rest/shown | PASS | — | hr3-data.jsx:1325-1332, 1365-1366; hr-employee.jsx:509-516 | The NID check answers yes/no only and is audited. NATIONAL_ID_TAKEN details only go to SENSITIVE.READ holders. Pay values are masked with a 30-second audited reveal. Only row 5 leaks. |

## High and Med findings to fix before design approval

- High #5: the old move path copies nid and dob on the client.
- Med #13: no 12-month payslip cutoff.
- Med #16: the young-worker check is rule-wrong.
- Med #17: the PK women's night-work check is missing.
- Med #22: carry-over has no caps, expiry or portions.
