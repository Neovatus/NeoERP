# NeoERP shared workflow and state maintenance

> **Trial from 2026-11-24 (D-81):** new work follows [`docs/process/workflow-v2-draft.md`](docs/process/workflow-v2-draft.md) and `docs/templates/`. Where they differ from this file, v2 wins (e.g. test scope: `design.*` no longer always runs after `core/app-test-speed`; builders run only their own tests; the gate runs once per feature). This file is replaced when Jabran approves v2 after the trial.

> **Start with [docs/PRINCIPLES.md](docs/PRINCIPLES.md)** (one page, D-63). The rules below are examples of those principles; when a rule does not cover a case, apply the principles.

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

- **Who does what.** Lead sessions (one per Mac; see "Two Macs, two leads") plan, delegates, integrates, tests once per merge batch and pushes. Every lead reads the [QA guide](docs/qa/qa-guide.md) before planning a QA round or a test batch. Builders (Claude or Codex) build one repo each and commit. Reviewers are fresh Opus sub-agents; the cloud Cowork reviewer is retired (2026-11-20).
- **Review.** Every build gets a fresh independent Opus review before it lands. This review is the Independent Reviewer stage, not self-review.
  - **Money and security lanes** means any change touching money posting, numbering, security/auth, locking or concurrency, migrations, or company isolation (the paths in each repo's `docs/risk-paths.txt`. Since RISK-NARROW-1 the App list names only accounts code that decides money, security or company data: view models, state, rules, repositories, and the hosts and screens that build view models or hold a rule. A change to another accounts screen, dialog, card or wording file reads NORMAL and gets one review. A file added or renamed into a narrowed accounts folder reads RISK until it is listed. The BackEnd list covers every service's HTTP delivery and ports, and accounts, user and org persistence and domain code; `verify.sh` fails on a glob that matches nothing.). They get the re-runs; the second, different reviewer follows **Review tiers** below (D-46):
  - On those lanes the reviewer writes a failing test or reproduction per finding. **Reviewers do not re-run the builder's tests** (D-49, 2026-11-22): they read the diff and the builder's test evidence, and run tests only to prove a finding. A second, different reviewer checks before merge on tier-2 lanes only (Review tiers, D-46).
  - Every review: `git fetch` first and list new migration files against the latest origin. Test re-runs only on money and security lanes (above).
  - UI and wording lanes: one review, no re-runs.
- **One reviewer (Jabran 2026-11-27: "just one is enough … it gonna do both"; supersedes tier 2 below).** Every flow gets one reviewer (Opus 5.5 high on money/security) who reviews beyond the diff **and** takes the independent money/rights angle (challenges the plan's assumptions; dates/DST, cash paths, concurrency, isolation, server-side rights, rounding). No second reviewer. `risk-check.sh --reviews` still asks for two review files on RISK ranges: to be changed by the gate-file owner.
- **Review tiers (Jabran 2026-11-22, D-46; replaces "every money/security lane gets a second reviewer" and the Sonnet second review on App lanes).** The lead sets the tier in the brief (`Review tier: 2` or `1`); a single reviewer may escalate to tier 2 (a HIGH found, or "needs a second view").
  - **Tier 2, two independent reviewers in round 1:** changes that alter the booked books or who sees what: posting, ledger, journals, tax amounts, payments and bank, balances, migrations on money tables; auth, tokens, permissions, company isolation, encryption; gate, verify or hook scripts; or a large change (more than ~15 files on risk paths). Fable + Opus (Opus + `Opus 5.5 security (D-43)` while Fable is paused).
  - **Tier 1, one reviewer:** risk-path changes that do not alter that behaviour (small proven fixes with an old-FAIL test, read-only reports, money display, query refactors with tests, docs): one Opus at high effort. Everything else (screens, layout, wording, languages, tooling, docs): one Opus at default effort, plus the simulator check for App screens. No Sonnet second review.
  - **No repeats:** after a FIX only the reviewer who asked re-checks; the other reviewer re-stamps only when the fix touches their angle's risk paths; no re-stamp for a clean rebase (every commit `=` in `git range-diff`, base move touches none of the lane's files). Until GATE-3 teaches the gate these rules (tier line, patch-identical rebase, kept stamp), RISK-flagged lanes still carry two gate-format files.
  - Why: on 2026-11-22, 17 of 25 review runs were repeats (fix re-checks and re-stamps); the findings came from first reviews, and the second reviewer earned its cost on books and isolation (AC418-BE double-receivable HIGH, R29b-5 MEDIUM).
- **Gate scope (Jabran 2026-11-22, D-47).** Lane → `phase/*`: a **scoped** gate (changed modules + their dependents, plus `:architecture-tests` and the money invariants, always). `phase/*` → `main`: first merge `main` into the phase branch (normal merge commit, never force), so it carries every other phase's code; then the **whole suite** on that result, the MERGE PR verdict, and the PR merge. Until TEST-SCOPE-1 lands, lane gates still run the whole suite.
- **Who tests what (Jabran 2026-11-22, D-49).** Each change is tested once by its builder and once in combination by the gate. Builder: targeted tests per fix + the full suites of every touched service + `:architecture-tests` before hand-back; once TEST-SCOPE-1 lands, exactly the gate's scoped set (same command) instead. Reviewers: no test re-runs (above). Gate (test Mac): scoped per lane; whole suite only before a phase goes to `main` (D-47). Never run the backend stack or a simulator tester on the test Mac while a gate runs.
- **Speed rules (Jabran 2026-11-22, D-51).**
  1. **Batch:** group 2–3 related fixes into one lane, so one review and one gate cover them; merge lanes in batches where they share a base.
  2. **Flow test before review:** App lanes run the simulator/flow steps (tester sub-agent) before the reviewers, so the reviewers see a lane that works in the app.
  3. **Brief check:** a fresh Opus checks each brief (5 min) for gaps and silent points before the builder starts; findings go into the brief.
  4. **Check first, don't repeat, ask:** before re-running a test, a review or a check, look at what already ran on the same code (builder report, review files, gate markers, lane-ready, the other lead's inbox). If unsure whether something was already tested or reviewed, **ask** the builder, reviewer or the other lead (one-line message) instead of running it again. Run again only when the code changed in that area or the evidence is missing. Every hand-back and lane-ready lists what ran, on which sha, with counts, so the next person can reuse it. Counts come from that run's own Gradle output (with sha and time), never from `build/test-results` left by an earlier run (R29b-3U, 2026-11-22: stale counts hid a compile break).
  5. **Plan tests per batch, not per agent; one test ledger.** Before any tester or reviewer starts, the lead merges every lane's planned checks, removes duplicates and marks what is already covered in [`.review-channel/test-ledger.md`](.review-channel/test-ledger.md) (both leads read it first and append after). Common flows (sign-in, company switch, post a journal, approve and pay) run once per batch on the combined code. Several lanes needing simulator checks share one stack session, one sign-in and one tester with the merged step list. Reviewer briefs say what is already tested.
  6. **One phase plan (Jabran 2026-11-22, D-53).** The old-Mac lead (test + integration Mac) owns one plan per phase for the whole flow (`.review-channel/phase<N>-plan.md`): the lanes, who builds each, branch and base, order, review tier, merge batches and the test points. Jabran reviews it; both leads follow it; changes go through the owner, who rings the other lead.
- **Accounts on the new Mac (Jabran 2026-11-22, D-61, trial from Phase 4b).** New-Mac lead: Accounts end to end (build, review, its own scoped gates and merges into the Accounts phase branch) from the old-Mac phase plan; asks the old Mac for simulator sessions, shared-code changes, decisions and phase → `main`. Old-Mac lead: HR & Payroll end to end, simulator sessions for both, every phase → `main`. Check-in after the first 4b batch.
- **Measure and prune (Jabran 2026-11-22, D-63).** Every lane's Timeline (MEASURE-1) adds two fields: **cost** (sub-agent tokens per lane, from the agents' usage lines, split build / review / test) and **first-pass gate** (yes/no, and the failure origin when no). Each phase review lists every rule added during the phase with its numbers and marks it **keep / change / drop**; dropped rules are removed from WORKFLOW in the same commit.
- **Automate what repeats (Jabran 2026-11-22, D-69).** (1) Every simulator FAIL becomes an automated test (Compose UI test on JVM with fakes, or a BE integration test) in its fix lane, so it never needs a manual retest. (2) Every feature lane ships a Compose UI test for its main user flow at T1. (3) Simulator sessions keep only first looks at new features, real-device behaviour (keyboard, rotation, iPad layout), wording and feel; steps covered by automated tests on the same code are dropped, backend-only steps are checked through the API. (4) Trial after Phase 4: a few end-to-end tests on the local stack for the main money flows (e.g. Maestro), after a short spike that proves it drives our Compose iOS screens.
- **Simulator personas and accessibility pass (Jabran 2026-11-22, D-75).** Tester briefs use personas (device × language × text size × dark mode) and run an accessibility check on every screen (unnamed controls, touch targets < 44 pt, cut text at large size). AXe (accessibility-tree simulator driving) is trialled in the 4b E2E spike against Maestro and our screenshot tester; adopted only if faster/cheaper with equal findings. No GitHub Actions.
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
  change note to the lead, who proposes the change (spec or ADR) for Jabran to approve.
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
  the lead proposes (spec or ADR), Jabran approves; the reviewer checks the work against it. Implementation detail inside the contract: the implementer.
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
  3. **Money and security checkpoints** (as defined in Working mode, Review) also get the test re-runs, and the second reviewer on tier 2 (Review tiers, D-46) (see Working mode, Review). **UI and wording checkpoints** are accepted on test names and the one review, with no re-runs.
  4. After the lead's full run, the lead pushes. Jabran clicks through user-visible checkpoints.
- **Docs are part of done (Jabran, 2026-10-09).** A checkpoint is accepted only when, in the same diff:
  - its **developer page** is updated: `NeoERP-BackEnd/docs/modules/{module}/{feature}.md` (flows, server rules, data,
    events, decisions, guidelines) and the app side in `NeoERP-App/docs/modules/`;
  - its **user-guide page** is updated: `NeoERP-App/docs/user-guide/{module}/{feature}.md` (example, steps, terms,
    rules), with its `tools/shots.json` entries and regenerated screenshots;
  - any new term is in `glossary.md` and any new decision in `decisions.md`.
  The reviewer checks these on a skim against the diff; a missing page is a finding. Enforced (Jabran 2026-11-21): every
  lane-ready file lists the user-guide and developer pages the lane changed, or "none: <reason>"; a missing page is FIX.
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
  - **Builders** run their targeted tests through the Gradle lock (`lockf`); wording lanes compile only; builders spawn no helper agents. **One lock per repo (GATE-2, Jabran 2026-11-22):** BackEnd Gradle jobs take `/private/tmp/neoerp-gradle.lock`, App jobs `/private/tmp/neoerp-gradle-app.lock`; no job takes the other repo's lock, so the two repos never wait on each other. A full `scripts/verify.sh` takes its own repo's lock itself (**run it without a `lockf` wrapper**: a wrapper makes it wait for itself; it prints "waiting for the <repo> Gradle lock" when the lock is busy) and runs in its own Gradle home (`/tmp/gradle-home-verify-be`, `/tmp/gradle-home-verify-app`), whose daemons it stops at the end: one full gate per repo at a time. Old Mac (36 GB): a BackEnd and an App full gate may run together (first proof 2026-11-22: 13 min each, 0 Gradle processes left). New Mac (16 GB): no full gates (builder Mac rule); targeted runs of the two repos run in parallel. Any other whole-suite or `--parallel` Gradle run takes its own repo's lock only. On an out-of-memory error, a Kotlin daemon crash or heavy swapping: back to one gate at a time and tell the lead (lessons L33). Run `./gradlew --stop` after Android or iOS compiles. **Old Mac, trial L34 (Jabran 2026-11-22):** targeted jobs there run through `scripts/gradle-job.sh <app|be> <dir> <args>` (2 slots per repo, each with its own lock and Gradle home, daemons stopped on exit); full verify runs keep their own repo's lock and Gradle home; old-Mac `gradle-job.sh` slot jobs keep their slot locks.
  - **Before push, the lead runs one full run per merge batch (at most 3 related slices):** `scripts/verify.sh` in each repo the batch touches (BackEnd: every service, `shared/*`, `:architecture-tests` and the money invariants; App: `jvmTest` and the iOS compile). The pre-push hook refuses a push to `phase/<N>` or `main` without its marker (`NeoERP-BackEnd/docs/operations/verify.md`, `NeoERP-App/docs/operations/verify.md`). Load and concurrency tests run then, or when the engine or locking code changed. Read `verify: OK` and "0 failed" before pushing, in a separate step from the test run. The test kinds per level: [QA guide](docs/qa/qa-guide.md) §5.
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
  - One reviewer per checkpoint, not one per slice or one per dimension (plus the second reviewer on tier-2 lanes, D-46).
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
- Start new work until 99 % of the plan limit (5-hour or weekly); at 99 % start nothing new, finish the current step, write handoffs and stop (D-56, Jabran 2026-11-22; was 90 % / 92 %).

## Reviews and reports (2026-11-20)
- The `.review-channel/to-*.md` files and the cloud Cowork reviewer are retired (history in `.review-channel/archive/`, read only when someone refers to an old entry).
- Reviews are fresh Opus sub-agents plus Codex or `/security-review` where the Working mode requires it. Reviewers report findings to the lead.
- Builders end with one short report to the lead: commits or range, test scope run with counts, rulings needed, review verdict. Every hand-back (builder, reviewer, tester) ends with **"Brief: unclear or missing — …"** or "none" (D-67); the lead logs them in the lane's Timeline. Keep it to decisions and instructions, no restated history.
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
Workspace/design versioning remains undecided. Moving or retiring a document needs
Jabran's OK for that change. No repository initialization is authorized.

## QA rounds and limits (Jabran, 2026-11-19)
- **The [QA guide](docs/qa/qa-guide.md) holds the standing QA rules:** roles, limits, what to check, the one size list (§4), automated tests per level, report format and severity, round flow, brief template and test-step coverage. Every QA brief and every lead reads it first. The bullets below stay the source for the rules they state.
- **Testers** run scripted steps on Sonnet, in chunks of about 4 tests or 6 groups; Opus builds, reviews and groups findings. Results stay in the round's report files (no review page unless asked).
- **Fix rule:** collect all findings of a round, fix once at the end; fix at once only blockers that stop other tests.
- **Every builder brief** includes the review checklist: desktop and keyboard behaviour unchanged unless the brief says otherwise; contract-mapping tests for any API change;
  shared component changes list their callers; JVM and iOS compile; read "BUILD SUCCESSFUL" and "0 failed" before any push. Its read-first list names the [QA guide](docs/qa/qa-guide.md) §5 (the tests the slice must add).
- **Limits:** start big parallel work early in a 5-hour window; thresholds are in "Context limit".
- **After each round:** fix the test scripts from the round's SCRIPT list (Sonnet job), and end the round's `summary.md` with a **Lessons** section (3–5 lines: way of working changed, automated test added, spec changed).
- **No GitHub CI in dev (Jabran 2026-11-21):** GitHub Actions are switched off on all three repos (`Neovatus/NeoERP-BackEnd`, `Neovatus/NeoERP-FrontEnd`, `Neovatus/NeoERP`) so nothing uses Actions minutes; there is no CI pipeline yet (go-live row P-8). The local `scripts/verify.sh` + pre-push hook are the gate. Never switch Actions on or add a workflow without Jabran's OK; turning Actions on would also start the existing BackEnd `services-test.yml` on every push to `main` and `phase/**`.
- **Secret files are never printed (Jabran's rule, widened 2026-11-22):** never open, print, `cat`, `grep` the content of, or copy `.env` files (tracked or not, e.g. BackEnd `infra/.env`), `.local-secrets/**`, token and session files, `~/.gradle/gradle.properties` and any `gradle.properties` outside the repos, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, keychains or SSH keys. To check one setting in such a file, read only that key (`grep -c '^org.gradle.java.home=' file`, or `sed -n 's/^key=//p'` for a non-secret key) and never print the rest. Never copy secret files anywhere. Note: BackEnd `.env`, `infra/.env` and `.local-secrets/*` are **tracked** in the private repo (Jabran 2026-11-20, commit 856ba3a), so every new BackEnd worktree checks them out with the umask's permissions (world-readable): run `chmod 700 .local-secrets && chmod 600 .local-secrets/* .env infra/.env` right after `git worktree add`, and never delete them in a worktree (a tracked deletion could be committed). They stay tracked in dev so both Macs have them (Jabran 2026-11-22); untracking and rotating them is part of go-live (hosted secrets, ERP-Q5). Every builder and reviewer brief repeats this. (2026-11-22: a reviewer printed `~/.gradle/gradle.properties` in full and exposed third-party secrets from other projects in its tool output.)
- **Guardrails for money, security and statutory work (Jabran 2026-11-20, not trials):**
  1. Every money or security finding gets an automated test before it is closed.
  2. Money invariant checks run after every seed and full test run: debits = credits per journal, ledger = sum of postings, subledgers = control accounts, no double post or double pay under retry, rounding per currency. A break stops the push.
  3. Money and security changes (as defined in Working mode, Review) get a second, different reviewer on tier 2 (D-46) (Opus plus Codex or `/security-review`) before merge, with the re-runs described in Working mode, Review. Nothing is merged uncompiled. Test runs fail on unexpected skips (e.g. Docker-skipped tests).
  4. Posting rules and statutory files are signed off by a human accountant before go-live; pen test and production invariant checks are go-live gates; owners: accountant sign-off and pen test = Jabran, production invariant checks = the lead (BackEnd `hosting-and-go-live-requirements.md` ERP-Q1–Q3).
  5. Company isolation (review C3): the tenant architecture test covers every service; database row-level security follows by ADR before the first customer; Payroll's rebuild must carry the company column.
- **Two Macs, two leads (Jabran 2026-11-21):** each lead writes what it works on in `.review-channel/claims.md` first; work on different branches; pull before work, push right after; usage thresholds apply per account. **Probation:** until Jabran says the new Mac's lead behaves as expected, it builds only on `phase/4-b2-*` lane branches and does **not** merge to `phase/*` or `main`; after each lane it writes `.review-channel/lane-ready-<lane>.md` (diff range, brief, review files, targeted and full test results with "BUILD SUCCESSFUL" and "0 failed", write-scope check, user-guide and developer pages changed or "none: <reason>"). The old Mac's lead reviews process and result against this file and lessons, writes `.review-channel/lane-verdict-<lane>.md` (MERGE / FIX: list), and the merge to `phase/4` happens only after MERGE. Both leads back up memory to `docs/lead-memory/` (no deletes, newer wins).
- **Standing merge (Jabran 2026-11-22: "if things are approved don't wait for my go to merge, merge them with your sequence, same for both Macs"):** a lane merges to its `phase/*` branch, without waiting for Jabran, as soon as it has (1) the full gate marker (`verify: OK`; the light marker for docs/script-only lanes), (2) the required review files with `Verdict: ACCEPT` (two different reviewers on RISK ranges; money/security lanes keep re-runs and the second, different reviewer), (3) a MERGE verdict file, and (4) no open question for Jabran. Fast-forward through the pre-push hook, one lane at a time in dependency order; then fast-forward Jabran's checkouts, reinstall hooks, remove the worktree and lane branches, record the merge (verdict file, `claims.md` Merged lanes, PROJECT-STATE heads) and tell the other lead which lanes must rebase. Either lead may merge a lane that meets all four; normally the test Mac merges right after its gate and verdict. **Phase PRs too (Jabran 2026-11-22: "don't wait for me to merge PR if verdicts are merged"):** a `phase/*` → `main` PR merges without waiting for Jabran once every lane of the phase has merged, the final full gate on the phase head passes (whole suite, both repos), and the lead's PR verdict file says MERGE; merge it on GitHub with a merge commit (no squash, no force), then fast-forward the checkouts. **Still Jabran's:** drafts that change scope, rules or decisions on workspace `master`, money rules and product scope questions (JABRAN-TODO), and any lane or PR with a FIX verdict, a failed gate or an open decision.
- **Up only while testing, closed right after (Jabran 2026-11-22, both leads):** the local backend stack (`run-all-services.sh`, any mode) and the simulators/emulators run only while a tester agent or Jabran is testing with them; the lead stops them as soon as that testing ends (backend: stop by matching `services/.*/build/libs/.*\.jar` or the script's own stop; simulators: `xcrun simctl shutdown all`; emulators closed), and starts them again on the current `phase/*` head for the next test. Gates and builders never need them (Testcontainers). Also after every gate or builder: no idle Gradle/Kotlin daemons left on its own home (`gradle-job.sh` and `verify.sh` clean up; check with `pgrep -fl 'GradleDaemon|KotlinCompileDaemon'`). Docker infra (`neoerp-postgres`, `neoerp-keycloak`, `neoerp-mailpit`) may stay up (small, holds the dev data).
- **Builder Mac and test Mac (Jabran 2026-11-22; starts when the new Mac has finished TEST-SPEED-1, TEST-SPEED-APP and FIX-APP-B1):** split by machine strength. **New Mac (16 GB) = builder Mac:** its lead runs builders (one repo each); builders compile and run **targeted tests only**, then push the lane branch and write `lane-ready-<lane>.md` without the full-run result; no full `verify.sh` runs and no full backend stack there. **Old Mac (M3 Max, 36 GB) = test and integration Mac:** runs every full gate (`verify.sh`) for both repos under its own locks, hosts the local backend stack and simulators for QA, reviews lanes and writes verdicts, merges after Jabran's MERGE, and **assigns build tasks to the new-Mac lead** (briefs in the repo's `docs/agents/<topic>/`, a line in `claims.md`). The old-Mac lead also builds in parallel (HR/Payroll v2 first) when the gates leave room. Flow per lane: new Mac builds and pushes → old Mac full gate + reviews → verdict → merge (standing merge below). **Updated 2026-11-22 (Jabran: "the builder Mac builds, takes decisions, reviews and fixes, then the target run; so we don't repeat here"):** the **builder Mac owns the whole lane up to the gate**: brief, build, decisions (its rule 2: logged in `lead-decisions.md`, reviewer approval), the fresh reviews (Opus + the second, different reviewer where required; read-only, targeted re-runs only), and the fix rounds; then it pushes and writes lane-ready with the review files. The **test Mac does not repeat reviews**: it checks the lane-ready file and review files (verdict and range lines, fixes applied, scope, no AI attribution), runs the full gate (`verify.sh`), the jar-mode start and the simulator checks where the lane needs them, writes the verdict, and merges (standing merge below). A failing gate goes back to the builder Mac as a fix task. **Parallel builders (Jabran 2026-11-22: "the new Mac lead can run multiple builders in parallel, we should do that"):** the builder Mac runs several builders at once, each on its own lane branch and worktree with no shared files; Gradle stays one job per repo at a time on the 16 GB Mac (L33 locks), so builders mostly read, edit and wait on the lock for their targeted runs; if swap grows or a Kotlin daemon crashes, go back to fewer builders. The old Mac does the same with `scripts/gradle-job.sh` slots (L34). Lanes already in review on the test Mac on 2026-11-22 (TEST-SPEED-1, TEST-SPEED-APP, FIX-APP-B1, BE-JDK21) finish there. Usage limits are shared (one account). A self-hosted GitHub runner on the old Mac is a later option; Actions stay off until Jabran approves it.
- **Lessons register (`docs/lessons.md`, Jabran 2026-11-20):** after every batch or round, new lessons go in as Proposed; Trial lessons get "+/−" evidence per batch; a lesson that helped in 2 batches becomes a Convention (moved into this file or the lead's memory), one that didn't is Dropped with the reason. The lead tells Jabran what moved.
