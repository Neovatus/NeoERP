# Payroll P9 — Iceland country workbench screen draft

Status: **DRAFT / NOT APPROVED / synthetic prototype**, 2026-10-18.
Contract: [P9 proposal](../../../NeoERP-BackEnd/docs/api/payroll-v2-p9.md).
Owning checkpoint: [P8–P9 plan](../../agents/hrp-p8-p9/plan.md).
Official sources, legal uncertainty and approval gates are in contract §2/§11.
All country rules UNCHECKED, readiness PARALLEL_ONLY; no production capability claimed.

**Batch A · 2026-10-19 — current shared import coverage.** The draft rig uses synthetic source fixtures only in the shared **Upload → Mapping → Preview → Apply → Done** journey. Mapping and apply each require reselecting the matching synthetic source; this demonstrates source binding without a physical file, parser, HR matcher or engine. IS is a personal credit-allocation instruction profile, never an authority tax-card feed. P9-A1 inherits the single [P1-43 amendment](../../../NeoERP-BackEnd/docs/api/payroll-v2-p1.md) (§2 and §8.2); it no longer proposes a separate country transport or approval. P1-43 remains Draft with ERP sensitive-data review and Jabran approval open.

The shared scenarios cover expiry (410 `IMPORT_PREVIEW_EXPIRED`, clear stored preview rows), changed source (409 `IMPORT_SOURCE_CHANGED`, no preview/mapping/card mutation), stale card, HR unavailable, own-row rejection/counts, confidential refusal before any write, permission lost after preview, partial applied/skipped counts, file-free JSON discard and retry. Production mapping/apply inherit multipart `command` plus same `sourceFile`; missing file/command → 400. TTL is configurable with recommended `PT30M`. Profiles specify non-ID row fingerprints/order; raw files/IDs are request-only, cleared on every outcome and never persisted/logged/returned. Apply freshly checks HR pairs, company/pay-group/year eligibility, confidentiality and own association; newly forbidden confidential candidates refuse atomically, ineligible/unmatched rows skip/count and own rows reject/count under P1-29. Replay reauthorizes currently without a second HR call or write. Synthetic coverage proves no real file/parser/engine behavior and grants no country readiness.

## 1. Entry and scope

Payroll → Setup → Country workbench, route `#pay:reyk|setup|country`.
Header: Iceland · 2026; currency ISK; release `IS-2026-P9-DRAFT`.
Org supplies company country; no local control changes employer country or legal registration.
Readiness panel keeps source checks, profile checks and customer pilot separately visible.
Banner explains that rules and filing profiles need practitioner checks and a parallel pilot.
A successful example/import/feedback never changes the country to Ready.

The current rig covers session-only synthetic instruction preview/mapping/apply, actual
eligible/skipped counts, wrong-pair refusal, indicative stale-run information, arithmetic examples,
source links and family-specific preview/upload/feedback/correction history. It reads no physical
source file, statement, tax portal, fund service or identity value. It calculates no payroll run,
changes no live card/YTD/payee/filing and exports no statutory document.
Sections below also specify the intended future production screens; they are not evidence that
the detailed contribution, holiday and file flows already exist in the prototype.

## 2. Roles and common states

SETUP.READ can view evidence/applicability without employee amounts. EMPLOYEE.READ controls
pay history with existing confidential restrictions. TAX_CARD.IMPORT controls imports;
EMPLOYEE.UPDATE controls manual inputs. FILING.READ sees totals; CONTENT.READ adds
records/downloads/receipts; GENERATE creates previews/versions/corrections; SUBMIT records
external submissions and receipts. No new Iceland permission. HR/ESS access alone grants no pay data.
Platform users cannot write. Accountant sees totals without employee names/document contents.

Loading uses existing skeleton. Empty shows no instruction/report rather than invented defaults.
Missing facts/profile/expired year shows a blocking diagnostic with the responsible source.
Network/HR/IAM failure keeps draft and offers retry; no synthetic success in a production flow.
Offline preserves editable local form state in memory and disables server mutation.
Company/persona switch clears previous-company selection and sensitive transient data.
Cross-company deep link is not found; permissions are rechecked for every mutation/download/replay.
Actions reflect server rights and state; hidden UI buttons never replace domain guards.

## 3. Credit instructions and source workflow

Label the section “Personal credit instructions”. Prototype explanation says “Sample employee
credit instruction”; never advertise an official Iceland tax-card feed or connected authority.
Future source selector offers only a pinned approved input profile. It explains the difference
between employee allocation instruction and an official usage statement supporting carry/balance.
Year/effective dates/reference and issuer are explicit; no generic source called “Tax card API”.

Preview lists matched, unmapped, unmatched and rejected counts. An imported employee id or
company HR directory selection supplies the mapping; a national ID alone cannot locate a person.
Use the existing searchable picker, never a free-text UUID or kennitala search.
Wrong pair remains unmatched. Duplicate employee mapping refuses. Own-pay row is rejected;
Owner's own follows inherited single-holder reason path only if the server explicitly permits it.

Production Save mapping AND Apply require reselecting the exact same original source file.
Inherited P1-43 multipart `command` JSON with current version plus `sourceFile` binds exact bytes,
employer, year, parser profile and row order. Server transiently reparses and freshly validates
employee-id/national-id pairs with HR. P9-A1 inherits P1-43; shared sensitive-data review and Jabran approval remain open.
Copy intent: “Select the same source again to verify identities. Payroll does not save this file.”
Raw source/national IDs are cleared after every outcome and never go to localStorage,
telemetry, error text, retained matching proofs or audit. Rig bindings remain synthetic.
Discard uses inherited JSON, no source file. An already completed request replay repeats no write;
current authorization still controls whether its non-sensitive result can be disclosed.

Before Apply, display eligible and skipped counts plus row reasons. Apply confirmation never
says all rows imported if some cannot match. Success shows actual applied/skipped counts and
links to affected CALCULATED runs. Conflict requests refresh, HR unavailable applies nothing.
If operation permission is lost or a candidate becomes confidential without the grant, refuse before any card mutation. Fresh eligibility/own-employee checks skip or reject affected rows with explicit counts under P1-29/P1-43. Approved/paid runs remain frozen; next-run and correction
implications are explicit rather than silently refunding earlier tax.

## 4. Credit detail and manual input proposal

Version history shows source, effective dates, instruction/evidence reference and financial values.
Inputs: use credit yes/no; instructed share0–100%; start month; coordinated bracket; external
usage/as-of date; supported same-year carry evidence. No default100% for another employer.
Explain that other employers/benefit payers are outside NeoERP; employee evidence is required.
Residency/age eligibility arrives from approved HR facts. Payroll UI does not decode a kennitala.
Partial residency, spouse transfer, switching employer and disputed balance go to Needs evidence.
No instruction means unresolved credit/bracket; no fabricated no-card rate or implied entitlement.

2026 visible monthly credit example72492 ISK is not the annual rule. Display source issue:
official annual869898 differs from12 rounded monthly amounts869904. Cumulative/year-end and
proration require verified precision; do not provide a fake automatic adjustment control.
Unused credit can carry within its verified year; January cannot consume prior-year balance.
Off-cycle runs share credit usage with that month's regular run; no second full allowance.
Manual save needs evidence, effective dates and reason, using existing P1 own-pay guards.

## 5. Illustrative arithmetic

All examples visibly say “Illustrative · Unchecked”; they are not employee salary simulations.
ISK is displayed with no fractional currency digits, but legal rounding still needs verification.
The current rig displays bounded whole-ISK examples:

| Fixture | Exact arithmetic |
|---|---|
| Full eligible monthly credit | Taxable400000 ×31.49% −72492 =53468 ISK withholding. |
| Mandatory employee contribution | Verified-example base500000 ×4% =20000 ISK. No universal fund eligibility assumed. |

Detailed contract candidate fixtures add share50% withholding89714; higher bracket and rounding;
additional pension deduction; social charge on its own validated base; holiday accrual10170
on an eligible100000 basis. These are separate calculations, not a complete net-pay promise.
Do not show gross×6.35% as the full employer cost. Do not seed1% union fee nationally.
Sources/years and unverified aspects accompany each example rather than a green check badge.

## 6. Pension, additional savings and payee proposal

Future policy panel separates mandatory pension, additional savings election and specified-private
allocation within mandatory pension. Each has policy effective dates, coverage, base and approved
fund/payee. Agreement may constrain fund choice. Ordinary4% employee/11.5% employer is an
example profile; special arrangements do not inherit it automatically.
Age-month rules show the verified profile/source; missing eligibility blocks calculation.
Additional2%/4% employee plus2% matching requires an evidence-backed election/contract.
Eligible employee deductions affect withholding base; employer pension/social basis is separate.

Payee shows approved account version, never editable bank numbers in this panel. Waiting account
change pays nothing to a new account; maker/requester restrictions remain inherited P1/P3 rules.
Posting preview links to Accounts roles for each liability; unknown role/payee blocks posting/file.
Employee pension deduction, employer expense and remittance clearing are not duplicate expenses.
Union/rehabilitation/training liabilities each show agreement/rate/base/recipient evidence.
Recipient formats and deadlines are per profile; a fund's published format does not apply to all.

## 7. Holiday proposal

Future Holiday section shows verified agreement, earning year, entitlement from HR and monetary
accrual from Payroll. Minimum10.17% is labelled subject to current-law/profile verification.
Choose only the policy-supported settlement route, with approved holiday account/provider if any.
Ordinary salary continuation must not automatically add another10.17% cash payment.
Accrual, account transfer, salary continuation, termination settlement and holiday bonus are
separate events; paid settlement clears liability rather than accruing the same expense again.
No invented universal holiday fund/format or automatic collective service-rate ladder.
Unknown policy, source facts or tax timing shows blocked calculation/settlement with evidence action.

## 8. Reporting family workbench

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

| Synthetic selector | Period/profile and production proposal |
|---|---|
| `IS_WITHHOLDING_MONTHLY` | 2026 month; tax production kind proposal `IS_STADGREIDSLA`, registered employer. |
| `IS_PENSION_FUND` | 2026 month + predefined synthetic `IS-PENSION-DEMO`; production `IS_PENSION` requires approved fund/payee profile. |
| `IS_UNION` | 2026 month + predefined synthetic `IS-UNION-DEMO`; production kind requires approved union/payee profile. |

Demo recipients are not actual institutions, CHECKED formats or connections. P4-A9
materializes an independent filing/version/evidence/lineage per approved recipient.
Missing, wrong-family/year or registration/payee-mismatched profiles block. Do not
allow arbitrary fund strings or suggest every recipient accepts the same file.
Tax day-15/next-working-day and Gildi's example fund dates remain country-profile
verification gates (P9 IS-S12/S7), not a universal tax/fund/union calendar.

Tax no-payment reporting uses P4-A11 ZERO_PAYMENT_OBLIGATION only with verified
registered-employer obligation facts and a frozen facts-only snapshot. Fund/union
no-activity duties are separate recipient-profile rules; tax's rule supplies no default.
No fabricated employee or zero-paid event. Every family displays its own content basis.

Corrections choose the targeted family/recipient/period version and original reference,
with reason. P4-A12 requires the profile's checked model/action/cutoff; Iceland has no
universal replacement/delta/cancellation default. Parent→child history preserves all
earlier versions and evidence, and a new child starts without inherited acceptance.
Changing a month, fund or family cannot silently retarget the correction. Rejection
or correction in one recipient never changes another. Money changes first require a
PAID correction run; facts use a new snapshot. P9-A4's earlier standalone shared
proposal is superseded by P4 §2b; exact recipient action/evidence mappings stay gated.

## 9. Source/readiness and final review

Show official source title/link/year, applicability, check state, missing schema/rounding evidence
and pilot status separately. Research-complete never equals checked. No writable READY toggle.
Required production gates: HR/P1 input/eligibility amendment; Accounts role/payee approval;
P4 §2b Draft approval and checked country family/profile/feedback/correction mapping; Iceland practitioner confirms annual
credit precision, social base, agreement applicability and scale0 rounding; current tax and
selected fund/union schemas pinned and recipient pilots accepted; parallel payslip/filing/ledger
comparison; formal independent review, then Jabran approves spec and contract before building.

New screen copy must use `payroll_<area>_<name>` keys in the shared spec catalog; existing
pickers and pay- CSS remain. These English copy intents do not authorize unkeyed literals.
No production implementation, commit, push, PR or live filing is part of this draft delivery.


## 10. HRP-68 B2 interactive draft — 2026-10-20

The existing country workbench adds credit, residency, pension/séreign, union and
orlof topics, with employee/company sample context and five source states:
complete, missing HR, missing Org, missing Payroll and refused. Inputs remain in
component memory. Existing read/company/confidential/platform/offline guards run
before projection. No Save, live calculation, credit consumption, master edit,
identity parsing, persistence or country Ready transition is delivered.

Every topic shows source/version, applicability, owner-named facts, an unverified
payee and a trace. Org O-4 is unknown and always remains a real company-settings
blocker. CURRENT response shows Pending verification without money. The explicit
ILLUSTRATIVE alternate server response may show sample arithmetic in complete
state while retaining O-4; selecting it does not record a missing fact. Missing or
refused states and invalid inputs suppress all monetary rows, including intermediate
balances. Unknown union agreement rate has no statutory default and also blocks.

Credit instructions and carry/other-payer usage controls identify the employee as
the declaration source; Payroll owns their recording and evidence. HR facts use
existing taxResidenceFrom/To and opaque factsRevision, never replacement residency
fields or raw identity. A full eligible month illustrates only the P9 first-bracket
example: 400000 × 31.49% − 72492 = 53468 ISK withheld. Allocation 50% gives 89714.
Verified same-year opening and already-used credit affect the available balance;
prior-year carry is zero and applied credit cannot refund prior tax. Partial
residency is blocked pending verified day-proration; foreign unsupported profiles
are refused. Annual/cumulative precision, year-end treatment and actual credit
consumption remain outside this example.

Pension defaults to the existing Gildi example profile, labelled unverified:
employee 4% deduction, employer 11.5% expense. Additional savings requires an
explicit sample election (none, employee 2% + employer 2%, or employee 4% + employer
2%); no double charging of mandatory specified-private allocation. Union needs an
entered sample agreement rate and pending recipient evidence; no national 1% is
asserted. Social charge and full employer cost remain unresolved with O-4.

Orlof uses an eligible earning basis, a separate opening liability and a separate
released-pay input. Default sample: 30000 opening + 10170 earned − 5000 released =
35170 closing ISK. Released pay is the single Payslip row; earned/closing rows are
Intermediate, so payment is never counted again as earned accrual. Release beyond
available sample liability is invalid. Salary continuation does not automatically
add a second cash supplement.

Every row is tagged Payslip / Employer cost / Intermediate. Withholding, employee
pension, employee séreign and union deductions show negative amounts. Employer
pension and matching contributions are positive cost rows with no payslip flag.
Sample ISK display rounds to whole units before the shared ×100 trace transport;
legal rounding and named practitioner verification remain pending.

### B2 keyed copy catalog

All added Iceland copy uses `payroll_b2_is_*` keys below. English values are draft
copy, not approved statutory claims. Common source-state/scope/trace-kind controls
continue to use the existing shared catalog.

| Key | English text |
|---|---|
| `payroll_b2_is_credit` | Iceland · personal credit allocation and carry-over |
| `payroll_b2_is_residency` | Iceland · residency and credit eligibility |
| `payroll_b2_is_pension` | Iceland · pension and séreign |
| `payroll_b2_is_union` | Iceland · agreement union deduction |
| `payroll_b2_is_orlof` | Iceland · orlof accrual and release |
| `payroll_b2_is_applicability` | IS-2026-P9-DRAFT · Illustrative only · Pending verification |
| `payroll_b2_is_source_credit` | IS-S1–S4 · Skatturinn 2026 rates and personal credit instructions |
| `payroll_b2_is_source_residency` | IS-S2 · Personal credit residency and same-year eligibility; exact proration pending |
| `payroll_b2_is_source_pension` | IS-S6–S9 · Pension Act and Gildi example; agreement and election required |
| `payroll_b2_is_source_union` | IS-S14 · Salary guidance; selected union agreement and rate still required |
| `payroll_b2_is_source_orlof` | IS-S13 · Holiday Allowance Act; current law and agreement pending verification |
| `payroll_b2_is_source_org` | F-04 O-4 · Org employer social-charge category not yet served |
| `payroll_b2_is_employee_payee` | Selected employee · sample payee, unverified |
| `payroll_b2_is_tax_payee` | Skatturinn · sample liability payee, unverified |
| `payroll_b2_is_fund_payee` | Sample pension institution · approved payee pending verification |
| `payroll_b2_is_union_payee` | Selected union · agreement and approved payee pending verification |
| `payroll_b2_is_response` | Alternate server response fixture; does not record facts |
| `payroll_b2_is_current` | Current response · required Org fact missing |
| `payroll_b2_is_illustrative` | Illustrative complete response · Pending verification |
| `payroll_b2_is_warning` | Alternate response arithmetic only; missing Org fact remains unresolved |
| `payroll_b2_is_hr` | HR · required eligibility facts |
| `payroll_b2_is_payroll` | Payroll · financial policy and evidence |
| `payroll_b2_is_employee` | Employee-declared · instruction and usage evidence in Payroll |
| `payroll_b2_is_org` | Org · O-4 employer social-charge category |
| `payroll_b2_is_scope` | Sample scope |
| `payroll_b2_is_employee_scope` | Selected employee sample |
| `payroll_b2_is_company_scope` | Company policy sample using selected employee facts |
| `payroll_b2_is_unavailable` | Not recorded · owner action required |
| `payroll_b2_is_hr_missing` | HR must supply the named facts; Payroll cannot edit the HR master. |
| `payroll_b2_is_org_missing` | Company settings: Org O-4 category is not yet served. No ordinary-employer default. |
| `payroll_b2_is_payroll_missing` | Payroll or the employee must supply the named policy, instruction or evidence. |
| `payroll_b2_is_refused` | Unsupported profile refused; no ordinary resident or contribution fallback. |
| `payroll_b2_is_invalid` | Sample input is invalid; no monetary result. |
| `payroll_b2_is_pending` | Pending verification · calculation withheld until required facts are available |
| `payroll_b2_is_taxable` | Sample taxable pay (ISK) |
| `payroll_b2_is_share` | Employee-declared allocation (%) |
| `payroll_b2_is_carry` | Verified same-year opening credit (ISK) |
| `payroll_b2_is_used` | Credit already used elsewhere / earlier this month (ISK) |
| `payroll_b2_is_year_case` | Synthetic credit year relationship |
| `payroll_b2_is_same_year` | Same tax year · verified opening sample |
| `payroll_b2_is_prior_year` | Prior tax year · carry disallowed |
| `payroll_b2_is_credit_available` | Allocated available credit · Intermediate |
| `payroll_b2_is_credit_used` | Credit applied · Intermediate |
| `payroll_b2_is_withholding` | Withholding deduction · Payslip |
| `payroll_b2_is_credit_limit` | Only first-bracket sample supported here; annual cap and cumulative precision need verification. |
| `payroll_b2_is_residence_case` | Synthetic HR residency response |
| `payroll_b2_is_full` | Full eligible month · synthetic HR response |
| `payroll_b2_is_partial` | Partial residency · exact proration pending verification |
| `payroll_b2_is_foreign` | Foreign / unsupported profile |
| `payroll_b2_is_residence_facts` | IS / 2026-01-01 / open / factsRevision 1 [SYNTHETIC] |
| `payroll_b2_is_eligibility` | Eligible age and domestic coverage [SYNTHETIC] |
| `payroll_b2_is_instruction` | Employee-declared monthly instruction / usage evidence [SYNTHETIC] |
| `payroll_b2_is_policy` | Dated sample agreement / election / recipient evidence · unverified |
| `payroll_b2_is_partial_pending` | Partial residency requires verified day-proration and credit precision; no estimated amount. |
| `payroll_b2_is_base` | Sample eligible contribution base (ISK) |
| `payroll_b2_is_savings` | Sample additional-savings election |
| `payroll_b2_is_none` | No additional savings election |
| `payroll_b2_is_two` | Employee 2% + employer 2% · Gildi example |
| `payroll_b2_is_four` | Employee 4% + employer 2% · Gildi example |
| `payroll_b2_is_employee_pension` | Mandatory employee pension deduction · Payslip |
| `payroll_b2_is_employer_pension` | Mandatory employer pension expense · Employer cost |
| `payroll_b2_is_employee_savings` | Additional employee savings deduction · Payslip |
| `payroll_b2_is_employer_savings` | Additional employer savings expense · Employer cost |
| `payroll_b2_is_pension_basis` | Eligible employee deductions from withholding basis · Intermediate |
| `payroll_b2_is_union_rate` | Illustrative selected-agreement rate (%); no national rate |
| `payroll_b2_is_union_deduction` | Union deduction · Payslip |
| `payroll_b2_is_union_pending` | No universal union rate or recipient format. Enter a sample agreement rate to illustrate; verification remains open. |
| `payroll_b2_is_opening` | Opening holiday liability (ISK) |
| `payroll_b2_is_earning_base` | Current eligible earning base (ISK) |
| `payroll_b2_is_released` | Sample holiday pay released (ISK); distinct from earning |
| `payroll_b2_is_earned` | Holiday accrual earned · Intermediate |
| `payroll_b2_is_holiday_paid` | Holiday payment released · Payslip |
| `payroll_b2_is_closing` | Closing holiday liability · Intermediate |
| `payroll_b2_is_holiday_overdraw` | Released holiday pay exceeds opening plus earned sample liability. |

B2 review clarification: Iceland sample monetary inputs require whole ISK;
fractional money is refused before candidate rows are calculated. Percentage
inputs may be fractional. This is a draft display-consistency constraint, not
verification of official statutory rounding. The keyed whole-ISK message is
`payroll_b2_is_whole_isk`.
