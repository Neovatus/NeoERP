# SEC-1 brief: security clean-ups from the legacy sweep (backend) — approved by Jabran 2026-11-16

Worktree: `NeoERP-worktrees/sec1-be` (create from `origin/phase/4`), branch `phase/4-sec1`. Work only there.
Context: `docs/agents/legacy-sweep/report.md` items 7 and 9 (workspace). We're in dev, no customers; the local stack was
reset and reseeded on 2026-11-16 (so no legacy plaintext bank rows exist anywhere we care about).
Read: backend `AGENTS.md`, ADR-016 (lines ~57-85), `docs/modules/auth-sessions/security-tiers.md` (legacy-machine-paths),
`docs/api/accounts-decisions-for-jabran.md` (bank details at rest, the "OPEN — drop the plaintext bank columns" entry),
`BankDetailsBackfill` and the V35 guards.

1. **Legacy scopes and machine paths (item 7):** accept only `neoerp.app` for people plus each machine client's
   capability scopes; remove the legacy scope list handling; delete audit-service's `legacy-machine-paths` (7 entries)
   by moving each caller to a proper machine scope/audience — list each entry, its caller, and what replaces it. If a
   caller has no replacement yet, stop and ask.
2. **Plaintext bank columns (item 9):** a new forward accounts migration drops the legacy plaintext bank columns of
   `suppliers`, `supplier_bank_change_requests` and `customers` and the V35 guards' backfill branches; delete
   `BankDetailsBackfill` and its runner; reads no longer accept legacy rows. Startup must still refuse when sealed
   data exists without keys (unchanged).
3. Docs: ADR-016, security-tiers.md, decisions log (mark the OPEN entry done, D-205), db-design.
Tests: every affected service's full test run + architecture tests; a test that a legacy-scope token is refused; Flyway
fresh + on seeded data. **Opus security review follows before merge.**
Stop and ask when: a change touches sign-in/token issuance beyond scope acceptance; a caller of a legacy path can't be
moved; an applied migration would need editing.
Rules: Gradle through the lock (`JAVA_HOME=/Users/jabransiddiqui/Library/Java/JavaVirtualMachines/jbr-21.0.7/Contents/Home GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew <task> -Dorg.gradle.jvmargs=-Xmx3g -Pkotlin.daemon.jvmargs=-Xmx3g`);
plain commits, no Co-Authored-By or AI attribution; no push/merge/rebase; never `gradlew --stop`; never touch
`NeoERP/NeoERP-BackEnd` (Jabran's running backend) or other worktrees; no services; never read PROJECT-STATE*.md or
.local-secrets; never print secrets. Reply with commits, files, migration, tests, decisions, open questions.
