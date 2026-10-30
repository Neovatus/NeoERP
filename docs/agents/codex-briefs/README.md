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
