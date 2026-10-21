# Payroll P7 — Denmark country workbench screen draft

Status: DRAFT / NOT APPROVED / fixture only, 2026-10-17.
Owner: P7 worker; integration lead owns shared rig and checkpoint.
Contract: `NeoERP-BackEnd/docs/api/payroll-v2-p7.md`.
This file specifies screen states; it contains no production implementation.
Official sources and open practitioner gates are in contract §2/§13.
Every fixture is synthetic, all rules UNCHECKED, readiness PARALLEL_ONLY.

**Batch A · 2026-10-19 — current shared import coverage.** The draft rig uses synthetic source fixtures only in the shared **Upload → Mapping → Preview → Apply → Done** journey. Mapping and apply each require reselecting the matching synthetic source; this demonstrates source binding without a physical file, parser, HR matcher or engine. The country profile is a tax-card file profile; verified parser/source support remains pending. P7-A1 inherits the single [P1-43 amendment](../../../NeoERP-BackEnd/docs/api/payroll-v2-p1.md) (§2 and §8.2); it no longer proposes a separate country transport or approval. P1-43 remains Draft with ERP sensitive-data review and Jabran approval open.

The shared scenarios cover expiry (410 `IMPORT_PREVIEW_EXPIRED`, clear stored preview rows), changed source (409 `IMPORT_SOURCE_CHANGED`, no preview/mapping/card mutation), stale card, HR unavailable, own-row rejection/counts, confidential refusal before any write, permission lost after preview, partial applied/skipped counts, file-free JSON discard and retry. Production mapping/apply inherit multipart `command` plus same `sourceFile`; missing file/command → 400. TTL is configurable with recommended `PT30M`. Profiles specify non-ID row fingerprints/order; raw files/IDs are request-only, cleared on every outcome and never persisted/logged/returned. Apply freshly checks HR pairs, company/pay-group/year eligibility, confidentiality and own association; newly forbidden confidential candidates refuse atomically, ineligible/unmatched rows skip/count and own rows reject/count under P1-29. Replay reauthorizes currently without a second HR call or write. Synthetic coverage proves no real file/parser/engine behavior and grants no country readiness.

## 1. Entry and page structure

Current prototype coverage is session-only: import preview, mapping, pair validation,
skipped rows, replay/conflict snapshots, nonfinancial run-impact facts, source/pilot
readiness, country arithmetic examples, reporting preview, upload simulation, correlated
feedback and reasoned correction history. Source bindings are synthetic; the prototype
reads no physical source file. These states demonstrate the proposed behavior.
The detailed provider, file-writer, contribution-engine and refund flows below remain
contract proposals for future implementation; the prototype performs no actual reporting.

Enter Payroll → Setup → Country workbench, route `#pay:kystdk|setup|country`.
The prototype release label is `DK-2026-P7-DRAFT`; Org country remains DK.
Company context is fixed by the selected company; country picker cannot change Org.
Header: “Denmark · 2026”, release `DK-2026-P7-DRAFT`, “Parallel testing only”.
Persistent banner: “Danish rules need practitioner checks and a customer pilot.”
Summary shows source checks, missing employer facts and pilot status separately.
A source URL or fetched date never changes a rule badge to Checked.
Sections: Tax cards; Contributions; Holiday pay; Sickness refunds; Filing readiness.
Each section displays its source date, effective period and outstanding conditions.
Coming company shows P1 coming state; no writable fallback to another country.
No tab says Live, Ready, Sent or Accepted merely because a preview succeeded.

## 2. Roles, actions and page states

SETUP.READ sees country evidence/aggregate applicability; no employee amounts.
EMPLOYEE.READ sees employee card history, confidential restrictions still apply.
TAX_CARD.IMPORT offers upload/mapping/apply; EMPLOYEE.UPDATE offers manual card entry.
FILING.READ shows filing totals only; FILING.CONTENT.READ adds records/files/receipts.
RUN.PREPARE plus PAYSLIP.READ offers refund worksheet preparation.
Payroll approver does not gain setup mutation through approval rights.
Accountant sees filing totals without employee list/CPR or file download.
HR admin and manager have no default Payroll access.
User with no rights gets existing no-access page, not disabled editable forms.
Loading uses skeleton; unavailable source uses existing failure with retry.
Offline strip preserves unsaved input, blocks server mutations and offers no fake save.
Tenant switch clears previous company data before loading the next company.
Cross-company deep link returns not found; no existence hint or cached employee name.

## 3. Tax-card import journey

Tax cards row shows active year, MAIN/SECONDARY/FREE label, source and effective date.
Danish explanatory labels: Hovedkort, Bikort, Frikort; persisted common enum stays shared.
Primary action “Import tax cards”; API connection reads “Later connection” in this draft.
Step1: tax year, verified format and file; explain that CPR alone cannot identify employees.
Mapping and review: matched/unmapped/unmatched/rejected counts, masked identity only.
A file employeeId supplies mapping; otherwise select employee through HR search picker.
Picker filters company and returns employeeId; never free-form UUID or CPR search.
Saving a mapping requires reselecting the same source file: inherited P1-43 multipart `command`
JSON `{version,rows:[{rowIndex,employeeId}]}` plus `sourceFile`; server parses afresh and
validates employeeId plus source nationalId pairs with HR. No national-ID-only lookup.
A row remains unmatched if HR says false; UI cannot override identity validation.
Duplicate employee mapped twice shows row errors and blocks that mapping.
Unknown/unmapped/unmatched rows are listed and skipped on apply, with exact counts.
Own-pay row reads “Someone else must change your tax card” and is rejected.
Owner exception follows existing single-person reason flow only when server permits.
Apply confirmation shows matched count and skipped/rejected totals, not “all imported”.
BOTH Save mapping and Apply require the same reselected source file (P1-43; local P7-A1). Apply sends
multipart `command` JSON `{version,ownerSelfChange?,ownerSelfChangeReason?}` plus `sourceFile`.
Bind exact preview byte digest, employer, tax year, parser profile and row order; reject any
mismatch without mutation. Parse afresh and freshly HR-pair-validate before either mutation.
Copy: “Select the same file again to confirm identities. The file is not saved in Payroll.”
Clear bytes, parsed IDs and buffers after every outcome; no storage/log/error echo/proof store
may contain national IDs. P7-A1 inherits P1-43; shared sensitive-data review and Jabran approval remain open.
Discard remains JSON with no source file; same-request stored-result replay repeats no HR call.
HR unavailable keeps preview and mapping, shows “Cannot verify employees now”.
Stale preview/version conflict requests refresh; no silent last-write-wins.
Apply success lists actual applied/skipped counts and links affected stale runs.
Discard retains authorized audit metadata, clears uploaded sensitive draft bytes per policy.
No raw CPR, uploaded card data or rates appear in telemetry/error payloads.

## 4. Card detail and manual fallback

History shows immutable previous versions, authority reference, source and valid dates.
MAIN shows rate plus period allowance and employee payer instruction evidence.
SECONDARY shows rate without allowance; no copied MAIN allowance.
FREE shows authority balance, as-of timestamp and rate after exhaustion.
Do not show54,100 as every person's annual allowance or locally editable free-card total.
Instruction hint: “Use the main card at one payer; follow the employee's instruction.”
Subscription panel separates employer access from the employee's payer choice.
States: Not configured; Authorization required; Pending; Active; Ended; Failed.
Retrieval is absent in this file-first prototype; an authorization badge cannot fake connection.
Manual fallback opens existing card form with official evidence/reference and reason.
Common percent/allowance fields and validated DK fields use typed controls.
Before save: effective date, year, source, instruction and applicable pay periods summarized.
No-card state explains55% without allowance plus applicable AM; youth AM exception remains.
A future card update marks CALCULATED run stale; already approved/paid figures remain visible.
Success copy says “Card recorded. Recalculate affected draft runs.”

## 5. Contributions and age-year fixture

AM panel says “8% on the applicable basis; first applies in the year the employee turns18.”
FixtureA: birth2009,2026 payment, AM-only basis10,000 →0.00, UNCHECKED.
FixtureB:18th birthday31December2026,January payment same basis →800.00, UNCHECKED.
The label states “AM-only arithmetic example”, not a full payslip or net-pay promise.
ATP panel uses pay frequency and liable hours with source provenance.
Monthly example117h shows employee99.00, employer198.00, total297.00 DKK.
116.5h example shows66.00/132.00; threshold changes at117, not rounded whole hours.
AM youth exemption does not automatically exempt a16/17-year-old from ATP.
Missing age/coverage/hours/payer fact shows “Needs HR evidence” and blocks calculation.
Samlet Betaling shows scheme rows: eligible/exempt/unresolved with evidence reason.
FerieKonto admin fee appears only for employees/months reported to FerieKonto.
Contribution estimate and actual quarterly invoice are labelled separately.
No global employer-tax percentage or universal flat per-worker cost appears.

## 6. Holiday pay setup and trace

Select “Salary during holiday + supplement” or “Holiday allowance to registered payer”.
Explain salary entitlement conditions, not an automatic monthly-vs-hourly toggle.
Statutory1% supplement and12.5% allowance appear with their conditions/source dates.
Company agreement above minimum requires policy evidence and effective date.
Holiday payer picker uses existing company payee registry with approved account status.
FerieKonto/fund mode explains net reporting after tax; employer/admin mode gross-at-payment.
Unverified collective guarantee/payer registration shows blocking message.
Calculation preview separates eligible basis, FUND gross taxable expense earning,
attributed AM/A-skat and monthly net fund transfer from EMPLOYER-mode accrual/release.
FUND mode shows no `HOLIDAY_PAY_ACCRUED` line and no accrual/release action.
Do not show simultaneous12.5% and salary+1% for the same entitlement segment.
Leave entitlement/days link to HR; payroll cannot edit HR leave balance here.
Settlement links HR-approved unused days, source version and evidence; no cash override.
Any scheme change shows affected future dates and immutable prior payments.

### Posting and payee evidence — HRP-74/76, amended HRP-77 (Draft)

| Component | Expense / debit | Liability / credit | Payee and evidence |
|---|---|---|---|
| Salary / net pay | `PAYROLL_EXPENSE` | `PAYROLL_PAYABLE` for net | Employee payment follows P3; no payable payee tag on net. |
| A-skat / AM-bidrag | No employer expense for withheld amounts | `PAYROLL_TAX_PAYABLE` / `AM_CONTRIBUTION_PAYABLE` | Tax-authority split stays separate from ATP and holiday transfers. |
| ATP employee / employer shares | Employer share only: `ATP_EXPENSE` | Existing `ATP_PAYABLE` | Required Samlet Betaling payment reference, never fabricated. Show “not yet mapped (pack 2026.4)” until the actual pack maps the component/tag and the real payment reference is supplied; an existing account alone is insufficient. No new ATP role. Keep the reference on P3 payment evidence. |
| Other Samlet Betaling employer schemes | `EMPLOYER_CONTRIB_EXPENSE` | Existing `EMPLOYER_CONTRIB_PAYABLE` | Separate AUB, AES, Barsel.dk and financing-contribution evidence. Component/recipient/reference mapping stays pending until supported by the actual pack and verified scheme/payment reference; no invented authority, reference or second invoice. Unsupported pack 2026.4 mapping shows “not yet mapped (pack 2026.4)”. |
| Contracted pension | Employer only: `PENSION_EXPENSE` | `PENSION_PAYABLE` | Approved fund/insurer payee under the agreement; no universal rate. |
| Holiday accrual / employer route release | Accrual: `HOLIDAY_PAY_EXPENSE`; release debits `HOLIDAY_PAY_ACCRUED` | `HOLIDAY_PAY_ACCRUED` in EMPLOYER mode | Keep `HOLIDAY_PAY_*` in EMPLOYER mode; salary/supplement and allowance routes cannot duplicate entitlement or expense. |
| FUND-mode monthly holiday earning (part 1) | DR `HOLIDAY_PAY_EXPENSE`, taxable earning at gross | No holiday-accrual credit | Included in the AM-bidrag and A-skat bases. FUND mode is an expense transfer, with no `HOLIDAY_PAY_ACCRUED` line and no accrual/release. |
| FUND-mode monthly net holiday transfer (part 2) | No liability-release debit | CR `HOLIDAY_FUND_PAYABLE`, net only | Required `AUTHORITY:DK.FERIEKONTO`; gross minus the attributed AM-bidrag and A-skat, kept out of employee net pay. Never credit the gross. Mapping awaits pack 2026.4. |
| Union dues | No employer expense for an employee deduction | `UNION_DUES_PAYABLE` | `UNION:{registry number}`, one payee per union; pack 2026.4. |

The new FUND-mode role is `HOLIDAY_FUND_PAYABLE`, not a newly proposed
`FERIEKONTO_PAYABLE`. The legacy pack 2026.2 role is no fallback for a missing
2026.4 map. Preserve FUND gross earning, attributed tax and net transfer as the
two-part monthly posting in P2 §5.6/§5.7; it has no accrual and no release. Keep
EMPLOYER-mode accrual/release separate. Neither salary payment nor a Samlet
Betaling invoice settles another fact. DK has no holiday-pay contribution accrual;
AM-bidrag and ATP are not accrued against a holiday liability (P2 §5.7).

The per-run posting preview shows component → role → payee, EMPLOYER-mode
accrual/release, FUND-mode expense/net transfer, and separate payment evidence. Accounts resolves accounts from its versioned pack;
Payroll sends no account numbers or fallback account and keeps no second ledger.
A missing pack 2026.4 component/role/tag mapping reads “not yet mapped (pack 2026.4)”
and blocks the affected posting; an existing role alone does not prove that its
country component or payee tag is mapped. A missing payee blocks the affected
posting/file. No ready badge or zero amount substitutes for missing evidence.
P1-39/P3-28 retain the approved account version and requester/maker restrictions;
a waiting change never pays to its unapproved successor. P3-34/P4-14 retain links
to the same frozen PAID payment fact and recorded statutory deposit, with no duplicate
settlement or new payment from a filing. File generation/upload is not payment.
All previews remain Draft/UNCHECKED and parallel examples cannot post or settle.

## 7. Sickness refund worksheet

Open from HR-approved absence reference via existing employee picker/context.
Summary shows first/last absent dates, paid wages/benefits, hours and source version.
Do not display diagnosis or assume full salary entitlement from SICK classification.
Deadline selector explains which payment situation chose the reporting deadline.
Wages beyond30days:5weeks from first absence; benefits first30days:1week after stop;
no wages/benefits:2weeks from first absence, each with source and UNCHECKED badge.
Special insurance/§56/flex/maternity cases show “Special rule requires review”.
“Prepare worksheet” yields immutable draft with Not sent status and evidence fingerprint.
Worksheet is not a claim submission, approval or booked reimbursement receivable.
HR change shows “Absence changed; prepare again”; preserve previous evidence reference.
External receipt, authority decision and actual cash payment are separate rows.
No artificial “Claim accepted” toast; timeout/unknown stays “Check external result”.

## 8. eIndkomst and correction journey

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

Select eIndkomst (`DK_EINDKOMST`). Show employee-payment records with actual
payment/disposition date and separate income-period dates. Exact 2026 schema,
employer category and deadline calendar remain unchecked; no universal monthly
deadline. The simulation does not establish an official filing period/format.

Correction uses CORRECT_PERIOD: choose the targeted original version/reference,
retain its period/payment references, supply reason and affected/rejected record keys.
Partial rejection leaves accepted employees unchanged; no “Reverse whole file” or
“Add to next month”. Money correction first needs a PAID correction run. The source
candidate A-skat/AM cutoff is 15 February following the income year (P7 DK-S15);
show Pending verification for exact boundary/calendar/field applicability. A disallowed
historical tax correction shows CORRECTION_CUTOFF_PASSED and the authority/practitioner
route, without generating forbidden tax fields. Other fields need their checked profile.
A new child begins without acceptance evidence and links to the unchanged parent.

Country checks: rejected keys only; accepted originals preserved; unknown/cutoff-passed
profile blocks; missing external reference refuses; no correction money from unpaid
runs; preflight and actual format generation remain separate. Purged evidence shows
Expired. Read-only accountant view has no employee names, diagnostics or file links.

## 9. Responsive and acceptance notes

390px stacks summary/cards and uses labelled row details; no clipped action/footer.
768px allows two summary columns; tables retain usable search/filter controls.
1024/1280px show workbench columns without changing action order or meaning.
Use existing search pickers, server actions[], focus/error patterns and accessible labels.
Any new string key starts payroll_dk_; styles use pay-; no route or Tweaks changes.
Required fixture checks: import wrong pair, mapping/apply source-binding mismatch, fresh
HR pair revalidation, no-ID retention/buffer clearing, unmapped skip, own pay, HR/IAM outage,
stale card/run, age-year boundary, ATP threshold, holiday payer unresolved,
refund conditional deadline, generated-vs-accepted, partial rejection and tenant switch.
Rig integration/test evidence belongs to root checkpoint; this file claims none completed.
Approval requested only after concrete contract+screens and open-rule disposition are reviewed.

## B2 setup illustration — 2026-10-20 (HRP-68, Draft)

The country workbench has employee/company scopes and five topics: MAIN/SECONDARY
card and deduction, AM, ATP, holiday payer mode and sickness refund. Each shows
applicability, linked source/edition, unverified payee, owner-named read-only facts,
sample controls, tagged trace and owner blockers. No save, persistence, readiness,
payment or filing action is provided.

Actual Org O-2 is unavailable in every topic, with the company-settings blocker
visible. CURRENT is the default and has no money. Explicit ILLUSTRATIVE is a
FIXTURE response, retaining the real blocker and Pending verification warning.
Missing HR / missing Org / missing Payroll / refused / invalid states suppress
monetary candidates. Source-response choices never edit HR or Org.

Tax illustrates sample authority-card rate and period deduction for MAIN, none for
SECONDARY, or proposed 55% without allowance for no card. The basis is already
resolved A-tax-only income. Primary-card payer instruction/date/evidence belongs
to the employee, recorded in Payroll, with its missing-evidence blocker visible.
AM is separate proposed 8% after eligible ATP/pension deductions: turning 18 in
2026 applies from January; turning 18 after 2026 is exempt in 2026. ATP uses
independent age/coverage evidence and proposed monthly thresholds 39/78/117 hours.
HR `job.hoursBasis` is read-only. NOT_RECORDED blocks rather than implying FTE;
unknown-hours conversion needs verification.

Payroll owns holiday payer mode; HR `holidayPayRoute` is not read. Controls
separate earned basis, opening liability and sample payment/release. Accrual is
proposed 12.5% allowance OR conditional 1% supplement, and closing = opening +
earned − payment. Earned/closing are Intermediate, payment is Payslip. Fund net
withholding attribution remains pending with a visible payer-mode timing note.
Tax, AM and employee ATP are negative Payslip deductions. Employer ATP is Employer
cost and never Payslip.

Refund has no monetary candidate: conditional source-based deadlines, HR
absence/revision/eligibility requirements, Payroll evidence blocker and Not sent
worksheet are visible. No salary netting, receivable, claim or authority receipt.

Worker standalone checks cover both scopes × five topics × five source states,
negative deductions, ATP fractional thresholds, employer/payslip separation,
holiday earned/payment/liability arithmetic, CURRENT/no-money, invalid/refused
suppression and guard-first denial. Root owns integrated Babel/browser checks;
this document claims no integrated check result.
