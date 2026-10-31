# Triage: Codex retention and e-invoicing research (2026-10-31)

Reports: `codex-retention/report.md` (A), `codex-einvoicing/report.md` (B). Spot-checks used official pages where fetchable. **checked** = confirmed against the official page or an authority page quoting the statute; **unverified** = source did not load, taken from the report; **wrong** = contradicted. Nothing found wrong. Claims about our files were checked against the cited files (all matched).

## A. Retention

### Spot-checks
| Claim | Result |
|---|---|
| NO bokføringsloven §13: 5 yrs for bilag/annual accounts, 3.5 yrs for agreements and correspondence, from FY end, kept in Norway | checked (Lovdata). Lovdata also shows §13 amended by Act 19 Jun 2026 no. 39 from **2027-01-01**; amended text not read by us or Codex. Re-read before 2027. |
| SE bokföringslagen 7:2: through the 7th year after the end of the calendar year the FY ended | checked (Riksdagen) |
| DK bogføringsloven §12: 5 years from FY end | checked via Skatteforvaltningen guidance; statute page did not load; stk. 2 exceptions unread |
| FI kirjanpitolaki 2:10: 10 yrs books/financial statements, 6 yrs vouchers (from end of the calendar year the FY ended) | checked via secondary summaries only (Finlex did not load); treat as unverified against the text |
| IS bókhaldslög art. 20: 7 yrs; annual accounts 25 yrs | 7 yrs and the art. 20 foreign-storage limit seen indirectly; **25 yrs unverified**. A full rewrite of the act is under way (storage-in-Iceland link to be dropped). |
| PK Companies Act s220 (10 yrs), ITO s174 (6 yrs) | unverified (FBR/SECP PDFs not fetched); Codex itself flags currentness |
| GDPR 17(3)(b), 6(1)(c) | checked by general knowledge; correct as stated |

### Retention table (minimum, from FY end unless noted)
| Record | NO | SE | DK | FI | IS | PK |
|---|---|---|---|---|---|---|
| Journals, ledgers, accounts | 5y (checked) | 7y after CY (checked) | 5y (checked) | 10y (checked-sec.) | 7y; accounts 25y (part unverified) | 10 FYs company (unverified) |
| Invoices, vouchers | 5y (checked) | 7y after CY (checked) | 5y (checked) | 6y after CY (checked-sec.) | 7y | 6y tax (unverified) |
| Agreements, correspondence | 3.5y (checked) | 7y if accounting info | 5y if accounting material | 6y | 7y if significant | per tax/company rule |
| Bank-change request/proof | classification, not a statute category: keep as long as it evidences a payment's payee route (Codex inference; DK guidance supports it; SE says only when it affects accounting) | | | | | |

### What NeoERP must do
- **Keep/purge:** retention clock is by record type, country and the FY the record concerns, never upload date. Take the latest expiry across all payments that rely on an item.
- **Erasure (sole trader, contact person):** GDPR 17(3)(b) blocks erasure only for what the law requires kept. Partial grant: stop using and delete live, unneeded fields (phone, email, unused routes); keep the voucher evidence behind restricted access; reply within one month with retained categories and expiry dates; delete again at expiry without waiting for a request. Pseudonymising does not satisfy a valid erasure duty. PK has no enacted GDPR-style law (bill is a draft), but GDPR can apply by territory.
- **Dropping plaintext bank columns:** retention law does not require them. Safe to drop once the encrypted copy is proven (decrypt test, old/new route versions, key persistence, restore test, historical payments resolve), not on `remaining()==0` alone. Keys must outlive the records. Request ID + HMAC + last 4 is only a reference, valid only while the approved encrypted version stays retrievable.
- **Import and proof files:** do not purge on a pure TTL. Our attachments contract starts proof retention at the request decision's FY (C-14), which can expire before the last payment using that route (confirmed in `accounts-attachments.md`). Compute expiry from the latest dependent payment. Evidentiary imports must be promoted to the archive before the TTL fires; a checksum is not a copy. Unlinked 7-day staging cleanup is fine.
- **Audit/security logs:** accounting trail follows the accounting class; access/reveal logs get a short documented period, not 5-10 years.
- **Tenant exit (D-152):** "keep to purge date" must follow the tenant's archive/return/delete choice; we are a processor.
- **Hosting:** NO/SE/IS/PK restrict where books are stored or require local access; separate from GDPR transfer checks. Confirm primary and backup regions.

## B. E-invoicing

### Spot-checks
| Claim | Result |
|---|---|
| NO B2B: send from 2027-01-01, receive from 2030-01-01; PDF not allowed when buyer is Peppol-reachable; EHF/BIS 3.0+; exemptions (bankruptcy estates, low turnover, finance/insurance) | checked (Skatteetaten) |
| BIS 3.0 mandatory release date 17 Aug 2026 | checked (OpenPeppol) |
| BIS needs buyer reference (BT-10) or order reference (BT-13); standard CustomizationID | checked (docs.peppol.eu) |
| PK SRO 1852(I)/2025 dates (1 Nov / 15 Nov / 1 Dec / 31 Dec 2025) | partly checked: secondary sources agree on 1 Nov, 1 Dec, 31 Dec; one gives 1 Dec for the mid band; SRO PDF not machine-readable. A later SRO 1666(I)/2026 (29 Sep 2026) is reported as amending Chapter XIV; **not read by Codex**. |
| 0184 CVR without `DK` prefix; 0216/0037 handling | not fetched; matches our knowledge. Our docs show `0184:DK12345678` (docout C-8) and the `0037`-prefixed OVT (confirmed); both are wrong per the report. |
| DK FIK uses code 93 and `71#` style, SE Bankgiro code 30 | unverified (Peppol rule pages not fetched); our docout C-14 does have `+71<ref>+<creditor>` |
| SE/DK/FI/IS B2B | no domestic B2B mandate (report), ViDA 1 Jul 2030 cross-border: unverified, plausible |

### Dates
NO B2G 2019-04-02; B2B send **2027-01-01**, receive 2030-01-01. SE B2G 2019-04-01; B2B none; ViDA 2030-07-01. DK B2G 2005; no blanket B2B; OIOUBL 2.1 to BIS4 about 2028-29. FI public receiving 2019/2020, B2B on request from 2020-04-01. IS state receiving 2019/2020. PK DI fiscal invoicing already due (all categories by 2025-12-31).

### Our gaps (confirmed in repo)
- One untyped invoice `reference` (V26/`ArDocumentModels`): split buyer reference BT-10 and PO BT-13.
- No endpoint scheme/ID, no BIS payment-means codes, no external order/line refs, no general invoice attachments, no inbound table (all only contracted in docout).
- Docout text errors: `0184:DK…` example, `0037` OVT, FIK printed form instead of code 93 and `71#`, Bankgiro encoding.
- PK: approval hardcodes `FiscalStatus.NOT_REQUIRED` (`ArDocumentApprovalService` line 190); no FBR connector.

### Architecture and order
One Peppol access-point provider for the Nordics (not own AP: about EUR 4-8k a year in fees plus ISO 27001 and operations) with NemHandel/OIOUBL and Finvoice included; separate FBR integrator adapter for Pakistan; shared outbound writer and inbound inbox; VAT-return adapters are a separate track. This matches the existing docout contract. Commercial order stays SE, NO, PK, FI, IS, DK; engineering urgency is NO sender (before 2027-01-01, about 9 weeks) and PK fiscalisation (already live) alongside the SE pilot.

## Decisions for Jabran
1. **Retention policy: adopt "keep by record class, purge on expiry" with the latest-expiry rule.** Recommend yes; amend attachments C-14 (proof expiry from last dependent payment) and D-152 before building purge jobs. Alternative: a flat 10-year default, which is too short for IS accounts and FI property and over-retains personal data.
2. **Plaintext bank column drop: gate on the full preservation test, not `remaining()==0`.** Recommend yes. Alternative: drop on backfill count alone, faster but unproven.
3. **Import/proof purge: promote evidentiary imports to archive first, no TTL on evidence.** Recommend yes; PK purges stay off until PK law is rechecked.
4. **Re-read NO bokføringsloven §13 as amended 2027-01-01** and the DK §12 stk. 2, FI 2:10, IS art. 20 text before any country's purge goes live. Recommend assigning one short check.
5. **E-invoicing: provider AP, not own AP.** Recommend provider; start the provider comparison now (EI-01) because NO sending starts 2027-01-01. Alternative: own AP, not justified at launch.
6. **Pull NO sender and PK fiscalisation forward** next to the SE pilot. Recommend yes. Alternative: keep strict commercial order and accept Norwegian customers being non-compliant from 2027-01-01 and PK customers already being so.
7. **Fix the docout/B text errors and split BT-10/BT-13** in one approved amendment (EI-02) before issuer code. Recommend yes.
8. **Have someone read SRO 1666(I)/2026 and the current FBR DI API spec** before PK build starts. Recommend yes.
