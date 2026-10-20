# Nordic local names draft (Norway bokmål, Sweden Swedish)

> **Lead review 2026-10-20: APPROVED** as our display names (not statutory amounts). Two edits applied: SE "frivillig skattskyldighet" → "frivillig beskattning" (term since the 2023 mervärdesskattelag); SVC-ABROAD → "Försäljning av tjänster som omsätts utomlands" (ruta 40). NO SAF-T names checked against Skatteetaten codes 15, 51, 82–85, 87–89, 91–92. Ship in V21/V22 with the verified state (F2).

Draft only; no pack files edited. Pack: packs/2026.2 (packs/2026.3 holds no chart or tax-code rows). Rows: 44 (22 NO chart, 11 NO tax, 11 SE tax); 15 medium confidence.

Sources: NOR = Skatteetaten SAF-T standard tax codes (https://github.com/Skatteetaten/saf-t/blob/master/Standard%20Tax%20Codes/CSV/Standard_Tax_Codes.csv, fetched 2026-10-20; also https://www.skatteetaten.no/globalassets/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-regnskap/norwegian-saf-t-standard-vat-codes.pdf). SKV = Skatteverket momsdeklaration (SKV 4700) ruta texts, from memory, NOT fetched this session; re-check before commit. "Own name" rows are our wording, not NS 4102 / BAS.

## Norway chart (no-ns4102.csv)

| code | English name | proposed local name | source | confidence | note |
|---|---|---|---|---|---|
| 1573 | Other loans to employees | Andre lån til ansatte | own name, style of existing rows (cf. 1572 Lønnsforskudd til ansatte) | high | |
| 2703 | Output VAT low rate | Utgående merverdiavgift, lav sats | own name, style of existing rows (2700/2701) | high | |
| 2704 | Output VAT foreign services high | Utgående merverdiavgift tjenester kjøpt fra utlandet, høy sats | own name, style of existing rows | high | reverse-charge role |
| 2705 | Output VAT imported goods high | Utgående merverdiavgift innførsel av varer, høy sats | own name, style of existing rows | high | |
| 2706 | Output VAT imported goods middle | Utgående merverdiavgift innførsel av varer, middels sats | own name, style of existing rows | high | |
| 2707 | Output VAT allowances and gold | Utgående merverdiavgift klimakvoter og gull | own name; "klimakvoter og gull" from NOR codes 91/92 | medium | "allowances" read as emission allowances (klimakvoter) |
| 2709 | Output VAT foreign services low | Utgående merverdiavgift tjenester kjøpt fra utlandet, lav sats | own name, style of existing rows | high | |
| 2713 | Input VAT low rate | Inngående merverdiavgift, lav sats | own name, style of existing rows (2710/2711) | high | |
| 2714 | Input VAT foreign services high | Inngående merverdiavgift tjenester kjøpt fra utlandet, høy sats | own name, style of existing rows | high | |
| 2715 | Input VAT imported goods high | Inngående merverdiavgift innførsel av varer, høy sats | own name, style of existing rows | high | |
| 2716 | Input VAT imported goods middle | Inngående merverdiavgift innførsel av varer, middels sats | own name, style of existing rows | high | |
| 2717 | Input VAT allowances and gold | Inngående merverdiavgift klimakvoter og gull | own name; NOR codes 91/92 | medium | as 2707 |
| 2718 | Input VAT foreign services low | Inngående merverdiavgift tjenester kjøpt fra utlandet, lav sats | own name, style of existing rows | high | |
| 2780 | Accrued employer contribution on accrued wages | Påløpt arbeidsgiveravgift på påløpt lønn | own name, style of existing rows (2770) | high | |
| 2781 | Accrued employer contribution on accrued holiday pay | Påløpt arbeidsgiveravgift på påløpte feriepenger | own name, style of existing rows (2940) | high | |
| 2961 | Goods received not invoiced | Mottatte varer, ikke fakturert | own name, style of existing rows | medium | std ref 2960 (accrued expenses); GRNI role |
| 2965 | Income received in advance | Forskuddsbetalt inntekt | own name, style of existing rows (2900) | high | |
| 3020 | Sales of services, high rate | Salg av tjenester, avgiftspliktig, høy sats | own name, style of existing rows (3000) | high | |
| 3030 | Sales of goods, middle rate | Salg av varer, avgiftspliktig, middels sats | own name, style of existing rows (3000) | high | |
| 3050 | Sales of services, low rate | Salg av tjenester, avgiftspliktig, lav sats | own name, style of existing rows (3000) | high | |
| 4396 | Purchase price variances | Prisavvik på innkjøp | own name, style of existing rows (4395) | medium | NeoERP extension number |
| 7797 | Small payment differences | Små betalingsdifferanser | own name, style of existing rows (7795/7796) | medium | NeoERP extension number |

## Norway tax codes (tax-codes.csv)

| code | English name | proposed local name | source | confidence | note |
|---|---|---|---|---|---|
| NO-MVA-RC-DOM | Purchase of emission allowances or gold, with deduction | Kjøp av klimakvoter eller gull med fradragsrett | NOR code 91 (Kjøp av klimakvoter eller gull med fradragsrett for merverdiavgift) | high | English proposed (machine name now); NOR ENG "Purchase of emissions trading or gold, VAT deductible" |
| NO-MVA-RC-DOM-NODED | Purchase of emission allowances or gold, without deduction | Kjøp av klimakvoter eller gull uten fradragsrett | NOR code 92 | high | English proposed |
| NO-MVA-RC-DOM-SALE | Domestic sales with reverse charge (zero rate) | Innenlandsk omsetning med omvendt avgiftsplikt | NOR code 51 (spelled "avgiftplikt" in source; corrected) | high | English proposed |
| NO-MVA-RC-SVC-12 | Services purchased from abroad with deduction, low rate | Kjøp av tjenester fra utlandet med fradragsrett, lav sats | NOR code 88 | high | English proposed; matches existing NO-MVA-RC-SVC style |
| NO-MVA-RC-SVC-12-NODED | Services purchased from abroad without deduction, low rate | Kjøp av tjenester fra utlandet uten fradragsrett, lav sats | NOR code 89 | high | English proposed |
| NO-MVA-RC-SVC-NODED | Services purchased from abroad without deduction, standard rate | Kjøp av tjenester fra utlandet uten fradragsrett, høy sats | NOR code 87 | high | English proposed |
| NO-MVA-IMPORT-15 | Import of goods with deduction, middle rate (self-assessed) | Innførsel av varer med fradragsrett, middels sats | NOR code 83 (Grunnlag innførsel av varer med fradragsrett for innførselsmerverdiavgift) | medium | Existing local name for IMPORT-25 is "Kjøp av varer fra utlandet med fradragsrett, høy sats"; decide one wording for all import rows. Here follows the official "innførsel" |
| NO-MVA-IMPORT-15-NODED | Import of goods without deduction, middle rate (self-assessed) | Innførsel av varer uten fradragsrett, middels sats | NOR code 84 | medium | same wording question |
| NO-MVA-IMPORT-25-NODED | Import of goods without deduction, standard rate (self-assessed) | Innførsel av varer uten fradragsrett, høy sats | NOR code 82 | medium | same wording question |
| NO-MVA-IMPORT-EXEMPT | Import of goods, no VAT to be calculated | Innførsel av varer som det ikke skal beregnes merverdiavgift av | NOR code 85 (Grunnlag innførsel av varer som det ikke skal beregnes merverdiavgift av) | high | Pack kind EXEMPT/SALES looks odd for a purchase-side code 85; flag for tax review, not a naming issue |
| NO-MVA-IMPORT-PAID-15 | Deduction of VAT paid on import, middle rate | Fradrag for merverdiavgift betalt ved innførsel, middels sats | NOR code 15 (Fradragsberettiget innførselsmerverdiavgift); mirrors existing PAID-25 name | high | |

## Sweden tax codes (tax-codes.csv)

| code | English name | proposed local name | source | confidence | note |
|---|---|---|---|---|---|
| SE-MOMS-25-RENT | Output VAT 25%, rental income under voluntary VAT liability | Utgående moms 25 %, hyresinkomster vid frivillig beskattning | SKV ruta 08 text (Hyresinkomster vid frivillig skattskyldighet) + ruta 10 | high | |
| SE-MOMS-EU-TRIANG | Intermediary sale of goods in EU triangular trade | Mellanmans försäljning av varor vid trepartshandel inom EU | SKV ruta 38 text | medium | verify ruta 37 (inköp) vs 38 (försäljning) |
| SE-MOMS-IMPORT-12 | Import of goods, output VAT 12% (reverse charge) | Import av varor, utgående moms 12 % | SKV ruta 50 (Beskattningsunderlag vid import) / 61 | medium | style of existing SE-MOMS-IMPORT ("Import av varor") |
| SE-MOMS-IMPORT-6 | Import of goods, output VAT 6% (reverse charge) | Import av varor, utgående moms 6 % | SKV ruta 50 / 62 | medium | |
| SE-MOMS-IN-25-CAR50 | Input VAT 25%, 50% deductible (passenger car leasing) | Ingående moms 25 %, 50 % avdragsgill (leasing av personbil) | own name, style of existing rows; ruta 48 (Ingående moms att dra av) | medium | rule basis is momslagen leasing rule, not a ruta text |
| SE-MOMS-IN-25-REP | Input VAT 25%, representation | Ingående moms 25 %, representation | own name, style of existing rows; ruta 48 | medium | |
| SE-MOMS-RC-DOM-GOODS | Domestic purchase of goods, buyer liable (reverse charge) | Inköp av varor i Sverige där köparen är betalningsskyldig för moms | SKV ruta 23 text (Inköp av varor i Sverige som köparen är betalningsskyldig för moms) | high | |
| SE-MOMS-RC-DOM-SALE | Domestic sale, buyer liable for VAT (reverse charge) | Försäljning där köparen är betalningsskyldig för moms i Sverige | SKV ruta 41 (Försäljning av varor/tjänster, omvänd betalningsskyldighet) | medium | exact ruta 41 wording to confirm |
| SE-MOMS-RC-EU-GOODS-12 | Purchase of goods from other EU country, 12% (reverse charge) | Inköp av varor från annat EU-land, 12 % | SKV ruta 20 (Inköp av varor från ett annat EU-land) / 31 | high | |
| SE-MOMS-RC-EU-GOODS-6 | Purchase of goods from other EU country, 6% (reverse charge) | Inköp av varor från annat EU-land, 6 % | SKV ruta 20 / 32 | high | |
| SE-MOMS-SVC-ABROAD | Sale of services to buyer outside Sweden (not EU business) | Försäljning av tjänster som omsätts utomlands | SKV ruta 40 (Övrig försäljning av tjänster omsatta utomlands) | medium | verify ruta 40 vs 39 text |
