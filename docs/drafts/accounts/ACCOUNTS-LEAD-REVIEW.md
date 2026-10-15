# Accounts — lead review (Step 0)

Author: **Cowork · Accounts lead**. Date: 2026-10-09. Status: **for Jabran's acceptance**. Draft, uncommitted.

Scope: AC-0, roadmap, contracts A0–E, F/G/H notes, app specs A0–E, decisions file, user guide and developer pages,
and a click-through of the Screen Rig (A0–A3, design index, phone 390×844 and iPad 820). Reviewed with four hats; each
hat's full findings are in the appendices (01–05). The lead section below is the consolidated view: where the
appendices disagree, this section wins.

Corrections the lead made to the appendices:
- 05 DD-1 withdrawn: the three A0 developer pages exist; they were only missing from the staged copy.
- 03 B-1: A2 C-19 already lists PDF, XLSX and CSV; what remains is the "Draft, not approved" header, the A3 contract
  (§1, C-27) still saying CSV only, and the stale D-8 row in the decisions file.
- Legal citations marked *(verify)* in the appendices are unverified and must be checked against the official text before
  they go into a pack or a contract (none of us is a substitute for a local auditor sign-off, see L-9).

---

## 1. Verdict per slice

| Slice | State | Verdict | What it means |
|---|---|---|---|
| A0 Foundation | Built | **Small fixes** | Guide/text fixes; SE pack: 2098 is used as "opening-balance equity" (BAS: result from previous year) — move OBE to its own account; auto-create the next fiscal year (05 P-10). No rebuild. |
| A1 Journals — backend | Built | **Small fixes, carried by A2's V11** | Manual journals need a document reference + document date, memo required at submit (L-1). DB-role check on immutability triggers; balance/scale constraint. |
| A1 Journals — app (CP-A1.2) | Data layer built | **Ready after small fixes** | Shared component contract for NeoSearchSelect/NeoMultiSelect first (ERP lead), then rig/spec fixes (§3.2). Split into CP-A1.2a (components) and CP-A1.2b (screens). |
| A2 TB, GL, periods (CP-A2.1) | Not started | **Ready after small fixes** | Contract fixes in §3.3, then split into CP-A2.1a (period control + A1 amendments + V11) and CP-A2.1b (reports + exports). Add a journal listing report (grundbok / bokføringsspesifikasjon). |
| A3 P&L, BS, year-end | Not started | **Fixes before build (medium)** | Country layouts for P&L/BS, SE 2099 Årets resultat, year-end reopenable by Owner until locked, OBE gate. Cash-flow statement as A3b. Not a redesign; contract and rig need a pass. |
| B Receivables | Draft | **Needs partial redesign** | Refunds, legal invoice content frozen at approval, FBR digital-invoicing hook, ADR-018 service API/hooks, currency columns now, VAT on advances, bad-debt relief, small-difference write-off. Re-draft before the B rig. |
| C Payables | Draft | **Fixes before rig** | Refunds, KID/OCR/Bankgiro/Plusgiro, GRNI clearing for Purchasing, non-deductible input VAT, PK s.153 base net of sales tax, currency columns. |
| D Bank and cash | Draft | **Fixes before rig** | Tax codes and withholding on bank entries, refunds path, statement import (camt.053 / PK CSV) as D2 right after. |
| E Tax reporting | Draft | **Fixes before rig** | Complete NO MVA-melding and SE momsdeklaration mappings, tax-point date, settlement journal (D-34), covering indexes, PK s.8B/s.73. |
| H Statutory exports | Note | **Re-plan** | Launch is simultaneous in PK/NO/SE, so H is a launch gate, not "after E for the first paying tenant". SIE first (cheapest, used monthly in SE). |
| F Franchise / G Group | Notes | **Fine as notes** | Move per-company cash flow out of G into A3b (D-55). Fix reserved migration numbers that are already taken (franchise spec org V28 / user V33). |

**For the two held builds:** neither can start exactly as prompted. CP-A1.2 can start within a day of fixes (the shared
component contract is the gate). CP-A2.1 can start as soon as the A2 contract fixes in §3.3 are applied — they are text
changes I make myself, no redesign.

---

## 2. Top 5 issues

1. **The roadmap stops short of a sellable product in three countries.** Missing or mis-gated: statutory exports (H) for
   all three countries at launch, invoice document output + e-invoicing (EHF/PEPPOL NO, PEPPOL/Svefaktura SE, FBR Digital
   Invoicing PK), attachments + a file store, journal listing report, cash-flow statement, bank-statement import, VAT-return
   files. Recommended new order with a launch line in R-1.
2. **Audit trail for manual journals is below NO/SE bookkeeping law.** No required document reference or document date, memo
   optional, no attachments, no day-book report, no tenant-visible change history. Cheap to fix now (fields + one report);
   expensive after go-live.
3. **B/C are not ready for a rig.** Refunds have no path anywhere (B says "with D", D excludes them, AR/AP are closed to
   manual journals). Invoice legal content (seller org.nr + "MVA"/STRN/NTN, delivery date, buyer VAT/CNIC, exemption
   wording) is not captured at approval even though posted invoices can't change. No FBR hook. ADR-018 contradicts B's
   party model and B/C have no service API for Sales/Purchasing. Single-amount columns break AC-0 P6 ("no later data
   migration" for multi-currency).
4. **A2 contract needs five fixes before CP-A2.1:** mark approval; state READ COMMITTED for the close transaction (the
   "same snapshot" wording points to REPEATABLE READ, which lets a journal submitted during close land in a CLOSED
   period); give the A1 engine amendments (posted_xid, account_year_balances, submit locking the period, ledger-check
   job) an owning checkpoint; make 1M-line exports a background job, not one long synchronous transaction; record the
   dimension policy that V11's balance key freezes.
5. **CP-A1.2 depends on a shared component contract that doesn't exist yet.** building-blocks points to the editor's
   account picker as the NeoSearchSelect reference, but it behaves differently from `A2SearchSelect` (matching, recents,
   groups, keys). Plus rig defects: keyboard focus lost after a tag-cell pick, period line says "Open" for closed/locked
   months, "Sent back" still used for Reject, A1 spec still describes old page states.

---

## 3. Findings the lead accepts and will act on

### 3.1 Accounting (law and audit)

| # | Sev. | Finding | Fix | When |
|---|---|---|---|---|
| L-1 | Major (Blocker for first NO/SE customer) | Manual journal not traceable to its voucher (SE BFL 5:6–7, NO bokføringsloven §§4, 10) | `documentRef` + `documentDate` on manual journals, memo required at submit; attachments slice before go-live | Fields: A2 V11 + CP-A1.2b. Attachments: R-1 |
| L-2 | Major | No journal listing (day book) | "Journal listing" report in A2 (number order, per period, with poster/approver) | CP-A2.1b |
| L-3 | Major | Opening-balance guidance omits YTD P&L for mid-year go-live and the AR/AP difference sitting on OBE until B/C | Guide + editor copy | CP-A1.2b docs |
| L-4 | Major | Year-end single-person and irreversible | R-3 | A3 |
| L-5 | Major | BS: cash outside current assets, no current/non-current split, no provisions; P&L: gross profit includes other income; SE appropriations after result before tax | Country report sections per pack (`report_sections`) | A3 |
| L-6 | Major | SE: result posted to 2098 instead of 2099; OBE on 2098 | 2099 Årets resultat; OBE to its own account in the SE pack (pack fix migration) | A3 / pack 2026.2 |
| L-7 | Major | Tax rates can't be back-dated after go-live, user guide says they can | Fix the guide now; decide rate correction rules in B | Now / B |
| L-8 | Major | No tenant-visible audit trail / system documentation (SE BFL 5:11, NO systemdokumentasjon); retention after Finance is switched off | Audit view + read-only retention mode; a system-documentation page per release | Before first live customer |
| L-9 | Process | Nobody on the team is a local accountant | Buy a one-off review of the NO, SE and PK packs + invoice layouts by a local auditor before each country's launch gate | Launch gate |
| L-10 | Major (B–E) | Refunds, legal invoice content, FBR hook, VAT on advances, bad debt, write-offs, non-deductible VAT, tax-point date, PK s.153 base, PK seller-side withheld sales tax, KID/OCR/Bankgiro, NO/SE return mappings | Re-draft B–E (see appendix 02 BL-1…MJ-18) | Before B–E rigs |

### 3.2 Design (rig and specs)

Before CP-A1.2: component contract for NeoSearchSelect / NeoMultiSelect (→ ERP lead, appendix 04 A-1); keyboard focus
after a tag-cell pick and ↓ into the Account cell; account panel clears the sticky footer; period line shows Closed /
Locked with copy; A1 spec amended to page states; one module-off / no-access copy ("…isn't part of your plan", "Ask the
Owner"); "Sent back" → "Rejected" in timeline and toast; visible reason for disabled cells and labelled tags on phone
line cards; reserve the "Post to year-end adjustments" checkbox under the period line; document reference + date fields
(L-1); one money type in the app (03 M-12).

Before CP-A2.2: searchable Branch / Cost-centre filters on reports; TB/GL at 820 px without sideways scroll; spec'd phone
cards for reports; period-close card head on phone.

Design index: mark B–E as "not in the rig yet"; B–C and D–E specs reference rig files that don't exist yet.

### 3.3 Architecture (A2 contract fixes I make before CP-A2.1)

1. Status → "Approved for build (Jabran, 2026-10-09 'start')"; A3 C-27 aligned with D-8 (PDF/XLSX/CSV); decisions file
   rows D-8…D-11, D-15…D-18 marked decided with dates.
2. Close transaction: READ COMMITTED; checks re-read under the period row lock (03 M-2).
3. §19 amendments (A1-A2…A1-A4 + posted_xid, account_year_balances, submit locks period, ledger-check job) belong to
   CP-A2.1a explicitly, with their tests (03 M-1).
4. Exports: R-4.
5. Dimension policy recorded: balances keyed by account × period × branch × cost centre; stock location and project are
   line-level only (03 M-5). V11 also: journal-events delete guard, drop duplicate GL index, company FKs on the year table,
   GL cursor bound to company + account.
6. Manual journal `documentRef` / `documentDate` (L-1) and the journal listing report (L-2) added to A2 scope.

### 3.4 Plan and cross-module

- ADR-018 (ERP lead): accept, with B/C hooks — service create API for Sales/Purchasing, source-document and source-line
  links, item/UoM/stock-location fields on lines, GRNI clearing for bills, approval rule for invoices created by Sales
  (wait for an Accounts approver unless the source document already had two people).
- Machine clients: pinned to the test client today; Payroll has no company_id. Gate: Payroll posts only after its
  ADR-012 fix and a machine-approver check (01 #11, 03 M-6/M-7). Fix the user guide claim that Payroll posts "now".
- Domain-event relay (outbox → consumers) is unowned → ERP lead.
- Migration numbers: stop reserving V13–V16 / user V40–V42 in drafts; assign at build time (collisions found).

---

## 4. Decisions for Jabran

Answer "all as recommended" or per item. The B–E D-numbers (D-19…D-57) come in one batch with the B and C rigs, as
planned; appendix 05 §2.3 already has a recommendation for each.

| # | Question | Recommendation | Consequence |
|---|---|---|---|
| **R-1** | Adopt a revised roadmap with a launch line? | **Yes:** A2 → A3 + A3b cash flow → H-SE (SIE export/import) → B ∥ C (incl. PK further tax D-21, KID/OCR) → document output + e-invoicing (EHF/PEPPOL, FBR DI) → attachments + file store → D + statement import → E + return files → H-NO SAF-T ∥ H-PK registers → **launch gate per country** → multi-currency → Payroll posting → fixed assets → F → G. A small "recurring journals + accruals" slice can run beside B. | Launch moves later but is legal in all three countries; F/G move after launch. |
| **R-2** | Manual journals require a document reference and document date; memo required at submit? | **Yes**, in A2's V11 and the CP-A1.2 editor. | One more field per journal for the bookkeeper; meets NO/SE voucher rules. |
| **R-3** | Year-end: Owner may reopen a closed year (with reason) until it is locked; locking stays final? | **Yes.** | Auditor and tax adjustments after closing go into the right year. |
| **R-4** | Exports up to 1M lines: background job (download when ready) instead of one synchronous request? | **Yes**, one export-job framework in CP-A2.1b that H reuses. | A2 grows a little; no gateway timeouts or long DB snapshots; H is cheaper. |
| **R-5** | Split checkpoints: CP-A1.2 → a (shared components, ERP-lead review) + b (screens); CP-A2.1 → a (period control + A1 amendments + V11) + b (reports + exports)? | **Yes.** | Two extra reviews; each one small enough to check properly, and screens don't wait on component review rework. |
| **R-6** | B/C go back to draft for the fixes in §3.1 L-10 and ADR-018 hooks, before their rigs? | **Yes**; I re-draft them, then rig. | B/C rigs start ~1 day later; avoids a backend rework after build. |
| **R-7** | B/C store document and allocation amounts with currency + rate columns now (v1 still single-currency)? | **Yes.** | Keeps AC-0 P6; multi-currency later is a feature, not a migration. |
| **R-8** | Amounts in the company's number format (NO/SE "1 250 000,00", comma decimal accepted when typing)? | **Yes** — app-wide, so I raise it with the ERP lead. | Nordic bookkeepers type and read amounts as they expect; today "12,5" is refused. |
| **R-9** | One-off local auditor review of each country's pack and invoice layout before its launch gate? | **Yes.** | Small cost; replaces "(verify)" notes with sign-off. |

---

## 5. What happens after acceptance

1. I apply the design-file fixes (A2/A3 contracts, decisions file, roadmap, A1 spec, rig fixes in §3.2) — uncommitted drafts.
2. → Cowork · ERP lead: component contract for NeoSearchSelect/NeoMultiSelect, R-8 number format, ADR-018 hooks, event relay.
3. Build prompts: CP-A1.2a (components, Sonnet), CP-A2.1a (backend, Opus), then CP-A1.2b and CP-A2.1b.
4. Re-draft B/C, then B and C rigs; D and E rigs; one decision batch for B–E.

---

## 6. Addendum — target countries (Jabran, 2026-10-09)

Source: project doc `claude/target-countries.md` (ERP lead). **Full at launch: Pakistan, Norway, Sweden, Denmark, Finland,
Iceland.** Base (chart only, packs later): UK, DE, NL, UAE, SA, QA, US and any other country. The Org country decides;
a country's pack switches on by itself when it ships; nothing is ever calculated with another country's rules.

### 6.1 What it adds to Accounts

| Country | Chart pack | Tax pack | Statutory exports (H) / returns | Notes *(all to verify against official sources)* |
|---|---|---|---|---|
| Denmark | DK standard chart (Erhvervsstyrelsen standardkontoplan) | Moms 25 %, zero-rated/exempt, EU goods/services, reverse charge (incl. domestic), import moms | Momsangivelse (monthly / quarterly / half-yearly); EU sales list; **SAF-T Financial** export from the bookkeeping system | **Bogføringsloven 2022: standard digital bookkeeping systems must be registered with Erhvervsstyrelsen** and meet its requirements (secure EU storage/backup, automatic bank posting support, e-invoice receive/send in OIOUBL/Peppol, SAF-T export). That is a product-level gate for DK, not just a pack. |
| Finland | FI chart (common Finnish tilikartta structure; no statutory chart) | ALV 25.5 % (from 2024-09-01), 14 %, 10 %, 0 %, EU, construction reverse charge | Kausiveroilmoitus via OmaVero (monthly default; quarterly/yearly for small) ; EU sales list (yhteenvetoilmoitus) | Financial statements in the Kirjanpitoasetus (PMA) formats; e-invoice (Finvoice / Peppol) is a buyer's right for B2B. Base currency EUR. |
| Iceland | IS chart (no statutory chart; common Icelandic structure) | VSK 24 %, 11 %, 0 %, exempt, reverse charge on imported services | VSK return every two months to Skatturinn | **ISK has 0 decimals** — the currency-scale seed (V6) has DKK and EUR but **no ISK**: add ISK scale 0 in the next accounts migration before any IS company goes live. E-invoicing via Peppol for public sector. |

### 6.2 Changes to the plan (amends R-1)

- **H becomes six country exports**, not three. Order follows target-countries ("same order as packs"): H-SE (SIE) → H-NO
  (SAF-T) → H-PK (registers) → H-DK (SAF-T + registration requirements) → H-FI → H-IS. FI and IS have no SAF-T duty; their H
  is mainly the VAT return file and the EU sales list (FI). DK's SAF-T can reuse NO's SAF-T engine with a DK mapping.
- **E (tax reporting) needs DK, FI and IS box mappings** at launch (versioned mapping data, so it is pack work, not code).
- **Document output / e-invoicing** grows: OIOUBL (DK), Finvoice (FI) and Peppol BIS for all Nordics through one access
  point. FBR Digital Invoicing stays the PK path.
- **DK registration** (Erhvervsstyrelsen) is a launch-gate item for Denmark: it needs attachments, bank import (D2) and
  e-invoice receive to exist first. Recommend DK goes live after SE/NO in the launch sequence.
- **Packs (chart + tax) for DK, FI, IS** are a new pack slice: **P-DK/FI/IS @2026.2**, built with the pack loader as a
  new Kotlin pack migration (next free number at build time). It can run in parallel with B ∥ C because it only touches
  pack data; each pack is CHECKED (P17) and gets a pilot customer. Recommended inside the R-9 auditor review.
- **ISK scale 0** added to the currency seed in the same migration (blocker for any IS company posting).
- Revised R-1 order: A2 → A3 + A3b → H-SE → B ∥ C ∥ **packs DK/FI/IS** → document output + e-invoicing (Peppol/EHF/
  OIOUBL/Finvoice, FBR DI) → attachments + file store → D + statement import → E + return files (6 countries) → H-NO ∥
  H-PK ∥ H-DK ∥ H-FI ∥ H-IS → launch gate per country → multi-currency → Payroll posting → fixed assets → F → G.

### 6.3 Documents to update (after acceptance)

| File | Change |
|---|---|
| `NeoERP-App/docs/design/specs/accounts-a0.md` §1 "Launch countries" table and Q4 (line ~101) | Six full countries; DK/FI/IS rows become "country chart + tax pack at launch (`DK@2026.2`, `FI@2026.2`, `IS@2026.2`)"; base-chart row lists UK, DE, NL, UAE, SA, QA, US and others. |
| `NeoERP-BackEnd/docs/api/accounts-a0.md` (§ taxPack null "Denmark, Finland") | Becomes "a country without a pack yet (base countries)". |
| `docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md` launch scope; roadmap; `accounts-h-design.md`; `accounts-e.md` | Six full countries; H per country as above. |
| User guide `tax-codes.md` (lines 57, 92) | Replace "Denmark, Finland" with "countries without a tax pack yet". |
| Rig `accounts-data.jsx` | Add a DK, FI or IS demo company when the B–E rigs are built (at least one EUR and one ISK company to show scale 0). |

### 6.4 New decisions

| # | Question | Recommendation | Consequence |
|---|---|---|---|
| **R-10** | Add a pack slice for DK, FI, IS charts + tax packs (+ ISK scale), in parallel with B ∥ C? | **Yes.** | Packs ready when B issues the first invoice; no code change, only pack data and a migration. |
| **R-11** | Denmark launches after the registration requirements (attachments, bank import, e-invoice receive, SAF-T) are met; launch order SE → NO → PK → FI → IS → DK? | **Yes.** | DK is the most demanding country; avoids launching a non-compliant bookkeeping system there. |

---

# Appendices — full findings by hat


---

## Appendix — Accountant review: NeoERP Accounts A0–A3

Reviewer stance: chartered accountant (NO, SE, PK), read-only review of the design before more is built.
Date: 2026-10-09. Status at review: A0 built, A1 backend built (CP-A1.1), A1 app (CP-A1.2) in build, A2 contract
draft about to start build (CP-A2.1), A3 contract draft.

Files read: AC-0 `docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md`; backend contracts `accounts-a0.md`, `-a1.md`,
`-a2.md`, `-a3.md`, `accounts-decisions-for-jabran.md`, `accounts-roadmap.md` (plus a look at `accounts-b.md` C-13
for how opening items clear opening-balance equity); app specs `accounts-a0.md`, `-a1.md`, `-a2-a3.md`; user guide
`user-guide/accounts/*.md` and the glossary entries they link to. The pack CSVs were not in the staged copy, so pack
contents (account numbers, subtypes, rates) were not checked.

Legal references: I am confident of the principle each time. Where I am not sure of the exact paragraph number I
say "(verify §)". Nothing here should be read as a requirement I could not tie to law or to normal audit practice.

Severity: **Blocker** = the books would not meet the law or an audit could not be signed; **Major** = an auditor
would raise it and the fix gets expensive later; **Minor** = presentation, wording, hardening.

---

### Summary table

| # | Sev | Title | When to fix |
|---|---|---|---|
| 1 | Major (Blocker for the first live NO/SE customer) | No link from a journal to its supporting document (bilag/verifikation); no counterparty; memo optional | Before CP-A1.2 (fields); attachments before first live customer |
| 2 | Major | No journal listing report (bokføringsspesifikasjon / grundbok / day book) | Add to A2 scope before A2 acceptance |
| 3 | Major | Opening balances guidance is incomplete (mid-year go-live, YTD P&L, AR/AP via OBE) | Before CP-A1.2 |
| 4 | Major | Opening-balance equity blocks the year-end with no override, but AR/AP can only clear it in B/C | Gate: no live customer before B and C, or design change before A3 |
| 5 | Major | Posted-row immutability rests on triggers the application role may be able to bypass; no tamper evidence | Verify role ownership before CP-A2.1; hash chain later |
| 6 | Major | Year-end is single-person and irreversible; audit adjustments after closing cannot reach the closed year | Before A3 build |
| 7 | Major | Balance sheet: "Cash and bank" sits outside "Current assets"; no current/non-current split for borrowings; provisions mixed with long-term debt | Before A3 build (V12 seed) |
| 8 | Major | P&L layout: "Gross profit" includes other operating income; "Result before tax" is placed before Swedish appropriations | Before A3 build (V12 seed) |
| 9 | Major | Sweden: year-end posts the result to 2098, skipping 2099 Årets resultat | Before A3 build |
| 10 | Major | Tax rates cannot be back-dated after go-live (A0 A-12); user guide says they can | Before B |
| 11 | Major | Machine postings: approver is not verified as a person of the target company (D-56) | Before the first producer (Payroll) is registered |
| 12 | Major | No tenant-visible audit trail / behandlingshistorik; no system documentation | Before first live customer (plan now) |
| 13 | Major | Retention after termination: FINANCE off locks the customer out of books they must keep 5/7/10 years | Before first customer contract; design decision now |
| 14 | Major (later) | Multi-currency: per-currency balance rule contradicts cross-currency journals; FX residue goes to ROUNDING | Before MULTI_CURRENCY |
| 15 | Major (later) | First / extended / changed fiscal years not supported; no comparatives for the first year | Document limitation now; build before annual-accounts output |
| 16 | Minor | One-person reversal can create a mirror entry without a second person | Before A3 (or accept and report) |
| 17 | Minor | Manual AR/AP control postings allowed with a reason before B exists will break the B ageing check | Before CP-A2.1 (close AR/AP fully until B) |
| 18 | Minor | No database-level balance check per posted journal; no DB scale check | V11 |
| 19 | Minor | GL export shows branch and cost-centre ids, not codes/names; no posted-by/posted-at | Before CP-A2.1 |
| 20 | Minor | Dates use server UTC, not the company's local date | Later (before PK/NO/SE go-live at scale) |
| 21 | Minor | Equity presentation (SE bundet/fritt; NO innskutt/opptjent; NO dividend allocation) | Later (statutory output, slice H) |
| 22 | Minor | VAT corrections of a locked period: posting date vs VAT term | E |
| 23 | Minor | User guide inconsistencies (read-only before go-live, tax code counts, year-end wording) | Before CP-A1.2 / A2 docs |
| 24 | Minor | Waiting journals are not aged (timeliness of bookkeeping) | Later |

---

### Must fix before CP-A2.1 / CP-A1.2

#### 1. Journals cannot be traced to their supporting document — Major (Blocker for first live NO/SE customer)

- **Where:** A1 contract §3.1 `journal_entries` (no external document reference, no document date, no counterparty;
  `memo` nullable); §6.7 create-draft rules (memo optional); app spec AC-A1 §4.2.1 header card; AC-0 §3 "Later, not
  slotted: attachments"; A1 C-17 (no party on lines).
- **What is wrong:** A posted manual journal carries a number, a date, lines, an optional memo and a post reason.
  There is no field for the voucher/document it is booked from (bilag number, supplier invoice number, agreement
  reference), no document date distinct from the posting date, no counterparty, and no attachment. `source_document_ref`
  exists only for machine postings.
- **Law:**
  - SE: BFL 5 kap. 6–7 §§ — every affärshändelse needs a verifikation stating when it was compiled, when the event
    occurred, what it concerns, the amount and the counterparty, plus a verifikationsnummer and a reference to
    related documents. The JV number, `created_at`, `entry_date` and lines cover some of this; "what it concerns" is
    optional (memo nullable) and counterparty is missing.
  - NO: bokføringsloven § 4 (dokumentasjon, sporbarhet/kontrollspor) and § 10 (bokførte opplysninger skal være
    dokumentert); bokføringsforskriften kap. 5 sets the content of the documentation. The ledger must lead to the
    documentation and back.
  - PK: Companies Act 2017 s.220 (proper books of account "with respect to all sums received and expended… and the
    matters in respect of which…"; verify §), and ordinary ISA 500 evidence for the statutory auditor.
- **What an auditor would say:** "I cannot vouch these manual journals. Where is the supporting document for
  JV-2026-000118? The memo is free text and sometimes empty." For SE this is a formal deficiency in the
  verifikation.
- **Fix:**
  1. Before CP-A1.2 (the editor is being built now) add to the journal header: `documentRef` (≤ 60, required at
     submit for JV, optional for OB), `documentDate` (optional, defaults to `entryDate`), `counterparty` (free text
     ≤ 200, optional; party ids come with B/C). Make `memo` **required at submit** ("what the journal is for").
     Include all three in journal detail, GL lines and every export. One V11 column set; no engine change.
  2. Attachments (scan/PDF per journal, immutable once posted, kept with the journal) before the first live NO/SE
     customer. Until then the user guide must tell users to write the bilag number in `documentRef` and keep the
     paper/PDF filed by that number.

#### 3. Opening balances guidance is accountingly incomplete — Major

- **Where:** user guide `opening-balances.md` (What it is for, Steps 2–3, Example); `setup-and-go-live.md`
  (go-live date decision "so the year's figures are complete"); app spec AC-A0 §4.3 go-live hint ("enter what the
  company owns and owes, as one opening-balance journal"); AC-A1 §4.2.6 OB editor notice; glossary "Opening balances".
- **What is wrong:**
  - **Mid-year go-live.** If go-live is, say, 1 Oct in a July–June year, the first year's P&L must include July–
    September. The guide only speaks of "what the company owns and owes" (balance-sheet items). A user following it
    will put the year-to-date result into retained earnings or OBE, and the company's first annual P&L in NeoERP
    will be missing three months. The design allows P&L lines in an OB journal (nothing refuses them), so this is a
    guidance gap, not an engine gap.
  - **AR/AP.** The guide says receivables and payables are "entered in their own modules later" and the example
    shows "nothing goes to Opening-balance equity". For any real company with debtors and creditors, entering equity
    from last year's accounts and leaving out AR/AP makes the journal differ by exactly (AR − AP); that difference
    must sit on OBE until B/C opening items clear it (B C-13 posts AR opening items against OBE). The guide should
    say this explicitly; otherwise users will force the difference into retained earnings.
  - The example omits VAT payable, holiday pay and payroll liabilities that a Norwegian retailer always has at
    31 Dec; fine for an example, but the step list should name them (tax and payroll liabilities, accruals,
    prepayments).
- **What an auditor would say:** "Opening equity does not agree to last year's approved accounts" or "the first-year
  P&L is incomplete".
- **Fix (text only, before CP-A1.2):**
  - Go-live decision: recommend the first day of the current fiscal year and entering the earlier months as normal
    journals (the design already allows a go-live date in the past within the current year).
  - If going live mid-year: the OB journal also carries every income and cost account's year-to-date balance (or the
    company enters the earlier months' totals per month after choosing the year start as go-live). Equity is last
    year's closing equity, not today's.
  - Customers/suppliers: "Leave them out; the difference stays on Opening-balance equity until their opening items
    are entered in Receivables and Payables, which clear it."
  - Step list: bank, cash, stock, fixed assets and depreciation, loans, **tax and payroll liabilities, accruals and
    prepayments**, share capital, retained earnings (from last year's approved balance sheet).
  - Fix the AC-A1 §4.2.6 notice and AC-A0 go-live hint the same way.

#### 5. Immutability depends on triggers; no tamper evidence — Major

- **Where:** AC-0 P2 and §7.3 ("no UPDATE/DELETE grant on posted rows"); A1 §3.1 "Posted means permanent" (triggers,
  `SET LOCAL accounts.posting_journal_id` exception); A2 C-18 locked-period trigger; A3 fiscal-year trigger.
- **What is wrong:** AC-0 promised grants; A1 implements BEFORE triggers. If the runtime database role owns the
  tables (common with Flyway in the same role), it can `ALTER TABLE … DISABLE TRIGGER` or set the session variable
  that opens the insert exception. Nothing would detect a silent change: the nightly ledger check compares balance
  rows with lines, both of which a privileged writer can change together.
- **Law:** NO bokføringsloven § 4 (sikring — protection against unauthorised change and deletion); SE BFL 5 kap. 5 §
  and 7 kap. (varaktighet/beständighet of bokföringsposter; verify §); both expect that a registered entry cannot be
  changed without trace.
- **What an auditor would say:** "Show me that nobody, including your administrators, can alter a posted entry
  without it being detectable."
- **Fix:** Before CP-A2.1 confirm (and test) that the service's runtime role is not the table owner and has no
  `ALTER`/`TRIGGER` rights; Flyway runs as a separate owner role. Later (before first live customer): a per-company
  hash chain on posted journals (hash of the previous journal's hash + number + date + lines), verified by the
  nightly job and printable for the auditor.

#### 17. Manual postings to AR/AP control before Receivables/Payables exist — Minor

- **Where:** A1 C-10 (AR/AP protected, but `POST_CONTROL` + reason allows manual lines); A2 §7.6 reserved B check
  `AR_CONTROL_MATCHES_LEDGER` (BLOCK).
- **What is wrong:** Any manual AR/AP line posted in A1–A3 has no sub-ledger document. When B ships, ageing ≠ control
  and the B close check blocks every month until someone reverses the history.
- **Fix:** Until B (and C) are live for the company, refuse AR and AP control lines on manual journals entirely
  (OB already refuses them). Keep the `POST_CONTROL` override for the other kinds.

#### 18. No database-level balance and scale check — Minor

- **Where:** A1 §3.1 checks; §5.2 step 7.
- **What is wrong:** Balance (Σ DR = Σ CR per journal) and amount scale (≤ currency scale) are enforced only in the
  engine. A defect or a direct write could store an unbalanced or 4-decimal journal; the nightly check would not see
  it (it compares lines with balance rows, not debits with credits).
- **Fix (V11):** a deferred constraint trigger that refuses commit when a journal becoming POSTED has Σ base DR ≠
  Σ base CR (and, while single-currency, Σ txn DR ≠ Σ txn CR); a CHECK that `txn_amount` and `base_amount` equal
  themselves rounded to 2 decimals for the seeded scale-2 currencies; add "TB debits = credits per company and
  period" to the nightly ledger check.

#### 19. GL export lacks readable dimensions and the posting trail — Minor

- **Where:** A2 §6.5 GL columns (`Branch id`, `Cost centre id`, no poster, no posted time, no document reference).
- **What is wrong:** An exported kontospesifikasjon for the auditor should be readable on its own: branch code/name,
  cost centre code, journal number, document reference (finding 1), posted by, posted at.
- **Fix:** replace ids with code + name; add `Document ref`, `Posted by`, `Posted at`. Same in XLSX/PDF.

#### 23 (part). User guide text that ships with A1 — Minor

- `setup-and-go-live.md`, `chart-and-used-for.md`, `tax-codes.md` say the tabs are read-only before go-live; A0 A-11
  (Jabran, 2026-10-06) made them editable before go-live. Correct before CP-A1.2 so the guide matches the app.
- `tax-codes.md` example says "All 12 codes"; AC-A0 §1 says Norway has 11. Align with the pack.

---

### Fix before A3 (and add to A2 scope where stated)

#### 2. No journal listing (day book) — Major (add to A2 scope)

- **Where:** A2 §1 scope (TB, GL, export only); AC-A1 Journals list (screen list, not a report; no lines, no export).
- **What is wrong:** There is no report that lists posted journals with their lines in number/registration order for
  a period, exportable.
- **Law:**
  - NO: bokføringsloven § 5 (spesifikasjoner av pliktig regnskapsrapportering) requires, among others, a
    **bokføringsspesifikasjon** (the booked entries for the period) and **kontospesifikasjon** (per account); detail in
    bokføringsforskriften kap. 3. (The brief's "bokføringsforskriften §5 specification lists" are, as far as I know,
    in the Act's § 5; the forskrift's kap. 3 adds detail — verify.) GL covers the kontospesifikasjon; the journal
    listing is missing. Kunde-/leverandørspesifikasjon come with B/C, MVA spesifikasjon with E.
  - SE: BFL 5 kap. 1 § — registration in chronological order (**grundbokföring**) and in systematic order
    (**huvudbokföring**). GL is huvudbok; the grundbok is missing.
  - PK: a journal/day book is part of "proper books of account" in practice (Companies Act 2017 s.220; verify).
- **What an auditor would say:** "Print me the grundbok / bokføringsspesifikasjon for March, in verifikation order."
- **Fix:** add a "Journal listing" report to A2 (it is the natural home and reuses the A2 export machinery):
  fiscal year + period range or number range, journal type filter, ordered by type and number (and an option by
  posting time), each journal with header (number, date, document ref, memo, source, posted by/at, reversal links)
  and its lines; totals per journal and grand total; PDF/XLSX/CSV, audited. Not a blocker for starting CP-A2.1, but
  A2 should not be accepted without it.

#### 4. Opening-balance equity blocks the year-end, but only B/C can clear the AR/AP part — Major

- **Where:** A1 C-14 (OB refuses AR/AP control lines); A3 C-17 (OBE not zero blocks, no override); P4; B C-13 (opening
  items post against OBE).
- **What is wrong:** A company that goes live on A0–A3 only (before B and C exist for it) and has any receivables
  or payables will carry their net on OBE and can never run its first year-end.
- **What an auditor would say:** nothing yet — but the customer cannot close the year.
- **Fix (pick one, decide before A3):** (a) roadmap gate: no live customer before B and C are live (simplest; state
  it in the roadmap "Gates"); or (b) until B/C are live for the company, allow AR/AP lines in OB with a mandatory
  per-customer/supplier listing kept outside (and a one-time migration into opening items when B ships). (a) is
  what I recommend.

#### 6. Year-end is single-person and irreversible — Major

- **Where:** A3 C-15 (one person), C-24 / P14 / R10 (no year reopen, YE not reversible), A2 C-13 (periods of a closed
  year never reopen); user guide `year-end.md`, `README.md` ("When all twelve months are closed, the year-end moves
  the year's result…").
- **What is wrong:** In NO, SE and PK the closing adjustments usually arrive after the bookkeeper thinks the year is
  done: auditor's proposed adjustments, tax expense (skattekostnad / skatt / income tax provision), dividend
  provision (NO), bokslutsdispositioner (SE: periodiseringsfond, överavskrivningar), inventory count, bad-debt and
  accrual adjustments. Once one person runs the year-end, every later adjustment must go into the next year, so the
  annual accounts filed (Brønnøysund / Bolagsverket / SECP) will not agree with the year in NeoERP. The P&L in NeoERP
  for that year is then permanently wrong, and the opening balances of the next year differ from the approved
  balance sheet until the correction posts. One person can trigger this.
- **What an auditor would say:** "Your ledger for FY2026 doesn't agree with the signed financial statements; the
  differences sit in FY2027."
- **Fix:** separate the two steps the design already has: **Close the year (reversible)** and **Lock the year
  (final)**. While CLOSED and not LOCKED, the Owner (or two people) may "Reopen the year" with a reason: the engine
  reverses the YE journal (RV dated the same day, period 13), reopens period 13, sets the year OPEN, all audited.
  Lock stays final and is what the guide ties to "annual accounts filed/approved". If Jabran keeps P14, then at
  least make the year-end two-person (D-3) and change the guide: "Run the year-end only after the auditor has agreed
  the accounts and tax and dividend entries are posted in Year-end adjustments", with a pre-close checklist
  (depreciation, accruals/prepayments, stock count, bad debts, VAT reconciled, payroll liabilities reconciled, income
  tax, dividend/appropriations).

#### 7. Balance-sheet layout — Major

- **Where:** A3 §3.1 `report_sections` (BS 10–90); AC-A2A3 §4.5; A3 conflict 10.
- **What is wrong:**
  - `CASH_AND_BANK` is a section beside `CURRENT_ASSETS`, and `TOTAL_ASSETS = 10 + 20 + 30`. In every target
    framework cash is a current asset (NO regnskapsloven § 6-2: Omløpsmidler … Bankinnskudd, kontanter; SE ÅRL
    uppställningsform: Omsättningstillgångar … Kassa och bank; IFRS for SMEs 4.5). A user reading "Current assets"
    gets a figure without cash, which misstates working capital and the current ratio.
  - Borrowings and provisions are all non-current in v1. A bank overdraft (kassekreditt / checkräkningskredit),
    the current portion of a loan and short-term provisions are current liabilities. IFRS for SMEs 4.4 requires the
    split (PK); NO § 6-2 and SE ÅRL separate kortsiktig/kortfristig gjeld/skulder and avsetninger/avsättningar.
  - A negative bank balance stays in assets as a negative figure.
- **What an auditor would say:** "This is not a balance sheet I can compare with the statutory one."
- **Fix (V12 seed):** make Cash and bank a group inside Current assets with a "Total current assets" subtotal; add a
  `PROVISIONS` section between equity and liabilities (NO/SE) and allow subtypes `BORROWING_CURRENT`,
  `PROVISION_CURRENT` (pack change); until the packs split them, label the report "Management balance sheet — not
  in statutory format". Reclassifying overdrawn bank accounts can wait.

#### 8. Profit-and-loss layout — Major

- **Where:** A3 §3.1 PL rows 10–140; AC-A2A3 §4.4; user guide `reports.md` step "Read it from Revenue through Gross
  profit…".
- **What is wrong:**
  - `GROSS_PROFIT = REVENUE + OTHER_OPERATING_INCOME − COST_OF_SALES`. Gross profit is revenue less cost of sales;
    other operating income does not belong in it. NO (rskl § 6-1) and SE (ÅRL kostnadsslagsindelad) use the
    nature-of-expense format, which has no gross-profit line at all: Driftsinntekter / Rörelsens intäkter → total →
    Driftskostnader / Rörelsens kostnader → Driftsresultat / Rörelseresultat.
  - `RESULT_BEFORE_TAX = 80 + 90 − 100` sits before `APPROPRIATIONS`. In the Swedish format the line after financial
    items is "Resultat efter finansiella poster", then Bokslutsdispositioner, then **"Resultat före skatt"**, then
    Skatt. With appropriations the design's "Result before tax" is wrong.
- **Fix (V12 seed):** rename/re-define: `TOTAL_OPERATING_INCOME` (10 + 20), `GROSS_PROFIT` only as (10 − 30) and only
  shown where the pack asks for it (PK by-function option), `RESULT_AFTER_FINANCIAL_ITEMS` (80 + 90 − 100), then
  `APPROPRIATIONS`, then `RESULT_BEFORE_TAX` (= after appropriations), `INCOME_TAX`, `RESULT_FOR_THE_YEAR`. Let the
  pack choose the layout variant (NO/SE nature; PK nature or function).

#### 9. Sweden: closing entry bypasses 2099 Årets resultat — Major

- **Where:** A3 conflict 9 and C-12 (YE credits `RETAINED_EARNINGS`, 2098 in the SE pack; 2099 is presentation-only);
  AC-0 C5.
- **What is wrong:** Swedish practice (BAS) books the year's result at bokslut to **2099 Årets resultat**; the
  årsstämma then decides the disposition (2099 → 2098/2091, dividend to 2898). Booking straight to 2098 records a
  disposition the shareholders have not decided, and the SIE #UB on 2099 will be zero where every Swedish revisor
  expects the result. The BS presentation (C-8) hides this on screen, but the ledger and the future SIE file show it.
- **Fix:** per pack, choose the YE target: SE → the account mapped to `CURRENT_YEAR_RESULT` (2099), which must then be
  postable by the YE engine path only (still no manual lines until the year is closed); the guide adds the
  "vinstdisposition after årsstämman" journal (2099 → 2098/2091, utdelning → 2898). NO and PK stay on retained
  earnings (NO 2050 annen egenkapital; dividend provision 2800 is booked by a period-13 journal from 2050, see 21).

#### 16. One-person reversal — Minor (decided D-3, but note the gap)

- **Where:** A1 C-9, D-3.
- **What is wrong:** Reversing a posted manual journal is itself a new posting with swapped lines. One Finance
  Manager can therefore create, alone, the mirror of any posted manual journal (e.g. reverse a supplier payment JV,
  which debits bank). This is a single-person path into the ledger that the two-person rule otherwise closes.
- **What an auditor would say:** "Segregation of duties has an exception; show me how reversals are reviewed."
- **Fix:** either require reverser ∉ original's contributors and ≠ original poster, or keep D-3 and add a "Posted by
  one person" filter/report (Owner self-approvals + reversals) the Owner/Auditor reviews monthly; mention it in the
  period-close checklist.

---

### Fix later (before the named slice or the first live customer)

#### 10. Tax rates cannot be back-dated after go-live — Major (before B)

- **Where:** A0 A-12 ("a new rate's validFrom must be today or later (no backdating)"); user guide `tax-codes.md`
  Decisions ("Any date after the latest version's date").
- **What is wrong:** Rates are sometimes changed retroactively or entered late (PK Finance Act/SROs effective
  1 July but published late; a customer who missed a 1 January change). Invoices dated before the entry date must use
  the correct legal rate. With A-12 the only way is a wrong rate plus manual correction. The guide also contradicts
  the contract.
- **Fix:** allow a back-dated version (reason required; Owner/Finance Manager), refused only if a posted line using
  that code is dated on/after the new `validFrom` (those must be corrected by credit note first), or warn and list
  them. Align the guide with whatever is chosen.

#### 11. Machine approver not verified (D-56) — Major (before Payroll is registered)

- **Where:** A1 C-8, C-21, §7, decision D-56.
- **What is wrong:** Accounts records `approvedBy` as the poster of record but does not check that this subject is an
  active member of the target company with the source module's approve right; any registered client may post for
  any FINANCE company. A defect in the producer could post into the wrong company with plausible-looking approvers.
- **Fix:** on every machine post, check with user-service that `requestedBy` and `approvedBy` are active members of
  `companyId` (and, ideally, that `approvedBy` held the module's approve code at `approvedAt`); refuse with 422
  otherwise. Store the producer's approval timestamp.

#### 12. No tenant-visible audit trail; no system documentation — Major (before first live customer)

- **Where:** AC-0 §2 Auditor persona ("reads … the audit trail"); A0 A-19 ("No tenant-facing filtered Accounts audit
  trail exists yet"); no document describing the accounting system.
- **What is wrong:** Journal timelines and period history are visible, but changes to the chart (renames,
  deactivations), Used-for remaps, tax-rate versions, chart replacement and exports are only in the platform audit
  service, not reachable by the company's Auditor role.
- **Law:** SE BFL 5 kap. 11 § — **systemdokumentation** and **behandlingshistorik** must exist and be kept; NO
  bokføringsloven § 4 / § 13 (documentation of the bookkeeping and the kontrollspor must be kept; verify §); PK
  auditors will ask for the IT general controls description.
- **Fix:** (a) a tenant "Accounts activity" view and export (filter by resource, actor, date) for Owner, Finance
  Manager and Auditor; (b) Neovatus publishes a versioned **system description** per release: how numbering, period
  control, two-person rule, reversal, year-end, role mappings and automatic postings work, plus the per-company
  kontoplan with its change history (account renames and Used-for history) — exportable for the company.

#### 13. Retention after termination — Major (decide now, build before the first contract ends)

- **Where:** A0 §7.1 (`finance_disabled`: books stay, every call answers `MODULE_NOT_ENABLED`); AC-0 §11 ("ledger
  data never deleted in-app"); org A-2 (company deletion).
- **What is wrong:** The ledger is kept, which is good, but a customer whose agreement ends loses all access while
  they must still keep and be able to present the material: NO 5 years after year-end (bokføringsloven § 13), SE 7
  years after the end of the calendar year (BFL 7 kap. 2 §), PK 6 years after the tax year under ITO 2001 s.174(3)
  (verify current wording) and, as I understand it, 10 years for books of account under Companies Act 2017 s.220
  (verify). Company deletion in Org must never delete the books within retention.
- **Fix:** read-only "retention access" (reports, journal listing, GL, audit trail) after FINANCE is switched off,
  or a mandatory complete export at termination (SAF-T / SIE / PK registers + PDF reports + attachments). Block
  company deletion while books are inside retention.

#### 14. Multi-currency rules contradict each other — Major (before `MULTI_CURRENCY`)

- **Where:** AC-0 §4.1 JournalLine invariant ("Σ txn DR = Σ txn CR per currency when all lines share a currency")
  vs §5.3 step 7 ("balance check first on transaction amounts per currency: any difference → 422"); §5.3 step 7
  FX residue → `ROUNDING`.
- **What is wrong:** A normal FX journal (pay a EUR supplier from a NOK account; DR AP EUR, CR bank NOK, DR FX loss)
  never balances per transaction currency; step 7 would refuse it. Residues from conversion are exchange
  differences, which belong on FX gain/loss, not rounding. Period-end revaluation of monetary items (IAS 21 / IFRS
  for SMEs 30; NO/SE balance-day rate) is "later" with no design.
- **Fix:** per-currency balance only for single-currency journals; mixed-currency journals balance in base; residue
  to `FX_REALIZED_*`; design the revaluation run (auto-reversing) and functional vs transaction currency rules
  before switching the flag on. Nothing to change in A2/A3.

#### 15. First/extended/changed fiscal years; no first-year comparatives — Major (later), Minor now

- **Where:** AC-0 §4.1 FiscalYear ("12 months starting at fy_start_month"); A0 §6.11; AC-A0 §3 ("change fiscal
  year … not in v1"); A0 Q2 (go-live date only in current/next year); A3 C-10 comparatives.
- **What is wrong:**
  - SE BFL 3 kap. 3 § allows the first fiscal year (and a change of year) to be shorter or longer, up to 18 months;
    NO and PK have similar first-year and change-of-year cases (PK ITO s.74 special tax year; verify details). A
    newly founded AB in September commonly runs its first year to 31 Dec of the next year. Not possible here.
  - Annual accounts need comparatives (NO rskl § 6-6; SE ÅRL; IFRS for SMEs 3.14). In the first NeoERP year the
    prior year is not in the system and cannot be entered (nothing before go-live).
- **Fix now (Minor):** say both limitations plainly in `fiscal-calendar.md` and `setup-and-go-live.md`.
- **Fix later:** (a) a first year of 1–18 months and a reviewed "change fiscal year" operation; (b) "prior-year
  comparatives" import (closing TB of the year before go-live, stored as reference data, never as postings) used by
  P&L/BS compare columns.

#### 20. Server UTC date — Minor

- **Where:** A0 C-11, A1 C-24 (UTC "today" for defaults, role-mapping `effective_from`, tax-version "today or
  later").
- **What is wrong:** Pakistan is UTC+5, Norway/Sweden UTC+1/+2. A remap at 00:30 Lahore on the 1st is dated the
  previous day; defaults show yesterday's date for five hours a day.
- **Fix:** derive a company time zone from the country (Org fact later) and use the company's local date for every
  "today".

#### 21. Equity presentation and dividend handling — Minor (statutory output)

- SE ÅRL: eget kapital split into bundet (aktiekapital, reservfond, uppskrivningsfond…) and fritt (balanserat
  resultat, årets resultat). NO rskl § 6-2: innskutt vs opptjent egenkapital; the NO P&L shows "Overføringer og
  disponeringer" (avsatt utbytte, overført annen egenkapital) under årsresultat (verify exact § 6-1 wording). The
  design has one flat EQUITY section and no transfers block. PK: statement of changes in equity.
- Fix with the statutory output (slice H or an annual-accounts slice): equity sub-sections per pack; NO dividend
  booked as a period-13 journal 2050 → 2800 (never through a P&L account, so årsresultat is not reduced); guide text.

#### 22. VAT corrections in locked periods — Minor (slice E)

- **Where:** period-close guide ("Lock right after the VAT return… post the correction in an open month").
- **What is wrong:** For NO (MVA-melding since 2022) and SE (rättelse av momsdeklaration) an error belongs to the VAT
  term in which it arose and is corrected by a corrected return for that term (verify current practice for small
  amounts). A correction booked in an open month would land in the wrong term in E's report.
- **Fix in E:** a "VAT term" attribute on correction lines (defaults from date; may point to a locked earlier term),
  and E's report per term uses it.

#### 24. Waiting journals are not aged — Minor

- SE BFL 5 kap. 2 § (cash transactions by the next working day; others as soon as possible) and NO § 7 (ajourhold)
  care about timeliness. Drafts and SUBMITTED journals are not "booked" until posted. Show age on Waiting to post and
  warn at period close when something has waited more than N days.

#### 23 (rest). Guide wording — Minor

- `year-end.md` "Next year's opening balances depend on it": not true in this design (balance-sheet balances are
  carried forward by query whether or not the year is closed). Say instead "the result moves into retained earnings;
  it can't be undone".
- `README.md` and `year-end.md` should not present the year-end as the step right after closing December; tie it to
  "after the auditor has agreed the accounts" and list the usual year-end entries (see 6).
- `period-close.md`: add the bank, VAT and payroll-liability reconciliations to "When to close a month"
  (recommendation, until D/E add checks).
- AC-A2A3 §4.7 example uses 2098 for Opening-balance equity while A3 conflict 9 uses 2098 for SE retained earnings;
  check the pack and use consistent example numbers.
- `chart-and-used-for.md` "Deactivating needs a zero balance in open periods": the rule (A1 C-22) is a zero balance
  over the account's whole history; reword.

---

### Checklist results (brief)

| Checklist item | Result |
|---|---|
| Every posting balances; exact decimals at currency scale | Engine: exact, no tolerance, decimal strings, NUMERIC, no floats (good). No DB-level balance/scale check (18). Per-currency rule inconsistent for later FX (14). |
| Posted immutable; corrections by reversal; gap-free numbering per series and year | Yes: triggers, RV with two-way links, number at post under row lock per (company, FY, type), rollback uses no number, 200-concurrency test. Hardening of triggers (5). Satisfies the "obruten nummerserie per serie" reading of BFNAR 2013:2 and NO/PK practice. |
| Period state on every write path; period 13 only for year-end; reopen audited with reason | Yes: post, submit (A1-A4), reversal, machine, year-end all re-check under lock; 13 only JV-adjustment and YE; reopen with reason, history with acknowledged warnings and check snapshot; lock final in DB. |
| Two-person rule; machine clients | Strong contributors rule; Owner exception audited. Gaps: one-person reversal (16) and year-end (6); machine approver not verified (11). |
| Control accounts only via sub-ledger | Protected kinds with code + reason; OB refuses AR/AP. Close AR/AP fully until B (17). |
| TB ties to ledger; BS balances incl. result; P&L result = YE transfer | Yes, by design and by named property tests; reconciliation flags in every response; prior-years-not-closed line keeps BS balanced on every date. |
| Tax: rate versions by date, country codes, reverse charge both sides, rounding | Versions insert-only, jurisdiction, RC needs both roles, per-line HALF_UP in B. Back-dating refused (10). |
| Audit trail, retention, systemdokumentasjon, verifikation, specifications, kontrollspor | Audit outbox complete and transactional; but no document link (1), no journal listing (2), no tenant audit view or system description (12), retention after termination (13). |
| Year-end, opening balances, retained earnings, non-calendar years, first years, multi-currency, OBE | Non-calendar (PK July) fine; OBE blocked at year-end (4); irreversible single-person year-end (6); SE 2099 (9); first/extended years and comparatives missing (15); FX later (14). |
| Report presentation, Dr/Cr | TB/GL with Dr/Cr sides and signed natural statements: good. BS and P&L layouts need the fixes in 7 and 8; equity presentation later (21). |

---

### Done well

- **Posted means permanent** in domain, API and database; corrections only by reversal, linked both ways; a reversal
  is never dated before its original; RV and YE cannot be reversed.
- **Gapless numbering** taken at post, under a row lock, inside the posting transaction, per company, fiscal year
  and type, with fiscal-year labels a Pakistani July year reads correctly (`JV-2026-27-000123`); drafts never get a
  legal number.
- **Period control** re-checked under lock on every path; lock is final in the database; every close, reopen and lock
  keeps a reason, the warnings acknowledged and a snapshot of the checks.
- **Two-person rule by contributor**, not by role: editing or submitting someone's draft also bars posting it.
  Owner exception explicit, confirmed and recorded on journal, audit and event.
- **Money handling**: decimal strings on the wire, NUMERIC in storage, wider aggregates, no floating point
  (architecture tests on both sides), no auto-balancing of manual journals (R1).
- **Opening balances** cannot carry AR/AP, which forces per-document opening items and keeps ageing = control.
- **Year-end design**: P&L excludes YE so the closed year's P&L never changes; closing lines kept per branch and cost
  centre; BS balances on every date with "result for the year" and "result of prior years not yet closed";
  suspense and OBE checks; preview hash so the poster approves exactly what posts.
- **Honest filtered reports**: branch TB shows "other branches and untagged lines"; branch P&L states what untagged
  amounts it leaves out; BS refuses a branch filter instead of pretending.
- **Nightly ledger check** that alerts and never self-heals; year-end blocked while it fails.
- **Tax codes** follow the country, not the chart; insert-only rate versions; source, evidence version and check
  state carried to the company; reverse charge needs both sides; jurisdictions for Pakistan's federal/provincial
  split.
- **Exports audited before the first byte**, platform staff cannot export, CSV formula-injection guard.
- **Ledger data never deleted in-app**; ≥ 10 years stated for audit retention.

---

## Appendix — Review 02: chartered accountant / tax specialist — Accounts B, C, D, E and H

Reviewer: accountant and tax specialist (NO MVA, SE moms, PK FBR sales tax, provincial sales tax on services, income-tax withholding). Read-only review, 2026-10-09.

Files read: `NeoERP-BackEnd/docs/api/accounts-b.md`, `accounts-c.md`, `accounts-d.md`, `accounts-e.md`, `accounts-h-design.md`, `accounts-decisions-for-jabran.md`, `accounts-roadmap.md`, `docs/handover/next-modules-plan.md` §3 (ADR-018), and parts of AC-0, A0 and A1. I also skimmed the app spec AC-BC for the fields people enter. The pack file `coa/tax-codes.csv` is not in the upload, so I took tax-code names from E §3.3.

**About legal citations.** I give section numbers from general professional knowledge. Anything marked *(verify)* has to be checked against the current official text under P17 before it goes into a pack or contract. This applies most to Pakistani SROs and thresholds, which change every Finance Act.

Severity:
- **Blocker**: the slice would issue legally defective documents, or would leave a common real transaction with no correct path, and so cannot be approved as written.
- **Major**: wrong tax or ledger results in a normal case for at least one country, or a design choice that is expensive to change after build.
- **Minor**: an improvement, or an edge case.

---

### 1. Blockers

#### BL-1 Customer and supplier refunds have no path anywhere
- **Where:** B §1 "Not in B: … customer refunds (money paid back; with D)"; C §1 "supplier refunds (with D)"; D §1 "Not in D: receipts against invoices (B), payments against bills (C)"; D C-9 (a counter line may not be AR or AP); B BA-1 / C CA-1 (manual JV lines on AR and AP are refused once the sub-ledger is used).
- **Problem:** B and C send refunds to D, and D sends them back. Meanwhile AR and AP are closed to manual journals. So no correct entry exists for any of these:
  - paying back a customer's overpayment;
  - paying back a credit balance after a credit note on an invoice that was already paid (B C-16 puts that excess "on account");
  - receiving a refund from a supplier.

  All of these happen every month. Today the credit balance would sit on AR/AP for ever, or someone would be pushed into a control-account JV with `POST_CONTROL`, which BA-1 forbids.
- **Fix:**
  - Add a **customer refund** document in B: DR `AR_CONTROL` (party) / CR bank. It is an allocation *target* for credit sources (receipts, credit notes, opening credits). Money goes out, so it needs two people, like C C-11.
  - Add the mirror **supplier refund received** in C: DR bank / CR `AP_CONTROL`. It is a target for debit sources.
  - Both use one bank line, the reconciliation hook and engine reversal (D N-B-1…4).

#### BL-2 The legal content of invoices is not captured when the invoice is issued, and posted invoices cannot be changed
- **Where:** B C-6, C-27, open point 4 / D-22 (PDF later). B §3.1: only `customer_snapshot` is stored. There is no seller snapshot, no supply date and no per-code legal wording.
- **Problem:** Approval gives the document its legal number and makes it permanent (the trigger). From that moment it *is* the issued invoice. The "document output" slice can only print what B stored at approval. If the company's facts change later, a reprint will be wrong. Several fields each country requires are not stored at all:
  - **NO, bokføringsforskriften §5-1-1:**
    - the seller's name, address and organisasjonsnummer **followed by "MVA"** when VAT-registered;
    - "Foretaksregisteret" for registered enterprises (foretaksregisterloven §10-2);
    - the time and place of delivery (*leveringstidspunkt og -sted*);
    - the due date;
    - the VAT amount;
    - for a zero-rated or exempt supply (§5-1-1 nr. 5 with MVA rules), a note of the basis.
  - **SE, mervärdesskattelagen (2023:200) 17 kap. 24 § and the old 11 kap. 8 § rules (verify the paragraph numbers):**
    - the seller's VAT number, and the **buyer's** VAT number for EU supplies and reverse charge;
    - the date of supply, if it differs from the invoice date;
    - the taxable amount and VAT per rate;
    - for exempt, reverse-charge or zero supplies, the reason in words ("Omvänd betalningsskyldighet", or a reference to the provision or the directive article);
    - on foreign-currency invoices, the VAT in SEK.
  - **PK, Sales Tax Act 1990 s.23 with Sales Tax Rules 2006:**
    - the name, address and **NTN/STRN of both seller and buyer** (CNIC for an unregistered buyer above the threshold, verify);
    - a serial number and date;
    - a description and **quantity of goods**, plus the **HS code** under the current rules (verify);
    - the value excluding tax, the sales tax, and the value including tax;
    - further tax and extra tax shown separately;
    - for reduced-rate or exempt lines, the SRO or schedule reference.
- **Fix (B, now, not in the PDF slice):**
  - At approval, store a `seller_snapshot`: legal name, org no./NTN, VAT/STRN number, "MVA"/"Foretaksregisteret" flags, address, and the bank/KID details used.
  - Add document fields: `supplyDate` (or a supply period from/to), `buyerVatNumber` (in the snapshot), and for PK `buyerCnic`.
  - Add line fields: `unitOfMeasure`, `hsCode` (PK; nullable until Inventory has an item master), `saleType` / SRO reference (PK).
  - Give each tax code an `invoiceLegalText` (exemption or reverse-charge wording per language), and copy it to the line at approval.
  - The approve step refuses a PK invoice with no buyer NTN/CNIC when the buyer is registered (or above the threshold).

#### BL-3 Pakistan FBR digital invoicing has no hook in the approval path (registered sellers)
- **Where:** B §5.3 (approve = one database transaction, number given, commit); H §7 and ADR-010 place real-time FBR invoicing in `FiscalProvider`. Neither B nor ADR-010 defines how an issued invoice waits for, or records, FBR acceptance.
- **Problem:** FBR's digital-invoicing regime (Sales Tax Rules Chapter on e-invoicing, as amended by SRO 709(I)/2025 and related SROs, phased by taxpayer class; *verify the current scope and dates*) requires registered persons in scope to send each invoice, debit note and credit note to FBR, through a licensed integrator or PRAL, and to print the **FBR invoice number and QR code** on the document. Tier-1 retailers have a separate POS integration duty (s.40C, Rules 150ZEA ff., verify). The Sialkot demo tenant (a manufacturer) is exactly in scope. B can approve, number and post an invoice that is never fiscalised. Nothing in the design can show "accepted by FBR" or hold the document until it is.
- **Fix (hook in B now; the integration itself is ADR-010 work):**
  - Add `fiscal_status` (`NOT_REQUIRED`, `PENDING`, `ACCEPTED`, `REJECTED`), `fiscal_ref`, `fiscal_qr_payload`, `fiscal_at` and `fiscal_error` on `ar_documents`. These are the only columns the immutability trigger lets change after POSTED.
  - Write an outbox row in the approval transaction. A `FiscalProvider` sends it after commit, with retry.
  - A PK company setting "digital invoicing required" blocks the print/send actions until `ACCEPTED`.
  - If FBR rejects an invoice, it is corrected by a credit note plus a new invoice. The posting is never edited.
  - Same for credit notes. Also store the original invoice's FBR number on the credit note (FBR requires the reference).

---

### 2. Major

#### MJ-1 Advance payments: no VAT on prepayments where the tax point is the payment
- **Where:** B C-22 (unallocated receipts stay on `AR_CONTROL`, no tax); C C-15 (same for AP).
- **Problem:**
  - **SE:** for domestic supplies, VAT is due when an advance (*förskott*) is received (ML 2023:200, the tax-point rules; verify the chapter).
  - **PK:** "time of supply" in s.2(44) is brought forward when payment is received before delivery (verify the current wording).
  - **NO:** VAT generally follows the invoice. But a *salgsdokument* rule applies to prepayments in some cases (verify bokføringsforskriften §5-2).

  A receipt "on account" before the invoice therefore understates output VAT for SE and PK.
- **Fix:**
  - Add an "advance receipt" option with a tax code (or a prepayment invoice kind `ADVANCE`).
  - It posts DR bank / CR `CUSTOMER_ADVANCES` (net) / CR output VAT, tagged `TAX`.
  - The final invoice deducts the advance line, with a negative base, and moves the advance to AR.
  - Mirror in C for input VAT on prepayments where an advance invoice exists (SE, PK).
  - This also fixes the balance-sheet presentation in MN-2.

#### MJ-2 No write-off of small differences, bank charges deducted on receipt, or settlement discounts
- **Where:** B §1 (settlement discounts and bad debt out of scope); B C-23 (allocation never posts); D C-11 (exact-amount matches).
- **Problem:** Common cases leave a residual on the invoice for ever:
  - foreign transfers and card receipts arrive net of bank fees;
  - customers short-pay by cents or round;
  - customers take early-payment discounts.

  The only tool is a credit note. A credit note *reduces output VAT*, which is wrong for bank charges and rounding, and it creates a customer-facing document for an internal matter.
- **Fix:**
  - Let receipts and payments carry 0–5 **adjustment lines**: kind `BANK_CHARGE` (role `BANK_CHARGES`), `ROUNDING`, or `WRITE_OFF_SMALL` (role `BAD_DEBT_EXPENSE`, below a company limit). These lines have no tax, are allocated like withholding, and are part of the RC/PY journal.
  - Settlement discount with VAT adjustment: later, as a credit note subtype (NO, SE and PK all treat it as a reduction of the base).

#### MJ-3 Bad debts and VAT relief are missing (the `BAD_DEBT_EXPENSE` role is unused)
- **Where:** B §1; AC-0 role catalogue. AR is closed to manual JVs (BA-1).
- **Problem:**
  - **NO:** mval §4-7 lets output VAT be reduced on a realised loss (*konstatert tap*). The mva-melding reports it with the specification "tap på krav" (verify the code).
  - **SE:** ML 2023:200 allows *kundförlust* reduction of the taxable amount (verify the chapter).
  - **PK:** there is no general bad-debt relief. The output tax stays.

  With BA-1 there is no way at all to write off a dead receivable.
- **Fix:**
  - Add a **write-off** document in B: two people, a reason, per invoice or part of one.
  - It posts DR `BAD_DEBT_EXPENSE` net + DR output VAT (a negative TAX line with a negative base, flagged `tax_adjustment_kind = BAD_DEBT`, only where the country pack allows relief) / CR `AR_CONTROL`, and allocates to the invoice.
  - Add a "recovered bad debt" reverse path.
  - E boxes map it (NO specification line; SE ruta 05/10 reduction).

#### MJ-4 PK s.153 withholding base defaults to the gross including sales tax
- **Where:** C C-13 (base default = Σ of the allocations); B §7.12 (same for customer withholding); AC-BC §5.5 hint.
- **Problem:** For s.153(1)(a) supplies of goods (and in practice (b) services), income-tax withholding is computed on the gross amount **excluding sales tax** (verify the current FBR guidance and the Finance Act). For sales-tax withholding under the Sales Tax Withholding Rules (Eleventh Schedule, verify), the base is the **sales tax amount** (1/5 or 100% depending on the supplier's status). Allocated totals include sales tax, so the default base overstates the base, and the s.165 statement and E's per-payee figures are wrong whenever the person keeps the default.
- **Fix:**
  - Each WITHHOLDING code gets `baseType` ∈ `NET_OF_SALES_TAX`, `SALES_TAX`, `GROSS`.
  - The default base = Σ (allocated amount × the bill's net/total ratio) for `NET_OF_SALES_TAX`, and Σ allocated tax share for `SALES_TAX`.
  - The amount can still be typed.
  - Add a pack rate hint (non-binding) and an ATL-status-based rate (MN-8).

#### MJ-5 PK: sales tax withheld *by the customer* (seller side) is missing
- **Where:** B C-21 (only `PK-WHT-BY-CUST`, which is income tax, maps to PK-IT-ADJ in E); E PK-FBR-ST boxes.
- **Problem:** Withholding agents (government, large companies) withhold part of the **sales tax** on invoices from a registered supplier and pay it to FBR. The seller declares full output tax and takes credit for the withheld part in the return (verify the current form line). B can only record it as income-tax withholding, so:
  - the FBR return overstates sales tax payable, and
  - the claim sits on `WHT_RECEIVABLE` (the income-tax asset).
- **Fix:**
  - Add a SALES-side withholding code `PK-ST-WHT-BY-CUST` (base type `SALES_TAX`).
  - Its account is a sales-tax receivable or contra-output account.
  - Add an E box `ST-WITHHELD-BY-BUYER` that reduces `ST-PAYABLE`.

#### MJ-6 PK input-tax restrictions and the payable computation in E
- **Where:** E PK-FBR-ST: `ST-PAYABLE = ST-OUTPUT+ST-FURTHER+ST-WHT−ST-INPUT`.
- **Problem:** The formula leaves out:
  - **s.8B**: input adjustment capped at a percentage of output tax (90% historically, verify the current % and exemptions), with the excess carried forward;
  - **s.10 / carry-forward** of excess input from the previous period;
  - **s.8(1)(ca)/(caa)**: input disallowed unless the supplier declared the supply (Annex-A matching);
  - **s.73**: input disallowed where an invoice above the threshold (Rs 50,000, verify) was not paid through a banking channel;
  - **s.7 proviso**: input claimable within the following six tax periods (verify).

  "To pay" in the box view will be wrong for most PK filers.
- **Fix:**
  - E: add boxes `ST-INPUT-BF` (brought forward, from the prior period's computed carry-forward), `ST-INPUT-INADMISSIBLE` (manual, with reason, or from flags), `ST-8B-CAP` (computed) and `ST-INPUT-CF`.
  - C: flag bills above the s.73 threshold that were paid in cash (`paidViaBankingChannel` from the payment's account kind).
  - H-PK: Annex-A needs supplier STRN, invoice number and invoice date per bill. C has them; make supplier STRN required for PK INPUT codes.

#### MJ-7 Non-deductible and partly deductible input VAT
- **Where:** C §1 "input-tax apportionment" out of scope; C §6 INPUT is always 100% deductible; E D-36 full deduction for RC.
- **Problem:** Blocked or partly blocked input VAT is routine, not an edge case:
  - **NO:** representation, cars, and staff welfare (mval §8-3).
  - **SE:** representation (max SEK 300 base per person per occasion, verify), passenger cars (50% for leasing), and mixed exempt/taxable businesses.
  - **PK:** s.8 inadmissible items (e.g. vehicles, verify); mixed taxable and exempt supplies (s.8(2) apportionment).

  With full deduction only, every such bill overstates input VAT unless the person chooses EXEMPT, which then reports in the wrong box. The same applies to reverse charge: NO codes 87/89/92 and SE require *no deduction* for exempt businesses.
- **Fix:**
  - Add `deductiblePercent` (0–100, versioned) on INPUT and REVERSE_CHARGE codes.
  - The non-deductible part is added to the line's expense or asset account (the `NET` line), and only the deductible part goes on the TAX/RC_INPUT line (keep the base).
  - Seed the NO "without deduction" codes and SE rules.
  - A company-level pro-rata for mixed use can come later as an annual adjustment.

#### MJ-8 Tax period is driven by `entry_date`, with no separate tax-point date
- **Where:** E §5 (range on entry dates); C C-5 (a bill dated in a closed period posts in a later period, at the bill-date rate); B C-8.
- **Problem:**
  - **NO:** input VAT belongs to the term the documentation is dated (mva-forskriften §15-10, verify). A late bill posted in a later term needs a correction of the earlier term, not inclusion in the current one.
  - **PK:** the six-period window (MJ-6).
  - **SE:** is more flexible (input VAT in the period the invoice is received or booked), but needs consistency.

  E cannot show or check this, because only `entry_date` is on the line.
- **Fix:**
  - Add `tax_point_date` to tagged lines: the invoice or bill date, or the supply date when given.
  - E reports by country rule: NO and PK by `tax_point_date` within the term, with "late documents" listed (documents whose tax point is in an earlier, already-reported term); SE by entry date.
  - Add a check `LATE_TAX_DOCUMENT`.
  - For NO, decide whether late items go into the current mva-melding (allowed for small corrections? verify) or need a corrected earlier melding.

#### MJ-9 Bank entries let income and expenses bypass VAT, and cannot carry withholding
- **Where:** D C-9 (counter lines of any type except protected kinds; "No tax code on bank entry lines").
- **Problem:**
  - A MONEY_IN to an INCOME account (cash sale, scrap sale, rent received) posts revenue with **no output VAT** and no base in the return.
  - A MONEY_OUT to an expense with a valid receipt (card purchase, fuel) loses input VAT.
  - In PK, bank profit is credited net of **s.151 withholding**, and bank charges carry FED/PST on banking services. Neither can be tagged, so E's withholding-from-us and input-tax figures are incomplete.
- **Fix (pick one, decision OD-8):**
  - (a) Allow a tax code on MONEY_IN/OUT counter lines: OUTPUT, ZERO, EXEMPT, OUT_OF_SCOPE on IN; INPUT, WITHHOLDING (SALES side) on IN for bank WHT; INPUT on OUT. Tags as B/C, with `party` optional. **Recommended.**
  - (b) Refuse INCOME accounts as MONEY_IN counter lines (send people to B), and warn on EXPENSE lines in VAT-registered companies.

#### MJ-10 No KID/OCR, Bankgiro or Plusgiro
- **Where:** B (no payment reference generated); C C-2 (supplier bank details = bank name, account number, IBAN, BIC; no payment reference on bills); D C-17 (clearing number only for the company's own accounts).
- **Problem:**
  - **NO:** customers pay with **KID**, and supplier invoices carry KID, which the bank payment must quote.
  - **SE:** most B2B payments go through **Bankgiro** (or Plusgiro) with an **OCR reference**. Supplier records need a BG/PG number, and the bill needs the OCR.

  Without these, NO/SE companies cannot pay suppliers correctly (payments are rejected or misapplied), and receipts cannot be matched by reference.
- **Fix:**
  - **B:** at approval, store an invoice `paymentReference`: generate KID (MOD10 or MOD11, per company setting, with length) for NO, and OCR (Luhn, optional length digit) for SE. Show it to D's suggestions and the `SourceReferencePort`.
  - **C:** add bill `paymentReference` + `paymentReferenceType` (KID, OCR, FREE), validated with check digits, and copied to the payment and its `reference`. Add supplier `bankgiro` (7–8 digits, Luhn) and `plusgiro` (Luhn). Put these under the C-3 bank-detail change guard.
  - Seller BG/PG and KID agreement go in the seller snapshot (BL-2).

#### MJ-11 Single currency is assumed in the allocation design
- **Where:** B C-23 / C-23 mirror ("allocation posts nothing … single currency"); `MULTI_CURRENCY` off; roadmap "multi-currency … not on the roadmap".
- **Problem:** Sialkot exporters (PK) and Nordic companies selling to the EU invoice in USD/EUR as a matter of course. When currency arrives:
  - settling a foreign invoice creates **realised FX gain/loss**, so allocation *must* post;
  - period-end needs **unrealised revaluation** of open items;
  - SE requires the VAT amount in SEK on the invoice; NO requires the rate used;
  - PK export proceeds use SBP rates, and export rebate/zero-rating needs the e-Form/GD reference.

  The current "allocation never posts, so ageing = control by construction" invariant will break, and that is a costly redesign after B, C and D are built.
- **Fix:** Decide now (OD-9).
  - Keep v1 single-currency.
  - But: add `currency`, `exchange_rate` and `amount_base` columns to documents, receipts and allocations, defaulting to base and rate 1.
  - Define allocation as *able* to post an FX-difference journal (type `FX`, role `FX_GAIN`/`FX_LOSS`) that is a no-op at rate 1.
  - State the future ageing invariant in base currency including FX journals.

#### MJ-12 Credit notes against opening items are refused
- **Where:** B §8 "Neither can be credited"; C §8.
- **Problem:** Returns and price disputes on invoices issued before go-live are normal in the first months. A credit note must reference the original invoice and, to reduce output VAT, carry its rate. NO, SE and PK all require the credit note to reference the invoice it corrects. Today the person can only allocate a manual opening credit, which reduces neither VAT nor the return, or else issue a "credit" on a fake invoice.
- **Fix:**
  - Allow a credit note against an OPENING debit item, with typed lines: account, net, tax code, rate as on the original, and the original number from `originalNumber`.
  - The tax part posts TAX lines with a negative base.
  - Capped at the opening item's open amount (gross).
  - Same for debit notes on AP opening items.

#### MJ-13 PK credit and debit note conditions
- **Where:** B C-16 (any date ≥ the invoice date); C C-10.
- **Problem:** Under Sales Tax Act s.9 and Sales Tax Rules 2006 (Chapter on debit/credit notes, verify the rule numbers), a tax adjustment through a credit or debit note is allowed only within a limited period (180 days, verify) of the supply, and the document must carry the original invoice's number, date and (with e-invoicing) FBR number. Beyond that, the price adjustment is allowed but the output tax is not reduced.
- **Fix:** Add a PK pack rule `creditNoteTaxWindowDays` on the tax code or country.
  - Past the window, the credit note is allowed with tax 0 and the tax part reported as a non-adjustable credit (or refused, by setting).
  - Add a warning in the editor.

#### MJ-14 NO mva-melding mapping is incomplete
- **Where:** E §3.3 NO-MVA rules.
- **Problem:** The mva-melding (2022 format) is line-per-SAF-T standard tax code. The draft maps 1, 11, 13, 14, 3, 31, 33, 5, 52, 6, 81 and 86. Missing:
  - 12 (input on raw fish) and 32 (raw fish 11.11%), if relevant;
  - **51** (domestic sale with reverse charge, e.g. emission quotas and gold);
  - **82** (import of goods without deduction), **83/84/85** (import at 15% / zero / exempt, verify), **15** (import VAT paid at customs, 15%);
  - **87/88/89** (services from abroad without deduction / 12% variants);
  - **91/92** (domestic reverse-charge purchases with and without deduction).

  The melding also requires *specification lines* (e.g. "tap på krav", "uttak", "justering", "tilbakeføring") for adjustments. There is no way to mark them.
- **Fix:**
  - Complete the code list in the pack.
  - Add `tax_adjustment_kind` (`BAD_DEBT`, `WITHDRAWAL`, `ADJUSTMENT`, `REVERSAL`) on TAX lines.
  - Add a box-rule `specification` column (NO only).
  - Ties to MJ-3 and MJ-7.

#### MJ-15 SE momsdeklaration mapping is incomplete; EC sales list excluded
- **Where:** E §3.3 SE-MOMS; E §1 "EC sales list … not in E".
- **Problem:**
  - Missing seller-side **ruta 41** (sales where the buyer is liable in Sweden, e.g. construction services, *omvänd skattskyldighet bygg*; very common for SE trades), 40 (services abroad, not the EU main rule), 37/38 (triangulation), 06 (*uttag*), 07 (margin scheme), 08 (voluntary tax on rent).
  - Missing RC codes at 12%/6% (31/32, 61/62 exist with no rules).
  - `SE-MOMS-RC-DOM` maps to 24 (services). Domestic reverse charge on **goods** (mobile phones, chips, metals, emission rights) belongs in **23**, so it needs two codes.
  - The **periodisk sammanställning** is a monthly or quarterly legal duty for EU goods and services sales. Without it, an SE company selling to the EU cannot comply (the data exists: buyer VAT no. and base).
- **Fix:**
  - Add the codes and rules.
  - Add a minimal "EC sales list" report: per buyer VAT number, goods / services / triangulation totals per period, CSV in Skatteverket's file layout (verify the format). Put it in E or H-SE.
  - Same idea for NO? Not required (NO is not in the EU).

#### MJ-16 PK Third-Schedule goods: sales tax on retail price
- **Where:** B C-10 (tax = net × rate).
- **Problem:** For goods in the Third Schedule (FMCG, beverages, etc.; verify the list), sales tax is charged on the **printed retail price**, not the sale price. Distributors and manufacturers of consumer goods (a likely PK segment) cannot invoice correctly.
- **Fix:**
  - Add a PK OUTPUT code attribute `baseRule = RETAIL_PRICE`. The line then requires `retailPrice` per unit, and tax = round(qty × retailPrice × rate).
  - `tax_base_amount` = the retail value.
  - Add it to the shared math vectors.

#### MJ-17 ADR-018: B and C lack the hooks Sales, Purchasing and Inventory need
- **Where:** next-modules-plan §3; B C-2, C-9 (`itemId` reserved), §7 (person tokens only, `@AccountsEndpoint` tier 2 with `neoerp.app`); C C-6 (control accounts, including INVENTORY, refused on bill lines; there is no GRNI).
- **Problem:** Under ADR-018, Sales creates invoices and Purchasing creates bills **through B/C**. As drafted, that is not possible:
  1. **Caller:** no machine or service API exists. Idempotency is keyed on (`created_by`, `client_key`), which is wrong for a service retrying for many users.
  2. **Source links:** no `sourceModule`, `sourceDocumentId` or `sourceLineId` on documents and lines (delivery / goods-receipt lines), so there is no three-way match and no audit trail from delivery to invoice.
  3. **Items, UoM, quantity and stock location:** `item_id` is reserved but there is no UoM, no stock-location tag (A1 has one on journal lines) and no HS code (PK, BL-2).
  4. **Purchases of stock:** the bill line must DR a **GRNI / goods-received clearing** account (Inventory has already DR stock / CR GRNI), with purchase-price variance to an expense. C-6 refuses every control kind and has no GRNI role.
  5. **Approval policy:** a Sales-generated invoice from a confirmed delivery goes through DRAFT → SUBMITTED → a second person. Is the delivery confirmation the "first person"? This is undefined.
  6. **Sales returns:** a credit note must link to a stock return so Inventory reverses COGS at the original cost.
  7. **Parties:** Sales and Purchasing add commercial fields. B/C need stable ids plus `accounts.customer.changed` (exists) and a read port. Fine, but B's customer `currency` = base and the missing price-list/terms split should be noted.
- **Fix:**
  - **B and C:** add `source_module`, `source_document_id`, `source_document_ref` on documents, and `source_line_id`, `item_id`, `uom`, `stock_location_id` on lines (all nullable).
  - Add an **in-process or service-token create API** (`POST /internal/sales-invoices`, tier-1 service auth) with idempotency on (company, sourceModule, sourceDocumentId).
  - Add a company policy for documents created by a source module: (a) created as SUBMITTED by the source user, approved by an Accounts person, or (b) auto-approved with `SingleStep` evidence when the source document was approved by two people (decision OD-11).
  - **C:** add a `GRNI` control kind/role and let PAYABLES post it in-process (`allowed_modules`). A bill line linked to a goods-receipt line DRs GRNI for the received value and DRs `PURCHASE_PRICE_VARIANCE` for the difference.
  - Add events `accounts.sales_invoice.posted` (exists) with line source ids.

#### MJ-18 Withholding: certificates, deposits and statements; capture the data now
- **Where:** C C-13, B C-21, E C-12; D/H defer certificates and the s.165 statement.
- **Problem:**
  - The ITO requires the withholding agent to give the payee a **certificate** (s.164) and to file periodic **s.165 statements** listing each deduction with the payee's NTN/CNIC, section, date, amount and the **CPR (computerised payment receipt) / PSID** of the deposit.
  - Deposit is due within short statutory deadlines (verify the rule).
  - Neither bank entries (D) nor payments capture a CPR/PSID, or link deductions to the deposit that paid them.
- **Fix:**
  - D: MONEY_OUT lines on a WHT or tax account carry an optional `taxDepositRef` (CPR/PSID) and `periodFrom`/`periodTo`.
  - E: report deductions not yet covered by a deposit.
  - C: store the payee's NTN/CNIC in the payment's supplier snapshot.
  - Certificate output goes with the document-output slice.

---

### 3. Minor

| # | Where | Problem | Fix |
|---|---|---|---|
| MN-1 | B C-8, §9.1 ("a document may be dated ahead") | Invoices may be future-dated or back-dated in an open period, while numbers are gapless and allocated in approval order. Out-of-order dates against numbers draw auditor queries (NO "kontrollerbar sekvens", SE BFL *verifikationsnummer* order). NO requires an invoice within one month of delivery (verify); SE requires a B2B invoice by the 15th of the following month (verify). | Refuse an invoice date more than N days ahead (setting, default 0). Warn when the date is before the latest number's date in the series. Warn when supplyDate (BL-2) is past the country's issue limit. |
| MN-2 | B C-22, C C-15 | Customer credit balances (and supplier debit balances) are netted inside the control account. The balance sheet should show them gross (customer credits as a liability). | A3 balance-sheet note or reclass: report AR credits / AP debits from the sub-ledger as separate lines. Or use `CUSTOMER_ADVANCES` with MJ-1. |
| MN-3 | D (cash) | No guard against a **negative cash box** balance. No warning for large cash payments: PK ITO s.21(l) disallows expenses paid in cash above a limit (verify the amount); PK s.73 (MJ-6); NO cash-limit rules for traders (verify); SE cash sales need a certified *kassaregister* (POS slice). | Refuse (setting) or warn when a CASH account would go below zero on the entry date. Per-country thresholds that warn on cash payments to suppliers above the limit. |
| MN-4 | D C-13 / R2-2 | Carried-forward bank-only items can sit for ever. | Show the age on the report, and add a close-check WARN for carried items older than one period. |
| MN-5 | C C-7 | The tax-override threshold is an absolute 1.00 base currency, which is meaningless across PKR/NOK/SEK. | Make it per currency (pack): PKR 10, NOK/SEK 1, and also relative (> 0.5% of base). |
| MN-6 | B C-10 (no document-level rounding) | SE and NO invoices are often rounded to whole kronor (*öresutjämning*). PK retail rounds to whole rupees. | An optional total-rounding line to role `ROUNDING`, outside the tax base, with a company setting. |
| MN-7 | B §7.4 (customer) | No EU/EEA VAT number check, and no country-driven code default: a domestic OUTPUT code on an EU business customer; an EU code with no buyer VAT number. | Warning rules at submit: country ≠ company country and code is domestic; EU code without `salesTaxRegistration`. VIES lookup later. |
| MN-8 | B/C parties (PK) | There is no **ATL** (Active Taxpayer List) status. Further tax (s.3(1A)) and higher withholding rates for non-ATL persons (ITO Tenth Schedule) depend on it, not only on "registered". | Add `atlStatusIncomeTax`, `atlStatusSalesTax` and `atlCheckedOn` on customers and suppliers. Use them to suggest further tax (B open point 3) and WHT rate hints. |
| MN-9 | C C-4 | The duplicate-bill rule is per supplier id only. The same supplier entered twice (two ids, same org no.) bypasses it. | Also check by the supplier's normalised tax id (warn at draft, refuse at submit, as C-4). |
| MN-10 | B C-21 / customer WHT | Some s.153 deductions are **minimum/final tax** and some are adjustable. This matters for the income-tax computation, not only the asset. | Code attribute `regime` ∈ ADJUSTABLE, MINIMUM, FINAL. E groups PK-IT-ADJ by it. |
| MN-11 | E C-9 (PK provinces from branch) | Provincial sales tax on services has origin/destination rules that differ by authority (SRB tends towards the recipient's location; PRA towards services rendered in Punjab; verify each). The branch is a reasonable default, but cross-province supplies need the explicit `taxProvince`. | Keep `taxProvince` on the document, show it in the editor when the customer's region ≠ the branch's province, and add a rule note per authority in the pack. |
| MN-12 | E C-8 | NO return terms: bimonthly default is correct for most, but annual (*årstermin*) and monthly (primary industries) exist. SE: monthly / quarterly / yearly by turnover. | Fine as settings. Add NO "yearly" = calendar year (not fiscal year) and SE "yearly" = fiscal year. |
| MN-13 | H §5 (SAF-T NO 1.30) | Correct overall. Also needed: `StandardTaxCode` for **every** tax code including 0/6/out-of-scope, `TaxBase` on tax lines (present), customer/supplier `OpeningDebit/Credit` from sub-ledgers (B/C must be able to give balances at a date: present), and `GroupingCategory/Code` (H lists). SAF-T expects the payment/receipt **bank line** also to carry the CustomerID/SupplierID where relevant (verify the guidance). B/C put the party only on the control line. | Optionally set party on the bank line of receipts and payments (cheap now; it also helps D). Pin the XSD and validate. |
| MN-14 | H §6 (SIE 4) | Fine. SIE `#VER` needs a series per journal type and a sequence number. Sub-ledger documents (INV/BILL numbers) should appear in `#VER` text so auditors find them. | Put `source_document_ref` in the `#VER` text. |
| MN-15 | H §7 (PK registers) | Annex-C and Annex-A columns require data B/C do not capture yet: HS code, UoM, quantity, sale type, SRO/schedule no., buyer type, FBR invoice number. | Covered by BL-2, BL-3 and MJ-17. Make the H-PK preflight list them per invoice. |
| MN-16 | B §11.1 ageing | Opening-credit and credit-note age is not shown (only buckets for debits). | Optionally age `onAccount` by date. |
| MN-17 | C C-12 | One `WHT_PAYABLE` role for all sections and authorities (FBR income tax, FBR sales tax, PRA/SRB service-tax withholding). Deposits are per authority and section (separate CPRs). | Seed separate accounts per section/authority in the PK pack (2750–2752 exist; add provincial ST withholding), and add provincial withholding codes. |
| MN-18 | E C-11 | Tax settlement and payment journals are untagged "other postings". Fine for v1, but the NO settlement account (*oppgjørskonto*) and SE 2650 balance should match the last return. | Add an E check "settlement account balance = last return's payable" (warning). |

---

### 4. Open decisions for the owner (Jabran)

| # | Question | Recommended answer | Consequence (one line) |
|---|---|---|---|
| OD-1 | Add customer-refund (B) and supplier-refund (C) documents in v1? (BL-1) | **Yes**, both in B/C v1. The customer refund needs two people. | Without it, credit balances can never be paid out, because AR/AP are closed to JVs. |
| OD-2 | Capture the seller snapshot, supply date, buyer VAT/CNIC, UoM, HS code and per-code legal text at approval in B, even though the PDF comes later? (BL-2) | **Yes**, in B now. | Otherwise posted invoices cannot be legally reprinted, and the immutable data is incomplete. |
| OD-3 | PK FBR digital invoicing: add the fiscal-status hook in B now and the provider before the first registered PK tenant? (BL-3) | **Yes** to the hook now. The integration is an ADR-010 slice gating PK go-live. | Without the hook, PK invoices for registered sellers are non-compliant, and retrofitting the approval flow costs more. |
| OD-4 | Advance receipts with VAT (SE, PK) in B v1? (MJ-1) | **Yes, before the first SE or PK tenant.** NO can use plain on-account receipts. | Otherwise output VAT is understated on prepayments in SE/PK. |
| OD-5 | Small-difference / bank-charge adjustment lines on receipts and payments in v1; bad-debt write-off with VAT relief before NO/SE go-live? (MJ-2, MJ-3) | **Yes** to adjustment lines in B/C v1. Write-off in a B follow-up before the first NO/SE tenant. | Otherwise residual cents stay for ever, or credit notes misstate VAT. Dead debts cannot be written off at all. |
| OD-6 | Deductible percentage on INPUT/RC codes in C v1? (MJ-7) | **Yes** (code-level %). Company pro-rata later. | Otherwise input VAT is overstated on representation, cars and mixed use. |
| OD-7 | Store `tax_point_date` on tagged lines and report NO/PK by tax point? (MJ-8) | **Yes**, add the column in B's V13 now (cheap). E uses it per country. | Otherwise late bills fall into the wrong NO term and E cannot show them. |
| OD-8 | Bank entries: allow tax codes (incl. bank WHT), or refuse income accounts? (MJ-9) | **Allow tax codes** on counter lines (OUTPUT/ZERO/EXEMPT/INPUT/WITHHOLDING). | Otherwise cash income bypasses VAT, and PK bank WHT/FED credits are lost. |
| OD-9 | Multi-currency: when, and do we design allocation postings now? (MJ-11) | Keep v1 single-currency, but **add currency/rate columns and an FX-capable allocation design now**. Schedule before the first exporter tenant. | Otherwise a later redesign of B/C/D and the ageing invariant. |
| OD-10 | KID/OCR/Bankgiro/Plusgiro in B/C v1? (MJ-10) | **Yes** for NO and SE. | Otherwise NO/SE suppliers cannot be paid correctly and receipts cannot be matched by reference. |
| OD-11 | ADR-018: accept, with these B/C hooks: service create API, source links, item/UoM/location, GRNI; and for Sales-created invoices, (a) SUBMITTED for an Accounts approver or (b) auto-approved? (MJ-17) | **Accept ADR-018 with the hooks.** Default (a), with a per-company switch to (b) only when the source document had two-person approval. | Otherwise Sales/Purchasing cannot create documents, or they build parallel ledgers. Choosing (b) removes the second person on routine sales invoices. |
| OD-12 | PK: withholding base types, seller-side sales-tax withholding code, and ATL status in v1? (MJ-4, MJ-5, MN-8) | **Yes**, before the first PK tenant. | Otherwise the s.165 data, the FBR return and AR residuals are wrong for most PK B2B customers. |
| OD-13 | Credit notes against opening items? (MJ-12) | **Yes**, with typed tax at the original rate. | Otherwise returns of pre-go-live sales cannot reduce VAT. |
| OD-14 | PK retail-price (Third Schedule) base and the credit-note tax window? (MJ-13, MJ-16) | **Yes** as pack-driven code attributes before the first PK FMCG tenant. | Otherwise wrong sales tax for consumer-goods sellers, and disallowed adjustments are claimed. |
| OD-15 | E: PK s.8B cap, carry-forward and inadmissible input in the computed payable? (MJ-6) | **Yes**. Until then, label `ST-PAYABLE` "before adjustments". | Otherwise "to pay" is wrong for most PK filers. |
| OD-16 | SE EC sales list (periodisk sammanställning) and missing rutor (41, 23, 40) before the first SE tenant? (MJ-15) | **Yes**, in E or H-SE. | An SE company selling to the EU or in construction cannot comply. |

---

### 5. Done well

- **Immutability and corrections:** posted documents are protected by database triggers; corrections only through credit and debit notes; receipts and payments are reversed through the engine. This is the right model for all three countries.
- **Gapless numbering:** taken inside the posting transaction after the journal number; refusals use no number; the concurrency tests (200 parallel approvals, rollback injection) and separate document series per kind are solid.
- **Credit notes:** use the original line's code, version and rate (never today's rate), and give exact remaining tax on a full credit. The R2-4 cap vector is careful work. Debit notes use proportional tax so a typed supplier tax reverses exactly.
- **Duplicate bills and bank details:** duplicate supplier-invoice detection includes SUBMITTED bills, normalises the number and handles a suffix for under-entered bills. Bank-detail fraud controls are strong: the changer becomes a contributor, the payment keeps a snapshot, and details are masked.
- **Reverse charge:** posted on both sides, outside the amount owed to the supplier, with the same base and group id. The E check catches imbalance.
- **Tax tags (E §3.1):** on the journal line with its own base, rate, jurisdiction and group id. That supports two taxes on one supply and per-line rounding. The automated check against ledger movement is genuinely independent, because it reads the balance rows.
- **Box mapping:** held as versioned data with source/evidence/check state (P17), and the box layout is chosen by period end.
- **Ageing:** reconciles to the control account, with "posted outside" shown rather than hidden. A property test proves it at every date. As-of ageing honours allocation and undo dates.
- **Bank reconciliation:** clear two-sided identities, start items for pre-go-live cheques, a live start difference, carry-forward of bank-only lines, and a reversal guard on every path. This is better than most mid-market ERPs.
- **PK provinces:** jurisdiction resolved at posting with dated registrations, so old periods never move.
- **Opening items:** per open invoice, with original dates for ageing and two-person correction.

---

## Appendix — 03 — Architect review: NeoERP Accounts before A2 is built

Reviewer role: senior ERP architect (Spring Boot/Kotlin services, PostgreSQL, Flyway, KMP app).
Date: 2026-10-09. Read-only review; no repository file was changed.

Read: AC-0 (`docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md`), contracts `accounts-a1.md` (built), `accounts-a2.md`,
`accounts-a3.md`, `accounts-b.md`, `accounts-c.md` (targeted), `accounts-d.md` (targeted), `accounts-e.md` (targeted),
`accounts-f-design.md`, `accounts-g-design.md` (targeted), `accounts-h-design.md`, `accounts-roadmap.md`,
`accounts-decisions-for-jabran.md`; developer pages `README.md`, `journals-and-posting.md`, `period-close.md`,
`reports.md`, `year-end.md`, `tax-codes.md`; `docs/handover/next-modules-plan.md` (ADR-018 proposal),
`docs/drafts/franchise-terms-spec.md` (targeted), `docs/backlog.md`. No source code was available in the upload, so
"what A1 built" is taken from the developer pages, which say they were checked against the code on 2026-10-09.

### Verdict

The ledger core is sound. The A1 engine (one write path, gapless numbering under a row lock, sorted balance upserts, one
lock order on every path, posted-is-permanent triggers, idempotency keyed on company + source module + key, and
architecture tests guarding all of it) is the right base for Sales, Purchasing, Inventory, Payroll and Franchise. The A2
period-control design fits the built lock order, and the report model (TB from balance rows, GL by keyset with a
snapshot cursor) is the right choice for 1M–10M lines.

**A2 is not ready to start CP-A2.1 as written.** One process blocker (the contract is not approved and contradicts itself
on exports) and four Majors must be closed first: the engine amendments have no owning slice, the close transaction's
isolation is ambiguous in a way that can let a SUBMITTED journal sit in a CLOSED period, the export design runs
million-line exports synchronously inside a long REPEATABLE READ transaction, and the `account_year_balances` key (and
so the dimension policy) is frozen by V11 without an explicit decision. CP-A2.1 is also too large for one review.

The bigger risks are downstream: ADR-018 contradicts B's party model, and B/C have no machine API for Sales or
Purchasing; C cannot clear GRNI; B/C document tables break P6 (multi-currency "no later data migration"); the machine
contract cannot carry tax tags (POS); there is no domain-event relay; and Payroll (no `company_id`) would be the first
machine client under D-56's "any Finance company" rule.

### Summary table

| ID | Sev | Area | Finding (short) | Before CP-A2.1? |
|---|---|---|---|---|
| B-1 | **Blocker** | Process / A2 contract | A2 not approved; text contradicts §22 on exports | **Yes** |
| M-1 | Major | A2 slices | Engine amendments A1-A2/A3/A4 and ledger-check change owned by no slice | **Yes** |
| M-2 | Major | Period control | Close isolation level unspecified; "same snapshot" wording invites a RR race | **Yes** |
| M-3 | Major | Exports (EF-4) | 1M-line sync XLSX/PDF in a long RR transaction; no caps; four export shapes across slices | **Yes** (decide) |
| M-4 | Major | Checkpoints | CP-A2.1 too large; split into three | **Yes** |
| M-5 | Major | Read model / dimensions | `account_year_balances` freezes balance key and dimension policy; widens hot rows | **Yes** (decide) |
| M-6 | Major | Events | No domain-event relay or consumer contract; outbox grows | No (before first consumer) |
| M-7 | Major | Machine clients | BA-2 compile-time pinning; Payroll lacks `company_id` but may post to any Finance company (D-56) | No (gate Payroll) |
| M-8 | Major | ADR-018 vs B/C | Party ownership contradiction; no internal B/C API for Sales/Purchasing; C refuses GRNI lines | No (before B/C approval) |
| M-9 | Major | Multi-currency | B/C documents and allocations single-amount; breaks P6, forces later data migration | No (before B approval) |
| M-10 | Major | Machine contract | `AccountsPostingV1` refuses tax tags and party; POS SI summaries would bypass E | No (before POS / E) |
| M-11 | Major | E performance | Tax reports aggregate `journal_lines` with non-covering indexes; drill uses offset paging | No (before E) |
| M-12 | Major | App money type | Two app money types (`AccountsAmount` Long vs `AccountsReportAmount` string) | No (before CP-A1.2) |
| M-13 | Major | Checkpoints | CP-A1.2 bundles S4+S5, page-state 3h and a new `NeoSearchSelect`; split | No (before CP-A1.2) |
| m-1 | Minor | V11 | Backlog item (DELETE guard on `journal_entry_events` for posted journals) promised for V11, not in A2 §3.1 | Yes (cheap) |
| m-2 | Minor | V11 indexes | `journal_lines_gl_idx` duplicates A1's `ix_journal_lines_account_date` | Yes (cheap) |
| m-3 | Minor | Isolation | `account_year_balances` FKs unstated; GL cursor must bind company and account; no cross-company cursor test | Yes (cheap) |
| m-4 | Minor | Period control | Heavy or remote close checks under the period `FOR UPDATE`; `PAYROLL_NOT_POSTED` would break invariant 9 | No |
| m-5 | Minor | Concurrency | Period `FOR SHARE` per post creates MultiXacts under load; measure | No |
| m-6 | Minor | A3 / engine | Year-end takes the setup lock itself; engine guard may choose `FOR UPDATE` (upgrade); arch tests need in-process path | No (A3) |
| m-7 | Minor | API consistency | Error codes, balance representation, pagination and export shapes diverge | Partly (A2 parts) |
| m-8 | Minor | TB semantics | `OUTSIDE_FILTER` label wrong for cost-centre filter; default `toPeriod` hides period 13 of a closed year | Yes (wording) |
| m-9 | Minor | B read model | `controlBalance` scans `journal_lines`; use `balanceAt` | No |
| m-10 | Minor | Sub-ledger links | Add nullable `source_line_ref` and `counterparty_company_id` on lines in B's V13 | No |
| m-11 | Minor | H readiness | SAF-T/SIE mapping columns and "map before posting" rule should land with B/C pack versions | No |
| m-12 | Minor | Ledger check | Nightly full re-sum at 10M lines per company; make incremental | No |
| m-13 | Minor | PDF | Company legal name and code on every PDF page; confirm Org facts port carries them | Yes (verify) |
| m-14 | Minor | Migrations | Reserved numbers (accounts V13–V16, user V40–V42, FT-1 org V28/user V33) will collide; big-table DDL needs `CONCURRENTLY` later | No |

---

### Findings

#### B-1 — Blocker: A2 is not in an approved, self-consistent state

- **Where:** `accounts-a2.md` header ("Draft for Jabran's approval"), C-19, §10 (`EXPORT_TOO_LARGE` row), §12, §15
  conflict 3, §22; `accounts-decisions-for-jabran.md` D-8; `accounts-a3.md` §1 ("Not in A3 … XLSX and PDF"), C-27;
  `reports.md` open questions 1 and 4; backlog items 91, 93.
- **Problem:** The roadmap and WORKFLOW rule is "nothing starts building before its contract is approved". A2's §17 points
  were decided on 2026-10-09, but the contract itself is still a draft and no approval is recorded. The text also
  contradicts itself: C-19 still says "CSV … XLSX and PDF are later" and gives CSV-only rules; §10 lists
  `EXPORT_TOO_LARGE` with `details {lineCount, limit}` while EF-4 adds `format`; §12 omits `gl-pdf-limit`; decisions
  sheet D-8 still recommends CSV only. A builder reading C-19 first builds the wrong thing.
- **Fix:** Fold §22 into C-19, §6.5, §10 and §12 (one export rule set); update D-8 and A3 §1/C-27; apply the fixes below
  that change the contract (M-1, M-2, M-3, M-5, m-1…m-3, m-8); then record Jabran's approval in an "Approval" section
  as A1 has.
- **Before CP-A2.1:** Yes.

#### M-1 — Major: A2's engine amendments have no owning slice

- **Where:** `accounts-a2.md` §13 (S1, S2 "Owns (files)"), §19 (A1-A2, A1-A3, A1-A4); `journals-and-posting.md` §f.
- **Problem:** A2 changes A1's built engine: `posted_xid` set in the posting transaction (A1-A2), `account_year_balances`
  upserts (A1-A3), submit takes the period `FOR SHARE` (A1-A4), and `LedgerCheckJob` gains the "year row = Σ periods"
  rule. These touch `application/service/posting/**` (`PostingEngine`, `BalanceJdbcAdapter`, `LedgerCheckJob`) and
  `application/service/journal/JournalDraftService.submit`. Neither S1 nor S2 lists those files; §19 just says "built
  with V11 and slice S1". The slice model ("each slice owns only its files; shared files have one owner") then gives the
  builder no permission to edit them, or two slices edit them unreviewed. The A1 invariants (`PostingWritePathArchitectureTest`,
  the lock-order tests) are exactly what an unplanned engine edit breaks.
- **Fix:** Add an explicit engine slice (call it S0 or S1a) owning those files, with its named tests:
  `AccountYearBalancesTest`, `SubmitPeriodLockTest`, the existing `PostingLockOrderTest`, `BalanceUpsertDeadlockTest`,
  `PostingConcurrencyLoadTest`, and an updated `LedgerCheckJobTest`. Specify that year rows are upserted after all period
  rows, each group in sorted key order. That gives one global lock order and no deadlock; say so in §19.
- **Before CP-A2.1:** Yes.

#### M-2 — Major: Close transaction isolation is unspecified, and the wording points to the unsafe choice

- **Where:** `accounts-a2.md` C-16, §6.8 step 4, §7.6 ("it sees the same snapshot as the lock"); `period-close.md`
  §b step 4 ("same snapshot"), invariant 2.
- **Problem:** Postings and submits (after A1-A4) hold the period row `FOR SHARE`; close waits on `FOR UPDATE` and then
  runs the checks. Under **READ COMMITTED** each check statement sees everything committed while the close waited, so
  `SubmittedInPeriodCheck` sees a submit that committed during the wait. Correct. Under **REPEATABLE READ** (which the
  reports use, and which "same snapshot" suggests), the snapshot is taken at the first statement, the setup-row lock,
  *before* the wait. A submit that commits while close waits on the period lock is then invisible to the BLOCK check:
  close succeeds and a SUBMITTED journal sits in a CLOSED period. Taking the `FOR SHARE` lock does not update the period
  row, so RR raises no serialization error. That breaks AC-0 A2 acceptance 4 and `period-close.md` invariant 5. The same
  applies to the A3 year-end checks and the `previewHash` recompute.
- **Fix:** State that period actions and the year-end run in READ COMMITTED (as the posting transaction does) and that
  checks run as fresh statements after the period (or year) lock is held. Replace "same snapshot" with "after the lock,
  read committed". Add the test `PeriodCloseConcurrencyTest.submitCommittedWhileCloseWaitsBlocksClose`. Never use REPEATABLE
  READ for a transaction that waits on a lock and then validates; the BLOCK check must read after the lock.
- **Before CP-A2.1:** Yes.

#### M-3 — Major: Export design (EF-4…EF-6) is unsafe at the stated limits and differs from every other slice

- **Where:** `accounts-a2.md` C-9, C-20, §6.5, §9, §22 EF-1…EF-6; `accounts-h-design.md` §3.1 (async jobs);
  `accounts-b.md` §11.3 (`/reports/receivables/export`); `accounts-e.md` §6.10 (`/tax-reports/export`).
- **Problem:**
  1. A GL export of up to 1,000,000 lines (XLSX ≤ 90 s target) and a 50,000-line PDF (≤ 30 s) run synchronously
     through the gateway and the app's HTTP client. Typical gateway, load-balancer and mobile client timeouts (30–60 s)
     will cut them. The audit is committed first, so users get audited "exports" with no file and retry, multiplying load.
  2. Each export streams from one `REPEATABLE READ, READ ONLY` transaction (C-9) for the whole run. A long-lived snapshot
     holds back the xmin horizon, so vacuum cannot clean the dead tuples that every posting creates on the hot
     `account_period_balances` (and, after A1-A3, `account_year_balances`) rows. Several concurrent exports across
     companies cause bloat and slower posting on the hottest tables.
  3. No concurrency cap: XLSX via SXSSF writes temporary files (hundreds of MB for 1M rows) on the service's disk; PDF
     with "Page n of m" needs a count pass first. Nothing limits exports per company or per instance.
  4. Four export shapes across slices: sync `POST /reports/{report}/export` (A2/A3), sync
     `/reports/receivables/export` (B), sync `/tax-reports/export` (E), async `/exports` jobs with 202 and download (H).
- **Fix (decide before S2):** Build one export framework in A2 that H reuses. Recommended: synchronous only for
  TB/P&L/BS and GL up to a small threshold (for example 50,000 lines in any format); above that, an async job
  (`POST /reports/exports` → 202 `{jobId}`, status, download, 7-day expiry, H's job table and states). Read GL exports in
  chunks using the A1-A2 `posted_xid` snapshot test (`pg_visible_in_snapshot`) instead of holding one RR transaction
  open. Cap concurrent exports per instance (semaphore) and per company (one running per company and report). Set
  `statement_timeout` / `idle_in_transaction_session_timeout` for the report pool. If the team keeps sync exports for
  A2, at minimum lower the sync GL limits, add the caps, and move XLSX/PDF GL into a separate checkpoint (M-4).
- **Before CP-A2.1:** Yes (the decision; the build can sit in CP-A2.1c).

#### M-4 — Major: CP-A2.1 is too large for one builder checkpoint

- **Where:** `accounts-a2.md` §13 checkpoint table (CP-A2.1 = S1 then S2, "Complex").
- **Problem:** One checkpoint holds: V11 (five changes plus a backfill), three engine amendments (M-1), period
  close/reopen/lock with the check registry and DB trigger, the TB read model (brought-forward, two computed rows,
  compare, closing toggle), the GL keyset with an HMAC cursor and cross-request snapshot, three export formats (PDF
  pagination, XLSX SXSSF, CSV), and nightly perf tests on 5 × 10M lines. That is roughly A1 S2 + S3 in size and mixes
  money-critical locking with formatting work. One review over all of it will be shallow where it matters (locks,
  snapshot, balances).
- **Fix:** Split:
  - **CP-A2.1a (Complex):** V11 + engine amendments (M-1) + S1 period control. Gate: lock-order, concurrency, trigger,
    isolation tests, full A1 posting suite.
  - **CP-A2.1b (Complex):** `ReportReadModel`, TB, GL, cursor and snapshot, perf seed and `ReportPerformanceTest`.
  - **CP-A2.1c (Standard):** export framework and CSV/XLSX/PDF exporters (M-3).
  S3 (app data) can still start against mocks during CP-A2.1a.
- **Before CP-A2.1:** Yes.

#### M-5 — Major: `account_year_balances` freezes the balance key and the dimension policy without a decision

- **Where:** `accounts-a2.md` §3.1, §5, A1-A3, R2-4; `accounts-a1.md` §3.1 (`account_period_balances` key), C-13;
  AC-0 §4.1 (AccountPeriodBalance, Dimension values), §5.5.
- **Problem:**
  1. **Dimensions.** Lines carry branch, stock location, cost centre and (null) project; balances keep only branch,
     cost centre and currency. V11 creates a second aggregate with the same key, so any later wish for stock-location or
     project balances (inventory control per location, project P&L), or a party/counterparty bucket for G, means
     rebuilding two derived tables plus engine and ledger-check changes. That is possible, since balances are derived and
     re-computable, but it should be a recorded decision, not an accident of V11.
  2. **Contention.** Year rows serialize postings on the same account bucket across *all* periods of the year (period
     rows only serialized within a period), and double the hot-row writes and dead tuples per posting. Back-dated
     postings, B invoices and machine postings to AR control now all queue on one row per branch/cost centre.
  3. Brought-forward only needs *earlier* years; the current year is always read from period rows.
- **Fix:**
  - Record in A2 §2: "Balance aggregates are keyed by account, period, branch, cost centre and currency. Stock location,
    project, party and counterparty are line-level: reports by them read `journal_lines` through dedicated indexes."
    Or add `stock_location_id` now, while the tables are small, if Inventory reconciliation by location is wanted.
  - Consider writing year rows only for years **other than** the posting's current open year, or snapshotting a year's
    rows at year-end plus computing unclosed earlier years (normally at most one) from period rows. If the per-post
    upsert stays, measure it in `a1-load.sh` with the year upsert on and record p95 and lock-wait figures in the hand-off.
- **Before CP-A2.1:** Yes (the decision, because V11 fixes the key).

#### M-6 — Major: Domain events have no relay, consumer contract or retention

- **Where:** AC-0 §6.5; `accounts-a1.md` §8 ("No consumer in A1; the rows wait"); `accounts-a2.md` §7.5, §8;
  `journals-and-posting.md` ("No consumer of the domain events exists yet"); `accounts-f-design.md` (F-D2 reads closed
  periods).
- **Problem:** `domain_outbox` rows are written for every posting, reversal and period action, but no dispatcher, topic,
  delivery guarantee or schema version exists. Rows accumulate forever. Payroll ("needs a date in an open period"), the
  reserved `PAYROLL_NOT_POSTED` check, F (charges from CLOSED periods only) and later Inventory and POS all need period and
  posting events. Without an agreed transport each will invent polling against accounts-service.
- **Fix:** Before the first consumer (Payroll registration), write a short ADR: transport (broker, or a pull API such as
  `GET /api/internal/accounts/events?after={cursor}` under an internal scope), at-least-once delivery with `eventId`
  dedup (matches the backlog's audit dedup item), an event `schemaVersion`, and retention (mark dispatched, purge after
  N days). Add the dispatcher next to the audit dispatcher.
- **Before CP-A2.1:** No. Before Payroll or F integration: yes.

#### M-7 — Major: Machine-client path is not ready for its first real producer, and Payroll is unsafe as that producer

- **Where:** `accounts-a1.md` C-2, §7, §20 BA-2, D-56; `journals-and-posting.md` open question 1;
  `next-modules-plan.md` §1 (Payroll: "No company id on payroll data"); backlog item 81.
- **Problem:** `@InternalEndpoint(allowedClients=[POSTING_TEST_CLIENT])` is compile-time, so Payroll cannot be enabled by
  configuration. D-56 lets a registered client post into **any** company with FINANCE and the source module entitled.
  Payroll today keys its data by "the selected company", with no `company_id` on rows (ADR-012 gap). A payroll defect could
  therefore post one tenant's run into another tenant's ledger. Dimension checks catch only some cases: branch is
  validated against the target company, but a single-branch company gets the branch filled in for it.
- **Fix:** (1) Make `allowedClients` config-driven, validated at start-up against `neoerp.accounts.posting.clients`
  (BA-2 allows this). (2) Make "producer has ADR-012 company binding with two-company tests" a registration gate in the
  roadmap Gates table. (3) Require producers to send `defaultBranchId` explicitly (refuse defaulting for machine calls)
  as a cheap cross-tenant tripwire.
- **Before CP-A2.1:** No. Before registering Payroll: yes.

#### M-8 — Major: ADR-018 contradicts B/C, and B/C cannot serve Sales and Purchasing as the single path

- **Where:** `next-modules-plan.md` §3; `accounts-b.md` C-2, §7 (all endpoints `@AccountsEndpoint` tier 2), C-9
  (`item_id` reserved); `accounts-c.md` §1 ("Not in C … GRNI"), C-6; AC-0 P8 (GRNI control none), §6.3.
- **Problem:**
  1. B C-2: customers are minimal "until a Sales module owns customers … Sales takes ownership by id". ADR-018: Accounts
     owns parties for good, and Sales adds commercial fields. These conflict.
  2. ADR-018: Sales creates invoices "through B's API" and Purchasing creates bills "through C's API". B and C expose only
     person endpoints. There is no internal machine variant with an idempotency key, source references (order, delivery,
     goods receipt), approval evidence from Sales or Purchasing, or item and quantity data.
  3. C-6 allows bill lines on EXPENSE or ASSET accounts only. A bill that clears GRNI (a LIABILITY, control NONE) is
     refused, so the standard goods-receipt → bill flow (Inventory DR stock / CR GRNI; bill DR GRNI / CR AP) cannot go
     through C.
- **Fix:** Settle ADR-018 before B and C are approved, then amend: B C-2 (permanent Accounts ownership, extension tables
  for Sales); an internal `POST /api/internal/accounts/sales-invoices` and `/bills` (contract version, idempotency key,
  `sourceModule`, `sourceDocumentType/Id/Ref`, line-level source refs, `DocumentApproval` evidence); C-6 to accept the
  `GRNI` role/account on bill lines when the bill carries a goods-receipt reference; `item_id` populated when Inventory
  exists.
- **Before CP-A2.1:** No. Before B/C approval: yes.

#### M-9 — Major: Sub-ledger documents break P6 ("no later data migration" for multi-currency)

- **Where:** AC-0 P6, C8; `accounts-b.md` C-23 ("Allocation posts nothing … single currency"), §3.1 (`ar_documents`
  single `currency`, `total`, `open_amount`; `ar_allocations.amount`); `accounts-c.md` (mirror); roadmap "Not on the
  roadmap: multi-currency and FX revaluation".
- **Problem:** Journal lines and balances carry transaction and base amounts and a rate, but B/C documents, receipts,
  payments and allocations hold one amount. When `MULTI_CURRENCY` ships (Nordic exporters invoice in EUR early), every
  open-item table needs txn/base pairs and rates, and allocation must **post** realised FX gain/loss through the engine.
  That turns C-22/C-23 ("allocation posts nothing", "ageing = control by construction") into a redesign plus a data
  migration on live documents. FX revaluation of open items has the same dependency.
- **Fix:** In V13/V14, store `exchange_rate`, `*_txn` and `*_base` pairs on documents, lines, receipts, payments and
  allocations now, with CHECKs forcing txn = base and rate = 1 while the feature is off (the journal-line pattern).
  Reserve the allocation-posting hook (realised FX via `FX_REALIZED_*` roles) in B's design text so the later slice adds
  behaviour, not columns.
- **Before CP-A2.1:** No. Before B approval: yes.

#### M-10 — Major: The machine contract cannot carry tax or party, so machine postings bypass the tax report

- **Where:** `accounts-a1.md` C-17, §7.1 (`AccountsPostingV1` refuses tax and party fields), §18.2 (SI machine-allowed
  for POS later); AC-0 §6.3 (POS posts SI summaries with `SALES_TAX_OUTPUT`); `accounts-e.md` §5 (reports read tagged lines;
  untagged tax postings are "Other postings").
- **Problem:** POS day/shift summaries carry output VAT by rate and must reach E's boxes. Inventory (import VAT on goods
  receipts) and Payroll may need party or withholding tags too. With V1 they post untagged, so the tax return is wrong or
  needs manual correction.
- **Fix:** Plan `AccountsPostingV2` (tax tags of E §3.1, `partyType/partyId`, `sourceLineRef`) reusing B's
  `PostingLineValidator` beans for every path. Say in B §15 that the validators are path-agnostic. Keep V1 frozen
  (`CONTRACT_VERSION_UNSUPPORTED` already exists).
- **Before CP-A2.1:** No. Before POS or E: yes.

#### M-11 — Major: Tax reports aggregate raw lines without covering indexes, and the drill uses offset paging

- **Where:** `accounts-e.md` §3.1 indexes (V16), §5, §6.9, §7 (target: 1M tagged lines per quarter ≤ 2 s).
- **Problem:** By-code, box and check reports group `journal_lines` by code, rate, kind and jurisdiction and sum
  `tax_base_amount`, side and `base_amount`. The V16 indexes `(company_id, tax_code_id, entry_date)` do not include
  those columns, so 1M rows means about 1M heap fetches: several seconds cold, not 2 s. `GET /tax-reports/lines` pages
  with `page/size` (OFFSET) over up to 1M rows.
- **Fix:** Make the V16 indexes covering (`INCLUDE (tax_line_kind, tax_rate, tax_jurisdiction, tax_base_amount, side,
  base_amount, branch_id, party_id)`) or add an engine-maintained `tax_period_balances` aggregate (code, version, rate,
  kind, jurisdiction, branch, period). Use the A2 keyset cursor for the drill.
- **Before CP-A2.1:** No. Before E: yes.

#### M-12 — Major: The app has two money types

- **Where:** `accounts-a1.md` C-11 (`AccountsAmount`, minor units in a `Long`); `accounts-a2.md` CX-1
  (`AccountsReportAmount`, any size); `accounts-b.md` N-13 / A1-A10 (`minorUnits`, `fromMinor` for `DocumentMath`).
- **Problem:** Journals use a Long-based type, reports a string-based one, and B builds document math on the Long one.
  Report totals already exceed `Long`, and any future 4-decimal unit price × quantity product can too. Two types mean two
  formatters, two parsers and two kinds of rounding bug.
- **Fix:** Before CP-A1.2 builds the journal editor, choose one string-backed arbitrary-precision decimal for KMP common
  code (scale-aware, HALF_UP, no `Double`), used by journals, reports and `DocumentMath`. Keep the architecture test that
  forbids `Double`/`Float`.
- **Before CP-A2.1:** No. Before CP-A1.2: yes.

#### M-13 — Major: CP-A1.2 bundles too much

- **Where:** `accounts-a1.md` §14 (S4, S5); backlog line 198 (page states "3h … with CP-A1.2") and line 199
  (`NeoSearchSelect` does not exist; "A1 screens use NeoSearchSelect").
- **Problem:** CP-A1.2 = data layer and money type (S4) + list, keyboard-first grid editor, detail and actions (S5) +
  the Accounts page-state migration (3h) + a new shared design-system component. The grid editor alone is Complex. It
  would be a mixed review again.
- **Fix:** CP-A1.2a (Standard): S4, the money-type decision (M-12), `NeoSearchSelect`. CP-A1.2b (Complex): S5 screens and
  the grid with `JournalGridKeyboardTest`. Do 3h separately or explicitly in 1.2a. A2's S4 depends on A1 S5, so this does
  not delay A2's backend.
- **Before CP-A2.1:** No. Before CP-A1.2: yes.

#### Minor findings

**m-1 — V11 omits a promised guard.** Backlog line 54 defers "DELETE guard on `journal_entry_events` for posted
journals (keep the cascade from deleting a draft)" to A2's V11. A2 §3.1 says "No balance or journal table changes". Fix:
add the trigger to V11 and a test (`JournalEventsDeleteGuardTest`). *Before CP-A2.1: yes (cheap).*

**m-2 — Duplicate GL index.** A1 built `ix_journal_lines_account_date (company_id, account_id, entry_date) WHERE
period_id IS NOT NULL`. A2 adds `journal_lines_gl_idx (company_id, account_id, entry_date, posted_at, journal_id,
line_no) INCLUDE (…) WHERE period_id IS NOT NULL`, which serves every query the old one does. Two near-identical indexes
on the largest, insert-heavy table cost write throughput. Fix: V11 drops the A1 index after creating the new one, and the
BS partial-period read and `BalanceQueryPort.balanceAt` use the new index. *Before CP-A2.1: yes.*

**m-3 — Isolation details.** (a) Spell out `account_year_balances` composite FKs `(company_id, account_id)` →
`accounts` and `(company_id, fiscal_year_id)` → `fiscal_years`, plus `UNIQUE NULLS NOT DISTINCT`, as A1 does.
(b) The GL cursor's `filtersHash` must cover `companyId`, `accountId`, range form, filters and `closing`. Otherwise a
valid cursor from company A's GL can be replayed on company B and carry A's running balance into B's page. (c) Add
`ReportIsolationTest.cursorFromOtherCompanyRefused` and isolation of the export audit path. *Before CP-A2.1: yes.*

**m-4 — Close checks under the period lock.** Every check runs while the period row is held `FOR UPDATE`, so posts to
that period queue behind it. That is fine for A2's cheap checks. B's `AR_CONTROL_MATCHES_LEDGER` (whole-company ageing)
and C's mirror are not cheap, and the reserved `PAYROLL_NOT_POSTED` would need a payroll-service call under a lock,
breaking A1 invariant 9 ("no remote call while a lock is held"). Fix: add to A2 §7.6 that checks must be local,
indexed reads with a time budget. Cross-service checks must read a local projection fed by events (M-6) or be prefetched
before the lock and re-validated cheaply.

**m-5 — MultiXact pressure.** Every posting takes the period row `FOR SHARE`; at the 50 posts/s per company target,
concurrent shared lockers create MultiXact IDs on one row. That is usually fine, but it has hurt others at high
concurrency. Fix: include the period-row wait and MultiXact growth in `a1-load.sh` reporting. `FOR KEY SHARE` is a
lighter option that still conflicts with close's `FOR UPDATE`.

**m-6 — Year-end through the built guard.** A3 C-20 takes the setup row `FOR SHARE` itself, then calls the engine.
Built `BooksLiveGuard.lockForPosting` picks its mode from an unlocked read and may choose `FOR UPDATE`. That is not
reachable at year-end in practice, but it is an upgrade path the A1 rules forbid. Fix: A3's in-process core (A1-A5) gets
an entry point that asserts the setup row is already held in a compatible mode. Extend `PostingWritePathArchitectureTest`
and `ManualPostingCallersArchitectureTest` to cover the in-process source (B and D reuse it).

**m-7 — API consistency.** (a) `EXPORT_TOO_LARGE` details differ between §10 and EF-4. (b) `FISCAL_YEAR_CLOSED` (A2) vs
`FISCAL_YEAR_STATE` (A3) for related year-state refusals. Keep both only if the app words them differently; otherwise
use one. (c) A header account in the GL is `ACCOUNT_NOT_POSTING` (A2), but in posting it is `ACCOUNT_INVALID` with
problem `HEADER` (A1). (d) Balances are `{amount, side}` in A2 and signed strings in A3 (C-4). Document both in one
"report amounts" section the app implements once. (e) Pagination: AC-0 §9 says `{items, page, size, totalElements}`
everywhere; the GL uses keyset `{items, size, nextCursor}`; B/C/D/E large lists (book lines, tax lines, ageing) use
offset. Define keyset as the standard for any list that can exceed ~10k rows. (f) Four export endpoint shapes (M-3).
*Before CP-A2.1: (a), (c) and (e) for A2's own endpoints.*

**m-8 — TB wording and defaults.** `OUTSIDE_FILTER` is labelled "Other branches and lines without a branch" but is also
used for the cost-centre filter. Use a label per filter. The default `toPeriod` (12 when today is after the year) hides
period-13 adjustments and the YE of a closed year by default. Consider defaulting to 13 for a CLOSED year, or showing a
banner. *Before CP-A2.1: wording yes.*

**m-9 — B's `controlBalance`.** B N-10 computes control balances "from `journal_lines` (not period balances)". At 1M+
lines the AR control account alone can hold hundreds of thousands of lines, and the close check runs it under a lock
(m-4). Fix: implement through E's `BalanceQueryPort.balanceAt` (earlier years + whole periods + partial-period lines) with
`bySourceModule` from lines only for the "posted outside" part.

**m-10 — Line-level links, cheap now and costly later.** Add nullable `journal_lines.source_line_ref` (document line /
stock move / payroll component id) and `counterparty_company_id` (F/G) in B's V13 rather than F's migration. They are
needed for drill from a GL line to a document line, for Inventory per-move traceability, and for G elimination per
counterparty pair. `party_type/party_id` already exist for SAF-T line-level customer/supplier ids.

**m-11 — H mapping readiness.** H needs `saft_standard_account`, grouping fields and `sie_sru`/`sie_ktyp` on accounts,
`saft_standard_tax_code`/`se_ruta` on tax codes, and a rule that a user-added account is mapped before it posts in an H
country. The roadmap says these go into pack versions during B/C. Make that an explicit B or C deliverable: account
columns, pack data and a create-account validation hook, so H-NO is formatting only. Party records already carry
registration and VAT numbers.

**m-12 — Ledger check scale.** `LedgerCheckJob` re-sums every posted line of every LIVE company nightly, one RR
snapshot per company. At 10M lines per company that is a long snapshot (vacuum horizon again, M-3) and growing work.
Fix: check incrementally (periods with `posted_at` after the last OK check, plus a weekly full run) and keep the
snapshot per period, not per company.

**m-13 — PDF company identity.** EF-1 prints "company legal name and code" on every page. Confirm the A0 Org-facts port
returns legal name and code; otherwise add them to the facts contract (org-service change) or print the display name.
*Before CP-A2.1: verify.*

**m-14 — Migration numbering.** accounts-service V11–V16 are reserved for A2…E, but P17 pack corrections ("a fix is a
new pack version and migration"), H mapping columns (m-11) and backlog items will need accounts migrations at other
times. user-service V40–V42 are reserved for B/C/D months away, while HR & Payroll v2 (next-modules-plan §2) will need
user-service migrations sooner. FT-1 still claims org V28 / user V33, both taken (F conflict 4; backlog line 152 shows org
numbering already drifted). The renumber-everything rule (A1 §18.3) makes every collision a six-contract edit, and test
names embed numbers (`FlywayA2Test.v11…`, SB1 "V40 codes"). Fix: contracts say "next free number at build" and name
files by slug (`V__a2_period_control`); keep §18.3 as an order of dependencies, not numbers. E's V16 "after B, C, D"
is then a dependency, not a number. Once Flyway history is frozen (first non-local deployment), indexes on
`journal_lines` (E's V16) must use `CREATE INDEX CONCURRENTLY` in a non-transactional migration.

---

### Checks of A2/A3 against what A1 actually built

| A2/A3 assumption | Built A1 (developer page) | Result |
|---|---|---|
| Posting order setup → journal → period `FOR SHARE` → accounts → sequence → balances (A2 C-16) | Same, with setup mode chosen once (never upgraded) | Matches |
| Period status re-checked under `FOR SHARE` on every posting path incl. reversal and machine | Yes (`PostingEnginePeriodTest`) | Matches; no engine change needed for close |
| Submit takes period `FOR SHARE` (A1-A4) | Not built: submit takes setup `FOR SHARE` + journal row only (open question 7) | Gap. A2 must build it, but no slice owns the file (M-1) |
| `journal_lines.entry_date`, `period_id`, `posted_at` copied at post (FH-1) | Built | Matches |
| `source_document_ref` and `source.documentRef` (FH-2) | Built | Matches |
| `account_period_balances` key (account, period, branch, cost centre, currency), NUMERIC(24,4) | Built | Matches; A2 adds year table (M-5) |
| `ledger_checks` + `GET /setup.ledgerCheck` | Built | Matches; A2 changes the job (M-1, m-12) |
| GL index `(company, account, entry_date)` | Built as `ix_journal_lines_account_date` | A2's new index duplicates it (m-2) |
| Period 13 unpostable until A3 (C-15) | Built (`PERIOD_NOT_POSTABLE`) | Matches; TB/GL period-13 tests need A3 fixture hook (`reports.md` OQ 6) |
| YE type exists, inactive, engine-only, not reversible | Built (V10; `ReversalEngineTest` inserts YE by SQL) | Matches; A3 V12 flips it |
| In-process caller (A3 first, then B) joins caller transaction, idempotency pre-check under caller lock | Not built (by design) | A3 must add arch-test coverage and a no-upgrade guard entry (m-6) |
| First-posting mark at setup lock (A1 §5.2 10.1) | Manual path marks after checks; machine path at lock (OQ 3) | Harmless to A2; A3/B in-process path should follow the manual pattern |
| Machine clients configurable | Compile-time pinned to test client (BA-2) | Must change before Payroll (M-7) |
| `blockedBy` values | Code returns `CONTRIBUTOR` and `CONTROL_REASON_REQUIRED`; §6.6 omits the latter | App must handle both; A2's period `actions` should follow the BA-8 order rule explicitly |
| Org facts prefetched before any lock; 503 if stale | Built (manual); not described in contract | A2 period actions call no Org service; A3 year-end validation profile skips dimensions, so it is consistent. B/C approvals must prefetch the same way (state it in B §5.3) |

### What A2 should lay down now (so B–E, H, F, G do not force rework)

Already well covered by the drafts: `posted_xid` snapshot paging (reusable by H and exports), `BalanceQueryPort.movement`
(E), the close-check extension point (B–E, Payroll), reserved close-check codes, `source.documentRef`, the `closing`
toggle (A3, SIE `#RES`), and period events (F-D2).

Add in A2 (cheap now):
1. The export/job framework that H and B/E reuse (M-3).
2. The dimension policy statement and year-aggregate design (M-5).
3. `BalanceQueryPort.balanceAt(scope, accountIds, date)` in A2 rather than E, since A3's BS, B's `controlBalance` and E all
   need it (m-9).
4. The keyset-pagination envelope as the standard for large lists (m-7e).
5. The `journal_entry_events` delete guard (m-1).

Leave to the owning slice but decide early: txn/base pairs on documents (M-9, B); `source_line_ref` and
`counterparty_company_id` on lines (m-10, B); SAF-T/SIE mapping columns (m-11, B/C); `AccountsPostingV2` (M-10); the
event relay (M-6); internal B/C APIs and the GRNI rule (M-8).

### Must be fixed before CP-A2.1 starts

B-1, M-1, M-2, M-3 (decision), M-4, M-5 (decision), m-1, m-2, m-3, m-7 (a, c, e for A2 endpoints), m-8 (wording),
m-13 (verify).

---

## Appendix — Accounts Screen Rig: design review (senior product designer)

Reviewer: product design. Date: 2026-10-09. Read-only review of
`docs/design/screen-rig/app.html` (the README change log up to 2026-10-09: A0 final, A1 Journals, A2 draft, A3 draft, list controls).
Checked against `specs/accounts-a0.md`, `accounts-a1.md`, `accounts-a2-a3.md`, `building-blocks.md` ("Page states",
"Choosing from a list"), `screen-standard.md`, `ux-principles.md`, and the user guide pages `user-guide/accounts/*.md`.

### How it was checked

- The rig was rendered in Playwright 1.56 with Chromium 1194. React 18.3.1, react-dom 18.3.1 and @babel/standalone 7.29.0
  were served locally through `page.route`. Each route was opened from `about:blank`.
- **Kystgruppe (kyst, live):** every tab (overview, journals, reports, period-close, coa, roles, calendar, tax) and the
  design index `#accounts:kyst|designs`.
  - Journals: list (Waiting, Drafts, Posted), new journal, `draft-45|edit`, opening-balances editor, detail
    `draft-47`, `draft-44`, `draft-48`, `jv-118`, `jv-121` and `pr-4`.
  - Reports: trial balance (plain and Bergen), general ledger (1920, 1940, and 6300 opened from the trial balance),
    profit and loss (plain, Bergen, by class with compare), balance sheet (today and 31 Dec).
  - Period close: close sheet blocked (Sep) and with warnings (Nov), the lock gate, the More menus, the period panel.
  - Year-end: the full wizard as Owner (close the open months, suspense 450, override, preview, close, done).
- **Lahore (ready) and Sialkot (live):** overview, journals, reports, period-close, coa and tax. Lahore was also opened
  live through the design-index link.
- **Personas:** Finance Manager (the default), Owner, Accountant and Neovatus read-only.
- **Every rig screen state** on the journals list, the editor, the trial balance and period close: loading, offline,
  offline with nothing loaded, server error, service unavailable, no access, module off, not found and not in
  agreement. A0's Chart of accounts states were checked too.
- **Keyboard:** the journal line grid was scripted (Tab, Enter, Alt+↓, ↓, typing in cells, `=`, "12,5", Ctrl+Backspace)
  and the focus was read after every key.
- **Widths:** 1440, 1024, 820 (iPad portrait) and 390×844 (phone). Overflow and clipped money were found by DOM checks
  and confirmed on screenshots.
- **Console:** no React or page errors on any route. The only entries are the blocked Google Fonts request
  (`net::ERR_FAILED`, sandbox only) and Babel's "in-browser transformer" warning.
- Screenshots are kept in `scratchpad/shots/` and are not shared.

### Verdict

**The A1 screens are close.** The two-person rule reads clearly before any click. The editor's money input is right:
"12,5" is refused with "Use a point for decimals: 12.50", `=` balances, a minus moves to the other side, the
difference is worded, and debit and credit are exclusive. The page-state standard is applied well on A1–A3
(spot states by cause, skeletons, the offline strip pausing writes).

**Four things must be settled before CP-A1.2.** The shared list controls are under-specified and the rig breaks
keyboard flow with them. The editor's period line ignores closed and locked months. The A1 spec text was never
amended to the page-state standard. The copy for module-off and no-access contradicts itself between documents.

**For CP-A2.2,** the report filters break "one concept, one pattern". The tablet and phone layouts of the reports
hide or bloat money.

Severity: **Blocker** stops the gate. **Major** must be fixed before the gate named. **Minor** should be fixed and
does not block.

---

### A. Before CP-A1.2 (A1 app screens)

#### A-1 · Blocker · NeoSearchSelect / NeoMultiSelect are not specified well enough to build

- **Screens:** journal editor cells and header defaults (`#accounts:kyst|journals|draft-45|edit`), general ledger
  Account (`#accounts:kyst|reports|gl|1920`), the design index demo (`#accounts:kyst|designs`), A0 Used for → Change,
  Add account → Under.
- **Spec:** building-blocks "Choosing from a list"; A1 §4.2.2–4.2.4; A2 §4.3.
- **Problem:** the builder can't build either component from the spec and the rig. They contradict each other, and
  basic behaviour is missing:
  1. **Two references, two behaviours.** building-blocks says "the journal editor's account picker is the reference".
     That picker (`AjAccountCell`) is not `A2SearchSelect`, and it doesn't follow the NeoSearchSelect rules:
     - You type in the cell itself. There is no search field at the top.
     - It has no groups.
     - It matches by number prefix (A1 §4.2.3); NeoSearchSelect matches anywhere.
     - It keeps 10 recent accounts; `A2SearchSelect` keeps 6.
     - It opens on Alt+↓, and plain ↓ does nothing. The Branch and Cost centre cells beside it open on ↓.
     - It opens downwards even at the bottom of the window and repositions on scroll, where the in-cell rule says
       it opens upwards and closes on scroll.

     The general ledger's Account field uses `A2SearchSelect` with header groups and "Off" second lines. So the app
     would end up with two account pickers, which breaks ux-principles §1.
  2. **Focus after choosing is undefined, and the rig loses it.** After Enter on an option in the Branch cell,
     `document.activeElement` is `BODY` (see A-2). The same happens in the general ledger picker.
  3. **No ARIA pattern.** The spec doesn't say combobox or button + listbox, how `aria-activedescendant` moves the
     highlight, how option ids are formed, or how a disabled option's reason is announced. In the rig the highlighted
     option is never announced. `A2MultiSelect` puts `<label><input type=checkbox>` rows inside `role="listbox"`,
     which is not a valid pattern.
  4. **Size limits are not specified, and the rig hides items silently.** `A2SearchSelect` shows at most 150 items
     before typing and 80 after. In the general ledger Account picker, 150 of Kystgruppe's 184 accounts show, and
     everything above 6940 is missing with no notice. The spec only says "above a few hundred items it searches on
     the server (250 ms)": no threshold, no page size, no "Showing the first N, type to narrow" line, and no loading
     or error row inside the panel.
  5. **Recent items are undefined.** The count and storage key are not given. The rig repeats the recent items in
     the full list below them.
  6. **Matching and ranking are undefined:** exact number first, local names, and accents and Nordic letters (Fjord
     Kafé, ø/å/æ, ä/ö).
  7. **The empty item is inconsistent.** The Branch cell says "Choose", the Cost centre cell "None", the header says
     "No default" and the filters say "All branches". The spec says "None or the default is the first item, in muted
     text".
  8. **Missing for NeoMultiSelect:**
     - arrow-key movement, and whether Enter does anything;
     - Select all when some items are disabled;
     - what the field shows when every item is ticked (normalise to "All …"?);
     - the chip overflow format. The spec says "Pool, Gym +3"; the rig shows two chips and "+N".
  9. **Phone sheet details are missing:** title, Done or close, back gesture, safe area, autofocus.
  10. **No geometry tokens:** panel min and max width (the rig uses 300 and 400), rows visible (A1 says 8), row height,
      the open-upwards threshold (the rig uses 340), and z-order over the sticky footer. Per ux-principles §10 each
      needs a token name.
  11. **No component API.** There is no item model (value, code, label, second line, group, disabled + reason,
      muted/empty) and no statement of what is hoisted where. screen-standard §2 says state survives a resize, but
      the rig closes the panel on resize.
- **Fix:** add a "Component contract" subsection to building-blocks for `NeoSearchSelect`, `NeoSearchSelect(compact)`
  for table cells, and `NeoMultiSelect`. It should cover:
  - **One account picker.** The journal cell is `NeoSearchSelect(compact, typeInField = true)` with account items
    (number, name, type, control tag, "Needs a reason to post here"). The general ledger uses the same items plus
    "Off". One matching rule: exact number, then number prefix, then a name contains the text, accents folded.
    One recent count (10, per company and per kind).
  - **Focus and keys:** focus returns to the field on pick, Esc and outside click. Tab while open closes without
    changing and moves on. ↓ and Alt+↓ both open. Enter on the closed field keeps the grid meaning.
  - **ARIA:** combobox with listbox and `aria-activedescendant`. Disabled items use `aria-disabled` and their reason
    is read as the item's description.
  - **Limits:** above N (e.g. 300) the list searches on the server, with debounce, page size, and loading, error and
    "type to narrow" rows. Before typing, show recent items and then the first page, never a silent cut.
  - **The empty item** per use: "None", "{default} (default)", or "All …" for filters.
  - **Multi-select keys and summary:** keyboard rules, Select all semantics, the all-ticked display, and the chip
    summary format.
  - **Phone sheet** anatomy.
  - **Tokens** for the panel geometry.
  - **The Kotlin signature.**

  Then make the rig match: the A1 Account cell and the general ledger Account become the one component.
- **Gate:** before CP-A1.2. CP-A1.2 builds the grid cells and the header defaults on these components.

#### A-2 · Major · Keyboard flow in the line grid breaks after choosing in a tag cell

- **Screen:** `#accounts:kyst|journals|draft-45|edit`, line 1 Branch.
- **Spec:** A1 §4.2.4; building-blocks "In a table cell".
- **Problem:** what was tested:
  - Focus on the Branch cell, type "O": the panel opens with "O" in the search and "Oslo" listed. This is right.
  - ↓ then Enter picks Oslo. Focus then goes to `BODY`. The next Enter and ↓ do nothing, and the person has to
    click back into the grid.
  - The Account cell works: Enter picks and moves to Description.
  - Plain ↓ on the Account cell does nothing (only Alt+↓ opens it). ↓ on the Branch cell opens it.

  The account-cell picker panel also runs off the bottom of the window. On line 3 at 1440×900 the panel spans
  y=784–1096 behind the sticky footer, and only 3 rows are visible.
- **Fix:**
  - After a pick, keep focus on the cell.
  - Define where Enter goes after a pick in a tag cell. Recommendation: the pick stays on the cell, and the next
    Enter moves down, as on the closed field.
  - Make ↓ open every picker cell.
  - Make the Account panel follow the in-cell placement rule (open upwards when there is no room; never under the
    footer).
  - Add `JournalGridKeyboardTest.focusStaysInGridAfterPickingATag`.
- **Gate:** before CP-A1.2.

#### A-3 · Major · The period line and journal period ignore closed and locked months

- **Screens:**
  - `#accounts:kyst|journals|new` with date 2026-03-15 says "Period: Mar 2026 · Open". Period close and Fiscal
    calendar say Mar 2026 is **Locked**.
  - `#accounts:kyst|journals|ob` (1 Jan 2026) says "Jan 2026 · Open"; Jan is Closed.
  - `#accounts:kyst|journals|pr-4` shows "Apr 2026 · FY2026 · Open"; Apr is Locked.
- **Spec:** A1 §4.2.1 (period line), §4.3.1 (detail period), §9 `PERIOD_LOCKED`; A2 §4.6 and §4.8.
- **Problem:** the A1 rig's `ajPeriod` reads only its own "Sep 2026 closed" rig switch, not the A2 period state.
  Someone can draft and submit into a locked month and see "Open". The A1 spec's period line also has no Locked
  wording, only Open and Closed.
- **Fix:**
  - The period line and the detail read the fiscal calendar's period status.
  - Add "Period: Apr 2026 · Locked — choose a date in an open period" (danger) to A1 §4.2.1 as an amendment.
  - Wire the rig's A1 period helper to the A2 store.
  - Test `periodLineFollowsDateLive` should cover Closed and Locked.
- **Gate:** before CP-A1.2. The A1 app ships into books that already have period control.

#### A-4 · Major · The A1 spec still describes the old page states; the rig and building-blocks moved on

- **Screens:** journals list, editor and detail under the rig's screen options (Loading, Server error, No access, …).
- **Spec:** A1 §4.1 empty-state table (`emptyLine` text) and §5 Loading, Load failed (`NeoLoadError` "Journals didn't
  load…") and No permission; building-blocks "Page states"; README 2026-10-09 "One page-state standard".
- **Problem:** the rig is correct. It uses `NeoSpotState` by cause with the `.state-meta` code line, skeletons, and
  the offline strip pausing Save and Submit. The empty states read "No drafts yet / A new journal starts as a draft.",
  "Nothing waiting for you", and "Nothing posted yet" with New opening balances.

  The approved A1 spec is frozen ("changes only as numbered amendments"), and no amendment records this. A builder
  following §5 would build `NeoLoadError` for a failed first load and the old empty lines. The A2 spec has RIG-2;
  A1 has nothing equivalent.
- **Fix:** add amendment **R-17** to A1:
  - §5 Loading → `NeoSkeleton` (list: tabs and six rows; editor and detail: form blocks and four rows).
  - Load failed → `NeoSpotState` by cause; `NeoOfflineStrip` over loaded content; `NeoLoadError` only for a failed
    refresh.
  - §4.1 empty states → the spot states and copy above, in a table.
  - Update `JournalsAccessTest` and the screenshot fixtures list.
- **Gate:** before CP-A1.2.

#### A-5 · Major · Module-off and no-access copy contradict each other across documents

- **Screens:** any Accounts page with rig screen "Module off", "Accounts not in agreement" or "No access".
- **Spec:** building-blocks failure table; A0 §2 and §5; A1 §5 and §9; A2 §5; user guide `README.md` (lines 114–115)
  and `setup-and-go-live.md` (line 109).
- **Problem:** the rig shows **two different screens for the same cause**:
  - "Module off": "Accounts isn't part of your plan · Ask your company owner to add it · Back".
  - "Accounts not in agreement": "Accounts isn't in Kystgruppe Nordic's agreement … Ingrid Hansen can ask for it".

  "Plan" is not the company's word: agreements are (ux-principles §9, RULES). The user guide uses the agreement
  wording.

  No access says "Ask your company admin for access." The A0, A1 and A2 specs say the message names the Owner. Under
  P7 a Company Admin has no Accounts rights.
- **Fix:**
  - Change the building-blocks module-off row to "{Module} isn't in {company}'s agreement" with "Ask Neovatus" for
    the Owner and "Ask {Owner name}, the Company Owner." for others.
  - Change PERMISSION_DENIED to "Ask {Owner name}, the Company Owner, for access." for Accounts. Allow a feature to
    pass the owner name as a fixed parameter, not server text.
  - Remove one of the two rig options.
- **Gate:** before CP-A1.2. `NeoSpotState`'s fixed copy is built there.

#### A-6 · Major · "Sent back" is still used for Reject

- **Screen:** `#accounts:kyst|journals|draft-47` → More → Reject → reason → Reject. The toast reads
  **"JV-DRAFT-000047 sent back to Jonas Berg."** The detail timeline renders `REJECTED` as **"Sent back by {name}"**.
- **Spec:** A1 §4.3.1 (timeline) and §4.3.2 (toast) still say "Sent back". R-15 only fixed the button and dialog.
- **Fix:**
  - Timeline: "Rejected by {name}" with the reason as a `NeoQuoteBlock`.
  - Toast: "{ref} rejected. It's back with {author} as a draft."
  - Amend A1 §4.3.1 and §4.3.2 and the §8 status list. `accounts-a1.jsx` lines 1166 and 1212.
- **Gate:** before CP-A1.2.

#### A-7 · Major · A disabled cell's reason and the phone line-card tags are not perceivable

- **Screens:** `#accounts:kyst|journals|draft-45|edit`, line 2 Cost centre ("—"), and the same route at 390 px.
- **Spec:** A1 §4.2.2 ("Disabled with '—' … 'This account isn't tagged by branch.'"); RULES (cells labelled for the
  reflow); ux-principles §6 (says why).
- **Problem:**
  - The reason is only a `title` tooltip. Keyboard, touch and screen-reader users never get it; disabled buttons
    are also skipped by Tab.
  - On the phone, each line card shows "Bergen", "Butikkdrift" and "—" as unlabelled fields. Nobody can tell which
    is branch and which is cost centre.
  - The Description field in the card has a placeholder only.
- **Fix:**
  - Give each tag field in a line card a visible caption label (Branch, Stock location, Cost centre, Description).
  - For a disabled cell, render the reason as `aria-describedby` text. On the phone show it as a muted line
    ("Not tagged by cost centre"). On desktop a hover tooltip plus SR text is enough.
- **Gate:** before CP-A1.2.

#### A-8 · Major · "Post to year-end adjustments" is missing from the editor (known gap)

- **Screen:** `#accounts:kyst|journals|new`, date 2026-12-31. The period line reads "Period: Dec 2026 · Open" and
  "31 Dec 2026 is the year's last day; it posts to Dec 2026. Year-end adjustments come later." There is no
  checkbox.
- **Spec:** A2-A3 §4.9 and RIG-6; A1 §4.2.1 (the "come later" line).
- **Problem:** A3's period-close checks and the year-end wizard both depend on journals dated in year-end
  adjustments. The user guide (`year-end.md`, line 84) already describes the checkbox as available.
- **Fix:**
  - Add the checkbox to the rig under the period line, with the hint from §4.9. Ticked, the period line reads
    "Period: Year-end adjustments · FY2026 · Open".
  - The detail shows the "Year-end adjustment" tag. Not shown for opening balances.
  - In CP-A1.2, build the period line as a slot so the checkbox drops in, and do not ship the "come later" sentence
    hard-coded.
- **Gate:** CP-A1.2 must leave the slot. The checkbox itself is needed before the A3 app.

#### A-9 · Minor · Smaller A1 items

| # | Route | Spec | Problem | Fix |
|---|---|---|---|---|
| a | `…|journals|draft-45|edit` | screen-standard §8 ("errors show when useful") | "Why post to a control account?" has a warning (orange) border before anything is typed | Neutral until the person leaves the field or tries to submit; the footer line already says why Submit is off |
| b | `…|journals|draft-45|edit`, screen = Offline | building-blocks "Offline" (navigating stays) | **Cancel** is disabled under the offline strip | Keep Cancel enabled (it leaves without writing) |
| c | editor header | A1 §4.2.1 | The Memo hint moved into a `title` tooltip and merged into one note ("Memo shows in lists and reports. Lines without a branch use the default branch."); `label htmlFor="aj-br"` and `"aj-cc"` point at no element | Hints under their own fields; associate the labels |
| d | editor line 3 and header | building-blocks (the empty item) | Branch shows "Choose", Cost centre "None", header "No default" | One rule (see A-1) |
| e | `…|journals` at 390 | A1 §4.1 ("heading, then date, memo, total, status"); screen-standard §8 card heads | Cards list all 8 fields (≈300 px each). The card head keeps New journal beside a 5-line subtitle | Spec'd card content; stack the head control under the title below 440 |
| f | `…|journals|draft-45|edit` at 390 | screen-standard §8 ("never stacked full-width buttons") | Submit for posting drops to a full-width row under Cancel and Save draft | Icon-less Cancel (ghost), Save draft, Submit in one row; Post my own journal in a More menu at phone width |
| g | `#accounts:sialkot|journals` | A1 §11 ("Posted empty, opening balances prompt") | Opens on an empty Drafts ("No drafts yet"); the opening-balances prompt only shows on Posted | When no OB is posted, the default tab is Posted (or Drafts' empty state also offers **New opening balances**) |
| h | editor | A1 §4.2.4 | The global Ctrl/Cmd+Z handler takes the browser's text undo inside cells whenever a removed line can be restored | Restore the line only when the focused cell has no pending text change, or use a "Line removed · Undo" toast |
| i | A1 spec §4.2.2 row 7 | building-blocks "In a table cell" | The spec says Stock location is a "Select"; building-blocks and the rig make it a searchable cell | Amend A1 §4.2.2 |
| j | account picker panel | A1 §4.2.3 | Names are cut ("Depreciation of buildings and real prop…") in the 400 px panel | Let the name wrap to two lines or widen to the cell plus Description |
| k | `…|journals` at 1440 | screen-standard §4 | Period ("Sep / 2026") and Submitted wrap in a 1440 table that has room | `nowrap` with a minimum width for Period; time on the second line only |
| l | A1 spec §4.1 vs rig | A1 §4.1 | The Owner's own journal status is "Yours" plus "You can post it as Owner" in the rig and "Yours — you can post it as Owner" in the spec | Pick one; the rig's two-line form reads better |

---

### B. Before CP-A2.2 (A2 app: trial balance, general ledger, period close)

#### B-1 · Major · Report Branch and Cost centre filters break "one concept, one pattern"

- **Screens:** `#accounts:kyst|reports|tb`, `…|gl|…`, and `…|pl` (A3). Branch and Cost centre are native `<select>`.
- **Spec:** A2 §4.1 ("Branch select"); building-blocks Q1 (branches of a large company and cost centres → searchable),
  Q5, and "A screen never mixes a plain and a searchable dropdown for the same kind of thing"; ux-principles §1.
- **Problem:** the journal editor chooses branches and cost centres with a searchable dropdown. The reports use a
  plain one. The design index demo shows the branch filter as a multi-select, which matches neither.
- **Fix:** the contract takes one branch, so use `NeoSearchSelect` with "All branches" / "All cost centres" as the
  muted empty item. Amend A2 §4.1, §4.3 and §4.4. Change the design-index demo to "Searchable single filter
  (branch)", or show a multi-select only where a filter really takes several.
- **Gate:** before CP-A2.2.

#### B-2 · Major · At iPad portrait width the trial balance and general ledger scroll sideways and hide money

- **Screens:** `#accounts:kyst|reports|tb` and `#accounts:kyst|reports|gl|1940` at 820 px. The table scroll is
  843/778 and 895/778 px. **Closing credit** and **Balance** are cut at the card edge (e.g. "977,767.56",
  "55,004,437.66 Dr").
- **Spec:** screen-standard §3 (tight grid, then cards) and §4 ("No horizontal scroll"); A2 §4.2 and §4.3.
- **Fix:**
  - Trial balance tight grid: merge Closing debit and Closing credit into one **Closing** column with Dr/Cr, as the
    phone card does; Opening balance `dropWhenTight` into the Account cell's second line.
  - General ledger tight grid: fold Type and Cost centre into Description; Branch drops when tight.
  - State the tight-grid rule per report in A2 §4.2 and §4.3.
- **Gate:** before CP-A2.2.

#### B-3 · Major · Phone cards for the reports are generic table reflow, not the spec'd cards

- **Screens:** `#accounts:kyst|reports|tb` and `…|gl|6300?…` at 390 px.
- **Spec:** A2 §4.2 ("number and name as the heading, then Opening, Debit, Credit, Closing (one line '153,000.00
  Dr')") and §4.3 ("date and number as the heading, description, Debit or Credit, Balance").
- **Problem:**
  - Trial balance cards: the heading is only the number, the name is an "ACCOUNT" row, and six rows each include
    empty "CREDIT" or "CLOSING DEBIT" rows. 37 accounts × ≈240 px.
  - General ledger cards: eight rows, with empty Debit or Credit rows.
  - "REVERSED BY RV-2026-000001" tags break inside the number ("RV-/2026-000001"), against A1 §6 ("never shortened").
  - Before any figure, the person scrolls past ≈900 px of stacked filters.
- **Fix:**
  - Build the spec'd card for both reports, with no empty rows.
  - The reference tag goes on its own line, unbroken.
  - On the phone, collapse the filter bar into a "Filters · Jan–Oct 2026 · All branches" summary that opens a sheet.
  - Add 390 screenshot fixtures that show the card anatomy.
- **Gate:** before CP-A2.2.

#### B-4 · Major · The Period close card head breaks on the phone

- **Screen:** `#accounts:kyst|period-close` at 390 px. The subtitle wraps one word per line in a ≈60 px column, and
  the year select ("FY2026 · Open") sits past the card's right edge.
- **Spec:** screen-standard §8 ("Card heads … put the control under the title below 440"); A2 §4.6.
- **Fix:** stack the year select under the title and subtitle below 440 (NeoSectionCard does this). Correct the rig so
  the screenshot fixtures are right.
- **Gate:** before CP-A2.2.

#### B-5 · Minor · Smaller A2 items

| # | Route | Spec | Problem | Fix |
|---|---|---|---|---|
| a | `…|reports|*` at 390 | building-blocks Q3 (segmented stays one row on a phone) | The report sub-tabs wrap: Balance sheet drops to a second row | A horizontally scrolling segmented row like the page tabs (names stay full, no abbreviations) |
| b | `…|reports|tb` totals | A2 §6 ("zero is '0.00' without a side") | The totals row shows "0.00 Dr" and "0.00 Cr" for the opening totals | "0.00" |
| c | close sheet, wizard step 1, GL facts | A2 §6 and S-1 ("Dr/Cr only in report balance cells") | The spec itself writes "Suspense (2999) has 450.00 Cr", and the rig follows. That is outside balance cells | Widen S-1 to "balances in reports and in check messages" (accountants read it) or write "450.00 credit" in sentences. Decide once |
| d | `…|period-close` close sheet (Sep, Oct) | A2 §4.6 | "1 draft is dated Sep 2026. **They** can't be submitted"; "1 journal … Post or reject **them** first" | Singular forms ("It can't be submitted", "Post or reject it first") |
| e | `#accounts:lahore|reports|tb`, `…|period-close` (READY) | A2 §5 (READY) | "Books aren't live yet…" shows twice on each page; Period close shows "Ready to close" and warnings for books that can't close | Show the note once; in READY the Checks column says "—" or "After go-live" |
| f | A2-A3 spec | §9, RIG-4, §12 | Stale text. §9 `EXPORT_FORMAT_UNSUPPORTED` says "the app sends CSV only" (wrong since RIG-5). RIG-4 says the GL account field is a plain select in the rig (it is searchable now). §12 still lists FY2025, `pl?branch=trondheim` and `sthlm|reports|pl` routes the rig can't open | Clean up as one amendment |
| g | `…|reports|tb` at 1440 | A2 §4.1 (filters wrap under 1024) | Compare and the toggle wrap to a second row at 1440 inside a 1170 px card | Give the selects the 160-wide standard, so one row fits at ≥ 1200 |

---

### C. A3 app (profit and loss, balance sheet, year-end); does not block CP-A2.2

| # | Sev | Route | Spec | Problem | Fix |
|---|---|---|---|---|---|
| C-1 | Major | `…|reports|pl` and `…|bs` at 390 | A3 §4.4 and §4.5 (a statement, not a table) | Every statement line is its own card with the amount on a second line (≈105 px each). The statement no longer reads as a statement, although name and amount fit side by side at 390 | Phone layout is two-column rows (name left, amount right), subtotal rows bold with a hairline, compare amount under the amount |
| C-2 | Minor | `…|period-close|FY2026|year-end`, step 4 | A3 §4.7 step 4 | Done shows only the text "Lock it after the annual accounts are filed: Period close → Year-end FY2026 → Lock the year." There is no secondary **Lock the year** button | Add the button with that line |
| C-3 | Minor | `…|reports|bs` | A3 §4.5 (As of · Compare · Group by) | No Group by on the balance sheet | Add it, or amend the spec |
| C-4 | Minor | `…|reports|pl?…branch=Bergen` (design index "Profit and loss, Bergen") | A3 §4.4 untagged notice; §12 | The notice can't show: there are no untagged posted P&L amounts in the fixture (the interest journal is still waiting) | Post an untagged finance-income line in the fixture so the index route shows the notice |
| C-5 | Minor | `…|reports|pl` | A3 §4.4 (Expand all in More) | **Expand all** is a head text button that squeezes the title on the phone | Move it into More, as specified |
| C-6 | Minor | wizard step 3 | A3 §4.7 | When the Owner closes with a suspense override, step 3 doesn't repeat it ("Closes with 450.00 on suspense: '…'") | Restate the override next to the final warning |

---

### D. Design index, A0 carry-overs and the user guide (not blocking)

| # | Sev | Where | Problem | Fix |
|---|---|---|---|---|
| D-1 | Minor | `#accounts:kyst|designs` vs `specs/accounts-b-c.md` §11 and `accounts-d-e.md` §11 | The B–C and D–E specs say "Designed in the Screen Rig (`screen-rig/accounts-bc.jsx` / `accounts-d-e.jsx`)". Those files don't exist, and the index lists only A0–A3 | Index: add "B–C Receivables and payables" and "D–E Bank, cash and tax report" groups marked "Spec drafted, not in the rig" with their routes greyed. Specs: "To be designed in the Screen Rig" |
| D-2 | Minor | design index links | A link seeds rig state (e.g. "Lahore — live (demo): PK journals"). The route printed under it (`#accounts:lahore|journals`) opens READY when pasted, and the address bar stays on `#accounts:kyst|designs` after following the link | Print the route that reproduces the screen (`#accounts:lahore|live-demo` then Journals), and update the hash on navigation |
| D-3 | Minor | A0 tabs (`…|coa`, `…|roles`, …) | A0 still has the old states ("Load failed": "The chart of accounts didn't load … reference ACC-5031"). There is no offline strip and no cause table, so the Accounts page has two state systems across its tabs | Move A0 to `NeoSpotState`, `NeoSkeleton` and `NeoOfflineStrip` with the A1 build (same page) |
| D-4 | Minor | `#accounts:kyst|roles` → Change | The hint reads "Only active asset accounts with **ar control** that no other item uses." A code shows in a label (A0 §7) | "…with receivables control…" |
| D-5 | Minor | A0 spec | E-1 ("tabs editable before go-live") contradicts N1 and the rig ("Read-only until go-live") | Mark E-1 superseded, or amend N1 |
| D-6 | Minor | `#accounts:lahore|overview` | "Lahore Textiles's books" | "Lahore Textiles' books" (possessive of a name ending in s) |
| D-7 | Minor | `user-guide/accounts/year-end.md` | The example has a profit of 286,000.00 NOK and 214 lines; the rig preview shows 10,685,911.89 NOK and 37 lines. Line 84 describes **Post to year-end adjustments** as available (see A-8) | Align the example to the rig data; mark the checkbox "coming with A3" |
| D-8 | Minor | `user-guide/accounts/README.md` (114–115), `setup-and-go-live.md` (109) | Module-off wording differs from the rig's spot state | Follow the A-5 ruling |
| D-9 | Minor | `user-guide/accounts/journals.md` "Reverse" | The screenshot comment points at `jv-118`, which is already reversed (its More menu shows "Reverse — already reversed by RV-2026-000001", disabled) | Shoot `jv-121`, which shows the Reverse gate |
| D-10 | Minor | `user-guide/accounts/period-close.md` (line 20) | The story locks Sep–Oct in November; the rig shows Mar–Apr locked on 12 May | Align the story with the rig or say the screenshot differs |
| D-11 | — | rig only | The floating "Accounts designs" button covers table content at 820 px and the sidebar "Profile" item | Rig only; ignore for the app |

---

### What works well (keep)

- **The two-person rule is readable.** Waiting to post shows "Waiting for you" (accent), "You wrote it", and the
  Owner's own variant. The detail has a notice above the card, and "Only mine to post" defaults on. A Payroll
  journal's More menu shows a disabled "Reverse — reversed in Payroll". A locked month shows a disabled "Reopen —
  locked periods are final".
- **Money entry follows A1 §6:**
  - "12,5" is refused in place.
  - Debit and credit are exclusive, and `=` only fills the side the difference is on.
  - The footer says "Difference 150.00 (debit higher)" and "Debit and credit must be equal: 150.00 apart."
  - No figure was clipped at 1440 or 1024, and nothing overflows the page at 390.
- **Page states on A1–A3 follow the cause table:**
  - Skeletons are shaped like each screen.
  - The offline strip keeps content readable and disables Save, Submit, Export, Close and Lock.
  - Every spot state has its fixed title, sentence, action and code line.
- **Close and year-end gates say what they stop before the click:**
  - The blocked close names the waiting journals and their authors.
  - Warnings need the tick.
  - The lock needs the "never reopened" box.
  - The year-end preview is reachable even while checks fail.
  - Only the Owner sees the suspense override.
- **Words:** "Reject" is used on the button and in the dialog. "Post", not approve. "Dr"/"Cr" appear only in reports.
  No GL, TB or P&L abbreviations appear in labels.

---

## Appendix — Accounts: PM and consistency review (05)

Date 2026-10-09. Read-only review. No file under `/mnt/user-data/uploads` was changed and no PROJECT-STATE file was opened.
Paths are shortened: `BE/` = `NeoERP-BackEnd/`, `APP/` = `NeoERP-App/`, `AC-0` = `docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md`,
`DEC` = `BE/docs/api/accounts-decisions-for-jabran.md`, `RM` = `BE/docs/api/accounts-roadmap.md`.

**Scope limits.** The upload has no source code, so "built" is judged from what the docs say about themselves (dev pages,
`docs/backlog.md`, `docs/handover/next-modules-plan.md`). Country rules marked **verify** come from general knowledge and
need checking against the official source (P17) before they drive scope.

Severity counts: **Blocker 2 · Major 15 · Minor 23.**

---

### 1. Plan: order, missing slices, gates, checkpoint sizes

#### Verdict on the order

A0→A1→A2→A3 is right: everything depends on the ledger. B∥C→D→E is also right. **What's wrong is everything after E for a
launch in PK, NO and SE at the same time.** The roadmap's own gate (RM §Gates: "H for that country live" before the "first
paying tenant in that country") turns H-NO, H-SE and H-PK into launch blockers in all three countries at once. Several things
a buyer in each market expects are not on the roadmap at all: invoice output and e-invoicing, attachments, bank-file
import, foreign currency and VAT-return files. F and G (franchise) are revenue features for one customer type and should not
come before them.

**Recommended order (launch cut marked ▲):**

1. A2 → A3, with the per-company **cash-flow statement as A3b** (D-55; see below).
2. **A4 "journal productivity"**, built alongside B: recurring journals, accruals with auto-reversal, CSV journal import.
   It is small, it uses the A1 engine as it is, and it covers depreciation and accruals until fixed assets exist.
3. **H-SE (SIE 4) straight after A3.** SIE needs only accounts, balances and vouchers (parties are optional in H §6). It is
   the cheapest statutory export and the one Swedish accountants use every month. Add **SIE import** (opening balances and
   history) for customers moving from Fortnox or Visma.
4. B ∥ C. Include D-21 (PK further tax) inside B, because PK launches at the same time. Add KID (NO) and OCR (SE) payment
   references on invoices.
5. **Document output** (D-22): invoice and credit-note PDF in each country's legal layout, plus **e-invoice send and
   receive** through a bought PEPPOL access point: EHF / PEPPOL BIS 3 for NO, PEPPOL BIS / Svefaktura for SE. B2G is
   mandatory in both countries; inbound EHF is expected by Norwegian SMBs (**verify** the dates of NO's planned B2B
   mandate). For PK, **FBR Digital Invoicing** for sales-tax-registered sellers may be mandatory (phased from 2025,
   **verify**). If it is, PK invoices are not legal without an FBR IRN or QR code, so that work belongs here, through ADR-010
   `FiscalProvider`, not in H.
6. **Attachments plus a file store** (platform), before B and C are approved. Vouchers (bilag / verifikation) must back each
   entry under Norwegian and Swedish bookkeeping law, and scanned bills are a basic AP need. H-D3 / D-40 needs the same store.
7. D, with **D2 statement import** right after it: camt.053 (NO, SE), BAI2 if needed, and a configurable CSV for PK banks.
   Add a payment-file export (pain.001; SE Bankgirot) as D3, after launch if necessary.
8. E, extended with **return files**: NO MVA-melding (digital submission is mandatory), SE momsdeklaration file or API, PK
   Annex-C / Annex-A upload files (**verify** formats). Add a pre-filled settlement journal (D-34).
9. H-NO (SAF-T 1.30) ∥ H-PK (registers). ▲ **Launch gate per country**: H for that country, its pack CHECKED, document
   output live, and a pilot customer.
10. **MC: foreign-currency documents and FX revaluation.** P6 already put the columns in, and the FX journal type exists.
    Lahore Textiles (PK demo) is an exporter that invoices in USD, and Kystgruppe buys in EUR/SEK. Treat this as launch
    scope for exporters, or state clearly that v1 sells to single-currency companies only.
11. Payroll posting (HR & Payroll lead; needs Payroll's company_id / ADR-012 fix first) → Fixed assets (NO saldo groups, SE
    plan/tax depreciation, PK Third Schedule) → inventory valuation link (after ADR-018) → budgets → dimension/project
    reporting → F → G.

#### Findings

| # | Sev | Location | Problem | Fix |
|---|---|---|---|---|
| P-1 | **Blocker** | RM §Gates row 4; RM §Order; AC-0 §3 "v1 = A0–A3 plus B, C, D, E" | Launch is simultaneous, but H is ordered after E and gated to "first paying tenant". In practice all three H contracts gate launch day, and they don't exist yet (H is a design only). AC-0's v1 definition leaves H out entirely. | Make H part of v1. Split it into H-SE (after A3), H-NO and H-PK (after E). Add a per-country "launch gate" row listing H + document output + CHECKED pack + pilot. Replace D-38 "first paying tenant's country" with "all three; SE first because it is cheapest". |
| P-2 | **Blocker** | DEC D-22; B §1 ("Not in B: invoice PDF and sending"); RM §Order and §"Not on the roadmap yet" | D-22 promises a "document output slice before the first paying customer", but that slice is on neither the roadmap nor the "not yet" list. Without it, receivables cannot issue an invoice, so B is not sellable. E-invoicing (EHF/PEPPOL, FBR DI) is missing too. | Add slice "DO: document output and e-invoicing" after B/C and before launch. Buy a PEPPOL access point rather than build one. Settle PK FBR DI under ADR-010. |
| P-3 | Major | RM §"What can overlap" bullet 2 vs RM §Order row B ("Needs first: A1, A2, A3 (V12 in-process core)") and RM last line ("B's SB2 also needs A3's S1") | The overlap text says "B and C can be built in parallel after A2". The same page says B needs A3's V12/S1. A planner following the overlap text would start B and get blocked. | Change it to "B and C in parallel after A3 S1 (V12)". |
| P-4 | Major | RM §Gates | Two gates are missing. **ADR-018** (who owns parties and documents) must be accepted before B/C are approved (`docs/handover/next-modules-plan.md` §3). The **Payroll company_id / ADR-012 fix** must come before any Payroll posting (next-modules-plan §1). | Add both rows. Also add "file store exists" before attachments and H, and "C's GRNI / bill-against-receipt posting agreed in ADR-018" before C approval. Otherwise C's bill posting changes when Purchasing arrives. |
| P-5 | Major | RM §"Not on the roadmap yet"; AC-0 §3 "Later" | Several things NO/SE/PK buyers expect are missing or unslotted: foreign currency + revaluation, attachments, statement import, payment files, KID/OCR references, VAT-return files and filing, SIE import / migration, recurring journals and accruals, fixed assets. | Slot them as shown in the recommended order. Keep budgets, dashboards and branch P&L as "later". |
| P-6 | Major | DEC D-55; RM §Gates (G row: "per-company cash flow live"); AC-0 P15 | The per-company cash-flow statement is tied to G1. G is last, after F, FT-1 and two ADRs. Yet a cash-flow statement is part of statutory annual accounts for many companies: PK Companies Act / IFRS, larger SE companies (K3), larger NO companies (**verify** thresholds). It would arrive after everything else. | Build it as **A3b** (indirect method from a cash-flow tag on account roles in the pack), straight after A3. G then adds the companies' statements together and removes intercompany amounts. |
| P-7 | Major | DEC D-34 ("with filing later (H)") vs DEC D-41 / H §1 ("never sends anything to an authority") | The tax-settlement posting is pushed to H, but H does no filing or settlement, so nothing owns it. | E offers "Create settlement journal" as a pre-filled JV through the normal two-person flow. Put return files (MVA-melding, momsdeklaration, Annex) in E2. |
| P-8 | Major | B contract §14 SB2 (`BE/docs/api/accounts-b.md:1293`); A3 §13 S1 (`accounts-a3.md:676`); A2 §13 S2 (`accounts-a2.md:768`) + §22 | Some checkpoints are too big for one AI session. SB2 holds V13, the shared sub-ledger core, receivables domain **and** six engine amendments (A1-A7…A1-A10, A1-A12). A3 S1 holds V12, the in-process core (A1-A5), period 13 and the year-end. A2 S2 grew after D-8 (PDF + XLSX + fonts + NFRs on top of the TB/GL read model). | Give every "Amendment to A1" its own checkpoint and a focused engine review (SB2a, S1a). Split A2 S2 into S2a (read model, TB/GL, CSV) and S2b (XLSX, PDF). Rule of thumb: one migration **or** one engine change per checkpoint. |
| P-9 | Minor | RM §"What can overlap" bullet 3 ("E can run alongside D") vs E §11 test `v16AndBoxSeedOnDatabaseWithTaggedLines` ("V16, V16.1 apply after B, C, D") | Building them in parallel is fine. Merging them is not: V16 cannot land before V15 without Flyway `outOfOrder`. | State "E may be built alongside D; it merges after D's V15". |
| P-10 | Minor | `BE/docs/api/accounts-a0.md` A-12; user guide `fiscal-calendar.md:37,57` | The next fiscal year is created by hand ("Create FY2027"). If nobody presses the button, postings fail from day 1 of the new year, including Payroll's machine posts. That clashes with P16 ("books created automatically"). | A system job creates the next year at `creatableFrom` and audits it as `system`. Keep the button as well. |
| P-11 | Minor | D C-6 (`accounts-d.md:82`) "Machine producers (Payroll PY…) post BANK only when their pinning lists it" vs `allowed_modules` = BANK, RECEIVABLES, PAYABLES | Once D ships, Payroll's salary payment (PY to BANK_DEFAULT, AC-0 §6.3) has no defined path. PAYROLL is not in `allowed_modules`. | Add PAYROLL to BANK's `allowed_modules` in V15, or route salary payments through C payments. Decide this in the Payroll-posting step. |

---

### 2. Decisions file (DEC)

#### 2.1 The sheet is out of date (decided items still listed as open)

| # | Sev | Location | Problem | Fix |
|---|---|---|---|---|
| DC-1 | Major | DEC §A2 (D-8…D-11) vs `accounts-a2.md` §17 rows 1–4 and §22 | A2 records D-8…D-11 as **decided 2026-10-09**, but DEC still lists them as open. **D-8 went against the recommendation**: DEC recommends "CSV only", while the decision is PDF + XLSX + CSV. | Mark D-8 "Decided: PDF, XLSX, CSV (A2 §22)" and D-9…D-11 "as recommended". |
| DC-2 | Major | DEC §A3 (D-15…D-18) vs `accounts-a3.md` §17 rows 2, 3, 5, 6 | Same problem: all four were decided 2026-10-09 as recommended but are still listed as open. | Mark them decided. |
| DC-3 | Minor | RM §"Open decisions" ("D-1…D-57") | The count and the A1 gate are fine, but nowhere says which decisions are now closed. | Add a "Status" column to DEC (Open / Decided date / Decided otherwise). |

#### 2.2 Decided items that contradict a contract or spec

| # | Sev | Location | Problem | Fix |
|---|---|---|---|---|
| DC-4 | Major | D-12 (decided: staff may not export) vs `accounts-h-design.md:79` §3.2 | H lets read-only Enter-company staff **download** an existing export. That is a full statutory dump with every party's data, which D-12 forbids. | In H §3.2, refuse platform actors for both RUN and DOWNLOAD (`PLATFORM_READ_ONLY`). Add the case to H §8 test 7. |
| DC-5 | Major | D-8 (decided PDF/XLSX/CSV) vs `accounts-a2.md:86` C-19 last sentence "XLSX and PDF are later"; `accounts-a3.md:49` (§1 out of scope "XLSX and PDF"), `:88` C-27 ("CSV through A2's ReportExporter"), `:331` (`"format": "CSV"`) | A3 contradicts itself (line 36 says all three formats) and contradicts A2 §22 and the A2-A3 spec §4.10 / RIG-5. A builder of A3 S2 would ship CSV only. Already noted in `docs/backlog.md:93`, still not fixed. | Remove the stale sentence from C-19. Rewrite A3 §1, C-27 and §6 export to "PDF, XLSX, CSV per A2 §22; `ProfitLossExporter` / `BalanceSheetExporter` for all three". |
| DC-6 | Minor | D-56 (decided) vs `accounts-a1.md` §7 (machine entitlement checks FINANCE only) | The built code also checks the source module's entitlement (dev page `journals-and-posting.md` open question 5). That's correct under D-56, but the contract doesn't say so. | Add an A1 build amendment BA-9 describing the source-module entitlement check. |
| DC-7 | Minor | D-6a (document approval has an optional note) vs B C-18 / AC-BC §11 `:621` "Receipts are **posted** (no approval)" | When tax was withheld, receipts **are** approved by a second person (B C-18, R2-5; AC-BC `:386`). The summary line says otherwise. | AC-BC `:621`: "Receipts are posted by one person, or approved by a second when tax was withheld." |
| DC-8 | Minor | D-47 ("run skips different country/currency") vs franchise-terms-spec FT-Q4 ("setting up terms is refused (409) unless same currency") | Different currencies can never reach the run, because FT-1 blocks them first. Different **countries** with the same currency are not blocked by FT-1. | D-47 text: "currency mismatch is blocked at terms (FT-Q4); a country mismatch is skipped by the run". |

#### 2.3 Open decisions, grouped by slice, with recommendations

D-1…D-7, D-12, D-13, D-14 and D-56 were already decided. D-8…D-11 and D-15…D-18 were decided on 2026-10-09 (DC-1, DC-2).
**Still open: D-19…D-55 and D-57.**

| Slice | # | Recommendation | Consequence (one line) |
|---|---|---|---|
| B/C | D-19 | Accept (two on payments and bank entries; one on receipts unless withheld) | Keeps the P8 fraud control without doubling daily receipt work. |
| B | D-20 | Accept per-FY series (`INV-2026-27-000123`) | Meets NO/SE "unbroken series" rules as long as the year is part of the number (**verify** NO bokføringsforskriften 5-1-1). |
| B | D-21 | Accept, **inside B** (not "before first PK customer"), because PK launches at the same time | Without it, PK sales to unregistered buyers can't be invoiced at launch. |
| B | D-22 | Accept "not in B", **and** put a document-output + e-invoice slice on the roadmap before launch (P-2) | Otherwise nobody can send an invoice. |
| B | D-23 | Accept (warn only) | Sales owns blocking later. |
| B/C | D-24 | Accept (typed WHT, no certificate register) | Correct balances now; the register follows with H-PK2. |
| C | D-25 | Accept | Stops duplicate bills at the point where money is committed. |
| C | D-25a | Accept, but label the suffix "Supplementary bill" and require a link to the first bill | Keeps the bill trail without a reversal path. |
| B/C | D-25b | Accept | Go-live balances stay correctable even with D-4's AR/AP protection. |
| C | D-26 | Accept, but make the threshold per currency (1.00 NOK/SEK; 10.00 PKR?) | One absolute 1.00 means very different amounts across currencies. |
| C | D-27 | Accept | One correction path keeps the bill trail gapless. |
| C | D-28 | Accept | Main anti-fraud signal for payments. |
| D | D-29 | Accept (bank entry document) | One document per bank movement makes reconciliation possible. |
| D | D-30 | Accept | Go-live differences are explained once, not kept for ever. |
| D | D-31 | Accept | Covers about 95% of real matches; more shapes come with import (D2). |
| D | D-57 | Accept `CLEARING` as its own kind | POS and card settlement stay postable; bank lists stay clean. |
| D | D-32 | Accept | People can't quietly reopen their own reconciled history. |
| E | D-33 | Accept | Return boxes never change silently. |
| E | D-34 | **Change**: E offers a pre-filled settlement JV (normal two-person flow); filing files in E2 (P-7) | Otherwise nothing owns settlement. |
| E | D-35 | Accept (NO two-monthly, SE quarterly, PK monthly) | Correct defaults for most SMBs; SE >40 MSEK is monthly (**verify**). |
| E | D-36 | Accept (full deduction only in v1) | Partial-deduction businesses (NO "forholdsmessig fradrag") need a manual JV. |
| E | D-37 | Accept with the notice; also block **Lock period** while a used box is unchecked | Users see figures, but don't make them final on unverified layouts. |
| H | D-38 | **Change**: all three at launch; order SE → NO → PK (P-1) | The roadmap gate then matches simultaneous launch. |
| H | D-39 | Accept `STATUTORY_EXPORT.RUN`, also applied to DOWNLOAD (DC-4) | Party data stays with the company's own people. |
| H | D-40 | **Change**: an object store (shared with attachments), not `bytea`. PostgreSQL `bytea` is capped at 1 GB, so "up to 2 GB" cannot work | Otherwise large SAF-T files fail at the database layer. |
| H | D-41 | Accept (registers only), on condition that FBR Digital Invoicing is settled under ADR-010 / DO (P-2) | Keeps H-PK small. |
| H | D-42 | Accept | Pack-filled mapping; a Finance Manager can correct it with a reason. |
| F | D-43…D-50 | Accept as recommended; align D-47 with FT-Q4 (DC-8) | F is far away; these keep both companies' books in step. |
| G | D-51 | Accept "Group view (combined)" | Avoids statutory consolidation scope. |
| G | D-52…D-54 | Accept | Narrow, audited cross-company reads. |
| G | D-55 | **Change**: per-company cash flow as A3b (P-6) | Statutory statements available at launch; G only combines them. |

---

### 3. Consistency across documents

| # | Sev | Location | Problem | Fix |
|---|---|---|---|---|
| C-1 | Major | Contract headers: `accounts-a2.md:3`, `accounts-a3.md:3-5` ("Draft… Nothing here is approved"; A3: "A1 and A2, both drafts") vs §17 "Decided (Jabran, 2026-10-09)" and `next-modules-plan.md` §1 ("A2 ready to build") | Approval state is ambiguous. The module rule is "Nothing starts build before its contract is approved" (RM §Order). A1 has been approved since 2026-10-07, but A3 still calls it a draft. | Record A2 approval (or state that it is not yet approved) in the header. Fix A3's A1 reference. Don't call A2 "ready to build" until the header says approved. (Also `docs/backlog.md:91`.) |
| C-2 | Major | RM §Order row A1 "Approved (e467db5)" vs `accounts-a1.md:4` "Approved and built (CP-A1.1, 1f85eb6)" and next-modules-plan "A1 backend built" | The roadmap doesn't show A1's backend as built. | RM row A1: "**Backend built** (1f85eb6); app screens in build". |
| C-3 | Major | AC-A1 spec §4.2.2 `APP/docs/design/specs/accounts-a1.md:204-207`, §6 `:423`; user guide `journals.md:92` | Amounts must be typed with a point, and "12,5" is refused. Display is `1,250,000.00` everywhere. Norwegian and Swedish users write `1 250 000,00`, so for 2 of 3 launch markets this is a usability and sales problem. The D paste parser (AC-DE `:561-565`) already detects the comma decimal, so the app has two number rules. | Make input and display follow the user's locale (NO/SE: comma decimal, space grouping). Keep the wire format as a decimal point. If a RULES decision fixes the point format, take it back to Jabran for NO/SE. |
| C-4 | Minor | AC-0 §7.1 vs RM §"Permission codes added…" | AC-0 §7.1 still lacks `JOURNAL.POST_CONTROL`, `RECEIPT.POST/ALLOCATE`, `PAYMENT.ALLOCATE`, `REPORT.RECEIVABLES/PAYABLES`, `BANK_ENTRY.*` and `STATUTORY_EXPORT.RUN`, even though RM says they were "added to AC-0 §7.1". | Either update AC-0 §7.1/§7.2 or reword RM to "added by the drafts (AC-0 not updated)". |
| C-5 | Minor | AC-0 §8.1 ("new V1 baseline + V2 seed") vs RM row A0 "accounts V1–V9 (applied)" | AC-0 describes a two-file baseline; nine migrations were applied. | Add a note to AC-0 §8.1: "as built: V1–V9; history frozen from first non-local deployment". |
| C-6 | Minor | AC-0 §3 headings "E — Tax codes in AR/AP", "G — Group and consolidation", "D … receipts and payments … Statement import later" | Out of date against P3 (E = tax reporting), D-51 (not consolidation) and B/C owning receipts and payments. AC-0 §3 "Later" still lists SAF-T and cash flow (RM already notes this). | Refresh AC-0 §3 headings and the "Later" list, or add a banner: "slice scope: see roadmap". |
| C-7 | Minor | AC-0 §3 A2 acceptance 4 ("Reopen requires Owner or Finance Manager") vs AC-0 §7.1 (`PERIOD.REOPEN`, held by anyone granted it) | Role-based wording conflicts with the effective-code rule (custom roles and Extras allowed). | "Reopen requires `PERIOD.REOPEN` (default Owner, Finance Manager)". |
| C-8 | Minor | AC-0 §6.4 audit actions | `APPROVE`, `EXPORT`, `ALLOCATE`, `UNRECONCILE`, `DOWNLOAD` are used by B/C/D/A2/H but are missing from the action list. | Extend the list or point to the contracts. |
| C-9 | Minor | Decision numbering: AC-0 D1–D12, DEC D-1…D-57, slice D's "D-1…D-5" (DEC note), FT-Q8 "(D-13)" (franchise-terms-spec §12) | FT-Q8's "D-13" means the old discovery decision but reads as DEC D-13 (ledger check). | Prefix the old ones (AC-D13) or cite by name. |
| C-10 | Minor | AC-DE §9 "Refusals in words" | There is no wording for D's `NUMBER_OUTSIDE_GROUP` (`accounts-d.md:403`), `BANK_ENTRY_STATE` / `STATEMENT_STATE` (`:353`) or E's `TAX_TAG_INVALID`. | Add rows, or point explicitly to AC-A1's generic state wording. |
| C-11 | Minor | AC-BC money (`accounts-b-c.md:588`), AC-DE (`accounts-d-e.md:544`): "`AccountsAmount` everywhere, including statement" | A2's fix CX-1 moved report aggregates to `AccountsReportAmount` because `Long` minor units overflow. Ageing totals, customer statements, tax report boxes and the reconciliation report are aggregates too. | Use `AccountsReportAmount` for every server-computed total in B–E. |
| C-12 | Minor | `BE/docs/api/accounts-a1.md` §6.6 / BA-8 (`blockedBy` CONTRIBUTOR vs TWO_PERSON_RULE; CONTROL_REASON_REQUIRED missing from the list) | Already in backlog `:82` and dev page OQ 2; still open in the contract. | Add BA-9 fixing the enum. |
| C-13 | Minor | `accounts-a1.md` §18.2 (SI machine "POS (later)", FX "(later)") vs V10 `machine_allowed` for SI, PY, PR, IV, FX (dev OQ 6, backlog `:86`) | The seed opens more than the contract. | Either a forward migration to align the seed, or a contract amendment. |
| C-14 | Minor | User guide `tax-codes.md:90,107`, `user-guide/decisions.md:34` ("Any date after the latest version's date") vs A0 A-12 and dev `tax-codes.md:42` ("not before today and after the latest") | The user guide doesn't mention the no-backdating rule, so the refusal will surprise users. Pakistani SROs are sometimes retroactive (**verify**). | Add "today or later" to both pages. Log a product question on retroactive rate changes. |
| C-15 | Minor | Glossary "Control account" (`glossary.md:109-111`) | It says a manual journal may post to a control account with a reason. From B/C (D-4), receivables and payables **refuse** manual lines once a document is posted. | Add "(receivables and payables: never, once Sales/Purchases documents exist)" when B ships. |

---

### 4. Docs-as-done (A0 built; A1 backend built)

| # | Sev | Location | Problem | Fix |
|---|---|---|---|---|
| DD-1 | — | `BE/docs/modules/accounts/README.md` | *Withdrawn by the lead:* the three A0 dev pages (`setup-and-go-live.md`, `chart-and-used-for.md`, `fiscal-calendar.md`) exist in the repo; they were only left out of the staged copy. | None. |
| DD-2 | Major | User guide `accounts/README.md:5-6` ("Payroll now… posts into the same books") and the "Uses Accounts" table (Payroll "Posts its journals") | Payroll does not post to Accounts. The machine endpoint is pinned to the test client (BA-2) and Payroll has no company_id (next-modules-plan §1). The user-facing doc claims a feature that doesn't exist. | "Payroll (when its Accounts link ships), Sales, Purchases…". Mark the table row "Planned". |
| DD-3 | Minor | Dev README open questions 3 and 5; `journals-and-posting.md` OQ 11; backlog `:68`, `:72` | Stale: the A1 contract header now says "Approved and built", and the user-guide pages for A0/A1 exist (README, setup, chart, fiscal calendar, tax codes, journals, opening balances, reports, period close, year-end). | Close these items. |
| DD-4 | Minor | User guide README status table | Consistent with the build state (A0 built; journals and opening balances "Coming in A1"; A2/A3 designed). The A1 screens aren't built, so docs and build agree here. No action. | — |
| DD-5 | Minor | Dev `journals-and-posting.md` OQ 7 (A1-A4 not built) vs dev `period-close.md` invariant 5 | Correctly flagged. A SUBMITTED journal can currently sit in a period that is later closed, but no close exists until A2, so this is harmless. Make sure A2 S1 builds A1-A4 (A2 §19). | Keep it in A2 acceptance. |
| DD-6 | Minor | Dev README "Module-level open questions" 1–2; backlog `:66-67` | ADR-005 is stale and the old `docs/api/accounts.md` has no "superseded" banner. Both are still open after A1. | Supersede ADR-005 with a short ADR or banner. Add the banner to `accounts.md`. |

---

### 5. Prior reviews: status of their findings

**A0-DESIGN-REVIEW.codex.md.** M1, M3, M6–M9, N1, N2 and N4–N6 were closed in re-review 1. M2, M4, M5 and R1 were closed in
re-review 2. The two remaining N3 MINORs are now closed as well:

- AC-0 §3 A0 acceptance 7 (`ACCOUNTS-ARCHITECTURE.md:66`) now defines one audit event per transition, with REMAP… then GO_LIVE.
- The rig has a separate `ROLE_MAPPING.UPDATE` (`screen-rig/accounts-a0.jsx:361`).

The re-review's dependencies (RULES §7 decision; NO SAF-T mapping UNCHECKED, backlog `:8`) remain open. **No open findings.**

**A1-RIG-A2-REVIEW.codex.md.** All seven findings have a resolution, and I checked each in the current files:

| Finding | Where it is fixed |
|---|---|
| 1 | Rig clears disallowed tags (as per resolution) |
| 2 | `obEquityZero` (`accounts-a1.jsx:325`, `:1671`) |
| 3 | HAS_JOURNALS wrapper (`:1708`) |
| 4 | `AccountsReportAmount` (spec `:559`, contract CX-1) |
| 5 | READY reads (spec `:542`) |
| 6 | Badge keeps the last count (`:1522-1530`) |
| 7 | Submit takes the period `FOR SHARE` (`accounts-a2.md:490`, A1-A4) |

**No open findings.** C-11 above extends finding 4's lesson to B–E.
