# Audit catalogue — the recorded actions

Status: draft, 2026-10-04. Written from the code as it is today.
Final home: `NeoERP-BackEnd/docs/security/audit-catalogue.md` (the implementer commits it).

This is the list of every action the platform records, and the standard that
new modules (HR, payroll, accounts and later) must follow. RULES §5 says why it
matters: six months later the only question is *who agreed to this*.

---

## 1. How recording works today

| Part | Where | What it does |
|---|---|---|
| Store | `audit-service`, table `audit_events` | Append-only by convention. No update or delete endpoint exists. |
| Write API | `POST /api/audit/events` | Needs a machine token with `audit.event.write`. `producerClientId` is taken from the token, not the body. |
| Read API | `GET /api/audit/events` | Filters: actor, orgId, branchId, service, resource, action, from/to, onBehalfOfActor, `missingReason`. Page size 1–200. |
| Columns | V1, V5, V6 | `actor`, `org_id`, `branch_id`, `service`, `resource`, `action`, `correlation_id`, `request_id`, `payload_text`, `reason`, `amendment_reference`, `on_behalf_of_actor`, `producer_client_id`, `created_at`. |
| org-service | `AuditOutboxEvent` → DB outbox → `AuditOutboxDispatcher` | Transactional outbox, retries with backoff. Carries `reason` and `amendmentReference`. |
| user-service | `AuditEventOutboxEvent` → DB outbox → `AuditEventOutboxDispatcher` | Transactional outbox, retries every 30 s. **Has no `reason` or `amendmentReference` field**: the reason only lives inside `payloadText`. |
| hr-service | `HttpHrAuditPublisher` | **Direct HTTP, fire-and-forget, no outbox.** A failed call loses the event. No reason field. |
| auth-service | `AuditEventOutbox` | Outbox is built, **but nothing calls it**. |
| payroll-service | `PayrollAuditPublisher` | Publisher is built, **but nothing calls it**. |
| accounts-service | — | No audit at all. |

### Who can read

| Surface | Who | Rule (`AuditReadAuthorization`) |
|---|---|---|
| Platform → **Audit log** (`PlatformAuditLogScreen`) | Platform staff with `PLATFORM.AUDIT.READ` | Scope "all companies": everything, including events with no company. Scope "chosen companies": one company in scope at a time, so **events with no `orgId` are invisible to them**. |
| Platform → Staff detail → **Activity** (`ActorActivityViewModel`) | `PLATFORM.AUDIT.READ` everywhere | Filters by actor. |
| Company → **Activity** tab, Branch → Activity (`CompanyActivityTab`) | A company person with `IAM.AUDIT.READ` at that company (or branch); platform staff in scope; a platform person inside Enter company | One company at a time (`orgId` required). Branch adds `branchId`. |
| Gateway machine client | `SCOPE_gateway` | Legacy, reads all. |

Visibility follows `orgId`. An event with `orgId = null` is platform-only.
An event with an `orgId` is visible to that company's audit readers. That is why
Enter-company START/END carry the company's id: the tenant can see that we were
there (§13).

---

## 2. Inventory — every action emitted today

Columns:
- **Data**: R = reason (col = in the `reason` column; pl = only inside `payloadText`), A = amendment reference, B/A = before/after, C = cascade, Δ = added/removed lists.
- **Platform wording** = `AuditWording.auditTitle()` (Audit log). **Activity wording** = `CompanyActivityTab.activityTitle()`. A "⚠" marks a fallback that reads badly or as a code.
- **Read**: P = platform only (no `orgId`), C = company Activity and platform.

### 2.1 org-service

| Resource | Action | Fires when | Data | Platform wording | Activity wording | Read |
|---|---|---|---|---|---|---|
| company | CREATE | Legacy direct create (`POST /api/org/companies`) | payload = company id | Company created | Company created | C |
| company | UPDATE | Company edit | R col (only when legal name, tax mode, tax id or reg. no. is replaced/cleared); B/A of changed fields | Company updated | Company updated | C |
| company | ACTIVATE | Activate a deactivated company | R col | Company activated | Company activated | C |
| company | REACTIVATE | Lift a suspension | R col | ⚠ "Reactivate" | ⚠ "Reactivate" | C |
| company | DEACTIVATE | Deactivate | R col | Company deactivated | Company deactivated | C |
| company | SUSPEND | Suspend (§9) | R col | Company suspended | Company suspended | C |
| company-provisioning | CREATE | Provision path finished | payload = id | ⚠ "Company provisioning created" | ⚠ "Company-provisioning created" | C |
| company-provisioning / company-enrollment | ROLLBACK | Owner provisioning failed, company removed | payload = id | ⚠ "Rollback" | ⚠ "Rollback" | C |
| company-enrollment | CREATE | Four-step enrollment finished | payload = id | ⚠ "Company enrollment created" | ⚠ "Company-enrollment created" | C |
| request | RAISE | Owner raises a request | R col (= the note) | ⚠ "Raise" | ⚠ "Raise" | C |
| request | START_REVIEW | Super Admin opens review | fields | ⚠ "Start review" | ⚠ "Start review" | C |
| request | APPROVE | Approve | R col, A col | Request approved | ⚠ "Approve" | C |
| request | DECLINE | Decline | R col | Request declined | ⚠ "Decline" | C |
| request | RECORD_ENROLLMENT | Company request linked to its enrollment | fields | ⚠ "Record enrollment" | ⚠ "Record enrollment" | C |
| request | WITHDRAW | Requester withdraws | fields | Request withdrawn | ⚠ "Withdraw" | C |
| request | UNDO_ENROLLMENT | Enrollment rolled back, request detached | R col (fixed text) | ⚠ "Undo enrollment" | ⚠ "Undo enrollment" | C |
| branch | CREATE | Branch created (Super Admin, §6) | payload = id | Branch created | Branch created | C |
| branch | UPDATE | Branch edit | payload = id only; **no B/A, no reason** | Branch updated | Branch updated | C |
| branch | ACTIVATE / DEACTIVATE | Owner operational switch (§9) | R col | Branch activated / deactivated | same | C |
| branch | SUSPEND | Commercial hold (§9) | R col, A col | Branch suspended | same | C |
| branch | LIFT_SUSPENSION | Lift hold | R col, A col | Branch suspension lifted | ⚠ "Lift suspension" | C |
| warehouse | CREATE | Location created; also the default location when a branch is created | payload = id | Location created | Location created | C |
| warehouse | UPDATE | Location edit | payload = id only; no B/A | Location updated | same | C |
| warehouse | ACTIVATE / DEACTIVATE | Location switch | R col | Location activated / deactivated | same | C |
| company-module | REPLACE | Legacy "replace all modules" | R col; payload = id; **no list of what changed** | ⚠ "Module modules replaced" | ⚠ "Company-module modules replaced" (and the Modules filter misses it) | C |
| agreement | CREATE_AGREEMENT | Agreement added | **R pl**, A pl, reference | Agreement added | same | C |
| agreement | RENEW_AGREEMENT | Manual renewal, or automatic (actor `SYSTEM`, reason "Automatic renewal") | R pl, A pl, old/new reference | Agreement renewed | same | C |
| agreement | CARRY_ADDENDUM | Renewal carries a franchise addendum forward | R pl, fields | ⚠ "Carry addendum" | ⚠ "Carry addendum" | C (beneficiary company) |
| agreement | AMEND_AGREEMENT_LIMIT | Limit changed on the agreement | R pl, A pl, from/to | Agreement limit changed (kind: Limits) | same | C |
| agreement | AMEND_AGREEMENT_ADD_MODULE / _REMOVE_MODULE | Module in/out of agreement | R pl, A pl | Module added to / taken off the agreement | same | C |
| agreement | AMEND_AGREEMENT_INCLUDE_FEATURE / _EXCLUDE_FEATURE | Feature in/out | R pl, A pl | worded | worded | C |
| agreement | AMEND_AGREEMENT_ADD_ADDON / _REMOVE_ADDON | Add-on in/out | R pl, A pl | Add-on bought / dropped | same | C |
| agreement | CREATE_ADDENDUM | Franchise addendum (§8 case 2) | R pl, A pl | Addendum added to the agreement | same | C (beneficiary) |
| agreement | SET_BRANCH_LIMIT | Per-branch limit | R pl, A pl, to | Branch limit changed (kind: Limits) | same | C |
| entitlement | SET_COMPANY_MODULE / SET_COMPANY_FEATURE | Company default (§3 level 2) | R pl, A pl, new value only | "Module/Feature switched on or off for the company" | same | C |
| entitlement | SET_BRANCH_MODULE_OVERRIDE / SET_BRANCH_FEATURE_OVERRIDE | Branch override (§3 level 3–4) | R pl, A pl, new value only | "… set differently at a branch" | same | C |
| entitlement | EXTEND_AGREEMENT_MODULE / _FEATURE / _AT_BRANCH / _FEATURE_AT_BRANCH | Switched on outside the agreement (§4) | R pl, **A pl (required, but not in the column)** | "… beyond the agreement" + Extension tag | same | C |

Note: entitlement changes also write their own from/to row through
`recordChange` (entitlement change history). The audit event itself carries only
the new value.

### 2.2 user-service

All user-service events carry the reason **only in `payloadText`** (no column).

| Resource | Action | Fires when | Data | Platform wording | Activity wording | Read |
|---|---|---|---|---|---|---|
| rbac-role | ROLE_CREATED | Company role created | R pl, B/A, Δ | Role created: *name* | same | C |
| rbac-role | ROLE_UPDATED | Role edit, permissions replaced, or a **standard role version published** (Super Admin, `orgId` null) | R pl, B/A, Δ | Role updated: *name* | same | C, or P for standard roles |
| rbac-role | ROLE_CUSTOMISED | Copy of a standard role | basedOn, version, moved count | Role customised: *name* | same | C |
| rbac-role | ROLE_RESET | Copy reset to its standard | R pl, Δ, moved people | Role reset to standard: *name* | same | C |
| rbac-role | ROLE_UPDATE_APPLIED | Standard update applied by hand, or automatically to an unedited copy (`automatic: true`, actor = system) | R pl, Δ, versions | "Standard role update applied (automatically)" | same | C |
| rbac-role | ROLE_UPDATE_DISMISSED | Standard update dismissed | R pl | worded | worded | C |
| rbac-role | ROLE_DELETED | Role deleted | R pl, before, removed codes | Role deleted: *name* | same | C |
| rbac-role | PEOPLE_MOVED_TO_ROLE | People with a shared exception set moved to a role | R pl, count, ids | ⚠ "People moved to role" (reason not shown) | ⚠ same | C |
| rbac-membership | CREATE | Person given access at a place (new membership) | Δ, where, target name | Membership created | ⚠ "Rbac-membership created" | C |
| rbac-membership | ACCESS_UPDATED | Change access (PA-1) | R pl, Δ (roles, extras, taken away) | ⚠ "Access updated" | ⚠ "Access updated" | C |
| rbac-membership | REPLACE_ROLES | Legacy PUT roles | R pl, B/A | Someone's roles changed | same | C |
| rbac-membership | REPLACE_OVERRIDES | Legacy PUT overrides | R pl, B/A | Someone's access changed | same | C |
| rbac-membership | OVERRIDE_REMOVED_REDUNDANT | Redundant exception removed | Δ | ⚠ "Override removed redundant" | ⚠ same | C |
| rbac-membership | DEACTIVATE | Membership switched off; also once per membership in a **cascade** (`cascadeOf`, `cause`) | R pl, before status, C | Membership deactivated | ⚠ "Rbac-membership deactivated" | C |
| rbac-membership | ACTIVATE | Membership switched on | R pl, before status | Membership activated | ⚠ "Rbac-membership activated" | C |
| rbac-membership | DELETE | Enrollment rollback removes the owner's membership | R pl (fixed), before | ⚠ "Membership deactivated" (wrong verb) | ⚠ "Rbac-membership deactivated" | C |
| rbac-membership | EMPLOYEE_ROLE_ADDED / EMPLOYEE_ROLE_REMOVED | Employee link adds/removes the Employee role; removal can be a cascade (`cause`) | ids, role, C | ⚠ "Employee role added/removed" | ⚠ same | C |
| rbac-company | SHARED_EXCEPTIONS_DISMISSED | "Shared exceptions" hint dismissed | setKey, count | ⚠ "Shared exceptions dismissed" (kind Other) | ⚠ same | C |
| user | UPDATE | Person edited (email change noted) | B/A, note | Person updated | ⚠ "User updated" | C (one event per company) |
| user | ACTIVATE / DEACTIVATE / SUSPEND | Person status | R pl, B/A | Person activated / deactivated / suspended | ⚠ "User …" | C |
| user | SOFT_DELETE | Person removed | R pl, B/A | Person removed | ⚠ "Soft delete" | C |
| user-security | PASSWORD_RESET | Admin or support resets a password (§12) | R pl, actorKind, platformSupport, sessions ended | ⚠ "Password reset" (kind Other) | ⚠ same | C, one event per company the person is in |
| user-security | TWO_FACTOR_RESET | Admin/support resets 2FA | R pl, removed types | ⚠ "Two factor reset" | ⚠ same | C |
| user-security | SESSION_END | Admin ends one session; or the person ends their own (`actorKind: SELF`, no reason) | R pl or self | ⚠ "Session end" | ⚠ same | C |
| user-security | SESSIONS_END_ALL | Admin ends all; or self ends all | R pl or self | ⚠ "Sessions end all" | ⚠ same | C |
| user-security | SESSIONS_END_OTHERS | Person signs out other devices | self | ⚠ "Sessions end others" | ⚠ same | C |
| onboarding-invite | CREATE / UPDATE / RESEND / REVOKE | Admin invites, edits, resends, revokes | ids, fields | Invitation created / updated / sent again / revoked | ⚠ "Onboarding-invite created/updated", "Resend", "Revoke" | C |
| onboarding-invite | EXPIRE | Scheduler expires an invite (actor `SYSTEM`) | id | ⚠ "Expire" | ⚠ same | C |
| onboarding-invite | ACCEPT | Person accepts (two code paths) | where, membership | ⚠ "Accept" | ⚠ same | C |
| platform-company-access | START | Enter company (§13) | R pl (`detail`), mode, expiry | "Entered *company* (— read-only)" | ⚠ "Start" | C |
| platform-company-access | END | Exit, or superseded by a new session | detail = EXITED/SUPERSEDED | "Left *company*" / "… replaced" | ⚠ "End" | C |
| platform-super-admin | GRANT_SUPER_ADMIN / REVOKE_SUPER_ADMIN | Super Admin granted/revoked | R pl, target | ⚠ "Grant super admin" | — | P |
| platform-staff | ADD_STAFF / UPDATE_STAFF / REMOVE_STAFF | Staff added, roles or scope changed, removed | R pl, B/A roles + scope | ⚠ "Add staff" … | — | P |
| platform-staff | RESEND_SETUP_EMAIL | Setup email resent | target | ⚠ "Resend setup email" | — | P |
| platform-role | CREATE_PLATFORM_ROLE / UPDATE_PLATFORM_ROLE / DELETE_PLATFORM_ROLE | Platform role changes | R pl, B/A codes | ⚠ "Create platform role" … | — | P |

### 2.3 hr-service (direct HTTP, may be lost)

| Resource | Action | Fires when | Data | Platform wording | Activity wording | Read |
|---|---|---|---|---|---|---|
| hr-employee | EMPLOYEE_LINKED | Employee linked to a login (create, link, invite link) | ids, code, name | ⚠ "Employee linked" | ⚠ same | C |
| hr-employee | EMPLOYEE_UNLINKED | Employee unlinked | R pl | ⚠ "Employee unlinked" | ⚠ same | C |
| hr-employee | EMPLOYEE_LINK_PUSH_FAILED | Link push to user-service gave up (actor system) | error, attempts | ⚠ "Employee link push failed" | ⚠ same | C |
| employee-lifecycle-request | CREATE / APPROVE / REJECT | Lifecycle request raised and decided | fields; **actor = employee id, not the sign-in subject** | ⚠ "Employee lifecycle request created/approved", "Reject" | ⚠ "Employee-lifecycle-request created", "Approve", "Reject" | C |
| leave-encashment | CREATE / APPROVE / REJECT | Encashment raised and decided | fields; actor = employee id | ⚠ "Leave encashment created/approved", "Reject" | ⚠ "Leave-encashment created", "Approve", "Reject" | C |

### 2.4 auth-service, payroll-service, accounts-service

None emitted.

---

## 3. Findings

### 3.1 Reasons are recorded but not where the reader looks (highest impact)

| Producer | Reason goes to | Effect |
|---|---|---|
| org-service company, branch, warehouse, module, request | `reason` column | Correct. |
| org-service **agreement** and **entitlement** (all §4/§5 events) | `payloadText` only. Amendment reference too. | `missingReason=true` counts them as missing. Company Activity shows no reason. Audit log shows "Missing a reason" and never shows "Under amendment …". The exact events §5 exists for look unreasoned. |
| user-service (all) | `payloadText` only (the outbox has no reason field) | Same. The Audit log rescues only role events and Enter company. |
| hr-service | `payloadText` only | Same. |

Fix: agreement and entitlement `audit()` should pass `reason =` and
`amendmentReference =` to `AuditOutboxEvent` (two lines each). user-service
needs a `reason` / `amendment_reference` column on its outbox and the field on
`AuditEventOutboxEvent` and `AuditEventPayload`. Keep the reason in the payload
too for now, so old readers still work. Old rows: a one-off backfill can copy
`payload_text->>'reason'` into `reason` where it parses as JSON.

### 3.2 Wording gaps

- **Two wording tables.** `AuditWording.kt` (Audit log) and `CompanyActivityTab.kt` (Activity) each keep their own `ACTION_TITLES`, `RESOURCE_NAMES` and `PAST_TENSE`. They have drifted: Activity lacks every user-service resource, `company-module`, `request`, and the verbs `APPROVE`, `DECLINE`, `WITHDRAW`, `RESEND`, `REVOKE`, `LIFT_SUSPENSION`, `SOFT_DELETE`. So a company owner reads "Approve" or "Rbac-membership created" where the Audit log says "Request approved" or "Membership created". Recommend one table in `AuditWording.kt`, used by both.
- **Actions with no wording** (fall back to a de-coded phrase): REACTIVATE, ROLLBACK, RAISE, START_REVIEW, RECORD_ENROLLMENT, UNDO_ENROLLMENT, CARRY_ADDENDUM, company-provisioning/company-enrollment CREATE, ACCESS_UPDATED, OVERRIDE_REMOVED_REDUNDANT, PEOPLE_MOVED_TO_ROLE, EMPLOYEE_ROLE_ADDED/REMOVED, SHARED_EXCEPTIONS_DISMISSED, all `user-security`, invite EXPIRE/ACCEPT, all `platform-super-admin`, `platform-staff`, `platform-role`, all hr-service.
- **Wrong wording**: `rbac-membership DELETE` reads "deactivated" (it is a removal); `company-module REPLACE` reads "Module modules replaced".
- **Wrong kind chip**: `user-security`, `rbac-company`, `company-provisioning`, `company-enrollment`, all hr resources fall to "Other".
- **Wording with no action** (dead entries): PAST_TENSE `ENROLL`, `GRANT`, `SEND`; RESOURCE_NAMES / kind sets `identity`, `password-reset`, `invite`, `onboarding`, `membership`, `role`, `module`, `company_module`.

Proposed wording is in Appendix A.

### 3.3 Writes that record nothing (sampled from controllers)

| Service | Write | Risk |
|---|---|---|
| payroll-service | All 15 writes: components, structures, rules, pay periods, **pay runs** | High. Pay runs move money. The publisher exists but is never called. |
| accounts-service | All 17 writes: chart of accounts, cost centres, fiscal years, **journal entries**, **period open/close** | High. A posted journal with no trail fails any audit. |
| hr-service | Employee create (unlinked) / update / exit, departments, designations, shifts, holidays, leave policies, leave requests and approvals, attendance and its workflow, performance | Medium–high. Only lifecycle, encashment and linking are recorded. |
| user-service | `PermissionController` create/update (permission catalogue) | Medium. Changes what every role means. Platform-only. |
| user-service | `PATCH /api/users/me` (own profile) | Low. Recommend recording name/phone changes as `user UPDATE` with actorKind SELF. |
| org-service | `branch UPDATE`, `warehouse UPDATE` | Recorded, but with no before/after, so "what changed" cannot be answered. |
| org-service | `company-module REPLACE` | Recorded without the module list. Legacy; retire the endpoint. |

### 3.4 Other gaps

- `on_behalf_of_actor` is never set. Enter-company actions are tied to the session only by actor + company + time window in the app (`sessionActions`). §13's double-log is not real yet.
- `correlation_id` / `request_id` are almost never set, so one user action that writes events in two services cannot be joined.
- `payloadText` has three shapes: a bare UUID (company, branch, warehouse, module), JSON from a mapper, and hand-built JSON strings (platform staff, super admin, company access). Hand-built strings are an escaping risk.
- hr-service uses an employee id as `actor`. Every other producer uses the sign-in subject. The Activity "by …" line and actor filters break.
- hr-service has no outbox. A down audit-service drops HR events silently.
- The minimum reason length (6) is copied into at least nine places.
- There is no retention, archive or legal-hold logic, and nothing stops a DBA delete.

---

## 4. Naming rules for new actions

1. **Resource**: lower-case kebab-case noun, singular, prefixed with the module when it is not obviously unique: `payroll-run`, `accounts-journal`, `hr-leave-request`. One resource per aggregate.
2. **Action**: UPPER_SNAKE, an imperative verb: `CREATE`, `UPDATE`, `APPROVE`, `POST`, `REVERSE`, `CLOSE`. Do not repeat the resource (`CREATE`, not `RUN_CREATED`). Use a qualifier only to tell variants apart: `AMEND_LIMIT`, `SET_BRANCH_OVERRIDE`.
3. **Shared verbs mean the same everywhere**: `ACTIVATE`/`DEACTIVATE` = operational and reversible by the tenant; `SUSPEND`/`LIFT_SUSPENSION` = commercial, Neovatus only (§9); `DELETE` = gone; `SOFT_DELETE` = hidden but kept.
4. **Outside-agreement actions start with `EXTEND_`.** The app keys the red Extension tag off that prefix.
5. **Never rename a code once it has shipped.** Stored history keeps the old code. Add new wording; do not rewrite rows.
6. **Existing codes stay as they are.** `ROLE_CREATED`, `EMPLOYEE_LINKED`, `ADD_STAFF` break rule 2 but are history now. New code follows the rule.
7. **Register before you ship**: a row in this catalogue and a wording entry, in the same pull request.

## 5. Required fields

| Field | Rule |
|---|---|
| `actor` | The sign-in subject of the person who acted. `SYSTEM` for schedulers. Never an employee id or a display name. |
| `orgId` | Set whenever the change belongs to a company. Without it the company cannot see it. Leave it null only for platform-wide changes. |
| `branchId` | Set when the change is about one branch, so the branch Activity tab finds it. |
| `service`, `resource`, `action` | Per §4. |
| `reason` | In the **column**, not only in the payload, whenever a reason was asked for (§6). |
| `amendmentReference` | In the column, required for any `EXTEND_*` and for suspend/lift where the gate asks for it. |
| `onBehalfOfActor` | Required once Enter company with full access writes changes (D-9). |
| `correlationId` | The incoming request id, passed on to every service the action touches. |
| `payloadText` | JSON object, written by a serializer, never string-concatenated. Must include: the target's id **and display name** (so wording needs no lookup), `before` and `after` of the fields that changed (only those), and `cascadeOf` / `cause` when the event is a side-effect of another. |
| Transport | Transactional outbox, written in the same transaction as the change. Never a direct HTTP call. |

## 6. Reason rules (the reason gate)

1. **A reason is required** for: any entitlement, limit, module or agreement change (§5); suspend and lift (§9); deactivate and reactivate of company, branch, location, person or membership; any access change that removes or adds power (roles, extras, taken away); platform authority changes (staff, platform roles, Super Admin); support actions on a tenant's people (§12); entering a company (§13); deleting anything.
2. **An amendment reference is also required** for anything outside the agreement (§4).
3. **Minimum 6 characters after trimming.** One shared constant, not one per service.
4. **Refused as a field error** under `reason` (400, `fieldErrors.reason`), so the form shows it next to the box (`ReasonGate`).
5. **No reason** for: creation of something new and ordinary (a branch from an approved request, an invite), self-service actions (own sessions), and system actions. These must be marked by actor (`SYSTEM`) or `actorKind: SELF` so the "Missing a reason" count can skip them.
6. **Automatic actions write a fixed reason** that says they were automatic ("Automatic renewal", "Unedited copy follows its standard role").
7. New money modules: posting, reversing, approving a pay run, closing or reopening a period **all require a reason**. Draft edits do not.

## 7. Export

**Today**: the Audit log's Export copies **only the rows already loaded** (one or a few pages of 20) to the clipboard as CSV (`auditCsv`): When, What, Kind, Who, Company, Reference, Reason, Recorded by. Company Activity has no export. The export itself is not recorded.

**Design** (`02-platform-admin/audit.jsx`): "Audit extract queued — CSV, emailed to you. The log itself is append-only."

**Proposal**:
- A server-side export: `POST /api/audit/exports` with the same filters, date range required, max 12 months per extract. Built in the background, delivered as a download link (or email), expires after 7 days.
- Same read rule as the list. A company export needs `IAM.AUDIT.READ`.
- **The export is itself recorded**: `audit-export / CREATE` with filters and row count.
- Columns as today plus `action` code, `resource`, `branch`, `amendment reference`, `on behalf of`, and the raw payload in a last column.
- Keep the page copy as "Copy shown rows".

## 8. Retention

**Today**: no retention rule. Rows are kept forever. Nothing archives or deletes. The DB role can delete. Outbox tables in org-service and user-service keep published rows forever too.

**Proposal** (needs Jabran's and legal's sign-off):
- **Keep audit events at least 10 years** from the event. This covers bookkeeping-retention periods in the markets in view (to be confirmed per country; Norway and Pakistan differ).
- **Never delete in-app.** No endpoint, no admin action. The application DB user gets `INSERT` and `SELECT` only on `audit_events`.
- **Hot 24 months, then archive**: partition `audit_events` by month; partitions older than 24 months move to cheaper storage but stay searchable by export.
- **Legal hold** per company: stops archive and purge for that company.
- **Personal data**: payloads carry names. After a person is erased, replace names in their payloads with a placeholder, keep the ids. Audit rows are not deleted for erasure.
- **Outbox rows**: purge published rows after 30 days.
- **Company ends its contract**: keep its audit for the full retention period; it is our record of what we agreed.

## 9. Checklist for module authors

Before a new module's write endpoint is merged:

- [ ] Every write endpoint (POST/PUT/PATCH/DELETE) emits exactly one event per thing changed. Reads and previews emit nothing.
- [ ] Resource and action follow §4 and are added to this catalogue.
- [ ] Event written through the service's **transactional outbox**, in the same transaction as the change.
- [ ] `actor` = sign-in subject; `SYSTEM` for jobs.
- [ ] `orgId` set (and `branchId` when branch-specific), so the company can see it.
- [ ] Reason gate applied where §6 says; reason and amendment reference sent in the **columns**.
- [ ] Payload is serializer-built JSON with target id + name, changed fields before/after, `cascadeOf`/`cause` for side-effects.
- [ ] Wording added in the single `AuditWording` table: a title, a resource name, and a kind chip.
- [ ] Cascades: one event per affected record, each pointing at the cause.
- [ ] A test asserts the event (resource, action, reason column) for each write.
- [ ] Money actions (post, reverse, approve, close) never skip the reason.
- [ ] Nothing secret in the payload (passwords, tokens, full bank numbers).

---

## Appendix A — proposed wording for actions with none

| Resource · Action | Proposed title | Kind |
|---|---|---|
| company · REACTIVATE | Company suspension lifted | Companies |
| company-provisioning · CREATE | Company set up | Companies |
| company-enrollment · CREATE | Company enrolled | Companies |
| company-* · ROLLBACK | Enrollment rolled back | Companies |
| company-module · REPLACE | Company modules replaced (legacy) | Entitlements |
| request · RAISE | Request raised | Companies |
| request · START_REVIEW | Request taken into review | Companies |
| request · RECORD_ENROLLMENT | Request linked to the enrolled company | Companies |
| request · UNDO_ENROLLMENT | Request reopened — enrollment rolled back | Companies |
| agreement · CARRY_ADDENDUM | Addendum carried into the renewed agreement | Agreements |
| rbac-membership · CREATE | Access given at a place | People |
| rbac-membership · ACCESS_UPDATED | Access changed | People |
| rbac-membership · OVERRIDE_REMOVED_REDUNDANT | Unneeded exception removed | People |
| rbac-membership · DELETE | Access removed | People |
| rbac-membership · EMPLOYEE_ROLE_ADDED / _REMOVED | Employee role given / taken away | People |
| rbac-role · PEOPLE_MOVED_TO_ROLE | People moved to a role | People |
| rbac-company · SHARED_EXCEPTIONS_DISMISSED | Shared-exception hint dismissed | People |
| user-security · PASSWORD_RESET | Password reset | People |
| user-security · TWO_FACTOR_RESET | Two-step sign-in reset | People |
| user-security · SESSION_END | Signed out of one device | People |
| user-security · SESSIONS_END_ALL | Signed out everywhere | People |
| user-security · SESSIONS_END_OTHERS | Signed out of other devices | People |
| onboarding-invite · EXPIRE | Invitation expired | People |
| onboarding-invite · ACCEPT | Invitation accepted | People |
| platform-super-admin · GRANT_ / REVOKE_SUPER_ADMIN | Super Admin given / taken away | People |
| platform-staff · ADD_ / UPDATE_ / REMOVE_STAFF | Staff member added / access changed / removed | People |
| platform-staff · RESEND_SETUP_EMAIL | Setup email sent again | People |
| platform-role · CREATE_ / UPDATE_ / DELETE_PLATFORM_ROLE | Platform role created / changed / deleted | People |
| hr-employee · EMPLOYEE_LINKED / _UNLINKED | Employee linked to / unlinked from a sign-in | People |
| hr-employee · EMPLOYEE_LINK_PUSH_FAILED | Employee link could not be sent | Other (system) |
| employee-lifecycle-request · CREATE / APPROVE / REJECT | Employee change requested / approved / rejected | People (new "HR" chip later) |
| leave-encashment · CREATE / APPROVE / REJECT | Leave encashment requested / approved / rejected | People (new "HR" chip later) |

Remove the dead entries: `ENROLL`, `GRANT`, `SEND`; resources `identity`, `password-reset`, `invite`, `onboarding`, `membership`, `role`, `module`, `company_module`.

## Appendix B — sources read

- audit-service: `AuditEvent.kt`, `AuditController.kt`, `AuditService.kt`, `AuditReadAuthorization.kt`, migrations V1, V5, V6.
- org-service: `AuditEventOutbox.kt`, `AuditOutboxDispatcher.kt`, `ReasonGate.kt`, `CompanyService`, `CompanyProvisioningService`, `BranchService`, `WarehouseService`, `CompanyModuleService`, `AgreementService`, `EntitlementService`, `OrgRequestService`.
- user-service: `AuditEventOutboxRepository.kt`, `AuditEventOutboxDispatcher.kt`, `AuditEventPublisher.kt`, `AuditJson.kt`, `AccessAuditPayload.kt`, `RoleService`, `AccessChangeService`, `MembershipService`, `SharedExceptionService`, `EmployeeLinkService`, `UserAdminService`, `UserSecurityService`, `OnboardingService`, `OnboardingFirstLoginService`, `InviteAcceptFollowUpProcessor`, `CompanyEnrollmentOwnerService`, `PlatformCompanyAccessService`, `PlatformSuperAdminService`, `PlatformStaffService`.
- hr-service: `HrAuditModels.kt`, `HttpHrAuditPublisher.kt`, `EmployeeService`, `EmployeeInviteLinkService`, `IamLinkOutboxDispatcher`, `EmployeeLifecycleRequestService`, `LeaveEncashmentService`.
- auth-service `AuditEventOutbox.kt`; payroll-service `PayrollAuditPublisher.kt`.
- App: `features/audit/presentation/AuditWording.kt`, `features/organization/presentation/organization/CompanyActivityTab.kt`, `CompanyDetailAccess.kt`, `PlatformAuditLogScreen.kt`.
- Design: `RULES.md` §4, §5, §9, §12, §13; `02-platform-admin/audit.jsx`.
- Write endpoints sampled: every `@Post/@Put/@Patch/@DeleteMapping` in org, user, hr, payroll, accounts, auth.
