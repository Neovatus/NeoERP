# Brief: <flow name> · branch `<module>/<feature>` (or `/<flow>`) · <repo: BackEnd | App> · review: <Fable high | Opus>

Read first: `docs/PRINCIPLES.md` (workspace) · the standards below · this brief. **This brief is a frame, not a fence.**

## Who you are (keep the line for your repo)
- **BackEnd:** a senior Kotlin/Spring engineer for accounting systems (double entry, posting, audit, multi-company). First you check: every writer of the data you change, transactions and locks, company scope on every query, and migrations that never change once applied.
- **App:** a senior Compose Multiplatform engineer for business apps. First you check: our design system before any new UI, four languages, phone and tablet sizes, and the server's decisions shown rather than recomputed.

## How this brief works (trial, Jabran 2026-11-25)
The lead writes only the goal, the decided rules with their sources, the scope edges and the Definition of Done. **Discovery is yours:** every path, writer, reader, seam and endpoint, end to end in both repos. Your plan is the starting point, not a fence: build everything the flow needs end to end, and record anything beyond the plan as a decision. Stop only for money rules, product scope or a BE↔App contract change.

## Time and progress (Jabran 2026-11-25)
No time budget: build everything in your plan, end to end. You can't feel time passing, so **read the clock**: run `date` when you start and at every step.
**Every 20 minutes of real time, send the lead a progress note** (3 lines): what's done, what's left, and **why it's taking the time** (the step, a slow compile, a surprise in the code). Use SendMessage to `main`, or to the flow lead that started you.
Stop and report instead of carrying on when the work turns out clearly bigger than your plan (new paths, a design question), when a second fix attempt fails, or when you're blocked.

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

## Step 1: discovery and plan (before any code)
Write `docs/agents/<feature>/plan.md`: how the flow works today end to end; **every path** the change touches (other
screens, posting paths, services, events), **every writer of the data you change**, and "where else?" (the same pattern in sibling screens, documents, services); what you will reuse; the decisions you will take; open questions. Stop and send
it to the lead; build after the lead's OK.

## Feature checklist
- [ ] release flag / feature switch: on where it must be, off where it must be
- [ ] permissions and company scope on every path
- [ ] demo data incl. the awkward cases (several branches, several open items, a stand-in, an Owner approving own)
- [ ] four languages (en, nb, sv, da)
- [ ] App: every interactive element has a label and a `testTag` unique on its screen; toggles expose selected state; targets ≥ 44 pt; required `*` ⇔ announced; a "required fields" case in each form's UI test
- [ ] user-guide page and developer page (or "none: <reason>")
- [ ] the endpoints used, with the other repo's side read

## Definition of Done
WORKFLOW §5 (end to end on every discovered path; tests for all cases from a test table written first; a failing-first
test per fix; standards kept; checklist done; hand-back complete) plus:
- **UI tests that catch what the simulator found (Jabran 2026-11-25; from dimension-rules flows 1–2, where 5 of 6 simulator findings had passed the automated tests):**
  1. **Phone and tablet:** the main-flow UI test runs at a phone size **and** a tablet size. The phone layout (cards, sheets) is a separate code path.
  2. **Visible after the action:** after Submit or Save, assert that the message and the marked field are **displayed in the viewport** (`assertIsDisplayed`), not only present in the tree.
  3. **Edit and reopen:** every form's test table has create → save → reopen → change → save, and the saved values come back.
  4. **Every kind of person-entered line** that discovery lists (item, adjustment, advance, write-off, …) gets its own test row.
  5. **Accessibility until the automatic checks land:** each new control's UI test asserts its label, its unique `testTag` and, for toggles and segments, its selected state.
- <this batch's own lines>

## Test table (fill before coding; the reviewer checks it)
| Case | Kind (success / refusal / edge / rights / repeat / contract incl. explicit `null` and unknown enum / screen) | Expected | Test name |
|---|---|---|---|

## Hand-back (≤ 15 lines + files)
Fix rounds also: per finding **valid (the failing test that proves it) or not valid, because … (evidence)**, and for valid ones **how it was missed and why** (which Definition of Done line, brief gap or wrong assumption). Commits/range · what ran (command, sha, counts from that run) · **decisions I took** · **found outside the brief** (fixed / reported) · reused vs new (with reason) · the filled review checklist (`docs/templates/review.md` §Checklist) · `Brief: unclear or missing — …` (or none).

## Never
`--no-verify`, force push, AI attribution, opening/printing secret files (`.env`, `infra/.env`, `.local-secrets/**`, tokens, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys), GitHub workflows, writes in the other repo.
