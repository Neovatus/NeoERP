# ERP lead — progress (handoff)

Owner: Code · ERP lead (trial). Updated 2026-10-10 22:20. One screen: done / waiting / next.

**State:** all inbox listeners paused (`docs/inbox/.paused-all`). Remove it to resume (protocol §13). Last ERP id sent: **ERP-66**. Every inbox item up to ACC-60 / HRP-25 has a done line.

**Done today:** ADR-018/019/020 accepted; ADR-016 amendments (third-party credentials, outside calls); Accounts B–E/A3 re-reviewed (Jabran approved G-1…G-6, G-7 after HRP agreed); G-5 docout security check + component contracts approved after fixes; shared app code accepted (push cleared, ERP-62); CI-1 accepted; shared rules (percent, date typing, bank details on new records); lead structure (3 mains, inboxes, models, review scope, §13 listening, §14 timing, compacting, testing rule); registers: `NeoERP-BackEnd/docs/operations/deployment-settings.md`, `hosting-and-go-live-requirements.md`; org V32 local drift repaired by Jabran; accounts DB roles set up on Jabran's machine.

**Waiting:**
- Accounts lead: start its §13 listener and read ERP-47…66 (Jabran pings once).
- HR & Payroll lead: paused by Jabran; on restart it reads ERP-29, 34, 36–66. Needs the Cowork export (Payroll addendum PR/PS ids + its Cowork fix rounds) before any re-review.
- Jabran: C3 (languages), C4 (hosting). Cowork export of the Payroll addendum done (REV-1, 2026-10-12); HRP drop 1/3 Cowork fix work still not on disk.

**Next (my open work, erp-lead-decisions.md):** ORG-FACTS-2 contract (consumer table in the 2026-10-10 integrity check: employerRegistration as a per-scheme list); bootstrap `country` amendment (ACC-52); DB roles for every service; API conventions page; People rig scroll; first briefs for ERP · Design/Backend/App when Jabran starts them; ask Jabran to /compact this session before the next big task.

## Update 2026-10-14 00:20

**State:** all listeners paused (`docs/inbox/.paused-all`). Last ERP id sent: **ERP-83**. Inbox answered up to ACC-100 / HRP-38.

**Done 2026-10-13:** Codex works under the Accounts lead (§3c); ORG-FACTS-2 written and checked by both consumers (`NeoERP-BackEnd/docs/api/org-facts-2.md`); KMM-Network download path and Phase 1 fix-round shared files OK to push (KMM first); HR bank-details contract gaps closed, so bundle 1 can go to Jabran; EMAIL notification channel decided; explicit sub-agent models rule; review scope §2b; protocol §13 listening and §14 timing.

**Waiting on Jabran:** `auth_time` in the access token (sign-in change, recommended yes); C3; C4; auth-service machine-client entries for HR/Payroll when ORG-FACTS-2 is built; design bundle 1 from the HR & Payroll lead.

**Next:** bootstrap `country` amendment (ACC-52); DB roles for every service; API conventions page; People rig scroll; first briefs for ERP mains when started; ask Jabran to /compact this session first.

## Update 2026-10-16 (end of day)

**State:** all listeners paused (`docs/inbox/.paused-all`; HR & Payroll also has its own pause file). Listener: `docs/inbox/listen.sh <stem>` (full path). Last ERP id sent: **ERP-142**. Inbox answered up to ACC-227 / ACC-B-37 / ACC-A-31 / HRP-49.

**Done 2026-10-15/16:** file store (CP-FS-1, SeaweedFS) and event library (CP-EV-1) built and accepted; Accounts on the library (CP-EV-2); ORG-FACTS-2 approved and built; upload limits (gateway, deadline, per-company quota); KMM-Network 0.3.0/0.4.0 download/upload; NeoFilePicker; workspace repo `Neovatus/NeoERP` (local commits; Jabran pushes); NeoERP-Design removed (design in NeoERP-App/docs/design, domain in docs/domain); 55 stale worktrees removed; agent folders tracked in all repos; drafts committed; listener script with single-instance and catch-up; bootstrap `country` amendment accepted.

**Waiting on Jabran:** push the workspace repo (`git -C …/NeoERP push -u origin master`); HR & Payroll is paused (bundle 1 for approval when restarted); CP-EV-1b's `org.events.read` machine-client grant later.

**Next (backlog):** CP-EV-1b before HR/Payroll consume org events; file-store rescan job; bootstrap country build; AuditWording to resources; shell connectivity signal; SE legal profile in the org seed; DB roles for every service; API conventions page; People rig scroll. Ask Jabran to /compact this session first.
