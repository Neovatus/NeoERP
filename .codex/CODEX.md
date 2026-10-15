# NeoERP Workspace Guide

Read this first when working from the umbrella `NeoERP/` folder.

## Project state — read this first

Read [the all-agent entry point](../AGENTS.md) and
[WORKFLOW.md](../WORKFLOW.md) before starting or resuming. Reading state and
maintaining the owned task checkpoint are mandatory, without user reminders.
The shared workflow owns record locations, stage updates, lead/worker coordination,
approval rules and the temporary procedure while canonical project state is missing.

## Workspace shape

This folder contains two code repositories and the workspace docs:

- `NeoERP-App` - Kotlin Multiplatform + Compose frontend client
- `NeoERP-BackEnd` - Kotlin multi-service backend
- `docs/domain/` - the domain model (`RULES.md`, flows); all design lives in `NeoERP-App/docs/design/`

The umbrella folder is a workspace, not the main source of truth for architecture decisions.

## Routing rule

Choose the working root based on the task:

### Frontend work

Use `NeoERP-App` for:

- Compose UI and navigation
- KMM shared state and DI
- Android, iOS and JVM desktop client behavior
- frontend auth/session/bootstrap consumption

Primary local guide:

- `NeoERP-App/.codex/CODEX.md`
- `NeoERP-App/.codex/skills/neoerp-workflow/SKILL.md` for non-trivial work

### Backend work

Use `NeoERP-BackEnd` for:

- API design and contracts
- auth, RBAC, membership, and bootstrap payloads
- business services and persistence
- gateway routing and local infra

Primary local guide:

- `NeoERP-BackEnd/.codex/CODEX.md`
- `NeoERP-BackEnd/.codex/skills/neoerp-backend-workflow/SKILL.md` for non-trivial work

### Design work — read `NeoERP-App/docs/design/` and `docs/domain/`

**Where design and domain live (Jabran, 2026-10-15):**

| Home | Holds |
|---|---|
| `NeoERP-App/docs/design/` (frontend repo) | **All design**: `screen-rig/` (the clickable rig for every module), `specs/` (module screen specs, shared component contracts, `building-blocks.md`), `design-system/` (`neoerp-tokens.json`, the design-system pages and their assets), `notes/` (screen notes such as Keycloak sign-in). New and changed screens are committed with the code that implements them. |
| `docs/domain/` (this workspace repo) | **The domain model**: `RULES.md`, `FLOWS.md`, `flows.json`, `IMPLEMENTATION-READINESS.md`. |

There is no `NeoERP-Design` folder any more; its contents moved to the two homes above. List the directories rather than assuming which files exist.

Read `docs/domain/RULES.md` first. It is the domain model, not only UI guidance:
section 3 (entitlement chain), section 7 (three independent financial flags) and
section 8 (a franchise can hold its own agreement) are schema decisions. Screens
built without those rules come out pixel-accurate and rule-wrong.

`NeoERP-App/docs/design/design-system/neoerp-tokens.json` is authoritative for every
design value; `styles.css` derives from it, never the reverse.

## Shared stage process

Both repositories use the same process:

```text
Architecture Discovery -> Architecture Plan -> Advisor Gate 1 -> Engineer
  -> Advisor Gate 2 -> Reviewer -> Advisor Gate 3 -> Improver
  -> focused independent re-review -> Final Approval Gate
  -> Delivery (focused commits + explicitly requested push) -> Done
```

Every stage uses its senior role and mandatory Zoom-Out Scan. Final Approval
always pauses. Documentation, verification, and independent re-review must be
complete before Final Approval; Delivery cannot modify the approved artifact.

## Cross-repo changes

If a task touches both repos:

1. Run one joint Architecture Discovery and Architecture Plan covering the end-to-end flow.
2. Treat backend contracts as the source of truth for security, permissions, and business rules.
3. Update the backend first when the API or payload shape must change.
4. Update the frontend to consume the final reviewed contract.
5. Integrate and review both repository diffs together at each applicable gate.
6. Reach one Final Approval before either repository enters Delivery.
7. Create separate focused commit plans and hashes per repository.
8. Push only when explicitly requested, naming each branch and remote.

## Practical rule of thumb

- If the task starts with "screen", "state", "viewmodel", or "Compose", move into `NeoERP-App`.
- If the task starts with "endpoint", "service", "JWT", "RBAC", "Flyway", or "database", move into `NeoERP-BackEnd`.
- If the task mentions a screen design, tokens, or a handoff, read `NeoERP-App/docs/design/` and `docs/domain/RULES.md` before choosing a repo.
- If the task mentions bootstrap, login, permissions, or module enablement, expect both repos to be relevant.
