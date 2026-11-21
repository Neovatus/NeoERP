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
  Purchasing is its own module now, with `GOODS_RECEIPT` as a branch feature (same file, `:127-130`).
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
| Assembly (bill of materials) | Made from components into new stock | Yes | Production costing | Later, Manufacturing (`V41:131-135`) |
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
  move (codes are never cut on screen: `UX1/ux-principles.md:278`).
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
| I3 | Assemblies, bills of material | With Manufacturing | Catalogued as Manufacturing features (`V41:131-135`) |
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
| P9 | Multi-step receiving (receive, inspect, put away) | With Purchase and quality | Goods receipt is a Purchasing feature (`V41:128`) |
| P10 | Camera barcode scanning on phones | Later | Hardware scanners work in v1 as typed input; camera needs platform work |
| P11 | Barcode label printing | Later, with document output | Uses the PDF pipeline of 5.1 |
| P12 | Wave and batch picking | Not planned | High-volume warehouse only; revisit with bins |

### 3.5 Costing and Accounts

| # | Feature | Phase | Why |
|---|---|---|---|
| C1 | Perpetual stock postings (stock value, COGS) | v1 | `ADR-018:40-41`; decision 6 for the off case |
| C2 | GRNI at receipt, cleared by the bill | v1 (Accounts side built) | `BE/docs/api/accounts-c.md:218` |
| C3 | FIFO and moving weighted average | v1 | §4.9, decision 5 |
| C4 | Standard cost with variances | With Manufacturing | Needs routings and production costing (`V41:135`) |
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

### 3.8 Nordic accounting systems and Pakistani practice

All GK, structure only. NeoERP is also a payments, tax and
"regnskap" system, so the catalogue was also held against Tripletex, Fiken, PowerOffice Go and Visma eAccounting /
eEkonomi (NO), Fortnox (SE), e-conomic and Dinero (DK). Their shape: a product (vare) register with units, VAT code and
accounts per product group; stock as quantity per product with a simple stocktake; many small users book purchases
straight to cost and post one stock-change journal at year end (the periodic way), while the larger ones post stock
value per move. Everything ties back to the ledger, the VAT return and the statutory file (SAF-T NO, SIE SE). That
supports decision 6 (valuation can be off) and §3.9's reconciliation column. Pakistani practice (GK): mid-size firms
run local ERPs, Odoo or SAP Business One with HS (PCT) codes and units on every item because FBR invoices need them;
Tier-1 retailers must link their POS to FBR; textile and pharma firms track lots. That supports I17 and decision 14.

### 3.9 Tax, reconciliation, report and automation per feature

Only features where something applies are listed. Tax facts are GK unless a source is named.

| # | Tax / statutory | Reconciliation | Report | Automation |
|---|---|---|---|---|
| I1, I6 | Tax class on the item or category picks the VAT / sales-tax code on documents per country (NO, SE, DK, FI, IS VAT; PK sales tax); rates stay in the packs (`accounts-a0.md:160`) | — | Items without a tax class | New item inherits the category's tax class and accounts |
| I10, X2 | E-invoice line ids: seller item id, standard id (GTIN), classification (EN 16931 terms; content comes from the frozen snapshot, `accounts-docout.md:205`) | — | Items without GTIN where a customer needs it | — |
| I17, X1 | PK: HS (PCT) code and FBR unit on every invoice line, Third Schedule retail price, sale type (`accounts-b.md:1005`, `:1438`); Annex-C sales register lists the HS code (`accounts-h-design.md:215-222`). SE, DK, FI: CN8, net mass and origin for Intrastat | — | PK items missing HS code or unit (refused at approval otherwise, `accounts-b.md:2541`) | Fill line fields from the item; warn at item save, not only at invoice approval |
| S1, C10 | Year-end stock value in the annual accounts and tax return in every country; NO SAF-T and SIE SE carry stock only as GL lines on stock accounts (GK) | Stock ledger value = GL balance of INVENTORY-role accounts, per company and location, daily | Valuation report with GL beside it (R3) | Daily tie-out job; alert on any difference (money guardrail, roadmap:173) |
| S2, C2 | VAT on the bill and invoice, not on the move; own-use withdrawals can carry output VAT (GK, SE / NO / DK / FI) | GRNI balance = received-not-billed receipt lines; bills clear by `receivedValue` (`accounts-c.md:218`) | GRNI ageing by supplier and receipt | Auto-receipt from a supplier e-invoice or ASN that matches an order (with Purchase; Peppol receive, roadmap:111); COGS posted on delivery without a person |
| S3b | None inside one company | In-transit stock = dispatched not received | Transfers in transit and their age | Receipt reminder after N days |
| S3c | Two sales: VAT (cross-border rules), PK sales tax; transfer pricing documentation (GK) | Inter-company receivable = payable; unrealised profit in group stock | Inter-company stock and margin | Phase 7 |
| S4 | Year-end count list is an accounting record kept for the retention period (GK; SE, NO bookkeeping rules); count needed for the annual stock value | Counted value vs book value, per count, before posting | Count variance report (R5) | Post variances under a company value limit automatically; above it, to approval; recount over tolerance |
| S5, C7 | Write-downs reduce taxable profit under each country's lowest-value rules (GK) | Provision account balance vs provision report | Ageing and slow-moving (R4) | Suggested write-down from ageing rules, a person approves |
| S7 | Pharma and food traceability (GK) | Lot quantities = item quantity | Expiry list | Expiry alert; FEFO issue |
| S9, C6 | Valuation method per country (§4.9) | Revaluation journal = change in valuation report | Valuation per method | — |
| S10, P1 | — | — | Below-reorder list (R6) | Nightly suggestions; low-stock alert to the buyer; purchase orders drafted with Purchase |
| X3 | Intrastat arrivals and dispatches above thresholds (SE, DK, FI; not NO, IS) (GK) | Intrastat values vs EU purchases and sales on the VAT return | Intrastat draft | Draft from posted documents |
| X4 | Retention per country (pack `retention-rules.csv`) | — | — | Purge only through the retention controls (roadmap:160) |

## 4. The eleven stock features (Jabran's list)

Every posting below goes through the posting connection of roadmap 5.13 (AccountsPostingV2 core, roadmap:121), as
journal type **IV** "Stock" (`ADR-018:33`; type list `BE/docs/api/accounts-a1.md:108`, label `:1065`), by the
Inventory machine client with scope `accounts.posting.write`, pinned to journal type IV and control kinds INVENTORY
and GRNI (`accounts-a1.md:65`, `:73`; `accounts-c.md:218`). Inventory is our own module, so it posts directly, not as
a draft (the draft default of ADR-021 Q14 is for outside systems, `ADR-021:235`). Idempotency follows ADR-018 §5
(`{MOVE_TYPE}:{moveId}:{n}`, `ADR-018:65`). The move date sets the period; a move into a closed period is refused
(§8.7). Account roles are those of §2.2. Dimensions on each line follow §8.3.

### 4.1 Stock on hand per item, location and company

- **In v1.** Quantity per item × stock location, rolled up to branch and company; value per item × company (§4.9 and
  decision 7). Stored balances updated in the move transaction, never summed from all moves on a read (ADR-024
  "stored totals", `WS/docs/drafts/ADR-024-data-at-scale.md:17`).
- **Why:** it is the first question every user asks, and ADR-023 keeps "stock on hand" as a level 1 module report
  (`ADR-023:26`).
- **Posting:** none of its own. The stock value equals the GL balance of the INVENTORY-role accounts, checked daily
  (§8.8).

### 4.2 Receipts and issues

- **In v1:** goods in from a purchase, goods out to a sale, issues to internal use and to projects, and both kinds of
  return. Before Purchasing and Sales exist, the source document is an Accounts bill or invoice line that names an
  item and a location (decision 8).
- **Why:** without receipts and issues there is no stock; ADR-018 fixes who posts what (`ADR-018:40-41`).

| Move | When | Journal (IV unless named) |
|---|---|---|
| Goods receipt (Purchasing, or a bill line with a stock item) | On receipt date | DR INVENTORY (branch, location) / CR GRNI (party supplier), at the order or bill price in company currency (`ADR-018:41`) |
| Bill for that receipt | On bill posting, by Accounts C (journal PI) | DR GRNI `receivedValue`, DR / CR PURCHASE_PRICE_VARIANCE the difference (`accounts-c.md:218`); decision 9 for the variance |
| Issue to a sale (Sales delivery, or an invoice line with a stock item) | On delivery date, or invoice date when invoice-driven | DR COGS (item and the line's dimensions) / CR INVENTORY, at FIFO or average cost (`ADR-018:40`) |
| Sales return (credit note line with `sourceLineId`) | On return | DR INVENTORY / CR COGS at the original cost (`ADR-018:40`) |
| Purchase return (debit note) | On return | DR GRNI / CR INVENTORY; the debit note credits GRNI (`accounts-c.md:1205`) |
| Issue to internal use | On issue | DR the reason's expense account (cost centre) / CR INVENTORY |
| Issue to a project | On issue | DR the project cost account with the project dimension / CR INVENTORY |

GK: in SE, NO, DK and FI, taking goods for own use outside the business can be a taxable withdrawal for VAT. v1 posts
the cost only; the VAT, where due, is a manual Accounts entry until a reason carries a tax rule (§6).

### 4.3 Transfers

| Kind | Phase | Why | Journal |
|---|---|---|---|
| Between locations of one branch | v1 | Daily shop and warehouse work | IV: DR INVENTORY (location B) / CR INVENTORY (location A), same value; only when the account carries the location tag (1460 does: `se-bas.csv:29`). No posting when it does not |
| Between branches of one company, through an in-transit location (requested → in transit → received) | v1 | Feature `INTER_BRANCH_TRANSFERS` (`V41:118`); the state model is the one ADR-007 and ADR-009 require for stores (`ADR-007:88`, `BE/docs/adr/ADR-009-edge-sync-endpoint-routing-and-idempotent-posting.md:94`) | IV at dispatch: DR INVENTORY (in-transit, branch B) / CR INVENTORY (branch A); at receipt: DR INVENTORY (location in B) / CR INVENTORY (in-transit). Transit loss on receipt goes to INVENTORY_ADJUSTMENT. Branch P&L is untouched; the balance sheet shows stock per branch |
| Between companies of a group, at a transfer price, both books | Phase 7 | Two legal entities: a sale in one company and a purchase in the other, with VAT and inter-company balances; one company never posts into another's books (`RULES.md:126-127`; `ADR-018:49`); profit in unsold stock is eliminated on consolidation (roadmap:151) | Company A: invoice through Accounts B (revenue, INTERCOMPANY receivable, VAT) and IV DR COGS / CR INVENTORY at cost. Company B: bill through Accounts C and IV DR INVENTORY / CR GRNI at the transfer price. Both legs linked by one transfer id. Decision 13 |

### 4.4 Stock counts

- **In v1:** full count (year end), cycle counts (a subset by location, category or ABC class later), count sheets on
  a phone with hardware-scanner input, count approval, variance posting, and the period-close link. Feature
  `STOCK_COUNT` per branch (`V41:120`).
- **Flow:** create a count (scope, cut-off time) → the system freezes the expected quantity per line at cut-off →
  counters enter quantities (blind by default: expected quantity hidden) → recount lines over a tolerance → review
  the differences (quantity and value) → approve → post. Moves after cut-off are kept apart, so counting does not
  stop the shop.
- **Approval:** the counter cannot approve their own count's variances; above a company value limit a second
  approver signs, on the shared approval-limit model (roadmap:91-95 shows the AL slices). Decision 15.
- **Journal:** IV at the count date: DR or CR INVENTORY against INVENTORY_ADJUSTMENT (4395 base, 4969 SE:
  `accounts-packs-2026-2.md:280`, `se-bas.csv:176`), with location and branch.
- **Close link:** an open or unposted count dated in a period shows on that period's close checklist; for the last
  period of the year a missing full or cycle-complete count is a warning, and a company may make it blocking
  (decision 15). The checklist itself is Accounts A2 C-14 (`BE/docs/api/accounts-a2.md:87`).
- **Phone screens:** count entry is a top phone task. It uses the number keyboard with Done and refuses letters (ux
  §25 touch entry, `UX1/ux-principles.md:284`); quantities are never cut (`UX1/ux-principles.md:278`); checked at the
  QA sizes 375×667, 667×375, 874×402, 744, 1032, 1376, 1440 (`UX1/screen-standard.md:342-361`).

### 4.5 Adjustments and write-downs

- **In v1:** adjustments with a reason from a company list (damage, shrinkage, theft, samples, own use, found stock,
  expiry), each reason mapped to an account role or account; write-downs to net realisable value for slow, damaged or
  obsolete stock, from the ageing report (§4.11). Every adjustment asks a reason (ux §5) and goes to approval above a
  company value limit.
- **Why:** stock that never shrinks is wrong stock; IAS 2 and the Nordic acts want stock at the lower of cost and net
  realisable value (GK).
- **Journals (IV):** adjustment: DR the reason's account (default INVENTORY_ADJUSTMENT) / CR INVENTORY (or the
  reverse for found stock). NRV write-down: DR a write-down expense / CR the inventory provision account (1490
  "Provision for obsolete inventory", type INVENTORY_PROVISION, in the base and PK charts:
  `packs/2026.2/base-ifrs.csv:41`, `packs/2026.2/pk.csv:42`). SE and DK charts have no such account and no role
  exists for it; a pack edition adds a role and the accounts (decision 16). The provision is reviewed each close and
  released when the stock is sold or scrapped.

### 4.6 Reservations: allocated versus available

- **In v1 (model):** each item × location shows on hand, reserved and available (= on hand − reserved). In v1 the
  only reservations are transfer requests. Sales orders reserve with Sales; production with Manufacturing. No
  manual reservations in v1.
- **Why:** the three numbers must exist from the start, or every later module adds its own idea of "available".
- **Posting:** none.

### 4.7 Batch / lot, serial numbers, expiry

- **Later (INV-9)**, feature `BATCH_SERIAL` (`V41:117`). Every stock move carries nullable lot and serial ids from
  v1, so turning it on later needs no change to the move table.
- **Why later:** it touches every move screen (pick a lot, scan a serial) and every count; the first customers in the
  sources (Swedish retail and trading, roadmap:18) can start without it. Food, pharma and electronics customers need it,
  so it is the first slice after v1 (decision 14).
- **Posting:** none extra; FIFO by expiry (FEFO) changes which lot is issued, not the journal.

### 4.8 Units of measure and conversions

- **In v1:** one base unit per item, from the UN/ECE Recommendation 20 list Accounts already uses (`accounts-b.md:1437`;
  31 codes in `packs/2026.2/units-of-measure.csv`, all UNCHECKED); alternate units with a fixed factor per item (box of
  12, pallet of 40 boxes), each optionally a purchase or sales default and with its own barcode. Pakistan lines map
  each unit to FBR's unit list (FBR reference cache `UOM`, `BE/docs/api/accounts-docout.md:300`).
- **Why:** wholesale buys by the case and sells by the piece; FBR and e-invoices require a unit per line.
- Stock is always kept in the base unit. Quantities carry up to the unit's decimals (piece 0, kg 3). Catch weight is
  later (I12).
- **Posting:** none.

### 4.9 Valuation and revaluation

- **In v1:** FIFO and moving weighted average; one method per company, chosen at Inventory setup and fixed once the
  first move posts (a change later is a dated revaluation event, by an accountant, with a reason). Valuation pool is
  item × company (decision 7). Standard cost comes with Manufacturing; LIFO is not offered (C5).
- **Country rules (GK, check per country):** SE and NO tax rules lean on FIFO (first in, first out) with the lowest
  value rule; FI, DK and IS accept FIFO or weighted average; PK follows IAS 2 (FIFO or weighted average). So FIFO is
  the safe default for SE and NO, and average is allowed elsewhere (decision 5).
- **Revaluation (v1):** a person with the revalue right sets a new unit cost for an item from a date, with a reason;
  journal IV DR / CR INVENTORY against INVENTORY_ADJUSTMENT (or a revaluation account by setting) for the quantity on
  hand. Under FIFO it revalues the open cost layers.
- **Currency:** stock is valued in company currency only; a foreign receipt is converted at the receipt date's rate
  (needs multi-currency, roadmap:117). The bill's rate difference is Accounts' realised FX, not stock.

### 4.10 Reorder points, minimum stock and purchase suggestions

- **In v1:** per item × location a reorder point, a minimum and a maximum (or order-up-to level); a "Below reorder
  point" list with a suggested quantity (up to maximum, in the purchase unit). Export to Excel. With Purchase the
  list becomes "Create purchase orders" (P2); transfer suggestions between locations come later (P3).
- **Why:** it is the most-used planning tool in small and mid-size ERPs (GK), and it needs only Inventory data.
- **Posting:** none.

### 4.11 Stock reports and the reporting layer

| Report | Level (ADR-023 D1, `ADR-023:24-31`) | Phase |
|---|---|---|
| Stock list: on hand, reserved, available, value, by item, category, location, branch | 1, Inventory, live | v1 |
| Movement history per item and location, drill to the source document and journal | 1 | v1 |
| Valuation report as of any date, per account and location, with the GL balance beside it and the difference | 1 | v1 |
| Ageing (by receipt date or FIFO layer) and slow-moving stock | 1 | v1 |
| Count variances, below-reorder list | 1 | v1 |
| Gross margin by item and category; stock value by dimension across companies | 2, reporting-service | Later (roadmap:155, L.6) |
| KPI tiles: stock value, days of stock, turnover | 3 | Later |
| Self-service pivot over stock facts | 4 (`ANALYTICS` add-on, `ADR-023:175`) | Later |

- Level 1 reports are the book of record and stay in Inventory (`ADR-023:34`). For levels 2-4, Inventory writes a
  short reporting contract (events and facts per move, valuation and count) as ADR-023 D2 asks (`ADR-023:44`).
- Big lists use keyset paging and capped counts (ADR-024 D3, `ADR-024-data-at-scale.md:60`); large exports run as
  background jobs with a notification (ux §14).

## 5. Cross-module map

Features that touch Inventory but belong to another module. Inventory leaves the hooks named here.

| Feature | Owner | Inventory provides | Depends on | Phase |
|---|---|---|---|---|
| Price lists, customer price levels, quantity and date prices, discounts, campaigns, bundles pricing, price override rights, tax on discounts (incl. PK retail-price tax) | Sales | Base price, units, variants, tax class (§2.7, §2.8) | Sales scope | With Sales |
| Supplier prices and discounts, supplier item numbers, lead times | Purchase | Units, item ids | Purchase scope | With Purchase |
| Purchase requests and orders; goods receipt document; three-way matching | Purchase (`ADR-018:30`) | Receipt move and GRNI posting (§4.2) | Purchase v1; GRNI owner row move (backlog:242) | With Purchase |
| Quotes, sales orders, deliveries, pick / pack / ship | Sales (`ADR-018:29`) | Reservations, issue move and COGS (§4.2, §4.6) | Sales v1 | With Sales |
| Returns and RMA (authorisation, inspection, restock or scrap) | Sales (customer side), Purchase (supplier side) | Returns locations, return moves at original cost | Sales, Purchase | With Sales / Purchase |
| Landed costs (freight, duty, insurance) | Purchase (charges on bills), Accounts C | Revaluation of the receipt's layers | Purchase v1; decision 9 | With Purchase |
| Bills of material, assembly, production orders, standard cost, MRP | Manufacturing (catalogued, `V41:131-135`) | Component issue and output receipt moves | A Manufacturing module decision | With Manufacturing |
| Quality inspection, quarantine release | Manufacturing `QUALITY_CONTROL` (`V41:133`) / Purchase receiving | Returns-type locations now; stock status later | Manufacturing or Purchase | Later |
| Project issues and project stock | Projects (future; project dimension today, `ADR-021:224`) | Issue to project (§4.2) | Project dimension (built) | v1 issue; project module later |
| Fixed-asset items | Accounts AC-FA (roadmap:134) | Item type I4 hands the receipt to the register | AC-FA | With fixed assets |
| Budgets by product (quantity × price) | Accounts budgets (`ADR-022:77`) | Quantity actuals by item (Q14, `ADR-022:267`) | Budgets stage 1 (roadmap:101) | Later |
| Budget check on stock purchases | Purchase calls ADR-022 stage 2 (`ADR-022:193`) | Nothing: "stock purchases go through Purchasing's check point" | ADR-022 stage 2 (roadmap:154) | With Purchase |
| Warehouse mobile scanning (camera), label printing | Inventory (later) | — | Document output 5.1 | Later |
| Point of sale and offline stores | POS (`SALES.POINT_OF_SALE`, `V41:123`; ADR-007, ADR-009 Proposed) | Append-only moves, so a store server can own on-hand later (`ADR-009:39`) | ADR-007 accepted | With POS |
| E-commerce stock and item sync | Integration API (outside systems) | Item and on-hand read API, stock move write API | Machine-client model (`ADR-021:178-186`) | Later |
| EDI (orders, despatch advice, price catalogues) | Sales and Purchase | Item ids, GTINs | Peppol access point choice (roadmap:262) | Later |
| Intrastat | Accounts E with Sales and Purchase | CN8, net mass, origin, supplementary unit on items | E (roadmap:140) | Later |
| Inter-company transfers and consolidation | Accounts Phase 7 (roadmap:151) | Transfer id linking both legs | Phase 7, group catalogue | Phase 7 |
| Expense claims with goods | HR / Accounts (`large-customer-roadmap.md:52`) | None (non-stock) | — | Not linked |

## 6. Country needs

All rows are GK unless a repo source is named; each needs the country accountant's check (ERP-Q1, roadmap:178).

| Country | VAT / sales tax on goods | Statutory files | E-invoice item data | Stock rules | Other |
|---|---|---|---|---|---|
| SE | Standard and reduced rates by goods type (food, books); rates from the tax pack (`packs/2026.2/tax-codes.csv`), the item holds only a tax class | SIE 4 has no stock records; stock shows as GL lines on group 14 accounts (`se-bas.csv:29`) | Peppol BIS / Svefaktura line: item name, seller id, GTIN, unit (Rec 20); optional at SE launch (roadmap:110) | FIFO and lowest value for tax; year-end count and stock list kept as accounting records (BFL retention) | Intrastat (SCB) above threshold; own-use withdrawal VAT |
| NO | 25 % standard, 15 % food, 12 % lower rate; from the pack | SAF-T Financial carries GL lines only, no stock section; SAF-T Cash Register is for POS, not Inventory | EHF / Peppol BIS lines as SE; required for B2B from 2027-01-01 (roadmap:110, gate L-1) | FIFO for tax; year-end stock specification (bokføringsforskriften) | No Intrastat (EEA, not EU); customs on imports; bottle deposit |
| DK | 25 %; from the pack | SAF-T from 2027-01-01 (ACC-R2, roadmap:141) carries GL lines; stock accounts mapped to the standard chart (1460 → 6140; stock movement 1770 still *(verify)*: `accounts-packs-2026-2.md:307`, `:331`) | OIOUBL / Peppol BIS lines as SE | FIFO or average; lowest value | Intrastat (Danmarks Statistik); deposit |
| FI | Standard and reduced rates; from the pack | No SAF-T; tax authority reads the books | Finvoice / Peppol lines | FIFO or average (KPL); lowest value | Intrastat (Tulli) |
| IS | Standard and reduced rates; from the pack | No SAF-T today | Peppol lines | FIFO or average | No Intrastat (EEA) |
| PK | Sales tax on goods (standard rate, further tax for unregistered buyers, Third Schedule retail-price tax); `retailPrice`, `saleType`, `scheduleRef` on lines (`accounts-b.md:1438`) | Annex-C sales register with HS code per invoice line (`accounts-h-design.md:215`) | FBR Digital Invoicing: HS code, FBR unit, quantity per line (`accounts-b.md:1005`, `:2051`; FBR reference cache `HS_CODES`, `UOM`, `accounts-docout.md:300`). Until Inventory exists the line text stands in and the export warns (`accounts-h-design.md:221-222`) | IAS 2 (FIFO or weighted average); registered persons keep records of goods and stock (Sales Tax Act s.22) | Tier-1 retailer POS integration with FBR (with POS); provincial sales tax is on services, not goods |

What Inventory owes each country in v1: the item fields (I17), units mapped to Rec 20 and FBR units (§4.8), a tax
class per item and category (§2.2), valuation methods allowed per country (decision 5), the count records and their
retention (X4). Return files and Intrastat stay in Accounts E (roadmap:140).

## 7. Large multi-company needs

- **Shared item master or per-company items:** §2.4 and decision 3. v1 per company, model ready for a group catalogue.
- **Inter-company stock:** §4.3 and decision 13. Phase 7, because both books and VAT are involved.
- **Many warehouses and locations:** locations are Org's, counted against the agreement's `WAREHOUSES` limit, either
  as a company pool or per branch (`BE/docs/modules/org/stock-locations.md:41-44`). Inventory adds per-location
  settings (L2) and, later, bins (L4). Org cannot know whether a location holds stock, so **deactivating a location
  with stock on hand must be refused**: Org asks Inventory before deactivating (new rule; today only the default
  location is protected, `stock-locations.md:53-54`).
- **Volumes (assumed large tenant, to confirm):** 30 companies (the ADR-023 D14 tenant, `ADR-023:135`), 100,000 items
  with variants, 300 locations, 20 million stock moves a year in retail. Consequences:
  - stored balances per item × location and per valuation layer (ADR-024 stored totals, `ADR-024-data-at-scale.md:17`);
  - keyset paging and capped counts on items, moves and counts (ADR-024 D3, `:60`); trigram search on item number,
    name and barcode (ADR-024 Stage 1, `:85`); UUID v7 on moves (`:81`);
  - stock moves partitioned by year only on a measured trigger (ADR-024 D7, `:64`);
  - 20 million moves must not become 20 million journal lines (the D14 tenant plans 2 million a year,
    `ADR-023:135`): high-volume sources post daily summaries (decision 12);
  - load test with a generated large tenant before the first large customer (gate G.12, roadmap:180).
- **Permissions:** reserved roles Inventory Manager and Stock Clerk; the Location Manager gains stock moves and counts
  (`BE/docs/security/standard-roles.md:264`), scoped to a branch or a stock location (`standard-roles.md:78`). Codes
  are decided in the contract step, one per action (`App/docs/design/module-sequence.md:36-43`). Proposed principles:
  separate codes for moves, counts, approve counts, adjustments, approve adjustments, revalue, item maintenance,
  category maintenance, settings; **values visible only with a value-read code** (decision 18); approvals use the
  shared approval-limit model; branch-limited access follows the platform lane (backlog:361).
- **Entitlement:** Inventory's five catalogued features map to the catalogue: `STOCK_BY_WAREHOUSE` → S1 per
  location, `INTER_BRANCH_TRANSFERS` → S3b, `INVENTORY_VALUATION` → C1 (decision 6), `STOCK_COUNT` → S4,
  `BATCH_SERIAL` → S7 (`V41:116-120`). Reorder, variants and reservations need no feature row in v1 (they are always
  on with the module). Everything large-customer stays off by default (`large-customer-roadmap.md:11`).
- **Franchise:** a franchise is its own company and keeps its own items unless it opts into a group catalogue
  (`RULES.md:154-167`).

## 8. Links to Accounts

### 8.1 The posting connection (roadmap 5.13)

- Inventory posts through AccountsPostingV2 core (roadmap:121; decision 6 there recommends Phase 5 after D,
  roadmap:253-254). Inventory therefore cannot post before 5.13 lands.
- A real machine client needs the posting endpoints' compile-time pin to the test client changed to config
  (backlog:81), and IV's `machine_allowed` flag is not enough on its own (backlog:86).
- The Inventory client is pinned to source module INVENTORY, journal type IV and control kinds INVENTORY and GRNI
  (`accounts-a1.md:65`; GRNI pinning `accounts-c.md:218`). Every call checks module FINANCE and INVENTORY fresh
  (`ADR-018:89`).
- The GRNI owner row and the reclassification of the GRNI accounts move with the first Purchasing / Inventory
  migration (backlog:242; `accounts-b.md:2860-2861`; roadmap L.12, `:161`).

### 8.2 Journals Inventory posts (all type IV)

| Event | DR | CR | Section |
|---|---|---|---|
| Goods receipt | INVENTORY | GRNI | §4.2 |
| Purchase return | GRNI | INVENTORY | §4.2 |
| Issue to sale | COGS | INVENTORY | §4.2 |
| Sales return | INVENTORY | COGS | §4.2 |
| Internal use / project issue | Reason's expense / project cost account | INVENTORY | §4.2 |
| Transfer (location or branch, via in transit) | INVENTORY (to) | INVENTORY (from) | §4.3 |
| Count variance, adjustment | INVENTORY_ADJUSTMENT or reason's account (or reverse) | INVENTORY (or reverse) | §4.4, §4.5 |
| NRV write-down / release | Write-down expense / provision | Provision / write-down expense | §4.5 |
| Revaluation | INVENTORY or INVENTORY_ADJUSTMENT | the other | §4.9 |
| Opening stock | none if adopted (decision 10) | — | §8.7 |

Accounts C posts the bill side (PI, GRNI and price variance); Accounts B posts revenue and tax only (`ADR-018:40`).
Granularity: one journal per source document by default; a daily summary per company × location × account ×
dimension set for high-volume sources, with the stock ledger keeping the detail and the journal linking back
(decision 12).

### 8.3 Dimensions (ADR-021)

- The stock move valuation line carries `DimensionSetV1` from the start (`ADR-021:80`); dimensions are copied from the
  source line unless a person changed them (`ADR-021:85`); Inventory, as the producing module, resolves defaults and
  sends explicit values (ADR-021 D4, `ADR-021:100`).
- The Inventory slice fills `dimension_sets.item_id` and runs the Q18 set-count measurement (`ADR-021:7`, `:239`). The
  B and C lines' own `item_id` columns then move into the set (`accounts-b.md:32`, `:524`).
- Account rules decide where item may go. Today the SE stock account allows branch and stock location only, and COGS
  allows branch, cost centre and project (`se-bas.csv:29`, `:174`): item is allowed nowhere yet. **Recommendation:**
  item on P&L stock lines (COGS, adjustment, price variance) for margin and product budgets; not on INVENTORY and
  GRNI lines, whose item detail is the stock ledger. That needs a pack edition and the per-account rules of roadmap
  4.14 (`:98`). Decision 17.

### 8.4 Budgets (ADR-022)

- Inventory feeds no budget and runs no check: stock purchases are checked at Purchasing's check point
  (`ADR-022:193`).
- Inventory supplies quantity actuals by item, which ADR-022 Q14 waits for (`ADR-022:267`), so product plans
  (quantity × price, `ADR-022:77`; budgets spec B7, `App/docs/design/specs/accounts-budgets.md:234`) compare with real
  quantities. Through the reporting contract, later (R9).

### 8.5 Stock locations

- Org owns locations; Inventory holds ids and a display cache (ADR-021 D2). Location and branch must be active and in
  the company, as A1 already checks for the location tag (`accounts-a1.md:76`).
- Open Org items that block Inventory: Returns type refused by the backend (backlog:141, :195); create a location under
  another company's branch (ORG-SEC-1, backlog:139); create under an inactive branch (backlog:142). Plus the new
  "location with stock cannot be deactivated" rule (§7).

### 8.6 Multi-currency

Stock is in company currency; foreign receipts use the receipt-date rate. Needs AC-FX (roadmap:117) before a customer
receives foreign-currency purchases into stock.

### 8.7 Period close and year end

- Inventory posts only into open periods (ADR-005 rule, today enforced through engine status reads, backlog:77). A
  move dated in a closed period is refused with the reason and the first open date.
- The A2 close checklist (`accounts-a2.md:87`) gains, for companies with Inventory: blocking "stock moves not yet
  posted for the period"; warnings "stock value differs from the GL", "counts open in the period", "GRNI older than N
  days"; for the year-end period "no full count or completed cycle count" (decision 15).
- Year end: the year-end plan stops today on a bucket holding an item (`BE/docs/api/accounts-a3.md:1234`,
  `TODO(Inventory)` in `YearEnd.plan`). The Inventory slice that puts item on P&L lines must first let closing lines
  carry item. A frozen valuation report at the year-end date is kept with the count records.
- Opening stock at go-live: the opening-balance import may already have put a balance on 1460. Inventory adopts it:
  quantities and costs are imported, their total must equal the GL balance per location, and no second journal posts;
  a difference needs one adjustment journal with a reason (decision 10).

### 8.8 Control and reconciliation

- INVENTORY is a protected control kind (`accounts-a1.md:73`); bill lines refuse INVENTORY accounts (`accounts-c.md:191`);
  outside systems never post to stock control accounts (`App/docs/design/specs/accounts-integrations.md:165-166`).
- **Recommendation:** once a company has posted its first Inventory move, manual journals on INVENTORY-role accounts
  are refused, as GRNI already does once used (`accounts-c.md:218`); corrections go through Inventory adjustments.
- A daily invariant check ties stock value to the GL per company and location; it joins the money invariant checks
  (roadmap G.5, `:173`) and blocks push like the other money guardrails.

## 9. Dependencies and proposed slice order

### 9.1 Before the first Inventory slice

| Needed | Source | Why |
|---|---|---|
| AccountsPostingV2 core (5.13), machine client config | roadmap:121; backlog:81, :86 | Every stock journal |
| Domain-event relay consumers | ADR-019 accepted (`BE/docs/adr/ADR-019-domain-event-relay.md:5`) | Item display caches; invoice- and bill-driven moves (`ADR-018:76-78`) |
| ADR-026 row-level security decided | roadmap:90 | A new service should start with it |
| Org fixes: Returns type, ORG-SEC-1, inactive-branch create | backlog:139, :141-142 | Locations are Inventory's base |
| Account rules per account (4.14) and a pack edition: item tag on COGS-type accounts, write-down role | roadmap:98; §8.3, §4.5 | Item on P&L lines; NRV |
| Multi-currency (5.9) | roadmap:117 | Only for foreign purchases into stock |
| Year-end item buckets | `accounts-a3.md:1234` | Before item rides on P&L lines |
| Org catalog flips `INVENTORY` to implemented | `org.md:1521-1524` | Agreements can then include it |

### 9.2 Slices

| Slice | Holds | Risk |
|---|---|---|
| INV-0 | Contract: service, permission manifest and defaults, events, reporting contract, entitlement mapping; this scope's decisions applied | security |
| INV-1 | Item master: types, categories with defaults, starter sets, numbering, barcodes, units, country fields, tax class, import; item events; item picker on Accounts B / C lines | statutory |
| INV-1b | Variants and attributes grid | none |
| INV-2 | Stock ledger: moves, balances, valuation (FIFO, average), opening stock adoption, IV posting through 5.13, daily GL tie-out | **money** |
| INV-3 | Receipts and issues: bill- and invoice-driven moves (decision 8), manual goods in and out, internal use, projects, returns | **money** |
| INV-4 | Transfers inside a company (location, branch, in transit); reservations model | money |
| INV-5 | Adjustments, write-downs, revaluation, approval | **money** |
| INV-6 | Stock counts (full, cycle, phone sheets, approval, variance posting), close checklist rows, year-end items | **money**, statutory |
| INV-7 | Reorder points and suggestions; low-stock alerts (notification service, roadmap:96) | none |
| INV-8 | Reports (stock list, movements, valuation vs GL, ageing, slow-moving, variances) | none |
| INV-9 | Batch, lot, serial, expiry, FEFO | none |
| Later | Bins and put-away; camera scanning and labels; catch weight; group catalogue (after its ADR); transfer suggestions; ABC; consignment | — |
| With other modules | Purchase v1 (orders, goods receipt, landed costs), Sales v1 (orders, deliveries, kits, pricing), Manufacturing, POS, Phase 7 inter-company | — |

Order: INV-0 → INV-1 → INV-2 → INV-3 → INV-5 → INV-6 → INV-4 → INV-8 → INV-7 → INV-1b → INV-9, then Purchase v1 and
Sales v1 replace the document-driven moves with their own documents. Money slices get the money guardrails: a test
per finding, invariant checks before push, a second different reviewer. Each slice designs its screens at the QA sizes
(§4.4) before build, as the module loop asks (`module-sequence.md:32-34`).
