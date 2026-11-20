# DOCS-1 proposals (lead applies after Lane 0 merges)

Current answers are in the brief. WORKFLOW.md, AGENTS.md and .codex/CODEX.md were fixed in the DOCS-1 commit.
The "Two Macs, two leads" rule (2026-11-21) was kept as written.

## Repo guides (outside the write scope)

| File:line | Current text | Replacement | Breaks |
|---|---|---|---|
| NeoERP-App/AGENTS.md:27 | "Commit only with approval; push only when explicitly requested." | "Commit only with approval. Builders never push; the lead pushes verified commits (WORKFLOW.md)." | Push |
| NeoERP-BackEnd/.claude/CLAUDE.md:96-97 | "grouped commit plan (pushes only when you explicitly ask)" | "grouped commit plan (the lead pushes verified commits; builders never push)" | Push |
| NeoERP-App/.claude/CLAUDE.md:135 | "grouped commit plan (pushes only when you explicitly ask)" | same as above | Push |
| NeoERP-BackEnd/.codex/CODEX.md:96 | "grouped commit/push plan that runs only after approval" | "grouped commit plan that runs only after approval; builders never push" | Push |
| NeoERP-BackEnd/.codex/CODEX.md:102 | "Final Approval, commit plans, or pushes." | check wording: builders do not push; lead pushes | Push |
| NeoERP-App/.claude/CLAUDE.md:132, NeoERP-BackEnd/.claude/CLAUDE.md:90 | Full stage list copied | one line pointing to WORKFLOW.md | Single answer (copy) |
| NeoERP-BackEnd/.codex/CODEX.md:86-88 | Full stage list copied | one line pointing to WORKFLOW.md | Single answer (copy) |
| NeoERP-App/.codex/CODEX.md:96 | stage list copy | pointer to WORKFLOW.md | Single answer (copy) |
| All six repo guides | no model, review, test or compaction rule | add: "Process rules (push, review, tests, compaction, models) are in ../WORKFLOW.md" | Single answer |

(Line numbers are from grep on 2026-11-21; re-check after Lane 0 merges. No repo guide mentions Fable 5.1, Cowork or to-*.md.)

## Memory (docs/lead-memory/)

Keep = lead habit. Delete = superseded or one-off history. Move = rule binds builders or reviewers, so it goes into a repo.

| Memory file | Action | Reason |
|---|---|---|
| review-channel | delete | Channel and Cowork reviewer retired; WORKFLOW "Reviews and reports". |
| push-after-commit | delete | Now in WORKFLOW (Push). Old ERP-lead-review clause is gone. |
| erp-lead-review-scope | delete | Superseded by fresh Opus review of every build. |
| context-limit-compact | delete | Now in WORKFLOW "Context limit" (50 % lead, 80 % others). |
| usage-stop-thresholds | delete | Merged into WORKFLOW "Context limit". |
| subagent-models | delete | Models in WORKFLOW "Models"; review steps (git fetch, migrations vs origin, --rerun) moved to WORKFLOW Working mode, Review. The new-model-release check is split out as keep (lead habit): put it in orchestrator-mode first. |
| agent-model-label | delete | Now one line in WORKFLOW Models. |
| targeted-test-runs | delete | In WORKFLOW "Test scope". |
| check-test-result-before-push | delete | In WORKFLOW Push and Test scope. |
| gradle-one-at-a-time | delete | lockf, lanes one at a time, no helper agents and `./gradlew --stop` moved to WORKFLOW Test scope. |
| builder-batching | delete | Gradle part in WORKFLOW; "no items to a running builder" is a lead habit: fold into orchestrator-mode. |
| one-repo-per-builder | delete | In WORKFLOW and both repo guides. |
| builder-write-read-scope | delete | In WORKFLOW "Builder scope". |
| no-claude-coauthor | delete | In WORKFLOW Push paragraph; add to repo guides if not there. |
| money-security-guardrails | delete | Moved to WORKFLOW QA guardrails, including unexpected skips failing the run and the owners (accountant and pen test: Jabran; production invariant checks: lead). |
| lessons-register | delete | In WORKFLOW QA section. |
| qa-simulator-sizes | delete | In WORKFLOW QA section. |
| project-state-current | delete | In WORKFLOW "Canonical state". |
| save-usage-limits | delete | Overlaps usage-efficiency-plan and the thresholds; merge what is left there. |
| two-macs-probation | keep | Lead habit for the old Mac's review of lanes; the rule itself is in WORKFLOW "Two Macs, two leads". |
| usage-efficiency-plan | keep | Lead habit on spending limits. |
| orchestrator-mode | keep | Lead habit. |
| lead-subagent-reads | keep | Lead habit (trial L07). |
| lead-runs-demo-tokens | keep | Lead habit, local only. |
| test-steps-format | keep | Lead habit when asking Jabran to test. |
| qa-report-no-artifact | keep | Lead habit. |
| collect-then-fix-per-test | keep | Lead habit during manual tests. |
| edit-in-place-test-in-copy | keep | Lead habit. |
| worktree-cleanup | keep | Lead habit. |
| worktree-isolation-repo | keep | Lead habit when spawning. |
| check-approved-decisions | keep | Lead habit. |
| tester-agent-full-flows | move-to-repo | Binds tester briefs: put in NeoERP-App docs/agents testing guide or WORKFLOW QA section; then delete. |
| app-tests-hot-reload | move-to-repo | Binds builders running jvmTest; put in NeoERP-App AGENTS.md, then delete. |
| draft-migration-local-apply | move-to-repo | Binds backend builders; put in NeoERP-BackEnd AGENTS.md, then delete. |
| builders-isolated-checkout | delete | Marked superseded 2026-10-27; worktree-batch rule kept elsewhere. |
| no-compile-each-change | move-to-repo | Binds App builders (compile once per batch); the WORKFLOW checklist covers it; delete after adding one line. |
| branch-per-phase | move-to-repo | Branch rule binds builders; put in WORKFLOW (Branches) then delete. |
| design-references | move-to-repo | Binds designers; put in NeoERP-App docs/design guide. |
| dev-no-legacy-constraints | move-to-repo | Binds builders and reviewers; put in WORKFLOW or both repo guides. |
| app-languages | move-to-repo | Binds App builders (four languages per string); App AGENTS.md. |
| quick-add-pickers | move-to-repo | Design decision; App spec. |
| product-direction-large | move-to-repo | Product direction; docs/domain or PROJECT-STATE. |
| release-gates | move-to-repo | Where to log deferred items; WORKFLOW or BackEnd ops doc. |
| phase3-finish-plan | delete | Plan history, in PROJECT-STATE. |
| hrp-draft-commits-preaccepted | delete | Stale: HRP rebuild changed; confirm with Jabran. |

## Open questions for Jabran

1. Should numbering, locking, migrations, isolation or statutory lanes also get the second reviewer and the test re-runs? Today the rule says money and security only.
2. Who owns design and architecture decisions now the Cowork reviewer is retired? WORKFLOW.md names "the reviewer (fresh Opus sub-agent)" for now.
3. Is the `hrp-draft-commits-preaccepted` memory stale now that HRP is rebuilt? Proposed: delete.
4. Where should the move-to-repo memory rules land (App and BackEnd AGENTS.md, WORKFLOW.md, docs/design guide)?
5. WORKFLOW.md "Canonical state" still says no document moves or retirements are authorized. Is that still true?
