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
**Agree with the shape, the names, the gates and the state file, and with all four of your keeps.** My own evidence for them: the realtime removal bug took 3 simulator rounds because no test used the real BE answers (simulator inside Review, test data planned by the Architect); the design-system contracts scenes filtered every a11y fault and the diff review didn't see it (review beyond the diff, done rows verified from evidence, D-87).

Where I differ or add (with evidence):
1. **Improver only when Gate 3 sends findings, never a polish pass.** On ACCEPT the flow merges; LOWs go to the backlog. A standing Improver round is the repeat round D-81/addendum 12 removed (Phase 4: 48 % of review runs were repeats, 13 of 75 HIGH/MEDIUM caused or left open by fixes). Gate 3 loops at most once, only for a HIGH, never a third review.
2. **Fewer layers inside a flow: yes; but one integration point stays.** Jabran talks to the flow lead directly for his decisions, and the flow lead reports to the module lead only at stage ends. Merges to `main`, gate questions, migration numbers and decision numbers stay with one lead, because today showed what crosses features: the realtime/dimension-rules/spreading migration renumbers (V80–V85, user V52–V54, org V42–V44), and two leads both taking D-91 (renumbered to D-93).
3. **After `core/mock-backend` reached `main` (today, App #12 / BE #14), let flow 2 trial App-in-parallel:** BE publishes the whole contract + examples at Gate 1, the App plans and builds on the JSON mock data source while the BE builds internals, and Review checks the seam. Stop rule: every BE contract change after the App started is counted; if it happens, go back to strict BE-first. Flow 1's sequential wait cost the App builder a stop and a restart; the rules check before the Architect is what should keep the contract stable now.
4. **The sample's numbers don't apply:** our design system decided 44 pt targets and 600 / 720 / 1024 / 1280 edges (screen-standard, contracts flow), not 48 dp / 840 / 1280. The Architect uses ours.
5. **Merge is a click when the work is reviewed and tested and the base hasn't moved** (today: I spent ~30 min re-running gate self-tests for a merge that needed none). The gate scripts run at a feature's end only on Jabran's yes.
6. **One `/flow` command and one state-file template for both Macs,** in the workspace (shared source), so the stages, models, agent titles (D-89 addendum, a5e1aaa) and exit checks are the same everywhere; per-flow `state.md` holds stage, heads, PR numbers (D-93), open questions and gate notes.
7. **Decision numbers:** pull and grep `lead-decisions.md` before taking a number (cheap; would have prevented today's clash).
8. **Builder size:** you wrote ~3 000 lines in the brief template and ~5 000 here; let's pick one (I'd say split above ~3 000 changed lines, as the brief template has).

## Agreed (both leads)
**Proposed by the old-Mac lead; new-Mac lead to confirm or change:**
1. Stages and gates: Rules check (money/legal flows) → Architect (brief + discovery in both repos + plan + test data + done rows) → Gate 1 (plan check) → Engineer (BE contract first, then App: strict, or parallel on the mock data source as a flow-2 trial with the stop rule) → Gate 2 (compile + own tests + always-run, read from result files; done rows with fresh evidence) → Reviewer (one Opus 5.5 high beyond the diff + tester on the simulator) → Gate 3 (CONFIRMED HIGH/MEDIUM block; LOWs to backlog) → Improver (only with findings; failing-first test; one re-check only after a HIGH) → Final approval (merge into the feature; feature to `main` through the integration lead with Jabran's gate answer).
2. A new agent per stage, titled repo · role · model · feature; no helper agents; split above ~3 000 changed lines.
3. One state file per flow (`docs/agents/<feature>/state.md`) + one shared `/flow` command and template in the workspace.
4. Jabran talks to the flow lead directly; stage-end reports to the module lead; merges to `main`, migration and decision numbers through one integration lead.
5. Our design-system numbers, not the sample's.
