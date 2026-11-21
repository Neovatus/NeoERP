# Lane ready: INV-SCOPE (Items/Inventory scope draft) — 2026-11-21

**Repo / branch:** workspace `NeoERP`, `phase/4-b2-inv-scope` (pushed, head `80a78d3`). Merge target: workspace `master`; the draft stays in `docs/drafts/` until Jabran decides.
**Draft:** `docs/drafts/items-inventory-scope.md` (about 1,100 lines). **Brief:** `docs/agents/inv-scope/brief.md` + `docs/agents/design-brief-common.md`, plus Jabran's additions of 2026-11-21 (eleven stock features; item master structure; pricing boundary; full feature catalogue with a cross-module map; payments, tax, reconciliation, reports and automation per country).
**Drafter:** Opus 5.5, high effort. **Reviewer:** Opus 5.5, fresh, high effort, with web checks. **Decisions:** Fable 5.2, high effort. A plan, not a build: no code, no tests.

## Reviews (`docs/agents/inv-scope/` on the branch)
- `review-1-opus.md`: FIX, 10 MAJOR (feature switches misread; provision accounts per country; NO write-downs not tax-deductible, SE 97 % rule missing; decision 8 changed ADR-018 unnamed and GRNI sign; group catalogue without a slot; inter-company transfers all pushed to Phase 7; camera scanning missing; tax notes not per country, no Payments column; Finance-only companies), 7 MINOR. 46 citations checked; country rules spot-checked on the web.
- `review-2-opus.md`: fixes only: FIX, 3 new MAJOR from the fixes (cancelled or FBR-rejected document leaves a stock move; inter-company posts via `linkedCompanyId`, not built (PR-9); no VAT inside a VAT group), 5 MINOR. Web checks: NO rates, PK Tier-1 POS, PK textile HS chapters confirmed.
- Round 3 (drafter) checked by the lead: all 8 fixed (§12).
- `fable-settlement.md`: non-critical 3 settled (2 with change), none to Jabran; critical 18: 4 agree, 13 agree with a change, decision 8 agree with the goal not the mechanism. Flags fixed by the drafter (decisions 7 vs 8.8 and 12 vs 17; Pakistan Annex-J / H1 stock statements; excise/FED; missing catalogue rows; three unnumbered decisions now 22–24, plus 25). Each Fable change is marked "(Fable)" in the text.

## What it holds
- **Catalogue:** about 90 features, each placed v1 / later / with another module / not planned, with why; completeness checked against Business Central, SAP Business One, NetSuite, Odoo, Visma, Fortnox and the Nordic accounting systems (structure only).
- **The eleven stock features** (§4), **item master structure** (§2: types, category tree with defaults, starter sets by business type, group catalogue, variants, numbering), **pricing boundary** (§2.8), **cross-module map** (§5), **country table** with Payments, Tax, Reconciliation, Report, Automation (§3.9), **multi-company** (§7), **links to Accounts** (§8), **slice order** (§9: INV-0 contract and scope ADR → INV-1 item master → INV-1c group catalogue (off by default) → stock ledger and valuation → receipts/issues → adjustments → counts with camera scanning → transfers incl. linked inter-company INV-4b → reports → reorder → variants → batch/serial).

## Rendering
GitHub renderer + script: clean (one H1, headings, tables, links). Browser-pane look: not done.

## Write-scope check
`docs/drafts/items-inventory-scope.md`, `docs/agents/inv-scope/**`. No AI attribution (checked). The branch is behind `master` by docs-only commits; merge with `--no-ff`, no overlapping files.

## Docs pages
User guide: none: a planning draft. Developer pages: none: no code.

## For Jabran: 25 decisions (§10), 21 critical
Fable settled the four non-critical ones (4 variants, 18 value-read code, 21 camera scanning, 25 locations with stock). The critical ones, each with the drafter's recommendation and Fable's view in `fable-settlement.md`:
1 who can use items · 2 starter category sets by business type · 3 group catalogue (INV-1c, off by default) · 5 FIFO and moving average · 6 valuation off · 7 valuation pool per item per company · **8 stock before Purchase and Sales exist (changes ADR-018; two options: Accounts calls Inventory in approval, or an Inventory-owned receipt/delivery document — choose)** · 9 price variance, landed costs with Purchase · 10 opening stock adopts the GL balance · 11 negative stock · 12 posting detail · 13 inter-company: linked per-company transfers before Phase 7 (needs PR-9), eliminations in Phase 7 · 14 batch/serial/expiry first after v1 · 15 counts and close · 16 write-downs incl. NO tax and SE 97 % · 17 item on journal lines · 19 country item fields in v1 · 20 build order · 22 manual journals on stock accounts · 23 tax class · 24 back-dated moves and re-costing.

**Not verified:** lines marked GK (country rules from general knowledge; for the accountant check ERP-Q1), incl. whether K3 companies may book the Swedish 97 % rule, and the Annex-J / H1 source; volume figures are assumptions.

## Update 2026-11-21 evening: all 21 critical decisions decided
- Jabran decided all 21 in chat (recorded on each item in §10: "Approved by Jabran 2026-11-21 …"). Choices and additions: 7 (a) + pool key for a later per-location cost setting; 8 (b) Inventory-owned Receipt and Delivery (Jabran's explicit yes to the ADR-018 source change); 9 simple landed costs in INV-3; 10 three opening-stock cases; 11 per store location; 14 (A) batch/serial/expiry in the first build round; the others as recommended with Fable's changes.
- Opus (medium) applied the decisions to the body (`695640f`); the lead settled its open points (`aa783f9`: INV-4b inside the first build round, off by default, needs PR-9; the landed-cost credit side and the C-6 exception settled in the INV-0 contract). Swedish-first wording removed (`4fe9f51`); "v1" defined as the proposed first build round.
- Branch head `5218938` (master merged in, no conflicts). Docs pages: none (planning draft).
- **For Jabran:** verdict (lead's call: MERGE to workspace master, `--no-ff`; the draft becomes the approved Items/Inventory scope for the INV-0 briefs after HR/Payroll).
