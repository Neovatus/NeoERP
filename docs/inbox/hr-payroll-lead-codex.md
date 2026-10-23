# Inbox: hr-payroll-lead-codex

Append-only. Only the HR & Payroll lead writes briefs here (protocol §3). Codex marks items done in `hr-payroll-lead-codex.done.md` and reports to `docs/inbox/hr-payroll-lead.md`.
Handover: docs/handover/main-agent-handover.md (Codex section in lead-agent-structure.md §3c)

---

## 2026-10-23 10:00 · HRP-95 · From: Code · HR & Payroll lead (trial) · REQUEST · → Codex · HR & Payroll backend · Checkpoints CP-H0 + CP-P0 (build allowed under ERP-206)
Needs answer by: plan report first · Blocking: no
1. **Why now:** development is paused for screens, but Jabran allows backend work no screen decision can change (ERP-206). For HR & Payroll that is **H0 + P0** only.
2. **Read first:** `docs/handover/main-agent-handover.md` (Codex section in lead-agent-structure §3c); `NeoERP-BackEnd/AGENTS.md`; the approved contracts `NeoERP-BackEnd/docs/api/hrms-v2-h0.md` and `payroll-v2-p0.md`, including **P0-A9** (shared dimensions on `pay_run_lines`, frozen `DimensionSetV1` names: `branchId, stockLocationId, departmentId, costCentreId, projectId, itemId, free1Id…free4Id`; payroll stores branch, cost centre, department, project and free1…4; the §8 hand-off sends the full set with `stockLocationId` and `itemId` null).
3. **Plan first:** write `NeoERP-BackEnd/docs/agents/CP-H0-P0/plan.md`:
   - slices in contract order: CP-H0.1 → H0.2 → H0.3 → H0.3a → P0.1 → P0.2 → P0.3 → H0.4 → H0.5 → P0.4 → H0.6. P0's backfill depends on CP-H0.3a, not HR's V11;
   - the named tests per slice;
   - migrations (next free number at commit, E-12);
   - which parts go to the ERP lead.
   Report the plan and **stop for my review**.
4. **Build rules (after my "build"):**
   - **Isolated checkout:** your own clone or worktree, never where Jabran's running services watch `build/`.
   - **Migrations:** draft migrations only in Testcontainers or a throwaway database, never `neoerp-postgres` (ERP-64). Applied migrations are frozen.
   - **Tests:** new or affected tests while building (ERP-66). Before you report a checkpoint ready: the **full suite of every changed service and shared library**, plus `architecture-tests` when a port, repository or package changed (ERP-144: Actions are off). Counts in the report.
   - **Tolerant readers (ERP-177):** every Org, IAM and event client ignores unknown fields at every level, refuses a wrong `contractVersion` or a missing required field, and has a test sending extra fields.
   - **Review:** I run a fresh read-only Opus review of each checkpoint in my session (tenant isolation, auth and secrets, payroll locking, migrations). You run your own independent review too and report it as evidence.
   - **Commit locally** with `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit`, no trailers, explicit paths. **No push**: I accept, then Jabran pushes. No PRs.
   - **Cross-module parts go to the ERP lead** before I accept: tier 2 and isolation (CP-H0.2/H0.3, CP-P0.2), user-service U-split / U-defaults, the holder count and member-standing (P0 §4.8), auth-service `MachineClientCatalog` and secrets (H0-20). List those files per checkpoint.
   - **Docs part of done:** developer pages under `NeoERP-BackEnd/docs/modules/hr/` and `payroll/`; permission and role rows through the ERP lead.
   - **Never:** PROJECT-STATE*.md, credentials (use `docs/local-demo-data.md`), starting or stopping Jabran's services.
5. **Report** each step to `docs/inbox/hr-payroll-lead.md` as **HRP-C-n** (≤ 20 lines): done, commits, test counts, shared/security files for the ERP lead, open questions with your recommendation. Then stop.

## 2026-10-24 00:31 · HRP-116 · From: Code · HR & Payroll lead (trial) · DECISION · Stop for today (Jabran, ERP-242)
→ Codex · HR & Payroll backend · Blocking: no
1. If you've started HRP-95: finish the current step, commit it locally (no push), report HRP-C-n, then stop for today. If you haven't started, don't start today.
