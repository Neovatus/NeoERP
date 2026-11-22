---
name: speed-rules
description: D-51: batch fixes per lane, flow/simulator test before review, Opus brief check, check first / don't repeat / ask before re-running tests or reviews (Jabran 2026-11-22)
metadata:
  type: feedback
---

Speed rules (Jabran 2026-11-22, D-51; WORKFLOW "Speed rules"), with [[review-tiers]] (D-46), gate scope D-47 and who-tests-what D-49.
1. Batch 2–3 related fixes into one lane; one review + one gate per batch.
2. App lanes: simulator/flow test by a tester sub-agent BEFORE the reviewers.
3. A fresh Opus checks each brief (~5 min) before the builder starts.
4. **Check first, don't repeat, ask:** before re-running any test, review or check, look at what already ran on the same code (builder report, review files, gate markers, lane-ready, the other lead's inbox). If unsure, ask the builder/reviewer/other lead in one line. Re-run only when that area changed or evidence is missing. Hand-backs list what ran, sha, counts.
**Why:** Phase 4 took weeks; review+fix 42 %, gate 19 %, 68 % of review runs were repeats on 2026-11-22.
**How to apply:** put rules 1–3 into every new brief/plan; apply rule 4 before every gate, review or tester I start. Also: no stack/simulator while a gate runs on this Mac.
