# Vendor requests for Jabran to send (drafts)

Picks approved by Jabran 2026-11-21. Claude does not contact vendors; Jabran sends these (or edits them first). Fill the
bracketed parts. Nothing here contains credentials.

## 1. Inexchange / Maventa (Visma) — Peppol access point (D-121)

Subject: Partner access-point integration for a multi-company ERP (NO, SE, DK, FI, IS)

Hello,

We are building NeoERP, a cloud ERP for companies in the Nordics and Pakistan, and want to use your network as our
access point for sending and receiving e-invoices for many unrelated companies. We would like:

1. A partner test account and the integration documentation (REST API, company registration, lookup, webhooks).
2. A written offer with per-document and per-company prices, and one contract that covers many companies.
3. Written confirmation of: Norway (EHF, SML/SMP lookup), Sweden, Denmark (NemHandel via Sproom, OIOUBL 2.1 send and
   receive), Finland (operator and bank networks, Finvoice), Iceland (scheme 0196 registration for our customers);
   your date for Peppol delivery-status messages (MLS); and exit terms (moving participants away, export of all
   documents, Finland's 3-working-day deregistration).
4. Your DPA and sub-processor list, EEA hosting, and the option to opt out of scanning outside the EEA.
5. A clause that our traffic and customer data are not used for your own ERP sales.

Company: [Neovatus legal entity], contact: [name, role].

## 2. Storecove — fallback Peppol access point (D-121)

Subject: Access-point API for a multi-company ERP (NO, SE, DK, FI, IS)

Hello,

We are evaluating Storecove as the e-invoice access point for NeoERP, a cloud ERP serving many companies in the Nordics.
Could you send current pricing, sandbox access, and written confirmation of Denmark NemHandel (OIOUBL 2.1, both ways),
Finland operator-network delivery, Iceland coverage, your current ISO 27001 certificate, your DPA and sub-processors,
and exit terms?

Company: [Neovatus legal entity], contact: [name, role].

## 3. Amazon SES — e-mail (D-123): steps, no message needed

1. Create (or choose) a Neovatus-owned AWS account; accept the AWS Customer Agreement (the DPA is in the Service Terms).
2. Choose and register the sending domain (open: its TLD; then SPF, DKIM, custom MAIL FROM and DMARC, go-live row P-9).
3. In eu-north-1, request SES production access early (answers take from a day to weeks).
4. Record AWS as a processor under H-7 and in the privacy notice.

## 4. Pakistan FBR / PRAL — sandbox access (D-125): steps

1. Name a sales-tax-registered Pakistani company with IRIS access (a Neovatus Pakistan entity or a willing company).
2. Fix 1–3 static outgoing IP addresses in the Pakistan hosting region (go-live row H-6), with the host's name and country.
3. Name a NeoERP technical contact and a PRAL support-portal (DICRM) login Neovatus controls.
4. The company applies in IRIS: Digital Invoicing → API Integration → "Proceed with PRAL as Licensed Integrator", ERP provider NeoERP, Cloud, IPs.
5. The sandbox token appears in IRIS; it is entered in NeoERP's write-only credential screen, never by e-mail.
6. Ask a Pakistani tax lawyer: does a SaaS vendor serving many taxpayers need its own licence (r.150XE(1))? Are servers hosted outside Pakistan accepted? (With the ACC-R24 opinion.)
7. Open DICRM cases on: credit notes and advance receipts, cancellation, duplicates and timeouts, QR size, the software registration number, SRO 1666 FED fields.
