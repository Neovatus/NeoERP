# Brief: post-with-rules (flow 2 of 3) · branch `accounts/dimension-rules` · BackEnd + App · review: Opus 5.5 high

Read first: `docs/PRINCIPLES.md`, this brief, then flow 1 on the same branch: your own plan, hand-back and `review-set-rules.md` in `docs/agents/dimension-rules/`. **This brief is a frame, not a fence** (template "How this brief works", trial 2026-11-25).
The lead copies it as `docs/agents/dimension-rules/brief-post-with-rules.md` into both repos. The same builders as flow 1 build it, BackEnd first.

## Who you are
- **BackEnd:** a senior Kotlin/Spring engineer for accounting systems (double entry, posting, audit, multi-company).
- **App:** a senior Compose Multiplatform engineer for business apps.

## Goal
Every line that reaches the books obeys the account's dimension rules. A line missing a Required dimension is refused at Submit and at Post on **every path**, with the same code and words. Every editor shows which columns a line's account takes, and why a cell is "—". The user can fix the line before submitting. Producing modules can read the rules ahead of time and stop at calculate.

## Decided rules (sources; don't reopen)
1. **ADR-021 D6:**
   - Missing REQUIRED → 422 `DIMENSION_REQUIRED`.
   - A value on NOT_ALLOWED → 422 `DIMENSION_NOT_ALLOWED` (existing).
   - Branch keeps C-13.
   - Posted lines are never re-validated: reversals and the year-end journal keep their exceptions (A1 R-10, A3 A1-A1, D5.2).
2. **ADR-021 D4:**
   - Machine lines are never defaulted; producing modules send explicit values.
   - Manual lines: line → header default → (branch default in flow 3) → null, resolved once when the line is created.
3. **OD-2 / DM-7 (Jabran 2026-11-22):**
   - Drafts are checked at Submit and Post, never re-saved.
   - A recurring run whose line lacks a Required value is `CREATED_AS_DRAFT`, with the problem (`recurring-journals.md` "Run outcomes"), not `FAILED`.
   - A journal import refuses the row, in its row refusal list.
4. **Refusal shape (BR-1, built):** `details.lines[].index / problem / dimension`.
5. **ADR-021 D6, last bullet:** the role-accounts read (A5 §4.6) carries each account's resolved rules for producing modules.
6. **One resolver:** every check calls flow 1's `DimensionRuleResolver`. Don't make a second copy of the order.
7. **Single writer:** `PostingEngine.kt` / `Posting.kt` stay untouched; this flow owns `PostingValidator` step 6.
8. **Spec AC-DIM §4.7** (line cells) and **§9** (refusal words); ADR-027 contract rules; the footer order; no window-width reads.
9. **Two companies:** a rule of another company never applies.

## Carried from the flow 1 review (fix them here; they matter once REQUIRED is enforced)
- **Locked minimum** (`DimensionRuleResolver.kt:50`): a locked chart rule behind an equally strict range must still read as locked, so the App offers no looser rule.
- **Lock order** (`DimensionRuleJdbcAdapters.kt:128-141` vs `JournalJdbcAdapter.kt:853`): update accounts in the same order posting locks them, so a range or bulk change can't deadlock a posting.
- **Add account answer** (`ChartService.kt:280`): return `allowedDimensions` after the write-through.
- **Deleted free dimension** (`deleteDefinition`): its rules don't carry over to a new dimension created in the same slot.

## Scope edges
- **In:** every posting and submit path that discovery finds (manual journal, recurring run, journal import, AR/AP document lines, receipt/payment adjustments, machine postings), the role-accounts read, and the App line cells in every editor that has lines (§4.7).
- **Out:**
  - the branch default cost centre (flow 3);
  - the Department dimension (backlog:320);
  - DIM-B L4 extras (backlog:321), unless §4.7 needs them; say which.

## Definition of Done
WORKFLOW v2 §5 (every discovered path end to end; tests for all cases from a test table written first; a test per fix that fails on the old code; standards kept; checklist; hand-back) plus:
- **Old FAIL / new PASS:** a posting without a Required cost centre is accepted on the base and refused now, on each path.
- Reversal of a line posted before a Required rule existed still posts; the year-end journal posts.
- `scripts/money-invariants.sh` stays green. The lead or the old Mac runs it on the stack; you name the test that proves no ledger line changes.
- **App:**
  - a Compose UI test of the main flow: a journal with a line missing a Required cost centre → Submit → the line shows the danger border and the footer reason "Line N needs a cost centre." → fill it → Submit works;
  - size tests in en/nb/sv/da for one editor per kind with rule cells.
- Your own tests and a compile only (JVM, iOS, Android for the App); no service suites. No hours: read `date`, send a 3-line progress note every 20 minutes (done, left, why it takes the time), stop and report when the work outgrows the plan (template "Time and progress").

## Hand-back
As the template, plus per path: "checked here, test name".

## Never
- `--no-verify`, force push, AI attribution, GitHub workflows, writes in the other repo; no push, merge or rebase (the lead does).
- Migrations: the next free number; never edit an applied migration.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
