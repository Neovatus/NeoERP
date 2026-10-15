# Independent review of the NO, DK, FI and IS Accounts pack verifications (2026-10-10)

**Reviewer:** independent read-only reviewer (accountant/auditor view) for the Accounts lead. I did not write the four
verification files and did not edit any of them.
**Date:** 2026-10-10.
**Inputs reviewed:** `NO-accounts-verification.md`, `DK-accounts-verification.md`, `FI-accounts-verification.md`,
`IS-accounts-verification.md` (same folder); `NeoERP-BackEnd/docs/api/accounts-packs-2026-2.md` (§3, §4.1a, §6, §7.3);
`accounts-a5.md` (§ HRP-27 #10); `fixtures/payroll-posting/roles-2026-2.json`; `payroll-v2-p2.md` (lines 212, 287–295,
341–375, Q7); `docs/drafts/accounts/coa/no-ns4102.csv` and `tax-codes.csv`.

**Method.** For every Must-change item and every WRONG or UNCLEAR row I went back to the official source myself and did
not rely on the researcher's quote. Fetches (all 2026-10-10):

- **NO:** `curl` of the Skatteetaten SAF-T GitHub raw files (`General_Ledger_Standard_Accounts_4_character.csv`, last
  commit 2023-02-01 per GitHub API; `Standard_Tax_Codes.csv`; `Copyright Notice GL Standard Accounts.txt`); `curl` of
  Lovdata HTML: bokføringsforskriften kap. 5-1 and § 7-5 ("sist endret" FOR-2026-09-29-1933), bokføringsloven (§ 13 and
  the LOV-2026-06-19-39 amendment page), skatteloven § 6-51, merverdiavgiftsloven kap. 5, 11 and 15.
- **DK:** GitLab API and raw files on `git.erst.dk` (branch `master`): `2026-01-01-Standardkontoplan.json` (722 numbers)
  and `2026-01-01-Momskoder-Bruttoliste.json` ("Valid from date 2025-12-01"); retsinformation PDFs converted to text with
  macOS PDFKit: momsloven LBK 209/2024 (print 2026-10-10), momsbekendtgørelsen BEK 1435/2023, bogføringsloven LOV
  700/2022, LOV 755/2023, årsregnskabsloven LBK 402/2026.
- **FI:** vero.fi PDFs VSRALVKV (v1.10, 27.2.2026) and VSRALVYV converted to text; OmaVero instruction page (päivitetty
  1.1.2026); Finlex HTML (`curl`) for AVL 1501/1993, kirjanpitolaki 1336/1997, OVML 768/2016, Säädöskokoelma 2024/462.
- **IS:** althingi.is HTML for lög 50/1988 (current to L. 34/2026) and lög 145/1994; island.is reglugerð 44/2019;
  WebSearch only to locate RSK 10.24 (old.rsk.is PDF and island.is page, used for the form title and due date only).

**Fetch limits (said, not guessed).** Not re-read by me: NS 4102 (paid); the mva-melding line layout; Skatteetaten AGA
2026 notice (NO 4.13 not re-checked); DK Moms-API spec, Nets FIK spec, Ligningsloven § 8 Y, the virk.dk payroll pages;
FI 4001e instructions (field 309), the Finnish 209 f § and 209 e § item 13 wording, vero.fi payroll rate pages; IS RSK
10.01 box layout, reglugerð 50/1993, lög 3/2006, lög 129/1997. Where a verdict depends on one of these it says
STILL UNCLEAR.

**Licence note used throughout NO.** The Regnskap Norge copyright notice (read 2026-10-10) says, verbatim: "The General
Ledger Standard Accounts may only be used in connection with SAF-T mapping. Other commercial use must be agreed upon
with Regnskap Norge AS." The NO texts below therefore (a) keep NeoERP's own Norwegian and English account names (no
copying of `DescriptionNOR`/`DescriptionENG`), (b) put the standard number only in a `std_account_ref` (SAF-T mapping)
column, and (c) renumber a NeoERP account only where its number **collides** with a standard number that means
something else (a Norwegian user reads the number as that meaning). Accounts whose number is simply absent from the list
keep their number, carry the "NeoERP extension number" text and get a `std_account_ref`.

---

## Summary of verdicts

| Country | Items reviewed (excl. spot checks) | CONFIRMED | CORRECTED | REJECTED | STILL UNCLEAR |
|---|---|---|---|---|---|
| NO | 29 | 12 | 12 | 2 | 3 |
| DK | 25 | 16 | 2 | 1 | 6 |
| FI | 18 | 11 | 2 | 0 | 5 |
| IS | 18 | 5 | 4 | 2 | 7 |
| **Total** | **90** | **44** | **20** | **5** | **21** |

Spot checks of CHECKED rows (5 per country) are at the end of each country table. They found **two false positives**:
DK 2.19 (`DK-MOMS-IN-25-NODED` → K690) and IS IS-18 (the note says a sentence is "not in 20. gr." when it is).

---

## Norway (NO@2026.2 / TAX-NO@2026.2)

| id | finding | verdict | final text for the pack (exact) | source + date read |
|---|---|---|---|---|
| NO-M1 (row 4.11) | `HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED` is 2781, not 2785 (2785 = accrued finansskatt) | CORRECTED (number right; the name must be our own, not Regnskap Norge's) | Row `2781`, name_en "Accrued employer's contribution on accrued holiday pay", name_local "Påløpt arbeidsgiveravgift på feriepenger", LIABILITY / PAYROLL_LIABILITY, CREDIT, control PAYROLL, role `HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED`, `std_account_ref` 2781, source "NeoERP NO chart; SAF-T mapping: standard account 2781 (Skatteetaten saf-t repo, 4-character list, commit 2023-02-01)". Row 2780: name_en "Accrued employer's contribution on accrued wages", name_local "Påløpt arbeidsgiveravgift på påløpt lønn", no role, `std_account_ref` 2780. Row 5410 (not in the list, no clash): keep the number, no role, `std_account_ref` 5405, notes "NeoERP extension number". `EMPLOYER_CONTRIB_EXPENSE` stays 5400 (`std_account_ref` 5400). Packs §6.2a example: "NO 2781". | SAF-T 4-char CSV (2780, 2781, 2785, 5400, 5405 read; 5410 absent), GitHub API commit date 2023-02-01; read 2026-10-10 |
| NO-M2 (row 4.12) | `EMPLOYEE_ADVANCES` is 1572, not 1570 (1570 = travel advances); 1575 clashes (shareholder current account); our 1570 "other receivables" clashes | CORRECTED (numbers right; own names) | Row `1572`, name_en "Salary advances to employees", name_local "Lønnsforskudd til ansatte", ASSET / OTHER_RECEIVABLE, DEBIT, control PAYROLL, role `EMPLOYEE_ADVANCES`, `std_account_ref` 1572. Delete row 1575. Move our 1570 "Other short-term receivables" to `1579` (name_local "Andre kortsiktige fordringer", `std_account_ref` 1579). Optional row `1573` "Other loans to employees" / "Andre lån til ansatte", no role, `std_account_ref` 1573. | SAF-T 4-char CSV rows 1570, 1572, 1573, 1575, 1579; 2026-10-10 |
| NO-M3 (row 4.2) | `HOLIDAY_PAY_EXPENSE` 5020 is not standard; remap to 5092 | CORRECTED (no clash: 5020 is absent from the list, so it stays) | Keep `5020` "Holiday pay" / "Feriepenger" with role `HOLIDAY_PAY_EXPENSE` (same number in all seven charts; P2 already posts 5020). Set `std_account_ref` 5092, notes "NeoERP extension number", source "NeoERP NO chart; SAF-T mapping: standard account 5092". Remove the claim "SAF-T standard account 5020". | SAF-T CSV (5000, 5090, 5092 present; 5020 absent); 2026-10-10 |
| NO-M4 (rows 5.4, 5.5) | VAT accounts clash from 2702 up | CORRECTED (substance right; the researcher missed the import code that already exists) | Output: 2700 high, 2701 middle, **2703** low (was 2702), **2704** services from abroad high (role `SALES_TAX_OUTPUT_RC`), **2705** import of goods high, **2706** import of goods middle, **2707** emission allowances/gold (domestic reverse charge), **2709** services from abroad low. Input: 2710, 2711, **2713** low (was 2712), **2714** services from abroad high (role `SALES_TAX_INPUT_RC`), **2715**, **2716**, **2717**, **2718**. Names in our own words; each row `std_account_ref` = its number. Do not create 2702/2712 (raw fish, not seeded). `tax-codes.csv` accounts: NO-MVA-12 2703 / NO-MVA-IN-12 2713; NO-MVA-RC-SVC 86 and -NODED 87 → 2704 / 2714; NO-MVA-RC-SVC-12 88 and -NODED 89 → 2709 / 2718; **NO-MVA-IMPORT-25 (81) → 2705 / 2715** (today 2703 / 2714); NO-MVA-IMPORT-25-NODED (82) → 2705 output only; NO-MVA-IMPORT-15 (83) → 2706 / 2716; NO-MVA-IMPORT-15-NODED (84) → 2706 output only; NO-MVA-RC-DOM (91) → 2707 / 2717; NO-MVA-RC-DOM-NODED (92) → 2707 output only. | SAF-T CSV rows 2700–2718; `docs/drafts/accounts/coa/tax-codes.csv` (NO-MVA-IMPORT-25 row); 2026-10-10 |
| NO-M5a (row 1.14) | `NO-MVA-IMPORT-0` shown as 84; 84 = import of goods without deduction at the middle rate; zero-rate import is 85 | CONFIRMED | Packs §7.3 NO-1: replace `NO-MVA-IMPORT-0` (84) by `NO-MVA-IMPORT-15-NODED` (84), kind REVERSE_CHARGE, rate 15, `deductible_percent` 0, name_en "Import of goods without deduction, middle rate", output account 2706. `NO-MVA-IMPORT-EXEMPT` keeps 85. | `Standard_Tax_Codes.csv` rows 84, 85; 2026-10-10 |
| NO-M5b (row 1.18) | 91 / 92 are emission allowances or gold only, not general domestic reverse charge | CONFIRMED | Codes keep their ids. `NO-MVA-RC-DOM` (91): name_en "Purchase of emission allowances or gold, buyer liable, deductible", name_local "Kjøp av klimakvoter eller gull med fradragsrett". `NO-MVA-RC-DOM-NODED` (92): "… not deductible" / "… uten fradragsrett". Help text: "Only for emission allowances (merverdiavgiftsloven § 11-1 second paragraph) and gold of at least 325/1000 fineness (third paragraph). A business buyer that is not VAT-registered pays only when its purchases in a term exceed NOK 2,000 excluding VAT." | `Standard_Tax_Codes.csv` 91, 92; Lovdata mval § 11-1 (read 2026-10-10) |
| NO-M5c (row 3.2) | Seller invoice text for 51 missing | CONFIRMED | `NO-MVA-RC-DOM-SALE` (51) legal text: «Omvendt avgiftsplikt – Merverdiavgift ikke beregnet» (bokføringsforskriften § 5-1-1 nr. 7). Rule: buyer's organisation number is always required on this document (§ 5-1-2 first paragraph); "MVA" follows it if the buyer is VAT-registered. Help text: "Use only for sales of emission allowances or gold (≥ 325/1000) to a business buyer." | Lovdata bokføringsforskriften §§ 5-1-1, 5-1-2 ("sist endret" FOR-2026-09-29-1933); 2026-10-10 |
| NO-M6a (row 5.2/5.4: 1239, 1249, 1289) | Accumulated-depreciation rows sit on standard asset numbers | CONFIRMED | Move: 1239 → **1234**, 1249 → **1248**, 1289 → **1288** (all absent from the list), notes "NeoERP extension number", `std_account_ref` = the asset account they reduce (1230, 1237, 1280). 1089, 1109, 1209, 1259 are absent from the list: keep numbers, add the extension notes and `std_account_ref` 1000/1100/1200/1250. | SAF-T CSV 12xx rows; 2026-10-10 |
| NO-M6b (1240) | Listed as accumulated depreciation | REJECTED (for 1240 only) | Our 1240 is "Trucks and vans" (an asset), not depreciation. It clashes in meaning with std 1240 *Traktorer*: rename nothing, set `std_account_ref` 1237 (lorries) and note "vans: 1235/1236". | `no-ns4102.csv` row 1240; SAF-T CSV 1235–1242; 2026-10-10 |
| NO-M6c (1490) | 1490 = biological assets in the standard | CONFIRMED | Move "Provision for obsolete inventory" to **1498**, extension notes, `std_account_ref` 1460. | SAF-T CSV 14xx; 2026-10-10 |
| NO-M6d (1960) | `POS_CASH_CLEARING` 1960 = bank deposits abroad in the standard | CONFIRMED | Move to **1915** "Till takings awaiting deposit" / "Dagsoppgjør under innskudd", control BANK, role `POS_CASH_CLEARING`, extension notes, `std_account_ref` 1900. | SAF-T CSV 19xx (1915 absent); 2026-10-10 |
| NO-M6e (row 4.10, 2945) | `PENSION_PAYABLE` 2945 = paid holiday pay in the standard | CONFIRMED | Move to **2946** "Pension contributions payable (OTP)" / "Skyldig pensjonsinnskudd (OTP)", role `PENSION_PAYABLE`, extension notes, `std_account_ref` 2999. Packs §6.3 NO cell: "2946 OTP". | SAF-T CSV 29xx; 2026-10-10 |
| NO-M6f (2965 / 2970) | GRNI on std "prepaid income"; our prepaid income on std "future guarantee" | CONFIRMED | Deferred income → **2965** ("Deferred income" / "Forskuddsbetalt inntekt", `std_account_ref` 2965). GRNI → **2961** ("Goods received not invoiced" / "Varemottak, ikke fakturert", role `GRNI`, extension notes, `std_account_ref` 2960). Delete our 2970. | SAF-T CSV 2960–2975; 2026-10-10 |
| NO-M6g (3020/3030/3040) | Sales accounts by rate clash | CONFIRMED | 3000 goods high (role `SALES_REVENUE_DEFAULT`), **3020** services high (role `SERVICE_REVENUE_DEFAULT`), **3030** goods middle, **3050** services low; delete our 3040. Own names. | SAF-T CSV 3000–3059; 2026-10-10 |
| NO-M6h (3080 / 3090) | 3080 not standard; 3090 = re-invoicing | CORRECTED | 3080 has no clash: keep `DISCOUNT_GIVEN` on 3080, extension notes, `std_account_ref` 3081. `SALES_RETURNS` moves from 3090 to **3095** (absent), extension notes, `std_account_ref` 3087. (Do not use 3088: it is a middle-rate account.) | SAF-T CSV 3081–3092; 2026-10-10 |
| NO-M6i (3710, 3720, 3730) | `ROYALTY_INCOME` 3710 = commission income exempt | CORRECTED (researcher gave no target) | `ROYALTY_INCOME` → **3715** (absent), extension notes, `std_account_ref` 3900. 3720 and 3730 (no clash): keep, `std_account_ref` 3900. | SAF-T CSV 37xx, 39xx; 2026-10-10 |
| NO-M6j (4380) | `DISCOUNT_RECEIVED` 4380 = import VAT base memo account | CONFIRMED | Move to **4370** (absent) "Purchase discounts received" / "Innkjøpsrabatter", extension notes, `std_account_ref` 4371. | SAF-T CSV 4371–4387; 2026-10-10 |
| NO-M6k (7610) | `FRANCHISE_FEE_EXPENSE` 7610 = own patent cost | CORRECTED (better target exists) | Move to **7605** "Franchise fees (royalties)" / "Franchiseavgifter (royalty)", `std_account_ref` 7605 (same meaning: royalties). | SAF-T CSV 7600–7620; 2026-10-10 |
| NO-M6l (7795 / 7796) | Researcher: 7795 → 7740; 7796 `CASH_OVER_SHORT` → 1909 | 7795: CORRECTED; 7796 → 1909: REJECTED | 7795 and 7796 are absent from the list (no clash); keep both numbers. 7795 `ROUNDING`: `std_account_ref` 7740. 7796 `CASH_OVER_SHORT` is an EXPENSE role (packs §6.2b); 1909 is a class-1 balance account and cannot carry it. Set `std_account_ref` 7798 (proposal). | SAF-T CSV 1909, 7740, 7798; packs §6.2b; 2026-10-10 |
| NO-M6m (row 5.2 list) | 28 rows claim "SAF-T standard account N" though N is absent | CORRECTED | Agreed for the 28 rows; add: **3800** (gain on disposal) has a standard counterpart, **3880** *Gevinst ved avgang…* (the researcher said "none"); `std_account_ref` 3880. Generator rule: the `source` column never says "SAF-T standard account N"; it says "NeoERP NO chart (NS 4102 structure)" and the mapping goes to `std_account_ref`. | SAF-T CSV 3880; 2026-10-10 |
| NO-M6n (2610, 2099) | 2610 name; 2099 name | CONFIRMED | 2610 name_local "Utleggstrekk" (the legal term). 2099 role `CURRENT_YEAR_RESULT`, name_en "Result for the year (undistributed)", `std_account_ref` 2099. | SAF-T CSV 2099, 2610, 8800; 2026-10-10 |
| NO-M7 (rows 3.5, 3.6) | Retention 5 years; "kept in Norway" already in § 13; 2026 act adds original e-invoice format | CORRECTED (one missing rule) | `NO.RETENTION.BOOKKEEPING` = 5 years from the end of the fiscal year, `check_state` CHECKED. Text: "Bokføringsloven § 13 second paragraph: items 1–4 (annual accounts, specifications, documentation of booked information, auditor letters) five years after the fiscal year end; items 5–8 (agreements, correspondence, packing notes, price lists) three years and six months. Kept in Norway; electronic material may be kept in another EEA state, the UK or Switzerland if it can be read and printed from Norway and the skattekontor is told in writing what is kept where (bokføringsforskriften § 7-5). From 2027-01-01 an e-invoice is kept in its original format (lov 19. juni 2026 nr. 39)." | Lovdata bokføringsloven § 13 ("sist endret" LOV-2020-11-20-128) and LOV-2026-06-19-39 page (§ 13 new text; i kraft 1 jan 2027 per res. 19 juni 2026 nr. 1154); bokføringsforskriften § 7-5; 2026-10-10 |
| NO 1.2 | "Drink" in the 15 % help text UNCLEAR | CORRECTED (now resolved) | NO-MVA-15 help: "Food and drink for human consumption (merverdiavgiftsloven § 5-2). Not alcoholic drinks, tobacco, medicines or tap water from a waterworks; food sold as part of a serving service is 25 %." | Lovdata mval § 5-2; 2026-10-10 |
| NO 1.6 | Code 6 label "Outside the VAT Act" | CONFIRMED | name_local "Omsetning og uttak utenfor merverdiavgiftsloven (unntatt)", name_en "Sales outside the scope of or exempt from the VAT Act (code 6)". | `Standard_Tax_Codes.csv` row 6; 2026-10-10 |
| NO 3.4 | Cash limit wording "above 10,000" | CORRECTED (one more rule) | `cash_payment_warn_limit` NOK 10,000: "Warn when payments not made through a bank or licensed payment provider total NOK 10,000 or more for one delivery, service or contract; for running or periodic payments, add up the payments deducted in the same year (skatteloven § 6-51 first paragraph)." | Lovdata skatteloven § 6-51; 2026-10-10 |
| NO 4.4 | `PENSION_EXPENSE` 5420 is "pension paid over operations"; OTP is 5950 | CORRECTED | Keep 5420 as the role account (no clash in meaning for the posting role; it is our "pension cost" account) but set `std_account_ref` 5950 when the company's pension is OTP and note "5420 standard meaning: pension paid directly by the business". Lead may instead move the role to 5950. | SAF-T CSV 5420, 5950; 2026-10-10 |
| NO 1.19, 1.21, 2.1–2.3, 2.5, 3.3 | Return line numbers, frequencies, other domestic RC, cash sales | STILL UNCLEAR | No pack text. To close: Skatteetaten "mva-meldingen – kodeliste/informasjonsmodell" (line layout); skatteforvaltningsforskriften § 8-3-10 (terms); bokføringsforskriften §§ 5-3 (cash sales, now readable on Lovdata kap. 5-3). 1.21: mval § 11-1 lists only allowances and gold (read); keep "no other domestic RC" as CHECKED for 2026.2. | Lovdata kap. 5 headings (§§ 5-3-1–5-3-15 exist); 2026-10-10 |
| NO 4.14 | AGA on feriepenger timing | STILL UNCLEAR | P2 help text: "Accrual is accounting practice (2781). The A-melding amount follows payment." Read folketrygdloven § 23-2 before CHECKED. | not re-read |
| NO 5.6 / 5.7 | NS 4102 group names; licence | STILL UNCLEAR (5.6) / decision (5.7) | See Decisions D-NO-1. | copyright notice; 2026-10-10 |
| NO spot 1 | 1.5 codes 3 / 31 / 33 | CHECKED holds | — | `Standard_Tax_Codes.csv` |
| NO spot 2 | 1.11 code 81, 1.15 code 85 | CHECKED holds | — | same |
| NO spot 3 | 4.5 2600, 4.7 2770, 4.8 2930, 4.9 2940 | CHECKED holds | — | SAF-T CSV |
| NO spot 4 | 5.3 role accounts (1500, 1580, 1900, 1920, 2400, 2500, 2740, 4390, 7770, 7830, 8300) | CHECKED holds | — | SAF-T CSV |
| NO spot 5 | 2.4 tax point § 15-9 | CHECKED holds | — | Lovdata mval § 15-9 |

---

## Denmark (DK@2026.2 / TAX-DK@2026.2)

| id | finding | verdict | final text for the pack (exact) | source + date read |
|---|---|---|---|---|
| DK-M1 | Every DK role account carries a `std_account_ref` from the 2026-01-01 standard chart (§4.2 table) | CONFIRMED (all numbers and names in §4.2 re-checked in the JSON) except the two rows below | Use the §4.2 table as written, with DK-4.5o and DK-2.19 corrected below. Source text per row: "Erhvervsstyrelsen standardkontoplan 2026-01-01, konto nnnn". | `2026-01-01-Standardkontoplan.json` (git.erst.dk, master); 2026-10-10 |
| DK-4.5o | 2500 `INCOME_TAX_PAYABLE` → 7250 *Skyldig selskabsskat (langfristet)* | CORRECTED | `std_account_ref` **8040** *Øvrig anden gæld* (kortfristet; group 7581 "Anden gæld, herunder skyldige skatter …"). Note: "The standard has no short-term company-tax payable; 7250 is long-term and would misstate the balance sheet. A refund position maps to 6315." | standard JSON groups 7191 and 7581; 2026-10-10 |
| DK-4.4 | 2090 has no standard number | CONFIRMED (no number exists) | 2090 `CURRENT_YEAR_RESULT`: `std_account_ref` empty, notes "Presentation account; no standard number in classes B–D (6916 is class A only); the year's result is disposed to 6940." H-DK must skip it (see Decision D-DK-2). | standard JSON 6916, 6935, 6940; 2026-10-10 |
| DK-M2a | RC-EU-GOODS source § 46 stk. 4 | CONFIRMED | Source: "ML § 11, § 46 stk. 4; momsbekendtgørelsen § 76 stk. 5, § 79 stk. 2". | momsloven § 46 (print 2026-10-10) |
| DK-M2b | RC-DOM and RC-DOM-SALE: § 46 stk. 1 nr. 4 and 6–12; buyer tax to Salgsmoms | CONFIRMED | `DK-MOMS-RC-DOM` source "ML § 46 stk. 1 nr. 4 og 6–12; momsbekendtgørelsen § 76 stk. 4"; return "tax *Salgsmoms*, deduction *Købsmoms*, no Rubrik"; output account role `SALES_TAX_OUTPUT` (2700). `DK-MOMS-RC-DOM-SALE` source "ML § 46 stk. 1 nr. 4 og 6–12, stk. 2", Rubrik C. | momsloven § 46; BEK 1435 § 76 stk. 4; Momskoder K660 ("Salgsmoms (udgående) og købsmoms"); 2026-10-10 |
| DK-M2c | IN-25-REP is restaurant only | CONFIRMED | Source "ML § 42 stk. 2"; help "25 % of the VAT on restaurant services (restaurationsydelser) of a strictly business nature. Other entertainment, representation, gifts and hotel stays: use DK-MOMS-IN-25-NODED." Chart 7720 name "Restaurationsydelser (25 % fradrag for moms)". | momsloven § 42 stk. 1 nr. 5, stk. 2; K070 vejledning; 2026-10-10 |
| DK-M2d | DK-MOMS-0 § 34 stk. 1 nr. 18; EXPORT nr. 5 | CONFIRMED | DK-MOMS-0 source "ML § 34 stk. 1 nr. 5–21 (e.g. newspapers nr. 18)"; DK-MOMS-EXPORT source "ML § 34 stk. 1 nr. 5; momsbekendtgørelsen § 76 stk. 11", help "Goods to places outside the EU and services with place of supply outside Denmark (ML §§ 14–21 d) both go in Rubrik C." | momsloven § 34 stk. 1 nr. 18; Momskoder S41/S42; 2026-10-10 |
| DK-M3 (4.5q/4.5r) | Split RC output: 2705 goods/import (std 7700), new 2706 services (std 7720) | CONFIRMED | 2705 `SALES_TAX_OUTPUT_RC` "Moms af varekøb i udlandet" `std_account_ref` 7700; new **2706** "Moms af ydelseskøb i udlandet med omvendt betalingspligt", LIABILITY, no role, `std_account_ref` 7720; tax codes `DK-MOMS-RC-EU-SVC` and `DK-MOMS-RC-NONEU-SVC` output account 2706 (per-code account, as NO does in `tax-codes.csv`). | BEK 1435 § 76 stk. 1 nr. 3–4 (two separate special accounts); standard JSON 7700, 7720; 2026-10-10 |
| DK-M4 (5.2) | Simplified invoice is § 66, DKK 3,000 | CONFIRMED | `simplified_invoice_limit` DKK 3,000 per supply, source "momsbekendtgørelsen § 66 stk. 1"; rules text as in the DK file summary item 4. | BEK 1435 § 66; 2026-10-10 |
| DK-M5 (5.3/5.4) | Legal texts | CONFIRMED | da: «omvendt betalingspligt, køber afregner momsen»; en: «reverse charge, buyer settles the VAT» (§ 59 nr. 3, § 60); plus buyer CVR/SE no. on § 59 invoices; EU texts per § 62. | BEK 1435 §§ 59, 60; 2026-10-10 |
| DK-M6 (1.3, 1.4, 1.5) | Retention 5 years; "was § 10 before lov 755/2023" wrong; add 10-year property and 1-year till-roll rules | CONFIRMED | `DK.RETENTION.BOOKKEEPING` 5 years from the end of the fiscal year, CHECKED, source "Bogføringsloven (LOV 700/2022) § 12 stk. 1". Overrides: class `PROPERTY` 10 years after the acquisition or building work (momsbekendtgørelsen § 92 stk. 3); retail till rolls 1 year from signing the annual accounts (§ 12 stk. 2; BEK 1435 § 92 stk. 1). Delete "(was § 10 before lov 755/2023)". | LOV 700/2022 § 12; LOV 755/2023 § 3 nr. 3 (skattekontrolloven § 6 reference change); BEK 1435 § 92; 2026-10-10 |
| DK-M7 (3.5) | Return amounts in whole kroner | CONFIRMED (law); rounding mode is a lead decision | E `DK-MOMS` writer: "Each amount on the return is in whole kroner; øre are disregarded (momsloven § 57 stk. 1)." Recommended mode: truncation toward zero per box (see D-DK-1). | momsloven § 57 stk. 1; 2026-10-10 |
| DK-M8 (3.6) | EU sales list monthly for goods and services; quarterly by permission; DKK 400,000; due the 25th | CONFIRMED (§ 99 read; § 100 not re-read) | `eu_sales_list_frequency_default` MONTHLY, `eu_sales_list_services_frequency_default` MONTHLY; guidance "Quarterly only with Skatteforvaltningen's permission: goods if not on monthly VAT periods and VAT-free EU goods supplies ≤ DKK 400,000 in the quarter and each of the four before (BEK 1435 § 99 stk. 4–5); services if not on monthly VAT periods (stk. 6)." | BEK 1435 § 99; 2026-10-10 |
| DK-M9 (2.18/2.19) | Add `std_vat_code_ref`; mapping of 15 codes | CORRECTED (one wrong mapping) | Mapping as the DK file 2.19 **except** `DK-MOMS-IN-25-NODED` → **K030 only** (K030 = purchases with no deduction right; K690 is domestic reverse charge without deduction and belongs to a future `DK-MOMS-RC-DOM-NODED`). Add for launch S25, S81, K040, K110 as the file proposes. | Momskoder-Bruttoliste ("Valid from date 2025-12-01"), K030 and K690 vejledning; 2026-10-10 |
| DK-M10 (4.2, 4.3) | P&L is skema 3/4; balance sheet skema 1/2; no "Resultat af primær drift" line | CONFIRMED | `PL_DK_GROSS` source "ÅRL § 32; bilag 2 skema 3 (artsopdelt) poster 1–5 → Bruttofortjeneste/Bruttotab". `BS_NORDIC` DK source "ÅRL bilag 2 skema 1 (kontoform) / skema 2 (kontoform, lang- og kortfristet)". Subtotal label "Driftsresultat (subtotal, not a statutory line)". | ÅRL LBK 402/2026 § 32 and bilag 2 headings; 2026-10-10 |
| DK-M11 (4.5e/4.14) | EMPLOYEE_ADVANCES DK 1570, std 6330 | CONFIRMED | As the DK file summary item 11 (1570 "Forskud til medarbejdere", std 6330). | standard JSON group 6301 → 6330; 2026-10-10 |
| DK-M12 (4.1p–4.12) | Payroll std mapping | CONFIRMED (numbers) / decision for ATP expense | 2600 → 7920, 2601 → 7940, 2770 → 8010, 2771 → 7960, 2772 → 7900, 2910 → 8000, 2930 → 7860, 2940 → 8030, 5000 → 2845, 5020 → 2860, 5420 → 2910, 5400 → 2930 (see D-DK-3 for employer ATP 2898). | standard JSON 2842–2947, 7581 group; 2026-10-10 |
| DK-M13 (1.6–1.9) | Registration and SAF-T dates | CONFIRMED (not re-fetched: BEK 1342/2023, 297/2025, 811/2026; taken from the researcher's citations, which match the bogføringsloven text I read) | Write the dates in the pack docs as in the DK file summary item 13. | LOV 700/2022 (§§ 12, 16 read); 2026-10-10 |
| DK 2.1 | 25 % start date 1992-01-01 not in the law | STILL UNCLEAR | Set version 1 `valid_from` to the pack's earliest supported date; do not claim 1992. To close: momsloven 1967/1992 amendment history. | momsloven § 33, § 84 |
| DK 3.8 | Moms-API | STILL UNCLEAR | Read the Skattestyrelsen moms-API specification before planning the writer. | — |
| DK 3.10 | `late_document_rule` NEXT_RETURN | STILL UNCLEAR → default CORRECT_EARLIER | `late_document_rule` CORRECT_EARLIER until Skattestyrelsen guidance on carrying errors forward is read. | — |
| DK 4.9 | 2945 frozen holiday pay | STILL UNCLEAR | Remove 2945 from the DK seed chart (a company founded after 2020 cannot owe it). | — |
| DK 4.5z / 4.11 | COGS/PPV and other deductions mapping | STILL UNCLEAR (proposal only) | Keep proposals 1610/1770 and 8040, marked "proposal, H-DK to confirm". | standard JSON |
| DK 6.1 / 6.2 / 6.4 | FIK lengths, 50-øre rounding, language | STILL UNCLEAR | Not checked; Nets/Finans Danmark FIK spec and a current rounding rule are needed. | — |
| DK 2.19 (spot) | CHECKED row "mapping verified against the file" | **REJECTED** (false positive) | See DK-M9: IN-25-NODED is K030, not K030/K690. | Momskoder vejledning |
| DK spot 2 | 1.1 retention § 12 stk. 1 | CHECKED holds | — | LOV 700/2022 |
| DK spot 3 | 2.7 RC-DOM-SALE Rubrik C, § 46 stk. 2 | CHECKED holds | — | momsloven § 46 |
| DK spot 4 | 4.5aa 1910, 4.5ac 2720, 4.5ab 2390 | CHECKED holds | — | standard JSON |
| DK spot 5 | 3.13 bad-debt 80 % (§ 27 stk. 6) | CHECKED holds (§ 27 located; stk. 6 wording taken from file) | — | momsloven § 27 |

---

## Finland (FI@2026.2 / TAX-FI@2026.2)

| id | finding | verdict | final text for the pack (exact) | source + date read |
|---|---|---|---|---|
| FI-M1 (1.2) | Amending act is laki 462/2024, not 1061/2024 | CONFIRMED | Source: "AVL 84 § (laki 462/2024, voimaan 2024-09-01)". | Finlex Säädöskokoelma 2024/462 (title "Laki arvonlisäverolain 84 ja 85 b §:n muuttamisesta"); 2026-10-10 |
| FI-M2 (1.4, 1.5, 2.2) | 14 % → 13.5 % is one code with two rate versions | CONFIRMED | Code `FI-ALV-RED`, nameLocal "Alennettu verokanta", versions 14.0000 (to 2025-12-31) and 13.5000 from 2026-01-01, return field 302; input `FI-ALV-IN-RED` the same. Delete `FI-ALV-13-5` and `FI-ALV-IN-13-5`. Version 1 `valid_from`: the pack's earliest date (see FI 1.3). D-89 example: replace "FI food 14 → 13.5 %" with "FI 2025-01-01 move of books, transport, accommodation, culture, sport from 10 % to 14 % (box 303 → 302)". Expected-rates rows: `FI,FI-ALV-RED,1,14.0000,<earliest>` and `FI,FI-ALV-RED,2,13.5000,2026-01-01`. | VSRALVKV v1.10 (302 "Tax on domestic sales at 14% or 13.5%", v1.9 3.12.2025); Finlex AVL 85 § intro (22.12.2025/1358); 2026-10-10 |
| FI-M3 (1.6, 1.7) | Scope of 13.5 % and 10 % | CONFIRMED | `FI-ALV-RED` help: as the FI file Must 3 text. `FI-ALV-10` help: "From 2026-01-01 only newspapers and periodicals, physical or electronic, not mainly advertising and not mainly video or music (AVL 85 a §)." | Finlex AVL 85 § items incl. 13 (Yleisradio, 19.12.2024/921), 85 a §; 2026-10-10 |
| FI-M4 (1.13) | Non-EU services: no base box; tax in 301/302/303, deduction 307 | CONFIRMED | `FI-ALV-RC-NONEU-SVC` return: "output tax → 301 (by rate: 302/303), deduction → 307, base → none". | OmaVero page (päivitetty 1.1.2026), quote "EU:n ulkopuolelle sijoittautuneelta … ei ilmoiteta veron perustetta"; 2026-10-10 |
| FI-M5 | E FI-KVI box list 301–320 and 056; 315–317, 336, 337 not seeded | CONFIRMED | Box set: 056, 301, 302, 303, 304, 305, 306, 307, 308 (= 301+302+303+304+305+306+318 − 307), 309, 310, 311, 312, 313, 314, 318, 319, 320; corrections reason 332–335. | VSRALVKV v1.10 §7 list and check #1149; 2026-10-10 |
| FI-M6 | Channel label "Ilmoitin.fi file (VSRALVKV)"; manual = OmaVero | CONFIRMED | As the FI file Must 6. | VSRALVKV §2 (mentions Ilmoitin.fi and form 4001e); 2026-10-10 |
| FI-M7 (2.20) | Yhteenvetoilmoitus monthly only, 20th | CONFIRMED | FI: `eu_sales_list_frequency_default` MONTHLY and `eu_sales_list_services_frequency_default` MONTHLY, no QUARTERLY option; due "20th of the following month (AVL 162 §)". | Finlex AVL 162 § ("kultakin kalenterikuukaudelta … 20 päivänä"); 2026-10-10 |
| FI-M8 (5.3) | "Sotu" is the old name; use työnantajan sairausvakuutusmaksu | CONFIRMED (name; 1.91 % rate not re-read) | 2770 "Työnantajan sairausvakuutusmaksuvelka"; 5400 "Työnantajan sairausvakuutus- ja työttömyysvakuutusmaksut"; packs §6.1 D-85 text "FI työnantajan sairausvakuutusmaksu"; P2 "sotu" → "sairausvakuutusmaksu". | Finlex OVML 28 § wording "työnantajan sairausvakuutusmaksuista"; 2026-10-10 |
| FI-M9 (5.10) | FI 2941 for `HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED` | CONFIRMED (proposal; number is NeoERP's) | As the FI file Must 9. | kirjanpitolaki 4:6 (not re-read; standard accrual rule) |
| FI-M10 (5.11) | FI 1570 for `EMPLOYEE_ADVANCES` | CONFIRMED (proposal) | As the FI file Must 10. | — |
| FI-M11 (4.1, 4.2) | Retention in two classes; payroll books 10 years | CONFIRMED | Replace `FI.RETENTION.BOOKKEEPING` by `FI.RETENTION.LEDGERS` = 10 years from the end of the financial year (financial statements, annual report, ledgers incl. payroll book, chart of accounts, list of ledgers; kirjanpitolaki 2:10 § 1 mom.; OVML 28 §) and `FI.RETENTION.VOUCHERS` = 6 years from the end of the calendar year in which the financial year ended (vouchers, transaction correspondence, other material; 2:10 § 2 mom.), both CHECKED; note "kept so that it can be inspected from Finland (2:9 §)". `ATTACHMENT` uses VOUCHERS; `LEDGER_EXPORT` and payroll register use LEDGERS. | Finlex kirjanpitolaki 2:10 § (text "vähintään 10 vuotta tilikauden päättymisestä" / "vähintään kuusi vuotta sen vuoden lopusta…"); OVML 28 § ("palkkakirjanpitonsa kymmenen vuotta tilikauden päättymisestä"); 2026-10-10 |
| FI 1.8 | Chapter citations ("10 luku", "4 luku") | CORRECTED | Cite sections: FI-ALV-0 "AVL 209 b § list (e.g. 70 §, 72 a–72 e §)"; FI-ALV-EXEMPT "AVL exempt sections (e.g. 34–60 §); not reported". | Finlex AVL; 2026-10-10 |
| FI 3.4 | Reverse-charge phrase | CORRECTED (now from the law) | Invoice text "Käännetty verovelvollisuus" (AVL 209 e § 1 mom. 12 kohta: "merkintä käännetty verovelvollisuus"); en "Reverse charge". Self-billing "Itselaskutus" stays from vero.fi guidance. | Finlex AVL 209 e § item 12; 2026-10-10 |
| FI 1.3 | 24 % start 2013-01-01 | STILL UNCLEAR | Version 1 `valid_from` = pack earliest date; read laki 706/2012 to close. | — |
| FI 2.10 | 309 includes 311/312? | STILL UNCLEAR | Interim rule as the FI file; read form 4001e instructions before the golden file. | VSRALVKV (field list only) |
| FI 3.3 | EUR 400 incl. or excl. VAT | STILL UNCLEAR | Store incl. VAT as interim; read Finnish 209 f §. | — |
| FI 3.9 | RF reference check | STILL UNCLEAR | Keep `verify`. | — |
| FI 5.1 / 5.7 / 5.8 | No official chart; 2910/5420/2930/2610 | STILL UNCLEAR (nothing to check against) | Source column "NeoERP skeleton; statement line per kirjanpitoasetus 1 luku 6 §". | — |
| FI spot 1 | 1.1 25.5 % (84 §) | CHECKED holds | — | Finlex AVL 84 § |
| FI spot 2 | 2.9 308 formula | CHECKED holds | — | VSRALVKV #1149 |
| FI spot 3 | 2.13 056 no activity | CHECKED holds | — | VSRALVKV §2 |
| FI spot 4 | 2.18 due dates (12th of 2nd month; yearly end of Feb) | CHECKED holds | — | VSRALVKV §2 |
| FI spot 5 | 1.16 13.5 % on acquisitions and imports | CHECKED holds | — | AVL 85 § intro ("yhteisöhankinnasta … maahantuonnista") |

(Should-change items were not scored; FI 5.12/2085 rename and the P&L order were not re-checked. NO-M6l is counted as CORRECTED; its 1909 part is a rejection, listed in the summary of rejections.)

---

## Iceland (IS@2026.2 / TAX-IS@2026.2)

| id | finding | verdict | final text for the pack (exact) | source + date read |
|---|---|---|---|---|
| IS-M1 (IS-15) | Invoice content source is lög 50/1988 20. gr. | CONFIRMED | Source "lög um virðisaukaskatt nr. 50/1988, 20. gr.; reglugerð nr. 50/1993"; REQUIRED fields: útgáfudagur; nafn og kennitala kaupanda og seljanda; skráningarnúmer seljanda; tegund sölu; magn, einingarverð og heildarverð; whether VSK is included; the VSK amount (or "VSK is 19.35 % of the total" / "9.91 %" at 11 %, allowed except to a VSK-registered buyer, who always gets the amount); continuous pre-numbered series; credit note (*kreditreikningur*) for returns; prepayment receipt. | althingi.is lög 50/1988 20. gr. (current to L. 34/2026); 2026-10-10 |
| IS-M2 (IS-16) | Simplified invoice | CORRECTED (statutory basis exists) | "lög 50/1988 21. gr.: on cash sales by retailers and similar no invoice under 20. gr. is required unless the buyer is VSK-registered; reglugerð 50/1993 arts. 4 and 8 for the cash-register slip. ISK 3,000 limit: *(verify)*, read from a possibly outdated reglugerð text." | lög 50/1988 21. gr.; 2026-10-10 |
| IS-M3 (IS-8) | IS-VSK-RC-SVC needs the ISK 10,000 threshold, a separate report RSK 10.24 | CORRECTED (important) | Art. 35: (1) a business doing **VSK-exempt** activity pays VSK on services bought from abroad; (2) a **VSK-registered** buyer pays only **to the extent the VSK would not be deductible**, and always when the service is linked to importing goods; (3) the **ISK 10,000 per period threshold applies only to buyers outside (1) and (2)** (not to NeoERP companies); (4) no duty if the foreign seller is on the Icelandic VSK register; (6) reported on a **separate report (RSK 10.24)**, due the 5th day of the second month after the period, with payment. Pack text: replace `IS-VSK-RC-SVC` by `IS-VSK-RC-SVC-NODED` (24 %, `deductiblePercent` 0, output to `SALES_TAX_OUTPUT_RC`, report "RSK 10.24, not the VSK return") and `IS-VSK-RC-SVC-IMPORT` (24 %, services linked to an import of goods, output and deductible input, RSK 10.24). A fully deductible foreign service for a registered buyer gets no reverse-charge code (purchase without VSK). | lög 50/1988 35. gr. 1.–6. mgr.; RSK 10.24 title and due date (old.rsk.is form PDF, island.is page, via search); 2026-10-10 |
| IS-M4 (IS-4, IS-6) | Label "undanþegin velta…" wrong for 12. gr. | CONFIRMED | Box text "velta skv. 12. gr. (telst ekki til skattskyldrar veltu)", kind ZERO. Deduction: 16. gr. 1. mgr. allows input VSK on inputs that relate to "sölu skattaðila á vörum og skattskyldri þjónustu"; 12. gr. sales stay ZERO with deduction. Note the new condition: input VSK is deductible only if the seller was on the VSK register at the time (16. gr. 1. mgr. 2. málsl.). | lög 50/1988 12., 15., 16. gr.; 2026-10-10 |
| IS-M5a (IS-32) | IS 2941 accrued payroll costs on holiday pay | CONFIRMED (proposal) | As the IS file Must 5, `use` OPTIONAL. | lög 113/1990 7. gr. (not re-read) |
| IS-M5b (IS-33) | IS 1570 employee advances | CONFIRMED (proposal) | As the IS file Must 5. | — |
| IS-M6 (IS-22) | "Reg. 252/2018" → reglugerð 44/2019 | CONFIRMED | "reglugerð nr. 44/2019 um rafræna reikninga vegna opinberra samninga (B2G receive, EN 16931 via TS-236); reglugerð 505/2013 for electronic bookkeeping". | island.is/reglugerdir/nr/0044-2019 (title text); 2026-10-10 |
| IS-M7 (IS-17, IS-19) | Retention 7 years FY end | CORRECTED (two rules added) | `IS.RETENTION.BOOKKEEPING` 7 years from the end of the fiscal year, CHECKED, source "lög 145/1994 20. gr.; lög 50/1988 17. gr. 2. mgr.". Text: "Kept in Iceland; companies may keep them abroad for up to six months (authorities can demand them back); electronic records must always be accessible to the authorities. Till inner rolls 3 years." | althingi.is lög 145/1994 20. gr.; 2026-10-10 |
| IS-14 | Tax point UNCLEAR | CORRECTED (now resolved) | `periodBasis` TAX_POINT: "delivery; the invoice date if the invoice is issued before or at delivery; a prepayment is taxed in the period received (80.65 % of the amount at 24 %, 90.09 % at 11 %) (lög 50/1988 13. gr.)". Also 13. gr. confirms bad-debt relief and returns at the same fractions. | lög 50/1988 13. gr.; 2026-10-10 |
| IS-18 (spot) | Note: "electronic records always reachable" is not in 20. gr. | **REJECTED** (false negative inside a CHECKED row) | Keep the sentence; source "lög 145/1994 20. gr.: «Bókhaldsgögn, sem eru á rafrænu formi, skulu ætíð vera aðgengileg yfirvöldum»". | lög 145/1994 20. gr.; 2026-10-10 |
| IS-8 threshold scope (inside IS-M3) | "The pack also needs the threshold (a company-level setting)" | REJECTED | No company-level setting: the threshold does not apply to VSK-registered or exempt-activity businesses (35. gr. 3. mgr. "Aðili sem fellur ekki undir 1. og 2. mgr."). | lög 50/1988 35. gr.; 2026-10-10 |
| IS-3 | Rate `valid_from` 2015-01-01 | STILL UNCLEAR | Read Act 124/2014 on althingi.is. | — |
| IS-9 | Import VSK at customs | STILL UNCLEAR | Read tollalög 88/2005 and the RSK 10.01 guidance. | — |
| IS-13 | VSK return box layout | STILL UNCLEAR | Read RSK 10.01 leiðbeiningar. | — |
| IS-20 | ISK scale 0 | STILL UNCLEAR | Low risk; read ISO 4217. | — |
| IS-24 / IS-25 | B2B e-invoice duty; 0196 scheme | STILL UNCLEAR | — | — |
| IS-29 / IS-31 | Pension and union percentages | STILL UNCLEAR | No percentages in the pack; roles unchanged. | — |
| IS-34 / IS-35 | No official chart; lög 3/2006 layouts | STILL UNCLEAR | Source "NeoERP convention". | — |
| IS spot 1 | IS-1 24 % (14. gr.) | CHECKED holds | — | lög 50/1988 14. gr. |
| IS spot 2 | IS-2 11 % list | CHECKED holds | — | 14. gr. 2. mgr. |
| IS spot 3 | IS-17 7 years | CHECKED holds | — | lög 145/1994 20. gr. |
| IS spot 4 | IS-21 / IS-5 | not re-read | — | — |

---

## Decisions for the lead

1. **D-NO-1 NO chart licence approach.** Recommendation: our own numbers and names; `std_account_ref` = Regnskap Norge
   standard number (the permitted "SAF-T mapping" use); renumber only on a meaning clash (NO-M4, M6); never copy
   `DescriptionNOR` text into `name_local`; never ship the CSV itself. Optionally ask Regnskap Norge AS in writing.
2. **D-NO-2 Holiday-pay expense number.** Recommendation: keep 5020 with `std_account_ref` 5092 (no clash, one number in
   all charts). Alternative: move to 5092.
3. **D-NO-3 PENSION_EXPENSE.** Keep 5420 with OTP mapping to 5950, or move the role to 5950. Recommendation: move to 5950
   only if the pilot companies use OTP insurance (most do).
4. **D-DK-1 Return rounding.** "bortses fra ørebeløb" reads as "øre are dropped". Recommendation: truncate toward zero per
   box; compute *afgiftstilsvar* from the truncated boxes; post the difference to the ledger settlement with `ROUNDING`.
5. **D-DK-2 2090 and 2500.** 2090: no standard number; recommend H-DK skips presentation accounts. 2500: map to 8040
   (short-term), not 7250 (long-term).
6. **D-DK-3 Employer ATP expense.** The standard puts employer ATP in *Lønninger* (2898), the rest of Samlet Betaling in
   2930. Recommendation: add DK country role `ATP_EXPENSE` on new account 5405 (std 2898), posted Dr `ATP_EXPENSE` /
   Cr `ATP_PAYABLE` (P2 change). Fallback for 2026.3: map 5400 → 2930 and note the small misclassification.
7. **D-DK-4 `late_document_rule`.** Recommend CORRECT_EARLIER.
8. **D-FI-1 One code for 14/13.5 %.** Recommend one code (`FI-ALV-RED`) with two versions.
9. **D-FI-2 Retention keys.** Recommend two keys (LEDGERS 10 y FY end; VOUCHERS 6 y calendar-year end).
10. **D-IS-1 Imported services.** Recommend the two-code design in IS-M3 and a note that RSK 10.24 is not written by E in
    2026.2 (manual).
11. **D-IS-2 Hosting.** IS records may be kept abroad only up to six months (lög 145/1994 20. gr.); NO electronic records
    may be kept in the EEA/UK/CH with a notice (bokføringsforskriften § 7-5); FI must be inspectable from Finland. This
    feeds D-144 (hosting region) and is a legal question for Jabran.

## Impacts on other contracts

- **A5 roles fixture (`fixtures/payroll-posting/roles-2026-2.json`):** NO `HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED`
  2785 → **2781** (line 410 and note line 450); NO `EMPLOYEE_ADVANCES` 1570 → **1572** (line 299 if NO); NO
  `PENSION_PAYABLE` 2945 → **2946** (line 623); NO `HOLIDAY_PAY_EXPENSE` stays 5020 (if D-NO-2 accepted); NO
  `POS_CASH_CLEARING`, `GRNI`, `ROYALTY_INCOME`, `DISCOUNT_RECEIVED`, `SALES_RETURNS`, `FRANCHISE_FEE_EXPENSE`,
  `SERVICE_REVENUE_DEFAULT` move per NO-M6 (if they are in any A-series fixture). DK 1570, FI 2941/1570, IS 2941/1570
  fill the "account to be added" nulls. If D-DK-3 is taken, a new DK country role `ATP_EXPENSE` (catalogue count +1).
- **Packs contract:** §6.2a example "NO 2785" → "NO 2781"; §6.3 NO PENSION_PAYABLE "2946 OTP"; §6.1 D-85 FI name;
  §6.3 FI 5400/2770 names; §7.3 NO-1 code 84 renamed; §3.1 DK sources and RC-DOM role; §3.2 FI codes; §3.3 IS RC codes;
  §3.4 expected-rates rows (FI-ALV-RED); §4.1a retention rows (NO, DK, FI, IS texts above).
- **Payroll lead P2 (`payroll-v2-p2.md`):** lines 294–295 "5400 / 2785" and "2785 / 2770" → **2781**; Q7 note
  "NO 2780" obsolete; lines 212 and 341 "sotu" → "sairausvakuutusmaksu"; line 375 DK statement agrees with the DK
  standard chart (no holiday contribution accrual account). If D-DK-3: a DK employer-ATP line by role `ATP_EXPENSE`.
- **E box sets (`accounts-e.md`):** DK writer whole kroner (D-DK-1), RC-DOM tax to Salgsmoms, B-varer/B-ydelser =
  EU-salg totals check; FI box list 056/301–320 with 308 formula, non-EU services mapping, FI-YVI monthly only (C-8);
  NO codes 84, 91/92 labels and account moves; IS RC services off the VSK return (RSK 10.24, manual).
- **Attachments retention (D-143, `accounts-attachments.md` §3):** FI two classes (10 y ledgers/payroll book from FY end;
  6 y vouchers from end of calendar year); DK per-document override 10 y for property (§ 92 stk. 3) and delete the
  "was § 10" note; NO 5 y (items 5–8 could be 3.5 y; keep 5 y as the single period) and the § 7-5 storage-abroad rule
  replacing the claim that 2026 "adds Norge"; IS 7 y, electronic always accessible, abroad ≤ 6 months.
