# Payroll P6 Sweden — proposed screen flow and source gates

**DRAFT / UNCHECKED / NOT APPROVED**, researched 2026-10-17.
Design scope only; no production code, migrations, bank sending or authority filing.
Contract: `NeoERP-BackEnd/docs/api/payroll-v2-p6.md`, all proposals/gates retained.
Sources SE-S1–SE-S11 are linked there with year, retrieval date and evidence limitations.
This flow proposes fixtures inside the existing Payroll Setup/employee/run/filing surfaces.
No new navigation shell, tax registry, bank account workflow or shared API is implied.

Prototype coverage: scoped import mapping/skipped rows/concurrency/replay, nonfinancial
run-impact facts, source/pilot readiness blockers, sourced threshold arithmetic, filing
preview versions, upload simulation, correlated feedback and correction history only.
The prototype uses synthetic server pair bindings; it has no physical source upload,
parser or production HR pair validation.
The complete flow below proposes future provider/API/file-writer/calculation behavior;
those production capabilities are not implemented by this prototype.

**Batch A · 2026-10-19 — current shared import coverage.** The draft rig uses synthetic source fixtures only in the shared **Upload → Mapping → Preview → Apply → Done** journey. Mapping and apply each require reselecting the matching synthetic source; this demonstrates source binding without a physical file, parser, HR matcher or engine. The country profile is a tax-card file profile; verified parser/source support remains pending. P6-A1 inherits the single [P1-43 amendment](../../../NeoERP-BackEnd/docs/api/payroll-v2-p1.md) (§2 and §8.2); it no longer proposes a separate country transport or approval. P1-43 remains Draft with ERP sensitive-data review and Jabran approval open.

The shared scenarios cover expiry (410 `IMPORT_PREVIEW_EXPIRED`, clear stored preview rows), changed source (409 `IMPORT_SOURCE_CHANGED`, no preview/mapping/card mutation), stale card, HR unavailable, own-row rejection/counts, confidential refusal before any write, permission lost after preview, partial applied/skipped counts, file-free JSON discard and retry. Production mapping/apply inherit multipart `command` plus same `sourceFile`; missing file/command → 400. TTL is configurable with recommended `PT30M`. Profiles specify non-ID row fingerprints/order; raw files/IDs are request-only, cleared on every outcome and never persisted/logged/returned. Apply freshly checks HR pairs, company/pay-group/year eligibility, confidentiality and own association; newly forbidden confidential candidates refuse atomically, ineligible/unmatched rows skip/count and own rows reject/count under P1-29. Replay reauthorizes currently without a second HR call or write. Synthetic coverage proves no real file/parser/engine behavior and grants no country readiness.

## 1. Entry and status

Route `#pay:sthlm|setup|country` (Setup → Country workbench) opens the Sweden fixture.
Proposed release label: `SE-2026-P6-DRAFT`.
Keep company context explicit. Country display is “Sweden · draft rules · 2026”.
Banner: “Swedish rules and formats need practitioner checks and an employer pilot.”
Show rule release, provider version, tax year, source checked count, table status,
pension/SLP support, filing profile status and pilot evidence separately.
A source URL or arithmetic preview does not make a source CHECKED or country READY.
2027 is a separate option with unavailable/draft rows, not automatic 2026 reuse.
No interactive control marks legal rows CHECKED. Existing pack approval owns that action.

## 2. Permission and company guards

Existing Setup view requires PAYROLL.SETUP.READ; show only server-provided actions.
Tax-card edit requires PAYROLL.EMPLOYEE.UPDATE; import PAYROLL.TAX_CARD.IMPORT.
HR Admin gets no payroll access. Platform Enter-company remains refused under P0.
Sensitive employee/card data follows confidential-group and own-pay restrictions.
Switching company clears transient previews and selected employee/file/filing state.
A reused id from another company returns 404; never displays a guessed record.
When IAM/HR is unavailable, show dependency failure and keep apply unavailable.

## 3. Tax-table reference panel

Show year, table number, supported columns, monthly/other supported frequency,
source edition/date/URL, imported checksum and independent check state.
Separate global tax tables from employee TaxCard decisions in the visual hierarchy.
Copy: “Official reference tables are loaded and checked by the rules operator.”
No user tax-card file can update the global reference table.
Missing/wrong-year/unchecked table shows an explicit blocked reason and source link.
A table number is never rendered as a percent. Do not guess a table from municipality.

## 4. Employee A-tax / decision panel

Open from the existing employee pay page; preserve card history and selected year.
Inputs: year, TABLE_COLUMN/SINK, table, column, frequency, main/secondary income,
applicable decision type/reference/issue date/validity/method/value and reason.
Conditional fields follow the pack schema; hide impossible combinations and enforce server checks.
Display external-table checksum and authority-decision coverage alongside tax method.
Main income/table and secondary 30% cases need explicit category and decision precedence.
A bonus shows a separate one-off basis and annual-income estimate when required.
SINK preview states “2026: 22.5%; effective decision required”; 2027 uses separate 20% row.
Missing-card fallback is blocked until the Swedish no-card method is checked.
Saving replacement preserves history; affected CALCULATED run shows “Inputs changed: recalculate”.
Approved run remains immutable; explain next-run/correction handling without an automatic refund.
Own-pay change uses P1 guard; no imported file circumvents it.

## 5. Upload → Mapping → Preview → Apply → Done

Choose supported draft exchange profile and year; authority export support is not yet claimed.
Upload opens preview only: no TaxCard has changed.
Show file/profile hash, row count, matched, unmapped, unmatched, rejected and eligible counts.
Each row: employee code/name if authorized, masked identity, table/column/method,
proposed effectivity, current card version and field-specific problem text.
No employee-id column => UNMAPPED. Pick employee with existing HR-directory search picker.
Never offer “find by national id”. Saving a mapping requires reselecting the same
original source file. Inherited P1-43 (local P6-A1) multipart `command` JSON carries version and
rowIndex/employeeId mappings; `sourceFile` carries that source. Server parses it afresh
and verifies chosen employee/national-ID pairs through HR.
Wrong pair => UNMATCHED, not a successful mapping; duplicate employee mapping blocks.
Unmapped/unmatched/rejected rows are skipped and counted, consistent with P1.
Apply summary explicitly says which eligible matched rows change and which rows skip.
P1-43 (local P6-A1) requires reselecting the same source for BOTH Save mapping and Apply. Apply
sends multipart `command` JSON inherited apply body plus `sourceFile`; compare exact
preview byte digest, employer, tax year, parser profile and row order before either
operation, then transiently parse and freshly validate HR pairs.
Copy at both actions: “Select the same file again to confirm identities. The file is
not saved in Payroll.” A source mismatch changes neither mappings nor cards.
Source bytes and parsed IDs stay in request memory and clear on every outcome;
no IDs in storage, logs, errors, browser persistence or retained proof stores.
P6-A1 inherits P1-43; shared sensitive-data review and Jabran approval remain open. Discard remains
JSON without a file. No new shared API or identity lookup is proposed.
Require fresh permission, own-pay, source hash and active-card versions on apply.
Stale card/employee => refresh preview, preserve safe user mapping where revalidated.
Successful apply reports applied/skipped counts, previous-card history and stale run links.
Replay returns original result; never creates another card version on repeated click.
Discard clears draft import only; no card rollback action is invented.

## 6. Contributions preview and date boundary

Inputs: pay date, birth year from HR, insurance category, employer category,
current payment base and same-month base already paid/reserved.
Example ordinary coverage born 2005: SEK25,000 on 2026-03-31 => employer SEK7,855.00;
on 2026-04-01 => SEK5,202.50; source SE-S2/S3 and UNCHECKED label visible.
April monthly total SEK30,000 => SEK6,773.50; show relief cap split, not blended assumed rate.
Show 1938–1958 cohort at 10.21%, <=1937 zero, ordinary 1959+ 31.42% (2026 only).
Unsupported foreign coverage/employer category blocks; no generic 31.42% fallback.
Show employer cost outside net deductions and annotate pay-date effective rules.
Midyear effective date, monthly cap and 2027 change are separate warnings.

## 7. Holiday, pension and sick-pay panels

Holiday inputs: agreement reference/version, method, earning-year dates, eligible wage
basis, paid days from HR and payment timing; no invented editable HR leave balance.
Show opening + earned + valuation - paid/released = closing monetary liability.
Same-pay method retains salary plus supplement; percentage method uses eligible basis.
Statutory SEK30,000 × 0.43% × 5 = SEK645 supplement is a sourced UNCHECKED fixture.
Pension panel shows agreement/insurer/payee/coverage and the settled SLP roles,
with pack 2026.4 mapping and legal verification shown separately.
Sick-pay panel displays HR spell id/day, degree, scheduled hours, relapse linkage,
average-week basis, prior karens and exemption evidence; never diagnosis.
SEK5,000 eligible average weekly lost pay => SEK4,000 sick pay and SEK800 karens fixture.
Incomplete HR facts block; do not ask Payroll to invent a spell or reset at month boundary.
No automatic statutory employer sick pay from day15; agreement top-ups remain separate.

## 8. Pay-run and posting continuity

Existing Calculate/Approve workflow remains P0/P1 with contributors and own-pay checks.
Country changes stale a calculated run. Recalculate before submit/approve.
Journal preview displays existing P2 roles resolved by Accounts, never Swedish account numbers.
Accrued holiday employer contributions use P2 roles; missing SLP pack 2026.4
mapping or checked legal evidence stays visible as a blocker.
Bank/payee panels retain maker exclusion and approved account version checks.
File generation does not make pay PAID. Existing explicit payment action owns PAID events.
Only frozen PAID money events feed AGI; parallel/draft/planned examples remain excluded.

### Posting and payee evidence — HRP-74 / ACC-237 (Draft)

| Component | Expense / debit | Liability / credit | Payee and evidence |
|---|---|---|---|
| Salary / net pay | `PAYROLL_EXPENSE` | `PAYROLL_PAYABLE` for net | Employee payment follows P3; net liability carries no payee tag. |
| Withholding / employer contributions | Employer portion: `EMPLOYER_CONTRIB_EXPENSE` | `PAYROLL_TAX_PAYABLE` / `EMPLOYER_CONTRIB_PAYABLE` | Skatteverket, `AUTHORITY:SE.SKATTEVERKET`; keep tax and employer amounts distinct. |
| Contracted pension | Employer only: `PENSION_EXPENSE` | `PENSION_PAYABLE` | One approved pension institution payee per agreement/recipient; employee deductions create no employer expense. |
| Pension special payroll tax (SLP) | `PENSION_SPECIAL_PAYROLL_TAX_EXPENSE` | `PENSION_SPECIAL_PAYROLL_TAX_PAYABLE` | `AUTHORITY:SE.SKATTEVERKET`, required; both roles await pack 2026.4 mapping. |
| Holiday accrual / release | Accrual: `HOLIDAY_PAY_EXPENSE`; release debits `HOLIDAY_PAY_ACCRUED` | Accrual: `HOLIDAY_PAY_ACCRUED`; payment releases the same liability | Keep opening + earned/valuation − released = closing; no second expense or extra net payment. |
| Contributions accrued on holiday pay / released | `EMPLOYER_CONTRIB_EXPENSE`; release debits `HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED` | Accrual: `HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED`; release to the applicable payable | Same contribution/payee split as the source accrual; do not expense the release twice. |
| Union dues | No employer expense for an employee deduction | `UNION_DUES_PAYABLE` | `UNION:{registry number}`, one payee per union; pack 2026.4 mapping required. |

The SLP role decision is settled by P2 §5.2/ACC-237; pack delivery, checked
legal calculation, insurer/coverage and account mapping remain separate gates.

The per-run posting preview shows component → role → payee and separate accrual,
release and payment evidence. Accounts resolves accounts from its versioned pack;
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

## 9. AGI file, evidence and correction timeline

Use existing Filings filtered SE_AGI and month/company, with pinned XML profile status.
Preview shows paid-event membership, money reconciliation and HR absence-fact supplement status.
Required VAB/parental absence may exist with no PAID money: use P4-A11 ABSENCE_FACTS with missing actual HR source blocked.
Generate creates immutable version/hash. Copy: “Upload, review and sign in Skatteverket.”
Generated, uploaded, manually submitted and reception receipt are visibly different facts.
Mark submitted needs period/version/hash, submitted date, kvittens reference and receipt.
Receipt scan pending is uploader-only; rejected scan never changes the filing's money.
Use Draft P4-A13 separate evidence states, correlated manual evidence and visible synthetic labels.
“Received” means reception, not final legal tax acceptance. Rejected outcome retains evidence/version.
Correction opens a new version tied to prior submitted version/period and stable recipient keys.
Money changes require PAID correction runs; identity corrections require reason/evidence.
Keep all versions, receipts and acknowledgment history in timeline; no overwrite button.
From Jan2025 absence data accompanies first declaration and cannot be corrected afterward
through AGI: show external repair instruction gate; do not silently resend changed absence.
Show dated official filing AND deposit dates after calendar validation; no universal 12th label.
FILING.READ sees totals/status/counts; file/identity/receipt content needs CONTENT.READ and audit.

## 10. Service-contract routing and acceptance

Classification inputs: payer/recipient legal type, work location, insurance category,
F/FA/A-tax evidence/dates, FA written invocation, yearly expected/prior remuneration.
Do not infer deductions, employee rights, age relief or payroll entry from “contractor”.
Corporate payer never inherits private-household SEK10,000 thresholds.
Supplier/AP payment stays Accounts-owned; unsupported case routes to practitioner review.
Acceptance requires inherited P1-43 approval, mapping AND apply same-source mismatch/fresh-pair
and no-ID persistence fixtures, paired-identity/stale/own-pay/cross-company fixtures, date/cap cases,
liability/sick facts, paid-only AGI, first-declaration absence and correction history.
Practitioner source checks, independent review and employer pilot remain pending.
Rig is illustrative only; no country READY, checked law, bank acceptance or authority filing claimed.

## 11. B1 interactive illustration — HRP-67, 2026-10-19

**DRAFT / UNCHECKED / PARALLEL_ONLY.** Company settings and selected-employee
views share five topics: tax/one-off, contributions, holiday, sick/karens and
pension. Each shows applicability, P6 source/version, unverified payee,
owner-labelled facts, sample Payroll inputs and pending money-to-payslip trace.
There is no production calculator, policy save, posting or filing capability.

- Tax changes taxable pay, sample table result, secondary-income case, bonus,
  annual-income estimate and sample card one-off rate. No table algorithm or
  official one-off band is invented; a table number is never a percentage.
- Contributions use synthetic server HR cohort and March/April 2026 response
  cases; change the base and Payroll prior monthly capacity usage. The April
  youth illustration prices available SEK25,000 capacity at 20.81%, excess at
  31.42%. No ledger reservation or automatic 2027 rule rollover is claimed.
- Holiday changes the sample agreement method, salary/eligible wages, paid
  days, liability opening and release. Separate salary-retained supplement or
  percentage-method payment from closing liability and additional net pay.
- Sick reads synthetic `HrAbsencesV1` spell/day/link/degree/schedule/payer/karens
  facts; change Payroll lost-pay, average-week and prior-karens money. Default
  exemption `UNKNOWN` blocks. An alternate day-4/day-15 response shows the
  employer-period boundary; day 15 has zero statutory employer sick pay.
- Pension changes sample agreement rate/base. Agreement/version, insurer,
  coverage and approved payee remain unverified; payee stays a placeholder.
  A sample rate is neither universal ITP nor an employee deduction. Pension
  legal rows and SLP remain open verification gates.

F-04 Lead decisions remain visible. O-1 is not served, so contributions show a
missing-Org blocker naming company settings. HR's high-risk exemption input is
not yet available, so normal sick pay shows `SE_SICK_FACTS_INCOMPLETE` naming
`HrAbsencesV1.karens.exemption`. A labelled alternate FIXTURE response can show
pending arithmetic only while preserving real missing-fact warnings; it does
not replace `UNKNOWN` or save any HR/Org fact. Cohort/day selectors are FIXTURE
response cases, never HR editors. No raw birth date, diagnosis, certificate or
national ID is returned; HR owns the source facts and Payroll prices them.

Exercise each topic's complete/sample, missing HR, missing Org, missing Payroll
and unsupported-profile states. `SE_PROFILE_UNSUPPORTED` names Payroll and the
profile/treatment field and suppresses money. Missing states name the owner and
field and suppress computed amounts; invalid numbers/choices do the same. Actual
actor denial precedes facts. Pension shows a plain pending-source row naming the
company agreement, insurer terms and SLP authority source to check, with no
unrelated official source link. Both views
use the same guard/model and clear transient inputs on context changes. All rows
stay Pending verification; existing P6 sources alone supply statutory constants.
Root integration owns UI/bundle tests and checkpoint evidence. B2/C/D and new HR
write UI are excluded; this clarification grants no production approval.


## Batch C reporting/correction — HRP-69 (Draft)

Shared P4-A9…A14 is the only generic reporting model. Workbench preflight separates
PAID monetary sources and first-declaration absence facts, with no fabricated zero
payment. CORRECT_PERIOD keeps earlier versions/bytes/evidence and stable original
period/record keys. Absence fields are final after first manual submission; changed
absence blocks with the external route. Identity/records/feedback diagnostics need
FILING.CONTENT.READ, totals only do not. Every file is Sample — not an official
format and feedback outcomes are explicitly synthetic; no official acceptance,
XML validity, live submission or country readiness is claimed. Missing source and
practitioner/schema gates remain explicit. P4 owns evidence limits/scan/lineage.
