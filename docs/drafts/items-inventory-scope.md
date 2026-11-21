# Items and Inventory scope (draft for Jabran)

Status: **Draft, 2026-11-21 (docs lane c, Opus drafter).** It approves nothing. Jabran decides §10.
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
| Stock item | Goods bought, held and sold or used | Yes, per location | Stock value, COGS (§4, §8) | Yes |
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
  method (where the company allows more than one, §4.9), tax class (§6), and account **roles** for stock, cost of
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
| Services | Services only, no stock categories | Inventory module not needed (see decision 1, §10) |
| Construction | Materials, Tools (non-stock), Subcontracted services | Issues to projects (§4.2) |
| Restaurant | Ingredients (stock), Beverages, Menu items (kits later) | Nordic restaurant VAT rules differ by on-site and take-away (GK) |

The lead leans the same way. One adjustment from the sources: the **country** decides units, tax classes and the
statutory item fields (§6), the **business type** decides only the starting tree. That mirrors A0, where the country
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
  company list. The variant grid editor can be its own slice (INV-1b). Watch the dimension-set count (§8.3, ADR-021
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
  the current valuation cost (FIFO or average, §4.9). Standard cost comes later with Manufacturing.
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

## 3. Full feature catalogue

Jabran asked for every feature a broad ERP offers in this area, each placed in a phase, nothing silently left out.

**Comparison used (all GK):** the inventory feature lists of Dynamics 365 Business Central (items, variants,
categories and attributes, locations and bins, transfer orders, physical inventory orders, item tracking, costing
methods, item charges, reservations, requisition planning, assembly), SAP Business One (item master, warehouses, bin
locations, batch and serial, inventory transfer, counting and posting, revaluation, pick and pack, MRP, landed costs),
NetSuite (item types incl. kits and assemblies, matrix items, multi-location, bins, transfer and inter-company transfer
orders, cycle counts, ABC classes, demand planning, landed cost, drop ship), Odoo (routes, multi-step receipts,
put-away rules, packages, lots and serials with expiry, reordering rules, valuation FIFO / average / standard,
barcode app, scrap, quality), Visma Business NXT and Fortnox Lager (articles, stock per location, stocktaking, stock
value; Fortnox as the small-company baseline). These were not read from vendor documents in this lane. They set the
**structure and completeness** only; our design system and ux §21-22 decide the look.

**Phases:** **v1** = Inventory v1. **Later** = a named later Inventory slice. **With X** = arrives with module X, which
owns it (§5). **Phase 7** = Accounts inter-company and consolidation (roadmap:151). **Not planned** = on no roadmap;
the reason says when to revisit.

### 3.1 Item master

| # | Feature | Phase | Why |
|---|---|---|---|
| I1 | Item types: stock, non-stock, service | v1 | Every business needs them (§2.1) |
| I2 | Kits / sales bundles | With Sales | Needs a sales document to explode into components |
| I3 | Assemblies, bills of material | With Manufacturing | Catalogued as Manufacturing features (`V41:136-140`) |
| I4 | Fixed-asset items | With fixed assets (roadmap:134) | Register is Accounts AC-FA |
| I5 | Deposit items (bottle deposit) | With Sales | Linked charge on a sales line (GK) |
| I6 | Category tree with defaults (roles, unit, tax class, valuation) | v1 | §2.2 |
| I7 | Starter category sets by business type | v1 | §2.3, decision 2 |
| I8 | Attributes and variants (size, colour, grade) | v1 (grid editor INV-1b) | §2.5, decision 4 |
| I9 | Item numbering: typed or series per category | v1 | §2.6 |
| I10 | Several barcodes per item and unit (GTIN-8/13/14) | v1 | Scanning and e-invoice ids (§6) |
| I11 | Units and conversions | v1 | §4.8 |
| I12 | Catch weight (piece count and actual weight both tracked) | Later | Meat, fish, cloth rolls; needs two quantities on every move |
| I13 | Item status: active, blocked for purchase, blocked for sale, phase-out, inactive | v1 | Lifecycle without deleting used items (ux §18) |
| I14 | Item names in several languages | Later, with document output (roadmap:109) | Customer-language line text is folded into 5.1 (roadmap:109); app UI is en/nb/sv/da |
| I15 | Item pictures and documents (data sheets) | Later, with attachments (roadmap:113) | Needs the file store and virus scan |
| I16 | Weight, volume, size per unit | v1 (fields) | Intrastat net mass, shipping later |
| I17 | Country fields: HS / PCT code, FBR unit, Third Schedule retail price, CN8, country of origin, tax class | v1 (fields) | §6; PK invoices need them today (`BE/docs/api/accounts-h-design.md:221-222`) |
| I18 | Item import and export (CSV / Excel, check then confirm, per-row refusals) | v1 | Large customers start with thousands of items; same pattern as OBI and ADR-021 D10 (`ADR-021:165-167`) |
| I19 | Bulk change with review step | Later | Large-customer item (`large-customer-roadmap.md:48` names it for HR; same need) |
| I20 | New-item request and approval | Later | Large groups control master data; not needed for a first customer |
| I21 | Item defaults for cost centre or project | Later | ADR-021 D4 names it as "later" (`ADR-021:97`) |
| I22 | Substitutes and alternatives | Later, with Sales | Offered when an item is out of stock |
| I23 | Customer and supplier item numbers | With Sales / With Purchase | ADR-018 §3 extension tables (`ADR-018:53`) |
| I24 | Group catalogue shared by owned companies | Later, after a scope ADR | §2.4, decision 3 |
| I25 | Hazardous-goods data (UN numbers, classes) | Not planned | No customer type in the sources needs it; revisit with shipping |

### 3.2 Locations and structure

| # | Feature | Phase | Why |
|---|---|---|---|
| L1 | Stock locations (Warehouse, Store, Returns) per branch | v1 (exists in Org) | `BE/docs/modules/org/stock-locations.md:9-17`; backend must accept Returns first (backlog:141, :195) |
| L2 | Per item × location settings (reorder levels, default receipt location) | v1 | §4.10 |
| L3 | In-transit locations for transfers | v1 | §4.3 |
| L4 | Bins (shelves) inside a location | Later | Word reserved (`App/docs/design/specs/stock-locations.md:12`); needs put-away and pick rules |
| L5 | Zones, put-away and pick rules | Later, after bins | Warehouse operations (§5) |
| L6 | Consignment stock (ours at a customer, or a supplier's in our store) | Not planned | Ownership split per move; revisit on a customer ask |
| L7 | Outside warehouse (3PL) feeds | Later, through an integration API | Same idea as ADR-021 D10 for postings |
| L8 | Store-server stock for offline POS | With POS (ADR-007 Proposed) | Store owns on-hand; moves stream up (`BE/docs/adr/ADR-007-store-edge-topology-for-offline-retail.md:86-88`) |

### 3.3 Stock movements and control (the eleven features, detail in §4)

| # | Feature | Phase | Why |
|---|---|---|---|
| S1 | Stock on hand per item, location, company (quantity and value) | v1 | §4.1 |
| S2 | Receipts and issues (purchase, sale, internal use, projects, returns) | v1 | §4.2 |
| S3a | Transfers between locations of one branch | v1 | §4.3 |
| S3b | Transfers between branches of one company (in transit) | v1 | §4.3; feature `INTER_BRANCH_TRANSFERS` |
| S3c | Transfers between companies of a group (transfer price, both books) | Phase 7 | §4.3, decision 13 |
| S4 | Stock counts: full, cycle, phone count sheets, approval, variance posting, close link | v1 | §4.4 |
| S5 | Adjustments and write-downs (damage, shrinkage, obsolescence, NRV) with reason and approval | v1 | §4.5 |
| S6 | Reservations: on hand, reserved, available | v1 (model; reservations from transfers) | §4.6 |
| S7 | Batch / lot, serial numbers, expiry | Later (INV-9); fields on moves from v1 | §4.7, decision 14 |
| S8 | Units of measure and conversions | v1 | §4.8 |
| S9 | Valuation FIFO and moving average; standard cost; revaluation | v1 (FIFO, average, revaluation); standard with Manufacturing | §4.9 |
| S10 | Reorder points, minimum stock, purchase suggestions | v1 (suggestions list); orders with Purchase | §4.10 |
| S11 | Stock reports and their place in the reporting layer | v1 (level 1); level 2-3 later | §4.11 |
| S12 | Negative stock rules | v1 | Decision 11 |
| S13 | Opening stock at go-live | v1 | Decision 10 |
| S14 | Stock status (available, quarantine, blocked) | v1 via Returns locations; status per batch later | Returns type text: "kept apart until checked" (`App/docs/design/specs/stock-locations.md:30`) |
| S15 | Specific-identification cost (cost per serial) | Later, with serials | Needed for high-value serial goods only |
| S16 | Packages, pallets, SSCC labels | Not planned | Shipping and EDI first |

### 3.4 Planning and warehouse work

| # | Feature | Phase | Why |
|---|---|---|---|
| P1 | Reorder point, min / max per item × location | v1 | §4.10 |
| P2 | Purchase suggestions turned into purchase orders | With Purchase | Orders are Purchasing's (`ADR-018:30`) |
| P3 | Transfer suggestions (refill a store from the warehouse) | Later | Same engine as P1 across locations |
| P4 | Demand forecast from sales history | Later, with ADR-022 forecast and reporting | Budget driver lines by product already planned (`ADR-022:77`) |
| P5 | ABC classification | Later (report) | Ranks items by value moved; feeds cycle counts |
| P6 | MRP (material planning) | With Manufacturing | Needs bills of material |
| P7 | Drop shipment and special orders | With Sales and Purchase | Goods never touch our stock |
| P8 | Pick, pack and ship | With Sales | Delivery is Sales' document (`ADR-018:29`) |
| P9 | Multi-step receiving (receive, inspect, put away) | With Purchase and quality | Goods receipt is a Purchasing feature (`V41:132`) |
| P10 | Camera barcode scanning on phones | Later | Hardware scanners work in v1 as typed input; camera needs platform work |
| P11 | Barcode label printing | Later, with document output | Uses the PDF pipeline of 5.1 |
| P12 | Wave and batch picking | Not planned | High-volume warehouse only; revisit with bins |

### 3.5 Costing and Accounts

| # | Feature | Phase | Why |
|---|---|---|---|
| C1 | Perpetual stock postings (stock value, COGS) | v1 | `ADR-018:40-41`; decision 6 for the off case |
| C2 | GRNI at receipt, cleared by the bill | v1 (Accounts side built) | `BE/docs/api/accounts-c.md:218` |
| C3 | FIFO and moving weighted average | v1 | §4.9, decision 5 |
| C4 | Standard cost with variances | With Manufacturing | Needs routings and production costing (`V41:140`) |
| C5 | LIFO | Not planned | Not allowed under IAS 2 and not used in our countries (GK) |
| C6 | Revaluation of an item's cost | v1 | §4.9 |
| C7 | Net realisable value write-down | v1 | §4.5 |
| C8 | Landed costs (freight, duty, insurance into stock value) | With Purchase | Charges arrive on bills; decision 9 |
| C9 | Late bill price corrects stock cost (actual costing) | Later, with landed costs | Decision 9 |
| C10 | Stock value ties to the GL every day | v1 | §8.8, money guardrail |

### 3.6 Reports and analysis

| # | Feature | Phase | Why |
|---|---|---|---|
| R1 | Stock list (on hand, reserved, available, value) | v1 | §4.11 |
| R2 | Movement history per item and location | v1 | §4.11 |
| R3 | Valuation report as of any date, tied to the GL | v1 | §4.11 |
| R4 | Stock ageing and slow-moving stock | v1 | NRV review needs it (§4.5) |
| R5 | Count variance report | v1 | §4.4 |
| R6 | Below-reorder list | v1 | §4.10 |
| R7 | KPI tiles: stock value, days of stock, turnover | Later (ADR-023 level 3) | `BE/docs/adr/ADR-023-reporting-layer.md:28` |
| R8 | Gross margin by item and category | Later (ADR-023 level 2) | Needs Sales or B invoice facts plus COGS |
| R9 | Budget vs actual quantity by product | Later | ADR-022 Q14 waits for quantity actuals from Inventory (`ADR-022:267`) |

### 3.7 Integrations and compliance

| # | Feature | Phase | Why |
|---|---|---|---|
| X1 | Item and stock fields for FBR Digital Invoicing (HS, unit, retail price) | v1 | §6 |
| X2 | Item ids on e-invoice lines (seller id, GTIN, classification) | v1 (fields); writer with 5.2 | §6 |
| X3 | Intrastat arrivals and dispatches | Later, with Sales and Purchase | §6; fields in v1 |
| X4 | Stock records kept for the retention period | v1 | Retention rules are pack data (`packs/2026.2/retention-rules.csv`) |
| X5 | Excise duty (alcohol, tobacco, sugar), bonded warehouses | Not planned | Specialist; revisit on a customer ask (GK) |
| X6 | E-commerce stock sync, EDI stock messages | Later (§5) | Needs an outside-system API |
| X7 | Stock in SAF-T / SIE files | No work in v1 | Stock appears only as GL lines in our countries' files (§6) |
