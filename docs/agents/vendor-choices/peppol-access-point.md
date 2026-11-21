# D-121 Peppol access point: vendor comparison

> **Decided by Jabran 2026-11-21:** Inexchange / Maventa (Visma) (fallback Storecove), as recommended. Vendor contact and contracts are Jabran's (see `requests.md`).

Research date: **2026-11-21**. Choice: one Peppol access-point vendor for NO (EHF), SE, DK (incl. NemHandel / OIOUBL), FI (incl. operator network / Finvoice) and IS, covering send, receive, participant lookup, receiver registration (SMP) and status, through an API that a multi-tenant ERP can use to register many companies. Contract refs: BE `docs/api/accounts-docout.md` C-9 (format by receiver), C-15 (`EInvoiceTransport` port, one vendor account per environment, one sub-account per company), C-23 (company receiver registration), D-121 (criteria: OpenPeppol-certified AP + SMP, EU/EEA hosting, inbound conversion to UBL, per-document price, region/DPA/sub-processors recorded before signing, H-7).

Research only. No vendor was contacted, no account or sandbox was opened, no form was sent. Earlier research ([codex-peppol-providers](../codex-peppol-providers/report.md), cut-off 2026-11-01) is the baseline; this file records what changed and re-checks the deciding points.

## 1. What changed since the earlier research

- **Visma merged its Nordic e-invoicing companies.** Inexchange, Maventa, mySupply and efacto operate under the **Inexchange** brand from 1 October 2026; OWS (FI) joined Maventa in August 2026. Visma states no immediate changes to services or contracts. [Maventa announcement](https://maventa.com/blog/four-visma-e-invoicing-companies-merge-to-build-europes-new-powerhouse), [Visma press release](https://mfn.se/all/pr/visma/vismas-inexchange-emerges-as-europes-leading-e-invoicing-solution) (read 2026-11-21). Maventa was on the D-121 shortlist but not evaluated in the earlier report; its public API documentation now answers most D-121 questions, so it is added here.
- **OpenPeppol register** was updated **20 November 2026** (earlier report: 30 October). Certification rows used below come from that version. [Register](https://peppol.org/members/peppol-certified-service-providers/)
- **Denmark guidance** for registered bookkeeping systems was updated **10 November 2026**. [ERST guidance](https://erhvervsstyrelsen.dk/vejledning-nye-krav-til-registrerede-bogfoeringssystemer-effektiv-og-sikker-e-fakturering)
- **Storecove pricing calculator** used by the earlier report now returns 404 (2026-11-21); its prices are not re-verified.

## 2. Official rules a vendor must meet

| Country / body | Rule that matters for the vendor | Source, date read |
|---|---|---|
| **OpenPeppol** | Only certified Service Providers may operate an AP or SMP; certification per entity, AP and SMP listed separately. Message Level Status (MLS) 1.1.0 and the new Peppol Network Policy 1.0.0 were published 2026-07-02; MLS replaces MLR. ISO/IEC 27001 becomes mandatory for all Service Providers in 2027 (date differs by source: 1 July or 1 October 2027). | [Register](https://peppol.org/members/peppol-certified-service-providers/), [eDelivery documents](https://peppol.org/documentation/technical-documentation/edelivery-documentation/), [AgID notice](https://peppol.agid.gov.it/en/news/ISO-IEC-27001-Certification-Mandatory-for-Peppol-Service-Providers-from-1-July-2027/), 2026-11-21 |
| **NO** (Skatteetaten; DFØ Peppol Authority; Digdir runs ELMA) | E-invoice sending duty from **2027-01-01** where the buyer can receive; EHF / Peppol BIS Billing 3.0 or later. A business cannot register itself: the **system supplier** registers it in ELMA **or another Peppol-approved SMP**. | [Skatteetaten](https://www.skatteetaten.no/en/business-and-organisation/start-and-run/best-practices-accounting-and-cash-register-systems/obligation-to-issue-e-invoice/), 2026-11-21 |
| **NO** (Digdir) | A lookup only in ELMA is no longer valid; the valid lookup is the Peppol SML route, because a Norwegian company may sit in another SMP. The Peppol Directory is incomplete. Docout C-11's "ELMA covers it" wording should say "SML/SMP lookup". | [Digdir ELMA page](https://docs.digdir.no/docs/ELMA/elma_open_data) (page updated 2024-09-19), 2026-11-21 |
| **DK** (Erhvervsstyrelsen) | From **2027-03-01** registered bookkeeping systems must validate customers with MitID, enrol them in **NemHandel** unless they opt out within 4 weeks, and show the e-invoice option when the recipient is enrolled. More master-data rules from 2028-01-01. The duty sits with the bookkeeping-system provider (NeoERP, if registered in DK, D-130), not with the AP. | [ERST guidance](https://erhvervsstyrelsen.dk/vejledning-nye-krav-til-registrerede-bogfoeringssystemer-effektiv-og-sikker-e-fakturering) (updated 2026-11-10), 2026-11-21 |
| **DK** (NemHandel) | **NemHandel eDelivery is a separate AS4 network**: access points sign with a **MitID** business certificate (not a Peppol certificate), the only recognised SMP is **Nemhandelsregisteret**, receiving APs must schema-validate before the transport receipt and apply OIOUBL schematrons. A foreign company may not be able to get a MitID certificate. So a Peppol AP reaches NemHandel-only receivers only if it (or a partner) is also a NemHandel AP. | [NemHandel eDelivery FAQ](https://www.digitaliser.dk/nemhandel/vejledninger-nemhandel/faq-regarding-nemhandel-edelivery) (undated; quoted via search index, direct fetch 404 on 2026-11-21) |
| **FI** (State Treasury, Peppol Authority) | Finnish participants use **0216:OVT**. The SP must check customer Business IDs in YTJ and verify representation rights; ID or SP changes within **3 working days**; public-sector IDs in the national ACL directory. These apply to **foreign SPs with Finnish end users too**. ISO 27001 recommended. Most Finnish e-invoice operators are also Peppol SPs. | [State Treasury](https://www.valtiokonttori.fi/en/service/the-state-treasury-is-the-finnish-peppol-authority/) (updated 2026-08-26), 2026-11-21 |
| **SE** (DIGG) | B2G per MDFFS; Peppol BIS 3 default. No new rule found since the earlier report. | [Earlier report](../codex-einvoicing/report.md) |
| **IS** (Fjársýslan, Peppol Authority "FJS") | State buyers accept only structured e-invoices (no PDF); national CIUS ÍST TS 236 on Peppol BIS 3.0. Fjársýslan sets its own SP requirements for Iceland. Separate from the vendor: IS books must be stored in Iceland (hosting doc ACC-R6), which concerns NeoERP's archive, not the AP's transit copy (*verify with an IS adviser*). | [Fjársýslan tender notice](https://island.is/en/o/the-financial-management-authority/news/tender-call-for-bids-for-message-transmission-via-the-peppol-business), [Peppol IS profile](https://peppol.org/learn-more/country-profiles/iceland/), 2026-11-21 |

## 3. Options

Six candidates. Certification is from the register updated 2026-11-20; "AP" and "SMP" mean certified for that legal entity.

### 3.1 Inexchange / Maventa (Visma)

- **Certification:** Visma Software International AS (NO), **AP + SMP**, authority DFØ. Maventa's docs say it is registered in Peppol under that entity. Contract party in the partner agreement: Visma Solutions Oy (FI). [Register](https://peppol.org/members/peppol-certified-service-providers/), [Peppol API guide](https://documentation.maventa.com/peppol-api/)
- **Coverage (public docs, read 2026-11-21):** [Services and reach](https://documentation.maventa.com/services-and-reach/overview/)
  - **NO:** EHF / BIS 3 send and receive; Peppol receiving **registers the company in ELMA automatically**; company must be in Enhetsregisteret. [Norway](https://documentation.maventa.com/services-and-reach/norway/)
  - **SE:** Peppol plus the Swedish operator network (NEA) and Inexchange roaming.
  - **DK:** NemHandel through **Sproom** (Visma-owned). Receiving needs a separate `NEMHANDEL` profile registered by the integrator via `POST /v1/company/profiles` with scheme `9902` (CVR); Maventa does **not** register Danish companies in NemHandel on its own. OIOUBL Application Responses via Sproom. The page lists OIOUBL as "UBL 2.0"; OIOUBL 2.1 in both directions **not confirmed**. [Denmark](https://documentation.maventa.com/services-and-reach/denmark/)
  - **FI:** native Finnish operator and bank (Finvoice) networks, then Peppol (0216). Finvoice 3.0 and TEAPPSXML 3.0. Maventa is itself a Finnish operator (code 003721291126). [Finland](https://documentation.maventa.com/services-and-reach/finland/)
  - **IS:** reached as a Peppol recipient; **registering an Icelandic company (0196) is for "selected partners" only**. IS is not on the Peppol API guide's country list. [Peppol network](https://documentation.maventa.com/integration-guide/peppol/peppol-network/)
- **API:** REST, OAuth bearer token; partner account with **vendor API key** (one per product), one company account per legal entity, separate test (`ax-stage.maventa.com`) and production (`ax.maventa.com`) environments. Send `POST /v1/invoices` (auto or forced route); receive by webhook `DOCUMENTS.INVOICE.RECEIVED` or polling; original or converted download (`return_format`), so inbound conversion to UBL fits C-15/C-23; lookup `GET /v1/lookup/receivers` across PEPPOL and SPROOM; registration `POST/GET/DELETE /v1/company/profiles` with a `NETWORKS` webhook; statuses: sending (about 20 retries over two days), delivered, failed, quarantine; MLS listed as future. Webhooks retry and can duplicate (dedupe by id). Docs are public, incl. an [LLM text dump](https://documentation.maventa.com/llms-full.txt).
- **Price:** **not published**; set in the Maventa Integration Agreement. Published meter: each received invoice billed once per vendor API key on first fetch; printing billed per page.
- **Hosting / DPA:** AWS **Germany and Ireland** (EU/EEA). Sub-processors listed on the Visma Trust Centre, all EU/EEA except Lyanthe B.V. (scanning, uses Philippines sub-processors). Certifications listed: **ISO 27001 and ISAE 3402 Type II** (Visma AS, scope "VCDM"). [Visma Trust Centre](https://visma.com/trust-centre-products/maventa-autoinvoice) (updated 2026-11-21)
- **Onboarding:** partner test account through Maventa integration care; production after the Integration Agreement. Time not published.
- **Exit:** a company moving in must first be deregistered by its previous AP; no migration API described. Moving out: `DELETE /v1/company/profiles`.
- **Risks:** Visma also sells competing ERPs (contract and data-use terms must exclude use of our traffic); merger may change terms ("changes communicated in advance"); Iceland registration limited; DK NemHandel registration is our code, not theirs.

### 3.2 Storecove (Datajust B.V.)

- **Certification:** **AP + SMP**, NL, authority NPA.
- **Coverage:** DK, FI, IS, NO, SE all on the supported list; formats listed: EHF, OIOUBL / NemHandel, Finvoice 3.0, TEAPPSXML 3.0, Svefaktura; legacy Finvoice network via static routing. **Whether Storecove is a NemHandel eDelivery AP or registers receivers in Nemhandelsregisteret is not stated.** [FAQ](https://www.storecove.com/us/en/mystorecove/faq/), [Finvoice](https://www.storecove.com/us/en/networks/finvoice)
- **API:** REST/JSON; legal entities and Peppol identifiers created per entity (per search index of the OpenAPI file; the file itself returned 404 on 2026-11-21); Peppol BIS Schematron validation before sending; webhooks; full docs behind login.
- **Price:** earlier report found published Cloud Accounting tiers (EUR 3,300 / 6,600 / 9,900 per year for 50 / 250 / unlimited entities plus EUR 0.162 / 0.120 / 0.090 per document in the first band). **Not re-verified** (calculator 404).
- **Hosting / certification:** earlier report: privacy policy says Ireland. ISO 27001 claimed; the only certificate found today is a 2020 DigiTrust certificate under the 2017 standard; earlier report found one expiring 2026-08-27. **Current certificate not verified.** [Certificate](https://www.storecove.com/fileadmin/user_upload/achievements/DigiTrust_Certificaat_ISO_27001_Storecove.pdf)
- **Sandbox:** 30 days, no commitment. [Integrator offer](https://www.storecove.com/us/en/solutions/become-an-integrator)
- **Strength:** independent of any ERP vendor; strong ISV focus. **Risk:** DK NemHandel route and FI operator receiving not proven; certificate currency.

### 3.3 Unimaze Software (IS)

- **Certification:** **AP + SMP**, IS, authority FJS (also an AP-only Slovak branch).
- **Coverage:** native Icelandic provider; earlier report found NemHandel connection and OIOUBL profiles; Finnish operators **unknown**; Swedish operator network unknown.
- **API:** public sandbox `mapi-sandbox.unimaze.com` with OpenAPI; partner endpoints `POST /api/v1/partners/parties` (managed party), party registration and receiving-transaction settings, message status, traces, validations, original and transformed documents. Webhooks not seen in the spec excerpt. [Environments](https://developer.unimaze.com/docs/api-integration) (updated 2026-10-03), [OpenAPI](https://mapi-sandbox.unimaze.com/swagger/v1/swagger.json)
- **Price:** usage-based, **not published**. **Hosting:** EEA, Azure; ISO 27001 claimed. [Why Unimaze](https://www.unimaze.com/why_choose_unimaze/)
- **Risk:** smaller company; FI coverage unproven.

### 3.4 ONESOURCE Pagero (Thomson Reuters; Pagero AB)

- **Certification:** **AP only, no SMP** for Pagero AB (register 2026-11-20). Receiver registration would rest on another SMP (*verify which*).
- **Coverage:** broad format catalogue incl. OIOUBL, Finvoice, Svefaktura; Norway mandate updates published. NemHandel and Finnish operator routes not confirmed for partners.
- **API:** partner client credentials, one Pagero Online account per legal entity, OAuth authorization-code grant per customer user, company signup API "after a discussion"; **no webhooks** (polling); no separate test environment (certification / test / production send modes on the live platform). [Partner guide](https://pagero.github.io/partners/partner-integration-guidelines/) (v1.31)
- **Price:** not published. **Hosting:** Sweden and France (earlier report).
- **Risk:** per-customer OAuth and portal accounts fit C-15's "one vendor account per environment" model poorly; no SMP certification.

### 3.5 ecosio (ecosio InterCom GmbH)

- **Certification:** **AP + SMP**, DE, authority KoSIT.
- **Coverage:** documented DK flows on Peppol and NemHandel with OIOUBL 2.1 mapping and the Danish validation packages mandatory from 2026-08-17; documented FI Finvoice / TEAPPSXML and operator route; IS unconfirmed. [Denmark](https://connect.ecosio.com/docs/compliance-for-denmark)
- **API:** Messaging API and Management API for companies under a partner account; participant registration arranged with an integration engineer (earlier report).
- **Price:** not published. **Hosting:** Frankfurt **and Zürich** (earlier report); Switzerland is outside the EU/EEA, so EEA-only needs a contract term.

### 3.6 Considered, not shortlisted

- **Tickstar** (AP + SMP, SE): strong SMP Manager API, but national-network conversion (NemHandel, Finnish operators) left to us. [Earlier report](../codex-peppol-providers/report.md)
- **Banqup / Unifiedpost** (AP + SMP via Unifiedpost GmbH): Iceland not in onboarding list; customer-account onboarding. [Earlier report](../codex-peppol-providers/report.md)
- **Qvalia** (AP + SMP, SE): lead only; Nordic national networks not checked.

## 4. Comparison table

Legend: **Yes** = stated on a first-party page read 2026-11-21; **Earlier** = from the 2026-11-01 report, not re-read; **?** = not found.

| Criterion | Inexchange / Maventa | Storecove | Unimaze | Pagero | ecosio |
|---|---|---|---|---|---|
| AP + SMP certified | Yes / Yes | Yes / Yes | Yes / Yes | Yes / **No** | Yes / Yes |
| NO EHF send + receive, ELMA | Yes, ELMA automatic | Yes (listed) | Earlier | Earlier | Earlier |
| SE | Peppol + operator network | Listed | ? operator | Catalogue | ? |
| DK NemHandel / OIOUBL | Yes via Sproom; registration API (9902); OIOUBL version ? | Listed; NemHandel AP ? | Earlier | Catalogue | Yes (Peppol + NemHandel) |
| FI operator / Finvoice | Yes, native operator + bank | Listed (static routing) | ? | Catalogue | Yes, operator partner |
| IS (0196) | Send yes; **register "selected partners"** | Listed | Yes, native | ? | ? |
| Receiver registration by API | Yes (`/v1/company/profiles`) | Per entity (index) | Yes (partner parties) | Signup API on request | Via engineer |
| Lookup API | Yes (PEPPOL, SPROOM) | Yes | Yes (parties) | ? | Earlier |
| Inbound original + UBL | Yes (`return_format`) | ? | Yes (original, transformed) | Yes (source/target) | Earlier |
| Webhooks | Yes | Yes | ? | No (polling) | Earlier |
| Test environment | Yes (ax-stage) | 30-day sandbox | Public sandbox | Send modes on live | Earlier (TEST) |
| Price published | No (meters partly) | Earlier yes, now 404 | No | No | No |
| EU/EEA hosting | Yes (AWS DE + IE) | Earlier (IE) | Yes (EEA, Azure) | Earlier (SE + FR) | **Earlier DE + CH** |
| ISO 27001 / audit | Yes (Visma ISO 27001 + ISAE 3402) | Claimed; current cert ? | Claimed | Earlier | Earlier |
| Conflict of interest | Visma sells ERPs | None known | None known | None known | None known |

## 5. Recommendation

**Pick: Inexchange / Maventa (Visma).** Reasons:

1. It is the only candidate whose **public** documentation covers every D-121 route: NO with automatic ELMA, SE operator network, **DK NemHandel receiving and registration through the API**, **FI operator and bank networks natively**, plus Peppol for all.
2. Its model fits C-15 directly: one partner account with a vendor API key per environment, one company account per legal entity, receiver registration, lookup, status and inbound feed all by REST, with a test environment separate from production.
3. The DK 2027 rules put NemHandel enrolment on the bookkeeping-system provider; Maventa exposes exactly that call (`NEMHANDEL` profile, scheme 9902), so C-23 can meet it without a second network contract.
4. EU/EEA hosting (AWS Germany and Ireland), a published sub-processor list and current ISO 27001 + ISAE 3402 reports cover H-7 and C4 better than any other candidate today.

**Fallback: Storecove.** Independent of any ERP vendor, AP + SMP, all five countries listed, 30-day sandbox and (earlier) published ISV pricing. It becomes the pick if Visma's terms are unacceptable (price, data-use or competitor clauses) or if it will not enable Icelandic registration. Before switching, Storecove must prove the DK NemHandel route and a current ISO 27001 certificate.

**Iceland gap.** If Inexchange will not enable 0196 registration for NeoERP, options are: (a) the fallback for all countries, or (b) Unimaze for Iceland only as a second `PeppolAccessPointAdapter` instance behind the same port. (b) breaks "one vendor"; decide only when an IS customer is near.

**Norway timing.** The NO duty starts in 6 weeks (2027-01-01). A contract, a test pass and production onboarding before that date are unlikely for any vendor; the NO duty bites only for NO tenants that issue invoices to ELMA/SML-registered buyers, so plan the first NO tenant go-live after the vendor passes the evaluation in the earlier report §3.

## 6. What Jabran must do or sign

1. **Approve vendor contact** (a separate decision): the lead asks Inexchange / Maventa integration care for a partner test account and a written offer; Storecove in parallel as fallback. Nothing has been sent.
2. **Sign the Maventa Integration Agreement** (party: Visma Solutions Oy; *verify after the merger*) with the price annex. Ask for: one agreement for many unrelated companies, fixed per-document and per-company prices, receiving meter (per vendor API key), no minimum before go-live, and a clause that Visma will not use NeoERP traffic or customer data for its own ERP sales.
3. **Sign the Visma DPA** and record region (AWS Germany + Ireland), sub-processor list and ISO 27001 / ISAE 3402 reports in hosting row **H-7** before go-live; opt out of scanning services so Lyanthe B.V. (Philippines) is not used.
4. **Written confirmations** before signing: Icelandic 0196 registration enabled for NeoERP; OIOUBL 2.1 both directions via Sproom; MLS support date; exit steps (deregistration within the Finnish 3-working-day rule, export of all documents and statuses).
5. **Company KYC for the partner account:** NeoERP's legal entity and an authorised signatory.
6. **Denmark:** the DK registered-bookkeeping-system decision (D-130) stays Jabran's; if yes, NeoERP must build MitID validation and opt-out notices itself (the AP does not).
7. **BE lead:** record the choice in Docout D-121 and change C-11 from "ELMA covers it" to "SML/SMP lookup" (Digdir).

## 7. Not verified

- **Maventa / Inexchange:** prices; production onboarding time; OIOUBL 2.1 (page says UBL 2.0) both directions; whether Iceland 0196 can be enabled for us; MLS support date; post-merger contract party and terms; whether the ISO 27001 "VCDM" scope covers Maventa; sub-processor "not listed" locations on the Trust Centre; competitor / data-use terms.
- **Storecove:** current prices (calculator 404 on 2026-11-21); current ISO 27001 certificate; NemHandel eDelivery AP status and Nemhandelsregisteret registration; Finnish operator receiving; current hosting region; OpenAPI paths (search index only).
- **Unimaze:** webhooks; Finnish and Swedish operator coverage; NemHandel route today; prices; Azure regions.
- **Pagero:** which SMP registers receivers; NemHandel and Finnish operator routes for partners; prices; hosting re-check.
- **ecosio:** whether Zürich can be excluded; IS onboarding; prices.
- **Official sources:** exact MLS mandatory dates (sources give 1 March or 31 March 2027; MLR retirement 1 May 2027 from one secondary source); the ISO 27001 deadline (1 July vs 1 October 2027); the Peppol Network Policy 1.0.0 content (PDF could not be read here); the NemHandel FAQ certificate position (page undated); Fjársýslan's specific SP requirements for Iceland; whether IS storage rules apply to AP transit copies.

## Later option: NeoERP as its own Peppol access point (Jabran 2026-11-21)
Start with a certified access-point vendor so Norway's e-invoicing is not delayed. When customer volume justifies it, NeoERP may become its own certified Peppol access point and SMP (OpenPeppol membership, certification through the national authority, ISO 27001, round-the-clock operations, conformance tests). NemHandel (DK) and the Finnish operator network would still need their own connections. The `EInvoiceTransport` port (docout C-15) keeps the switch possible without changing the modules. Official direct routes stay direct: PRAL in Pakistan and every country's tax filing.
