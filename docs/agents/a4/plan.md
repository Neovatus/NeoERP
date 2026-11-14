# A4 Journal productivity — plan (Phase 4, first slice)

## Checkpoint
| Field | Content |
|---|---|
| Identity | A4: recurring journals, accruals with automatic reversal, CSV journal import. Repos: NeoERP-BackEnd, NeoERP-App. Lead: Claude (workspace lead session). |
| Stage | Engineer: S0 (contract refresh) then S1, backend worktree `NeoERP-worktrees/a4-be`, branch `phase/4-a4` from main e210155. |
| Approval | A4 contract and D-108…D-115 approved by Jabran 2026-10-10 (G-3). Phase 4 start with A4 while Phase 3 testing continues: Jabran 2026-11-14. FMT-T waits for the fix-branch merge (Jabran 2026-11-14). **Jabran 2026-11-14 approved D-174…D-182 as recommended, with D-179 changed** (below) and confirmed the rule: a module or feature switched off keeps its history readable, read-only. Lead approves L-1 (one migration per slice) and L-2 (accounts machine client reads org legal-profiles time zone, read-only, cached; re-checked in the S1 Opus review). |
| Progress | Plan refresh done 2026-11-14 (Opus, read-only). Lead verified: G-3 approval, `PostingEngine.kt:917-925` period-13 reversal dating, `DenyImplications.kt:13` "Recurring journals are not covered". |
| Resume point | S0+S1 built (a4-be 4aed6bb, 5874974, 649fc96; targeted tests green). Opus review: 0 Critical/High; M1 (seam may call Org under locks → features warmed before locks), M2 (cancel auto-reversal declares the GL feature and works while Recurring is off; Create draft now / Dismiss refused while off, allowed after back on for SKIPPED_FEATURE_OFF runs), L1 (cache Org failure 1 min; jobs skip a company with unknown zone, UTC only for previews), L2–L5 — all accepted by the lead 2026-11-14, builder fixing. Then S2 ∥ S3a. |

Base: backend main e210155; next free migrations accounts **V67**, user **V46** (taken at merge).

## 1. Drift check (contract `NeoERP-BackEnd/docs/api/accounts-a4.md`)
1. Status says draft; it was approved 2026-10-10 (G-3). Roadmap row 4b says "to write".
2. Template lines use flat cost centre/location; V65 dropped them. Use `branch_id` + `dimension_set_id`, `DraftDimensionCheck`.
3. Import has only branch and cost_centre; ADR-021 D10 wants one column per dimension code (D-178).
4. No feature codes; `FINANCE.RECURRING_JOURNALS` and `FINANCE.JOURNAL_CSV_IMPORT` exist; declare on every handler; jobs use `FinanceFeatures.requireForMachineWrite`.
5. Time zone: ORG-FACTS-2 is built (`/internal/org/facts/legal-profiles` → `defaultTimeZone`); add `AccountsCompanyClock` (L-2).
6. Placeholders in English; since V66 ledger text uses `LedgerText` (D-180).
7. Period-13 auto-reversal would always fail (`PostingEngine.kt:917-925`) → D-174.
8. Engine cannot reverse a MANUAL JV in-process or with a `system` actor (`PostingEngine.kt:705-711, 983-987`; `Posting.kt:208-238`) → D-175.
9. Post reads the reversal month without a lock; a close can cross → D-176.
10. Carried denials: contract says carry, code says not covered → D-177.
11. Reuse the opening-items import engine (upload, STAGING, per-row problems, all-or-nothing, expiry); file store is built.
12. Add UNIQUE (company, journal_import_id, import_journal_key) on journal_entries.
13. `JournalDraftService` create/submit open their own transactions; needs seams that join the caller's (S1).
14. Use existing `source.kind` / `source` filter (add RECURRING, JOURNAL_IMPORT) instead of a new `origin`.
15. One switch per job (`neoerp.accounts.recurring.enabled`, `…auto-reversal.enabled`, `…journal-import.expiry-enabled`).
16. Limits 5 MB / 20,000 rows vs parser cap 10,000 → D-182.
17. File kept 24 h vs OB import keeping confirmed files as ATTACHMENT → D-181.
18. One migration per slice, not one for all (L-1).
19. Prerequisites now met (A3, ORG-FACTS-2, SB2d).
20. Close-check slots 15 and 25 still free.

App spec `NeoERP-App/docs/design/specs/accounts-a4.md`: rig exists; `NeoFilePicker`/upload built (drop AC4-4); wizard must use `NeoWizardStepper`/`NeoWizardCard`/`NeoWizardFooter`; recurring editor reuses `JournalLineGrid` via a grid-state interface; all text in en/nb/sv/da resources (`strings_accounts_recurring.xml`, `strings_accounts_journal_import.xml`); feature-off state (`NeoFeatureAction.RecurringJournals`, `JournalCsvImport`); period-13 text follows D-174; limits and columns follow D-178/D-182; pickers: accounts no quick add, dimensions quick add; Origin filter maps to backend `source`; result card follows D-181.

## 2. Decisions (Jabran) — all approved 2026-11-14
| # | Question | Recommendation | Blocks |
|---|---|---|---|
| D-174 | Period-13 adjustment with "Reverse automatically"? | Not allowed in A4 (422 `AUTO_REVERSE_NOT_ALLOWED`, reason ADJUSTMENT_PERIOD). | S2 |
| D-175 | Approval record for the reversal posted by the job | New evidence `ScheduledReversal(authorisedBy = the poster)` given at post; RV by `system`, source MANUAL, key `AUTO-RV:{journalId}`; rights not re-checked on the due date; anyone with Reverse can cancel before. | S2 |
| D-176 | Lock next month when posting an accrual | Yes: reversal month `FOR SHARE` after the posting period, check OPEN. | S2 |
| D-177 | JOURNAL.CREATE/READ denial carries to recurring journals | Yes, at runtime in `DenyImplications`. | S1 |
| D-178 | CSV dimension columns | branch, cost_centre, project + one per active free dimension code (while Free dimensions is on); unknown/inactive = row problem; no "propose new value" in A4. | S4 |
| D-179 | Feature switched off | **Approved as changed:** history (templates, runs, imports) stays readable, read-only; recurring creates nothing while off and **does not catch up** the off months when switched back on — those runs are recorded `SKIPPED_FEATURE_OFF` and a person may still use Create draft now; auto-reversals of accruals approved while on keep posting (the only exception); new auto-reverse needs the feature on. | S2, S3b |
| D-180 | Language of `{month}`/`{period}` and system memos | Company ledger language (`LedgerText`). | S3a |
| D-181 | Keep uploaded CSV after confirm | Keep as ATTACHMENT, scanned, download with JOURNAL.READ; discarded/expired 24 h. | S4 |
| D-182 | Import limits | 5 MB, 10,000 rows, 500 journals. | S4 |
| L-1 (lead) | Migrations | One per slice, next free at merge (V67, V68, V69). | — |
| L-2 (lead/ERP lead) | Accounts machine client reads legal-profiles time zone | Yes, read-only, cached; fallback country zone, then UTC with metric. | S1 |

## 3. Slices
Backend: S0 contract refresh (docs) → S1 codes (user V46), company clock, draft-service seams [Opus review] → S2 automatic reversal (accounts V67, engine evidence, locks, close check 15) [Opus review] ∥ S3a recurring templates (V68, pure `domain/recurring`) → S3b recurring job and runs (close check 25) [Opus review] ∥ S4 CSV import (V69, generalised `OpeningImportCsv`, dimension resolver) [Opus review] → S5 acceptance + demo seed.
App: P1 data layer (after S0) → P2 auto-reversal screens + accrual dialog (after S2; Opus check of `AccrualDialogStateTest`) → P3 recurring screens (after S3a/S3b) ∥ P4 import wizard (after S4) → P5 click-through with Jabran.
Single-writer files: `PostingEngine.kt`/`Posting.kt` (S2 only; not alongside A5), `JournalDraftService.kt` (S1, then callers), `JournalDtos.kt`/`JournalReadService.kt` (S2 → S3b → S4), App `JournalLineGrid.kt` (P3), `strings_accounts_journal.xml` (P2 first).
Test names per slice: see the planner report summarised here and contract §13.

## 4. Out of scope / room for the rest of Phase 4
Not in A4: template self-posting (D-108), spreading as one object, allocations, XLSX, non-JV imports, location/department/item dimensions, proposing new dimension values, tax/party on lines, multi-currency, notifications.
Leave room: approval limits (keep `contributors` complete; store amount + `authorisedBy` on `scheduled_reversals`); spreading (keep `domain/recurring` generic, per-source link columns); allocations (reuse run table and draft-per-period seam); budgets (share the column-spec parser and dimension resolver); Phase 5 FX revaluation (keep `scheduled_reversals` generic with a `source` column).
