# HRP-C-9 review: B1 fixes and DK/FI/IS money traces (2026-10-20)

This is a formal, read-only, static review for the HR & Payroll lead. No code was run.

## Scope

- **NeoERP-App `d27ae775..3c1831a3`**
  - `b92dfb92`: the B1 fixes.
  - `3c1831a3`: the DK, FI and IS money traces.
- **NeoERP-BackEnd `ad72db7..d990111`**: the P7, P8 and P9 clarifications.

## Rules checked

- P6–P9 in `NeoERP-BackEnd/docs/api/`.
- H2 §10.1 and §7.11i.
- H4 §10.1.
- `docs/drafts/hr-payroll/f04-fact-boundaries.md`. Its Lead decisions are binding here: Payroll owns the DK holiday payer mode, and an SE karens value of UNKNOWN blocks.
- The C-8 findings F-1, F-2 and F-3.

## Path conventions

- Paths are relative to `NeoERP-App/docs/design/screen-rig/` unless stated otherwise.
- `app.html` carries identical copies of `payB2Dk`, `payB2Fi` and `payB2Is`. The only difference is a trailing `</script>`.

## Verdict

| # | Check | Result |
|---|---|---|
| 1 | C-8 F-1/F-2/F-3 fixed in NO+SE and held in DK/FI/IS | **PASS** (1 Low) |
| 2 | DK/FI/IS money logic | **FAIL**: 1 Medium, 3 Low |
| 3 | Fact ownership and blockers (F-04, O-2/O-3/O-4) | **PASS** (1 Low) |
| 4 | Permissions, privacy, no persistence, no bypass | **PASS** |

**Overall: FAIL** until the Medium finding (C9-1) is fixed. The Low findings can be fixed in the same pass.

## 1. C-8 fixes — PASS

### F-1 (holiday liability)

- **Fixed for SE** (`payroll-data.jsx:2651-2652`):
  - `earnedAccrual` is a separate Payroll input, with a default of 0.
  - The holiday payslip amount is the release.
  - The liability is opening + earned − released.
  - Default sample: 10000 + 0 − 645 = 9355.
- **Not applicable to NO.** NO shows only an accrual of 10200, tagged Intermediate (`:2524`), and has no liability row.
- **Held in DK** (`:2735`), **FI** (`:2886`) and **IS** (orlof), all with the same formula:
  - DK: 5000 + 1250 − 0 = 6250.
  - FI: 2000 + 300 − 900 = 1400.
  - IS: 30000 + 10170 − 5000 = 35170.

### F-2 (trace tags)

- **Fixed.** `payroll-setup.jsx:797` renders a Payslip line, Employer cost or Intermediate tag from `kind`.
- **NO and SE kinds are correct:**
  - Employer cost: NO AGA and OTP (`:2524`), SE contributions (`:2647`) and SE pension (`:2667`).
  - Intermediate: SE sick gross and karens (`:2661`).
  - Payslip: SE net sick pay only.
- **DK, FI and IS:**
  - Every employer share is EMPLOYER: ATP employer, TyEL employer, unemployment, health, accident, group-life, IS pension and the matching employer contributions.
  - Only employee deductions and holiday payments are PAYSLIP.

### F-3 (signs)

- **Fixed.** Every employee deduction is now negative:
  - NO and SE withholding, and SE one-off tax.
  - SE karens.
  - DK A-tax, AM and employee ATP.
  - FI withholding, employee TyEL and employee unemployment.
  - IS withholding, pension, séreign and union.
- Employer costs are positive.

### C9-5 Low — notice rows carry an "Intermediate" tag

- **Where:** `payroll-setup.jsx:797`.
- **Problem:** rows with no amount still get the Intermediate tag. These are notice rows such as `pending`, `fixture_warning`, `tax_timing`, `ceiling_notice`, `coverage_notice`, `credit_limit` and `union_pending`.
- **Fix:** render the kind tag only when `Number.isInteger(line.amountMinor)`, or add a `NOTICE` kind.

## 2. DK/FI/IS money logic — FAIL

### Sample arithmetic

The sample arithmetic is consistent:

| Country | Topic | Calculation | Result |
|---|---|---|---|
| DK | A-tax, MAIN card | (10000 − 2000) × 38 % | −3040 |
| DK | A-tax, no card | 10000 × 55 % | −5500 |
| DK | AM | 10000 × 8 % | −800 |
| DK | ATP at 117 hours | employee / employer | −99 / 198 |
| FI | Tax, ceiling split | 1000 within / 2000 excess | −1000 |
| FI | TyEL | employee / employer | −219 / 486 |
| FI | Unemployment, employee | 3000 × 0.89 % | −26.70 |
| FI | Unemployment, employer | 500 × 0.31 % + 2500 × 1.23 % | 32.30 |
| FI | Health, employer | — | 57.30 |
| IS | Withholding after credit | 125960 − 72492 | −53468 |
| IS | Pension | employee / employer / basis | −20000 / 57500 / 480000 |

### What passes

- **No double counting.** FI states that employee health is inside withholding. The IS credit is capped at the current tax, so withholding can never become a refund.
- **Rates are not presented as verified.**
  - Every rate is labelled proposed, sample or UNCHECKED, with Pending verification on the applicability line.
  - The FI employer TyEL rate (16.2), accident rate and group-life rate are editable sample insurer-agreement inputs. There is no universal rate.
- **DK payer mode** is a Payroll select (`payerMode`, owner PAYROLL). It is not read from HR `holidayPayRoute`.
- **DK ATP hours:**
  - `job.hoursBasis` is read from the HR job (`:2727`).
  - `NOT_RECORDED` blocks and sets `calculate=null` (`:2729-2730`). Unknown hours are never inferred.
- **IS:**
  - Credit allocation, carry-in and use elsewhere are owned by EMPLOYEE.
  - Residency is a synthetic HR response. PARTIAL blocks and FOREIGN is refused.
  - Fractional ISK money inputs are refused with `payroll_b2_is_whole_isk`.

### Findings

**C9-1 Medium — DK computes a MAIN-card allowance although the instruction is missing**

- **Where:** `payroll-data.jsx:2719` and `:2745`.
- **Problem:** `DK_CARD_INSTRUCTION_REQUIRED` is raised for MAIN, which is the default. However, the `blocked` check (`:2745`) does not include that blocker, so ILLUSTRATIVE still deducts the allowance and shows −3040.
- **Conflicts with:**
  - P7 §codes line 303: "no assumed MAIN".
  - The B2 rule that missing Payroll or declaration input suppresses all monetary candidates.
- **Fix:** have `blocked` include every blocker except `DK_ORG_FACTS_MISSING`, matching FI `:2892` and IS `onlyOrg`. Alternatively, give the fixture an explicit synthetic instruction.

**C9-2 Low — DK FUND payout is tagged as a payslip line**

- **Where:** `payroll-data.jsx:2735`.
- **Problem:** the DK holiday payment is tagged PAYSLIP even when the payer mode is FUND. Under FerieKonto, the fund pays the employee, so the employer's release is not an employee payslip line.
- **Fix:** use kind `PAYSLIP` only when the mode is EMPLOYER. For FUND, show the release as Intermediate or Employer cost and label it as a fund transfer.

**C9-3 Low — DK and FI holiday release has no overdraw guard**

- **Where:** `payroll-data.jsx:2733-2735` (DK) and `:2884-2886` (FI).
- **Problem:** the release can exceed opening + earned, which gives a negative closing liability. IS guards this case with `IS_HOLIDAY_BALANCE_INVALID`.
- **Fix:** add the same guard to DK and FI.

**C9-4 Low — IS `pension_basis` label does not match its value**

- **Where:** label at `payroll-data.jsx:2962`; value at `:3009`.
- **Problem:** the label says "Eligible employee deductions from withholding basis", but the value is the base after those deductions (480000).
- **Fix:** relabel it as "Withholding basis after eligible employee pension deductions · Intermediate".

## 3. Fact ownership — PASS

- **Org facts block every topic, with no default:**
  - O-2 by `DK_ORG_FACTS_MISSING`.
  - O-3 by `FI_ORG_FACTS_MISSING`.
  - O-4 by `IS_ORG_FACTS_MISSING`.

  Each is owned by ORG, applies to every topic and records no ordinary-employer default. ILLUSTRATIVE shows arithmetic only beside the retained blocker. This is the same pattern C-8 accepted for SE.
- **HR facts** are read-only:
  - `sensitive.*`, `job.hoursBasis`, `job.insuranceCategory`, leave, residency and coverage are owned by HR.
  - The synthetic selectors are owned by FIXTURE.
  - Payroll owns the cards, rates, agreements, payer mode and liabilities.
  - Declarations are owned by EMPLOYEE.
- **SE karens:** the text now points to H2 §7.11i, and UNKNOWN still blocks with `SE_SICK_FACTS_INCOMPLETE`.

**C9-6 Low — blocker codes missing from the P7–P9 catalogues**

- **Problem:** several rig codes do not appear in the P7, P8 or P9 code catalogues:
  - `DK_ORG_FACTS_MISSING`
  - `DK_REQUIRED_HR_FACT_MISSING`
  - `DK_REFUND_RULE_UNVERIFIED`
  - `FI_REQUIRED_HR_FACT_MISSING`
  - `FI_PAY_SETUP_INCOMPLETE`
  - `IS_UNION_POLICY_UNVERIFIED`
  - `IS_CREDIT_PRORATION_UNVERIFIED`
  - `IS_HOLIDAY_BALANCE_INVALID`
  - `IS_REQUIRED_HR_FACT_MISSING`
- **Related problem:** FI `missing_hr` uses `FI_INSURANCE_FACTS_MISSING` for the tax and holiday topics too (`:2888`).
- **Fix:** register these codes in the P7–P9 code tables, or map them to codes that are already catalogued. Use an HR-fact code that does not depend on the topic.

## 4. Permissions and privacy — PASS

- **One guard for all five countries.** `payB1Guard` (`:2418`) is now extended to DK, FI and IS, with the order unchanged: the SETUP.VIEW and Nordic guard, then NOT_FOUND, then EMPLOYEE.VIEW, then CONFIDENTIAL_PAY.
- **The guard runs first in every country trace.**
  - `payB2Dk`, `payB2Fi` and `payB2Is` each call it first.
  - The employee picker filters people through the guard.
  - `payB1Model` dispatches by country and returns NOT_FOUND by default.
- **No new route.** There are three new index entries, and they reuse the `setup/country` view (`payroll-rig.jsx:529-533`).
- **Nothing is persisted.** There are no writes, the state stays in the component and no store changes.
- **No sensitive data is exposed:** no raw DOB, national ID, account or health data.
