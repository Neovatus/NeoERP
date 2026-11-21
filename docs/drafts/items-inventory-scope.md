# Items and Inventory scope (draft for Jabran)

Status: **Draft, 2026-11-21 (docs lane c, Opus drafter).** It approves nothing. Jabran decides §10.
Brief: `docs/agents/inv-scope/brief.md`, plus three additions from Jabran on 2026-11-21 sent through the lead (the
eleven named features, the item master structure, the pricing boundary, the full catalogue, payments and tax).
Round 2 fixes for review 1 are listed in §12. **Final home:** once Jabran signs it off, the approved scope moves to
`docs/agents/inventory/scope.md`, as the module loop asks (`App/docs/module-sequence.md:29-31`).

Short names: **BE** = `NeoERP-BackEnd`, **App** = `NeoERP-App`, **WS** = this workspace, **UX1** =
`NeoERP-worktrees/ux1/docs/design` (UX-1 revision of the design docs). `roadmap:N` = `WS/docs/drafts/accounts-roadmap.md`
line N. `backlog:N` = `WS/docs/backlog.md` line N. `packs/` = `BE/services/accounts-service/src/main/resources/packs/`.
Code repos read at BE `phase/4` `d0dd5441` and App checkout as found, read only.

**GK** marks a country or practice statement taken from general knowledge, not from a repo source. A reviewer or the
country accountant (gate ERP-Q1, roadmap:178) must check every GK line before it drives a build.

## 1. What this module is and where it stands

- Inventory is a commercial module (`INVENTORY`) in the Org catalog with `implemented: false`, so no agreement may
  include it yet (`BE/docs/api/org.md:1513`, `:1521-1524`). Its five features are already catalogued as included
  features that are **on by default once the module is on**: `STOCK_BY_WAREHOUSE` (branch), `BATCH_SERIAL`,
  `INTER_BRANCH_TRANSFERS`, `INVENTORY_VALUATION` (company), `STOCK_COUNT` (branch)
  (`BE/shared/entitlement-catalog/src/main/kotlin/com/neovatus/entitlement/catalog/EntitlementCatalog.kt:173-178`,
  `default = true`). The same codes and scopes are in Org's migration
  (`BE/services/org-service/src/main/resources/db/migration/V41__fe_upgrade_entitlement_rows.sql:116-120`); its
  `FALSE` column there means "not statutory", not "off" (column list `V41:19-26`).
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
  `BE/docs/adr/ADR-021-shared-dimensions.md:103`). A later category change asks "apply to the 214 items in this
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
ADR-018 rule. A **group catalogue** (one catalogue owned by the parent, used by its owned companies) is a company
feature `GROUP_CATALOGUE`, **off by default**, built in **INV-1c** before INV-2. Its cross-company scope ADR
(ADR-012 / ADR-013 tenant scope, next to ADR-026 row-level security, roadmap:90) is written in **INV-0**, so the
feature has a slot from day one, as the product direction asks (`large-customer-roadmap.md:7`). The default stays one
catalogue per company. A
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
and the tax class and Pakistan retail price as item facts the documents copy. The Pakistan retail price is kept per
unit and per variant, because it is printed on each unit or pack (STGO 08 of 2026, https://download1.fbr.gov.pk/Docs/202673875133134STGO08OF2026.pdf).

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
| I17 | Country fields: HS / PCT code, FBR unit, sale type, SRO schedule and item serial (reduced and exempt goods), fixed notified value or retail price (per unit and variant), CN8, net mass, country of origin, tax class | v1 (fields) | §6; PK invoices need them today (`BE/docs/api/accounts-h-design.md:221-222`); FBR DI line fields `sroScheduleNo`, `sroItemSerialNo`, `fixedNotifiedValueOrRetailPrice` (https://download1.fbr.gov.pk/Docs/20257301172130815TechnicalDocumentationforDIAPIV1.12.pdf); retail price printed on each unit or pack (STGO 08 of 2026, https://download1.fbr.gov.pk/Docs/202673875133134STGO08OF2026.pdf) |
| I18 | Item import and export (CSV / Excel, check then confirm, per-row refusals) | v1 | Large customers start with thousands of items; same pattern as OBI and ADR-021 D10 (`ADR-021:165-167`) |
| I19 | Bulk change with review step | Later | Large-customer item (`large-customer-roadmap.md:48` names it for HR; same need) |
| I20 | New-item request and approval | Later | Large groups control master data; not needed for a first customer |
| I21 | Item defaults for cost centre or project | Later | ADR-021 D4 names it as "later" (`ADR-021:97`) |
| I22 | Substitutes and alternatives | Later, with Sales | Offered when an item is out of stock |
| I23 | Customer and supplier item numbers | With Sales / With Purchase | ADR-018 §3 extension tables (`ADR-018:53`) |
| I24 | Group catalogue shared by owned companies | v1 (INV-1c), feature off by default; scope ADR in INV-0 | §2.4, decision 3 |
| I25 | Hazardous-goods data (UN numbers, classes) | Not planned | No customer type in the sources needs it; revisit with shipping |
| I26 | Item change history (audit events with before and after) | v1 | Module definition of done asks audit events with readable wording (`App/docs/module-sequence.md:61`) |
| I27 | Returnable packaging (pallets, crates, kegs) beyond the bottle deposit | Later, with Sales and Purchase | A balance of packaging per customer and supplier needs their documents |
| I28 | Rental items (out and back, charged by time) | Not planned | A rental module of its own; revisit on a customer ask |

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
| L9 | Goods in transit from a supplier (ours before arrival, by Incoterms) | With Purchase | Ownership passes by the delivery term on the order; needs Purchase's documents |

### 3.3 Stock movements and control (the eleven features, detail in §4)

| # | Feature | Phase | Why |
|---|---|---|---|
| S1 | Stock on hand per item, location, company (quantity and value) | v1 | §4.1 |
| S2 | Receipts and issues (purchase, sale, internal use, projects, returns) | v1 | §4.2 |
| S3a | Transfers between locations of one branch | v1 | §4.3 |
| S3b | Transfers between branches of one company (in transit) | v1 | §4.3; feature `INTER_BRANCH_TRANSFERS` |
| S3c-1 | Linked inter-company transfer: one transfer id, each company posts only its own documents, transfer price, stock in transit | Later (INV-4b), after INV-4 and the scope ADR; feature off by default | §4.3, decision 13 |
| S3c-2 | Inter-company reconciliation and elimination of unrealised profit in group stock | Phase 7 | §4.3, decision 13 |
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
| P10 | Camera barcode scanning on phones | v1 for counts (INV-6, decision 21); later for receipts, transfers and picking | Jabran asked for phone scanning on counts; hardware scanners also work as typed input |
| P11 | Barcode label printing | Later, with document output | Uses the PDF pipeline of 5.1 |
| P12 | Wave and batch picking | Not planned | High-volume warehouse only; revisit with bins |

### 3.5 Costing and Accounts

| # | Feature | Phase | Why |
|---|---|---|---|
| C1 | Perpetual stock postings (stock value, COGS) | v1 | `ADR-018:40-41`; decision 6 for the off case |
| C2 | GRNI at receipt, cleared by the bill | v1 (Accounts side built) | `BE/docs/api/accounts-c.md:218` |
| C3 | FIFO and moving weighted average | v1 | §4.9, decision 5 |
| C4 | Standard cost with variances | With Manufacturing | Needs routings and production costing (`V41:135`) |
| C5 | LIFO | Not planned | Not allowed under IAS 2 (GK); FI bookkeeping law allows it (KPL 4:5.4, review 1 spot-check 7), but no customer need is known |
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
| R10 | Stock in the books versus stock for tax (NO: no write-downs for tax; SE: 97 % rule) | v1 | Needed for the tax return (§4.5) |

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

### 3.9 Payments, tax, reconciliation, report and automation per feature and country

Answers the common brief's five questions (`docs/agents/design-brief-common.md`, "Not only an ERP"). **Payments:**
stock moves move no money, so the column says "none" except where money really moves (landed costs, import VAT and
duty, deposits, inter-company settlement). Country cells marked GK need ERP-Q1; sources are named where the review
checked them. Every catalogue feature is in exactly one row; the last row lists those where all five answers are
"none".

| # | Country | Payments | Tax / statutory | Reconciliation | Report | Automation |
|---|---|---|---|---|---|---|
| I1, I6 | All | None | Tax class on item or category picks the VAT or sales-tax code per country; rates stay in the packs (`accounts-a0.md:160`) | — | Items without a tax class | New item inherits category tax class and accounts |
| I10, X2 | NO, SE, DK, FI, IS | None | E-invoice line ids: seller id, GTIN, classification (EN 16931; from the frozen snapshot, `accounts-docout.md:205`); NO B2B from 2027-01-01 (roadmap:110) | — | Items without GTIN where a customer needs it | Fill line ids from the item |
| I17, X1 | PK | None | HS (PCT) code, FBR unit, quantity, sale type, SRO schedule and item serial (reduced and exempt goods), fixed notified value or retail price per line (`accounts-b.md:1005`, `:1438`; FBR DI fields per review 1, https://download1.fbr.gov.pk/Docs/20257301172130815TechnicalDocumentationforDIAPIV1.12.pdf); Annex-C lists the HS code (`accounts-h-design.md:215-222`) | Annex-C lines vs posted invoices (Accounts E) | PK items missing HS code, unit or SRO data (refused at approval otherwise, `accounts-b.md:2541`) | Fill line fields from the item; warn at item save |
| I17, X3 | SE, DK, FI | None | Intrastat: CN8, net mass, origin, supplementary unit, above thresholds (GK) | Intrastat values vs EU purchases and sales on the VAT return | Intrastat draft (later) | Draft from posted documents |
| I17, X3 | NO, IS | None | No Intrastat (EEA, not EU); customs declarations carry the commodity code (GK) | — | — | — |
| I5 | NO, SE, DK, FI | Deposit amounts settled with the national deposit scheme (GK) | Deposit is outside VAT or taxed per country rule (GK) | Deposits charged vs deposits paid to the scheme | Deposit report | Add the deposit line from the item |
| S1, C10 | All | None | Year-end stock value in the annual accounts and the tax return | Stock ledger value = GL balance of INVENTORY-role accounts, per company and location, daily | Valuation with GL beside it (R3) | Daily tie-out job; alert on any difference (roadmap:173) |
| S1, C10 | NO | None | SAF-T Financial carries GL lines only, no stock section (https://www.skatteetaten.no/en/business-and-organisation/start-and-run/best-practices-accounting-and-cash-register-systems/saf-t-financial/questions-and-answers---saf-t-financial/); stock for tax at FIFO cost without write-downs (skatteloven § 14-5 (2) b, c, https://lovdata.no/lov/1999-03-26-14/§14-5) | Books vs tax stock difference | R10 | Difference computed at year end |
| S1, C10 | SE | None | SIE 4 carries stock as GL lines only (GK); 97 % rule must match the books (https://skatteverket.se/foretag/drivaforetag/foretagsformer/aktiebolag/varulager.4.1df9c71e181083ce6f6371.html) | Provision (97 % or NRV) vs valuation report | R10 | Proposed 97 % journal at year end, a person approves |
| S1, C10 | DK | None | SAF-T from 2027-01-01 with GL lines (roadmap:141); stock accounts mapped to the standard chart (`accounts-packs-2026-2.md:307`, `:336`) | Day-price write-down vs books (https://tax.dk/jv/cc/C_C_2_3_1_6_1.htm) | R10 | — |
| S1, C10 | FI, IS | None | Stock in the annual accounts; tax rule not verified (GK) | As All | R3 | As All |
| S1, C10 | PK | None | IAS 2 stock in the annual accounts; stock records kept for sales tax (Sales Tax Act s.22, GK) | As All | R3 | As All |
| S2, C2 | All | None (payment is on the bill or invoice) | VAT or sales tax on the bill and invoice, not on the move | GRNI per receipt line never debit; GRNI = received not billed (`accounts-c.md:218`; decision 8) | GRNI ageing | Receipt first in the bill approval (decision 8); auto-receipt from a matching supplier e-invoice or ASN with Purchase (roadmap:111) |
| S2 (own use) | NO, SE, DK, FI | None | Own-use withdrawal can carry output VAT (GK) | — | Own-use issues by reason | Reason carries a tax rule (later) |
| S3a, S3b | All | None | None inside one company | In transit = dispatched not received | Transfers in transit and age | Receipt reminder after N days |
| S3c-1 | All | Inter-company settlement between the two companies (Accounts D, later netting) | Transfer-pricing documentation (GK); the transfer price posts in both books in every case | A's `AR_CONTROL` for customer B = B's `AP_CONTROL` for supplier A, per transfer id (`linkedCompanyId`, PR-9) | Inter-company stock and margin | Bill in B drafted from A's invoice |
| S3c-1 | NO | As All | No VAT between companies in one VAT group (fellesregistrering, mval § 2-2 (3)): they count as one VAT subject (https://www.skatteetaten.no/en/rettskilder/type/uttalelser/bfu/fellesregistrering---omsetning-fra-utenlandsk-hovedkontor-til-norsk-filial-og-omsetning-mellom-filial-og-fellesregistrerte-selskaper/); normal VAT otherwise | VAT group membership per company pair, dated | Transfers with and without VAT | Tax code picked from the pair's VAT-group fact |
| S3c-1 | SE, DK, FI | As All | VAT groups exist (SE mervärdesskattegrupp, DK fællesregistrering, FI arvonlisäverotusryhmä): no VAT inside one; normal and cross-border rules otherwise (GK, for ERP-Q1) | As NO | As NO | As NO |
| S3c-1 | IS | As All | VAT-group rule not checked (GK, for ERP-Q1) | As NO | As NO | As NO |
| S3c-1 | PK | As All | Sales tax on the invoice between separate registered persons; no group relief known (GK, for ERP-Q1) | As All | As All | As All |
| S3c-2 | All | None | Consolidation (Phase 7) | Unrealised profit in group stock | Consolidation report | Phase 7 |
| S4 | NO | None | Yearly count, list per item (kind, quantity, value), kept 5 years (bokføringsforskriften § 6-1, secondary source https://revisorforeningen.no/revisornytt/varetelling1120) | Counted vs book value before posting | R5 | Post under a value limit, approval above; recount over tolerance |
| S4 | SE | None | Year-end count and stock list kept as accounting records (Skatteverket page above) | As NO | R5 | As NO |
| S4 | DK, FI, IS, PK | None | Count supports the year-end value; record rules not verified (GK) | As NO | R5 | As NO |
| S5, C7 | NO | None | Write-downs ignored for tax (§ 14-5 (2) c) | Provision vs R10 difference | R4, R10 | Suggested write-down from ageing, a person approves |
| S5, C7 | SE | None | Lowest value and 97 % rule, booked (IL 17 kap. 4 §) | Provision vs valuation | R4, R10 | As NO |
| S5, C7 | DK | None | Write-down to day price (Juridisk vejledning C.C.2.3.1.6.1) | Provision vs valuation | R4 | As NO |
| S5, C7 | FI, IS, PK | None | Lowest value in the books; tax not verified (GK) | Provision vs valuation | R4 | As NO |
| S7 | PK, all | None | Pharma lot and expiry duties (DRAP, GK); food traceability (GK) | Lot quantities = item quantity | Expiry list | Expiry alert; FEFO issue |
| S8 | PK | None | FBR unit depends on the HS code (review 1 finding 9) | — | Items whose unit does not fit their HS code | Propose the FBR unit from the HS code (FBR reference cache `HS_CODES`, `UOM`, `accounts-docout.md:300`) |
| S8 | All others | None | Rec 20 unit code on e-invoice lines (`accounts-b.md:1437`) | — | — | Default unit from the category |
| S9, C3, C6 | All | None | Method per country (§4.9) | Revaluation journal = change in valuation report | Valuation per method | — |
| S12 | All | None | — | Negative stock corrected at the next receipt's cost; difference to INVENTORY_ADJUSTMENT | Negative items, daily | Alert on any negative balance |
| S13 | All | None | Opening stock value in the opening balance | Imported stock = GL opening balance per account, per location where tagged (decision 10) | Opening tie-out | Refuse the import until it ties |
| C8 | NO, SE | Freight, duty and import VAT paid to forwarders or customs (with Purchase) | Import VAT reported in the VAT return (GK) | Landed costs on bills vs costs added to stock | Landed cost per receipt | Spread charges by value or weight |
| C8 | DK, FI, IS | As NO | Import VAT at customs or in the return, per country (GK) | As NO | As NO | As NO |
| C8 | PK | Duty and sales tax paid at import (GK) | Imported Third Schedule goods valued at the declared retail price (FBR Circular 01 of 2019, https://download1.fbr.gov.pk/Docs/201972615718450CIRCULARNO.01OF2019.pdf) | As NO | As NO | As NO |
| I17 (retail price) | PK | None | Retail price printed on each unit or pack, tax 18 % of retail price for Third Schedule goods (s.3(2)(a); STGO 08 of 2026, https://download1.fbr.gov.pk/Docs/202673875133134STGO08OF2026.pdf) | Invoice tax vs retail price × quantity | Third Schedule items without a retail price | Retail price per unit and variant copied to the line |
| S10, P1, P3 | All | None (orders pay later, Purchase) | — | — | Below-reorder list (R6) | Nightly suggestions; low-stock alert; draft purchase orders with Purchase |
| X4 | All | None | Retention per country (`packs/2026.2/retention-rules.csv`) | — | — | Purge only through retention controls (roadmap:160) |
| I26 | All | None | Item changes are audit events (bookkeeping trail) | — | Item change history | — |
| All other features: I2-I4, I7-I9, I11-I16, I18-I25, I27, I28, L1-L9, S6, S11, S14-S16, P2, P4-P12, C1, C4, C5, C9, R1-R10, X5-X7 | All | None (P7 drop ship pays through Sales and Purchase) | None beyond the rows above | Covered by S1 / C10 where they post | Their own report rows in §3.6 | None in v1 |

## 4. The eleven stock features (Jabran's list)

Every posting below goes through the posting connection of roadmap 5.13 (AccountsPostingV2 core, roadmap:121), as
journal type **IV** "Stock" (`ADR-018:33`; type list `BE/docs/api/accounts-a1.md:108`, label `:1065`), by the
Inventory machine client with scope `accounts.posting.write`, pinned to journal type IV and control kinds INVENTORY
and GRNI (`accounts-a1.md:65`, `:73`; `accounts-c.md:218`). Inventory is our own module, so it posts directly, not as
a draft (the draft default of ADR-021 Q14 is for outside systems, `ADR-021:235`). Idempotency follows the ADR-018 §5
pattern `{SOURCE_DOCUMENT_TYPE}:{sourceDocumentId}:{n}` (`ADR-018:65`), for example `STOCK_MOVE:{moveId}:{n}`. The move date sets the period; a move into a closed period is refused
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
  item and a location; the stock move runs first, inside the bill's or invoice's approval, so GRNI is never debit
  (decision 8, an ADR-018 change).
- **Why:** without receipts and issues there is no stock; ADR-018 fixes who posts what (`ADR-018:40-41`).

| Move | When | Journal (IV unless named) |
|---|---|---|
| Goods receipt (Purchasing, or a bill line with a stock item, called first in the bill's approval) | On receipt date (bill date when bill-driven) | DR INVENTORY (branch, location) / CR GRNI (party supplier), at the order or bill price in company currency (`ADR-018:41`) |
| Bill for that receipt | On bill posting, by Accounts C (journal PI) | DR GRNI `receivedValue`, DR / CR PURCHASE_PRICE_VARIANCE the difference (`accounts-c.md:218`); decision 9 for the variance |
| Issue to a sale (Sales delivery, or an invoice line with a stock item, called first in the invoice's approval) | On delivery date, or invoice date when invoice-driven | DR COGS (item and the line's dimensions) / CR INVENTORY, at FIFO or average cost (`ADR-018:40`) |
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
| S3c-1 Between companies of a group, linked (each company posts its own books) | Later (INV-4b), before Phase 7 | Two legal entities: a sale in one company and a purchase in the other; VAT follows the pair of companies (none inside a VAT group, normal rules otherwise, including cross-border; see the §3.9 S3c-1 rows); "intercompany is a link, not a share" (`ADR-018:49`), so each company posts only its own documents and one company never posts into another's books (`RULES.md:126-127`). With decision 8 the invoice and bill exist before Sales and Purchase. Transfer price set per group (cost, cost plus %, later a price list) | Company A at dispatch: invoice through Accounts B (DR `AR_CONTROL`, the customer being company B with `linkedCompanyId`; CR revenue; output VAT unless both are in one VAT group) and IV DR COGS / CR INVENTORY at cost. Company B at receipt: IV DR INVENTORY / CR GRNI at the transfer price, then the bill through Accounts C (CR `AP_CONTROL`, the supplier being company A with `linkedCompanyId`) clears GRNI. This is how Accounts F posts linked companies (`BE/docs/api/accounts-f-design.md:162-163`); the INTERCOMPANY control kind (`accounts-a1.md:73`) is not used. `linkedCompanyId` is not built yet (PR-9, `accounts-f-design.md:47`; left to F's contract, XF-2, `:354`). The transfer price posts in both sets of books, VAT or not. Stock in transit between the two dates. Both legs linked by one transfer id. Decision 13 |
| S3c-2 Inter-company reconciliation and unrealised profit | Phase 7 | Postings into the other company, reconciliation and eliminations are roadmap L.2 (roadmap:151) | Consolidation entries in Accounts; Inventory supplies the transfer-price margin still in B's stock |

### 4.4 Stock counts

- **In v1:** full count (year end), cycle counts (a subset by location, category or ABC class later), count sheets on
  a phone with **camera barcode scanning** (and hardware scanners, which type like a keyboard), count approval,
  variance posting, and the period-close link. Feature `STOCK_COUNT` per branch (`V41:120`;
  `EntitlementCatalog.kt:178`).
- **Camera scanning cost (decision 21):** platform camera work on Android and iOS (camera permission, a barcode
  decoder, a scan view that keeps the focused count line visible per ux §25), none on desktop. GK estimate: an M-size
  piece inside INV-6. Scanning elsewhere (receipts, transfers, labels) reuses it later (P10).
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
- **Why:** stock that never shrinks is wrong stock; IAS 2 and the Nordic acts want stock in the books at the lower
  of cost and net realisable value (GK for the accounting rule). **Tax differs by country** (review 1 spot-check):
  - **NO:** for tax, write-ups and write-downs of stock are ignored; stock for tax is cost by FIFO (skatteloven
    § 14-5 (2) b and c, https://lovdata.no/lov/1999-03-26-14/§14-5). A write-down in the books therefore creates a difference between stock in the
    books and stock for tax, which the tax return needs. Inventory shows it in a report (R10) and the year-end
    reconciliation; for ERP-Q1.
  - **SE:** lowest value (FIFO cost or net sales value) applies; the **97 % rule** (alternativregeln, IL 17 kap. 4 §)
    lets a company carry stock at 97 % of total cost, and the value must be the same in the books, so it is a
    year-end write-down journal, not a tax-return entry (https://skatteverket.se/foretag/drivaforetag/foretagsformer/aktiebolag/varulager.4.1df9c71e181083ce6f6371.html).
  - **DK:** write-down for tax to the day price (replacement cost) (Juridisk vejledning C.C.2.3.1.6.1, https://tax.dk/jv/cc/C_C_2_3_1_6_1.htm).
  - **FI, IS, PK:** accounting rule as above; tax treatment not checked (GK, for ERP-Q1).
- **Journals (IV):** adjustment: DR the reason's account (default INVENTORY_ADJUSTMENT) / CR INVENTORY (or the
  reverse for found stock). NRV write-down (and the SE 97 % write-down): DR a write-down expense / CR the inventory provision
  account. **Every chart except SE has one:** 1490 "Provision for obsolete inventory", type INVENTORY_PROVISION, in
  base, PK, DK, FI and IS (`packs/2026.2/base-ifrs.csv:41`, `pk.csv:42`, `dk.csv:41`, `fi.csv:41`, `is.csv:41`) and
  1498 in NO (`no-ns4102.csv:36`). **No role points to any of them** (the role column is empty). The next pack edition
  adds the role and an SE account (decision 16). The provision is reviewed each close and released when the stock is
  sold or scrapped.

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
  30 codes in `packs/2026.2/units-of-measure.csv`, all UNCHECKED); alternate units with a fixed factor per item (box of
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
- **Country rules (review 1 spot-check; for ERP-Q1):**
  - **NO:** FIFO for tax, no write-downs for tax (skatteloven § 14-5 (2) b and c, https://lovdata.no/lov/1999-03-26-14/§14-5).
  - **SE:** FIFO and lowest value; 97 % rule (IL 17 kap. 4 §) (https://skatteverket.se/foretag/drivaforetag/foretagsformer/aktiebolag/varulager.4.1df9c71e181083ce6f6371.html).
  - **DK:** only FIFO is fully accepted for tax; average "is assumed acceptable"; the method may be chosen per goods
    group; write-down to the day price (https://tax.dk/jv/cc/C_C_2_3_1_6_1.htm).
  - **FI:** bookkeeping law KPL 4:5.4 allows FIFO, LIFO or weighted average (https://www.kuntaliitto.fi/sites/default/files/media/file/Lausunto-10-1997.pdf); the tax rule (EVL 14 §)
    is not verified.
  - **IS:** not checked (GK).
  - **PK:** IAS 2, FIFO or weighted average (GK).
  - So **FIFO is the default in every Nordic country**; average is offered there only after the country
    accountant's check (ERP-Q1); PK keeps the choice (decision 5). A goods-group choice of method (DK) is not in v1.
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
| Warehouse mobile scanning (camera) beyond counts, label printing | Inventory | Scan view from INV-6 | Document output 5.1 for labels | Later |
| Point of sale and offline stores | POS (`SALES.POINT_OF_SALE`, `V41:123`; ADR-007, ADR-009 Proposed) | Append-only moves, so a store server can own on-hand later (`ADR-009:39`) | ADR-007 accepted | With POS |
| E-commerce stock and item sync | Integration API (outside systems) | Item and on-hand read API, stock move write API | Machine-client model (`ADR-021:178-186`) | Later |
| EDI (orders, despatch advice, price catalogues) | Sales and Purchase | Item ids, GTINs | Peppol access point choice (roadmap:262) | Later |
| Intrastat | Accounts E with Sales and Purchase | CN8, net mass, origin, supplementary unit on items | E (roadmap:140) | Later |
| Linked inter-company transfers (S3c-1) | Inventory with Accounts B and C | Transfer document, both companies' moves, transfer id | INV-4, scope ADR (INV-0), decision 8 path, `linkedCompanyId` on parties (PR-9, `accounts-f-design.md:47`), VAT-group fact per company pair | Later (INV-4b) |
| Inter-company reconciliation, eliminations, consolidation (S3c-2) | Accounts Phase 7 (roadmap:151) | Margin on transferred stock still on hand | Phase 7 | Phase 7 |
| Expense claims with goods | HR / Accounts (`large-customer-roadmap.md:52`) | None (non-stock) | — | Not linked |

## 6. Country needs

All rows are GK unless a repo source is named; each needs the country accountant's check (ERP-Q1, roadmap:178).

| Country | VAT / sales tax on goods | Statutory files | E-invoice item data | Stock rules | Other |
|---|---|---|---|---|---|
| SE | Standard and reduced rates by goods type (food, books); rates from the tax pack (`packs/2026.2/tax-codes.csv`), the item holds only a tax class | SIE 4 has no stock records; stock shows as GL lines on group 14 accounts (`se-bas.csv:29`) | Peppol BIS / Svefaktura line: item name, seller id, GTIN, unit (Rec 20); optional at SE launch (roadmap:110) | FIFO and lowest value; **97 % rule** (IL 17 kap. 4 §) as a booked year-end write-down; year-end count and stock list kept as accounting records (https://skatteverket.se/foretag/drivaforetag/foretagsformer/aktiebolag/varulager.4.1df9c71e181083ce6f6371.html) | Intrastat (SCB) above threshold; own-use withdrawal VAT; VAT group (mervärdesskattegrupp, GK) |
| NO | 25 % standard, 15 % food, 12 % lower rate; from the pack | SAF-T Financial carries GL lines only, no stock section; SAF-T Cash Register is for POS, not Inventory | EHF / Peppol BIS lines as SE; required for B2B from 2027-01-01 (roadmap:110, gate L-1) | FIFO for tax, **no write-down for tax** (skatteloven § 14-5 (2) b, c, https://lovdata.no/lov/1999-03-26-14/§14-5), so books and tax stock can differ; yearly count with a list per item (kind, quantity, value), kept 5 years (bokføringsforskriften § 6-1 per a secondary source, https://revisorforeningen.no/revisornytt/varetelling1120) | No Intrastat (EEA, not EU); customs on imports; bottle deposit; VAT group (fellesregistrering, mval § 2-2 (3)): no VAT between its companies (https://www.skatteetaten.no/en/rettskilder/type/uttalelser/bfu/fellesregistrering---omsetning-fra-utenlandsk-hovedkontor-til-norsk-filial-og-omsetning-mellom-filial-og-fellesregistrerte-selskaper/) |
| DK | 25 %; from the pack | SAF-T from 2027-01-01 (ACC-R2, roadmap:141) carries GL lines; stock accounts mapped to the standard chart (1460 → 6140; stock movement 1770 still *(verify)*: `accounts-packs-2026-2.md:307`, `:336`) | OIOUBL / Peppol BIS lines as SE | Only FIFO fully accepted for tax, average assumed acceptable, method per goods group; write-down to day price (https://tax.dk/jv/cc/C_C_2_3_1_6_1.htm) | Intrastat (Danmarks Statistik); deposit; VAT group (fællesregistrering, GK) |
| FI | Standard and reduced rates; from the pack | No SAF-T; tax authority reads the books | Finvoice / Peppol lines | KPL 4:5.4 allows FIFO, LIFO or average (https://www.kuntaliitto.fi/sites/default/files/media/file/Lausunto-10-1997.pdf); tax rule not verified; lowest value (GK) | Intrastat (Tulli); VAT group (arvonlisäverotusryhmä, GK) |
| IS | Standard and reduced rates; from the pack | No SAF-T today | Peppol lines | FIFO or average | No Intrastat (EEA); VAT-group rule not checked (GK) |
| PK | Sales tax on goods (standard rate, further tax for unregistered buyers, Third Schedule retail-price tax); `retailPrice`, `saleType`, `scheduleRef` on lines (`accounts-b.md:1438`) | Annex-C sales register with HS code per invoice line (`accounts-h-design.md:215`) | FBR Digital Invoicing: HS code, FBR unit, quantity, SRO schedule and item serial, fixed notified value or retail price per line (review 1 spot-check 10; `accounts-b.md:1005`, `:2051`; FBR reference cache `HS_CODES`, `UOM`, `accounts-docout.md:300`). Until Inventory exists the line text stands in and the export warns (`accounts-h-design.md:221-222`) | IAS 2 (FIFO or weighted average); registered persons keep records of goods and stock (Sales Tax Act s.22) | Tier-1 retailer POS integration with FBR (with POS); provincial sales tax is on services, not goods |

What Inventory owes each country in v1: the item fields (I17), units mapped to Rec 20 and FBR units (§4.8), a tax
class per item and category (§2.2), valuation methods allowed per country (decision 5), the count records and their
retention (X4). Return files and Intrastat stay in Accounts E (roadmap:140).

## 7. Large multi-company needs

- **Shared item master or per-company items:** §2.4 and decision 3. One catalogue per company by default; the group
  catalogue in INV-1c behind feature `GROUP_CATALOGUE`, off by default, after its scope ADR in INV-0.
- **Inter-company stock:** §4.3 and decision 13. Linked transfers (S3c-1) in INV-4b, each company posting its own
  books; reconciliation and eliminations (S3c-2) in Phase 7.
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
  are decided in the contract step, one per action (`App/docs/module-sequence.md:36-43`). Proposed principles:
  separate codes for moves, counts, approve counts, adjustments, approve adjustments, revalue, item maintenance,
  category maintenance, settings; **values visible only with a value-read code** (decision 18); approvals use the
  shared approval-limit model; branch-limited access follows the platform lane (backlog:361).
- **Entitlement:** Inventory's five catalogued features map to the catalogue: `STOCK_BY_WAREHOUSE` → S1 per
  location, `INTER_BRANCH_TRANSFERS` → S3b, `INVENTORY_VALUATION` → C1 (decision 6), `STOCK_COUNT` → S4,
  `BATCH_SERIAL` → S7. All five are on by default once the module is on (`EntitlementCatalog.kt:173-178`); a
  company switches one off as a feature override (RULES §3). Reorder, variants and reservations need no feature row
  in v1 (always on with the module). Two **new** catalogue rows are proposed, both company scope and **off by
  default**, as large-customer features are (`large-customer-roadmap.md:11`): `GROUP_CATALOGUE` (decision 3) and
  `INTERCOMPANY_TRANSFERS` (decision 13). The real default for `BATCH_SERIAL` being on matters little because
  INV-9 builds it later; until then the feature has nothing to switch.
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
  sends explicit values (ADR-021 D4, `ADR-021:101`).
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
  quantities and costs are imported, their total must equal the GL balance per account, and per location only where
  the opening balance carries the location tag; no second journal posts; a difference needs one adjustment journal
  with a reason (decision 10).

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
| Cross-company scope ADR for the group catalogue and linked transfers (written in INV-0) | decision 3, 13; `ADR-018:96` | Opens the company boundary for item data only, never for books |
| Org fixes: Returns type, ORG-SEC-1, inactive-branch create | backlog:139, :141-142 | Locations are Inventory's base |
| Account rules per account (4.14) and a pack edition: item tag on COGS-type accounts, write-down role | roadmap:98; §8.3, §4.5 | Item on P&L lines; NRV |
| Multi-currency (5.9) | roadmap:117 | Only for foreign purchases into stock |
| Year-end item buckets | `accounts-a3.md:1234` | Before item rides on P&L lines |
| Org catalog flips `INVENTORY` to implemented | `org.md:1521-1524` | Agreements can then include it |
| ADR-018 amendment: Inventory posts receipts and COGS from Accounts bill and invoice lines, stock first in the approval; accounts-service calls inventory-service synchronously during approval (new internal scope, ADR-016); Inventory down → approval refused, retried with the same key; refused, cancelled or FBR-rejected documents reverse their move by the same key | `ADR-018:40`, `:76`; `accounts-a1.md:65`; backlog:276; decision 8 | Document-driven stock before Purchase and Sales |
| B/C contract change: `itemId` and `stockLocationId` on lines a person enters; stock bill lines post to GRNI (C-6 exception); INVENTORY-sourced client beside PURCHASING; Items reachable with FINANCE | `accounts-b.md:524`; `accounts-c.md:191`, `:218`; decisions 1, 8 | Same |
| `linkedCompanyId` on customers and suppliers (Accounts F PR-9, not built; XF-2 leaves it to F's contract) and a dated VAT-group fact per company pair | `accounts-f-design.md:47`, `:354`; decision 13 | INV-4b only |
| Invariant checks: GRNI per receipt line never debit; one issue per stock invoice line; no stock move without a live source document; stock value = GL | decision 8; §8.8; roadmap:173 | Money guardrail before push |

### 9.2 Slices

| Slice | Holds | Risk |
|---|---|---|
| INV-0 | Contract: service, permission manifest and defaults, events, reporting contract, entitlement mapping; this scope's decisions applied | security |
| INV-1 | Item master: types, categories with defaults, starter sets, numbering, barcodes, units, country fields, tax class, import; item events; item picker on Accounts B / C lines | statutory |
| INV-1b | Variants and attributes grid | none |
| INV-1c | Group catalogue (feature `GROUP_CATALOGUE`, off by default): parent-owned catalogue, per-company settings, franchise opt-in | security |
| INV-2 | Stock ledger: moves, balances, valuation (FIFO, average), opening stock adoption, IV posting through 5.13, daily GL tie-out | **money** |
| INV-3 | Receipts and issues: bill- and invoice-driven moves (decision 8), manual goods in and out, internal use, projects, returns | **money** |
| INV-4 | Transfers inside a company (location, branch, in transit); reservations model | money |
| INV-4b | Linked inter-company transfers (feature `INTERCOMPANY_TRANSFERS`, off by default), transfer price, VAT by company pair; needs PR-9 `linkedCompanyId` | **money**, statutory |
| INV-5 | Adjustments, write-downs, revaluation, approval | **money** |
| INV-6 | Stock counts (full, cycle, phone sheets with camera scanning, approval, variance posting), close checklist rows, year-end items | **money**, statutory |
| INV-7 | Reorder points and suggestions; low-stock alerts (notification service, roadmap:96) | none |
| INV-8 | Reports (stock list, movements, valuation vs GL, ageing, slow-moving, variances) | none |
| INV-9 | Batch, lot, serial, expiry, FEFO | none |
| Later | Bins and put-away; camera scanning outside counts and labels; catch weight; transfer suggestions; ABC; consignment | — |
| With other modules | Purchase v1 (orders, goods receipt, landed costs), Sales v1 (orders, deliveries, kits, pricing), Manufacturing, POS, Phase 7 inter-company | — |

Order: INV-0 → INV-1 → INV-1b → INV-1c → INV-2 → INV-3 → INV-5 → INV-6 → INV-4 → INV-4b → INV-8 → INV-7 → INV-9,
then Purchase v1 and
Sales v1 replace the document-driven moves with their own documents. Money slices get the money guardrails: a test
per finding, invariant checks before push, a second different reviewer. Each slice designs its screens at the QA sizes
(§4.4) before build, as the module loop asks (`module-sequence.md:32-34`).

## 10. Decisions for Jabran

**Critical** = money or posting, statutory, product direction, or approved scope. **Non-critical** = everything else.

1. **Who can use items (critical: product direction).** ADR-018 gives the item master to Inventory (`ADR-018:31`),
   but a services firm with Sales and no stock needs items too, and so does a company on **Finance only** that
   invoices from Accounts B: Tripletex, Fiken, Fortnox and e-conomic all keep a product register inside invoicing
   (§3.8). **Recommend:** Items live in the inventory service and are reachable when any of FINANCE, INVENTORY,
   SALES or PURCHASING is on. With FINANCE alone a company gets **non-stock and service items** (number, name, unit,
   tax class, base price, accounts, country fields) on B and C lines; **stock items and every stock feature need
   INVENTORY**. Why: sold by module, one item list for every module, and NeoERP is a regnskap system too. This is an
   entitlement-chain rule (RULES §3: the Items area resolves on from any of the four modules) and a note on ADR-018
   (`ADR-018:31`: Inventory owns the master, Accounts B and C read it even without the INVENTORY module).
2. **Chart of items: how a company starts (critical: product direction).** Options: no templates, fixed industry
   charts, or starter sets. **Recommend:** starter category sets by business type, chosen at setup, copied and then
   the company's own (§2.3); the country decides units, tax classes and statutory fields; category defaults point
   to account roles. Why: it mirrors the chart of accounts (country rules, company copy, "Used for" roles,
   `accounts-a0.md:50`, `:133`, `:210`) and avoids a tier-like industry ladder (`RULES.md:41-54`). This agrees with
   the lead's leaning, with the country and business-type split made explicit.
3. **Group or company item master (critical: product direction).** **Recommend:** model a catalogue plus per-company
   settings from v1. The default is one catalogue per company (ADR-018 §2 rule, `ADR-018:44-49`). The **group
   catalogue** for owned companies gets a slot: its cross-company scope ADR is written in INV-0, and it ships in
   INV-1c, before INV-2, as company feature `GROUP_CATALOGUE`, off by default. Franchises keep their own unless they
   opt in (RULES §8). Why: large multi-company customers from day one (`large-customer-roadmap.md:7`) need one item id
   across companies, and crossing the company boundary needs an ADR (`ADR-018:96`); doing the ADR first keeps the
   slot without risking the boundary. Agrees with the lead's leaning.
4. **Variants (non-critical).** **Recommend:** variants with attributes in the item master from v1; each variant is
   its own item id; grid editor as INV-1b. Why: retail and textiles need size and colour from the first day; the lead
   leans the same way.
5. **Valuation methods (critical: money, statutory).** **Recommend:** FIFO and moving weighted average in v1, one per
   company, fixed after the first move. **FIFO is the default in every Nordic country**; average is offered there only
   after the country accountant's check (ERP-Q1), because NO and SE tax rest on FIFO and DK only "assumes" average
   acceptable (§4.9 sources). PK keeps the choice under IAS 2. Standard cost with Manufacturing; no LIFO (FI law
   allows it, no need known).
6. **Valuation off (critical: money).** Feature `INVENTORY_VALUATION` exists and is on by default (`EntitlementCatalog.kt:177`). Many Nordic small-company
   systems book purchases straight to cost and adjust stock once a year (GK, §3.8). **Recommend:** on = perpetual
   (stock journals per move, §8.2); off = quantities only, no stock journals, purchases stay costs, and a period-end
   "stock value change" journal from the valuation of the count. Default on for new Inventory companies. Why: serves
   both a large perpetual customer and a small shop.
7. **Valuation pool (critical: money).** **Recommend:** cost per item per company, with quantities per location; a
   transfer moves cost unchanged. Why: the books are the company's (`RULES.md:121-128`); per-location cost makes
   every transfer a revaluation.
8. **Stock before Purchase and Sales exist (critical: approved scope, posting). This changes ADR-018.** ADR-018 has
   Inventory post COGS "from its own delivery and return events" (`ADR-018:40`); the invoice event only lets it
   reconcile (`ADR-018:76`). **Recommend:** v1 moves stock from Accounts documents, **stock first, in the approval
   flow**:
   - **Bill with a stock line:** C's approval first calls Inventory's receipt (idempotent on the bill line, the
     ADR-018 §5 key pattern). Inventory posts IV DR INVENTORY / CR GRNI and returns `receivedValue`. Only then does C
     post the bill with DR GRNI `receivedValue` and the variance, exactly as C-27 defines it ("the value Inventory
     already debited to stock and credited to GRNI", `accounts-c.md:218`). If C's posting fails after the receipt,
     the receipt stands as received-not-invoiced (GRNI credit, a true state) and the approval retries with the same
     key. **GRNI per receipt line is never debit.**
   - **Invoice with a stock line:** B's approval first calls Inventory's issue (stock check, negative-stock rule,
     IV DR COGS / CR INVENTORY), then B posts revenue and tax. A failed B posting leaves a delivered-not-invoiced
     issue that the retry invoices; the same order Sales will use (delivery, then invoice).
   - Plus manual goods in and out inside Inventory.
   - **Reversal rule.** A document whose stock move already ran but which then does not post (a person rejects or
     discards it, it is cancelled, or FBR rejects a PK invoice, where nothing is posted and the person fixes and
     approves again, backlog:276) has its move reversed by the same idempotency key: Accounts calls Inventory's
     reverse, and Inventory reverses its IV journal through the A1 reverse endpoint (`accounts-a1.md:65`) and writes
     a compensating move (receipt reversed: DR GRNI / CR INVENTORY; issue reversed: DR INVENTORY / CR COGS, at the
     same cost), dated like the original if its period is open, else on the first open date. A re-approval then runs
     the stock move again with a new key. A document that has **posted** is never reversed this way; it is corrected
     by a credit or debit note, whose return lines move stock as returns (§4.2).
   - **Who runs it, and when Inventory is down.** accounts-service runs the approval and calls inventory-service
     synchronously as a pinned machine client (a new internal scope, which needs Jabran's approval under ADR-016).
     If Inventory does not answer, the approval is refused with "Stock could not be updated. Try again." and nothing
     is stored; the approver retries with the same key. A crash between the two calls is caught by the invariant
     "no stock move without a live source document": a job reverses any document-driven move whose source has not
     posted or been rejected within a set time, and alerts.
   Why: Inventory is useful to an Accounts-only company, and the INVENTORY account stays posted only by Inventory.
   Needs three changes (§9.1): the ADR-018 amendment; a B/C contract change (lines a person enters may carry
   `itemId` and `stockLocationId`, today null until Inventory exists, `accounts-b.md:524`; a stock line on a bill posts
   to GRNI, an exception to C-6, which refuses INVENTORY accounts on bill lines, `accounts-c.md:191`; an
   INVENTORY-sourced client next to PURCHASING, `accounts-c.md:218`); and an invariant check (GRNI per receipt line
   never debit; every stock invoice line has exactly one issue; no stock move without a live source document).
9. **Price variance and landed costs (critical: money).** C posts the bill's difference to PURCHASE_PRICE_VARIANCE
   (`accounts-c.md:218`). **Recommend:** keep that in v1 (variance is a cost); landed costs and actual-cost
   correction of the on-hand share come with Purchase v1. Why: built path, small variances; full IAS 2 actual cost
   needs charges that only Purchase brings (GK on IAS 2).
10. **Opening stock (critical: money).** **Recommend:** adopt the GL balance: import quantities and costs, refuse unless
    the total equals the GL balance per account (per location only where the opening balance carries the location
    tag, which the opening-balance import may not have set), no second journal; a difference needs one adjustment journal with a
    reason. Why: the opening-balance import may already hold 1460; a second journal would double it.
11. **Negative stock (critical: money).** **Recommend:** refused by default; a company may allow it on Store
    locations only, with the cost corrected when the receipt arrives and a daily list of negative items. Why: shops
    sell before goods are booked in; warehouses must not.
12. **Posting detail (critical: posting).** **Recommend:** one journal per source document by default; a company
    switch per source (POS, deliveries, counts) to post one daily summary per location, account and dimension set,
    with drill-down to the moves. Why: 20 million moves would swamp a ledger sized for 2 million lines (`ADR-023:135`).
13. **Inter-company transfers (critical: money, statutory).** Two parts:
    - **S3c-1 linked transfer, before Phase 7 (INV-4b):** one transfer id; each company posts only its own invoice or
      bill and IV journals (decision 8 path), a transfer-price setting, stock in transit; feature
      `INTERCOMPANY_TRANSFERS`, off by default; after INV-4 and the scope ADR (decision 3). "Intercompany is a link,
      not a share" (`ADR-018:49`), so it does not need Phase 7.
    - **S3c-2 reconciliation and unrealised-profit elimination:** Phase 7 (roadmap:151).
    **Recommend:** both parts as above. Note roadmap decision 15 (no owned-group pilot before Phase 7,
    roadmap:273-274, not yet approved): if Jabran keeps it, S3c-1 can wait for Phase 7 too without harm; if not,
    S3c-1 lets a group move stock between its companies correctly in each set of books before consolidation exists.
14. **Batch, serial and expiry (critical: statutory for pharma and food customers).** **Recommend:** INV-9, the first slice after v1, with nullable lot and
    serial on every move from v1. Why: batch and expiry tracking is a legal duty for pharma (PK DRAP, GK) and food
    traceability customers, so no such customer can go live before INV-9; the first Swedish customers likely do
    not need it.
15. **Counts and close (critical: statutory).** **Recommend:** blind counting; counter cannot approve own variances;
    automatic posting under a company value limit, approval above it; unposted moves block the period close; a
    missing year-end count is a warning a company can make blocking. Why: the count is the year-end evidence (GK).
16. **Write-downs (critical: money).** **Recommend:** NRV write-downs, and the Swedish 97 % rule (IL 17 kap. 4 §),
    as journals on a provision account. Every chart except SE has one (1490 in base, PK, DK, FI, IS; 1498 in NO:
    `base-ifrs.csv:41`, `pk.csv:42`, `dk.csv:41`, `fi.csv:41`, `is.csv:41`, `no-ns4102.csv:36`), but no role points to
    it; the next pack edition adds the role and an SE account. In NO the write-down is ignored for tax (skatteloven
    § 14-5 (2) c), so Inventory reports the books-versus-tax stock difference (R10). Why: keeps cost and write-down
    apart and reversible, and gives the Swedish customer the 97 % rule in its first year.
17. **Item on journal lines (critical: posting).** **Recommend:** item on COGS, adjustment and variance lines only,
    not on INVENTORY and GRNI; a pack edition allows the item tag on those accounts; measure the set count (Q18) in
    INV-2. Why: margin and product budgets need it; balance lines would multiply sets for no use (§8.3).
18. **Who sees stock values (non-critical).** **Recommend:** a separate value-read code; Stock Clerk and store staff
    see quantities only by default. Why: large customers hide cost prices from shop floors (GK).
19. **Country item fields in v1 (critical: statutory).** **Recommend:** HS / PCT code, FBR unit, sale type, SRO
    schedule and item serial defaults, and the fixed notified value or retail price per unit and variant (PK); GTIN, CN8, net mass, country of origin (Nordic) on the item in v1; Intrastat reports later with
    Sales and Purchase. Why: PK invoices need them now (`accounts-h-design.md:221-222`); fields are cheap, reports
    need documents.
20. **Build order (critical: approved scope).** Brief order is Inventory, then Purchase, then Sales scope drafts.
    **Recommend:** build Inventory INV-0 to INV-8 first (variants INV-1b straight after INV-1, because the variant id
    is the key on stock moves) with the document-driven path (decision 8), then Purchase v1 and Sales v1. Why: Accounts documents already carry item, unit, quantity and location fields (`ADR-018:66`), so
    Inventory works alone, and Purchase and Sales then plug into a working stock ledger.
21. **Camera scanning for counts (non-critical).** **Recommend:** in INV-6, phones only (Android and iOS camera
    work, an M-size piece, GK); hardware scanners work everywhere from INV-1. Why: Jabran asked for scanning on a
    phone for counts; most people mean the camera.

## 11. Not verified

- Every GK line still marked GK: country rules review 1 did not check (IS throughout; FI tax; DK, FI, IS and PK count
  records; import VAT; deposits; own-use VAT; Intrastat scope; DRAP), e-invoice item terms, the ERP and Nordic system
  comparison (vendor documents were not read). Lines review 1 checked now carry its source URL.
- The brief names `NeoERP-BackEnd/docs/adr/ADR-024-data-at-scale.md`; the file is at
  `WS/docs/drafts/ADR-024-data-at-scale.md` and its line 4 still says "Not accepted", although roadmap:96 records
  ADR-024 and ADR-025 as moved to accepted after the lead's summary (backlog:385 is the action, not the acceptance).
- The volume figures in §7 are assumptions, not customer data.
- Pack accounts and units are UNCHECKED against official sources (backlog:74).

## 12. Round 2 (review 1, `docs/agents/inv-scope/review-1-opus.md`)

| Finding | Fix | Commit |
|---|---|---|
| 1 MAJOR feature defaults | On by default once the module is on, from `EntitlementCatalog.kt:173-178`; V41's FALSE is "not statutory"; §1, §7, decision 6 | 20b002c |
| 2 MAJOR provision accounts | Every chart except SE has one (1490; NO 1498), no role points to it; §4.5, decision 16 | 51d4a3e |
| 3 MAJOR NO tax write-downs | Skatteloven § 14-5 (2) c: ignored for tax; books-vs-tax report R10; §4.5, §4.9, §6, §3.9 | 51d4a3e, bc7a1f7 |
| 4 MAJOR SE 97 % rule | IL 17 kap. 4 § as a booked year-end write-down; §4.5, §6, §3.9, decision 16 | 51d4a3e, bc7a1f7 |
| 5 MAJOR decision 8 | Stated as an ADR-018 change; stock first in the approval flow so GRNI is never debit; three §9.1 rows | 9e7ed42 |
| 6 MAJOR group catalogue slot | Scope ADR in INV-0; INV-1c behind `GROUP_CATALOGUE`, off by default; decision 3 | 7f0897f |
| 7 MAJOR inter-company split | S3c-1 linked transfer (INV-4b) before Phase 7, S3c-2 in Phase 7; roadmap decision 15 cited; decision 13 | 7f0897f |
| 8 MAJOR phone scanning | Camera scanning for counts in INV-6, cost noted; decision 21 | 9df23c6 |
| 9 MAJOR addition 5 | §3.9 rebuilt per country with a Payments column; every feature in one row; C8, S13, S12, S8 added | bc7a1f7 |
| 10 MAJOR Finance-only | Non-stock and service items with FINANCE; entitlement-chain rule and ADR-018 note; decision 1 | 9e7ed42 |
| 11 MINOR variants late | INV-1b straight after INV-1 | 9df23c6 |
| 12 MINOR valuation overstated | FIFO default in every Nordic country, average after ERP-Q1; DK and FI rules from the spot-check; C5 | 51d4a3e |
| 13 MINOR PK fields | SRO schedule and item serial, fixed notified value or retail price per unit and variant; I17, §2.7, §6, decision 19 | b0109f1, 28b8491 |
| 14 MINOR citations | 30 unit codes; `App/docs/module-sequence.md`; `ADR-021:103`; idempotency pattern; ADR-024 acceptance at roadmap:96 | 20b002c |
| 15 MINOR opening tie-out | Per account, per location only where tagged; §8.7, decision 10 | 20b002c |
| 16 MINOR labels and gaps | Decision 14 critical for pharma and food; I26 item history, I27 returnable packaging, I28 rental, L9 supplier goods in transit | b0109f1 |
| 17 MINOR final home | `docs/agents/inventory/scope.md` after sign-off (status line) | 20b002c |
| GK spot-check | Rows 2-8 and 10 now cite the review's URLs; row 3 (NO lowest value) and row 6-7 (DK, FI) corrected; row 9 (PK imported Third Schedule) added to C8; row 11 still unverified | 51d4a3e, bc7a1f7, b0109f1 |
| Branch base | The lead rebased onto `origin/master`; the common brief's two new sections are read (§3, §3.9) | — |
