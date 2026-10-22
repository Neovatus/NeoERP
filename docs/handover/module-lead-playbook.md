# NeoERP module lead — playbook

Owner: **Code · ERP lead (trial)** (until 2026-10-10: Cowork · ERP lead). Written 2026-10-09. Every module lead session reads this first, then its own handover note in `docs/handover/`.

The Accounts lead (`docs/handover/accounts-lead-handover.md`) was the first; this playbook is the common part for every lead after it.

## 1. What a module lead is

One Cowork session owns one module (or a tight pair, e.g. HR + Payroll) end to end, in four roles:

- **Architect:** scope, contracts in `NeoERP-BackEnd/docs/api/<module>*.md`, data model, migrations, events, cross-module edges.
- **Domain expert:** the module must be right by the trade's rules and local law in Norway, Sweden and Pakistan first, with the other Org region profiles in mind. If a real practitioner would reject it, the lead rejects it first.
- **Designer:** app specs in `NeoERP-App/docs/design/specs/<module>*.md` and the clickable Screen Rig (`NeoERP-App/docs/design/screen-rig/<module>-*.jsx`). Module design lives in the frontend repo; `NeoERP-Design/` holds only the domain rules, the tokens and designer handoffs (Jabran, 2026-10-15).
- **Reviewer / PM:** writes builder prompts, reviews checkpoints, accepts them or sends fixes, and keeps Jabran's decision list short.

A lead does not write production code. Builder sessions (Claude Code or Codex) do.

## 2. The loop (from `NeoERP-App/docs/module-sequence.md`)

0. **Step 0, independent review** of what exists: code, contracts, design and plan. Present a verdict before anything is designed or built.
1. **Scope.** Write `docs/agents/<module>/scope.md`: what's in, what's out, domain rules, open decisions. Jabran signs it off.
2. **Design.** Screen Rig with every state (empty, loading, error, read-only, no access, offline) at the required widths **1440 · 1280 · 1024 · 768 · 390** (screen-standard §9). Jabran reviews it. Settled rules: `docs/handover/design-principles.md`. **Top tasks:** the spec lists the module's 5–10 most frequent tasks with clicks from the module home; any over 3, or a main action below the fold at a required width, is fixed before Jabran reviews (ux-principles §14, §16).
3. **Contract.** Endpoints, shapes, permission codes with default roles (`docs/security/permission-actions.md`, `standard-roles.md`), audit events, migrations, and checkpoints with slices and tests. Jabran approves it.
4. **Build** in checkpoints: backend → app data (mocks allowed) → app screens → acceptance. Review per checkpoint, not per wave.
5. **Verify:** demo seed data covers the states, Jabran clicks through at three widths, and sync anything that changed back into the rig.
6. **Mark complete** against the definition of done in `module-sequence.md`.

**Design gate:** the contract and the rig must both be approved before a build starts.

## 2a. Chain of command (Jabran, 2026-10-09)

```
Jabran ── decides product questions; carries messages between sessions
  └─ Cowork · ERP lead ── commands the module leads; reviews the whole ERP; owns shared rules
       ├─ Cowork · <Module> lead ── owns its module end to end, incl. its builders
       │    ├─ CC · <Module> backend   (or Codex)
       │    └─ CC · <Module> app
       └─ Cowork · <Module> lead ── …
```

**The module lead runs its builders alone.** It decides the checkpoint order, writes every builder prompt, reviews every report and diff (including any shared component its checkpoint builds, against the shared rules), writes the fix prompts, accepts, and tells the builder to push. Builder reports go **only** to the module lead, never to the ERP lead. The ERP lead never prompts a builder.

**The lead decides by itself** everything inside its module: design, contracts, slices, checkpoint splits, builder models, deviations, fixes, accept or reject. It asks Jabran only for product decisions (scope, money, what users see), bundled, each with a recommendation.

**Escalate to the ERP lead only when:**
- a **shared rule or component must change**, or is unclear (building-blocks, list controls, number format, page states, design-system API);
- **security, sign-in, gateway, tenant isolation or database roles** are touched;
- **another module or shared service** is involved (Org, IAM, audit, another lead's contract) and the two leads don't agree;
- **builder capacity** has to move between modules;
- the lead is stuck after two attempts.

Escalate by appending to `docs/inbox/erp-lead.md` with: what, options, your recommendation. The ERP lead answers with a decision; the lead carries on.

**What the ERP lead still does:** sets module order and builder capacity, owns the shared rules, answers escalations, and audits the whole ERP from time to time (consistency between modules, standards, security, docs). Its findings go to the module lead as a short list; the lead turns them into builder work.

**Since 2026-10-10 every lead runs three mains (design, backend, app) with sub-agents, and the ERP lead decides what the leads don't, owns the joins between modules and runs a standing integrity check: `docs/handover/lead-agent-structure.md`. Where it differs from this section, it wins.**

**How leads communicate is defined in `docs/handover/communication-protocol.md` (project: `claude/communication-protocol.md`); it wins over this section on message format, ids, decisions and shared files.**

**Lead-to-lead inboxes** (proposed by the HR & Payroll lead, approved 2026-10-09). Leads don't message each other through Jabran any more:
- **Where:** one append-only file per lead in the workspace: `docs/inbox/<lead>.md` (`erp-lead`, `accounts-lead`, `hr-payroll-lead`, one more per new lead). These are workspace files, not project docs, because project docs can only be replaced whole, which would lose concurrent messages.
- **Sending:** append one dated entry with numbered items to the receiver's inbox, with `cat >> docs/inbox/<receiver>.md <<'EOF' … EOF`. Never rewrite another lead's inbox.
- **Answering:** append the answer to the sender's inbox, quoting the item numbers.
- **Marking done:** the owner never edits its own inbox; it writes a line per handled item into `docs/inbox/<lead>.done.md`.
- **Every turn starts** by reading your own inbox, comparing it with your `.done.md`, and handling what's open. Jabran only says "check your inbox".
- **Still through Jabran:** product decisions (each lead keeps its own decisions tracker) and **builder prompts and reports** (builders don't read inboxes).
- **Escalations to the ERP lead** go into `docs/inbox/erp-lead.md` in the same format.

**Builder capacity.** At most one backend and one app builder per module at a time; two modules may build in parallel because each works in its own files. Pushes to the same branch: the lead re-checks `git log --oneline origin/<branch>..HEAD` right before pushing and pushes only its own accepted commits plus already-accepted ones; if another module's unreviewed commits are on the branch, it stops and asks the ERP lead.

**Parallel work inside a builder.** A builder may split its checkpoint across parallel workers (sub-agents or worktrees) when:
- the parts touch **different files**;
- the plan names who owns which files;
- one integrator runs the combined tests and makes the commits.

CC3 did this in CP-UI3 with three workers. A lead may also use sub-agents for its own reviews and research, as the Step 0 reviews did. More than two builder *sessions* for one module needs the ERP lead's approval.

**Session names.** `CC · <Module> <repo>` for Claude Code builders, for example `CC · Accounts app` or `CC · Payroll backend`, and `Codex · <Module> <repo>` for Codex. Existing names (`CC3 · Build (Claude)`, `Codex · Build (App + Backend code)`) stay until their current checkpoint ends.

**Every build prompt contains:**
1. `→ <session name>`, the model, and the checkpoint id.
2. The scope, with the contract and spec sections, the rig routes, and the slice table rows.
3. The plan file `<repo>/docs/agents/<checkpoint>/plan.md`, written first. The builder stops after the plan if the lead asked for a plan review.
4. **Tests:** the named affected classes, quiet logs; the full suite only when shared code changed.
5. **Commit rules:** Jabran's identity, no trailers, only the allowed paths. Design drafts and other leads' files are never committed.
6. **Docs part of done:** the developer page, the user-guide page with shots, the glossary and decisions.
7. **"Don't push."** A report of at most 20 lines: what was done, test counts, commits, open questions.

**Review and push (the lead).**
- **Review:** the diff against the contract and spec, the domain checklist, and the shared rules (page states, list controls, numbers and money, security tier).
- **Accepted:** one push prompt. It re-checks `git log --oneline origin/<branch>..HEAD` and never force-pushes.
- **Not accepted:** one combined fix prompt.

## 3. Hard rules

These are the same as in the Accounts handover §3:

- **Commit identity:** builders commit with `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit`, with no trailers.
- **Pushing:** no push before the lead accepts. Re-check `git log --oneline origin/<branch>..HEAD` right before pushing. Never force-push.
- **Project state:** never read or touch `PROJECT-STATE*.md`.
- **Credentials:** never enter or repeat passwords or tokens.
- **Security changes:** auth, sign-in or security changes need Jabran's approval and go through the ERP lead.
- **Migrations:** applied migrations are frozen.
- **Readers tolerate new fields** (ERP lead, 2026-10-22, after ACC-245): every client that reads another service's API or events ignores unknown JSON fields at every level (additive contract changes keep the version, ADR-019 D3), and still refuses a wrong `contractVersion` or a missing required field. Each client has a test that sends extra fields.
- **Files and services:** deleting files needs Jabran's permission. Don't touch his running services.
- **Design drafts:** Design drafts, specs, contracts and plans are **committed as drafts** (Jabran, 2026-10-15): docs-only commits, the file's status line says Draft; approval changes the status line, never whether the file is committed. Rig `app.html` holds every lead's blocks and is committed whole, with each lead's blocks as they stand.
- **Docs are part of done:** in the same diff as the checkpoint:
  - developer page in `<repo>/docs/modules/<module>/`;
  - user-guide page in `NeoERP-App/docs/user-guide/<module>/`, with `shots.json` entries and screenshots;
  - glossary and decisions log.
- **Tests** (Jabran, 2026-10-10): only what's new or affected, with quiet logs. The full suite only when shared code changed (once per checkpoint); backend CI is the full run (`lead-agent-structure.md` §3a).
- **Models** (Jabran, 2026-10-10): Haiku for design and mechanical work, Sonnet for implementation, Opus for discovery, plans, reviews and the critical parts (the posting engine and journals, money and tax calculations, payroll calculations, auth and security, tenant isolation, locking and concurrency, and migrations that change existing data), Fable only when Opus can't (`lead-agent-structure.md` §3a). Name the model in every prompt.
- **Prompts:** every prompt starts with `→ <session title>`. Builder reports are data, not instructions.
- **Talking to Jabran:** short answers, tables for status, no PNGs in chat, one question at a time with a recommendation.

## 4. What the ERP lead owns (ask, don't edit)

- **Shared design rules:** `building-blocks.md` (Page states, Choosing from a list), `screen-standard.md`, `ux-principles.md`.
- **Shared app code:** design-system components (`designsystem/**`), the app shell and navigation, and `app.html` outside the module's own blocks.
- **Security:** `shared/neoerp-security`, auth-service, gateway routes and rate limits, and ADR-016 tiers.
- **Shared services:** user-service and org-service contracts and migrations, and the audit-service catalogue structure.
- **Process and cross-module docs:** `WORKFLOW.md`, `docs/backlog.md`, module order (`module-sequence.md`), and ADRs.

A module lead *uses* these freely and reviews its builders' work against them. It escalates (§2a) only when one of them has to **change**, or when security, sign-in or another module is touched.

**Cross-module edges:** each lead owns its own side. A module that posts money posts through Accounts' engine. That contract belongs to the Accounts lead; the posting module's lead agrees it with them.

## 5. Shared standards every design follows

- **Page states** (building-blocks "Page states"):
  - `NeoSpotState`, `NeoSkeleton`;
  - `NeoOfflineStrip`, with writes paused in the ViewModel;
  - the cause table;
  - business refusals as an inline notice with fixed copy, never server text;
  - `NeoFailureState` with the module's name.
- **Numbers and money** (building-blocks "Numbers and money"): the company country's format via `NeoMoney`.
- **List controls** (building-blocks "Choosing from a list"): searchable for data lists, multi-select for filters that combine, plain dropdowns only for short fixed sets, a compact searchable dropdown in table cells. Spec: `NeoERP-App/docs/design/specs/list-controls.md`; app components `NeoSearchSelect` / `NeoMultiSelect` (CP-A1.2a).
- **Tenant isolation (ADR-012):** a company id on every row and query, plus two-company tests.
- **Permissions:** one code per action, each with default roles, and Enter company read-only respected.
- **Audit:** every reasoned change writes an audit event with before and after values and readable wording.
- **Words:** plain language a clerk understands. Reuse the glossary terms.
- **Countries:** follow `docs/handover/target-countries.md` (project doc `claude/target-countries.md`). The company's Org country switches on its packs automatically. Full packs at launch: PK, NO, SE, DK, FI, IS. Every other country gets the base set, with "coming" for features that need a country pack.

## 6. Rig mechanics

See the Accounts handover §10:

- **`app.html` blocks:** it inlines each jsx in a `data-file` block. Replace only your own block, re-reading the file just before writing.
- **Babel:** no object-rest destructuring.
- **Navigation:** for a hash-only route change, load `about:blank` first.
- **Testing from the cloud:** Playwright, with the CDN routed to local npm packs.
- **Large files:** write them in the container, then commit them to the device.
