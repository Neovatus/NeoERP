# Review: DK standard-account map (2026-10-13)

Reviewer: fresh read-only accountant review for the Accounts lead. Reviewed file: `DK-std-account-map-2026-10-13.md`. Nothing else was edited.

- Source re-fetched 2026-10-13: `2026-01-01-Standardkontoplan.json` from git.erst.dk ("Valid from date 2026-01-01"), 603 numbers.
- Mechanical check: all 198 rows parsed (117 exact / 80 closest / 1 unmapped, as the draft states). Every std number exists in the file and every Danish name matches the published name (trailing spaces trimmed). 0 mismatches.
- Meaning check: all 80 "closest" rows and these 24 "exact" rows were checked for P&L vs balance, short vs long term and asset vs liability: 1010, 1100, 1290, 1299, 1580, 1600, 1630, 2060, 2100, 2120, 2150, 2220, 2250, 2380, 2705, 2940, 3060, 3800, 4500, 5430, 6400, 6420, 8155, 8300. No row has the wrong statement, the wrong side or the wrong term. The corrections below are about meaning within the right side, and about the lead's rulings.

## Corrections

| our account | current std | corrected std | reason |
|---|---|---|---|
| 2098 Opening balance equity | 6940 | unmapped | Ruling Q5: technical account. It must be zero for any filing, and H-DK refuses an export while it holds a balance. Same treatment as 2090. |
| 2999 Suspense | 8040 | unmapped | Ruling Q8: technical account, handled as 2098. |
| 3710 Royalty income | 1010 | 1550 Øvrige andre driftsindtægter | Ruling Q10: franchise income goes to the closest "other operating income" account. See escalation E1. |
| 3720 Franchise fee income | 1010 | 1550 Øvrige andre driftsindtægter | Ruling Q10, as 3710. |
| 1530 Accrued income and contract assets | 6390 | 6330 Øvrige tilgodehavender (omsætningsaktiv) | The asset-side periodeafgrænsningsposter (6390/6400) are prepaid costs that belong to a later year, not income earned but not yet invoiced. Accrued income is an other receivable. Contract assets on customer contracts are 6240. If the DK pack uses contract accounting, add a DK-only account mapped to 6240 (Q2). |
| 2800 Dividends payable | 8040 | 7590 Gæld til virksomhedsdeltagere og ledelse (kortfristet) | A declared, unpaid dividend is short-term debt to the company's owners. 7590 is the specific account for that, so the generic 8040 is not needed. Still a short-term liability, so the side does not change. |
| 6030 Depreciation - right-of-use assets | 3090 | 3070 Af- og nedskrivninger af finansielt leasede grunde og bygninger | In a franchise and retail ERP, most right-of-use assets are leased premises (outlet and store leases). 3090 is the leased "other plant and equipment" row. The lead may keep 3090 only if the expected tenant leases mostly vehicles or equipment. |

Confidence-only changes (std number unchanged):

| our account | std | change | reason |
|---|---|---|---|
| 1290 Right-of-use assets | 5710 | exact → closest | IFRS 16 right-of-use assets also cover leases that would be operating leases under Danish GAAP. 5710 is only the finance-lease concept, so it is not the same meaning. |
| 1299 Accum. depreciation - right-of-use | 5745 | exact → closest | As 1290. |

Total: 7 std-number corrections and 2 confidence relabels. The counts after the corrections are 117 exact → 115 exact, 80 closest → 80 closest (2098 and 2999 leave the closest rows, 1290 and 1299 join them) and 3 unmapped (2090, 2098, 2999).

## Answers to Q1–Q14

- **Q1 (ruling applied):** The 2026-01-01 file has **no closing (ultimo/total) balance rows**. Each asset class has only primo rows and movement rows (additions, disposals, depreciation for the year, reversals). Under the ruling, the primo rows stay: cost accounts → "kostpris primo", accumulated depreciation → "Af- og nedskrivninger primo". The same applies to the 1490 inventory write-down (6145 nedskrivninger primo). **No change.** Note: an export that carries closing balances on primo rows will not tie out to a roll-forward note. Splitting the movements into the movement rows would need movement-level mapping, which is outside std_account_ref.
- **Q2:** 6330 (see corrections). Use 6240 only through a separate contract-asset account.
- **Q3:** **6510** Registreret kapital mv. That is the registered amount. 6520 and 6525 split it into paid-in and not paid-in. An unpaid portion appears on the asset side as 6350, so our single 2000 account maps to 6510.
- **Q4 (ruling applied):** The standard has no owner-capital or drawings account outside class A. "Registreret kapital mv." (6510) is the virksomhedskapital of a company, and nothing in the standard matches owner's drawings. So the fallback in the ruling applies: **2030 → 6915 Egenkapital primo (kun klasse A)** and **2040 → 6923 Privat hævet (kun klasse A)**, both noted as class A only. Use 6915 rather than 6924, because 2030 holds the running owner's capital, and 6924 is only the year's contributions. For ApS and A/S, 2030 and 2040 should be unused or hidden (see E2).
- **Q5 / Q8 (ruling applied):** 2098 and 2999 are unmapped (see corrections).
- **Q6:** Keep **7125** for 2230. It pairs with 7345 for the current part (2330) in the same credit-institution group. 7240 has no short-term twin. For 6030, use 3070 (see corrections).
- **Q7:** **7590**, not 8040 (see corrections). Before the general meeting, the proposed dividend stays in equity at 6960 (our 2060). 2800 is used only after the dividend is declared.
- **Q9:** Keep 3200 → **1100** (goods, non-EU). Add a DK account "Sales of services, non-EU" → 1200, following the 3010/3020 pattern for EU. That keeps one std number per account.
- **Q10 (ruling applied):** 3710 and 3720 → 1550. 3730 is already 1550. 7600 and 7610 stay 2810, already correct. 7330 stays **1850 Annoncering og reklame**: it sits under the standard's "Andre eksterne omkostninger" main account (1820), so it complies with the ruling and is more specific.
- **Q11:** Keep **2880 Bestyrelseshonorar**, but only if 5030 is limited to board fees. Pay to the executive management (direktion) should go to 5000 → 2845. Make the pack's account description say so.
- **Q12:** Keep 6010 → 3050 and 6015 → 3050. There is a mismatch: 1200 and 1209 sit in the Produktionsanlæg class (5420/5452), but their depreciation lands in 3050. If the lead wants them consistent, add a DK account "Depreciation - plant and machinery" → 3030. 6050 → 3050 is acceptable, because the standard has no separate impairment row and impairment is booked in the af- og nedskrivninger line.
- **Q13:** Keep **1910** (limited deduction). This is the Danish default for representation: 25% deductible for tax. Use 1930 only for items that are fully deductible, and give them their own account.
- **Q14:** Keep **3380**. 8000 is income from 1350/6000 holdings. Dividends from group companies (3193) or associates (3211) need their own accounts if the pack supports holding structures.

## Other notes (no change proposed)

- 1600/1605 → 7740 Købsmoms: the standard keeps input VAT with the VAT accounts on the liability side and offsets it there. That is correct as mapped. 6320 (VAT receivable, asset) is only the final net refund position.
- 1380 Long-term loans to employees → 6030 is correct for staff. Loans to management must use 6061/6365, because the Danish Financial Statements Act (ÅRL) requires them to be disclosed. If the pack allows such loans, add a separate account.
- 5900 Staff welfare → 2887 Personalegoder is acceptable. Use 2350 Kantineomkostninger if it is mainly canteen costs.

## Escalate

- **E1 – the Q10 ruling moves franchise fees and royalties out of net turnover.** For a franchisor these are core revenue. Mapping them to 1550 lowers the nettoomsætning that the Danish Business Authority (Erhvervsstyrelsen) uses for the size thresholds of reporting classes B and C, and the turnover figure in the filed statements. Suggest confirming the ruling with Jabran or a DK accountant, or limiting it to franchisees, where these accounts are rarely used as income.
- **E2 – 2030/2040 class-A mapping on an ApS/A/S.** If a capital company posts to 2030 or 2040, the export would send class-A-only accounts. Suggest a validation that blocks these accounts unless the legal form is a sole proprietorship or a partnership. This is the same kind of guard as the H-DK block on 2090, 2098 and 2999.
