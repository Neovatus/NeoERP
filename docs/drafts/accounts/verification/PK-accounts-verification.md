# PK Accounts pack verification (Pack 2026.2), 2026-10-09

Done by the Accounts lead's research accountant. Under Jabran's rule (no external auditor), a row marked **CHECKED** here is the Accounts lead's "CHECKED" state. The source is given on each row.

**How this was checked.** Only WebSearch and WebFetch were used. Two limits shaped what could be confirmed:

- **Long FBR and SECP PDFs were cut off.** WebFetch stops after about 107k characters. That cut off these official texts:
  - Sales Tax Act 1990 (STA) as updated to 30.06.2026: readable only up to s.10(2). Sections 23, 26 and 73 could not be read.
  - Sales Tax Rules 2006 (STR) as updated to 31.07.2026: readable only up to rule 12. Rules 14, 20 to 22 and 150ZE* could not be read.
  - Income Tax Ordinance 2001 (ITO) as updated to 30.06.2026: readable only up to s.3.
  - Companies Act 2017: readable only up to the table of contents.
- **Some sites refused the fetch.**
  - `pra.punjab.gov.pk` and `reg.pra.punjab.gov.pk` refused (robots).
  - `srb.gos.pk` refused (robots).
  - The Finance Act 2026 PDF on `download1.fbr.gov.pk` returned a client error.
  - KPRA's May-2026 schedule amendment PDF is an image scan with no readable text.

No other way of fetching these was used. Where a value comes only from secondary sources (law-firm notes, tax news), the row is **UNCLEAR**, and the note says what to read to close it.

## Summary

### Must change

1. **Packs §4.2, PK row (invoice-content source).** The source is wrong. "Sales Tax Rules 2006 ch. II" is the returns chapter (rules 13–18A). Change it to:
   - STA s.23 (re-enacted by Finance Act 2026, which also covers invoices for exempt supplies), and
   - STR 2006 Chapter XIV, rule 150R(13).

   Rule 150R(13) adds these REQUIRED fields to `invoice_content_rules`:
   - FBR invoice number (format `XXXXXX-DDMMYYHHMMSS-0001`)
   - QR code, 7×7 mm
   - FBR Digital Invoicing logo
   - registration number of the POS or invoicing software
   - HS code and unit of measure
   - SRO number and serial number (when an exemption or reduced rate applies)
   - further tax, extra tax, tax withheld and FED as separate fields
   - discount
   - invoice reference number on debit and credit notes

   Retailers selling to the general public are excused from the SRO and serial fields.
2. **B C-34 and D-60 (FBR Digital Invoicing).** The scope is now every sales-tax-registered person (SRO 709(I)/2025 of 22 April 2025). Go-live was phased to 31 December 2025 (SRO 1852(I)/2025, from secondary sources). This means:
   - Every PK company with an STRN needs a `fiscal_registrations` row by default.
   - `NoopFiscalProvider` cannot be what a live PK company runs on. The FBR provider (ADR-010, document-output slice) is a **PK go-live blocker**.
   - Rename "IRN" to "FBR invoice number". The credit-note reference is the rule's "invoice reference number".
   - Credit and debit notes are also issued through the integrated system and kept for 6 years (rule 150S).
3. **A3 §3.1 row PK (`Companies Act 2017 / IFRS for SMEs`) and D-102.** The framework depends on the company's class (Companies Act 2017, Fourth and Fifth Schedules):
   - listed companies, public-interest companies and large companies: IFRS as adopted in Pakistan
   - medium companies: IFRS for SMEs
   - small companies: ICAP's revised AFRS for SSEs

   Make the framework a company setting with a note, not one label for all PK companies.
4. **Packs §7.2 PK-5, `rate_hint` on withholding codes.** Use tax year 2027 values (from 1 July 2026), shown as filer (ATL) % / non-filer % (non-filer rates are mostly double):
   - **s.153(1)(a) goods:** companies 5/10; others 5.5/11
   - **s.153(1)(b) services:**
     - "certain services" 7/14 (was 6/12 in tax year 2026)
     - IT and IT-enabled services 4/8
     - independent professionals 15/30 (new)
     - terminal and port services 12/24 (new)
     - other services 14/28 (was 15/30)
     - advertising to media 1.5/3
   - **s.153(1)(c) contracts:** companies 7.5/15; others 8/16; sportspersons 15/30
   - **s.151 bank profit:** 20/40

   A single `rate_hint` cannot hold rates that change each year and split filer from non-filer. Either version it with the code's dated rate versions or split it into filer and non-filer hints. `PK-WHT-153-SVC` needs sub-codes or a sub-category list.
5. **Packs §4.1 `cash_payment_warn_limit`.** Add the Finance Act 2025 ITO rules:
   - **s.21(s):** 50% of the expenditure attributable to a sale is disallowed when the sale is on a single invoice of Rs 200,000 or more and payment is not received through banking or digital channels. Add a **receipt-side** limit of 200,000 to B receipts.
   - **s.21(q):** 10% of the expenditure on purchases from suppliers without an NTN is disallowed. Add a supplier-NTN warning in C.

   The ITO s.21(l) limit of 250,000 is UNCLEAR.
6. **E C-23 and N-P-1.** The s.8B cap of 90% is confirmed, but:
   - Fixed assets and capital goods are **outside** the cap.
   - Finance Act 2026 added a proviso that lets the cap be raised or lowered. Keep it as a dated pack version.
   - Finance Act 2025 rewrote s.73(4) so FBR may cap input tax on supplies to unregistered persons. Leave this as a manual adjustment.

### Confirmed

- Federal standard rate 18% (s.3(1)).
- Further tax 4% on supplies to unregistered or non-active taxpayers (s.3(1A)).
- Third Schedule goods taxed at 18% of the retail price (s.3(2)(a)).
- Extra tax up to 18% (s.3(5)).
- Six-period input window (s.7).
- s.8B cap of 90%.
- Return: payment by the 15th, e-filing by the 18th, the monthly return is "Annexure C".
- PSID and CPR.
- Sindh 15% and KP 15%.
- s.151 at 20%/40%.
- Tax year July–June with a special tax year allowed (s.74).
- s.165 statements quarterly by the 20th (secondary source).

### Still UNCLEAR

- 180-day credit-note window (STR rules 20–22 were cut off).
- s.73 limit of Rs 50,000 (secondary only).
- Punjab 16% and Balochistan 15% (official sites refused or out of date).
- s.220 retention period.
- Eleventh Schedule share of 1/5.
- POS rules for Tier-1 retailers.

## 1. Federal sales tax (STA 1990)

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 1.1 | Standard rate `PK-ST-18` (rig; packs PK-5) | 18%, valid from 2025-07-01 | 18% of value | CHECKED | FBR, STA 1990 updated to 30.06.2026, s.3(1): https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf (list page https://fbr.gov.pk/categ/sales-tax-act/301), read 2026-10-09 | The 18% rate dates from Finance (Supplementary) Act 2023. Finance Act 2026 did not change s.3. A valid-from of 2025-07-01 is fine as the pack's start date. |
| 1.2 | `PK-ST-FURTHER` rate and scope | 4%, additional code; to unregistered persons and registered persons who are not active taxpayers | 4% of value, on top of s.3(1)/(1B)/(2)/(5)/(6) and s.4, where the buyer "has not obtained registration number or he is not an active taxpayer". Subject to s.8(6) and to Federal Government notifications that exclude supplies. | CHECKED | Same STA, s.3(1A) | The ATL default in B C-12 is right. Add a pack note that notified exclusions exist, so the person can remove the code. |
| 1.3 | Extra tax s.3(5) | No code | Up to 18% of value on notified goods or persons | CHECKED (law) | Same STA, s.3(5) | Rule 150R(13) needs extra tax as its own invoice field. No code is needed in v1. Add one when a notified item is in scope. |
| 1.4 | `PK-ST-3RD` Third Schedule | OUTPUT 18%, `base_rule` RETAIL_PRICE | 18% of the retail price. Where the item is also in the Eighth Schedule, the Eighth Schedule rate applies on the retail price. The retail price must be printed on the item. | CHECKED | Same STA, s.3(2)(a). Third Schedule widened by FA 2025 (Circular 02/2025-26, https://download1.fbr.gov.pk/Docs/202584118361586CircularNO02of2025-26SalesTax&FederalExcise.pdf) and FA 2026 (Salient Features https://fbr.gov.pk/Budget2026-27/SalientFeatures/Salient-Feature.pdf) | B C-50 is correct. A Third Schedule item with an Eighth Schedule reduced rate needs a reduced-rate RETAIL_PRICE code (later). |
| 1.5 | `PK-ST-RED` Eighth Schedule (reduced) | No default rate, inactive | Item-specific rates. Examples: FATA/PATA S.No. 89 phases from 10% (2025-26) to 12% (2026-27) to 16% (2028-29) to 18% (2029-). Solar PV panels taxed at 10% after the Sixth Schedule S.No. 164 exemption was withdrawn (FA 2025). | CHECKED (design) | Circular 02/2025-26 (above) | Inactive until the company sets a rate is correct. The circular's first FATA/PATA rate is garbled; it reads as 10%. |
| 1.6 | `PK-ST-ZERO` Fifth Schedule | ZERO 0% | Fifth Schedule = zero rating (s.4) | UNCLEAR | s.4 is within the readable part but was not quoted | Standard structure; read s.4 to close. |
| 1.7 | `PK-ST-EXEMPT` Sixth Schedule | EXEMPT, no input on exempt supplies | Sixth Schedule = exemptions (s.13). The circular confirms Sixth Schedule exemptions being withdrawn and added. Finance Act 2026 adds a Sixth Schedule serial and requires an invoice for exempt supplies (s.23(1) re-enacted). | CHECKED | Circular 02/2025-26; Salient Features 2026-27 | Exempt sales must still go through invoicing and Digital Invoicing (see 3.1). |
| 1.8 | Active taxpayer (ATL) fields `atlIncomeTax`, `atlSalesTax` | Typed status | s.3(1A) uses "not an active taxpayer". Non-filer (non-ATL) withholding rates are double in the rate card. | CHECKED | STA s.3(1A); WHT Rate Card TY2027 (row 5.1) | Keep both flags. |
| 1.9 | `PK-ST-IN` input and the six-period window (E C-23) | 18% default; input older than six periods inadmissible | Input not claimed in the relevant period "may claim such tax in the return for any of the six succeeding tax periods". | CHECKED | STA s.7 (30.06.2026 version) | Six succeeding periods after the relevant one, so 7 periods in all counting the relevant period. Check E's off-by-one. |
| 1.10 | `PK-WHT-ST` Eleventh Schedule withholding, 20% (1/5) | 20%, inactive | The Eleventh Schedule sets withholding as a fraction of the sales tax on the invoice. The fraction varies by scenario. FA 2025 raised online marketplaces to 2% (S.No. 8). FA 2026 adds toll manufacturers and extends AOP/individual withholding from unregistered persons. | UNCLEAR | ICAP CPD note https://www.icap.org.pk/files/per/cpd/held/2020/AmnaBhatty-Withholding.pdf; Salient Features 2025-26 and 2026-27 | Keep it inactive with the rate typed. 1/5 is the common case but not the only one. |

## 2. Provincial sales tax on services

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 2.1 | `PK-PST-PB` Punjab (PRA) | 16% | 16% standard. Reduced rates in Part III of the Second Schedule, e.g. IT services 5% without input. Restaurants paid by card and consultancy at 8% (news). | UNCLEAR | PRA sites refused the fetch (robots). Secondary: https://pkrevenue.com/punjab-finance-bill-2025-introduces-sweeping-sales-tax-reforms/ ; https://invest.gov.pk/node/1557 | Likely correct. The Accounts lead should open PRA's Act/Download page in a browser and confirm s.5 or the Second Schedule. |
| 2.2 | `PK-SST-SD` Sindh (SRB) | 15% | s.8(1): "fifteen per cent ... standard rate", in force 1 July 2025. Second Schedule has 19.5% for telecom and lower rates of 8, 5, 3 and 2%. Sindh Finance Act 2026 (in force 1 July 2026) does not change the standard rate. | CHECKED | Sindh Finance Act 2025 (Act XVI of 2025) https://sindhlaws.gov.pk/Setup/Publications_SindhCode/PUB-NEW-26-000002.pdf ; Sindh Finance Act 2026 (Act XX of 2026) https://www.sindhlaws.gov.pk/Setup/Publications_SindhCode/PUB-NEW-26-000096.pdf | srb.gos.pk refused (robots). The official provincial gazette was used instead. |
| 2.3 | `PK-ST-KP` KP (KPRA) | 15% | s.9(1) proviso: 15% is "the standard or general rate". Reduced rates by notification (s.9(2)) and the Second Schedule. Input restrictions on reduced rates in s.17(1)(j)–(l). | CHECKED | KP Sales Tax on Services Act 2022 (updated 2024) https://kpra.gov.pk/wp-content/uploads/2024/07/KP-STS-ACT-2022-Updated-2024.pdf | The May-2026 Schedule amendment (https://kpra.gov.pk/wp-content/uploads/2026/06/kpsts-act-2022-amendments-first-second-schedules-may-2026.pdf) is an image scan and could not be read. Re-check it by eye. |
| 2.4 | `PK-ST-BA` Balochistan (BRA) | 15% | 15% in column 3 of the schedule; IT services 6% without input | UNCLEAR | Board of Investment summary "amended up to 2020" https://invest.gov.pk/incentives-database/1559 ; Act text https://balochistan.gov.pk/wp-content/uploads/2024/10/the-balochistan-tax-on-services-act-2015-1.pdf (not read) | Value plausible; the source is old. |
| 2.5 | Provincial withholding agents (`PK-WHT-PST-PB/-SD/-KP/-BA`, 2756–2759) | Codes plus accounts per authority | KP: s.4(2) and s.14 (withholding agents), KP Withholding Regulations 2024. Sindh: s.13 withholding agents. Punjab and Balochistan have similar regimes (not read). | CHECKED (KP, SD); UNCLEAR (PB, BA) | KP Act above; https://kpra.gov.pk/wp-content/uploads/2025/01/KP-withholding-regulations-2024.pdf ; Sindh FA 2025 First Schedule reference to s.13 | Keeping a separate account per authority is right; each deposit is made to its own province. |
| 2.6 | Provincial returns monthly (E C-8, D-35) | MONTHLY | PRA: returns under the Filing of Returns Rules 2012 (pra.punjab.gov.pk home page). Due dates not read. | UNCLEAR | https://pra.punjab.gov.pk/ | Monthly is the norm in all four provinces. Confirm the due dates (usually the 15th or 18th). |

## 3. Invoices, credit notes, Digital Invoicing, POS

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 3.1 | FBR Digital Invoicing scope and dates (B C-34, D-60) | Companies "in scope" from a typed `validFrom` | All sales-tax-registered persons must integrate (rule 150Q). SRO 709(I)/2025 of 22-04-2025 widened it from FMCG and retail-chain sellers to all registrants. Deadlines were extended several times: corporate 1 May to 1 June to 1 July 2025; non-corporate 1 June to 1 July to 1 August 2025. SRO 1852(I)/2025 (24-09-2025) phased go-live: public enterprises, importers and turnover over Rs 1bn on 1-11-2025; Rs 100m–1bn on 15-11-2025; under Rs 100m on 1-12-2025; everyone else on 31-12-2025. The Commissioner may extend by up to 60 days (rule 150V). | CORRECT TO "every PK sales-tax-registered company" (scope CHECKED; dates UNCLEAR) | STR Chapter XIV (FBR) https://download1.fbr.gov.pk/Docs/2025571554338577ChapterXIV.pdf ; SRO 709: https://regfollower.com/pakistan-expands-e-invoicing-to-all-sales-tax-registrants/ ; extensions: https://sovos.com/regulatory-updates/sut/pakistan-further-extension-of-e-invoicing-integration-deadline/ , https://english.aaj.tv/news/amp/330414911 ; SRO 1852: https://www.edicomgroup.com/blog/pakistan-b2b-electronic-invoicing , https://orbitax.com/news/country/article/Pakistan-updates-e-invoicing-d_c3afe17c-9f22-11f0-8d8d-aaf8c834a4f9 | The official SRO PDFs were not found or read; the dates come from secondary sources. Finance Act 2025 added s.23(5)–(6) (invoices tied to FBR's e-invoicing system). Finance Act 2026 defines "electronic invoicing system". Make a fiscal registration required for PK companies with an STRN. The FBR provider is a go-live blocker. |
| 3.2 | What the FBR-integrated invoice must show | FBR IRN plus QR stored and printed | FBR invoice number `XXXXXX-DDMMYYHHMMSS-0001` (150R(13)(a)); 7×7 mm QR code made from that number (150R(4)(e), (13)(b)); FBR DI logo (13)(d); software or POS registration number (13)(c); seller and buyer names, addresses and registration numbers (13)(e)–(j); signboard "Integrated with FBR" at outlets (150R(11)) | CORRECT TO these names and fields | STR Chapter XIV (above) | Rename `IRN` to `fbrInvoiceNumber`. The logo and software registration number go to document output. |
| 3.3 | Tax invoice content, legal source (packs §4.2) | "STA s.23; STR 2006 ch. II" | STA s.23 (FA 2025 added (1)(g) proviso for e-bilty and (5)–(6); FA 2026 re-enacted s.23(1) to include exempt supplies). STR rule 150R(13) data fields: date, tax period, description, quantity, value excluding tax, rate, tax, tax withheld, extra tax, further tax, FED in sales-tax mode, discount, invoice reference number, HS code, unit of measure, SRO number and serial number (fields (s)(t)(u)(z) not needed for retailers selling to the public unless they also make or import the goods). | CORRECT TO "STA s.23; STR 2006 Chapter XIV r.150R(13)" | STR Chapter XIV; Circular 02/2025-26; Salient Features 2026-27 | STR Chapter II is returns (rules 13–18A, from the STR table of contents). The s.23 text itself was cut off; the fields are taken from r.150R. |
| 3.4 | Credit-note window (`credit_note_tax_window_days` = 180; B C-45, D-63; PK-5) | 180 days from supply | STA s.9: debit and credit notes "subject to such conditions and limitations as the Board may impose". STR Chapter III rules 19–23: r.20 cancellation or return of supply, r.21 change in value, r.22 adjustment of input and output. The 180-day limit could not be read. | UNCLEAR | STA s.9 (30.06.2026 version); STR updated to 31.07.2026 https://download1.fbr.gov.pk/Docs/202691810951482SalesTaxRules.pdf (table of contents only) | Keep 180 days as UNCLEAR. Don't confuse it with the separate s.73 condition (secondary source): credit purchases must be paid through a bank **within 180 days of the invoice date**, or input is lost. That condition belongs in E C-23 as a proposal. e-credit notes must go through the integrated system (r.150S(2)). |
| 3.5 | Supplementary invoice and debit note (B C-45) | INVOICE with `supplementsInvoiceId`, fiscalised as a debit note | s.9 and r.21 cover changes in value. r.150S(2) requires debit and credit notes to be issued electronically. | CHECKED (concept) | As 3.4 | |
| 3.6 | POS integration of Tier-1 retailers | Not in v1 (POS later) | Tier-1 retailers: STA s.2(43A) (amended by FA 2026) and s.23(6) proviso (moved from s.3(9A) by FA 2025). STR has rules 150ZEN–150ZER for sealing and de-sealing Tier-1 retailers. | UNCLEAR | Circular 02/2025-26; STR table of contents | Out of v1 scope. The POS slice must read STR Chapter XIV-AA when it starts. |
| 3.7 | Record retention for invoices | — | Invoices, credit notes and debit notes kept for 6 years (r.150S(1)–(2)) | CHECKED | STR Chapter XIV | Compare 6.2. |

## 4. Input tax, s.73, returns, payments

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 4.1 | s.8 inadmissible input (E `ST-INPUT-INADMISSIBLE`) | Manual adjustment | s.8(1): (ca) where the supplier has not deposited the tax; (d) fake invoices; (f) not related to taxable supplies; (m) invoices without the buyer's NIC/NTN under s.23; and others | CHECKED | STA s.8 (30.06.2026 version) | A manual adjustment is right. A proposal for (m) is possible from the supplier STRN or NTN snapshot. |
| 4.2 | s.8B cap (`ST-8B-CAP`) | Pack percentage | "shall not be allowed to adjust input tax in excess of ninety per cent of the output tax for that tax period". Not applied to fixed assets or capital goods. Treatment and carry-forward of input not adjusted: s.8B(2); yearly adjustment or refund: s.8B(3). FA 2026 adds a proviso allowing the limit to be raised or lowered. | CHECKED (90%); CORRECT TO "exclude capital goods" | STA s.8B; Salient Features 2026-27 | Input on capital goods must be outside the cap in E C-23. Keep the percentage as a dated pack value. |
| 4.3 | Carry-forward of excess input (`ST-INPUT-CF`) | Computed | s.10 proviso: excess input on supplies that are not zero-rated "may be carried forward to the next tax period" | CHECKED | STA s.10 | |
| 4.4 | s.73 bank payment threshold (`cash_payment_warn_limit` 50,000; C C-29) | Rs 50,000 | Transactions over Rs 50,000 must be paid through a banking channel (crossed cheque, draft, pay order or online transfer between business accounts). Utility bills excluded. Credit purchases to be paid within 180 days. Otherwise there is no input tax claim, refund or zero-rating. FA 2025 rewrote s.73(4) (Board may cap input on supplies to unregistered persons). | UNCLEAR (value matches secondary sources) | Secondary: https://pkrevenue.com/government-mandates-banking-channels-for-sales-tax-transactions-above-rs-50000/ ; s.73(4): Circular 02/2025-26 | The s.73 text was cut off in the FBR PDF. Add a 180-day unpaid-bill proposal to E. |
| 4.5 | ITO cash limits (packs §4.1, 250,000 s.21(l)) | Rs 250,000 | Not read. FA 2025 adds **s.21(s)**: 50% of the expenditure attributable to a sale is disallowed when the single invoice is Rs 200,000 or more and payment is not through banking or digital channels (cash deposited into the seller's bank counts as banking). FA 2025 also adds **s.21(q)**: 10% of expenditure on purchases from non-NTN holders is disallowed. | UNCLEAR (250k); CORRECT TO add 200k receipt limit plus NTN warning | FBR Circular 01/2025-26 (Income Tax) https://download1.fbr.gov.pk/Docs/2025841183918948CircularNo01of2025-26IncomeTax.pdf | Add `cash_receipt_warn_limit` = 200,000 (B receipts, D money in). C warns when a supplier has no NTN. |
| 4.6 | Return due dates and frequency (E C-8, D-35) | MONTHLY | Monthly. Payment by the 15th; e-filed return by the 18th of the next month. The monthly return is "Annexure C". CNG sellers file quarterly. Manufacturers file an annual return by 30 September. | CHECKED | FBR "Sales tax due dates" https://fbr.gov.pk/sales-tax-due-dates/51148/101162 ; https://fbr.gov.pk/categ/file-sales-tax-return/51148/50849/101159 | Add the due days (15 payment, 18 filing) to the box set for E's calendar. |
| 4.7 | Annex A and Annex C structure, IRIS import template (E C-17) | Annex-A (purchases, supplier STRN) and Annex-C (sales, FBR invoice number) | FBR page names only "Annexure C". The import template was not found. | UNCLEAR | As 4.6 | With Digital Invoicing, sales annex data is pre-filled from FBR invoices. Confirm whether IRIS still takes an Annex-C upload for integrated sellers before building the writer. |
| 4.8 | CPR and PSID (D C-23, D-74) | Reference on tax deposits | PSID (Payment Slip ID) is generated to pay. After payment a CPR (Computerized Payment Receipt) is issued by e-mail and SMS and kept in IRIS 2.0. | CHECKED | FBR press release "FBR introduces new payment creation system" https://www.fbr.gov.pk/fbr-introduces-new-payment-creation-system/174167 (about Nov 2024) | Store both: the PSID before payment, the CPR after. Certificates and s.165 statements cite the CPR. |

## 5. Income-tax withholding (ITO 2001)

All rates in this section are shown as filer (ATL) % / non-filer (non-ATL) %.

| # | Item | Our value | Verified value (TY2027, from 1-7-2026) | Status | Source | Note |
|---|---|---|---|---|---|---|
| 5.1 | s.153(1)(a) goods (`PK-WHT-153-GOODS`, 2750) | No rate; `rate_hint` | Companies 5 / 10; others 5.5 / 11; toll manufacturing companies 9 / 18, others 11 / 22; rice, cotton seed and edible oil 1.5 / 3 | CHECKED | FBR WHT Rate Card TY2027 (FA 2026) https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf ; TY2026 card the same http://download1.fbr.gov.pk/Docs/20258181281745641WHT-RateCard.pdf | Rate hints split by filer status and company or other. |
| 5.2 | s.153(1)(b) services (`PK-WHT-153-SVC`, 2755) | No rate | Certain services 7 / 14 (TY2026: 6 / 12); IT and ITeS 4 / 8; independent professionals 15 / 30 (new); terminal and port (companies) 12 / 24 (new); media advertising 1.5 / 3; other services 14 / 28 (TY2026: 15 / 30) | CHECKED | Same cards; Circular 01/2025-26 (TY2026 change 4% to 6%) | Rates change every year, so rate hints need a valid-from. Offer sub-codes per category. |
| 5.3 | s.153(1)(c) contracts | No code | Companies 7.5 / 15; others 8 / 16; sportspersons 15 / 30 | CHECKED | Same cards | Add `PK-WHT-153-CONTRACT` (on account 2750 or a new one). It is in the official list and common for SMEs. |
| 5.4 | Withholding base: net of sales tax? (`base_type` NET_OF_SALES_TAX default) | Default net of sales tax, editable | The rate card says "gross amount payable" and doesn't define whether sales tax is included. Not confirmed. | UNCLEAR | Rate cards; ICAP note (silent) | Keep it editable. Ask the lead to confirm against ITO s.153 or the Rules (common practice: sales tax excluded where it is shown separately by a registered supplier). |
| 5.5 | s.155 rent (`PK-WHT-155`, 2751) | Slab rates | Individuals and AOPs: up to 300k nil; 300k–600k 5% of the excess; 600k–2m Rs 15,000 + 10%; over 2m Rs 155,000 + 25%. Companies 15 / 30. | CHECKED | WHT Rate Card TY2027 | |
| 5.6 | s.149 salary | Tag or account only (`WHT_PAYABLE`) | Slabs from 0% up to Rs 600k, to 35% over Rs 7m (TY2027) | CHECKED (account only) | WHT Rate Card TY2027 | Amounts belong to the HR & Payroll provider. |
| 5.7 | s.151 profit on debt (D C-22) | Withholding by the bank on money in | Bank or financial-institution profit 20 / 40; government securities to non-individuals 20 / 40; other 15 / 30; sukuk 25/50, 12.5/25, 10/20 | CHECKED | WHT Rate Card TY2027; Circular 01/2025-26 (15% to 20%, non-filer rate doubled from TY2026) | For companies it is adjustable (regime ADJUSTABLE). |
| 5.8 | s.165 statements | E summary; statement later | Quarterly, by the 20th of the month after the quarter (20 Apr, Jul, Oct, Jan), since Finance Act 2020. Salary also has an annual statement under s.165(6). | UNCLEAR (secondary) | https://pkrevenue.com/period-for-filing-withholding-tax-statement-reduced/ ; ICAP note (older half-yearly rule) | ITO text cut off at s.3. Quarterly is the generally known current rule. |
| 5.9 | Certificates | Later (E / H-PK) | s.164 certificates not read | UNCLEAR | — | Out of v1. |
| 5.10 | Customer-side withholding (`PK-WHT-BY-CUST`, 1620) | WITHHOLDING SALES, adjustable | Same s.153 rates apply to us as a payee | CHECKED (concept) | Rate cards | |

## 6. Companies Act 2017, SECP, tax year

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 6.1 | Books of account s.220 | Generic A0 ledger | s.220 "Books of account, to be kept by company" (title only read) | UNCLEAR | Companies Act 2017 (SECP, updated 18-08-2022) https://www.secp.gov.pk/document/the-companies-act-2017-updated-18-aug-2022/?wpdmdl=45422 (table of contents only) | |
| 6.2 | Retention period | — | Generally cited as at least 10 years under the Companies Act (not read). Sales tax: 6 years (r.150S). | UNCLEAR (CA); CHECKED (ST 6 years) | As 6.1; STR Chapter XIV | Use the longer period, 10 years, as the purge floor for PK companies. |
| 6.3 | Financial reporting framework (A3 §3.1 PK row; D-102) | "Companies Act 2017 / IFRS for SMEs" | Listed: IFRS (Fourth Schedule). Public-interest, large and large foreign: IFRS (Fifth Schedule). Medium: IFRS for SMEs. Small: ICAP's revised AFRS for SSEs. A higher framework may be chosen. | CORRECT TO class-based | IFRS Foundation Pakistan profile (11-07-2024) https://ifrs.org/use-around-the-world/use-of-ifrs-standards-by-jurisdiction/view-jurisdiction/pakistan | The Third Schedule sets the size classes (thresholds not read). The layouts are the same for all classes; only the label and the notes change. |
| 6.4 | Financial year and tax year (A3; PK July–June) | Default July–June | Tax year: 12 months ending 30 June, named after that calendar year. A special tax year is allowed with the Commissioner's order (s.74(1)–(2)), or for a class by FBR notification (s.74(2A)). The company's financial year is its own reporting period (CA s.2(34)), at most 1 year unless the registrar allows longer. | CHECKED | https://pkrevenue.com/fbr-normal-special-tax-year-rules-2027/ (describes FBR's s.74); ITO 30.06.2026 s.2(68) (table of contents; refers to s.74(1)); SECP Accounts page https://www.secp.gov.pk/company-formation/running-a-company/accounts/ | July–June is right as a default. Allow other year-ends (special tax year, e.g. banks and sugar companies). |
| 6.5 | Audit thresholds | — | Private companies and SMCs with paid-up capital up to Rs 1m (not subsidiaries of public companies) file unaudited statements. The SECP page also says Rs 10m and Rs 7.5m in places; it contradicts itself. AGM within 120 days of year-end. | UNCLEAR | SECP Accounts page (above) | Note only. |

## 7. Chart roles (PK@2026.2)

| # | Item | Our value | Verified value | Status | Source | Note |
|---|---|---|---|---|---|---|
| 7.1 | Sales tax payable and receivable | 2700 output (federal), 2701 provincial, 2702 further tax, 2705 RC; 1600 and 1601 input, 1605 RC input | Federal (FBR) and the four provinces file separate returns | CHECKED (structure) | Rows 1.1, 2.1–2.4 | Further tax is output tax on the FBR return (s.3(1A)). Its own account 2702 is fine. |
| 7.2 | `ST_WITHHELD_BY_CUSTOMER` 1625; `NON_ADJUSTABLE_TAX` 7798 (PK-3) | As designed | Eleventh Schedule withholding by the buyer reduces the seller's payable. 7798 depends on the credit-note window (row 3.4). | CHECKED (concept) | 1.10, 3.4 | |
| 7.3 | WHT payable per section and authority (PK-4): 2750 s.153(1)(a), 2755 s.153(1)(b), 2751 s.155, 2752 Eleventh Schedule, 2756–2759 provincial | As designed | Deposits are made per section (CPR) and per province | CHECKED | 4.8, 5.x, 2.5 | Add an s.153(1)(c) contracts code (5.3). It can share 2755 or get its own account. |
| 7.4 | EOBI payable 2770 / expense 5400 (PK-2, D-85) | `EMPLOYER_CONTRIB_PAYABLE` | EOBI is federal (Employees' Old-Age Benefits Institution) | CHECKED (naming; rates not checked) | — | Rates are the HR & Payroll provider's. |
| 7.5 | PESSI, SESSI, KP ESSI, BESSI 2771 / 5410 (PK-1) | `PROVINCIAL_SS_PAYABLE` / `_EXPENSE` | Provincial social security institutions, so payees are per province | CHECKED (naming) | — | Needs a provincial counterparty; matches REQUIRED. |
| 7.6 | WWF and WPPF | Note only | WWF (2% of total income) and WPPF (5% of profit) became provincial after the 18th Amendment in some provinces | UNCLEAR | Not verified from official sources | Note only. When added, use one accrual and payable account per fund, provincially tagged. |
| 7.7 | Country flags §4.1: `tax_on_advances` yes, `bad_debt_relief` no, `settlement_discount_reduces_tax` yes, `tax_point_basis` TAX_POINT, `late_document_rule` NEXT_RETURN, payment reference NONE | As listed | Not checked against the STA s.2 definitions (time of supply s.2(44), value s.2(46)), which are in the readable part but were not quoted | UNCLEAR | — | Next pass: quote s.2(44) and s.2(46). |
