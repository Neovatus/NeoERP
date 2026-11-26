---
name: ask-before-whole-suite
description: Whole test suite only for full module features, never for fixes, and only after asking Jabran first (2026-11-24)
metadata:
  type: feedback
---
Never start a whole-suite run (BE `test` on all services, App full jvmTest, `verify.sh --full`) without asking Jabran first, and never for fixes or hot fixes: fixes get the fixers' own tests + a scoped check only. Builders/fixers run only the tests they wrote or changed plus a compile.
**Why:** on 2026-11-24 two fixers lost ~65 min to full runs and the lead started two more whole suites without asking; Jabran: "that for full modules not the hot fixes, you should ask me when the run full".
**How to apply:** before any whole-suite command, ask in one line with the expected minutes. Related: [[workflow-v2]].

Updated 2026-11-25: also the scoped gate and any gate-script edit are run only after asking Jabran ("as we reviewed the feature"); default before a feature PR = feature review + builders' own tests.
