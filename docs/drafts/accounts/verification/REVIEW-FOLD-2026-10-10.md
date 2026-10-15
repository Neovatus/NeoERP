# Review of the 2026-10-10 verification fold (NO, DK, FI, IS) into the Accounts contracts

**Reviewer:** fresh read-only reviewer for the Accounts lead (Opus). I edited no other file.
**Date:** 2026-10-10.
**Checked:** `NeoERP-BackEnd/docs/api/accounts-packs-2026-2.md` (whole file; "verification 2026-10-10" notes, §11.1 V-18…V-34),
`accounts-e.md` (§3.3 box sets, C-8, C-19, `tax_settings`, VE-9…VE-13), `accounts-attachments.md` §3 and D-143/D-144,
`fixtures/payroll-posting/roles-2026-2.json`.
**Against:** `REVIEW-NO-DK-FI-IS-2026-10-10.md` (all CONFIRMED / CORRECTED / REJECTED / STILL UNCLEAR rows), the
lead decisions in `accounts-decisions-for-jabran.md` ("packs 2026.2 verification fold", lines 201–211, including the
`EMPLOYEE_ADVANCES` control-kind line), the researcher sheets where the review says "as the file", and the 2026.1 CSVs
`docs/drafts/accounts/coa/pk.csv`, `base-ifrs.csv`, `no-ns4102.csv`, `tax-codes.csv`.

## Result

| Severity | Count |
|---|---|
| Blocking | 1 |
| Major | 5 |
| Minor | 12 |

What holds:
- All 5 REJECTED items are left out: NO-M6b (1240 kept), NO-M6l (7796 not moved to 1909), DK 2.19 (K690), IS-18
  (the sentence is kept), and IS-8 (no company threshold).
- CONFIRMED and CORRECTED texts are applied word for word across NO-M1…M7, DK-M1…M13, FI-M1…M11 and IS-M1…M7. The one
  exception is `EMPLOYEE_ADVANCES`, where the lead decision overrides the review (B-1).
- STILL UNCLEAR rows stay *(verify)* (§4.1 note, VE-13). The one gap is FI 5.x (m-9).
- PK 2701/2703/2704/2706 are free in `pk.csv` and absent from `base-ifrs.csv`. PK 1572 is free.
- DK 2706 and 5405, and FI/IS 2941, are absent from BASE, so there is no clash.
- Every NO move target is free in `no-ns4102.csv`: 1234, 1248, 1288, 1498, 1572, 1573, 1579, 1915, 2781, 2946, 2961,
  3095, 3715, 4370 and 7605.
- Tax-code accounts: every NO, DK and PK override points at an account that the fold creates.
- The fixture's 22 roles match packs §6.1/§6.2/§6.2a/§6.3 in number, account, name, `payeeTag` and `use`.
- FI one-code-two-versions is expressed correctly. §3.2 has versions 14.0000 (version 1) and 13.5000 from 2026-01-01, with
  the same two versions on IN-RED. The box stays 302 (E maps per code). L-6, PA-4 and the §3.4 expected-rates rows let
  the engine and E pick the rate by date.
- The JSON is valid (`json.load` OK).

## Findings

| # | Severity | File:line | Problem | Exact fix |
|---|---|---|---|---|
| B-1 | **Blocking** | `accounts-packs-2026-2.md`:742, :744, :849, :873; `fixtures/payroll-posting/roles-2026-2.json`:286 | `EMPLOYEE_ADVANCES` is still given control `PAYROLL`: §6.2a says "ASSET, debit, PAYROLL", the L-4 note asks A-1 to accept ASSET + PAYROLL, PK-9 1572 and NO-6 1572 say "control PAYROLL", and the fixture has `"control": "PAYROLL"`. The lead decision (decisions file, last line of the fold) says the role has **no PAYROLL control kind**, because L-4 needs liabilities: it is an ordinary asset account. As written, either L-4 fails at load or A-1 gets widened against the decision. (The review's NO-M2 and FI/IS/DK proposals said "control PAYROLL"; the lead overrode them.) | :742 "ASSET, debit, PAYROLL" → "ASSET, debit, none (ordinary asset account with the role; lead decision 2026-10-10)". :744 replace the whole note with: "(lead decision 2026-10-10) `EMPLOYEE_ADVANCES` is an asset role with **no** control kind: L-4 (PAYROLL ↔ `PAYROLL_LIABILITY`) applies to payables only and is unchanged; Payroll recovers advances through its posting, Finance pays them through D." :849 and :873 "control `PAYROLL`" → "control none". Fixture :286 `"control": "PAYROLL"` → `"control": null`. Also align `payroll-v2-p2.md`:196 ("ASSET, PAYROLL control"), which is outside this fold. |
| M-1 | Major | `accounts-packs-2026-2.md`:432, :435 | FI box numbers are swapped. Per VSRALVKV (and E §3.3, `accounts-e.md`:361–363 and FI-M5), **304** = tax on imports from outside the EU and **305** = tax on goods bought from other EU countries. The packs put RC-EU-GOODS tax in 304 and IMPORT tax in 305. | :432 "(304)" → "(305)"; :435 "tax on imports (305)" → "tax on imports (304)". Also name RC-EU-SVC's boxes on :433: "base 314; tax 306; deduction 307". |
| M-2 | Major | `accounts-packs-2026-2.md`:109, :415 | `std_vat_code_ref VARCHAR(10)` holds one code, but the mapping gives `DK-MOMS-EXPORT` two (S41 goods / S42 services) and `DK-MOMS-EXEMPT` three (S82, plus S24 and S43). BEK 811/2026 bilag 3 pkt. 4 wants every standard code offered or mapped, so S42, S24 and S43 end up unmapped or ambiguous. | Either (a) split `DK-MOMS-EXPORT` into `DK-MOMS-EXPORT-GOODS` (S41) and `DK-MOMS-EXPORT-SVC` (S42) and add `DK-MOMS-EU-EXEMPT` (S24) and `DK-MOMS-EXPORT-EXEMPT` (S43), or listed as not seeded with a reason; or (b) make the column `std_vat_code_refs VARCHAR(10)[]`, with a loader rule that every Bruttoliste code in the "launch" set appears once. Recommend (a): one code, one box, one standard code (D-89 spirit). Update V-24 to match. |
| M-3 | Major | `accounts-e.md`:146 (C-19) | The text still lists "SE, DK, FI, IS" under `NEXT_RETURN`. The lead decision (and packs §4.1 :500, PA-9) makes **DK** `CORRECT_EARLIER`, and D-93 already made FI `CORRECT_EARLIER`. The DK-MOMS box set (:348) does not state its `lateDocumentRule`. | C-19: "`NEXT_RETURN` (… SE, IS *(verify)*)" and "`CORRECT_EARLIER` (… NO for input VAT outside the term …; **DK** (lead decision 2026-10-10, skat.dk amends the filed period); **FI** (D-93))". Add "`lateDocumentRule CORRECT_EARLIER`" to the DK-MOMS and FI-KVI bullets in §3.3, and a VE-14 row. |
| M-4 | Major | `accounts-packs-2026-2.md`:845 (PK-5a) | The new `PK-WHT-153-CONTRACT` account **2754** is marked "*(verify free)*", but it is **not free**. `pk.csv` already has 2754 *Income tax withheld - other sections* (TAX_PAYABLE, TAX), so 2754 would carry two meanings in the PK chart. This comes from the 10-09 fold, but it is the only real number clash in the PK chart. | Either rename the existing 2754 to *WHT payable s.153(1)(c) contracts* (the "other sections" catch-all then has no account), or put s.153(1)(c) on a free number. 2755 is taken by services and 2756–2759 by provincial withholding, so use **2760** or move the catch-all. State which, and drop "*(verify free)*". |
| M-5 | Major | `accounts-packs-2026-2.md`:406–409 with L-7 (:149) | The new launch codes `DK-MOMS-EU-TRIANG` (ZERO) and `DK-MOMS-OUT-OF-SCOPE` (EXEMPT) have no `da`/`en` legal text. L-7 then fails the migration. §4.2 DK texts (:599) cover reverse charge and EU exempt goods only. Also `DK-MOMS-IN-25-PRORATA` has no default `deductible_percent` (column default 100). | Add to §4.2 DK: EU-TRIANG `da` «trekantshandel, køber afregner momsen (artikel 141)» / `en` «triangulation, VAT accounted for by the customer (Article 141)» *(verify against momsbekendtgørelsen § 62)*; OUT-OF-SCOPE `da` «uden for momslovens anvendelsesområde» / `en` «outside the scope of Danish VAT» *(verify)*. PRORATA: "`deductiblePercent` 0 until the company sets its pro-rata percentage (K110)". |
| m-1 | Minor | `accounts-packs-2026-2.md`:59, :75, :76 | The counts are stale: "60 → **73** (13 new: 2 generic, 11 country)", `account-roles.csv` 73, `account-role-countries.csv` 11. After §6.2a, §6.2b and ATP_EXPENSE the counts are **78** roles and **12** country rows (the :726 and :905 tests say so). | :59 "60 → **78** (18 new: 6 generic, 12 country)"; :75 "78"; :76 "12". |
| m-2 | Minor | `accounts-packs-2026-2.md`:423, :478 | `FI-ALV-10` "10 from 2013-01-01" is unmarked, and the expected-rates row has 2013-01-01. :483 says the FI 2013-01-01 start is not claimed from the sources read (FI 1.3 STILL UNCLEAR). | :423 "10 from the pack's earliest supported date (2013-01-01 *(verify)*, FI 1.3)"; :478 `FI,FI-ALV-10,1,10.0000,<earliest>`. |
| m-3 | Minor | `accounts-packs-2026-2.md`:704 | "1.91 % in 2026" sits inside a CHECKED note, but the review says FI-M8 is "CONFIRMED (name; 1.91 % rate not re-read)". | Change to "(1.91 % in 2026 *(verify)*; …; FI-M8 row, name CHECKED)". |
| m-4 | Minor | `accounts-packs-2026-2.md`:390 | "the act starts 1994-07-01" is a new factual claim with no source in the review (DK 2.1 is STILL UNCLEAR). | Append "*(verify)*" or delete the parenthesis. |
| m-5 | Minor | `accounts-packs-2026-2.md`:872 (NO-5) | Deferred income on **2965** takes name_local "Forskuddsbetalt inntekt". The researcher sheet (NO file line 34) gives this as the standard 2965 *DescriptionNOR* verbatim. The NO-3 rule is never to copy `DescriptionNOR`. (2610 "Utleggstrekk" is the statutory term and is acceptable, as the review says.) | Use our own wording, e.g. name_local "Inntekt mottatt på forskudd" / name_en "Income received in advance". |
| m-6 | Minor | `accounts-packs-2026-2.md`:872 | 7605 "Franchise fees (royalties)" overlaps 7600 `ROYALTY_EXPENSE` "Licence fees and royalties" in the same chart. A reader cannot tell which to use. | Name 7605 "Franchise fees" / "Franchiseavgifter" (drop "(royalties)"). Keep `std_account_ref` 7605. |
| m-7 | Minor | `accounts-packs-2026-2.md`:871 (NO-4) | The input accounts 2715–2718 (and output 2705–2709) are listed by number only. Their meaning is inferable only from the tax-code mapping, and the generator needs names. | Add the meanings inline: 2715 import of goods high, 2716 import of goods middle, 2717 emission allowances/gold, 2718 services from abroad low. Also name the input account of `NO-MVA-IMPORT-PAID-15` (2711). |
| m-8 | Minor | `accounts-e.md`:226 | `eu_list_frequency` null "(DK, FI)": FI has **no** frequency setting (FI-M7, E :380). DK goods and services can differ (§ 99 stk. 4–5 vs stk. 6; packs §4.1 has two DK columns). | "`eu_list_frequency_goods`, `eu_list_frequency_services` null (SE, DK); FI none (monthly only, FI-M7)". |
| m-9 | Minor | `accounts-packs-2026-2.md`:191 / :538 | The FI 5.1/5.7/5.8 STILL UNCLEAR pack text was not applied: the source column should read "NeoERP skeleton; statement line per kirjanpitoasetus 1 luku 6 §". :538 lists IS-34 but not FI 5.x. | Add to §2.1 rule 5 FI: "numbering-only rows: 'NeoERP skeleton; statement line per kirjanpitoasetus 1 luku 6 §' (FI 5.1, 5.7, 5.8 STILL UNCLEAR: no official FI chart)". |
| m-10 | Minor | `accounts-attachments.md`:66, :381 | :66 still says "one pack row per country, `<CC>.RETENTION.BOOKKEEPING`", but FI now uses `FI.RETENTION.VOUCHERS`. D-144 (:381) still says "NO amended § 13 'i Norge'" and asks for the NO and IS rules to be checked, though the review read them (§ 7-5; IS ≤ 6 months). | :66 "(one voucher row per country: `<CC>.RETENTION.BOOKKEEPING`, FI `FI.RETENTION.VOUCHERS`)". D-144: "NO § 13 + forskriften § 7-5 (EEA/UK/CH with written notice), IS ≤ 6 months abroad, FI inspectable from Finland, SE …; facts checked 2026-10-10, decision with C4". |
| m-11 | Minor | `accounts-attachments.md`:81; `accounts-packs-2026-2.md`:552 | The DK `PROPERTY` override (10 years) counts from "the acquisition or building work", but `start_basis` offers only `FY_END`, `CAL_YEAR_OF_FY_END` and `TAX_YEAR_END`. | State "10 years counted `FY_END` of the fiscal year of acquisition/completion (≥ the legal period)", or add `start_basis EVENT_DATE` to AT-A1. |
| m-12 | Minor | `accounts-a5.md`:501 (outside the fold) | `RolesFixtureContractTest` says "the 21 payroll roles", but the fixture now has **22** (ATP_EXPENSE). | "22 payroll roles (incl. DK `ATP_EXPENSE`, 2026-10-10)". |

## Not findings (checked and coherent)

- **DK proposals.**
  - S25 → EU-TRIANG (EU list only), S81 → OUT-OF-SCOPE (not reported), K040 → IN-25-50 and K110 → PRORATA match DK
    file 2.18.
  - The proposal names are marked "our proposal". RC-DOM-SALE and DK-MOMS-0 both map to S02, as in file 2.19
    (many-to-one is fine).
  - IN-25-NODED is K030 only, and K690 is deferred with `DK-MOMS-RC-DOM-NODED`.
  - `ATP_EXPENSE` on 5405 (std 2898) is coherent: DK country role, EXPENSE, payee NONE, Dr ATP_EXPENSE / Cr
    ATP_PAYABLE (2771). 5400 is renamed with std 2930. Fixture, §6.2, §6.3 and the test counts (78/12) agree.
- **Number reuse across tables is not a clash.** DK 2706 (std 7720) and DK 7720 (std 1910) differ, but one number is
  ours and the other is the std reference column. DK 1570 and 1950 both map to std 6330, and DK 2500 and 2610 both map
  to std 8040; many-to-one is allowed.
- **NO.** 3020/3030 change meaning, which the generator rewrites from NO-5. 2702/2712 are vacated and not recreated. The
  old 3040, 3710, 4380, 7610 and 2970 rows are removed or vacated with no orphan role.
