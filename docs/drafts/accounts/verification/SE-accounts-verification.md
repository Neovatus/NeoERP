# Sweden Accounts pack verification (SE@2026.2 / TAX-SE@2026.2)

Checked by: research accountant for the Accounts lead, 2026-10-09. This is the Accounts lead's verification (Jabran's decision: no external auditor; this state = `CHECKED`).
Method: official sources fetched with WebFetch on 2026-10-09 (Skatteverket, riksdagen.se, BAS, Bankgirot, SIE-Gruppen). Date/version per row = the page's "senast ändrad" metadata or the document edition.

**Fetch limits (say so, not guessed):** the riksdagen.se, rkrattsbaser.gov.se, data.riksdagen.se and svenskforfattningssamling.se copies of **ML 2023:200** were cut off around 87,000 characters (they end in 7 kap.). So I could **not read 9 kap. (rates), 13–15 kap. (kundförlust) or 17 kap. (fakturering) in the law text**. Where the § number matters, the row says UNCLEAR and the content is checked against Skatteverket's guidance instead. The **ÅRL** page did not include the bilagor. BAS 2026 was read from the official PDF (`BAS_kontoplan_2026_v2.pdf`, headed "KONTOPLAN BAS 2026 v 1.1"). It was read by text extraction, so before 2026.3 ships, check each "missing" result by eye in the PDF or XLSX.

---

## Summary

### Must change (packs 2026.2 → publish as 2026.3 with `CHECKED`)

1. **§7.1 SE-7 / tax codes:** BAS 2026 has **no account 2617**, so close the open item. Keep 2614 for 25 % reverse charge. The new 12 % and 6 % codes in **SE-4** must post to their own rate accounts: **2624 / 2634** (`SE-MOMS-RC-EU-GOODS-12/-6`, RC 12/6 %) and **2625 / 2635** (`SE-MOMS-IMPORT-12/-6`). `SE-MOMS-25-RENT` posts to **2613** *Utgående moms för uthyrning, 25 %*. These are account overrides, so the pack must name them (§3.0 "no override unless named").
2. **§7.1 SE-5 and the rig's `SE-MOMS-6` side note:** the food rate is **enacted**. 6 % applies from 2026-04-01 to 2027-12-31. Restaurant and catering stay at 12 %, takeaway food is 6 %. Replace "announced" with this. SE-5 is confirmed. D-89 is right: the base stays in ruta 05 and only the tax moves from ruta 11 to ruta 12.
3. **Terminology (legal texts, account names, code names):** ML 2023:200 says **"omvänd betalningsskyldighet"**, not "omvänd skattskyldighet". Correct the rig's `SE-MOMS-RC-DOM` local name, account 2614 and account 2647.
4. **§4.6 roles:** **3741 is not in BAS 2026** (group 37 has 3740 and then 3750), and neither is **4968**. Keep both only as NeoERP extensions with the extension `source` text ("number not listed in BAS 2026"), or remap SMALL_DIFFERENCES to 3740 / 7990 and PURCHASE_PRICE_VARIANCE to a 40xx/49xx account the lead chooses.
5. **Chart rows carried from 2026.1 that BAS 2026 no longer has, or has renamed** (BAS 2026 restructured class 4 and group 12):
   - 1515 → none (use 1516 *Tvistiga kundfordringar*, or drop the row)
   - **1580 → 1686** *Fordringar för kontokort och kuponger* (`CARD_CLEARING`)
   - **3041 → none** in BAS 2026 (class 30 ends at 3004). Make `SERVICE_REVENUE_DEFAULT` 3001, or flag 3041 as an extension.
   - 1240/1249 → **1226** *Bilar och transportmedel* (accumulated depreciation on 1229)
   - 1250/1259 → **1224** *Datorer (ej för produktion)* (accumulated depreciation on 1229)
   - 7834/7835 → **7832**
   - 7720 → **7730/7732** (in BAS 2026, 7720 is *Nedskrivningar av byggnader och mark*)
   - 4600 is a group account now → **4610**
   - **4730 → 4091** *Erhållna kassarabatter (Handelsvaror)*, or 4731, for `DISCOUNT_RECEIVED`
   - 4010 renamed *Inköp av handelsvaror i Sverige*
   - For trading companies, 4515/4545 should be **4075/4085** (handelsvaror); 4515/4545 are now *råvaror och material*
   - Names to update: 1019, 1220/1229, 1350, 1930 *Företagskonto*, 2097 *Fri överkursfond*, 2330 *Kontokredit*, 2350, 3980, 3990, 5020 *El*, 6250 *Porto*, 7510 *Arbetsgivaravgifter 31,42 %*

   The rig's `source` text "BAS 2026 kontoplan, account N" is wrong for every one of these rows.
6. **§2.4 BS_STANDARD:** the SE legal format is **ÅRL 3 kap. 3 § bilaga 1** (balance sheet). The P&L is bilaga 2 (kostnadsslagsindelad) or bilaga 3. A3 calls the layout `BS_NORDIC_SE` and the packs call it `BS_STANDARD`; align the two names.
7. **§4.1 `eu_sales_list_frequency_default`:** goods are reported monthly. Quarterly is only allowed **on application, if EU goods sales are ≤ SEK 500,000 excl. VAT in the current quarter and in each of the previous four**. Services are reported **quarterly**. Add the services default.
8. **E (return file):** amounts in the momsdeklaration file must be **whole kronor**. The file is `eSKDUpload` Version 6.0, ISO-8859-1. The periodisk sammanställning file starts with `SKV574008;`, and the paper form is **SKV 5740**. Update E C-17 and the golden files.
9. **A3 example (line ~443)** still shows OBE on 2098. Change it to 2009.
10. **Gap, not a value:** BFL 5 kap. 2 § allows **bokslutsmetoden** (cash basis) when net turnover is ≤ SEK 3 m. `tax_point_basis = ENTRY_DATE` covers faktureringsmetoden only. Either state that bokslutsmetoden is unsupported in 2026.2, or add it.

### Confirmed (CHECKED)

- **Rates:** 25 / 12 / 6 / 0 (exempt) and the food-rate dates.
- **Momsdeklaration rutor:** every ruta E maps (05–62), including the new 08, 23, 31/32, 37/38, 40, 41, 61/62. Ruta 49 = 10+11+12+30+31+32+60+61+62 − 48.
- **Domestic reverse-charge categories** and their rutor (23/24 for the buyer, 41 for the seller).
- **Invoice content, simplified invoice and credit notes:** required content, the SEK 4,000 simplified-invoice limit (incl. VAT), and credit-note reference rules.
- **Advances and bad debts:** tax on advances (ML 7 kap. 7 §), and bad-debt relief for a konstaterad kundförlust.
- **Return periods:** frequencies and thresholds (yearly ≤ SEK 1 m on the fiscal year, quarterly ≤ SEK 40 m as the default, monthly > SEK 40 m).
- **Bokföringslagen:** 3 kap. 3 § (first year up to 18 months), 5 kap. 7 § and 11 §, and 7 kap. 2 § (kept through the 7th year).
- **Equity accounts:** 2009 is absent from BAS (so it is free for OBE), 2091, 2098, 2099, 8999, and 8810/8850, 2110/2150.
- **Payroll accounts:** all SE payroll role accounts.
- **Payment references:** OCR (mod 10, optional length digit, 2–25 digits, soft/hard/variable/fixed control) and Bankgiro (7–8 digits, mod 10).
- **SIE:** #IB/#UB (balance-sheet accounts), #RES (P&L accounts), #VER/#TRANS syntax, and PC8 encoding.
- **Partial deductions:** representation (300 kr base) and 50 % on car leasing.

---

## 1. Moms rates, reverse charge, exempt, invoice texts

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 1.1 | Standard rate | SE-MOMS-25: 25 % | 25 % ("nästan alla varor och tjänster") | CHECKED | Skatteverket, *Momssatser och undantag från moms*, https://www.skatteverket.se/foretag/moms/saljavarorochtjanster/momssatserochundantagfranmoms.4.58d555751259e4d66168000409.html (modified 2026-07-07) | |
| 1.2 | 12 % rate scope | SE-MOMS-12: hotels, restaurants, food outside the reduction | 12 %: restaurant and catering, hotel rooms, camping, art sales, some repairs | CHECKED | same page | Restaurant stays at 12 % during the food reduction. |
| 1.3 | 6 % rate scope | SE-MOMS-6: books, newspapers, passenger transport, culture | 6 %: books, newspapers, e-books, domestic passenger transport, culture and sport tickets, copyrights; **food from 2026-04-01** | CHECKED | same page | |
| 1.4 | Temporary food rate (SE-5) | 6 % from 2026-04-01 to 2027-12-31, "verify; temporary"; rig note says "announced" | Enacted: 12 → 6 % from **2026-04-01 to 2027-12-31** inclusive; takeaway 6 %, eat-in 12 % | CHECKED (wording CORRECT TO "in force") | Skatteverket news *Livsmedelsmomsen sänks till 6 procent*, https://www.skatteverket.se/omoss/pressochmedia/nyheter/2026/nyheter/livsmedelsmomsensankstill6procent.5.70685bee19c85dd5dd0a3f.html (2026-02-26); Prop. 2025/26:55, https://regeringen.se/pressmeddelanden/2025/11/regeringen-tar-nasta-steg-mot-tillfalligt-sankt-moms-pa-livsmedel/ | The SFS number was not on the pages read. The Skatteverket rates page no longer calls it temporary, but the news item gives the end date. Food goes back to SE-MOMS-12 from 2028-01-01. |
| 1.5 | D-89 premise "SE food 12 → 6 % changes the box" | food moves to another code | Base stays in ruta 05; tax moves from ruta 11 to ruta 12 | CHECKED | Skatteverket *Fylla i momsdeklarationen* (row 2.1) | The code move is still right, because the tax box differs. |
| 1.6 | Exempt vs zero/outside scope | SE-MOMS-EXEMPT ruta 42; EXPORT 36, EU goods 35, EU services 39 (ZERO) | 42 = "Övrig försäljning med mera" (exempt sales plus grants that are not consideration) | CHECKED | Row 2.1 source | Exempt categories (health care, education, finance, insurance, property) as listed on the rates page. |
| 1.7 | Domestic reverse charge categories | SE-MOMS-RC-DOM (services, e.g. construction); new RC-DOM-GOODS, RC-DOM-SALE | Construction services to the construction sector; gold ≥ 325 ‰; investment gold under voluntary taxation; waste and scrap of base metals; batteries; remelting ingots; emission allowances; mobile phones, chips, consoles, tablets, laptops > SEK 100,000 per invoice; energy and property-related supplies by foreign businesses | CHECKED | Skatteverket *Omvänd betalningsskyldighet*, https://www.skatteverket.se/foretagochorganisationer/moms/sarskildamomsregler/omvandskattskyldighet.4.47eb30f51122b1aaad28000258292.html (modified 2026-07-07) | Buyer: ruta 23 (goods) / 24 (services), tax in 30–32, deduction in 48. Seller: ruta 41. |
| 1.8 | EU goods and services purchases, imports | RC-EU-GOODS 20/30/48; RC-EU-SVC 21/30/48; RC-NONEU-SVC 22/30/48; IMPORT 50/60/48 | as ours | CHECKED | Row 2.1 source | Imports: base in 50, tax in 60/61/62, deduction in 48. |
| 1.9 | Legal text, reverse charge | "Omvänd skattskyldighet" (rig `nameLocal` of SE-MOMS-RC-DOM, 2614 and 2647 names) | Invoice text **"Omvänd betalningsskyldighet"** (or "Reverse charge"), plus the buyer's VAT number | CORRECT TO "Omvänd betalningsskyldighet" | Skatteverket *Momslagens regler om fakturering*, https://www.skatteverket.se/foretag/moms/saljavarorochtjanster/momslagensregleromfakturering.4.58d555751259e4d66168000403.html (modified 2026-03-19); BAS 2026 2614/2647 names | For intra-EU goods, a reference such as "10 kap. 42 § ML" (or art. 138 of the VAT Directive) may be used instead. |
| 1.10 | Legal text, exempt | per-code `legalTexts` | A reference to the ML provision, or to the Directive, **or** the statement "undantag från momsplikt" | CHECKED (use "Undantag från momsplikt" as the sv default) | same page | |
| 1.11 | Sales invoice content source | ML (2023:200) 17 kap. 24 § | Content list confirmed against Skatteverket: issue date; unique sequence number; seller VAT no.; buyer VAT no. when the buyer is liable; names and addresses; quantity and type; supply date if different; base per rate or exemption, unit price excl. VAT, discounts; rate; VAT amount | CHECKED (content) / UNCLEAR (§ number) | same page; ML text could not be read past 7 kap. (riksdagen.se, "t.o.m. SFS 2026:1025") | B §6.4 SE column matches. Read 17 kap. 24 § in the law before the `source` text says "24 §". |
| 1.12 | Simplified invoice | 17 kap. 30 §; `simplified_invoice_limit` 4,000 SEK | ≤ SEK 4,000 **incl. VAT**; also allowed for correction invoices and for the ≤ SEK 120,000 exemption; not for EU reverse-charge buyers | CHECKED (amount) / UNCLEAR (§ number) | same page | Store the limit as incl. VAT. |
| 1.13 | Partial deduction, representation (SE-6) | SE-MOMS-IN-25-REP, capped base, the person lowers it | Base max SEK 300 excl. VAT per person and occasion; schablon SEK 46 per person (SEK 33 when food is at 6 %) | CHECKED | Skatteverket *Avdrag för moms vid representation*, https://www.skatteverket.se/foretagorganisationer/moms/vadarmoms/momsfriavarorochtjanster.4.15532c7b1442f256baec84b.html (modified 2026-10-02) | C C-21's manual lowering fits. Add the 46/33 kr schablon to the help text. |
| 1.14 | Partial deduction, car leasing (SE-6) | SE-MOMS-IN-25-CAR50, 50 % | 50 % of VAT on hire or leasing of a personbil used > 100 mil a year in VAT-liable business; 100 % on running costs | CHECKED | Skatteverket *Bilar och moms*, https://www.skatteverket.se/foretagorganisationer/moms/sarskildareglerforvissavarortjanster/bilarmoms.4.58d555751259e4d6616800010628.html (modified 2026-10-02) | |

## 2. Momsdeklaration, periodisk sammanställning, periods, tax-point basis

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 2.1 | Rutor 05/06/07/08/10/11/12 | 05 sales base; 10/11/12 output 25/12/6; 06, 07 not in 2026.2; 08 = rent (SE-MOMS-25-RENT) | 05 "Momspliktig försäljning som inte ingår i fält 06, 07 eller 08"; 06 uttag; 07 VMB base; 08 "Hyresinkomster vid frivillig beskattning"; 10–12 output tax | CHECKED | Skatteverket *Fylla i momsdeklarationen*, https://www.skatteverket.se/foretag/moms/deklareramoms/fyllaimomsdeklarationen.4.3a2a542410ab40a421c80004214.html (modified 2026-09-21) | The tax of SE-MOMS-25-RENT goes to ruta 10. |
| 2.2 | Rutor 20–24, 30–32 | E §3.3 and SE-4 | 20 EU goods; 21 EU services (main rule); 22 non-EU services; 23 domestic goods, buyer liable; 24 other domestic services, buyer liable; 30/31/32 output 25/12/6 on 20–24 | CHECKED | same | |
| 2.3 | Rutor 35–42 | 35 EU goods; 36 export; 38 SE-MOMS-EU-TRIANG; 39 EU services; 40 SVC-ABROAD; 41 RC-DOM-SALE; 42 exempt | as ours; 37 = intermediary's purchase in triangular trade | CHECKED | same | 37 has no code in 2026.2. Add a purchase-side triangulation code later. |
| 2.4 | Rutor 48, 49, 50, 60–62 | 48 input incl. RC; 49 computed; 50 import base; 60/61/62 | 49 = 10+11+12+30+31+32+60+61+62 − 48 | CHECKED | same | Use this formula for E's computed box. |
| 2.5 | Return file format (E C-17) | "SE momsdeklaration XML for Skatteverket's file upload" | XML `eSKDUpload Version="6.0"`, ISO-8859-1, elements ForsMomsEjAnnan (05) … MomsBetala (49); **whole numbers, no decimals** | CHECKED / CORRECT (rounding) | Skatteverket *Lämna momsdeklaration via fil i e-tjänsten*, https://www.skatteverket.se/foretag/moms/deklareramoms/lamnamomsdeklarationviafilietjansten.4.2fb39afe18dabf1e4d223cc.html (modified 2026-07-20) | The writer must round each box to whole kronor. E's examples show öre. |
| 2.6 | Periodisk sammanställning (SE-PS) | goods monthly, quarterly allowed; layout "SKV 574" | Goods monthly; quarterly on application if goods ≤ SEK 500,000 excl. VAT in the current quarter and each of the previous 4; **services quarterly**; goods and services together monthly; e-service due the 25th, paper the 20th; file header `SKV574008;` (semicolon text file); paper form SKV 5740 | CHECKED / CORRECT TO add services = QUARTERLY | Skatteverket *Periodisk sammanställning för varor och tjänster*, https://www.skatteverket.se/foretag/moms/deklareramoms/periodisksammanstallningforvarorochtjanster.4.58d555751259e4d661680001093.html (modified 2026-08-12); *Lämna periodisk sammanställning med filöverföring* (modified 2026-09-23) | Triangulation (as intermediary) is included. Late fee SEK 1,250. |
| 2.7 | Return frequency default and options | QUARTERLY; MONTHLY, QUARTERLY, YEARLY; yearly = fiscal year | ≤ SEK 1 m: beskattningsår (month or quarter optional); ≤ SEK 40 m: quarter (month optional); > SEK 40 m: month only | CHECKED | Skatteverket *När ska jag deklarera moms*, https://www.skatteverket.se/foretag/moms/deklareramoms/narskajagdeklareramoms.4.6d02084411db6e252fe80008988.html (modified 2026-07-20) | §4.5 guidance: SEK 1 m / 40 m bands. Deadlines: quarterly, the 12th of the second month after the period (17th in August). |
| 2.8 | Tax-point basis | SE `ENTRY_DATE` (bokföringsmässiga grunder) | Faktureringsmetoden: VAT in the period the invoice is booked or issued (the buyer under reverse charge in the same period). Bokslutsmetoden: on payment, with unpaid items at year-end | CHECKED (faktureringsmetoden) / GAP | Skatteverket *Avdragsrätt, fakturering och redovisning* (bygg RC), https://www.skatteverket.se/foretag/moms/sarskildamomsregler/byggverksamhet/omvandbetalningsskyldighetinombyggsektorn/avdragsrattfaktureringochredovisning.4.19b9f599116a9e8ef36800022270.html (modified 2026-04-30); BFL 5 kap. 2 § (row 4.3) | Bokslutsmetoden (net turnover ≤ SEK 3 m) is not supported. Decide on it, or document it. |
| 2.9 | Late documents | `NEXT_RETURN` | Skatteverket asks for a **rättelse** of the earlier return when a period is already declared (e.g. bad debt) | UNCLEAR | Skatteverket *Kundförluster* (row 6.1) | NEXT_RETURN is common practice for small amounts. The sources read do not say it is allowed. Leave as a lead decision, with the user warned. |

## 3. BAS chart (BAS 2026, "KONTOPLAN BAS 2026 v 1.1", https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf, read 2026-10-09)

| # | Item / role | Our value | Verified value (BAS 2026) | Status | Note |
|---|---|---|---|---|---|
| 3.1 | AR_CONTROL | 1510 Kundfordringar | 1510 Kundfordringar | CHECKED | |
| 3.2 | ALLOWANCE_DOUBTFUL_DEBTS | 1519 | 1519 Nedskrivning av kundfordringar | CHECKED | |
| 3.3 | AR without role, doubtful | 1515 Osäkra kundfordringar | not in BAS 2026 (1516 Tvistiga kundfordringar exists) | CORRECT TO 1516, or drop | |
| 3.4 | CARD_CLEARING | 1580 Fordringar för kontokort och kuponger | **1686** Fordringar för kontokort och kuponger | CORRECT TO 1686 | |
| 3.5 | SUPPLIER_ADVANCES | 1480 | 1480 Förskott för varor och tjänster | CHECKED | |
| 3.6 | Tax account, VAT receivable | 1630, 1650 | 1630 Avräkning för skatter och avgifter (skattekonto); 1650 Momsfordran | CHECKED | |
| 3.7 | INTERCOMPANY | 1660 / 2860 | both exist | CHECKED | |
| 3.8 | CASH_DEFAULT / BANK_DEFAULT / PlusGiro | 1910 / 1930 / 1920 | 1910 Kassa; 1930 **Företagskonto**; 1920 PlusGiro | CHECKED (rename 1930) | |
| 3.9 | POS_CASH_CLEARING | 1919 (extension) | not in BAS (1911–1913 Kassa sub-accounts exist) | CHECKED as an extension | The source text is right. |
| 3.10 | OPENING_BALANCE_EQUITY (SE-3) | 2009 | **No 2009 in BAS 2026**: group 20 starts at 2010 | CHECKED (free) | The number is free in BAS. Keep the "confirm it is free in the company's plan" note. |
| 3.11 | RETAINED_EARNINGS (SE-2) | 2091 | 2091 Balanserad vinst eller förlust | CHECKED | |
| 3.12 | 2098 | no role | 2098 Vinst eller förlust från föregående år | CHECKED | The rig still gives 2098 the RETAINED_EARNINGS role. Fix it in 2026.2 as planned. |
| 3.13 | CURRENT_YEAR_RESULT (SE-1) | 2099 | 2099 Årets resultat; P&L side 8999 Årets resultat (group 89 "Skatter och årets resultat") | CHECKED | Closing P&L straight to 2099 is fine. 8999 is optional (some Swedish systems close via 8999). |
| 3.14 | Disposition targets | 2099 → 2091/2098; dividend 2898 | 2898 Outtagen vinstutdelning | CHECKED | |
| 3.15 | Share capital, reserves | 2081, 2085, 2086, 2097 | 2081 Aktiekapital; 2085 Uppskrivningsfond; 2086 Reservfond; **2097 Fri överkursfond** (bound: 2087) | CHECKED (rename 2097) | |
| 3.16 | Untaxed reserves | 2110, 2150 | 2110 Periodiseringsfonder; 2150 Ackumulerade överavskrivningar | CHECKED | |
| 3.17 | Bokslutsdispositioner | 8810, 8850 | 8810 Förändring av periodiseringsfond (8811/8819); 8820/8830 koncernbidrag; 8850 Förändring av överavskrivningar; 8890/8899 | CHECKED | Add 8811/8819 and 8820/8830 later if needed. |
| 3.18 | INCOME_TAX_EXPENSE / PAYABLE | 8910 / 2512, 2518 | 8910 Skatt som belastar årets resultat; 2512 Beräknad inkomstskatt; 2518 Betald F-skatt | CHECKED | |
| 3.19 | CUSTOMER_ADVANCES / AP_CONTROL | 2420 / 2440 | 2420 Förskott från kunder; 2440 Leverantörsskulder | CHECKED | |
| 3.20 | GRNI | 2449 (extension) | not in BAS | CHECKED as an extension | |
| 3.21 | SALES_TAX_OUTPUT 25/12/6 | 2611 / 2621 / 2631 | as ours | CHECKED | |
| 3.22 | SALES_TAX_OUTPUT_RC (SE-7: 2614 vs 2617) | 2614 | 2614 Utgående moms omvänd betal(ning)skyldighet, 25 %; **2617 does not exist**; 12 %: **2624**; 6 %: **2634** | CHECKED 2614; CORRECT (add 2624/2634 overrides) | Close SE-7. |
| 3.23 | Import output VAT | 2615 | 2615 (25 %); **2625** (12 %); **2635** (6 %) | CHECKED; add 2625/2635 | For SE-MOMS-IMPORT-12/-6. |
| 3.24 | Rent output VAT (SE-MOMS-25-RENT) | role account 2611 | **2613** Utgående moms för uthyrning, 25 % | CORRECT TO 2613 (override) | |
| 3.25 | SALES_TAX_INPUT / INPUT_RC / domestic RC input | 2641 / 2645 / 2647 | 2641 Debiterad ingående moms; 2645 Beräknad ingående moms på förvärv från utlandet; 2647 Ingående moms omvänd betalningsskyldighet varor och tjänster i Sverige | CHECKED (rename 2647) | |
| 3.26 | SALES_TAX_SETTLEMENT | 2650 | 2650 Redovisningskonto för moms | CHECKED | |
| 3.27 | Sales accounts | 3001–3004, 3105, 3106, 3108, 3305, 3308 | all exist with the names used | CHECKED | |
| 3.28 | SERVICE_REVENUE_DEFAULT | 3041 | **not in BAS 2026**: class 30 is 3000–3004 only | CORRECT TO 3001 (or flag as an extension) | |
| 3.29 | DISCOUNT_GIVEN / ROUNDING / SALES_RETURNS | 3730 / 3740 / 3790 | 3730 Lämnade rabatter; 3740 Öres- och kronutjämning; 3790 Övriga intäktskorrigeringar | CHECKED | |
| 3.30 | SMALL_DIFFERENCES (§4.6) | 3741 "Öresutjämning, small differences" | **3741 does not exist** | CORRECT: flag as an extension, or use 3740 / 7990 | |
| 3.31 | Franchise, royalty | 3922, 3925 / 3926, 5991, 6591, 6592 | 3922, 3925 exist; 3926, 5991, 6591, 6592 not in BAS | CHECKED (the extensions are already flagged) | |
| 3.32 | FX realised / unrealised | 3960, 7960 / 3961, 7961 | 3960, 7960 exist; 3961, 7961 not in BAS | CHECKED (extensions flagged) | |
| 3.33 | PURCHASES_DEFAULT | 4010 "Inköp material och varor" | 4010 **Inköp av handelsvaror i Sverige** (class 4 restructured 2026: handelsvaror 40xx, råvaror 43xx–48xx) | CORRECT (name) | |
| 3.34 | EU and import purchase accounts | 4515, 4545 as "goods" | 4515/4545 = *råvaror och material*; handelsvaror = **4075** (EU 25 %), **4085** (import 25 %); services 4531, 4535 unchanged | CORRECT (use 4075/4085 for goods for resale; add 12/6 % siblings) | |
| 3.35 | Subcontracting | 4600 | 4600 is the group account; **4610** Inköp av tjänster och underentreprenader | CORRECT TO 4610 | |
| 3.36 | DISCOUNT_RECEIVED | 4730 Erhållna kassarabatter | 4730 = Erhållna rabatter (Råvaror och förnödenheter); kassarabatt = **4091** (Handelsvaror) / 4731 | CORRECT TO 4091 | |
| 3.37 | COGS / INVENTORY_ADJUSTMENT | 4960 / 4969 (extension) | 4960 Förändring av lager av handelsvaror; 4969 not in BAS | CHECKED | |
| 3.38 | PURCHASE_PRICE_VARIANCE (§4.6) | 4968 | **not in BAS** | CORRECT: flag as an extension | |
| 3.39 | BAD_DEBT_EXPENSE | 6351 | 6351 Konstaterade förluster på kundfordringar (6352 Befarade) | CHECKED | |
| 3.40 | BANK_CHARGES | 6570 | 6570 Bankkostnader | CHECKED | |
| 3.41 | Fixed-asset rows | 1240/1249, 1250/1259, 7834, 7835, 7720 | 1240/1250 are now "(Fritt konto)"; 1249, 1259, 7834, 7835 missing; cars **1226**, computers **1224**, accumulated depreciation **1229**, depreciation **7832**; 7720 = byggnader och mark → **7730/7732** | CORRECT | BAS 2026 restructured group 12. |
| 3.42 | Other renamed rows | 1019, 1220, 1229, 1350, 2330, 2350, 3980, 3990, 5020, 6250 | "Ack. avskr. på balanserade utgifter"; "Inventarier, verktyg och installationer"; "Andra långfristiga värdepappersinnehav"; "Kontokredit"; "Andra långfristiga skulder till kreditinstitut"; "Erhållna offentliga bidrag"; "Övriga ersättningar, bidrag och intäkter"; "El"; "Porto" | CORRECT (names) | |
| 3.43 | Payroll roles (§6.3 SE) | 7210, 7290, 7510, 7410, 2710, 2790, 2730, 2740, 2821, 2920; no role on 2940 | all exist; **7510 is named "Arbetsgivaravgifter 31,42 %"**; 7519 Arbetsgivaravgifter för semester- och löneskulder | CHECKED (rename 7510, 7519) | |
| 3.44 | P&L layout | PL_NATURE: ÅRL bilaga 2 (kostnadsslagsindelad) | ÅRL 3 kap. 3 §: P&L per bilaga 2 or 3 | CHECKED | riksdagen.se ÅRL 1995:1554 "t.o.m. SFS 2026:780". The bilaga text was not on the page; that bilaga 2 = kostnadsslagsindelad is from the known structure. |
| 3.45 | BS layout | BS_STANDARD "SE ÅRL" | ÅRL 3 kap. 3 §: balance sheet per **bilaga 1** | CORRECT (source text) | same |

## 4. Bokföringslagen (1999:1078, riksdagen.se, "t.o.m. SFS 2024:342")

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 4.1 | Verifikation content | A1 voucher fields | 5 kap. 7 §: when compiled; when the transaction happened; what it concerns; amount; counterparty; reference to the underlying documents and where they are kept; verification number or other identifier | CHECKED | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/bokforingslag-19991078_sfs-1999-1078/ | Counterparty is required, so a party on AR/AP/bank lines meets it. |
| 4.2 | Grundbok / huvudbok | journal + ledger | 5 kap. 1 §: registration order (grundbok) and systematic order (huvudbok) | CHECKED | same | |
| 4.3 | Cash basis | — | 5 kap. 2 §: net turnover normally ≤ SEK 3 m may book on payment; unpaid items booked at year-end | CHECKED (gap, row 2.8) | same | |
| 4.4 | Systemdokumentation och behandlingshistorik | audit log, system docs | 5 kap. 11 §: description of the system's organisation and structure, and the processing history | CHECKED | same | |
| 4.5 | Retention | 7 years | 7 kap. 2 §: "fram till och med det sjunde året efter utgången av det kalenderår då räkenskapsåret avslutades" | CHECKED | same (SFS 2024:342 in force 2024-07-01) | Retention runs from the calendar year in which the fiscal year ended. |
| 4.6 | First or extended fiscal year | up to 18 months | 3 kap. 1 §: 12 months; 3 kap. 3 §: shorter, or up to **18 months**, when starting or changing; 3 kap. 6 §: a change needs Skatteverket's permission (with exceptions) | CHECKED | same | |

## 5. Payment references

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 5.1 | OCR algorithm and length | Luhn (MOD10), optional length digit, 2–25 digits | Mod 10 check digit last ("10-modul" = Luhn); optional length digit second to last (length mod 10); 2–25 digits incl. check and length digits; digits only | CHECKED | Bankgirot *Bankgiro Inbetalningar Användarmanual* (Oct 2023), https://www.bankgirot.se/globalassets/dokument/anvandarmanualer/bankgiroinbetalningar_anvandarmanual_sv.pdf §5.2; *OCR-referenskontroll* page | Test vector: 12345682 is valid. |
| 5.2 | Control levels | "hard" or "soft" | Soft (warn only); hard (check digit); variable length (check + length digit); fixed length (up to 2 agreed lengths) | CORRECT TO four levels | same | `payment_reference_schemes` needs `VARIABLE_LENGTH` and `FIXED_LENGTH` (with allowed lengths). Default "soft" is fine; Bankgirot recommends soft only in exceptional cases. |
| 5.3 | Bankgiro number | 7–8 digits, Luhn | 7–8 digits, check digit by 10-modul | CHECKED | same | |
| 5.4 | Plusgiro number | Luhn | Mod 10 confirmed (Plusgirot accounts at clearing 9500–9549 / 9960–9969, up to 10 digits incl. check digit) | CHECKED (algorithm) / UNCLEAR (2–8-digit PG display length) | Bankgirot *Bankernas kontonummeruppbyggnad* (2024-02-22), https://www.bankgirot.se/globalassets/dokument/anvandarmanualer/bankernaskontonummeruppbyggnad_anvandarmanual_sv.pdf | No Plusgirot/Nordea page was read for the PG number length. |

## 6. Bad debt, advances, credit notes

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 6.1 | `bad_debt_relief` SE yes (B C-43) | yes, on write-off | Only a **konstaterad** kundförlust (not befarad), assessed per invoice; collection steps needed beyond reminders; invoices < SEK 1,000: 8 months past due + reminder + inkassokrav; reduce rutor 05–08 and 10–12 in the period the loss is established (rättelse if already declared); re-declare output VAT if paid later | CHECKED (rule) / UNCLEAR (ML §) | Skatteverket *Kundförluster*, https://www.skatteverket.se/foretagochorganisationer/moms/sarskildamomsregler/kundforlusteromkundenintekanbetala.4.5c1163881590be297b58d10.html (modified 2024-10-14) | The VAT-relief write-off must be separate from the 6352 provision. B's evidence reference fits. The ML § was not readable (row 1.11). |
| 6.2 | `tax_on_advances` SE yes (B C-42) | tax at receipt date | ML 7 kap. 7 § "Betalning i förskott": the taxable event is when payment is received | CHECKED | riksdagen.se ML 2023:200 (t.o.m. SFS 2026:1025) | The invoice must show the advance date if it differs (row 1.11). |
| 6.3 | Credit note requirements (B C-16) | from the invoice, line by line, at the original rate | Ändringsfaktura dated the day issued; shows the change; "särskild och otvetydig hänvisning till den ursprungliga fakturan" (normally its number); may be a simplified invoice | CHECKED | Skatteverket *Momslagens regler om fakturering* (row 1.9) | `credit_note_tax_window_days` — for SE is right. |
| 6.4 | Invoice deadlines | — | God affärssed; construction: by the end of the 2nd month after; EU goods and services (rutor 35/39): by the 15th of the month after | CHECKED | same | Possible future B warning. |

## 7. SIE 4 (H-SE)

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 7.1 | #IB / #UB | balance-sheet closing balances (D-104) | `#UB year account balance [qty]`, year 0 = current, −1 = previous; credit negative; balance-sheet accounts only | CHECKED | SIE-Gruppen *SIE file format 4B* (2008-09-30), https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_ENGLISH.pdf | |
| 7.2 | #RES | P&L | `#RES year account balance [qty]`; P&L accounts only | CHECKED | same | |
| 7.3 | #VER / #TRANS | journals | `#VER series verno verdate vertext regdate sign {#TRANS account {objects} amount transdate text qty sign}`; ascending verno per series; sum = 0 | CHECKED | same | |
| 7.4 | Encoding | — | `#FORMAT PC8` (IBM codepage 437) only | CHECKED | same | |
| 7.5 | Closing journal in SIE | — | Not specified by SIE 4B | UNCLEAR | same | Lead decision: exclude the YE journal from #VER so #RES keeps the year's P&L. Then 2099's #UB = the year's result. |

## 8. Other §4.1 values

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 8.1 | `invoice_language_default` | sv | no legal language rule read | UNCLEAR | — | Product choice. |
| 8.2 | `settlement_discount_reduces_tax` | yes | Base = consideration less discounts (the invoice must show discounts) | UNCLEAR (§) | row 1.11 | Accepted in practice. Not confirmed in the law text. |
| 8.3 | `cash_payment_warn_limit` SE | — | none read | CHECKED (none) | — | |
