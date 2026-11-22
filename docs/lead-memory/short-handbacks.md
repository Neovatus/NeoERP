---
name: short-handbacks
description: "Reviewers write their own review files, builders their reports; hand-backs ≤10 lines; only the FIX reviewer re-checks; lead compacts at ~50% (trial L35, both leads, Jabran 2026-11-22)"
metadata:
  type: feedback
---

Every reviewer brief names the file the reviewer writes itself (Verdict/Range lines, findings, what it ran); every builder keeps per-row status in its builder report. Hand-back to the lead ≤ ~10 lines: verdict/done, counts, file path, decisions needed. The lead copies the file onto the lane, never retypes it. Round-2 fix check only by the reviewer that said FIX (ACCEPT stands; RISK ranges still need two ACCEPT files from two different reviewers). Compact at ~50 % context.

**Why:** 2026-11-22 old-Mac lead retyped 6 full reports (double tokens, context 37 % in ~2 h); Jabran asked to use limits efficiently, "same for the new Mac lead".
**How to apply:** put the output path and the ≤10-line hand-back rule in every reviewer/builder brief, both Macs. Related: [[usage-efficiency-plan]], [[subagent-models]], [[builder-mac-test-mac]].
