# Items and Inventory scope (draft for Jabran)

Status: **Draft, 2026-11-21 (docs lane c, Opus drafter).** It approves nothing. Jabran decides §9.
Brief: `docs/agents/inv-scope/brief.md`, plus three additions from Jabran on 2026-11-21 sent through the lead (the
eleven named features, the item master structure, the pricing boundary).

Short names: **BE** = `NeoERP-BackEnd`, **App** = `NeoERP-App`, **WS** = this workspace, **UX1** =
`NeoERP-worktrees/ux1/docs/design` (UX-1 revision of the design docs). `roadmap:N` = `WS/docs/drafts/accounts-roadmap.md`
line N. `backlog:N` = `WS/docs/backlog.md` line N. `packs/` = `BE/services/accounts-service/src/main/resources/packs/`.
Code repos read at BE `phase/4` `d0dd5441` and App checkout as found, read only.

**GK** marks a country or practice statement taken from general knowledge, not from a repo source. A reviewer or the
country accountant (gate ERP-Q1, roadmap:178) must check every GK line before it drives a build.

## 1. What this module is and where it stands

- Inventory is a commercial module (`INVENTORY`) in the Org catalog with `implemented: false`, so no agreement may
  include it yet (`BE/docs/api/org.md:1513`, `:1521-1524`). Its features are already catalogued, all off by default:
  `STOCK_BY_WAREHOUSE` (branch), `BATCH_SERIAL`, `INTER_BRANCH_TRANSFERS`, `INVENTORY_VALUATION` (company),
  `STOCK_COUNT` (branch) (`BE/services/org-service/src/main/resources/db/migration/V41__fe_upgrade_entitlement_rows.sql:116-120`).
  Purchasing is its own module now, with `GOODS_RECEIPT` as a branch feature (same file, `:131-134`).
- The ownership rules are already decided by ADR-018: Inventory owns the item master, stock moves and stock valuation;
  Sales and Purchasing read items; Accounts owns the journal and Inventory supplies the content of stock value, COGS
  and GRNI journals as a machine client on journal type IV (`BE/docs/adr/ADR-018-parties-and-ledger-documents.md:31-33`,
  `:40-41`). Valuation method and stock ledger design were left to this module (`ADR-018:98`).
- No inventory service exists. Org owns stock locations (types Warehouse, Store, Returns; one default per branch; bins
  reserved for later) and their agreement limit (`BE/docs/modules/org/stock-locations.md:9-17`,
  `App/docs/design/specs/stock-locations.md:5-14`).
- The old master roadmap's Inventory v1 lists item master, item groups, stock by warehouse, transfers, adjustments,
  stock movement ledger and summary views (`App/docs/master-roadmap.md:189-206`). Module order: Inventory comes after
  HR and Payroll (`App/docs/module-sequence.md:22`); its first loop step is this scope (`module-sequence.md:29-31`).
- Product direction: large multi-company customers from day one, sold by module; every large-customer feature is
  optional per company and off by default (`WS/docs/large-customer-roadmap.md:7`, `:11`). Inventory must carry the
  shared dimensions from its first spec (`large-customer-roadmap.md:19`, `:70`).

## 2. Item master structure

Jabran asked how the "chart of items" works for every kind of business. The answer below follows how the chart of
accounts already works: country gives the rules, the company owns its own copy, and defaults come from roles, not
numbers.

### 2.1 Item types (the same for every business)

| Type | What it is | Stock kept | Posts | In v1 |
|---|---|---|---|---|
| Stock item | Goods bought, held and sold or used | Yes, per location | Stock value, COGS (§5) | Yes |
| Non-stock item | Goods bought or sold but not counted (consumables, office supplies, drop-shipped goods) | No | Only through the bill or invoice line's account | Yes |
| Service | Work or a fee (installation, consulting, freight charge) | No | Only through the bill or invoice line's account | Yes |
| Kit (sales bundle) | A sales item made of components; selling it issues the components | No (components are stock) | COGS of the components | Later, with Sales (needs a sales document to explode) |
| Assembly (bill of materials) | Made from components into new stock | Yes | Production costing | Later, Manufacturing (`V41:136-140`) |
| Fixed-asset item | Bought as an item but goes to the asset register, not to stock | No | Asset register (AC-FA) | Later, with fixed assets (roadmap:134); the asset spec keeps barcodes and stocktake out of v1 (`App/docs/design/specs/accounts-fixed-assets.md:40`) |
| Deposit item (Nordic bottle deposit) | A linked charge added to a beverage line | No | Its own account and tax | Later, with Sales (GK: SE, NO, DK, FI deposit schemes) |

Why: stock, non-stock and service are what every business needs from day one (a services firm uses only services;
a shop mostly stock items). Kits and assemblies need documents that do not exist yet.

### 2.2 Item categories: a company tree that gives defaults

- Each company has a **category tree** (for example Food → Dairy → Cheese). Every item sits in exactly one category.
- A category carries **defaults** that new items inherit and may override per item: item type, base unit, valuation
  method (where the company allows more than one, §5.3), tax class (§3), and account **roles** for stock, cost of
  sales, sales revenue, purchase, adjustments and write-downs.
- Defaults point to **account roles**, not account numbers, the same way "Used for" links roles to accounts in the
  chart (`App/docs/design/specs/accounts-a0.md:133`). Roles already in every pack: `INVENTORY`, `GRNI`, `COGS`,
  `INVENTORY_ADJUSTMENT`, `PURCHASE_PRICE_VARIANCE` (`BE/docs/api/accounts-packs-2026-2.md:247`, `:265`, `:279-281`;
  Sweden `packs/2026.2/se-bas.csv:29`, `:82`, `:174-176`). A category may name a specific account instead (for
  example 1410 raw materials, `se-bas.csv` group 14), checked against the company's chart.
- Why roles: one starter category set then works on every country chart, and a chart change keeps working through
  "Used for", as A0 already does for tax codes (`accounts-a0.md:50`).
- Defaults are copied onto the item when it is created and frozen, like dimension defaults (ADR-021 D4,
  `BE/docs/adr/ADR-021-shared-dimensions.md:104`). A later category change asks "apply to the 214 items in this
  category?" rather than changing them silently (ux §3, `UX1/ux-principles.md:38`).
- Categories are also the natural budget and report grouping (ADR-022 product lines,
  `BE/docs/adr/ADR-022-budget-control.md:77`).

### 2.3 Starter category sets by business type

Options weighed:

| Option | For | Against |
|---|---|---|
| No templates | Nothing to maintain | Every new company starts from an empty tree; slow first day (ux §14 fewest steps, `UX1/ux-principles.md:137-143`) |
| Fixed industry charts | One shape per industry | No source asks for it; charts in NeoERP are per **country**, not per industry (`accounts-a0.md:210`; `packs/2026.2/templates.csv:2-5`); a customer that does two things breaks the model, as tiers did (RULES §2, `WS/docs/domain/RULES.md:41-54`) |
| **Starter sets chosen at setup, copied, then the company's own** | Fast start; any business type; editable | We maintain a few small sets |

**Recommendation:** starter sets, copied into the company at Inventory setup and then fully editable; no link back
(a later "template update available" offer is the same idea A0 keeps for charts, `accounts-a0.md:142`). A set holds
categories, their default roles, units and tax classes; it never holds items. Proposed sets, each with a Nordic and a
Pakistan flavour where units or tax differ:

| Set | Example categories | Country notes |
|---|---|---|
| Retail | Food (reduced VAT class), Non-food, Beverages (deposit later), Tobacco | Nordic food rates differ from the standard rate (GK; rates come from the tax packs, never the item) |
| Wholesale | Goods by product family; units in cases and pallets with conversions | — |
| Manufacturing | Raw materials, Work in progress, Finished goods, Packaging | Matches chart groups 1410 / 1440 / 1450 (`se-bas.csv` group 14) |
| Pakistan textiles | Raw cotton, Yarn, Greige fabric, Dyed and printed fabric, Garments, Waste | Units kg, metre, piece, dozen; HS codes by chapter (GK: chapters 52, 54, 55, 60-63) |
| Services | Services only, no stock categories | Inventory module not needed (see decision 1) |
| Construction | Materials, Tools (non-stock), Subcontracted services | Issues to projects (§4.2) |
| Restaurant | Ingredients (stock), Beverages, Menu items (kits later) | Nordic restaurant VAT rules differ by on-site and take-away (GK) |

The lead leans the same way. One adjustment from the sources: the **country** decides units, tax classes and the
statutory item fields (§3), the **business type** decides only the starting tree. That mirrors A0, where the country
picks the chart and tax codes never come from the chart (`accounts-a0.md:50`, `:160`).

### 2.4 Group or company: who owns the item list

- Today's rule for parties: one record per company, no sharing across companies in v1; a group-level shared master
  needs its own audited cross-company capability (`ADR-018:44-49`, `:96`). The company is the tenant boundary and a
  branch is a filter (ADR-021 context, `ADR-021:13`). A franchise is a separate business with its own books
  (`RULES.md:121-128`, `:154-167`).
- An item list is not a ledger, so sharing one does not break "books belong to companies". But it does cross the
  tenant boundary, which today only an ADR can open.
- What a shared master gives a large group: one item id for the same product in every company, so inter-company
  transfers (§4.3), consolidation and group reports by product work without a mapping step (ADR-021 Q10 left group
  mapping of dimension values out of v1, `ADR-021:231`).

**Recommendation (agrees with the lead's leaning, with a gate):** design the item master from day one as a
**catalogue** plus **per-company item settings**. The catalogue holds what is the same everywhere (number, name,
type, base unit, attributes and variants, GTIN, HS/CN codes). The company settings hold what each legal entity
decides: active, bought / sold / stocked flags, category and accounts, tax class, base price and cost (§2.7),
locations and reorder levels. In v1 each company is its own catalogue owner (catalogue scope = company), which is the
ADR-018 rule. A **group catalogue** (one catalogue owned by the parent, used by its owned companies) switches on per
group after a short ADR on cross-company scope (ADR-012 / ADR-013 / ADR-026 row-level security, roadmap:90). A
franchise keeps its own catalogue unless it opts in, because RULES §8 treats it as a separate business. Item ids stay
the same when a company joins a group catalogue later, so nothing is re-keyed (the ADR-021 Q3 pattern for projects,
`ADR-021:224`).

### 2.5 Attributes and variants

- A **variant** is its own stock-keeping item (own id, stock, GTIN, cost) under a parent "item with variants" that
  holds the shared data; attributes (size, colour, grade, width) generate the variant grid.
- The item id on stock moves, document lines and the dimension set is the **variant's** id; reports can roll up to
  the parent. This keeps ADR-021's one item field (`ADR-021:62`) and needs no second dimension.
- Separate items without a parent work for small ranges but make a 6 × 8 size-colour range 48 unrelated items with no
  roll-up.
- **Recommendation:** variants in the item master from v1 (retail and textiles need them on day one); attributes are a
  company list. The variant grid editor can be its own slice (INV-1b). Watch the dimension-set count (§6.2, ADR-021
  Q18).

### 2.6 Item numbering

- **Item number:** unique within the catalogue. Either typed, or the next number of a **series** set on the category
  (for example `FAB-00001`), same idea as document number series in Accounts. Numbers never change once used on a
  move (codes are never cut on screen: `UX1/ux-principles.md:276`).
- **Barcodes:** several per item, each tied to a unit (a piece GTIN-13, a case GTIN-14). Search by barcode works from
  day one with hardware scanners, which type like a keyboard.
- **Supplier item numbers** belong to Purchasing's supplier extension (ADR-018 §3 "preferred items", `ADR-018:53`);
  the item master leaves room for the cross-reference and shows it read only.
- **Customer item numbers** likewise belong to Sales.

### 2.7 Base price and cost on the item

- The item's company settings hold a **base sales price** and the **costs** Inventory knows: last purchase cost and
  the current valuation cost (FIFO or average, §5.3). Standard cost comes later with Manufacturing.
- Price data attaches to: the **company** (each legal entity sets its own; a group catalogue never shares prices),
  the **currency** (the base price is in company currency; other currencies come from Sales price lists, as Accounts
  keeps one company currency, `ADR-022:106`), the **unit** (price per base unit; an alternate unit may carry its own
  price, else base price × conversion), and the **variant** (a variant may override the parent's price).
- Everything else about pricing is Sales and Purchase scope (§2.8).

### 2.8 Boundary: pricing

Lead's decision (2026-11-21): full pricing is not in this draft. The item master leaves room for:

**Sales scope will add:** price lists and customer price levels; quantity breaks and date-limited prices; line,
invoice and customer discounts; campaigns and offers (buy 3 pay 2, bundles, kit pricing); price override rights
under the approval-limit model; tax-on-discount rules, including Pakistan's retail-price sales tax on Third Schedule
goods, where tax follows the printed retail price, not the selling price (`BE/docs/api/accounts-b.md:1438` carries
`retailPrice` on the line; rule itself GK).

**Purchase scope will add:** supplier prices and price lists, supplier discounts, supplier item numbers and lead
times (ADR-018 §3, `ADR-018:53`).

**The item master keeps:** the base sales price and costs (§2.7), the units and conversions those prices refer to,
and the tax class and Pakistan retail price as item facts the documents copy.
