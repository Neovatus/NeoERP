# Account roles — fixed catalogue

**Status:** Draft for Jabran, 2026-10-05. Generated together with the CSVs in this folder; the mapping columns are read from the CSV `role` column, so they cannot drift.

## What a role is

A role is a meaning, not a number: "trade receivables control", "output VAT". Modules post to roles. Each company maps every role to one of its own accounts. The template pre-maps all of them.

So Payroll posts `PAYROLL_EXPENSE` / `PAYROLL_PAYABLE` the same way for a Lahore textile mill (accounts 5000 / 2930) and a Bergen café (5000 / 2930 in the NS 4102 structure; the base reuses the same class layout, so many numbers coincide) or a Malmö shop (7210 / 2821 in BAS). No module ever contains an account number.

## Rules

| Rule | Detail |
|---|---|
| Fixed list | Roles are platform data. A new role needs a reviewed migration and a template update. Companies cannot invent roles. |
| One account per role | A role maps to exactly one active posting account. One account carries at most one role. |
| Type check | The target account's type must be in the role's allowed types. A role with a control kind needs an account with that control. |
| Required | `Required at setup` roles must be mapped before setup completes and can never be unmapped, only moved to another valid account. |
| Others | Mapped by the template from day one. The slice that first posts them refuses to post while they are unmapped. |
| Versioned | A mapping change is a new row with `effective_from`. Old journals keep the account they posted to. Change needs `ACCOUNTS.ROLE_MAPPING.UPDATE`, a reason and an audit event. |
| Not a fallback | The posting engine never routes an unknown line to `SUSPENSE`. A request with an unmapped role is refused. |
| Tax codes | A tax code names an output and/or input role. It may name a specific account instead (e.g. NO 2701 for 15%); the account must still pass the role's type check. |

Alignment: codes follow `ACCOUNTS-ARCHITECTURE.md` §4.2. Rows marked **added** are proposed additions to that table (needed by the packs: pension, holiday pay, tax settlement, reverse charge, withholding, income tax, royalty, marketing fund and a few B/D roles).

## Catalogue

| Role | Purpose | Posted by | Needed from | Allowed type | Normal | Control | In §4.2 |
|---|---|---|---|---|---|---|---|
| `AR_CONTROL` | Trade receivables control (customer sub-ledger total) | Receivables (B), Sales | Required at setup | ASSET | Debit | AR | yes |
| `AP_CONTROL` | Trade payables control (supplier sub-ledger total) | Payables (C), Purchasing | Required at setup | LIABILITY | Credit | AP | yes |
| `CUSTOMER_ADVANCES` | Payments received before an invoice exists | Receivables (B) | Slice B | LIABILITY | Credit | — | yes |
| `SUPPLIER_ADVANCES` | Prepayments to suppliers before a bill exists | Payables (C) | Slice C | ASSET | Debit | — | yes |
| `ALLOWANCE_DOUBTFUL_DEBTS` | Expected credit loss allowance against receivables (contra-asset) | Receivables (B) | Slice B | ASSET | Credit | — | **added** |
| `BAD_DEBT_EXPENSE` | Receivable write-offs and ECL charge | Receivables (B) | Slice B | EXPENSE | Debit | — | yes |
| `DISCOUNT_GIVEN` | Sales and settlement discounts given | Receivables (B), Sales | Slice B | INCOME or EXPENSE | Debit | — | yes |
| `SALES_RETURNS` | Credit notes for returned goods (revenue deduction) | Receivables (B), Sales | Slice B | INCOME | Debit | — | **added** |
| `DISCOUNT_RECEIVED` | Purchase and settlement discounts received | Payables (C), Purchasing | Slice C | EXPENSE or INCOME | Credit | — | yes |
| `BANK_DEFAULT` | Default bank account for receipts and payments | Bank & cash (D), B, C, Payroll | Required at setup | ASSET | Debit | BANK | yes |
| `CASH_DEFAULT` | Cash in hand and till float | Bank & cash (D), POS | Required at setup | ASSET | Debit | BANK | yes |
| `POS_CASH_CLEARING` | Till takings counted but not yet banked | POS, Bank & cash (D) | POS / Sales | ASSET | Debit | BANK | yes |
| `CARD_CLEARING` | Card and wallet sales awaiting settlement | POS, Bank & cash (D) | POS / Sales | ASSET | Debit | BANK | yes |
| `BANK_CHARGES` | Bank and card fees | Bank & cash (D) | Slice D | EXPENSE | Debit | — | **added** |
| `INTEREST_INCOME` | Interest earned on bank balances | Bank & cash (D) | Slice D | INCOME | Credit | — | **added** |
| `INTEREST_EXPENSE` | Interest on loans and overdrafts | Bank & cash (D) | Slice D | EXPENSE | Debit | — | **added** |
| `CASH_OVER_SHORT` | Till count differences | POS | POS / Sales | EXPENSE or INCOME | Debit | — | **added** |
| `SALES_TAX_OUTPUT` | Output VAT / sales tax charged on sales | B, Sales, POS | Required at setup | LIABILITY | Credit | TAX | yes |
| `SALES_TAX_INPUT` | Input VAT / sales tax recoverable on purchases | C, Purchasing | Required at setup | ASSET or LIABILITY | Debit | TAX | yes |
| `SALES_TAX_SETTLEMENT` | Net VAT / sales tax due to or from the authority after each return | Tax (E), period close | Slice E (tax) | LIABILITY or ASSET | Credit | TAX | **added** |
| `SALES_TAX_OUTPUT_RC` | Output tax self-assessed on reverse-charge purchases | C, Tax (E) | Slice E (tax) | LIABILITY | Credit | TAX | **added** |
| `SALES_TAX_INPUT_RC` | Input tax deductible on reverse-charge purchases | C, Tax (E) | Slice E (tax) | ASSET or LIABILITY | Debit | TAX | **added** |
| `WHT_PAYABLE` | Tax withheld from supplier payments, owed to the authority (PK) | Payables (C) | Slice C | LIABILITY | Credit | TAX | **added** |
| `WHT_RECEIVABLE` | Tax withheld by customers, adjustable against own tax (PK) | Receivables (B) | Slice B | ASSET | Debit | — | **added** |
| `INCOME_TAX_PAYABLE` | Corporate income tax payable | Year-end (A3) | Slice A3 | LIABILITY | Credit | — | **added** |
| `INCOME_TAX_EXPENSE` | Current income tax charge | Year-end (A3) | Slice A3 | EXPENSE | Debit | — | **added** |
| `SALES_REVENUE_DEFAULT` | Default revenue for goods sold | B, Sales, POS | Required at setup | INCOME | Credit | — | yes |
| `SERVICE_REVENUE_DEFAULT` | Default revenue for services | B, Sales | Slice B | INCOME | Credit | — | **added** |
| `PURCHASES_DEFAULT` | Default cost for purchased goods and services not held in stock | C, Purchasing | Required at setup | EXPENSE | Debit | — | yes |
| `INVENTORY` | Inventory asset (goods for resale) | Inventory, Purchasing | Required at setup | ASSET | Debit | INVENTORY | yes |
| `COGS` | Cost of goods sold, posted on issue/sale | Inventory, Sales, POS | Required at setup | EXPENSE | Debit | — | yes |
| `GRNI` | Goods received not yet invoiced | Purchasing, Inventory | Purchasing | LIABILITY | Credit | — | yes |
| `INVENTORY_ADJUSTMENT` | Stock count differences, shrinkage, write-downs | Inventory | Inventory | EXPENSE | Debit | — | yes |
| `PAYROLL_EXPENSE` | Gross salaries and wages | Payroll | Required at setup | EXPENSE | Debit | — | yes |
| `PAYROLL_PAYABLE` | Net pay owed to employees | Payroll, Bank & cash | Required at setup | LIABILITY | Credit | PAYROLL | yes |
| `PAYROLL_TAX_PAYABLE` | Employee income tax withheld (PK s.149, NO forskuddstrekk, SE personalskatt) | Payroll | Required at setup | LIABILITY | Credit | PAYROLL | yes |
| `EMPLOYER_CONTRIB_PAYABLE` | Employer social contributions owed (PK EOBI, NO arbeidsgiveravgift, SE arbetsgivaravgifter) | Payroll | Required at setup | LIABILITY | Credit | PAYROLL | yes |
| `EMPLOYER_CONTRIB_EXPENSE` | Employer social contributions cost | Payroll | Required at setup | EXPENSE | Debit | — | yes |
| `PENSION_PAYABLE` | Pension / provident fund contributions owed | Payroll | Payroll step | LIABILITY | Credit | PAYROLL | **added** |
| `PENSION_EXPENSE` | Employer pension / provident fund cost | Payroll | Payroll step | EXPENSE | Debit | — | **added** |
| `HOLIDAY_PAY_ACCRUED` | Accrued holiday pay / leave encashment | Payroll | Payroll step | LIABILITY | Credit | PAYROLL | **added** |
| `HOLIDAY_PAY_EXPENSE` | Holiday pay / leave cost | Payroll | Payroll step | EXPENSE | Debit | — | **added** |
| `PAYROLL_OTHER_DEDUCTIONS` | Other deductions from pay owed to third parties | Payroll | Payroll step | LIABILITY | Credit | PAYROLL | **added** |
| `RETAINED_EARNINGS` | Accumulated result; target of the year-end closing journal | Year-end (A3) | Required at setup | EQUITY | Credit | — | yes |
| `CURRENT_YEAR_RESULT` | Balance-sheet presentation of the open year's result; never receives lines | Reports (A3) | Required at setup | EQUITY | Credit | — | yes |
| `OPENING_BALANCE_EQUITY` | Contra for opening balances at go-live; must be zero after migration | Setup / opening balances (A1) | Required at setup | EQUITY | Credit | — | yes |
| `SUSPENSE` | Unresolved items; must be zero at year-end | Any (posting engine fallback is NOT allowed) | Required at setup | ASSET or LIABILITY | Either | — | yes |
| `ROUNDING` | Currency rounding differences on documents and tax | Posting engine, B, C, POS | Required at setup | EXPENSE or INCOME | Debit | — | yes |
| `FX_REALIZED_GAIN` | Realised exchange gains on settlement | B, C, D | Multi-currency | INCOME | Credit | — | yes |
| `FX_REALIZED_LOSS` | Realised exchange losses on settlement | B, C, D | Multi-currency | EXPENSE | Debit | — | yes |
| `FX_UNREALIZED_GAIN` | Period-end revaluation gains | Period close (FX revaluation) | Multi-currency | INCOME | Credit | — | yes |
| `FX_UNREALIZED_LOSS` | Period-end revaluation losses | Period close (FX revaluation) | Multi-currency | EXPENSE | Debit | — | yes |
| `INTERCOMPANY_RECEIVABLE` | Balances owed by franchises / group companies | Franchise charges (F), Group (G) | Slice F/G | ASSET | Debit | INTERCOMPANY | yes |
| `INTERCOMPANY_PAYABLE` | Balances owed to the franchisor / group companies | Franchise charges (F), Group (G) | Slice F/G | LIABILITY | Credit | INTERCOMPANY | yes |
| `ROYALTY_INCOME` | Franchisor's royalty income (% of franchise revenue) | Franchise charges (F) | Slice F/G | INCOME | Credit | — | **added** |
| `ROYALTY_EXPENSE` | Franchise's royalty cost | Franchise charges (F) | Slice F/G | EXPENSE | Debit | — | **added** |
| `FRANCHISE_FEE_INCOME` | Franchisor's initial, renewal, fixed and technology fees | Franchise charges (F) | Slice F/G | INCOME | Credit | — | yes |
| `FRANCHISE_FEE_EXPENSE` | Franchise's initial, renewal, fixed and technology fee cost | Franchise charges (F) | Slice F/G | EXPENSE | Debit | — | yes |
| `MARKETING_FUND_INCOME` | Marketing / ad-fund contributions received by the franchisor | Franchise charges (F) | Slice F/G | INCOME | Credit | — | **added** |
| `MARKETING_FUND_EXPENSE` | Marketing / ad-fund contributions paid by the franchise | Franchise charges (F) | Slice F/G | EXPENSE | Debit | — | **added** |

Required at setup: 20 roles. Total: 60.

## Mapping per pack

Empty = intentionally unmapped in that pack (the role does not apply in that country).

| Role | Base (IFRS) | PK | NO (NS 4102) | SE (BAS) |
|---|---|---|---|---|
| `AR_CONTROL` | 1500 | 1500 | 1500 | 1510 |
| `AP_CONTROL` | 2400 | 2400 | 2400 | 2440 |
| `CUSTOMER_ADVANCES` | 2900 | 2900 | 2900 | 2420 |
| `SUPPLIER_ADVANCES` | 1480 | 1480 | 1480 | 1480 |
| `ALLOWANCE_DOUBTFUL_DEBTS` | 1580 | 1580 | 1580 | 1519 |
| `BAD_DEBT_EXPENSE` | 7830 | 7830 | 7830 | 6351 |
| `DISCOUNT_GIVEN` | 3080 | 3080 | 3080 | 3730 |
| `SALES_RETURNS` | 3090 | 3090 | 3090 | 3790 |
| `DISCOUNT_RECEIVED` | 4380 | 4380 | 4380 | 4730 |
| `BANK_DEFAULT` | 1920 | 1920 | 1920 | 1930 |
| `CASH_DEFAULT` | 1900 | 1900 | 1900 | 1910 |
| `POS_CASH_CLEARING` | 1960 | 1960 | 1960 | 1919 |
| `CARD_CLEARING` | 1950 | 1950 | 1940 | 1580 |
| `BANK_CHARGES` | 7770 | 7770 | 7770 | 6570 |
| `INTEREST_INCOME` | 8050 | 8050 | 8050 | 8310 |
| `INTEREST_EXPENSE` | 8150 | 8150 | 8150 | 8410 |
| `CASH_OVER_SHORT` | 7796 | 7796 | 7796 | 7991 |
| `SALES_TAX_OUTPUT` | 2700 | 2700 | 2700 | 2611 |
| `SALES_TAX_INPUT` | 1600 | 1600 | 2710 | 2641 |
| `SALES_TAX_SETTLEMENT` | 2740 | 2740 | 2740 | 2650 |
| `SALES_TAX_OUTPUT_RC` | 2705 | 2705 | 2703 | 2614 |
| `SALES_TAX_INPUT_RC` | 1605 | 1605 | 2714 | 2645 |
| `WHT_PAYABLE` | 2750 | 2750 |  |  |
| `WHT_RECEIVABLE` | 1620 | 1620 |  |  |
| `INCOME_TAX_PAYABLE` | 2500 | 2500 | 2500 | 2512 |
| `INCOME_TAX_EXPENSE` | 8300 | 8300 | 8300 | 8910 |
| `SALES_REVENUE_DEFAULT` | 3000 | 3000 | 3000 | 3001 |
| `SERVICE_REVENUE_DEFAULT` | 3050 | 3050 | 3040 | 3041 |
| `PURCHASES_DEFAULT` | 4300 | 4300 | 4300 | 4010 |
| `INVENTORY` | 1460 | 1460 | 1460 | 1460 |
| `COGS` | 4390 | 4390 | 4390 | 4960 |
| `GRNI` | 2450 | 2450 | 2965 | 2449 |
| `INVENTORY_ADJUSTMENT` | 4395 | 4395 | 4395 | 4969 |
| `PAYROLL_EXPENSE` | 5000 | 5000 | 5000 | 7210 |
| `PAYROLL_PAYABLE` | 2930 | 2930 | 2930 | 2821 |
| `PAYROLL_TAX_PAYABLE` | 2600 | 2600 | 2600 | 2710 |
| `EMPLOYER_CONTRIB_PAYABLE` | 2770 | 2770 | 2770 | 2730 |
| `EMPLOYER_CONTRIB_EXPENSE` | 5400 | 5400 | 5400 | 7510 |
| `PENSION_PAYABLE` | 2910 | 2910 | 2945 | 2740 |
| `PENSION_EXPENSE` | 5420 | 5420 | 5420 | 7410 |
| `HOLIDAY_PAY_ACCRUED` | 2940 | 2940 | 2940 | 2920 |
| `HOLIDAY_PAY_EXPENSE` | 5020 | 5020 | 5020 | 7290 |
| `PAYROLL_OTHER_DEDUCTIONS` | 2610 | 2610 | 2690 | 2790 |
| `RETAINED_EARNINGS` | 2050 | 2050 | 2050 | 2098 |
| `CURRENT_YEAR_RESULT` | 2090 | 2090 | 2099 | 2099 |
| `OPENING_BALANCE_EQUITY` | 2098 | 2098 | 2098 | 2009 |
| `SUSPENSE` | 2999 | 2999 | 2999 | 2999 |
| `ROUNDING` | 7795 | 7795 | 7795 | 3740 |
| `FX_REALIZED_GAIN` | 8060 | 8060 | 8060 | 3960 |
| `FX_REALIZED_LOSS` | 8160 | 8160 | 8160 | 7960 |
| `FX_UNREALIZED_GAIN` | 8061 | 8061 | 8061 | 3961 |
| `FX_UNREALIZED_LOSS` | 8161 | 8161 | 8161 | 7961 |
| `INTERCOMPANY_RECEIVABLE` | 1550 | 1550 | 1560 | 1660 |
| `INTERCOMPANY_PAYABLE` | 2460 | 2460 | 2920 | 2860 |
| `ROYALTY_INCOME` | 3710 | 3710 | 3710 | 3922 |
| `ROYALTY_EXPENSE` | 7600 | 7600 | 7600 | 6591 |
| `FRANCHISE_FEE_INCOME` | 3720 | 3720 | 3720 | 3925 |
| `FRANCHISE_FEE_EXPENSE` | 7610 | 7610 | 7610 | 6592 |
| `MARKETING_FUND_INCOME` | 3730 | 3730 | 3730 | 3926 |
| `MARKETING_FUND_EXPENSE` | 7330 | 7330 | 7330 | 5991 |

## Notes per country

- **Pakistan.** No statutory chart exists; the PK pack keeps the base numbers and adds federal/provincial sales tax, further tax, withholding (s.149, s.153, s.155, s.236G/H, sales tax withholding), EOBI, provincial social security, provident fund, gratuity, WPPF and WWF. `WHT_PAYABLE` and `WHT_RECEIVABLE` are mapped; extra withholding accounts (2751–2754) are reached through tax-code account overrides.
- **Norway.** Input VAT (2710–2714) sits in class 2 with a debit balance next to output VAT, as in NS 4102 practice; the settlement account 2740 holds the net per return. `CURRENT_YEAR_RESULT` uses 2099 *Årets resultat* (NeoERP extension in group 20) as a presentation account; the P&L line 8800 *Årsresultat* is computed by the report. Year-end closes to 2050 *Annen egenkapital*. COGS posts to 4390 (inventory change) because perpetual inventory relieves stock at sale.
- **Sweden.** Same class-2 VAT treatment (2641, 2645, 2647). Year-end closes to 2098 *Vinst eller förlust från föregående år*; the AGM transfer to 2091 is a manual journal. `CURRENT_YEAR_RESULT` is 2099 *Årets resultat*. Rounding uses 3740 *Öres- och kronutjämning* (an income account), which the role allows.
- **Withholding** (`WHT_*`) is a Pakistan concept; NO and SE leave it unmapped on purpose.
