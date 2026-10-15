import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json, os
from roles import ROLES, LEVEL_TEXT
d=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"out.json")))
m=d["mapping"]
L=[]
L.append("""# Account roles — fixed catalogue

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
""")
L.append("| Role | Purpose | Posted by | Needed from | Allowed type | Normal | Control | In §4.2 |")
L.append("|---|---|---|---|---|---|---|---|")
for code,purpose,mod,lvl,types,nb,ctrl,arch in ROLES:
    L.append(f"| `{code}` | {purpose} | {mod} | {LEVEL_TEXT[lvl]} | {types.replace('|',' or ')} | {nb.title()} | {ctrl or '—'} | {'yes' if arch else '**added**'} |")
L.append("\nRequired at setup: " + str(sum(1 for r in ROLES if r[3]=='R')) + " roles. Total: " + str(len(ROLES)) + ".\n")
L.append("## Mapping per pack\n")
L.append("Empty = intentionally unmapped in that pack (the role does not apply in that country).\n")
L.append("| Role | Base (IFRS) | PK | NO (NS 4102) | SE (BAS) |")
L.append("|---|---|---|---|---|")
for code,*_ in ROLES:
    L.append(f"| `{code}` | {m['BASE'].get(code,'')} | {m['PK'].get(code,'')} | {m['NO'].get(code,'')} | {m['SE'].get(code,'')} |")
L.append("""
## Notes per country

- **Pakistan.** No statutory chart exists; the PK pack keeps the base numbers and adds federal/provincial sales tax, further tax, withholding (s.149, s.153, s.155, s.236G/H, sales tax withholding), EOBI, provincial social security, provident fund, gratuity, WPPF and WWF. `WHT_PAYABLE` and `WHT_RECEIVABLE` are mapped; extra withholding accounts (2751–2754) are reached through tax-code account overrides.
- **Norway.** Input VAT (2710–2714) sits in class 2 with a debit balance next to output VAT, as in NS 4102 practice; the settlement account 2740 holds the net per return. `CURRENT_YEAR_RESULT` uses 2099 *Årets resultat* (NeoERP extension in group 20) as a presentation account; the P&L line 8800 *Årsresultat* is computed by the report. Year-end closes to 2050 *Annen egenkapital*. COGS posts to 4390 (inventory change) because perpetual inventory relieves stock at sale.
- **Sweden.** Same class-2 VAT treatment (2641, 2645, 2647). Year-end closes to 2098 *Vinst eller förlust från föregående år*; the AGM transfer to 2091 is a manual journal. `CURRENT_YEAR_RESULT` is 2099 *Årets resultat*. Rounding uses 3740 *Öres- och kronutjämning* (an income account), which the role allows.
- **Withholding** (`WHT_*`) is a Pakistan concept; NO and SE leave it unmapped on purpose.
""")
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),"account-roles.md"),"w").write("\n".join(L))
print("ok")
