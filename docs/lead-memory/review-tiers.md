---
name: review-tiers
description: Second reviewer only on tier-2 lanes (books, isolation, auth, gate, large); tier 1 = one Opus; no repeat re-stamps; no Sonnet second review (Jabran 2026-11-22, D-46)
metadata:
  type: feedback
---

Review tiers (Jabran 2026-11-22, D-46; WORKFLOW "Review tiers"). The lead sets `Review tier: 2|1` in every brief.
- Tier 2 (two independent reviewers, round 1 only): posting/ledger/journals, tax amounts, payments/bank, balances, money-table migrations; auth, tokens, permissions, company isolation, encryption; gate/verify/hook scripts; >~15 files on risk paths. Fable + Opus; while Fable is paused, Opus + `Opus 5.5 security (D-43)` at high.
- Tier 1: other risk-path changes → one Opus at high; everything else → one Opus default + simulator check for App screens. No Sonnet second reviewer.
- No repeats: only the FIX reviewer re-checks; the other re-stamps only if the fix touches its angle; no re-stamp on clean rebases (once GATE-3 lands; until then RISK lanes still need two gate files).
**Why:** 2026-11-22: 17 of 25 review runs were repeats; real findings came from first reviews; the second reviewer earned its cost only on books/isolation (AC418-BE double-receivable HIGH).
**How to apply:** write the tier in each brief; pick reviewers from it; tell the new Mac. Related: [[money-security-guardrails]], [[second-reviewer-independent]], [[new-mac-lead-effort-decisions]], [[fable-budget]].
