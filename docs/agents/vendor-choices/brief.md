# VENDOR-CHOICES: three vendor comparisons for Jabran (brief)

Approved: Jabran 2026-11-21 (Accounts roadmap decision 10: "prepare for all", with fresh research). **Worktree:**
`/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/vendors`, branch `phase/4-b2-vendors` (workspace repo).
Research and recommendation only: no code, no sign-ups, no contact with any vendor, no forms submitted.

## The three choices
| File | Choice | Contract refs |
|---|---|---|
| `peppol-access-point.md` | **D-121** Peppol access point for NO (EHF), SE, DK (incl. NemHandel/OIOUBL), FI (incl. operator network / Finvoice), IS: send, receive, participant lookup and registration (SMP), status | BE `docs/api/accounts-docout.md` C-9, C-15, C-23 |
| `email-provider.md` | **D-123** transactional e-mail provider: invoices and reminders with PDF attachment ≤ 10 MB, own sending domain with SPF/DKIM/DMARC, bounces and complaints, per-company reply-to; later ADR-025 RT-6 notification e-mail | BE `docs/api/accounts-docout.md` C-12; workspace `docs/drafts/ADR-025-realtime-notifications.md` Q16 (EU/EEA-hosted with DPA) |
| `pk-fbr-route.md` | **D-125** Pakistan FBR Digital Invoicing route: PRAL direct (free integration on request, rule 150XF) vs licensed integrators | BE `docs/api/accounts-docout.md` C-16; workspace `docs/agents/codex-einvoicing/report.md` §1 PK |

Read first (read-only): `NeoERP-BackEnd/docs/api/accounts-docout.md` (in `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd`, read only, never edit),
workspace `docs/agents/codex-einvoicing/report.md`, `docs/agents/codex-peppol-providers/report.md`,
`docs/agents/codex-2027-changes/report.md` (the earlier research, cut-off 2026-10-31: check what changed since),
`NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md` (H-7 and data-residency rows).

## What each comparison holds
1. **Official sources first** (tax authority, Peppol authority / OpenPeppol, DFØ/Digdir for Norway, Erhvervsstyrelsen for Denmark, FBR/PRAL for Pakistan): the rules a vendor must meet, with links and the date read. For Pakistan: read the official DI API technical document in full (the earlier research timed out on the PDF): endpoints incl. sandbox, validation, response schema, scenarios, credit/debit corrections, duplicate and timeout behaviour, token issuance; and **the exact steps to get sandbox and production access** (who registers, NTN/IRIS needs, PRAL application, licensed-integrator onboarding, costs, time).
2. **Options:** 3–6 real candidates (for Pakistan: PRAL direct and the licensed integrators that are listed officially). Per option: coverage per country and document type, API style, price model (as published; say "not published" when not), EU/EEA hosting and DPA (sub-processors), certifications (ISO 27001, SOC 2), onboarding time and paperwork, test/sandbox, support, lock-in and exit (can we move participants away?), known risks.
3. **A table**, then **the lead's recommended pick with reasons**, a fallback, and what Jabran must do or sign (contracts, DPA, registrations).
4. **Not verified:** everything that could not be confirmed from a source, marked as such. Never present general knowledge as fact; date every price and claim.

## Rules
- Web research only through public pages; quote at most short phrases, summarise in your own words, link every source.
- Do not put the user's name, company, e-mail or any private detail into searches, URLs or forms. No vendor contact, no sign-up, no download of executables.
- One H1 per file, no skipped heading levels, no raw HTML.
- Commit only your own file (`docs(vendor-choices): <file>`), no AI attribution, no push.
