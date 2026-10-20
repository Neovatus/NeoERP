# Payroll P8 Finland — proposed screen flow and source gates

**DRAFT / UNCHECKED / NOT APPROVED**, researched 2026-10-18.
[Proposed P8 contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p8.md) owns source
register FI-S1–FI-S16, DTOs, rules and approval gaps. Design scope only; no production.

Prototype coverage: guarded synthetic import preview/mapping/apply, applied/skipped
counts, nonfinancial stale-run indications, illustrative rate cases and family-specific
filing preview/upload/feedback/correction simulation. It has no physical source file,
parser, real HR identity pairing, country engine, statutory writer or authority API.
The complete future flow below is a proposal, not a claim those services exist.

**Batch A · 2026-10-19 — current shared import coverage.** The draft rig uses synthetic source fixtures only in the shared **Upload → Mapping → Preview → Apply → Done** journey. Mapping and apply each require reselecting the matching synthetic source; this demonstrates source binding without a physical file, parser, HR matcher or engine. The country profile is a tax-card file profile; verified parser/source support remains pending. P8-A1 inherits the single [P1-43 amendment](../../../NeoERP-BackEnd/docs/api/payroll-v2-p1.md) (§2 and §8.2); it no longer proposes a separate country transport or approval. P1-43 remains Draft with ERP sensitive-data review and Jabran approval open.

The shared scenarios cover expiry (410 `IMPORT_PREVIEW_EXPIRED`, clear stored preview rows), changed source (409 `IMPORT_SOURCE_CHANGED`, no preview/mapping/card mutation), stale card, HR unavailable, own-row rejection/counts, confidential refusal before any write, permission lost after preview, partial applied/skipped counts, file-free JSON discard and retry. Production mapping/apply inherit multipart `command` plus same `sourceFile`; missing file/command → 400. TTL is configurable with recommended `PT30M`. Profiles specify non-ID row fingerprints/order; raw files/IDs are request-only, cleared on every outcome and never persisted/logged/returned. Apply freshly checks HR pairs, company/pay-group/year eligibility, confidentiality and own association; newly forbidden confidential candidates refuse atomically, ineligible/unmatched rows skip/count and own rows reject/count under P1-29. Replay reauthorizes currently without a second HR call or write. Synthetic coverage proves no real file/parser/engine behavior and grants no country readiness.

## 1. Entry, country and release

`#pay:hki|setup|country` opens Setup → Country workbench for Helsinki, Finland, EUR.
Show `FI-2026-P8-DRAFT`, tax year 2026, UNCHECKED / NOT_RUN / PARALLEL_ONLY.
Show independent statuses for rules, card parser, insurance policies, XML profiles,
practitioner and employer pilot. Source links and arithmetic cannot mark CHECKED/READY.
No rule-status toggle. Unsupported country/year/company profile remains visibly blocked.
Do not reuse published 2027 rates/schema for 2026 or invent approved baseline status.

## 2. Permissions, privacy and failure states

Existing SETUP.READ opens safe setup metadata; server-provided actions gate writes.
Tax-card import needs PAYROLL.TAX_CARD.IMPORT; card edit EMPLOYEE.UPDATE.
HR admin/ESS have no Payroll default. Platform Enter-company writes refused.
Own pay checks use current IAM user/employee link; confidential rows need current
CONFIDENTIAL.READ at preview/map/apply/replay. Revoke/change after preview refuses
atomically without revealing stored card results. Owner exception follows inherited
approved reason+fresh zero-other-holder check; unknown holders fails closed.
Company/persona switches clear selection, transient error/preview/report state.
Offline/dependency failure preserves safe draft, disables mutation and explains retry;
no false zero rate, MATCHED or acceptance fallback. Cross-company IDs404.

## 3. Employee verokortti panel

Existing employee pay card shows authority issue/reference, year/validity, income
category, basic/additional percentages, income ceiling and ceiling scope dates.
Display previous card history. New card replaces version, never deletes prior card.
Reason mandatory for manual entry. Revised card presents explicit opening/scope
validation rather than blindly resetting prior income to zero or subtracting all YTD.
No-card/international unsupported decisions show source-check gate; do not guess rate.
Employee pension/unemployment remain deductions separate from card gross basis;
employee health is already included in withholding, not another net deduction.

Residual panel explicitly says “This employer only”. Show paid eligible wages,
other-run reservations, current basic/excess split and card version/date interval.
Example ceiling 50000, own prior 49000, pay 3000, card 20%/40% => withholding 1000.00.
These are hypothetical card rates. Explain other employers use the same wage card
but do not share NeoERP residual or expose their pay. Employee monitors combined
income and obtains revised card. Do not imply this employer knows total annual income.
Changed card/calculated reservation shows Recalculate; approved/paid money stays frozen.

## 4. Upload → Mapping → Preview → Apply → Done

Choose taxyear and verified wage-card exchange profile. Real supported parser is pending;
prototype scenario picker clearly supplies synthetic rows, not statutory ingestion.
Preview changes no card. Show digest/profile/year, eligible/skipped and row states:
MATCHED, UNMAPPED, UNMATCHED, REJECTED. Show masked identity only, safe diagnostics,
authorized employee name/code and proposal versions. Never search by national ID.
Use existing HR-directory picker for unmapped rows. Wrong pair remains UNMATCHED;
duplicate employee selection blocks. User cannot mark a pair MATCHED by assertion.

Future mapping AND apply require same-source reselect: multipart `command` JSON
with version/mappings or apply body, plus `sourceFile`. Compare exact preview byte
hash/employer/year/parser profile/row order then reparse transiently and ask HR for
fresh paired-match result. Copy: “Select the same file again to confirm identities.
The file is not saved in Payroll.” P8-A1 inherits P1-43; shared sensitive-data review and Jabran approval remain open.
Source mismatch leaves mapping/cards unchanged. No national ID in command, storage,
logs/errors/audit, localStorage/sessionStorage or retained proof store. Source bytes
and parsed IDs clear on every request outcome. Rig uses synthetic server bindings only.

Before apply show eligible/skipped counts; after show actual applied/skipped counts.
Unmapped/unmatched/rejected rows skip with reason. Fresh permission/own/confidential,
active card/preview version and HR pairing checks run before any matched-row mutation.
Conflict refuses whole batch; refresh/revalidate before retry. Same authenticated
idempotent request replays original safe counts without extra versions/audit.
Discard is versioned JSON no file; removes only pending draft. Never roll back paid money.

## 5. Pension, unemployment and health preview

Show HR-sourced eligibility, employment/coverage dates, TyEL insurer/policy/version,
monthly employer wage aggregation and applicable year. No editable birth date in Payroll.
2026 TyEL employee 7.30% uniform; illustrative eligible 3000  => 219.00. Missing actual
insurer rate blocks employer amount; reference 17.10% average must not become a default.
Age 17 start/cohort upper 68/69/70 and monthly 71.72 threshold require checked month fixtures.
Foreign coverage/YEL/public-sector cases block rather than zero contribution.

Ordinary employee unemployment 0.89% ; 3000  => 26.70. Employer annual ordinary base threshold
2509500, 0.31% then 1.23%; show threshold state across runs and serial reservation evidence.
Part-owner/special employer/age/1500 liability rules are separate coverage, never standard
rate assumed for all. Example prior 2509000 + new 1000 => employer 7.70.
Employer health 1.91%, eligible 3000 => 57.30. Coverage age 16–67 shown; employee health
included in withholding. Insurer accident/group-life unresolved cannot become zero.
These are component examples, not complete net salary or legally checked payslips.

## 6. Holiday pay and lomaraha

Show HR earning year/qualifying months/leave unit facts and policy method/agreement version.
Separate salary-paid holiday, average-daily and eligible percentage methods.
2/2.5 weekday accrual depends on service/qualification; do not rewrite HR days.
Verified percentage 9%/11.5% eligible 10000 gives 900/1150; not an extra on every salary.
Lomaraha is agreement-based, with terms and applicability, never universal 50% switch.
Show liability opening+earned/remeasured-paid/released=closing and separate employer
contribution accrual/release. Prevent paying salary and incompatible compensation twice.
Termination, absences and incomplete agreement send user to practitioner/source gate.

## 7. Run, accounting and pay continuity

Existing Calculate/Approve owns contribution/tax sequence and stale fingerprints.
Country/policy/card changes require recalculation; contributors cannot approve themselves.
Journal uses P2 roles, not hardcoded chart numbers; show TYEL insurer and Employment Fund
mapping gate (P2 currently drops unemployment payeeRef). Accounts must resolve before build.
Paid amounts feed reports, not speculative calculation. P3 requires approved employee/payee
account version and bank requester separation. Generated bank file does not mark PAID;
PAID is one-way, corrected only through existing correction run. No country undo-pay.

## 8. Two reporting families

HRP-69 Batch C (Draft): reuse Backend P4 §2b, P4-A9…A14. Start with a
preflight showing family/recipient, period or PAID event, source snapshot references,
content access, profile/year check and blockers. Identity/content is opt-in under
FILING.CONTENT.READ; accountant FILING.READ sees totals/outcome counts only.
Money comes only from linked PAID frozen snapshots and recorded deposits. Facts-only
and CANCEL previews have no totals/money/deposits and create no payment/run/line.
Unpaid, PARALLEL and PERIOD_MOVED events cannot supply monetary content.

Use P4's shared correction and evidence journeys: GENERATED → UPLOADED → ACCEPTED /
ACCEPTED_WITH_WARNINGS / PARTIAL / REJECTED, with NOT_RECORDED for unknown feedback.
Upload never implies acceptance. Manual feedback checks company/family/recipient/
period/reference/version hash; same message/content replays, conflict refuses, partial
requires affected record diagnostics. File evidence is ≤10 MB, byte-type checked and
scanned; PENDING is uploader-only, rejected bytes removed. Diagnostics/files need
CONTENT.READ and audit. Warnings remain visible; rejected/partial feedback prompts
correction. History retains every prior version and its bytes/evidence unchanged.
Feedback changes no money, posting, deposit or payee payment. D7 still forbids live
calls. All rig outcomes say Simulation, every sample download/preview says
“Sample — not an official format”; UNCHECKED / PARALLEL_ONLY remain visible.
Country formats, calendars, practitioner verification and pilots stay open gates.

| Family | Required distinction |
|---|---|
| Earnings payment (`FI_IR_EARNINGS_PAYMENT`) | P4-A10 PAYMENT, one filing per PAID event/scope, stable report_ref. Actual payment date differs from earnings period; ordinary 5 calendar days after payment with checked nonbusiness-day/exception rules. Generate before month end. |
| Employer separate (`FI_IR_EMPLOYER_SEPARATE`) | MONTH, payment month and employer-register category. PAID employer-health totals/deductions; regular-employer no-wages declaration when applicable, candidate 5th following month with checked calendar. |

Payment June 15 for May belongs to the June payment event, independent of the
May earnings period. Two PAID events in one month remain distinct reports/deadlines.
A corrected pay date never moves the original stored deadline. Filing and tax-payment
due dates differ. No-wages uses P4-A11 NO_WAGES_DECLARATION from immutable obligation
facts, with no monetary fields. Missing facts block. Noncash-benefit-only reporting
without a real PAID event remains blocked under P4-A14; never invent a zero event.
Sample payment references are explicitly synthetic and establish no real PAID event.

Exact 2026 delivery schemas for earnings/employer/cancellation and code lists are
required. FromIR distribution schemas are not submission schemas. Manual external
XML upload is the future channel; no credentials or direct authority-submit controls.

## 9. Evidence and corrections

P4-A12 owns FI's Draft CANCEL_AND_NEW flow. Select original reference/version and
reason, generate a references-only CANCEL, record manual cancellation transmission
and the ACCEPTED/RECEIVED outcome required by the checked kind's cancel_requires.
NEW_AFTER_CANCEL is refused until that evidence exists. It gets a new report_ref;
cancelOnly ends the lineage. Every earlier original/cancel/new version remains linked,
readable and unchanged. Cancellation cannot undo PAID, journals or external payment.

The precise 2026 field/action/cancellation-evidence matrix remains a verification gate;
no generic replacement substitutes for cancel-and-new. Partial feedback retains
accepted reports and targets rejected report keys only. Money changes need a PAID
correction run; identity/fact changes need a new fact snapshot. Recovery/unjust
enrichment needs sourced specific treatment. No real cancellation or official file
is performed by a simulation. P4 §2b replaces the earlier separate P8-A2/A3 request,
metadata and evidence proposals.

## 10. Acceptance and next approval

Require exact source mapping/apply fresh pairing/no ID persistence, wrong pair/duplicate,
replay/confidential revocation/own link change/cross-company/stale versions; residual same-
employer concurrency/revised-card cases; insurance/age/month threshold boundaries;
holiday methods/no double health/balanced postings; two-family date validation, paid-only/
no-wages, blocked noncash-only, cancel/new, partial feedback and correlated receipts.
All source/format rows UNCHECKED, pilot NOT_RUN, PARALLEL_ONLY until formal review,
practitioner/source approval and real employer pilot. P1/HR/P2/P3/P4 owners must approve
shared amendments. Jabran then approves screen+contract before production implementation.

## 11. HRP-68 B2 · money-trace design clarification (Draft)

Finland employee and company-setting scopes provide **Tax card / TyEL / Insurance /
Holiday pay**, all five sample source states, source/version, applicability,
unverified payee and owner action. Company scope uses a selected employee as the
sample basis, never a company total. Org O-3 sector and employer-register category
remain visibly blocked everywhere, with no ordinary-employer default. Required HR
coverage, derived age, employment and leave facts are read-only missing-fact
blockers; no raw DOB, national ID, bank or health data is exposed.

Default **Current response** produces no money. Explicit **Illustrative complete
response** demonstrates synthetic pending arithmetic while retaining real HR/Org
blockers. Missing HR / company / Payroll, refusal and invalid input suppress every
monetary trace in either mode. These controls simulate responses, never source
edits; state is component-only with no save, persistence or readiness change.

- Tax: original/revised card scopes, own-payer opening and other-run reservations
  determine ceiling split. Revised opening is employee-declared and needs future
  Payroll reason/evidence recording. No automatic reset; other employers' pay stays
  unknown. Hypothetical card 20%/40% demonstrates the split only.
- TyEL: sourced unchecked 7.30% employee candidate, and adjustable **fabricated
  sample insurer-agreement 16.2%** employer share. No universal employer premium.
  Actual insurer policy/payee, month/cohort and coverage remain verification gates.
- Insurance: synthetic HR `job.insuranceCategory` ORDINARY / PART_OWNER and derived
  eligible age/coverage demonstrate different unemployment deductions, annual
  employer bands and separate employer health. Unknown annual liability blocks.
  Employee health is already in withholding. Accident 0.5% and group-life 0.06%
  are fabricated sample insurer-agreement inputs only; actual policies/payees
  remain unverified.
- Holiday: eligible percentage 9%/11.5% examples keep independent earned accrual,
  payment/release and liability distinct. Opening 2000 + earned 300 − payment 900
  = closing 1400. Changing earned does not change payment. Lomaraha and employer
  contribution accrual/release remain pending separate agreement verification.

Deductions are negative. **Payslip / Employer cost / Intermediate** tags distinguish
each row; employer costs never affect payslip net pay, and liability is not extra
payment. This is not a full payslip or a statutory calculation. The [P8 B2
clarification](../../../NeoERP-BackEnd/docs/api/payroll-v2-p8.md#13-hrp-68-b2--finland-money-trace-clarification-draft)
retains every existing policy, source, practitioner, pilot and approval gate.
