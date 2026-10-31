# NeoERP e-invoicing and electronic-reporting readiness

Research cut-off: **31 October 2026**. Countries: **NO, SE, DK, FI, IS, PK**. This is research and a proposed delivery backlog, not implementation approval or a certification of compliance.

## Decision

Use **one contracted Peppol access-point provider for the Nordics**, with NemHandel/OIOUBL and Finnish operator-network coverage explicitly included, and a **separate FBR licensed-integrator/PRAL adapter for Pakistan**. Keep invoice delivery, fiscal acceptance and statutory-return submission as separate processes. Build the shared sender and receiving inbox together; an emailed PDF is not a structured e-invoice.

The existing [document-output contract](../../../NeoERP-BackEnd/docs/api/accounts-docout.md) already selects this general architecture, but it is not built. Its outstanding provider/security decisions and several mapping assumptions need resolving. The invoice/bill schema is useful groundwork; it does not establish functioning network delivery, inbound mapping, tax filing or FBR fiscalisation.

The dated 2027 mandate/change inventory already exists in the [2027 changes report](../codex-2027-changes/report.md). **Use its NO-1–6, DK-1–2 and country sections for the detailed year-boundary changes; they are not reproduced here.** This report adds exchange scope, technical requirements, gaps and sequencing.

## Evidence and reading key

Reviewed workspace `master` HEAD `9430942170c999d1c2554831f32c68eed7835634`; backend `dev` HEAD `2cc842303f9e9ec6ce4f2020595544dbd8c83b25` (clean at inspection). These are source snapshots, not deployment evidence. The requested workspace is `/Users/jabransiddiqui/Offices/Neovatus/NeoERP`, distinct from the default path with `jabran-siddiqui`.

Read the requested [roadmap](../../../NeoERP-BackEnd/docs/api/accounts-roadmap.md), [B: customers, sales invoices and credit notes](../../../NeoERP-BackEnd/docs/api/accounts-b.md), [C: suppliers and bills](../../../NeoERP-BackEnd/docs/api/accounts-c.md), [Docout](../../../NeoERP-BackEnd/docs/api/accounts-docout.md), and the existing 2027 report. Targeted implementation checks:

- [V26 receivables schema](../../../NeoERP-BackEnd/services/accounts-service/src/main/resources/db/migration/V26__b_receivables.sql): party snapshots, lines/taxes, payment-reference and fiscal columns/outbox.
- [V31 payables schema](../../../NeoERP-BackEnd/services/accounts-service/src/main/resources/db/migration/V31__c_payables.sql): supplier identity, bill references, tax/deduction fields.
- [Invoice input models](../../../NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/receivables/document/ArDocumentModels.kt): one untyped `reference`, line UoM/HS/sale-type/SRO fields.
- [Approval service](../../../NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/receivables/document/ArDocumentApprovalService.kt): frozen seller/customer data, but approval currently assigns `FiscalStatus.NOT_REQUIRED`.

“Present” below means found in the inspected schema/input or current code, not complete production capability. “Contracted” means specified in B/C/Docout but not demonstrated implemented. Scope of electronic reports: VAT/transaction reports, statutory accounting exports and their acknowledgements. Payroll and sector-specific filings remain separate workstreams.

## 1. Country mandates, directions and dates

### NO — Norway

| Area | Date / status and scope | Official evidence / NeoERP consequence |
|---|---|---|
| B2G receiving and supplier sending | Procurement regulation effective **2 April 2019**, applying to procurements initiated after commencement. Public buyers receive/process structured invoices; supplier contracts must require conforming invoices. | [Regulation §§4–7](https://lovdata.no/nav/forskrift/2019-04-01-444). Implement EHF/BIS and Peppol routing for covered public customers; do not use an approximate “1 April” commencement. |
| B2B sending / receiving | **2027-01-01 sending; 2030-01-01 receiving**, enacted rather than merely a plan. Applicability, transition and exemptions are already recorded under [NO-1 and “Later”](../codex-2027-changes/report.md#no--norway). | [Skatteetaten final regulations, 30 September 2026](https://www.skatteetaten.no/nn/rettskjelder/type/uttalelser/uttalelser/forskrifter-til-lovendringer-om-digital-bokforing-og-e-fakturering/). Encode dated duty and receiver capability; do not treat PDF or a failed lookup as proof that the duty is absent. |
| Reporting distinction | This exchange requirement does not establish a verified invoice-by-invoice tax-clearance API. | VAT-return and SAF-T adapters remain separate (§2). Docout C-27 already makes both sending and receiving a **NeoERP Norway launch gate**, even before the statutory receiving deadline. |

### SE — Sweden

| Area | Date / status and scope | Official evidence / NeoERP consequence |
|---|---|---|
| B2G sending and receiving | For covered public procurement begun **1 April 2019 onward**, suppliers issue electronic invoices; public buyers must accept European-standard invoices. Parties may agree another electronic standard within the rules. | [Public Procurement Agency rules](https://www.upphandlingsmyndigheten.se/digitalisering-och-e-handel/e-handel/regler-for-e-handel-och-e-faktura/). Default new integrations to BIS Billing 3 over Peppol; ordinary emailed PDFs do not satisfy the structured-invoice requirement. |
| State-authority network requirements | DIGG rules cover state-authority Peppol registration, reception and sending; older Svefaktura relationships have transitional treatment. | [MDFFS 2021:1 §§19–21](https://www.digg.se/download/18.129a4fef1939e2e1c1f2195d/1653918115697/DIGGs-foreskrifter-om-hantering-av-best%C3%A4llningar-och-standarder-vid-elektroniskt-informationsutbyte.pdf). This is more precise than Docout C-9's unverified “all Swedish B2G only BIS3 since 2025”. |
| B2B | No enacted blanket domestic sending/receiving date verified at the cut-off. Covered intra-EU transaction reporting/e-invoicing starts **1 July 2030**; domestic extension remains undecided. | [Skatteverket ViDA guidance](https://www.skatteverket.se/foretag/internationellt/transaktionsbaseradrapporteringochefakturering.4.386bd4b919276cc86c42b3f.html). Support customer-required structured invoices now; keep future reporting configurable. |
| Svefaktura | SFTI withdrew recommendation for **Svefaktura 1.0 on 1 April 2021**, and Svefaktura BIS5A 2.0 on **31 December 2019**. | [SFTI withdrawn standards](https://sfti.se/sfti/standarder/avfordameddelandenochhandledningar/avfordameddelanden.52834.html). No new Svefaktura writer. Legacy inbound conversion only if pilot evidence requires it. |

### DK — Denmark

| Area | Date / status and scope | Official evidence / NeoERP consequence |
|---|---|---|
| B2G sending / receiving | Electronic invoicing to public authorities since **1 February 2005**. | [Official municipality guidance](https://bornholm.dk/om-kommunen/leverandoer-til-kommunen/elektronisk-faktura-send-regning-til-kommunen), [ERST NemHandel infrastructure](https://erhvervsstyrelsen.dk/nemhandel-faelles-digital-infrastruktur). Support recipient identifiers, OIOUBL and Peppol routes. |
| B2B / system capability | A blanket duty to use structured invoices for every B2B sale was not verified. Digital-bookkeeping system rules require invoice/credit-note exchange capability in **both OIOUBL and Peppol BIS**, including relevant responses. | [Current ERST registered-system guidance §6.3](https://erhvervsstyrelsen.dk/vejledning-vejledning-til-udbydere-af-digitale-standard-bogfoeringssystemer). Buying AP transport alone does not meet NeoERP's system obligations. User acceptance is required before purchase invoices are booked. |
| Enrolment and bookkeeping changes | Existing dated obligations and urgency are [DK-1–2](../codex-2027-changes/report.md#dk--denmark), including the **1 March 2027** facilitation milestone. | Keep registration readiness separate from a claim that all Danish businesses must send B2B invoices on that date. |
| OIOUBL transition | **Planned 2028–2029**, expected completion mid-2029: **OIOUBL 2.1 → Nemhandel BIS 4**, with Danish extensions. OIOUBL 3 invoice package cancelled; OIOUBL 2.1 maintained meanwhile. No fixed January 2027 replacement date verified. | [ERST document strategy, March 2026, pp9–11](https://nemhandel.dk/sites/default/files/2026-03/Dokumentstrategi_h%C3%B8ringsnotat_ERST_040326_alirodocs-a_WA.pdf). BIS3 does not replace all existing Danish payment-automation content. Keep current dual-format support; reserve a separately versioned BIS4 adapter. |

### FI — Finland

| Area | Date / status and scope | Official evidence / NeoERP consequence |
|---|---|---|
| Public receiving | Covered central bodies from **1 April 2019**; other covered contracting entities from **1 April 2020**. | [Act 241/2019 §§2–5](https://finlex.fi/fi/lainsaadanto/2019/241). Public receiving obligation is distinct from a universal supplier sending mandate. |
| B2B and public right to request | From **1 April 2020**, covered businesses/contracting entities can request an EN16931 invoice from a covered issuer; statutory business definition uses turnover **over EUR10,000**. | [Same Act](https://finlex.fi/fi/lainsaadanto/2019/241). Store request/applicability evidence; avoid implementing this as unconditional B2B compulsion or checking only the buyer's threshold. |
| State procurement / formats | State validation of European-standard invoices from **April 2021**. Finvoice 3.0 and TEAPPSXML 3.0 can carry the required semantics. | [State Treasury validation notice](https://www.valtiokonttori.fi/en/uutinen/validation-of-the-correctness-of-e-invoices-that-are-compliant-with-the-european-standard-starts-in-april/). Confirm customer routing and their invoice/order references. |
| Domestic network coverage | Finvoice **3.0**, implementation guide **v2.6, 16 September 2025**; bank/payment-institution/operator forwarding remains relevant. | [Finvoice standard owner](https://www.finanssiala.fi/en/topics/finvoice-standard/), [implementation guide](https://file.finanssiala.fi/finvoice/Finvoice_3_0_implementation_guidelines.pdf). Buy Finvoice interoperability/conversion where recipients are outside Peppol; schema validity alone does not prove EN16931 completeness. |
| Future policy | No blanket 2027 B2B mandate verified. The **27 May 2026** assessment update expressly says it is **not an ongoing legislative project**. | [State Treasury assessment update](https://www.valtiokonttori.fi/en/uutinen/opinions-on-the-state-treasury-prepared-assessment-memorandum-on-electronic-business-vouchers-have-been-processed/). Intra-EU reporting milestone is addressed in §2. |

### IS — Iceland

| Area | Date / status and scope | Official evidence / NeoERP consequence |
|---|---|---|
| Statutory B2G receiving | State bodies by **18 April 2019**; municipalities/other covered bodies by **18 April 2020**. | [Regulation 44/2019 §8](https://adverts.stjornartidindi.is/B_nr_44_2019.pdf). Implement European-standard invoice reception for covered entities. |
| Sending to the state | State purchasing requires electronic XML through messaging operators from **1 January 2020**; emailed PDFs are not accepted. | [Ministry/Financial Management Authority announcement, 23 December 2019](https://island.is/frett/Allir-reikningar-rafraenir-fra-aramotum). Describe this as state procurement policy, rather than claiming a universal statutory supplier mandate. |
| B2B / format | No general B2B/B2C sending, receiving or invoice-level tax-reporting obligation verified. Peppol BIS3 / TS-236 local CIUS is the relevant interoperability baseline. | [European Commission Iceland factsheet](https://ec.europa.eu/digital-building-blocks/sites/pages/viewpage.action?navigatingVersions=true&pageId=905217801). Obtain current Icelandic validator/recipient conditions from the provider; do not invent an “IS-R” ruleset. No new 2027 general mandate verified. |

### PK — Pakistan

FBR Digital Invoicing is **fiscal submission**, not a Peppol delivery network. The public/private status of the buyer does not replace seller registration and transaction-scope checks.

[FBR SRO1852(I)/2025, 24 September 2025](https://download1.fbr.gov.pk/SROs/2025924149054920SRO1852.pdf) supersedes SRO1413 and gives these **latest verified general issuance dates**:

| Category of sales-tax-registered person | Issue by |
|---|---|
| Public companies; other companies above PKR1bn turnover; all importers | **1 November 2025** |
| Other companies above PKR100m through PKR1bn | **15 November 2025** |
| Other companies up to PKR100m | **1 December 2025** |
| Individuals/AOP above PKR100m | **1 November 2025** |
| Remaining registered persons | **31 December 2025** |

Turnover is based on sales-tax returns for the last twelve months. Registration/testing deadlines are separate columns in the SRO. These dates have passed; they are not a new 2027 rollout. Check current notifications and any taxpayer-specific extension before production.

The [FBR FAQ](https://fbr.gov.pk/faqs/173967/173969) confirms licensed-integrator integration and **PRAL free integration on demand** under rule150XF; its early June/July2025 dates are superseded by the later SRO. Annexure-C sales, including exports, are in scope. Do not automatically apply federal goods/sales-tax rules to provincial services-tax systems. No general FBR supplier-invoice inbox API was verified; incoming bills require separate intake and reconciliation. Existing PK-3 and fiscal print/retention concerns are linked in the [2027 report](../codex-2027-changes/report.md#pk--pakistan).

**API integration baseline.** The [official technical page](https://www.fbr.gov.pk/di-technical-assistance/173967/173970) links [DI API v1.12](https://download1.fbr.gov.pk/Docs/20257301172130815TechnicalDocumentationforDIAPIV1.12.pdf). Verified indexed material describes JSON, Bearer token, production `https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata` and sandbox `postinvoicedata_sb`. Header data includes invoice type/date, seller/buyer NTN/CNIC, name, province/address, registration type and invoice reference. Lines include HS, description, rate, UoM, quantity, values excluding tax/fixed-retail price, sales tax/withholding, further/extra tax, FED, discount, sale type and SRO schedule/item. Reference-data endpoints supply classifications. Whole-PDF retrieval timed out: exact validation endpoint variants, response schema, scenarios, corrections and duplicate/status semantics need re-verification against the current complete specification.

B §6.5 and Docout C-16 already propose `validateinvoicedata`/`postinvoicedata` and reference caches. **Do not turn Docout C-36's unverified “query status or accept duplicate response” into a guaranteed API capability.** On ambiguous timeout, reconcile through the integrator before resubmission; a local idempotency key is not proof of FBR exactly-once processing. Acceptance must supply the fiscal invoice number before buyer issue. Credit/debit corrections need the authority-supported mechanism and original fiscal reference, not merely an internal journal reversal.

## 2. Electronic reports: a separate integration track

Receiving an invoice, getting an AP receipt, filing a VAT return and receiving the tax authority's final acknowledgement are different events. The current roadmap puts returns/statutory exports in **Phase6 (E/H)** after document output; an AP provider does not supply these capabilities automatically.

| Country | What NeoERP needs to send and receive | Official evidence / date |
|---|---|---|
| NO | VAT-return validation, authenticated submission, completion and feedback retrieval. Implement delegated authority and filing receipts; do not assume machine-only credentials suffice. SAF-T is an audit/export path, not an invoice feed or routine per-invoice clearance. | [Tax authority's VAT API flow](https://github.com/Skatteetaten/mva-meldingen/blob/master/docs/english/api/index.md) describes ID-porten/Altinn3 instance flow. [SAF-T authority guidance](https://www.skatteetaten.no/en/business-and-organisation/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-financial/) establishes the **2020-01-01** baseline and audit-request submission. Current schema/channel/access changes superseding older guidance are **NO-3–6 in the [2027 report](../codex-2027-changes/report.md#no--norway)**; revalidate the live auth/channel contract before build. |
| SE | VAT API sends a declaration draft; authorised representative signs at Skatteverket. Retrieve acknowledgement/status; support replacement declarations. XML upload remains a useful first delivery option. SIE is accounting exchange, not tax-authority invoice submission. | [Skatteverket VAT filing guidance](https://www.skatteverket.se/foretagochorganisationer/moms/deklareraochbetalamoms.4.7459477810df5bccdd480006935.html). Current operational channel, not a new2027 obligation. |
| DK | NemVirksomhed VAT APIs transfer data for open periods to TastSelv; the user approves and NeoERP can obtain a receipt. SAF-T and registered-bookkeeping compliance are separate deliverables. | [Skattestyrelsen API guidance](https://skat.dk/erhverv/moms/moms-saadan-goer-du/saadan-laver-du-din-virksomheds-momsregnskab/api-loesning-til-momsindberetning). Existing service; new dated system/export gates are [DK-1–2](../codex-2027-changes/report.md#dk--denmark). |
| FI | Use Vero API for supported return operations or ApitamoPKI/Ilmoitin for specified return files; obtain API rights/certificates and preserve validation/filing feedback. Select actual VAT record descriptions, rather than assuming arbitrary XML is accepted. | [Vero developer services, updated 9 October2026](https://www.vero.fi/en/About-us/it_developer/). Existing services. No verified replacement of VAT returns by a general2027 invoice feed. |
| IS | VAT SOAP/XML adapter: validation, submission, correction, VAT-number lookup and receipt retrieval; register the software version string with RSK and complete tests before production. | [Skatturinn VAT web service](https://www.skatturinn.is/fagadilar/hugbunadarhus/virdisaukaskattur-vefthjonusta/nr/216): `VilluprofaVSKSkyrslu`, `SkilaVSKSkyrslu`, `LeidrettaVSKSkyrslu`, `NaIYfilysinguRSK`. Existing service; proposed period/import reforms remain the [2027 report's IS-6 watch](../codex-2027-changes/report.md#is--iceland). |
| PK | Real-time sales fiscal reports through DI plus separately prepared/reconciled sales-tax returns, Annex-A purchases/Annex-C sales and withholding reports where applicable. Store FBR response IDs/status and reconcile accepted sales to the ledger and return. Receiving a supplier invoice does not mean NeoERP should submit it as its own sale. | [FBR DI FAQ](https://fbr.gov.pk/faqs/173967/173969), [technical assistance](https://www.fbr.gov.pk/di-technical-assistance/173967/173970). DI does not prove return filing completion; no general electronic-purchases mailbox verified. Federal/provincial reporting must be scoped separately. |

For **SE/DK/FI**, EU ViDA was adopted **11 March2025**: cross-border intra-EU B2B digital reporting/e-invoicing from **1 July2030**; alignment of existing domestic real-time systems by **1 January2035**. These are not blanket domestic2027 deadlines, and do not automatically apply to NO/IS/PK. [European Commission timeline](https://taxation-customs.ec.europa.eu/taxation/vat/vat-digital-age-vida_en), [enacted Directive2025/516](https://eur-lex.europa.eu/eli/dir/2025/516/oj). Future country authority APIs remain a later dependency, not something today's Peppol send method implements.

## 3. Standards, country rules and identifiers

**BIS Billing3.0 is itself an EN16931 CIUS**, using UBL Invoice/CreditNote; it is not just any UBL XML. At the cut-off the published baseline is **3.0.21, May2026**, mandatory **17 August2026**. Pin the schema, EN16931 and Peppol Schematron, code lists and applicable country rules as one release bundle; record its version on validation/issue. [OpenPeppol release register](https://peppol.org/documentation/technical-documentation/post-award-documentation/), [BIS specification](https://docs.peppol.eu/poacc/billing/3.0/bis/).

Use the standard CustomizationID `urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0` and billing ProfileID `urn:fdc:peppol.eu:2017:poacc:billing:01:1.0`; document and process identifiers must match registered receiver capability. [UBL header specification](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/).

Country/legacy distinctions:

- **EHF Billing3** is Norway's BIS3 implementation, with NO national rules; no second invented EHF payload model.
- **OIOUBL2.1** is a separate Danish legacy specification/profile family, not a switch that makes BIS3 equivalent. Maintain its own validation and response handling.
- **Svefaktura** is legacy, not the Swedish CIUS to implement for new business. Use BIS3 with applicable SE rules.
- **Finvoice3** requires a separate representation/conversion and EN16931 semantic checks; **TS-236** requirements need an Icelandic/provider conformance fixture.

The [Peppol national rules](https://docs.peppol.eu/poacc/billing/3.0/rules/ubl-peppol/) require, among other things, Norway's `NO…MVA` VAT format; Danish CVR/scheme and permitted payment means; Swedish VAT/organisation-number formats and control digits. Rule applicability depends on seller/buyer country, not just NeoERP's tenant pack. Tax categories, legal text and identifiers must be frozen with the invoice.

### Participant/address data

[OpenPeppol participant code list v9.7, 2 July2026](https://docs.peppol.eu/edelivery/codelists/v9.7/Peppol%20Code%20Lists%20-%20Participant%20identifier%20schemes%20v9.7.html) governs network participants; [BIS EAS list](https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/) governs electronic addresses in XML. Preserve scheme and value separately, plus verification/provenance.

| Country / use | Scheme and value shape | Required handling |
|---|---|---|
| NO organisation | `0192`, nine-digit organisasjonsnummer | Validate number; discover receiving capabilities through SMP/ELMA-backed lookup. |
| SE organisation | `0007`, ten-digit organisationsnummer | Preserve leading zeros; no punctuation; checksum. |
| DK CVR | `0184`, eight-digit CVR **without a DK prefix** | Correct Docout C-8's `0184:DK…` example; VAT IDs are a different field. GLN is also common, especially public entities. |
| FI OVT | `0216`, `0037` plus eight-digit Business ID without hyphen, optionally a unit suffix | `0037` is part of the address value, **not the current endpoint scheme**. |
| IS kennitala | `0196`, ten-digit Icelandic identifier | Resolve Docout C-8's “verify”; validate and verify ownership before registration. |
| GLN | `0088`, thirteen digits | Cross-country alternative; verify ownership and exact receiving unit rather than derive it from VAT ID. |
| DK other identities | `0096` P-number; `0198` SE-number | Use only when actually registered and supported. |
| PK | FBR NTN/CNIC/STRN; no assumed Nordic Peppol scheme | Keep fiscal identities separate from delivery endpoints. |

Finland's authority explicitly specifies **0216 OVT addressing**. [State Treasury Peppol authority](https://www.valtiokonttori.fi/en/services/public-administration-services/the-state-treasury-is-the-finnish-peppol-authority/). Old `0037` scheme registrations are not a valid new-invoice default; historical values may be retained as evidence. Check status/removal dates in the live network code list.

Registration lookup is not identity proof. Require company-authorised onboarding, ownership verification, and a unique active (scheme,value) mapping to the tenant. Verify the receiving AP/SMP migration process; do not publish another tenant's address or silently seize an existing registration.

## 4. BIS field-gap table

Sources of obligations: [UBL header](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/), [invoice lines](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/), [VAT breakdown](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-TaxTotal/cac-TaxSubtotal/), [payment instructions](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-PaymentMeans/), [monetary totals](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-LegalMonetaryTotal/), [supporting documents](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AdditionalDocumentReference/). These requirements are conditional where indicated; not every optional group must be populated.

| BIS term / requirement | Do we have it, and where? | Gap / delivery action |
|---|---|---|
| BT-1/2/3/5 number, issue date, type, currency | **Present**: V26 `number_display`, `document_date`, `kind`, `currency`; B numbering rules. | Map invoice/credit-note codes and correct UBL root. Base-currency-only v1 is an explicit coverage limit. |
| Specification/process IDs | **Contracted**: Docout C-9. | Writer/transport must emit and route matching IDs; persist release/profile used. |
| BT-10 buyer reference OR BT-13 purchase-order reference | **Partial**: V26 / `InvoiceInput.reference` is one field described as “order or reference”. Docout C-14 calls it `customerReference`; DO-B1 adds a default. | Resolve naming mismatch; separately represent buyer routing reference and buyer PO. Freeze both. Do not require BT-10 when a valid BT-13 exists. |
| BT-14 sales-order reference, BT-132 order-line reference | **Partial/absent semantic mapping**: B C-47 source-document links exist, but are internal ERP references. | Do not emit internal UUIDs as buyer PO/line IDs. Add external order/line references where required by customer procurement. |
| BT-27/44 seller/buyer name; BG-5/8 address | **Present/partial**: V26 snapshots and customer columns; B C-32 legal snapshot contract. | Verify mandatory country codes and legal names at approval; no live master-data substitution at issue. |
| BT-29/30/31 and BT-46/47/48 party/legal/VAT IDs | **Present/partial**: V26 party identity fields and snapshots; B §3.1a; V31 supplier identities. | Store scheme-specific legal IDs distinct from endpoint and VAT values; national checks and snapshot completeness remain gates. |
| BT-34/49 seller/buyer endpoint IDs + schemes | **Contracted, not demonstrated**: Docout DO-B1 and `einvoice_registrations`; no corresponding V26 delivery columns. | Add verified seller/receiver registration plus customer endpoint fields and frozen issue data. Both addresses required for BIS. |
| BT-7 tax point, BG-14 period, delivery date | **Present/partial**: V26 `tax_point_date`, `supply_date/from/to`; B C-36. | Distinguish supply date, invoice period and tax point. Preserve line periods/delivery locations on inbound documents even when bill UI lacks them. |
| BG-25 line ID/quantity, BT-129/130 unit | **Present/partial**: V26 line number, quantity, `unit_of_measure`; invoice input. | Validate UN/ECE codes and conversion from FBR UoM; line description may need an explicit item-name mapping. |
| BT-146/149 unit price/base quantity; allowances | **Partial**: unit price and discount percent/amount, B C-10. | Default base quantity only when valid. Add reason/code handling for emitted allowances/charges; arbitrary inbound charges cannot be discarded. |
| BG-23: BT-116/117 taxable/tax amount; BT-118/119 category/rate | **Partial**: V26 immutable line tax rows have rate/base/tax/kind. Docout C-14 specifies breakdown. | Group by **VAT category AND rate**, not only rate or tax-code UUID; include correct allowance/charge effects. Derive/freeze export breakdown. |
| BT-120/121 exemption reason/text | **Contracted/partial**: line `legal_text`; Docout DO-P1 proposes category/`vatex_code`. | Map S/Z/E/AE/K/G/O correctly. Zero rate is not automatically exemption; do not demand a VATEX code on every Z line. |
| BT-106–115 totals, prepaid and rounding | **Partial**: V26 net/tax/total/rounding; allocation counters are mutable settlement data. | Freeze issue-time paid amount and amount due if used. Do not let later payments rewrite issued XML. Match BIS decimal limits and identities; ISK display precision does not change XML arithmetic rules. |
| BT-9/20 due date/payment terms | **Present/partial**: V26 due date; customer payment terms. | Export frozen terms when needed; do not recompute from today's customer record. |
| BT-81 payment means | **Missing BIS mapping**: C supplier `defaultPaymentMethod` and B seller routes are business enums, not UNCL4461 codes. | Map actual route and national rules; do not infer method solely from payment-reference type. |
| BT-83 payment reference | **Schema present; generation/validation incomplete**: V26 `payment_reference/type`; B C-35; V31 bill equivalents. | Complete KID/OCR/FIK/FI_REF/RF generators, validators and export mapping; verify each against receiver fixtures. |
| BT-84–86 account/name/PSP and mandates | **Contracted/partial**: B legal-profile port, C payee/bank snapshots; Docout C-14. | Ensure seller payment route is frozen with issued data. IBAN/BIC, domestic account/registration, creditor and mandate data are conditional; no generic “account number” substitution. |
| BT-25/26 preceding invoice and credit-note references | **Present/partial**: V26 `credited_invoice_ref`, links; B credits on account also permitted. | Map original legal number/date and fiscal ID where applicable. Handle a genuine unreferenced credit under allowed profile; do not invent an invoice number. |
| BG-24/BT-122–125 supporting attachments | **Contracted**: Docout issued files/inbound files and ADR-020; V36 bank-evidence files are not general invoice attachments. | Add supporting-document ID, MIME, filename, safe binary storage and limits. A scan attached to a bill does not create BIS support by itself. |
| Buyer accounting/project/contract/delivery references | **Not demonstrated** as distinct external fields; internal cost centres/source links exist. | Optional BIS data, but retain inbound values and add fields when required by customer/CIUS. Never overwrite with NeoERP posting dimensions. |
| Receiving provenance and original document | **Contracted only**: Docout DO-C1 `source=EINVOICE`, `inbound_einvoice_id`, raw XML/validation report. | Deliver schema/use cases, durable transport dedupe, supplier matching, draft-bill linkage and rejection audit. |

**Three concrete mapping corrections before coding:**

1. **DK FIK:** Docout C-14's printed `+71<ref>+<creditor>` is not the BIS XML encoding. Use payment means **93**, PaymentID beginning `71#`, `73#` or `75#`, and a separate eight-character creditor account. For71/75 append the required 15–16-digit instruction ID. [DK-R-010](https://docs.peppol.eu/poacc/billing/3.0/rules/ubl-peppol/DK-R-010/), [DK-R-011](https://docs.peppol.eu/poacc/billing/3.0/rules/ubl-peppol/DK-R-011/).
2. **SE Bankgiro/Plusgiro:** code **30**, account ID in the account field, and `SE:BANKGIRO` / `SE:PLUSGIRO` in **FinancialInstitutionBranch/ID**, rather than assuming an account `schemeID`. [SE-R-011](https://docs.peppol.eu/poacc/billing/3.0/rules/ubl-peppol/SE-R-011/).

3. **DK participant:** `0184` takes eight digits, not `DK` plus eight digits. Correct the Docout C-8 example before registration or XML generation. [Official participant code list, DK:DIGST](https://docs.peppol.eu/edelivery/codelists/v9.7/Peppol%20Code%20Lists%20-%20Participant%20identifier%20schemes%20v9.7.html).

**PK-specific data gaps:** B already models HS/UoM/sale type/`scheduleRef`, retail price and fiscal identifiers. Add or prove an explicit split of SRO schedule versus item serial, all authority-required tax amount components, buyer-registration/province classifications and reference-data versions. A nullable database column is not a legal-content validation rule. Preserve separate FBR accepted/rejected/pending evidence; production readiness is blocked while the live approval path marks every document NOT_REQUIRED. B/Docout fiscal hooks are planned capability, not a substitute for a tested licensed connection.

## 5. Recommended architecture and access-point options

### Provider AP for launch

Keep business ownership in **accounts-service**, consistent with Docout §4. Use ports for writer/reader, validator, transport, file store and fiscal provider. Org supplies verified legal facts; accounting decides invoice and bill state. Do not put fiscal or document logic in the gateway.

Provider contract must cover:

- Two-way Peppol Billing/CreditNote, SMP lookup and verified registration/migration, raw XML retention/export, stable client IDs and status/reconciliation APIs.
- **DK** NemHandel registration, OIOUBL2.1 invoice/credit-note/response profiles in both directions, plus a BIS4 transition commitment; **FI** Finvoice3 operator/bank reach and conversion fidelity.
- Existing Docout **pull-based** inbound/status operation, tenant sub-accounts, replay cursors, acknowledgement semantics, limits and test fixtures. A vendor offering only webhooks would require a separately approved contract/security change.
- EU/EEA data location/processor terms, incident/continuity arrangements, exit and identifier migration, support SLA, annual validation updates.
- Written prices for setup, tenant/endpoint registration, send/receive volumes, conversion, storage, sandbox and support. No provider transaction price was independently established; request comparable quotes before selection.

Use the [OpenPeppol certified-provider register](https://peppol.org/members/peppol-certified-service-providers/) to verify current status. Possible comparison candidates include [Qvalia's published API/certification capabilities](https://qvalia.com/facts/) and [Storecove's published format coverage](https://www.storecove.com/fileadmin/user_upload/Storecove_Formats_Overview_-_2025__1_.pdf); these are first-party leads, **not proof that either satisfies every NeoERP requirement or a procurement selection**. Demonstrate Finnish/Danish inbound, polling and registration before D-121 is closed.

### Own AP: feasible, disproportionate at launch

Own operation entails OpenPeppol membership, service-provider agreement/home authority approval, test and production PKI, AS4 operation, conformance testing, SMP service or an SMP contract, ongoing reporting/monitoring and release maintenance. Open-source AS4 software does not remove those obligations. [OpenPeppol implementation guidance](https://peppol.org/tools-support/guidance/), [test/onboarding service desk](https://peppol.org/tools-support/service-desk/).

Published **2025/26 fees**, applicable to new members from1July2025 and existing members from1January2026:

| Membership case | Sign-up | Annual membership | Certification, initially then annually | Full-year equivalent initial / recurring |
|---|---:|---:|---:|---:|
| AP only, 1–50 employees | EUR1,050 | EUR1,850 | EUR1,500 | EUR4,400 / EUR3,350 |
| AP+SMP, 1–10 employees | EUR1,800 | EUR2,750 | EUR2,500 | EUR7,050 / EUR5,250 |
| AP+SMP, 11–50 employees | EUR2,100 | EUR3,700 | EUR2,500 | EUR8,300 / EUR6,200 |

Annual membership is prorated on joining; certification is billed on certification and annually thereafter. These are **association fees only**; hosting, staff, assurance audits, national requirements and outsourced SMP are additional. [Official OpenPeppol fee table](https://peppol.org/join/fees/). End users connecting through a provider need not join OpenPeppol. [Membership guidance](https://peppol.org/join/).

Budget an ISMS/assurance programme for own operation. OpenPeppol's final implementation-plan page sets **1October2027** for ISO27001 or accepted equivalent; an Italian authority notice still states1July2027. Use the [final OpenPeppol plan](https://openpeppol.atlassian.net/wiki/spaces/Security/pages/5232230408/ISO%2BIEC%2B27001%2BImplementation%2Bplan) and confirm with the home authority rather than silently adopting the conflicting [Italian notice](https://peppol.agid.gov.it/en/news/ISO-IEC-27001-Certification-Mandatory-for-Peppol-Service-Providers-from-1-July-2027/). No universal fixed ISO audit price was verified. Reconsider own AP only after measured provider spend and operational staffing justify it.

Pakistan is separate: start the PRAL/free-integration versus commercial licensed-integrator comparison now; Peppol certification does not license an FBR integration.

### Outbound lifecycle

1. Validate legal content **before posting**, including duty/routing, buyer/order reference and country payment data. Freeze the approved business values and classification versions.
2. Posting commits an outbox job. Generate/validate the selected XML from frozen values; persist original XML, PDF and validation evidence. External calls run after commit.
3. Resolve recipient capability and send with a stable transmission ID. Keep provider acceptance, transport delivery and business acceptance/rejection distinct.
4. Reconcile timeout/unknown states before retry; retain sent bytes and attempt history. Subsequent correction is a new legal document, not a mutation of delivered XML.
5. For PK, the fiscal dispatcher obtains FBR acceptance first; buyer delivery follows. Fiscal receipt is not proof that the buyer received the document.

### Receiving → supplier invoice

1. Poll the provider using a durable cursor. **Durably store before acknowledging**; unique provider/transport message ID prevents replay creating another inbox item.
2. Resolve tenant only through the verified **ACTIVE (receiver scheme,value)** registration and matching provider sub-account. Quarantine unknown/mismatched recipients; do not infer tenant from buyer name/VAT text.
3. Retain original XML, envelope, timestamps and hash. Parse with external entities/network access disabled; enforce decompression, size, line and attachment limits. Scan embedded files; never fetch arbitrary attachment URLs.
4. Validate XSD, EN16931, BIS/national rules or the specific OIOUBL/Finvoice profile. Save rule IDs/severity/version. Invalid documents remain visible with actionable errors, not silently discarded.
5. Match supplier by verified endpoint/legal/VAT identity with ambiguity review. Preserve invoice number/date/due date, external buyer/PO references, currency, full VAT breakdown, payment reference and source bank details.
6. Run C-4 business duplicate checks as well as transport dedupe: same supplier/legal invoice number, date/amount/reference indicators. Re-delivery with another transport ID must not create another payable.
7. Map to **C draft bill or supplier credit/debit-note representation as appropriate**. Resolve expense accounts, tax-code/category/rate, reverse charge and deductible percentage through NeoERP rules. Preserve the supplier's charged VAT separately from our deductible/reverse-charge accounting. Unsupported currency, lines over C's limit, ambiguous charges or unmatched totals go to review; never truncate or silently recompute the supplier's legal document.
8. Display original and mapped values for human approval; source bank changes must follow C's bank-change controls. An inbound invoice must not silently replace trusted payment instructions.
9. Acknowledge technical receipt only when durable; send supported business rejection/response separately with reason. Track draft linkage and later approval independently. FBR incoming evidence is matched/reconciled, not re-fiscalised as NeoERP sales.

This follows Docout C-21/22/25/29/33 and DO-C1. It also respects Denmark's requirement for user acceptance before purchase posting.

## 6. Country order and proposed roadmap items

Keep the approved **commercial launch order SE → NO → PK → FI → IS → DK**; this research does not amend it. For engineering urgency, do **NO sender and PK fiscalisation immediately alongside the shared SE/BIS pilot**. An existing PK STRN customer cannot wait for the third commercial launch to gain already-required compliance.

| Proposed item | Urgency / target | Existing ownership / acceptance evidence |
|---|---|---|
| EI-01: close provider comparison, security sign-off and registration ownership | **Immediate**, before Docout build; Norway year-boundary dependency | Docout D-121/D-123 and ERP-44 gate; accounts lead + ERP lead. Demonstrate DK/FI routes, inbound polling and tenant isolation; no purchase made by this research. |
| EI-02: reconcile field semantics and profile mappings | **Immediate**, before issuer implementation | B/Docout DO-B1/2/P1: split BT-10/13, fix FIK/Bankgiro, endpoints, VAT categories, issue-time totals and attachments. Approved amendment required; do not silently change B. |
| EI-03: shared BIS writer/validator/archive and SE pilot | **P0**, before any Nordic structured-invoice launch | Docout CP-DO checkpoints: valid invoice/credit note; multiple rates/categories, rounding, references, attachments, failure/retry; XML/PDF equal frozen legal values. |
| EI-04: Norway sending duty profile and capability handling | **P0, ready before1January2027** | Existing [NO-1](../codex-2027-changes/report.md#no--norway), Docout C-13/27; tests across cut-over, covered recipient, genuine exemption and lookup outage. No unlawful PDF fallback. |
| EI-05: PK real licensed integration, credentials and correction/retry design | **P0, already-live statutory scope; blocker before PK issue/go-live** | B SB8 fiscal hooks + Docout FBR checkpoint. Current complete API verified; sandbox scenarios, accepted number, rejected response, ambiguous timeout and original-reference corrections. Zero production credentials in test/logs. |
| EI-06: inbound registration, inbox, validation and C mapping | **P0 for NO launch by existing product gate; all Nordics share it** | Docout CP-DO.4 / DO-C1. Supplier identity, duplicate/replay, wrong-tenant, credit note, bank-change and totals review tests; no automatic posting. Statutory NO2030 date does not postpone the existing launch gate. |
| EI-07: FI Finvoice interoperability and request-based duty | **Before FI pilot/launch** | Provider conversion round-trip, EN16931 validation and buyer request evidence; OVT0216 registration. Check Finnish procurement ordering requirements separately. |
| EI-08: IS receiving/sending fixtures and current TS-236 rules | **Before IS pilot/launch** | Peppol/0196 ownership, public recipient XML acceptance and supplier-bill mapping; confirm currency/rounding coverage. |
| EI-09: DK dual formats, responses and registered-system obligations | **Before DK registration/launch**, prepare2027 duties now | OIOUBL2.1 + BIS3 in both directions, human purchase approval, applicable enrolment/UI/security requirements; detailed dates in [DK-1–2](../codex-2027-changes/report.md#dk--denmark). Not merely a format converter. |
| ER-01: per-country VAT/return/export adapters and acknowledgements | **Before each country's paying launch** under existing Phase6 gates | E/H-NO/DK/PK/FI/IS and SE VAT/SIE deliverables: period/schema/version, delegated authority, validation, submission, receipt, replacement and reconciliation to ledger. Link existing2027 export/access requirements rather than duplicate them. |
| EI-10: operational release/certification monitoring | **Every standards release; provider assurance before1October2027** | Pin test fixtures/artefacts, update identifiers, monitor expiring credentials and provider ISO scope; historical corrections remain supported. |
| EI-11: Denmark BIS4 migration | **Watch now; implementation before final2028–2029 cut-over** | Replace only on final published profiles/cutover; preserve OIOUBL while required. |
| ER-02: EU cross-border transaction reporting | **Plan data completeness now; ready for1July2030** | SE/DK/FI authority-specific implementation/transposition; separate reporting port, corrections and receipts. No speculative2027 tax endpoint. |

## 7. Verification limits and checkpoint

| Field | Record |
|---|---|
| Identity / ownership | Task `codex-einvoicing`; Codex research lead/sole writer and report integrator. App and BackEnd read-only. Sole authored path: `docs/agents/codex-einvoicing/report.md`. |
| Approval | User authorised research, exactly one report and a master commit `docs(codex): e-invoicing readiness`. No push, implementation, procurement, registration, credential use or login change. Latest user instruction excludes all PROJECT-STATE reads and extra plan/handoff files. |
| Stages | Discovery/source mapping → country/field analysis → report → source/link and scope review complete. Proposals remain proposals; no claim of independent implementation review or statutory certification. |
| Evidence limits | Official sources and first-party standards/provider information as linked; targeted source/schema review, not a full application audit. FBR full API retrieval unresolved; taxpayer-specific notices, current national artefacts and provider commercial terms remain launch checks. “No mandate verified” is a bounded research finding, not proof that no future notice exists. |
| Findings | Provider AP recommendation aligns with existing contract. Pending: buyer/PO ambiguity, payment encoding fixes, endpoint/rules metadata, inbound mapping, fiscal runtime hooks, current FBR semantics and statutory-report adapters. DK/Svefaktura claims require the precise treatment above. |
| Verification | Docs-only; no builds or runtime tests required. Validate local links and sole commit path; preserve pre-existing dirty workspace files and nested repositories. No PROJECT-STATE file was read. |
| Resume point | Accounts/ERP leads may approve scoped contract amendments and provider evaluation, then implement Docout and E/H through existing gates. Shared state/other owned checkpoints were not updated because the user permits exactly this file. |

Pre-existing unrelated workspace changes at pickup: `docs/agents/accounts-bc-readiness/brief-sb2a.md`, `docs/handover/design-principles.md`, `docs/inbox/erp-lead.md`; untracked `.review-channel/handoff-implementer.md`, `docs/agents/accounts-cp-ev-1c/`, `docs/agents/accounts-flow56-fixes/`. They are outside this report's commit scope.
