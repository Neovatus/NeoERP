# NeoERP Pakistan tax verification

Completed **2026-10-31**. **Conclusion: PK tax go-live is not verified.** The principal income-tax rate numbers match the official 2026 source. Material defects concern bases, applicability, jurisdiction and dated coverage. Current provincial source gaps are identified rather than treated as verified law.

## Scope and checkpoint

| Field | Record |
|---|---|
| Owner and authorization | Codex; user authorized read-only verification and this report only. No code, migration, configuration, commit or push was changed/performed. |
| Workspace | /Users/jabransiddiqui/Offices/Neovatus/NeoERP, the expressly requested checkout; different from the session's initial /Users/jabran-siddiqui/… checkout. |
| Revisions | Workspace master initially 4e02a8a5153c6846ae9ceade7ea8370c6d30f66d, refreshed at 945353fda8035986b0bfc7f55ae10d839fdaad0e. Backend dev initially acc99350e5f3dd4f87fc5e57abcd3fbedcc13fa2, refreshed at 2cc842303f9e9ec6ce4f2020595544dbd8c83b25. App final HEAD 7ef508a1c1353da53e0319e1de9a4fa2127e064f; app implementation was not audited. |
| Reviewed | All PK tax rows in packs 2026.1/2026.2, dated rates, PK charts/roles, country/content rules, V22/V33, Accounts B/C and packs contract PK sections. Targeted supplier/bill/payment/receipt code inspection corroborated relevant behavior. Payroll not read: no shared Accounts salary-rate dependency was needed. |
| Concurrent changes | Initial payment/receipt files were dirty; backend later became clean after others' commits. Refresh found no changes to packs/V22/V33/packs contract; B/C gained implementation notes without changing the relevant net-base decision. Existing workspace changes were untouched. |
| User override | No PROJECT-STATE*.md was read. User's single-output rule supersedes separate plan/handoff/state writes; this table is the task checkpoint. |
| Status | Discovery → source comparison → report complete. Findings proposed only, not accepted fixes. Read-only research helpers checked federal/provincial sources; no independent legal sign-off is claimed. |
| Checks and limits | CSV counts/hashes, SQL/source inspection and official-source research. Current FBR Ordinance/card retrieved and parsed in memory. No live DB, Flyway execution, build/runtime test, taxpayer lookup or production DI request. |
| Next action | Accounts lead approves any remediation separately, resolves provincial source gaps, verifies each activated scenario and statutory output before launch. |

All backend paths below are relative to NeoERP-BackEnd/. TC1/TC2 mean services/accounts-service/src/main/resources/packs/2026.1 or 2026.2/tax-codes.csv; RV2 means 2026.2/tax-rate-versions.csv. CSV lines include the header. Source-code line references identify the inspected snapshot.

## Findings

HIGH = materially incorrect tax/base/classification or consequential launch gap. MEDIUM = incomplete metadata, scope controls or evidence. An inactive manual placeholder is not an automatic deduction. Existing V33 remediation is credited.

| ID | Severity | Our row / location | Ours versus official, with evidence and consequence | Fix |
|---|---|---|---|---|
| PK-01 | HIGH | TC2 income-WHT rows 88–100; accounts-c.md C-13:120; accounts-b.md C-46:185; PaymentRules.kt:196–212; ReceiptRules.kt:182–198 | Ordinary s.153 defaults to NET_OF_SALES_TAX. [ITO s.153(1), printed pp.328–329][ito26] expressly includes sales tax in gross payable. Net 100,000 + ST 18,000 at company-goods ATL 5% requires **5,900**, not 5,000. Typing 5,900 still leaves default base 100,000 and derived 5.9%. Editable overrides do not cure wrong default/reporting base. | Use GROSS for ordinary s.153 payment and receipt codes; correct contracts/examples/tests. Reconcile historical bases through an approved correction, never silent rewrites. Evaluate s.155 gross rent separately. |
| PK-02 | HIGH before V33; repair present | TC2:88,90–91,93–98,101–104; V33 | Thirteen raw CSV rows are SALES despite WHT_PAYABLE and C-13 PURCHASES; supplier/payment selection rejects WRONG_SIDE. **V33 already repairs matching catalog and inherited company copies.** Do not report this as unfixed in a successfully migrated DB. Independently edited copies are preserved. | Verify deployment/history and all 13 catalog/company codes plus exceptions. Publish corrected next-pack metadata; do not edit published CSVs/checksums or applied migrations. |
| PK-03 | MEDIUM | V22:125–137; V33 | V22 calls these liability codes “deducted/withheld by customer”; V33 changes side only. A buyer-tax liability can still carry a seller-side label. | Forward rename catalog and inherited labels with provenance guards. Preserve actual customer-withheld SALES asset codes. |
| PK-04 | HIGH conditional | TC2:101–104 | PRA/SRB/KPRA/BRA WHT all carry PK-FED jurisdiction, despite provincial account overrides 2756–2759. Provincial remittance can be tagged federal. Separate laws/authorities govern these deductions [PRA][pra-reg], [SRB][srb-wh], [KPRA][kp-wh], [BRA][bra-act]. | Use PK-PB/PK-SD/PK-KP/PK-BA, authority-specific registrations/reporting and approved company-copy reconciliation. |
| PK-05 | HIGH conditional | TC2:101–104 base_type | Provincial WHT defaults to NET_OF_SALES_TAX. [KP regulations paras.4–6][kp-wh] ordinarily withhold **50% of tax**, with full-tax/excluded cases. Net 100,000 + KP tax 15,000 means ordinary WHT 7,500; applying 50% to our net base would imply 50,000. [Historical SRB r.3][srb-wh]/[BRA r.3][bra-wh] likewise distinguish tax fractions/full tax. | Model authority/scenario/fraction/base, including tax-inclusive extraction. Do not substitute a blanket percentage of net or certify current SRB/BRA rules from older editions. |
| PK-06 | HIGH conditional | TC1:17; TC2:105 PK-WHT-ST, :86 customer-ST code | 20% of SALES_TAX is one [Eleventh Schedule][sta26] scenario. Other table cases/exclusions require different fractions, full tax, gross-value or industry/e-commerce bases. Identical 100,000 + 18,000 invoices can yield 3,600, 1,800, another amount or none. | Keep inactive until agent/supplier/status/industry/exemption/date scenario is selected. Extend both payment calculation and seller-side recording; archived 2007 rules are not the current rate authority. |
| PK-07 | MEDIUM, conditional rate error | TC2:93–98; packs §7.2 PK-5a | Numbers match TY2027, but PORT 12/24 applies to **companies** providing terminal/port operating services. PROF 15/30 concerns independent professionals, not every professional-services company [Sch.1 Pt.III Div.III(2)][ito26]. Generic labels/blank notes omit qualifiers; choosing PORT for a non-company solely from its service name can under-deduct. | Capture payee form/statutory service classification and category precedence; display the qualifier, including independent professional versus listed service/IT. |
| PK-08 | MEDIUM, date coverage gap | RV2:98,100–101,105–106; payment-date version resolution | CONTRACT, GOODS-CO/OTHER, IT and MEDIA only have versions from 2026-07-01 although their general rates existed in [TY2026][card26]. A 2026-06-30 payment using these detailed codes gets NOT_IN_FORCE. CERTAIN/OTHER have earlier versions. New PORT/PROF categories must not be invented retrospectively. | Add supported historical versions through a forward pack/migration, or explicitly restrict supported payment dates with an accurate historical alternative. |
| PK-09 | MEDIUM, regime | TC2:88,90–98 regime=MINIMUM | Ordinary s.153 minimum treatment is real, but [s.153(3), p.330][ito26] excepts manufacturer/listed-company goods receipts and makes listed-company execution-contract receipts adjustable. A universal MINIMUM stamp misclassifies these exceptions. | Resolve regime per payee/transaction, separate from liability posting. Ordinary service MINIMUM is not inherently wrong. |
| PK-10 | HIGH launch gap | TC2:99 PK-WHT-155; C-13 | Blank hint, “Slab rates” and net default do not implement annual gross rent/payee form/prior deductions [s.155; Sch.1 Pt.III Div.V][ito26]. Monthly rent cannot treat the annual slab exemption as a new monthly exemption. | Model gross rent, landlord form, annual aggregation/prior deductions, ATL/certificates, advances and dated tables; audit manual adjustments. |
| PK-11 | MEDIUM, identifier validation | C-20; BillRules.kt:579–594; SupplierService.kt identity assignment | INPUT-tax guard checks nonblank salesTaxRegistration; that guard alone accepts “x”. Company/AOP NTN is seven digits; an individual normally uses 13-digit CNIC [FBR enrollment][ntn]. Federal STRN is 13 digits and NTN is not its substitute [FBR clarification][strn]. Presence is not verified registration/credit eligibility. This is source inspection, not an executed request. | Normalize by identifier type/authority; validate format/status and retain lookup evidence. Recognize CNIC as the individual's income-tax identity where applicable. |
| PK-12 | HIGH provincial launch gap | C-20; TC2:74 PK-PST-IN, :84 PK-ST-RC | One generic STRN field/guard cannot establish provincial service registration, input entitlement or recipient liability [PRA][pra-reg], [BRA ss.26A,30][bra-act]. A provincial-only supplier is not automatically federally registered. | Separate registrations by authority, service location, active status and credit rules. Distinguish recording costs from claiming tax; do not require federal 13-digit STRN for every provincial invoice. |
| PK-13 | MEDIUM, contract Boolean | B C-12:145; TC2:81 | B describes further-tax default when buyer is neither registered nor active. [STA s.3(1A)][sta26] uses unregistered **or** non-active status, subject to exclusions. Registered but inactive buyer can miss the default. Runtime default was documented as follow-up: this is not a tested production calculation finding. | Correct the Boolean and use federal sales-tax active status, not income ATL; apply exclusions separately. |
| PK-14 | HIGH launch gap / MEDIUM scope metadata | B C-34/VB-2; packs PK-6; country rule | Broad FBR-registered scope is right; generic “has STRN” can wrongly include provincial-only registration. SRO709's dates were superseded by [SRO1852][di1852]. Outbox/Noop/status scaffolding does not establish production fiscal acceptance. | Qualify federal coverage/date, implement/verify real integrator/PRAL, current payload, number/QR, notes/retries/reconciliation and taxpayer-specific extensions. |
| PK-15 | MEDIUM, warning claim | C-20 SUPPLIER_NTN_MISSING; country rule | Missing stored NTN triggers categorical “10% disallowed” text. Missing captured evidence is not proof supplier is a non-holder; an individual can use CNIC [FBR][ntn]. s.21(q) cannot be applied to every expense from field emptiness alone. | Warn of missing identity/registration evidence and possible disallowance; assess actual status, qualifying purchases and exceptions in the tax computation. |
| PK-16 | MEDIUM, buyer identity scope | TC2 invoice-content rules:24,61; packs:795–796 | Generic unregisteredBuyerAboveThreshold is not current [STA s.23(1)(b)][sta26]'s manufacturer/importer-to-unregistered-distributor category. It can miss a covered distributor below a generic threshold or demand CNIC in an inapplicable consumer case. | Model current seller/buyer category and applicable DI scenario, rather than an old universal CNIC threshold. |
| PK-17 | MEDIUM, current-source gap | PK-5a CHECKED prose; PK CSVs UNCHECKED | Federal 2026 rates were verified here. Current PRA rate/withholding schedule and SRB/BRA 2026 withholding amendments were not fully read; older consolidations cannot certify them. V22/V33 do not mark PK checked. | Resolve the explicitly listed provincial source gaps with exact edition/section/effective-date evidence before marking current scenarios checked. |

All fixes remain proposed. PK-02 has an existing inspected SQL remedy; other findings await owning-lead assessment.

## Inventory: every code, rate, base, dates, side, role and ATL

The union is **17 PK rows in 2026.1, 32 in 2026.2, with 34 PK dated rate versions**; no 2026.1 code is omitted. Blank is not zero. All WITHHOLDING codes start inactive. Except PK-WHT-ST, their executable rates are null: percentages below are non-binding hints.

TC2 has base_rule NET generally, but its separate withholding base_type governs withholding defaults. Versions have no explicit end date: a later version supersedes its predecessor. Dataset dates are not original statutory commencement dates. P=PURCHASES, S=SALES; S→P means raw TC2 SALES repaired by V33 for matching copies.

Role/account numbers are NeoERP choices, not statutory codes. WHT_PAYABLE is a credit liability; WHT_RECEIVABLE and ST_WITHHELD_BY_CUSTOMER are separate debit assets. TC1 provincials shared 2701; TC2 separates them. TC1 generic services used 2750, TC2 2755.

| Code; TC2 row (TC1 row) | Our executable rate or ATL/non-ATL hints, valid_from | Base; active; regime | Side; jurisdiction; role/account | Official / ATL handling |
|---|---|---|---|---|---|
| `PK-PST-IN`; 74 (12) | blank from 2025-07-01 | NET; inactive; no regime | P; PK-PROV; SALES_TAX_INPUT/1601 | Authority-specific provincial input eligibility; inactive, no default rate. |
| `PK-PST-PB`; 75 (8) | 16% from 2025-07-01 | NET; active; no regime | S; PK-PB; SALES_TAX_OUTPUT/2701 | 16% in pack; current PRA schedule pending; no income-ATL multiplier. |
| `PK-SST-SD`; 76 (9) | 15% from 2025-07-01 | NET; active; no regime | S; PK-SD; SALES_TAX_OUTPUT/2703 | General15% [SRB][srb-rates]; exceptions; no income-ATL multiplier. |
| `PK-ST-18`; 77 (2) | 18% from 2025-07-01 | NET; active; no regime | S; PK-FED; SALES_TAX_OUTPUT/2700 | 18% [STA3(1)][sta26]; no income-ATL multiplier. |
| `PK-ST-3RD`; 78 | 18% from 2025-07-01 | RETAIL_PRICE; active; no regime | S; PK-FED; SALES_TAX_OUTPUT/2700 | Retail-price default18%; schedule/notification overrides [STA3(2)(a)][sta26]. |
| `PK-ST-BA`; 79 (11) | 15% from 2025-07-01 | NET; active; no regime | S; PK-BA; SALES_TAX_OUTPUT/2706 | General15% [BRA8][bra-act];2026 notification reconciliation pending. |
| `PK-ST-EXEMPT`; 80 (5) | blank from 2025-07-01 | NET; active; no regime | S; PK-FED; no role/account | Exempt, distinct from zero; input restriction [STA8/Sixth][sta26]. |
| `PK-ST-FURTHER`; 81 (6) | 4% from 2025-07-01 | NET; active; no regime | S; PK-FED; SALES_TAX_OUTPUT/2702 | 4% additional; unregistered OR sales-tax inactive, exclusions [STA3(1A)][sta26]. |
| `PK-ST-IN`; 82 (7) | 18% from 2025-07-01 | NET; active; no regime | P; PK-FED; SALES_TAX_INPUT/1600 | 18% invoice default; actual amount and credit eligibility [STA7–8B,73][sta26]. |
| `PK-ST-KP`; 83 (10) | 15% from 2025-07-01 | NET; active; no regime | S; PK-KP; SALES_TAX_OUTPUT/2704 | General15% [KPRA][kp-faq]; exceptions; no income-ATL multiplier. |
| `PK-ST-RC`; 84 (13) | blank from 2025-07-01 | NET; inactive; no regime | P; PK-PROV; SALES_TAX_OUTPUT_RC/2705 + SALES_TAX_INPUT_RC/1605 | Conditional provincial recipient liability; no universal rate/credit. |
| `PK-ST-RED`; 85 (3) | blank from 2025-07-01 | NET; inactive; no regime | S; PK-FED; SALES_TAX_OUTPUT/2700 | Item-specific Eighth Schedule [STA][sta26]; inactive placeholder. |
| `PK-ST-WHT-BY-CUST`; 86 | blank from 2025-07-01 | SALES_TAX; inactive; no regime | S; PK-FED; ST_WITHHELD_BY_CUSTOMER/1625 | SALES ST asset; actual buyer scenario; no income-ATL doubling. |
| `PK-ST-ZERO`; 87 (4) | 0% from 2025-07-01 | NET; active; no regime | S; PK-FED; no role/account | 0% eligible supply [STA4/Fifth][sta26]; input entitlement conditional. |
| `PK-WHT-153-CONTRACT`; 88 | blank from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2760 | Company7.5/15; other8/16; sport15/30 [card][card27]; GROSS; structured hints blank, figures in side_note. |
| `PK-WHT-153-GOODS`; 89 (14) | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | P; PK-FED; WHT_PAYABLE/2750 | Manual classification placeholder; gross153, not zero rate. |
| `PK-WHT-153-GOODS-CO`; 90 | 5/10% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2750 | Ordinary company5/10 [card][card27]; GROSS; special/toll exclusions. |
| `PK-WHT-153-GOODS-OTHER`; 91 | 5.5/11% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2750 | Ordinary other5.5/11 [card][card27]; GROSS; special/toll exclusions. |
| `PK-WHT-153-SVC`; 92 (15) | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | P; PK-FED; WHT_PAYABLE/2755 | Manual service classification; gross153. |
| `PK-WHT-153-SVC-CERTAIN`; 93 | 6/12% hints from 2025-07-01; 7/14% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2755 | 6/12 TY2026;7/14 TY2027 [cards][cards]; defined list; GROSS. |
| `PK-WHT-153-SVC-IT`; 94 | 4/8% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2755 | 4/8 [card][card27]; defined domesticIT/IT-enabled, GROSS, not154A exports. |
| `PK-WHT-153-SVC-MEDIA`; 95 | 1.5/3% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2755 | 1.5/3 [card][card27]; electronic/print-media advertising only; GROSS. |
| `PK-WHT-153-SVC-OTHER`; 96 | 15/30% hints from 2025-07-01; 14/28% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2755 | 15/30 TY2026;14/28 TY2027 [cards][cards]; residual; GROSS. |
| `PK-WHT-153-SVC-PORT`; 97 | 12/24% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2755 | 12/24 [card][card27] for company terminal/port operators; GROSS. |
| `PK-WHT-153-SVC-PROF`; 98 | 15/30% hints from 2026-07-01 | NET_OF_SALES_TAX; inactive; MINIMUM | S→P (V33); PK-FED; WHT_PAYABLE/2755 | 15/30 [card][card27] independent professionals; GROSS. |
| `PK-WHT-155`; 99 (16) | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | P; PK-FED; WHT_PAYABLE/2751 | Gross rent; annual slabs/company15/30 [card][card27], not generic net-base slab. |
| `PK-WHT-BY-CUST`; 100 (18) | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | S; PK-FED; WHT_RECEIVABLE/1620 | SALES income-tax asset; actual153 deduction, GROSS, regime conditional. |
| `PK-WHT-PST-BA`; 101 | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | S→P (V33); PK-FED; WHT_PAYABLE/2759 | Provincial fraction/full/exclusions [BRA][bra-wh];2026 pending; no income-ATL doubling; wrongPK-FED. |
| `PK-WHT-PST-KP`; 102 | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | S→P (V33); PK-FED; WHT_PAYABLE/2758 | Residual50% OF TAX/full/exclusions [KP][kp-wh]; no income-ATL doubling; wrongPK-FED. |
| `PK-WHT-PST-PB`; 103 | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | S→P (V33); PK-FED; WHT_PAYABLE/2756 | Current PRA scenario pending; no income-ATL doubling; wrongPK-FED. |
| `PK-WHT-PST-SD`; 104 | blank from 2025-07-01 | NET_OF_SALES_TAX; inactive; no regime | S→P (V33); PK-FED; WHT_PAYABLE/2757 | Historic1/5 tax/full/exclusions [SRB][srb-wh];2026 pending; no income-ATL doubling; wrongPK-FED. |
| `PK-WHT-ST`; 105 (17) | 20% from 2025-07-01 | SALES_TAX; inactive; no regime | P; PK-FED; WHT_PAYABLE/2752 | 20% OF SALES TAX in eligible [Schedule][sta26] scenario only; inactive. |

### Rate/date assessment

[TY2027 pp.7–10][card27] confirms ordinary goods/services/contracts. **Do not replace 7/14 with 6/12, or 14/28 with 15/30, for payments from 2026-07-01.** [TY2026][card26] supports the earlier rates. Professional and company-port categories became distinct in 2026. IT/media continue at 4/8 and 1.5/3 respectively.

Current [ITO Sch.1 Pt.III Div.III, pp.542–546][ito26] also covers special goods and toll manufacturing; ordinary GOODS-CO/OTHER are not exhaustive. s.153 includes advances/part payments, prescribed-payer definitions and aggregate annual thresholds: goods less than 75,000 and services less than 30,000. Test the exact boundaries, not just a per-invoice amount. These are missing applicability controls, not reasons to overwrite the correct ordinary rates.

## Rent, ATL and section 236 boundaries

[ITO s.155][ito26] covers gross rent and specified related payments/advances. Payer designation matters: companies are prescribed payers; individual/AOP payer designation includes annual gross rent at least 1.5 million. Do not confuse that payer threshold with the landlord's rate slabs.

| s.155 payee / annual gross rent R | ATL withholding | Non-ATL |
|---|---|---|
| Individual/AOP, R≤300,000 | Nil | Nil |
| 300,000<R≤600,000 | 5% × (R−300,000) | Twice applicable ATL tax |
| 600,000<R≤2,000,000 | 15,000 + 10% × (R−600,000) | Twice applicable ATL tax |
| R>2,000,000 | 155,000 + 25% × (R−2,000,000) | Twice applicable ATL tax |
| Company payee | 15% of gross rent | 30% |

Source: [TY2027 p.10][card27], [Sch.1 Pt.III Div.V p.549 and Tenth Schedule r.1][ito26]. Blank PK-WHT-155 does not implement these computations.

Chart accounts 1630 (advance income tax) and 2753 (236G/H collections) exist; the reviewed tax CSVs have no dedicated 236/G/H codes:

| Section | Current official rates / scope | Accounts consequence |
|---|---|---|
| 236, telephone/internet | Non-mobile monthly bill over 1,000: 10% of excess; mobile/internet/prepaid/units: 15% of bill/sale price. General non-ATL doubling excluded; special s.114B cases separate. [Card p.16][card27]; ITO s.236, Sch.1 Pt.IV Div.V/Tenth r.10(l). | Provider collects from subscriber. Company normally records eligible tax from utility invoice/certificate as advance-tax asset; this is not its ordinary s.153 supplier deduction. |
| 236G, covered distributors/dealers/wholesalers | Fertilizer 0.25% ATL / 0.70% non-ATL; other covered supplies 0.1% / 2%. [Card p.17][card27]. | Seller collection with industry/actor conditions; 2753 alone is insufficient. |
| 236H, covered retailer sales | 0.5% ATL / 2.5% non-ATL. [Card p.17][card27]. | Seller collection; separate invoice collection/remittance, not supplier-payment deduction. |

Thus ordinary 153/155 non-ATL doubling is **not universal**: 236/G/H differ. Separate income ATL, federal sales-tax registration/active status and provincial status, effective at the relevant event, with lookup evidence.

## Provincial rates, registration and withholding

Standard rates do not decide every service's rate, input credit or withholding. No federal income-ATL multiplier should be applied to provincial output tax.

| Authority | Official evidence established | Current-use limit |
|---|---|---|
| PRA, Punjab | Pack 16% is the familiar standard rate. [Registration rules r.2][pra-reg] establish provider/person-liable registration; certificate uses PNTN and invoice note NTN. [Portal][pra-portal] separately verifies provincial sales-tax ATL by PNTN/CNIC. | Current rate schedule, FA2026 changes and current withholding amendments could not be retrieved reliably. **16% is not certified as a universal/current service rate here.** Do not use historical 2012 rules as current withholding law. |
| SRB, Sindh | [Official page][srb-rates]: general 15%, telecom 19.5%. [Retrieved consolidation r.3(3)–(5A)][srb-wh]: ordinary 1/5 of tax; unregistered/inactive full-tax/tax-fraction cases; specified government 4/5; specified-service full withholding. | URL nominally 2024 with later footnotes. [Legal index][srb-index] advertises July2026 consolidation; notifications list SRB-3-4/24/2026 dated 30June2026. That amendment was not read: historical matrix is **not certified current**. |
| KPRA, KP | [FAQ][kp-faq]: general 15%, telecom 19.5%. [2024 regulations, gazetted 3Jan2025, paras.2,4–6][kp-wh]: residual 50% of tax; full-tax cases for ads, unregistered/inactive, specified government/reduced-rate/out-of-province-unregistered scenarios; sector exclusions. | Reconcile subsequent notifications and exact service/payer. Output rate 15% is not the WHT fraction. |
| BRA, Balochistan | [Act through FA2026 s.8][bra-act]: general 15%; s.26A B+NTN registration; s.30 supplier registration and recipient registration if any. [Retrieved 2018 WHT r.3][bra-wh]: ordinary 1/5 of tax; specified full-tax/excluded cases and unregistered tax fraction unless contract otherwise. | [Official index][bra-index] lists later [WHT amendment][bra-wh26] and [rates effective July2026][bra-rates26]. Scanned contents unverified; do not certify the old matrix or all reduced rates as current. |

Record authority-specific registration, normalized identifier, active/validity status, provider/recipient location and service classification. Federal STRN-only validation cannot establish every provincial registration. There is no safe single national service-registration threshold.

## Purchase-invoice identities and Digital Invoicing

[FBR][ntn] identifies seven-digit company/AOP NTN and normally 13-digit individual CNIC. [FBR clarification][strn] says NTN does not substitute for STRN and identifies a Third-Schedule retailer exception.

Distinguish recording the expense, whether a supplier may charge the authority's tax, and whether the buyer may claim input. An ordinary non-registered supplier's cost invoice is not automatically prohibited. Retain prescribed supplier/recipient particulars [STA s.23][sta26]; a populated field does not prove entitlement. Provincial service invoices need their own authority requirements. C-20's warning/guard is useful capture, not a complete credit decision.

The [official DI v1.12 specification][di-api] accepts NTN/CNIC in identity fields; this does not permit putting STRN into NTN/CNIC fields. Normalize identifiers and verify the current production schema separately.

[SRO1852][di1852] supersedes 1413. Issue dates: 1Nov2025 for public companies/importers, companies above 1billion turnover and individuals/AOP above 100million; 15Nov for other companies above100million up to1billion; 1Dec for remaining companies; 31Dec for residual registered persons. Registration/testing have separate earlier dates. This is notified federal sales-tax coverage, not every NTN holder or provincial-only registrant. Check taxpayer-specific extensions.

The 2026 [STA s.23][sta26] includes exempt supplies/advance receipt invoice wording and makes unique verifiable FBR number timing notification-dependent. Contracts store much fiscal data, but this audit did not demonstrate current production payload acceptance or completed note/advance/exempt scenarios. Real provider and statutory outputs remain explicit launch gates.

## Rules a PK company needs before go-live

Assign these to implemented workflows or documented operating controls. A manual ledger is not a statutory calculation/filing engine; not every provision applies to every company.

1. **Withholding obligation:** prescribed payer; resident/non-resident/PE (152 versus153); goods/services/execution contract; legal form; special goods/toll manufacturing; exact service categories; annual thresholds; advances; lower-rate/exemption certificates and expiry.
2. **Settlement/base engine:** inclusive 153 gross; ST fractions/full-tax/tax-inclusive extraction; multi-invoice partial payments, advances, discounts, notes, recoveries and reversals without duplicate deductions.
3. **Dated status and regime:** income ATL plus separate federal/provincial registers; status evidence at payment; stale/unknown review; section-specific late/non-ATL rules; adjustable/minimum/final exceptions.
4. **Administration:** s.160 remittance/current deadlines, s.164 certificates, s.165 statements, PSID/CPR by authority/section/payee/period, amendments and ledger-return-deposit reconciliation. C-13 expressly defers certificates/statements/deposit tracking; balance/certificateRef alone is insufficient.
5. **Rent and received taxes:** annual155 landlord computations; eligible235/236 and other incoming credits supported by utility/bank certificates, separated from expense and withholding liabilities.
6. **Conditional collections/other sections:**236G/H seller/industry scope;148 imports;233 brokerage;154/154A exports;152 non-residents;236C/K property and236Y foreign cards where relevant. Generic2753/2754 do not implement these rules.
7. **Federal ST catalog:** PCT/HS/SRO serials, Third-Schedule retail-price basis/quantities, zero versus exempt, other schedules, further/extra tax, industry/e-commerce WHT, exceptions and effective/end dates.
8. **Input eligibility:** valid invoice/registration, taxable/exempt apportionment, blocked/reduced-rate restrictions, GD/import evidence, claim periods, s.8B/s.73 conditions and payment evidence, carry-forward/refund and cross-authority admissibility. Default100% is not entitlement.
9. **Provincial services:** independent registrations, situs/interprovincial rules, schedules, recipient/reverse-charge liability, agent designation, fraction/full/excluded cases, provincial returns/deposits/certificates/credit restrictions; ICT if applicable.
10. **Invoice/identity controls:** typed authority identifiers/status evidence; correct company/branch/buyer/supplier; input-credit acceptance distinct from cost recording; original note references and tax breakdown.
11. **Production DI:** actual integrator/PRAL onboarding, production credentials/current schema, sale scenario classification, number/QR, notes/advances/exempt supplies, idempotency/retry/cancellation/outage handling, retention and return reconciliation.
12. **Acceptance evidence:** every activated code, 30June/1July2026, ATL change, 100,000+18,000 gross-base example, full/fraction/excluded ST, provincial-only supplier, partial/advance payment, note and deposit/return match. Assert statutory money/base, not tests mirroring our formulas.

## Source ledger and verification limits

Official primary law prevails over summary cards. Browser retrieval initially timed out, but approved read-only in-memory downloads succeeded: ITO2026 7,870,242 bytes/839 PDF pages; TY2027 card 460,845 bytes/18 pages. Operative provisions were distinguished from amended-out footnotes. No downloaded file was saved.

| Source | Use and limit |
|---|---|
| [ITO consolidated 30June2026][ito26] | Direct relevant-page reads:153(1)/(3),155,236, Sch.1 Pt.III Div.III/V, Tenth r.1; printed page329 is PDF348. |
| [TY2027 card][card27] / [FBR index][cards] | Current153/155/236/G/H, pp.7–10,16–17; guidance, not overriding statute. |
| [TY2026 card][card26] | Official indexed2025 goods/services/contracts/rent comparison; full browser download timed out. No claim these rates remain current where2026 changed them. |
| [Finance Act2025][fa25] / [Finance Act2026][fa26] | Official links found; standalone oversized PDFs exceeded browser limits. Relevant federal amendments verified through current official consolidation/card, not a claim to read every standalone Act page. |
| [STA through 30June2026][sta26] | Relevant ss.3/7/8/23 and Eleventh Schedule read. |
| [2007 WHT rules consolidated2015][old-wh] | Historical source checked, not substituted for current Schedule. |
| [SRO1852][di1852], [DI FAQ][di-faq], [API1.12][di-api] | Scope/timetable/identity; FAQ709 dates historical; latest production conformance not tested. |
| Provincial sources above | Verified only to editions/limits stated; current PRA/SRB/BRA gaps remain open. |

Resource SHA256 evidence:

- `2026.1/tax-codes.csv`: `31c744e35170a7ad8f0e617b84c1f2675578800ef165d8b9a3d9b273b39cc759`
- `2026.1/pk.csv`: `ac9debec99ce2d6289cf1ba4862080ded87188d0ddca3b30f256118c278248d5`
- `2026.2/tax-codes.csv`: `b4c927d7051408990be2246688358fee91c30e7888d4c3d54e68e1ed821a62d2`
- `2026.2/tax-rate-versions.csv`: `8403af8587888904fbcebf1473da4f3a169cfa6cdf0a7455218dec570603f953`
- `2026.2/pk.csv`: `008bd5315c24831f6affc82bc77d8c5f1779576eb1dbd061bae65139ff698e16`

Only this report was created. No fix acceptance, live taxpayer configuration, migration deployment or production compliance is implied.

[ito26]: https://download1.fbr.gov.pk/Docs/2026724177725705IncomeTaxOrdinanace2001.pdf
[card27]: https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf
[card26]: https://download1.fbr.gov.pk/Docs/20258181281745641WHT-RateCard.pdf
[cards]: https://www.fbr.gov.pk/withholding-taxes-rate-card/174298/174301
[fa25]: https://download1.fbr.gov.pk/Docs/2025629106147620FInanceAct2025.pdf
[fa26]: https://download1.fbr.gov.pk/Docs/20266291261044366FinanceAct2026.pdf
[sta26]: https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf
[old-wh]: https://download1.fbr.gov.pk/Docs/2015941394735438reupdatedSalesTaxSpecialprocedure(Withholding)Rules2007updatedupto30.06.2015.pdf
[ntn]: https://www.fbr.gov.pk/categ/income-tax-status/51147/30846/71148
[strn]: https://fbr.gov.pk/sales-tax--to-be-recovered-only-if-the-supplier-is-registered/132123
[di1852]: https://download1.fbr.gov.pk/SROs/2025924149054920SRO1852.pdf
[di-faq]: https://www.fbr.gov.pk/faqs/173967/173969
[di-api]: https://download1.fbr.gov.pk/Docs/20257301172130815TechnicalDocumentationforDIAPIV1.12.pdf
[pra-reg]: https://reg.pra.punjab.gov.pk/ptms/SOP/Download/Rules/2-Registration%20%26%20De-reg.pdf
[pra-portal]: https://e.pra.punjab.gov.pk/public/txplogin.xhtml
[srb-rates]: https://www.srb.gos.pk/srb/taxable-services/
[srb-wh]: https://www.srb.gos.pk/srb/wp-content/uploads/2024/09/Sindh-Sales-Tax-Special-Procedure-Withholding-Rules-2014-Updated-upto-1st-July-2024-EOE-4.pdf
[srb-index]: https://www.srb.gos.pk/srb/acts-rules-amendments/
[kp-faq]: https://kpra.gov.pk/faqs/?sf_paged=3
[kp-wh]: https://kpra.gov.pk/wp-content/uploads/2025/01/KP-withholding-regulations-2024.pdf
[bra-act]: https://ebra.com.pk/public/storage/uploads/downloads/1785387363.pdf
[bra-wh]: https://ebra.com.pk/public/storage/uploads/downloads/1715239609.pdf
[bra-index]: https://ebra.com.pk/public/downloads
[bra-wh26]: https://ebra.com.pk/public/storage/uploads/downloads/1772518454.pdf
[bra-rates26]: https://ebra.com.pk/public/storage/uploads/downloads/1784709123.pdf
