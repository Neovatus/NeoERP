TCOLS=["country","jurisdiction","code","name_en","name_local","kind","rate_percent","applies_to","output_role","input_role","output_account","input_account","report_ref","valid_from","notes","source","evidence_version","check_state","active"]
# 2026-10-06: no accountant review. Every code names its official source (column "source") and the edition of it
# (evidence_version); check_state is UNCHECKED until NeoERP has checked the code against that source (review M6).
# active: whether the template is copied switched on. Default: on when a rate is set (or EXEMPT); OFF overrides below.
VPK=VNO=VSE=""
PROV="Provincial authority (PRA, SRB, KPRA or BRA) — provincial sales tax on services law"
SRC={"PK-ST-18":"FBR — Sales Tax Act 1990, s.3","PK-ST-RED":"FBR — Sales Tax Act 1990, Eighth Schedule","PK-ST-ZERO":"FBR — Sales Tax Act 1990, Fifth Schedule",
 "PK-ST-EXEMPT":"FBR — Sales Tax Act 1990, Sixth Schedule","PK-ST-FURTHER":"FBR — Sales Tax Act 1990, s.3(1A)","PK-ST-IN":"FBR — Sales Tax Act 1990, s.7",
 "PK-PST-PB":"PRA — Punjab Sales Tax on Services Act 2012","PK-SST-SD":"SRB — Sindh Sales Tax on Services Act 2011",
 "PK-ST-KP":"KPRA — Khyber Pakhtunkhwa sales tax on services law","PK-ST-BA":"BRA — Balochistan Sales Tax on Services Act 2015",
 "PK-PST-IN":PROV,"PK-ST-RC":PROV,
 "PK-WHT-153-GOODS":"FBR — Income Tax Ordinance 2001, s.153(1)(a)","PK-WHT-153-SVC":"FBR — Income Tax Ordinance 2001, s.153(1)(b)",
 "PK-WHT-155":"FBR — Income Tax Ordinance 2001, s.155","PK-WHT-ST":"FBR — Sales Tax Act 1990, Eleventh Schedule","PK-WHT-BY-CUST":"FBR — Income Tax Ordinance 2001, s.153"}
STA="STA 1990 to 30.06.2026"   # FBR consolidated Sales Tax Act 1990, updated up to 30.06.2026
EVPK={c:STA for c in("PK-ST-18","PK-ST-RED","PK-ST-ZERO","PK-ST-EXEMPT","PK-ST-FURTHER","PK-ST-IN","PK-WHT-ST")}
def evidence(country,code):
    if country=="NO": return "Skatteetaten mva-melding information model (2026); SAF-T Financial 1.30"
    if country=="SE": return "draft"
    return EVPK.get(code,"draft")
OFF={"PK-WHT-ST"}   # review M9: inactive until the company confirms an Eleventh Schedule scenario applies
def source(country,code,ref):
    if country=="NO": return "Skatteetaten — SAF-T standard tax "+ref[len("SAF-T "):].split(" (")[0]+" (mva-melding information model)"
    if country=="SE": return "Skatteverket — momsdeklaration, "+ref
    return SRC[code]
JUR={"PK-PST-PB":"PK-PB","PK-SST-SD":"PK-SD","PK-ST-KP":"PK-KP","PK-ST-BA":"PK-BA","PK-PST-IN":"PK-PROV","PK-ST-RC":"PK-PROV"}
def T(country,code,en,loc,kind,rate,applies,orole,irole,oacc,iacc,ref,vf,notes):
    # jurisdiction = the tax authority whose return the code feeds (review fix R6). PK-PROV = province chosen on the company's copy.
    jur=JUR.get(code, "PK-FED" if country=="PK" else country)
    active="false" if code in OFF else ("true" if rate!="" or kind=="EXEMPT" else "false")
    return dict(zip(TCOLS,[country,jur,code,en,loc,kind,rate,applies,orole,irole,oacc,iacc,ref,vf,notes.strip(),source(country,code,ref),
                           evidence(country,code),"UNCHECKED",active]))
ROWS=[
 # Pakistan (federal sales tax on goods; provincial sales tax on services; withholding)
 T("PK","PK-ST-18","Sales tax - standard rate (goods)","","OUTPUT","18","SALES","SALES_TAX_OUTPUT","","2700","","FBR sales tax return","2025-07-01","Sales Tax Act 1990 s.3. "+VPK),
 T("PK","PK-ST-RED","Sales tax - reduced rate (Eighth Schedule)","","OUTPUT","","SALES","SALES_TAX_OUTPUT","","2700","","FBR sales tax return","","No default rate: rate is item-specific; code stays inactive until the company sets it. "+VPK),
 T("PK","PK-ST-ZERO","Sales tax - zero-rated (Fifth Schedule)","","ZERO","0","SALES","SALES_TAX_OUTPUT","","2700","","FBR sales tax return","2025-07-01","Input tax remains claimable. "+VPK),
 T("PK","PK-ST-EXEMPT","Sales tax - exempt (Sixth Schedule)","","EXEMPT","0","SALES","","","","","FBR sales tax return","2025-07-01","Input tax attributable to exempt supplies is not claimable (apportionment). "+VPK),
 T("PK","PK-ST-FURTHER","Further tax - supplies to unregistered persons and registered non-active taxpayers","","OUTPUT","4","SALES","SALES_TAX_OUTPUT","","2702","","FBR sales tax return","2025-07-01","Sales Tax Act 1990 s.3(1A): charged in addition to the standard rate on taxable supplies to persons who are not registered, and to registered persons who are not active taxpayers, subject to the statutory exemptions. Rate changed in recent budgets. "+VPK),
 T("PK","PK-ST-IN","Input sales tax (federal)","","INPUT","18","PURCHASES","","SALES_TAX_INPUT","","1600","FBR sales tax return (Annex-A)","2025-07-01","Amount taken from the supplier's invoice; rate shown is the default. "+VPK),
 T("PK","PK-PST-PB","Punjab sales tax on services (PRA)","","OUTPUT","16","SALES","SALES_TAX_OUTPUT","","2701","","PRA return","2025-07-01","Jurisdiction PK-Punjab; reduced rates apply to some services. "+VPK),
 T("PK","PK-SST-SD","Sindh sales tax on services (SRB)","","OUTPUT","15","SALES","SALES_TAX_OUTPUT","","2701","","SRB return","2025-07-01","Jurisdiction PK-Sindh. "+VPK),
 T("PK","PK-ST-KP","KP sales tax on services (KPRA)","","OUTPUT","15","SALES","SALES_TAX_OUTPUT","","2701","","KPRA return","2025-07-01","Jurisdiction PK-KP. "+VPK),
 T("PK","PK-ST-BA","Balochistan sales tax on services (BRA)","","OUTPUT","15","SALES","SALES_TAX_OUTPUT","","2701","","BRA return","2025-07-01","Jurisdiction PK-Balochistan. "+VPK),
 T("PK","PK-PST-IN","Input provincial sales tax on services","","INPUT","","PURCHASES","","SALES_TAX_INPUT","","1601","Provincial return","","Amount taken from the supplier's invoice; claimability depends on the province. "+VPK),
 T("PK","PK-ST-RC","Sales tax - reverse charge (services)","","REVERSE_CHARGE","","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2705","1605","Provincial return","","Buyer self-assesses where provincial law requires (e.g. some Sindh services). Rate per province; inactive until set. "+VPK),
 T("PK","PK-WHT-153-GOODS","Income tax withholding - supply of goods (s.153(1)(a))","","WITHHOLDING","","PURCHASES","WHT_PAYABLE","","2750","","Withholding statement (s.165)","","Rate depends on payee type and active-taxpayer status; set per supplier. Not a sales tax: reduces the amount paid to the supplier. "+VPK),
 T("PK","PK-WHT-153-SVC","Income tax withholding - services (s.153(1)(b))","","WITHHOLDING","","PURCHASES","WHT_PAYABLE","","2750","","Withholding statement (s.165)","","Rate depends on service type, payee type and status. "+VPK),
 T("PK","PK-WHT-155","Income tax withholding - rent (s.155)","","WITHHOLDING","","PURCHASES","WHT_PAYABLE","","2751","","Withholding statement (s.165)","","Slab rates. "+VPK),
 T("PK","PK-WHT-ST","Sales tax withholding - Eleventh Schedule (1/5 of sales tax)","","WITHHOLDING","20","PURCHASES","WHT_PAYABLE","","2752","","FBR sales tax return","2025-07-01","Inactive by default. Applies only to the withholding-agent / supplier scenarios listed in the Eleventh Schedule; other listed scenarios use other fractions (e.g. one-tenth) or full withholding. 20% is a fraction of the sales tax amount, not of the price. Supplies by active taxpayers to registered persons are generally excluded, with listed exceptions. Do not switch on from agent registration alone: confirm the scenario per supplier. "+VPK),
 T("PK","PK-WHT-BY-CUST","Income tax deducted by customer (s.153)","","WITHHOLDING","","SALES","","WHT_RECEIVABLE","","1620","Annual return (adjustable)","","Receipt is short-paid by this amount; asset adjustable against income tax unless final regime. Salary withholding (s.149) is handled by Payroll, not a tax code. "+VPK),
 # Norway
 T("NO","NO-MVA-25","Output VAT, standard rate","Utgående mva, høy sats","OUTPUT","25","SALES","SALES_TAX_OUTPUT","","2700","","SAF-T code 3","2025-01-01",VNO),
 T("NO","NO-MVA-15","Output VAT, food rate","Utgående mva, middels sats","OUTPUT","15","SALES","SALES_TAX_OUTPUT","","2701","","SAF-T code 31","2025-01-01","Food and drink. "+VNO),
 T("NO","NO-MVA-12","Output VAT, low rate","Utgående mva, lav sats","OUTPUT","12","SALES","SALES_TAX_OUTPUT","","2702","","SAF-T code 33","2025-01-01","Passenger transport, accommodation, cinema and similar. "+VNO),
 T("NO","NO-MVA-0","Zero-rated domestic sale","Fritatt for mva (nullsats)","ZERO","0","SALES","SALES_TAX_OUTPUT","","2700","","SAF-T code 5","2025-01-01",VNO),
 T("NO","NO-MVA-EXPORT","Export of goods and services","Utførsel av varer og tjenester","ZERO","0","SALES","SALES_TAX_OUTPUT","","2700","","SAF-T code 52","2025-01-01",VNO),
 T("NO","NO-MVA-EXEMPT","Outside the VAT Act","Utenfor merverdiavgiftsloven","EXEMPT","0","SALES","","","","","SAF-T code 6","2025-01-01","No input VAT deduction for related costs. "+VNO),
 T("NO","NO-MVA-IN-25","Input VAT, standard rate","Inngående mva, høy sats","INPUT","25","PURCHASES","","SALES_TAX_INPUT","","2710","SAF-T code 1","2025-01-01",VNO),
 T("NO","NO-MVA-IN-15","Input VAT, food rate","Inngående mva, middels sats","INPUT","15","PURCHASES","","SALES_TAX_INPUT","","2711","SAF-T code 11","2025-01-01",VNO),
 T("NO","NO-MVA-IN-12","Input VAT, low rate","Inngående mva, lav sats","INPUT","12","PURCHASES","","SALES_TAX_INPUT","","2712","SAF-T code 13","2025-01-01",VNO),
 T("NO","NO-MVA-RC-SVC","Services purchased from abroad (reverse charge)","Kjøp av tjenester fra utlandet","REVERSE_CHARGE","25","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2703","2714","SAF-T code 86 (with deduction)","2025-01-01","Self-assessed output and deductible input in the same return. "+VNO),
 T("NO","NO-MVA-IMPORT-25","Import of goods with deduction, standard rate (self-assessed)","Kjøp av varer fra utlandet med fradragsrett, høy sats","REVERSE_CHARGE","25","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2703","2714","SAF-T code 81","2025-01-01","Import VAT the company calculates and reports itself in the VAT return (basis: customs value plus duties). Code 81 carries both lines: the calculated VAT (output, 2703) and the deduction (input, 2714) on the same code; there is no separate standard code for the deduction. A company may add separate import accounts. "+VNO),
 T("NO","NO-MVA-IMPORT-PAID-25","Deduction of VAT paid on import, standard rate","Fradrag for merverdiavgift betalt ved innførsel, høy sats","INPUT","25","PURCHASES","","SALES_TAX_INPUT","","2710","SAF-T code 14","2025-01-01","Deduction only, for import VAT already paid at the border (e.g. on a customs or forwarder invoice). The return line carries the VAT amount only, no basis or rate: enter the amount from the customs document; the rate is a default for checking. No output line. Food-rate imports use code 15 (not in this template). "+VNO),
 # Sweden
 T("SE","SE-MOMS-25","Output VAT 25%","Utgående moms 25 %","OUTPUT","25","SALES","SALES_TAX_OUTPUT","","2611","","Ruta 05 / 10","2025-01-01",VSE),
 T("SE","SE-MOMS-12","Output VAT 12%","Utgående moms 12 %","OUTPUT","12","SALES","SALES_TAX_OUTPUT","","2621","","Ruta 05 / 11","2025-01-01","Hotels, restaurants and (outside the temporary reduction) food. "+VSE),
 T("SE","SE-MOMS-6","Output VAT 6%","Utgående moms 6 %","OUTPUT","6","SALES","SALES_TAX_OUTPUT","","2631","","Ruta 05 / 12","2025-01-01","Books, newspapers, passenger transport, culture. A temporary cut of food VAT from 12% to 6% (announced for 2026-04-01 to 2027-12-31) changes which items use this code. "+VSE),
 T("SE","SE-MOMS-EXEMPT","VAT-exempt sale","Momsfri försäljning","EXEMPT","0","SALES","","","","","Ruta 42","2025-01-01","No input VAT deduction for related costs. "+VSE),
 T("SE","SE-MOMS-EXPORT","Export of goods outside the EU","Export av varor utanför EU","ZERO","0","SALES","SALES_TAX_OUTPUT","","2611","","Ruta 36","2025-01-01",VSE),
 T("SE","SE-MOMS-EU-GOODS","Sale of goods to VAT-registered buyer in other EU country","Varuförsäljning till annat EU-land","ZERO","0","SALES","SALES_TAX_OUTPUT","","2611","","Ruta 35","2025-01-01","Also reported in the EC sales list (periodisk sammanställning). "+VSE),
 T("SE","SE-MOMS-EU-SVC","Sale of services to business in other EU country","Tjänsteförsäljning till annat EU-land","ZERO","0","SALES","SALES_TAX_OUTPUT","","2611","","Ruta 39","2025-01-01","Buyer accounts for VAT (reverse charge on their side). "+VSE),
 T("SE","SE-MOMS-IN-25","Input VAT 25%","Ingående moms 25 %","INPUT","25","PURCHASES","","SALES_TAX_INPUT","","2641","Ruta 48","2025-01-01",VSE),
 T("SE","SE-MOMS-IN-12","Input VAT 12%","Ingående moms 12 %","INPUT","12","PURCHASES","","SALES_TAX_INPUT","","2641","Ruta 48","2025-01-01",VSE),
 T("SE","SE-MOMS-IN-6","Input VAT 6%","Ingående moms 6 %","INPUT","6","PURCHASES","","SALES_TAX_INPUT","","2641","Ruta 48","2025-01-01",VSE),
 T("SE","SE-MOMS-RC-EU-GOODS","Purchase of goods from other EU country (reverse charge)","Inköp av varor från annat EU-land","REVERSE_CHARGE","25","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2614","2645","Ruta 20 / 30 / 48","2025-01-01",VSE),
 T("SE","SE-MOMS-RC-EU-SVC","Purchase of services from other EU country (reverse charge)","Inköp av tjänster från annat EU-land","REVERSE_CHARGE","25","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2614","2645","Ruta 21 / 30 / 48","2025-01-01",VSE),
 T("SE","SE-MOMS-RC-NONEU-SVC","Purchase of services from outside the EU (reverse charge)","Inköp av tjänster från land utanför EU","REVERSE_CHARGE","25","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2614","2645","Ruta 22 / 30 / 48","2025-01-01",VSE),
 T("SE","SE-MOMS-RC-DOM","Domestic reverse charge (e.g. construction services)","Omvänd skattskyldighet inom Sverige","REVERSE_CHARGE","25","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2614","2647","Ruta 24 / 30 / 48","2025-01-01",VSE),
 T("SE","SE-MOMS-IMPORT","Import of goods (reverse charge)","Import av varor","REVERSE_CHARGE","25","PURCHASES","SALES_TAX_OUTPUT_RC","SALES_TAX_INPUT_RC","2615","2645","Ruta 50 / 60 / 48","2025-01-01",VSE),
]
