# NeoERP — target countries

Owner: **Code · ERP lead (trial)** (until 2026-10-10: Cowork · ERP lead). Draft 2026-10-09 for Jabran's approval. Once approved, this is the single source every module lead follows (playbook §5).

## Starting point (already decided)

- **Launch countries (Jabran, 2026-10-05; `accounts-a0.md` §1):** Pakistan, Norway, Sweden and the Nordics.
- **The company's Org country decides** which packs apply. Nobody is asked again in Accounts, HR or Payroll (Jabran 2026-10-05 and 2026-10-09).
- **RP-1:** any ISO country can be enrolled; 13 countries have a full region profile.

## Tiers (proposal)

| Tier | Countries | What a company there gets |
|---|---|---|
| **1: full at launch** | **Pakistan, Norway, Sweden** | Every module with its country packs: Accounts chart and tax codes, statutory exports (H), HR leave pack, Payroll pack and filing files, local labels. |
| **2: Nordic, partial at launch** | **Denmark, Finland** (Iceland: see decision C2) | Org, IAM, HR (base leave pack), ESS, Accounts on the base chart ("country chart coming"; tax codes added by the company). **No Payroll** ("coming" notice) and no statutory exports until their packs exist. |
| **3: can enrol, no packs** | UK, Germany, Netherlands, UAE, Saudi Arabia, Qatar, US, Iceland, and any other ISO country | Same as tier 2. Currency and fiscal year are entered at enrolment. No country packs are planned yet. A country moves up a tier when a paying customer needs it (roadmap gate P11/Q7). |

## Order of country work inside each module

- **Payroll:** PK → NO → SE, all three before launch.
  - PK first: it covers two demo companies and is the simplest regime.
  - NO second: the hardest regime; the engine, payslip lines and filing interface are designed against it from the start.
  - SE third: it reuses Norway's shape.
  - This is the HR & Payroll lead's D1 recommendation, adopted here.
- **Accounts:** packs exist for PK, NO and SE. H (statutory exports) goes per country when that country's first paying customer arrives.
- **Government filing:** v2 produces files for manual upload (A-melding, AGI, PK statements). Direct API submission comes later.

## What "supporting a country" means (checklist per tier-1 country)

- Org region profile (currency, fiscal year, tax ID and registration labels).
- Accounts chart pack and tax pack, each item with a source and a check state.
- HR leave pack (leave types, entitlements, public holidays, working time).
- Payroll pack and a `PayrollCountryProvider` (tax, contributions, holiday pay, pension, filing export).
- Statutory exports (Accounts H) and payroll filings.
- A pilot customer before the country is called ready (P17).

## Open decisions for Jabran

| # | Decision | Recommendation |
|---|---|---|
| C1 | Approve the tiers above | Yes |
| C2 | Iceland: tier 2 (Nordic) or tier 3? | Tier 3 until a customer asks; it is small and has its own payroll rules |
| C3 | UI languages at launch | **Decided (Jabran, 2026-10-15, as recommended):** English first. Norwegian and Swedish screens before the Nordic launch; Urdu not planned |
| C4 | Where data is hosted — **Decided (Jabran, 2026-10-15, as recommended)** (all residency and go-live requirements: `NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md`) | An EU/EEA region for Nordic customers (GDPR); decide hosting for Pakistan separately before its first customer. **Residency facts (ACC-44, verified 2026-10-10):** Iceland allows bookkeeping records abroad for at most 6 months (lög 145/1994); Norway allows storage in the EEA, UK or Switzerland with notice (bokføringsforskriften § 7-5); Finland requires records to be inspectable from Finland. An EU/EEA region meets NO and FI; IS needs a copy in Iceland or an Iceland-reachable arrangement within 6 months, to be decided with the provider. Customer uploads stay off in NO and IS until C4 is decided (G-6). |
