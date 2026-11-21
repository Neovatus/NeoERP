# INV-SCOPE review 1

Reviewer: Opus 5.5 (fresh, read-only)
Reviewed: 176092016edb627d43f7bdf8aee35784e3108f4b
Range: 854ad08706eeb7069ec73f50e439e0bf6934984a..176092016edb627d43f7bdf8aee35784e3108f4b
Verdict: **FIX**

Draft: `docs/drafts/items-inventory-scope.md` (cited below as `draft:N`). Code repos read at BE `phase/4` `d0dd5441`,
App `phase/4` `f19a101b`.

Note on the range: the branch was cut at `13ce4a2` and has not taken `4531ba2` and `854ad08` from master. So the
two-dot diff shows master's two new sections in `docs/agents/design-brief-common.md` as deleted. The branch itself
changes only `docs/drafts/items-inventory-scope.md` and `docs/agents/inv-scope/progress.md` (three-dot diff). Merge
`origin/master` before lane-ready. Finding 9 covers the content of those two sections.

## Findings

1. **MAJOR — wrong source for "off by default"** (`draft:17-20`). In V41 the `FALSE` column is `statutory`, not a
   default (column list at `V41__fe_upgrade_entitlement_rows.sql:19-26`). The real catalogue turns on all five
   Inventory features by default (`shared/entitlement-catalog/.../EntitlementCatalog.kt:171-178`, `default = true`,
   INCLUDED). **Fix:** say "on by default once the module is on". Cite `EntitlementCatalog.kt:173-178`. Recheck
   `draft:571-574` and decision 6 (`draft:732-736`) against it. Decision 6's "default on" agrees with the catalogue.

2. **MAJOR — wrong statement about the provision accounts** (`draft:431-433`, decision 16 `draft:768-770`). DK has
   1490 `INVENTORY_PROVISION` (`packs/2026.2/dk.csv:41`). So do FI (`fi.csv:41`) and IS (`is.csv:41`). NO has 1498
   (`no-ns4102.csv:36`). Only SE lacks one. The claim that no role exists is right: the role column is empty on every
   such row. **Fix:** "every chart except SE has a provision account; no role points to it". The pack edition adds
   the role and the SE account.

3. **MAJOR (statutory) — Norway does not allow tax write-downs of stock.** Skatteloven § 14-5 (2) c says
   write-ups and write-downs of stock are ignored when income is set. `draft:346` (S5: "write-downs reduce taxable
   profit under each country's lowest-value rules") and `draft:469-470` ("SE and NO … FIFO with the lowest value rule")
   are wrong for NO. **Fix:** in the NO row (`draft:537`) and in S5/C7, the NO tax value is cost by FIFO with no
   write-down. Add a report or reconciliation line for the difference between stock in the books and stock for tax
   (needed for the tax return). Mark it for ERP-Q1.

4. **MAJOR (statutory) — the Swedish 97 % rule is missing.** IL 17 kap. 4 § (alternativregeln) lets a company carry
   stock at 97 % of total cost. The value must match the books, so it cannot be done only in the tax return. A
   Swedish customer will ask for it in the first year. **Fix:** add it to the SE row (`draft:536`), to S5/C7 and to
   decision 16, as a year-end write-down journal on a provision account. The SE chart has none (finding 2).

5. **MAJOR — decision 8 departs from ADR-018 and has an ordering gap** (`draft:740-745`, `draft:375-388`).
   (a) ADR-018 has Inventory post COGS "from its own delivery and return events" (`ADR-018:40`). The invoice event
   only lets Inventory *reconcile* COGS (`ADR-018:76`). Posting COGS from `accounts.sales_invoice.posted` is an
   ADR-018 change.
   (b) C-27 defines `receivedValue` as "the value Inventory already debited to stock and credited to GRNI"
   (`accounts-c.md:218`). The receipt comes before the bill. In the drafted order, C posts DR GRNI first and
   Inventory credits GRNI later from an event. GRNI is debit in between, and stays debit if the event fails.
   (c) Lines a person enters on B cannot carry `item_id` today (`accounts-b.md:524`). Bill lines refuse INVENTORY
   accounts (`accounts-c.md:191`).
   **Fix:** state the order. Either the bill approval calls Inventory's receipt in the same flow, or a "bill with
   stock lines" contract makes the receipt and the clearing one unit, with an invariant check (GRNI per receipt line
   never debit). Add three rows to §9.1: the ADR-018 amendment, the B/C contract change (item on lines a person
   enters, an INVENTORY-sourced client next to PURCHASING) and the invariant.

6. **MAJOR (product direction) — decision 3 parks the group catalogue with no slot** (`draft:117-126`, `:721-725`;
   I24 `:223`; slice table `:699`). The catalogue-plus-company-settings model is right, and stable ids avoid
   re-keying. But "Later, after a scope ADR" with no owner or slot does not fit "large multi-company from day one"
   (`large-customer-roadmap.md:7`). The lead leaned towards having it in v1. **Fix:** write the cross-company scope
   ADR in INV-0. Add it to §9.1 next to ADR-026 (`roadmap:90`). Ship the group catalogue as a company feature,
   off by default (a new catalogue row; §7 `draft:571-574` proposes none), in INV-1 or an INV-1c before INV-2. The
   default stays one catalogue per company. Franchises opt in (RULES §8).

7. **MAJOR (product direction) — decision 13 treats all inter-company transfers as Phase 7** (`draft:759-761`, S3c
   `:247`, §4.3 `:399`). Roadmap L.2 (`roadmap:151`) is intercompany *postings into the other company*,
   reconciliation and eliminations. A transfer where each company posts only its own documents does not need
   Phase 7: "intercompany is a link, not a share" (`ADR-018:49`, `linkedCompanyId`). With decision 8's
   document-driven path, an invoice in A and a bill in B are possible before Sales and Purchase exist. **Fix:** offer
   a split.
   - S3c-1: a linked inter-company transfer. One transfer id; each company's own invoice or bill and IV journals; a
     transfer-price setting; stock in transit. After INV-4 and the cross-company ADR (finding 6).
   - S3c-2: unrealised-profit elimination and inter-company reconciliation, in Phase 7.

   Cite roadmap decision 15 (`roadmap:273-274`, not yet approved: no group pilot before Phase 7). If Jabran keeps
   that, the current recommendation is consistent. Either way, the draft should show him the split.

8. **MAJOR — Jabran's "phone scanning" for counts is only half covered** (`draft:403-405`, `:417-419`; P10 `:275`).
   v1 offers hardware scanners only. Camera scanning, which is what most people mean by phone scanning, is "Later".
   **Fix:** put camera scanning for count lines into INV-6, or make it a numbered decision with its cost
   (platform camera work on Android and iOS).

9. **MAJOR — addition 5 is only partly done** (§3.9, `draft:332-351`).
   (a) The rows mix countries instead of answering per country.
   (b) Some features where tax or reconciliation applies are missing:
   - C8 landed costs: customs duty and import VAT. NO and SE report import VAT in the VAT return. PK charges sales
     tax at import, and imported Third Schedule goods are valued at the declared retail price (FBR Circular 01 of 2019).
   - S13 opening stock: tie-out to the opening balance.
   - S12 negative stock: report and reconciliation.
   - S8 units: the FBR unit depends on the HS code (automation).

   (c) Master's `design-brief-common.md` (`854ad08`) now also asks for a **Payments** column on every scope draft.

   **Fix:** add a Payments column ("none: stock moves no money", except landed costs, import VAT and deposits).
   Split S1/C10, S4, S5/C7 and C8 into country rows. Add the missing rows.

10. **MAJOR (product direction) — decision 1 leaves out companies on Finance only** (`draft:711-714`). A services
    firm that invoices from Accounts B without Sales gets no items. Tripletex, Fiken, Fortnox and e-conomic all have
    a product register inside invoicing (the draft's own benchmark, `draft:322-328`). NeoERP is meant to be a
    regnskap system too. **Fix:** make non-stock and service items available with FINANCE as well, or say why not.
    Either way, note that this is an entitlement-chain rule (RULES §3) and an ADR-018 note (`ADR-018:31`).

11. **MINOR — variants come too late** (`draft:702`). INV-1b comes after INV-7. Decision 4 says variants are needed
    "from the first day", and the variant id is the key on stock moves (`draft:132`). **Fix:** move INV-1b to
    straight after INV-1, before INV-2.

12. **MINOR — valuation rules overstated** (`draft:469-471`, decision 5 `:729-731`, C5 `:287`).
    - DK: only FIFO is fully accepted for tax. Average "is assumed acceptable". Write-downs go to the day price
      (replacement cost), and the method may be chosen per goods group (Juridisk vejledning C.C.2.3.1.6.1).
    - FI: bookkeeping law KPL 4:5.4 allows FIFO, LIFO or weighted average. So "LIFO not used in our countries" is not
      accurate. FI tax is unverified.

    **Fix:** FIFO by default in every Nordic country, average only after the accountant's check (ERP-Q1). PK keeps
    the choice under IAS 2.

13. **MINOR — PK item fields incomplete** (`draft:216`, decision 19 `:776-779`). FBR Digital Invoicing item lines
    also carry `sroScheduleNo` and `sroItemSerialNo` (for reduced and exempt goods) and
    `fixedNotifiedValueOrRetailPrice`. STGO 08 of 2026 requires the retail price printed on each unit or pack.
    **Fix:** add SRO schedule and item serial as item defaults. Keep the retail price per unit and variant, not only
    per item.

14. **MINOR — citation errors.**
    - `draft:456`: `units-of-measure.csv` holds 30 codes (31 lines including the header), not 31.
    - `draft:567`: `App/docs/design/module-sequence.md` does not exist. The file is `App/docs/module-sequence.md:36-43`.
    - `draft:70`: `ADR-021:104` is a blank line. The frozen-defaults sentence is `:103`.
    - `draft:360`: ADR-018's key is `{SOURCE_DOCUMENT_TYPE}:{sourceDocumentId}:{n}` (`ADR-018:65`). Write "following
      that pattern, e.g. `STOCK_MOVE:{moveId}:{n}`".
    - `draft:789-791`: backlog:385 is an action ("accept after the lead's one-page summary"). The acceptance is
      recorded at `roadmap:96`, and ADR-024 line 4 still says "Not accepted".

15. **MINOR — decision 10 tie-out per location** (`draft:750-752`, `:656-658`). The opening-balance import may not
    have tagged 1460 with a stock location, and then a per-location match is impossible. **Fix:** match per
    account, and per location only where the opening balance carries the tag.

16. **MINOR — labels and catalogue gaps.**
    - Decision 14 (`draft:762-764`) is labelled non-critical, but batch and expiry tracking is a legal duty for
      pharma (PK DRAP) and food traceability customers. Label it "critical: statutory for those customers", or say
      why not.
    - Features missing from the catalogue: a change history of the item master (audit events, v1); goods in transit
      from a supplier (ownership by Incoterms); returnable packaging such as pallets and crates beyond the bottle
      deposit; rental items.
    - Each needs a row with a phase, even if "Not planned".

17. **MINOR — final home of the scope.** The module loop puts the signed scope in `docs/agents/<module>/scope.md`
    (`App/docs/module-sequence.md:29-31`). Note where the approved version will live.

## GK spot-check (web)

| # | Claim in the draft | Result | Source |
|---|---|---|---|
| 1 | NO SAF-T Financial has GL lines only, no stock section (`draft:537`) | Confirmed: ledger plus customer and supplier lists, no stock (v1.30 XSD not opened) | https://www.skatteetaten.no/en/business-and-organisation/start-and-run/best-practices-accounting-and-cash-register-systems/saf-t-financial/questions-and-answers---saf-t-financial/ |
| 2 | NO FIFO for tax (`draft:537`) | Confirmed: the goods bought first count as sold first | https://lovdata.no/lov/1999-03-26-14/§14-5 (§ 14-5 (2) b) |
| 3 | NO lowest value for tax (`draft:346`, `:469-470`) | **Wrong**: tax ignores write-ups and write-downs | https://lovdata.no/lov/1999-03-26-14/§14-5 (§ 14-5 (2) c) |
| 4 | NO year-end stock specification kept as a record (`draft:537`, `:345`) | Confirmed in substance: yearly count, list per item (kind, quantity, value), kept 5 years. Paragraph cited as bokføringsforskriften § 6-1 (secondary source) | https://revisorforeningen.no/revisornytt/varetelling1120 |
| 5 | SE FIFO and lowest value; year-end count kept (`draft:536`, `:469`) | Confirmed. **Missing:** the 97 % rule (IL 17:4) | https://skatteverket.se/foretag/drivaforetag/foretagsformer/aktiebolag/varulager.4.1df9c71e181083ce6f6371.html |
| 6 | DK "FIFO or average; lowest value" (`draft:538`) | Partly: only FIFO fully accepted, average assumed acceptable; write-down to day price (replacement cost); method may be chosen per goods group | https://tax.dk/jv/cc/C_C_2_3_1_6_1.htm |
| 7 | FI "FIFO or average (KPL)" (`draft:539`) | Partly: KPL 4:5.4 allows FIFO, LIFO or average; tax rule (EVL 14 §) unverifiable | https://www.kuntaliitto.fi/sites/default/files/media/file/Lausunto-10-1997.pdf |
| 8 | PK Third Schedule: tax on the printed retail price (`draft:167-168`, `:541`) | Confirmed: s.3(2)(a), 18 % of retail price, printed on each unit | https://download1.fbr.gov.pk/Docs/202673875133134STGO08OF2026.pdf |
| 9 | PK imported Third Schedule goods | Not in the draft: valued at the declared retail price at import | https://download1.fbr.gov.pk/Docs/201972615718450CIRCULARNO.01OF2019.pdf |
| 10 | PK FBR Digital Invoicing item fields: HS code, unit, quantity, retail price, sale type (`draft:541`) | Confirmed (secondary; the official v1.12 PDF could not be read here). Also `sroScheduleNo`, `sroItemSerialNo`, `fixedNotifiedValueOrRetailPrice` | https://dev.to/tallied/integrating-pakistani-businesses-with-the-fbr-digital-invoicing-api-1glk ; https://download1.fbr.gov.pk/Docs/20257301172130815TechnicalDocumentationforDIAPIV1.12.pdf |
| 11 | PK textile HS chapters 52, 54, 55, 60-63 (`draft:96`) | Unverifiable here (not web-checked; consistent with the HS structure) | — |

## Checked correct

Repo citations checked: 46. The ones not named in the findings are correct.

- **Org and catalogue:** `org.md:1521-1524`; `V41:116-120`, `:127-135` (codes and scopes); `stock-locations.md`
  (BE) `:9-17`, `:41-44`, `:53-54`; App `stock-locations.md:5-14`, `:30`; `standard-roles.md:78`, `:264`.
- **ADR-018:** `:29-33`, `:40-41`, `:44-49`, `:53`, `:66`, `:76-78`, `:89`, `:96-98`.
- **Posting connection (5.13):**
  - The A1 posting endpoint `accounts-a1.md:65` pins each client to source modules, journal types and control kinds.
  - The control kinds `:73`, the location tag `:76` and IV in the type list `:108`, `:1065` match.
  - So do C-6 `accounts-c.md:191`, C-27 GRNI `:218` (PURCHASING pin, `receivedValue`, manual refused once used) and
    the debit-note test `:1205`.
  - Backlog `:81` (compile-time pin), `:86` (`machine_allowed`) and `roadmap:121`, `:253-254` (5.13 in Phase 5
    after D) are right.
- **Account roles and packs:** `accounts-packs-2026-2.md:247`, `:265`, `:279-281`, `:307`, `:336`; `se-bas.csv:29`
  (1460 branch and stock_location), `:82` (2449 GRNI), `:174-176` (4960 COGS, 4968, 4969; item not allowed);
  `base-ifrs.csv:41`; `pk.csv:42`; `templates.csv:2-5`.
- **Period close and year end:** A2 C-14 `accounts-a2.md:87`; `accounts-a3.md:1234` (`TODO(Inventory)` in
  `YearEnd.plan`); backlog `:77` (ADR-005 only through status reads).
- **B and H:** `accounts-b.md:32`, `:524`, `:1005`, `:1437-1438`, `:2051`, `:2541`, `:2860-2861`;
  `accounts-h-design.md:215-222`; `accounts-docout.md:205`, `:300`.
- **ADRs:**
  - ADR-021 `:7`, `:13`, `:62`, `:80`, `:85`, `:97`, `:101`, `:165-167`, `:178-186`, `:224`, `:231`, `:235`, `:239`.
  - ADR-022 `:77`, `:106`, `:193`, `:267`. ADR-023 `:24-31`, `:34`, `:44`, `:135`, `:175`.
  - ADR-024 `:17`, `:60`, `:64`, `:81`, `:85`. ADR-007 `:86-88`, ADR-009 `:39`, `:94`, ADR-019 `:5`.
- **Workspace and App docs:**
  - `large-customer-roadmap.md:7`, `:11`, `:19`, `:32-33`, `:48`, `:52`, `:70`.
  - backlog `:74`, `:139`, `:141-142`, `:195`, `:242`, `:361`.
  - RULES `:41-54`, `:121-128`, `:154-167`.
  - `accounts-a0.md:50`, `:133`, `:142`, `:160`, `:210`; `accounts-fixed-assets.md:40`; `accounts-budgets.md:234`;
    `accounts-integrations.md:165-166`.
  - `module-sequence.md:22`, `:29-43`; UX1 `ux-principles.md:38`, `:137-143`, `:278`, `:284`;
    `screen-standard.md:342-361`.
- **Roadmap rows:** `roadmap:18`, `:90-101`, `:109-117`, `:134`, `:140-141`, `:151`, `:154-155`, `:160-161`, `:173`,
  `:178`, `:180`, `:262`.
- **Slice order against the Accounts roadmap:** it is consistent. Inventory waits for 5.13 (Phase 5), 4.14, ADR-026
  (4.6), the Org fixes, and 5.9 for foreign purchases only; money slices carry the guardrails. Apart from findings 5,
  6, 7 and 11, the dependencies in §9.1 are complete.
- **Additions 1 to 4:** all eleven features are in §4, one subsection each. §2 covers types, categories, starter sets,
  group or company master, variants and numbering. §2.8 is the pricing boundary. §3 is the catalogue with phases and
  the named ERP comparison. §5 is the cross-module map.
- **Decisions not named in the findings:** 2, 4, 6, 7, 9, 11, 12, 15, 17, 18, 19 and 20 follow from their sources,
  and their labels are right.
- **Style:** one H1; no raw HTML; tables have the same columns within each table; plain English.
