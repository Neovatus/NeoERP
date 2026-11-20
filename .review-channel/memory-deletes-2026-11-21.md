# Memory deletes — 2026-11-21 (new Mac, commit 906fa94)

For the old Mac's lead: `sync-lead-memory.sh` never deletes, so remove these 8 files from your own memory folder
(`~/.claude/projects/-Users-jabransiddiqui-Offices-Neovatus-NeoERP/memory/`) and their lines in your `MEMORY.md`.
They are already gone from `docs/lead-memory/` (and from the new Mac's memory). Then restore/back up as usual.

| Memory file | Rule now lives in |
|---|---|
| review-channel.md | retired; WORKFLOW.md:289 |
| push-after-commit.md | WORKFLOW.md:60-61 |
| erp-lead-review-scope.md | superseded by WORKFLOW.md:113 |
| context-limit-compact.md | WORKFLOW.md:274, :282 |
| agent-model-label.md | WORKFLOW.md:126 |
| builder-write-read-scope.md | WORKFLOW.md:255-263 |
| qa-simulator-sizes.md | WORKFLOW.md:313 |
| hrp-draft-commits-preaccepted.md | deleted by Jabran 2026-11-21 (stale) |

**Changed, not deleted (take the `docs/lead-memory/` copy, it is newer):** 11 files are now 1–3 line pointers:
no-claude-coauthor, money-security-guardrails, usage-stop-thresholds, check-test-result-before-push, lessons-register,
lead-runs-demo-tokens, tester-agent-full-flows, one-repo-per-builder, gradle-one-at-a-time, two-macs-probation,
project-state-current. New: verify-trust-check. `MEMORY.md` lost the 8 lines above and gained verify-trust-check.

**Kept unchanged** (part of the rule is not in the repo yet): targeted-test-runs, builder-batching, save-usage-limits,
builders-isolated-checkout, subagent-models, phase3-finish-plan.
