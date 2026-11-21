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
