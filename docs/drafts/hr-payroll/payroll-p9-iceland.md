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

Current synthetic family selector:

| Fixture family | Required controls |
|---|---|
| `IS_WITHHOLDING_MONTHLY` |2026 month. |
| `IS_PENSION_FUND` |2026 month + predefined `IS-PENSION-DEMO` synthetic recipientProfileId. |
| `IS_UNION` |2026 month + predefined `IS-UNION-DEMO` synthetic recipientProfileId. |

The demonstration recipient is not a real institution, certified format or configured connection.
Production proposal kinds in contract §7 resolve an approved recipient registration/profile.
Profile-year mismatch, missing required profile and wrong-family/profile input block generation.
No arbitrary fund name input implying all funds support one file. Actual files remain future work.

Preview explains period/family/recipient and shows diagnostic readiness, no real identity or file.
Generated preview is not sent. “Record upload simulation” requires a bounded external reference;
status stays PENDING until correlated synthetic feedback. Explicit label “Simulation” persists.
Accept/reject simulation binds company, month, family, recipient, version/reference and receipt id.
Wrong correlation refuses; replay is idempotent; conflict cannot overwrite immutable prior feedback.
Acceptance simulation never means authority acceptance, contribution payment, or country Ready.

Correction requires reason and inherits same company/family/recipient/month; parent remains visible
and immutable. Detail shows parent→child history and separate generated/upload/feedback states.
Production cancellation/replacement/delta/original-month rules remain recipient-profile gates.
Changing a month or family cannot turn a correction into an unrelated return silently.

Production future file flow uses P4 preflight, immutable records, exact writer readback/totals,
manual external upload, scan-controlled receipt and authorized reference. Source year/format
must be pinned. File acceptance, external payment and P3 statutory deposit are distinct facts.
Tax zero report may be obligatory even without PAID events; P4 no-event obligation amendment
is required, never manufacture a zero-paid employee. Fund/union no-activity is recipient-specific.

## 9. Source/readiness and final review

Show official source title/link/year, applicability, check state, missing schema/rounding evidence
and pilot status separately. Research-complete never equals checked. No writable READY toggle.
Required production gates: HR/P1 input/eligibility amendment; Accounts role/payee approval;
P4 no-event/family/profile/feedback/correction amendment; Iceland practitioner confirms annual
credit precision, social base, agreement applicability and scale0 rounding; current tax and
selected fund/union schemas pinned and recipient pilots accepted; parallel payslip/filing/ledger
comparison; formal independent review, then Jabran approves spec and contract before building.

New screen copy must use `payroll_<area>_<name>` keys in the shared spec catalog; existing
pickers and pay- CSS remain. These English copy intents do not authorize unkeyed literals.
No production implementation, commit, push, PR or live filing is part of this draft delivery.
