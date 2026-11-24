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
   *Examples: Speed rules 1–3, GATE-3.* A check that repeats belongs in an automated test; the simulator is for first looks and real-device behaviour (D-69).

5. **Cut work by feature and keep it small.** One feature = one backend lane + one App lane, tested as one user flow. Small,
   proven fixes travel together; cross-cutting work stays separate.
   *Examples: D-57, the phase plan's lanes table.* A sub-agent is for independence (reviews), large context (builders) or
   parallel work (testers); otherwise the lead does it, and a fix round resumes the builder that knows the code (D-65).

6. **One integrator where work meets.** Each module's lead lands its own lanes; one lead merges phases into `main`, checks the
   combined result and owns the phase plan. Code that is fine alone can break when combined.
   *Examples: D-53, D-61.*

7. **Secrets are never visible, and nothing is forced.** Never open, print or grep `.env`, `.local-secrets`, tokens, keys or
   `~/.gradle/gradle.properties`. No `--no-verify`, no force push, no AI attribution. Money rules and product scope are Jabran's.

8. **Measure, then change the process.** Every lane records time per bucket, cost, first-pass gate result and where failures
   came from. Each phase review keeps, changes or drops every rule added during the phase based on those numbers. Rules that
   don't help are removed.
   *Examples: MEASURE-1, the phase plan review (D-55, D-63).*
   Every builder, reviewer and tester hand-back ends with one line **"Brief: unclear or missing — …"** (or "none"). The lead counts these per lane and fixes the brief template and the brief check where they repeat (D-67).

9. **Many leads, one project.** Any lead can take any work (build, review, test, docs, design); no lead is fixed to a role. How
   many leads, on which Mac or plan, changes; these hold for all of them (Jabran 2026-11-24):
   - **Claim first, release when done.** The line in `.review-channel/claims.md` decides who owns a piece of work, not the lead's
     usual job. Never change work another lead has claimed; ask in one line in `.review-channel/` instead.
   - **Never approve your own work.** The reviewer or verdict comes from another lead or a fresh sub-agent; for tier-2 work
     prefer a lead on a different plan, so the review is independent and the cost is spread.
   - **Own space on a shared Mac.** Each lead works in its own worktree under `NeoERP-worktrees/`; the main checkouts are for
     Jabran's manual testing. Shared machine resources (Gradle, the local stack, ports, the database) are taken through
     `scripts/gradle-job.sh` locks or a claim line, never assumed free.
   - **One writer per record.** Each lead keeps its own handoff file; shared files (claims, PROJECT-STATE, memory, lessons) get
     short edits, pulled right before and pushed right after. Decision numbers carry the lead's tag, so they never clash.
   - **Shared plan, shared budget.** Leads on the same plan count usage together; the 90 % / 92 % stops and the Fable budget
     cover all of them. Before starting large work, look at what the other leads on that plan are running.
   - **Same rules for every lead.** Gates, reviews, guardrails and Jabran's decisions apply whichever lead, Mac or plan does the
     work.
