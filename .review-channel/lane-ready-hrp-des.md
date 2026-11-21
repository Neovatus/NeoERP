# Lane ready: HRP-DES (HR/Payroll design refresh) — 2026-11-21

**Repo / branch:** workspace `NeoERP`, `phase/4-b2-hrp-des` (pushed, head `2f1ec4f`). Merge target: workspace `master`; the change list stays in `docs/drafts/` until Jabran approves it.
**Draft:** `docs/drafts/hr-payroll-design-refresh.md`: **71 change items, 36 critical**, across hr-h1, hr-h2-h3, hr-h4, payroll-p, ess, people-access and cross-spec; 17 decisions.
**Brief:** `docs/agents/hrp-des/brief.md` + `docs/agents/design-brief-common.md`. Asked: Jabran 2026-11-21.
**Approval path (Jabran 2026-11-21):** Opus draft → Opus review → Fable 5.2 settles non-critical items → **Jabran approves the whole list**, reading the critical items and anything Fable sent to him. **The HR v2 build starts on this Mac on `phase/hrp-v2` after that approval**, with batch 2 keeping the Gradle lock first.

## Reviews (`docs/agents/hrp-des/` on the branch)
- `review-1-opus.md`: FIX, 1 BLOCKER (pay-run approval kept to one approver against AL-D16, Jabran 2026-11-15), 5 MAJOR (country order reversed Jabran's D1/J-8 unnamed; cipher claim wrong; no runtime DB roles for hr-service/payroll-service, so RLS would do nothing; AL-D5 missed; four items mislabelled), 10 MINOR.
- `review-2-opus.md`: fixes only: all 16 fixed; FIX for 1 new MAJOR (quick-add removed before the H4 wizard exists: no way to add an employee) + 5 MINOR. Round 3 (drafter) checked by the lead: fixed.
- `fable-settlement.md` (incl. "Additions 14–17": agree with change on all four; 10 of 11 new items settled with change): non-critical 36 → 23 settled, 12 settled with change, **1 to Jabran (PY.10, now critical: its Sweden sick-pay card is an unapproved post-gate draft)**; a view on every critical item and decision. All Fable changes applied and marked "(Fable)".

## Rendering
GitHub renderer + script: clean. Browser-pane look: not done.

## Write-scope check
`docs/drafts/hr-payroll-design-refresh.md`, `docs/agents/hrp-des/**`. No AI attribution (checked). Rebased on `master` before round 2; merge with `--no-ff`.

## Docs pages
User guide: none: a design change list. Developer pages: none: no code; the specs change when the list is approved.

> **Jabran 2026-11-21:** decisions made for the old v1 HR/Payroll/ESS code (e.g. 2026-10-09 "data is kept") are outdated; the rebuild replaces them, so a change to them is not a reversal. Decisions on the **v2 design** (gates G-1..G-4, payroll D1/J-8, the 2026-10-21 approvals) still stand unless Jabran changes them here.

## For Jabran: 17 decisions — **1–3 answered 2026-11-21: old HR/Payroll/ESS code deleted, data not kept**; (all recommended yes unless noted; Fable's view per item in `fable-settlement.md`)
1. HR v2 and Payroll v2 on a new schema (company column, composite keys, RLS from the first migration). **This reverses your 2026-10-09 "data is kept".**
2. v1 HR, Payroll and ESS stop working from the first v2 migration; hidden until each v2 area ships.
3. Amend the signed-off Payroll P0 scope: new schema, no interim calculator, no legacy runs.
4. **Payroll country order: does it amend your D1 and J-8?** Today PK → NO → SE → DK → FI → IS; three options, size L; first: does J-8's "all six signed off before launch" still hold?
5. HR approvals on the shared approval model from H2 with company-set steps. **Amends hr-h2-h3 §24 (your G-4 approval).**
6. How AL-D16 is built for pay runs: **choose the band basis: net pay, or total run cost (Fable's preference)**, and how the Owner's own pay run works on multi-step bands.
7. Payroll posting carries the shared dimensions (amend P2 and A5).
8. Shared file store from the start; a shared field cipher as a build step.
9. The money, security and statutory guardrails cover the whole HR/Payroll build.
10. A5 is an Accounts lane that lands before Payroll P2; P0 and P1 do not wait.
11. ESS bank changes serve a customer only once the bank-change notice is really e-mailed.
12. Cross-company reads stay one company per call.
13. Two texts aligned to your approved decisions: (a) quick-add stays until the H4 wizard replaces it; (b) H23.8 (O1 line not provably stale: what checks it is stated).
14. **Time recording modes** (Jabran addition): v2 = phone clock-in, supervisor sign-in sheet, project/task timesheets (project dimension, labour cost to projects), biometric file import; later = kiosk, geofence, offline. A second person confirms sheets and device imports; one source of paid hours per person per day (Fable).
15. **Sick-pay refunds and follow-up plans** in each country's v2 slice. Sweden's general sick-pay refund was repealed on 1 July 2024 (Fable, corrected in PY.13).
16. **Collective agreements:** company-defined agreement profiles in v2 (overtime, allowances, shift premiums); ready-made libraries later.
17. **Business type at enrollment** (company and each franchise/branch): pre-fills a starter setup only, everything stays configurable, no code branches on the type; starter sets hold no figures (Fable). Cross-module (also Items/Inventory decision 2).
Decision 4 now also shows Fable's updated view: with Pakistan + Nordic as one first market group, keep your D1.
Plus **PY.10** (critical): the Sweden sick-pay card is an unapproved draft; approve, change or drop it.

**Before the build can start:** your approval of this list, **ADR-026 accepted (D1–D11)** and its **R1 built** (shared binder and the four flag functions). R1 is a BE money/security lane: re-runs and a second reviewer.

**Not verified:** no environment checked for real HR/Payroll data (decision 1 assumes dev only); IAM employee links not read; rig not opened; Nordic country payroll drafts read for order and status only.
