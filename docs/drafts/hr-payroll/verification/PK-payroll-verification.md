# PK Payroll pack verification (PK 2026.1 / 2026.3 rows), 2026-10-13

Prepared for the HR & Payroll lead. Contracts checked: `payroll-v2-p1.md` (§7 PK provider, §5 pack tables) and `payroll-v2-p4.md` (§6 PK filings and deadlines). No contract was edited.

**Method and limits.** Only WebSearch and WebFetch were used. `eobi.gov.pk` could not be fetched directly (DNS error), so EOBI content comes from search snippets of official EOBI pages, and PESSI, FBR statute texts and provincial gazettes could not be opened. The FBR page reached (`fbr.gov.pk/dg-withholding-taxes/174298/174299`) names s.165 but gives no cadence or dates. Anything not read on an official page is marked **secondary**. Nothing is guessed: no official value found = NOT FOUND, and any secondary value is shown in the "official value" column labelled as such.

**Status key.** MATCH = our draft value agrees with what was found. DIFFERS = disagrees. NOT FOUND = no official confirmation located (our draft is "to verify" with no figure, or the source could not be read). Most pack rows in the contract carry no figure, so NOT FOUND there means "still UNCHECKED".

## Summary

- MATCH: 9 (five of them rest on a secondary source for part of the claim, marked in the table).
- DIFFERS: 0.
- NOT FOUND: 16.
- Nothing can be moved to CHECKED on secondary evidence alone. Rows that need a person with the gazette or FBR text: all NOT FOUND rows, especially the slab table, the 2026-27 minimum wages, deposit timing and the annual salary statement.

## Rows

| # | Rule key / contract place | Our value | Official value, tax year 2026-27 | Source (URL) | Status |
|---|---|---|---|---|---|
| 1 | `PK.TAX.SALARY` slabs (p1 §7.2) | No figures, "to verify" | Not read from an official text. Secondary table (Finance Act 2026, effective 1 Jul 2026): 0 to 600,000 nil; to 1.2m 1% over 600k; to 2.2m 6,000 + 11%; to 3.2m 116,000 + 20%; to 4.1m 316,000 + 25%; to 5.6m 541,000 + 29%; to 7m 976,000 + 32%; above 7m 1,424,000 + 35% | Secondary: https://pakobserver.net/new-tax-slabs-for-salaried-persons-in-pakistan-as-fy2026-27-begins/ . Official to read: ITO 2001 First Schedule Part I Div I as amended by Finance Act 2026, https://fbr.gov.pk (Finance Act PDF returned an error in the Accounts check) | NOT FOUND |
| 2 | Surcharge rows (p1 §7.2 step 6) | "if the release has any" | Secondary sources disagree: one says the 9% high-income surcharge was removed, another only for income above Rs 10m. Unresolved | Secondary: https://vialtopartners.com/regional-alerts/pakistan-employment-tax-finance-bill-2026-27-summary and https://pakobserver.net/new-tax-slabs-for-salaried-persons-in-pakistan-as-fy2026-27-begins/ | NOT FOUND |
| 3 | Medical allowance exempt up to 10% of basic (p1 §7.2a, 2nd Schedule cl. 139) | 10% of basic, "to verify" | Not found | none reached (ITO Second Schedule on fbr.gov.pk not read) | NOT FOUND |
| 4 | `PK.EOBI.EMPLOYER` (p1 §7.6) | 5% | 5% of the worker's minimum wage | EOBI contribution page (snippet of official page): http://www.eobi.gov.pk/introduction/Contribution.html ; also http://www.eobi.gov.pk/financial-data/A-evaluation.pdf | MATCH |
| 5 | `PK.EOBI.EMPLOYEE` (p1 §7.6) | 1% | 1% of the worker's minimum wage (total 6%) | same as row 4 | MATCH |
| 6 | EOBI wage base is the notified minimum wage, not actual pay (p1 §7.6) | Notified minimum wage | Rates are stated "of minimum wages" | same as row 4 | MATCH |
| 7 | `PK.MIN_WAGE.EOBI` amount for 2026-27 (p1 §5.3 thresholds) | No figure | Not found. EOBI homepage snippet shows only the minimum pension (Rs 11,500 from Jan 2025). Secondary: Rs 40,000 for 2025-26 in Punjab, Sindh, KP, Islamabad (Rs 2,000 employer, Rs 400 employee) | Secondary: https://vialtopartners.com/regional-alerts/pakistan-social-security-update-minimum-wages-eobi-and-social-security ; official page: http://eobi.gov.pk/ | NOT FOUND |
| 8 | `PK.EOBI.AGE_LIMIT_M` / `_F` (p1 §7.6, P1-27) | 60 / 55 | Pension age 60 men, 55 women (15 years of contribution) | Secondary: https://www.oecd.org/en/publications/2024/12/pensions-at-a-glance-asia-pacific-2024_fcc7bc58/full-report/pakistan_7d9acef7.html . Official to read: EOBI Act 1976 s.22 | MATCH (secondary) |
| 9 | `PK.EOBI.MIN_EMPLOYEES` (p1 §7.6) | 5 or more employees | 5 or more employees | Secondary: same OECD page. Official to read: EOBI Act 1976 s.1(4) | MATCH (secondary) |
| 10 | PESSI employer rate (p1 §7.7, review §4.3 "about 6%") | about 6% | 6% employer on minimum wage in Punjab, shown as "social security" with no scheme name | Secondary: https://vialtopartners.com/regional-alerts/pakistan-social-security-update-minimum-wages-eobi-and-social-security . No PESSI official page reached | MATCH (secondary) |
| 11 | SESSI employer rate (p1 §7.7) | about 6% | 6% on minimum wage, collected from employers. A 2021 statement of a rise to 7% was not confirmed | https://sessi.gov.pk/index1.htm and https://lhr.sindh.gov.pk/sindh-employees-social-security-institution-sessi (official, via search snippet; Sindh ESS Act 2016 s.20 not read) | MATCH |
| 12 | `PK.<scheme>.BASE` (actual wages or minimum wage) | open, "to verify" | Minimum wage (SESSI states "6% on Minimum Wage"); Punjab by the same secondary table | same as row 11 | MATCH |
| 13 | `PK.PESSI/SESSI.WAGE_CEILING`, `COVERAGE_LIMIT` (p1 §5.3, §7.7) | No figure | Not found for 2026-27. Sindh government page gives a coverage line of Rs 10,000 per month, which looks out of date | https://lhr.sindh.gov.pk/sindh-employees-social-security-institution-sessi | NOT FOUND |
| 14 | Provident fund (`PK.PF.EMPLOYER_PERCENT`, company scheme; p1 §5.3 policy keys, §7.8) | Company policy, no statutory value; tax treatment of the contribution not in the contract | Not searched to a result: the ITO Sixth Schedule limits on tax-free employer contributions were not located | none | NOT FOUND |
| 15 | `PK.MIN_WAGE.PK-PB`, `BELOW_MINIMUM_WAGE` (p1 §7.1) | No figure | Not found for 2026-27. Latest seen: Rs 40,000, notified 8 Sep 2025, effective 1 Jul 2025 (Punjab Gazette, via WageIndicator). No 2026-27 notification found | Secondary: https://wageindicator.org/salary/minimum-wage/pakistan/168-punjab . Official: Punjab Labour and Human Resource Department gazette | NOT FOUND |
| 16 | `PK.MIN_WAGE.PK-SD` | No figure | Secondary only: Rs 43,000 from 1 Jul 2026, notification said issued 17 Aug 2026. Notification itself not read | Secondary: https://wageindicator.org/ai/work/minimum-wage/updates/2026/minimum-wage-increased-in-sindh-pakistan-from-1-july-2026-august-19-2026/ and https://pakobserver.net/sindh-budget-2026-27-salaries-pensions-increased-by-7pc-minimum-wage-set-at-rs43000/ | NOT FOUND |
| 17 | KP minimum wage (`PK-KP`, region not covered yet, p4 §6.2) | No row | Budget proposal Rs 45,000 (19 Jun 2026); adoption and notification not confirmed. Rs 40,000 notified 10 Sep 2025 for 2025-26 | Secondary: https://propakistani.pk/2026/06/19/khyber-pakhtunkhwa-announces-rs-2-17-trillion-budget/amp/ and https://fafen.org/minimum-wage-in-pakistan-laws-process-and-current-rates/ | NOT FOUND |
| 18 | Balochistan minimum wage (`PK-BA`) | No row | No 2026-27 figure found (Rs 37,000 / 40,000 for earlier years, secondary) | none | NOT FOUND |
| 19 | `PK.PAY_DAY_SHIFT` (`LATER` only inside the legal deadline; p1 §5.3, P1-31) | draft default `EARLIER`; deadline "to verify" | Not confirmed for Pakistan. The text of s.5 read was the Indian version of the 1936 Act (7th day under 1,000 workers, 10th day otherwise, wage period up to one month). A Pakistani copy exists but its s.5 was not read; labour is provincial, so provincial versions may differ | Secondary, Indian text: https://comply4hr.com/showfulltext.asp?act=PWA ; Pakistani copy to read: https://khalidzafar.com/wp-content/files_mf/1530868284PaymentofWagesAct1936.pdf | NOT FOUND |
| 20 | `PK_S165` cadence and due date (p4 §6.2, `PK.S165.CADENCE`) | QUARTER, 20th day after the quarter | Quarterly, due 20th of the month after each quarter (20 Apr, 20 Jul, 20 Oct, 20 Jan); revised statement within 60 days of filing (s.165(2A)) | Secondary: https://www.ict.edu.pk/blogs/section-165-withholding-statement-filing-guide-2026 . FBR page does not state it: https://fbr.gov.pk/dg-withholding-taxes/174298/174299 | MATCH (secondary) |
| 21 | `PK_S165_SALARY_ANNUAL` deadline (p4 §6.2/§6.4) | `DATE_AFTER_TAX_YEAR`, date "to verify" | Secondary: annual statement under rule 44 by 31 July after the year end. Not seen on an official page | Secondary: https://www.ict.edu.pk/blogs/section-165-withholding-statement-filing-guide-2026 | NOT FOUND |
| 22 | Tax deposit `PK.TAX.DEPOSIT_DUE` (7 days after week end, rule 43(b)); `DEPOSIT_LATE` (p4 §6.2, §9) | 7 days after the week ending Sunday | Not found. No source for rule 43 or the deposit schedule was reached. Treat the weekly rule as unverified; check ITO s.160 and Income Tax Rules 2002 rule 43 directly | none | NOT FOUND |
| 23 | `PK_EOBI`, `PK_PESSI`, `PK_SESSI` due date (p4 §6.4) | 15th of next month | Not found | none | NOT FOUND |
| 24 | `PK_S164` certificate date (p4 §6.4) | date "to verify" | Not found | none | NOT FOUND |
| 25 | `PK.GRATUITY` 30 days per year, over 6 months counts as a year (p1 §7.8) | as stated | Not found | none | NOT FOUND |

## Notes for the lead

- Rows 4 to 6 and 11 are the only ones backed by an official institution page (EOBI and SESSI/Sindh Government). Both were seen as search snippets, not as full fetches.
- The p1 contract says Sindh may have its own old-age scheme (SEOBI, Q13). Nothing found today settles it; it stays unchecked.
- No row DIFFERS. The slab table in row 1 is the main item to close from the Finance Act 2026 text before any PK run is posted for real.
