# Step 0 completion review: Auth, Org, User & IAM, Platform Admin console

**For:** Codex (independent review) and Jabran.
**Written by:** the Claude reviewer session, 2026-10-04.
**Heads:** NeoERP-App `0529bd4`, NeoERP-BackEnd `6eb3e3b`. Both are clean and not pushed.

**Purpose:** decide what is needed before Auth, Org, User & IAM and the Platform Admin console can be marked COMPLETE in
`NeoERP-App/docs/module-sequence.md`. This file sits in the workspace, outside git, so writing it causes no repo churn.

## 1. How to review

Review it in this order:

1. Read the sources:
   - `NeoERP-App/docs/HANDOFF.md`
   - `NeoERP-App/docs/module-sequence.md` (Step 0 checklist)
   - `NeoERP-App/docs/agents/iam/plan.md`
   - `NeoERP-App/docs/agents/platform-admin-console/plan.md`
   - `NeoERP-BackEnd/docs/api/people-pa1.md`
   - `NeoERP-BackEnd/docs/api/roles-rl1.md`
2. Check the claims in section 3 against the code (file:line).
3. Confirm or dispute each verdict in sections 4 and 5. Add anything missing.
4. Write your findings next to this file as `STEP0-COMPLETION-REVIEW.codex.md`. Rank them BLOCKER / MAJOR / MINOR, each with evidence.

Rules: read-only unless Jabran says otherwise; never push; PROJECT-STATE.md is Jabran's.

## 2. What was built in this phase, with ranges to review

| Work | Spec / contract | App | Backend |
|---|---|---|---|
| Module rows MR-1..5, stock locations rename SL-1 | `docs/design/specs/module-rows.md`, `stock-locations.md` | 358c884..7bb7a8f | (UI copy only) |
| Roles and permissions RL-1 | `specs/roles.md`; backend `docs/security/permission-actions.md`, `standard-roles.md`, `docs/api/roles-rl1.md` | c4bc390..991e69c | 9599a80..ed03aef (user-service V24–V27, org-service) |
| Shared UI building blocks | `specs/building-blocks.md` | 964c7ea | — |
| People and access PA-1 (+ D-PA1-1/2/3) | `specs/people-access.md`; `docs/api/people-pa1.md` | 61f2e0c..0529bd4 | ff31946..6eb3e3b (user-service V28–V32, hr-service V9, auth-service scopes) |
| Local dev on localhost + adb reverse | HANDOFF "Local dev" | 2ffe418 | scripts/run-all-services.sh, scripts/android-reverse.sh |

**Review history:** every PA-1 batch was reviewed by the reviewer session. The findings and their outcomes are in
`NeoERP/.review-channel/to-implementer.md` entries 1–27 (questions and requests are in `to-reviewer.md`).
Security points that were reviewed and fixed:
- grant only what you hold, including removing a Taken away;
- DENY wins;
- the last Owner is locked against removal;
- Branch Manager reach;
- invite and accept races;
- sign-in can't be blocked by PA-1;
- internal routes accept service tokens only;
- ESS can only reach the caller's own record;
- lock order and deadlocks.
**Worth a second pair of eyes:** the lock-order claims and the D-PA1-1 savepoint path in `OnboardingFirstLoginService`.

## 3. Current state per Platform Admin destination

| Destination | State | Notes |
|---|---|---|
| Dashboard | Real | — |
| Inbox | Real, old screen pattern | Ported when its module comes up |
| Companies + company detail (Overview, Modules, Branches, Agreement, People, Roles, Activity) | Real | — |
| Agreements | Real | A partial load is drawn as an error (`AgreementsScreen.kt` ~145) |
| Requests | Real | — |
| People (all companies) | Real | The person panel has no effective permissions with source; you open the company for that |
| Staff, Platform roles | Real | No screenshot tests |
| Standard roles | Real screen, **BROKEN live** | The gateway sends `/api/platform/standard-roles` to org-service. Fix requested (reviewer entry 27); not yet committed at these heads |
| Audit log | Real | Exports the current page only. No recorded-actions catalogue |
| Enter company | Real (company header, reason, read-only by default in prod) | — |
| Branches, Entitlements | Not in the sidebar (decided 2026-09-26) | Stub destinations are still in code; remove them |

## 4. Remaining before COMPLETE

### Auth
- [ ] Sign-in on a real Android device and an iPhone (reinstall iOS first).
- [ ] `docs/agents/login-auth/plan.md` still lists forgot/reset password as app work. Since `44351a3` sign-in is Keycloak browser-only, so rewrite or retire the plan.

### User & IAM
- [ ] Jabran's PA-1 retest, including the D-PA1-3 Review step and the segmented-control fix on desktop.
- [ ] Gateway route for `/api/platform/standard-roles` (entry 27), plus a route test.
- [ ] Platform → People person panel: show effective permissions with their source, or record "open the company" as accepted.
- [ ] Screenshot tests for the Platform People, Staff and Platform roles screens.
- [ ] Tick the IAM completion checklist. People tab, person detail, Company → Roles, Staff/Roles and Invitations are built but unticked. Mark D-1, D-6, D-7, D-8 and D-11 decided, and move D-PA1-3 to decided.

### Org
- [ ] **Block parent loops:** a franchisor must be an OWNED company, enforced in domain, service and a DB CHECK in a new migration. Today only "parent exists" is checked (`org-service CompanyService.kt:56`).
- [ ] **Franchise terms:** not built. It needs a spec, Jabran's approval, a contract, then the build (org-service and app). Accounts uses it in Step 1.
- [ ] Clean start, `seed-demo-tenants.sh` and `seed-demo-iam.sh`, persona click-through, review of `CompanyDetailScreenshotTest`, and the seeded requests checked in the inbox.
- [ ] Confirm the two Step 0 decisions (both settled in practice): keep the branch "Same as company · On · Off" control; keep Branches and Entitlements out of the menu.

### Platform baseline (shared)
- [ ] **Gateway route-check script** covering every endpoint family. It must also confirm:
  - `/api/internal/**` is closed;
  - CORS behaviour;
  - health, and how the actuator `gateway` endpoint is exposed;
  - `POST /api/audit/events` refuses user tokens.
- [ ] **Audit catalogue:** every recorded action, its wording and who can read it, written down as the standard for the next modules, with export and retention notes.
- [ ] Clean-up:
  - remove the PlatformBranches and PlatformEntitlements stubs;
  - remove the stale notes in `NeoBackendContracts`;
  - remove the dead `NeoApiEndpoints.Inbox`.
- [ ] Doc drift:
  - the Step 0 text says user-service is at V23 (it is V32);
  - the platform plan's checkpoint still says "Awaiting Plan approval";
  - HANDOFF §2 must reflect that PA-1 is built.
- [ ] Final step: tick both plans' checklists and update the Order table in `module-sequence.md`.

## 5. Decisions

**Settled by what was built (record only):**
- IAM D-1, D-6, D-7, D-8, D-11.
- Platform plan:
  - #2 staging order;
  - #3 NULL = unlimited;
  - #4 books as consolidatesIntoParent;
  - #5 impersonation built as Enter company;
  - #6 backend module catalogue;
  - #1 superseded by WORKFLOW.md Working mode.

**Need Jabran** (or explicitly deferred to the HR step):
- HR Officer interim: can't add or edit employees until the HR codes are split.
- ESS company context: token claim or workspace header. Today `/api/hr/me/**` takes a required `companyId`.
- Franchise terms: the shape of the fee lines.

**Deferred to their modules (not blocking):**
- Location Manager fits LOCATION;
- clean-up of leftover Employee roles;
- ADR-012 tenant gateway in hr-service;
- the HR "Add employee" dialog without a login;
- the person page's link to the HR employee;
- two optional PA-1 minors (hr lock-then-refresh; last-Owner rule only on Owner memberships);
- the four Org nice-to-haves;
- older screens ported per module;
- the reviewer's rig/spec refresh after Jabran's test.

## 6. Proposed order to finish

1. The implementer fixes the standard-roles route, writes the gateway check script, adds the parent-loop block and removes the stubs. These are small and can run in parallel.
2. The reviewer writes the franchise terms spec, and Jabran approves it. The contract and build follow.
3. In parallel: the audit catalogue doc, tick the checklists and fix the doc drift.
4. Jabran: retest, clean start, seed, persona click-through, device sign-in.
5. Codex: review this file and the ranges above, and report findings.
6. Mark Auth, User & IAM, Org and the Platform Admin console COMPLETE in `module-sequence.md`.

## 7. State at pause (2026-10-04, Claude sessions resume in about 24h; Codex continues)

**Heads:** backend `81344c5`, app `8492827`. All reviewed and accepted, nothing open from Claude's review.

**Done since this file was written:**
- Standard-roles gateway route fixed. A gateway test now pins every controller to its owning service.
- `scripts/gateway-route-check.sh`.
- Actuator locked down; the dead routes 2 and 7 removed.
- Franchisor must be OWNED, enforced in domain, service and the org V28 trigger, and also on requests.
- The enrollment wizard's idempotency key now follows the payload.
- Stub destinations, NeoBackendContracts and the dead endpoints removed.
- Docs refreshed.
- W5 screenshot tests and their 7 UI fixes.
- D-PA1-3: one reason plus a Review step.
- Segmented-control pill fix.

**Codex now:**
1. Part 1: the independent review into `STEP0-COMPLETION-REVIEW.codex.md`.
2. Part 2: the 5 follow-ups in review-channel entry 31.
3. Then a review-request appended to `.review-channel/to-reviewer.md`.

**Waiting on Jabran:**
- Restart the backend (user-service V32, org-service V28, gateway), run `NEOERP_TOKEN=… scripts/gateway-route-check.sh`, and retest PA-1, the Review step, the segmented pill and Platform People/Staff/Roles.
- Device sign-in on Android and iPhone.
- **Approve or change two drafts:**
  - `docs/drafts/franchise-terms-spec.md` (FT-Q1..Q10, recommendations given);
  - `docs/drafts/audit-catalogue.md` (6 questions, recommendations given).
- Still undecided: the HR Officer interim, and ESS company context. Both can be deferred to the HR step.

**When Claude resumes:**
1. Review Codex's fixes and its findings file.
2. After FT-1 is approved: the franchise terms contract, then the build.
3. Audit catalogue: commit it, plus the Step 0 audit fixes (reason columns, one wording table).
4. Refresh the rig and spec (role checklist, no reason on Add access, single access as a line, the Review step, the segmented pill, Branches and Entitlements dropped from the rig sidebar).
5. Jabran's final test, then mark Auth, User & IAM, Org and the Platform console COMPLETE.

**Remaining before COMPLETE:**
- franchise terms;
- the audit catalogue and its fixes;
- Platform People effective-permission view, or record "open the company" as accepted;
- Jabran's tests;
- ticking the Order table.

## 8. Claude reviewer's verdict on the Codex findings (2026-10-04)

The Codex review is good. Its verdict stands: **not complete yet.**
- **Spot-checked in code:**
  - B1: `RoleService.reset` (~l.362) has no `requireWithinOwnRights`, but `applyUpdate` does.
  - B2: on invite edit, a removed DENY is not judged against the editor's own rights.
  - M1: `OnboardingFirstLoginService` (~l.101) activates INACTIVE users as well as PENDING ones.
- **Accepted as written:** M2, M3, N1, N2, N3.
- **M1 decision (reviewer):** auto-activate only PENDING users. A deactivated user stays deactivated until an admin reactivates them, and a
  new invitation never reverses that.
- **The Section 3 to 5 dispositions** are accepted. Two things are noted: "the screenshot fixtures are not baseline comparisons", and the
  extra coverage for multi-invite acceptance against HR placement.

**Assigned to Codex (Part 3)**, after its Part 2: B1, B2, M1, M2, M3, N1, N2, N3. The Claude reviewer reviews them when it is back.

## 9. Claude review of Codex batches (2026-10-05): backend 81344c5..f58eec1, app 8492827..37476c1

**Verdict: accepted. No BLOCKER or MAJOR.**
- **Verified in code and tests:**
  - B1, B2, M1 (brand-new users still activate), N2, N3;
  - V33 (new file, nullable columns only; no applied migration edited);
  - reason and amendment carried end to end;
  - Enter-company attribution taken from the server only (client keys stripped);
  - stable company paging;
  - the app's companyType path, the shared clip, M2/M3/N1, nullable memberCount, and one audit wording table.
- **No security regressions.** Pushes to dev / dev-app were authorized by Jabran (entry 22).

**Follow-ups (all MINOR), assigned to Codex:**
- Backend:
  - (1) Invite edit: count a removed DENY as restored only if a kept role carries that code.
  - (2) ACCEPT without access: keep the system code out of the `reason` column.
  - (3) Audit catalogue: mark the "R col" rows (ROLE_CUSTOMISED, invite UPDATE/REVOKE, ACCEPT).
  - (4) Company paging: sort by legalName, then id as tiebreak; document it in org.md.
  - (5) PlatformReadOnlyAccessFilter: one context lookup per request.
- App:
  - (6) Platform Audit log meta line uses `amendmentGiven()`; the support attribution appears only once.
  - (7) No raw branch UUID in audit text.
  - (8) No "Membership(s)" in UI text: audit resource names become "Access"; the person card is renamed ("Where they work").
  - (9) memberCount stays nullable: show no count, and treat null as "held" for the Delete gate.
  - (10) Dashboard renewals: read the renewal window in full so "Queue is clear" can be verified.
  - (11) Dashboard decision (reviewer): only a 401 fails the whole dashboard. A 403 on one read hides only that figure, behind a partial-read warning.
  - (12) The PARENT_NOT_OWNED message names the requester, and the request refreshes after the refusal.

## 10. §9 follow-ups (2026-10-05): backend f58eec1..aea037a, app 37476c1..8f849a0

Accepted. All 12 are mapped to commits with targeted tests. Spot-checked: no "Membership" in the audit wording or the UI.

**Code work left for Step 0: none, apart from franchise terms.**

**Open items, all on Jabran:**
- FT-1 approval; then Codex writes the contract, review, then the build.
- Audit retention decision.
- Restart, run the gateway check, retest, and device sign-in.
- Platform People: accept "open the company" for effective permissions, or build it.
- Rig refresh.
- Finally, tick COMPLETE.

- 2026-10-05: Jabran ran gateway-route-check.sh as superadmin: 30 pass, 0 fail, 4 not proven (HR/Payroll/Accounts 403 for a non-member; /api/authz/effective 500 sent to Codex). Android sign-in on a real device: OK.
- 2026-10-05: Jabran: sign-in works on the iOS simulator and Android emulator, as well as the real Android device. Real iPhone still to do.
- 2026-10-05: Jabran: real-iPhone sign-in not needed for Step 0 (simulator accepted); kept as an open check for a later release. Codex prompt A–E given.

## 11. Codex jobs A–E (2026-10-05): backend aea037a..3133db2, app 8f849a0..d6b4248, discovery note

**A, B and C: accepted.**
- A: 400 errors for request parameters; route-check probes with a real orgId.
- B: Step 0 UI consistency.
- C: Location Manager fits LOCATION, new V34; holders and copies verified with a Postgres test.

**D (screenshot baselines): the approach is good, but there are 2 MAJORs.**
1. `jvmTest` is pinned to one exact machine: the macOS patch level, the JDK build and Skiko. Any other machine, or an OS update, fails all 570 unit tests.
2. 143 MB of PNG files are committed without LFS. They are pushed to dev-app.

**E (Accounts discovery): accepted as a draft.** It gives the facts for Step 1, and its 12 questions are for Jabran at the start of Step 1.

**Follow-ups:** see the Codex prompt (the reviewer's message of 2026-10-05).
- 2026-10-05: Jabran decided that screenshots are not committed. Codex hit its limit, so the plan is: drop d6b4248 entirely (reset dev-app to
  f18a40a, force-push once with --force-with-lease, Jabran runs it). The screenshot render tests still write PNGs under build/ to look at.
  The local-only record/verify tooling plus the B1 and A1 minors from §11 wait for the next Codex or Claude Code session.
- 2026-10-05: entry 31 (app f18a40a..f091474, backend 3133db2..aa03df7) accepted; 3 MINORs in to-implementer.md entry 32.
