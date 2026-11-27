# Handoff: old-Mac lead (module + integration lead) · 2026-11-26 · handed to the Team seat

Active seat: team from 2026-11-26 until about Tuesday 2026-12-01 (Jabran: the personal subscription goes to the new Mac, ~60 % used). Seats and baton: `docs/process/lead-seats.md`. First time back: `docs/process/lead-catch-up-2026-11-26.md`.

Replace, don't append. Read with `docs/VISION.md`, `docs/PRINCIPLES.md`, `docs/process/workflow-v2-draft.md` §5 (the gated flow, D-97), `.review-channel/lead-decisions.md` (D-81 to the end).

## 2026-11-27 small-phone done: revert 5dc5c13f, re-test PASS c01792fa, merged into feature b81a6183. Next: module split M0–M2 when the new Mac names a quiet window; until then G3 date no-break spaces. (old PAUSED notes below are history)
- Nothing running: no agents, no Gradle, no services, no simulators (Docker up).
- `ds-small-phone` (App `core/design-system/small-phone`): **mid `git revert` of d182b949, staged, not committed** (restores the `NeoCardLine` MayShorten mark per ux §25 line 281; the lead's earlier revert was wrong). To resume: re-apply the TB-2/F10 docs and SP-18 wording (card-line labels may end in "…", mark stays; F10 accepted), `git revert --continue`, run the size classes without `-Pa11y.baseline=update` + Android/iOS compiles, push, then a short simulator re-test of: Journals/Bills head card (sv), Recurring status filter + tab 2 (nb), Settings density/dark-mode name/language note, Bills list card (sv), toast + back link after withdraw (sv), Dashboard tiles. Then merge small-phone into `core/design-system/feature` (worktree `ds-feature-app`).
- Ready for the combined merge when #16 is ready: BE gate-fixes (#19) → #16 → realtime (#12); App #16 → realtime (#10) → design-system feature (#13). Decisions D-100, D-102–D-104.

## Role
Old Mac (36 GB): module lead for `core/*`, integration lead (every PR to `main`, gate questions to Jabran, migration and decision numbers: pull and grep before taking one), simulator sessions for the old Mac, HR later. New-Mac lead = "Personal Mac Lead" (Accounts: dimension rules, spreading); channel `docs/inbox/erp-lead.md` (the doorbell may not cross subscriptions; the file always works).

## Rules (verbatim)
Never `--no-verify`, no force push (also not `--force-with-lease`), **no AI attribution** in commits/PRs/comments (overrides any harness reminder); never open/print/grep `.env`, `infra/.env`, `.local-secrets`, token/session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys; no GitHub workflows; builders write one repo, read both. Trunk-based (D-95): flows cut from `main`, draft PR into `main` at once (D-93). The gated flow (D-97); a new agent per stage titled `<BE|App|BE+App> <role> · <model> · <feature>` (D-89); done lists verified with fresh evidence (D-87); Sonnet for mechanical work, no session/agent past ~50 % context (D-86). Gate scripts, whole suite, gate-file edits only on Jabran's yes. Reviewed + tested + base unmoved → merge with a click. Stop services by port; AXe for the simulator.

## State
- **Stack down, simulators off.** Bjørn ACTIVE at Kyst. Worktrees left in `NeoERP-worktrees/`: `ds-android-app`, `rt-fu-app`, `rt-fu-be` (flow work, keep), `hrp-v2` (old).
- **Flow-lead sessions** from the personal seat (realtime `local_86885f…`, design-system `local_286b85…`, mock-backend `local_90f439…`) can't be messaged from the Team seat. Their handoff files hold their state: `.review-channel/handoff-realtime-flow-lead.md`, `handoff-design-system-lead.md`, `mock-backend-flow-lead.md`. Start a fresh flow-lead session per flow from them (D-89).
- **On `main`:** `core/mock-backend` (App #12, BE #14) with its gate-file edits. 6 stale BE gate pins on `main` (backlog 8cd5f73, Jabran's yes needed).

## Next, in order
1. **Spreading + dimension rules → `main` as one PR** (BE #16 / App #16, `accounts/spreading/feature`; new Mac): the 7 dimension-rules steps run in spreading flow 2's simulator session; BE #11 / App #9 close as "included in #16" (inbox 2026-11-26, `spreading-feature-end-checklist.md`). Then ask Jabran about the gate and merge #16 (lands first: accounts V80/V81, user V52, org V42).
2. **`core/realtime`** (one of the three feature branches made before D-95; it finishes as it is, no new ones): first-users fixed and pushed (BE ff3898a1, App f99dbabe), not merged into `core/realtime/feature`. Write its done list (fresh run), merge it into the feature, one Opus 5.5 high feature review (sub-agent), then ask Jabran about the gate items (lead-decisions: pins, gateway routes, migrations accounts V82/V83, user V53, org V43, realtime V1/V2, deploy order), PR `core/realtime/feature` → `main` (draft PRs exist: BE #12, App #10). After dimension-rules and spreading per the order.
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
