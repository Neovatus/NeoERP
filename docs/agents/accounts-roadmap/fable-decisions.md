# Accounts roadmap: views on the 16 decisions

Reviewer: Fable 5.2 (high), decision views for Jabran
Reviewed: docs/drafts/accounts-roadmap.md at 34913f93d76e7d3859e8a6fcc5d410819deaa7fd (workspace `master`)

Independent read. The two Opus reviews in this folder were not opened. Nothing here approves anything; Jabran decides.

Short names as in the draft: **BE** = `NeoERP-BackEnd`, **App** = `NeoERP-App`, `roadmap:N` = `BE/docs/api/accounts-roadmap.md` line N,
`backlog:N` = `docs/backlog.md` line N, `state` = `PROJECT-STATE.md`, `gates` = `BE/docs/operations/hosting-and-go-live-requirements.md`.

## Summary

The draft is sound and its sources check out: I agree with 5 recommendations as written (4, 7, 11, 12, 13), with 9
after a change (1, 2, 3, 6, 8, 9, 10, 14, 15), and 16 is already answered. The one I disagree with is decision 5 ("A5 to Later"): now that the HR/Payroll rebuild starts in parallel
(decision 16), A5 is no longer a "later" item, and the Accounts half of it (the AccountsPostingV2 core) must be ready
before Payroll v2 reaches its P2 posting step, or Payroll waits on Accounts. The same change of 2026-11-21 pulls three
other things forward that the draft still treats as unhurried: ADR-026 (HR v2's first migration needs it), the ADR-025
notification foundation (the rebuild is meant to sit on it "from day one", backlog:351) and the HR headcount read for
allocations. Two smaller corrections: the ADR-024/025 summaries have already been given (state, PLAT-2 row), so that
decision waits on Jabran, not on the lead; and the Swedish critical path in §5 leaves out payment files and the mail
vendor although the draft recommends planning for a large pilot. One assumption under decisions 7, 9 and 13 should be
confirmed by Jabran in one line: that the first pilot really is Swedish. Three signals point elsewhere (ERP-Q1 says
"Norway first", Payroll packs run PK → NO → SE, and the 2026-11-21 brief leads with Pakistan FBR and Norway).

## Views

| # | View | Note |
|---|---|---|
| 1 | AGREE WITH CHANGE | Keep the owner switch, platform lane, dimension rules, spreading, allocations and budgets in Phase 4 in the order you approved (backlog:389); the draft reads that correctly. Change: give Phase 4 a merge point to `main` after AL S6 and the owner switch (call the rest Phase 4b with its own PR), because `phase/hrp-v2` starts now and needs GATE-0, approval limits and the RLS binder from a stable base. If you keep one PR, it carries two L and four M money features on top of the QA fixes, lands months out, and HR v2 either builds on a moving `phase/4` or on a `main` without the gates. Also update row 4.2: the fix list is now R01–R34 (R34 is HIGH), and R31 moved the A4 leftovers (row 4.10) into QA-B2 App B (state, QA-B2 row). |
| 2 | AGREE WITH CHANGE | Build Phase 5b and ADR-024 Stage 1 before the first *large* customer, as the direction says (`docs/large-customer-roadmap.md:7`, gates P-19). Change: do not make "large" a condition of the first pilot. Take the first suitable pilot, large or mid-size, once the go-live gates are green; a Type II assurance report needs 6–12 months of running controls (gates P-19), so the earlier any production stack runs, the earlier a large customer can be served. If you gate the first pilot on 5b, about two L and five M/S items (5b.1–5b.7, G.12) join the critical path and the control period starts later, not sooner. |
| 3 | AGREE WITH CHANGE | Order is right for ADR-022 (before budgets) and ADR-023 (before 5b), but two corrections. (a) The summaries for ADR-024 and ADR-025 are already given (state PLAT-2 row; handoff line 14), so 4.12 waits only on your answer to the three ADR-025 additions, not on the lead. (b) ADR-026 should be decided first, this week, not "after its D1–D11" at leisure: the HR v2 build needs ADR-026 accepted and step R1 built (state HRP-DES row; ADR-026 R4), and the rebuild starts now. If ADR-026 waits, HR v2's first migration is written without the company column and RLS rules and is redone; if ADR-025 waits, HR v2 is built on the old simulated notifications (backlog:351 says "on the foundation from day one"). |
| 4 | AGREE | The old table (roadmap:84-92) still puts A5 and A4 in "Phase 4" and multi-currency, fixed assets and budgets "after launch", which the 2026-11-04 amendment (roadmap:60-72) already overrode. A short amendment that points to the approved roadmap is enough; keep it a separate change. If skipped, builders and reviewers keep reading two phase numberings. |
| 5 | DISAGREE (first part only) | "A5 to Later" no longer fits decision 16. A5's contract is approved (G-7, `BE/docs/api/accounts-a5.md:3`) and Payroll v2 P2 is "Posting to Accounts" (`docs/agents/payroll/scope.md:51`); with the rebuild running in parallel, P2 can arrive before Accounts Phase 5 reaches row 5.13, and then Payroll waits. Instead: make A5 a named Phase 5 item timed by Payroll P2, build the AccountsPostingV2 core early in Phase 5 (see 6), and refresh the A5 contract now with the HR/Payroll design refresh (it predates dimensions on lines, approval limits and the one person id). I agree with the other two parts: D v1 without payroll-payable clearing, and "payroll posting live" required only for customers who buy Payroll; the second is a change to the launch gate (roadmap:154) and needs your explicit yes. Note Payroll's own country order is PK → NO → SE (scope.md:65-76), so a Swedish pilot is Accounts-only in practice. |
| 6 | AGREE WITH CHANGE | Right phase, wrong order inside it. Split row 5.13: (a) the AccountsPostingV2 core with A5 as its first user, early in Phase 5 and not behind D, because the contract is approved and has no open question; (b) the integration posting API and import with dimensions after D, once ADR-021 Q13/Q14 are decided (recommendations already written: ADR-021 lines 234-235, spec AC-IP I5). Inventory, Purchase and Sales also post through this connection (state INV-SCOPE row), so the core is a shared dependency, not an Accounts extra. If built as one late block, both Payroll P2 and the Inventory scope wait on two unrelated open questions. |
| 7 | AGREE | The date is real: Norway's Bookkeeping Act change passed in June 2026, sellers must issue e-invoices from 2027-01-01, receiving and digital bookkeeping from 2030-01-01 (Sovos, KPMG, links below; matches gates L-1/L-2 and docout C-13/C-27). The duty falls on Norwegian companies, not on NeoERP, and there is no Norwegian customer, so missing the date costs nothing as long as no NO company goes live without send (5.2) and receive (5.3). Chasing it now would push document output (L, not started) ahead of QA batch 2 and AL S5 on money code, against your order. Close the open RM-NO amendment (roadmap:8-23) in the same change as decision 4 so it does not stay "needs approval". |
| 8 | AGREE WITH CHANGE | Phase 5b is the right home (priority 1 in `large-customer-roadmap.md`, and depreciation is a close step). Change: put it last in 5b and do not make it a gate for the first pilot; recurring journals (built in A4) cover monthly depreciation until then. Also note the spec leaves the tax depreciation book out (NO saldo groups, SE 30/20, PK Third Schedule: `accounts-fixed-assets.md:37, 438, 446`); with taxation now a stated product goal, that belongs in the feature catalogue with a phase, not only in "Later". If you gate the pilot on it, one more L money slice sits on the critical path. |
| 9 | AGREE WITH CHANGE | Sweden first, other countries in launch order: yes. Change: do not leave E-SE to the end of Phase 5. It depends only on B and C (done), it is what the accountant signs off under ERP-Q1 six weeks before the pilot, and tax filing is core to the product as you described it on 2026-11-21. Schedule the SE VAT report and return file right after document output; the "Paid" step joins when D is built. If it trails Phase 5, the accountant review starts late and any tax-code finding lands after bank and FX are built on top. |
| 10 | AGREE WITH CHANGE | Decide both, but earlier and with a named owner (you pick; the ERP lead brings a short comparison, as G-5 already says: `accounts-decisions-for-jabran.md:171, 186`). D-123 is the e-mail vendor and document output (5.1) needs it for the Swedish launch, so it is not a Norway-only choice; D-121 needs lead time for contract, DPA (gates H-7) and access-point onboarding, so decide both when 5.1 starts. For D-125, start the PRAL or integrator sandbox paperwork early even though PK is third: it needs a registered taxpayer and the PRAL credit, advance and cancel paths are still unproven (roadmap:36-43). Deciding only "before 5.2 starts" stalls 5.2 for the vendor's onboarding time. |
| 11 | AGREE | One hardening lane (G.5–G.8) with one owner, before the hosted stage, is right; every item has a "before go-live" source (backlog:255, 263, 266, 270, 272, 274, 371). ACC-R19 in Phase 5 is right; treat its date as "before the first production customer or 2027-07-01, whichever is first". Left unowned, these are the items that surface during the pen test and move the pilot. |
| 12 | AGREE | All nine items in `BE/docs/post-release-backlog.md` §5 are built or placed in the draft. Mark it superseded; no cost either way beyond confusion. |
| 13 | AGREE | The launch order is SE → NO → PK (roadmap:92), so the first sign-off should be for the first country. But "Norway first" was written into ERP-Q1 only on 2026-11-20 (gates ERP-Q1), so please confirm in one line that the first pilot is Swedish; if it is in fact Norwegian, decisions 7 and 9 flip (NO send and receive, MVA-melding and SAF-T join the critical path). |
| 14 | AGREE WITH CHANGE | Ship allocations v1 without the headcount key, yes. Two changes: keep key tables (floor area) and "from the ledger" shares in v1, since neither needs HR (`accounts-allocations.md:188`); and since the HR rebuild is now active, add the read "employees per cost centre or department on a date" to the HR v2 change list today (spec decision A5, line 351), so L.9 follows HR H1 instead of sitting in "Later". If the read is left out of HR v2's design, it is a retrofit across two services later. |
| 15 | AGREE WITH CHANGE | No pilot that needs consolidated statements or intercompany matching before Phase 7: agreed. But "no owned-group pilot" is too wide: a customer with several companies can run each company's books, with the multi-company close board (5b.2), and consolidate outside for a while. Say "no pilot that depends on consolidation or intercompany automation". Also give Phase 7's intercompany postings a firm slot: Inventory's inter-company transfers (state INV-SCOPE row) need them, so they cannot stay in an undated "Later". A blanket ban contradicts "multi-company from day one" and shrinks the pilot pool. |
| 16 | Answered (Jabran 2026-11-21) | Consistent with the sources (state HRP-2 row; ADR-026 Q1). Its knock-on effects are in 1, 3, 5, 6 and 14: ADR-026 and step R1 first, ADR-025 RT-1/RT-2 before HR v2 needs action ids and notifications, A5 timed by Payroll P2, PF-1 payment files shared with Payroll P3 (roadmap:142), and gates P-17 closing with the rebuild. Row L.1 and decision 16's own "Recommend" line in the draft are now out of date. |

## Placement check against the decisions of 2026-11-21

**Phase 4: holds, with updates.** QA batch 2 before AL S5 matches (rows 4.2 → 4.7; state "Unconfirmed", first line).
Update row 4.2 to R01–R34 and fold row 4.10 into it (R31). Decide where ADR-026 step R1 and RT-1/RT-2 run, because the
HR v2 build depends on both; the draft has R1 only inside G.1 ("go-live lane") and RT-1/RT-2 behind AL in row 4.12.

**Phase 5: holds, with three changes.**
- Split 5.13 and pull the AccountsPostingV2 core with A5 to the front (decisions 5 and 6). L.1 leaves "Later".
- The Swedish path in §5 lists document output → attachments → D → multi-currency. If the pilot is planned as large
  (decision 2), payment files (5.8) belong on that path too: the finance gap check calls them needed for large AP
  volumes (`docs/agents/finance-gap-check/report.md`, §7 last row), and "payments" is now a stated product goal. Row 5.8
  should also say payment batches come under approval limits (roadmap:121 "batches with D3").
- Row 5.2 calls Swedish e-invoice sending optional for launch. That is true for B2B, but Swedish public-sector buyers
  take only e-invoices (docout line 200 and §5.1 table, still marked "verify"). Ask the pilot whether it invoices the
  public sector before treating 5.2-SE as optional.

**Phase 5b: holds as a build phase**, not as a gate for the first pilot (decisions 2 and 8). ADR-023 needs its
answers before 5b.5 and before the Reports scope draft, whichever comes first.

**Phase 6: holds per country, E-SE earlier** (decision 9). Two date notes from the web check:
- Norway: confirmed, see decision 7.
- Denmark: gates ACC-R2 says "SAF-T 2.1 from 2027-01-01, MitID from 2027-03-01 / 2028-01-01". A Sovos note of
  2026-10-12 reports the main requirements for registered bookkeeping systems moved from 2027-01-01 to 2027-03-01
  (MitID for master-data changes 2028-01-01); the note does not name SAF-T, so re-check ACC-R2 and row 6.2 against
  Erhvervsstyrelsen before DK work. DK is last in launch order, so no schedule impact.
- Pakistan: the latest FBR timetable notice I could find is SRO 1852(I)/2025 (September 2025), the one the roadmap
  cites (roadmap:38). I could not confirm "SRO 1666(I)/2026" or "STGO 01/2026" (gates ACC-R25) from public search;
  keep the existing "re-check before PK build" note.

**Later: mostly holds; three rows move or are missing.**
- L.1 (A5) and L.9 (HR department dimension, headcount key) are no longer "later": both now follow the HR/Payroll
  rebuild's own steps.
- L.2 intercompany postings need a slot before Inventory's inter-company transfers (decision 15).
- Missing rows: direct API filing of returns (`accounts-e.md` D-77: files only in v2, API filing per country after
  launch; DK needs Moms-API under ACC-R2) and Branch Manager P&L (both listed at roadmap:182, "not on the roadmap
  yet"). L.7 live bank feeds has a row but no vendor decision or owner; for a product that is also a payments system it
  is the first "Later" item to pull up once payment files (5.8) are built.

**Module order (Items/Inventory, Purchase, Sales, Reports after HR/Payroll): holds.** L.5 (budgets stage 2) and L.12
(GRNI to Purchasing) correctly wait for those modules. Nothing in Phases 4–6 depends on them.

**Feature catalogue gap.** The draft orders the existing specs; it is not a full Accounts feature catalogue or a
country capability matrix, which you asked for on 2026-11-21 (`docs/agents/design-brief-common.md:14-32`). Year-end
statutory deliverables are the visible hole: the H design and E contract cover VAT returns, SAF-T, SIE and SRU
mapping, but I found no row for the annual accounts and business tax return filings per country. That belongs to
ROADMAP-P's country matrix; approve this roadmap as the order of known work, not as the complete list.

## Web sources

- Norway: [Sovos, Parliament approves mandatory B2B e-invoicing and digital bookkeeping](https://sovos.com/regulatory-updates/vat/norway-parliament-approves-mandatory-b2b-e-invoicing-and-digital-bookkeeping-law/); [KPMG, requirements enacted (June 2026)](https://kpmg.com/us/en/taxnewsflash/news/2026/06/tnf-norway-mandatory-digital-bookkeeping-and-e-invoicing-requirements-enacted.html)
- Denmark: [Sovos, Denmark postpones new requirements for standard digital bookkeeping systems (2026-10-12)](https://sovos.com/regulatory-updates/global-vat/denmark-postpones-introduction-of-new-requirements-for-standard-digital-bookkeeping-systems/)
- Pakistan: [Sovos, e-invoicing implementation timeline revised again (SRO 1852(I)/2025)](https://sovos.com/regulatory-updates/vat/pakistan-e-invoicing-implementation-timeline-revised-again/)
