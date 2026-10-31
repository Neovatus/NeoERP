# NeoERP payment-reference audit

Audit dates: 2026-10-30–31. All implementation findings are proposed fixes; neither code tree was changed.

## Checkpoint and evidence

| Field | Record |
| --- | --- |
| Ownership | Codex leads the audit and integrates this report. Country researchers had read-only scopes. |
| Authorization | User requested a read-only audit and a master commit named `docs(codex): payment references`. Sole writable artifact: `docs/agents/codex-payment-refs/report.md`. |
| Stage | Specification comparison and integrated country reviews complete; documentation delivery authorized. Implementation remains unapproved. |
| Final inspected revisions | Workspace master `945353fda8035986b0bfc7f55ae10d839fdaad0e`; backend dev `2cc842303f9e9ec6ce4f2020595544dbd8c83b25`; app dev-app `7ef508a1c1353da53e0319e1de9a4fa2127e064f`. Line references below use this refreshed snapshot. |
| Concurrent work | Initial workspace revision was `4e02a8a5153c6846ae9ceade7ea8370c6d30f66d`; backend `acc99350e5f3dd4f87fc5e57abcd3fbedcc13fa2`; app `0f86457719db1ae2b3ba780383f985a8512629b6`. Other workers advanced these during the audit. Relevant validator/caller differences were reread: signatures and behavior discussed here remain unchanged; line numbers were refreshed. App/backend tracked working trees were clean at refresh. |
| Existing workspace changes | Modified accounts-bc-readiness/brief-sb2a.md, handover/design-principles.md, inbox/erp-lead.md; unrelated untracked handoff/task folders, including codex-statement-layouts. Preserved and excluded from this commit. |
| Method / limits | Read production validators, callers, tests and contracts; consulted primary specifications; independently checked selected arithmetic in memory. Tables predict results by reading code, as requested. Production Kotlin and APIs were not executed. No Gradle run or generated files. No live-bank/account-assignment test. |
| State exception | No PROJECT-STATE*.md was read. No separate plan or shared-state record was written, honoring the explicit exclusions and single-file scope. This report is the audit checkpoint, not a claim that shared state is current. |
| Next / disposition | Accounts owners should reconcile contracts and approve a separate code/test scope. All fixes remain pending. No push authorized. |

## Findings

Ordinary nonempty Luhn, KID MOD11, Finnish 7-3-1 and RF MOD97 calculations agree between backend and app. The material gaps are:

1. KID allows 2–3 characters; current operator/Nets documentation requires 4–25.
2. OCR agreement levels and length controls are absent. Backend always uses SOFT behavior; app blocks a failed check.
3. FIK +73 cannot be represented correctly with no payment ID. Creditor validation omits MOD11.
4. Backend IBAN lacks national format rules; app does not calculate its checksum.
5. App has no Bankgiro, Plusgiro or FIK-creditor checksum checks.
6. Receipt payer references are classified, not checksum-validated; the required warning is absent.

## Table conventions and implementation locations

**P** means a published worked/form example. **D** means a derived boundary, agreement context or mutation using the specification. Invalid mutations are not claimed to be official published test vectors. Checksum validity does not establish account assignment.

Reference-table “accept/refuse” means the boolean helper result. For supplier routes, app “pass” means no local error from `bankProblems`, with accountNumber and other bank fields blank; the server can still refuse. Caller differences appear separately.

Aliases below are exact workspace-relative files:

| Alias | File |
| --- | --- |
| BRef | `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/domain/payables/ApDocuments.kt` |
| BRoute | `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/domain/payables/Payables.kt` |
| BBank | `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/supplier/SupplierBankChangeService.kt` |
| BBill | `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/bill/BillRules.kt` |
| BRead | `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/bill/ApDocumentReadService.kt` |
| BDraft | `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/bill/BillDraftService.kt` |
| BReceipt | `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/receivables/receipt/ReceiptRules.kt` |
| ARef | `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/payables/PayablesSupport.kt` |
| ABill | `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/payables/BillEditor.kt` |
| ABank | `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/payables/Suppliers.kt` |
| AReceipt | `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/receivables/ReceiptEditor.kt` |

Both reference helpers uppercase and remove literal spaces (BRef:226; ARef:208). Backend supplier callers clean spaces, dots and dashes (BRoute:174; BBank:71–80). App IBAN filtering removes every nonalphanumeric character (ABank:361).

## Norwegian KID: MOD10 / MOD11

Specifications: [Mastercard Payment Services KID developer documentation](https://www.mastercardpaymentservices.com/norway/utvikler/kid/) (current Nets successor operator), [Nets OCR giro user manual v6, §2.2](https://www.nets.eu/no-nb/PublishingImages/Lists/Accordion%20%20OCR%20giro/AllItems/OCR%20giro%20Brukerh%C3%A5ndbok.pdf), and [Bits control rules, supplementary §2](https://www.bits.no/document/regler-om-kontroll-av-krediteringstransaksjoner-og-distribusjon-av-informasjon-som-grunnlag-for-slik-kontroll/).

Operator/Nets length is 4–25 including check, subject to agreed structure. Luhn doubles alternate payload digits from the right and sums product digits. MOD11 uses repeating weights 2–7 from the payload's right. Weighted-sum remainder 0 gives check 0; remainder **1** gives computed check **10**, written `-`. Remainder **10** gives check **1**, not minus. Bits defines account-specific modulus/length pairs.

Implementation: BRef:234 and :247–262; BRoute:203–213 (Luhn). App ARef:215, :225–253.

| Input / context | Origin | Expected | Backend | App |
| --- | --- | --- | --- | --- |
| `123456701123453`, MOD10 | P operator calculation | Accept | Accept | Accept |
| `123456701123458`, MOD11 | P operator calculation | Accept | Accept | Accept |
| `123456701123454` | D wrong check, fails both | Refuse | Refuse | Refuse |
| `104-` | D MOD11 sum 12, remainder 1 | Accept | Accept | Accept |
| `1041` | D wrong check, fails both | Refuse | Refuse | Refuse |
| `1031` | D MOD11 sum 10, remainder 10 | Accept | Accept | Accept |
| `103-` | D wrong minus for remainder 10 | Refuse | Refuse | Refuse |
| `18` | D valid Luhn, length 2 | Refuse length | **Accept** | **Accept** |
| `6-` | D valid MOD11, length 2 | Refuse length | **Accept** | **Accept** |
| `000` | D valid arithmetic, length 3 | Refuse length | **Accept** | **Accept** |
| 25 zeroes | D upper boundary | Accept checksum/width; agreement unverified | Accept | Accept |
| 26 zeroes | D overlong | Refuse | Refuse | Refuse |
| `123456701123458`, MOD10-only agreement | D agreement context | Refuse | **Accept** | **Accept** |

**Fixes:** reconcile B C-35's 2–25 rule with operator/Nets 4–25 before changing both implementations and fixtures. The minus calculation is already correct. The current OR-of-both-moduli establishes generic plausibility only; use agreed modulus/length for agreement validation.

## Swedish OCR: Luhn and control levels

Specifications: [Bankgirot Bankgiro Inbetalningar user manual, October 2023, §§5.1.2 and 5.2](https://www.bankgirot.se/globalassets/dokument/anvandarmanualer/bankgiroinbetalningar_anvandarmanual_sv.pdf) and [official OCR reference control](https://www.bankgirot.se/tjanster/inbetalningar/bankgiro-inbetalningar/ocr-referenskontroll/).

OCR has 2–25 digits, final Luhn check. SOFT warns and permits invalid/missing references; HARD refuses. VARIABLE_LENGTH also checks that the penultimate digit equals total length modulo 10. FIXED_LENGTH checks one of up to two agreed lengths.

Implementation: BRef:235; ARef:216. Both helpers implement width, digits and Luhn only, with no agreement parameters.

| Input / control level | Origin | Expected | Backend helper | App helper |
| --- | --- | --- | --- | --- |
| `12345682`, VARIABLE_LENGTH | P manual §5.2.2 | Accept | Accept | Accept |
| `12345683`, HARD | D wrong check | Refuse | Refuse | Refuse |
| `1234566`, HARD | D valid Luhn | Accept | Accept | Accept |
| `1234566`, VARIABLE_LENGTH | D length 7, penultimate 6 | Refuse | **Accept** | **Accept** |
| `1234566`, FIXED_LENGTH {8} | D agreement mismatch | Refuse | **Accept** | **Accept** |
| `12345682`, FIXED_LENGTH {8} | P number; D context | Accept | Accept | Accept |
| `18`, HARD | D minimum | Accept | Accept | Accept |
| 26 zeroes | D overlong | Refuse | Refuse | Refuse |

**Observable difference:** `12345683` under SOFT should permit submission with warning. BBill:602–610 returns immediately for all OCR, and BRead:129–130 adds `PAYMENT_REFERENCE_INVALID` with hardcoded SOFT. App ABill:107–108 reports an error, and :431–441 blocks Submit. Backend also cannot enforce HARD agreements because of that bypass.

**Fix:** provide/persist supplier control level and agreed lengths, enforce them server-side, and mirror warning/refusal behavior in app.

Plusgiro **account-number** checks below are distinct from Plusgiro **OCR reference** rules, which have a separate [Nordea number-series specification](https://www.nordea.se/Images/154-317345/Nummerserier%20f%C3%B6r%20PlusGirots%20OCR-nummer.pdf). Bankgirot rules alone do not certify every Plusgiro OCR route.

## Danish FIK +71 / +73 / +75

Specifications: [Nets +75 technical specification, June 2017, §§2.3.2 and 2.3.5](https://www.jyskebank.dk/pdf/h4npymhs/vejledning_fremstilling_fi75_da.pdf), [PBS +71 specification, §3.3.3](https://danskebank.dk/PDF/Blanketter/ERHVERV/Indbetalingskort/Fremstilling_af_71-kort.pdf), [PBS +73 specification](https://danskebank.dk/PDF/Blanketter/ERHVERV/Indbetalingskort/fremstilling_af_73-kort.pdf), and [Nykredit card comparison](https://www.nykredit.dk/din-virksomhed/behov/daglig-drift/produkter/fi-kort---valg-af-kortart/). The PBS/Nets documents are bank-hosted originals.

+71 payment ID is 15 digits including final Luhn; +75 is 16 including Luhn. +73 has no structured payment ID. The eight-digit creditor number is separate.

Implementation: BRef:236–240; ARef:217–218; shared Luhn BRoute:203 and ARef:225. App enum ARef:178–186 omits FIK73.

| Type / payment ID | Origin | Expected | Backend helper | App helper |
| --- | --- | --- | --- | --- |
| +71 `026840149965328` | D reconstructed from official payload/check | Accept | Accept | Accept |
| +71 `026840149965329` | D changed check | Refuse | Refuse | Refuse |
| +71 `0026840149965328` | D wrong width | Refuse | Refuse | Refuse |
| +75 `0026840149965328` | P Nets calculation | Accept | Accept | Accept |
| +75 `0026840149965329` | D changed check | Refuse | Refuse | Refuse |
| +75 `0000010400012505` | P Nets form | Accept | Accept | Accept |
| +75 `026840149965328` | D wrong width | Refuse | Refuse | Refuse |
| +71/+75 empty | D missing required ID | Refuse explicit type | Refuse | **Accept** |
| +73 empty | Official no-ID layout | Accept without payment ID | Accept helper; **draft rejects** | No FIK73 enum |
| +73 `123` as structured ID | D incompatible with no-ID layout | Do not encode as structured ID | **Accept** | Unknown wire becomes None |

The +71 final illustration prints an extra leading zero despite its own 15-digit requirement and 14-digit worked payload. The table labels the reconstructed 15-digit result D. A generic +73 template repeats payment-ID wording; its actual layout and Nykredit establish no-ID behavior.

**Fixes:** +71/+75 arithmetic and width are correct. BDraft:230–238 requires nonempty reference for every explicit non-NONE type, including FIK73, while BRef:240 accepts arbitrary FIK73 text. Permit absent ID for +73 and preserve its type across app round-trips; ARef:192 currently maps it to None. Keep optional free messages separate. Align +71/+75 blank-input handling.

These helpers validate individual reference fields, not entire `+75<...+creditor<` lines. The +75 specification's optional amount MOD97 checks concern another field.

### FIK creditor number

[Nordea EDI/4 format, May 2019, beneficiary account field](https://www.nordea.com/en/doc/cn-betalinger-edi4-format-0519-dk-cn-003.pdf) requires eight digits and MOD11. [KMD creditor interface, p.21](https://www.kmd.dk/media/hsji2obe/id142-a-kmd-udbetaling-service-kreditorinformation-v12-pdf.pdf) additionally requires range 70000008–99999993 for that integration; this range is not asserted as a universal Nets rule.

Implementation: BRoute:189 checks only length 8 and `Char::isDigit`, invoked at BBank:79–80. ABank:360–367 has no creditor validation.

| Creditor number | Origin | Expected | Backend | App local |
| --- | --- | --- | --- | --- |
| `80882939` | P Nets +75 form | Accept format; assignment unverified | Accept | Pass, unchecked |
| `1234567` | D short | Refuse | Refuse | **Pass** |
| `1234567A` | D nonnumeric | Refuse | Refuse | **Pass** |
| `٨٠٨٨٢٩٣٩` | D Arabic-Indic digits | Refuse ASCII OCR syntax | **Accept** | **Pass** |
| `12345678` | D; existing backend fixture | Refuse under KMD range | **Accept** | **Pass** |

**Fix / verification limit:** implement the required creditor MOD11 and ASCII syntax. Obtain the authoritative creditor weighting first: the inspected sources establish MOD11 but did not independently establish its weights. Accordingly, this report does not certify a creditor check-digit mutation or claim that a commonly used weight sequence was officially verified.

## Finnish domestic reference: viitenumero 7-3-1

Specification: [Finance Finland, Forming a Finnish reference number, pp.1–2](https://www.finanssiala.fi/wp-content/uploads/2021/03/Forming_a_Finnish_reference_number.pdf). Length 4–20 includes check. Weight the payload from the right with repeating 7,3,1; complement the sum to a multiple of ten.

Implementation: BRef:238 and :266–269; ARef:219 and :257–260.

| Input | Origin | Expected | Backend | App |
| --- | --- | --- | --- | --- |
| `12 34561` | P worked example, payload sum 89 | Accept after cleaning | Accept | Accept |
| `1234562` | D wrong check | Refuse | Refuse | Refuse |
| `1232` | D minimum | Accept | Accept | Accept |
| `123` | D too short | Refuse | Refuse | Refuse |
| `12345678901234567894` | D 20-digit maximum | Accept | Accept | Accept |
| `123456789012345678908` | D 21 digits, checksum otherwise correct | Refuse length | Refuse | Refuse |
| empty, FI_REF selected | D missing input | Refuse explicit type | Refuse | **Accept** |

**Finding / fix:** no nonempty arithmetic or width discrepancy found. Align optional absence versus explicit-type missing input. The specification's omission of leading zeros concerns printing; accepting zero padding is not established as a checksum defect.

## RF creditor reference: ISO 11649 MOD97

Specifications: [ISO 11649 catalogue](https://www.iso.org/standard/50649.html) and [Finance Finland, Structure of the RF Creditor Reference, 2024](https://www.finanssiala.fi/wp-content/uploads/2024/04/structure-of-the-rf-creditor-reference-iso-11649.pdf).

RF has two check digits and 1–21 alphanumeric payload characters. Move the first four characters to the end, expand A=10 through Z=35, and require remainder 1 modulo 97. Finance Finland permits a payload other than a Finnish domestic reference from 18 November 2024.

Implementation: BRef:223, :239 and :272–274 (BigInteger); ARef:205, :220 and :263–269 (streamed remainder).

| Input | Origin | Expected | Backend | App |
| --- | --- | --- | --- | --- |
| `RF54 1234` | P Finance Finland | Accept | Accept | Accept |
| `RF98 REF1 234` | P Finance Finland, alpha payload | Accept | Accept | Accept |
| `RF55 1234` | D changed check | Refuse | Refuse | Refuse |
| `rf54 1234` | D lowercase | Accept after normalization | Accept | Accept |
| `RF25A` | D minimum payload | Accept | Accept | Accept |
| `RF95ABCDEFGHIJKLMNOPQRSTU` | D 21-character payload | Accept | Accept | Accept |
| `RF22ABCDEFGHIJKLMNOPQRSTUV` | D 22-character payload, arithmetic correct | Refuse length | Refuse | Refuse |
| `RF54-1234` | D punctuation | Refuse | Refuse | Refuse |
| empty, RF selected | D missing input | Refuse explicit type | Refuse | **Accept** |

**Finding / fix:** no nonempty arithmetic/syntax discrepancy demonstrated; align missing-input handling. Do not require RF payload to satisfy Finnish 7-3-1. Generation produces check digits 02–98; an extra rejection of modulo-equivalent 00/01/99 is not established here as a mandatory remainder-based validation fix.

## IBAN: MOD97 plus national structure

Specifications: [Finance Finland, IBAN and BIC in payments, §§1.1–1.3](https://www.finanssiala.fi/wp-content/uploads/2021/03/IBAN-and-BIC-in-payments-1.pdf) and [SWIFT official IBAN registry, Finland entry](https://www.swift.com/sites/default/files/files/SWIFT_IBAN_Registry.pdf).

IBAN uses rearrangement, A=10…Z=35 expansion and remainder 1. National length/BBAN patterns are additional requirements. Finland requires FI, two check digits and fourteen numeric BBAN digits: 18 characters.

Implementation: BRoute:170–180 has generic 15–34 syntax and correct MOD97, called at BBank:71–72. ABank:360–366 accepts an 8–34-character generic shape without MOD97.

| Input | Origin | Expected | Backend | App local |
| --- | --- | --- | --- | --- |
| `FI2112345600000785` | P Finance Finland / SWIFT | Accept | Accept | Pass |
| `FI7536363001154921` | P Finance Finland | Accept | Accept | Pass |
| `NL39RABO0300065264` | P Finance Finland, alpha BBAN | Accept | Accept | Pass |
| `FI2212345600000785` | D wrong check | Refuse | Refuse | **Pass** |
| `FI211234560000078` | D 17 chars; remainder 1 | Refuse FI length | **Accept** | **Pass** |
| `FI59123456000007850` | D 19 chars; remainder 1 | Refuse FI length | **Accept** | **Pass** |
| `FI62A2345600000785` | D alphabetic FI BBAN; remainder 1 | Refuse FI pattern | **Accept** | **Pass** |
| `NO931234` | D 8 chars | Refuse length | Refuse | **Pass** |

**Fixes:** add registry-based country lengths and BBAN patterns before backend MOD97; add equivalent syntax/checksum feedback in app. Agree normalization too: app discards an inserted slash, while backend retains and rejects it. A checksum pass cannot establish account existence.

## Bankgiro / Plusgiro account-number checks

Specifications: [Bankgirot 10-modul examples, pp.2–3](https://www.bankgirot.se/globalassets/dokument/anvandarmanualer/10-modul.pdf), Bankgirot user manual linked above (§5.2.2 and Bankgiro-number field), and [Privatgirot Plusgiro form](https://privatgirot.se/wp-content/uploads/2018/06/plusgiro-blankett.pdf).

Bankgiro is 7–8 digits; Plusgiro is 2–8. Both use final-digit Luhn. Implementation: BRoute:185, :187, :203–213; callers BBank:75–78 clean separators. ABank:360–367 has no BG/PG checks.

| Type / input | Origin | Expected | Backend after clean | App local |
| --- | --- | --- | --- | --- |
| BG `991-2346` | P Bankgirot | Accept | Accept | Pass, unchecked |
| BG `5555-5551` | P Bankgirot | Accept | Accept | Pass, unchecked |
| BG `991-2347` | D changed check | Refuse | Refuse | **Pass** |
| BG `5555-5552` | D changed check | Refuse | Refuse | **Pass** |
| BG `123456` | D too short | Refuse | Refuse | **Pass** |
| PG `4434-7` | D Luhn vector; repository fixture | Accept checksum | Accept | Pass, unchecked |
| PG `4434-8` | D changed check | Refuse | Refuse | **Pass** |
| PG `0` | D too short | Refuse | Refuse | **Pass** |
| PG `000000000` | D nine digits | Refuse length | Refuse | **Pass** |

**Finding / fix:** backend arithmetic agrees; app relies on server refusals. Add matching local feedback. These checks do not verify assignment of a giro number.

## Contracts and receipt payer references

- `NeoERP-BackEnd/docs/api/accounts-c.md:135`, C-22, requires typed checks, supplier OCR controls and reference-required payee routes. BBill:602–610 bypasses OCR and BRead:129–130 hardcodes SOFT. Agreement-aware and required-route validation are missing; implementation notes at :1065 acknowledge the gaps.
- `NeoERP-BackEnd/docs/api/accounts-b.md:174`, C-35, embeds the conflicting KID 2–25 rule and defines the other schemes.
- `accounts-b.md:1383` requires recognizable payer-reference checks, warning `PAYER_REFERENCE_INVALID`, never refusal. BReceipt:126–127 stores input and :431 only recognizes RF-shaped text versus TEXT. It does not invoke a checksum. The built-status note at :2068 explicitly defers payer checks and invoice matching.
- App AReceipt:205 removes an old warning on typing, :283–287 does not check payer checksum, and :308 sends trimmed text. `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/receivables/ReceiptEditorScreen.kt:134` can display a server warning, but none is computed locally.

| Receipt payerReference | Origin | Expected contract behavior | Backend | App |
| --- | --- | --- | --- | --- |
| `RF541234` | P normalized | Accept valid RF; eligible for matching | Stores as RF, no checksum | Sends text |
| `RF551234` | D wrong RF check | Accept **with invalid warning** | Stores as RF, no checksum warning | Sends, no local check |
| `123456701123454` in KID context | D | Accept with warning | Stores as TEXT, no KID check | Sends text |
| `12345683` in OCR context | D | Accept with warning | Stores as TEXT, no OCR check | Sends text |
| `1234562` in FI-reference context | D | Accept with warning | Stores as TEXT, no FI check | Sends text |

**Fix:** add recognition using scheme/route context and warning generation, preserving never-refuse receipt semantics. Numeric text alone does not uniquely identify KID/OCR/FIK/Finnish algorithms.

### Empty references: helper versus API

ARef:213 returns true for every empty input; backend checked-type helpers return false. BDraft:230–238 converts blank to null and rejects every explicit non-NONE type without a reference. Thus app can permit local blank KID/OCR/FIK71/FIK75/FI_REF/RF while the draft API refuses. Omitting both type and value passes but does not establish required-route compliance. FIK73 needs its own no-ID rule.

## Existing tests, verification and follow-up

Country researchers independently skimmed the integrated report against refreshed code and their source evidence. A mistaken negative KID vector was corrected to one failing both accepted algorithms; FI/RF/IBAN and Danish reviews required no changes. Remaining limits concern specification coverage, not unresolved review corrections.

`NeoERP-BackEnd/services/accounts-service/src/test/resources/packs/payment-reference-vectors.csv:1` labels NO/SE/DK vectors as NeoERP contract vectors, not official examples. FI/RF rows include Finance Finland-derived vectors.

`NeoERP-BackEnd/services/accounts-service/src/test/kotlin/com/neovatus/accounts/infrastructure/persistence/pack/PaymentReferenceVectorsTest.kt:11` calculates checks in a separate test implementation instead of calling production validators. It cannot prove app/backend parity; its MOD11 branch excludes computed check 10 rather than testing minus encoding. `NeoERP-BackEnd/services/accounts-service/src/test/kotlin/com/neovatus/accounts/domain/payables/PaymentReferencesTest.kt:19` does call production code, including a generated minus case, but does not establish agreement policies or national IBAN structure.

Once fixes are approved, run the tables against actual backend/app validators and add caller tests for OCR SOFT/HARD/VARIABLE/FIXED, selected-type blank input, FIK73 no-ID round-trip, creditor ASCII/MOD11, national IBAN structure, and receipt warnings without refusal. Preserve published/derived provenance and independently check inconsistent source illustrations.

No code, tests, contracts, migrations, login settings or shared state were changed. Creditor MOD11 weighting remains unverified; obtain a bank/scheme calculation before claiming complete certification. No account assignment or live payment was tested. This report records recommendations for a separately approved implementation workstream.
