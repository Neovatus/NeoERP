# Accounting retention and erasure: NO, SE, DK, FI, IS, PK

Research date: **31 October 2026**. Official sources only. This is a research report and proposed NeoERP policy, not an implementation change.

**Result:** preserve statutory accounting information and the evidence needed to explain it; delete unnecessary personal data and redundant copies under a separate schedule. There is no verified rule that every bank-detail field, application log or uploaded file must be kept for the full accounting period. Encryption preserves information; masking and fingerprints generally cannot replace required source evidence.

## Scope, evidence and checkpoint

| Field | Checkpoint |
|---|---|
| Identity / ownership | codex-retention; Codex research lead and sole writer of this report. Country research delegated read-only under WORKFLOW's parallel-work instruction. No implementation ownership transferred. |
| Authorization | User expressly authorized research and exactly this file, committed alone on master with the specified message. NeoERP-App / NeoERP-BackEnd remain read-only; no push. User's specific prohibition overrides routine PROJECT-STATE reads; none were read. No separate plan/state/handoff file created. |
| Discovery / plan | Read requested backend decisions, attachments contract and C-3 / §7.2, plus workspace workflow and backend agent guide. Research statutory categories, clocks, storage and erasure; distinguish verified text, classification inference and verification gaps. |
| Evidence | Requested workspace is /Users/jabransiddiqui/Offices/Neovatus/NeoERP, distinct from the session's /Users/jabran-siddiqui/... copy. Initial root HEAD 9430942, master; later HEAD 63d837e from concurrent work. Unrelated dirty/untracked paths existed, including brief-sb2a.md, design-principles.md, erp-lead.md and other task directories. They were not edited or staged. Backend runtime/backfill state was not independently tested. |
| Findings / disposition | Accepted: country/type-specific periods, separate security-log policy, evidence-aware upload purge and erasure workflow. Pending: current PK consolidations, exact classification of individual proof files and exceptional sector/HR rules. Recommendations do not amend approved contracts automatically. |
| Stage / validation | Research and report complete; source/section and scope skim performed. Documentation only: no runtime tests applicable. No independent implementation review claimed. Delivery is authorized for this file alone. |
| Resume point | ERP/Accounts owners may use this report to propose bounded contract/policy changes; this task authorizes no migrations, retention jobs, hosting change or erasure action. |

Labels: **V** = verified in official law/authority material, subject to the stated version; **I** = application of that rule to NeoERP, not an express statutory product category; **U** = not fully verified. Minimum periods are not automatic permission for indefinite retention. Apply all applicable rules and justified holds.

## Retention matrix

FY = financial year. CY(FY) = calendar year in which that FY ends. Preserve through the final required day; purge only afterwards. The clock follows the year the information concerns, not its upload date.

| Country | Record type | Minimum period | Start / end basis | Official source / section |
|---|---|---|---|---|
| NO | Posted journals, ledgers, annual accounts, primary accounting evidence | 5 years | FY end | V: [NO-A §13(1) nos.1–4, (2)][NO-A]; [NO-B][NO-B] |
| NO | Invoices, payment/bank vouchers, balance and control-trail documentation | 5 years | FY end | V: [NO-A §13(1) nos.2–4][NO-A] |
| NO | Significant agreements / supplementary transaction correspondence | 3 years 6 months; 5 years when needed to complete primary evidence | Relevant FY end | V: [NO-A §13(1) nos.5–8][NO-A]; [NO-C, primary/secondary material][NO-C] |
| NO | Bank-change requests/proof; accounting approval/correction events | 5 years if primary evidence/control trail; otherwise qualifying correspondence 3.5 years | Each relevant FY end | I: preceding categories, [NO-C][NO-C] |
| SE | Journals, ledgers and financial statements | 7 years | Through seventh year after CY(FY) ends | V: [SE-A 1:2(9), 7:2][SE-A] |
| SE | Invoices, vouchers, significant agreements and supporting accounting information | Same 7-year rule | CY(FY); multi-year material uses last FY concerned | V: [SE-A 1:2(9), 7:2][SE-A]; [SE-B ch.8][SE-B] |
| SE | Accounting processing/change history and system documentation | Same 7-year rule | Last relevant CY(FY) | V: [SE-A 5:11, 7:2][SE-A]; [SE-B §9.16][SE-B] |
| SE | Bank-change request/proof and approval events | 7 years only when qualifying accounting information; no blanket master-data rule | Relevant CY(FY), including later use | I: [SE-A 1:2(9)][SE-A]; [SE-B §9.16][SE-B] |
| DK | Journals, ledgers, annual accounts | 5 years | FY end | V: [DK-A §§4,12][DK-A] |
| DK | Invoices, vouchers, necessary transaction/control trail | 5 years | FY end | V: [DK-A §§4,12][DK-A] |
| DK | Creditor master-data changes, bank-change evidence/approval relied on for transactions | 5 years when accounting material | Relevant FY end | V category / I bank-proof mapping: [DK-B §§2.5–2.6][DK-B] |
| FI | Journals/ledgers, financial statements, management report, chart and inventory of accounting records | At least 10 years | FY end | V: [FI-A 2:10(1)][FI-A]; [FI-B][FI-B] |
| FI | Invoices, vouchers, transaction correspondence and other accounting material | At least 6 years | CY(FY) end | V: [FI-A 2:10(2)][FI-A]; [FI-B][FI-B] |
| FI | Necessary accounting trace / system evidence | 10 years where part of books or their required trace; otherwise 6-year supporting-material class | FY end / CY(FY) respectively | I classification: [FI-A 2:6–10][FI-A] |
| FI | Bank-change proof, request and payment authorization | Normally 6-year supporting evidence; preserve longer if also required for a retained book/trace | Relevant CY(FY); last relevant use matters | I: [FI-A 2:5–10][FI-A]; [FI-C vouchers][FI-C] |
| IS | Journals, ledgers, vouchers, invoices, business-significant correspondence | 7 years | Relevant FY end | V: [IS-A arts.19–20][IS-A] |
| IS | Annual accounts | 25 years | Act does not separately specify this paragraph's start; FY-end computation is I / confirm | V duration: [IS-A art.20 final paragraph][IS-A] |
| IS | Required electronic accounting trace / correction records | Preserve with underlying books for 7 years | Relevant FY end | V trace requirements / I clock mapping: [IS-B arts.5,8–9][IS-B]; [IS-A art.20][IS-A] |
| IS | Bank-change request/proof/approval with accounting or significant business evidential value | 7 years | Relevant FY end | I: [IS-A arts.8,19–20][IS-A] |
| PK | Company accounting books, financial statements and relevant vouchers | At least 10 preceding financial years, or all preceding years if younger | Rolling completed FYs immediately preceding current FY | V in SECP 2022 consolidation: [PK-A s220(5)][PK-A]; currentness caveat below |
| PK | Income-tax accounts/documents, including sole trader's business evidence | 6 years; pending proceedings until final decision; special s111(2)(ii) exception | Relevant tax-year end | V in February 2026 text: [PK-B s174][PK-B]; U later amendments |
| PK | Federal sales-tax records | 6 years, with proceedings extension | Relevant tax-period end, not tax-year end | V older text / U current: [PK-D s24][PK-D]; covered electronic-invoice regime [PK-E r150S][PK-E] |
| PK | Bank-change proof, relevant approvals, evidentiary imports | Applicable company/tax evidence period; take latest applicable expiry | FY / tax-year / tax-period rules above | I: [PK-A s220][PK-A], [PK-B s174(2)][PK-B], [PK-C r29][PK-C] |
| All six | Live supplier/customer bank master data, unused routes and ordinary contact details | No separate fixed period verified for these product labels | Necessity of operational purpose; historical evidence classified separately | U as a universal statutory duration; GDPR principles for Nordic personal data, [DP-A][DP-A], [DP-C][DP-C] |
| All six | Login/access/reveal logs and general security telemetry unrelated to accounting evidence | No universal accounting minimum verified | Document justified event-based period, then delete; incident hold where needed | Nordic guidance: [DP-D, log retention][DP-D]; PK-specific universal rule U |
| All six | Temporary import files versus source documents | Temporary copy: no independent accounting duration verified. Evidentiary source: underlying category above | Relevant accounting/tax year, never merely TTL since upload | I classification; country definitions above; transfer safeguards below |

Example: FY ends 30 June 2026. NO/DK ordinary five-year records remain through 30 June 2031; SE through 31 December 2033; FI ledgers through 30 June 2036 and ordinary vouchers through 31 December 2032. An earlier bank-change approval still used for later payments must be assessed against those later years.

### Exceptions that prevent a single global timer

- **FI VAT:** invoice retention also follows taxable-month/calendar-year rules, with an additional FY-based requirement in relevant non-calendar-FY cases. Take the later applicable date. Property-investment evidence has a **13-year** period from end of the CY in which the adjustment period began; after ordinary six years, replacement by the specifically prescribed statement may be allowed. [FI-D §7, VAT Act §§209n–q][FI-D]
- **DK:** till-roll/internal-sales-voucher exception is one year after signing annual accounts; do not apply it to ordinary invoices. Real-property VAT records require ten years after acquisition or the extension/conversion work in the covered cases (VAT regulation §92(3)); do not silently count from upload. [DK-E, retention duty][DK-E]
- **Payroll/HR:** payroll postings in Accounts are accounting records. The detailed employee file is not thereby subject to the same timer. FI payroll books have ten years from FY end ([FI-E §28][FI-E]); a complete six-country employment, pension, benefits, limitation-period and sensitive-HR schedule is **U / outside verified scope**. Do not cascade an Accounts purge into payroll/HR.
- PK company-law and tax duties overlap; do not choose six years merely because s174 says six. Nor apply company-law ten years to every sole trader automatically.
- Other longer tax/sector/grant/property/construction/regulated-financial-business rules and specific preservation orders need separate classification; not exhaustively verified here.

## What counts as documentation?

**Function determines classification.** An invoice, statement, request email or import can be a voucher, supplementary evidence or a temporary duplicate. An application table name does not settle this.

**Bank-change evidence.** Denmark's official guidance expressly treats creditor master-data changes as potential accounting material when they underpin/document transactions. Sweden's BFN guidance excludes master-data changes that do not affect accounting treatment from processing history; a particular authorization may still be supporting accounting information. Thus a blanket claim that all bank edits are statutory audit records is unsupported. [DK-B §2.6][DK-B]; [SE-B §9.16][SE-B]

**NeoERP inference:** retain the approved request/version, confirmation, necessary decision/actor trace and proof when these establish who authorized the payee route used for a payment. A proof file demonstrates what was supplied; it does not prove account ownership/authenticity. A rejected request with no subsequent transaction may instead be needed for a limited fraud investigation, or may be deletable sooner; record that assessment.

**PK documentation:** prescribed business records cover receipts/expenditure, sales/purchases/services, assets/liabilities and relevant manufacturing costs; tax deductions require supporting receipts or other transaction evidence. [PK-C r29][PK-C]; [PK-B s174(2)][PK-B] Latest-rule verification remains outstanding.

**Imports.** A CSV, XLSX, SIE or SAF-T upload is accounting evidence if it is the received source, uniquely explains opening balances or supplies necessary provenance/mapping. Parsing only totals into journals may lose necessary evidence. Preserve source content, relevant mappings, acceptance/correction decisions and links sufficient to reconstruct the accounting chain. A verified complete archival transfer may allow deletion of the transport copy; a checksum alone does not preserve its contents. Swedish BFN example 7.2 illustrates permitted complete invoice transfer, not permission to discard unexplained input. [SE-B ch.7][SE-B]

**Audit events.** Preserve events necessary to interpret books and corrections, approvals or source linkage under the appropriate accounting class, even if audit-service stores them. Iceland expressly requires recorder identity, timestamps, voucher references and processing-change information. Ordinary reads, IP addresses and failed logins need a separate security purpose and retention assessment. [IS-B arts.5,8–9][IS-B]; [DP-D][DP-D]

## Storage, format and readable copies

| Country | Verified constraints and NeoERP consequence |
|---|---|
| NO | Default domestic retention. Electronic material may be stored in EEA, UK or Switzerland under regulation §7-5 conditions and written tax-office notice; other locations require permission. [NO-D][NO-D] Keep readable/printable records, backups and initially electronic booked information electronically available for 3.5 years. Scanned paper may be destroyed after backup. [NO-C][NO-C] |
| SE | Default Sweden. Electronic storage in another EU state or qualifying mutual-assistance state requires notification, immediate authority electronic access and print capability in Sweden; other cases require permission. Durable/accessibly retained records and necessary presentation equipment/systems remain required. Safe transfer permits original destruction only without alteration/loss risk. [SE-A 7:1–4,6][SE-A] |
| DK | General domestic/Nordics paper-storage restriction was removed in 2022; availability/security still apply. [DK-B §6.1][DK-B] Overseas electronic invoices have VAT notification/access requirements. [DK-C, VAT Act §52c(5)][DK-C] Nonregistered digital systems require an independent EU/EEA backup arrangement, weekly full backup and readable delivery even if encrypted/compressed. Verify registered/nonregistered system route rather than assuming generic cloud backup qualifies. [DK-D §§4–5][DK-D] |
| FI | Records inspectable/printable from Finland without undue delay; format conversion must preserve content and trace. [FI-A 2:7,9][FI-A] Foreign electronic invoices additionally require complete real-time computer access; preserve authenticity/integrity evidence too. [FI-D §7][FI-D] Paper/electronic archives and electronic backups are recognized. [FI-C][FI-C] |
| IS | Secure retention in Iceland; statutory foreign-storage exception is at most six months and authorities can demand return. Electronic records always accessible to authorities. Replace obsolete media while preserving retrieval. [IS-A art.20][IS-A] Separate backups, annual full copy and inspection tools are required. [IS-B arts.11–12][IS-B] Permanent foreign-only SaaS is not verified compliant. |
| PK | Company books at registered office or board-selected Pakistan location; notify registrar within seven days of alternate address. Foreign financial information requires local inspectable copies. [PK-A s220(1)–(3)][PK-A] Tax records in Pakistan unless Commissioner authorizes otherwise. [PK-B s174(1)][PK-B] Electronic books/documents are recognized; blanket destruction permission for all scanned originals is U. |

Encrypted storage is compatible with retaining intelligible information **only if** keys, software, access and export remain available throughout the retention period. Proposed engineering rule: archive schema/system descriptions and test restoration/export; rotate keys without losing old ciphertext access. Do not destroy a key while required records depend on it.

Bookkeeping location compliance and GDPR international-transfer compliance are separate checks. A permitted accounting-storage country does not by itself establish a lawful personal-data transfer; assess GDPR Chapter V, subprocessors and remote access as applicable. [DP-A arts.44–49][DP-A]

The backend attachment contract asserts a Norwegian future original-format e-invoice rule from 2027. The cited [2026 amending act][NO-E] could not be read in this research session: **U for exact amendment/commencement**. Preserve original XML plus any readable rendering as a prudent proposed rule; do not present the unverified future mandate as current law.

## GDPR and erasure

For SE/DK/FI and EEA-applied GDPR in NO/IS, necessary statutory retention uses **Art.6(1)(c)**, read with **Art.6(3)**. **Art.17(3)(b)** limits erasure where applicable law requires continued processing; **Art.17(3)(e)** covers necessary legal-claims processing. These are necessity-based exceptions, not blanket immunity for the whole customer record. **Art.5(1)(c),(e)** still requires minimization and limited retention. [DP-A][DP-A]; [NO-F][NO-F]; [IS-C][IS-C]

Pakistan's law does not automatically become an EU/EEA Art.6(1)(c) obligation. Where GDPR also applies, establish an appropriate basis for the relevant operation and any conflict-of-laws/claims analysis; do not reject an EEA erasure request with only a PK statute number. [DP-A art.6(3),17(3)(b)][DP-A]

### Sole trader or contact person: proposed operational workflow

1. **Route and verify.** The tenant normally controls its accounting data; NeoERP assists as processor. Identify the individual and affected tenant with proportionate verification, then locate Accounts, files, audit, notifications, replicas and relevant HR/payroll records.
2. **Decide per item.** A sole trader's legal identity and payment evidence may be required to explain an invoice. Preserve that necessary evidence for its specific clock/hold. A corporate supplier's contact person has personal-data rights too: delete obsolete live phone/email and unrelated correspondence where no basis remains; preserve an approval/signature only to the extent needed as evidence.
3. **Partially grant where possible.** Stop use of obsolete payee routes; remove unnecessary live fields and copies. Put retained evidence behind limited accounting/audit access. An erasure request alone does not justify deleting or anonymizing the legal counterparty on an unexpired voucher. Restriction under Art.18 must be considered where its conditions apply.
4. **Respond within one month.** Explain what was deleted, retained categories, specific legal grounds, expiry dates or criteria, and complaint/remedy rights. Complex requests can extend by up to two further months with notice in the first month. Inform relevant recipients as required and document the decision.
5. **Execute and verify deletion.** Remove eligible data from actual storage, search/export caches and object versions, not merely the screen. Keep a minimal deletion record with its own expiry. Delete from backups where technically possible; otherwise prevent deleted data from returning on restoration and ensure bounded backup expiry.

Steps 1/4: [EDPB rights guide][DP-B]; statutory-retention limitation: [Norwegian Datatilsynet][DP-E]; implementation of real deletion/backups: [Danish Datatilsynet][DP-C]. This workflow is proposed implementation guidance; exact fields/cross-service APIs were not audited.

**After expiry:** when neither a legal retention duty nor another demonstrably necessary lawful purpose remains, Nordic personal data must be deleted or truly anonymized without waiting for a request. A hypothetical future dispute is not a permanent hold; document purpose, scope and review/release dates. [DP-F][DP-F]; [DP-G][DP-G]

**Pseudonymization:** replacing actor names with IDs, separating identity mappings and limiting access can reduce exposure during lawful retention. With a retrievable mapping, ciphertext or linkable fingerprint, data remains personal to NeoERP/the controller; pseudonymization does not satisfy an otherwise valid erasure duty. True anonymization must prevent reasonably likely identification, including through linked invoices, amounts and remaining datasets. Never destroy a required evidentiary identity merely to call retained records anonymous. [IMY guidance][DP-H]

**PK erasure status:** [MoITT's legislation listing][PK-H] labels the May-2023 Personal Data Protection Bill **Draft**. No enacted general GDPR-style PK erasure right was verified; neither a bill nor that negative search result establishes the full current privacy-law position. GDPR applicability depends on its territorial rules, not ERP country configuration. Review applicable PK obligations and contract instructions; apply minimization as a proposed NeoERP policy even where GDPR does not govern.

**Tenant exit:** attachment decision D-152's automatic “keep to purge date” must be reconciled with the controller's documented archive/return/deletion choice. A tenant's bookkeeping duty does not automatically impose the same independent duty on NeoERP. Arrange a compliant continuing archive service, or deliver a complete usable archive and delete processor copies as instructed, subject to law actually binding the processor. [EDPB controller/processor guidance §1.3.7, paras.139–142, applying Art.28(3)(g)][DP-I]

## Concrete NeoERP keep/purge rules

These are **proposed policy/engineering changes**, not changes made by this task.

| Record | Keep rule | Purge / minimize rule |
|---|---|---|
| Posted journals, invoices, payments and reversals | Country/type clock plus required source links and corrections. Keep originals/correction trail; preserve later-year dependencies. IS annual accounts 25 years; FI books 10. | No normal UI hard-delete of unexpired accounting evidence. At lawful expiry, remove personal details/records or genuinely anonymize as permitted by remaining duties; assess cumulative multi-year books first. |
| Live bank details | Only routes needed for active payment/refund purposes; encrypt and restrict reveal. Preserve the historical approved route separately where needed for a retained payment. | Remove superseded/unused operational routes once unnecessary; do not rely on deletion from the live supplier row as erasure of historical evidence. |
| Historical bank-change request and proof | Preserve the minimal request/version, necessary authorization trail and actual evidence for all relevant payments/years. Classify independently from the 30-day anti-fraud warning. | Purge unused/rejected material on a justified separate schedule unless it qualifies as retained correspondence, source evidence or incident/claims evidence. No universal rejected-request duration verified. |
| Accounting audit events | Accounting retention class; enough stable actor/version/source information to demonstrate authorization and corrections. Required identity mapping remains accessible to authorized auditors. | Remove needless duplicated names/emails/IPs; do not erase necessary actors before the evidence expires. Accounting trail and security telemetry may need separate stores/classes. |
| Reveal/access/security logs | Risk-based period tied to review/detection needs, with protected integrity and scoped incident holds. | Automated expiry; do not retain every access event for 5/7/10 years by default. No universal “GDPR log period” verified. [DP-D][DP-D] |
| Evidentiary imports and source files | Promote/archive before temporary TTL fires; keep necessary source content, mappings and receipt/approval links; apply accounting clock/format rules. | Purge transport duplicate only after verified complete lawful transfer. Delete abandoned/rejected upload if no evidence/hold purpose survives; preserve minimal rejection metadata only as justified. |
| Proof-file staging/orphans | Atomic link/classification and protection against TTL races; evidence hold covers bytes and metadata. | Current seven-day unlinked cleanup can be appropriate only for genuinely unlinked disposable uploads. Object-store lifecycle must exclude linked evidence and held objects, including crashes between object write and metadata insert. |
| Payroll/HR | Owner service applies its own statutory schedule; Accounts retains necessary posting support. | An Accounts erasure decision neither wipes nor authorizes indefinite retention of the employee dossier. |
| Backups, replicas and exports | Required record must remain recoverable; finite protected backup lifecycle and restoration/deletion procedures. | Track redundant exports/plaintext dumps; do not allow restore or object versioning to resurrect expired personal data. [DP-C][DP-C] |

### Dropping plaintext bank columns

The requested decisions document approves AEAD encryption, keyed fingerprints and a payment snapshot containing request ID/fingerprint, with plaintext-column removal still open after every environment completes backfill.

**Retention law does not require redundant plaintext columns.** Drop them after verified complete, faithful encrypted preservation, preserving any historical versions required as payment evidence. A zero `BankDetailsBackfill.remaining()` count is a necessary project gate, not sufficient evidence alone: validate decryptability, old/new route versions, tenant/row binding, key persistence, restoration and references from historical payments. Keep keys while retained evidence depends on them; eliminate unneeded plaintext copies in exports/logs/backups through an explicit lifecycle.

**Request ID + HMAC + last four digits is not a readable historical account.** It is sufficient as a reference only while the referenced encrypted approved version and necessary proof remain retrievable for the payment's full retention. An old request expiring before the last payment that used it would break this chain. These are engineering inferences from preservation requirements, not a legal mandate for a particular schema.

### Purging imports and proof files

- “Parse-only” and “ATTACHMENT” are technical labels. Require a content/evidence decision before any TTL purge. If the original remains the only adequate source, retain it or make a lawful complete archival transfer; a posted journal or checksum is not automatically equivalent.
- Attachment C-14 starts proof retention from the **request decision's FY**. That can expire too soon when the route is used in later years. Compute the latest expiry across all payments/dependencies, including required request content and proof, not just the file's original link.
- Attachment C-9/C-11's “keep every replaced file / keep links forever” needs a privacy exception procedure: misplaced unrelated personal documents are not automatically statutory evidence. Preserve necessary correction provenance; authorize targeted removal/redaction of unnecessary content without silently falsifying accounting history. Tombstones can themselves contain personal data and need a schedule.
- A five-year NO attachment default can intentionally exceed the 3.5-year supplementary minimum, but extra personal-data retention needs a purpose. A global ten-year “safer” fallback is neither always long enough (IS annual accounts, FI property evidence) nor automatically GDPR-compliant.
- Retention holds must cover journals, requests, audit mappings and source files across services, not only one attachment table. Scope them to a case/period/dependency, review them and release when the duty ends. Never use an indefinite blanket hold as a substitute for deciding classification.

## Verification limits and remaining decisions

1. **PK currentness:** verified SECP 18-Aug-2022 s220; no enacted change found in [SECP Acts listing][PK-F]. A 2026 concept paper is not law. FBR lists [30-Jun-2026 Ordinance][PK-J], [15-Sep-2026 Rules][PK-K] and [30-Jun-2026 Sales Tax Act][PK-L], but those downloads timed out. s174 verified in February 2026; Rule29 in older official rules; s24 in older official sales-tax text. **Recheck current consolidations before enabling automatic PK purges.** Provincial service-tax duties not verified.
2. **NO future e-invoice amendment:** exact original-format/commencement text U as above. Do not confuse original-format preservation with retaining duplicate plaintext database columns.
3. **IS annual accounts clock:** 25-year period verified; precise start interpretation needs confirmation. Permanent overseas-only hosting remains unsupported by the reviewed domestic-storage rule.
4. **Bank proof / imports / audit mapping:** category-level conclusions verified, individual artifacts' legal necessity is I. Inspect actual evidence and payment dependencies before setting expiry.
5. **Special regimes / HR:** no comprehensive six-country payroll/HR, AML, regulated-sector or property/grant retention inventory delivered. Do not reuse ordinary voucher settings for those classes.
6. **Hosting:** confirm actual primary/backup locations, remote access, authority access/notifications and readable archival exports; no deployment compliance certification or backfill verification is claimed.

## Official sources

Reference links below point directly to official legislation or authority guidance. Source dates/versions and unreadable-current-text gaps are identified above; commercial summaries and draft legislation were not used as binding authority.

[NO-A]: https://lovdata.no/dokument/NL/lov/2004-11-19-73
[NO-B]: https://www.skatteetaten.no/en/rettskilder/type/uttalelser/prinsipputtalelser/oppbevaring-av-regnskapsmateriale-ved-avvikling-og-konkurs/
[NO-C]: https://info.altinn.no/starte-og-drive/regnskap-og-revisjon/regnskap/oppbevaring-av-regnskapsmateriale
[NO-D]: https://www.skatteetaten.no/nn/rettskjelder/type/uttalelser/uttalelser/oppbevaring-av-elektronisk-regnskapsmateriale-i-utlandet---endringer-i-bokforingsforskriften-og-skattebetalingsforskriften/
[NO-E]: https://lovdata.no/dokument/LTI/lov/2026-06-19-39
[NO-F]: https://www.regjeringen.no/no/tema/statlig-forvaltning/personvern/ny-personopplysningslov/id2340094/
[SE-A]: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/bokforingslag-19991078_sfs-1999-1078/
[SE-B]: https://www.bfn.se/wp-content/uploads/vl13-2-bokforing.pdf
[DK-A]: https://www.retsinformation.dk/eli/lta/2022/700/pdf
[DK-B]: https://erhvervsstyrelsen.dk/vejledning-bogfoeringsloven
[DK-C]: https://info.skat.dk/data.aspx?oid=2068793
[DK-D]: https://erhvervsstyrelsen.dk/ikke-registrerede-digitale-bogfoeringssystemer
[DK-E]: https://info.skat.dk/data.aspx?oid=2068798
[FI-A]: https://www.finlex.fi/fi/lainsaadanto/1997/1336
[FI-B]: https://www.vero.fi/yritykset-ja-yhteisot/yritystoiminta/uusi-yritys/kirjanpito-tilikausi-verokausi/
[FI-C]: https://www.suomi.fi/yritykselle/talouden-hallinta-ja-verotus/yrityksen-taloushallinto/opas/kirjanpito-ja-taloushallinto/kirjanpidon-jarjestaminen
[FI-D]: https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/48090/laskutusvaatimukset-arvonlisaverotuksessa3/
[FI-E]: https://finlex.fi/fi/lainsaadanto/2016/768/muutoshistoria/20250383
[IS-A]: https://www.althingi.is/lagas/nuna/1994145.html
[IS-B]: https://files.reglugerd.is/pdf/0505-2013/current
[IS-C]: https://island.is/en/o/the-data-protection-authority/data-protection-policy
[PK-A]: https://www.secp.gov.pk/document/the-companies-act-2017-updated-18-aug-2022/?wpdmdl=45422
[PK-B]: https://download1.fbr.gov.pk/Docs/2026226162211364IncomeTaxOrdinance2001-Amended-20.02.2026.pdf
[PK-C]: https://download1.fbr.gov.pk/Docs/202010211102851544IncomeTaxRules2002.pdf
[PK-D]: https://download1.fbr.gov.pk/Docs/201610251310646821SALESTAXACT1990updatedupto31-8-201621-10.pdf
[PK-E]: https://download1.fbr.gov.pk/SROs/2023111015115239175SRO1525-2023.pdf
[PK-F]: https://www.secp.gov.pk/laws/acts/
[PK-H]: https://www.moitt.gov.pk/Legislations
[PK-J]: https://www.fbr.gov.pk/Categ/Income-Tax-Ordinance/326/1000
[PK-K]: https://www.fbr.gov.pk/categ/income-tax-rules-2002/335
[PK-L]: https://urdu.fbr.gov.pk/categ/sales-tax-act/301/1000
[DP-A]: https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?country=258&uri=CELEX%3A32016R0679
[DP-B]: https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en
[DP-C]: https://www.datatilsynet.dk/regler-og-vejledning/behandlingssikkerhed/sletning
[DP-D]: https://www.datatilsynet.dk/regler-og-vejledning/behandlingssikkerhed/katalog-over-foranstaltninger/logning-af-brugernes-anvendelser-af-personoplysninger
[DP-E]: https://www.datatilsynet.no/rettigheter-og-plikter/den-registrertes-rettigheter/rett-til-sletting/
[DP-F]: https://www.datatilsynet.dk/regler-og-vejledning/grundlaeggende-begreber/hvad-er-dine-forpligtelser/de-grundlaeggende-principper
[DP-G]: https://www.datatilsynet.dk/regler-og-vejledning/grundlaeggende-begreber/paavisningskrav-og-dataminimering
[DP-H]: https://www.imy.se/verksamhet/dataskydd/innovationsportalen/vi-guidar-dig/vi-hanterar-bara-anonymiserade-personuppgifter-da-kan-vi-val-bortse-fran-gdpr/
[DP-I]: https://www.edpb.europa.eu/system/files/documents/2023-10/EDPB_guidelines_202007_controllerprocessor_final_en.pdf
