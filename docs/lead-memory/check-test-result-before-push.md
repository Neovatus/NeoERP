---
name: check-test-result-before-push
description: "Never chain a push after a background test run's \"exit\" line; read BUILD SUCCESSFUL and \"0 failed\" first, then push in a separate step"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-19T20:02:01.384Z
---

On 2026-11-19 the lead pushed the QA1 app merge to phase/4 although the full jvmTest had failed (3 size tests): the background command echoed "exit $?" of the pipeline (always 0), and the push command checked only ancestry.

**Why:** pushes to phase/4 must be green; no force-push is allowed, so a red push can only be fixed forward.
**How to apply:** in background test commands capture the gradle exit with `${pipestatus[1]}`/PIPESTATUS or grep "BUILD SUCCESSFUL"; push only in a separate command after reading "BUILD SUCCESSFUL" and "N tests completed, 0 failed". Related: [[targeted-test-runs]], [[push-after-commit]].
