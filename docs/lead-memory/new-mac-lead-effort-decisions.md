---
name: new-mac-lead-effort-decisions
description: "Rule 1 (default effort; Opus high only for security reviews; Fable stop 45%, D-43/D-44) applies to BOTH leads on this account (Jabran 2026-11-22); rule 2 (decisions need written reasons + Fable approval) stays new-Mac lead only"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 074a7a2d-fac5-4566-aefe-001b9b6a01eb
  modified: 2026-11-21T04:29:40.169Z
---

Public copy: `.review-channel/claims.md` "Rules for this account and lead".

**Scope update (Jabran 2026-11-22):** both Macs now use the same Ultra account. The model and effort rules (1) and the Fable budget (3) belong to **this account and subscription**, so they apply to **both leads** (old Mac included). Rule 2 (decision log + Fable approval) is part of the new-Mac lead's probation and stays new-Mac only. Was 2026-11-21: new-Mac lead only.

1. **Effort (Jabran 2026-11-22, D-44; replaces the 2026-11-21 High rule):** Opus and Fable at **default effort** (omit `effort`) for builders, reviewers, decision checks and docs; **only security reviews by Opus at `effort: "high"`**; Sonnet may use high when the work needs it. Models unchanged: Sonnet for fully decided work, Opus builders/reviewers, Fable second reviewer on money/security/gate lanes + batched decision checks. **Fable stop (D-43):** at 45% of the weekly limit Fable stops; the second reviewer is then a fresh independent Opus until the reset ([[fable-budget]]). Not retroactive for running agents.
2. When I have an open decision with a recommendation: write the question, options, my pick and **why** in `.review-channel/lead-decisions.md`, then a reviewer approves or rejects it: **small decisions** (wording, scope of a test, one-line mechanics, anything easily reversed) the lead takes or a fresh Opus checks; **substantial ones** (design, security mechanism, anything hard to reverse) go to a fresh Fable 5.2 (default effort), batched (Jabran 2026-11-21 clarified) (it gets the entry and the sources, not my wider reasoning). APPROVE → act and note it. REJECT or still open → Jabran. Anything critical (money, security, scope Jabran approved, product direction) → Jabran directly, with the Fable view attached.

**Why:** Jabran wants my calls checked by a strong independent reviewer and visible to everyone, without changing the old Mac's process.
**How to apply:** omit effort on Agent calls except Opus security reviews (high) and Sonnet when needed; never act on my own recommendation for an open decision until a Fable APPROVE row exists. Decisions Jabran already owns (e.g. roadmap §7, ADR-026 D1–D11) stay his. Related: [[check-approved-decisions]], [[second-reviewer-independent]], [[two-macs-probation]].
