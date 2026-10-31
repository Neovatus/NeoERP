# Triage of the Codex statement-layout and payment-reference reports

Date 2026-10-31. Reviewer: adversarial verification before any fix. Repos read-only. PROJECT-STATE files not read.
Reports checked: `docs/agents/codex-statement-layouts/report.md` (brief §3) and `docs/agents/codex-payment-refs/report.md` (brief §4).

Method. Layouts: read V13/V20/V23/V24 and the 2026.2 chart CSVs line by line for every cited row; read the primary law text where it could be fetched (DK LBK 402/2026 bilag 2, SE ÅRL bilaga 2 on riksdagen.se, FI PMA 1753/2015 Annex I on finlex, IS reglugerð 696/2019 art. 3 and 5). Payment references: recomputed every Codex vector with throwaway Python (`.../scratchpad/vec.py`), read both validators (backend `ApDocuments.kt`/`Payables.kt`/callers, app `PayablesSupport.kt`/`BillEditor.kt`/`Suppliers.kt`/`ReceiptEditor.kt`), fetched the Mastercard KID page. Gradle tests were not run (the repos are read-only and the validators are small; the Python port was checked against the Kotlin line by line). Where I could not reach a primary source the verdict is UNVERIFIED, not a guess.

Severity scale: High = wrong statutory line or wrong classification in output a customer would file or pay from; Medium = real gap or backend/app mismatch with a workaround; Low = wording, order of minor lines, documentation, edge cases.

## Summary table (sorted by severity)

| ID | Finding | Verdict | Severity | Fix type |
|---|---|---|---|---|
| A1 | Finland has no "Voitto (tappio) ennen tilinpäätössiirtoja ja veroja" before appropriations | CONFIRMED | High | forward migration V40 |
| A2 | Long-term receivables 1380/1390 land in current assets (all 6 charts) | CONFIRMED | High | pack + V40 mapping |
| A3 | Long-term other debt 2290 (SE 2390) lands in current liabilities | CONFIRMED | High | pack + V40 mapping |
| A4 | SE 2350/2360 (long-term) mapped current; 2410 (short-term) mapped non-current | CONFIRMED | High | pack chart data |
| A5 | Short-term investments group 18 (1800/1810) land in non-current assets | CONFIRMED | High | pack + V40 mapping |
| B1 | FIK +73 cannot be saved: draft requires a reference for every non-NONE type; app has no FIK73 and turns it into None | CONFIRMED | Medium | backend + app |
| B2 | Backend accepts failed OCR with a warning (SOFT), app blocks Submit | CONFIRMED | Medium | app |
| B3 | OCR VARIABLE_LENGTH / FIXED_LENGTH / HARD agreements not implemented or stored | CONFIRMED | Medium | backend + app + schema |
| B4 | IBAN: backend has no national length/pattern rules; app has no checksum | CONFIRMED | Medium | backend + app |
| B5 | FIK creditor number: no MOD11, accepts Unicode digits; app no check | CONFIRMED (weights now evidenced) | Medium | backend + app + 1 test fixture |
| A6 | `layoutStatus = STATUTORY_LAYOUT` is reported although A1-A5 misroutes exist | CONFIRMED | Medium | decision |
| A7 | DK and SE expense order and missing "external costs" line | CONFIRMED | Medium | new layout rows |
| A8 | NO 2030 "Other paid-in equity" feeds earned equity | CONFIRMED | Medium | pack + V40 mapping |
| A9 | SE operating FX (3960/3961/7960/7961) feeds finance items | CONFIRMED | Medium | pack chart data |
| A10 | PK face-disclosure lines and gross-profit allocation | UNVERIFIED | Medium | decision |
| B6 | Empty reference with explicit type: app passes, API refuses | CONFIRMED | Low | app |
| B7 | KID minimum length 2 (contract, pack) vs 4 (operator) | CONFIRMED (operator), PARTLY (law of the standard) | Low | decision |
| B8 | KID accepted as MOD10 or MOD11 regardless of agreement | CONFIRMED | Low | backend + app |
| B9 | App has no Bankgiro, Plusgiro, FIK creditor checks | CONFIRMED | Low | app |
| B10 | Receipt payer reference: no checksum, no `PAYER_REFERENCE_INVALID` | CONFIRMED | Low | backend + app |
| B11 | (new) Bankgiro/Plusgiro/FIK use `Char.isDigit` (Unicode digits) before arithmetic | NEW, CONFIRMED by reading | Low | backend |
| A11 | Iceland: other operating expenses before depreciation; provisions inside long-term liabilities | CONFIRMED | Low | new IS layout |
| A12 | Finland equity: 2020 share premium, 2048 reserves | PARTLY (chart facts true, law cite not fetched) | Low | decision |
| A13 | SE subtotal wrongly attributed to ÅRL bilaga 2 in V24 and A3 | CONFIRMED (docs only) | Low | docs |
| A14 | Contract drift: packs §2.4 `PL_DK_GROSS`, label_local, A3 selection table, 1753 cited as KPA | CONFIRMED | Low | docs |
| A15 | Fixed English captions, no country wording | CONFIRMED | Low | decision |
| A16 | Denmark: "Resultat efter finansielle poster" absent in law, so our omission is right | CONFIRMED (no defect) | none | none |
| A17 | NO rskl §6-1/§6-2 comparison | UNVERIFIED | Low | re-check later |
| B12 | Every listed test vector recomputes as Codex states | CONFIRMED (0 arithmetic errors) | none | none |
| B13 | KID/OCR/FIK71/FIK75/FI-ref/RF arithmetic identical in backend and app | CONFIRMED | none | none |
| B14 | Existing test files use their own arithmetic / do not call production code | UNVERIFIED | Low | n/a |

Counts (31 findings). Verdicts: CONFIRMED 26 (A 14, B 12), PARTLY 2 (A12, B7), UNVERIFIED 3 (A10, A17, B14), WRONG 0. Severity: High 5 (A1-A5), Medium 10, Low 13, no defect 3 (A16, B12, B13). B11 is new (not in the Codex reports).

## Part A: statement layouts

### A16 Denmark open item (resolved)

CONFIRMED. LBK 402 of 23 March 2026, bilag 2: skema 3 (artsopdelt, pp. 59) runs 1 Nettoomsætning, 2 Ændring i lagre, 3 Arbejde udført for egen regning, 4 Andre driftsindtægter, 5 Eksterne omkostninger (a råvarer, b andre eksterne) with "(Bruttofortjeneste/Bruttotab)", 6 Personaleomkostninger, 7 Af- og nedskrivninger, 8 Nedskrivninger af omsætningsaktiver, 9 Andre driftsomkostninger, 10-15 finance items, 16 Skat af årets resultat, 17 Andre skatter, 18 Årets resultat. Skema 4 (funktionsopdelt) likewise. Neither contains "Resultat før/efter finansielle poster" or any other named operating or pre-tax subtotal. V24 removing `RESULT_AFTER_FINANCIAL_ITEMS` from `PL_NATURE` is correct for DK. Our `OPERATING_RESULT` and `RESULT_BEFORE_TAX` lines are supplementary (allowed as long as the statutory items are present). Close the open item. No fix.

### A1 Finland pre-appropriation subtotal

CONFIRMED, High. PMA 1753/2015 Annex I (finlex main.pdf, verified): 9 LIIKEVOITTO (-TAPPIO), 10 Rahoitustuotot ja -kulut, 11 VOITTO (TAPPIO) ENNEN TILINPÄÄTÖSSIIRTOJA JA VEROJA, 12 Tilinpäätössiirrot, 13 Tuloverot, 14 Muut välittömät verot, 15 TILIKAUDEN VOITTO (TAPPIO). The KPA/kirjanpitoasetus 1:1 layout has the same shape (the finlex statute page is JavaScript-rendered, so I verified through the PMA annex that reproduces it; the accounts-packs-2026-2 §2.4 text already promises this exact FI line, which is independent corroboration inside our own contract).
Ours: V24 deleted `RESULT_AFTER_FINANCIAL_ITEMS` for the layout FI shares (`PL_NATURE`) and `RESULT_BEFORE_TAX = OPERATING_RESULT + FINANCE_INCOME - FINANCE_COSTS - APPROPRIATIONS` sits after appropriations. FI therefore shows no subtotal before appropriations; with operating+finance 100, appropriations 20, tax 10 the law line (100) is missing. Worked example in Codex is right.
Fix (forward migration `V40__fi_pl_layout.sql`, accounts next free number is V40, last is V39):
1. `INSERT` layout `PL_NATURE_FI` (copy `report_layouts`, `report_sections`, `report_line_map` from `PL_NATURE` exactly as V24 did for `PL_NATURE_SE`).
2. In `PL_NATURE_FI` add section `RESULT_BEFORE_APPROPRIATIONS_AND_TAX` (SUBTOTAL, sort 100, formula `+OPERATING_RESULT+FINANCE_INCOME-FINANCE_COSTS`); delete `RESULT_BEFORE_TAX`; set `RESULT_FOR_THE_YEAR` formula `+RESULT_BEFORE_APPROPRIATIONS_AND_TAX-APPROPRIATIONS-INCOME_TAX`.
3. `UPDATE accounts.pack_report_layouts SET pl_layout='PL_NATURE_FI' WHERE pack_code='FI'`.
4. `StatementWords.name`: add the new code (English "Result before appropriations and tax") and `PL_NATURE_FI` to the layouts that use goods-and-materials wording (line 19). App `StatementNames.kt:158` and `MockA3Fixtures.kt` mention section codes; check the new code renders (falls back to humanised code today).
5. Check nothing else reads `RESULT_BEFORE_TAX` by code for FI (backend main: only StatementWords; app: StatementNames and mock fixtures).
Alternative with less change: keep `PL_NATURE` for FI and add the new subtotal to `PL_NATURE` for all of NO, DK, IS too. Not recommended: NO/DK/IS have no such line.

### A2, A3, A5 Maturity misroutes in balance sheets

All CONFIRMED, High. Verified from V13 line maps (BS_NORDIC, _NO, _SE, BS_IFRS all identical on these rows) and the chart rows: `OTHER_RECEIVABLE -> CURRENT_ASSETS`; `FINANCIAL_ASSET -> NON_CURRENT_ASSETS`; `LIABILITY/OTHER_PAYABLE -> CURRENT_LIABILITIES`. The cited accounts exist with those subtypes: 1380/1390 "Long-term loans to employees / deposits" (dk.csv:31-32, no-ns4102:28-29, fi:31-32, is:31-32, pk:31-32, se-bas:24 for 1380) feed current assets; group 18 is headed "Short-term investments" in every chart (Kortfristiga placeringar in SE) yet 1800/1810 use `FINANCIAL_ASSET` and feed non-current; 2290 "Other long-term liabilities" (dk:89, no:78, fi:89, is:88, pk:93) and SE 2390 feed current liabilities. Totals still balance, only the current/non-current split is wrong, which is what ratios and covenants read.
Fix. Maturity cannot be derived from subtype alone, so the clean fix is new subtypes plus mappings, shipped as a new pack/chart version and `V40` mapping rows:
- New subtypes `FINANCIAL_ASSET_CURRENT` (CURRENT_ASSETS), `OTHER_RECEIVABLE_NON_CURRENT` (NON_CURRENT_ASSETS), `OTHER_PAYABLE_NON_CURRENT` (NON_CURRENT_LIABILITIES) added to `report_line_map` for BS_NORDIC, BS_NORDIC_NO, BS_NORDIC_SE, BS_IFRS (12 rows).
- New chart version (next pack, e.g. 2026.4 charts) re-subtypes: 1800/1810 to `FINANCIAL_ASSET_CURRENT`; 1380/1390 to `OTHER_RECEIVABLE_NON_CURRENT` (or simply `FINANCIAL_ASSET`, which is non-current and is where statute puts long-term receivables, avoiding a new subtype for assets); 2290/2390 to `OTHER_PAYABLE_NON_CURRENT`.
- Existing tenants hold copied accounts: a one-off, reviewed per-company re-subtype (not a template edit) or an explicit "adopt new chart version" path. Do not edit migration V13 or the 2026.2 CSVs (frozen).
Open point: if `subtype` values are checked by a constraint or enum in the pack validator (`Pack2026.kt`), extend it in the same change. I did not find a constraint on these names in backend main, but did not search the pack validators exhaustively.

### A4 Swedish borrowing maturities

CONFIRMED, High. se-bas:75-76 2350/2360 are named "Andra långfristiga skulder till kreditinstitut" / "Långfristiga skulder till koncernföretag" but carry `BORROWING_CURRENT` (current liabilities); se-bas:79 2410 "Andra kortfristiga låneskulder till kreditinstitut" carries `BORROWING` (non-current). Exactly reversed. Fix: chart data in the new version: 2350/2360 to `BORROWING`, 2410 to `BORROWING_CURRENT`; same existing-tenant handling as A2. Codex is right not to invent a rule for 2330 overdraft (needs facility terms; UNVERIFIED, leave).

### A6 STATUTORY_LAYOUT flag

CONFIRMED, Medium. V20 sets `statutory_split = true` simply because a published chart carries `BORROWING_CURRENT` or `PROVISION_CURRENT`; `StatementReadService.kt:122` then reports `STATUTORY_LAYOUT`. It validates nothing about line order or the A1-A5/A7-A9 misroutes. Decision for Jabran (below): suppress the flag until A1-A5 are fixed.

### A7 DK and SE expense order

CONFIRMED, Medium. Verified law text. DK skema 3: external costs (item 5) precede personnel (6), then depreciation (7), impairment of current assets (8), other operating costs (9). SE ÅRL bilaga 2 (riksdagen.se, 21 items): raw materials, Övriga externa kostnader, Personalkostnader, Av- och nedskrivningar, Nedskrivningar av omsättningstillgångar, Övriga rörelsekostnader. Ours (all nature layouts): goods and materials, personnel, depreciation, other operating expenses (which holds external costs, groups 61-78 in DK, 50-65 in SE). So external costs print after depreciation and are merged with other operating costs. Not wrong as a management report; wrong against the statutory form. Fix: a new section `EXTERNAL_COSTS` in `PL_NATURE_DK` and `PL_NATURE_SE` (sort between COST_OF_SALES and EMPLOYEE_BENEFITS) fed by a new subtype `EXTERNAL_COST` assigned in the chart to the external-cost groups. That is chart + layout work; do after A1-A5. Law says small and medium entities may condense (DK §§32, 81), so it is conditional for them.

### A8 Norway 2030

CONFIRMED, Medium. no-ns4102:64 "Other paid-in equity" has subtype `RESERVE`; `BS_NORDIC_NO` maps `RESERVE -> EQUITY_EARNED` (SHARE_PREMIUM goes to paid-in). Fix: re-subtype 2030 to `SHARE_PREMIUM` (maps to `EQUITY_PAID_IN`) in the new chart version. Law column (rskl §6-2) UNVERIFIED by me (lovdata blocked), but the account's own name decides it.

### A9 Swedish operating FX

CONFIRMED, Medium. se-bas:151-152, 255-256: 3960/3961/7960/7961 are named "...på fordringar och skulder av rörelsekaraktär" yet carry `FX_GAIN`/`FX_LOSS`, which map to FINANCE_INCOME/FINANCE_COSTS. Inconsistent with the chart's own names regardless of K2 (Codex's BFN K2 citation not independently fetched). Fix: re-subtype these four to `OTHER_OPERATING_INCOME` / `OPERATING_EXPENSE` (existing subtypes) in the new chart version, keeping the `FX_REALIZED_*` roles. Check that the posting role mechanism does not depend on the subtype.

### A11 Iceland

CONFIRMED, Low. reglugerð 696/2019 5. gr. (current PDF, verified): 1 Hrein velta, 2 Aðrar rekstrartekjur, 3 Kostnaðarverð seldra vara (including annar ytri kostnaður), 4 Laun, **5 Önnur rekstrargjöld, 6 Afskriftir og virðisrýrnun**, 7 hlutdeild í afkomu, 8 Fjármunatekjur, 9 Fjármagnsgjöld, 10 Tekjuskattur, 11 aflagðri starfsemi, 12 Hagnaður eða tap ársins. No operating-result or pre-tax subtotal (V24 right). Ours puts depreciation before other operating expenses. Art. 3 balance sheet lists provisions (Lífeyrisskuldbindingar, Aðrar skuldbindingar) under 4 Langtímaskuldir; ours shows PROVISIONS as a separate section. Fix: `PL_NATURE_IS` and `BS_NORDIC_IS` layouts in a later migration; low priority.

### A12 Finland equity

PARTLY, Low. Chart facts true (fi:70 2020 `SHARE_PREMIUM` -> unrestricted in `BS_NORDIC_SE`; fi:74 2048 `RESERVE` -> restricted). The Act 625/2006 §13 point (legacy share premium fund is restricted) was not fetched. Decision/leave: classifying every `RESERVE` as restricted is a coarse choice; revisit with an accountant.

### A13, A14 Documentation

CONFIRMED, Low. SE ÅRL bilaga 2 has no "Resultat efter finansiella poster" (verified, 21 items above), yet V24 comment and `accounts-a3.md` ~line 224 say it is in bilaga 2. The subtotal can stay as a K2/K3-style supplementary line but the source note is wrong. `PL_DK_GROSS` appears only in `accounts-packs-2026-2.md` §2.4 (no migration/row), `label_local` section labels are promised but not implemented, A3 §3.1 selection table still lists old layout names, and 1753/2015 is the PMA (verified: the finlex main.pdf header and Annexes I-II), not an amendment of the KPA. Fix: docs-only edits to those contracts; do not touch frozen migrations.

### A10 Pakistan

UNVERIFIED, Medium. Not reachable: SECP Fifth Schedule text, IFRS SMEs module PDFs. Plausible and consistent with our code: PK gross profit subtracts only `COST_OF_SALES` subtype (V13 `PL_NATURE_GP`), and revaluation reserves merge into `RESERVE` (pk:79-80). Not claiming it is wrong. Needs a Pakistani accountant's confirmation. Decision below.

### A15 Captions

CONFIRMED, Low. `StatementWords.kt` is fixed English; the packs §2.4 label_local promise is unimplemented. A product decision, not a defect.

### A17 Norway law comparison

UNVERIFIED, Low. Lovdata gave no text to me or to Codex. Order matches my knowledge of rskl §6-1 but unchecked.

### Spot check of Codex's crosswalk (§3.1)

I did not rebuild all six crosswalk tables. Every chart row cited in the report (about 40 rows across six CSVs) was opened and matches its stated subtype, parent group and description; group 18 header names match. No discrepancy found. Treat the table as likely right, not certified.

## Part B: payment references

### Vector recomputation (all vectors Codex lists)

Computed independently from the specification formulas (Mastercard KID page for MOD10/MOD11 incl. `-` for remainder 1; Luhn; 7-3-1; ISO 7064 mod 97). Results: every expected value in every Codex table is arithmetically correct. Specifics: `123456701123453` valid Luhn (payload check 3); `123456701123458` valid MOD11 (sum 179, remainder 3, check 8); `123456701123454` fails both; `104-` valid (sum 12, rem 1, minus); `1031` valid (sum 10, rem 10, check 1); `103-` wrong; `18` valid Luhn; `6-` valid MOD11; `000` valid both; OCR `12345682` valid, penultimate digit 8 equals length 8; `1234566` valid Luhn but length 7 with penultimate digit 6, so it fails VARIABLE_LENGTH (needs 7); FIK71 `026840149965328` (15, valid), `...329` wrong, +75 `0026840149965328` and `0000010400012505` valid; FI ref `12 34561` valid (sum 89), `1232` valid, 20-digit `12345678901234567894` valid, 21-digit `...8908` checksum-valid but too long; RF54 1234, RF98REF1234, RF25A, RF95 and RF22 (22 chars) all remainder 1; IBANs FI21..., FI75..., NL39... valid, FI22 wrong check, the three FI mutations (17, 19 chars, alphabetic BBAN) have remainder 1 as Codex says; Bankgiro 9912346 and 55555551 valid, 9912347 and 55555552 wrong; Plusgiro 44347 valid, 44348 wrong. B12 CONFIRMED.
Backend and app helper results match Codex's columns on all of these (read from `ApDocuments.kt:225-275` and `PayablesSupport.kt:195-270`). The two implementations are equivalent on non-empty input: same regexes, same Luhn, same MOD11 table, same 7-3-1, mod 97 by BigInteger vs streaming remainder (identical results). B13 CONFIRMED.

### B1 FIK +73

CONFIRMED, Medium. `ApDocuments.kt:240` accepts any text for FIK73, but `BillDraftService.paymentReference` (lines 230-238) throws `paymentReference required with its type` for every type except NONE or absent, so a +73 bill (no payment ID by design) cannot be saved without inventing a value. App `ReferenceType` has no FIK73; `fromWire("FIK73")` returns `None` (PayablesSupport.kt:187), so a bill read from the server loses its type and a re-save drops it. Fix: backend: in `paymentReference()` allow blank for FIK73 (store type FIK73, null reference); `requirePaymentReference` already passes. App: add `Fik73("FIK73","FIK +73")` to the enum, keep `valid` true, hide the reference field for it. Add a round-trip test.

### B2 OCR SOFT mismatch

CONFIRMED, Medium. Backend: `BillRules.requirePaymentReference` returns immediately for OCR (line ~603) and `ApDocumentReadService` (~129) adds a `PAYMENT_REFERENCE_INVALID` warning with `controlLevel=SOFT`. App: `BillEditorState.referenceProblem` runs `PaymentReferenceCheck.valid` for all types and `blockedBy` (line ~437) disables Submit. So an OCR that Bankgirot's SOFT level accepts and the server accepts cannot be submitted from the app. Fix: in `BillEditor.kt` make `referenceProblem` ignore `ReferenceType.Ocr` (show it as a warning, not in `blockedBy`) until B3 stores a control level.

### B3 OCR control levels

CONFIRMED, Medium. No control level or agreed length is stored or checked (pack CSV `payment-reference-schemes.csv` lists `SOFT|HARD|VARIABLE_LENGTH|FIXED_LENGTH`, default SOFT, but nothing reads it for validation). Contract C-22/C-35 requires it; Codex notes that the contract's own implementation notes admit the gap. Fix: supplier fields `ocrControlLevel` and `ocrLengths`, server-side checks (VARIABLE: penultimate digit equals length mod 10; FIXED: length in list; HARD refuses), then mirror in the app. Schema change, so own slice.

### B4 IBAN

CONFIRMED, Medium. Backend `PayeeRoutes.IBAN` is only `[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}` plus mod 97: `FI211234560000078` (17), `FI59123456000007850` (19), `FI62A2345600000785` pass (all remainder 1, computed). App `bankProblems` (`Suppliers.kt:360-367`) checks shape only, no mod 97 (`FI2212345600000785` and `NO931234` pass locally). Fix: backend add a country-length table (SWIFT registry; at least NO 15, SE 24, DK 18, FI 18, IS 26, PK 24 plus the BBAN pattern for those six) before mod 97; app: reuse the existing mod 97 function from `PaymentReferenceCheck` for IBANs and the same table. Normalisation difference (app strips every non-alphanumeric character, backend strips space, dot, dash) is Low; align on backend rule.

### B5 FIK creditor number

CONFIRMED lack of check, Medium. Backend `PayeeRoutes.fikValid` is length 8 and `Char.isDigit` (Unicode digits accepted, e.g. Arabic-Indic `٨٠٨٨٢٩٣٩` passes); app has no check. Codex said the MOD11 weights were not verified. I can narrow this: with weights 2,3,4,5,6,7 repeating from the right (then 2 again) and check = (11 - sum mod 11) mod 11, the Nets sample creditor `80882939` validates (payload 8088293 gives 9), and both ends of the KMD range quoted by Codex validate (`70000008`: 14 -> 8; `99999993`: 261 -> 3). Three independent hits (about 1 in 1000 by chance). I treat the weights as strongly evidenced but still ask for a bank/Nets confirmation before shipping. Consequence: existing test fixture `SupplierApiTest.kt:287-290` uses creditor `12345678`, whose check would be 4, not 8, so adding MOD11 requires changing that fixture (e.g. to `80882939`); the nearby comment "Valid ... (Luhn)" is wrong for creditors. Fix: backend `fikValid` use ASCII `[0-9]{8}` plus MOD11 (remainder 10 is invalid, no minus), app mirror, update the fixture. Do not enforce the KMD 70000008-99999993 range (integration-specific).

### B6 Empty reference with explicit type

CONFIRMED, Low. App `valid` returns true for empty (`PayablesSupport.kt`: `if (r.isEmpty()) return true`) so Submit stays enabled; the API refuses with validation `paymentReference required with its type`. Fix: app treat empty as a problem when the type is not None/Free (and not FIK73 after B1). Note FREE also requires a value server-side.

### B7 KID length

CONFIRMED against the operator page (Mastercard Payment Services: "4 to 25 digits", exact length per the payee's agreement); PARTLY as to what else applies, because I could not read the Bits rule text that Codex cites for a different minimum, and the pack CSV, C-35 and tests all say 2-25. Low: nobody issues 2-3 digit KIDs in practice. Decision below. If changed: pack CSV `min_length` 4 via a new pack version, C-35 text, `ApDocuments.kt:234`, `PayablesSupport.kt:215`, unit test `valid(KID,"1")` unaffected, vectors `18`, `6-`, `000` become refuse.

### B8 KID agreement context

CONFIRMED, Low. Code accepts Luhn or MOD11 for any KID; an agreement uses one. Fix needs the same supplier-agreement field as B3. Low.

### B9 App lacks BG/PG/FIK local checks

CONFIRMED, Low. `bankProblems` has no Bankgiro, Plusgiro or creditor checks; the server refuses. Fix: port `PayeeRoutes` Luhn checks into `bankProblems`.

### B10 Receipt payer reference

CONFIRMED, Low. `PAYER_REFERENCE_INVALID` does not appear in backend main sources; `ReceiptRules.payerReferenceType` only separates RF-shaped text from TEXT (`:431`) and C-35 requires check-digit warnings, never refusal. Contract's built-status note defers it, so this is a known gap. Fix when scheduled: use customer country/pack scheme to pick the algorithm; add warning code; keep never refusing.

### B11 Unicode digits (new)

NEW, Low. `PayeeRoutes.bankgiroValid/plusgiroValid` use `all(Char::isDigit)` then `luhn` computes `ch - '0'`; a non-ASCII digit contributes a large number, so such input can pass or fail by accident rather than being refused. Fix: `ch in '0'..'9'` in `PayeeRoutes` (three functions). Not run; found by reading.

### B14 Existing tests

UNVERIFIED, Low. Codex says `PaymentReferenceVectorsTest` calculates checks with its own implementation. I did not open it. `PaymentReferencesTest.kt` (opened) does call production code and covers KID (including minus case), OCR, FIK, FI, RF; it has no OCR level, FIK73 round-trip or national IBAN cases, as Codex says.

### Not defects

RF check digits 00, 01, 99 can pass a plain mod 97 test but are never generated (generation yields 02-98). Codex hedged correctly; not a fix. Leading-zero stripping in Finnish references is a printing rule, not validation.

## Decisions for Jabran

1. Sequence and release. Recommend: A1 (Finland subtotal) in one small V40 forward migration now; A2-A5, A8, A9 together as one "chart v2026.4 + V40 mappings" slice with a company-adoption path. Do not edit V13/V23/V24 or the 2026.2 CSVs.
2. `STATUTORY_LAYOUT` flag (A6). Recommend: return `MANAGEMENT` for all packs until A1-A5 land, because the API currently asserts statutory fitness it cannot back. Cheap (flip `statutory_split` to false in V40) and reversible.
3. Maturity fix design (A2/A3/A5). Recommend new subtypes `FINANCIAL_ASSET_CURRENT` and `OTHER_PAYABLE_NON_CURRENT`, and reuse `FINANCIAL_ASSET` for long-term receivables, over a general maturity attribute on accounts (more work, better long term, would also fix A4 uniformly).
4. Swedish subtotal (A13). Recommend keep "Resultat efter finansiella poster" for SE (BFN K2/K3 practice, supplementary) and correct the source note to say it is not in bilaga 2.
5. DK/SE external-costs line and IS order (A7, A11). Recommend schedule after the classification fixes, per country, and only if you want statutory presentation for class B-D filers; small entities may condense.
6. Pakistan (A10). Recommend a short check by a Pakistani accountant of Fifth Schedule face lines (revaluation surplus, long-term deposits, unclaimed dividends, turnover deductions) before any PK statement is described as statutory.
7. KID minimum length (B7). Recommend raise to 4 in a new pack version and C-35 once you are happy that Bits/Nets agreements do not permit 2-3 digit KIDs; harmless if wrong either way. Tell me if you prefer to leave at 2.
8. OCR (B2, B3). Recommend the app fix for B2 now (small, removes a block) and the control-level agreement fields (B3) as a payables slice. Same slice should carry B8.
9. FIK creditor MOD11 (B5). Recommend asking one Danish bank or Nets contact to confirm the weights 2-7 and check 11-r (10 invalid) before enforcement, then implement and fix the `12345678` fixture.
10. FIK +73 (B1). Recommend fixing now (backend plus app enum), since it silently loses the type.
11. Country captions (A15). Product decision: keep English captions, or ship label_local per country as the packs contract promises. Recommend ship FI and DK captions with the A1/A7 layouts.
