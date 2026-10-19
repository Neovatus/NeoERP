# F-04 — HR / Payroll / Org fact boundaries for SE, DK, FI and IS payroll

From: HR & Payroll lead · Date: 2026-10-19 · Status: DRAFT (contract amendment proposal; Jabran keeps Final Approval)

Amended 2026-10-19 (HRP lead): F-04 HR facts for SE/DK/FI/IS

Source finding: F-04 in [hrp-design-completion-lead-prompt.md](hrp-design-completion-lead-prompt.md).
Country contracts read: [P6 SE](../../../NeoERP-BackEnd/docs/api/payroll-v2-p6.md),
[P7 DK](../../../NeoERP-BackEnd/docs/api/payroll-v2-p7.md),
[P8 FI](../../../NeoERP-BackEnd/docs/api/payroll-v2-p8.md),
[P9 IS](../../../NeoERP-BackEnd/docs/api/payroll-v2-p9.md),
[ORG-FACTS-2](../../../NeoERP-BackEnd/docs/api/org-facts-2.md).
Amended contracts: [H4 §10.1 `HrEmployeeFactsV2`](../../../NeoERP-BackEnd/docs/api/hrms-v2-h4.md#101-hremployeefactsv2-hr--payroll-b8)
and [H2 §10.1 `HrAbsencesV1`](../../../NeoERP-BackEnd/docs/api/hrms-v2-h2.md#101-hrabsencesv1-hr--payroll).

## 1. Lead rules applied

1. Payroll **reads** HR facts; it never keeps a second copy of an HR master (identity, birth date, employment, job, leave, absence).
2. No diagnosis ever leaves HR. Health-adjacent facts are yes/no or codes only and travel in `HrAbsencesV1`, audited by the existing `READ_HEALTH` row.
3. Sensitive facts leave HR only through the audited `hr.employee-facts.sensitive.read` scope, named per field in `sensitiveFields` (`requiredFacts()`), one `READ_SENSITIVE` audit row per response.
4. Derive from existing fields before adding new ones (date of birth → `birthYearMonth`; start date / `recognisedServiceStart` → service length; HR time totals → hours).
5. A missing fact is a per-employee **blocker** with the country error code (e.g. `SE_SICK_FACTS_INCOMPLETE`, `DK_AM_AGE_FACT_MISSING`, `FI_INSURANCE_FACTS_MISSING`, `IS_CREDIT_BALANCE_UNVERIFIED`), never a default value. Screens show the blocker until the owner supplies the fact.

Owner key: **HR** (employee record or absence), **PAY** (Payroll's own employee pay setup, tax card, credit use, payer modes, policies), **EMP** (employee-declared, recorded in Payroll with evidence), **ORG** (company/branch facts, ERP lead).

## 2. Fact list with one owner each

"Existing" = already in V1/V2 or `HrAbsencesV1`/`HrLeaveBalancesV1`/`HrPeriodTotalsV1`/`HrWorkCalendarV1`; "New" = added by this amendment.

### 2.1 Sweden (P6)

| # | Fact | Used for | Owner | Where |
|---|---|---|---|---|
| SE-1 | Birth year (cohort) | Employer contribution cohort, youth relief 2026 (P6 §6) | HR | New derived `sensitive.birthYearMonth` |
| SE-2 | Social insurance coverage (Swedish / A1 / other country) | Contribution selection, foreign coverage block (P6 §6) | HR | New `sensitive.socialInsuranceCoverage[]` |
| SE-3 | Tax residence and period | SINK vs A-tax applicability, service-contract classification (P6 §13) | HR | Existing `sensitive.taxResidence` + new `taxResidenceFrom/To` |
| SE-4 | Sick spell id | Karens and sick-pay day counting (P6 §8) | HR | Existing `sickSpellId` |
| SE-5 | Original spell start and day number | 14-day employer period (P6 §8) | HR | New `spellStartDate`; existing `days[].spellDay`, `employerPeriodDay` |
| SE-6 | Relapse linkage (återinsjuknande within 5 days) | Karens carried within spell (P6 §8) | HR | New `linkBasis`, `linkedPreviousReportId` |
| SE-7 | Degree (partial sick leave) | Lost-remuneration share (P6 §8) | HR | Existing `days[].degreePercent`; new item `degrees[]` |
| SE-8 | Scheduled hours per sick day | Lost remuneration, karens 20 % of average week (P6 §8) | HR | New `days[].scheduledHours` |
| SE-9 | Employer / state responsibility per day | Day 15 stop (P6 §8) | HR | Existing `days[].payer`, `periods[]` |
| SE-10 | Karens applicable, already applied in spell, karens count in 12 months | Karens carry and annual cap (P6 §8) | HR | New item `karens{}` |
| SE-11 | High-risk protection exemption (särskilt högriskskydd, yes/no) | Karens exemption (P6 §8) | HR | New `karens.exemption` (health-adjacent, audited) |
| SE-12 | Sick-pay eligibility (service, notice) | Eligibility (P6 §8) | HR | Existing `eligibility[]` |
| SE-13 | Absence revision for first-declaration idempotency (VAB/parental in AGI) | AGI absence facts (P6 §9) | HR | New `itemRevision` |
| SE-14 | Holiday leave days, qualifying absence | Semesterskuld (P6 §7) | HR | Existing `HrLeaveBalancesV1`, `countsForHolidayEarning` |
| SE-15 | Collective agreement code | Agreement selection (P6 §7–8) | HR | Existing `job.collectiveAgreementCode` |
| SE-16 | Average weekly sick-pay basis, prior applied karens amount | Karens amount (P6 §8) | PAY | P6 calculation / accumulators |
| SE-17 | Sick-pay and holiday agreement version and method (sammalöne / procent) | P6 §7–8 | PAY | P6 policy rows |
| SE-18 | Tax card (A-tax table/column, jämkning, one-off) | Withholding (P6 §4) | PAY | P1 TaxCard + SE `countryFields` |
| SE-19 | Pension agreement, insurer, SLP role and payee | P6 §7 | PAY | P6 policy, P3 payee |
| SE-20 | Monthly youth-relief capacity across runs | P6 §6 | PAY | Engine reservations |
| SE-21 | Service recipient F/FA/A-tax status, FA written invocation, expected annual remuneration | Service-contract classification (P6 §13) | EMP | Recorded in Payroll with evidence |
| SE-22 | Employer category (filing/deposit calendar) and permanent establishment | P6 §6, §9 | ORG | Ask O-1 |
| SE-23 | Employer organisation number | AGI employer id | ORG | Existing `SE.ORGNR` |

### 2.2 Denmark (P7)

| # | Fact | Used for | Owner | Where |
|---|---|---|---|---|
| DK-1 | Birth year (AM age-year rule, 18 in the tax year) | P7 §5 | HR | New `sensitive.birthYearMonth` |
| DK-2 | Birth date month (ATP from 16) | P7 §6 (kept independent from DK-1 in pack rows) | HR | New `sensitive.birthYearMonth` (same field; separate pack rules) |
| DK-3 | ATP coverage / exemption (A1, posted) | P7 §6 | HR | New `sensitive.socialInsuranceCoverage[]` |
| DK-4 | Hours basis: fixed contracted vs recorded variable vs not recorded | ATP table choice, unknown-hours rule (P7 §6) | HR | New `job.hoursBasis` |
| DK-5 | Contracted weekly hours, recorded paid hours | ATP liable hours input (P7 §6) | HR | Existing `job.weeklyHours`, `HrPeriodTotalsV1` |
| DK-6 | Absence hours and benefit payer per day | ATP liable-hour reduction, no duplicate ATP (P7 §6) | HR | Existing `days[].hours`, `days[].payer`; new `days[].scheduledHours` |
| DK-7 | Sickness eligibility (8 weeks, 74 hours) | Employer period (P7 §8) | HR | Existing `eligibility[]` (codes `DK_SERVICE_8_WEEKS`, `DK_HOURS_74`) |
| DK-8 | Absence id and version for NemRefusion worksheet | P7 §8 (open decision 1) | HR | Existing `itemId`; new `itemRevision`, `spellStartDate` |
| DK-9 | Leave entitlement, unused days, 5th-week payout, fund entries | Holiday (P7 §7) | HR | Existing `HrLeaveBalancesV1`, `ENCASHMENT`/`FUND` items |
| DK-10 | Pay basis (monthly salaried) | Salary-with-holiday-pay eligibility input (P7 §7) | HR | Existing `job.payBasis`, `contractForm` |
| DK-11 | Facts revision for stale detection | `DK_REFUND_SOURCE_STALE` (P7 §8) | HR | New `factsRevision` |
| DK-12 | Tax card kind, allowance, free balance, authority version | P7 §4 | PAY | P1 TaxCard + DK `countryFields` |
| DK-13 | Holiday payer mode (FerieKonto net vs employer gross), 12.5 % vs salary + 1 % election | P7 §7 | PAY | P7 policy (see §5 note on HR `holidayPayRoute`) |
| DK-14 | ATP liable hours result, pay frequency, Samlet Betaling estimates | P7 §6 | PAY | P7 provider / pay group |
| DK-15 | Company pension policy, rates, payee | P7 §6 | PAY | P7 policy, P3 payee |
| DK-16 | Full pay during sickness / public holidays term | Holiday eligibility (P7 §7) | PAY | P7 agreement policy keyed by HR `collectiveAgreementCode` |
| DK-17 | Which payer uses the MAIN card (employee instruction, date, evidence) | P7 §4 | EMP | `requestedCardKind` + instruction reference |
| DK-18 | Employer scheme registrations (ATP/Samlet Betaling, FerieKonto payer, Barsel.dk / AUB coverage) and eIndkomst employer category | P7 §6–7, §13 | ORG | Ask O-2 |
| DK-19 | CVR / SE-nr | eIndkomst employer | ORG | Existing `DK.CVR`, `DK.SE_NR` |

### 2.3 Finland (P8)

| # | Fact | Used for | Owner | Where |
|---|---|---|---|---|
| FI-1 | Birth year and month | TyEL start (month after 17), cohort upper age, unemployment 18–64, health 16–67 (P8 §6) | HR | New `sensitive.birthYearMonth` |
| FI-2 | Insurance-relevant employment category (ordinary / part-owner / not an insured employee) | Unemployment rate, TyEL vs YEL (P8 §3, §6) | HR | New `job.insuranceCategory` |
| FI-3 | Social insurance coverage (Finnish / A1 / foreign) | Blocked profiles, health contribution (P8 §3, §6) | HR | New `sensitive.socialInsuranceCoverage[]` |
| FI-4 | Tax residence and period | Resident-only initial profile (P8 §3) | HR | Existing `taxResidence` + new `taxResidenceFrom/To` |
| FI-5 | Employment dates, recognised service start | Holiday accrual 2 vs 2.5 days (P8 §7) | HR | Existing `startDate`, `recognisedServiceStart` |
| FI-6 | Earned / taken leave units, qualifying months | P8 §7 | HR | Existing `HrLeaveBalancesV1` (HR counts) |
| FI-7 | Same-illness link, spell, day number, degree | Sick pay (FI 30-day + same illness) | HR | New `sameIllnessAsPrevious`, `linkBasis`; existing spell/day fields |
| FI-8 | Occupation, contract form, hours basis | Incomes Register employee facts (P8 §8) | HR | Existing `occupationCode`, `contractForm`; new `job.hoursBasis` |
| FI-9 | Wage tax card, ceiling, additional percent, revised-card opening | P8 §4 | PAY | P1 TaxCard + FI `countryFields`, ceiling ledger |
| FI-10 | TyEL insurer policy and employer rate, accident / group-life policy | P8 §6 | PAY | P8 policy, P3 payee |
| FI-11 | Employment Fund annual payroll threshold | P8 §6 | PAY | P8 accumulator |
| FI-12 | Holiday method, lomaraha agreement | P8 §7 | PAY | P8 policy |
| FI-13 | Revised-card own-payer opening paid amounts | P8 §4 | EMP | Opening with reason/evidence in Payroll |
| FI-14 | Request to increase withholding | P8 §4 | EMP | P1 policy with reason |
| FI-15 | Employer sector (private / public) and employer-register category (regular employer) | P8 §6, §8 | ORG | Ask O-3 |
| FI-16 | Y-tunnus | Incomes Register payer | ORG | Existing `FI.YTUNNUS` |

### 2.4 Iceland (P9)

| # | Fact | Used for | Owner | Where |
|---|---|---|---|---|
| IS-1 | Birth year and month | Full credit at age 16 year, fund start after 16, end at 70 (P9 §4–5) | HR | New `sensitive.birthYearMonth` |
| IS-2 | Residency status and period | Credit eligibility, residency-day proration (P9 §4, P9-A2) | HR | Existing `taxResidence` + new `taxResidenceFrom/To` |
| IS-3 | HR eligibility reference for credit | `residencyEligibilityReference` (P9 §4) | HR | New `factsRevision` (opaque, non-sensitive) |
| IS-4 | Social insurance coverage (A1 exception) | Tryggingagjald exemption (P9 §5) | HR | New `sensitive.socialInsuranceCoverage[]` |
| IS-5 | Union code, pension provider (as recorded on the HR record) | Fund/union selection input (P9 §5) | HR | Existing sensitive `unionCode`, `pensionProviderId` |
| IS-6 | Leave entitlement, absence, unused days | Orlof (P9 §6) | HR | Existing `HrLeaveBalancesV1` |
| IS-7 | Credit instruction: use, allocation %, starting bracket, from month | P9 §4 | EMP | `countryFields` in Payroll |
| IS-8 | Credit used elsewhere, as-of date, carry-in and evidence | P9 §4 | EMP | `countryFields` in Payroll |
| IS-9 | Mandatory pension profile, additional savings election | P9 §5 | PAY | `contributionProfileId`, `additionalSavingsProfileId` |
| IS-10 | Holiday account route / provider | P9 §6 | PAY | P9 policy |
| IS-11 | Credit consumption across off-cycle runs | P9 §8 | PAY | Engine serialisation |
| IS-12 | Employer social-charge category (ordinary / financial sector / seafarer) | P9 §5 | ORG | Ask O-4 |
| IS-13 | Employer kennitala | Staðgreiðsla employer | ORG | Existing `IS.KENNITALA` |

### 2.5 Counts

| Owner | SE | DK | FI | IS | Total |
|---|---:|---:|---:|---:|---:|
| HR | 15 | 11 | 8 | 6 | 40 |
| PAY | 5 | 5 | 4 | 3 | 17 |
| EMP (declared in Payroll) | 1 | 1 | 2 | 2 | 6 |
| ORG | 2 | 2 | 2 | 2 | 8 |

ORG counts include facts ORG-FACTS-2 already serves; only O-1…O-4 (§4) are new asks. Most HR rows are served by existing fields; the new fields in §3 cover the rest.

## 3. New HR fields (added by this amendment)

`HrEmployeeFactsV2` (H4 §10.1), additive:

| Field | Type / null | Sensitivity | Countries |
|---|---|---|---|
| `sensitive.birthYearMonth` | `"YYYY-MM"`, null when no date of birth | Sensitive, requested by name, audited | SE, DK, FI, IS |
| `sensitive.socialInsuranceCoverage[]` | list of `{ country, basis, validFrom, validTo? }`; empty = not recorded | Sensitive | SE, DK, FI, IS |
| `sensitive.taxResidenceFrom`, `sensitive.taxResidenceTo` | date, nullable | Sensitive | SE, FI, IS |
| `job.insuranceCategory` (and `segments[]`) | enum, null outside FI | Non-sensitive | FI |
| `job.hoursBasis` (and `segments[]`) | enum, null when not set | Non-sensitive | DK, FI, SE |
| `factsRevision` | long, never null | Non-sensitive | DK, IS |

`HrAbsencesV1` (H2 §10.1), additive: `itemRevision`, `spellStartDate`, `linkBasis`, `linkedPreviousReportId`,
`sameIllnessAsPrevious`, `degrees[]`, `karens{ applicable, appliedEarlierInSpell, countIn12Months, exemption }`,
`days[].scheduledHours`. All on health-related items fall under the existing `READ_HEALTH` audit.

## 4. Org-owned facts — asks for the ERP lead (ORG-FACTS-2 not edited here)

| Ask | Fact | Country | Suggested home |
|---|---|---|---|
| O-1 | Employer category for AGI filing/deposit calendar; permanent establishment in Sweden (yes/no) | SE | Legal profile `registerFlags` / new dated field |
| O-2 | Employer scheme registrations: `DK.ATP` (Samlet Betaling), `DK.FERIEKONTO` payer registration, Barsel.dk / AUB coverage; eIndkomst employer category | DK | `employerRegistrations` schemes (F-2) + legal profile |
| O-3 | Employer sector (private / public) and Incomes Register employer category (regular employer) | FI | Legal profile, effective-dated |
| O-4 | Employer social-charge category (ordinary / financial sector / seafarer additional) | IS | Legal profile, effective-dated |

Until each ask is answered, the country provider raises its missing-fact blocker; no default category.

## 5. Payroll-owned facts — P6–P9 own them

SE-16…SE-20, DK-12…DK-16, FI-9…FI-12, IS-9…IS-11 (Payroll setup, tax card, payer modes, policies, accumulators)
and the employee-declared rows SE-21, DK-17, FI-13, FI-14, IS-7, IS-8 are owned by P6–P9 (with P1 for the
TaxCard and `countryFields` shapes). HR is not asked for them.

Note on overlap: H1 V1 already carries `sensitive.holidayPayRoute`. The DK holiday payer mode (DK-13) is
Payroll's; P7 must not read the HR field as the payer mode. Recommendation: HR keeps `holidayPayRoute` as an
informational record value only; the HRP lead decides at CP-P7.2 whether to retire it from V2.

## 6. Open points

- `karens.exemption` (SE high-risk protection) needs an HR write path (H2 §7.11 extension at CP-H2.6). Until it exists HR answers `UNKNOWN` and P6 blocks karens exemption cases.
- `socialInsuranceCoverage` needs an HR edit on the Pay details tab (same lead, with ERP review of the sensitive scope, like P4-A5).
- Exact pack thresholds (ages, hours, gap days) stay in country packs, unchecked until F-06 evidence.

## Lead decisions (HRP, 2026-10-19)
- DK holiday payer mode is owned by Payroll (P7, company/pay-group setting). HR's `holidayPayRoute` is not read for DK; P7 shows the payer mode in its own setup.
- SE high-risk karens exemption: HR answers `UNKNOWN` until an HR input exists; P6 shows the missing-fact blocker. The HR input is added to H2 at CP-H2.6 (lead amends H2 before batch B's SE sick-pay screens are accepted).
- `socialInsuranceCoverage[]` is edited by HR on the Pay details tab, sensitive and audited; the ERP lead reviews the sensitive scope (HRP-66).
- Org facts O-1…O-4 go to the ERP lead (HRP-66); until they exist, the rig shows a missing-Org-fact blocker.
