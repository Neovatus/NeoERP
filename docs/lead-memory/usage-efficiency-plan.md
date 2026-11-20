---
name: usage-efficiency-plan
description: How to spend plan limits (Jabran 2026-11-19): Sonnet testers in small chunks, review checklist in briefs, big parallel work early in a 5-h window, lead compacts at ~50%
metadata:
  type: feedback
---

After the QA1 day burned the 5-hour limit by mid-afternoon, Jabran agreed:
- Testers (scripted steps with expected results) run on **Sonnet**; Opus stays for builders, reviews and grouping findings.
- Testers work in **small chunks**: ~4 tests or ~6 groups per tester, then a fresh one (cost grows with context).
- Every builder brief carries the **review checklist** the reviews kept catching: desktop/keyboard behaviour unchanged, contract-mapping tests required, shared component changes list their callers, iOS compile, read the real test result.
- Start big parallel work **early in a 5-hour window**; small work late. Below 90% still keep going ([[usage-stop-thresholds]]).
- Lead asks for `/compact` at ~50% context, not 80%; agents read big files and summarise instead of the lead reading them.
- No artifact for QA results ([[qa-report-no-artifact]]). Gradle/Xcode background runs are free: keep them.

**Why:** roughly halve usage per test round and cut a third per fix batch. Overrides the tester part of [[subagent-models]] (testers count as fully decided work).
