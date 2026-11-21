---
name: new-mac-lead-effort-decisions
description: NEW-MAC LEAD ONLY — sub-agents at High effort; my recommended open decisions get written reasons + Fable 5.2 (high) approval before acting; still-open or critical ones go to Jabran
metadata:
  node_type: memory
  type: feedback
  originSessionId: 074a7a2d-fac5-4566-aefe-001b9b6a01eb
  modified: 2026-11-21T04:29:40.169Z
---

Applies to the new-Mac lead only (Jabran 2026-11-21), not the old-Mac lead. Public copy: `.review-channel/claims.md` "New-Mac lead rules".

1. **Model table (Jabran 2026-11-21):** Sonnet high for fully decided mechanical work (wording fixes, scripted testers, screenshot regeneration); **Opus medium** for docs and design written from specs that leave gaps (the one exception to High); Opus high for builders and reviewers of money, security, gates, ADRs and scope; Fable **high** for security reviews of gate/money/security lanes (and their fix rounds) and for views on Jabran's critical lists; Fable **medium** for batched checks of substantial lead decisions, rerun at high only for an item that comes back thin ([[fable-budget]]). Apart from that exception, every sub-agent I start runs with `effort: "high"` (was medium/default), and the lead session itself runs at High (Jabran 2026-11-21; set in the app by Jabran, a session cannot raise its own effort; check with get_session "self" at resume and ask him if it is lower).
2. When I have an open decision with a recommendation: write the question, options, my pick and **why** in `.review-channel/lead-decisions.md`, then a reviewer approves or rejects it: **small decisions** (wording, scope of a test, one-line mechanics, anything easily reversed) the lead takes or a fresh Opus checks; **substantial ones** (design, security mechanism, anything hard to reverse) go to a fresh Fable 5.2 at high effort, batched (Jabran 2026-11-21 clarified) (it gets the entry and the sources, not my wider reasoning). APPROVE → act and note it. REJECT or still open → Jabran. Anything critical (money, security, scope Jabran approved, product direction) → Jabran directly, with the Fable view attached.

**Why:** Jabran wants my calls checked by a strong independent reviewer and visible to everyone, without changing the old Mac's process.
**How to apply:** pass effort "high" on every Agent call; never act on my own recommendation for an open decision until a Fable APPROVE row exists. Decisions Jabran already owns (e.g. roadmap §7, ADR-026 D1–D11) stay his. Related: [[check-approved-decisions]], [[second-reviewer-independent]], [[two-macs-probation]].
