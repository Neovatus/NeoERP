# Plan: documentation consolidation

## Checkpoint

| Field | Current record |
| --- | --- |
| Task / objective | DOC-01: split the reconciled baseline into a short workstream index, a dated reference and this disposition plan without information loss. |
| Scope / ownership | Workspace documentation only. Codex applies this user-requested documentation correction. Confirmed 2026-09-06 for ENT-01, TEN-01, AUTH-01 and ORG-01 alike: contributors = Jabran, Codex, Claude Code, Design; integration owner = Jabran. This is record-editing/tie-break responsibility, not specialisation or exclusive contribution. |
| Allowed writes | Acceptance checkpoint maintenance in this plan only. Promotion and ownership corrections are complete; no further document changes or disposition are authorized by this acceptance. |
| Stage / status | Canonical documentation consolidation and ownership correction accepted on 2026-09-06, including the reported independent pointer/link re-check. This scope is complete; subsequent document disposition remains blocked on the workspace/design versioning decision and separate approval. |
| Approval | User approved the factual baseline, independent information-loss review, split and placement on 2026-09-06, and authorized promotion plus the two pointer updates. The user's corrected mapping confirms all four participants as contributors to every workstream and Jabran as integration owner throughout, superseding the earlier per-lane assignments. Recording this correction is approved. No approval to implement product work, alter login, run migrations, commit, push, initialize repositories or retire documents. |
| Progress | Canonical index contains four active workstreams and plan candidates, with Jabran, Codex, Claude Code and Design as contributors on every row and Jabran as integration owner on every row. Every workstream retains "None newly approved". Reference retains source sections 3, 4, 7, 8 and 9. Original disposition appendix retained below. Root startup pointers now identify the canonical index and on-demand reference. |
| Evidence / limits | Approved source: `PROJECT-STATE.codex.md`, App baseline `73136f3`, backend baseline `7584040`, both with substantial uncommitted changes. User supplied the accepted independent review confirming section fidelity, all disposition rows, ownership distinctions, in-flight safeguards and resolving startup links. This is documentation acceptance, not renewed code, build, service or database verification. |
| Pending findings | Missing workspace/design versioning; stale checkpoints in candidate owning plans; incomplete content review for I-depth families. Security and acceptance blockers remain in the canonical index. The two root startup contradictions are corrected; historical reference text is not rewritten. |
| Resume point | Await Jabran's workspace/design versioning decision. The independent re-check and corrected shared-contributor/Jabran-integration mapping are accepted. All four workstreams remain "None newly approved"; no moves, retirement or downstream engineering may proceed. |

## Placement and preservation decisions

- [Canonical PROJECT-STATE.md](../../../PROJECT-STATE.md) is only the active-workstream index required by [WORKFLOW.md](../../../WORKFLOW.md). It links owning-plan candidates rather than copying their checklists.
- [Dated factual reference](../../reconciliation-2026-09-06.md) preserves sections 3, 4, 7, 8 and 9 of the [source proposal](../../../PROJECT-STATE.codex.md), with their citations. Read it on demand.
- The appendix below is the consolidation work list, not standing project state. Its treatments are proposals, never permission to archive.
- Both agents' source proposals remain untouched. Promotion updates only the five authorized documentation files; it does not move, rename or delete any document.
- Source sections 1, 2, 5 and 6 remain available in the untouched source. Their product description, location map, candidate future sequence and rule pointers are not silently retired; review unique information before any later disposition. The new index is not approval of the source's proposed future sequence.
- Only the requested ADR range correction and mechanical citation-link rebasing change the extracted sections. The header now records both factual and placement approval. No volatile dirty-file totals are introduced; baseline revisions and dirty-tree warnings remain.
- The copied appendix describes the original inspection, including the previously deleted root state file and earlier adapter conditions. Canonical designation does not turn those historical descriptions into current instructions or completed dispositions.

## Review and delivery gates

1. Completed: the user accepted Claude's independent section/citation and information-loss review and the follow-up promotion/ownership pointer/link check. The factual sections and all 39 disposition rows are preserved. Review results remain in chat rather than another report file.
2. Completed for split/placement and corrected ownership mapping: user approval dated 2026-09-06. Contributors on every workstream: Jabran, Codex, Claude Code, Design. Integration owner on every workstream: Jabran. This supersedes the earlier per-lane mapping; integration is WORKFLOW.md record-editing and tie-break responsibility, not contribution, expertise or effort. Anyone may work any lane; only Jabran edits the shared index and resolves ownership collisions. No agent may silently take over another's in-flight task or concurrently edit its plan without coordination. Execution remains gated on checkpoint reconciliation and separate scope approval.
3. Resolve workspace and design versioning and checkout distribution under separate approval. Neither folder is a Git repository; no document moves or retirement before that is resolved and approved.
4. Before any irreversible disposition, perform content review for every **I-depth** family, including mixed `I + focused R` families' unread material. Record retained decisions, unresolved findings and destination links here. An inventory is not evidence that a document has no unique content.
5. Completed for the two root workflow/startup pointers and their accepted independent link check. Reconciliation of candidate owning-plan checkpoints remains separately gated, as does engineering scope approval. Do not silently mark an old planned refactor pending when it is already implemented.
6. Keep durable finding dispositions: accepted, fixed, pending or rejected with evidence and rationale. Every retirement proposal must preserve unique information and obtain approval; no deletions are pre-authorized.
7. Stop at final approval. Commit/push and any repository initialization need their own authorization; the current request grants none.

## Open findings that cannot become closed history

- AUTH-01 retains the mutable broker subject and null-state callback acceptance, plus the other unresolved lifecycle/cutover findings in the reference.
- TEN-01 retains the 126-method ADR-012 backlog and Payroll control; approving this baseline does not approve commerce or waive the isolation gate.
- ENT-01 and ORG-01 retain their contract, dirty-tree and acceptance dependencies.
- Both repositories' uncommitted work and missing workspace/design versioning remain shared blockers in the index.
- The stale `AGENTS.md` pending-approval pointer and `WORKFLOW.md` temporary-state procedure are corrected by this promotion. This closes those two documentation contradictions only, not the security, versioning or engineering gates.

## Disposition work list: retained source appendix

The following appendix is copied verbatim from the approved factual proposal.
Its historical wording is retained for the information-loss review; no treatment
has been executed by creating these three files.

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
