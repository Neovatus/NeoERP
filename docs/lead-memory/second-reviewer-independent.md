---
name: second-reviewer-independent
description: Second, different reviewer (/security-review or Codex) gets only the lane diff and brief, never the first review's findings (Jabran 2026-11-21)
metadata:
  type: feedback
---

The second reviewer on money/security lanes gets the lane diff range and the brief only, not the Opus review or its findings, so it reaches its own conclusions. Start both reviews independently (in parallel is fine).

**Why:** Jabran 2026-11-21: an agent handed another review's conclusions tends to confirm them.
**Model (Jabran 2026-11-21):** for a gate lane itself (money/isolation gates, e.g. Lane 0) the second reviewer is at least as strong as the first: Fable with /security-review. Sonnet is fine as second reviewer for smaller money/security fixes.
**How to apply:** every money/security lane; merge the two finding lists afterwards. Related: [[money-security-guardrails]].

**D-79 (Jabran 2026-11-24):** independence applies to process reviews too. Every phase review and the workflow review get a fresh Opus that reads only raw sources (never the lead draft) and makes its own calls; the lead compares and sends every disagreement to Jabran. "An independent review finds more than the review only."
