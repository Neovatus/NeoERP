# HRP-C-8 review — B1 rig fixes and NO/SE money traces (2026-10-20)

Formal read-only, static review for the HR & Payroll lead. No code run.

Scope:
- NeoERP-App `89e34852` (approval badge filter + tax import refusal order).
- NeoERP-App `df8ccd32` (Norway and Sweden money traces).
- NeoERP-BackEnd `6750c0a7` (P5 §10 / P6 §14 clarifications).

Rules checked against: `payroll-v2-p1.md` P1-43 item 7, P1-29, P1-37 and §15 codes; `payroll-v2-p5.md` §10; `payroll-v2-p6.md` §14; `hrms-v2-h2.md` §10.1 / `hrms-v2-h4.md` §10.1 (F-04 facts); `docs/drafts/hr-payroll/f04-fact-boundaries.md`.

Paths below are relative to `NeoERP-App/docs/design/screen-rig/` unless stated. `app.html` carries identical copies of the changed `.jsx` code.

## Verdict

| # | Check | Result |
|---|---|---|
| 1 | Import order, codes, replay | **PASS** |
| 2 | Money logic | **FAIL**: 1 Medium, 2 Low |
| 3 | Fact ownership | **PASS** |
| 4 | Permissions and privacy | **PASS** |

Overall: **FAIL** until the Medium finding (F-1) is fixed. The Lows can be fixed in the same pass.

## 1. Import order — PASS

- **Apply** (`payroll-data.jsx:2365-2376`) runs in this order:
  1. `payNordicGuard` and the preview-owner check (authorization).
  2. Stored-result replay.
  3. `payImportGate` (`:2338-2347`): expiry (410 `IMPORT_PREVIEW_EXPIRED`, rows deleted), then the version, then the source check (missing file gives `VALIDATION`, a mismatch gives `IMPORT_SOURCE_CHANGED`), then `HR_UNAVAILABLE`.
  4. Candidate refusals: an own or confidential candidate gives `EMPLOYEE_ACCESS_CHANGED`, then `TAX_DATA_CHANGED`.
  5. The write.

  This matches P1-43 item 7. The old pre-gate own/confidential checks are removed.
- **Replay** (`:2368`) is returned after current authorization. It does not increment `pairCalls` and makes no second write, as P1-43 item 4 requires.
- **Mapping codes** now follow P1:
  - `NOT_FOUND`
  - 403 `PAYROLL_OWN_PAY_CHANGE` (P1-29 / §8.2a)
  - 403 `CONFIDENTIAL_PAY` (P1-37)

  Ineligibility stays a skipped row reason (`EMPLOYEE_INELIGIBLE`) in `payImportRows` (`:2337`), as §15 says.
- **Badge**: `hr3ChangeRequests` (`hr3-data.jsx:1791`) now filters with `hrCrSupported`, so legacy or injected national-ID requests no longer count.
- Info, no action needed: the rig does not model the Owner's-own `ownerSelfChange` override (P1 §8.2 line 586). It fails stricter, which is acceptable for a Draft rig.

## 2. Money logic — FAIL

The arithmetic checks out for the sample values:

| Country | Topic | Sample | Result |
|---|---|---|---|
| NO | AGA | 50000 × 14.1 % | 7050 |
| NO | Holiday | 100000 × 10.2 % | 10200 |
| NO | No-card withholding | 50000 × 50 % | 25000 |
| SE | Youth contributions (April) | 25000 × 20.81 % + 5000 × 31.42 % | 6773.50 |
| SE | Sick pay, day 4 | sick 4000; karens min(4000, 800) = 800 | net 3200 |
| SE | Sick pay, day 15 | — | 0 |

Other points that pass:
- The AGA zone map gives zero only for an explicit zone `5`. A missing zone or `Ia` blocks.
- Table withholding (NO) and the table lookup (SE) are never guessed.
- Every rate shown carries UNCHECKED / Pending verification, and no rate is asserted as checked.

Findings:

- **F-1 Medium — SE holiday liability counts the payout as earned.**
  - Where: `payroll-data.jsx:2649`.
  - Problem: `holiday_line` is marked as a candidate payslip payment. The same amount is then *added* to the closing liability as "earned", while the release defaults to 0.
  - Effect: in the PERCENT case, 200000 × 12 % = 24000 is both paid on the payslip and added to the liability (closing 34000). In the SAME case, 645 is paid and also accrued. Money paid out should reduce the liability, not increase it. This conflicts with P6 §14, which lists opening + earned + valuation − release as separate terms.
  - Fix: add a separate Payroll sample input for the earned accrual. Set the payslip holiday amount as the release, so liability = opening + accrual − holiday_line.
- **F-2 Low — the UI does not show which lines go on the payslip.**
  - Where: `payroll-setup.jsx:797`, and `payroll-data.jsx:2522`, `:2644`, `:2658`.
  - Problem: the trace renders every amount the same way and ignores `payslip:true`. Sick gross 4000, karens −800 and net 3200 appear side by side, which invites double counting. The spec claim that only the net sick replacement is marked (`specs/payroll-p.md:696`) is therefore not visible to the user. Employer-cost lines (NO AGA and OTP, SE contributions and pension) also carry `payslip:true`.
  - Fix: render a "Payslip line" or "Employer cost" tag from the flag, and set `payslip:false` (or `employer:true`) on employer-cost lines.
- **F-3 Low — deduction signs are inconsistent.**
  - Where: `payroll-data.jsx:2522` and the SE `withholding` / `oneoff` lines.
  - Problem: employee deductions (NO and SE withholding, one-off tax) show as positive, but SE karens shows as negative.
  - Fix: use one sign convention, with deductions negative or explicitly labelled as deductions, on every payslip-deduction line.

## 3. Fact ownership — PASS

- Every fact and blocker names its F-04 owner:

  | Owner | Facts |
  |---|---|
  | HR | `sensitive.taxResidence`, `job.collectiveAgreementCode`, derived cohort (no birthYearMonth returned), `socialInsuranceCoverage[]`, H2 spell/day/degree/`karens{}` |
  | ORG | `contributionZone`, O-1 |
  | PAYROLL | average week / prior karens (SE-16), card, agreement |

- `SE_SICK_FACTS_INCOMPLETE` always stays as a blocker while `karens.exemption = UNKNOWN`. The ILLUSTRATIVE fixture keeps the warning visible, as P6 §14 allows.
- `SE_ORG_FACTS_MISSING` has no ordinary-employer default.
- No HR, Org or Payroll write path or new master field was added. Fixture controls are labelled "not an HR edit".

## 4. Permissions and privacy — PASS

- `payB1Guard` (`payroll-data.jsx`, B1 block) enforces, before any fact is projected:
  - platform refusal, offline and `SETUP.VIEW` (via `payNordicGuard`)
  - company/country and employee existence
  - `EMPLOYEE.VIEW`
  - `CONFIDENTIAL_PAY`
- The picker excludes guarded employees.
- State lives in the component only. It resets on company, actor, employee, topic and scenario changes (keyed by `cid:userId`). Nothing uses storage.
- No national ID, raw date of birth, diagnosis or account is returned.
- `payroll-rig.jsx` only adds index links to the existing `setup|country` route. There is no new route.
