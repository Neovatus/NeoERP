# Pakistan professional checks: T1, L6, R8, retention (2026-10-31)

Settles the Pakistan open items in `codex-decisions-2026-10-31.md` (T1, L6, R8) and the PK retention rows of `codex-research-triage.md`. Only official texts were relied on: FBR consolidations and SRO PDFs, the Pakistan Code (Ministry of Law) copy of the Companies Act, and IFRS Foundation texts. Where an official text could not be fetched, this says so.

**Confidence labels.** **Verified text** means the provision was read in the official document cited. **Secondary only** means it was not read in an official text.

Sources read:

| Key | Document | Where |
|---|---|---|
| ITO | Income Tax Ordinance 2001, FBR Income Tax Manual Part I, "amended upto 30th June, 2026" | https://download1.fbr.gov.pk/Docs/2026724177725705IncomeTaxOrdinanace2001.pdf |
| STA | Sales Tax Act 1990, FBR consolidation "updated upto 30.06.2026" | https://download1.fbr.gov.pk/Docs/20267171373418951SalesTaxAct1990updatedupto30.06.2026.pdf |
| STR | Sales Tax Rules 2006, FBR consolidation "Updated up to 31st July, 2026" | https://download1.fbr.gov.pk/Docs/202691810951482SalesTaxRules.pdf |
| SRO 1852 | S.R.O. 1852(I)/2025, 24 Sep 2025 (scanned; table read from the page image) | https://download1.fbr.gov.pk/SROs/2025924149054920SRO1852.pdf |
| SRO 1666 | S.R.O. 1666(I)/2026, 29 Sep 2026 (scanned; read from the page images) | https://download1.fbr.gov.pk/SROs/202693089244653SRO1666dated29-09-2026.pdf |
| SRO 1667 | S.R.O. 1667(I)/2026, 29 Sep 2026 (Federal Excise Rules r.12A) | https://download1.fbr.gov.pk/SROs/2026930892656859SRO1667dated29-09-2026.pdf |
| STGO 1/26 | Sales Tax General Order 01 of 2026 (IR Operations), 30 Mar 2026 | https://download1.fbr.gov.pk/Docs/2026331133557466STGO01of2026.pdf |
| DI API | PRAL "Technical Specification for DI API" v1.12 (issued 7 Apr 2025, last update 24 Jul 2025) | https://download1.fbr.gov.pk/Docs/20257301172130815TechnicalDocumentationforDIAPIV1.12.pdf |
| CA | Companies Act 2017, Pakistan Code PDF, "Updated till 7.10.2022" | https://pakistancode.gov.pk/pdffiles/administrator89de324eeaa53c96ff701820d2e007e4.pdf |
| IFRS-PK | IFRS Foundation jurisdiction profile, Pakistan (profile last updated 11 Jul 2024) | https://www.ifrs.org/use-around-the-world/use-of-ifrs-standards-by-jurisdiction/view-jurisdiction/pakistan/ |
| SME4/5 | IFRS Foundation SME training modules 4 and 5 (they quote the 2015 IFRS for SMEs §4.2, §5.5 and §5.11) | https://www.ifrs.org/content/dam/ifrs/supporting-implementation/smes/module-04.pdf, `module-05.pdf` |

**Not reachable.** Every secp.gov.pk URL returns a Cloudflare challenge or a 403 to automated fetches. That includes the "Updated 3rd Schedule to the Companies Act 2017 – 29-12-2025" and SECP's own Act consolidation. The ICAP Revised AFRS for SSEs text and ICAP's guidance on minimum and final tax as levies were not found either. A person can download the SECP files in a browser; this does not need an accountant.

---

## T1: s.153 withholding base

### Decision

The s.153(1) base is the **gross amount payable, including sales tax**. This holds for all three clauses: (a) goods, including toll manufacturing; (b) services; and (c) contracts. It applies to the 12 s.153 codes and to `PK-WHT-BY-CUST`, which mirrors s.153 from the payee's side.

The codex triage proposed GROSS for **s.155 rent (T-10)**. This check does **not** confirm that. The s.155 base is the "gross amount of rent", which does not include sales tax. Keep `NET_OF_SALES_TAX` on `PK-WHT-155`: on a rent bill with no sales tax, net and gross are the same.

### Text (verified)

- **ITO s.153(1), printed pp.328–329.** The opening words, clauses (a), (b) and (c), and then one set of closing words common to all three clauses:
  > "shall, at the time of making the payment, deduct tax from the gross amount payable (including sales tax, if any) at the rate specified in Division III of Part III of the First Schedule"
  - Because the words "(including sales tax, if any)" close the whole sub-section, the base is the same for (a), (b) and (c).
  - The First Schedule, Part III, Division III restates every rate as "% of the gross amount payable": goods 5 / 5.5 %, toll manufacturing 9 / 11 %, rice, cotton seed and edible oils 1.5 %, and the services and contracts rates (printed pp.542–543).
- **Origin of the words.** Footnote 1 on p.327 reads: "Section 153 substituted by the Finance Act, 2011." The words "(including sales tax, if any)" carry no later footnote, so they are part of the Finance Act 2011 text. The footnote also reproduces the pre-2011 section, which had a separate sub-section (2) for goods only: "The gross amount payable for a sale of goods shall include the sales tax, if any, payable in respect of the sale." Before 2011, services and contracts had no express inclusion. Since tax year 2012 (payments from 1 July 2011), all three clauses do.
  - *Evidence limit:* this comes from FBR's consolidation and its footnotes. The Finance Act 2011 gazette was not read.
- **Other bases in s.153 (verified).**
  - s.153(2), exporters paying for stitching, dyeing and similar services: "gross amount payable", with no sales-tax words. Treat it as GROSS. It is not a code we carry.
  - s.153(2A), e-commerce payment intermediaries and couriers (Finance Act 2025): "gross amount payable (including sales tax, if any)".
- **Thresholds (verified).** No deduction where payments in a financial year are below Rs 75,000 in aggregate for goods, or Rs 30,000 for services. There is no threshold for contracts. These are later rate-hint and warning work, not base logic.
- **s.155(1) (verified, printed p.339).** "shall deduct tax from the gross amount of rent paid". Rent includes "rent of furniture and fixtures, and amounts for services relating to such property". The Explanation adds the amounts in s.16(1) and (3) (non-adjustable or forfeited amounts). There are no sales-tax words.
  - Excluding sales tax from rent rests on reasoning, not explicit text: Parliament wrote "(including sales tax, if any)" into s.153 and s.153(2A) but not into s.155, and provincial sales tax on renting is a tax, not rent. Confidence is moderate.
- **FBR circular.** No FBR circular on the Finance Act 2011 change to s.153 was found (searched fbr.gov.pk and download1). The statute is clear, so none is needed.

### Why MJ-4 differs

MJ-4 is a finding in our own lead review, `docs/drafts/accounts/ACCOUNTS-LEAD-REVIEW.md` §MJ-4. It is not an outside accountant's opinion.

- **What it claimed.** For s.153(1)(a) "and in practice (b) services", income-tax withholding is on the gross amount "**excluding sales tax**".
- **It was never checked.** The finding itself says "(verify the current FBR guidance and the Finance Act)", and that check was never done. `accounts-packs-2026-2.md` PK-5a still marks the base "*(verify)*". `accounts-b.md` C-21 then records it as fact: "The s.153 base excludes sales tax (accountant MJ-4)".
- **Likely causes.** It mixes up two different withholdings, and probably reflects other countries' VAT practice:
  - Sales-tax withholding under the Eleventh Schedule really is on the tax amount. MJ-4 handled that correctly with `SALES_TAX`.
  - Income-tax withholding under s.153 has been on the tax-inclusive gross since 2011. MJ-4 got this wrong.

### Required changes (V40 and contracts)

**Data, V40.** Following T-01:
- Set `base_type = 'GROSS'` on `PK-WHT-153-GOODS`, `-GOODS-CO`, `-GOODS-OTHER`, `-SVC`, `-SVC-CERTAIN`, `-SVC-IT`, `-SVC-MEDIA`, `-SVC-OTHER`, `-SVC-PORT`, `-SVC-PROF`, `-CONTRACT` and `PK-WHT-BY-CUST`. Apply it to the templates and to guarded PACK copies.
- **Do not** change `PK-WHT-155`; it stays `NET_OF_SALES_TAX`. This corrects T-10's fix line. Keep T-10's slab `side_note` and add: "base = gross rent incl. furniture/fixtures and property services, excl. sales tax".

**Our GROSS formula is already right.** GROSS = Σ allocated. A payment allocation settles the bill total, including any part withheld, so Σ allocated is the tax-inclusive gross amount payable.

**Contract text to change (NeoERP-BackEnd `docs/api/`):**
- `accounts-b.md` C-21, rationale column: replace "The s.153 base excludes sales tax (accountant MJ-4)" with "The s.153(1) base is the gross amount payable including sales tax (ITO 2001 s.153(1), as substituted by Finance Act 2011)".
- `accounts-b.md` C-46 and LR-B17: same correction.
- `accounts-c.md`:
  - C-13
  - the worked example near line 794 ("s.153 base net of sales tax")
  - the SC4 built note, which says "s.153 `NET_OF_SALES_TAX`"
  - change-list row 12
  - D-24
  - LR-C10
- `accounts-packs-2026-2.md` PK-5a: "*(verify)*" → CHECKED, GROSS, citing ITO s.153(1).

**Tests and query:**
- Rename and flip `WithholdingBaseTest.s153DefaultBaseNetOfSalesTax` to assert GROSS.
- Check the net-base assertions in `PaymentApprovalTest.kt`.
- Before V40, query posted payments and receipts with `base_type = 'NET_OF_SALES_TAX'` on these codes, as T-01 says.

**Records:** mark MJ-4 in the lead review as superseded by this file.

**Human accountant:** not needed.

---

## L6: Pakistan statement face lines

### Which schedule and framework applies

**Schedule (verified, CA):**
- s.225(1): financial statements must follow the notified standards and "the requirements contained in the Third Schedule for different class or classes of companies".
- Third Schedule (Pakistan Code copy):
  - **Listed** companies → IFRS + **Fourth Schedule**.
  - **Every other class** → **Fifth Schedule**: non-listed public interest companies, large-sized (LSC), medium-sized (MSC) and small-sized (SSC) companies.
- Fifth Schedule title: "Disclosure requirements as to financial statements of non-listed companies and their subsidiaries".
- So the Fifth Schedule applies to every PK company we serve unless it is listed. The schedule follows listed or non-listed status, not company size.

**Framework by size (secondary only; the current SECP text was not readable):**

| Class | Framework | Thresholds (IFRS-PK profile, 11 Jul 2024) |
|---|---|---|
| Listed and public-interest companies | Full IFRS | — |
| LSC | Full IFRS | Paid-up capital ≥ Rs 200m, or turnover > Rs 800m, or ≥ 750 employees |
| MSC | IFRS for SMEs | Below the LSC thresholds |
| SSC | Revised AFRS for SSEs (ICAP) | Private, paid-up capital ≤ Rs 10m, turnover ≤ Rs 150m, ≤ 250 employees |

- A company may opt up to a higher framework.
- The 2022 Pakistan Code copy still shows a Rs 1bn turnover limit for LSC. SECP's 29-12-2025 update could not be read. Classification is based on the previous year's audited financial statements and changes only after two consecutive years (Third Schedule notes, verified).
- **Consequence for us:** keep the per-company framework choice (`IFRS` / `IFRS_SMES` / `AFRS_SSE`, already in `StatementWords.framework`). Do not try to classify companies automatically.

### Face-line rules (verified text)

**Fifth Schedule** (Fourth Schedule wording is the same, cl.11, 27 and 31):
- **Part I, para II.** Disclosures "shall be made in the notes to the accounts unless specifically required otherwise".
- **Part II, cl.6.** "Following items shall be disclosed as separate line items **on the face** of the financial statements":
  1. revaluation surplus on property, plant and equipment
  2. long term deposits and prepayment
  3. unpaid dividend
  4. unclaimed dividend
  5. cash and bank balances

  These five are the only items the statute expressly puts on the face.
- **cl.16.** Provisions for doubtful debts and impairment are shown "as a deduction from the gross amounts".
- **cl.17.** Capital and revenue reserves "shall be clearly distinguished"; reserves required by the Act are shown separately.
- **cl.20.** An amount due to an associated company is shown separately (non-current).
- **cl.21.** Current liabilities as "separate line items" (the word "face" is not used):
  - payable to provident fund
  - deposits, accrued liabilities and advances
  - loans from banks and other financial institutions, other than an associated company
  - loans and advances from an associated company, sponsors and directors
  - secured and unsecured shown separately
- **Part III, cl.25.** "Following items shall be disclosed as deduction from turnover as separate line items: (i) trade discount; and (ii) sales and other taxes directly attributable to sales." Again "face" is not used, so a turnover note satisfies it.

**IFRS for SMEs 2015** (verified via SME4/5):
- **§4.2** minimum balance-sheet lines include:
  - cash and cash equivalents; trade and other receivables; other financial assets; inventories; PPE; intangibles
  - investments in associates and in jointly controlled entities
  - trade and other payables; other financial liabilities; current tax assets and liabilities
  - deferred tax, which is **always non-current**
  - provisions; non-controlling interest; owners' equity
- **§5.5** minimum income-statement lines: revenue; finance costs; equity-method share; tax expense; discontinued operations as a single amount; profit or loss; each item of other comprehensive income (OCI); total comprehensive income.
- **§5.11** expenses are analysed **either** by nature **or** by function.

**Not read:** AFRS for SSEs (ICAP) text. Note also that the 2025 third edition of IFRS for SMEs (effective 2027) has not been adopted in Pakistan per IFRS-PK. Re-check when SECP notifies it.

### Comparison with our PK layouts

These are `PL_NATURE_GP` and `BS_IFRS` (V13 and V23), the `pk.csv` chart, and `StatementWords`.

| Requirement | Ours today | Gap |
|---|---|---|
| Revaluation surplus on PPE, face (cl.6(i)) | 2045 "Revaluation reserve" is `RESERVE`, merged into one EQUITY section with 2048 and the rest | **Gap** |
| Long-term deposits and prepayments, face (cl.6(ii)) | 1390 "Long-term security deposits" is `OTHER_RECEIVABLE` and lands in **current** assets; there is no long-term prepayment account | **Gap** (and misclassified) |
| Unpaid dividend / unclaimed dividend, face (cl.6(iii)–(iv)) | One account, 2800 "Dividends payable", is `OTHER_PAYABLE` within current liabilities | **Gap**: needs two lines |
| Cash and bank balances, face (cl.6(v)) | `CASH_AND_BANK` subsection exists | Caption only: "Cash and bank balances" |
| Capital vs revenue reserves (cl.17) | Share capital, premium, reserves and retained earnings are all in one EQUITY bucket | Gap at line level |
| Provident fund payable; deposits, accruals and advances; bank loans; associated, sponsor and director loans (cl.20–21) | Accounts exist (2910, 2450, 2900, 2220/2300/2380, 2250), but the subtypes merge them | Note-level gap: line data must be separable |
| Turnover deductions: trade discount, sales and other taxes (cl.25) | 3080 / 3090 are `REVENUE_DEDUCTION`, netted into `REVENUE`. Sales tax is never in revenue: output tax posts to 2700–2706 | Turnover-note gap |
| Deferred tax non-current (§4.2(o)) | Yes | OK |
| Current/non-current split (§4.4) | 1380/1390 → current, 1800 short-term investments → **non-current**, 2290 long-term → **current** (codex A1–A3, confirmed) | **Gap** |
| Expense analysis nature **or** function (§5.11) | "Cost of sales" + "Gross profit" (function words), but cost of sales holds only the `COST_OF_SALES` goods/material subtype. Production payroll and depreciation sit below it, by nature | Mixed: fine for traders, misleading for manufacturers |
| OCI and total comprehensive income (§5.5(g)–(i)) | None. A revaluation posts straight to 2045 | Gap where revaluation is used |
| Captions | "Profit/(loss) before tax", "Profit/(loss) for the year" | Pakistani wording is "Profit/(loss) before taxation" and "Taxation" |

### Decision: what the PK statements must contain

Use one new layout pair, `BS_PK` and `PL_PK`, added by forward migration. This keeps the BASE layout `BS_IFRS` unaffected. The same layout serves every framework; framework wording stays in `StatementWords`.

**Balance sheet (statement of financial position):**

*Non-current assets*
1. Property, plant and equipment (right-of-use assets may be shown within it or as their own line)
2. Intangible assets
3. Long-term investments (subsidiaries, associates and JVs separately when held)
4. Long-term loans and advances (1380)
5. **Long-term deposits and prepayments** (1390 plus a new long-term prepayment account) — statutory face line
6. Deferred tax asset

*Current assets*
1. Stores, spares and stock-in-trade (inventories)
2. Trade debts, net of the loss allowance (cl.16)
3. Loans and advances
4. Trade deposits and short-term prepayments
5. Other receivables
6. Short-term investments (1800, moved to **current**)
7. Tax refunds due from the government (sales tax 1600–1640; income tax)
8. **Cash and bank balances** — statutory face line

*Equity*
1. Share capital (owner's capital for sole proprietors)
2. Capital reserves (share premium and reserves required by the Act)
3. Revenue reserves / unappropriated profit (retained earnings and the current-year result)
4. **Surplus on revaluation of property, plant and equipment** — statutory face line, outside the reserves

*Non-current liabilities*
1. Long-term financing (2220)
2. Lease liabilities (2230)
3. Loans from associated companies, sponsors and directors (2250; cl.20)
4. Deferred liabilities (staff gratuity 2100)
5. Deferred tax liability
6. Other long-term liabilities (2290, moved to **non-current**)

*Current liabilities*
1. Trade and other payables. The note shows payable to provident fund; deposits, accrued liabilities and advances; and sales tax and withholding payable.
2. **Unpaid dividend** — statutory face line
3. **Unclaimed dividend** — statutory face line
4. Short-term borrowings (banks)
5. Current portion of long-term liabilities
6. Taxation (provision net of advance tax, §4.2(n))
7. Provisions (current)

**Profit and loss.** The default is by nature (§5.11 allows it, and it works without a cost-allocation engine):
1. Revenue – net. A turnover note shows gross turnover, less trade discounts (3080), less sales returns (3090), less sales tax and other taxes attributable to sales (cl.25). The tax figure comes from output tax and federal excise duty (FED) on sales documents for the period.
2. Other income.
3. Cost of goods and materials consumed. This is the same line as today, but labelled "Cost of sales" only when the company says its cost of sales is purchased goods (traders).
4. Gross profit is shown only in that trader case. It is an additional subtotal allowed by §5.9.
5. Employee benefits.
6. Depreciation and amortisation.
7. Other operating expenses.
8. Operating profit.
9. Finance cost.
10. Share of profit of associates (only when used).
11. Profit before taxation.
12. Taxation.
13. Profit/(loss) for the year.
14. Other comprehensive income: surplus on revaluation of PPE (only when it moved).
15. Total comprehensive income.

A function layout, which Pakistani manufacturers expect, is later scope. It has: cost of sales including production payroll, depreciation and overheads; distribution costs; administrative expenses; other expenses; other income. Until it exists, do not show "Gross profit" for manufacturers.

**Statutory flag.** Until the five cl.6 face lines and the maturity fixes exist, PK statements must not be described as statutory: the `STATUTORY_LAYOUT` flag stays off for PK.

### Required data and document changes

- **Chart (next pack version plus forward migration, in the A1–A3 classification-fix batch):**
  - rename 2045 to "Surplus on revaluation of property, plant and equipment" and give it its own subtype, for example `REVALUATION_SURPLUS`
  - give 1390 and a new long-term prepayments account a non-current subtype, for example `LONG_TERM_DEPOSIT`
  - make 1380 non-current; make 1800 current; make 2290 non-current
  - split 2800 into "Unpaid dividend" (2800) and "Unclaimed dividend" (a new code in group 28)
  - add the `pk.csv` subtype mappings for these
- **Layouts:** add `BS_PK` and `PL_PK` (sections above) and switch the PK pack selection to them. `BS_IFRS` / `PL_NATURE_IFRS` stay for BASE.
- **Words:** in `StatementWords`, for the PK layouts:
  - "Cash and bank balances", "Profit/(loss) before taxation", "Taxation"
  - "Unappropriated profit" for revenue reserves
  - "Surplus on revaluation of property, plant and equipment"
- **Contracts:** in `accounts-a3.md` and `accounts-packs-2026-2.md` §2.4, record the PK layout, the cl.6 face-line rule, and the turnover note (cl.25).
- **Close the A10 row** in `codex-layouts-refs-triage.md`. It is now decided, not "accountant checks".

### Still for a human Pakistani accountant (texts not obtainable)

1. **AFRS for SSEs (ICAP) presentation.** Only SSCs are affected. The Fifth Schedule face lines above apply to them regardless.
2. **ICAP guidance on minimum and final taxes** (for example s.153 minimum tax and the final-tax regimes). The question is whether these must be shown as a separate "levies" line above "Profit before taxation". The guidance text was not found, so no line is decided here.

Confirming the current SECP Third Schedule thresholds (29-12-2025) only needs someone to download the PDF in a browser.

---

## R8: SRO 1666(I)/2026 and FBR Digital Invoicing scope

### What each instrument does (verified text)

**SRO 1852(I)/2025, 24 Sep 2025 ("who and when").** It is issued under r.150Q(2) and supersedes SRO 1413(I)/2025 of 1 Aug 2025. Every sales-tax-registered person must register, test and issue e-invoices through PRAL or a licensed integrator by these dates (read from the scanned page image):

| # | Category (turnover declared in sales tax returns, last 12 months) | Registration | Testing | E-invoices from |
|---|---|---|---|---|
| 1 | All public companies | 15 Oct 2025 | 25 Oct 2025 | 1 Nov 2025 |
| 2 | Other companies, turnover > Rs 1bn | 15 Oct 2025 | 25 Oct 2025 | 1 Nov 2025 |
| 3 | All importers | 15 Oct 2025 | 25 Oct 2025 | 1 Nov 2025 |
| 4 | Other companies, Rs 100m < turnover ≤ Rs 1bn | 25 Oct 2025 | 31 Oct 2025 | **15 Nov 2025** |
| 5 | Other companies, turnover ≤ Rs 100m | 15 Nov 2025 | 25 Nov 2025 | 1 Dec 2025 |
| 6 | Individuals and AOPs, turnover > Rs 100m | 10 Oct 2025 | 25 Oct 2025 | 1 Nov 2025 |
| 7 | All other registered persons | 10 Dec 2025 | 25 Dec 2025 | 31 Dec 2025 |

- The turnover figures only set the phase. **There is no exemption threshold**: row 7 covers everyone else, and every date has passed.
- The research triage recorded a secondary source giving "1 Dec for the mid band". That was wrong: row 4 is **15 Nov 2025**.

**r.150Q(3), from SRO 2071(I)/2025 of 3 Nov 2025** (STR consolidation, verified). Retailers must also integrate where their deductible withholding tax under s.236G or s.236H for the immediately preceding period exceeds Rs 100,000 or Rs 500,000 respectively. This is for STA s.2(43A)(g), the Tier-1 retailer definition.

**SRO 1666(I)/2026, 29 Sep 2026 ("how"; it amends the Chapter XIV rules).**
- **Scope dates and thresholds: unchanged.** It does not touch SRO 1852.
- **Start date:** none is stated, so it applies from notification (29 Sep 2026).
- **Changes:**
  - **r.150Q(4)–(5).** Chapter XIV now also applies to persons required to e-invoice under the **Federal Excise Act 2005** and to **Islamabad Capital Territory (Tax on Services) Ordinance 2001** services. A person already integrated needs no separate technical integration.
  - **r.150R(13).** New invoice particulars (aa)–(ff): FED type, FED rate, price per unit for FED, FED amount payable otherwise than in sales-tax mode, FED SRO/Schedule reference, and FED SRO/Schedule serial number.
  - **r.150S(1) provisos.** Where FED applies, the invoice carries the FED particulars. Where sales tax, FED and ICT services tax fall on one transaction, **one e-invoice** with separately identifiable particulars per tax is enough. How each levy is collected and returned is unchanged.
  - **r.150S(2), substituted.** "The debit note, credit note **and advance receipt invoice** shall also be issued electronically and retained for a period of six years". Advance receipt invoices are new.
  - **r.150U(3).** For FED and ICT persons, audit and records access follow the respective law.
  - **r.150X.** Penalties extended to production and provided services, under the STA, FED Act s.19 and the ICT Ordinance.
  - **r.150XD(2), substituted.** Where an integrated person generates or transmits an invoice with a QR code or FBR number but does not account for it in **Annex-C or the sales in its return**, the officer computes and recovers the tax. The only exception is an invoice "cancelled through a mechanism legally approved".
  - **r.150XE(4).** An integrator licence also covers FED and ICT integration.
  - **r.150XL.** New sub-rule: invoice data may include sales tax, ICT services tax and FED, "separately identifiable by tax type and mode".
  - **r.150XQ.** The Commissioner recovers the tax on the enforcement network's report.
  - The r.150XL and r.150XQ items were read from the OCR text layer, because the bottom of page 2 is not in the rendered crop. Their substance is clear.

**SRO 1667(I)/2026, same date.** Inserts Federal Excise Rules r.12A:
- Chapter XIV applies *mutatis mutandis* to FED invoices under FED Act s.18(5).
- Anyone already integrated for sales tax is deemed integrated for FED.
- One invoice covers both levies.

**Other rules in force (verified, STR and STGO 1/26):**
- **r.150XC.** Offline-mode invoices (internet or power failure) must be marked as offline and uploaded within 24 hours of restoration.
- **r.150S(1).** E-invoices are kept 6 years on electronic media.
- **r.150T.** Storage must re-create the information as it was at original transmission.
- **STGO 01 of 2026 (30 Mar 2026).** An integrated person may cancel, delete or edit a valid e-invoice generated by bona fide mistake **only through FBR's system within 72 hours**. After that it needs the Commissioner's prior approval. More than one licensed integrator may be engaged.
- **SRO 288(I)/2026 (18 Feb 2026).** Reported by a secondary source as refining the DI rules. It is not cited in the STR consolidation to 31 Jul 2026, and it was not read.

### API spec location (verified)

- **Document:** PRAL "Technical Specification for DI API" **v1.12**, issued 7 Apr 2025, last updated 24 Jul 2025 (FBR link above). No newer version was found on FBR. PRAL's DICRM downloads page (`dicrm.pral.com.pk/downloads`) is rendered by script and did not load; search snippets show it also lists v1.12.
- **Endpoints:**
  - post: `https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata`
  - validate: `…/validateinvoicedata`
  - sandbox: `_sb` suffix on each
  - reference lists: `gw.fbr.gov.pk/pdi/v1/…` and `pdi/v2/…` (provinces, document types, HS-UoM, SRO items, rates)
  - registration type: `dist/v1/Get_Reg_Type`
  - ATL status: `dist/v1/statl`
- **v1.12 predates SRO 1666:**
  - It has `fedPayable` but none of the new FED fields (aa)–(ff).
  - Its document types are only "Sale Invoice" (id 4) and "Debit Note" (id 9, which needs `invoiceRefNo` and a reason). It has **no credit note and no advance receipt invoice** type.
  - Expect a new PRAL version. Re-check before the PK build starts.

### Decision and required changes

1. **Scope is settled.** Every PK sales-tax-registered company must fiscalise now, and so must Tier-1 retailers under r.150Q(3). This confirms B C-34 / VB-2 "every PK company with an STRN".
   - Replace the "SRO 709(I)/2025" scope citation with "SRO 1852(I)/2025 (table above; supersedes SRO 1413(I)/2025) + r.150Q(3)".
   - Drop "Phase dates stay *(verify)*".
   - Close T-20.
   - Correct the research-triage row ("1 Dec for the mid band" → 15 Nov).
2. **Advance receipt invoices** (r.150S(2) as substituted) must be fiscalised. Our customer-advance flow (B advances, `CUSTOMER_ADVANCES` 2900) needs a document that goes through `FiscalProvider`. Add it to B C-34's list next to invoices, credit notes and supplementary invoices.
3. **Correcting accepted invoices.**
   - Add a "cancel at FBR" path for an ACCEPTED invoice within **72 hours** (STGO 1/26). After 72 hours, mark it as needing the Commissioner's approval, with no automatic cancellation.
   - Keep D-60's credit-note route for REJECTED invoices: they never got an FBR number, so nothing needs cancelling at FBR.
   - **E's PK return (Annex-C)** must include every ACCEPTED invoice that has not been cancelled at FBR. Otherwise r.150XD(2)(b) recovery applies. Add a close check: ACCEPTED invoices for the period must equal the Annex-C rows.
4. **Credit-note mapping to DI.** v1.12 has no credit-note document type. Before building `FbrDiFiscalProvider`, confirm in the PRAL sandbox and the next spec which document type a seller's reduction note uses (probably "Debit Note" id 9 with `invoiceRefNo`). This is a sandbox and spec question, not an accountant one. Record it in docout C-16.
5. **FED fields** (r.150R(13)(aa)–(ff)). These are needed only for tenants that charge FED. Add them to the docout C-16 field map as "when FED applies". FED is out of v1 pack scope, so not before a FED tenant.
6. **Offline mode** (r.150XC). Our C-34 blocks issue until ACCEPTED, so we never issue offline invoices. That complies but stops a counter sale during an outage. Record it as a deliberate choice in C-34. A POS offline mode with 24-hour upload is later scope.
7. **Retention of DI data.** Keep 6 years, electronic, reproducible as transmitted (r.150S, r.150T). ADR-020 already keeps the request and response pair as `ISSUED_DOCUMENT`. Set its retention class to at least 6 years after the tax period, and note that the company-law 10-year rule below dominates for companies.
8. **docout C-16.** Change "v1.12 … *(verify newer)*" to "v1.12 (7 Apr 2025, updated 24 Jul 2025) is the latest on FBR at 2026-10-31; predates SRO 1666; re-check before build", and add the endpoints above.

**Human accountant:** not needed.

---

## PK retention

### Text (verified)

| Law | Rule | Period and start | Extension | Place |
|---|---|---|---|---|
| **ITO s.174(3)** (FBR consolidation, printed p.370) | "accounts and documents required to be maintained under this section shall be maintained for **six** years after the **end of the tax year** to which they relate". "Five" became "six" by Finance Act 2010. | 6 years from the end of the tax year. A company's normal tax year is its July–June financial year, or a special tax year. | Proviso: where a proceeding is pending, keep the records "till final decision of the proceedings": assessment, amendment, appeal, revision, reference, petition, prosecution or ADRC. Proviso added by Finance Act 2022: **no limit** for records on income, assets, expenses or transactions under **s.111(2)(ii)** (unexplained investment or expenditure situated or incurred **outside Pakistan**, or foreign-source concealed income). | s.174(1): "maintain **in Pakistan**" unless the Commissioner authorises otherwise. |
| **STA s.24** (p.62) | "retain the record and documents for a period of **Six** years after the **end of the tax period** to which such record or documents relate". "Five" became "Six" by Finance Act 2010. | 6 years from the end of the tax period. The tax period is the month. | "or till such further period the final decision in any proceedings including … assessment, appeal, revision, reference, petition and … Alternative Dispute Resolution Committee is finalized" | s.22(1): at "business premises or registered office", in English or Urdu. |
| **STA s.22(1)** (pp.58–59) | What is kept: supplies, purchases, imports, zero-rated and exempt records, (da) double-entry sales tax accounts, (e) invoices, credit and debit notes, bank statements, banking instruments, inventory records, utility, salary and labour bills, cash book, rental, sale-purchase and lease agreements, (ea) gate passes and transport receipts, and **(eb) an electronic version** of all of these. | — | — | — |
| **STR r.150S** (Chapter XIV) | E-invoices, debit and credit notes and (since SRO 1666) advance receipt invoices: kept 6 years on electronic media, under STA s.24. r.150T: the stored data must re-create the original transmission. | as STA s.24 | as STA s.24 | — |
| **CA s.220(5)** (Pakistan Code copy, 7.10.2022) | "The books of account of every company relating to a period of not less than **ten financial years** immediately preceding a financial year … together with the **vouchers** relevant to any entry in such books of account shall be kept in good order." | Rolling: during FY N, keep FY N-10 to N-1. In effect, 10 full financial years after the end of the FY concerned. | — | s.220(1): at the **registered office**, or another place **in Pakistan** chosen by the board, with notice to the registrar within 7 days. s.220(3): where financial information is kept outside the country, copies must be kept and produced for directors to inspect. |
| **CA s.230** | **Not a retention rule.** It gives a holding company's representatives rights to inspect a subsidiary's books, and gives members the s.256 rights. | — | — | — |

**Evidence limit (CA).** The copy read is "Updated till 7.10.2022". SECP's newer consolidation could not be fetched (Cloudflare). No later amendment to s.220(5) is known to us, but this was not confirmed.

### Decision

Our retention rule for **PK companies**:

> purge date = the latest of: end of FY + 10 FYs (CA s.220(5)); end of tax year + 6 years (ITO s.174(3)); end of the monthly tax period + 6 years (STA s.24).

- For companies the Companies Act's 10 years always dominates.
- For sole proprietors and AOPs (not companies), only the 6-year tax rules apply.
- **Legal hold:** no purge while an income-tax or sales-tax proceeding is pending. This needs a per-company "proceedings pending until …" hold that covers the affected tax years and periods.
- **Indefinite hold** for records the company flags as relating to foreign assets, expenditure or income within s.111(2)(ii).

### Required changes

- `codex-research-triage.md` retention table, PK column: "10 FYs company (unverified)" → **"10 FYs after the FY (CA s.220(5)), books and vouchers; verified"**; "6y tax (unverified)" → **"6 years after the tax year (ITO s.174(3)) / tax period (STA s.24), extended while proceedings are pending; no limit for s.111(2)(ii) foreign items; verified"**.
- Replace the s.230 reference with s.220(1)/(3)/(5).
- Retention policy and purge jobs (decision 1 in the research triage), for PK:
  - a record-class period of **10 FYs for companies and 6 years for others**
  - a **proceedings legal hold**
  - an **indefinite hold flag** for s.111(2)(ii)
- DI records: as in R8 point 7.
- **Hosting (open, for Jabran).**
  - Three provisions require the records to be in Pakistan:
    - ITO s.174(1): "maintain in Pakistan"
    - CA s.220(1): registered office or another place **in Pakistan**
    - STA s.22: business premises or registered office
  - CA s.220(3) contemplates information kept outside the country only alongside copies kept for inspection.
  - So a PK tenant hosted only outside Pakistan needs either a copy available in Pakistan (for example an export or archive kept at the registered office) or the Commissioner's authorisation.
  - Whether a cloud copy reachable from Pakistan counts as "in Pakistan" is not answered by the text. That is a legal interpretation. Ask a Pakistani tax lawyer or accountant before the first PK tenant goes live. Until then, the product should offer a full export the company keeps in Pakistan.

---

## Summary of decisions

| Item | Decision | Confidence |
|---|---|---|
| T1 | s.153(1) base = gross amount payable **including** sales tax, the same for (a), (b) and (c). The words have been there since the Finance Act 2011 substitution. V40 sets GROSS on 12 codes. MJ-4 is overridden. s.155 rent stays NET_OF_SALES_TAX ("gross amount of rent" has no sales-tax words), so T-10's GROSS fix is dropped. | Verified text (ITO to 30.06.2026). The s.155 exclusion is reasoned from the absence of words. |
| L6 | Fifth Schedule (every non-listed class) / Fourth (listed) **face lines**: revaluation surplus, long-term deposits and prepayments, unpaid dividend, unclaimed dividend, cash and bank balances. Turnover note with trade discounts and sales taxes. New `BS_PK`/`PL_PK` with the lines listed above, plus the A1–A3 maturity fixes. Nature analysis by default; "Gross profit" only for traders; OCI when revaluation is used. Not "statutory" until done. | Schedules: verified text (2022 copy). Size thresholds: secondary only. AFRS for SSEs and the ICAP levies guidance were not obtained (human). |
| R8 | Scope: all registrants under SRO 1852 (all dates passed; mid band 15 Nov 2025) plus r.150Q(3) retailers. SRO 1666 changes no dates. It brings FED and ICT services into Chapter XIV, adds FED invoice fields, requires advance receipt invoices to be electronic, and allows recovery for transmitted invoices missing from Annex-C. STGO 1/26: 72-hour cancellation. The API is PRAL v1.12 (pre-SRO 1666, no credit-note or advance-receipt type). | Verified text (SRO PDFs, STR to 31.07.2026, STGO, API PDF). |
| Retention | ITO s.174: 6 years after the tax year, with proceedings and s.111(2)(ii) extensions. STA s.24: 6 years after the tax period, with proceedings extension. CA s.220(5): 10 FYs, books and vouchers. s.230 is not a retention rule. Records must be kept in Pakistan; how that applies to hosting is open. | Verified text (CA from the 2022 copy). |
