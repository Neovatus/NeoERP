---
name: fable-budget
description: "Fable may use at most 50% of the weekly limit (Jabran 2026-11-21); spend it on security reviews and batched decision checks, not small confirmations"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 074a7a2d-fac5-4566-aefe-001b9b6a01eb
  modified: 2026-11-21T08:41:33.882Z
---

Jabran 2026-11-21: "we can only use 50% of our limits with Fable, so use Fable effectively"; clarified: Fable may run up to 50 % of the total limits, **after that it uses paid credits**. On 2026-11-21 the usage card showed "Weekly · Fable" 10 % and extra usage switched off (so over the limit Fable **stops working**, Jabran 2026-11-21; it would charge only if extra usage is turned on). Keep a reserve so a security review never stops half-way: above 40 % only Fable jobs that must finish (a running gate/money/security lane's review); decision checks go to a fresh Opus at high effort and Jabran is told. Check `get_usage` "Weekly · Fable" before starting Fable work: plan below 40 %, start nothing new with Fable at 45 %, never pass 50 % (then the decision checks go to a fresh Opus at high effort and Jabran is told).

**Jabran 2026-11-21 (clarified):** use Fable for substantial work, not few-line reviews or small decisions that the lead or Opus can take. **Effort (Jabran 2026-11-21):** high for security reviews and critical-list views; medium for batched decision checks (rerun one item at high if thin). **Use Fable for:** (1) the independent security review of gate, money and security lanes (first round and real fix rounds); (2) decision checks under the new-Mac rule, **batched**: collect the open decisions of a lane or a batch and send them in one Fable call, not one call per decision; (3) views on Jabran's critical decision lists (ADRs, roadmaps, scope drafts).
**Not Fable:** small fix confirmations after an ACCEPT (Sonnet or Opus as the second, different reviewer, as WORKFLOW allows for smaller money/security fixes), docs reviews, re-checks of wording, settlement re-runs of trivial items. Prefer a fresh short brief over resuming a Fable agent with a long context.
**Why:** Fable is the strongest reviewer but the scarcest; the week's other work must still fit. Related: [[new-mac-lead-effort-decisions]], [[second-reviewer-independent]], [[save-usage-limits]].

**D-43 (Jabran 2026-11-22):** at 45% Fable stops; the second reviewer on gate, money and security lanes is then a fresh, independent Opus until the weekly reset. Fable was at 42% on 2026-11-22 afternoon. Effort: Fable at default (D-44, [[new-mac-lead-effort-decisions]]).

**D-43 tightened (Jabran 2026-11-22 ~13:10):** no NEW Fable work until the weekly reset, starting now (at 42%); running Fable agents may finish. Second reviewer = fresh independent Opus, high effort for security reviews.
