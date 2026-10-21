# P5 Norway — country workbench and screen-flow draft

Status: **DRAFT — not approved, not implemented, not production-ready.** Written 2026-10-17.
Companion: [P5 API contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p5.md).
The existing Payroll Setup/employee/run/filing flows remain the entry points; no new navigation shell.
This file supplies Norway detail for the shared draft rig; it does not change existing P0–P4 contracts.
Evidence: current P0–P4 contracts and [payroll screen spec](../../../NeoERP-App/docs/design/specs/payroll-p.md).
`NeoERP-Design/README.md` is absent in the inspected workspace; visual integration follows existing Payroll rig components.
All examples are synthetic; no real national ID, bank account, tax card or authority credential appears.

**Batch A · 2026-10-19 — current shared import coverage.** The draft rig uses synthetic source fixtures only in the shared **Upload → Mapping → Preview → Apply → Done** journey. Mapping and apply each require reselecting the matching synthetic source; this demonstrates source binding without a physical file, parser, HR matcher or engine. The country profile is a tax-card file profile; verified parser/source support remains pending. P5-A3 inherits the single [P1-43 amendment](../../../NeoERP-BackEnd/docs/api/payroll-v2-p1.md) (§2 and §8.2); it no longer proposes a separate country transport or approval. P1-43 remains Draft with ERP sensitive-data review and Jabran approval open.

The shared scenarios cover expiry (410 `IMPORT_PREVIEW_EXPIRED`, clear stored preview rows), changed source (409 `IMPORT_SOURCE_CHANGED`, no preview/mapping/card mutation), stale card, HR unavailable, own-row rejection/counts, confidential refusal before any write, permission lost after preview, partial applied/skipped counts, file-free JSON discard and retry. Production mapping/apply inherit multipart `command` plus same `sourceFile`; missing file/command → 400. TTL is configurable with recommended `PT30M`. Profiles specify non-ID row fingerprints/order; raw files/IDs are request-only, cleared on every outcome and never persisted/logged/returned. Apply freshly checks HR pairs, company/pay-group/year eligibility, confidentiality and own association; newly forbidden confidential candidates refuse atomically, ineligible/unmatched rows skip/count and own rows reject/count under P1-29. Replay reauthorizes currently without a second HR call or write. Synthetic coverage proves no real file/parser/engine behavior and grants no country readiness.

## 1. Rig coverage versus proposed workflow

Current integration route: `#pay:kyst|setup|country` (Payroll Setup → Country workbench).
Rig release label: `NO-2026-P5-DRAFT`; this is a simulation identifier, not a published pack release.
The workbench is session-only: preview/mapping/apply/conflict/replay stand-ins, pre-authored stale-run facts, source/pilot gates, sourced arithmetic, filing-version preview and correlated simulated feedback/corrections.
Controls must say `Simulate` or `Demo` where they resemble upload, application, acceptance or correction.
There is no actual import, physical source-file selection, identity validation, file writer, API, accounting mutation, payment, authority submission or credential handling. Synthetic source bindings stand in for file identity in the prototype.
The detailed sections below describe the **full proposed future country workflow**, beyond current rig coverage.
The production pack name `NO 2026.1` below is a proposed future release and remains UNCHECKED/PARALLEL_ONLY.

## 2. Entry and information order

Open Payroll → Setup → Country rules → Norway, selected from the company's Org country.
Header: `Norway · 2026 · NO 2026.1`, then `Draft — country rules not checked`.
Below: separate `Source review`, `Practitioner check`, `Parallel pilot` and `Country readiness` facts.
Source research completed never turns the practitioner or pilot rows green.
Main sections: Tax cards; Employer and AGA; Holiday pay and pension; A-melding.
At narrow widths use one section at a time with existing segmented/tab patterns; retain a stable page heading.
Setup is read-only for `PAYROLL.SETUP.READ`; write buttons follow exact server `actions[]`.
A user without employee access sees counts and setup rules only; no employee-tax-card rows.
Country READY is release-derived and has no toggle, button, client-set flag or fake completion action.

## 3. Tax-card first-time flow

Tax-card section leads with `Import tax cards`, tax year, source format and last import result.
Helper: `Get the file from Skatteetaten, then import it here. API retrieval comes later.`
No Connect Maskinporten button, credential box, token field or simulated successful connection.
Upload accepts only the supported checked Norwegian XML edition; unsupported edition gives a concrete blocker.
File contains national IDs; upload processing remains server-side. Do not echo IDs or raw XML in the preview.
Preview table columns: Row; Employee; Card type; Rate or table; Match; Outcome.
Unmapped row reads `Choose employee`; picker uses existing company-scoped employee search.
Saving a selection requires reselecting the same source XML; inherited P1-43 multipart `command` JSON carries version/row/Employee ID mappings and `sourceFile` carries XML. The server parses it afresh and sends Employee ID + source national ID pairs to HR.
UI never offers `Find by national ID`, a free-text national-ID search or a local matching algorithm.
Matched row reads `Identity matched`; unmatched reads `Identity does not match this employee`.
A wrong pick remains visible for correction; no other matching employee is suggested from national ID.
Duplicate employee mapping is rejected at save and row error points to both row numbers without sensitive values.
Own-pay row reads `Ask another payroll person to apply this card` unless the server offers the established Owner path.
Unmatched/unmapped rows are skipped, with counts shown before apply; they never silently become cards.
Apply control says `Apply 1 card` and adjacent text says `2 rows will be skipped` in the fixture.
P1-43 (local P5-A3) requires reselecting the same source file for BOTH Save mapping and Apply. Each sends multipart `command` JSON plus `sourceFile`; the server compares exact preview digest, employer, tax year, parser profile and row order, parses afresh and HR-pair-revalidates.
Mapping command contains version and rows; apply command contains the inherited versioned apply body. P5-A3 inherits P1-43; shared sensitive-data review and Jabran approval remain open. Discard stays JSON without a file.
Copy at mapping and apply: `Select the same file again to confirm identities. The file is not saved in Payroll.`
Changing any source binding rejects the request and leaves mappings/cards unchanged; source bytes and parsed IDs live only in request memory and clear on every outcome. No storage, logs, error echoes or retained proof store may contain IDs.
Changing the file requires a new preview; expired preview says `Preview expired. Import the file again.`
Cancellation clears active file reference and selection; discard asks only the existing reason rules where applicable.
Do not persist file, national IDs or preview contents in local storage, session storage, offline cache or analytics.
After apply, show applied/skipped counts and replaced-card history; do not toast success for every source row.

## 4. Employee card detail and stale runs

Employee Pay → Tax card shows year, method, source, effective date, active version, table/percent, employer role and PAYE badge.
Show `MAIN`, `SECONDARY` or `Confirm employer role` with clear percentage fallback behavior.
Frikort shows employer allocation and remaining allocation; no assumed total national allowance.
Missing card says `50% withholding on salary until a valid card is available`, alongside the country-rule source/check state.
PERCENT example uses synthetic 30.00%; it is not a Norwegian default rate.
Manual edit requires existing `PAYROLL.EMPLOYEE.UPDATE`, source reason and own-pay enforcement.
Manual data is labelled `Entered manually`; it must not appear `Retrieved from Skatteetaten`.
History shows old card as Replaced; source/version/effective dates remain inspectable without IDs.
When card v4 replaces v3 used in a calculated unpaid run, banner: `Tax card changed. Recalculate before submitting.`
Submit/approve controls are derived from server actions; UI cannot dismiss staleness into approval.
Approved run points to existing withdrawal/reopen path; paid run points to correction run flow.
A paid historical payslip continues showing its pinned calculation; new card cannot change its figures.

## 5. Employer and AGA section

Show legal employer and organisation number from Org; branches show effective sub-unit number and AGA zone history.
These are linked facts with `Open organisation details`, not Payroll copies editable in a side form.
A mid-period transfer shows two dated segments and respective zone/base/rate traces.
Missing zone, Ia aid opening or unsupported mobile-work/sector facts shows a blocker with owner and corrective destination.
Zone V zero contribution is supported only by complete checked facts; a missing zone is never displayed as 0%.
Ia display explains `Allowance measures the saving compared with zone I`, not a tax-free salary amount.
Employer payment card distinguishes `Withholding — next working day after payment` from `AGA — every two months`.
2026 note: `Withholding is paid directly to Skatteetaten. A blocked tax-deduction account is no longer required.`
Do not require a skattetrekkskonto or bank guarantee before a Norway setup can progress.
Authority bank/KID details are entered and approved through existing payee controls; no number is embedded in demo copy.
The account requester cannot use their own pending change; show P3 maker bar and approved account status.
Legal due dates need complete Norwegian working-day calendar coverage; missing coverage reads `Due date cannot be confirmed`.

## 6. Holiday pay and pension section

Holiday card shows qualifying year, payout year, eligible basis, statutory/agreement rate, age supplement and remaining accrual.
Separate ordinary 10.2% and agreed five-week 12% choices; pack minimum guard is server-enforced.
Show 2.3 percentage-point age supplement separately with its 6G cap and selected G effective date.
Explain the cap belongs to the supplement, not the whole holiday-pay basis.
June is the fixture's company payout schedule; copy must not call it a universal statutory deadline.
Salary reduction for holiday and holiday-pay payout are separate run lines; show prior accrual release separately from current accrual.
Use qualifying-year December G for relevant supplement calculations, or the applicable resignation-date G for a qualifying-year leaver.
Pension card shows scheme coverage assessment, employee eligibility, provider, rate and base/cap.
Copy: `Minimum defined-contribution pension is assessed from the first eligible krone; no 1G deduction floor.`
Missing membership/provider/coverage facts say `Needs review`; they cannot create an exempt employee or zero-cost result.
Provider premium reconciliation remains visible; no claim that the indicative accrual is an insurer invoice.
Posting preview uses role labels from A5. Account numbers are never hardcoded in the Norway screen.

## 7. A-melding flow

Payroll → Filings filters Norway and month; the country section links here using the existing filing route.
List has period, due date, monetary status, employment coverage, generation/submission state and separate authority feedback.
A no-pay month with active employment still shows an obligation; explain `Employment details are still required this month`.
This inherits Draft P4-A11 EMPLOYMENT_ACTIVE; actual missing HR period paging remains blocked.
Preview shows frozen PAID monetary events plus the month-specific HR employment snapshot; no invented zero-value payment.
Planned pay is a warning outside file totals; parallel run figures never join a real filing.
2026 withholding records group by payment date within the month; the preview labels that date explicitly.
Missing income-code mappings, employment facts, original message IDs or pinned schema produce a blocked Generate action.
Production draft release cannot generate a usable official file; local rig can preview only synthetic `UNCHECKED` output.
After Generate: `Generated — not submitted`; Download is never renamed `Send` or `Accepted`.
Helper links the official manual XML upload service in a browser; credentials stay entirely outside NeoERP.
Mark as submitted uses existing P4 date/reference/receipt behavior; then `Submitted · authority feedback pending`.
Receipt attachment follows scan states; pending/rejected documents never become evidence of acceptance.
Shared Draft P4-A13 captures correlated version/hash/family/period/reference and clean evidence or explanation.
Rejection reads `Authority reported errors — correction needed`; individual error details need filing-content permission.
Accepted feedback reads `Acceptance recorded from authority feedback`; never imply NeoERP submitted it directly.
Correction creates a new immutable version for the same month and targeted message; original file and feedback stay in History.
New correction initially shows pending feedback even if its original was accepted.
Financial correction links to a correction pay run; employment-only fix links to revised facts, not a duplicate salary payment.
2027 access-package cutover is a future service-access note; no 2027 tax assumptions contaminate 2026 rules.

## 8. Fixture matrix and acceptance

| Fixture | Expected visible outcome |
|---|---|
| `no-card-import-pair` | e-NO-101 matched; e-NO-102 mismatch; row 3 unmapped; Save mapping and Apply each reselect source and freshly validate HR pairs; one card applies. |
| `no-card-source-mismatch` | Different digest/employer/year/parser profile/row order at mapping or apply → refusal, no mapping/card mutation. Prototype uses synthetic bindings only. |
| `no-card-replay` | Repeated apply returns original result, no extra card version or input-contributor record. |
| `no-card-stale` | v3 run + v4 card → stale banner and blocked submit; recalculate uses v4. |
| `no-own-pay` | Ordinary own-pay import row refused; permitted Owner path needs explicit reason and fresh evidence. |
| `no-aga-zone-i` | Eligible NOK 50000.00 × 14.1% = 7050.00; trace shows ordinary zone I assumption. |
| `no-holiday-basis` | NOK 100000.00 × 10.2% = 10200.00; agreement alternative 12% = 12000.00. |
| `no-otp-first-krone` | Proven eligible below-cap NOK 50000.00 × 2% = 1000.00; no 1G subtraction. |
| `no-no-pay-month` | Employment obligation, no salary payment event, no monetary figures invented. |
| `no-filing-rejected` | Generated → manual submitted → rejected feedback → correction v2 pending; original immutable. |
| `no-tenant-switch` | Switching company clears previews/drawers; server refuses old-company import/file identifiers. |
| `no-dependency-outage` | HR/IAM/Org unavailable → retry/error, no cards applied or file falsely accepted. |

Arithmetic sources and assumptions are [NO-G1–G8 and official register in P5](../../../NeoERP-BackEnd/docs/api/payroll-v2-p5.md); none is a certified full-payslip example.
Use translation keys `payroll_no_<area>_<name>`, existing search pickers and existing accessible dialog/stepper patterns.
Keyboard users can map rows, inspect errors, cancel and restore focus; announce progress/errors via existing live regions.
Tables adapt to cards or existing horizontal-container pattern at 390px; page itself must not overflow.
No screenshot/test result is claimed by this document; the integration lead verifies the shared rig.
Approval requires contract+screen review, P4-A9…A14 owner approvals and inherited P1-43 approval (P5-A3), practitioner fixtures and pilot evidence before READY.

## 9. Batch B1 click-through clarification — HRP-67, 2026-10-19

Status remains **DRAFT — Pending verification**, UNCHECKED / PARALLEL_ONLY.
Company-settings and employee scopes in the country workbench share a model showing
applicability, official source/version, payee reference, owner-labelled facts and
sample basis to candidate payslip/employer line. No account details or account
approval is inferred. All controls are transient illustrations, never policy saves.

Withholding selects a labelled synthetic percentage/table/no-card response.
Sample salary/percentage changes update the candidate money trace; recorded card
type/year remains a separate Payroll fact. Table mode identifies the missing
official table/period algorithm and shows no guessed result. No-card uses the
existing proposed 50% salary illustration. The selected response never replaces
or certifies a real card.

AGA uses current HR job branch and Org zone, explicitly limited to the current
job date; it does not prove historical coverage. Ordinary-zone sample basis
changes AGA; Ia/unknown profile or missing zone blocks. Holiday selects ordinary
10.2% or five-week 12% accrual; age supplement names missing HR entitlement facts
without guessing G or age. OTP reads the HR pension-provider reference and a
labelled synthetic eligible-below-cap response; its 2% sample has no 1G deduction.
Unknown coverage/below-cap assessment blocks rather than showing zero cost.

Every topic offers complete, missing HR, missing Org, missing Payroll and refusal
examples. The owner/destination is visible: HR employee record, company settings
for effective Org facts, or the named Payroll input/policy field. Blockers remove
the candidate result amount while labelled sample inputs can remain. HR/Org facts
are read-only; no raw DOB, national ID, diagnosis or bank detail is returned.
Fixture responses create no HR fields, provider, mappings or approvals.

Named checks: recompute basis/percentage, table-without-result, all four topics ×
five scenarios, explicit zone-V zero versus missing zone, absent provider naming
HR, numeric/select validation, authorization and foreign-country refusal before
facts. Browser verification and formal lead-session money review belong to the
integrator; this document does not claim they ran. B2/C/D remain excluded.


## Batch C reporting/correction — HRP-69 (Draft)

Existing country workbench: preflight before generation, registered PAID snapshot
source vs explicit employment-only fact fixture, REPLACE targeting one same-month
message, immutable earlier history. Current HR paging/registration/format gaps
stay blocked. No facts-only flow creates a zero payment event. Identity/content
need the filing-content code; totals-only roles see status/counts only. Shared P4
§2b owns families, source invariants, manual evidence and corrections; this flow
adds only NO employment-month/payment-date/message specifics. Synthetic outputs
are labelled Sample — not an official format. Upload never implies acceptance;
manual correlated evidence is explicitly a simulation, not an authority response.


## Batch D posting and payee evidence — Draft, HRP-74/76

The country workbench and each run’s Post step show read-only component → Accounts
role → payee coverage beside the existing P2 journal. Select the run and inspect
current mappings or clearly synthetic complete/missing-role/missing-payee responses.
Complete fixture responses omit accounts and cannot post. Actual account numbers
come only from the existing pack mapping; unavailable roles say “not yet mapped
(pack 2026.4)”. No fallback account or separate ledger is created.

Holiday accrual DR HOLIDAY_PAY_EXPENSE / CR HOLIDAY_PAY_ACCRUED; release debits the
liability without repeating expense. AGA on accrual credits
HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED; release debits it and credits
EMPLOYER_CONTRIB_PAYABLE with the same authority. OTP splits employer expense and
employee deduction per approved pension insurer, using PENSION_PAYABLE. Withholding
and AGA remain separate Skatteetaten liabilities/payment references. Union dues use
UNION_DUES_PAYABLE (pack 2026.4), one approved UNION payee per union.

Waiting first accounts stay excluded; approved predecessors stay masked and a
waiting change never becomes approved through this view. The stable-user requester
bar applies while waiting and for 30 days after approval. Owner’s own retains the
reason and known-holder guard. Payment evidence reads the existing PAID-run
payment/deposit linkage; cited deposits cannot be voided and uncited void removes
the same linked fact. No preview action pays money or submits a filing. All
statutory readiness remains Pending verification / PARALLEL_ONLY.
