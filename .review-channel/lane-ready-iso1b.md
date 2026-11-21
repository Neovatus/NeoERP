# Lane ready: ISO-1b (ADR-026 with Fable's changes folded in) — 2026-11-21

**Repo / branch:** workspace `NeoERP`, `phase/4-b2-iso1b` (pushed, head `20b5f98`). Merge target: workspace `master`; the ADR stays a draft in `docs/drafts/` until Jabran decides D1–D11 and Q5.
**Asked:** Jabran 2026-11-21: "fold Fable's changes into ADR-026 first".
**Drafter:** Opus 5.5, high effort. **Reviewer:** Fable 5.2, high effort (views, then a fold check).

## What happened
- `docs/agents/iso1/fable-decisions.md` (on master): Fable's views on D1–D11, Q2–Q4, the rollout and nine missing items. No flat disagreement; agree D1, D4, D7; a change on D2, D3, D5, D6, D8, D9, D10, D11.
- The drafter folded **all 39 points**, each checked against BE `phase/4` (`d0dd5441`), three with a correction Fable then confirmed: D3 (domain-event append already takes the company, but its port is outside the aspect), D8 (local accounts-service uses the app role only when `ACCOUNTS_DB_USER` is set), D11 (the event outbox insert returns rows, so it also needs company SELECT). Added: the six cross-company paths missing from the inventory, hr-service and payroll-service runtime roles in R1, audit-service rows (R6a/R6b, R7 narrowed to `audit_events`), the inbox processor's company bind, a backup role, the D9 wording fix, the old branch name. Point-by-point: `docs/agents/iso1/fold-fable.md`.
- `docs/agents/iso1/fable-fold-check.md`: FIX on text only (the draft had called your order "replaced"), applied in `46fe1ee..20b5f98`.

## Rendering
GitHub renderer + script: clean. Browser-pane look: not done.

## Write-scope check
`docs/drafts/ADR-026-row-level-security.md`, `docs/agents/iso1/{fold-fable,fable-fold-check}.md`. No AI attribution (checked).

## Docs pages
User guide: none. Developer pages: none until accepted (then it moves to `NeoERP-BackEnd/docs/adr/`, with your OK for the move).

## For Jabran
- **D1–D11** (§7): each with the updated recommendation; Fable's view per decision in `fable-decisions.md`.
- **Q5 (new):** your recorded order "Accounts first (R1–R3), then Payroll/HR from their first migration (R4)" — did you mean **(a)** a build sequence: Accounts R2+R3 built before HR/Payroll's R4 starts; or **(b)** "Accounts finished first": R4 may run in parallel with R2–R3, and R2+R3 land before the pen test and any customer? **Recommend (b)** (Fable), so the HR/Payroll rebuild is not held back. Until you answer, your recorded order stands in the text.
- Q2–Q4 views and the nine missing items are in `fable-decisions.md`.
