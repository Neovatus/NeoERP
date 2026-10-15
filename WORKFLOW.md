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
Final Approval always pauses. Commits follow the approved commit scope; pushes
require explicit authorization. Updating state never grants implementation approval.

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

- **Two sessions, two jobs.**
  - The local session (Claude Code on Jabran's Mac, or Codex) is the **implementer**. It builds, compiles, runs the tests and services, and commits.
  - The cloud Cowork session is the **designer and reviewer**. It writes specs, the rig and contracts, and it reviews the implementer's commits.
- **The review hand-off.**
  - After each batch, the implementer prints `review <first>..<last>` for each repo.
  - Jabran passes that to the reviewer.
  - The reviewer returns findings ranked by severity. The implementer fixes them and recompiles.
  - This review counts as the Independent Reviewer stage. It is not self-review.
- **The lead stays responsive.** The main agent talks with Jabran, plans, delegates, reviews and reports. Real work goes to sub-agents or background jobs, so Jabran's questions are answered while work runs. Keep a visible task list with progress.
- **Parallel by files.** Run independent work as parallel workers, split so no two workers edit the same file. The lead integrates shared files.
- **Models (Claude):**
  - **Opus 5.5:** planning, design, contracts and every review. It also implements anything that needs decisions or complex logic, and helps the Sonnet implementer when it is stuck.
  - **Sonnet 5.5:** the default implementer for work fully specified by an approved contract (endpoints, DTOs, app data layers, screens from an approved rig).
  - **Haiku 5.5:** clearly defined tasks only: renames, doc and backlog updates, demo data and seed scripts, summaries, simple mechanical fixes.
  - **Fable 5.1:** only the most critical problems: two identical failures at high effort, or a hard concurrency, security or data-integrity bug.
  - **Hard rule:** anything touching money, security or auth, locking or concurrency, or migrations is implemented or co-implemented by Opus. Sonnet and Haiku work always gets an independent Opus review before it lands. (Jabran, 2026-10-08)
- **Loop for each piece of work:** spec and rig → Jabran approves → contract → backend and app slices in parallel → review → Jabran compiles and checks on devices.
- **Approval.** When Jabran approves a spec and its contract, the slices the contract lists are approved for implementation. That includes their Flyway migrations and commits. Pushes, login or sign-in changes, and anything outside those slices still need his explicit approval.
- **Current state and next work:** see `NeoERP-App/docs/HANDOFF.md` and the owning `docs/agents/<task>/plan.md`.

## Guardrails against agent loops (2026-10-06)

Agents must not circle. These apply to every implementer and reviewer.

- **Design is frozen at commit.** The committed spec, contract and rig are the
  source of truth. Implementers do not redesign; a needed change is a one-line
  change note to the reviewer, who decides.
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
  tried, escalate (Fable 5.1, then the reviewer, then Jabran). No third blind retry.
- **Time box.** A job that has not produced a green test or a clear blocker
  within its box reports back instead of continuing.
- **One owner per decision.** Product calls: Jabran. Design and architecture:
  the reviewer. Implementation detail inside the contract: the implementer.
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
  - The gate per wave is mechanical: the named tests are green, the full suites and
    `:architecture-tests` are green, and the money/security checks in the contract are run.
  - Sonnet works with an **Opus self-check** at the end of each wave. That is one short pass over the wave's diff in the
    implementer session, not a separate review job.
  - The implementer writes to the channel only for a contract question or amendment, a blocker, or
    two strikes. It does not post a status message per wave.
- **At a checkpoint:**
  1. **One** independent Opus review of the whole checkpoint diff, scoped to the
     contract sections that diff touches.
  2. The implementer fixes the findings and posts **one** review-request entry: the range, test counts, the review
     verdict, and any rulings needed.
  3. **The reviewer's round:**
     - *Risk-flagged* checkpoints (money posting, numbering, locking or
       concurrency, security/auth, migrations, isolation) get one reviewer round.
     - *Other checkpoints* are accepted on test names and the independent review's verdict, with no extra round.
  4. Push after acceptance. Jabran clicks through user-visible checkpoints.
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
  - **At a checkpoint, before push:** run the full suites of every touched service, the library, `:architecture-tests` and the app's `jvmTest`, once. Load and concurrency tests run at the checkpoint, or when the engine or locking code changed.
  - **Reports state the scope that was run**, e.g. "accounts: 3 classes, 41 tests" or "full suite 342/0". A failure in an unrelated test is recorded and the work moves on: it doesn't block, unless the change could have caused it.
- **Test output costs tokens; keep it out of the context.**
  - Run Gradle quietly (`-q --console=plain`). Send the full log to a file under the build directory, never into the conversation.
  - Read back only the summary (passed/failed counts per module) and, for failures, the test name with the first assertion message and up to 20 lines of stack.
  - Never paste whole test reports, compile logs or `--info` output.
  - Prefer one test command per wave over many small reruns. Rerun only the failing classes (`--tests`).
  - A long failure log can be triaged by a Haiku subagent that returns the cause in a few lines.
  - Testcontainers and load tests run in the background and report only their result.
- **Cost rules for reviews:**
  - Read the diff and the named contract sections only, never the whole repo.
  - One reviewer per checkpoint, not one per slice or one per dimension.
  - Re-review only the fixes (the two-round rule above still applies).
  - Docs-only or mechanical changes are accepted on a skim.
- **Design reviews:** a design is reviewed once before Jabran approves it, and again only if it
  changes. Drafts for later slices are not re-reviewed until that slice is next.

## Context limit: hand off before it fills (Jabran, 2026-10-08)

Every agent session, the implementer's and the reviewer's included:
- **At about 80 % of the context window**, stop taking new work and finish the current small step.
- **Write a handoff note** (≤ 60 lines) in `.review-channel/handoff-<role>.md`. Replace it, don't append. It holds:
  - the current checkpoint and slice;
  - what is done (commits), what is in progress, and the exact next step;
  - open rulings, entry numbers and branches;
  - anything uncommitted;
  - the rules that matter for the next step.
- Then **compact the context, not the session**:
  - **Claude Code:** run `/compact` with a focus line, e.g. `/compact keep: handoff-implementer.md, current checkpoint, open entries`.
  - **Cowork:** compaction happens automatically. Keep the handoff note current at every checkpoint, so nothing important exists only in the conversation when it compacts.
  - After compacting, re-read `WORKFLOW.md` and the handoff note before continuing.
  - A fresh session is only needed when compaction has happened several times and quality drops.
- **Don't wait for the automatic compaction at 100 %** in the middle of a wave or a review: details get lost and mistakes repeat.
- **Hand off at natural boundaries** (end of a wave, a checkpoint or a review) even below 80 % when the next piece of work is large.

## Communication by prompt (Jabran, 2026-10-08)
- The `.review-channel/to-*.md` files are **retired**; their history is in `.review-channel/archive/`, read only when someone refers to an old entry.
- **Reviewer → implementer:** the reviewer gives Jabran one short prompt. Jabran pastes it into the implementer session.
- **Implementer → reviewer:** the implementer ends its work with one short report (commits or range, the test scope run with counts, rulings needed, the review verdict). Jabran pastes it to the reviewer.
- Keep both short: decisions and instructions, no restated history.
- `.review-channel/handoff-<role>.md` stays, for compaction.

## Canonical state and reference

The user approved the three-file split and placement on 2026-09-06.
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
