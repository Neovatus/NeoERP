# Inbox: hr-payroll-lead-backend

Append-only. Only the lead writes briefs here (protocol §3). The main marks items done in `hr-payroll-lead-backend.done.md`.
Handover: docs/handover/main-agent-handover.md

---

## 2026-10-10 15:15 · HRP-17 · From: Code · HR & Payroll lead (trial) · REQUEST · Brief BE-1 · Plan only: H0 + P0 isolation checkpoint
→ HRP · Backend · model Opus (tenant isolation, payroll locking) · Blocking: no · **Plan review: write the plan, report, stop. No code until I say "build" (the design gate isn't passed yet).**
1. **Scope:** `NeoERP-BackEnd/docs/api/hrms-v2-h0.md` (CP-H0.1…H0.5, incl. CP-H0.3a) and `payroll-v2-p0.md` (CP-P0.1…P0.4), both amended 2026-10-10 (P0 Owner's own: both codes, everyone except the Owner counts, fails closed). These docs are uncommitted: give sub-agents the absolute paths in the main checkout.
2. **Plan file:** `NeoERP-BackEnd/docs/agents/CP-H0-P0/plan.md`: slices in contract order (P0 backfill depends on CP-H0.3a, not HR's V11), sub-agent tasks each with the files it owns, the named tests, the migrations ("next free number at build time", E-12), and which parts need outside review.
3. **Outside review, mark it in the plan:** ERP lead reviews CP-H0.3, CP-H0.4 and P0 tier 2 / isolation; user-service U-split + U-defaults and the §4.8 permission-holders read are ERP-owned code, and the auth-service `MachineClientCatalog` default removal (H0-20) is the ERP lead's — plan them as separate commits I can send for review, and stop if any needs a security approval not written in the contract.
4. **Rules:** branch `dev` only; no commits in this brief; never touch Jabran's running services; no secrets in code or docs (`docs/local-demo-data.md`).
5. **Report** (≤ 20 lines): plan path, slice list, estimated sub-agent split, risks, open questions with your recommendation.
Refs: hr-payroll-lead-handover-code.md §5.4; playbook §2a; main-agent-handover.md §2

## 2026-10-10 16:21 · HRP-23 · From: Code · HR & Payroll lead (trial) · DECISION · Models for BE-1 (replaces "model Opus" in HRP-17)
→ HRP · Backend · Blocking: no
1. Your session: **Sonnet**.
2. BE-1 (plan only): an **Opus** sub-agent writes `docs/agents/CP-H0-P0/plan.md`; Haiku for searches and reading the v1 code.
3. Name the model per task in the plan. For the later build: **Opus** implements CP-H0.1 / CP-P0.1 (tenant columns, backfill and quarantine: migrations that change existing data), CP-H0.2 / CP-P0.2 (scoped repositories, tier 2), CP-H0.3 (who acts, separation of duties, Owner's own, U-split/U-defaults), the P0 §4.8 holder count and CP-P0.3 run-lifecycle locking, and H0-20 secrets. **Sonnet** for CP-H0.4 outboxes, CP-H0.5 fixes other than secrets, docs and tests around them.
4. A fresh read-only **Opus** review of every checkpoint before you report (tenant, security, migrations: required).

## 2026-10-22 10:00 · HRP-81 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Amends: HRP-17, HRP-23 · Build gate open for H0 + P0 (ERP-160)
→ HRP · Backend · Blocking: no · Priority: next
1. **The design gate passed** (Jabran, 2026-10-21) and **the build gate is open for H0 + P0** (ERP-160). Contracts: `NeoERP-BackEnd/docs/api/hrms-v2-h0.md`, `payroll-v2-p0.md` (Approved). Read them in the main checkout, not a worktree copy.
2. **Order:**
   - BE-1 plan first: `NeoERP-BackEnd/docs/agents/CP-H0-P0/plan.md` by an Opus sub-agent, with models per HRP-23. Report it and **stop for my plan review**.
   - After my "build", go checkpoint by checkpoint: CP-H0.1 → H0.2 → H0.3 → H0.3a → P0.1 → P0.2 → P0.3 → H0.4 → H0.5 → P0.4 → H0.6. Report and stop after each checkpoint for acceptance.
3. **Rules:**
   - **Isolated checkout:** never build where Jabran's running services watch `build/`. Use your own worktree or clone, `cd` into it before spawning worktree agents.
   - **Migrations:** draft migrations only in Testcontainers or a throwaway database, never `neoerp-postgres` (ERP-64). Next free number at commit time (E-12). Applied migrations are frozen.
   - **Tests:** only new or affected tests while building (ERP-66). Before every push, the **full suite of every changed service and shared library, plus `architecture-tests`** when a port, repository or package changed; put the counts in the report (ERP-144: Actions are off).
   - **Models:** set explicitly on every sub-agent (ERP-68). Opus implements the critical parts (HRP-23 item 3). A fresh read-only Opus review runs before every report.
   - **Shared and security parts go to the ERP lead** before I accept: tier 2 and isolation (CP-H0.2/H0.3, CP-P0.2), the user-service holder count and member-standing (P0 §4.8), auth-service machine-client entries (secrets, H0-20), and `MachineClientCatalog`. List those files in each report.
   - **Commits:** `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit`, no trailers, explicit paths. **Push only on my "push"**, after re-checking `git log --oneline origin/dev..HEAD`. Never force-push; no PRs.
   - **Docs part of done:** developer page `NeoERP-BackEnd/docs/modules/hr/` or `payroll/`, `permission-actions.md` / `standard-roles.md` rows for new codes (via the ERP lead), glossary.
   - **Listener:** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh hr-payroll-lead-backend`, restarted at the end of every turn.
3. **Report** (≤ 20 lines) to `docs/inbox/hr-payroll-lead.md` as HRP-B-n: done, commits, test counts, shared/security files for the ERP lead, open questions with your recommendation.

## 2026-10-22 11:10 · HRP-83 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-81 · Readers tolerate new fields (ERP-177)
→ HRP · Backend · Blocking: no · put it in the BE-1 plan
1. Every Org, IAM and event client you build in H0 + P0 ignores unknown JSON fields at every level, still refuses a wrong `contractVersion` or a missing required field, and has a test that sends extra fields (playbook §3). The ERP lead checks it in each checkpoint's cross-module part.

## 2026-10-22 11:50 · HRP-85 · From: Code · HR & Payroll lead (trial) · FYI · Listener fix (ERP-179)
Blocking: no
1. Your done file must name every brief id you handle (one line may list several); the listener now wakes you for any id without a done line. On your next restart you may get one wake for old ids: add done lines for those already handled.
