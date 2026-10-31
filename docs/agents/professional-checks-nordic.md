# Nordic professional checks: L4, R4, S1 (2026-10-31)

Scope: settle three open items from `codex-decisions-2026-10-31.md` against official sources only. Read-only on code. Context files: `codex-layouts-refs-triage.md` (L4, section B5), `codex-research-triage.md` (R4, section A), `codex-sie-saft/triage.md` (S1, NO-3 / NO-1 / NO-2).

Method note: official sites were fetched directly where they allowed it. Lovdata, Retsinformation (Lovtidende PDF of the enacted act), Finlex open-data API (consolidated text), Skatteetaten pages and the Skatteetaten GitHub repository all loaded. althingi.is refused automated access (HTTP 403 / bot check); I did not work around it. For Iceland I used the Ministry's own draft bill and tax authority page instead (see R4-IS). Confidence: High = read in the official text itself; Medium = official but indirect; Low = secondary only.

## Summary of decisions

| Item | Decision | Confidence |
|---|---|---|
| L4 FI-kort creditor number | Do NOT enforce MOD11 on the 8-digit creditor number. No official specification defines a check digit for it. Enforce only ASCII `[0-9]{8}` (fixes the Unicode-digit bug). The MOD11 hit on 80882939 is a 1-in-11 coincidence from a single sample. | High that the official handbooks define no creditor check digit; Medium that no other current Nets document does |
| R4 NO | §13 retention periods and the "in Norway" rule do not change on 2027-01-01. The amendment adds: electronic invoices must be kept in their original format, plus a ministry power to set storage-media requirements. Store the original e-invoice XML for NO tenants. | High (text of the Act read) |
| R4 DK | §12 stk. 1: 5 years from end of the FY the material concerns. Stk. 2: the only exception is retail cash-register tapes and similar internal vouchers (not subject to the 5 years). | High (enacted Lovtidende text) |
| R4 FI | Confirmed: 10 years from FY end for financial statements, annual report, books, chart of accounts, list of books and materials; 6 years from end of the calendar year in which the FY ended for vouchers, business correspondence and other material. Must stay accessible from Finland. | High (Finlex consolidated text) |
| R4 IS | Act 145/1994 art. 20 still in force: 7 years; annual accounts 25 years. No new act has passed. A comprehensive new act is a draft (consultation S-206/2026, 14-28 Oct 2026, planned in force 2028-01-01) that keeps 7 and 25 years and drops the must-store-in-Iceland rule. | Medium-High (7 years and draft High; 25 years in current act Medium, text not reachable) |
| S1 SAF-T | Confirmed: 1.40 is the only valid version for accounting periods starting 1 Jan 2027 or later; 1.30 usable up to and including FY2026. 1.40 is a small, backward-compatible XSD change. Pin 1.40 for FY2027+. | High |

---

## L4 Danish FI-kort creditor number (kreditornummer)

### Decision

Do not enforce a MOD11 (or any) check digit on the creditor number. Replace `fikValid` with "exactly 8 ASCII digits `[0-9]{8}`" and nothing else. Do not enforce the KMD 70000008-99999993 range or a leading-8 rule either.

### What the official sources say

The Nets (formerly PBS) "Blankethåndbog" for indbetalingskort (FIK 71 and 75 / "Det Fælles IndbetalingsSystem"), in the copies distributed by Danish banks, describes the creditor number only as follows:

- "Kreditornummeret er en éntydig 8-cifret identifikation af kreditor" assigned by the bank at sign-up; it carries no information about which bank the creditor uses (section 1.3).
- Read-line layout: card type code (71/75), payment ID, then the 8-digit creditor number in positions 25-32 (section 3.3.2). It is "Tildeles af pengeinstituttet" (assigned by the bank).
- Check digits are specified for other fields only: the payment identification (betalingsidentifikation, last digit) uses modulus 10; for card type 75 the amount check digit uses modulus 97 (worked example: 13457975 / 97 gives remainder 1). Nothing about a check digit, weights or modulus for the creditor number appears in any of these documents.

Sources read (full text extracted locally):
- Nets/PBS, "Fremstilling af indbetalingskort +71<", bank-hosted copy: https://www.kreditbanken.dk/media/api/content/mediafiles/m2bb5ylc/2bacd59e-2ba5-4875-96d8-1eba84ef2663.pdf (sections 1.3, 3.3; payment-ID MOD10 worked example: payment ID 02684014996532, weights 1,2,1,2 from the left of 14 digits, sum 62, check digit 8)
- Nets/PBS, "Fremstilling af indbetalingskort +75<" (Nets A/S print notice 06.17): https://www.djurslandsbank.dk/media/api/content/mediafiles/eokdvg4k/kortart-75.pdf (section 2.3 read line, 2.4.1 check-digit calculation)
- Nets Denmark A/S, "Betalingsservice og indbetalingskort - Vejledning for kreditorer": https://kaqa.gl/media/1fcc10b1-96de-4a42-8d32-66a543594655/wU8iCQ/Anvendelse/Brugervejledning/Inkasso/BS_vejledning_KR_DK.pdf (FI-kreditornummer is "found on the contract between you and your bank"; no format rule)

I could not locate a current (2026) Nets/Mastercard Payment Services or Finans Danmark FI-kort specification on a primary Nets site, only these bank-hosted copies of the Nets handbooks. Hence Medium (not High) that no newer document defines a creditor check digit.

### Check against the triage's evidence

- Nets sample creditor 80882939 (it appears in every sample card in the handbooks): MOD11 with weights 2,3,4,5,6,7 from the right gives check 9, which matches. I reproduced this. But this is one number, and a random 8-digit number passes a MOD11 check with probability about 1 in 11 (10 of 11 remainders yield a digit, but the check digit must equal one specific value).
- The "three independent hits" in the triage are not independent: the other two (70000008 and 99999993) are the range ends Codex quoted for a KMD integration, i.e. numbers a creditor-number generator may well produce at round boundaries; they are not official samples. Nets documentation itself supplies one number.
- `12345678` in the handbooks is the sample PBS number (Betalingsservice), not a creditor number, so it is not evidence either way.
- Secondary-only note (not used for the decision): two printer sites say creditor numbers "always begin with 8". That contradicts a 70000008-99999993 range and is not from an official source. Do not enforce a prefix.

Conclusion: the MOD11 hypothesis is unconfirmed by any official source. Enforcing an unspecified algorithm would reject valid creditor numbers issued by banks. The triage's own condition ("ask for a bank/Nets confirmation before shipping") is therefore not met, and the safer path is validate format only. If Jabran wants the check later, ask Nets (FI-godkendelse, Nets Denmark) in writing for the creditor-number rule; until then, treat a MOD11 mismatch as at most a soft warning, never a block.

### What must change

- `NeoERP-BackEnd` `PayeeRoutes.fikValid`: length 8 and ASCII `'0'..'9'` (not `Char.isDigit`). No MOD11.
- `NeoERP-App` supplier bank validation (`Suppliers.kt`, around lines 360-367): same ASCII 8-digit rule; no check digit.
- `SupplierApiTest.kt` lines 287-290: keep creditor `12345678`. Fix the nearby comment: a creditor number has no Luhn or MOD11 check; "Luhn" is wrong.
- Add a test: Arabic-Indic digits `٨٠٨٨٢٩٣٩` must be rejected.
- `codex-layouts-refs-triage.md` section B5 and `codex-decisions-2026-10-31.md` row L4: record "format only; MOD11 not supported by official sources".
- Separate, supported by the Nets handbook and worth a ticket if not done: the payment identification (15 digits including last-digit check) uses MOD10 with weights 2,1,2,1... applied from the right to the 14 data digits (2 on the 14th digit, i.e. rightmost), digit sums of two-digit products added, check = 10 minus (sum mod 10), 0 when the remainder is 0. NeoERP's FIK71/FIK75 validators should match this. FIK75 additionally has an amount check digit with MOD97.

---

## R4 Retention re-read

### Norway: bokføringsloven §13 as amended by lov 19 juni 2026 nr. 39

Sources:
- Current text and amendment banner: https://lovdata.no/dokument/NL/lov/2004-11-19-73 (§13 shows "Endres ved lov 19 juni 2026 nr. 39 (i kraft 1 jan 2027 iflg. res. 19 juni 2026 nr. 1154)").
- Amending Act: https://lovdata.no/dokument/LTI/lov/2026-06-19-39 (§13 annet ledd is replaced; the Act as a whole applies from a date set by the King, with the Ministry able to issue transitional rules; the date for §13 is 2027-01-01 per the Lovdata banner and the resolution cited there).

New text of §13 annet ledd (paraphrase with short quotes): material in first-paragraph nos. 1-4 is kept in Norway five years after the FY end; nos. 5-8 three years and six months after the FY end; originals may be replaced by transfer to other media if the ability to verify mandatory reporting is not weakened during the retention time; new: "Elektronisk faktura, jf. § 3 nr. 3, skal likevel oppbevares i sitt opprinnelige format"; and the Ministry may set further requirements for storage media by regulation (forskrift).

What actually changes against the current §13 (first paragraph nos. 1-8, third paragraph on orderly protection, fourth on readable/printable form and fifth on longer periods by regulation remain as shown today):
1. Retention periods (5 years; 3.5 years) and the in-Norway rule are unchanged.
2. New: an electronic invoice must be kept in its original format (a PDF rendering or re-export is not enough for the original). The Act's new §3 nr. 3 defines "elektronisk faktura" as a sales document issued, sent and received in a structured electronic format suited to automated processing in the accounting system.
3. The Ministry gets an express power to set storage-medium requirements (details come in the Bokføringsforskriften later; not yet read).
4. Related changes in the same Act that affect NeoERP but are outside §13: §7 (bookkeeping must be done in an electronic accounting system unless the Ministry decides otherwise), §10 (sales and purchases between bookkeeping-obliged parties must use electronic invoice format), §11 (documentation required for all balance-sheet items unless insignificant). Their entry-into-force dates were not confirmed (the Act says "the King decides", per provision).

Confidence: High for the Act text; Medium for the exact legal entry date of each provision other than §13.

What must change in NeoERP docs/code:
- `accounts-attachments.md` section 3 and `hosting-and-go-live-requirements.md` ACC-R6: add "NO e-invoices: retain the original structured file (EHF/Peppol BIS XML as sent or received) unchanged for 5 years from FY end, in addition to any rendered PDF". If the system receives or issues EHF invoices (see `codex-einvoicing`), the archive must hold the original XML, with checksum, not only a derived record. This pairs with the Peppol/e-invoicing work (R5/R6).
- Add an open item to read the Bokføringsforskriften amendment on storage media when published (flag as pre-2027 task).
- Do not change the NO retention numbers (5 years / 3.5 years) in ACC-R6.

### Denmark: bogføringsloven (lov nr. 700 af 24. maj 2022) §12

Source: enacted Act as published in Lovtidende, https://www.retsinformation.dk/eli/lta/2022/700/pdf (Lovtidende A, 25 May 2022, no. 700, "Lov om bogføring"), chapter 4 "Opbevaring af regnskabsmateriale".

- Stk. 1: businesses shall keep accounting material (as defined in §4) "på betryggende vis" for 5 years from the end of the financial year the material concerns, subject to stk. 2.
- Stk. 2: "Opbevaringsperioden i stk. 1 gælder ikke for detailhandelsvirksomheders kassestrimler og tilsvarende interne bilag" (retail businesses' cash-register tapes and similar internal vouchers). That is the only exception in §12.
- Related, same Act: §13 (protect against destruction, disposal, falsification, errors and misuse; carve-out for registrations and vouchers kept under §16 stk. 1 nr. 2); §14 (obligations when bookkeeping duty ends: the last management ensures continued retention); §15 stk. 1 nr. 1 (a digital bookkeeping system must support secure retention of entries and vouchers for 5 years); §22 (make material available to public authorities).
- I read the enacted 2022 text. I did not check for later amending acts or a consolidated version (LBK); Retsinformation's consolidated page is JavaScript-rendered and could not be fetched. Confidence High for the 2022 text, Medium for "no later change to §12".

What must change: no change to the DK 5-year figure. `hosting-and-go-live-requirements.md` ACC-R6 says "DK property 10 y". Nothing in bogføringsloven §12 supports 10 years; any 10-year property rule must come from another statute and is unverified here. Mark it "source needed" or remove it. Add the retail cash-tape exception to the policy table (rarely relevant to NeoERP, but it is the stk. 2 answer Codex left unread).

### Finland: kirjanpitolaki (1336/1997) 2 luku 10 §

Source: Finlex open data, consolidated text of Act 1336/1997 (fetched via opendata.finlex.fi, versions fin@20220167 and swe@20240991, the latter including amendments up to 1006/2025 in force 1.12.2025): https://www.finlex.fi/fi/lainsaadanto/1997/1336. The consolidated §10 text is identical in both versions, and no later amendment to chapter 2 §10 appears in the amendment list.

2 luku 10 § (Kirjanpitoaineiston säilytysaika):
- 1 mom.: financial statements, annual report, books, chart of accounts, and the list of books and materials must be kept at least 10 years from the end of the financial year, in a way that satisfies sections 6, 7 and 9.
- 2 mom.: unless another law sets a longer period, the FY's vouchers, business correspondence and other accounting material not in 1 mom. must be kept at least six years from the end of the calendar year in which the FY ended, again meeting sections 6, 7 and 9.
- 3 mom.: when operations cease or the bookkeeping duty ends, the bookkeeper or successor must arrange the archive as set out and notify the register authority who holds it.
- 4 mom.: the ministry managing EU structural funds may by decree require a longer period for material relating to funding.

Electronic and location rules (same chapter):
- 2 luku 9 §: material must be kept carefully, meeting section 7, so that authorities and the auditor can examine it from Finland without undue delay.
- 2 luku 7 §: the format of vouchers, books and other material may be changed if necessary for handling, transfer or storage, provided content and verification chain are secured. After the financial statements are prepared, content may not be altered.
- 3 luku 13 §: specifications of the balance sheet follow 2:7, 2:9 and 2:10 sections 1 and 3, so they are in the 10-year class.

Confidence: High. This upgrades the triage's FI line from "checked via secondary summaries only" to checked against the statute text.

What must change: none in numbers (FI ledgers 10 years, vouchers 6 years). Two precision fixes in the policy docs: (1) clock differs by class: the 10 years run from FY end, the 6 years from the end of the calendar year of the FY end; (2) add "balance-sheet specifications = 10-year class" and "archive must be examinable from Finland".

### Iceland: lög um bókhald nr. 145/1994 art. 20, and the new-act status

Official sources that loaded:
- Skatturinn (Iceland Revenue and Customs), bookkeeping guidance: https://www.skatturinn.is/atvinnurekstur/ad-hefja-rekstur/bokhald-og-tekjuskraning/nr/163: bookkeeping books, vouchers and other records, including electronic, must be kept "á tryggan og öruggan hátt í minnst sjö ár frá lokum reikningsárs"; cash-register internal tapes only three years if complete books and a signed annual report exist; some VAT-related records may need longer.
- Ministry of Business draft bill (new comprehensive Act on bookkeeping), consultation S-206/2026, published 14 Oct 2026, comments 14-28 Oct 2026, status "Í vinnslu": https://island.is/samradsgatt/mal/4353 and the draft text https://samradapi.island.is/api/Documents/15d30d7a-dec7-f111-9be0-005056bcce7e. Its art. 19 and section 3.6 of the explanatory text: bookkeeping and records kept securely for seven years from the end of the financial year; "Ársreikning skal varðveita í 25 ár frá lokum þess reikningsárs sem hann tekur til" (annual accounts 25 years from the end of the FY they cover); the general requirement to keep records in Iceland is dropped, with responsibility staying on the bookkeeper and authorities having prompt access; third-party hosting does not change the bookkeeper's duties. Art. 42: in force 1 January 2028; until the first FY beginning after that date, Act 145/1994 continues to apply. The Ministry's earlier notice (8 June 2026) says the same: storage will no longer be tied to Iceland.
- Not reachable: althingi.is consolidated text of 145/1994 (HTTP 403 bot check). A web-search result attributes to art. 20 paragraph 4 the 25-year rule for annual accounts and paragraph 1 the seven-year, in-Iceland rule, which is consistent with the draft's wording, but I could not read the article itself.

Decisions:
- 7 years (from end of FY) for books, vouchers and other records: confirmed by the tax authority (High).
- 25 years for annual accounts: present in the draft; current-act art. 20 paragraph (4) is Medium confidence only. Keep it in the policy table, tag "verify art. 20 text on althingi.is".
- Must-store-in-Iceland: current Act yes, draft drops it from 2028-01-01. Until the new Act is passed and in force, treat Iceland-stored (or Icelandic-accessible) archive as required.
- A new act has NOT passed: it is a consultation draft (not yet a parliamentary bill number as of today).

What must change: `hosting-and-go-live-requirements.md` ACC-R6 "IS 7 y" becomes "IS 7 y; annual accounts 25 y (verify text); in-Iceland storage required until new act in force (draft: 2028-01-01)". `codex-research-triage.md` IS row: remove the "25 yrs unverified" tag except for the art. 20 text. Re-check after Alþingi progress (the bill is expected in the 158th session 2026-2027).

---

## S1 Skatteetaten SAF-T Financial 1.40

### Decision

Target 1.40 for accounting periods starting 1 January 2027 or later. 1.30 only for FY2026 and earlier. This confirms NO-3 in `codex-sie-saft/triage.md`. Changes between 1.30 and 1.40 are small and backward compatible, so existing 1.30 design for accounts/grouping/tax codes carries over. Confidence High.

### Sources and dates

- Skatteetaten documentation page: https://www.skatteetaten.no/en/business-and-organisation/start-and-run/rutiner-regnskap-og-kassasystem/saf-t-financial/documentation: 1.40 documentation and technical description published 31 Aug 2026 (schematic views and legal-basis guide 30 Apr 2026); 1.40 "usable now, the only valid format from 1 January 2027"; 1.30 usable until 31 Dec 2026 (technical description dated 1 Mar 2024); 1.20 listed as ended 31 Dec 2024. The page says 1.40 supports full backward compatibility.
- Skatteetaten XSD and code lists live in https://github.com/Skatteetaten/saf-t:
  - 1.40 XSD: https://github.com/Skatteetaten/saf-t/blob/master/SAF-T_Financial_1.4/Norwegian_SAF-T_Financial_Schema_v_1.40.xsd (schema header `version="1.40"`, modified 30.04.2026)
  - 1.40 change description: https://github.com/Skatteetaten/saf-t/blob/master/SAF-T_Financial_1.4/About_SAF-T_Financial_schema_v.1.40.txt (states 1.40 is mandatory for the first financial period starting 1 Jan 2027 or later; voluntary before)
  - Bug-fix note covering 1.30 and 1.40: https://github.com/Skatteetaten/saf-t/blob/master/SAF-T_Financial_1.4/Bug%20fix%20in%20version%201.30%20and%20version%201.40.txt
  - 1.30 XSD: https://github.com/Skatteetaten/saf-t/blob/master/SAF-T_Financial_1.3/Norwegian_SAF-T_Financial_Schema_v_1.30.xsd
  - Code lists: `Grouping Category Code 2025-2026` (updated 2026-03-18, guidance for income statement codes added 2026-03-24), `Grouping Category Code` (older lists), `Standard Tax Codes/CSV/Standard_Tax_Codes.csv` (last changed 2021-04-14), `General Ledger Standard Accounts`.
- Overview/legal basis page (obligation effective for accounting periods from 1 Jan 2020; exemption under NOK 5 million turnover unless digital): https://www.skatteetaten.no/en/business-and-organisation/start-and-run/rutiner-regnskap-og-kassasystem/saf-t-financial

The version rule is by accounting period start, not by when the file is produced: a 2027 export of FY2026 data may still use 1.30; FY2027 data must use 1.40. Skatteetaten says only that it receives files on request (typically a control), so the version obligation bites when a tenant is asked for a file.

### Changes 1.30 to 1.40 (I diffed the two XSDs line by line)

Everything outside the items below is unchanged between 1.30 and 1.40.

1. Header: `AuditFileVersion` is still a free code; export the string `1.40`. (The schema version attribute is the only other version marker.)
2. `AmountStructure` (used on journal lines and elsewhere): element order is now CurrencyCode, new optional `VirtualCurrencyType`, `CurrencyAmount`, `ExchangeRate`, new optional `Country` (ISO 3166-1 alpha-2). Because the XSD is a sequence, an exporter that writes currency fields must keep this order; the new elements are optional so non-crypto tenants simply omit them.
3. New simple type `SAFlongmonetaryType` (up to 38 digits, 18 fractional); `CurrencyAmount` and `ExchangeRate` now use it (previously `SAFmonetaryType` and `SAFexchangerateType`). Existing 1.30 values remain valid.
4. `TaxInformationStructure`: new optional choice `DebitNOKTaxAmount` or `CreditNOKTaxAmount` (type `NOKAmountStructure`: `NOKAmount`, optional `NOKTaxBase`). Use only when the line's tax amounts are in a foreign currency, because the Bookkeeping Act §4-2 requires VAT to be fixed in NOK. This affects any exporter that books foreign-currency VAT lines.
5. `Owners`: `AccountID` may now repeat (maxOccurs unbounded).
6. Bug fix in both 1.30 and 1.40 XSD: the Header `SelectionCriteria` was optional in the schema by mistake; it is required (as the technical specification states). A 1.30 file without `SelectionCriteria` validated before, so confirm the exporter always writes it.

No change was found to: required `GroupingCategory` and `GroupingCode` on each `Account` (both required in both versions, `StandardAccountID` is not part of the Account structure in either), `TaxCode` / `StandardTaxCode` structure, the `Period` type (still `xs:nonNegativeInteger` with no maximum), or `PeriodStart`.

### Effects on NeoERP

- Confirms and closes NO-3. Update `NeoERP-BackEnd/docs/api/accounts-h-design.md`:
  - PH-6 (line ~45): "XSD 1.30 for NO" becomes "XSD 1.40 pinned (FY2027+), keep 1.30 XSD only if a FY2026-or-earlier export is in scope".
  - Section 5 (line ~121-125): format "SAF-T Financial 1.40"; delete "the version in force from 2025" for 1.30; state the rule "by accounting period start: 1.30 up to FY2026, 1.40 from FY2027".
  - Lines ~97-98: confirms NO-1: drop `saft_standard_account` as an export field (not in either XSD); make `saft_grouping_category` and `saft_grouping_code` required in the NO account pack; label them as 1.30 and 1.40 elements rather than "New in 1.30". Both are required per account, so tenants that cannot supply them must be blocked at export, not defaulted.
  - Lines ~144-145 (NO-2): the "period 13 reported in period 12" claim is not in either XSD; remove it. 1.40 keeps `Period` as an open non-negative integer, so period 13 is not forbidden by the schema. Decide against the Skatteetaten technical description (not read in full here).
- New open items to add to the H-NO slice:
  - Add NOK tax amount output for foreign-currency VAT lines (`NOKAmountStructure`).
  - Honour the new `AmountStructure` element order if currency fields are written.
  - Write `SelectionCriteria` always.
  - Pin the 1.40 XSD in the repo (PH-6) and validate against it in CI.
- Grouping categories and codes: Skatteetaten published a new list for 2025-2026 (March 2026). I did not find a list explicitly named for 2027. Before the NO pack is called ready, re-check the GitHub folders for a 2027 grouping list (or a statement that the 2025-2026 list remains valid) and use the category matching each company form (the folder has separate CSVs for forms such as RF-1167, RF-1175, RF-1323, RF-1501 and the næringsspesifikasjon list). Standard tax codes: the list is unchanged since 2021-04-14, so tax-code mapping needs no 1.40-specific change.

## Items not settled here

- L4: whether a current Nets/Mastercard specification (not the bank-hosted Nets handbooks) says anything about the creditor number. Needs a written answer from Nets if enforcement is ever wanted.
- R4-NO: the Bokføringsforskriften storage-media rules the amended §13 enables; entry-into-force dates of the other amended sections.
- R4-DK: later amendments and the consolidated text of bogføringsloven.
- R4-IS: art. 20 of 145/1994 on althingi.is (blocked from automated access).
- S1: whether a 2027 grouping-category list exists; Skatteetaten technical description for period 13.
