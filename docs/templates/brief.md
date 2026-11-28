# Brief: <flow name> · branch `<module>/<feature>/<flow>`, cut from `main`, PR into `main` (D-95) · <repo: BackEnd | App> · review: Opus 5.5 high

Read first: `docs/PRINCIPLES.md` and `docs/VISION.md` (workspace) · the standards below · this brief. **This brief is a frame, not a fence.**

## Who you are (keep the line for your repo)
- **BackEnd:** a senior Kotlin/Spring engineer for accounting systems (double entry, posting, audit, multi-company). First you check: every writer of the data you change, transactions and locks, company scope on every query, and migrations that never change once applied.
- **App:** a senior Compose Multiplatform engineer for business apps. First you check: our design system before any new UI, four languages, phone and tablet sizes, and the server's decisions shown rather than recomputed.

## How this brief works (trial, Jabran 2026-11-25)
The lead writes only the goal, the decided rules with their sources, the scope edges and the Definition of Done. **Discovery is yours:** every path, writer, reader, seam and endpoint, end to end in both repos. Your plan is the starting point, not a fence: build everything the flow needs end to end, and record anything beyond the plan as a decision. Stop only for money rules, product scope or a BE↔App contract change.

## Rules decided before the build (Jabran 2026-11-25, after spreading flow 1)
- **Before the brief:** the module lead runs the industry check (named reference systems) and the legal check (bookkeeping, VAT and tax rules for NO, SE, DK, PK; IFRS) on the flow's spec sections, and Jabran decides the open points. The brief carries those decisions.
- **No build with open questions:** the builder starts only when the plan's questions are all answered. Waiting for an answer is cheaper than rework.
- **Test-run time limit:** a Gradle run with no progress for 15 minutes is stopped and reported (a hung test must not hold a repo lock).

**Who answers a question (Jabran 2026-11-25):** three levels.
0. **Planner / builder first:** checks the brief's decided rules and sources and the industry standard (named ERPs, the law) itself; a clear answer that fits what's decided is its own decision, recorded with the source. Only what would change a decided rule, the scope or the contract, or where the sources disagree, goes up.
   - **Concepts, not copies (Jabran 2026-11-28):** "make sure we are not copying any system; we make our rules from industry standards, taking the concepts of how they handle it, so we get the best of them." Name the reference systems for the concept; our rule, names and screens are our own.
1. **Flow lead:** checks each planner/builder question with a research agent against industry practice (named ERPs, with sources), the law (NO/SE/DK/PK bookkeeping, VAT, tax; IFRS), our conventions (`docs/domain/RULES.md`, `lead-decisions.md`, design system, ADRs) and the spec. A clear answer that fits what is already decided: the flow lead decides it, records it with sources in `docs/agents/<feature>/decisions.md`, and the builder goes on.
2. **Module lead:** anything that changes the brief, an approved decision, the spec, the contract across flows, or another flow or feature; or where the sources disagree.
3. **Jabran:** only critical points: product scope, legal/licence/cost exposure, or changing something he approved. One question, with a sourced recommendation.
The flow lead lists every question it decided (with sources) in the hand-back and the measures line; the module lead spot-checks them at the merge.

## No helper agents (Jabran 2026-11-25, after spreading flow 1)
One agent per stage, and that agent does its own work: **planners and builders never start helper agents** (no discovery helpers, no split of the build into core / job / docs helpers). Each helper re-reads the brief, the plan and the code, so it multiplies the cost. If a stage is too big for one agent's context, the flow is too big: the flow lead splits the flow. The industry and legal check runs **once per flow, before the brief** (one research agent, Sonnet), not per question.

## Test data ready from the start (Jabran 2026-11-25, after spreading flow 1)
- **Plan:** the planner lists the test data the flow needs (companies, users and rights, stand-ins, the awkward cases, the open items each test step uses) and writes the simulator steps (`docs/agents/<feature>/tester.md`) in the plan, not at test time.
- **Build:** the BE builder writes the seed script and **runs it** against the local stack before hand-back (after its Gradle runs, never together); `bash -n` is not a run. The demo sign-ins the steps need are made and checked in the same slot.
- **Before the review ends:** the flow lead starts the stack and checks the seed and sign-ins while the reviewer reads (the review is read-only, no Gradle), so the tester starts as soon as the fixes land.

## Time and progress (Jabran 2026-11-25)
No time budget: build everything in your plan, end to end. You can't feel time passing, so **read the clock**: run `date` when you start and at every step.
**Every 20 minutes of real time, send the lead a progress note** (3 lines): what's done, what's left, and **why it's taking the time** (the step, a slow compile, a surprise in the code). Use SendMessage to `main`, or to the flow lead that started you.
Stop and report instead of carrying on when the work turns out clearly bigger than your plan (new paths, a design question), when a second fix attempt fails, or when you're blocked.

## Before hand-back: build and test what you built (Jabran 2026-11-25)
Before you hand to review and test, in one batched call:
1. compile every target you touched (App: JVM, iOS-sim, Android with `ANDROID_HOME`; BE: each changed service);
2. your own new and changed tests;
3. **the always-run set** (fast repo-wide checks that catch what "own tests only" misses):
   - **App:** `com.neovatus.neoerp.app.i18n.*` (key standard, duplicate English, generic words, hard-coded text, placeholder parity), **the build-rule tests** (`*FeatureImportRuleTest*`, `*MoneyTextRuleTest*` and their package), plus the size tests of every screen you changed;
   - **BackEnd:** `:architecture-tests:test`, the changed service's migration-head and Flyway upgrade tests when you add a migration, and its context test.

**Done means complete (Jabran 2026-11-25):** hand back only when every Definition of Done line is met and all three are green. There is no partial hand-back: no "not built", no "test gap", no red test left for someone else. You own the whole branch in your repo, including failures in code another builder wrote. The only exception is a real block that you can't decide yourself (a money rule, product scope, or a BE↔App contract change): stop, tell the lead what's blocked and why, and finish the rest. In dimension-rules, language-key, migration-head and architecture-inventory failures surfaced only in the fix round, because nobody had run them at build time.

## Batch your test runs (Jabran 2026-11-25)
Each Gradle run pays its startup (a fresh daemon, configuration, compile) before any test runs: about 3–5 min on the 16 GB Mac. So:
1. Write all the tests for the step first.
2. Run them in **one** Gradle call: several `--tests` filters (and the compile tasks) in the same command.
3. Then run **only the failures** once more.

Never run one test class per call, and never start a run while you are still editing the files it compiles. **App on the 16 GB Mac:** when one call compiles several targets (JVM, iOS, Android), add `--max-workers=2`; three compiles in parallel ran out of memory (2026-11-25). One Gradle job on the Mac at a time still applies.

## Not a limit
Follow the project standards; reuse what already exists (pattern, building block, service, endpoint, helper, test harness);
do not duplicate it and do not depart from the architecture. Where this brief and a standard disagree, the standard wins:
tell the lead. Where the flow needs something this brief does not mention, do it within the standards and record it as a decision.
You own the whole flow, not only the item named here.

## Goal
<what the user can do afterwards, in one or two sentences; why it matters>

## Rules for this feature
<the domain and money rules, with their source: RULES.md §…, an approved decision, a spec section>

## Standards that apply
- Domain: `docs/domain/RULES.md` §…
- Design (App): `docs/design/screen-standard.md`, `ux-principles.md`, `specs/building-blocks.md`, tokens
- Code: this repo's `ARCHITECTURE.md`, `AGENTS.md`
- Contract: <the endpoints, with example requests/responses, or "publish them" for the BE>

## Scope
- **Write:** this repo only, <folders>. Shared modules only when named here.
- **Read:** both repos (read the other side of every endpoint you touch). Never write outside this repo.
- **Out of scope:** <what not to do, and why>

## The done list (D-87, Jabran 2026-11-25)
Keep `docs/agents/<feature>/done.md` from [the template](done.md) through every step. **Verify, don't just tick:** before your own work, re-check the rows you inherit (re-read the file, open the test, run it); add every row the flow needs to meet its Definition of Done, in your own words: inside the scope edges the list is open; what you find outside them goes under "Outside the scope" (reported, not built). Evidence comes from this step's own run or reading, never from memory or an earlier summary. No hand-back with an empty row.

## Step 1: discovery and plan (before any code)
Write `docs/agents/<feature>/plan.md`: how the flow works today end to end; **every path** the change touches (other
screens, posting paths, services, events), **every writer of the data you change**, and "where else?" (the same pattern in sibling screens, documents, services); what you will reuse; the decisions you will take; open questions. Stop and send
it to the lead; build after the lead's OK.

**Every caller, both repos (Jabran 2026-11-25).** In the plan, list every caller of each endpoint, service or rule you change: grep the App for the path (`/api/...`, the DTO, the repository method) and the BackEnd for every writer and reader. Give one table row per caller: the screen or service, the file, and "changed here / not affected because …". In dimension-rules, all 3 feature-review MEDIUMs and one fix-round gap were callers that no plan listed (credit notes from an invoice, the SIE preview, the accrual dialog, the opening-balance import path). Each cost a full extra round.

**BackEnd: publish the whole contract first.** Before any App build step, the BackEnd builder publishes the complete contract for the flow: every endpoint and field, the explicit-`null` rules, every refusal shape with `details`, and the fixtures for each. Only then build the internals. The App builds against that contract and never waits mid-round. A contract change after that is a note to the lead.

## Feature checklist
- [ ] release flag / feature switch: on where it must be, off where it must be
- [ ] permissions and company scope on every path
- [ ] demo data incl. the awkward cases (several branches, several open items, a stand-in, an Owner approving own)
- [ ] four languages (en, nb, sv, da)
- [ ] App: new UI tests use the JSON mock data source (`NeoERP-App/docs/operations/mock-data-source.md`) with fixtures copied from the BackEnd's published examples, not a repository mock; repository mocks are removed per area as it moves
- [ ] App: every interactive element has a label and a `testTag` unique on its screen; toggles expose selected state; targets ≥ 44 pt; required `*` ⇔ announced; a "required fields" case in each form's UI test
- [ ] user-guide page and developer page (or "none: <reason>")
- [ ] the endpoints used, with the other repo's side read

## Definition of Done
**Write it as the flow working (Jabran 2026-11-25):** one row per user action: | Action (who) | Output when it works (screen + books) | Exceptions (refused / waits, with the message) |, then the invariants that always hold, then how it's proven. Process checks (tests, gates) support the rows; they are not the definition. The rows are the floor: discovery and the plan add every edge case under each row (code paths, concurrency, boundaries, other callers); the builder adds what it meets; review and test add what's still missing.

WORKFLOW §5 (end to end on every discovered path; tests for all cases from a test table written first; a failing-first
test per fix; standards kept; checklist done; hand-back complete) plus:
- **UI tests that catch what the simulator found (Jabran 2026-11-25; from dimension-rules flows 1–2, where 5 of 6 simulator findings had passed the automated tests):**
  1. **Phone and tablet:** the main-flow UI test runs at a phone size **and** a tablet size. The phone layout (cards, sheets) is a separate code path.
  2. **Visible after the action:** after Submit or Save, assert that the message and the marked field are **displayed in the viewport** (`assertIsDisplayed`), not only present in the tree.
  3. **Edit and reopen:** every form's test table has create → save → reopen → change → save, and the saved values come back.
  4. **Every kind of person-entered line** that discovery lists (item, adjustment, advance, write-off, …) gets its own test row.
  5. **Accessibility until the automatic checks land:** each new control's UI test asserts its label, its unique `testTag` and, for toggles and segments, its selected state.
- <this batch's own lines>

## Test table (fill before coding; the reviewer checks it; each row also goes into the done list)
| Case | Kind (success / refusal / edge / rights / repeat / contract incl. explicit `null` and unknown enum / screen) | Expected | Test name |
|---|---|---|---|

## Hand-back (≤ 15 lines + files)
Fix rounds also: per finding **valid (the failing test that proves it) or not valid, because … (evidence)**, and for valid ones **how it was missed and why** (which Definition of Done line, brief gap or wrong assumption). The done list with every row's evidence from your own run · commits/range · what ran (command, sha, counts from that run) · **decisions I took** · **found outside the brief** (fixed / reported) · reused vs new (with reason) · the filled review checklist (`docs/templates/review.md` §Checklist) · `Brief: unclear or missing — …` (or none).

## Never
`--no-verify`, force push, AI attribution, opening/printing secret files (`.env`, `infra/.env`, `.local-secrets/**`, tokens, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys), GitHub workflows, writes in the other repo.

**Secret files are not touched at all:** no `chmod`, copy, move or rewrite, and never build your own password or token file. If `make-demo-tokens.sh` or a sign-in step fails, stop and report it to the lead (forms re-test 2026-11-28).

**Background shells:** one waiter per run, with a time limit and an exit when the run's process ends (not only on a log line). Before the hand-back, stop every background shell you started and say so (L39).
