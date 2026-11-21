# HRP-DES: HR/Payroll design refresh (brief)

Asked: Jabran 2026-11-21 (docs lane b, after UX-1). Drafter: Opus, then one fresh review.
**Worktree:** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/hrp-des`, workspace branch
`phase/4-b2-hrp-des`. Read-only on both code repos; write only the files below. No Gradle.

## Context (Jabran 2026-11-21)
The HR/Payroll **rebuild** has not started. It is a rebuild (Payroll v2 from `docs/agents/payroll/scope.md` plus
HR v2, designs approved 2026-10-21), not a refactor. Old HR/Payroll/ESS modules stay untouched and out of QA and
i18n. The build starts on this Mac on `phase/hrp-v2` as soon as Jabran approves this lane's change list (batch 2 keeps Gradle-lock priority); the old Mac may take it over from Monday. This lane prepares the designs for that build.

## Read
`docs/agents/design-brief-common.md` (all of it). UX-1 is on App branch `phase/4-b2-ux1`
(`git -C NeoERP-App show origin/phase/4-b2-ux1:docs/design/ux-principles.md`) until it merges.
The specs: `NeoERP-App/docs/design/specs/{hr-h1,hr-h2-h3,hr-h4,payroll-p,ess,people-access}.md`;
`docs/agents/payroll/scope.md`; `docs/drafts/hr-payroll/` (progress, open decisions, design gates, country
payroll drafts); `docs/drafts/ADR-026-row-level-security.md` (R4, D9, Q1); WORKFLOW.md guardrails (agent loops;
money, security and statutory work); `docs/lessons.md` (L03, L24: one format through NeoFormat/NeoNumericInput);
`NeoERP-App/docs/design/specs/building-blocks.md`; `docs/drafts/accounts-roadmap.md` (A5, L.1, decisions 5, 16).

## Check each spec against what was decided since 2026-10-21
- ADR-026: `company_id NOT NULL`, composite keys and RLS from the **first** migration; no baseline entries; D9 old
  tables dropped, no backfill.
- Guardrails: money/statutory scope, risk paths, two reviewers, regression test per finding.
- Building blocks and the one-format rule (amounts, dates, numbers only through the shared components).
- UX-1: short heights, Larger Text up to AX sizes, number keyboard + Done, focused field visible; QA sizes.
- Anything else later decisions changed (approval limits, dimensions ADR-021, budget control ADR-022, posting to
  Accounts via AccountsPostingV2 / A5, notifications ADR-025, data at scale ADR-024, file store ADR-020).

## Output
`docs/drafts/hr-payroll-design-refresh.md`: one section per spec (hr-h1, hr-h2-h3, hr-h4, payroll-p, ess, and
people-access if affected). Per spec: a table `# | spec section:line | what changes | why (decision + source) |
recommendation | size`. Then "Decisions for Jabran" (numbered, each with a recommendation and why), and
"Not changed, checked" (what still holds). Plain English, one H1, no raw HTML.

## Approval path (Jabran 2026-11-21)
Opus draft → fresh Opus review (correctness) → Fable 5.2 at high effort settles the non-critical items (building
blocks, layout, wording, UX-1 rules) and gives a view on the rest → **Jabran approves the whole list**, reading the
critical items (payroll money, statutory, approved scope, RLS) and anything Fable rejected or left open. Mark each
item `critical` or `non-critical` in the output so this split is visible. The HR v2 build starts only after Jabran's
approval.

## Rules
Commit on `phase/4-b2-hrp-des`; do not push or merge. No AI attribution. Never open `.local-secrets/`, `*.jwt`,
`*.session.json`. Write scope: `docs/drafts/hr-payroll-design-refresh.md`, `docs/agents/hrp-des/**`.
