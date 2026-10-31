# NeoERP shipped tax-pack audit — 2026

| Country | Tax-code rows checked (2026.1 + 2026.2) | OK* | Rows with findings (legacy + current) | 2026.2 rate versions checked | Main qualification |
|---|---:|---:|---:|---:|---|
| NO | 12 + 23 = 35 | 32 | 1 + 2 = 3 | 23 | Import-code side; water/sewer help |
| SE | 15 + 26 = 41 | 41 | 0 | 26 | General rules verified; eligibility remains transaction-specific |
| DK | 0 + 20 = 20 | 19 | 0 + 1 = 1 | 20 | Full official standard-code JSON unavailable |
| FI | 0 + 18 = 18 | 16 | 0 + 2 = 2 | 28 | Historical import procedure; reduced-rate coverage |
| IS | 0 + 11 = 11 | 10 | 0 + 1 = 1 | 11 | Customs-import label/coverage qualification |
| PK | 17 + 32 = 49 | 36 | 0 + 13 = 13 | 34 | 13 side errors corrected by V33; current-law verification gaps |
| **Total** | **44 + 130 = 174** | **154** | **20 distinct rows** | **142** | See unresolved verification items |

*OK = no identified row defect within the checked purpose, not a legal certification. Findings include explicitly qualified coverage/help issues. Multiple findings on a row count once. Pending PK legal-base concerns are not counted as additional confirmed defective rows. All 32 current PK rows have some unverified 2026 legal/reporting scope; all 20 DK rows retain the standard-code mapping qualification. Every code row is listed in the appendix.*

Audit completed 2026-10-31, Europe/Oslo; research began 2026-10-30. There are no tax-code changes in pack 2026.3. The report distinguishes immutable resource data, migration overlays and actual deployment, which was not inspected.

## Findings

Paths below are relative to `NeoERP-BackEnd/`. **P2** means `services/accounts-service/src/main/resources/packs/2026.2/`; **P1** means the corresponding `2026.1/` directory. Row numbers include the header.

### NO-01 — HIGH — Import code 85 has SALES side

- **File/row:** P2 `tax-codes.csv:61`, `NO-MVA-IMPORT-EXEMPT`; `tax-rate-versions.csv:71`; `tax-legal-texts.csv:76–77`.
- **Ours:** EXEMPT, blank rate, SALES, standard tax code 85. Legal text says exempt supply.
- **Source:** official code 85 identifies the basis of imports for which VAT is not calculated, classified at zero rate. It is a purchase/import transaction. [Skatteetaten standard tax codes](https://raw.githubusercontent.com/Skatteetaten/saf-t/master/Standard%20Tax%20Codes/CSV/Standard_Tax_Codes.csv).
- **Effect:** purchases refuse the code as WRONG_SIDE; sales can select an inappropriate import classification. V22 renames it and marks it CHECKED without correcting the side; V33 only covers PK.
- **Recommended fix:** forward-correct the template and eligible company copies to PURCHASES; publish the corrected row in the next pack. Reconcile ZERO/0 versus EXEMPT/null against the code-85 reporting treatment and align rate/legal texts if changed. The side defect is confirmed; changing the internal kind requires that reporting reconciliation.

### NO-02 — MEDIUM — 15% help excludes valid water/sewer use

- **File/row:** P2 `tax-codes.csv:53`, `NO-MVA-15`; P1 `tax-codes.csv:20` also has food-only wording.
- **Ours:** food-rate name/notes; current help explicitly excludes tap water. No dedicated water/sewer code exists.
- **Source:** qualifying waterworks supplies and sewer services have carried 15% since 2025-07-01, including 2026. [Skatteetaten water/sewer rates](https://www.skatteetaten.no/nn/tabellar-og-satsar/merverdiavgiftssatser-omsetning-og-uttak-av-vann-fra-vannverk-og-avlopstjenester/).
- **Recommended fix:** broaden the 15% label/help to include qualifying §5-12 transactions while retaining the narrower food definition under §5-2, or add dedicated codes. Rate 15% and standard mapping 31 are correct. This is a coverage/help issue; do not change the rate. Address retained legacy books explicitly.

### DK-01 — LOW — Outside-scope code is classified EXEMPT

- **File/row:** P2 `tax-codes.csv:16`, `DK-MOMS-OUT-OF-SCOPE`; matching version `tax-rate-versions.csv:16`.
- **Ours:** EXEMPT/no rate/non-reporting, although its own label/report description says outside the VAT Act and maps to S81.
- **Source:** official standard-code material distinguishes outside-scope S81 from exemptions. [Official standard VAT-code JSON](https://git.erst.dk/standard-filformater/standard-filformater/-/blob/master/Standardkontoplanen/JSON/2026-01-01-Momskoder-Bruttoliste.json).
- **Limit:** indexed official material corroborated S81; complete JSON retrieval failed. The semantic contradiction is also visible internally; OUT_OF_SCOPE exists in TaxModel.kt. The contract repeats EXEMPT, so this is a contract/data issue, not implementation drift.
- **Recommended fix:** reconcile the contract and forward-correct kind to OUT_OF_SCOPE, preserving no-rate/non-reporting behavior. No demonstrated tax-amount error.

### FI-01 — MEDIUM, HISTORICAL — Import self-assessment backdated to 2015

- **File/row:** P2 `tax-rate-versions.csv:28`, `FI-ALV-IMPORT` version 1.
- **Ours:** 24% from 2015-01-01, using the output/input pair and import VAT-return treatment.
- **Source:** VAT-registered importers moved to Tax Administration import-VAT self-assessment on 2018-01-01. [Verohallinto procedure effective 2018](https://vero.fi/en/detailed-guidance/guidance/61955/value-added-tax-procedure-for-importation-as-of-1-january-20182/).
- **Recommended fix:** begin this procedure in 2018 or represent earlier customs-paid imports separately; reconcile the expected-rates fixture. A pack support floor cannot backdate a reporting procedure. Current 25.5% is correct; this affects historical transactions.

### FI-02 — MEDIUM, COVERAGE — Generic import/acquisition codes only cover standard rate

- **File/row:** P2 `tax-codes.csv:28,35`, `FI-ALV-IMPORT` / `FI-ALV-RC-EU-GOODS`.
- **Ours:** generic names calculate 25.5%; no 13.5%/10% import/acquisition alternatives.
- **Source:** 2026 imports and EU acquisitions can use those reduced rates; the return aggregates their tax in the applicable field. [2026 return instructions](https://vero.fi/en/businesses-and-corporations/taxes-and-charges/vat/when-to-file-and-pay/), [13.5% import example](https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/vat/international-commerce/value-added-taxation-of-imported-goods/import-vat-must-be-filed-and-paid-on-your-own-initiative/).
- **Effect:** using the generic import code on a €100 food import calculates €25.50 instead of €13.50. Contract §3.2 acknowledges reduced-import coverage as later work.
- **Recommended fix:** label existing codes standard-rate only and add reduced-rate alternatives with correct base/tax/deduction mappings. Existing 25.5% values are individually correct.

### IS-01 — LOW, COVERAGE — Customs-paid import label hides its standard-rate limit

- **File/row:** P2 `tax-codes.csv:45`, `IS-VSK-IMPORT-PAID`.
- **Ours:** generic customs-paid input-VAT label, 24%.
- **Source:** imports may also carry 11%; specified fuel imports/sales temporarily used 11% from 2026-05-01 through 2026-08-31. [Skatturinn 2026 rates](https://www.skatturinn.is/einstaklingar/helstutolur/2026), [customs notice](https://www.skatturinn.is/fagadilar/tollamal/hugbunadarhus/tilkynningar-til-hugbunadarhusa/tollskrarlyklar-med-gildistoku-1.-mai-2026-og-breytt-tollframkvaemd-vegna-urvinnslugjalda-msa-msr).
- **Qualification/fix:** ordinary `IS-VSK-IN-11` already provides an 11% input route. Explicitly document its use against customs evidence and label the 24% code standard-rate only, or add an import-specific 11% code. No proven inability to book reduced-rate imports. Do not change generic 24% versions for the temporary fuel measure.

### PK-01 — HIGH, CORRECTED BY V33 — Thirteen payable withholding rows say SALES

- **File/rows:** P2 `tax-codes.csv:88,90–91,93–98,101–104`: CONTRACT; GOODS-CO/OTHER; SVC-CERTAIN/IT/MEDIA/OTHER/PORT/PROF; PST-BA/KP/PB/SD.
- **Ours:** WITHHOLDING + SALES + WHT_PAYABLE.
- **Expected:** PURCHASES for withholding from suppliers, expressly required by accounts-c.md C-12/C-13. Tax withheld by customers belongs to a sales-side receivable. [FBR withholding framework/cards](https://www.fbr.gov.pk/withholding-taxes-rate-card/174298/174301).
- **Disposition:** `V33__pk_wht_payable_codes_purchases.sql:20–32` corrects all 13 catalog rows and eligible PACK-origin company copies. Legitimate `PK-WHT-BY-CUST` / `PK-ST-WHT-BY-CUST` remain SALES. This is a confirmed immutable-resource defect with a source migration correction, not a claim of an unresolved side defect after successful V33 deployment.
- **Recommended fix:** publish PURCHASES in the next pack; verify deployment and guarded-copy eligibility separately. No live DB was inspected.

### PK-02 — MEDIUM, OPEN AFTER V33 — Payable codes still labeled “by customer”

- **File/rows:** `services/accounts-service/src/main/resources/db/migration/V22__phase2_approved_names.sql:125–137`, the same 13 codes.
- **Ours after V22+V33:** PURCHASES/WHT_PAYABLE, named “deducted by customer” or “withheld by customer”.
- **Expected/source:** supplier withholding/payable labels, consistent with C-12/C-13 and the distinction from legitimate customer-withheld receivables. [FBR framework](https://www.fbr.gov.pk/withholding-taxes-rate-card/174298/174301).
- **Recommended fix:** forward-correct catalog and inherited company labels with provenance guards. V33 changes side only.

### PK-03 — HIGH RISK, CURRENT-LAW CONFIRMATION NEEDED — s.153 base may be too small

- **File/rows:** P2 `tax-codes.csv:88–98,100`, s.153 categories/placeholders and customer-withheld counterpart; accounts-c.md C-13 default base.
- **Ours:** NET_OF_SALES_TAX.
- **Evidence:** an official Auditor-General report quotes s.153 using gross payable including sales tax. On net 100,000 + tax 18,000 at 5%, the default suggests 5,000 versus gross-base 5,900. [Official report, printed p.36](https://www.agp.gov.pk/SiteImage/Policy/AR%20of%20PSC%20and%20LGs%20AY%202023-24%20signed%20by%20AGP%20%281%29.pdf).
- **UNVERIFIED:** whether the quoted historical rule and all exceptions remain operative for each 2026 scenario. The [2026 FBR ordinance PDF](https://download1.fbr.gov.pk/Docs/2026724177725705IncomeTaxOrdinanace2001.pdf) timed out.
- **Recommended fix:** obtain current s.153 and reconcile the contract, then set GROSS where required. Retain explicit typed base/amount confirmation meanwhile. This is a prioritized verification issue, not a proven current-law conclusion.

### PK-04 — MEDIUM — Provincial withholding tagged federal

- **File/rows:** P2 `tax-codes.csv:101–104`, PST-BA/KP/PB/SD.
- **Ours:** PK-FED for all four, despite separate provincial accounts/report descriptions.
- **Source:** provincial authorities separately administer their withholding regimes. [PRA rules](https://reg.pra.punjab.gov.pk/ptms/SOP/Download/Rules/11-Withholding%20Rules%202012.pdf), [KPRA regulations](https://kpra.gov.pk/?download_id=13361&sdm_process_download=1), [SRB rules](https://www.srb.gos.pk/srb/wp-content/uploads/2020/07/01-07-2014-5.pdf).
- **Recommended fix:** PK-BA / PK-KP / PK-PB / PK-SD respectively, with eligible-copy correction. Retrieve current BRA scenario rules separately. The jurisdiction mismatch is visible independently of rate verification; V33 leaves it unchanged.

### PK-05 — MEDIUM RISK, UNVERIFIED SCENARIOS — One provincial withholding base

- **File/rows:** P2 `tax-codes.csv:101–104`.
- **Ours:** NET_OF_SALES_TAX, blank rates, no scenario description, inactive.
- **Evidence:** historical provincial rules distinguish tax-fraction, whole-tax and taxable-value scenarios; SRB includes one-fifth of sales tax, PRA distinguishes bases. [SRB rules](https://www.srb.gos.pk/srb/wp-content/uploads/2020/07/01-07-2014-5.pdf), [PRA rules](https://reg.pra.punjab.gov.pk/ptms/SOP/Download/Rules/11-Withholding%20Rules%202012.pdf).
- **Recommended fix:** retain inactive status; define authority/scenario-specific bases/rates/exclusions after checking current amendments. A uniform NET default is not verified as appropriate.

## Verification and evidence limits

### Dataset and contracts

Read the requested packs/manifests and tax sections of accounts-packs-2026-2.md, accounts-packs-2026-3.md, accounts-a1.md and accounts-c.md, including C-13/C-21, plus V22/V33. All 174 tax-code rows, 142 current rate versions and 130 legal-text rows were inventoried. Every manifest-listed file in all three packs matches its SHA-256. Every explicit tax-account override exists in the matching chart.

All 142 rate-version tuples exactly match `services/accounts-service/src/test/resources/packs/expected-rates-2026.2.csv`. Fixture agreement is not legal validation: FI-01 is shared by both. Every current ZERO/EXEMPT/REVERSE_CHARGE code has English/local legal text; presence does not prove transaction eligibility.

No additional taxed-kind side/role-direction discrepancy was found. RC with positive deduction has output/input destinations; NODED variants intentionally omit input or carry zero deduction. Debit input-VAT offsets in a liability settlement group are not inherently a role error. No live DB, filing/export simulation, application run or Gradle tests were performed.

### Country verification

- **NO:** 25/15/12 agrees with [Skatteetaten rates](https://www.skatteetaten.no/satser/merverdiavgift?pageid=1500). All shipped standard codes were compared with the official CSV above: input 1/11/13; output 3/31/33; domestic zero/exempt/export/RC sale 5/6/52/51; paid import 14/15; self-assessed imports 81–85; foreign services 86–89; allowances/gold 91/92. Exceptions are NO-01/02. Deductible/nondeductible RC pairs are coherent. Raw-fish codes 12/32 are intentionally absent.
- **SE:** 25/12/6 and the declared sale, purchase-RC, import and deduction boxes agree with [return instructions](https://www.skatteverket.se/foretag/moms/deklareramoms/fyllaimomsdeklarationen.4.3a2a542410ab40a421c80004214.html). Food moves to 6% from 2026-04-01 through 2027-12-31; restaurant/catering stays 12%. [Official 2026 change](https://www.skatteverket.se/omoss/pressochmedia/nyheter/2026/nyheter/livsmedelsmomsensankstill6procent.5.70685bee19c85dd5dd0a3f.html). Transactions change fixed-rate codes/boxes under D-89; changing the generic 12% version would be incorrect. Legacy “announced” wording is stale but not a rate error.
- **DK:** 25%, domestic RC seller Rubrik C, EU purchase Rubrik A distinctions and foreign-service destinations agree with broad official guidance. [General VAT](https://skat.dk/en-us/erhverv/moms/i-gang-med-moms), [EU purchases](https://skat.dk/erhverv/moms/moms-ved-handel-med-udlandet/moms-ved-handel-med-virksomheder/moms-ved-handel-med-lande-i-eu/moms-ved-koeb-af-varer-og-ydelser-i-eu), [domestic RC seller](https://info.skat.dk/data.aspx?oid=2068790). **UNVERIFIED:** complete per-row std_vat_code_ref reconciliation: full official JSON unavailable. Comma-separated aliases also need authoritative reconciliation.
- **FI:** 24→25.5% from 2024-09-01, 14→13.5% from 2026-01-01, and 10% newspapers/periodicals are correct. [Rates/history](https://www.vero.fi/yritykset-ja-yhteisot/verot-ja-maksut/arvonlisaverotus/arvonlisaveroprosentit/). General fields 301/302/303, deduction 307, import 310/304, EU goods 313/305 and EU services 314/306 agree with return guidance. Non-EU services use domestic output fields/deduction, without a purchase-base field. [Cross-border services](https://www.vero.fi/en/detailed-guidance/guidance/48679/value-added-taxation-of-cross-border-supply-and-acquisition-of-services/).
- **IS:** 24/11% and 2015-01-01 starts are supported. [2015 change](https://www.stjornarradid.is/efst-a-baugi/frettir/stok-frett/2014/12/19/Breytingar-a-virdisaukaskatti-almennu-vorugjaldi-og-barnabotum-um-naestu-aramot/). Article 12 ZERO versus Article 2 EXEMPT and Article 35 imported-service distinctions are coherent; special services use RSK 10.24 outside ordinary VSK reporting. [Current Act](https://www.althingi.is/lagas/158a/1988050.html), [2026 forms](https://www.skatturinn.is/atvinnurekstur/eydublod/2026). Exact live serialization is untested.
- **PK:** federal 18%, further tax 4%, retail-price Third Schedule base and zero/exempt distinction have official support in the [government trade-portal Act](https://www.tipp.gov.pk/ur-pk/site/display/169), whose inconsistent cover metadata cannot establish all 2026 amendments. Sindh 15% is supported by [SRB](https://www.srb.gos.pk/srb/taxable-services/); Balochistan 15% by [BRA FAQ](https://www.ebra.com.pk/faqs). **UNVERIFIED:** current Punjab 16% schedule; complete 2026 KP/BRA amendments; service-specific exceptions; provincial credits and generic RC eligibility; the 180-day credit-note window; precise FBR/provincial return-field mappings. “Provincial return” or “Withholding statement” is a description, not an official field ID.

First dates 2015-01-01 (DK/FI/IS) and 2025-01-01 (NO/SE) are supported coverage floors, not original enactment dates; FI-01 is a procedural exception. Version ends are implicit in the next start; no valid_to column exists. Starts are unique per country/code.

### Deductible percentages

NO NODED RC, DK non-deductible/pro-rata/restaurant, FI non-deductible input and IS non-deductible input/RC were checked for their intended purposes. A default 100 on a zero/exempt sales row does not grant input credit.

DK restaurant 25 means 25% of VAT, not a 25% tax rate; use remains conditional. [Restaurant guidance](https://info.skat.dk/data.aspx?oid=2085707). DK 50%/pro-rata rows need qualifying facts/company-specific percentages; this audit does not certify automatic setup enforcement.

SE car leasing 50% is conditional on qualifying use. [2026 guidance](https://www4.skatteverket.se/rattsligvagledning/edition/2026.4/407504.html). Representation's 100% is a ceiling before manual lowering under C-21 to the SEK300/person base cap, not an automatically incorrect rate. [Representation guidance](https://www.skatteverket.se/foretag/moms/kopavarorochtjanster/avdragformomsvidrepresentation.4.15532c7b1442f256baec84b.html?q=ej+avdragsgilla+kostnader). BillTaxResolver permits a lower deductible amount with a reason. Automatic enforcement of all eligibility/caps remains outside this data audit.

PK provincial input/RC default 100 remains **UNVERIFIED** as a legal credit entitlement; placeholders are inactive with blank rates.

### PK dated hints

The [official FBR index](https://www.fbr.gov.pk/withholding-taxes-rate-card/174298/174301) lists TY2026/TY2027. The [TY2027 PDF](https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf) timed out repeatedly. The contract's CHECKED assertions are not independent evidence.

Current rate-version rows 100–101,104–106,108–110 propose hints from 2026-07-01: goods company 5/10, others 5.5/11; certain services 7/14, IT 4/8, media 1.5/3, other 14/28, port 12/24, professional 15/30. **All current hints/effective dates remain UNVERIFIED against the complete official card.** Indexed [TY2026 card](https://download1.fbr.gov.pk/Docs/20258181281745641WHT-RateCard.pdf) text corroborated historical certain-services 6/12 and other-services 15/30 at rows 103/107. Blank rent/contract/generic hints do not mean zero withholding.

Federal PK-WHT-ST correctly uses SALES_TAX base, inactive status and a scenario-qualified 20% fraction; it is not a universal 20% deduction.

### Defaults by company type

No tax-code default matrix by legal/company type exists in the pack CSVs. BooksCreator.kt:73–75,114–142 chooses the tax pack by country and copies t.active for each code. Current active counts: NO23, SE26, DK20, FI18, IS11, PK10; PK22 remain inactive. Legacy active counts: NO12, SE15, PK9.

BooksFacts.kt:72–79 uses OWNED/FRANCHISE for chart relations, not tax eligibility. Customer/supplier default IDs are company-owned records. **UNVERIFIED:** actual configured defaults and appropriateness to registration/activity. No live company data was read. Absence of a legal-form matrix is not itself a statutory defect: VAT registration, transaction and exempt/mixed activities determine treatment. [Skatteetaten exemption/zero-rating](https://www.skatteetaten.no/en/business-and-organisation/vat-and-duties/vat/how-vat-works/difference-between-exemptions-and-exceptions-from-vat/), [Danish mixed-activity deductions](https://skat.dk/erhverv/moms/fradrag-for-moms/saadan-faar-du-momsfradrag).

### Migration effects and snapshot

2026.2 retires platform 2026.1 packs without updating retained company copies (Pack2026Writer:70–72, D-87). New coverage/corrections must not be assumed in older books. V22 overlays labels and marks Nordic templates/matching copies CHECKED; it does not prove legal verification or fix NO-01. V33 corrects PK sides only. Deployment and custom-row preservation require separate verification.

Initial workspace master: 4e02a8a5153c6846ae9ceade7ea8370c6d30f66d. Initial backend: acc99350e5f3dd4f87fc5e57abcd3fbedcc13fa2, with six unrelated dirty payables/receipt paths. At closeout workspace master is 945353fda8035986b0bfc7f55ae10d839fdaad0e; backend dev is 2cc842303f9e9ec6ce4f2020595544dbd8c83b25, clean. Concurrent work advanced both repositories. Comparison confirms all audited pack files, V22/V33 and packs contracts are unchanged; accounts-c.md changed in other sections, while its tax C-13/C-21 requirements remain the audit basis. App dev-app is clean.

Workspace pre-existing changes/untracked paths were left alone: accounts-bc-readiness/brief-sb2a.md, design-principles.md, docs/inbox/erp-lead.md, handoff-implementer.md, accounts-cp-ev-1c/, accounts-flow56-fixes/, codex-statement-layouts/. PROJECT-STATE files were never read. App/backend were read-only throughout.

## Task checkpoint

- **Owner/scope:** Codex leads independent tax-data audit; sole writable deliverable is this report. Country workers were read-only; lead owns integration.
- **Authorization/stage:** user approved audit/report only and optionally this file's commit. Investigation and report complete; no implementation or migration approval inferred.
- **Evidence:** 174 tax-code rows, 142 version rows, 130 legal texts, three manifests, contract/migration review and linked official sources; limitations above.
- **Disposition:** NO-01/02, DK-01, FI-01/02, IS-01, PK-02/04 are recommendations; PK-01 corrected in source by V33 but deployment unverified; PK-03/05 need current legal confirmation.
- **Next:** owning Accounts lead triages recommendations and obtains missing official material/deployment evidence. Backend/app fixes need separate scope approval. No commit or push performed by this audit.

## Row-by-row disposition ledger

Each row was checked for rate/date shape, side/roles, RC pairing, deduction, reporting description and active default. OK* inherits all country/global qualifications above. U-DK = full official standard-code mapping unavailable; U-PK = current-law/scenario/precise-return verification incomplete. A blank rate is shown as null. Versions here are audited resource versions, not company-specific copies.

### 2026.1 tax-codes.csv

| Line | Code | Rate / dated versions | Side | Deductible % | Disposition |
|---:|---|---|---|---:|---|
| 2 | PK-ST-18 | 18 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 3 | PK-ST-RED | null @ not specified | SALES | legacy default | OK*; U-PK |
| 4 | PK-ST-ZERO | 0 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 5 | PK-ST-EXEMPT | 0 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 6 | PK-ST-FURTHER | 4 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 7 | PK-ST-IN | 18 @ 2025-07-01 | PURCHASES | legacy default | OK*; U-PK |
| 8 | PK-PST-PB | 16 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 9 | PK-SST-SD | 15 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 10 | PK-ST-KP | 15 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 11 | PK-ST-BA | 15 @ 2025-07-01 | SALES | legacy default | OK*; U-PK |
| 12 | PK-PST-IN | null @ not specified | PURCHASES | legacy default | OK*; U-PK |
| 13 | PK-ST-RC | null @ not specified | PURCHASES | legacy default | OK*; U-PK |
| 14 | PK-WHT-153-GOODS | null @ not specified | PURCHASES | legacy default | OK*; U-PK |
| 15 | PK-WHT-153-SVC | null @ not specified | PURCHASES | legacy default | OK*; U-PK |
| 16 | PK-WHT-155 | null @ not specified | PURCHASES | legacy default | OK*; U-PK |
| 17 | PK-WHT-ST | 20 @ 2025-07-01 | PURCHASES | legacy default | OK*; U-PK |
| 18 | PK-WHT-BY-CUST | null @ not specified | SALES | legacy default | OK*; U-PK |
| 19 | NO-MVA-25 | 25 @ 2025-01-01 | SALES | legacy default | OK* |
| 20 | NO-MVA-15 | 15 @ 2025-01-01 | SALES | legacy default | NO-02 |
| 21 | NO-MVA-12 | 12 @ 2025-01-01 | SALES | legacy default | OK* |
| 22 | NO-MVA-0 | 0 @ 2025-01-01 | SALES | legacy default | OK* |
| 23 | NO-MVA-EXPORT | 0 @ 2025-01-01 | SALES | legacy default | OK* |
| 24 | NO-MVA-EXEMPT | 0 @ 2025-01-01 | SALES | legacy default | OK* |
| 25 | NO-MVA-IN-25 | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 26 | NO-MVA-IN-15 | 15 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 27 | NO-MVA-IN-12 | 12 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 28 | NO-MVA-RC-SVC | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 29 | NO-MVA-IMPORT-25 | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 30 | NO-MVA-IMPORT-PAID-25 | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 31 | SE-MOMS-25 | 25 @ 2025-01-01 | SALES | legacy default | OK* |
| 32 | SE-MOMS-12 | 12 @ 2025-01-01 | SALES | legacy default | OK* |
| 33 | SE-MOMS-6 | 6 @ 2025-01-01 | SALES | legacy default | OK* |
| 34 | SE-MOMS-EXEMPT | 0 @ 2025-01-01 | SALES | legacy default | OK* |
| 35 | SE-MOMS-EXPORT | 0 @ 2025-01-01 | SALES | legacy default | OK* |
| 36 | SE-MOMS-EU-GOODS | 0 @ 2025-01-01 | SALES | legacy default | OK* |
| 37 | SE-MOMS-EU-SVC | 0 @ 2025-01-01 | SALES | legacy default | OK* |
| 38 | SE-MOMS-IN-25 | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 39 | SE-MOMS-IN-12 | 12 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 40 | SE-MOMS-IN-6 | 6 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 41 | SE-MOMS-RC-EU-GOODS | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 42 | SE-MOMS-RC-EU-SVC | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 43 | SE-MOMS-RC-NONEU-SVC | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 44 | SE-MOMS-RC-DOM | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |
| 45 | SE-MOMS-IMPORT | 25 @ 2025-01-01 | PURCHASES | legacy default | OK* |

### 2026.2 tax-codes.csv

| Line | Code | Rate / dated versions | Side | Deductible % | Disposition |
|---:|---|---|---|---:|---|
| 2 | DK-MOMS-0 | 0.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 3 | DK-MOMS-25 | 25.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 4 | DK-MOMS-EU-GOODS | 0.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 5 | DK-MOMS-EU-GOODS-NR | 0.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 6 | DK-MOMS-EU-SVC | 0.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 7 | DK-MOMS-EU-TRIANG | 0.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 8 | DK-MOMS-EXEMPT | null @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 9 | DK-MOMS-EXPORT | 0.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 10 | DK-MOMS-IMPORT | 25.0000 @ 2015-01-01 | PURCHASES | 100 | OK*; U-DK |
| 11 | DK-MOMS-IN-25 | 25.0000 @ 2015-01-01 | PURCHASES | 100 | OK*; U-DK |
| 12 | DK-MOMS-IN-25-50 | 25.0000 @ 2015-01-01 | PURCHASES | 50 | OK*; U-DK |
| 13 | DK-MOMS-IN-25-NODED | 25.0000 @ 2015-01-01 | PURCHASES | 0 | OK*; U-DK |
| 14 | DK-MOMS-IN-25-PRORATA | 25.0000 @ 2015-01-01 | PURCHASES | 0 | OK*; U-DK |
| 15 | DK-MOMS-IN-25-REP | 25.0000 @ 2015-01-01 | PURCHASES | 25 | OK*; U-DK |
| 16 | DK-MOMS-OUT-OF-SCOPE | null @ 2015-01-01 | SALES | 100 | DK-01; U-DK |
| 17 | DK-MOMS-RC-DOM | 25.0000 @ 2015-01-01 | PURCHASES | 100 | OK*; U-DK |
| 18 | DK-MOMS-RC-DOM-SALE | 0.0000 @ 2015-01-01 | SALES | 100 | OK*; U-DK |
| 19 | DK-MOMS-RC-EU-GOODS | 25.0000 @ 2015-01-01 | PURCHASES | 100 | OK*; U-DK |
| 20 | DK-MOMS-RC-EU-SVC | 25.0000 @ 2015-01-01 | PURCHASES | 100 | OK*; U-DK |
| 21 | DK-MOMS-RC-NONEU-SVC | 25.0000 @ 2015-01-01 | PURCHASES | 100 | OK*; U-DK |
| 22 | FI-ALV-0 | 0.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 23 | FI-ALV-10 | 10.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 24 | FI-ALV-EU-GOODS | 0.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 25 | FI-ALV-EU-SVC | 0.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 26 | FI-ALV-EXEMPT | null @ 2015-01-01 | SALES | 100 | OK* |
| 27 | FI-ALV-EXPORT | 0.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 28 | FI-ALV-IMPORT | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | PURCHASES | 100 | FI-01/FI-02 |
| 29 | FI-ALV-IN-10 | 10.0000 @ 2015-01-01 | PURCHASES | 100 | OK* |
| 30 | FI-ALV-IN-RED | 14.0000 @ 2015-01-01; 13.5000 @ 2026-01-01 | PURCHASES | 100 | OK* |
| 31 | FI-ALV-IN-STD | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | PURCHASES | 100 | OK* |
| 32 | FI-ALV-IN-STD-NODED | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | PURCHASES | 0 | OK* |
| 33 | FI-ALV-RC-CONSTR | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | PURCHASES | 100 | OK* |
| 34 | FI-ALV-RC-CONSTR-SALE | 0.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 35 | FI-ALV-RC-EU-GOODS | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | PURCHASES | 100 | FI-02 |
| 36 | FI-ALV-RC-EU-SVC | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | PURCHASES | 100 | OK* |
| 37 | FI-ALV-RC-NONEU-SVC | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | PURCHASES | 100 | OK* |
| 38 | FI-ALV-RED | 14.0000 @ 2015-01-01; 13.5000 @ 2026-01-01 | SALES | 100 | OK* |
| 39 | FI-ALV-STD | 24.0000 @ 2015-01-01; 25.5000 @ 2024-09-01 | SALES | 100 | OK* |
| 40 | IS-VSK-0 | 0.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 41 | IS-VSK-11 | 11.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 42 | IS-VSK-24 | 24.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 43 | IS-VSK-EXEMPT | null @ 2015-01-01 | SALES | 100 | OK* |
| 44 | IS-VSK-EXPORT | 0.0000 @ 2015-01-01 | SALES | 100 | OK* |
| 45 | IS-VSK-IMPORT-PAID | 24.0000 @ 2015-01-01 | PURCHASES | 100 | IS-01 |
| 46 | IS-VSK-IN-11 | 11.0000 @ 2015-01-01 | PURCHASES | 100 | OK* |
| 47 | IS-VSK-IN-24 | 24.0000 @ 2015-01-01 | PURCHASES | 100 | OK* |
| 48 | IS-VSK-IN-NODED | 24.0000 @ 2015-01-01 | PURCHASES | 0 | OK* |
| 49 | IS-VSK-RC-SVC-IMPORT | 24.0000 @ 2015-01-01 | PURCHASES | 100 | OK* |
| 50 | IS-VSK-RC-SVC-NODED | 24.0000 @ 2015-01-01 | PURCHASES | 0 | OK* |
| 51 | NO-MVA-0 | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 52 | NO-MVA-12 | 12.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 53 | NO-MVA-15 | 15.0000 @ 2025-01-01 | SALES | 100 | NO-02 |
| 54 | NO-MVA-25 | 25.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 55 | NO-MVA-EXEMPT | null @ 2025-01-01 | SALES | 100 | OK* |
| 56 | NO-MVA-EXPORT | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 57 | NO-MVA-IMPORT-15 | 15.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 58 | NO-MVA-IMPORT-15-NODED | 15.0000 @ 2025-01-01 | PURCHASES | 0 | OK* |
| 59 | NO-MVA-IMPORT-25 | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 60 | NO-MVA-IMPORT-25-NODED | 25.0000 @ 2025-01-01 | PURCHASES | 0 | OK* |
| 61 | NO-MVA-IMPORT-EXEMPT | null @ 2025-01-01 | SALES | 100 | NO-01 |
| 62 | NO-MVA-IMPORT-PAID-15 | 15.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 63 | NO-MVA-IMPORT-PAID-25 | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 64 | NO-MVA-IN-12 | 12.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 65 | NO-MVA-IN-15 | 15.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 66 | NO-MVA-IN-25 | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 67 | NO-MVA-RC-DOM | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 68 | NO-MVA-RC-DOM-NODED | 25.0000 @ 2025-01-01 | PURCHASES | 0 | OK* |
| 69 | NO-MVA-RC-DOM-SALE | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 70 | NO-MVA-RC-SVC | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 71 | NO-MVA-RC-SVC-12 | 12.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 72 | NO-MVA-RC-SVC-12-NODED | 12.0000 @ 2025-01-01 | PURCHASES | 0 | OK* |
| 73 | NO-MVA-RC-SVC-NODED | 25.0000 @ 2025-01-01 | PURCHASES | 0 | OK* |
| 74 | PK-PST-IN | null @ 2025-07-01 | PURCHASES | 100 | OK*; U-PK |
| 75 | PK-PST-PB | 16.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 76 | PK-SST-SD | 15.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 77 | PK-ST-18 | 18.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 78 | PK-ST-3RD | 18.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 79 | PK-ST-BA | 15.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 80 | PK-ST-EXEMPT | null @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 81 | PK-ST-FURTHER | 4.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 82 | PK-ST-IN | 18.0000 @ 2025-07-01 | PURCHASES | 100 | OK*; U-PK |
| 83 | PK-ST-KP | 15.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 84 | PK-ST-RC | null @ 2025-07-01 | PURCHASES | 100 | OK*; U-PK |
| 85 | PK-ST-RED | null @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 86 | PK-ST-WHT-BY-CUST | null @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 87 | PK-ST-ZERO | 0.0000 @ 2025-07-01 | SALES | 100 | OK*; U-PK |
| 88 | PK-WHT-153-CONTRACT | null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 89 | PK-WHT-153-GOODS | null @ 2025-07-01 | PURCHASES | 100 | OK*; pending PK-03; U-PK |
| 90 | PK-WHT-153-GOODS-CO | null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 91 | PK-WHT-153-GOODS-OTHER | null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 92 | PK-WHT-153-SVC | null @ 2025-07-01 | PURCHASES | 100 | OK*; pending PK-03; U-PK |
| 93 | PK-WHT-153-SVC-CERTAIN | null @ 2025-07-01; null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 94 | PK-WHT-153-SVC-IT | null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 95 | PK-WHT-153-SVC-MEDIA | null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 96 | PK-WHT-153-SVC-OTHER | null @ 2025-07-01; null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 97 | PK-WHT-153-SVC-PORT | null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 98 | PK-WHT-153-SVC-PROF | null @ 2026-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; pending PK-03; U-PK |
| 99 | PK-WHT-155 | null @ 2025-07-01 | PURCHASES | 100 | OK*; U-PK |
| 100 | PK-WHT-BY-CUST | null @ 2025-07-01 | SALES | 100 | OK*; pending PK-03; U-PK |
| 101 | PK-WHT-PST-BA | null @ 2025-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; PK-04; pending PK-05; U-PK |
| 102 | PK-WHT-PST-KP | null @ 2025-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; PK-04; pending PK-05; U-PK |
| 103 | PK-WHT-PST-PB | null @ 2025-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; PK-04; pending PK-05; U-PK |
| 104 | PK-WHT-PST-SD | null @ 2025-07-01 | SALES | 100 | PK-01 (side corrected V33); PK-02; PK-04; pending PK-05; U-PK |
| 105 | PK-WHT-ST | 20.0000 @ 2025-07-01 | PURCHASES | 100 | OK*; U-PK |
| 106 | SE-MOMS-12 | 12.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 107 | SE-MOMS-25 | 25.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 108 | SE-MOMS-25-RENT | 25.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 109 | SE-MOMS-6 | 6.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 110 | SE-MOMS-EU-GOODS | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 111 | SE-MOMS-EU-SVC | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 112 | SE-MOMS-EU-TRIANG | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 113 | SE-MOMS-EXEMPT | null @ 2025-01-01 | SALES | 100 | OK* |
| 114 | SE-MOMS-EXPORT | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 115 | SE-MOMS-IMPORT | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 116 | SE-MOMS-IMPORT-12 | 12.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 117 | SE-MOMS-IMPORT-6 | 6.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 118 | SE-MOMS-IN-12 | 12.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 119 | SE-MOMS-IN-25 | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 120 | SE-MOMS-IN-25-CAR50 | 25.0000 @ 2025-01-01 | PURCHASES | 50 | OK* |
| 121 | SE-MOMS-IN-25-REP | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 122 | SE-MOMS-IN-6 | 6.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 123 | SE-MOMS-RC-DOM | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 124 | SE-MOMS-RC-DOM-GOODS | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 125 | SE-MOMS-RC-DOM-SALE | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
| 126 | SE-MOMS-RC-EU-GOODS | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 127 | SE-MOMS-RC-EU-GOODS-12 | 12.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 128 | SE-MOMS-RC-EU-GOODS-6 | 6.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 129 | SE-MOMS-RC-EU-SVC | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 130 | SE-MOMS-RC-NONEU-SVC | 25.0000 @ 2025-01-01 | PURCHASES | 100 | OK* |
| 131 | SE-MOMS-SVC-ABROAD | 0.0000 @ 2025-01-01 | SALES | 100 | OK* |
