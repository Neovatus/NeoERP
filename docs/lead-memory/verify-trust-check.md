---
name: verify-trust-check
description: "Lane 0 only — run old full test command AND verify.sh, both outputs incl. skipped counts in lane-ready; after BE and App match, verify.sh alone per merge (Jabran 2026-11-21)"
metadata:
  node_type: memory
  type: project
  originSessionId: 074a7a2d-fac5-4566-aefe-001b9b6a01eb
  modified: 2026-11-20T23:43:40.699Z
---

Jabran 2026-11-21: for Lane 0, before writing each lane-ready file, run the old full command (BackEnd `./gradlew test`, App `jvmTest`, through lockf) and `scripts/verify.sh` on the same clean commit, and put both results side by side (per module tests/failed/skipped, totals, exit, BUILD SUCCESSFUL, marker written). Explain every difference; an unexplained one means the lane is not ready.

**Why:** prove the new gate matches the old result before trusting it.
**How to apply:** once the BE and App checks both match, verify.sh is trusted and one verify.sh run per merge is enough (no extra old-command run). Related: [[check-test-result-before-push]], [[two-macs-probation]].
