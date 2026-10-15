import base
A_="ASSET";L="LIABILITY";E="EQUITY";I="INCOME";X="EXPENSE"
V=""   # review M6: the check state is the check_state column (UNCHECKED/CHECKED), not note text
def build():
    c=base.build(); c.name="pk"
    S=c.set; Ac=c.A
    S("1390",name_en="Long-term security deposits",notes="Utilities, rent and similar deposits")
    S("1475",name_en="Stores, spares and loose tools")
    Ac("1476","Packing materials","",A_,"INVENTORY","INVENTORY")
    S("1600",name_en="Input sales tax - federal (FBR)",notes="Sales Tax Act 1990; adjustable against output tax. "+V)
    Ac("1601","Input sales tax - provincial services","",A_,"TAX_RECEIVABLE","TAX",notes="PRA / SRB / KPRA / BRA; claimable only where the province allows. "+V)
    S("1605",name_en="Input sales tax - reverse charge")
    S("1620",name_en="Income tax deducted by customers (s.153)",notes="Adjustable against annual income tax unless final/minimum regime. "+V)
    Ac("1625","Sales tax withheld by buyers","",A_,"TAX_RECEIVABLE","TAX",notes="Sales Tax Special Procedure (Withholding) Rules. "+V)
    S("1630",name_en="Advance income tax (adjustable)",notes="Instalments s.147 and adjustable advance taxes (e.g. on utilities). "+V)
    Ac("1640","Sales tax refundable / carried forward","",A_,"TAX_RECEIVABLE","TAX")
    S("1940",name_en="Bank - foreign currency account (USD)",notes="Currency rule FIXED (USD by default; change at setup)")
    S("1950",name_en="Card and mobile wallet settlements clearing",notes="Card acquirers and mobile wallets awaiting settlement")
    S("2030",notes="Sole proprietors (AOP/individual); deactivate for private limited companies")
    S("2100",name_en="Staff gratuity obligation",notes="Defined benefit / gratuity schemes (IAS 19)")
    S("2600",name_en="Income tax withheld on salaries (s.149)",notes="Income Tax Ordinance 2001 s.149. "+V)
    S("2610",name_en="Other payroll deductions payable",notes="Loans, advances, union and other third-party deductions")
    S("2700",name_en="Output sales tax - federal (FBR)",notes="Standard rate on goods. "+V)
    Ac("2701","Output sales tax - provincial services","",L,"TAX_PAYABLE","TAX",notes="PST Punjab (PRA), SST Sindh (SRB), KPRA, BRA. "+V)
    Ac("2702","Further tax payable","",L,"TAX_PAYABLE","TAX",notes="Extra rate on supplies to unregistered persons and to registered persons who are not active taxpayers (s.3(1A)), subject to statutory exemptions. "+V)
    S("2705",name_en="Output sales tax - reverse charge")
    S("2740",name_en="Sales tax settlement (FBR and provincial)",notes="Net balance per return; one sub-account per authority may be added by the company")
    S("2750",name_en="Income tax withheld from suppliers (s.153)",notes="Withholding agent obligation. "+V)
    Ac("2751","Income tax withheld on rent (s.155)","",L,"TAX_PAYABLE","TAX",notes=V)
    Ac("2752","Sales tax withheld from suppliers","",L,"TAX_PAYABLE","TAX",notes="As withholding agent, only in the Eleventh Schedule scenarios (template PK-WHT-ST is off by default). "+V)
    Ac("2753","Advance tax collected (s.236G / 236H)","",L,"TAX_PAYABLE","TAX",notes="Collected on sales to distributors, dealers, wholesalers and retailers. "+V)
    Ac("2754","Income tax withheld - other sections","",L,"TAX_PAYABLE","TAX")
    S("2770",name_en="EOBI payable",notes="Employees' Old-Age Benefits Institution. "+V)
    Ac("2771","Provincial employees' social security payable","",L,"PAYROLL_LIABILITY","PAYROLL",notes="PESSI (Punjab), SESSI (Sindh), KP ESSI, BESSI. "+V)
    Ac("2772","Workers' Profit Participation Fund payable","",L,"OTHER_PAYABLE",notes="WPPF, Companies Profits (Workers' Participation) Act 1968. "+V)
    Ac("2773","Workers' Welfare Fund payable","",L,"TAX_PAYABLE",notes="WWF, federal or provincial by jurisdiction. "+V)
    S("2910",name_en="Provident fund payable",notes="Employer + employee contributions owed to the PF trust")
    S("2940",name_en="Accrued leave encashment")
    S("3080",name_en="Sales discounts")
    S("3100",name_en="Exempt and zero-rated sales",notes="Sixth Schedule (exempt) and Fifth Schedule (zero-rated). Counts toward franchise fees (D-A6 flag default true)")
    S("3200",name_en="Export sales (zero-rated)")
    S("5020",name_en="Leave encashment")
    S("5400",name_en="EOBI - employer contribution")
    Ac("5410","Social security - employer contribution","",X,"EMPLOYEE_BENEFITS",notes="PESSI / SESSI / KP ESSI / BESSI")
    S("5420",name_en="Provident fund - employer contribution")
    S("5430",name_en="Gratuity expense")
    S("7620",name_en="Licences, permits and professional tax")
    Ac("7780","Workers' Profit Participation Fund","",X,"OPERATING_EXPENSE",notes=V)
    Ac("7785","Workers' Welfare Fund","",X,"OPERATING_EXPENSE",notes=V)
    Ac("8310","Income tax - final and minimum tax regimes","",X,"INCOME_TAX",dims="",notes="Tax deducted that is final or minimum (not adjustable). "+V)
    # Review M6: per-account sources where a statute governs the account (others keep the SECP presentation default).
    STA="STA 1990 to 30.06.2026"
    for code,src,ev in [
        ("1600","FBR — Sales Tax Act 1990, s.7 (input tax)",STA), ("2700","FBR — Sales Tax Act 1990, s.3 (output tax)",STA),
        ("1640","FBR — Sales Tax Act 1990, s.10 (excess input tax)",STA), ("2740","FBR — Sales Tax Act 1990, sales tax return",STA),
        ("2702","FBR — Sales Tax Act 1990, s.3(1A) (further tax)",STA),
        ("1625","FBR — Sales Tax Act 1990, Eleventh Schedule; Sales Tax Special Procedure (Withholding) Rules",STA),
        ("2752","FBR — Sales Tax Act 1990, Eleventh Schedule",STA),
        ("1601","Provincial authority (PRA, SRB, KPRA or BRA) — sales tax on services law","draft"),
        ("2701","Provincial authority (PRA, SRB, KPRA or BRA) — sales tax on services law","draft"),
        ("1605","Provincial authority — sales tax on services law (reverse charge)","draft"),
        ("2705","Provincial authority — sales tax on services law (reverse charge)","draft"),
        ("1620","FBR — Income Tax Ordinance 2001, s.153","draft"), ("1630","FBR — Income Tax Ordinance 2001, s.147","draft"),
        ("2600","FBR — Income Tax Ordinance 2001, s.149","draft"), ("2750","FBR — Income Tax Ordinance 2001, s.153","draft"),
        ("2751","FBR — Income Tax Ordinance 2001, s.155","draft"), ("2753","FBR — Income Tax Ordinance 2001, s.236G / s.236H","draft"),
        ("8310","FBR — Income Tax Ordinance 2001, final and minimum tax regimes","draft"),
        ("2770","EOBI — Employees' Old-Age Benefits Act 1976","draft"),
        ("2771","Provincial employees' social security law (PESSI, SESSI, KP ESSI, BESSI)","draft"),
        ("2772","Companies Profits (Workers' Participation) Act 1968","draft"), ("7780","Companies Profits (Workers' Participation) Act 1968","draft"),
        ("2773","Workers' Welfare Fund Ordinance 1971 / provincial WWF law","draft"), ("7785","Workers' Welfare Fund Ordinance 1971 / provincial WWF law","draft"),
    ]: S(code,source=src,evidence_version=ev)
    return c
