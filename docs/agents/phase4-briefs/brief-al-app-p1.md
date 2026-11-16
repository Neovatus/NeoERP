# AL-P1 brief: approval limits app — data layer and Limits area (Phase 4, app)

Worktree: `NeoERP-worktrees/al-app` (create from `origin/phase/4` of NeoERP-App), branch `phase/4-al-app`. Work only there.
Read: app `.claude/CLAUDE.md`, `ARCHITECTURE.md`, `AGENTS.md`; spec `docs/design/specs/accounts-approval-limits.md`;
rig `docs/design/screen-rig/accounts-al.jsx`; the **approved backend contract** — copy it into
`docs/agents/approval-limits/backend-contract.md` from the backend repo `docs/api/accounts-approval-limits.md` (on
`origin/main`) as your first commit — esp. §2.1, §4, §5, §7 (limits API incl. the answer fields), §8 (stand-ins API),
§11, §13 (one person id); `docs/design/specs/building-blocks.md`, `docs/design/screen-standard.md`,
`docs/agents/i18n/naming-standard.md`. UI gates 1–8 apply (gate 8: size tests with the shared device matrix).

Build:
1. Data layer: ApprovalLimitsApi (read, check an amount, propose, confirm, decline, withdraw, acknowledge-alone,
   history + CSV) and ApprovalStandInsApi (list, mine, candidates, create/change/end, history); DTOs tolerant of
   unknown enums; mappers; mock and unavailable repositories; access flags for READ/UPDATE/CONFIRM and
   ORG.APPROVAL_STANDIN.MANAGE; `NeoFeatureAction.ApprovalLimits`; feature-off (D-195/AL-D13) read-only.
2. **Limits area** (spec P2): bands and steps per kind, the pending proposal card with two-person confirm (proposer
   can't confirm; Owner-alone with tick + reason when no other holder; "confirmed alone" banner until acknowledged),
   decline/withdraw with reason, 14-day expiry shown, History with CSV; stand-ins panel (own + for others with MANAGE),
   SR-H1 words. Strings in `strings_accounts_approval_limits.xml` en/nb/sv/da.
3. Unclear writes (no answer or 5xx): keep the idempotency key, re-read before deciding, never create twice.
4. Size tests for every new screen (device matrix, en/nb/font130, layout checks).
Not in this slice: the steps card on journals/payments (P3) and payment/refund detail (P4).
Tests: DTO decode of every contract example, access/feature gating, proposal state rules, unclear-write replay,
i18n tests, BuildingBlockChecksTest, size tests. Final run after your last change.
Stop and ask when: spec/rig/contract disagree on behaviour; a shared design-system component must change.
Rules: Gradle through the lock (`JAVA_HOME=/Users/jabransiddiqui/Library/Java/JavaVirtualMachines/jbr-21.0.7/Contents/Home GRADLE_USER_HOME=/tmp/gradle-home lockf -k /private/tmp/neoerp-gradle.lock ./gradlew <task> -Pkotlin.daemon.jvmargs=-Xmx8g`);
plain commits, no Co-Authored-By or AI attribution; no push/merge/rebase; never `gradlew --stop`; never touch
`NeoERP/NeoERP-App` (Jabran's checkout) or other worktrees; don't start the app; never read PROJECT-STATE*.md or
.local-secrets. `NeoSelectOption`: named label/value. Reply with commits, files, tests, decisions, open questions.
