# HRP C5 security check (2026-10-19)

Read-only static check of NeoERP-App commits 682983e5, 4b3c32b2, eb6c57c0, be93e27c and the current rig in `NeoERP-App/docs/design/screen-rig/`, against NeoERP-BackEnd `docs/api/` H1 (CA-14), H2 §7.11g (CA-23), H4 §503 reveal row (CA-30), P1 P1-39 (CA-2) and P3 P3-28 c (CA-2).

## Result

| Item | Verdict | Severity |
|---|---|---|
| CA-2 payee bank approval | PASS (one low note) | — |
| CA-14 national id | **FAIL** | Medium |
| CA-23 leave attachments | PASS | — |
| CA-30 Owner reveal | PASS | — |

## CA-2: payee bank approval (P1-39, P3-28 c), PASS

- Second person compared by user id: `payroll-data.jsx:425` (`pending.requesterUserId !== actor.userId`); UI `payroll-setup.jsx:414`.
- `PAYROLL.PAYEE.ACCOUNT.APPROVE` for approve, reject and reveal: `payroll-data.jsx:424`, `:484`; UI `payroll-setup.jsx:434-441`.
- Masked reads: `payPayeeShown` `payroll-data.jsx:404`, run payee rows `:1382`, list `payroll-setup.jsx:495,500`, panel `:458`. The old 30 s reveal of the current account in the panel is removed.
- Reveal approver-only, not the requester (except Owner's own), audited with field names only, no-store: `payroll-data.jsx:475-480`.
- First account is a request: `paySetupSave` `payroll-data.jsx:2050` stores it pending with `account = ''`.
- PUT cannot change the account: `payroll-data.jsx:2050` returns 422 `PAYEE_ACCOUNT_VIA_REQUEST`; `pySuPayeePayload` sends no account fields for an existing payee (`payroll-setup.jsx:375-379`).
- Files use APPROVED only: `p.account` is set only on approve (`payroll-data.jsx:470`), and the payee file includes only payees with one (`:1862`). Payment recording refuses a pending first account (`:1480`).
- Requester bar (WAITING or approved within 30 days) on make and download: `payPayeeFileBar` `payroll-data.jsx:1850-1854`, used at `:1863` and `:1871`.
- Owner's own only as the sole holder, and it fails closed: `payPayeeOwnerAllowed` `:421`, gate `:426-429`. An unanswered holder check returns 503 `AUTHZ_UNAVAILABLE`, another holder returns 403 `OWNER_SELF_APPROVAL_NOT_ALLOWED`, and a reason of 6 or more characters is required.
- Low note (not a security gap): `payroll-setup.jsx:415` guards on `typeof payOwnersOwnAllowed === 'function'` but calls `payPayeeOwnerAllowed`. The server-side gate still enforces the rule. Fix the guard name.

## CA-14: national id, FAIL (Medium)

The HR side is correct. `hrSensitiveIdUpdate` (`hr-employee.jsx:572-585`) requires `SENSITIVE.UPDATE`, refuses platform sessions and self-edits, requires a 6–500 character reason, and audits `SENSITIVE_UPDATE` with `fields: ['nationalId']` only. `HrNidRequest` hides the edit from non-holders and on the user's own record (`:596`).

**The national-id change-request path is still live in the rig.** This contradicts H1 §5.6 ("no `NATIONAL_ID` change-request kind", CA-14) and the be93e27c spec text ("ESS has no ID request workflow"):
- `ess-shell.jsx:301`: `reqRow('nid', 'National id', …)` still renders "Request a change" on the national id.
- `ess-shell.jsx:462-470`: `EssOtherSheet` accepts `field === 'nid'` and creates an `HR_CR` row with `field: 'nid'`.
- `hr-employee.jsx:446`: approving a change request applies `e.nid = r.val`. That decision runs under `HR.CHANGE_REQUEST.DECIDE`, not `SENSITIVE.UPDATE`, and writes no field-only `SENSITIVE_UPDATE` audit.
- Related leftovers: `hr-data.jsx:466` (`HR_CR_FIELDS.nid`), `hr-employee.jsx:475-476,509`, `hr-approvals.jsx:644`.

Why Medium: the rig is the build reference, and it shows a second way to change a sensitive identifier, under a weaker permission and audit. Fix: in ESS, replace the `nid` `reqRow` with a read-only masked row and the "Ask HR to change it" copy. Remove `nid` from `HR_CR_FIELDS`, `EssOtherSheet` and the change-request approve branch.

## CA-23: leave attachments (H2 §7.11g), PASS

- HEALTH and OTHER only. A health-related report forces HEALTH (`ATTACHMENT_CLASSIFICATION_NOT_ALLOWED`): `hr3-data.jsx:1833`.
- ESS upload is limited to the employee's own resource with `HR.ESS.LEAVE`, and anything else returns 404: `:1832`. The ESS list and download show only the employee's own ESS uploads, with `HR.ESS.READ`: `:1841`.
- An HR HEALTH upload and list need `HR.LEAVE.HEALTH.READ` and exclude platform sessions: `:1834`, `:1841`. Without it, HEALTH items are omitted and their content returns NOT_FOUND (`:1842`).
- A HEALTH download by anyone other than the employee writes `DOWNLOAD_HEALTH` first (no file name). If the audit is down, the answer is `AUDIT_UNAVAILABLE`: `:1842`.
- There is no diagnosis or description field. Only the name, type, size and classification are stored (`:1838`).

## CA-30: Owner reveal (H4 pay-details reveal), PASS

- `hrRevealWaitingAccount` (`hr-employee.jsx:346-357`) requires `HR.PAY_DETAILS.APPROVE` and excludes platform sessions. The sole-holder Owner's own reveal needs `ownerSelfApproval: true` and a 6–500 character reason, or it returns `REASON_REQUIRED`.
- An unknown holder count refuses: `hrApproveHolders` returns null, which makes `allowed` false (`hr-approvals.jsx:386-393`), and the code is `OWNER_STATUS_UNKNOWN`.
- The audit records `REVEAL_SENSITIVE` with field names, the Owner flag and the reason only.
- The payee-side equivalent (P1) needs `ownerSelfApproval` and a reason, and returns 503 on an unknown holder count (`payroll-data.jsx:426-429`).
