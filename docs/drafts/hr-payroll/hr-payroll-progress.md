# HR & Payroll — progress (workspace copy)

Owner: Code · HR & Payroll lead (trial). Workspace copy; the reviewer mirrors it to the project. Updated 2026-10-16 13:30.

## State (2026-10-16) — design and contracts only, everything Draft, no push by me
Resume: start `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh hr-payroll-lead`; read inbox vs done file.

### Done
- Design complete: drops 1–3 in the rig; specs hr-h1, hr-h2-h3, hr-h4, payroll-p; contracts H0–H4, P0–P4.
- Drop 3 by Codex (89995150 … e4ecba2b, 91a1723c); Opus review fixed and re-checked PASS. Designer handoff updated (3d6f779b).
- **Contract audit (Codex, HRP-C-4): 35 findings, all accepted** — docs/reviews/hrp-contract-audit-2026-10-16-dispositions.md. Contract fixes committed: NeoERP-BackEnd **8d07e36** (H0–H4, P1–P4). New: payee bank approval (P1-39, code PAYROLL.PAYEE.ACCOUNT.APPROVE), PAY_PARTIAL, tax-card pairing, run-coverage read (P1-42), H2 selector columns region_code/establishment/condition, leave attachments, same-illness, DST offsets, reverse of unposted published runs (P2 §9.1a), bank-file cancel, linked payment/deposit.
- Messages: ERP HRP-61 (new code, new scope, REASSIGN replay), ACC HRP-62 (P2 aligned to A5).

### Waiting
- **Jabran:** bundles 1 (G-1…G-3) and 2 (G-4…G-6): docs/drafts/hr-payroll/design-gate-bundle-1.md, -2.md. Start Codex round 4: docs/drafts/hr-payroll/codex-audit-fix-prompt.md (rig/spec alignment, report HRP-C-5).
- **ERP:** HRP-61. **ACC:** none (HRP-62 is FYI).
- PK payroll figures (official sites) — Jabran's answer on the in-app browser.

### Next
1. HRP-C-5 → accept, short Opus check of the security items (CA-2, CA-14, CA-23, CA-30).
2. Bundle answers → decisions file; Draft → Approved status lines.
3. Builds only on the ERP lead's word (after Accounts Phase 1).
4. P5–P9 and country verification (PK payroll figures, reminder lead days, IS expiry).
