# Triage of Codex SIE, SRU and SAF-T report

Date: 2026-10-31. Subject: `docs/agents/codex-sie-saft/report.md`. Method: re-read the cited code, pack CSV, golden file and draft docs; compared against the SIE 4C PDF in the repo (`src/test/resources/sie/SIE_filformat_ver_4C_2025-08-06.pdf`, text extracted locally), the pinned Skatteverket 2026P4 field lists, the Skatteetaten v1.30 XSD and the Skatteetaten version page. No Gradle, no code run; parser claims checked by reading the code against a tiny sample record. Severity scale: High = wrong tax return or data loss on import; Medium = refused or wrong in a plausible case, or a plan error that costs rework; Low = hardening or disclosure.

Overall: the report is accurate and conservative. No finding is WRONG. Nothing reaches the "wrong tax return" or "data loss on import" bar today, because SRU filing and SAF-T are not implemented. Two findings overlap decisions the lead already made (SRU-2 = OP-10, SRU-2a = review C-4) and should not be treated as new defects.

## Summary (sorted by severity)

| ID | Verdict | Severity (ours) | Codex severity | One line |
|---|---|---|---|---|
| NO-3 | CONFIRMED | High (plan) | High | Draft targets SAF-T 1.30; Skatteetaten makes 1.40 the only valid version from 1 Jan 2027 |
| SIE-1 | CONFIRMED | Medium | High | Valid file with all balances omitted as zero is refused (`no_balances`); no data lost, a clear refusal |
| NO-1 | CONFIRMED | Medium (plan) | High | Draft plans a 2/4-digit `saft_standard_account`; 1.30 XSD has no such element, GroupingCategory and GroupingCode are required |
| SRU-4 | CONFIRMED | Medium | Medium | No INFO.SRU / BLANKETTER.SRU writer exists; SIE `#SRU` is not a tax return |
| SRU-1 | CONFIRMED | Medium, only if NE claimed | High | Export ignores `sie_sru_ne`; 1010 gives 7201 (INK2R), NE would be 7200 |
| NO-2 | CONFIRMED | Medium (plan) | Medium | Draft says SAF-T periods run 1-12; XSD allows any non-negative integer |
| SRU-3 | CONFIRMED | Low | Medium | Imported `#TAXAR` is discarded; no code-year provenance |
| SIE-3 | PARTLY | Low | Medium | Golden has UB 2099 = result with no closing voucher; this is a legitimate convention, importer already WARNs |
| SIE-2 | PARTLY | Low | Medium | Records after closing `#KSUMMA` are accepted; spec only covers records before it |
| SRU-2 | PARTLY | Low (known, OP-10) | Medium | 2860 to 7367 is correct for BAS group accounts; the franchise caveat is already a lead ruling |
| SRU-2a | PARTLY | Low (known, C-4) | Medium | 8850 NE `7505;7504` is a documented judgment row, UNCHECKED, not exported |
| SIE-4 | PARTLY | Low | Medium | Object-code collision after cleaning is real in the code; reachability unverified |
| SIE-5 | CONFIRMED | Low | Medium | Parser reads only account, objects, amount of `#TRANS`; no date validation |
| SIE-6 | CONFIRMED | Low | Low | Capacity limits are product choices; disclose |
| SRU-5 | CONFIRMED | Low | Low | Picker treats non-sign arrays as alternatives; fine until a simultaneous mapping appears |
| DK/FI | UNVERIFIED | n/a | n/a | Not independently checked (see below) |
| Vendor matrix | UNVERIFIED | n/a | n/a | Format-derived; no real Fortnox/Visma/BL file exists |

## Details

### NO-3 version policy: CONFIRMED, High (plan)
Skatteetaten page (fetched today): 1.40 usable now and the only valid format from 1 January 2027; 1.20 and 1.30 remain usable for financial year 2026 and earlier. `NeoERP-BackEnd/docs/api/accounts-h-design.md` section 5 says "SAF-T Financial 1.30 ... the version in force from 2025" with "verify" flags. A tenant exporting FY2027 with 1.30 would be rejected. Not a code defect, but it is the cheapest item to fix and the most expensive to get wrong later.
Fix: change the draft to "pin 1.40 for FY2027+, keep 1.30 only if a FY2026-or-earlier request is in scope"; fetch the 1.40 XSD and re-verify NO-1/NO-2 against it (UNVERIFIED here: I checked 1.30 only).

### SIE-1 zero-balance rejection: CONFIRMED, Medium
`SieParser.kt` ~672: `balanceRecords == 0L` and not 4I yields `SIE_FILE_UNREADABLE no_balances` (BLOCK). SIE 4C marks `#IB` as mandatory but "balance records with zero balance may be omitted" (4C record table; the same note is in 4B). Sample: a new company, `#RAR 0`, `#KONTO` lines, no `#IB/#UB/#RES` is valid and is refused. Severity Medium, not High: a clear refusal, nothing silently lost, and a company with literally no balances has nothing to import. Fix: when `#RAR` is present and the file is not 4I, treat zero balance records as an empty dataset with an INFO problem instead of BLOCK. Add the two fixtures Codex proposes (zero-company, zero-net-year).

### NO-1 mapping model: CONFIRMED, Medium (plan)
XSD v1.30 `Account`: `GroupingCategory` and `GroupingCode` required; no `StandardAccountID` element declared. The draft table still lists `saft_standard_account (2 or 4 digits)` as the primary field and `saft_grouping_*` as a secondary "New in 1.30". Fix: drop `saft_standard_account` as an export field (keep as optional legacy metadata), make grouping fields required in the account pack, and note which category values apply per company form.

### SRU-4 and SRU-1: CONFIRMED
`SieExporter.kt` chart section calls `SieSruPicker.pick(a.sieSru, a.sieSruBySign, ...)`; no use of `sieSruNe` anywhere in the statutory export (grep: only DTO/controller). `se-sie.csv` row 1010 is `7201` / `7200`; the pinned INK2R sheet has 7201 as "2.1 Immateriella anläggningstillgångar" and the NE sheet 7200 as "B1. Immateriella anläggningstillgångar". Correct for an AB; wrong for a sole trader if NE filing is later offered on the same export. No SRU declaration file writer exists. Fix: keep scope statement "INK2R account annotation only" in docs; when NE is built, select the metadata column by legal-form profile.

### NO-2 period 13: CONFIRMED, Medium (plan)
`Transaction/Period` is `xs:nonNegativeInteger` with no maximum; `PeriodYear` is 1970 to 2100. The draft's "periods run 1-12, period 13 reported in 12" is unsourced and lossy. Fix: remove the claim; decide with Skatteetaten technical description (p28) whether period 13 is allowed (the XSD does not forbid it).

### SRU-3 TAXAR: CONFIRMED, Low
Parser `record()` ignores `TAXAR`. Export derives it as fiscal-year end year + 1 (`SieExporter.kt` line 195). Only matters if imported SRU codes are later compared against a form edition. Fix: store source TAXAR on the import facts when the SRU-review feature starts; no action now.

### SIE-3 year-end convention: PARTLY, Low
Golden: `#UB 0 2099 -16749.25`, `#IB` absent for 2099, and the three `#RES` lines sum to exactly -16749.25 (-20000.00 + 8250.75 - 5000.00). So UB includes the closed result, RES shows the pre-closing result, and the file has no closing voucher. That is the usual shape of a closed year in SIE exports, and vouchers are optional in type 4E. The code comment in `SieExportFigures.kt` ("#RES is the result before closing") shows it is deliberate. The only cost is that IB + vouchers does not reproduce UB for 2099, which our own importer reports as a WARN. Fix: none required; add one sentence to the export doc so a vendor importer's check is not a surprise. Do not change the convention without an accountant.

### SIE-2 data after closing checksum: PARTLY, Low
4C 10.14: the checksum covers records from after the opening `#KSUMMA` up to but excluding the closing one. 10.4 shows the closing `#KSUMMA` last, but the spec does not say a reader must reject later records. Code: `ksumma()` sets `crcActive = false`; later records still reach `record()`; `balance()` assigns unconditionally unless the cell is new and over the storage cap (`if (fresh && !stored()) return`, then `c.ub = amt`), so a duplicate `#UB 0 1930 999` after the checksum overwrites the earlier value, as Codex says (last wins). Spec-wise this is tolerance of a malformed file, not a violation, and a duplicate row inside the checksummed region would behave the same way unflagged. Fix, cheap (also warn on duplicate balance rows): after the closing checksum, emit a WARN (or BLOCK) for any further record other than blank lines. Medium effort not warranted.

### SRU-2 2860 and SRU-2a 8850: PARTLY, Low (already decided)
- 2860 is BAS "Skulder till koncernföretag", INK2R 2.47 (7367) is "koncern-, intresse- och gemensamt styrda företag": the mapping is correct for the BAS account. The franchise concern is the repo's own re-use of 2860 (pack `se-bas.csv` note). `accounts-packs-2026-3.md` OP-10 is a lead ruling: franchise non-group balances use ordinary payable accounts, remap in slice F, row ships UNCHECKED, and the doc already names 7261/7369. Codex re-raises a known, decided item. Note for slice F: INK2R 2.48 (7369) is "Skulder till övriga företag som det finns ett ägarintresse i och övriga skulder", so ordinary trade creditors would use the trade-payables line, not 7369; confirm when slice F is designed.
- 8850 NE `7505;7504`: documented in the pack doc as judgment, default 7505, alternative 7504, UNCHECKED, not exported. Codex agrees it is latent.

### SIE-4 object-code collision: PARTLY, Low
`SiePreflight` compares trimmed Unicode codes; `appendClean` strips trailing backslashes and control characters; the CP437 encoder replaces unsupported characters. So two distinct codes can emit the same text. Code reading confirms the mechanism; whether upstream allows such codes is unverified (codes are mostly ASCII-like identifiers). Fix: run the uniqueness check on the cleaned and encoded form; one small test.

### SIE-5 and SIE-6: CONFIRMED, Low
`trans()` reads account, object list, amount and ignores date, text, quantity and sign: confirmed. The parser is a balance and history reader, which fits the documented scope. Limits (8-digit accounts, 20 years, 5,000 accounts) are protective product limits.

### SRU-5: CONFIRMED, Low
`SieSruPicker` doc says non-sign arrays are alternatives and only element 1 is exported. No row needs simultaneous output today.

### SRU CSV fidelity and field-list claims: UNVERIFIED (not re-run)
Codex says the committed INK2R/NE CSVs match every cell of the official XLS and lists INK2/INK2S codes. I spot-checked the codes I touched (7201, 7200, 7367, 7369, 7383, 7421, 7526, 7450, 7550, 7504, 7505) in the committed CSVs and they match Codex's descriptions. I did not re-download the Skatteverket package, so INK2 / INK2S codes (7104, 7114, 8040 etc.) and the P4 "7012" rule are unverified by me.

### Denmark and Finland: UNVERIFIED
Not independently fetched. Codex's Danish dates (SAF-T 2.1 from 1 Jan 2027 for registered systems) and the Finnish absence are plausible but should be re-read from erhvervsstyrelsen.dk and vero.fi before they go into a roadmap. Treat as leads.

### Vendor robustness matrix: UNVERIFIED
Format-derived only; Codex says so. No Fortnox/Visma/BL fixture exists. Worth obtaining three real files before claiming interoperability.

## Missed by Codex
Nothing material found beyond the above. One note: `accounts-h-design.md` also still says 1.30 "in force from 2025", the same stale premise as NO-3.

## Decisions for Jabran

1. **SAF-T target version.** Recommendation: target 1.40 for FY2027 and later, treat 1.30 as legacy only if a customer needs FY2026-or-earlier files. Alternative: keep 1.30 and accept that FY2027 deliveries would be refused. Cost of the recommendation: re-check the draft against the 1.40 XSD before slice H-NO starts.
2. **Zero-balance import (SIE-1).** Recommendation: accept as an empty dataset with an INFO note. It is a small parser change plus two fixtures and removes a refusal of valid files. Alternative: leave as is and document that empty-balance files are unsupported.
3. **Scope statement for SRU.** Recommendation: state in the pack doc that `#SRU` in the SIE export is an INK2R (AB) account annotation only, with NE and INK2/INK2S filing out of scope until a legal-form profile exists. No code change now (SRU-1, SRU-4).
4. **Hardening bundle (SIE-2, SIE-4, SIE-5).** Recommendation: batch as one small Low-priority ticket for the next SIE touch (warn on data after closing checksum, check object codes after cleaning, date diagnostics). Alternative: skip until a vendor file exposes a need.
5. **Year-end convention (SIE-3).** Recommendation: keep as is, add one line to the export doc. Revisit only if a vendor importer rejects the reconciliation.
