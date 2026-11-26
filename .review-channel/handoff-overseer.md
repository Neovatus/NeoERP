# Handoff: old-Mac lead (module + integration lead) · 2026-11-25 ~07:40 Europe/Oslo · PAUSED until evening (Jabran)

Replace, don't append. Read with `docs/VISION.md`, `docs/PRINCIPLES.md`, `docs/process/workflow-v2-draft.md` (v2 is the working rule set; WORKFLOW.md has a "v2 wins" note), `.review-channel/lead-decisions.md` (D-81 + addenda 1–12 and the 2026-11-25 entries).

## Role
Old Mac (36 GB): module lead for `core/*`, integration lead (every feature → `main`), simulator sessions for both Macs (stack + AXe), HR later. New Mac = "Personal Mac Lead" (bridge:session_012UnoMwpjFDm5RrS5j6z31B; inbox `docs/inbox/erp-lead.md` + doorbell). This session runs in the Claude desktop app (has start_session, iOS Simulator tool).

## Rules (verbatim)
Never `--no-verify`, no force push (also not `--force-with-lease`), **no AI attribution** in commits/PRs/comments (user rule overrides any harness reminder); never open/print/grep `.env`, `infra/.env`, `.local-secrets`, token/session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys; no GitHub workflows; builders write one repo, read both.
**v2:** a flow = six steps (brief → builder discovers/plans/builds/own tests → one Opus 5.5 high review + screen tests + simulator test of the flow → fix brief → same builder fixes, "valid/not valid + how missed" → merge). Re-review only after a HIGH, never a third review. Builders run only their own tests. **No gate per flow; at a feature's end the gate, the whole suite and any gate-script edit only on Jabran's yes** (default: feature review + builders' tests). Findings CONFIRMED/PLAUSIBLE. Documents get no review rounds. Mock (not "fake"). Simulator driver AXe (`which axe`; tap by testTag id). Stop a service by port, not name pattern.

## Paused until evening (Jabran 2026-11-25 ~07:40)
Flow leads finish the step in hand, push, write their state, idle; no new agents.
- **realtime-lead** `local_86885f11-15b2-41f8-8445-883746c9eb86`: first-users round-3 re-test done (removal PASS, 2ace8c4); reactivation MEDIUM fixed (round 4, Sonnet: No-company re-reads bootstrap every 30 s + on foreground; NoCompanyRereadTest 4 FAIL old → pass), heads BE ff3898a1 / App f99dbabe, pushed, not merged; then merge first-users into `core/realtime/feature` (not yet: wait for the evening). Then feature review, then ask Jabran (gate items in lead-decisions).
- **design-system-lead** `local_286b85bf-943f-4bee-bc85-12b1f1353ea0`: android-state built and pushed at e264c945 (5 commits on 1355be21; own tests green, failing-first); next: review, then the **Android emulator check here** (AVD Pixel_10a; steps + testTags in its hand-back). Process death → backlog (d4aeec7).
- **mock-backend-lead** `local_90f439f4-e5c5-4cdd-b705-60aa624e0e83`: feature review ACCEPT; merged into `core/mock-backend/feature` App 901ca6d8 / BE e91afa5. **Asked Jabran (no answer yet):** gate-file edits (BE pins for the two ContractExamples.kt, App floor rows, SCOPE_ALWAYS MockDataSourceUseTest, + stale BE pin BankNoticeHttpSender.kt) + App scoped gate only (rec), or also the whole App suite? Then PR to `main` (no migrations, independent of dimension-rules).
- **New Mac:** `accounts/dimension-rules` both done lists hold, final heads BE d0cb5b69 / App a3959cd8 (App batch 3065/0); **first thing tonight:** its 7-step simulator check + the S28 stack rows (inbox `docs/inbox/erp-lead.md` ~08:10 and ~10:00; Opus-medium tester for new screens steps 4–6, Sonnet for 1–3 and 7), then the PR to `main` (lands first).
- Stack DOWN, simulators shut down, sim worktrees removed. Bjørn ACTIVE at Kyst.
- **D-86:** Sonnet for mechanical fixes/flows; no session or agent past ~50 % context.
- **`core/mock-backend` MERGED to `main`** (App #12, BE #14, merge commits, 2026-11-25 ~17:10) with the gate-file edits (BE pins d7fa07e incl. BankNoticeHttpSender; App floor + always-run). No gate run (Jabran: reviewed and tested; main had not moved). 6 more stale BE pins → backlog 8cd5f73. D-88's parallel BE/App now possible.
- **D-95 trunk-based (Jabran):** flows cut from `main`, PR into `main`; no module/feature branches; feature switch off until complete. My open feature branches: `core/realtime/feature` (finish first-users → PR to main) and `core/design-system/feature` (a11y-checks + contracts merged; take it to main, then android-state and later flows PR straight to main). Order on main: dimension-rules, then spreading, then realtime.
- **D-97 gated workflow (Jabran):** per repo in sequence: BE Engineer → Gate 2 → Reviewer → Gate 3 → Improver → App plan refresh (Gate 1b) → App Engineer → Gate 2 → Reviewer (App + seams) → Gate 3 → Improver → simulator → fixes → final approval. No App in parallel, no splitting. Applies to old-Mac flows too (realtime feature review, design-system next flows).
- **Agent titles:** every agent description "<BE|App|BE+App> <role> · <model> · <feature>" (a5e1aaa). **New Mac:** AXe 2.2.0 installed (Jabran OK); spreading runs its own simulator test there; D-90 spreading decisions in lead-decisions. My three flow-lead sessions were not reachable by SendMessage at ~10:30 (not in ListAgents): the title rule is in their handoff files; check they're alive tonight.
- **D-87** done list verified at every step (inside the DoD scope); **D-88** new Mac one flow at a time, combined BE+App review, parallel after mock backend; **D-89** one fresh flow-lead session per flow, every stage by a sub-agent, flow lead ends after its merge (new Mac confirmed). Transition: realtime-lead finishes first-users + the realtime feature review then is archived; design-system-lead finishes android-state then is archived; mock-backend-lead is done (archive). Next flows get fresh sessions.

## Feature branches (merged flows)
- `core/realtime/feature`: BE 9f372ce+ (actions, hub; .env DB passwords 833cba2) / App 2a7ccef8 (app). Last flow `first-users` in progress (BE ee898725, App 0bc4c7d2). Migrations renumbered: accounts V82/V83, user V53, org V43, realtime V1/V2.
- `core/design-system/feature` (App 1355be21): a11y-checks, contracts merged. Next: **android-state, module in a quiet window (my recommendation, awaiting Jabran)**, window-class, layouts-focus.
- `core/mock-backend/feature`: App 33cd72f5 (data-source, move-areas, 5A), BE 3d3414c (be-examples 1+2). On hold: be-examples-3, 5B, 5C (awaiting Jabran: "stop here / move when touched" recommended). Feature notes `.review-channel/core-mock-backend-feature-notes.md`.
- Feature-end gate items for Jabran per feature are in `lead-decisions.md` (pins, gate files, verify-test-floor rows, migrations, deploy order).

## Decided (D-85, 2026-11-25)
android-state next (brief sent to design-system-lead), module in a quiet window; journals stop after 5A, mock-backend-lead runs the feature review; wide screens split, built in layouts-focus.
Also earlier: staff support visits get no live stream (built as refused; he didn't object).

## Measures and records
`.review-channel/v2-trial-measures.md` (one line per flow); backlog `docs/backlog.md`; decisions `lead-decisions.md`; ADR-025 amended, ADR-027 and ADR-028 accepted.

## Compact keep line
/compact keep: .review-channel/handoff-overseer.md (read first, with docs/process/workflow-v2-draft.md and docs/PRINCIPLES.md); role = old-Mac module+integration lead; rules verbatim incl. no AI attribution and secrets; three flow-lead session ids; the running first-users re-test (stack UP, shut down after); the three open questions for Jabran; dimension-rules lands on main first. Drop: finished agents' reports, file dumps, command outputs.
