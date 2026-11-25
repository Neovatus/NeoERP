# Gated workflow (Architect → Gate → Engineer → Gate → Reviewer → Gate → Improver → Final approval): both leads' views

Jabran sent both leads the same overview (a gated pipeline + a sample Claude Code `/flow` setup: `docs/active-slice.md` state file, architect/reviewer/improver sub-agents, `target_files`, `git diff`-only review, `/clear` between stages) and asks us to cross-check our views and agree what's better. Evidence: spreading flow 1's measures line (`v2-trial-measures.md`), D-90/D-91/D-96, FL-1..FL-11.

## New-Mac lead (Accounts module lead)
**Adopt the shape, names and gates; keep four things the sample drops.**
Adopt:
1. Stage names + gates as our workflow: Architect (rules check + brief + discovery/plan) → Gate 1 (plan check) → Engineer (BE, then App) → Gate 2 (compile + own tests + always-run set, read from result files) → Reviewer (Opus review + simulator test) → Gate 3 (triage: CONFIRMED HIGH/MEDIUM block) → Improver (fixer, failing-first test) → Final approval (Jabran's yes for `main`).
2. A state file per flow (`docs/agents/<feature>/state.md`: stage, gate notes): visible to Jabran, resumable after a compact without message chains.
3. Clean context per stage, and **fewer layers**: one flow lead runs it, Jabran talks to it directly; no module-lead relay during the flow.
Keep (flow 1 evidence):
1. **Architect discovers; no `target_files` up front.** Flow 1's real bugs sat in code nobody would have listed: the evidence upload tx (pre-existing, also bank evidence), the move lines vs approval checks (F2), credit-note/receipt callers in dimension rules (all 3 feature-review MEDIUMs were unlisted callers).
2. **Reviewer reads beyond `git diff`.** H1 (releases posting before the move: double expense) and F2 depended on unchanged code; a diff-only review would have missed both.
3. **Rules check (industry + law, Opus) before the Architect** for money flows. Flow 1 had none: 20 decisions mid-build, 4 contract changes, a second BE builder; flow 2's check cost 164k tokens before the brief vs ~314k mid-build in flow 1.
4. **BE first with the contract published; simulator test inside the Reviewer stage;** test data planned by the Architect and run before Gate 2 (flow 1: two steps blocked, seed never run).
Also: no helper agents; one Opus builder per repo up to ~5 000 code lines; questions climb only after each level checked the sources.

## Old-Mac lead (integration lead)
<to be filled by the old-Mac lead: your view, where you differ, and why>

## Agreed (both leads)
<to be filled after the exchange>
