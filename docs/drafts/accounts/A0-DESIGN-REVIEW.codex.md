# Accounts A0 — Codex independent design review

2026-10-06 · requested by `.review-channel/to-implementer.md` entry 33.

**Verdict: changes requested before A0 implementation. 0 BLOCKER, 9 MAJOR, 6 MINOR.** This reviews the proposed design, country packs and demonstration rig, not an implemented Accounts release. D-A0-1/2/3 and P15–P17 are the controlling decisions. Company-owned books, separate franchise companies, automatic creation and one review/go-live screen are broadly aligned. The findings below do not reopen those decisions or introduce an accountant approval gate.

Only this report and the requested review-channel append were written. No spec, generator, rig, production code, migrations, checkpoint or PROJECT-STATE changes; no builds, commits or pushes. The earlier Step 0 follow-ups were completed by Claude and were not continued here.

## MAJOR findings

### M1 — Posting validation omits the live-state/date guard

**Evidence:** `docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md:276`–292 gives the posting validation/write sequence. It checks authority, accounts and OPEN periods, but not setup LIVE or entry date against go-live. At :59 the automatic creation has already created fiscal periods, while :142 says READY_TO_GO_LIVE must not permit posting.

**Consequence:** implementing that sequence literally allows both manual and machine journals against an open period before the review has made the books live, or dated before the selected start.

**Suggested fix:** add a company-scoped authoritative LIVE and `entryDate >= go_live_date` check for every posting path. Recheck/serialize it in the transaction with setup/chart replacement and first posting, using a documented consistent lock order. Refusal must allocate no journal number, journal, balance, audit or domain event. Specify regression cases for READY, a date before go-live and concurrent replacement/first posting. This is a contract omission, not evidence of a live exploit.

### M2 — Retry cannot repair relationship changes to existing books

**Evidence:** `NeoERP-App/docs/design/specs/accounts-a0.md:544`–545 returns existing books without writes and limits retry to eligible companies with no books; :449–457 and `docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md:360` require franchise/group accounts to follow Org changes.

**Consequence:** after a parent already has books, its first franchise or a moved franchise can change which accounts should be active. A missed event is never repaired by the creation-only retry. Processing only the child also leaves the old/new parent's franchise-income eligibility stale.

**Suggested fix:** separate idempotent initial creation from versioned company-facts reconciliation. Describe affected child and old/new parent targets, preservation of user-owned chart/go-live state, and a bounded repair scan that includes existing books. Duplicate reconciliation makes no additional changes or audit; a newer relevant fact produces its own recorded transition.

### M3 — A different chart silently changes the legal tax country

**Evidence:** `NeoERP-App/docs/design/specs/accounts-a0.md:339`–342 expressly replaces tax codes with the chosen chart. `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:571` derives tax from `pack`; :572 resets mappings on a chart change. Browser reproduction: Lahore remains Pakistan/PKR, but selecting Norway replaces its 17 Pakistan codes with 11 Norwegian MVA/SAF-T codes. This conflicts with Org-derived country taxes in D-A0-2/P16.

**Suggested fix:** model account structure separately from tax jurisdiction. A Norway-style chart for a Pakistan company must retain Pakistan tax definitions; validate/remap their account links to the new chart before accepting replacement. Carry distinct chart and tax-pack versions in the contract, acknowledgement and audit. Test PK→NO/Base and NO→SE with country and currency unchanged.

### M4 — Lost-response wording falsely guarantees no commit

**Evidence:** `NeoERP-App/docs/design/specs/accounts-a0.md:250`–252 says the company is not live and nothing was saved after connection loss/server error. `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:602` demonstrates that message. The go-live contract at spec:547 has no replay/result-resolution semantics.

**Consequence:** a server can commit GO_LIVE and lose its response. Blind retry then reports an apparent competing operator, even when this operator's own first request succeeded. A generic 500 also does not establish rollback.

**Suggested fix:** preserve choices and say the result could not be confirmed. Reconcile authoritative setup state before allowing another decision; define an operation/idempotency key, same-key/same-payload success replay, conflicting-payload refusal and actor/operation metadata. Reserve “nothing saved” for confirmed refusals. Include success-with-response-loss and temporarily unavailable reconciliation fixtures/tests. The existing simulated pre-commit failure is a valid example, but cannot represent every transport failure.

### M5 — Rig confirmations outlive company/authority changes

**Evidence:** `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:585`–593 captures the company/persona and commits after a timeout without cancellation or a current-context check. Open chart, mapping and tax reason gates have no confirmation-time authority check, e.g. :942 and :1046–1054. Action visibility alone does not protect already-open actions.

**Consequence:** a pending action can mutate an old company's demonstration state or navigate back after changing context; an open mutation gate can remain usable after switching to Neovatus read-only. That contradicts the security states the rig is meant to demonstrate. This finding concerns the rig, not proven production authorization.

**Suggested fix:** close/cancel pending gates and requests on persona/company/permission changes; guard confirmations and completions against current company, authority and request generation. Backend contracts must independently refuse every platform write, including full-access Enter company. Add revocation/company-switch/pending-response acceptance cases.

### M6 — Required-account source/check evidence cannot survive the model

**Evidence:** accepted D-A0-3 at `NeoERP-App/docs/design/specs/accounts-a0.md:45` requires references for required accounts as well as tax codes. All four account CSV headers omit source/check metadata. `docs/drafts/accounts/coa/_generator/lib.py:27` and `docs/drafts/accounts/coa/_generator/rig_export.py:12`–13 omit it; `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:191` and :850–853 consequently show template provenance/notes rather than the required source/check status.

**Suggested fix:** add per-account source reference, evidence version and verification state, or a keyed evidence catalogue that survives generation/export and company-copy provenance. Required account panels/checklists must honestly show “Not yet checked against source” until checked. An unchecked descriptive source string is acceptable at this stage; no accountant approval gate is required. Add CSV/export/display coverage for a required account in each pack.

### M7 — Norwegian import VAT conflates SAF-T 81 and 14

**Evidence:** `docs/drafts/accounts/coa/tax-codes.csv:29` and `_generator/tax.py:52` use “81 / 14” for one reverse-charge import template with both output and input accounts. [Skatteetaten's official VAT-return model](https://skatteetaten.github.io/mva-meldingen/mvameldingen_eng/informasjonsmodell/) distinguishes self-assessed imports with deduction (81, including its deduction line) from VAT paid upon import (14).

**Suggested fix:** use 81 for this self-assessed workflow. Represent paid-at-import VAT separately if supported; define account/report treatment and regression expectations for each. This is a wrong factual mapping, not merely an unchecked reference.

### M8 — Swedish extension numbers collide with BAS meanings

**Evidence:** `docs/drafts/accounts/coa/se-bas.csv:57` and :60 repurpose 1960 as till clearing and 2069 as opening equity; `_generator/se.py:63` and :66 generate them. `docs/drafts/accounts/coa/README.md:125` calls these undefined extension numbers, while :126 calls 206x the partnership series. In the [official BAS 2026 chart, page 8](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf#page=8), 1960 is the parent-company group account and 2069 is annual result in the nonprofit/foundation/religious-community equity group. PDF extraction concatenates 1960 with the preceding page; it is present in the current chart.

**Suggested fix:** choose and justify extension numbers without claiming occupied BAS numbers are undefined; correct the 206x explanation. Update generator, pack, export and source-evidence catalogue together; validate roles and local-report classification. Honest unchecked labels do not make the contradictory standard-number claims accurate.

### M9 — Pakistan's active 20% withholding template omits material eligibility/exemptions

**Evidence:** `docs/drafts/accounts/coa/tax-codes.csv:17` and `_generator/tax.py:39` make this a generic active purchase template, with only the note “registered withholding agents.” The [FBR Sales Tax Act consolidated through June 2026, Eleventh Schedule](https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf#page=219) distinguishes agent/supplier categories and one-fifth, one-tenth and other treatments. Its [exemptions, printed page 223](https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf#page=223) also matter: active-taxpayer supply to a registered person is generally excluded subject to listed exceptions.

**Suggested fix:** qualify the template by the applicable scenario and exclusions, or keep it inactive until eligibility can be represented. Do not infer 20% from agent registration or active-supplier status alone. Preserve that this percentage applies to the tax amount, not the taxable price. Test eligible and excluded scenarios. The 20% percentage itself is valid in a particular case; universality is the defect.

## MINOR findings

### N1 — READY inspection tabs are missing; demo routes can imply go-live

**Evidence:** spec `NeoERP-App/docs/design/specs/accounts-a0.md:164`–167 permits inspection before go-live. `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:1089` and :1126 gate normal tabs on LIVE, while :1075 seeds a live demo on ordinary routes. The fresh setup browser capture has only the summary/review entry point, rather than the normal inspection tabs.

**Suggested fix:** distinguish books-created from LIVE; allow read-only inspection of chart/mappings/calendar/taxes in READY. Ordinary navigation must not change readiness. Keep explicit live-demo seeding separate and document it. Test READY→inspection→review without a state mutation.

### N2 — Go-live saving does not freeze the complete form

**Evidence:** spec:239 requires every control disabled. Rig `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:619`–625, :639, :670 and :689 keep chart, account/date and acknowledgement controls editable while only footer buttons at :700–701 disable.

**Suggested fix:** apply saving state consistently to all editable review controls. Ensure visible choices equal the submitted snapshot, including rapid edits during submission. This is demonstrator behavior, not an established production request race.

### N3 — Review remaps “Used for” without its reason flow

**Evidence:** `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:654`–655 changes mappings directly. Spec:224 calls for an inspection summary/open Used-for link; :360–366 and :502 require a reasoned remap and recorded reason.

**Suggested fix:** restore read-only review navigation to the shared reason flow, preserving other review choices; alternatively reconcile the approved spec/GO_LIVE payload to explicitly define audited initial mapping decisions before implementation. Do not silently treat ordinary remaps as unaudited checkbox choices.

### N4 — Tax-code creation is absent from the A0 contract outline

**Evidence:** `NeoERP-App/docs/design/specs/accounts-a0.md:415`–418 promises Add tax code for Base countries, but :552 lists only reads, versions and activation/deactivation. Architecture:428 includes `TAX_CODE.CREATE`.

**Suggested fix:** add the creation route and request/response/error cases, including country/jurisdiction, applicability, account validation, source metadata and initial dated rate. This is a bounded contract completeness issue; the backend contract is intentionally not yet built.

### N5 — Further-tax description omits registered inactive taxpayers

**Evidence:** `docs/drafts/accounts/coa/tax-codes.csv:6` labels it only for unregistered persons. [FBR §3(1A)](https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf#page=28) also includes registered persons who are not active taxpayers, subject to statutory exemptions.

**Suggested fix:** correct the label/applicability note and derived rig wording. Retain the supported 4% rate; test both purchaser categories and exclusions once tax selection is implemented.

### N6 — Initial go-live date differs from the spec

**Evidence:** spec `NeoERP-App/docs/design/specs/accounts-a0.md:222` defaults to current-year start. `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:558` initializes an empty selection; :671 and the rendered review show “Choose a date.”

**Suggested fix:** default to the first period of the current fiscal year, or explicitly revise the spec if deliberate selection is preferred. Preserve the accepted current/next-year choices; this does not reopen Q2/Q5.

## Buildable-contract dependencies and security gates

These are required additions to the forthcoming backend contract, not findings that an unbuilt A0 implementation is broken:

- **Org facts:** `NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/application/port/inbound/facts/OrgFactsUseCases.kt:7`–13 accepts known IDs, not enumeration. Its company fact at :53–68 lacks currency, fiscal-year start and consolidation. Define a versioned machine contract supplying those facts, company-bound branch/location/franchise enumeration and a bounded eligible-company/reconciliation cursor. Accounts must not read another service's database to fill the gap.
- **Events:** `NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/application/service/module/CompanyModuleService.kt:116`–125 emits a module-replacement audit. `NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/configuration/audit/AuditEventPublisher.kt:45`–52 sends its outbox to `/api/audit/events`. This is not the domain event subscription assumed at spec:544. Specify effective FINANCE transitions from agreements/entitlements/enrolment and fact changes, event IDs, company/version ordering, redelivery, transactional production and retry ownership. M2 explains why creation and reconciliation need different semantics.
- **Platform refusal:** `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/configuration/security/AccountsActiveUserLifecycleFilter.kt:35`–42 blocks READ_ONLY writes, but FULL flows through. `AccountsAuthorization.kt:127`–151 does not universally refuse platform writes. A0 must explicitly refuse both modes rather than reuse current permission checks unchanged.
- **Owner/Finance Manager:** backend GO_LIVE/chart replacement must enforce the accepted allowed company actors and fresh effective rights; do not rely on the rig persona or only seeded default grants. Define how delegated/custom permissions interact with the literal “only” rule before seeding. A taken-away right cannot be treated as held.
- **Module-off home:** current `AccountsAuthorization.kt:47`–52 uses the FINANCE gate for reads. Define an authorized setup preflight that can return NOT_ENABLED without exposing ledger data; ordinary ledger reads remain entitled. Otherwise the designed state is unreachable behind a generic 403.
- **ADR-012:** all setup/accounts/mapping/tax/year reads and mutations remain company-bound. A franchise parent/reporting flag must not widen a tenant scope. Creation uses authoritative facts, one atomic set of records and a company uniqueness constraint; concurrent losers reread the winner without extra audit. Chart replacement/first posting, go-live replay and fact reconciliation need explicit lock/version and error contracts. Reserve 409 for state/version conflicts, 422 for field/domain refusals, and keep 401/403 distinct.

## Recommendations for entry 33's four known open items

1. **RULES §7 wording:** `NeoERP-Design/RULES.md:121`–131 still describes a franchised branch keeping its own books. Proposed replacement: “Every branch posts into the books of its owning company and carries a branch tag. A franchise is a separate company with its own Owner, sign-in and books; its franchisor relationship may permit reporting consolidation. Consolidation and commercial billing do not grant cross-company ledger access.” Reconcile the request cards and invoice/agreement claims separately; do not silently edit RULES or infer billing policy from ledger ownership.
2. **SETUP.RUN:** recommend a clear GO_LIVE permission plus a distinct chart-replacement permission before seeding, rather than one RUN code covering both responsibilities. Keep automatic CREATE system-owned. If the existing RUN name is retained for compatibility, document its two exact operations and enforce platform refusal independently. No renaming implemented here.
3. **Audit/events:** accept proposed `accounts-setup CREATE/GO_LIVE` and `accounts.books.created/went_live` naming. Register the action/resource catalogue, system/real actor, company, trigger/fact version, chart/tax version, go-live date, acknowledgement and correlation/idempotency fields before build. Publish only committed transitions. Chart replacement needs its own recorded reason; no duplicate events on replay. Audit display uses plain language rather than wire codes.
4. **Sialkot fixtures:** `NeoERP-App/docs/design/screen-rig/app.html:4056`, :4140 and `people-access.jsx:53`/59 still place Sialkot work under Lahore, whereas the Accounts facts at app.html:12124–12125 correctly make Sialkot its own company/branch. Recommend moving its People/Branch fixtures to that company and reviewing relationship/billing wording together. This known inconsistency is recorded separately, not counted a second time as a new A0 finding.

## Verification and limits

**Completed review stages: source/decision trace → rendered states → official-source fact checks → findings. Health: changes requested.** Read-only Sol 6.1 reviewers independently checked contract/security, rig/spec agreement and country-pack facts; the lead challenged and reconciled the findings, including BAS 1960 and the FBR withholding exemptions.

Opened the requested Lahore review, fresh Lahore setup and Sialkot overview routes in the local `app.html` rig. Inspected desktop 1440×900 and phone 390×844, Owner/Finance Manager action visibility, Neovatus read-only review, missing currency, load failure, agreement-off, simulated network loss, simulated concurrent go-live, alternate chart taxes and phone tax-row wrapping. Ordinary overview/cards and phone tax rows were readable in these captures; this is not an exhaustive keyboard/accessibility or all-country responsive certification. Explicit setup/overview deep-link fixtures require a fresh reload to seed their demonstration state reliably; the report does not equate fixture seeding with a production transition. No real company, financial transaction or service was changed.

Read-only data comparisons reported exact agreement between all four chart exports, all 43 tax rows and all 60 role catalogue entries (20 required). That establishes propagation, not statutory correctness; generator checks are not an independent official-rate test. No generator was run to rewrite output.

Official FBR, Skatteetaten, Skatteverket and BAS material supports the fact findings above. Sweden's temporary food VAT 6% for 1 April 2026–31 December 2027 is consistent with [Skatteverket guidance](https://www.skatteverket.se/foretag/moms/saljavarorochtjanster/momssatserochundantagfranmoms.4.58d555751259e4d66168000409.html); it is not a wrong-rate finding. Provincial SRB/KPRA/BRA material was inspected by the country reviewer, but PRA evidence available was older and BRA's scanned July 2026 notification was not fully text-verifiable. No complete current provincial or paid NS 4102 certification is claimed. Unchecked descriptive source strings are permitted by D-A0-3; the country must not be represented as ready merely because a source label exists.

Tests/builds: not run for this read-only design review. Required regression cases are recommendations for the later authorized implementation. No production isolation, money-posting correctness or physical-device acceptance is certified by these screenshots.

### Capture evidence

Temporary local captures; no baseline or rig asset changes:

- [Lahore READY desktop](/tmp/neoerp-a0-review/setup-ready.jpg)
- [Lahore missing facts](/tmp/neoerp-a0-review/setup-facts-missing.jpg)
- [Pakistan company with Norway chart/taxes, full page](/tmp/neoerp-a0-review/pakistan-norway-chart.jpg)
- [Concurrent go-live refusal, full page](/tmp/neoerp-a0-review/concurrent-go-live.jpg)
- [Sialkot own books desktop](/tmp/neoerp-a0-review/sialkot-own-books.jpg)
- [Sialkot phone overview](/tmp/neoerp-a0-review/sialkot-390.jpg)
- [Phone tax rows](/tmp/neoerp-a0-review/tax-390.jpg)

![Lahore books ready for review](/tmp/neoerp-a0-review/setup-ready.jpg)

![Sialkot has its own company books](/tmp/neoerp-a0-review/sialkot-own-books.jpg)

### Review snapshot

App HEAD `f091474ba11e05a3d715bff8f1fafc877df78246`; backend HEAD `aa03df755d3804b7b02af4ecff755af7cfc01e37`. Accounts design files are working-tree drafts/untracked; these HEADs are context, not a claim the reviewed drafts are committed. No Git range is created by this review.

SHA-256 snapshot of principal reviewed drafts:

| File | SHA-256 |
|---|---|
| accounts-a0.md | 258defe49627c48a9e9f9d7db637922b28fa01b9e923eb464f7f73a6b39e944c |
| ACCOUNTS-ARCHITECTURE.md | 18ceff77fe054a849e8bf52b90b9dcfc99959a171756031eed65f749e792494b |
| accounts-a0.jsx | fdd975f1246ab5851844c9e65db322cb3a0a95d9dc34444ce22440c7e21f2a8d |
| accounts-data.jsx | 73115845e434d48dc601880fbcd04c8db04cfa3fc2521cefaa32fce1af554c17 |
| app.html | e666e7ed8680a09ba33ca8e230f58d7fe8c13e1e41b7dc6da0408119d6f32912 |


## Re-review

2026-10-06 · entry 34 · focused review of the changed working-tree design, packs and rig.

**Result: 11 original findings closed; 4 not closed (M2, M4, M5, N3). One additional MAJOR finding, R1, from the explicitly requested BAS check.** “Closed” means the original defect is resolved in the proposed design/data/rig, not that an Accounts implementation, backend security or financial release has passed acceptance. The original report above is retained as history; current dispositions below supersede its open/closed status for these items.

### Disposition of each original finding

All paths and line numbers here refer to the current working-tree files under `/Users/jabransiddiqui/Offices/Neovatus/NeoERP`.

| Finding | Disposition | Current evidence and limits |
|---|---|---|
| M1 — posting LIVE/date guard | **Closed** | Architecture §5.3 at `docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md:288` and :291–303 now requires the in-transaction LIVE/date checks and setup → period → sequence ordering. Spec `NeoERP-App/docs/design/specs/accounts-a0.md:660` states serialization with first posting/chart replacement and no writes on refusal. This closes the design omission; implementation/concurrency tests remain future work. |
| M2 — existing-books reconciliation | **Not closed** | Creation/reconciliation/retry are correctly separated at spec:655–656 and architecture:375–377, but the version scope needed to repair lost parent/child relationship events is not defined. See residual M2 below. |
| M3 — chart changed legal tax country | **Closed** | Spec:272, :276 and :659 separate chart structure from country taxes. Rig `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:233`–253, :653 and :1026–1030 retains country tax codes, remaps their accounts and refuses missing links. Browser check confirmed PK codes/FBR references remain after choosing a Norway chart for Lahore; country and PKR remain unchanged. |
| M4 — lost-response guarantee | **Not closed** | Spec:304–308 replaces the false certainty with an uncertain-result/re-read flow, and :658 defines idempotent replay. Missing result metadata and the broad 4xx assertion still leave the recovery contract incomplete; see residual M4. |
| M5 — stale authority/context actions | **Not closed** | Rig generation and confirm-time permission guards exist at accounts-a0.jsx:325–336 and persona/direct Accounts-company changes invalidate pending actions. Leaving Accounts does not invalidate the completion. Source evidence and live reproduction below. |
| M6 — account source/check evidence | **Closed** | All four chart CSVs now have source/evidence_version/check_state; `_generator/lib.py:27`–57 and `rig_export.py:12`–14/:30–32 preserve them. Rig models at :203–206/:226–230 and panels at :1011–1012/:1193–1194 expose them. Required accounts show unchecked status. This closes missing representation, not the accuracy of every source string; R1 identifies a false source claim separately. |
| M7 — Norway SAF-T import 81/14 | **Closed** | `docs/drafts/accounts/coa/tax-codes.csv:29`–30 and `_generator/tax.py:61`–62 now have separate self-assessed 81 and paid-at-import 14 codes, the latter input-only. Consistent with [Skatteetaten's VAT-return model](https://skatteetaten.github.io/mva-meldingen/mvameldingen_eng/informasjonsmodell/). The separate standard-account mapping remains unverified, as entry 34 states. |
| M8 — SE 1960/2069 collisions | **Closed for the original finding** | `se-bas.csv:54`/:60 and `_generator/se.py:63`/:66 use 1919/2009. Neither appears in the inspected complete BAS 2026 groups 19/20. README:130–132 correctly describes the former occupied numbers. No occupied-code finding for these replacements; separate requested 3921/3922 review produces R1 below. |
| M9 — generic active PK withholding | **Closed** | `tax-codes.csv:17` now makes 20% inactive by default and records scenario dependence, tax-amount basis and exclusions. `_generator/tax.py:20`, :28–30 and :49 preserve this behavior and note. This resolves the unsafe default without asserting a universal 20% rate. Eligibility remains grounded in the [FBR Eleventh Schedule and exemptions](https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf#page=220). |
| N1 — READY inspection | **Closed** | Rig :312–323 and :1231–1255/:1290–1300 distinguish READY read-only inspection from LIVE. Ordinary routes no longer seed LIVE; `live-demo` is explicit. Browser check opened READY's Chart tab without going live and displayed the read-only-until-go-live notice. |
| N2 — saving form remained mutable | **Closed for the original defect** | Rig :655–656 and :739–759/:776–777/:792/:808 freeze mutating review choices; :685–687 captures the submitted snapshot. Inspection disclosures can still expand. That does not recreate the submitted/visible-choice defect, although spec:293's literal “every control” wording could be narrowed to editable controls. |
| N3 — unaudited Used-for remaps | **Not closed** | Inline changes now use shared Change + reason, so the original reason omission is improved. Review-local mappings/history still differ from the read-only/navigation and go-live payload contract; see residual N3. |
| N4 — tax-code creation contract | **Closed** | Spec:665 adds POST `/api/accounts/tax-codes`, request, validation, 409/422 and CREATE audit; architecture §9 is aligned. This closes the missing route outline, not transport/backend implementation. |
| N5 — further-tax scope | **Closed** | `tax-codes.csv:6` and generator include registered non-active taxpayers as well as unregistered persons, with statutory exemptions; [FBR §3(1A)](https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf#page=28) supports that wording. Rate remains 4%. |
| N6 — initial date | **Closed** | Rig :640 defaults to current FY period 1, matching spec:273. Rendered Lahore review selected 1 July 2026 initially. |

### Remaining findings, ranked

#### MAJOR — M2: relationship-derived parent facts need a repairable version/cursor

**Evidence:** spec:655–656 and architecture:376–377 reconcile a child plus old/new parent when an event arrives, but retry only compares each company's recorded fact version with Org's. Spec:672–680 and architecture:381–382 do not define whether a child's addition, removal or move advances either parent's relationship version, or how a missed removal identifies the former parent.

**Failure case:** a child relationship event is missed after its parent already has books. If only the child's own company version advances, the parent's record is not selected by the retry scan. A move/removal also needs the old parent; enumerating only present children does not identify it. Thus the stated retry does not yet prove that it repairs the original stale parent activation case.

**Required clarification/fix:** define an aggregate company-facts version that advances for relationship changes affecting each old/new parent, or a durable change cursor that includes those affected IDs and supports missed-event repair. State how previous parent facts are retained/resolved. Add acceptance cases for a lost first-franchise event and a lost removal/move event, with no accidental reversal of user settings or duplicate audit.

#### MAJOR — M4: recovery cannot identify the successful operation from the declared read response

**Evidence:** spec:306–307 requires distinguishing “live by this go-live” from another operation; :658 stores actor/operation ID, but GET setup at :657 declares only goLive/hasPostings/version alongside setup facts. It does not return the go-live operation identity, actor or time. Spec:309 also says “nothing saved” on a confirmed 4xx generally, while :658 includes a changed-payload key-reuse 409 that may follow an already committed original operation.

**Required clarification/fix:** expose an authorized operation result or setup completion metadata sufficient to recognize the submitted operation and display the actual actor/time. Define reconciliation for key reuse and other already-live conflicts; a 4xx on a later attempt does not prove the earlier attempt did not commit. Keep same-key/same-payload replay, current uncertain wording and retained choices. Include exact response fields and own-completion versus concurrent-completion cases in the contract.

#### MAJOR — M5: pending completion still escapes after navigation outside Accounts

**Evidence:** rig `accounts-a0.jsx:688`–695 checks only the generation. Generation changes at :1230 on entry into a different Accounts company; the root navigation at `NeoERP-App/docs/design/screen-rig/app.html:13390`–13395 does not invalidate it. AcReview has no unmount cleanup. The recovery callback at :700–705 has the same lifetime issue.

**Browser reproduction:** fresh Lahore Review → acknowledge → Go live → immediately click Companies. The Companies table rendered. After the pending timeout, the rig returned to Lahore Accounts Overview and showed it live. This is a demonstrated stale completion, not just a speculative race. All state changed was the local disposable rig fixture.

**Suggested fix:** invalidate/cancel completion on leaving the operation's owning route/context, including another same-company tab and Org/company detail. Recheck mounted/current operation identity before commit/navigation; retain the new persona/company/permission checks. Verify that pending go-live and status recovery cannot navigate back or mutate an abandoned fixture after leaving it. A real server operation may still finish after navigation; production must reconcile that result without letting an obsolete UI callback take over navigation.

#### MAJOR — R1 (new, requested BAS check): SE 3921/3922 falsely labelled undefined extensions

**Evidence:** `docs/drafts/accounts/coa/se-bas.csv:143`–144 assigns 3921 to franchise-fee income and 3922 to marketing-fund income, with source strings saying the numbers are not defined in BAS 2026. `_generator/se.py:149`–150 generates those assignments; `_generator/lib.py:51` generates the false undefined-number claim. README:129 repeats it. The [official BAS 2026 chart, PDF page 16](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf#page=16) defines 3921 as commission income and 3922 as licence/royalty income; 3925 is franchise income.

**Suggested fix:** use the standard account whose meaning fits the intended franchise-income role (consider 3925), and choose/justify a genuinely unlisted marketing-fund extension. Correct generator, CSV, role mappings, rig export and provenance together. Do not turn this into a cosmetic source-label change while retaining a contradictory standard meaning. UNCHECKED is honest verification status, not a license to assert an occupied number is undefined.

#### MINOR — N3: inline review remaps are still absent from the declared go-live payload

**Evidence:** spec:275 describes a read-only summary with navigation to normal Used for and preserved review choices. Rig :830–835 instead changes local mappings/history and says the reason will be recorded with go-live. The submitted snapshot at :685 includes map/mapHist; the backend go-live outline at spec:658 includes neither mapping changes nor their reasons. Outside review, the declared PUT mapping route at :662 does carry a reason.

**Suggested fix:** implement the specified inspection/navigation flow with retained review choices, or explicitly reconcile the interaction and backend payload/audit contract to permit initial mapping changes with their reasons in the go-live transaction. The shared reason gate itself is now correct; the remaining issue is that the demonstrated changes have no matching declared request contract.

### Explicit SE 3921 / 3922 / 5991 check

| Number | Official BAS 2026 observation | Review conclusion |
|---|---|---|
| 3921 | Defined as commission income, PDF page 16. | Occupied; current franchise-fee assignment and “undefined” source claim require correction, R1. |
| 3922 | Defined as licence/royalty income, PDF page 16. | Occupied; current marketing-fund assignment and “undefined” source claim require correction, R1. |
| 5991 | Not listed in the inspected complete group 59; 5990 is listed before group 60 begins, PDF pages 24–25. | No occupied-number finding. May remain an explicitly custom UNCHECKED extension; this is not certification of marketing-fund accounting treatment or freedom in a company's existing chart. |

Sources: [BAS 2026 group 39](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf#page=16), [BAS 2026 group 59](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf#page=25). The country reviewer inspected the official PDF. The lead's initial official fetch succeeded; subsequent refetches returned 503, so the report relies on that independently retrieved PDF evidence rather than treating the fetch failure as an absence of accounts.

### Dependencies and known recommendations

- **Org/platform prerequisites:** spec §8.1 now explicitly identifies the versioned facts contract and domain outbox as Org work landing before/with A0; platform writes are refused in both modes, preflight is reachable with FINANCE off, and ADR-012 binding is explicit. These are now documented design requirements, not implemented-service evidence. M2's version scope still needs completion.
- **Owner/Finance Manager restriction:** the original dependency remains to resolve precisely. Spec:268 and :551 say only those actors; :658–659/:684–685 specify fresh effective codes. Say explicitly whether verified allowed company-role identity is also required, or whether custom-role/delegated code holders are intended. Do not infer identity from browser persona or token claims. This was already an unresolved contract question in the original report, not a new implementation finding.
- **Permission split/audit names:** accepted GO_LIVE and CHART.REPLACE split, RECONCILE/CHART_REPLACE actions and domain events are recorded. No migration or catalogue change was made by this review.
- **Sialkot fixtures:** entry 34's changed data/platform-data/people-access now treat Sialkot Mills as its own company. This resolves the named fixture inconsistency at source level; no live tenant migration is claimed.
- **RULES §7:** still awaiting Jabran's decision per entry 34. No edit or implicit approval here.
- **Unverified country facts:** the Norway SAF-T standard-account mapping and Pakistan provincial sources remain UNCHECKED/draft. This re-review does not convert them into verified country readiness.

### Evidence, stage and next action

Focused design re-review completed using separate read-only Sol 6.1 contract, rig and country reviewers; lead reviewed their dispositions and reproduced M5 in the browser. Only this appended report section and the requested channel entry were written in the workspace. No code, spec, rig, generator, migrations, owning plan or PROJECT-STATE edits; no builds, tests, generation, commits or pushes. Read-only closure is separate from implementation approval.

Read-only structural checks reported equality for all four chart exports (1,024 rows) and 44 tax rows, including source/check fields. AST inspection reported equality of the tax generator's literal rows with the tax CSV; generators were not executed. These checks establish propagation, not financial correctness.

Current context remains App HEAD `f091474ba11e05a3d715bff8f1fafc877df78246` and backend HEAD `aa03df755d3804b7b02af4ecff755af7cfc01e37`, plus the uncommitted entry-34 changes. There is no new commit range.

Temporary browser evidence:

- [PK tax codes retained on a Norway chart](/tmp/neoerp-a0-rereview/pk-norway-fixed.jpg)
- [READY chart inspection](/tmp/neoerp-a0-rereview/ready-inspection.jpg)
- [Stale completion after navigating to Companies](/tmp/neoerp-a0-rereview/pending-navigation.jpg)

![Stale completion returned to Accounts after Companies had rendered](/tmp/neoerp-a0-rereview/pending-navigation.jpg)

**Next action:** designer/implementer addresses M2, M4, M5, N3 and R1 in the design artifacts, then requests focused re-review. The current review does not authorize Accounts implementation or settle RULES §7. The task owner can record these dispositions in its owning checkpoint; that checkpoint was not edited under this read-only scope.

Principal re-review SHA-256 snapshot:

| Path | SHA-256 |
|---|---|
| NeoERP-App/docs/design/specs/accounts-a0.md | b59d28b40dd5efdd049f02c92c8867d026e78193c96a35497b321b1a758ffccd |
| docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md | 1a7c28dc6e88bddda9d3b389c7ba763f0417a7f4376cfc7b12a936b96a8a1134 |
| NeoERP-App/docs/design/screen-rig/accounts-a0.jsx | a9c9cef0480e8fbfa4872afab5a611ca90ff6a295a4f5afca5847e1614ad7766 |
| NeoERP-App/docs/design/screen-rig/accounts-data.jsx | ba221a4b738248bc96915878b835576696476daa4db559654c72719a606887e2 |
| NeoERP-App/docs/design/screen-rig/app.html | 8d5b92ea1ff7cdd5269258bd69d601e00d3a5136477b7b04cd5d41fe2fa9932c |
| docs/drafts/accounts/coa/se-bas.csv | 8e8d7b89933f41f0f830eca91c9cf9dfc6c13d71c691d0e90f843bcdf7f2de78 |
| docs/drafts/accounts/coa/tax-codes.csv | 31c744e35170a7ad8f0e617b84c1f2675578800ef165d8b9a3d9b273b39cc759 |
| docs/drafts/accounts/coa/_generator/lib.py | f1d74ef139c787630e1b4f856a6c702b54f80e776f3c05af8afe095006bab773 |


## Re-review 2

2026-10-06 · Codex · focused read-only re-review of to-implementer entry 35. Scope: M2, M4, M5, N3 and R1 only. Reviewed the current uncommitted design artifacts, not an implemented Accounts service. Prior review sections remain historical evidence.

### Dispositions

| Finding | Disposition | Evidence and conclusion |
|---|---|---|
| M2 | **Closed at design level** | `NeoERP-App/docs/design/specs/accounts-a0.md:705`–706, :726–737 and `docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md:376`–379 now require an aggregate company facts version. Relationship changes advance the child and old/new parent versions atomically; events identify those parents and relationship history is retained. Reconciliation uses current facts and only newer versions; the bounded retry selects lagging books. Lost first-franchise, removal and move cases are explicit. This resolves the missed-parent-event/cursor gap. |
| M4 | **Closed at design level** | Spec :335–350 and :707–708; architecture :532. GET setup returns the original operation and actor/result metadata. Recovery distinguishes its own operation, another actor's operation and a not-live result; retry preserves the key. Changed-payload key reuse returns 409 with the original result. “Nothing was saved” is confined to a first refusal without previous uncertainty. This resolves the ambiguous-completion contract. |
| M5 | **Closed** | `NeoERP-App/docs/design/screen-rig/accounts-a0.jsx:663`–667 clears the timer and invalidates the operation on unmount. Completion/recovery callbacks at :717/:731 check mounted, operation and generation. Root navigation in `screen-rig/app.html:13428` advances the generation. Browser regression: Lahore Review → acknowledge → Go live → immediately Companies. Companies remained displayed after the pending interval; returning through Accounts Overview showed “Books ready to go live.” No abandoned callback navigated back or marked the fixture live. This verifies the demonstrated rig defect; production server completion/reconciliation remains future implementation work. |
| N3 | **Not fully closed — two MINOR inconsistencies below** | The original missing request/reason contract is resolved: spec :304, :319–324, :708 and architecture :532 declare `mappingChanges[{roleCode,accountCode,reason}]`, validate/apply atomically, audit each REMAP before GO_LIVE, and roll everything back on invalid changes. The rig holds these changes and labels them “Applied when you go live.” Separate remapping rights and audit cardinality still need alignment. |
| R1 | **Closed at design level** | `docs/drafts/accounts/coa/se-bas.csv:143`–145, `_generator/se.py:154`–156 and `coa/account-roles.md:153`/:155/:157 now use royalty 3922, franchise fee 3925 and a custom UNCHECKED marketing-fund 3926. The Swedish CSV and rig export match across all 264 rows, including provenance. Occupied-number meanings and false undefined claims for 3921/3922 are removed. |

### N3 remaining — MINOR: rig does not distinguish remapping rights

**Evidence:** spec :74 explicitly requires fresh `ACCOUNTS.ROLE_MAPPING.UPDATE` for every submitted mapping change and hides Change without it. The rig's `acMe` at `accounts-a0.jsx:355`–361 exposes only combined role-based `write`/`setup` flags. Review's role rows at :811–812 receive `write: can && !frozen` from setup authority, and the confirmation at :866 checks only `acStillMay(..., 'setup')`.

**Effect:** the design contract correctly separates the rights, but the demonstrator cannot represent a person holding GO_LIVE while ROLE_MAPPING.UPDATE is Taken away. It therefore cannot demonstrate the specified hidden Change link or refusal when that right disappears during the reason dialog. This is a rig/spec mismatch, not evidence of an implemented backend authorization bypass.

**Suggested fix:** represent the remapping capability separately, use it for Change visibility and fresh confirmation, and require it for pending `mappingChanges` when going live. Add a bounded rig regression for GO_LIVE held / mapping update absent, and for removal of mapping authority while the dialog is open. Carry the explicit conditional permission into the endpoint outline for clarity; do not require an Owner/Finance Manager role where the approved effective-code rule permits a custom role or Extra.

### N3 remaining — MINOR: contradictory audit cardinality

**Evidence:** architecture :66 says every A0 mutation emits “exactly one audit event”; its go-live endpoint at :532 requires one REMAP per mapping change followed by GO_LIVE. Those are different audit counts for the same request.

**Suggested fix:** define one event per committed domain transition, with every mapping REMAP and GO_LIVE emitted in the same transaction. Replays must not duplicate events; refused transactions emit none. Keep the explicit multi-event go-live behavior and correct the broad invariant so implementation does not discard mapping audit records to satisfy it.

### BAS 2026 page 16: 3926 confirmed unlisted

The official [BAS 2026 chart, PDF page 16](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf#page=16) opened successfully. In group 39, it lists 3921 as commission income, 3922 as licence/royalty income and 3925 as franchise income, then proceeds to 3940. **3926 is not listed.** This supports the corrected custom-extension provenance; it does not certify the proposed marketing-fund accounting treatment or availability in an existing company chart. Keep 3926 UNCHECKED pending the country's accounting acceptance. The narrowed checked-number set in `_generator/se.py:9` avoids asserting that every extension has been verified; other extensions retain “not yet checked” provenance.

### Evidence and handoff

Separate read-only contract, rig and country checks were reconciled by the lead; source inspection and the previous M5 browser reproduction were repeated against the current artifacts. No service/app builds or automated implementation tests were run for this design-only task, and generators were not executed. Only this report append and the requested review-channel append were written in the workspace; code, specs, rig, generator, migrations, plans and PROJECT-STATE were not changed. No commits or pushes.

App HEAD `f091474ba11e05a3d715bff8f1fafc877df78246` and backend HEAD `aa03df755d3804b7b02af4ecff755af7cfc01e37` are contextual only: reviewed fixes are uncommitted. Principal source hashes are recorded below to identify the reviewed working-tree snapshot.

Temporary browser evidence: [Companies after pending operation](/tmp/neoerp-a0-rereview2/companies-after-pending.jpg), [READY after returning](/tmp/neoerp-a0-rereview2/ready-after-return.jpg).

![Books remain ready after returning from Companies](/tmp/neoerp-a0-rereview2/ready-after-return.jpg)

**Next action:** design owner aligns the two N3 inconsistencies and requests focused acceptance. Four of the five requested findings are closed; N3's original payload defect is fixed, with two bounded MINOR leftovers. No finding outside this requested scope was re-reviewed and no Accounts build approval is implied. The owning lead can copy this outcome to its checkpoint; that plan remains untouched under the read-only instruction.

| Path | SHA-256 |
|---|---|
| NeoERP-App/docs/design/specs/accounts-a0.md | 162d96549bf5bc49c22621a3c4fbb8a19eb458fee7f2b750ddafe362c93159e8 |
| docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md | 9c53f15a3511d66b9e1c29b1442b020e83444199aa37d246b72839172f3946fd |
| NeoERP-App/docs/design/screen-rig/accounts-a0.jsx | d4f5382db5c6337971bd1ff501f93d6ea2a0707b52c5b8d1846cca622fde9535 |
| NeoERP-App/docs/design/screen-rig/accounts-data.jsx | 6b7f311d4e56caeabd95ac617e1a62a924eab9a1e1654cddcb47bc7d4d1306f9 |
| NeoERP-App/docs/design/screen-rig/app.html | ba8364c82270dab3311ad1ffcb4b30adc60e238766dd21c80fefb819a99ba98a |
| docs/drafts/accounts/coa/se-bas.csv | de8cfa57f6debe0fb5363d427d9f6b787ad4c6edf6f436f982b37f42e7c51607 |
| docs/drafts/accounts/coa/_generator/se.py | cd6b4c7c0c1a8b8ca0bf60d3b16b86c7382433ba5c42181295b6f2bfd81b4ceb |
| docs/drafts/accounts/coa/_generator/lib.py | 0baecb9ee574f88b3c2ffa46c225f7ffb8cff17d03a81b9d8945a01f8d5a3936 |
| docs/drafts/accounts/coa/account-roles.md | cf92af3f23160640c509e4030201d6e9d08bb706e2d8055d6ff0e05dcf153417 |

2026-10-06 · Entry 36 focused read-only confirmation: **N3 CLOSED at design level** — separate remap capability, Change visibility, fresh reason-confirmation and pending-change Go live block verified in `accounts-a0.jsx:345`, :362, :704, :815, :867, :872; conditional ROLE_MAPPING.UPDATE and atomic 403 refusal explicit in spec :709; per-transition REMAP → GO_LIVE audits, same transaction and no replay/refusal events explicit in architecture :66. Source review only; no browser/test/build run, code changes or implementation acceptance.
