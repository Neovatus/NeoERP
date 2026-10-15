# Payroll v2 — scope

Owner: **Cowork · HR & Payroll lead**. Written 2026-10-09. Status: **signed off by Jabran 2026-10-09**.
Based on: `docs/drafts/hr-payroll/HR-PAYROLL-LEAD-REVIEW.md` (accepted 2026-10-09), `claude/target-countries.md`, handover §2a.
Amended 2026-10-10 (HR & Payroll lead): ERP-11 Owner's own only when no other person holds a payroll calculate or approve right (tightens ERP-4; ACC-12); PS-1 nobody changes their own pay (§3 rule 4).

Payroll v2 **replaces** Payroll v1:

- **Calculation, run lifecycle, payslips and reports:** new.
- **Kept:** the service skeleton and the security layer, brought up to standard.
- **Data:** kept through new migrations (backfill and quarantine plan, review §3.2).

## 1. In scope

### P0 Foundation (backend only)
- **Company id:** on all 12 tables, through V6 (nullable) → backfill job → V7 (NOT NULL, unique and composite FKs per company).
  - V5 seed rows are copied per demo company.
  - The old flat rules are kept as read-only history.
- **Isolation:** `CompanyTenantScope` everywhere, two-company tests, then lift the 503 gate.
- **Security:** tier 2.
- **Money:** currency on every run, from the company's currency.
- **Run state machine:** Draft → Calculated → Approved → Posted → Paid.
  - Calculate and approve must be two different people.
  - `@Version` and idempotency keys.
  - Run types: regular, off-cycle and correction.
- **Audit outbox** wired, and the line-model FK bug fixed.
- **Tests:** Postgres (Testcontainers).

### P1 Engine and the Pakistan pack
- **Design target:** the engine is designed **against Norway** from the start and checked against all six launch countries.
- **Pay elements** (earning, deduction, employer cost, benefit), each with flags per country:
  - taxable, AM-liable (DK);
  - holiday-pay basis, pension basis, contribution basis;
  - filing income code.
- **Pay groups and pay calendars** (monthly first; frequency and pay date per group).
- **Salary and recurring elements** per employee, effective-dated, with proration for joiners, leavers, unpaid absence and FTE.
- **Inputs from HR:** job, absences, period totals, final settlement.
- **Tax card** per employee and year (country fields; source = API or file).
- **Payee register:** tax authority, pension funds and insurers, holiday funds, unions.
- **Packs:** a payroll pack per country, effective-dated, with a source and check state per row.
  - A `PayrollCountryProvider` per country handles gross-to-net, employer cost, holiday pay and the filing file.
  - Each run line stores the rule version it used.
- **Pakistan:**
  - s.149 projected annual tax with the Finance Act slabs (from 1 July);
  - EOBI;
  - PESSI or SESSI by the branch's province;
  - arrears and bonus.
- **Payslip** with lines and year-to-date figures.
- **Variance review** against the last period.

### P2 Posting to Accounts
- **Machine client** (BA-2 lifted by the Accounts lead).
- **One PR journal per run**, summed by branch × cost centre, through "Used for" roles (review §5).
- **Journal preview** before posting.
- **Corrections:**
  - before payment or filing: reverse and repost;
  - after payment or filing: a correction run.
- **Idempotent** with its own outbox.

### P3 Pay and publish
- Bank payment file per country (formats *to verify*: PK banks first, then ISO 20022 pain.001 for the Nordics).
- Payslip PDF and publishing.
- Payments to payees: payable lists and files where needed.
- **ESS:** my payslips and the tax certificate.

### P4–P9 Country filings and packs, in order PK → NO → SE → DK → FI → IS
- **Shared approach:**
  - every filing is a **file for upload** in v2 (D7);
  - filings hang off **payment events** and are grouped by month where the country wants that;
  - the country goes **ready** only after its pack is CHECKED against the source and a pilot customer has run payroll in parallel.

| Slice | Contents |
|---|---|
| P4 Pakistan | s.165 statement, s.164 certificate, EOBI and PESSI/SESSI returns |
| P5 Norway | Skattekort (file import first), tabelltrekk/prosenttrekk, half tax in December; AGA by zone with fribeløp; feriepenger with year accrual; OTP; A-melding |
| P6 Sweden | Skattetabeller, engångsskatt; arbetsgivaravgifter by age; semesterlön/semesterskuld; sjuklön with karensavdrag; AGI |
| P7 Denmark | eSkattekort; AM-bidrag; ATP and the samlet betaling; feriepenge via FerieKonto or a fund, ferietillæg; sick-pay refund; eIndkomst |
| P8 Finland | Verokortti with income limit; TyEL; unemployment and health insurance; holiday pay and lomaraha; Incomes Register within 5 days of payment, plus the employer report |
| P9 Iceland | Staðgreiðsla with personal tax credit; tryggingagjald; pension funds and séreign; orlof; staðgreiðsluskilagrein; pension-fund and union files |

## 2. Out of scope (later slices)
- Direct API submission to Altinn/Maskinporten, Skatteverket, SKAT, the Incomes Register or Skatturinn (D7).
- Countries outside the six: Payroll shows "coming" until their pack ships.
- Secondment and cross-border taxation.
- Benefits administration (company car, insurance plans) beyond plain pay elements.
- Loans and advances with schedules.
- Full collective-agreement libraries.
- Retro-pay engine across closed years.
- WWF/WPPF (company profit, in Accounts).

## 3. Domain rules
1. **The company's Org country chooses the payroll pack.** No pack, no payroll: never another country's rules.
2. **Every rate, slab, threshold and table is effective-dated**, and each run line records the version it used. Reports use the rates applied, never today's.
3. **Money:** stored as decimal with the company's currency. Rounding rules come from the pack.
4. **Four eyes:** the person who calculates a run can't approve it, and posting carries both names to Accounts.
   - **Single-person case (Jabran, 2026-10-09; tightened by the ERP lead 2026-10-10, ERP-11)**, like Accounts' "Owner's own": the **Company Owner** may approve a run they calculated **only with a reason**, and **only when no other person in the company holds a payroll calculate or approve right** (`PAYROLL.RUN.CALCULATE` or `PAYROLL.RUN.APPROVE`). The run is marked **"Owner's own"**, this shows in the run's history, and it is sent to Accounts with that evidence (`sourceOwnerSelfApproval`, `noOtherApprover` = "no other payroll calculate or approve holder").
   - **If another payroll person exists**, they calculate and the Owner approves. Four eyes stays mandatory.
   - The check is fresh and **fails closed**: if it can't be answered, Owner's own is refused.
   - **Nobody changes their own pay** (salary, pay elements, bank details, tax card on the employee record linked to their own login), the Owner included. In a single-person company the Owner may do it as Owner's own with a reason, under the same condition (open point for the lead, spec §8).
5. **A posted run is never edited.** It is reversed and reposted before payment or filing, or corrected by a correction run after.
6. **Payroll reads employee facts from HR** and never stores its own copy of HR-owned fields.
7. **Salary and payslips are sensitive data:**
   - payroll codes are separate;
   - managers see no pay unless granted;
   - Enter company sees nothing unless granted (D5).
8. **Collective-agreement rules sit on top of the pack** as company policy, never below the legal minimum.

## 4. Roles (defaults; exact codes in the contract)
| Role | Default in Payroll |
|---|---|
| Company Owner | Everything, and can delegate (D5) |
| Payroll admin (reserved) | Setup, prepare, calculate, post, pay, filings |
| Payroll approver (reserved) | View and approve runs (not the calculator) |
| Accountant | View posted runs and their journals |
| Manager | Nothing by default |
| Employee (automatic when linked) | Own payslips and tax certificate through ESS |
| Neovatus Enter company | Nothing unless granted |

## 5. Dependencies
- **Accounts lead:**
  - BA-2;
  - payroll "Used for" roles in all six charts, including the PK provincial social security role and the DK/FI/IS payables;
  - payables split by payee;
  - cost-centre tags;
  - the journal shape and correction model.
- **ERP lead:** Org branch and company facts (as in the HR scope §5); tier 2; shared components (stepper, variance table, money, file download).
- **HR scope:** H1 must be done before P1, and H2 and H3 feed absences and time totals.

## 6. Open decisions
None blocking. Bank file formats per country are verified during P3 design.
