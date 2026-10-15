# Default chart of accounts — templates

**Status:** Draft for Jabran, 2026-10-05; updated 2026-10-06 for decisions P15–P17. Not approved. Nothing here is seeded or built.
**Implements:** D4 (templates), D5 (account roles), D11 (tax codes) from the Accounts plan. Companion to `../ACCOUNTS-ARCHITECTURE.md` §4.2–4.3 and §8.3.

> **Check against source before production** (P17). Account numbers, local names, tax rates, SAF-T codes, BAS rutor and FBR/provincial references were written from general knowledge, not from licensed copies of NS 4102 or BAS or from current tax law. There is no accountant review: the team checks each pack itself. Every account and every tax code carries a source reference to the official document (columns `source`, `evidence_version`, `check_state`; review M6) (Pakistan: FBR and PRA, SRB, KPRA, BRA; Norway: Skatteetaten MVA codes and the SAF-T standard tax codes; Sweden: Skatteverket and the public BAS structure). Automated tests check rates against a versioned rates table. Until an item is checked against its source its `check_state` is `UNCHECKED` and the rig shows **Not yet checked against source** from that field (the text is no longer repeated in `notes`). Packs are versioned and fixed without touching companies; the first customer in each country is a pilot before the country is called ready; the customer's own bookkeeper or auditor is responsible for their books and confirms this at go-live. Rows that need a specific check also say so in `notes` ("Verify …" or "NeoERP extension …").

## Files

| File | What | Rows | Headers | Posting accounts | Roles mapped |
|---|---|---|---|---|---|
| `base-ifrs.csv` | Universal IFRS-aligned base. Used for any country without a pack (today: DK). | 249 | 61 | 188 | 60 of 60 |
| `pk.csv` | Pakistan. Base numbering plus PK sales tax, withholding and payroll accounts. | 266 | 61 | 205 | 60 of 60 |
| `no-ns4102.csv` | Norway. NS 4102 class/group structure, Norwegian + English names. | 246 | 63 | 183 | 58 of 60 |
| `se-bas.csv` | Sweden. BAS class/group structure (aktiebolag), Swedish + English names. | 264 | 67 | 196 | 58 of 60 |
| `account-roles.md` | The fixed role catalogue and each pack's mapping. | 60 roles | | | 20 required |
| `tax-codes.csv` | Default tax codes: PK 17, NO 12, SE 15. | 44 | | | |

NO and SE leave only `WHT_PAYABLE` / `WHT_RECEIVABLE` unmapped (Pakistan-only withholding). Every pack is a **complete** chart, not a delta.

Checks run on every file (all pass): codes unique; a posting account's class fits its type (1 assets, 2 equity and liabilities, 3–8 income and expense); every parent exists and is a header; a child has its parent's type (class-level headers 1–8 may mix types); headers carry no role or control; every role exists in the catalogue, is mapped at most once, matches the role's allowed type and control kind; every **required** role is mapped exactly once in every pack; every tax-code role exists and every tax-code account exists in its country's pack and is a posting account; every account and tax code has a `source` and `evidence_version`, `check_state` is `UNCHECKED` or `CHECKED`, and no `notes` repeat the check state.

## Columns

| Column | Meaning |
|---|---|
| `jurisdiction` (tax-codes.csv only) | Tax authority whose return the code feeds: `PK-FED`, `PK-PB`, `PK-SD`, `PK-KP`, `PK-BA`, `PK-PROV` (province set on the company's copy), `NO`, `SE`. |
| `code` | Account number. 1 digit = class header, 2 digits = group header, 4 digits = account. Sorting codes as text gives the tree order. |
| `name_en`, `name_local` | English name and local name (Norwegian / Swedish). Empty `name_local` = English is the local name (base, PK). |
| `type` | ASSET, LIABILITY, EQUITY, INCOME, EXPENSE. Drives the trial balance side and the year-end close (INCOME/EXPENSE close to retained earnings). |
| `subtype` | Statement line and behaviour. See the list below. Reports group by subtype, not by number, so the same P&L/BS works for every pack. |
| `normal_balance` | DEBIT or CREDIT. Default from type; contra accounts reverse it (see "Normal balance exceptions"). |
| `is_header` | Headers group accounts and never receive lines. |
| `parent_code` | Parent header. Empty only for class headers. |
| `control` | `none`, `AR`, `AP`, `BANK`, `TAX`, `INVENTORY`, `PAYROLL`, `INTERCOMPANY` (the last one from ARCH §4.1). See "Control accounts". |
| `role` | Account role this account carries in the template (one at most). |
| `dimensions` | Allowed line dimensions: `branch`, `stock_location`, `cost_centre`, `project`. Empty = company-level only (equity, income tax, deferred tax, dividends). |
| `notes` | Franchise-fee flag, verification needs, currency rule overrides, extension markers. Never the check state (that is `check_state`). |
| `source` | Official reference the row is checked against. Base: "IFRS / IAS 1 presentation" (IAS 1.54 balance sheet, IAS 1.82/1.102 profit or loss by nature). PK: FBR (Sales Tax Act 1990, Income Tax Ordinance 2001), provincial authority or labour-law reference where a statute governs the account; otherwise SECP Companies Act 2017 Fourth/Fifth Schedule presentation. NO: "NS 4102 structure, class N, group NN" plus the SAF-T standard account it maps to (extensions map to their 2-digit group). SE: "BAS 2026 kontoplan, account NNNN (kontogrupp NN)", or "NeoERP extension in BAS 2026 kontogrupp NN" for numbers BAS does not define. Tax codes: authority and section, SAF-T standard tax code or momsdeklaration ruta. |
| `evidence_version` | Edition of that source: e.g. `IFRS Accounting Standards 2026 (IAS 1)`, `STA 1990 to 30.06.2026` (FBR consolidated Sales Tax Act), `SAF-T Financial 1.30`, `BAS 2026 v1.1`, or `draft` where no edition has been pinned yet. |
| `check_state` | `UNCHECKED` until NeoERP has compared the row with the named source edition, then `CHECKED`. No accountant gate; a change of source edition puts the row back to `UNCHECKED`. All rows are `UNCHECKED` today. |
| `active` (tax-codes.csv only) | `true` = the template is copied switched on. Default: on when a rate is set or the code is EXEMPT. `PK-WHT-ST` is `false` with its rate kept (review M9). |

**Subtypes.** Assets: INTANGIBLE, PPE, ACCUM_DEPRECIATION, FINANCIAL_ASSET, DEFERRED_TAX, INVENTORY, INVENTORY_PROVISION, TRADE_RECEIVABLE, OTHER_RECEIVABLE, ALLOWANCE, INTERCOMPANY, TAX_RECEIVABLE, PREPAYMENT, CASH, BANK, CLEARING. Liabilities: BORROWING, PROVISION, DEFERRED_TAX, TRADE_PAYABLE, ACCRUAL, CONTRACT_LIABILITY, INTERCOMPANY, TAX_PAYABLE, TAX_RECEIVABLE (NO/SE input VAT in class 2), PAYROLL_LIABILITY, OTHER_PAYABLE, SUSPENSE. Equity: SHARE_CAPITAL, SHARE_PREMIUM, RESERVE, RETAINED_EARNINGS, CURRENT_YEAR_RESULT, OPENING_BALANCE, OWNER_DRAWINGS, UNTAXED_RESERVE (SE). Income: REVENUE, REVENUE_DEDUCTION, FRANCHISE_INCOME, OTHER_OPERATING_INCOME, FINANCE_INCOME, FX_GAIN, ROUNDING (SE 3740). Expense: COST_OF_SALES, PURCHASE_DEDUCTION, EMPLOYEE_BENEFITS, DEPRECIATION, IMPAIRMENT, OPERATING_EXPENSE, FRANCHISE_EXPENSE, ROUNDING, FINANCE_COST, FX_LOSS, INCOME_TAX, APPROPRIATION (SE).

**Normal balance exceptions** (deliberate): accumulated depreciation, allowances and inventory provisions (credit); revenue deductions, owner's drawings and NO 2080 *Udekket tap* (debit); purchase discounts and NO 5800 sick-pay refunds (credit); NO 2710–2714 and SE 2518, 2641, 2645, 2647 — debit balances held in class 2, as local practice books input VAT and preliminary tax next to the liability they offset.

## Control accounts

| Control | Who may post | Manual journal |
|---|---|---|
| `AR`, `AP` | Receivables / Payables only, with a party on the line. Balance always equals the sub-ledger. | Refused. |
| `INVENTORY` | Inventory and Purchasing only. Balance equals the stock valuation. | Refused. |
| `PAYROLL` | Payroll and Bank & cash (paying out the liability). | Refused, except Finance Manager with reason for corrections (audited). |
| `TAX` | AR/AP/POS via tax codes, and the tax settlement journal. | Allowed for settlement and corrections, with reason. |
| `BANK` | Bank & cash, AR receipts, AP payments, POS. | Allowed (needed before slice D exists); lines are flagged for reconciliation. |
| `INTERCOMPANY` | Franchise charges (F) and Group (G). | Refused, except Finance Manager with reason. |
| `none` | Anyone with `ACCOUNTS.JOURNAL.CREATE`. | Allowed. |

**Currency rule** (D6). Default `BASE_ONLY`. `AR`, `AP` and `INTERCOMPANY` controls and BANK accounts default to `ANY`; a foreign-currency bank account is `FIXED:<ccy>`, set when the account is added. In v1 a DB check still keeps every line in base currency unless `MULTI_CURRENCY` is entitled (ARCH C8).

## How templates are versioned

- Each file is one **template**: `code` + `version`, e.g. `BASE@2026.1`, `PK@2026.1`, `NO@2026.1`, `SE@2026.1`. Kind BASE or COUNTRY; INDUSTRY add-ons (retail, textile/manufacturing, services) later.
- The CSVs live in the repo and are reviewed like code. A seed migration loads them into platform-reference tables (`coa_template`, `coa_template_account`, `template_role_mapping`, `tax_code_template`) with a checksum. Never edited in a running database.
- States: DRAFT → PUBLISHED → RETIRED. A published version is immutable. A fix is a new version (`2026.2`) with a change log line per account.
- PK is authored as an overlay of BASE (same numbers, renames and additions). NO and SE are standalone COUNTRY charts: their numbering differs from BASE in too many places to express as renames (see Challenge 1). The loader treats both shapes the same once merged.

## How a template becomes a company's chart

Automatically, by accounts-service (slice A0, P16), when module `FINANCE` is enabled for the company and the Org facts are complete. Nobody runs a wizard; the Owner or Finance Manager reviews the result on one screen ("Review and go live") before anything can post.

1. **Read Org facts.** `country`, `currency`, `fiscalYearStartMonth` (V15 region profile), branches, stock locations, `company_type` and parent (ADR-013). Missing currency or FY start: no books yet; Accounts home names the fact and sends the Owner to a Neovatus request (RULES §15). The books are created once Org has the fact.
2. **Pick the template.** PK → `pk.csv`, NO → `no-ns4102.csv`, SE → `se-bas.csv`, anything else → `base-ifrs.csv`. Optional industry add-ons later.
3. **Copy first, review after.** Nothing is previewed before copying. After the copy, "Review and go live" shows the chart, the role mapping and the tax codes; the Owner or Finance Manager switches optional accounts on or off, picks the go-live date and ticks the acknowledgement.
4. **Copy.** In one transaction: accounts (new ids, parents remapped inside the company), role mappings, tax codes, base currency stamp, fiscal year with periods 1–12 + 13. Each account keeps `template_ref = <template>@<version>:<code>`. Writes an audit event `accounts-setup CREATE` (actor `system`, trigger, template version). State "Ready to go live": no posting until go-live.
5. **Activate by relationship** (P15). Franchise and group accounts are copied **inactive** unless the relation exists: franchise income (royalty, franchise fee, marketing fund received) when the company has franchise companies under it; franchise cost when it is itself a franchise (`company_type = FRANCHISE`); intercompany/group balances in either case or when it has `consolidates_into_parent`. They switch automatically when Org changes. Branches never switch them: a branch has no books of its own, and a franchise is always its own company.
6. **Once per company.** Creation is idempotent: a repeated event or the retry job changes nothing. "Use a different chart" replaces the chart (reason required) until the first posting, never after.

**System accounts.** An account is *system* when it carries a role in the template, has a control other than `none`, or is a template header. A system account can be renamed (both names) but cannot be deleted, retyped, made a header, have its control changed, or be deactivated while a role points at it.

## How a company extends its chart

| Allowed | Rule |
|---|---|
| Add accounts | Number unique in the company, parent is a header, and the number starts with the parent's group prefix (e.g. a new bank account under 19 is 19xx). Type defaults from the parent. |
| Add headers | Under an existing class or group, same rule. |
| Rename | Any account, both names. Audited. |
| Deactivate | Non-system accounts with zero balance in open periods. Refuses new lines; history and reports keep it. |
| Delete | Only an account that has never received a line and carries no role. |
| Move a role | To another active posting account of an allowed type (and control). New mapping row with `effective_from`; old journals keep their account. |
| Change type / normal balance | Only before the account has any line. |
| Flag "counts toward franchise fees" | On any INCOME account (D-A6). Templates set it true on revenue and revenue-deduction accounts (see `notes`). |

**Template updates.** A new template version never changes a live company. Accounts later offers "template update available": a compare-and-apply list (new accounts, renamed defaults, new roles) that the Finance Manager accepts line by line, the same model as standard-roles P-7.

## How roles keep modules country-independent

A module never names an account. It names a role. Example — Payroll posting a run (same code in all three countries):

```json
{ "sourceModule": "PAYROLL", "sourceDocumentId": "run-2026-09", "idempotencyKey": "payroll-run-2026-09",
  "lines": [
    { "role": "PAYROLL_EXPENSE",          "side": "DR", "amount": "1250000.0000", "branchId": "…" },
    { "role": "EMPLOYER_CONTRIB_EXPENSE", "side": "DR", "amount": "60000.0000",   "branchId": "…" },
    { "role": "PAYROLL_TAX_PAYABLE",      "side": "CR", "amount": "95000.0000" },
    { "role": "EMPLOYER_CONTRIB_PAYABLE", "side": "CR", "amount": "60000.0000" },
    { "role": "PAYROLL_PAYABLE",          "side": "CR", "amount": "1155000.0000" } ] }
```

The engine resolves each role through the company's mapping at the entry date: PK 5000/5400/2600/2770/2930, NO 5000/5400/2600/2770/2930, SE 7210/7510/2710/2730/2821. The line stores both `role_code` and the resolved `account_id`. A missing mapping refuses the whole request; nothing falls back to suspense.

Tax works the same way: a tax code names its output/input role (and, where a country splits rates over several accounts, a specific account). AR posts `SALES_TAX_OUTPUT` via the code; it never knows that Norway uses 2701 for food.

## Challenges (decisions questioned, not changed)

| # | Decision | Challenge | Recommendation |
|---|---|---|---|
| CA1 | D4 "base + country packs"; ARCH §4.3 "packs overlay the base, mostly renames" | NO and SE numbering differs from the base in many places (SE equity is 2081/2091/2099, revenue 3001–3004, payroll 7xxx). An overlay would be mostly REMOVE + ADD and hard to review. | Store NO and SE as standalone COUNTRY templates on the shared 1–8 class skeleton. Keep overlay only for PK and future industry add-ons. |
| CA2 | D5 one account per role | Countries split one meaning over several accounts (NO output VAT 25/15/12 in 2700/2701/2702; PK withholding by section). One role cannot point at three accounts. | Tax codes may name a specific account in addition to the role (validated against the role's type). Roles stay one-to-one. |
| CA3 | D4 "type + normal balance" pairing | NO/SE keep input VAT and preliminary tax as debit balances in class 2. Forcing them to ASSET breaks local reports; forcing a CREDIT normal misleads users. | Allow a per-account normal-balance override; statements use subtype (`TAX_RECEIVABLE`) to net VAT. Listed under "Normal balance exceptions". |
| CA4 | D4 "IFRS-aligned" | Norwegian and Swedish SMEs report under local GAAP (regnskapsloven/NRS; K2/K3), not IFRS. SE untaxed reserves and appropriations have no IFRS line. | Base is IFRS-aligned; country packs follow local GAAP structure. Statement layouts are per framework, driven by subtype. |
| CA5 | D5 `OPENING_BALANCE_EQUITY` | Not an IFRS or local-GAAP concept; a non-zero balance after go-live hides migration errors. | Keep it, but the setup checklist and year-end close refuse while it is non-zero. Same for `SUSPENSE` at year-end. |
| CA6 | ARCH §4.2: one `INTERCOMPANY_*` pair for both franchise and group balances | A franchisee is not a group company (*konsern*/*koncernföretag*) in NO/SE statutory reporting. Mixing them in 1560/1660 and 2920/2860 misstates the related-party note. | Keep one role pair now (party distinguishes). Before slice F, decide from the official sources (Skatteetaten, Skatteverket, local GAAP) whether franchise balances need their own accounts (P12, P17); if yes, add them in a template version and move the role. |
| CA7 | D4 "real NS 4102 numbers and names" | ARCH C7 already notes NS 4102 is a paid Standard Norge publication and BAS texts belong to BAS-intressenternas Förening. | Numbers follow the public class/group structure; names are our own plain wording of common usage. Both are checked against the public structure and official sources (P17). Label packs "NS 4102 structure" / "BAS structure". |

## Open doubts for review

- **NeoERP extensions** (numbers not defined by the standard; marked in `notes`): NO 1089/1109/1209/1239/1249/1259/1289 (accumulated depreciation), 1490, 1575, 1925, 1930, 1940, 1960, 2098, 2945, 2965, 2099, 2999, 3040, 3090, 3710–3730, 4380, 4395, 7330, 7610, 7795, 7796, 8061, 8161. SE 1919, 2009, 2449, 3926, 3961, 4969, 5991, 6591, 6592, 7961, 7991 (SE 2999 is BAS's own OBS-konto and is no longer listed as an extension). Only SE 1919, 2009, 3926, 3961 and 5991 have been looked up in the BAS 2026 PDF and found not listed (`BAS_FREE` in `_generator/se.py`); their source says "number not listed in BAS 2026 kontoplan". Every other SE extension's source says "not yet checked against BAS 2026". All stay `UNCHECKED`.
- **SE till clearing and opening-balance equity** (review M8, 2026-10-06). Earlier drafts used 1960 and 2069 and called them undefined; both are BAS 2026 accounts: 1960 *Koncernkonto moderföretag* (group account with the parent company) and 2069 *Årets resultat* inside 2060–2069, the equity series for nonprofit associations, foundations and registered religious communities (not a partnership series). Replaced by numbers that BAS 2026 (kontoplan v1.1, [BAS_kontoplan_2026_v2.pdf](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf)) does not define:
  - **1919 Dagskassor under redovisning** (till takings awaiting deposit, role `POS_CASH_CLEARING`). BAS defines 1910 Kassa with 1911–1913 under it; 1914–1919 are free. Till takings are cash until banked, so they belong in the 191x cash series rather than among bank, certificate or group accounts (1920–1990).
  - **2009 Ingående balans – avräkning** (opening-balance equity, role `OPENING_BALANCE_EQUITY`). BAS 2026 has no account 2000–2009; 201x–204x are owners' equity for sole traders and partners, 2050 the expansion reserve, 206x nonprofit/foundation equity, 207x purpose-restricted funds, 208x restricted and 209x free equity (2090–2099 all used). 200x is the only equity range outside every BAS series. The account must be zero after the opening balances, so it never reaches an annual report.
  Both stay `UNCHECKED` until checked against the BAS PDF; a company whose own plan already uses either number picks another free one at setup.
- **SE franchise income** (re-review R1, 2026-10-06). Earlier drafts put franchise fees on 3921 and marketing-fund income on 3922 and called both undefined. BAS 2026 group 39 ([PDF page 16](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf#page=16)) defines 3920 *Provisionsintäkter, licensintäkter och royalties*, 3921 *Provisionsintäkter*, 3922 *Licensintäkter och royalties* and 3925 *Franchiseintäkter*. Now:
  - `FRANCHISE_FEE_INCOME` → **3925 Franchiseintäkter** (BAS account; source "BAS 2026 kontoplan, account 3925").
  - `ROYALTY_INCOME` → **3922 Licensintäkter och royalties** (BAS account; was on the group account 3920, which now carries no role).
  - `MARKETING_FUND_INCOME` → **3926** (NeoERP extension). Group 39 in the BAS 2026 PDF lists 3900, 3910–3914, 3920–3922, 3925, 3940, 3950, 3960, 3970–3973, 3980–3981, 3985, 3987–3999; 3926 is not listed. Checked 2026-10-06 by reading the PDF through a web fetch (a text extraction, not a manual page read); a direct download was blocked here. Treat it as **unverified** until someone reads page 16 by hand; the row stays `UNCHECKED`. 3921 is not used.
- **NO VAT sub-accounts** 2701/2702/2703/2711/2712/2714: numbering below 2700/2710 varies between accounting systems.
- **Rates.** PK further tax 4% and provincial service rates (PRA 16%, SRB/KPRA/BRA 15%) change in budgets; Eighth Schedule reduced rates and withholding rates are left blank on purpose. SE food VAT is temporarily 6% (announced for 2026-04-01 to 2027-12-31); confirm the dates.
- **Retained-earnings role in SE** maps to 2098 (Swedish practice), not 2091. The AGM transfer is manual.
- **Size.** Posting accounts are 183–205 per pack, inside the 120–220 target; headers add 61–67 rows (NO 63 after review fix R2).

## Review fixes 2026-10-06 (A0 design review M6–M9, N5)

- **M6 provenance.** `source`, `evidence_version`, `check_state` on all four account CSVs and on `tax-codes.csv` (which already had `source`). Exported to `accounts-data.jsx` as the last three chart-row fields (`src`, `ev`, `chk`) and as tax-row fields 16–18 (`ev`, `chk`, `active`) after `source`. The per-account note "Not yet checked against source" is gone; `gen.py` fails if it comes back.
- **M7 Norway import VAT.** `NO-MVA-IMPORT-25` now uses SAF-T standard tax code **81** only (self-assessed import of goods with deduction, standard rate): the calculated VAT (output 2703) and the deduction (input 2714) are two lines on the same code; Skatteetaten's model has no separate standard code for the deduction. New `NO-MVA-IMPORT-PAID-25` uses code **14** (deduction of VAT paid at import, standard rate): input only, account 2710, the return line carries the VAT amount from the customs document with no basis or rate. Food-rate equivalents (83 / 15) are not in the template. Source: [Skatteetaten mva-melding information model](https://skatteetaten.github.io/mva-meldingen/mvameldingen/informasjonsmodell/).
- **M8 Sweden.** 1960 → 1919, 2069 → 2009 (see Open doubts). Role validation passes with 0 errors; `account-roles.md` regenerated.
- **M9 Pakistan sales tax withholding.** `PK-WHT-ST` keeps 20% but is copied **inactive** (`active=false`). The note says it applies only to the Eleventh Schedule withholding-agent / supplier scenarios, that 20% is a fraction of the sales tax amount (not of the price), and that supplies by active taxpayers to registered persons are generally excluded, with listed exceptions. It is never switched on from agent registration alone.
- **R1 Sweden franchise income (re-review).** 3921/3922 → 3925 (franchise fees), 3922 (royalties) and 3926 (marketing fund); see Open doubts. `_generator/lib.py` gives the "not listed in BAS 2026" source only to numbers in `se.BAS_FREE`. Regenerated: 0 errors; `account-roles.md` and the rig's `accounts-data.jsx` updated.
- **N5 Further tax.** `PK-ST-FURTHER` (4%) and account 2702 now cover supplies to unregistered persons **and** to registered persons who are not active taxpayers (STA s.3(1A)), subject to the statutory exemptions.

## Regenerating

The CSVs and `account-roles.md` are generated from `_generator/` (Python 3, no dependencies): edit the pack file (`base.py`, `pk.py`, `no.py`, `se.py`, `tax.py`, `roles.py`), then run `python3 _generator/gen.py && python3 _generator/md.py && python3 _generator/rig_export.py` from this folder (the last one rewrites `NeoERP-App/docs/design/screen-rig/accounts-data.jsx`; app.html inlines a copy and must be refreshed separately). `gen.py` prints every validation error and exits with the counts above; zero errors is the bar. (`out.json` and `__pycache__` are build leftovers and can be ignored.)
