# NeoERP vision and target businesses

**Status: DRAFT for Jabran (2026-11-26).** Written by the old-Mac lead from Jabran's decisions so far and from what the code does today. Lines marked **Decided** quote a decision and its date; lines marked **Proposed** are the lead's suggestion and wait for Jabran. Every brief links this page, as it links [`PRINCIPLES.md`](PRINCIPLES.md).

## 1. Vision (Proposed wording)
**One system to run a business group end to end, from the first company to hundreds, in every country it trades in.** NeoERP keeps the books, pays the people, handles payments and tax per country, and shows the whole group by any dimension, on phone, tablet and desktop, in the group's own language.

- **Decided (2026-11-03):** built for large, multi-company customers from day one, sold by module ("what the customer wants"). A showcase that already meets large-customer expectations is what we pitch with.
- **Decided (2026-10-22, 2026-11-03):** small companies use the same product; every large-customer feature is optional per company and off by default, so they never see it.
- **Decided (2026-11-21):** "not just ERP, a system for all businesses and payments, taxation etc.": NeoERP is also a payments and tax system (Pakistan FBR, provincial service tax, Raast/1Link) and a Nordic *regnskap* system (Altinn, A-melding, SAF-T, SIE, Skatteverket, SKAT). We benchmark against Tripletex, Fiken, PowerOffice, Visma, Fortnox, e-conomic and Dinero, not only against ERPs.

## 2. Markets
- **Decided (2026-11-21):** no single first country. **First market group: Pakistan and the Nordics together** (PK, SE, NO, DK, FI, IS), **then the rest of the EU, then others**.
- **Decided (2026-11-21):** no pilot customer chosen yet. Plans must not schedule work "for the pilot".
- **Built for it:** country packs (charts, tax codes, fiscal calendars, SIE/SAF-T, payroll rules; ADR-010), four languages today (en, nb, sv, da), per-company currency and fiscal year.

## 3. Who we build for (target businesses)
**Open: Jabran to choose the top targets.** Nothing is decided; the capacity model's "10 large retailers" (`docs/agents/arch1/capacity-model.md`) is a sizing example, not a market choice. **Proposed** order, from what the product already does best:

| # | Target business | Why it fits NeoERP | Built today | Missing for a first sale |
|---|---|---|---|---|
| 1 | **Groups of companies and franchises** (holding + several legal entities, shared or own agreements, branches) | The org model is the product's core: legal entity vs operating unit (ADR-013), company-scoped roles (ADR-014), franchise agreement holder (ADR-015), company switching, per-company modules | Org, people, roles, agreements, entitlements; Accounts per company with branches and dimensions; approval limits | Group reporting and consolidation (ADR-023 level 6), intercompany |
| 2 | **Multi-branch retail and restaurant chains** (many shops, high volume, offline tills) | Offline store edge and idempotent posting were designed early (ADR-007, ADR-008, ADR-009); dimensions per branch | Accounts, branches, the integration-posting plan for daily totals | POS/store edge, inventory, sales |
| 3 | **Mid-size service and trading companies** (finance team of 3–30, receivables/payables heavy) | Accounts is the most complete module: invoices, bills, receipts, payments, credit notes, approvals, opening balances, SIE import/export, spreading | Accounts A0–A4, approval limits, dimension rules, exports | Bank feeds per country, e-invoicing per country |
| 4 | **Accounting firms running many clients** (Nordic *regnskapsbyrå*, PK tax practices) | Multi-company from day one; staff support visits; country compliance | Company switching, support access | Client portal, bulk filing |

## 4. What we sell (modules)
- **Decided (2026-11-03):** sold by module; each customer takes the modules it needs (ADR-028: the App builds any subset of modules).
- **Built:** Platform (companies, agreements, entitlements, audit), Org, People and roles, Sign-in and security, **Accounts** (books, receivables, payables, reports, approvals, dimensions and dimension rules, spreading in progress; budgets planned in ADR-022), live updates (`core/realtime`).
- **Next (module sequence, `NeoERP-App/docs/module-sequence.md`):** HR, then Payroll (needs HR), self-service (ESS, expenses), then Inventory, Sales, Purchasing, Manufacturing, POS, one at a time.
- **Core design, not add-ons (Decided 2026-11-03):** shared dimensions (ADR-021), budget control (ADR-022), reporting layer (ADR-023), approval limits, later consolidation.
- **Proposed first package for a sale:** Platform + Accounts (+ approval limits and dimensions), then HR + Payroll per country as the second package.

## 5. Why customers choose NeoERP (Proposed)
1. **Groups first:** many companies, branches, franchises and roles in one place, with one sign-in and company switching.
2. **Every money line carries the same dimensions**, so budgets and reports compare across companies and modules.
3. **Country compliance built in** for Pakistan and the Nordics, one product for both.
4. **One app on phone, tablet and desktop** (Kotlin Multiplatform), accessible, in the user's language.
5. **The server decides the rules** (ADR-006, ADR-027): the same rules for the app, integrations and later APIs; nothing posts that the books would refuse.
6. **Industry standard by default** (D-82): where accounting practice is established, we follow it and name the reference systems.

## 6. What we don't do (now)
- No extra data engines (search, warehouse) until a measurement shows the need (ADR-024 Q1).
- No module started before the one before it is complete, unless Jabran says so.
- No country-specific fork of the product: countries are packs and rules.
- No pilot-driven shortcuts: features are built complete, behind a feature switch until done (D-95).

## 7. Open questions for Jabran
1. **Top target businesses:** keep the order in §3, change it, or name others (manufacturing, construction, healthcare, NGOs, …)?
2. **Customer size for the first sales:** large groups only, mid-size too, or both from the start?
3. **First package:** Platform + Accounts, or Accounts + HR + Payroll together?
4. **Pricing model:** per module per company, per user, or per group?
5. **Positioning per market:** against Tripletex/Visma/Fortnox in the Nordics, and against which systems in Pakistan?
6. **Vision wording** in §1: keep, or your own words?
