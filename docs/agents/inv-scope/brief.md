# INV-SCOPE: Items/Inventory scope draft (brief)

Asked: Jabran 2026-11-21 (docs lane c). Drafter: Opus, then one fresh review. After Jabran decides it: Purchase,
then Sales, then Reports scope drafts, one at a time.
**Worktree:** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/inv-scope`, workspace branch
`phase/4-b2-inv-scope`. Read-only on both code repos. No Gradle.

## Context
Items/Inventory, Purchase, Sales and Reports come after HR/Payroll and need their features defined first. The
product is built for large multi-company customers from day one, sold by module, Nordic (SE, NO, DK, FI, IS) and
Pakistan.

## Read
`docs/agents/design-brief-common.md` (all of it). `NeoERP-App/docs/design/specs/stock-locations.md`;
`docs/drafts/accounts-roadmap.md` (5.13 AccountsPostingV2 + integration posting API, decisions 6 and others that
touch stock); `NeoERP-BackEnd/docs/adr/ADR-021-shared-dimensions.md`, `ADR-022-budget-control.md`,
`ADR-023-reporting-layer.md`, `ADR-024-data-at-scale.md`; `docs/large-customer-roadmap.md`;
`NeoERP-App/docs/master-roadmap.md`, `NeoERP-App/docs/module-sequence.md`; `docs/backlog.md`; existing accounts
specs that meet stock (AP bills `accounts-b-c.md`, multi-currency, fixed assets, dimensions, budgets).

## Output
`docs/drafts/items-inventory-scope.md`:
1. Features **in** v1 and **out** (later), each with why.
2. Country needs: Nordic (VAT on goods, SAF-T/SIE stock lines where relevant, e-invoice item data) and Pakistan
   (sales tax on goods, FBR item codes / HS codes, units).
3. Large multi-company needs: shared item master vs per-company items, inter-company stock, many warehouses and
   locations, volumes (ADR-024), permissions.
4. Links to Accounts: valuation method and posting through the posting connection 5.13 (which journals, when),
   dimensions (ADR-021), budget control (ADR-022), stock locations, period close and year end.
5. Dependencies and a proposed slice order.
6. **Decisions for Jabran**, numbered, each with a recommendation and why.
Cite sources as `file:line`. Plain English, one H1, no raw HTML.

## Rules
Commit on `phase/4-b2-inv-scope`; do not push or merge. No AI attribution. Never open `.local-secrets/`, `*.jwt`,
`*.session.json`. Write scope: `docs/drafts/items-inventory-scope.md`, `docs/agents/inv-scope/**`.
