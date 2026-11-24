# Workflow review — discussion topics (Jabran 2026-11-24)

Runs after Phase 4 is on `main`, before the GATE-3 phase and before 4b / HR. Every review here is independent (D-79): lead's view + a fresh Opus/Fable from raw sources; disagreements go to Jabran.

## Inputs already written
- `.review-channel/phase4-review.md` (lead), `phase4-review-independent.md`, `phase4-review-compare.md` (**12 decisions for Jabran**, deferred to this review), `phase4-review-data.md`.

## Topics
1. **Briefs and builders** (Jabran's ask): brief gaps ("Brief: unclear or missing", D-67), rework causes, first-pass rate per builder, fix rounds, cost per lane.
2. **The 12 open decisions** from the comparison, incl. the three biggest:
   - whole suite at phase → `main` once lane gates are scoped (the D-47 + fast-forward hole: nothing tests all code together);
   - more gate scripts vs checklists (gate lanes cost ~36 of 75 HIGH/MEDIUM findings, GATE-3a ~780 k tokens); cut the GATE-3 phase to a 1-day, incident-backed list?
   - second reviewer: a different model (Fable 5.2 medium, high for the biggest money/isolation lanes) or a seam-focused brief.
3. **Rule churn:** WORKFLOW +62 % in three days; rules reversed within hours; measure before adding (D-63 never enforced).
4. **Architecture (raised by Jabran 2026-11-24):**
   - **Calls per screen:** the App calls services directly through the gateway (routing + security only, no aggregation, no backend-for-frontend); sign-in uses one bundled bootstrap call; some screens make several calls. Measure calls per screen (agent) and decide if chatty screens need screen-shaped endpoints.
   - **Thin App:** business rules belong to the backend, but the App re-implements small decisions (two-person reason `TwoPersonReason`, "waiting for you", stand-in visibility). Should the backend send ready decisions (`canApprove` + reason, `canConfirm`) so the App only displays them?
   - **Cross-service consistency:** one transaction per service; reads via `/api/internal/...`; writes across services via outbox/inbox (eventual consistency); no saga/distributed transactions. Confirm this is the intended model for HR/Payroll ↔ Accounts posting.
5. **Seam testing:** strict fakes, contract tests, four-language size tests (D-73); end-to-end trial (Maestro / AXe, D-75).
6. **Two Macs:** 16 GB Gradle-lock waits (D-61), heavy runs on the 36 GB Mac, gates and simulator slots.
7. **Simulator sessions:** data-prep checklist run and checked before testers; plan steps checked against the spec (by-design behaviour); personas + accessibility pass.
