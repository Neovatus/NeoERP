# NeoERP project state: active-workstream index

**Updated 2026-11-20.** This is the one current state file. `PROJECT-STATE.claude.md` and
`PROJECT-STATE.codex.md` are deprecated (history only).
Format: [WORKFLOW.md](WORKFLOW.md) "One owner per record". Links, not history; detail lives in the owning plan.
Most recent detail: the lead's handoff `.review-channel/handoff-implementer.md`.

**Kept current by:** the lead updates this file at the end of every batch, together with the
[lessons register](docs/lessons.md).

**Branches (2026-11-20):** both repos work on `phase/4`; one PR per phase to `main`.
`phase/4` heads: App `bff8d14c`, BackEnd `9105bda`. `main`: App `370ad7a6` (PR #4), BackEnd `c6d5a6f` (PR #7).

Integration owner for every row: **Jabran** (decides scope, approves). The lead runs the work.

## Active workstreams

| ID | Workstream / position | Owning plan or doc | Run by | Blocker / dependency | Next approved work |
| --- | --- | --- | --- | --- | --- |
| QA-B2 | Phase 4 Accounts, QA batch 2: second fix list R01–R28 plus layout and wording. All four decisions approved 2026-11-20. Not started. | [fix-list.md](docs/agents/qa-round1-retest/fix-list.md), [summary.md](docs/agents/qa-round1-retest/summary.md) | Lead | Lane 0 gates first (evening plan 2026-11-20). | Fix lanes (BE, App A, App B, App C) behind the gates; money/security lanes get test re-runs and a second, different reviewer. Then one Sonnet retest of changed screens, scorecard and lessons. |
| GATE-0 | Lane 0 machine gates: `scripts/verify.sh` and pre-push hook, money invariant check, tenant architecture test on all 8 services, `docs/risk-paths.txt`, CI trigger fix, first build rules. Approved 2026-11-20; not built yet. | [WORKFLOW.md](WORKFLOW.md) "QA rounds and limits" guardrails; [process review](docs/reviews/process-review-fable-2026-11-20.md) C1–C3 | Lead (Sonnet builder, both repos) | None. | Build it (evening plan step 1). |
| DOCS-1 | Docs clean-up: remove contradictions (push, review scope, compaction 80 vs 50, retired models) so WORKFLOW.md is the single source; memory keeps lead habits only. This state refresh is part of it. | [process review](docs/reviews/process-review-fable-2026-11-20.md) H1; [lessons](docs/lessons.md) L25 | Lead (Sonnet) | None. | Evening plan step 2, in parallel with GATE-0. |
| ISO-1 | Company isolation: row-level security ADR (ERP-Q4), and the open ADR-012 legacy baseline (unscoped methods, hr-service awaiting). Payroll rebuild must carry the company column. | [ADR-012](NeoERP-BackEnd/docs/adr/ADR-012-tenant-query-isolation.md); [go-live gates](NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md) ERP-Q4; process review C3 | Lead (Opus draft) | ADR acceptance by Jabran before any build. | Opus drafts the RLS ADR for Jabran (evening plan step 3). |
| AL-1 | Approval limits: S1–S4 and app P1 done. Left: S5 payments and refunds (accounts V75; V73/V74 taken), then app P2 (steps card). | [approval-limits plan](docs/agents/approval-limits/plan.md) | Lead | Order against QA-B2 not recorded (see below). | S5 → app P2, each with a money review. |
| PLAT-2 | Platform lane: ADR-025 notifications (RT-0..RT-2) and ADR-024 Stage 0. | [backlog](docs/backlog.md) "ADR-024/025"; drafts in `docs/drafts/` | Lead | Jabran accepts ADR-024 and ADR-025 (summaries given; 3 additions to ADR-025 proposed). | None until the ADRs are accepted. |
| QA-DESK | Codex desktop-only QA pass on macOS (report only). Brief ready. | [brief-codex.md](docs/agents/qa-desktop/brief-codex.md) | Jabran runs Codex | Lead names the session file; app on the current `phase/4`. | Run when Jabran is away from the PC. |
| GO-LIVE | Release gates: accountant sign-off (ERP-Q1), pen test (ERP-Q2), production invariant checks (ERP-Q3), RLS (ERP-Q4), hosted secrets (ERP-Q5), plus the P-rows. All open. | [hosting-and-go-live-requirements.md](NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md) | Jabran (Q1, Q2), lead (Q3) | First hosted stage and first customer. | No build now; later items live in [backlog](docs/backlog.md). |

## Done since last update (16 Sep 2026)

- AUTH-01 auth accepted live (2026-09-15).
- Phase 3 fixes and Phase 4 so far merged to `main` (App PR #4, BackEnd PR #7, 2026-11-16).
- A4 features, size tests and A1–A18 click-through steps.
- ID-1 one person id (token subject = identity id); DEVCO bootstrap retired; separate seeded Super Admin.
- Approval limits S1–S4 and app P1; SEC-1 plaintext bank columns dropped (V72).
- C1 payment numbers and C2 report filters (Codex build, Opus review).
- DT-1 dev-only session sign-in for simulator testing.
- QA round 1 (T1–T24, A1–A18), QA1 fix batch (BackEnd V74, App lanes A–C) and retest; fix list and decisions written.
- Process review (Fable, 2026-11-20), lessons register and guardrails 1–6 in WORKFLOW.md.

## Unconfirmed — ask Jabran

- ~~AL S5 vs QA batch 2~~ resolved 2026-11-21 (Jabran): full QA batch 2 first, AL S5 after. Batch 2 started 2026-11-21 with Lane 0.
- **User guide Phase 4 pages:** no active stream found; the backlog lists missing Accounts user-guide pages (reports, year-end). Is this a workstream now?
- **HR/Payroll rebuild:** Payroll v2 scope signed off 2026-10-09 ([scope](docs/agents/payroll/scope.md)); old modules are skipped until rebuilt. Is a rebuild active, or after Phase 4?
- **Old rows ENT-01 (agreements/entitlements console), PLAT-01 (platform dashboard), ORG-01 (organization acceptance):** not in the current handoff. Done, folded into Phase 3/4, or still open?
