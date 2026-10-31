# Triage of the Codex tax reports (2026-10-31)

Adversarial check of three Codex reports before any fix:

- **A** = `docs/agents/codex-tax-pack-audit/report.md` (all six countries)
- **P** = `docs/agents/codex-pk-tax-check/report.md` (Pakistan deep check)
- **Y** = `docs/agents/codex-2027-changes/report.md` (changes around 2027-01-01)

Every claim about our data was re-read from the file and row. Claims about the law were checked against the official source, which was fetched and read where possible. Duplicates across reports are merged into one `T-` item. Pack paths are relative to `NeoERP-BackEnd/services/accounts-service/src/main/resources/`. **P2** = `packs/2026.2/`. Row numbers include the header.

**Fix route.** Pack files are hash-locked, so a correction is a forward migration plus the next pack version. The migration is **V40** (next free), in the V33 style: it updates the `tax_code_templates` / `tax_code_template_versions` / `tax_code_template_legal_texts` catalog rows and the company copies that still carry the pack's values (`origin = 'PACK'`, pack 2026.2, unchanged field), and it keeps the company's own edits. The next pack (2026.4 or 2027.1) then carries the corrected rows. One V40 can carry every data fix marked "V40" below.

## Summary

| ID | Country | Topic | Verdict | Severity | Fix type |
|---|---|---|---|---|---|
| T-01 | PK | s.153 default base is net, but the law says gross including sales tax | CONFIRMED | HIGH | V40 + contract change. **Decision** (overrides accountant MJ-4) |
| T-02 | PK | Provincial WHT base is net, but the law withholds a fraction of the tax | CONFIRMED (KP); SRB/PRA/BRA current editions unverified | MEDIUM | V40 (base_type) |
| T-03 | NO | Code 85 import is on SALES and EXEMPT | CONFIRMED | MEDIUM | V40 |
| T-04 | PK | Provincial WHT codes are tagged PK-FED | CONFIRMED | MEDIUM | V40 |
| T-05 | PK | Payable WHT codes are labelled "by customer" | CONFIRMED | MEDIUM | V40 (names) |
| T-06 | PK | Five s.153 sub-codes have no version before 2026-07-01 | CONFIRMED | MEDIUM | V40 (versions) |
| T-07 | NO | 15 % help text excludes water and sewer | CONFIRMED | MEDIUM | V40 (notes) |
| T-08 | FI | No 13.5 % / 10 % import or EU-acquisition codes | CONFIRMED (coverage) | MEDIUM | Next pack, new codes. **Decision** |
| T-09 | PK | PORT/PROF qualifiers missing; toll and rice categories absent | CONFIRMED | MEDIUM | V40 (notes) + new codes. **Decision** |
| T-10 | PK | s.155 rent: net base and no slab logic | CONFIRMED | MEDIUM | V40 (base_type) + later engine |
| T-11 | PK | Provincial registration is not the same as a federal STRN | PARTLY (design gap) | MEDIUM | **Decision** (launch gate) |
| T-12 | PK | 13 payable WHT rows are SALES in the CSV | CONFIRMED, already fixed by V33 | LOW (residual) | Next pack only |
| T-13 | FI | Import self-assessment dated from 2015 | CONFIRMED | LOW | V40 (version date) |
| T-14 | DK | Out-of-scope code has kind EXEMPT | CONFIRMED (internal); S81 meaning unverified | LOW | V40 + contract |
| T-15 | PK | MINIMUM regime is stamped on every s.153 code | PARTLY | LOW | Notes only, regime per payee later |
| T-16 | PK | Further-tax default uses "neither … nor" | Data CONFIRMED; law UNVERIFIED | LOW | Contract wording after law check |
| T-17 | PK | NTN/STRN format checks; "10 % disallowed" warning | PARTLY | LOW | Code/contract follow-up |
| T-18 | IS | Customs-paid import label hides the 24 % limit | PARTLY | LOW | Note only |
| T-19 | PK | PK-WHT-ST is one scenario only | PARTLY (already handled) | LOW | None |
| T-20 | PK | Digital Invoicing scope / CNIC threshold | UNVERIFIED | LOW | Launch-gate check |
| T-21 | PK | Wrong source on TY2026 versions; code start dates disagree with versions (missed by Codex) | CONFIRMED | LOW | V40 (source text) |
| T-22 | ALL | 2027 items (Y) that touch pack data | see detail | INFO | Watch, no rows yet |
| T-23 | PK | Provincial law sources not current; PK rows UNCHECKED | CONFIRMED (gap) | INFO | Verification task |

**Counts:** 23 items. CONFIRMED 15 (T-12 already fixed in source; T-23 is a confirmed gap), PARTLY 5, UNVERIFIED 1, mixed or info 2 (T-16, T-22). WRONG 0, though Y's NO-10 entry inside T-22 gets the direction of the change wrong. Severity: HIGH 1, MEDIUM 10, LOW 10, INFO 2.

---

## Details

### T-01 — PK — s.153 default base is net of sales tax; the statute says gross including sales tax — HIGH

- **Sources:** A PK-03, P PK-01.
- **Our data (checked):** P2 `tax-codes.csv` rows 88–98 and 100 (all `PK-WHT-153-*` and `PK-WHT-BY-CUST`) have `base_type = NET_OF_SALES_TAX`. The contracts fix this deliberately:
  - `accounts-c.md` C-13 and C-12 SC4 note: "s.153 `NET_OF_SALES_TAX`".
  - `accounts-b.md` C-21: "The s.153 base excludes sales tax (accountant MJ-4)".
  - `accounts-packs-2026-2.md` PK-5a leaves the base at "*(verify)*".
  - `PaymentRules.kt:210` and `ReceiptRules.kt:196` apply it.
- **Law (checked):** the official FBR consolidated Income Tax Ordinance 2001, updated to 30 June 2026 (download1.fbr.gov.pk `2026724177725705IncomeTaxOrdinanace2001.pdf`). At s.153(1), printed p.329, the payer must deduct tax from "the gross amount payable (including sales tax, if any)". The FBR TY2027 card also states the services rates "of the gross amount payable". This is in force for payments from 2026-07-01, and it was already in force before that date.
- **Verdict:** CONFIRMED. Codex's example is right: on 100,000 + 18,000 sales tax at 5 %, the withholding is 5,900, not 5,000. The codes are inactive and rates are typed, so the posted amount is not wrong yet. But the default base and the reported base (E C-12, s.165) are wrong for every s.153 payment once a company activates the codes.
- **Fix:**
  - V40 sets `base_type = 'GROSS'` on templates and guarded PACK copies of these codes: `PK-WHT-153-GOODS`, `-GOODS-CO`, `-GOODS-OTHER`, `-SVC`, `-SVC-CERTAIN`, `-SVC-IT`, `-SVC-MEDIA`, `-SVC-OTHER`, `-SVC-PORT`, `-SVC-PROF`, `-CONTRACT`, and `PK-WHT-BY-CUST`.
  - Contract changes: remove "excludes sales tax" from B C-21, update B C-46, C C-13 and packs PK-5a.
  - Change the tests that assert the net default.
  - Before V40, query for posted payments or receipts with `base_type = 'NET_OF_SALES_TAX'` on these codes; SC4 is new, so expect none.
- **Decision for Jabran:** the accountant decision MJ-4 contradicts the statute (see the decisions list).

### T-02 — PK — Provincial sales-tax withholding defaults to the net base — MEDIUM

- **Sources:** A PK-05, P PK-05.
- **Our data (checked):** P2 rows 101–104 (`PK-WHT-PST-BA/KP/PB/SD`) have `NET_OF_SALES_TAX`, blank rates and are inactive.
- **Law (checked, KP only):** the KPRA Withholding Regulation 2024 (Regulation No. I of 2024, gazetted 3 Jan 2025), para 6, says that in all other cases "only fifty percent (50%) of the amount of leviable tax shall be withheld". The withholding is a share of the provincial **tax**, not of the net price. I did not re-read the SRB, PRA and BRA rules; Codex says they are also tax fractions, from older editions.
- **Verdict:** CONFIRMED for KP and very likely for all four. Severity is MEDIUM because the amount is typed and the codes are inactive.
- **Fix:**
  - V40 sets `base_type = 'SALES_TAX'` on the four codes. The default base becomes Σ allocated × bill tax / total, the same as `PK-WHT-ST`.
  - Keep the rate blank and the codes inactive.
  - Put the fraction in `side_note`: "KP: 50 % of the tax ordinarily; full tax for listed cases".
  - Add the other provinces' fractions after T-23.

### T-03 — NO — `NO-MVA-IMPORT-EXEMPT` (SAF-T code 85) is on SALES and EXEMPT — MEDIUM

- **Sources:** A NO-01.
- **Our data (checked):** P2 `tax-codes.csv:61` has kind EXEMPT, blank rate, `applies_to SALES` and `std_tax_code 85`. `tax-rate-versions.csv:71` has a blank rate. `tax-legal-texts.csv:76–77` says "Exempt supply" / "Unntatt merverdiavgift". V22:55 renamed it "Import of goods, no VAT to be calculated" but left the side and kind unchanged.
- **Law (checked):** in Skatteetaten's official `Standard_Tax_Codes.csv` (GitHub Skatteetaten/saf-t), code 85 is "Grunnlag innførsel av varer som det ikke skal beregnes merverdiavgift av" ("Importation of goods, not applicable for VAT"), with **zero rate**. It is an import, so a purchase.
- **Verdict:** CONFIRMED.
  - Purchases are refused with WRONG_SIDE.
  - A sale could pick an import code, which puts the base in the wrong mva-melding line.
  - The rate is 0, so no tax amount is wrong.
- **Fix:**
  - V40 sets `applies_to = 'PURCHASES'` and `kind = 'ZERO'`. `TaxOnLineResolver` allows ZERO on purchases.
  - Version 1 rate becomes `0.0000`.
  - Legal texts become "Import of goods with no VAT to be calculated (zero rate)" / "Innførsel av varer som det ikke skal beregnes merverdiavgift av".
  - Apply to templates and guarded copies, and correct the row in the next pack.
  - First confirm that the NO return/SAF-T mapping treats ZERO + 85 as a base-only line.

### T-04 — PK — Provincial WHT codes carry jurisdiction `PK-FED` — MEDIUM

- **Sources:** A PK-04, P PK-04.
- **Our data (checked):** P2 rows 101–104 have `jurisdiction PK-FED`. Their own output accounts are provincial (2756–2759), and the provincial output codes already use `PK-PB/PK-SD/PK-KP/PK-BA` (rows 75, 76, 79, 83). `tax_jurisdiction` is copied onto posted lines (V25).
- **Law:** each province administers its own withholding (PRA, SRB, KPRA, BRA). This is uncontroversial.
- **Verdict:** CONFIRMED. A provincial remittance would be tagged and reported as federal.
- **Fix:** V40 sets `jurisdiction` to `PK-BA`, `PK-KP`, `PK-PB` and `PK-SD` respectively, on templates and guarded copies. The next pack carries the change.

### T-05 — PK — Payable withholding codes are named "deducted / withheld by customer" — MEDIUM

- **Sources:** A PK-02, P PK-03.
- **Our data (checked):** `V22__phase2_approved_names.sql:125–137` names the 13 WHT_PAYABLE codes "Income tax deducted by customer - …" and "… sales tax on services withheld by customer". V33 changed only their side. The real customer-side codes `PK-WHT-BY-CUST` and `PK-ST-WHT-BY-CUST` stay SALES.
- **Verdict:** CONFIRMED. A payment screen offers a "by customer" label for tax we withhold from a supplier, which invites the wrong choice on receipts.
- **Fix:** V40 renames, using the V22 provenance guard so company-edited names are kept. Proposed names:
  - "Income tax withheld from supplier – goods, company (s.153(1)(a))"
  - "… – contracts (s.153(1)(c))"
  - "… – port and terminal services, company payee"
  - "… – independent professional services"
  - "Punjab sales tax on services withheld from supplier", and the same pattern for the other provinces.

### T-06 — PK — Five s.153 sub-codes have no rate version before 2026-07-01 — MEDIUM

- **Sources:** P PK-08.
- **Our data (checked):** P2 `tax-rate-versions.csv` rows 98, 100, 101, 105 and 106 (`-CONTRACT`, `-GOODS-CO`, `-GOODS-OTHER`, `-SVC-IT`, `-SVC-MEDIA`) start at 2026-07-01. `-SVC-CERTAIN` and `-SVC-OTHER` already have 2025-07-01 versions. A payment dated before 2026-07-01 gets `NOT_IN_FORCE`. The Pakistani FY2026 runs from July 2025 to June 2026, so back-booked payments hit this.
- **Law (checked):** the official FBR TY2026 downloadable sheet (`20258181282440792WHT-Rates-DownloadableSheet.xlsx`, Finance Act 2025) has the **same** ATL / non-ATL figures as TY2027 for these five:

  | Category | ATL / non-ATL |
  |---|---|
  | Goods, company | 5 / 10 |
  | Goods, other | 5.5 / 11 |
  | IT services | 4 / 8 |
  | Media advertising | 1.5 / 3 |
  | Contracts, company | 7.5 / 15 |
  | Contracts, other | 8 / 16 |
  | Contracts, sportspersons | 15 / 30 |

  PORT and PROF are new in TY2027, so they must not be backdated.
- **Verdict:** CONFIRMED.
- **Fix:** V40 adds a version from 2025-07-01 to each of the five codes, with the same hints and source "FBR Withholding Tax Rates Card TY2026 (Finance Act 2025)". The 2026-07-01 row stays the current one. If version numbering must rise with date, move version 1's `valid_from` to 2025-07-01 instead; the values are identical and the codes are unused. Also align `tax-codes.csv valid_from` (see T-21).

### T-07 — NO — 15 % code help excludes water and sewer — MEDIUM

- **Sources:** A NO-02.
- **Our data (checked):** P2 `tax-codes.csv:53` `NO-MVA-15` notes "Food and drink". Its `side_note` says "Not alcohol, tobacco, medicines or **tap water**".
- **Law (checked):** Skatteetaten's rate table for water from waterworks and sewer services gives 15 % for 2026. The rate was "redusert fra 25 % til 15 % fra og med 1. juli 2025". For 2025 there is a half-and-half split rule.
- **Verdict:** CONFIRMED. The rate and SAF-T code 31 are correct. Our help text actively steers water and sewer suppliers away from the right code.
- **Fix:** V40 updates `notes` / `side_note` on `NO-MVA-15` and its legal or help text, guarded:
  - "Food and drink (mval § 5-2), and water from waterworks and sewer services (§ 5-12, from 2025-07-01)".
  - Drop "tap water" from the exclusions.
  - Apply the same to the `NO-MVA-IN-15` help if it says food only.

### T-08 — FI — Import and EU-acquisition codes exist at the standard rate only — MEDIUM (coverage)

- **Sources:** A FI-02.
- **Our data (checked):** P2 rows 28 and 35 (`FI-ALV-IMPORT`, `FI-ALV-RC-EU-GOODS`) are 25.5 %. No 13.5 % or 10 % variant exists. The contract §3.2 already lists this as later work.
- **Law:** imported goods and intra-EU acquisitions take the rate of the goods, so food is 13.5 % and books are 10 %. This is the general rule of the Arvonlisäverolaki. The reduced rates are confirmed on Vero's rates page.
- **Verdict:** CONFIRMED as a coverage gap. The existing rows are right for standard-rated goods. A food importer has no correct code today.
- **Fix:** add new codes in the next pack (and V40 templates) using the same return fields as the generic ones (310/304, 313/305, deduction 307):
  - `FI-ALV-IMPORT-13-5`
  - `FI-ALV-IMPORT-10`
  - `FI-ALV-RC-EU-GOODS-13-5`
  - `FI-ALV-RC-EU-GOODS-10`

  Rename the generic codes "standard rate". **Decision:** add the codes now, or keep the contract's "later".

### T-09 — PK — PORT/PROF qualifiers missing; special goods categories absent — MEDIUM

- **Sources:** P PK-07, plus A's coverage notes.
- **Our data (checked):** P2 rows 97–98 have the generic names "Pk Wht 153 Svc Port" and "Svc Prof", with blank notes. Rows 90–91 (GOODS-CO/OTHER) say nothing about toll manufacturing or rice, cotton seed and edible oils.
- **Law (checked):**
  - ITO First Schedule Pt III Div III para 2, p.545: "(ii) 15% in the case of independent professional services such as doctors, lawyers, architects, accountants, software engineers or developers, **working independently**".
  - Same paragraph: "(iv) 12% … payable to **companies** for rendering or providing terminal and port operating services".
  - The TY2027 card lists separate goods rates: toll manufacturing for companies 9 / 18 and others 11 / 22; rice, cotton seed and edible oils 1.5 / 3. The TY2026 sheet has the same figures.
  - Our hints for all ordinary categories match TY2027 exactly. PORT 12/24, PROF 15/30, CERTAIN 7/14, OTHER 14/28, IT 4/8 and MEDIA 1.5/3 were all checked.
- **Verdict:** CONFIRMED.
- **Fix:**
  - V40 adds qualifiers in name and `side_note`: "company payee only" (PORT), "individual professionals working independently" (PROF), "not toll manufacturing; not rice / cotton seed / edible oils" (GOODS-CO/OTHER).
  - **Decision:** add `PK-WHT-153-GOODS-TOLL-CO` (9/18), `-GOODS-TOLL-OTHER` (11/22) and `-GOODS-RICE-OIL` (1.5/3) from 2025-07-01, or leave those to the generic manual code.

### T-10 — PK — s.155 rent uses the net base and has no slab logic — MEDIUM

- **Sources:** P PK-10.
- **Our data (checked):** P2 row 99 `PK-WHT-155` has `NET_OF_SALES_TAX`, notes "Slab rates.", no hint, and is inactive.
- **Law (checked):** the TY2026 sheet and the TY2027 card give the s.155 rates on **gross annual rent**:

  | Annual gross rent (individual or AOP payee) | Withholding |
  |---|---|
  | up to 300,000 | Nil |
  | 300,000 to 600,000 | 5 % of the excess over 300,000 |
  | 600,000 to 2,000,000 | 15,000 + 10 % of the excess over 600,000 |
  | above 2,000,000 | 155,000 + 25 % of the excess over 2,000,000 |

  A company payee is 15 / 30.
- **Verdict:** CONFIRMED.
- **Fix:**
  - V40 sets `base_type = 'GROSS'`.
  - Put the slab table in `side_note`, with "annual, cumulative: subtract earlier deductions in the tax year".
  - A slab engine is later scope; until then the amount stays typed.

### T-11 — PK — One STRN field cannot prove provincial registration — MEDIUM (design / launch gate)

- **Sources:** P PK-12, P PK-14.
- **Our data:** `accounts-c.md` C-20 requires the supplier's STRN for PK INPUT codes, and `PK-PST-IN` / `PK-ST-RC` share that guard.
- **Verdict:** PARTLY. A provincial-only service provider has a provincial registration (for example PRA's PNTN), not a federal 13-digit STRN, so the guard can block a valid provincial claim or accept the wrong number. Codex's statutory citations for each province were not re-read here.
- **Decision:** model registrations per authority before PK provincial codes are activated. This is not a pack-data fix.

### T-12 — PK — 13 payable WHT rows are SALES in the CSV — LOW (residual; already fixed)

- **Sources:** A PK-01, P PK-02.
- **Our data (checked):** P2 rows 88, 90–91, 93–98 and 101–104 are SALES with `WHT_PAYABLE`. `V33__pk_wht_payable_codes_purchases.sql` sets PURCHASES on the catalog and on guarded PACK copies of exactly these 13 codes. Both reports credit V33 correctly.
- **Verdict:** CONFIRMED and fixed in source.
- **Residual:** the next pack must ship PURCHASES. Check in the target databases that V33 applied (`flyway_schema_history`).

### T-13 — FI — `FI-ALV-IMPORT` self-assessment dated from 2015 — LOW

- **Sources:** A FI-01.
- **Our data (checked):** P2 `tax-rate-versions.csv:28` has version 1 at 24 % from 2015-01-01, kind REVERSE_CHARGE (self-assessed on the return).
- **Law (checked):** Vero's guidance says VAT-registered importers moved to reporting import VAT on the VAT return "As of 1 January 2018". Before that, Customs collected it.
- **Verdict:** CONFIRMED. It affects only back-dated transactions from 2015 to 2017.
- **Fix:**
  - V40 moves version 1 `valid_from` to `2018-01-01`; the rate stays 24 %.
  - Pre-2018 imports go on `FI-ALV-IN-STD`, as customs-paid input VAT.
  - Update `src/test/resources/packs/expected-rates-2026.2.csv`.

### T-14 — DK — `DK-MOMS-OUT-OF-SCOPE` has kind EXEMPT — LOW

- **Sources:** A DK-01.
- **Our data (checked):** P2 `tax-codes.csv:16` has kind EXEMPT. The label reads "Uden for momslovens anvendelsesområde", the report text "outside the scope of ML; not reported", and the mapping is `std_vat_code_ref S81`. Kind `OUT_OF_SCOPE` exists in the schema (V6 check) and the engine (`TaxLineTagger`, `TaxOnLineResolver`).
- **Law:** I could not open the official ERST *Momskoder – bruttoliste* (search returned nothing usable), so the meaning of S81 is UNVERIFIED. Outside the scope and exempt are different concepts in Danish VAT law, so the internal contradiction stands.
- **Verdict:** CONFIRMED (internal); law UNVERIFIED. No tax amount is affected.
- **Fix:** V40 sets `kind = 'OUT_OF_SCOPE'` and keeps no rate and no reporting. Align the packs contract §3.1.

### T-15 — PK — MINIMUM regime stamped on every s.153 sub-code — LOW

- **Sources:** P PK-09.
- **Our data (checked):** P2 rows 88, 90–91 and 93–98 have `regime MINIMUM`.
- **Law:** s.153(3) was not re-read; Codex cites exceptions for manufacturers' and listed companies' goods receipts. The regime only labels the asset; it does not change the amount withheld.
- **Verdict:** PARTLY.
- **Fix:** add "regime depends on the payee; s.153(3) exceptions" to `side_note`. Decide the regime per payee later.

### T-16 — PK — Further-tax default uses "neither registered nor active" — LOW

- **Sources:** P PK-13.
- **Our data (checked):** `accounts-b.md` C-12 defaults `PK-ST-FURTHER` "when the customer is neither sales-tax registered nor on the active-taxpayer list".
- **Law:** I could not read s.3(1A) of the STA PDF, because its body text is glyph-encoded. UNVERIFIED.
- **Fix:** read s.3(1A) of the 30 June 2026 STA. If it covers unregistered **or** inactive buyers, change "neither … nor" to "not registered, or not active". This is a contract change only; the runtime default is still a follow-up.

### T-17 — PK — NTN/STRN format checks and the "10 % disallowed" warning — LOW

- **Sources:** P PK-11, P PK-15, P PK-16.
- **Our data (checked):** `accounts-c.md` has the `SUPPLIER_NTN_MISSING` warning text "s.21(q), 10 % disallowed". The STRN guard only checks that the field is not blank.
- **Verdict:** PARTLY.
  - A missing NTN in our records does not prove the supplier has none, so the warning is overstated.
  - Format validation is a reasonable improvement.
  - The DI-threshold claim (P PK-16) is UNVERIFIED.
- **Fix:** reword the warning to "NTN not recorded – expense may be partly disallowed (s.21(q))". Add identifier format checks as a C follow-up. These are code changes, not pack changes.

### T-18 — IS — `IS-VSK-IMPORT-PAID` label hides that it is the 24 % code — LOW

- **Sources:** A IS-01.
- **Our data (checked):** P2 `tax-codes.csv:45` is 24 %. `IS-VSK-IN-11` exists for 11 % input.
- **Law (checked in part):** Skatturinn's 2026 rates page shows 24 % and 11 % only. Skatturinn's customs notice for software houses (codes in force from 1 May 2026) says VAT on fuel "lækkar tímabundið úr 24% í 11%". The page I read does not show the end date of 31 Aug 2026.
- **Verdict:** PARTLY.
- **Fix:** add a side note: "standard-rate imports; for 11 % goods (including fuel during the temporary cut) use IS-VSK-IN-11". Rates stay unchanged.

### T-19 — PK — `PK-WHT-ST` 20 % is one Eleventh Schedule scenario — LOW

- **Sources:** P PK-06; A (agrees it is fine).
- **Our data (checked):** P2 row 105 is inactive, with base `SALES_TAX`. Its notes already say "Applies only to the … scenarios listed …; other listed scenarios use other fractions … or full withholding".
- **Verdict:** PARTLY. The risk is real but already flagged in the data. **No data fix.**

### T-20 — PK — Digital Invoicing scope dates (SRO 1852) — LOW

- **Sources:** P PK-14, Y PK-3.
- **Verdict:** UNVERIFIED. I did not fetch SRO 1852. This is a launch-gate item, not a tax-code row.

### T-21 — PK — Wrong source on TY2026 versions; code start dates disagree with versions (missed by Codex) — LOW

- **Our data (checked):**
  - P2 `tax-rate-versions.csv:103` (`SVC-CERTAIN` v1, 6/12 from 2025-07-01) and `:107` (`SVC-OTHER` v1, 15/30) cite "FBR Withholding Tax Rates Card **TY2027** (Finance Act 2026)". Those are TY2026 values; the TY2026 sheet confirms 6/12 and 15/30.
  - `tax-codes.csv` rows 93 and 96 give `valid_from 2026-07-01` for the same two codes, while their first version starts 2025-07-01.
- **Fix:** in V40, set the source on those two versions to "FBR Withholding Tax Rates Card TY2026 (Finance Act 2025)". Align the code `valid_from` to 2025-07-01, together with T-06.

### T-22 — 2027 changes report (Y) — INFO

Only the items that would add or change tax-pack rows are triaged here. The payroll and integration items in Y (SE SINK, FI Tulorekisteri, NO a-melding and access packages, DK and SE payroll thresholds, FI unemployment insurance) do not belong in the VAT CSVs, which Y itself says. Their figures were not re-verified.

| Y item | Check | Verdict | Action |
|---|---|---|---|
| NO-9 EV exemption 150,000 | Prop. 1 LS (2026–2027) ch. 9 proposes: sale exempt up to NOK 150,000; leasing over cost 150,000; cars delivered before 2027 keep 300,000; in force 2027-01-01 | CONFIRMED as a **proposal** | No EV code exists. After the Storting vote, add a dated side-note or rule. No row now |
| NO-10 postal transport | Same proposition: §6-28 **narrows** the exemption, denying it for stamped postal items unless mass mailings. Y says "extended" | PARTLY (direction misdescribed) | None |
| NO-4 SAF-T 1.40, DK-1 SAF-T 2.1, NO-1 e-invoicing | Not re-fetched | UNVERIFIED | Export-profile work, not tax-code rows |
| FI-1 ViDA amendment 597/2026 | Finlex shows "Lag om ändring av mervärdesskattelagen" 597/2026; the page I got did not show dates or scope | PARTLY | OSS/IOSS profile is later work. No change to FI-ALV-EU-* |
| IS-1 bathing places 11→24 % | Althingi page returned 403 | UNVERIFIED | Wait for the enacted law |
| SE food 6 % | Already in contract SE-5 and handled by `SE-MOMS-6` | Agrees | None |
| DK-7 books zero rate 2027-07-01 | Not fetched | UNVERIFIED (proposal) | Watch |
| PK-1 "no January 2027 duplicate" | TY2027 card is dated "updated up to June 30, 2026", in force from 2026-07-01 | CONFIRMED | None. Do not add January rows |
| PK-2 tribal 12 %/14 % | Not verified for 2026 law | UNVERIFIED | No row until confirmed |

### T-23 — PK — Provincial sources not current; all PK rows UNCHECKED — INFO

- **Sources:** P PK-17, A's "U-PK" qualification.
- **Our data (checked):** every PK row and version is UNCHECKED. V22 marked only the Nordic countries CHECKED. The provincial rows cite "*(verify)*".
- **Verdict:** CONFIRMED gap. Run a verification task against the current PRA, SRB and BRA rules (KP 2024 is now read, see T-02) before any provincial code is activated.

### Codex claims checked and found right on our data

- All 13 row references in A PK-01 and P PK-02.
- The V33 scope.
- The V22 line ranges.
- The rate-version line numbers for the PK hints.
- The jurisdiction and base values on rows 88–105.

No Codex row misreading was found.

---

## Decisions for Jabran

1. **Switch the s.153 default base to gross, including sales tax (recommended).** The 2026 Ordinance s.153(1) says so in plain words. This overrides the accountant's MJ-4 note in B C-21. It needs contract edits in B C-21/C-46, C C-13 and packs PK-5a, plus V40. (T-01)
2. **Do one V40 "PK/NO/DK/FI tax-data corrections" migration now (recommended).** It would carry:
   - T-01 and T-10: GROSS base on s.153 and s.155 codes.
   - T-02: provincial base set to SALES_TAX.
   - T-03: NO code 85 set to PURCHASES / ZERO / 0 %.
   - T-04: provincial jurisdictions.
   - T-05: supplier-side names.
   - T-06: TY2026 versions for five codes.
   - T-07: NO water/sewer help text.
   - T-09: notes on PORT/PROF/GOODS.
   - T-13: FI import version from 2018.
   - T-14: DK out-of-scope kind.
   - T-21: source text and start dates.

   The next pack version carries the same corrections. One migration keeps the guard logic in one place.
3. **Add the FI reduced-rate import and EU-acquisition codes in the next pack (recommended)**, rather than leaving them as "later". A food importer has no correct code today. (T-08)
4. **Add PK toll-manufacturing and rice/cotton-seed/edible-oil s.153 codes: recommended yes, but low priority.** The rates are official and stable across TY2026 and TY2027. (T-09)
5. **Keep provincial PK codes inactive until registrations per authority are modelled and the current PRA/SRB/BRA rules are read (recommended).** (T-11, T-23)
6. **Do not add any 2027 rows yet (recommended).** The NO EV and IS bathing changes are still proposals. Recheck after the budget votes in December. (T-22)
