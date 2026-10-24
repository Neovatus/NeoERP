# ERP lead — decisions and open items

Owner: **Code · ERP lead (trial)** (until 2026-10-10: Cowork · ERP lead). Each line is a decision, with the date and who took it. Module leads follow these. Newest at the top.

## 2026-10-10 · Code · ERP lead (trial)
- **Trial start (Jabran):** the ERP lead runs as the Claude Code session "Code · ERP lead (trial)"; same code ERP and inbox. Registry updated; FYI ERP-16 (ACC), ERP-17 (HRP).
- **PS-13 withdrawn (ERP lead, HRP-10):** D-85/D-97 stand. PK EOBI/PESSI/SESSI stay on `EMPLOYER_CONTRIB_PAYABLE` (employee and employer shares together), `payeeRef` required on every PK fund line; no new roles in pack 2026.2. Answered ERP-18 (HRP), ERP-19 (ACC).
- **Shared-area rig screens (Jabran / Cowork ERP lead, protocol §7):** Org, People/IAM, Roles and Activity rig screens are edited only by the ERP lead; leads send a `REQUEST`. FYI ERP-20 (ACC), ERP-21 (HRP).
- **2026-10-24 (Jabran): neoerp-workflow skill gets a UI lane** (both copies, commit 133d272d): visual/design-system work without behaviour, data, permission or security change runs plan → change → compile → commit → report, no gates, no reviewer; the full pipeline stays for everything else. Skill also states the PROJECT-STATE override.
- **2026-10-24 (Jabran): no per-change independent review for UI work**; reviews only for critical parts (money/tax/payroll, posting, auth/security, tenant isolation, data-changing migrations). Jabran reviews screens; ERP lead checks reports (ERP-246, lead-agent-structure §3a).
- **2026-10-24 (Jabran): app builder works in the main app checkout** so Jabran sees changes live with Hot Reload (ERP-245): compile checks only there, no Gradle tests while Hot Reload runs, own files only, commit per fix, no push. (The persistent-builds rule stays for backend work, where migrations make the main checkout unsafe.)
- **2026-10-24 (Jabran): app-first, shared layer first.** Pause lifted for the app's shared design-system fixes (ERP-243, my Codex, audit `app-shared-audit-2026-10-24.md`); then Accounts flows walked in the app with Jabran. **No new screenshot tests: Jabran reviews screens himself**; builders run compiles and existing tests only.
- **2026-10-24 (Jabran): all other sessions paused** (pause files for accounts-lead, hr-payroll-lead, erp-lead-design, hr-payroll-lead-design; Codex idle). Status and pending per session in `erp-lead-progress.md` §2. Next: Accounts flows reviewed in the app with Jabran, design updated after.
- **2026-10-23 (Jabran): design stays platform-neutral; web may come in another technology** (e.g. Next.js / React, not necessarily a KMP web target). Therefore: the backend owns every business rule (the KMP app shows and asks, the server decides; no rule only in client code); API contracts, one token file, behaviour-level component specs and screen specs are the design source for any client; the rig (HTML/React) stays the clickable reference. Compose remains the one place screens are built now. Web access for large customers is an open decision on the large-customer roadmap.
- **2026-10-23 (Jabran, direction): stop pixel-polishing every rig state.** The rig settles patterns on the core Payroll screens (~15); approved patterns go into component and screen specs, then into the app's shared Compose components; screens are built and checked in the app (screenshot tests at every width + the rig's checks), Accounts first, screen by screen; Jabran reviews real app screens. Needs the app-work pause lifted (pending Jabran's go).
- **2026-10-23 (Jabran): labels say exactly what happens.** Navigation buttons say "Continue to …" / "Open …"; action buttons name the action; never one dressed as the other. Next-step buttons on Payroll cards land on that step's section (ERP-237..240).
- **2026-10-23 (Jabran): Payroll definition of done** covers all rules, not only navigation: ux-principles §1–20, screen-standard in full, building-blocks and shared component specs, tokens only, no visual defects, copy rules; every screen, every state, every required width; designers report item by item; ERP lead re-checks before Jabran reviews (ERP-230, ERP-231). The same list is the bar for every later module.
- **2026-10-23 (ERP lead, after Jabran's remark): field focus.** Text fields, text areas and selects show one focus style: border in a dark-grey token `focus/field` plus the soft halo; no black outline on fields. The 2 px black ring stays for borderless controls (buttons, links, tabs, rows) on keyboard focus (ERP-225).
- **2026-10-23 (Jabran): Payroll is the design pilot module.** Payroll gets every fix first (navigation pilot, visual-defect sweep, shared page head, context-line and overlap fixes, principles fix list); Jabran approves Payroll; only then do HR, Self-service, Accounts and Platform follow, one module at a time (ERP-220..223).
- **2026-10-23 (ERP lead, ux §17): context shown once.** Company, country and currency live in the top bar; under a page title one line with branch scope + period + the page's own facts, never repeating company or currency (ERP-216, after Jabran found overlapping context lines on HR/Payroll pages).
- **2026-10-23 (ERP lead): CP-EV-1b recovered and re-accepted** as 9dd5d84, c0a4d6f, 9138608 (builds/cp-ev-1b), rebuilt byte-for-byte from Codex's session logs, all five suites green, review clear (ERP-C-7, ERP-214).
- **2026-10-23 (ERP lead): lost work and new checkout rule.** A Mac restart at 08:31 emptied `/private/tmp`, deleting Codex's checkouts with accepted, unpushed CP-EV-1b and in-progress ORG-FACTS-3. Rebuild from Codex's session logs (ERP-213). Rule: isolated checkouts in `/Users/jabransiddiqui/Offices/Neovatus/builds/<checkpoint>` with a git bundle after each commit; never /tmp; accepted work pushed promptly (main-agent-handover §4).
- **2026-10-23 (ERP lead): CP-EV-1b accepted** (661a7d6, 722addf, b565668): OrgEventsV2 feed, V36/V37, `org.events.read` for accounts/hr/payroll, poison-row parking, savepoint recovery; 5 suites green incl. accounts-service; own Opus review + Codex's independent review clean. Push by Jabran from the isolated checkout. Accounts cutover CP-EV-1c must run one feed path at a time (ERP-210).
- **2026-10-23 (Jabran): Codex continues backend work that doesn't depend on the design** while the pilot runs: ERP queue ERP-205 (ORG-FACTS-3 Org side, bootstrap name + country backend, restricted DB roles for every service, file-store rescan job), HR & Payroll H0 + P0 backend (ERP-206). Screens, App work and Accounts Phase 3 stay on hold; local commits only, pushes after acceptance.
- **2026-10-23 (Jabran): exception to the pause:** CP-EV-1b (OrgEventsV2, Codex · ERP backend) continues, because it doesn't depend on the design under review; commit locally, no push (ERP-204).
- **2026-10-23 (Jabran): development paused while the design is evaluated; only the navigation pilot runs.** Recording decisions comes first. No build work in any repo (Accounts Phase 3 / SB2, HR & Payroll H0 + P0, CP-EV-1b, Accounts Codex follow-ups); work in flight is committed locally if green, not pushed, and reported (protocol §14 HOLD). Design work is limited to **ERP · Design's Payroll navigation pilot (ERP-193)**; ERP · Design's B and slice 6 and HRP · Design's batches wait until Jabran has reviewed the pilot. HOLD sent: ERP-199 (ACC), ERP-200 (HRP), ERP-201 (Codex · ERP backend), ERP-202 (Accounts Codex), ERP-203 (ERP · Design: pilot only).
- **2026-10-22 (ERP lead's own decisions, for the record):**
  - **Readers tolerate new fields** (playbook §3, after ACC-245): every reader of another service's API or events ignores unknown fields and has a test with extra fields.
  - **Approval card AC-4:** Approve asks nothing, then an Undo toast for 10 s; a whole pay run, payment batch or posting confirms once with the figures (`approval-card.md`).
  - **Principles audit:** lists go to leads only after the harness fixes and a full re-run (done, ERP-D-7: 132 of 480 screens need fixes); lists are **held** until Jabran decides the navigation rule.
  - **Navigation pilot** in Payroll first (ERP-193): areas only in the sidebar (collapsible: icons + text / icons only), no duplicate area tab bars, statuses as chips, tabs only inside a record, breadcrumb, collapsible sections, phone bottom bar; behind a View-as switch; the rule is written only after Jabran reviews.
  - **Shared `app.html`:** fresh read before every write, own blocks only, others byte-equal before commit (ERP-181).
  - **Dimension storage:** Accounts stores a `dimension_set_id` per distinct combination; lines and balances reference it; branch stays a column (ERP-197, ADR-021 D8). Other services store the expanded set. **`DimensionSetV1` names frozen:** branchId, stockLocationId, departmentId, costCentreId, projectId, itemId, free1Id to free4Id (ERP-198).
  - **Salary grades owned by Payroll** (range, midpoint, per pay group, dated); HR positions carry the grade id and show the name only (ADR-022 Q6).
  - **Budget events:** `budget approved` / `reopened` belong to stage 1 (for ADR-023); threshold and exceeded are stage 2.
  - **Listener:** catch-up by open ids (no lost messages), `listen.sh --status`, and a Stop hook (`.claude/settings.json` → `listen-check.sh`) that reminds a session to restart its listener.
- **2026-10-22 (Jabran), expense claims and ADR order:** expense-claim flow as the ERP lead recommended: employee submits in self-service (receipt photo per line, category → account, mileage and per-diem rates from the country rules, checks for missing receipt, over-limit and duplicates) → **line manager approves** (from HR reports-to; always first) → **second approval only when needed** (above a company amount or on a policy exception, to the cost-centre or budget owner; HR only if the company adds it for exceptions) → **Accounts checks, releases and posts** (receipts, VAT, accounts, dimensions; can return a line with a reason) → **payment split by tax:** tax-free parts paid by Accounts in the next payment batch; taxable parts (above legal rates, taxable allowances) go to **Payroll** in the next run and its filings. Rules: nobody approves their own claim; the approving manager can't also release the payment; delegation while away; reminders and escalation; lines carry the employee's department, cost centre and project; receipts kept per country retention. Later: company cards, receipt reading, cash advances. ADR order approved: 021 → 022 → 023 (each Accepted after the gap lists and scope approval).
- **2026-10-22 (Jabran), reports:** standard module reports, cross-module standard reports and dashboards are in the base product; self-service analysis, scheduled reports and the Power BI feed are a paid ANALYTICS add-on (ADR-023 Q7).
- **2026-10-22 (Jabran), large customers:** NeoERP serves large companies too; large-customer features are optional per company, off by default (`docs/large-customer-roadmap.md`). ADR-021 dimensions, ADR-022 budgets (stage 1 Accounts-only incl. import and driver lines; stage 2 spending control with Purchasing), ADR-023 reporting drafted (Proposed). **Projects** module will come: project is a dimension from now. **Expense claims:** employee submits (ESS), team manager and/or HR approve (company's choice), Accounts checks, releases and posts (or Payroll pays with salary). Accounts-only companies that import sales/purchases are supported (imports and integration API carry dimensions). Budget reports by month, quarter, half-year, year, YTD, rolling 12, with comparisons and dimension filters. Salary grades owned by Payroll. Navigation pilot in Payroll first (ERP-193).
- **2026-10-22 (Jabran): ORG-FACTS-3 and OrgEventsV2 approved** after both consumer checks (ACC-245, HRP-82); ORG-FACTS-3's deploy gate (ACC-246) cleared, on origin/dev as 4d162dd. Shared rule: readers tolerate new fields (playbook §3).
- **2026-10-22 (Jabran, after the principles audit ERP-D-5):** (1) **Expandable module entry in the sidebar**: a module's sidebar entry expands to its areas (HR: people, departments/positions, leave, …; Payroll: runs, payslips, employee pay, filings, …), so each area is one click from anywhere; shared shell, built by ERP · Design (ERP-187), modules supply their area list. (2) **Payroll Post asks once**: Post shows one confirm with the run's totals (gross, net, employer cost, number of payslips, company and period) before posting; posted money is reversed with a reason, never deleted (ux §18); HR & Payroll lead (ERP-188). (3) Audit lists go to leads only after the harness fixes and a full re-run (ERP-186).
- **2026-10-22 (Jabran, "all as recommended"):** (1) `MachineClientCatalog`: new scope `org.events.read` (audience org-internal) for accounts, hr and payroll; `org.events.replay` issued to nobody. (2) **CP-EV-1b built by Codex · ERP backend** (brief ERP-174). (3) Design quality: **C** principles 11–20 audit of all 460 rig screens with per-module fix lists, and **B** tokens-only clean-up of the rig plus a check blocking hard-coded values, by ERP · Design now (ERP-175); **A** one token source (`neoerp-tokens.json`) generated into the app's Kotlin tokens and the rig's CSS, with a drift test, later when an app builder is free. Also: ORG-FACTS-3 and OrgEventsV2 contracts Proposed, with the leads for their consumer checks (ERP-170..173).
- **Design review approach (Jabran, 2026-10-21): option A.** The Screen Rig works like the product: a pinned "View as" bar [Company ▾][Role ▾][Design] (company drives country, language, formats, packs; role picks the demo persona, or "Shown as Owner"), the real home dashboard and sidebar, plus a design catalogue (module → feature → screen, status, widths, states); review mode with checklist, comments and Approve later. **ERP · Design** (Claude Code session, inbox `erp-lead-design.md`, Sonnet for the hub build) builds and maintains it and keeps the whole rig consistent with the 20 principles. Figma only if a human designer joins; a designed-vs-built view from app screenshots later; real-user tests before launch.
- **UX principles 17–20 (Jabran, 2026-10-21):** context always visible (company/branch/period/currency); caution in proportion to risk (undo / confirm once / reverse, never delete posted money); keyboard-first data entry; accessible by default (WCAG 2.2 AA). Fast feedback folded into §14, help in place into §15. ERP-155.
- **UX principles 11–16 (Jabran, 2026-10-21):** work comes to you; find anything two ways (menu + Ctrl/⌘ K search); you always know where you are; fewest steps (≤ 3 clicks for frequent tasks); recognise, don't remember; the main task first, the rest folds away (collapsible, remembered). Plus a top-tasks check in every rig review. In ux-principles.md, design-principles.md, playbook §2. ERP-154.
- **Machine-client entries (Jabran, 2026-10-20, as the ERP lead recommends):** hr-service gains `notification.command.write` (HRP-20.4, CP-H2.6) and `payroll.run-coverage.read` (HRP-61.2), each pinned to the hr client only. Built in the checkpoints that need them, under ERP review. ERP-153.
- **UX principle exceptions (Jabran, 2026-10-20, on the ERP lead's recommendation):** ux §6: read-only module/feature rows show status pills (§1 tag words, same place as the switch); ux §4: settings in force may use an inline control that only opens the reason gate (no change until saved, cancel reverts, destructive variant for off; creating stays a form). Also: design consistency pass (19 fixes) and design-principles.md adopted as read-first. ERP-150.
- **GitHub Actions off (Jabran, 2026-10-16):** Actions minutes ran out, so CI is disabled (done by Jabran 2026-10-16 in the repo setting; NeoERP-BackEnd is the only NeoERP repo with a workflow). Builders now run the full suites of every service or module changed in a push locally before it, plus architecture-tests when ports or repositories change, and report counts. The workflow file stays for later. KMM-Module's publishing workflows are left on unless Jabran decides otherwise. ERP-143 (ACC), ERP-144 (HRP).
- **NeoERP-Design removed (Jabran, 2026-10-15):** all design (rig, specs, design system, screen notes) in `NeoERP-App/docs/design/`; the domain model (`RULES.md`, `FLOWS.md`, `flows.json`, `IMPLEMENTATION-READINESS.md`) in the workspace's `docs/domain/`. Supersedes option A's split. Path sweeps ERP-121/122.
- **Design homes (Jabran, 2026-10-15, option A):** `NeoERP-Design/` = domain rules, tokens, designer handoffs (rarely changes); `NeoERP-App/docs/design/` = all module design (rig + specs), committed with the code. No new module screens in `NeoERP-Design/`. Written in CLAUDE.md, .codex/CODEX.md, playbook. ERP-118 (ACC), ERP-119 (HRP).
- **Agent folders tracked (Jabran, 2026-10-15):** every `agents/` / `agent/` folder is committed in every repo; each repo's `.gitignore` re-includes `docs/agents/`, `.claude/agents/`, `.codex/agents/` against the global ignore. ERP-115 (App), ERP-116 (Backend), ERP-117 (HRP FYI).
- **Commit drafts (Jabran, 2026-10-15):** Design drafts, specs, contracts and plans are **committed as drafts** (Jabran, 2026-10-15): docs-only commits, the file's status line says Draft; approval changes the status line, never whether the file is committed. Rig `app.html` holds every lead's blocks and is committed whole, with each lead's blocks as they stand. Replaces "design drafts stay uncommitted until approved". ERP-109 (ACC), ERP-110 (HRP).
- **DENY carry for import paths (ERP lead, 2026-10-15, ACC-144):** a DENY of `ACCOUNTS.JOURNAL.CREATE` carries onto every code that creates journals another way (`ACCOUNTS.SIE_IMPORT.RUN`, `ACCOUNTS.JOURNAL.IMPORT`, future imports), resolved in user-service with a test per code. ERP-105.
- **Local S3 server (ERP lead, 2026-10-15):** SeaweedFS (Apache-2.0), digest-pinned, for Compose and the Testcontainers kit, because MinIO no longer publishes free images; ADR-020 amended; the adapter stays vendor-neutral. Fallback for tests: Adobe s3mock. ERP-92.
- **Jabran, 2026-10-15: "do it with your recommendation" for the items waiting on him:**
  - **`auth_time` in the access token: yes.** Standard OIDC claim, set at sign-in and kept unchanged on refresh. Built in the IAM foundation work by ERP · Backend (sign-in change approved by this decision). Until then ESS bank changes are refused with `REAUTH_REQUIRED`.
  - **C3 UI languages:** English first; Norwegian (bokmål) and Swedish screens before the Nordic launch; Danish, Finnish and Icelandic when their markets start; Urdu not planned. All copy goes through string resources from now on.
  - **C4 hosting:** one EU/EEA region for all Nordic companies (meets NO with notice and FI inspection); Iceland handled by an arrangement with the provider so records are reachable from Iceland and a copy is held there within 6 months; Pakistan a separate region with its own keys, decided before its first customer. Vendor choice records region, DPA and sub-processors.
- **ORG-FACTS-2 approved (Jabran, 2026-10-14, ACC-106).** Built by Codex · Accounts backend; ERP lead review: accepted after fixes, full org-service green 371/0 (ERP-85, ERP-86). No auth-service change needed: hr and payroll already hold `org.facts.read` (MachineClientCatalog since e74e531).
- **HR bank-details contracts (ERP lead, 2026-10-14):** audited reveal endpoints, ESS re-auth (`REAUTH_REQUIRED`, max sign-in age 5 min) and a notice, one model for HR-made changes; bundle 1 cleared (ERP-82/83). Notifications get an EMAIL channel (SMS later) under ADR-016 outside-calls rules, built in audit-service by the HRP backend builder under ERP review. **Open for Jabran:** `auth_time` in the access token (sign-in change).
- **ORG-FACTS-2 complete (ERP lead, 2026-10-13):** consumer checks done (ACC-90, HRP-30); adds `companyCode`, `legalNameSet`, `demoCompany` (seed-only; always false outside local/demo), inactive branches `found:true, active:false`, Tromsø `TRO` zone 4a, PK province seed. Payroll codes `PAYROLL.CONFIDENTIAL.READ`, `PAYROLL.PAYEE_PAYMENT.CREATE/.READ` and Accountant `PAYROLL.FILING.READ` (totals only) approved (ERP-78).
- **Codex (Jabran, 2026-10-13):** Codex builds Accounts Phase 2 as **Codex · Accounts backend** under the Accounts lead: briefs in `docs/inbox/accounts-lead-codex.md`, reports to the Accounts lead (ACC-C-n), never directly to Jabran; one backend builder per module still holds; Jabran wakes it. Codex may also be used as an independent read-only reviewer for critical parts. `lead-agent-structure.md` §3c. ERP-75 (ACC).
- **KMM-Network change (Jabran, 2026-10-13, via ACC-85; confirmed by Jabran to the ERP lead directly):** option A: one additive streaming call in `Neovatus/KMM-Module` KMM-Network, built by Accounts · App directly on `main` as CP-NET-1. Existing calls unchanged; one auth path; ERP-69.2 conditions apply; ERP lead OKs the KMM-Network and core/network commits before any push.
- **Explicit sub-agent models (Jabran, 2026-10-13):** every lead and main sets the model on each sub-agent call (no inheriting), picks the cheapest that fits, and writes tight prompts (only needed files, exact task, length cap). Applies to the ERP lead and module leads' own sub-agents too. ERP-67 (ACC), ERP-68 (HRP).
- **Testing (Jabran, 2026-10-10):** test only what's new or affected (changed code plus its dependents). No full suite before every push; backend CI is the full run. Full local suite once per checkpoint only when shared code, security or data-changing migrations changed. ERP-65 (ACC), ERP-66 (HRP).
- **Local databases (ERP lead, 2026-10-10):** builders never run unfinished migrations against Jabran's local databases; drafts only in throwaway databases. Cause: org V32 in Jabran's local `neoerp_org` came from a draft, its checksum didn't match the pushed file, and org-service refused to start. Jabran ran the repair (committed V32's functions re-run, checksum corrected); backend healthy again. ERP-63 (ACC), ERP-64 (HRP).
- **Compacting (ERP lead):** mains hand off in `plan.md` and ask Jabran to /compact after each accepted and pushed checkpoint (or start fresh for a new area); leads after a phase bundle or at ~80%; never mid-checkpoint or with blocking items open. `lead-agent-structure.md` §3b. ERP-58 (ACC), ERP-59 (HRP).
- **Message timing (ERP lead, protocol §14):** handle messages only at safe points; triage by Priority/Blocking/own work; one active brief per main; `Amends:` applied at slice boundaries; replies matched by `Re:` against `waiting on` lines; stale replies not applied; HOLD = commit locally if green, no push. ERP-56 (ACC), ERP-57 (HRP).
- **Inbox listening (ERP lead, protocol §13):** every open lead and main session listens to its own inbox with a background loop (30 s check, 90 s quiet before waking, no tokens while idle); restart after each turn; pause with `.paused-<inbox>` or `.paused-all`; no replies to ANSWER/FYI. ERP-54 (ACC), ERP-55 (HRP).
- **Company country in bootstrap (ERP lead, ACC-52):** the bootstrap/session company context gains `country` (ISO 3166-1); ERP · Backend + ERP · App build it; until then the app falls back to ISO after one retry. No-scope screens use ISO + International input; enrollment switches to the wizard's country.
- **Date typing, completed (ERP lead):** years outside 1900–2099 are refused; the format is the country of the company being edited (enrollment: the wizard's country). The Accounts shared app code is accepted after five fixes (stale Save, silent revert, contradicting copy, format source, shell → feature import), ERP-50.
- **Review scope (ERP lead):** module leads alone review and accept their module's own work. The ERP lead accepts only the shared files (design system, shell, core, `shared/*`), the security parts, the cross-module joins, and CI/infra/ADRs in a checkpoint. ERP-wide audits never hold a push except for security findings. `lead-agent-structure.md` §2b.
- **File components (ERP lead):** `NeoFilePicker` and `NeoDocumentViewer` approved after fixes (ERP-45); SIE import ≤ 50 MB streamed, CSV import 10 MB; the kept original SIE file is `ATTACHMENT`; `NeoFileType` adds Jpg, Png, Se (badge SIE), no Heic; desktop PDF renderer Apache PDFBox.
- **Outside calls (ERP lead, ADR-016 amendment):** config-only hosts and egress allowlist; strict TLS; 5 s/15 s timeouts, breaker, capped retries; separate SANDBOX/PRODUCTION credentials; idempotent sends; no wire logging and stripped server-side error text; signed, deduped inbound callbacks with the tenant from our own ids; routing identifiers unique across companies and verified; processors follow C4. Document output (G-5): approve after fixes, ERP-44.
- **Accounts shared items (ERP lead, ACC-25/28):** user-service `member-standing` read (isMember/isOwner, fail-closed, built with the ERP-4 holder count in HR P0); ADR-020 class `ISSUED_DOCUMENT` and no scan for parse-only STAGING files; `NeoFilePicker` and `NeoDocumentViewer` shared components (ERP-owned, contract first); code rename `ACCOUNTS.ATTACHMENT.SENSITIVE.READ`; Enter company sees non-sensitive attachments only, audited; ADR-016 amendment for third-party credentials (encrypted, write-only, audited, never usable by staff). NO/IS record residency goes to Jabran under C4.
- **Critical parts refined (ERP lead, ACC-32/HRP-25):** see lead-agent-structure.md §3a. Opus implements posting idempotency, separation of duties, sensitive-data crypto, bank-change approval and payment files, period/year control and gapless numbering. Sonnet builds pack data, filing and e-invoice generators, and report figure engines, each with a required Opus review and golden tests.
- **Priority (Jabran, 2026-10-10):** the Accounts lead finishes the Accounts design first (B–E and A3 to Jabran's approval). Jabran has stopped the other lead sessions for now. The HR & Payroll lead resumes when he restarts it; its open items wait in its inbox.
- **Models (Jabran, 2026-10-10):** Haiku for design and mechanical work; Sonnet for implementation; Opus for discovery, plans, reviews and implementing the critical parts (the posting engine and journals, money and tax calculations, payroll calculations, auth and security, tenant isolation, locking and concurrency, and migrations that change existing data); Fable only when Opus can't. Replaces the Opus-for-complex-implementation line in the playbook §3 and §3a.
- **Models and flow (ERP lead):** mains pick each sub-agent's model per task (Haiku mechanical, Sonnet default, Opus for money, payroll, security, migrations and reviews, Fable rarely); fresh read-only Opus review required for money, payroll, tax, security, tenant isolation and migrations; commit → lead accepts → push, no PRs. `lead-agent-structure.md` §3a.
- **Id namespaces (ERP lead):** the 2026-10-09 "HR & Payroll escalations ERP-1…ERP-15" below are decision ids, not inbox message ids. Cite them as **E-1…E-15** from now on (E-8 = two HR→Payroll scopes, E-12 = migration numbers not reserved). Existing "ERP-n" citations in contracts mean E-n when they talk about those decisions; fix them at the next touch.
- **Uncommitted docs (ERP lead):** accepted ADRs and approved contracts must be committed so mains' worktrees see them. Until then mains give sub-agents absolute paths into the main checkout (main-agent-handover §2.3). ADR-018/019/020 go in the next backend docs commit (ERP-33).
- **ORG-FACTS-2 employerRegistration (ERP lead):** a list per scheme `[{scheme, number, level: COMPANY|BRANCH}]` on the company and on branches; a branch entry overrides the company one for that scheme (the P4 P4-A6 shape). H1 §12 and P1 follow it.
- **Work calendar read (ERP lead):** H3's work calendar for Payroll is served under `hr.time-totals.read` (HRP-3 yes), not `hr.employee-facts.read`.
- **Role (Jabran, 2026-10-10):** the ERP lead is lead over all leads: decides what they don't decide, binds and links modules (contracts, events, ids, shared components) and checks what's broken (standing integrity check).
- **Lead agent structure (ERP lead, delegated by Jabran):** every lead runs three mains (Design, Backend, App) as Claude Code sessions with sub-agents; lead ↔ main via `docs/inbox/<lead>-<main>.md`; ERP lead gets ERP · Design/Backend/App for ERP-owned work; rollout Accounts → ERP → HR & Payroll. `docs/handover/lead-agent-structure.md`; FYI ERP-30 (ACC), ERP-31 (HRP).
- **Shared rules (ERP lead, building-blocks):** percent NO/SE/DK/FI/IS/DE/NL `12,5 %`, PK/GB/US/others `12.5%` (`NeoPercent`); one date parser with fixed inputs (company format with `.` `/` `-`, ISO, 8/6 digits, two-digit year = 2000–2099), all else refused; bank details on a new supplier, customer or employee are the first change request (usable record, no payment until a second person approves). FYI ERP-26 (ACC), ERP-27 (HRP).
- **Design verdicts (ERP lead re-review):** Accounts B, C, D, A3 ready for Jabran; E after TAX-9/14 (ERP-28). HR drop 1 and Payroll drop 2 not ready: fix rounds not on disk; Payroll addendum missing from the review file (ERP-29).
- **ADR-018 parties and ledger documents: text accepted (ERP lead; decision Jabran 2026-10-09).** Accounts owns every record that moves AR/AP/GRNI; one customer and one supplier per company, no sharing across companies in v1; Sales/Purchasing extension tables keyed by party id, no copies; documents from other modules idempotent on `(company, sourceModule, key)` and arrive SUBMITTED for an Accounts approver; quick-added parties carry no bank details (Q1); `requestedBy` needs no extra Accounts create code (Q2); master-roadmap phases 6–7 updated (Q3).
- **ADR-019 domain-event relay accepted (ERP lead):** producer outbox + per-consumer deliveries in the business transaction, HTTP pull feed per producer, consumer inbox keyed by event id; at least once; `companyId` required; no sensitive personal data in payloads; no order guaranteed, `subjectVersion` decides; parked after 10 failures; 90-day retention. Commands (posting, ERP-15 `EXITED`, audit/workflow/notifications) stay command outboxes. Broker only on D14's triggers. `:shared:domain-events` built by CC · Accounts backend as EV-1, after A3 and before B ∥ C (ACC-13). Payroll waits on `accounts.books.went_live` (ERP-25). ADR-004 got an update note.
- **ADR-020 file store accepted (ERP lead):** shared `:shared:file-store` port; Postgres / S3-compatible (MinIO local) / filesystem (dev only) adapters; per-file AES-256 keys encrypted by the app, bound to service and company; metadata in each service's DB; one bucket per service and region; every download streamed through the owning service, no signed links; retention classes (EXPORT 7 d, PAYMENT_FILE 90 d, FILING/PAYROLL_DOC payroll period, ATTACHMENT bookkeeping period, HR_DOCUMENT HR period, STAGING 24 h), legal hold, 410 on purge (closes ERP-1 Q19); ClamAV before customer uploads go live. Open Q7: D-40 back to Jabran via the Accounts lead (ERP-22). HR H1 blobs must be encrypted from the start (ERP-23). `file-download.md` Q2 answered.
- **ADR numbers (ERP lead):** ADR-017 stays reserved for counterparty posting (Accounts F). ADR-018 parties and ledger documents; **ADR-019** domain-event relay; **ADR-020** file store. All in `NeoERP-BackEnd/docs/adr/`.

## 2026-10-09

### Organisation and process (Jabran)
- **Chain of command.** Jabran → ERP lead → module leads → their builders. A module lead runs its builders alone: sequence, prompts, review, fixes, accept and push. Builder reports go only to the module lead. Leads escalate to the ERP lead only for:
  - a shared rule or component that must change;
  - security, sign-in or database roles;
  - another module, when the leads disagree;
  - builder capacity;
  - being stuck after two tries.

  Product decisions go to Jabran, bundled, each with a recommendation. (playbook §2a)
- **Leads:** Accounts lead (Accounts A–H); HR & Payroll lead (HR v2, Payroll v2, ESS). Later: a Supply chain lead (Inventory → Purchasing → Sales).
- **v2 replaces v1 for HR, Payroll and ESS.** Every screen is designed in the rig first. The backend is kept and refactored, or rewritten, area by area. Data is kept.
- **Builders:** at most one backend and one app builder per module at a time, with parallel workers inside a checkpoint when they touch different files. Builders ask Jabran before starting or stopping anything on his machine.
- **Lead messages:** end each message to a lead with "keep going until you need a decision", and "if a tool fails twice, stop and say so".

### Countries (Jabran)
- The company's Org country switches on its packs automatically.
- **Full packs at launch:** PK, NO, SE, DK, FI, IS.
- **Every other country:** the base set, with "coming" for payroll and statutory exports. (`target-countries.md`)
- **Payroll order:** PK → NO → SE → DK → FI → IS, with the engine designed against Norway.
- **Open (C3, C4):** UI languages (recommended: English first, Norwegian and Swedish before launch); hosting (recommended: an EU/EEA region for Nordic customers).

### Architecture (Jabran / ERP lead)
- **ADR-018 accepted.** Accounts owns customers, suppliers, invoices, credit notes, bills and payments. Sales and Purchasing create them through B/C. Inventory owns items and stock, and posts stock value and COGS through the engine. *(The ADR file is still to be written by the ERP lead.)*
- **Permissions:** the same role model in every module, with one code per action (`.READ`, no `.WRITE`; `permission-actions.md`). The Company Owner gets every permission by default, payroll included, and can delegate. Neovatus Enter company sees no sensitive data unless granted. Every linked employee gets own-data ESS automatically.
- **HR D4:** one employee record per employer company. The branch is an effective-dated part of the job. Two employers means two records, one login (already supported: `employee_links` unique per company and user). Secondment abroad is out of v2.
- **Payroll four-eyes:** calculate ≠ approve. Single-person case: the Company Owner approves their own run with a reason, marked "Owner's own".
- **Payroll roles (F4):** the signed-off scope wins: Payroll Admin does everything except approve, a new Payroll Approver approves, the Owner gets all. The P0 contract maps existing role holders; the ERP lead approves the mapping.
- **Payroll posting:** before the launch line, after B ∥ C, gated on P0 (Accounts roadmap R-1 v2).
- **Database roles:** each service runs as a restricted runtime role (DML only), and Flyway uses the owner role. Accounts first (approved for CP-A2.1a), then every service.

### Shared rules (ERP lead)
- **List controls:** `NeoERP-App/docs/design/specs/list-controls.md` (LC-1…LC-36) is approved. `NeoSearchSelect` / `NeoMultiSelect` were built in CP-A1.2a. No module builds its own picker.
- **Numbers and money** (building-blocks): the company country's format via `NeoMoney`. Nordic `1 250 000,00` (comma decimal accepted), PK and most others `1,250,000.00`, DE/NL `1.250.000,00`. Dates per country. The API uses plain decimals and ISO dates; CSV and XLSX exports stay plain.
- **Module off:** "{Module} isn't part of your plan". The app maps the code, never server text.
- **Page states:** the code reference is Org People (`CompanyPeopleTab.kt`, `CompanyListUi.kt`).
- **Shared components for HR, Payroll and ESS (E8):** approved in principle. The HR & Payroll lead writes one contract per component, and the ERP lead approves each.
- **Glossary:** modules add their own terms ("Change request", "Leave request").

### Answers to the leads
- **Accounts:** R-1 v2 and R-2…R-9 decided. CP-A1.2a was accepted with fixes F1–F6. CP-A2.1a answers: the runtime role, the PDF display name until ORG-FACTS-2, no change to shared `Refusals.kt`, and the superuser test role.
- **HR & Payroll:**
  - Scopes signed off.
  - D1, D4–D8 decided.
  - E1 closed, E2 agreed, E3/E4 in H0/P0, E5/E6 in ORG-FACTS-2, E7 already supported, E8/E9 approved in principle.
  - The sidebar and routes change is approved.
  - F1–F13 decided.

### HR & Payroll escalations ERP-1…ERP-15 (ERP lead, 2026-10-09)
- **ERP-1:** the 10 shared component contracts are approved, each of the 29 questions as recommended. Notes:
  - Q8: health-related leave types show "Away" to everyone except HR, unless granted.
  - Q19: file expiry follows the file-store ADR.
  - Files move to `NeoERP-App/docs/design/specs/`, with one bullet each in building-blocks.
  - They are built in one design-system checkpoint before HR's first screen build. Builder slot: the HR & Payroll lead's app slot.
- **ERP-2/3:** keep HR Admin and Payroll Admin, add Payroll Approver. Payroll Admin = everything except approve. No customer holds these roles yet.
- **ERP-4:** count-only user-service read "anyone else in this company holds PAYROLL.RUN.APPROVE". It fails closed: if the read is unknown, the Owner's own approval is refused.
- **ERP-5:** Neovatus Enter company gets no payroll access, reads included, until a per-company grant exists.
- **ERP-6:** a temporary backfill-only HR read (ids only, payroll client only), removed after Payroll V7.
- **ERP-7:** the `HR.EMPLOYEE.ALL_TEAMS` marker code now; a per-code team scope in IAM later.
- **ERP-8:** two HR→Payroll machine scopes: job facts, and sensitive facts. Every sensitive read is audited.
- **ERP-9:** HR Officer can make job-change requests only.
- **ERP-10:** `.READ` and one code per action; screens say "View".
- **ERP-11:** screens say "HR"; the agreement and code say "HRMS"; glossary entry "HR (HRMS in your agreement)".
- **ERP-12:** **migration numbers are not reserved.** The builder takes the next free number right before committing and renumbers its own unpushed migration on a clash. Applied and pushed migrations stay frozen.
- **ERP-13:** approved: `payroll.calendar.read`, `org.facts.read` and `OrgBranchFactsV1` in ORG-FACTS-2. The national-id match scope answers match yes/no only, never returns the id, is audited and is rate-limited.
- **ERP-14:** branch province code in ORG-FACTS-2. Org country is already fixed once set (RP-D5), so it can't change under Payroll.
- **ERP-15:**
  - On the employment end date the Employee role is removed. If that was the person's only role in the company, their company access ends. If they hold other roles, those stay, and HR admins get a review item.
  - A re-hire may link the same login.

### Process: lead inboxes (ERP lead, 2026-10-09)
- Lead-to-lead messages go through append-only workspace files in `docs/inbox/<lead>.md`, with done-marks in `<lead>.done.md` (playbook §2a). Jabran says "check your inbox". Builder prompts and product decisions still go through Jabran.

### Accounts lead escalations (ERP lead, 2026-10-09, evening)
- **E1 number typing:** in the Nordic formats, "1.250" (a single point, three digits, no comma) is refused with "Use , for decimals: 1250000,5". Written in building-blocks; built in the CP-A1.2a fix round.
- **E2 date typing:** date fields accept the company format and ISO, with a picker. `NeoDateField` follows DR-12 (`date-range-field.md`), built by the Accounts app builder in CP-A1.2b; HR reuses it.
- **F1:** the rig `TweakButton` now accepts children. Fixed by the ERP lead.
- **F2:** service DB roles for every service: already on the backlog after Accounts.
- **F3:** builder plans `docs/agents/<checkpoint>/plan.md` are tracked in both repos. NeoERP-App drops `docs/agents/` from `.gitignore` in CP-A1.2b and commits only its own checkpoint folder.
- **F4:** the franchise-terms draft now says "next free at build".
- **F5 / ORG-FACTS-2:** the ERP lead writes the contract. It is built by the Accounts backend builder, run by the Accounts lead, after CP-P26.2 and **before the A3 backend**, so it is done before B/C and HR H1.
- **Q1 ADRs:** ADR-018 is written next; then the event relay and the file store, both before the B ∥ C backends start. A2 export jobs use the local-volume storage port until then (accepted).
- **Q2 Accounts builder queue:**
  - backend: CP-A2.1b → CP-P26.2 → ORG-FACTS-2 → A3 → B ∥ C;
  - app: CP-A1.2b → CP-A2.2 → B/C app.

  HR & Payroll builds run in parallel on their own builders (their own files).
- **Q3 holder count:** one internal user-service read, "how many others in company X hold permission P" (count only, machine scope, fails closed). Built once in HR & Payroll P0 (ERP-4) and reused by Accounts A5. The ERP lead reviews the user-service change.

### HR & Payroll contracts H2–H4, P3–P4 and CI (ERP lead, 2026-10-09, late)
- **HRP-3:** all yes.
  - Shared `libs/pack-core`: HR builds it, the ERP lead owns its API.
  - `HR.LEAVE.HEALTH.READ`.
  - audit-service `REASSIGN` and `INFO`, with the ERP lead reviewing.
  - Scopes `hr.absences.read` and `hr.time-totals.read`.
  - A web clock-in switch per company.
  - The national-id check stays a plain yes/no.
  - ERP-15 timing: at the end of the end date.
  - Approvers need the matching direct-change code.
  - A `FORMER_EMPLOYEE` membership state in user-service.
- **HRP-4:** all yes.
  - An encrypted Postgres file-store port until the file-store ADR.
  - Bank files kept 90 days.
  - Shared `libs/payment-files` (pain.001), built by whoever needs it first.
  - `employerRegistration` in ORG-FACTS-2.
  - Social-security ids in HR's sensitive block.
  - Filing files kept encrypted for the retention period.
  - `PAYROLL.FILING.CONTENT.READ`.
  - Receipt upload.
- **ACC-7:**
  - CI runs from the repo root for every service. Item CI-1 on the Accounts backend builder after CP-A2.1b; the ERP lead reviews.
  - The approved shared-spec edits (building-blocks, screen-standard) are committed by CC · Accounts app as one design commit. Rig files stay uncommitted until approval.
  - **Open for Jabran:** old PR #3 (dev → main).
- **Design review:** `docs/reviews/design-review-2026-10-09.md` covers Accounts B–E and HR drop 1. **Pending:** a shared bank-details-change pattern (X-5), written by the ERP lead.

## ERP lead's own open work
- [x] Write ADR-018 (parties and documents). Accepted 2026-10-10.
- [x] ADR: domain-event relay (before Payroll P2 and the B/C hooks). ADR-019 accepted 2026-10-10.
- [x] ADR: file store (before attachments and H). ADR-020 accepted 2026-10-10.
- [x] ORG-FACTS-2 contract drafted 2026-10-13 (`NeoERP-BackEnd/docs/api/org-facts-2.md`, Proposed; consumer check ERP-73/74) — built after CP-P26.2, before the A3 backend, also covering the B N-O-1 company legal profile:
  - legal name and registration number;
  - NO AGA zone and sub-unit per branch;
  - PK province per branch;
  - company and branch time zone;
  - check the DK, FI and IS labels;
  - Tromsø branch and HRMS for Stockholm Handel in the demo data.
- [ ] Database roles for every service, after Accounts.
- [ ] An API conventions page (error body, paging headers), then check every contract against it.
- [x] Bootstrap contract amendment: `country` on `memberships[]` and `selectedContext` (`NeoERP-BackEnd/docs/api/bootstrap-company-country.md`, accepted 2026-10-15; reuses `OrgScopeAccessPort.companyFacts`, cache non-null for process lifetime). Build: user-service + app, slot to be named.
- [ ] People rig sideways scroll (1280/1024/768).
- [ ] An ERP-wide review: consistency, old dropdowns in Org, People and Roles, security, docs.
- [x] HR & Payroll component contracts approved (ERP-1); roles settled (ERP-2/3).
- [x] Decisions C3 (languages) and C4 (hosting): decided 2026-10-15 (Jabran: as recommended).
- [x] Shared bank-details-change pattern (X-5) written in building-blocks "Bank details changes" (2026-10-09); design review sent to leads (ERP-8, ERP-9).
- [x] Jabran, 2026-10-10: keep PR #3 open (dev → main).

## 2026-10-10 · HRP-8 (ERP-13)
- Shared libraries live in `shared/` (`:shared:pack-core`, `:shared:payment-files`), not `libs/`. pack-core API as hrms-v2-h2 §18. Accounts migrates `PackFiles.kt` onto it later.
- audit-service workflow gets REASSIGN only (hrms-v2-h2 §19.2). Notice-only items are **IN_APP notifications**, not a workflow kind: notifications gain subject link, `expiresAt`, request-id idempotency, Enter-company read-only on mark-read, 90-day purge after expiry.
- J-9 (to Jabran): Pakistan roster rules recommended as warnings with source, not blocks; young-worker rules for every country.

## 2026-10-10 · Branches and GitHub (Jabran)
- PR #3 stays open. Jabran manages GitHub (PRs, merges, main). Leads and builders never open, close or merge PRs.
- All work stays on the working branches: NeoERP-BackEnd `dev`, NeoERP-App `dev-app`. Pushes only to these, after the lead accepts.
