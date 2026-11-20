# ISO-1: draft ADR-026 row-level security (brief)

Approved by Jabran 2026-11-20 (evening plan step 3): an Opus draft for Jabran to decide. No build follows until he
accepts it. Source: process review C3 (`docs/reviews/process-review-fable-2026-11-20.md`), go-live gate ERP-Q4
(`NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md`), ADR-012 tenant query isolation,
WORKFLOW.md guardrail 6 ("database row-level security follows by ADR before the first customer; Payroll's rebuild
must carry the company column").

## Goal
A decision-ready ADR: should Postgres RLS be a second layer under the application's company scoping, where, and how,
so that a missed `company_id` predicate cannot leak data between companies.

## Must cover
- Current state with evidence (file:line): how each of the 8 services scopes by company today (ADR-012, tenant
  security library, repositories, the baseline of unscoped methods), which schemas/tables hold company data, which
  have no company column (payroll P-17).
- Options (at least: no RLS + stronger tests; RLS on accounts + rebuilt payroll only; RLS on every company table),
  each with cost, risk, performance, and effect on Flyway, Testcontainers tests, seeds, reporting/read models,
  cross-company platform jobs and Super Admin.
- The mechanism for the recommended option: how the company id reaches the session (`SET LOCAL` per transaction from
  the request's company, connection-pool safety, async jobs and event relays), the DB roles (owner vs app role,
  `FORCE ROW LEVEL SECURITY`, no `BYPASSRLS` for the app), what happens when the setting is missing (deny), and how
  platform-wide jobs run.
- Rollout order and migration plan (which service first, Payroll rebuild carries it from day one), tests that prove
  it (company A session cannot read company B rows, missing setting denies), and the go-live tie to ERP-Q4.
- A short "Decisions for Jabran" list (numbered, each with the recommended answer).

## Write scope
Only `docs/drafts/ADR-026-row-level-security.md` in the workspace repo (it moves to `NeoERP-BackEnd/docs/adr/` when
accepted). Stop and ask if ADR-026 is already taken in `NeoERP-BackEnd/docs/adr/`.

## Read scope
`NeoERP-BackEnd/` read-only (ADRs, `shared/tenant-security`, `shared/neoerp-security`, services' persistence and
migrations, architecture tests, the go-live file), `docs/domain/RULES.md` §3 and §8, the process review. Follow the
format of `NeoERP-BackEnd/docs/adr/ADR-024-data-at-scale.md`. Never open `.local-secrets`, token or session files.
No database access.

## Rules
Plain short sentences; evidence as file:line. Commit only that file on workspace `master`:
`git -c user.name="Jabran Siddiqui" commit -m "docs(adr): draft ADR-026 row-level security (ISO-1)"`. No
Co-Authored-By, no AI attribution. Do not push. Do not edit anything else.

## Report (final message, ≤ 20 lines)
Commit hash, recommended option in two lines, the decisions list, open questions.
