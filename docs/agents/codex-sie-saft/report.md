# SIE, SRU and SAF-T conformance review

Date: 2026-10-31. Owner and report integrator: Codex. Scope: read-only accounting-format review; proposed fixes only.

## Verdict and evidence boundary

- **Sweden SIE:** implemented SIE 4E exporter and a selective balance/history importer. Normal record syntax is substantially aligned; this is not a complete voucher or dimension migration tool. Confirmed gaps include rejection of empty balances and acceptance of data appended after the closing checksum. The golden export also demonstrates a year-end reconciliation limitation.
- **Sweden SRU:** account-to-field metadata exists; this is not an implemented Skatteverket declaration-file exporter. Valid field numbers alone do not establish correct account mapping, form calculations or filing readiness.
- **Norway SAF-T Financial:** planned in a draft, not implemented. Its standard-account mapping proposal is obsolete for v1.30. A v1.30-only launch plan also needs a reporting-year/version decision for 2027.
- **Denmark:** a separate SAF-T profile exists. **Finland:** no national SAF-T Financial profile identified; that absence remains unverified.

Reviewed workspace `master` at `9430942170c999d1c2554831f32c68eed7835634`; backend `dev` at `2cc842303f9e9ec6ce4f2020595544dbd8c83b25`, initially clean. Frontend `dev-app` at `7ef508a1c1353da53e0319e1de9a4fa2127e064f`, initially clean; no frontend implementation inspection was needed. The requested checkout is `/Users/jabransiddiqui/Offices/Neovatus/NeoERP`, distinct from the initial working directory containing `jabran-siddiqui`.

Existing unrelated workspace changes at pickup: `docs/agents/accounts-bc-readiness/brief-sb2a.md`, `docs/handover/design-principles.md`, `docs/inbox/erp-lead.md`; untracked `.review-channel/handoff-implementer.md`, `docs/agents/accounts-cp-ev-1c/`, and `docs/agents/accounts-flow56-fixes/`. They are excluded from this work and its commit.

The user's task overrides the normal state/plan workflow: no `PROJECT-STATE*.md` read, no extra checkpoint file, no application-tree writes, no Gradle, no push. This report is the only authored file. Discovery, specification comparison and review are complete; all fixes below are **proposed, not implemented or accepted**. Next action after delivery belongs to the accounts lead: decide implementation scope and vendor pilot cases. No implementation authority is implied.

Evidence is static source inspection, official specifications, fixture inspection and in-memory Python checks. No Kotlin compilation, service execution, validator submission, filing or genuine Fortnox/Visma/BL export import was performed. An independent worker checked the Norway findings and the principal SIE parser/round-trip findings. This is a conformance assessment, not SIE certification or tax-return acceptance.

Paths below beginning `D/`, `A/`, `I/`, `T/`, and `R/` resolve under `NeoERP-BackEnd/services/accounts-service/src/` as follows:

| Prefix | Directory |
| --- | --- |
| `D/` | `main/kotlin/com/neovatus/accounts/domain/` |
| `A/` | `main/kotlin/com/neovatus/accounts/application/service/` |
| `I/` | `main/kotlin/com/neovatus/accounts/infrastructure/` |
| `T/` | `test/kotlin/com/neovatus/accounts/` |
| `R/` | `main/resources/` |

## 1. Sweden: SIE 4B specification / type 4E export

### Official baseline

**4B is a specification edition; 4E is a file-use variant, not a successor edition.** `#SIETYP` contains `4`, not `4E`. The currently linked 4C document states that it does not change the file format; its PDF metadata still says DRAFT. References below identify the relevant record or numbered section, avoiding confusion between editions. Sources: [official format index](https://sie.se/format/), [4B English specification](https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_ENGLISH.pdf), [4C specification, §§1.7 and 13](https://sie.se/wp-content/uploads/2026/02/SIE_filformat_ver_4C_2025-08-06.pdf).

### Supported records and behavior

The exporter is `A/statutory/sie/SieExporter.kt`, `SieExportFigures.kt`, `SieVoucherStream.kt`, and `D/sie/SieRecordWriter.kt`. `configuration/report/SieExportConfig.kt` enables period balances by default and supplies export limits. `configuration/sie/SieImportConfig.kt` actually declares the import scheduler; parser configuration is in `SieImportSettingsConfig.kt`.

| Record group | Actual implementation |
| --- | --- |
| Identification | Writes `#FLAGGA 0`, `#PROGRAM`, `#FORMAT PC8`, `#GEN`, `#SIETYP 4`, `#PROSA`, `#FNR`, optional available `#ORGNR`/`#ADRESS`, `#FNAMN`, `#RAR 0`, optional `#RAR -1`, conditional `#TAXAR` and `#OMFATTN`, `#KPTYP EUBAS97`, `#VALUTA`. |
| Chart | Writes used `#KONTO`, `#KTYP`, one selected `#SRU`; `#DIM` 1 for cost centre and configurable branch dimension, default 20; corresponding `#OBJEKT`. |
| Figures | Writes nonzero `#IB`/`#UB` for balance accounts, `#RES` for result accounts; optional `#PSALDO` at account and individual dimension levels. Current and available previous-year figures. |
| Vouchers | Writes current-year `#VER`/`#TRANS`, including ordinary reversal vouchers. Excludes year-end-closing journals; some opening entries become IB rather than vouchers. |
| Not exported | `#KSUMMA`, `#RTRANS`, `#BTRANS`, `#OIB`, `#OUB`, `#UNDERDIM`, `#PBUDGET`, quantities/units, project/customer/supplier dimensions. These omissions are not all mandatory-record defects. |
| Import facts retained | Type 1/2/3/4, header facts, `#RAR`, `#OMFATTN`, `#KONTO`, `#KTYP`, multiple `#SRU`, `#IB`, `#UB`, `#RES`, empty-object `#PSALDO`, voucher counts and account transaction sums. `#RTRANS` counted once, its following `#TRANS` skipped; `#BTRANS` ignored. |
| Accepted but discarded | `#OIB`, `#OUB`, `#PBUDGET`, `#DIM`, `#UNDERDIM`, `#OBJEKT`, `#ENHET`, object PSALDO; several informational records including `#TAXAR` and `#KPTYP`. Full voucher details are not persisted. |

`SieRecordWriter` groups and quotes records, writes LF and standalone voucher braces. `Cp437Sink`/`Cp437Encoder` emit CP437. `SieAmount` uses debit-minus-credit and two decimal places. Voucher date is entry date; registration date is the Stockholm posting date; transaction date is written explicitly. SQL orders by journal-type order, voucher number and line. The parser accepts CRLF, blank lines, tabs, escaped quotes, unknown labels and extra trailing fields. Default decoding is CP437; BOM UTF-8 and explicitly chosen Windows-1252/UTF-8 are compatibility extensions.

No mismatch found in core encoding, signed-amount, date, KTYP and extensibility rules. Unknown labels/trailing fields must be accepted; unused records may be ignored. Object acceptance alone does not prove type-3 support. [4B, §§3,5,7,11](https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_ENGLISH.pdf).

In 4E, ORGNR, SRU, object records, PSALDO and vouchers are optional. SIETYP can be omitted for type 1; zero balances may be omitted. This corrects H-SE F-27. [4B, §§5.16-5.18 and 6](https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_ENGLISH.pdf).

### Findings and proposed fixes

| ID / priority | Ours, concrete consequence and evidence | Specification comparison / fix |
| --- | --- | --- |
| SIE-1 **High: zero-balance rejection** | `D/sie/parse/SieParser.kt:669-673` requires at least one balance record. A type-1 or 4E file with proper headers/year/chart and entirely zero balances is rejected with `no_balances`. A zero export can therefore fail re-import. | Zero omission is allowed, **4C §§5.17-5.18**. Recognize a valid empty balance dataset separately from an unreadable file and unsupported transaction-import purpose. Add zero-company and zero-net-year cases. [4C](https://sie.se/wp-content/uploads/2026/02/SIE_filformat_ver_4C_2025-08-06.pdf). |
| SIE-2 **Medium: unchecked data after checksum** | `SieParser.kt:233-255,467-480,658-667`: closing KSUMMA disables CRC but does not terminate records. Appending `#UB 0 1930 999` after a valid closing checksum changes the parsed UB through the last-row-wins assignment at `:341-344`, with no checksum mismatch. This is a malformed-file acceptance gap; downstream business checks remain separate. | **4C §10.4** puts the checksum at the end. Require the closing checksum to be the last meaningful record; diagnose duplicate/orphan checksum controls. [4C §10](https://sie.se/wp-content/uploads/2026/02/SIE_filformat_ver_4C_2025-08-06.pdf). |
| SIE-3 **Medium: year-end fidelity / round-trip warning** | `SieExportFigures.kt:178-180,204-210` includes YE effects in UB but excludes them from RES/movement; `SieExportJdbcAdapter.kt:216` omits YE vouchers. `SieExporter.kt:283` subtracts YE before its own check. The committed golden has UB2099 **-16749.25**, IB2099 **0**, TRANS2099 **0**. `A/sie/importing/SieHistoryRules.kt:100` consequently disagrees; preview `SieImportPreviewer.kt:393-397` produces a WARN, not refusal. | A documented NeoERP convention, not proof of a mandatory-VER violation: 4E vouchers are optional. Decide whether the artifact is intended for complete audit/migration reconciliation; either provide a consistent closing representation or make the exceptional reconciliation explicit and align our importer. Get accountant/vendor acceptance before changing the accounting convention. |
| SIE-4 **Medium, conditional: emitted object-ID collisions** | `SiePreflight.kt:164` compares raw trimmed Unicode codes. `SieRecordWriter.kt:186-195` strips trailing backslashes/control characters; `Cp437Encoder.kt:32-40` replaces unsupported characters with `?`. If upstream data allows codes `A€` and `A?`, both emit `A?`; `A` and a code ending in backslash can also collapse. Upstream reachability is **unverified**. | Object identity can be lost even though totals pass. Validate uniqueness and nonemptiness **after final cleaning and encoding**, or refuse nonrepresentable identifiers; retain warned replacement for descriptive labels. Relevant representation: **4C §5.8 and #OBJEKT**. [4C](https://sie.se/wp-content/uploads/2026/02/SIE_filformat_ver_4C_2025-08-06.pdf). |
| SIE-5 **Medium: metadata/field validation is selective** | `SieParser.kt:260-263` discards FLAGGA/FORMAT/TAXAR/KPTYP; `:397-428` reads transaction account/object list/amount but ignores its date, text, quantity and sign. Missing PROGRAM/FNAMN and malformed discarded fields need not fail parsing. `#TRANS ... 20260230` can contribute money without a date diagnostic. | This reader is not a conformance validator. Add contextual diagnostics for required headers, FORMAT, flag value, dates and object-list pairing; preserve permissive handling of unknown extensions. Do not label every ignored optional field as a mandatory importer failure. |
| SIE-6 **Low: explicit capacity and mapping limits** | Parser account numbers are 1-8 digits (`:535-540`), years -99..0 (`:543-545`), 20 years/5,000 accounts by default, amounts below 10^15 per record; new chart accounts are restricted to four digits under an existing two-digit group (`D/sie/importing/SieMappingRules.kt:145+`). | Disclose limits and allow manual mapping of nonstandard numeric source accounts. These are product/storage limits, not evidence that ordinary BAS numbers are invalid. Limits protecting memory/amount storage are appropriate; report them accurately. |

**Checksum and flag positives:** the parser accepts files without a checksum, checks a declared checksum and blocks a missing closing checksum. `SieChecksum` uses CRC32; tokenization removes delimiter syntax, and `crcAdd` converts compatibility encodings to CP437 values. Omitting checksum on export is permitted. FLAGGA is relevant to accumulating imports; NeoERP instead protects its opening/history workflows using hashes and confirmation state (`SieImportService.kt:226-243`). A future voucher importer must address FLAGGA and producer acknowledgement explicitly. [4C §10 and #FLAGGA](https://sie.se/wp-content/uploads/2026/02/SIE_filformat_ver_4C_2025-08-06.pdf).

### Fortnox / Visma / BL robustness matrix

These are **format-derived pilot cases**, not claims that a named vendor/version produces each shape. No authentic vendor fixture is present in the supplied SIE resources.

| Real-world file shape to obtain from each vendor | Expected NeoERP outcome / risk |
| --- | --- |
| Ordinary CP437 full-year 4E with balances, numeric BAS accounts, normal/correction lines | Supported balance/history path; R/BTRANS handling matches the intended one-count behavior. Actual vendor acceptance unverified. |
| Payroll, invoicing or year-end-tool `.si` transaction-only 4I | Explicitly unsupported. With RAR present it can instead be reported as `no_balances`. Must not advertise general voucher import. |
| Cost centres, projects, nested dimensions, quantities and object balances | Monetary account totals retained; dimensions, project history, units and voucher detail lost. Cannot reconstruct the source ledger. |
| Empty/new company or zero balances omitted | SIE-1 rejection. |
| UTF-8 without BOM or Windows-1252 delivered with PC8 declaration | Default CP437 can produce readable-looking mojibake; operator must select encoding. Existing suspect warnings are heuristic. Obtain Swedish å/ä/ö and non-CP437 cases. |
| Closing balances including year result, with closing vouchers absent | SIE-3 history warning; investigate against source program's own closing convention. |
| Nonstandard long numeric accounts, >5,000 accounts, >20 comparison years | Capacity rejection; manual account creation may need mapping rather than identical source numbering. |
| Partial-year file whose coverage does not end exactly the day before go-live | `SieYearChooser` refuses the opening-date mismatch. Intended business rule; request the correct cutoff file, do not silently shift its balances. |
| Damaged checksum file with records after its closing KSUMMA | SIE-2 accepts appended data at parser level; add negative fixture. |

## 2. Sweden: SRU mappings and declaration files

### What exists

`D/chart/SruCodes.kt` contains account-mapping allow-lists, not complete form catalogs. `R/packs/2026.3/se-sie.csv` stores INK2R/NE metadata, provenance and check state; chart materialization copies the fields. `D/chart/SieSruPicker.kt:26` selects a sign alternative, but SIE export `SieExporter.kt:209` uses only `sieSru`/`sieSruBySign`, not the NE counterparts. Multiple non-sign entries are treated as alternatives and only the first is exported.

Pinned resources: `test/resources/sie/sru/2026P4/INK2R_SKV2002-34-01-26-04.csv`, `NE_SKV2161-14-02-26-02.csv`, and `SOURCE.md`. The source note identifies [Skatteverket's 2026P4 package](https://skatteverket.se/download/18.5fb2fa71a0b0adb74a18b3/1791362773267/_Nyheter_from_beskattningsperiod_2026P4.zip), linked by the [current technical specification](https://www.skatteverket.se/foretag/inkomstdeklaration/forredovisningsbyraer/tekniskinformationomfiloverforing.4.13948c0e18e810bfa0cca8.html).

Official package cross-check: downloaded and decoded the current XLS files entirely in memory. Both committed CSVs match **every row and cell** of their official source sheets: INK2R 96 rows, NE 88 rows (integral numeric cells normalized). INK2 and INK2S sheets from the same package were also read. No dependency was installed or extra file authored.

In-memory CSV membership check: **207 accounts; 206 have INK2R metadata, 195 have NE metadata; zero mapped codes absent from the corresponding pinned list** (86 INK2R and 78 NE four-digit fields). This reproduces the limited proposition in `T/domain/chart/SruOfficialListTest.kt:54-79`; it does not run those Kotlin tests or prove semantic mappings. Forty-nine rows are not CHECKED, including intentionally unmapped 2009. INK2 and INK2S field-list fixtures are absent.

### Official 2026P4 field checks

The official INK2 field **7012** defines P4 as fiscal-year endings **YYYY0901-YYYY1231**. Therefore 2026P4 covers endings 2026-09-01 through 2026-12-31; it is not every declaration filed in 2026. Earlier endings require the applicable period tables.

| Form | Confirmed field codes relevant to a future filing layer |
| --- | --- |
| INK2 | 7104 surplus / 7114 deficit; 7132 positive / 7133 negative pension special-payroll-tax base; 7153/7154 return-tax bases at 15%, 7155/7156 at 30%; 1581 gift tax-credit base. |
| INK2R | 7281 cash/bank; 7414/7518 group-share result income/expense; 7420/7525 period-fund release/allocation; 7421/7526 excess-depreciation change, positive/negative result effect; 7450/7550 profit/loss. |
| INK2S | 7650/7750 profit/loss; 7651 income-tax add-back; 7670/7770 taxable surplus/deficit; 8020 building deductions, 8021 land works, 8022 pension costs, 8026 shareholder loans; 8040/8041 preparer yes/no, 8044/8045 audit yes/no. |
| NE | 7280 cash/bank; 7300 equity; 7381 tax debts; 7440 R11 and 7600 R12 book result; 7504 building/land-work versus 7505 equipment/intangible depreciation; 7608 period-fund release, 7709 allocation; 7630/7730 final surplus/deficit. |

The sheets specify nonzero mutual exclusions for the relevant result/base pairs and exclusive yes/no fields. They are not interchangeable account annotations. [Official 2026P4 package, the four named form sheets and INK2 field 7012](https://www.skatteverket.se/download/18.5fb2fa71a0b0adb74a18b3/1791362773267/_Nyheter_from_beskattningsperiod_2026P4.zip).

### Findings, mapping risks and fixes

| ID / priority | Ours versus intended result | Fix / evidence limit |
| --- | --- | --- |
| SRU-1 **High if NE support is claimed: INK2R selection only** | The exporter ignores populated `sieSruNe`. Example: account 1010 has INK2R **7201**, NE **7200**; export uses 7201. No legal-form/return-profile selection is visible at that call. This is not proof that an AB-only SIE export is wrong; NE-capable filing/export is unimplemented. | Choose an explicit form/entity profile and use its metadata; keep AB/INK2R-only scope clear until then. Test the same account under INK2R and NE. Pinned official CSVs identify the differing meanings. |
| SRU-2 **Medium: valid codes can still describe the wrong liability** | Account **2860** maps to **7367** (group-company liabilities) but its provenance explicitly says franchise balances with non-group parties are not split; the row is UNCHECKED (`se-sie.csv:91`). For an unrelated-party franchise liability the relevant INK2R liability line is **7369**, not 7367. This is a conditional semantic mapping error, not an invalid field number. | Split or override by counterparty/relationship, or block statutory readiness for unresolved use. Do not mark checked until the actual business meaning is established. Pinned INK2R rows identify the two headings. |
| SRU-2a **Medium: asset-dependent NE depreciation alternative** | `se-sie.csv:207` gives account **8850** NE **7505;7504** and marks it UNCHECKED. These identify equipment/intangible versus building/land-work depreciation, respectively. `SieSruPicker` uses the first non-sign alternative; it has no asset/context split. NE metadata is not yet selected by the exporter, so this is a latent preparation gap, not current wrong NE output. | Resolve the underlying asset before producing NE amounts; split aggregate balances where needed. Do not infer asset class from the monetary sign or mark the entire row verified. |
| SRU-3 **Medium: code-year provenance discarded on import** | Parser ignores `#TAXAR`; imported account facts store only numeric SRU strings (`SieImportPreviewer.kt:209-216`). Thus a valid-looking old-year code cannot be distinguished from a current code by these facts. Export conditionally derives TAXAR from fiscal-year end + 1 (`SieExporter.kt:195`). | Preserve source TAXAR separately; validate/review codes against selected form and period. Do not treat a calendar-year formula as proof that a particular edition applies to every broken year. Relevant SIE record: **#TAXAR**. [4B #TAXAR](https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_ENGLISH.pdf). |
| SRU-4 **Medium: no declaration format implementation** | No INFO.SRU/BLANKETTER.SRU writer or INK2/INK2S calculation/mapping layer was found. A SIE `#SRU` annotation is not `#UPPGIFT` declaration data. The membership tests do not verify field types, whole-krona values, cross-field rules or totals. | Before claiming filing support, implement the selected forms and period catalogs, calculations, identities, transport encoding and envelope validation. Keep tax adjustments/user inputs separate from ledger balances. |
| SRU-5 **Low: ambiguous multiple-code data model** | `SieSruPicker` always suppresses all but one non-sign code. The SIE format can require simultaneous reporting under several headings; current arrays instead document alternatives. No concrete present non-sign row requiring simultaneous output was established. | Distinguish ALTERNATIVE_BY_SIGN, ALTERNATIVE_BY_CONTEXT and SIMULTANEOUS mappings before expanding the pack. Do not blindly export every existing array element. [4B #SRU items 1-2](https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_ENGLISH.pdf). |

**Filing-format baseline:** Skatteverket requires INFO.SRU plus BLANKETTER.SRU, ordered record envelopes and final `#FIL_SLUT`; a declaration block uses `#BLANKETT`, `#IDENTITET`, optional `#NAMN`, data records and `#BLANKETTSLUT`. BLANKETTER is limited to 5 MB. Representation is **ISO8859-1**, unlike SIE CP437. Amount signs follow the sign printed on the form: an ordinary expense on a minus-marked row is normally transmitted as a positive value; departures reverse the sign. Do not copy SIE debit-minus-credit values directly into every SRU field. Field codes may occur only once per block; identity numbers include century digits and omit hyphens. These are future requirements, not supported records. [Skatteverket, file transfer and record-order sections](https://www.skatteverket.se/foretag/inkomstdeklaration/forredovisningsbyraer/tekniskinformationomfiloverforing.4.13948c0e18e810bfa0cca8.html).

**Unverified:** complete future INK2/INK2S filing transformations, full BAS-account-to-tax-heading semantics, changes across earlier periods, and actual Skatteverket acceptance. Official fixture fidelity and the P4 end-date rule were verified; that does not certify a complete tax return. Missing INK2R 7450/7550 or NE result/adjustment fields from an account-mapping allow-list is not itself an error: calculated form results need a separate preparation layer.

## 3. Norway: SAF-T Financial v1.30

### Supported elements and planned deviations

**Implemented elements: none found.** There is no SAF-T exporter/parser/writer, pinned XSD, or XML fixture in the reviewed accounts implementation. Plain `saft` searches also match `isAfter`; those matches are not SAF-T support. `SieExporter` is the located statutory file-job implementation; `StatutoryExportController.kt:26` exposes SIE4. `docs/api/accounts-a2.md:51-54` and `accounts-a3.md:54` defer statutory exports. `docs/api/accounts-h-design.md:3-6` is explicitly an unapproved draft.

| ID / priority | Ours | Official comparison and proposed fix |
| --- | --- | --- |
| NO-1 **High: obsolete mapping plan** | `accounts-h-design.md:97,132-134` and `accounts-packs-2026-2.md:108,1108` propose 2/4-digit standard-account mappings. | v1.30 removed that mapping option; use applicable GroupingCategory + GroupingCode, both required. Keep old standard-account references only as legacy metadata. [General documentation, p16](https://www.skatteetaten.no/globalassets/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-regnskap/oppdateringer-mars-2024/norwegian-saf-t-financial-data---documentation.pdf). |
| NO-2 **Medium: unsupported adjustment-period assumption** | `accounts-h-design.md:144-145` says periods are 1-12 and collapses 13 into 12. | XSD uses nonNegativeInteger without maximum 12; technical description p28 calls for the accounting period. Remove the assertion; specify and verify the actual adjustment-period policy before applying a lossy conversion. [Official v1.30 XSD](https://raw.githubusercontent.com/Skatteetaten/saf-t/master/SAF-T_Financial_1.3/Norwegian_SAF-T_Financial_Schema_v_1.30.xsd), [technical description, p28](https://www.skatteetaten.no/globalassets/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-regnskap/oppdateringer-mars-2024/norwegian-saf-t-financial-data---technical-description.pdf). |
| NO-3 **High for 2027 delivery: version policy missing** | Draft `:121-127` targets 1.30. | Current authority notice offers 1.40 immediately and requires it from 1 January 2027; old versions remain usable for financial years 2026 and earlier. Pin schema and reporting-year rules rather than implementing an unversioned export. [Skatteetaten version notice](https://www.skatteetaten.no/en/business-and-organisation/start-and-run/best-practices-accounting-and-cash-register-systems/saf-t-financial/documentation/). |

The v1.30 implementation contract still needs precise Header, MasterFiles and GeneralLedgerEntries mappings. In particular: required SelectionCriteria and StandardTaxCode; party BalanceAccount structures per GL account; DebitTaxAmount/CreditTaxAmount and DebitAnalysisAmount/CreditAnalysisAmount choices; counts, currency, dates, references and reconciled debit/credit totals. These are acceptance requirements, not existing support. [Technical description, pp6,17-19,28-31,40-41](https://www.skatteetaten.no/globalassets/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-regnskap/oppdateringer-mars-2024/norwegian-saf-t-financial-data---technical-description.pdf), [v1.30 XSD](https://raw.githubusercontent.com/Skatteetaten/saf-t/master/SAF-T_Financial_1.3/Norwegian_SAF-T_Financial_Schema_v_1.30.xsd).

Include stored optional information and scope an authority delivery to one financial year or less. Schema validity alone does not prove bookkeeping completeness. [General documentation, pp10-11](https://www.skatteetaten.no/globalassets/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-regnskap/oppdateringer-mars-2024/norwegian-saf-t-financial-data---documentation.pdf).

**Import robustness:** no Norwegian SAF-T importer exists to assess. Fortnox/Visma/BL SIE files cannot be treated as Norwegian SAF-T. Obtain genuine Norwegian vendor exports and official v1.30 examples for namespaces, party accounts, VAT mapping, noncalendar years and adjustment periods once an import scope exists. No XML conformance result or Norway statutory-readiness claim is established here.

## 4. Denmark and Finland

**Denmark:** national SAF-T data-sharing requirements exist independently of Norway. Erhvervsstyrelsen states registered bookkeeping systems must support generating/importing/exporting SAF-T **2.1 from 1 January 2027**; nonregistered systems can use **1.0, a header file**. The authority links its own XSD/examples/code lists. No Danish implementation was found in this audit. Decide the product's registration scope and implement the Danish profile separately. Cash-register SAF-T is a different profile. [Official Danish guidance, updated 2026-09-08](https://erhvervsstyrelsen.dk/standardkontoplan-saf-t).

**Finland:** **unverified absence** of a national SAF-T Financial schema. Official Vero audit guidance requires electronic accounting information with an audit trail, with delivery arrangements agreed for the audit; that does not establish adoption of the Norwegian schema. Do not present Finnish tax/XBRL filing as an equivalent SAF-T implementation without a separate source and scope. [Vero tax-audit guidance, §3.1](https://vero.fi/en/detailed-guidance/guidance/359968/the-tax-administrations-guidance-on-tax-auditing/).

## 5. Proposed acceptance checks and disposition

All findings remain pending with the accounts lead. No application behavior was changed.

1. Parser fixtures: zero-balance type 1/4E; no-checksum/correct/wrong/truncated checksum; reject any meaningful data after closing checksum; R/BTRANS pairs; date diagnostics; declared capacity boundaries.
2. Export integrity: validate final encoded object IDs; keep CP437 Swedish characters and escaped quotes; test golden re-import and year-result reconciliation under the accepted closing convention.
3. Swedish tax metadata: compare mappings against authoritative form/period tables **and account meaning**, test debit/credit alternatives, NE versus INK2R, unresolved 2860 and other UNCHECKED rows. Separate calculated declaration results from account annotations.
4. Norway: correct the draft mapping/version/period assumptions, pin applicable XSDs/code lists, then require schema validation, referential integrity and GL/AR/AP/VAT reconciliation. Add authority samples and real vendor files.
5. Pilot: obtain consented/anonymized Fortnox, Visma and BL samples with exact product/version, fiscal year, export options and encoding. Record actual outcomes before marking interoperability verified.

Verification performed for this report: targeted source/docs search, static cross-file review, official-source comparison, in-memory XLS-to-CSV cell comparison and pack-code membership checks, and independent in-memory reconciliation of the committed CP437 golden file (6 vouchers, 13 transactions; 2099 difference 16749.25). Existing tests were inspected, not executed. No Gradle, official validator upload or return submission was performed.

Delivery checkpoint: report independently skimmed; Norway and principal SIE findings confirmed, and the final SRU skim corrected the wording of the excess-depreciation field pair. Concurrent unrelated report commits advanced workspace master during review (observed `12101755dc85d25b56e392e3a6d5e9b7eeb074e5`); the reviewed backend revision remained unchanged and both application trees remained clean. Only this report is authorized for this task's commit.
