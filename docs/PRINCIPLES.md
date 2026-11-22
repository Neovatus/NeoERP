# NeoERP working principles

Read this first. Every brief links it. When a rule in WORKFLOW.md doesn't cover a situation, apply these. When a rule seems to
contradict them, follow the rule and tell your lead. Jabran 2026-11-22 (D-63).

1. **Test each change once alone, once combined.** The builder proves the change on its own branch (a test per fix that fails
   on the old code). The gate proves it on the combined code before it lands. Everything else is a repeat.
   *Examples: WORKFLOW "Who tests what" (D-49), "Gate scope" (D-47).*

2. **Don't redo what already has evidence; check first, ask if unsure.** Before running a test, review, check or simulator step,
   look at what already ran on the same code (test ledger, review files, gate markers, reports). Unsure → ask the person who
   ran it, in one line. Report what you ran with the commit, the time and counts from that run's own output.
   *Examples: Speed rules 4–5, `.review-channel/test-ledger.md`.*

3. **A second pair of eyes only where a mistake is costly.** The books, company isolation, auth and security, and the gate itself
   get two independent reviewers in round 1. Everything else gets one, plus a real flow test for screens. Only the reviewer who
   asked for a fix checks it again.
   *Examples: "Review tiers" (D-46).*

4. **Find problems as early and as cheaply as possible.** A brief gap found before building costs minutes; the same gap found by
   a gate or a tester costs a round trip. Check briefs before building, run flow tests before review, check reviews before a gate.
   *Examples: Speed rules 1–3, GATE-3.*

5. **Cut work by feature and keep it small.** One feature = one backend lane + one App lane, tested as one user flow. Small,
   proven fixes travel together; cross-cutting work stays separate.
   *Examples: D-57, the phase plan's lanes table.*

6. **One integrator where work meets.** Each module's lead lands its own lanes; one lead merges phases into `main`, checks the
   combined result and owns the phase plan. Code that is fine alone can break when combined.
   *Examples: D-53, D-61.*

7. **Secrets are never visible, and nothing is forced.** Never open, print or grep `.env`, `.local-secrets`, tokens, keys or
   `~/.gradle/gradle.properties`. No `--no-verify`, no force push, no AI attribution. Money rules and product scope are Jabran's.

8. **Measure, then change the process.** Every lane records time per bucket, cost, first-pass gate result and where failures
   came from. Each phase review keeps, changes or drops every rule added during the phase based on those numbers. Rules that
   don't help are removed.
   *Examples: MEASURE-1, the phase plan review (D-55, D-63).*
