# Inbox: hr-payroll-lead-app

Append-only. Only the lead writes briefs here (protocol §3). The main marks items done in `hr-payroll-lead-app.done.md`.
Handover: docs/handover/main-agent-handover.md

---

## 2026-10-10 15:18 · HRP-18 · From: Code · HR & Payroll lead (trial) · REQUEST · Brief APP-1 · Plan only: design-system component checkpoint (E-1)
→ HRP · App · model Sonnet (pattern work; switch to Opus if stuck) · Blocking: no · **Plan review: write the plan, report, stop. Ownership of this build is being confirmed with the ERP lead (HRP-20); no code until I say "build".**
1. **Scope:** the 10 approved component specs in `NeoERP-App/docs/design/specs/` (approval-card, bottom-tab-bar-and-phone-sheet, calendar-month, date-range-field, file-download, module-rows, stepper, tabs, time-field, time-grid, variance-table — check which ten carry the E-1 approval; DR-12 `NeoDateField` is the Accounts app builder's, reuse it). Built once in `designsystem/**`, before any HR screen build.
2. **Plan file:** `NeoERP-App/docs/agents/CP-DS-HR/plan.md`: one slice per component, sub-agent tasks with owned files, tests per component (states, phone/iPad/desktop, Nordic and PK number/percent/date formats), and the user-guide/glossary parts.
3. **Rules:** branch `dev-app`; no commits in this brief; run app tests in an isolated copy if Hot Reload is running; specs are uncommitted, give sub-agents absolute paths.
4. **Report** (≤ 20 lines): plan path, slices, risks, open questions with your recommendation.
Refs: erp-lead-decisions.md E-1; lead-agent-structure.md §2

## 2026-10-10 16:22 · HRP-24 · From: Code · HR & Payroll lead (trial) · DECISION · Models for APP-1 (adjusts HRP-18)
→ HRP · App · Blocking: no
1. Your session: **Sonnet** (unchanged).
2. APP-1 (plan only): an **Opus** sub-agent writes `docs/agents/CP-DS-HR/plan.md`; Haiku for searches.
3. Later build: **Sonnet** per component, each with its own files and tests; Opus only after a check failed twice. Number, percent and date formatting reuse the existing `NeoMoney`/`NeoPercent`/date parser, not new code.
4. Independent review: a fresh read-only **Opus** review of the `designsystem/**` diff before you report (recommended; the ERP lead reviews it too, HRP-20).

## 2026-10-20 · ERP-147 · From: Code · ERP lead (trial) · FYI · Design principles index: read first; three contradictions fixed
Needs answer by: — · Blocking: no
1. **`docs/handover/design-principles.md`** is the one index of everything settled for design (process, UX principles, layout and widths, building blocks, rig ownership), with links to the shared specs. It's now in every lead's and design main's **read-first list**. Read it before any design or screen work, together with `NeoERP-App/docs/design/ux-principles.md`.
2. Fixed today in the shared specs:
   - **Dates:** screen-standard §8 now follows building-blocks "Typing dates" (company format plus ISO), not `YYYY-MM-DD`.
   - **Sideways scroll:** never for the page or a record table (cards below the tight width); only matrix grids (permission, compare, time/month grids) may scroll inside their own card, row labels pinned (screen-standard §4, building-blocks "Tables").
   - **Required widths:** rig review at **1440 · 1280 · 1024 · 768 · 390**; screenshot tests at 1440 and 390 plus the 320–1440 sweep (screen-standard §9, playbook §2).
3. Also today (ERP-145/146): one date-picker style for single and range dates; list width rule under LC-23.
