# Codex verification briefs (2026-10-31)

Five read-only second-opinion checks for Codex. Each writes ONE report into its own folder
`docs/agents/codex-<task>/report.md` in the workspace repo and changes nothing else. The ERP lead
(Claude) reviews each report and turns real findings into fixes (forward migrations; packs are hash-locked).

Common rules for every task (also inside each prompt):
- Read-only on NeoERP-App and NeoERP-BackEnd (no code, pack, migration or doc edits; no commits there).
- Never read or touch any PROJECT-STATE*.md. Never print secrets.
- Every finding: id, severity (High/Medium/Low), our file:line or CSV row, what our data says, what the
  official source says (link + section/date), the fix you recommend. Mark items you could not verify.
- Official sources only (tax authority, legislation, central bank / bank association specs).

Tasks: 1 tax-pack data audit (all six countries) · 2 Pakistan deep check · 3 statement layouts
(DK ÅRL, FI, IS, NO, SE, PK) · 4 payment-reference algorithms · 5 rate and rule changes from 1 Jan 2027.
The prompts are below; paste one per Codex task.

---

## 1. Tax-pack data audit (all six countries)

```
Task: independent audit of NeoERP's shipped tax-code data for NO, SE, DK, FI, IS and PK.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd (no edits, no commits there). Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-tax-pack-audit/report.md (workspace repo; you may commit only that file on master with message "docs(codex): tax pack audit").
Read: NeoERP-BackEnd/services/accounts-service/src/main/resources/packs/ (tax CSVs per country and version, MANIFEST.txt), the contracts NeoERP-BackEnd/docs/api/accounts-packs-2026-2.md (§3 tax packs, §3.4 expected rates), accounts-packs-2026-3.md, accounts-a1.md / accounts-c.md tax sections (C-13, C-21 deductible, reverse charge), and the later migration NeoERP-BackEnd/services/accounts-service/src/main/resources/db/migration/V22* and V33* (pack corrections).
Check every tax code row: rate and validity dates, applies_to (SALES vs PURCHASES) vs its account role (e.g. WHT_PAYABLE is a purchases-side liability; we just found 13 PK withholding codes wrongly marked SALES), reverse-charge pairing, deductible percent, VAT return box / reporting code mapping, zero/exempt/out-of-scope kinds, default codes per company type. Compare with the official sources (Skatteetaten, Skatteverket, Skattestyrelsen, Verohallinto, Skatturinn, FBR/provincial authorities) in force for 2026.
Output: summary table per country (rows checked / OK / findings), then findings (id, severity, file + row, ours vs source with link, recommended fix). Mark anything you could not verify.
```

## 2. Pakistan deep check

```
Task: deep verification of NeoERP's Pakistan tax rules (income-tax withholding and sales tax).
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-pk-tax-check/report.md (you may commit only that file on master: "docs(codex): PK tax check").
Read: PK tax CSVs in NeoERP-BackEnd/services/accounts-service/src/main/resources/packs/ (2026.1, 2026.2), V22 and V33 migrations under .../db/migration/, contracts NeoERP-BackEnd/docs/api/accounts-c.md (C-13 s.153, C-20 STRN/NTN, ATL), accounts-b.md (receipts withholding, FBR), accounts-packs-2026-2.md (PK parts), payroll docs only if they define PK rates shared with Accounts.
Verify against the Income Tax Ordinance 2001 (s.153(1)(a)/(b)/(c), s.155, s.236 as relevant), the Finance Act 2025/2026 rates, ATL/non-ATL multipliers, sales tax act withholding (Sales Tax Withholding Rules), provincial sales tax on services (Punjab PRA, Sindh SRB, KP KPRA, Balochistan BRA) rates and registration, STRN/NTN formats and when each is required on purchase invoices, FBR Digital Invoicing scope. For each of our codes: rate, base (gross vs net of sales tax), validity dates, applies_to, account role, ATL handling.
Output: findings table (id, severity, our row, ours vs official with link/section, fix) + a list of rules we don't model yet that a PK company would need before go-live.
```

## 3. Statement layouts per country

```
Task: verify NeoERP's profit-and-loss and balance-sheet layouts per country against the law.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-statement-layouts/report.md (commit only that file on master: "docs(codex): statement layouts").
Read: layout definitions in the accounts-service packs and migrations (search NeoERP-BackEnd/services/accounts-service/src/main/resources for PL_NATURE, PL_NATURE_SE, PL_NATURE_GP, PL_NATURE_IFRS and balance-sheet layouts; migrations V23, V24), contracts accounts-packs-2026-2.md §2.4, accounts-a2.md / accounts-a3.md statement sections, accounts-h-se.md.
Check line wording, order and subtotals against: Denmark årsregnskabsloven bilag 2 (skema 1–4; confirm there is no "Resultat efter finansielle poster" line where we omit it — this is an open item), Sweden ÅRL bilaga 2/3 (kostnadsslagsindelad), Norway regnskapsloven, Finland kirjanpitoasetus (tuloslaskelma/tase kaavat), Iceland lög um ársreikninga, Pakistan (IFRS for SMEs / Companies Act 2017 Fifth Schedule as applicable). Note which line each chart account group feeds.
Output: per country — matches / differences (ours vs law with section), recommended wording or order changes.
```

## 4. Payment-reference algorithms

```
Task: verify NeoERP's payment-reference check-digit validators against the official specifications.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-payment-refs/report.md (commit only that file on master: "docs(codex): payment references").
Find the validators: backend (grep NeoERP-BackEnd/services/accounts-service for KID, OCR, FIK, RF, Luhn, MOD11, mod97, PaymentReference) and app (grep NeoERP-App/composeApp/src for the same). Contract: NeoERP-BackEnd/docs/api/accounts-c.md C-22, accounts-b.md payer references.
Verify: Norwegian KID (MOD10 Luhn and MOD11 incl. '-' for remainder 10, length rules) per Bits/Nets spec; Swedish OCR (Bankgirot: Luhn, length check digit, soft/hard/variable control levels); Danish FIK/+71/+73/+75 (Nets specification incl. check digits and creditor number); Finnish reference (viitenumero 7-3-1) and RF creditor reference (ISO 11649 mod 97); IBAN mod 97; Bankgiro/Plusgiro number checks. Build a table of official test vectors (valid and invalid) and state, by reading the code, whether each validator would accept/refuse each vector; flag any difference between backend and app.
Output: per algorithm — spec link, our implementation (file:line), vector table with expected vs our result, findings and fixes.
```

## 5. Changes from 1 January 2027

```
Task: list every tax, payroll-relevant accounting or reporting rule change taking effect on or around 1 Jan 2027 in NO, SE, DK, FI, IS and PK that NeoERP's accounts packs would need as a new dated version.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-2027-changes/report.md (commit only that file on master: "docs(codex): 2027 changes").
Read our current data: tax CSVs in NeoERP-BackEnd/services/accounts-service/src/main/resources/packs/ (latest version per country), contracts accounts-packs-2026-2.md and accounts-packs-2026-3.md, accounts-roadmap.md (e-invoicing deadlines, e.g. Norway 2027).
Find, from official sources (budget laws, tax authority announcements): VAT/moms/ALV/VSK rate changes, new or removed codes, reverse-charge scope changes, reporting box changes, e-invoicing/e-reporting mandates and dates, SAF-T or SIE format changes, PK Finance Act changes effective in the period. Only items with an official source.
Output: per country — change, effective date, source link, which of our pack rows/contract items it affects, what to add (new dated version), urgency (before 31 Dec 2026 or later).
```

## 6. Official payee verification services (research)

```
Task: research how NeoERP can verify a payee's bank account against official/bank services before a supplier (or customer refund) bank-details change is approved, per country: NO, SE, DK, FI, IS, PK.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-payee-verification/report.md (commit only that file on master: "docs(codex): payee verification research").
Context: NeoERP stores supplier bank details only through an approved change request (NeoERP-BackEnd/docs/api/accounts-c.md C-3, §7.2; decisions in docs/api/accounts-decisions-for-jabran.md "bank-details safety package"). We want an automatic "the bank confirms the name matches this account" signal for the approver.
For each country find, from official sources only: the service (e.g. EU Verification of Payee under the Instant Payments Regulation (EU) 2024/886 / EPC VOP scheme for euro accounts — FI; Sweden: Bankgirot/BankID or bank name-check services for Bankgiro/accounts; Norway: Bits / bank account-name control (e.g. KAR); Denmark: NemKonto or bank services; Iceland; Pakistan: Raast / IBFT title fetch), who may call it (only banks/PSPs, or companies via their bank, PSD2/open-banking providers, aggregators), what it returns (match / close match / no match, name), cost and contract needed, API/spec links, whether it works for business accounts, and data-protection limits. Also list aggregators that cover several of these countries.
Output: per country — service, access route for an ERP like NeoERP (direct / via the customer's bank / via an open-banking provider), returned data, prerequisites, links; then a recommended integration approach and order (which countries first), and what must be in NeoERP's design (where the check runs, how the result is stored and shown, what happens on "no match").
```

---

# Round 2 (2026-10-31): reviews and research, 7–13

Same common rules as above. Tasks 7–10 first (security and money), 11–13 after.
Code-review tasks: every finding also needs a concrete failure scenario (inputs/state → what goes wrong)
and whether an existing test already covers it. Do not run Gradle in NeoERP-App or NeoERP-BackEnd
(builders use those checkouts); reading code only.

## 7. Bank-details safety review

```
Task: independent security review of NeoERP's supplier bank-details safety package.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd; do not run Gradle there. Never read PROJECT-STATE*.md. Never print secrets or key material. Write exactly one file: docs/agents/codex-bank-safety-review/report.md (commit only that file on master: "docs(codex): bank safety review").
Read: decisions "bank-details safety package" A–E in NeoERP-BackEnd/docs/api/accounts-decisions-for-jabran.md; contract NeoERP-BackEnd/docs/api/accounts-c.md C-3 / §7.2; code under NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/ (infrastructure/crypto/BankDetailsCrypto.kt, configuration/bank/BankCryptoConfig.kt, the bank-change request, approval, notice, proof-file and fraud-signal code — grep "bank"), migrations V35–V39 in .../resources/db/migration/, scripts/accounts-bank-keys.sh, the user-service permission-holder count endpoint and its machine scope iam.permission-holders.read, and the app side (NeoERP-App/composeApp/src: grep "bank" in features/accounts).
Check: AES-256-GCM via Tink — keyset handling, associated-data binding (can a ciphertext be moved to another row/company/field and still decrypt?), key rotation path, what happens with a missing/wrong key at startup; HMAC fingerprints (keyed, normalised input, enumeration risk on short account numbers); the startup backfill (idempotent? concurrent instances? partial failure? plaintext left behind?); any plaintext in logs, exceptions, audit events, API responses, app state, crash reports; the approval rules (two-person, Owner exception P3-30, self-approval, changing details while a request is pending, race between approve and edit); notice to the previous email; proof-file upload (type/size checks, malware, path traversal, who can read it); fraud signals (bypassable?); machine-scope least privilege; tenant isolation on every bank endpoint.
Output: findings (id, severity, file:line, failure scenario, existing test or none, fix), then a short "what is solid" list.
```

## 8. Company data isolation audit

```
Task: audit NeoERP's backend for any way one company's data can be read or changed by a user of another company.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd; do not run Gradle there. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-tenant-isolation/report.md (commit only that file on master: "docs(codex): tenant isolation audit").
Read: NeoERP-BackEnd/AGENTS.md (platform & tenant auth rules), docs/architecture/architecture-and-standards.md, architecture-tests/src/test/kotlin/com/neovatus/architecture/TenantRepositoryArchitectureTest.kt (@TenantOwnedRepository), then every controller and repository in services/ (accounts, user, org, hr, payroll, audit; api-gateway routing).
Check: every endpoint taking an id (journal, invoice, customer, supplier, branch, warehouse, employee, file, import, notice…) resolves the owning company and checks it against the caller's scope before reading or acting; list/search queries always filter by company; native SQL / JDBC adapters include company_id; repositories missing @TenantOwnedRepository or bypassing it; machine/client-credential callers and platform staff (ROLE_SUPER_ADMIN) paths; IDOR via child resources (lines, attachments, approvals, history); cross-service calls that pass a company id from the request instead of the token; caches keyed without company; idempotency keys or numbering shared across companies.
Output: endpoint/repository table (service, path or class, isolation check present Y/N, evidence file:line), then findings (id, severity, failure scenario, fix, suggested architecture-test rule to prevent the class of bug).
```

## 9. Posting engine invariants

```
Task: try to break NeoERP's general-ledger guarantees on paper and say whether the code stops each attack.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd; do not run Gradle there. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-posting-invariants/report.md (commit only that file on master: "docs(codex): posting invariants").
Read: NeoERP-BackEnd/docs/api/accounts-a1.md (posting, approvals, idempotency), accounts-b.md / accounts-c.md (receivables/payables posting, settlements), code in services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/posting/ (PostingEngine.kt, PostingRequestHash.kt, PostingLineValidator.kt, MachinePostingService.kt, LedgerCheckJob.kt), journal/period/year-end services, receivables/payables posting and allocation services, and migrations V26–V28 (immutability triggers), V30/V31 (idempotency request tables), V32, V38 (approval-run claims).
Attacks to try (add your own): change or delete a posted line (app path and direct SQL — do triggers hold?); insert a line into a posted entry; reuse an idempotency key with a different body, different company, different user, after expiry; concurrent post of the same draft; approve while the creator edits; reverse twice / reverse a reversal; post into a closed or locked period or year; unbalanced entry via rounding (multi-currency, VAT); posting with an inactive or control account directly; allocation over-settling an invoice; concurrent receipts on one invoice; deadlock from lock order (rule: sources before targets, targets in id order, party last) — find any path that breaks it; numbering gaps or duplicates under concurrency/rollback; counters going backwards; machine poster acting as a person.
Output: attack table (attack, expected guarantee, code path file:line, blocked Y/N/partly, test that proves it or none), then findings with failure scenario and fix.
```

## 10. Bookkeeping retention vs data protection

```
Task: research how long an ERP must keep accounting data, bank details, audit logs and source documents, and how that interacts with GDPR / data-protection erasure, for NO, SE, DK, FI, IS and PK.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-retention/report.md (commit only that file on master: "docs(codex): retention research").
Context: NeoERP stores encrypted supplier/customer bank details (old plaintext columns are to be dropped after a backfill), bank-change proof files, audit events, posted journals, invoices, imports (uploaded files are purged after a period), payroll and HR data in other services. Read NeoERP-BackEnd/docs/api/accounts-decisions-for-jabran.md (bank-details safety package, open items), accounts-attachments.md, accounts-c.md C-3.
Find from official sources (bookkeeping acts and regulations, tax authorities, data-protection authorities, GDPR Art. 6(1)(c)/17(3)(b), PK Companies Act / Income Tax Ordinance record-keeping): retention period per record type and country, what counts as "documentation" (e.g. do bank-change requests, approval trails, import files count?), start of the period (end of fiscal year?), storage-location/format rules (e.g. abroad, electronic, readable copy), what may/must be deleted after, how to handle an erasure request for a sole trader or contact person, and rules for pseudonymising instead of deleting.
Output: table (record type × country: period, start, source link/section), then what NeoERP must do: per record type keep/purge rule, erasure handling, and what this means for dropping plaintext bank columns, purging import files and proof files. Mark anything not verified.
```

## 11. SIE 4 and SAF-T conformance

```
Task: check NeoERP's SIE import/export and SRU mapping (Sweden) and SAF-T Financial (Norway; note DK/FI equivalents if any) against the official specifications.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd; do not run Gradle there. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-sie-saft/report.md (commit only that file on master: "docs(codex): SIE and SAF-T conformance").
Read: SIE sections in NeoERP-BackEnd/docs/api/accounts-a2.md, accounts-a3.md, accounts-a4.md, accounts-a5.md (grep SIE, SRU, SAF-T); code: grep -ril "sie\|sru\|saft" NeoERP-BackEnd/services/accounts-service/src/main (SieImportConfig, SieExportConfig and their services, parsers, writers); test fixtures in services/accounts-service/src/test/resources/sie/ (incl. sru/2026P4 INK2R and NE CSVs).
Check against: SIE 4B/4E spec (sie.se: record types, #FLAGGA, #KSUMMA, encoding CP437/PC8, #RAR, #IB/#UB/#RES, #VER/#TRANS sign and date rules, #SRU, #KTYP, dimensions #DIM/#OBJEKT, what an importer must accept vs may ignore); Skatteverket SRU file format and INK2/INK2R/INK2S/NE field codes for the 2026 tax year; Skatteetaten SAF-T Financial v1.30 (header, MasterFiles, GeneralLedgerEntries, StandardAccountID / grouping codes, tax codes mapping, validation rules) if we export or plan it.
Output: per format — supported records, deviations (ours vs spec with section), import robustness gaps (what real files from Fortnox/Visma/BL would break us), SRU code mapping errors, and fixes. Mark unverified items.
```

## 12. E-invoicing readiness (Peppol)

```
Task: research what NeoERP needs to send and receive e-invoices and e-reports in NO, SE, DK, FI, IS and PK, with dates.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-einvoicing/report.md (commit only that file on master: "docs(codex): e-invoicing readiness").
Read: NeoERP-BackEnd/docs/api/accounts-roadmap.md (e-invoicing items), accounts-b.md (customer invoices, credit notes, payment references), accounts-c.md (supplier invoices), accounts-docout.md (documents out), and docs/agents/codex-2027-changes/report.md (already lists some mandates — do not repeat, link).
Find from official sources: mandates and dates per country (B2G, B2B, receiving vs sending; Norway 2027 plan; Denmark OIOUBL→Peppol BIS; Finland Finvoice/TEAPPSXML/Peppol; Sweden; Iceland; Pakistan FBR Digital Invoicing scope and API), Peppol BIS Billing 3.0 + national CIUS rules (EHF, OIOUBL, Svefaktura), access-point options (own AP vs provider; certification cost), participant identifiers (orgnr schemes, 0192/0007/0184/0037/0216…), required invoice fields we may lack (buyer reference, order reference, VAT breakdown per rate, payment means codes, endpoint IDs, attachments), and receiving flow (validation, mapping to supplier invoices).
Output: per country — mandate/date/source; field-gap table (BIS 3 field → do we have it, where); recommended architecture (provider AP vs own), order of countries, and items to add to the roadmap with urgency.
```

## 13. App UX conformance sweep

```
Task: sweep NeoERP-App screens for breaks of our own UX rules.
Workspace: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on NeoERP-App and NeoERP-BackEnd; do not run Gradle. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-ux-sweep/report.md (commit only that file on master: "docs(codex): UX conformance sweep").
Rules: NeoERP-App/docs/design/ux-principles.md §21 (click-through), §22 (page errors, top-aligned; reference line only on server errors), §23 (empty states: NeoSpotState / NeoNoResults / NotAvailable / EmptyLine), §24 (toasts: bottom-right desktop / bottom-centre phone, timings, max 3, never for form errors); NeoERP-App/docs/design/specs/building-blocks.md; notes/empty-error-states-audit.md and notes/formats-audit.md (decisions ES-Q*, FMT-Q*); formatting through core/format NeoFormat (dates "9 Oct 2026", date-time "19:05, 27 Oct 2026", money in company format with true minus, percent per country, company time zone); required fields marked with required = true and never folded; sentence-case headers; no raw error codes or enum names shown to users.
Search composeApp/src/commonMain for: hard-coded date/number formatting (toString on dates/BigDecimal, String.format, "%.2f", LocalDate.toString), raw error codes or enum .name in Text(), toasts used for form errors, screens without empty/error states, required inputs without required = true, hard-coded colours/sizes instead of tokens, English strings not in sentence case.
Output: findings grouped by rule (file:line, what, suggested fix), then a per-feature score table. Skip anything in tests and mocks.
```

---

# Round 3 (2026-10-31): Codex as builder and reviewer

**Builder rules (Jabran 2026-10-31: Codex builds in its own git worktree so it can run in parallel).**
- Never edit the main checkouts NeoERP-App / NeoERP-BackEnd. Create your worktree first:
  `git -C <repo> fetch origin && git -C <repo> worktree add /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/<task> -b codex/<task> origin/<base>`
  (backend base `dev`, app base `dev-app`). Work, build and test only inside that worktree.
- Commit on your branch only, never push, never merge, never force. The ERP lead (Claude) reviews, merges in
  migration order and pushes.
- Migration numbers are assigned here; use exactly yours. Applied migrations are frozen; never change V1–V39.
  Never start services against Jabran's local database (Testcontainers in tests are fine).
- Never read PROJECT-STATE*.md; never print secrets; do not delete files unless the brief says so.
- Use cheaper model tiers for mechanical parts (data rows, wording, fixtures) and your strongest tier for
  migrations, money/tax logic and review of your own diff.
- Commit with: `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "<msg>"` No Codex, Claude or other AI attribution line in commit messages or code comments.
- Finish with a report in your worktree's last commit message body or as `docs/agents/codex-<task>/build-report.md`
  in the workspace repo (commit only that file on master): commit hashes, what changed per item, tests run with counts,
  anything skipped and why.

Merge order: V40 (Claude, posting guards) → C1 V41 → C2 V42. C3 has no migration.

## C1. Tax data fixes (backend, V41)

```
Task: build the confirmed tax-data fixes as one forward migration V41 in NeoERP-BackEnd. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md (worktree /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c1-tax-data, branch codex/c1-tax-data from origin/dev).
Source of truth: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-tax-triage.md (details per item) and docs/agents/codex-decisions-2026-10-31.md.
Do: T-03 (NO code 85 → PURCHASES, ZERO, 0 %, legal text), T-04 (provincial WHT jurisdictions PK-BA/KP/PB/SD), T-05 (rename payable WHT codes; keep names a company changed itself), T-06 (add rate versions from 2025-07-01 for CONTRACT, GOODS-CO, GOODS-OTHER, IT, MEDIA with the TY2026 values), T-07 (NO 15 % note: water and sewer since 2025-07-01), T-09 notes only (PORT/PROF qualifiers), T-13 (FI import self-assessment version date), T-14 (DK out-of-scope kind), T-21 (source text and start dates of SVC-CERTAIN / SVC-OTHER).
Do NOT touch T-01, T-02, T-10 (waiting for the Pakistan professional check), T-08 / new codes (next pack), T-11, T-15–T-20, T-23.
Migration V41 must be idempotent per tenant data (existing companies), touch only template/pack-derived rows the item names, keep company-edited names, and never change posted documents. Mirror the same corrections into the next pack version files under services/accounts-service/src/main/resources/packs/ only if the pack process in docs/api/accounts-packs-2026-3.md says corrections go there (packs are hash-locked; follow MANIFEST rules). Update contracts that state the old values.
Tests: migration test(s) proving each change on a seeded tenant and that a company-renamed code keeps its name; run `./gradlew :services:accounts-service:test`.
```

## C2. Statement layouts and chart version (backend, V42)

```
Task: fix statement layouts and balance-sheet mappings in NeoERP-BackEnd as forward migration V42 plus a new chart version. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md (worktree /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c2-layouts, branch codex/c2-layouts from origin/dev).
Source of truth: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-layouts-refs-triage.md (A-items with chart rows and law references) and docs/agents/codex-decisions-2026-10-31.md (L1–L3, L7).
Do: A1 (Finland: PL_NATURE_FI with "Voitto (tappio) ennen tilinpäätössiirtoja ja veroja" before appropriations; repoint FI); A2–A5, A8, A9 as ONE new chart version: two new account subtypes FINANCIAL_ASSET_CURRENT and OTHER_PAYABLE_NON_CURRENT (decision L3) and corrected line maps for 1380/1390, 2290 (SE 2390), group 18, SE 2350/2360/2410, NO 2030, SE 3960/3961/7960/7961; an adoption/re-subtype step for existing companies that never changes posted entries (follow how earlier chart versions are adopted — find it); A6/L1: report MANAGEMENT instead of STATUTORY_LAYOUT for any company not yet on the corrected version; A7 (DK/SE expense order and "external costs" line) and A11 (Iceland order/provisions) if the triage gives exact rows; L7: Finnish and Danish line wording from the law as local labels where the layout model supports local labels; A13/A14 doc corrections.
Do NOT touch A10, A12, A17 (unverified/Pakistan pending).
Tests: layout/statement tests per country showing each moved account on the right line and the FI subtotal; adoption test on an existing company; run `./gradlew :services:accounts-service:test`.
```

## C3. Payment references (backend + app, no migration)

```
Task: fix payment-reference validation in both repos. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md, with TWO worktrees: backend /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c3-refs-be (branch codex/c3-refs from origin/dev) and app /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c3-refs-app (branch codex/c3-refs from origin/dev-app).
Source of truth: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-layouts-refs-triage.md (B-items, vectors) and docs/agents/professional-checks-nordic.md (L4).
Do: B1 (FIK +73 saved without payment ID; app FIK73 enum, no round-trip to None), B2 (app follows the backend: failed OCR is a warning, not a Submit block, unless the contract says otherwise — check accounts-b.md/accounts-c.md), B4 (IBAN per-country length/pattern in backend; mod-97 checksum in app), B5 per L4 decision: FI creditor number = exactly 8 ASCII digits [0-9]{8}, NO check digit; keep fixture 12345678 and fix its wrong "Luhn" comment; reject non-ASCII digits, B6, B7 (KID minimum length 4 in contract, pack note and both validators), B8 (KID MOD10/MOD11 per agreement where stored; otherwise document), B9 (app Bankgiro/Plusgiro checks), B10 (receipt payer reference checksum + PAYER_REFERENCE_INVALID), B11 (ASCII digits only before arithmetic).
Do NOT do B3 (OCR control levels need a schema change; separate task).
Keep backend and app validators identical; one shared test-vector table (official vectors from the triage) run in both repos' tests. Tests: `./gradlew :services:accounts-service:test` in the backend worktree; `./gradlew :composeApp:jvmTest --tests '*features.accounts*'` and once `:composeApp:compileDebugKotlinAndroid` in the app worktree.
```

## R1. Second review of the profile-access fix (I1)

```
Task: independent security review of NeoERP-BackEnd commit 5c93fb5 ("fix(user): pending invites never grant profile access; sensitive profile fields person-owned"). READ-ONLY; do not run Gradle in the main checkout. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-review-i1/report.md in the workspace /Users/jabransiddiqui/Offices/Neovatus/NeoERP (commit only that file on master: "docs(codex): review of I1 fix").
Background: NEW-01 in docs/agents/codex-tenant-isolation/triage.md. Read `git -C NeoERP-BackEnd show 5c93fb5` and the surrounding user-service code. Try to break it: any endpoint that still reads/writes iam.users or exposes personal data via a pending or foreign membership (search, people list, export, security summary, sessions, audit, bootstrap, machine endpoints); check-then-act races; platform staff paths; deactivated vs pending; email-change rule; fullName refreshed from the token at sign-in; fail-closed wiring; whether the tests exercise the attack through the real security chain.
Output: verdict (SHIP / SHIP-AFTER-FIXES / BLOCK), findings (id, severity, file:line, failure scenario, fix).
```

---

# Round 4 (2026-11-01): Codex builders while Claude is capped

Same "Round 3 builder rules" (own worktree, never push/merge, assigned migration numbers, no services against the
local DB). Migration numbers: V41 = C1, V42 = C2, **V43 = C4, V44 = C5**. V40 stays unused (Flyway accepts the gap).
Backend tasks C4 → C5 in that order, each branched from the previous task's branch so migrations stack:
C4 from `codex/c2-layouts` once C2 is committed (or `origin/dev` + cherry-pick C1/C2 if told), C5 from `codex/c4-posting-guards`.
C6 and C7 have no migration and can run in parallel from `origin/dev`; C8 from `origin/dev-app`.

## C4. Posting guards (backend, V43)

```
Task: close the posting-engine gaps in NeoERP-BackEnd as forward migration V43 plus code. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md (worktree /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c4-posting-guards, branch codex/c4-posting-guards, base per Round 4 notes). Use your strongest tier: this is posting core.
Source of truth: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-posting-invariants/triage.md (exact fixes and the test that proves each) and docs/agents/codex-decisions-2026-10-31.md (E1–E5).
Do (E1): F-01 record which transaction posted each journal and allow line inserts into a posted journal only from that same transaction; lines must carry a period; N-2 and F-07 line guards lock the parent document before checking status; F-05 a reversal link must point to a real reversal of that journal; F-03 number counters may only move up by exactly one. Correct the two docs the triage names (accounts-a2.md V11-7, journals-and-posting.md) and document E3 (stolen service DB login can still write a new balanced journal; accepted limit). Then E2: F-04 bulk-approval worker that lost its claim must not count its batch again; F-02 AR credit notes allocated to each other must not deadlock (filter targets before locking, as AP does).
Never edit V1–V42. Tests: every test the triage names, incl. the existing PostedImmutabilityTriggerTest insert now being refused; run `./gradlew :services:accounts-service:test`.
```

## C5. Pakistan s.153 withholding on gross (backend, V44)

```
Task: switch Pakistan s.153 withholding to the gross amount including sales tax in NeoERP-BackEnd as forward migration V44. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md (worktree /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c5-pk-gross, branch codex/c5-pk-gross from codex/c4-posting-guards).
Source of truth: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/professional-checks-pk.md (T1 section: exact codes and every contract paragraph to correct) and codex-tax-triage.md T-01.
Do: base GROSS on the 11 PK-WHT-153-* codes and PK-WHT-BY-CUST (existing companies too; keep company-edited names; never change posted documents); PK-WHT-155 rent stays NET_OF_SALES_TAX; correct contracts B C-21, C-46, LR-B17, C C-13 (example, SC4 note, row 12, D-24, LR-C10) and packs PK-5a; flip WithholdingBaseTest.s153DefaultBaseNetOfSalesTax and check PaymentApprovalTest. Example to test: 100 000 + 18 000 sales tax at 5 % → 5 900 withheld.
Run `./gradlew :services:accounts-service:test`.
```

## C6. SIE import without zero balances + SIE hardening (backend, no migration)

```
Task: in NeoERP-BackEnd, make SIE import accept a valid file whose zero balances were all omitted, and do the small SIE hardening items. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md (worktree /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c6-sie, branch codex/c6-sie from origin/dev).
Source: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-sie-saft/triage.md (SIE-1 → accept as empty dataset with an INFO note, plus two fixtures; S4 hardening: warning on data after the closing checksum, object-code uniqueness after cleaning, date diagnostics; S3 doc: #SRU is an INK2R account annotation only; S5 one line on the year-end convention in the export doc) and docs/agents/professional-checks-nordic.md S1 (update accounts-h-design.md for SAF-T 1.40: pin the 1.40 XSD, drop saft_standard_account, grouping fields required, remove the period-13 claim, add the H-NO items listed).
Run `./gradlew :services:accounts-service:test`.
```

## C7. Bank-change checks (backend, no migration unless unavoidable — then stop and report)

```
Task: bank-details safety follow-ups in NeoERP-BackEnd. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md (worktree /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c7-bank, branch codex/c7-bank from origin/dev). Strongest tier: security.
Source: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-bank-safety-review/triage.md and docs/agents/codex-decisions-2026-10-31.md (B1–B3, B7).
Do: M-1 new signal HOLDER_NAME_MISSING when no holder name is given (the app already words it); BANK_COUNTRY_UNKNOWN if the triage defines it; M-2 record in the approval audit which signals were shown; B2 duplicate-account check across formats with no schema change (IBAN ↔ domestic number for NO, DK, FI, PK; SE later) and include other PENDING requests; B7 hardening: BS-03 debug logging, BS-09, M-3 reveal limit note (document per-instance limit), M-5 machine client must fail at startup when its secret env var is unset outside local/test profiles.
Do NOT do B3 (notice sending), B4, B5, B6. Run `./gradlew :services:accounts-service:test` (and user-service tests if touched).
```

## C8. App follow-ups (app, no migration)

```
Task: small NeoERP-App follow-ups. Follow the "Round 3 builder rules" in /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-briefs/README.md (worktree /Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/c8-app, branch codex/c8-app from origin/dev-app).
Do: (1) Platform People list: hide search/filters/toolbar on first use and during first load, using the shared helper designsystem/components/ListToolsVisibility.kt (see commit ac651ff1 for the pattern); (2) when C3 is merged later nothing else is needed here — do not touch payment-reference code.
Rules: docs/design/ux-principles.md §23. Run `./gradlew :composeApp:jvmTest --tests '*platform*'` and once `:composeApp:compileDebugKotlinAndroid`.
```

## R2. Final cross-review (Codex reviews Claude's work) — run last

```
Task: independent review of Claude-built security work. READ-ONLY; do not run Gradle in the main checkouts. Never read PROJECT-STATE*.md. Write exactly one file: docs/agents/codex-review-round3/report.md in /Users/jabransiddiqui/Offices/Neovatus/NeoERP (commit only that file on master: "docs(codex): review of Claude security fixes").
Review: NeoERP-BackEnd commits 5c93fb5, 57ec7ad, 5ec33c3 (user-service: pending invites never grant access; person-owned profile fields; email and sign-in actions count every accepted membership) against docs/agents/codex-tenant-isolation/triage.md NEW-01; NeoERP-App commits 9f03ae41 and ac651ff1 (bank-change approval shows signals and proof file; proof download) against docs/agents/codex-bank-safety-review/triage.md BS-01/M-4. Try to break them.
Output: verdict per commit group (SHIP / FIX-FIRST / BLOCK), findings (id, severity, file:line, failure scenario, fix).
```

---

# M5 build (2026-11-03): refunds, advances, write-offs

**Codex models (Jabran 2026-11-04, matching our Claude rule):** plans and money/posting/security/migration work on
`gpt-6.1-sol` at `high` (reviews of Claude work: `gpt-6-astra` at `high`); app screens and docs on `gpt-6.1-terra` at
`medium`; mechanical edits (strings, renames, link checks) on `gpt-6-luna` at `low`. Sub-agents inside a Codex session
follow the same table. Move up one model only after a failed check.

**Sources for every M5 slice:** docs/agents/accounts-phase3/m5-plan.md (the plan) as corrected by
docs/agents/accounts-phase3/m5-plan-review.md (findings F1–F22, "Corrected slice order", Jabran's decisions
D1–D8 at the end). Where they differ, the review wins. Contracts: NeoERP-BackEnd/docs/api/accounts-b.md,
accounts-c.md, accounts-a1.md (after the M5-0 contract fixes).

**M5 rules (in addition to the Round 3 builder rules):**
- Each slice = backend + its paired app screens (AP7-…). Two worktrees per slice:
  `NeoERP-worktrees/<slice>-be` (branch `codex/<slice>` from the previous slice's backend branch, first slice from
  origin/dev) and `NeoERP-worktrees/<slice>-app` (branch `codex/<slice>` from the previous slice's app branch, first
  from origin/dev-app). Commit backend and app separately; never push.
- Migration numbers are fixed: B2 V52, B4 V53, B0 V54, B3 V55, C1 V56, C3 V57, F1 V58 (only if the schema audit finds a
  gap; otherwise no migration). Before committing a migration, `git fetch origin` and confirm the number is free on
  origin/dev and on your base branch; if not, STOP and ask.
- Posting: respect V43 guards (posted_xid, lock-before-status, reversal links, counters +1), lock order (sources
  before targets, targets in id order, party last), idempotency with request-body comparison, two-person approval
  with the documented Owner exceptions (D4). Never change posted rows.
- Tests: the slice's named tests from the plan/review; run the FULL `./gradlew :services:accounts-service:test`
  (add `-Pkotlin.compiler.execution.strategy=in-process -Dorg.gradle.jvmargs=-Xmx4g` if memory runs out) and
  `./gradlew :composeApp:jvmTest --tests '*features.accounts*'` plus once `:composeApp:compileDebugKotlinAndroid`.
- Report per slice: hashes (be/app), migration, tests with counts, deviations from the plan, open questions.
- If a slice needs a decision not covered by D1–D8, STOP and ask instead of guessing.

Order and branching: Lane AR (one session, in order): M5-0 → B1 → B2 → B4 → B0 → B3.
Lane AP (second session) starts after B2 is committed, branching from codex/m5-b2: C0 → C1 → C2 → C3.
Then R and F1 (one session) from the later of the two lane tips after the lead merges both lanes.

**Update 2026-11-03 (Jabran):** Lane AP runs after Lane AR is complete, branching from `codex/m5-b3` (backend and app),
not from B2. Migration numbers stay as above.

## SB2d. Shared dimensions on lines and balances (backend first; plan before build) — after M5 is merged

**Decision:** Jabran accepted ADR-021 on 2026-11-03 (NeoERP-BackEnd/docs/adr/ADR-021-shared-dimensions.md, Status;
roadmap amendment "dimensions after M5"). Starts only after the lead has merged M5 (R and F1 included) and pushed.

**Sources:** ADR-021 D1–D9 and its accepted question recommendations (not Q13/Q14);
docs/agents/accounts-bc-readiness/brief-sb2a.md "Dimension-set id"; accounts-a1.md, accounts-a2.md (C-25 balance key),
accounts-a3.md (C-12 year-end buckets), accounts-b.md, accounts-c.md.

**Step 1 — plan only (no code):** write `docs/agents/accounts-sb2d/plan.md` in a worktree `NeoERP-worktrees/sb2d-plan`
(workspace repo, branch `codex/sb2d-plan`). Cover: every table that gets `dimension_set_id` (journal lines, every B/C
document line table incl. M5's, `account_period_balances`, `account_year_balances`); the backfill (existing rows → set of
their current branch/cost centre, all-null set where none); the new balance key and how A2/A3 reports, year-end and
period close change; engine resolution inside the posting transaction (ON CONFLICT, concurrent first use); the
branch_id = set branch check; what happens to the fixed `cost_centre_id`/`project_id` columns; D7 free-dimension and
project tables; API changes (`DimensionSetV1` on document lines, additive); the app part (pickers) as a later slice;
migration count and order (numbers = next free on origin/dev at build, checked with `git fetch`); tests (ADR-021
"Tests / acceptance", concurrency, backfill, every existing posting/report test green); risks. Mark anything that needs
a decision as a question with a recommendation. STOP after the plan; the lead runs an Opus review and Jabran approves.

**Step 2 — build:** only after approval, with the M5 rules above (worktrees, never push, full accounts-service test run,
report hashes/migrations/tests/deviations, STOP on undecided points).

## FE. Feature entitlements enforced (backend + app; plan before build) — after SB2d

**Decision:** Jabran approved the feature catalog and its three layers on 2026-11-03
(docs/agents/feature-catalog/catalog.md). Starts after SB2d is merged. Prompt to be written by the lead then; scope:
add the approved codes to org-service `ModuleFeature.kt` (existing codes unchanged, PURCHASING moved to its own module
with the old code kept as replaced); one shared resolved-feature check (agreement → company → branch → feature) used by
every service, refusing when a feature is off, and the app hiding it; statutory region features on automatically for
that country; fix the company-level feature toggle that skips the RULES §5 reason gate. Plan first, Opus review,
Jabran approves.
