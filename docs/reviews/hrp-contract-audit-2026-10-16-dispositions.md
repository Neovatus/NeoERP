# Contract audit 2026-10-16 — lead dispositions

Owner: Code · HR & Payroll lead (trial). 2026-10-16. Source: `hrp-contract-audit-2026-10-16.md` (Codex, HRP-C-4). 35 findings: **35 accepted, 0 rejected, 0 for Jabran** (CA-10 is tied to design-gate G-3, already on Jabran's list). Everything stays Draft.

Contract fixes are applied by lead sub-agents in the owning contract (column "Contract"). Screen, spec and rig follow-ups go to Codex in `docs/drafts/hr-payroll/codex-audit-fix-prompt.md` (column "Rig/spec").

| Id | Sev | Disposition | Contract change (owner) | Rig/spec |
|---|---|---|---|---|
| CA-1 | High | Accepted | H1 §5.1/§5.3: insert between rows from the covering predecessor; drop "latest + 1" | Check the rig's insert-between-rows path |
| CA-2 | High | Accepted (J-3 applies to payees) | P1: payee account requests, approve/reject/reveal, new code `PAYROLL.PAYEE.ACCOUNT.APPROVE`, PUT can't change account; P3: files use APPROVED payee accounts only | Payroll setup payee bank flow and copy |
| CA-3 | High | Accepted (my ACC-203 note was wrong) | P2: `approvedBy` = token subject unchanged, `approvedByUserId` = IAM id (as A5); > 128 → refuse to post | — |
| CA-4 | Med | Accepted | H1: queue/count per kind (BANK_ACCOUNT → PAY_DETAILS.APPROVE) | Approvals filter in rig |
| CA-5 | Med | Accepted | H1 §5.7: effective for bank files made after approval | ESS bank copy |
| CA-6 | Med | Accepted | H1: Q17 "no patched-v1 exceptions" applied throughout | — |
| CA-7 | Med | Accepted | P1: PK reads DOB + legal sex only, audited; no NID/bank in snapshots | — |
| CA-8 | Med | Accepted | P1: new treatment `PAY_PARTIAL` with HR payRatePercent | — |
| CA-9 | Med | Accepted | P2: taxPointDate in the V2 hash (matches A5) | — |
| CA-10 | Med | Accepted, tied to G-3 | P2/P3: reverse an APPROVED, published, unposted run (cancel pending posting, payslips Replaced, acknowledgement) | Reverse action in that state |
| CA-11 | Med | Accepted | P3: cancel a READY bank file (reason, audited, bank warning) | Cancel-file action |
| CA-12 | Med | Accepted | P3/P4: payee payment = deposit (one fact); void refused while cited by a filing | Void guard copy |
| CA-13 | Med | Accepted | P3: remove UNDO_PAID | Remove any undo-paid trace |
| CA-14 | Med | Accepted: contract stands | H1: NID = direct sensitive update with reason; no NID request kind | **Rig aligned**: replace HrNidRequest with the direct edit |
| CA-15 | Low | Accepted | H1 §6.7 → superseded by H4-25 | — |
| CA-16 | Low | Accepted | H0-18 step refs 8 and 5 | — |
| CA-17 | Low | Accepted | P1: tax-card import pairs employeeId + NID (H4 §10.3) | — |
| CA-18 | High | Accepted | H4 §5.1-12a approval-aware uniqueness; H1 §3.1-8 note | — |
| CA-19 | High | Accepted | H2 §4.3 selector columns region_code/establishment/condition, most-specific wins; H3 §5 uses them | Rig pack fixtures use the selectors |
| CA-20 | High | Accepted | H4: exclude the request being approved | Rig end approval |
| CA-21 | High | Accepted | H4: change of a PLANNED end = update excluding itself | Rig change-end |
| CA-22 | Med | Accepted | H2: sick pay rate from region/act rows | Rig PK sick fixtures |
| CA-23 | Med | Accepted | H2: attachments owned by request/report, HEALTH/OTHER, ESS own upload, HEALTH.READ audited | ESS/HR attachment flows |
| CA-24 | Med | Accepted | H2: `PUT /absence-reports/{id}/same-illness` | FI same-illness field (HR) |
| CA-25 | Med | Accepted | H2: offsets on hourly leave, gap/overlap refusals | Rig sends offsets |
| CA-26 | Med | Accepted (audit-service text; FYI ERP) | H2 §19.2: replay check before PENDING guard | — |
| CA-27 | Med | Accepted | H3-3: no-zone refusal only for clock/instant/duration | — |
| CA-28 | Med | Accepted | H3 §11.1: earlier windows only | — |
| CA-29 | Med | Accepted | H4: post-employment projection from final job calendar | — |
| CA-30 | Med | Accepted | H4: reveal body `{ownerSelfApproval, reason}` | Rig Owner reveal asks for reason |
| CA-31 | Med | Accepted (new scope → ERP) | P1: run-coverage machine read `payroll.run-coverage.read` | Coverage message source |
| CA-32 | Med | Accepted | H4-17: Owner exception from H4-23 | — |
| CA-33 | Low | Accepted | H2 §9.10 → §9.6 | — |
| CA-34 | Low | Accepted | H2: no "or copy" | — |
| CA-35 | Low | Accepted | H4: end preview needs END or REQUEST | Rig hides preview from read-only |

Also accepted from the audit's notes: spec/screen cleanup (stale hr-h1 draft notes, `.VIEW` labels → "View", Officer CHANGE_JOB text) → Codex prompt.

Cross-module: CA-3/CA-9 align P2 to A5 (no A5 change) → FYI ACC. CA-2 new code, CA-31 new machine scope, CA-26 audit-service text → ERP lead.
