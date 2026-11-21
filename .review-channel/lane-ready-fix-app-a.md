# Lane ready: FIX-APP-A (QA batch 2 App lane A: input, keyboard, sizes) — 2026-11-21

**Repo / branch:** `NeoERP-App`, `phase/4-b2-fix-app-a-r` (pushed, head `324d3039`, 29 commits on App `phase/4` `87ae114c`, which holds UX-1). The older `phase/4-b2-fix-app-a` holds only the pre-rebase brief commit (stale; delete with Jabran's OK). Merge target: App `phase/4`, fast-forward through the hook.
**Brief:** `docs/agents/fix-app-a/brief.md` (rows R03, R05, R06, R12, R14, R15, R22). Approved: Jabran 2026-11-20. **Money lane** (amount entry).
**Builder:** Opus 5.5 high. **Reviewers:** Opus 5.5 fresh and Sonnet 5.5 independent (diff + brief only), three rounds each.

## Rows (`docs/agents/fix-app-a/builder-report.md`)
| Row | Result |
|---|---|
| R03 phone landscape | Done: ux §25 trigger, page head scrolls away, one-row footer with the fold order, only the top bar pinned with the keyboard up |
| R12 "500" as "5,00" | Done, no UI change: parse/format tests for PK, NO, SE, DK, FI, IS under ten device regions all pass on the current code; the iOS sighting is on the simulator list |
| R14 keyboard and focus | Done: number keyboard with Done (both separators, read by the company format), focused field above footer and keyboard, recurring date jump fixed, iPad mini grid row keeps its height (the reason stays visible in the cell, D-24) |
| R15 pickers | Done: the search field no longer closes the list on touch; Reports tab on the first tap |
| R22 leave guard | Done in all six editors that share the Cancel rule; side-menu re-pick and page crumbs ask too; a pick during a save waits for it (success goes on, failure keeps the editor and asks) |
| R05, R06 typed text lost | **Not fixed: not reproducible on the JVM.** Guard tests added; four simulator checks S1–S4 below |

## Reviews (`docs/agents/fix-app-a/`)
- Round 1: Opus FIX (3 MEDIUM: leave guard gaps, grid reason only in a tooltip against `accounts-a1.md:216`, disabled primary unreachable by screen reader), Sonnet FIX (2 MEDIUM, the same two plus 5 LOW). No HIGH; no money-parse fault found.
- Round 2: both FIX (new MEDIUM: leaving during a save cancelled it; desktop invisible Tab stop). Round 3: **Opus 1c ACCEPT, Sonnet 2c ACCEPT** (LOWs below).
- Lead decisions D-22 (fold order, R22 scope, grid row) and D-24 (the spec wins: reason visible in the cell; tab fling kept).

## Full run (`scripts/verify.sh --range 87ae114c..HEAD --reviews review-1c-opus.md review-2c-sonnet.md`, 36 min)
**`verify: OK`**, marker `build/verify/324d3039….ok`: **3905 tests, 0 failed, 1 skipped** (unchanged), JVM tests + iOS simulator compile, risk RISK, reviews recorded.

## Simulator checks for Jabran (or the lead on the iOS simulator) — `builder-report.md` "Needs a simulator"
S1 (R06) bill line Description "Shore power, December"; S2 (R05) accrual memo "accounting fees A4T"; S3 (R05) a date typed into Starts after the memo; S4 iPad hardware-keyboard shortcut bar. Each has sign-in, numbered steps and an expected result per step, plus a repeat with Auto-Correction off. Also on the list: the accrual panel with the keyboard up, the keyboard iOS draws, VoiceOver.

## Docs pages
User guide: `docs/user-guide/accounts/journals.md`, `recurring-journals.md`, `accruals-and-prepayments.md`. Developer: `docs/modules/accounts/journal-screens.md`, `typed-input.md`, `recurring-journals.md`. Design: `docs/design/ux-principles.md` §25 "Carried by" lists (component names only).

## Follow-ups (App lane B)
R32 (the editors left, listed in the report); LOWs: a held pick shows no "waiting" sign; held-save tests only on the journal editor; `crumbGoesNowhere` repeats the crumb branches; the guard's released flag after a held pick; R05/R06 after the simulator checks.

## For Jabran
1. Verdict (lead's call: MERGE into App `phase/4`; R05/R06 stay open until the simulator checks).
2. The proposed building-blocks "Short heights" paragraph (quoted in the report, round 3): add it to the approved design pages or not (lead's call: add, it describes what the code now does).
3. OK to delete the stale `phase/4-b2-fix-app-a` remote branch.
