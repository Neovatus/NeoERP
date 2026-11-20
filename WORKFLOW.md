# NeoERP shared workflow and state maintenance

This is the tool-neutral process contract for Codex, Claude and other agents.
Read it on every task start/resume. Repository skills retain their technical
checks; this document owns shared stage, approval, coordination and state-maintenance
rules. Do not maintain a competing copy in a tool guide.

## One owner per record

| Record | Purpose | Writer |
| --- | --- | --- |
| Workspace `PROJECT-STATE.md` | Active workstream index: ID, owning plan link, integration owner, major blocker/dependency and next approved work. | Workspace integration lead only. |
| Owning `docs/agents/<task-slug>/plan.md` | Detailed task scope, stage, progress, evidence limits, decisions and exact next action. | Named task lead; workers return results to that lead. |
| ADRs, architecture, API and design documents | Durable decisions and domain-specific requirements. | Owning team through the applicable review gate. |
| Chat | Routine progress, raw build output, review replies and coordination. | Each participant. |

Project state links to task progress; it does not repeat every checklist or test
result. For cross-repo work choose one owning plan and link to it from the other
repo, rather than maintaining two versions. Workspace-only tasks may own a plan
under the workspace's `docs/agents/`.

## Start or resume: mandatory

1. Read workspace project state, the owning repository's `AGENTS.md` and workflow
   skill, then the active task plan and relevant approved decisions/contracts.
2. Check branch, HEAD, dirty paths and current code. A commit ID does not identify
   an uncommitted snapshot; record the relevant dirty scope and evidence limits.
3. Establish the task lead, allowed write paths, shared-file integrator, current
   stage and approval boundary. Do not claim another worker's task or overwrite
   their plan. An ownership collision pauses the affected work for coordination.
4. For a new non-trivial task, the lead creates the owning plan during Discovery.
   For an existing task, update it in place; do not create another handoff or
   project-state file. Simple questions/typos need no new plan unless they change
   an existing task's durable decision or blocker.
5. State the intended next action in chat and execute only within current approval.

If the shared documents are missing from a standalone checkout, request the
workspace location or an owner-provided copy. Do not invent a substitute policy.
Read-only discovery can continue with the limitation stated; work that depends on
unknown decisions or approvals must wait. Explicit read-only/no-file-change tasks
stay read-only: report proposed record updates in chat for the owning lead.

## Shared stages and gates

`Discovery -> Plan -> Advisor 1 -> Engineer -> Advisor 2 -> Independent Reviewer
-> Advisor 3 -> Improver -> focused independent re-review -> Final Approval
-> approved Delivery -> Done`

Every stage uses senior architecture/security judgment: inspect the whole affected
flow, actors, dependencies, data ownership, failure/retry and trust boundaries,
then return to the smallest approved scope. Discovery and Plan remain separate.
Backend skills supply migration/query/tenant/security checks; frontend skills
supply KMP/Compose/DI/lifecycle/accessibility checks. Cross-repo work uses both.

Continue safe steps within an already-approved plan without repeatedly asking
"start next?". Pause for new scope, unresolved critical risk, unclear authority or
ownership, contract/schema/identity/product decisions, failed verification that
cannot be safely resolved in scope, or a gate requiring user input. Missing an
independent reviewer is not permission to label self-review independent.
Final Approval always pauses. Commits follow the approved commit scope. Push: the lead pushes right after verified
commits ("BUILD SUCCESSFUL" and "0 failed" read); builders never push; a push outside approved work needs Jabran.
No AI attribution (Co-Authored-By or similar) in commits, PRs or comments. Updating state never grants implementation approval.

## Task checkpoint: mandatory fields

Keep this compact block current in the owning plan, not in a separate status file:

| Field | Required content |
| --- | --- |
| Identity and ownership | Task ID, objective, repositories, task lead, integration owner and assigned write scopes. |
| Stage and status | Current stage; proposed / approved / in progress / blocked / awaiting review / awaiting approval / complete. |
| Approval | Who approved which scope/gate, with a durable decision summary; never infer approval from code presence. |
| Progress | Completed steps and remaining steps; distinguish implementation from verification and acceptance. |
| Evidence | Reviewed revision plus dirty scope; checks performed and their limits, without raw logs or secrets. |
| Findings | Accepted/fixed/pending/rejected disposition, rationale and relevant evidence for consequential findings. |
| Resume point | Exact next action, responsible owner, dependencies/blockers and whether it may proceed or needs approval. |

Update at each stage/gate transition, material discovery, blocker, ownership
transfer, planned pause and completion. Refresh an interrupted task on resume;
never assume an agent could checkpoint an unexpected process termination.
Do not append transcripts or a new session log entry for every tool call.

## Maintenance and handoff gate

- Each worker reports stage outcome and proposed checkpoint changes to the task
  lead. Only the assigned lead edits the shared plan unless ownership is explicitly
  transferred. Re-read before editing and preserve concurrent unrelated changes.
- The task lead updates the plan before moving stages or handing off. The workspace
  lead updates project state when an active workstream, major blocker/dependency,
  accepted milestone or next approved work changes. Do not touch it for no-op updates.
- A handoff must identify what is implemented, verified, accepted, blocked and next.
  If recording is disallowed or unavailable, say so in chat and name who must apply
  the update; do not silently claim that shared state is current.
- Before Final Approval, the reviewer checks checkpoint accuracy, source links,
  unresolved findings, verification limits and next-step authorization. A material
  stale/missing checkpoint blocks stage closeout, not read-only investigation.
- Complete product/architecture documentation before Final Approval. Delivery may
  record the actual approved commit hashes and bookkeeping status, but cannot change
  approved scope, decisions, evidence claims or product content without re-review.
- Do not create routine `review.md`, `improvements.md`, `done.md`, build reports or
  extra handoffs. Preserve meaningful finding dispositions in the plan/ADR; retain
  existing history until separately reviewed for archival. Explicit user requests
  for a particular artifact take precedence over this default.

These are required operating instructions, not an automated guarantee that a
model has obeyed them. Independent review and the closeout check supply oversight.

## Working mode (Jabran, 2026-10-03)

How sessions split and run work. It applies on top of the stages above.

- **Who does what.** Lead sessions (one per Mac; see "Two Macs, two leads") plan, delegates, integrates, tests once per merge batch and pushes. Builders (Claude or Codex) build one repo each and commit. Reviewers are fresh Opus sub-agents; the cloud Cowork reviewer is retired (2026-11-20).
- **Review.** Every build gets a fresh independent Opus review before it lands. This review is the Independent Reviewer stage, not self-review.
  - Money and security lanes: the reviewer re-runs the builder's targeted tests from clean and writes a failing test or reproduction per finding. A second, different reviewer (Codex or `/security-review`) checks before merge.
  - Every review: `git fetch` first, list new migration files against the latest origin, and re-run tests with `--rerun` instead of trusting cached results.
  - UI and wording lanes: one review, no re-runs.
- **The lead stays responsive.** The main agent talks with Jabran, plans, delegates, reviews and reports. Real work goes to sub-agents or background jobs, so Jabran's questions are answered while work runs. Keep a visible task list with progress.
- **Parallel by files.** Run independent work as parallel workers, split so no two workers edit the same file. The lead integrates shared files.
- **Models (Claude):**
  - **Opus 5.5 (default builder, Jabran 2026-11-15):** planning, design, contracts, every review, and building full screen batches and anything where the spec leaves decisions open.
  - **Sonnet 5.5:** only fully decided work: review fixes, wording, copying an existing pattern, data layers from a fixed contract.
  - **Haiku 5.5:** clearly defined tasks only: renames, doc and backlog updates, demo data and seed scripts, summaries, simple mechanical fixes.
  - **Fable 5.2:** only the most critical problems: two identical failures at high effort, or a hard concurrency, security or data-integrity bug.
  - **Hard rule:** anything touching money, security or auth, locking or concurrency, or migrations is implemented or co-implemented by Opus. (Jabran, 2026-10-08; widened 2026-11-15)
  - Label every sub-agent with its model in the description, e.g. `[Opus] C3 build`.
- **Loop for each piece of work:** spec and rig → Jabran approves → contract → backend and app slices in parallel → review → lead tests and pushes → Jabran clicks through.
- **Approval.** When Jabran approves a spec and its contract, the slices the contract lists are approved for implementation. That includes their Flyway migrations, commits and the lead's pushes of verified work. Login or sign-in changes, and anything outside those slices, still need his explicit approval.
- **Current state and next work:** see `NeoERP-App/docs/HANDOFF.md` and the owning `docs/agents/<task>/plan.md`.

## Guardrails against agent loops (2026-10-06)

Agents must not circle. These apply to every implementer and reviewer.

- **Design is frozen at commit.** The committed spec, contract and rig are the
  source of truth. Implementers do not redesign; a needed change is a one-line
  change note to the reviewer (fresh Opus sub-agent), who decides.
- **Two review rounds per checkpoint, then stop.** Round 1 finds. Round 2 checks the
  fixes only. After that only a BLOCKER or MAJOR with a reproduction or a
  failing test reopens a batch. Everything else goes to the backlog file
  `docs/backlog.md` and does not block.
- **A finding needs evidence.** File and line, plus a concrete failure:
  inputs, wrong result. "Could be clearer" or "consider" is not a finding.
  No new scope inside a review.
- **Small, testable slices.** Each job is file-disjoint, has its acceptance
  tests named before it starts, and is done when those tests are green and the
  reviewer accepts. A slice that grows past its file list is split, not stretched.
- **Two strikes, then escalate.** The same failure twice → stop, write what was
  tried, escalate (Fable 5.2, then the lead, then Jabran). No third blind retry.
- **Time box.** A job that has not produced a green test or a clear blocker
  within its box reports back instead of continuing.
- **One owner per decision.** Product calls: Jabran. Design and architecture:
  the reviewer (fresh Opus sub-agent). Implementation detail inside the contract: the implementer.
  Agents never reopen a decision recorded in the spec's decision table.
- **Jabran's time is for checkpoints only:** approve a design, click through a
  finished slice, approve pushes outside approved work.

## Checkpoints: implement, then review (Jabran, 2026-10-08)

Design may be written for many slices at once. Implementation and review run at
**checkpoints**, not after every slice or wave. This keeps reviews few and large
enough to be worth their cost.

- **Design gate (Jabran, 2026-10-08):** no implementation of a slice starts, backend included, until **both** its contract and its screen design (rig) are approved. Screens can change what the backend must return, so building the backend first risks doing the work twice.
- **What a checkpoint is.** A user-visible capability that works end to end: backend,
  app and tests, demonstrable by a script or a click-through. Each contract's slice table
  names its checkpoints (CP-1, CP-2 …). A slice usually has two or three checkpoints;
  each one bundles several waves.
- **Between checkpoints (implementer only):**
  - The implementer works through the waves on its own, in local commits or a feature branch. There is **no
    independent review and no reviewer round per wave**.
  - The gate per wave is mechanical: the named and impact-based tests (Test scope below) are green, and the money/security checks in the contract are run.
  - Sonnet works with an **Opus self-check** at the end of each wave. That is one short pass over the wave's diff in the
    implementer session, not a separate review job.
  - The implementer tells the lead only about a contract question or amendment, a blocker, or
    two strikes. It does not post a status message per wave.
- **At a checkpoint:**
  1. **One** independent Opus review of the whole checkpoint diff, scoped to the
     contract sections that diff touches.
  2. The implementer fixes the findings and sends the lead **one** report: the range, the test scope run with counts, the review verdict, and any rulings needed.
  3. **Money and security checkpoints** also get the second reviewer and the test re-runs (see Working mode, Review). **UI and wording checkpoints** are accepted on test names and the one review, with no re-runs.
  4. After the lead's full run, the lead pushes. Jabran clicks through user-visible checkpoints.
- **Docs are part of done (Jabran, 2026-10-09).** A checkpoint is accepted only when, in the same diff:
  - its **developer page** is updated: `NeoERP-BackEnd/docs/modules/{module}/{feature}.md` (flows, server rules, data,
    events, decisions, guidelines) and the app side in `NeoERP-App/docs/modules/`;
  - its **user-guide page** is updated: `NeoERP-App/docs/user-guide/{module}/{feature}.md` (example, steps, terms,
    rules), with its `tools/shots.json` entries and regenerated screenshots;
  - any new term is in `glossary.md` and any new decision in `decisions.md`.
  The reviewer checks these on a skim against the diff; a missing page is a finding.
- **Test scope (impact-based):**
  - **Between checkpoints** (per wave), run only:
    - the tests that are new or changed;
    - the tests of the classes or files changed;
    - the tests of anything that depends on them.
  - **How to pick them:**
    - A change inside one service runs that service's affected test classes, plus that service's suite when the change is in a shared area of it (domain, persistence, security config, migrations).
    - A change to `shared/neoerp-security` (or any shared library) runs **every** service that uses it, plus `:architecture-tests`.
    - A migration runs that service's full suite and `:architecture-tests`.
    - A contract or DTO change runs the producer's and every consumer's tests (backend and app).
    - App code runs the affected feature's tests plus `jvmTest` of the shared core when `core/` changed.
    - Docs only: no tests.
  - **Builders** run their targeted tests through the Gradle lock (`lockf`, one Gradle run at a time machine-wide); wording lanes compile only. Lanes run one at a time and builders spawn no helper agents. Run `./gradlew --stop` after Android or iOS compiles.
  - **Before push, the lead runs one full run per merge batch (at most 3 related slices):** the full suites of every touched service, the library, `:architecture-tests` and the app's `jvmTest`. Load and concurrency tests run then, or when the engine or locking code changed. Read "BUILD SUCCESSFUL" and "0 failed" before pushing, in a separate step from the test run.
  - **Reports state the scope that was run**, e.g. "accounts: 3 classes, 41 tests" or "full suite 342/0". A failure in an unrelated test gets a backlog row (`docs/backlog.md`) with an owner the same turn, or it blocks.
- **Test output costs tokens; keep it out of the context.**
  - Run Gradle quietly (`-q --console=plain`). Send the full log to a file under the build directory, never into the conversation.
  - Read back only the summary (passed/failed counts per module) and, for failures, the test name with the first assertion message and up to 20 lines of stack.
  - Never paste whole test reports, compile logs or `--info` output.
  - Prefer one test command per wave over many small reruns. Rerun only the failing classes (`--tests`).
  - A long failure log can be triaged by a Haiku subagent that returns the cause in a few lines.
  - Testcontainers and load tests run in the background and report only their result.
- **Cost rules for reviews:**
  - Read the diff and the named contract sections only, never the whole repo.
  - One reviewer per checkpoint, not one per slice or one per dimension (plus the second reviewer on money and security).
  - Re-review only the fixes (the two-round rule above still applies).
  - Docs-only or mechanical changes are accepted on a skim.
- **Design reviews:** a design is reviewed once before Jabran approves it, and again only if it
  changes. Drafts for later slices are not re-reviewed until that slice is next.

## UI quality gates (Jabran, 2026-11-15)

Phase 3 testing found mostly look-and-consistency problems no builder saw: screens building their own version of a
shared piece, data too simple to show a bug, and nobody looking at the screen. The rules already exist
(`NeoERP-App/docs/design/specs/building-blocks.md`, `ux-principles.md`, the App definition of done and review
checklist); these gates enforce them. They apply to every App slice from Phase 4 on.

1. **One shared piece per concept.** A screen never builds its own dialog actions, status pill, link in a card or
   table, footer, picker or empty state. If the piece is missing, it is added to the design system and to
   `building-blocks.md` first, then used. A builder who finds two screens doing the same thing differently reports it.
2. **Checks, not memory.** Architecture/lint tests fail when a feature screen bypasses a building block (for example a
   button Row inside a dialog, a ghost `NeoButton` used as a link in a fact list or table, a status worked out per
   screen). New building blocks come with their check.
3. **Screenshots before Jabran.** Every new or changed screen gets entries in the screenshot tool (light, dark, phone
   width) in the same slice; an agent reviews them against `building-blocks.md` and `ux-principles.md` and lists what
   it sees before the slice is handed over.
4. **Realistic data.** Tests and the demo seed include the awkward cases: a company with several branches, several open
   advances or invoices, two tax codes at the same rate, documents waiting for approval, an Owner who may approve
   their own. A test that only passes on a one-branch company is not enough.
5. **Desk check and click-through before handover.** At slice end an agent checks the test steps against the code
   (as `docs/agents/phase3-desk-check/`), and a click-through agent (Codex with desktop control) runs them; Jabran
   gets the open questions, not the first look.
6. **Review includes consistency.** Every App review checks gates 1–4 besides money and security; a screen that
   differs from its siblings is a finding.
7. **Every fix asks "where else?"** (backend and App). Before fixing, the builder searches for the same pattern in
   sibling screens, documents and services (AR and AP, invoice and bill, receipt and payment, every dialog …). The fix
   goes into the shared piece when the cause is shared; otherwise every sibling is fixed in the same batch. The report
   lists the places found and what was done with each ("fixed", "not affected", "left, because …"). Review checks the
   list; a sibling with the same bug left unfixed is a finding.
8. **Every screen batch ships its size tests** (Jabran, 2026-11-16). New or changed screens get screenshot tests on the
   shared device matrix (4 phones, 3 tablets, 4 desktops incl. a short 1024×700 window; variants en, nb, large font)
   with the automatic layout checks (cut-off text, overlap, off-screen, footer covering content, footer/dialog button
   alignment). A failing check is fixed in the batch. The lead views one phone, one tablet and one desktop image per
   new screen; Jabran judges the look at the click-through.

## Builder scope: write scope and read scope (Jabran, 2026-11-19)

Every builder brief (Claude or Codex) names two scopes, on top of "one repo per builder":

- **Write scope:** the exact folders the builder may change (e.g. `services/accounts-service/**` and the docs it owns).
  A change anywhere else is a **stop and ask**. Shared modules (`shared/**`, design-system components, architecture
  tests) are never in a write scope unless the brief says so by name.
- **Read scope:** the rest of the repo, read-only. The builder must use it to follow the project's standards:
  reuse the existing pattern, building block, helper and test harness before writing anything new, and follow the
  architecture (layering, ports, naming, `docs/design/specs/building-blocks.md`, `ARCHITECTURE.md` / `AGENTS.md`).
  No new pattern, component, helper or library where one exists; if none fits, stop and ask.
- **The report lists** what was reused (pattern or building block and where it lives) and anything new with the reason.
- **The lead checks before merging** that every changed path is inside the write scope (`git diff --stat`), and that
  nothing duplicates an existing piece. A path outside the scope or a duplicate is sent back.

The full repo stays checked out: the build, the shared modules, the architecture tests and "where else?" need it.

## Context limit: compact and hand off (Jabran, 2026-10-08; thresholds updated 2026-11-20)

- **The lead** asks Jabran for `/compact` at about 50 % of the context window. **Every other session** hands off at about 80 %.
- At the threshold, stop taking new work and finish the current small step.
- **Write a handoff note** (≤ 60 lines) in `.review-channel/handoff-<role>.md`. Replace it, don't append. It holds:
  - the current checkpoint and slice;
  - what is done (commits), what is in progress, and the exact next step;
  - open rulings and branches;
  - anything uncommitted;
  - the rules that matter for the next step.
- Then compact the context, not the session: run `/compact` with a focus line, e.g. `/compact keep: handoff-implementer.md, current checkpoint`. After compacting, re-read `WORKFLOW.md` and the handoff note.
- A fresh session is only needed when compaction has happened several times and quality drops.
- Don't wait for automatic compaction in the middle of a wave or a review: details get lost and mistakes repeat.
- Hand off at natural boundaries (end of a wave, a checkpoint or a review) even below the threshold when the next piece of work is large.
- At 90 % of the plan limit (5-hour or weekly) start nothing new and finish what runs; at 92 % stop and hand off.

## Reviews and reports (2026-11-20)
- The `.review-channel/to-*.md` files and the cloud Cowork reviewer are retired (history in `.review-channel/archive/`, read only when someone refers to an old entry).
- Reviews are fresh Opus sub-agents plus Codex or `/security-review` where the Working mode requires it. Reviewers report findings to the lead.
- Builders end with one short report to the lead: commits or range, test scope run with counts, rulings needed, review verdict. Keep it to decisions and instructions, no restated history.
- `.review-channel/handoff-<role>.md` stays, for handoffs.

## Canonical state and reference

One current state file: [PROJECT-STATE.md](PROJECT-STATE.md). The `.claude`/`.codex`
copies were deprecated on 2026-11-20 (history only). The lead updates it at the end of every batch.
Read [PROJECT-STATE.md](PROJECT-STATE.md), the canonical active-workstream index,
on every pickup, then the owning plan. Read the
[dated factual reference](docs/reconciliation-2026-09-06.md) on demand; it is not a
second live queue or a mandatory full read at every startup. The
[consolidation plan](docs/agents/documentation-consolidation/plan.md) owns the
document-disposition work list, not permission to execute it.

State approval does not authorize implementation, login changes, migrations,
commits or pushes. Every workstream retains "None newly approved" until its owning
checkpoint is reconciled and the user separately approves its scope. Unnamed
integration owners must be clarified, not inferred from a proposed role.
Workspace/design versioning remains undecided. No document moves, renames,
archival or retirement, and no repository initialization, are authorized.

## QA rounds and limits (Jabran, 2026-11-19)
- **Simulator size checks, 6 positions on 4 simulators:** iPhone SE portrait (375×667) and landscape (667×375); iPhone 18 Pro landscape (874×402); iPad mini portrait (744);
  iPad Pro 13 portrait (1032) and landscape (1376). The app's layout switches at 600, 720, 1024 and 1280. The 320 phone and desktop windows: automated size tests and Codex on macOS.
  Flow tests use one simulator per person; shut down simulators not in use.
- **Testers** run scripted steps on Sonnet, in chunks of about 4 tests or 6 groups; Opus builds, reviews and groups findings. Results stay in the round's report files (no review page unless asked).
- **Fix rule:** collect all findings of a round, fix once at the end; fix at once only blockers that stop other tests.
- **Every builder brief** includes the review checklist: desktop and keyboard behaviour unchanged unless the brief says otherwise; contract-mapping tests for any API change;
  shared component changes list their callers; JVM and iOS compile; read "BUILD SUCCESSFUL" and "0 failed" before any push.
- **Limits:** start big parallel work early in a 5-hour window; thresholds are in "Context limit".
- **After each round:** fix the test scripts from the round's SCRIPT list (Sonnet job), and end the round's `summary.md` with a **Lessons** section (3–5 lines: way of working changed, automated test added, spec changed).
- **Guardrails for money, security and statutory work (Jabran 2026-11-20, not trials):**
  1. Every money or security finding gets an automated test before it is closed.
  2. Money invariant checks run after every seed and full test run: debits = credits per journal, ledger = sum of postings, subledgers = control accounts, no double post or double pay under retry, rounding per currency. A break stops the push.
  3. Money and security changes get a second, different reviewer (Opus plus Codex or `/security-review`) before merge, with the re-runs described in Working mode, Review. Nothing is merged uncompiled. Test runs fail on unexpected skips (e.g. Docker-skipped tests).
  4. Posting rules and statutory files are signed off by a human accountant before go-live; pen test and production invariant checks are go-live gates; owners: accountant sign-off and pen test = Jabran, production invariant checks = the lead (BackEnd `hosting-and-go-live-requirements.md` ERP-Q1–Q3).
  5. Company isolation (review C3): the tenant architecture test covers every service; database row-level security follows by ADR before the first customer; Payroll's rebuild must carry the company column.
- **Two Macs, two leads (Jabran 2026-11-21):** each lead writes what it works on in `.review-channel/claims.md` first; work on different branches; pull before work, push right after; usage thresholds apply per account. **Probation:** until Jabran says the new Mac's lead behaves as expected, it builds only on `phase/4-b2-*` lane branches and does **not** merge to `phase/*` or `main`; after each lane it writes `.review-channel/lane-ready-<lane>.md` (diff range, brief, review files, targeted and full test results with "BUILD SUCCESSFUL" and "0 failed", write-scope check). The old Mac's lead reviews process and result against this file and lessons, writes `.review-channel/lane-verdict-<lane>.md` (MERGE / FIX: list), and the merge to `phase/4` happens only after MERGE. Both leads back up memory to `docs/lead-memory/` (no deletes, newer wins).
- **Lessons register (`docs/lessons.md`, Jabran 2026-11-20):** after every batch or round, new lessons go in as Proposed; Trial lessons get "+/−" evidence per batch; a lesson that helped in 2 batches becomes a Convention (moved into this file or the lead's memory), one that didn't is Dropped with the reason. The lead tells Jabran what moved.
