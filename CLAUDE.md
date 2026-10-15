# NeoERP Workspace Guide (Claude)

Read this first when working from the umbrella `NeoERP/` folder.

> This is the Claude counterpart to `.codex/CODEX.md`. Both tools follow the
> same rules. The per-repo guides and `docs/` are the source of truth — keep
> changes there, not duplicated here.

## Project state — read this first

Read [the all-agent entry point](AGENTS.md) and [WORKFLOW.md](WORKFLOW.md)
before starting or resuming. Reading state and maintaining the owned task
checkpoint are mandatory, without user reminders. The shared workflow owns
record locations, stage updates, lead/worker coordination, approval rules and
the temporary procedure while canonical project state is missing.

## Workspace shape

This folder contains two code repositories and the design source:

- `NeoERP-App` — Kotlin Multiplatform + Compose Multiplatform frontend client
- `NeoERP-BackEnd` — Kotlin + Spring Boot multi-service backend
- `NeoERP-Design` — the design source of truth (tokens, screens, domain rules)

The umbrella folder is a workspace, not the source of truth for architecture
decisions. That lives inside each repo.

## Routing rule

Choose the working root based on the task.

### Frontend work — use `NeoERP-App`

For Compose UI and navigation, KMP shared state and DI, Android/iOS/JVM desktop
client behavior, and frontend auth/session/bootstrap consumption.

Primary local guide: `NeoERP-App/.claude/CLAUDE.md`

### Backend work — use `NeoERP-BackEnd`

For API design and contracts, auth/RBAC/membership/bootstrap payloads, business
services and persistence, gateway routing, and local infra.

Primary local guide: `NeoERP-BackEnd/.claude/CLAUDE.md`
(shared rules: `NeoERP-BackEnd/AGENTS.md`)

### Design work — read `NeoERP-Design`

Designs live here permanently and are added as new numbered folders, so read them
in place — never ask for a handoff to be uploaded. List the directory rather than
assuming which folders exist.

**Where design lives (Jabran, 2026-10-15, option A):**

| Home | Holds | Changes |
|---|---|---|
| `NeoERP-Design/` (workspace repo) | `RULES.md` (domain model), `00-design-system/neoerp-tokens.json` (every design value), and designer handoffs as numbered folders (`01-auth`, `02-platform-admin`, …) | Rarely: rules, tokens, new handoffs |
| `NeoERP-App/docs/design/` (frontend repo) | `screen-rig/` (the clickable rig for every module) and `specs/` (module screen specs, shared component contracts, `building-blocks.md`) | **All module design work.** New and changed screens go here, committed with the code that implements them |

Never design new module screens in `NeoERP-Design/`. `NeoERP-Design/_prototype` is an old rig copy, not maintained and not in the repo.

Read `NeoERP-Design/RULES.md` **first**. It is the domain model, not only UI
guidance: §3 (entitlement chain), §7 (three independent financial flags) and §8
(a franchise can hold its own agreement) are schema decisions. Screens without
those rules get built pixel-accurate and rule-wrong.

`NeoERP-Design/00-design-system/neoerp-tokens.json` is authoritative for every
design value; `styles.css` derives from it, never the reverse.

## Cross-repo changes

If a task touches both repos:

1. Treat backend contracts as the source of truth for security, permissions,
   and business rules.
2. Update the backend first when the API or payload shape must change.
3. Update the frontend to consume the final contract.
4. Record assumptions in the task summary so the other repo is easy to align.

## Practical rule of thumb

- "screen", "state", "viewmodel", or "Compose" → move into `NeoERP-App`.
- "endpoint", "service", "JWT", "RBAC", "Flyway", or "database" → move into `NeoERP-BackEnd`.
- "bootstrap", "login", "permissions", or "module enablement" → expect both repos to be relevant.

## Claude / Codex parity

Each repo carries a matching pair of tool guides over one shared rule set:

| Repo | Claude entry | Codex entry | Shared source of truth |
|------|--------------|-------------|------------------------|
| Workspace | `CLAUDE.md` (this file) | `.codex/CODEX.md` | — |
| `NeoERP-App` | `.claude/CLAUDE.md` | `.codex/CODEX.md` | `ARCHITECTURE.md`, `docs/` |
| `NeoERP-BackEnd` | `.claude/CLAUDE.md` | `.codex/CODEX.md` | `AGENTS.md`, `docs/` |
| `NeoERP-Design` | — | — | `RULES.md`, `00-design-system/neoerp-tokens.json` |

When a rule changes, edit the shared source (per-repo `AGENTS.md` / `ARCHITECTURE.md`
and `docs/`) so both tools stay aligned. The `CLAUDE.md` / `CODEX.md` files stay
thin and point back to it.
