---
name: workflow-v2
description: D-81 (Jabran 2026-11-24) workflow v2 direction; supersedes review tiers' second reviewer, the 2nd-different-reviewer guardrail and phase/<N> lane branches once approved
metadata:
  type: project
---
Jabran 2026-11-24 (D-81 + addendum): too many reviews, briefs/builders not efficient, process too complex.
- Branches module → feature → flow: `<module>/<feature>` (one PR) or `<module>/<feature>/feature` + `/<flow>`; shared work `core/`; cross-module owned by the module whose flow it delivers. Hooks must protect these names first (job `core/gate-branches`).
- Flow = brief (frame, not fence; standards win) → builder discovery+plan (reads both repos, writes one) → build+tests (Definition of Done: all case kinds incl. explicit null) → flow test → ONE review by one Opus 5.5 at high effort (Jabran 2026-11-24 addendum 9; Fable only when he asks) → one fixer per repo (resumed builder) → gate → merge. Feature end: feature review, whole suite, PR to main.
- No second reviewer anymore (replaces [[review-tiers]] tier 2 and the 2nd-reviewer part of [[money-security-guardrails]]).
- Draft `docs/process/workflow-v2-draft.md` + `docs/templates/`; WORKFLOW.md stays until Jabran approves.
**Why:** Phase 4: ~215 review files, 26 fix rounds, 48 % review repeats; seam bugs missed by lane reviews.
**How to apply:** brief every new job from the templates; order: core/gate-branches → core/phase-4-fixes → accounts + hr features.

Updated 2026-11-24 (addenda 6–9): a flow is six steps: brief → builder discovers/plans/implements/tests (own tests only) → review+test (code, screens, simulator) → fix brief → the SAME builder (resumed) fixes and writes per finding how it was missed and why (addendum 10) → review+test again → merge. Whole suite only for full module features after asking Jabran.
