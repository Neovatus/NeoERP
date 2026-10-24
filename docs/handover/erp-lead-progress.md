# ERP lead — progress and handoff

Owner: Code · ERP lead (trial). **Rewritten 2026-10-22 before a compact.** Read this, then `erp-lead-handover.md` §0, then `erp-lead-decisions.md` (newest at top).

## 1. How I work now (settled)

- **Role (Jabran):** lead over all leads. I decide what leads don't decide, own the joins between modules (contracts, events, ids, shared components, ADRs, shared specs, rig root and shared-area screens, security, CI and infra), and check what's broken. Docs, specs and contracts only, no production code. I commit my own docs (Jabran's identity `jabransiddiqui <jabransiddiqui@outlook.com>`, **no trailers**, named paths only); I never push; Jabran pushes. Review scope (§2b): only shared and security files in a lead's checkpoint, never the module's own work.
- **Leads:** Accounts lead (Claude Code), HR & Payroll lead (Claude Code). Both lead; **implementation is by Codex** (briefed through `<lead>-codex.md` inboxes; Jabran wakes Codex). The Claude mains `accounts-lead-{app,backend,design}`, `hr-payroll-lead-{app,backend,design}` are **paused** (`.paused-*`). Mine: **ERP · Design** (Claude Code, Sonnet, inbox `erp-lead-design.md`), **Codex · ERP backend** (inbox `erp-lead-codex.md`).
- **Listening:** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh erp-lead` (background; restart after every wake; single instance; catch-up). Find open items: every `· <ID> ·` header in `erp-lead.md` without a line in `erp-lead.done.md` (ACC-158/162/165 and ACC-A-22 are handled under a combined line).
- **Models:** set explicitly on every sub-agent; Haiku mechanical, Sonnet drafting/implementation, Opus plans, reviews, security and critical parts.
- **Rules learned:** GitHub Actions are **off** (full local suites of changed services before every push). Never run draft migrations on Jabran's databases. Drafts get committed (Draft status). All design lives in `NeoERP-App/docs/design/`; the domain model in `docs/domain/`. Jabran's machine-client catalog changes need his OK (he tends to say "approve as recommended").
- **Ids:** last message sent **ERP-175**. Workspace repo `Neovatus/NeoERP` (branch master): many local commits, **unpushed** (Jabran pushes).

## 2. In flight (updated 2026-10-24): all other sessions paused (Jabran)

**Jabran, 2026-10-24: every session except the ERP lead is paused** (`docs/inbox/.paused-<stem>` for accounts-lead, hr-payroll-lead, erp-lead-design, hr-payroll-lead-design; the Claude mains were already paused; both Codex sessions idle). Their listeners stay alive but never wake. **Resume one:** `rm docs/inbox/.paused-<stem>`, then tell that session "check your inbox". Next direction under discussion: walk Accounts **flows in the app** with Jabran (fix in the app first, then update the design).

| Session | Last state | Pending when resumed |
|---|---|---|
| **Accounts lead** | HOLD (ERP-199); nothing in flight; all accepted work on origin (dev 4d162dd, dev-app 84902fa8) | Phase 2: Jabran's manual check + "accepted". Phase 3 (B/C) package awaits Jabran's approval; SB2a brief incl. dimension-set migration (ERP-197) held. CP-EV-1c (cutover to OrgEventsV2, one path at a time, ERP-210) after resume. Large-customer gaps answered (ACC-249). |
| **Accounts Codex** | Idle; ACC-246 done (4d162dd) | Its inbox lists older briefs without done lines (ACC-232…244), handled earlier per the lead; the lead re-briefs on resume. |
| **HR & Payroll lead** | Accepted HRP · Design pass 6 (HRP-D-18); stopped | Pass 7 drafted (HRP-117), starts only on Jabran's word. H0 + P0 backend via its Codex (HRP-95) not started. |
| **HRP · Design** | Payroll pass 6 committed (064fbb2b, 39923cd1, 8288590b, c4fdb36d); stopped | Pass 7 (HRP-117); module items from ERP-D-9 (negative margins `.pay-why`, `.field-hint`, inline `.hr-sub`; 44 px width rules in module CSS; "Next step" vs narrow "Open the run" overlap on 8 screens); Payroll definition of done (ERP-230) 6/6 open. Older ids without done lines in its done file (HRP-73…89) are handled history. |
| **HR & Payroll Codex** | Never started | H0 + P0 backend plan (HRP-95), HRP-116. |
| **ERP · Design** | Reported ERP-D-9 and stopped (shared focus token, page head, pointer-based touch height, rig chrome, Payroll sweep + definition-of-done report) | ERP-235 icon-only buttons; ERP-240 button-spec line + nav-vs-action check; re-run genprin (31/32 regress, one stale row); other-module sweeps after Payroll (ERP-222); token clean-up B. Untracked: 1,923 crop PNGs (14 MB) and `styles.css.tmp`; deletion needs Jabran's OK. |
| **Codex · ERP backend** | Idle; CP-EV-1b pushed (9138608) | ORG-FACTS-3 (ERP-205.1, ERP-215) in builds/org-facts-3; then bootstrap backend, DB roles, rescan job. |

**Payroll design status:** shared items done; Payroll definition of done 6/6 open (ERP-D-9: 215 primary-placement, 134 repeated text, 589 hard-coded values, local variants of shared components, top tasks 9/10 current and 6/10 proposed). This is the evidence behind the app-first direction.

## 3. Done recently (for context)

- Design Review Hub live (ERP · Design): View-as bar [Company][Role][Home][Design], "Waiting for you" home, session-aware sidebar/topbar, catalogue of 460 screens with Design system section (live components, tokens), frame view at 1440·1280·1024·768·390 with state picker. Serve: preview "screen-rig" (port 8765; `http://localhost:8765/app.html#designs`), "design-system" (8766).
- UX principles 11–20 added (findability, fewest steps, main task first / collapsible detail, context visible, caution by risk, keyboard-first, accessibility) + exceptions in §4/§6; design-principles.md index adopted and in every read-first list; shared specs consistency pass (19 fixes); one date picker; list width rule.
- Contracts: ORG-FACTS-2 approved and built; ORG-FACTS-3 and OrgEventsV2 **Proposed** (with the leads); bootstrap amendment (company name + country) accepted, not built.
- Infra/shared: file store (CP-FS-1), event library (CP-EV-1), Accounts on the library (CP-EV-2), upload limits and quotas, KMM-Network download/upload, NeoFilePicker.

## 4. Waiting on Jabran

1. Push the workspace repo: `git -C /Users/jabransiddiqui/Offices/Neovatus/NeoERP push`.
2. Wake Codex for ERP-174.
3. Later: decide when to start "designed vs built" and token generation (A).

## 5. My next work (backlog, ERP section of `docs/backlog.md`)

1. Review the consumer checks for ORG-FACTS-3 and OrgEventsV2 as they arrive; then ask Jabran to approve both contracts.
2. Specs for the shared **global search (Ctrl/⌘ K)** and the **personal home** (ux §11–12).
3. Build of the bootstrap amendment (company name + country): needs a builder.
4. File-store re-scan job; restricted DB roles for every service; API conventions page; AuditWording to resources; shell connectivity signal; SE legal profile in the org seed; People rig scroll.
5. **A** one token source generated into app + rig, when an app builder is free.
6. Go-live register (`NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md`): hosting provider, KMS, ClamAV, Actions back on, fileupload2 GA, multi-instance quotas, V35 lock window, btree_gist.
