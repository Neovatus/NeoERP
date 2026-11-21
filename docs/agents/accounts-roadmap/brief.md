# Accounts roadmap draft (brief)

Asked by Jabran 2026-11-21 (batch 2). An Opus draft for Jabran to decide; it approves nothing by itself.

**Worktree:** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/roadmap` (workspace repo), branch `phase/4-b2-roadmap` (from `master`).
Check the branch before editing. Never touch `/Users/jabransiddiqui/Offices/Neovatus/NeoERP` (the workspace checkout).

## Goal
One page that places every Accounts spec and every backlog Phase 5 / 5b item into phases, with dependencies, so Jabran
can approve the order.

## Must cover
- **Inventory:** every Accounts spec (`NeoERP-App/docs/design/specs/accounts-*.md`) and API doc (`NeoERP-BackEnd/docs/api/accounts-*.md`) with its state: done (merged on `phase/4` or `main`), in progress (batch 2, AL S5), or not started. Evidence: the spec, the merged code or `PROJECT-STATE.md` / handoff lines. Do not guess: mark "state unclear" with what you checked.
- **Backlog:** every item in `docs/backlog.md` and `NeoERP-BackEnd/docs/post-release-backlog.md` tagged Phase 5, 5b, or later for Accounts, plus the go-live gates (`NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md`) that Accounts depends on.
- **Phases:** Phase 4 rest (batch 2, AL S5, DOCS-2), Phase 5, Phase 5b, later. For each item: one line, why in that phase, depends on (other items, ADRs: 022 budgets, 023 reporting, 024 data at scale, 025 notifications, 026 RLS draft; Payroll v2 for A5), size (S/M/L), risk (money/security/statutory or not).
- **Dependency view:** a short ordered list or a Mermaid graph of the critical path to the first customer (go-live gates ERP-Q1–Q5 included).
- **Product direction:** large multi-company customers, sold by module (`docs/large-customer-roadmap.md` if present); dimensions, budgets and reporting are core.
- **Decisions for Jabran:** numbered, each with the recommended answer (e.g. order conflicts, items that look obsolete, items with no owner).

## Write scope
Only `docs/drafts/accounts-roadmap.md`. Stop and ask if you think another file must change.

## Read scope
The whole workspace (both code repos read only, incl. git history of `phase/4` and `main`), `docs/domain/RULES.md`,
`PROJECT-STATE.md`, `.review-channel/handoff-implementer.md`, `docs/agents/qa-round1-retest/fix-list.md`. Never open
`.local-secrets`, `*.jwt`, `*.session.json`. No database access.

## Rules
Plain short sentences; evidence as file:line or commit. One commit: `git -c user.name="Jabran Siddiqui" commit -m "docs(drafts): Accounts roadmap draft"`. No Co-Authored-By or any AI attribution. Do not push. No helper agents.

## Report (final message, ≤ 25 lines)
Commit hash; counts (specs placed, backlog items placed, unclear); the critical path in 5 lines; the decisions list.
