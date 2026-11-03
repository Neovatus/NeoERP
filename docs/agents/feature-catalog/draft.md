# NeoERP feature catalog (Draft for Jabran)

Date: 2026-11-03. Docs only; no code changed. Waiting for Jabran's approval.

**Purpose.** NeoERP is sold by module and by feature inside a module (RULES §2–§5: agreement, company default, branch override, feature override; no plans or tiers). This is the proposed full list of features per module, with a recommended commercial kind and default.

**Rules.**
- Feature codes are permanent (they are stored data). The 24 codes already in `ModuleFeature.kt` stay exactly as they are; new rows are added.
- ADD_ON = sold separately; switching it on is a commercial act. BETA = available but marked as not mature. INCLUDED = comes with the module.
- Region = the feature applies only in that country (PK, NO, SE, DK, FI, IS). It is not "missing" elsewhere, it does not apply.
- Every large-customer feature is optional per company and off by default (large-customer-roadmap). Basic features are on by default.
- "(inferred)" = my guess, not read in a doc. Built/Planned status comes from the Accounts roadmap and M5 plan; where I could not confirm exact build state I say so.

**Always-on foundations (not features, not sold):** dimensions for company, branch, account, period, product, department, cost centre, project (ADR-021); audit log; permissions; the posting engine; the approval model; the file store. Only the items below are switchable.

Legend for Status: Built / In build (M5) / Planned phase N (Accounts roadmap build phases) / Large-customer roadmap / Later.

---

## FINANCE

| Code | Name | What the customer gets | Kind | Default on? | Region | Status | Existing? |
|---|---|---|---|---|---|---|---|
| GENERAL_LEDGER | General ledger and journals | Chart of accounts, journals with two-person posting, reversal, trial balance, general ledger | INCLUDED | Yes | | Built (A0, A1; reports phase 1) | yes |
| PERIOD_CLOSE | Period close and year-end | Close, reopen, lock months; close the year | INCLUDED | Yes | | Planned phase 1 and 2 (A2, A3) | no |
| FIN_STATEMENTS | Financial statements | Profit and loss, balance sheet, cash flow in each country's layout; PDF/XLSX/CSV export | INCLUDED | Yes | | Planned phase 1–2 (A2, A3, A3b) | no |
| RECEIVABLES | Receivables | Customers, invoices with legal content, credit notes, receipts, ageing | INCLUDED | Yes | | Built (M1–M4); M5 refunds, advances, write-offs in build | yes |
| PAYABLES | Payables | Suppliers, bills, payments (KID/OCR/Bankgiro), ageing | INCLUDED | Yes | | Planned phase 3 (C) (inferred: partly built) | yes |
| REFUNDS_ADVANCES | Refunds, advances and write-offs | Customer refunds, advances and final-invoice deductions, supplier advances, bad-debt write-off and recovery | INCLUDED | Yes | | In build (M5) | no |
| OPENING_BALANCE_IMPORT | Opening-balance import | Import opening balances from CSV, Excel, SAF-T | INCLUDED | Yes | | Planned (OBI; CSV/Excel next slot) | no |
| SIE_SE | SIE import and export | SIE 4 export and import of balances and history | INCLUDED | Yes (when company country is SE) | SE | Planned phase 2 (H-SE) | no |
| BANK_RECONCILIATION | Bank and reconciliation | Bank accounts, transfers, reconciliation, clears payroll/tax payables | INCLUDED | Yes | | Planned phase 5 (D, D2) | no |
| STATEMENT_IMPORT | Bank statement import | Load statements (camt.053, PK CSV) | INCLUDED | Yes | | Planned phase 5 | no |
| PAYMENT_FILES | Payment files | Bank payment files (pain.001) for supplier and payroll payments | ADD_ON (inferred) | No | | Large-customer roadmap (roadmap pri 2) | no |
| BANK_FEEDS | Live bank feeds | Automatic statement feeds from bank APIs | ADD_ON | No | | Later (not on roadmap yet) | no |
| DOCUMENT_OUTPUT | Invoice and document PDF | Invoice and credit-note PDF per country | INCLUDED | Yes | | Planned phase 5 | no |
| EINVOICE_SEND_NO | E-invoicing: Norway | Send and receive Peppol BIS / EHF | INCLUDED (inferred) | No | NO | Planned phase 5; sending needed before 2027-01-01 | no |
| EINVOICE_SEND_SE | E-invoicing: Sweden | Peppol BIS, Svefaktura | INCLUDED (inferred) | No | SE | Planned phase 5 | no |
| EINVOICE_SEND_DK | E-invoicing: Denmark | OIOUBL / Peppol | INCLUDED (inferred) | No | DK | Planned phase 5 | no |
| EINVOICE_SEND_FI | E-invoicing: Finland | Finvoice / Peppol | INCLUDED (inferred) | No | FI | Planned phase 5 | no |
| EINVOICE_SEND_IS | E-invoicing: Iceland | Peppol BIS (inferred) | INCLUDED (inferred) | No | IS | Planned phase 5 | no |
| FBR_DIGITAL_INVOICING_PK | FBR digital invoicing | Every invoice sent to FBR/PRAL, cancellation, Annex-C check | INCLUDED (inferred: a legal duty) | Yes for PK companies | PK | Planned phase 5/6 (RM-PK amendment, provider open D-125) | no |
| ATTACHMENTS | Attachments | Vouchers and documents on journals, bills, bank entries | INCLUDED | Yes | | Planned phase 5 | no |
| VAT_RETURN_NO | VAT return Norway | MVA-melding file | INCLUDED | No | NO | Planned phase 6 (E) | no |
| VAT_RETURN_SE | VAT return Sweden | Momsdeklaration | INCLUDED | No | SE | Planned phase 6 | no |
| VAT_RETURN_DK | VAT return Denmark | Momsangivelse | INCLUDED | No | DK | Planned phase 6 | no |
| VAT_RETURN_FI | VAT return Finland | Kausiveroilmoitus | INCLUDED | No | FI | Planned phase 6 | no |
| VAT_RETURN_IS | VAT return Iceland | VSK | INCLUDED | No | IS | Planned phase 6 | no |
| TAX_FILING_PK | Sales tax and FBR filing | PK Annex A/C returns and registers | INCLUDED | No | PK | Planned phase 6 (E, H-PK) | yes |
| EU_SALES_LISTS | EU sales lists | EU sales list reports | INCLUDED (inferred) | No | | Planned phase 6 | no |
| SAFT_NO | SAF-T Norway | Statutory SAF-T file | INCLUDED | No | NO | Planned phase 6 (H-NO) | no |
| SAFT_DK | SAF-T Denmark | Statutory SAF-T file (same engine as NO) | INCLUDED | No | DK | Planned phase 6 (H-DK) | no |
| STATUTORY_FILES_FI_IS | FI and IS statutory files | Statutory files not covered by VAT returns | INCLUDED | No | FI, IS (one code each, inferred) | Planned phase 6 (H-FI, H-IS) | no |
| RECURRING_JOURNALS | Recurring journals and accruals | Recurring journals, accruals with auto-reversal | INCLUDED | Yes | | Planned phase 4 (A4) | no |
| JOURNAL_CSV_IMPORT | Journal CSV import | Import journals from CSV, with dimension columns | INCLUDED | Yes | | Planned phase 4 (A4) | no |
| PAYROLL_POSTING | Payroll posting | Payroll posts balanced journals into the books | INCLUDED | Yes | | Planned phase 4 (A5); Payroll P2 contract approved | no |
| MULTI_CURRENCY | Multi-currency | Foreign-currency documents, revaluation, realised and unrealised FX, currency per bank account | ADD_ON | No | | Later (after launch; roadmap pri 2) | yes |
| FREE_DIMENSIONS | Free dimensions | Extra company-defined dimensions beyond the built-in ones | ADD_ON (inferred) | No | | Large-customer roadmap (F1, ADR-021) | no |
| BUDGETS | Budgets | Versions, grid entry, approval and lock, budget vs actual, forecast | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| BUDGET_CONTROL | Budget control | Check, reserve and release on purchases, bills, expenses | ADD_ON | No | | Large-customer roadmap (ADR-022) | no |
| FIXED_ASSETS | Fixed assets | Register, depreciation, disposal, capex budget | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| APPROVAL_LIMITS | Approval limits | Limits per role and amount on journals and payments | INCLUDED (inferred) | No | | Large-customer roadmap (pri 1) | no |
| POSTING_API | Integration posting API | Outside systems post daily totals as balanced journals | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| ALLOCATIONS | Allocations | Split costs by key or % across cost centres and departments | ADD_ON (inferred) | No | | Large-customer roadmap (pri 2) | no |
| DIMENSION_REPORTING | Dimension reporting | Reports by department, project, cost centre | INCLUDED (inferred) | No | | Later (after launch) | no |
| CONSOLIDATION | Group consolidation | Group view, currency, eliminations | ADD_ON | No | | Later (G design; roadmap pri 2) | no |
| INTERCOMPANY | Intercompany | Matching between group companies, group chart | ADD_ON | No | | Large-customer roadmap (pri 3) | no |
| FRANCHISE_CHARGES | Franchise charges | Charges from head office to franchises | ADD_ON (inferred) | No | | Later (F design) | no |
| IMPORTED_DOCUMENTS | Imported invoices and bills | Ageing and payment matching for Accounts-only companies | INCLUDED (inferred) | No | | Large-customer roadmap (pri 2) | no |
| FIN_VOLUME | Volume tools | Archive and audit export, report snapshots, background report jobs | ADD_ON (inferred) | No | | Large-customer roadmap (pri 2) | no |

---

## HRMS

| Code | Name | What the customer gets | Kind | Default on? | Region | Status | Existing? |
|---|---|---|---|---|---|---|---|
| EMPLOYEE_REGISTER | Employee register | Employee records, departments, designations, history | INCLUDED | Yes | | Built (H0, H1 approved; v2 build state inferred) | yes |
| LEAVE_ATTENDANCE | Leave and attendance | Leave requests, balances, holidays, attendance | INCLUDED | Yes | | Built in part (H2, H3 approved) | yes |
| DOCUMENT_VAULT | Document vault | Encrypted employee documents | INCLUDED | Yes | | Built (H1) | yes |
| APPRAISALS | Appraisals | Appraisal cycles | BETA | No | | Existing, as BETA | yes |
| HR_TIME | Shifts, clock and overtime | Calendars, shifts, clocking, overtime, time periods | INCLUDED | Yes | | Planned (H3 contract approved) | no |
| HR_LIFECYCLE | Onboarding and lifecycle | Onboarding, job-change requests, ending, moving, re-hire | INCLUDED | Yes | | Planned (H4 contract approved) | no |
| ESS | Employee self-service | Employees see own leave, time, payslips | INCLUDED | Yes | | Built in part (inferred) | no |
| HR_POSITIONS | Position management | Headcount per position, vacancies, budgeted vs filled | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| HR_ORG_CHART | Org chart | Chart from departments and reports-to | INCLUDED (inferred) | No | | Large-customer roadmap (pri 1) | no |
| HR_BULK | Bulk import and mass changes | Import and mass edits with a review step | INCLUDED (inferred) | No | | Large-customer roadmap (pri 1) | no |
| APPROVAL_CHAINS | Approval chains and delegation | Multi-step approvals, delegation, escalation | ADD_ON | No | | Large-customer roadmap (shared with Accounts) | no |
| HR_REPORTS | HR reports | Headcount, turnover, absence, cost by department | ADD_ON | No | | Large-customer roadmap (needs reporting layer ADR-023) | no |
| HR_DOCUMENTS_GEN | Generated documents and e-signature | Contracts and letters from templates, e-sign | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| EXPENSE_CLAIMS | Expense claims | Claim, manager approval, Accounts release, taxable part to Payroll | ADD_ON | No | | Large-customer roadmap (pri 2) | no |
| PERFORMANCE_GOALS | Performance and goals | Goals and reviews | ADD_ON (inferred) | No | | Large-customer roadmap (pri 2); overlaps APPRAISALS (see questions) | no |
| TRAINING | Training and certifications | Courses, expiry reminders | ADD_ON (inferred) | No | | Large-customer roadmap (pri 2) | no |
| RECRUITMENT | Recruitment | Vacancy to applicant to offer to onboarding | ADD_ON | No | | Large-customer roadmap (pri 2) | no |
| HR_GDPR | GDPR export and erasure | Export and erase a person's data | INCLUDED (inferred: a legal duty) | Yes (inferred) | | Large-customer roadmap (pri 1) | no |
| HR_GROUP_VIEW | Group-wide person view | One person across group employers | ADD_ON (inferred) | No | | Large-customer roadmap (HRP-90) | no |
| HR_SURVEYS_SUCCESSION | Surveys, succession, learning | Surveys, succession planning, learning | ADD_ON | No | | Later (pri 3) | no |

## PAYROLL

| Code | Name | What the customer gets | Kind | Default on? | Region | Status | Existing? |
|---|---|---|---|---|---|---|---|
| PAY_RUNS | Payroll runs | Calculate, approve, post runs; run item detail | INCLUDED | Yes | | Built in part (P0, P1) | yes |
| PAYSLIPS | Payslips | Payslip view and PDF, ESS payslips | INCLUDED | Yes | | Built in part (P3 adds PDF) | yes |
| PAY_BANK_FILES | Bank files and payment | Bank files, mark as paid, payees | INCLUDED (inferred) | Yes | | Planned (P3 approved) | no |
| PAY_POSTING | Posting to Accounts | Run posts journals; retry and reversal | INCLUDED | Yes (needs FINANCE) | | Planned phase 4 (P2 approved) | no |
| STATUTORY_PK | EOBI and PESSI deductions | PK statutory deductions and filings (s.165, s.164, EOBI, PESSI/SESSI) | INCLUDED | No | PK | Built in part (P1) / Planned (P4) | yes |
| STATUTORY_NO | A-melding reporting | Norway tax card, AGA, holiday pay, A-melding | INCLUDED | No | NO | Draft baseline (P5), not authorised to build | yes |
| STATUTORY_SE | Sweden payroll rules | Tax card, employer contributions, AGI | INCLUDED | No | SE | Draft baseline (P6) | no |
| STATUTORY_DK | Denmark payroll rules | eSkattekort, ATP, eIndkomst | INCLUDED | No | DK | Draft baseline (P7) | no |
| STATUTORY_FI | Finland payroll rules | Verokortti, pensions, Incomes Register | INCLUDED | No | FI | Draft baseline (P8) | no |
| STATUTORY_IS | Iceland payroll rules | Pension, orlof, reporting | INCLUDED | No | IS | Draft baseline (P9) | no |
| PAY_EMPLOYEE_LIST | Employee pay list | Employee list inside Payroll | INCLUDED | Yes | | Large-customer roadmap (pri 1; listed as a gap) | no |
| SALARY_GRADES | Salary grades | Min, mid, max per pay group; out-of-grade reasons; compa-ratio | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| SALARY_REVIEW | Salary review cycle | Proposals, budget, approval, effective date | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| PERSONNEL_COST_BUDGET | Personnel-cost budget | Positions x headcount x grade midpoint into Accounts budget | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| PAY_VOLUME | Payroll at volume | 5,000+ employees, parallel chunks, retro recalculation with diff | ADD_ON | No | | Large-customer roadmap (pri 1) | no |
| PAY_MASS_VARIABLE | Mass variable-pay import | Import variable pay in bulk | INCLUDED (inferred) | No | | Large-customer roadmap (pri 1) | no |
| PAY_MULTI_APPROVAL | Multi-level run approval | Payroll then Finance above an amount | ADD_ON (inferred) | No | | Large-customer roadmap (pri 1) | no |
| PAY_COST_SPLIT | Cost allocation splits | Split pay cost across dimensions | ADD_ON (inferred) | No | | Large-customer roadmap (pri 1) | no |
| PAY_AGREEMENT_TABLES | Collective-agreement tables | Union and sector pay tables | ADD_ON | No | | Later (pri 2) | no |
| PAY_GROUP_RUNS | Multi-company group runs | One run across companies | ADD_ON | No | | Later (pri 2) | no |

---

## INVENTORY, SALES, PURCHASING, MANUFACTURING

No contracts exist for these. All rows below are inferred from existing codes; the module is not buildable yet (an agreement cannot include an unimplemented module). Status for every row: Later (designed with dimensions ADR-021 and budget contract ADR-022 from the first spec).

### INVENTORY

| Code | Name | What the customer gets | Kind | Default on? | Region | Status | Existing? |
|---|---|---|---|---|---|---|---|
| STOCK_BY_WAREHOUSE | Stock by warehouse | Stock levels per warehouse | INCLUDED | Yes | | Later | yes |
| BATCH_SERIAL | Batch and serial tracking | Track batches and serial numbers | INCLUDED | Yes | | Later | yes |
| INTER_BRANCH_TRANSFERS | Inter-branch transfers | Move stock between branches | INCLUDED | Yes | | Later | yes |
| PURCHASING | Purchasing | Purchase orders, goods receipt, supplier bills link (GRNI) | ADD_ON | No | | Later; see Q2 | yes |
| INVENTORY_VALUATION | Inventory valuation | Stock value posted to the ledger (FIFO or average) (inferred) | INCLUDED (inferred) | Yes | | Later (roadmap "valuation link") | no |
| STOCK_COUNT | Stock counts | Cycle counts and adjustments (inferred) | INCLUDED (inferred) | Yes | | Later | no |

### SALES

| Code | Name | What the customer gets | Kind | Default on? | Region | Status | Existing? |
|---|---|---|---|---|---|---|---|
| QUOTES_ORDERS | Quotes and orders | Quotes and sales orders | INCLUDED | Yes | | Later | yes |
| INVOICING | Invoicing | Sales invoices through Accounts (ADR-018) | INCLUDED | Yes | | Later | yes |
| POINT_OF_SALE | Point of sale | Till sales; off per branch | INCLUDED | Yes | | Later | yes |
| CUSTOMER_RECORDS | Customer records | Customer master data | INCLUDED | Yes | | Later | yes |
| PRICE_LISTS_DISCOUNTS | Price lists and discounts | Customer price lists, volume discounts (inferred) | ADD_ON (inferred) | No | | Later | no |
| SALES_BUDGET_CONTROL | Credit and budget checks | Credit limits, budget check on sales (inferred) | ADD_ON (inferred) | No | | Later | no |

### PURCHASING (today a feature under INVENTORY; see Q2)

| Code | Name | What the customer gets | Kind | Default on? | Region | Status | Existing? |
|---|---|---|---|---|---|---|---|
| PURCHASING | Purchasing (as it exists) | Core purchasing | ADD_ON | No | | Later | yes (under INVENTORY) |
| PURCHASE_ORDERS | Purchase orders | Create and approve POs (inferred) | INCLUDED (inferred) | Yes | | Later | no |
| GOODS_RECEIPT | Goods receipt | Receive goods, GRNI clearing in Accounts | INCLUDED (inferred) | Yes | | Later | no |
| PURCHASE_APPROVALS | Purchase approvals with budget check | Approval chain, reserve budget (ADR-022) | ADD_ON (inferred) | No | | Large-customer roadmap | no |
| SUPPLIER_PORTAL | Supplier records and portal | Supplier master data; portal later (inferred) | INCLUDED (inferred) | Yes | | Later | no |

### MANUFACTURING

| Code | Name | What the customer gets | Kind | Default on? | Region | Status | Existing? |
|---|---|---|---|---|---|---|---|
| BILLS_OF_MATERIAL | Bills of material | Product structures | INCLUDED | No | | Later | yes |
| WORK_ORDERS | Work orders | Production orders | INCLUDED | No | | Later | yes |
| QUALITY_CONTROL | Quality control | Inspections | BETA | No | | Later | yes |
| ROUTINGS_CAPACITY | Routings and capacity | Work centres, planning (inferred) | ADD_ON (inferred) | No | | Later | no |
| PRODUCTION_COSTING | Production costing | Cost of production to ledger (inferred) | ADD_ON (inferred) | No | | Later | no |

---

## Questions for Jabran

1. **ADD_ON or INCLUDED for large-customer features?** Recommendation: ADD_ON for budgets, budget control, fixed assets, consolidation, intercompany, posting API, salary grades/review, positions, volume, expense claims, recruitment. INCLUDED but off by default for things that are workflow polish (org chart, bulk import, approval limits, GDPR). Lets large customers buy what they need without a plan ladder.
2. **Purchasing: module or feature?** It is a feature of INVENTORY today. Recommendation: make PURCHASING its own module (own agreement line, own budget contract, owns purchase orders, approvals, goods receipt). Needs a new module code and a decision on how the existing PURCHASING feature code is retired (keep the code, mark it deprecated, nothing deleted).
3. **Dimensions: feature or foundation?** Recommendation: always-on foundation (company, branch, department, cost centre, project, product). Only FREE_DIMENSIONS (and BUDGETS) are sold features.
4. **Country-specific rows: one code per country or one code with a region list?** Recommendation: one code per country (VAT_RETURN_NO, SAFT_NO, EINVOICE_SEND_NO). The catalog stays flat and each code has a single region. The existing TAX_FILING_PK and STATUTORY_PK/NO already follow this.
5. **Are statutory duties ever switchable off?** RM-PK says registration configuration cannot switch off statutory duties. Recommendation: legal-duty features (FBR invoicing, VAT returns, e-invoice sending where mandatory, GDPR) are INCLUDED and on automatically when the company's country matches; the switch exists only for branches that do not trade.
6. **APPRAISALS (BETA) vs PERFORMANCE_GOALS.** Recommendation: keep APPRAISALS as is; fold goals and reviews into it later as the same code, and do not add PERFORMANCE_GOALS as a second code.
7. **Add-on pricing unit.** Some add-ons scale by volume (PAY_VOLUME, FIN_VOLUME, POSTING_API). Recommendation: keep them as plain ADD_ON switches now; put any volume number in the agreement limits (RULES §10), not in the catalog.
8. **Catalog in code or in data?** Today it is a Kotlin list. With over 100 codes across countries, recommendation: keep codes in the Kotlin list for now (reviewed in PRs, tied to migrations) and revisit only when a non-developer needs to add features.
