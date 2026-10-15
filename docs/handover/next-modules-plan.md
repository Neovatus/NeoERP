# NeoERP — next modules plan

Owner: **Code · ERP lead (trial)** (until 2026-10-10: Cowork · ERP lead). Written 2026-10-09. Status: a proposal for Jabran.

The source for the order is `NeoERP-App/docs/module-sequence.md`. If Jabran approves this plan, that file is updated to match. Every module lead follows `docs/handover/module-lead-playbook.md`.

## 1. Where we are

| Module | State |
|---|---|
| Org, IAM, Auth, gateway, audit (step 0) | Engineering done; page states migrated (CP-UI2, CP-UI3). Device acceptance is still open. |
| **Accounts** (step 1) | A0 built; A1 backend built; A1 app and A2 ready to build. The Accounts lead is doing its Step 0 review. |
| **HR** (step 2) | **v1 code already exists, built before today's standards:** hr-service V1–V9, 18 controllers (departments, designations, employees, history, lifecycle requests, attendance and workflows, leave, balances, encashment, holidays, shifts, performance, manager, ESS); contract `docs/api/hrms.md`; app `features/hr` is one 1,700-line screen, `features/ess` is basic. Company id is on rows, but the ADR-012 tenant gateway isn't wired. On `neoerp-security` (SEC-e). |
| **Payroll** (step 3) | **v1 code exists:** payroll-service V1–V5, 9 controllers (components, pay periods, structures, rules, pay runs, payslips, compliance and reporting); contract `docs/api/payroll.md`; app `features/payroll` is one 800-line screen. **No company id on payroll data** (ADR-012 gap; checks use the selected company). It doesn't post to Accounts yet; D-56 allows it as a machine client. |
| Inventory, Purchasing, Sales | Only Org's warehouses and stock locations exist, plus A1's stock-location tag on journal lines. Listed in `master-roadmap.md` phases 6–8. |
| Manufacturing, POS / retail, CRM, Projects, Fixed assets, BI | Not started. ADR-009 (edge sync, idempotent posting) is the POS foundation. |

## 2. Recommended order and leads

| Order | Lead session | Modules | Starts | Why this order |
|---|---|---|---|---|
| now | **Cowork · Accounts lead** | Accounts A–H | Started 2026-10-09 | Step 1 |
| **next, now in parallel (review only)** | **Cowork · HR & Payroll lead** | HR v2, Payroll v2, ESS | Step 0 review now; builds after the Accounts A1/A2 builders free up | The code exists but predates the standards (page states, list controls, ADR-012, SEC tiers, docs). Payroll will be the first real poster into Accounts. Payroll without a company id is a data-isolation risk before any real customer. |
| after | **Cowork · Supply chain lead** | Inventory → Purchasing → Sales | Once ADR-018 (§3) is accepted and the Accounts B/C contracts are approved | Stock has to exist before buying and selling it. Purchasing feeds payables (C), Sales feeds receivables (B), and both move stock. One lead keeps the three flows consistent. |
| later | per module | Manufacturing (Lahore Textiles), POS / retail (Kystgruppe franchises, ADR-009), Fixed assets (or the Accounts lead), CRM, Projects | Jabran decides by customer need | |
| ERP lead | — | Reporting / BI, in-app help (HELP-1), mobile acceptance, shared components | ongoing | Cross-module by nature |

Builder capacity is the real limit: at most two builders at a time, one backend and one app. Leads can review and design in parallel, but their builds queue: Accounts first, then HR & Payroll.

## 3. Decision to take before Supply chain (and before Accounts B/C are built)

**ADR-018: who owns parties and documents.** Accounts B/C already define customers, invoices, suppliers and bills. Master-roadmap Sales and Purchase also list customers, invoices, vendors and bills. Without a rule, two modules will build the same records.

The ERP lead recommends:

- **Parties:** one customer record and one supplier record per company, owned by Accounts (B/C). Sales and Purchasing read them and add their own commercial fields (price lists, terms, sales rep) in their own tables.
- **Ledger documents:**
  - Invoices, credit notes, bills and payments are owned by Accounts B/C and post through the engine.
  - Sales creates invoices *through* B's API from a delivery or order.
  - Purchasing creates bills through C's API from a goods receipt.
- **Commercial documents:** quotations, orders, deliveries, purchase requests, purchase orders and goods receipts are owned by Sales and Purchasing.
- **Stock:** stock moves and valuation are owned by Inventory. Inventory posts stock value and cost of goods sold through the engine (machine client, D-56 pattern), using the A1 stock-location tag.
- **Items:** owned by Inventory. Sales and Purchasing read them.

The ERP lead writes ADR-018 once Jabran agrees. The Accounts lead checks the B/C contracts against it in its Step 0 review.

## 4. What each new lead starts with

Every lead's Step 0 covers:

1. what exists (code, contracts, design, tests, docs);
2. a verdict per area: keep / refactor / rebuild;
3. domain correctness per country;
4. a proposed scope (`docs/agents/<module>/scope.md`), split into slices;
5. decisions for Jabran, each with a recommendation.

Module-specific starting points are in that lead's handover note, e.g. `docs/handover/hr-payroll-lead-handover.md`.
