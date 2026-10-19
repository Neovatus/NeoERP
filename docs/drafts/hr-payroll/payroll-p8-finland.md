# Payroll P8 Finland — proposed screen flow and source gates

**DRAFT / UNCHECKED / NOT APPROVED**, researched 2026-10-18.
[Proposed P8 contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p8.md) owns source
register FI-S1–FI-S16, DTOs, rules and approval gaps. Design scope only; no production.

Prototype coverage: guarded synthetic import preview/mapping/apply, applied/skipped
counts, nonfinancial stale-run indications, illustrative rate cases and family-specific
filing preview/upload/feedback/correction simulation. It has no physical source file,
parser, real HR identity pairing, country engine, statutory writer or authority API.
The complete future flow below is a proposal, not a claim those services exist.

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

## 4. Upload → preview → map → apply

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
The file is not saved in Payroll.” JSON-only requests insufficient until P8-A1 approved.
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

Use existing Filings, with explicit family selector:

| Family | Inputs / visible distinction |
|---|---|
| Earnings payment (`FI_IR_EARNINGS_PAYMENT`) | Payment event/date, employee report reference, pay-period dates, paid eligible income/deductions, insurance facts; ordinary 5 calendar day deadline after pay date. |
| Employer separate (`FI_IR_EMPLOYER_SEPARATE`) | Payment month, regular/occasional employer, health total/deductions, no-wages where required; nominal 5th next month. |

Payment date differs from pay period/earnings period. Payment June 15 for May is June payment
report; do not wait for June close. Show legal calendar adjustment rather than claiming
Saturday June 20 or Sunday July 5 is the final deadline. Filing deadline and tax payment due
are separate. Regular-employer no-wages and noncash-benefit obligations need P8-A2
noncash immutable facts; no fake zero PAID events. Missing shared model remains blocked.
Prototype earnings simulation requires a valid 2026 paymentDate matching the selected
month and a bounded sample paymentEventRef. Employer separate uses month only.
Correction retains family, payment date and sample reference; changing these keys
requires future cancel/new flow. These references are synthetic, not actual PAID
event selections. Prototype does not generate actual statutory data.

Preview lists record count, source paid references, family/scope, totals, blocking problems
and exact 2026 profile status. Generate actual file blocked until schema CHECKED and
source facts ready. Future writer rereads own bytes and reconciles immutable facts.
Official manual XML upload exists; exact delivery schemas mandatory, no 2027/FromIR substitution.
Display “Upload in the Incomes Register” and preserve manual operator responsibility.
No authority credentials or direct submission controls; D7 later.

## 9. Evidence and corrections

Generated, uploaded, received and accepted are visibly separate. Simulated upload gives
PENDING, not accepted. Feedback must match current company/family/file version/reference;
wrong reference refuses. Idempotent same receipt causes no extra history; conflict refuses.
Future genuine evidence uses existing P4 receipt flow with proposed P8-A3 fields; scans
pending uploader only, clean available, rejected bytes removed without changing money.
FILING.READ totals only; employee/file/receipt content requires CONTENT.READ and audit.

Correction opens new immutable version referencing prior company/family/scope with reason.
Replacement resends complete contents including unchanged data, keeping register reference.
Cancellation is a distinct irreversible authority operation; certain key changes need cancel
and new report. No generic replacement claim covers every correction. Verify 2026 matrix.
Retain original, cancellation, new report and feedback in history. Money changes use PAID
correction runs; cancellation never undoes PAID/journal/payment. Partial batch feedback
keeps accepted reports intact and targets failed report references only. Recovery/unjust
enrichment needs sourced specific treatment before production.
Current rig supports correction history simulation only; cancellation/export details
remain contract/screen proposal and a gate, not an implemented authority workflow.

## 10. Acceptance and next approval

Require exact source mapping/apply fresh pairing/no ID persistence, wrong pair/duplicate,
replay/confidential revocation/own link change/cross-company/stale versions; residual same-
employer concurrency/revised-card cases; insurance/age/month threshold boundaries;
holiday methods/no double health/balanced postings; two-family date validation, paid-only/
no-wages/benefits-only, replacement/cancel/new, partial feedback and correlated receipts.
All source/format rows UNCHECKED, pilot NOT_RUN, PARALLEL_ONLY until formal review,
practitioner/source approval and real employer pilot. P1/HR/P2/P3/P4 owners must approve
shared amendments. Jabran then approves screen+contract before production implementation.
