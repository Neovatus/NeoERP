# Design and scope briefs: common reading (Jabran 2026-11-21)

Every design or scope brief (HR/Payroll, Items/Inventory, Purchase, Sales, Reports, later modules) reads these
before writing anything:

- `NeoERP-App/docs/design/ux-principles.md` (incl. the UX-1 section on short heights, Larger Text and touch entry)
- `NeoERP-App/docs/design/screen-standard.md` (§3 sizes, §9 how a screen is checked)
- `NeoERP-App/docs/design/specs/building-blocks.md`
- `NeoERP-App/docs/design/specs/apple-platform-look.md`
- `NeoERP-App/docs/design/design-system/neoerp-tokens.json`
- The QA sizes in `WORKFLOW.md` "QA rounds and limits": 375×667, 667×375, 874×402, 744, 1032, 1376, plus 1440
- `docs/domain/RULES.md` (domain model; §3 entitlement chain, §7 books belong to companies, §8 franchise)

## Scope drafts: full feature catalogue (Jabran 2026-11-21)
Every module scope draft (Items/Inventory, Purchase, Sales, Reports, later modules) lists the **full feature
catalogue** of its area, not a minimal v1: every feature a broad ERP offers there, each placed in a phase (v1,
later, not planned) with why. Completeness is checked against how established ERPs structure the area (structure
and feature lists only; our design system and UX §21–22 decide the look), with the comparison named. Each draft
ends with a **cross-module map**: features that touch the module but are owned by another, with owner, dependency
and phase. The product roadmap (ROADMAP-P) joins these maps into one feature map across all modules.

## Not only an ERP: payments, tax, reconciliation, automation (Jabran 2026-11-21)
NeoERP is also a payments and taxation system (e.g. Pakistan: FBR sales tax and withholding, provincial sales tax
on services, Raast/1Link) and a Nordic "regnskap" system (Norway: Altinn VAT return and A-melding, SAF-T; Sweden:
Skatteverket, SIE; Denmark: SKAT; e-invoicing). Every scope draft answers, per feature and per country where it
applies: **Payments** (how money moves), **Tax** (what is reported, where), **Reconciliation** (what must match
what), **Reports**, and **Automation** (what can run without a person). Benchmarks include the Nordic accounting
systems (Tripletex, Fiken, PowerOffice Go, Visma eAccounting/eEkonomi, Fortnox, e-conomic, Dinero) and Pakistani
practice, not only ERPs (structure only). ROADMAP-P adds a **country capability matrix** (payments, tax returns and
filings, statutory reports, reconciliations, automations per country) across all modules.

## Markets (Jabran 2026-11-21)
No single first country and no pilot customer. The first market group is **Pakistan and the Nordic countries (SE, NO, DK, FI, IS) together**; then other EU countries; then other countries. Scope drafts plan country work for all six in the first group and keep the design open for EU and other countries (country packs, not hard-coded rules).

## Fits every business: business type plus configuration (Jabran 2026-11-21)
NeoERP is for all businesses (an IT company logging time per project, a store with a check-in/out sheet, a factory
with shifts and biometric devices). Every scope and design draft: (1) offers the ways different businesses work as
modes a company, and where it makes sense a branch or franchise, switches on, alone or together; (2) lets the
**business type picked at enrollment** (company and each franchise or branch) pre-fill a starter setup only; (3)
keeps everything configurable afterwards; no code branches on the business type. Each draft says which starter
setup each business type gets for its module. (Recommended by the lead; the cross-module decision is in the
HR/Payroll change list, decision 17, for Jabran.)
