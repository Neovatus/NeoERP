# Lane ready: FIX-APP-SWITCH (no wrong-company request after a company switch) — App — 2026-11-22

> Principles: `docs/PRINCIPLES.md` (D-63).

**Repo / branch:** `NeoERP-App`, `phase/4-b2-fix-app-switch-r2`, pushed at head `6c680b49` (the remote is checked).
It sits on App `phase/4` `9f182c69`, with AL-REST-APP merged.
- The rebase kept all 6 code and docs commits `=`.
- Git auto-merged 4 files that the base move also changed: `AccountsRoute`, `ObImportHost`, `AccountsTaxCodesTab`
  and `journal-screens.md`. Both seats checked the merged hunks.
**Brief:** `docs/agents/fix-app-switch/brief.md`. It is the backlog MEDIUM "before the Phase 4 PRs", slotted by the
old Mac; Jabran said "start small lanes too".
**Tier 1**, on a RISK range. Two gate files are needed until GATE-3a merges, so there are two Opus seats.
**Builder:** Sonnet 5.5 (high).

## Gate files
- `docs/agents/fix-app-switch/review-3-opus.md` (Opus 5.5) and `review-4-opus-sec.md` (Opus 5.5 security, D-43).
- Both: ACCEPT, Reviewed `6d49ee65`, Range `9f182c69..6d49ee65`. **REVIEWS OK.**
- Earlier rounds: `review-1-opus.md` and `review-2-opus-sec.md` (ACCEPT on `6c9e875e`).

## What it does
- **Cause:** after a company switch, the journal detail or Edit view model was rebuilt only when the companies'
  countries differed. In that case it read `journal(<new company>, <old journal id>)`.
- **Fix:** `key(holder)`, `key(vm)` and `key(viewModel)` on every per-company flow read, as ReportsPage already does.
  This covers:
  - `JournalsHost`, `RecurringBranch`, `JournalImportBranch`;
  - `AccountsRoute` (the state, the journals page, toast, crumbs and the SIE route);
  - `SieImportsHost`, the `ObImportHost` SIE route;
  - the Chart, Calendar, Tax codes, Return settings, Used for and Dimensions tabs.
- AL-REST-APP's screens (approval steps, Waiting for you, the self-approval report and the Owner switch) were already
  per-company. Seat 2 confirmed this.

## Tests (that run's own output)
- **Lead, on the rebased head `542ccd55`:** all of `features.accounts.*` plus every `design.*SizeTest`.
  BUILD SUCCESSFUL, exit 0, **2,376 tests, 0 failed**, 17:59. Old results were deleted first.
- **Builder:** `JournalsCompanySwitchUiTest` has 8 tests that fail on `4da0be01` and pass now. The JVM, iOS and
  Android compiles all pass.

## For the old Mac
1. Run `verify.sh` with the two files (no wrapper).
2. Simulator: Part B of `.review-channel/sim-steps-al-rest-and-switch.md`, in the combined T4 session. Use two
   companies in different countries.
3. Give the verdict and merge. **GATE-3a-app comes after this lane** (your order rule).

## Docs
`docs/modules/accounts/journal-screens.md` gets a note on the company key. No user-guide change.

## Follow-up rows
- `AccountsRoute` still reads `exportController.state` without a key. It can't be reached today.
- No test covers a late answer from the old company after a switch; it is safe by reading the code.
- An unsaved Edit is dropped silently on a company switch. This was already so before this lane, and the spec is
  silent on it: a question for Jabran.
- `SieCompanySwitchUiTest` should use companies in different countries.

## Timeline (new Mac; L37 style A)
- Brief at 17:20; lane-ready at 18:45.
- **Build:** 40 m.
- **Review:** about 4 m + 2.7 m; re-stamps after the rebase about 1 m + 2.7 m.
- **Test:** 10 m (lead, after the rebase).
- **Waiting:** in the queue behind AL-REST-APP, plus one rebase onto AL-REST-APP-r.
- **Size:** 22 files (+773 / −43). 1 item (with a sweep of all Accounts hosts). 0 fix rounds.
- **First-pass gate:** not run yet.
- **Cost:** builder about 272 k; seats about 115 k + 112 k, plus about 75 k + 142 k for the re-stamps.
- **Brief lines (D-67):** seat 1 noted that my "7 commits =" also counted the review-file commit.
