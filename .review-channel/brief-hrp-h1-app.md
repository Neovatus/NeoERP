# Brief: HRP-H1-APP — HR v2 H1 screens: directory, employee record, organisation, ESS shell (App, 2026-11-22)

**Workstream:** PROJECT-STATE HRP-2, step **H1**, App side. **Twin:** `brief-hrp-h1-be.md` (backend first; each App slice calls the BE slice of the same number).
**Repo / lane:** NeoERP-App, branch `phase/hrp-v2-h1-app` from the current App `phase/hrp-v2` head (`d91e45cd` at writing, or newer),
worktree `NeoERP-worktrees/hrp-h1-app`. Copy this file to `docs/agents/hrp-h1/brief-app.md` as the first commit.
**Starts only after (lead step):** R29b-3U and AL-REST-BE are merged to BE `phase/4` and BE `phase/4` is merged into BE `phase/hrp-v2`
(the twin's start); for this repo also AL-REST-APP merged to App `phase/4` and App `phase/4` merged into App `phase/hrp-v2` (normal merge,
never force), so `NeoApprovalSteps` is on the base. Then each App slice starts when its BE slice is **lane-ready** (contract fixed) and merges
only after that BE slice is merged (OQ-A4).
**Review tier: 2.** Why: the screens decide who sees employee personal data, national ids and bank details (masks, 30-second reveal, no
Pay tab for managers, Enter-company refusals), the second-person bank approval, and company context (employer switcher, one call per company).
Two independent seats in round 1: **Opus 5.5** (whole diff) and **Opus 5.5 security (D-43)** while Fable is paused (diff + brief only).
**Builder:** Opus 5.5 high, **new Mac**, targeted runs. A fresh Opus checks this brief first (D-51 rule 3). **Flow test before review** (D-51 rule 2):
the old Mac's tester runs the slice's simulator steps below on the merged BE slice + this slice; reviewers see the result.

## Evidence (read first)
- `docs/design/specs/hr-h1.md` §1–§9 (words, routes, demo data, directory, record, organisation, ESS, rig controls, permissions), §12.9–§12.15
  (paging, formats and touch entry, QA sizes and short heights, one-row footers, four languages, quick add), Top tasks; `ess.md` (shell, Home,
  My profile; wins over hr-h1 §7 where they differ); `building-blocks.md` (bank details 1–7, Typing dates, Numbers and money, page states);
  `list-controls.md` LC-1, LC-10; `approval-card.md`; `bottom-tab-bar-and-phone-sheet.md`; `screen-standard.md` §8–9; `ux-principles.md` §6, §21–22, §25.
- The approved rig: `docs/design/screen-rig/hr*`, `ess-shell.jsx`, `people-access.jsx` (design only; copy text from the specs, not the rig registry).
- BE contract `NeoERP-BackEnd/docs/api/hrms-v2-h1.md` (read via `git show origin/phase/hrp-v2:…`; as amended by the twin's H1-B1) §4.4, §6, §15.
- H0 as built: `docs/agents/hrp-h0/brief-app.md`, `builder-report.md`, `review-1-opus.md` (I1–I4), `review-4-sonnet.md` (LOW-2); workspace
  `.review-channel/lane-verdict-hrp-h0-app.md`. Shared pieces already built: `NeoTabs`, `NeoDateField`, `NeoPercent`, `NeoNumericInput`, `NeoMoney`,
  `NeoReasonGateDialog`, `NeoSidePanel`, `NeoSearchSelect`, `NeoMultiSelect`, `NeoSpotState`, `NeoOfflineStrip`, `NeoQuickAdd`. **Not built** on
  `d91e45cd`: `NeoApprovalCard`, `NeoBottomTabBar`, `NeoPhoneSheet` (OQ-A2).

## Decided (do not reopen)
1. v1 code is gone (H0); v2 is new code; nothing converts or works around v1. Each area's menu entry appears when it ships (§12.1).
2. **Four languages from the first slice** (§12.13): every new string in en, nb, sv, da in the same commit; no number spelled in a string
   (`NeoChangeReason.MIN_REASON_LENGTH` as a parameter). Copy from the spec keys; refusal copy from error codes, never server text.
3. **No disabled buttons the backend would refuse, no permission codes** (ux §6, H1-24): `actions.allowed=false` → the action is not drawn;
   "Only {role} can approve this." where needed. Offline keeps the disabled state with "You're offline".
4. **Money through `NeoMoney`, numbers and dates through the shared pieces, touch keyboards by platform** (§12.10, Fields and formats tables);
   national ids and local accounts never formatted as numbers; IBAN text keyboard with capitals.
5. **QA sizes** 375×667, 667×375, 874×402, 744, 1032, 1376, 1440 (+320 automated), default text and Accessibility Extra Large (§12.11).
   Short heights: only the ux §25 pinned-parts rule until the app-wide rule is decided (X.6; do not invent it here).
6. Bank details: never edited directly; WAITING until a second person approves with the known-channel tick; masked again after approval (HR-1, HR-7, HR-9).
7. Cross-company: "Also an employee at" and the ESS employer list come from IAM's links; every HR fact per employer is its own call (§12.8).

## Batching (D-51): three slices, in order, one lane branch
Each slice is its own commit set and its own **flow test + review batch + gate**: build → T1 → hand-back → old-Mac flow steps → two seats →
fixes → lane-ready → T3 → merge to App `phase/hrp-v2`. No rebase of a reviewed slice; the next slice continues on the merged head.

### Slice APP-1 — Directory, record (job), organisation (calls BE-1)
| ID | Item | Acceptance test (old FAIL / new PASS where a behaviour changes) |
|---|---|---|
| H1-A1 | Packages and build rules per OQ-A1 (H0 I3): `FeatureImportRuleTest` edited deliberately; the endpoint rule allows only the contract's v2 `/api/hr` paths listed in `NeoApiEndpoints` and still refuses `/api/payroll`. | A v1 path (`/api/hr/employees/{id}/transfer`) is refused; a v2 path passes; an unlisted `/api/hr` path is refused. |
| H1-A2 | Navigation: company **HR** group (Employees · Organisation) for the company last opened, when HRMS is on and HR read is held; Manager sees "My team"; Employee and Payroll-only see no HR group; routes `#hr:<cid>|…` (§2), DI. | `NeoMenuModelTest`, `DestinationAccessTest` rows per role (Owner, HR Manager, line manager, employee-only, Enter-company). |
| H1-A3 | Data layer for BE-1: DTOs, remote sources, repositories (employees, job, org), remote employee picker (LC-1, LC-10), `actions` → shown/hidden, fakes for page states and next-action outcomes. | Repository tests with fakes; `actions` mapping test (not allowed → not drawn); keyset Load more test. |
| H1-A4 | Employee directory (§4): desktop table, iPad list + side panel ("Open full page"), phone cards; search, multi-select filters, status dropdown (Ended hidden by default), sort, capped count, chips; all page states. | Screenshot/size tests at every QA size and Larger Text; LC-1 search order; capped count "10,000+"; manager: no Add, no Export. |
| H1-A5 | Add employee panel (§4) without sensitive fields (they come in APP-2): required fields, defaults (FTE 100, weekly hours from the company), pickers with quick add for department/position (`HR.ORG.MANAGE`), cost centre "Not found. Add it in Accounts" link rule, refusals inline. | Picker rule table test (§12.15); field component/keyboard per Fields and formats; reason and date parser tests. |
| H1-A6 | Employee record (§5): header (future-change notice with Cancel change + reason), Overview, **Job** tab timeline (Now/Upcoming, Old → New, AGA zone / province per row, phone cards with "Entered"/"Effective"), Change job panel (date rules, past-date acknowledgement, branch-fact notice, reports-to refusal, read-only pay group "Set in Payroll"). Tabs for later areas per OQ-A3. | Job-change flow test against fakes for each refusal code (§15); between-rows prefill from the covering row; manager sees no Change job. |
| H1-A7 | Organisation (§6): departments tree table (Header tag, validity dates, counts open the filtered directory), positions; add/edit side panel; deactivate with reason and "Move the 4 employees … first" with Open them; reactivate. | Refusal copy from codes; header department never offered on a job row; screenshot/size tests. |
| H1-A8 | **H0 LOWs carried:** Dashboard bounce on session refresh (Sonnet LOW-2); the two wording lines in `people.md` / `employee-link.md` Rules; mock-only HR leftovers; I1 landing rule (a person with any HR page is not employee-only; test it); I4 KDoc v1 paths rewired; Org headcount shown again from the directory count. | Old FAIL / new PASS each: session refresh keeps Dashboard; HR admin with `HR.ESS.READ` lands on Dashboard. |
| H1-A9 | Spec text: dated amendment of `hr-h1.md` §12.1 and the H0-1/H1-1 rows to OD-1 (each lane's first migration creates its own tables; Jabran 2026-11-22). | Doc skim by both seats. |

### Slice APP-2 — Pay, personal, documents, activity (calls BE-2)
| ID | Item | Acceptance test |
|---|---|---|
| H1-A10 | **Pay** tab (§5): masked block, Reveal (audited call, hides after 30 s and when the app goes to background), national id direct edit with reason (CA-14), bank change request (structured fields, country format and checksum), waiting card on `NeoApprovalCard` (OQ-A2): old masked → new via audited reveal, Approve with the known-channel tick, Reject with reason, Withdraw for the requester, Owner's own line, history; no-access and Enter-company notices; **no Pay tab for managers** (HR-8). | Reveal timer test (30 s, background); matrix of viewer × action shown (maker, approver, employee, Owner sole holder, manager, Enter-company); no value left in state after hide. |
| H1-A11 | **Personal** tab: personal fields (legal name change needs reason; date of birth masked year without the code), emergency contacts (add, edit, remove with Undo toast, max 5), Overview contact card edit (top task W1). | Manager sees work contact only (`WORK_ONLY`); undo test; size tests. |
| H1-A12 | **Documents** tab: list (name, type, added by, date; "N hidden" line for sensitive kinds), upload, download, delete with reason; "Expiry and signing come later." | Upload refusals (413, 415) copy; sensitive kinds hidden without the code. |
| H1-A13 | **Activity** tab (grouped by day, filter by kind, readable sentences through `AuditWording`, no values for sensitive edits); **Export CSV** (`HR.EMPLOYEE.EXPORT`); Add employee gains national id (type, country mask, digits keyboard per country, FI text) and date of birth with `NATIONAL_ID_TAKEN` copy. | `AuditWording` per new event; national-id field keyboard per country; export hidden without the code. |

### Slice APP-3 — App access, change requests, ESS shell (calls BE-3)
| ID | Item | Acceptance test |
|---|---|---|
| H1-A14 | **App access** tab (Linked / Invited / Not linked, Give app access reusing the access sheet, "Also an employee at …" only where returned, degraded line); People "link employee" back on v2 calls; `#employee:<cid>|<EMP-id>` opens this tab; "Give app access after saving" in Add employee. | Old FAIL / new PASS: People link employee was hidden in H0 → works; degraded `otherEmployments` shows the record without the row. |
| H1-A15 | ESS change requests on the HR record (address, tax residence, legal name: `HR.CHANGE_REQUEST.DECIDE`; bank: `HR.PAY_DETAILS.APPROVE` with reveal and tick). | Decider = employee or submitter: no buttons (AC-6); stale version copy. |
| H1-A16 | Design system: `NeoBottomTabBar` and `NeoPhoneSheet` from their contract with the §12.17 UX-1 amendment written first (PS-4, BT-4: footers give way to the keyboard). | Component screenshot tests at 375×667, 667×375, 874×402, Larger Text. |
| H1-A17 | **ESS shell** (`ess.md`, hr-h1 §7): employer header and switcher (two or more links; remembered per device; a removed one falls back), Home (greeting, My requests; other cards per OQ-A3), My profile (job read-only, contact and emergency contacts edited directly, national id masked + "Ask HR to change it", Request a change sheets; bank per BE OQ-6), ended banner, all states, desktop centred column (max 560). **Removes** the H0 "being rebuilt" empty state. | `EmployerSwitchTest`; old FAIL / new PASS: an employee-only session lands on ESS Home, not the empty state; offline disables Send with "You're offline". |

## Out of scope
Payroll screens and the salary line; Leave, Time and approvals inbox (H2/H3); onboarding wizard, End employment, re-hire, Start in another company
(H4; BE OQ-4); agreement profiles (H2); starter setup; the app-wide short-height rule; the rig re-measure of Top tasks; real e-mail/SMS notices; backend code.

## Tests (D-49)
- Per item the tests above; **per review finding** an old-FAIL/new-PASS test. Every size test (all QA sizes + Larger Text) of each touched screen.
- Before each hand-back: `jvmTest` of the touched features and of `core/` when it changed, `MissingTranslationTest`, `HardcodedUiTextTest`, the
  unused-keys check, build-rule tests; **iOS and Android compile**; `./gradlew --stop` after them. No `verify.sh` by the builder; reviewers do not re-run.

## Simulator flow steps (old Mac, before review; stack with the BE slice merged; append results to `.review-channel/test-ledger.md`)
**Before:** Jabran has done the local `.env` HR/PAYROLL DB + FLYWAY passwords step (never printed), `scripts/hr-payroll-db-roles.sh`, restart,
`scripts/hr-v1-dev-clear.sh` (with its confirm variable), `scripts/seed-demo-hr.sh`. Users from `NeoERP-BackEnd/docs/local-demo-data.md` (passwords never
in a report): **ayesha.khan** (Owner, Lahore Textiles), **bilal.ahmed** (HR Manager, second `PAY_DETAILS.APPROVE` holder per BE seed), the seeded
**line manager** and **employee-only** logins (BE H1-B9), **ola.nordmann** (Owner, Kystgruppe Nordic, app language nb), **erik.sand** (Neovatus read-only).
Devices: iPad Pro 13 (1376 landscape, 1032 portrait), iPhone SE 3rd gen (375×667 and 667×375), iPhone 17 Pro (874×402 landscape), iPad mini (744), desktop JVM 1440.
**APP-1** (iPad Pro 13 landscape, ayesha.khan unless named):
1. Menu → HR → Employees. Expected: list + side panel; count matches the seed; Ended hidden; no permission code anywhere.
2. Search "Rashid", open him. Expected: record in the side panel; "Changes 1 …" tag; future-change notice with View and Cancel change.
3. Change job: today, new department, reason → Save. Expected: Job tab has a "Now" row showing only the changed field Old → New.
4. Change job with a past date. Expected: past-date warning needs acknowledging; saved; Activity later shows it (APP-2).
5. Change job: Reports to = one of his reports. Expected: the fixed refusal line; nothing saved.
6. In the department picker type "QA Lab" → Add "QA Lab". Expected: created and picked; Organisation shows it, valid from today, no Header tag.
7. Organisation → Departments → Weaving → Deactivate. Expected: "Move the 4 employees in Weaving first" with Open them → filtered directory.
8. Add employee with the required fields → Save. Expected: in the list; Add panel fields match Fields and formats (number keyboard with Done for FTE/hours).
9. iPhone SE, line manager: HR → My team. Expected: only the team; no Add, no Export; another record "Not in your team"; no Pay tab.
10. iPhone SE, employee-only login. Expected: still the "being rebuilt" page; no HR group.
11. erik.sand, Enter company Lahore Textiles. Expected: read-only; no Add employee, no Change job.
12. iPhone 17 Pro landscape, ola.nordmann (nb): open the employee with the zone move. Expected: Norwegian text throughout; the job row shows the AGA zone change (zone 1 → zone 4); one-row footer.
**APP-2** (ayesha.khan, then bilal.ahmed):
1. Record → Pay → Request bank change (IBAN, reason) → Send. Expected: waiting card; ayesha sees no Approve, one line "Only … can approve this."
2. Sign in as bilal.ahmed → same record → Reveal new account. Expected: full value, hides after 30 s; Approve needs the tick; after approve masked again, history row.
3. Reveal national id. Expected: visible, hides after 30 s and when the app goes to background.
4. Personal → add an emergency contact, remove it → Undo. Expected: restored; a sixth contact is refused with copy.
5. Documents → upload a PDF, then a .txt renamed .pdf. Expected: first listed; second refused with the type copy. Delete needs a reason.
6. Activity. Expected: sentences with reason and before/after for job and personal; sensitive edits name fields only.
7. Export CSV. Expected: file has no national id, bank, date of birth or private contact column.
8. Line manager on the same employee. Expected: no Pay tab; Personal shows work contact only. erik.sand: Pay shows the Neovatus notice.
**APP-3** (iPhone SE portrait and landscape for ESS):
1. Employee-only login. Expected: ESS Home with greeting and My requests; the "being rebuilt" page is gone; Pay/Leave/Time per OQ-A3.
2. My profile → edit private phone → Save. Expected: saved at once (no sign-in step); Activity on the HR side shows it.
3. Request an address change → Send. Expected: "Waiting for HR" in My requests with Withdraw.
4. Request a bank change. Expected: per BE OQ-6 (fail closed: the sign-in-again message; nothing sent).
5. ayesha.khan → that employee's record. Expected: the address request card; Approve → the employee's My requests reads Approved.
6. ayesha.khan → App access tab of a linked employee. Expected: Linked with Open in People; "Also an employee at" only for companies where ayesha has HR read.
7. People → a person without a link → Link to employee. Expected: works on v2 (hidden since H0).
8. The two-employer login (BE seed). Expected: employer switcher sheet lists both; the choice survives an app restart.

## Docs (part of done; lane-ready lists each page or "none: reason")
- User guide (new, with `tools/shots.json` entries and screenshots): `docs/user-guide/hr/employees.md`, `employee-record.md`, `organisation.md` (APP-1/2),
  `docs/user-guide/self-service/my-profile.md` (APP-3); `glossary.md` (Employee, Position, Reports to, Job change, Ended, Pay details, Change request);
  `decisions.md`; `people-access/employee-link.md` (APP-3).
- Developer: `docs/modules/hr/` (directory, record, organisation, data layer), `docs/modules/ess/shell.md`, `APP-DOCUMENTATION.md`, `docs/modules/iam-people-roles/people.md`.

## Rules
- Never `--no-verify`, no force push. Push only this lane branch when a slice is lane-ready; no merge or rebase unless the lead rings.
- No AI attribution: no Co-Authored-By, no "Generated with", in commits, PRs or comments.
- Never open, print or grep `.env`, `infra/.env`, `.local-secrets/*`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys.
- One repo per builder: NeoERP-App only (read the BE contract with `git show`, never edit it).
- Gradle only via the workspace `scripts/gradle-job.sh app <dir> <args>`; log to a file, one watcher; never `gradlew --stop` outside your slot.
- Stop and ask: a screen needs a call the BE slice does not offer; a shared component change would alter Accounts screens; a copy rule unclear.

## Self-check, reviews, report
Self-check (L36) in `docs/agents/hrp-h1/builder-report-app-<slice>.md`, one row per H1-A item (proof: test, file:line, screenshot). Reviews per slice:
`docs/agents/hrp-h1/review-app<slice>-1-opus.md`, `review-app<slice>-2-opus-sec.md` (gate format; after a FIX only the asking seat re-checks).
Lane-ready `.review-channel/lane-ready-hrp-h1-app<slice>.md` with the MEASURE-1 timeline block and the flow-step results. Hand-back ≤ 10 lines.
**Done when** (per slice): items proven, tests 0 failed, iOS + Android compile, flow steps PASS, both seats ACCEPT, docs listed, T3 green, merged.

## Open questions for the lead (options · recommendation)
- **OQ-A1 — DECIDED (a), D-59.** Package names (H0 I3).** (a) Reuse `features.hr` / `features.ess` and rewrite the rule to refuse the v1 class names and paths;
  (b) new packages (`features.hrv2`). **Rec (a):** clean names last; the rule keeps its purpose (no v1 resurrection) by naming v1 symbols.
- **OQ-A2 — DECIDED (a), D-59.** Missing components.** (a) Build `NeoApprovalCard` (APP-2) and `NeoBottomTabBar`/`NeoPhoneSheet` (APP-3) with their first consumer,
  UX-1 amendment first; (b) a separate design-system lane before H1. **Rec (a):** a component proven by a real screen; one review instead of two.
- **OQ-A3 — DECIDED (a) by Jabran 2026-11-22, D-59.** Entries for later areas (product scope, Jabran).** (a) Hide record tabs Time/Leave and ESS tabs Pay/Leave/Time and Home cards (payslip,
  leave, clock) until their slice ships; (b) show "comes later" placeholders. **Rec (a):** §12.1 "each area's entry appears when it ships"; no dead taps.
- **OQ-A4 — DECIDED (a), D-59.** Start timing.** (a) Each App slice starts at its BE slice's lane-ready (contract frozen), flow-tests after that BE slice merges;
  (b) wait for the BE merge. **Rec (a):** overlaps build with BE review/gate; merge order still BE first.
