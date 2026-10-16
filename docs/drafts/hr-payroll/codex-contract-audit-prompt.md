→ Codex · HRP contract audit. Working folder: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. READ-ONLY on every contract, spec and rig file: you write only the report file below and one inbox entry. No code, no commits, no push, never open PROJECT-STATE*.md.

GOAL
Before Jabran approves the contracts (design gate G-2 and G-5), find every place where a contract doesn't support what the approved screens do, or contradicts another contract.

INPUTS
- Contracts: NeoERP-BackEnd/docs/api/hrms-v2-h0.md … hrms-v2-h4.md, payroll-v2-p0.md … payroll-v2-p4.md; NeoERP-BackEnd/docs/api/accounts-a5.md and org-facts-2.md (the other side of the joins)
- Specs: NeoERP-App/docs/design/specs/hr-h1.md, hr-h2-h3.md, hr-h4.md, payroll-p.md, building-blocks.md
- Rig: NeoERP-App/docs/design/screen-rig/hr-*.jsx, hr3-*.jsx, payroll-*.jsx, ess-shell.jsx (each screen action and its rig "server" function)
- Decisions: docs/drafts/hr-payroll/hr-payroll-open-decisions.md

CHECK
1. Screen → contract: every rig action (button, form submit, approval, reveal, download) maps to a contract endpoint with the same rule: permission code, refusal code, four-eyes, Owner's own, audit event. List actions with no endpoint, and rules the rig enforces that no contract states.
2. Contract → contract: the same field, code, scope, role or event named the same way and the same shape everywhere (H ↔ P, P2 ↔ A5, H1/P1/P3/P4 ↔ ORG-FACTS-2). Flag mismatches.
3. Internal: section refs, rule ids (H1-n, P3-n, Q-n), checkpoint ids and file paths that point nowhere; "to be decided" text that is already decided in the decisions file; leftover old wording (e.g. "stored APPROVED", `libs/`, singular `employerRegistration`, INFO as a workflow kind).
4. Security: every sensitive field (national id, dob, bank account, salary, health leave, legal sex) has a read code, masking and an audit event in the contract that owns it.

OUTPUT
Write docs/reviews/hrp-contract-audit-2026-10-16.md: a table with id (CA-1…) · severity High/Med/Low · contract §/line · what's wrong · suggested contract change (one line). Group by bundle: bundle 1 (H0, H1, P0–P4), bundle 2 (H2–H4).
Then append to docs/inbox/hr-payroll-lead.md (append only):
## <YYYY-MM-DD HH:MM> · HRP-C-4 · From: Codex · HRP contract audit · ANSWER · Contract audit before G-2/G-5
Needs answer by: — · Blocking: no
1. Counts by severity per bundle. 2. File path. 3. The High items, one line each.
Time box: 45 minutes. Then stop.
