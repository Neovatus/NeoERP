---
name: principles-first
description: docs/PRINCIPLES.md (8 principles) is read first and linked in every brief; lanes log cost + first-pass gate; phase reviews keep/change/drop each new rule (Jabran 2026-11-22, D-63)
metadata:
  type: feedback
---

Jabran 2026-11-22 (D-63, after Warp/Anthropic "self-improving agents" tips): principles over rules.
- `docs/PRINCIPLES.md` (8 principles) — link it at the top of every brief and sub-agent prompt; WORKFLOW rules are examples.
- MEASURE-1 adds **cost** (sub-agent tokens per lane: build / review / test) and **first-pass gate** (yes/no + failure origin).
- Each phase review marks every rule added in that phase keep / change / drop with its numbers; dropped rules are removed from WORKFLOW.
**Why:** rules piled up today (D-43…D-61); builders missed brief points; nothing was ever pruned.
**How to apply:** put "Read docs/PRINCIPLES.md first" in every brief/agent prompt I write; record agent token usage per lane; prune at each phase review. Related: [[speed-rules]], [[review-tiers]], [[lessons-register]].

**D-67:** every builder/reviewer/tester prompt I write ends with: hand back a final line "Brief: unclear or missing — …" or "none"; log it in the lane Timeline.
