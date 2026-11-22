# Lane ready: RISK-NARROW-1 (RISK path lists: narrow the App accounts folders, widen the BackEnd) — 2026-11-22

Two branches, one in each repo. Both are pushed and built and reviewed on the **builder Mac**. Both change only gate
files (`docs/risk-paths.txt`, `scripts/risk-check.sh`, `scripts/verify.sh`, the self-tests, `verify.md`), so they are
**RISK** (gate paths).

| Repo | Branch | Head | Base | Review files (gate reads) |
|---|---|---|---|---|
| App | `phase/4-b2-risk-narrow-app-r2` | `3fc42d32` | App `phase/4` `267270de` (AC418-APP merged) | `docs/agents/risk-narrow-1/review-5-opus.md`, `review-6-opus-sec.md` (two Opus seats, D-43): ACCEPT, Reviewed `955e1716`, Range `267270de..955e1716` (re-stamps after the base move; all 13 code commits `=`; AC418's `TwoPersonReason.kt` correctly NORMAL; self-tests pass on the new head) |
| BE | `phase/4-b2-risk-narrow-be-r3` | `df80e554` | BE `phase/4` `9aca6c76` (OUTBOX-CLAIM-BE merged) | `docs/agents/risk-narrow-1/review-9-opus.md`, `review-10-opus-sec.md` (two Opus seats, D-43): ACCEPT, Reviewed `39010216`, Range `9aca6c76..39010216` (re-stamps after the base move; all 24 code commits `=`; self-tests 110/110 on the new head) |

`risk-check.sh --reviews` on this Mac: **REVIEWS OK** for both. The commits after each Reviewed SHA hold only review
files.
**Brief:** `docs/agents/risk-narrow-1/brief.md` in each repo, approved by Jabran 2026-11-22. **Builders:** Opus 5.5
high, one per repo. **Reviews:** Opus (fresh) and Fable. Both said FIX in round 1; the App needed 1 fix round plus a
small follow-up, and the BE needed 2 fix rounds. Decisions: D-36, D-38, D-41 (rule 2).

## What it does
- **App, narrowed.** The accounts presentation folders are no longer whole-folder RISK. Code that decides money,
  security or company data stays listed: view models, state, rules, repositories, the hosts and screens that build view
  models or hold a rule (payments, receipts, refunds, allocate, write-off, the journal line grid), the chart and
  dimensions writers, `Suppliers`/`Customers`, and B2b's `OpeningItemsEnteredMarks`. A change to another accounts
  screen, dialog, card or wording file now reads NORMAL.
  - Counts: 180 globs plus 23 `new:` lines. 83 kept, 15 narrowed, 3 dropped. 77 files leave the list and 15 join it.
- **App guard (D-36 item 3).** A file **added or renamed into** any of the 23 former folder globs is RISK until it is
  listed (`new:` lines in `docs/risk-paths.txt`). A changed file that is not listed stays NORMAL.
- **BE, widened (D-36 item 4, D-38, D-41).** 118 → 144 globs, none removed. Newly covered:
  - the HTTP delivery and the application ports of every service;
  - accounts domain, iam/org clients, persistence, setup, books, SIE, opening-balance import, journal import, opening
    sides, debit notes, role mapping, chart, suppliers and customers;
  - user and org persistence; user `shared/kernel/{security,codec}`; `shared/file-store` and `shared/domain-events`;
  - the security tests and the FE-3 map.
  - Main Kotlin files on no glob drop from 1,187 to about 450.
- **Both repos:** `verify.sh` runs the dead-glob check (`--unmatched-globs`) on every full and light run, so a glob that
  matches nothing fails the gate.

## Replay (does the new list change past lanes?)
- **App, 19 ranges including B2b:** only the QA1 size fix moves RISK → NORMAL. No lane moves NORMAL → RISK. B2b stays
  RISK with 30 hits.
- **BE, 12 Phase 4 ranges including R29b-2:** no lane moves NORMAL → RISK; the three NORMAL lanes were docs or dev-script
  only. Lanes that were already RISK gain paths: ISO-R1 +2, FIX-BE +11, R29b-1 +59, R29b-2 +72.

## Tests on this Mac (scripts only, no Gradle)
- `scripts/risk-check-test.sh` in full: App 101/101, BE 110/110. Each new case fails on the head before it, proven with
  a `git archive` of that head or a mutant guard; the builder reports give the details.
- Opus re-ran the self-tests and the replays in each fix check: App 101/101, BE 110/110, and the replay rows match.
- Dead-glob check: every glob matches a tracked file (both repos, on the new bases).

## For the old Mac (test Mac)
1. Check the review files.
2. Run the two gates, without a `lockf` wrapper:
   - App: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/risk-narrow-1/review-5-opus.md docs/agents/risk-narrow-1/review-6-opus-sec.md`
   - BE: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/risk-narrow-1/review-9-opus.md docs/agents/risk-narrow-1/review-10-opus-sec.md`
3. No jar-mode start or simulator is needed: the lane changes gate files only.
4. Verdict; merge under the standing merge. Any later lane rebases onto the new list. Every lane-ready from then on
   takes its RISK or NORMAL from the merged list.
5. **WORKFLOW text at merge** (workspace `WORKFLOW.md`, "Review"). Replace the Money and security lanes sentence's
   "(the paths in `risk-paths.txt`)" with:
   > (the paths in each repo's `docs/risk-paths.txt`. Since RISK-NARROW-1 the App list names only accounts code that
   > decides money, security or company data: view models, state, rules, repositories, and the hosts and screens that
   > build view models or hold a rule. A change to another accounts screen, dialog, card or wording file reads NORMAL
   > and gets one review. A file added or renamed into a narrowed accounts folder reads RISK until it is listed. The
   > BackEnd list covers every service's HTTP delivery and ports, and accounts, user and org persistence and domain
   > code; `verify.sh` fails on a glob that matches nothing.)
   The lead applies it once you ring the merge doorbell, unless you apply it in the merge commit.

## Docs pages
- **Developer:** `docs/operations/verify.md` "Risk paths" in both repos: what each list covers, what is not on it yet,
  the `new:` guard, the dead-glob check.
- **User guide:** none (gate files only).

## Follow-up rows (not blocking; a later widening lane or GATE-3)
- **App:**
  - Fable N1: `usedfor/UsedForTabHolder.kt:107` (`changeRoleMapping`), `calendar/CalendarTabHolder.kt:130`
    (`createNextFiscalYear`) and `AccountsRoute.kt` (it builds the period-close and year-end view models) are unlisted.
  - The amounts parsed in wording files, and commonTest rule tests, are NORMAL.
  - The App dead-glob check uses the head's own script (GATE-3, JABRAN-TODO N9).
- **BE:**
  - `ReferenceAgreementService.kt`, `DimensionMaintenanceService.kt`, `AccountsAuditWriter.kt` and
    `PayablesSupport` are unlisted.
  - org-service `application/service/company|branch|warehouse|facts` and the org domain models are unlisted.
  - hr, payroll and audit main code waits for their rebuild.
  - All of these are named in `verify.md`.

## Timeline (new Mac; Europe/Oslo; approximate agent times from task notifications; L37 style A, one lane per repo)
- **Assigned:** the old-Mac plan "Accounts first" (2026-11-22). The briefs were written about 07:45, and the lane-ready
  is about 13:15: wall time about 5 h 30 m.
- **Build:** round 0, about 60 m per repo; the two builders ran in parallel.
- **Rework:** fix round 1 (App about 64 m, BE about 26 m), the D-38 follow-up (App about 26 m, BE about 14 m) and BE fix
  round 2 (about 6 m). About 136 m of builder time, partly in parallel.
- **Review:**
  - Round 1: Opus about 34 m (both repos in one agent, including its replays); Fable about 11 m.
  - Fix checks: Opus about 25 m and Fable about 22 m (both repos, including the D-40 check).
  - Re-checks and re-stamps: about 15 m.
- **Test:** inside the build, the rework and the Opus runs (script self-tests and replays only).
- **Waiting:** the reviews waited for both repos' fixes so that one check covered both. There were three rebases after
  merges (B2b, R29b-2, AC418-BE), and the lead was running four other lanes.
- **Size:** App 12 files changed (+1,721 / −54); BE 15 files changed (+1,491 / −4). Items: the brief's method items 1–5
  per repo, plus D-36 1–5, D-38 1–4 and D-41's BE list. Fix rounds: App 1 plus a follow-up, BE 2. Fix-caused
  findings: 0. Rows passed on: App 3, BE 3.
- **Tokens:** Opus reviewer about 330 k (both repos), Fable about 440 k (both repos, plus D-40). Builders: App about
  340 k, BE about 235 k.
