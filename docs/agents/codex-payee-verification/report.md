# Payee bank-account verification for NeoERP

Research date: **2026-10-31**. Scope: Norway (NO), Sweden (SE), Denmark (DK), Finland (FI), Iceland (IS), Pakistan (PK). This is research and a proposed design, **not approval to implement, enrol with a provider, change contracts, or migrate data**.

## Recommendation

Use a backend verification adapter selected by **account country, payment rail, currency, bank reach and tenant agreement**. There is no established single public API that gives the requested bank-confirmed name verdict across all six countries.

Start with **NO KAR ownership verification and FI SEPA Verification of Payee (VoP)**. Add **SE giro recipient lookup**, then **PK bank-sponsored title fetch**, followed by contracted SE bank-account checks and IS bank pilots. Treat DK NemKonto as a separate payout-routing integration with strict timing constraints. Reorder pilots around actual customer banks and volumes.

A result must say exactly what was checked:

| Evidence | Meaning | Suitable approver wording |
| --- | --- | --- |
| Receiving-bank name match | Bank compares submitted name and account | “Bank reports a name match” |
| Account + legal identifier match | Bank/register confirms supplied organisation/person ID owns account | “Account belongs to organisation ID …” |
| Bank-supplied title / giro recipient | Service returns a name; NeoERP may compare locally | “Bank/provider returned this recipient name” |
| Consent-based account information | Payee authenticates and shares bank-provided account data | “Bank data shared by the payee”; specify owner vs authorised user |
| Format / historical reachability | Syntax, checksum or prior payment evidence | “Format/reachability checked”; never ownership confirmed |

A positive result reduces misdirection risk; it does not prove the change was authorised by the supplier, establish company signing authority, or replace maker-checker controls. EPC itself cautions that VoP is not an identity-verification service. [EPC scheme overview](https://www.europeanpaymentscouncil.eu/what-we-do/other-schemes/verification-payee-vop)

## Existing NeoERP boundary

Reviewed [accounts-c.md, C-3 and §7.2](../../../NeoERP-BackEnd/docs/api/accounts-c.md) and the [bank-details safety package decisions](../../../NeoERP-BackEnd/docs/api/accounts-decisions-for-jabran.md). They require bank-change requests, second-person approval subject to the narrow Owner exception, owner confirmation, masked/audited access, and the 30-day payment warning/contributor rule. The safety package also covers encryption/fingerprints, notices, evidence files and local fraud signals; customer-refund bank changes follow the same pattern when built.

The existing `HOLDER_NAME_MISMATCH` compares entered data locally. It is **not a bank response**. External verification must be a separately labelled observation attached to the exact pending change request. The report does not assume customer-refund parity is already implemented.

## 1. Norway — KAR through a bank

**Service and business coverage.** Bits' Konto- og adresseringsregister (KAR) lets banks verify an active payment account and its holder's customer ID. Bits explicitly directs companies to a bank offering access, rather than to a public Bits endpoint. Organisation-ID checks support business payees. [Bits KAR](https://bits.no/bank/konto-og-adresseringsregister-kar/)

**ERP access and returned data.** DNB's Account Pre-validation API expressly supports an ERP acting for a corporate customer and includes supplier onboarding/account changes among its use cases. It verifies account + supplied organisation/person ID, rather than fuzzy name matching. Its codes distinguish owned/not owned, missing account, inability to verify, blocked/unreachable banks and renumbered accounts. A renumbering response can include the replacement account; this must become a new proposed route, not silently alter approved details.

The API requires a signed DNB agreement; indirect corporate users accept KAR terms through the ERP. DNB requires its API customer to hold a DNB account for KYC; the API guide excludes sole proprietors. It documents mTLS using a QC eSeal certificate, OIDC/bearer authentication, ES256 signing and a non-exportable HSM-generated production signing key. Confirm the precise ERP/customer contracting model with DNB. [DNB API and onboarding specification](https://developer.dnb.no/documentation/account-pre-validation/@default/@latest)

**Scope and restrictions.** DNB describes Norwegian NOK receiving accounts, daily register updates, and payment-related use. It offers real-time API calls with up to ten queries and file access for bulk use. Its general product page states narrower restrictions for sole-proprietor lookups involving persons; use the stricter API onboarding rule until DNB clarifies the discrepancy. Do not substitute a typed supplier name for the registered organisation number. Personal refund checks need an authorised person-ID processing basis. [DNB KAR product and FAQ](https://www.dnb.no/bedrift/dagligbank/betaling/kar)

**Published cost.** DNB lists NOK **0.70 per owner check**, NOK **0.40 per account-validity check via API/file**, and NOK **5,000 API/file establishment**, plus the required API certificate; new file connectivity can add charges. These are published examples, not NeoERP's negotiated tariff. Handelsbanken separately lists NOK 2/query, NOK 10,000 web-service establishment or NOK 12,000 file establishment, excluding VAT. [DNB price list](https://www.dnb.no/bedrift/dagligbank/betaling/prisliste), [Handelsbanken KAR prices](https://www.handelsbanken.no/no/bedrift/prislister/prisliste-kontoverifikasjon)

**Recommended route:** NeoERP as contracted bank/ERP integrator, or a tenant-bank adapter. Store an **identifier ownership verdict**, not “name matches”. Keep account validity separate from ownership.

## 2. Sweden — giro lookup now; contracted account verification

**Bankgirot.** Official public lookup associates Bankgiro numbers with companies/organisations that permitted publication. Bankgirot withholds the underlying bank and account under bank secrecy. Thus it is useful for business giro recipients but does not validate an arbitrary clearing/account number. No public Bankgirot automation contract was established in this research. [Bankgirot FAQ](https://www.bankgirot.se/tjanster/inbetalningar/bankgironummer/vanliga-fragor/)

**ERP-accessible giro service.** Open Payments documents `GET /premium/v1/creditor-name` for `BANKGIRO` or `PLUSGIRO`, returning `creditorName` and messages, and `GET /premium/v1/giro-numbers` for company-associated giro numbers. Caller identity and corporate ID are required in corporate scope. The creditor-name schema requires an OCR or invoice reference: do not invent one simply to query a supplier record. Contract approval for the intended change-request use is a prerequisite. This returns a recipient name, not an EPC bank match verdict or the underlying account. [Open Payments giro API](https://docs.openpayments.io/api/bankgiro-lookup)

**Ordinary accounts.** Open Payments' standalone VoP API explicitly describes a supplier-card use case. It accepts name + IBAN, optionally BIC; single/bulk operations return `MTCH`, `CMTC`, `NMTC`, `NOAP`, with `matchedName` for a slight mismatch. It requires PSU identity and corporate identity for corporate calls. A Swedish IBAN example does **not** prove all Swedish banks or SEK accounts are reachable. Require written bank/rail/business-account coverage and permission for preapproval use. [Open Payments VoP specification](https://docs.openpayments.io/api/verification-of-payee-vop)

**Consent alternative.** Tink Business Account Check's SDK supported-market table includes SE. A payee's authorised user must connect to its bank and share a report; bank/account-type support needs testing. Its table does not list the other five target countries for this business product. This is an assisted flow requiring payee participation, not an invisible approver lookup. [Tink Business Account Check](https://docs.tink.com/entries/articles/introduction-to-business-account-check), [SDK and markets](https://docs.tink.com/entries/articles/business-account-check-sdk-reference)

**BankID is complementary.** BankID authenticates or signs for a person. Inference from its documented scope: BankID alone proves neither ownership of the supplied account nor authority to represent a supplier company. Access is through an agreement with a selling bank/intermediary and a technical certificate. [BankID service](https://www.bankid.com/en/business/about-the-service), [Auth/Sign API](https://developers.bankid.com/api-references/auth--sign/overview)

**Cost/protection:** Open Payments and Tink require commercial onboarding and a quote; no universal public per-check price was established. Use only contracted lookup purposes, restrict returned names, and avoid scraping the public directory. BankID pricing is seller-dependent. [Open Payments commercial information](https://www.openpayments.io/company), [Tink pricing](https://www.tink.com/pricing/)

**Recommended route:** contracted provider for giro routes first; bank/provider VoP where explicitly reachable; optional payee-consent flow later. Keep giro verification independent of any stored IBAN.

## 3. Denmark — NemKonto is payout routing, not general name matching

**Service and results.** NemKonto resolves a recipient identifier (CPR for a person; CVR/SE/P identifiers as applicable for businesses) to the registered payout account, or reports no NemKonto. It supports business recipients. This is not a four-way account/name match and a different supplier account is not thereby fraudulent. [Official private-payer operating description](https://www.nemkonto.dk/virksomhed/nemkonto-for-private-udbetalere-og-private-kontoformidlere/private-virksomheders-anvendelse-af-nemkonto-systemet/)

**Access and purpose limits.** A private company normally contracts with an approved private account intermediary, such as its bank. Direct intermediary eligibility is restricted to specified financial institutions; being an ERP does not confer access. The lookup must support a payment **within four banking days**, use NemKonto as the proper destination, and satisfy lawful identifier processing and prior opt-out notice requirements. Therefore it does not fit a general bank-change check weeks before payment. Do not assume blanket consent is always the sole or sufficient legal basis. [Access and restrictions](https://www.nemkonto.dk/virksomhed/nemkonto-for-private-udbetalere-og-private-kontoformidlere/tilslutning-for-private-udbetalere/), [approved intermediaries](https://www.nemkonto.dk/virksomhed/nemkonto-for-private-udbetalere-og-private-kontoformidlere/oversigt-over-private-kontoformidlere/)

**API/spec and fees.** Official technical onboarding describes IBM MQ/file exchange, agreements and connection/onboarding tests; interface specifications are requested from support. Do not assume a generally available public REST endpoint. The 2026 infrastructure tariff lists DKK **0.32/lookup**, annual fees **25,000 / 75,000 / 150,000** depending on own payouts or number of represented payers, and **20,500** technical connection per system. These are intermediary charges; NeoERP's customer-bank/intermediary pricing is separate. [Technical onboarding](https://www.nemkonto.dk/virksomhed/nemkonto-for-private-udbetalere-og-private-kontoformidlere/teknisk-tilslutning-for-private-kontoformidlere/), [2026 official tariff](https://www.nemkonto.dk/media/ypsee3lf/gebyrsatser-for-private-kontoformidlere.pdf)

**Bank alternatives.** Jyske describes recipient checking for EU euro transfers, which is evidence of a payment-time euro service, not a domestic DKK master-data API. Danske's standalone API supports creditor onboarding, but its published eligibility is a **Finnish/Irish customer pilot with Eurozone payees**, not general Danish-account coverage. Obtain a bank/provider contract for any DKK account verification; no universal domestic service was established. [Jyske recipient checking](https://www.jyskebank.dk/hjaelp/betalinger-og-overfoersler/tjek-af-beloebsmodtager), [Danske VoP API](https://developers.danskebank.com/premium-apis/verification-of-payee-api)

**Recommended route:** retain independent owner confirmation for ordinary DK changes; add bank/provider checking only for proven coverage. Integrate NemKonto separately at eligible payout preparation, with a fresh lookup for each payout, rather than as a permanent ownership certificate.

## 4. Finland — EU/EPC VoP for SEPA euro transfers

**Legal and business scope.** Regulation (EU) 2024/886 inserts payee verification before payment authorisation for standard and instant euro credit transfers. The euro-area deadline was **9 October 2025**; the non-euro EU deadline is **9 July 2027**. The payer-facing statutory verification is free. It covers corporate as well as individual payment users; non-consumers can opt out for batches, and legal-person identifiers can be used where supported. This is not a right to an unrestricted free supplier-directory API. FI bank location alone does not make every currency or account type eligible. [Regulation, Articles 5b–5c](https://eur-lex.europa.eu/eli/reg/2024/886/oj), [ECB implementation overview](https://www.ecb.europa.eu/paym/retail/instant_payments/html/instant_payments_regulation.em.html)

**Service/access/results.** EPC is an inter-PSP scheme; an ordinary ERP uses its customer's bank or contracted verification provider. Results distinguish match, close match with the bank-held name, no match and verification not possible. Full name disclosure is not guaranteed for no-match responses. Use the currently effective **rulebook 1.1** and **inter-PSP API 1.1.1**, effective 20 September 2026. The API page includes YAML/JSON specifications; these are not automatically NeoERP's corporate API contract. [EPC rulebook 1.1](https://www.europeanpaymentscouncil.eu/document-library/rulebooks/verification-payee-scheme-rulebook-0), [EPC API 1.1.1 and machine-readable files](https://www.europeanpaymentscouncil.eu/document-library/implementation-guidelines/verification-payee-scheme-inter-psp-api-specifications-0)

**Concrete bank routes.**

- **Nordea Bulk VoP:** Finnish corporate Web Services customers can submit payment XML and retrieve per-transaction verification results. The documented formats include pain.001.001.02/.03 input and pain.002.001.10 output, with match/close match/no match/invalid request results. It requires a bank agreement, API onboarding, credentials and the Nordea certificate associated with the applicable agreement. It is a pre-payment bulk service: confirm permission and payload requirements before using it as an isolated bank-change check without a prepared payment. [Nordea corporate API overview](https://documentation.nordeaopenbanking.com/shared/corporate-overview), [Nordea Bulk VoP product](https://developer.nordeaopenbanking.com/product/bulk-verification-of-payee), [onboarding/certificate details](https://documentation.nordeaopenbanking.com/premium/corporate/overview)
- **Danske standalone VoP:** expressly supports adding/updating creditors; current published customer eligibility is the Finnish/Irish pilot. Name + IBAN input, four result codes, close-match name and request ID; client-credentials onboarding. Pilot acceptance, contractual purpose and price need confirmation. [Danske specification](https://developers.danskebank.com/premium-apis/verification-of-payee-api)
- **Commercial provider:** Open Payments documents the supplier-card use case; SurePay explicitly lists FI as supported. Both need a coverage/contract check for the exact preapproval use. [Open Payments API](https://docs.openpayments.io/api/verification-of-payee-vop), [SurePay country matrix](https://www.surepay.eu/supported-countries/)

**Cost/protection:** distinguish free statutory payment-time VoP from bank connectivity, certificate costs and separately contracted supplier-master verification. No public price for those commercial uses was established. Queries must remain related to legitimate intended payments; forbid account/name enumeration and broad disclosure of suggested names.

**Recommended route:** select a standalone bank/provider service explicitly permitting creditor maintenance; use Nordea bulk where the customer's payment workflow fits. Do not initiate a dummy payment merely to obtain verification.

## 5. Iceland — bank B2B ownership checks need a scoped pilot

**Official services.** Landsbankinn publishes a Deposit Accounts endpoint with `ownerNationalId` and `bban`; its description says the national ID checks that the account belongs to that kennitala. This is useful evidence of account/identifier checking, but the public endpoint does not establish that any ERP may query arbitrary third-party payees across every Icelandic bank. Returned account data is not an EPC name-match verdict. Corporate kennitala support and third-party lookup permissions need explicit bank confirmation. [Landsbankinn Deposit Accounts API](https://developers.landsbankinn.is/docs/documentation-external-apidepositaccounts/1/routes/Owners/%7BownerNationalId%7D/DepositAccounts/%7Bbban%7D/get)

Arion's B2B `VerifyAccount` documentation also needs care: a true result can include an account associated through power of attorney or an additional kennitala. It must not be labelled strict legal ownership without the bank confirming the relationship semantics. The Icelandic IOBS accounting interface documents account/kennitala checks, but an existence answer alone is weaker than ownership. [Arion Account Service specification, VerifyAccount](https://docs.arionbanki.is/themes/arionbanki/arionbanki/documents/03_Fyrirtaeki/Online-banking/B2B/Technical-documentation/B2B_AccountService_ArionSchema.pdf), [IOBS bank-published guide](https://www.spar.is/static/files/Umsoknir/Heimabanki/iobs-sambankaskema-leidbeiningar.pdf)

**ERP route/prerequisites/cost.** Use the tenant's bank B2B agreement and approved software/certificates, or a payee-consent open-banking route. Landsbankinn describes corporate online-bank access plus accounting-software setup; it says B2B connection/use has no bank setup, annual or usage charge, while underlying banking actions may cost. This is not a promise that third-party owner checking is free or included. Obtain the actual API entitlement, business-account reach, authentication requirements and quote. [Landsbankinn B2B](https://www.landsbankinn.is/fyrirtaeki/beintenging-vid-bokhald-b2b)

**Protection and gaps.** Kennitala and bank details must be purpose-limited and access-controlled. Do not collect the approver's bank login or infer supplier ownership from an employee's account-access rights. No publicly evidenced universal Icelandic account/name service, universal ERP access right or country-wide per-check tariff was established. EPC SEPA geography alone proves neither IS-bank reach nor local ISK support.

**Recommended route:** small bank pilot proving “account + supplier kennitala” across agreed banks, with legal-owner vs mandate distinctions tested. Until then show “not verified”, with the existing independent confirmation process.

## 6. Pakistan — Raast/IBFT title fetch through a sponsoring bank

**Services and access.** 1LINK officially lists **1IBFT Title Fetch** and **Bulk IBFT Title Fetch** in its Open APIs. Sandbox access/certification is for members, not automatic public ERP production access. NeoERP should use a bank's corporate/embedded-banking agreement rather than assume 1LINK or State Bank credentials are available to software vendors. [1LINK Open APIs](https://1link.net.pk/products-services/1link-open-apis/)

Bank offerings provide a plausible commercial route: Allied Bank advertises account-title fetch through assessed open-banking partnerships; JS Bank's Z-Connect catalogue lists Raast title fetch. Obtain the bank's current API specification, eligible partner/corporate status, authentication/certification and permission to call before a supplier change is approved. A catalogue listing is not proof of sandbox or production entitlement. [Allied Bank Open Banking](https://www.abl.com/personal/digital-banking-services/allied-bank-open-banking/), [JS Bank Z-Connect catalogue](https://developer.jsbl.com/services), [1LINK title-fetch sandbox catalogue](https://sandbox.1link.net.pk/uat-1link/sandbox/product)

**What it proves.** Title fetch retrieves the destination account title/name before transfer, not a standard EPC fuzzy-match verdict. NeoERP must preserve the bank-returned title and label any subsequent comparison as **NeoERP's comparison**. Raast aliases should be resolved to the specific destination; an alias alone can change association. Confirm whether each API accepts IBAN, bank/account identifiers or Raast alias, whether it returns a masked/full title, and how it distinguishes closed/missing/unreachable accounts.

**Business coverage, cost and protection.** Raast includes person-to-merchant capabilities, but this does not establish universal corporate-payee coverage in every title-fetch API. Require bank-level proof for supplier company accounts, sole traders, wallets and consumer refunds. SBP's free Raast customer-transfer provisions do not establish free enterprise API/title-fetch access: ask separately for setup, minimum, per-query, failed-query and support charges. Apply bank secrecy, permitted-purpose and credential restrictions; no public bulk title-harvesting entitlement was established. [SBP confidentiality circular](https://www.sbp.org.pk/circulars/bprd-circular-no-08-of-2018) [SBP Raast access routes](https://www.sbp.org.pk/our-subsidiaries/raast/join-raast), [SBP Raast FAQ and customer pricing](https://www.sbp.org.pk/faqs/faqs-raast-person-to-person-p2p), [Bank Alfalah business/vendor use](https://www.bankalfalah.com/islamic/digital-banking/raast)

**Recommended route:** pilot with a tenant's Pakistani bank offering corporate title fetch; require a non-payment lookup contract and tested business-account coverage. Do not claim that successful routing or an account title proves company identity or authorised bank-change instructions.

## 7. Providers spanning countries

“Country connectivity” and “bank-confirmed name-check coverage” are different products. Provider statements are primary evidence of their own offerings, not a regulatory endorsement.

| Provider | Relevant evidenced reach | Signal/access and commercial limits |
| --- | --- | --- |
| **Open Payments** | Published bank connectivity in NO, SE, FI, DK; no IS/PK proof here | Standalone VoP and Swedish giro APIs; licensed corporate/private AIS/PIS platform. Contract and quote; require a product-specific bank/rail/account-type matrix. [Banks](https://docs.openpayments.io/docs/banks), [company/commercial information](https://www.openpayments.io/company) |
| **Enable Banking** | Provider lists all EEA markets, including NO/SE/DK/FI/IS; not PK | Consent-based AIS under its AISP authorisation is possible after contract/KYB. API has optional holder name and owner/co-holder/attorney relationship; missing fields must stay unknown. It is not a universal unattended payee-name check. Volume pricing per connected account/month, with separate payment pricing; live PIS requires appropriate licensing in its stated model. [Coverage, terms, pricing model](https://enablebanking.com/knowledge-base), [API](https://enablebanking.com/docs/api/reference/) |
| **Tink** | Multi-country European connectivity; Nordic NO/SE/DK/FI operational surfaces; **Business Account Check explicitly lists SE only among our six** | Payee consent/authentication and bank-sourced account data/report; quote and bank/product-level coverage required. Do not infer business coverage from consumer market coverage. [Account Check](https://tink.com/products/account-check/), [business markets](https://docs.tink.com/entries/articles/business-account-check-sdk-reference), [country status links](https://status.tink.com/) |
| **SurePay** | Current EU verification matrix says **FI yes; SE/DK no (expected July 2027); NO/IS no (date unknown)**; no PK proof | Commercial verification candidate for FI and future expansion, not current six-country coverage. Quote/contract required. Expected dates are not commitments; the page also contains an outdated UK expectation, so reconfirm at procurement. [Country matrix](https://www.surepay.eu/supported-countries/), [API documentation](https://developer.surepay.nl/vop-for-banks/standard-api-spec) |
| **Swift Payment Pre-validation via a bank** | Cross-border network; no guaranteed six-country/bank ownership coverage established | Receiving-bank verification where available, otherwise central historical validation. DNB exposes a corporate route. Historical success must not become a bank ownership verdict. Bank contract, reach matrix and pricing required. [Swift service](https://www.swift.com/es/node/308146), [Swift service explanation](https://www.swift.com/swift-resource/252189/download), [DNB access](https://www.dnb.no/bedrift/dagligbank/betaling/kar) |

The **Nordic Payments Council's local-currency NVOP is still described as under development**, with its timeline dependent on PSR. Do not assume universal SEK/DKK/NOK/ISK VoP is already live. EU non-euro deadlines concern euro transfers, not automatic domestic-currency coverage; NO/IS EEA implementation and actual bank participation require separate confirmation. [NPC scheme status](https://www.nordicpaymentscouncil.org/npc-schemes/npc-verification-of-payee-scheme-rulebook/)

## 8. Proposed integration order and procurement gates

1. **NO first:** KAR checks a legal identifier already useful for suppliers and supports ERP onboarding/change use. Resolve DNB ERP contract/KYC, sole-proprietor restrictions, certificate/HSM cost and tenant authorisation.
2. **FI next, or in parallel:** use a standalone provider or bank route allowing creditor maintenance. Confirm corporate beneficiaries, bank reach, permitted storage and the difference between statutory free VoP and commercial API charges.
3. **SE giro:** target actual Bankgiro/Plusgiro users. Confirm reference requirements and change-request use. Add SE account VoP only for explicitly supported banks, then consider consent-based business account checks.
4. **PK:** sponsor-bank title-fetch pilot, with corporate coverage, exact field semantics, contractual non-payment use and price confirmed.
5. **IS:** bank B2B pilot; prove owner-ID semantics, third-party permission and interbank reach before broad rollout.
6. **DK:** general account checking remains bank/provider-specific. NemKonto is a separate eligible payment-time feature. Monitor NVOP and 2027 euro reach.

Before selecting a provider obtain written answers for: supported banks and currencies; IBAN/BBAN/giro/wallet routes; companies/sole traders/joint accounts; direct-bank vs historical data provenance; preapproval queries without a current payment; personal identifiers and lawful basis; retention and permitted returned-name display; controller/processor roles, subprocessors and transfers; per-call/setup/minimum/certificate fees; limits, availability and outage handling. Sandbox simulations alone do not establish production reach.

## 9. What NeoERP's design must include

The following is a proposal for later contract/design approval.

### Execution and trust boundary

- **accounts-service owns the check** for supplier/customer bank-change requests, behind an application outbound port with country/provider adapters. Gateway and frontend must not contain provider credentials or make authoritative verification decisions.
- Trigger after validation and persistence of a pending request, through a durable asynchronous job/outbox. Return “checking”; allow a permission-controlled retry. The bank call runs outside the database approval transaction.
- Route by actual account and rail, not supplier postal country. Every credential, bank mandate and quota is bound to the correct tenant. The payee's consent, where required, cannot be replaced by the payer approving the request.
- Bind the observation to tenant, party, request ID/version, route fingerprint, submitted name and legal-ID fingerprint, provider, rail/currency and purpose. Changes to any checked input invalidate the observation.
- On result arrival use optimistic concurrency to attach it only to the same pending version. At approval re-read the request, applicable policy and freshness; a late success cannot approve or overwrite a rejected/edited request.
- Do not call restricted services prematurely. NemKonto needs the payout window; a payment-only VoP endpoint must not be repurposed without agreement. No test transfer is required merely to check an account.

### Evidence model and storage

Persist an append-only verification observation with:

| Field group | Proposed contents |
| --- | --- |
| Identity/binding | company, party kind/id, change request/version, protected input fingerprints, route type/country/currency |
| Provenance | provider + service/API version, bank/scheme where supplied, bank-direct/register/title-fetch/consent/historical/local evidence type |
| Outcome | provider code and its mapped meaning; account validity and ownership/name outcome separately |
| Timing | requested/completed/expiry timestamps, freshness policy version; bank data-as-of when known (KAR updates daily) |
| Trace | provider correlation ID, attempts, safe failure category, initiating actor/job and purpose |
| Protected detail | encrypted submitted name/legal ID and returned title/suggested name only if needed and contractually allowed |
| Decision link | immutable observation ID used at approval; acknowledgement/exception actor, reason and evidence references |

Keep provider-specific raw codes; map into `MATCH`, `CLOSE_MATCH`, `NO_MATCH`, `NOT_POSSIBLE`, `UNSUPPORTED`, `PENDING`, `ERROR`, `EXPIRED` **only where those semantics exist**. For title fetch retain `TITLE_RETURNED`; for KAR retain an identifier-ownership result; for consent data retain owner/attorney relationship. HTTP 200 or “account exists” is not a match. Keep raw response bodies only if needed, permitted, encrypted and retention-limited; never in general logs.

Use existing AEAD/keyed fingerprint conventions. Put only masked/minimal audit events into audit-service; keep sensitive evidence in the owning service. Never expose bank names/titles or identifiers via broad history lists, analytics, support logs or cross-tenant searches. Provider-suggested replacement accounts or names must not silently update supplier legal identity or live bank details.

### Approver experience and adverse results

Show service/provenance, what was compared, masked route, timestamp/freshness and a plain-language verdict beside the existing local signals. Privileged name/route reveal must follow existing audited authorisation. A local name comparison must visibly say it is local.

| Observation | Proposed behaviour |
| --- | --- |
| Valid positive bank verdict | Show evidence; retain second-person/Owner policy and `confirmedWithOwner`. No automatic approval. |
| Close match | Display allowed suggested name to the authorised approver, require discrepancy acknowledgement and independent confirmation; correction creates a new checked version. |
| No match / wrong legal owner | Hold normal approval. Ask for correction or trusted-contact confirmation. Any exceptional third-party/factor/group account needs a separately approved exception policy with explicit authority, reason and evidence; until that exists, reject/correct the request. |
| Not possible / unsupported | Explicitly “not verified”; use the authorised manual evidence/owner-confirmation route, never a green result or silent pass. If policy requires bank verification, keep approval held. |
| Timeout/error/rate limit | Safe retry with bounded backoff and idempotent job tracking; remain unverified. Distinguish provider outage from a negative match. |
| Expired or edited inputs | Recheck where permitted; an expired result cannot satisfy a bank-verification requirement. |

Block repeat-query enumeration by permission, per-person/tenant quotas, monitoring and provider limits. Bound parallel jobs and costs. Do not hold approval database locks while waiting for a provider. Preserve notice, evidence-file and 30-day contributor/payment-warning controls.

At payment preparation/approval, independently honour the payment bank's mandatory VoP and fresh routing requirements. A change-request result is a dated observation; it cannot guarantee the account remains open, unchanged or correctly owned months later.

### Data protection and verification before implementation

For personal payees, sole traders and names returned about individuals, establish an Article 6 basis, provide appropriate notices, minimise identifiers, set retention/deletion periods, and document vendor roles and international transfers. Review GDPR Articles 5, 6, 13–14, 25, 28, 32 and Chapter V as applicable. Do not assume every bank/provider is merely NeoERP's processor. Consent for regulated account access and the payer's fraud-prevention processing basis are distinct questions. [GDPR official text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679), [Commission minimisation/retention guidance](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)

PK bank-secrecy and data-use terms need sponsor-bank review; this report does not assert an unverified general privacy statute or a right to disclose account titles abroad. Personal-ID restrictions for NO, DK and IS need country/provider-specific review. No lookup against real payees was performed.

Before implementation acceptance, test wrong-owner/close-match/unreachable responses; legal/trading-name variation; corporate vs sole-trader/joint/mandate accounts; new inputs and stale responses racing approval; replay/retry; tenant credential isolation; returned-name/log leakage; renumbering; restricted-purpose timing; and preservation of existing approval guards. A live contracted pilot must establish actual business-account reach.

## Research checkpoint and evidence limits

- **Owner/write scope:** Codex owns this research report only. NeoERP-App and NeoERP-BackEnd were read-only. No PROJECT-STATE file was read. No separate plan/state/handoff file was created, following the explicit one-file instruction.
- **Authorisation:** user requested official-source research and one report committed on master with message `docs(codex): payee verification research`. Implementation, provider registration, real-payee checks and push are not authorised.
- **Baseline:** workspace master at `945353fda8035986b0bfc7f55ae10d839fdaad0e` on pickup, with unrelated tracked changes in readiness brief, design principles and ERP inbox, and unrelated untracked handoffs/task directories. These were excluded. Backend conclusions derive from named documents, not a runtime audit.
- **Research status:** country discovery and proposed design complete; fees/eligibility/coverage gaps remain procurement questions, not assumed capabilities. Official sources include regulators, scheme operators, banks and providers speaking for their own products. Absence of a public service/API in this research is not proof no private service exists.
- **Verification:** independent read-only reviews of SE/DK/FI/provider claims and IS/PK/design claims found no material corrections; NO and overall integration recommendations were lead-reviewed. SurePay country-table evidence was available to the lead through the indexed official page, but its redirected page could not be independently fetched. Relative links resolve; whitespace and one-file commit scope were checked. No runtime tests are applicable to this documentation-only change. No product design/contract decision is adopted by this report.
- **Next owner/action:** Jabran selects target customer banks/provider shortlist and authorises procurement/pilot scope. Later implementation needs its own approved contract, design and checkpoint.
