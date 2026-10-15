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
