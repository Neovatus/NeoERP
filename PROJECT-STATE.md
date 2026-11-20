# NeoERP project state: canonical active-workstream index

The user approved the factual content of PROJECT-STATE.codex.md on **2026-09-06**.
The user approved the three-file split and placement on **2026-09-06**.
This is the canonical active-workstream index.
It follows [WORKFLOW.md](WORKFLOW.md); recording the user-approved ownership model does not approve engineering.
Baseline revisions: App `73136f3`; backend `7584040`. Both repositories have substantial
uncommitted changes: these revisions alone do not identify the reviewed implementation.

## Active workstreams

Owning-plan choices remain proposals. Existing plans need their stale checkpoints
reconciled before use; their historical stage labels do not override this gate.
The user confirmed the corrected mapping on **2026-09-06**: Jabran, Codex,
Claude Code and Design contribute to every workstream; Jabran is the integration
owner for all of them. This supersedes the earlier per-lane assignments.
AUTH-01 closed on **2026-09-15** and PLAT-01 was opened to carry the platform
admin and dashboard work, so the index now lists five workstreams.

| ID | Workstream / current position | Proposed owning plan | Contributors | Integration owner | Major blocker / dependency | Next approved work |
| --- | --- | --- | --- | --- | --- | --- |
| ENT-01 | Agreements/entitlements console: backend slice and app data layer implemented; console and cross-repo acceptance incomplete. | [Agreements/entitlements plan](NeoERP-BackEnd/docs/agents/agreements-entitlements-review/plan.md); propose extending its reviewed scope to own cross-repo console reconciliation. | Jabran, Codex, Claude Code, Design | Jabran | Dirty implementations; unresolved contract/limit/acceptance findings; ADR-012 commerce gate. | None newly approved. Proposed next: reconcile the existing review checkpoint and cross-repo acceptance scope; obtain plan approval before engineering. |
| TEN-01 | ADR-012 tenant isolation migration: foundation exists; **126 methods across 29 interfaces remain**. | [Security foundation plan](NeoERP-BackEnd/docs/agents/iam-auth-security-foundation/plan.md), proposed owning checkpoint for the [ADR-012 migration sequence](NeoERP-BackEnd/docs/adr/ADR-012-tenant-query-isolation.md); not a restart of delivered foundation work. | Jabran, Codex, Claude Code, Design | Jabran | Query-isolation backlog and uncovered-service classification scope; Payroll compensating control must remain; allowlist must be empty before commerce. | None newly approved. Proposed next: reconcile the migration checkpoint and confirm the next bounded Accounts -> HR -> Payroll scope before implementation. |
| AUTH-01 | **Complete and accepted live on 2026-09-15.** Hosted Keycloak login, stable identity mapping, refresh rotation, invitations, recovery and full sign-out all pass live acceptance; the designed Keycloak screens render and their states were reviewed against NeoERP-Design. | [Auth plan](NeoERP-App/docs/agents/auth-architecture-decision/plan.md) — now the accepted record, including the decisions below. | Jabran, Codex, Claude Code, Design | Jabran | None open. Prior blockers cleared: the null-state acceptance is fixed, and sign-out now ends device tokens, Keycloak sessions and the broker's own browser session. Evidence remains tied to uncommitted trees. | Complete; no further auth work approved. Follow-on carried by PLAT-01: a native NeoERP Security screen replacing the Keycloak account console, using `kc_action` for hosted credential capture and the Account REST API for everything else. |
| PLAT-01 | Platform admin and dashboard: **not started.** The platform dashboard is entirely mocked and no backend endpoint exists for it; the Companies/organization surface is implemented and renders live data. | To be created during Discovery by the assigned lead; scope proposed as Companies/organization acceptance first, then the dashboard on real data. | Jabran, Codex, Claude Code, Design | Jabran | The dashboard aggregates companies, entitlements, requests and audit, so it depends on ORG-01 and ENT-01 being accepted; building it first would mean mocks or throwaway aggregation. | None newly approved. Proposed next: agree the Companies/organization acceptance scope with ORG-01, then define the dashboard's backing contract. Carries the deferred Security screen and the designed Admins "Enforce 2FA" control. |
| ORG-01 | Organization acceptance: model, presentation and enrollment state ownership implemented; current cross-tenant/runtime acceptance still open. | [Enrollment/Organization acceptance candidate plan](NeoERP-App/docs/agents/enrollment-state-ownership/plan.md); reconcile delivered extraction and propose acceptance-only scope rather than rerunning refactoring. | Jabran, Codex, Claude Code, Design | Jabran | Stable auth and entitlement contracts; current dirty trees; tenant-admin and platform-admin acceptance outstanding. | None newly approved. Proposed next: agree current-backend acceptance scope after AUTH-01/ENT-01 dependencies are bounded; no runtime test execution authorized by this split. |

The integration owner is the WORKFLOW.md record editor and tie-breaker, not a claim about contribution, expertise or effort. Anyone may work any lane; only the integration owner edits the shared index and resolves ownership collisions.

Equal contribution does not permit silently taking over another agent's in-flight
task or concurrently editing the same plan without coordination; WORKFLOW.md's
single-writer and explicit-handoff rules remain in force.

## Shared blockers and pickup

- **Uncommitted trees in both code repositories** block reproducible cross-repo acceptance; inspect relevant changes and coordinate ownership, never automatically discard or commit them.
- **Missing workspace/design versioning** blocks versioned distribution and document disposition, not the approved canonical designation. Both folders remain outside Git; choosing a versioned home and any moves require separate approval.
- **Shared contributors and integration ownership are confirmed; engineering remains unapproved.** Jabran integrates every workstream; all four participants can contribute to every lane. This correction authorizes recording that model only. Approving factual state is not permission to change login, run migrations, implement, commit or push.
- **Auth is no longer a dependency.** AUTH-01 closed on 2026-09-15, so the "stable auth contract" ORG-01 waits on is settled: identity is an immutable Keycloak subject mapped to a stable `neoerp_identity_id`, ERP authority comes only from user-service, and sign-out ends every session layer. Entitlement contracts (ENT-01) remain outstanding.

Read the owning plan and repository rules on pickup. Read the dated
[approved factual reference](docs/reconciliation-2026-09-06.md) on demand, not on
every task start. Document-placement work belongs to the
[consolidation plan](docs/agents/documentation-consolidation/plan.md), not this index.
