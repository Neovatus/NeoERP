# NeoERP: all-agent entry point

Codex, Claude and other agents must follow [WORKFLOW.md](WORKFLOW.md), including
reading shared state on pickup and maintaining the owned task checkpoint at every
stage boundary. Do not wait for the user to request progress recording.

Choose the owning guide: [frontend](NeoERP-App/AGENTS.md) or
[backend](NeoERP-BackEnd/AGENTS.md); for UI work read [the design principles](docs/handover/design-principles.md) and [ux-principles](NeoERP-App/docs/design/ux-principles.md).
Repository skills retain their technical gates. Shared process and record ownership
come from WORKFLOW.md, not duplicated tool-specific instructions.

Read the canonical [PROJECT-STATE.md](PROJECT-STATE.md) on every task pickup.
It is the one current state file; the `.claude`/`.codex` copies were deprecated on
2026-11-20 (history only). The lead updates it at the end of every batch. Read the
[dated factual reference](docs/reconciliation-2026-09-06.md) on demand, not on every pickup.
State approval does not authorize implementation, login changes or migrations;
each workstream needs its owning checkpoint reconciled and scope separately approved.
Do not create a Git repository, retire documents or commit without applicable
authorization. Builders never push; the lead pushes verified commits (WORKFLOW.md). Do not change another agent's code or task ownership implicitly.
