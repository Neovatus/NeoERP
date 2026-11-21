# Lane ready: HRP-SPECS (HR/Payroll v2 specs from the approved change list) — 2026-11-21

**Repo / branch:** `NeoERP-App`, `phase/hrp-v2-specs` (pushed, head `cee72801`, 16 commits). Merge target: App `phase/hrp-v2` (cut at `87ae114c`, which holds UX-1). Docs only: no code, no Gradle, no `verify.sh` needed for the specs (the hook's NORMAL path decides).
**Brief:** `docs/agents/hrp-specs/brief.md`. Approved: Jabran 2026-11-21 (HRP-DES change list, all decisions as recommended; HR v2 starts on this Mac on `phase/hrp-v2`).
**Builder:** Opus 5.5 high. **Reviewer:** Opus 5.5 fresh, high (review 1 FIX → review 1b ACCEPT). The lead applied review 1b's one minor (n1).

## What changed
- Six specs rewritten in place from the change list: `docs/design/specs/hr-h1.md`, `hr-h2-h3.md`, `hr-h4.md`, `payroll-p.md`, `ess.md`, `people-access.md`. Each has the status line "Updated 2026-11-21 (HRP-SPECS)".
- Shared rules written once: hr-h1 §12 (HR v2 foundation: company column + RLS from the first migration, ADR-026 R4; owner role `NOSUPERUSER NOBYPASSRLS`; one format; UX-1 sizes; approval model) and payroll-p §17 (Payroll specifics). The other specs point to them.
- All v1 keep/migrate/workaround text removed (backfill, quarantine, legacy runs, interim calculator).
- Jabran's answers built in: decisions 1–3 (v1 deleted, data not kept), 4 (D1 country order, J-8), 6 (bands on total run cost), 13 (quick-add until the H4 wizard), 14 (phone clock-in, supervisor sheet, project/task timesheets, biometric file import), 17 (business type pre-fills a starter setup only; frame built in Org with H2), PY.10 (Sweden sick-pay blocker open).
- Record: `docs/agents/hrp-specs/applied.md` (71 items: 60 applied, 11 partly, 0 not), `builder-report.md`.

## Reviews (`docs/agents/hrp-specs/`)
- `review-1-opus.md` (`a77622d6`): FIX, 1 MAJOR (supervisor-sheet approver undefined; could land on the recorder; store supervisor lacked the RECORD grant), 9 MINOR. All fixed (`edfae965`…`fe035258`).
- `review-1b-opus.md` (`0709e2bc`): ACCEPT, one new minor n1 (the fallback approver could have their own row on the sheet). Fixed by the lead in `cee72801` (§15.6, §17.7, §22 lines: "never a person whose own row is on the sheet"), plus the two Accounts-contract confirm rules in payroll-p §13 that review 1b named.

## Lead decisions (small, per the decision rule; in `builder-report.md`)
1 Post buttons: a fixable state blocker keeps a disabled Post with the reason; parallel-run Post removed. 3 Starter-set table: a proposal for the H2 slice. 4 Agreement profiles in the Organisation group. 5 Agreement field hidden until profiles exist; H2 "Assign to job rows". 6 "Being rebuilt" empty state for employee-only users until ESS v2 Home. 7 "under 6 characters" copy left; app-wide sweep to `NeoChangeReason.MIN_REASON_LENGTH` as a follow-up.

## Partly applied (11): owners
X.6, H1.6, ES.5 app-wide short-height rule for panels and sheets (lead D-n + `screen-standard.md` §9, PS-7); X.7, X.10, H23.3 component contracts (`time-field.md`, `time-grid.md`, `stepper.md`…), with the HR v2 component lanes; X.18 business-type field in `org.md` (Org lane, H2); PY.1 workspace Payroll scope amendment (lead, workspace); ES.1 go-live row (BackEnd docs); X.5, ES.3 top-task sizes "to re-measure" in the rig run.

## Rendering
Render script over `docs/design/specs` against `87ae114c`: no new raw HTML (new `<cid>`-style placeholders are inside code marks); the raw-HTML and missing-link warnings in payroll-p and people-access were already there at the base (links point to the BackEnd repo).

## Write-scope check
`docs/design/specs/{hr-h1,hr-h2-h3,hr-h4,payroll-p,ess,people-access}.md`, `docs/agents/hrp-specs/**`. Inputs folder deleted. No AI attribution (checked all 16 commits).

## Docs pages
User guide: none (the HR v2 screens are not built). Developer/design: the six specs above.

## For Jabran
1. **Critical: who may change payroll approval limits** (payroll-p §13, marked "proposal, for Jabran"; final in the P0 contract). Mirrors the approved Accounts contract (READ / UPDATE / CONFIRM, AL-D11):
   - READ: Owner, Payroll admin, Payroll approver, Accountant (Auditor where there is one)
   - UPDATE (propose): Owner, Payroll admin
   - CONFIRM: Owner, Payroll approver; never the proposer, never a stand-in, never a person the proposal names as an approver. Owner-only company: Owner confirms alone with the "confirmed alone" banner (SR-L3).
   Lead's recommendation: approve as proposed.
2. Verdict (lead's call: MERGE into App `phase/hrp-v2`).
