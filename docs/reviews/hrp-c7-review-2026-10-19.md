# HRP-C-7 review — CA-14, shared tax-card import (P1-43), P5–P9 inheritance, F-09 (2026-10-19)

Read-only static review for the HR & Payroll lead. Reviewer: Claude (Opus), sub-agent.

Scope:
- NeoERP-App `503cf517` (CA-14), `d4c3487f` (shared import workflow), `20162615` (P5–P9 rig drafts; skimmed for identity, bank, permission and money issues only)
- NeoERP-BackEnd `8ba3a051` (P5–P9 inherit P1-43), `01d7b85d` (P5 §6 F-09 wording)

Rules checked: `payroll-v2-p1.md` P1-41 / P1-43 (and §8.2 routes, error rows 775–776), `hrms-v2-h1.md` §5.6, `hrms-v2-h4.md` §10.3 (pair shape), `payroll-v2-p3.md` §5.1 / §5.4.

## Verdict

| # | Item | Result | Highest severity |
|---|------|--------|------------------|
| 1 | CA-14: no national-id request path | **PASS** | Low (2) |
| 2 | Import workflow vs P1-43 | **PASS** | Low (2) |
| 3 | P5–P9 inherit P1-43; F-09 matches P3 §5.4 | **PASS** | Low (1) |
| 4 | New High/Med in country rig drafts | **PASS** (none found) | — |

No High or Medium findings. Nothing blocks lead acceptance.

## 1. CA-14 — PASS

Verified:
- ESS: `ESS_REQ_FIELDS` no longer lists `nid`; the ESS row shows the masked id with the keyed `ess_nid_contact_hr` text; the request sheet refuses any field outside address / taxRes / legal (`ess-shell.jsx:12`, `:302`, `:468`).
- Create: `hrCreateOtherRequest` accepts only address / taxRes / legal, otherwise `CHANGE_REQUEST_KIND_NOT_ALLOWED` (`hr-data.jsx`, next to `:468`).
- Queue / decide / apply: `hrCrSupported` filters `hrCrOf`. The HR card renders `null` for unsupported rows. Decide and apply refuse them. `hrApplyChangeRequest` has no `nid` branch. `hr-approvals.jsx` gates state, list and history on `hrCrSupported`. Injected `kind: 'NATIONAL_ID'` rows are refused even when `field` is a valid kind.
- Direct edit: `hrSensitiveIdUpdate` (`hr-employee.jsx:572–585`) requires `HR.EMPLOYEE.SENSITIVE.UPDATE` and refuses platform users. It refuses your own record (`SELF_DECISION_NOT_ALLOWED`) and needs a reason of 6–500 characters. It validates the pack format and checks `NATIONAL_ID_TAKEN` among non-ended employees. The audit has `fields: ['nationalId']` plus the reason and no values. The activity log keeps no values. The UI is hidden for your own record (`:597`).
- `app.html` carries the same code.

Findings:
- **Low** — `hr3-data.jsx:1791` (`app.html:44704`): `hr3ChangeRequests` filters `HR_CR` without `hrCrSupported`. An injected or legacy national-id request therefore still counts in `hr3ChangeRequestCount` → `hr3ApprovalCount` (the approvals badge), although the list hides it. **Fix:** add `hrCrSupported(r) &&` to the filter.
- **Low** — `NeoERP-BackEnd/docs/api/hrms-v2-h1.md:586`: the audit-catalogue row `SENSITIVE_UPDATE` says "masked B/A". The rig and the CA-14 brief record the field name and reason only. **Fix:** change the row to "field names + reason, no values (CA-14)", or record the masked before/after in the rig. The contract owner chooses which.

## 2. Shared tax-card import (P1-43) — PASS

Verified (`payroll-data.jsx:2333–2380`, `payroll-setup.jsx` `PySuTaxImport`, `payroll-p.md` Batch A):
- Mapping (`payNordicMap`) and apply (`payNordicImport`) both go through `payImportGate(..., needsSource=true)`. The gate rebuilds the binding (digest, employerRegistration, taxYear, parserProfile, ordered row fingerprints) and compares it with the stored `p.binding`. Any mismatch returns `IMPORT_SOURCE_CHANGED` before any mutation. The UI clears the chosen source after every successful step, so the same source must be chosen again for mapping and for apply.
- Expiry: a TTL fixture (30 min) or the forced fault sets `EXPIRED`, clears rows and pair bindings and returns `IMPORT_PREVIEW_EXPIRED`. No cards are written.
- No national id or file bytes: the source is a synthetic metadata object, and React state holds only `'original'|'different'`. `payNordicAudit` stores the actor, action, reference and a count. There is no `localStorage` or `sessionStorage` in `payroll-data.jsx` or `payroll-setup.jsx`.
- Apply re-checks: permission (`payNordicGuard`, including the permission-loss fault), the own row (refuses), a newly confidential candidate (refuses atomically), and `payImportRows` re-evaluating eligibility (active, pay group), confidentiality, own row and the pair result before writing. A stale card refuses with no write.
- Replay: authorization runs first. The stored `APPLIED` result is then returned with no `pairCalls++` and no card write. Discard is file-free and clears rows.
- Own and confidential rows are rejected with explicit reasons, and mapping refuses them as well.
- Iceland wording: "Sample credit instruction" and "This is not an authority tax-card feed" match P1-43 (6).

Findings:
- **Low** — `payroll-data.jsx:2368–2369`: apply runs the own and confidential candidate refusals before `payImportGate`. An expired preview can therefore answer `OWN_PAY_CHANGE` or `EMPLOYEE_ACCESS_CHANGED` instead of `IMPORT_PREVIEW_EXPIRED`, and it does not clear its rows. **Fix:** run the expiry check before the candidate re-checks. Keep authorization before replay.
- **Low** — `payroll-data.jsx:2344`, `:2350`: the rig uses `SOURCE_FILE_REQUIRED`, `EMPLOYEE_INELIGIBLE`, `TAX_DATA_CHANGED` and `EMPLOYEE_ACCESS_CHANGED`, which are not in the P1 error catalogue. P1-43 says a missing file is 400 `VALIDATION`. **Fix:** map a missing file to `VALIDATION`, or add these codes to the P1 error table.

## 3. P5–P9 contracts — PASS

- `8ba3a051`: each country doc (P5-A3, P6-A1, P7-A1, P8-A1, P9-A1) now points to P1-43. Each uses the shared `IMPORT_SOURCE_CHANGED` (409) and `IMPORT_PREVIEW_EXPIRED` (410) and the same TTL property. Each restates "own rows rejected and counted under P1-29, confidential refuses atomically, replay after authorization". None adds a separate transport. Iceland stays a credit-instruction profile.
- `01d7b85d` F-09: `payroll-v2-p5.md:209` matches P3. SALARY files are locked once the run is PAID (P3 §5.1 step 1, `RUN_ALREADY_PAID`). PAYEE files require PAID and an APPROVED account version, with the requester bar and duplicate-READY rules kept (P3 §5.4, P3-10, P3-28). No other P6–P9 doc restates the rule.

Finding:
- **Low** — `NeoERP-BackEnd/docs/api/payroll-v2-p6.md:277`: a leftover country import code, "proposed 409 `SE_IMPORT_PREVIEW_STALE`". It overlaps P1-43 `IMPORT_PREVIEW_EXPIRED` and `VERSION_CONFLICT`. **Fix:** delete it, or map it to those inherited codes.

## 4. Country rig drafts (`20162615`) — PASS

Skimmed `PAY_NORDIC_*`, `PySuNordic`, persona codes and filing simulation:
- `PAYROLL.TAX_CARD.IMPORT` is added to `PAY_CODES_ALL`, so owner and admin get it. The approver, accountant and employee personas do not.
- Filing upload and feedback need `FILING.SUBMIT` and are labelled simulation-only. Readiness stays UNCHECKED / PARALLEL_ONLY with `liveSubmissionAllowed: false`.
- No bank account is shown or edited. No national id is shown. Iceland pension and union recipients are demo profiles that produce no file.
- The original import code in this commit had no source binding. `d4c3487f` replaced it (item 2).

No new High or Medium issue touching identity, bank accounts, permissions or money.
