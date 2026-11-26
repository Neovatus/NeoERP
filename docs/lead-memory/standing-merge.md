---
name: standing-merge
description: Approved lanes merge to phase/* and Phase PRs to main without waiting for Jabran, on both Macs (Jabran 2026-11-22)
metadata:
  type: feedback
---
Jabran 2026-11-22: "if things are approved don't wait for my go to merge, merge them with your sequence same for both mac".

A lane merges to its `phase/*` branch as soon as it has the full gate marker (light marker for docs/script lanes), the required ACCEPT review files, a MERGE verdict file and no open question for Jabran. Fast-forward one lane at a time in dependency order, then do the usual clean-up and records, and tell the other lead which lanes must rebase.

**Why:** the Phase 4 timing showed 12–18% of lane time was waiting for his MERGE (verdicts at night waited until morning).

**How to apply:** both leads; normally the test Mac merges right after its gate and verdict. Still Jabran's: `phase/*` → `main` PRs, drafts that change scope/rules/decisions on workspace master, lanes with FIX, a failed gate or an open decision. Money/security lanes keep their guardrails ([[money-security-guardrails]]): re-runs and a second, different reviewer before the verdict. Written in WORKFLOW "Standing merge". Related: [[builder-mac-test-mac]], [[two-macs-probation]].

**Extended same day:** "don't wait for me to merge PR if verdicts are merged" → Phase PRs to main also merge without him, after every lane merged + the final whole-suite gate on the phase head (both repos) + a MERGE PR verdict; merge commit, no squash/force. Still his: money rules, product scope, rule/scope drafts.
