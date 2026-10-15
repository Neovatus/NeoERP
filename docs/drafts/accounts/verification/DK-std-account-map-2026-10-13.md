# DK standard-account map for every posting account (std_account_ref)

Mapping reference for rule §2.1(3) of `NeoERP-BackEnd/docs/api/accounts-packs-2026-2.md`. Pack-data sub-agent output for the Accounts lead; the packs file is not edited.

- Source: Erhvervsstyrelsen standardkontoplan, file `2026-01-01-Standardkontoplan.json` ("Valid from date 2026-01-01"), https://git.erst.dk/standard-filformater/standard-filformater/-/raw/master/Standardkontoplanen/JSON/2026-01-01-Standardkontoplan.json
- File date: valid from 2026-01-01. Read date: 2026-10-13 (curl, 603 numbers; every std number below was checked to exist in the file, names copied as published, trailing spaces trimmed).
- Our accounts: BASE skeleton `docs/drafts/accounts/coa/base-ifrs.csv` (posting rows only) less 1620 and 2750 (withholding tax, not in the DK chart, packs §2.1(1)), plus the DK additions of packs §2.3 / §2.3a / §6.3 (2060, 2070, 2601, 2706, 2771, 2772, 3010, 3020, 4396, 5405, 7720, 7797). The `dk.csv` is not generated yet, so this list is the expected DK chart. 2945 is removed per packs §2.3.
- Rows marked "Already in packs §2.3a" repeat the existing mapping (kept unchanged where it does not conflict); all other rows are new proposals to be CHECKED by the Accounts lead.
- Counts: 198 posting accounts: exact 117, closest 80, unmapped 1 (2090 only).
- Fixed-asset note: the standard splits each asset class into roll-forward rows (kostpris primo, additions, disposals, revaluations, depreciation primo, depreciation for the year, reversals). Our single cost / accumulated-depreciation accounts map to the "primo" row of the class. See Q1.

| our account | our name | std number | std name (Danish, as published) | confidence | note |
|---|---|---|---|---|---|
| 1010 | Capitalised development costs | 5010 | Færdiggjort udviklingsprojekter, herunder patenter og lignende rettigheder, der stammer fra udviklingsprojekter, Kostpris primo | exact | Cost row of the roll-forward ("kostpris primo"); the standard also has separate rows for additions, disposals, revaluation and depreciation (5011-5032), see Q1. |
| 1020 | Software and licences | 5042 | Erhvervede immaterielle anlægsaktiver, kostpris primo | closest | Acquired intangibles; software has no own balance account. Cost row (kostpris primo). |
| 1030 | Trademarks and franchise rights | 5042 | Erhvervede immaterielle anlægsaktiver, kostpris primo | closest | Acquired intangibles (trademarks, franchise rights). Cost row. |
| 1070 | Deferred tax asset | 6020 | Udskudte skatteaktiver (anlægsaktiv) | exact | Non-current deferred tax asset. |
| 1080 | Goodwill | 5062 | Goodwill, kostpris primo | exact | Cost row (kostpris primo). |
| 1090 | Accumulated amortisation - intangible assets | 5055 | Erhvervede immaterielle anlægsaktiver, Af- og nedskrivninger primo | closest | Accumulated amortisation, acquired intangibles; capitalised development has its own 5030 (Q1). |
| 1100 | Buildings | 5320 | Grunde og bygninger, kostpris primo | exact | Land and buildings combined in the standard; cost row. |
| 1109 | Accumulated depreciation - buildings | 5372 | Grunde og bygninger, Af- og nedskrivninger primo | exact | Accumulated depreciation row (af- og nedskrivninger primo). |
| 1130 | Capital work in progress | 5640 | Materielle anlægsaktiver under udførelse og forudbetalinger for materielle anlægsaktiver, kostpris primo | closest | Property, plant and equipment under construction, cost row. |
| 1150 | Land | 5320 | Grunde og bygninger, kostpris primo | closest | Land and buildings are one standard account. |
| 1160 | Leasehold improvements | 5500 | Indretning af lejede lokaler, kostpris primo | exact | Cost row. |
| 1169 | Accumulated depreciation - leasehold improvements | 5532 | Indretning af lejede lokaler, Af- og nedskrivninger primo | exact | Accumulated depreciation row. |
| 1200 | Plant and machinery | 5420 | Produktionsanlæg og maskiner, kostpris primo | exact | Cost row. |
| 1209 | Accumulated depreciation - plant and machinery | 5452 | Produktionsanlæg og maskiner, Af- og nedskrivninger primo | exact | Accumulated depreciation row. |
| 1230 | Motor vehicles | 5570 | Andre anlæg, driftsmateriel og inventar, kostpris primo | closest | Vehicles fall under "Andre anlaeg, driftsmateriel og inventar" (no vehicle account). |
| 1239 | Accumulated depreciation - motor vehicles | 5602 | Andre anlæg, driftsmateriel og inventar, Af- og nedskrivninger primo | closest | As 1230. |
| 1250 | Furniture, fixtures and fittings | 5570 | Andre anlæg, driftsmateriel og inventar, kostpris primo | exact | Cost row. |
| 1259 | Accumulated depreciation - furniture and fittings | 5602 | Andre anlæg, driftsmateriel og inventar, Af- og nedskrivninger primo | exact | Accumulated depreciation row. |
| 1280 | Computer and IT equipment | 5570 | Andre anlæg, driftsmateriel og inventar, kostpris primo | closest | IT equipment falls under "Andre anlaeg, driftsmateriel og inventar". |
| 1289 | Accumulated depreciation - IT equipment | 5602 | Andre anlæg, driftsmateriel og inventar, Af- og nedskrivninger primo | closest | As 1280. |
| 1290 | Right-of-use assets | 5710 | Finansielt leasede aktiver, Kostpris primo | exact | Finance-leased assets (IFRS 16 right-of-use assets are the closest standard concept); cost row. |
| 1299 | Accumulated depreciation - right-of-use assets | 5745 | Finansielt leasede aktiver, af- og nedskrivninger primo | exact | Accumulated depreciation row. |
| 1300 | Investments in subsidiaries | 5800 | Kapitalandele i tilknyttede virksomheder, kostpris primo | exact | Cost row. |
| 1350 | Other long-term investments | 6000 | Andre værdipapirer og kapitalandele | closest | Other securities and holdings held as non-current assets. |
| 1380 | Long-term loans to employees | 6030 | Øvrige tilgodehavender (anlægsaktiv) | closest | Other non-current receivables; the standard has no employee-loan account at non-current level. |
| 1390 | Long-term deposits | 6040 | Deposita (anlægsaktiv) | exact | Deposita (anlaegsaktiv). |
| 1400 | Raw materials | 6080 | Råvarer og hjælpematerialer, kostpris primo | exact | Cost row. |
| 1420 | Work in progress | 6110 | Varer under fremstilling, kostpris primo | exact | Cost row. |
| 1440 | Finished goods | 6140 | Fremstillede varer og handelsvarer, kostpris primo | closest | Finished goods and goods for resale are one standard account. |
| 1460 | Goods for resale | 6140 | Fremstillede varer og handelsvarer, kostpris primo | exact | Already in packs §2.3a. |
| 1470 | Goods in transit | 6140 | Fremstillede varer og handelsvarer, kostpris primo | closest | Goods in transit: no own account; goods for resale. |
| 1475 | Packing materials, stores and spares | 6080 | Råvarer og hjælpematerialer, kostpris primo | closest | Packing materials, stores and spares: raw materials and consumables. |
| 1480 | Advances to suppliers | 6170 | Forudbetalinger for varer | exact | Already in packs §2.3a. |
| 1490 | Provision for obsolete inventory | 6145 | Fremstillede varer og handelsvarer, nedskrivninger primo | closest | Write-down row for goods (nedskrivninger primo); the standard splits write-downs per inventory class (6085, 6115, 6145). |
| 1500 | Trade receivables | 6190 | Tilgodehavender fra salg og tjenesteydelser | exact | Already in packs §2.3a. |
| 1530 | Accrued income and contract assets | 6390 | Periodeafgrænsningsposter, der kan opretholdes skattemæssigt | closest | Accrued income; contract assets would be 6240 (work in progress for third parties). Q2. |
| 1550 | Intercompany and franchise receivables | 6252 | Tilgodehavender hos tilknyttede virksomheder (omsætningsaktiv) | exact | Already in packs §2.3a. |
| 1570 | Employee advances | 6330 | Øvrige tilgodehavender (omsætningsaktiv) | closest | Already in packs §2.3a (lead decision 2026-10-10). |
| 1580 | Allowance for expected credit losses | 6200 | Tilgodehavender fra salg og tjenesteydelser, nedskrivninger primo | exact | Already in packs §2.3a. |
| 1590 | Other receivables | 6330 | Øvrige tilgodehavender (omsætningsaktiv) | exact |  |
| 1600 | Input VAT / sales tax recoverable | 7740 | Købsmoms | exact | Already in packs §2.3a (our account is an asset, 7740 is a liability-side account in the standard). |
| 1605 | Input VAT / sales tax - reverse charge | 7740 | Købsmoms | exact | Already in packs §2.3a. |
| 1630 | Income tax paid in advance | 6315 | Tilgodehavende selskabsskat (omsætningsaktiv) | exact | Tilgodehavende selskabsskat (omsaetningsaktiv). |
| 1700 | Prepaid rent | 6390 | Periodeafgrænsningsposter, der kan opretholdes skattemæssigt | closest | Prepayments that can be kept for tax (6400 if not). |
| 1710 | Prepaid insurance | 6390 | Periodeafgrænsningsposter, der kan opretholdes skattemæssigt | closest | As 1700. |
| 1790 | Other prepaid expenses | 6390 | Periodeafgrænsningsposter, der kan opretholdes skattemæssigt | closest | As 1700. |
| 1800 | Short-term investments | 6450 | Andre værdipapirer og kapitalandele som ikke er bestemt til vedvarende eje | closest | Other securities and holdings not meant for lasting ownership. |
| 1900 | Cash on hand | 6470 | Likvide beholdninger | exact | Already in packs §2.3a. |
| 1910 | Petty cash | 6470 | Likvide beholdninger | exact | Cash on hand (petty cash). |
| 1920 | Bank - main operating account | 6480 | Bankkonto | exact | Already in packs §2.3a. |
| 1930 | Bank - savings and deposits | 6480 | Bankkonto | exact | Bank account. |
| 1940 | Bank - foreign currency account | 6480 | Bankkonto | exact | Already in packs §2.3a. |
| 1950 | Card and wallet settlements clearing | 6330 | Øvrige tilgodehavender (omsætningsaktiv) | closest | Already in packs §2.3a (proposal; no card account in the standard). |
| 1960 | Till takings awaiting deposit | 6470 | Likvide beholdninger | exact | Already in packs §2.3a. |
| 2000 | Share capital | 6510 | Registreret kapital mv. | closest | Packs §2.3a says "6510 / 6520"; one number must be chosen: 6510 registered capital (6520 paid in, 6525 not paid in). Q3. |
| 2020 | Share premium | 6540 | Overkurs ved emission | exact | Overkurs ved emission. |
| 2030 | Owner's capital | 6915 | Egenkapital primo (kun klasse A) | closest | Sole proprietor equity; the standard has only class-A accounts for this (6915 Egenkapital primo). Q4. |
| 2040 | Owner's drawings | 6923 | Privat hævet (kun klasse A) | exact | Class A (sole proprietor) only. Q4. |
| 2045 | Revaluation reserve | 6560 | Reserve for opskrivninger | exact | Reserve for opskrivninger. |
| 2048 | Other reserves | 6910 | Øvrige reserver | exact | Oevrige reserver. |
| 2050 | Retained earnings | 6940 | Overført resultat, jf. resultatdisponering | exact | Already in packs §2.3a. |
| 2060 | Proposed dividend | 6960 | Foreslået udbytte jf. resultatdisponeringen | exact | DK addition (proposed dividend); packs §2.3a. |
| 2070 | Net revaluation reserve | 6800 | Reserve for nettoopskrivning efter den indre værdis metode | exact | DK addition (Reserve for nettoopskrivning); packs §2.3a. |
| 2090 | Current year result | - | - | unmapped | Presentation account; allowed to stay unmapped (rule §2.1(3), packs §2.3a). |
| 2098 | Opening balance equity | 6940 | Overført resultat, jf. resultatdisponering | closest | Technical clearing account for opening balances; no standard account. Mapped to retained earnings where it ends up. Q5. |
| 2100 | Employee benefit obligations | 6985 | Hensættelser til pensioner og lignende forpligtelser | exact | Hensaettelser til pensioner og lignende forpligtelser. |
| 2120 | Deferred tax liability | 7010 | Hensættelser til udskudt skat | exact |  |
| 2150 | Warranty provisions | 7040 | Andre hensatte forpligtelser | exact | Andre hensatte forpligtelser. |
| 2180 | Other provisions | 7040 | Andre hensatte forpligtelser | exact |  |
| 2220 | Bank loans - non-current | 7120 | Gæld til banker (langfristet) | exact | Gaeld til banker (langfristet). |
| 2230 | Lease liabilities - non-current | 7125 | Leasingforpligtelser (langfristet) | closest | Also 7240 (Leasingforpligtelse, langfristet) exists in the "other debt" group; 7125 chosen as it sits with credit-institution debt. Q6. |
| 2250 | Loans from shareholders and directors | 7210 | Gæld til virksomhedssdeltagere og ledelse (langfristet) | exact | Gaeld til virksomhedsdeltagere og ledelse (langfristet). |
| 2290 | Other long-term liabilities | 7195 | Anden gæld (langfristet) | exact | Anden gaeld (langfristet). |
| 2300 | Current portion of long-term loans | 7330 | Gæld til banker (kortfristet) | closest | Short-term part of bank loans; 7310 if from mortgage institutions. |
| 2330 | Lease liabilities - current | 7345 | Leasingforpligtelser (kortfristet) | exact | Leasingforpligtelser (kortfristet). |
| 2380 | Bank overdraft | 7330 | Gæld til banker (kortfristet) | exact | Gaeld til banker (kortfristet). |
| 2400 | Trade payables | 7440 | Leverandører af varer og tjenesteydelser (kortfristet) | exact | Already in packs §2.3a. |
| 2450 | Goods received not invoiced | 7440 | Leverandører af varer og tjenesteydelser (kortfristet) | closest | Already in packs §2.3a (proposal, verify). |
| 2460 | Intercompany and franchise payables | 7510 | Gæld til tilknyttede virksomheder (kortfristet) | exact | Already in packs §2.3a. |
| 2500 | Income tax payable | 8040 | Øvrig anden gæld | closest | Already in packs §2.3a (corrected from 7250; the standard has no short-term company-tax payable). |
| 2600 | Employee income tax withheld | 7920 | Skyldig A-skat | exact | Already in packs §2.3a. |
| 2601 | AM contribution payable | 7940 | Skyldigt AM-bidrag | exact | DK addition; already in packs §2.3a. |
| 2610 | Other payroll deductions payable | 8040 | Øvrig anden gæld | closest | Already in packs §2.3a (proposal). |
| 2700 | Output VAT / sales tax payable | 7680 | Salgsmoms | exact | Already in packs §2.3a. |
| 2705 | Output VAT / sales tax - reverse charge | 7700 | Moms af varekøb udland, EU og ikke-EU | exact | Already in packs §2.3a. |
| 2706 | Output VAT, reverse charge - services bought abroad | 7720 | Moms af ydelseskøb udland, EU og ikke-EU | exact | DK addition; already in packs §2.3a. |
| 2740 | VAT / sales tax settlement | 7840 | Skyldig moms | exact | Already in packs §2.3a. |
| 2770 | Employer social security payable | 8010 | Skyldig arbejdsgiverbidrag (samlet betaling) | exact | Already in packs §2.3a. |
| 2771 | ATP payable | 7960 | Skyldigt ATP-bidrag | exact | DK ATP_PAYABLE; already in packs §2.3a. |
| 2772 | Holiday pay payable (FerieKonto) | 7900 | Skyldige feriepenge | exact | DK FERIEKONTO_PAYABLE; already in packs §2.3a. |
| 2800 | Dividends payable | 8040 | Øvrig anden gæld | closest | Dividend declared and not yet paid: no own standard account (proposed dividend is equity 6960). Q7. |
| 2900 | Customer advances and deposits | 7410 | Modtagne forudbetalinger fra kunder (kortfristet) | exact | Already in packs §2.3a. |
| 2910 | Pension contributions payable | 8000 | Anden skyldig pension | exact | Already in packs §2.3a. |
| 2930 | Net salaries payable | 7860 | Skyldig løn og gager | exact | Already in packs §2.3a. |
| 2940 | Accrued holiday pay | 8030 | Skyldig feriepengeforpligtigelse | exact | Already in packs §2.3a. |
| 2950 | Accrued interest | 8040 | Øvrig anden gæld | closest | No accrued-interest account in the standard; other short-term debt. |
| 2960 | Accrued expenses | 8040 | Øvrig anden gæld | closest | No accrued-expenses account in the standard; other short-term debt. |
| 2970 | Deferred revenue | 8070 | Periodeafgrænsningsposter (kortfristet) | closest | Periodeafgraensningsposter (kortfristet); also 7456 for advance payments on contracts. |
| 2990 | Other current liabilities | 8040 | Øvrig anden gæld | exact | Oevrig anden gaeld. |
| 2999 | Suspense | 8040 | Øvrig anden gæld | closest | Suspense: no standard account. Q8. |
| 3000 | Sales of goods | 1010 | Salg af varer og ydelser | exact | Already in packs §2.3a. |
| 3010 | Sales of goods, EU | 1050 | Salg af varer udland, EU | exact | DK addition; goods EU. |
| 3020 | Sales of services, EU | 1150 | Salg af ydelser udland, EU | exact | DK addition; services EU. |
| 3050 | Sales of services | 1010 | Salg af varer og ydelser | exact | Already in packs §2.3a. |
| 3060 | Delivery charges billed | 1250 | Salgsfragt | exact | Salgsfragt (freight charged to customers). |
| 3080 | Sales discounts | 1210 | Salgsrabatter | exact | Already in packs §2.3a. |
| 3090 | Sales returns | 1210 | Salgsrabatter | closest | Already in packs §2.3a (proposal). |
| 3100 | Exempt and zero-rated sales | 1010 | Salg af varer og ydelser | closest | The standard does not split exempt and zero-rated domestic sales. |
| 3200 | Export sales | 1100 | Salg af varer udland, ikke-EU | closest | Goods outside EU; services would be 1200. Packs §2.3a says "split or mapped to 1100 with a note". Q9. |
| 3700 | Commission income | 1550 | Øvrige andre driftsindtægter | closest | Oevrige andre driftsindtaegter; 1010 if commission is the main business. |
| 3710 | Royalty income | 1010 | Salg af varer og ydelser | closest | Royalty income of a franchisor is turnover; no franchise account in the standard. Q10. |
| 3720 | Franchise fee income | 1010 | Salg af varer og ydelser | closest | As 3710. |
| 3730 | Marketing fund contributions received | 1550 | Øvrige andre driftsindtægter | closest | As 3710; pass-through contributions, not turnover. Q10. |
| 3800 | Gain on disposal of non-current assets | 1530 | Gevinst ved salg af materielle anlægsaktiver | exact | Gevinst ved salg af materielle anlaegsaktiver (1510 for intangibles). |
| 3900 | Government grants | 1545 | Offentlige tilskud | exact | Offentlige tilskud. |
| 3910 | Rental income | 1550 | Øvrige andre driftsindtægter | closest |  |
| 3990 | Miscellaneous income | 1550 | Øvrige andre driftsindtægter | exact |  |
| 4000 | Raw materials consumed | 1610 | Varekøb | exact | Varekoeb (raw materials consumed). |
| 4060 | Freight and duties on purchases | 1760 | Fragtomkostninger | closest | Fragtomkostninger; duties have no own account. |
| 4300 | Purchases - goods and services | 1610 | Varekøb | exact | Already in packs §2.3a. |
| 4380 | Purchase discounts received | 1610 | Varekøb | closest | Already in packs §2.3a (proposal, verify); the standard has no purchase-discount account. |
| 4390 | Cost of goods sold | 1610 | Varekøb | closest | Already in packs §2.3a (proposal, verify). |
| 4395 | Inventory adjustments and shrinkage | 1770 | Varelagerregulering på lagre af råvarer og hjælpematerialer | closest | Packs §2.3a: stock movement 1770 (proposal, verify). |
| 4396 | Purchase price variances | 1610 | Varekøb | closest | DK addition; packs §2.3a lists it with 4380-4395 under 1610 (proposal, verify). |
| 4500 | Subcontracting | 1745 | Underleverandører (varer/ydelser leveret til kunder) | exact | Underleverandoerer. |
| 4700 | Production overheads | 1801 | Øvrige produktionsomkostninger | exact | Oevrige produktionsomkostninger. |
| 4710 | Power and fuel - production | 1801 | Øvrige produktionsomkostninger | closest | Production power and fuel; no own account. |
| 5000 | Salaries and wages | 2845 | AM Bidragspligtig A-Indkomst | exact | Already in packs §2.3a. |
| 5010 | Overtime and bonuses | 2845 | AM Bidragspligtig A-Indkomst | closest | Overtime and bonus are AM-contribution-liable A income; bonus payable is 7880. |
| 5020 | Holiday pay | 2860 | Feriepenge og SH-tillæg | exact | Already in packs §2.3a. |
| 5030 | Directors' remuneration | 2880 | Bestyrelseshonorar | closest | Bestyrelseshonorar covers board fees; management pay is salary 2845. Q11. |
| 5400 | Employer social security | 2930 | Øvrige omkostninger til social sikring | exact | Already in packs §2.3a (renamed AUB, AES, Barsel.dk, finansieringsbidrag). |
| 5405 | ATP, employer | 2898 | ATP, arbejdsgiver | exact | DK addition; already in packs §2.3a. |
| 5420 | Pension costs | 2910 | Pensioner, arbejdsgiver | exact | Already in packs §2.3a. |
| 5430 | End-of-service benefits | 2870 | Jubilæumsgratiale og fratrædelsesgodtgørelse | exact | Jubilaeumsgratiale og fratraedelsesgodtgoerelse. |
| 5900 | Staff welfare | 2887 | Personalegoder | closest | Personalegoder. |
| 5910 | Training | 2896 | Kursusudgifter | exact | Kursusudgifter. |
| 5920 | Recruitment | 2810 | Andre eksterne omkostninger | closest | No recruitment account; other external costs. |
| 6000 | Depreciation - buildings | 3020 | Af- og nedskrivninger af grunde og bygninger | exact |  |
| 6010 | Depreciation - plant, vehicles and furniture | 3050 | Af- og nedskrivninger af andre anlæg, driftsmateriel og inventar | closest | Mixed: plant is 3030, vehicles and furniture 3050. Q12. |
| 6015 | Depreciation - IT equipment | 3050 | Af- og nedskrivninger af andre anlæg, driftsmateriel og inventar | closest | IT equipment falls under other plant and equipment. |
| 6020 | Amortisation - intangible assets | 3000 | Af- og nedskrivninger af erhvervede immaterielle anlægsaktiver | exact | Acquired intangibles (3060 for software, 3010 goodwill). |
| 6030 | Depreciation - right-of-use assets | 3090 | Af- og nedskrivninger af finansielt leasede andre anlæg, driftsmateriel og inventar | closest | Right-of-use assets span buildings (3070), plant (3080) and other (3090). Q6. |
| 6050 | Impairment losses | 3050 | Af- og nedskrivninger af andre anlæg, driftsmateriel og inventar | closest | Impairment has no own account; the standard books it in the af- og nedskrivninger account of the asset class. Q12. |
| 6100 | Freight and delivery out | 1950 | Andre salgsomkostninger | closest | Delivery costs out are a selling cost; 1760 is purchase freight. |
| 6300 | Rent | 2030 | Husleje | exact | Husleje. |
| 6340 | Utilities | 2050 | El | closest | Utilities: El (2050); water 2070, heating 2080 are separate. |
| 6360 | Cleaning and security | 2150 | Rengøring og renovation (affaldshåndtering) | closest | Rengoering og renovation; security has no own account. |
| 6400 | Equipment and vehicle rental | 2460 | Leje og operationelle leasingydelser (ekskl. husleje) | exact | Leje og operationelle leasingydelser (ekskl. husleje). |
| 6420 | Software and cloud subscriptions | 2310 | It-udstyr (hardware, software inkl. licenser og abonnementer) | exact | It-udstyr (hardware, software inkl. licenser og abonnementer). |
| 6540 | Small equipment not capitalised | 2230 | Småanskaffelser under skattemæssig grænse for småaktiver | closest | Below the tax threshold for small assets; 2240 if above. |
| 6550 | Consumables | 2450 | Kontorartikler | closest | Kontorartikler. |
| 6600 | Repairs - buildings | 2160 | Reparation og vedligeholdelse | exact | Reparation og vedligeholdelse (premises). |
| 6620 | Repairs - equipment | 2810 | Andre eksterne omkostninger | closest | The standard has no equipment-repair account. |
| 6700 | Audit fees | 2670 | Revision og regnskabsmæssig assistance | exact | Revision og regnskabsmaessig assistance. |
| 6705 | Accounting fees | 2670 | Revision og regnskabsmæssig assistance | exact |  |
| 6720 | Legal and professional fees | 2680 | Advokatmæssig assistance | closest | Advokatmaessig assistance; other advisers 2690. |
| 6790 | Other external services | 2810 | Andre eksterne omkostninger | closest |  |
| 6800 | Office supplies | 2450 | Kontorartikler | exact | Kontorartikler. |
| 6860 | Meetings and courses | 2810 | Andre eksterne omkostninger | closest | No meetings account. |
| 6900 | Telephone and internet | 2410 | Telefon og internet mv. (kun virksomhed) | exact | Telefon og internet mv. |
| 6940 | Postage and courier | 2390 | Porto og gebyrer | exact | Porto og gebyrer. |
| 7000 | Fuel | 2540 | Driftsomkostninger, personbiler | closest | Driftsomkostninger, personbiler (2560 for vans). |
| 7020 | Vehicle maintenance | 2540 | Driftsomkostninger, personbiler | closest |  |
| 7040 | Vehicle insurance and tax | 2540 | Driftsomkostninger, personbiler | closest | Vehicle tax and insurance; other insurance is 2650. |
| 7100 | Travel and accommodation | 2470 | Rejseomkostninger (administrationsomkostning) | closest | Rejseomkostninger (administrationsomkostning); sales travel is 2000. |
| 7150 | Meals and per diem | 2470 | Rejseomkostninger (administrationsomkostning) | closest | Meals and per diem; 2895 for tax-free employee allowances. |
| 7300 | Sales commissions | 1950 | Andre salgsomkostninger | closest | Andre salgsomkostninger. |
| 7320 | Advertising | 1850 | Annoncering og reklame | exact | Annoncering og reklame. |
| 7330 | Marketing fund contributions paid | 1850 | Annoncering og reklame | closest | Franchise marketing fund paid by the franchisee. |
| 7350 | Entertainment | 1910 | Repræsentationsomkostninger, skattemæssigt begrænset fradrag | closest | Representation with limited deduction; 1930 where fully deductible. Q13. |
| 7400 | Memberships and subscriptions | 2370 | Kontingenter | exact | Kontingenter. |
| 7420 | Donations | 2810 | Andre eksterne omkostninger | closest | No donations account. |
| 7500 | Insurance | 2650 | Øvrige forsikringer | exact | Oevrige forsikringer. |
| 7550 | Warranty costs | 2810 | Andre eksterne omkostninger | closest | No warranty-cost account. |
| 7600 | Royalty expense | 2810 | Andre eksterne omkostninger | closest | No royalty account in the standard. Q10. |
| 7610 | Franchise fee expense | 2810 | Andre eksterne omkostninger | closest | As 7600. Q10. |
| 7620 | Licences and permits | 2810 | Andre eksterne omkostninger | closest | Licences and permits; software licences are 2310. |
| 7720 | Restaurant services (25% deductible VAT) | 1910 | Repræsentationsomkostninger, skattemæssigt begrænset fradrag | exact | DK addition; already in packs §2.3a. |
| 7770 | Bank charges | 2390 | Porto og gebyrer | exact | Already in packs §2.3a. |
| 7790 | Miscellaneous expenses | 2810 | Andre eksterne omkostninger | exact | Andre eksterne omkostninger. |
| 7795 | Rounding differences | 2720 | Øreafrunding/kassedifferencer | exact | Already in packs §2.3a. |
| 7796 | Cash over and short | 2720 | Øreafrunding/kassedifferencer | exact | Already in packs §2.3a. |
| 7797 | Small payment differences | 2720 | Øreafrunding/kassedifferencer | exact | DK addition; already in packs §2.3a. |
| 7800 | Loss on disposal of non-current assets | 3165 | Tab ved salg af materielle anlægsaktiver | exact | Tab ved salg af materielle anlaegsaktiver (3160 for intangibles). |
| 7830 | Bad debts and expected credit losses | 2280 | Tab på tilgodehavender fra salg og tjenesteydelser | exact | Already in packs §2.3a. |
| 8000 | Dividend income | 3380 | Udbytte fra unoterede porteføljeaktier (bruttoudbytte) | closest | Dividend income from non-subsidiary holdings; 3193 / 3211 if from group or associates. Q14. |
| 8050 | Interest income | 3470 | Renter fra banker | exact | Already in packs §2.3a. |
| 8060 | Exchange gains - realised | 3535 | Valutakursregulering (gevinst) | exact | Already in packs §2.3a (no realised/unrealised split). |
| 8061 | Exchange gains - unrealised | 3535 | Valutakursregulering (gevinst) | exact | Already in packs §2.3a (no realised/unrealised split). |
| 8070 | Other finance income | 3530 | Øvrige finansielle indtægter | exact | Oevrige finansielle indtaegter. |
| 8150 | Interest expense | 3670 | Renter til banker og realkreditinstitutter | exact | Already in packs §2.3a. |
| 8155 | Interest on lease liabilities | 3640 | Renter på finansiel leasinggæld | exact | Renter paa finansiel leasinggaeld. |
| 8160 | Exchange losses - realised | 3610 | Valutakursregulering (tab) | exact | Already in packs §2.3a. |
| 8161 | Exchange losses - unrealised | 3610 | Valutakursregulering (tab) | exact | Already in packs §2.3a. |
| 8170 | Other finance costs | 3690 | Øvrige finansielle omkostninger | exact | Oevrige finansielle omkostninger. |
| 8300 | Current income tax | 3740 | Årets skat (skat af årets skattepligtige indkomst) | exact | Already in packs §2.3a. |
| 8320 | Deferred tax | 3760 | Årets regulering af udskudt skat | exact | Aarets regulering af udskudt skat. |

## Questions for the Accounts lead

- Q1. Fixed assets (1010-1299, 1300): the standard has roll-forward accounts (additions, disposals, depreciation for the year). Does SAF-T export need those, or is the "primo" row enough for the year-end balance? Our accounts hold the running balance, so the chosen row is the only link.
- Q2. 1530 Accrued income and contract assets: 6390 (periodeafgraensning) or 6240 (igangvaerende arbejder for fremmed regning) for contract assets? One number per account.
- Q3. 2000 Share capital: 6510 (registreret kapital) vs 6520 (indbetalt). Packs §2.3a lists both; pick one.
- Q4. 2030 Owner's capital, 2040 Owner's drawings: only class-A (sole proprietor) accounts exist (6915, 6923, 6924); confirm class A use and whether 2030 should be 6915 or 6924.
- Q5. 2098 Opening balance equity: technical account with no standard equivalent. Mapped to 6940; or allow it unmapped like 2090 (rule change needed).
- Q6. Leases (2230, 6030): the standard has lease liabilities at 7125 and 7240 (non-current) and depreciation rows per asset class (3070-3090). Confirm 7125 and 3090.
- Q7. 2800 Dividends payable: 8040, or keep dividends in equity 6960 until paid?
- Q8. 2999 Suspense: no standard account; 8040 is a placeholder. Should it be unmapped like 2090?
- Q9. 3200 Export sales: 1100 (goods) only, or a split into goods 1100 / services 1200 (packs §2.3a)?
- Q10. Franchise accounts (3710-3730, 7330, 7600, 7610): no standard franchise or royalty accounts; mapped to turnover / other operating items and other external costs.
- Q11. 5030 Directors' remuneration: 2880 (board fees) or salary 2845.
- Q12. Depreciation 6010, 6015 and impairment 6050: the standard keeps depreciation per asset class; 6010 mixes plant (3030) and vehicles and furniture (3050).
- Q13. 7350 Entertainment: 1910 (limited deduction) or 1930 (full deduction); depends on the VAT/tax treatment the pack gives it.
- Q14. 8000 Dividend income: 3380, 3193 (group) or 3211 (associates)?
- Confidence "closest" rows with a "no own account" note need the lead's confirmation; the standard publishes no statement for them.
