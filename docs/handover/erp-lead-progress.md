# ERP lead — progress and handoff

Owner: Code · ERP lead (trial). **Rewritten 2026-10-22 before a compact.** Read this, then `erp-lead-handover.md` §0, then `erp-lead-decisions.md` (newest at top).

## 1. How I work now (settled)

- **Role (Jabran):** lead over all leads. I decide what leads don't decide, own the joins between modules (contracts, events, ids, shared components, ADRs, shared specs, rig root and shared-area screens, security, CI and infra), and check what's broken. Docs, specs and contracts only, no production code. I commit my own docs (Jabran's identity `jabransiddiqui <jabransiddiqui@outlook.com>`, **no trailers**, named paths only); I never push; Jabran pushes. Review scope (§2b): only shared and security files in a lead's checkpoint, never the module's own work.
- **Leads:** Accounts lead (Claude Code), HR & Payroll lead (Claude Code). Both lead; **implementation is by Codex** (briefed through `<lead>-codex.md` inboxes; Jabran wakes Codex). The Claude mains `accounts-lead-{app,backend,design}`, `hr-payroll-lead-{app,backend,design}` are **paused** (`.paused-*`). Mine: **ERP · Design** (Claude Code, Sonnet, inbox `erp-lead-design.md`), **Codex · ERP backend** (inbox `erp-lead-codex.md`).
- **Listening:** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh erp-lead` (background; restart after every wake; single instance; catch-up). Find open items: every `· <ID> ·` header in `erp-lead.md` without a line in `erp-lead.done.md` (ACC-158/162/165 and ACC-A-22 are handled under a combined line).
- **Models:** set explicitly on every sub-agent; Haiku mechanical, Sonnet drafting/implementation, Opus plans, reviews, security and critical parts.
- **Rules learned:** GitHub Actions are **off** (full local suites of changed services before every push). Never run draft migrations on Jabran's databases. Drafts get committed (Draft status). All design lives in `NeoERP-App/docs/design/`; the domain model in `docs/domain/`. Jabran's machine-client catalog changes need his OK (he tends to say "approve as recommended").
- **Ids:** last message sent **ERP-175**. Workspace repo `Neovatus/NeoERP` (branch master): many local commits, **unpushed** (Jabran pushes).

## 2. In flight (updated 2026-10-23 22:15; stop for today after current work, ERP-241/242)

**Development paused except design-independent backend; design: Payroll first, then other modules after Jabran approves Payroll.**

| Who | State |
|---|---|
| HRP · Design | Payroll pass 6 (HRP-114) finishing → report HRP-D-18 → stop for today. Definition of done: ERP-230 |
| ERP · Design | Focus token, rig chrome, Payroll proof harness → report → stop. Queued for tomorrow: icon-only buttons (ERP-235), label check (ERP-240) |
| Codex · ERP backend | CP-EV-1b pushed (9138608). ORG-FACTS-3 (ERP-205.1) next in builds/org-facts-3; then bootstrap backend, DB roles, rescan job |
| Codex · HR & Payroll backend | H0 + P0 plan (HRP-95), lead reviews |
| Accounts | HOLD; Phase 2 needs Jabran's manual check; Phase 3 needs approval |

**Tomorrow:** (1) my re-check of Payroll against ERP-230; (2) Jabran reviews Payroll; (3) Jabran decides the direction proposed 2026-10-23: rig settles patterns on ~15 core screens, then shared Compose components and Accounts screen by screen in the app (needs app-work pause lifted); (4) web access stays an open roadmap decision (Next.js/React possible).
**Rules added today:** persistent builds/ folder (never /tmp), Payroll definition of done, labels say what happens, field focus token, touch height by pointer, context shown once, no negative margins under titles.

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
