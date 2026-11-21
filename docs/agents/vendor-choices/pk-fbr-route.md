# D-125: Pakistan FBR Digital Invoicing route (PRAL direct vs licensed integrators)

Research date: **2026-11-21**. Research and recommendation only. Nobody at FBR, PRAL or any integrator was contacted, nothing was signed up for, and no API was called. Contract refs: BE `docs/api/accounts-docout.md` C-16 and Amendment DO-FBR. Workspace `docs/agents/codex-einvoicing/report.md` §PK and `docs/agents/professional-checks-pk.md` R8.

**Confidence labels:**
- **Verified** means read in the official FBR or PRAL document linked, on 2026-11-21.
- **Secondary** means read only in a third-party page.
- **Not verified** means no source was found.

## 1. Summary

- **Recommended route: PRAL direct.** PRAL is the free licensed integrator under rule 150XF. Each Pakistani tenant applies in its own IRIS account and names NeoERP as its "ERP/System Provider". NeoERP builds one integration against the official PRAL DI API and runs the same code for every tenant. The token, IP whitelisting and sandbox scenarios are separate for each tenant.
- **Fallback: a licensed integrator for single tenants**, behind the same `FiscalProvider` port with a configurable gateway. Use it when PRAL onboarding is blocked for a tenant, or when the tenant already uses an integrator. STGO 01/2026 allows more than one licensed integrator. No integrator publishes an ERP-facing API, prices or hosting details, so the fallback needs a written request for information (RFI) before a pick.
- **Not now: Neovatus as a licensed integrator.** Rule 150XH needs, among other things, a Pakistani-incorporated company, three years of audited accounts and Rs 10 million paid-up capital.

## 2. Official sources read (2026-11-21)

| Key | Document | Link | What it settles |
|---|---|---|---|
| TA | FBR "Digital Invoicing Technical Assistance" page | https://www.fbr.gov.pk/di-technical-assistance/173967/173970 | It still links **DI API v1.12** as the only API document. It gives no access instructions. |
| API | PRAL "Technical Specification for DI API" **v1.12** (51 pages; issued 7 Apr 2025, last update 24 Jul 2025) | https://download1.fbr.gov.pk/Docs/20257301172130815TechnicalDocumentationforDIAPIV1.12.pdf | **Read in full** (downloaded and text-extracted; every page has a text layer). Covers endpoints, payload, responses, reference APIs, QR, error codes, scenarios. |
| UM | PRAL "Digital Invoicing User Manual" **v1.5** (20 pages; last update 29 Jul 2025) | https://download1.fbr.gov.pk/Docs/20257301171649798DIUserManualV1.5.pdf (linked from https://www.fbr.gov.pk/di-technical-assistance/173967/174202) | **Read in full.** Exact IRIS onboarding steps, IP whitelisting, sandbox, production token, resubmission, support portal (DICRM). |
| FAQ | FBR DI FAQs | https://fbr.gov.pk/faqs/173967/173969 | Integration goes through a licensed integrator. PRAL is free on demand. No fee is paid to FBR. Integrator fees are capped by a sales tax general order (STGO). The SRO 709 dates on this page are stale; SRO 1852 superseded them. |
| LI | FBR "List of License Integrators" | https://www.fbr.gov.pk/list-of-license-interprator/173967/173971 | **8 entries** (the earlier research found 4). The page is undated. |
| STR | Sales Tax Rules 2006, FBR consolidation updated to 31 Jul 2026, Chapter XIV rr.150Q–150XQ (printed pp.88–95) | https://download1.fbr.gov.pk/Docs/202691810951482SalesTaxRules.pdf | Licensing (150XE), PRAL as integrator (150XF), application documents (150XH), procedure (150XI), licence rights (150XJ), fees (150XO), invoice particulars (150R(13)), offline mode (150XC). |
| SRO 1666 | S.R.O. 1666(I)/2026, 29 Sep 2026 (not re-read; relied on R8's verified reading) | https://download1.fbr.gov.pk/SROs/202693089244653SRO1666dated29-09-2026.pdf | Adds FED and ICT to the DI scope, the FED particulars (aa)–(ff), and **advance receipt invoices** under r.150S(2). An integrator licence covers FED and ICT. |
| SRO 1852 | S.R.O. 1852(I)/2025, 24 Sep 2025 (R8) | https://download1.fbr.gov.pk/SROs/2025924149054920SRO1852.pdf | All phase dates have passed. Every sales-tax-registered person is in scope. |
| STGO 1/26 | Sales Tax General Order 01 of 2026, 30 Mar 2026 | https://download1.fbr.gov.pk/Docs/2026331133557466STGO01of2026.pdf | **Re-read.** "One or more licensed integrators" may be engaged. A bona fide mistaken invoice may be cancelled, deleted or edited only "through the Board's computerized system" within **72 hours**; after that the Commissioner must approve. |
| LC | Licensing Committee notifications; latest 23 Feb 2026 | https://www.fbr.gov.pk/fbr-licensing-committee/173967/173977 ; https://download1.fbr.gov.pk/Docs/20262261023132984LicencingCommittee.pdf | The committee has two PRAL members. Its terms of reference include preparing a "Request for Proposal (RFP) as per new rules and scope". |
| EOI | FBR Expression of Interest for integrator licences (2025) | https://download1.fbr.gov.pk/Tenders/202551710513431EOI.pdf | Applications go online through the DI licensing portal in IRIS, "by 15th of every month". Eligibility follows r.150XH. |
| LP | FBR "Digital Invoicing Legal Provisions" page | https://www.fbr.gov.pk/di-legal-provisions/173967/173968 | It lists only SRO 69(I)/2025, SRO 709 and a 2025 extension. It has not been updated for SRO 1852, STGO 1/26 or SRO 1666. |
| SRO 288 | S.R.O. 288(I)/2026, 18 Feb 2026: **draft** Income Tax Rules Chapter VIIA "Online integration of businesses" | https://download1.fbr.gov.pk/SROs/2026218112270512SRO288dated18.02.2026.pdf | It mirrors Chapter XIV for income tax, with PRAL again free under draft r.33N. **Whether it became final, and who is in its Schedule, was not verified.** |

**Changes since the earlier cut-off of 2026-10-31:**
- No newer API document was found. The FBR technical page still links v1.12, and a web search found no v1.13 or v2.
- The legal-provisions page is unchanged.
- No new DI SRO or STGO after SRO 1666 was found. This is a negative search result, not proof that none exists.
- The integrator list now has 8 names.

## 3. What the DI API v1.12 actually says (verified, read in full)

### 3.1 Endpoints

| Purpose | Method and URL | Notes |
|---|---|---|
| Post invoice, production | `POST https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata` | Returns the FBR invoice number. |
| Post invoice, sandbox | `POST https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb` | Needs `scenarioId`. |
| Validate, production | `POST https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata` | Same payload. Returns status but no number. |
| Validate, sandbox | `POST https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb` | |
| Provinces | `GET https://gw.fbr.gov.pk/pdi/v1/provinces` | |
| Document types | `GET https://gw.fbr.gov.pk/pdi/v1/doctypecode` | Returns only 4 "Sale Invoice" and 9 "Debit Note". |
| HS codes | `GET https://gw.fbr.gov.pk/pdi/v1/itemdesccode` | |
| SRO item codes | `GET https://gw.fbr.gov.pk/pdi/v1/sroitemcode` | |
| Transaction types | `GET https://gw.fbr.gov.pk/pdi/v1/transtypecode` | |
| UoM | `GET https://gw.fbr.gov.pk/pdi/v1/uom` | |
| SRO schedule | `GET https://gw.fbr.gov.pk/pdi/v1/SroSchedule?rate_id=…&date=…&origination_supplier_csv=…` | |
| Rates by sale type | `GET https://gw.fbr.gov.pk/pdi/v2/SaleTypeToRate?date=…&transTypeId=…&originationSupplier=…` | |
| HS to UoM | `GET https://gw.fbr.gov.pk/pdi/v2/HS_UOM?hs_code=…&annexure_id=…` | |
| SRO items | `GET https://gw.fbr.gov.pk/pdi/v2/SROItem?date=…&sro_id=…` | |
| Active-taxpayer (STATL) | `https://gw.fbr.gov.pk/dist/v1/statl`, body `{"regno","date"}` | The document says GET but shows a JSON body (**not verified** which method is used). |
| Registration type | `https://gw.fbr.gov.pk/dist/v1/Get_Reg_Type`, body `{"Registration_No"}` | Same GET/body ambiguity. |

**Contradiction inside v1.12.** Page 7 says the URLs "will remain the same for Sandbox and Production", with routing "based on the security token being used". Yet it lists separate `_sb` URLs. Build both as configuration and confirm in the sandbox.

**Not in v1.12:**
- no cancel or delete endpoint
- no status or lookup query by FBR number or by seller reference
- no idempotency key or duplicate rule
- no QR image in the response
- no rate limits or SLA
- no timeout guidance

### 3.2 Token issuance (verified)

- **Issuer and validity (API §3.1).** PRAL issues the security token "to Supply Chain Operators along with all URLs". It is valid for **5 years** and goes in the `Authorization: Bearer <token>` header. On expiry the operator requests a new token, and one "will automatically be issued".
- **Per taxpayer, not per software.** The token is shown inside the taxpayer's own IRIS Digital Invoicing screens: a sandbox token, then a production token (UM §4.1.1). Error **0401** reads "the authorized token does not exist against seller registration number". Error **0402** is the same for the buyer. So a token is bound to the seller's NTN/CNIC.
- **Consequence for NeoERP.** One token per tenant company and environment. This matches C-16 and the C-28 credential rules.

### 3.3 Request payload (verified)

**Header fields:**
- `invoiceType` ("Sale Invoice" / "Debit Note")
- `invoiceDate` (YYYY-MM-DD)
- `sellerNTNCNIC` (7 or 13 digits), `sellerBusinessName`, `sellerProvince`, `sellerAddress`
- `buyerNTNCNIC` (optional when the buyer is unregistered), `buyerBusinessName`, `buyerProvince`, `buyerAddress`
- `buyerRegistrationType` (Registered / Unregistered)
- `invoiceRefNo`: needed only for a debit note; it is the original FBR number, 22 digits for an NTN seller or 28 for a CNIC seller
- `scenarioId`: sandbox only
- `items[]`

**Item fields:**
- `hsCode`, `productDescription`
- `rate`: the rate description text from SaleTypeToRate
- `uoM`: the UoM description text
- `quantity`, `totalValues`, `valueSalesExcludingST`, `fixedNotifiedValueOrRetailPrice`
- `salesTaxApplicable`, `salesTaxWithheldAtSource`, `extraTax`, `furtherTax`
- `sroScheduleNo`, `sroItemSerialNo`
- `fedPayable`, `discount`
- `saleType`

**Fields that are missing:**
- The v1.12 schema has **no field for the seller's own invoice number** and **no reason field** for notes. The error codes still refer to both: 0041 "Provide invoice No.", 0088 for the alphanumeric invoice number format, and 0027 and 0028 for the reason and remarks. So the live engine checks fields that the published schema does not show (**not verified**).
- It has none of the SRO 1666 FED particulars (aa)–(ff), and no advance-receipt type.

### 3.4 Response schema (verified)

**Valid post response:**
- Top level: `invoiceNumber`, for example `7000007DI1747119701593` (seller NTN + "DI" + 13 digits), and `dated`.
- `validationResponse` holds `statusCode` "00", `status` "Valid", `error` "", and `invoiceStatuses[]`.
- Each `invoiceStatuses[]` entry has `itemSNo`, `statusCode`, `status`, `invoiceNo` (`<FBR number>-<item>`), `errorCode` and `error`.

**Invalid responses** come in two shapes:
- An error at header level: `statusCode` "01" with an `errorCode`, and `invoiceStatuses: null`.
- Errors per item: the header shows **`statusCode` "00" but `status` "invalid"**, and the item shows `statusCode` "01" with its `errorCode`.

**Parser rule:** treat a post as accepted only when an `invoiceNumber` is present **and** every item is "00". Never rely on the header code alone.

**HTTP codes:** only 200, 401 and 500 ("Contact Administrator") are documented.

### 3.5 Validation (verified)

- `validateinvoicedata` takes the same payload and returns the same status structure without a number. This fits C-16's validate-at-submit step.
- The **Sales error codes** (0001–0300, 0401–0402) cover:
  - seller and buyer registration checks against FBR records (0001, 0082, 0106, 0107, 0108)
  - HS code against sale type (0052) and UoM against HS code (0099)
  - rate against sale type (0046, 0079)
  - recalculated tax checks: 3rd Schedule (0102), percentage (0104), quantity-based (0105)
  - decimal formats (0300)
  - sector-specific rules: steel, cotton ginners, petroleum, potassium chlorate
- A separate set of **Purchase error codes** (0156–0177) exists.
- So FBR checks registration status and tax arithmetic on the server. NeoERP's pickers must use the reference APIs, which are cached per day under C-16.

### 3.6 Scenarios (verified)

- The sandbox needs at least one successful invoice for each assigned scenario (UM FAQ 19).
- There are 28 scenarios, **SN001–SN028**. Examples: standard rate to registered and unregistered buyers, reduced, exempt, zero-rated, 3rd Schedule, steel, ship breakers, cotton, telecom, petroleum, electricity, CNG, mobile phones, FED in ST mode for goods and services, services, EVs, cement, SRO 297, pharma, and retail-to-consumer (SN026–028 apply only to taxpayers registered as retailers).
- **Table 10 assigns scenarios from Business Activity × Sector.** For example, "Service Provider / Services" needs only SN018 and SN019, while "Manufacturer / All other" needs 11 scenarios.
- The business nature and sector are chosen in IRIS for each taxpayer, so **each tenant's scenario set depends on that tenant**.

### 3.7 Credit and debit notes, corrections (verified, with gaps)

- Only "Debit Note" (type 9, with `invoiceRefNo`) is exposed in the schema.
- The error table nevertheless enforces **credit-note** rules:
  - 0034: within **180 days** of the original
  - 0029 and 0035: the note date must be on or after the original's date
  - 0036 and 0037: a credit note's value must not exceed the original
  - 0057: the reference invoice must exist
  - 0064: "Credit note is already added to a invoice", which suggests one credit note per invoice
  - 0067 and 0068: tax amount checks
  - 0071: "Credit note allowed to add only for specific users"
- **How a seller submits a credit note through v1.12 is not specified.** Error 0071 suggests credit notes may be restricted. This must be asked through DICRM and proven in the sandbox before building. The open item in C-16 stays open.
- **Cancellation.** STGO 01/2026 allows cancel, delete or edit within 72 hours only "through the Board's computerized system". No API method exists in v1.12. A secondary source names a `cancelinvoicedata` endpoint (**secondary, not verified**). Assume a manual IRIS action until PRAL confirms.
- **Advance receipt invoices** (SRO 1666, r.150S(2)) have no document type in v1.12 (**not verified** how to submit them).

### 3.8 Duplicates and timeouts (verified as absent)

- The user manual (§5.1) says the system "does not support automatic retries for failed uploads". After a connection loss the invoice "must be submitted again", and the taxpayer reconciles in the IRIS **Invoice Dashboard**, which can be searched by period and type and exported to PDF.
- No duplicate detection is documented, and nothing can be looked up by seller reference.
- **Design consequence:** after an ambiguous timeout, a blind re-post can create a second FBR number. NeoERP should:
  1. Keep the invoice PENDING_RECONCILE.
  2. Re-post only after a person, or a later reconciliation feed, confirms nothing was registered.
  3. Cancel any duplicate FBR number within the 72-hour window.

  This confirms the earlier warning on C-36: a local idempotency key is not proof of exactly-once processing at FBR.
- A secondary source reports 998 of 1,000 sent invoices appearing in the portal, and recommends daily reconciliation (**secondary**).

### 3.9 Fiscal invoice number and QR (verified, with conflicts)

| Item | Sales Tax Rules r.150R(13) | DI API v1.12 §6 | Consequence |
|---|---|---|---|
| FBR invoice number | "XXXXXX-DDMMYYHHMMSS-0001" | Returned as `7000007DI1747119701593`, i.e. NTN + DI + 13 digits; 22 digits for an NTN seller, 28 for a CNIC seller | Store and print the API value exactly as returned, as text of up to 28+ characters. Do not validate it against the rule's pattern. |
| QR size | "7X7MM" | "Version: 2.0 (25×25)", "1.0 x 1.0 Inch" | The two official texts conflict. C-16 prints 7×7 mm version 2. Ask PRAL which size the buyer verification scan needs; until then the PK template keeps the size configurable. |
| QR content | "on the base of unique FBR invoice number" | Not stated | Encode the FBR number (**not verified** whether any other payload is expected). |
| Logo | FBR DI logo required | The DI logo must be printed on every invoice | As in C-16. |
| Software registration number | r.150R(13)(c) requires it | Not mentioned anywhere in v1.12 or UM v1.5 | **Not verified** who issues it, or whether it is the integration application ID in IRIS. Ask PRAL. |

## 4. How access actually works (verified from UM v1.5)

### 4.1 Who registers

- **The taxpayer (the tenant company), not the software vendor.** The process starts when the taxpayer logs in to **IRIS** "by entering your registration number and password". The taxpayer then opens Digital Invoicing and picks the integration mode: API Integration or Manual Invoice Generation.
- **Consequence:** Neovatus cannot get a sandbox token on its own. It needs a sales-tax-registered NTN/STRN holder with IRIS access to apply. That can be a Neovatus Pakistan entity, if one exists, or a pilot company. No pilot has been decided (Jabran 2026-11-21).
- **Not verified:** whether an NTN holder without sales tax registration can open the DI module at all. Error 0001, "Seller not registered for sales tax", suggests it cannot.

### 4.2 PRAL route, step by step

1. In IRIS, go to Digital Invoicing → API Integration → **"Proceed with PRAL as Licensed Integrator"** → Submit.
2. Fill in **Technical Details**:
   - technical contact person, mobile and email
   - **ERP/System Provider**
   - software type (Cloud / On Premises) and software version
   - a CRM user ID (email) and password for the DICRM support portal
   - **Business Nature** (several allowed) and **Sector** (one), which set the sandbox scenarios
3. Fill in **IP Whitelisting**: hosting server company name, **hosting server country**, and 1–3 IP addresses, or an `.xls` file of up to 1 MB for more. Then Submit.
4. The PRAL Data Centre accepts or rejects the IPs "within 2 working hours", and sandbox testing starts automatically.
5. The **Sandbox Environment** tab shows the API details, sample JSON, sample code and the **sandbox token**. Post scenario invoices; each one returns a unique number.
6. Once every assigned scenario has at least one success, the system **automatically generates the production token**.
7. The **Production Environment** tab shows the production API details and the **security token**. Switch endpoints and post in real time.
8. Support: DICRM at https://dicrm.pral.com.pk. The technical contact logs in through the "DI-Support" option with the CRM email from step 2. Case attachments are PDF only; the limit is 5 MB in UM §6 and 20 MB in UM FAQ 25 (another inconsistency).

**Cost:** free under r.150XF(2) and UM §4.1. No FBR fee is charged either (FAQ Q8).

**Time:** IP approval takes about 2 working hours. The rest depends on how fast NeoERP passes the assigned scenarios. No PRAL review or approval step after the sandbox is documented, since the production token is automatic.

### 4.3 Licensed-integrator route

1. In IRIS, choose **"Proceed with Other as Licensed Integrator"**, pick the integrator from the drop-down and submit the technical details.
2. **The integrator accepts the application.** It then handles IP whitelisting and the sandbox; "PRAL does not perform IP whitelisting" in this case.
3. Fees: integrators "may charge certain fee". Rule 150XO caps the fee at a threshold "specified by the Board through a sales tax general order". **No such STGO was found**, so the cap is not verified.

### 4.4 Can one software provider serve many taxpayers with one integration?

- **Technically: yes, for each tenant.** The code, endpoints and payload are the same for everyone. Each tenant needs:
  - its own IRIS application, naming NeoERP as the ERP/System Provider
  - its own token per environment
  - its own scenario run, matching that tenant's business nature and sector
  - its own IP whitelisting entry listing **NeoERP's egress IPs**
- **Operational consequence.** NeoERP needs a small set of **stable egress IPs** in the PK region (go-live row H-6): at most three per application, or the `.xls` upload. Changing those IPs means re-whitelisting every PK tenant. One forum user reports that an Azure India-region IP was blocked and the problem went away after moving to the UAE North region (**secondary, anecdotal**). Whether non-Pakistani hosting countries are accepted is **not verified**.
- **Legal: probably yes, but not confirmed.**
  - r.150XE(1): "Save as provided in rule 150XF, no person shall carry out integration of the notified registered persons through software unless he has obtained a license".
  - In the PRAL route, PRAL is the licensed integrator of record for each taxpayer, and the IRIS form expects an outside "ERP/System Provider".
  - Third-party ERP connectors run on exactly this model with the customer's own token. One Odoo connector says plainly that it is "not a licensed FBR integrator" (**secondary**).
  - But no FBR text says whether a SaaS vendor operating the connection for many taxpayers is "carrying out integration". This needs a PK tax lawyer's opinion. It can be joined to the existing ACC-R24 opinion.
  - In the integrator route, r.150XJ(3) bars the licence from being transferred or "used by any sub-contractor". NeoERP would be the integrator's customer-side software, not a sub-licensee.

### 4.5 Becoming a licensed integrator (rule 150XH; verified)

- **Application documents:**
  - company profile, staff list, and evidence of ERP and payment integration capacity
  - **P@SHA** (Pakistan Software Houses Association) **or ICAP** (Institute of Chartered Accountants of Pakistan) registration certificate
  - **audited accounts for 3 years**
  - major clients
  - **incorporation under the (Pakistani) Companies Act** and **NTN**
  - **paid-up capital at least Rs 10 million**
  - sales tax registration if required, and directors' CNICs
  - a no-blacklisting undertaking
  - projects of the last 3 years
- **Procedure:** apply online through the IRIS licensing portal by the 15th of a month (EOI). The committee evaluates within 7 days and recommends or rejects within 15 days (r.150XI). The licence lasts 5 years and is renewed 3 months before expiry (rr.150XJ–150XK).
- **Outlook:** the committee's terms of reference now mention an RFP "as per new rules and scope" (Feb 2026 notification), so the process may change. Not feasible for Neovatus before it has a Pakistani entity with a three-year audited history.

## 5. Options

| # | Option | Coverage | API style | Price (as published, 2026-11-21) | Hosting, DPA, sub-processors | Certifications | Onboarding | Sandbox | Support | Lock-in and exit | Known risks |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A | **PRAL direct** (r.150XF; listed as #4, no licence number shown) | All federal sales tax DI; FED and ICT deemed covered by SRO 1666 / r.150XE(4). Not provincial services tax. | Official REST JSON v1.12, bearer token per taxpayer | **Free** (r.150XF(2), UM) | PRAL data centre in Pakistan, a state-owned FBR company. No DPA or sub-processor list published (statutory channel). | Not published | Per tenant in IRIS; IP approval about 2 working hours; production token automatic after scenarios | Yes, per tenant, scenario-based | DICRM tickets; no SLA published | **None.** This is the base API that every integrator also calls. A tenant can switch to an integrator in IRIS. | Spec lags the law (no credit note, advance or FED fields); no idempotency, status or cancel API; per-tenant IP whitelisting; outages reported (secondary) |
| B | **Haball (Pvt) Ltd**, "Wasal" (licence 398586644, NTN 7623346) | DI registration of invoices, queue, validation, QR (vendor page) | Not published; "Request a demo" | Not published | Not published | Not published | Not published | Not published | Not published | Proprietary gateway; exit = re-apply in IRIS | First private licence (2024, press). Unknown ERP API. |
| C | **WEBDNAWORKS (Pvt) Ltd** (licence 394537651) | DI (licence certificate) | Not published | Not published | Not published | Not published | Not published | Not published | Not published | As B | Nothing public beyond the licence |
| D | **EY Ford Rhodes** (licence 649954048) | DI; consultancy-led integration | Not published | Not published | Not published (EY network policies not checked) | Not published for this service | Not published | Not published | Not published | As B | Likely project-priced consulting, not a per-call API (**not verified**) |
| E | **OpenPort Pakistan, TMR Consulting, NatureTech, Dynamic Resources** (licences 715193372, 620903892, 555378169, 90332116; certificates 2025–2026) | DI (official list) | Not published | Not published | Not published | Not published | Not published | Not published | Not published | As B | No public product information found |
| F | **Neovatus as a licensed integrator** | Same as A, plus the right to "install, configure, integrate, operate" for third parties | Same official API | Licence fee not published; Rs 10 million paid-up capital; audited accounts | Own | Own | ≤ 15 days of evaluation once eligible; Pakistani entity needed first | — | — | — | Not eligible now; 5-year licence with renewal; penalties under s.33 |

**Price benchmark (secondary only):** one vendor blog quotes managed platforms at Rs 1,500–8,000 per business per month. The FAQ's fee cap STGO was not found.

**EU/EEA hosting:** no Pakistani option is EU/EEA-hosted. DI data flows from NeoERP's PK region (H-6) to PRAL in Pakistan, so the H-7 record for PRAL is "statutory authority channel, Pakistan, no DPA". Each private integrator would need its own H-7 row: region, DPA and sub-processors.

## 6. Recommendation

**Pick: A, PRAL direct.**
- It is free, and it is the official API behind every integrator.
- One NeoERP integration serves every PK tenant.
- There is no commercial contract, DPA or lock-in.
- C-16 already assumes it: tokens per company and environment, validate then post, and the reference caches.
- Integrators publish nothing about an ERP-facing API, price, hosting or certifications, so choosing one now would be blind.

**Fallback: one licensed integrator for single tenants**, behind the same `FiscalProvider` port with a per-tenant gateway URL. Use it when a tenant already has an integrator or the PRAL route is blocked. Choose B or C after a written RFI asking for the ERP API, price, hosting, DPA and SLA.

**Keep F (own licence) as a later option**, once there is a PK entity and enough PK volume.

**Design consequences for C-16 (lead to amend after Jabran decides; this file does not edit the contract):**
1. Onboarding wizard per tenant. It shows the exact IRIS steps, NeoERP's egress IPs, hosting country and business nature/sector help. It takes the sandbox and production tokens through the write-only C-28 credential flow, never by email or chat.
2. Stable PK-region egress IPs (P-6, H-6). Keep them as few as possible and never rotate them casually.
3. Make the sandbox URL style configurable (`_sb` or token routing).
4. Accept only when `invoiceNumber` is present and every item status is "00".
5. Treat a timeout as PENDING_RECONCILE, with no automatic re-post. Daily reconciliation against the dashboard or export. Cancel within the 72-hour window.
6. Store the FBR number as text of at least 28 characters. QR size configurable (7 mm in the rule vs 1 inch in the API).
7. Credit note, advance receipt, FED fields and cancellation stay **blocked until confirmed** (ACC-R25).

## 7. What Jabran or Neovatus must do

### 7.1 To get sandbox access (PRAL route)

1. **Decide the sandbox taxpayer.** It must be a Pakistani company that is sales-tax-registered and has IRIS access, either a Neovatus Pakistan entity (if one exists or is planned) or a willing pilot company. Neovatus cannot apply without such an NTN/STRN holder.
2. **Warn the pilot.** Finishing the sandbox automatically creates that company's **production** token. If the pilot already fiscalises through another provider, check first that a second application does not disturb its live integration (**not verified**). STGO 01/2026 does allow more than one integrator.
3. **Fix NeoERP's egress for PK.** Set 1–3 static IPs in the hosting region chosen under H-6, with the hosting company name and country. A sandbox can start from a dev egress IP and add the production IPs later via the `.xls` upload.
4. **Name the NeoERP technical contact** (name, mobile, email) and a **DICRM support login** (email and password) that Neovatus controls.
5. **The taxpayer logs in to IRIS** and completes Digital Invoicing → API Integration → "Proceed with PRAL as Licensed Integrator":
   - ERP/System Provider: NeoERP / Neovatus
   - software type: Cloud; the version
   - the business nature(s) and sector that match the pilot
   - the IP whitelisting details
   - then Submit
6. **Wait for IP approval** (about 2 working hours), then read the sandbox token in IRIS. The taxpayer enters it into NeoERP's credential screen as SANDBOX (C-28). Nobody pastes it into email or chat.
7. **Raise DICRM cases** (Jabran or the named technical contact, not a researcher). Ask about:
   1. the credit-note and advance-receipt document types and the reason fields
   2. the SRO 1666 FED fields and any newer spec after v1.12
   3. a cancel API vs manual IRIS cancel within 72 hours
   4. duplicate and timeout behaviour, and any status lookup
   5. QR size and content, and the r.150R(13)(c) software registration number
   6. whether foreign-hosted IPs are accepted
   7. confirmation that one ERP vendor may serve many taxpayers under the PRAL route
8. **Obtain a PK tax lawyer's opinion** on r.150XE(1) for a multi-tenant SaaS under the PRAL route. Add it to the ACC-R24 engagement.

**Cost:** nil to FBR or PRAL. **Time:** hours for IP approval. The scenario run waits on the NeoERP build of `FbrDiFiscalProvider`.

### 7.2 For production (per tenant)

Each tenant repeats steps 5–6 in its own IRIS account and passes its assigned scenarios, at least once per scenario. The production token then appears automatically and is stored as PRODUCTION. No contract or DPA is needed with PRAL. If a tenant uses an integrator instead, an H-7 record with the integrator's DPA, region and sub-processors is needed, plus whatever contract the integrator requires.

### 7.3 Only if the fallback is needed

Send a written RFI to the chosen integrator(s) (Jabran; no contact was made in this research), asking about:
- the ERP-facing API and a sandbox
- multi-tenant support
- price within the r.150XO cap
- hosting, DPA and sub-processors
- ISO 27001 / SOC 2
- SLA and exit

## 8. Not verified

- How a **seller credit note** and an **advance receipt invoice** are submitted under v1.12. Error 0071 suggests credit notes may be limited to "specific users".
- Whether a **newer API version** exists that covers SRO 1666. None was found on FBR on 2026-11-21.
- Whether the **sandbox uses the `_sb` URLs or token-based routing** (v1.12 contradicts itself).
- **Duplicate handling, timeout semantics, a status lookup and a cancel endpoint.** `cancelinvoicedata` appears only in a secondary source.
- The **QR size** (7 mm in the rule vs 1 inch in the API) and its content. The issuer and form of the **software registration number**.
- The **FBR number format** of the rule vs the API's actual format: the API format was verified, the rule pattern was not seen in practice.
- Whether **foreign-hosted IP addresses** are accepted (anecdote: an India-region IP was blocked).
- Whether a **multi-tenant SaaS** under the PRAL route needs its own licence under r.150XE(1).
- Whether a second integration application by an already-integrated pilot company **affects its live token**.
- Whether an NTN holder **without sales tax registration** can open the DI sandbox.
- The **integrator fee cap STGO** under r.150XO, and any integrator's price, API, hosting or certifications.
- Whether the **SRO 288(I)/2026 draft** (income-tax integration) is final, and its Schedule.
- The **STATL and Get_Reg_Type** HTTP method (GET with a body?).
- PRAL's **SLA, rate limits and maintenance windows**.

## 9. Secondary sources consulted (not relied on as fact)

- Tallied, "Integrating Pakistani Businesses with the FBR Digital Invoicing API", dev.to, 2026: https://dev.to/tallied/integrating-pakistani-businesses-with-the-fbr-digital-invoicing-api-1glk (vendor content)
- Odoo app `l10n_pk_fbr_digital_invoice`, updated 2026-10-01: https://apps.odoo.com/apps/modules/19.0/l10n_pk_fbr_digital_invoice
- Haball Wasal page: https://haball.pk/wasl/
- The Express Tribune, 10 Sep 2025: https://tribune.com.pk/story/2565947/fbr-rolls-out-digital-invoicing
- Manager.io forum, IP blocking anecdote: https://forum.manager.io/t/fbr-di-integration-extension-for-manager-io/64997?page=3
- ProPakistani on integrator licences (2024–2025): https://propakistani.pk/2025/04/08/fbr-grants-e-invoicing-integrator-licenses-to-ey-ford-rhodes-and-webdna/
