# Lane ready: VENDORS (three vendor comparisons, D-121, D-123, D-125) — 2026-11-21

**Repo / branch:** workspace `NeoERP`, `phase/4-b2-vendors` (pushed, head `af3537e`). Merge target: workspace `master` (`--no-ff`).
**Brief:** `docs/agents/vendor-choices/brief.md`. Approved: Jabran 2026-11-21 (Accounts roadmap decision 10: "prepare for all", fresh research).
**Researchers:** Opus 5.5 high, one per choice, web research from official sources first (read 2026-11-21). Research only: no vendor contact, no sign-up. The lead read the three reports; no separate review (a decision paper for Jabran, not code).

## The three picks (details, sources and "not verified" lists in each file)
| Choice | Pick | Fallback | Main open points |
|---|---|---|---|
| **D-123 e-mail** (`email-provider.md`) | **Amazon SES, eu-north-1 (Stockholm)**: 40 MB per message, bounces pulled from our own queue (no public webhook), DPA in the AWS Service Terms, about USD 0.10–0.16 per 1,000 mails + USD 0.12/GB attachments | Mailgun EU (Foundation plan or higher, Logs API pull) | SES production access can take days to weeks; AWS sub-processor list not read; 3 Pakistan questions for the PK legal adviser (ACC-R24) |
| **D-121 Peppol access point** (`peppol-access-point.md`) | **Inexchange / Maventa (Visma)**: the only candidate covering NO (ELMA automatic), SE operator network, DK NemHandel (via Sproom), FI operator and bank networks, and Peppol; AP + SMP certified; partner REST APIs, test environment; AWS Germany/Ireland, ISO 27001 and ISAE 3402 | Storecove (must prove NemHandel and a current ISO 27001) | Prices not published (written offer needed); Iceland 0196 registration "selected partners"; OIOUBL 2.1 both ways unconfirmed; an exclusivity clause so Visma does not use our traffic for its own ERP sales |
| **D-125 Pakistan FBR route** (`pk-fbr-route.md`) | **PRAL direct (free, rule 150XF)**: each PK tenant applies in its own IRIS account naming NeoERP as ERP provider; one integration, a token and IP whitelist per tenant | A licensed integrator (8 listed) behind the same port, after a written request for information | DI API v1.12 has no credit note, advance receipt or cancel, no idempotency or status lookup (blind retry may create a second FBR number); a PK tax lawyer must confirm a SaaS vendor needs no licence (r.150XE(1)) and that foreign-hosted IPs are accepted |

## Findings that change our docs
- Docout C-11: Norway lookup must be SML/SMP, not "ELMA covers it" (Digdir). NemHandel is a separate network (MitID certificate, own SMP); D-130 (register as a Danish bookkeeping system) needs Jabran.
- FBR: store the returned invoice number as text (format differs from the rule); QR size conflict (7×7 mm vs 1×1 inch); retries need a reconcile-before-resubmit rule (no API idempotency).
- These go into `accounts-docout.md` in the document-output brief (5.1), not this lane.

## Docs pages
User guide: none (decision papers). Developer: none yet (the contract changes above go with 5.1).

## For Jabran
1. **Pick per choice** (lead's call: approve the three picks and fallbacks).
2. **Allow vendor contact** for D-121 (a partner test account and written offer from Inexchange/Maventa, Storecove in parallel) — needs your yes (outward contact).
3. **Things only you can do:** a Neovatus AWS account and sending domain (D-123); the Visma agreement and DPA (D-121); for Pakistan sandbox access, a sales-tax-registered PK company with IRIS (a Neovatus Pakistan entity or a willing company), fixed outgoing IPs in the PK hosting region, a PK tax lawyer's opinion (r.150XE(1), with ACC-R24).
4. Verdict on the lane (lead's call: MERGE to workspace master).
