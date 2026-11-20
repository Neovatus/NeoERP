# NeoERP: proposed shared project state and handoff

**Proposal for reconciliation, not the canonical project state or engineering approval.**
Prepared 2026-09-06. App baseline: `73136f3`; backend baseline: `7584040`.
Both code repositories contain substantial uncommitted work, including auth and entitlement changes.
HEAD alone does not identify the implementation reviewed. Recheck the relevant diff before acting.

This draft combines historical approvals from the user conversation with current source inspection.
It is not a blind review: previous Claude-authored documents and findings were already visible.
The initial draft did not read the Claude proposal; this revision incorporates Claude's subsequent read-only review and a source-checked reading of `PROJECT-STATE.claude.md`.
Claude recommends this draft as the base. That is review agreement, not user approval to replace the canonical document or alter implementation.
Only this proposal was written. No old document, source, database, workflow, or service was modified.

## 1. What this is

NeoERP is a modular, multi-tenant staff ERP, with platform administration and tenant operations.
Administrators invite/provision staff; the agreed direction is not public self-registration.
The platform super-admin is system-wide and need not belong to a company.
The client targets Android, iOS, and JVM desktop. A browser-hosted login is not an app web target.
Pakistan, Norway, Sweden and wider Nordic requirements inform the design; jurisdictional readiness is not established by the existence of generic HR/payroll screens.

Use these distinct labels when updating state: **proposed**, **approved**, **implemented**, **verified for a named scope**, and **accepted**.
Working code is evidence of current behavior, not proof of intended policy. An accepted decision is not proof its implementation is complete.
An unresolved security finding cannot become a non-blocking backlog item simply because an older handoff says "ready."

## 2. Where things live

| Location | Responsibility |
| --- | --- |
| [NeoERP-App](NeoERP-App/README.md) | KMP/Compose client; native adapters, session, DI, design-system implementation and feature state machines. |
| [NeoERP-BackEnd](NeoERP-BackEnd/README.md) | Eight services: gateway, auth, user/IAM, org, HR, payroll, audit and accounts; contracts, migrations and security enforcement. |
| [NeoERP-Design](NeoERP-Design/README.md) | Intended experience, tokens, screen specifications and domain requirements to reconcile with accepted backend decisions. |
| [Backend ADRs](NeoERP-BackEnd/docs/index.md) | Durable architectural rationale. Read each ADR's actual status, not just its presence in the index. |
| `docs/agents/<workstream>/` in each code repo | Detailed discovery/approved scope and historical rationale, not competing project-wide priorities. |
| External `KMM-Module/KMM-Network` checkout | Independently versioned library; app settings support a configurable composite build or published dependencies. Not audited as a fourth product repository here. |

The umbrella folder and design folder are not currently Git repositories. Canonical workspace documentation needs a versioned home and a documented checkout path for other machines.
**Proposal:** version the workspace guides/state/design in an umbrella repository that excludes the two nested code repositories. This is not approval to create a repository or remote.
Standalone repo users must be told where to obtain the shared guides; missing parent files must not silently cause agents to invent policy.

## 3. Decisions to preserve

| Decision | Evidence / source | Meaning and qualification |
| --- | --- | --- |
| Backend-owned security and business enforcement | [ADR-006](NeoERP-BackEnd/docs/adr/ADR-006-backend-source-of-truth-for-security-and-business-rules.md) | Clients render effective authority; they do not grant permissions through UI state or supplied company IDs. |
| Keycloak authentication, auth-service brokering/token issuance, user-service RBAC | User-approved direction; [backend security rules](NeoERP-BackEnd/AGENTS.md); [Keycloak guide](NeoERP-BackEnd/infra/keycloak/README.md) | Hosted login and a provider-neutral broker coexist. ADR-002's password-facade details need amendment, not blind reuse. |
| Native-only client | User-accepted migration; app Gradle targets; [ADR-011](NeoERP-BackEnd/docs/adr/ADR-011-client-application-architecture.md) | Android/iOS/JVM are implemented. ADR-011 still says **Proposed**: reconcile formal status without treating web removal as unfinished. |
| One DI construction path with route-owned disposal | User-accepted shell work; [shell plan](NeoERP-App/docs/agents/shell-decomposition/plan.md), `NeoSmartContentArea.kt` | commonMain Koin plus the single routing boundary; retain `DisposableEffect`/`onCleared`. Do not restore deleted factories/containers. |
| Narrow state ownership | [App architecture](NeoERP-App/ARCHITECTURE.md), current session/enrollment code | Session, shell, preferences and enrollment have separate owners; UI renders state, handlers own transitions and validation. |
| Company-rooted Organization model | [Org model](NeoERP-App/docs/architecture/org-data-model.md), [Org structure](NeoERP-App/docs/architecture/org-feature-structure.md) | Company -> branches -> warehouses/stores, with company modules; reuse concepts without treating read objects as unrestricted write payloads. |
| Backend-owned enrollment operation | [Enrollment flow](NeoERP-BackEnd/docs/frontend/company-enrollment-wizard-flow.md), org enrollment code | Catalog + enrollment API, idempotency and structured conflicts; smaller APIs serve later daily management. Auth paragraphs in this flow are stale. |
| Tenant capability provenance and explicit query scoping | [ADR-012](NeoERP-BackEnd/docs/adr/ADR-012-tenant-query-isolation.md) | Trusted backend resolver issues scopes; caller IDs are inputs, not authority. Explicit, audited platform widening is separate. Migration is incomplete. |
| Bounded HR read fallback, not stale mutation authority | `ec44b27`, `041bffd`, `68e5d12`; HR authorization/cache code | Up to 30 seconds for eligible reads; absent tenant context denies; stale authority cannot authorize writes/approvals. This does not establish query isolation. |
| Franchise is a company, not a duplicate branch identity | [ADR-013](NeoERP-BackEnd/docs/adr/ADR-013-legal-entity-vs-operating-unit.md), [ADR-015](NeoERP-BackEnd/docs/adr/ADR-015-franchise-presentation-and-agreement-holder.md) | Separate tenant/ledger; a group site list can be a union read model. Reporting consolidation does not grant tenant access. |
| Company-owned roles | [ADR-014](NeoERP-BackEnd/docs/adr/ADR-014-company-scoped-roles.md) | Tenant roles are company-scoped; platform roles cannot be shadowed. New migration/implementation remains in the working tree. |
| Agreements and explicit entitlements, not plan tiers | [Design rules](NeoERP-Design/RULES.md), ADR-015, org agreement/entitlement code | Platform capabilities differ from commercial modules. `FINANCE` replaces the commercial `ACCOUNTS` code; permission prefixes are not thereby renamed. |
| Shared design tokens and accessible adaptive components | [Design-system source](NeoERP-Design/00-design-system/README.md), app design commits | Tokens -> styles/components -> screens. Prototype data and screenshots are not security or schema authority. |

ADRs 007-010 still say **Proposed**. Store-edge topology, offline fiscal/sync behavior and multi-country tax architecture are future directions, not delivered capabilities.
ADR-008's proposed store-edge window must not be used to justify broad stale server-side ALLOW. The implemented HR read policy has its own narrower boundary.

## 4. Current state

### Backend

- The committed baseline includes audience hardening, IAM/auth security work, HR fail-closed fixes, audit notification/issuer controls and tenant-isolation foundation. It is not "all backend security complete."
- The current tenant baseline is **126 unscoped methods across 29 tenant-owned repository interfaces**: Accounts 26/6, HR 61/14, Payroll 39/9 (methods/interfaces). Platform-reference and platform-wide counts in that inventory are zero.
- `TenantRepositoryArchitectureTest` imports only Accounts, HR and Payroll outbound packages. Other service repositories are outside that specific check; this is a coverage gap, not proof every one leaks data.
- Payroll's `PayrollTenantIsolationGateFilter` blocks its business API unless active profiles are nonempty and exclusively `local`/`test`. Default, production, and mixed profiles fail closed. Do not bypass this to make a UI demo work.
- Org agreements, amendments/addenda, entitlement chains and limit guards are implemented in dirty files. Branch/warehouse creation and membership creation now call capacity/seat guards. Presence of those calls does not prove concurrency safety or coverage of every provisioning path.
- Claude reports local, single-node verification with platform-admin and one tenant actor against the uncommitted tree. Retain that bounded claim as author-reported evidence, not independent reproduction or final acceptance; Git status entry totals are not necessarily file totals.
- Working migrations include org V10-V14 and user V14; source presence is not proof of application to every database. Commercial `FINANCE` naming and platform-capability separation require cross-service contract verification.
- ADR-015's `consolidates_into_parent` and `billing_mode` columns were not found in org migrations. Do not declare its whole decision implemented.
- Platform-super-admin management and lifecycle-based authority changes exist in the dirty tree. Historical docs saying the platform-authority path is read-only are no longer a reliable implementation description.

### App

- Organization model/presentation refactoring and dedicated enrollment state ownership are implemented. `EnrollmentStateMachine`, its handler and ViewModel exist; rerunning the original extraction is not next work.
- Shell decomposition and factory retirement were user-accepted. Routing resolves dependencies and disposes the five managed ViewModels; preserve lifecycle behavior when adding routes.
- Design-system tokens/components/fonts have landed. Adoption across all features and the newly supplied console designs is a separate acceptance question.
- Accounts/ESS honor mock mode; Reports stays mock; Profile/Inbox stay remote. Do not manufacture symmetry while doing unrelated work. Profile reads live session context; payroll context remains nullable.
- Browser login and legacy credential/recovery flows coexist visibly. The login screen still offers a native password form plus browser sign-in; it is not yet an exclusively hosted-credential experience.
- The entitlement feature currently has domain/data files but no presentation files in its feature directory. This is work in progress, not a completed console screen.
- Existing Organization/company-management and platform-aware shell UI must not be described as "no platform admin screens exist." The new design's complete console is not implemented either.
- Production logging policy is Disabled. Android release selects production; current JVM code accepts `neoerp.env` overrides and iOS selects by debug binary. Historical claims of universal compile-time local-profile exclusion are too strong.

### Design and verification boundary

- Canonical numbered design folders and the runnable `_prototype` serve different purposes; do not delete the latter as accidental duplication.
- Auth and platform-admin experiences are designed, but backend feedback records outstanding contract/model reconciliation. Realm-per-tenant assumptions do not describe the current single-realm configuration.
- No fresh build, authenticated acceptance suite, database history inspection or tenant-isolation runtime test was performed for this documentation draft. Read-only service health was checked; results belong in chat, not a release declaration here.
- Historical test counts and successful sign-in demonstrations do not verify today's entire dirty tree. A green health endpoint cannot close auth, authorization or provisioning findings.

## 5. What's next

**Current position: documentation reconciliation before accepting a single cross-project resume point.**

| Order / lane | Next action | Gate or dependency |
| --- | --- | --- |
| 1. Shared context | Claude reviews this draft; reconcile findings; user approves canonical state and document disposition. | No existing docs are retired until unique information is retained and links/versioning are resolved. |
| 2. Auth/security reconciliation | Refresh open auth findings, amend the stale architecture framing, agree cutover/session/identity details, then test native flows. | Existing browser/broker direction is not reopened as an either/or choice. Security changes still require reviewed scope. |
| 3. Tenant-isolation lane | Resume ADR-012's Accounts -> HR -> Payroll migration and plan the uncovered-service classification scope. | Payroll control remains. The 126-method allowlist is the migration backlog, not a passed commerce gate. |
| 4. Current console work | Reconcile the dirty agreements/entitlements slice and app data layer with design; name integration owners and review acceptance. | Do not infer authorization to expand commerce from an existing migration or a new mock module. Clarify overlap with ADR-012's gate. |
| 5. Organization acceptance | Exercise company-scoped navigation, modules, branches/warehouses, enrollment/replay/conflict/reset and list refresh using the current backend. | Auth path and contracts must be stable enough; test tenant admin as well as platform admin. |
| 6. Subsequent product work | Review branch requests, remaining console surfaces, agreement-aware enrollment, people, then isolated impersonation; HR/IAM/finance maturity remains separately scoped. | Candidate product sequence from current documents, not fresh approval. Impersonation needs its own security/audit design. |

The approved phase-0 security work does not authorize unrelated fixes in every service. New coverage/behavior work must receive its own bounded plan.
No live worker assignment is established by this file. Before parallel execution, name one integrator, exact write scopes, shared contract dependencies and the independent reviewer.

## 6. How to work here

Follow the existing [frontend pipeline](NeoERP-App/docs/agent-stage-pipeline.md) and [backend workflow](NeoERP-BackEnd/.codex/skills/neoerp-backend-workflow/SKILL.md), with repository-specific [frontend](NeoERP-App/AGENTS.md) and [backend](NeoERP-BackEnd/AGENTS.md) guides.
These pointers are not assertions that every sentence is reconciled; the drift items in section 8 must be resolved before canonicalization.
Keep detailed architecture in [frontend architecture](NeoERP-App/ARCHITECTURE.md), [backend standards](NeoERP-BackEnd/docs/architecture/architecture-and-standards.md), [database docs](NeoERP-BackEnd/docs/database/db-design.md), service API docs and ADRs.

**Proposed consolidation boundary:** one project-wide state, one shared process specification, thin tool adapters, local architecture/contracts/design, and one scoped plan per workstream.
The shared process covers stage definitions, Discovery/Plan separation, advisor decisions, bounded autopilot, independent review, final approval and integration ownership. It does **not** merge technical checklists: backend retains migration/tenant/query checks; frontend retains KMP/Compose/DI/lifecycle/accessibility checks. Both apply to cross-repo work. This draft does not replace those rules.
Durable decisions/plans belong in files; routine build output, verification replies and session narration belong in chat. Open unresolved findings may be retained with disposition, but not duplicated into a new report after every run.
Preserve consequential finding dispositions in the owning plan or ADR: accepted, fixed, pending, or rejected with evidence and rationale. Retiring transient reports must not erase why a plausible finding was disproved.
Approval to consolidate documentation is not approval to classify repositories, change login, run migrations, commit unrelated work or push.

## 7. Handoff: operational understanding to preserve

### Authentication and authority

```text
Native app -> system browser -> auth-service /oauth2/authorize
  -> upstream Keycloak login/required actions -> auth-service broker callback
  -> native callback -> auth-service /oauth2/token -> /api/app/bootstrap -> shell
```

That is the implemented browser path and agreed direction, not evidence that every required action or cancellation case passes.
Keycloak owns hosted credential interactions; auth-service remains issuer/broker; user-service owns application identities, memberships and effective permissions.
Company context and token role strings alone do not grant access. Read the current lifecycle/platform-authority filters and effective-IAM guards; a test injecting a role does not prove production grants it correctly.
The app's current token refresh uses the OAuth path while legacy logout/recovery paths remain. Reconcile the complete session lifecycle, not only the sign-in button.

### Open auth findings to carry forward, not silently close

| Finding | Current evidence / next verification |
| --- | --- |
| Broker-session logout/admin revocation alignment | Prior review compared facade session stores with SAS authorization storage; requires fresh backend/app lifecycle review and regression evidence. |
| Stable identity | `JwtCustomizerConfig.kt` still assigns broker subject from username. Decide immutable mapping/migration without breaking existing memberships. |
| Legacy credential/recovery cutover | `NeoLoginScreen.kt` and `LoginEventHandler.kt` retain both paths. Agree removal or explicit temporary restriction; do not add new password UI. |
| Callback state validation | `PkceAuthUseCases.kt` rejects a mismatched non-null state but accepts null. Record and test the required-state behavior; PKCE is not the same check. |
| Native browser lifecycle | iOS still assigns a temporary presentation provider and ignores `start()` return. Recheck dispatch/retention; Android dismissal/cancellation was a prior finding needing device verification. |
| Recoverable refresh failure | `NeoErpTokenRefresher.kt` clears tokens on unsuccessful refresh. Distinguish network outage from definitive revocation before declaring session recovery complete. |
| Hosted validation feedback | Prior review found suppressed shared errors without corresponding inline explanations in the theme; recheck the latest templates and interaction. |

For callback validation, the proposed NeoERP default is to reject missing or mismatched state because this flow generates and expects a transaction-bound state. No provider exception is evidenced. This is not proof of an exploitable CSRF attack: [RFC 9700 sections 2.1 and 4.7.1](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.7.1) permit reliance on correctly bound PKCE for CSRF protection when server support is ensured. Do not turn "PKCE never substitutes for state" into a project rule. Changes still need a focused security plan and regression tests.
Immutable identity is the security direction, not an equally safe choice between mutable usernames and stable IDs. The unresolved work is the authoritative identifier, compatibility/account linking, membership migration and rollback design; do not switch subjects blindly.

### Entitlement contract: current implementation, not final acceptance

- For the console, the current aggregate read is `GET /api/org/companies/{companyId}/entitlements/branches`; the company-only and single-branch reads remain separate. Use the actual controller/API contract, not the shortened prototype URL.
- Render server-resolved `effective` separately from `outsideAgreement`; extensions can be enabled outside the commercial agreement. Keep `inAgreementCount` and `extensionCount` distinct rather than recreating entitlement policy in the UI.
- At override-capable endpoints, `enabled: null` clears the stored override and restores inheritance; it is not false. This does not imply that every company's base module-setting endpoint accepts null.
- Entitlement writes require a reason. Company/branch module enabling outside the agreement additionally requires an amendment reference; feature overrides do not themselves extend the module ceiling. These statements describe current `EntitlementService`, not a universal rule for every agreement mutation.
- Mutations return re-resolved entitlements. Reuse the response instead of guessing the effective result from the switch value. Preserve the backend's conditional checks and review unresolved policy/authorization findings separately.

### Contracts and safe resumption

Use [API contracts](NeoERP-BackEnd/docs/api/README.md) plus the owning controller/DTO/mapper and tests. Backend frontend-brief files are not currently a trustworthy universal sign-in recipe.
Use `GET /api/org/modules/catalog` and `POST /api/org/companies/enroll` for the main enrollment path; preserve request keys and explicit server conflicts. Do not put `global`/`unassigned` into UUID resource routes.
Do not infer totals from unloaded nested lists or reuse the last selected tenant's data for another company. Permission visibility is UX, not an authorization boundary.
Read current callback registrations/platform manifests and environment selectors, not a URI or local host copied from an old chat.
No secrets, raw tokens, passwords, reset codes or seeded-user credentials belong in this state document. Use the existing restricted/local configuration workflow.

## 8. Contradictions and independent claim checks

| Claim / conflict | Finding and required disposition |
| --- | --- |
| 12/16 backend frontend docs prescribe password login | **Count confirmed as 12 files mentioning `/api/auth/login`; not every mention was classified as prescribing it.** Multiple entry points explicitly recommend it, contradicting current PKCE guidance and the coexistence UI. Amend contracts and cutover wording, do not delete useful flow details indiscriminately. |
| Accounts crossed the v1 lock | **Implementation exists; formal lock satisfaction is not established.** ADR-005 accepts accounts-service, V12 defines commercial FINANCE, while app v1 done criteria gate new domains. Record product-scope reconciliation and ADR-012's separate safety gate; code existence is not approval. |
| Roadmap phases 1-3 are fully delivered | **Overstatement.** DI/shell/enrollment ownership are delivered; auth/context/tenant acceptance gaps remain. Mark obsolete tasks, not entire broad phases complete without evidence. |
| "9 unreferenced planning docs" | **Refuted.** The list actually names 12 files. Name-reference scanning found incoming Markdown references for all five named planning docs; the seven existing sprint boards had none. Links can be stale, but these documents are not all orphaned. |
| Four backend services are outside tenant classification | **Coverage gap confirmed.** Imports/dependencies cover only Accounts/HR/Payroll. Count declarations, not files, under main-source `application/port/outbound`: org 7, user 16, audit 4, auth 6. Audit's `NotificationRepository.kt` declares two interfaces; auth's `SessionRevocationPorts.kt` declares two. These explain the review's 3/5 file counts. No current classification annotations were found in those four service source trees. |
| Brokered and hosted auth are mutually exclusive | **Incorrect framing** in the app auth-decision plan. The current `SecurityConfig` combines SAS endpoints and upstream `oauth2Login`; hosted Keycloak does not require abandoning the broker or adopting one realm per tenant. |
| All ADRs are settled | ADRs 007-011 still have Proposed headers. Native-only implementation/user acceptance and the narrower server cache decision do not silently approve every future edge/fiscal proposal. |
| Auth complete / no console UI / enrollment extraction still next | Competing state files overstate completion, ignore existing Org UI, or prescribe already-delivered refactors. Replace with scoped statuses in section 4, not another unconditional "done" list. |
| App DI rule only permits `*/di/*.kt` | Both reviewer-guide copies omit the accepted routing exception; current code and main guides include it. Do not remove working routing injection to satisfy a stale checklist. |
| Backend workflow parity | Codex skill contains Phase Autopilot; Claude copy lacks that section. Shared process must become one maintained source, with local adapters. |
| Files versus chat | Skills still request `review.md`/`improvements.md`; app agents README both discourages transient reports and adds per-task handoffs. Reconcile to the user's durable-only policy. |
| References and storage | Root `PROJECT-STATE.md` is absent; root guides point to it. Claude reports deleting it and introducing those pointers during consolidation. Freeze/single-integrator discipline must prevent another deletion before replacement approval. Some app relative links are wrong; backend index has machine-specific links. Fix after approval, with a link check. |
| Limits "not enforced" | Agreements review plan predates current branch/warehouse/membership guard calls. Update disposition, but do not replace it with an unverified claim that all bypass/concurrency cases are closed. |

The missing canonical root file is a consolidation interruption, not evidence that Claude's draft is already authoritative. Do not restore or replace it implicitly.

## 9. Traps already hit

- Tests that stub another service can miss module-code, identity, scope or response-shape drift. Verify the boundary and tenant actor, not only a platform-super-admin happy path.
- Authorization answers whether an actor may act; the query must still constrain which tenant's rows it reads or writes. A health check or a scope argument alone proves neither.
- Capability provenance matters: private implementations/constructors and no copying/deserialization bypass, plus adapter-level two-tenant tests. Signature scanning is only part of the proof.
- Applied Flyway migrations are immutable, including comments. New checksums can break startup even when SQL behavior is unchanged. Do not repair/clean a database as a documentation fix.
- New ORM rows are not automatically updates; replacement semantics, uniqueness and retries must be tested. Do not "fix" module entitlement duplication by changing a user's enabled flag.
- Test doubles must enforce relevant persistence constraints, and HTTP round-trips must cover DTO-to-command mapping; pure service tests can miss both a unique-constraint failure and a silently dropped request field.
- ViewModel construction does not guarantee disposal; preserve lifetime management. A buffered UI effect is not durable completion when no collector exists; test recovery from authoritative state.
- Source-set defaults and runtime overrides are different guarantees. Composite dependency success on one laptop is not remote publication or CI readiness.
- A fresh-looking timestamp can decorate stale prose. Re-read code, committed history and dirty changes before claiming progress or assigning an already-completed refactor.

## Appendix: coverage and proposed document disposition

This is a **disposition proposal**, not a deletion list. Paths below are relative to the stated root.
Depth: **R** = relevant content read (this pass or preceding review in this conversation); **I** = inventory/title/status/reference inspection only. I does not mean full-content review or approval to retire.
Detailed contracts and rules are deliberately excluded from the state body because their owners should retain them. Every family named below must have unique decisions extracted before archival; wildcard families denote the inspected current inventory, not future files.

| Root / documents | Depth | Proposed treatment and reason |
| --- | --- | --- |
| Workspace: `CLAUDE.md`, `.codex/CODEX.md` | R | Keep as thin routing adapters; fix missing canonical pointer after approval and remove repeated process/current-state prose. |
| Workspace: deleted `PROJECT-STATE.md` | R (prior) | Use prior inspected content only as historical input; recreate canonical state only from the approved reconciliation. |
| Workspace: `docs/CONSOLIDATION-BRIEF.md` | R | Temporary consolidation scope; preserve any approved document-placement decision, then retire the task-specific brief. |
| Workspace: `PROJECT-STATE.claude.md` | R (reconciliation) | Retain source-checked entitlement details and useful traps; reject overstated completion/orphan claims per review. Its short handoff cannot supersede all sixteen detailed integration documents. Retire proposals after one accepted result. |
| Workspace: `docs/CONSOLIDATION-PROPOSAL-CLAUDE.md` | I | Separate proposal, not authority; full content remains to be checked before disposition. |
| Workspace: `SETUP-NEW-MACHINE.md` | I | Keep separate operational guide; verify it distributes shared docs and library dependencies. No setup detail copied into state. |
| App: `HANDOFF.md`, `docs/PROJECT-STATE.md`, `docs/agents/app-handoff.md` | R | Merge verified state; move unique decisions to architecture/ADRs; retire competing project-wide handoffs, including Codex's own. |
| App: `AGENTS.md`, `.claude/CLAUDE.md`, `.codex/CODEX.md`, `README.md` | R | Keep entry points, architecture pointers and run instructions; eliminate multiple "read first" state sources. |
| App: `ARCHITECTURE.md`, `APP-DOCUMENTATION.md`, `docs/enterprise-architecture.md`, `docs/v1-architecture.md` | R | Keep architecture outside state; reconcile overlapping baseline descriptions. Product lock is not discarded as stale merely because more code exists. |
| App: `docs/master-roadmap.md`, `docs/parallel-delivery-plan.md`, `docs/v1-module-scope.md`, `docs/v1-done-criteria.md` | R | Retain requirements/criteria; merge current priorities into state, preserve future scope in the relevant plan. Update references before any archival. |
| App: `docs/sprint-1-board.md`, `sprint-3-board.md`, `sprint-4-board.md`, `sprint-5-board.md`, `sprint-6-board.md`, `sprint-7-board.md`, `sprint-8-board.md` (all under `docs/`) | I + focused R | Historical sprint state; candidate archive after checking uncompleted items. No sprint-2 board was found. |
| App: `docs/agent-stage-pipeline.md`, `docs/delivery-pipeline.md`, `docs/agent-hierarchy.md`, `docs/agent-ownership.md` | R | Process/ownership, not state. Reconcile into shared workflow plus repo-specific ownership; do not copy all rules into this file. |
| App: `docs/architect-checklist.md`, `review-checklist.md`, `definition-of-done.md`, `folder-structure.md`, `toolchain-constraints.md`, `feature-request-template.md` (under `docs/`) | I | Preserve focused rules/reference pending content reconciliation; explicitly not approved for deletion. |
| App: both tools' workflow `SKILL.md`, `references/project-context.md`, `references/stage-roles.md`, `references/reviewer-guide.md` | R | Shared process with thin adapters; keep platform-specific checks. Remove copied live priorities and reconcile DI/artifact drift. |
| App: `.codex/agents/`, `.claude/agents/`, `.claude/commands/` Markdown files | I + focused R | Keep tool entry/role schemas, not separate policy. Some Codex references are ignored/local: do not rely on their presence on a fresh clone. |
| App: `docs/architecture/org-data-model.md`, `org-feature-structure.md` | R | Retain owning domain/feature references; summarize only boundaries in state. |
| App: agents `auth-architecture-decision/plan.md`, `login-auth/plan.md` | R | Retain useful discovery, correct stale false dichotomy and current stage; neither is authority to delete PKCE or finish native password UI. |
| App: agents `shell-decomposition/plan.md`, `native-only-di-collapse/handoff.md`, `enrollment-state-ownership/plan.md`, `enrollment-state-ownership/phase3-discovery.md` | R | Preserve historical decisions; reconcile delivered scope and remaining acceptance instead of restarting original stages. |
| App: agents `org-architecture-compliance/plan.md`, `org-presentation-decomposition/plan.md`, `design-system-retokenization/plan.md`, `design-system-completion/handoff.md` | R | Preserve approved architecture/acceptance boundaries; consolidate milestone state and distinguish outstanding runtime checks. |
| App: agents `foundation-lock/plan.md`, `remove-enterprise-container/plan.md`, `workflow-consolidation/plan.md`, `enrollment-idempotency/phase1-discovery.md` | I + earlier focused R | Historical foundation/workflow rationale; inspect unresolved decisions before marking superseded. |
| App: agents `org-model-refactor/`, `org-company-tree-refactor/`, `org-model-naming-refactor/`, `org-nested-ui-refactor/` (`plan.md`, `review.md` in each) | I + earlier focused R | Retain design rationale and approved naming/model boundaries; no additional model rewrite authorized here. |
| App: remaining agents `review.md`, `improvements.md`, `engineer-summary.md`, `native-only-di-collapse/verification-report.md`; `docs/agents/README.md` | I, README R | Extract unresolved findings/decisions before retiring transient reports; README becomes an index, not a second current-status hub. |
| App: `docs/design/neoerp-design-system-architecture.md`, `super-admin-design-prompt.md`, `token-audit-for-designer.md`, `neoerp-component-build-checklist.md` | I | Compare with canonical sibling design before any archival; preserve unique accepted accessibility decisions. |
| Backend: `AGENTS.md`, `.codex/CODEX.md`, `.claude/CLAUDE.md`, both workflow skills/references | R + parity inspection | Keep service-specific rules; unify shared process, preserve current authority ownership, remove copied priorities. |
| Backend: `docs/index.md`, `APPLICATION_DEVELOPMENT_GUIDE.md`, `CODE_REVIEW.md` | R | Index/how-to/historical review are distinct; correct current-state assurances, preserve unresolved findings, use portable links. |
| Backend: `docs/architecture/architecture-and-standards.md`, `data-flow.md`, `platform-client-plan.md`, `docs/database/db-design.md`, `docs/requirements/SRS.md` | I + focused R | Keep architecture/schema/requirements separate. Consolidation is not approval to implement platform-client or change requirements. |
| Backend: `docs/frontend/FRONTEND_AGENT_PROMPT.md`, `frontend-agent-start-here.md`, `frontend-agent-brief.md`, `frontend-handoff.md`, `frontend-final-handoff.md`, `backend-readiness-status.md` | R | One integration entry point; extract unique contract guidance and remove duplicated/obsolete status and sign-in recipes. |
| Backend: `docs/frontend/auth-flow.md`, `company-enrollment-wizard-flow.md`, `company-enrollment-wizard-ui-checklist.md`, `company-enrollment-wizard-mocks.md`, `screen-api-checklist.md` | R | Keep focused contract/scenario material, reconcile auth and agreements changes. Do not merge all endpoint examples into state. |
| Backend: `docs/frontend/backend-frontend-requirements.md`, `frontend-agent-do-not-assume.md`, `identity-provisioning-phase.md`, `frontend-release-pack.md`, `release-readiness-checklist.md` | I + focused R | Preserve unmet requirements/security constraints; consolidate repetitive entry/release instructions without asserting release readiness. |
| Backend: `docs/post-release-backlog.md` | R | Future maturity backlog; remove blanket "not blockers"/"complete" claims contradicted by new security gates. |
| Backend: agents `iam-auth-security-foundation/status.md`, `plan.md`; `agreements-entitlements-review/plan.md`, `review.md` | R + focused R | Preserve security/contract rationale and unresolved findings; move project-level next-work into canonical state. Existing status is historical, not global security closure. |
| Backend: agents `security-audit/auth-service.md`, `user-service.md`, `gateway-operational-hardening/plan.md` | I + prior focused R | Retain audit scope/findings and proposed operations plan; do not infer deferred work has been delivered. |
| Backend: `docs/adr/ADR-001` through `ADR-015` (all existing Markdown records) | R decision/status sections; focused full R | Keep ADRs in place. Amend/supersede explicitly where needed; never flatten Proposed into Accepted. |
| Backend: `docs/api/README.md`, `auth.md`, `org.md`, `user-iam.md`, `platform.md`, `hrms.md`, `payroll.md`, `accounts.md` | I + focused R | Preserve service-owned detailed contracts; this draft is not a complete endpoint audit. |
| Backend: `services/org-service/README.md`, user-service `README.md` and `User_Service_README.md`, `infra/keycloak/README.md` | I + focused R | Keep service/operations knowledge; reconcile duplicate user-service manuals and stale "RBAC planned" wording. |
| Backend: `docs/postman/README.md`, `docs/dev-seed-users.md`, service `HELP.md` files; remaining agent/command Markdown | I | Tooling/setup/reference, not project state; no credentials or generated collection bodies copied. |
| Design: `README.md`, `RULES.md`, `BACKEND-FEEDBACK.md`, `00-design-system/README.md`, `01-auth/README.md`, `02-platform-admin/README.md` | R | Keep intended experience/tokens and feedback distinct; record reconciliation dispositions rather than treating feedback as automatic implementation approval. |

Unlisted source files were inspected only to substantiate specific claims above; this is not a whole-codebase audit. Inventory-only documents need content review before any irreversible disposition.
Acceptance for consolidation: one versioned resume point, working startup links, no conflicting priority/rule copies, retained decision provenance, explicit unresolved gates, and agreement between both reviewers on the disposition map.
