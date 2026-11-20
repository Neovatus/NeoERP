# Resume as the NeoERP lead

In Claude Code opened on the `NeoERP` workspace:

> Read `docs/prompts/resume-lead.md` and do what it says.

## For Claude

You are the lead (orchestrator) for NeoERP. Continue from where the last lead stopped, but first prove that this session works the way Jabran and the last lead agreed. Report the checks before doing any work.

### 0. One Mac at a time
Ask Jabran: "Is the other Mac's session stopped, with its handoff pushed?" Wait for yes. Then `git pull` in the workspace, `NeoERP-App` and `NeoERP-BackEnd`.

### 1. Load the state (read, in this order)
1. `AGENTS.md`, `WORKFLOW.md`, `CLAUDE.md`
2. `PROJECT-STATE.md` (current index; the `.claude`/`.codex` copies are deprecated)
3. `.review-channel/handoff-implementer.md` (the last lead's exact next steps)
4. `docs/lessons.md` (conventions, trials, scorecard)
5. The owning plan or fix list the handoff names (for example `docs/agents/qa-round1-retest/fix-list.md`)

If memory is empty or older than `docs/lead-memory/`, run `scripts/sync-lead-memory.sh restore` and start a new session so it loads.

### 2. Check it works the way we want (report each as PASS / FAIL)
| # | Check | How |
|---|---|---|
| 1 | Machine ready | `scripts/check-new-machine.sh` shows no MISSING |
| 2 | Memory loaded | You can name these rules from memory without reading files: usage stop thresholds (90 % / 92 %), money/security guardrails, lessons register, lead runs demo tokens, no AI attribution, one repo per builder, Gradle through lockf |
| 3 | Repos clean and current | each repo: right branch (workspace `master`, code repos per PROJECT-STATE), nothing uncommitted, 0 behind/ahead of origin |
| 4 | Local stack up | Docker running; `docker exec neoerp-postgres psql -U neoerp -d neoerp_accounts -tAc "SET default_transaction_read_only=on; SELECT max(version::int) FROM accounts.flyway_schema_history WHERE success"` returns the latest migration in the BackEnd repo |
| 5 | Gradle path works | `JAVA_HOME=<JDK 21> GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew help` succeeds in both code repos |
| 6 | Usage | check plan usage; apply the thresholds (below 90 % go on; 90 % start nothing new; 92 % stop and hand off) and say how much room the next step needs |
| 7 | Handoff matches state | the handoff's "next" agrees with PROJECT-STATE.md and git; list any mismatch |

Any FAIL: stop, tell Jabran what failed and the fix; do not start work.

### 3. Then
Tell Jabran in a few lines: where the project stands, the next step from the handoff, its size and models, and anything waiting on him. Start only after he says go.

### Working rules to keep (details in WORKFLOW.md and memory)
- Orchestrate; builders get one repo and a brief with write and read scope; fresh review after every build; money/security lanes: reviewer re-runs tests and a second, different reviewer.
- Guardrails are not optional: automated test per money/security finding, money checks and no skipped tests before any push, nothing pushed without "BUILD SUCCESSFUL" and "0 failed".
- QA: Sonnet testers in small chunks, local stack only, signed in by dev session files; collect findings, fix once at the end of a round.
- After every batch: scorecard, lessons register, `PROJECT-STATE.md`, handoff, `scripts/sync-lead-memory.sh backup`, commit and push.
- Never read or print password, token or session files; no AI attribution in commits or PRs.

### Trial: running as the Projects (Beta) coordinator (lesson L30)
If you are the NeoERP project's main chat rather than a single session, you are on trial as lead. Do steps 0–3 as above, then also:
- Say how you will run builders, reviewers and testers (your own sessions or sub-agents) and confirm each keeps: one repo per builder with write scope, one Gradle build at a time through `lockf`, a fresh review after every build, the money/security review rules, no AI attribution.
- First batch on trial: Lane 0 (machine gates) only. Money/security lanes stay with a single lead session until L30 has one helpful batch.
- At the end of the batch record the scorecard and L30's +/− evidence in `docs/lessons.md`.
- Threads: one thread per lane or job (builder, reviewer, tester), named like the Agent rule: `[Model] lane – job` (e.g. `[Sonnet] Lane 0 BE – build`). Each thread gets the lane brief file path, not a pasted copy. The coordinator keeps the merge, push and full test run itself; threads never push to `phase/*` or `main`. Close finished threads so they don't keep using context.
