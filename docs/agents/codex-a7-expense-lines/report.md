# A7: Danish and Swedish expense-line classification

Research date: 2026-11-01. Research only; no application, chart, layout, database or tenant changes are implemented.

## Denmark

**Citation correction:** the artsopdelt income statement is bilag 2 **skema 3**, not skema 1 (the balance sheet). The uncondensed expense sequence is material/input costs, other external costs, personnel, fixed-asset charges, excess current-asset impairment, then other operating costs. The law defines lines and order, not NeoERP account numbers. [Årsregnskabsloven, LBK 402/2026, bilag 2 skema 3, printed pp. 58–59](https://www.retsinformation.dk/eli/lta/2026/402/pdf).

Line key:

- **D5a**: Omkostninger til råvarer og hjælpematerialer, within item 5 Eksterne omkostninger.
- **D5b**: Andre eksterne omkostninger, within item 5.
- **D6**: Personaleomkostninger (6a wages, 6b pensions, 6c other social-security costs).
- **D7**: Af- og nedskrivninger af materielle og immaterielle anlægsaktiver.
- **D8**: Nedskrivninger af omsætningsaktiver, som overstiger normale nedskrivninger.
- **D9**: Andre driftsomkostninger.
- **D15**: Øvrige finansielle omkostninger, identifying the related-party component where applicable.
- **D16**: Skat af årets resultat.

Recommendations infer nature from our purposes, corroborated by the current official standard chart: customer-delivery subcontracting/production inputs, normal trade losses, cafeteria versus benefits, allowances/training, rounding/cash differences and nonfinancial disposals have distinct analogues. Official chart numbers are not our account numbers. [Erhvervsstyrelsen publication](https://erhvervsstyrelsen.dk/standardkontoplan-saf-t); [official chart JSON valid 2026-01-01](https://git.erst.dk/standard-filformater/standard-filformater/-/blob/master/Standardkontoplanen/JSON/2026-01-01-Standardkontoplan.json?ref_type=heads). The JSON was readable through targeted search-index content; direct retrieval returned loading/error. Reproduce the check from the published download before building.

**Conventions:** every CSV row with `type=EXPENSE` is included, including nonposting headers. `H` means no posting/statutory allocation; children determine presentation. Slashes denote required splits or alternatives, never double counting. **UNSURE** requires purpose/transaction confirmation before automatic adoption. **Conditional** restricts permitted use; **Exception** flags departures from blanket group/subtype rules. Current subtype includes C2's 2026.4 overlay. Names below are our CSV names, not a claim that each is official. Recommendations concern stated purposes, not unseen postings.

Coverage: **107 expense rows: 76 posting accounts and 31 headers**.

| Account | Our account name | Effective subtype | Statutory line | Status / one-line reason |
|---|---|---|---|---|
| 4 | Cost of goods | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 40 | Materials | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4000 | Raw materials consumed | `COST_OF_SALES` | D5a | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4060 | Freight and duties on purchases | `COST_OF_SALES` | D5a | **Recommended.** Inbound freight and duties form goods acquisition costs; outbound delivery is different. |
| 43 | Goods for resale | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4300 | Purchases - goods and services | `COST_OF_SALES` | D5a | **Conditional.** Goods and customer-delivery inputs belong here; general service purchases require D5b. |
| 4380 | Purchase discounts received | `PURCHASE_DEDUCTION` | D5a | **Contra.** Purchase discounts reduce input costs; retain their credit sign. |
| 4390 | Cost of goods sold | `COST_OF_SALES` | D5a | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4395 | Inventory adjustments and shrinkage | `COST_OF_SALES` | D5a / D8 | **Conditional.** Normal stock adjustments follow goods costs; beyond-normal write-downs require D8. |
| 4396 | Purchase price variances | `COST_OF_SALES` | D5a | **Recommended.** Purchase-price variances adjust goods/input costs. |
| 45 | Subcontracting | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4500 | Subcontracting | `COST_OF_SALES` | D5a | **Exception.** Customer-delivery subcontracting follows the official input analogue; administrative outsourcing is D5b. |
| 47 | Production costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4700 | Production overheads | `COST_OF_SALES` | D5a / D5b / D6 / D7 | **UNSURE.** Production overhead is a function, not one nature; split inputs, services, payroll and depreciation. |
| 4710 | Power and fuel - production | `COST_OF_SALES` | D5a / D5b | **UNSURE.** Direct production energy may follow production inputs; general energy overhead is other external cost. |
| 5 | Payroll costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 50 | Salaries and wages | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5000 | Salaries and wages | `EMPLOYEE_BENEFITS` | D6 | **Recommended.** Employee remuneration and employment-related charges belong in personnel costs. |
| 5010 | Overtime and bonuses | `EMPLOYEE_BENEFITS` | D6 | **Recommended.** Employee remuneration and employment-related charges belong in personnel costs. |
| 5020 | Holiday pay | `EMPLOYEE_BENEFITS` | D6 | **Recommended.** Employee remuneration and employment-related charges belong in personnel costs. |
| 5030 | Directors' remuneration | `EMPLOYEE_BENEFITS` | D6 | **Conditional.** Management/board remuneration is personnel; independent consultancy invoices are D5b. |
| 54 | Employer contributions and pensions | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5400 | Employer social security | `EMPLOYEE_BENEFITS` | D6 | **Recommended.** Employer social-security contributions are personnel costs. |
| 5405 | ATP, employer | `EMPLOYEE_BENEFITS` | D6 | **Recommended.** Employer ATP contributions are personnel costs. |
| 5420 | Pension costs | `EMPLOYEE_BENEFITS` | D6 | **Recommended.** Employer pension expenditure is personnel cost. |
| 5430 | End-of-service benefits | `EMPLOYEE_BENEFITS` | D6 | **Recommended.** Termination benefits arise from employment. |
| 59 | Other personnel costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5900 | Staff welfare | `EMPLOYEE_BENEFITS` | D6 / D5b | **UNSURE.** Welfare mixes employee benefits and cafeteria/amenity services; official analogues occupy different lines. |
| 5910 | Training | `EMPLOYEE_BENEFITS` | D6 | **Exception.** Employee training follows the current official personnel-course account, even when a supplier invoices it. |
| 5920 | Recruitment | `EMPLOYEE_BENEFITS` | D5b / D6 | **UNSURE.** External recruitment services suggest D5b; internal payroll is D6; no specific official analogue was verified. |
| 6 | Depreciation and operating costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 60 | Depreciation and impairment | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6000 | Depreciation - buildings | `DEPRECIATION` | D7 | **Recommended.** Depreciation concerns tangible fixed assets rather than operating services. |
| 6010 | Depreciation - plant, vehicles and furniture | `DEPRECIATION` | D7 | **Recommended.** Depreciation concerns tangible fixed assets rather than operating services. |
| 6015 | Depreciation - IT equipment | `DEPRECIATION` | D7 | **Recommended.** Depreciation concerns tangible fixed assets rather than operating services. |
| 6020 | Amortisation - intangible assets | `DEPRECIATION` | D7 | **Recommended.** Amortisation concerns intangible fixed assets. |
| 6030 | Depreciation - right-of-use assets | `DEPRECIATION` | D7 | **Conditional.** Recognised right-of-use asset depreciation follows fixed assets; operating rent is D5b. |
| 6050 | Impairment losses | `IMPAIRMENT` | D7 / D8 / financial line | **UNSURE.** Generic impairment does not identify the asset; D7 only covers tangible/intangible fixed assets. |
| 61 | Freight out | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6100 | Freight and delivery out | `OPERATING_EXPENSE` | D5b | **Recommended.** Outbound freight is an external distribution service, unlike inbound purchase freight. |
| 63 | Premises | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6300 | Rent | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6340 | Utilities | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6360 | Cleaning and security | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 64 | Equipment rental and subscriptions | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6400 | Equipment and vehicle rental | `OPERATING_EXPENSE` | D5b | **Conditional.** Operating hire is external; recognised asset depreciation and lease interest remain D7/D15. |
| 6420 | Software and cloud subscriptions | `OPERATING_EXPENSE` | D5b | **Recommended.** Subscriptions buy ongoing services rather than amortising a capitalised asset. |
| 65 | Small equipment and consumables | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6540 | Small equipment not capitalised | `OPERATING_EXPENSE` | D5b | **Recommended.** Expensed small equipment is an external purchase, not capital-asset depreciation. |
| 6550 | Consumables | `OPERATING_EXPENSE` | D5b | **Recommended.** General operating supplies are external costs; production raw materials use D5a. |
| 66 | Repairs and maintenance | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6600 | Repairs - buildings | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6620 | Repairs - equipment | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 67 | Professional fees | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6700 | Audit fees | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6705 | Accounting fees | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6720 | Legal and professional fees | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6790 | Other external services | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 68 | Office costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6800 | Office supplies | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6860 | Meetings and courses | `OPERATING_EXPENSE` | D5b / D6 | **UNSURE.** Meeting services and employee courses mix external and personnel purposes; split them. |
| 69 | Communication | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6900 | Telephone and internet | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6940 | Postage and courier | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 7 | Other operating costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 70 | Vehicle costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7000 | Fuel | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 7020 | Vehicle maintenance | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 7040 | Vehicle insurance and tax | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 71 | Travel | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7100 | Travel and accommodation | `OPERATING_EXPENSE` | D5b | **Conditional.** Purchased travel/accommodation are external services; employee cash allowances require D6. |
| 7150 | Meals and per diem | `OPERATING_EXPENSE` | D5b / D6 | **UNSURE.** Purchased meals are external, but employee per-diem allowances are personnel; the account combines both. |
| 73 | Sales and marketing | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7300 | Sales commissions | `OPERATING_EXPENSE` | D5b | **Conditional.** Third-party commissions buy selling services; employee sales bonuses are D6. |
| 7320 | Advertising | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 7330 | Marketing fund contributions paid | `FRANCHISE_EXPENSE` | D5b | **Exception.** Franchise marketing contributions buy marketing; FRANCHISE_EXPENSE must not force D9. |
| 7350 | Entertainment | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 74 | Memberships and donations | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7400 | Memberships and subscriptions | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 7420 | Donations | `OPERATING_EXPENSE` | D5b | **Conditional.** Business donations default to external miscellaneous costs; owner distributions are not expenses. |
| 75 | Insurance and warranty | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7500 | Insurance | `OPERATING_EXPENSE` | D5b | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 7550 | Warranty costs | `OPERATING_EXPENSE` | D5b / D5a / D6 | **UNSURE.** Warranty supplier charges suggest external costs; own replacement goods and labour retain their nature. |
| 76 | Royalties, franchise fees and licences | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7600 | Royalty expense | `FRANCHISE_EXPENSE` | D5b | **Exception.** Expensed royalties buy rights/services; FRANCHISE_EXPENSE does not make them D9. |
| 7610 | Franchise fee expense | `FRANCHISE_EXPENSE` | D5b | **Exception.** Expensed franchise fees buy ongoing external business services. |
| 7620 | Licences and permits | `OPERATING_EXPENSE` | D5b | **Conditional.** Expensed permits/licences are external; capitalised rights are amortised separately. |
| 77 | Other costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7720 | Restaurant services (25% deductible VAT) | `OPERATING_EXPENSE` | D5b | **Recommended.** Restaurant invoices buy external services; VAT deductibility does not determine the line. |
| 7770 | Bank charges | `OPERATING_EXPENSE` | D5b | **Exception.** Bank service charges are external administration costs; borrowing interest is D15. |
| 7790 | Miscellaneous expenses | `OPERATING_EXPENSE` | D5b / actual nature | **UNSURE.** A miscellaneous name cannot exclude payroll, disposals or finance; inspect material contents. |
| 7795 | Rounding differences | `ROUNDING` | D5b | **Exception.** Ordinary operating rounding follows the official external-cost analogue; retain its sign. |
| 7796 | Cash over and short | `OPERATING_EXPENSE` | D5b | **Exception.** Ordinary cash differences follow the official external-cost analogue rather than generic D9. |
| 7797 | Small payment differences | `ROUNDING` | D5b | **Exception.** Small operating settlement differences follow external costs; financing differences need D15. |
| 78 | Losses | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7800 | Loss on disposal of non-current assets | `OPERATING_EXPENSE` | D9 / relevant financial line | **UNSURE; Exception.** Nonfinancial fixed-asset disposals are D9; the broad name also permits financial disposals requiring separate classification. |
| 7830 | Bad debts and expected credit losses | `OPERATING_EXPENSE` | D5b / D8 | **Exception; Conditional.** Normal trade bad debts/expected allowances are external; only beyond-normal impairment belongs in D8. |
| 8 | Financial items and income tax | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 81 | Finance costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 8150 | Interest expense | `FINANCE_COST` | D15 | **Recommended.** Genuine interest/financing charges belong with financial expenses. |
| 8155 | Interest on lease liabilities | `FINANCE_COST` | D15 | **Recommended.** Lease-liability interest is financial, separate from operating rent and asset depreciation. |
| 8160 | Exchange losses - realised | `FX_LOSS` | D15 | **Exception.** Realised exchange loss follows the Danish financial-loss analogue; do not copy Sweden's C2 rule. |
| 8161 | Exchange losses - unrealised | `FX_LOSS` | D15 | **Exception.** Unrealised exchange loss follows the Danish financial-loss classification. |
| 8170 | Other finance costs | `FINANCE_COST` | D15 | **Recommended.** Genuine interest/financing charges belong with financial expenses. |
| 83 | Income tax | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 8300 | Current income tax | `INCOME_TAX` | D16 | **Recommended.** Company profit-tax expense/credit belongs with tax on the year's result. |
| 8320 | Deferred tax | `INCOME_TAX` | D16 | **Recommended.** Deferred profit-tax expense/credit belongs with tax on the year's result. |

## Sweden

The uncondensed sequence separates goods/materials, external costs, personnel, fixed-asset charges, excess current-asset impairment and other operating costs. References below are to [ÅRL bilaga 2, official consolidated law](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/arsredovisningslag-19951554_sfs-1995-1554/).

- **S5**: Råvaror och förnödenheter, adapting/subdividing for Handelsvaror where appropriate.
- **S6**: Övriga externa kostnader.
- **S7**: Personalkostnader.
- **S8**: Avskrivningar och nedskrivningar av materiella och immateriella anläggningstillgångar.
- **S9**: Nedskrivningar av omsättningstillgångar utöver normala nedskrivningar.
- **S10**: Övriga rörelsekostnader.
- **S17**: Räntekostnader och liknande kostnader, identifying related-party amounts where applicable.
- **S18**: Bokslutsdispositioner.
- **S19**: Skatt på årets resultat.

BAS follows the by-nature statement: class 4 covers goods/materials and certain purchased services; classes 5–6 cover other external costs. The 2026 table places ordinary customer losses in group 63, personnel in 70–76, fixed-asset charges in 77–78 and operating FX/disposal losses in 79. These guide the account-level inferences. [BAS structure guidance](https://www.bas.se/kontoplaner/kontoplanens-uppbyggnad-och-anvandning/); [BAS 2026 v1.1, especially printed pp. 25–33](https://www.bas.se/wp-content/uploads/2026/04/BAS_kontoplan_2026_v2.pdf).

Raw-material/resale stock movements adjust consumed inputs rather than the statutory change in own-produced goods/WIP; a separate Handelsvaror caption can clarify resale goods without switching to functional cost of sales. [SCB official explanatory mapping, p. 1](https://www.scb.se/contentassets/4697fd6fb40147818a7d352dd100de5d/kostnadsslagsindelad-resultatrakning.pdf). This is corroborating statistical guidance, not a substitute for ÅRL or BAS 2026.

Coverage: **115 expense rows: 79 posting accounts and 36 headers**.

| Account | Our account name | Effective subtype | Statutory line | Status / one-line reason |
|---|---|---|---|---|
| 4 | Cost of goods and materials | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 40 | Purchases of goods and materials | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4010 | Purchases of materials and goods | `COST_OF_SALES` | S5 | **Recommended.** Goods/material consumption belongs with inputs; resale goods may use a separate Handelsvaror caption. |
| 4075 | Purchases of goods from other EU country, 25% | `COST_OF_SALES` | S5 | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4076 | Inköp av handelsvaror EU, 12 % | `COST_OF_SALES` | S5 | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4077 | Inköp av handelsvaror EU, 6 % | `COST_OF_SALES` | S5 | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4085 | Imports of goods, 25% | `COST_OF_SALES` | S5 | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4086 | Inköp av handelsvaror import, 12 % | `COST_OF_SALES` | S5 | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4087 | Inköp av handelsvaror import, 6 % | `COST_OF_SALES` | S5 | **Recommended.** Goods/materials or direct purchased-input cost; VAT/import origin does not change its nature. |
| 4091 | Cash discounts received | `PURCHASE_DEDUCTION` | S5 | **Contra.** Merchandise discounts reduce purchase costs; retain their credit sign. |
| 45 | Other VAT-liable purchases | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4531 | Imported services from outside the EU, 25% | `COST_OF_SALES` | S5 / S6 | **UNSURE.** Imported services are inputs only for production/customer delivery; administration services are S6. |
| 4535 | Purchases of services from other EU country, 25% | `COST_OF_SALES` | S5 / S6 | **UNSURE.** EU origin does not reveal service nature; separate production inputs from general external services. |
| 46 | Subcontracting | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4610 | Subcontracting | `COST_OF_SALES` | S5 | **Conditional.** Production subcontracting follows BAS class 4; administrative outsourcing is S6. |
| 47 | Purchase price reductions | `HEADER` | H | **Header.** Nonposting purchase-reduction header; no posting child exists in this supplied chart. |
| 49 | Change in inventories | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 4910 | Change in raw materials | `COST_OF_SALES` | S5 | **Recommended.** Raw-material stock movements adjust consumption, not the change in own-produced finished goods/WIP. |
| 4960 | Change in goods for resale | `COST_OF_SALES` | S5 | **Recommended.** Resale-stock movements adjust goods sold, not the statutory own-produced inventory change. |
| 4968 | Purchase price variances | `COST_OF_SALES` | S5 | **Recommended.** Purchase-price variances adjust merchandise/input costs. |
| 4969 | Stock count differences and shrinkage | `COST_OF_SALES` | S5 / S9 | **Conditional.** Normal stock differences/shrinkage adjust goods costs; beyond-normal write-downs require S9. |
| 5 | Other external costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 50 | Premises costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5010 | Rent of premises | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 5020 | Electricity for lighting | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 5060 | Cleaning and waste | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 5090 | Other premises costs | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 52 | Rent of fixed assets | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5220 | Rent of equipment and tools | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 5250 | Rent of computers | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 54 | Consumable equipment and supplies | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5410 | Consumable equipment | `OPERATING_EXPENSE` | S6 | **Recommended.** Expensed equipment is an external purchase, not capital-asset depreciation. |
| 5460 | Consumable supplies | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 55 | Repairs and maintenance | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5500 | Repairs and maintenance | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 56 | Vehicle costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5611 | Fuel for cars | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 5615 | Car leasing | `OPERATING_EXPENSE` | S6 | **Conditional.** Operating lease charges are external; recognised depreciation/lease interest need their own lines. |
| 57 | Freight and transport | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5710 | Freight and transport on distribution | `OPERATING_EXPENSE` | S6 | **Recommended.** Outbound distribution freight is an external service. |
| 58 | Travel | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5800 | Travel costs | `OPERATING_EXPENSE` | S6 | **Conditional.** Purchased travel is external; employee remuneration/allowances use appropriate personnel accounts. |
| 59 | Advertising and PR | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 5910 | Advertising | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 5991 | Marketing fund contributions paid | `FRANCHISE_EXPENSE` | S6 | **Exception.** Franchise marketing contributions remain external marketing despite FRANCHISE_EXPENSE. |
| 6 | Other external costs (cont.) | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 60 | Other selling costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6070 | Entertainment | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 61 | Office supplies and printing | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6110 | Office supplies | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 62 | Telephone and postage | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6211 | Fixed telephony | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6212 | Mobile telephony | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6230 | Data communication | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6250 | Postage | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 63 | Insurance and risk costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6310 | Business insurance | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6351 | Confirmed bad debts | `OPERATING_EXPENSE` | S6 | **Exception.** Normal confirmed customer losses follow BAS group 63 external risk costs, not S10. |
| 6352 | Expected bad debts | `OPERATING_EXPENSE` | S6 / S9 | **Exception; Conditional.** Normal expected customer losses follow BAS group 63; isolate any beyond-normal component in S9. |
| 64 | Administration costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6420 | Audit fees | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 65 | Other external services | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6530 | Accounting services | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6540 | IT services | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6550 | Consultancy fees | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6570 | Bank charges | `OPERATING_EXPENSE` | S6 | **Exception.** Bank service charges belong in external services; borrowing interest belongs in S17. |
| 6590 | Other external services | `OPERATING_EXPENSE` | S6 | **Recommended.** The named operating service/supply is an external cost, rather than residual operating loss. |
| 6591 | Royalty expense | `FRANCHISE_EXPENSE` | S6 | **Exception.** Expensed royalties buy external rights/services; local extension numbering does not alter nature. |
| 6592 | Franchise fee expense | `FRANCHISE_EXPENSE` | S6 | **Exception.** Franchise fees buy external services; FRANCHISE_EXPENSE must not force S10. |
| 69 | Other external costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 6981 | Membership fees, deductible | `OPERATING_EXPENSE` | S6 | **Recommended.** Business membership fees are external costs; deductibility does not choose the line. |
| 6991 | Other external costs, deductible | `OPERATING_EXPENSE` | S6 | **Recommended.** Genuine miscellaneous external expenses remain external costs. |
| 6992 | Other external costs, not deductible | `OPERATING_EXPENSE` | S6 | **Exception.** Nondeductibility does not turn an external expense into company profit tax. |
| 7 | Personnel costs and depreciation | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 70 | Wages to workers | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7010 | Wages to workers | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Employee remuneration and employment-related charges belong in personnel costs. |
| 72 | Salaries to salaried staff and management | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7210 | Salaries to salaried staff | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Employee remuneration and employment-related charges belong in personnel costs. |
| 7220 | Salaries to management | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Employee remuneration and employment-related charges belong in personnel costs. |
| 7290 | Change in holiday pay liability | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Holiday-pay accrual movements adjust personnel cost. |
| 74 | Pension costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7410 | Pension insurance premiums | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Employer pension insurance is personnel cost. |
| 75 | Statutory and contractual social costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7510 | Statutory social contributions | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Employer social contributions are personnel costs. |
| 7519 | Employer contributions accrued on holiday pay | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Social charges on accrued pay/holiday liabilities remain personnel costs. |
| 7530 | Special payroll tax | `EMPLOYEE_BENEFITS` | S7 | **Exception.** Payroll tax is a personnel charge, not company profit tax. |
| 7570 | Labour market insurance premiums | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Employment-related insurance premiums are personnel costs. |
| 76 | Other personnel costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7610 | Training | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Employee training follows BAS personnel group 76. |
| 7690 | Other personnel costs | `EMPLOYEE_BENEFITS` | S7 | **Recommended.** Other genuine employee expenditure follows BAS personnel group 76. |
| 77 | Impairment | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7730 | Impairment of machinery and equipment | `IMPAIRMENT` | S8 | **Recommended.** Machinery/equipment impairment concerns tangible fixed assets. |
| 7732 | Nedskrivningar av inventarier | `IMPAIRMENT` | S8 | **Recommended.** Equipment impairment concerns tangible fixed assets; BAS 2026 explicitly includes this subaccount. |
| 78 | Depreciation according to plan | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7810 | Amortisation of intangible assets | `DEPRECIATION` | S8 | **Recommended.** Intangible amortisation belongs with fixed-asset charges. |
| 7820 | Depreciation of buildings | `DEPRECIATION` | S8 | **Recommended.** Depreciation concerns tangible fixed assets rather than operating services. |
| 7830 | Depreciation of machinery and equipment | `DEPRECIATION` | S8 | **Recommended.** Depreciation concerns tangible fixed assets rather than operating services. |
| 7832 | Depreciation of vehicles | `DEPRECIATION` | S8 | **Exception: name mismatch.** Our name says vehicles; BAS 7832 means equipment/tools/installations, but both meanings still belong in S8. |
| 79 | Other operating costs | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 7960 | Exchange losses on operating items | `OPERATING_EXPENSE` | S10 | **Exception: C2 already fixed.** Operating receivable/payable FX loss stays other operating cost; retain the 2026.4 OPERATING_EXPENSE subtype. |
| 7961 | Unrealised exchange losses on operating items | `OPERATING_EXPENSE` | S10 | **Exception: C2 already fixed.** The local unrealised operating-FX extension follows the same purpose; retain its C2 subtype. |
| 7970 | Loss on disposal of fixed assets | `OPERATING_EXPENSE` | S10 | **Exception.** Nonfinancial fixed-asset disposal loss is other operating cost, not depreciation or external service. |
| 7990 | Other operating costs | `OPERATING_EXPENSE` | S10 | **Conditional.** Genuine residual operating losses belong here; routine supplier services are S6. |
| 7991 | Cash differences | `OPERATING_EXPENSE` | S10 | **Exception: local extension.** Our chart places cash losses in group 79; confirm genuine cash differences rather than invoice rounding. |
| 8 | Financial items, appropriations and tax | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 84 | Interest expense | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 8410 | Interest on long-term liabilities | `FINANCE_COST` | S17 | **Recommended.** Genuine interest/financing charges belong with financial expenses. |
| 8420 | Interest on short-term liabilities | `FINANCE_COST` | S17 | **Recommended.** Genuine interest/financing charges belong with financial expenses. |
| 8423 | Interest on taxes and charges | `FINANCE_COST` | S17 | **Exception.** Interest on taxes/charges is financial expense, not profit tax. |
| 8430 | Exchange differences on liabilities | `FINANCE_COST` | S17 | **Conditional.** Financial-liability FX stays financial; operating-trade FX belongs in 7960/7961 and S10. |
| 88 | Appropriations | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 8810 | Change in tax allocation reserve | `APPROPRIATION` | S18 | **Recommended.** Tax-allocation-reserve movements are appropriations, not operating costs. |
| 8850 | Change in excess depreciation | `APPROPRIATION` | S18 | **Exception.** Tax-driven excess depreciation is appropriation, not accounting depreciation in S8. |
| 89 | Taxes | `HEADER` | H | **Header.** Nonposting organisational row; classify posting children, not its title or number. |
| 8910 | Tax on the year's result | `INCOME_TAX` | S19 | **Recommended.** Company profit-tax expense/credit belongs with tax on the year's result. |

## Exact change list for a later builder

Proposed implementation only: this report neither approves nor performs application changes. Exact account targets follow; ambiguous purposes have explicit holds rather than invented unconditional mappings.

1. **Extend existing country layouts.** Use `PL_NATURE_DK` from `packs/2026.4/layouts.sql` and `PL_NATURE_SE` from V24. Do not create `PL_DK_GROSS` or modify shared `PL_NATURE`. Publish a new hash-locked pack and a new forward migration with the next free version/number at implementation time; leave frozen V13/V24/2026.2/2026.4 untouched. Preserve DK's 2026.2 -> 2026.4 and SE's 2026.2 -> 2026.3 (SIE metadata) -> 2026.4 clone chains, roles, balances, dimensions, parents and provenance.

2. **Insert the missing external-cost line in both layouts.** `EXTERNAL_COSTS`: `kind=SECTION`, `nature=DEBIT`, `parent=NULL`, `sort_order=35`, `formula=NULL`; explicit mapping `(statement=PL, account_type=EXPENSE, subtype=EXTERNAL_COST) -> EXTERNAL_COSTS`. Use D5b/S6 local captions above and English “Other external costs”. Keep `OPERATING_EXPENSE -> OTHER_OPERATING_EXPENSES` for genuine D9/S10. Do not globally remap OPERATING_EXPENSE, FRANCHISE_EXPENSE or ROUNDING: purposes and countries differ. Re-subtype the enumerated accounts while preserving roles.

3. **Represent excess current-asset impairment separately.** Add section `CURRENT_ASSET_IMPAIRMENT_EXCESS`, `SECTION`, `DEBIT`, `parent=NULL`, `sort_order=55`, `formula=NULL`; explicit expense subtype `IMPAIRMENT_CURRENT_EXCESS` maps to it in both layouts. Use D8/S9 local captions and English “Current-asset impairment beyond normal write-downs”. Retain `IMPAIRMENT -> DEPRECIATION_AND_IMPAIRMENT` only for nonfinancial fixed assets. No supplied posting account is dedicated solely to excess current impairment: approve a distinct account if needed; do not move all bad debts here.

4. **Set relevant sort orders explicitly:** `REVENUE=10`, `OTHER_OPERATING_INCOME=20`, supplementary `TOTAL_OPERATING_INCOME=25`, `COST_OF_SALES=30`, `EXTERNAL_COSTS=35`, `EMPLOYEE_BENEFITS=40`, `DEPRECIATION_AND_IMPAIRMENT=50`, `CURRENT_ASSET_IMPAIRMENT_EXCESS=55`, `OTHER_OPERATING_EXPENSES=60`, `TOTAL_OPERATING_EXPENSES=65`, `OPERATING_RESULT=70`. This gives D5a/5b/6/7/8/9 and S5/6/7/8/9/10 in order. Finance, appropriations and tax remain below operating result. Preserve Sweden's `RESULT_AFTER_FINANCIAL_ITEMS` as supplementary; bilaga 2 does not name it. Do not add it for Denmark.

5. **Update both operating formulas exactly:**

   ```text
   TOTAL_OPERATING_EXPENSES = +COST_OF_SALES+EXTERNAL_COSTS+EMPLOYEE_BENEFITS+DEPRECIATION_AND_IMPAIRMENT+CURRENT_ASSET_IMPAIRMENT_EXCESS+OTHER_OPERATING_EXPENSES
   OPERATING_RESULT = +TOTAL_OPERATING_INCOME-TOTAL_OPERATING_EXPENSES
   ```

   Count each amount once. Preserve downstream country formulas: DK `RESULT_BEFORE_TAX=+OPERATING_RESULT+FINANCE_INCOME-FINANCE_COSTS-APPROPRIATIONS`; SE `RESULT_AFTER_FINANCIAL_ITEMS=+OPERATING_RESULT+FINANCE_INCOME-FINANCE_COSTS` and `RESULT_BEFORE_TAX=+RESULT_AFTER_FINANCIAL_ITEMS-APPROPRIATIONS`; both `RESULT_FOR_THE_YEAR=+RESULT_BEFORE_TAX-INCOME_TAX`. DK has no supplied appropriation account; do not import Swedish tax reserves. Danish optional condensation under §§32/81 is a separate presentation choice; Pakistan's revenue-minus-goods formula omits external costs and other covered Danish gross-profit components.

6. **DK external-cost set for the stated ordinary operating uses:**

   ```text
   6100 6300 6340 6360 6400 6420 6540 6550 6600 6620 6700 6705 6720 6790 6800 6900 6940 7000 7020 7040 7100 7300 7320 7330 7350 7400 7420 7500 7600 7610 7620 7720 7770 7795 7796 7797
   ```

   Set these to `EXTERNAL_COST`, including franchise 7330/7600/7610 and rounding 7795/7797. Retain customer-delivery 4500 as `COST_OF_SALES` and training 5910 as `EMPLOYEE_BENEFITS`. Move ordinary 7830 from `OPERATING_EXPENSE` to `EXTERNAL_COST`; first isolate any beyond-normal component in a separately approved `IMPAIRMENT_CURRENT_EXCESS` account. Keep 7800 as `OPERATING_EXPENSE` only for confirmed nonfinancial disposals. Do not sweep all group 78 into external costs. Financial and income-tax subtypes remain separate.

7. **DK hold/split set:** no automatic single target for 4700, 4710, 5900, 5920, 6050, 6860, 7150, 7550, 7790 or unrestricted 7800. Confirm actual purposes against the table and restrict/rename or split approved accounts. Meetings versus employee courses, cafeteria versus benefits and purchased meals versus employee allowances need different lines. Financial-asset impairment in 6050 needs D14 or the relevant participation-result line, not operating impairment; financial disposals in 7800 likewise need their applicable financial-result line. Those splits exceed the minimum external-cost patch. Leave unresolved accounts/companies flagged or unadopted instead of asserting statutory classification.

8. **SE external-cost set:**

   ```text
   5010 5020 5060 5090 5220 5250 5410 5460 5500 5611 5615 5710 5800 5910 5991 6070 6110 6211 6212 6230 6250 6310 6351 6352 6420 6530 6540 6550 6570 6590 6591 6592 6981 6991 6992
   ```

   Set these to `EXTERNAL_COST`, including 5991/6591/6592 despite FRANCHISE_EXPENSE. This covers every supplied posting row in classes 5–6, including group 69 omitted by the original A7 shorthand. Treat 6352 as normal credit losses only; isolate any beyond-normal component before adoption. Keep personnel 70–76, fixed-asset charges 7730/7732/7810/7820/7830/7832, other operating 7970/7990/7991, finance 8410/8420/8423/8430, appropriations 8810/8850 and tax 8910 in their table lines.

9. **Preserve/check Swedish exceptions.** Keep C2's 2026.4 `7960/7961: OPERATING_EXPENSE -> OTHER_OPERATING_EXPENSES`; do not revert to `FX_LOSS -> FINANCE_COSTS` or move these losses to external services. Leave operating gains 3960/3961 unchanged (income, outside these tables). Confirm 4531/4535 are direct production/customer-delivery inputs before retaining `COST_OF_SALES`; use a restricted `EXTERNAL_COST` account for general imported services. Check 8430 contains financial FX, 7990 residual losses and 7991 genuine cash differences. Record 7832's vehicle/equipment label mismatch for a separate correction; its line stays S8. Local 7961/7991/franchise extensions must not be described as verified official BAS subaccounts.

10. **Rendering/adoption.** Add English labels in backend `StatementWords.kt`, local section captions, and check app `StatementNames.kt`, API/exports and local-label handling for both new codes. `StatementAssembler` excludes headers and maps posting accounts by type/subtype: do not classify via header numbers or present mixed headers as statutory totals. CLASS grouping remains a chart/management view. Keep catch-all `OTHER_OPERATING_EXPENSES` only as a nonvalidated fallback; surface unknown/custom subtypes. Use reviewed company-account adoption with provenance/old-subtype guards; template changes alone do not repair copied accounts. Preserve customisations and C2 mappings; do not change ledger entries or balances for presentation changes.

11. **Acceptance examples for the implementation slice, not executed here.** Each posting expense appears once; headers contribute zero. Verify ordinary DK7830/SE6351/6352 external losses versus DK7800/SE7970 nonfinancial disposals, SE7960/7961 operating versus DK8160/8161 financial FX, and SE8850 appropriations. Materials 100 + external 20 + personnel 30 + fixed-asset charges 10 + excess current write-downs 5 + other operating 7 must total **172**. With operating income 250, operating result is **78**, in current/comparative periods. Adding the external line must preserve total profit. Verify unsure rows are held/split, fresh installation and guarded adoption, API/export/local captions and order. Relevant builds/tests belong to that implementation slice.

## Research checkpoint and evidence limits

- **Ownership:** A7 research; Codex owns this report only. User is requester/approval owner; later builder/integrator unassigned. App/backend are read-only; other task ownership is unchanged.
- **Approval:** task authorizes research, exactly this file, and a workspace-master commit `docs(codex): A7 expense line classification`. It prohibits `PROJECT-STATE*.md` reads; none were read. The explicit one-file scope excludes separate plan/shared-state/handoff updates.
- **Stage:** research and report verification complete; one-file documentation delivery authorized. Implementation and independent accounting acceptance are not claimed.
- **Progress/findings:** all 76 DK and 79 SE posting accounts classified, plus 31 DK and 36 SE headers accounted for. External-cost and excess-current-impairment lines are missing. Blanket DK 61–78 / SE 50–65 classification is rejected: disposals, normal bad debts, franchise fees, group 69 and mixed purposes need individual handling. C2 FX mappings retained; UNSURE rows remain explicit.
- **Verification:** CSV account sets/uniqueness and 2026.4 overlays checked; V13/V24, 2026.4 formulas, 2026.3/2026.4 cloning and statement routing inspected. Official sources checked online on the research date. No Gradle tests, services, migrations or tenant data used; no independent reviewer used. Documentation checks do not verify runtime implementation.
- **Limits:** inferred from template purposes, not transaction evidence. A7 does not certify revenue/finance/related-party disclosures, every statutory subline (including DK6a–c), special-sector rules or optional condensation. Broad flagged accounts prevent an unconditional statutory-coverage claim for every company. Danish official JSON evidence came from indexed content, not a successful direct download.
- **Resume:** owning lead/reviewer decides flagged splits and separately approves chart/layout/adoption work. Recheck current law, official chart download and latest pack/migration versions before building. This report authorizes no further app/backend work.

### Reviewed snapshot

- Workspace HEAD at initial research: `a9be97c737ec1119497f8afa1787bc7820a1552e`; at report generation: `99b1835d6efd6223233a815619cd4c5d2380c139`. Another workspace commit arrived during research; no unrelated content was changed or reverted.
- Backend HEAD: `bd2d1db55c191d381153c788e9234daf92d6b589`.
- App HEAD: `aa75d4d6cce805f3204447319ca37eb796c90f8b`.
- Workspace pickup branch: `master`. Existing unrelated dirty paths: `docs/agents/accounts-bc-readiness/brief-sb2a.md`, `docs/handover/design-principles.md`, `docs/inbox/erp-lead.md`; untracked `.review-channel/handoff-implementer.md`, `docs/agents/accounts-cp-ev-1c/`, `docs/agents/accounts-flow56-fixes/`. App/backend working trees were clean at inspection; unrelated paths are excluded.

Input SHA-256 fingerprints:

- `packs/2026.2/dk.csv`: `065a3989d8d8dffbd57883f09be5eccda31c5b0ac479c67030084572c3f02e33`.
- `packs/2026.2/se-bas.csv`: `9fa0eb85f9a1cafb342a87af5a9978c72ca216105fe55e5e9f55e4e91d04507c`.
- `packs/2026.3/se-sie.csv`: `adb72e52042d60b93a0c8a2c0dd0fe0aadd9b0410311f2db1ec2fa565e5d101d`.
- `packs/2026.4/chart-subtypes.csv`: `d7f4262c7169dd2d948bd625d9f0b20d7ee3394e96a9e24618222316c2fa51a1`.
- `packs/2026.4/layouts.sql`: `f3939ba42276128db8b576ef9ea9a94cb16e794104fa4bd7ca172c297ab2e601`.
