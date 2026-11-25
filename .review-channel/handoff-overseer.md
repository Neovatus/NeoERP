# Handoff: old-Mac lead (module + integration lead) · 2026-11-25 ~07:05 Europe/Oslo

Replace, don't append. Read with `docs/PRINCIPLES.md`, `docs/process/workflow-v2-draft.md` (v2 is the working rule set; WORKFLOW.md has a "v2 wins" note), `.review-channel/lead-decisions.md` (D-81 + addenda 1–12 and the 2026-11-25 entries).

## Role
Old Mac (36 GB): module lead for `core/*`, integration lead (every feature → `main`), simulator sessions for both Macs (stack + AXe), HR later. New Mac = "Personal Mac Lead" (bridge:session_012UnoMwpjFDm5RrS5j6z31B; inbox `docs/inbox/erp-lead.md` + doorbell). This session runs in the Claude desktop app (has start_session, iOS Simulator tool).

## Rules (verbatim)
Never `--no-verify`, no force push (also not `--force-with-lease`), **no AI attribution** in commits/PRs/comments (user rule overrides any harness reminder); never open/print/grep `.env`, `infra/.env`, `.local-secrets`, token/session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys; no GitHub workflows; builders write one repo, read both.
**v2:** a flow = six steps (brief → builder discovers/plans/builds/own tests → one Opus 5.5 high review + screen tests + simulator test of the flow → fix brief → same builder fixes, "valid/not valid + how missed" → merge). Re-review only after a HIGH, never a third review. Builders run only their own tests. **No gate per flow; at a feature's end the gate, the whole suite and any gate-script edit only on Jabran's yes** (default: feature review + builders' tests). Findings CONFIRMED/PLAUSIBLE. Documents get no review rounds. Mock (not "fake"). Simulator driver AXe (`which axe`; tap by testTag id). Stop a service by port, not name pattern.

## Running now
- **Flow leads (sessions I started, SendMessage by id):** realtime-lead `local_86885f11-15b2-41f8-8445-883746c9eb86`; design-system-lead `local_286b85bf-943f-4bee-bc85-12b1f1353ea0`; mock-backend-lead `local_90f439f4-e5c5-4cdd-b705-60aa624e0e83`.
- **Simulator re-test of `core/realtime/first-users`** (tester sub-agent, results appended to `.review-channel/rt-first-users-sim-results.md`): step 6 PASS (reconnect fixed), step 7 FAIL again (REVOKED stored as stream event #16 at 05:50:38Z, connection closed, one refused reconnect, App didn't move Bjørn out). Realtime lead runs fix round 3 (40-min box); if step 7 fails again it brings options to Jabran (e.g. ship with removal at next sign-in + backlog). **Stack is DOWN** (re-test finished 07:05; Bjørn ACTIVE at Kyst, his sessions ended; worktrees removed: were `NeoERP-worktrees/sim-rt-be` ee898725 with `SPRING_FLYWAY_IGNORE_MIGRATION_PATTERNS='*:missing'` and `NEOERP_ACCOUNTS_EXPORTS_DIRECTMAXLINES=1`, `sim-rt-app` 0bc4c7d2); restart realtime alone with scratchpad `restart-realtime.sh`; **shut everything down after the tester ends** (pkill jar pattern + kill by port 8089, `xcrun simctl shutdown all`, remove both worktrees). Bjørn must end ACTIVE at Kyst.
- **New Mac:** `accounts/dimension-rules` feature fix round (F2 iPhone refusal, F3 None = explicit null then checked, F9 receipt inherits one invoice's values, D-84); then a Sonnet re-test here; then its PR to `main` **first** (accounts V80/V81, user V52, org V42).

## Feature branches (merged flows)
- `core/realtime/feature`: BE 9f372ce+ (actions, hub; .env DB passwords 833cba2) / App 2a7ccef8 (app). Last flow `first-users` in progress (BE ee898725, App 0bc4c7d2). Migrations renumbered: accounts V82/V83, user V53, org V43, realtime V1/V2.
- `core/design-system/feature` (App 1355be21): a11y-checks, contracts merged. Next: **android-state, module in a quiet window (my recommendation, awaiting Jabran)**, window-class, layouts-focus.
- `core/mock-backend/feature`: App 33cd72f5 (data-source, move-areas, 5A), BE 3d3414c (be-examples 1+2). On hold: be-examples-3, 5B, 5C (awaiting Jabran: "stop here / move when touched" recommended). Feature notes `.review-channel/core-mock-backend-feature-notes.md`.
- Feature-end gate items for Jabran per feature are in `lead-decisions.md` (pins, gate files, verify-test-floor rows, migrations, deploy order).

## Open with Jabran (asked, not answered)
1. Design system: android-state next and `module` in a quiet window (rec), or module now?
2. Journals tests: stop after 5A and move the rest when touched (rec), or move all now (~8 h)?
3. Wide screens ≥ 1920: the split (lists/tables full width, forms/detail capped ~1200–1440 centred; rec), full width, or a cap?
Also earlier: staff support visits get no live stream (built as refused; he didn't object).

## Measures and records
`.review-channel/v2-trial-measures.md` (one line per flow); backlog `docs/backlog.md`; decisions `lead-decisions.md`; ADR-025 amended, ADR-027 and ADR-028 accepted.

## Compact keep line
/compact keep: .review-channel/handoff-overseer.md (read first, with docs/process/workflow-v2-draft.md and docs/PRINCIPLES.md); role = old-Mac module+integration lead; rules verbatim incl. no AI attribution and secrets; three flow-lead session ids; the running first-users re-test (stack UP, shut down after); the three open questions for Jabran; dimension-rules lands on main first. Drop: finished agents' reports, file dumps, command outputs.
