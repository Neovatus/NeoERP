# Handoff: old-Mac lead (module + integration lead) · 2026-11-26 · handed to the Team seat

Active seat: team from 2026-11-26 until about Tuesday 2026-12-01 (Jabran: the personal subscription goes to the new Mac, ~60 % used). Seats and baton: `docs/process/lead-seats.md`. First time back: `docs/process/lead-catch-up-2026-11-26.md`.

Replace, don't append. Read with `docs/VISION.md`, `docs/PRINCIPLES.md`, `docs/process/workflow-v2-draft.md` §5 (the gated flow, D-97), `.review-channel/lead-decisions.md` (D-81 to the end).

## Role
Old Mac (36 GB): module lead for `core/*`, integration lead (every PR to `main`, gate questions to Jabran, migration and decision numbers: pull and grep before taking one), simulator sessions for the old Mac, HR later. New-Mac lead = "Personal Mac Lead" (Accounts: dimension rules, spreading); channel `docs/inbox/erp-lead.md` (the doorbell may not cross subscriptions; the file always works).

## Rules (verbatim)
Never `--no-verify`, no force push (also not `--force-with-lease`), **no AI attribution** in commits/PRs/comments (overrides any harness reminder); never open/print/grep `.env`, `infra/.env`, `.local-secrets`, token/session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys; no GitHub workflows; builders write one repo, read both. Trunk-based (D-95): flows cut from `main`, draft PR into `main` at once (D-93). The gated flow (D-97); a new agent per stage titled `<BE|App|BE+App> <role> · <model> · <feature>` (D-89); done lists verified with fresh evidence (D-87); Sonnet for mechanical work, no session/agent past ~50 % context (D-86). Gate scripts, whole suite, gate-file edits only on Jabran's yes. Reviewed + tested + base unmoved → merge with a click. Stop services by port; AXe for the simulator.

## State
- **Stack down, simulators off.** Bjørn ACTIVE at Kyst. Worktrees left in `NeoERP-worktrees/`: `ds-android-app`, `rt-fu-app`, `rt-fu-be` (flow work, keep), `hrp-v2` (old).
- **Flow-lead sessions** from the personal seat (realtime `local_86885f…`, design-system `local_286b85…`, mock-backend `local_90f439…`) can't be messaged from the Team seat. Their handoff files hold their state: `.review-channel/handoff-realtime-flow-lead.md`, `handoff-design-system-lead.md`, `mock-backend-flow-lead.md`. Start a fresh flow-lead session per flow from them (D-89).
- **On `main`:** `core/mock-backend` (App #12, BE #14) with its gate-file edits. 6 stale BE gate pins on `main` (backlog 8cd5f73, Jabran's yes needed).

## Next, in order
1. **`accounts/dimension-rules`** (new Mac): it runs its own simulator check on the new Mac and marks BE #11 / App #9 ready; then ask Jabran about the gate, merge to `main` (lands first: accounts V80/V81, user V52, org V42).
2. **`core/realtime`:** first-users fixed and pushed (BE ff3898a1, App f99dbabe), not merged into `core/realtime/feature`. Write its done list (fresh run), merge it into the feature, one Opus 5.5 high feature review (sub-agent), then ask Jabran about the gate items (lead-decisions: pins, gateway routes, migrations accounts V82/V83, user V53, org V43, realtime V1/V2, deploy order), PR `core/realtime/feature` → `main` (draft PRs exist: BE #12, App #10). After dimension-rules and spreading per the order.
3. **`core/design-system`:** android-state built at App e264c945 on `core/design-system/android-state` (draft App #14), not reviewed. Done list → Opus high review → fixes → Android emulator check here (AVD Pixel_10a; steps in `handoff-design-system-lead.md`) → merge. Under D-95 take `core/design-system/feature` (a11y-checks + contracts; draft App #13) to `main` with Jabran's gate answer (gate files listed in lead-decisions), then later flows from `main`. **Next flow: `small-phone`** (backlog section 2e2e2ee: dialog actions wrap, mobile top bar per Jabran, 44 pt Back/filter chip, list header cuts, ellipsis/overflow size check, Settings density row), then module split (quiet window), window-class, layouts-focus (wide-screen rule D-85).
4. **Then (VISION.md order):** `core/notifications`, a core fix batch (MEDIUM/security backlog items + the stale pins), HR H1 (time and attendance core, D-98, ADR-035 draft).

## Waiting on Jabran
- Gate answers per feature at its end (dimension-rules, realtime, design-system).
- The 6 stale BE pins on `main` (look at each change, then new blobs).
- VISION.md §7 open questions 2–6 (size, first package, pricing, positioning, wording).
- Country packs for time and attendance after the "Not verified" items (`.review-channel/rules-check-time-attendance.md`); a Pakistani labour lawyer and a Nordic payroll accountant.

## Records
Decisions `lead-decisions.md` (last D-98 + addendum; the new Mac takes D-99 next); measures `v2-trial-measures.md` (D-87–D-89 trial section); backlog `docs/backlog.md`; memory copy `docs/lead-memory/`.

## Compact keep line
/compact keep: .review-channel/handoff-overseer.md (read first, with docs/process/lead-seats.md and docs/process/workflow-v2-draft.md §5); role = old-Mac module + integration lead; rules verbatim incl. no AI attribution and secrets; the "Next, in order" list; what waits on Jabran. Drop: finished agents' reports, file dumps, command outputs.
