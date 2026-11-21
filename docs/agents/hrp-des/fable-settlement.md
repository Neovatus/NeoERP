# HRP-DES change list: decision settlement

Reviewer: Fable 5.2 (high), decision settlement
Reviewed: 88d9c3b01e40910f056f41126532097b6e23f614 (`docs/drafts/hr-payroll-design-refresh.md`, branch `phase/4-b2-hrp-des`)

**Summary.** 36 non-critical items: **23 settled, 12 settled with change, 1 to Jabran** (PY.10). 24 critical items and 13 decisions: a view on each; I disagree with one recommendation (decision 6a, the amount basis) and ask for a change on five (X.3, H1.2, decisions 3, 5 and 13a). Sources were checked by me in the specs, the UX-1 worktree, both code repos and the workspace docs. The two review files in this folder were not read.

How to read it: "Settled" means the recommendation stands as written. "Settled with change" means it stands with the change in the note, which the lead applies. "To Jabran" means it is not mine to settle.

## What Jabran should see first

1. **Decision 1 reverses "data is kept".** On 2026-10-09 the rule was "v2 replaces v1 … Data is kept" (`docs/handover/erp-lead-decisions.md:115`; lead review D2 "Clear dev data" was withdrawn that day, `HR-PAYROLL-LEAD-REVIEW.md:151, :566`). The list names the scope line (PY.1) but not this rule. I agree with dropping the data; it needs an explicit yes.
2. **The build cannot start on this list alone.** X.2 needs the shared binder and the four flag functions (ADR-026 R1). They are not built (no `TenantTransactionBinder`, no `ROW LEVEL SECURITY` anywhere in BackEnd), ADR-026 is not accepted, and its Q1 puts Accounts R1–R3 before HR/Payroll. The first H0/P0 migration waits for acceptance and at least R1.
3. **Batch F is not approved.** The four gate specs carry amendments dated 2026-10-22, one day after the design gate, committed as "Drafts only" (App `5b29c760`): the top-task tables, the Post confirm, the Find-employee filter and the Sweden sick-pay protection card. I find no approval. PY.10 and one "Not changed, checked" bullet rest on that card.
4. **Decision 6a:** I would not measure pay-run bands on net pay (view below).
5. **Decision 13a:** the file does not show that the "keep quick add" line is the stale one (view below).

## Labels

| Item | Label in the list | My view |
|---|---|---|
| PY.10 | non-critical | Should be critical: it closes a blocker on a statutory calculation (Swedish sick pay) on the strength of an unapproved draft. |
| X.12 | non-critical | Right once the RT-7 sentence is taken out; that sentence set build order for a large, vendor-dependent step. |
| H4.4 | non-critical | The O5 half is. The O1 half is decision 13a and waits for it. |
| X.11 | non-critical | Fine. It replaces a line of an approved out-of-scope list, but on Jabran's own later rule. |
| X.6 | non-critical | Fine, but it is an app-wide layout rule, not an HR one (note below). |
| H23.8 | critical | Cautious. It is a text fix to match G-6 and could have been settled; no harm in Jabran reading it. |

All other labels are right.

## Non-critical items

| Id | Verdict | Note |
|---|---|---|
| X.5 | Settled with change | The rig has no Larger Text and no keyboard (ux §25 "How it is checked"). So the rig tables are redone at the D-8 sizes at default text only: "above the fold" at 375×667, pinned height at 667×375 and 874×402. At accessibility sizes the check is UX-1's (nothing cut, one-row footer, main action reachable), done in the checkpoint's screenshot tests and on a simulator, not in the spec tables. 320 stays with the automated size tests. The Tab/Enter pass is redone where a hardware keyboard is used (1440 and 1032). |
| X.6 | Settled with change | The rule is right, but it is not in UX-1: §25 only says what stays pinned, and screen-standard §9 still switches panels and sheets on width (600). Written only in hr-h1 it would make HR behave differently from Accounts on the same phone, and it cannot be built in the shared `NeoSidePanel` and `NeoPhoneSheet` for HR alone. Change: one app-wide sentence in screen-standard through a lead decision (next D-n): once the D-7 trigger fires, panels, sheets and list-plus-panel layouts take their phone form (the one used below 600), whatever the width; PS-7 is amended with it. The HR/Payroll specs point to that rule. Until it is decided they apply only UX-1's pinned-parts rules. |
| X.7 | Settled with change | (b) A digits keyboard only where the country's format is digits only, for local bank accounts as for ids; the country pack says which, text otherwise. The mask adds the separators (SE, DK, IS, PK), since the number pad has none. Time: digits work on the number pad (TF-2 accepts 815, 0815, 8.15); a 12-hour (US) company gets an AM/PM choice beside the field, never typed letters. The rest as written. |
| X.8 | Settled | D-3 and D-10 checked; D-10 is a trial Jabran confirmed. |
| X.9 | Settled | ux §6 and AC-5/AC-6 say the same. PY.4 rewrites §6.3 anyway; the line in words stays. |
| X.10 | Settled with change | Approval card: at accessibility sizes the labels wrap to two lines first (ux §25); the two buttons stack only if they still do not fit. This extends D-6 from dialogs to cards, so the amendment to approval-card §7 ("never stacked") says so and is limited to that case. BT-4 ("footer sits on the keyboard") gets the same amendment as PS-4. `NeoTabs` and `NeoWizardStepper` are already built, so their amendments are also code rows in the checkpoint. |
| X.11 | Settled | Replaces "Translations (English first)" in hr-h2-h3 §24 on Jabran's rule of 2026-11-08 (`docs/backlog.md:312`). Payslip, tax and leave terms use the official terms and fall under the native review gate L-7. |
| X.12 | Settled with change | Write it as "when ADR-025 is accepted"; nothing in the specs changes before that. Take out "RT-7 is a dependency of the ESS approvals slice". In-app notices (L-9, approved) are the baseline; whether phone push must exist before ESS approvals ship is decided with ADR-025's open questions (Apple and Firebase accounts, store review), by Jabran, not in this list. |
| X.14 | Settled with change | The script is not on this Mac (`/tmp/hrp-c12-check` does not exist). Do not wait for the rig: the four paragraphs are amended anyway (X.5 changes their size list), so add the dated line now: "not re-runnable, the script was not kept in a repo". A new check script lives in `NeoERP-App/docs/design/reviews/`. |
| X.15 | Settled | `NeoPercent`, `NeoNumericInput`, `NeoDateField`, `NeoMoney` exist. If no shared format for a number with a unit ("7,5 h", "5 days") exists, it is added once beside `NeoPercent` in the design-system checkpoint. |
| X.17 | Settled with change | Two additions. A quick-added department is valid from the company's today and is never a header node, as for dimension values (follows H1.4). The "Add it in Accounts" link shows only when the company has Accounts and the viewer holds the Accounts right; otherwise the plain "Nothing matches". |
| H1.6 | Settled | Follows X.6 as changed. |
| H1.8 | Settled | Matches ux §25's may-cut and never-cut lists. |
| H1.9 | Settled | Follows X.7 as changed. |
| H1.10 | Settled with change | The same fix in every place, not only `hr-h1.md:167, :236`: `ess.md:142`, the string keys in hr-h4 (`:612, :766, :785`) and hr-h2-h3 (`:1150, :1202, :1219, :1292, :1342, :1358`). Strings take the number as a parameter (as `core_error_reason_required` does) or reuse the shared reason-gate hint; no HR string spells "6". The Owner / Company Owner line: one line, as written. |
| H23.3 | Settled | Matches ux §25 and TG-11. |
| H23.4 | Settled with change | The choice covers hours too: Add / Remove with the leave type's unit (days or hours). |
| H23.5 | Settled | With the X.15 note on the unit format. |
| H23.6 | Settled | D-2, confirmed by Jabran. |
| H23.7 | Settled | The folder holds only a README. |
| H23.9 | Settled | The rig route keeps `sthlm` as an example. |
| H4.2 | Settled | Q17 is decided (`hrms-v2-h1.md:4`, H1-22). The rest of `hr-h4.md:8-10` (when v1 calls go) is rewritten under H1.2, which is critical. |
| H4.3 | Settled | "Add now, finish later" is a further action, so it folds first under D-10's order. |
| H4.4 | Settled with change | Rewrite the O5 row now ("Show, dates only", H4-25). The O1 row and the O1 lead-decision line wait for decision 13a. |
| H4.5 | Settled | — |
| H4.6 | Settled | — |
| PY.8 | Settled | — |
| PY.9 | Settled | ST-8 already gives the compact bar whenever seven chips do not fit (below about 980 pt), so on iPad portrait and a phone in landscape too; H4.6's rule applies to it. |
| PY.10 | To Jabran | Not settled as written. The card was added in batch F on 2026-10-22, after the gate, as a draft, and the gate summary still names the missing screen as a blocker for Swedish sick pay (`design-gate-final.md:21`). The row guards a statutory calculation. It stays open until the card and its fact source (the decision document, H2 contract §7.11g) are approved; then it is closed with the pointer. The "Not changed, checked" bullet saying HR no longer blocks the Swedish path is corrected the same way. |
| ES.2 | Settled | The file and App commit `c270ce7e` record both approvals. |
| ES.3 | Settled with change | As X.5: re-measure at 375×667 (and pinned height at 667×375) at default text; the accessibility-size check is done in the build, not in the table. |
| ES.4 | Settled | — |
| ES.5 | Settled | Follows X.6 as changed. |
| ES.6 | Settled | Follows X.7 as changed. |
| PA.1 | Settled | The reference is the H1 contract §10.2 (link payload, `employments[]`, the app-access read). |
| PA.2 | Settled with change | The spec word becomes "position". The built People API and the link push still say `designation` and `designationName` (user-service `PeopleDtos`, `EmployeeLinkPushRequest`; the App people feature). They change with the IAM additions of CP-H1.6 (`positionName`), a cross-repo contract change on a risk path, backend first. Until then the spec notes the name on the wire. |

## Critical items

| Id | View |
|---|---|
| X.1 | Agree. It reverses "data is kept" (2026-10-09), so it needs Jabran's explicit yes. The amendment should also say what happens to what other services hold from v1 HR: IAM's `employee_links` with the Employee-role memberships made from them, and audit-service workflow items; in dev, cleared and seeded again. |
| X.2 | Agree. R1 (binder and flag functions) is not built and ADR-026 is not accepted; say that H0/P0's first migration waits for both, and whether it also waits for Accounts R2–R3 as ADR-026 Q1's order implies. My view: R1 is enough, since it is shared code. |
| X.3 | Agree, with one change: (b) follows `risk-paths.txt` and the risk script (L16), not "every HR/Payroll lane". With (a) that covers payroll-service whole and HR's sensitive paths; plain UI and wording lanes keep one review, as WORKFLOW says. |
| X.4 | Agree. It is L24 applied; no new decision. |
| X.13 | Agree. ADR-024 D4 already puts F4 and F5 in the HR rebuild, and the optional-tenant filter is an isolation fault as well, so critical is right. |
| X.16 | Agree. |
| H1.1 | Agree; follows X.1. |
| H1.2 | Agree that v1 stops at once, with a change. On the backend the v1 code (controllers, entities, repositories, jobs, gateway routes) goes in the same lane as the table drop, not slice by slice: R4 allows no baseline entries (hr has 59 and payroll 39 lines from v1 repositories), and code on dropped tables only fails. In the App, hide and then delete per slice, covering routes and the employee-only sign-in (ESS is their whole app), not only the menu. It also amends the 2026-10-09 rule that each old screen and call is deleted in the checkpoint that builds its replacement (`design-principles.md:10`). |
| H1.3 | Agree on both. `BankDetailsCrypto` already has what H1-13 asks for (AES-256-GCM with key ids, associated data bound to the company and row, HMAC fingerprints for the blind index). Move it as an extraction with no change in behaviour (old Accounts ciphertexts must still open, proven by a test); shared code, separate keys per service. |
| H1.4 | Agree. ADR-021 is accepted and the gap check dates both fixes "before H1 build". |
| H1.5 | Agree. The H1 contract §10.2 already takes the switcher's code and position from IAM's link projection (`employments[]` on `/api/users/me`), so no HR read crosses companies there; the per-company rule covers anything beyond it. This answers the list's "not verified" line. |
| H1.7 | See decision 13a. |
| H23.1 | Agree. The opening-balance entry must carry the statutory and policy split like an Earned entry, or the expiry and pay-out rules cannot be applied to it. |
| H23.2 | See decision 5. |
| H23.8 | Agree; text only. |
| H4.1 | Agree; follows X.1. |
| PY.1 | See decision 3. |
| PY.2 | See decision 4. |
| PY.3 | Agree; see decision 7. |
| PY.4 | See decision 6. |
| PY.5 | Agree. The module is built, and ADR-020's later copy job is avoided. |
| PY.6 | Agree. Naming the dependency changes nothing for P0 and P1. |
| PY.7 | Agree; the label is right, since a wrong sign pays or recovers the wrong amount. |
| ES.1 | Agree. An in-app notice warns nobody when the account itself is taken over, so the gate has to be the e-mail to the address on file. Until then the second approver with the known-channel tick is the control. |

## Decisions for Jabran

| # | View |
|---|---|
| 1 | Agree: yes. It needs two things said with it: it reverses "data is kept" (2026-10-09), and the build needs ADR-026 accepted (D1 and D9, and D3 to D6, which X.2 relies on) and R1 built before the first migration. |
| 2 | Agree, with the H1.2 change: backend v1 code goes with the tables; the App hides v1 and gives employee-only users a plain "being rebuilt" state. The App change is small and I would confirm it. |
| 3 | Agree. One gap: without the interim calculator, P0 has nothing that produces a Calculated run. The amended scope should say that P0's state machine, four eyes and idempotency are proven with a test-only fixture calculator that never ships; P1's engine is the first real one. |
| 4 | Jabran's call, and the list frames it fairly. My view: the design is already per country (P1-7 and P1-32 readiness per country release, G-8, G-9, sold by module), so only J-8's "all six" ties the launch to the slowest country. I would let Payroll launch per country and take option (a), after checking that P6 (Sweden) does not lean on P5 (Norway) pieces, since Sweden was planned to reuse Norway's shape. Not (b). |
| 5 | Agree with the shared model, relation steps and stand-ins from H2. Two changes. Company-set chains sit behind the existing `APPROVAL_CHAINS` switch (off gives the one-step Standard, which is the approved H2 design), with the HR policy screen as its own named slice so H2 does not grow. And in v2 every HR kind has one band: when an encashment is approved, HR knows days, not the amount (H0-17, Payroll calculates amounts). |
| 6 | (a) Disagree. Net pay falls when deductions go to payees while the same money still leaves the company, so the mix of deductions could move a run into a lower band. I would use the run's total cost (gross pay plus employer contributions): it is the debit total of the PR journal, which matches AL-D4's basis for journals, and deductions cannot lower it. (b) Agree. In practice Owner's own can only exist on a one-step band: every step needs a holder of `PAYROLL.RUN.APPROVE`, and the L-1 condition says nobody else holds it, so a multi-step band there is a stuck item (AL-D19) that the Limits screen must warn about. Two-person limit changes also need a payroll confirm code, as Accounts has. |
| 7 | Agree. A5 is an approved Accounts contract, so the amendment goes through the Accounts lead; `AccountsPostingV2` is not built yet, so this is the cheap moment. |
| 8 | Agree; see H1.3 for how the cipher should move. |
| 9 | Agree, with the X.3 change to (b). |
| 10 | Agree. |
| 11 | Agree. |
| 12 | Agree. |
| 13 | (a) Agree for the time before H4: the quick-add panel stays. For the end state the file does not show which text is the decided one: `hr-h4.md:88`, the lead-decision line (:496) and the O1 row (:509) all arrived in one commit (App `a09fc826`), and for O5 it was the lead-decision line that won over the table. So the O1 line should not be deleted as "stale"; Jabran chooses. My view: the wizard replaces the panel when H4 ships (one way to add an employee, ux §1; "Add now, finish later" is as quick). (b) Agree; text only. |

## Smaller corrections to the list

- The opening says six specs were approved at the design gate of 2026-10-21. Four were (hr-h1, payroll-p, hr-h2-h3, hr-h4). ess was approved on 2026-10-29 and 2026-10-30, people-access on 2026-10-03 with its design pass on 2026-10-29.
- "Not verified", third bullet (what IAM's employee links hold): the H1 contract §10.2 and user-service `EmployeeLinkPushRequest` answer it: company, employee code, position name (today `designationName`), branch and employment status.
- "Not changed, checked", last bullet (Sweden sick-pay protection): not checked in the sense the list means; see PY.10.

## Not checked by me

- The rig was not opened; layout verdicts rest on the spec text and the UX-1 rules.
- The Nordic contracts P5–P9 were read only for status and order; whether P6 depends on P5 pieces is a question for decision 4, not an answer.
- Whether the old Mac still has the rig check script.

## Additions 14–17 (2026-11-21)

Reviewed: aeec96c5f0daea49deb19d6f11056b7e93ab212a (range `985c5bf..aeec96c`: decisions 14–17, items X.18, H23.10–H23.15, PY.11–PY.13, ES.7).

**Summary.** 4 decisions: agree with change on all four, no disagreement on direction. 11 items, all labelled critical, so Jabran decides them through decisions 14–17; my verdict is on each item's text: **1 settled, 10 settled with change, 0 to Jabran** on its own. Checked in the specs, the H3 contract, ADR-021, RULES, the Inventory scope on `phase/4-b2-inv-scope` and, for the country rules, on official pages (listed at the end). Country facts stay "to verify" with each practitioner (J-8); the web check only caught what is plainly wrong.

**Three things for Jabran first.**

1. **Sweden's general sick-pay refund no longer exists.** "Ersättning för höga sjuklönekostnader" was repealed from 1 July 2024. PY.13 and decision 15 name "SE high-cost protection" as a refund to claim. What is left in Sweden is the special high-risk protection for a named employee, the same thing as the unapproved sick-pay protection card (PY.10).
2. **Two new modes let one person write pay-relevant times for many people.** Today a typed time enters only through a correction that somebody else approves (§15.2, H0-11). The supervisor sheet and the file import skip that. Decision 14 needs a second person in both.
3. **No rule says which mode pays.** Clock, sheet and device give clock pairs; a project timesheet gives hours and no pairs. With two modes on for one person, hours can be counted twice. One rule is missing: one source of worked hours per person per day.

### Decisions 14–17

| # | View |
|---|---|
| 14 | **Agree with change.** The four modes are the right set and "later" is right for kiosk, geofence, offline queue and direct device links (each needs its own security or privacy design). Changes: (1) one source of worked hours per person per day, set per branch with an override per pay basis; the project timesheet is either that source or only a split of hours recorded another way, and the spec says which. (2) A sheet or an import is one item approved by someone other than the person who recorded it (Standard, shared model); nobody records their own row; an import keeps the file's hash, row count and "Imported by". (3) Build order inside v2: supervisor sheet with the H3 base; project timesheets and device import as their own slices after it; the pay split (PY.11) only after the plain P2 posting passes the money invariants. (4) Sizes are light: the whole of 14 is more than L, and PY.11 is L, not M. |
| 15 | **Agree with change.** Both halves belong in each country's slice. Corrections: Sweden as above (special high-risk protection only; the employee applies, the employer claims in Försäkringskassan's e-service within 12 months of the month the sick pay was paid). Pakistan: PESSI/SESSI sickness benefit looks like a benefit the institution pays to the worker, not a refund to the employer; leave it out of the worksheet until the practitioner confirms. "Carry sanctions" is not confirmed: Norway's plan within 4 weeks and dialogue meeting within 7 weeks are legal duties, and I found no fine tied to them, only the Labour Inspection's general orders; write "legal duties with dates". A case can have more than one deadline (Denmark: report the absence, then ask for the refund), and Norway has a bill pending that changes its refund deadline, so deadlines are pack rows with source and check state, never constants. Follow-up tasks are health data: they show only to people who may already see the sick report, not on the general statutory-task panel. |
| 16 | **Agree with change**, option (a). Sweden shows why: the law sets working-time limits but no overtime pay rate, so without profiles Swedish overtime cannot be priced at all. Changes: one profile with one code and one set of validity dates, HR owning its structure and Payroll its rates; a category with no rate stops the calculation for that employee with fixed copy, it is never priced at zero; time-of-day windows need start and end times, so they do not work on duration-only project timesheets (say so, with decision 14). The label reason is "payroll money and approved scope"; a collective agreement is not statute. H23.14 and PY.12 together are L. |
| 17 | **Agree with change**, option (a). Changes: (1) the type never reaches entitlement, billing or permissions (RULES §2, no plan field); a build rule lets only setup code read it, since "no code branches on it" must be a check, not a promise. (2) Enrollment is done by Super Admin (RULES §1) and branches are created by Super Admin (§6), so say who picks the type and that changing it later changes nothing already set up. (3) One type does not fit a business that does two things: each module's setup shows its starter sets with the type's set preselected, and the person may pick another, several or none. (4) Starter sets are versioned, pack-like data per country and type, copied only into an empty setup, and hold names and structure only: no rates, thresholds or extra-leave figures. Figures come from the country pack or the company; otherwise unverified agreement content ships by the back door (decision 16's option (c), which the list defers). (5) HR v2 does not wait for Org: Org has no business-type field today (`org.md`, org-service), so HR and Payroll setup offer the sets themselves and the preselection arrives with the Org change. |

### New items

| Id | Verdict | Note |
|---|---|---|
| X.18 | Settled with change | As decision 17, points 1 to 5. In the HR and Payroll list, "leave policy extras" and "agreement-profile examples" carry no figures. Inventory's draft has sets "chosen at setup" (`items-inventory-scope.md:91`); it does not read an enrollment type yet, so "read it" is the plan, not the state. |
| H23.10 | Settled with change | "Each mode feeds the same clock pairs" is not true for project timesheets, which give hours only. Add the one-source rule (decision 14, change 1). The H3 contract already has `clock_events.channel` and `time_basis`; the new sources add values to both (typed, device clock), so every record says how its time was got. A mode is a setting, never an entitlement. |
| H23.11 | Settled with change | Nobody records their own row; the sheet is one approval item decided by someone else, or the Owner's own rule in a one-person shop; the times are stored as typed, not server time, and the spec names that exception as it does for the device import. |
| H23.12 | Settled with change | (1) Say whether the timesheet is the source of paid hours or a split (per branch or pay basis); a split must not exceed the day's worked hours. (2) Accounts holds the project list until a Projects module exists (ADR-021 Q3), so a company without Accounts has no projects to pick: state that project timesheets need Accounts, or what an HR-only company gets. (3) "A named person or role per project" cannot be expressed in the approval model without the project-manager relation; in v2 the approver is the line manager or the company's policy steps. (4) Rest-period checks need start and end times; in this mode they show "not checked". |
| H23.13 | Settled with change | (1) Accept the device's own log file as a preset (`*_attlog.dat` or `ATTLOG.TXT`, tab-separated: user number, time, state), not only Excel or CSV made by the device software; the raw file is the common export and harder to edit. (2) Device times are wall-clock times in the branch's zone; rows in a daylight-saving gap or overlap are flagged. (3) The pairing rule is in the contract: many devices record no reliable in or out state, and night shifts cross midnight, so pairs follow the rostered shift. (4) Its own permission code, the second person and the file hash as in decision 14. "No biometric data received or stored" is right and is what keeps this outside GDPR article 9. |
| H23.14 | Settled with change | As decision 16: one profile identity across HR and Payroll; windows need start and end times; thresholds checked against the pack on save. |
| H23.15 | Settled with change | Tasks follow the sick report's visibility (`HR.LEAVE.HEALTH.READ`, or the manager who may record sick leave for the team), not `HR.EMPLOYEE.READ`; never on the team calendar. Norway's meeting at 7 weeks is mandatory for a fully sick-listed person and on need otherwise, so the task comes from a pack row with a condition. Drop "carry sanctions". |
| PY.11 | Settled with change | Size L. Its own slice after the base P2 posting. The contract names: which elements split (earnings and employer cost; deductions, net and payables stay as P2-9 says), which hours count (approved worked hours; absence pay goes to the job's default), the remainder line, and which wins when the job row also has a percentage split (gap check D5). The invariant in the item is right. |
| PY.12 | Settled with change | A missing rate stops that employee's calculation; never zero. Rates join the profile by its code and dates. |
| PY.13 | Settled with change | Sweden: special high-risk protection only, 12-month claim window, tied to the protection card (PY.10). Pakistan out until verified. More than one deadline per case; deadlines are pack rows. Refunds posted as a receivable need new posting roles, so an A5 and P2 amendment and the accountant's sign-off (X.3 g), including when the receivable is recognised. |
| ES.7 | Settled | Follows H23.10 and H23.12 as changed. On a phone the week uses `NeoTimeGrid`'s phone form (TG-11), not a new layout. |

### Labels

All eleven are rightly critical. Two reasons are loose rather than wrong: decision 16 says "statutory" where it means payroll money and approved scope; ES.7's layout is non-critical in itself, but its scope hangs on decision 14.

### Effect on my earlier view of decision 4

The common brief now says there is no single first country and no pilot customer; Pakistan and the Nordics come first together (`docs/agents/design-brief-common.md`, master `3cdc3de`). That removes "the first customer is Swedish", which PY.2 and my view leaned on. I would now keep D1's order as it is (option c) and still let each country go ready on its own. The list's PY.2 and decision 4 should cite the new rule.

### Web sources for the country rules

- Sweden, repeal of the general refund: [regeringen.se, 2024-03](https://regeringen.se/pressmeddelanden/2024/03/ersattningen-for-hoga-sjuklonekostnader-upphavs/)
- Sweden, special high-risk protection and the employer's 12-month claim: [forsakringskassan.se](https://www.forsakringskassan.se/arbetsgivare/ersattningar-och-bidrag/sjuk-ofta-eller-lange---sarskilt-hogriskskydd)
- Norway, employer period, inntektsmelding, three months back: [nav.no, after the employer period](https://www.nav.no/arbeidsgiver/sykepenger-etter-arbeidsgiverperioden), [nav.no, inntektsmelding](https://www.nav.no/arbeidsgiver/inntektsmelding); pending change: [Prop. 11 L (2026–2027)](https://www.regjeringen.no/no/dokumenter/prop.-11-l-20262027/id3192279/?ch=3)
- Norway, plan within 4 weeks and meeting within 7 weeks: [nav.no, follow-up](https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte), [Helsedirektoratet](https://www.helsedirektoratet.no/veiledere/sykmelderveileder/sykmelders-rolle-i-sykmeldingsperioden-oppfolgingsplan-aktivitetskravet-og-dialogmoter/oppfolgingsplan-innen-4-uker)
- Denmark, report within 5 weeks, refund up to 3 months back, 30-day employer period: [danskerhverv.dk](https://www.danskerhverv.dk/radgivning/refusion-af-sygedagpenge/frister/), [virk.dk NemRefusion](https://virk.dk/myndigheder/stat/NemRefusion/selvbetjening/Refusion_af_sygedagpenge/for-arbejdsgivere/)
- Finland, employer claims Kela's allowance, also through the Incomes Register, two months: [kela.fi](https://www.kela.fi/sickness-quick-guide), [vero.fi](https://vero.fi/en/incomes-register/companies-and-organisations/employers/earnings-payment-data/absence-data/reimbursement-application-to-kela)
- Pakistan, social security cash benefits to secured workers: [sessi.gov.pk](https://sessi.gov.pk/cashbenefits.htm), [wageindicator.org](https://wageindicator.org/en-pk/ai/work-in-pakistan/labour-law/sick-leave/) (the two disagree on who pays)
- Device log files: [ZKTeco F18 manual](https://www.manualslib.com/manual/1343519/Zkteco-F18.html?page=74), [ZKBio Time.Net](https://www.zkteco.com/en/zktime_net/zkbio_time_net)

Not found: a Pakistan-specific source on how common fingerprint or face machines are in factories (the device formats above are the maker's, not a local survey), and the exact way Norway enforces a missing plan. The Swedish rehabilitation duties and the Icelandic rules were not checked.
