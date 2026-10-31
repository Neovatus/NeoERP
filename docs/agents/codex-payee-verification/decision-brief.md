# Payee bank verification: decision brief

Date 2026-10-31. Source: Codex report (`report.md` in this folder), checked against our bank-change design (accounts-c.md C-3 / §7.2 and the approved bank-details safety package, items A-E). Research only: nothing here is approved for build or contract.

## The short version

There is no single service that tells us "this bank account belongs to this supplier" in all six countries. What exists is a different thing per country, almost always **through a bank or provider we must sign a contract with**. The EU rule that makes banks check payee names is a **payment-time service for the payer's own bank**. It is not a free lookup we can call when someone edits a supplier. So verification is a paid, per-country, contract-gated add-on, and it never replaces our second-person approval.

## Per country

| Country | Service | Can an ERP use it? | Cost / contract |
|---|---|---|---|
| Norway | KAR (account + organisation number ownership check), via a bank | Yes. DNB's API explicitly allows an ERP acting for a corporate customer, including supplier account changes. Needs the organisation number, not a typed name. | DNB agreement, KYC, signing certificate. Report quotes about NOK 0.70 per owner check and NOK 5,000 set-up (unverified, see below). |
| Finland | EU/EPC name check (Verification of Payee, VoP) | Only through a bank or provider that allows it outside a payment (Nordea bulk, Danske pilot, Open Payments, SurePay). | Statutory check is free at payment time; the API for supplier master data is a commercial contract, price unknown. |
| Sweden | Giro name lookup (Open Payments); VoP for ordinary accounts only where the bank is covered | Giro: yes under contract, but it needs an OCR/invoice reference. Ordinary accounts: coverage unproven. | Quote only. Bankgirot's own public lookup hides the account, so it is not an ownership check. |
| Pakistan | 1LINK/Raast title fetch (returns the account title) | Only via a sponsoring bank agreement. Returns a name; we compare it. | Bank-specific, unknown. |
| Iceland | Bank B2B account + kennitala checks (Landsbankinn, Arion) | Only through the customer's own bank agreement. Arion's "true" can mean power of attorney, not owner. | Unknown. Pilot needed. |
| Denmark | NemKonto returns a payout account for an ID | Not a name check, and an ERP cannot connect directly. Allowed only for a payment due within four bank days. | Intermediary fees (about DKK 0.32 per lookup plus annual fees). Wrong tool for bank-change checks. |

## Realistic now vs later

- **Now (contract work, then a thin adapter):** Norway KAR, Finland name check.
- **Next:** Swedish giro lookup, Pakistan title fetch through one customer bank.
- **Later or per customer bank:** Iceland pilot, Swedish ordinary accounts, Danish account checks. Denmark has no general service; the Nordic local-currency name check scheme is still in development.
- Every "now" item depends on a customer or on us signing with a bank. None can be built and tested without a sandbox contract.

## Recommended approach and order

1. Build **one provider-neutral check port in accounts-service** and ship with **zero providers**. Everything stays "not verified" until a provider is contracted.
2. Pick the first provider from our **actual first customers' banks**, not from this list. If the first customer is Norwegian, start with KAR; if Finnish, the customer's bank VoP or Open Payments.
3. Then add providers one at a time. Order if no customer decides it: NO, FI, SE giro, PK, IS.
4. Keep Denmark out of bank-change checks; revisit NemKonto only as a payout feature.

## What it adds to our design

- **Where it runs:** accounts-service, after the bank-change request is saved, as an async job (status "checking", manual retry). Never in the browser or gateway, never inside the approval transaction. Credentials are per company.
- **What is stored:** one append-only observation tied to the exact request version: provider, what was checked, provider's raw code and our mapped result (match, close match, no match, not possible, unsupported, error, expired), time, and a correlation ID. Names and IDs are encrypted using the safety package's AEAD and fingerprints. Any edit to name, account or ID invalidates it and triggers a re-check.
- **What the approver sees:** a plain line such as "Bank reports a name match" or "Account belongs to organisation ID ...", with provider, date and masked account, next to the existing local signals (E). The existing `HOLDER_NAME_MISMATCH` is our own comparison and must stay labelled "local".
- **What "no match" does:** holds approval; the requester corrects or confirms with the supplier through the trusted contact. "Close match" shows the bank's name and needs an acknowledged reason. "Not possible", "unsupported" and errors show "not verified" (never green) and use today's manual route. A match never auto-approves and never removes second-person approval, the Owner rule, owner confirmation, the 30-day contributor rule or the payment warning. It is a dated observation, not a guarantee months later.
- **Open data-protection items:** lawful basis for names of sole traders, retention, and whether the provider is our processor.

## Spot-checks of the load-bearing claims

| Claim | Status |
|---|---|
| EU VoP deadlines: euro area 9 Oct 2025, non-euro 9 Jul 2027 | **Checked** (EUR-Lex summary page) |
| VoP is free to the payer, business may opt out for bulk files, applies to corporates | **Checked** against bank guides (Deutsche Bank, Commerzbank, Convera); the EUR-Lex text itself did not load. Not a free supplier-directory API: this is our reading of the rule and the report agrees. |
| Swedish giro lookup `GET /premium/v1/creditor-name` for Bankgiro/Plusgiro returns `creditorName`, needs OCR or invoice reference | **Checked** (Open Payments docs) |
| Denmark NemKonto lookup limited to payments due within four bank days, via approved intermediaries (banks, payment institutions) | **Checked in part**: search of the Danish rules agrees; the NemKonto page did not load. Fee figures (DKK 0.32, annual fees) **unverified**. |
| Pakistan 1LINK lists IBFT Title Fetch and Bulk Title Fetch | **Checked** that they exist. **Unverified** that access is member/bank only and not open to an ERP; the page does not say, so a sponsor bank is the safe assumption. |
| Norway: DNB KAR price points and ERP-acting-for-customer, sole-proprietor exclusion | **Unverified** (DNB pages returned no usable content). Treat prices as indicative. |
| No claim found wrong. Iceland and Tink/SurePay/Enable Banking claims were not checked. | |

## Decisions for Jabran

1. **Build the neutral check port now with no provider, or wait for a customer bank?** Recommend **build the port and the approver display now** (small, safe, keeps "not verified" honest), and **do not contract anyone until a first customer's bank is known**.
2. **First provider.** Recommend **Norway KAR via a bank** if any Norwegian customer is first, else **Finland through the customer's own bank VoP**. Who signs: NeoERP as integrator, or each customer through its own bank? Recommend the **customer's own bank agreement** first (no shared credentials, no vendor liability), and NeoERP as integrator later.
3. **Should "no match" block approval, or only warn?** Recommend **block by default** with a documented exception (third-party or factoring accounts need a reason and a second person), and a per-company setting "require bank verification" that is off until a provider is live.
4. **Denmark and Iceland.** Recommend **ship them as "not verified, manual confirmation"** and revisit only when a customer asks.
