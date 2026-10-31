# NeoERP statement layouts: legal verification

Sources checked 2026-10-30; report finalized 2026-10-31. **Partial matches in all six countries; no complete statutory-layout clearance.** The Danish open item is resolved: omitting the named financial-items subtotal is supported. Finland needs a different pre-appropriation subtotal restored. Account classification defects also affect every country.

## Checkpoint and evidence boundary

| Field | Record |
|---|---|
| Identity / ownership | `codex-statement-layouts`; Codex owns and integrates this report. Read-only researchers split DK/SE, NO/FI and IS/PK. |
| Authorization | User requested legal verification and exactly this file, committed on workspace `master` as `docs(codex): statement layouts`. No implementation or push authorized. |
| Stage / disposition | Research and source comparison complete; findings are recommendations, not accepted implementation decisions. Documentation skim completed before delivery. |
| Write boundary | This file only. NeoERP-App and NeoERP-BackEnd remained read-only. No PROJECT-STATE file read; explicit user exclusion takes precedence over the workflow default. No separate plan/checkpoint file written. |
| Snapshot | Workspace `4e02a8a`, master; backend `acc9935`, dev. Existing workspace changes: accounts-bc-readiness/brief-sb2a.md, design-principles.md, inbox/erp-lead.md, handoff-implementer.md and untracked accounts-cp-ev-1c / accounts-flow56-fixes directories. Backend had unrelated dirty payables/receipt code; resources and statement code reviewed here were not dirty. |
| Verification | Static reconstruction of migrations, CSVs, statement assembly/wording and contracts, compared with linked primary sources. No database execution, generated statement, build or runtime tests. Docs-only work needs no runtime regression run. |
| Limits / next action | This is a layout and mapping review, not annual-account or filing acceptance. Entity class, materiality, accounting policies and applicable framework still determine required presentation. User/Accounts lead owns decisions on proposed fixes; implementation needs separate scope approval. |

The workflow requests progress recording; the checkpoint above occupies the sole permitted artifact. Its implementation skill was inspected for applicability: behavior-neutral documentation does not trigger the implementation pipeline. Country research was parallel and read-only; this report is the lead's synthesis, not an independent audit opinion.

## 1. What the current definitions actually do

Paths below are relative to the workspace. Define `RES` = `NeoERP-BackEnd/services/accounts-service/src/main/resources`, `STMT` = `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/report/statement`, and `API` = `NeoERP-BackEnd/docs/api`.

Reviewed definitions:

- `RES/db/migration/V13__a3_year_end.sql`: sections at lines 75–162, subtype mappings at 164–370, pack choices at 372–379.
- `V20__a3_statutory_split.sql`: changes the status flag only; no line or classification corrections.
- `V23__pk_statement_ifrs_lines.sql:5–8`: PK financial-items subtotal removed; pre-tax formula rewritten.
- `V24__pl_nature_layouts_split.sql:8–29`: copies sections/mappings for SE and BASE, then removes the financial-items subtotal from generic nature/BASE layouts.
- `RES/packs/2026.2/{dk,se-bas,no-ns4102,fi,is,pk}.csv`, `templates.csv`, and `2026.3/templates.csv`; pack templates do not provide an alternative set of statutory statement lines. The 2026.2 CSV layout columns are empty; report selection is supplied by migration data.

| Country | Effective P&L after V24 | Balance sheet | Financial-items subtotal |
|---|---|---|---|
| Denmark | `PL_NATURE` | `BS_NORDIC` | Absent |
| Sweden | `PL_NATURE_SE` | `BS_NORDIC_SE` | Present |
| Norway | `PL_NATURE` | `BS_NORDIC_NO` | Absent |
| Finland | `PL_NATURE` | `BS_NORDIC_SE` | Absent, including the economically distinct Finnish pre-appropriation subtotal |
| Iceland | `PL_NATURE` | `BS_NORDIC` | Absent |
| Pakistan | `PL_NATURE_GP` | `BS_IFRS` | Absent |
| BASE reference | `PL_NATURE_IFRS` | `BS_IFRS` | Absent; IFRS profit/loss wording |

Actual nature order is revenue → other operating income → total operating income → goods/materials → personnel → depreciation/impairment → other operating expenses → total operating expenses → operating result → finance income → finance costs → [SE financial-items result] → appropriations → pre-tax result → income tax → annual result. Appropriations disappear only when both columns are zero. PK places goods costs and gross profit immediately after revenue; the rest follows the same broad pattern.

All nature variants use `operating result = revenue + other operating income − goods costs − personnel − depreciation/impairment − other operating expenses`. SE's pre-tax result subtracts appropriations from its financial-items result; others compute operating result + finance income − finance costs − appropriations directly. Annual result subtracts income tax. These formulas can balance while classifying individual lines incorrectly.

`STMT/StatementAssembler.kt:12–20,49–54` excludes non-posting headers, maps **account type plus subtype**, and groups subtype buckets alphabetically. Chart headings and number ranges do not control statutory placement. `groupBy=CLASS` instead displays chart headers and omits intermediate statement subtotals (`:56–71`); it is not an alternative statutory schedule.

`STMT/StatementWords.kt:5–30` supplies fixed English API/export captions, with layout-aware IFRS wording. The SQL has no country-local label column. Country wording below is therefore recommended terminology, not a claim that the reviewed backend already emits it. App display translations were not audited.

## 2. Country comparisons

### Denmark — removal confirmed; remaining order, detail and mapping gaps

**Law:** [Årsregnskabsloven, LBK 402 of 23 March 2026](https://www.retsinformation.dk/eli/lta/2026/402/pdf), §23, §§32/81/103 and bilag 2, printed pp55–60. Skema 1/2 are balance sheets; skema 3 is nature P&L; skema 4 is function P&L.

**Matches:** Neither P&L schema contains **“Resultat efter finansielle poster”**. V24's removal is correct. Neither expressly names a before-tax subtotal; ours is supplemental. Separate provisions broadly resemble skema 1; skema 2 places them within maturity categories.

**Differences / recommendation:** Skema 3 items 2–3 require applicable inventory-change and own-work categories; item5 external costs precedes personnel, whereas ours leaves most external costs below depreciation. Separate exceptional current-asset impairment, finance categories/impairment and other taxes (items 8,10–17). Use local captions, e.g. *Nettoomsætning*, *Personaleomkostninger*, *Skat af årets resultat*, *Årets resultat*. Choose one complete BS schema and its material subdivisions. Gross condensation is conditional: §§32/81 allow eligible small/medium entities; §103 prevents treating class D as generally eligible. `PL_DK_GROSS` is promised in packs §2.4 but is absent from the migrations; DK actually uses uncondensed nature presentation. This absence alone is not unlawful because eligible entities may retain detail.

**Account evidence:** `dk.csv:31–32,58,89`: long-term 1380/1390 feed current assets; short-term investment 1800 feeds non-current assets; long-term liability 2290 feeds current liabilities. These contradict the chart's own descriptions. See §3 for exact subtype causes and current group feeds.

### Sweden — keep subtotal, correct authority and operating classification

**Law:** [ÅRL 1995:1554, through SFS 2026:780](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/arsredovisningslag-19951554_sfs-1995-1554/), 3 kap. §§3–4: balance sheet **bilaga 1**, nature P&L **bilaga 2**, function P&L **bilaga 3**. Bilaga 2 does not literally prescribe the financial-items subtotal. Its expense sequence distinguishes materials, external costs, personnel, depreciation/impairment and other operating costs; ours merges external/other costs and places them after depreciation. Applicable inventory/own-work, exceptional current-asset impairment, finance distinctions and other taxes need preservation. Broad BS ordering, restricted/free equity and untaxed reserves match; generic buckets do not reproduce the detailed hierarchy. Aggregation must follow the applicable rules.

**Supplemental authority:** [BFN K2, BFNAR 2016:10, updated 2025-06-16](https://www.bfn.se/wp-content/uploads/vl16-10-k2ar-kons2025.pdf), §§3.4,4.4–4.5, pp45–60, explicitly supplies *Resultat efter finansiella poster*, then appropriations, pre-tax result and annual result. **Keep SE's subtotal**, but correct V24/A3's attribution to the Act itself. Use *Övriga externa kostnader* before personnel and keep other operating costs separate. BFN treats exchange differences on operating trade balances as operating; current SE 3960/3961 and7960/7961 instead feed finance. This moves operating result even if annual profit remains correct. K2 presentation and applicability need separate confirmation for each entity; it is not a universal K3/IFRS clearance.

**Account evidence:** `se-bas.csv:24,49,75–79,151–152,255–256`: long receivable 1380 → current; short investment 1810 → non-current; group 23 loans 2350/2360 and other long debt 2390 → current; explicitly short-term bank loan 2410 → non-current. Overdraft 2330 needs its facility terms assessed; a group number alone does not establish maturity. Recommendations require account-specific or richer classification, not a global reversal of all borrowing subtypes.

### Norway — broad sequence matches; missing distinctions and misroutes

**Law:** [Regnskapsloven](https://lovdata.no/dokument/NL/lov/1998-07-17-56), §§6-1,6-2,6-3. Direct retrieval returned HTTP405; the relevant provision text was available through Lovdata search-indexed chapter/provision results. This limits full-page verification, not the identified code mappings.

**Matches:** §6-1 goes from operating result through finance to pre-tax/tax/annual result without the separately named Swedish subtotal. V24's removal fits. §6-2 broadly supports paid-in/earned equity, provisions, other long-term debt, current debt; deferred-tax liabilities appropriately feed provisions.

**Differences / recommendation:** Preserve applicable WIP/finished-goods movement and own-produced fixed assets (§6-1 items 3–4), depreciation versus impairment (7–8), and finance distinctions (11–18). §6-3 permits clearer aggregation; not every merged heading is automatically unlawful. Use *Driftsresultat*, *Resultat før skattekostnad*, *Skattekostnad*, *Årsresultat*. BS 2030 is described as other paid-in equity but maps to earned equity; §6-2 C.I.3 requires the paid-in category. Long receivables belong in financial fixed assets; current investments and long debt must retain appropriate classification (§6-2 A.III/B.III/D.II).

**Account evidence:** `no-ns4102.csv:28–29,51,64,78`:1380/1390 → current assets;1810 → non-current assets;2030 `RESERVE` → earned equity;2290 → current liabilities. NO's order of depreciation before other operating expenses is not the DK/SE ordering defect.

### Finland — restore the pre-appropriation subtotal; use a Finnish BS hierarchy

**Law and scope:** [KPA 1339/1997](https://finlex.fi/fi/lainsaadanto/1997/1339), ch 1 §§1,6,9–11; [KPA amendment 1752/2015](https://finlex.fi/fi/lainsaadanto/saadoskokoelma/2015/1752). Small/micro entities use [PMA 1753/2015](https://www.finlex.fi/api/media/statute/59852/mainPdf/main.pdf), ch 1§1, ch 2§§1,4,6–8, ch 4§§1–3, Annexes I/V. **1753 is the separate PMA, not the cited KPA amendment.**

**Critical difference:** KPA1:1 and PMA Annex I item 11 require *Voitto (tappio) ennen tilinpäätössiirtoja ja veroja* **before** appropriations. V24 removes the only subtotal there and leaves `RESULT_BEFORE_TAX` after appropriations. Example: operating+finance 100, appropriations 20, tax 10: required subtotal 100; ours only shows 80 pre-tax and 70 annual result. Restore a Finnish subtotal `OPERATING_RESULT+FINANCE_INCOME−FINANCE_COSTS` before appropriations; an additional after-appropriation subtotal is supplementary. Absence of the Swedish caption does not justify removing the Finnish economic subtotal.

**Other differences:** Preserve applicable inventory change, own-use production, materials/services, detailed finance/personnel and other direct taxes. Depreciation before other operating costs matches Finland's order. PMA's abbreviated BS still separates intangible/tangible/investment and inventory/receivable/security/cash categories. The Swedish equity wrapper does not establish that hierarchy. Long receivables need explicit maturity disclosure rather than automatic treatment as fixed assets. Use *Tilinpäätössiirtojen kertymä* for accumulated appropriations; update voluntary-reserve terminology to tax-based reserves. These are KPA/PMA distinctions; aggregation permissions are conditional.

**Equity:** FI 2020 legacy share-premium fund maps to unrestricted equity, while [implementation Act 625/2006 §13](https://data.finlex.fi/fi/lainsaadanto/2006/625) treats that legacy fund as restricted. Conversely all generic `RESERVE` accounts are forced restricted: distinguish actual free/restricted fund character rather than moving every reserve together.

**Account evidence:** `fi.csv:31–32,58,70,74,89,258–259`:1380/1390 lose maturity distinction;1800 → non-current;2020 → unrestricted;2048 → restricted regardless of fund character;2290 → current.8800/8810 correctly feed appropriations, but their preceding subtotal is missing.4700/4710 production power/overheads feed goods costs (`:158–159`); reassess their nature classification instead of assuming all production costs are materials.

### Iceland — subtotal removal fits; expense order and provisions differ

**Authorities:** [lög nr. 3/2006](https://www.althingi.is/lagas/155/2006003.html), arts 6–7,11; [reglugerð 696/2019](https://files.reglugerd.is/pdf/0696-2019/current), arts 3–5, current official PDF dated 12 August 2026.

**Matches:** Art. 5 has no Swedish financial-items subtotal; V24 fits. Revenue, goods costs, payroll, finance and tax have corresponding categories. Cash/bank belongs within current assets.

**Differences / recommendation:** Art. 5 places other operating expenses before depreciation/impairment; ours reverses them. Preserve applicable subsidiary/associate results before finance and discontinued-operation result after tax. Use *Hrein velta*, *Kostnaðarverð seldra vara*, *Hagnaður eða tap ársins*. Operating totals and pre-tax subtotals are supplemental. Art. 3 places pension/tax/other commitments within long-term liabilities; ours puts provisions outside liabilities. Retain material statutory reserve/asset/liability distinctions. Art. 7 of the Act supplies the Icelandic-language baseline, subject to exceptions; fixed English exports do not establish a complete local statutory presentation.

**Account evidence:** `is.csv:31–32,58,71,74–75,88`:1380/1390 → current assets;1800 → non-current; statutory/revaluation/other reserves merge into `RESERVE`;2290 → current liabilities. All Nordic provisions, including `PROVISION_CURRENT`, feed one separate `PROVISIONS` section (`V13:237,242–243`); an Iceland-specific layout is needed rather than sharing that hierarchy unchanged.

### Pakistan — permissible management structure; framework and face-disclosure gaps

**Applicability:** [SECP Third Schedule updated 29 December 2025](https://www.secp.gov.pk/document/updated-3rd-schedule-to-the-companies-act-2017-29-12-2025/?wpdmdl=63339) and [IFRS Foundation Pakistan profile](https://www.ifrs.org/use-around-the-world/use-of-ifrs-standards-by-jurisdiction/view-jurisdiction/pakistan/) distinguish adopted IFRS, IFRS for SMEs and AFRS for SSEs by entity category, with higher-framework options. Fifth Schedule is not universal; listed entities and relevant listed-company subsidiaries need Fourth Schedule analysis. No size thresholds are assumed in this report.

**Matches and limits:** [IFRS Foundation Module 5 reproducing 2015 Section 5](https://www.ifrs.org/content/dam/ifrs/supporting-implementation/smes/module-05.pdf), §§5.5,5.7,5.9,5.11 permits nature/function analysis and useful additional subtotals; there is no required Swedish financial-items subtotal. V23's removal and profit/loss wording are appropriate. However, PK gross profit subtracts only the goods-cost subtype bucket; production payroll/depreciation remain below it. Validate allocation before representing this as complete function-based cost of sales. Applicable equity-method results and discontinued operations also need distinct presentation. This review uses the 2015 SMEs text; it does not assume automatic Pakistan adoption of the 2025 edition or certify AFRS compliance.

**Balance sheet:** [IFRS Foundation Module 4 reproducing 2015 Section 4](https://www.ifrs.org/content/dam/ifrs/supporting-implementation/smes/module-04.pdf), §§4.2–4.5,4.10 requires appropriate material categories and current/non-current classification, without imposing one universal sequence. Non-current deferred tax routing is appropriate; undifferentiated subtype buckets are insufficient when required distinctions are material.

**Additional Pakistan requirements:** [SECP Companies Act consolidation updated 18 August 2022](https://www.secp.gov.pk/document/the-companies-act-2017-updated-18-aug-2022/?wpdmdl=45422), Fifth Schedule Part II cl. 6 requires separate face presentation of revaluation surplus, long-term deposits/prepayments, unpaid/unclaimed dividends and cash/bank. Clauses 20–21 add associated-party/current-liability distinctions; Part III cl. 25 requires separate turnover deductions for trade discounts and sales/directly attributable taxes. Our generic reserves/prepayments/payables/net-revenue buckets do not reliably supply those lines. Add dedicated face lines where applicable. This schedule adds disclosures, not a complete fixed Nordic-style sequence. No later Fifth Schedule amendment was identified in the reviewed sources; the 2022 consolidation date remains an evidence limitation requiring revalidation before filing use.

**Account evidence:** `pk.csv:31–32,64,79–80,93`: long-term 1380/1390 → current assets; short investment 1800 → non-current; revaluation/other reserves share `RESERVE`; long-term2290 → current liabilities. Revenue deductions share `REVENUE`, so a net amount alone does not deliver separate turnover-deduction face lines. A3's framework selector changes labels/notes, not layout logic (`API/accounts-a3.md:188`; `STMT/StatementReadService.kt:165`).

## 3. Exact mapping causes and account-group feeds

The following findings are derived from CSV descriptions plus executable map definitions. They concern seeded definitions; an existing tenant may retain older copied classifications. No tenant data was inspected.

| Finding | Actual feed | Recommendation |
|---|---|---|
| All six charts: group 18 short-term investments,1800 (DK/FI/IS/PK) or1810 (NO/SE) | `ASSET/FINANCIAL_ASSET → NON_CURRENT_ASSETS` | Separate current investments from long-term holdings; preserve economic holding/maturity assessment. |
| Long-term receivables1380/1390 in DK/NO/IS/PK,1380 in SE | `ASSET/OTHER_RECEIVABLE → CURRENT_ASSETS` | Provide appropriate non-current/long-term category; FI separately needs long-term receivable disclosure in its own tase hierarchy. |
| Long-term other debt2290 in DK/NO/FI/IS/PK;2390 in SE | `LIABILITY/OTHER_PAYABLE → CURRENT_LIABILITIES` | Add non-current other-payable classification; do not move all trade/other payables globally. |
| SE2350/2360 versus2410 | Former `BORROWING_CURRENT → CURRENT_LIABILITIES`; latter `BORROWING → NON_CURRENT_LIABILITIES` | Correct seeded maturity classifications and provide current-portion handling. |
| NO 2030 | `EQUITY/RESERVE → EQUITY_EARNED` | Identify other paid-in capital distinctly. |
| FI 2020 versus generic 2048 | `SHARE_PREMIUM → EQUITY_UNRESTRICTED`; `RESERVE → EQUITY_RESTRICTED` | Distinguish legacy restricted funds and actual free reserves. |
| SE 3960/3961,7960/7961 operating FX | `FX_GAIN → FINANCE_INCOME`; `FX_LOSS → FINANCE_COSTS` | Separate operating FX from financing FX. |

Mapping evidence: `V13:165–206` P&L; `:207–247` DK/IS BS; `:248–288` NO; `:289–329` SE/FI; `:330–370` PK. V24 copies the original nature mapping unchanged into SE/BASE. Maturity cannot be inferred from account type/subtype alone when the same subtype appears in both long- and short-term chart groups.

### 3.1 Complete seeded group-to-line crosswalk

Generated by reading every **posting** row of the six 2026.2 CSVs and applying V13's `(layout,type,subtype)` mapping, with V23/V24 selection changes. Numbers are immediate chart-parent group codes, not statutory account codes. A group listed on two lines is split by its posting accounts; it is not double counted. Tables show **current behavior**, including defects above. No posting row lacked an explicit mapping. Non-posting class/group headers feed no line themselves. Names of all groups are in the cited CSV headers; grouped codes below exhaust their posting-account parent groups.

#### P&L groups

| Section code | DK | SE | NO | FI | IS | PK |
|---|---|---|---|---|---|---|
| `REVENUE` | 30, 31, 32 | 30, 31, 33, 35, 37 | 30, 31, 32 | 30, 31, 32 | 30, 31, 32 | 30, 31, 32 |
| `OTHER_OPERATING_INCOME` | 37, 38, 39 | 37, 39 | 34, 36, 37, 38, 39 | 37, 38, 39 | 37, 38, 39 | 37, 38, 39 |
| `COST_OF_SALES` | 40, 43, 45, 47 | 40, 45, 46, 49 | 40, 43, 45 | 40, 43, 45, 47 | 40, 43, 45, 47 | 40, 43, 45, 47 |
| `EMPLOYEE_BENEFITS` | 50, 54, 59 | 70, 72, 74, 75, 76 | 50, 53, 54, 58, 59 | 50, 54, 59 | 50, 54, 59 | 50, 54, 59 |
| `DEPRECIATION_AND_IMPAIRMENT` | 60 | 77, 78 | 60 | 60 | 60 | 60 |
| `OTHER_OPERATING_EXPENSES` | 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78 | 50, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 69, 79 | 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78 | 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78 | 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78 | 61, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78 |
| `FINANCE_INCOME` | 80 | 39, 80, 83 | 80 | 80 | 80 | 80 |
| `FINANCE_COSTS` | 81 | 79, 84 | 81 | 81 | 81 | 81 |
| `APPROPRIATIONS` | — | 88 | — | 88 | — | — |
| `INCOME_TAX` | 83 | 89 | 83 | 83 | 83 | 83 |

#### Balance-sheet groups

| Section code | DK | SE | NO | FI | IS | PK |
|---|---|---|---|---|---|---|
| `NON_CURRENT_ASSETS` | 10, 11, 12, 13, 18 | 10, 11, 12, 13, 18 | 10, 11, 12, 13, 18 | 10, 11, 12, 13, 18 | 10, 11, 12, 13, 18 | 10, 11, 12, 13, 18 |
| `CURRENT_ASSETS` | 13, 14, 15, 16, 17, 19 | 13, 14, 15, 16, 17, 19 | 13, 14, 15, 17, 19 | 13, 14, 15, 16, 17, 19 | 13, 14, 15, 16, 17, 19 | 13, 14, 15, 16, 17, 19 |
| `CASH_AND_BANK` | 19 | 19 | 19 | 19 | 19 | 19 |
| `EQUITY` | 20 | — | — | — | 20 | 20 |
| `EQUITY_PAID_IN` | — | — | 20 | — | — | — |
| `EQUITY_EARNED` | — | — | 20 | — | — | — |
| `EQUITY_RESTRICTED` | — | 20 | — | 20 | — | — |
| `EQUITY_UNRESTRICTED` | — | 20 | — | 20 | — | — |
| `UNTAXED_RESERVES` | — | 21 | — | 20 | — | — |
| `PROVISIONS` | 21 | 22 | 21 | 21 | 21 | — |
| `NON_CURRENT_LIABILITIES` | 22 | 24 | 22 | 22 | 22 | 21, 22 |
| `CURRENT_LIABILITIES` | 22, 23, 24, 25, 26, 27, 28, 29 | 23, 24, 25, 26, 27, 28, 29 | 22, 23, 24, 25, 26, 27, 28, 29 | 22, 23, 24, 25, 26, 27, 28, 29 | 22, 23, 24, 25, 26, 27, 28, 29 | 22, 23, 24, 25, 26, 27, 28, 29 |

Posting rows checked: DK 198, SE 207, NO 195, FI 196, IS 193, PK 218.

`CASH_AND_BANK` rolls into `CURRENT_ASSETS`; equity subsections roll into `EQUITY`. Therefore their parent totals include them even when they have no directly mapped groups. No chart group feeds a formula subtotal directly: the formulas in §1 supply operating totals/results, PK gross profit and annual result. BS totals sum the sections once; Nordic total equity/liabilities includes provisions separately, IFRS includes provisions within liability sections. Computed unclosed/current-year profit also feeds the applicable equity section (`StatementAssembler.kt:13–18,36–37`), independently of chart-group postings.

## 4. Contract reconciliation and disposition

| Reference | Ours / discrepancy | Recommended record correction |
|---|---|---|
| `API/accounts-packs-2026-2.md §2.4:564–582` | Promises `PL_DK_GROSS`, country-local section-label data and pre-V24 default layouts; actual migrations/wording differ. | Describe actual post-V24 choices, mark DK condensation unimplemented/conditional, distinguish intended local wording from fixed English backend names. |
| `API/accounts-a3.md §3.1:175–188` versus amendment at 219ff | Original selection table still names SE/BASE `PL_NATURE`; amendment describes new layouts. | Consolidate the effective selection table in a future authorized doc update. |
| `V24:1–5`; A3 PL-split explanation at 219ff | Claims Swedish subtotal literally occurs in ÅRL bilaga 2 and groups Finland with countries needing no corresponding subtotal; cites 1753 as KPA amendment. | Cite BFN for SE; restore Finnish pre-appropriation semantics; distinguish KPA 1752 amendment from PMA 1753. Existing migrations stay immutable; any eventual correction uses a new migration. |
| `API/accounts-a2.md:51`, §5 | A2 expressly excludes P&L/BS and supplies TB/GL/read-model infrastructure. | Do not treat balancing against TB as legal-line verification; classification errors can preserve totals. |
| `API/accounts-a3.md:53–54`, §6.2/6.3 | Annual-account filing/notes/consolidation are outside A3. | Preserve this scope boundary alongside layout corrections. |
| `API/accounts-h-se.md §0, §4.2–4.3:184–207` | SIE account types/SRU and signed account balances are interchange/tax mappings, not ÅRL presentation lines. | SIE success or SRU coverage does not establish the statutory statement order; imported accounts need statement classification too. |
| `V20:12–22`; `StatementReadService.kt:122,166–180` | Presence of either maturity subtype plus a 2026.2+ chart can produce `STATUTORY_LAYOUT`; it does not inspect complete legal hierarchy or listed misroutes. | Treat the flag as limited structural metadata until country validation exists; no compliance clearance from this flag. |

Priority recommendations, all **pending** and unimplemented:

1. Restore Finland's pre-appropriation result and correct the legal attribution of the SE subtotal. Danish omission is verified and should remain.
2. Correct concrete investment, receivable, debt, equity and operating-FX classifications. A richer mapping model must distinguish maturity, statutory category and operating/financing character; global subtype remaps would create new errors.
3. Add country-specific ordering and applicable detailed lines, including separate DK/SE external costs and the Iceland provisions hierarchy. Establish entity-class/framework rules before offering a statutory presentation option.
4. Align captions/contracts/status wording with actual coverage. Preserve management-report access while separating complete annual-account presentation from a balanced ledger report.

A future implementation should verify new and existing copied charts, zero and comparative columns, current portions, reserves and operating FX with concrete fixtures. This task changed no code, migrations, chart data, settings or filing behavior. Delivery is restricted to the sole report commit on master; no push.
