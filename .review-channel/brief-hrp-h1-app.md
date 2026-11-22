# Brief: HRP-H1-APP — HR v2 H1 screens: directory, employee record, organisation, ESS shell (App, 2026-11-22)

**Workstream:** PROJECT-STATE HRP-2, step **H1**, App side. **Twin:** `brief-hrp-h1-be.md` (backend first; each App slice calls the BE slice of the same number).
**Repo / lane:** NeoERP-App, branch `phase/hrp-v2-h1-app` from the current App `phase/hrp-v2` head (`d91e45cd` at writing, or newer),
worktree `NeoERP-worktrees/hrp-h1-app`. Copy this file to `docs/agents/hrp-h1/brief-app.md` as the first commit.
**Starts only after (lead step):** R29b-3U and AL-REST-BE are merged to BE `phase/4` and BE `phase/4` is merged into BE `phase/hrp-v2`
(the twin's start); for this repo also AL-REST-APP merged to App `phase/4` and App `phase/4` merged into App `phase/hrp-v2` (normal merge,
never force), so `NeoApprovalSteps` is on the base. Then each App slice starts when its BE slice is **lane-ready** (contract fixed) and merges
only after that BE slice is merged (D-59, OQ-A4 (a)). APP-1a and APP-1b both call BE-1b; APP-1a starts at BE-1b lane-ready, and the BE-1a contract amendment (H1-B1) must be merged first.
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

8. **D-59 (2026-11-22), all OQs as (a):** reuse `features.hr`/`features.ess` (rule refuses v1 names); build missing components with their first screen;
   hide Time/Leave/Pay tabs and cards until each area ships (Jabran); no End employment or job-change request (Jabran); ESS bank request fails closed (Jabran).
9. **Contract freeze:** shapes freeze at the BE slice's lane-ready. A later change comes as a dated note in `hrms-v2-h1.md` plus a ring from the BE
   builder; the App tests against the note.
10. **Contract points from H1-B1** the screens rely on: job-change `kind` is not sent (server derives it, BE OQ-8); list paging is `cursor`/`nextCursor`
    with `count` + `countCapped` (cap 10,000); `actions` not allowed → not drawn, `blockedBy` only feeds the "Only {role}…" line; no `end`/`requestJobChange`.

## Batching (D-51): four slices, in order, one lane branch
Each slice is its own commit set and its own **flow test + review batch + gate**: build → T1 → hand-back → old-Mac flow steps → two seats →
fixes → lane-ready → T3 → merge to App `phase/hrp-v2`. No rebase of a reviewed slice. Order: **APP-1a → APP-1b** (both on BE-1b) → **APP-2** (BE-2b) → **APP-3** (BE-3).

### Slice APP-1a — Rules, navigation, data layer, directory (calls BE-1b)
| ID | Item | Acceptance test (old FAIL / new PASS where a behaviour changes) |
|---|---|---|
| H1-A1 | Packages `features.hr` / `features.ess` (D-59); `FeatureImportRuleTest` rewritten to refuse the v1 class names and paths (H0 I3); the endpoint rule allows only the contract's v2 `/api/hr` paths in `NeoApiEndpoints`, still refuses `/api/payroll`. | A v1 path (`/employees/{id}/transfer`) refused; a v2 path passes; an unlisted `/api/hr` path refused; a v1 class name refused. |
| H1-A2 | Navigation: company **HR** group (Employees · Organisation) for the company last opened, when HRMS is on and HR read is held; Manager sees "My team"; Employee and Payroll-only see no HR group; routes `#hr:<cid>|…` (§2), DI. | `NeoMenuModelTest`, `DestinationAccessTest` rows per role (Owner, HR Manager, line manager, employee-only, Enter-company). |
| H1-A3 | Data layer for BE-1b: DTOs, remote sources, repositories (employees, job, org), remote employee picker (LC-1, LC-10), keyset paging (Decided 10), `actions` → shown/hidden, fakes for page states and next-action outcomes. | Repository tests with fakes; `actions` mapping (not allowed → not drawn); Load more with `nextCursor`; "10,000+" from `countCapped`. |
| H1-A4 | Directory (§4): desktop table, iPad list + side panel ("Open full page"), phone cards; search, multi-select filters incl. **App access** (from BE-1b `user_id` + IAM invite state), **status dropdown Active · Ended · All** (BE OQ-10; H2 adds the leave options), sort, capped count, chips, all page states. | Size tests at every QA size + Larger Text; LC-1 search order; manager: no Add, no Export. |
| H1-A8 | **H0 LOWs carried:** Dashboard bounce on session refresh (Sonnet LOW-2); the two wording lines in `people.md` / `employee-link.md` Rules; mock-only HR leftovers; I1 landing rule (any HR page → not employee-only); I4 KDoc v1 paths rewired; Org headcount shown again from the directory count. | Old FAIL / new PASS: session refresh keeps Dashboard; HR admin with `HR.ESS.READ` lands on Dashboard. |
| H1-A9 | Spec text: dated amendment of `hr-h1.md` §12.1 and the H0-1/H1-1 rows to OD-1 (each lane's first migration creates its own tables). | Doc skim by both seats. |

### Slice APP-1b — Add employee, record (job), organisation (calls BE-1b)
| ID | Item | Acceptance test |
|---|---|---|
| H1-A5 | Add employee panel (§4) without sensitive fields (APP-2): required fields, defaults (FTE 100, weekly hours), pickers with quick add for department/position (`HR.ORG.MANAGE`), cost centre "Not found. Add it in Accounts" link rule, inline refusals. | Picker rule table (§12.15); component/keyboard per Fields and formats; date parser and reason tests. |
| H1-A6 | Record (§5): header (ended banner with date and reason; future-change notice with Cancel change + reason; More → **Copy employee code**; "Start in another company" out, H4), **Overview** (job now, reports to + direct-reports count, contact, compact App access card showing state only until APP-3, Upcoming incl. **probation end and contract end** when set, BE OQ-12), **Job** tab (Now/Upcoming, Old → New, AGA zone / province per row, phone cards "Entered"/"Effective"), Change job panel: date rules; **past date always shows the plain warning and sends `acknowledgePastDate`** (no run coverage, Payroll absent); agreement profile hidden (H2); no kind field; reports-to refusal; pay group "Set in Payroll". Later tabs hidden (D-59). | Each job-change refusal code (§15) with copy; between-rows prefill; manager sees no Change job; **an ended record is read-only** (only Documents and Activity act, APP-2). |
| H1-A7 | Organisation (§6): departments tree (Header tag, validity dates, counts **"4 (19 incl. sub-departments)"** from both contract counts, open the filtered directory), positions; add/edit panel; deactivate with reason and "Move the 4 employees … first" with Open them; reactivate. | Refusal copy from codes; header department never offered on a job row; size tests. |

### Slice APP-2 — Pay, personal, documents, activity (calls BE-2b)
| ID | Item | Acceptance test |
|---|---|---|
| H1-A10 | **Pay** tab (§5): first commit the dated **UX-1 amendment of `approval-card.md`** (§12.17), then `NeoApprovalCard` with screenshot tests at 375×667, 667×375, 874×402 and Larger Text. Fields: bank account (structured), national id, **tax residence, pension provider, union (IS), holiday-pay route (DK), PK EOBI and PESSI/SESSI refs**, all masked with audited Reveal (30 s, hides on background); national id direct edit with reason (CA-14); non-bank edits per BE OQ-11; bank change request with optional document (BE OQ-9); waiting card (old masked → new via reveal, Approve with the known-channel tick, Reject with reason, Withdraw, Owner's own line), history; no-access and Enter-company notices; no Pay tab for managers (HR-8). Hire-time first bank request (ERP-27.3): H4, out. | Reveal timer (30 s, background); matrix viewer × action shown (maker, approver, employee, Owner sole holder, manager, Enter-company); no value left in state after hide. |
| H1-A11 | **Personal** tab: personal fields (legal name change needs reason; DOB masked year without the code), emergency contacts (add, edit, remove with Undo, max 5), Overview contact card edit (W1). | Manager view shows work contact only and **never calls the emergency-contacts endpoint** (403 `TEAM_SCOPE`); undo test; size tests. |
| H1-A12 | **Documents** tab: list ("N hidden" line for sensitive kinds), upload, download, delete with reason; "Expiry and signing come later." | 413/415 copy; sensitive kinds hidden without the code. |
| H1-A13 | **Activity** tab (by day, filter by kind, `AuditWording`, field names only for sensitive edits); **Export CSV**; Add employee gains national id (type, country mask, keyboard per country) and DOB with `NATIONAL_ID_TAKEN` copy. | `AuditWording` per new event; keyboard per country; export hidden without the code. |

### Slice APP-3 — App access, change requests, ESS shell (calls BE-3)
| ID | Item | Acceptance test |
|---|---|---|
| H1-A14 | **App access** tab (Linked / Invited / Not linked, Give app access via the access sheet, "Also an employee at …" only where returned, degraded line); People "link employee" back on v2; `#employee:<cid>|<EMP-id>` opens this tab; "Give app access after saving" in Add employee. | Old FAIL / new PASS: People link employee (hidden in H0) works; degraded `otherEmployments` keeps the record. |
| H1-A15 | ESS change requests on the HR record (address, tax residence, legal name: `HR.CHANGE_REQUEST.DECIDE`; bank: `PAY_DETAILS.APPROVE` with reveal and tick). | Decider = employee or submitter: no buttons (AC-6); stale version copy. |
| H1-A16 | `NeoBottomTabBar` and `NeoPhoneSheet` from their contract, UX-1 amendment written first (PS-4, BT-4). | Component tests at 375×667, 667×375, 874×402, Larger Text. |
| H1-A17 | **ESS shell** (`ess.md`, hr-h1 §7): employer header and switcher (remembered per device; removed one falls back); **tab bar Home · Me only** (D-59); Home (greeting, My requests); My profile (job read-only, contact and emergency contacts direct, national id masked + "Ask HR to change it", Request a change sheets with optional attachment per BE OQ-9); **bank request: the fixed "sign in again" copy, typed values kept, no Send retry loop** (fails closed); ended banner; states incl. **"no employee record"** and **module off**; desktop centred column (max 560). Removes the H0 "being rebuilt" page. Notifications bell: out (in-app notices later, §12.14). | `EmployerSwitchTest`; old FAIL / new PASS: employee-only lands on ESS Home; offline disables Send with "You're offline"; bank sheet shows the copy once and keeps values. |

## Out of scope
Payroll screens and salary line; Leave, Time, approvals inbox (H2/H3); wizard, End employment, re-hire, Start in another company, hire-time bank request (H4);
agreement profiles and starter setup §12.16 (H2); rig controls §8 (rig only); notifications bell; app-wide short-height rule; Top-task rig re-measure;
real e-mail/SMS notices; backend code.

## Tests (D-49)
- Per item the tests above; **per review finding** an old-FAIL/new-PASS test. Every size test (all QA sizes + Larger Text) of each touched screen.
- **Keyboard pass (§12.11):** one Tab/Enter test per Top task the slice touches, at 1440 and 1032 (find and open, change a job, add a department; APP-2/3 their rows).
- Before each hand-back: `jvmTest` of the touched features and of `core/` when it changed, `MissingTranslationTest`, `HardcodedUiTextTest`, unused-keys,
  build-rule tests; **iOS and Android compile**; daemons stopped inside your slot through `gradle-job.sh`. No `verify.sh` by the builder; reviewers do not re-run.

## Simulator flow steps (old Mac, before review; stack with the BE slice merged; append results to `.review-channel/test-ledger.md`)
**Before:** Jabran has done the local steps in the BE brief's Rules (HR/PAYROLL DB + FLYWAY passwords; from APP-2 also the hr field-cipher, blind-index and
file-store keys; values never printed), roles script, restart, v1 clear, `scripts/seed-demo-hr.sh`. Users from `NeoERP-BackEnd/docs/local-demo-data.md`
(passwords never in a report): **ayesha.khan** (Owner, Lahore Textiles), **bilal.ahmed** (HR Manager, second `PAY_DETAILS.APPROVE` holder), the seeded
**line manager**, **employee-only** and (APP-3) **two-employer** logins (BE H1-B9), **ola.nordmann** (Owner, Kystgruppe Nordic, language nb), **erik.sand** (Neovatus read-only).
Devices: iPad Pro 13 (1376 landscape, 1032 portrait), iPhone SE 3rd gen (375×667 and 667×375), iPhone 17 Pro (874×402 landscape), iPad mini (744), desktop JVM 1440.
**APP-1a** (iPad Pro 13 landscape, ayesha.khan unless named):
1. Menu → HR → Employees. Expected: list + side panel; count matches the seed; status Active by default, options Active · Ended · All; no permission code.
2. Status → Ended. Expected: the seeded ended employee only. Filter App access → Linked. Expected: the manager and employee-only logins' records.
3. iPhone SE, line manager: HR → My team. Expected: only the team; no Add, no Export. Employee-only login: still the "being rebuilt" page, no HR group.
4. erik.sand, Enter company Lahore Textiles. Expected: directory read-only; no Add employee.
**APP-1b** (iPad Pro 13 landscape, ayesha.khan unless named):
1. Search "Rashid", open him. Expected: side panel record; "Changes 1 …" tag; future-change notice with View and Cancel change.
2. Change job: today, new department, reason → Save. Expected: Job tab "Now" row showing only the changed field Old → New; no kind field shown.
3. Change job with a past date. Expected: the plain past-date warning must be acknowledged; saved.
4. Change job: Reports to = one of his reports. Expected: the fixed refusal line; nothing saved.
5. Department picker: type "QA Lab" → Add "QA Lab". Expected: created and picked; valid from today, no Header tag.
6. Organisation → Departments → Weaving → Deactivate. Expected: "Move the 4 employees in Weaving first" with Open them → filtered directory; counts read "n (m incl. sub-departments)".
7. Add employee with the required fields → Save. Expected: in the list with a new employee code; number keyboard with Done for FTE/hours.
8. Open the ended employee. Expected: banner with date and reason; no Change job; More → Copy employee code works.
9. iPhone 17 Pro landscape, ola.nordmann (nb): the employee with the seeded zone move. Expected: Norwegian text; job row shows zone 1 → zone 4a; one-row footer.
**APP-2** (ayesha.khan, then bilal.ahmed):
1. Record → Pay → Request bank change (IBAN, reason, optional PDF) → Send. Expected: waiting card; ayesha sees no Approve, one line "Only … can approve this."
2. bilal.ahmed → same record → Reveal new account. Expected: full value, hides after 30 s; Approve needs the tick; then masked again, history row.
3. Reveal national id and the PK EOBI ref. Expected: visible, hide after 30 s and on background. Edit tax residence with reason. Expected: per BE OQ-11.
4. Personal → add an emergency contact, remove it → Undo. Expected: restored; a sixth is refused with copy.
5. Documents → upload a PDF, then a .txt renamed .pdf. Expected: first listed; second refused with the type copy; delete needs a reason.
6. Activity. Expected: sentences with reason and before/after; sensitive edits name fields only. Export CSV: no national id, bank, DOB or private contact column.
7. Line manager on a team member. Expected: no Pay tab; work contact only. erik.sand: Pay shows the Neovatus notice.
**APP-3** (iPhone SE portrait and landscape for ESS):
1. Employee-only login. Expected: ESS Home with greeting and My requests; tab bar Home · Me; the "being rebuilt" page is gone.
2. My profile → edit private phone → Save. Expected: saved at once; HR Activity shows it.
3. Request an address change (with an attachment) → Send. Expected: "Waiting for HR" in My requests with Withdraw.
4. Request a bank change → Send. Expected: the fixed "sign in again" copy once, typed values kept, nothing sent, no loop.
5. ayesha.khan → that employee's record. Expected: the address request card; Approve → the employee's My requests reads Approved.
6. ayesha.khan → App access tab of a linked employee. Expected: Linked with Open in People; "Also an employee at" only where ayesha has HR read.
7. People → a person without a link → Link to employee. Expected: works (hidden since H0).
8. Two-employer login. Expected: the switcher lists both employers; the choice survives an app restart. A login with no employee record: "Your login isn't linked…".

## Docs (part of done; lane-ready lists each page or "none: reason")
- User guide (new, with `tools/shots.json` entries and screenshots): `docs/user-guide/hr/employees.md`, `employee-record.md`, `organisation.md` (APP-1a/1b/2),
  `docs/user-guide/self-service/my-profile.md` (APP-3); `glossary.md` (Employee, Position, Reports to, Job change, Ended, Pay details, Change request);
  `decisions.md`; `people-access/employee-link.md` (APP-3).
- Developer: `docs/modules/hr/` (directory, record, organisation, data layer), `docs/modules/ess/shell.md`, `APP-DOCUMENTATION.md`, `docs/modules/iam-people-roles/people.md`.

## Rules
- Never `--no-verify`, no force push. Push only this lane branch when a slice is lane-ready; no merge or rebase unless the lead rings.
- No AI attribution: no Co-Authored-By, no "Generated with", in commits, PRs or comments.
- Never open, print or grep `.env`, `infra/.env`, `.local-secrets/*`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys.
- One repo per builder: NeoERP-App only (read the BE contract with `git show`, never edit it).
- Gradle only via the workspace `scripts/gradle-job.sh app <dir> <args>`; log to a file, one watcher; `--stop` only inside your slot via the script.
- Stop and ask: a screen needs a call the BE slice does not offer; a shared component change would alter Accounts screens; a copy rule unclear.

## Self-check, reviews, report
Self-check (L36) in `docs/agents/hrp-h1/builder-report-app-<slice>.md`, one row per H1-A item (proof: test, file:line, screenshot). Reviews per slice:
`docs/agents/hrp-h1/review-app<slice>-1-opus.md`, `review-app<slice>-2-opus-sec.md` (gate format; after a FIX only the asking seat re-checks).
Lane-ready `.review-channel/lane-ready-hrp-h1-app<slice>.md` with the MEASURE-1 timeline block and the flow-step results. Hand-back ≤ 10 lines.
**Done when** (per slice): items proven, tests 0 failed, iOS + Android compile, flow steps PASS, both seats ACCEPT, docs listed, T3 green, merged.


## Open questions
OQ-A1…OQ-A4 are decided in D-59 (all (a)) and written into the items. The brief check's product rows are shared with the twin and decided there:
**BE OQ-8** job-change `kind` (lead), **OQ-9** attachments and `/me/documents` (Jabran), **OQ-10** status options without On leave (lead),
**OQ-11** non-bank pay-details fields take effect without a second person (Jabran, money rule), **OQ-12** Overview probation and contract end (lead).
The App follows each recommendation unless the lead's answer differs; A4, A6, A10, A17 name the dependent behaviour.

## Brief-check rows → where applied (`brief-check-hrp-h1.md`)
| Row | Applied in |
|---|---|
| `kind` (H) | Decided 10, A6, BE OQ-8 |
| paging shape (H) | Decided 10, A3, A4 |
| `actions` not drawn (H) | Decided 10, A3 |
| sub-department count (M) | A7 |
| contract freeze (M) | Decided 9 |
| A4 status options (M) | A4, BE OQ-10 |
| A4 App access source (M) | A4 (BE-1b `user_id` + invite state) |
| A6 Overview/header (M) | A6 (probation/contract end per BE OQ-12, direct reports, App access card, ended banner, Copy code; Start in another company out) |
| A6 past date, agreement profile (M) | A6 |
| A10 Pay tab fields, hire bank request (M) | A10, Out of scope, BE OQ-11 |
| A10 approval-card amendment (M) | A10 |
| attachments (M) | A10, A17, BE OQ-9 |
| A17 bank fail-closed (M) | A17, APP-3 step 4 |
| A17 bell, states, tab bar (L) | A17, Out of scope |
| A11 manager emergency contacts (L) | A11 |
| keyboard pass (L) | Tests |
| `--stop` wording (L) | Tests, Rules |
| size cut (H) | APP-1a / APP-1b |
| cipher keys in stack steps (H) | Flow steps "Before" |
| seed per slice, two-employer login, zone (H) | Flow steps (users), APP-1b step 9, APP-3 step 8; BE H1-B9 |
| §8 rig controls, §12.16 starter setup | Out of scope |
| BE-only rows | `brief-hrp-h1-be.md` table |
