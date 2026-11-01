# Peppol access-point providers for NeoERP

Research cut-off: **1 November 2026**. Scope: Norway first; Sweden, Denmark, Finland and Iceland next. Pakistan excluded. Research only; no provider selected, contacted, purchased or registered and no application changes authorised.

## Recommendation

Invite **Storecove and ecosio** to a bounded technical and commercial evaluation. Storecove has the clearest published software-vendor pricing and broad Nordic format claims; ecosio has particularly explicit Danish and Finnish network documentation. Neither is an unconditional procurement recommendation: Storecove must demonstrate registration automation and exact format directions; ecosio must resolve its Switzerland hosting footprint if EU/EEA-only processing is required. Both must confirm one NeoERP agreement covering many unrelated customer companies.

This follows decision **R5 / EI-01: buy a provider AP, do not operate our own**, supplied by the user and discussed in [prior research](../codex-einvoicing/report.md) and [triage part B](../codex-research-triage.md#b-e-invoicing). Use a provider's accreditation and certificates; a hosted white-label **own** AP is a different model and is outside R5.

Norway's covered B2B issuance duty starts **2027-01-01**; statutory receiving starts **2030-01-01**. Skatteetaten confirms EHF/Peppol BIS Billing 3.0 or later and describes applicability/exemptions. This is not an invoice-by-invoice tax-clearance requirement. The earlier NeoERP report also records **both sending and receiving as an existing Norway product launch gate**; the 2030 statutory date is not permission to defer the inbox. [Official Norwegian notice][no-law]

## Evidence rules

- **Published** means explicitly supported by a linked first-party page or the OpenPeppol register; it is not a tested service guarantee. **Unknown** means not established in the reviewed public evidence, not that the capability is absent.
- Peppol reach includes participants in all five target countries. That does **not** prove local customer onboarding, national CIUS handling, OIOUBL/NemHandel delivery or Finnish bank/operator-network access. An invoice-format catalogue also does not prove conversion in both directions.
- Distinguish a technical multi-company account from a commercial **one-contract, many independent companies** ISV arrangement. For all six providers, exact contracting, customer mandates, fees and liability require a written offer.
- Prices below are official only. No directory estimates, old third-party tariffs or end-user free plans are used as ISV prices. No sandbox account or authenticated documentation was accessed.

## 1. Provider comparison

### Certification, API tenancy and customer registration

The [OpenPeppol certified-provider register][register], updated **30 October 2026** when opened, lists the following. Its country column is legal residence, not service coverage. SMP certification is separate from AP certification; a dash does not prevent a provider from arranging registration through another SMP.

| Provider / registered entity | Certification | API for software vendors; send AND receive | Multi-tenant ISV model | Customer SML/SMP registration |
|---|---|---|---|---|
| **Storecove — Datajust B.V., NL** | AP + SMP | REST/JSON integration and partner programme explicitly cover both directions. [Partner offer][sc-partner] | Cloud Accounting licences cover 50, 250 or unlimited entities; integrator/reseller offer also exists. Strong product evidence; exact master-contract terms unknown. [Tariff][sc-price] | Legal entities and participant identifiers are onboarded and approved; registered active Peppol identity needed to receive. Exact create/update/migration API and bulk SML/SMP lifecycle **unknown in accessible docs**. [FAQ][sc-faq] |
| **Tickstar / Galaxy — Tickstar AB, SE** | AP + SMP | Transaction API exchanges documents; developer tools also link lookup and SMP APIs. [Developer tools][ts-api] | Shared-instance service explicitly targets ERP clients. Request this under Tickstar accreditation; exclude the separate own-certificate white-label offer. One-contract billing terms unknown. [ISV offer][ts-isv] | SMP Manager API supports participant/capability/endpoint management and SML/SMK activation, according to indexed official FAQ. Bulk migration, verification and termination workflow still need demonstration. [FAQ][ts-faq] |
| **Unimaze — Unimaze Software, IS** | AP + SMP | REST Messaging/Transaction APIs, inbound retrieval and webhooks; ERP partner programme. [Portal][um-api], [partners][um-partner] | Partner/white-label model and multi-entity service published. Confirm this means provider-operated AP plus one master contract, not NeoERP operating an AP. [Service model][um-service] | Certified SMP and customer Peppol connectivity offered. Self-service participant-registration endpoints, SML publication states and migration API **unknown**. [Partners][um-partner] |
| **ONESOURCE Pagero — Pagero AB, SE** | AP; SMP dash | Partner APIs send, retrieve and track documents. [Integration guide][pg-partner] | Shared partner credentials, individual company accounts and companyId routing; OAuth user authorisation. Signup API subject to approval. One-contract wholesale arrangement unknown. [Integration guide][pg-partner] | Account signup is not proof of Peppol publication. Confirm provider-managed SMP/ELMA registration, identifiers, customer authority and API lifecycle. Own SMP certification is not shown for Pagero AB. [Register][register], [APIs][pg-api] |
| **ecosio — ecosio InterCom GmbH, DE** | AP + SMP | Messaging API supports send/receive; Management API manages companies under a partner account. [Messaging][ec-api], [Management][ec-mgmt] | Explicit technical multi-company partner model. Contractual resale, billing and customer consent terms unknown. [Management][ec-mgmt] | Public setup instructs arranging participant registration with an integration engineer. Autonomous SMP registration via Management API **unverified**; clarify scale and turnaround. [Peppol setup][ec-setup] |
| **Banqup — Banqup Group, BE** (formerly Unifiedpost brand) | AP + SMP | Software-partner REST APIs; sales and purchase flows documented. [Partners][bq-partner], [API guide][bq-api] | Multi-tenant SaaS integration explicitly documented, normally connecting each customer's Banqup account with OAuth. This does not prove pooled wholesale pricing or portal-free onboarding. [Authentication/tenancy][bq-api] | Provider publishes identifiers through its Peppol connector; registration and provider-switch process published. Bulk headless onboarding API and exact SML/SMP lifecycle unknown. [Registration][bq-reg] |

The provider should operate customer registration: the **SML** locates the responsible **SMP**, which publishes supported document/process types and receiving endpoints. The Peppol Directory is a discovery aid, not the routing authority. Require observable publication/withdrawal states and migration ownership; creating a provider company account alone is insufficient. [Registration service example][ts-api]

### Countries, formats and validation

All six provide Peppol connectivity. The table distinguishes published Nordic capabilities from merely being able to reach a Peppol endpoint. **BIS** below means Peppol BIS Billing 3.0; invoice and credit-note acceptance in each direction remains an evaluation requirement.

| Provider | NO / SE / DK / FI / IS coverage evidence | EHF / BIS 3 | OIOUBL / NemHandel | Svefaktura | Finvoice / Finnish domestic operators | Validation evidence |
|---|---|---|---|---|---|---|
| **Storecove** | All five explicitly on supported-country list. [FAQ][sc-faq] | Listed | Both listed; demonstrate native network route, supported profile versions and both directions | Listed; exact version/direction must be confirmed | Finvoice 3.0 and TEAPPSXML listed; dedicated page explicitly offers legacy Finvoice network/static routing. Confirm receive route and operator coverage | BIS Schematron, mandatory fields and arithmetic checked before sending. [FAQ][sc-faq]. Format claims: [official French FAQ][sc-formats], [Finvoice offer][sc-fi] |
| **Tickstar** | Global Peppol participant reach; national-network conversion package not established | EHF/BIS validation documented | Unknown | Unknown | Unknown | SBDH and supported document Schematrons. Unsupported validator types can still be forwarded: require explicit profile coverage. [Validator][ts-validation] |
| **Unimaze** | Global Peppol plus native Danish NemHandel; Iceland-based provider. Confirm onboardable NO/SE/FI/IS companies and current national rules | Peppol BIS compliance stated; exact current EHF/IS CIUS release coverage to confirm | NemHandel connection and OIOUBL profiles published; production version/direction matrix needed | Unknown | Unknown | Peppol invoice validation offered; ask for national-rule versions, machine-readable errors and inbound rejection policy. [Validation][um-validation]. Network/profile evidence: [portal][um-api], [standards][um-standards] |
| **Pagero** | Broad network; Nordic-format catalogue. Confirm NO/SE/DK/FI/IS sender onboarding and actual local-network routes | Peppol support; Norway EHF/BIS3+ mandate awareness published | OIOUBL catalogue entries; native NemHandel contractual coverage to confirm | Svefaktura 1.0 catalogue entry; conversion directions to confirm | Finvoice 3.0 catalogue entry; Finnish bank/operator interconnect coverage to confirm | Certification/test modes permit checking mapping and validation before live delivery. Country-specific rule coverage needs agreed fixtures. [Formats][pg-formats], [testing][pg-partner], [Norway][pg-no] |
| **ecosio** | Peppol reach; particularly explicit DK/FI sending and receiving flows. Confirm Iceland CIUS/onboarding | BIS plus EHF validator available | Documented send/receive via Peppol and NemHandel, OIOUBL conversion/validation | Unknown | Finvoice 3.0 / TEAPPSXML 3.0 mapping and national-operator partner route documented in both directions | Country flows include validation; public validator supports EHF/OIOUBL/BIS. Confirm production version/error parity. [Denmark][ec-dk], [Finland][ec-fi], [validator][ec-validation] |
| **Banqup** | Peppol reach. Registration guidance lists NO/SE/DK/FI among Banqup One countries; IS not listed there. That is onboarding evidence, not a full network matrix | Peppol/UBL; exact EHF/NO validation support unknown | Group mandate material describes compliant outbound DK solution; exact embedded API service and receiving scope unknown | Unknown | Unknown | Sales API describes automated format/data/compliance checks; exact national Schematrons and exportable diagnostics unknown. [Country onboarding][bq-countries], [DK material][bq-dk], [sales statuses][bq-sales] |

Do not implement a new Svefaktura writer just because a provider lists it: the prior research records SFTI's withdrawn recommendations. Ask for legacy conversion only if real pilot counterparties require it. For Denmark, verify OIOUBL 2.1 support and the future Nemhandel BIS transition independently; do not equate BIS3 transport with all Danish bookkeeping-system obligations. For Finland, test a recipient reachable only through a domestic operator, not just a Finnish Peppol participant. [Existing country analysis](../codex-einvoicing/report.md#1-country-mandates-directions-and-dates)

### API documentation, sandbox, residency and Norway readiness

| Provider | API docs and test access | Data location: EU/EEA evidence | Norway 2027 readiness assessment |
|---|---|---|---|
| **Storecove** | [API docs][sc-docs] redirected to login when opened. Public partner offer provides **30-day sandbox**. Request current OpenAPI spec before estimating. [Partner offer][sc-partner] | Published privacy document says **Ireland**; older security principles say EU. Obtain current DPA covering production, backups, logs, support and any regional hubs. [Data policy][sc-data] | Promising existing EHF/BIS service; no verified NeoERP go-live slot or dated contractual 2027 commitment. Confirm current NO rules and onboarding capacity. |
| **Tickstar** | [Developer landing][ts-api] links Transaction/SMP/Lookup specs; linked Transaction/SMP Swagger pages returned 404 during retrieval. Free trial includes test AP/SMP and credentials. [Trial][ts-trial] | AWS **Ireland selectable**, also Singapore/Australia. Explicitly select Ireland and confirm DR/log/support scope. [Hosting][ts-home] | Good transport/registration candidate if NeoERP owns mapping. Working specs, validation coverage and implementation slot remain gates. |
| **Unimaze** | [Developer portal][um-api]; sandbox by contacting provider. Public [environment guide][um-env] gives sandbox endpoint and OpenAPI URL, production regional endpoints. | Explicit **EEA storage** claim; Azure/Syndis mentioned. Exact primary/backup regions and remote support locations unknown. [Service/security][um-service] | Plausible Nordic candidate, but current Norwegian rules, EHF fixtures and delivery date need written confirmation. |
| **Pagero** | [API reference][pg-api]. **No separate sandbox** in partner guide: certification/test/production modes use same platform. Certification mode stays within Pagero. Protect against wrong sendMode. [Guide][pg-partner] | Pagero Online primary/secondary hosting **Sweden and France**; other products differ. [Trust Centre][pg-trust] | Strongest explicit mandate-awareness evidence: official **1 October 2026** Norway update. Still not an onboarding/SLA commitment. [Norway update][pg-no] |
| **ecosio** | [Messaging API][ec-api], [Management API][ec-mgmt]. TEST system documented; access arrangement/self-service sandbox unknown. | Official infrastructure annex includes **Frankfurt and Zürich**. Switzerland is outside EU/EEA: do not label EEA-only. Ask whether contractual EEA-only operation is available. [Infrastructure terms][ec-terms] | Nordic mapping evidence is strong. NO rule-version, customer registration lead time and any residency condition must be resolved before choosing. |
| **Banqup** | [Public docs][bq-api]; [sandbox FAQ][bq-sandbox] specifies CVE sandbox docs/app/credentials. Do not mix Classic v4 API with current BTX API without provider confirmation. | European API hostnames are not proof of storage geography. Exact primary, DR, backup, log and support regions **unknown** in reviewed API/partner evidence; request DPA. | Peppol plus NO onboarding indication; exact EHF/2027 validation and launch capacity unverified. More onboarding/product-fit questions than the shortlist. |

**No provider is verified “Norway 2027 ready for NeoERP” by this desk research.** Production readiness means a contract, verified customer registrations, current national validations, two-way acceptance tests, recovery/reconciliation and operational support before 1 January. Generic claims of automatic compliance do not establish these.

## 2. Pricing and comparable quote request

| Provider | Published commercial model | Official indicative production ISV price |
|---|---|---|
| **Storecove** | Cloud Accounting: annual maintenance/support licence plus documents, with entity limits. Separate Enterprise/Integrator tabs show “ToDo”. | **Starter EUR 3,300/year, 50 entities; Growth EUR 6,600/year, 250; Ultimate EUR 9,900/year, unlimited.** For 0–50k documents/year: **EUR 0.162 / 0.120 / 0.090 per document** respectively. Further volume bands are displayed. This is a published Cloud Accounting indication, not a NeoERP quote. [Official calculator, indexed page][sc-price] |
| **Tickstar** | Shared-instance service, quote requested; exact fee meters unknown | **Unknown**; free trial is not a production tariff. [ISV offer][ts-isv] |
| **Unimaze** | Actual-usage pricing stated; entities/branches supported | **Unknown**; minimum, entity fee, document fee and setup cost not published in reviewed source. [Pricing description][um-service] |
| **Pagero** | Partner agreement/account model; exact wholesale fee basis unknown | **Unknown**. End-user offers do not establish resale/API pricing. [Partner guide][pg-partner] |
| **ecosio** | Partner/multi-company integration; quote required for fees and meters | **Unknown**. Request platform, mapping, company, network and transaction fees separately. [Partner API][ec-mgmt] |
| **Banqup** | Software-partner API arrangement; wholesale fee basis unknown | **Unknown**. Banqup end-user subscriptions/free allowances are not evidence of an ISV contract. [Software partners][bq-partner] |

Storecove illustration, **our arithmetic** using its first volume band: 50 companies and 10,000 total documents/year on Starter gives **EUR 4,920/year** (3,300 + 10,000 × 0.162); 250 companies and 50,000 total documents/year on Growth gives **EUR 12,600/year** (6,600 + 50,000 × 0.120). These exclude any tax, setup, local-network, mapping, archive, support or other charges not established by the calculator. Confirm whether incoming/outgoing credit notes, responses, retries and rejected documents each count, whether usage is pooled and whether all fees/bands apply as assumed. The calculator was visible in the official search index; direct opening failed, so have Storecove reconfirm the tariff.

Use the same quote basket for every provider: **50 companies/10k documents, 250/50k, 1,000/250k per year**, documents split 50% send/50% receive, invoices and credit notes, NO first and all five countries enabled later. Ask for year-one/year-two totals, minimum commitment, entity dormancy, volume pooling, tier calculation, overage, annual increases, setup, sandbox extension, registration/migration, mappings, domestic interconnect, attachments, storage/export, premium support and termination charges. Do not fabricate totals for providers without official prices.

## 3. Shortlist of two and selection gates

1. **Storecove — preferred first evaluation.** Published multi-entity tiers fit an accounting SaaS, and official material lists all requested format families plus Finnish legacy-network access. Ireland storage and the sandbox offer support a quick evaluation. Its public API reference required login, registration lifecycle is not sufficiently exposed, and format support needs direction/version proof. Obtain API access, a one-master-contract offer, exact NO/DK/FI/IS matrix, current security evidence and raw delivered-document retrieval before committing to it. Its linked public ISO certificate found during research expires **27 August 2026**: request the renewed certificate rather than treating it as current assurance. [Published certificate][sc-iso]
2. **ecosio — preferred alternative for wider Nordic integration.** The partner Management API and explicit Danish/Finnish bidirectional flows address the biggest future interoperability risks. Engineering-mediated registration and unknown pricing could slow small-customer onboarding. **Conditional on residency:** the Frankfurt/Zürich infrastructure terms do not satisfy an EEA-only requirement by themselves. Require an acceptable deployment/DPA and a timed company-registration demonstration. This is a technical-fit shortlist, not security approval.

**Why the others are not in the first two:** Tickstar is attractive for transport and SMP automation, but public evidence leaves more Nordic conversion/interconnect work with NeoERP. Unimaze is a credible Icelandic/EEA option with NemHandel and partner APIs; Finnish operator coverage and automated registration remain unproven. Pagero has strong Nordic formats, company APIs and mandate awareness, but needs clearer wholesale/onboarding terms and careful same-platform test isolation. Banqup has an explicit software-partner model, but customer-account onboarding, Iceland availability and exact Nordic domestic formats require more clarification.

A finalist must pass a small evaluation, **to be separately authorised**: onboard two independent Norwegian companies; prove each can send and receive invoice and credit note; attempt cross-company access and replayed webhooks; check invalid EHF and business-reference errors; simulate timeout after acceptance; recover inbound data after webhook downtime; retrieve original and delivered bytes; migrate one existing participant without duplicate payables. For later expansion, add one NemHandel-only and one Finnish-operator-only counterparty, plus an Iceland CIUS fixture. Failure to confirm the master-contract model or an acceptable data location removes the candidate from selection.

## 4. What NeoERP must build

These are proposed responsibilities, based on the [existing research's gap and flow analysis](../codex-einvoicing/report.md#5-recommended-architecture-and-access-point-options), not a fresh code audit or an implementation approval.

| Area | NeoERP responsibility even with a provider |
|---|---|
| Company onboarding and ownership | Map tenant + legal company to provider sub-account and verified participant scheme/value. Capture customer authority, verification and registration state. Handle existing registrations, migration and exit. Publish receive capability only after the inbox is operational. Do not share one legal sender identity across tenants. |
| Invoice semantics | Freeze legal seller/buyer/tax/line/payment snapshots. Split BT-10 buyer reference and BT-13 purchase-order reference; model endpoint scheme/value and country identifiers, VAT categories, units, allowances/charges, rounding, credit-note references and attachments. Correct payment-reference mappings identified in the prior report. |
| Format boundary | Keep a canonical invoice model and a provider adapter. Choose either provider JSON conversion or NeoERP-generated BIS XML after testing semantic fidelity. Retain source and final delivered XML and versioned mapping/validator evidence. Provider conversion does not own NeoERP's tax/accounting decisions. |
| Durable outbound delivery | Use an outbox after posting, stable correlation/idempotency keys and immutable document versions. Separate validation rejection, provider acceptance, network delivery and business rejection. On timeout, reconcile provider state before retrying; local idempotency alone does not prove remote exactly-once delivery. Monitor queues and deadlines. |
| Receiving and tenant isolation | Durable inbox with polling/reconciliation even if webhooks exist. Authenticate callbacks, deduplicate transport IDs and legal supplier invoice identities, store before acknowledging, and route only using verified receiver registrations/provider account. Quarantine unknown or mismatched recipients. |
| Safe parsing and bill mapping | Restrict XML entities/network access, sizes, compression and attachments. Validate national profiles and preserve errors. Match suppliers without silently overwriting trusted bank details. Map to draft supplier invoice/credit note; review taxes, currency, references and totals; human approval before posting. |
| Product experience | Company registration/setup, recipient lookup, actionable errors, retry/reconcile controls, delivery history, supplier inbox and approval. Lookup outage must remain an unknown state; no automatic PDF fallback that bypasses applicable Norway issuance duties. |
| Evidence, security and operations | Credentials only on backend, least privilege and tenant checks, encrypted storage and protected logs, signed/authorised webhooks, audit trail, alerting and retention by country/record class. Archive original/converted XML, attachments and receipts independently of provider retention. Support exit export and SMP migration. Track schema/rule releases and API deprecations. |

The AP provider should own AS4 transport, its Peppol certificates/accreditation, network discovery, agreed SMP/SML operations and contracted transformations/validation. NeoERP remains responsible for document correctness, accounting, user authority, archive and application security. VAT returns and statutory exports remain separate; this research does not reopen Pakistan scope.

## 5. Questions for providers

| Topic | Questions requiring written answers |
|---|---|
| ISV contract | Can NeoERP sign **one contract** and invoice its own customers while serving unrelated legal companies? Are end-customer contracts, portal accounts or direct payment to you required? Who is AP operator and which exact legal entity/certificate covers the service? |
| Registration | Which APIs create/verify/update/deactivate customers, publish SMP services and SML entries, manage national registrations and migrate existing receivers? What customer mandate/KYC is required? What are turnaround, bulk limits, failure states and migration downtime? Who releases registrations on exit? |
| Nordic matrix | Provide a signed country × network × format/version × direction matrix for NO/SE/DK/FI/IS, invoices and credit notes. Include EHF/BIS3 national rules, OIOUBL2.1/NemHandel, legacy Svefaktura if needed, Finvoice3/TEAPPSXML and Finnish bank/operator partners, Iceland TS-236/CIUS. Which capabilities require a separate product or fee? |
| Norway deadline | Will you contract to onboard NeoERP and customer companies before **2027-01-01**? Which current EHF/BIS releases and country rules run in production? What deployment freeze, support cover, onboarding queue and rollback arrangements apply around year-end? Demonstrate sending and receiving now. |
| Validation and conversion | Are both inbound/outbound XSD, EN16931, BIS and national Schematrons enforced? What happens to unsupported/invalid profiles? Are rule IDs, severity and validator versions available via API? Can we retrieve original plus delivered/transformed bytes and prove totals/references survive conversion? |
| API operations | Supply working OpenAPI definitions, rate/size/attachment limits, version policy, timeout/idempotency semantics, status query, replay/backfill and polling cursor behaviour. How are webhooks authenticated, retried, ordered and replayed? Distinguish C2/C3 transport receipt from buyer business acceptance. |
| Isolation and tests | Are credentials scoped to company or partner? Demonstrate prevention of cross-company access, companyId substitution and misrouted callbacks. Is sandbox isolated from production registrations? For Pagero, how do you enforce certification/test sendMode safety? |
| Residency and security | List primary, DR, backups, logs, telemetry, support access and subprocessors by country. Can all contracted processing/storage stay EU/EEA? For ecosio specifically, can Zürich be excluded? Supply current DPA, subprocessor list, ISO certificate/scope, breach SLA, audit rights and deletion/export commitments. |
| Commercial and exit | Quote the common baskets in section2, including every meter/add-on and support tier. What SLA, outage credits, incident response, retry/recovery and reconciliation commitments apply? What retention is included? Can we export all documents/statuses and transfer participant registrations on termination, with fees and deadlines fixed? |

Do not send these questions or sign up customers as part of this research. The next authorised action from this task is delivery of this report and its scoped commit; provider outreach/evaluation and procurement remain separate decisions.

## 6. Checkpoint and verification limits

| Field | Record |
|---|---|
| Identity / ownership | EI-01 provider research; Codex lead and sole report writer/integrator. A research worker supplied read-only official-source evidence for Tickstar/Pagero/ecosio under the workspace's parallel-work instruction. |
| Approval / write scope | User authorised research and exactly `docs/agents/codex-peppol-providers/report.md`, committed on workspace master as `docs(codex): Peppol provider comparison`. App/BackEnd read-only. No push, implementation, registration, login change, purchase or provider contact. Latest user instruction overrides PROJECT-STATE reads and additional plan/handoff files. |
| Stages / progress | Discovery/context → official-source comparison → shortlist/draft → citation and scope skim completed. Research proposals remain unaccepted commercial/security decisions. No claim of independent implementation review. |
| Snapshot | Workspace master at pickup: `a9be97c737ec1119497f8afa1787bc7820a1552e`. Used only the named existing research/triage and workspace process files; no new App/BackEnd code inspection. |
| Evidence / limits | First-party pages and OpenPeppol register; no API calls, sandbox integration, live transmission or formal quotes. Storecove docs redirected to login; calculator verified through official indexed text but direct open failed; Tickstar linked Swagger specs failed and FAQ evidence was indexed. Public statements do not establish negotiated security, availability or liability. Unknowns stay open. |
| Findings | Provider-operated AP retained. Pending procurement gates: one-contract ISV terms, full registration lifecycle, format/direction matrix, EU/EEA scope, current security certificates, Norway delivery slot and pricing. Swiss ecosio infrastructure explicitly flagged; no assumed blanket Nordic interoperability. |
| Verification | Docs-only; no builds/runtime tests needed. Markdown reference links, local file/heading links and price arithmetic checked; sole commit path and unrelated-change preservation checked at delivery. No PROJECT-STATE file read. |
| Resume point | Accounts/ERP leads can use the two-candidate shortlist to authorise outreach and a bounded sandbox evaluation. No shared state/other owned checkpoint updated because exactly one report is permitted. |

Unrelated pickup changes preserved: modified `docs/agents/accounts-bc-readiness/brief-sb2a.md`, `docs/handover/design-principles.md`, `docs/inbox/erp-lead.md`; untracked `.review-channel/handoff-implementer.md`, `docs/agents/accounts-cp-ev-1c/`, `docs/agents/accounts-flow56-fixes/`.

## Official source links

All external links below are provider-controlled or authority/standards-owner sources. Accessed 1 November 2026; indexed-only and failed-fetch limits are called out above.

[register]: https://peppol.org/members/peppol-certified-service-providers/
[no-law]: https://www.skatteetaten.no/nn/rettskjelder/type/uttalelser/uttalelser/forskrifter-til-lovendringer-om-digital-bokforing-og-e-fakturering/
[sc-partner]: https://www.storecove.com/us/en/solutions/become-an-integrator
[sc-docs]: https://www.storecove.com/docs/
[sc-faq]: https://www.storecove.com/us/en/mystorecove/faq
[sc-formats]: https://www.storecove.com/fr/fr/mystorecove/faq/
[sc-fi]: https://www.storecove.com/us/en/networks/finvoice
[sc-price]: https://www.storecove.com/us/en/storecove-pricing-calculator
[sc-data]: https://www.storecove.com/fileadmin/editors-filemount/documents/Data_Privacy_Policy_Storecove_final_website.pdf
[sc-iso]: https://www.storecove.com/fileadmin/user_upload/achievements/Certificate_ISO_27001_Storecove.pdf
[ts-api]: https://www.tickstar.com/developers-tools/
[ts-isv]: https://www.tickstar.com/delivering-peppol-to-your-clients/
[ts-faq]: https://www.tickstar.com/faqs/
[ts-trial]: https://www.tickstar.com/services/
[ts-home]: https://www.tickstar.com/
[ts-validation]: https://www.tickstar.com/article/peppol-validator/
[um-api]: https://developer.unimaze.com/
[um-env]: https://developer.unimaze.com/docs/api-integration
[um-partner]: https://www.unimaze.com/become-a-partner/
[um-service]: https://www.unimaze.com/why_choose_unimaze/
[um-validation]: https://www.unimaze.com/features/invoice-validation/
[um-standards]: https://www.unimaze.com/sr/za-programere/supported-standards/
[pg-partner]: https://pagero.github.io/partners/partner-integration-guidelines/
[pg-api]: https://pagero.github.io/partners/apis/api-reference/
[pg-formats]: https://pagero.github.io/business-documents/invoice-creditnote/
[pg-trust]: https://europe.thomsonreuters.com/trust-center
[pg-no]: https://europe.thomsonreuters.com/se/compliance/regulatory-updates/norway
[ec-api]: https://connect.ecosio.com/reference/messaging-api
[ec-mgmt]: https://connect.ecosio.com/reference/management-api-overview
[ec-setup]: https://connect.ecosio.com/docs/connect-to-peppol
[ec-dk]: https://connect.ecosio.com/docs/compliance-for-denmark
[ec-fi]: https://connect.ecosio.com/docs/compliance-for-finland
[ec-validation]: https://validator.ecosio.com/ui/index.html?lang=en
[ec-terms]: https://ecosio.com/app/uploads/2025/10/2025-10-20_agb_ecosio-intercom_all-annexes_en.pdf
[bq-partner]: https://www.banqup.com/partners/banqup-for-software-partners
[bq-api]: https://docs.btx.banqup.com/docs/api-guides/getting-started/choose-integration
[bq-reg]: https://support.banqup.com/en/articles/274262-connecting-to-peppol
[bq-countries]: https://support.banqup.com/en/articles/274253-registering-on-banqup
[bq-sales]: https://docs.btx.banqup.com/docs/api-guides/e-invoicing/sales-invoice-flow
[bq-sandbox]: https://docs.btx.banqup.com/docs/api-guides/getting-started/faq
[bq-dk]: https://resources.banqup.com/f/318078/x/d20518e338/banqup-group-global-e-invoicing-and-e-reporting-mandates_april-2026-pptx.pdf
