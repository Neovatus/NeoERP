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
Calculation preview separates eligible basis, earning/accrual, withheld tax, transfer and net.
Do not show simultaneous12.5% and salary+1% for the same entitlement segment.
Leave entitlement/days link to HR; payroll cannot edit HR leave balance here.
Settlement links HR-approved unused days, source version and evidence; no cash override.
Any scheme change shows affected future dates and immutable prior payments.

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

Open Filings → eIndkomst; display paid events with payment and income-period dates.
PARALLEL/unpaid events show excluded reason; no downloadable live authority file.
Generation with unverified schema shows explicit draft-preview-only status.
Generated badge says “File generated”; external submission is a distinct recorded action.
Authority result panel starts Unknown; receipt is not automatically an acceptance.
Partial rejection fixture shows accepted records retained and one rejected record to correct.
Correction opens a new version with original record/payment/period references.
Never offer “Reverse whole file” after partial rejection or “Add to next month”.
Historical A-skat/AM cutoff shows authority/practitioner action after15February next year.
PAID cannot be undone; period-moved event points to correction run before filing.
Receipt upload uses existing type/size/scanning states; pending visible only to uploader.
Content rights are rechecked on every download; purged file shows Expired.
Read-only accountant view omits all records, file links, receipts and employee names.

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
