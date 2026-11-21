# ARCH-1 step 1: architecture gap map and capacity model (brief)

Approved: Jabran 2026-11-21 ("yes start ARCH-1 with the capacity model"). **Worktree:**
`/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/arch1`, branch `phase/4-b2-arch1` (workspace repo). Research and
writing only: no code, no Gradle, no sign-ups, no vendor contact. Two researchers work in parallel, one file each.

## Why
Jabran asked whether the architecture and engineering principles cover: the database for many companies, App Store
acceptance and over-the-air updates, deployment, offline tills/POS, realtime, cross-service transactions, and cost.
Many are decided in ADRs; some are missing. Step 2 (later, after Jabran reads this) writes the missing ADRs.

## Read (read-only; never edit these checkouts)
- BackEnd: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/docs/adr/ADR-001` … `ADR-026` (ADR-024, 025,
  026 may still sit in the workspace `docs/drafts/`), `docs/architecture/**`, `docs/operations/**` (incl.
  `hosting-and-go-live-requirements.md`, `deployment-settings.md`), `docs/database/db-design.md`, `AGENTS.md`.
- App: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-App/ARCHITECTURE.md`, `docs/architecture/**`,
  `docs/enterprise-architecture.md`, `docs/delivery-pipeline.md`, `docs/definition-of-done.md`.
- Workspace: `docs/domain/RULES.md`, `PROJECT-STATE.md`, `docs/drafts/accounts-roadmap.md` (approved),
  `docs/drafts/items-inventory-scope.md` (approved; volume figures), `docs/large-customer-roadmap.md`,
  `docs/agents/design-brief-common.md`, `docs/agents/vendor-choices/*.md`, `WORKFLOW.md`.

## Decided by Jabran today (do not reopen)
One shared deployment per region (EU/EEA for the Nordics; Pakistan separate); company column + RLS (ADR-026);
POS posts daily summaries to the books (inventory decision 12); exactly-once posting through an outbox and keys
(Accounts decision 6); public APIs for third parties later behind a platform ADR; never lower the large-customer
quality bar; build all bases from the start; GitHub Actions off in dev (no CI until Jabran says).

## File 1: `gap-map.md` (researcher A)
Per topic: **decided** (ADR and line), **partly** (what is missing), **missing**, **conflicts** between documents,
and a recommendation (which new ADR, or a change to which existing one). Topics:
1. Database for many companies (shared tables, RLS, regions; a **dedicated database or server for a very large or
   regulated customer** as an option: how, what it costs to operate, migrations across many databases).
2. **Groups spanning regions** (a group with Norwegian and Pakistani companies): one sign-in, membership, group
   views and consolidation across two regions under the residency rules.
3. Deployment and environments: provider, container platform, environments (dev, stage, prod per region), CI/CD at
   go-live, secrets, backups and disaster recovery (RPO/RTO), monitoring and alerts, upgrades with zero downtime and
   Flyway across services.
4. Client release and updates: iOS App Store and Google Play review rules (incl. Apple 2.5.2: no downloaded code),
   desktop (JVM) distribution and auto-update, web (open decision), forced minimum version, what may change without a
   store release (server-driven config, feature switches, country packs, texts), version skew between app and API.
5. Offline tills/POS: what ADR-007/008/009 decide, what the Sales/POS scope still needs (hardware, fiscal printers
   per country, PK FBR POS, sync conflicts, offline limits).
6. Realtime and cross-service consistency: ADR-019, 025, 018, decision 6; sagas/compensation vs distributed
   transactions, ordering, read models, idempotency, what happens on partial failure.
7. Engineering principles: are they written in one place? Draft a one-page list from what exists (with sources).
8. Anything else the ADRs leave open that a large multi-company customer would ask (SLA, audit, data export, exit).

## File 2: `capacity-model.md` (researcher B)
1. **Volumes per customer type** (small shop, mid company, large retailer 10+ branches with POS, payroll-heavy
   factory, group of companies), per module: rows per year (POS receipts and lines, stock moves, journals and
   lines, AR/AP documents, payroll lines, attendance, audit, notifications, files). State each assumption.
2. **Scenario Jabran named:** 10+ large retailers, each 10+ branches, in one shared database; then 50 and 200
   mixed customers. Rows and storage per year and after 5 and 10 years (retention: PK 10 years, Nordics 5–7).
3. **When each scale step is needed** (ADR-024 stages): indexes and keyset paging, partitioning by month, read
   replicas, archiving closed years, a dedicated database per large customer, a second server per region; with
   the measure that triggers each.
4. **Backups and recovery:** backup size and restore time at each size.
5. **Monthly hosting cost per stage** (dev, staging, first customers, the scenario above, 200 customers) for the EU
   region and the Pakistan region, for 2–3 realistic providers (managed Postgres, containers, storage, egress),
   plus the chosen vendors (SES, Maventa as "price not published", PRAL free). Use current published prices with the
   date read and links; mark estimates as estimates.
6. Where cost can be cut without lowering the quality bar.

## Rules
- Cite every claim from our docs with file:line; cite web prices and rules with links and the date read.
- No private details in searches or URLs; no vendor contact; quote at most short phrases.
- One H1 per file, no skipped heading levels, no raw HTML.
- Commit only your own file (`docs(arch1): gap map` / `docs(arch1): capacity model`); if git reports an
  index.lock, wait a few seconds and retry. No AI attribution, no push.
- Final report: the top findings in a few lines and the decisions Jabran will need.

## Step 2: the ADRs (Jabran 2026-11-21: "go with your recommendations for the ADRs")
Write each new ADR and ADR change from `gap-map.md`, with options and the **recommended option marked "Accepted on the
lead's recommendation (Jabran 2026-11-21)"**. ADRs that touch security or company isolation (017, 028, 029) also get a
Fable security view before any build uses them. New ADRs go to workspace `docs/drafts/ADR-0NN-<name>.md` (they move to
`NeoERP-BackEnd/docs/adr/` with the next BackEnd docs change, as ADR-024/025/026 did); changes to existing ADRs are
written as an amendment file `docs/drafts/ADR-0NN-amendment-2026-11-21.md` (the BackEnd files are not edited here).
Format of every ADR: Status, Context (cite gap-map.md and sources), Options (table), Decision, Consequences, Open
questions (only those that need a fact we do not have, e.g. a legal opinion), Related. Plain English; one H1.
Writers: W1 = ADR-017, ADR-028 (now) and ADR-027 (after the capacity model); W2 = ADR-030, ADR-031 and the ADR-007–011
amendments (now); W3 = ADR-029, ADR-032, ADR-033, ADR-034, the ADR-023/024 amendments, the principles page
`docs/drafts/engineering-principles.md` and the housekeeping list (after the capacity model).
